/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sdc.js — SDC timing constraints: a Tcl-subset reader (words, {braces}, "quotes", [nested commands], $variables from `set`, backslash
 * line joins, # comments) that NEVER evaluates anything, a model of the common commands, and a writer.
 *
 *   tclParse(text)  → [{ words: [Word], line }]       Word = { t: 'lit', v } | { t: 'cmd', words: [...] } | { t: 'cat', parts: [...] }
 *   readSdc(text)   → { commands: [Cmd], vars, problems }
 *       Cmd = { cmd, opts: { '-name': value | true }, args: [value], line }   value = string | number | { query, patterns, opts } | [values]
 *   writeSdc(commands) → text
 *   sdcSummary(commands) → { clocks, inputDelays, outputDelays, exceptions, loads, other }
 *   checkSdc(commands, { ports?, clocks? }) → problems (unknown clocks, ports that are not in the design, clock periods ≤ 0)
 *
 * Not run: expr, if, foreach, proc, source and any other Tcl; they are kept as-is and named in the problems.
 */
import { prob, num } from './problem.js';

// ---------------------------------------------------------------- Tcl subset
export function tclParse(text) {
  const s = String(text), n = s.length; let i = 0, line = 1; const out = [];
  const ws = () => { while (i < n) { if (s[i] === ' ' || s[i] === '\t' || s[i] === '\r') i++; else if (s[i] === '\\' && s[i + 1] === '\n') { i += 2; line++; } else break; } };
  const braced = () => { let d = 1, j = i + 1; while (j < n && d) { if (s[j] === '\\') { j += 2; continue; } if (s[j] === '{') d++; else if (s[j] === '}') d--; if (s[j] === '\n') line++; j++; } const v = s.slice(i + 1, j - 1); i = j; return { t: 'lit', v, braced: true }; };
  const bracket = () => { // [cmd ...] → nested command; find the matching bracket honouring braces and quotes
    let d = 1, j = i + 1; while (j < n && d) { const c = s[j]; if (c === '\\') { j += 2; continue; } if (c === '[') d++; else if (c === ']') d--; else if (c === '{') { let e = 1; j++; while (j < n && e) { if (s[j] === '{') e++; else if (s[j] === '}') e--; j++; } continue; } j++; }
    const inner = s.slice(i + 1, j - 1); i = j; const cmds = tclParse(inner); return { t: 'cmd', words: cmds[0]?.words || [] };
  };
  const word = () => {
    if (s[i] === '{') return braced();
    const parts = []; let lit = '';
    const quoted = s[i] === '"'; if (quoted) i++;
    while (i < n) {
      const c = s[i];
      if (quoted ? c === '"' : (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === ';')) break;
      if (c === '\\') { const e = s[i + 1]; if (e === '\n') { i += 2; line++; if (!quoted) break; lit += ' '; continue; } lit += e === 'n' ? '\n' : e === 't' ? '\t' : e; i += 2; continue; }
      if (c === '[') { if (lit) parts.push({ t: 'lit', v: lit }); lit = ''; parts.push(bracket()); continue; }
      if (c === '$') { let j = i + 1, name; if (s[j] === '{') { const e = s.indexOf('}', j); name = s.slice(j + 1, e); j = e + 1; } else { while (j < n && /[A-Za-z0-9_:]/.test(s[j])) j++; name = s.slice(i + 1, j); } if (name) { if (lit) parts.push({ t: 'lit', v: lit }); lit = ''; parts.push({ t: 'var', v: name }); i = j; continue; } }
      if (c === '\n') line++;
      lit += c; i++;
    }
    if (quoted) i++;
    if (lit || !parts.length) parts.push({ t: 'lit', v: lit, quoted });
    return parts.length === 1 ? parts[0] : { t: 'cat', parts };
  };
  while (i < n) {
    ws(); if (i >= n) break;
    if (s[i] === '\n' || s[i] === ';') { if (s[i] === '\n') line++; i++; continue; }
    if (s[i] === '#') { while (i < n && s[i] !== '\n') { if (s[i] === '\\' && s[i + 1] === '\n') { i++; line++; } i++; } continue; }
    const words = [], l0 = line;
    while (i < n && s[i] !== '\n' && s[i] !== ';') { words.push(word()); ws(); }
    out.push({ words, line: l0 });
  }
  return out;
}

// ---------------------------------------------------------------- commands
// For each command: which options take a value (the rest are flags); positional arguments keep their order.
const V = (...a) => new Set(a);
export const COMMANDS = {
  create_clock: V('-name', '-period', '-waveform', '-comment'),
  create_generated_clock: V('-name', '-source', '-master_clock', '-divide_by', '-multiply_by', '-duty_cycle', '-edges', '-edge_shift', '-comment'),
  set_input_delay: V('-clock', '-reference_pin'), set_output_delay: V('-clock', '-reference_pin'),
  set_false_path: V('-from', '-to', '-through', '-rise_from', '-fall_from', '-rise_to', '-fall_to', '-comment'),
  set_multicycle_path: V('-from', '-to', '-through', '-rise_from', '-fall_from', '-rise_to', '-fall_to', '-comment'),
  set_max_delay: V('-from', '-to', '-through', '-rise_from', '-fall_from', '-rise_to', '-fall_to', '-comment'),
  set_min_delay: V('-from', '-to', '-through', '-rise_from', '-fall_from', '-rise_to', '-fall_to', '-comment'),
  set_load: V(), set_driving_cell: V('-lib_cell', '-library', '-pin', '-from_pin', '-input_transition_rise', '-input_transition_fall'),
  set_input_transition: V('-clock'), set_clock_uncertainty: V('-from', '-to', '-rise_from', '-fall_from', '-rise_to', '-fall_to'),
  set_clock_latency: V('-clock'), set_clock_transition: V(), set_clock_groups: V('-name', '-group', '-comment'),
  set_propagated_clock: V(), set_max_fanout: V(), set_max_transition: V(), set_max_capacitance: V(), set_min_capacitance: V(),
  set_case_analysis: V(), set_disable_timing: V('-from', '-to'), set_units: V('-time', '-capacitance', '-resistance', '-voltage', '-current', '-power'),
  set_timing_derate: V(), set_wire_load_model: V('-name', '-library', '-min', '-max'), set_wire_load_mode: V(), set_operating_conditions: V('-library', '-analysis_type', '-max', '-min', '-max_library', '-min_library', '-object_list'),
  set_ideal_network: V(), set_drive: V(), set_fanout_load: V(), set_max_area: V(), set_dont_touch: V(), set_sense: V('-type', '-clocks'), group_path: V('-name', '-from', '-to', '-through', '-weight', '-critical_range'),
  current_design: V(), set_hierarchy_separator: V(), set: V(), create_voltage_area: V('-name', '-coordinate'), set_level_shifter_strategy: V('-rule'), set_logic_zero: V(), set_logic_one: V(), set_logic_dc: V(), set_port_fanout_number: V(), set_resistance: V(), set_min_pulse_width: V(), set_data_check: V('-from', '-to', '-rise_from', '-fall_from', '-rise_to', '-fall_to', '-clock'), set_max_time_borrow: V(), set_clock_gating_check: V('-setup', '-hold'), set_clock_sense: V('-clocks'), set_voltage: V('-min', '-object_list'),
};
export const QUERIES = V('get_ports', 'get_pins', 'get_cells', 'get_nets', 'get_clocks', 'get_lib_cells', 'get_lib_pins', 'get_libs', 'all_inputs', 'all_outputs', 'all_clocks', 'all_registers', 'current_design', 'current_instance');
const QUERY_VALUE_OPTS = V('-of_objects', '-filter', '-hierarchical_separator');
const NOT_RUN = V('expr', 'if', 'foreach', 'for', 'while', 'proc', 'source', 'eval', 'puts', 'return', 'switch', 'catch', 'unset', 'array', 'dict', 'list', 'lappend', 'lindex', 'llength', 'incr', 'append', 'string', 'regexp', 'regsub', 'format');

const isNum = (v) => typeof v === 'string' && /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(v.trim());
const splitList = (v) => v.split(/\s+/).filter(Boolean);

/** Read SDC text into command objects. Nothing is evaluated: `set x 5` is remembered so `$x` reads as 5; everything else stays as text. */
export function readSdc(text) {
  const problems = [], vars = {}, commands = [];
  const val = (w, line) => {
    if (w.t === 'lit') return w.v;
    if (w.t === 'var') { if (w.v in vars) return vars[w.v]; problems.push(prob('sdc.var', 'Variable $' + w.v + ' is not set before it is used; kept as text.', { line, severity: 'warning' })); return '$' + w.v; }
    if (w.t === 'cmd') return query(w.words, line);
    if (w.t === 'cat') return w.parts.map((p) => { const x = val(p, line); return typeof x === 'object' ? '[' + qText(x) + ']' : x; }).join('');
  };
  const query = (words, line) => {
    const name = words[0] ? val(words[0], line) : '';
    if (!QUERIES.has(name)) { problems.push(prob('sdc.not-run', '[' + name + ' …] is not run; it is kept as text.', { line, severity: 'warning' })); return { query: name, patterns: words.slice(1).map((w) => String(val(w, line))), opts: {}, raw: true }; }
    const q = { query: name, patterns: [], opts: {} };
    for (let i = 1; i < words.length; i++) { const v = val(words[i], line); if (typeof v === 'string' && v[0] === '-' && !isNum(v)) { if (QUERY_VALUE_OPTS.has(v)) q.opts[v] = val(words[++i], line); else q.opts[v] = true; } else if (typeof v === 'string') q.patterns.push(...splitList(v)); else q.patterns.push(v); }
    return q;
  };
  for (const c of tclParse(text)) {
    if (!c.words.length) continue;
    const name = val(c.words[0], c.line);
    if (name === 'set' && c.words.length === 3) { const v = val(c.words[2], c.line); vars[val(c.words[1], c.line)] = v; commands.push({ cmd: 'set', opts: {}, args: [val(c.words[1], c.line), v], line: c.line }); continue; }
    if (NOT_RUN.has(name)) { problems.push(prob('sdc.not-run', '"' + name + '" is Tcl this reader does not run; the command is kept as text and its result is not known.', { line: c.line, severity: 'warning' })); commands.push({ cmd: name, opts: {}, args: c.words.slice(1).map((w) => (w.t === 'lit' && w.braced ? { braced: w.v } : val(w, c.line))), line: c.line, notRun: true }); continue; }
    const spec = COMMANDS[name];
    if (!spec) problems.push(prob('sdc.unknown', '"' + name + '" is not a command this reader knows; kept as written.', { line: c.line, severity: 'note' }));
    const cmd = { cmd: name, opts: {}, args: [], line: c.line };
    for (let i = 1; i < c.words.length; i++) {
      const v = val(c.words[i], c.line);
      if (typeof v === 'string' && v[0] === '-' && v.length > 1 && !isNum(v)) {
        if (spec && spec.has(v)) { const x = c.words[i + 1] ? val(c.words[++i], c.line) : ''; if (v === '-group' || v === '-through') (cmd.opts[v] ||= []).push(x); else cmd.opts[v] = x; }
        else cmd.opts[v] = true;
      } else cmd.args.push(v);
    }
    // numbers stay strings in the model's args (so they write back the same); summaries convert
    commands.push(cmd);
  }
  return { commands, vars, problems };
}

// ---------------------------------------------------------------- writer
const brace = (s) => (/^[^\s{}\[\]$"\\;]+$/.test(s) ? s : '{' + s + '}');
function qText(q) { if (q.raw) return q.query + (q.patterns.length ? ' ' + q.patterns.join(' ') : ''); const o = Object.entries(q.opts).map(([k, v]) => (v === true ? k : k + ' ' + brace(String(v)))); return [q.query, ...o, ...(q.patterns.length ? [q.patterns.length === 1 ? brace(q.patterns[0]) : '{' + q.patterns.join(' ') + '}'] : [])].join(' '); }
const vText = (v) => (v && typeof v === 'object' ? (v.braced !== undefined ? '{' + v.braced + '}' : '[' + qText(v) + ']') : brace(String(v)));
/** Write command objects as SDC (options first in the order read, then the positional arguments). */
export function writeSdc(commands) {
  return commands.map((c) => {
    const parts = [c.cmd];
    for (const [k, v] of Object.entries(c.opts)) { if (v === true) parts.push(k); else if (Array.isArray(v)) for (const x of v) parts.push(k, vText(x)); else parts.push(k, vText(v)); }
    for (const a of c.args) parts.push(vText(a));
    return parts.join(' ');
  }).join('\n') + '\n';
}

/** Commands without line numbers (what a round trip must keep). */
export const plainSdc = (cmds) => cmds.map(({ line, ...c }) => c);

// ---------------------------------------------------------------- summary + checks
const targets = (c) => c.args.filter((a) => typeof a === 'object' || !isNum(a));
const firstNum = (c) => { const a = c.args.find((x) => typeof x === 'string' && isNum(x)); return a === undefined ? undefined : Number(a); };
const names = (v) => (v && typeof v === 'object' ? v.patterns : typeof v === 'string' ? splitList(v) : []);
/** What the constraint list shows: clocks with period and waveform, delays, exceptions, loads; the rest counted by command. */
export function sdcSummary(commands) {
  const r = { units: {}, clocks: [], generatedClocks: [], inputDelays: [], outputDelays: [], exceptions: [], loads: [], drives: [], uncertainty: [], groups: [], other: {} };
  for (const c of commands) {
    const o = c.opts;
    switch (c.cmd) {
      case 'set_units': for (const [k, v] of Object.entries(o)) r.units[k.slice(1)] = v; break;
      case 'create_clock': { const period = Number(o['-period']); const src = targets(c).flatMap(names); r.clocks.push({ name: o['-name'] || src[0], period, waveform: o['-waveform'] ? splitList(String(o['-waveform'])).map(Number) : [0, period / 2], sources: src, add: !!o['-add'], line: c.line }); break; }
      case 'create_generated_clock': r.generatedClocks.push({ name: o['-name'], source: names(o['-source']), master: o['-master_clock'], divideBy: o['-divide_by'] !== undefined ? Number(o['-divide_by']) : undefined, multiplyBy: o['-multiply_by'] !== undefined ? Number(o['-multiply_by']) : undefined, targets: targets(c).flatMap(names), line: c.line }); break;
      case 'set_input_delay': case 'set_output_delay': (c.cmd === 'set_input_delay' ? r.inputDelays : r.outputDelays).push({ value: firstNum(c), clock: o['-clock'] ? names(o['-clock'])[0] ?? o['-clock'] : undefined, minmax: o['-max'] ? 'max' : o['-min'] ? 'min' : 'both', clockFall: !!o['-clock_fall'], targets: targets(c).flatMap(names), line: c.line }); break;
      case 'set_false_path': case 'set_multicycle_path': case 'set_max_delay': case 'set_min_delay':
        r.exceptions.push({ kind: c.cmd.replace('set_', ''), value: firstNum(c), from: names(o['-from']), to: names(o['-to']), through: (o['-through'] || []).flatMap(names), setup: !!o['-setup'], hold: !!o['-hold'], line: c.line }); break;
      case 'set_load': r.loads.push({ value: firstNum(c), targets: targets(c).flatMap(names), line: c.line }); break;
      case 'set_driving_cell': r.drives.push({ cell: o['-lib_cell'], pin: o['-pin'], targets: targets(c).flatMap(names), line: c.line }); break;
      case 'set_clock_uncertainty': r.uncertainty.push({ value: firstNum(c), setup: !!o['-setup'], hold: !!o['-hold'], targets: targets(c).flatMap(names), line: c.line }); break;
      case 'set_clock_groups': r.groups.push({ kind: o['-asynchronous'] ? 'asynchronous' : o['-logically_exclusive'] ? 'logically_exclusive' : o['-physically_exclusive'] ? 'physically_exclusive' : '', groups: (o['-group'] || []).map(names), line: c.line }); break;
      default: r.other[c.cmd] = (r.other[c.cmd] || 0) + 1;
    }
  }
  return r;
}

const glob = (pat) => new RegExp('^' + pat.replace(/[.+^${}()|\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
/** Problems: periods ≤ 0, delays naming a clock nobody made, ports that match nothing in the design (when `ports` is given). */
export function checkSdc(commands, { ports } = {}) {
  const out = [], s = sdcSummary(commands), clocks = new Set([...s.clocks, ...s.generatedClocks].map((c) => c.name));
  for (const c of s.clocks) if (!(c.period > 0)) out.push(prob('sdc.period', 'Clock ' + c.name + ' has period ' + num(c.period) + '; it must be greater than 0.', { line: c.line }));
  for (const c of s.clocks) if (c.waveform.length !== 2 || c.waveform[1] <= c.waveform[0] || c.waveform[1] - c.waveform[0] >= c.period) if (c.waveform.length === 2) out.push(prob('sdc.waveform', 'Clock ' + c.name + ' has a waveform {' + c.waveform.join(' ') + '} that does not fit its period ' + num(c.period) + '.', { line: c.line, severity: 'warning' }));
  for (const d of [...s.inputDelays, ...s.outputDelays]) if (d.clock && !clocks.has(d.clock)) out.push(prob('sdc.clock', 'A delay names clock ' + d.clock + ', which no create_clock makes.', { line: d.line }));
  if (ports) {
    const P = [...ports];
    for (const c of commands) for (const a of [...c.args, ...Object.values(c.opts).flat()]) if (a && typeof a === 'object' && a.query === 'get_ports')
      for (const pat of a.patterns) if (typeof pat === 'string' && !P.some((p) => glob(pat).test(p))) out.push(prob('sdc.port', 'get_ports ' + pat + ' matches no port of the design.', { line: c.line, severity: 'warning' }));
  }
  return out;
}

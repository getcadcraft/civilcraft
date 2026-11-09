/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Problems-shaped rows for the Chip design add-on's source tools (0.9 HD.1/HD.2). DOM-free, no imports.
 *   row = { id, code, severity: 'error'|'warning'|'note', message, text, msg: {key, vars}, file, line, col, source: {kind, name} }
 * `message` and `text` are the same English words (the panel shows t(msg.key, msg.vars) when the add-on's language file has the key).
 * Ids are stable between runs and languages: chip.hdl:<code>:<file>:<line>:<col>.
 */

/** English templates, keyed by code. {name} placeholders are filled from vars. The same keys live in strings.en.json as chip.src.e.<code>. */
export const TEMPLATES = {
  'lex.char': 'Unexpected character {ch}',
  'lex.string': 'A string is not closed before the end of the line',
  'lex.comment': 'A block comment is not closed',
  'lex.number': 'Bad number {text}',
  'syn.expect': 'Expected {want} but found {got}',
  'syn.unexpected': 'Unexpected {got}',
  'syn.eof': 'The file ends inside {what}',
  'syn.endname': 'The end name {got} does not match {want}',
  'syn.toomany': 'More than {n} errors in this file; the rest are not shown',
  'pp.directive': 'Unknown directive `{name}',
  'pp.endif': '`{name} without a matching `ifdef',
  'pp.unclosed': '`ifdef is not closed with `endif',
  'pp.include': '`include "{name}" is not one of the project files',
  'pp.macro': 'The macro `{name} is not defined',
  'sem.dupdecl': '{name} is declared twice in {scope}',
  'sem.undeclared': '{name} is not declared in {scope}',
  'sem.implicit': '{name} is not declared; it becomes a one-bit wire',
  'sem.portdir': 'Port {name} of {scope} has no direction (input, output or inout)',
  'sem.portnotlisted': '{name} is declared as a port but is not in the port list of {scope}',
  'sem.dupmodule': '{name} is defined twice (also in {other})',
  'sem.noarch': 'Entity {name} has no architecture',
  'sem.archnoentity': 'Architecture {arch} is of {name}, which is not an entity in the project',
  'hier.missing': '{type} is used by {parent} (instance {inst}) but is not defined in the project',
  'hier.unused': '{name} is never used and is not the top',
  'hier.cycle': '{name} instantiates itself through {path}',
  'hier.notop': 'No top module or entity was found',
  'hier.manytops': 'More than one possible top: {names}; {top} is used',
  'hier.portmissing': '{type} has no port {port} (instance {inst} in {parent})',
  'hier.portcount': 'Instance {inst} of {type} connects {got} ports by position; {type} has {want}',
  'net.width': 'Pin {pin} of {inst} is {want} bits wide but is connected to {got} bits',
  'net.behavioural': '{n} behavioural block(s) in {name} are shown as boxes, not gates',
  'net.generate': 'Generate blocks in {name} are not unrolled; {n} instance(s) inside them are not shown',
  'net.positional': 'Instance {inst} of {type} connects by position and {type} is not in the project; pins are numbered',
  'net.unknown': '{name} is not a net or port of {scope}',
  'net.nomodule': 'Module {name} is not in the project',
  'net.dir': 'The direction of pin {pin} of {type} is guessed ({dir}); add a cell library for exact directions',
  'net.floating': 'Pin {pin} of {inst} is not connected',
  'net.multi': 'Net {net} is driven by {n} outputs: {drivers}',
  'net.undriven': 'Net {net} feeds {inst} pin {pin} but nothing drives it',
};

export function fill(tpl, vars = {}) {
  return String(tpl).replace(/\{(\w+)\}/g, (m, k) => (vars[k] === undefined ? m : String(vars[k])));
}

/** One row. where = {file, line, col}. */
export function row(code, severity, vars, where = {}, extra = {}) {
  const v = {};
  for (const [k, x] of Object.entries(vars || {})) v[k] = typeof x === 'number' ? x : String(x).slice(0, 120);
  const text = fill(TEMPLATES[code] || code, v);
  const file = where.file || '', line = where.line || 0, col = where.col || 0;
  return { id: 'chip.hdl:' + code + ':' + file + ':' + line + ':' + col + (extra.idPart ? '#' + extra.idPart : ''), code, severity, message: text, text,
    msg: { key: 'chip.src.e.' + code, vars: v }, file, line, col, source: { kind: 'check', name: 'chip.hdl' }, ...(extra.about ? { about: extra.about } : {}) };
}

/** Sort rows by file, line, col, then severity. Stable and deterministic. */
export function sortRows(rows) {
  const rank = { error: 0, warning: 1, note: 2 };
  return [...rows].sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : 0) || a.line - b.line || a.col - b.col || rank[a.severity] - rank[b.severity] || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

/** Words for a row in the reader's language: t(key, vars) when it knows the key, else the English text. */
export function rowText(r, t) {
  if (typeof t === 'function' && r.msg) {
    const s = t(r.msg.key, r.msg.vars);
    if (typeof s === 'string' && s && s !== r.msg.key) return fill(s, r.msg.vars);
  }
  return r.text;
}

export class Bail extends Error { constructor(r) { super(r.text); this.row = r; } }

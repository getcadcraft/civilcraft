/* SPDX-License-Identifier: Apache-2.0 */
/**
 * The project model the source, hierarchy and netlist panels share (0.9 HD.1/HD.2). DOM-free and node-testable: it reads the project
 * files through ctx.files, keeps edits in memory until saved, re-checks after edits and hands every row to ctx.problems.set('hdl', rows).
 *
 *   sessionFor(ctx) → one Session per ctx object (the panels of one mount share it)
 *   Session: load(), names(), text(name), current, select(name), edit(name, text), save(name), check(), setTop(name|''),
 *            result {modules, hier, problems, byFile}, on(event, fn) — events 'files', 'select', 'checked', 'saved', 'edit'
 *   Files under ctx.outputPrefix (default 'out/': what the tool runs write, e.g. a synthesized netlist) are not project sources: they are
 *   read into result.outputs [{file, modules}] for the Netlist panel only, never into the hierarchy or the Problems list.
 *   gutterMarks(rows, file) → Map(line → {severity, texts[]})   offsetOf(text, line, col)   lineColOf(text, offset)
 */
import { analyzeProject, langOf, parseSource } from './hier.js';
import { rowText } from './problems.js';

export const SOURCE = 'hdl';                                 // the add-on host files it as addon.chip.hdl
const RANK = { error: 0, warning: 1, note: 2 };
const sessions = new WeakMap();

export function sessionFor(ctx) {
  if (!sessions.has(ctx)) sessions.set(ctx, new Session(ctx));
  return sessions.get(ctx);
}

export class Session {
  constructor(ctx) {
    this.ctx = ctx; this.files = new Map(); this.dirty = new Set(); this.current = null; this.top = '';
    this.result = { modules: [], hier: null, problems: [], byFile: {} }; this.listeners = new Map(); this.loaded = false;
  }
  on(ev, fn) { if (!this.listeners.has(ev)) this.listeners.set(ev, new Set()); this.listeners.get(ev).add(fn); return () => this.listeners.get(ev).delete(fn); }
  emit(ev, data) { for (const fn of this.listeners.get(ev) || []) { try { fn(data); } catch (e) { /* a panel's own error must not stop the others */ void e; } } }
  async load() {
    const raw = await this.ctx.files.list();
    const all = (raw || []).map((x) => (typeof x === 'string' ? x : x && x.name)).filter((n) => n && langOf(n)).sort();
    const pre = this.ctx.outputPrefix ?? 'out/';
    const names = all.filter((n) => !pre || !n.startsWith(pre));
    this.outputs = new Map();
    for (const n of all) if (pre && n.startsWith(pre) && langOf(n) === 'verilog') this.outputs.set(n, String((await this.ctx.files.read(n)) ?? ''));
    for (const n of names) if (!this.files.has(n) || !this.dirty.has(n)) this.files.set(n, String((await this.ctx.files.read(n)) ?? ''));
    for (const n of [...this.files.keys()]) if (!names.includes(n) && !this.dirty.has(n)) this.files.delete(n);
    if (!this.current || !this.files.has(this.current)) this.current = this.names()[0] || null;
    this.loaded = true;
    this.emit('files', this.names());
    this.check();
    return this.names();
  }
  names() { return [...this.files.keys()].sort(); }
  text(name = this.current) { return this.files.get(name) ?? ''; }
  select(name) { if (this.files.has(name)) { this.current = name; this.emit('select', name); } }
  edit(name, text) { this.files.set(name, String(text)); this.dirty.add(name); this.emit('edit', name); }
  addFile(name, text = '') { if (!langOf(name)) return false; this.files.set(name, text); this.dirty.add(name); this.current = name; this.emit('files', this.names()); this.emit('select', name); return true; }
  async save(name = this.current) {
    if (!name) return false;
    await this.ctx.files.write(name, this.files.get(name));
    this.dirty.delete(name); this.emit('saved', name); return true;
  }
  setTop(name) { this.top = name || ''; this.check(); }
  check() {
    const files = this.names().map((n) => ({ name: n, text: this.files.get(n) }));
    this.result = analyzeProject(files, { top: this.top || undefined, known: this.ctx.knownCells ? this.ctx.knownCells() : [] });
    this.result.outputs = [...(this.outputs || new Map())].map(([file, text]) => ({ file, modules: parseSource(file, text).modules }));
    if (this.ctx.problems && typeof this.ctx.problems.set === 'function') this.ctx.problems.set(SOURCE, this.result.problems);
    this.emit('checked', this.result);
    return this.result;
  }
  counts(file = null) {
    const c = { error: 0, warning: 0, note: 0 };
    for (const r of this.result.problems) if (!file || r.file === file) c[r.severity]++;
    return c;
  }
  rows(file = null) { return this.result.problems.filter((r) => !file || r.file === file); }
  text_(r) { return rowText(r, this.ctx.t); }
}

export function gutterMarks(rows, file) {
  const m = new Map();
  for (const r of rows) {
    if (r.file !== file || !r.line) continue;
    const cur = m.get(r.line) || { severity: r.severity, texts: [] };
    if (RANK[r.severity] < RANK[cur.severity]) cur.severity = r.severity;
    cur.texts.push(r.text); m.set(r.line, cur);
  }
  return m;
}

export function offsetOf(text, line, col) {
  let off = 0, l = 1;
  while (l < line) { const i = text.indexOf('\n', off); if (i < 0) return text.length; off = i + 1; l++; }
  return Math.min(text.length, off + Math.max(0, (col || 1) - 1));
}
export function lineColOf(text, offset) {
  const before = text.slice(0, offset), line = before.split('\n').length;
  return { line, col: offset - before.lastIndexOf('\n') };
}

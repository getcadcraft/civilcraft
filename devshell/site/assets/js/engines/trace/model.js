/* SPDX-License-Identifier: Apache-2.0 */
/**
 * model.js — requirements and traceability (0.8 XE.7; DOM-free, no imports outside lib/trace/).
 *
 * A Spec holds requirements (a tree: parent/child), typed links between items and the things that satisfy or verify them, and the evidence
 * (test results, documents). Everything is plain data so a host can keep it in the file. Nothing is deleted: `retire` marks an item.
 *
 *   item   { id, kind: 'requirement'|'element'|'test'|'document'|'hazard'|'other', title, text, status, parent?, attrs{}, retired? }
 *   link   { from, to, type: 'satisfies'|'verifies'|'derives'|'refines'|'mitigates'|'references' }
 *            requirement ←satisfies— element · requirement ←verifies— test · child —derives→ parent (a decomposition)
 *   result { test, outcome: 'pass'|'fail'|'blocked'|'not-run', at?, by?, note?, evidence? }   the newest per test counts
 * Every check returns Problems-shape problems (KICKOFF rule 29), source kind `engine`.
 */
export const KINDS = ['requirement', 'element', 'test', 'document', 'hazard', 'other'];
export const LINK_TYPES = ['satisfies', 'verifies', 'derives', 'refines', 'mitigates', 'references'];
export const STATUSES = ['draft', 'proposed', 'approved', 'implemented', 'verified', 'rejected'];
export const OUTCOMES = ['pass', 'fail', 'blocked', 'not-run'];
export const LIMITS = { items: 50000, links: 200000, text: 20000, title: 300, id: 128, attrs: 64, attrValue: 2000 };

const SRC = { kind: 'engine', name: 'trace' };
export function problem(code, severity, text, about = [], extra = {}) { return { id: 'trace:' + code + ':' + about.map((a) => a.id).join(','), code: 'trace.' + code, severity, text, about, source: SRC, ...extra }; }
// control characters, bidi overrides and isolates are removed (the text came from a file)
const BAD = new RegExp('[\\u0000-\\u0008\\u000b\\u000c\\u000e-\\u001f\\u007f\\u202a-\\u202e\\u2066-\\u2069]', 'g');
export const clean = (v, n = LIMITS.text) => String(v ?? '').replace(BAD, '').slice(0, n);

export class Spec {
  constructor(name = '') { this.name = clean(name, LIMITS.title); this.items = new Map(); this.links = []; this.results = []; this.errors = []; }
  /** Add or replace one item. Returns the stored item or null (the reason is pushed to this.errors). */
  add(it) {
    const id = clean(it?.id, LIMITS.id).trim();
    if (!id) { this.errors.push('An item has no id.'); return null; }
    if (this.items.size >= LIMITS.items && !this.items.has(id)) { this.errors.push('Too many items (limit ' + LIMITS.items + ').'); return null; }
    const kind = KINDS.includes(it.kind) ? it.kind : 'requirement';
    const attrs = {}; let n = 0;
    for (const [k, v] of Object.entries(it.attrs && typeof it.attrs === 'object' ? it.attrs : {})) { if (n++ >= LIMITS.attrs) break; if (k !== '__proto__') attrs[clean(k, 80)] = clean(v, LIMITS.attrValue); }
    const out = { id, kind, title: clean(it.title, LIMITS.title), text: clean(it.text), status: STATUSES.includes(it.status) ? it.status : 'draft', parent: it.parent ? clean(it.parent, LIMITS.id) : null, attrs };
    if (it.retired) out.retired = true;
    this.items.set(id, out); return out;
  }
  get(id) { return this.items.get(id) || null; }
  retire(id) { const it = this.items.get(id); if (it) it.retired = true; return !!it; }
  link(from, to, type) {
    if (!LINK_TYPES.includes(type)) { this.errors.push('Unknown link type "' + clean(type, 40) + '".'); return false; }
    from = clean(from, LIMITS.id); to = clean(to, LIMITS.id);
    if (from === to) { this.errors.push('An item cannot link to itself (' + from + ').'); return false; }
    if (this.links.length >= LIMITS.links) { this.errors.push('Too many links.'); return false; }
    if (this.links.some((l) => l.from === from && l.to === to && l.type === type)) return true;
    this.links.push({ from, to, type }); return true;
  }
  /** Record a test outcome. */
  record(r) {
    if (!OUTCOMES.includes(r?.outcome)) { this.errors.push('Unknown outcome.'); return false; }
    this.results.push({ test: clean(r.test, LIMITS.id), outcome: r.outcome, at: Number.isFinite(Date.parse(r.at)) ? new Date(Date.parse(r.at)).toISOString() : null, by: clean(r.by, 120), note: clean(r.note, 1000), evidence: clean(r.evidence, 500) });
    return true;
  }
  live() { return [...this.items.values()].filter((i) => !i.retired); }
  requirements() { return this.live().filter((i) => i.kind === 'requirement'); }
  /** Newest result of a test (by time, else the last recorded). */
  latest(testId) {
    let best = null, bi = -1;
    this.results.forEach((r, i) => { if (r.test !== testId) return; if (!best || (r.at && (!best.at || r.at >= best.at)) || (!r.at && !best.at && i > bi)) { best = r; bi = i; } });
    return best;
  }
  children(id) { return this.live().filter((i) => i.parent === id); }
  /** Items linked to `id` by `type`, looking in the direction given: 'in' (others → id) or 'out'. */
  related(id, type, dir = 'in') {
    return this.links.filter((l) => l.type === type && (dir === 'in' ? l.to === id : l.from === id)).map((l) => this.items.get(dir === 'in' ? l.from : l.to)).filter((i) => i && !i.retired);
  }
  toJSON() { return { format: 'cadcraft-trace', version: 1, name: this.name, items: [...this.items.values()], links: this.links, results: this.results }; }
  static fromJSON(o) {
    const s = new Spec(o?.name);
    if (!o || o.format !== 'cadcraft-trace') { s.errors.push('Not a CadCraft trace file.'); return s; }
    for (const i of Array.isArray(o.items) ? o.items : []) s.add(i);
    for (const l of Array.isArray(o.links) ? o.links : []) s.link(l.from, l.to, l.type);
    for (const r of Array.isArray(o.results) ? o.results : []) s.record(r);
    return s;
  }
}

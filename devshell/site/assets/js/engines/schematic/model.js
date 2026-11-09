/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cc-schematic model (0.8 XE.1): one connectivity model under control schematics, one-lines, P&IDs, harnesses, fire alarm and telecom.
 * Format `cc-schematic` v1. DOM-free, no imports. Everything read from a file is untrusted: `read()` validates and says what it dropped.
 *
 *   symbol  {id, tag, type, sheet, col, part?, mfr?, device?, role?, strip?, number?, pins[{id, name, kind, address?, amps?, optional?}], through?[[pinId,pinId]], attrs?}
 *   wire    {id, from:'sym.pin', to:'sym.pin', cable?, core?, number?, rating?, length?, color?}
 *   label   {id, sheet, name, at:'sym.pin', local?}      names join nets: global by name, or inside one sheet with local
 * Pin kinds: in, out, io, pass, power-in, power-out, pe, passive, nc.  role: coil | contact-no | contact-nc | terminal | source | load.
 */
export const FORMAT = 'cc-schematic', VERSION = 1;
export const PIN_KINDS = ['in', 'out', 'io', 'pass', 'power-in', 'power-out', 'pe', 'passive', 'nc'];
export const ROLES = ['coil', 'contact-no', 'contact-nc', 'terminal', 'source', 'load'];
export const DOMAINS = ['control', 'oneline', 'pid', 'harness', 'firealarm', 'telecom', 'other'];
export const LIMITS = { symbols: 20000, wires: 60000, labels: 20000, pins: 400, text: 120 };

/** One problem in the shared shape (docs/0.8-PROBLEMS-SPEC.md § 1–2). */
export function problem(id, severity, message, extra = {}) {
  return { id: 'schematic:' + id, severity, message, source: { kind: 'engine', engine: 'cc-schematic' }, ...extra };
}
export const ref = (sym, pin) => sym + '.' + pin;
export function splitRef(r) {
  const s = String(r), i = s.lastIndexOf('.');
  return i < 1 ? null : { sym: s.slice(0, i), pin: s.slice(i + 1) };
}

const clean = (s, n = LIMITS.text) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
const finite = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

export class Schematic {
  constructor(name = '', domain = 'control') {
    this.name = name; this.domain = domain;
    this.sheets = []; this.symbols = []; this.wires = []; this.labels = [];
    this._seq = 0; this.problems = [];
  }
  id(prefix) { return prefix + (++this._seq); }
  addSheet(name, id) { const s = { id: id || 's' + (this.sheets.length + 1), name: clean(name) }; this.sheets.push(s); return s; }
  addSymbol(s) {
    const sym = { id: s.id || this.id('S'), tag: clean(s.tag), type: clean(s.type || 'device'), sheet: s.sheet ?? (this.sheets[0] && this.sheets[0].id) ?? 's1',
      col: finite(s.col) ?? 0, pins: (s.pins || []).map((p) => ({ ...p, id: String(p.id), kind: p.kind || 'passive' })) };
    for (const k of ['part', 'mfr', 'device', 'role', 'strip', 'number', 'through', 'attrs', 'unit']) if (s[k] !== undefined) sym[k] = s[k];
    if (this.symbols.some((x) => x.id === sym.id)) { this.problems.push(problem('dup-symbol-id', 'error', 'Two symbols share the id ' + sym.id, { symbol: sym.id })); return null; }
    this.symbols.push(sym); return sym;
  }
  addWire(from, to, extra = {}) {
    const w = { id: extra.id || this.id('W'), from, to, ...extra }; delete w.id2; this.wires.push(w); return w;
  }
  addLabel(name, at, extra = {}) {
    const sym = splitRef(at) && this.symbol(splitRef(at).sym);
    const l = { id: extra.id || this.id('L'), name: clean(name), at, sheet: extra.sheet ?? (sym && sym.sheet), local: !!extra.local };
    this.labels.push(l); return l;
  }
  symbol(id) { return this.symbols.find((s) => s.id === id) || null; }
  pin(r) { const p = splitRef(r), s = p && this.symbol(p.sym); return s ? s.pins.find((x) => x.id === p.pin) || null : null; }
  sheetIndex(id) { const i = this.sheets.findIndex((s) => s.id === id); return i < 0 ? 0 : i + 1; }

  /** Structural problems of the model itself (dangling wire ends, unknown pins). Connectivity rules are in check.js. */
  validate() {
    const out = [...this.problems];
    for (const w of this.wires) for (const end of ['from', 'to']) if (!this.pin(w[end])) out.push(problem('wire-end', 'error', 'Wire ' + w.id + ' ends on ' + w[end] + ', which is not a pin', { wire: w.id, ref: w[end] }));
    for (const l of this.labels) if (!this.pin(l.at)) out.push(problem('label-at', 'error', 'Label ' + l.name + ' is not on a pin (' + l.at + ')', { label: l.id }));
    for (const s of this.symbols) {
      const seen = new Set();
      for (const p of s.pins) { if (seen.has(p.id)) out.push(problem('dup-pin', 'error', s.tag + ' has two pins named ' + p.id, { symbol: s.id })); seen.add(p.id); if (!PIN_KINDS.includes(p.kind)) out.push(problem('pin-kind', 'error', s.tag + ' pin ' + p.id + ' has an unknown kind ' + p.kind, { symbol: s.id })); }
    }
    return out;
  }
  toJSON() {
    return { format: FORMAT, version: VERSION, name: this.name, domain: this.domain, sheets: this.sheets, symbols: this.symbols, wires: this.wires, labels: this.labels };
  }
}

/** Read an untrusted file object (or JSON text) → {schematic, problems}. Drops what does not fit and says so. */
export function read(input) {
  const problems = [];
  let o = input;
  if (typeof input === 'string') { try { o = JSON.parse(input); } catch (e) { return { schematic: null, problems: [problem('read-json', 'error', 'Not JSON: ' + e.message)] }; } }
  if (!o || typeof o !== 'object' || o.format !== FORMAT) return { schematic: null, problems: [problem('read-format', 'error', 'Not a cc-schematic file')] };
  if (!Number.isInteger(o.version) || o.version > VERSION) return { schematic: null, problems: [problem('read-version', 'error', 'This file is version ' + o.version + '; this reader knows ' + VERSION)] };
  const sch = new Schematic(clean(o.name), DOMAINS.includes(o.domain) ? o.domain : 'other');
  for (const s of Array.isArray(o.sheets) ? o.sheets.slice(0, 2000) : []) if (s && typeof s.id === 'string') sch.sheets.push({ id: clean(s.id, 40), name: clean(s.name) });
  const take = (arr, max, what) => { if (!Array.isArray(arr)) return []; if (arr.length > max) problems.push(problem('read-limit', 'warning', what + ': only the first ' + max + ' are read')); return arr.slice(0, max); };
  for (const s of take(o.symbols, LIMITS.symbols, 'symbols')) {
    if (!s || typeof s.id !== 'string' || !Array.isArray(s.pins)) { problems.push(problem('read-symbol', 'warning', 'A symbol without an id or pins was dropped')); continue; }
    const pins = s.pins.slice(0, LIMITS.pins).filter((p) => p && typeof p.id === 'string').map((p) => {
      const q = { id: clean(p.id, 40), name: clean(p.name ?? p.id, 40), kind: PIN_KINDS.includes(p.kind) ? p.kind : 'passive' };
      if (typeof p.address === 'string') q.address = clean(p.address, 40);
      if (finite(p.amps) !== undefined && p.amps >= 0) q.amps = p.amps;
      if (p.optional) q.optional = true;
      return q;
    });
    const sym = sch.addSymbol({ id: clean(s.id, 60), tag: s.tag, type: s.type, sheet: clean(s.sheet, 40), col: s.col, pins,
      part: s.part === undefined ? undefined : clean(s.part), mfr: s.mfr === undefined ? undefined : clean(s.mfr), device: s.device === undefined ? undefined : clean(s.device, 60),
      role: ROLES.includes(s.role) ? s.role : undefined, strip: s.strip === undefined ? undefined : clean(s.strip, 40), number: s.number === undefined ? undefined : clean(s.number, 20),
      through: Array.isArray(s.through) ? s.through.filter((t) => Array.isArray(t) && t.length === 2).map((t) => [String(t[0]), String(t[1])]) : undefined });
    void sym;
  }
  for (const w of take(o.wires, LIMITS.wires, 'wires')) {
    if (!w || typeof w.from !== 'string' || typeof w.to !== 'string') { problems.push(problem('read-wire', 'warning', 'A wire without two ends was dropped')); continue; }
    const x = { id: typeof w.id === 'string' ? clean(w.id, 60) : sch.id('W'), from: w.from, to: w.to };
    for (const k of ['cable', 'core', 'number', 'color']) if (w[k] !== undefined) x[k] = clean(w[k], 40);
    for (const k of ['rating', 'length']) if (finite(w[k]) !== undefined && w[k] >= 0) x[k] = w[k];
    sch.wires.push(x);
  }
  for (const l of take(o.labels, LIMITS.labels, 'labels')) if (l && typeof l.name === 'string' && typeof l.at === 'string') sch.labels.push({ id: typeof l.id === 'string' ? clean(l.id, 60) : sch.id('L'), name: clean(l.name, 60), at: l.at, sheet: typeof l.sheet === 'string' ? clean(l.sheet, 40) : undefined, local: !!l.local });
  return { schematic: sch, problems: [...problems, ...sch.validate()] };
}

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cc-chip VHDL reader (0.9 HD.1): a practical subset of IEEE 1076 (1993/2008) — library/use clauses, entity (generics, ports),
 * architecture (signals, constants, types skipped by shape, components, functions/procedures), concurrent statements (process,
 * component and entity instantiation with generic/port maps, conditional and selected signal assignment, for/if generate, block,
 * assert), sequential statements (if/elsif/else, case/when, for/while loops, wait, signal and variable assignment, next/exit,
 * return, null, report). Our own tokenizer and recursive-descent parser, clean room. DOM-free, imports only problems.js.
 *
 *   parseVhdl(text, {file}) → { units: [entity…], architectures: [...], packages: [names], problems[] }
 *   entity = { name, lang:'vhdl', file, line, col, ports[{name, dir, type, width}], params[{name, type, expr}], archs[arch] }
 *   arch   = { name, of, file, line, col, signals{name → {type, width}}, components[names], instances[{type, name, kind, lib, arch, params, conns[{port, expr}], named, line, col}], processes[{label, sens[], writes[], reads[], line, col}], assigns }
 * Names are lower case (VHDL is not case sensitive); `raw` keeps the spelling as written. Not supported: configurations (skipped with a note),
 * PSL, protected types, VHDL-2019 interfaces; types are recognised by shape only (no type checking).
 */
import { row, sortRows, Bail } from './problems.js';

export const KEYWORDS = new Set(('abs access after alias all and architecture array assert attribute begin block body buffer bus case component configuration constant ' +
  'context disconnect downto else elsif end entity exit file for function generate generic group guarded if impure in inertial inout is label library linkage ' +
  'literal loop map mod nand new next nor not null of on open or others out package port postponed procedure process pure range record register reject rem ' +
  'report return rol ror select severity signal shared sla sll sra srl subtype then to transport type unaffected units until use variable wait when while ' +
  'with xnor xor').split(' '));
const OPS = ['=>', '<=', ':=', '/=', '>=', '**', '<>', '??', '?=', '?/=', '?<=', '?>=', '?<', '?>', '(', ')', ';', ',', '.', ':', '&', "'", '*', '+', '-', '/', '<', '=', '>', '|', '[', ']'];
const MAX_ERRORS = 50;

export function tokenize(text, file = '') {
  const src = String(text ?? ''), out = [], problems = [];
  let i = 0, line = 1, col = 1;
  const adv = (n) => { for (let k = 0; k < n; k++) { if (src[i] === '\n') { line++; col = 1; } else col++; i++; } };
  const push = (t, v, l, c, extra) => out.push({ t, v, line: l, col: c, ...extra });
  const lastSignificant = () => out[out.length - 1];
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) { adv(1); continue; }
    const l = line, c = col;
    if (ch === '-' && src[i + 1] === '-') { while (i < src.length && src[i] !== '\n') adv(1); continue; }
    if (ch === '/' && src[i + 1] === '*') { const end = src.indexOf('*/', i + 2); if (end < 0) { problems.push(row('lex.comment', 'error', {}, { file, line: l, col: c })); adv(src.length - i); break; } adv(end + 2 - i); continue; }
    const bs = /^(\d*)([bBoOxXdD]|[uU][bBoOxX]|[sS][bBoOxX])"([^"\n]*)"/.exec(src.slice(i, i + 400));
    if (bs && (bs[1] || /[A-Za-z]/.test(ch))) { adv(bs[0].length); push('bits', bs[0], l, c, { base: bs[2].toLowerCase(), digits: bs[3] }); continue; }
    if (/[A-Za-z]/.test(ch)) {
      let j = i + 1; while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
      const raw = src.slice(i, j), v = raw.toLowerCase(); adv(j - i); push(KEYWORDS.has(v) ? 'kw' : 'id', v, l, c, { raw }); continue;
    }
    if (ch === '\\') { const end = src.indexOf('\\', i + 1); const j = end < 0 ? src.length : end + 1; const raw = src.slice(i, j); adv(j - i); push('id', raw, l, c, { raw, escaped: true }); continue; }
    if (/[0-9]/.test(ch)) {
      const m = /^\d[\d_]*#[0-9a-fA-F_.]+#([eE][+-]?\d+)?|^\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d[\d_]*)?/.exec(src.slice(i, i + 400));
      adv(m[0].length);
      let value = null;
      const b = /^(\d+)#([0-9a-fA-F_]+)#$/.exec(m[0].replace(/_/g, ''));
      if (b) value = parseInt(b[2], Number(b[1])); else value = Number(m[0].replace(/_/g, ''));
      push('num', m[0], l, c, { value: Number.isFinite(value) ? value : null }); continue;
    }
    if (ch === '"') {
      let j = i + 1, s = '';
      for (;;) { if (j >= src.length || src[j] === '\n') break; if (src[j] === '"') { if (src[j + 1] === '"') { s += '"'; j += 2; continue; } break; } s += src[j++]; }
      if (src[j] !== '"') { problems.push(row('lex.string', 'error', {}, { file, line: l, col: c })); adv(j - i); continue; }
      adv(j + 1 - i); push('str', s, l, c); continue;
    }
    if (ch === "'") {
      const prev = lastSignificant();
      const attrTick = prev && (prev.t === 'id' || (prev.t === 'op' && (prev.v === ')' || prev.v === ']')) || (prev.t === 'kw' && (prev.v === 'all' || prev.v === 'range')));
      if (src[i + 2] === "'" && !(attrTick && src[i + 1] === '(')) { push('char', src[i + 1], l, c); adv(3); continue; }
    }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (op) { adv(op.length); push('op', op, l, c); continue; }
    problems.push(row('lex.char', 'error', { ch: JSON.stringify(ch) }, { file, line: l, col: c })); adv(1);
  }
  out.push({ t: 'eof', v: '', line, col });
  return { tokens: out, problems };
}

class Parser {
  constructor(tokens, file, problems) { this.toks = tokens; this.i = 0; this.file = file; this.problems = problems; this.errors = 0; }
  peek(k = 0) { return this.toks[Math.min(this.i + k, this.toks.length - 1)]; }
  next() { return this.toks[Math.min(this.i++, this.toks.length - 1)]; }
  is(v, k = 0) { const t = this.peek(k); return (t.t === 'op' || t.t === 'kw') && t.v === v; }
  accept(v) { return this.is(v) ? this.next() : null; }
  where(t = this.peek()) { return { file: this.file, line: t.line, col: t.col }; }
  desc(t) { return t.t === 'eof' ? 'the end of the file' : t.t === 'str' ? 'a string' : JSON.stringify(t.raw || t.v); }
  fail(want, t = this.peek()) {
    if (t.t === 'eof') throw new Bail(row('syn.eof', 'error', { what: want }, this.where(t)));
    throw new Bail(row('syn.expect', 'error', { want, got: this.desc(t) }, this.where(t)));
  }
  expect(v, want = JSON.stringify(v)) {
    if (this.is(v)) return this.next();
    const prev = this.toks[this.i - 1];
    if (v === ';' && prev && this.peek().t !== 'eof' && prev.line !== this.peek().line)
      throw new Bail(row('syn.expect', 'error', { want, got: this.desc(this.peek()) }, { file: this.file, line: prev.line, col: prev.col + String(prev.raw || prev.v).length }));
    return this.fail(want);
  }
  ident(want = 'a name') { const t = this.peek(); if (t.t === 'id') return this.next(); return this.fail(want); }
  report(r) { if (this.errors >= MAX_ERRORS) return; this.errors++; this.problems.push(r); if (this.errors === MAX_ERRORS) this.problems.push(row('syn.toomany', 'error', { n: MAX_ERRORS }, { file: this.file, line: r.line, col: r.col })); }
  skipTo(...stops) { while (this.peek().t !== 'eof' && !stops.some((s) => this.is(s))) this.next(); }
  skipParens() { let d = 0; do { const t = this.next(); if (t.t === 'eof') this.fail('")"'); if (t.v === '(' && t.t === 'op') d++; else if (t.v === ')' && t.t === 'op') d--; } while (d > 0); }
  endName(want, ...kws) {   // end [kw…] [name] ;
    for (const k of kws) if (this.accept(k)) break;
    if (this.peek().t === 'id' || (this.peek().t === 'str')) { const n = this.next(); if (want && n.v !== want) this.report(row('syn.endname', 'error', { got: n.raw || n.v, want }, this.where(n))); }
    this.expect(';');
  }

  /* -------- expressions */
  expr() {
    let a = this.relation();
    while (['and', 'or', 'xor', 'nand', 'nor', 'xnor'].some((k) => this.is(k))) { const op = this.next().v; a = { k: 'bin', op, a, b: this.relation() }; }
    return a;
  }
  relation() {
    let a = this.shift();
    const t = this.peek();
    if (t.t === 'op' && ['=', '/=', '<', '<=', '>', '>=', '?=', '?/=', '?<', '?<=', '?>', '?>='].includes(t.v)) { this.next(); a = { k: 'bin', op: t.v, a, b: this.shift() }; }
    return a;
  }
  shift() { let a = this.adding(); if (['sll', 'srl', 'sla', 'sra', 'rol', 'ror'].some((k) => this.is(k))) { const op = this.next().v; a = { k: 'bin', op, a, b: this.adding() }; } return a; }
  adding() {
    let a;
    if (this.is('+') || this.is('-')) { const op = this.next().v; a = { k: 'un', op, a: this.term() }; } else a = this.term();
    while (this.is('+') || this.is('-') || this.is('&')) { const op = this.next().v; a = { k: 'bin', op, a, b: this.term() }; }
    return a;
  }
  term() { let a = this.factor(); while (this.is('*') || this.is('/') || this.is('mod') || this.is('rem')) { const op = this.next().v; a = { k: 'bin', op, a, b: this.factor() }; } return a; }
  factor() {
    if (this.is('abs') || this.is('not') || this.is('??')) { const op = this.next().v; return { k: 'un', op, a: this.primary() }; }
    if (['and', 'or', 'xor', 'nand', 'nor', 'xnor'].some((k) => this.is(k))) { const op = this.next().v; return { k: 'un', op, a: this.primary() }; }   // 2008 reduction
    let a = this.primary();
    if (this.accept('**')) a = { k: 'bin', op: '**', a, b: this.primary() };
    return a;
  }
  primary() {
    const t = this.peek();
    if (t.t === 'num') { this.next(); if (this.peek().t === 'id' && /^(fs|ps|ns|us|ms|sec|min|hr)$/.test(this.peek().v)) this.next(); return { k: 'num', value: t.value, text: t.v }; }
    if (t.t === 'char') { this.next(); return { k: 'char', v: t.v }; }
    if (t.t === 'str' || t.t === 'bits') { this.next(); return { k: 'str', v: t.v }; }
    if (this.accept('null')) return { k: 'null' };
    if (this.accept('new')) return this.primary();
    if (this.is('(')) return this.aggregate();
    if (t.t === 'id') return this.name();
    return this.fail('an expression');
  }
  aggregate() {
    this.expect('(');
    const parts = [];
    do {
      if (this.accept('others')) { this.expect('=>'); parts.push({ choice: 'others', expr: this.expr() }); continue; }
      let e = this.expr();
      if (this.is('to') || this.is('downto')) { this.next(); this.expr(); }
      while (this.accept('|')) this.expr();
      if (this.accept('=>')) { const v = this.expr(); parts.push({ choice: e, expr: v }); } else parts.push({ expr: e });
    } while (this.accept(','));
    this.expect(')', '")"');
    return parts.length === 1 && !parts[0].choice ? parts[0].expr : { k: 'agg', parts };
  }
  name() {
    const t = this.ident();
    let e = { k: 'id', name: t.v, raw: t.raw, line: t.line, col: t.col };
    for (;;) {
      if (this.is('.')) { this.next(); const n = this.peek(); if (n.t === 'id' || this.is('all') || n.t === 'str' || n.t === 'char') { this.next(); e = { k: 'id', name: e.name + '.' + n.v, raw: e.raw + '.' + (n.raw || n.v), sel: true, line: t.line, col: t.col }; continue; } this.fail('a name after "."'); }
      if (this.is("'")) {
        this.next();
        if (this.is('(')) { const a = this.aggregate(); e = { k: 'qual', type: e, a }; continue; }
        const at = this.peek(); if (at.t === 'id' || at.t === 'kw') this.next(); else this.fail('an attribute name');
        e = { k: 'attr', base: e, attr: at.v, line: at.line, col: at.col };
        if (this.is('(') && ['image', 'value', 'pos', 'val', 'succ', 'pred', 'leftof', 'rightof', 'high', 'low', 'left', 'right', 'length', 'range', 'reverse_range'].includes(at.v)) { this.next(); this.expr(); this.expect(')'); }
        continue;
      }
      if (this.is('(')) {
        this.next(); const args = [];
        do {
          if (this.accept('open')) { args.push(null); continue; }
          let a = this.expr();
          if (this.is('to') || this.is('downto')) { const dir = this.next().v; a = { k: 'range', from: a, to: this.expr(), dir }; }
          if (this.accept('=>')) a = { k: 'assoc', formal: a, actual: this.is('open') ? (this.next(), null) : this.expr() };
          args.push(a);
        } while (this.accept(','));
        this.expect(')', '")"');
        e = { k: 'call', base: e, args, line: t.line, col: t.col };
        continue;
      }
      return e;
    }
  }
  choices() { do { if (this.accept('others')) continue; this.expr(); if (this.is('to') || this.is('downto')) { this.next(); this.expr(); } } while (this.accept('|')); }
  waveform() {
    if (this.accept('unaffected')) return [];
    const out = [];
    do { if (this.accept('null')) { out.push({ k: 'null' }); } else out.push(this.expr()); if (this.accept('after')) this.expr(); } while (this.accept(','));
    return out;
  }
  subtype() {   // returns {type, width}
    if (this.peek().t === 'id' && this.peek(1).t === 'id' && !this.is('.', 1)) this.next();         // resolution function
    const n = this.name();
    let type = n.k === 'call' ? n.base.name : n.name, width = null;
    if (n.k === 'call' && n.args.length === 1 && n.args[0] && n.args[0].k === 'range') width = { from: n.args[0].from, to: n.args[0].to, dir: n.args[0].dir };
    if (this.accept('range')) { const a = this.expr(); if (this.is('to') || this.is('downto')) { this.next(); this.expr(); } void a; }
    if (/(^|\.)(std_logic|std_ulogic|bit|boolean)$/.test(type)) width = { scalar: true };
    return { type, width };
  }
  interfaceList(kind) {
    const out = [];
    this.expect('(');
    do {
      if (this.is(')')) break;
      if (this.accept('signal') || this.accept('constant') || this.accept('variable') || this.accept('file')) { /* class */ }
      if (this.accept('type')) { const n = this.ident(); out.push({ name: n.v, raw: n.raw, dir: null, type: 'type', line: n.line, col: n.col }); continue; }
      const names = [this.ident(kind === 'port' ? 'a port name' : 'a generic name')];
      while (this.accept(',')) names.push(this.ident());
      this.expect(':', '":" and a type');
      let dir = null;
      for (const d of ['in', 'out', 'inout', 'buffer', 'linkage']) if (this.accept(d)) { dir = d; break; }
      const st = this.subtype();
      if (this.accept('bus')) { /* */ }
      const init = this.accept(':=') ? this.expr() : null;
      for (const n of names) out.push({ name: n.v, raw: n.raw, dir: kind === 'port' ? dir || 'in' : null, type: st.type, width: st.width, expr: init, line: n.line, col: n.col });
    } while (this.accept(';'));
    this.expect(')', '")" to close the ' + kind + ' list');
    return out;
  }

  /* -------- design units */
  file_() {
    const entities = [], archs = [], packages = [];
    while (this.peek().t !== 'eof') {
      try {
        if (this.accept('library')) { do this.ident(); while (this.accept(',')); this.expect(';'); }
        else if (this.accept('use')) { do this.name(); while (this.accept(',')); this.expect(';'); }
        else if (this.is('context') && this.peek(2).t === 'kw' && this.peek(2).v === 'is') { this.skipTo('end'); this.next(); this.endName(null, 'context'); }
        else if (this.accept('context')) { do this.name(); while (this.accept(',')); this.expect(';'); }
        else if (this.is('entity')) entities.push(this.entity());
        else if (this.is('architecture')) archs.push(this.architecture());
        else if (this.is('package')) packages.push(this.packageUnit());
        else if (this.is('configuration')) { const t = this.next(); this.problems.push(row('syn.unexpected', 'note', { got: 'configuration (skipped)' }, this.where(t))); this.skipConfiguration(); }
        else { const t = this.next(); this.report(row('syn.unexpected', 'error', { got: this.desc(t) + ' outside a design unit' }, this.where(t))); this.skipTo('entity', 'architecture', 'package', 'library', 'use', 'configuration'); }
      } catch (e) { if (!(e instanceof Bail)) throw e; this.report(e.row); this.skipTo('entity', 'architecture', 'package', 'library', 'use', 'configuration'); }
    }
    return { entities, archs, packages };
  }
  skipConfiguration() { let depth = 0; for (;;) { const t = this.next(); if (t.t === 'eof') return; if (t.v === 'for' && t.t === 'kw') depth++; if (t.v === 'end' && t.t === 'kw') { if (this.is('for')) { this.next(); this.expect(';'); depth--; continue; } this.skipTo(';'); this.next(); return; } } }
  entity() {
    this.next(); const n = this.ident('an entity name'); this.expect('is', '"is"');
    const e = { name: n.v, raw: n.raw, lang: 'vhdl', file: this.file, line: n.line, col: n.col, ports: [], params: [], archs: [] };
    try {
      if (this.accept('generic')) { e.params = this.interfaceList('generic'); this.expect(';'); }
      if (this.accept('port')) { e.ports = this.interfaceList('port'); this.expect(';', '";" after the port list'); }
      const scratch = this.newArch('', n.v);
      this.declarations(scratch, ['begin', 'end']);
      if (this.accept('begin')) this.concurrent(scratch, ['end']);
      this.expect('end'); this.endName(n.v, 'entity');
    } catch (err) { if (!(err instanceof Bail)) throw err; this.report(err.row); this.recoverTo('entity', n.v); }
    return e;
  }
  recoverTo(kw, name) {   // after an error inside a unit: skip to "end [kw] [name];" at the unit's level, as well as we can tell
    for (;;) {
      const t = this.peek();
      if (t.t === 'eof') return;
      if (this.is('entity') || this.is('architecture') || this.is('package') || this.is('library') || this.is('use') && this.peek(-1) && this.toks[this.i - 1].v === ';') {
        if (this.is('use')) { this.next(); continue; }
        return;
      }
      if (this.is('end') && ((this.peek(1).t === 'kw' && this.peek(1).v === kw) || (this.peek(1).t === 'id' && this.peek(1).v === name))) { this.next(); this.skipTo(';'); this.accept(';'); return; }
      this.next();
    }
  }
  newArch(name, of) { return { name, of, file: this.file, signals: {}, constants: [], components: [], instances: [], processes: [], assigns: [], generates: 0 }; }
  architecture() {
    this.next(); const n = this.ident('an architecture name'); this.expect('of'); const of = this.ident('an entity name'); this.expect('is');
    const a = this.newArch(n.v, of.v); a.line = n.line; a.col = n.col; a.rawOf = of.raw;
    try {
      this.declarations(a, ['begin']);
      this.expect('begin', '"begin"');
      this.concurrent(a, ['end']);
      this.expect('end'); this.endName(n.v, 'architecture');
    } catch (err) { if (!(err instanceof Bail)) throw err; this.report(err.row); this.recoverTo('architecture', n.v); }
    return a;
  }
  packageUnit() {
    this.next(); const body = !!this.accept('body'); const n = this.ident('a package name'); this.expect('is');
    const scratch = this.newArch('', n.v);
    try { this.declarations(scratch, ['end']); this.expect('end'); if (body) this.accept('package'), this.endName(n.v, 'body'); else this.endName(n.v, 'package'); }
    catch (err) { if (!(err instanceof Bail)) throw err; this.report(err.row); this.recoverTo('package', n.v); }
    return { name: n.v, body, components: scratch.components };
  }
  declarations(a, stops) {
    for (;;) {
      const t = this.peek();
      if (t.t === 'eof') this.fail(stops.map((s) => '"' + s + '"').join(' or '));
      if (stops.some((s) => this.is(s))) return;
      if (this.accept('signal') || (this.is('shared') && this.next() && this.accept('variable')) || this.accept('variable')) {
        const names = [this.ident('a signal name')]; while (this.accept(',')) names.push(this.ident());
        this.expect(':'); const st = this.subtype(); if (this.accept('register') || this.accept('bus')) { /* */ }
        if (this.accept(':=')) this.expr();
        for (const n of names) a.signals[n.v] = { type: st.type, width: st.width, line: n.line, col: n.col };
        this.expect(';', '";" after a declaration'); continue;
      }
      if (this.accept('constant')) { const names = [this.ident()]; while (this.accept(',')) names.push(this.ident()); this.expect(':'); this.subtype(); const e = this.accept(':=') ? this.expr() : null; for (const n of names) a.constants.push({ name: n.v, expr: e }); this.expect(';'); continue; }
      if (this.accept('type')) {
        this.ident('a type name');
        if (this.accept(';')) continue;
        this.expect('is');
        if (this.accept('record')) { this.skipTo('end'); this.next(); this.expect('record'); if (this.peek().t === 'id') this.next(); this.expect(';'); continue; }
        if (this.is('protected')) { this.skipTo('end'); this.next(); this.skipTo(';'); this.next(); continue; }
        this.skipStatement(); continue;
      }
      if (this.accept('subtype') || this.accept('alias') || this.accept('attribute') || this.accept('file') || this.accept('disconnect') || this.accept('group')) { this.skipStatement(); continue; }
      if (this.accept('use')) { do this.name(); while (this.accept(',')); this.expect(';'); continue; }
      if (this.accept('component')) {
        const n = this.ident('a component name'); this.accept('is');
        if (this.accept('generic')) { this.interfaceList('generic'); this.expect(';'); }
        if (this.accept('port')) { this.interfaceList('port'); this.expect(';'); }
        this.expect('end', '"end component"'); this.expect('component'); this.endName(n.v);
        a.components.push(n.v); continue;
      }
      if (this.is('function') || this.is('procedure') || this.is('pure') || this.is('impure')) { this.subprogram(a); continue; }
      if (this.is('for')) { this.skipStatement(); continue; }   // configuration specification
      this.fail('a declaration or ' + stops.map((s) => '"' + s + '"').join(' or '));
    }
  }
  skipStatement() { let d = 0; for (;;) { const t = this.next(); if (t.t === 'eof') this.fail('";"'); if (t.t === 'op' && t.v === '(') d++; if (t.t === 'op' && t.v === ')') d--; if (t.t === 'op' && t.v === ';' && d <= 0) return; } }
  subprogram(a) {
    this.accept('pure'); this.accept('impure');
    const kind = this.next().v;
    const n = this.peek().t === 'str' ? this.next() : this.ident('a ' + kind + ' name');
    if (this.is('(')) this.interfaceList('parameter');
    if (kind === 'function') { this.expect('return'); this.name(); }
    if (this.accept(';')) return;
    this.expect('is');
    const scratch = this.newArch('', '');
    this.declarations(scratch, ['begin']); this.expect('begin');
    this.sequence(scratch, null, ['end']);
    this.expect('end'); this.endName(n.v, kind);
    void a;
  }

  /* -------- concurrent statements */
  concurrent(a, stops) {
    let recovering = false;
    for (;;) {
      const t = this.peek();
      if (t.t === 'eof') this.fail(stops.map((s) => '"' + s + '"').join(' or '));
      if (stops.some((s) => this.is(s))) return;
      try { this.concurrentOne(a); recovering = false; }
      catch (e) {
        if (!(e instanceof Bail)) throw e;
        if (!recovering) this.report(e.row);
        recovering = true;
        this.skipTo(';', 'end', 'architecture', 'entity'); if (this.is(';')) this.next();
        if (this.is('end') && (this.peek(1).t === 'kw' && ['process', 'if', 'case', 'loop', 'generate', 'block', 'for'].includes(this.peek(1).v))) { this.next(); this.skipTo(';'); this.accept(';'); }
        if (this.is('architecture') || this.is('entity')) throw e;
      }
    }
  }
  concurrentOne(a) {
    let label = null, t0 = this.peek();
    if (this.peek().t === 'id' && this.is(':', 1)) { label = this.next(); this.next(); }
    this.accept('postponed');
    if (this.is('process')) return this.process(a, label, t0);
    if (this.is('block')) {
      this.next(); if (this.is('(')) this.skipParens(); this.accept('is');
      this.declarations(a, ['begin']); this.expect('begin'); this.concurrent(a, ['end']); this.expect('end'); this.expect('block'); this.endName(label && label.v); return;
    }
    if (this.is('for') && label) {
      this.next(); this.ident(); this.expect('in'); this.rangeSpec(); this.expect('generate'); a.generates++;
      this.generateBody(a); this.expect('end'); this.expect('generate'); this.endName(label.v); return;
    }
    if (this.is('if') && label) {
      this.next(); this.condGen(); this.expect('generate'); a.generates++;
      this.generateBody(a, ['elsif', 'else', 'end']);
      while (this.is('elsif') || this.is('else')) { const k = this.next().v; if (this.peek().t === 'id' && this.is(':', 1)) { this.next(); this.next(); } if (k === 'elsif') this.condGen(); this.expect('generate'); this.generateBody(a, ['elsif', 'else', 'end']); }
      this.expect('end'); this.expect('generate'); this.endName(label.v); return;
    }
    if (this.is('assert')) { this.next(); this.expr(); if (this.accept('report')) this.expr(); if (this.accept('severity')) this.expr(); this.expect(';'); return; }
    if (this.is('with')) {
      const w = this.next(); this.expr(); this.expect('select'); this.accept('?');
      const target = this.name(); this.expect('<='); this.accept('guarded');
      const rhs = [];
      do { rhs.push(...this.waveform()); this.expect('when'); this.choices(); } while (this.accept(','));
      this.expect(';'); a.assigns.push({ target, rhs, line: w.line, col: w.col }); return;
    }
    if (this.is('component') || this.is('entity') || this.is('configuration')) return this.instance(a, label);
    if (this.peek().t === 'id' && label && (this.is('generic', 1) || this.is('port', 1) || this.is(';', 1) || (this.is('.', 1) && this.findMapAhead()))) return this.instance(a, label);
    // concurrent signal assignment or procedure call
    const target = this.is('(') ? this.aggregate() : this.name();
    if (this.accept('<=')) {
      this.accept('guarded'); if (this.accept('transport') || (this.is('reject') && (this.next(), this.expr(), this.expect('inertial')))) { /* */ } else this.accept('inertial');
      const rhs = [...this.waveform()];
      while (this.accept('when')) { rhs.push(this.expr()); if (this.accept('else')) rhs.push(...this.waveform()); }
      this.expect(';', '";" after a signal assignment');
      a.assigns.push({ target, rhs, line: t0.line, col: t0.col }); return;
    }
    if (this.accept(';')) return;   // procedure call
    this.fail('"<=" in a signal assignment');
  }
  findMapAhead() { for (let k = 1; k < 12; k++) { const t = this.peek(k); if (t.t === 'kw' && (t.v === 'port' || t.v === 'generic')) return true; if (t.t === 'op' && t.v === ';') return false; } return false; }
  condGen() { this.expr(); }
  rangeSpec() { const a = this.expr(); if (this.is('to') || this.is('downto')) { this.next(); this.expr(); } void a; }
  generateBody(a, stops = ['end']) {
    const before = this.i;
    // optional declarative part: "decls begin"
    let hasBegin = false;
    for (let k = 0; k < 4000; k++) { const t = this.peek(k); if (t.t === 'eof') break; if (t.t === 'kw' && t.v === 'begin') { hasBegin = true; break; } if (t.t === 'kw' && ['process', 'end', 'generate', 'port', 'block'].includes(t.v)) break; if (t.t === 'op' && t.v === '<=') break; }
    void before;
    if (hasBegin) { this.declarations(a, ['begin']); this.expect('begin'); }
    this.concurrent(a, stops);
    if (hasBegin && this.is('end') && this.is(';', 1)) { this.next(); this.next(); }   // 2008 "end;" of the body
  }
  instance(a, label) {
    const t = this.peek();
    let kind = 'component', lib = null, arch = null, type;
    if (this.accept('component')) type = this.ident('a component name').v;
    else if (this.accept('entity')) {
      kind = 'entity'; const n = this.name();
      let base = n; if (n.k === 'call') { base = n.base; arch = n.args[0] && n.args[0].k === 'id' ? n.args[0].name : null; }
      const parts = base.name.split('.'); type = parts.pop(); lib = parts.join('.') || null;
    } else if (this.accept('configuration')) { kind = 'configuration'; type = this.name().name.split('.').pop(); }
    else { const n = this.name(); type = n.name.split('.').pop(); }
    if (!label) this.fail('a label before an instance', t);
    const inst = { type, name: label.v, rawName: label.raw, kind, lib, arch, params: [], conns: [], named: false, line: label.line, col: label.col, typeLine: t.line, typeCol: t.col };
    if (this.accept('generic')) { this.expect('map'); inst.params = this.assocList(); }
    if (this.accept('port')) { this.expect('map', '"map"'); inst.conns = this.assocList(); inst.named = inst.conns.some((c) => c.port); }
    this.expect(';', '";" after an instance');
    a.instances.push(inst);
  }
  assocList() {
    this.expect('(');
    const out = [];
    do {
      const e = this.is('open') ? (this.next(), null) : this.expr();
      if (this.accept('=>')) {
        const formal = e && (e.k === 'id' ? e.name : e.k === 'call' && e.base.k === 'id' ? e.base.name : null);
        const actual = this.accept('open') ? null : this.expr();
        out.push({ port: formal, formal: e, expr: actual, line: e && e.line, col: e && e.col });
      } else out.push({ port: null, expr: e });
    } while (this.accept(','));
    this.expect(')', '")" to close the map');
    return out;
  }
  process(a, label, t0) {
    const t = this.next();
    const p = { label: label ? label.v : '', sens: [], writes: new Set(), reads: new Set(), line: (label || t).line, col: (label || t).col };
    if (this.accept('(')) {
      if (this.accept('all')) p.sens.push('all');
      else do { const n = this.name(); p.sens.push(n.k === 'id' ? n.name : n.base ? n.base.name : ''); } while (this.accept(','));
      this.expect(')', '")" to close the sensitivity list');
    }
    this.accept('is');
    this.declarations(a, ['begin']);
    this.expect('begin', '"begin"');
    this.sequence(a, p, ['end']);
    this.expect('end'); this.accept('postponed'); this.expect('process', '"end process"');
    this.endName(label && label.v);
    a.processes.push({ ...p, writes: [...p.writes].sort(), reads: [...p.reads].sort() });
    void t0;
  }

  /* -------- sequential statements */
  sequence(a, p, stops) {
    for (;;) {
      if (this.peek().t === 'eof') this.fail(stops.map((s) => '"' + s + '"').join(' or '));
      if (stops.some((s) => this.is(s))) return;
      this.seqOne(a, p);
    }
  }
  seqOne(a, p) {
    let label = null;
    if (this.peek().t === 'id' && this.is(':', 1)) { label = this.next(); this.next(); }
    const t = this.peek();
    if (this.accept('if')) {
      this.read(p, this.expr()); this.expect('then', '"then"'); this.sequence(a, p, ['elsif', 'else', 'end']);
      while (this.accept('elsif')) { this.read(p, this.expr()); this.expect('then', '"then"'); this.sequence(a, p, ['elsif', 'else', 'end']); }
      if (this.accept('else')) this.sequence(a, p, ['end']);
      this.expect('end'); this.expect('if', '"end if"'); this.endName(label && label.v); return;
    }
    if (this.accept('case')) {
      this.accept('?'); this.read(p, this.expr()); this.expect('is', '"is"');
      while (this.accept('when')) { this.choices(); this.expect('=>', '"=>"'); this.sequence(a, p, ['when', 'end']); }
      this.expect('end', '"when" or "end case"'); this.expect('case', '"end case"'); this.accept('?'); this.endName(label && label.v); return;
    }
    if (this.is('for') || this.is('while') || this.is('loop')) {
      if (this.accept('for')) { this.ident(); this.expect('in'); this.rangeSpec(); } else if (this.accept('while')) this.read(p, this.expr());
      this.expect('loop', '"loop"'); this.sequence(a, p, ['end']); this.expect('end'); this.expect('loop', '"end loop"'); this.endName(label && label.v); return;
    }
    if (this.accept('wait')) {
      if (this.accept('on')) { do this.name(); while (this.accept(',')); }
      if (this.accept('until')) this.read(p, this.expr());
      if (this.accept('for')) this.expr();
      this.expect(';'); return;
    }
    if (this.accept('next') || this.accept('exit')) { if (this.peek().t === 'id') this.next(); if (this.accept('when')) this.expr(); this.expect(';'); return; }
    if (this.accept('return')) { if (!this.is(';')) this.expr(); this.expect(';'); return; }
    if (this.accept('null')) { this.expect(';'); return; }
    if (this.accept('assert')) { this.expr(); if (this.accept('report')) this.expr(); if (this.accept('severity')) this.expr(); this.expect(';'); return; }
    if (this.accept('report')) { this.expr(); if (this.accept('severity')) this.expr(); this.expect(';'); return; }
    if (this.peek().t === 'id' || this.is('(')) {
      const target = this.is('(') ? this.aggregate() : this.name();
      if (this.accept('<=') || this.accept(':=')) {
        this.accept('transport'); this.accept('inertial');
        if (p) { const n = baseName(target); if (n) p.writes.add(n); }
        for (const e of this.waveform()) this.read(p, e);
        while (this.accept('when')) { this.read(p, this.expr()); if (this.accept('else')) for (const e of this.waveform()) this.read(p, e); }
        this.expect(';', '";" after an assignment'); return;
      }
      this.expect(';', '";" after a procedure call'); return;
    }
    this.fail('a statement', t);
  }
  read(p, e) { if (!p) return; const ids = []; collectIds(e, ids); for (const n of ids) p.reads.add(n); }
}

function baseName(e) { while (e && (e.k === 'call' || e.k === 'attr')) e = e.base; return e && e.k === 'id' ? e.name.split('.')[0] : null; }
function collectIds(e, out) {
  if (!e || typeof e !== 'object') return;
  if (e.k === 'id') { out.push(e.name.split('.')[0]); return; }
  for (const k of ['a', 'b', 'base', 'from', 'to', 'actual', 'formal', 'expr']) if (e[k]) collectIds(e[k], out);
  if (e.args) for (const x of e.args) collectIds(x, out);
  if (e.parts) for (const x of e.parts) collectIds(x.expr || x, out);
}

/** Width of a VHDL type width {from, to, dir} with generics/constants env; null when unknown. */
export function vhdlWidth(w, env = {}) {
  if (!w) return null;
  if (w.scalar) return 1;
  const v = (e) => {
    if (!e) return null;
    if (e.k === 'num') return e.value;
    if (e.k === 'id') return typeof env[e.name] === 'number' ? env[e.name] : null;
    if (e.k === 'un' && e.op === '-') { const x = v(e.a); return x === null ? null : -x; }
    if (e.k === 'bin') { const a = v(e.a), b = v(e.b); if (a === null || b === null) return null; return e.op === '+' ? a + b : e.op === '-' ? a - b : e.op === '*' ? a * b : e.op === '/' ? Math.trunc(a / b) : e.op === '**' ? a ** b : null; }
    return null;
  };
  const a = v(w.from), b = v(w.to);
  return a === null || b === null ? null : Math.abs(a - b) + 1;
}

export function parseVhdl(text, opts = {}) {
  const file = opts.file || '';
  const lx = tokenize(text, file);
  const problems = [...lx.problems];
  const p = new Parser(lx.tokens, file, problems);
  const { entities, archs, packages } = p.file_();
  for (const a of archs) {
    const e = entities.find((x) => x.name === a.of);
    if (e) e.archs.push(a);
  }
  // modules in the shared shape (hier.js): one per entity, instances from its last architecture (VHDL's default binding)
  const units = entities.map((e) => {
    const a = e.archs[e.archs.length - 1] || null;
    return { name: e.name, raw: e.raw, lang: 'vhdl', file: e.file, line: e.line, col: e.col, ports: e.ports, params: e.params, archs: e.archs, arch: a ? a.name : null,
      instances: a ? a.instances.map((i) => ({ ...i, gate: false })) : [], blocks: a ? a.processes : [], nets: a ? a.signals : {} };
  });
  const orphanArchs = archs.filter((a) => !entities.some((x) => x.name === a.of));
  return { modules: units, entities, architectures: archs, orphanArchs, packages, problems: sortRows(problems) };
}

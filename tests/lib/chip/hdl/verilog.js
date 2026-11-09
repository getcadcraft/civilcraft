/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cc-chip Verilog reader (0.9 HD.1). Our own tokenizer, preprocessor and recursive-descent parser for the synthesizable subset of
 * IEEE 1364-2005 plus a few cheap SystemVerilog bits (logic, bit, int, always_ff/always_comb/always_latch, '0 '1 fills, unique/priority,
 * ++/+=). Written from the language as published, clean room. DOM-free, imports only problems.js.
 *
 *   parseVerilog(text, {file, include(name) → text|null, defines: {NAME: 'text'}}) → { modules[], problems[] }
 *   module = { name, lang:'verilog', file, line, col, ports[{name, dir, width, line, col}], params[{name, expr, local}], nets: {name → {kind, width, line, col}},
 *              instances[{type, name, params[{name|null, expr}], conns[{port|null, expr}], named, gate, inGenerate, line, col}],
 *              assigns[{lhs, rhs, line, col}], blocks[{kind, reads[], writes[], edges[], line, col}], functions[], hasGenerate }
 *   width = {msb: expr, lsb: expr} | null (one bit).  expr = AST: {k:'id'|'num'|'str'|'sel'|'idx'|'cat'|'rep'|'un'|'bin'|'cond'|'call'|'sys'|'fill', …}
 * Not supported (reported, never silently wrong): user-defined primitives (skipped with a note), specify blocks (skipped), interfaces, classes,
 * packages (skipped), structs/enums (typedef lines skipped), generate case.
 */
import { row, sortRows, Bail } from './problems.js';

export const KEYWORDS = new Set(('module macromodule endmodule input output inout wire reg logic tri tri0 tri1 wand wor triand trior supply0 supply1 integer int bit byte ' +
  'shortint longint real realtime time genvar parameter localparam defparam assign always always_ff always_comb always_latch initial begin end if else ' +
  'case casez casex endcase default for while repeat forever posedge negedge or and nand nor xor xnor not buf bufif0 bufif1 notif0 notif1 ' +
  'function endfunction task endtask generate endgenerate signed unsigned automatic specify endspecify primitive endprimitive table endtable ' +
  'wait disable fork join unique priority typedef enum struct packed import package endpackage return break continue var').split(' '));
export const GATES = new Set(['and', 'nand', 'or', 'nor', 'xor', 'xnor', 'not', 'buf', 'bufif0', 'bufif1', 'notif0', 'notif1']);
const NET_TYPES = new Set(['wire', 'reg', 'logic', 'tri', 'tri0', 'tri1', 'wand', 'wor', 'triand', 'trior', 'supply0', 'supply1', 'bit', 'var']);
const INT_TYPES = { integer: 32, int: 32, byte: 8, shortint: 16, longint: 64, time: 64 };
const DIRS = new Set(['input', 'output', 'inout']);
const OPS = ['<<<=', '>>>=', '===', '!==', '<<<', '>>>', '<<=', '>>=', '==', '!=', '<=', '>=', '&&', '||', '**', '<<', '>>', '~&', '~|', '~^', '^~', '+:', '-:', '->',
  '::', '++', '--', '+=', '-=', '*=', '/=', '&=', '|=', '^=', '(', ')', '[', ']', '{', '}', ';', ',', '.', ':', '#', '@', '=', '+', '-', '*', '/', '%', '&', '|', '^', '~', '!', '<', '>', '?', "'"];
const MAX_ERRORS = 50;

/* ---------------------------------------------------------------- tokenizer */

/** tokenize(text, file) → {tokens, problems}. Token {t:'id'|'kw'|'num'|'str'|'op'|'sys'|'dir'|'eof', v, line, col, …}. */
export function tokenize(text, file = '', base = null) {
  const src = String(text ?? ''), out = [], problems = [];
  let i = 0, line = base ? base.line : 1, col = base ? base.col : 1;
  const adv = (n) => { for (let k = 0; k < n; k++) { if (src[i] === '\n') { line++; col = 1; } else col++; i++; } };
  const push = (t, v, l, c, extra) => out.push({ t, v, line: l, col: c, ...extra });
  while (i < src.length) {
    const ch = src[i];
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n' || ch === '\f') { adv(1); continue; }
    const l = line, c = col;
    if (ch === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') adv(1); continue; }
    if (ch === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      if (end < 0) { problems.push(row('lex.comment', 'error', {}, { file, line: l, col: c })); adv(src.length - i); break; }
      adv(end + 2 - i); continue;
    }
    if (ch === '(' && src[i + 1] === '*' && !/^\(\*\s*\)/.test(src.slice(i, i + 8))) {   // attribute (* … *)
      const end = src.indexOf('*)', i + 2);
      adv(end < 0 ? src.length - i : end + 2 - i); continue;
    }
    if (ch === '`') {
      const m = /^`([A-Za-z_][A-Za-z0-9_$]*)/.exec(src.slice(i, i + 200));
      if (!m) { problems.push(row('lex.char', 'error', { ch: '`' }, { file, line: l, col: c })); adv(1); continue; }
      adv(m[0].length);
      const name = m[1];
      if (['define', 'include', 'timescale', 'default_nettype', 'undef', 'ifdef', 'ifndef', 'elsif', 'line', 'pragma', 'begin_keywords', 'unconnected_drive'].includes(name)) {
        let rest = '';                                          // rest of the line, with \ continuations (for `define)
        for (;;) {
          while (i < src.length && src[i] !== '\n') { rest += src[i]; adv(1); }
          if (name === 'define' && rest.endsWith('\\')) { rest = rest.slice(0, -1) + '\n'; adv(1); continue; }
          break;
        }
        push('dir', name, l, c, { rest });
      } else push('dir', name, l, c, { rest: '' });
      continue;
    }
    if (ch === '\\') {                                           // escaped identifier: up to white space
      let j = i + 1; while (j < src.length && !/\s/.test(src[j])) j++;
      const v = src.slice(i + 1, j); adv(j - i); push('id', v, l, c, { escaped: true }); continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1; while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++;
      const v = src.slice(i, j); adv(j - i); push(KEYWORDS.has(v) ? 'kw' : 'id', v, l, c); continue;
    }
    if (ch === '$') {
      let j = i + 1; while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++;
      const v = src.slice(i, j); adv(j - i); push('sys', v, l, c); continue;
    }
    if (ch === '"') {
      let j = i + 1, s = '';
      while (j < src.length && src[j] !== '"' && src[j] !== '\n') { if (src[j] === '\\' && j + 1 < src.length) { s += src[j + 1]; j += 2; } else s += src[j++]; }
      if (src[j] !== '"') { problems.push(row('lex.string', 'error', {}, { file, line: l, col: c })); adv(j - i); continue; }
      adv(j + 1 - i); push('str', s, l, c); continue;
    }
    if (/[0-9]/.test(ch) || (ch === "'" && /^'[sS]?[bBoOdDhH]/.test(src.slice(i, i + 3))) || (ch === "'" && /^'[01xXzZ](?![A-Za-z0-9_])/.test(src.slice(i, i + 3)))) {
      const m = /^(?:(\d[\d_]*)\s*)?'([sS]?)([bBoOdDhH])\s*([0-9a-fA-FxXzZ?_]+)/.exec(src.slice(i, i + 400));
      if (m) { adv(m[0].length); push('num', m[0], l, c, numberOf(m[1], m[2], m[3], m[4], m[0], file, l, c, problems)); continue; }
      const f = /^'([01xXzZ])/.exec(src.slice(i, i + 2));
      if (f) { adv(2); push('num', f[0], l, c, { fill: f[1].toLowerCase() }); continue; }
      const r = /^\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d+)?/.exec(src.slice(i, i + 400));
      adv(r[0].length);
      const s = r[0].replace(/_/g, '');
      if (r[1] || r[2]) push('num', r[0], l, c, { real: Number(s) });
      else push('num', r[0], l, c, { value: Number(s), width: 32, unsized: true, bits: toBits(BigInt(s), 32) });
      continue;
    }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (op) { adv(op.length); push('op', op, l, c); continue; }
    problems.push(row('lex.char', 'error', { ch: JSON.stringify(ch) }, { file, line: l, col: c })); adv(1);
  }
  out.push({ t: 'eof', v: '', line, col });
  return { tokens: out, problems };
}

function toBits(big, width) {
  let s = big.toString(2); if (s.length > width) s = s.slice(s.length - width);
  return s.padStart(width, '0');
}

function numberOf(size, signed, baseCh, digits, text, file, line, col, problems) {
  const base = { b: 2, o: 8, d: 10, h: 16 }[baseCh.toLowerCase()], per = { 2: 1, 8: 3, 16: 4 }[base];
  const d = digits.replace(/_/g, '').toLowerCase();
  const width = size ? Number(size.replace(/_/g, '')) : 32;
  if (!width || width > 1 << 20) { problems.push(row('lex.number', 'error', { text }, { file, line, col })); return { width: 1, bits: '0' }; }
  let bits = '';
  if (base === 10) {
    if (/^[xz?]$/.test(d)) bits = (d === 'x' ? 'x' : 'z').repeat(width);
    else if (/^\d+$/.test(d)) bits = toBits(BigInt(d), width);
    else { problems.push(row('lex.number', 'error', { text }, { file, line, col })); bits = '0'.repeat(width); }
  } else {
    const ok = base === 2 ? /^[01xz?]+$/ : base === 8 ? /^[0-7xz?]+$/ : /^[0-9a-fxz?]+$/;
    if (!ok.test(d)) { problems.push(row('lex.number', 'error', { text }, { file, line, col })); return { width, bits: '0'.repeat(width) }; }
    for (const c of d) bits += c === 'x' ? 'x'.repeat(per) : c === 'z' || c === '?' ? 'z'.repeat(per) : parseInt(c, base).toString(2).padStart(per, '0');
    const fillc = bits[0] === 'x' || bits[0] === 'z' ? bits[0] : '0';
    bits = bits.length >= width ? bits.slice(bits.length - width) : fillc.repeat(width - bits.length) + bits;
  }
  const out = { width, bits, signed: !!signed, unsized: !size };
  if (!/[xz]/.test(bits) && width <= 52) out.value = parseInt(bits, 2);
  return out;
}

/* ---------------------------------------------------------------- preprocessor (token level) */

export function preprocess(tokens, opts, file, problems) {
  const macros = new Map(Object.entries(opts.defines || {}).map(([k, v]) => [k, { params: null, body: tokenize(String(v), file).tokens.slice(0, -1) }]));
  const out = [], stack = [];                                 // stack of {taking, done, at}
  const taking = () => stack.every((s) => s.taking);
  const included = new Set(opts._included || []);
  // read `NAME(a, b) arguments from a token source {peek(), next()}
  const readArgs = (src) => {
    const args = []; if (src.peek().v !== '(') return args;
    src.next(); let depthP = 0, cur = [];
    for (;;) {
      const t = src.next(); if (!t || t.t === 'eof') break;
      if (t.v === '(' || t.v === '[' || t.v === '{') depthP++;
      if ((t.v === ')' || t.v === ']' || t.v === '}') && depthP-- === 0) { args.push(cur); break; }
      if (t.v === ',' && depthP === 0) { args.push(cur); cur = []; continue; }
      cur.push(t);
    }
    return args;
  };
  // expand one macro use; nested uses in the body and in the arguments are expanded too
  const expandUse = (tok, src, depth) => {
    const m = macros.get(tok.v);
    if (!m) { problems.push(row('pp.macro', 'error', { name: tok.v }, { file, line: tok.line, col: tok.col })); return []; }
    if (depth > 20) return [];
    const args = m.params ? readArgs(src).map((a) => expandSeq(a, depth + 1)) : null;
    const body = [];
    for (const b of m.body) {
      const pi = m.params && b.t === 'id' ? m.params.indexOf(b.v) : -1;
      if (pi >= 0) { for (const x of (args && args[pi]) || []) body.push({ ...x, line: tok.line, col: tok.col }); continue; }
      body.push({ ...b, line: tok.line, col: tok.col });
    }
    return expandSeq(body, depth + 1);
  };
  const expandSeq = (seq, depth) => {
    const out2 = []; let k = 0;
    const src = { peek: () => seq[k] || { v: '', t: 'eof' }, next: () => seq[k++] };
    while (k < seq.length) { const t = seq[k++]; if (t.t === 'dir' && macros.has(t.v)) out2.push(...expandUse(t, src, depth)); else out2.push(t); }
    return out2;
  };
  let p = 0;
  const list = { peek: () => tokens[p], next: () => tokens[p++] || tokens[tokens.length - 1] };
  while (p < tokens.length) {
    const tok = tokens[p++];
    if (tok.t === 'eof') { out.push(tok); break; }
    if (tok.t !== 'dir') { if (taking()) out.push(tok); continue; }
    const where = { file, line: tok.line, col: tok.col }, arg = (tok.rest || '').trim();
    switch (tok.v) {
      case 'ifdef': case 'ifndef': { const name = arg.split(/\s+/)[0]; const has = macros.has(name); const t = tok.v === 'ifdef' ? has : !has; stack.push({ taking: t, done: t, at: where }); break; }
      case 'elsif': { const s = stack[stack.length - 1]; if (!s) { problems.push(row('pp.endif', 'error', { name: 'elsif' }, where)); break; } const t = !s.done && macros.has(arg.split(/\s+/)[0]); s.taking = t; s.done = s.done || t; break; }
      case 'else': { const s = stack[stack.length - 1]; if (!s) { problems.push(row('pp.endif', 'error', { name: 'else' }, where)); break; } s.taking = !s.done; s.done = true; break; }
      case 'endif': if (!stack.pop()) problems.push(row('pp.endif', 'error', { name: 'endif' }, where)); break;
      default:
        if (!taking()) break;
        if (tok.v === 'define') {
          const m = /^([A-Za-z_][A-Za-z0-9_$]*)(\(([^)]*)\))?/.exec(arg);
          if (!m) { problems.push(row('syn.expect', 'error', { want: 'a macro name', got: '`define' }, where)); break; }
          const bodyText = (tok.rest || '').replace(/^\s*/, '').slice(m[0].length);
          macros.set(m[1], { params: m[2] ? m[3].split(',').map((s) => s.trim()).filter(Boolean) : null, body: tokenize(bodyText, file).tokens.slice(0, -1) });
        } else if (tok.v === 'undef') macros.delete(arg.split(/\s+/)[0]);
        else if (tok.v === 'include') {
          const nm = (/^"([^"]+)"|^<([^>]+)>/.exec(arg) || [])[1];
          const txt = nm && typeof opts.include === 'function' && !included.has(nm) ? opts.include(nm) : null;
          if (txt == null) { problems.push(row('pp.include', 'warning', { name: nm || arg }, where)); break; }
          const sub = tokenize(txt, nm);
          problems.push(...sub.problems);
          const inner = preprocess(sub.tokens, { ...opts, defines: {}, _included: [...included, nm], _macros: macros }, nm, problems);
          out.push(...inner.slice(0, -1));
        } else if (['timescale', 'default_nettype', 'resetall', 'celldefine', 'endcelldefine', 'line', 'pragma', 'begin_keywords', 'end_keywords', 'unconnected_drive', 'nounconnected_drive'].includes(tok.v)) { /* no effect on structure */ }
        else if (macros.has(tok.v)) out.push(...expandUse(tok, list, 0));
        else problems.push(row('pp.macro', 'error', { name: tok.v }, where));
    }
  }
  for (const s of stack) problems.push(row('pp.unclosed', 'error', {}, s.at));
  if (opts._macros) for (const [k, v] of macros) opts._macros.set(k, v);
  return out;
}

/* ---------------------------------------------------------------- parser */

class Parser {
  constructor(tokens, file, problems) { this.toks = tokens; this.i = 0; this.file = file; this.problems = problems; this.errors = 0; }
  peek(k = 0) { return this.toks[Math.min(this.i + k, this.toks.length - 1)]; }
  next() { return this.toks[Math.min(this.i++, this.toks.length - 1)]; }
  is(v, k = 0) { const t = this.peek(k); return (t.t === 'op' || t.t === 'kw') && t.v === v; }
  accept(v) { if (this.is(v)) return this.next(); return null; }
  where(t = this.peek()) { return { file: this.file, line: t.line, col: t.col }; }
  desc(t) { return t.t === 'eof' ? 'the end of the file' : t.t === 'str' ? 'a string' : JSON.stringify(t.v); }
  fail(want, t = this.peek()) {
    if (t.t === 'eof') throw new Bail(row('syn.eof', 'error', { what: want }, this.where(t)));
    throw new Bail(row('syn.expect', 'error', { want, got: this.desc(t) }, this.where(t)));
  }
  expect(v, want = JSON.stringify(v)) {
    if (this.is(v)) return this.next();
    const prev = this.toks[this.i - 1];
    if (v === ';' && prev && this.peek().t !== 'eof' && prev.line !== this.peek().line) {   // a missing ";" is reported where it belongs: after the last token
      throw new Bail(row('syn.expect', 'error', { want, got: this.desc(this.peek()) }, { file: this.file, line: prev.line, col: prev.col + String(prev.v).length + (prev.escaped ? 1 : 0) }));
    }
    return this.fail(want);
  }
  ident(want = 'a name') { const t = this.peek(); if (t.t === 'id') return this.next(); return this.fail(want); }
  report(r) { if (this.errors >= MAX_ERRORS) return; this.errors++; this.problems.push(r); if (this.errors === MAX_ERRORS) this.problems.push(row('syn.toomany', 'error', { n: MAX_ERRORS }, { file: this.file, line: r.line, col: r.col })); }
  note(code, sev, vars, t) { this.problems.push(row(code, sev, vars, this.where(t))); }
  skipTo(...stops) { while (this.peek().t !== 'eof' && !stops.some((s) => this.is(s))) this.next(); }

  /* -------- expressions */
  expr() { return this.cond(); }
  cond() {
    const c = this.binary(0);
    if (this.accept('?')) { const a = this.expr(); this.expect(':', '":" in a ? : expression'); const b = this.expr(); return { k: 'cond', c, a, b }; }
    return c;
  }
  binary(level) {
    const LEVELS = [['||'], ['&&'], ['|'], ['^', '~^', '^~'], ['&'], ['==', '!=', '===', '!=='], ['<', '<=', '>', '>='], ['<<', '>>', '<<<', '>>>'], ['+', '-'], ['*', '/', '%'], ['**']];
    if (level >= LEVELS.length) return this.unary();
    let a = this.binary(level + 1);
    for (;;) {
      const t = this.peek();
      if (t.t !== 'op' || !LEVELS[level].includes(t.v)) return a;
      this.next(); const b = this.binary(level + 1); a = { k: 'bin', op: t.v, a, b };
    }
  }
  unary() {
    const t = this.peek();
    if (t.t === 'op' && ['+', '-', '!', '~', '&', '|', '^', '~&', '~|', '~^', '^~'].includes(t.v)) { this.next(); return { k: 'un', op: t.v, a: this.unary() }; }
    return this.primary();
  }
  primary() {
    const t = this.peek();
    if (t.t === 'num') { this.next(); if (t.fill) return { k: 'fill', v: t.fill, line: t.line, col: t.col }; return { k: 'num', text: t.v, width: t.width, bits: t.bits, value: t.value ?? t.real, unsized: t.unsized, line: t.line, col: t.col }; }
    if (t.t === 'str') { this.next(); return { k: 'str', v: t.v }; }
    if (t.t === 'sys') {
      this.next(); const args = [];
      if (this.accept('(')) { if (!this.is(')')) { do args.push(this.expr()); while (this.accept(',')); } this.expect(')'); }
      return { k: 'sys', name: t.v, args, line: t.line, col: t.col };
    }
    if (this.is('(')) {
      this.next(); const e = this.expr();
      if (this.accept(':')) { this.expr(); this.expect(':'); this.expr(); }   // min:typ:max
      this.expect(')'); return e;
    }
    if (this.is('{')) return this.concat();
    if (t.t === 'id') {
      this.next();
      if (this.is('(')) {                                     // function call
        this.next(); const args = [];
        if (!this.is(')')) { do args.push(this.expr()); while (this.accept(',')); }
        this.expect(')'); return { k: 'call', name: t.v, args, line: t.line, col: t.col };
      }
      let e = { k: 'id', name: t.v, line: t.line, col: t.col };
      while (this.is('.') && this.peek(1).t === 'id') { this.next(); e = { k: 'id', name: e.name + '.' + this.next().v, hier: true, line: t.line, col: t.col }; }
      return this.selects(e);
    }
    if (t.t === 'kw' && (INT_TYPES[t.v] || t.v === 'signed' || t.v === 'unsigned') && this.is("'", 1)) { this.next(); this.next(); this.expect('('); const e = this.expr(); this.expect(')'); return e; }
    return this.fail('an expression');
  }
  selects(e) {
    while (this.is('[')) {
      this.next(); const a = this.expr();
      if (this.accept(':')) { const b = this.expr(); this.expect(']'); e = { k: 'sel', base: e, msb: a, lsb: b }; }
      else if (this.is('+:') || this.is('-:')) { const op = this.next().v; const w = this.expr(); this.expect(']'); e = { k: 'sel', base: e, start: a, width: w, dir: op }; }
      else { this.expect(']', '"]"'); e = { k: 'idx', base: e, index: a }; }
    }
    return e;
  }
  concat() {
    const open = this.expect('{');
    if (this.accept('}')) return { k: 'cat', parts: [] };
    const first = this.expr();
    if (this.is('{')) { const inner = this.concat(); this.expect('}', '"}" after a replication'); return { k: 'rep', count: first, parts: inner.parts, line: open.line, col: open.col }; }
    const parts = [first];
    while (this.accept(',')) parts.push(this.expr());
    this.expect('}', '"," or "}"');
    return { k: 'cat', parts, line: open.line, col: open.col };
  }
  lvalue() {
    if (this.is('{')) return this.concat();
    const t = this.ident('a signal name');
    let e = { k: 'id', name: t.v, line: t.line, col: t.col };
    while (this.is('.') && this.peek(1).t === 'id') { this.next(); e = { k: 'id', name: e.name + '.' + this.next().v, hier: true, line: t.line, col: t.col }; }
    return this.selects(e);
  }
  range() {   // [msb:lsb] or null
    if (!this.is('[')) return null;
    this.next(); const msb = this.expr();
    if (this.accept(':')) { const lsb = this.expr(); this.expect(']'); return { msb, lsb }; }
    this.expect(']'); return { msb: { k: 'bin', op: '-', a: msb, b: { k: 'num', value: 1, width: 32, bits: toBits(1n, 32) } }, lsb: { k: 'num', value: 0, width: 32, bits: toBits(0n, 32) } };   // SV [N]
  }

  /* -------- file and modules */
  file_() {
    const modules = [];
    while (this.peek().t !== 'eof') {
      try {
        if (this.is('module') || this.is('macromodule')) modules.push(this.module());
        else if (this.is('primitive')) { const t = this.next(); this.note('syn.unexpected', 'note', { got: 'primitive (user-defined primitives are skipped)' }, t); this.skipTo('endprimitive'); this.accept('endprimitive'); }
        else if (this.is('package')) { this.skipTo('endpackage'); this.accept('endpackage'); }
        else if (this.is('typedef') || this.is('import')) { this.skipTo(';'); this.accept(';'); }
        else if (this.accept(';')) { /* stray */ }
        else { const t = this.next(); this.report(row('syn.unexpected', 'error', { got: this.desc(t) + ' outside a module' }, this.where(t))); this.skipTo('module', 'macromodule'); }
      } catch (e) { if (!(e instanceof Bail)) throw e; this.report(e.row); this.skipTo('module', 'macromodule'); }
    }
    return modules;
  }

  module() {
    const kw = this.next();
    const nameTok = this.ident('a module name');
    const m = { name: nameTok.v, lang: 'verilog', file: this.file, line: nameTok.line, col: nameTok.col, ports: [], params: [], nets: {}, instances: [], assigns: [], blocks: [], functions: [], hasGenerate: false, decls: new Map(), locals: new Set(), uses: [], portOrder: [] };
    void kw;
    const declare = (name, info, t) => {
      if (m.decls.has(name)) {
        const prev = m.decls.get(name);
        // a non-ANSI port gets its direction and its net type on two lines: that is not a second declaration
        if (prev.what === 'port' && info.what === 'net') { if (info.width && !prev.width) prev.width = info.width; prev.kind = info.kind; return; }
        if (prev.what === 'net' && info.what === 'port') { prev.what = 'port'; prev.dir = info.dir; if (info.width) prev.width = info.width; return; }
        if (prev.what === 'port-name' && info.what === 'port') { m.decls.set(name, info); return; }
        this.problems.push(row('sem.dupdecl', 'error', { name, scope: m.name }, this.where(t))); return;
      }
      m.decls.set(name, info);
    };
    try {
      if (this.accept('#')) { this.expect('('); this.paramPorts(m); this.expect(')'); }
      if (this.accept('(')) { this.portList(m, declare); this.expect(')', '")" to close the port list'); }
    } catch (e) { if (!(e instanceof Bail)) throw e; this.report(e.row); this.skipTo(';', 'endmodule'); }
    try { this.expect(';', '";" after the module header'); } catch (e) { if (!(e instanceof Bail)) throw e; this.report(e.row); }
    let recovering = false;
    for (;;) {
      const t = this.peek();
      if (t.t === 'eof') { this.report(row('syn.eof', 'error', { what: 'module ' + m.name + ' (endmodule is missing)' }, this.where(t))); break; }
      if (this.is('endmodule')) { this.next(); if (this.accept(':')) { const e = this.ident(); if (e.v !== m.name) this.report(row('syn.endname', 'error', { got: e.v, want: m.name }, this.where(e))); } break; }
      if (this.is('module') || this.is('macromodule')) { this.report(row('syn.expect', 'error', { want: 'endmodule before the next module', got: '"module"' }, this.where(t))); break; }
      if (recovering && this.startsItem()) recovering = false;      // a fresh declaration or block: report its errors again
      try { this.item(m, declare, false); recovering = false; }
      catch (e) {
        if (!(e instanceof Bail)) throw e;
        if (!recovering) this.report(e.row);
        recovering = true;
        if (this.peek().t !== 'eof' && !this.is('endmodule')) { this.skipTo(';', 'endmodule', 'end', 'endcase'); if (this.is(';') || this.is('end') || this.is('endcase')) this.next(); }
      }
    }
    this.finishModule(m);
    return m;
  }

  startsItem() {
    const t = this.peek();
    if (t.t === 'kw') return DIRS.has(t.v) || NET_TYPES.has(t.v) || !!INT_TYPES[t.v] || ['parameter', 'localparam', 'assign', 'always', 'always_ff', 'always_comb', 'always_latch', 'initial', 'function', 'task', 'generate', 'genvar'].includes(t.v) || GATES.has(t.v);
    return t.t === 'id' && (this.peek(1).t === 'id' || this.is('#', 1));
  }
  paramPorts(m) {
    if (this.is(')')) return;
    let local = false;
    do {
      if (this.accept('parameter')) local = false; else if (this.accept('localparam')) local = true;
      this.skipType();
      const n = this.ident('a parameter name');
      const expr = this.accept('=') ? this.expr() : null;
      m.params.push({ name: n.v, expr, local, line: n.line, col: n.col });
      m.decls.set(n.v, { what: 'param' });
    } while (this.accept(','));
  }
  skipType() {   // [integer|int|logic|…] [signed] [range]
    let w = null;
    if (this.peek().t === 'kw' && (NET_TYPES.has(this.peek().v) || INT_TYPES[this.peek().v] || this.is('real'))) this.next();
    if (this.accept('signed') || this.accept('unsigned')) { /* */ }
    if (this.is('[')) w = this.range();
    return w;
  }
  portList(m, declare) {
    if (this.is(')')) return;
    if (this.peek().t === 'kw' && DIRS.has(this.peek().v)) {          // ANSI
      let dir = null, kind = 'wire', width = null;
      do {
        if (this.peek().t === 'kw' && DIRS.has(this.peek().v)) {
          dir = this.next().v; kind = 'wire'; width = null;
          if (this.peek().t === 'kw' && NET_TYPES.has(this.peek().v)) kind = this.next().v;
          else if (this.peek().t === 'kw' && INT_TYPES[this.peek().v]) { const it = this.next().v; kind = it; width = intWidth(INT_TYPES[it]); }
          if (this.accept('signed') || this.accept('unsigned')) { /* */ }
          if (this.is('[')) width = this.range();
        } else if (this.peek().t === 'kw' && NET_TYPES.has(this.peek().v)) { kind = this.next().v; if (this.is('[')) width = this.range(); }
        else if (this.is('[')) width = this.range();
        const n = this.ident('a port name');
        while (this.is('[')) this.range();                           // unpacked dimensions (kept as one bus)
        if (this.accept('=')) this.expr();
        m.ports.push({ name: n.v, dir, width, kind, line: n.line, col: n.col });
        declare(n.v, { what: 'port', dir, width, kind }, n);
      } while (this.accept(','));
      m.ansi = true;
    } else {
      do {
        if (this.is('.')) { this.next(); const n = this.ident(); this.expect('('); if (!this.is(')')) this.expr(); this.expect(')'); m.ports.push({ name: n.v, dir: null, width: null, line: n.line, col: n.col }); m.decls.set(n.v, { what: 'port-name' }); continue; }
        if (this.is(',') || this.is(')')) { m.ports.push({ name: '', dir: null, width: null }); continue; }
        const n = this.ident('a port name');
        if (this.is('[')) this.range();
        m.ports.push({ name: n.v, dir: null, width: null, line: n.line, col: n.col });
        m.decls.set(n.v, { what: 'port-name' });
      } while (this.accept(','));
      m.ansi = false;
    }
  }

  /* -------- module items */
  item(m, declare, inGen) {
    const t = this.peek();
    if (t.t === 'kw') {
      const v = t.v;
      if (DIRS.has(v)) return this.portDecl(m, declare);
      if (NET_TYPES.has(v) || INT_TYPES[v] || v === 'real' || v === 'realtime' || v === 'genvar') return this.netDecl(m, declare);
      if (v === 'parameter' || v === 'localparam') return this.paramDecl(m, v === 'localparam');
      if (v === 'defparam' || v === 'typedef' || v === 'import') { this.skipTo(';'); this.expect(';'); return; }
      if (v === 'assign') return this.assign(m);
      if (v === 'always' || v === 'always_ff' || v === 'always_comb' || v === 'always_latch' || v === 'initial') return this.procBlock(m);
      if (v === 'function' || v === 'task') return this.subprogram(m);
      if (v === 'generate') { this.next(); m.hasGenerate = true; while (!this.is('endgenerate')) { if (this.peek().t === 'eof') this.fail('endgenerate'); this.item(m, declare, true); } this.next(); return; }
      if (v === 'for') return this.genFor(m, declare);
      if (v === 'if') return this.genIf(m, declare);
      if (v === 'begin' && inGen) { this.next(); if (this.accept(':')) this.ident(); while (!this.is('end')) { if (this.peek().t === 'eof') this.fail('end'); this.item(m, declare, true); } this.next(); if (this.accept(':')) this.ident(); return; }
      if (v === 'specify') { this.skipTo('endspecify'); this.expect('endspecify'); return; }
      if (GATES.has(v)) return this.gate(m, inGen);
      if (v === 'case' && inGen) { this.fail('a module item (generate case is not supported)'); }
    }
    if (t.t === 'id' && (this.peek(1).t === 'id' || this.is('#', 1))) return this.instance(m, inGen);
    if (this.accept(';')) return;
    return this.fail('a module item (declaration, assign, always, instance)');
  }
  portDecl(m, declare) {
    const dir = this.next().v;
    let kind = null, width = null;
    if (this.peek().t === 'kw' && NET_TYPES.has(this.peek().v)) kind = this.next().v;
    else if (this.peek().t === 'kw' && INT_TYPES[this.peek().v]) { kind = this.next().v; width = intWidth(INT_TYPES[kind]); }
    if (this.accept('signed') || this.accept('unsigned')) { /* */ }
    if (this.is('[')) width = this.range();
    do {
      const n = this.ident('a port name');
      if (m.ansi) this.problems.push(row('sem.dupdecl', 'error', { name: n.v, scope: m.name }, this.where(n)));
      else if (!m.ports.some((p) => p.name === n.v)) this.problems.push(row('sem.portnotlisted', 'error', { name: n.v, scope: m.name }, this.where(n)));
      const p = m.ports.find((x) => x.name === n.v);
      if (p) { p.dir = dir; if (width) p.width = width; if (kind) p.kind = kind; }
      declare(n.v, { what: 'port', dir, width, kind: kind || 'wire' }, n);
      if (this.accept('=')) this.expr();
    } while (this.accept(','));
    this.expect(';');
  }
  netDecl(m, declare) {
    const kt = this.next(); let kind = kt.v, width = INT_TYPES[kind] ? intWidth(INT_TYPES[kind]) : null;
    if (this.peek().t === 'kw' && NET_TYPES.has(this.peek().v)) kind = this.next().v;    // "var logic", "wire logic"
    if (this.accept('signed') || this.accept('unsigned')) { /* */ }
    if (this.is('[')) width = this.range();
    if (this.is('#')) { this.next(); this.delayValue(); }
    do {
      const n = this.ident('a net name');
      let array = null;
      while (this.is('[')) array = this.range();
      declare(n.v, { what: 'net', kind, width, array }, n);
      if (kind !== 'genvar') m.nets[n.v] = { kind, width, array, line: n.line, col: n.col };
      if (this.accept('=')) { const rhs = this.expr(); if (kind === 'wire' || kind === 'tri') m.assigns.push({ lhs: { k: 'id', name: n.v, line: n.line, col: n.col }, rhs, line: n.line, col: n.col }); else this.uses(m, rhs); }
    } while (this.accept(','));
    this.expect(';', '";" after a declaration');
  }
  paramDecl(m, local) {
    this.next(); this.skipType();
    do {
      const n = this.ident('a parameter name'); this.expect('=', '"=" and a value');
      const expr = this.expr();
      m.params.push({ name: n.v, expr, local, line: n.line, col: n.col });
      if (m.decls.has(n.v)) this.problems.push(row('sem.dupdecl', 'error', { name: n.v, scope: m.name }, this.where(n))); else m.decls.set(n.v, { what: 'param' });
    } while (this.accept(','));
    this.expect(';');
  }
  delayValue() { if (this.is('(')) { this.next(); this.expr(); while (this.accept(',')) this.expr(); this.expect(')'); } else this.primary(); }
  assign(m) {
    const t = this.next();
    if (this.is('#')) { this.next(); this.delayValue(); }
    if (this.is('(')) { this.next(); this.skipTo(')'); this.expect(')'); }   // drive strength
    do {
      const lhs = this.lvalue(); this.expect('=', '"=" in an assign');
      const rhs = this.expr();
      m.assigns.push({ lhs, rhs, line: t.line, col: t.col });
    } while (this.accept(','));
    this.expect(';', '";" after an assign');
  }
  procBlock(m) {
    const t = this.next();
    const b = { kind: t.v, reads: new Set(), writes: new Set(), edges: [], line: t.line, col: t.col };
    this.cur = b;
    try { this.statement(m); } finally { this.cur = null; }
    delete b.edgesDone;
    m.blocks.push({ ...b, reads: [...b.reads].sort(), writes: [...b.writes].sort() });
  }
  subprogram(m) {
    const kw = this.next().v, end = kw === 'function' ? 'endfunction' : 'endtask';
    this.accept('automatic'); this.accept('static');
    if (kw === 'function') { if (this.peek().t === 'kw' && (NET_TYPES.has(this.peek().v) || INT_TYPES[this.peek().v] || this.is('void') || this.is('real'))) this.next(); this.accept('signed'); this.accept('unsigned'); if (this.is('[')) this.range(); }
    const n = this.ident('a ' + kw + ' name');
    m.functions.push(n.v); m.decls.set(n.v, { what: kw });
    m.locals.add(n.v);
    if (this.accept('(')) {
      if (!this.is(')')) do { if (this.peek().t === 'kw' && DIRS.has(this.peek().v)) this.next(); this.skipType(); const a = this.ident('an argument name'); m.locals.add(a.v); } while (this.accept(','));
      this.expect(')');
    }
    this.expect(';');
    const save = this.cur; this.cur = null;
    while (!this.is(end)) {
      if (this.peek().t === 'eof') this.fail(end);
      const t = this.peek();
      if (t.t === 'kw' && (DIRS.has(t.v) || NET_TYPES.has(t.v) || INT_TYPES[t.v] || t.v === 'real' || t.v === 'parameter' || t.v === 'localparam')) {
        this.next(); this.skipType();
        do { const a = this.ident(); m.locals.add(a.v); while (this.is('[')) this.range(); if (this.accept('=')) this.expr(); } while (this.accept(','));
        this.expect(';');
      } else this.statement(m);
    }
    this.next(); this.cur = save;
    if (this.accept(':')) this.ident();
  }
  genFor(m, declare) {
    this.next(); this.expect('(');
    this.accept('genvar');
    const v = this.ident('a genvar'); m.locals.add(v.v); this.expect('='); this.expr(); this.expect(';');
    this.expr(); this.expect(';');
    this.ident(); if (this.is('++') || this.is('--')) this.next(); else { if (['+=', '-='].includes(this.peek().v)) this.next(); else this.expect('='); this.expr(); }
    this.expect(')');
    m.hasGenerate = true;
    this.genBody(m, declare);
  }
  genIf(m, declare) {
    this.next(); this.expect('('); this.uses(m, this.expr()); this.expect(')');
    m.hasGenerate = true;
    this.genBody(m, declare);
    if (this.accept('else')) { if (this.is('if')) this.genIf(m, declare); else this.genBody(m, declare); }
  }
  genBody(m, declare) {
    if (this.accept('begin')) { if (this.accept(':')) m.locals.add(this.ident().v); while (!this.is('end')) { if (this.peek().t === 'eof') this.fail('end'); this.item(m, declare, true); } this.next(); if (this.accept(':')) this.ident(); }
    else this.item(m, declare, true);
  }
  gate(m, inGen) {
    const g = this.next();
    if (this.is('(') && this.peek(1).t === 'kw' && /^(strong|weak|pull|supply|highz)/.test(this.peek(1).v)) { this.skipTo(')'); this.next(); }
    if (this.is('#')) { this.next(); this.delayValue(); }
    do {
      let name = '', nt = g;
      if (this.peek().t === 'id') { nt = this.next(); name = nt.v; if (this.is('[')) this.range(); }
      this.expect('(', '"(" and the gate terminals');
      const conns = [];
      do conns.push({ port: null, expr: this.expr() }); while (this.accept(','));
      this.expect(')');
      m.instances.push({ type: g.v, name, params: [], conns, named: false, gate: true, inGenerate: inGen, line: nt.line, col: nt.col });
    } while (this.accept(','));
    this.expect(';', '";" after a gate');
  }
  instance(m, inGen) {
    const typeTok = this.next(); const params = [];
    if (this.accept('#')) {
      if (this.accept('(')) {
        if (!this.is(')')) do {
          if (this.accept('.')) { const n = this.ident('a parameter name'); this.expect('('); const e = this.is(')') ? null : this.expr(); this.expect(')'); params.push({ name: n.v, expr: e }); }
          else params.push({ name: null, expr: this.expr() });
        } while (this.accept(','));
        this.expect(')');
      } else params.push({ name: null, expr: this.primary() });
    }
    do {
      const nt = this.ident('an instance name');
      let range = null; if (this.is('[')) range = this.range();
      this.expect('(', '"(" and the port connections');
      const conns = []; let named = false;
      if (!this.is(')')) do {
        if (this.is('.') && this.is('*', 1)) { this.next(); this.next(); conns.push({ port: '*', expr: null }); named = true; continue; }
        if (this.accept('.')) {
          named = true; const p = this.ident('a port name');
          if (this.accept('(')) { const e = this.is(')') ? null : this.expr(); this.expect(')', '")" after a port connection'); conns.push({ port: p.v, expr: e, line: p.line, col: p.col }); }
          else conns.push({ port: p.v, expr: { k: 'id', name: p.v, line: p.line, col: p.col }, line: p.line, col: p.col });   // SV .name
        } else if (this.is(',') || this.is(')')) conns.push({ port: null, expr: null });
        else conns.push({ port: null, expr: this.expr() });
      } while (this.accept(','));
      this.expect(')', '")" to close the port connections');
      m.instances.push({ type: typeTok.v, name: nt.v, params, conns, named, gate: false, inGenerate: inGen, range, line: nt.line, col: nt.col, typeLine: typeTok.line, typeCol: typeTok.col });
    } while (this.accept(','));
    this.expect(';', '";" after an instance');
  }

  /* -------- statements */
  statement(m) {
    const t = this.peek();
    if (t.t === 'kw') switch (t.v) {
      case 'begin': {
        this.next(); if (this.accept(':')) m.locals.add(this.ident().v);
        while (!this.is('end')) {
          if (this.peek().t === 'eof') this.fail('end');
          const d = this.peek();
          if (d.t === 'kw' && (NET_TYPES.has(d.v) || INT_TYPES[d.v])) { this.next(); this.skipType(); do { m.locals.add(this.ident().v); if (this.accept('=')) this.expr(); } while (this.accept(',')); this.expect(';'); continue; }
          this.statement(m);
        }
        this.next(); if (this.accept(':')) this.ident(); return;
      }
      case 'fork': { this.next(); while (!this.is('join')) { if (this.peek().t === 'eof') this.fail('join'); this.statement(m); } this.next(); return; }
      case 'unique': case 'priority': this.next(); return this.statement(m);
      case 'if': {
        this.next(); this.expect('(', '"(" after if'); this.read(m, this.expr()); this.expect(')', '")" to close the if condition');
        this.statement(m);
        if (this.accept('else')) this.statement(m);
        return;
      }
      case 'case': case 'casez': case 'casex': {
        this.next(); this.expect('('); this.read(m, this.expr()); this.expect(')');
        while (!this.is('endcase')) {
          if (this.peek().t === 'eof') this.fail('endcase');
          if (this.accept('default')) { this.accept(':'); this.statement(m); continue; }
          do this.read(m, this.expr()); while (this.accept(','));
          this.expect(':', '":" after a case value'); this.statement(m);
        }
        this.next(); return;
      }
      case 'for': {
        this.next(); this.expect('(');
        if (this.peek().t === 'kw' && (INT_TYPES[this.peek().v] || NET_TYPES.has(this.peek().v) || this.is('genvar'))) { this.next(); this.skipType(); }
        const lv = this.lvalue(); this.loopVar(m, lv); this.expect('='); this.read(m, this.expr()); this.expect(';');
        this.read(m, this.expr()); this.expect(';');
        const lv2 = this.lvalue(); this.loopVar(m, lv2);
        if (this.is('++') || this.is('--')) this.next(); else { const op = this.next(); if (!['=', '+=', '-=', '*='].includes(op.v)) this.fail('"=" in the for step', op); this.read(m, this.expr()); }
        this.expect(')'); this.statement(m); return;
      }
      case 'while': case 'repeat': { this.next(); this.expect('('); this.read(m, this.expr()); this.expect(')'); this.statement(m); return; }
      case 'forever': this.next(); this.statement(m); return;
      case 'wait': { this.next(); this.expect('('); this.read(m, this.expr()); this.expect(')'); this.statement(m); return; }
      case 'disable': this.next(); this.ident(); this.expect(';'); return;
      case 'return': this.next(); if (!this.is(';')) this.read(m, this.expr()); this.expect(';'); return;
      case 'break': case 'continue': this.next(); this.expect(';'); return;
      default: break;
    }
    if (this.is('@')) {
      this.next();
      if (this.accept('*')) { /* @* */ }
      else if (this.peek().t === 'id') { this.next(); }
      else {
        this.expect('(');
        if (this.accept('*')) { /* @(*) */ }
        else do {
          let edge = null; if (this.is('posedge') || this.is('negedge')) edge = this.next().v;
          const e = this.expr(); this.read(m, e);
          const base = e.k === 'id' ? e : e.base && e.base.k === 'id' ? e.base : null;
          if (edge && this.cur && !this.cur.edgesDone && base) this.cur.edges.push({ edge, name: base.name });
        } while (this.accept('or') || this.accept(','));
        this.expect(')', '")" to close the event list');
      }
      if (this.cur) this.cur.edgesDone = true;
      this.statement(m); return;
    }
    if (this.is('#')) { this.next(); this.delayValue(); this.statement(m); return; }
    if (this.is('->')) { this.next(); this.ident(); this.expect(';'); return; }
    if (this.accept(';')) return;
    if (t.t === 'sys') { const e = this.primary(); for (const a of e.args) this.read(m, a); this.expect(';', '";" after a system task'); return; }
    if (t.t === 'id' && (this.is('(', 1) || this.is(';', 1))) {        // task call
      this.next(); if (this.accept('(')) { if (!this.is(')')) do this.read(m, this.expr()); while (this.accept(',')); this.expect(')'); }
      this.expect(';'); return;
    }
    if (t.t === 'id' || this.is('{')) {
      const lv = this.lvalue();
      if (this.is('++') || this.is('--')) { this.next(); this.write(m, lv); this.expect(';'); return; }
      const op = this.peek();
      if (!(op.t === 'op' && ['=', '<=', '+=', '-=', '*=', '/=', '&=', '|=', '^=', '<<=', '>>='].includes(op.v))) this.fail('"=" or "<=" in an assignment');
      this.next();
      if (this.is('#')) { this.next(); this.delayValue(); } else if (this.is('@')) { this.next(); this.expect('('); this.skipTo(')'); this.next(); }
      this.write(m, lv); this.read(m, this.expr());
      this.expect(';', '";" after an assignment'); return;
    }
    return this.fail('a statement');
  }
  loopVar(m, lv) { if (lv.k === 'id') m.locals.add(lv.name); }
  read(m, e) { this.uses(m, e, this.cur && this.cur.reads); }
  write(m, lv) {
    const names = []; collectIds(lv, names, true);
    for (const n of names) { if (this.cur) this.cur.writes.add(n.name); m.uses.push({ ...n, write: true }); }
    // indexes inside the lvalue are reads
    const idx = []; collectIndexIds(lv, idx); for (const n of idx) { if (this.cur) this.cur.reads.add(n.name); m.uses.push(n); }
  }
  uses(m, e, into = null) { const ids = []; collectIds(e, ids, false); for (const n of ids) { if (into) into.add(n.name); m.uses.push(n); } }

  finishModule(m) {
    for (const p of m.ports) if (p.name && !p.dir) this.problems.push(row('sem.portdir', 'error', { name: p.name, scope: m.name }, { file: this.file, line: p.line, col: p.col }));
    for (const p of m.ports) if (p.name && !m.nets[p.name]) m.nets[p.name] = { kind: p.kind || 'wire', width: p.width, line: p.line, col: p.col, port: true };
    else if (p.name) m.nets[p.name].port = true;
    for (const p of m.ports) if (p.name && m.nets[p.name].width && !p.width) p.width = m.nets[p.name].width;
    const known = (n) => m.decls.has(n) || m.locals.has(n) || m.nets[n];
    const seen = new Set();
    for (const u of m.uses) {
      if (u.hier || known(u.name) || seen.has(u.name)) continue;
      seen.add(u.name);
      this.problems.push(row('sem.undeclared', 'error', { name: u.name, scope: m.name }, { file: this.file, line: u.line, col: u.col }));
    }
    // implicit one-bit nets: names used only in port connections, gate terminals and assign targets
    const implicit = [];
    for (const inst of m.instances) for (const c of inst.conns) { const ids = []; collectIds(c.expr, ids, false); implicit.push(...ids); }
    for (const a of m.assigns) { const ids = []; collectIds(a.lhs, ids, true); implicit.push(...ids); const r = []; collectIds(a.rhs, r, false); for (const n of r) if (!known(n.name) && !seen.has(n.name) && !n.hier) { seen.add(n.name); this.problems.push(row('sem.undeclared', 'error', { name: n.name, scope: m.name }, { file: this.file, line: n.line, col: n.col })); } }
    for (const n of implicit) {
      if (n.hier || known(n.name) || seen.has(n.name)) continue;
      seen.add(n.name);
      m.nets[n.name] = { kind: 'wire', width: null, implicit: true, line: n.line, col: n.col };
      this.problems.push(row('sem.implicit', 'note', { name: n.name }, { file: this.file, line: n.line, col: n.col }));
    }
    // blocks read and write signals only: drop parameters, loop variables, functions
    const isSignal = (n) => m.nets[n] || (m.decls.get(n) || {}).what === 'port';
    for (const b of m.blocks) { b.reads = b.reads.filter(isSignal); b.writes = b.writes.filter(isSignal); }
    delete m.decls; delete m.uses;
    m.locals = [...m.locals].sort();
  }
}

const intWidth = (n) => ({ msb: { k: 'num', value: n - 1, width: 32 }, lsb: { k: 'num', value: 0, width: 32 } });

/** Identifier references in an expression (lvalue mode: base names of targets only). */
export function collectIds(e, out, lvalue = false) {
  if (!e || typeof e !== 'object') return out;
  switch (e.k) {
    case 'id': out.push({ name: e.name, line: e.line, col: e.col, hier: !!e.hier }); break;
    case 'sel': collectIds(e.base, out, lvalue); if (!lvalue) { collectIds(e.msb, out); collectIds(e.lsb, out); collectIds(e.start, out); collectIds(e.width, out); } break;
    case 'idx': collectIds(e.base, out, lvalue); if (!lvalue) collectIds(e.index, out); break;
    case 'cat': for (const p of e.parts) collectIds(p, out, lvalue); break;
    case 'rep': if (!lvalue) collectIds(e.count, out); for (const p of e.parts) collectIds(p, out, lvalue); break;
    case 'un': collectIds(e.a, out); break;
    case 'bin': collectIds(e.a, out); collectIds(e.b, out); break;
    case 'cond': collectIds(e.c, out); collectIds(e.a, out); collectIds(e.b, out); break;
    case 'call': case 'sys': for (const a of e.args) collectIds(a, out); break;
    default: break;
  }
  return out;
}
function collectIndexIds(e, out) {
  if (!e) return;
  if (e.k === 'sel') { collectIndexIds(e.base, out); collectIds(e.msb, out); collectIds(e.lsb, out); collectIds(e.start, out); collectIds(e.width, out); }
  else if (e.k === 'idx') { collectIndexIds(e.base, out); collectIds(e.index, out); }
  else if (e.k === 'cat') for (const p of e.parts) collectIndexIds(p, out);
}

/** Constant value of an expression with parameter values env {name → number}; null when it is not constant. */
export function evalConst(e, env = {}) {
  if (!e) return null;
  switch (e.k) {
    case 'num': return typeof e.value === 'number' ? e.value : null;
    case 'id': return Object.prototype.hasOwnProperty.call(env, e.name) && typeof env[e.name] === 'number' ? env[e.name] : null;
    case 'un': { const a = evalConst(e.a, env); if (a === null) return null; return e.op === '-' ? -a : e.op === '+' ? a : e.op === '!' ? (a ? 0 : 1) : e.op === '~' ? ~a : null; }
    case 'bin': {
      const a = evalConst(e.a, env), b = evalConst(e.b, env); if (a === null || b === null) return null;
      switch (e.op) {
        case '+': return a + b; case '-': return a - b; case '*': return a * b;
        case '/': return b ? Math.trunc(a / b) : null; case '%': return b ? a % b : null; case '**': return a ** b;
        case '<<': case '<<<': return a * 2 ** b; case '>>': case '>>>': return Math.floor(a / 2 ** b);
        case '&': return a & b; case '|': return a | b; case '^': return a ^ b;
        case '==': case '===': return +(a === b); case '!=': case '!==': return +(a !== b);
        case '<': return +(a < b); case '<=': return +(a <= b); case '>': return +(a > b); case '>=': return +(a >= b);
        case '&&': return +(a && b); case '||': return +(a || b);
        default: return null;
      }
    }
    case 'cond': { const c = evalConst(e.c, env); return c === null ? null : evalConst(c ? e.a : e.b, env); }
    case 'sys': if (e.name === '$clog2' && e.args.length === 1) { const a = evalConst(e.args[0], env); return a === null ? null : a <= 1 ? 0 : Math.ceil(Math.log2(a)); } return null;
    default: return null;
  }
}

/** Parameter values of a module: defaults, then overrides [{name|null, expr}] evaluated in the parent's env. */
export function paramEnv(mod, overrides = [], parentEnv = {}) {
  const env = {}, pub = mod.params.filter((p) => !p.local);
  const given = new Map();
  overrides.forEach((o, i) => { const key = o.name ?? (pub[i] && pub[i].name); if (key) given.set(key, evalConst(o.expr, parentEnv)); });
  for (const p of mod.params) env[p.name] = given.has(p.name) && given.get(p.name) !== null ? given.get(p.name) : evalConst(p.expr, env);
  return env;
}

/** Width in bits of a declared range (null → 1). Returns {width, msb, lsb} or null when not constant. */
export function rangeBits(w, env = {}) {
  if (!w) return { width: 1, msb: 0, lsb: 0, scalar: true };
  const msb = evalConst(w.msb, env), lsb = evalConst(w.lsb, env);
  if (msb === null || lsb === null) return null;
  return { width: Math.abs(msb - lsb) + 1, msb, lsb };
}

export function parseVerilog(text, opts = {}) {
  const file = opts.file || '';
  const lx = tokenize(text, file);
  const problems = [...lx.problems];
  const toks = preprocess(lx.tokens, opts, file, problems);
  const p = new Parser(toks, file, problems);
  const modules = p.file_();
  return { modules, problems: sortRows(problems) };
}

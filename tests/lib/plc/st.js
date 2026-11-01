/* SPDX-License-Identifier: Apache-2.0 */
/**
 * IEC 61131-3 Structured Text: lexer, parser and a static check (0.8 XE.13). Written from the standard's grammar (clause 7 and annex B), not from any product.
 * Supported: PROGRAM / FUNCTION_BLOCK / FUNCTION, VAR blocks (VAR, _INPUT, _OUTPUT, _IN_OUT, _GLOBAL, _TEMP, RETAIN, CONSTANT, AT %address), elementary types,
 * assignment, IF / ELSIF / ELSE, CASE (lists and ranges), FOR (BY), WHILE, REPEAT, EXIT, RETURN, calls with named or positional arguments, member access.
 * Not supported, and named as a problem when met: ARRAY, STRUCT, pointers, REFERENCE, STRING[n] indexing, CLASS/METHOD, SFC bodies, actions.
 */
export function problem(id, severity, message, extra = {}) { return { id: 'plc:' + id, severity, message, source: { kind: 'engine', engine: 'cc-plc' }, ...extra }; }

export const INT_TYPES = { SINT: [8, true], INT: [16, true], DINT: [32, true], LINT: [64, true], USINT: [8, false], UINT: [16, false], UDINT: [32, false], ULINT: [64, false], BYTE: [8, false], WORD: [16, false], DWORD: [32, false], LWORD: [64, false] };
export const REAL_TYPES = ['REAL', 'LREAL'];
export const ELEMENTARY = ['BOOL', ...Object.keys(INT_TYPES), ...REAL_TYPES, 'TIME', 'STRING', 'DATE', 'TOD', 'DT'];
const KEYWORDS = new Set(['PROGRAM', 'END_PROGRAM', 'FUNCTION_BLOCK', 'END_FUNCTION_BLOCK', 'FUNCTION', 'END_FUNCTION', 'VAR', 'VAR_INPUT', 'VAR_OUTPUT', 'VAR_IN_OUT', 'VAR_GLOBAL', 'VAR_TEMP', 'VAR_EXTERNAL', 'END_VAR', 'RETAIN', 'CONSTANT', 'AT', 'IF', 'THEN', 'ELSIF', 'ELSE', 'END_IF', 'CASE', 'OF', 'END_CASE', 'FOR', 'TO', 'BY', 'DO', 'END_FOR', 'WHILE', 'END_WHILE', 'REPEAT', 'UNTIL', 'END_REPEAT', 'EXIT', 'RETURN', 'AND', 'OR', 'XOR', 'NOT', 'MOD', 'TRUE', 'FALSE', 'ARRAY', 'STRUCT', 'TYPE', 'END_TYPE', 'METHOD', 'CLASS', 'ACTION', 'POINTER', 'REF_TO']);

class StError extends Error { constructor(msg, line, col) { super(msg); this.line = line; this.col = col; } }

/** Time literal T#1d2h3m4s5ms (also negative, fractional last unit) → milliseconds. */
export function parseTime(text) {
  const m = /^(?:T|TIME)#(-)?((?:\d+(?:\.\d+)?(?:d|h|ms|m|s|us|ns)_?)+)$/i.exec(text);
  if (!m) return null;
  const unit = { d: 864e5, h: 36e5, m: 6e4, s: 1e3, ms: 1, us: 1e-3, ns: 1e-6 };
  let t = 0; const re = /(\d+(?:\.\d+)?)(d|h|ms|m|s|us|ns)/gi; let x;
  while ((x = re.exec(m[2]))) t += parseFloat(x[1]) * unit[x[2].toLowerCase()];
  return m[1] ? -t : t;
}

export function lex(src) {
  const toks = []; let i = 0, line = 1, col = 1; const n = src.length;
  const adv = (k = 1) => { for (let j = 0; j < k; j++) { if (src[i] === '\n') { line++; col = 1; } else col++; i++; } };
  while (i < n) {
    const c = src[i];
    if (/\s/.test(c)) { adv(); continue; }
    if (c === '(' && src[i + 1] === '*') { const l = line, cl = col; const e = src.indexOf('*)', i + 2); if (e < 0) throw new StError('Comment (* is never closed', l, cl); adv(e + 2 - i); continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') adv(); continue; }
    const t = { line, col };
    if (/[A-Za-z_]/.test(c)) {
      let j = i; while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
      let word = src.slice(i, j);
      if (src[j] === '#') {   // typed literal: T#…, TIME#…, INT#5, 16#FF (digits handled below)
        let k = j + 1; while (k < n && /[A-Za-z0-9_.+\-]/.test(src[k])) { if ((src[k] === '+' || src[k] === '-') && !/[eE]/.test(src[k - 1])) break; k++; }
        if (src[j + 1] === '-' ) { k = j + 2; while (k < n && /[A-Za-z0-9_.]/.test(src[k])) k++; }
        const lit = src.slice(i, k), up = word.toUpperCase();
        if (up === 'T' || up === 'TIME') { const v = parseTime(lit); if (v === null) throw new StError('Bad time literal ' + lit, line, col); toks.push({ ...t, k: 'time', v }); adv(k - i); continue; }
        if (up in INT_TYPES || REAL_TYPES.includes(up) || up === 'BOOL') { toks.push({ ...t, k: 'tnum', type: up, v: src.slice(j + 1, k).replace(/_/g, '') }); adv(k - i); continue; }
        throw new StError('Unknown literal prefix ' + word + '#', line, col);
      }
      adv(j - i); const up = word.toUpperCase();
      toks.push({ ...t, k: KEYWORDS.has(up) ? 'kw' : 'id', v: up, raw: word }); continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i; while (j < n && /[0-9_]/.test(src[j])) j++;
      if (src[j] === '#') {   // based literal 16#FF, 2#1010, 8#17
        const base = parseInt(src.slice(i, j).replace(/_/g, ''), 10); let k = j + 1; while (k < n && /[0-9A-Fa-f_]/.test(src[k])) k++;
        if (![2, 8, 16].includes(base)) throw new StError('Base ' + base + ' is not 2, 8 or 16', line, col);
        const v = parseInt(src.slice(j + 1, k).replace(/_/g, ''), base); if (!Number.isFinite(v)) throw new StError('Bad based literal', line, col);
        adv(k - i); toks.push({ ...t, k: 'num', v, int: true }); continue;
      }
      let isReal = false;
      if (src[j] === '.' && /[0-9]/.test(src[j + 1] || '')) { isReal = true; j++; while (j < n && /[0-9_]/.test(src[j])) j++; }
      if (/[eE]/.test(src[j] || '') && /[0-9+\-]/.test(src[j + 1] || '')) { isReal = true; j += 2; while (j < n && /[0-9]/.test(src[j])) j++; }
      toks.push({ ...t, k: 'num', v: parseFloat(src.slice(i, j).replace(/_/g, '')), int: !isReal }); adv(j - i); continue;
    }
    if (c === "'") {
      let j = i + 1, s = ''; while (j < n && src[j] !== "'") { if (src[j] === '$') { const e = src[j + 1]; s += e === 'N' || e === 'n' ? '\n' : e === 'T' || e === 't' ? '\t' : e === 'R' || e === 'r' ? '\r' : e; j += 2; } else s += src[j++]; }
      if (j >= n) throw new StError('String is never closed', line, col);
      adv(j + 1 - i); toks.push({ ...t, k: 'str', v: s }); continue;
    }
    if (c === '%') { let j = i + 1; while (j < n && /[A-Za-z0-9_.]/.test(src[j])) j++; toks.push({ ...t, k: 'addr', v: src.slice(i, j).toUpperCase() }); adv(j - i); continue; }
    const three = src.slice(i, i + 2), ops2 = [':=', '=>', '<>', '<=', '>=', '**', '..'];
    if (ops2.includes(three)) { toks.push({ ...t, k: 'op', v: three }); adv(2); continue; }
    if ('()[],;:.+-*/=<>&^'.includes(c)) { toks.push({ ...t, k: 'op', v: c }); adv(); continue; }
    throw new StError('Unexpected character ' + JSON.stringify(c), line, col);
  }
  toks.push({ k: 'eof', line, col });
  return toks;
}

const VAR_KINDS = { VAR: 'local', VAR_INPUT: 'input', VAR_OUTPUT: 'output', VAR_IN_OUT: 'inout', VAR_GLOBAL: 'global', VAR_TEMP: 'temp', VAR_EXTERNAL: 'external' };

export class Parser {
  constructor(toks) { this.t = toks; this.i = 0; }
  get cur() { return this.t[this.i]; }
  err(msg, tok = this.cur) { return new StError(msg, tok.line, tok.col); }
  is(k, v) { const c = this.cur; return c.k === k && (v === undefined || c.v === v); }
  isKw(v) { return this.is('kw', v); }
  isOp(v) { return this.is('op', v); }
  eat(k, v) { if (!this.is(k, v)) throw this.err('Expected ' + (v || k) + ', found ' + (this.cur.k === 'eof' ? 'the end of the file' : JSON.stringify(this.cur.raw || this.cur.v))); return this.t[this.i++]; }
  kw(v) { return this.eat('kw', v); }
  op(v) { return this.eat('op', v); }
  maybe(k, v) { if (this.is(k, v)) { this.i++; return true; } return false; }
  ident() { if (this.cur.k === 'id') return this.t[this.i++]; throw this.err('Expected a name, found ' + JSON.stringify(this.cur.raw || this.cur.v)); }

  file() {
    const pous = [], globals = [], problems = [];
    while (!this.is('eof')) {
      const start = this.i;
      try {
        if (this.isKw('VAR_GLOBAL')) { globals.push(...this.varBlock()); continue; }
        if (this.isKw('TYPE') || this.isKw('CLASS')) throw this.err(this.cur.v + ' declarations are not supported');
        pous.push(this.pou());
      } catch (e) {
        if (!(e instanceof StError)) throw e;
        problems.push(problem('syntax', 'error', e.message, { line: e.line, col: e.col }));
        if (this.i === start) this.i++;
        while (!this.is('eof') && !(this.cur.k === 'kw' && ['PROGRAM', 'FUNCTION_BLOCK', 'FUNCTION', 'VAR_GLOBAL'].includes(this.cur.v))) this.i++;
      }
    }
    return { pous, globals, problems };
  }
  pou() {
    const kinds = { PROGRAM: 'program', FUNCTION_BLOCK: 'functionBlock', FUNCTION: 'function' };
    const k = this.cur; if (k.k !== 'kw' || !kinds[k.v]) throw this.err('Expected PROGRAM, FUNCTION_BLOCK or FUNCTION');
    this.i++; const name = this.ident(); let ret = null;
    if (k.v === 'FUNCTION') { this.op(':'); ret = this.typeRef(); }
    const vars = []; while (this.cur.k === 'kw' && VAR_KINDS[this.cur.v]) vars.push(...this.varBlock());
    const body = this.stmts(['END_' + k.v]); this.kw('END_' + k.v);
    return { type: kinds[k.v], name: name.raw, line: name.line, ret, vars, body: { kind: 'ST', stmts: body } };
  }
  typeRef() {
    const t = this.cur;
    if (t.k === 'kw' && (t.v === 'ARRAY' || t.v === 'STRUCT' || t.v === 'POINTER' || t.v === 'REF_TO')) throw this.err(t.v + ' is not supported yet', t);
    const id = this.ident();
    if (id.v === 'STRING' || id.v === 'WSTRING') { if (this.isOp('[') || this.isOp('(')) { const close = this.isOp('[') ? ']' : ')'; this.i++; this.eat('num'); this.op(close); } }
    return id.v;
  }
  varBlock() {
    const head = this.cur; this.i++; const kind = VAR_KINDS[head.v]; let retain = false, constant = false;
    while (this.isKw('RETAIN') || this.isKw('CONSTANT')) { if (this.cur.v === 'RETAIN') retain = true; else constant = true; this.i++; }
    const out = [];
    while (!this.isKw('END_VAR')) {
      const names = [this.ident()]; while (this.maybe('op', ',')) names.push(this.ident());
      let addr = null; if (this.maybe('kw', 'AT')) addr = this.eat('addr').v;
      this.op(':'); const type = this.typeRef(); let init = null;
      if (this.maybe('op', ':=')) init = this.expr();
      this.op(';');
      for (const n of names) out.push({ name: n.raw, key: n.v, type, kind, retain, constant, addr, init, line: n.line });
    }
    this.kw('END_VAR'); return out;
  }
  stmts(stops) {
    const out = [];
    while (!(this.cur.k === 'kw' && stops.includes(this.cur.v)) && !this.is('eof')) { const s = this.stmt(); if (s) out.push(s); }
    return out;
  }
  stmt() {
    const t = this.cur, base = { line: t.line, col: t.col };
    if (this.maybe('op', ';')) return null;
    if (t.k === 'kw') {
      switch (t.v) {
        case 'IF': {
          this.i++; const arms = []; let cond = this.expr(); this.kw('THEN');
          arms.push({ cond, body: this.stmts(['ELSIF', 'ELSE', 'END_IF']) }); let els = null;
          while (this.isKw('ELSIF')) { this.i++; cond = this.expr(); this.kw('THEN'); arms.push({ cond, body: this.stmts(['ELSIF', 'ELSE', 'END_IF']) }); }
          if (this.maybe('kw', 'ELSE')) els = this.stmts(['END_IF']);
          this.kw('END_IF'); this.maybe('op', ';'); return { ...base, k: 'if', arms, els };
        }
        case 'CASE': {
          this.i++; const sel = this.expr(); this.kw('OF'); const arms = []; let els = null;
          while (!this.isKw('ELSE') && !this.isKw('END_CASE')) {
            const labels = [];
            do { const a = this.expr(); if (this.maybe('op', '..')) labels.push({ from: a, to: this.expr() }); else labels.push({ from: a, to: null }); } while (this.maybe('op', ','));
            this.op(':'); const body = [];
            while (!this.isKw('ELSE') && !this.isKw('END_CASE') && !this.caseLabelAhead()) { const s = this.stmt(); if (s) body.push(s); }
            arms.push({ labels, body });
          }
          if (this.maybe('kw', 'ELSE')) els = this.stmts(['END_CASE']);
          this.kw('END_CASE'); this.maybe('op', ';'); return { ...base, k: 'case', sel, arms, els };
        }
        case 'FOR': {
          this.i++; const v = this.ident(); this.op(':='); const from = this.expr(); this.kw('TO'); const to = this.expr(); let by = null;
          if (this.maybe('kw', 'BY')) by = this.expr();
          this.kw('DO'); const body = this.stmts(['END_FOR']); this.kw('END_FOR'); this.maybe('op', ';'); return { ...base, k: 'for', v: v.v, from, to, by, body };
        }
        case 'WHILE': { this.i++; const cond = this.expr(); this.kw('DO'); const body = this.stmts(['END_WHILE']); this.kw('END_WHILE'); this.maybe('op', ';'); return { ...base, k: 'while', cond, body }; }
        case 'REPEAT': { this.i++; const body = this.stmts(['UNTIL']); this.kw('UNTIL'); const cond = this.expr(); this.kw('END_REPEAT'); this.maybe('op', ';'); return { ...base, k: 'repeat', cond, body }; }
        case 'EXIT': this.i++; this.maybe('op', ';'); return { ...base, k: 'exit' };
        case 'RETURN': this.i++; this.maybe('op', ';'); return { ...base, k: 'return' };
        default: throw this.err('Unexpected ' + t.v);
      }
    }
    if (t.k !== 'id') throw this.err('A statement starts with a name, IF, CASE, FOR, WHILE or REPEAT');
    const target = this.primary(true);
    if (this.maybe('op', ':=')) { const value = this.expr(); this.op(';'); if (target.k !== 'var' && target.k !== 'mem') throw this.err('Cannot assign to this', t); return { ...base, k: 'assign', target, value }; }
    if (target.k === 'call') { this.op(';'); return { ...base, k: 'callstmt', call: target }; }
    throw this.err('Expected := or a call after ' + (t.raw || t.v));
  }
  caseLabelAhead() {   // "<const>[, <const>|a..b] :" at the start of the next arm
    let j = this.i, depth = 0;
    for (; j < this.t.length; j++) {
      const x = this.t[j];
      if (x.k === 'eof' || x.k === 'kw' && ['IF', 'FOR', 'WHILE', 'REPEAT', 'CASE', 'ELSE', 'END_CASE', 'EXIT', 'RETURN'].includes(x.v)) return false;
      if (x.k === 'op' && x.v === '(') depth++; else if (x.k === 'op' && x.v === ')') depth--;
      else if (x.k === 'op' && x.v === ':=') return false;
      else if (x.k === 'op' && x.v === ';') return false;
      else if (x.k === 'op' && x.v === ':' && depth === 0) return true;
    }
    return false;
  }
  // expression precedence, high → low: ** · unary - NOT · * / MOD · + - · < > <= >= · = <> · AND & · XOR · OR
  expr() { return this.orE(); }
  orE() { let a = this.xorE(); while (this.isKw('OR')) { const t = this.t[this.i++]; a = { k: 'bin', op: 'OR', a, b: this.xorE(), line: t.line, col: t.col }; } return a; }
  xorE() { let a = this.andE(); while (this.isKw('XOR')) { const t = this.t[this.i++]; a = { k: 'bin', op: 'XOR', a, b: this.andE(), line: t.line, col: t.col }; } return a; }
  andE() { let a = this.eqE(); while (this.isKw('AND') || this.isOp('&')) { const t = this.t[this.i++]; a = { k: 'bin', op: 'AND', a, b: this.eqE(), line: t.line, col: t.col }; } return a; }
  eqE() { let a = this.cmpE(); while (this.isOp('=') || this.isOp('<>')) { const t = this.t[this.i++]; a = { k: 'bin', op: t.v, a, b: this.cmpE(), line: t.line, col: t.col }; } return a; }
  cmpE() { let a = this.addE(); while (['<', '>', '<=', '>='].some((o) => this.isOp(o))) { const t = this.t[this.i++]; a = { k: 'bin', op: t.v, a, b: this.addE(), line: t.line, col: t.col }; } return a; }
  addE() { let a = this.mulE(); while (this.isOp('+') || this.isOp('-')) { const t = this.t[this.i++]; a = { k: 'bin', op: t.v, a, b: this.mulE(), line: t.line, col: t.col }; } return a; }
  mulE() { let a = this.unE(); while (this.isOp('*') || this.isOp('/') || this.isKw('MOD')) { const t = this.t[this.i++]; a = { k: 'bin', op: t.v, a, b: this.unE(), line: t.line, col: t.col }; } return a; }
  unE() {
    if (this.isOp('-')) { const t = this.t[this.i++]; const nx = this.cur; if (nx.k === 'num' || nx.k === 'time') { /* literal sign folds into **-less form below */ } return { k: 'un', op: '-', a: this.unE(), line: t.line, col: t.col }; }
    if (this.isOp('+')) { this.i++; return this.unE(); }
    if (this.isKw('NOT')) { const t = this.t[this.i++]; return { k: 'un', op: 'NOT', a: this.unE(), line: t.line, col: t.col }; }
    return this.powE();
  }
  powE() { const a = this.primary(); if (this.isOp('**')) { const t = this.t[this.i++]; return { k: 'bin', op: '**', a, b: this.unE(), line: t.line, col: t.col }; } return a; }
  primary(lvalue = false) {
    const t = this.cur, base = { line: t.line, col: t.col };
    if (t.k === 'num') { this.i++; return { ...base, k: 'num', v: t.v, int: t.int }; }
    if (t.k === 'tnum') { this.i++; const v = t.type === 'BOOL' ? /^(1|true)$/i.test(t.v) : Number(t.v); return t.type === 'BOOL' ? { ...base, k: 'bool', v } : { ...base, k: 'num', v, int: t.type in INT_TYPES, type: t.type }; }
    if (t.k === 'time') { this.i++; return { ...base, k: 'time', v: t.v }; }
    if (t.k === 'str') { this.i++; return { ...base, k: 'str', v: t.v }; }
    if (t.k === 'addr') { this.i++; return { ...base, k: 'addr', v: t.v }; }
    if (t.k === 'kw' && (t.v === 'TRUE' || t.v === 'FALSE')) { this.i++; return { ...base, k: 'bool', v: t.v === 'TRUE' }; }
    if (this.isOp('(')) { this.i++; const e = this.expr(); this.op(')'); return e; }
    if (t.k === 'id') {
      this.i++; let node = { ...base, k: 'var', name: t.v, raw: t.raw };
      if (this.isOp('(')) {
        this.i++; const args = [];
        if (!this.isOp(')')) do {
          if (this.cur.k === 'id' && (this.t[this.i + 1].v === ':=' || this.t[this.i + 1].v === '=>') && this.t[this.i + 1].k === 'op') { const n = this.t[this.i++], o = this.t[this.i++].v; args.push({ name: n.v, out: o === '=>', value: this.expr() }); }
          else args.push({ name: null, out: false, value: this.expr() });
        } while (this.maybe('op', ','));
        this.op(')'); node = { ...base, k: 'call', name: t.v, raw: t.raw, args };
      }
      while (this.isOp('.')) { this.i++; const m = this.ident(); node = { line: m.line, col: m.col, k: 'mem', obj: node, name: m.v, raw: m.raw }; }
      if (this.isOp('[')) throw this.err('Array indexing is not supported yet');
      return node;
    }
    throw this.err('Expected a value, found ' + (t.k === 'eof' ? 'the end of the file' : JSON.stringify(t.raw || t.v)));
  }
}

/** Parse ST source → {pous, globals, problems}. */
export function parseST(src) {
  let toks; try { toks = lex(String(src)); } catch (e) { if (e instanceof StError) return { pous: [], globals: [], problems: [problem('syntax', 'error', e.message, { line: e.line, col: e.col })] }; throw e; }
  return new Parser(toks).file();
}
/** Parse a bare list of statements (a PLCopen ST body, with its variables declared elsewhere). */
export function parseBody(src) {
  try { const p = new Parser(lex(String(src))); const stmts = p.stmts([]); if (!p.is('eof')) throw p.err('Unexpected ' + (p.cur.raw || p.cur.v)); return { stmts, problems: [] }; }
  catch (e) { if (e instanceof StError) return { stmts: [], problems: [problem('syntax', 'error', e.message, { line: e.line, col: e.col })] }; throw e; }
}

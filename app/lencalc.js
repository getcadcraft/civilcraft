/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lencalc.js — arithmetic over typed lengths (0.6 DF.3, Jame on Discord: "4+7/16" instead of 4.4375). Import-free and
 * DOM-free: the canonical file is cadcraft/dev/lencalc.js; TakeoffCraft, DetailCraft, CivilCraft and MarkupCraft keep
 * byte-identical copies (`node tools/lencalc/sync.mjs [--check] [app…]`; never edit a copy). Each app reads the lengths
 * themselves with its own parser and hands it in as `atom`.
 *
 *   calc(src, atom, opt) → { ok: true, value, unit (0 a plain number | 1 a length), plain (one length, no arithmetic) }
 *                        | { ok: false, code, pos (0-based character), text }
 *     atom(text) → { value, unit: true | false } | null     one length as the app reads it ("12'6\"", "3/4\"", "450mm", "6")
 *     opt: { maxLength = 500, maxDepth = 50, plain = 1 }   plain: what one plain number is in the length's unit when it is
 *          used as a length (added to one, or the whole answer): TakeoffCraft's bare numbers are in the default unit
 *   hasArithmetic(src) → does the text hold an operator a plain length never has (callers keep their own fast path)
 *   CALC_ERRORS: the codes — char (that character has no place here), end (the text ends too soon), paren (a "(" is not
 *                closed), extra (something after the end), length (`text` is not a length), divide (by zero), deep (too
 *                many brackets), long (too long), area (two lengths multiplied: an area, not a length), ratio (a plain
 *                number divided by a length), function (unknown function), number (not a finite number)
 *
 *   expr    := term (('+' | '-') term)*
 *   term    := unary (('*' | '/') unary)*
 *   unary   := ('-' | '+') unary | primary
 *   primary := length | name '(' expr ')' | '(' expr ')'
 *
 * The rules of TakeoffCraft's formula.js: never eval / Function, functions only from a null-prototype table (abs, round,
 * ceil, floor: they keep the unit), a depth limit, and a refusal that says where (never a quiet 0). × ÷ − – are read as
 * * / - -. A bare number is a length in drawing units when it is added to a length (12'6" + 3 = 12'9" in an inch drawing)
 * and a plain factor when it multiplies or divides one (2*450mm, (24'-0")/3).
 *
 * Where a length's own marks and the operators meet, the length wins:
 *   - between a whole number and a fraction, with no spaces, is the length's own dash: 4-7/16 = 4 7/16, 6-1/2
 *   - right after a foot mark, with no space, too: 12'-6" = 12'6"; type 24' - 6" (spaces) to subtract
 *   / between two whole numbers with no spaces is a fraction: 3/4", 7/16 (the same value as dividing)
 *   + - after the e of a number written with an exponent: 1.5e-3
 *   spaces inside a length stay inside it: 4 7/16, 12' 6 1/2", 3 ft 6 in
 */

const MINUS = new Set(['-', '−', '–']);
const OPS = new Set(['+', '*', '/', '(', ')', '×', '÷', ...MINUS]);
const op = (c) => (c === '×' ? '*' : c === '÷' ? '/' : MINUS.has(c) ? '-' : c);

const FUNCS = Object.assign(Object.create(null), {
  abs: Math.abs,
  round: (x) => (x < 0 ? -Math.floor(-x + 0.5) : Math.floor(x + 0.5)),
  ceil: (x) => Math.ceil(x - 1e-9 * Math.max(1, Math.abs(x))),
  floor: (x) => Math.floor(x + 1e-9 * Math.max(1, Math.abs(x))),
});

export const CALC_ERRORS = Object.freeze(['char', 'end', 'paren', 'extra', 'length', 'divide', 'deep', 'long', 'area', 'ratio', 'function', 'number']);

class CalcError extends Error { constructor(code, pos, text = '') { super(code); this.code = code; this.pos = pos; this.text = text; } }

/** Does the text hold arithmetic a single length never has? (A leading sign does not count.) */
export function hasArithmetic(src) {
  const s = String(src ?? '').trim().replace(/^[-+−–]\s*/, '');
  if (/[*×÷()]/.test(s)) return true;
  try { return tokenize(s).filter((k) => k.t !== 'end').length > 1; } catch { return false; }
}

/** Split into lengths ('len', its text as typed) and operators, by the rules in the header. */
function tokenize(src) {
  const out = [];
  const n = src.length;
  let i = 0, operand = true;   // operand: a length, a function, '(' or a sign may come next
  while (i < n) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (operand && (c === '+' || MINUS.has(c))) { out.push({ t: 'sign', v: op(c), pos: i }); i++; continue; }
    if (operand) {
      const f = /^([A-Za-z_][A-Za-z0-9_]*)\s*\(/.exec(src.slice(i));
      if (f && FUNCS[f[1].toLowerCase()]) { out.push({ t: 'fn', v: f[1].toLowerCase(), pos: i }); i += f[0].length - 1; continue; }
      if (f && !/^(mm|cm|m|in|ft|inch|inches|feet|foot)$/i.test(f[1])) throw new CalcError('function', i, f[1]);
    }
    if (c === '(' || c === ')' || c === '*' || c === '×' || c === '/' || c === '÷' || c === '+' || MINUS.has(c)) {
      if (operand && c !== '(') throw new CalcError('char', i, c);
      out.push({ t: op(c), pos: i }); i++;
      operand = c !== ')';
      continue;
    }
    if (!operand) throw new CalcError('char', i, c);
    // a length: up to the next operator that is not one of its own marks
    const start = i;
    let j = i;
    while (j < n) {
      const d = src[j], prev = src[j - 1] || '', next = src[j + 1] || '';
      if (d === '(' || d === ')' || d === '*' || d === '×' || d === '÷') break;
      if (d === '+' || MINUS.has(d)) {
        if (/[eE]/.test(prev) && /\d/.test(src[j - 2] || '') && /\d/.test(next)) { j++; continue; }        // 1.5e-3
        if (MINUS.has(d) && /\d/.test(prev) && /^\d+\/\d+/.test(src.slice(j + 1))) { j++; continue; }    // 6-1/2
        if (MINUS.has(d) && prev === "'" && /[\d.]/.test(next)) { j++; continue; }                         // 12'-6"
        break;
      }
      if (d === '/' || d === '÷') {
        if (d === '/' && /(^|[^\d.])\d+$/.test(src.slice(start, j)) && /[1-9]/.test(next)) { j++; continue; }   // 3/4
        break;
      }
      j++;
    }
    const text = src.slice(start, j).trimEnd();
    out.push({ t: 'len', v: text, pos: start });
    i = start + text.length;
    operand = false;
  }
  out.push({ t: 'end', pos: n });
  return out;
}

export function calc(src, atom, { maxLength = 500, maxDepth = 50, plain = 1 } = {}) {
  const s = String(src ?? '');
  try {
    if (s.length > maxLength) throw new CalcError('long', maxLength);
    const toks = tokenize(s);
    let k = 0, depth = 0;
    const peek = () => toks[k];
    const enter = (pos) => { if (++depth > maxDepth) throw new CalcError('deep', pos); };
    const fin = (v, pos) => { if (!Number.isFinite(v)) throw new CalcError('number', pos); return v; };

    function expr() {
      let a = term();
      while (peek().t === '+' || peek().t === '-') {
        const o = toks[k++], b = term();
        const av = a.u < b.u ? a.v * plain : a.v, bv = b.u < a.u ? b.v * plain : b.v;   // a plain number added to a length is one
        a = { v: fin(o.t === '+' ? av + bv : av - bv, o.pos), u: Math.max(a.u, b.u) };
      }
      return a;
    }
    function term() {
      let a = unary();
      while (peek().t === '*' || peek().t === '/') {
        const o = toks[k++], b = unary();
        if (o.t === '/' && b.v === 0) throw new CalcError('divide', o.pos);
        const u = o.t === '*' ? a.u + b.u : a.u - b.u;
        if (u > 1) throw new CalcError('area', o.pos);
        if (u < 0) throw new CalcError('ratio', o.pos);
        a = { v: fin(o.t === '*' ? a.v * b.v : a.v / b.v, o.pos), u };
      }
      return a;
    }
    function unary() {
      const x = peek();
      if (x.t === 'sign') { k++; enter(x.pos); const a = unary(); depth--; return { ...a, v: x.v === '-' ? -a.v : a.v }; }
      return primary();
    }
    function primary() {
      const x = toks[k++];
      if (x.t === 'len') {
        const r = atom(x.v);
        if (!r || !Number.isFinite(r.value)) throw new CalcError('length', x.pos, x.v);
        return { v: r.value, u: r.unit ? 1 : 0 };
      }
      if (x.t === 'fn') {
        enter(x.pos);
        const open = toks[k++];
        if (!open || open.t !== '(') throw new CalcError('char', open?.pos ?? x.pos);
        const a = expr();
        if (peek().t !== ')') throw new CalcError(peek().t === 'end' ? 'paren' : 'char', peek().pos, s[peek().pos] || '');
        k++; depth--;
        return { v: fin(FUNCS[x.v](a.v), x.pos), u: a.u };
      }
      if (x.t === '(') {
        enter(x.pos);
        const a = expr();
        if (peek().t !== ')') throw new CalcError(peek().t === 'end' ? 'paren' : 'char', peek().pos, s[peek().pos] || '');
        k++; depth--;
        return a;
      }
      if (x.t === 'end') throw new CalcError('end', x.pos);
      throw new CalcError('char', x.pos, s[x.pos] || '');
    }

    if (toks.length === 1) throw new CalcError('end', 0);
    const r = expr();
    if (peek().t !== 'end') throw new CalcError('extra', peek().pos, s[peek().pos] || '');
    const single = toks.length === 2 || (toks.length === 3 && toks[0].t === 'sign');
    return { ok: true, value: fin(r.u ? r.v : r.v * plain, 0), unit: r.u, plain: single };
  } catch (err) {
    if (err instanceof CalcError) return { ok: false, code: err.code, pos: err.pos, text: err.text };
    throw err;
  }
}

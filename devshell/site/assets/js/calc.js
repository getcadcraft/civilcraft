/* SPDX-License-Identifier: Apache-2.0 */
/**
 * calc.js — calc sheets (0.8 round 2, EG.18): live, unit-aware calculations that are saved in the app's own file and can read
 * and drive the app's parameters. DOM-free, no imports (the units table is handed in), tested in Node (bin/test-calc.mjs).
 * The shell's UI is app-calc.js; this file is the engine and the assistants' tools.
 *
 *   const calcs = createCalcs({ units, params, step })
 *     units   the build's unit-table.js namespace (lib/units); without it only the built-in lengths are known
 *     params  the app's parameters: { get(name) → number | { value, unit } | null, set(name, value, unit) → boolean, list() → [name] }
 *     step    (label, fn) → fn() as the app's ONE undo step (assistants' edits)
 *
 * A document is sheets of rows. A row is a name, an expression and an optional display unit:
 *     span   = 6 m                       lengths, areas, volumes, angles come from the units table (12 ft + 6 in)
 *     w      = 5 kN/m                    force, pressure, mass, time, energy, power, current, voltage are built in
 *     M      = w * span^2 / 8            dimensions are tracked: 3 m + 2 kN is an error that says what it found
 *     Mmax   = M to kN m                 `to` converts (and checks the dimension); a row's `unit` field does the same for its answer
 *     depth  = @Depth                    @Name (or @"Name with spaces") reads a parameter of the app
 *     ok     = M <= 40 kN m              comparisons give 1 or 0 (shown true / false);  if(c, a, b)
 * Names: letters, digits, underscore; they may shadow a unit (`h`, `d`, `t`, `g`), but a unit written right after a number is always
 * a unit (`5 kN/m`). Across sheets: `beams.span` (sheet id, dot, name). Functions: sqrt abs min max round floor ceil sin cos tan asin
 * acos atan atan2 ln log10 exp pow if. Constants: pi, e, g0 (9.80665 m/s²).
 * A row can DRIVE a parameter: drives[] = { row: 'sheet.name', param, unit } → apply() sets it through params.set when it changes.
 * Cycles are found across rows AND parameters (a row reading @Width while another row drives Width from it).
 *
 * save() → plain JSON for the app's file (format cadcraft-calcs v1); load(json) cleans it (a file is untrusted).
 */

export const FORMAT = 'cadcraft-calcs';
export const LIMITS = Object.freeze({ sheets: 40, rows: 200, expr: 400, name: 40, title: 80, note: 400, drives: 100, id: 40 });

// ---- dimensions: [length, mass, time, current, temperature difference] ----
const D0 = [0, 0, 0, 0, 0];
const dim = (l = 0, m = 0, t = 0, i = 0, k = 0) => [l, m, t, i, k];
const same = (a, b) => a.every((x, i) => Math.abs(x - b[i]) < 1e-9);
const isZero = (a) => a.every((x) => Math.abs(x) < 1e-9);
const dmul = (a, b) => a.map((x, i) => x + b[i]);
const ddiv = (a, b) => a.map((x, i) => x - b[i]);
const dpow = (a, p) => a.map((x) => x * p);

const NAMED = [
  [dim(1), 'm', 'length'], [dim(2), 'm²', 'area'], [dim(3), 'm³', 'volume'], [dim(0, 1), 'kg', 'mass'], [dim(0, 0, 1), 's', 'time'],
  [dim(1, 1, -2), 'N', 'force'], [dim(-1, 1, -2), 'Pa', 'pressure'], [dim(2, 1, -2), 'J', 'energy'], [dim(2, 1, -3), 'W', 'power'],
  [dim(1, 0, -1), 'm/s', 'speed'], [dim(1, 0, -2), 'm/s²', 'acceleration'], [dim(0, 0, 0, 1), 'A', 'current'], [dim(2, 1, -3, -1), 'V', 'voltage'],
  [dim(0, 0, 0, 0, 1), 'K', 'temperature difference'], [dim(-3, 1), 'kg/m³', 'density'], [dim(1, 1, -2).map((x, i) => (i === 0 ? 1 : x)), 'N', 'force'],
  [dim(1, 1, -2).map((x, i) => (i === 0 ? 0 : x)), '', ''],
].filter((r) => r[1]);
const NAME_OF = (d) => { const r = NAMED.find((n) => same(n[0], d)); return r ? r[2] : null; };

// Built-in derived units: id → [factor to SI, dimension]. Length, area, volume and angle come from the units table.
const SI = {
  kg: [1, dim(0, 1)], g: [1e-3, dim(0, 1)], mg: [1e-6, dim(0, 1)], t: [1000, dim(0, 1)], tonne: [1000, dim(0, 1)], lb: [0.45359237, dim(0, 1)], lbs: [0.45359237, dim(0, 1)], oz: [0.028349523125, dim(0, 1)],
  s: [1, dim(0, 0, 1)], ms: [1e-3, dim(0, 0, 1)], min: [60, dim(0, 0, 1)], h: [3600, dim(0, 0, 1)], hr: [3600, dim(0, 0, 1)], d: [86400, dim(0, 0, 1)], day: [86400, dim(0, 0, 1)], wk: [604800, dim(0, 0, 1)],
  N: [1, dim(1, 1, -2)], kN: [1e3, dim(1, 1, -2)], MN: [1e6, dim(1, 1, -2)], lbf: [4.4482216152605, dim(1, 1, -2)], kip: [4448.2216152605, dim(1, 1, -2)], kgf: [9.80665, dim(1, 1, -2)],
  Pa: [1, dim(-1, 1, -2)], kPa: [1e3, dim(-1, 1, -2)], MPa: [1e6, dim(-1, 1, -2)], GPa: [1e9, dim(-1, 1, -2)], bar: [1e5, dim(-1, 1, -2)], psi: [6894.757293168, dim(-1, 1, -2)], ksi: [6894757.293168, dim(-1, 1, -2)], psf: [47.88025898, dim(-1, 1, -2)],
  J: [1, dim(2, 1, -2)], kJ: [1e3, dim(2, 1, -2)], MJ: [1e6, dim(2, 1, -2)], Wh: [3600, dim(2, 1, -2)], kWh: [3.6e6, dim(2, 1, -2)], BTU: [1055.05585262, dim(2, 1, -2)],
  W: [1, dim(2, 1, -3)], kW: [1e3, dim(2, 1, -3)], MW: [1e6, dim(2, 1, -3)], hp: [745.69987158227, dim(2, 1, -3)],
  A: [1, dim(0, 0, 0, 1)], mA: [1e-3, dim(0, 0, 0, 1)], kA: [1e3, dim(0, 0, 0, 1)], V: [1, dim(2, 1, -3, -1)], kV: [1e3, dim(2, 1, -3, -1)], mV: [1e-3, dim(2, 1, -3, -1)],
  ohm: [1, dim(2, 1, -3, -2)], K: [1, dim(0, 0, 0, 0, 1)], L: [1e-3, dim(3)], lit: [1e-3, dim(3)], liter: [1e-3, dim(3)], litre: [1e-3, dim(3)], gal: [3.785411784e-3, dim(3)],
};
const CONST = { pi: [Math.PI, D0], e: [Math.E, D0], g0: [9.80665, dim(1, 0, -2)] };
// Length fallback when no units table is given.
const LEN = { m: 1, mm: 1e-3, cm: 1e-2, km: 1e3, in: 0.0254, ft: 0.3048, yd: 0.9144 };

const FUNCS = new Set(['sqrt', 'abs', 'min', 'max', 'round', 'floor', 'ceil', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'ln', 'log10', 'exp', 'pow', 'if', 'sum', 'avg']);

export class CalcError extends Error {
  constructor(code, message, next = '') { super(message); this.code = code; this.next = next; }
}
const fail = (code, message, next) => { throw new CalcError(code, message, next); };

// ---- tokens ----
const SUP = { '²': '2', '³': '3', '¹': '1', '⁻': '-' };
function tokenize(src) {
  const s = String(src).replace(/[×·]/g, '*').replace(/[−–—]/g, '-').replace(/[÷]/g, '/').replace(/[‘’]/g, "'");
  const out = [];
  for (let i = 0; i < s.length;) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    let m;
    if ((m = /^(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/.exec(s.slice(i)))) {
      // 2e3 is a number; 2 e (the constant) is not written without a space
      out.push({ t: 'num', v: parseFloat(m[0]), at: i }); i += m[0].length; continue;
    }
    if (SUP[c]) { let j = i, p = ''; while (j < s.length && SUP[s[j]]) p += SUP[s[j++]]; out.push({ t: 'op', v: '^', at: i }, { t: 'num', v: parseInt(p, 10), at: i }); i = j; continue; }
    if (c === '@') {
      if (s[i + 1] === '"') { const j = s.indexOf('"', i + 2); if (j < 0) fail('syntax', 'A quote opened after @ is never closed.', 'Write @Name or @"Name with spaces".'); out.push({ t: 'param', v: s.slice(i + 2, j), at: i }); i = j + 1; continue; }
      m = /^@([\p{L}_][\p{L}\p{N}_.]*)/u.exec(s.slice(i));
      if (!m) fail('syntax', 'An @ must be followed by a parameter name.', 'Write @Name or @"Name with spaces".');
      out.push({ t: 'param', v: m[1], at: i }); i += m[0].length; continue;
    }
    if ((m = /^[\p{L}_°µΩ%][\p{L}\p{N}_°µΩ]*(?:\.[\p{L}_][\p{L}\p{N}_]*)*/u.exec(s.slice(i)))) { out.push({ t: 'id', v: m[0], at: i }); i += m[0].length; continue; }
    if ((m = /^(<=|>=|==|!=|<>|≤|≥|≠)/.exec(s.slice(i)))) { out.push({ t: 'op', v: { '≤': '<=', '≥': '>=', '≠': '!=', '<>': '!=' }[m[0]] || m[0], at: i }); i += m[0].length; continue; }
    if ('+-*/^(),<>=!'.includes(c)) { out.push({ t: 'op', v: c === '=' ? '==' : c, at: i }); i++; continue; }
    fail('syntax', 'Unexpected character "' + c + '" at position ' + (i + 1) + '.', 'Use numbers, names, units and + - * / ^ ( ).');
  }
  return out;
}

// ---- parser → AST ----
// node: {k:'num',v} {k:'name',v} {k:'param',v} {k:'bin',op,a,b} {k:'neg',a} {k:'call',f,args} {k:'unit',v} {k:'to',a,u}
function parse(src, isUnit) {
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p], eat = (v) => (toks[p] && toks[p].t === 'op' && toks[p].v === v ? toks[p++] : null);
  const need = (v) => { if (!eat(v)) fail('syntax', 'Expected "' + v + '"' + (toks[p] ? ' before "' + toks[p].v + '"' : ' at the end') + '.', 'Check the brackets.'); };
  function unitTail(n) {
    // a number is followed by units: kN, kN m, m^2, kN/m^2
    let u = null;
    const one = () => {
      const t = peek();
      if (!(t && t.t === 'id' && isUnit(t.v)) || (toks[p + 1] && toks[p + 1].t === 'op' && toks[p + 1].v === '(')) return null;
      p++; let node = { k: 'unit', v: t.v };
      if (eat('^')) { const neg = !!eat('-'); const e = toks[p++]; if (!e || e.t !== 'num') fail('syntax', 'A unit power must be a number (m^2).', ''); node = { k: 'bin', op: '^', a: node, b: { k: 'num', v: neg ? -e.v : e.v } }; }
      return node;
    };
    let first = one();
    if (!first) return n;
    u = first;
    for (let x; (x = one());) u = { k: 'bin', op: '*', a: u, b: x };
    while (peek() && peek().t === 'op' && peek().v === '/' && toks[p + 1] && toks[p + 1].t === 'id' && isUnit(toks[p + 1].v) && !(toks[p + 2] && toks[p + 2].v === '(')) {
      p++; let x = one(); for (let y; (y = one());) x = { k: 'bin', op: '*', a: x, b: y };
      u = { k: 'bin', op: '/', a: u, b: x };
    }
    return { k: 'bin', op: '*', a: n, b: u };
  }
  function atom() {
    const t = toks[p];
    if (!t) fail('syntax', 'The expression ends too soon.', 'Finish it, or remove the trailing operator.');
    if (t.t === 'num') { p++; return unitTail({ k: 'num', v: t.v }); }
    if (t.t === 'param') { p++; return { k: 'param', v: t.v }; }
    if (t.t === 'id') {
      p++;
      if (eat('(')) {
        if (!FUNCS.has(t.v)) fail('unknown_name', 'There is no function "' + t.v + '".', 'Functions: ' + [...FUNCS].join(', ') + '.');
        const args = [];
        if (!eat(')')) { do args.push(cmp()); while (eat(',')); need(')'); }
        return { k: 'call', f: t.v, args };
      }
      return { k: 'name', v: t.v };
    }
    if (t.t === 'op' && t.v === '(') { p++; const e = cmp(); need(')'); return e; }
    fail('syntax', 'Unexpected "' + t.v + '".', 'Check the operators and brackets.');
  }
  function power() {
    const a = atom();
    if (eat('^')) { const neg = !!eat('-'); const b = neg ? { k: 'neg', a: unary() } : unary(); return { k: 'bin', op: '^', a, b }; }
    return a;
  }
  function unary() { if (eat('-')) return { k: 'neg', a: unary() }; if (eat('+')) return unary(); return power(); }
  function term() {
    let a = unary();
    for (;;) {
      const t = peek();
      if (eat('*')) a = { k: 'bin', op: '*', a, b: unary() };
      else if (eat('/')) a = { k: 'bin', op: '/', a, b: unary() };
      else if (t && (t.t === 'num' || t.t === 'param' || (t.t === 'id' && t.v !== 'to') || (t.t === 'op' && t.v === '('))) a = { k: 'bin', op: '*', a, b: unary() };   // implicit product
      else return a;
    }
  }
  function sum() {
    let a = term();
    for (;;) { if (eat('+')) a = { k: 'bin', op: '+', a, b: term() }; else if (eat('-')) a = { k: 'bin', op: '-', a, b: term() }; else return a; }
  }
  function conv() {
    let a = sum();
    while (peek() && peek().t === 'id' && peek().v === 'to') { p++; a = { k: 'to', a, u: unitExpr() }; }
    return a;
  }
  function unitExpr() {
    // units only: kN m, kN/m^2, mm
    const one = () => {
      const t = toks[p];
      if (!(t && t.t === 'id')) return null;
      p++; let n = { k: 'unit', v: t.v };
      if (eat('^')) { const neg = !!eat('-'); const e = toks[p++]; if (!e || e.t !== 'num') fail('syntax', 'A unit power must be a number.', ''); n = { k: 'bin', op: '^', a: n, b: { k: 'num', v: neg ? -e.v : e.v } }; }
      return n;
    };
    let u = one();
    if (!u) fail('syntax', 'A unit must follow "to".', 'Write for example: M to kN m');
    for (let x; (x = one());) u = { k: 'bin', op: '*', a: u, b: x };
    while (eat('/')) { let x = one(); if (!x) fail('syntax', 'A unit must follow "/".', ''); for (let y; (y = one());) x = { k: 'bin', op: '*', a: x, b: y }; u = { k: 'bin', op: '/', a: u, b: x }; }
    return u;
  }
  function cmp() {
    let a = conv();
    const t = peek();
    if (t && t.t === 'op' && ['<', '<=', '>', '>=', '==', '!='].includes(t.v)) { p++; a = { k: 'bin', op: t.v, a, b: conv() }; }
    return a;
  }
  if (!toks.length) fail('empty', 'The expression is empty.', 'Type a value such as 6 m, or a formula.');
  const tree = cmp();
  if (p < toks.length) fail('syntax', 'Unexpected "' + toks[p].v + '" after the end of the expression.', 'Check for a missing operator.');
  return tree;
}

/** Names an expression reads: { names: [...], params: [...] } (for the dependency graph); throws CalcError on a syntax error. */
const esc = (x) => String(x ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
/**
 * The sheets as a printable page (EG.18 "printed with the set"): `views` = createCalcs().view() (every sheet with its rows, formulas and answers).
 * Returns a complete HTML document; every name, formula and answer is escaped (a file is untrusted), no script, black on white, one table per sheet.
 * `words` = { title, name, formula, unit, answer, error, empty, note } (the caller's language), `heading` = the file or drawing name.
 */
export function printHtml(views, { heading = '', words = {}, when = '' } = {}) {
  const w = { title: 'Calculations', name: 'Name', formula: 'Formula', unit: 'Show in', answer: 'Answer', error: 'Error', empty: 'No calculations.', ...words };
  const tables = (views || []).map((v) => {
    const rows = (v.rows || []).map((r) => '<tr><td>' + esc(r.name) + '</td><td class="f">' + esc(r.expr) + '</td><td>' + esc(r.unit) + '</td><td class="a">'
      + (r.error ? '<em>' + esc(w.error) + ': ' + esc(typeof r.error === 'string' ? r.error : r.error && r.error.message) + '</em>' : esc(r.text)) + '</td></tr>').join('');
    return '<section><h2>' + esc(v.title || v.id) + '</h2><table><thead><tr><th>' + esc(w.name) + '</th><th>' + esc(w.formula) + '</th><th>' + esc(w.unit) + '</th><th>' + esc(w.answer) + '</th></tr></thead><tbody>' + rows + '</tbody></table></section>';
  }).join('');
  return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(w.title + (heading ? ' - ' + heading : '')) + '</title><style>'
    + 'body{font:12pt/1.4 Helvetica,Arial,sans-serif;color:#000;background:#fff;margin:1.5cm}h1{font-size:16pt;margin:0 0 .2em}h2{font-size:13pt;margin:1.2em 0 .3em}'
    + 'p.m{color:#444;margin:0}table{border-collapse:collapse;width:100%}th,td{border:1px solid #000;padding:.25em .5em;text-align:left;vertical-align:top}td.f{font-family:monospace}td.a{font-weight:bold}section{break-inside:avoid}'
    + '</style></head><body><h1>' + esc(w.title) + '</h1><p class="m">' + esc(heading) + (when ? ' ' + esc(when) : '') + '</p>' + (tables || '<p>' + esc(w.empty) + '</p>') + '</body></html>';
}

export function refsOf(src, isUnit = () => false) {
  const tree = parse(src, isUnit), names = new Set(), params = new Set();
  const walk = (n) => {
    if (!n) return;
    if (n.k === 'name') names.add(n.v); else if (n.k === 'param') params.add(n.v);
    else if (n.k === 'bin') { walk(n.a); walk(n.b); } else if (n.k === 'neg') walk(n.a); else if (n.k === 'call') n.args.forEach(walk); else if (n.k === 'to') walk(n.a);
  };
  walk(tree);
  return { names: [...names], params: [...params] };
}

// ---- numbers → text ----
function sig(x, digits = 6) {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e9 || a < 1e-4) return x.toExponential(digits - 1).replace(/\.?0+e/, 'e').replace('e+', '×10^').replace('e-', '×10^-');
  return String(+x.toPrecision(digits));
}

const DEFAULT_UNIT = { 'length': 'm', 'area': 'm²', 'volume': 'm³', 'mass': 'kg', 'time': 's', 'force': 'N', 'pressure': 'Pa', 'energy': 'J', 'power': 'W', 'speed': 'm/s', 'acceleration': 'm/s²', 'current': 'A', 'voltage': 'V', 'temperature difference': 'K', 'density': 'kg/m³' };
const BASE_NAMES = ['m', 'kg', 's', 'A', 'K'];
function dimText(d) {
  const top = [], bot = [];
  d.forEach((x, i) => { if (Math.abs(x) < 1e-9) return; const s = BASE_NAMES[i] + (Math.abs(x) === 1 ? '' : '^' + sig(Math.abs(x), 3)); (x > 0 ? top : bot).push(s); });
  return (top.join('·') || '1') + (bot.length ? '/' + bot.join('·') : '');
}

/** Everything an engine needs: createCalcs({ units, params, step }). */
export function createCalcs({ units = null, params = null, step = null, now = () => Date.now() } = {}) {
  const lib = units && typeof units.unitOfMark === 'function' ? units : null;
  const KINDS = [['length', dim(1)], ['area', dim(2)], ['volume', dim(3)], ['angle', D0]];

  function unitValue(id) {
    if (Object.prototype.hasOwnProperty.call(SI, id)) return { v: SI[id][0], d: SI[id][1] };
    if (lib) for (const [kind, d] of KINDS) { const u = lib.unitOfMark(id, kind); if (u) return { v: lib.factor(u), d, id: u }; }
    else if (Object.prototype.hasOwnProperty.call(LEN, id)) return { v: LEN[id], d: dim(1) };
    if (id === 'deg' || id === '°') return { v: Math.PI / 180, d: D0 };
    if (id === 'rad') return { v: 1, d: D0 };
    return null;
  }
  const isUnit = (id) => unitValue(id) !== null;

  let doc = { sheets: [], drives: [] };
  let cache = null, lastPushed = new Map();
  const listeners = new Set();
  const changed = (why) => { cache = null; for (const f of listeners) { try { f(why); } catch { /* a listener must not break the sheet */ } } };

  // ---- document ----
  const slug = (s) => String(s ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, LIMITS.id);
  const goodName = (n) => typeof n === 'string' && n.length <= LIMITS.name && /^[\p{L}_][\p{L}\p{N}_]*$/u.test(n) && !FUNCS.has(n) && !(n in CONST) && n !== 'to';
  const text = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, ' ').slice(0, n);

  function clean(json) {
    const out = { sheets: [], drives: [] };
    const src = json && typeof json === 'object' ? json : {};
    const seen = new Set();
    for (const s of Array.isArray(src.sheets) ? src.sheets.slice(0, LIMITS.sheets) : []) {
      if (!s || typeof s !== 'object') continue;
      let id = slug(s.id || s.title) || 'sheet';
      while (seen.has(id)) id += '_';
      seen.add(id);
      const rows = [], names = new Set();
      for (const r of Array.isArray(s.rows) ? s.rows.slice(0, LIMITS.rows) : []) {
        if (!r || typeof r !== 'object') continue;
        const name = goodName(r.name) && !names.has(r.name) ? r.name : '';
        if (name) names.add(name);
        rows.push({ id: slug(r.id) || 'r' + (rows.length + 1) + Math.abs(hash(String(r.name) + String(r.expr))).toString(36).slice(0, 4), name, expr: text(r.expr, LIMITS.expr), unit: text(r.unit, 40), note: text(r.note, LIMITS.note) });
      }
      const rid = new Set(); for (const r of rows) { while (rid.has(r.id)) r.id += '_'; rid.add(r.id); }
      out.sheets.push({ id, title: text(s.title || id, LIMITS.title), rows });
    }
    for (const d of Array.isArray(src.drives) ? src.drives.slice(0, LIMITS.drives) : []) {
      if (!d || typeof d.row !== 'string' || typeof d.param !== 'string') continue;
      const param = text(d.param, 80).trim();
      if (!param || !/^[^.]+\.[\p{L}_][\p{L}\p{N}_]*$/u.test(d.row) || out.drives.some((x) => x.param === param)) continue;
      out.drives.push({ row: d.row, param, unit: text(d.unit, 40) });
    }
    return out;
  }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h | 0; }

  const sheetOf = (id) => doc.sheets.find((s) => s.id === id) || null;
  /** 'sheet.name' → { sheet, row } */
  function find(ref) {
    const i = String(ref).indexOf('.');
    if (i < 0) { for (const s of doc.sheets) { const r = s.rows.find((x) => x.name === ref); if (r) return { sheet: s, row: r }; } return null; }
    const s = sheetOf(ref.slice(0, i)); const r = s && s.rows.find((x) => x.name === ref.slice(i + 1));
    return r ? { sheet: s, row: r } : null;
  }

  // ---- evaluation ----
  function paramValue(name) {
    if (!params || typeof params.get !== 'function') fail('param_missing', 'This app has not handed its parameters over, so @' + name + ' cannot be read.', 'Use a number instead, or open a document that has parameters.');
    const g = params.get(name);
    if (g === null || g === undefined) fail('param_missing', 'There is no parameter "' + name + '" in this document.', 'Check the name' + (typeof params.list === 'function' ? ' (parameters: ' + params.list().slice(0, 12).join(', ') + ')' : '') + '.');
    if (typeof g === 'number') return { v: g, d: D0 };
    if (g && typeof g.value === 'number') {
      if (!g.unit) return { v: g.value, d: D0 };
      const u = unitValue(g.unit); if (!u) fail('unknown_unit', 'The parameter "' + name + '" is in a unit this sheet does not know: ' + g.unit + '.', '');
      return { v: g.value * u.v, d: u.d };
    }
    fail('param_missing', 'The parameter "' + name + '" has no number.', '');
  }

  function evalTree(n, env) {
    switch (n.k) {
      case 'num': return { v: n.v, d: D0 };
      case 'unit': { const u = unitValue(n.v); if (!u) fail('unknown_unit', 'There is no unit "' + n.v + '".', 'Units: m mm ft in, kN N, kPa MPa psi, kg lb, s min h, kW kWh …'); return { v: u.v, d: u.d }; }
      case 'param': env.params.add(n.v); return paramValue(n.v);
      case 'name': {
        if (Object.prototype.hasOwnProperty.call(env.vars, n.v)) return env.get(n.v);
        const hit = env.sheetRef(n.v);
        if (hit) return hit;
        if (n.v in CONST) return { v: CONST[n.v][0], d: CONST[n.v][1] };
        const u = unitValue(n.v); if (u) return { v: u.v, d: u.d };
        fail('unknown_name', 'There is no row, parameter or unit called "' + n.v + '".', 'Add a row named ' + n.v + ', write @' + n.v + ' for a parameter, or check the spelling.');
      }
      case 'neg': { const a = evalTree(n.a, env); return { v: -a.v, d: a.d }; }
      case 'to': {
        const a = evalTree(n.a, env), u = evalTree(n.u, env);
        if (!same(a.d, u.d)) fail('unit_mismatch', 'Cannot show ' + describe(a.d) + ' in ' + describe(u.d) + '.', 'Pick a unit of ' + describe(a.d) + '.');
        return { ...a, show: n.u, showFactor: u.v };
      }
      case 'bin': {
        const a = evalTree(n.a, env), b = evalTree(n.b, env);
        switch (n.op) {
          case '+': case '-':
            if (!same(a.d, b.d)) fail('unit_mismatch', 'Cannot ' + (n.op === '+' ? 'add' : 'subtract') + ' ' + describe(a.d) + ' and ' + describe(b.d) + '.', 'Both sides need the same kind of unit.');
            return { v: n.op === '+' ? a.v + b.v : a.v - b.v, d: a.d };
          case '*': return { v: a.v * b.v, d: dmul(a.d, b.d) };
          case '/': if (b.v === 0) fail('domain', 'Division by zero.', 'Check the divisor.'); return { v: a.v / b.v, d: ddiv(a.d, b.d) };
          case '^': {
            if (!isZero(b.d)) fail('unit_mismatch', 'An exponent cannot have a unit (' + describe(b.d) + ').', '');
            const r = Math.pow(a.v, b.v);
            if (!Number.isFinite(r)) fail('domain', 'That power is not a real number.', '');
            return { v: r, d: dpow(a.d, b.v) };
          }
          default: {
            if (!same(a.d, b.d)) fail('unit_mismatch', 'Cannot compare ' + describe(a.d) + ' with ' + describe(b.d) + '.', 'Both sides need the same kind of unit.');
            const e = 1e-12 * Math.max(1, Math.abs(a.v), Math.abs(b.v));
            const r = { '<': a.v < b.v - e, '<=': a.v <= b.v + e, '>': a.v > b.v + e, '>=': a.v >= b.v - e, '==': Math.abs(a.v - b.v) <= e, '!=': Math.abs(a.v - b.v) > e }[n.op];
            return { v: r ? 1 : 0, d: D0, bool: true };
          }
        }
      }
      case 'call': return callFn(n, env);
      default: fail('syntax', 'Cannot read that.', '');
    }
  }
  const describe = (d) => NAME_OF(d) || (isZero(d) ? 'a plain number' : dimText(d));

  function callFn(n, env) {
    const f = n.f;
    if (f === 'if') {
      if (n.args.length !== 3) fail('syntax', 'if needs three parts: if(test, then, else).', '');
      const c = evalTree(n.args[0], env); if (!isZero(c.d)) fail('unit_mismatch', 'The test of if() must be a comparison or a plain number.', '');
      return evalTree(n.args[c.v ? 1 : 2], env);
    }
    const a = n.args.map((x) => evalTree(x, env));
    const need = (k) => { if (a.length !== k) fail('syntax', f + ' takes ' + k + ' value' + (k === 1 ? '' : 's') + '.', ''); };
    const plain = () => a.forEach((x) => { if (!isZero(x.d)) fail('unit_mismatch', f + ' needs plain numbers or angles; got ' + describe(x.d) + '.', 'Divide by a unit first, e.g. x / 1 m.'); });
    const alike = () => { for (const x of a) if (!same(x.d, a[0].d)) fail('unit_mismatch', f + ' needs values of one kind; got ' + describe(a[0].d) + ' and ' + describe(x.d) + '.', ''); };
    switch (f) {
      case 'sqrt': need(1); if (a[0].v < 0) fail('domain', 'The square root of a negative number.', ''); return { v: Math.sqrt(a[0].v), d: dpow(a[0].d, 0.5) };
      case 'abs': need(1); return { v: Math.abs(a[0].v), d: a[0].d };
      case 'round': case 'floor': case 'ceil': {
        if (a.length < 1 || a.length > 2) fail('syntax', f + ' takes a value and, for round, an optional step.', '');
        if (a.length === 2) { alike(); const s = a[1].v; if (!s) fail('domain', 'The step cannot be zero.', ''); return { v: Math[f](a[0].v / s) * s, d: a[0].d }; }
        return { v: Math[f](a[0].v), d: a[0].d };
      }
      case 'min': case 'max': case 'sum': case 'avg': {
        if (!a.length) fail('syntax', f + ' needs at least one value.', ''); alike();
        const vs = a.map((x) => x.v);
        return { v: f === 'min' ? Math.min(...vs) : f === 'max' ? Math.max(...vs) : vs.reduce((s, x) => s + x, 0) / (f === 'avg' ? vs.length : 1), d: a[0].d };
      }
      case 'sin': case 'cos': case 'tan': need(1); plain(); return { v: Math[f](a[0].v), d: D0 };
      case 'asin': case 'acos': case 'atan': need(1); plain(); if ((f !== 'atan') && Math.abs(a[0].v) > 1) fail('domain', f + ' needs a value between -1 and 1.', ''); return { v: Math[f](a[0].v), d: D0 };
      case 'atan2': need(2); alike(); return { v: Math.atan2(a[0].v, a[1].v), d: D0 };
      case 'ln': case 'log10': case 'exp': need(1); plain(); if (f !== 'exp' && a[0].v <= 0) fail('domain', 'The logarithm of a number that is not positive.', ''); return { v: Math[f === 'ln' ? 'log' : f](a[0].v), d: D0 };
      case 'pow': need(2); if (!isZero(a[1].d)) fail('unit_mismatch', 'An exponent cannot have a unit.', ''); return { v: Math.pow(a[0].v, a[1].v), d: dpow(a[0].d, a[1].v) };
      default: fail('unknown_name', 'There is no function "' + f + '".', '');
    }
  }

  /** The text of a result in a unit expression ("kN m") or the natural unit. */
  function show(val, unitText, tree) {
    const d = val.d;
    if (val.bool) return { text: val.v ? 'true' : 'false', unit: '' };
    let factor = 1, label = '';
    if (unitText) {
      const u = evalTree(parse(unitText, isUnit), { vars: {}, params: new Set(), get: () => null, sheetRef: () => null });
      if (!same(u.d, d)) fail('unit_mismatch', 'The answer is ' + describe(d) + ', which cannot be shown in "' + unitText + '" (' + describe(u.d) + ').', 'Use a unit of ' + describe(d) + ', or clear the unit.');
      factor = u.v; label = unitText;
    } else if (val.show) { factor = val.showFactor; label = unparse(val.show); }
    else if (lib && same(d, dim(1)) && lib.format) { return { text: sig(val.v) + ' m', unit: 'm', amount: val.v }; }
    else { label = DEFAULT_UNIT[NAME_OF(d)] || (isZero(d) ? '' : dimText(d)); }
    const amount = val.v / factor;
    return { text: sig(amount) + (label ? ' ' + label : ''), unit: label, amount };
  }
  /** A row that is just a number times a unit (`5 kN/m`, `6 m`, `210 GPa`) shows in the unit it was written in. */
  function stripNum(t) {
    if (t.k !== 'bin') return null;
    if (t.op === '*' && t.a.k === 'num') return t.b;
    if (t.op === '*' || t.op === '/') { const a = stripNum(t.a); return a ? { ...t, a } : null; }
    return null;
  }
  const unitsOnly = (t) => t.k === 'unit' || t.k === 'name' || (t.k === 'bin' && (t.op === '^' ? unitsOnly(t.a) && t.b.k === 'num' : (t.op === '*' || t.op === '/') && unitsOnly(t.a) && unitsOnly(t.b)));
  function literalUnit(tree, val) {
    const u = stripNum(tree); if (!u || !unitsOnly(u)) return null;
    try { const x = evalTree(u, { vars: {}, params: new Set(), get: () => null, sheetRef: () => null }); return same(x.d, val.d) && x.v > 0 ? { show: u, showFactor: x.v } : null; } catch { return null; }
  }
  function unparse(n) {
    if (n.k === 'unit') return n.v;
    if (n.k === 'num') return String(n.v);
    if (n.k === 'name') return n.v;
    if (n.k === 'bin') return unparse(n.a) + (n.op === '*' ? ' ' : n.op) + unparse(n.b);
    return '';
  }

  /** Evaluate everything → Map 'sheet.name' → result. Cached until the document, a parameter or a unit changes (touch()). */
  function evaluate() {
    if (cache) return cache;
    const res = new Map(), state = new Map();   // state: 1 = in progress, 2 = done
    const keyOf = (s, r) => s.id + '.' + (r.name || '#' + r.id);
    const driven = new Map(doc.drives.map((d) => [d.param, d.row]));
    // cycle detection across rows and parameters
    const depsOf = new Map();
    for (const s of doc.sheets) for (const r of s.rows) {
      const k = keyOf(s, r);
      try { const refs = refsOf(r.expr, isUnit); depsOf.set(k, { names: refs.names.map((n) => { const h = find(s.id + '.' + n) || find(n); return h ? keyOf(h.sheet, h.row) : null; }).filter(Boolean), params: refs.params }); }
      catch { depsOf.set(k, { names: [], params: [] }); }
    }
    const cyc = new Set();
    const visit = (k, stack) => {
      if (stack.includes(k)) { for (const x of stack.slice(stack.indexOf(k))) cyc.add(x); return; }
      if (!depsOf.has(k)) return;
      const st = stack.concat(k);
      for (const d of depsOf.get(k).names) visit(d, st);
      for (const p of depsOf.get(k).params) if (driven.has(p)) { const h = find(driven.get(p)); if (h) visit(keyOf(h.sheet, h.row), st); }
    };
    for (const k of depsOf.keys()) visit(k, []);

    const run = (s, r) => {
      const k = keyOf(s, r);
      if (state.get(k) === 2) return res.get(k);
      if (state.get(k) === 1) return null;
      state.set(k, 1);
      let out;
      try {
        if (!r.name) fail('syntax', 'This row has no valid name.', 'Use letters, digits and _; not a function name.');
        if (cyc.has(k)) fail('circular', 'This row depends on itself, through other rows or through a parameter it drives.', 'Break the loop: stop driving the parameter, or read a number instead.');
        const params0 = new Set();
        const env = {
          vars: {}, params: params0,
          get: (name) => { const h = find(s.id + '.' + name) || find(name); const rr = run(h.sheet, h.row); if (!rr || !rr.ok) fail('dependency', 'It uses "' + name + '", which has a problem: ' + (rr && rr.error ? rr.error.message : 'unknown'), 'Fix ' + name + ' first.'); return rr.val; },
          sheetRef: (name) => {
            const h = find(name.includes('.') ? name : s.id + '.' + name) || (name.includes('.') ? null : find(name));
            if (!h) return null;
            if (h.row === r) fail('circular', 'This row uses its own name.', 'Rename it or remove the self-reference.');
            const rr = run(h.sheet, h.row);
            if (!rr || !rr.ok) fail('dependency', 'It uses "' + name + '", which has a problem: ' + (rr && rr.error ? rr.error.message : 'unknown'), 'Fix ' + name + ' first.');
            return rr.val;
          },
        };
        const tree = parse(r.expr, isUnit);
        const val = evalTree(tree, env);
        const lit = !r.unit && !val.show && !val.bool ? literalUnit(tree, val) : null;
        const shown = show(lit ? { ...val, ...lit } : val, r.unit);
        out = { ok: true, key: k, sheet: s.id, row: r.id, name: r.name, val, value: val.v, dim: val.d, kind: NAME_OF(val.d), bool: !!val.bool, text: shown.text, unit: shown.unit, amount: shown.amount ?? val.v, reads: [...params0] };
      } catch (e) {
        if (!(e instanceof CalcError)) throw e;
        out = { ok: false, key: k, sheet: s.id, row: r.id, name: r.name, error: { code: e.code, message: e.message, next: e.next } };
      }
      state.set(k, 2); res.set(k, out);
      return out;
    };
    for (const s of doc.sheets) for (const r of s.rows) run(s, r);
    cache = res;
    return res;
  }

  // ---- editing ----
  function nameClash(sheet, name, except) { return sheet.rows.some((r) => r.name === name && r !== except); }
  function addSheet({ id, title } = {}) {
    if (doc.sheets.length >= LIMITS.sheets) fail('too_large', 'A document holds at most ' + LIMITS.sheets + ' sheets.', 'Remove one first.');
    let sid = slug(id || title) || 'sheet'; while (sheetOf(sid)) sid += '_';
    const s = { id: sid, title: text(title || sid, LIMITS.title), rows: [] };
    doc.sheets.push(s); changed('sheet'); return s;
  }
  function removeSheet(id) {
    const i = doc.sheets.findIndex((s) => s.id === id); if (i < 0) return false;
    doc.sheets.splice(i, 1); doc.drives = doc.drives.filter((d) => !d.row.startsWith(id + '.')); changed('sheet'); return true;
  }
  function renameSheet(id, title) { const s = sheetOf(id); if (!s) return false; s.title = text(title, LIMITS.title); changed('sheet'); return true; }
  /** Add (rowId null) or change a row. Returns the row. Throws CalcError for a bad name; a bad expression is kept and shown as the row's error. */
  function setRow(sheetId, rowId, { name, expr, unit, note } = {}) {
    const s = sheetOf(sheetId); if (!s) fail('not_found', 'There is no sheet "' + sheetId + '".', 'Call calcs_list for the sheets.');
    let r = rowId ? s.rows.find((x) => x.id === rowId) : null;
    if (rowId && !r) fail('not_found', 'There is no row "' + rowId + '" on sheet ' + sheetId + '.', 'Call calcs_list for the rows.');
    if (!r && s.rows.length >= LIMITS.rows) fail('too_large', 'A sheet holds at most ' + LIMITS.rows + ' rows.', '');
    const n = name !== undefined ? String(name) : r ? r.name : '';
    if (n && !goodName(n)) fail('invalid_argument', '"' + n + '" is not a usable name.', 'Use letters, digits and _, starting with a letter; not a function name or pi, e, g0, to.');
    if (n && nameClash(s, n, r)) fail('conflict', 'Sheet ' + sheetId + ' already has a row called ' + n + '.', 'Pick another name.');
    if (!r) { let id = 'r' + (s.rows.length + 1); while (s.rows.some((x) => x.id === id)) id += '_'; r = { id, name: '', expr: '', unit: '', note: '' }; s.rows.push(r); }
    const old = r.name;
    r.name = n;
    if (expr !== undefined) r.expr = text(expr, LIMITS.expr);
    if (unit !== undefined) r.unit = text(unit, 40);
    if (note !== undefined) r.note = text(note, LIMITS.note);
    if (old && old !== n) doc.drives.forEach((d) => { if (d.row === sheetId + '.' + old) d.row = sheetId + '.' + n; });   // a rename keeps the drives
    changed('row'); return r;
  }
  function removeRow(sheetId, rowId) {
    const s = sheetOf(sheetId); const i = s ? s.rows.findIndex((r) => r.id === rowId) : -1; if (i < 0) return false;
    const gone = s.rows[i]; s.rows.splice(i, 1); doc.drives = doc.drives.filter((d) => d.row !== sheetId + '.' + gone.name); changed('row'); return true;
  }
  function moveRow(sheetId, rowId, to) {
    const s = sheetOf(sheetId); const i = s ? s.rows.findIndex((r) => r.id === rowId) : -1; if (i < 0) return false;
    const [r] = s.rows.splice(i, 1); s.rows.splice(Math.max(0, Math.min(s.rows.length, to | 0)), 0, r); changed('row'); return true;
  }
  /** A row drives a parameter. One row per parameter. */
  function setDrive(rowRef, param, unit = '') {
    const h = find(rowRef); if (!h || !h.row.name) fail('not_found', 'There is no row "' + rowRef + '".', 'Use sheet.name, as calcs_list shows.');
    const p = text(param, 80).trim(); if (!p) fail('invalid_argument', 'A parameter name is required.', '');
    doc.drives = doc.drives.filter((d) => d.param !== p);
    if (doc.drives.length >= LIMITS.drives) fail('too_large', 'Too many driven parameters.', '');
    doc.drives.push({ row: h.sheet.id + '.' + h.row.name, param: p, unit: text(unit, 40) }); changed('drive'); return true;
  }
  function removeDrive(param) { const n = doc.drives.length; doc.drives = doc.drives.filter((d) => d.param !== param); if (doc.drives.length !== n) changed('drive'); return doc.drives.length !== n; }

  /** What the drives would set now: [{ param, row, value, unit, current, change }] and the ones that cannot. */
  function plan() {
    const res = evaluate(), set = [], skipped = [];
    for (const d of doc.drives) {
      const h = find(d.row), r = h && res.get(h.sheet.id + '.' + h.row.name);
      if (!r || !r.ok) { skipped.push({ param: d.param, row: d.row, why: r && r.error ? r.error.message : 'The row is gone.' }); continue; }
      let value = r.value, unit = d.unit || '';
      if (unit) { const u = evalTree(parse(unit, isUnit), { vars: {}, params: new Set(), get: () => null, sheetRef: () => null }); if (!same(u.d, r.dim)) { skipped.push({ param: d.param, row: d.row, why: 'The row is ' + describe(r.dim) + ' and the parameter is set in ' + unit + '.' }); continue; } value = r.value / u.v; }
      else if (!isZero(r.dim)) { const g = params && params.get ? params.get(d.param) : null; const gu = g && typeof g === 'object' && g.unit ? g.unit : ''; if (gu) { const u = unitValue(gu); if (u && same(u.d, r.dim)) { value = r.value / u.v; unit = gu; } } }
      const cur = params && params.get ? params.get(d.param) : null;
      const curNum = cur && typeof cur === 'object' ? cur.value : cur;
      set.push({ param: d.param, row: d.row, value, unit, current: typeof curNum === 'number' ? curNum : null, change: typeof curNum !== 'number' || Math.abs(curNum - value) > 1e-9 * Math.max(1, Math.abs(value)) });
    }
    return { set, skipped };
  }
  /** Push the driven values to the app through params.set (only those that changed). Returns { applied, skipped }. */
  function apply({ label = 'Calc sheet' } = {}) {
    const { set, skipped } = plan();
    const todo = set.filter((s) => s.change);
    const applied = [];
    if (todo.length && params && typeof params.set === 'function') {
      const doit = () => { for (const s of todo) if (params.set(s.param, s.value, s.unit) !== false) applied.push({ param: s.param, value: s.value, unit: s.unit }); else skipped.push({ param: s.param, row: s.row, why: 'The app refused the value.' }); };
      if (typeof step === 'function') step(label, doit); else doit();
      cache = null;   // the parameters moved, so rows that read them move too
    }
    return { applied, skipped };
  }

  function sheetsView({ sheet = null } = {}) {
    const res = evaluate();
    return doc.sheets.filter((s) => !sheet || s.id === sheet).map((s) => ({
      id: s.id, title: s.title,
      rows: s.rows.map((r) => { const x = res.get(s.id + '.' + (r.name || '#' + r.id)); return { id: r.id, name: r.name, expr: r.expr, unit: r.unit, note: r.note, ...(x && x.ok ? { text: x.text, value: x.amount, unitShown: x.unit, kind: x.kind || undefined } : { error: x && x.error }) }; }),
    }));
  }
  /** One-off expression in the scope of a sheet (not saved). */
  function run(expr, sheetId) {
    const s = sheetOf(sheetId) || doc.sheets[0] || { id: '_', rows: [] };
    const tmp = clone();
    const ts = tmp.sheet(s.id) || tmp.addSheet({ id: '_' });
    const row = tmp.setRow(ts.id, null, { name: '_result', expr });
    const r = tmp.evaluate().get(ts.id + '.' + row.name);
    return r;
  }
  function clone() { const c = createCalcs({ units, params, now }); c.load(save(), { quiet: true }); return c; }

  const api = {
    isUnit, unitValue, find, addSheet, removeSheet, renameSheet, setRow, removeRow, moveRow, setDrive, removeDrive, plan, apply, evaluate, run, clone,
    sheet: sheetOf, sheets: () => doc.sheets, drives: () => doc.drives.slice(), view: sheetsView,
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    /** A parameter or a unit setting changed outside the sheet: recompute. */
    touch() { changed('touch'); },
    /** The value of 'sheet.name' for other modules (design reasons): { ok, text, amount, unit, dim } | null. */
    valueOf(ref) { const h = find(ref); if (!h) return null; const r = evaluate().get(h.sheet.id + '.' + h.row.name); return r ? { ok: r.ok, text: r.text, amount: r.amount, unit: r.unit, kind: r.kind, error: r.error } : null; },
    save() { return { format: FORMAT, v: 1, sheets: doc.sheets.map((s) => ({ id: s.id, title: s.title, rows: s.rows.map((r) => ({ ...r })) })), drives: doc.drives.map((d) => ({ ...d })) }; },
    load(json, { quiet = false } = {}) { doc = clean(json); cache = null; lastPushed = new Map(); if (!quiet) changed('load'); return doc.sheets.length; },
    clean, empty: () => !doc.sheets.length,
  };
  const save = () => api.save();
  api.load(null, { quiet: true });
  api.tools = (opts = {}) => calcTools({ calcs: api, step: opts.step || step });
  return api;
}

/**
 * The assistants' tools (docs/AI-CONNECT-SPEC.md § 2): calcs_list, calcs_get, calcs_run (read); calcs_set, calcs_delete (edit, with a native preview).
 * Rows' text comes from the file, so list/get are untrusted (the dispatcher marks them; the sheet never runs text from a note).
 */
export function calcTools({ calcs, step = null } = {}) {
  const obj = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
  const S = (d, max = 80) => ({ type: 'string', maxLength: max, description: d });
  const PAGE = { limit: { type: 'integer', minimum: 1, maximum: 200, description: 'How many to return; default 50.' }, offset: { type: 'integer', minimum: 0, maximum: 100000, description: 'How many to skip, from the total in the last answer.' } };
  const OUT = { type: 'object', description: 'What was changed and the undo label.', properties: { undo: { type: 'string', description: 'The undo step\'s label.' } } };
  const run = (label, fn) => (typeof step === 'function' ? step(label, fn) : fn());
  const tool = (e) => { const x = { code: e.code || 'failed', message: e.message, next: e.next ? [e.next] : [] }; return Object.assign(new Error(e.message), { code: x.code, next: x.next }); };
  const guard = (fn) => { try { return fn(); } catch (e) { if (e instanceof CalcError) throw tool(e); throw e; } };
  const rowOf = (ref, sheet) => { const h = calcs.find(ref.includes('.') ? ref : (sheet ? sheet + '.' : '') + ref); return h; };
  return [
    { name: 'calcs_list', group: 'read', title: 'List calc sheets', untrusted: true,
      description: 'Lists the calc sheets in the open document with each row\'s name, formula, unit and current answer, plus the parameters the sheets drive. Rows with a problem carry an error and what to try. Use calcs_run to try a formula without saving it.',
      inputSchema: obj({ sheet: S('A sheet id from this list; leave out for every sheet.', 40), ...PAGE }),
      run: (a = {}) => { const all = calcs.view({ sheet: a.sheet || null }); const off = a.offset || 0, lim = a.limit || 50; const sheets = all.slice(off, off + lim); return { sheets, drives: calcs.drives(), total: all.length, returned: sheets.length, ...(off + lim < all.length ? { next: off + lim } : {}) }; } },
    { name: 'calcs_get', group: 'read', title: 'Get one calc row', untrusted: true,
      description: 'Returns one calc row as sheet.name: its formula, answer, unit, dimension and the parameters it reads. Errors say what to fix.',
      inputSchema: obj({ row: S('The row as sheet.name, for example beams.span.', 90) }, ['row']),
      run: (a) => guard(() => {
        const h = calcs.find(a.row); if (!h) throw tool(new CalcError('not_found', 'There is no row "' + a.row + '".', 'Call calcs_list for the rows.'));
        const r = calcs.evaluate().get(h.sheet.id + '.' + h.row.name);
        return { row: h.sheet.id + '.' + h.row.name, expr: h.row.expr, unit: h.row.unit, note: h.row.note, ...(r && r.ok ? { text: r.text, value: r.amount, unitShown: r.unit, kind: r.kind || null, reads: r.reads } : { error: r && r.error }) };
      }) },
    { name: 'calcs_run', group: 'read', title: 'Try a formula', untrusted: true,
      description: 'Evaluates one formula with units, using the names on a sheet, and returns the answer without saving anything. Formulas may use + - * / ^, functions such as sqrt and min, units such as kN m, mm, MPa, and @Name for an app parameter.',
      inputSchema: obj({ expr: S('The formula, for example "w * span^2 / 8 to kN m".', 400), sheet: S('A sheet id whose names the formula may use; default the first sheet.', 40) }, ['expr']),
      run: (a) => guard(() => { const r = calcs.run(a.expr, a.sheet); return r.ok ? { text: r.text, value: r.amount, unit: r.unit, kind: r.kind || null } : { error: r.error }; }) },
    { name: 'calcs_set', group: 'edit', title: 'Set a calc row', outputSchema: OUT,
      description: 'Adds a calc row (leave row out) or changes one, creating the sheet if it does not exist. Optionally drives an app parameter from the answer. Returns the answer, or the error with what to try. One undo step.',
      inputSchema: obj({ sheet: S('Sheet id, for example beams; created when new.', 40), row: S('Row id from calcs_list to change; leave out to add a row.', 40), name: S('The row\'s name (letters, digits, _).', 40), expr: S('The formula, for example "6 m" or "w * span^2 / 8".', 400), unit: S('Optional unit to show the answer in, for example "kN m".', 40), note: S('Optional note for people reading the sheet.', 400), drives: S('Optional: an app parameter this row sets from its answer.', 80), drivesUnit: S('Unit the parameter is set in, for example "mm".', 40) }, ['sheet', 'name', 'expr']),
      preview: (a) => guard(() => {
        const t = calcs.clone(); if (!t.sheet(a.sheet)) t.addSheet({ id: a.sheet });
        const r = t.setRow(a.sheet, a.row || null, { name: a.name, expr: a.expr, unit: a.unit, note: a.note });
        const x = t.evaluate().get(a.sheet + '.' + r.name);
        return { row: a.sheet + '.' + r.name, ...(x && x.ok ? { text: x.text } : { error: x && x.error }), drives: a.drives || null };
      }),
      run: (a) => guard(() => run('Calc sheet: ' + a.name, () => {
        if (!calcs.sheet(a.sheet)) calcs.addSheet({ id: a.sheet });
        const r = calcs.setRow(a.sheet, a.row || null, { name: a.name, expr: a.expr, unit: a.unit, note: a.note });
        if (a.drives) { calcs.setDrive(a.sheet + '.' + r.name, a.drives, a.drivesUnit || ''); calcs.apply({ label: 'Calc sheet: ' + a.name }); }
        const x = calcs.evaluate().get(a.sheet + '.' + r.name);
        return { row: a.sheet + '.' + r.name, ...(x && x.ok ? { text: x.text, value: x.amount, unitShown: x.unit } : { error: x && x.error }), undo: 'Calc sheet: ' + a.name };
      })) },
    { name: 'calcs_delete', group: 'edit', title: 'Delete a calc row', outputSchema: OUT,
      description: 'Deletes one calc row and any parameter drive that came from it. Rows that used it show an error until fixed. One undo step.',
      inputSchema: obj({ row: S('The row as sheet.name.', 90) }, ['row']),
      preview: (a) => { const h = calcs.find(a.row); return { row: a.row, exists: !!h, drivesRemoved: calcs.drives().filter((d) => d.row === a.row).length }; },
      run: (a) => guard(() => run('Delete calc row', () => {
        const h = calcs.find(a.row); if (!h) throw tool(new CalcError('not_found', 'There is no row "' + a.row + '".', 'Call calcs_list for the rows.'));
        calcs.removeRow(h.sheet.id, h.row.id); return { deleted: a.row, undo: 'Delete calc row' };
      })) },
  ];
}

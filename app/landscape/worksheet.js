/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: the only words here are function names of the formula language and English fallbacks the hosts replace. */
/**
 * worksheet.js — worksheets linked to objects (0.8 LA.8, session `landscape-arch_PART_4`): rows from any kind of object the host lists,
 * columns from any field or a small formula, grouping, sums and counts, live (worked out again from the objects each time), out to CSV,
 * XLSX rows and a table drawn on a sheet. No DOM, no imports, no eval: the formulas go through our own small parser (parseExpr).
 * Canonical in lib/worksheet/; byte-identical copies by `node tools/worksheet/sync.mjs` (CivilCraft's Landscape workspace is the first
 * host; SuperCad Studio and the other apps take it the same way, with their own row sources).
 *
 *   A worksheet (saved in the host's file) = { id, name, source, columns: [{ label, expr, total: '' | 'sum' | 'count' | 'avg' | 'min' | 'max',
 *     dec: 0–6 | null }], group: '' | expr, filter: '' | expr, sort: { col, dir: 1 | -1 } | null, onSheet: bool }
 *   cleanWorksheet(raw, sources) → worksheet | null (untrusted; `sources` = the source keys the host offers)
 *   parseExpr(text) → ast (throws Error('<code> at <pos>') on bad input) · evalExpr(ast, row) → number | string | boolean | null
 *     operators + - * / % ^, & (join text), = <> < <= > >=, unary −; numbers, "text", fields by name (botanical, qty, area) or in
 *     brackets ([Net area]); functions round(x, d) ceil floor abs sqrt min max if(c, a, b) and or not concat upper lower len text(x, d)
 *     Errors inside a cell show as #ERR, a division by 0 as #DIV/0, a missing field as an empty cell.
 *   runWorksheet(ws, rows) → { head, body: [{ kind: 'row' | 'group' | 'subtotal', cells }], totals: cells | null, errors: [{ col, msg }] }
 *   toCsv(result) · toXlsxSheet(result, { name }) → { name, cols, rows, freeze } (the hosts' xlsx writers take it)
 *   tableLayout(result, { x0, y1, width, rowH, textH, maxRows }) → { strokes: [[{x, y}…]], texts: [{ x, y, h, text, align }], height, rows }
 *     (in paper mm: the host draws them on a sheet)
 *   fieldsOf(rows) → field names seen (for the column picker)
 */

export const LIMITS = { columns: 40, expr: 500, tokens: 400, depth: 40, rows: 20000, text: 200 };
export const TOTALS = ['', 'sum', 'count', 'avg', 'min', 'max'];
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const clean = (v, n = LIMITS.text) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

// ---- the formula language ----
const OPS = ['<=', '>=', '<>', '+', '-', '*', '/', '%', '^', '&', '=', '<', '>', '(', ')', ','];
function tokenize(src) {
  const s = String(src ?? '');
  if (s.length > LIMITS.expr) throw new Error('too-long at 0');
  const out = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i));
      if (!m) throw new Error('number at ' + i);
      out.push({ k: 'num', v: Number(m[0]), at: i }); i += m[0].length; continue;
    }
    if (c === '"') {
      let j = i + 1, v = '';
      for (; j < s.length; j++) { if (s[j] === '"') { if (s[j + 1] === '"') { v += '"'; j++; continue; } break; } v += s[j]; }
      if (j >= s.length) throw new Error('unclosed-text at ' + i);
      out.push({ k: 'str', v, at: i }); i = j + 1; continue;
    }
    if (c === '[') {
      const j = s.indexOf(']', i);
      if (j < 0) throw new Error('unclosed-field at ' + i);
      out.push({ k: 'id', v: s.slice(i + 1, j).trim(), at: i }); i = j + 1; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const m = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(s.slice(i));
      out.push({ k: 'id', v: m[0], at: i }); i += m[0].length; continue;
    }
    const op = OPS.find((o) => s.startsWith(o, i));
    if (!op) throw new Error('character at ' + i);
    out.push({ k: 'op', v: op, at: i }); i += op.length;
    if (out.length > LIMITS.tokens) throw new Error('too-long at ' + i);
  }
  return out;
}
const FUNCS = new Set(['round', 'ceil', 'floor', 'abs', 'sqrt', 'min', 'max', 'if', 'and', 'or', 'not', 'concat', 'upper', 'lower', 'len', 'text']);

export function parseExpr(text) {
  const tk = tokenize(text);
  let p = 0, depth = 0;
  const peek = () => tk[p], at = () => (tk[p] ? tk[p].at : String(text ?? '').length);
  const is = (v) => tk[p] && tk[p].k === 'op' && tk[p].v === v;
  const need = (v) => { if (!is(v)) throw new Error('expected ' + v + ' at ' + at()); p++; };
  const deeper = (f) => { if (++depth > LIMITS.depth) throw new Error('too-deep at ' + at()); const r = f(); depth--; return r; };
  const bin = (next, ops) => () => { let l = next(); while (tk[p] && tk[p].k === 'op' && ops.includes(tk[p].v)) { const op = tk[p++].v; l = { t: 'bin', op, l, r: next() }; } return l; };
  const prim = () => deeper(() => {
    const x = peek();
    if (!x) throw new Error('missing at ' + at());
    if (x.k === 'num') { p++; return { t: 'num', v: x.v }; }
    if (x.k === 'str') { p++; return { t: 'str', v: x.v }; }
    if (x.k === 'op' && x.v === '(') { p++; const e = cmp(); need(')'); return e; }
    if (x.k === 'op' && x.v === '-') { p++; return { t: 'neg', e: pow() }; }
    if (x.k === 'id') {
      p++;
      const name = x.v, low = name.toLowerCase();
      if (is('(')) {
        if (!FUNCS.has(low)) throw new Error('function at ' + x.at);
        p++;
        const args = [];
        if (!is(')')) { args.push(cmp()); while (is(',')) { p++; args.push(cmp()); } }
        need(')');
        return { t: 'fn', f: low, args };
      }
      if (low === 'true' || low === 'false') return { t: 'bool', v: low === 'true' };
      return { t: 'field', name };
    }
    throw new Error('unexpected at ' + x.at);
  });
  const pow = () => { const b = prim(); if (is('^')) { p++; return { t: 'bin', op: '^', l: b, r: deeper(pow) }; } return b; };
  const mul = bin(pow, ['*', '/', '%']);
  const add = bin(mul, ['+', '-']);
  const cat = bin(add, ['&']);
  const cmp = () => { const l = cat(); if (tk[p] && tk[p].k === 'op' && ['=', '<>', '<', '<=', '>', '>='].includes(tk[p].v)) { const op = tk[p++].v; return { t: 'bin', op, l, r: cat() }; } return l; };
  if (!tk.length) return { t: 'str', v: '' };
  const e = cmp();
  if (p < tk.length) throw new Error('unexpected at ' + tk[p].at);
  return e;
}

class CellError { constructor(code) { this.code = code; } }
const num = (v) => { if (v instanceof CellError) throw v; if (fin(v)) return v; if (typeof v === 'boolean') return v ? 1 : 0; if (v == null || v === '') return 0; const n = Number(v); if (Number.isFinite(n)) return n; throw new CellError('#ERR'); };
const str = (v) => { if (v instanceof CellError) throw v; return v == null ? '' : fin(v) ? String(Math.round(v * 1e9) / 1e9) : String(v); };
const truthy = (v) => (typeof v === 'boolean' ? v : fin(v) ? v !== 0 : !!v);

function ev(n, row) {
  switch (n.t) {
    case 'num': case 'str': case 'bool': return n.v;
    case 'field': { const v = fieldOf(row, n.name); return v === undefined ? null : v; }
    case 'neg': return -num(ev(n.e, row));
    case 'bin': {
      const a = ev(n.l, row), b = ev(n.r, row);
      switch (n.op) {
        case '+': return num(a) + num(b);
        case '-': return num(a) - num(b);
        case '*': return num(a) * num(b);
        case '/': { const d = num(b); if (d === 0) throw new CellError('#DIV/0'); return num(a) / d; }
        case '%': { const d = num(b); if (d === 0) throw new CellError('#DIV/0'); return num(a) % d; }
        case '^': { const r = Math.pow(num(a), num(b)); if (!fin(r)) throw new CellError('#ERR'); return r; }
        case '&': return (str(a) + str(b)).slice(0, 2000);
        default: {
          const both = (fin(a) || typeof a === 'boolean') && (fin(b) || typeof b === 'boolean');
          const x = both ? num(a) : str(a).toLowerCase(), y = both ? num(b) : str(b).toLowerCase();
          return { '=': x === y, '<>': x !== y, '<': x < y, '<=': x <= y, '>': x > y, '>=': x >= y }[n.op];
        }
      }
    }
    case 'fn': {
      const A = n.args, a = (i) => ev(A[i], row);
      switch (n.f) {
        case 'if': return truthy(a(0)) ? (A.length > 1 ? a(1) : true) : A.length > 2 ? a(2) : false;
        case 'and': return A.every((_, i) => truthy(a(i)));
        case 'or': return A.some((_, i) => truthy(a(i)));
        case 'not': return !truthy(a(0));
        case 'round': { const d = A.length > 1 ? Math.max(0, Math.min(10, Math.round(num(a(1))))) : 0, k = 10 ** d; return Math.round(num(a(0)) * k) / k; }
        case 'ceil': return Math.ceil(num(a(0)));
        case 'floor': return Math.floor(num(a(0)));
        case 'abs': return Math.abs(num(a(0)));
        case 'sqrt': { const v = num(a(0)); if (v < 0) throw new CellError('#ERR'); return Math.sqrt(v); }
        case 'min': if (!A.length) throw new CellError('#ERR'); return Math.min(...A.map((_, i) => num(a(i))));
        case 'max': if (!A.length) throw new CellError('#ERR'); return Math.max(...A.map((_, i) => num(a(i))));
        case 'concat': return A.map((_, i) => str(a(i))).join('').slice(0, 2000);
        case 'upper': return str(a(0)).toUpperCase();
        case 'lower': return str(a(0)).toLowerCase();
        case 'len': return str(a(0)).length;
        case 'text': { const d = A.length > 1 ? Math.max(0, Math.min(10, Math.round(num(a(1))))) : 2; return num(a(0)).toFixed(d); }
        default: throw new CellError('#ERR');
      }
    }
    default: throw new CellError('#ERR');
  }
}
/** A field by name: exact, else case-insensitive, else with spaces ↔ underscores ("Net area" finds net_area). */
function fieldOf(row, name) {
  if (!row) return undefined;
  if (Object.prototype.hasOwnProperty.call(row, name)) return row[name];
  const k = String(name).toLowerCase().replace(/\s+/g, '_');
  for (const key of Object.keys(row)) if (key.toLowerCase() === k) return row[key];
  return undefined;
}
export function evalExpr(ast, row) {
  try { const v = ev(ast, row); return typeof v === 'number' && !Number.isFinite(v) ? '#ERR' : v; } catch (e) { if (e instanceof CellError) return e.code; throw e; }
}

// ---- worksheets ----
export function cleanWorksheet(raw, sources = null) {
  if (!raw || typeof raw !== 'object') return null;
  const id = /^w\d{1,9}$/.test(String(raw.id)) ? String(raw.id) : null;
  const source = clean(raw.source, 40);
  if (!id || !source || (sources && !sources.includes(source))) return null;
  const parses = (x) => { try { parseExpr(x); return true; } catch { return false; } };
  const columns = (Array.isArray(raw.columns) ? raw.columns.slice(0, LIMITS.columns) : []).map((c) => {
    if (!c || typeof c !== 'object') return null;
    const expr = String(c.expr ?? '').slice(0, LIMITS.expr);
    return { label: clean(c.label, 60) || clean(expr, 60), expr, total: TOTALS.includes(c.total) ? c.total : '', dec: Number.isInteger(c.dec) && c.dec >= 0 && c.dec <= 6 ? c.dec : null };
  }).filter(Boolean);
  if (!columns.length) return null;
  const group = String(raw.group ?? '').slice(0, LIMITS.expr), filter = String(raw.filter ?? '').slice(0, LIMITS.expr);
  const sort = raw.sort && Number.isInteger(raw.sort.col) && raw.sort.col >= 0 && raw.sort.col < columns.length ? { col: raw.sort.col, dir: raw.sort.dir === -1 ? -1 : 1 } : null;
  return { id, name: clean(raw.name, 120) || id, source, columns, group: parses(group) ? group : '', filter: parses(filter) ? filter : '', sort, onSheet: raw.onSheet === true };
}

const fmt = (v, dec) => (fin(v) && dec != null ? Number(v.toFixed(dec)) : v);
function totalOf(kind, vals) {
  const nums = vals.filter(fin);
  if (kind === 'count') return vals.filter((v) => v !== '' && v != null).length;
  if (!nums.length) return '';
  if (kind === 'sum') return nums.reduce((a, b) => a + b, 0);
  if (kind === 'avg') return nums.reduce((a, b) => a + b, 0) / nums.length;
  if (kind === 'min') return Math.min(...nums);
  if (kind === 'max') return Math.max(...nums);
  return '';
}

export function runWorksheet(ws, rows) {
  const errors = [], parsed = ws.columns.map((c, i) => { try { return parseExpr(c.expr); } catch (e) { errors.push({ col: i, msg: e.message }); return null; } });
  let fAst = null, gAst = null;
  if (ws.filter) { try { fAst = parseExpr(ws.filter); } catch (e) { errors.push({ col: -1, msg: e.message }); } }
  if (ws.group) { try { gAst = parseExpr(ws.group); } catch (e) { errors.push({ col: -2, msg: e.message }); } }
  const src = (rows || []).slice(0, LIMITS.rows).filter((r) => !fAst || truthy(evalExpr(fAst, r)));
  let lines = src.map((r) => ({ g: gAst ? str2(evalExpr(gAst, r)) : '', cells: parsed.map((a, i) => (a ? fmt(evalExpr(a, r), ws.columns[i].dec) : '#ERR')) }));
  if (ws.sort) { const c = ws.sort.col, d = ws.sort.dir; lines.sort((a, b) => { const x = a.cells[c], y = b.cells[c]; return (fin(x) && fin(y) ? x - y : String(x ?? '').localeCompare(String(y ?? ''))) * d; }); }
  const sub = (ls) => ws.columns.map((c, i) => (c.total ? fmt(totalOf(c.total, ls.map((l) => l.cells[i])), c.dec) : ''));
  const body = [];
  if (gAst) {
    const groups = new Map();
    for (const l of lines) { if (!groups.has(l.g)) groups.set(l.g, []); groups.get(l.g).push(l); }
    for (const [g, ls] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      body.push({ kind: 'group', cells: [g, ...ws.columns.slice(1).map(() => '')] });
      for (const l of ls) body.push({ kind: 'row', cells: l.cells });
      if (ws.columns.some((c) => c.total)) body.push({ kind: 'subtotal', cells: sub(ls) });
    }
  } else for (const l of lines) body.push({ kind: 'row', cells: l.cells });
  const totals = ws.columns.some((c) => c.total) ? sub(lines) : null;
  return { head: ws.columns.map((c) => c.label), body, totals, errors, count: lines.length };
}
const str2 = (v) => (v == null ? '' : String(v));

export function fieldsOf(rows) {
  const seen = new Set();
  for (const r of (rows || []).slice(0, 200)) for (const k of Object.keys(r || {})) seen.add(k);
  return [...seen];
}

const csvCell = (v) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d/.test(s)) s = "'" + s;   // a spreadsheet would run it as a formula
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
export function toCsv(res, { totalLabel = 'Total' } = {}) {
  const rows = [res.head, ...res.body.map((b) => b.cells)];
  if (res.totals) rows.push(res.totals.map((v, i) => (i === 0 && v === '' ? totalLabel : v)));
  return rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
export function toXlsxSheet(res, { name = 'Worksheet', totalLabel = 'Total' } = {}) {
  const head = res.head.map((h) => ({ v: h, s: 'head' }));
  const rows = [head, ...res.body.map((b) => (b.kind === 'row' ? b.cells : b.cells.map((v) => ({ v, s: 'head' }))))];
  if (res.totals) rows.push(res.totals.map((v, i) => ({ v: i === 0 && v === '' ? totalLabel : v, s: 'head' })));
  const cols = res.head.map((h, i) => Math.max(8, Math.min(40, Math.max(String(h).length, ...res.body.slice(0, 200).map((b) => String(b.cells[i] ?? '').length)) + 2)));
  return { name: String(name).replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Worksheet', cols, rows, freeze: 1 };
}

/** The table in paper mm, for a sheet: a ruled grid, the head bold-ruled, numbers right-aligned. */
export function tableLayout(res, { x0 = 0, y1 = 0, width = 180, rowH = 5, textH = 1.8, maxRows = 1000, totalLabel = 'Total' } = {}) {
  const all = [{ kind: 'head', cells: res.head }, ...res.body, ...(res.totals ? [{ kind: 'total', cells: res.totals.map((v, i) => (i === 0 && v === '' ? totalLabel : v)) }] : [])].slice(0, maxRows);
  const n = res.head.length, w = res.head.map((h, i) => Math.max(String(h).length, ...all.slice(0, 200).map((r) => String(r.cells[i] ?? '').length), 3));
  const sum = w.reduce((a, b) => a + b, 0) || 1, cw = w.map((x) => (x / sum) * width);
  const strokes = [], texts = [];
  let y = y1;
  for (const r of all) {
    let x = x0;
    for (let i = 0; i < n; i++) {
      const v = r.cells[i], numeric = fin(v);
      const text = numeric ? String(Math.round(v * 1e6) / 1e6) : String(v ?? '');
      const fits = Math.max(1, Math.floor(cw[i] / (textH * 0.55)));
      texts.push({ x: numeric ? x + cw[i] - 1 : x + 1, y: y - rowH + (rowH - textH) / 2 + 0.2, h: textH, text: text.length > fits ? text.slice(0, fits - 1) + '…' : text, align: numeric ? 'right' : 'left', bold: r.kind !== 'row' });
      x += cw[i];
    }
    strokes.push({ pts: [{ x: x0, y: y - rowH }, { x: x0 + width, y: y - rowH }], w: r.kind === 'head' || r.kind === 'total' ? 0.35 : 0.13 });
    y -= rowH;
  }
  strokes.push({ pts: [{ x: x0, y: y1 }, { x: x0 + width, y: y1 }], w: 0.35 });
  let x = x0;
  for (let i = 0; i <= n; i++) { strokes.push({ pts: [{ x, y: y1 }, { x, y }], w: i === 0 || i === n ? 0.35 : 0.13 }); x += cw[i] || 0; }
  return { strokes, texts, height: y1 - y, rows: all.length };
}

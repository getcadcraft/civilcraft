/* SPDX-License-Identifier: Apache-2.0 */
/**
 * drc.js — HD.8 design rule check with the person's own KLayout (GPL, a separate program; batch mode) and the result database (.lyrdb)
 * read by our own code into Problems tied to the cell and the place on the layout (micrometres, the units GDSIN draws in).
 * DOM-free; imports ./rows.js and ./xml.js. The DRC deck is the PDK's (the person's download); we ship none.
 *
 *   drcSteps({ gds, deck, top, report = 'out/drc.lyrdb', vars: { input: 'input', report: 'report', topcell: 'topcell' }, extra: {k: v} })
 *       → klayout -b -r <deck> -rd input=<gds> -rd report=out/drc.lyrdb [-rd topcell=<top>] [-rd k=v …]
 *       (decks read their variables by name; most open decks use $input and $report — change `vars` when a deck names them otherwise)
 *   readLyrdb(text) → { top, categories: [{ name, path, description }], cells: [name], items: [{ category, cell, multiplicity, values: [shape], box }] }
 *       shape: { kind: 'polygon'|'box'|'edge'|'edge-pair'|'text'|'float'|'string', pts: [[x, y]…], text }
 *   drcRows(db, { max = 2000 }) → rows (one per item; severity error; where.at = the middle of the item's shapes; about = the cell)
 *   drcSummary(db) → [{ category, description, count }] most first
 */
import { row } from './rows.js';
import { readXml, kids, kid, textOf } from './xml.js';

const RD_KEY = /^[A-Za-z_]\w{0,40}$/;
export function drcSteps({ gds, deck, top = '', report = 'out/drc.lyrdb', vars = {}, extra = {} } = {}) {
  if (!gds || !deck) throw new Error('drcSteps: a layout and a deck');
  const v = { input: 'input', report: 'report', topcell: 'topcell', ...vars };
  const args = ['-b', '-r', deck, '-rd', v.input + '=' + gds, '-rd', v.report + '=' + report];
  if (top) args.push('-rd', v.topcell + '=' + top);
  for (const [k, val] of Object.entries(extra)) if (RD_KEY.test(k)) args.push('-rd', k + '=' + String(val).replace(/[^\w.+/-]/g, ''));
  return { steps: [{ tool: 'klayout', label: 'klayout drc', args }], extra: {}, collect: ['out/'] };
}

const unq = (s) => s.replace(/^'(.*)'$/, '$1').replace(/\\'/g, "'");
/** A category reference: 'a' or 'a'.'b' (nested categories) → 'a.b'. */
const catPath = (s) => (s.match(/'(?:[^'\\]|\\.)*'|[^.]+/g) || []).map(unq).join('.');

export function parseShape(v) {
  const m = /^([a-z-]+):\s*(.*)$/s.exec(v.trim());
  if (!m) return { kind: 'string', pts: [], text: v.trim() };
  const kind = m[1], body = m[2];
  const nums = (s) => s.split(';').map((p) => p.split(',').map(Number)).filter((p) => p.length === 2 && p.every(Number.isFinite));
  if (kind === 'polygon' || kind === 'box' || kind === 'edge' || kind === 'path') {
    const h = /\(([^()]*)\)/.exec(body);
    return { kind, pts: h ? nums(h[1].split('/')[0]) : [], text: '' };
  }
  if (kind === 'edge-pair') {
    const parts = [...body.matchAll(/\(([^()]*)\)/g)].map((x) => nums(x[1])).flat();
    return { kind, pts: parts, text: '' };
  }
  if (kind === 'text') { const t = /'((?:[^'\\]|\\.)*)'/.exec(body); const at = /\[?r?\d*\s*([-\d.]+),([-\d.]+)\]?\s*$/.exec(body); return { kind, pts: at ? [[Number(at[1]), Number(at[2])]] : [], text: t ? t[1] : body }; }
  return { kind, pts: [], text: body };
}

const boxOf = (shapes) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const s of shapes) for (const [x, y] of s.pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return Number.isFinite(x0) ? [x0, y0, x1, y1] : null;
};

export function readLyrdb(text) {
  const r = readXml(text);
  if (r.name !== 'report-database') throw new Error('not a KLayout report database');
  const db = { top: textOf(r, 'top-cell'), description: textOf(r, 'description'), categories: [], cells: [], items: [] };
  const walkCats = (el, prefix) => {
    for (const c of kids(kid(el, 'categories'), 'category')) {
      const name = textOf(c, 'name'), path = prefix ? prefix + '.' + name : name;
      db.categories.push({ name, path, description: textOf(c, 'description') });
      walkCats(c, path);
    }
  };
  walkCats(r, '');
  for (const c of kids(kid(r, 'cells'), 'cell')) db.cells.push(textOf(c, 'name'));
  for (const it of kids(kid(r, 'items'), 'item')) {
    const values = kids(kid(it, 'values'), 'value').map((v) => parseShape(v.text));
    db.items.push({ category: catPath(textOf(it, 'category')), cell: unq(textOf(it, 'cell')).replace(/:\d+$/, ''), multiplicity: Number(textOf(it, 'multiplicity')) || 1, values, box: boxOf(values) });
  }
  return db;
}

export function drcSummary(db) {
  const n = new Map();
  for (const it of db.items) n.set(it.category, (n.get(it.category) || 0) + 1);
  const desc = new Map(db.categories.map((c) => [c.path, c.description]));
  return [...n].map(([category, count]) => ({ category, description: desc.get(category) || '', count })).sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

export function drcRows(db, { max = 2000 } = {}) {
  const desc = new Map(db.categories.map((c) => [c.path, c.description]));
  const rows = [], seen = new Map();
  for (const it of db.items) {
    if (rows.length >= max) break;
    const at = it.box ? [(it.box[0] + it.box[2]) / 2, (it.box[1] + it.box[3]) / 2] : null;
    const d = desc.get(it.category) || '';
    let key = it.category + ':' + it.cell + ':' + (at ? at.map((v) => v.toFixed(3)).join(',') : 'x');
    const k = (seen.get(key) || 0) + 1; seen.set(key, k); if (k > 1) key += '#' + k;
    rows.push(row({ source: 'drc', code: 'rule', severity: 'error', cell: it.cell, at, key, vars: { rule: it.category, what: d, cell: it.cell }, text: `${it.category}${d ? ': ' + d : ''} (cell ${it.cell || db.top}${at ? `, at ${at[0].toFixed(3)}, ${at[1].toFixed(3)} µm` : ''})` }));
  }
  if (db.items.length > max) rows.push(row({ source: 'drc', code: 'more', severity: 'note', vars: { n: db.items.length - max }, text: `${db.items.length - max} more rule violations are in the report and are not listed`, key: 'more' }));
  return rows;
}

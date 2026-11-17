/* SPDX-License-Identifier: Apache-2.0 */
/**
 * table.js — ONE layout engine for schedules and other tables of figures (0.10 BK.149, BK.142, BK.39, BK.61; session
 * bk-r3-schedules-10). Host-free: no imports, no DOM, no units of its own. Canonical in lib/tables/, byte-identical in
 * <app>/dev/tables/ by `node tools/tables/sync.mjs`. A host hands it a table and a layout and gets the lines to draw, export or
 * hand to an assistant. Every line and every figure keeps the ids of the elements it came from.
 *
 * A TABLE (what a host makes from its model; BimCraft's schedules are this shape plus `cols` and `vals`):
 *   { key, title, head: [label…], cols: [{ id, kind, role?, order? }…], rows: [[text…]…], vals: [[number | null…]…],
 *     ids: [[element id…]…], cellIds?: [[ [id…] | null …]…], total: [text…] | null, note }
 *   kind   'text' | 'count' | 'length' | 'area' | 'volume' | 'money' | 'number'. count, length, area, volume and money add up
 *          (sum: false on a column keeps it out of the sums: a door's width is a length nobody adds up).
 *   role   'level' | 'type' | 'room': what the office standard may group by · order: the values in the order groups are shown
 *   vals   the cell as a number in the host's base unit (null = not a number); cells stay the host's own text
 *   cellIds  the elements behind one figure when they are not the whole row's (the openings behind a "deductions" figure)
 *
 * A LAYOUT (a saved set-up, an assistant's request, or nothing at all):
 *   { columns: [col id…]?, groupBy: col id | null?, totals: 'source' | 'none' | 'grand' | 'groups'?, title: text?,
 *     headings: { case: 'asis' | 'upper' | 'title'?, columns: { col id: label }? }? }
 *   A field that is not there is not stated: the office standard fills it, else the table's own (no grouping, its own total).
 *
 * THE OFFICE STANDARD (BK.149; a plain record a host reads from wherever the office keeps its defaults):
 *   { group: 'none' | 'level' | 'type' | 'room'?, totals: 'none' | 'grand' | 'groups'?, title: pattern with {schedule} {project}?,
 *     headings: 'asis' | 'upper' | 'title'? }
 *
 *   cleanLayout(raw) → layout (unknown fields dropped; never throws) · cleanStandard(raw) → standard
 *   withStandard(layout, standard, table) → { layout, from: { groupBy?, totals?, title?, headings? } }   `from` names what the standard set
 *   applyLayout(table, layout, { fmt, words, vars }) → LAID
 *       fmt   { count, length, area, volume, money, number }: number → text, for the sums (a missing one prints the number)
 *       words { total, subtotal, none }   vars { schedule, project } for a title pattern
 *     LAID = { key, title, head, colIds, kinds, groupBy, lines: [{ kind: 'group' | 'row' | 'subtotal' | 'total', cells, vals, ids,
 *              cellIds?, label?, count?, row? }…], note, count }
 *   figureIds(laid, lineIndex, colIndex) → [id…]   the elements behind one figure (a cell's own, else its line's)
 *   toMatrix(laid) → [[text…]…]   headings, then every line (a group heading is one cell)
 *   toCsv(laid, csv)   csv(head, rows) → text: the host's CSV writer · toTsv(laid) → tab-separated text, for pasting into a
 *     spreadsheet (tabs and line breaks inside a cell become spaces)
 *   toSheet(laid, { convert, widths }) → { name, rows, cols, freeze } for tables/xlsx.js writeXlsx
 *       convert { kind: (base number) → number in the unit the column shows | null }: a figure it converts is a real number in
 *       the workbook; anything else is the cell's text
 *   elementsSheet(laid, { name, nameOf, head }) → a second sheet: for each line the ids (nameOf(id) → GlobalId) behind it
 */
export const KINDS = ['text', 'count', 'length', 'area', 'volume', 'money', 'number'];
export const SUMS = ['count', 'length', 'area', 'volume', 'money'];
export const TOTALS = ['source', 'none', 'grand', 'groups'];
export const CASES = ['asis', 'upper', 'title'];
export const GROUPS = ['none', 'level', 'type', 'room'];
export const LIMITS = { columns: 60, label: 80, title: 120, id: 120 };

const plain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const tidy = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

export function cleanLayout(raw) {
  const out = {};
  if (!plain(raw)) return out;
  if (Array.isArray(raw.columns)) { const c = [...new Set(raw.columns.map((x) => tidy(x, LIMITS.id)).filter(Boolean))].slice(0, LIMITS.columns); if (c.length) out.columns = c; }
  if (has(raw, 'groupBy')) { if (raw.groupBy === null || raw.groupBy === '') out.groupBy = null; else if (typeof raw.groupBy === 'string' && tidy(raw.groupBy, LIMITS.id)) out.groupBy = tidy(raw.groupBy, LIMITS.id); }
  if (TOTALS.includes(raw.totals)) out.totals = raw.totals;
  if (typeof raw.title === 'string' && tidy(raw.title, LIMITS.title)) out.title = tidy(raw.title, LIMITS.title);
  if (plain(raw.headings)) {
    const h = {};
    if (CASES.includes(raw.headings.case)) h.case = raw.headings.case;
    if (plain(raw.headings.columns)) {
      const cols = {};
      for (const k of Object.keys(raw.headings.columns).slice(0, LIMITS.columns)) { const id = tidy(k, LIMITS.id), label = tidy(raw.headings.columns[k], LIMITS.label); if (id && label) cols[id] = label; }
      if (Object.keys(cols).length) h.columns = cols;
    }
    if (Object.keys(h).length) out.headings = h;
  }
  return out;
}
export function cleanStandard(raw) {
  const out = {};
  if (!plain(raw)) return out;
  if (GROUPS.includes(raw.group)) out.group = raw.group;
  if (['none', 'grand', 'groups'].includes(raw.totals)) out.totals = raw.totals;
  if (typeof raw.title === 'string' && tidy(raw.title, LIMITS.title)) out.title = tidy(raw.title, LIMITS.title);
  if (CASES.includes(raw.headings)) out.headings = raw.headings;
  return out;
}
/** The layout with what it does not state taken from the office standard. `from` says which parts the standard set. */
export function withStandard(layout, standard, table) {
  const L = { ...cleanLayout(layout) }, S = cleanStandard(standard), from = {};
  if (!has(L, 'groupBy') && S.group) {
    if (S.group === 'none') { L.groupBy = null; from.groupBy = true; }
    else { const c = (table?.cols || []).find((x) => x.role === S.group); if (c) { L.groupBy = c.id; from.groupBy = true; } }
  }
  if (!has(L, 'totals') && S.totals) { L.totals = S.totals; from.totals = true; }
  if (!has(L, 'title') && S.title) { L.title = S.title; from.title = true; }
  if (S.headings && !(L.headings && L.headings.case)) { L.headings = { ...(L.headings || {}), case: S.headings }; from.headings = true; }
  return { layout: L, from };
}

const titleCase = (s) => String(s).replace(/(^|[\s(/-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
export const headingCase = (s, mode) => (mode === 'upper' ? String(s).toUpperCase() : mode === 'title' ? titleCase(s) : String(s));
export const fillTitle = (pattern, vars = {}) => String(pattern).replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (m, k) => (has(vars, k) ? String(vars[k]) : m)).replace(/\s+/g, ' ').trim();
const natural = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true });
const uniq = (lists) => { const s = new Set(); for (const l of lists) for (const id of l || []) s.add(id); return [...s]; };

export function applyLayout(table, layout = {}, { fmt = {}, words = {}, vars = {} } = {}) {
  const L = cleanLayout(layout);
  const W = { total: 'Total', subtotal: 'Subtotal', none: '—', ...words };
  const cols = (table.cols && table.cols.length === table.head.length ? table.cols : table.head.map((h, i) => ({ id: 'c' + i, kind: 'text' }))).map((c, i) => ({ ...c, i }));
  const byId = new Map(cols.map((c) => [c.id, c]));
  const g = L.groupBy && byId.has(L.groupBy) ? byId.get(L.groupBy) : null;
  let show = (L.columns ? L.columns.map((id) => byId.get(id)).filter(Boolean) : cols);
  if (!show.length) show = cols;
  if (g) show = show.filter((c) => c.id !== g.id);
  if (!show.length) show = cols.filter((c) => !g || c.id !== g.id);
  const mode = L.headings?.case || 'asis';
  const label = (c) => headingCase(L.headings?.columns?.[c.id] || table.head[c.i], mode);
  const text = (c, n) => (typeof fmt[c.kind] === 'function' ? fmt[c.kind](n) : String(n));
  const rowsOf = (list) => list.map((r) => ({
    kind: 'row', row: r, cells: show.map((c) => table.rows[r][c.i] ?? ''), vals: show.map((c) => table.vals?.[r]?.[c.i] ?? null),
    ids: Array.isArray(table.ids?.[r]) ? table.ids[r] : (table.ids?.[r] !== undefined && table.ids?.[r] !== null ? [table.ids[r]] : []),
    ...(table.cellIds?.[r] ? { cellIds: show.map((c) => table.cellIds[r][c.i] || null) } : {}),
  }));
  const sumLine = (kind, first, lines) => {
    const vals = show.map((c, j) => (SUMS.includes(c.kind) && c.sum !== false && lines.some((l) => typeof l.vals[j] === 'number') ? lines.reduce((s, l) => s + (typeof l.vals[j] === 'number' ? l.vals[j] : 0), 0) : null));
    const cells = show.map((c, j) => (vals[j] === null ? '' : text(c, vals[j])));
    if (cells[0] === '') cells[0] = first;
    return { kind, cells, vals, ids: uniq(lines.map((l) => l.ids)), count: lines.length };
  };
  const all = table.rows.map((_, i) => i);
  const totals = L.totals || 'source';
  const lines = [];
  if (g) {
    const groups = new Map();
    for (const r of all) { const v = table.rows[r][g.i] ?? ''; if (!groups.has(v)) groups.set(v, []); groups.get(v).push(r); }
    const rank = g.order ? new Map(g.order.map((v, i) => [v, i])) : null;
    const keys = [...groups.keys()].sort((a, b) => (a === '' ? 1 : b === '' ? -1 : rank && rank.has(a) && rank.has(b) ? rank.get(a) - rank.get(b) : natural(a, b)));
    for (const k of keys) {
      const body = rowsOf(groups.get(k));
      lines.push({ kind: 'group', label: label(g) + ': ' + (k === '' ? W.none : k), cells: [label(g) + ': ' + (k === '' ? W.none : k)], vals: [null], ids: uniq(body.map((l) => l.ids)), count: body.length });
      lines.push(...body);
      if (totals === 'groups') { const s = sumLine('subtotal', W.subtotal, body); s.cells[0] = s.cells[0] === W.subtotal ? W.subtotal + ' (' + body.length + ')' : s.cells[0]; lines.push(s); }
    }
  } else lines.push(...rowsOf(all));
  const body = lines.filter((l) => l.kind === 'row');
  if (totals === 'source' && table.total) {
    const cells = show.map((c) => table.total[c.i] ?? '');
    if (cells[0] === '') cells[0] = (!L.columns && !g) ? '' : W.total;
    lines.push({ kind: 'total', cells, vals: show.map(() => null), ids: uniq(body.map((l) => l.ids)), count: body.length });
  } else if (totals === 'grand' || totals === 'groups') {
    const s = sumLine('total', W.total, body);
    if (s.cells[0] === W.total) s.cells[0] = W.total + ' (' + body.length + ')';
    lines.push(s);
  }
  const name = table.title || vars.schedule || '';
  return {
    key: table.key || '', title: L.title ? fillTitle(L.title, { schedule: name, project: '', ...vars }) : name,
    head: show.map(label), colIds: show.map((c) => c.id), kinds: show.map((c) => c.kind), groupBy: g ? g.id : null,
    lines, note: table.note || '', count: body.length,
  };
}

export function figureIds(laid, lineIndex, colIndex) {
  const l = laid?.lines?.[lineIndex];
  if (!l) return [];
  const own = l.cellIds && colIndex !== undefined && colIndex !== null ? l.cellIds[colIndex] : null;
  return own && own.length ? own : (l.ids || []);
}

const pad = (cells, n) => cells.concat(Array(Math.max(0, n - cells.length)).fill(''));
export function toMatrix(laid) {
  const n = laid.head.length;
  return [laid.head.slice(), ...laid.lines.map((l) => pad(l.cells.slice(), n))];
}
export function toCsv(laid, csv) {
  const m = toMatrix(laid);
  return csv(m[0], m.slice(1));
}
export function toTsv(laid) {
  return toMatrix(laid).map((r) => r.map((c) => String(c ?? '').replace(/[\t\r\n]+/g, ' ')).join('\t')).join('\n') + '\n';
}
export function toSheet(laid, { convert = {}, widths = null } = {}) {
  const n = laid.head.length;
  const num = (kind, v) => (typeof v === 'number' && typeof convert[kind] === 'function' ? convert[kind](v) : null);
  const rows = [laid.head.map((h) => ({ v: h, s: 'head' }))];
  for (const l of laid.lines) {
    if (l.kind === 'group') { rows.push([{ v: l.cells[0], s: 'bold' }]); continue; }
    const strong = l.kind !== 'row';
    rows.push(pad(l.cells.slice(), n).map((c, j) => {
      const kind = laid.kinds[j], x = num(kind, l.vals?.[j]);
      if (x !== null && Number.isFinite(x)) return { v: x, s: strong ? 'bold' : (kind === 'count' ? 'int' : 'qty') };
      return c === '' ? null : (strong ? { v: c, s: 'bold' } : c);
    }));
  }
  if (laid.note) { rows.push([]); rows.push([laid.note]); }
  const cols = widths || laid.head.map((h, j) => Math.min(60, Math.max(10, String(h).length + 2, ...laid.lines.filter((l) => l.kind !== 'group').map((l) => String(l.cells[j] ?? '').length + 2))));
  return { name: laid.title || 'Schedule', rows, cols, freeze: 1 };
}
export function elementsSheet(laid, { name = 'Elements', nameOf = (id) => String(id), head = ['Line', 'First cell', 'Elements'] } = {}) {
  const rows = [head.map((h) => ({ v: h, s: 'head' }))];
  laid.lines.forEach((l, i) => { if (l.ids && l.ids.length) rows.push([i + 2, String(l.cells[0] ?? ''), l.ids.map(nameOf).filter(Boolean).join(' ')]); });
  return { name, rows, cols: [8, 30, 80], freeze: 1 };
}

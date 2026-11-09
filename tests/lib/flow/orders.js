/* SPDX-License-Identifier: Apache-2.0 */
/**
 * orders.js — orders and arrivals from a file, in place of a random source (0.9 TW.15). DOM-free, no imports.
 *
 *   parseOrders(text, { timeUnit, clockBase }) → { ok, rows, columns, ignored, unit, error }
 *   ordersCsv(rows)                             → CSV text in the form parseOrders reads back
 *   SAMPLE_COLUMNS                              → the columns, for help and the panel
 *
 * THE FILE. CSV (comma, semicolon or tab, found from the header line; double quotes as usual; a first byte-order mark is fine; lines
 * that are empty or start with # are not rows). The first row is the header. Names are not case sensitive.
 *   time_s | time_min | time_h | time | clock   WHEN the order arrives, from the start of the run (time_s seconds, time_min minutes,
 *                                               time_h hours). Plain `time` takes options.timeUnit ('s' by default). `clock` is a time of
 *                                               day, h:mm or h:mm:ss, counted from options.clockBase (seconds after midnight; the
 *                                               default is the first row's time of day, so the run starts with the first order). Exactly
 *                                               one of these columns is needed.
 *   type                                        the load's type (letters, digits, _ and -, up to 40); empty = the source's first type
 *   length_m | length_mm | length               the load's length along the belt (length is metres); empty = the type's length in the
 *                                               source's own list, else 0.4 m
 *   qty | quantity                              how many loads arrive together (a whole number, 1 to 1000; empty = 1)
 *   source                                      the id of the source that takes the order; empty = every source set to this table takes it
 *   order | id | note                           a label for the person; kept, not used by the run
 * Other columns are ignored and named in `ignored`.
 *
 * THE FIRST BAD ROW. A row that cannot be read stops the whole read: ok false, `error` = { code, line (1 = the header line), column
 * (the header's name), value (the cell as written) } and nothing is skipped or guessed. The panel turns a code into words. Codes:
 * empty, no-time-column, two-time-columns, bad-header, bad-time, negative-time, bad-clock, bad-type, bad-length, bad-qty, bad-source,
 * short-row (fewer cells than the header), too-many-rows, too-many-cells (more cells than the header), bad-quote.
 *
 * ORDER. Rows are sorted by time, equal times keeping the file's order (a stable sort), so the same file always gives the same run,
 * whatever order the rows were written in. Times are seconds in `rows` (t), rounded to the microsecond.
 */

import { readRecord, parseClock, number, formatClock } from './csv.js';

export { formatClock };
export const MAX_ROWS = 50000;
export const MAX_QTY = 1000;
export const SAMPLE_COLUMNS = ['time_s', 'type', 'length_m', 'qty', 'source', 'order'];

const TIME_UNITS = { time_s: 1, time_min: 60, time_h: 3600, s: 1, min: 60, h: 3600 };
const TYPE_RE = /^[A-Za-z0-9_-]{1,40}$/;
const ID_RE = /^[a-z][a-z0-9-]{0,39}$/;
const r6 = (x) => Math.round(x * 1e6) / 1e6;

export function parseOrders(text, { timeUnit = 's', clockBase = null } = {}) {
  if (typeof text !== 'string') return fail('empty', 0, '', '');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  // find the header line (the first that is not empty or a comment) and its delimiter
  let pos = 0, line = 0, header = null, delim = ',';
  const lineEnd = (i) => { const n = text.indexOf('\n', i); return n < 0 ? text.length : n; };
  while (pos < text.length) {
    const e = lineEnd(pos), raw = text.slice(pos, e).replace(/\r$/, ''), tr = raw.trim();
    line++;
    if (tr === '' || tr[0] === '#') { pos = e + 1; continue; }
    const counts = [',', ';', '\t'].map((d) => raw.split(d).length);
    delim = [',', ';', '\t'][counts.indexOf(Math.max(...counts))];
    const rec = readRecord(text, pos, delim);
    if (rec.badQuote) return fail('bad-quote', line, '', raw);
    header = rec.cells.map((c) => c.trim().toLowerCase());
    pos = rec.next;
    break;
  }
  if (!header) return fail('empty', 0, '', '');
  // columns
  const idx = {}, ignored = [];
  const known = ['time_s', 'time_min', 'time_h', 'time', 'clock', 'type', 'length_m', 'length_mm', 'length', 'qty', 'quantity', 'source', 'order', 'id', 'note'];
  header.forEach((nm, i) => {
    if (nm === '' || !known.includes(nm) || nm in idx) { if (nm === '' || nm in idx) { /* blank or repeated names cannot be read */ } ignored.push(header[i] || '(blank)'); return; }
    idx[nm] = i;
  });
  const timeCols = ['time_s', 'time_min', 'time_h', 'time', 'clock'].filter((c) => c in idx);
  if (!timeCols.length) return fail('no-time-column', 1, '', header.join(','), { ignored });
  if (timeCols.length > 1) return fail('two-time-columns', 1, timeCols.join(' + '), header.join(','), { ignored });
  const tcol = timeCols[0], tIdx = idx[tcol];
  let unit = tcol === 'clock' ? 'clock' : tcol === 'time' ? timeUnit : tcol.slice(5);
  if (tcol === 'time' && !(timeUnit in TIME_UNITS)) return fail('bad-header', 1, 'time', header.join(','), { ignored });
  if (unit === '' || unit === 'time') unit = 's';
  const mul = tcol === 'clock' ? 1 : tcol === 'time' ? TIME_UNITS[timeUnit] : TIME_UNITS[tcol];
  const lenCol = ['length_m', 'length_mm', 'length'].find((c) => c in idx), lenMul = lenCol === 'length_mm' ? 0.001 : 1;
  const qtyCol = ['qty', 'quantity'].find((c) => c in idx);
  const labelCol = ['order', 'id', 'note'].find((c) => c in idx);
  const rows = [];
  while (pos < text.length) {
    const e = lineEnd(pos), raw = text.slice(pos, e).replace(/\r$/, ''), tr = raw.trim();
    line++;
    if (tr === '' || tr[0] === '#') { pos = e + 1; continue; }
    const rec = readRecord(text, pos, delim);
    if (rec.badQuote) return fail('bad-quote', line, '', raw, { ignored });
    // a quoted cell may span lines: count them
    const consumed = text.slice(pos, rec.next); line += (consumed.match(/\n/g) || []).length - (/\n$/.test(consumed) ? 1 : 0);
    pos = rec.next;
    const c = rec.cells;
    if (c.length > header.length) return fail('too-many-cells', line, '', raw, { ignored });
    if (c.length < header.length && c.length <= tIdx) return fail('short-row', line, tcol, raw, { ignored });
    const cell = (i) => (i === undefined || i >= c.length ? '' : c[i].trim());
    if (rows.length >= MAX_ROWS) return fail('too-many-rows', line, '', raw, { ignored });
    // time
    const tv = cell(tIdx);
    let t;
    if (tcol === 'clock') {
      const s = parseClock(tv);
      if (s === null) return fail('bad-clock', line, tcol, tv, { ignored });
      t = s;
    } else {
      const n = number(tv);
      if (!Number.isFinite(n)) return fail('bad-time', line, tcol, tv, { ignored });
      if (n < 0) return fail('negative-time', line, tcol, tv, { ignored });
      t = n * mul;
    }
    if (!Number.isFinite(t) || t > 1e9) return fail('bad-time', line, tcol, tv, { ignored });
    const row = { t, _line: line };
    const ty = cell(idx.type);
    if (ty !== '') { if (!TYPE_RE.test(ty)) return fail('bad-type', line, 'type', ty, { ignored }); row.type = ty; }
    if (lenCol) {
      const lv = cell(idx[lenCol]);
      if (lv !== '') { const n = number(lv) * lenMul; if (!Number.isFinite(n) || n <= 0 || n > 20) return fail('bad-length', line, lenCol, lv, { ignored }); row.length = r6(n); }
    }
    if (qtyCol) {
      const qv = cell(idx[qtyCol]);
      if (qv !== '') { const n = number(qv); if (!Number.isInteger(n) || n < 1 || n > MAX_QTY) return fail('bad-qty', line, qtyCol, qv, { ignored }); row.qty = n; }
    }
    const sv = cell(idx.source);
    if (sv !== '') { if (!ID_RE.test(sv)) return fail('bad-source', line, 'source', sv, { ignored }); row.source = sv; }
    if (labelCol) { const lb = cell(idx[labelCol]); if (lb !== '') row.label = lb.replace(/[\u0000-\u001f<>]/g, '').slice(0, 60); }
    rows.push(row);
  }
  if (!rows.length) return fail('empty', line, '', '', { ignored });
  // a time of day counts from the base: the given one, else the first row's
  if (tcol === 'clock') {
    const base = Number.isFinite(clockBase) && clockBase !== null ? clockBase : rows[0].t;
    for (const r of rows) {
      const t = r.t - base;
      if (t < 0) return fail('negative-time', r._line, 'clock', formatClock(r.t), { ignored });
      r.t = t;
    }
  }
  for (const r of rows) r.t = r6(r.t);
  const order = rows.map((r, i) => i).sort((a, b) => rows[a].t - rows[b].t || a - b);
  const out = order.map((i) => { const { _line, ...r } = rows[i]; return r; });
  return { ok: true, rows: out, columns: Object.keys(idx), ignored, unit, count: out.reduce((a, r) => a + (r.qty || 1), 0), error: null };
}

function fail(code, line, column, value, extra = {}) {
  return { ok: false, rows: [], columns: [], ignored: extra.ignored || [], unit: '', count: 0, error: { code, line, column, value: String(value).slice(0, 120) } };
}

const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d/.test(s)) s = "'" + s;   // never a formula in a spreadsheet
  return /[",;\n\r\t]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

/** Rows (t in seconds) back to CSV in the sample's columns. */
export function ordersCsv(rows) {
  const lines = [SAMPLE_COLUMNS.join(',')];
  for (const r of rows) lines.push([r.t, r.type ?? '', r.length ?? '', r.qty ?? '', r.source ?? '', r.label ?? ''].map(csvCell).join(','));
  return lines.join('\n') + '\n';
}

/** Clean a stored table (from a saved file): { id, name, file, unit, rows[] } or null. Never throws. */
export function cleanOrderTable(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string' || !ID_RE.test(raw.id) || !Array.isArray(raw.rows)) return null;
  const rows = [];
  for (const r of raw.rows.slice(0, MAX_ROWS)) {
    if (!r || typeof r.t !== 'number' || !Number.isFinite(r.t) || r.t < 0 || r.t > 1e9) return null;
    const o = { t: r6(r.t) };
    if (typeof r.type === 'string' && TYPE_RE.test(r.type)) o.type = r.type;
    if (typeof r.length === 'number' && r.length > 0 && r.length <= 20) o.length = r.length;
    if (Number.isInteger(r.qty) && r.qty >= 1 && r.qty <= MAX_QTY) o.qty = r.qty;
    if (typeof r.source === 'string' && ID_RE.test(r.source)) o.source = r.source;
    if (typeof r.label === 'string') o.label = r.label.replace(/[\u0000-\u001f<>]/g, '').slice(0, 60);
    rows.push(o);
  }
  const order = rows.map((r, i) => i).sort((a, b) => rows[a].t - rows[b].t || a - b);
  return {
    id: raw.id, name: typeof raw.name === 'string' ? raw.name.slice(0, 60) : raw.id, file: typeof raw.file === 'string' ? raw.file.slice(0, 120) : '',
    unit: typeof raw.unit === 'string' ? raw.unit.slice(0, 8) : 's', rows: order.map((i) => rows[i]),
  };
}

/** What a source set to this table takes: the rows meant for it (its own id, or no source named). */
export function rowsFor(table, sourceId) {
  return table ? table.rows.filter((r) => !r.source || r.source === sourceId) : [];
}

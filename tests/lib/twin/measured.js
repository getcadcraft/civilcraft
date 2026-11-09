/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — DOM-free library. */
/**
 * measured.js — compare a simulated run with a measured line (0.9 TW.12). DOM-free; the flow code is handed in. Reads ../flow/csv.js only.
 *
 *   parseMeasured(text, { timeUnit, clockBase }) → { ok, events: [{ part, point, t }], points: [names in order of first time], parts, error }
 *   passagesOf(events)            → Map part → { point: t }              (a part's time at each named point)
 *   simPassages(trace, points, graph) → Map load → { point: t }          from the simulation's trace (a sink's point = the moment its feeding item let the load go; a photo-eye keeps no trace and cannot be a point)
 *   lineStats(passages, { from, to, t0, t1 }) → { throughput, wip, ride, byPoint }      the SAME function reduces the measured and the simulated line
 *   compareLine(a, b)             → rows [{ measure, unit, measured, simulated, diff, pct }]   diff = simulated − measured, pct = diff / measured × 100
 *   await compareMeasured({ text, layout, flow, from, to, source, skip, seed, timeUnit }) → { ok, error?, rows, measured, simulated, window, notes[] }
 *   compareCsv(rows)              → CSV text
 *
 * THE FILE (CSV; comma, semicolon or tab; the first non-comment row names the columns, not case sensitive):
 *   part | id | part_id        which part (any text up to 60 characters; the same text means the same part)
 *   point | station | location the named point it passed (a Material flow item id, or `<id>.out` for the moment it LEFT that item;
 *                              any other name is kept for the file but cannot be lined up with the simulation)
 *   time_s | time_min | time_h | time | clock    when (same as the orders file: `clock` counts from the first row's time of day)
 * One row per part per point. A part seen twice at one point is a bad row (a line that loops needs a point name per pass).
 * As with the orders file the FIRST bad row stops the read (code, line, column, value) and nothing is skipped.
 * Codes: empty, no-part-column, no-point-column, no-time-column, two-time-columns, bad-part, bad-point, bad-time, negative-time, bad-clock,
 * short-row, too-many-cells, too-many-rows, bad-quote, duplicate-pass.
 *
 * WHAT IS COMPARED, in the same words for both lines. Time 0 is the first time any part is seen at the `from` point in the measured file
 * (plus `skip` seconds of warm-up, left out of the numbers). A pass later than the end of the window (the last measured time at the `to` point)
 * counts as not having happened, in both lines.
 *   Throughput  parts per hour passing the `to` point inside the window; also every point's own count.
 *   Queue       the parts that have passed `from` and not yet `to` (work in the stretch): its time average over the window, and its largest.
 *   Ride        the time from `from` to `to` of the parts that made it: mean, median, 95th percentile, standard deviation, count.
 * The simulated run is fed the MEASURED arrivals at the `from` point when that point is a source (the orders mode, TW.15), so the difference
 * shows what the model does with the same arrivals; any other `from` leaves the model's own sources in charge and the notes say so.
 * The model is never tuned to the data here. A difference is the model minus the measurement; the percentage is of the measurement.
 */
import { readRecord, parseClock, number } from '../flow/csv.js';

export const MAX_EVENTS = 200000;
const TIME_UNITS = { time_s: 1, time_min: 60, time_h: 3600, s: 1, min: 60, h: 3600 };
const NAME_RE = /^[^\u0000-\u001f<>]{1,60}$/;

function fail(code, line, column, value) { return { ok: false, events: [], points: [], parts: 0, error: { code, line, column, value: String(value ?? '').slice(0, 120) } }; }

export function parseMeasured(text, { timeUnit = 's', clockBase = null } = {}) {
  if (typeof text !== 'string') return fail('empty', 0, '', '');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
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
  const col = (names) => names.filter((n) => header.includes(n));
  const timeCols = col(['time_s', 'time_min', 'time_h', 'time', 'clock']);
  const partCols = col(['part', 'id', 'part_id']), pointCols = col(['point', 'station', 'location']);
  if (!partCols.length) return fail('no-part-column', 1, '', header.join(','));
  if (!pointCols.length) return fail('no-point-column', 1, '', header.join(','));
  if (!timeCols.length) return fail('no-time-column', 1, '', header.join(','));
  if (timeCols.length > 1) return fail('two-time-columns', 1, timeCols.join(' + '), header.join(','));
  const tcol = timeCols[0], iT = header.indexOf(tcol), iPart = header.indexOf(partCols[0]), iPoint = header.indexOf(pointCols[0]);
  if (tcol === 'time' && !(timeUnit in TIME_UNITS)) return fail('bad-time', 1, 'time', timeUnit);
  const mul = tcol === 'clock' ? 1 : tcol === 'time' ? TIME_UNITS[timeUnit] : TIME_UNITS[tcol];
  const events = [], seen = new Set(), lines = [];
  while (pos < text.length) {
    const e = lineEnd(pos), raw = text.slice(pos, e).replace(/\r$/, ''), tr = raw.trim();
    line++;
    if (tr === '' || tr[0] === '#') { pos = e + 1; continue; }
    const rec = readRecord(text, pos, delim);
    if (rec.badQuote) return fail('bad-quote', line, '', raw);
    const consumed = text.slice(pos, rec.next); line += (consumed.match(/\n/g) || []).length - (/\n$/.test(consumed) ? 1 : 0);
    pos = rec.next;
    const c = rec.cells;
    if (c.length > header.length) return fail('too-many-cells', line, '', raw);
    if (c.length <= Math.max(iT, iPart, iPoint)) return fail('short-row', line, '', raw);
    if (events.length >= MAX_EVENTS) return fail('too-many-rows', line, '', raw);
    const part = c[iPart].trim(), point = c[iPoint].trim(), tv = c[iT].trim();
    if (!NAME_RE.test(part)) return fail('bad-part', line, header[iPart], part);
    if (!NAME_RE.test(point)) return fail('bad-point', line, header[iPoint], point);
    let t;
    if (tcol === 'clock') { t = parseClock(tv); if (t === null) return fail('bad-clock', line, tcol, tv); }
    else { const n = number(tv); if (!Number.isFinite(n)) return fail('bad-time', line, tcol, tv); if (n < 0) return fail('negative-time', line, tcol, tv); t = n * mul; }
    if (!Number.isFinite(t) || t > 1e9) return fail('bad-time', line, tcol, tv);
    const key = part + '\u0000' + point;
    if (seen.has(key)) return fail('duplicate-pass', line, header[iPoint], part + ' at ' + point);
    seen.add(key); events.push({ part, point, t }); lines.push(line);
  }
  if (!events.length) return fail('empty', line, '', '');
  if (tcol === 'clock') {
    const base = Number.isFinite(clockBase) && clockBase !== null ? clockBase : events[0].t;
    for (let i = 0; i < events.length; i++) { events[i].t -= base; if (events[i].t < 0) return fail('negative-time', lines[i], 'clock', events[i].t + base); }
  }
  for (const e of events) e.t = Math.round(e.t * 1e6) / 1e6;
  const first = new Map();
  for (const e of events) if (!first.has(e.point) || e.t < first.get(e.point)) first.set(e.point, e.t);
  const points = [...first.keys()].sort((a, b) => first.get(a) - first.get(b) || (a < b ? -1 : 1));
  return { ok: true, events, points, parts: new Set(events.map((e) => e.part)).size, unit: tcol === 'clock' ? 'clock' : tcol === 'time' ? timeUnit : tcol.slice(5), error: null };
}

export function passagesOf(events) {
  const m = new Map();
  for (const e of events) { let p = m.get(e.part); if (!p) m.set(e.part, (p = {})); p[e.point] = e.t; }
  return m;
}

/** The simulation's trace → passages. A point `id` is the moment a load entered that item; `id.out` the moment it left (a load still inside has none). */
export function simPassages(trace, points, graph = null) {
  const out = new Map();
  if (!trace || !trace.res) return out;
  const want = new Map();
  const sinks = new Set(graph ? graph.elements.filter((e) => e.type === 'sink').map((e) => e.id) : []);
  for (const pt of points) {
    let m = /^(.*)\.out$/.exec(pt), id = m ? m[1] : pt, leave = !!m;
    // a sink keeps no load, so its point is the moment the load left the item that feeds it
    if (!m && sinks.has(id)) { const l = graph.links.find((x) => x.to === id); if (l) { id = l.from; leave = true; } }
    if (!want.has(id)) want.set(id, []);
    want.get(id).push({ pt, leave });
  }
  for (const r of trace.res) {
    const w = want.get(r.el);
    if (!w) continue;
    for (const { pt, leave } of w) {
      const t = leave ? r.t1 : r.t0;
      if (!Number.isFinite(t)) continue;
      let p = out.get(r.l); if (!p) out.set(r.l, (p = {}));
      p[pt] = t;
    }
  }
  return out;
}

function quantile(sorted, q) {
  if (!sorted.length) return null;
  const x = (sorted.length - 1) * q, lo = Math.floor(x), hi = Math.ceil(x);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (x - lo);
}

/** The numbers both lines are reduced to. Times in `passages` are seconds from the same zero; the window is [t0, t1]. */
export function lineStats(passages, { from, to, t0 = 0, t1 }) {
  const span = t1 - t0;
  const byPoint = {};
  const rides = [], marks = [];
  for (const p of passages.values()) {
    for (const [pt, t] of Object.entries(p)) if (t >= t0 && t <= t1) byPoint[pt] = (byPoint[pt] || 0) + 1;
    const a = p[from], b = p[to];
    const aIn = a !== undefined && a <= t1, bIn = b !== undefined && b <= t1;
    if (aIn && bIn && b >= t0) rides.push(b - a);   // the ride of a part that reached `to` inside the window
    // in the stretch from `a` until `b` (or the end of the window): +1 at a, -1 at b; a part that was through before the window opened is not in it
    if (aIn && !(bIn && b <= t0)) { marks.push([Math.max(a, t0), 1]); if (bIn) marks.push([b, -1]); }
  }
  marks.sort((x, y) => x[0] - y[0] || x[1] - y[1]);   // at one instant the leaving part goes first
  let n = 0, last = t0, area = 0, max = 0;
  for (const [t, d] of marks) { area += n * (t - last); last = t; n += d; if (n > max) max = n; }
  area += n * (t1 - last);
  const sorted = rides.slice().sort((x, y) => x - y), cnt = sorted.length, mean = cnt ? sorted.reduce((s, x) => s + x, 0) / cnt : null;
  const sd = cnt > 1 ? Math.sqrt(sorted.reduce((s, x) => s + (x - mean) ** 2, 0) / (cnt - 1)) : null;
  const done = byPoint[to] || 0;
  return {
    throughput: span > 0 ? (done / span) * 3600 : null, done,
    wip: { mean: span > 0 ? area / span : null, max },
    ride: { n: cnt, mean, median: quantile(sorted, 0.5), p95: quantile(sorted, 0.95), sd },
    byPoint,
  };
}

const rowOf = (measure, unit, a, b) => ({ measure, unit, measured: a, simulated: b, diff: a === null || b === null ? null : b - a, pct: a === null || b === null || a === 0 ? null : ((b - a) / a) * 100 });
export function compareLine(a, b) {
  const rows = [
    rowOf('throughput', 'parts/h', a.throughput, b.throughput),
    rowOf('queue-mean', 'parts', a.wip.mean, b.wip.mean),
    rowOf('queue-max', 'parts', a.wip.max, b.wip.max),
    rowOf('ride-mean', 's', a.ride.mean, b.ride.mean),
    rowOf('ride-median', 's', a.ride.median, b.ride.median),
    rowOf('ride-p95', 's', a.ride.p95, b.ride.p95),
    rowOf('ride-sd', 's', a.ride.sd, b.ride.sd),
    rowOf('ride-count', 'parts', a.ride.n, b.ride.n),
  ];
  const pts = [...new Set([...Object.keys(a.byPoint), ...Object.keys(b.byPoint)])].sort();
  for (const p of pts) rows.push({ ...rowOf('count', 'parts', a.byPoint[p] || 0, b.byPoint[p] || 0), point: p });
  return rows;
}

/** Parse, line up, run the model on the same arrivals, reduce both lines the same way, compare. `flow` = { buildGraph, simulate, cleanLayout }. */
export function compareMeasured({ text, layout, flow, from, to, source = null, skip = 0, seed = 1, timeUnit = 's', clockBase = null, parsed = null }) {
  const m = parsed || parseMeasured(text, { timeUnit, clockBase });
  if (!m.ok) return { ok: false, error: m.error, rows: [], notes: [] };
  const notes = [];
  if (!m.points.length) return { ok: false, error: { code: 'empty', line: 0, column: '', value: '' }, rows: [], notes };
  const f = from && m.points.includes(from) ? from : m.points[0];
  const tp = to && m.points.includes(to) ? to : m.points[m.points.length - 1];
  if (f === tp) return { ok: false, error: { code: 'same-point', line: 0, column: '', value: f }, rows: [], notes };
  const pass = passagesOf(m.events);
  const origin = Math.min(...[...pass.values()].map((p) => p[f]).filter((x) => x !== undefined));
  if (!Number.isFinite(origin)) return { ok: false, error: { code: 'no-start', line: 0, column: '', value: f }, rows: [], notes };
  const shifted = new Map();
  for (const [k, p] of pass) shifted.set(k, Object.fromEntries(Object.entries(p).map(([pt, t]) => [pt, t - origin])));
  const ends = [...shifted.values()].map((p) => p[tp]).filter((x) => x !== undefined);
  if (!ends.length) return { ok: false, error: { code: 'no-end', line: 0, column: '', value: tp }, rows: [], notes };
  const t1 = Math.max(...ends), t0 = Math.max(0, skip);
  if (!(t1 > t0)) return { ok: false, error: { code: 'window-empty', line: 0, column: '', value: String(t1) }, rows: [], notes };
  // the model: measured arrivals at `from` when that is a source
  const baseLayout = flow.cleanLayout(JSON.parse(JSON.stringify(layout))).layout;
  const src = baseLayout.items.find((i) => i.kind === 'source' && (i.id === (source || f)));
  let usedArrivals = false;
  if (src && (source || src.id === f)) {
    const rows = [...shifted.entries()].filter(([, p]) => p[f] !== undefined).map(([k, p]) => ({ t: Math.max(0, Math.round(p[f] * 1e6) / 1e6), label: k.slice(0, 60) })).sort((a, b) => a.t - b.t);
    baseLayout.orders = (baseLayout.orders || []).filter((o) => o.id !== 'measured');
    baseLayout.orders.push({ id: 'measured', name: 'measured', file: '', unit: 's', rows });
    src.params = { ...src.params, mode: 'orders', orders: 'measured' };
    usedArrivals = true;
  } else notes.push('arrivals-not-fed');
  const built = flow.buildGraph(baseLayout);
  if (built.problems && built.problems.length) return { ok: false, error: { code: 'layout', line: 0, column: '', value: built.problems.map((p) => p.code + (p.id ? ':' + p.id : '')).join(', ') }, rows: [], notes };
  const until = t1 + 1;
  const res = flow.simulate(built.graph, { seed, until, warmup: 0, traceUntil: until, maxTrace: 400000 });
  if (!res.ok) return { ok: false, error: { code: 'run-failed', line: 0, column: '', value: String(res.failed?.code || 'stopped') }, rows: [], notes };
  if (res.trace && res.trace.full) notes.push('trace-full');
  const sim = simPassages(res.trace, m.points, built.graph);
  const unknown = m.points.filter((p) => ![...sim.values()].some((x) => x[p] !== undefined));
  for (const p of unknown) notes.push('point-not-in-model:' + p);
  if (unknown.includes(f) || unknown.includes(tp)) return { ok: false, error: { code: 'point-missing', line: 0, column: '', value: unknown.includes(f) ? f : tp }, rows: [], notes };
  const opts = { from: f, to: tp, t0, t1 };
  const measured = lineStats(shifted, opts), simulated = lineStats(sim, opts);
  if (measured.ride.n < 30) notes.push('few-parts');
  if (skip > 0) notes.push('warmup-left-out');
  return { ok: true, rows: compareLine(measured, simulated), measured, simulated, window: { from: f, to: tp, t0, t1, origin }, usedArrivals, notes, points: m.points, parts: m.parts };
}

const q = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s) && !/^-?\d/.test(s)) s = "'" + s; return /[",;\n\r\t]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const r4 = (x) => (x === null || x === undefined ? '' : Math.round(x * 1e4) / 1e4);
export function compareCsv(rows) {
  return ['measure,point,unit,measured,simulated,difference,difference_percent_of_measured', ...rows.map((r) => [r.measure, r.point || '', r.unit, r4(r.measured), r4(r.simulated), r4(r.diff), r4(r.pct)].map(q).join(','))].join('\n') + '\n';
}

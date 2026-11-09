/* SPDX-License-Identifier: Apache-2.0 */
/**
 * report.js — a run's results as rows for the stats panel and as CSV (0.8 SU.858 step 4, session sx-flow). DOM-free.
 *
 *   summaryRows(result, t) → [{label, value}]                 the run as a whole
 *   elementRows(result, t) → [{id, kind, cells: [{label, value}]}]   per element, in graph order
 *   toCsv(result, t) → text                                   one row per (element, measure, value) + the summary and vehicles
 * t(key, vars) gives the words (the add-on's strings). Numbers are rounded for people (3 significant places) in the rows and
 * kept at full precision in the CSV. CSV cells that start like a formula (= + - @) get a leading quote.
 */

export const fmt = (x) => {
  if (typeof x !== 'number' || !Number.isFinite(x)) return String(x ?? '');
  if (Number.isInteger(x)) return String(x);
  const a = Math.abs(x);
  return a >= 100 ? x.toFixed(0) : a >= 10 ? x.toFixed(1) : x.toFixed(2);
};
const pct = (x) => (Number.isFinite(x) ? (x * 100).toFixed(1) + ' %' : '');

export function summaryRows(r, t) {
  return [
    { key: 'done', label: t('stat.done'), value: r.done },
    { key: 'perHour', label: t('stat.perHour'), value: fmt(r.perHour) },
    { key: 'leadMean', label: t('stat.leadMean'), value: fmt(r.lead.mean) },
    { key: 'leadP95', label: t('stat.leadP95'), value: fmt(r.lead.p95) },
    { key: 'leadMax', label: t('stat.leadMax'), value: fmt(r.lead.max) },
    { key: 'wip', label: t('stat.wip'), value: r.wip },
    ...Object.entries(r.byType).map(([ty, b]) => ({ key: 'type:' + ty, label: t('stat.type', { type: ty }), value: `${b.done} · ${fmt(b.leadMean)} s` })),
  ];
}

const MEASURES = {
  source: [['created', 'n'], ['backlogMean', 'x'], ['backlogMax', 'n']],
  sink: [['done', 'n'], ['perHour', 'x'], ['leadMean', 'x'], ['leadMax', 'x']],
  conveyor: [['passed', 'n'], ['onMean', 'x'], ['onMax', 'n'], ['blockedFraction', 'p']],
  buffer: [['passed', 'n'], ['mean', 'x'], ['max', 'n']],
  station: [['served', 'n'], ['utilisation', 'p'], ['blocked', 'p'], ['queueMean', 'x'], ['queueMax', 'n'], ['waitMean', 'x']],
  gate: [['passed', 'n'], ['openFraction', 'p']],
  merge: [['passed', 'n']],
  divert: [['passed', 'n']],
  sensor: [['passed', 'n']],
  'agv-pick': [['passed', 'n'], ['mean', 'x'], ['max', 'n']],
  'agv-drop': [['passed', 'n'], ['mean', 'x'], ['max', 'n']],
};

export function elementRows(r, t) {
  const out = [];
  for (const [id, s] of Object.entries(r.elements)) {
    const cells = (MEASURES[s.type] || []).map(([k, how]) => ({ key: k, label: t('stat.' + k), value: how === 'p' ? pct(s[k]) : fmt(s[k]) }));
    if (s.availability !== undefined) cells.push({ key: 'availability', label: t('stat.availability'), value: pct(s.availability) }, { key: 'failures', label: t('stat.failures'), value: s.failures });
    if (s.calendarOpen !== undefined) cells.push({ key: 'calendarOpen', label: t('stat.calendarOpen'), value: pct(s.calendarOpen) });
    if (s.byInput) for (const [p, n] of Object.entries(s.byInput)) cells.push({ key: 'in:' + p, label: t('stat.fromInput', { n: p.replace(/\D/g, '') }), value: n });
    if (s.byOutput) s.byOutput.forEach((n, i) => cells.push({ key: 'out:' + (i + 1), label: t('stat.toOutput', { n: i + 1 }), value: n }));
    out.push({ id, kind: s.type, cells });
  }
  for (const v of r.vehicles) {
    out.push({ id: t('stat.vehicle', { n: v.vehicle }), kind: 'vehicle', cells: [
      { key: 'delivered', label: t('stat.delivered'), value: v.delivered },
      { key: 'busy', label: t('stat.busy'), value: pct(v.busy) },
      { key: 'loaded', label: t('stat.loadedTravel'), value: pct(v.time.loaded) },
      { key: 'empty', label: t('stat.emptyTravel'), value: pct(v.time.empty) },
      { key: 'waiting', label: t('stat.waiting'), value: pct(v.time.waiting) },
      ...(v.availability !== undefined ? [{ key: 'availability', label: t('stat.availability'), value: pct(v.availability) }, { key: 'failures', label: t('stat.failures'), value: v.failures }] : []),
    ] });
  }
  return out;
}

const cell = (v) => {
  let s = typeof v === 'number' ? (Number.isFinite(v) ? String(v) : '') : String(v ?? '');
  if (/^[=+\-@]/.test(s) && !/^-?\d/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

export function toCsv(r, t) {
  const rows = [[t('csv.element'), t('csv.kind'), t('csv.measure'), t('csv.value')]];
  const add = (a, b, c, d) => rows.push([a, b, c, d]);
  add('', 'run', 'seed', r.seed); add('', 'run', 'until_s', r.until); add('', 'run', 'warmup_s', r.warmup);
  add('', 'run', 'done', r.done); add('', 'run', 'per_hour', r.perHour); add('', 'run', 'wip_at_end', r.wip);
  for (const [k, v] of Object.entries(r.lead)) add('', 'run', 'lead_' + k + (k === 'n' ? '' : '_s'), v);
  for (const [ty, b] of Object.entries(r.byType)) { add('', 'type:' + ty, 'done', b.done); add('', 'type:' + ty, 'lead_mean_s', b.leadMean); }
  for (const [id, s] of Object.entries(r.elements)) {
    for (const [k, v] of Object.entries(s)) {
      if (k === 'type') continue;
      if (v && typeof v === 'object') { for (const [k2, v2] of Object.entries(v)) add(id, s.type, k + '.' + k2, v2); }
      else add(id, s.type, k, v);
    }
  }
  for (const v of r.vehicles) {
    const id = 'vehicle-' + v.vehicle;
    add(id, 'vehicle', 'delivered', v.delivered); add(id, 'vehicle', 'dist_loaded_m', v.distLoaded); add(id, 'vehicle', 'dist_empty_m', v.distEmpty);
    for (const [k, x] of Object.entries(v.time)) add(id, 'vehicle', 'time_' + k, x);
  }
  if (r.failed) { add('', 'run', 'stopped', r.failed.code); add('', 'run', 'stopped_at_s', r.failed.t); }
  return rows.map((row) => row.map(cell).join(',')).join('\r\n') + '\r\n';
}

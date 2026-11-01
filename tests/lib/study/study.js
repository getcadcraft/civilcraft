/* SPDX-License-Identifier: Apache-2.0 */
/**
 * study.js — design studies (0.8 round 2, EG.33; DOM-free, no imports, canonical copy: lib/study/).
 *
 * Many variants of one design, each run through the same analysis, then a trade-off chart and a pick. A study is plain data (it is
 * saved in the file, sent to a worker, read back from a file we did not write):
 *
 *   { v: 1, title,
 *     source: { kind: 'parameters', params: [{ name, values: [..] } | { name, from, to, steps }], mode: 'grid' | 'random', count? }
 *           | { kind: 'configs', names: [..] }
 *           | { kind: 'list', variants: [{ label?, set: { name: value } }] }          (what a script wrote, or the person typed)
 *     metrics: [{ key, label?, unit?, goal: 'min' | 'max' | 'none', limit?: number }]   (limit: min → must be ≤, max → must be ≥)
 *     picked: variant id | null }
 *
 * The caller supplies `evaluate(variant, { cancelled }) → Promise<{ [metricKey]: number } | { error }>`; a PartCraft study runs the
 * rebuild and the solver in a worker per variant, a frame study re-solves the frame. This file never knows which.
 *
 *   FORMAT, VERSION, LIMITS, readStudy(raw), expandVariants(study, { configs? }) → [{ id, label, set }],
 *   runStudy(study, evaluate, { concurrency, onProgress, cancelled }) → Promise<{ rows, failed, cancelled }>,
 *   feasible(study, row), paretoFront(study, rows), rankRows(study, rows, weights?), tradeoff(study, rows, xKey, yKey) → chart data,
 *   chartSvg(chart, { width, height, labels }) → string, studyProblems(study, result) → [problem], pick(study, id) → study
 */
export const FORMAT = 'cc-study';
export const VERSION = 1;
export const LIMITS = { variants: 500, params: 8, metrics: 8, name: 60, steps: 200 };

const bad = (m) => { throw new Error(m); };
const str = (v, what, max = LIMITS.name) => (typeof v === 'string' && v.length > 0 && v.length <= max ? v : bad(what + ' must be text of 1 to ' + max + ' characters.'));   // i18n-ignore: callers show these as file-read errors
const num = (v, what) => (typeof v === 'number' && Number.isFinite(v) ? v : bad(what + ' must be a number.'));   // i18n-ignore
const NAME = /^[A-Za-z_][A-Za-z0-9_.-]{0,59}$/;

/** Untrusted input (a file, an assistant's tool call) → a clean study, or throws with a plain message. */
export function readStudy(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) bad('A study must be an object.');   // i18n-ignore
  const out = { v: VERSION, title: raw.title === undefined ? '' : String(raw.title).slice(0, 120) };
  const s = raw.source || bad('A study needs a source of variants.');   // i18n-ignore
  if (s.kind === 'parameters') {
    if (!Array.isArray(s.params) || !s.params.length || s.params.length > LIMITS.params) bad('A parameter study needs 1 to ' + LIMITS.params + ' parameters.');   // i18n-ignore
    const seen = new Set();
    const params = s.params.map((p) => {
      const name = String(p && p.name);
      if (!NAME.test(name) || seen.has(name)) bad('Parameter names must be unique and plain: "' + name.slice(0, 30) + '".');   // i18n-ignore
      seen.add(name);
      if (Array.isArray(p.values)) {
        if (!p.values.length || p.values.length > LIMITS.steps) bad('Parameter ' + name + ' needs 1 to ' + LIMITS.steps + ' values.');   // i18n-ignore
        return { name, values: p.values.map((x, i) => (typeof x === 'string' ? str(x, name + ' value ' + (i + 1)) : num(x, name + ' value ' + (i + 1)))) };
      }
      const from = num(p.from, name + ' from'), to = num(p.to, name + ' to'), steps = Math.round(num(p.steps, name + ' steps'));
      if (steps < 1 || steps > LIMITS.steps) bad('Parameter ' + name + ' needs 1 to ' + LIMITS.steps + ' steps.');   // i18n-ignore
      return { name, from, to, steps };
    });
    const mode = s.mode === 'random' ? 'random' : 'grid';
    out.source = { kind: 'parameters', params, mode };
    if (mode === 'random') out.source.count = Math.max(1, Math.min(LIMITS.variants, Math.round(num(s.count === undefined ? 20 : s.count, 'count'))));
    if (s.seed !== undefined) out.source.seed = Math.round(num(s.seed, 'seed')) >>> 0;
  } else if (s.kind === 'configs') {
    if (!Array.isArray(s.names) || !s.names.length || s.names.length > LIMITS.variants) bad('A configuration study needs 1 to ' + LIMITS.variants + ' configuration names.');   // i18n-ignore
    out.source = { kind: 'configs', names: s.names.map((n, i) => str(n, 'Configuration name ' + (i + 1))) };
  } else if (s.kind === 'list') {
    if (!Array.isArray(s.variants) || !s.variants.length || s.variants.length > LIMITS.variants) bad('A list study needs 1 to ' + LIMITS.variants + ' variants.');   // i18n-ignore
    out.source = { kind: 'list', variants: s.variants.map((v, i) => {
      const set = {};
      for (const [k, x] of Object.entries((v && v.set) || {})) { if (!NAME.test(k)) bad('Variant ' + (i + 1) + ' has a bad parameter name.'); set[k] = typeof x === 'string' ? str(x, k) : num(x, k); }   // i18n-ignore
      return { label: v && v.label ? String(v.label).slice(0, LIMITS.name) : 'V' + (i + 1), set };
    }) };
  } else bad('A study source is parameters, configs or list.');   // i18n-ignore
  if (!Array.isArray(raw.metrics) || !raw.metrics.length || raw.metrics.length > LIMITS.metrics) bad('A study needs 1 to ' + LIMITS.metrics + ' metrics.');   // i18n-ignore
  const keys = new Set();
  out.metrics = raw.metrics.map((m) => {
    const key = String(m && m.key);
    if (!NAME.test(key) || keys.has(key)) bad('Metric keys must be unique and plain: "' + key.slice(0, 30) + '".');   // i18n-ignore
    keys.add(key);
    const goal = m.goal === 'min' || m.goal === 'max' ? m.goal : 'none';
    const o = { key, goal };
    if (m.label) o.label = String(m.label).slice(0, LIMITS.name);
    if (m.unit) o.unit = String(m.unit).slice(0, 16);
    if (m.limit !== undefined && m.limit !== null) { if (goal === 'none') bad('Metric ' + key + ' has a limit but no goal.'); o.limit = num(m.limit, key + ' limit'); }   // i18n-ignore
    return o;
  });
  out.picked = typeof raw.picked === 'string' ? raw.picked.slice(0, 40) : null;
  return out;
}

/** Small deterministic generator (mulberry32) so a random study can be run again and give the same variants. */
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const levels = (p) => (p.values ? p.values.slice() : Array.from({ length: p.steps }, (_, i) => (p.steps === 1 ? p.from : p.from + (p.to - p.from) * i / (p.steps - 1))));
const clean = (x) => (typeof x === 'number' ? +x.toPrecision(12) : x);

/** The variants a study asks for: [{ id: 'v1', label, set: { param: value } }] (configs: set = { $config: name }). */
export function expandVariants(study) {
  const s = study.source;
  let list;
  if (s.kind === 'configs') list = s.names.map((n) => ({ label: n, set: { $config: n } }));
  else if (s.kind === 'list') list = s.variants.map((v) => ({ label: v.label, set: { ...v.set } }));
  else if (s.mode === 'random') {
    const r = rng(s.seed === undefined ? 1 : s.seed);
    list = Array.from({ length: s.count }, () => ({ set: Object.fromEntries(s.params.map((p) => {
      if (p.values) return [p.name, p.values[Math.floor(r() * p.values.length)]];
      return [p.name, clean(p.from + (p.to - p.from) * r())];
    })) }));
  } else {
    const ls = s.params.map((p) => levels(p).map(clean));
    const total = ls.reduce((a, l) => a * l.length, 1);
    if (total > LIMITS.variants) bad('That grid is ' + total + ' variants; the most one study runs is ' + LIMITS.variants + '. Use fewer steps or a random study.');   // i18n-ignore
    list = [];
    const idx = new Array(ls.length).fill(0);
    for (let n = 0; n < total; n++) {
      list.push({ set: Object.fromEntries(s.params.map((p, i) => [p.name, ls[i][idx[i]]])) });
      for (let i = ls.length - 1; i >= 0; i--) { if (++idx[i] < ls[i].length) break; idx[i] = 0; }
    }
  }
  return list.map((v, i) => ({ id: 'v' + (i + 1), label: v.label || Object.entries(v.set).map(([k, x]) => k + '=' + x).join(', '), set: v.set }));
}

/**
 * Run every variant through `evaluate`, `concurrency` at a time (a worker pool: the caller's evaluate owns the worker).
 * onProgress({ done, total, id }) after each. A variant whose evaluate throws or answers { error } is kept as a failed row, never
 * dropped (a study that hides its failures lies about its best). `cancelled()` stops starting new ones.
 */
export async function runStudy(study, evaluate, { concurrency = 4, onProgress = null, cancelled = () => false } = {}) {
  const variants = expandVariants(study), rows = new Array(variants.length).fill(null);
  let next = 0, done = 0;
  const worker = async () => {
    while (!cancelled()) {
      const i = next++;
      if (i >= variants.length) return;
      const v = variants[i];
      let res;
      try { res = await evaluate(v, { cancelled }); } catch (e) { res = { error: String((e && e.message) || e) }; }
      const row = { id: v.id, label: v.label, set: v.set };
      if (!res || res.error !== undefined) row.error = res && res.error !== undefined ? String(res.error) : 'No result.';   // i18n-ignore: the solver's own words are passed through
      else for (const m of study.metrics) { const x = res[m.key]; if (typeof x === 'number' && Number.isFinite(x)) (row.values ||= {})[m.key] = x; else (row.missing ||= []).push(m.key); }
      rows[i] = row; done++;
      if (onProgress) onProgress({ done, total: variants.length, id: v.id });
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrency, variants.length)) }, worker));
  const got = rows.filter(Boolean);
  return { rows: got, failed: got.filter((r) => r.error !== undefined || r.missing).length, cancelled: got.length < variants.length };
}

/** A row meets every metric limit (min: value ≤ limit; max: value ≥ limit) and has all its numbers. */
export function feasible(study, row) {
  if (!row || row.error !== undefined || row.missing || !row.values) return false;
  return study.metrics.every((m) => m.limit === undefined || (m.goal === 'min' ? row.values[m.key] <= m.limit : row.values[m.key] >= m.limit));
}

const dom = (study, a, b) => {   // a is no worse than b on every goal and better on one
  let better = false;
  for (const m of study.metrics) {
    if (m.goal === 'none') continue;
    const d = m.goal === 'min' ? b.values[m.key] - a.values[m.key] : a.values[m.key] - b.values[m.key];
    if (d < 0) return false;
    if (d > 0) better = true;
  }
  return better;
};

/** The rows nobody else beats on every goal at once (feasible rows only): the trade-off front. */
export function paretoFront(study, rows) {
  const ok = rows.filter((r) => feasible(study, r));
  return ok.filter((a) => !ok.some((b) => b !== a && dom(study, b, a)));
}

/** Rank feasible rows by a weighted sum of goals, each metric scaled 0 (worst) to 1 (best) across the feasible rows. */
export function rankRows(study, rows, weights = {}) {
  const ok = rows.filter((r) => feasible(study, r)), goals = study.metrics.filter((m) => m.goal !== 'none');
  const span = Object.fromEntries(goals.map((m) => { const v = ok.map((r) => r.values[m.key]); return [m.key, [Math.min(...v), Math.max(...v)]]; }));
  const score = (r) => goals.reduce((s, m) => { const [lo, hi] = span[m.key], w = weights[m.key] === undefined ? 1 : weights[m.key], x = hi === lo ? 1 : (r.values[m.key] - lo) / (hi - lo); return s + w * (m.goal === 'min' ? 1 - x : x); }, 0);
  return ok.map((r) => ({ id: r.id, label: r.label, score: score(r) })).sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : 1));
}

const niceTicks = (lo, hi, n = 5) => {
  if (!(hi > lo)) return [lo];
  const raw = (hi - lo) / n, p = 10 ** Math.floor(Math.log10(raw)), f = raw / p, step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(+v.toPrecision(10));
  return out;
};

/** The two-metric trade-off as data: points (with state ok / over-limit / failed), the front, axes with ticks. */
export function tradeoff(study, rows, xKey, yKey) {
  const mx = study.metrics.find((m) => m.key === xKey), my = study.metrics.find((m) => m.key === yKey);
  if (!mx || !my) bad('The chart axes must be metrics of the study.');   // i18n-ignore
  const front = new Set(paretoFront(study, rows).map((r) => r.id));
  const pts = rows.filter((r) => r.values && r.values[xKey] !== undefined && r.values[yKey] !== undefined).map((r) => ({ id: r.id, label: r.label, x: r.values[xKey], y: r.values[yKey], state: feasible(study, r) ? (front.has(r.id) ? 'front' : 'ok') : 'over' }));
  const ext = (k) => { const v = pts.map((p) => p[k]); return v.length ? [Math.min(...v), Math.max(...v)] : [0, 1]; };
  const [x0, x1] = ext('x'), [y0, y1] = ext('y');
  return { x: { key: xKey, label: mx.label || xKey, unit: mx.unit || '', goal: mx.goal, limit: mx.limit, min: x0, max: x1, ticks: niceTicks(x0, x1) }, y: { key: yKey, label: my.label || yKey, unit: my.unit || '', goal: my.goal, limit: my.limit, min: y0, max: y1, ticks: niceTicks(y0, y1) }, points: pts, front: pts.filter((p) => p.state === 'front').sort((a, b) => a.x - b.x) };
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/** The chart as an SVG string (colours are CSS variables with fallbacks so the page's theme applies; no scripts, no fonts fetched). */
export function chartSvg(chart, { width = 480, height = 320, picked = null, labels = { front: 'On the trade-off front', ok: 'Meets the limits', over: 'Over a limit' } } = {}) {
  const m = { l: 56, r: 14, t: 14, b: 44 }, W = width - m.l - m.r, H = height - m.t - m.b;
  const pad = (a, b) => (b > a ? [a - (b - a) * 0.06, b + (b - a) * 0.06] : [a - 1, b + 1]);
  const [xa, xb] = pad(chart.x.min, chart.x.max), [ya, yb] = pad(chart.y.min, chart.y.max);
  const X = (v) => +(m.l + (v - xa) / (xb - xa) * W).toFixed(1), Y = (v) => +(m.t + H - (v - ya) / (yb - ya) * H).toFixed(1);
  const col = { front: 'var(--chart-front,#0b7a5a)', ok: 'var(--chart-ok,#5b6b7b)', over: 'var(--chart-over,#c0392b)' };
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="${esc(chart.y.label + ' against ' + chart.x.label)}" font-family="inherit" font-size="11">`;
  for (const v of chart.x.ticks) s += `<line x1="${X(v)}" x2="${X(v)}" y1="${m.t}" y2="${m.t + H}" stroke="var(--chart-grid,#8883)"/><text x="${X(v)}" y="${m.t + H + 14}" text-anchor="middle" fill="currentColor">${esc(v)}</text>`;
  for (const v of chart.y.ticks) s += `<line y1="${Y(v)}" y2="${Y(v)}" x1="${m.l}" x2="${m.l + W}" stroke="var(--chart-grid,#8883)"/><text x="${m.l - 6}" y="${+Y(v) + 4}" text-anchor="end" fill="currentColor">${esc(v)}</text>`;
  if (chart.x.limit !== undefined && chart.x.limit > xa && chart.x.limit < xb) s += `<line x1="${X(chart.x.limit)}" x2="${X(chart.x.limit)}" y1="${m.t}" y2="${m.t + H}" stroke="${col.over}" stroke-dasharray="4 3"/>`;
  if (chart.y.limit !== undefined && chart.y.limit > ya && chart.y.limit < yb) s += `<line y1="${Y(chart.y.limit)}" y2="${Y(chart.y.limit)}" x1="${m.l}" x2="${m.l + W}" stroke="${col.over}" stroke-dasharray="4 3"/>`;
  if (chart.front.length > 1) s += `<polyline fill="none" stroke="${col.front}" stroke-width="1.5" points="${chart.front.map((p) => X(p.x) + ',' + Y(p.y)).join(' ')}"/>`;
  for (const p of chart.points) s += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="${p.id === picked ? 7 : 4.5}" fill="${p.state === 'over' ? 'none' : col[p.state]}" stroke="${col[p.state]}" stroke-width="${p.id === picked ? 3 : 1.5}" data-id="${esc(p.id)}"><title>${esc(p.label + ': ' + p.x + ' ' + chart.x.unit + ', ' + p.y + ' ' + chart.y.unit + ' (' + labels[p.state] + ')')}</title></circle>`;
  s += `<text x="${m.l + W / 2}" y="${height - 6}" text-anchor="middle" fill="currentColor">${esc(chart.x.label + (chart.x.unit ? ' (' + chart.x.unit + ')' : ''))}${chart.x.goal === 'min' ? ' ←' : chart.x.goal === 'max' ? ' →' : ''}</text>`;
  s += `<text transform="translate(12 ${m.t + H / 2}) rotate(-90)" text-anchor="middle" fill="currentColor">${esc(chart.y.label + (chart.y.unit ? ' (' + chart.y.unit + ')' : ''))}${chart.y.goal === 'min' ? ' ↓' : chart.y.goal === 'max' ? ' ↑' : ''}</text></svg>`;
  return s;
}

/**
 * The study's Problems (docs/0.8-PROBLEMS-SPEC.md § 1; rule 29), pure data: variants that failed to solve, and the case where
 * no variant meets the limits. `source` is the app's registered source name.
 *   study.fail     warning  n variants did not give numbers (the first error is in vars)
 *   study.none     warning  no variant meets every limit (the closest miss is named)
 *   study.partial  note     the run was stopped before every variant finished
 */
export function studyProblems(study, result, source = 'partcraft.study') {
  const out = [];
  if (!result) return out;
  const mk = (code, severity, vars) => ({ id: source + ':' + code, code, severity, msg: { key: 'study.p.' + code.split('.')[1], vars }, about: [{ kind: 'study', id: 'study' }], source: { kind: 'check', name: source } });
  const failed = result.rows.filter((r) => r.error !== undefined || r.missing);
  if (failed.length) out.push(mk('study.fail', 'warning', { n: failed.length, first: failed[0].label, why: failed[0].error !== undefined ? failed[0].error : 'missing ' + failed[0].missing.join(', ') }));
  if (result.cancelled) out.push(mk('study.partial', 'note', { done: result.rows.length }));
  const limited = study.metrics.some((m) => m.limit !== undefined);
  if (limited && result.rows.length && !result.rows.some((r) => feasible(study, r)) && result.rows.some((r) => r.values)) out.push(mk('study.none', 'warning', { n: result.rows.length }));
  return out;
}

/** Record the person's pick (an id from the rows) in the study; null clears it. Returns a new study. */
export function pick(study, id) { return { ...study, picked: id === null || id === undefined ? null : String(id).slice(0, 40) }; }

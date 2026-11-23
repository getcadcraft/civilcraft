/* SPDX-License-Identifier: Apache-2.0 */
/**
 * trend.js — trends of live tags (0.11 IND.12, the trend panel of the OPC UA connector and every other live source). DOM-free, numbers only: connect-ui.js draws them.
 *
 *   trendOf(store, id, { from?, to?, buckets = 300, gapS? }) → layout | null
 *        layout = { id, label, unit, from, to, n, shown, min, max, last, y: { lo, hi, ticks }, x: { ticks: [ms], stepS }, segments: [[[ms, value] …] …], limits: { low, high } }
 *        from / to (ms) default to the first and last sample. Points are thinned per time bucket to that bucket's first, lowest, highest and last value
 *        (so a peak is never lost); a gap (a bad-quality sample, or two samples further apart than gapS) starts a new segment.
 *        gapS defaults to 10 × the median spacing of the samples in the window (at least the tag's staleS when it has one).
 *   niceTicks(lo, hi, n = 5) → { lo, hi, step, ticks }        1 / 2 / 5 × 10^k steps that cover lo..hi
 *   timeTicks(from, to, n = 6) → { stepS, ticks: [ms] }         steps of 1 s … 1 day, …, on whole multiples of the step (UTC)
 *   trendCsv(store, ids, { from?, to? }) → 'tag,time,value\n…'  every held sample (gaps as an empty value), ISO times
 */
const SPANS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 10800, 21600, 43200, 86400, 172800, 604800, 2592000];

export function niceTicks(lo, hi, n = 5) {
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return { lo: 0, hi: 1, step: 0.25, ticks: [0, 0.25, 0.5, 0.75, 1] };
  if (hi < lo) [lo, hi] = [hi, lo];
  if (hi === lo) { const d = Math.abs(lo) * 0.05 || 1; lo -= d; hi += d; }
  const raw = (hi - lo) / Math.max(1, n), p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
  const a = Math.floor(lo / step + 1e-9) * step, b = Math.ceil(hi / step - 1e-9) * step, ticks = [];
  for (let v = a, i = 0; v <= b + step * 1e-9 && i < 100; v += step, i++) ticks.push(+v.toPrecision(12));
  return { lo: a, hi: b, step, ticks };
}

export function timeTicks(from, to, n = 6) {
  const span = Math.max(1, (to - from) / 1000), want = span / Math.max(1, n);
  const stepS = SPANS.find((s) => s >= want) || Math.ceil(want / 2592000) * 2592000, ms = stepS * 1000, ticks = [];
  for (let t = Math.ceil(from / ms) * ms, i = 0; t <= to && i < 200; t += ms, i++) ticks.push(t);
  return { stepS, ticks };
}

const median = (a) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };

export function trendOf(store, id, { from = null, to = null, buckets = 300, gapS = null } = {}) {
  const e = store && store.map && store.map.get(id); if (!e) return null;
  const all = store.history(id, { gaps: true }).map((p) => [p.t, p.value]);
  const t0 = from ?? (all.length ? all[0][0] : 0), t1 = to ?? (all.length ? all[all.length - 1][0] : 0);
  const pts = all.filter(([t]) => t >= t0 && t <= t1), vals = pts.filter(([, v]) => v != null);
  const dts = []; for (let i = 1; i < vals.length; i++) dts.push(vals[i][0] - vals[i - 1][0]);
  const gapMs = gapS != null ? gapS * 1000 : Math.max(10 * median(dts), (e.staleS || 0) * 1000) || Infinity;
  // segments split at gaps, then thinned per bucket
  const segs = []; let cur = [], prev = null;
  for (const p of pts) {
    if (p[1] == null) { if (cur.length) segs.push(cur); cur = []; prev = null; continue; }
    if (prev && p[0] - prev[0] > gapMs) { segs.push(cur); cur = []; }
    cur.push(p); prev = p;
  }
  if (cur.length) segs.push(cur);
  const width = Math.max(1, t1 - t0) / Math.max(1, buckets);
  const thin = (seg) => {
    if (seg.length <= 4) return seg;
    const out = []; let b = null, bucket = [];
    const flush = () => { if (!bucket.length) return; if (bucket.length <= 4) { out.push(...bucket); bucket = []; return; }
      let lo = bucket[0], hi = bucket[0]; for (const p of bucket) { if (p[1] < lo[1]) lo = p; if (p[1] > hi[1]) hi = p; }
      const keep = [bucket[0], lo, hi, bucket[bucket.length - 1]].filter((p, i, a) => a.indexOf(p) === i).sort((x, y) => x[0] - y[0]); out.push(...keep); bucket = []; };
    for (const p of seg) { const k = Math.floor((p[0] - t0) / width); if (k !== b) { flush(); b = k; } bucket.push(p); }
    flush(); return out;
  };
  const segments = segs.map(thin);
  let min = Infinity, max = -Infinity; for (const [, v] of vals) { if (v < min) min = v; if (v > max) max = v; }
  let lo = vals.length ? min : (e.low ?? 0), hi = vals.length ? max : (e.high ?? 1);
  if (e.low != null) lo = Math.min(lo, e.low); if (e.high != null) hi = Math.max(hi, e.high);
  const y = niceTicks(lo, hi, 5), x = timeTicks(t0, t1, 6);
  return { id, label: e.label, unit: e.unit, from: t0, to: t1, n: vals.length, shown: segments.reduce((s, g) => s + g.length, 0), min: vals.length ? min : null, max: vals.length ? max : null,
    last: vals.length ? vals[vals.length - 1][1] : null, y, x, segments, limits: { low: e.low, high: e.high }, gapS: Number.isFinite(gapMs) ? gapMs / 1000 : null };
}

const cell = (v) => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
export function trendCsv(store, ids, { from = -Infinity, to = Infinity } = {}) {
  const lines = ['tag,time,value'];
  for (const id of ids) for (const p of store.history(id, { gaps: true })) if (p.t >= from && p.t <= to) lines.push([cell(id), new Date(p.t).toISOString(), p.value == null ? '' : p.value].join(','));
  return lines.join('\n') + '\n';
}

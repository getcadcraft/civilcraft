/* SPDX-License-Identifier: Apache-2.0 */
/**
 * derive.js — the design figures a load calculation needs, worked out of one weather year (0.11 Track WX, WX.2). Host-free.
 *
 *   derive(epw, { base = 18.3, coolBase = 18.3 }) → {
 *       heat:  { t996, t990, source }     winter design temperature (°C). source 'station' = the station's published design conditions carried
 *                                         in the file; 'year' = the temperature this one year stays above for 99.6 % / 99 % of its hours
 *       cool:  { t004, t010, t020, wb004, source, date: { month, day } }   summer; date = the day of the year's hottest hour
 *       hdd, cdd                          degree-days of the year at `base` / `coolBase` (°C·day): Σ over days of max(0, base − day's mean)
 *       base, coolBase
 *       monthly: [12 × { mean, min, max, hdd, cdd, ghi }]     ghi = kWh/m² on the horizontal for the month (null when the file has none)
 *       mean                              the year's mean air temperature
 *       ground: { t, source }             a ground temperature for a floor on the ground: 'file' = the mean of the file's deepest ground
 *                                         temperatures; 'air' = the year's mean air temperature (the usual first estimate), said so
 *       n }
 *   percentile(sorted Float32Array, p) — the value at fraction p (0…1), straight-line between neighbours.
 *
 * One year is not a climate: the 'year' figures move a degree or two from year to year. The 'station' figures are the published ones.
 */
export const BASE_C = 18.3;   // 65 °F, the base the US degree-day tables use

export function percentile(sorted, p) {
  const n = sorted.length;
  if (!n) return NaN;
  const x = Math.min(1, Math.max(0, p)) * (n - 1), i = Math.floor(x), f = x - i;
  return i + 1 < n ? sorted[i] * (1 - f) + sorted[i + 1] * f : sorted[i];
}

export function derive(epw, { base = BASE_C, coolBase = BASE_C } = {}) {
  const H = epw.hours, n = epw.n, db = H.db;
  const sorted = Float32Array.from(db).sort();
  const days = new Map();   // "m-d" → { sum, n, month }
  const monthly = Array.from({ length: 12 }, () => ({ sum: 0, n: 0, min: Infinity, max: -Infinity, hdd: 0, cdd: 0, ghi: 0, ghiN: 0 }));
  let total = 0, hot = 0;
  for (let i = 0; i < n; i++) {
    const t = db[i], m = monthly[H.month[i] - 1], k = H.month[i] * 100 + H.day[i];
    total += t;
    if (t > db[hot]) hot = i;
    m.sum += t; m.n++; if (t < m.min) m.min = t; if (t > m.max) m.max = t;
    if (!Number.isNaN(H.ghi[i])) { m.ghi += H.ghi[i]; m.ghiN++; }
    const d = days.get(k) || { sum: 0, n: 0, month: H.month[i] };
    d.sum += t; d.n++; days.set(k, d);
  }
  let hdd = 0, cdd = 0;
  for (const d of days.values()) {
    const mean = d.sum / d.n, h = Math.max(0, base - mean), c = Math.max(0, mean - coolBase);
    hdd += h; cdd += c; monthly[d.month - 1].hdd += h; monthly[d.month - 1].cdd += c;
  }
  const st = epw.design;
  const heat = st ? { t996: st.heat.db996, t990: st.heat.db990, source: 'station' } : { t996: percentile(sorted, 0.004), t990: percentile(sorted, 0.01), source: 'year' };
  const cool = st
    ? { t004: st.cool.db004, t010: st.cool.db010, t020: st.cool.db020, wb004: st.cool.wb004, source: 'station' }
    : { t004: percentile(sorted, 0.996), t010: percentile(sorted, 0.99), t020: percentile(sorted, 0.98), wb004: null, source: 'year' };
  cool.date = { month: H.month[hot], day: H.day[hot] };
  const mean = total / n;
  const deep = [...(epw.ground || [])].sort((a, b) => b.depth - a.depth)[0];
  const ground = deep ? { t: deep.monthly.reduce((s, x) => s + x, 0) / 12, source: 'file', depth: deep.depth } : { t: mean, source: 'air' };
  return {
    heat, cool, hdd, cdd, base, coolBase, mean, ground, n,
    year: { t996: percentile(sorted, 0.004), t990: percentile(sorted, 0.01), t004: percentile(sorted, 0.996), t010: percentile(sorted, 0.99), min: sorted[0], max: sorted[n - 1] },
    monthly: monthly.map((m) => ({ mean: m.sum / m.n, min: m.min, max: m.max, hdd: m.hdd, cdd: m.cdd, ghi: m.ghiN ? m.ghi / 1000 : null })),
  };
}

/** The figures an index row keeps, rounded, so a person gets design temperatures and degree-days without fetching the year. */
export function summary(epw, opts) {
  const d = derive(epw, opts), r1 = (x) => (x === null || x === undefined || Number.isNaN(x) ? null : Math.round(x * 10) / 10);
  return {
    heat: { t996: r1(d.heat.t996), t990: r1(d.heat.t990), source: d.heat.source },
    cool: { t004: r1(d.cool.t004), t010: r1(d.cool.t010), t020: r1(d.cool.t020), wb004: r1(d.cool.wb004), source: d.cool.source, date: d.cool.date },
    hdd: Math.round(d.hdd), cdd: Math.round(d.cdd), base: d.base, mean: r1(d.mean), ground: { t: r1(d.ground.t), source: d.ground.source },
  };
}

/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — file text written into the EPW header; the panel shows its own words. */
/**
 * morph.js — a present-day EPW weather file "morphed" into a future one (0.9 EG.46). DOM-free, no imports. The published method:
 * Belcher, Hacker & Powell 2005, "Constructing design weather data for future climates", BSERT 26(1) 49–61; as used by Jentsch et al. 2008/2013
 * (CCWorldWeatherGen). For each month m of the file:
 *
 *   dry bulb (shift + stretch)  T' = T + ΔTmean_m + α_m · (T − <T>_m),   α_m = (ΔTmax_m − ΔTmin_m) / (<Tmax>_m − <Tmin>_m)
 *       <T>_m = the file's monthly mean, <Tmax>_m / <Tmin>_m = the monthly means of its daily maxima / minima. So the hot afternoons warm by about
 *       ΔTmax and the cold nights by about ΔTmin, and the month's mean by ΔTmean.
 *   relative humidity (shift)   RH' = clamp(RH + ΔRH_m, 0, 100)          in percentage points (CCWorldWeatherGen's shift form)
 *   dew point                   recomputed from T' and RH' (Magnus form, Alduchov & Eskridge 1996: a = 17.625, b = 243.04 °C), never above T'
 *   sunshine (stretch, optional) GHI, DNI, DHI × (1 + ΔGHI_m / 100)       only when the pack gives dGhiPct; else unchanged
 *   horizontal infrared         set to 9999 ("missing"), so EnergyPlus works it out again from the new dry bulb and dew point (its documented rule)
 *   unchanged, and said so      pressure, wind, cloud cover, snow, the DESIGN CONDITIONS header line (it describes the present file)
 *
 *   epwColumns(text)                          → { lines, header, rows: [{ line, month, day, hour, cells }] }   cells = the line split on commas
 *   monthlyStats(rows)                         → [12 × { n, mean, meanMax, meanMin }]   from column 7 (dry bulb)
 *   morphEpw(text, deltas, { label })          → { text, stats, alpha: [12], changed, notes }   deltas = pack.futureAt(...).d
 *   dewPoint(T, rh)                            the Magnus dew point (°C)
 */
const A = 17.625, B = 243.04;
export function dewPoint(T, rh) {
  const g = Math.log(Math.max(1, rh) / 100) + (A * T) / (B + T);
  return (B * g) / (A - g);
}
const miss = (v, big) => !Number.isFinite(v) || Math.abs(v) >= big;

export function epwColumns(text) {
  const nl = /\r\n/.test(text) ? '\r\n' : '\n';
  const lines = String(text || '').split(/\r?\n/);
  const dp = lines.findIndex((l) => /^DATA PERIODS/i.test(l));
  if (!lines.some((l) => /^LOCATION,/i.test(l)) || dp < 0) throw new Error('epw_not');
  const rows = [];
  for (let i = dp + 1; i < lines.length; i++) {
    const c = lines[i].split(',');
    if (c.length < 22) continue;
    const month = Number(c[1]), day = Number(c[2]), hour = Number(c[3]);
    if (!(month >= 1 && month <= 12 && day >= 1 && day <= 31 && hour >= 1 && hour <= 24)) continue;
    rows.push({ line: i, month, day, hour, cells: c });
  }
  if (rows.length < 24 * 28) throw new Error('epw_short');
  return { lines, nl, header: dp + 1, rows };
}

export function monthlyStats(rows) {
  const out = Array.from({ length: 12 }, () => ({ n: 0, sum: 0, days: new Map() }));
  for (const r of rows) {
    const T = Number(r.cells[6]);
    if (miss(T, 90)) continue;
    const m = out[r.month - 1];
    m.n++; m.sum += T;
    const d = m.days.get(r.day) || { max: -Infinity, min: Infinity };
    d.max = Math.max(d.max, T); d.min = Math.min(d.min, T); m.days.set(r.day, d);
  }
  return out.map((m) => {
    const ds = [...m.days.values()];
    return { n: m.n, mean: m.n ? m.sum / m.n : null, meanMax: ds.length ? ds.reduce((s, d) => s + d.max, 0) / ds.length : null, meanMin: ds.length ? ds.reduce((s, d) => s + d.min, 0) / ds.length : null };
  });
}

const f1 = (v) => (Math.round(v * 10) / 10).toFixed(1);

export function morphEpw(text, d, { label = '' } = {}) {
  const { lines, nl, rows } = epwColumns(text);
  const stats = monthlyStats(rows), notes = [];
  const alpha = stats.map((s, m) => {
    const range = s.meanMax - s.meanMin;
    if (!(range > 0.5)) { if (s.n) notes.push('norange'); return 0; }
    return (d.dTmax[m] - d.dTmin[m]) / range;
  });
  let changed = 0;
  const sun = (d.dGhiPct || []).some((v) => v);
  for (const r of rows) {
    const m = r.month - 1, c = r.cells, s = stats[m];
    const T = Number(c[6]);
    if (miss(T, 90) || s.mean === null) continue;
    const T2 = T + d.dTmean[m] + alpha[m] * (T - s.mean);
    c[6] = f1(T2);
    const rh = Number(c[8]);
    let rh2 = rh;
    if (!miss(rh, 999)) { rh2 = Math.max(0, Math.min(100, rh + (d.dRH[m] || 0))); c[8] = String(Math.round(rh2)); }
    if (!miss(rh2, 999)) c[7] = f1(Math.min(T2, dewPoint(T2, rh2)));
    c[12] = '9999';
    if (sun && d.dGhiPct[m]) for (const k of [13, 14, 15]) { const v = Number(c[k]); if (!miss(v, 9999)) c[k] = String(Math.max(0, Math.round(v * (1 + d.dGhiPct[m] / 100)))); }
    lines[r.line] = c.join(',');
    changed++;
  }
  const ci = lines.findIndex((l) => /^COMMENTS 2,/i.test(l));
  const note = 'COMMENTS 2,"Morphed for ' + String(label).replace(/["\r\n,]/g, ' ').slice(0, 200) + ' (Belcher et al. 2005 shift and stretch on dry bulb; RH shifted; dew point recalculated; horizontal IR left for EnergyPlus to recalculate; pressure and wind unchanged; DESIGN CONDITIONS describe the original file)"';
  if (ci >= 0) lines[ci] = note;
  return { text: lines.join(nl), stats, alpha, changed, notes: [...new Set(notes)] };
}

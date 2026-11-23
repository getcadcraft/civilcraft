/* SPDX-License-Identifier: Apache-2.0 */
/**
 * metrics.js — one weather year as charts need it (0.11 Track WX, WX.6-WX.8). Host-free and DOM-free.
 *
 *   METRICS                             every hourly quantity of the file, then the ones worked out of them (group 'derived')
 *       { id, group, unit, digits, of(H, i, ctx) → value | NaN, us?: { unit, to(x), digits } (US customary), sum? (a monthly total makes sense),
 *         floor? (the scale starts at 0), fixed? ([min, max] the scale always shows) }
 *   has(epw, id)                        → the file carries at least one hour of it
 *   grid(epw, id)                       → { days, values: Float32Array(days × 24) }   values[day * 24 + hourIndex], NaN = missing
 *   rolling(g, n)                       → the same shape, each hour averaged over the n days before and after it (the year wraps round)
 *   stats(values)                       → { min, max, mean, n }                       missing hours left out
 *   niceScale(min, max, ticks = 8)      → { min, max, step }                          round numbers that hold the data
 *   histogram(values, { min, max, bins }) → { counts, edges, n }
 *   monthly(g)                          → [12 × { mean, min, max, sum, n }]
 *   windRose(epw, { dirs = 16, edges, hours? (i → bool) }) → { dirs, edges, counts[dir][band], calm, n }   calm = under 0.5 m/s
 *   contour(g, level)                   → [[x1, y1, x2, y2]…]  line pieces where the grid crosses the level, in (day, hour index) units
 *   share(values, level)                → { above, n }                               hours at or above a level
 *   psychro: satP(t °C) Pa · ratio(t, rh %, p Pa) kg/kg · enthalpy(t, w) kJ/kg · wetBulb(t, rh, p) °C
 *       the equations of the ASHRAE Handbook of Fundamentals, Psychrometrics chapter (saturation pressure over ice and over water;
 *       W = 0.621945 pw / (p − pw); h = 1.006 t + W (2501 + 1.86 t); the wet bulb solved from the adiabatic-saturation equation)
 *   csv(epw, ids, t)                    → the hourly table as text
 *   comfort(epw, { tmin, tmax, rhmin, rhmax }, hours?) → { inside, n, months: [12 × { inside, n }] }   (WX.10) hours whose air temperature and
 *       relative humidity both fall in a range the person sets. A plain count: not a comfort standard, no radiant temperature, air speed or clothing.
 *   psychroBins(epw, { t0, tStep, wStep, hours?, value? }) → { cells: Map("ti,wi" → { n, sum }), most, wMax, p }   hours counted on a grid of
 *       dry-bulb temperature by humidity ratio (g/kg); value = an array to average in each cell; p = the year's mean pressure
 *   changed(epw, edits)                 → an epw whose hours carry the changes { key: { mul, add } } (add in shown units), bounded by LIMITS;
 *       a missing hour stays missing. The file's design conditions, ground temperatures and every other column are untouched.
 */
import { altitude, MONTH_START } from './solar.js';
import { LIMITS } from './epw.js';

export function satP(t) {
  const T = t + 273.15;
  if (t < 0) return Math.exp(-5674.5359 / T + 6.3925247 - 9.677843e-3 * T + 6.2215701e-7 * T * T + 2.0747825e-9 * T ** 3 - 9.484024e-13 * T ** 4 + 4.1635019 * Math.log(T));
  return Math.exp(-5800.2206 / T + 1.3914993 - 4.8640239e-2 * T + 4.1764768e-5 * T * T - 1.4452093e-8 * T ** 3 + 6.5459673 * Math.log(T));
}
export function ratio(t, rh, p = 101325) { const pw = (rh / 100) * satP(t); return 0.621945 * pw / (p - pw); }
export const enthalpy = (t, w) => 1.006 * t + w * (2501 + 1.86 * t);
export function wetBulb(t, rh, p = 101325) {
  if (!(rh >= 0) || Number.isNaN(t)) return NaN;
  const w = ratio(t, Math.min(100, rh), p);
  let lo = t - 40, hi = t;
  for (let i = 0; i < 40; i++) {
    const b = (lo + hi) / 2, ws = 0.621945 * satP(b) / (p - satP(b));
    const wb = b >= 0 ? ((2501 - 2.326 * b) * ws - 1.006 * (t - b)) / (2501 + 1.86 * t - 4.186 * b) : ((2830 - 0.24 * b) * ws - 1.006 * (t - b)) / (2830 + 1.86 * t - 2.1 * b);
    if (wb > w) hi = b; else lo = b;
  }
  return (lo + hi) / 2;
}

const F = { unit: '°F', to: (c) => c * 9 / 5 + 32, digits: 1 };
const BTU = { unit: 'Btu/ft²', to: (x) => x * 0.316998, digits: 0 }, FC = { unit: 'fc', to: (x) => x / 10.7639, digits: 0 };
const IN = (per) => ({ unit: 'in', to: (x) => x / per, digits: 2 });
/** a column of the file: key = its name in readEpw's hours, scale = file units to shown units */
const file = (key, scale = 1) => ({ key, scale, of: (H, i) => (H[key] ? H[key][i] * scale : NaN) });
const pa = (H, i) => (H.pa && !Number.isNaN(H.pa[i]) ? H.pa[i] : 101325);

export const METRICS = [
  { id: 'db', group: 'air', unit: '°C', digits: 1, us: F, ...file('db') },
  { id: 'dp', group: 'air', unit: '°C', digits: 1, us: F, ...file('dp') },
  { id: 'rh', group: 'air', unit: '%', digits: 0, fixed: [0, 100], ...file('rh') },
  { id: 'pa', group: 'air', unit: 'Pa', digits: 0, us: { unit: 'inHg', to: (x) => x / 3386.389, digits: 2 }, ...file('pa') },
  { id: 'etr', group: 'sun', unit: 'Wh/m²', digits: 0, us: BTU, sum: true, floor: true, ...file('etr') },
  { id: 'etrn', group: 'sun', unit: 'Wh/m²', digits: 0, us: BTU, sum: true, floor: true, ...file('etrn') },
  { id: 'ir', group: 'sun', unit: 'Wh/m²', digits: 0, us: BTU, sum: true, ...file('ir') },
  { id: 'ghi', group: 'sun', unit: 'Wh/m²', digits: 0, us: BTU, sum: true, floor: true, ...file('ghi') },
  { id: 'dni', group: 'sun', unit: 'Wh/m²', digits: 0, us: BTU, sum: true, floor: true, ...file('dni') },
  { id: 'dhi', group: 'sun', unit: 'Wh/m²', digits: 0, us: BTU, sum: true, floor: true, ...file('dhi') },
  { id: 'ghl', group: 'light', unit: 'lux', digits: 0, us: FC, floor: true, ...file('ghl') },
  { id: 'dnl', group: 'light', unit: 'lux', digits: 0, us: FC, floor: true, ...file('dnl') },
  { id: 'dhl', group: 'light', unit: 'lux', digits: 0, us: FC, floor: true, ...file('dhl') },
  { id: 'zl', group: 'light', unit: 'cd/m²', digits: 0, floor: true, ...file('zl') },
  { id: 'wd', group: 'wind', unit: '°', digits: 0, fixed: [0, 360], ...file('wd') },
  { id: 'ws', group: 'wind', unit: 'm/s', digits: 1, us: { unit: 'mph', to: (x) => x * 2.236936, digits: 1 }, floor: true, ...file('ws') },
  { id: 'tsky', group: 'sky', unit: '%', digits: 0, fixed: [0, 100], ...file('tsky', 10) },
  { id: 'osky', group: 'sky', unit: '%', digits: 0, fixed: [0, 100], ...file('osky', 10) },
  { id: 'vis', group: 'sky', unit: 'km', digits: 1, us: { unit: 'mi', to: (x) => x / 1.609344, digits: 1 }, floor: true, ...file('vis') },
  { id: 'ceil', group: 'sky', unit: 'm', digits: 0, us: { unit: 'ft', to: (x) => x / 0.3048, digits: 0 }, floor: true, ...file('ceil') },
  { id: 'pw', group: 'sky', unit: 'mm', digits: 0, us: IN(25.4), floor: true, ...file('pw') },
  { id: 'aod', group: 'sky', unit: '×0.001', digits: 0, floor: true, ...file('aod', 1000) },
  { id: 'snow', group: 'ground', unit: 'cm', digits: 0, us: IN(2.54), floor: true, ...file('snow') },
  { id: 'dsnow', group: 'ground', unit: 'days', digits: 0, floor: true, ...file('dsnow') },
  { id: 'alb', group: 'ground', unit: '', digits: 2, fixed: [0, 1], ...file('alb') },
  { id: 'rain', group: 'ground', unit: 'mm', digits: 1, us: IN(25.4), sum: true, floor: true, ...file('rain') },
  // worked out of the hours above; each says how in its help line
  { id: 'wb', group: 'derived', unit: '°C', digits: 1, us: F, of: (H, i) => wetBulb(H.db[i], H.rh[i], pa(H, i)) },
  { id: 'w', group: 'derived', unit: 'g/kg', digits: 1, us: { unit: 'gr/lb', to: (x) => x * 7, digits: 0 }, floor: true, of: (H, i) => ratio(H.db[i], H.rh[i], pa(H, i)) * 1000 },
  { id: 'h', group: 'derived', unit: 'kJ/kg', digits: 1, of: (H, i) => enthalpy(H.db[i], ratio(H.db[i], H.rh[i], pa(H, i))) },
  { id: 'dep', group: 'derived', unit: 'K', digits: 1, us: { unit: '°F', to: (x) => x * 1.8, digits: 1 }, floor: true, of: (H, i) => H.db[i] - H.dp[i] },
  { id: 'alt', group: 'derived', unit: '°', digits: 0, of: (H, i, c) => (c.place ? altitude(c.place, Math.floor(i / 24) % 365, H.hour[i] - 0.5) : NaN) },
];
export const metric = (id) => METRICS.find((m) => m.id === id) || null;

const ctxOf = (epw) => ({ place: epw.location && Number.isFinite(epw.location.lat) ? epw.location : null });
export function has(epw, id) {
  const m = metric(id), H = epw.hours, c = ctxOf(epw);
  if (!m) return false;
  for (let i = 0; i < epw.n; i += 7) if (!Number.isNaN(m.of(H, i, c))) return true;
  for (let i = 0; i < epw.n; i++) if (!Number.isNaN(m.of(H, i, c))) return true;
  return false;
}
export function grid(epw, id) {
  const m = metric(id), n = epw.n, values = new Float32Array(n), H = epw.hours, c = ctxOf(epw);
  for (let i = 0; i < n; i++) values[i] = m.of(H, i, c);
  return { days: n / 24, values };
}
export function rolling(g, n) {
  n = Math.max(0, Math.round(n));
  if (!n) return g;
  const D = g.days, out = new Float32Array(g.values.length);
  for (let h = 0; h < 24; h++) {
    let sum = 0, cnt = 0;
    const v = (d) => g.values[(((d % D) + D) % D) * 24 + h];
    for (let d = -n; d <= n; d++) { const x = v(d); if (!Number.isNaN(x)) { sum += x; cnt++; } }
    for (let d = 0; d < D; d++) {
      out[d * 24 + h] = cnt ? sum / cnt : NaN;
      const a = v(d - n), b = v(d + n + 1);
      if (!Number.isNaN(a)) { sum -= a; cnt--; }
      if (!Number.isNaN(b)) { sum += b; cnt++; }
    }
  }
  return { days: D, values: out };
}
export function stats(values) {
  let min = Infinity, max = -Infinity, sum = 0, n = 0;
  for (let i = 0; i < values.length; i++) { const x = values[i]; if (Number.isNaN(x)) continue; if (x < min) min = x; if (x > max) max = x; sum += x; n++; }
  return n ? { min, max, mean: sum / n, n } : { min: NaN, max: NaN, mean: NaN, n: 0 };
}
export function niceScale(min, max, ticks = 8) {
  if (!(max > min)) { const v = Number.isFinite(min) ? min : 0; return { min: v - 1, max: v + 1, step: 0.5 }; }
  const raw = (max - min) / ticks, p = 10 ** Math.floor(Math.log10(raw)), f = raw / p, step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  return { min: Math.floor(min / step + 1e-9) * step, max: Math.ceil(max / step - 1e-9) * step, step };
}
export function histogram(values, { min, max, bins = 24 }) {
  const counts = new Array(bins).fill(0), w = (max - min) / bins;
  let n = 0;
  for (let i = 0; i < values.length; i++) { const x = values[i]; if (Number.isNaN(x) || x < min || x > max) continue; counts[Math.min(bins - 1, Math.floor((x - min) / w))]++; n++; }
  return { counts, edges: Array.from({ length: bins + 1 }, (_, i) => min + i * w), n };
}
export function monthly(g) {
  const out = [];
  for (let m = 0; m < 12; m++) {
    const a = MONTH_START[m] * 24, b = Math.min(g.values.length, (m === 11 ? g.days : MONTH_START[m + 1] + (g.days === 366 && m >= 1 ? 1 : 0)) * 24);
    const s = stats(g.values.subarray(a + (g.days === 366 && m >= 2 ? 24 : 0), b));
    out.push({ ...s, sum: s.n ? s.mean * s.n : NaN });
  }
  return out;
}
export const ROSE_EDGES = [0.5, 2, 4, 6, 8, 10];
export function windRose(epw, { dirs = 16, edges = ROSE_EDGES, hours = null } = {}) {
  const H = epw.hours, counts = Array.from({ length: dirs }, () => new Array(edges.length).fill(0));
  let calm = 0, n = 0;
  for (let i = 0; i < epw.n; i++) {
    if (hours && !hours(i)) continue;
    const s = H.ws[i], d = H.wd[i];
    if (Number.isNaN(s)) continue;
    n++;
    if (s < edges[0] || Number.isNaN(d)) { calm++; continue; }
    let b = edges.length - 1;
    while (b > 0 && s < edges[b]) b--;
    counts[Math.round(d / (360 / dirs)) % dirs][b]++;
  }
  return { dirs, edges, counts, calm, n };
}
export function share(values, level) {
  let above = 0, n = 0;
  for (let i = 0; i < values.length; i++) { const x = values[i]; if (Number.isNaN(x)) continue; n++; if (x >= level) above++; }
  return { above, n };
}
/** Marching squares over the day × hour grid. A cell with a missing corner draws nothing; a saddle is split by the cell's mean. */
export function contour(g, level) {
  const out = [], D = g.days, v = g.values;
  const cut = (a, b) => (level - a) / (b - a);
  for (let d = 0; d < D - 1; d++) for (let h = 0; h < 23; h++) {
    const a = v[d * 24 + h], b = v[(d + 1) * 24 + h], c = v[(d + 1) * 24 + h + 1], e = v[d * 24 + h + 1];
    if (Number.isNaN(a + b + c + e)) continue;
    const k = (a >= level ? 1 : 0) | (b >= level ? 2 : 0) | (c >= level ? 4 : 0) | (e >= level ? 8 : 0);
    if (k === 0 || k === 15) continue;
    const B = () => [d + cut(a, b), h], Rt = () => [d + 1, h + cut(b, c)], T = () => [d + cut(e, c), h + 1], L = () => [d, h + cut(a, e)];
    const seg = (p, q) => out.push([p[0], p[1], q[0], q[1]]);
    const mid = (a + b + c + e) / 4 >= level;
    switch (k) {
      case 1: case 14: seg(L(), B()); break;
      case 2: case 13: seg(B(), Rt()); break;
      case 4: case 11: seg(Rt(), T()); break;
      case 8: case 7: seg(T(), L()); break;
      case 3: case 12: seg(L(), Rt()); break;
      case 6: case 9: seg(B(), T()); break;
      case 5: if (mid) { seg(L(), T()); seg(B(), Rt()); } else { seg(L(), B()); seg(Rt(), T()); } break;
      case 10: if (mid) { seg(L(), B()); seg(Rt(), T()); } else { seg(L(), T()); seg(B(), Rt()); } break;
      default:
    }
  }
  return out;
}
export function csv(epw, ids, t = (k) => k, us = false) {
  const H = epw.hours, c = ctxOf(epw), ms = ids.map(metric).filter(Boolean);
  const q = (s) => (/[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s);
  const rows = [['month', 'day', 'hour', ...ms.map((m) => q(t('wx.m.' + m.id) + ((us && m.us ? m.us.unit : m.unit) ? ' (' + (us && m.us ? m.us.unit : m.unit) + ')' : '')))].join(',')];
  for (let i = 0; i < epw.n; i++) {
    rows.push([H.month[i], H.day[i], H.hour[i], ...ms.map((m) => { let x = m.of(H, i, c); if (Number.isNaN(x)) return ''; const u = us && m.us ? m.us : m; if (us && m.us) x = m.us.to(x); return String(Number(x.toFixed(Math.max(u.digits, 1) + 1))); })].join(','));
  }
  return rows.join('\r\n') + '\r\n';
}

export function comfort(epw, { tmin, tmax, rhmin, rhmax }, hours = null) {
  const H = epw.hours, months = Array.from({ length: 12 }, () => ({ inside: 0, n: 0 }));
  let inside = 0, n = 0;
  for (let i = 0; i < epw.n; i++) {
    if ((hours && !hours(i)) || Number.isNaN(H.db[i]) || Number.isNaN(H.rh[i])) continue;
    const m = months[H.month[i] - 1], ok = H.db[i] >= tmin && H.db[i] <= tmax && H.rh[i] >= rhmin && H.rh[i] <= rhmax;
    n++; m.n++; if (ok) { inside++; m.inside++; }
  }
  return { inside, n, months };
}
export function psychroBins(epw, { t0 = -40, tStep = 1, wStep = 0.5, hours = null, value = null } = {}) {
  const H = epw.hours, cells = new Map();
  let most = 0, wMax = 0, ps = 0, pn = 0;
  for (let i = 0; i < epw.n; i++) {
    if (H.pa && !Number.isNaN(H.pa[i])) { ps += H.pa[i]; pn++; }
    if ((hours && !hours(i)) || Number.isNaN(H.db[i]) || Number.isNaN(H.rh[i])) continue;
    const w = ratio(H.db[i], H.rh[i], pa(H, i)) * 1000, k = Math.floor((H.db[i] - t0) / tStep) + ',' + Math.floor(w / wStep);
    const c = cells.get(k) || { n: 0, sum: 0, vn: 0 };
    c.n++; if (value && !Number.isNaN(value[i])) { c.sum += value[i]; c.vn++; }
    cells.set(k, c); if (c.n > most) most = c.n; if (w > wMax) wMax = w;
  }
  return { cells, most, wMax, p: pn ? ps / pn : 101325 };
}
export function changed(epw, edits) {
  const keys = Object.keys(edits || {}).filter((k) => LIMITS[k] && epw.hours[k] && (edits[k].mul !== 1 || edits[k].add !== 0));
  if (!keys.length) return epw;
  const hours = { ...epw.hours };
  for (const k of keys) {
    const m = METRICS.find((x) => x.key === k), [lo, hi] = LIMITS[k], { mul, add } = edits[k], src = epw.hours[k], out = new Float32Array(src.length);
    for (let i = 0; i < src.length; i++) out[i] = Number.isNaN(src[i]) ? NaN : Math.min(hi, Math.max(lo, src[i] * mul + add / (m ? m.scale : 1)));
    hours[k] = out;
  }
  return { ...epw, hours };
}

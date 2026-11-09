/* SPDX-License-Identifier: Apache-2.0 */
/**
 * heat.js — the heat side of a weather file, present beside future (0.9 EG.46). DOM-free. Reads the dry bulb of an EPW (morph.js epwColumns).
 *
 *   heatSummary(text) → { hours, meanT, maxT, minT, hot30, hot35, cdd18, hdd18, cool04, heat996 }
 *       hot30/hot35   hours at or above 30 / 35 °C
 *       cdd18/hdd18   degree-days on the daily mean, base 18 °C (K·day)
 *       cool04        the 0.4 % annual cooling dry bulb: exceeded in 0.4 % of the hours (ASHRAE's definition on the file's own hours)
 *       heat996       the 99.6 % annual heating dry bulb: 99.6 % of the hours are warmer
 *   compareHeat(present, future) → [{ key, present, future, change }]    the rows the panels show, in this order
 */
import { epwColumns } from './morph.js';

const pct = (sorted, p) => { if (!sorted.length) return null; const i = Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1)))); return sorted[i]; };

export function heatSummary(text) {
  const { rows } = epwColumns(text);
  const T = [], days = new Map();
  for (const r of rows) {
    const t = Number(r.cells[6]);
    if (!Number.isFinite(t) || Math.abs(t) >= 90) continue;
    T.push(t);
    const k = r.month * 100 + r.day, d = days.get(k) || { s: 0, n: 0 };
    d.s += t; d.n++; days.set(k, d);
  }
  const s = T.slice().sort((a, b) => a - b);
  let cdd = 0, hdd = 0;
  for (const d of days.values()) { const m = d.s / d.n; if (m > 18) cdd += m - 18; else hdd += 18 - m; }
  return { hours: T.length, meanT: T.reduce((a, b) => a + b, 0) / (T.length || 1), maxT: s[s.length - 1], minT: s[0],
    hot30: T.filter((t) => t >= 30).length, hot35: T.filter((t) => t >= 35).length, cdd18: cdd, hdd18: hdd, cool04: pct(s, 0.996), heat996: pct(s, 0.004) };
}

export const HEAT_ROWS = ['meanT', 'maxT', 'cool04', 'heat996', 'hot30', 'hot35', 'cdd18', 'hdd18'];
export function compareHeat(p, f) { return HEAT_ROWS.map((key) => ({ key, present: p[key], future: f[key], change: f[key] - p[key] })); }

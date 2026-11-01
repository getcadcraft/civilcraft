/* SPDX-License-Identifier: Apache-2.0 */
import { method, rng } from './common.js';
import { cpm } from './cpm.js';

/**
 * Schedule risk by Monte Carlo: each duration is a number or { min, mode, max } (triangular), whole working days after rounding.
 * Returns the finish at P10/P50/P80/P90, how often each task was critical (criticality index, Van Slyke 1963) and each duration's
 * correlation with the finish. Seeded, so a run repeats. Durations are independent unless `correlation` ties them (0..1 shared draw).
 */
export function simulate(tasks, { n = 1000, seed = 1, correlation = 0 } = {}) {
  const m = method('Monte Carlo schedule risk', 'Van Slyke 1963; triangular durations',
    ['Triangular shapes with the min / mode / max you gave: the answer is only as good as those three numbers.', 'Independent draws (or one shared draw at the given correlation); no risk events or logic that changes.', 'Resource limits are not applied; run level() on the P50 plan separately.', `${n} trials: percentiles move by about 1/√n.`]);
  const rand = rng(seed), ids = tasks.map((t) => t.id), crit = Object.fromEntries(ids.map((i) => [i, 0])), finishes = [], durs = Object.fromEntries(ids.map((i) => [i, []]));
  for (let k = 0; k < n; k++) {
    const shared = rand();
    const set = tasks.map((t) => {
      if (typeof t.dur === 'number') return t;
      const { min, mode, max } = t.dur, u = correlation > 0 && rand() < correlation ? shared : rand();
      const f = (mode - min) / ((max - min) || 1), v = u < f ? min + Math.sqrt(u * (max - min) * (mode - min)) : max - Math.sqrt((1 - u) * (max - min) * (max - mode));
      return { ...t, dur: Math.round(v) };
    });
    const r = cpm(set);
    if (!r.ok) return { ok: false, problems: r.problems, method: m };
    finishes.push(r.finish); for (const i of ids) { if (r.tasks[i].critical) crit[i]++; durs[i].push(set.find((s) => s.id === i).dur); }
  }
  const sorted = finishes.slice().sort((a, b) => a - b), pct = (p) => sorted[Math.min(n - 1, Math.ceil(p * n) - 1)];
  const mean = finishes.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(finishes.reduce((a, b) => a + (b - mean) ** 2, 0) / n);
  const corr = (xs) => { const mx = xs.reduce((a, b) => a + b, 0) / n; let sxy = 0, sxx = 0; for (let k = 0; k < n; k++) { sxy += (xs[k] - mx) * (finishes[k] - mean); sxx += (xs[k] - mx) ** 2; } return sxx > 0 && sd > 0 ? sxy / Math.sqrt(sxx * n * sd * sd) : 0; };
  return { ok: true, n, seed, mean, sd, p10: pct(0.1), p50: pct(0.5), p80: pct(0.8), p90: pct(0.9), min: sorted[0], max: sorted[n - 1],
    criticality: Object.fromEntries(ids.map((i) => [i, crit[i] / n])), sensitivity: Object.fromEntries(ids.map((i) => [i, corr(durs[i])])), problems: [], method: m };
}

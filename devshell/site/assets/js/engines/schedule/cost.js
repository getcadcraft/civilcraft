/* SPDX-License-Identifier: Apache-2.0 */
import { problem, method } from './common.js';

/** A task's budget: task.cost (fixed) + rates × resources × days. rates = { welder: 450 } per unit per working day. */
export function taskCost(t, rates = {}) {
  let c = t.cost || 0;
  for (const [r, q] of Object.entries(t.res || {})) c += (rates[r] || 0) * q * t.dur;
  return c;
}

/** Share of a task's planned work done by time point `day` (linear over its duration; a milestone is all or nothing). */
export function planned(s, day) { return s.EF === s.ES ? (day >= s.ES ? 1 : 0) : Math.min(1, Math.max(0, (day - s.ES) / (s.EF - s.ES))); }

/** The cost-loaded schedule (5D): cost per working day and cumulative (the S-curve). `starts` is cpm().tasks or level().starts. */
export function costCurve(tasks, starts, rates = {}) {
  const finish = Math.max(0, ...Object.values(starts).map((x) => x.EF)), perDay = new Array(finish + 1).fill(0);
  for (const t of tasks) {
    const s = starts[t.id], c = taskCost(t, rates); if (!s || !c) continue;
    if (t.dur === 0) perDay[s.ES] += c; else for (let k = s.ES; k < s.EF; k++) perDay[k] += c / t.dur;
  }
  let acc = 0; const cumulative = perDay.map((v) => (acc += v));
  return { perDay, cumulative, total: acc, method: method('Cost-loaded schedule', 'Cost spread evenly over each task\'s working days', ['Even spread per task: front- or back-loaded work needs more tasks.', 'Budget only: no escalation, tax, contingency or currency.']) };
}

/**
 * Earned value at a status time point. progress = { id: { pct (0-1), ac (actual cost to date) } }.
 * PV, EV, AC; SV, CV; SPI, CPI; EAC three ways; TCPI; earned schedule (Lipke 2003). Formulas as in the PMI Practice Standard for Earned Value Management.
 */
export function earnedValue(tasks, starts, statusDay, progress = {}, rates = {}) {
  const probs = []; let bac = 0, pv = 0, ev = 0, ac = 0;
  for (const t of tasks) {
    const s = starts[t.id]; if (!s) continue;
    const c = taskCost(t, rates); bac += c; pv += c * planned(s, statusDay);
    const p = progress[t.id];
    if (p) {
      if (!(p.pct >= 0 && p.pct <= 1)) probs.push(problem('pct', 'error', `"${t.id}": percent complete must be between 0 and 1.`, [{ id: t.id }]));
      ev += c * Math.min(1, Math.max(0, p.pct || 0)); ac += p.ac || 0;
    }
  }
  const cv = ev - ac, sv = ev - pv, cpi = ac > 0 ? ev / ac : null, spi = pv > 0 ? ev / pv : null;
  if (cpi == null) probs.push(problem('no-ac', 'info', 'No actual cost is recorded yet, so the cost index and the forecasts are not shown.', []));
  const cum = costCurve(tasks, starts, rates).cumulative;
  let es = null; // earned schedule: the time point at which the plan had earned what has been earned
  if (ev > 0 && cum.length) {
    const total = cum[cum.length - 1];
    if (ev >= total) es = cum.length - 1;
    else { let k = 0; while (cum[k] < ev) k++; const lo = k > 0 ? cum[k - 1] : 0; es = k + (ev - lo) / ((cum[k] - lo) || 1); } // cum[k] = cost at time point k + 1
  } else if (ev === 0) es = 0;
  const eac = cpi ? { typical: bac / cpi, atypical: ac + (bac - ev), combined: spi ? ac + (bac - ev) / (cpi * spi) : null } : null;
  return {
    bac, pv, ev, ac, cv, sv, cpi, spi, eac, etc: eac ? eac.typical - ac : null, vac: eac ? bac - eac.typical : null,
    tcpi: bac - ac !== 0 ? (bac - ev) / (bac - ac) : null,
    earnedSchedule: es, spiT: es != null && statusDay > 0 ? es / statusDay : null,
    problems: probs,
    method: method('Earned value management', 'PMI Practice Standard for EVM; earned schedule after Lipke 2003',
      ['Planned value assumes each task earns evenly over its duration.', 'The forecasts assume the past performance index (typical), a one-off overrun (atypical) or both indices (combined): none is a promise.', 'Percent complete is the person\'s report, not measured.']),
  };
}

/* SPDX-License-Identifier: Apache-2.0 */
import { problem, method } from './common.js';
import { cpm, normalise, lowerBound } from './cpm.js';

/** Units a task needs of each resource per working day: task.res = { crane: 1, welder: 4 }. */
export function usage(tasks, starts, horizon) {
  const u = {};
  for (const t of tasks) {
    const s = starts[t.id]; if (!s || !t.res) continue;
    for (const [r, q] of Object.entries(t.res)) { const a = u[r] || (u[r] = new Array(horizon).fill(0)); for (let k = s.ES; k < s.EF && k < horizon; k++) a[k] += q; }
  }
  return u;
}

/**
 * Resource levelling by the serial schedule generation scheme: tasks are placed one at a time, most urgent first (smallest late start from the
 * unconstrained CPM, then earliest start), each at the first time its logic allows where every resource stays within its limit for the whole
 * duration. No task is split, and a task is never moved earlier than its logic.
 *   limits: { crane: 1, welder: 6 }. A resource without a limit is unlimited.
 */
export function level(tasks, opts = {}) {
  const limits = opts.limits || {};
  const base = cpm(tasks);
  const m = method('Resource-constrained scheduling, serial schedule generation scheme', 'Kolisch 1996 (priority rule: least late start)',
    ['A heuristic: the result is a valid schedule, not the shortest possible one.', 'Tasks are not split, resource limits are constant over time, one calendar.', 'Priority rule is least late start; another rule can give a shorter finish.']);
  if (!base.ok) return { ok: false, problems: base.problems, method: m };
  const { byId, rels } = normalise(tasks);
  const probs = [...base.problems.filter((p) => p.code !== 'late')];
  const pred = new Map(tasks.map((t) => [t.id, []]));
  for (const r of rels) pred.get(r.to).push(r);
  const prio = (id) => [base.tasks[id].LS, base.tasks[id].ES];
  const S = {}, use = {}, left = new Set(tasks.map((t) => t.id));
  const fits = (t, s) => {
    for (const [r, q] of Object.entries(t.res || {})) {
      const cap = limits[r]; if (cap == null) continue;
      const a = use[r] || [];
      for (let k = s; k < s + t.dur; k++) if ((a[k] || 0) + q > cap) return k;
    }
    return -1;
  };
  while (left.size) {
    const ready = [...left].filter((id) => pred.get(id).every((r) => S[r.from]));
    if (!ready.length) break;
    ready.sort((a, b) => prio(a)[0] - prio(b)[0] || prio(a)[1] - prio(b)[1] || tasks.findIndex((t) => t.id === a) - tasks.findIndex((t) => t.id === b));
    const id = ready[0], t = byId.get(id);
    let s = 0;
    if (t.snet != null) s = Math.max(s, t.snet);
    for (const r of pred.get(id)) s = Math.max(s, lowerBound(r, S[r.from], t.dur));
    const over = Object.entries(t.res || {}).filter(([r, q]) => limits[r] != null && q > limits[r]);
    if (over.length) probs.push(problem('demand', 'error', `"${id}" needs ${over.map(([r, q]) => q + ' ' + r).join(', ')} at once, more than the limit (${over.map(([r]) => limits[r]).join(', ')}).`, [{ id }]));
    else if (t.dur > 0) { let guard = 0; for (;;) { const bad = fits(t, s); if (bad < 0) break; s = bad + 1; if (++guard > 100000) { probs.push(problem('horizon', 'error', `"${id}" could not be placed.`, [{ id }])); break; } } }
    S[id] = { id, ES: s, EF: s + t.dur, delay: s - base.tasks[id].ES };
    for (const [r, q] of Object.entries(t.res || {})) if (limits[r] != null && t.dur > 0) { const a = use[r] || (use[r] = []); for (let k = s; k < s + t.dur; k++) a[k] = (a[k] || 0) + q; }
    left.delete(id);
  }
  const finish = Math.max(0, ...Object.values(S).map((x) => x.EF));
  const delayed = Object.values(S).filter((x) => x.delay > 0);
  if (finish > base.finish) probs.push(problem('levelled-longer', 'info', `The resource limits push the finish from day ${base.finish} to day ${finish}.`, [], { found: finish, req: base.finish }));
  return { ok: !probs.some((p) => p.severity === 'error'), starts: S, finish, unlimitedFinish: base.finish, delayed: delayed.map((x) => x.id), peak: Object.fromEntries(Object.entries(usage(tasks, S, finish)).map(([r, a]) => [r, Math.max(0, ...a)])), problems: probs, method: m };
}

/** Where a schedule asks for more than the limit (before levelling): [{resource, from, to, need, limit}] as problems. */
export function overallocations(tasks, starts, limits) {
  const finish = Math.max(0, ...Object.values(starts).map((x) => x.EF)), u = usage(tasks, starts, finish), out = [];
  for (const [r, a] of Object.entries(u)) {
    if (limits[r] == null) continue;
    let k = 0;
    while (k < finish) { if (a[k] > limits[r]) { let e = k, peak = a[k]; while (e < finish && a[e] > limits[r]) { peak = Math.max(peak, a[e]); e++; } out.push(problem('overallocated', 'warning', `${r} is needed ${peak} at once from day ${k} to day ${e}, the limit is ${limits[r]}.`, [{ id: r }], { found: peak, req: limits[r], from: k, to: e })); k = e; } else k++; }
  }
  return out;
}

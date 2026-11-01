/* SPDX-License-Identifier: Apache-2.0 */
import { problem, method } from './common.js';
import { cpm } from './cpm.js';
import { taskCost } from './cost.js';

/**
 * A shutdown or turnaround: plant is down from window.start to window.end (time points). Tasks marked `shutdown: true` may only run inside it;
 * tasks marked `pre: true` (isolation, scaffolding, long-lead delivery) must be finished before it opens. Anything else is free.
 * The result is the ordinary CPM with those two constraints applied, plus the figures a turnaround manager asks for.
 */
export function turnaround(tasks, window, opts = {}) {
  const set = tasks.map((t) => {
    const c = { ...t };
    if (t.shutdown) { c.snet = Math.max(t.snet ?? 0, window.start); c.fnlt = Math.min(t.fnlt ?? Infinity, window.end); if (c.fnlt === Infinity) delete c.fnlt; }
    if (t.pre) c.fnlt = Math.min(t.fnlt ?? Infinity, window.start);
    return c;
  });
  const r = cpm(set, { deadline: opts.deadline });
  const m = method('Shutdown / turnaround window check on CPM', 'Window as start-no-earlier / finish-no-later constraints', ['Plant-down time is the window you give; the isolation and re-start sequences must be in the tasks.', 'A day count, not a safety case: permits, isolation and handover are not checked.', 'One calendar; 24-hour work is a calendar choice.']);
  if (!r.ok) return { ok: false, problems: r.problems, method: m };
  const sd = tasks.filter((t) => t.shutdown).map((t) => r.tasks[t.id]);
  const first = sd.length ? Math.min(...sd.map((x) => x.ES)) : null, last = sd.length ? Math.max(...sd.map((x) => x.EF)) : null;
  const probs = [...r.problems.filter((p) => p.code !== 'late')];
  for (const t of tasks) { const x = r.tasks[t.id]; if (x.TF < 0) probs.push(problem(t.shutdown ? 'window-overrun' : t.pre ? 'pre-late' : 'late', 'error',
    t.shutdown ? `"${t.id}" cannot finish inside the shutdown: it is ${-x.TF} working day${-x.TF === 1 ? '' : 's'} too long for the window.` : t.pre ? `"${t.id}" must be done before the shutdown opens but is ${-x.TF} working day${-x.TF === 1 ? '' : 's'} late.` : `"${t.id}" is ${-x.TF} working days behind its deadline.`,
    [{ id: t.id }], { found: x.EF, req: x.LF })); }
  const outage = last == null ? 0 : last - first;
  return {
    ok: !probs.some((p) => p.severity === 'error'), tasks: r.tasks, critical: r.critical, chain: r.chain,
    windowLength: window.end - window.start, scopeStart: first, scopeEnd: last, scopeLength: outage,
    spare: window.end - window.start - (last == null ? 0 : last - window.start),
    shutdownCost: tasks.filter((t) => t.shutdown).reduce((a, t) => a + taskCost(t, opts.rates), 0),
    lostProduction: opts.lossPerDay != null ? outage * opts.lossPerDay : null,
    problems: probs, method: m,
  };
}

/**
 * Crashing: shorten the project to `target` working days at least cost, shortening one critical day at a time where it is cheapest.
 * task.crash = { min: shortest duration, perDay: extra cost per day saved }. A heuristic (the exact answer is a linear programme):
 * it can pay more than the best plan when several critical paths share tasks, and says so in `limits`.
 */
export function crash(tasks, target, opts = {}) {
  const cur = tasks.map((t) => ({ ...t })), steps = []; let extra = 0;
  for (let guard = 0; guard < 10000; guard++) {
    const r = cpm(cur);
    if (!r.ok) return { ok: false, problems: r.problems };
    if (r.finish <= target) return { ok: true, finish: r.finish, extraCost: extra, steps, tasks: cur, problems: [], method: crashMethod() };
    const cand = cur.filter((t) => r.tasks[t.id].critical && t.crash && t.dur > t.crash.min).sort((a, b) => a.crash.perDay - b.crash.perDay);
    if (!cand.length) return { ok: false, finish: r.finish, extraCost: extra, steps, tasks: cur, problems: [problem('crash-limit', 'error', `No critical task can be shortened further; the shortest this plan gets is ${r.finish} working days, not ${target}.`, [], { found: r.finish, req: target })], method: crashMethod() };
    const t = cand[0]; t.dur -= 1; extra += t.crash.perDay; steps.push({ task: t.id, dur: t.dur, cost: t.crash.perDay });
  }
  return { ok: false, problems: [problem('crash-guard', 'error', 'Crashing did not settle.', [])] };
}
const crashMethod = () => method('Time-cost crashing, cheapest critical day first', 'Fondahl / Kelley time-cost trade-off (greedy form)', ['A heuristic: with parallel critical paths it can cost more than the optimum.', 'Linear cost per day saved; crash limits are the person\'s numbers.', 'Does not check that shorter means safe.']);

/**
 * Maintenance plan: items = [{ id, name, every (working days), last (time point it was last done), dur, res }]. Occurrences in [from, to) as tasks.
 * A fixed-interval plan; condition-based and risk-based plans are decisions for the owner of the plan.
 */
export function maintenancePlan(items, from, to) {
  const out = [], probs = [];
  for (const it of items) {
    if (!(it.every > 0)) { probs.push(problem('interval', 'error', `"${it.id}" needs an interval of one working day or more.`, [{ id: it.id }])); continue; }
    let due = (it.last ?? from - it.every) + it.every, n = 1;
    while (due < to) { out.push({ id: `${it.id}#${n++}`, item: it.id, name: it.name || it.id, due: Math.max(due, from), dur: it.dur ?? 1, res: it.res, overdue: due < from }); due += it.every; }
  }
  out.sort((a, b) => a.due - b.due || (a.id < b.id ? -1 : 1));
  return { occurrences: out, problems: probs, method: method('Fixed-interval maintenance plan', 'Due date = last done + interval', ['Intervals are the person\'s numbers; the engine does not choose them (see lib/risk for failure data).', 'Overdue items are shown at the start of the period.']) };
}

/** Which due maintenance can wait for the next shutdown window, and which cannot. windows = [{start, end}] */
export function fitToShutdowns(occurrences, windows, grace = 0) {
  const probs = [], plan = [];
  for (const o of occurrences) {
    const w = windows.find((x) => o.due <= x.end && x.end - x.start >= o.dur);
    const inWindow = windows.find((x) => o.due >= x.start && o.due < x.end);
    const next = windows.find((x) => x.start >= o.due);
    const sched = inWindow ? inWindow.start : next ? next.start : null;
    if (o.needsShutdown && sched != null && sched > o.due + grace) probs.push(problem('maintenance-late', 'warning', `"${o.id}" is due on day ${o.due} but plant is next down on day ${sched}.`, [{ id: o.id }], { found: sched, req: o.due }));
    if (o.needsShutdown && sched == null) probs.push(problem('maintenance-nowindow', 'error', `"${o.id}" needs a shutdown and none is planned after day ${o.due}.`, [{ id: o.id }]));
    plan.push({ ...o, window: o.needsShutdown ? sched : null, usesWindow: !!w });
  }
  return { plan, problems: probs, method: method('Match due maintenance to planned shutdown windows', 'Next window at or after the due date', ['Does not spread the work inside a window: use the turnaround CPM for that.']) };
}

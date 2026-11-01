/* SPDX-License-Identifier: Apache-2.0 */
import { problem, method } from './common.js';

/**
 * Critical path method on a precedence diagram (activity-on-node), four relation types with lags.
 *   task: { id, name?, dur (working days, 0 = milestone), deps: [ 'A' | { id:'A', type:'FS'|'SS'|'FF'|'SF', lag } ],
 *           snet (start no earlier than, time point), fnlt (finish no later than), mso (must start on) }
 * Time is whole working days from the project start (see makeCalendar). Method: forward and backward pass over a topological order
 * (Kelley & Walker 1959; precedence relations with lags after Fondahl/Roy, in any project-management text).
 */
export const REL = ['FS', 'SS', 'FF', 'SF'];

export function normalise(tasks) {
  const probs = [], byId = new Map();
  for (const t of tasks) {
    if (byId.has(t.id)) probs.push(problem('duplicate', 'error', `Two tasks share the id "${t.id}".`, [{ id: t.id }]));
    byId.set(t.id, t);
  }
  const rels = [];
  for (const t of tasks) {
    if (!(t.dur >= 0) || !Number.isFinite(t.dur) || !Number.isInteger(t.dur)) probs.push(problem('duration', 'error', `"${t.id}" needs a whole number of working days, 0 or more (it has ${t.dur}).`, [{ id: t.id }]));
    for (const d of t.deps || []) {
      const r = typeof d === 'string' ? { id: d, type: 'FS', lag: 0 } : { id: d.id, type: d.type || 'FS', lag: d.lag || 0 };
      if (!byId.has(r.id)) { probs.push(problem('unknown', 'error', `"${t.id}" depends on "${r.id}", which is not in the schedule.`, [{ id: t.id }, { id: r.id }])); continue; }
      if (!REL.includes(r.type)) { probs.push(problem('relation', 'error', `"${t.id}": relation type ${r.type} is not FS, SS, FF or SF.`, [{ id: t.id }])); continue; }
      if (!Number.isInteger(r.lag)) { probs.push(problem('lag', 'error', `"${t.id}": the lag from "${r.id}" must be a whole number of working days.`, [{ id: t.id }])); continue; }
      rels.push({ from: r.id, to: t.id, type: r.type, lag: r.lag });
    }
  }
  return { byId, rels, probs };
}

/** Kahn's algorithm; returns the order, or the tasks left on a cycle. */
export function topo(ids, rels) {
  const indeg = new Map(ids.map((i) => [i, 0])), out = new Map(ids.map((i) => [i, []]));
  for (const r of rels) { indeg.set(r.to, indeg.get(r.to) + 1); out.get(r.from).push(r.to); }
  const q = ids.filter((i) => indeg.get(i) === 0), order = [];
  while (q.length) { const i = q.shift(); order.push(i); for (const j of out.get(i)) { indeg.set(j, indeg.get(j) - 1); if (indeg.get(j) === 0) q.push(j); } }
  return { order, cycle: ids.filter((i) => !order.includes(i)) };
}

/** Earliest start a successor may take from one finished/started predecessor (ES/EF of the predecessor in `p`). */
export function lowerBound(r, p, durTo) {
  switch (r.type) {
    case 'FS': return p.EF + r.lag;
    case 'SS': return p.ES + r.lag;
    case 'FF': return p.EF + r.lag - durTo;
    default: return p.ES + r.lag - durTo; // SF
  }
}

export function cpm(tasks, opts = {}) {
  const { byId, rels, probs } = normalise(tasks);
  const m = method('Critical path method (forward/backward pass, FS/SS/FF/SF with lags)', 'Kelley & Walker 1959',
    ['One working calendar for the whole project, whole working days.', 'Durations are single values: no uncertainty (see simulate) and no resource limits (see level).',
     'Total float is measured to the project finish or the deadline; free float to the earliest successor.']);
  const ids = tasks.map((t) => t.id);
  if (probs.some((p) => p.severity === 'error')) return { ok: false, tasks: {}, problems: probs, method: m };
  const { order, cycle } = topo(ids, rels);
  if (cycle.length) { probs.push(problem('cycle', 'error', `These tasks depend on each other in a loop: ${cycle.join(', ')}.`, cycle.map((id) => ({ id })))); return { ok: false, tasks: {}, problems: probs, method: m }; }
  const pred = new Map(ids.map((i) => [i, []])), succ = new Map(ids.map((i) => [i, []]));
  for (const r of rels) { pred.get(r.to).push(r); succ.get(r.from).push(r); }
  const T = {};
  for (const id of order) {
    const t = byId.get(id), d = t.dur;
    let es = 0;
    if (t.snet != null) es = Math.max(es, t.snet);
    for (const r of pred.get(id)) es = Math.max(es, lowerBound(r, T[r.from], d));
    if (t.mso != null) { if (es > t.mso) probs.push(problem('mso', 'warning', `"${id}" must start on day ${t.mso} but its logic needs day ${es}.`, [{ id }])); es = t.mso; }
    T[id] = { id, name: t.name || id, dur: d, ES: es, EF: es + d };
  }
  const end = Math.max(0, ...ids.map((i) => T[i].EF));
  const limit = opts.deadline != null ? opts.deadline : end;
  for (const id of [...order].reverse()) {
    const t = byId.get(id), d = t.dur;
    let lf = limit;
    if (t.fnlt != null) lf = Math.min(lf, t.fnlt);
    for (const r of succ.get(id)) {
      const s = T[r.to];
      let v;
      if (r.type === 'FS') v = s.LS - r.lag;
      else if (r.type === 'SS') v = s.LS - r.lag + d;
      else if (r.type === 'FF') v = s.LF - r.lag;
      else v = s.LF - r.lag + d;
      lf = Math.min(lf, v);
    }
    Object.assign(T[id], { LF: lf, LS: lf - d });
  }
  for (const id of ids) {
    const x = T[id]; x.TF = x.LS - x.ES;
    let ff = end - x.EF;
    for (const r of succ.get(id)) {
      const s = T[r.to];
      const v = r.type === 'FS' ? s.ES - x.EF - r.lag : r.type === 'SS' ? s.ES - x.ES - r.lag : r.type === 'FF' ? s.EF - x.EF - r.lag : s.EF - x.ES - r.lag;
      ff = Math.min(ff, v);
    }
    x.FF = Math.max(0, ff);
    x.critical = x.TF <= 0;
    if (x.TF < 0) probs.push(problem('late', 'error', `"${id}" is ${-x.TF} working day${-x.TF === 1 ? '' : 's'} behind what its deadline allows.`, [{ id }], { found: x.EF, req: x.LF }));
  }
  // one driving chain through the zero-float tasks (the longest path), from the earliest critical start
  const crit = ids.filter((i) => T[i].critical).sort((a, b) => T[a].ES - T[b].ES || ids.indexOf(a) - ids.indexOf(b));
  const tight = (r) => { const a = T[r.from], b = T[r.to]; return lowerBound(r, a, b.dur) === b.ES; };
  let chain = [];
  if (crit.length) {
    let cur = crit.find((i) => !pred.get(i).some((r) => T[r.from].critical && tight(r))) || crit[0];
    const seen = new Set();
    while (cur && !seen.has(cur)) { seen.add(cur); chain.push(cur); const nx = succ.get(cur).find((r) => T[r.to].critical && tight(r)); cur = nx && nx.to; }
  }
  return { ok: true, tasks: T, order, finish: end, duration: end, critical: crit, chain, relations: rels, problems: probs, method: m };
}

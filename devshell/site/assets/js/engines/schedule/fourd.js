/* SPDX-License-Identifier: Apache-2.0 */
import { problem, method } from './common.js';
import { taskCost, planned } from './cost.js';

/**
 * 4D: link model elements to tasks. links = [{ element, task, weight? }] (an element may belong to several tasks, a task to many elements).
 * state(day): 'before' | 'doing' | 'done' for each element. An element that is in several tasks is 'doing' while any is, 'done' when all are.
 */
export const M4D = method('4D construction sequence', 'Task dates from the schedule applied to linked elements', ['Shows the plan, not site progress.', 'An element with no task is reported, never drawn as built.', 'Dates come from the schedule you give; it does not check that the sequence is buildable.']);

export function stateOf(s, day) { return day < s.ES ? 'before' : day >= s.EF && !(s.ES === s.EF && day === s.ES - 1) ? 'done' : 'doing'; }

export function fourD(links, starts, day, elements = null) {
  const per = new Map(), probs = [];
  for (const l of links) {
    const s = starts[l.task];
    if (!s) { probs.push(problem('4d-task', 'warning', `Element "${l.element}" is linked to task "${l.task}", which is not in the schedule.`, [{ id: l.element }, { id: l.task }])); continue; }
    (per.get(l.element) || per.set(l.element, []).get(l.element)).push(stateOf(s, day));
  }
  const states = {};
  for (const [e, a] of per) states[e] = a.every((x) => x === 'done') ? 'done' : a.some((x) => x === 'doing') || (a.includes('done') && a.includes('before')) ? 'doing' : 'before';
  const unlinked = (elements || []).filter((e) => !per.has(e));
  if (unlinked.length) probs.push(problem('4d-unlinked', 'info', `${unlinked.length} element${unlinked.length === 1 ? ' is' : 's are'} not linked to any task.`, unlinked.slice(0, 20).map((id) => ({ id }))));
  const count = { before: 0, doing: 0, done: 0 }; for (const v of Object.values(states)) count[v]++;
  return { day, states, count, unlinked, problems: probs, method: M4D };
}

/** Days on which any element changes state, for playing the sequence: [{day, element, from, to}]. */
export function changes(links, starts) {
  const days = new Set();
  for (const l of links) { const s = starts[l.task]; if (s) { days.add(s.ES); days.add(s.EF); } }
  const sorted = [...days].sort((a, b) => a - b), out = []; let prev = {};
  for (const d of sorted) { const r = fourD(links, starts, d).states; for (const [e, v] of Object.entries(r)) if (prev[e] !== v) out.push({ day: d, element: e, from: prev[e] || 'before', to: v }); prev = r; }
  return out;
}

/** Tasks in the same exclusive zone (a room, a crane radius, a laydown area) at the same time. */
export function spaceConflicts(tasks, starts) {
  const out = [], z = tasks.filter((t) => t.zone && starts[t.id] && t.dur > 0);
  for (let i = 0; i < z.length; i++) for (let j = i + 1; j < z.length; j++) {
    const a = z[i], b = z[j];
    if (a.zone !== b.zone) continue;
    const s = Math.max(starts[a.id].ES, starts[b.id].ES), e = Math.min(starts[a.id].EF, starts[b.id].EF);
    if (s < e) out.push(problem('space', 'warning', `"${a.id}" and "${b.id}" both work in ${a.zone} from day ${s} to day ${e}.`, [{ id: a.id }, { id: b.id }], { zone: a.zone, from: s, to: e }));
  }
  return out;
}

/**
 * 5D: cost to date per element. A task's budget is shared among its linked elements by weight (equal when no weights) and accrues as the task
 * is planned. The elements add up to the cost curve (checked in the tests); a task with no element is returned as `unassigned`.
 */
export function costByElement(tasks, links, starts, day, rates = {}) {
  const byTask = new Map(); for (const l of links) (byTask.get(l.task) || byTask.set(l.task, []).get(l.task)).push(l);
  const el = {}; let unassigned = 0, total = 0;
  for (const t of tasks) {
    const s = starts[t.id]; if (!s) continue;
    const c = taskCost(t, rates) * planned(s, day); total += c;
    const ls = byTask.get(t.id);
    if (!ls || !ls.length) { unassigned += c; continue; }
    const w = ls.reduce((a, l) => a + (l.weight ?? 1), 0);
    for (const l of ls) el[l.element] = (el[l.element] || 0) + (w > 0 ? c * (l.weight ?? 1) / w : 0);
  }
  const probs = unassigned > 0 ? [problem('5d-unassigned', 'info', `${Math.round(unassigned)} of cost to date belongs to tasks with no linked element.`, [])] : [];
  return { day, elements: el, unassigned, total, problems: probs, method: method('5D cost by element', 'Task budget shared by weight over linked elements', ['A share, not a measured cost: an element\'s cost is only as good as its task\'s budget and weights.', 'Cost accrues evenly over each task.']) };
}

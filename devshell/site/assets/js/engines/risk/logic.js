/* SPDX-License-Identifier: Apache-2.0 */
import { problem, method } from './common.js';

/**
 * Fault trees and reliability block diagrams on one coherent-logic core.
 *   fault tree node:  { event: 'id' }  |  { and: [nodes] }  |  { or: [nodes] }  |  { koon: [nodes], k }   (k or more of the children occur)
 *   events: { id: { p } | { lambda, t } | { lambda, tau } | { mttf, mttr } }
 * The same event id used twice is the SAME event (a repeated event); probability is then computed exactly by factoring (Shannon expansion),
 * so repeated events never get multiplied as if independent. Cut sets: MOCUS (Fussell & Vesely 1972) with absorption.
 */
export function eventProbability(e) {
  if (e == null) return NaN;
  if (e.p != null) return e.p;
  if (e.lambda != null && e.t != null) return 1 - Math.exp(-e.lambda * e.t);                       // non-repairable, failed by time t
  if (e.lambda != null && e.tau != null) { const x = e.lambda * e.tau; return x < 1e-9 ? x / 2 : 1 - (1 - Math.exp(-x)) / x; } // standby tested every tau: mean unavailability
  if (e.mttf != null && e.mttr != null) return e.mttr / (e.mttf + e.mttr);                         // repairable, steady state
  return NaN;
}

const kind = (n) => (n.event != null ? 'event' : n.and ? 'and' : n.or ? 'or' : n.koon ? 'koon' : null);
const kids = (n) => n.and || n.or || n.koon;
function leaves(n, out = []) { const k = kind(n); if (k === 'event') out.push(n.event); else for (const c of kids(n)) leaves(c, out); return out; }

/** P(k or more of independent events with probabilities ps occur): the Poisson-binomial tail by dynamic programming. */
export function atLeast(k, ps) {
  let d = [1]; for (const p of ps) { const nd = new Array(d.length + 1).fill(0); for (let i = 0; i < d.length; i++) { nd[i] += d[i] * (1 - p); nd[i + 1] += d[i] * p; } d = nd; }
  let s = 0; for (let i = Math.max(0, k); i < d.length; i++) s += d[i]; return s;
}

function prob(n, p) {
  switch (kind(n)) {
    case 'event': return p.get(n.event);
    case 'and': return kids(n).reduce((a, c) => a * prob(c, p), 1);
    case 'or': return 1 - kids(n).reduce((a, c) => a * (1 - prob(c, p)), 1);
    default: return atLeast(n.k, kids(n).map((c) => prob(c, p)));
  }
}

export const M_FT = method('Fault tree: exact probability by factoring, minimal cut sets by MOCUS', 'Fussell & Vesely 1972; Shannon expansion for repeated events',
  ['Coherent logic only (AND, OR, k-of-n): no NOT or exclusive-or.', 'Events are independent unless they are the same event; common cause needs its own event (see betaFactor).',
   'Probabilities are the numbers given: failure data quality is the person\'s, not checked here.', 'Exact factoring is limited to 22 repeated events; above that only the cut-set bounds are given.']);

/** Validate a tree and its events; returns problems (empty when fine). */
export function check(tree, events) {
  const out = [];
  const walk = (n, path) => {
    const k = kind(n);
    if (!k) { out.push(problem('node', 'error', `A node at ${path} is not an event, and, or or koon.`, [{ id: path }])); return; }
    if (k === 'event') { if (!events[n.event]) out.push(problem('event-missing', 'error', `Event "${n.event}" has no probability or failure data.`, [{ id: n.event }])); return; }
    const c = kids(n);
    if (!Array.isArray(c) || !c.length) { out.push(problem('gate-empty', 'error', `A ${k} gate at ${path} has no inputs.`, [{ id: path }])); return; }
    if (k === 'koon' && !(Number.isInteger(n.k) && n.k >= 1 && n.k <= c.length)) out.push(problem('koon', 'error', `A voting gate at ${path} needs k between 1 and ${c.length} (it has ${n.k}).`, [{ id: path }]));
    c.forEach((x, i) => walk(x, path + '/' + i));
  };
  walk(tree, 'top');
  for (const [id, e] of Object.entries(events)) {
    const p = eventProbability(e);
    if (!(p >= 0 && p <= 1)) out.push(problem('event-p', 'error', `Event "${id}" gives a probability of ${p}; it must be between 0 and 1.`, [{ id }]));
  }
  return out;
}

export const REPEATED_LIMIT = 22;

function condition(n, id, v) { // substitute a constant for an event; returns a new tree or a boolean
  const k = kind(n);
  if (k === 'event') return n.event === id ? v : n;
  const cs = kids(n).map((c) => condition(c, id, v));
  if (k === 'and') { if (cs.includes(false)) return false; const r = cs.filter((c) => c !== true); return r.length === 0 ? true : r.length === 1 ? r[0] : { and: r }; }
  if (k === 'or') { if (cs.includes(true)) return true; const r = cs.filter((c) => c !== false); return r.length === 0 ? false : r.length === 1 ? r[0] : { or: r }; }
  const t = cs.filter((c) => c === true).length, r = cs.filter((c) => c !== true && c !== false), need = n.k - t;
  if (need <= 0) return true; if (need > r.length) return false; if (need === 1) return r.length === 1 ? r[0] : { or: r };
  return need === r.length ? { and: r } : { koon: r, k: need };
}

function exact(n, p) {
  if (n === true) return 1; if (n === false) return 0;
  const ls = leaves(n), count = new Map(); for (const l of ls) count.set(l, (count.get(l) || 0) + 1);
  const rep = [...count].filter(([, c]) => c > 1).map(([id]) => id);
  if (!rep.length) return prob(n, p);
  const x = rep[0], px = p.get(x);
  return px * exact(condition(n, x, true), p) + (1 - px) * exact(condition(n, x, false), p);
}

/** Minimal cut sets (arrays of event ids, sorted by size). Returns {sets, truncated}. */
export function cutSets(tree, limit = 20000) {
  let truncated = false;
  const min = (sets) => {
    const uniq = [...new Map(sets.map((s) => [s.join('\u0000'), s])).values()].sort((a, b) => a.length - b.length);
    const out = [];
    for (const s of uniq) if (!out.some((o) => o.every((e) => s.includes(e)))) out.push(s);
    return out;
  };
  const go = (n) => {
    const k = kind(n);
    if (k === 'event') return [[n.event]];
    const cs = kids(n).map(go);
    if (k === 'or') return min(cs.flat());
    if (k === 'and') { let acc = [[]]; for (const c of cs) { const nx = []; for (const a of acc) for (const b of c) nx.push([...new Set([...a, ...b])].sort()); acc = min(nx); if (acc.length > limit) { truncated = true; acc.length = limit; } } return acc; }
    const out = []; const pick = (i, chosen) => { if (chosen.length === n.k) { let acc = [[]]; for (const c of chosen) { const nx = []; for (const a of acc) for (const b of cs[c]) nx.push([...new Set([...a, ...b])].sort()); acc = min(nx); } out.push(...acc); return; } for (let j = i; j < cs.length; j++) pick(j + 1, [...chosen, j]); };
    pick(0, []); return min(out);
  };
  const sets = go(tree).map((s) => s.sort());
  return { sets: min(sets).sort((a, b) => a.length - b.length || (a.join() < b.join() ? -1 : 1)), truncated };
}

/**
 * Analyse a fault tree: exact top-event probability, cut sets, the rare-event and min-cut-upper-bound approximations, and the importance
 * measures for every event (Birnbaum, criticality, Fussell–Vesely, risk achievement worth, risk reduction worth; Modarres et al. 2010).
 */
export function faultTree(tree, events) {
  const probs = check(tree, events);
  if (probs.some((q) => q.severity === 'error')) return { ok: false, problems: probs, method: M_FT };
  const p = new Map(Object.entries(events).map(([id, e]) => [id, eventProbability(e)]));
  const ls = leaves(tree), count = new Map(); for (const l of ls) count.set(l, (count.get(l) || 0) + 1);
  const rep = [...count].filter(([, c]) => c > 1).map(([id]) => id), cs = cutSets(tree);
  const csP = cs.sets.map((s) => s.reduce((a, e) => a * p.get(e), 1)), rare = Math.min(1, csP.reduce((a, b) => a + b, 0)), mcub = 1 - csP.reduce((a, b) => a * (1 - b), 1);
  if (cs.truncated) probs.push(problem('cutsets-truncated', 'warning', 'There are more cut sets than the limit; the list and its bounds are incomplete.', []));
  let top = null;
  if (rep.length <= REPEATED_LIMIT) top = exact(tree, p);
  else probs.push(problem('repeated-limit', 'warning', `${rep.length} events appear more than once; the exact probability is skipped. The cut-set bounds are shown instead.`, rep.slice(0, 10).map((id) => ({ id }))));
  const P = top ?? mcub, imp = {};
  if (top != null) for (const id of count.keys()) {
    const hi = exact(tree, new Map(p).set(id, 1)), lo = exact(tree, new Map(p).set(id, 0)), pi = p.get(id);
    imp[id] = { p: pi, birnbaum: hi - lo, criticality: P > 0 ? (hi - lo) * pi / P : 0, fussellVesely: P > 0 ? (P - lo) / P : 0, raw: P > 0 ? hi / P : null, rrw: lo > 0 ? P / lo : null };
  }
  for (const s of cs.sets) if (s.length === 1) probs.push(problem('single-point', 'info', `"${s[0]}" alone brings the top event: a single point of failure.`, [{ id: s[0] }]));
  return { ok: true, top, rareEvent: rare, minCutUpperBound: mcub, cutSets: cs.sets, cutSetProbabilities: csP, truncated: cs.truncated, repeated: rep, importance: imp, problems: probs, method: M_FT };
}

/**
 * Reliability block diagram. node: { block: 'id' } | { series: [..] } | { parallel: [..] } | { koon: [..], k } (k or more must work).
 * comps: { id: { r } | { lambda } | { weibull: { beta, eta } } } at mission time t. Done by converting to the failure logic above, so a block
 * used in two places is one component, not two.
 */
export const M_RBD = method('Reliability block diagram by failure-logic duality and factoring', 'Series = OR of failures, parallel = AND, k-of-n working = (n−k+1)-of-n failing',
  ['Binary components (working or failed) with independent failures; no standby switching, load sharing or repair (see markov).', 'Reliability at one mission time; MTTF is a numerical integral to a horizon.', 'Component data are the person\'s numbers.']);

export function compReliability(c, t) {
  if (c.r != null) return c.r;
  if (c.lambda != null) return Math.exp(-c.lambda * t);
  if (c.weibull) return Math.exp(-Math.pow(t / c.weibull.eta, c.weibull.beta));
  return NaN;
}
function toFailure(n) {
  if (n.block != null) return { event: n.block };
  if (n.series) return { or: n.series.map(toFailure) };
  if (n.parallel) return { and: n.parallel.map(toFailure) };
  if (n.koon) return { koon: n.koon.map(toFailure), k: n.koon.length - n.k + 1 };
  return {};
}
export function rbd(node, comps, t) {
  const events = {}, probs = [];
  for (const [id, c] of Object.entries(comps)) { const r = compReliability(c, t); events[id] = { p: 1 - r }; if (!(r >= 0 && r <= 1)) probs.push(problem('rbd-r', 'error', `Block "${id}" gives a reliability of ${r}.`, [{ id }])); }
  const koonBad = (n) => (n.koon && !(Number.isInteger(n.k) && n.k >= 1 && n.k <= n.koon.length)) || [n.series, n.parallel, n.koon].some((c) => c && c.some(koonBad));
  if (koonBad(node)) probs.push(problem('rbd-koon', 'error', 'A k-of-n block needs k between 1 and n.', []));
  if (probs.length) return { ok: false, problems: probs, method: M_RBD };
  const ft = faultTree(toFailure(node), events);
  if (!ft.ok) return { ok: false, problems: ft.problems, method: M_RBD };
  return { ok: true, reliability: 1 - ft.top, unreliability: ft.top, cutSets: ft.cutSets, importance: ft.importance, problems: ft.problems, method: M_RBD };
}

/** Mean time to failure of a non-repairable diagram: ∫ R(t) dt by Simpson's rule to the time R falls below 1e-9 (or `horizon`). */
export function rbdMttf(node, comps, { horizon = null, steps = 4000 } = {}) {
  let H = horizon;
  if (H == null) { H = 1; while (H < 1e12 && rbd(node, comps, H).reliability > 1e-9) H *= 2; }
  const n = steps - (steps % 2), h = H / n; let s = 0;
  for (let i = 0; i <= n; i++) { const r = rbd(node, comps, i * h).reliability; s += r * (i === 0 || i === n ? 1 : i % 2 ? 4 : 2); }
  return { mttf: s * h / 3, horizon: H, method: M_RBD };
}

/** Beta-factor common cause (IEC 61508-6 Annex D, simple form): the part of a unit's failure rate shared by the whole redundant group. */
export function betaFactor(lambda, beta) { return { independent: lambda * (1 - beta), common: lambda * beta }; }

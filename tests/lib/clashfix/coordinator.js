/* SPDX-License-Identifier: Apache-2.0 */
/**
 * coordinator.js — collects each discipline's proposals for each clash, judges every one in the sandbox, ranks them, and keeps the
 * person's accept / reject choices (cc-clashfix, 0.9 EG.42). DOM-free. Nothing here changes the model: the host applies the accepted
 * actions itself, as one undo step.
 *
 *   coordinate(model, { clashes, disciplines, proposers, extra, limits, costs }) → result
 *        clashes     the host's clash list as [{ id: pairKey(a, b), a, b, depth? }]; default: the sandbox's own check
 *        disciplines which disciplines are asked (default all five)
 *        proposers   { discipline: fn(model, clash, limits) → [proposal] } — default the rule proposer; null leaves one out
 *        extra       proposals from elsewhere (assistants), each with its `clash`
 *   result = { limits, costs, baseline: [clash], items: [{ clash, proposals: [scored] (best first), refused: [scored] }], considered }
 *   addProposal(result, model, proposal) → the scored proposal (also placed in its item; refused ones are kept to show why)
 *   askAssistants(model, result, ask) → Promise<[proposal]>   ask(discipline, brief) → [{ clash, actions, why, title? }] — the hook a
 *        host uses when it can ask a connected assistant itself; each answer is tagged with its discipline and `by: 'assistant'`
 *   brief(model, result, discipline) → what one discipline's assistant is given: its clashes, its own elements in them, the other
 *        side, its tools and their limits (data only)
 *   new ReviewList(model, result)   accept(id) → { ok, code? } (one fix per clash; two fixes that change one element: 'conflict'),
 *        reject(id), clear(id), stateOf(id), accepted(), actions(), combined() → { remaining, newClashes, breaks, notes, cost, resolved }
 */
import { findClashes, pairKey } from './geom.js';
import { DISCIPLINE_IDS, DISCIPLINES, mergeLimits, COSTS, ownerOf } from './disciplines.js';
import { evaluate, applyActions, checks } from './sandbox.js';
import { ruleProposer } from './proposers.js';

const sig = (p) => JSON.stringify(p.actions);
let seq = 0;

export function coordinate(model, { clashes = null, disciplines = DISCIPLINE_IDS, proposers = {}, extra = [], limits = null, costs = COSTS } = {}) {
  const L = mergeLimits(limits);
  const baseline = (clashes || findClashes(model.elements, { tolerance: L.tolerance, allowed: model.allowed })).map((c) => ({ ...c, id: c.id || pairKey(c.a, c.b) }));
  const result = { limits: L, costs, baseline, items: baseline.map((c) => ({ clash: c, proposals: [], refused: [] })), considered: 0 };
  for (const it of result.items) {
    for (const d of disciplines) {
      const fn = proposers[d] === undefined ? ruleProposer(d) : proposers[d];
      if (!fn) continue;
      let ps = [];
      try { ps = fn(model, it.clash, L) || []; } catch (e) { ps = []; }
      for (const p of ps) addProposal(result, model, { ...p, discipline: p.discipline || d, clash: it.clash.id }, { quiet: p.by !== 'assistant' });
    }
  }
  for (const p of extra) addProposal(result, model, p);
  return result;
}

export function addProposal(result, model, p, { quiet = false } = {}) {
  const it = result.items.find((x) => x.clash.id === p.clash);
  if (!it) return { ...p, ok: false, refused: [{ code: 'unknown_clash', element: null, vars: {} }] };
  result.considered++;
  const id = p.id || it.clash.id + '#' + (++seq);
  const scored = evaluate(model, { ...p, id, by: p.by || 'rules' }, { limits: result.limits, costs: result.costs, baseline: result.baseline });
  if (!scored.ok) { if (!quiet) it.refused.push(scored); return scored; }
  if (it.proposals.some((q) => sig(q) === sig(scored) && q.by === scored.by)) return it.proposals.find((q) => sig(q) === sig(scored) && q.by === scored.by);
  it.proposals.push(scored);
  it.proposals.sort((a, b) => a.score - b.score || (a.by === b.by ? 0 : a.by === 'rules' ? 1 : -1));
  return scored;
}

export function brief(model, result, d) {
  const by = new Map(model.elements.map((e) => [e.id, e]));
  const show = (e) => e && ({ id: e.id, name: e.name || e.id, kind: e.kind, discipline: ownerOf(e), box: e.box || null, path: e.path || null, section: e.section || null, slope: e.slope || 0, fixedEnds: e.fixedEnds || null, loadBearing: e.loadBearing ?? null });
  const clashes = [];
  for (const it of result.items) {
    const a = by.get(it.clash.a), b = by.get(it.clash.b);
    const mine = [a, b].filter((e) => e && ownerOf(e) === d);
    if (!mine.length) continue;
    clashes.push({ clash: it.clash.id, depth: Math.round(it.clash.depth || 0), mine: mine.map(show), other: [a, b].filter((e) => e && !mine.includes(e)).map(show) });
  }
  const lim = {};
  for (const t of DISCIPLINES[d].tools) if (result.limits[t]) lim[t] = result.limits[t];
  return { discipline: d, units: 'mm, z up', tools: DISCIPLINES[d].tools, limits: lim, gap: result.limits.gap, checks: DISCIPLINES[d].checks, clashes };
}

export async function askAssistants(model, result, ask, { disciplines = DISCIPLINE_IDS } = {}) {
  const out = [];
  for (const d of disciplines) {
    const b = brief(model, result, d);
    if (!b.clashes.length) continue;
    let answer = [];
    try { answer = await ask(d, b); } catch (e) { answer = []; }
    for (const p of Array.isArray(answer) ? answer.slice(0, 50) : []) {
      if (!p || typeof p !== 'object') continue;
      out.push({ clash: String(p.clash || ''), discipline: d, by: 'assistant', client: p.client || null, why: typeof p.why === 'string' ? p.why.slice(0, 400) : '', title: p.title && typeof p.title.key === 'string' ? p.title : { key: 'p.assistant', vars: {} }, actions: Array.isArray(p.actions) ? p.actions.slice(0, 6) : [] });
    }
  }
  return out;
}

export class ReviewList {
  constructor(model, result) { this.model = model; this.result = result; this.state = new Map(); }
  find(id) { for (const it of this.result.items) { const p = it.proposals.find((q) => q.id === id); if (p) return { it, p }; } return null; }
  stateOf(id) { return this.state.get(id) || null; }
  touches(p) { const s = new Set(p.changed); for (const a of p.actions) if (a.op === 'opening') s.add(a.element); return s; }
  accept(id) {
    const f = this.find(id);
    if (!f) return { ok: false, code: 'not_found' };
    const mine = this.touches(f.p);
    for (const q of this.accepted()) {
      if (q.clash === f.p.clash) continue;
      if ([...this.touches(q)].some((x) => mine.has(x))) return { ok: false, code: 'conflict', with: q.id };
    }
    for (const q of f.it.proposals) if (q.id !== id && this.state.get(q.id) === 'accepted') this.state.delete(q.id);
    this.state.set(id, 'accepted');
    return { ok: true };
  }
  reject(id) { if (!this.find(id)) return { ok: false, code: 'not_found' }; this.state.set(id, 'rejected'); return { ok: true }; }
  clear(id) { this.state.delete(id); return { ok: true }; }
  accepted() { const out = []; for (const it of this.result.items) for (const p of it.proposals) if (this.state.get(p.id) === 'accepted') out.push(p); return out; }
  actions() { return this.accepted().flatMap((p) => p.actions); }
  /** Every accepted fix applied together in one sandbox: what is left, what is new, what breaks. */
  combined() {
    const acc = this.accepted(), L = this.result.limits;
    if (!acc.length) return { count: 0, remaining: this.result.baseline.length, newClashes: [], breaks: [], notes: [], cost: 0, resolved: 0 };
    const acts = acc.flatMap((p) => p.actions);
    const after = applyActions(this.model, acts);
    const now = findClashes(after.elements, { tolerance: L.tolerance, allowed: after.allowed });
    const ids = new Set(now.map((c) => c.id)), base = new Set(this.result.baseline.map((c) => c.id));
    for (const c of findClashes(this.model.elements, { tolerance: L.tolerance, allowed: this.model.allowed })) base.add(c.id);   // what clashed before, in any set
    const { breaks, notes } = checks(this.model, after, after.changed, acts, L);
    return {
      count: acc.length, remaining: this.result.baseline.filter((c) => ids.has(c.id)).length, resolved: this.result.baseline.filter((c) => !ids.has(c.id)).length,
      newClashes: now.filter((c) => !base.has(c.id)), breaks, notes, cost: acc.reduce((s, p) => s + p.cost, 0),
    };
  }
}

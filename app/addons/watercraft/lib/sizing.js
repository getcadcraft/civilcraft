/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine */
/**
 * sizing.js — pipe sizing and rehabilitation (0.11 WN.12). Greedy marginal analysis through the host's steady solver, which is what a person
 * does by hand: find what fails, buy the change that helps most per dollar, repeat; then take back any size that was not needed.
 *
 *   sizePipes(water, units, { diameters: [project diameter units, ascending], cost: (d, pipe) → money per project length unit (or { d: cost } table),
 *             pipes: [ids] (default every pipe), start: 'current' | 'smallest', allowSmaller (default false: with start 'current' no pipe shrinks), minP, vMax, mult, maxSolves, fire: { node, flow, residual } }) →
 *             { feasible, changes: [{ id, from, to, costDelta }], cost, water, history, violations, solves }
 *   rehabilitate(water, units, { options: [{ name, c, d, cost (per length unit) }], budget, pipes, minP, vMax, mult, maxSolves }) →
 *             { feasible, picks: [{ id, option, cost }], cost, water, violations, solves }
 *   minDiameter(units, { q, length, c, headLoss }) → the diameter a single pipe needs for a head loss budget (Hazen–Williams, closed form; project units)
 * A violation is a junction under the minimum pressure (summed shortfall) and a pipe over the velocity limit (summed excess); a fire draw adds the
 * shortfall at the residual. Costs are the person's own: no price list ships with the add-on.
 */
import { hydraulics, num, pos, si, problem } from './util.js';
import { solveState } from './control.js';

export function minDiameter(units, { q, length, c, headLoss }) {
  const K = si(units), Q = q * K.q, L = length * K.len, h = headLoss * K.len;
  const D = Math.pow(10.67 * L * Math.pow(Q, 1.852) / (Math.pow(c, 1.852) * h), 1 / 4.871);
  return D / K.dia;
}

function evaluate(W, units, opts) {
  const S = W.settings, minP = opts.minP ?? S.minP, vMax = opts.vMax ?? S.vMax, mult = opts.mult ?? 1;
  const draws = opts.fire ? [{ extra: { [opts.fire.node]: opts.fire.flow }, residual: opts.fire.residual ?? (units === 'm' ? 140 : 20) }] : [];
  let short = 0, fast = 0, worst = Infinity;
  const states = [{ extra: {}, residual: minP }, ...draws];
  for (const st of states) {
    const r = solveState(W, units, { mult, extra: st.extra });
    for (const [id, n] of r.nodes) if (n.kind === 'junction') { if (n.pressure == null) short += st.residual + 100; else { if (n.pressure < st.residual) short += st.residual - n.pressure; worst = Math.min(worst, n.pressure); } }
    if (st === states[0]) for (const p of r.pipes.values()) if (p.kind === 'pipe' && p.v != null && p.v > vMax) fast += p.v - vMax;
  }
  return { short, fast, score: short + fast * (units === 'm' ? 10 : 3), worst: Number.isFinite(worst) ? worst : null };
}
const costFn = (c) => (typeof c === 'function' ? c : (d) => (c && c[d] != null ? c[d] : 0));

export function sizePipes(water, units, opts = {}) {
  const hyd = hydraulics();
  let W = JSON.parse(JSON.stringify(hyd.cleanWater ? hyd.cleanWater(water, units) : water));
  const ds = [...new Set((opts.diameters || []).map(Number).filter((d) => d > 0))].sort((a, b) => a - b);
  if (ds.length < 2) throw problem('few_sizes');
  const cost = costFn(opts.cost), maxSolves = opts.maxSolves || 4000;
  const ids = (opts.pipes && opts.pipes.length ? opts.pipes : W.pipes.filter((p) => p.kind === 'pipe').map((p) => p.id)).filter((id) => W.pipes.some((p) => p.id === id && p.kind === 'pipe'));
  const pipe = (id) => W.pipes.find((p) => p.id === id);
  const len = (p) => p.length ?? Math.hypot(W.nodes.find((n) => n.id === p.a).x - W.nodes.find((n) => n.id === p.b).x, W.nodes.find((n) => n.id === p.a).y - W.nodes.find((n) => n.id === p.b).y);
  const orig = new Map(ids.map((id) => [id, pipe(id).d]));
  // snap each pipe to the first listed size at or above its own (a size the list lacks is not a choice)
  const idxOf = (d) => { let i = ds.findIndex((x) => x >= d - 1e-9); return i < 0 ? ds.length - 1 : i; };
  const at = new Map(ids.map((id) => [id, opts.start === 'smallest' ? 0 : idxOf(pipe(id).d || ds[0])]));
  const floor = new Map(ids.map((id) => [id, opts.allowSmaller || opts.start === 'smallest' ? 0 : at.get(id)]));   // a pipe is not made smaller than it is unless asked
  const apply = () => { for (const id of ids) pipe(id).d = ds[at.get(id)]; };
  apply();
  let solves = 0; const history = [];
  const ev = () => { solves++; return evaluate(W, units, opts); };
  let cur = ev();
  while ((cur.score > 1e-9) && solves < maxSolves) {
    let best = null;
    for (const id of ids) {
      const i = at.get(id); if (i >= ds.length - 1) continue;
      pipe(id).d = ds[i + 1]; const e = ev(); pipe(id).d = ds[i];
      const dc = (cost(ds[i + 1], pipe(id)) - cost(ds[i], pipe(id))) * len(pipe(id)), gain = cur.score - e.score;
      if (gain > 1e-9) { const ratio = gain / Math.max(dc, 1e-9); if (!best || ratio > best.ratio) best = { id, ratio, e }; }
      if (solves >= maxSolves) break;
    }
    if (!best) break;
    at.set(best.id, at.get(best.id) + 1); pipe(best.id).d = ds[at.get(best.id)]; cur = best.e; history.push({ id: best.id, to: ds[at.get(best.id)], score: cur.score });
  }
  const feasible = cur.score <= 1e-9;
  if (feasible) {   // take back what the fix no longer needs: the dearest saving first, one step at a time
    let again = true;
    while (again && solves < maxSolves) {
      again = false;
      const order = ids.filter((id) => at.get(id) > floor.get(id)).map((id) => ({ id, save: (cost(ds[at.get(id)], pipe(id)) - cost(ds[at.get(id) - 1], pipe(id))) * len(pipe(id)) })).sort((a, b) => b.save - a.save);
      for (const o of order) {
        const i = at.get(o.id); pipe(o.id).d = ds[i - 1]; const e = ev();
        if (e.score <= 1e-9) { at.set(o.id, i - 1); history.push({ id: o.id, to: ds[i - 1], score: e.score, back: true }); again = true; cur = e; break; }
        pipe(o.id).d = ds[i];
        if (solves >= maxSolves) break;
      }
    }
  }
  const changes = ids.filter((id) => Math.abs(pipe(id).d - orig.get(id)) > 1e-9).map((id) => ({ id, from: orig.get(id), to: pipe(id).d, costDelta: (cost(pipe(id).d, pipe(id)) - cost(orig.get(id), pipe(id))) * len(pipe(id)) }));
  return { feasible, changes, cost: changes.reduce((s, c) => s + c.costDelta, 0), water: W, history, violations: { short: cur.short, fast: cur.fast }, worstPressure: cur.worst, solves };
}

export function rehabilitate(water, units, opts = {}) {
  const hyd = hydraulics();
  const W = JSON.parse(JSON.stringify(hyd.cleanWater ? hyd.cleanWater(water, units) : water));
  const options = (opts.options || []).filter((o) => o.name && pos(o.cost, 0) >= 0);
  if (!options.length) throw problem('no_options');
  const budget = num(opts.budget, Infinity);
  const ids = (opts.pipes && opts.pipes.length ? opts.pipes : W.pipes.filter((p) => p.kind === 'pipe').map((p) => p.id));
  const pipe = (id) => W.pipes.find((p) => p.id === id);
  const len = (p) => p.length ?? Math.hypot(W.nodes.find((n) => n.id === p.a).x - W.nodes.find((n) => n.id === p.b).x, W.nodes.find((n) => n.id === p.a).y - W.nodes.find((n) => n.id === p.b).y);
  const maxSolves = opts.maxSolves || 3000; let solves = 0, spent = 0;
  const ev = () => { solves++; return evaluate(W, units, opts); };
  let cur = ev(); const picks = [], done = new Set();
  while (cur.score > 1e-9 && solves < maxSolves) {
    let best = null;
    for (const id of ids) {
      if (done.has(id)) continue;
      const p = pipe(id), keep = { c: p.c, d: p.d };
      for (const o of options) {
        const dc = o.cost * len(p); if (spent + dc > budget + 1e-9) continue;
        p.c = o.c ?? p.c; if (o.d) p.d = o.d;
        const e = ev(); p.c = keep.c; p.d = keep.d;
        const gain = cur.score - e.score;
        if (gain > 1e-9) { const ratio = gain / Math.max(dc, 1e-9); if (!best || ratio > best.ratio) best = { id, o, dc, e, ratio }; }
      }
      if (solves >= maxSolves) break;
    }
    if (!best) break;
    const p = pipe(best.id); p.c = best.o.c ?? p.c; if (best.o.d) p.d = best.o.d;
    done.add(best.id); spent += best.dc; cur = best.e; picks.push({ id: best.id, option: best.o.name, cost: best.dc, score: cur.score });
  }
  return { feasible: cur.score <= 1e-9, picks, cost: spent, water: W, violations: { short: cur.short, fast: cur.fast }, worstPressure: cur.worst, solves };
}

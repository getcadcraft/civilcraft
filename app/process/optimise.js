/* SPDX-License-Identifier: Apache-2.0 */
/**
 * optimise.js — optimise overnight (0.8 Track CH, CH.31). DOM-free. Flowsheet variables become a `lib/study` design study (cc-study v1, EG.33):
 * the study library is handed in (`studyLib`: { runStudy, readStudy, paretoFront, rankRows, feasible }) so this file keeps no import outside lib/process
 * and the same code runs in a page, a worker, a compute node (CU.7: pass `evaluate` that ships a variant to a node) or a test.
 *
 *   metricsOf(model, result, prices, factors)       the numbers a variant is judged by
 *   makeStudy(spec)                                 spec → a cc-study v1 object
 *   evaluator(model, spec)                          → async (variant) → { metricKey: number } | { error }
 *   solveVariant(flowsheet, variant, spec)          the one solve-and-judge both the local and the node paths call
 *   variantTasks() / remoteEvaluator(nodes, model, spec)   CH.31: the 'process-variant' job a LAN compute node runs, and the evaluate that sends variants to those nodes (falls back to local)
 *   optimise(model, spec, { studyLib, concurrency, evaluate?, onProgress, cancelled })
 *                                                   → { study, rows, front, ranked, failed, cancelled, problems }
 *   createJobs(studyLib)                            handles for long runs: start(model, spec) → id, status(id), result(id), cancel(id)
 *
 * spec = { title, variables: [{ unit, param, from, to, steps }], objectives: [{ key, metric, goal: 'min'|'max', limit? }], prices?, factors?, mode?: 'grid' | 'random', count? }
 *   metric: 'heat_kW' | 'cool_kW' | 'shaft_kW' | 'energy_kW' | 'operating_per_h' (needs prices) | 'co2_kg_h' (needs factors) | { stream, prop } (T, P, F, vf, x:<comp>, flow:<comp>)
 *   prices  = { heat: $/GJ, cool: $/GJ, power: $/kWh }       never defaulted: a metric that needs a price the person did not give is refused
 *   factors = { heat: kg CO2/GJ of heat duty, power: kg CO2/kWh }  never defaulted
 */
import { solve, thermoFor, propOf } from './flowsheet.js';

const NEED = { operating_per_h: ['prices'], co2_kg_h: ['factors'] };
export function metricsOf(result, metrics, { prices = null, factors = null, th = null } = {}) {
  let heat = 0, cool = 0, shaft = 0;
  for (const u of Object.values(result.units || {})) { const Q = u.Q || 0, W = u.W || 0; if (Q > 0) heat += Q; else cool += -Q; if (W > 0) shaft += W; }
  const all = { heat_kW: heat / 1e3, cool_kW: cool / 1e3, shaft_kW: shaft / 1e3, energy_kW: (heat + cool + shaft) / 1e3 };
  if (prices) all.operating_per_h = ((heat * (prices.heat ?? NaN) + cool * (prices.cool ?? NaN)) * 3600 / 1e9) + (shaft / 1e3) * (prices.power ?? NaN);
  if (factors) all.co2_kg_h = (heat * 3600 / 1e9) * (factors.heat ?? NaN) + (shaft / 1e3) * (factors.power ?? NaN);
  const out = {};
  for (const m of metrics) out[m.key] = typeof m.metric === 'string' ? all[m.metric] : propOf(th, result, m.metric);
  return out;
}

export function makeStudy(spec) {
  if (!Array.isArray(spec.variables) || !spec.variables.length) throw new Error('an optimisation needs at least one variable');
  if (!Array.isArray(spec.objectives) || !spec.objectives.length) throw new Error('an optimisation needs at least one objective');
  for (const o of spec.objectives) for (const need of typeof o.metric === 'string' ? NEED[o.metric] || [] : []) if (!spec[need]) throw new Error(`metric ${o.metric} needs ${need}, which the person has to give (nothing is defaulted)`);
  return {
    v: 1, title: String(spec.title || 'Optimisation').slice(0, 120),
    source: { kind: 'parameters', mode: spec.mode || 'grid', ...(spec.count ? { count: spec.count } : {}), params: spec.variables.map((v) => ({ name: v.unit + '.' + v.param, from: v.from, to: v.to, steps: v.steps || 5 })) },
    metrics: spec.objectives.map((o) => ({ key: o.key, label: o.label || o.key, goal: o.goal || 'none', ...(o.limit !== undefined ? { limit: o.limit } : {}) })),
  };
}

/** Solve one variant of a flowsheet and judge it (the one place this is done: here, in a worker, or on a compute node). */
export function solveVariant(flowsheet, variant, spec) {
  const th = thermoFor(flowsheet);
  const def = JSON.parse(JSON.stringify(flowsheet));
  for (const [name, val] of Object.entries(variant.set || {})) { const [uid, ...rest] = name.split('.'), u = def.units.find((q) => q.id === uid); if (!u) return { error: 'no unit ' + uid }; (u.p ||= {})[rest.join('.')] = val; }
  let r; try { r = solve(def); } catch (e) { return { error: String(e.message || e) }; }
  if (!r.converged) return { error: 'the flowsheet did not converge' };
  if (r.problems.some((p) => p.severity === 'error')) return { error: r.problems.find((p) => p.severity === 'error').text };
  return metricsOf(r, spec.objectives, { prices: spec.prices, factors: spec.factors, th });
}

export function evaluator(model, spec) {
  return async (variant) => solveVariant(model.flowsheet, variant, spec);
}

/** CH.31, the node's side: the task table a compute node registers (`serveNode({ tasks })`, lib/compute/lan-node.js). The node runs its OWN code by id; the job is plain JSON. */
export const VARIANT_TASK = 'process-variant';
export function variantTasks() {
  return { [VARIANT_TASK]: { run(input) {
    if (!input || typeof input !== 'object' || !input.flowsheet || !input.variant || !input.spec) throw new Error('a process-variant job needs flowsheet, variant and spec');
    makeStudy(input.spec);   // the same checks as a local run (objectives, prices asked for are given)
    return solveVariant(input.flowsheet, input.variant, input.spec);
  } } };
}

/**
 * CH.31, the requester's side: an `evaluate` for optimise() that sends each variant to the connected nodes that list 'process-variant' (round robin, one job per node at a time is the node's own limit),
 * and solves it here when no node is left or a node leaves mid-run (a variant is never lost). `nodes` is an array or a function returning one (lan-ui's connected nodes).
 */
export function remoteEvaluator(nodes, model, spec, { onRemote = () => {}, onLocal = () => {} } = {}) {
  const local = evaluator(model, spec);
  const live = () => (typeof nodes === 'function' ? nodes() : nodes || []).filter((n) => n && !n.closed && n.info && Array.isArray(n.info.tasks) && n.info.tasks.includes(VARIANT_TASK));
  let turn = 0;
  return async (variant) => {
    for (let tries = 0; tries < 3; tries++) {
      const list = live(); if (!list.length) break;
      const node = list[turn++ % list.length];
      try { const out = await node.runTask(VARIANT_TASK, { flowsheet: model.flowsheet, variant, spec }); onRemote(node); return out; }
      catch (e) { if (e && (e.code === 'refused' || e.code === 'cancelled')) return { error: String(e.message || e.code) }; /* node_left, timeout, closed: try another */ }
    }
    onLocal(); return local(variant);
  };
}

export async function optimise(model, spec, { studyLib, concurrency = 4, evaluate = null, onProgress = null, cancelled = () => false } = {}) {
  if (!studyLib) throw new Error('optimise needs the study library (lib/study)');
  const study = studyLib.readStudy(makeStudy(spec)), ev = evaluate || evaluator(model, spec);
  const res = await studyLib.runStudy(study, ev, { concurrency, onProgress, cancelled });
  const front = studyLib.paretoFront(study, res.rows), ranked = studyLib.rankRows(study, res.rows, spec.weights || {});
  const problems = [];
  if (!front.length) problems.push({ id: 'process:opt.none', code: 'opt.none', severity: 'warning', text: 'No variant met every limit, so there is no trade-off front.', about: [], source: { kind: 'engine', name: 'process' } });
  if (res.failed) problems.push({ id: 'process:opt.failed', code: 'opt.failed', severity: 'info', text: `${res.failed} of ${res.rows.length} variants could not be solved.`, about: [], source: { kind: 'engine', name: 'process' } });
  return { study, rows: res.rows, front, ranked, failed: res.failed, cancelled: res.cancelled, problems };
}

/** Handles (AI-CONNECT-SPEC § 2.7): the job lives in memory for 24 hours. */
export function createJobs(studyLib, { now = () => Date.now(), ttl = 24 * 3600e3 } = {}) {
  const jobs = new Map(); let n = 0;
  const sweep = () => { for (const [k, j] of jobs) if (now() - j.created > ttl) jobs.delete(k); };
  return {
    start(model, spec, opts = {}) {
      sweep(); const study = makeStudy(spec), total = studyLib.expandVariants(studyLib.readStudy(study)).length;
      const id = 'opt' + (++n).toString(36) + Math.floor(now() % 1e6).toString(36), j = { id, created: now(), state: 'running', done: 0, total, cancelled: false, result: null, error: null };
      jobs.set(id, j);
      optimise(model, spec, { studyLib, ...opts, onProgress: (p) => { j.done = p.done; }, cancelled: () => j.cancelled }).then((r) => { j.result = r; j.state = r.cancelled ? 'cancelled' : 'done'; }).catch((e) => { j.error = String(e.message || e); j.state = 'failed'; });
      return id;
    },
    status(id) { const j = jobs.get(id); return j ? { state: j.state, progress: j.total ? j.done / j.total : 1, done: j.done, total: j.total, message: j.error || '' } : null; },
    result(id) { const j = jobs.get(id); return j && j.result ? j.result : null; },
    cancel(id) { const j = jobs.get(id); if (j) j.cancelled = true; return !!j; },
  };
}

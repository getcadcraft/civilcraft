/* SPDX-License-Identifier: Apache-2.0 */
/**
 * problems-water.js — the water mains' warnings as shared Problems (0.8 LC.16; shape: docs/0.8-PROBLEMS-SPEC.md § 1–2, rule 29).
 * No DOM: bin/test-civilcraft-water.mjs runs it in Node; civilcraft.js registers it as the source `civilcraft.water`.
 *
 *   waterProblems(water, units, { t, result }) → [problem]
 *     result   a water.js solve() result for this model (water-ui.js keeps one, so nothing is solved twice); null = solve here
 *   One problem per solver finding (water.js codes), about the node or link it names. Severity: error for a solver that did not
 *   settle, a cut-off node, negative pressure and a pipe with no diameter; warning for the rest. A design aid: an engineer checks.
 */
import { cleanWater, solve } from './water.js';

const ERRORS = new Set(['noconverge', 'isolated', 'negp', 'nodiameter', 'pumpcurve']);
const fx = (v) => (Number.isFinite(v) ? String(Math.round(v * 10) / 10) : '');

export function waterProblems(water, units, { t = (k) => k, result = null } = {}) {
  const w = cleanWater(water, units);
  if (!w.nodes.length || !w.pipes.length) return [];
  const r = result || solve(w, units);
  const nodes = new Set(w.nodes.map((n) => n.id)), name = new Map([...w.nodes, ...w.pipes].map((x) => [x.id, x.name || x.id]));
  const pu = units === 'm' ? 'kPa' : 'psi', vu = units === 'm' ? 'm/s' : 'ft/s';
  return r.problems.map((p) => {
    const id = p.id || '', vars = { id: name.get(id) || id, value: fx(p.value), limit: fx(p.limit), n: p.iterations ?? '', u: p.code === 'fast' ? vu : pu };
    return { code: 'water.' + p.code, part: p.code + ':' + id, severity: ERRORS.has(p.code) ? 'error' : 'warning',
      msg: { key: 'wm.issue.' + p.code, vars }, text: t('wm.issue.' + p.code, vars),
      about: id ? [{ kind: nodes.has(id) ? 'wnode' : 'wpipe', id, label: name.get(id) || id }] : [] };
  });
}

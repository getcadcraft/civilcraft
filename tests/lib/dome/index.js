/* SPDX-License-Identifier: Apache-2.0 */
/**
 * index.js — the dome generator's engine (0.11 Track DOME; brief docs/0.11-DOME-SPEC.md). lib/dome is canonical: add-ons carry byte-identical
 * copies (`node tools/dome/sync.mjs`). Host-free: no DOM here, no app imports; panel.js is the only file that touches a page, and only when called.
 *
 * design(raw, spec) is the whole generator: loose input and an optional spec pack in, everything out.
 */
import { cleanDome, resolve } from './model.js';
import { build } from './build.js';
import { quantities } from './quantities.js';
import { forces } from './membrane.js';
import { bending } from './bending.js';
import { check } from './spec.js';

export * from './model.js';
export * from './geometry.js';
export * from './build.js';
export * from './quantities.js';
export * from './membrane.js';
export * from './shellfe.js';
export * from './bending.js';
export * from './units.js';
export * from './spec.js';
export * from './drawings.js';
export * from './report.js';
export * from './ifcout.js';

/**
 * → { dome (cleaned input), inputProblems, spec, design (every figure set), basis (where each governed figure came from), built { elements,
 *     layout, metrics }, quantities, forces (membrane.js), bending (bending.js), checks (against the spec; [] with none), problems: [{ code, vars }] (the generator's
 *     own remarks) }
 */
export function design(raw = {}, spec = null) {
  const { dome, problems: inputProblems } = cleanDome(raw);
  const { design: d, basis } = resolve(dome, spec);
  const built = build(d);
  const q = quantities(d, built);
  const f = forces(d, built.layout.meridian, built.layout.kept);
  const problems = [...built.problems];
  const M = built.metrics;
  if (d.shell < 2 * d.cover + 25) problems.push({ code: 'shell.thin', vars: { shell: d.shell, cover: d.cover } });
  if (d.footingWidth < M.rOut - M.rIn - 1e-6) problems.push({ code: 'footing.narrow', vars: { footing: d.footingWidth, base: Math.round(M.rOut - M.rIn) } });
  if (M.footing[0] <= 0) problems.push({ code: 'footing.wide', vars: {} });
  if (M.clearHeight < d.headroom) problems.push({ code: 'headroom.none', vars: { clear: Math.round(M.clearHeight), headroom: d.headroom } });
  const worst = f.cases.snow || f.cases.dead;
  if (worst.maxCompression.stress > d.concreteMPa) problems.push({ code: 'stress.high', vars: { stress: Number(worst.maxCompression.stress.toFixed(1)), strength: d.concreteMPa } });
  const b = bending(d, built.layout.meridian);
  if (b.failed) problems.push({ code: 'bending.failed', vars: {} });
  for (const id of ['wind', 'seismic']) if (f.cases[id] && f.cases[id].floor.withDead.max > 1e-6) problems.push({ code: 'uplift.' + id, vars: { n: Number(f.cases[id].floor.withDead.max.toFixed(1)) } });
  if (f.buckling && f.buckling.reduced !== null && f.buckling.reduced < 1) problems.push({ code: 'buckling.low', vars: { ratio: Number(f.buckling.reduced.toFixed(2)) } });
  if (q.bars && q.bars.ratioBase < d.rebarRatio - 1e-12) problems.push({ code: 'bars.light', vars: { have: Number(q.bars.ratioBase.toFixed(5)), want: d.rebarRatio } });
  const worstB = b.cases.snow || b.cases.dead;
  if (worstB && worstB.maxCompression.stress > d.concreteMPa) problems.push({ code: 'stress.bending', vars: { stress: Number(worstB.maxCompression.stress.toFixed(1)), strength: d.concreteMPa } });
  const result = { dome, inputProblems, spec, design: d, basis, built, quantities: q, forces: f, bending: b, problems };
  result.checks = check(d, basis, f, spec);
  return result;
}

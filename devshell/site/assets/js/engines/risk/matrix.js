/* SPDX-License-Identifier: Apache-2.0 */
import { problem, method } from './common.js';

/**
 * A risk matrix and a risk file in the shape of ISO 14971's process (hazard → hazardous situation → harm; estimate; evaluate against the
 * criteria; control; evaluate the residual risk), for medical devices and any other field that keeps one.
 *   matrix: { severity: ['Negligible', …], probability: ['Improbable', …], cells: [[level …] per severity row][per probability column],
 *             levels: ['acceptable', 'reduce as far as practicable', 'unacceptable'] }       ← the maker's own policy; nothing is built in
 *   hazard: { id, hazard, situation, harm, S, P (0-based indexes into the matrix), controls: [{ id, text, S?, P?, verified }], residual: { S, P } }
 */
export function checkMatrix(m) {
  const out = [], rows = m.severity?.length, cols = m.probability?.length;
  if (!rows || !cols) return [problem('matrix-size', 'error', 'The risk matrix needs severity and probability scales.', [])];
  if (!Array.isArray(m.cells) || m.cells.length !== rows || m.cells.some((r) => !Array.isArray(r) || r.length !== cols)) out.push(problem('matrix-cells', 'error', `The matrix needs ${rows} rows of ${cols} cells.`, []));
  else for (const [i, r] of m.cells.entries()) for (const [j, c] of r.entries()) if (!m.levels.includes(c)) out.push(problem('matrix-level', 'error', `Cell ${i},${j} says "${c}", which is not one of the levels.`, []));
  // a sane matrix never gets safer as severity or probability rises: warn, don't refuse (it is their policy)
  if (!out.length) { const rank = (c) => m.levels.indexOf(c); for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { if (i + 1 < rows && rank(m.cells[i + 1][j]) < rank(m.cells[i][j])) out.push(problem('matrix-order', 'warning', `Cell ${i + 1},${j} is rated lower than the less severe cell above it.`, [])); if (j + 1 < cols && rank(m.cells[i][j + 1]) < rank(m.cells[i][j])) out.push(problem('matrix-order', 'warning', `Cell ${i},${j + 1} is rated lower than the less probable cell beside it.`, [])); } }
  return out;
}

export function riskFile(hazards, m) {
  const probs = checkMatrix(m);
  if (probs.some((p) => p.severity === 'error')) return { ok: false, problems: probs, method: M_FILE };
  const top = m.levels[m.levels.length - 1], at = (s, p) => m.cells[s][p], rank = (c) => m.levels.indexOf(c);
  const rows = hazards.map((h) => {
    const okIdx = (x) => x && Number.isInteger(x.S) && Number.isInteger(x.P) && x.S >= 0 && x.S < m.severity.length && x.P >= 0 && x.P < m.probability.length;
    if (!okIdx(h)) { probs.push(problem('estimate', 'error', `"${h.id}" needs a severity and probability inside the matrix.`, [{ id: h.id }])); return { ...h, initial: null, residualLevel: null }; }
    const initial = at(h.S, h.P), res = okIdx(h.residual) ? h.residual : null, residualLevel = res ? at(res.S, res.P) : null;
    if (!h.harm) probs.push(problem('no-harm', 'warning', `"${h.id}" names no harm.`, [{ id: h.id }]));
    if (rank(initial) > 0 && !(h.controls || []).length) probs.push(problem('no-control', 'warning', `"${h.id}" is rated "${initial}" and has no risk control.`, [{ id: h.id }]));
    for (const c of h.controls || []) if (!c.verified) probs.push(problem('unverified', 'warning', `Control "${c.id}" for "${h.id}" is not verified yet.`, [{ id: h.id }, { id: c.id }]));
    if ((h.controls || []).length && !res) probs.push(problem('no-residual', 'warning', `"${h.id}" has controls but no residual risk estimate.`, [{ id: h.id }]));
    if (res && rank(residualLevel) > rank(initial)) probs.push(problem('residual-worse', 'error', `The residual risk of "${h.id}" (${residualLevel}) is higher than the initial risk (${initial}).`, [{ id: h.id }]));
    if (residualLevel === top) probs.push(problem('residual-unacceptable', 'error', `The residual risk of "${h.id}" is "${residualLevel}".`, [{ id: h.id }]));
    return { ...h, initial, residualLevel };
  });
  const count = Object.fromEntries(m.levels.map((l) => [l, 0])); for (const r of rows) if (r.residualLevel) count[r.residualLevel]++;
  return { ok: !probs.some((p) => p.severity === 'error'), rows, residualCounts: count, problems: probs, method: M_FILE };
}
const M_FILE = method('Risk matrix and risk file bookkeeping', 'The process of ISO 14971 (identify, estimate, evaluate, control, residual)',
  ['The matrix, its scales and what is acceptable are the manufacturer\'s own policy: none is built in and none is checked against a standard.', 'It keeps the file consistent. It does not judge whether hazards were missed, whether estimates are right or whether the benefit outweighs the risk.', 'Not a regulatory submission.']);

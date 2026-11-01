/* SPDX-License-Identifier: Apache-2.0 */
import { problem, method } from './common.js';

/**
 * FMEA worksheet. rows: [{ id, item, mode, effect?, cause?, control?, S, O, D, action? }], S/O/D whole ratings 1–10 (severity, occurrence, detection;
 * 10 = worst for all three). RPN = S×O×D (IEC 60812). opts: { rpnLimit (the owner's own action threshold), severityLimit (default 9: a mode this
 * severe is flagged whatever its RPN; null turns the rule off) }. The scales' meaning is the team's, written in their procedure.
 */
export function fmea(rows, opts = {}) {
  const { rpnLimit = null, severityLimit = 9 } = opts, probs = [], seen = new Set();
  const out = rows.map((r) => {
    const bad = ['S', 'O', 'D'].filter((k) => !(Number.isInteger(r[k]) && r[k] >= 1 && r[k] <= 10));
    if (bad.length) probs.push(problem('rating', 'error', `"${r.id}": ${bad.join(', ')} must be a whole number from 1 to 10.`, [{ id: r.id }]));
    if (seen.has(r.id)) probs.push(problem('duplicate', 'error', `Two rows share the id "${r.id}".`, [{ id: r.id }])); seen.add(r.id);
    const rpn = bad.length ? null : r.S * r.O * r.D;
    const flags = [];
    if (rpn != null && rpnLimit != null && rpn >= rpnLimit) flags.push('rpn');
    if (rpn != null && severityLimit != null && r.S >= severityLimit) flags.push('severity');
    if (flags.length && !r.action) probs.push(problem('no-action', 'warning', `"${r.id}" (${r.item || ''} ${r.mode || ''}) is flagged for ${flags.join(' and ')} and has no action.`, [{ id: r.id }], { rpn, S: r.S }));
    return { ...r, rpn, flags };
  });
  const ranked = out.filter((r) => r.rpn != null).sort((a, b) => b.rpn - a.rpn || b.S - a.S);
  const total = ranked.reduce((a, r) => a + r.rpn, 0); let acc = 0;
  ranked.forEach((r, i) => { r.rank = i + 1; acc += r.rpn; r.cumulative = total ? acc / total : 0; });
  return { rows: out, ranked, problems: probs, method: method('FMEA, risk priority number', 'IEC 60812 (RPN = S × O × D)',
    ['RPN multiplies ordinal ratings: the same RPN from different S, O, D is not the same risk, so severity is flagged on its own.', 'The rating scales and thresholds are the team\'s; none is built in.', 'A worksheet check, not a prediction of failures.']) };
}

export const SEVERITY_CLASSES = ['I', 'II', 'III', 'IV']; // I catastrophic … IV minor (MIL-STD-1629A usage)

/**
 * FMECA, the quantitative criticality analysis of MIL-STD-1629A task 102 / IEC 60812 §: for each failure mode
 *   Cm = β · α · λp · t     (β conditional probability of the end effect, α failure-mode ratio, λp part failure rate, t operating time)
 * and for an item and severity class Cr = Σ Cm. modes: [{ id, item, mode, lambda, alpha, beta, t, cls ('I'..'IV') }].
 */
export function fmeca(modes) {
  const probs = [], items = new Map();
  const rows = modes.map((m) => {
    const bad = [];
    if (!(m.lambda >= 0)) bad.push('lambda'); if (!(m.alpha >= 0 && m.alpha <= 1)) bad.push('alpha'); if (!(m.beta >= 0 && m.beta <= 1)) bad.push('beta'); if (!(m.t >= 0)) bad.push('t');
    if (!SEVERITY_CLASSES.includes(m.cls)) bad.push('cls');
    if (bad.length) probs.push(problem('fmeca-input', 'error', `"${m.id}": ${bad.join(', ')} out of range.`, [{ id: m.id }]));
    (items.get(m.item) || items.set(m.item, []).get(m.item)).push(m);
    return { ...m, cm: bad.length ? null : m.beta * m.alpha * m.lambda * m.t };
  });
  const itemRows = [];
  for (const [item, ms] of items) {
    const sumA = ms.reduce((a, m) => a + (m.alpha || 0), 0);
    if (Math.abs(sumA - 1) > 1e-6) probs.push(problem('alpha-sum', 'warning', `The failure-mode ratios of "${item}" add to ${+sumA.toFixed(6)}, not 1: a mode is missing or double counted.`, [{ id: item }], { found: sumA, req: 1 }));
    const byCls = {}; for (const m of rows.filter((r) => r.item === item && r.cm != null)) byCls[m.cls] = (byCls[m.cls] || 0) + m.cm;
    itemRows.push({ item, alphaSum: sumA, cr: byCls });
  }
  const matrix = {}; for (const c of SEVERITY_CLASSES) matrix[c] = rows.filter((r) => r.cls === c && r.cm != null).sort((a, b) => b.cm - a.cm).map((r) => ({ id: r.id, item: r.item, cm: r.cm }));
  return { rows, items: itemRows, matrix, problems: probs, method: method('FMECA, quantitative criticality', 'MIL-STD-1629A task 102 (Cm = β α λp t); IEC 60812',
    ['Needs real failure rates for every mode: the engine does not supply them.', 'Constant failure rate (exponential) over the time t.', 'Cm adds only within one severity class; it is not a probability of mission loss across classes.']) };
}

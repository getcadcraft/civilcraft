/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rows.js — what every app's check.js builds its rows from (0.8 REG.1 step 4, session `regs_PART_3`; rule 39: one shape for every app). No DOM.
 * BimCraft's add-on is canonical; `node tools/regs/sync.mjs --to …` copies it byte-identical.
 *
 *   judge(rule, found) → true | false | null          found against the rule's limits (null: not worked out)
 *   row(kind, where, rule, found, ref) → row          { kind, where, ref, id, label, clause, op, req, unit, found, ok }
 *   summary(rows) → { meets, fails, none }
 *   limitText(row, fmt, t) → "at most 200 mm"         fmt(value, unit) writes a number with its unit
 */
import { ruleBounds } from './regs.js';

export const EPS = { mm: 1e-6, pct: 1e-9, m2: 1e-9, r: 1e-6, u: 1e-9, ratio: 1e-9 };

export function judge(rule, found) {
  if (found === null || !Number.isFinite(found)) return null;
  const { min, max } = ruleBounds(rule), e = EPS[rule.unit] || 0;
  return (min === null || found >= min - e) && (max === null || found <= max + e);
}

export const row = (kind, where, rule, found, ref = '') => ({ kind, where, ref, id: rule.id, label: rule.label, clause: rule.clause, op: rule.op, req: rule.op === 'between' ? [rule.min, rule.max] : rule.value, unit: rule.unit, found, ok: judge(rule, found) });

export function summary(rows) {
  let meets = 0, fails = 0, none = 0;
  for (const r of rows) { if (r.ok === true) meets++; else if (r.ok === false) fails++; else none++; }
  return { meets, fails, none };
}

/** The text of a rule's limit, "at most 200 mm" — fmt(value, unit) writes a number with its unit. */
export function limitText(r, fmt, t) {
  if (r.op === 'between') return t('regs.op.between', { a: fmt(r.req[0], r.unit), b: fmt(r.req[1], r.unit) });
  return t(r.op === '<=' ? 'regs.op.max' : 'regs.op.min', { v: fmt(r.req, r.unit) });
}

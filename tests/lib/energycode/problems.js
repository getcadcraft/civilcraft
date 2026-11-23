/* SPDX-License-Identifier: Apache-2.0 */
/**
 * problems.js — the energy code check's failures as the shell's shared Problems (0.11 T24.9; docs/0.8-PROBLEMS-SPEC.md). Host-free.
 *
 *   energyProblems(res, t, rowText) → [problem]   one WARNING for each result row that does NOT meet its figure (ok === false). A row that could not be
 *     checked (ok === null) is not posted: the panel lists those, and a Problems list full of "say what is between the studs" would hide the real ones.
 *     id: stable and language-free (code + the wall type or window set the row is about); text: the row in words (the panel's own sentence).
 * A guide only: nothing here says a house complies, and an empty list is not a pass.
 */
export function energyProblems(res, t, rowText) {
  const out = [];
  for (const r of (res && res.rows) || []) {
    if (r.ok !== false) continue;
    out.push({
      code: 'energy.' + r.id, severity: 'warning', part: String((r.vars && r.vars.name) || ''),
      text: rowText(t, r),
      source: { name: 'energy-code' },
    });
  }
  return out;
}

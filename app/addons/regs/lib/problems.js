/* SPDX-License-Identifier: Apache-2.0 */
/**
 * problems.js — the regulation check as shared Problems (0.7.1 → 0.8, docs/0.8-PROBLEMS-SPEC.md § Regulations; the `regs` add-on). No DOM,
 * no imports: bin/test-problems.mjs runs it in Node. main.js hands the result to core BimCraft through the rules hook (provider.problems),
 * and core BimCraft to the shell's window.ccProblems as the source 'bimcraft.regs' (kind regulation).
 *
 *   regsProblems(rows, profile, { t, fmt }) → [problem]   check.js rows with ok === false (a rule the stair or room does not meet): code =
 *     the rule id, about = the stair or room by GlobalId, source.pack = { id, name, edition, clause, jurisdiction, from (the pack in the
 *     chain the rule came from: country → state → county → city), review }, req / found in the rule's unit; severity warning (it may be
 *     accepted with a reason: a relaxation the authority agreed; the panel labels it "Warning: failed regulation"). Rows that could not be
 *     worked out (ok === null, found null) are notes (owner 2026-10-26): the rule was not checked there.
 *   packRef(profile, versionOf) → { id, version (the Library version the drawing is pinned to / checked with, when the pack has one), name, edition, jurisdiction, review }   the pack the check report says it checked against (REG.1d)
 * Several ticked packs: main.js calls regsProblems once per profile; a combined 'strict' profile (regs.js strictest) gives each problem the
 * ticked pack its winning limit came from.
 * A guide only: the registered professional and the local authority decide (the check report says so).
 */
const jur = (j) => (j ? [j.country, j.state, j.county, j.city].filter(Boolean).join(' / ') || String(j.name || '') : '');

export function packRef(profile, versionOf = () => null) {
  if (!profile) return null;
  const v = versionOf(profile.id);
  return { id: profile.id, ...(v ? { version: String(v) } : {}), name: profile.name, edition: profile.edition || '', jurisdiction: jur(profile.jurisdiction || profile.chain?.[profile.chain.length - 1]?.jurisdiction), review: profile.review?.state || '' };
}

export function regsProblems(rows, profile, { t = (k) => k, fmt = (v, u) => String(v) + ' ' + u, versionOf = () => null } = {}) {
  if (!profile) return [];
  const out = [];
  for (const r of rows || []) {
    if (r.ok === true || !r.ref) continue;
    // A combined 'strict' profile names the ticked pack the winning limit came from, never itself.
    const from = profile.rules?.get?.(r.id)?.from;
    const pack = packRef(profile.parts ? (profile.parts.find((p) => p.chain.some((c) => c.id === from)) || profile.parts[0]) : profile, versionOf);
    const need = r.op === 'between' ? t('regs.op.between', { a: fmt(r.req[0], r.unit), b: fmt(r.req[1], r.unit) }) : t(r.op === '<=' ? 'regs.op.max' : 'regs.op.min', { v: fmt(r.req, r.unit) });
    const vars = { label: r.label, found: r.found === null ? '–' : fmt(r.found, r.unit), need };
    const rule = profile.rules?.get?.(r.id);
    const none = r.ok !== false;   // not worked out: a note that the rule was not checked here
    const nv = { label: r.label, where: r.where || '', need };
    out.push({
      code: r.id, severity: none ? 'note' : 'warning',
      msg: none ? { key: 'regs.p.none', vars: nv } : { key: 'regs.st.row', vars }, text: none ? t('regs.p.none', nv) : t('regs.st.row', vars),
      about: [{ kind: r.kind, id: r.ref, label: r.where }],
      source: { name: 'regs', pack: { ...pack, clause: r.clause || '', from: rule?.from || pack.id } },
      req: { op: r.op, value: r.req, unit: r.unit }, found: { value: r.found, unit: r.unit },
    });
  }
  return out;
}

/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: developer-facing result object; the host words every code through its own keys (frame.* in en.json) */
/**
 * frame-part.js — "Check this frame" for a part or weldment (0.11 SU.1811, session engineering-11): the one call a PartCraft command (or any host that holds straight
 * members) makes. Members in, a checked result out: build the frame (frame-members.js), solve it, check every member (frame-design.js) and every joint weld
 * (frame-weld.js), and return the numbers plus the tables for a report. DOM-free; the section table comes in as an argument like buildFrame's.
 * An aid until an engineer has reviewed it: `notReviewed` is always true and the host prints it beside the result.
 *
 *   checkThisFrame(input, shapes, { code = 'asce-aisc' | 'en', grade?, weldSize?, fexx?, na? })
 *     input = buildFrame's input (members [{ id, a, b, section, roll? }] in mm +Z up, supports, equipment, nodeLoads, selfWeight)
 *   → { ok, error?, code, build, sol, design, welds, summary, warnings, notReviewed: true }
 *     summary = { members, memberMax, memberFailed, memberNotChecked, welds, weldMax, weldFailed, weldNotChecked, worst: { kind, id, util } | null, pass }
 *     pass is true only when something was checked and nothing failed; items not checked are counted, never counted as passing.
 *   partTables(result, t) → report tables (design then weld) for frame-report.js / frame-pdf.js
 */
import { buildFrame, jointWelds } from './frame-members.js';
import { solveFrame } from './frame-solve.js';
import { checkFrame, designTables } from './frame-design.js';
import { checkWelds, weldTables } from './frame-weld.js';

export function checkThisFrame(input, shapes, opts = {}) {
  const code = opts.code === 'en' ? 'en' : 'asce-aisc';
  const build = buildFrame({ ...input, code }, shapes);
  if (!build.ok) return { ok: false, error: build.error, code, notReviewed: true };
  const sol = solveFrame(build.model);
  if (!sol.ok) return { ok: false, error: 'no-solution', code, build, warnings: build.warnings, notReviewed: true };
  const D = { code, ...(opts.grade ? { grade: opts.grade } : {}), ...(opts.na ? { na: opts.na } : {}) };
  const design = checkFrame(build.model, sol, D);
  const groups = jointWelds(build.model, { size: opts.weldSize ?? null });
  const welds = checkWelds(build.model, sol, groups, { code, ...(opts.grade ? { grade: opts.grade } : {}), ...(opts.na ? { na: opts.na } : {}), ...(opts.fexx ? { fexx: opts.fexx } : {}) });
  const m = design.ok ? design : null, w = welds.ok ? welds : null;
  const worst = [];
  if (m) for (const r of m.members) if (r.util != null) worst.push({ kind: 'member', id: r.id, util: r.util });
  if (w) for (const g of w.groups) if (g.util != null) worst.push({ kind: 'weld', id: g.id, util: g.util });
  worst.sort((a, b) => b.util - a.util);
  const summary = {
    members: m ? m.members.length : 0, memberMax: m ? m.max : null, memberFailed: m ? m.counts.failed : 0, memberNotChecked: m ? m.counts.notChecked : 0,
    welds: w ? w.groups.length : 0, weldMax: w ? w.max : null, weldFailed: w ? w.counts.failed : 0, weldNotChecked: w ? w.counts.notChecked : 0,
    worst: worst[0] || null,
  };
  summary.pass = worst.length > 0 && !summary.memberFailed && !summary.weldFailed;
  return { ok: !!(m || w), error: m || w ? undefined : design.error || welds.error, code, build, sol, design, welds, summary, warnings: build.warnings, notReviewed: true };
}

export function partTables(r, t) {
  const out = [];
  if (r.design?.ok) out.push(...designTables(r.design, t));
  if (r.welds?.ok) out.push(...weldTables(r.welds, t));
  return out;
}

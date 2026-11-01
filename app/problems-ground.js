/* SPDX-License-Identifier: Apache-2.0 */
/**
 * problems-ground.js — what the ground and platform steps found, as shared Problems (0.8 SU.911 / SU.914 rest, round 3 session civil_PART_3; shape: docs/0.8-PROBLEMS-SPEC.md § 1–2,
 * rule 29). These steps are tools, not checks; this is their words in the Problems panel. No DOM: bin/test-civilcraft-groundproblems.mjs runs it in Node; civilcraft.js registers it as the
 * source `civilcraft.ground`.
 *
 *   groundProblems(project, { t, units, spots }) → [problem]
 *     the existing ground's build report (errors; notes)        code ground.err / ground.note
 *     flat triangles fixed from contours (SU.911)                  ground.flatfix          note
 *     a ramp or sloped platform steeper than 1:12 (8.3 %)          platform.steep          note   (a common accessible-route limit: the person's code decides)
 *     the deepest cut or fill under the platforms over 10 ft / 3 m  platform.deep           note   (spots = platform.js spotLevels, when the cut and fill map is on)
 */
const RAMP = 1 / 12;

export function groundProblems(project, { t = (k) => k, units = 'ft', spots = [] } = {}) {
  const s = project.state, out = [];
  const eg = project.eg();
  for (const text of eg.report?.errors || []) out.push({ code: 'ground.err', part: 'err:' + text, severity: 'error', msg: { key: 'ground.prob.err', vars: { text } }, text: t('ground.prob.err', { text }), about: [] });
  for (const text of eg.report?.notes || []) out.push({ code: 'ground.note', part: 'note:' + text, severity: 'note', msg: { key: 'ground.prob.note', vars: { text } }, text: t('ground.prob.note', { text }), about: [] });
  if (s.surface?.flatFix > 0 && eg.surface) out.push({ code: 'ground.flatfix', part: 'flatfix', severity: 'note', msg: { key: 'ground.prob.flatfix', vars: { interval: s.surface.flatFix, u: units } }, text: t('ground.prob.flatfix', { interval: s.surface.flatFix, u: units }), about: [] });
  for (const p of s.pads || []) {
    const zs = (p.pts || []).map((q) => q.z).filter(Number.isFinite);
    if (zs.length < 3 || p.pts.length !== zs.length) continue;
    // a pad whose corners have their own levels is a ramp or a sloped platform: its grade is the rise over the run along the steepest direction
    let best = 0;
    for (let i = 0; i < p.pts.length; i++) for (let j = i + 1; j < p.pts.length; j++) { const d = Math.hypot(p.pts[j].x - p.pts[i].x, p.pts[j].y - p.pts[i].y); if (d > 1e-9) best = Math.max(best, Math.abs(p.pts[j].z - p.pts[i].z) / d); }
    if (best > RAMP + 1e-9) out.push({ code: 'platform.steep', part: 'steep:' + p.id, severity: 'note', msg: { key: 'ground.prob.steep', vars: { name: p.name || p.id, grade: (best * 100).toFixed(1) } }, text: t('ground.prob.steep', { name: p.name || p.id, grade: (best * 100).toFixed(1) }), about: [{ kind: 'pad', id: p.id, label: p.name || p.id }] });
  }
  const deep = units === 'm' ? 3 : 10;
  let worst = null;
  for (const sp of spots) if (!worst || Math.abs(sp.dz) > Math.abs(worst.dz)) worst = sp;
  if (worst && Math.abs(worst.dz) > deep) {
    const vars = { kind: t(worst.dz < 0 ? 'ground.cut' : 'ground.fill'), depth: Math.abs(worst.dz).toFixed(1), u: units, x: worst.x.toFixed(1), y: worst.y.toFixed(1) };
    out.push({ code: 'platform.deep', part: 'deep', severity: 'note', msg: { key: 'ground.prob.deep', vars }, text: t('ground.prob.deep', vars), about: [], where: { at: [worst.x, worst.y] } });
  }
  return out;
}

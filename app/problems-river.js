/* SPDX-License-Identifier: Apache-2.0 */
/**
 * problems-river.js — the river tool's warnings as shared Problems (0.8 SU.957 step 2; shape: docs/0.8-PROBLEMS-SPEC.md § 1–2).
 * No DOM: bin/test-civilcraft-river.mjs runs it in Node; civilcraft.js registers it as the source `civilcraft.river`.
 *
 *   riverProblems(rivers, { t, resultsOf, unit }) → [problem]
 *     rivers      project.state.rivers (models; cleaned here)
 *     resultsOf   (riverId) → river-solve.js solve() result | null   (river-ui.js keeps one per river, so nothing is solved twice)
 *     t           CivilCraft's t: the words are the river tool's own keys, sx.su957.issue.<code> and sx.su957.flag.<code>
 *   One problem per model issue (river.js check(): codes nomodel … ineffchannel), and one per profile and flag code (critical,
 *   walls, froude, kratio, noconv, jump) with the number of sections and the first one's station — about the river, placed at that
 *   section's cut line (`where`), severity error for noconv and the blocking issues, warning for the rest. Every result is a
 *   design aid that needs an engineer's review (the river tool says so on every output).
 */
import { cleanRiver, check } from './river.js';

const ERRORS = new Set(['nomodel', 'fewsections', 'noprofile', 'samers', 'banks', 'emptychannel', 'reach', 'nodown', 'noup']);
const r2 = (v) => String(Math.round(v * 100) / 100);

export function riverProblems(rivers, { t = (k) => k, resultsOf = () => null, unit = 'm' } = {}) {
  const out = [];
  for (const raw of rivers || []) {
    const r = cleanRiver(raw);
    if (!r) continue;
    const id = String(raw.id), about = [{ kind: 'river', id, label: raw.name || id }];
    const mid = (sid) => { const s = r.sections.find((x) => x.id === sid) || r.sections.find((x) => x.rs === sid); const l = s?.line; return l?.length >= 2 ? { space: '2d', at: [(l[0].x + l[l.length - 1].x) / 2, (l[0].y + l[l.length - 1].y) / 2] } : null; };
    for (const i of check(r)) {
      const vars = { rs: i.rs !== undefined ? r2(i.rs) : '', profile: i.profile || '' };
      const w = i.id ? mid(i.id) : null;
      out.push({ code: 'river.issue.' + i.code, part: i.code + ':' + (i.id || i.profile || ''), severity: ERRORS.has(i.code) ? 'error' : 'warning', msg: { key: 'sx.su957.issue.' + i.code, vars }, text: t('sx.su957.issue.' + i.code, vars), about, source: { name: 'civilcraft.river' }, ...(w ? { where: w } : {}) });
    }
    const res = resultsOf(id);
    for (const p of res?.profiles || []) {
      const by = new Map();
      for (const row of p.rows) for (const f of row.flags || []) { if (!by.has(f)) by.set(f, []); by.get(f).push(row); }
      for (const [f, rows] of by) {
        const first = rows[0], n = rows.length;
        const text = p.name + ': ' + t('sx.su957.flag.' + f, { n }) + ' ' + t('sx.su957.prob.first', { rs: r2(first.rs), unit });
        const w = mid(first.id);
        out.push({ code: 'river.flag.' + f, part: 'pf:' + p.name + ':' + f, severity: f === 'noconv' ? 'error' : 'warning', msg: { key: 'sx.su957.flag.' + f, vars: { n } }, text, about, source: { name: 'civilcraft.river' }, ...(w ? { where: w } : {}) });
      }
      // culverts and bridges (0.8 SU.957 rest): water over the road or deck, a drowned entrance, a choked opening, fast flow in a barrel
      for (const st of p.structures || []) {
        for (const f of st.flags || []) {
          const vars = { name: st.id, rs: r2(st.rs), q: r2(st.q) };
          const sec = r.sections.filter((x) => x.rs > st.rs).sort((a, b) => a.rs - b.rs)[0];
          const w = sec ? mid(sec.id) : null;
          out.push({ code: 'river.struct.' + f, part: 'st:' + p.name + ':' + st.id + ':' + f, severity: f === 'noconv' ? 'error' : 'warning', msg: { key: 'river.st.prob.' + f, vars }, text: p.name + ': ' + t('river.st.prob.' + f, vars), about, source: { name: 'civilcraft.river' }, ...(w ? { where: w } : {}) });
        }
      }
    }
  }
  return out;
}

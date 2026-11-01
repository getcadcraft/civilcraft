/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-breakit.js — Break it for a frame (0.8 round 3, EG.31). DOM-free. Runs the frame's own solver (frame-solve.js) and member checks
 * (frame-design.js) over its strength combinations and reports what gives way first, using study/breakit.js (copied beside this folder's
 * users; an app passes it in as `B` so this file imports nothing from outside lib/frame).
 *
 *   breakFrame(model, design, { B, connections, cancelled, onProgress }) → Promise<{ ok, error?, findings, combo, members, reserve, connections, highlight }>
 *     model     a frame model with its combinations (frame-combos.js generateCombos makes them from the cases and the design code)
 *     design    the project's design settings (frame-design.js cleanDesign); without a code there is nothing to break (error 'no-code')
 *     B         study/breakit.js (reserve, rank, findingProblems)
 *     connections  [{ id, label?, ends: [{ member, end: 'i' | 'j' }], shear (N, the design shear resistance of the joint), axial? (N) }]
 *               supplied by the app (DetailCraft: bolts × boltShearKN). Only what the app can state is checked; a joint with no resistance is
 *               left out and said in `notChecked`. Shear is the resultant of Vy and Vz at the member end; the axial force is checked against
 *               `axial` when given. Nothing else about a connection (bearing, block shear, welds, prying) is checked.
 *
 * What it finds, in order:
 *   1. the governing combination: the strength combination with the highest member utilisation (checkFrame's per-set utilisation);
 *   2. the weakest member: its utilisation, the check and clause that governs it, and where along it (mm from the i end);
 *   3. the load factor on the governing combination at which the first member reaches utilisation 1 (reserve: the real solver, bisected);
 *   4. the weakest connection from the member end forces of every strength combination;
 *   5. every member over 1 as its own finding (the others are not listed, the weakest always is).
 */
import { solveFrame } from './frame-solve.js';
import { checkFrame } from './frame-design.js';

const comboScaled = (model, comboId, lam) => ({
  ...model,
  combos: model.combos.filter((c) => c.id === comboId).map((c) => ({ ...c, factors: c.factors.map((x) => ({ ...x, f: x.f * lam })) })),
});

export async function breakFrame(model, design, { B, connections = [], cancelled = () => false, onProgress = () => {} } = {}) {
  if (!B) throw new Error('breakFrame needs study/breakit.js as B.');   // i18n-ignore: a programming error
  const sol = solveFrame(model);
  if (!sol.ok) return { ok: false, error: 'no-solution', detail: sol.error };
  const chk = checkFrame(model, sol, design);
  if (!chk.ok) return { ok: false, error: chk.error };
  const findings = [];

  // 1. the combinations, by the highest utilisation any member reaches in each
  const byCombo = new Map();
  for (const m of chk.members) for (const s of m.sets) {
    const c = byCombo.get(s.set) || { id: s.set, name: s.name, clause: s.clause, util: 0, member: null };
    if (s.util > c.util) { c.util = s.util; c.member = m.id; c.check = (s.checks.reduce((a, b) => (b.ratio > a.ratio ? b : a), { ratio: -1 })); }
    byCombo.set(s.set, c);
  }
  const combos = [...byCombo.values()].sort((a, b) => b.util - a.util);
  const gov = combos[0] || null;
  if (gov) findings.push({ id: 'combo:' + gov.id, kind: 'combo', subject: { kind: 'combo', id: gov.id, label: gov.name }, util: gov.util, factor: null, failing: gov.util > 1,
    what: { member: gov.member, check: gov.check && gov.check.id, n: combos.length }, clause: gov.clause });

  // 2. members: the weakest always, every one over 1
  const checked = chk.members.filter((m) => m.util !== null).sort((a, b) => b.util - a.util);
  checked.forEach((m, i) => {
    if (i > 0 && m.util <= 1) return;
    findings.push({ id: 'member:' + m.id, kind: 'member', subject: { kind: 'member', id: m.id, label: m.ref || m.id }, util: m.util, factor: m.util > 0 ? 1 / m.util : null, failing: m.util > 1,
      what: { section: m.section, set: m.set, check: m.check && m.check.id, at: m.check && Number.isFinite(m.check.x) ? Math.round(m.check.x) : null },
      clause: m.check && m.check.clause, where: undefined });
  });

  // 3. the reserve on the governing combination: scale it until the first member reaches 1
  let reserve = null;
  if (gov) {
    let n = 0;
    reserve = await B.reserve(async (lam) => {
      onProgress(++n);
      const m2 = comboScaled(model, gov.id, lam), s2 = solveFrame(m2, { sets: [{ id: gov.id, kind: 'combo' }] });
      if (!s2.ok) return Infinity;
      const c2 = checkFrame(m2, s2, design);
      return c2.ok ? c2.max : Infinity;
    }, { cancelled, max: 16 });
    if (reserve.factor !== null || reserve.bounded === false) {
      findings.push({ id: 'reserve:' + gov.id, kind: 'combo', subject: { kind: 'combo', id: gov.id, label: gov.name }, util: null, factor: reserve.factor,
        failing: reserve.factor !== null && reserve.factor < 1, what: { n: reserve.evals, atLeast: reserve.atLeast ?? null } });
    }
  }

  // 4. connections: member end forces of every strength combination against the resistance the app states
  const notChecked = [];
  const conn = [];
  const strength = model.combos.filter((c) => c.limit === 'strength' && sol.results['combo:' + c.id]);
  const idx = new Map(model.members.map((m, k) => [m.id, k]));
  for (const c of connections) {
    if (!(c.shear > 0)) { notChecked.push(c.id); continue; }
    let worst = { util: 0, set: null, V: 0, N: 0 };
    for (const cb of strength) {
      const R = sol.results['combo:' + cb.id];
      for (const e of c.ends) {
        const k = idx.get(e.member);
        if (k === undefined) continue;
        const o = 12 * k + (e.end === 'j' ? 6 : 0);
        const V = Math.hypot(R.ends[o + 1], R.ends[o + 2]), N = Math.abs(R.ends[o]);
        const u = Math.max(V / c.shear, c.axial > 0 ? N / c.axial : 0);
        if (u > worst.util) worst = { util: u, set: cb.id, V, N };
      }
    }
    conn.push({ id: c.id, label: c.label || c.id, ...worst, shear: c.shear });
  }
  conn.sort((a, b) => b.util - a.util);
  conn.forEach((c, i) => {
    if (i > 0 && c.util <= 1) return;
    findings.push({ id: 'connection:' + c.id, kind: 'connection', subject: { kind: 'connection', id: c.id, label: c.label }, util: c.util, factor: c.util > 0 ? 1 / c.util : null, failing: c.util > 1,
      what: { set: c.set, shearKN: Math.round(c.V / 10) / 100, resistKN: Math.round(c.shear / 10) / 100 }, req: { op: '<=', value: Math.round(c.shear), unit: 'N' }, found: { value: Math.round(c.V), unit: 'N' } });
  });

  const ranked = B.rank(findings);
  const highlight = [
    ...checked.filter((m) => m.util > 1).map((m) => ({ kind: 'member', id: m.id, level: 'fail' })),
    ...(checked[0] && checked[0].util <= 1 ? [{ kind: 'member', id: checked[0].id, level: 'weakest' }] : []),
    ...conn.filter((c) => c.util > 1).map((c) => ({ kind: 'connection', id: c.id, level: 'fail' })),
    ...(conn[0] && conn[0].util <= 1 ? [{ kind: 'connection', id: conn[0].id, level: 'weakest' }] : []),
  ];
  return { ok: true, code: chk.code, edition: chk.edition, findings: ranked, combo: gov, combos, members: checked, reserve, connections: conn, notChecked, highlight };
}

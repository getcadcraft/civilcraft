/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-report.js — what a frame analysis found, as tables (0.6 LC.4): the page shows them, the report downloads them as
 * CSV and as a PDF (frame-pdf.js). DOM-free; imports frame-solve.js. Words come from the app: every function takes `t`
 * (the app's t(), keys frame.rep.*), so the report reads in the app's language.
 *
 * Units in tables: kN, kN·m, mm, mrad (the model itself is in N, mm). An analysis aid, not a code check: the report says
 * so first, and says which assumptions the model was built on (the app passes them as `notes`).
 *
 *   reportData(model, sol, { n }) → { sets: [{ key, name, kind, reactions, sum, members, maxDisp }], envelope, counts }
 *     members: [{ id, ref, L, section, ext (memberExtremes) }]; envelope: per member the largest |action| over every set
 *   reportTables(data, t, { notes }) → [{ title, head, rows, numeric: [column indexes], note? }]
 *   reportCsv(tables) → CSV text (CRLF; cells that start = + - @ get a leading ')
 *   KN, KNM: number formatters (kN from N, kN·m from N·mm)
 */
import { memberExtremes } from './frame-solve.js';

export const KN = (v) => fmt(v / 1000, 2);
export const KNM = (v) => fmt(v / 1e6, 2);
const MM = (v) => fmt(v, 2);
const MRAD = (v) => fmt(v * 1000, 3);
function fmt(v, d) {
  if (!Number.isFinite(v)) return '';
  const s = (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d);
  return s === '-0' || /^-0\.0*$/.test(s) ? s.slice(1) : s;
}
const signedMax = (e) => (Math.abs(e.max) >= Math.abs(e.min) ? e.max : e.min);

export function reportData(model, sol, { n = 40 } = {}) {
  const prep = sol.prep;
  const secs = new Map(model.sections.map((s) => [s.id, s]));
  const sets = [];
  for (const [key, R] of Object.entries(sol.results)) {
    const reactions = [];
    model.supports.forEach((s) => {
      const k = prep.idx.get(s.node);
      reactions.push({ node: s.node, R: Array.from(R.reactions.subarray(6 * k, 6 * k + 6)) });
    });
    let maxDisp = { value: 0, node: null };
    model.nodes.forEach((nd, k) => {
      const d = Math.hypot(R.u[6 * k], R.u[6 * k + 1], R.u[6 * k + 2]);
      if (d > maxDisp.value) maxDisp = { value: d, node: nd.id };
    });
    const members = model.members.map((m, k) => ({ id: m.id, ref: m.from?.ref || '', L: prep.mem[k].ax.L, section: secs.get(m.section)?.name || m.section, ext: memberExtremes(prep, R, k, n) }));
    sets.push({ key, name: R.name, kind: R.kind, R, reactions, sum: { applied: R.applied, reacted: R.reacted }, members, maxDisp });
  }
  // envelope: for each member and action the largest magnitude over every set, with its sign and the set it came from
  const envelope = model.members.map((m, k) => {
    const row = { id: m.id, ref: m.from?.ref || '' };
    for (const a of ['N', 'Vy', 'Vz', 'T', 'My', 'Mz']) {
      let best = { v: 0, set: '' };
      for (const s of sets) { const v = signedMax(s.members[k].ext[a]); if (Math.abs(v) > Math.abs(best.v)) best = { v, set: s.name }; }
      row[a] = best;
    }
    let d = { v: 0, set: '', ratio: Infinity };
    for (const s of sets) { const e = s.members[k].ext.defl; if (e.value > d.v) d = { v: e.value, set: s.name, ratio: e.ratio }; }
    row.defl = d;
    return row;
  });
  return { sets, envelope, counts: { nodes: model.nodes.length, members: model.members.length, supports: model.supports.length, cases: model.cases.length, combos: model.combos.length, dofs: sol.dofs }, warnings: sol.warnings || [] };
}

export function reportTables(data, t, { notes = [], model = null } = {}) {
  const T = [];
  const ratio = (r) => (Number.isFinite(r) && r < 1e7 ? 'L/' + Math.round(r) : '');
  T.push({ title: t('frame.rep.about'), head: [t('frame.rep.item'), t('frame.rep.value')], numeric: [], rows: [
    [t('frame.rep.not-a-check'), ''],
    [t('frame.rep.method'), t('frame.rep.method-text')],
    [t('frame.rep.units'), t('frame.rep.units-text')],
    [t('frame.rep.signs'), t('frame.rep.signs-text')],
    [t('frame.rep.size'), t('frame.rep.size-text', data.counts)],
    ...notes.map((s) => [t('frame.rep.assumed'), s]),
    ...data.warnings.map((w) => [t('frame.rep.warning'), t('frame.warn.' + w.code, { node: w.node ?? '', dof: w.dof !== undefined ? t('frame.dof.' + w.dof) : '', id: w.id ?? '' })]),
  ] });
  /* i18n-ignore-start: column heads below are symbols and units (A, Iy, Fx, kN, mm…), the same in every language */
  if (model) {
    const used = new Map();
    for (const m of model.members) used.set(m.section, (used.get(m.section) || 0) + 1);
    T.push({ title: t('frame.rep.sections'), head: [t('frame.rep.section'), 'A (cm²)', 'Iy (cm⁴)', 'Iz (cm⁴)', 'J (cm⁴)', t('frame.rep.members')], numeric: [1, 2, 3, 4, 5],
      rows: model.sections.map((s) => [s.name, fmt(s.A / 100, 2), fmt(s.Iy / 1e4, 1), fmt(s.Iz / 1e4, 1), fmt(s.J / 1e4, 2), String(used.get(s.id) || 0)]) });
    T.push({ title: t('frame.rep.cases'), head: [t('frame.rep.case'), t('frame.rep.kind'), t('frame.rep.self'), t('frame.rep.loads')], numeric: [2, 3],
      rows: model.cases.map((c) => [c.name, t('frame.kind.' + c.kind), c.selfWeight ? String(c.selfWeight) : '', String(c.loads.length)]) });
    if (model.combos.length) T.push({ title: t('frame.rep.combos'), head: [t('frame.rep.combo'), t('frame.rep.factors')], numeric: [],
      rows: model.combos.map((c) => [c.name, c.factors.map((f) => fmt(f.f, 2) + ' × ' + (model.cases.find((x) => x.id === f.case)?.name || f.case)).join(' + ')]) });
  }
  for (const s of data.sets) {
    const sum = [0, 1, 2].map((k) => s.sum.reacted[k]), app = [0, 1, 2].map((k) => s.sum.applied[k]);
    T.push({ title: t('frame.rep.reactions', { set: s.name }), head: [t('frame.rep.node'), 'Fx (kN)', 'Fy (kN)', 'Fz (kN)', 'Mx (kN·m)', 'My (kN·m)', 'Mz (kN·m)'], numeric: [1, 2, 3, 4, 5, 6],
      rows: [...s.reactions.map((r) => [r.node, KN(r.R[0]), KN(r.R[1]), KN(r.R[2]), KNM(r.R[3]), KNM(r.R[4]), KNM(r.R[5])]),
        [t('frame.rep.sum-reactions'), KN(sum[0]), KN(sum[1]), KN(sum[2]), '', '', ''],
        [t('frame.rep.sum-loads'), KN(app[0]), KN(app[1]), KN(app[2]), '', '', '']] });
    T.push({ title: t('frame.rep.forces', { set: s.name }), head: [t('frame.rep.member'), t('frame.rep.part'), t('frame.rep.section'), 'L (mm)', 'N (kN)', 'Vy (kN)', 'Vz (kN)', 'T (kN·m)', 'My (kN·m)', 'Mz (kN·m)', t('frame.rep.defl'), ''], numeric: [3, 4, 5, 6, 7, 8, 9, 10],
      rows: s.members.map((m) => [m.id, m.ref, m.section, fmt(m.L, 0), KN(signedMax(m.ext.N)), KN(signedMax(m.ext.Vy)), KN(signedMax(m.ext.Vz)), KNM(signedMax(m.ext.T)), KNM(signedMax(m.ext.My)), KNM(signedMax(m.ext.Mz)), MM(m.ext.defl.value), ratio(m.ext.defl.ratio)]) });
    T.push({ title: t('frame.rep.disp', { set: s.name }), head: [t('frame.rep.node'), 'ux (mm)', 'uy (mm)', 'uz (mm)', 'rx (mrad)', 'ry (mrad)', 'rz (mrad)'], numeric: [1, 2, 3, 4, 5, 6],
      rows: Array.from({ length: data.counts.nodes }, (_, k) => k).map((k) => {
        const u = s.R.u.subarray(6 * k, 6 * k + 6);
        return [model ? model.nodes[k].id : String(k + 1), MM(u[0]), MM(u[1]), MM(u[2]), MRAD(u[3]), MRAD(u[4]), MRAD(u[5])];
      }) });
  }
  if (data.sets.length > 1) T.push({ title: t('frame.rep.envelope'), head: [t('frame.rep.member'), t('frame.rep.part'), 'N (kN)', 'Vy (kN)', 'Vz (kN)', 'T (kN·m)', 'My (kN·m)', 'Mz (kN·m)', t('frame.rep.defl'), ''], numeric: [2, 3, 4, 5, 6, 7, 8],
    rows: data.envelope.map((r) => [r.id, r.ref, KN(r.N.v), KN(r.Vy.v), KN(r.Vz.v), KNM(r.T.v), KNM(r.My.v), KNM(r.Mz.v), MM(r.defl.v), ratio(r.defl.ratio)]) });
  /* i18n-ignore-end */
  return T;
}

const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s) && !/^-?\d/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
export function reportCsv(tables) {
  return tables.map((tb) => [[tb.title], tb.head, ...tb.rows].map((r) => r.map(csvCell).join(',')).join('\r\n')).join('\r\n\r\n') + '\r\n';
}

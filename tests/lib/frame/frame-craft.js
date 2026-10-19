/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-craft.js — an analytical frame model (frame-model.js) as plain matrices for craftlib/frame3d.craft (0.6 LC.4), and
 * as a whole CraftScript file that runs every load case and combination through frame3d — so the analysis can be read,
 * re-run and changed in PartCraft's Script workspace or `node tools/partcraft-cli/partcraft.mjs run file.craft`.
 * DOM-free; imports only frame-model.js.
 *
 *   frameArrays(model) → { nodes, members, props, fixed, releases, springs, cases: [{ id, name, nodeLoads, memberLoads }],
 *                          combos: [{ id, name, factors (one per case, in case order) }] } — row arrays (JS), 1-based
 *                          node and member numbers, memberLoads rows [member dir kind w1 w2 a b] (dir 1–3 local x y z,
 *                          4–6 global X Y Z; kind 1 distributed, 2 point; b = 0 = to the end), self weight as a
 *                          distributed load along −Z
 *   toCraftScript(model, { title, note }) → the .craft text (title and note are the app's own words, one line each)
 */
import { G_ACC } from './frame-model.js';

const DIRS = { x: 1, y: 2, z: 3, X: 4, Y: 5, Z: 6 };

export function frameArrays(model) {
  const nIdx = new Map(model.nodes.map((n, k) => [n.id, k + 1]));
  const mIdx = new Map(model.members.map((m, k) => [m.id, k + 1]));
  const secs = new Map(model.sections.map((s) => [s.id, s])), mats = new Map(model.materials.map((m) => [m.id, m]));
  const nodes = model.nodes.map((n) => [n.x, n.y, n.z]);
  const members = model.members.map((m) => [nIdx.get(m.i), nIdx.get(m.j)]);
  const props = model.members.map((m) => { const s = secs.get(m.section), t = mats.get(m.material); return [t.E, t.G, s.A, s.Iy, s.Iz, s.J, m.roll || 0]; });
  const releases = model.members.map((m) => [...m.rel.i, ...m.rel.j].map((b) => (b ? 1 : 0)));
  const fixed = model.nodes.map(() => [0, 0, 0, 0, 0, 0]), springs = model.nodes.map(() => [0, 0, 0, 0, 0, 0]);
  for (const s of model.supports) { const k = nIdx.get(s.node) - 1; fixed[k] = s.fix.map((b) => (b ? 1 : 0)); if (s.k) springs[k] = s.k.map((v, d) => (s.fix[d] ? 0 : v)); }
  const cases = model.cases.map((c) => {
    const nodeLoads = model.nodes.map(() => [0, 0, 0, 0, 0, 0]);
    const memberLoads = [];
    if (c.selfWeight) model.members.forEach((m, k) => {
      const w = -c.selfWeight * mats.get(m.material).rho * 1e-9 * secs.get(m.section).A * G_ACC;
      if (w) memberLoads.push([k + 1, 6, 1, w, w, 0, 0]);
    });
    for (const l of c.loads) {
      if (l.type === 'node') { const k = nIdx.get(l.node) - 1; nodeLoads[k] = nodeLoads[k].map((v, d) => v + l.F[d]); continue; }
      const e = mIdx.get(l.member);
      if (l.type === 'point') memberLoads.push([e, DIRS[l.dir], 2, l.P, 0, l.a, 0]);
      else memberLoads.push([e, DIRS[l.dir], 1, l.w, l.w2 ?? l.w, l.a ?? 0, l.b ?? 0]);
    }
    return { id: c.id, name: c.name, nodeLoads, memberLoads };
  });
  const combos = model.combos.map((cb) => ({ id: cb.id, name: cb.name, factors: model.cases.map((c) => cb.factors.filter((f) => f.case === c.id).reduce((s, f) => s + f.f, 0)) }));
  return { nodes, members, props, fixed, releases, springs, cases, combos };
}

const num = (v) => { if (!Number.isFinite(v)) return '0'; const s = String(Number(v.toPrecision(15))); return s === '-0' ? '0' : s; };
const mat = (rows, cols) => (rows.length ? '[' + rows.map((r) => r.map(num).join(' ')).join('; ...\n  ') + ']' : `zeros(0, ${cols})`);
const str = (s) => "'" + String(s).replace(/[\r\n]+/g, ' ').replace(/'/g, "''") + "'";

export function toCraftScript(model, { title = '', note = '' } = {}) {
  /* i18n-ignore-start: CraftScript code written into the file */
  const a = frameArrays(model);
  const L = [];
  if (title) L.push('% ' + String(title).replace(/[\r\n]+/g, ' '));
  if (note) L.push('% ' + String(note).replace(/[\r\n]+/g, ' '));
  L.push('clear fr cases combos res', 'fr = struct();');
  L.push('fr.nodes = ' + mat(a.nodes, 3) + ';');
  L.push('fr.members = ' + mat(a.members, 2) + ';');
  L.push('fr.props = ' + mat(a.props, 7) + ';');
  L.push('fr.fixed = logical(' + mat(a.fixed, 6) + ');');
  L.push('fr.releases = logical(' + mat(a.releases, 12) + ');');
  if (a.springs.some((r) => r.some((v) => v))) L.push('fr.springs = ' + mat(a.springs, 6) + ';');
  L.push('cases = cell(1, ' + a.cases.length + ');');
  a.cases.forEach((c, k) => {
    const nl = c.nodeLoads.map((r, i) => (r.some((v) => v) ? [i + 1, ...r] : null)).filter(Boolean);
    L.push(`nl = ${mat(nl, 7)};`, `NL = zeros(${a.nodes.length}, 6);`, 'if ~isempty(nl)', '  NL(nl(:, 1), :) = nl(:, 2:7);', 'end');
    L.push(`cases{${k + 1}} = struct('name', ${str(c.name)}, 'nodeLoads', NL, 'memberLoads', ${mat(c.memberLoads, 7)});`);
  });
  L.push('res = cell(1, numel(cases));', 'for k = 1:numel(cases)', '  fr.nodeLoads = cases{k}.nodeLoads; fr.memberLoads = cases{k}.memberLoads;',
    "  fprintf('%s\\n', cases{k}.name);", '  res{k} = frame3d(fr);', 'end');
  if (a.combos.length) {
    L.push('combos = cell(1, ' + a.combos.length + ');');
    a.combos.forEach((cb, k) => L.push(`combos{${k + 1}} = struct('name', ${str(cb.name)}, 'factors', [${cb.factors.map(num).join(' ')}]);`));
    L.push('comb = cell(1, numel(combos));', 'for c = 1:numel(combos)',
      '  U = 0; R = 0; F = 0;', '  for k = 1:numel(cases)', '    f = combos{c}.factors(k);',
      '    U = U + f * res{k}.U; R = R + f * res{k}.R; F = F + f * res{k}.F;', '  end',
      "  comb{c} = struct('name', combos{c}.name, 'U', U, 'R', R, 'F', F);",
      "  fprintf('%s: max displacement %.4g\\n', combos{c}.name, max(sqrt(sum(U(:, 1:3) .^ 2, 2))));", 'end');
  }
  /* i18n-ignore-end */
  return L.join('\n') + '\n';
}

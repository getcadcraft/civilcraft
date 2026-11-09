/* SPDX-License-Identifier: Apache-2.0 */
/**
 * setdesign.js — design every distinct truss of a laid-out roof, in the order the loads travel, and say what could not be made (DOM-free; pure).
 *   designSet(layout, opts) → Map(key → design)   jack trusses first; a girder then takes their end reactions as point loads, case by case
 *   setProblems(layout, designs, spec) → [problem]   the label first, then each distinct design's findings (prefixed with what it is), the layout's own issues
 *   setTotals(layout, designs) → { trusses, designs, members, timber (m by size) }
 */
import { designTruss } from './design.js';
import { trussProblems, layoutProblems, sourceName } from './problems.js';
import { mouthGirder, valleyOnMain } from './mouth.js';

const CASES = ['D', 'S', 'W', 'U'];
export const KIND_NAME = { common: 'Common truss', stepdown: 'Step-down truss', girder: 'Girder truss', jack: 'Jack truss', corner: 'Corner jack truss', valley: 'Valley truss', profile: 'Section truss', mouth: 'Wing-mouth truss' };

export function designSet(L, opts = {}) {
  const out = new Map(), reqs = [...L.designs.values()].sort((a, b) => (a.pointFrom && a.pointFrom.length ? 1 : 0) - (b.pointFrom && b.pointFrom.length ? 1 : 0));
  for (const r of reqs) {
    const spec = { ...r.spec };
    const pl = new Map();
    for (const pf of r.pointFrom || []) {
      const jd = out.get(pf.key);
      if (!jd || !jd.ok || jd.res.status !== 'ok') continue;
      const k = String(Math.round(pf.x)), cur = pl.get(k) || { x: pf.x };
      for (const c of CASES) cur[c] = (cur[c] || 0) + (jd.caseRes[c].reactions ? jd.caseRes[c].reactions.right[1] : 0);   // the jack's high-end reaction pushes down on the girder
      pl.set(k, cur);
    }
    if (r.extraX && r.extraX.length) spec.extra = r.extraX;
    const d = designTruss(spec, { ...opts, spacing: r.trib || opts.spacing || 600, pointLoads: [...pl.values()] });
    d.req = r; d.kind = r.kind; d.pointLoads = [...pl.values()];
    out.set(r.key, d);
  }
  return out;
}

const describe = (L, key) => { const g = L.groups.find((x) => x.key === key); return g ? { n: g.ids.length, span: g.span, kind: g.kind, ids: g.ids } : { n: 1, span: 0, kind: 'common', ids: [] }; };

/** The mouth girder's forces and the valley trusses' reactions on the main trusses, in words (DC.116). Forces only: nothing here sizes the girder. */
export function mouthProblems(L, designs) {
  const out = [], P = (code, severity, text, part) => ({ code, severity, part, msg: { key: 'truss.' + code }, text, source: { name: sourceName() } });
  const g = mouthGirder(L, designs);
  if (g) {
    if (!g.ok) out.push(P('mouthgirder', 'warning', `Mouth girder: ${g.failed.join(', ')} could not be designed, so their reactions are missing from the girder's loads.`, 'valley'));
    const gv = g.governing;
    out.push(P('mouthgirder', 'note', `Mouth girder (a girder truss or a bearing wall along the wing's mouth), span ${Math.round(g.span)} mm, carrying ${g.loads.length} main truss end${g.loads.length === 1 ? '' : 's'}: governing combination "${gv.name}" gives M ${gv.M} kN·m, V ${gv.V} kN, bearing reactions ${gv.RA} kN and ${gv.RB} kN (D ${g.cases.D.RA} / ${g.cases.D.RB}, S ${g.cases.S.RA} / ${g.cases.S.RB} kN). Forces only: its size, its bearings and the walls or trusses under them are for the truss designer.`, 'valley'));
  }
  const v = valleyOnMain(L, designs);
  if (v.length) {
    const top = v.reduce((b, o) => (o.D + o.S > b.D + b.S ? o : b), v[0]);
    out.push(P('valleyload', 'note', `Valley trusses on the main roof: ${v.length} main truss${v.length === 1 ? '' : 'es'} take their end reactions as extra point loads on the top chord (largest on ${top.id}: D ${top.D} kN, S ${top.S} kN about ${top.x} mm from its start). They are listed, not added to those trusses' designs: check each main truss for them.`, 'valley'));
  }
  return out;
}

export function setProblems(L, designs, spec = {}) {
  const out = [];
  let first = null, last = null;
  for (const [key, d] of designs) {
    const info = describe(L, key), name = (KIND_NAME[d.kind] || 'Truss') + (info.span ? ` ${info.span} mm` : '') + (info.n > 1 ? ` (${info.n})` : '') + (info.ids.length === 1 ? ' ' + info.ids[0] : '');
    if (!d.ok) {
      out.push({ code: 'failed', severity: 'error', part: key, msg: { key: 'truss.failed', vars: { name, error: d.error } }, text: `${name} could not be generated (${d.error}). It is not in the cut list or the model: the truss designer must provide it.`, about: info.ids, source: { name: sourceName() } });
      continue;
    }
    const list = trussProblems(d, spec);
    if (!first) first = list[0];
    last = list[list.length - 1];
    for (const p of list.slice(1, -1)) out.push({ ...p, text: `${name}: ${p.text}`, part: `${info.ids[0] || ''} ${p.part}`.trim(), about: info.ids });
  }
  const lay = [...layoutProblems(L), ...mouthProblems(L, designs)];
  const head = first || trussProblems({ ok: false }, spec)[0];
  const res = [head, ...lay, ...out];
  if (last && last.code === 'defaults') res.push(last);
  else res.push(trussProblems({ ok: true, g: { type: '', span: 0 }, res: { status: 'ok' }, rows: [], heel: {}, cut: [], opts: {}, comboDefs: [] }, spec).slice(-1)[0]);
  return res;
}

export function setTotals(L, designs) {
  const timber = {};
  let members = 0, trusses = 0;
  for (const t of L.trusses) {
    const d = designs.get(t.key);
    if (!d || !d.ok) continue;
    trusses++;
    for (const c of d.cut) { members++; timber[c.size] = (timber[c.size] || 0) + c.cutLen / 1000; }
  }
  return { trusses, designs: designs.size, members, timber: Object.fromEntries(Object.entries(timber).map(([k, v]) => [k, Math.round(v * 10) / 10])) };
}

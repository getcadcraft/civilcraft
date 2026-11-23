/* SPDX-License-Identifier: Apache-2.0 */
/**
 * setdesign.js — design every distinct truss of a laid-out roof, in the order the loads travel, and say what could not be made (DOM-free; pure).
 *   designSet(layout, opts) → Map(key → design)   jack trusses first; a girder then takes their end reactions as point loads, case by case;
 *                                                  then each main truss a valley set stands on is designed again with the valley ends'
 *                                                  reactions as point loads (its own design key: the layout's truss keys and groups are updated)
 *   setProblems(layout, designs, spec) → [problem]   the label first, then each distinct design's findings (prefixed with what it is), the layout's own issues
 *   setTotals(layout, designs) → { trusses, designs, members, timber (m by size) }
 */
import { designTruss } from './design.js';
import { trussProblems, layoutProblems, sourceName } from './problems.js';
import { mouthGirder, valleyOnMain, valleyPointLoads, sizeGirder } from './mouth.js';

const CASES = ['D', 'S', 'W', 'U'];
export const KIND_NAME = { common: 'Common truss', stepdown: 'Step-down truss', girder: 'Girder truss', jack: 'Jack truss', corner: 'Corner jack truss', valley: 'Valley truss', profile: 'Section truss', mouth: 'Wing-mouth truss' };

const D2R = Math.PI / 180;
const regroup = (L) => {
  const groups = [];
  for (const t of L.trusses) { const g = groups.find((x) => x.key === t.key); if (g) g.ids.push(t.id); else groups.push({ key: t.key, kind: t.kind, span: t.span, ids: [t.id] }); }
  groups.sort((a, b) => b.ids.length - a.ids.length);
  L.groups = groups;
};

function designOne(r, out, opts) {
  const spec = { ...r.spec };
  const pl = new Map();
  for (const pf of r.pointFrom || []) {
    const jd = out.get(pf.key);
    if (!jd || !jd.ok || jd.res.status !== 'ok') continue;
    const k = String(Math.round(pf.x)), cur = pl.get(k) || { x: pf.x };
    for (const c of CASES) cur[c] = (cur[c] || 0) + (jd.caseRes[c].reactions ? jd.caseRes[c].reactions.right[1] : 0);   // the jack's high-end reaction pushes down on the girder
    pl.set(k, cur);
  }
  for (const p of r.pointAdd || []) {   // fixed point loads (the valley trusses' reactions on a main truss)
    const k = String(Math.round(p.x)), cur = pl.get(k) || { x: p.x };
    for (const c of CASES) cur[c] = (cur[c] || 0) + (Number(p[c]) || 0);
    pl.set(k, cur);
  }
  if (r.extraX && r.extraX.length) spec.extra = r.extraX;
  const d = designTruss(spec, { ...opts, spacing: r.trib || opts.spacing || 600, pointLoads: [...pl.values()] });
  d.req = r; d.kind = r.kind; d.pointLoads = [...pl.values()];
  if (d.ok && d.g) {   // a point load with no top-chord joint within 80 mm is not applied by designTruss: say so instead of dropping it silently
    const tops = [...new Set(d.g.members.filter((m) => m.role === 'top').flatMap((m) => [m.a, m.b]))].map((id) => d.g.nodes[id].x);
    d.unplaced = d.pointLoads.filter((p) => !tops.some((x) => Math.abs(x - p.x) <= 80));
  }
  return d;
}

export function designSet(L, opts = {}) {
  // a second call on the same layout starts again from the layout's own keys
  let had = false;
  for (const t of L.trusses) if (t.baseKey) { t.key = t.baseKey; t.kind = t.baseKind; delete t.baseKey; delete t.baseKind; had = true; }
  for (const [k, r] of [...L.designs]) if (r.valleyOf) { L.designs.delete(k); had = true; }
  if (had) regroup(L);
  const out = new Map(), reqs = [...L.designs.values()].sort((a, b) => (a.pointFrom && a.pointFrom.length ? 1 : 0) - (b.pointFrom && b.pointFrom.length ? 1 : 0));
  for (const r of reqs) out.set(r.key, designOne(r, out, opts));
  // the main trusses a valley set stands on (DC.116): their own design with the valley ends' reactions at forced panel points
  const vl = valleyPointLoads(L, out);
  if (vl.size) {
    for (const [id, list] of vl) {
      const t = L.trusses.find((x) => x.id === id), base = t && L.designs.get(t.key);
      if (!base) continue;
      const S = base.spec.span, inside = list.map((p) => ({ ...p, x: Math.round(Math.max(0, Math.min(S, p.x))) }));
      const sig = inside.map((p) => [p.x, ...CASES.map((c) => Math.round(p[c] * 100))].join(',')).sort().join(';');
      const key = `${t.key}|vl|${sig}`;
      if (!L.designs.has(key)) {
        let spec = base.spec, kind = base.kind;
        if (!spec.profile) {   // a common truss has no forced stations: the same shape as a section truss, so the loads sit on panel points
          const rise = (S / 2) * Math.tan((spec.pitch || 0) * D2R);
          spec = { form: 'profile', span: S, profile: [[0, 0], [S / 2, Math.round(rise * 10) / 10], [S, 0]], overhangL: spec.overhang || 0, overhangR: spec.overhang || 0, heel: spec.heel, panels: spec.panels };
          kind = 'profile';
        }
        const extraX = [...new Set([...(base.extraX || []), ...inside.map((p) => p.x).filter((x) => x > 0 && x < S)])].sort((a, b) => a - b);
        const r = { ...base, key, kind, spec, extraX, pointAdd: inside, valleyOf: t.key };
        L.designs.set(key, r);
        out.set(key, designOne(r, out, opts));
      }
      t.baseKey = t.key; t.baseKind = t.kind; t.key = key; t.kind = L.designs.get(key).kind;
    }
    for (const [k] of [...out]) if (!L.trusses.some((t) => t.key === k)) out.delete(k);   // a main design no truss uses any more
    regroup(L);
  }
  return out;
}

const describe = (L, key) => { const g = L.groups.find((x) => x.key === key); return g ? { n: g.ids.length, span: g.span, kind: g.kind, ids: g.ids } : { n: 1, span: 0, kind: 'common', ids: [] }; };

/** The mouth girder's forces and first size, and the valley trusses' reactions on the main trusses, in words (DC.116). */
export function mouthProblems(L, designs) {
  const out = [], P = (code, severity, text, part) => ({ code, severity, part, msg: { key: 'truss.' + code }, text, source: { name: sourceName() } });
  const g = mouthGirder(L, designs);
  if (g) {
    if (!g.ok) out.push(P('mouthgirder', 'warning', `Mouth girder: ${g.failed.join(', ')} could not be designed, so their reactions are missing from the girder's loads.`, 'valley'));
    const gv = g.governing;
    out.push(P('mouthgirder', 'note', `Mouth girder (a girder truss or a bearing wall along the wing's mouth), span ${Math.round(g.span)} mm, carrying ${g.loads.length} main truss end${g.loads.length === 1 ? '' : 's'}: governing combination "${gv.name}" gives M ${gv.M} kN·m, V ${gv.V} kN, bearing reactions ${gv.RA} kN and ${gv.RB} kN (D ${g.cases.D.RA} / ${g.cases.D.RB}, S ${g.cases.S.RA} / ${g.cases.S.RB} kN).`, 'valley'));
    const d = [...designs.values()].find((x) => x && x.ok);
    const z = sizeGirder(g, d);
    if (z.reason === 'nofb') out.push(P('mouthsize', 'warning', `Mouth girder size: the species table has no Fb (bending) for this species, so the girder is not sized. Enter an Fb to get a first size (it needs a section modulus of ${z.M} kN·m ÷ Fb).`, 'valley'));
    else if (z.reason === 'toobig') out.push(P('mouthsize', 'warning', `Mouth girder size: even a ${z.id} beam (${z.b} × ${z.d} mm) is over (bending ${Math.round(z.util * 100)} % of Fb${z.defl && z.deflMax ? `, deflection ${z.defl.max} mm against ${z.deflMax} mm` : ''}). Use a girder truss, glulam or LVL, or a bearing wall: the truss designer sizes it.`, 'valley'));
    else if (z.ok) out.push(P('mouthsize', 'note', `Mouth girder first size, if it is a beam: ${z.id} (${z.b} × ${z.d} mm), bending ${Math.round(z.util * 100)} % of Fb ${z.Fb} MPa × CD${z.defl ? `, dead + snow deflection ${z.defl.max} mm${z.deflMax ? ` (limit ${z.deflMax} mm, span / ${z.deflLimit})` : ' (no limit entered, none checked)'}` : ''}${z.bearingLen ? `, bearing at least ${z.bearingLen} mm at each end for ${z.R} kN (Fcp ${z.Fcp} MPa)` : ''}. Shear, lateral restraint, the plies' nailing and the posts or walls under it are not checked here: the truss designer's.`, 'valley'));
  }
  const v = valleyOnMain(L, designs);
  if (v.length) {
    const top = v.reduce((b, o) => (o.D + o.S > b.D + b.S ? o : b), v[0]);
    out.push(P('valleyload', 'note', `Valley trusses on the main roof: ${v.length} main truss${v.length === 1 ? '' : 'es'} take their end reactions as point loads on the top chord (largest on ${top.id}: D ${top.D} kN, S ${top.S} kN about ${top.x} mm from its start). Those trusses are designed with them, each at a panel point of its own.`, 'valley'));
    const lost = [];
    for (const t of L.trusses) { const d = designs.get(t.key); if (t.baseKey && d && d.unplaced && d.unplaced.length) lost.push(t.id); }
    if (lost.length) out.push(P('valleyload', 'warning', `Valley trusses on the main roof: on ${lost.join(', ')} a valley end falls where the top chord has no joint (on the overhang or past the heel), so that load is NOT in the design: check those trusses for it.`, 'valley'));
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

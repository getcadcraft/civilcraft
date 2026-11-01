/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-bimcraft.mjs — BimCraft's side of the frame analysis (0.6 LC.4; bimcraft/dev/analysis-bim.js), run by
 * bin/test-frame.mjs (`--only bimcraft`). IFC files are made here by DetailCraft's own IFC writer (ifc.js, a different
 * code path from the reader under test) and read with BimCraft's cc-ifc copy:
 *   - a frame with every member on its centre line: BimCraft reads each beam, column and brace with its profile, its axis
 *     on DetailCraft's line, steel; the analysis of the IFC equals DetailCraft's analysis of the model (same loads);
 *   - the sample frame, whose beams are cut back at end plates and sit top of steel at the level: the ends are carried
 *     onto the column axes, the frame is one piece, its own weight all goes to the six bases;
 *   - the settings: written into the project's CadCraft_Analysis set (one undo step), read back, saved in the IFC and
 *     read from the saved file, gone after Undo.
 */
import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

export async function run(T) {
  const { ok, skip, rel, eqm, ROOT, FPN } = T;
  const APPS = path.join(ROOT, 'public_html/assets/apps');
  const BC = path.join(APPS, 'bimcraft/dev'), DC = path.join(APPS, 'detailcraft/dev');
  register('data:text/javascript,' + encodeURIComponent(`export async function resolve(spec, ctx, next) {
    if (spec === 'manifold-3d') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js')).href)}, shortCircuit: true };
    return next(spec, ctx);
  }`), import.meta.url);
  const bl = (f) => import(pathToFileURL(path.join(BC, f)).href), dl = (f) => import(pathToFileURL(path.join(DC, f)).href);
  (await bl('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(BC, 'lang/en.json'), 'utf8')) });
  (await dl('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(DC, 'lang/en.json'), 'utf8')) });
  const W = await bl('ifc/api.js');
  const AB = await bl('analysis-bim.js');
  const { IfcEditor } = await bl('ifc-edit.js');
  const { IfcModel } = await bl('ifc-model.js');
  const AD = await dl('analysis.js');
  const { writeIfc } = await dl('ifc.js');
  const { build } = await dl('build.js');
  const { markParts, markFootings } = await dl('marks.js');
  const { bendingSchedule } = await dl('rebar.js');
  const { sampleModel } = await dl('sample.js');

  const toIfc = (state) => {
    const built = build(state), marks = markParts(built, { perPhase: false });
    marks.footingMark = markFootings(state.footings, { perPhase: false });
    return new TextEncoder().encode(writeIfc(state, built, marks, bendingSchedule(state.footings), { now: new Date('2026-10-16T00:00:00Z') }));
  };
  const api = new W.IfcAPI();
  await api.Init();
  const open = (bytes) => api.OpenModel(bytes, { COORDINATE_TO_ORIGIN: false });

  // ---- a frame on centre lines: two bays, a brace, no connections ----
  const base = JSON.parse(JSON.stringify(sampleModel().state || sampleModel()));
  const st = { ...base, members: [], connections: [], footings: [], stairs: [], bolts: [], issues: [] };
  const mem = (id, type, profile, a, b, name) => st.members.push({ id, type, profile, material: 'A992', start: a, end: b, rotation: 0, position: 'middle', name, cuts: [], holes: [], phase: 1 });
  mem('m1', 'column', 'W12x50', [0, 0, 0], [0, 0, 4000], 'C1'); mem('m2', 'column', 'W12x50', [6000, 0, 0], [6000, 0, 4000], 'C2'); mem('m3', 'column', 'W12x50', [12000, 0, 0], [12000, 0, 4000], 'C3');
  mem('m4', 'beam', 'W16x26', [0, 0, 4000], [6000, 0, 4000], 'B1'); mem('m5', 'beam', 'W16x26', [6000, 0, 4000], [12000, 0, 4000], 'B2');
  mem('m6', 'brace', 'HSS4x4x1/4', [0, 0, 0], [6000, 0, 4000], 'X1');
  mem('m7', 'column', 'HSS6x6x1/4', [0, 4000, 0], [0, 4000, 4000], 'C4'); mem('m8', 'beam', 'W16x26', [0, 0, 4000], [0, 4000, 4000], 'B3');
  const r1 = AB.readFrameElements(W, api, open(toIfc(st)));
  const byName = new Map(r1.elements.map((e) => [e.name, e]));
  const lineOk = st.members.every((m) => { const e = byName.get(m.name); if (!e) return false; const d1 = Math.hypot(...e.a.map((v, i) => v - m.start[i])) + Math.hypot(...e.b.map((v, i) => v - m.end[i])); return d1 < 0.05; });
  ok(r1.elements.length === 8 && !r1.skipped.length && lineOk && r1.elements.every((e) => e.mat.kind === 'steel'),
    `BimCraft reads DetailCraft's IFC: ${r1.elements.length} beams, columns and braces with their profiles, each axis on DetailCraft's line (within 0.05 mm), steel`);
  const W16 = byName.get('B1').sec, C1 = byName.get('C1').sec;
  ok(rel(W16.Iy / 25.4 ** 4, 301) < 0.01 && rel(C1.Iy / 25.4 ** 4, 391) < 0.015 && rel(W16.J / 25.4 ** 4, 0.262) < 0.03,
    `sections from the IFC profiles: W16x26 Iy ${(W16.Iy / 25.4 ** 4).toFixed(1)} in⁴ (AISC 301), W12x50 Iy ${(C1.Iy / 25.4 ** 4).toFixed(1)} (AISC 391), J ${(W16.J / 25.4 ** 4).toFixed(3)} (AISC 0.262)`);
  // the same loads in both apps (BimCraft names elements by GlobalId)
  const an = AD.ANALYSIS_DEFAULTS();
  an.cases[1].loads.push({ type: 'udl', member: 'm4', dir: 'Z', w: -18 }, { type: 'point', member: 'm5', dir: 'Z', P: -25000, a: 2000 }, { type: 'node', at: [0, 0, 4000], F: [12000, 0, 0, 0, 0, 0] });
  const anB = JSON.parse(JSON.stringify(an));
  for (const c of anB.cases) for (const l of c.loads) if (l.member) l.member = byName.get(st.members.find((m) => m.id === l.member).name).gid;
  const d = AD.analyse(st, an), b = { frame: AB.frameOfElements(r1.elements, anB) };
  b.sol = (await import(pathToFileURL(path.join(BC, 'frame/frame-solve.js')).href)).solveFrame(b.frame.model);
  ok(d.sol.ok && b.sol.ok && b.frame.model.members.length === d.frame.model.members.length && b.frame.model.supports.length === d.frame.model.supports.length,
    `the analytical models match: ${b.frame.model.members.length} members, ${b.frame.model.supports.length} supports in both`);
  let worst = 0, what = '';
  for (const key of ['case:D', 'case:L', 'combo:C1']) {
    const rd = FPN.partResults(d.frame.parts, d.sol, key), rb = FPN.partResults(b.frame.parts, b.sol, key);
    for (const m of st.members) {
      const x = rd.get(m.id)?.ext, y = rb.get(byName.get(m.name).gid)?.ext;
      for (const a of ['My', 'N', 'Vz']) { const s = Math.max(x[a].abs, 1e3); const e = Math.abs(x[a].abs - y[a].abs) / s; if (e > worst) { worst = e; what = key + ' ' + m.name + ' ' + a; } }
    }
  }
  ok(worst < 0.01, `results from the IFC equal DetailCraft's own analysis of the model (largest difference ${(100 * worst).toFixed(3)} % of the value, ${what}; the sections differ only by how the fillets are drawn)`);
  eqm('BimCraft (IFC frame)', b.sol);

  // ---- the sample: beams cut back at end plates, top of steel at the level ----
  const s0 = sampleModel().state || sampleModel();
  const r2 = AB.readFrameElements(W, api, open(toIfc(s0)));
  const steel = s0.members.filter((m) => AD.MEMBER_KINDS.includes(m.type)).length;
  const f2 = AB.frameOfElements(r2.elements, AD.ANALYSIS_DEFAULTS(), { name: 'sample' });
  const sol2 = (await import(pathToFileURL(path.join(BC, 'frame/frame-solve.js')).href)).solveFrame(f2.model);
  const D2 = sol2.ok ? sol2.results['case:D'] : null;
  const dSample = AD.analyse(s0, AD.ANALYSIS_DEFAULTS()).sol.results['case:D'];
  ok(r2.elements.length === steel && f2.snapped > 0 && sol2.ok && f2.model.supports.length === 6 && rel(D2.reacted[2], -D2.applied[2]) < 1e-9 && rel(D2.reacted[2], dSample.reacted[2]) < 0.08,
    `the sample frame from its IFC (beams cut back at end plates): ${f2.snapped} member ends carried onto the axes they frame into, one connected frame on 6 bases, its own weight ${(D2?.reacted[2] / 1000).toFixed(2)} kN all in the reactions (DetailCraft, node to node: ${(dSample.reacted[2] / 1000).toFixed(2)} kN — the IFC's beams are their cut lengths)`);

  // ---- settings in the IFC ----
  const model = new IfcModel(W, api);
  await model.load(toIfc(st));
  const ed = new IfcEditor(W, model);
  ok(AB.readAnalysis(W, ed.api, ed.mid) === null, 'a model with no analysis settings reads none');
  const json = JSON.stringify(anB);
  ed.modelChange(AB.writeAnalysis(json), { label: 'analysis' });
  const back = AB.readAnalysis(W, ed.api, ed.mid);
  ok(JSON.stringify(back) === JSON.stringify(FPN.cleanAnalysis(anB)), 'the settings are written into the project\'s CadCraft_Analysis set and read back (cleaned like any file)');
  ed.modelChange(AB.writeAnalysis(JSON.stringify({ ...anB, bases: 'pinned' })), { label: 'analysis 2' });
  const bytes = ed.save();
  const mid3 = open(bytes);
  ok(AB.readAnalysis(W, api, mid3)?.bases === 'pinned', 'changed again (the same set, updated in place) and saved: the saved IFC carries the newest settings');
  ed.undo();
  ok(AB.readAnalysis(W, ed.api, ed.mid)?.bases === 'fixed', 'Undo takes the last change back');
  ok(AB.materialKind('C30/37 Concrete') === 'concrete' && AB.materialKind('Glulam GL24h') === 'timber' && AB.materialKind('S355') === 'steel' && AB.materialKind('') === 'steel', 'materials by name: concrete, timber, else steel');
}

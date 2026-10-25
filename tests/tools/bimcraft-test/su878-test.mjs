/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --su878` (0.7 SU.878, BimCraft's side, sessions bim-07 + honesty-fixes): every analytical section from an
 * IfcIShapeProfileDef carries the I `shape` the Design checks (lib/frame, make-07) need — { kind: 'I', d, bf, tw, tf, r, welded? } in mm.
 * IFC has no "rolled" flag, so analysis-bim.js `rolledIShape` calls a profile rolled only when its name is a hot-rolled I-shape of the shared
 * section table (shapes/sections.js: W, S, IPE, HEA, HEB) and its size agrees with that row; anything else is welded ("not checked").
 * Then the Design checks run on the fixture (both code families) and a rolled IPE / W member gets a utilisation, the plate girder does not.
 * The Analysis tab asks for the Design block (`design: true`). The rest of the frame analysis is tools/frame/test-bimcraft.mjs.
 */
import path from 'node:path';
import fs from 'node:fs';

export async function su878Mode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  const AB = await import(path.join(APP, 'analysis-bim.js'));
  const FP = await import(path.join(APP, 'frame/frame-panel.js'));
  const FC = await import(path.join(APP, 'frame/frame-combos.js'));
  const FD = await import(path.join(APP, 'frame/frame-design.js'));
  const SEC = await import(path.join(APP, 'shapes/sections.js'));
  const SOLVE = await import(path.join(APP, 'frame/frame-solve.js'));
  let bad = 0;
  const ok = (cond, label) => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  const t = (k) => k;

  // rolledIShape on its own
  const W = SEC.findSection('W12X26'), IPE = SEC.findSection('IPE300');
  ok(AB.rolledIShape(['W12x26'], W) === W.name && AB.rolledIShape(['w12 X 26'], W) === W.name, 'rolledIShape: "W12x26" with the table size is rolled (any case, spaces)');
  ok(AB.rolledIShape(['IPE 300'], IPE) === 'IPE300' && AB.rolledIShape(['', 'IPE300'], IPE) === 'IPE300', 'rolledIShape: "IPE 300", and the element\'s ObjectType when the profile has no name');
  ok(AB.rolledIShape(['HE 200 A'], SEC.findSection('HEA200')) === 'HEA200', 'rolledIShape: "HE 200 A" (the older European name) → HEA200');
  ok(AB.rolledIShape(['IPE300'], { ...IPE, tf: IPE.tf + 3 }) === null, 'rolledIShape: a table name with a different flange (edited, or a built-up copy) is not rolled');
  ok(AB.rolledIShape(['WELDED 500x250', 'PG1'], { d: 500, bf: 250, tw: 10, tf: 20 }) === null && AB.rolledIShape([], IPE) === null, 'rolledIShape: a plate girder or no name is not rolled');
  ok(AB.rolledIShape(['HSS6X6X1/4'], { d: 152, bf: 152, tw: 6, tf: 6 }) === null, 'rolledIShape: a table row that is not an I-shape is not rolled');

  for (const [file, label] of [['ios-steel-ifc2x3.ifc', 'IFC2X3, mm'], ['ios-steel-ifc4-feet.ifc', 'IFC4, feet']]) {
    const m = await quiet((b) => eng.load(b))(fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures', file)));
    const r = AB.readFrameElements(WebIFC, eng.api, m.modelID);
    const withShape = r.elements.filter((e) => e.sec.shape);
    ok(r.elements.length > 0 && withShape.length > 0 && withShape.every((e) => e.sec.shape.kind === 'I' && e.sec.shape.d > e.sec.shape.tf * 2 && e.sec.shape.bf > e.sec.shape.tw && e.sec.shape.r >= 0),
      `${label}: ${withShape.length} of ${r.elements.length} analytical members carry a sensible I shape`);
    const rolled = withShape.filter((e) => !e.sec.shape.welded).map((e) => e.sec.name), welded = withShape.filter((e) => e.sec.shape.welded).map((e) => e.sec.name);
    ok(rolled.length > 0 && rolled.every((n) => /^(IPE300|HEA200)$/.test(n)) && welded.length > 0 && welded.every((n) => /WELDED/.test(n)),
      `${label}: rolled ${[...new Set(rolled)].join(', ')}; welded ${[...new Set(welded)].join(', ')}`);
    if (file !== 'ios-steel-ifc2x3.ifc') continue;
    // The fixture is not a stable frame on its own (one girder end rests on nothing), so the Design checks run on a portal made from its own
    // members: HEA200 columns, an IPE300 beam and the welded girder as the second bay, with a live load of 12 kN/m on both beams.
    const pick = (n, type) => r.elements.find((e) => e.sec.name === n && e.type === type);
    const col = pick('HEA200', 'column'), ipe = pick('IPE300', 'beam'), pg = pick('WELDED 500x250', 'beam');
    const H = 3600, place = (e, gid, a, b, U, V) => ({ ...e, id: gid, gid, name: gid, a, b, U, V });
    const els = [place(col, 'C1', [0, 0, 0], [0, 0, H], [1, 0, 0], [0, 1, 0]), place(col, 'C2', [6000, 0, 0], [6000, 0, H], [1, 0, 0], [0, 1, 0]), place(col, 'C3', [12000, 0, 0], [12000, 0, H], [1, 0, 0], [0, 1, 0]),
      place(ipe, 'B1', [0, 0, H], [6000, 0, H], [0, 1, 0], [0, 0, 1]), place(pg, 'B2', [6000, 0, H], [12000, 0, H], [0, 1, 0], [0, 0, 1])];
    for (const code of ['en', 'asce-aisc']) {
      const an = FP.cleanAnalysis({ ...FP.defaultAnalysis(t), design: { code } });
      an.cases[1].loads.push({ type: 'udl', member: 'B1', dir: 'Z', w: -12 }, { type: 'udl', member: 'B2', dir: 'Z', w: -12 });
      const gen = FC.generateCombos(code, an.cases.map((c) => ({ id: c.id, name: c.name, kind: c.kind })), {});
      an.combos = [...an.combos.filter((c) => !c.limit), ...gen.combos];
      const frame = AB.frameOfElements(els, an);
      const sol = SOLVE.solveFrame(frame.model);
      const res = FD.checkFrame(frame.model, sol, an.design);
      const secOf = (row) => frame.model.sections.find((q) => q.id === frame.model.members.find((mm) => mm.id === row.id)?.section);
      const rows = res.members || [];
      const rolledRows = rows.filter((row) => secOf(row)?.shape && !secOf(row).shape.welded), weldedRows = rows.filter((row) => secOf(row)?.shape?.welded);
      const got = rolledRows.filter((row) => row.status !== 'not-checked' && Number.isFinite(row.util) && row.util > 0);
      const beam = got.filter((row) => /^B1/.test(row.id));
      ok(sol.ok && res.ok !== false && rolledRows.length >= 4 && got.length === rolledRows.length && beam.length > 0 && beam.every((q) => q.util > 0.2 && q.util < 1.5),
        `${code}: every rolled member gets a utilisation, the beam's in a plausible range (0.2–1.5; wL²/12 against φMp is about 0.4) (${got.length} of ${rolledRows.length}; IPE300 beam ${Math.max(...beam.map((q) => q.util)).toFixed(3)}, governing ${beam[0]?.check?.clause || '?'})`);
      ok(weldedRows.length > 0 && weldedRows.every((row) => row.status === 'not-checked' && row.why === 'welded'), `${code}: the welded plate girder stays "not checked" (welded)`);
    }
  }
  const ui = fs.readFileSync(path.join(APP, 'analysis-bim-ui.js'), 'utf8');
  ok(/design:\s*true/.test(ui), 'the Analysis tab asks for the Design block (design: true)');
  console.log(bad ? `\n${bad} FAILED` : '\nall ok');
  return bad ? 1 : 0;
}

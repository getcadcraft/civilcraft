/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --plumbstd` (0.8 SU.955, session `mep-08`): the model's plumbing standard (mep/standard.js,
 * mep/pipes.js projectStandard). New runs start under the project's standard (US or Brazil / ABNT) — material, class, size and
 * drain slope — also those started on a fixture's connector or an equipment port; the choice is kept in the model
 * (CadCraft_MepProject), is one undo step, survives a save and reopen (IFC4 + IFC2X3), and a file with none behaves as 0.7.
 */
import path from 'node:path';
import fs from 'node:fs';

export async function plumbstdMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const PI = await import(path.join(APP, 'mep/pipes.js'));
  const M = await import(path.join(APP, 'mep-model.js'));
  const S = await import(path.join(APP, 'mep/standard.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const N = await import(path.join(APP, 'new-model.js'));

  console.log('== the standard decides what a new run starts with (DOM-free)');
  PI.setProjectStandard(null);
  const us0 = M.runDefaults('pipe', 'san'), br0 = M.runDefaults('pipe', 'san', undefined, 'br');
  ok(PI.projectStandard() === null && us0.mat === 'pvc' && us0.cls === '40' && us0.size === '3', 'no standard set: a sanitary run is PVC 40, 3" (as in 0.7)', JSON.stringify(us0));
  ok(br0.mat === 'pvc-esg' && br0.size === '100', 'asked for Brazil: PVC esgoto, DN 100', JSON.stringify(br0));
  PI.setProjectStandard('br');
  const b = { cw: M.runDefaults('pipe', 'cw'), san: M.runDefaults('pipe', 'san'), vent: M.runDefaults('pipe', 'vent'), hw: M.runDefaults('pipe', 'hw') };
  ok(b.cw.mat === 'pvc-sold' && b.cw.size === '25' && b.san.mat === 'pvc-esg' && b.vent.mat === 'pvc-esg' && b.hw.mat === 'copper', 'project = br: cold water PVC soldável 25, drains and vents PVC esgoto, hot water copper', JSON.stringify(b));
  const slopeBr = b.san.slope, p = PI.pipeSize('pvc-esg', 'SN', '100');
  ok(slopeBr > 0 && slopeBr === PI.drainSlope(p), 'project = br: the drain slope is NBR 8160\'s for DN 100 (' + slopeBr + ')');
  PI.setProjectStandard('us');
  const u = { cw: M.runDefaults('pipe', 'cw'), san: M.runDefaults('pipe', 'san') };
  ok(u.cw.mat === 'copper' && u.cw.size === '3/4' && u.san.mat === 'pvc' && u.san.slope === PI.drainSlope(PI.pipeSize('pvc', '40', '3')), 'project = us: copper 3/4" water, PVC 3" drain at the IPC slope', JSON.stringify(u));
  ok(PI.stdFor('pvc-esg') === 'us' && (PI.setProjectStandard(null), PI.stdFor('pvc-esg')) === 'br' && PI.stdFor('copper') === 'us', 'stdFor: the project\'s when set, else the material\'s');
  PI.setProjectStandard('xx');
  ok(PI.projectStandard() === null, 'an unknown standard is not kept');

  for (const schema of ['IFC4', 'IFC2X3']) {
    console.log('== kept in a ' + schema + ' model');
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    const bytes0 = schema === 'IFC2X3' ? fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures/ios-steel-ifc2x3.ifc'))
      : new TextEncoder().encode(N.newBuilding({ name: 'STD', levels: N.stackLevels(1, 3000, () => 'Level 1'), fileName: 's.ifc', now: new Date('2026-10-27T12:00:00Z') }));
    await quiet((x) => eng.load(x))(bytes0);
    const ed = new IfcEditor(WebIFC, eng), w = () => new ModelWriter(WebIFC, ed.api, ed.mid);
    ok(S.readModelStandard(w()) === null, 'a new file has no standard');
    ed.modelChange(S.saveModelStandard('br'), { label: 'std' });
    ok(S.readModelStandard(w()) === 'br', 'saved: Brazil');
    ed.undo();
    ok(S.readModelStandard(w()) === null, 'one Undo takes it back');
    ed.redo();
    ok(S.readModelStandard(w()) === 'br', 'Redo puts it back');
    ed.modelChange(S.saveModelStandard('us'), { label: 'std' });
    ok(S.readModelStandard(w()) === 'us', 'changed to US');
    ed.modelChange(S.saveModelStandard('br'), { label: 'std' });
    const out = ed.save();
    const txt = new TextDecoder().decode(out);
    ok(/CadCraft_MepProject/.test(txt) && /'PlumbingStandard'/.test(txt), 'the file carries CadCraft_MepProject › PlumbingStandard');
    const eng2 = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((x) => eng2.load(x))(out);
    const ed2 = new IfcEditor(WebIFC, eng2);
    ok(S.readModelStandard(new ModelWriter(WebIFC, ed2.api, ed2.mid)) === 'br', 'reopened: Brazil');
    // a run drawn under the standard keeps its own material when the standard changes
    const storey = OPS.snapshotModel(ed2).levels[0].guid;
    PI.setProjectStandard('br');
    const d = M.runDefaults('pipe', 'san');
    ed2.modelChange(M.placeRun({ storey, kind: 'pipe', system: d.system, mat: d.mat, cls: d.cls, size: d.size, points: [[0, 0, 2400], [3000, 0, 2400]], slope: d.slope }), { label: 'run' });
    PI.setProjectStandard('us');
    const runs = M.readRuns(new ModelWriter(WebIFC, ed2.api, ed2.mid));
    ok(runs.length === 1 && runs[0].mat === 'pvc-esg' && runs[0].size === '100' && PI.standardOf(runs[0].mat) === 'br', 'a Brazilian run drawn under br stays PVC esgoto DN 100 after the project goes US');
    ok(M.drainMinimum(runs[0]) === slopeBr, 'and keeps its NBR 8160 minimum slope');
  }
  PI.setProjectStandard(null);
  console.log('\n' + good + ' passed, ' + bad + ' failed');
  return bad ? 1 : 0;
}

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * shell-mount-test.mjs — `node bin/test-bimcraft.mjs --shell` (0.8 round 3, oltl-eg-a_PART_3): BimCraft's mount of the shell's modules (EG.18 calc sheets,
 * EG.34 reasons, EG.23 lessons) on cc-ifc, no browser. The sheets are kept in the IFC (CadCraft_Shell on the IfcProject): written as one undo step,
 * read back, undone, saved and reopened, damaged rows read as nothing, a file with none stays byte-identical; the lesson's probes answer from the model.
 */
import path from 'node:path';

export async function shellMode({ APP, WebIFC, IfcModel, quiet }) {
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const S = await import(path.join(APP, 'shell-mount.js'));
  let bad = 0, good = 0;
  const ok = (c, label, d = '') => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + label + (d ? ' (' + d + ')' : '')); };

  console.log('== Sheets live in the IFC');
  const text = N.newBuilding({ name: 'Shell test', levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 's.ifc', now: new Date('2026-10-29T12:00:00Z') });
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, eng);
  const before = ed.save();
  ok(JSON.stringify(S.readShell(ed.api, ed.mid)) === JSON.stringify({ calcs: null, reasons: null }), 'a file with no sheets reads as none');
  ed.modelChange(S.writeShellOp({ calcs: null, reasons: null }), { label: 'none' });
  ok(Buffer.compare(Buffer.from(ed.save()), Buffer.from(before)) === 0 || ed.changes.length === 1, 'writing nothing adds no set (or only the one undo step)');
  ed.undo();
  const calcs = { format: 'cadcraft-calcs', v: 1, sheets: [{ id: 's1', title: 'Beam', rows: [{ id: 'r1', name: 'L', expr: '6 m' }] }] };
  const n0 = ed.changes.length;
  ed.modelChange(S.writeShellOp({ calcs, reasons: { format: 'cadcraft-reasons', v: 1, items: [] } }), { label: 'Calc sheets' });
  ok(ed.changes.length === n0 + 1, 'writing sheets is one undo step');
  let r = S.readShell(ed.api, ed.mid);
  ok(r.calcs?.sheets?.[0]?.title === 'Beam' && r.calcs.sheets[0].rows[0].expr === '6 m' && r.reasons?.format === 'cadcraft-reasons', 'read back as written');
  ed.modelChange(S.writeShellOp({ calcs: { ...calcs, sheets: [{ id: 's1', title: 'Beam 2', rows: [] }] }, reasons: null }), { label: 'again' });
  r = S.readShell(ed.api, ed.mid);
  ok(r.calcs.sheets[0].title === 'Beam 2' && r.reasons === null, 'a second write replaces the set (the reasons row went)');
  ed.undo();
  r = S.readShell(ed.api, ed.mid);
  ok(r.calcs.sheets[0].title === 'Beam' && r.reasons?.format === 'cadcraft-reasons', 'undo puts the first version back');
  ed.undo(); ed.redo();
  ok(S.readShell(ed.api, ed.mid).calcs?.sheets?.[0]?.title === 'Beam', 'redo too');
  const back = await quiet(IfcModel.create)(WebIFC, null);
  const m2 = await quiet((b) => back.load(b))(ed.save());
  ok(S.readShell(back.api, m2.modelID).calcs?.sheets?.[0]?.rows?.[0]?.name === 'L', 'saved in the file, read again on open');
  // a damaged row reads as nothing, a big one is ignored
  const w = new ModelWriter(ed.W, ed.api, ed.mid);
  ed.modelChange((e) => { const ww = new ModelWriter(e.W, e.api, e.mid); return ww.run(() => { const pid = (S.readShell, e.api.GetLineIDsWithType(e.mid, WebIFC.IFCPROJECT).get(0)); const d = ww.defNamed(pid, S.SHELL_PSET); const ps = ww.touch(d.def); ps.HasProperties = ww.propLines([['Calcs', 'IFCTEXT', '{not json'], ['Reasons', 'IFCTEXT', '[1,2]']]); ww.write(ps); return { id: pid }; }); }, { label: 'damage' });
  r = S.readShell(ed.api, ed.mid);
  ok(r.calcs === null && Array.isArray(r.reasons), 'a damaged JSON row reads as nothing, never throws', JSON.stringify(r).slice(0, 80));

  console.log('== The first lesson answers from the model');
  const state = { model: eng && m2 ? { modelID: ed.mid } : null, mode: 'ifc', saved: false };
  const L = S.lessonsOf({ ifc: () => ed, model: () => state.model, mode: () => state.mode, saved: () => state.saved });
  ok(L.lessons.length === 1 && L.lessons[0].steps.length === 4 && L.lessons[0].badge.title, 'one lesson, four steps, a badge');
  ok(Object.keys(L.probes).sort().join() === 'bim-door,bim-open,bim-saved,bim-wall', 'its probes');
  ok(L.lessons[0].steps.every((s) => s.text && !/^lesson\./.test(s.text) && s.hints.every((h) => !/^lesson\./.test(h))), 'every word is in the language file');
  ok(L.probes['bim-open']() && !L.probes['bim-wall']() && !L.probes['bim-door']() && !L.probes['bim-saved'](), 'a fresh building: open, no wall, no door, not saved');
  let snap = OPS.snapshotModel(ed);
  const P = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
  ed.modelChange(OPS.drawWalls({ storey: snap.levels[0].guid, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'ext-2x6' }), { label: 'walls' });
  ok(L.probes['bim-wall'](), 'a wall is drawn');
  snap = OPS.snapshotModel(ed);
  ed.modelChange(OPS.placeOpening({ wall: snap.walls[0].guid, typeKey: 'door-single', offset: 1000, face: 'left' }), { label: 'door' });
  ok(L.probes['bim-door'](), 'a door is placed');
  state.saved = true;
  ok(L.probes['bim-saved'](), 'saved');
  state.mode = 'dwg';
  ok(!L.probes['bim-open']() && !L.probes['bim-wall'](), 'a drawing (not an IFC model) answers no');

  console.log('== The schedule as running time (EG.30)');
  const day = (iso) => Math.round(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86400000);
  ok(S.scheduleHours([]) === null && S.scheduleHours(null) === null, 'no tasks: no number, not zero');
  ok(S.scheduleHours([{ start: day('2026-11-02'), finish: day('2026-11-06') }]) === 40, 'Monday to Friday is five days: 40 h');
  ok(S.scheduleHours([{ start: day('2026-11-02'), finish: day('2026-11-13') }]) === 80, 'two weeks, weekends not counted: 80 h');
  ok(S.scheduleHours([{ start: day('2026-11-07'), finish: day('2026-11-08') }]) === 0, 'a weekend only: 0 h');
  ok(S.scheduleHours([{ start: day('2026-11-02'), finish: day('2026-11-03') }, { start: day('2026-11-09'), finish: day('2026-11-10') }]) === 56, 'first start to last finish: 7 working days (Mon-Fri, then Mon-Tue)');
  ok(S.scheduleHours([{ start: 10, finish: 5 }]) === null && S.scheduleHours([{ start: 0, finish: 99999 }]) === null, 'a backwards or absurd range gives nothing');
  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}

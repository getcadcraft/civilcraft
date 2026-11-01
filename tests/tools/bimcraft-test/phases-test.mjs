/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --phases` (0.8 EG.59, session bim_PART_2): renovation phases kept in the IFC.
 * Known answers: a drawn box of walls (8000 × 5000, 3000 high, 4 exterior + 1 interior) with one door and one window in the south wall.
 */
import path from 'node:path';

export async function phasesMode({ APP, WebIFC, IfcModel, quiet }) {
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { propertyIndex } = await import(path.join(APP, 'ifc-props.js'));
  const P = await import(path.join(APP, 'phases.js'));
  let bad = 0, good = 0;
  const ok = (cond, label) => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const throwsKey = (fn) => { try { fn(); return ''; } catch (e) { return e.key || e.message; } };

  const text = N.newBuilding({ name: 'Phases', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'p.ifc', now: new Date('2026-10-27T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  let snap = OPS.snapshotModel(ed);
  const [A, B] = snap.levels.map((l) => l.guid);
  const pts = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
  ed.modelChange(OPS.drawWalls({ storey: A, segs: pts.map((p, i) => ({ a: p, b: pts[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: B, extSide: 'right' }));
  ed.modelChange(OPS.drawWalls({ storey: A, segs: [{ a: [4000, 0], b: [4000, 5000] }], typeKey: 'int-2x4', topLevel: B }));
  snap = OPS.snapshotModel(ed);
  const south = snap.walls.find((w) => w.a[1] === 0 && w.b[1] === 0 && w.typeKey === 'ext-2x6');
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 1000, face: 'left' }));
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'win-double-hung', offset: 5500, face: 'right' }));
  snap = OPS.snapshotModel(ed);
  const inner = snap.walls.find((w) => w.typeKey === 'int-2x4'), door = snap.openings.find((o) => o.kind === 'door'), win = snap.openings.find((o) => o.kind === 'window');
  const W = () => new ModelWriter(ed.W, ed.api, ed.mid);
  ok(snap.walls.length === 5 && door && win, 'drawn: five walls, a door, a window');

  console.log('== Set a phase');
  ok(throwsKey(() => P.phaseOp([inner.guid], 'later')) === 'eg59.err.phase', 'an unknown phase is refused');
  ok(throwsKey(() => P.phaseOp([], 'new')) === 'eg59.err.nosel', 'no element is refused');
  const before = ed.undoDepth ?? null;
  let r = ed.modelChange(P.phaseOp([inner.guid], 'demolish'), { label: 'Phase' });
  ok(r.counts.elements === 1 && r.counts.hosted === 0, 'the inner wall is demolition (no openings on it)');
  ok(P.readPhase(W(), W().byGuid(inner.guid)) === 'demolish', 'read back: demolish');
  r = ed.modelChange(P.phaseOp([south.guid], 'existing'), { label: 'Phase' });
  ok(r.counts.elements === 1 && r.counts.hosted === 2, 'south wall existing; its door and window follow (hosted 2)');
  ok(P.readPhase(W(), W().byGuid(door.guid)) === 'existing' && P.readPhase(W(), W().byGuid(win.guid)) === 'existing', 'the door and window read existing');
  r = ed.modelChange(P.phaseOp([door.guid], 'demolish'), { label: 'Phase' });
  ok(P.readPhase(W(), W().byGuid(door.guid)) === 'demolish' && P.readPhase(W(), W().byGuid(win.guid)) === 'existing', 'a door alone can change: door demolish, window still existing');
  const w = W();
  const rest = snap.walls.filter((x) => x.guid !== inner.guid && x.guid !== south.guid).map((x) => x.guid);
  ed.modelChange(P.phaseOp(rest, 'existing', { hosted: false }), { label: 'Phase' });
  ok(rest.every((g) => P.readPhase(W(), W().byGuid(g)) === 'existing'), 'three more walls existing');
  r = ed.modelChange(P.phaseOp(rest, 'existing'), { label: 'Phase' }).counts;
  ok(r.elements === 0, 'setting the same phase again changes nothing');

  console.log('== Undo / redo');
  ed.modelChange(P.phaseOp([inner.guid], 'new'), { label: 'Phase' });
  ok(P.readPhase(W(), W().byGuid(inner.guid)) === 'new', 'inner wall changed demolish → new');
  ed.undo();
  ok(P.readPhase(W(), W().byGuid(inner.guid)) === 'demolish', 'one undo puts demolish back');
  ed.redo();
  ok(P.readPhase(W(), W().byGuid(inner.guid)) === 'new', 'redo makes it new again');
  ed.undo();

  console.log('== Property index, summary, views');
  let bytes = ed.save();
  let e2 = await quiet(IfcModel.create)(WebIFC, null);
  let m2 = await quiet((x) => e2.load(x))(bytes);
  let ed2 = new IfcEditor(WebIFC, e2);
  let ix = propertyIndex(WebIFC, ed2.api, ed2.mid, m2);
  ok(ix.fields.some((f) => f.id === P.STATUS_FIELD && f.group === 'CadCraft_Phase'), 'the index lists CadCraft_Phase.Status (Find / Color by property work with no change)');
  const s = P.summary(ix);
  console.log('   summary', JSON.stringify(s));
  ok(s.demolish === 2 && s.existing === 5, 'summary: demolish 2 (inner wall, door), existing 5 (four walls, window)');
  ok(P.phaseKeys(ix, 'demolish').length === 2 && P.phaseKeys(ix, 'existing').length === 5, 'phaseKeys agree');
  const un = P.phaseKeys(ix, 'unassigned').length;
  ok(un >= 0 && P.summary(ix).unassigned === un, 'unassigned count agrees (' + un + ')');
  const vNew = P.phaseView(ix, 'result'), vDemo = P.phaseView(ix, 'demo'), vAll = P.phaseView(ix, 'all');
  ok(vNew.show.length === 5 + un && vNew.ghost.length === 0, 'result view: existing + new + unassigned, demolition left out');
  ok(vDemo.show.length === 2 && vDemo.ghost.length === 5, 'demolition view: two solid, existing ghosted');
  ok(vAll.show.length === 7 + un, 'all view shows everything');
  const sched = P.demolitionSchedule(ix);
  ok(sched.count === 2, 'demolition schedule lists two elements');

  console.log('== Plan graphics (phase pens, plan view and printed plan)');
  {
    const PEN = await import(path.join(APP, 'phase-pens.js')), PDF = await import(path.join(APP, 'model-pdf.js'));
    ok(P.PHASE_PLAN === PEN.PHASE_PLAN && ['existing', 'demolish', 'new'].every((k) => PEN.PHASE_PLAN[k]?.token && PEN.PHASE_PLAN[k].rgb.length === 3), 'one pen per phase, shared by phases.js and the plan');
    ok(PEN.PHASE_PLAN.demolish.dash && !PEN.PHASE_PLAN.existing.dash && PEN.PHASE_PLAN.new.w > PEN.PHASE_PLAN.existing.w, 'demolish dashed, new heavier than existing');
    const sq = (x) => [[x, 0], [x + 3000, 0], [x + 3000, 200], [x, 200]];
    const mk = (phase) => PDF.planPdf({ walls: [{ key: 1, guid: 'g', poly: sq(0), pieces: [sq(0)], phase }], symbols: [], cut: [], below: [], rooms: [], dims: [] }, { units: 'mm', paper: 'a4' });
    const txt = (r) => new TextDecoder('latin1').decode(r.bytes);
    const none = txt(mk(null)), dem = txt(mk('demolish')), nw = txt(mk('new'));
    ok(/0\.75 0\.22 0\.17 RG/.test(dem) && !/0\.75 0\.22 0\.17 RG/.test(none), 'printed plan: a demolished wall is red');
    ok(/\[[\d. ]+\] 0 d/.test(dem) && dem !== none && nw !== none && nw !== dem, 'printed plan: demolish dashed; each phase prints differently from no phase');
  }

  console.log('== Clear');
  ed.modelChange(P.phaseOp([inner.guid], null), { label: 'Phase' });
  ok(P.readPhase(W(), W().byGuid(inner.guid)) === null, 'cleared: back to no phase');
  ok(ed.modelChange(P.phaseOp([inner.guid], null), { label: 'Phase' }).counts.cleared === 0, 'clearing an element with no phase changes nothing');

  console.log(good + ' ok, ' + bad + ' failed');
  return bad ? 1 : 0;
}

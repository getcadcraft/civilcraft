/* SPDX-License-Identifier: Apache-2.0 */
/**
 * checks10-test.mjs: the audit, the LOD 350 interface rules, the verification state and the as-built statement on real IFC models,
 * without a page (0.10 BK.65, BK.20, BK.49, BK.64; session bk-r3-checks-10). node bin/test-bimcraft.mjs --checks10
 * The model is THE small house (fixtures/bimcraft/small-house.ifc; its numbers are HOUSE in make-small-house.mjs), changed through
 * BimCraft's own ops; every expected value is worked out by hand in the comment beside it. The page run is browser-checks10.mjs.
 */
import path from 'node:path';
import fs from 'node:fs';
import { HOUSE as H } from './make-small-house.mjs';

export async function checks10Mode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const AB = await import(path.join(APP, 'audit-bim.js'));
  const VM = await import(path.join(APP, 'verify-model.js'));
  const V = await import(path.join(APP, 'modelaudit/verify.js'));
  const S = await import(path.join(APP, 'modelaudit/stagelod.js'));
  const TR = await import(path.join(APP, 'model-trace.js'));
  const PP = await import(path.join(APP, 'plan-pages.js'));
  const SB = await import(path.join(APP, 'scan-build.js'));
  const WA = await import(path.join(APP, 'wall-assemblies.js'));
  const MEP = await import(path.join(APP, 'mep-model.js'));
  const PK = await import(path.join(APP, 'permit-package.js'));
  const HD = await import(path.join(APP, 'handover-docs.js'));
  const ASB = await import(path.join(APP, 'asbuilt.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const open = async (bytes) => {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    const model = await quiet((b) => eng.load(b))(bytes);
    const ed = new IfcEditor(WebIFC, eng);
    return { eng, model, ed, w: () => new ModelWriter(WebIFC, ed.api, ed.mid) };
  };
  const reopen = (B) => open(B.ed.save());
  const house = () => open(new Uint8Array(fs.readFileSync(path.join(ROOT, H.file))));
  const codes = (r) => { const m = {}; for (const p of r.problems) m[p.code] = (m[p.code] || 0) + 1; return m; };
  const run = (B, o = {}) => AB.runAudit({ ed: B.ed, model: B.model, ...o });
  return { ok, open, reopen, house, codes, run, OPS, AB, VM, V, S, TR, PP, SB, WA, MEP, PK, HD, ASB, N, ModelWriter, IfcEditor, done: () => { console.log(`\n${good} passed, ${bad} failed`); return bad ? 1 : 0; } };
}

export async function checks10Run(ctx) {
  const T = await checks10Mode(ctx);
  const { ok, reopen, house, codes, run, OPS, AB, VM, V, S, TR, PP, SB, MEP, PK, HD, ASB, N } = T;
  const path2 = await import('node:path');
  const COL = await import(path2.join(ctx.APP, 'model-columns.js'));
  const SP = await import(path2.join(ctx.APP, 'scan-progress.js'));
  const today = '2026-11-11';
  const sum = (r, set) => r.summary.find((x) => x.set === set);

  console.log('== BK.65 the audit on the small house as it is');
  let B = await house();
  let r = run(B, { stage: 'submission', stageName: 'Submission' });
  // the house: 2 named rooms, 2 doors D1 D2 + 3 windows W1 W2 W3 all marked, rooms 101 102 numbered, no devices → 7 tagged things
  ok(sum(r, 'rooms').checked === 2 && sum(r, 'rooms').found === 0 && sum(r, 'tags').checked === 7 && sum(r, 'tags').found === 0, 'rooms: 2 checked, both named; tags: 5 doors and windows + 2 rooms, all tagged');
  // LOD at Submission = 300: the 5 starter doors and windows are generic kinds at LOD 200 → below; the 5 walls (Exterior masonry 300,
  // Interior partition 100: starter types with no tag), 2 floors, 2 ceilings and the roof (no type) carry no tag → 10 in one note
  ok(sum(r, 'lod').required === 300 && sum(r, 'lod').checked === 15 && sum(r, 'lod').below === 5 && sum(r, 'lod').untagged === 10 && codes(r)['audit.lod.below'] === 5 && codes(r)['audit.lod.untagged'] === 1, 'LOD at Submission (300): 15 elements, the 5 doors and windows at LOD 200 are below, 10 have no tag (one note)', sum(r, 'lod'));
  ok(r.problems.find((p) => p.code === 'audit.lod.below').text === 'D1 is at LOD 200; the Submission stage asks for LOD 300.', 'the sentence names the element, its LOD, the stage and what it asks');
  // 914.4 mm doors and windows are under the 1000 mm starting limit; nothing crosses anything (the roof resting on the walls is by design)
  ok(sum(r, 'clashes').found === 0 && sum(r, 'interfaces').found === 0 && sum(r, 'interfaces').checked === 5 && sum(r, 'verification').found === 0, 'no clashes between disciplines, the 5 openings fit their walls and need no lintel (914 mm < 1000), nothing unverified');
  ok(r.problems.length === 6 && r.problems.every((p) => p.severity !== 'error'), 'six findings in all, none an error', r.problems.length);
  r = run(B, { stage: 'concept', stageName: 'Concept' });
  ok(sum(r, 'lod').below === 0 && sum(r, 'lod').untagged === 10, 'at Concept (LOD 100) nothing is below; the untagged note stays');
  r = run(B, {});
  ok(sum(r, 'lod').required === null && r.problems.length === 0, 'no project stage: the LOD is not checked, and the house has no findings at all');
  r = run(B, { stage: 'submission', table: S.cleanStageLod({ submission: 200 }) });
  ok(sum(r, 'lod').below === 0, 'an office table that asks LOD 200 at Submission: the doors and windows pass');
  ok(AB.stageTable({ tender: 400, concept: 'junk' }).table.tender === 400 && AB.stageTable({}).table.concept === 100 && AB.autoRoomName('Room 12') && !AB.autoRoomName('Living room'), 'the table in force = starting values with this computer\'s own rows over them; "Room 12" is a name the program gave');

  console.log('== BK.65 / BK.20 problems made on purpose');
  const snap0 = OPS.snapshotModel(B.ed);
  const living = snap0.derived.spaces.find((x) => x.name === 'Living room'), d1 = snap0.openings.find((o) => o.mark === 'D1'), w1 = snap0.openings.find((o) => o.mark === 'W1');
  B.ed.modelChange(OPS.changeDerived(living.guid, { name: 'Room 1' }));
  B.ed.modelChange(OPS.op((w) => { const l = w.touch(d1.id); l.Tag = null; w.write(l); return { id: d1.id, ids: [d1.id] }; }));
  B.ed.modelChange(OPS.changeOpening(w1.guid, { width: 1800 }));
  r = run(B, {});
  ok(codes(r)['audit.room.unnamed'] === 1 && r.problems.find((p) => p.code === 'audit.room.unnamed').text === 'Room 101 has no name of its own.', 'a room still called "Room 1" is unnamed (room 101)');
  ok(codes(r)['audit.tag.door'] === 1 && !codes(r)['audit.tag.window'], 'the door whose mark was taken off is reported; the others are not');
  const lint = r.problems.filter((p) => p.code === 'iface.lintel.missing');
  ok(lint.length === 1 && lint[0].text === 'W1 is 1800 mm wide (over 1000 mm) and has no lintel or header, and none is noted.' && lint[0].part === 'architecture|structure' && lint[0].found.value === 1800, 'the window widened to 1800 mm needs a lintel: reported for architecture | structure', lint.map((p) => p.text));
  r = run(B, { limits: { lintelOver: 2000 } });
  ok(!codes(r)['iface.lintel.missing'], 'an office limit of 2000 mm: no lintel asked');
  B.ed.modelChange(VM.setLintelNoteOp([w1.guid], '  Steel angle 100x100x8,  by the engineer '));
  r = run(B, {});
  ok(!codes(r)['iface.lintel.missing'] && VM.lintelNote(B.w(), w1.id) === 'Steel angle 100x100x8, by the engineer', 'a lintel NOTED on the window (CadCraft_Interface.Lintel) settles it');
  ok(r.problems.length === 2, 'two findings left: the room and the door', r.problems.map((p) => p.code));

  console.log('== BK.20 a pipe through a wall, a column in a wall (found with the clash engine)');
  const L1 = snap0.levels[0].guid;
  // a 2 in steel pipe at 1200 above the floor from x 3000 to 7000 along y = 1500: it crosses the partition (x 4950..5050, solid there:
  // its only door is between y 3500 and 4414)
  B.ed.modelChange(MEP.placeRun({ storey: L1, kind: 'pipe', system: 'cw', mat: 'steel', cls: '40', size: '2', points: [[3000, 1500, 1200], [7000, 1500, 1200]] }));
  // a column standing in the south wall at x = 8500 (the wall is 300 thick about y = 0)
  B.ed.modelChange(COL.placeColumns({ storey: L1, points: [[8500, 0]] }));
  B = await reopen(B);
  r = run(B, {});
  const pen = r.problems.filter((p) => p.code === 'iface.penetration');
  ok(pen.length === 1 && pen[0].part === 'architecture|plumbing' && /crosses .* with no opening or sleeve\.$/.test(pen[0].text) && pen[0].about.length === 2, 'the pipe crossing the partition with no opening is one penetration, pair architecture | plumbing', pen.map((p) => p.text + ' ' + p.part));
  const cl = r.problems.filter((p) => p.code === 'audit.clash');
  ok(cl.length >= 1 && cl.every((p) => p.part === 'architecture|structure') && cl.some((p) => /Exterior masonry/.test(p.text)), 'the column in the south wall is a clash architecture | structure', cl.map((p) => p.text));
  ok(sum(r, 'clashes').checked > 0 && !sum(r, 'clashes').stopped, 'the clash check ran to its end');
  r = run(B, { sets: ['clashes'] });
  ok(r.problems.filter((p) => p.code === 'audit.clash').length === cl.length + 1 && r.summary.length === 1, 'with the interface rules off the crossing is still reported, as a clash');
  r = run(B, { sets: ['rooms', 'tags'] });
  ok(r.problems.length === 2 && r.summary.map((x) => x.set).join() === 'rooms,tags', 'only the rule sets asked for run');

  console.log('== BK.64 / BK.49 the verification state in the IFC');
  const walls = OPS.snapshotModel(B.ed).walls, wg = walls.map((x) => x.guid);
  ok(VM.readVerification(B.w()).length === 0 && VM.verificationList(B.w()).every((x) => x.record === null), 'a model drawn by hand carries no mark');
  B.ed.modelChange(VM.setVerificationOp([wg[0], wg[1]], 'unverified', { source: 'pdf', note: 'plan.pdf' }));
  let key = null;
  try { B.ed.modelChange(VM.setVerificationOp([wg[0]], 'checked', { by: '', on: today })); } catch (e) { key = e.key; }
  ok(key === 'verify.err.by', 'checked with no name is refused (verify.err.by) and nothing changes');
  key = null; try { B.ed.modelChange(VM.setVerificationOp([wg[0]], 'field-verified', { by: 'Ann', on: today })); } catch (e) { key = e.key; }
  ok(key === 'verify.err.method' && VM.recordOf(B.w(), walls[0].id).state === 'unverified', 'field-verified with no method is refused; the wall is still unverified');
  key = null; try { B.ed.modelChange(VM.setVerificationOp(['nope'], 'checked', { by: 'Ann', on: today })); } catch (e) { key = e.key; }
  ok(key === 'model.err.gone', 'an element that is not there is refused');
  const n0 = B.ed.changes.length;
  B.ed.modelChange(VM.setVerificationOp([wg[0]], 'checked', { by: 'Ann Lee', on: today }));
  B.ed.modelChange(VM.setVerificationOp([wg[1], wg[2]], 'field-verified', { by: 'Ann Lee', on: today, method: 'tape', note: 'north side' }));
  ok(B.ed.changes.length === n0 + 2, 'each change is one undo step, for one element or several');
  const rec = (i) => VM.recordOf(B.w(), walls[i].id);
  ok(rec(0).state === 'checked' && rec(0).source === 'pdf' && rec(1).state === 'field-verified' && rec(1).method === 'tape' && rec(1).source === 'pdf' && rec(2).source === '' && rec(3) === null, 'wall 1 checked (its PDF source kept), walls 2 and 3 field-verified by tape, wall 4 untouched');
  const ps = B.w().readPset(walls[1].id, V.VERIFY_PSET);
  ok(ps.State === 'field-verified' && ps.By === 'Ann Lee' && ps.On === today && ps.Method === 'tape' && ps.LevelOfDevelopment === 'LOD 500' && ps.Note === 'north side', 'in the IFC: CadCraft_Verification with State, By, On, Method, Note and LevelOfDevelopment LOD 500');
  // close-out asks LOD 500: walls 2 and 3 are field-verified (500) → pass; the 5 doors and windows (200) are below; untagged: the other
  // 3 walls + 2 floors + 2 ceilings + roof = 8
  r = run(B, { stage: 'close-out', stageName: 'Close-out', sets: ['lod'] });
  ok(sum(r, 'lod').required === 500 && sum(r, 'lod').below === 5 && sum(r, 'lod').untagged === 8, 'at Close-out (LOD 500) the two field-verified walls pass; 5 below, 8 untagged', sum(r, 'lod'));
  B.ed.undo();
  ok(rec(1).state === 'unverified' && rec(2) === null, 'undo puts walls 2 and 3 back (unverified, no mark)');
  B.ed.redo();
  ok(rec(1).state === 'field-verified' && rec(2).state === 'field-verified', 'redo marks them again');
  B.ed.modelChange(VM.setVerificationOp([wg[0]], '', {}));
  ok(rec(0) === null && VM.readVerification(B.w()).length === 2, 'taking the mark off leaves no record');

  console.log('== BK.49 the as-built statement, the package parts, save and reopen');
  const res = B.ed.modelChange(VM.asBuiltOp({ by: 'Ann Lee', on: today }));
  // elements and rooms in the house now: 5 walls, 2 doors, 3 windows, 2 floor slabs, 2 ceilings, the roof with its 4 planes + 1 member +
  // 1 covering, 2 rooms = 23; plus the pipe run and the column added above
  const all = VM.verificationList(B.w());
  const st = VM.readAsBuilt(B.w());
  ok(st.format === 'cadcraft-as-built 1' && st.elements === all.length && st.fieldVerified === 2 && st.checked === 0 && st.unverified === 0 && st.notStated === all.length - 2 && st.by === 'Ann Lee' && st.date === today, 'the project states: as built, by whom and when, ' + all.length + ' elements, 2 field-verified, the rest not stated', st);
  ok(all.length >= 25 && all.filter((x) => /^IfcWall/.test(x.cls)).length === 5 && all.filter((x) => x.cls === 'IfcSpace').length === 2, 'the list holds every element and room (5 walls, 2 rooms, the pipe and the column among them)', all.length);
  const tt = (k, v) => k + (v ? ' ' + JSON.stringify(v) : '');
  const parts = ASB.asBuiltParts(B.w(), { by: 'Ann Lee', on: today, t: tt, drawings: { bytes: new Uint8Array([37, 80, 68, 70]), sheets: 6 }, history: null });
  ok(parts.entries.map((e) => e.name).join() === 'as-built/as-built-statement.md,as-built/verified-elements.csv,as-built/as-built-drawings.pdf' && parts.summary.fieldVerified === 2, 'the as-built part: statement, verified elements, the drawing set (no issue history in this model: none added)');
  const csv = new TextDecoder().decode(parts.entries[1].data).split('\r\n');
  ok(csv.length === all.length + 2 && csv.filter((l) => /,field-verified,Ann Lee,2026-11-11,tape,/.test(l)).length === 2, 'verified-elements.csv: one row per element, the two walls with who, when and how');
  const hist = { format: 'cadcraft-issues', version: 1, issues: [{ id: 'i1', code: 'A', purpose: 'construction', name: '', date: today, by: 'Ann', note: '', app: 'bimcraft', stage: '', sheets: [{ id: 's1', number: 'A-101', title: 'Plan', rev: 'A', hash: 'x', state: 'first', scope: null }], elements: 0, snapshot: null }], records: [] };
  ok(ASB.asBuiltParts(B.w(), { t: tt, history: hist }).entries.map((e) => e.name).slice(2).join() === 'as-built/issue-history.md,as-built/issue-history.json', 'a model with issued sets: the drawing changelog (the shared issue history) rides along; no drawings, none listed');
  const saved = B.ed.save();
  const pkg = HD.handoverPackage({ docs: [], base: 'house', ifc: saved, ifcName: ASB.asBuiltName('house.ifc'), cobie: new Uint8Array([1]), index: 'x', csv: 'y', extra: parts.entries });
  ok(pkg.map((f) => f.name).join() === 'README.md,handover-documents.csv,house COBie.xlsx,house-as-built.ifc,as-built/as-built-statement.md,as-built/verified-elements.csv,as-built/as-built-drawings.pdf', 'the ONE handover package: cover, list, COBie, the as-built IFC and the as-built part', pkg.map((f) => f.name));
  ok(JSON.stringify(PK.packageEntries([{ name: '../a\\b/../c.txt', data: 'hi' }, null, { name: 'x.md', data: null }, { name: 'c.txt', data: new Uint8Array([1]) }, { name: 'C.TXT', data: 'z' }, { name: '', data: 'q' }]).map((f) => f.name + ':' + f.data.length)) === '["a/b/c.txt:2","c.txt:1","C (2).TXT:1"]', 'the shared packager: text encoded, no "..", null and nameless entries left out, a name used twice keeps both');
  ok(PK.packageFiles({ cover: 'c', comments: 'k', extra: [{ name: 'a/b.csv', data: new Uint8Array([1]) }] }).map((f) => f.name).join() === '00-cover.md,01-review-comments.csv,a_b.csv', 'the permit package goes through it and is what it was');
  const B2 = await T.open(saved);
  const again = VM.readVerification(B2.w());
  ok(again.length === 2 && again.every((x) => x.record.state === 'field-verified' && x.record.by === 'Ann Lee') && VM.readAsBuilt(B2.w()).fieldVerified === 2 && VM.lintelNote(B2.w(), OPS.snapshotModel(B2.ed).openings.find((o) => o.mark === 'W1').id) !== '', 'saved and opened again: the marks, the statement and the lintel note are in the file');

  console.log('== BK.64 plans become a starting model, marked unverified; rooms named from the page\'s text');
  const labels = PP.roomLabels([
    { s: 'KITCHEN', x: 100, y: 200, h: 12, rot: 0, w: 60 }, { s: 'BEDROOM', x: 300, y: 200, h: 12, rot: 0, w: 62 }, { s: '1', x: 366, y: 200, h: 12, rot: 0, w: 7 },
    { s: '3600', x: 120, y: 20, h: 8, rot: 0, w: 30 }, { s: '1:100', x: 400, y: 10, h: 8, rot: 0, w: 30 }, { s: 'A-101', x: 420, y: 10, h: 20, rot: 0, w: 60 }, { s: 'notes', x: 10, y: 300, h: 6, rot: Math.PI / 2, w: 30 }, { s: 'x', x: 1, y: 1, h: 5, rot: 0, w: 3 },
  ], { k: 10 });
  // KITCHEN: middle x = (100 + 30) * 10 = 1300, y = (200 + 12 * 0.35) * 10 = 2042; "BEDROOM" + "1" on one line, 4 pt apart (< 1.5 x 12) → one label
  ok(labels.length === 2 && JSON.stringify(labels.find((l) => l.name === 'KITCHEN').at) === '[1300,2042]' && labels.some((l) => l.name === 'BEDROOM 1') && !labels.some((l) => /3600|1:100|notes|^x$/.test(l.name)), 'labels from page text: KITCHEN at its middle, "BEDROOM" + "1" joined; a dimension, a scale, a sheet number (more digits than letters), turned text and one letter left out', labels);
  const text = N.newBuilding({ name: 'Traced', siteName: 'Site', levels: N.stackLevels(1, 3000, () => 'Ground floor'), fileName: 'traced.ifc', now: new Date('2026-11-11T12:00:00Z') });
  let P = await T.open(new TextEncoder().encode(text));
  const lv = OPS.snapshotModel(P.ed).levels[0].guid;
  // a 6000 x 4000 outline and a partition at x = 3000, a door in the south wall: 5 walls, 1 door, 2 rooms
  const rect = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
  const page = { level: lv, walls: [...rect.map((p, i) => ({ a: p, b: rect[(i + 1) % 4], t: 200 })), { a: [3000, 0], b: [3000, 4000], t: 100 }], openings: [{ wall: 0, kind: 'door', typeKey: 'door-single', offset: 1000, width: 900, face: 'left' }],
    typeKey: 'ext-2x6', height: 2700, underlay: null, source: 'pdf', roomNames: [{ name: 'KITCHEN', at: [1500, 2000] }, { name: 'BEDROOM 1', at: [4500, 2000] }, { name: 'A-101', at: [9000, 9000] }] };
  const made = P.ed.modelChange(TR.tracePages([page]));
  const recs = VM.readVerification(P.w());
  const by = (re) => recs.filter((x) => re.test(x.cls));
  ok(recs.length === 8 && by(/^IfcWall/).length === 5 && by(/^IfcDoor/).length === 1 && by(/^IfcSpace/).length === 2 && recs.every((x) => x.record.state === 'unverified' && x.record.source === 'pdf'), 'one undo step made 5 walls, 1 door and 2 rooms, all marked unverified, source PDF', recs.map((x) => x.cls + ':' + x.record.state));
  ok(made.rooms === 2 && made.roomsNamed === 2 && OPS.snapshotModel(P.ed).derived.spaces.map((x) => x.name).sort().join() === 'BEDROOM 1,KITCHEN', 'the two closed loops are rooms named from the text inside them (the sheet number outside both is not used)');
  r = run({ ed: P.ed, model: null }, { sets: ['verification', 'rooms'] });
  ok(codes(r)['audit.unverified'] === 8 && !codes(r)['audit.room.unnamed'] && /was recognised from a PDF and has not been checked by a person\.$/.test(r.problems[0].text), 'the audit lists the 8 unverified elements; the rooms have names of their own', r.problems[0]?.text);
  P.ed.modelChange(VM.setVerificationOp(by(/^IfcWall/).map((x) => x.guid), 'checked', { by: 'Ann', on: today }));
  r = run({ ed: P.ed, model: null }, { sets: ['verification'] });
  ok(codes(r)['audit.unverified'] === 3 && VM.readVerification(P.w()).filter((x) => x.record.state === 'checked' && x.record.source === 'pdf').length === 5, 'the 5 walls marked as checked in one step: 3 left unverified (the door and the rooms); checked walls keep "from a PDF"');
  P.ed.undo(); P.ed.undo();
  ok(OPS.snapshotModel(P.ed).walls.length === 0 && VM.readVerification(P.w()).length === 0, 'undo twice: the checks, then the whole traced page, are gone');
  // a traced DWG (traceDrawing) and a point cloud scan (scanChange) mark their walls too; a page with no text leaves the program's room names
  P.ed.modelChange(TR.traceDrawing({ storey: lv, walls: page.walls.slice(0, 4), typeKey: 'ext-2x6', height: 2700 }));
  let rr = VM.readVerification(P.w());
  ok(rr.length === 5 && rr.every((x) => x.record.source === 'drawing') && AB.autoRoomName(OPS.snapshotModel(P.ed).derived.spaces[0].name), 'a traced drawing: 4 walls and their room unverified (source drawing); no text, so the room keeps "Room 1"');
  P.ed.undo();
  P.ed.modelChange(SB.scanChange([{ kind: 'wall', id: 'w1', a: [0, 0], b: [5000, 0] }, { kind: 'wall', id: 'w2', a: [5000, 0], b: [5000, 4000] }, { kind: 'wall', id: 'w3', a: [5000, 4000], b: [0, 4000] }, { kind: 'wall', id: 'w4', a: [0, 4000], b: [0, 0] }, { kind: 'door', wall: 'w1', offset: 1000, width: 900 }], { storey: lv }));
  rr = VM.readVerification(P.w());
  ok(rr.length === 6 && rr.every((x) => x.record.state === 'unverified' && x.record.source === 'pointcloud'), 'walls and a door accepted from a scan: 4 walls, 1 door and the room unverified (source point cloud)', rr.map((x) => x.cls));

  console.log('== BK.49 the scan compare: what matches within tolerance');
  ok(JSON.stringify(SP.matchedKeys({ ok: true, rows: [{ key: 1, state: 'built', dev: 'ok' }, { key: 2, state: 'built', dev: 'near' }, { key: 3, state: 'partly', dev: 'ok' }, { key: 4, state: 'missing', dev: null }, { key: 5, state: 'built', dev: 'ok' }] })) === '[1,5]' && SP.matchedKeys(null).length === 0, 'only elements the scan saw as built AND within tolerance (keys 1 and 5) are offered for field-verified');
  return T.done();
}

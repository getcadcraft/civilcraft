/* SPDX-License-Identifier: Apache-2.0 */
/**
 * issue-set-test.mjs: issued sets and what changed since (BK.46, BK.48; session bk-r3-stages-10), DOM-free:
 *   node bin/test-bimcraft.mjs --issues
 * A real two-level model: sheets, an issue recorded in the IFC, save and reopen, edits, "changes since" per sheet and per element
 * checked against ifc-compare.js on the saved copy of the model as issued (an independent oracle), a second issue, the changelog,
 * records, removal, an older file, and another IFC reader's schema validation.
 */
import path from 'node:path';
import fs from 'node:fs';

export async function issuesMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const IS = await import(path.join(APP, 'issue-set.js'));
  const H = await import(path.join(APP, 'issuelog/history.js'));
  const V = await import(path.join(APP, 'views-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const CMP = await import(path.join(APP, 'ifc-compare.js'));
  const { propertyIndex } = await import(path.join(APP, 'ifc-props.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));

  // an editor with its drawn model and index, as the page has them after every edit (the page rebuilds; here: save and load)
  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); const model = await quiet((b) => eng.load(b))(bytes); const ed = new IfcEditor(WebIFC, eng); return { ed, model, ix: propertyIndex(WebIFC, ed.api, ed.mid, model), bytes }; };
  const again = (S) => boot(S.ed.save());
  const W = (S) => new ModelWriter(WebIFC, S.ed.api, S.ed.mid);
  const prints = (S) => IS.elementPrints({ ix: S.ix, model: S.model, w: W(S) });

  console.log('== a model: two levels, walls, a door, four sheets');
  let S = await boot(new TextEncoder().encode(N.newBuilding({ name: 'Issue house', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'issue.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  ok(H.cleanHistory(IS.readIssues(W(S))).issues.length === 0 && W(S).readPset(S.ed.api.GetLineIDsWithType(S.ed.mid, WebIFC.IFCPROJECT).get(0), IS.ISSUES_PSET) === null, 'a file with no issues reads as an empty history; reading writes nothing');
  const [L1, L2] = OPS.snapshotModel(S.ed).levels;
  S.ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [6000, 0] }, { a: [0, 4000], b: [6000, 4000] }], typeKey: 'ext-2x6', height: 2700 }));
  S.ed.modelChange(OPS.drawWalls({ storey: L2.guid, segs: [{ a: [0, 0], b: [6000, 0] }], typeKey: 'ext-2x6', height: 2700 }));
  let snap = OPS.snapshotModel(S.ed);
  const wallA = snap.walls.find((w) => w.storey === L1.id && Math.abs(w.a[1]) < 1), wallB = snap.walls.find((w) => w.storey === L1.id && Math.abs(w.a[1] - 4000) < 1), wallC = snap.walls.find((w) => w.storey === L2.id);
  S.ed.modelChange(OPS.placeOpening({ wall: wallA.guid, typeKey: 'door-single', offset: 1000, face: 'left' }));
  for (const s of V.readSheets(W(S))) S.ed.modelChange(V.deleteSheet(s.id));
  const mk = (number, title, views) => S.ed.modelChange(V.saveSheet({ number, title, paper: 'a3', views })).sheet;
  const s101 = mk('A-101', 'Level 1 plan', [{ kind: 'plan', ref: L1.guid, x: 200, y: 150, ratio: 100 }]);
  const s102 = mk('A-102', 'Level 2 plan', [{ kind: 'plan', ref: L2.guid, x: 200, y: 150, ratio: 100 }]);
  const s201 = mk('A-201', 'Elevations', [{ kind: 'elevation', ref: 'north', x: 200, y: 150, ratio: 100 }]);
  const s601 = mk('A-601', 'Door schedule', [{ kind: 'schedule', ref: 'doors', x: 200, y: 150, ratio: 0 }]);
  S = await again(S);
  const issuedBytes = S.bytes;   // the model as issued (what "Also save a copy of the model as issued" writes)
  let P0 = prints(S);
  const cls = (P, c) => [...P.values()].filter((e) => e.c === c).length;
  ok(cls(P0, 'IfcWall') + cls(P0, 'IfcWallStandardCase') === 3 && cls(P0, 'IfcDoor') === 1, 'prints: three walls and one door', [...P0.values()].map((e) => e.c));
  ok(P0.get(wallA.guid)?.s === L1.guid && P0.get(wallC.guid)?.s === L2.guid, 'each wall is printed with its own level');
  const doorGuid = [...P0].find(([, e]) => e.c === 'IfcDoor')[0];
  ok(P0.get(doorGuid).s === L1.guid, 'the door is on Level 1, with its wall');
  const lv = { levels: OPS.snapshotModel(S.ed).levels, callouts: [] };
  const sc = (id) => IS.sheetScope(V.readSheets(W(S)).find((s) => s.id === id), lv);
  ok(JSON.stringify(sc(s101)) === JSON.stringify({ all: false, storeys: [L1.guid], classes: [] }) && sc(s201).all === true && JSON.stringify(sc(s601)) === JSON.stringify({ all: false, storeys: [], classes: ['IfcDoor'] }), 'a plan shows its level, an elevation the whole model, the door schedule the doors');
  ok(JSON.stringify(IS.sheetsNow(W(S), P0).map((s) => s.hash)) === JSON.stringify(IS.sheetsNow(W(S), prints(S)).map((s) => s.hash)), 'the same model prints the same twice');

  console.log('== issue A: a submission of all four sheets');
  const iA = IS.planFor(W(S), P0, { id: 'iA', purpose: 'submission', name: 'Council', date: '2026-03-02', by: 'DP', stage: 'submission', snapshot: { name: 'issue-A.ifc', bytes: issuedBytes.length, sha256: 'ab'.repeat(32) } });
  ok(iA.code === 'A' && iA.sheets.length === 4 && iA.sheets.every((s) => s.rev === 'A' && s.state === 'first') && iA.elements === 4 && iA.app === 'bimcraft' && iA.stage === 'submission', 'planned: code A, four sheets at revision A, first issue, four elements printed');
  S.ed.modelChange(IS.recordIssueOp(iA, P0), { label: 'Record issue A' });
  const rev = (id) => V.readSheets(W(S)).find((s) => s.id === id).fields.revision || '';
  ok(IS.readIssues(W(S)).issues.length === 1 && IS.readPrints(W(S), 'iA').size === 4 && [s101, s102, s201, s601].every((id) => rev(id) === 'A'), 'stored in the IFC; every issued sheet\'s title block says revision A');
  S.ed.undo();
  ok(IS.readIssues(W(S)).issues.length === 0 && rev(s101) === '', 'one undo takes the issue and the title block revisions back');
  S.ed.redo();
  ok(IS.readIssues(W(S)).issues.length === 1 && rev(s101) === 'A', 'redo records it again');
  try { IS.planFor(W(S), P0, { sheetIds: ['sheet-999'] }); ok(false, 'an issue with no sheet is refused'); } catch (e) { ok(e.key === 'issues.err.nosheets', 'an issue with no sheet is refused'); }
  S = await again(S);
  const back = IS.readIssues(W(S));
  ok(back.issues[0].id === 'iA' && back.issues[0].snapshot.name === 'issue-A.ifc' && back.issues[0].purpose === 'submission' && JSON.stringify([...IS.readPrints(W(S), 'iA')]) === JSON.stringify([...P0]), 'saved and opened again: the issue, its snapshot record and its prints read back the same');
  let ch = IS.changesFor(W(S), 'iA', prints(S));
  ok(JSON.stringify(ch.counts) === JSON.stringify({ same: 4, changed: 0, added: 0, removed: 0 }) && ch.elements.same === 4 && ch.elements.changed.length === 0, 'nothing edited: four sheets the same, four elements the same (writing the revision into the title block is not a change)', ch.counts);

  console.log('== edits after the issue: a Level 1 wall moved, a wall added on Level 2, a property set on the Level 2 wall');
  S.ed.modelChange(OPS.changeWall(wallB.guid, { a: [0, 5000], b: [6000, 5000] }));
  S.ed.modelChange(OPS.drawWalls({ storey: L2.guid, segs: [{ a: [0, 3000], b: [6000, 3000] }], typeKey: 'ext-2x6', height: 2700 }));
  { const w = W(S), id = w.byGuid(wallC.guid); w.run(() => w.upsertPset(id, 'Pset_WallCommon', [['FireRating', 'IFCLABEL', 'REI 60']])); }
  S = await again(S);
  const P1 = prints(S);
  const wallD = [...P1.keys()].find((g) => !P0.has(g));
  ch = IS.changesFor(W(S), 'iA', P1);
  const row = (id) => ch.sheets.find((s) => s.id === id);
  ok(ch.elements.added.length === 1 && ch.elements.added[0] === wallD && ch.elements.removed.length === 0, 'elements: one added (the new Level 2 wall), none removed');
  const chg = new Map(ch.elements.changed.map((c) => [c.guid, c]));
  ok(chg.get(wallB.guid)?.shape === true && chg.get(wallC.guid)?.props === true && !chg.has(wallA.guid) && !chg.has(doorGuid), 'changed: the moved wall (shape) and the Level 2 wall (properties); the other wall and the door are not', ch.elements.changed);
  // the oracle: ifc-compare.js on the copy of the model as issued against the model now
  const O = await boot(issuedBytes);
  const cmp = CMP.compareModels({ ix: O.ix, model: O.model, matrix: null }, { ix: S.ix, model: S.model, matrix: null });
  const guidB = (k) => S.ix.value('guid', k - S.ix.keyBase);
  ok(JSON.stringify(cmp.changed.map((c) => c.guid).sort()) === JSON.stringify([...chg.keys()].sort()) && JSON.stringify(cmp.added.map(guidB)) === JSON.stringify(ch.elements.added) && cmp.removed.length === 0, 'Compare on the saved copy of the issued model names the same changed and added elements', { compare: cmp.changed.map((c) => c.guid), prints: [...chg.keys()] });
  ok(cmp.changed.find((c) => c.guid === wallB.guid).moved > 0.9 && cmp.changed.find((c) => c.guid === wallC.guid).props.some((p) => /FireRating/.test(p.field) && p.after === 'REI 60'), 'and says how: the wall moved 1 m, FireRating became REI 60');
  ok(row(s101).state === 'changed' && JSON.stringify(row(s101).why) === '["elements"]' && JSON.stringify(row(s101).elements) === JSON.stringify({ added: [], removed: [], changed: [wallB.guid] }), 'A-101 (Level 1): changed by its elements, the moved wall only', row(s101));
  ok(row(s102).state === 'changed' && JSON.stringify(row(s102).elements) === JSON.stringify({ added: [wallD], removed: [], changed: [wallC.guid] }), 'A-102 (Level 2): the added wall and the wall whose property changed', row(s102).elements);
  ok(row(s201).state === 'changed' && row(s201).elements.added.length === 1 && row(s201).elements.changed.length === 2, 'A-201 (elevations, the whole model): one added, two changed');
  ok(row(s601).state === 'same' && row(s601).why.length === 0, 'A-601 (door schedule): the same, no door changed');
  ok(JSON.stringify(ch.counts) === JSON.stringify({ same: 1, changed: 3, added: 0, removed: 0 }), 'three sheets changed, one the same', ch.counts);

  console.log('== issue B: tender, three of the sheets');
  const iB = IS.planFor(W(S), P1, { id: 'iB', purpose: 'tender', date: '2026-05-11', sheetIds: [s101, s102, s601] });
  ok(iB.code === 'B' && JSON.stringify(iB.sheets.map((s) => s.number + ' ' + s.rev + ' ' + s.state)) === JSON.stringify(['A-101 B revised', 'A-102 B revised', 'A-601 A unchanged']), 'changed sheets take B, the door schedule stays A', iB.sheets.map((s) => s.number + ' ' + s.rev + ' ' + s.state));
  S.ed.modelChange(IS.recordIssueOp(iB, P1));
  ok(rev(s101) === 'B' && rev(s102) === 'B' && rev(s601) === 'A' && rev(s201) === 'A', 'title blocks: A-101 and A-102 say B; A-601 and A-201 (not in this issue) stay A');
  ok(JSON.stringify(IS.changesFor(W(S), 'iB', P1).counts) === JSON.stringify({ same: 3, changed: 0, added: 1, removed: 0 }), 'since B: its three sheets are the same; A-201 is listed as not in that issue');
  S.ed.modelChange(V.saveSheet({ ...V.readSheets(W(S)).find((s) => s.id === s201), title: 'Elevations north' }));
  const ch2 = IS.changesFor(W(S), 'iA', P1).sheets.find((s) => s.id === s201);
  ok(JSON.stringify(ch2.why) === '["sheet","elements"]' && ch2.title === 'Elevations north', 'a sheet given another title: changed by the sheet itself as well as its elements');
  S.ed.modelChange(V.deleteSheet(s601));
  ok(IS.changesFor(W(S), 'iB', P1).sheets.find((s) => s.id === s601).state === 'removed', 'a sheet deleted after the issue is told as removed');
  S.ed.undo();

  console.log('== records and the changelog');
  let h = IS.readIssues(W(S));
  h = H.putRecord(h, { id: 'r1', kind: 'instruction', issue: 'iB', ref: H.nextRef(h, 'instruction'), title: 'Move the wall on grid B 1 m north', date: '2026-06-01', status: 'open', sheets: ['A-101'], rev: 'B', elements: [wallB.guid] });
  h = H.putRecord(h, { id: 'r2', kind: 'linked-model', issue: 'iB', ref: H.nextRef(h, 'linked-model'), title: 'Steel fabricator\'s model', link: 'steel-shop.ifc', file: { name: 'steel-shop.ifc', bytes: 1234, sha256: 'cd'.repeat(32) }, status: 'approved-as-noted' });
  S.ed.modelChange(IS.setHistoryOp(h));
  S = await again(S);
  h = IS.readIssues(W(S));
  ok(h.records.length === 2 && h.records[0].ref === 'SI-001' && h.records[1].ref === 'LM-001' && h.records[1].file.sha256 === 'cd'.repeat(32) && h.records[0].elements[0] === wallB.guid, 'a site instruction and a linked model recorded against issue B survive save and reopen');
  const T = H.changelogTable(h);
  ok(JSON.stringify(T.rows) === JSON.stringify([['A-101', 'Level 1 plan', 'A', 'B', 'B'], ['A-102', 'Level 2 plan', 'A', 'B', 'B'], ['A-201', 'Elevations', 'A', '', 'A'], ['A-601', 'Door schedule', 'A', '(A)', 'A']]), 'the drawing changelog: sheet by issue', T.rows);
  ok(T.log.issues[1].records === 2 && T.log.issues[1].revised === 2 && T.log.issues[1].unchanged === 1, 'issue B: two revised, one unchanged, two records');
  ok(Object.keys(IS.allPrints(W(S))).sort().join() === 'iA,iB', 'both issues keep their element prints');

  console.log('== removing an issue; an import');
  S.ed.modelChange(IS.setHistoryOp(H.removeIssue(h, 'iA'), { dropPrints: ['iA'] }));
  ok(IS.readIssues(W(S)).issues.map((i) => i.id).join() === 'iB' && IS.readPrints(W(S), 'iA').size === 0 && IS.readPrints(W(S), 'iB').size === 5, 'issue A and its prints are gone; B stays with its five prints');
  S.ed.undo();
  ok(IS.readIssues(W(S)).issues.length === 2 && IS.readPrints(W(S), 'iA').size === 4, 'undo brings the issue and its prints back');
  const file = H.historyJson(IS.readIssues(W(S)), { prints: IS.allPrints(W(S)) });
  const E = await boot(new TextEncoder().encode(N.newBuilding({ name: 'Other', levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'o.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  const rd = H.readHistoryJson(file);
  const merged = H.mergeHistory(IS.readIssues(W(E)), rd.history); delete merged.added;
  E.ed.modelChange(IS.setHistoryOp(merged, { keepPrints: rd.prints }));
  ok(IS.readIssues(W(E)).issues.length === 2 && IS.readPrints(W(E), 'iB').size === 5, 'the exchange file read into another model brings the issues and their prints');

  // another IFC reader validates the file
  const saved = S.ed.save();
  ok(/CadCraft_Issues/.test(new TextDecoder().decode(saved)), 'the saved IFC holds the property set CadCraft_Issues');
  const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
  if (!py) console.log('  --   no venv with ifcopenshell: schema validation skipped');
  else {
    const { execFileSync } = await import('node:child_process');
    const os = await import('node:os');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-issues-'));
    const f = path.join(dir, 'issues.ifc'); fs.writeFileSync(f, saved);
    let out = '';
    try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), f], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || ''); }
    const res = out.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
    ok(res.length === 1 && res[0].errors === 0, 'another IFC reader (schema validation) finds no errors in the file' + (res[0]?.errors ? ': ' + res[0].first.slice(0, 3).join(' | ') : ''));
    let seen = '';
    try { seen = execFileSync(py, ['-I', '-c', 'import sys, json, ifcopenshell\nf = ifcopenshell.open(sys.argv[1])\np = [x for x in f.by_type("IfcPropertySet") if x.Name == "CadCraft_Issues"][0]\nh = [q for q in p.HasProperties if q.Name == "History"][0]\nprint(json.dumps([i["code"] for i in json.loads(h.NominalValue.wrappedValue)["issues"]]))', f], { encoding: 'utf8' }).trim(); } catch (e) { seen = String(e.message).slice(0, 200); }
    ok(seen === '["A", "B"]', 'and reads the history out of the property set: issues A and B', seen);
    fs.rmSync(dir, { recursive: true, force: true });
  }
  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}

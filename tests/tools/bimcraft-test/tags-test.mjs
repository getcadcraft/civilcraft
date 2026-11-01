/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --sx-tags` (0.8 SU.915 + SU.889, session sx-tags): tags into schedules and documents from the model.
 *   tags      definitions on IfcProject (CadCraft_TagDefs), values as CadCraft_Tags, BIM-FAM-MORE's kinds, pick lists, classes,
 *             bulk tagging as one undo step, rename, clear, saved IFC reopened, the property index / schedule reading them
 *   documents the template language (fields, loops, groups, quantities by type, tags), Markdown → blocks, PDF (pdftotext when
 *             installed) and DOCX (unzipped, document.xml read back), the built-in trade templates against a drawn model
 * Known answers: a drawn box of walls (8000 × 5000, 3000 high) with one door and one window.
 */
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

export async function sxTagsMode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { propertyIndex } = await import(path.join(APP, 'ifc-props.js'));
  const T = await import(path.join(APP, 'tags.js'));
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : '';
  let bad = 0, good = 0;
  const ok = (cond, label) => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const throwsKey = (fn) => { try { fn(); return ''; } catch (e) { return e.key || e.message; } };

  // ------------------------------------------------------------------ a drawn model
  const text = N.newBuilding({ name: 'Tags', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 't.ifc', now: new Date('2026-10-27T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  let snap = OPS.snapshotModel(ed);
  const [A, B] = snap.levels.map((l) => l.guid);
  const P = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
  ed.modelChange(OPS.drawWalls({ storey: A, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: B, extSide: 'right' }));
  ed.modelChange(OPS.drawWalls({ storey: A, segs: [{ a: [4000, 0], b: [4000, 5000] }], typeKey: 'int-2x4', topLevel: B }));
  snap = OPS.snapshotModel(ed);
  const south = snap.walls.find((w) => w.a[1] === 0 && w.b[1] === 0 && w.typeKey === 'ext-2x6');
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 1000, face: 'left' }));
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'win-double-hung', offset: 5500, face: 'right' }));
  snap = OPS.snapshotModel(ed);
  const wallGuids = snap.walls.map((w) => w.guid), door = snap.openings.find((o) => o.kind === 'door'), win = snap.openings.find((o) => o.kind === 'window');
  ok(wallGuids.length === 5 && door && win, 'drawn: five walls, a door, a window');
  const W = () => new ModelWriter(ed.W, ed.api, ed.mid);

  if (!only || only === 'tags') {
    console.log('== Definitions (readTagDefs, untrusted)');
    const r = T.readTagDefs({ tags: [
      { name: 'Finish', kind: 'text', values: ['Painted', 'Oak veneer', 'painted'], classes: ['IfcDoor', 'IfcWall'] },
      { name: 'FireRating', kind: 'integer', values: [0, 30, 60, '90'] },
      { name: 'Clear width', kind: 'length' },
      { name: 'Accessible', kind: 'yesno', values: [1] },
      { name: 'finish', kind: 'text' },                 // duplicate name (case-blind)
      { name: '1bad', kind: 'text' },                    // bad name
      { name: 'Weird', kind: 'colour', classes: ['door', 'IfcSlab'] },   // unknown kind → text, a bad class dropped
      'junk',
    ] });
    ok(T.TAG_KINDS === (await import(path.join(APP, 'family-model.js'))).PARAM_KINDS, 'the kinds ARE BIM-FAM-MORE\'s typed-parameter list (family-model.js PARAM_KINDS), not a copy');
    ok(r.defs.map((d) => d.name).join() === 'Finish,FireRating,Clear width,Accessible,Weird', 'kept five; dropped the duplicate, the bad name and junk');
    ok(r.defs[0].values.join('|') === 'Painted|Oak veneer', 'pick list deduplicated case-blind');
    ok(r.defs[1].values.join() === '0,30,60,90' && r.defs[1].values.every((v) => typeof v === 'number'), 'integer pick list as numbers');
    ok(r.defs[3].values.length === 0, 'Yes / No keeps no pick list');
    ok(r.defs[4].kind === 'text' && r.defs[4].classes.join() === 'IfcSlab', 'unknown kind read as text; a bad class dropped, IfcSlab kept');
    ok(r.errors.length >= 5, 'each dropped row said (' + r.errors.length + ' notes)');
    ok(T.readTagDefs('{not json').errors[0]?.key === 'sx.su915.err.json' && T.readTagDefs(null).errors.length === 0, 'broken JSON said; nothing stored is no error');

    console.log('== Values (checkValue)');
    const [fin, fire, cw, acc] = r.defs;
    ok(T.checkValue(fin, 'oak VENEER').value === 'Oak veneer', 'a pick-list value takes the list\'s spelling');
    ok(T.checkValue(fin, 'Lacquered').error?.key === 'sx.su915.err.notallowed', 'a value not on the list refused');
    ok(T.checkValue(fire, '60').value === 60 && T.checkValue(fire, 45).error?.key === 'sx.su915.err.notallowed', 'integer from text; 45 not allowed');
    ok(T.checkValue(cw, 'abc').error?.key === 'sx.su915.err.number' && T.checkValue(cw, '915,5').value === 915.5, 'a length must be a number (comma decimal taken)');
    ok(T.checkValue(acc, 'yes').value === 1 && T.checkValue(acc, false).value === 0 && T.checkValue(acc, 'maybe').ok === false, 'yes / no');
    ok(T.checkValue(fin, '').value === null && T.checkValue(fin, null).value === null, 'empty = clear the tag');
    ok(T.appliesTo(fin, 'IfcWallStandardCase') && T.appliesTo(fin, 'IFCDOOR') && !T.appliesTo(fin, 'IfcWindow') && T.appliesTo(fire, 'IfcWindow'), 'classes: IfcWall takes IfcWallStandardCase; no classes = every element');

    console.log('== Saved on IfcProject (one undo step)');
    const defs = r.defs.slice(0, 4);
    const n0 = ed.changes.length;
    ed.modelChange(T.saveDefsOp(defs), { label: 'Tags', verb: 'Saved' });
    ok(ed.changes.length === n0 + 1, 'one change in the list');
    let back = T.readProjectDefs(W());
    ok(back.length === 4 && back[0].name === 'Finish' && back[2].kind === 'length', 'read back from CadCraft_TagDefs on IfcProject');
    const ps = W().readPset(T.projectId(W()), T.TAGDEFS_PSET);
    ok(ps?.Format === T.TAGDEFS_FORMAT && JSON.parse(ps.Definitions).format === 'cadcraft-tagdefs', 'Definitions JSON + Format in the project\'s set');
    ok(throwsKey(() => T.saveDefsOp([{ name: '' }])) === 'sx.su915.err.name', 'a bad definition refuses the save');

    console.log('== Tag the selection (tagOp)');
    const all = [...wallGuids, door.guid, win.guid];
    const res = ed.modelChange(T.tagOp(all, { Finish: 'Painted', FireRating: 60 }), { label: 'Tags', verb: 'Tagged' });
    ok(res.counts.elements === 7, 'seven elements tagged (' + res.counts.elements + ')');
    ok(res.counts.skipped.length === 1 && res.counts.skipped[0].guid === win.guid && res.counts.skipped[0].tag === 'Finish', 'the window skipped for Finish (doors and walls only), still got FireRating');
    const w = W();
    const dId = w.byGuid(door.guid), winId = w.byGuid(win.guid), wall0 = w.byGuid(wallGuids[0]);
    ok(JSON.stringify(T.tagValues(w, dId, back)) === '{"Finish":"Painted","FireRating":60}', 'door: Finish Painted, FireRating 60');
    ok(JSON.stringify(T.tagValues(w, winId, back)) === '{"FireRating":60}', 'window: FireRating only');
    ed.modelChange(T.tagOp([door.guid], { 'Clear width': 864, Accessible: 'yes', Finish: 'oak veneer' }), { label: 'Door' });
    const dv = T.tagValues(W(), dId, back);
    ok(dv['Clear width'] === 864 && dv.Accessible === 1 && dv.Finish === 'Oak veneer', 'length (mm), yes/no and a changed value: ' + JSON.stringify(dv));
    const raw = W().readPset(dId, T.TAGS_PSET);
    ok(Math.abs(raw['Clear width'] - 864 / W().unitMm) < 1e-9, 'length written in the file\'s unit (IfcLengthMeasure)');
    ok(throwsKey(() => ed.modelChange(T.tagOp([door.guid], { Finish: 'Gold' }))) === 'sx.su915.err.notallowed', 'a value off the list refuses the whole change');
    ok(throwsKey(() => ed.modelChange(T.tagOp([door.guid], { Nope: 'x' }))) === 'sx.su915.err.nodef', 'an undefined tag refused');
    ok(throwsKey(() => ed.modelChange(T.tagOp([win.guid], { Finish: 'Painted' }))) === 'sx.su915.err.noneapply', 'no element takes the tag: refused, says why');
    ok(throwsKey(() => T.tagOp([], { Finish: 'Painted' })) === 'sx.su915.err.nosel', 'nothing selected refused');

    console.log('== Clear, undo, redo');
    ed.modelChange(T.tagOp([door.guid], { Accessible: null }), { label: 'Door' });
    ok(!('Accessible' in T.tagValues(W(), dId, back)), 'Accessible cleared from the door');
    ed.undo();
    ok(T.tagValues(W(), dId, back).Accessible === 1, 'undo puts it back');
    ed.redo();
    ok(!('Accessible' in T.tagValues(W(), dId, back)), 'redo clears it again');
    ed.modelChange(T.tagOp([win.guid], { FireRating: null }), { label: 'Window' });
    ok(W().readPset(winId, T.TAGS_PSET) === null, 'the last tag cleared: the window\'s CadCraft_Tags set is gone');

    console.log('== Rename a tag (values follow)');
    const defs2 = back.map((d) => (d.name === 'Finish' ? { ...d, name: 'Door finish' } : d));
    const rr = ed.modelChange(T.saveDefsOp(defs2, { renames: { Finish: 'Door finish' } }), { label: 'Tags' });
    back = T.readProjectDefs(W());
    ok(rr.renamed === 6 && T.tagValues(W(), dId, back)['Door finish'] === 'Oak veneer', 'renamed on six elements; the door reads "Door finish: Oak veneer"');
    ed.undo();
    back = T.readProjectDefs(W());
    ok(back[0].name === 'Finish' && T.tagValues(W(), dId, back).Finish === 'Oak veneer', 'one undo puts the name and the values back');

    console.log('== Saved and reopened');
    const bytes = ed.save();
    const e2 = await quiet(IfcModel.create)(WebIFC, null);
    const m2 = await quiet((x) => e2.load(x))(bytes);
    const ed2 = new IfcEditor(WebIFC, e2);
    const w2 = new ModelWriter(ed2.W, ed2.api, ed2.mid);
    const d2 = T.readProjectDefs(w2);
    const did2 = w2.byGuid(door.guid);
    ok(d2.length === 4 && T.tagValues(w2, did2, d2).Finish === 'Oak veneer' && T.tagValues(w2, did2, d2)['Clear width'] === 864, 'cc-ifc reopens the definitions and the door\'s tags');
    console.log('== Schedules read tags (property index)');
    const ix = propertyIndex(WebIFC, ed2.api, ed2.mid, m2);   // the index of a loaded model (the app rebuilds after an edit; here: reopened)
    const fF = T.tagField('Finish'), fR = T.tagField('FireRating');
    ok(ix.fields.some((f) => f.id === fF && f.group === 'CadCraft_Tags') && ix.fields.some((f) => f.id === fR && f.kind === 'number'), 'the index lists CadCraft_Tags.Finish (text) and FireRating (number)');
    const s1 = T.tagSchedule(ix, back, { columns: ['cls', fF, fR], groupBy: fF });
    ok(s1.groups.map((g) => g.value + ':' + g.rows.length).join() === 'Oak veneer:1,Painted:5,:1', 'grouped by Finish: Oak veneer 1, Painted 5, none 1 (the window) — ' + s1.groups.map((g) => g.value + ':' + g.rows.length).join());
    const s2 = T.tagSchedule(ix, back, { columns: ['name', fR], filters: [{ field: fR, op: 'gte', value: '60' }] });
    ok(s2.count === 6, 'filter FireRating ≥ 60: six (the window was cleared)');
    const s3 = T.tagSchedule(ix, back, { columns: ['name', T.tagField('Clear width')], classes: ['IfcDoor'], unitMm: w2.unitMm });
    ok(s3.count === 1 && s3.rows === undefined && s3.groups[0].rows[0].values[1] === 864 && s3.kinds[1] === 'length', 'doors only, Clear width back in mm (864)');
    const csv = T.scheduleCsv(s1, { label: (f) => f.replace(/^p:CadCraft_Tags\./, ''), groupLabel: () => 'Group' });
    ok(csv.split('\r\n')[0] === 'Group,cls,Finish,FireRating' && csv.split('\r\n').length === 9, 'CSV: a group column, seven rows');

    globalThis.__sxTagsBytes = bytes;
  }

  if (!only || only === 'docs') {
    const docs = await import(path.join(ROOT, 'tools/bimcraft-test/doc-test.mjs'));
    const r = await docs.docChecks({ APP, ROOT, WebIFC, IfcModel, quiet, ed, engine, wallGuids, door, win, ok, spawnSync, fs, os, path });
    void r;
  }
  console.log(bad ? `\n${good} ok, ${bad} FAILED` : `\nall ok (${good})`);
  return bad ? 1 : 0;
}

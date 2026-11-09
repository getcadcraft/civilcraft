#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-ifc-merge.mjs — DC.27 BimCraft IFC merge driver on models written by BimCraft's own editor (a base building; two people edit it
 * separately; the merge is opened again and checked). `node tools/cli/merge/test-ifc-merge.mjs`
 */
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mergeIfc, splitTop } from './ifc-merge.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const APP = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev');
const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
let good = 0, bad = 0;
const ok = (c, m) => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + m); };

const WebIFC = await imp('ifc/api.js');
const { IfcModel } = await imp('ifc-model.js');
const { IfcEditor } = await imp('ifc-edit.js');
const N = await imp('new-model.js');
const OPS = await imp('model-ops.js');
const quiet = (fn) => async (...a) => { const l = console.log, w = console.warn; console.log = console.warn = () => {}; try { return await fn(...a); } finally { console.log = l; console.warn = w; } };

const text = N.newBuilding({ name: 'Merge', levels: N.stackLevels(3, 3000, (i) => 'Level ' + (i + 1)), fileName: 'm.ifc', now: new Date('2026-11-05T12:00:00Z') });
async function editor(bytes) {
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(bytes);
  return new IfcEditor(WebIFC, engine);
}
const base = new TextEncoder().encode(text);
const room = (x0, y0, w, h) => { const P = [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]]; return P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })); };
const draw = (ed, level, segs) => ed.modelChange(OPS.drawWalls({ storey: OPS.snapshotModel(ed).levels[level].guid, segs, typeKey: 'ext-2x6' }));
const snap = (ed) => OPS.snapshotModel(ed);

// the base has one room on Level 1, saved; both people start from it
let e0 = await editor(base);
draw(e0, 0, room(0, 0, 6000, 4000));
const baseBytes = e0.save();
const nBase = snap(await editor(baseBytes)).walls.length;

console.log('== two people add different walls to the same level');
const eo = await editor(baseBytes); draw(eo, 0, room(10000, 0, 4000, 4000));
const et = await editor(baseBytes); draw(et, 0, room(0, 10000, 5000, 3000));
const oursBytes = eo.save(), theirsBytes = et.save();
let r = await mergeIfc(baseBytes, oursBytes, theirsBytes);
ok(r.code === 0, 'merged cleanly (the shared storey relation did not conflict): ' + r.conflicts.map((c) => c.path + ' ' + c.why).join(' | '));
let em = await editor(r.bytes), sm = snap(em);
ok(sm.walls.length === nBase + 8, `${sm.walls.length} walls = base ${nBase} + 4 of ours + 4 of theirs`);
ok(new Set(sm.walls.map((w) => w.guid)).size === sm.walls.length, 'every wall once');
ok(r.bytes.length > 0 && Buffer.from(r.bytes).toString('latin1').startsWith(Buffer.from(oursBytes).toString('latin1').slice(0, 200)), 'our header kept');

console.log('== merging is symmetric and with itself is a no-op');
const r2 = await mergeIfc(baseBytes, theirsBytes, oursBytes);
ok(r2.code === 0 && snap(await editor(r2.bytes)).walls.length === nBase + 8, 'theirs-as-ours gives the same walls');
const self = await mergeIfc(baseBytes, oursBytes, oursBytes);
ok(self.code === 0 && snap(await editor(self.bytes)).walls.length === snap(eo).walls.length, 'ours with ours: nothing changes');
const none = await mergeIfc(baseBytes, oursBytes, baseBytes);
ok(none.code === 0 && snap(await editor(none.bytes)).walls.length === snap(eo).walls.length, 'theirs unchanged: ours as it is');

console.log('== a level renamed on each side');
const ea = await editor(baseBytes), eb = await editor(baseBytes);
const L = snap(ea).levels;
ea.modelChange(OPS.changeLevel(L[1].guid, { name: 'Mezzanine' }));
eb.modelChange(OPS.changeLevel(L[2].guid, { name: 'Roof level' }));
r = await mergeIfc(baseBytes, ea.save(), eb.save());
sm = snap(await editor(r.bytes));
ok(r.code === 0 && sm.levels.map((l) => l.name).join() === 'Level 1,Mezzanine,Roof level', 'different levels renamed: both names kept (' + sm.levels.map((l) => l.name) + ')');
const ec = await editor(baseBytes), ed2 = await editor(baseBytes);
ec.modelChange(OPS.changeLevel(L[1].guid, { name: 'Upper A' }));
ed2.modelChange(OPS.changeLevel(L[1].guid, { name: 'Upper B' }));
r = await mergeIfc(baseBytes, ec.save(), ed2.save());
sm = snap(await editor(r.bytes));
ok(r.code === 1 && r.conflicts.some((c) => /Name/.test(c.path)) && sm.levels[1].name === 'Upper A', 'the same level renamed two ways: a conflict on Name, ours kept: ' + r.conflicts.map((c) => c.path));
const same = await editor(baseBytes); same.modelChange(OPS.changeLevel(L[1].guid, { name: 'Upper A' }));
ok((await mergeIfc(baseBytes, ec.save(), same.save())).code === 0, 'the same rename on both sides: no conflict');

console.log('== a wall moved on one side, another drawn on the other');
const em1 = await editor(baseBytes), em2 = await editor(baseBytes);
const w0 = snap(em1).walls[0];
em1.modelChange(OPS.changeWall(w0.guid, { a: [w0.a[0], w0.a[1] + 500], b: [w0.b[0], w0.b[1] + 500] }));
draw(em2, 1, room(0, 0, 3000, 3000));
r = await mergeIfc(baseBytes, em1.save(), em2.save());
sm = snap(await editor(r.bytes));
ok(r.code === 0 && sm.walls.length === nBase + 4, 'merged cleanly, ' + sm.walls.length + ' walls; ' + r.conflicts.map((c) => c.path));
ok(sm.walls.find((w) => w.guid === w0.guid).a[1] === w0.a[1] + 500, 'the moved wall stays moved');

console.log('== a wall deleted on one side, unchanged on the other; deleted vs changed');
const ex1 = await editor(baseBytes), ex2 = await editor(baseBytes);
const victim = snap(ex1).walls[1];
ex1.modelChange(OPS.removeWalls([victim.guid]));
draw(ex2, 0, room(20000, 0, 3000, 3000));
r = await mergeIfc(baseBytes, ex1.save(), ex2.save());
sm = snap(await editor(r.bytes));
ok(r.code === 0 && !sm.walls.some((w) => w.guid === victim.guid) && sm.walls.length === nBase - 1 + 4, 'removed wall is gone, theirs added: ' + sm.walls.length + ' walls; ' + r.conflicts.map((c) => c.kind + ' ' + c.path + ' ' + c.why).join(' / '));
const ey1 = await editor(baseBytes), ey2 = await editor(baseBytes);
ey1.modelChange(OPS.removeWalls([victim.guid]));
ey2.modelChange(OPS.changeWall(victim.guid, { a: [victim.a[0] + 300, victim.a[1]], b: victim.b }));
r = await mergeIfc(baseBytes, ey1.save(), ey2.save());
ok(r.code === 1 && r.conflicts.some((c) => c.kind === 'removed-vs-changed'), 'removed on ours, changed on theirs: reported');
r = await mergeIfc(baseBytes, ey2.save(), ey1.save());
sm = snap(await editor(r.bytes));
ok(r.code === 1 && !sm.walls.some((w) => w.guid === victim.guid), 'changed on ours, removed on theirs: removed and reported');

console.log('== the command line (git merge driver shape)');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ifcmerge-'));
fs.writeFileSync(path.join(dir, 'b.ifc'), baseBytes); fs.writeFileSync(path.join(dir, 'o.ifc'), oursBytes); fs.writeFileSync(path.join(dir, 't.ifc'), theirsBytes);
const cli = spawnSync('node', [path.join(ROOT, 'tools/cli/merge.mjs'), path.join(dir, 'b.ifc'), path.join(dir, 'o.ifc'), path.join(dir, 't.ifc')], { encoding: 'utf8' });
ok(cli.status === 0 && /merged cleanly/.test(cli.stdout), 'node tools/cli/merge.mjs: exit 0, ' + cli.stdout.trim().split('\n')[0]);
ok(snap(await editor(new Uint8Array(fs.readFileSync(path.join(dir, 'o.ifc'))))).walls.length === nBase + 8, 'the file written over ours has all the walls');
fs.rmSync(dir, { recursive: true, force: true });

console.log('== refusals');
ok((await mergeIfc(baseBytes, new TextEncoder().encode('hello'), theirsBytes)).code === 2, 'not an IFC file: could not run');
console.log(`\n${good} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);

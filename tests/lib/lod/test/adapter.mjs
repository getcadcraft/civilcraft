// SPDX-License-Identifier: Apache-2.0
/**
 * adapter.mjs: the LOD framework on a real IFC model without a page (0.10 BK.13, BK.14, BK.17, BK.150, BK.151; session bim-lod-10).
 *   nice -n 10 timeout 300 node lib/lod/test/adapter.mjs
 * The model is THE small house (fixtures/bimcraft/small-house.ifc: 5 walls, 2 doors, 3 windows, 2 rooms, 2 floors, 2 ceilings, 1 roof),
 * changed through BimCraft's own ops; every expected value is worked out by hand in the comment beside it. It boots the same engine as
 * bin/test-bimcraft.mjs (cc-ifc, no web-ifc).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { register } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const APP = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev');
if (fs.existsSync(path.join(APP, 'lang/en.json'))) (await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
register('data:text/javascript,' + encodeURIComponent(`import { pathToFileURL } from 'node:url';
export async function resolve(spec, ctx, next) {
  if (spec === 'manifold-3d') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js')).href)}, shortCircuit: true };
  if (spec === 'proj4') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/proj4/current/proj4.esm.min.js')).href)}, shortCircuit: true };
  if (spec === 'delaunator') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/delaunator/current/index.js')).href)}, shortCircuit: true };
  if (spec === 'robust-predicates') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/robust-predicates/current/index.js')).href)}, shortCircuit: true };
  return next(spec, ctx);
}`), import.meta.url);
const WebIFC = await import(path.join(APP, 'ifc/api.js'));
const { IfcModel } = await import(path.join(APP, 'ifc-model.js'));
const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
const LM = await import(path.join(APP, 'lod/lod-model.js'));
const MS = await import(path.join(APP, 'lod/milestones.js'));
const FX = await import(path.join(APP, 'lod/fixes.js'));
const { runAudit } = await import(path.join(APP, 'audit-bim.js'));
const quiet = (fn) => async (...a) => { const l = console.log, w = console.warn, i = console.info; console.log = console.warn = console.info = () => {}; try { return await fn(...a); } finally { console.log = l; console.warn = w; console.info = i; } };

let bad = 0, good = 0;
const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
const open = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); const model = await quiet((b) => eng.load(b))(bytes); const ed = new IfcEditor(WebIFC, eng); return { eng, model, ed, w: () => new ModelWriter(WebIFC, ed.api, ed.mid) }; };
const house = () => open(new Uint8Array(fs.readFileSync(path.join(ROOT, 'fixtures/bimcraft/small-house.ifc'))));
const list = (B) => LM.lodList(B.w(), { typeLods: LM.appTypeLods(B.ed) });
const by = (L, re) => L.filter((x) => re.test(x.cls));

console.log('== BK.13 every element answers LOD, IFC class and classification codes');
let B = await house();
let L = list(B);
const walls = by(L, /^IfcWall/), doors = by(L, /^IfcDoor/), wins = by(L, /^IfcWindow/);
ok(walls.length === 5 && doors.length === 2 && wins.length === 3, 'the house: 5 walls, 2 doors, 3 windows are in the list', [walls.length, doors.length, wins.length]);
ok(L.length >= 17 && L.every((x) => x.cls && x.guid), 'every element and room has a class and a GlobalId', L.length);
// starter doors and windows are generic kinds at LOD 200 (opening-types.js); the five walls' starter types carry no tag
ok(doors.concat(wins).every((x) => x.lod === 200 && x.lodFrom === 'type'), 'doors and windows read LOD 200 from their type');
ok(walls.every((x) => x.lod === null && x.lodFrom === ''), 'a wall with no tag anywhere has no LOD (nothing is guessed)');
ok(L.every((x) => Array.isArray(x.codes)) && L.every((x) => ['met', 'below', 'not-stated', 'no-lod'].includes(x.marks.geometry)), 'codes and three part marks are always there');
ok(!L.some((x) => x.record.lod !== null), 'a model nobody tagged has no CadCraft_LOD set at all');
const w0 = B.w();
ok(!w0.defNamed(walls[0].id, 'CadCraft_LOD'), 'no property set is written until a person sets something');

console.log('== BK.13 + BK.14 set the tag and the three parts, one undo step each');
const n0 = B.ed.changes.length;
B.ed.modelChange(LM.setLodOp([walls[0].guid, walls[1].guid], { lod: 300, parts: { geometry: 300, information: 200 } }));
ok(B.ed.changes.length === n0 + 1, 'two walls tagged in ONE undo step');
L = list(B);
let a = L.find((x) => x.guid === walls[0].guid);
ok(a.lod === 300 && a.lodFrom === 'element' && a.parts.geometry === 300 && a.parts.information === 200 && a.parts.documentation === null, 'own LOD 300, geometry 300, information 200, documentation not stated', a.parts);
ok(a.marks.geometry === 'met' && a.marks.information === 'below' && a.marks.documentation === 'not-stated', 'marks: geometry met, information below, documentation not stated', a.marks);
B = await open(B.ed.save()); L = list(B); a = L.find((x) => x.guid === walls[0].guid);
ok(a.lod === 300 && a.parts.information === 200, 'kept through save and reopen');
const ps = B.w().readPset(a.id, 'CadCraft_LOD');
ok(ps.LOD === 300 && ps.LODGeometry === 300 && ps.LODInformation === 200 && !('LODDocumentation' in ps), 'plain integers in CadCraft_LOD, only the set ones', ps);
B.ed.modelChange(LM.setLodOp([walls[0].guid], { parts: { information: null } }));
a = list(B).find((x) => x.guid === walls[0].guid);
ok(a.parts.information === null && a.parts.geometry === 300 && a.lod === 300, 'a part taken off leaves the others');
const c1 = B.ed.changes.length; B.ed.undo();
a = list(B).find((x) => x.guid === walls[0].guid);
ok(B.ed.changes.length === c1 - 1 && a.parts.information === 200, 'undo puts the part back');
B.ed.modelChange(LM.setLodOp([walls[0].guid], { lod: null, parts: { geometry: null, information: null, documentation: null } }));
ok(list(B).find((x) => x.guid === walls[0].guid).record.lod === null && list(B).find((x) => x.guid === walls[0].guid).lod === null, 'everything taken off: the element is untagged again');
let key = null; try { B.ed.modelChange(LM.setLodOp([walls[2].guid], { lod: 250 })); } catch (e) { key = e.key; }
ok(key === 'lod.err.level', 'a number off the scale is refused', key);
key = null; try { B.ed.modelChange(LM.setLodOp(['nope'], { lod: 300 })); } catch (e) { key = e.key; }
ok(key === 'model.err.gone', 'an unknown element is refused', key);
// a field-verified element reads 500 whatever it says
const VM = await import(path.join(APP, 'verify-model.js'));
B.ed.modelChange(VM.setVerificationOp([walls[2].guid], 'field-verified', { by: 'Ann', on: '2026-11-13', method: 'tape' }));
a = list(B).find((x) => x.guid === walls[2].guid);
ok(a.lod === 500 && a.lodFrom === 'verified', 'field-verified reads LOD 500');

console.log('== BK.17 + BK.150 the milestone check on the house');
B = await house(); L = list(B);
B.ed.modelChange(LM.setLodOp([walls[0].guid, walls[1].guid, walls[2].guid], { lod: 300 }));
L = list(B);
// starter table at DD: walls 300, doors 300, windows 300, floors/slabs 300, roofs 300, ceilings (IfcCovering) 200.
// Walls 0-2 are LOD 300: reached. Walls 3, 4 have no tag: untagged. Doors/windows are LOD 200 < 300: 5 not reached.
const chk = MS.milestoneCheck(LM.milestoneElements(L), MS.STARTER_TABLE, 'dd');
const cnt = (cls) => chk.results.filter((r) => new RegExp('^' + cls).test(r.cls));
ok(cnt('IfcWall').filter((r) => r.state === 'reached').length === 3 && cnt('IfcWall').filter((r) => r.state === 'untagged').length === 2, 'walls at DD: 3 reached, 2 untagged', cnt('IfcWall').map((r) => r.state));
ok(cnt('IfcDoor').concat(cnt('IfcWindow')).every((r) => r.state === 'not-reached' && r.required === 300 && r.lod === 200), 'the 5 doors and windows (LOD 200) have not reached DD (300)');
ok(chk.totals.notReached >= 5 && chk.totals.reached >= 3, 'totals add up', chk.totals);
const probs = MS.milestoneProblems(chk);
ok(probs.filter((p) => p.code === 'lod.below').length === chk.totals.notReached && probs.every((p) => p.severity !== 'error'), 'one warning per element below, none an error');
// the same model at SD asks 200 of doors and windows: they reach it
const sd = MS.milestoneCheck(LM.milestoneElements(L), MS.STARTER_TABLE, 'sd');
ok(sd.results.filter((r) => /^IfcDoor|^IfcWindow/.test(r.cls)).every((r) => r.state === 'reached'), 'at SD (200) the doors and windows reach it');
// the audit sets BK.65 and this check agree on what a door is
const au = runAudit({ ed: B.ed, model: B.model, stage: 'submission', stageName: 'Submission', sets: ['lod'] });
ok(au.summary[0].below === 5, 'the existing audit (stage Submission 300) also finds the same 5 doors and windows below', au.summary[0]);

console.log('== BK.151 the fix lists');
B = await house();
const rt = LM.roomsAndTags(B.ed);
ok(rt.rooms.length === 2 && FX.roomNameFixes(rt.rooms, { isAutoName: () => false }).length === 0, 'the house: 2 rooms, both named, nothing to fix');
const kinds = new Map(rt.tagged.map((x) => [x.id, x.kind]));
const dg = rt.tagged.find((x) => x.kind === 'door');
// take one door's mark and one room's name away through the page's own ops, then ask for the fix list
B.ed.modelChange((ed) => new ModelWriter(ed.W, ed.api, ed.mid).run((w) => { const id = w.byGuid(dg.id); const l = w.touch(id); l.Tag = null; w.write(l); return { id, ids: [id] }; }));   // a door with no mark
const rt2 = LM.roomsAndTags(B.ed);
const missing = rt2.tagged.filter((x) => !String(x.tag || '').trim());
ok(missing.length === 1 && missing[0].id === dg.id, 'one door has no mark now', missing);
const prop = FX.proposeTags(rt2.tagged);
// the other door is D1 or D2: the proposal continues the model\'s own pattern
ok(prop.length === 1 && /^D\d+$/.test(prop[0].tag) && !rt2.tagged.some((x) => x.tag === prop[0].tag), 'a mark is proposed that continues the pattern and is not in use', prop);
const n1 = B.ed.changes.length;
B.ed.modelChange(LM.applyFixesOp({ tags: [{ id: dg.id, kind: 'door', tag: prop[0].tag }], names: [] }));
ok(B.ed.changes.length === n1 + 1 && LM.roomsAndTags(B.ed).tagged.find((x) => x.id === dg.id).tag === prop[0].tag, 'applied in one undo step; the door has its mark');
const rid = rt.rooms[0].id;
B.ed.modelChange(LM.applyFixesOp({ tags: [], names: [{ id: rid, name: 'Hall' }, { id: rt.rooms[1].id, name: '  ' }] }));
const rt3 = LM.roomsAndTags(B.ed);
ok(rt3.rooms.find((r) => r.id === rid).name === 'Hall' && rt3.rooms.find((r) => r.id === rt.rooms[1].id).name === rt.rooms[1].name, 'a room named; a blank row changes nothing');
const au2 = runAudit({ ed: B.ed, model: B.model, sets: ['rooms', 'tags'] });
ok(au2.problems.length === 0, 'the audit finds nothing after the fixes', au2.problems.map((p) => p.code));
key = null; try { B.ed.modelChange(LM.applyFixesOp({ tags: [{ id: 'nope', kind: 'door', tag: 'D9' }] })); } catch (e) { key = e.message; }
ok(key !== null, 'an unknown element is refused');

console.log(`\n${good} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);

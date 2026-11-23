#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * adapter.test.mjs: the BimCraft adapter of lib/finishes on a real IFC model (0.10 BK.25-28, BK.130; session bim-finishes-10), DOM-free:
 *   node lib/finishes/test/adapter.test.mjs
 * A 5000 x 4000 room of 110 mm walls (centre lines), 2700 high, a door (900 x 2032 at 1000) in the south wall. Every expected value is worked out beside it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const APP = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev');
const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
const { register } = await import('node:module');
register('data:text/javascript,' + encodeURIComponent(`import { pathToFileURL } from 'node:url';
export async function resolve(spec, ctx, next) {
  if (spec === 'manifold-3d') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js')).href)}, shortCircuit: true };
  if (spec === 'proj4') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/proj4/current/proj4.esm.min.js')).href)}, shortCircuit: true };
  return next(spec, ctx);
}`), import.meta.url);
(await imp('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const WebIFC = await import(pathToFileURL(path.join(APP, 'ifc/api.js')).href);
const { IfcModel } = await imp('ifc-model.js');
const { IfcEditor } = await imp('ifc-edit.js');
const { ModelWriter } = await imp('model-write.js');
const OPS = await imp('model-ops.js'), MW = await imp('model-walls.js'), MO = await imp('model-openings.js'), N = await imp('new-model.js');
const F = await imp('finishes/wall-finishes.js');
const M = await import(pathToFileURL(path.join(APP, 'finishes/lib/model.js')).href);
const quiet = (fn) => async (...a) => { const l = console.log, w = console.warn, e = console.error; console.log = console.warn = console.error = () => {}; try { return await fn(...a); } finally { console.log = l; console.warn = w; console.error = e; } };

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
const throwsKey = (fn, re) => { try { fn(); return false; } catch (e) { return re.test(String(e.key || e.message)); } };

const U = await imp('ifc-util.js');
const eng = await quiet(IfcModel.create)(WebIFC, null);
await quiet((b) => eng.load(b))(new TextEncoder().encode(N.newBuilding({ name: 'Finishes', levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'fin.ifc', now: new Date('2026-11-13T12:00:00Z') })));
const ed = new IfcEditor(WebIFC, eng);
const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
const L1 = OPS.snapshotModel(ed).levels[0];
const walls = () => MW.readWalls(W());
const covers = () => { const w = W(); return F.COVERING_PSET && (w.api.GetLineIDsWithType(w.mid, WebIFC.IFCCOVERING).size ?? 0); };
const ownCov = () => { const w = W(), out = []; const l = w.api.GetLineIDsWithType(w.mid, WebIFC.IFCCOVERING); for (let i = 0; i < l.size(); i++) { const id = l.get(i); if (w.readPset(id, F.COVERING_PSET)) out.push(id); } return out; };

console.log('== a room of 110 walls; the wall stays raw');
ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [5000, 0] }, { a: [5000, 0], b: [5000, 4000] }, { a: [5000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }], typeKey: 'ext-2x6', height: 2700 }));
const south = walls()[0];
ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: MO.DOOR_TYPES[0].key, offset: 1000, width: 900, height: 2032 }));
const T0 = walls()[0].t;
const raw = F.wallRows(W());
const row = raw.walls.find((x) => x.guid === south.guid);
ok(raw.walls.length === 4 && raw.curved.length === 0 && row.height === 2700 && row.openings.length === 1 && row.openings[0].offset === 1000 && row.openings[0].width === 900 && row.openings[0].sill === 0 && row.openings[0].height === 2032, 'four walls read into the lib\'s rows; the door is at 1000, 900 wide, sill 0, 2032 high', row.openings);
const half = T0 / 2;
ok(near(row.extent.left[0], half, 1) && near(row.extent.left[1], 5000 - half, 1) && near(row.extent.right[0], -half, 1) && near(row.extent.right[1], 5000 + half, 1), 'the mitred corners: the inside (left) face of the south wall runs from t/2 to 5000 - t/2, the outside (right) face from -t/2 to 5000 + t/2', [row.extent, T0]);
ok(row.room.left !== null && row.room.right === null, 'the inside of the south wall faces the room; the outside faces none', row.room);
ok(F.readWallFinishes(W()).faces.length === 0 && ownCov().length === 0, 'no finishes yet: the walls are raw (nothing written)');

console.log('== BK.25 a finish layer on a wall face, BK.27 its substrates, BK.26 zones');
const PAINT = { id: 'paint', name: 'Paint on plaster', kind: 'paint', layers: [{ role: 'substrate', material: 'Plaster', thickness: 13 }, { role: 'finish', material: 'Paint', thickness: 0.2 }] };
const TILE = { id: 'tile', name: 'Wall tile 300', kind: 'tile', layers: [{ role: 'substrate', material: 'Cement board', thickness: 12.5 }, { role: 'waterproofing', material: 'Membrane', thickness: 1 }, { role: 'adhesive', material: 'Adhesive', thickness: 3 }, { role: 'finish', material: 'Tile', thickness: 8 }], tile: { length: 300, width: 300, joint: 0, waste: 10 } };
const info = F.wallFaceInfo(W(), south.guid, 'left');
const sh = M.zoneShower([3000, 4000], info.geom);
let n0 = ed.changes.length;
ed.modelChange(F.wallFinishOp((d) => M.withZone(M.withZone(M.withType(M.withType(d, PAINT), TILE), south.guid, 'left', { ...M.zoneFullHeight(), kind: 'full', type: 'paint', name: 'Wall' }), south.guid, 'left', { ...sh, type: 'tile', name: 'Shower', setout: { start: { kind: 'corner', corner: 'bl' }, direction: 'horizontal', pattern: 'grid' } })), { label: 'Wall finish' });
ok(ed.changes.length === n0 + 1, 'one undo step for the finishes and their IfcCoverings');
const doc = F.readWallFinishes(W());
ok(doc.types.length === 2 && doc.faces.length === 1 && doc.faces[0].zones.length === 2 && doc.types[1].layers[0].material === 'Cement board' && doc.faces[0].zones[1].setout.start.corner === 'bl', 'the document is in the file and reads back: two types (the tile keeps its substrate with material and thickness), one face, two zones, the shower\'s set-out');
const S = F.finishRows(W(), doc);
const base = S.rows.find((r) => r.zone === 'z1'), shower = S.rows.find((r) => r.zone === 'z2');
const inner = (5000 - T0) * 2700;
ok(near(base.gross, inner - 1000 * 2100, 5) && near(base.deductions, 900 * 2032, 1) && near(base.net, inner - 2100000 - 1828800, 5), 'paint: the inside face (5000 - t) x 2700, less the shower wall 1000 x 2100 laid over it, less the door 900 x 2032 = 1 828 800', [base.gross, base.net, inner]);
ok(shower.net === 2100000 && shower.tiles.whole === 21 && shower.tiles.cut === 7 && shower.tiles.order === Math.ceil(28 * 1.1) && shower.room === base.room, 'the shower wall 1000 x 2100: 21 whole + 7 cut 300 tiles, 31 to order, in the same room as the paint', shower.tiles);
ok(near(shower.thickness, 24.5) && near(shower.substrateVolume, 2100000 * 12.5), 'its build-up is 24.5 thick; the cement board volume is 2 100 000 x 12.5');

console.log('== the IfcCoverings (BK.130)');
const cov = ownCov();
ok(cov.length === 2, 'one IfcCovering per zone', cov.length);
const w = W();
const c1 = cov.map((id) => ({ id, ps: w.readPset(id, F.COVERING_PSET), line: w.api.GetLine(w.mid, id, false) }));
ok(c1.every((c) => /CLADDING/.test(String(c.line.PredefinedType?.value ?? c.line.PredefinedType))) && c1.map((c) => c.ps.Zone).sort().join() === 'z1,z2' && c1.every((c) => c.ps.Wall === south.guid && c.ps.Face === 'left'), 'both are CLADDING, named for their zone, wall and face');
const bbox = (id) => { const T = U.productTriangles(w.api, w.mid, id, w.unitMm); const p = T.positions || T.pos || T[0]; const b = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9, z0: 1e9, z1: -1e9 }; for (let i = 0; i < p.length; i += 3) { b.x0 = Math.min(b.x0, p[i]); b.x1 = Math.max(b.x1, p[i]); b.y0 = Math.min(b.y0, p[i + 1]); b.y1 = Math.max(b.y1, p[i + 1]); b.z0 = Math.min(b.z0, p[i + 2]); b.z1 = Math.max(b.z1, p[i + 2]); } return b; };
const shCov = c1.find((c) => c.ps.Zone === 'z2').id, bS = bbox(shCov);
ok(near(bS.x0, 3000, 1) && near(bS.x1, 4000, 1) && near(bS.y0, T0 / 2, 1) && near(bS.y1, T0 / 2 + 24.5, 1) && near(bS.z0, 0, 1) && near(bS.z1, 2100, 1), 'the shower wall\'s IfcCovering sits on the inside face of the south wall: x 3000..4000, y from t/2 to t/2 + 24.5 (into the room), z 0..2100', bS);
const txt = new TextDecoder().decode(ed.save());
ok(/IFCRELCOVERSBLDGELEMENTS\('[^']+',#\d+,\$,\$,#\d+,\(#\d+,#\d+\)\)/.test(txt) && (txt.match(/IFCCOVERING\(/g) || []).length === 2 && /Pset_CoveringCommon/.test(txt) && /Qto_CoveringBaseQuantities/.test(txt) && /IFCEXTRUDEDAREASOLID/.test(txt), 'the file: one IfcRelCoversBldgElements relating the wall to both coverings, with Pset_CoveringCommon, the quantities and extruded bodies');
const q = w.readPset(cov[0], 'Qto_CoveringBaseQuantities');
const eng2 = await quiet(IfcModel.create)(WebIFC, null);
await quiet((b) => eng2.load(b))(new TextEncoder().encode(txt));
const ed2 = new IfcEditor(WebIFC, eng2), W2 = new ModelWriter(WebIFC, ed2.api, ed2.mid);
ok(F.readWallFinishes(W2).faces[0].zones.length === 2 && F.finishRows(W2).rows.length === 2, 'saved and opened again: the document and its two rows are all there');

console.log('== the wall moves, swaps type, changes: the finishes stay (BK.25)');
const sig = () => ownCov().map((id) => W().readPset(id, F.COVERING_PSET).Signature).sort().join();
const before = sig();
ed.modelChange(OPS.changeWall(south.guid, { typeKey: 'ext-2x4' }));
const afterType = F.finishRows(W());
const T1 = walls()[0].t;
ok(T1 !== T0, 'the south wall is another thickness now', [T0, T1]);
const sh2 = afterType.rows.find((r) => r.zone === 'z2');
ok(sh2.net === 2100000 && afterType.rows.find((r) => r.zone === 'z1').room === base.room, 'after a type swap the shower wall is the same 2 100 000 and the paint is still in its room');
let sync = ed.modelChange(OPS.op((ww) => F.syncWallFinishCoverings(ww)), { label: 'sync' });
ok(ownCov().length === 2 && sig() !== before, 'the host\'s one line (syncWallFinishCoverings after a wall change) remakes the coverings for the new thickness: still 2, new signatures');
const bS2 = bbox(ownCov().find((id) => W().readPset(id, F.COVERING_PSET).Zone === 'z2'));
ok(near(bS2.y0, T1 / 2, 1) && near(bS2.y1, T1 / 2 + 24.5, 1) && near(bS2.x0, 3000, 1), 'and the covering follows the face: y from the new t/2', bS2);
const sigB = sig();
ed.modelChange(OPS.op((ww) => F.syncWallFinishCoverings(ww)), { label: 'sync again' });
ok(sig() === sigB && ownCov().length === 2, 'nothing changed since: a second sync keeps both coverings as they are');

ed.modelChange(OPS.changeWall(south.guid, { a: [0, 300], b: [5000, 300] }));
ed.modelChange(OPS.op((ww) => F.syncWallFinishCoverings(ww)), { label: 'sync' });
const moved = walls().find((x) => x.guid === south.guid);
const bS3 = bbox(ownCov().find((id) => W().readPset(id, F.COVERING_PSET).Zone === 'z2'));
const r3 = F.finishRows(W()).rows.find((r) => r.zone === 'z2');
ok(near(moved.a[1], 300) && near(bS3.y0, 300 + T1 / 2, 1) && near(bS3.x0, 3000, 1) && r3.net === 2100000, 'the south wall moved 300 north: the shower wall is still x 3000..4000 on its face (y from 300 + t/2), the same 2 100 000', [moved.a, bS3]);

console.log('== edits through the lib; refusals');
ok(throwsKey(() => ed.modelChange(F.wallFinishOp((d) => M.withoutType(d, 'tile'))), /typeused/), 'a type a zone uses cannot be removed');
n0 = ed.changes.length;
ed.modelChange(F.wallFinishOp((d) => M.withoutZone(d, south.guid, 'left', 'z2')));
ok(ownCov().length === 1 && F.readWallFinishes(W()).faces[0].zones.length === 1, 'removing the shower wall removes its IfcCovering');
ed.undo();
ok(ownCov().length === 2 && F.readWallFinishes(W()).faces[0].zones.length === 2, 'Undo puts the zone and its covering back');
ed.redo();
ok(ownCov().length === 1, 'Redo removes them again');
ed.undo();

console.log('== schedules by finish, room and zone (BK.130)');
const S2 = F.finishSchedules(F.readWallFinishes(W()), W(), { t: (k) => k });
ok(S2.wallfinishes.rows.length === 2 && S2.wallfinishtotals.rows.length === 2 && S2.wallfinishrooms.rows.length === 2, 'three schedules: 2 zone rows, 2 finishes, 2 room-finish rows');
ok(S2.wallfinishes.head.length === S2.wallfinishes.cols.length && S2.wallfinishes.rows.every((r) => r.length === S2.wallfinishes.head.length) && S2.wallfinishes.total.length === S2.wallfinishes.head.length && S2.wallfinishrooms.rows.every((r) => r.length === S2.wallfinishrooms.head.length) && S2.wallfinishtotals.vals.every((r) => r.length === S2.wallfinishtotals.cols.length), 'every row, total and value row is as wide as its head');
const tt = S2.wallfinishtotals;
ok(tt.vals.find((v, i) => /tile/i.test(tt.rows[i][0]))[2] === 2100000 && tt.rows.find((r) => /tile/i.test(r[0]))[3] === '21', 'by finish: the tile is 2 100 000 mm2 and 21 whole tiles');

{ const SD = await imp('schedule-data.js');   // 0.11 BK.130 (bim-core-11): the Schedules panel's own data carries the three wall-face schedules, under keys of their own
  const all = SD.modelSchedules(ed, { units: 'mm', t: (k) => k }).all;
  ok(SD.WALLFACE_KEYS.every((k) => all[k] && all[k].rows.length === 2) && all.roomfinishes !== undefined, 'modelSchedules gives wfaces, wfacetotals and wfacerooms (2 rows each) beside the room-finish schedules', Object.keys(all).filter((k) => /f/.test(k)).slice(0, 12)); }
console.log('== a wall that is deleted takes its finishes with it');
ed.modelChange(OPS.removeWalls([south.guid]));
ed.modelChange(OPS.op((ww) => F.syncWallFinishCoverings(ww)), { label: 'sync' });
ok(F.readWallFinishes(W()).faces.length === 0 && ownCov().length === 0, 'the face of the deleted wall is forgotten and its coverings are gone (the types stay)');
ok(F.readWallFinishes(W()).types.length === 2, 'the finish types are kept for the next wall');

console.log('== the words');
const WD = (await imp('finishes/words.js')).WORDS;
ok(JSON.stringify(JSON.parse(fs.readFileSync(path.join(APP, 'finishes/words-en.json'), 'utf8'))) === JSON.stringify(WD), 'words-en.json is words.js as JSON (the file the lang owner merges)');
const used = new Set(); for (const f of ['finishes-ui.js', 'wall-finishes.js']) for (const m of fs.readFileSync(path.join(APP, 'finishes', f), 'utf8').matchAll(/\bt\('((?:wfin|finishes)\.[a-z0-9._-]+)'/g)) used.add(m[1]);
const missing = [...used].filter((k) => !k.endsWith('.') && !(k in WD));
ok(missing.length === 0, 'every wfin.* / finishes.* key the code names is in the words', missing);
const fam = { 'wfin.face.': ['left', 'right'], 'wfin.preset.': ['full', 'splash', 'shower', 'corners'], 'wfin.start.': ['corner', 'centre', 'opening', 'point'], 'wfin.corner.': ['bl', 'br', 'tl', 'tr'], 'wfin.edge.': ['left', 'right', 'top', 'bottom'], 'wfin.dir.': ['horizontal', 'vertical'], 'wfin.pattern.': ['grid', 'brick'], 'wfin.role.': ['substrate', 'waterproofing', 'adhesive', 'finish'], 'wfin.kind.': M.KINDS };
ok(Object.entries(fam).every(([p, list]) => list.every((x) => (p + x) in WD)), 'the words built from a name (faces, presets, starts, corners, edges, directions, patterns, roles, kinds) are all there');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

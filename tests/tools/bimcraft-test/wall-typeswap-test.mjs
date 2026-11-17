/* SPDX-License-Identifier: Apache-2.0 */
/**
 * wall-typeswap-test.mjs: the type swap, its "what moved" report and the LOD tag on a real IFC model (0.10 BK.7, BK.16; session
 * bk-typeswap-10), DOM-free:   node bin/test-bimcraft.mjs --typeswap
 * A 5000 x 4000 room of 110 mm walls with a partition at x = 3000, a door in the south wall and a window in the partition.
 * Every expected value is worked out in the comment beside it.
 */
import path from 'node:path';

export async function typeSwapMode({ APP, WebIFC, IfcModel, quiet }) {
  let bad = 0, n = 0;
  const ok = (cond, label, detail = '') => { n++; if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
  const nearP = (p, q, e = 0.01) => near(p[0], q[0], e) && near(p[1], q[1], e);
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const MO = await import(path.join(APP, 'model-openings.js'));
  const WA = await import(path.join(APP, 'wall-assemblies.js'));
  const TS = await import(path.join(APP, 'wall-typeswap.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  const fresh = async (name) => boot(new TextEncoder().encode(N.newBuilding({ name, levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'ts.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  let ed = await fresh('Type swap');
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const L1 = OPS.snapshotModel(ed).levels[0];
  const walls = () => MW.readWalls(W());
  const by = (g) => walls().find((x) => x.guid === g);
  const rooms = () => OPS.loopsOf(ed, L1.id).rooms.map((r) => r.area).sort((a, b) => b - a);
  const throwsWith = (fn, re) => { try { fn(); return false; } catch (e) { return re.test(String(e.key || e.message)); } };
  const lines = (r) => TS.reportText(r, { units: 'mm' }).map((x) => x.text);

  console.log('== BK.16 the LOD tag on a wall type');
  const brick = (t) => ({ mat: 'brick', t, function: 'structure', core: true });
  const G110 = { key: 'wall-g110', name: 'Wall 110 generic', layers: [brick(110)], lod: 200 };
  const G230 = { key: 'wall-g230', name: 'Wall 230 generic', layers: [brick(230)], lod: 200 };
  const B230 = { key: 'wall-b230', name: '230 clay brick, plastered both sides', layers: [{ mat: 'plaster', t: 15, function: 'finish' }, brick(230), { mat: 'plaster', t: 15, function: 'finish' }], lod: 300 };
  const C280 = { key: 'wall-c280', name: '280 cavity wall, clay brick both leaves', exterior: true, lod: 350, layers: [{ mat: 'brick', t: 110, function: 'finish' }, { mat: 'air', kind: 'cavity', ventilation: 'unspecified', t: 60, function: 'substrate' }, brick(110)] };
  ok(WA.validateAssembly(B230).lod === 300 && !('lod' in WA.validateAssembly({ ...G110, lod: undefined })) && !('lod' in WA.validateAssembly({ key: 'wall-x', name: 'X', layers: [brick(100)] })), 'validateAssembly keeps lod 300; a type with none has no lod field at all (as priority)');
  ok([100, 200, 300, 350, 400, 500].every((v) => WA.validateAssembly({ ...G110, lod: v }).lod === v), 'every step of the scale is accepted: 100, 200, 300, 350, 400, 500');
  ok([250, 0, 600, '300', 300.5, true].every((v) => throwsWith(() => WA.validateAssembly({ ...G110, lod: v }), /level of development|choose_a_level/i)), 'anything else is refused: 250, 0, 600, the text "300", 300.5, true');
  for (const ty of [G110, G230, B230, C280]) ed.modelChange(OPS.saveWallAssembly(ty));
  const asm = () => WA.readAssemblies(W());
  ok(asm().length === 4 && asm().find((x) => x.key === 'wall-b230').lod === 300 && asm().find((x) => x.key === 'wall-c280').lod === 350 && MW.wallType('wall-g110', W()).lod === 200, 'four project types, read back with their tags (200, 200, 300, 350)');
  let txt = new TextDecoder().decode(ed.save());
  ok((txt.match(/IFCPROPERTYSINGLEVALUE\('LOD',\$,IFCINTEGER\((\d+)\),\$\)/g) || []).length === 4 && /'LOD',\$,IFCINTEGER\(350\)/.test(txt) && /\\"lod\\":300|"lod":300/.test(txt), 'the file: each type\'s CadCraft_WallType set has the plain property LOD (IFCINTEGER), and the recipe holds "lod"');

  console.log('== the room: 5000 x 4000 centre lines, 110 walls, a partition at x = 3000, a door and a window');
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [5000, 0] }, { a: [5000, 0], b: [5000, 4000] }, { a: [5000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }], typeKey: 'wall-g110', height: 2700 }));
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [3000, 0], b: [3000, 4000] }], typeKey: 'wall-g110', height: 2700 }));
  const [s, e, nn, wv, p] = walls();
  ok(nearP(p.a, [3000, 0]) && nearP(s.b, [5000, 0]) && walls().every((x) => x.t === 110 && x.assembly.lod === 200), 'five walls of "Wall 110 generic" (110 mm, LOD 200)');
  ed.modelChange(OPS.placeOpening({ wall: s.guid, typeKey: MO.DOOR_TYPES[0].key, offset: 1000, width: 900, height: 2032 }));
  ed.modelChange(OPS.placeOpening({ wall: p.guid, typeKey: MO.WINDOW_TYPES[0].key, offset: 1500, width: 1200, height: 1200, sill: 900 }));
  // room 1 (west): (3000 - 55 - 55) x (4000 - 110) = 2890 x 3890 = 11 242 100; room 2: (2000 - 110) x 3890 = 1890 x 3890 = 7 352 100
  ok(near(rooms()[0], 11242100) && near(rooms()[1], 7352100), 'rooms: 2890 x 3890 = 11 242 100 mm2 and 1890 x 3890 = 7 352 100 mm2', rooms());

  console.log('== BK.16 the swap list of the picked walls');
  let list = TS.swapList(W(), [s.guid, p.guid]);
  const row = (k) => list.find((r) => r.key === k);
  ok(list.length === MW.WALL_TYPES.length + 4 && row('wall-g110').current === 2 && row('wall-g230').current === 0, 'the list holds the ' + MW.WALL_TYPES.length + ' starter types and the 4 project types; "Wall 110 generic" is marked as the type of both picked walls', list.map((r) => r.key + ':' + r.current));
  ok(row('wall-g230').label === 'Wall 230 generic [LOD 200]' && row('wall-b230').label === '230 clay brick, plastered both sides [LOD 300]' && row('wall-b230').t === 260 && row('wall-c280').t === 280 && row('wall-c280').exterior, 'it reads "Wall 230 generic [LOD 200]" and "230 clay brick, plastered both sides [LOD 300]"; thickness 15 + 230 + 15 = 260 and 110 + 60 + 110 = 280');
  ok(row('int-100').lod === null && row('int-100').label === row('int-100').name && !/LOD/.test(row('int-100').label), 'a starter type has no tag: its row shows none');
  ok(TS.swapList(W(), [s.guid], 'lod 300').map((r) => r.key).join() === 'wall-b230' && TS.swapList(W(), [s.guid], 'generic').filter((r) => !/^generic-/.test(r.key)).length === 2 && TS.swapList(W(), [s.guid], 'generic').length === 4 && TS.swapList(W(), [s.guid], '280').map((r) => r.key).join() === 'wall-c280', 'Find: "lod 300" → the plastered brick wall; "generic" → the two generic walls of this project (and, since BK.15, the two generic starter walls); "280" → the cavity wall');

  console.log('== BK.7 swap the partition 110 → 280 (its location line is its centre line)');
  let n0 = ed.changes.length;
  let r = ed.modelChange(TS.swapWallType([p.guid], 'wall-c280'), { label: 'Swap wall type' });
  let R = r.swap;
  ok(ed.changes.length === n0 + 1 && R && !R.nothing, 'one undo step; the op\'s return value carries the report (swap)');
  ok(by(p.guid).typeKey === 'wall-c280' && by(p.guid).t === 280 && nearP(by(p.guid).a, [3000, 0]) && nearP(by(p.guid).b, [3000, 4000]), 'the partition is the 280 cavity wall, on the same centre line');
  ok(R.walls.asked === 1 && R.walls.changed === 1 && R.walls.thicker === 1 && R.walls.shifted === 0 && R.walls.followed === 0 && R.walls.from[0].name === 'Wall 110 generic' && R.to.name === C280.name && R.to.t === 280, 'report, walls: 1 changed, thicker, from "Wall 110 generic"; its centre line did not move and no joined wall had to follow', R.walls);
  ok(R.openings.rehosted === 1 && R.openings.windows === 1 && R.openings.doors === 0 && R.openings.refit === 1 && R.openings.moved === 0 && R.openings.lost === 0, 'report, openings: the window is hosted again in the thicker wall (1 window, 0 doors), in the same place', R.openings);
  // each face of the partition moves (280 - 110) / 2 = 85: room 1 2805 x 3890 = 10 911 450 (-330 650), room 2 1805 x 3890 = 7 021 450 (-330 650)
  const r1 = R.rooms.list.find((x) => x.number === '101'), r2 = R.rooms.list.find((x) => x.number === '102');
  ok(R.rooms.changed === 2 && near(r1.before, 11242100) && near(r1.after, 10911450) && near(r1.delta, -330650) && near(r2.before, 7352100) && near(r2.after, 7021450) && near(r2.delta, -330650), 'report, rooms: 101 11 242 100 → 10 911 450 (-330 650), 102 7 352 100 → 7 021 450 (-330 650)', R.rooms.list);
  ok(near(R.rooms.before, 18594200, 1) && near(R.rooms.after, 17932900, 1) && near(R.rooms.delta, -661300, 1) && near(rooms()[0], 10911450) && near(rooms()[1], 7021450), 'together 18 594 200 → 17 932 900 (-661 300); the model\'s rooms say the same');
  ok(R.lod.kind === 'up' && R.lod.from.join() === '200' && R.lod.to === 350 && R.lod.changed === 1, 'report, LOD: raised 200 → 350');
  const win = () => MO.readOpenings(W()).find((o) => o.kind === 'window');
  ok(win().wallGuid === p.guid && near(win().offset, 1500) && near(win().width, 1200), 'the window is still in the partition at 1500, 1200 wide');
  let T = lines(R);
  ok(T[0] === 'Walls changed: 1. They are now 280 cavity wall, clay brick both leaves [LOD 350].' && T[1] === 'Thickness: 110 mm to 280 mm.' && T[2] === 'Level of development raised: LOD 200 to LOD 350.' && T[3] === 'Doors and windows hosted again in the new walls: 1 (doors 0, windows 1).', 'the report in words: walls, thickness 110 mm to 280 mm, LOD 200 to LOD 350, 1 window', T);
  ok(T[4] === 'Rooms whose area changed: 2. Together 18.59 m² to 17.93 m² (-0.66 m²).' && T[5] === '101 Room 1: 11.24 m² to 10.91 m² (-0.33 m²)' && T[6] === '102 Room 2: 7.35 m² to 7.02 m² (-0.33 m²)' && T.length === 7, 'and the rooms: together 18.59 m² to 17.93 m² (-0.66 m²); 101 11.24 to 10.91; 102 7.35 to 7.02', T.slice(4));
  ok(TS.statusText(R) === 'Walls swapped to 280 cavity wall, clay brick both leaves [LOD 350]: 1. Doors and windows hosted again: 1. Rooms whose area changed: 2.', 'the status line says it in one sentence', TS.statusText(R));

  console.log('== undo and redo: one step each way');
  ed.undo();
  ok(by(p.guid).typeKey === 'wall-g110' && by(p.guid).t === 110 && near(rooms()[0], 11242100) && near(rooms()[1], 7352100) && near(win().offset, 1500), 'one undo: the partition is 110 again, the rooms are 11 242 100 and 7 352 100 again');
  ed.redo();
  ok(by(p.guid).typeKey === 'wall-c280' && near(rooms()[0], 10911450) && near(rooms()[1], 7021450), 'redo: swapped again, same areas');

  console.log('== BK.7 two walls at once; the south wall keeps its outside face (location line), the corners follow (FX.65)');
  ed.modelChange(OPS.changeWall(s.guid, { justification: 'right' }));   // its right face (y = -55, the outside) is its location line now; nothing moves
  ok(nearP(by(s.guid).a, [0, 0]), 'setting the location line moves nothing');
  n0 = ed.changes.length;
  r = ed.modelChange(TS.swapWallType([s.guid, nn.guid], 'wall-g230')); R = r.swap;
  ok(ed.changes.length === n0 + 1, 'two walls, one undo step');
  // south: outside face stays at y = -55, so the centre line is at -55 + 115 = 60 (a shift of 60), the inside face at 175 (was 55: +120).
  // north (centre line kept): inside face from 3945 to 3885 (-60). The room depth: 3890 - 120 - 60 = 3710.
  ok(nearP(by(s.guid).a, [0, 60]) && nearP(by(s.guid).b, [5000, 60]) && by(s.guid).t === 230 && nearP(by(nn.guid).a, [5000, 4000]) && by(nn.guid).t === 230, 'south: centre line at y = 60 (outside face still at -55), north on its centre line; both 230');
  ok(nearP(by(e.guid).a, [5000, 60]) && nearP(by(wv.guid).b, [0, 60]) && nearP(by(p.guid).a, [3000, 60]) && by(e.guid).joins.some((j) => j.other === s.guid && j.kind === 'L') && by(p.guid).joins.some((j) => j.other === s.guid && j.kind === 'T'), 'the east and west walls and the partition end on the moved south wall: still joined (L, L, T)');
  ok(R.walls.changed === 2 && R.walls.thicker === 2 && R.walls.shifted === 1 && near(R.walls.maxShift, 60, 0.01) && R.walls.followed === 3, 'report, walls: 2 changed, 1 moved sideways by 60 to keep its location line, 3 joined walls followed', R.walls);
  const door = () => MO.readOpenings(W()).find((o) => o.kind === 'door');
  ok(R.openings.rehosted === 1 && R.openings.doors === 1 && R.openings.refit === 1 && R.openings.moved === 1 && near(R.openings.maxMove, 60, 0.01) && near(door().offset, 1000) && door().wallGuid === s.guid, 'report, openings: the door is hosted again in the 230 wall and moved 60 with it (still 1000 from the wall\'s start)', R.openings);
  ok(near(win().offset, 1440) && R.openings.list.some((o) => o.kind === 'window' && o.move === 0 && near(o.slide, -60, 0.01)), 'the partition got 60 shorter at its start: its window kept its place in the plan (offset 1500 → 1440), so it is not counted as moved');
  // rooms: 2805 x 3710 = 10 406 550 (was 10 911 450: -504 900); 1805 x 3710 = 6 696 550 (was 7 021 450: -324 900); together 17 103 100 (-829 800)
  const q1 = R.rooms.list.find((x) => x.number === '101'), q2 = R.rooms.list.find((x) => x.number === '102');
  ok(R.rooms.changed === 2 && near(q1.after, 10406550) && near(q1.delta, -504900) && near(q2.after, 6696550) && near(q2.delta, -324900) && near(R.rooms.after, 17103100, 1) && near(R.rooms.delta, -829800, 1), 'report, rooms: 101 → 10 406 550 (-504 900), 102 → 6 696 550 (-324 900), together 17 103 100 (-829 800)', R.rooms);
  ok(R.lod.kind === 'same' && R.lod.changed === 0, 'report, LOD: unchanged (200 and 200)');
  T = lines(R);
  ok(T.includes('Walls that moved sideways to keep their location line: 1, by up to 60 mm.') && T.includes('Joined walls that followed at their ends: 3.') && T.includes('Doors and windows that changed place: 1, by up to 60 mm.') && T.includes('Level of development unchanged: LOD 200.'), 'in words: moved sideways by up to 60 mm, 3 joined walls followed, 1 door changed place', T);
  ed.undo();
  ok(nearP(by(s.guid).a, [0, 0]) && by(s.guid).t === 110 && by(nn.guid).t === 110 && nearP(by(e.guid).a, [5000, 0]) && nearP(by(p.guid).a, [3000, 0]) && near(rooms()[0], 10911450) && near(door().offset, 1000) && near(win().offset, 1500), 'one undo puts both walls, the corners, the door, the window and the rooms back');
  ed.redo();

  console.log('== nothing to do, mixed tags, an unknown type');
  n0 = ed.changes.length;
  r = ed.modelChange(TS.swapWallType([s.guid], 'wall-g230')); R = r.swap;
  ok(R.nothing && R.walls.same === 1 && R.walls.changed === 0 && lines(R).join() === 'No wall changed type.' && by(s.guid).t === 230, 'a wall that already has the type: the report says no wall changed (the list in the page does not offer it)');
  ed.undo();
  r = ed.modelChange(TS.swapWallType([e.guid], 'int-100')); R = r.swap;   // a starter type: 12.5 + 75 + 12.5 = 100, no tag
  ok(R.walls.thinner === 1 && R.lod.kind === 'cleared' && by(e.guid).t === 100 && lines(R).includes('Level of development: the new type has no tag. It was LOD 200.') && lines(R).includes('Thickness: 110 mm to 100 mm.'), 'to a starter type with no tag: thinner (110 → 100), the report says the tag is gone', lines(R));
  r = ed.modelChange(TS.swapWallType([e.guid, wv.guid, s.guid], 'wall-b230')); R = r.swap;
  ok(R.walls.changed === 3 && R.walls.from.length === 3 && R.lod.kind === 'mixed' && R.lod.to === 300 && R.lod.changed === 3 && lines(R).some((x) => /^Level of development: was .*, now LOD 300\.$/.test(x)) && lines(R).includes('Thickness: now 260 mm.'), 'three walls of three types (no tag, 200, 200) to LOD 300: mixed, all three now 260 mm', [R.lod, lines(R)]);
  n0 = ed.changes.length;
  ok(throwsWith(() => ed.modelChange(TS.swapWallType([e.guid], 'wall-nope')), /model\.err\.walltype/) && ed.changes.length === n0 && by(e.guid).typeKey === 'wall-b230', 'an unknown type is refused (model.err.walltype) and changes nothing');

  console.log('== BK.16 save and reopen; a file from before the tag');
  const bytes = ed.save(); txt = new TextDecoder().decode(bytes);
  const typesBefore = walls().map((x) => x.typeKey).join();
  ed = await boot(bytes);
  ok(asm().find((x) => x.key === 'wall-b230').lod === 300 && asm().find((x) => x.key === 'wall-c280').lod === 350 && asm().find((x) => x.key === 'wall-g110').lod === 200 && walls().map((x) => x.typeKey).join() === typesBefore && by(e.guid).assembly.lod === 300, 'reopened: the types keep their tags and the walls their types');
  ok(TS.swapList(W(), [p.guid]).find((x) => x.key === 'wall-c280').label === '280 cavity wall, clay brick both leaves [LOD 350]' && TS.swapList(W(), [p.guid]).find((x) => x.key === 'wall-c280').current === 1, 'the swap list of the reopened file shows the tags');
  r = ed.modelChange(TS.swapWallType([p.guid], 'wall-g110')); R = r.swap;
  ok(R.walls.thinner === 1 && R.lod.kind === 'down' && lines(R).includes('Level of development lowered: LOD 350 to LOD 200.') && near(R.rooms.delta, 2 * 85 * 3680, 2), 'a swap in the reopened file reports: thinner, LOD lowered 350 to 200; the two rooms gain 2 x 85 x 3680 = 625 600 mm2 (depth 3885 - 205: the south wall is 260 on its outside face now)', [R.lod, R.rooms.delta]);
  // an older file: the same file with the tag taken out of the recipes and no LOD property
  const oldTxt = txt.replace(/,\\"lod\\":\d+/g, '').replace(/,"lod":\d+/g, '');
  const old = await boot(new TextEncoder().encode(oldTxt));
  const oa = WA.readAssemblies(new ModelWriter(WebIFC, old.api, old.mid));
  ok(oldTxt !== txt && oa.length === 4 && oa.every((x) => !('lod' in x) && !x.issue), 'a file whose recipes have no lod opens the same, with no tag on any type');
  // the tag is edited like the rest of the type: set, changed, removed
  const b230 = asm().find((x) => x.key === 'wall-b230');
  ed.modelChange(OPS.saveWallAssembly({ ...b230, lod: 400 }));
  ok(asm().find((x) => x.key === 'wall-b230').lod === 400 && by(e.guid).assembly.lod === 400, 'the type editor\'s save changes the tag (300 → 400) for the type and so for its walls');
  const { lod: _drop, ...noTag } = asm().find((x) => x.key === 'wall-b230');
  ed.modelChange(OPS.saveWallAssembly(noTag));
  const propsOf = (key) => { const w = W(), rec = WA.readAssemblyRecords(w).find((x) => x.key === key); return (w.api.GetLine(w.mid, rec.psetId, false).HasProperties || []).map((h) => { const pl = w.api.GetLine(w.mid, h.value, false); return String(pl.Name?.value ?? pl.Name); }); };
  ok(!('lod' in asm().find((x) => x.key === 'wall-b230')) && !propsOf('wall-b230').includes('LOD') && propsOf('wall-c280').includes('LOD') && !/lod/.test(WA.readAssemblyRecords(W()).find((x) => x.key === 'wall-b230').raw), 'saving it with "Not set" takes the field out of the recipe and the LOD property off the type (the cavity wall keeps its own)', propsOf('wall-b230'));

  console.log('== BK.7 a whole room at once, every wall on its outside face');
  ed = await fresh('Type swap 2');
  for (const ty of [G110, G230]) ed.modelChange(OPS.saveWallAssembly(ty));
  const L2 = OPS.snapshotModel(ed).levels[0];
  ed.modelChange(OPS.drawWalls({ storey: L2.guid, segs: [{ a: [0, 0], b: [6000, 0] }, { a: [6000, 0], b: [6000, 4000] }, { a: [6000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }], typeKey: 'wall-g110', height: 2700 }));
  for (const x of walls()) ed.modelChange(OPS.changeWall(x.guid, { justification: 'right' }));   // drawn anticlockwise: the right face is the outside
  const roomsOf = () => OPS.loopsOf(ed, L2.id).rooms.map((x) => x.area);
  // centre lines 6000 x 4000, 110 walls: outside 6110 x 4110, inside 5890 x 3890 = 22 912 100
  ok(near(roomsOf()[0], 5890 * 3890), 'before: inside 5890 x 3890 = 22 912 100 mm2', roomsOf());
  n0 = ed.changes.length;
  r = ed.modelChange(TS.swapWallType(walls().map((x) => x.guid), 'wall-g230')); R = r.swap;
  // the outside stays 6110 x 4110 (faces at -55 and 6055 / 4055); the centre lines move in by 60 to 60 … 5940 / 3940; inside 6110 - 460 = 5650 x 3650 = 20 622 500
  const xs = walls();
  ok(ed.changes.length === n0 + 1 && xs.every((x) => x.t === 230) && nearP(xs[0].a, [60, 60]) && nearP(xs[0].b, [5940, 60]) && nearP(xs[2].a, [5940, 3940]) && nearP(xs[3].b, [60, 60]), 'four walls in one step: every centre line moved in by 60, the corners meet at (60, 60) … (5940, 3940)', xs.map((x) => [x.a, x.b]));
  ok(xs.every((x) => (x.joins || []).filter((j) => j.kind === 'L').length === 2), 'every wall is still joined at both ends');
  ok(R.walls.changed === 4 && R.walls.shifted === 4 && near(R.walls.maxShift, 60, 0.01) && R.walls.followed === 0 && R.rooms.changed === 1 && near(R.rooms.list[0].before, 22912100) && near(R.rooms.list[0].after, 5650 * 3650) && near(R.rooms.delta, 5650 * 3650 - 22912100), 'report: 4 changed, 4 moved sideways by 60, the room 22 912 100 → 5650 x 3650 = 20 622 500 (-2 289 600)', [R.walls, R.rooms]);
  ed.undo();
  ok(walls().every((x) => x.t === 110) && nearP(walls()[0].a, [0, 0]) && near(roomsOf()[0], 22912100), 'one undo: all four back');

  console.log('== a door that would no longer fit: the swap is refused in clear words, nothing half-changes');
  // south 4000 long on its outside face; a stub wall 950 long stands on its east end with a 900 door at 25. South 110 → 230 moves its
  // centre line to y = 60, the stub's start follows there and the stub is 890 long: the 900 door cannot fit
  ed = await fresh('Type swap 3');
  for (const ty of [G110, G230]) ed.modelChange(OPS.saveWallAssembly(ty));
  const L3 = OPS.snapshotModel(ed).levels[0];
  ed.modelChange(OPS.drawWalls({ storey: L3.guid, segs: [{ a: [0, 0], b: [4000, 0] }, { a: [4000, 0], b: [4000, 950] }], typeKey: 'wall-g110', height: 2700 }));
  const [fs, fe] = walls();
  ed.modelChange(OPS.changeWall(fs.guid, { justification: 'right' }));
  ed.modelChange(OPS.placeOpening({ wall: fe.guid, typeKey: MO.DOOR_TYPES[0].key, offset: 25, width: 900, height: 2032 }));
  const stateNow = () => JSON.stringify([walls().map((x) => [x.guid, x.typeKey, x.t, x.a, x.b, x.justification]), MO.readOpenings(W()).map((o) => [o.guid, o.wallGuid, o.offset, o.width])]);
  const fileNow = () => new TextDecoder().decode(ed.save()).length;
  const s0 = stateNow(), f0 = fileNow(); n0 = ed.changes.length;
  let err = null; try { ed.modelChange(TS.swapWallType([fs.guid], 'wall-g230')); } catch (x) { err = x; }
  const { t: tr } = await import(path.join(APP, 'i18n.js'));
  ok(err && err.key === 'walls.err.swapfit' && /^A door or window would no longer fit in its wall with this type/.test(tr(err.key)), 'refused: walls.err.swapfit, "A door or window would no longer fit in its wall with this type …"', err && (err.key || err.message));
  ok(ed.changes.length === n0 && stateNow() === s0 && fileNow() === f0 && by(fs.guid).t === 110 && nearP(by(fe.guid).a, [4000, 0]), 'nothing changed: no undo step, the walls, the door and the saved file are as before (the south wall is still 110, the stub still starts at y = 0)');
  // the same swap goes through once the door fits: 800 wide at 25 in the 890 wall
  ed.modelChange(OPS.changeOpening(MO.readOpenings(W())[0].guid, { width: 800 }));
  r = ed.modelChange(TS.swapWallType([fs.guid], 'wall-g230')); R = r.swap;
  ok(by(fs.guid).t === 230 && nearP(by(fe.guid).a, [4000, 60]) && R.walls.changed === 1 && R.walls.followed === 1 && R.openings.rehosted === 0 && R.openings.moved === 1 && near(R.openings.maxMove, 35, 0.01) && R.openings.slid === 1 && near(MO.readOpenings(W())[0].offset, 0, 0.01), 'with an 800 door it goes through: the stub follows (890 long); its door would keep its place but the wall now starts 60 further on, 35 past the door\'s edge, so the door sits at the new start (offset 25 → 0) and the report counts it as moved by 35', [R.walls, R.openings, MO.readOpenings(W())[0].offset]);

  console.log('== walls with locks (Hold) in a swap');
  const WT = await import(path.join(APP, 'wall-tools.js'));
  ed = await fresh('Type swap 4');
  for (const ty of [G110, G230]) ed.modelChange(OPS.saveWallAssembly(ty));
  const L4 = OPS.snapshotModel(ed).levels[0];
  ed.modelChange(OPS.drawWalls({ storey: L4.guid, segs: [{ a: [0, 0], b: [5000, 0] }, { a: [5000, 0], b: [5000, 4000] }, { a: [5000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }], typeKey: 'wall-g110', height: 2700 }));
  ed.modelChange(OPS.drawWalls({ storey: L4.guid, segs: [{ a: [6000, 0], b: [6000, 4000] }], typeKey: 'wall-g110', height: 2700 }));   // a wall beside the room, parallel to its east wall
  const [, hE, , , hFree] = walls();
  ed.modelChange(WT.addHold({ kind: 'line', wall: hFree.guid, ref: 'center', to: { wall: hE.guid, ref: 'center' } }));   // locked 1000 from the east wall's centre line
  ed.modelChange(OPS.changeWall(hE.guid, { justification: 'right' }));   // the east wall's outside face (x = 5055) is its location line
  n0 = ed.changes.length;
  r = ed.modelChange(TS.swapWallType([hE.guid], 'wall-g230')); R = r.swap;
  // east: outside face stays at 5055, centre line 5055 - 115 = 4940 (60 west). The locked wall keeps its 1000: 5940.
  ok(ed.changes.length === n0 + 1 && near(by(hE.guid).a[0], 4940, 0.01) && near(by(hFree.guid).a[0], 5940, 0.01) && near(by(hFree.guid).b[0], 5940, 0.01) && WT.readHolds(W()).length === 1, 'the east wall goes 60 west to keep its outside face; the wall locked to it follows 60 (x = 5940), in the same step; the lock is still there', [by(hE.guid).a, by(hFree.guid).a]);
  ok(R.walls.changed === 1 && R.walls.shifted === 1 && R.walls.followed === 3, 'the report counts it: 3 walls followed (south and north at their ends, and the locked wall)', R.walls);
  ed.undo();
  ok(near(by(hE.guid).a[0], 5000, 0.01) && near(by(hFree.guid).a[0], 6000, 0.01) && by(hE.guid).t === 110, 'one undo: the east wall and the locked wall are back');
  r = ed.modelChange(TS.swapWallType([hFree.guid], 'wall-g230')); R = r.swap;
  ok(by(hFree.guid).t === 230 && near(by(hFree.guid).a[0], 6000, 0.01) && near(by(hE.guid).a[0], 5000, 0.01) && R.walls.followed === 0 && WT.readHolds(W()).length === 1, 'swapping the locked wall itself (on its centre line): nothing moves, the lock stays');
  // a wall locked to a grid line with its location line on a face: the swap would take its centre line off the grid line
  const MG = await import(path.join(APP, 'model-grids.js'));
  let gridOk = true; try { ed.modelChange(MG.placeGrid({ storey: L4.guid, axes: [{ tag: '1', a: [0, -1000], b: [0, 5000] }] })); } catch (x) { gridOk = false; }
  const tags = gridOk ? MG.readGrids(W()).flatMap((g) => g.axes.map((x) => x.tag)) : [];
  if (tags.length) {
    const hW = walls().find((x) => near(x.a[0], 0, 1) && near(x.b[0], 0, 1));
    ed.modelChange(WT.addHold({ kind: 'line', wall: hW.guid, ref: 'center', to: { grid: tags[0] } }));
    ed.modelChange(OPS.changeWall(hW.guid, { justification: 'right' }));
    const s1 = JSON.stringify(walls().map((x) => [x.guid, x.typeKey, x.a, x.b])); n0 = ed.changes.length; err = null;
    try { ed.modelChange(TS.swapWallType([hW.guid], 'wall-g230')); } catch (x) { err = x; }
    ok(err && err.key === 'walls.err.held' && ed.changes.length === n0 && JSON.stringify(walls().map((x) => [x.guid, x.typeKey, x.a, x.b])) === s1, 'a wall locked to a grid line by its centre line, with its location line on a face: the swap would pull it off the grid line, so it is refused (walls.err.held: "A lock holds that wall …") and nothing changes', err ? (err.key || err.message) : 'not refused: ' + JSON.stringify(by(hW.guid).a));
  } else ok(false, 'a grid line could be placed for the grid-lock case');

  console.log('== the assistant: wall_types_list and walls_swap_type are the same swap');
  {
    const AG = await import(path.join(APP, 'agents.js'));
    const { createDispatcher } = await import(path.join(APP, 'host.js'));
    const mk = async () => { const x = await fresh('Assistant'); for (const ty of [G110, B230]) x.modelChange(OPS.saveWallAssembly(ty)); const lv = OPS.snapshotModel(x).levels[0];
      x.modelChange(OPS.drawWalls({ storey: lv.guid, segs: [{ a: [0, 0], b: [5000, 0] }, { a: [5000, 0], b: [5000, 4000] }, { a: [5000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }], typeKey: 'wall-g110', height: 2700 }));
      const ws = MW.readWalls(new ModelWriter(WebIFC, x.api, x.mid)); x.modelChange(OPS.placeOpening({ wall: ws[0].guid, typeKey: MO.DOOR_TYPES[0].key, offset: 1000, width: 900, height: 2032 })); return x; };
    const A = await mk(), B = await mk();
    let allowed = ['read'];
    const d = createDispatcher({ server: { name: 'bimcraft', title: 'BimCraft', version: 'test' }, allowed: () => allowed });
    for (const def of AG.modelTools({ ed: () => A, apply: async (label, op) => A.modelChange(op, { label: 'Assistant: ' + label }) })) d.tool(def);
    const call = async (name, a = {}) => { const x = await d.call(name, a); return { r: x, v: x.structuredContent, text: x.content?.map((c) => c.text || '').join(' ') || '' }; };
    const wallsOf = (x) => MW.readWalls(new ModelWriter(WebIFC, x.api, x.mid));
    const gA = wallsOf(A).map((x) => x.guid), gB = wallsOf(B).map((x) => x.guid);
    const have = d.list().map((x) => x.name);
    ok(have.includes('wall_types_list') && !have.includes('walls_swap_type'), 'read only: wall_types_list is listed, walls_swap_type is not');
    let x = await call('wall_types_list', { walls: gA });
    const tB = x.v?.types?.find((y) => y.key === 'wall-b230'), tG = x.v?.types?.find((y) => y.key === 'wall-g110');
    ok(!x.r.isError && tB && tB.lod === 300 && tB.thickness === 260 && tB.project === true && tG.lod === 200 && tG.current === 4 && x.v.types.find((y) => y.key === 'int-100').lod === null, 'wall_types_list: the plastered brick wall 260 mm LOD 300, the generic one LOD 200 with 4 of the given walls, a starter type with lod null', [tB, tG]);
    x = await call('walls_swap_type', { walls: gA.slice(0, 2), type: 'wall-b230' });
    ok(x.r.isError && /edit permission/.test(x.text) && A.changes.length === B.changes.length, 'walls_swap_type is refused without the edit permission; nothing changes');
    allowed = ['read', 'edit'];
    ok(d.list().some((y) => y.name === 'walls_swap_type'), 'with edit: walls_swap_type is listed');
    const nA = A.changes.length;
    x = await call('walls_swap_type', { walls: [gA[0], gA[2]], type: 'wall-b230' });
    const rb = B.modelChange(TS.swapWallType([gB[0], gB[2]], 'wall-b230')).swap;
    // south and north 110 → 260 on their centre lines: each inside face moves 75; the room 4890 x 3890 = 19 022 100 → 4890 x 3740 = 18 288 600 mm2 (19.022 → 18.289 m2, -0.7335)
    ok(!x.r.isError && A.changes.length === nA + 1 && x.v.changed === 2 && x.v.type.key === 'wall-b230' && x.v.type.lod === 300 && x.v.walls.thicker === 2 && x.v.openings.hosted_again === 1 && x.v.openings.doors === 1 && x.v.rooms.changed === 1 && x.v.rooms.list[0].before_m2 === 19.022 && x.v.rooms.list[0].after_m2 === 18.289 && Math.abs(x.v.rooms.delta_m2 + 0.7335) <= 0.00051 && x.v.lod.change === 'up' && x.v.lod.to === 300, 'walls_swap_type: 2 walls in ONE undo step; returns the report: 2 thicker, 1 door hosted again, the room 19.022 → 18.289 m2 (-0.7335, given to 0.001), LOD up to 300', x.v || x.text);
    ok(x.v.summary[0] === 'Walls changed: 2. They are now 230 clay brick, plastered both sides [LOD 300].' && x.v.summary.includes('Level of development raised: LOD 200 to LOD 300.') && x.v.summary.length === lines(rb).length, 'its summary is the report the person reads, line for line', x.v.summary);
    const shape = (e2) => JSON.stringify([wallsOf(e2).map((y) => [y.typeKey, y.t, y.a.map((v) => Math.round(v * 100) / 100), y.b.map((v) => Math.round(v * 100) / 100)]), OPS.loopsOf(e2, OPS.snapshotModel(e2).levels[0].id).rooms.map((q) => Math.round(q.area))]);
    ok(shape(A) === shape(B) && x.v.rooms.list[0].after_m2 === Math.round(rb.rooms.list[0].after / 1e3) / 1e3, 'the assistant\'s model equals the model of a person who swapped the same walls from the list (types, thickness, ends, room area)');
    x = await call('walls_swap_type', { walls: [gA[0]], type: 'wall-b230' });
    ok(!x.r.isError && x.v.changed === 0 && x.v.already === 1 && A.changes.length === nA + 1, 'a wall that already has the type: changed 0, no undo step');
    x = await call('walls_swap_type', { walls: [gA[1]], type: 'wall-nope' });
    const y2 = await call('walls_swap_type', { walls: ['nope'], type: 'wall-b230' });
    ok(x.r.isError && /No wall type with the key wall-nope/.test(x.text) && /wall_types_list/.test(x.text) && y2.r.isError && /walls_list/.test(y2.text) && A.changes.length === nA + 1, 'an unknown type or unknown walls: an error that names the tool to call next; nothing changes', [x.text, y2.text]);
  }

  console.log('== BK.16 the LOD column of the Walls by type schedule (optional)');
  {
    const SCH = await import(path.join(APP, 'model-schedule.js'));
    const e3 = await fresh('Schedule'); ed = e3;
    for (const ty of [G110, B230]) ed.modelChange(OPS.saveWallAssembly(ty));
    const lv = OPS.snapshotModel(ed).levels[0];
    ed.modelChange(OPS.drawWalls({ storey: lv.guid, segs: [{ a: [0, 0], b: [5000, 0] }, { a: [5000, 0], b: [5000, 4000] }], typeKey: 'wall-g110', height: 2700 }));
    ed.modelChange(OPS.drawWalls({ storey: lv.guid, segs: [{ a: [0, 4000], b: [0, 8000] }], typeKey: 'wall-b230', height: 2700 }));
    ed.modelChange(OPS.drawWalls({ storey: lv.guid, segs: [{ a: [9000, 0], b: [9000, 3000] }], typeKey: 'int-100', height: 2700 }));
    const fmt = { fmtLen: (v) => String(Math.round(v)), fmtArea: (v) => String(Math.round(v)), t: (k) => k };
    const snap = OPS.snapshotModel(ed), plain = SCH.schedules(snap, new Map(), fmt), withLod = TS.addLodColumn(SCH.schedules(snap, new Map(), fmt), snap.walls, { label: 'LOD' });
    const cell = (name) => withLod.walls.rows.find((q) => q[0] === name)?.at(-1);
    ok(withLod.walls.head.length === plain.walls.head.length + 1 && withLod.walls.head.at(-1) === 'LOD' && withLod.walls.rows.every((q, i) => q.length === plain.walls.rows[i].length + 1 && q.slice(0, -1).join() === plain.walls.rows[i].join()) && withLod.walls.total.length === plain.walls.total.length + 1 && withLod.walls.total.at(-1) === '', 'off: the schedule is as before; on: one more column "LOD" at the end, the other cells untouched, the total row has an empty cell');
    ok(cell('Wall 110 generic') === 'LOD 200' && cell('230 clay brick, plastered both sides') === 'LOD 300' && withLod.walls.rows.some((q) => q.at(-1) === '') && withLod.walls.rows.length === 3, 'rows: "Wall 110 generic" LOD 200, "230 clay brick, plastered both sides" LOD 300, the starter type an empty cell', withLod.walls.rows.map((q) => [q[0], q.at(-1)]));
    ok(TS.addLodColumn(withLod, snap.walls).walls.head.length === plain.walls.head.length + 1, 'asked twice it is added once');
  }

  console.log('\n' + (n - bad) + ' ok, ' + bad + ' failed');
  return bad ? 1 : 0;
}

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools-a-test.mjs — Room, Room Separator, Tag Room, Area, Area Boundary, Tag Area, Shaft, Vertical Opening, Model Group and the
 * Wall Opening wiring (session bk-tools-a-10). DOM-free:
 *   node bin/test-bimcraft.mjs --toolsa
 * Real IFC models made by the app's own operations. Every expected number is worked out in the comment beside it.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export async function toolsAMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MS = await import(path.join(APP, 'model-slabs.js'));
  const MR = await import(path.join(APP, 'model-rooms.js'));
  const MF = await import(path.join(APP, 'model-floors.js'));
  const MC = await import(path.join(APP, 'model-columns.js'));
  const MM = await import(path.join(APP, 'model-modify.js'));
  const G = await import(path.join(APP, 'spaces-geom.js'));
  const RB = await import(path.join(APP, 'room-bounds.js'));
  const SO = await import(path.join(APP, 'slab-openings.js'));
  const MG = await import(path.join(APP, 'model-groups.js'));
  const SP = await import(path.join(APP, 'spaces-ops.js'));
  const I18 = await import(path.join(APP, 'i18n.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const IN = await import(path.join(APP, 'input-bimcraft.js'));
  const ENG = await import(path.join(APP, 'workspace/engine.js'));
  const { catalog } = await import(path.join(APP, 'workspace/catalog.js'));
  const { RULES } = await import(path.join(APP, 'quantities/rules.js'));
  const LANG = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
  I18.init({ locale: 'en', strings: LANG });
  const MU = await import(path.join(APP, 'model-units.js'));
  MU.setDisplayUnits('m');   // the tag text follows the display unit (FX.352): the known answers below are the metric ones
  let QS = null;
  try { QS = await import(path.join(APP, 'quantity-schedules.js')); } catch (e) { console.log('  --   quantity-schedules.js could not be loaded (' + String(e.message).slice(0, 120) + '): the schedule checks are skipped'); }

  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  const fresh = (name, levels, h) => boot(new TextEncoder().encode(N.newBuilding({ name, levels: N.stackLevels(levels, h, (i) => 'Level ' + (i + 1)), fileName: 'a.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  const W = (ed) => new ModelWriter(WebIFC, ed.api, ed.mid);
  const snap = (ed) => OPS.snapshotModel(ed);
  const box = (x0, y0, x1, y1) => [{ a: [x0, y0], b: [x1, y0] }, { a: [x1, y0], b: [x1, y1] }, { a: [x1, y1], b: [x0, y1] }, { a: [x0, y1], b: [x0, y0] }];
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const T = 114.3, HT = T / 2;   // int-2x4: 12.7 gypsum + 88.9 studs + 12.7 gypsum; half = 57.15
  const qto = (ed, id, set) => { const w = W(ed), d = w.defNamed(id, set), o = {}; for (const h of d?.line.Quantities || []) { const q = ed.api.GetLine(ed.mid, h.value, false); o[q.Name.value] = Number((q.AreaValue ?? q.LengthValue ?? q.VolumeValue).value); } return o; };
  const count = (ed, cls) => { try { return ed.api.GetLineIDsWithType(ed.mid, ed.api.GetTypeCodeFromName(cls)).size(); } catch (e) { return 0; } };
  const saved = {};

  // ================================================================================================ pure geometry
  console.log('== spaces-geom.js: the plain geometry');
  // two 10 x 10 squares offset by (5, 5) share a 5 x 5 square = 25
  ok(near(G.overlapArea(rect(0, 0, 10, 10), rect(5, 5, 15, 15)), 25, 1e-9), 'overlapArea: two 10 x 10 squares offset by 5 and 5 share 25');
  // an L (30 x 30 with a 20 x 20 bite out of its top right) and a 10-wide band across y 5..15: the L is 30 wide below y = 10 and 10 wide above: 30 x 5 + 10 x 5 = 200
  ok(near(G.overlapArea([[0, 0], [30, 0], [30, 10], [10, 10], [10, 30], [0, 30]], rect(-5, 5, 40, 15)), 200, 1e-9), 'overlapArea: a concave L and a band: 30 x 5 + 10 x 5 = 200');
  // a 20 x 20 square with a 10 x 10 hole in its middle, against the square itself: 400 - 100 = 300; against a triangle (0,0) (20,0) (0,20) (area 200) whose hypotenuse x + y = 20 cuts the hole in half: 200 - 50 = 150
  ok(near(G.overlapArea({ poly: rect(0, 0, 20, 20), holes: [rect(5, 5, 15, 15)] }, rect(0, 0, 20, 20)), 300, 1e-9) && near(G.overlapArea({ poly: rect(0, 0, 20, 20), holes: [rect(5, 5, 15, 15)] }, [[0, 0], [20, 0], [0, 20]]), 150, 1e-9), 'overlapArea: a hole is out (300), and a triangle across the hole shares 200 - 50 = 150');
  ok(G.overlapArea(rect(0, 0, 10, 10), rect(20, 20, 30, 30)) === 0, 'overlapArea: apart = 0');
  ok(G.nextNumber('101') === '102' && G.nextNumber('A-09') === 'A-10' && G.nextNumber('Lobby') === 'Lobby' && G.nextNumber('099') === '100', 'nextNumber: 101 → 102, A-09 → A-10, 099 → 100, no digits stays');
  // 2.5 mm on paper at 1 : 100 = 250 mm in the model; three lines 1.5 heights apart + half a height = 3 x 375 + 125 = 1250; "15.32 m²" is 8 letters: 8 x 150 + 250 = 1450 wide
  { const sz = G.tagSize(['101', 'Office', '15.32 m²'], 2.5, 100);
    ok(near(sz.hgt, 250, 1e-9) && near(sz.h, 1250, 1e-9) && near(sz.w, 1450, 1e-9) && near(G.tagSize(['1'], 2.5, 50).hgt, 125, 1e-9), 'tagSize: 2.5 mm on paper is 250 mm at 1 : 100 and 125 mm at 1 : 50; the box is 1450 x 1250', sz); }
  ok(G.tagLines({ number: '101', name: 'Office' }, { area: '15.32 m²' }).join('|') === '101|Office|15.32 m²' && G.tagLines({ number: '', name: 'Office' }).join('|') === 'Office', 'tagLines: number, name, area; an empty line is left out');
  { const wall = { a: [0, 0], b: [1000, 0], t: 200 };
    ok(G.lineOnFace(wall, 'left')[0][1] === 100 && G.lineOnFace(wall, 'right')[1][1] === -100 && G.sideOf(wall, [5, 9]) === 'left' && G.sideOf(wall, [5, -9]) === 'right', 'lineOnFace / sideOf: the left face is 100 up, the right 100 down');
    // the joined outline of that wall mitred into a wall going up at its end: its right (outer) face runs to 1100, its left to 900
    const f = G.faceFromOutline(wall, [[0, -100], [1100, -100], [900, 100], [0, 100]], 'right'), f2 = G.faceFromOutline(wall, [[0, -100], [1100, -100], [900, 100], [0, 100]], 'left');
    ok(near(f[1][0], 1100) && near(f[1][1], -100) && near(f2[1][0], 900), 'faceFromOutline: the outer face runs to the mitred corner (1100), the inner to 900'); }
  ok(G.zOverlap(0, 10, 10, 20) === false && G.zOverlap(0, 10, 8, 20) === true, 'zOverlap: touching is not cutting');
  { const m = [{ kind: 'wall', a: [100, 100], b: [1100, 100], typeKey: 'x', openings: [{ guid: 'q', width: 900 }] }, { kind: 'column', at: [600, 600], width: 300 }];
    const c1 = G.groupContent(m, [100, 100]), c2 = G.groupContent(m.map((x) => G.shiftMember(x, 5000, -200)).reverse(), [5100, -100]);
    // 57.15 (half a 114.3 wall) sits on a rounding edge: the comparison is by tolerance, so 57.15 and 57.150000001 are alike and 57.25 is not
    ok(G.sameContent(c1, c2) && !G.sameContent(c1, G.groupContent([{ ...m[0], b: [1200, 100] }, m[1]], [100, 100])) && G.sameContent([{ a: [0, 57.15] }], [{ a: [0, 57.150000001] }]) && !G.sameContent([{ a: [0, 57.15] }], [{ a: [0, 57.25] }]) && !G.sameContent(c1, c1.slice(1)), 'groupContent / sameContent: the same wherever it stands and in any order; a longer wall, a missing member or 0.1 mm is not the same'); }
  // (planLoops rounds a cut's place along an edge to 1e-9 of the edge, so these agree to a thousandth of a mm2, not to the last digit)
  // planLoops with lines: a 100 x 100 box of four thin walls (10 thick, centre lines on the box) split by a line at x = 40: inner 90 x 90 → 35 x 90 and 55 x 90
  { const wl = (a, b) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = [-(b[1] - a[1]) / L * 5, (b[0] - a[0]) / L * 5], u = [(b[0] - a[0]) / L * 5, (b[1] - a[1]) / L * 5]; return [[a[0] - u[0] + n[0], a[1] - u[1] + n[1]], [a[0] - u[0] - n[0], a[1] - u[1] - n[1]], [b[0] + u[0] - n[0], b[1] + u[1] - n[1]], [b[0] + u[0] + n[0], b[1] + u[1] + n[1]]]; };
    const polys = [wl([0, 0], [100, 0]), wl([100, 0], [100, 100]), wl([100, 100], [0, 100]), wl([0, 100], [0, 0])];
    const one = MR.planLoops(polys), two = MR.planLoops(polys, { lines: [[[40, 0], [40, 100]]] }), spur = MR.planLoops(polys, { lines: [[[40, 0], [40, 60]]] });
    ok(one.rooms.length === 1 && near(one.rooms[0].area, 8100, 1e-3) && two.rooms.length === 2 && near(two.rooms[0].area + two.rooms[1].area, 8100, 1e-3) && two.rooms.some((r) => near(r.area, 35 * 90, 1e-3)) && two.rooms.some((r) => near(r.area, 55 * 90, 1e-3)), 'planLoops with a line: one 90 x 90 room becomes 35 x 90 and 55 x 90 (3150 + 4950 = 8100)', two.rooms.map((r) => r.area));
    ok(two.rooms.every((r) => r.poly.length === 4) && near(two.rooms.find((r) => near(r.area, 3150, 1e-3)).perimeter, 2 * (35 + 90), 1e-3), 'each has four corners; the small one\'s perimeter is 2 x (35 + 90) = 250');
    ok(spur.rooms.length === 1 && near(spur.rooms[0].area, 8100, 1e-3) && near(spur.rooms[0].perimeter, 360, 1e-3) && spur.rooms[0].poly.length === 4, 'a line that stops in the open bounds nothing: still one room, 8100, perimeter 360, four corners', [spur.rooms[0]?.poly.length, spur.rooms[0]?.perimeter]);
    ok(JSON.stringify(MR.planLoops(polys, { lines: [] })) === JSON.stringify(one), 'with no lines the result is what it always was'); }

  // ================================================================================================ rooms and separators
  console.log('== Room and Room Separator: a 6000 x 4000 building (centre lines), walls 114.3 thick, level 3000 high');
  let ed = await fresh('Tools A', 1, 3000);
  const L1 = () => snap(ed).levels[0];
  ed.modelChange(OPS.drawWalls({ storey: L1().guid, segs: box(0, 0, 6000, 4000), typeKey: 'int-2x4' }));
  const roomsOf = (e = ed, lv = 0) => { const s = snap(e), l = s.levels[lv], L = OPS.loopsOf(e, l.id); return s.derived.spaces.filter((x) => x.storey === l.id).map((sp) => ({ ...sp, loop: MR.loopAt(L.rooms, sp.seed) })); };
  // the room inside the faces: (6000 - 114.3) x (4000 - 114.3) = 5885.7 x 3885.7 = 22 870 064.49 mm2
  const ROOM = 5885.7 * 3885.7;
  let rooms = roomsOf();
  ok(rooms.length === 1 && near(rooms[0].loop.area, ROOM, 0.05) && near(ROOM, 22870064.49, 0.05), 'the walls make one room of 5885.7 x 3885.7 = 22 870 064.49 mm2 (the engine BimCraft already had)', rooms[0]?.loop?.area);
  const room1 = rooms[0];
  // Room tool: name and number, one step
  ed.modelChange(SP.nameRoom(room1.guid, { name: 'Workshop', number: 'W-01' }));
  rooms = roomsOf();
  ok(rooms[0].name === 'Workshop' && rooms[0].number === 'W-01', 'Room: the room is named Workshop and numbered W-01');
  { const q = qto(ed, rooms[0].id, 'Qto_SpaceBaseQuantities');
    // volume = area x 3000 = 68 610 193 470 mm3 = 68.610193 m3; perimeter 2 x (5885.7 + 3885.7) = 19 542.8 mm
    ok(near(q.NetFloorArea, 22.870064, 1e-5) && near(q.NetVolume, 68.610193, 1e-5) && near(q.NetPerimeter, 19542.8, 0.05) && near(q.Height, 3000, 0.05), 'IfcSpace quantities: area 22.870064 m2, perimeter 19 542.8 mm, height 3000, volume 68.610193 m3', q); }
  ed.undo();
  ok(roomsOf()[0].name !== 'Workshop', 'undo takes the name back in one step');
  ed.redo();
  // a separator at x = 2000 from wall centre to wall centre: left room (2000 - 57.15) x 3885.7 = 7 549 332.245; right (6000 - 57.15 - 2000) x 3885.7 = 15 320 732.245
  const LEFT = (2000 - HT) * 3885.7, RIGHT = (6000 - HT - 2000) * 3885.7;
  ed.modelChange(SP.drawBounds({ storey: L1().guid, kind: 'room', lines: [{ a: [2000, 0], b: [2000, 4000] }] }));
  rooms = roomsOf();
  const left = rooms.find((r) => r.loop && near(r.loop.area, LEFT, 0.05)), right = rooms.find((r) => r.loop && near(r.loop.area, RIGHT, 0.05));
  ok(rooms.length === 2 && left && right && near(LEFT + RIGHT, ROOM, 0.05) && near(LEFT, 7549332.245, 0.05) && near(RIGHT, 15320732.245, 0.05), 'Room Separator at x = 2000: two rooms, 7 549 332.245 + 15 320 732.245 = 22 870 064.49 (nothing lost to the line)', rooms.map((r) => r.loop?.area));
  ok(right.name === 'Workshop' && right.number === 'W-01' && left.number !== 'W-01', 'the room that holds the old room\'s point keeps its name and number; the other is new', [left?.number, right?.number]);
  { const q = qto(ed, left.id, 'Qto_SpaceBaseQuantities');
    // left: perimeter 2 x (1942.85 + 3885.7) = 11 657.1; volume 7 549 332.245 x 3000 = 22.647997 m3
    ok(near(q.NetFloorArea, LEFT / 1e6, 1e-5) && near(q.NetPerimeter, 11657.1, 0.05) && near(q.NetVolume, 22.647997, 1e-5), 'the new room\'s quantities: 7.549332 m2, 11 657.1 mm round, 22.647997 m3', q); }
  let bounds = RB.readBounds(W(ed));
  ok(bounds.length === 1 && bounds[0].kind === 'room' && near(bounds[0].a[0], 2000) && near(bounds[0].b[1], 4000) && count(ed, 'IFCVIRTUALELEMENT') === 1, 'it is one IfcVirtualElement that reads back as the line drawn');
  { const l = ed.api.GetLine(ed.mid, bounds[0].id, false);
    ok(l.Name.value === 'Room separator' && l.ObjectType.value === 'ROOMSEPARATOR' && l.Representation && W(ed).storeyOf().get(bounds[0].id) === L1().id, 'named, typed ROOMSEPARATOR, with an axis line, contained in its level', [l.Name?.value, l.ObjectType?.value, !!l.Representation, W(ed).storeyOf().get(bounds[0].id), L1().id]); }
  // a line that stops in the open changes nothing
  ed.modelChange(SP.drawBounds({ storey: L1().guid, kind: 'room', lines: [{ a: [4000, 2000], b: [5000, 2000] }] }));
  rooms = roomsOf();
  ok(rooms.length === 2 && near(rooms.find((r) => r.number === 'W-01').loop.area, RIGHT, 0.05) && near(rooms.find((r) => r.number === 'W-01').loop.perimeter, 2 * (3942.85 + 3885.7), 0.05), 'a separator that reaches nothing bounds nothing: still two rooms, the same area and perimeter');
  ed.undo();
  // move the separator to x = 3500: left (3500 - 57.15) x 3885.7 = 13 377 882.245
  ed.modelChange(SP.moveBound(bounds[0].guid, { a: [3500, 0], b: [3500, 4000] }));
  rooms = roomsOf();
  ok(rooms.length === 2 && rooms.some((r) => near(r.loop.area, (3500 - HT) * 3885.7, 0.05)) && near((3500 - HT) * 3885.7, 13377882.245, 0.05), 'moved to x = 3500: the left room is 3442.85 x 3885.7 = 13 377 882.245', [rooms.map((r) => r.loop?.area), RB.readBounds(W(ed))]);
  ed.undo();
  rooms = roomsOf();
  ok(rooms.length === 2 && rooms.some((r) => near(r.loop.area, LEFT, 0.05)), 'undo puts the line and both rooms back');

  // ================================================================================================ tags
  console.log('== Tag Room');
  const leftGuid = roomsOf().find((r) => near(r.loop.area, LEFT, 0.05)).guid, rightGuid = roomsOf().find((r) => r.number === 'W-01').guid;
  ed.modelChange(SP.placeTags([{ target: rightGuid, offset: [0, 500] }]));
  let tags = RB.readTags(W(ed));
  const seedR = roomsOf().find((r) => r.guid === rightGuid).seed;
  // the right room's label point is its middle: x = (2000 + 5942.85) / 2 = 3971.425, y = 2000; the tag 500 above it
  ok(tags.length === 1 && tags[0].kind === 'room' && tags[0].target === rightGuid && near(seedR[0], 3971.425, 0.05) && near(tags[0].at[0], 3971.425, 0.05) && near(tags[0].at[1], 2500, 0.05), 'a tag on W-01, 500 above the room\'s middle (3971.425, 2000): at (3971.425, 2500)', tags[0]?.at);
  ok(tags[0].text === 'W-01\nWorkshop\n15.32 m²' && near(tags[0].paper, 2.5, 1e-9), 'it says the number, the name and the area (15 320 732 mm2 = 15.32 m2), 2.5 mm tall on paper', tags[0]?.text);
  { const l = ed.api.GetLine(ed.mid, tags[0].id, false);
    ok(l.ObjectType.value === 'ROOMTAG' && l.Name.value === 'W-01 Workshop 15.32 m²' && count(ed, 'IFCTEXTLITERALWITHEXTENT') === 1, 'an IfcAnnotation typed ROOMTAG, with its text as a text literal for other readers'); }
  // FX.352: in a feet-and-inches project the tag's stored text gives ft2, the same words the plan draws (it said m2 before)
  MU.setDisplayUnits('ftin');
  ed.modelChange(SP.placeTags([{ target: leftGuid }]));
  { const tf = RB.readTags(W(ed)).find((x) => x.target === leftGuid), want = MU.fmtArea(LEFT, 'ftin');
    ok(/ ft²$/.test(want) && tf && tf.text.split('\n').at(-1) === want && !/m²/.test(tf.text), 'FX.352: a room tag in a feet-and-inches project says ' + want + ' (7 549 332 mm2 = 81.3 ft2), as the plan draws it', tf?.text);
    const l = ed.api.GetLine(ed.mid, tf.id, false); ok(/ft²$/.test(l.Name.value), 'FX.352: the IfcAnnotation name says ft2 too', l.Name.value); }
  ed.undo();
  MU.setDisplayUnits('m');
  // tag all untagged: the left room only
  const untagged = () => { const tg = new Set(RB.readTags(W(ed)).map((x) => x.target)); return roomsOf().filter((r) => !tg.has(r.guid)).map((r) => r.guid); };
  ok(untagged().length === 1 && untagged()[0] === leftGuid, 'one room is untagged');
  ed.modelChange(SP.placeTags(untagged().map((g) => ({ target: g }))));
  ok(RB.readTags(W(ed)).length === 2 && untagged().length === 0, 'Tag all untagged: two tags, none left');
  // the tag follows: rename the room, then move the east wall out to x = 8000 (the room's middle goes to (2000 + 7942.85) / 2 = 4971.425)
  ed.modelChange(SP.nameRoom(rightGuid, { name: 'Assembly' }));
  ok(RB.readTags(W(ed)).find((x) => x.target === rightGuid).text.split('\n')[1] === 'Assembly', 'the tag follows a new name in the same step');
  const east = snap(ed).walls.find((x) => near(x.a[0], 6000) && near(x.b[0], 6000));
  ed.modelChange(OPS.changeWall(east.guid, { a: [8000, east.a[1]], b: [8000, east.b[1]] }));
  rooms = roomsOf();
  const bigR = rooms.find((r) => r.guid === rightGuid);
  tags = RB.readTags(W(ed));
  // right room now (8000 - 57.15 - 2000) x 3885.7 = 5942.85 x 3885.7 = 23 092 132.245 mm2 = 23.09 m2
  ok(bigR && near(bigR.loop.area, 5942.85 * 3885.7, 0.05) && near(5942.85 * 3885.7, 23092132.245, 0.05), 'the east wall moved to x = 8000: the room is 5942.85 x 3885.7 = 23 092 132.245', bigR?.loop?.area);
  { const tg = tags.find((x) => x.target === rightGuid);
    ok(tg && near(tg.at[0], 4971.425, 0.05) && near(tg.at[1], 2500, 0.05) && tg.text === 'W-01\nAssembly\n23.09 m²', 'its tag went with it to (4971.425, 2500) and now says 23.09 m2', [tg?.at, tg?.text]); }
  ed.undo();
  ok(near(RB.readTags(W(ed)).find((x) => x.target === rightGuid).at[0], 3971.425, 0.05), 'undo of the wall move puts the tag back too (one step)');
  // move a tag by hand, change its paper height
  { const tg = RB.readTags(W(ed)).find((x) => x.target === leftGuid);
    ed.modelChange(SP.moveTag(tg.guid, { offset: [-300, -700], paper: 3.5 }));
    const t2 = RB.readTags(W(ed)).find((x) => x.guid === tg.guid), sd = roomsOf().find((r) => r.guid === leftGuid).seed;
    ok(near(t2.at[0], sd[0] - 300, 0.05) && near(t2.at[1], sd[1] - 700, 0.05) && near(t2.paper, 3.5, 1e-9), 'a tag moved by hand keeps its offset (-300, -700) from the room\'s middle; its text is 3.5 mm on paper'); }
  // deleting the separator ends the left room: its tag goes with it, in the same step
  ed.modelChange(SP.removeBounds([bounds[0].guid]));
  tags = RB.readTags(W(ed));
  ok(roomsOf().length === 1 && tags.length === 1 && tags[0].target === rightGuid && tags[0].text.endsWith('22.87 m²'), 'the separator deleted: one room again (22.87 m2), and the tag of the room that is gone went with it', tags.map((x) => x.text));
  ed.undo();
  ok(roomsOf().length === 2 && RB.readTags(W(ed)).length === 2, 'undo: two rooms and two tags again');

  // ================================================================================================ areas
  console.log('== Area, Area Boundary, Tag Area');
  const wallsNow = () => snap(ed).walls;
  // gross building: the four walls picked on their outer face (drawn anticlockwise, so the outside is on the right)
  ed.modelChange(SP.drawBounds({ storey: L1().guid, kind: 'area', scheme: 'gross', lines: wallsNow().map((x) => { const [a, b] = RB.wallFaceLine(wallsNow(), x, 'right'); return { a, b, wall: x.guid, face: 'right' }; }) }));
  ed.modelChange(SP.placeArea({ storey: L1().guid, scheme: 'gross', seed: [3000, 2000], name: 'Ground floor' }));
  let areas = RB.readAreas(W(ed));
  // outer faces: (6000 + 114.3) x (4000 + 114.3) = 6114.3 x 4114.3 = 25 156 064.49; round it 2 x (6114.3 + 4114.3) = 20 457.2
  ok(areas.length === 1 && areas[0].enclosed && near(areas[0].area, 6114.3 * 4114.3, 0.5) && near(6114.3 * 4114.3, 25156064.49, 0.05) && near(areas[0].perimeter, 20457.2, 0.05), 'Gross building area by picking the walls\' outer faces: 6114.3 x 4114.3 = 25 156 064.49 mm2, 20 457.2 mm round', areas[0]);
  { const l = ed.api.GetLine(ed.mid, areas[0].id, false), q = qto(ed, areas[0].id, 'Qto_SpaceBaseQuantities');
    ok(l.constructor.name === 'IfcSpace' && l.LongName.value === 'Ground floor' && l.Name.value === '1' && l.PredefinedType?.value === 'GFA' && !l.Representation && near(q.GrossFloorArea, 25.156064, 1e-5) && q.NetFloorArea === undefined, 'an IfcSpace of type GFA with no body, GrossFloorArea 25.156064 m2 and no net area (it is not a room)', [l.PredefinedType?.value, q]); }
  ok(roomsOf().length === 2 && snap(ed).derived.spaces.length === 2, 'the rooms do not count it as a room');
  // rentable: drawn by hand on the centre lines: 6000 x 4000 = 24 000 000
  ed.modelChange(SP.drawBounds({ storey: L1().guid, kind: 'area', scheme: 'rentable', lines: box(0, 0, 6000, 4000) }));
  ed.modelChange(SP.placeArea({ storey: L1().guid, scheme: 'rentable', seed: [1000, 1000], name: 'Unit A', number: 'R1', type: 'Office' }));
  areas = RB.readAreas(W(ed));
  const rent = areas.find((a) => a.scheme === 'rentable'), gross = areas.find((a) => a.scheme === 'gross');
  ok(rent && near(rent.area, 24000000, 0.05) && rent.type === 'Office' && rent.number === 'R1' && near(gross.area, 25156064.49, 0.5), 'Rentable on the centre lines: 6000 x 4000 = 24 000 000; the gross area is not disturbed by the other scheme\'s lines');
  ok(ed.api.GetLine(ed.mid, rent.id, false).PredefinedType?.value === 'USERDEFINED' && ed.api.GetLine(ed.mid, rent.id, false).ObjectType.value === 'Rentable', 'rentable is USERDEFINED with ObjectType Rentable');
  // an area with nothing closed round it measures nothing and says so
  ed.modelChange(SP.placeArea({ storey: L1().guid, scheme: 'rentable', seed: [20000, 20000], name: 'Nowhere' }));
  { const a = RB.readAreas(W(ed)).find((x) => x.name === 'Nowhere'); ok(a && !a.enclosed && a.area === 0, 'an area placed where no boundary closes is kept, measures 0 and is marked not enclosed (advice, not a refusal)'); ed.undo(); }
  // the picked boundaries follow their walls: the north wall to y = 5000 → gross 6114.3 x 5114.3 = 31 270 364.49; the drawn rentable lines stay
  const north = wallsNow().find((x) => near(x.a[1], 4000) && near(x.b[1], 4000));
  ed.modelChange(OPS.changeWall(north.guid, { a: [north.a[0], 5000], b: [north.b[0], 5000] }));
  areas = RB.readAreas(W(ed));
  ok(near(areas.find((a) => a.scheme === 'gross').area, 6114.3 * 5114.3, 0.5) && near(6114.3 * 5114.3, 31270364.49, 0.05) && near(areas.find((a) => a.scheme === 'rentable').area, 24000000, 0.05), 'the north wall moved to y = 5000: the gross area follows its walls (6114.3 x 5114.3 = 31 270 364.49); the hand-drawn rentable lines stay (24 000 000)', areas.map((a) => a.area));
  ed.undo();
  ok(near(RB.readAreas(W(ed)).find((a) => a.scheme === 'gross').area, 25156064.49, 0.5), 'undo: 25 156 064.49 again');
  // tag the areas
  ed.modelChange(SP.placeTags(RB.readAreas(W(ed)).map((a) => ({ target: a.guid }))));
  tags = RB.readTags(W(ed));
  ok(tags.filter((x) => x.kind === 'area').length === 2 && tags.find((x) => x.target === rent.guid).text === 'R1\nUnit A\n24.00 m²' && tags.find((x) => x.target === gross.guid).text === '1\nGround floor\n25.16 m²', 'Tag Area: R1 / Unit A / 24.00 m2 and 1 / Ground floor / 25.16 m2', tags.filter((x) => x.kind === 'area').map((x) => x.text));
  ed.modelChange(SP.changeAreaOp(rent.guid, { name: 'Unit B', type: 'Store' }));
  ok(RB.readTags(W(ed)).find((x) => x.target === rent.guid).text === 'R1\nUnit B\n24.00 m²' && RB.readAreas(W(ed)).find((a) => a.guid === rent.guid).type === 'Store', 'renamed: the tag follows, the type is Store');
  ed.modelChange(SP.removeAreas([rent.guid]));
  ok(RB.readAreas(W(ed)).length === 1 && RB.readTags(W(ed)).filter((x) => x.kind === 'area').length === 1, 'the area deleted: its tag goes with it');
  ed.undo();
  saved['rooms-areas-tags'] = ed.save();
  { const e2 = await boot(saved['rooms-areas-tags']);
    const b2 = RB.readBounds(W(e2)), a2 = RB.readAreas(W(e2)), t2 = RB.readTags(W(e2)), r2 = roomsOf(e2);
    ok(b2.filter((b) => b.kind === 'room').length === 1 && b2.filter((b) => b.kind === 'area' && b.scheme === 'gross' && b.wall).length === 4 && b2.filter((b) => b.scheme === 'rentable').length === 4, 'saved and reopened: 1 separator, 4 picked gross boundaries (each still knows its wall), 4 rentable lines', b2.length);
    ok(r2.length === 2 && r2.some((r) => near(r.loop.area, LEFT, 0.05)) && r2.some((r) => r.number === 'W-01' && r.name === 'Assembly'), 'the two rooms are still two (the separator still bounds them), names kept');
    ok(a2.length === 2 && near(a2.find((a) => a.scheme === 'gross').area, 25156064.49, 0.5) && a2.find((a) => a.scheme === 'rentable').name === 'Unit B' && t2.length === 4, 'both areas with their numbers, and four tags');
    // a change in the reopened file still follows: the separator deleted there
    e2.modelChange(SP.removeBounds([b2.find((b) => b.kind === 'room').guid]));
    ok(roomsOf(e2).length === 1 && RB.readTags(W(e2)).filter((x) => x.kind === 'room').length === 1, 'and in the reopened file the separator can be deleted: one room, one room tag'); }
  // ================================================================================================ shafts and vertical openings
  console.log('== Shaft and Vertical Opening: three levels 3000 apart, the same 6000 x 4000 walls on each, floors, ceilings, a roof');
  ed = await fresh('Shafts', 3, 3000);
  const LV = () => snap(ed).levels;
  for (const l of LV()) ed.modelChange(OPS.drawWalls({ storey: l.guid, segs: box(0, 0, 6000, 4000), typeKey: 'int-2x4' }));
  for (const l of LV()) ed.modelChange(OPS.placeFloor({ storey: l.guid, seed: [3000, 2000], mode: 'room', kind: 'concrete' }));
  for (const l of LV().slice(0, 2)) ed.modelChange(OPS.placeCeiling({ storey: l.guid, seed: [3000, 2000], mode: 'room', height: 2700 }));
  ed.modelChange(OPS.placeRoof({ storey: LV()[2].guid, seed: [3000, 2000] }));
  const der = () => snap(ed).derived;
  const floorOf = (i) => der().floors.find((f) => f.storey === LV()[i].id), ceilOf = (i) => der().ceilings.find((c) => c.storey === LV()[i].id);
  const FT = 152.4;   // a concrete floor is 6 in thick
  ok(der().floors.length === 3 && der().ceilings.length === 2 && der().roofs.length === 1 && near(floorOf(1).thickness, FT, 1e-6), 'three concrete floors 152.4 thick, two ceilings at 2700, one roof');
  const voids = () => count(ed, 'IFCRELVOIDSELEMENT'), openings = () => count(ed, 'IFCOPENINGELEMENT');
  const v0 = voids(), o0 = openings();
  // a 1000 x 2000 shaft from Level 1 to Level 3. Level 1's floor has its top AT the base (touching, not cut); Level 2's and Level 3's floors
  // (2847.6 to 3000, 5847.6 to 6000) and the two ceilings (2700 and 5700) are in the way: 4 elements, 2 000 000 mm2 out of each
  const SH = rect(1000, 1000, 2000, 3000);
  ed.modelChange(SP.placeShaft({ kind: 'shaft', storey: LV()[0].guid, points: SH, base: LV()[0].guid, top: LV()[2].guid }));
  let shafts = SO.readShafts(W(ed));
  ok(shafts.length === 1 && shafts[0].kind === 'shaft' && shafts[0].openings.length === 4 && openings() - o0 === 4 && voids() - v0 === 4, 'Shaft, Level 1 to Level 3: ONE group, four IfcOpeningElements, each voiding one element', [shafts[0]?.openings.length, openings() - o0]);
  { const hostIds = shafts[0].openings.map((o) => o.host).sort((a, b) => a - b), want = [floorOf(1).id, floorOf(2).id, ceilOf(0).id, ceilOf(1).id].sort((a, b) => a - b);
    ok(JSON.stringify(hostIds) === JSON.stringify(want) && !hostIds.includes(floorOf(0).id), 'it cuts the floors of Level 2 and Level 3 and the ceilings of Level 1 and Level 2; Level 1\'s own floor (its top is the shaft\'s base) is not cut'); }
  ok(shafts[0].openings.every((o) => near(o.area, 2000000, 0.05)), 'each opening takes 1000 x 2000 = 2 000 000 mm2 out');
  { const g = ed.api.GetLine(ed.mid, shafts[0].id, false), o = ed.api.GetLine(ed.mid, shafts[0].openings[0].id, false);
    ok(g.constructor.name === 'IfcGroup' && g.ObjectType.value === 'CadCraft.Shaft' && o.constructor.name === 'IfcOpeningElement' && o.Representation && count(ed, 'IFCRELASSIGNSTOGROUP') >= 1, 'an IfcGroup (CadCraft.Shaft) of IfcOpeningElements with bodies'); }
  // quantities: floor gross = the room 22 870 064.49; net = 20 870 064.49 mm2 = 20.870064 m2; volume x 0.1524 = 3.180598 m3
  { const q = qto(ed, floorOf(1).id, 'Qto_SlabBaseQuantities'), q0 = qto(ed, floorOf(0).id, 'Qto_SlabBaseQuantities'), qc = qto(ed, ceilOf(0).id, 'Qto_CoveringBaseQuantities');
    ok(near(q.GrossArea, 22.870064, 1e-5) && near(q.NetArea, 20.870064, 1e-5) && near(q.NetVolume, 20.870064 * 0.1524, 1e-5) && near(20.870064 * 0.1524, 3.180598, 1e-5), 'Level 2 floor: gross 22.870064, net 20.870064 m2 (2.0 deducted), volume 3.180598 m3', q);
    ok(near(q0.NetArea, 22.870064, 1e-5) && near(qc.GrossArea, 22.870064, 1e-5) && near(qc.NetArea, 20.870064, 1e-5), 'Level 1 floor is whole (22.870064); Level 1 ceiling: net 20.870064', [q0.NetArea, qc]); }
  if (QS) {
    const w = W(ed), s = snap(ed), loops = new Map(), loopsFor = (id) => { if (!loops.has(id)) loops.set(id, OPS.loopsOf(ed, id)); return loops.get(id); };
    const fi = QS.floorInputs(w, s, loopsFor), ci = QS.ceilingInputs(w, s, loopsFor);
    const f2 = fi.find((x) => x.id === floorOf(1).id), f1 = fi.find((x) => x.id === floorOf(0).id), c1 = ci.find((x) => x.id === ceilOf(0).id);
    ok(f2.holes.length === 1 && near(f2.holes[0], 2000000, 0.05) && f1.holes.length === 0 && c1.holes.length === 1, 'the Floors and Finishes schedules get the same deduction (one hole of 2 000 000 on the cut floor and ceiling, none on Level 1\'s floor)', [f2.holes, f1.holes, c1.holes]);
    const m = (await import(path.join(APP, 'quantities/rules.js'))).outlineArea(f2.outer, f2.holes);
    ok(near(m.gross, 22870064.49, 0.05) && near(m.deductions, 2000000, 0.05) && near(m.net, 20870064.49, 0.05) && near(m.gross - m.deductions, m.net, 1e-6), 'by the shared rule `floor`: gross 22 870 064.49 less 2 000 000 is 20 870 064.49', m);
  }
  ed.undo();
  ok(SO.readShafts(W(ed)).length === 0 && openings() === o0 && voids() === v0 && near(qto(ed, floorOf(1).id, 'Qto_SlabBaseQuantities').NetArea, 22.870064, 1e-5), 'undo: the shaft, its four openings and the deductions are gone in one step');
  ed.redo();
  shafts = SO.readShafts(W(ed));
  ok(shafts.length === 1 && shafts[0].openings.length === 4 && near(qto(ed, floorOf(1).id, 'Qto_SlabBaseQuantities').NetArea, 20.870064, 1e-5), 'redo: back, the same');
  const shaftGuid = shafts[0].guid;
  // it follows: Level 2's floor made thicker (its opening's body is made again), then deleted (the shaft lets go), then put back (cut again)
  { const k0 = shafts[0].openings.find((o) => o.host === floorOf(1).id).key;
    ed.modelChange(OPS.changeDerived([floorOf(1).guid], { thickness: 300 }));
    const s2 = SO.readShafts(W(ed))[0], o2 = s2.openings.find((o) => o.host === floorOf(1).id), q = qto(ed, floorOf(1).id, 'Qto_SlabBaseQuantities');
    // net volume 20.870064 x 0.3 = 6.261019 m3
    ok(s2.openings.length === 4 && o2 && o2.key !== k0 && near(q.NetArea, 20.870064, 1e-5) && near(q.NetVolume, 6.261019, 1e-5), 'the Level 2 floor made 300 thick: its opening is made again for the new thickness, net volume 20.870064 x 0.3 = 6.261019 m3', q);
    const fg = floorOf(1).guid;
    ed.modelChange(OPS.removeElements({ walls: [], openings: [], derived: [fg] }));
    ok(SO.readShafts(W(ed))[0].openings.length === 3 && openings() - o0 === 3, 'that floor deleted: the shaft has three openings left, none left hanging');
    ed.modelChange(OPS.placeFloor({ storey: LV()[1].guid, seed: [3000, 2000], mode: 'room', kind: 'concrete' }));
    ok(SO.readShafts(W(ed))[0].openings.length === 4 && near(qto(ed, floorOf(1).id, 'Qto_SlabBaseQuantities').NetArea, 20.870064, 1e-5), 'a new floor on Level 2: the shaft cuts it without being asked (net 20.870064)'); }
  // edit as one thing: the outline made 1000 x 1000 → 1 000 000 out of each; the top raised 5000 above Level 3 → the roof is cut too
  ed.modelChange(SP.changeShaftOp(shaftGuid, { points: rect(1000, 1000, 2000, 2000) }));
  ok(SO.readShafts(W(ed))[0].openings.every((o) => near(o.area, 1000000, 0.05)) && near(qto(ed, floorOf(2).id, 'Qto_SlabBaseQuantities').NetArea, 21.870064, 1e-5), 'the outline changed to 1000 x 1000: every opening follows, Level 3 floor net 21.870064');
  ed.undo();
  const roof = () => der().roofs[0];
  const rq0 = qto(ed, roof().id, 'Qto_RoofBaseQuantities');
  ed.modelChange(SP.changeShaftOp(shaftGuid, { topOffset: 5000 }));
  { const s2 = SO.readShafts(W(ed))[0], faces = new Set(roof().parts), roofOps = s2.openings.filter((o) => faces.has(o.host)), rq = qto(ed, roof().id, 'Qto_RoofBaseQuantities');
    const plan = roofOps.reduce((a, o) => a + o.area, 0), pitch = roof().pitch, cos = Math.cos(pitch * Math.PI / 180);
    // the roof's faces all have the roof's pitch (a hip roof, 6 in 12 = 26.565 degrees, cos 0.894427): the shaft's 2 000 000 of plan is 2 000 000 / 0.894427 = 2 236 068 mm2 of roof
    ok(roofOps.length >= 1 && near(plan, 2000000, 0.5) && near(pitch, 26.565, 0.001) && near(cos, 0.894427, 1e-6), 'the top raised 5000: the roof is cut too, face by face (' + roofOps.length + ' faces), 2 000 000 mm2 of plan in all', [roofOps.length, plan, pitch]);
    ok(near(rq.GrossArea, rq0.GrossArea, 1e-6) && near(rq0.NetArea, rq0.GrossArea, 1e-6) && near(rq.GrossArea - rq.NetArea, 2.236068, 1e-5), 'roof quantities: gross unchanged, net less 2 000 000 / cos 26.565 = 2.236068 m2 of roof surface', [rq0, rq]);
    ok(s2.openings.length === 4 + roofOps.length, 'and the four below are still there'); }
  saved['shaft'] = ed.save();
  { const e2 = await boot(saved['shaft']), s2 = SO.readShafts(W(e2));
    ok(s2.length === 1 && s2[0].guid === shaftGuid && near(s2[0].topOffset, 5000, 1e-6) && s2[0].points.length === 4 && s2[0].openings.length === SO.readShafts(W(ed))[0].openings.length, 'saved and reopened: one shaft, its outline, levels, offset and openings');
    e2.modelChange(SP.removeShaftsOp([shaftGuid]));
    const d2 = snap(e2).derived, f2 = d2.floors.find((f) => f.storey === snap(e2).levels[1].id);
    ok(SO.readShafts(W(e2)).length === 0 && count(e2, 'IFCOPENINGELEMENT') === o0 && near(qto(e2, f2.id, 'Qto_SlabBaseQuantities').NetArea, 22.870064, 1e-5) && near(qto(e2, d2.roofs[0].id, 'Qto_RoofBaseQuantities').NetArea, rq0.NetArea, 1e-6), 'deleted there as one thing: every opening gone, floor and roof whole again'); }
  // a second reader: the cut is real geometry for web-ifc (the Level 3 floor's mesh has more triangles than an uncut one's)
  { const IU = await import(path.join(APP, 'ifc-util.js'));
    const tri = (e, id) => { try { const r = IU.productTriangles(e.api, e.mid, id, 1); return (r.idx || r.index || r.indices || []).length / 3; } catch (err) { return -1; } };
    const cut = tri(ed, floorOf(2).id), whole = tri(ed, floorOf(0).id);
    ok(cut > whole && whole > 0, 'web-ifc builds the cut floor with its hole (' + cut + ' triangles against ' + whole + ' for the uncut floor)', [cut, whole]); }
  ed.modelChange(SP.removeShaftsOp([shaftGuid]));
  ok(openings() === o0 && SO.readShafts(W(ed)).length === 0, 'the shaft deleted here too');

  console.log('== Vertical Opening: one element, one outline');
  // 500 x 500 in Level 1's floor: 250 000 out → net 22 620 064.49
  ed.modelChange(SP.placeShaft({ kind: 'vertical', storey: LV()[0].guid, points: rect(4000, 1000, 4500, 1500), host: floorOf(0).guid }));
  { const s2 = SO.readShafts(W(ed)), q = qto(ed, floorOf(0).id, 'Qto_SlabBaseQuantities');
    ok(s2.length === 1 && s2[0].kind === 'vertical' && s2[0].openings.length === 1 && s2[0].openings[0].host === floorOf(0).id && near(q.NetArea, 22.620064, 1e-5) && near(qto(ed, floorOf(1).id, 'Qto_SlabBaseQuantities').NetArea, 22.870064, 1e-5), 'a 500 x 500 opening in Level 1\'s floor only: net 22.620064 m2; the floor above is untouched', q); }
  // one that hangs over the edge: x from -1000 to 1000, y 1000 to 2000; the floor starts at the wall's inner face x = 57.15 → (1000 - 57.15) x 1000 = 942 850 on the floor
  ed.modelChange(SP.placeShaft({ kind: 'vertical', storey: LV()[0].guid, points: rect(-1000, 1000, 1000, 2000), host: floorOf(0).guid }));
  { const s2 = SO.readShafts(W(ed)), o = s2.find((x) => x.points.some((q) => near(q[0], -1000)))?.openings[0], q = qto(ed, floorOf(0).id, 'Qto_SlabBaseQuantities');
    ok(o && near(o.area, 942850, 0.05) && near(q.NetArea, (22870064.49 - 250000 - 942850) / 1e6, 1e-5), 'an outline half off the floor deducts only the part on it: (1000 - 57.15) x 1000 = 942 850; net 21.677214 m2', [o?.area, q.NetArea]); }
  // in a ceiling and in the roof
  ed.modelChange(SP.placeShaft({ kind: 'vertical', storey: LV()[1].guid, points: rect(3000, 1000, 3600, 1600), host: ceilOf(1).guid }));
  ok(near(qto(ed, ceilOf(1).id, 'Qto_CoveringBaseQuantities').NetArea, 22.870064 - 0.36, 1e-5), 'a 600 x 600 opening in Level 2\'s ceiling: 0.36 m2 out');
  ed.modelChange(SP.placeShaft({ kind: 'vertical', storey: LV()[2].guid, points: rect(2500, 500, 3500, 1000), host: roof().guid }));
  { const rq = qto(ed, roof().id, 'Qto_RoofBaseQuantities');
    // 1000 x 500 = 500 000 of plan on the south face: 500 000 / 0.894427 = 559 017 mm2 of roof
    ok(near(rq.GrossArea - rq.NetArea, 0.559017, 1e-5), 'a 1000 x 500 skylight opening in the roof: 0.5 / cos 26.565 = 0.559017 m2 of roof out', [rq.GrossArea - rq.NetArea]); }
  // delete the host: the opening that belonged to it goes with it
  { const before = SO.readShafts(W(ed)).length;
    ed.modelChange(OPS.removeElements({ walls: [], openings: [], derived: [ceilOf(1).guid] }));
    ok(SO.readShafts(W(ed)).length === before - 1, 'the ceiling deleted: its vertical opening is gone with it (nothing left to cut)'); }
  // a drawn floor (a balcony) is cut the same way
  ed.modelChange(MF.placeDrawnFloor({ storey: LV()[1].guid, points: rect(7000, 0, 9000, 2000), kind: 'concrete', thickness: 200 }));
  { const df = MF.readDrawnFloors(W(ed))[0];
    ed.modelChange(SP.placeShaft({ kind: 'vertical', storey: LV()[1].guid, points: rect(7500, 500, 8000, 1000), host: df.guid }));
    const q = qto(ed, df.id, 'Qto_SlabBaseQuantities');
    // 2000 x 2000 = 4 m2 gross, 0.25 out: 3.75 net, x 0.2 = 0.75 m3
    ok(near(q.GrossArea, 4, 1e-6) && near(q.NetArea, 3.75, 1e-6) && near(q.NetVolume, 0.75, 1e-6), 'a drawn floor 2000 x 2000 x 200 with a 500 x 500 vertical opening: 4 gross, 3.75 net, 0.75 m3', q); }
  saved['vertical-openings'] = ed.save();
  ok(SO.readShafts(W(await boot(saved['vertical-openings']))).length === SO.readShafts(W(ed)).length, 'saved and reopened: the same vertical openings');
  { let said = '';
    try { ed.modelChange(SP.placeShaft({ kind: 'vertical', storey: LV()[0].guid, points: [[0, 0], [10, 0]], host: floorOf(0).guid })); } catch (e) { said = e.key || e.message; }
    ok(said === 'spaces.err.outline', 'two points are not an outline: said so, nothing made'); }

  // ================================================================================================ model groups
  console.log('== Model Group');
  ed = await fresh('Groups', 1, 3000);
  const G1 = () => snap(ed).levels[0];
  // a bay: two walls in an L (4000 east, 3000 north) with a door in the first, and a 300 x 300 column at (2000, 2000)
  ed.modelChange(OPS.drawWalls({ storey: G1().guid, segs: [{ a: [0, 0], b: [4000, 0] }, { a: [4000, 0], b: [4000, 3000] }], typeKey: 'int-2x4' }));
  { const w0 = snap(ed).walls.find((x) => near(x.b[0], 4000) && near(x.b[1], 0));
    ed.modelChange(OPS.placeOpening({ wall: w0.guid, typeKey: 'door-single', offset: 1000, width: 900, height: 2100, sill: 0, hand: 'a', face: 'left' })); }
  ed.modelChange(MC.placeColumns({ storey: G1().guid, points: [[2000, 2000]], width: 300, depth: 300 }));
  const cols = () => MC.readColumns(W(ed)), wallsG = () => snap(ed).walls, doors = () => snap(ed).openings;
  const members0 = [...wallsG().map((x) => x.guid), cols()[0].guid];
  ed.modelChange(SP.groupOp({ name: 'Bay', members: members0 }));
  let groups = MG.readGroups(W(ed));
  // its origin is the lower-left corner of its members: the first wall's face, x = 0 (its end), y = -57.15
  ok(groups.length === 1 && groups[0].name === 'Bay' && groups[0].members.length === 3 && near(groups[0].origin[0], 0, 0.05) && near(groups[0].origin[1], -HT, 0.05), 'Model Group: two walls and a column are the group Bay; its origin is their lower-left corner (0, -57.15)', groups[0]?.origin);
  { const g = ed.api.GetLine(ed.mid, groups[0].id, false);
    ok(g.constructor.name === 'IfcGroup' && g.Name.value === 'Bay' && g.ObjectType.value === 'CadCraft.ModelGroup', 'an IfcGroup named Bay with an IfcRelAssignsToGroup to its three members'); }
  ed.undo(); ok(MG.readGroups(W(ed)).length === 0 && wallsG().length === 2, 'undo: the group is gone, its elements stay'); ed.redo();
  const bay1 = MG.readGroups(W(ed))[0];
  // place another 10 000 to the east
  ed.modelChange(SP.placeInstanceOp({ group: bay1.guid, dx: 10000, dy: 0 }));
  groups = MG.readGroups(W(ed));
  const bay2 = groups.find((g) => g.guid !== bay1.guid);
  ok(groups.length === 2 && bay2.definition === bay1.definition && bay2.name === 'Bay' && wallsG().length === 4 && cols().length === 2 && doors().length === 2, 'Place another, 10 000 east: two walls, the door and the column again (4 walls, 2 doors, 2 columns), the same group');
  { const c2 = cols().find((c) => near(c.at[0], 12000)), w2 = wallsG().find((x) => near(x.a[0], 10000) && near(x.b[0], 14000)), d2 = doors().find((o) => o.wallGuid === w2?.guid);
    ok(c2 && near(c2.at[1], 2000) && w2 && d2 && near(d2.offset, 1000, 0.05) && near(d2.width, 900, 0.05) && near(bay2.origin[0], 10000, 0.05), 'the copy stands 10 000 east: column at (12000, 2000), wall from x = 10000 to 14000, its door 1000 along'); }
  ok(MG.alikeGroups(bay2, MG.readGroups(W(ed)).find((g) => g.guid === bay1.guid)), 'both instances are alike (the same content, each from its own origin)');
  ed.undo(); ok(MG.readGroups(W(ed)).length === 1 && wallsG().length === 2 && cols().length === 1, 'undo takes the whole copy away in one step'); ed.redo();
  ok(MG.readGroups(W(ed)).length === 2 && MG.readGroups(W(ed)).some((g) => g.guid === bay2.guid) && wallsG().length === 4, 'redo makes the same copy (the same GlobalId)');
  // edit one: the north-going wall of the FIRST bay made 4500 long; the second bay's follows in the same step
  { const up = wallsG().find((x) => near(x.a[0], 4000) && near(x.b[0], 4000));
    ed.modelChange(OPS.changeWall(up.guid, { b: [4000, 4500] }));
    const up2 = wallsG().find((x) => near(x.a[0], 14000) && near(x.b[0], 14000));
    ok(up2 && near(up2.b[1], 4500, 0.05) && wallsG().length === 4 && doors().length === 2 && cols().length === 2, 'edit one: a wall of the first Bay made 4500 long; the same wall of the second is 4500 long too (still 4 walls, 2 doors, 2 columns)', up2?.b);
    const gs = MG.readGroups(W(ed));
    ok(gs.length === 2 && MG.alikeGroups(gs[0], gs[1]) && gs.every((g) => g.members.length === 3), 'both instances are alike again, three members each');
    ed.undo();
    const back = wallsG().find((x) => near(x.a[0], 14000) && near(x.b[0], 14000));
    ok(near(back.b[1], 3000, 0.05) && near(wallsG().find((x) => near(x.a[0], 4000) && near(x.b[0], 4000)).b[1], 3000, 0.05), 'undo: both walls are 3000 again (the edit and what followed are one step)');
    ed.redo(); }
  // edit the OTHER one: its door made 1200 wide; the first follows
  { const w2 = wallsG().find((x) => near(x.a[0], 10000) && near(x.b[0], 14000)), d2 = doors().find((o) => o.wallGuid === w2.guid);
    ed.modelChange(OPS.changeOpening(d2.guid, { width: 1200 }));
    const w1 = wallsG().find((x) => near(x.a[0], 0) && near(x.b[0], 4000)), d1 = doors().find((o) => o.wallGuid === w1.guid);
    ok(d1 && near(d1.width, 1200, 0.05) && doors().length === 2, 'the door of the second Bay made 1200 wide: the first Bay\'s door is 1200 too', d1?.width); }
  // move one as a whole: 500 north. It is the same group moved, so the other stays where it is and as it is
  { const g2 = MG.readGroups(W(ed)).find((g) => g.guid === bay2.guid), d = MG.describe(W(ed), g2.members);
    ed.modelChange(MM.moveElements(d.members.map((m) => ({ guid: m.guid, dx: 0, dy: 500 }))));
    const gs = MG.readGroups(W(ed)), a = gs.find((g) => g.guid === bay1.guid), b = gs.find((g) => g.guid === bay2.guid);
    ok(near(b.origin[1], -HT + 500, 0.05) && near(a.origin[1], -HT, 0.05) && MG.alikeGroups(a, b) && near(wallsG().find((x) => near(x.a[0], 0) && near(x.b[0], 4000)).a[1], 0, 0.05), 'the second Bay moved 500 north as a whole: its origin moved, the first did not follow a move', [a.origin, b.origin]); }
  // rename one: one group, one name
  ed.modelChange(SP.renameGroupOp(bay2.guid, 'Core bay'));
  ok(MG.readGroups(W(ed)).every((g) => g.name === 'Core bay'), 'renamed: every instance of the group has the new name');
  saved['groups'] = ed.save();
  { const e2 = await boot(saved['groups']), gs = MG.readGroups(W(e2));
    ok(gs.length === 2 && gs.every((g) => g.name === 'Core bay' && g.members.length === 3) && gs[0].definition === gs[1].definition, 'saved and reopened: two instances of Core bay, three members each');
    // and it still follows there: delete the column of one
    const c = MC.readColumns(W(e2))[0];
    e2.modelChange(MC.removeColumns([c.guid]));
    ok(MC.readColumns(W(e2)).length === 0 && MG.readGroups(W(e2)).every((g) => g.members.length === 2), 'in the reopened file a column deleted from one instance is gone from the other too'); }
  // ungroup one: its elements stay, and are no longer kept alike
  ed.modelChange(SP.ungroupOp([bay2.guid]));
  ok(MG.readGroups(W(ed)).length === 1 && wallsG().length === 4 && cols().length === 2, 'Ungroup: the second instance is plain elements now (4 walls, 2 columns still there)');
  { const up = wallsG().find((x) => near(x.a[0], 4000) && near(x.b[0], 4000));
    ed.modelChange(OPS.changeWall(up.guid, { b: [4000, 7000] }));
    // the second bay's wall was 4500 long and stands 500 north: its end is still at y = 5000, not 7000 + 500
    ok(near(wallsG().find((x) => near(x.a[0], 14000) && near(x.b[0], 14000)).b[1], 5000, 0.05), 'and it no longer follows an edit of the first (its wall still ends at y = 5000)'); }
  // add to a group, delete a group with its members
  ed.modelChange(OPS.drawWalls({ storey: G1().guid, segs: [{ a: [0, 8000], b: [3000, 8000] }], typeKey: 'int-2x4' }));
  { const extra = wallsG().find((x) => near(x.a[1], 8000));
    ed.modelChange(SP.addToGroupOp(bay1.guid, [extra.guid]));
    ok(MG.readGroups(W(ed))[0].members.length === 4, 'Add the picked: the group has four members');
    let said = '';
    try { ed.modelChange(SP.groupOp({ name: 'Again', members: [extra.guid] })); } catch (e) { said = e.key || e.message; }
    ok(said === 'spaces.err.group.taken', 'an element is in one group at a time: said so');
    const nW = wallsG().length;
    ed.modelChange(SP.removeGroupsOp([bay1.guid]));
    ok(MG.readGroups(W(ed)).length === 0 && wallsG().length === nW - 3 && cols().length === 1, 'the group deleted with what is in it: three walls and a column gone, the ungrouped ones stay');
    ed.undo();
    ok(MG.readGroups(W(ed)).length === 1 && wallsG().length === nW, 'undo brings the group and its elements back'); }

  // ================================================================================================ the commands, the ribbon, the words
  console.log('== Commands, ribbon and words');
  const IDS = ['room.place', 'room.separator', 'room.tag', 'area.place', 'area.boundary', 'area.tag', 'opening.shaft', 'opening.vertical', 'group.model', 'wall.opening'];
  ok(IDS.every((id) => IN.COMMANDS.some((c) => c.id === id && c.draw && /^\[data-mtool="[a-z]+"\]$/.test(c.sel))), 'the ten are registry commands, each bound to its Draw-bar button');
  ok(IDS.every((id) => typeof LANG[IN.COMMANDS.find((c) => c.id === id).label] === 'string'), 'each has its name in the language file');
  { const inStyle = (st) => { const txt = JSON.stringify(st.menus || st.tabs || []); return IDS.every((id) => txt.includes('"' + id + '"')); };
    const styled = Object.entries(IN.STYLES).filter(([, st]) => st.layout !== 'toolbar');
    const lacking = styled.map(([k, st]) => [k, IDS.filter((id) => !JSON.stringify(st).includes('"' + id + '"'))]).filter(([, l]) => l.length);
    ok(lacking.length === 0 && styled.length >= 4 && inStyle, 'and a place in every menu style that has menus or tabs', lacking); }
  const RIB = { room: 'room', roomseparator: 'roomsep', tagroom: 'tagroom', area: 'area', areaboundary: 'areabound', tagarea: 'tagarea', shaft: 'shaft', vertical: 'vopening', modelgroup: 'mgroup', wallopening: 'wsopen' };
  ok(Object.entries(RIB).every(([k, tool]) => ENG.ENGINE[k]?.tool === tool), 'the ribbon\'s ten planned buttons run those tools (workspace/engine.js)');
  { const arch = catalog.ribbon.find((r) => r.tab === 'architecture'), all = arch.groups.flatMap((g) => [...g.large, ...g.stacks.flat()]);
    ok(Object.keys(RIB).every((k) => all.includes(k) && catalog.tools[k]?.icon && catalog.tools[k].icon !== 'generic'), 'each is on the Architecture tab with an icon of its own (none left on the placeholder)', Object.keys(RIB).filter((k) => !catalog.tools[k] || catalog.tools[k].icon === 'generic')); }
  { // the icon file paints the page's choice as it loads: give it the two things it touches, then take them away again
    const had = [globalThis.document, globalThis.localStorage];
    globalThis.document ||= { documentElement: { setAttribute() {}, style: { setProperty() {}, removeProperty() {} } } };
    globalThis.localStorage ||= { getItem: () => null };
    const IC = await import(path.join(ROOT, 'public_html/assets/js/app-workspace-icons.js')).catch(() => null);
    if (!had[0]) delete globalThis.document; if (!had[1]) delete globalThis.localStorage;
    if (IC) ok(['room.place', 'room.separator', 'room.tag', 'area.place', 'area.boundary', 'area.tag', 'opening.shaft', 'opening.vertical', 'group.model', 'roomseparator', 'tagroom', 'areaboundary', 'tagarea', 'shaft', 'vertical', 'modelgroup'].every((id) => { const k = IC.iconKey(id); return k && IC.ICONS[k]; }) && new Set(['room.place', 'room.separator', 'room.tag', 'area.place', 'area.boundary', 'area.tag', 'opening.shaft', 'opening.vertical', 'group.model'].map((id) => IC.iconKey(id))).size === 9, 'the CadCraft icon set has a drawing for each of the nine new commands (nine different ones)');
    else console.log('  --   app-workspace-icons.js needs a page (window): the icon check runs in the browser test'); }
  { const used = new Set();
    for (const f of ['spaces-ui.js', 'room-bounds.js', 'slab-openings.js', 'model-groups.js', 'spaces-ops.js']) for (const m of fs.readFileSync(path.join(APP, f), 'utf8').matchAll(/'(spaces\.[a-z0-9.]+[a-z0-9])'/g)) used.add(m[1]);
    const missing = [...used].filter((k) => LANG[k] === undefined && !Object.keys(LANG).some((x) => x.startsWith(k + '.')));
    ok(missing.length === 0, 'every text key the new files name is in lang/en.json', missing); }
  ok(!/—/.test(Object.entries(LANG).filter(([k]) => k.startsWith('spaces.')).map(([, v]) => JSON.stringify(v)).join('')), 'no em dashes in the new words');
  { const help = path.join(APP, 'help');
    ok(['rooms-and-separators.md', 'areas-and-area-boundaries.md', 'room-and-area-tags.md', 'shafts-and-vertical-openings.md', 'model-groups.md'].every((f) => fs.existsSync(path.join(help, f))), 'five help topics are written'); }

  // ================================================================================================ a second reader
  {
    const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((q) => fs.existsSync(q));
    if (!py) console.log('  --   no venv with ifcopenshell: schema check skipped');
    else {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-toolsa-'));
      const files = Object.entries(saved).map(([k, b0]) => { const f = path.join(dir, k + '.ifc'); fs.writeFileSync(f, b0); return f; });
      let out = '';
      try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), ...files], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || ''); }
      const res = out.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
      ok(res.length === files.length && res.every((r) => r.errors === 0), 'IfcOpenShell finds no schema errors in ' + res.map((r) => path.basename(r.file) + ' (' + r.errors + ')').join(', ') + (res.some((r) => r.errors) ? ': ' + res.flatMap((r) => r.first).slice(0, 4).join(' | ') : ''));
      // and it reads what was written, by class
      const probe = "import ifcopenshell,json,sys\nout={}\nfor p in sys.argv[1:]:\n    f=ifcopenshell.open(p)\n    out[p.split('/')[-1]]={c:len(f.by_type(c)) for c in ['IfcVirtualElement','IfcSpace','IfcAnnotation','IfcOpeningElement','IfcGroup','IfcRelAssignsToGroup','IfcRelVoidsElement']}\n    out[p.split('/')[-1]]['gfa']=[s.PredefinedType for s in f.by_type('IfcSpace')].count('GFA')\nprint(json.dumps(out))\n";
      let seen = null;
      try { seen = JSON.parse(execFileSync(py, ['-I', '-c', probe, ...files], { encoding: 'utf8' })); } catch (e) { seen = null; }
      const a = seen?.['rooms-areas-tags.ifc'], b = seen?.['shaft.ifc'], c = seen?.['groups.ifc'];
      ok(a && a.IfcVirtualElement === 9 && a.IfcSpace === 4 && a.gfa === 1 && a.IfcAnnotation >= 4, 'IfcOpenShell reads the rooms file: 9 virtual elements (1 separator + 8 area boundaries), 4 spaces (2 rooms + 2 areas, one of type GFA), the tags', a);
      ok(b && b.IfcGroup >= 1 && b.IfcOpeningElement === b.IfcRelVoidsElement && b.IfcOpeningElement >= 5, 'the shaft file: a group, and an IfcRelVoidsElement for every IfcOpeningElement', b);
      ok(c && c.IfcGroup >= 2 && c.IfcRelAssignsToGroup >= 2, 'the groups file: the two groups with their assignments', c);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  console.log(bad ? `\n${bad} FAILED (${good} ok)` : `\nall ok (${good})`);
  return bad ? 1 : 0;
}

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --mlwall` (0.7 BIM-MLWALL, session bim-07): walls that run through several levels. A wall is
 * stored on the level it starts on; its top follows any level above it or a fixed height. Checks, on a three-level building
 * made here: the height to a level two up, the levels it passes (so their plans cut it), the walls a plan cuts that belong
 * to other levels, the top following a level when that level moves, undo, and the saved IFC reopened.
 */
import path from 'node:path';

export async function mlwallMode({ APP, WebIFC, IfcModel, quiet }) {
  const N = await import(path.join(APP, 'new-model.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MP = await import(path.join(APP, 'model-plan.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  let bad = 0;
  const ok = (cond, label) => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const text = N.newBuilding({ name: 'Through', levels: N.stackLevels(3, 3000, (i) => 'Level ' + (i + 1)), fileName: 't.ifc', now: new Date('2026-10-22T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  let snap = OPS.snapshotModel(ed);
  const [A, B, C] = snap.levels.map((l) => l.guid);
  const [a, b, c] = snap.levels.map((l) => l.id);

  console.log('== A wall up to the level two above');
  const P = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
  ed.modelChange(OPS.drawWalls({ storey: A, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: C }));
  ed.modelChange(OPS.drawWalls({ storey: A, segs: [{ a: [3000, 0], b: [3000, 4000] }], typeKey: 'int-2x4', topLevel: B }));
  snap = OPS.snapshotModel(ed);
  const ext = snap.walls.filter((w) => w.typeKey === 'ext-2x6'), inner = snap.walls.find((w) => w.typeKey === 'int-2x4');
  ok(ext.length === 4 && ext.every((w) => near(w.height, 6000) && w.topLevel === C && w.storey === a), 'four walls drawn on Level 1 up to Level 3: 6000 tall, stored on Level 1');
  ok(near(inner.height, 3000), 'the partition goes up to Level 2 only: 3000');
  ok(MW.wallLevelsPassed(ext[0], snap.levels).map((l) => l.guid).join() === B && MW.wallLevelsPassed(inner, snap.levels).length === 0, 'the outer walls pass Level 2; the partition passes nothing');
  ok(MW.topLevelChoices(snap.levels, a).map((l) => l.guid).join() === B + ',' + C && MW.topLevelChoices(snap.levels, c).length === 0, 'a wall on Level 1 can go up to Level 2 or Level 3; on the top level to none');

  console.log('== What each level\'s plan cuts');
  const th = (lv, cut = 1200) => MW.wallsThrough(snap.walls, snap.levels, lv, cut);
  ok(th(a).length === 0, 'Level 1 (their own level): none through');
  ok(th(b).length === 4 && th(b).every((w) => w.typeKey === 'ext-2x6'), 'Level 2 cut at 1200: the four outer walls, not the partition');
  ok(th(c).length === 0, 'Level 3: the walls end at its floor, nothing runs through');
  ok(th(b, 3100).length === 0 && th(b, 2900).length === 4, 'a cut 3100 up on Level 2 is above the wall tops (6000); one at 2900 still meets them');
  {
    const outlines = MW.wallOutlines(snap.walls.filter((w) => w.storey === a).map((w) => ({ key: w.guid, a: w.a, b: w.b, t: w.t })));
    const w0 = th(b)[0], pieces = MP.wallPieces(w0, outlines.get(w0.guid), [], 1200 + 3000);
    ok(pieces.length === 1 && pieces[0].length >= 4, 'its joined outline is drawn on Level 2 from Level 1\'s walls');
  }

  console.log('== Rooms on the level it passes close against it');
  const spacesOn = (lv) => OPS.snapshotModel(ed).derived.spaces.filter((x) => x.storey === lv);
  ok(spacesOn(a).length === 2 && spacesOn(b).length === 1 && spacesOn(c).length === 0, 'Level 1: the partition splits it into two rooms; Level 2: one room, made against the four through walls (' + [a, b, c].map((l) => spacesOn(l).length).join(' / ') + ')');
  {
    const { storeyLoops } = await import(path.join(APP, 'model-slabs.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    const L2 = storeyLoops(new ModelWriter(ed.W, ed.api, ed.mid), b);
    ok(L2.rooms.length === 1 && Math.abs(Math.abs(MW.polyArea(L2.rooms[0].poly)) - (6000 - 184.15) * (4000 - 184.15)) < 2e6 && L2.walls.length === 4, 'its room is the inside of the four walls (' + Math.round(Math.abs(MW.polyArea(L2.rooms[0].poly)) / 1e6 * 100) / 100 + ' m²)');
  }

  console.log('== Doors and windows on the upper level');
  const OP = await import(path.join(APP, 'model-openings.js'));
  const south = snap.walls.find((w) => w.typeKey === 'ext-2x6' && w.a[1] === 0 && w.b[1] === 0);
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 1000, face: 'left', sill: 3000 }));
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'win-double-hung', offset: 3000, face: 'right', sill: 3900 }));
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 4500, face: 'left', sill: 1234 }));
  snap = OPS.snapshotModel(ed);
  const ops3 = snap.openings.filter((o) => o.wallGuid === south.guid);
  ok(ops3.length === 3 && ops3.find((o) => o.kind === 'window').sill === 3900, 'a window 900 above Level 2\'s floor is stored 3900 above the wall\'s level');
  const doors = ops3.filter((o) => o.kind === 'door').sort((x, y) => x.offset - y.offset);
  ok(doors[0].sill === 3000 && doors[1].sill === 0, 'a door on Level 2\'s floor stands at 3000; a door at a height that is no floor is put on the wall\'s own floor (0)');
  ok(inner && OPS.snapshotModel(ed).walls.some((x) => x.guid === inner.guid), 'the partition is untouched');
  {
    const e0 = ed.save();
    const ps = new TextDecoder().decode(e0);
    ok((ps.match(/IFCDOOR\(/g) || []).length === 2 && (ps.match(/IFCWINDOW\(/g) || []).length === 1 && (ps.match(/IFCOPENINGELEMENT\(/g) || []).length === 3, 'IFC: two doors, a window, three openings');
  }
  ed.modelChange(OPS.changeOpening(doors[0].guid, { offset: 1500, sill: 0 }));
  ok(OPS.snapshotModel(ed).openings.find((o) => o.guid === doors[0].guid).sill === 3000, 'moving the upper door keeps it on Level 2\'s floor (a sill of 0 typed in does not drop it)');

  console.log('== The top follows its level');
  ed.modelChange(OPS.changeLevel(C, { elevation: 6600 }));
  snap = OPS.snapshotModel(ed);
  ok(snap.walls.filter((w) => w.typeKey === 'ext-2x6').every((w) => near(w.height, 6600)), 'Level 3 moved up 600: the outer walls are 6600 tall');
  ok(MW.wallsThrough(snap.walls, snap.levels, b, 1200).length === 4, 'still running through Level 2');
  ed.modelChange(OPS.changeWall(ext[0].guid, { topLevel: B, topOffset: 0 }));
  snap = OPS.snapshotModel(ed);
  const w1 = snap.walls.find((w) => w.guid === ext[0].guid);
  ok(near(w1.height, 3000) && MW.wallsThrough(snap.walls, snap.levels, b, 1200).length === 3, 'one wall sent back to Level 2: 3000 tall, three still run through');
  ok(spacesOn(b).length === 0, 'and Level 2\'s room is gone: three walls no longer close it');
  ed.undo();
  snap = OPS.snapshotModel(ed);
  ok(near(snap.walls.find((w) => w.guid === ext[0].guid).height, 6600) && MW.wallsThrough(snap.walls, snap.levels, b, 1200).length === 4 && spacesOn(b).length === 1, 'undo puts it back up to Level 3, and the room with it');

  console.log('== A fixed height that passes a level');
  ed.modelChange(OPS.drawWalls({ storey: A, segs: [{ a: [0, 6000], b: [4000, 6000] }, { a: [0, 7000], b: [4000, 7000] }], typeKey: 'cmu-8', height: 3200 }));
  ed.modelChange(OPS.changeWall(OPS.snapshotModel(ed).walls.find((w) => w.a[1] === 7000).guid, { height: 2800 }));
  snap = OPS.snapshotModel(ed);
  const tall = snap.walls.find((w) => w.a[1] === 6000), short = snap.walls.find((w) => w.a[1] === 7000);
  const ids = MW.wallsThrough(snap.walls, snap.levels, b, 100).map((w) => w.guid);
  ok(ids.includes(tall.guid) && !ids.includes(short.guid), 'a 3200 wall passes Level 2\'s floor (a cut at 100 meets it); a 2800 one does not');

  console.log('== Saved and reopened');
  const bytes = ed.save();
  const e2 = await quiet(IfcModel.create)(WebIFC, null);
  const m2 = await quiet((b2) => e2.load(b2))(bytes);
  ok(m2.types.find((t) => t.name === 'IfcWall')?.count === 7, 'cc-ifc reopens the seven walls');
  const txt = new TextDecoder().decode(bytes);
  ok((txt.match(/IFCWALL\(/g) || []).length === 7 && /'CadCraft_Wall'/.test(txt) && /IFCMATERIALLAYERSETUSAGE/.test(txt), 'IFC: seven IfcWall, each with its layer set usage, stored on the level it starts on');
  console.log(bad ? `\n${bad} FAILED` : '\nall ok');
  return bad ? 1 : 0;
}

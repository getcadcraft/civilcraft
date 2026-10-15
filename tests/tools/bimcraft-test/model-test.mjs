/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --model` (0.5 part 3, track BM): the building tools in Node, on models made here (no client
 * files). Units, wall joins (L, T, X, a line, three at a point), levels, walls drawn into a new building through
 * IfcEditor.modelChange (undo, redo), saved and reopened in cc-ifc and — when installed — web-ifc (the oracle) with the
 * same element counts, joined outlines, heights that follow a level, quantities, deleting.
 * Called by bin/test-bimcraft.mjs with what it has set up (the build's folder, the engine, quiet()).
 */
import path from 'node:path';
import fs from 'node:fs';

export async function modelMode({ APP, ROOT, WebIFC, IfcModel, quiet, require, args = [] }) {
  const U = await import(path.join(APP, 'model-units.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const ML = await import(path.join(APP, 'model-levels.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  let bad = 0, good = 0;
  const ok = (cond, label) => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const IN = 25.4;
  const saved = {};   // name → bytes, validated at the end

  console.log('== Units');
  ok(U.fmtLen(3810, 'ftin') === "12'-6\"" && U.fmtLen(12.7, 'ftin') === '1/2"' && U.fmtLen(304.8 * 10 + 6.35, 'ftin') === "10'-0 1/4\"" && U.fmtLen(-12.7, 'ftin') === '-1/2"', 'feet-inches to 1/16", fractions reduced, negatives');
  ok(U.fmtLen(3810.4, 'mm') === '3810' && U.fmtLen(4.25, 'mm') === '4.3' && U.fmtLen(3000, 'mm', { unit: true }) === '3000 mm', 'millimetres');
  ok(near(U.parseLen("12'6\"", 'ftin'), 3810) && near(U.parseLen("12' 6", 'ftin'), 3810) && near(U.parseLen("12'-6 1/2\"", 'ftin'), 3822.7) && near(U.parseLen('6', 'ftin'), 152.4) && near(U.parseLen('6 1/2', 'ftin'), 165.1) && near(U.parseLen('1/2', 'ftin'), 12.7), "feet and inches: 12'6\", 12' 6, fractions, bare inches");
  ok(near(U.parseLen('3000', 'mm'), 3000) && near(U.parseLen('3.81 m', 'ftin'), 3810) && near(U.parseLen('12 ft', 'mm'), 3657.6) && Number.isNaN(U.parseLen('abc', 'mm')), 'millimetres, any unit typed, refusals');
  const ty = (s, u = 'mm') => JSON.stringify(U.parseTyped(s, u));
  ok(ty('3000') === '{"kind":"len","len":3000}' && ty('3000<90') === '{"kind":"polar","len":3000,"angle":90}' && ty('@1200,-300') === '{"kind":"rel","dx":1200,"dy":-300}' && ty('1200, 3400') === '{"kind":"abs","x":1200,"y":3400}' && U.parseTyped('x') === null && U.parseTyped('-5', 'mm') === null, 'typed input: length, polar, relative, absolute, refusals');
  ok(U.parseTyped("@12',0", 'ftin').dx === 3657.6, 'relative steps take feet too');

  console.log('== Joins (plan outlines)');
  const area = (p) => Math.abs(MW.polyArea(p));
  const has = (p, x, y) => p.some((q) => near(q[0], x, 0.001) && near(q[1], y, 0.001));
  {
    // an L: (0,0)→(4000,0) and (4000,0)→(4000,3000), 200 thick: mitred at the corner
    const o = MW.wallOutlines([{ key: 'A', a: [0, 0], b: [4000, 0], t: 200 }, { key: 'B', a: [4000, 0], b: [4000, 3000], t: 200 }]);
    const A = o.get('A'), B = o.get('B');
    ok(has(A, 4100, -100) && has(A, 3900, 100) && has(B, 4100, -100) && has(B, 3900, 100), 'L: both walls share the mitre (outer 4100,−100 and inner 3900,100)');
    ok(near(area(A) + area(B), 4000 * 200 + 3000 * 200, 1), 'L: the two outlines cover the corner once (' + Math.round(area(A) + area(B)) + ' mm²)');
  }
  {
    // a closed 6 × 4 m room: four mitres, the outlines add up to the ring
    const P = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
    const ws = P.map((p, i) => ({ key: 'W' + i, a: p, b: P[(i + 1) % 4], t: 200 }));
    const o = MW.wallOutlines(ws);
    const ring = 6200 * 4200 - 5800 * 3800;
    ok(near([...o.values()].reduce((s, p) => s + area(p), 0), ring, 1) && [...o.values()].every((p) => p.length === 4), 'room: four trapezoids, total = the ring 6200×4200 − 5800×3800');
  }
  {
    // a T: a 100-thick stem from the middle of a 200-thick wall: it stops at the face
    const o = MW.wallOutlines([{ key: 'A', a: [0, 0], b: [4000, 0], t: 200 }, { key: 'S', a: [2000, 0], b: [2000, 2000], t: 100 }]);
    const S = o.get('S'), A = o.get('A');
    ok(has(S, 1950, 100) && has(S, 2050, 100) && !S.some((q) => q[1] < 99.99), 'T: the stem starts at the through wall\'s face (y = 100)');
    ok(A.length === 4 && near(area(A), 800000, 0.01), 'T: the through wall is untouched');
    const o2 = MW.wallOutlines([{ key: 'A', a: [0, 0], b: [4000, 0], t: 200 }, { key: 'S', a: [2000, 100], b: [2000, 2000], t: 100 }]);
    ok(has(o2.get('S'), 1950, 100) && near(area(o2.get('S')), 1900 * 100, 0.01), 'T drawn to the face instead of the centre line: the same');
  }
  {
    // three walls at a point (a T of three ends): the centre filled, no overlap
    const o = MW.wallOutlines([{ key: 'L', a: [0, 0], b: [-3000, 0], t: 200 }, { key: 'R', a: [0, 0], b: [3000, 0], t: 200 }, { key: 'U', a: [0, 0], b: [0, 3000], t: 200 }]);
    const tot = [...o.values()].reduce((s, p) => s + area(p), 0);
    ok(near(tot, 6000 * 200 + 2900 * 200, 1), 'three ends at a point: corners round the node, the middle filled once (' + Math.round(tot) + ')');
  }
  {
    // two walls in a line: square ends; different thicknesses step
    const o = MW.wallOutlines([{ key: 'A', a: [0, 0], b: [3000, 0], t: 200 }, { key: 'B', a: [3000, 0], b: [6000, 0], t: 100 }]);
    ok(near(area(o.get('A')), 600000) && near(area(o.get('B')), 300000), 'in a line: square ends, each its own thickness');
    // X: crossing walls are left alone
    const x = MW.wallOutlines([{ key: 'A', a: [0, 0], b: [4000, 0], t: 200 }, { key: 'B', a: [2000, -2000], b: [2000, 2000], t: 200 }]);
    ok(near(area(x.get('A')), 800000) && near(area(x.get('B')), 800000), 'X: crossing walls keep their rectangles');
    // a very short wall between two mitres falls back to its rectangle
    const s = MW.wallOutlines([{ key: 'A', a: [0, 0], b: [3000, 0], t: 200 }, { key: 'B', a: [3000, 0], b: [3000, 50], t: 200 }, { key: 'C', a: [3000, 50], b: [0, 50], t: 200 }]);
    ok([...s.values()].every((p) => area(p) > 0), 'a wall shorter than its mitres: every outline still a simple polygon');
    // an acute 20° corner: no spike (square ends)
    const ac = MW.wallOutlines([{ key: 'A', a: [0, 0], b: [3000, 0], t: 200 }, { key: 'B', a: [0, 0], b: [3000 * Math.cos(0.349), 3000 * Math.sin(0.349)], t: 200 }]);
    ok([...ac.values()].every((p) => p.every((q) => q[0] > -150)), 'a 20° corner is cut square, no long mitre spike');
  }

  console.log('== A new building, levels');
  const lv = (n, h) => N.stackLevels(n, h, (i) => 'Level ' + (i + 1));
  const text = N.newBuilding({ name: 'Model test', levels: lv(2, 3000), fileName: 'm.ifc', now: new Date('2026-10-14T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  let snap = OPS.snapshotModel(ed);
  ok(snap.levels.length === 2 && snap.levels[0].height === 3000 && snap.levels[1].elevation === 3000 && snap.levels.every((l) => l.own), 'two levels read back: elevations 0 / 3000, heights from CadCraft_Level');
  const L1 = snap.levels[0].guid, L2 = snap.levels[1].guid;

  console.log('== Draw a room (one undo step)');
  const P = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
  const segs = P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] }));
  const r = ed.modelChange(OPS.drawWalls({ storey: L1, segs, typeKey: 'ext-2x6', topLevel: L2 }), { label: '4 walls', verb: 'Drew' });
  snap = OPS.snapshotModel(ed);
  const th = MW.typeThickness(MW.wallType('ext-2x6'));
  ok(r.ids.length === 4 && snap.walls.length === 4 && snap.walls.every((x) => near(x.t, th) && near(x.height, 3000)), 'four walls, ' + th.toFixed(2) + ' mm thick, 3000 tall (to Level 2)');
  ok(near(snap.walls[1].a[0], 6000) && near(snap.walls[1].b[1], 4000) && near(snap.walls[2].len, 6000), 'read back in plan: positions and lengths');
  const bytes1 = ed.save();
  const txt1 = new TextDecoder().decode(bytes1);
  ok((txt1.match(/IFCWALL\(/g) || []).length === 4 && (txt1.match(/IFCWALLTYPE\(/g) || []).length === 1 && /IFCMATERIALLAYERSETUSAGE\(#\d+,\.AXIS2\.,\.NEGATIVE\./.test(txt1), 'IFC: 4 IfcWall, 1 IfcWallType, layer set usages (exterior on the left: NEGATIVE)');
  ok(/'Qto_WallBaseQuantities'/.test(txt1) && /'Pset_WallCommon'/.test(txt1) && /IFCARBITRARYCLOSEDPROFILEDEF\(\.AREA\./.test(txt1) && /'Axis','Curve2D'/.test(txt1), 'Qto_WallBaseQuantities, Pset_WallCommon, swept outline, Axis curve');
  const e2 = await quiet(IfcModel.create)(WebIFC, null);
  const m2 = await quiet((b) => e2.load(b))(bytes1);
  ok(m2.elements === 4 && m2.types.find((t) => t.name === 'IfcWall')?.count === 4, 'cc-ifc reopens it: 4 walls with geometry');
  // the walls' volume in the mesh: the ring × 3 m
  const vol = meshVolume(m2) / 1e9;
  const ringV = ((6000 + th) * (4000 + th) - (6000 - th) * (4000 - th)) * 3000 / 1e9;
  ok(near(vol, ringV, 0.01), 'mesh volume ' + vol.toFixed(3) + ' m³ = the joined ring ' + ringV.toFixed(3) + ' m³ (mitres, no overlap)');
  const q = qtoOf(txt1);
  ok(q.Length && near(q.Length[0], 6000) && q.GrossVolume && q.Height && near(q.Height[0], 3000), 'quantities: Length 6000 mm, Height 3000 mm written');

  console.log('== The plan: cut from the meshes, drawn walls from their outlines');
  {
    const P2 = await import(path.join(APP, 'model-plan.js'));
    const w2 = new ModelWriter(WebIFC, e2.api, m2.modelID);
    const st = ML.readLevels(w2)[0];
    const M = P2.viewerToPlan(e2.api.GetCoordinationMatrix(m2.modelID), w2.storeyWorld(st.id));
    const c = P2.planCut(m2, { M, storey: st.id, cutZ: 1200 });
    const loops = [...c.cut.values()].map((s) => P2.chainLoops(s));
    ok(c.cut.size === 4 && loops.every((l) => l.length === 1), 'the room cut at 1200: 4 walls, each one closed outline');
    const b = c.bounds;
    ok(near(b.x0, -th / 2, 0.5) && near(b.x1, 6000 + th / 2, 0.5) && near(b.y1, 4000 + th / 2, 0.5), 'the cut lies where the walls were drawn (outer faces at ' + b.x0.toFixed(1) + ' … ' + b.x1.toFixed(1) + ')');
    const none = P2.planCut(m2, { M, storey: st.id, cutZ: 3500 });
    ok(none.cut.size === 0 && none.below.size === 4, 'cut above the walls (3500): nothing cut, all 4 seen from above');
    const wall = { a: [0, 0], b: [4000, 0], baseOffset: 0 };
    const pieces = P2.wallPieces(wall, [[0, -100], [4000, -100], [4000, 100], [0, 100]], [{ offset: 1000, width: 900, sill: 0, height: 2100 }, { offset: 2500, width: 1200, sill: 1500, height: 900 }], 1200);
    ok(pieces.length === 2 && near(Math.max(...pieces[0].map((q) => q[0])), 1000) && near(Math.min(...pieces[1].map((q) => q[0])), 1900), 'wallPieces: a door cut out of the plan; a high window (sill 1500) left in');
  }
  console.log('== Snapping');
  {
    const T = await import(path.join(APP, 'model-tools.js'));
    const ws = [{ a: [0, 0], b: [4000, 0], t: 200 }];
    const s1 = T.snapPoint([4050, 40], { walls: ws }, { tol: 100 });
    ok(s1.kind === 'end' && (near(s1.p[0], 4000) && (near(s1.p[1], 0) || near(Math.abs(s1.p[1]), 100))), 'near a wall end: snaps to it (or its face corner): ' + s1.p.join());
    ok(T.snapPoint([2030, 20], { walls: ws }, { tol: 100 }).kind === 'mid', 'near the middle: midpoint');
    const s3 = T.snapPoint([3000, 140], { walls: ws }, { tol: 100 });
    ok(s3.kind === 'on' && near(s3.p[1], 100), 'beside the wall: onto its face (y = 100)');
    const s4 = T.snapPoint([3000, 2000], {}, { tol: 50, from: [0, 0], ortho: true });
    ok(s4.kind === 'ortho' && near(s4.p[1], 0) && near(s4.p[0], 3000, 1), 'Shift: square to the last point');
    const s5 = T.snapPoint([2000, 2050], {}, { tol: 50, from: [0, 0], step: 15, round: 10 });
    ok(s5.kind === 'angle' && near(Math.atan2(s5.p[1], s5.p[0]) * 180 / Math.PI, 45, 1e-6) && near(Math.hypot(...s5.p) / 10, Math.round(Math.hypot(...s5.p) / 10), 1e-6), 'near 45°: held at 45°, the length rounded to 10 mm');
    const s6 = T.snapPoint([2000, 1500], {}, { tol: 50, from: [0, 0], step: 15, round: 12.7 });
    ok(s6.kind === 'free' && near(Math.hypot(...s6.p) / 12.7, Math.round(Math.hypot(...s6.p) / 12.7), 1e-6), 'a free direction: the length rounded to 1/2"');
    ok(T.closesChain([[0, 0], [10, 0], [10, 10]], [0, 0.5], 1) && !T.closesChain([[0, 0], [10, 0]], [0, 0], 1), 'closing a chain needs three points and the first one');
    ok(T.loopSide([[0, 0], [10, 0], [10, 10], [0, 10]]) === 'right' && T.loopSide([[0, 0], [0, 10], [10, 10], [10, 0]]) === 'left', 'anticlockwise loop: outside on the right; clockwise: on the left');
  }

  console.log('== Undo, redo');
  ed.undo();
  snap = OPS.snapshotModel(ed);
  ok(snap.walls.length === 0 && !/IFCWALL\(/.test(new TextDecoder().decode(ed.save())), 'undo: no walls left in the file');
  const rr = ed.redo();
  snap = OPS.snapshotModel(ed);
  ok(rr && snap.walls.length === 4 && [...rr.made.keys()].every((g) => snap.walls.some((x) => x.guid === g)), 'redo: the same four walls (same GlobalIds)');

  console.log('== A T wall, levels change heights');
  ed.modelChange(OPS.drawWalls({ storey: L1, segs: [{ a: [3000, 0], b: [3000, 4000] }], typeKey: 'int-2x4', topLevel: L2 }));
  snap = OPS.snapshotModel(ed);
  const tw = snap.walls.find((x) => x.typeKey === 'int-2x4');
  const w0 = new ModelWriter(WebIFC, engine.api, engine.modelID);
  const tShape = MW.storedShape(w0, tw.id);
  const xs = tShape.points.map((p) => p[0]);
  ok(near(Math.min(...xs), th / 2, 0.01) && near(Math.max(...xs), 4000 - th / 2, 0.01), 'the T wall runs face to face: ' + Math.min(...xs).toFixed(2) + ' → ' + Math.max(...xs).toFixed(2));
  ed.modelChange(OPS.changeLevel(L1, { height: 3600 }));
  snap = OPS.snapshotModel(ed);
  ok(near(snap.levels[1].elevation, 3600) && snap.walls.every((x) => near(x.height, 3600)), 'Level 1 made 3600 tall: Level 2 moves up, every wall follows to 3600');
  ed.undo();
  snap = OPS.snapshotModel(ed);
  ok(near(snap.levels[1].elevation, 3000) && snap.walls.every((x) => near(x.height, 3000)), 'undo puts the level and the walls back');
  ed.modelChange(OPS.newLevel({ name: 'Roof', elevation: 6000, height: 3000 }));
  snap = OPS.snapshotModel(ed);
  ok(snap.levels.length === 3 && snap.levels[2].name === 'Roof' && near(snap.levels[2].elevation, 6000), 'a new level at 6000');
  ed.modelChange(OPS.changeLevel(snap.levels[2].guid, { name: 'Roof deck' }));
  ok(OPS.snapshotModel(ed).levels[2].name === 'Roof deck', 'renamed');

  console.log('== Change a wall, delete a wall');
  const south = snap.walls.find((x) => near(x.a[1], 0) && near(x.b[1], 0) && x.typeKey === 'ext-2x6');
  ed.modelChange(OPS.changeWall(south.guid, { a: [-1000, 0] }));
  snap = OPS.snapshotModel(ed);
  const west = snap.walls.find((x) => x.typeKey === 'ext-2x6' && near(x.a[0], 0) && near(x.a[1], 4000) && near(x.b[0], -1000) && near(x.b[1], 0));
  ok(snap.walls.find((x) => x.guid === south.guid).len > 6999 && west, 'moving the south wall\'s start drags the joined west wall\'s end with it');
  ed.modelChange(OPS.changeWall(south.guid, { typeKey: 'cmu-8' }));
  snap = OPS.snapshotModel(ed);
  const s2 = snap.walls.find((x) => x.guid === south.guid);
  ok(s2.typeKey === 'cmu-8' && near(s2.t, 7.625 * IN) && /block/i.test(s2.name), 'change type: thickness and name follow (' + s2.name + ')');
  ed.modelChange(OPS.changeWall(s2.guid, { height: 2400 }));
  ok(near(OPS.snapshotModel(ed).walls.find((x) => x.guid === s2.guid).height, 2400), 'a fixed height');
  ed.modelChange(OPS.removeWalls([s2.guid]));
  snap = OPS.snapshotModel(ed);
  ok(snap.walls.length === 4 && !snap.walls.some((x) => x.guid === s2.guid), 'deleted');
  const bytes2 = ed.save();
  const dangling = danglingRefs(new TextDecoder().decode(bytes2));
  ok(!dangling.length, 'saved file: no reference to a missing line' + (dangling.length ? ' (' + dangling.slice(0, 5).join(', ') + ')' : ''));
  const e3 = await quiet(IfcModel.create)(WebIFC, null);
  const m3 = await quiet((b) => e3.load(b))(bytes2);
  ok(m3.elements === 4, 'cc-ifc reopens it with 4 walls');
  // the oracle
  try {
    const W = require('web-ifc');
    const a = new W.IfcAPI(); await quiet(() => a.Init())();
    const id = a.OpenModel(bytes1);
    let tris = 0;
    a.StreamAllMeshes(id, (mesh) => { for (let i = 0; i < mesh.geometries.size(); i++) { const g = a.GetGeometry(id, mesh.geometries.get(i).geometryExpressID); tris += g.GetIndexDataSize() / 3; g.delete(); } });
    ok(a.GetLineIDsWithType(id, W.IFCWALL).size() === 4 && tris > 0, 'web-ifc (oracle) opens the room: 4 walls, ' + tris + ' triangles');
  } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped'); }
  console.log('== Doors and windows (BM.4)');
  {
    const O = await import(path.join(APP, 'model-openings.js'));
    const text2 = N.newBuilding({ name: 'Openings', levels: lv(2, 3000), fileName: 'o.ifc', now: new Date('2026-10-14T12:00:00Z') });
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(new TextEncoder().encode(text2));
    const ed2 = new IfcEditor(WebIFC, eng);
    let s = OPS.snapshotModel(ed2);
    const [A, B] = s.levels.map((l) => l.guid);
    const R = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
    ed2.modelChange(OPS.drawWalls({ storey: A, segs: R.map((p, i) => ({ a: p, b: R[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: B, extSide: 'right' }));
    s = OPS.snapshotModel(ed2);
    const south = s.walls.find((x) => near(x.a[1], 0) && near(x.b[1], 0));
    const th2 = south.t;
    const vol0 = await reopenVolume(ed2);
    const d = ed2.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 1000, face: 'left' }), { label: 'Door', verb: 'Placed' });
    s = OPS.snapshotModel(ed2);
    const door = s.openings[0];
    ok(s.openings.length === 1 && door.kind === 'door' && near(door.offset, 1000) && near(door.width, 914.4) && near(door.height, 2032) && door.sill === 0, 'a 3\'-0" × 6\'-8" door at 1000 along the south wall');
    let txt = new TextDecoder().decode(ed2.save());
    ok(/IFCDOOR\(/.test(txt) && /IFCOPENINGELEMENT\(/.test(txt) && /IFCRELVOIDSELEMENT\(/.test(txt) && /IFCRELFILLSELEMENT\(/.test(txt) && /IFCDOORTYPE\(/.test(txt) && /\.SINGLE_SWING_LEFT\./.test(txt), 'IFC: IfcDoor in an IfcOpeningElement (voids + fills), IfcDoorType, SINGLE_SWING_LEFT');
    ok(/'Pset_DoorCommon'/.test(txt) && /'Qto_DoorBaseQuantities'/.test(txt) && /IFCSTYLEDITEM\(/.test(txt), 'Pset_DoorCommon, Qto_DoorBaseQuantities, coloured parts');
    const vol1 = await reopenVolume(ed2, { skip: ['IfcDoor', 'IfcWindow'] });
    ok(near(vol0 - vol1, 914.4 * 2032 * th2 / 1e9, 0.002), 'cc-ifc cuts the wall: ' + (vol0 - vol1).toFixed(4) + ' m³ out = the opening ' + (914.4 * 2032 * th2 / 1e9).toFixed(4));
    const qs = qtoOf(txt);
    ok(qs.NetSideArea.some((v) => near(v, (6000 * 3000 - 914.4 * 2032) / 1e6, 1e-4)), 'the wall\'s NetSideArea takes the door off: ' + ((6000 * 3000 - 914.4 * 2032) / 1e6).toFixed(4) + ' m²');
    const sym = O.openingSymbol(door, south);
    ok(sym.arcs.length === 1 && near(sym.arcs[0].r, 914.4 - 2 * 1.5 * 25.4) && sym.lines.length === 3, 'plan symbol: two jambs, the open leaf and its swing arc');
    // a window on the east wall
    const east = s.walls.find((x) => near(x.a[0], 6000) && near(x.b[0], 6000));
    ed2.modelChange(OPS.placeOpening({ wall: east.guid, typeKey: 'win-double-hung', face: 'right' }));
    s = OPS.snapshotModel(ed2);
    const win = s.openings.find((o) => o.kind === 'window');
    ok(win && near(win.sill, 20 * 25.4) && near(win.offset, (4000 - 36 * 25.4) / 2) && /IFCWINDOW\(.*\.DOUBLE_PANEL_HORIZONTAL\./.test(new TextDecoder().decode(ed2.save())), 'a double-hung window, centred, sill 1\'-8", DOUBLE_PANEL_HORIZONTAL');
    // refusals
    let k = ''; try { ed2.modelChange(OPS.placeOpening({ wall: east.guid, typeKey: 'door-garage', offset: 0 })); } catch (e) { k = e.key; }
    ok(k === 'model.err.nofit', 'a 16\' garage door does not fit the 4 m wall: refused');
    k = ''; try { ed2.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'win-fixed', sill: 2500 })); } catch (e) { k = e.key; }
    ok(k === 'model.err.tootall', 'a window above the top of the wall: refused');
    ok(OPS.snapshotModel(ed2).openings.length === 2, 'a refused change leaves nothing behind');
    // move, flip, resize
    ed2.modelChange(OPS.changeOpening(door.guid, { offset: 3000, hand: 'b' }));
    s = OPS.snapshotModel(ed2);
    const d2 = s.openings.find((o) => o.guid === door.guid);
    ok(near(d2.offset, 3000) && d2.hand === 'b' && /\.SINGLE_SWING_RIGHT\./.test(new TextDecoder().decode(ed2.save())), 'moved to 3000 and hinged at the other end (SINGLE_SWING_RIGHT)');
    ed2.modelChange(OPS.changeOpening(door.guid, { offset: 99999 }));
    ok(near(OPS.snapshotModel(ed2).openings.find((o) => o.guid === door.guid).offset, 6000 - 914.4), 'moved past the end: stops at the end of the wall');
    ed2.modelChange(OPS.changeOpening(door.guid, { offset: 2000, width: 812.8 }));
    ok(near(OPS.snapshotModel(ed2).openings.find((o) => o.guid === door.guid).width, 812.8), 'resized to 2\'-8"');
    // the wall's start moves along its line: the door stays where it is in the world
    const wx = (o, wall) => wall.a[0] + o.offset;
    const before = wx(OPS.snapshotModel(ed2).openings.find((o) => o.guid === door.guid), south);
    ed2.modelChange(OPS.changeWall(south.guid, { a: [-500, 0] }));
    s = OPS.snapshotModel(ed2);
    const s2w = s.walls.find((x) => x.guid === south.guid);
    ok(near(wx(s.openings.find((o) => o.guid === door.guid), s2w), before), 'the wall grows at its start: the door keeps its place (' + before + ')');
    ed2.modelChange(OPS.changeWall(south.guid, { typeKey: 'int-2x4' }));
    s = OPS.snapshotModel(ed2);
    const vt = await reopenVolume(ed2, { skip: ['IfcDoor', 'IfcWindow'] });
    ok(Number.isFinite(vt) && s.openings.length === 2, 'a thinner wall type: its door is made again for the new thickness');
    // delete the door: the wall closes; undo brings it back; delete the wall: the window's wall… only the south one
    ed2.modelChange(OPS.removeOpenings([door.guid]));
    s = OPS.snapshotModel(ed2);
    ok(s.openings.length === 1 && !/IFCDOOR\(/.test(new TextDecoder().decode(ed2.save())), 'door deleted with its opening');
    ed2.undo();
    ok(OPS.snapshotModel(ed2).openings.length === 2, 'undo: the door is back');
    ed2.modelChange(OPS.removeWalls([east.guid]));
    s = OPS.snapshotModel(ed2);
    txt = new TextDecoder().decode(ed2.save());
    ok(s.openings.length === 1 && !/IFCWINDOW\(/.test(txt) && !danglingRefs(txt).length, 'deleting the east wall takes its window and opening; no dangling references');
    // redo chain: undo the delete, undo the type change …, redo all
    for (let i = 0; i < 3; i++) ed2.undo();
    for (let i = 0; i < 3; i++) ed2.redo();
    ok(OPS.snapshotModel(ed2).openings.length === 1, 'three undos and three redos land in the same place');
    const e9 = await quiet(IfcModel.create)(WebIFC, null);
    const m9 = await quiet((b) => e9.load(b))(ed2.save());
    ok(m9.types.some((t) => t.name === 'IfcDoor'), 'cc-ifc reopens it with its door');
    try {
      const W = require('web-ifc');
      const a = new W.IfcAPI(); await quiet(() => a.Init())();
      const id = a.OpenModel(ed2.save());
      ok(a.GetLineIDsWithType(id, W.IFCDOOR).size() === 1 && a.GetLineIDsWithType(id, W.IFCOPENINGELEMENT).size() === 1, 'web-ifc (oracle): 1 door, 1 opening');
      // the walls' volume with the opening cut: web-ifc's booleans against cc-ifc's (manifold)
      const wallIds = new Set(); const v = a.GetLineIDsWithType(id, W.IFCWALL); for (let i = 0; i < v.size(); i++) wallIds.add(v.get(i));
      let wv = 0;
      a.StreamAllMeshes(id, (mesh) => {
        if (!wallIds.has(mesh.expressID)) return;
        for (let i = 0; i < mesh.geometries.size(); i++) {
          const pg = mesh.geometries.get(i), g = a.GetGeometry(id, pg.geometryExpressID);
          const V = a.GetVertexArray(g.GetVertexData(), g.GetVertexDataSize()), I = a.GetIndexArray(g.GetIndexData(), g.GetIndexDataSize()), M = pg.flatTransformation;
          const P = (k) => { const x = V[k * 6], y = V[k * 6 + 1], z = V[k * 6 + 2]; return [M[0] * x + M[4] * y + M[8] * z + M[12], M[1] * x + M[5] * y + M[9] * z + M[13], M[2] * x + M[6] * y + M[10] * z + M[14]]; };
          for (let t = 0; t < I.length; t += 3) { const p = P(I[t]), q = P(I[t + 1]), r = P(I[t + 2]); wv += (p[0] * (q[1] * r[2] - q[2] * r[1]) - p[1] * (q[0] * r[2] - q[2] * r[0]) + p[2] * (q[0] * r[1] - q[1] * r[0])) / 6; }
          g.delete();
        }
      });
      const ccv = await reopenVolume(ed2, { skip: ['IfcDoor', 'IfcWindow', 'IfcSpace'] });
      ok(near(Math.abs(wv) * 1e9 * (1 / 1e9), ccv, 0.002), 'the walls with the door cut out: web-ifc ' + Math.abs(wv).toFixed(4) + ' m³, cc-ifc ' + ccv.toFixed(4) + ' m³');
    } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped'); }
    saved.openings = ed2.save();
    if (args.includes('--keep')) { const out = path.join(ROOT, 'tmp/bimcraft-openings.ifc'); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, ed2.save()); console.log('  (kept ' + out + ')'); }
  }
  console.log('== Change it (BM.5): custom thickness, several at once, top to a level or fixed');
  {
    const t6 = MW.wallType('ext-2x6@200');
    ok(t6 && near(MW.typeThickness(t6), 200) && near(t6.layers[2].t, 200 - (0.75 + 0.5 + 0.5) * 25.4) && /200 mm/.test(MW.typeName(t6)), 'a 2×6 wall made 200 thick: the studs take the difference (' + MW.typeName(t6) + ')');
    ok(MW.typeAt('ext-2x6', 200) === 'ext-2x6@200' && MW.typeAt('ext-2x6@200', 184.15) === 'ext-2x6' && MW.typeAt('ext-2x6', 30) === null && MW.wallType('ext-2x6@20') === null, 'typeAt: back to the starter at its own thickness; thinner than the other layers refused');
    const text3 = N.newBuilding({ name: 'Change', levels: lv(2, 3000), fileName: 'c.ifc', now: new Date('2026-10-14T12:00:00Z') });
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(new TextEncoder().encode(text3));
    const ed3 = new IfcEditor(WebIFC, eng);
    let s = OPS.snapshotModel(ed3);
    const [A, B] = s.levels.map((l) => l.guid);
    ed3.modelChange(OPS.drawWalls({ storey: A, segs: [{ a: [0, 0], b: [8000, 0] }, { a: [8000, 0], b: [8000, 5000] }], typeKey: 'ext-2x6', topLevel: B }));
    s = OPS.snapshotModel(ed3);
    const w1 = s.walls[0];
    ed3.modelChange(OPS.changeWall(w1.guid, { typeKey: MW.typeAt(w1.typeKey, 250) }));
    s = OPS.snapshotModel(ed3);
    ok(near(s.walls.find((x) => x.guid === w1.guid).t, 250) && /250 mm/.test(new TextDecoder().decode(ed3.save())), 'Thickness 250: a new wall type "Exterior 2×6, 250 mm" in the file, the wall 250 thick');
    ed3.modelChange(OPS.changeWall(w1.guid, { height: 2700 }));
    let w = OPS.snapshotModel(ed3).walls.find((x) => x.guid === w1.guid);
    ok(near(w.height, 2700) && !w.topLevel, 'Fixed height 2700: no longer follows Level 2');
    ed3.modelChange(OPS.changeWall(w1.guid, { topLevel: B, topOffset: -300 }));
    w = OPS.snapshotModel(ed3).walls.find((x) => x.guid === w1.guid);
    ok(near(w.height, 2700) && w.topLevel === B, 'Up to the level above, 300 below it: 2700, and it follows Level 2 again');
    ed3.modelChange(OPS.changeWall(w1.guid, { baseOffset: 150 }));
    w = OPS.snapshotModel(ed3).walls.find((x) => x.guid === w1.guid);
    ok(near(w.baseOffset, 150) && near(w.height, 2550) && near(w.z, 150), 'Base offset 150: it starts 150 up and ends where it did (2550 tall)');
    ed3.modelChange(OPS.placeOpening({ wall: w1.guid, typeKey: 'win-fixed', offset: 500 }));
    ed3.modelChange(OPS.placeOpening({ wall: w1.guid, typeKey: 'win-fixed', offset: 3000 }));
    s = OPS.snapshotModel(ed3);
    ed3.modelChange(OPS.changeOpenings(s.openings.map((o) => o.guid), { width: 600, typeKey: 'win-casement' }));
    s = OPS.snapshotModel(ed3);
    ok(s.openings.length === 2 && s.openings.every((o) => near(o.width, 600) && o.typeKey === 'win-casement'), 'two windows made 600 wide casements in one change');
    ed3.undo();
    ok(OPS.snapshotModel(ed3).openings.every((o) => near(o.width, 48 * 25.4) && o.typeKey === 'win-fixed'), 'one undo puts both back');
  }
  console.log('== Rooms, floors, ceilings, roofs (BM.6)');
  {
    const R = await import(path.join(APP, 'model-rooms.js'));
    const RF = await import(path.join(APP, 'model-roof.js'));
    // the loops on their own
    const ws = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]].map((p, i, P) => ({ key: 'W' + i, a: p, b: P[(i + 1) % 4], t: 200 }));
    ws.push({ key: 'T', a: [3000, 0], b: [3000, 4000], t: 100 }, { key: 'F', a: [1000, 1500], b: [2000, 1500], t: 100 });
    const L0 = R.planLoops([...MW.wallOutlines(ws).values()]);
    ok(L0.rooms.length === 2 && near(L0.rooms[0].area, 2850 * 3800 - 1000 * 100, 1) && L0.rooms[0].holes.length === 1 && near(L0.rooms[1].area, 2850 * 3800, 1), 'planLoops: two rooms either side of a T wall (inner faces), a free-standing wall a hole in the left one');
    ok(L0.outlines.length === 1 && near(L0.outlines[0].area, 6200 * 4200, 1) && R.loopAt(L0.rooms, [4500, 2000]) === L0.rooms[1], 'the building outline (outer faces); loopAt finds the room round a point');
    const s5 = 0.5, pd = Math.atan(s5) * 180 / Math.PI;
    const hip = RF.roofPlan([[0, 0], [8000, 0], [8000, 6000], [0, 6000]], { pitch: pd, overhang: 300 });
    ok(hip.kind === 'convex' && hip.faces.length === 4 && near(RF.heightAt(hip, [4000, 3000]), 1500, 0.01) && near(RF.heightAt(hip, [4000, -300]), -150, 0.01), 'roofPlan: a hip roof, 6/12 over 6 m: the ridge 1500 up, the eave 150 below the wall top at a 300 overhang');
    const gab = RF.roofPlan([[0, 0], [8000, 0], [8000, 6000], [0, 6000]], { pitch: pd, overhang: 300, gables: [1, 3] });
    ok(gab.faces.length === 2 && gab.gables.length === 2 && near(RF.heightAt(gab, [7900, 3000]), 1500, 0.01), 'gable ends on the short sides: two faces, the ridge runs to the ends');
    const ell = RF.roofPlan([[0, 0], [10000, 0], [10000, 4000], [4000, 4000], [4000, 9000], [0, 9000]], { pitch: pd, overhang: 0 });
    ok(ell.kind === 'square' && near(RF.heightAt(ell, [7000, 2000]), 1000, 0.01) && near(RF.heightAt(ell, [2000, 7000]), 1000, 0.01) && near(RF.heightAt(ell, [2000, 2000]), 1000, 0.01), 'an L: the union of its rectangles\' hip roofs (both wings and the corner at the right height)');
    ok(RF.roofPlan([[0, 0], [6000, 0], [6000, 3000], [3000, 1000], [0, 3000]], { pitch: 30 }).error === 'model.err.roofshape', 'a shape with neither square corners nor a convex outline: refused');

    const text4 = N.newBuilding({ name: 'Rooms', levels: lv(2, 3000), fileName: 'r.ifc', now: new Date('2026-10-14T12:00:00Z') });
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(new TextEncoder().encode(text4));
    const ed4 = new IfcEditor(WebIFC, eng);
    let s = OPS.snapshotModel(ed4);
    const [A, B] = s.levels.map((l) => l.guid);
    const P = [[0, 0], [8000, 0], [8000, 6000], [0, 6000]];
    ed4.modelChange(OPS.drawWalls({ storey: A, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: B, extSide: 'right' }));
    ed4.modelChange(OPS.drawWalls({ storey: A, segs: [{ a: [4000, 0], b: [4000, 6000] }], typeKey: 'int-2x4', topLevel: B }));
    s = OPS.snapshotModel(ed4);
    const th6 = MW.typeThickness(MW.wallType('ext-2x6')), th4 = MW.typeThickness(MW.wallType('int-2x4'));
    const roomA = (4000 - th6 / 2 - th4 / 2) * (6000 - th6);
    ok(s.derived.spaces.length === 2 && s.derived.spaces.map((x) => x.number).sort().join() === '101,102' && s.derived.spaces.every((x) => /Room \d/.test(x.name)), 'two rooms appear as the walls close them: spaces 101 and 102, "Room 1" and "Room 2"');
    let txt = new TextDecoder().decode(ed4.save());
    const q = qtoOf(txt);
    ok((q.NetFloorArea || []).length === 2 && q.NetFloorArea.every((v) => near(v, roomA / 1e6, 1e-4)), 'NetFloorArea of each: ' + (roomA / 1e6).toFixed(4) + ' m² (inside faces)');
    ok(/IFCRELAGGREGATES\([^;]*#\d+,\(#\d+,#\d+\)\)/.test(txt) && /'Qto_SpaceBaseQuantities'/.test(txt), 'spaces aggregated into the level, with Qto_SpaceBaseQuantities');
    // delete the middle wall: one room
    const mid = s.walls.find((x) => x.typeKey === 'int-2x4');
    ed4.modelChange(OPS.removeWalls([mid.guid]));
    s = OPS.snapshotModel(ed4);
    ok(s.derived.spaces.length === 1 && near(qtoOf(new TextDecoder().decode(ed4.save())).NetFloorArea[0], (8000 - th6) * (6000 - th6) / 1e6, 1e-4), 'the middle wall deleted: the two rooms become one (the other space deleted)');
    ed4.undo();
    ok(OPS.snapshotModel(ed4).derived.spaces.length === 2, 'undo: two rooms again');
    // a floor in room 101, one under the whole building, a ceiling
    ed4.modelChange(OPS.placeFloor({ storey: A, seed: [2000, 3000], mode: 'room', kind: 'wood' }));
    ed4.modelChange(OPS.placeFloor({ storey: A, seed: [2000, 3000], mode: 'building', kind: 'concrete', offset: -304.8 }));
    ed4.modelChange(OPS.placeCeiling({ storey: A, seed: [6000, 3000], height: 2700 }));
    s = OPS.snapshotModel(ed4);
    txt = new TextDecoder().decode(ed4.save());
    const fq = qtoOf(txt);
    ok(s.derived.floors.length === 2 && s.derived.ceilings.length === 1 && /IFCSLAB\([^;]*\.FLOOR\.\)/.test(txt) && /IFCCOVERING\([^;]*\.CEILING\.\)/.test(txt), 'two floors (IfcSlab .FLOOR.) and a ceiling (IfcCovering .CEILING.)');
    ok((fq.NetArea || []).some((v) => near(v, roomA / 1e6, 1e-4)) && (fq.GrossArea || []).some((v) => near(v, (8000 + th6) * (6000 + th6) / 1e6, 1e-4)), 'the room floor covers the room; the building floor reaches the outside faces');
    // walls move: the room, its floor and the building floor follow
    const east = s.walls.find((x) => near(x.a[0], 8000) && near(x.b[0], 8000));
    ed4.modelChange(OPS.changeWall(east.guid, { a: [9000, 0], b: [9000, 6000] }));
    s = OPS.snapshotModel(ed4);
    txt = new TextDecoder().decode(ed4.save());
    ok(qtoOf(txt).GrossArea.some((v) => near(v, (9000 + th6) * (6000 + th6) / 1e6, 1e-4)) && s.derived.spaces.length === 2, 'the east wall moved 1000 out: the building floor grows with it, the rooms are still two');
    // a hip roof on Level 2 over the walls of Level 1
    ed4.modelChange(OPS.placeRoof({ storey: A, seed: [2000, 3000], pitch: pd, overhang: 300 }));
    s = OPS.snapshotModel(ed4);
    txt = new TextDecoder().decode(ed4.save());
    const roof = s.derived.roofs[0];
    // RC.1 (bim-residential): the roof also aggregates its fascia (IfcMember) and soffit (IfcCovering)
    ok(roof && roof.parts.length === 6 && /IFCROOF\([^;]*\.HIP_ROOF\.\)/.test(txt) && (txt.match(/\.ROOF\.\)/g) || []).length === 4 && roof.storey === s.levels[1].id, 'a hip roof: IfcRoof on Level 2 with four IfcSlab .ROOF. faces');
    const e7 = await quiet(IfcModel.create)(WebIFC, null);
    const m7 = await quiet((b) => e7.load(b))(ed4.save());
    let zTop = -Infinity;
    for (const b of m7.batches) for (let i = 0; i < b.elems.ids.length; i++) if (roof.parts.includes(b.elems.ids[i])) for (let v = b.elems.v0[i]; v < b.elems.v0[i] + b.elems.vn[i]; v++) zTop = Math.max(zTop, b.positions[v * 3 + 1] * 1000);
    const C7 = e7.api.GetCoordinationMatrix(m7.modelID);
    const ridge = 3000 + (6000 + th6) / 2 * s5 + 8 * 25.4 * Math.sqrt(1 + s5 * s5);
    ok(near(zTop - C7[13] * 1000, ridge, 2), 'cc-ifc draws it: the ridge\'s top at ' + (zTop - C7[13] * 1000).toFixed(0) + ' mm (the wall top 3000 + half the width × 6/12 + the roof\'s thickness)');
    ok(qtoOf(txt).ProjectedArea?.some((v) => near(v, (9000 + th6 + 600) * (6000 + th6 + 600) / 1e6, 1e-3)), 'Qto_RoofBaseQuantities: the projected area includes the overhang');
    ed4.modelChange(OPS.changeDerived([roof.guid], { gables: [1, 3] }));
    s = OPS.snapshotModel(ed4);
    txt = new TextDecoder().decode(ed4.save());
    ok(s.derived.roofs[0].parts.length === 6 && /\.GABLE_ROOF\./.test(txt) && (txt.match(/\.ROOF\.\)/g) || []).length === 2, 'gable ends on two sides: two faces and two gable walls');
    let k = ''; try { ed4.modelChange(OPS.changeDerived([roof.guid], { pitch: 85 })); } catch (e) { k = e.key; }
    ok(k === 'model.err.pitch', 'a pitch of 85° is refused');
    // the walls move again: the roof is made again over them
    ed4.modelChange(OPS.changeWall(east.guid, { a: [10000, 0], b: [10000, 6000] }));
    txt = new TextDecoder().decode(ed4.save());
    ok(qtoOf(txt).ProjectedArea.some((v) => near(v, (10000 + th6 + 600) * (6000 + th6 + 600) / 1e6, 1e-3)) && !danglingRefs(txt).length, 'the wall moves on: the roof follows; no dangling references');
    // an L-shaped building's roof
    const text5 = N.newBuilding({ name: 'L', levels: lv(2, 3000), fileName: 'l.ifc', now: new Date('2026-10-14T12:00:00Z') });
    const eng5 = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng5.load(b))(new TextEncoder().encode(text5));
    const ed5 = new IfcEditor(WebIFC, eng5);
    const lv5 = OPS.snapshotModel(ed5).levels;
    const LP = [[0, 0], [10000, 0], [10000, 4000], [4000, 4000], [4000, 9000], [0, 9000]];
    ed5.modelChange(OPS.drawWalls({ storey: lv5[0].guid, segs: LP.map((p, i) => ({ a: p, b: LP[(i + 1) % LP.length] })), typeKey: 'ext-2x6', topLevel: lv5[1].guid, extSide: 'right' }));
    ed5.modelChange(OPS.placeRoof({ storey: lv5[0].guid, seed: [2000, 2000], pitch: pd, overhang: 300 }));
    const r5 = OPS.snapshotModel(ed5).derived.roofs[0];
    ok(r5 && (new TextDecoder().decode(ed5.save()).match(/\.ROOF\.\)/g) || []).length === 6 && OPS.snapshotModel(ed5).derived.spaces.length === 1, 'an L-shaped house: one room, a hip roof of six faces (RC.1: the straight skeleton), the valley where the wings meet');
    // levels: the rooms grow with their level
    ed4.modelChange(OPS.changeLevel(A, { height: 3300 }));
    ok(qtoOf(new TextDecoder().decode(ed4.save())).Height.filter((v) => near(v, 3300)).length >= 2, 'Level 1 made 3300 tall: its rooms are 3300 high');
    try {
      const W = require('web-ifc');
      const a = new W.IfcAPI(); await quiet(() => a.Init())();
      const id = a.OpenModel(ed4.save());
      ok(a.GetLineIDsWithType(id, W.IFCROOF).size() === 1 && a.GetLineIDsWithType(id, W.IFCSPACE).size() === 2 && a.GetLineIDsWithType(id, W.IFCCOVERING).size() === 2, 'web-ifc (oracle): the roof, two spaces, the ceiling and the roof\'s soffit');
    } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped'); }
    saved.rooms = ed4.save(); saved.lroof = ed5.save();
    if (args.includes('--keep')) { const out = path.join(ROOT, 'tmp/bimcraft-rooms.ifc'); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, ed4.save()); fs.writeFileSync(path.join(ROOT, 'tmp/bimcraft-lroof.ifc'), ed5.save()); console.log('  (kept ' + out + ')'); }
  }
  console.log('== Schedules, dimensions, the plan as a PDF (BM.7)');
  {
    const PL = await import(path.join(APP, 'model-plan.js'));
    const SC = await import(path.join(APP, 'model-schedule.js'));
    const PDF = await import(path.join(APP, 'model-pdf.js'));
    const O = await import(path.join(APP, 'model-openings.js'));
    const { t: tt } = await import(path.join(APP, 'i18n.js'));
    const text6 = N.newBuilding({ name: 'Sched', levels: lv(2, 3000), fileName: 's.ifc', now: new Date('2026-10-14T12:00:00Z') });
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(new TextEncoder().encode(text6));
    const ed6 = new IfcEditor(WebIFC, eng);
    let s = OPS.snapshotModel(ed6);
    const [A, B] = s.levels.map((l) => l.guid);
    const P = [[0, 0], [8000, 0], [8000, 6000], [0, 6000]];
    ed6.modelChange(OPS.drawWalls({ storey: A, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: B, extSide: 'right' }));
    ed6.modelChange(OPS.drawWalls({ storey: A, segs: [{ a: [4000, 0], b: [4000, 6000] }], typeKey: 'int-2x4', topLevel: B }));
    s = OPS.snapshotModel(ed6);
    const south = s.walls.find((x) => near(x.a[1], 0) && near(x.b[1], 0) && x.typeKey === 'ext-2x6' && x.len > 7000) || s.walls[0];
    ed6.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 1000, face: 'left' }));
    ed6.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'win-fixed', offset: 5000 }));
    ed6.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-double', offset: 2200, face: 'left' }));
    s = OPS.snapshotModel(ed6);
    ok(s.openings.map((o) => o.mark).sort().join() === 'D1,D2,W1', 'marks: D1, D2 for the doors, W1 for the window (IFC Tag)');
    const st = s.levels[0].id;
    const loops = new Map([[st, OPS.loopsOf(ed6, st)]]);
    const sch = SC.schedules(s, loops, { fmtLen: (mm) => U.fmtLen(mm, 'mm'), fmtArea: (a) => U.fmtArea(a, 'mm'), t: tt });
    ok(sch.doors.rows.length === 2 && sch.doors.rows[0][0] === 'D1' && sch.doors.rows[1][0] === 'D2' && sch.windows.rows.length === 1 && sch.windows.head.length === 7, 'Doors: D1, D2 in mark order; Windows: W1 with its sill');
    const wt = sch.walls.nums, wl = sch.walls.rows.map((r) => r[0]);
    const extLen = 8000 * 2 + 6000 * 2;
    ok(sch.walls.rows.length === 2 && wt.some((r) => r[0] === 4 && near(r[1], extLen)) && wt.some((r) => r[0] === 1 && near(r[1], 6000)), 'Walls by type: 4 exterior 2×6 (' + extLen + ' long), 1 interior 2×4 (6000) — ' + wl.join(', '));
    const ext = wt.find((r) => r[0] === 4);
    ok(near(ext[2], extLen * 3000 - (914.4 * 2032 + 1219.2 * 1219.2 + 1524 * 2032), 1), 'their net area leaves out the doors and the window');
    ok(sch.rooms.rows.length === 2 && sch.rooms.rows.every((r) => /^10\d$/.test(r[0])) && sch.rooms.nums.every((r) => r[0] > 20e6), 'Rooms: 101 and 102 with their areas');
    const csv = SC.scheduleCsv(sch.doors);
    ok(csv.split('\r\n').length === 5 && csv.startsWith('Mark,'), 'CSV: header, two doors, the total, through tableCsv');
    // dimensions on the south wall: corner → door → door → window → corner, and the whole length
    const here = s.walls.filter((w) => w.storey === st);
    const outl = MW.wallOutlines(here.map((w) => ({ key: w.guid, a: w.a, b: w.b, t: w.t })));
    const dims = PL.wallDims(here, outl, s.openings, (mm) => U.fmtLen(mm, 'mm'), { exteriorOf: (w) => MW.wallType(w.typeKey)?.exterior ?? true });
    const sd = dims.filter((d) => d.key === south.id);
    const th = south.t;
    ok(sd.length === 8 && sd[sd.length - 1].text === U.fmtLen(8000 + th, 'mm') && sd.every((d) => d.offPx < 0), 'south wall: a chain of 7 (corner, 2 doors, the window, corner) and the overall ' + U.fmtLen(8000 + th, 'mm') + ', all on its outside (its right)');
    ok(sd[0].text === U.fmtLen(1000 + th / 2, 'mm'), 'the first one runs from the outside corner to the door: ' + sd[0].text);
    // the plan as a PDF
    const walls = here.map((w) => { const poly = outl.get(w.guid); return { key: w.id, poly, pieces: PL.wallPieces(w, poly, s.openings.filter((o) => o.wall === w.id), 1200) }; });
    const syms = s.openings.map((o) => O.openingSymbol(o, s.walls.find((w) => w.id === o.wall)));
    const rooms = loops.get(st).rooms.map((r, i) => ({ poly: r.poly, at: r.centroid, label: ['Room ' + (i + 1), U.fmtArea(r.area, 'mm')] }));
    const L2 = (await import(path.join(APP, 'model-rooms.js'))).planLoops(walls.flatMap((w) => w.pieces));
    const wallEdges = [...L2.rooms.flatMap((r) => [r.poly, ...r.holes]), ...L2.outlines.map((o) => o.poly)];
    const pieceArea = walls.flatMap((w) => w.pieces).reduce((a, p) => a + Math.abs(MW.polyArea(p)), 0);
    const loopArea = L2.outlines.reduce((a, o) => a + o.area, 0) - L2.rooms.reduce((a, r) => a + r.area, 0);
    ok(wallEdges.length >= 2 && near(loopArea, pieceArea, 1), 'the walls\' joint outline (no mitre lines): its loops enclose exactly the walls\' area, ' + (pieceArea / 1e6).toFixed(3) + ' m²');
    const scene = { walls, wallEdges, symbols: syms, rooms, dims: dims.map((d) => ({ ...d, offPx: undefined })), cut: [], below: [] };
    const pdf = PDF.planPdf(scene, { title: 'Plan of Level 1', lines: ['Sched', 'Cut at 1200'], units: 'mm', paper: 'a4' });
    ok(new TextDecoder().decode(pdf.bytes.slice(0, 8)) === '%PDF-1.4' && pdf.scale.label === '1:50' && pdf.missing === 0, 'planPdf: a PDF 1.4, at 1:50 on A4 landscape, every character printable');
    const ft = PDF.planPdf(scene, { title: 'Plan of Level 1', units: 'ftin', paper: 'letter' });
    ok(ft.scale.label === '1/4" = 1\'-0"', 'in feet and inches on Letter: ' + ft.scale.label);
    const tmp = path.join(ROOT, 'tmp/bimcraft-plan-test.pdf');
    fs.mkdirSync(path.dirname(tmp), { recursive: true });
    fs.writeFileSync(tmp, pdf.bytes);
    try {
      const { execFileSync } = await import('node:child_process');
      const info = execFileSync('pdfinfo', [tmp], { encoding: 'utf8' });
      const txt = execFileSync('pdftotext', ['-layout', tmp, '-'], { encoding: 'utf8' });
      ok(/Pages:\s+1/.test(info) && /\(A4\)/.test(info) && /Title:\s+Plan of Level 1/.test(info), 'pdfinfo: one A4 landscape page titled "Plan of Level 1"');
      ok(/Plan of Level 1/.test(txt) && /1:50/.test(txt) && /Room 1/.test(txt) && txt.includes(U.fmtLen(8000 + th, 'mm')), 'pdftotext: the title, the scale, the rooms and the dimensions are text in it');
    } catch (e) { console.log('  --   poppler not installed: PDF checks skipped (' + (e.message || e).slice(0, 60) + ')'); }
  }
  async function reopenVolume(ed, { skip = [] } = {}) {
    const e = await quiet(IfcModel.create)(WebIFC, null);
    const m = await quiet((b) => e.load(b))(ed.save());
    const drop = new Set();
    for (const [id, cls] of m.classOf) if (skip.includes(cls)) drop.add(id);
    return meshVolume(m, drop) / 1e9;
  }

  saved.room = bytes1;
  if (args.includes('--keep')) { const out = path.join(ROOT, 'tmp/bimcraft-model.ifc'); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, bytes1); console.log('  (kept ' + out + ')'); }

  console.log('== IfcOpenShell schema validation (when a venv with it is on this machine)');
  {
    const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
    if (!py) console.log('  --   no venv with ifcopenshell: skipped');
    else {
      const { execFileSync } = await import('node:child_process');
      const os = await import('node:os');
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-model-'));
      const files = Object.entries(saved).map(([k, b]) => { const f = path.join(dir, k + '.ifc'); fs.writeFileSync(f, b); return f; });
      let out = '';
      try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), ...files], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || ''); }
      const res = out.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
      ok(res.length === files.length && res.every((r) => r.errors === 0), 'IfcOpenShell finds no schema errors in ' + res.map((r) => path.basename(r.file) + ' (' + r.errors + ')').join(', ') + (res.some((r) => r.errors) ? ': ' + res.flatMap((r) => r.first).slice(0, 3).join(' | ') : ''));
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}

/** Volume of every closed mesh in a load result, mm³ (viewer metres → mm). */
function meshVolume(m, skip = null) {
  let v = 0;
  for (const b of m.batches) {
    if (b.space) continue;
    const P = b.positions, I = b.indices;
    for (let i = 0; i < I.length; i += 3) {
      if (skip && skip.has(b.triIds[i / 3] - (m.keyBase || 0))) continue;
      const a = I[i] * 3, c = I[i + 1] * 3, d = I[i + 2] * 3;
      v += (P[a] * (P[c + 1] * P[d + 2] - P[c + 2] * P[d + 1]) - P[a + 1] * (P[c] * P[d + 2] - P[c + 2] * P[d]) + P[a + 2] * (P[c] * P[d + 1] - P[c + 1] * P[d])) / 6;
    }
  }
  return Math.abs(v) * 1e9;
}
/** Quantity values by name in IFC text: name → [values]. */
function qtoOf(txt) {
  const out = {};
  for (const m of txt.matchAll(/IFCQUANTITY(?:LENGTH|AREA|VOLUME)\('([^']+)',\$,\$,([-\d.E+]+)/g)) (out[m[1]] ||= []).push(Number(m[2]));
  return out;
}
/** #ids referenced in the DATA section that are not defined. */
function danglingRefs(txt) {
  const defined = new Set([...txt.matchAll(/^#(\d+)=/gm)].map((m) => m[1]));
  const out = new Set();
  for (const line of txt.split('\n')) {
    const body = line.replace(/^#\d+=/, '').replace(/'(?:[^']|'')*'/g, '');
    for (const m of body.matchAll(/#(\d+)/g)) if (!defined.has(m[1])) out.add('#' + m[1]);
  }
  return [...out];
}

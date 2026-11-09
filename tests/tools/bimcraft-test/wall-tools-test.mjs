/* SPDX-License-Identifier: Apache-2.0 */
/**
 * wall-tools-test.mjs — the wall tool on BimCraft's real IFC model (0.9 WT.2, WT.3, WT.4, WT.7, FX.65, FX.66, FX.67; session walls-09), DOM-free:
 *   node bin/test-bimcraft.mjs --walltools
 * Every expected value is worked out from the geometry in the comment beside it (millimetres). The spec's nine acceptance tests are re-run here
 * (tests 1-9 of docs/team-roadmap/bimcraft-wall-tool-specification.md § 10, centre-line walls, plan view, a new file each).
 */
import path from 'node:path';

export async function wallToolsMode({ APP, WebIFC, IfcModel, quiet }) {
  let bad = 0, refused = '';
  const results = {};
  const ok = (cond, label, detail = '') => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); return !!cond; };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const nearP = (p, q, e = 0.01) => near(p[0], q[0], e) && near(p[1], q[1], e);
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const MM = await import(path.join(APP, 'model-modify.js'));
  const MO = await import(path.join(APP, 'model-openings.js'));
  const WT = await import(path.join(APP, 'wall-tools.js'));
  const WS = await import(path.join(APP, 'wall-square.js'));
  const WD = await import(path.join(APP, 'wall-dimensions.js'));
  const G = await import(path.join(APP, 'model-grids.js'));
  const D = await import(path.join(APP, 'walls/draw.js'));
  const MOD = await import(path.join(APP, 'walls/modify.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const MS = await import(path.join(APP, 'model-slabs.js'));
  const MR = await import(path.join(APP, 'model-rooms.js'));
  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  const fresh = async () => {
    const ed = await boot(new TextEncoder().encode(N.newBuilding({ name: 'Walls', levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'w.ifc', now: new Date('2026-11-06T12:00:00Z') })));
    const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
    return { ed, W, L1: OPS.snapshotModel(ed).levels[0], walls: () => MW.readWalls(W()), recs: () => MW.readJoinRecords(W()) };
  };
  const rectRoom = (m, w = 5000, h = 4000) => m.ed.modelChange(WT.drawPath({ storey: m.L1.guid, path: D.rectangle([0, 0], [w, h]), typeKey: 'int-2x4', reference: 'center', height: 2700 }), { label: 'Rectangle' });
  const side = (walls, which) => {   // the room's south / north (horizontal, lowest / highest) and west / east (vertical) walls
    const hz = walls.filter((x) => near(x.a[1], x.b[1]) && !x.bulge), vt = walls.filter((x) => near(x.a[0], x.b[0]) && !x.bulge);
    const by = (list, f) => list.slice().sort((p, q) => f(p) - f(q));
    return which === 'S' ? by(hz, (x) => x.a[1])[0] : which === 'N' ? by(hz, (x) => -x.a[1])[0] : which === 'W' ? by(vt, (x) => x.a[0])[0] : by(vt, (x) => -x.a[0])[0];
  };
  const len = (x) => Math.hypot(x.b[0] - x.a[0], x.b[1] - x.a[1]);
  const roomArea = (m) => { const loops = OPS.loopsOf(m.ed, m.L1.id); return loops.rooms.map((r) => r.area).sort((a, b) => b - a); };

  console.log('== WT.2 Draw: rectangle (one action, four walls, four corner joins, one undo step)');
  let m = await fresh();
  let n0 = m.ed.changes.length;
  rectRoom(m);
  ok(m.walls().length === 4 && m.ed.changes.length === n0 + 1, 'four walls in one undo step');
  ok(m.recs().length === 4 && m.recs().every((r) => r.kind === 'L'), 'four L join records', m.recs().map((r) => r.kind));
  ok(m.walls().every((x) => x.extSide === 'right'), 'every wall has its outside outward (drawn anticlockwise: the right)');
  m.ed.undo(); ok(m.walls().length === 0, 'one undo takes all four away');
  m.ed.redo(); ok(m.walls().length === 4 && m.recs().length === 4, 'redo makes them again');
  // drawn on the outside face: the room's outside stays 5000 x 4000, so the centre lines are half a thickness in (int-2x4: 0.5 + 3.5 + 0.5 in = 114.3)
  m = await fresh();
  m.ed.modelChange(WT.drawPath({ storey: m.L1.guid, path: D.rectangle([0, 0], [5000, 4000]), typeKey: 'int-2x4', reference: 'outside', height: 2700 }));
  let ws = m.walls();
  ok(nearP(side(ws, 'S').a, [57.15, 57.15]) && ws.every((x) => x.justification === 'exterior'), 'Reference outside: centre lines 57.15 in (half of 114.3), location line on the outside face', side(ws, 'S').a);
  console.log('== WT.2 Draw: rotated rectangle, polygon (inscribed / circumscribed), arc by centre, tangent arc, pick lines, trace outline');
  m = await fresh();
  m.ed.modelChange(WT.drawPath({ storey: m.L1.guid, path: D.rotatedRectangle([0, 0], [3000, 4000], [-4000, 3000]), typeKey: 'int-2x4', height: 2700 }));
  ws = m.walls();
  ok(ws.length === 4 && ws.every((x) => near(len(x), 5000, 0.01)) && m.recs().length === 4, 'rotated rectangle: four 5000 walls at 53.13 deg, four joins');
  m = await fresh();
  m.ed.modelChange(WT.drawPath({ storey: m.L1.guid, path: D.polygon([0, 0], [3000, 0], 6), typeKey: 'int-2x4', height: 2700 }));
  ws = m.walls();
  ok(ws.length === 6 && ws.every((x) => near(len(x), 3000, 0.01)) && m.recs().length === 6, 'inscribed hexagon radius 3000: six 3000 walls (side = R), six joins');
  m.ed.modelChange(WT.drawPath({ storey: m.L1.guid, path: D.polygon([10000, 0], [13000, 0], 4, { fit: 'circumscribed' }), typeKey: 'int-2x4', height: 2700 }));
  ok(m.walls().filter((x) => x.a[0] > 6000).every((x) => near(len(x), 6000, 0.01)), 'circumscribed square about radius 3000: sides 6000');
  m = await fresh();
  m.ed.modelChange(WT.drawPath({ storey: m.L1.guid, path: D.arcByCentre([0, 0], [3000, 0], [0, 3000]), typeKey: 'int-2x4', height: 2700 }));
  ws = m.walls();
  ok(ws.length === 1 && near(ws[0].len, Math.PI * 1500, 0.05) && near(ws[0].bulge, Math.tan(Math.PI / 8), 1e-6), 'arc by centre: a quarter circle of radius 3000 is 4712.39 long (pi x 3000 / 2)', ws[0]?.len);
  const tan = D.tangentArc([0, 3000], D.endTangent({ a: [3000, 0], b: [0, 3000], bulge: ws[0].bulge }), [-3000, 0]);
  m.ed.modelChange(WT.drawPath({ storey: m.L1.guid, path: tan, typeKey: 'int-2x4', height: 2700 }));
  ws = m.walls();
  ok(ws.length === 2 && near(ws[1].len, Math.PI * 1500, 0.05) && m.recs().some((r) => r.kind === 'L'), 'tangent arc from its end to (-3000, 0): the next quarter of the same circle (same length), joined');
  const lines = [{ a: [0, 0], b: [6000, 0] }, { a: [6000, 0], b: [6000, 4000] }, { a: [6000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }, { a: [2000, -500], b: [2000, 4500] }];
  m = await fresh();
  m.ed.modelChange(WT.drawPath({ storey: m.L1.guid, path: D.chainFrom(lines, 0), typeKey: 'int-2x4', height: 2700 }));
  ok(m.walls().length === 4 && m.recs().length === 4, 'pick lines with Tab: the chain of four lines becomes four joined walls');
  m = await fresh();
  m.ed.modelChange(WT.drawPath({ storey: m.L1.guid, path: D.outlineAround(lines, [1000, 1000]), typeKey: 'int-2x4', height: 2700 }));
  ws = m.walls();
  ok(ws.length === 4 && near(Math.max(...ws.map((x) => Math.max(x.a[0], x.b[0]))), 2000, 0.01), 'trace outline: a click in the left area walls the 2000 x 4000 outline only');
  console.log('== WT.3 Set: placement offset, join off');
  m = await fresh();
  m.ed.modelChange(WT.drawPath({ storey: m.L1.guid, path: D.offsetPath({ points: [[0, 0], [5000, 0]], bulges: [0], closed: false }, 300), typeKey: 'int-2x4', height: 2700 }));
  ok(nearP(m.walls()[0].a, [0, 300]), 'placement offset 300: the wall drawn 300 to the left of the clicked line');
  m.ed.modelChange(WT.drawPath({ storey: m.L1.guid, path: { points: [[5000, 300], [5000, 3000]], bulges: [0], closed: false }, typeKey: 'int-2x4', height: 2700, joinOff: true }));
  ok(m.recs().length === 0 && m.walls()[1].joinOff.a && m.walls()[1].joinOff.b, 'Join off: a wall drawn from the first wall\'s end makes no join (free-standing)');

  console.log('== spec test 1: move with corners (5000 x 4000, top wall 500 up)');
  m = await fresh(); rectRoom(m);
  ws = m.walls();
  const top = side(ws, 'N'), area0 = roomArea(m)[0];
  n0 = m.ed.changes.length;
  m.ed.modelChange(MM.moveElements([{ guid: top.guid, dx: 0, dy: 500 }]), { label: 'Move' });
  ws = m.walls();
  const t1 = ok(near(side(ws, 'W').len ?? len(side(ws, 'W')), 4500) && near(len(side(ws, 'E')), 4500) && m.recs().length === 4, 'left and right walls lengthen by 500, all four corners stay joined')
    & ok(near(area0, (5000 - 114.3) * (4000 - 114.3), 1) && near(roomArea(m)[0], area0 + (5000 - 114.3) * 500, 1), 'the room area updates: inside faces 4885.7 x 3885.7 = 18 984 364 mm2, + 4885.7 x 500 = 21 427 214 mm2', [area0, roomArea(m)[0]]);
  results[1] = !!t1;
  console.log('== spec test 8: one undo step');
  m.ed.undo();
  results[8] = ok(m.ed.changes.length === n0 && near(len(side(m.walls(), 'W')), 4000), 'one Undo: all four walls are back');
  console.log('== spec test 2: T-junction follows');
  m.ed.modelChange(OPS.drawWalls({ storey: m.L1.guid, segs: [{ a: [2500, 0], b: [2500, 2000] }], typeKey: 'int-2x4', height: 2700 }));
  const part = m.walls()[4];
  m.ed.modelChange(MM.moveElements([{ guid: side(m.walls(), 'S').guid, dx: 0, dy: -300 }]));
  results[2] = ok(near(len(m.walls().find((x) => x.guid === part.guid)), 2300) && m.recs().some((r) => r.kind === 'T'), 'the internal wall lengthens by 300 and stays joined at the T');
  console.log('== spec test 3: Length by dimension (5000 to 6000)');
  m = await fresh(); rectRoom(m);
  let S = side(m.walls(), 'S');
  m.ed.modelChange(OPS.changeWallsBy(S.guid, (walls) => WS.setLength(walls, S.guid, 6000)));
  ws = m.walls();
  results[3] = ok(nearP(ws.find((x) => x.guid === S.guid).a, [0, 0]) && near(len(ws.find((x) => x.guid === S.guid)), 6000) && near(side(ws, 'E').a[0], 6000) && near(side(ws, 'E').b[0], 6000) && near(len(side(ws, 'N')), 6000), 'start stays, the end moves 1000, the right wall moves with it keeping its direction, the top wall lengthens 1000 (D1 option A)');
  console.log('== spec test 4: parallel distance (dimension left to right wall, type a new value)');
  m = await fresh(); rectRoom(m);
  let Wl = side(m.walls(), 'W'), El = side(m.walls(), 'E');
  m.ed.modelChange(WD.saveWallDimension({ level: m.L1.guid, view: 'plan:' + m.L1.guid, axis: 'x', offset: 500, refs: [{ wall: Wl.guid, reference: 'center', station: 0.5 }, { wall: El.guid, reference: 'center', station: 0.5 }] }));
  let dim = WD.readWallDimensions(m.W())[0], res = WD.resolveDimension(dim, m.walls());
  const dmv = MOD.dimensionMove(res, 6000, El);
  m.ed.modelChange(OPS.changeWallsBy(El.guid, (walls) => WS.squareMove(walls, El.guid, dmv)));
  ws = m.walls(); res = WD.resolveDimension(WD.readWallDimensions(m.W())[0], ws);
  results[4] = ok(near(res.value, 6000) && near(side(ws, 'W').a[0], 0) && near(len(side(ws, 'S')), 6000) && near(len(side(ws, 'N')), 6000) && m.recs().length === 4, 'type 6000: the right wall moves, the left stays, top and bottom stretch to stay joined');
  console.log('== spec test 5 (FX.65): thickness holds the location line at L, T, three walls and a curved neighbour');
  m = await fresh(); rectRoom(m);
  S = side(m.walls(), 'S');
  m.ed.modelChange(OPS.changeWall(S.guid, { justification: 'exterior' }));
  m.ed.modelChange(OPS.drawWalls({ storey: m.L1.guid, segs: [{ a: [2500, 0], b: [2500, 2000] }], typeKey: 'int-2x4', height: 2700 }));   // a partition on the south wall (T)
  m.ed.modelChange(OPS.drawWalls({ storey: m.L1.guid, segs: [{ a: [0, 0], b: [-2000, 0] }], typeKey: 'int-2x4', height: 2700 }));   // a third wall at the south-west corner
  ws = m.walls(); S = ws.find((x) => x.guid === S.guid);
  const extY0 = S.a[1] + (S.extSide === 'right' ? -1 : 1) * S.t / 2;   // the outside face (y)
  m.ed.modelChange(OPS.changeWall(S.guid, { typeKey: 'int-2x6' }));   // 114.3 -> 165.1 thick (+50.8)
  ws = m.walls(); const S2 = ws.find((x) => x.guid === S.guid), extY1 = S2.a[1] + (S2.extSide === 'right' ? -1 : 1) * S2.t / 2;
  const P2 = ws.find((x) => near(x.b[1], 2000) && near(x.b[0], 2500)), third = ws.find((x) => near(Math.min(x.a[0], x.b[0]), -2000));
  ok(near(extY1, extY0, 0.01) && near(S2.t, 165.1, 0.01), 'the outside face does not move; the wall grows inward 50.8', [extY0, extY1]);
  ok(near(side(ws, 'W').b[1], S2.a[1], 0.01) && near(side(ws, 'E').a[1], S2.b[1], 0.01), 'the L corners follow: both side walls end on the new centre line (25.4 in)', [side(ws, 'W').b, S2.a]);
  ok(P2 && near(P2.a[1], S2.a[1], 0.01), 'the T partition comes with it (its end on the new centre line)', P2?.a);
  ok(third && near(third.a[1], S2.a[1], 0.01) && m.recs().length >= 7, 'the third wall at the three-wall node follows too; joins clean up', third);
  // a curved neighbour
  m = await fresh();
  m.ed.modelChange(OPS.drawWalls({ storey: m.L1.guid, segs: [{ a: [0, 0], b: [4000, 0], justification: 'exterior' }, { a: [4000, 0], b: [6000, 2000], bulge: 0.2 }], typeKey: 'int-2x4', height: 2700 }));
  ws = m.walls(); const sw = ws[0];
  m.ed.modelChange(OPS.changeWall(sw.guid, { typeKey: 'int-2x6' }));
  ws = m.walls();
  results[5] = ok(nearP(ws[1].a, ws[0].b, 0.01), 'a curved neighbour: its end goes to the straight wall\'s new end (the corner stays joined)', [ws[0].b, ws[1].a]);
  console.log('== spec test 6 (WT.4): split keeps joins');
  m = await fresh(); rectRoom(m);
  S = side(m.walls(), 'S');
  n0 = m.ed.changes.length;
  m.ed.modelChange(WT.splitWall(S.guid, { s: 2500 }), { label: 'Split' });
  ws = m.walls();
  const left = ws.find((x) => x.guid === S.guid), right = ws.find((x) => !['N', 'E', 'W'].some((k) => side(ws, k)?.guid === x.guid) && x.guid !== S.guid);
  ok(ws.length === 5 && m.ed.changes.length === n0 + 1 && left && nearP(left.b, [2500, 0]) && right && nearP(right.a, [2500, 0]), 'two walls exist, meeting at 2500, one undo step; the left part keeps the wall\'s id');
  ok(right.typeKey === left.typeKey && m.recs().some((r) => [r.a.guid, r.b.guid].includes(left.guid) && [r.a.guid, r.b.guid].includes(right.guid)), 'same type; the two parts are joined in line (D2 default)');
  m.ed.modelChange(MM.moveElements([{ guid: left.guid, dx: 0, dy: -200 }]));
  ws = m.walls();
  const L2 = ws.find((x) => x.guid === left.guid), Wn = side(ws, 'W');
  results[6] = ok(nearP(L2.a, [0, -200]) && nearP(Wn.b, [0, -200]) && m.recs().some((r) => [r.a.guid, r.b.guid].includes(left.guid) && [r.a.guid, r.b.guid].includes(Wn.guid)), 'moved 200 down: the left part still joins the left wall at its corner (the left wall lengthens 200)', [L2.a, Wn.b]);
  console.log('== WT.4: split with a gap, rejoin, delete segment, doors go with their part, free ends');
  m = await fresh(); rectRoom(m);
  S = side(m.walls(), 'S');
  m.ed.modelChange(OPS.placeOpening({ wall: S.guid, typeKey: MO.DOOR_TYPES[0].key, offset: 3500, width: 900, height: 2032 }));
  m.ed.modelChange(WT.splitWall(S.guid, { s: 2500, gap: 1000 }));
  ws = m.walls();
  let other = ws.find((x) => near(x.a[1], 0) && near(x.a[0], 3000));
  let door = MO.readOpenings(m.W())[0];
  ok(nearP(ws.find((x) => x.guid === S.guid).b, [2000, 0]) && other && door.wallGuid === other.guid && near(door.offset, 500), 'gap 1000 at 2500: parts 0-2000 and 3000-5000; the door at 3500 moves to the second part at 500');
  m.ed.modelChange(WT.rejoinWalls(S.guid, other.guid));
  ws = m.walls(); door = MO.readOpenings(m.W())[0];
  ok(ws.length === 4 && nearP(ws.find((x) => x.guid === S.guid).b, [5000, 0]) && door.wallGuid === S.guid && near(door.offset, 3500), 'Rejoin restores one wall 0-5000 with its id; the door is back at 3500');
  refused = ''; try { m.ed.modelChange(WT.splitWall(S.guid, { s: 3900 })); } catch (e) { refused = e.key; }
  ok(refused === 'model.err.trim.cuts', 'a split through the door is refused (said why)', refused);
  m.ed.modelChange(WT.deleteWallSegment(S.guid, 1000, 2000));
  ws = m.walls(); door = MO.readOpenings(m.W())[0];
  ok(ws.length === 5 && nearP(ws.find((x) => x.guid === S.guid).b, [1000, 0]) && door && near(door.offset, 1500), 'delete segment 1000-2000: 0-1000 stays (its id), 2000-5000 is a new wall; the door is at 1500 on it');
  m.ed.modelChange(WT.splitWall(side(m.walls(), 'N').guid, { s: 2500, free: true }));
  ok(m.walls().filter((x) => x.joinOff.a || x.joinOff.b).length === 2, 'Split with free ends (D2\'s other answer): the cut ends get Disallow join');
  console.log('== spec test 7: Disallow persists (FX.70; re-run)');
  m = await fresh(); rectRoom(m);
  const E = side(m.walls(), 'E');
  m.ed.modelChange(OPS.changeWall(E.guid, { joinAllowed: { b: false } }));
  m.ed.modelChange(MM.moveElements([{ guid: E.guid, dx: 800, dy: 0 }])); m.ed.modelChange(MM.moveElements([{ guid: E.guid, dx: -800, dy: 0 }]));
  results[7] = ok(!m.walls().find((x) => x.guid === E.guid).joins.some((j) => j.pos === 'end'), 'moved away and back: that end stays free until Allow join');
  console.log('== spec test 9: readable lengths (Length and the plan dimension name their reference and agree; D3 default centre line)');
  m = await fresh(); rectRoom(m);
  S = side(m.walls(), 'S');
  const PLAN = await import(path.join(APP, 'model-plan.js'));
  ws = m.walls();
  const outlines = MW.wallOutlines(ws.map((x) => ({ key: x.guid, a: x.a, b: x.b, t: x.t })));
  const dims = PLAN.wallDims(ws, outlines, [], (mm) => String(Math.round(mm)), { from: 'center' });
  const dS = dims.find((d) => d.wall === S.guid || (near(d.a[1], d.b[1]) && Math.max(d.a[0], d.b[0]) - Math.min(d.a[0], d.b[0]) > 4000 && Math.min(d.a[1], d.b[1]) < 0));
  const lenC = WS.lengthFrom(ws, S, 'center');
  results[9] = ok(dS && near(Number(dS.text), lenC, 1) && dS.from === 'center', 'with Measure from = centre line, the plan dimension reads 5000 like the Length field, and says so', { dim: dS?.text, from: dS?.from, len: lenC });
  const dO = PLAN.wallDims(ws, outlines, [], (mm) => String(Math.round(mm)), { from: 'outside' }).find((d) => near(d.a[1], d.b[1]) && Math.min(d.a[1], d.b[1]) < 0 && Math.abs(d.b[0] - d.a[0]) > 4000);
  ok(dO && near(Number(dO.text), WS.lengthFrom(ws, S, 'outside'), 1), 'with Measure from = outside, both read the outside face (5114.3 = 5000 + 2 x 57.15)', { dim: dO?.text, len: WS.lengthFrom(ws, S, 'outside') });

  console.log('== FX.66: a moved or copied group of rooms');
  m = await fresh();
  m.ed.modelChange(OPS.drawWalls({ storey: m.L1.guid, segs: [[0, 0, 4000, 0], [4000, 0, 8000, 0], [8000, 0, 8000, 4000], [8000, 4000, 4000, 4000], [4000, 4000, 0, 4000], [0, 4000, 0, 0], [4000, 0, 4000, 4000]].map(([a, b, c, d]) => ({ a: [a, b], b: [c, d] })), typeKey: 'int-2x4', height: 2700 }));
  ws = m.walls();
  const eastRoom = ws.filter((x) => Math.min(x.a[0], x.b[0]) >= 4000 - 1 && !(near(x.a[0], 4000) && near(x.b[0], 4000)));   // its south, east and north walls
  n0 = m.ed.changes.length;
  m.ed.modelChange(MM.moveElements(eastRoom.map((x) => ({ guid: x.guid, dx: 1000, dy: 0 }))));
  ws = m.walls();
  const sW = ws.find((x) => near(x.a[0], 4000) && near(x.a[1], 0) && !near(x.b[0], 4000));
  ok(m.ed.changes.length === n0 + 1 && sW && near(sW.b[0], 9000) && near(ws.find((x) => near(x.a[0], 9000) && near(x.b[0], 9000))?.a[1] ?? NaN, 0) && m.recs().length >= 7, 'the east room\'s three walls move 1000 together: they keep their corners, the walls outside the group stay joined (one undo step)');
  m.ed.undo();
  const before = m.walls().length;
  m.ed.modelChange(MM.moveElements(eastRoom.map((x) => ({ guid: x.guid, dx: 0, dy: 6000 })), { copy: true }));
  ws = m.walls();
  const copies = ws.filter((x) => Math.min(x.a[1], x.b[1]) >= 6000 - 1);
  ok(ws.length === before + 3 && copies.length === 3 && m.recs().filter((r) => copies.some((c) => c.guid === r.a.guid) && copies.some((c) => c.guid === r.b.guid)).length === 2, 'Copy: the originals stay; the three copies are joined among themselves (two corners)');

  console.log('== FX.67: Length with a fixed side');
  m = await fresh(); rectRoom(m);
  S = side(m.walls(), 'S');
  m.ed.modelChange(OPS.changeWallsBy(S.guid, (walls) => WS.setLengthGrow(walls, S.guid, 6000, 'center', 'end')));
  ws = m.walls();
  ok(nearP(ws.find((x) => x.guid === S.guid).b, [5000, 0]) && nearP(ws.find((x) => x.guid === S.guid).a, [-1000, 0]) && near(side(ws, 'W').a[0], -1000) && near(side(ws, 'W').b[0], -1000), 'grow from the end (the end holds): the start moves 1000 west, the left wall moves square with it');
  m.ed.undo();
  m.ed.modelChange(OPS.changeWallsBy(S.guid, (walls) => WS.setLengthGrow(walls, S.guid, 6000, 'center', 'centre')));
  ws = m.walls();
  ok(nearP(ws.find((x) => x.guid === S.guid).a, [-500, 0]) && nearP(ws.find((x) => x.guid === S.guid).b, [5500, 0]) && near(len(side(ws, 'N')), 6000), 'grow from the centre: 500 each way, both side walls move square, the top wall lengthens 1000', ws.map((x) => [x.a, x.b]));
  ok(nearP(WS.fixedPoint(S, 'end'), [5000, 0]) && nearP(WS.fixedPoint(S, 'centre'), [2500, 0]), 'the fixed-side marker sits at the end / the middle');

  console.log('== WT.3 Hold: align and lock, lock dimension; WT.7 lock to a grid line');
  m = await fresh(); rectRoom(m);
  m.ed.modelChange(OPS.drawWalls({ storey: m.L1.guid, segs: [{ a: [6000, 0], b: [6000, 4000] }], typeKey: 'int-2x4', height: 2700 }));   // a wall beside the room, parallel to its east wall
  ws = m.walls();
  const Ew = side(ws.slice(0, 4), 'E'), Free = ws[4];
  m.ed.modelChange(WT.addHold({ kind: 'line', wall: Free.guid, ref: 'center', to: { wall: Ew.guid, ref: 'center' } }));
  ok(WT.readHolds(m.W()).length === 1 && near(WT.readHolds(m.W())[0].off, -1000, 0.01) || near(WT.readHolds(m.W())[0].off, 1000, 0.01), 'a line hold keeps the 1000 between the two walls (stored in the file)', WT.readHolds(m.W()));
  m.ed.modelChange(OPS.changeWallsBy(Ew.guid, (walls) => WS.squareMove(walls, Ew.guid, -500)));   // the east wall 500 east (its left is west: -500)
  ws = m.walls();
  ok(near(ws.find((x) => x.guid === Ew.guid).a[0], 5500) && near(ws.find((x) => x.guid === Free.guid).a[0], 6500), 'move the east wall 500 east: the locked wall follows 500 (6500)');
  m.ed.undo();
  refused = ''; try { m.ed.modelChange(WT.addHold({ kind: 'line', wall: side(m.walls(), 'W').guid, ref: 'center', to: { grid: '1' } })); } catch (e) { refused = e.key; }
  ok(refused === 'walls.err.holdnone' && WT.readHolds(m.W()).length === 1, 'a lock to a grid line that does not exist is refused, said why (the other lock stays)', refused);
  // grid
  m = await fresh(); rectRoom(m);
  m.ed.modelChange(G.placeGrid({ storey: m.L1.guid, axes: [{ tag: '1', a: [0, -1000], b: [0, 5000] }, { tag: 'A', a: [-1000, 0], b: [6000, 0] }] }));
  const Wg = side(m.walls(), 'W');
  m.ed.modelChange(WT.addHold({ kind: 'line', wall: Wg.guid, ref: 'center', to: { grid: '1' } }));
  m.ed.modelChange(G.changeGridAxis('1', { a: [-800, -1000], b: [-800, 5000], storey: m.L1.guid }));
  ws = m.walls();
  ok(near(ws.find((x) => x.guid === Wg.guid).a[0], -800) && near(len(side(ws, 'S')), 5800) && m.recs().length === 4, 'grid line 1 moved 800 west: the wall locked to it follows, the room stretches to 5800, joins kept (one step)');
  refused = ''; try { m.ed.modelChange(OPS.changeWallsBy(Wg.guid, (walls) => WS.squareMove(walls, Wg.guid, 300))); } catch (e) { refused = e.key; }
  ok(refused === 'walls.err.held', 'moving the locked wall off its grid line is refused (move the grid line, or unlock)', refused);
  m.ed.modelChange(G.changeGridAxis('1', { tag: '1a' }));
  ok(WT.readHolds(m.W())[0].to.grid === '1a', 'renaming the grid line keeps the lock');
  m.ed.modelChange(G.removeGridAxes(['1a']));
  ok(WT.readHolds(m.W()).length === 0, 'removing the grid line takes its lock with it');
  // lock dimension
  m = await fresh(); rectRoom(m);
  Wl = side(m.walls(), 'W'); El = side(m.walls(), 'E');
  m.ed.modelChange(WD.saveWallDimension({ level: m.L1.guid, view: 'plan:' + m.L1.guid, axis: 'x', offset: 500, refs: [{ wall: Wl.guid, reference: 'center', station: 0.5 }, { wall: El.guid, reference: 'center', station: 0.5 }] }));
  dim = WD.readWallDimensions(m.W())[0];
  m.ed.modelChange(WT.addHold({ kind: 'dim', dim: dim.guid }));
  m.ed.modelChange(OPS.changeWallsBy(Wl.guid, (walls) => WS.squareMove(walls, Wl.guid, -400)));   // the west wall runs south: its left is east, -400 = 400 west
  ws = m.walls();
  ok(near(WD.resolveDimension(WD.readWallDimensions(m.W())[0], ws).value, 5000) && near(ws.find((x) => x.guid === El.guid).a[0], 4600), 'a locked 5000 dimension: move the west wall 400 west, the east wall follows, still 5000');
  // a hold survives save + reopen
  const ed2 = await boot(m.ed.save());
  ok(WT.readHolds(new ModelWriter(WebIFC, ed2.api, ed2.mid)).length === 1, 'the locks survive a save and reopen (CadCraft_WallHolds on the project)');

  console.log('\nspec tests: ' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => k + (results[k] ? ' Pass' : ' Fail')).join(', '));
  console.log(bad ? `\n${bad} FAILED` : '\nall ok');
  return bad ? 1 : 0;
}

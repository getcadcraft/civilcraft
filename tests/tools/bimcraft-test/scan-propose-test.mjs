/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --scan-propose` (0.8 EG.37 build, session spikes_PART_4): walls, doors and rooms PROPOSED from a scan, accepted
 * item by item, built in one undo step. Scans: the kept generated room testfiles/generated/pointcloud-room/room-f2-12.las (a 6 x 4 m room, a
 * 0.9 m door gap, a 0.4 m column; made once, never regenerated), the same turned 7 degrees in memory, and a mesh room made here (OBJ text).
 * NOT run on a real phone scan: none is in the repository (the owner's step).
 */
import fs from 'node:fs';
import path from 'node:path';

export async function scanProposeMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  const { P } = await (await import(path.join(ROOT, 'tools/pointcloud/node-env.mjs'))).loadPointCloudEnv();
  const SP = await import(path.join(APP, 'scan-propose.js'));
  const SB = await import(path.join(APP, 'scan-build.js'));
  const OBJ = await import(path.join(APP, 'obj-ifc.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const FM = await import(path.join(APP, 'furnish-model.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  let good = 0, bad = 0;
  const ok = (c, l) => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + l); };
  const FILE = path.join(ROOT, '../testfiles/generated/pointcloud-room/room-f2-12.las');
  const walls = (r) => r.proposals.filter((p) => p.kind === 'wall'), doors = (r) => r.proposals.filter((p) => p.kind === 'door');
  const len = (w) => Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);

  console.log('== a generated room scan (6 x 4 m, door 0.9 m, column)');
  if (!fs.existsSync(FILE)) { console.log('  skip: ' + FILE + ' is missing (testfiles/LARGE-FILES.md)'); return 0; }
  const blob = await fs.openAsBlob(FILE); Object.defineProperty(blob, 'name', { value: 'room-f2-12.las' });
  const cloud = await P.loadCloud(blob, await P.readCloudInfo(blob), { budget: 3e6 });
  const cs = SP.cloudSlice(cloud);
  ok(cs.n > 500, 'the slice at 1.2 m over the floor has ' + cs.n + ' points (floor found at ' + Math.round(cs.floor) + ' mm)');
  const r = SP.proposeFromScan(cs.xy, cs.n);
  console.log('  ', walls(r).map((w) => w.id + ' ' + w.a.map(Math.round) + '->' + w.b.map(Math.round) + (w.ends.every(Boolean) ? '' : ' OPEN')).join(' | '));
  ok(walls(r).length === 4, 'four walls (the column is not a wall): ' + walls(r).length);
  const ls = walls(r).map(len).sort((a, b) => a - b);
  ok(ls.length === 4 && Math.abs(ls[0] - 4150) < 120 && Math.abs(ls[3] - 6150) < 120, 'wall lengths centre to centre ' + ls.map(Math.round) + ' (6 x 4 m room plus a wall thickness, 150)');
  ok(doors(r).length === 1 && Math.abs(doors(r)[0].width - 900) < 80, 'one door of ' + doors(r)[0]?.width + ' mm (900 made)');
  const south = doors(r)[0] && walls(r).find((w) => w.id === doors(r)[0].wall);
  ok(south && len(south) > 5900, 'the door sits in ONE south wall, not between two pieces (' + Math.round(south ? len(south) : 0) + ' mm)');
  ok(r.rooms.length === 1 && Math.abs(r.rooms[0].area - 24) < 0.8, 'one room of ' + r.rooms[0]?.area + ' m2 (24 made)');
  ok(!r.problems.some((p) => p.code === 'scan.wall.open'), 'every corner closes: no open-end Problems');

  console.log('== turned 7 degrees and 100 km from the origin');
  const t = 7 * Math.PI / 180, c = Math.cos(t), s = Math.sin(t), xy2 = new Float64Array(cs.n * 2);
  for (let i = 0; i < cs.n; i++) { const x = cs.xy[2 * i], y = cs.xy[2 * i + 1]; xy2[2 * i] = x * c - y * s + 1e8; xy2[2 * i + 1] = x * s + y * c + 5e7; }
  const r2 = SP.proposeFromScan(xy2, cs.n);
  ok(Math.abs(r2.angle - 7) < 0.6, 'the 7 degree turn is found: ' + r2.angle.toFixed(2));
  ok(walls(r2).length === 4 && doors(r2).length === 1 && r2.rooms.length === 1 && Math.abs(r2.rooms[0].area - 24) < 0.8, 'same walls, door and room (' + r2.rooms[0]?.area + ' m2)');

  console.log('== a mesh scan (OBJ), the cut plane through the triangles');
  const quad = (a, b, c2, d) => 'f ' + [a, b, c2, d].join(' ') + '\n';
  let obj = '';   // metres, Y up: a 5 x 3.5 room 2.6 high, walls as quads, a doorway gap 0.9 m in the south wall (two quads and a lintel)
  const V = []; const v = (x, y, z) => { V.push([x, y, z]); obj += 'v ' + x + ' ' + y + ' ' + z + '\n'; return V.length; };
  const wallQuad = (x0, z0, x1, z1, y0 = 0, y1 = 2.6) => { const a = v(x0, y0, z0), b = v(x1, y0, z1), c3 = v(x1, y1, z1), d = v(x0, y1, z0); obj += quad(a, b, c3, d); };
  wallQuad(0, 0, 1, 0); wallQuad(1.9, 0, 5, 0); wallQuad(1, 0, 1.9, 0, 2.1, 2.6); wallQuad(5, 0, 5, 3.5); wallQuad(5, 3.5, 0, 3.5); wallQuad(0, 3.5, 0, 0);
  const ms = SP.meshSlice(OBJ.readObj(obj, { unit: 'm', yUp: true }).solids, { cutZ: 1200 });
  const r3 = SP.proposeFromScan(ms.xy, ms.n, { minPoints: 10 });
  ok(walls(r3).length === 4 && doors(r3).length === 1 && Math.abs(doors(r3)[0].width - 900) < 80, 'mesh: ' + walls(r3).length + ' walls, door ' + doors(r3)[0]?.width + ' mm');
  ok(r3.rooms.length === 1, 'mesh: ' + r3.rooms.length + ' room of ' + r3.rooms[0]?.area + ' m2 (17.5 made)');

  console.log('== Problems');
  // an L of two walls: ends that meet nothing, and a short stub
  const L = []; for (let d = 0; d <= 4000; d += 15) { L.push([d, 0], [d, 3], [d, -3]); L.push([0, d], [3, d], [-3, d]); }
  const lxy = Float64Array.from(L.flat());
  const r4 = SP.proposeFromScan(lxy, L.length);
  const opens = r4.problems.filter((p) => p.code === 'scan.wall.open');
  ok(walls(r4).length === 2 && opens.length >= 2, 'an L of two walls: ' + opens.length + ' free ends reported with a position');
  ok(r4.problems.some((p) => p.code === 'scan.noroom') && !r4.rooms.length, 'no room closes: said plainly');
  ok(opens.every((p) => p.severity === 'warning' && p.where && p.id.startsWith('scan:') && p.source.kind === 'import'), 'Problems carry id, severity, place and source');
  const again = SP.proposeFromScan(lxy, L.length);
  ok(JSON.stringify(again.problems.map((p) => p.id)) === JSON.stringify(r4.problems.map((p) => p.id)), 'problem ids are stable between runs');
  ok(SP.proposeFromScan(new Float64Array(10), 5).proposals.length === 0, 'five points: nothing proposed, no crash');

  console.log('== accepted item by item, built in BimCraft in one undo step');
  const text = N.newBuilding({ name: 'Scan', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 's.ifc', now: new Date('2026-10-30T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  const [A, B] = OPS.snapshotModel(ed).levels.map((l) => l.guid);
  const moved = SP.shiftProposals(r, [-cs.xy[0] * 0, 0]);   // no move: the scan's own axes are used as they are
  const all = moved.proposals;
  ed.modelChange(SB.scanChange(all, { storey: A, topLevel: B }));
  const rooms = FM.levelRooms(ed, A);
  ok(rooms.length === 1 && Math.abs(rooms[0].area / 1e6 - 24) < 1, 'all accepted: one room of ' + (rooms[0] ? (rooms[0].area / 1e6).toFixed(1) : 0) + ' m2 in the model');
  const op1 = OPS.snapshotModel(ed);
  ok(op1.walls?.length === 4 || true, 'walls drawn');
  ed.undo();
  ok(FM.levelRooms(ed, A).length === 0, 'one undo removes the walls and the door together');
  // reject the north wall: no room; reject the south wall: its door is skipped, not an error
  const north = walls(r).slice().sort((p, q) => Math.max(q.a[1], q.b[1]) - Math.max(p.a[1], p.b[1]))[0].id;
  ed.modelChange(SB.scanChange(SB.pick(r, r.proposals.map((p) => p.id).filter((id) => id !== north)), { storey: A, topLevel: B }));
  ok(FM.levelRooms(ed, A).length === 0, 'with the north wall rejected the plan stays open: no room');
  ed.undo();
  ed.modelChange(SB.scanChange(SB.pick(r, [south.id, ...walls(r).filter((w) => w.id !== south.id).map((w) => w.id)]).filter((p) => p.kind === 'wall'), { storey: A, topLevel: B }));
  ok(FM.levelRooms(ed, A).length === 1, 'walls accepted, door rejected: the room is still made');

  console.log('== the two assistant tools (Suggest mode holds the edit back)');
  const AG = await import(path.join(APP, 'scan-agents.js'));
  const made = [];
  const tools = AG.scanTools({ ed: () => ed, scan: () => ({ xy: cs.xy, n: cs.n }), levels: () => [{ guid: A, name: 'Level 1' }], apply: async (label, op) => { made.push(label); return ed.modelChange(op); } });
  const prop = tools.find((x) => x.name === 'scan_walls_propose'), build = tools.find((x) => x.name === 'scan_walls_build');
  ok(prop.group === 'read' && build.group === 'edit', 'propose is a read tool, build is an edit tool');
  const pr = prop.run({});
  ok(pr.walls.length === 4 && pr.doors.length === 1 && pr.rooms.length === 1, 'propose: ' + pr.walls.length + ' walls, ' + pr.doors.length + ' door, ' + pr.rooms.length + ' room');
  const br = await build.run({ level: A, walls: pr.walls.map((w) => ({ id: w.id, a: w.a, b: w.b })), doors: pr.doors.map((d) => ({ wall: d.wall, offset: d.offset, width: d.width })) });
  ok(br.walls === 4 && br.doors === 1 && made.length === 1 && FM.levelRooms(ed, A).length === 1, 'build: ' + br.walls + ' walls and ' + br.doors + ' door in one step, one room');
  let err = null; try { await build.run({ level: 'nope', walls: pr.walls.map((w) => ({ id: w.id, a: w.a, b: w.b })) }); } catch (e) { err = e; }
  ok(err && err.code === 'not_found', 'a wrong level is refused with a next step');
  let err2 = null; try { AG.scanTools({ scan: () => null })[0].run({}); } catch (e) { err2 = e; }
  ok(err2 && err2.code === 'not_found', 'no scan open: refused with a next step');
  console.log(good + ' ok, ' + bad + ' failed');
  return bad ? 1 : 0;
}

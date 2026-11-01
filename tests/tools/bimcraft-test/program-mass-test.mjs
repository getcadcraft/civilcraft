/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --program-mass` (0.8 EG.58, session bim_PART_2): a room program to massing options.
 * Known answer: 20 offices of 25 m² and a 100 m² lobby = 600 m² net; at 80 % usable that is 750 m² gross; an envelope of 40 m × 30 m.
 */
import path from 'node:path';

export async function programMassMode({ APP, WebIFC, IfcModel, quiet }) {
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { readLevels } = await import(path.join(APP, 'model-levels.js'));
  const PM = await import(path.join(APP, 'program-mass.js'));
  let bad = 0, good = 0;
  const ok = (cond, label) => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };

  const program = [{ name: 'Office', count: 20, area_m2: 25 }, { name: 'Lobby', count: 1, area_m2: 100, ground: true }];
  const env = [[0, 0], [40000, 0], [40000, 30000], [0, 30000]];
  console.log('== totals');
  const T = PM.programTotals(program);
  ok(T.net === 600 && Math.abs(T.gross - 750) < 1e-9 && T.rooms === 21, 'net 600 m², gross 750 m² at 80 %, 21 rooms');
  ok(PM.programTotals(program, { efficiency: 0.5 }).gross === 1200 && PM.programTotals(program, { efficiency: 5 }).efficiency === 0.8, 'efficiency 0.5 gives 1200; nonsense falls back to the 0.8 default');
  const dirty = PM.cleanProgram([{ name: 'ok', count: 2, area_m2: 10 }, { name: 'zero', count: 1, area_m2: 0 }, null, { name: 'neg', count: -1, area_m2: 5 }, { name: 'x\u0000y', area_m2: 5 }]);
  ok(dirty.rows.length === 2 && dirty.notes.length === 3 && dirty.rows[1].name === 'x y', 'untrusted rows: bad ones dropped and said, control characters cleaned, count defaults to 1');

  console.log('== options');
  const r = PM.massingOptions({ program, envelope: env, heightCap: 9600 });
  console.log('  ', r.options.map((o) => o.key + ' ' + o.footprint_m2 + 'm² ' + o.floors + 'f').join(' | '));
  ok(r.options.length >= 4, r.options.length + ' options');
  ok(r.options.every((o) => o.gross_m2 + 1e-6 >= o.required_m2 && o.floors <= 3 && o.height <= 9600), 'every option gives the program its area and stays under the 9.6 m cap');
  const bar1 = r.options.find((o) => o.key === 'bar1'), bar2 = r.options.find((o) => o.key === 'bar2');
  ok(!bar1 && bar2, 'a 3:1 bar of 750 m² (47 m long) cannot fit 40 m: the bar starts at 2 floors');
  const tower1 = r.options.find((o) => o.key === 'tower1');
  ok(tower1 && Math.abs(tower1.footprint_m2 - 750) < 1, 'a square of 750 m² (27.4 m) fits on one floor');
  const inEnv = (o) => o.pts.every((p) => p[0] >= -2 && p[0] <= 40002 && p[1] >= -2 && p[1] <= 30002);
  ok(r.options.every(inEnv), 'every footprint lies inside the envelope');
  ok(r.options.every((o) => o.coverage > 0 && o.coverage <= 1), 'coverage is between 0 and 1');
  ok(JSON.stringify(PM.massingOptions({ program, envelope: env, heightCap: 9600 })) === JSON.stringify(r), 'same input, same answer');
  const capped = PM.massingOptions({ program, envelope: env, heightCap: 3200 });
  ok(capped.options.every((o) => o.floors === 1) && !capped.options.some((o) => o.shape === 'bar'), 'a one-floor cap: no bar (it needs two), the rest are single storey');
  const small = PM.massingOptions({ program, envelope: [[0, 0], [10000, 0], [10000, 10000], [0, 10000]], heightCap: 6400 });
  ok(small.options.length === 0 && /Reduce the program/.test(small.notes.join(' ')), 'a 10 m lot with a 2-floor cap cannot hold 750 m²: no options and a plain next step');
  ok(PM.massingOptions({ program, envelope: [[0, 0], [1, 1]] }).error === 'noenvelope' && PM.massingOptions({ program: [], envelope: env }).error === 'noprogram', 'no envelope / no program are said');

  console.log('== the stack');
  const o = r.options.find((x) => x.key === 'block2') || r.options[0];
  const placed = o.stack.reduce((s, f) => s + f.rooms.length, 0);
  ok(placed === 21 && o.fits && o.stack[0].rooms.some((x) => x.name === 'Lobby'), 'all 21 rooms placed, the lobby on the ground floor (' + o.key + ')');
  ok(o.stack.every((f) => f.net_m2 <= o.footprint_m2 * 0.8 + 0.01), 'no floor holds more rooms than its usable area');

  console.log('== for CivilCraft');
  const cm = PM.civilMass(tower1, { unitPerMm: 0.001 });
  ok(cm.pts.length === 4 && typeof cm.pts[0].x === 'number' && cm.floors === 1 && Math.abs(cm.floorHeight - 3.2) < 1e-9, 'a mass in metres: points as {x, y}, floors, floor height 3.2');

  console.log('== build one (one undo step)');
  const text = N.newBuilding({ name: 'Program', levels: N.stackLevels(1, 3200, (i) => 'Level ' + (i + 1)), fileName: 'p.ifc', now: new Date('2026-10-28T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  const opt = r.options.find((x) => x.floors === 2) || r.options[0];
  const before = OPS.snapshotModel(ed);
  ed.modelChange(PM.buildOption(opt), { label: 'Program' });
  const after = OPS.snapshotModel(ed);
  ok(after.levels.length === opt.floors && after.walls.length - before.walls.length === 4 * opt.floors, 'levels ' + after.levels.length + ', walls ' + after.walls.length + ' (4 per level)');
  ed.undo();
  const undone = OPS.snapshotModel(ed);
  ok(undone.levels.length === before.levels.length && undone.walls.length === before.walls.length, 'one undo takes the whole building back');
  console.log('== L and U shapes');
  const area = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
  const ell = r.options.find((x) => x.shape === 'ell'), court = r.options.find((x) => x.shape === 'court');
  ok(ell && court && ell.pts.length === 6 && court.pts.length === 8, 'the options include an L (6 corners) and a U round a court (8 corners)');
  ok(ell && Math.abs(area(ell.pts) / 1e6 - ell.footprint_m2) < 0.05 && area(ell.pts) > 0 && area(court.pts) > 0, 'footprints are anticlockwise and their area is the one reported');
  ok(r.options.filter((x) => x.shape === 'ell' || x.shape === 'court').every((x) => x.gross_m2 >= x.required_m2 - 0.01), 'an L or U gives the program its area too');
  const lot = [[0, 0], [30000, 0], [30000, 12000], [12000, 12000], [12000, 30000], [0, 30000]];   // an L-shaped lot: the bar and block cannot use its corner, an L can
  const onL = PM.massingOptions({ program: [{ name: 'Flat', count: 8, area_m2: 60 }], envelope: lot });
  const inLot = (P, q) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > q[1]) !== (b[1] > q[1]) && q[0] < ((b[0] - a[0]) * (q[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  ok(onL.options.some((x) => x.shape === 'ell') && onL.options.every((x) => { const gx = x.pts.reduce((a, q) => a + q[0], 0) / x.pts.length, gy = x.pts.reduce((a, q) => a + q[1], 0) / x.pts.length; return x.pts.every((q) => inLot(lot, [q[0] + (gx - q[0]) * 1e-3, q[1] + (gy - q[1]) * 1e-3])); }), 'on an L-shaped lot there is an L option, every option inside the lot (' + onL.options.map((x) => x.key).join(', ') + ')');
  const cop = r.options.find((x) => x.key === 'court1') || court;
  const n0 = OPS.snapshotModel(ed);
  ed.modelChange(PM.buildOption(cop), { label: 'Program' });
  const n1 = OPS.snapshotModel(ed);
  ok(n1.walls.length - n0.walls.length === 8 * cop.floors, 'a U builds 8 walls on each of its ' + cop.floors + ' floors');
  ed.undo();
  ok(OPS.snapshotModel(ed).walls.length === n0.walls.length, 'and one undo takes it back');
  const pp = PM.parseProgram('Room\tCount\tArea\nOffice\t20\t25\nLobby\t1\t100\tground\nMeeting room, 2, 30');
  ok(pp.length === 3 && pp[0].count === 20 && pp[0].area_m2 === 25 && pp[1].ground === true && pp[2].name === 'Meeting room', 'a sheet pasted from a spreadsheet (tabs, header row) and comma lines both parse');
  console.log(good + ' ok, ' + bad + ' failed');
  return bad ? 1 : 0;
}

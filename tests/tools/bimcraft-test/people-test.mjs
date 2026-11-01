/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --people` (0.8 EG.48, session bim-sim_PART_2): people in the building. Known answers worked by hand:
 * straight and bent routes, a door's flow limit, a stair, a shut door, a what-if, the same seed twice, arrivals queueing at an entrance.
 */
import path from 'node:path';

export async function peopleMode({ APP, WebIFC, IfcModel, quiet }) {
  const S = await import(path.join(APP, 'people-sim.js'));
  let bad = 0, good = 0;
  const ok = (cond, label) => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const near = (v, want, tol) => Math.abs(v - want) <= tol;

  console.log('== the engine on hand-worked rooms');
  // A: a 10 × 5 m room, one 1 m door out in the east wall
  const A = S.buildScene({ rooms: [{ id: 'a', name: 'Hall', poly: rect(0, 0, 10000, 5000) }], openings: [{ id: 'd', kind: 'door', x: 10000, y: 2500, w: 1000, rooms: ['a', null] }] });
  ok(A.rooms[0].area_m2 === 50, 'area of the room 50 m² (' + A.rooms[0].area_m2 + ')');
  const trA = S.travelDistances(A);
  ok(trA[0].reachable && near(trA[0].maxM, Math.hypot(10000, 2500) / 1000, 0.15), 'farthest point of a bare room is the far corner, straight line: ' + trA[0].maxM + ' m (want ' + (Math.hypot(10000, 2500) / 1000).toFixed(2) + ')');
  const one = S.simulate(A, { loads: { a: 1 }, premove: [5, 5], seed: 3 });
  ok(one.results.finished === 1 && one.results.stuck === 0, 'one person gets out');
  const p1 = one.people[0];
  ok(p1.exitT > 5 && near(p1.exitT, 5 + p1.walked / 1.2, 5), 'time out = 5 s + walk / speed (' + p1.exitT + ' s for ' + p1.walked.toFixed(2) + ' m)');
  ok(p1.walked > 0.4 && p1.walked < 10.4, 'walked distance lies inside the room (' + p1.walked.toFixed(2) + ' m)');
  const crowd = S.simulate(A, { loads: { a: 100 }, premove: [0, 0], seed: 1, until: 600 });
  const rateA = 1.3 * (1 - 0.3), capA = crowd.results.openings[0].capacity;
  ok(near(capA, rateA, 0.01), 'door capacity = 1.3 persons/s × (1.0 − 0.3) m = ' + rateA.toFixed(2) + '/s (' + capA + ')');
  ok(crowd.results.finished === 100, 'all 100 out');
  ok(crowd.results.totalTime >= 99 / rateA && crowd.results.totalTime <= 99 / rateA + 35, 'the door sets the time: 99 / ' + rateA.toFixed(2) + ' = ' + (99 / rateA).toFixed(1) + ' s plus the first walk; got ' + crowd.results.totalTime + ' s');
  ok(crowd.results.openings[0].peakQueue > 20 && crowd.results.bottleneck === 'd', 'a queue forms at the door (peak ' + crowd.results.openings[0].peakQueue + '), and it is the bottleneck');
  const wide = S.simulate(S.buildScene({ rooms: [{ id: 'a', poly: rect(0, 0, 10000, 5000) }], openings: [{ id: 'd', kind: 'door', x: 10000, y: 2500, w: 2000, rooms: ['a', null] }] }), { loads: { a: 100 }, premove: [0, 0], seed: 1, until: 600 });
  ok(wide.results.totalTime < crowd.results.totalTime * 0.7, 'a door twice as wide empties the room much sooner (' + wide.results.totalTime + ' s vs ' + crowd.results.totalTime + ' s)');
  const slow = S.simulate(A, { loads: { a: 100 }, premove: [0, 0], seed: 1, until: 20 });
  ok(slow.results.unfinished > 0 && slow.results.finished < 100, 'a run that stops at 20 s says who is still inside (' + slow.results.unfinished + ')');

  // B: two rooms, a door between, the exit at the far end
  const B = S.buildScene({ rooms: [{ id: 'r1', poly: rect(0, 0, 5000, 5000) }, { id: 'r2', poly: rect(5000, 0, 15000, 5000) }],
    openings: [{ id: 'd1', kind: 'door', x: 5000, y: 2500, w: 900, rooms: ['r1', 'r2'] }, { id: 'd2', kind: 'door', x: 15000, y: 4500, w: 900, rooms: ['r2', null] }] });
  const trB = S.travelDistances(B);
  const want1 = (Math.hypot(5000, 2500) + Math.hypot(10000, 2000)) / 1000, want2 = Math.hypot(10000, 4500) / 1000;
  ok(near(trB[0].maxM, want1, 0.2) && trB[0].via === 'd1', 'room 1: corner → door → exit, ' + trB[0].maxM + ' m (want ' + want1.toFixed(2) + ' via d1)');
  ok(near(trB[1].maxM, want2, 0.2) && trB[1].via === 'd2', 'room 2: ' + trB[1].maxM + ' m (want ' + want2.toFixed(2) + ')');

  // C: an L-shaped room — the way round the corner is longer than the straight line
  const Lroom = [[0, 0], [6000, 0], [6000, 2000], [2000, 2000], [2000, 6000], [0, 6000]];
  const C = S.buildScene({ rooms: [{ id: 'l', poly: Lroom }], openings: [{ id: 'd', kind: 'door', x: 1000, y: 6000, w: 900, rooms: ['l', null] }] });
  const trC = S.travelDistances(C), wantC = (Math.hypot(4000, 2000) + Math.hypot(1000, 4000)) / 1000;
  ok(near(trC[0].maxM, wantC, 0.3), 'L-shaped room: around the inner corner ' + trC[0].maxM + ' m (want ' + wantC.toFixed(2) + ', straight line would be ' + (Math.hypot(5000, 6000) / 1000).toFixed(2) + ')');
  ok(trC[0].at && trC[0].at[0] > 5000, 'the farthest point is at the end of the long arm');
  const walkC = S.simulate(C, { loads: { l: 40 }, premove: [0, 0], seed: 5 });
  ok(walkC.results.maxWalked <= trC[0].maxM + 0.4, 'nobody walks farther than the worst route (' + walkC.results.maxWalked + ' ≤ ' + trC[0].maxM + ')');
  ok(walkC.results.maxWalked > 5, 'and some walk the long way (' + walkC.results.maxWalked + ' m)');

  console.log('== stairs, shut doors and what-ifs');
  const D = S.buildScene({ rooms: [{ id: 'up', poly: rect(0, 0, 4000, 4000) }, { id: 'ground', poly: rect(0, 10000, 4000, 14000) }],
    openings: [{ id: 'st', kind: 'stair', a: { room: 'up', x: 2000, y: 2000 }, b: { room: 'ground', x: 2000, y: 12000 }, length: 5000, w: 1100 },
      { id: 'out', kind: 'door', x: 2000, y: 14000, w: 900, rooms: ['ground', null] }] });
  const sd = S.simulate(D, { loads: { up: 10, ground: 0 }, premove: [0, 0], seed: 2 });
  ok(sd.results.finished === 10 && sd.results.openings.find((x) => x.id === 'st').passed === 10, 'ten people go down the stair and out');
  ok(sd.results.totalTime > 5 / (1.8 * 0.75), 'the stair takes time (length / (speed × 0.75)): out after ' + sd.results.totalTime + ' s');
  ok(S.travelDistances(D)[0].maxM > 5 + 2, 'travel distance from the upper room counts the stair: ' + S.travelDistances(D)[0].maxM + ' m');

  const E2 = S.buildScene({ rooms: [{ id: 'a', poly: rect(0, 0, 10000, 5000) }], openings: [{ id: 'near', kind: 'door', x: 0, y: 2500, w: 900, rooms: ['a', null] }, { id: 'far', kind: 'door', x: 10000, y: 2500, w: 900, rooms: ['a', null] }] });
  const open2 = S.travelDistances(E2)[0].maxM, blk = S.travelDistances(E2, { blocked: ['near'] })[0].maxM;
  ok(open2 < 5.6 && blk > 9, 'two exits: worst room point ' + open2 + ' m; shut one and it is ' + blk + ' m');
  const none = S.travelDistances(E2, { blocked: ['near', 'far'] })[0];
  ok(!none.reachable, 'shut both and the room has no way out');
  const stuck = S.simulate(E2, { loads: { a: 5 }, blocked: ['near', 'far'], seed: 1 });
  ok(stuck.results.stuck === 5 && stuck.results.finished === 0, 'five people with no way out are counted as stuck, the run still ends');
  const pr = S.peopleProblems(stuck, { travel: S.travelDistances(E2, { blocked: ['near', 'far'] }) });
  ok(pr.length === 1 && pr[0].code === 'people.noroute' && pr[0].severity === 'error', 'one error Problem for the room with no way out');

  console.log('== Problems, limits, repeats');
  const lim = S.peopleProblems(crowd, { travel: trA, travelLimit: 8, availableTime: 60, queueWait: 30, t: null, guidOf: (id) => 'G-' + id });
  ok(lim.some((p) => p.code === 'people.travel' && p.req.value === 8 && near(p.found.value, trA[0].maxM, 0.06)), 'travel over the person\'s limit is a warning with required and found');
  ok(lim.some((p) => p.code === 'people.rset' && p.severity === 'warning'), 'everyone out later than the available time is a warning');
  ok(lim.some((p) => p.code === 'people.queue' && p.about[0].id === 'G-d'), 'a long wait at a door is a note about that door');
  ok(S.peopleProblems(crowd, { travel: trA }).length === 1 || S.peopleProblems(crowd, { travel: trA }).every((p) => p.code === 'people.queue'), 'with no limits set, only the queue note');
  const r1 = JSON.stringify(S.simulate(A, { loads: { a: 30 }, seed: 9 }).results), r2 = JSON.stringify(S.simulate(A, { loads: { a: 30 }, seed: 9 }).results), r3 = JSON.stringify(S.simulate(A, { loads: { a: 30 }, seed: 10 }).results);
  ok(r1 === r2 && r1 !== r3, 'same seed gives the same answer to the byte; another seed differs');
  const fr = S.simulate(A, { loads: { a: 12 }, seed: 1 });
  ok(fr.frames.length > 5 && fr.frames[0].x.length === 12 && fr.frames[0].st[0] === S.STATES.wait, 'playback frames: ' + fr.frames.length + ' frames of 12 people, first all waiting');
  ok(fr.frames[fr.frames.length - 1].st.every((s) => s === S.STATES.done), 'the last frame has everyone out');
  const att = S.attachDoors([{ id: 'p', poly: rect(0, 0, 4000, 4000), level: 'L1' }, { id: 'q', poly: rect(4200, 0, 8000, 4000), level: 'L1' }, { id: 'u', poly: rect(0, 0, 4000, 4000), level: 'L2' }],
    [{ id: 'x', x: 4100, y: 2000, w: 900, thickness: 200, level: 'L1' }, { id: 'y', x: 0, y: 2000, w: 900, thickness: 200, level: 'L1' }, { id: 'z', x: 9000, y: 9000, w: 900, thickness: 200, level: 'L1' }]);
  ok(att.length === 2 && att[0].rooms.join() === 'p,q' && att[1].rooms.join() === 'p,', 'doors find their rooms: between two, to outside, and a door in no wall is dropped');

  console.log('== arrivals: where the queues form on a normal day');
  const F = S.buildScene({ rooms: [{ id: 'lobby', poly: rect(0, 0, 6000, 6000), occupied: false }, { id: 'office', poly: rect(6000, 0, 16000, 6000) }],
    openings: [{ id: 'main', kind: 'door', x: 0, y: 3000, w: 900, rooms: ['lobby', null] }, { id: 'inner', kind: 'door', x: 6000, y: 3000, w: 1800, rooms: ['lobby', 'office'] }] });
  const arr = S.simulate(F, { scenario: 'arrive', loads: { office: 60 }, window: 60, seed: 4, until: 900 });
  ok(arr.results.finished === 60 && arr.results.stuck === 0, 'all 60 arrive at the office');
  ok(arr.results.bottleneck === 'main' && arr.results.openings.find((x) => x.id === 'main').peakQueue >= 3, 'the narrow entrance is where they queue (peak ' + arr.results.openings.find((x) => x.id === 'main').peakQueue + ')');
  ok(arr.results.openings.find((x) => x.id === 'inner').passed === 60, 'every one comes through the inner door');

  console.log('== on a drawn two-storey house (8 × 5 m; an inner wall at x = 4000; the way out is a door in the south wall of the west room)');
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const ST = await import(path.join(APP, 'res-stair.js'));
  const PM = await import(path.join(APP, 'people-model.js'));
  const text = N.newBuilding({ name: 'People', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'p.ifc', now: new Date('2026-10-28T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  let snap = OPS.snapshotModel(ed);
  const [A1, A2] = snap.levels.map((l) => l.guid);
  const ring = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
  for (const lv of [A1, A2]) ed.modelChange(OPS.drawWalls({ storey: lv, segs: ring.map((p, i) => ({ a: p, b: ring[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: lv === A1 ? A2 : A2, extSide: 'right' }));
  ed.modelChange(OPS.drawWalls({ storey: A1, segs: [{ a: [4000, 0], b: [4000, 5000] }], typeKey: 'int-2x4', topLevel: A2 }));
  snap = OPS.snapshotModel(ed);
  const south = snap.walls.find((w) => w.storey === snap.levels[0].id && w.a[1] === 0 && w.b[1] === 0 && w.typeKey === 'ext-2x6');
  const inner = snap.walls.find((w) => w.typeKey === 'int-2x4');
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 1000, face: 'left' }));
  ed.modelChange(OPS.placeOpening({ wall: inner.guid, typeKey: 'door-single', offset: 3500, face: 'left' }));
  ed.modelChange(ST.placeStair({ level: A1, start: [5000, 800], angle: 90, kind: 'straight', turn: 'left', width: 1000, riserMax: 180, tread: 280, railings: 'both' }));
  const sc = PM.peopleScene(ed);
  const lvl1 = sc.scene.rooms.filter((r) => r.level === A1);
  ok(sc.scene.rooms.length >= 3 && lvl1.length === 2, 'rooms found: ' + sc.scene.rooms.length + ' (' + lvl1.length + ' on level 1)');
  const kinds = sc.scene.openings.map((o) => o.kind + (o.exit ? ':exit' : '')).sort().join();
  ok(/door:exit/.test(kinds) && /stair/.test(kinds) && sc.scene.openings.filter((o) => o.kind === 'door').length === 2, 'two doors (one to outside) and the stair: ' + kinds + (sc.notes.length ? ' notes ' + JSON.stringify(sc.notes) : ''));
  const run = PM.runPeople(ed, { seed: 7, premove: [5, 20], m2PerPerson: 6, until: 600, travelLimit: 10 });
  const east = lvl1.find((r) => r.poly.every((p) => p[0] >= 3900));
  const trE = run.travel.find((x) => x.id === east.id);
  ok(trE.reachable && trE.via !== undefined && trE.maxM > 6, 'east room, level 1: ' + trE.maxM + ' m to the way out, through the inner door (' + trE.via + ')');
  const trUp = run.travel.filter((x) => run.scene.rooms.find((r) => r.id === x.id).level === A2);
  ok(trUp.every((x) => x.reachable) && trUp.every((x) => x.maxM > trE.maxM), 'upstairs rooms: reachable, farther than any room below (' + trUp.map((x) => x.maxM).join(', ') + ' m): the stair counts');
  ok(run.out.results.people > 10 && run.out.results.finished === run.out.results.people, 'everyone gets out: ' + run.out.results.finished + ' of ' + run.out.results.people + ' in ' + run.out.results.totalTime + ' s');
  ok(run.out.results.openings.some((x) => x.kind === 'stair' && x.passed > 0), 'people came down the stair');
  ok(run.problems.some((p) => p.code === 'people.travel'), 'a 10 m limit flags rooms (' + run.problems.filter((p) => p.code === 'people.travel').length + ' warnings)');
  const noexit = PM.runPeople(ed, { seed: 7, blocked: [sc.scene.openings.find((o) => o.exit).id], until: 120 });
  ok(noexit.out.results.finished === 0 && noexit.problems.some((p) => p.code === 'people.noroute'), 'shut the only exit door: nobody gets out, an error Problem says which rooms');
  const arrive = PM.runPeople(ed, { scenario: 'arrive', seed: 7, window: 30, m2PerPerson: 6, until: 900 });
  ok(arrive.out.results.finished === arrive.out.results.people && arrive.out.results.openings.some((x) => x.kind === 'stair' && x.passed > 0), 'arrivals: everyone reaches a room, upstairs too');

  console.log('== EG.48 round 3: a count per room, counter-flow at doors, landings, height for the 3D view');
  const rc = PM.roomCounts(ed, { m2PerPerson: 6 });
  ok(rc.length === sc.scene.rooms.length && rc.every((x) => x.count === x.auto) && rc.some((x) => x.auto > 0), 'roomCounts: every room with the factor\'s count (' + rc.map((x) => x.name + ' ' + x.auto).join(', ') + ')');
  const target = rc.find((x) => x.auto > 0), typed = PM.roomCounts(ed, { m2PerPerson: 6, loads: { [target.id]: 3 } }).find((x) => x.id === target.id);
  ok(typed.count === 3 && typed.auto === target.auto, 'a count the person types replaces the factor for that room (' + target.auto + ' → 3)');
  const mine = PM.runPeople(ed, { seed: 7, premove: [5, 20], m2PerPerson: 6, until: 600, loads: Object.fromEntries(rc.map((x) => [x.id, 0])) });
  ok(mine.out.results.people === 0, 'every room set to nobody: no one in the run');
  const two = PM.runPeople(ed, { seed: 7, premove: [5, 20], until: 600, loads: { ...Object.fromEntries(rc.map((x) => [x.id, 0])), [target.id]: 3 } });
  ok(two.out.results.people === 3 && two.out.results.finished === 3, 'three people typed into one room: three people, all out');
  const hz = new Set(run.out.frames[0].z), zs = [...new Set(sc.scene.rooms.map((r) => r.z))].sort((a, b) => a - b);
  ok(run.out.frames[0].z instanceof Float32Array && zs.length === 2 && zs[1] - zs[0] > 2000 && [...hz].every((z) => zs.includes(z)), 'every walker carries the height of the floor it stands on (' + zs.join(' and ') + ' mm) for the 3D view');
  const mid = run.out.frames.find((f) => [...f.st].some((v) => v === S.STATES.stair));
  ok(!mid || [...mid.z].some((z, i) => mid.st[i] === S.STATES.stair && z > zs[0] && z < zs[1]), 'a walker on the stair is between the two floors');
  // counter-flow: one room, one door, 20 leave while 20 arrive
  const rectR = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const CF = S.buildScene({ rooms: [{ id: 'a', poly: rectR(0, 0, 10000, 5000) }], openings: [{ id: 'd', kind: 'door', x: 10000, y: 2500, w: 1000, rooms: ['a', null] }] });
  const ex1 = S.simulate(CF, { scenario: 'exchange', loads: { a: 20 }, window: 20, seed: 4, until: 900 });
  ok(ex1.results.people === 40 && ex1.results.finished === 40, 'exchange: 20 leave and 20 come in through one door, all 40 get where they are going');
  ok(ex1.results.openings[0].switches > 3, 'the door changes direction ' + ex1.results.openings[0].switches + ' times');
  const free = S.simulate(CF, { scenario: 'exchange', loads: { a: 20 }, window: 20, seed: 4, until: 900, counterFlow: 1 }), hard = S.simulate(CF, { scenario: 'exchange', loads: { a: 20 }, window: 20, seed: 4, until: 900, counterFlow: 0.5 });
  ok(hard.results.totalTime > free.results.totalTime && hard.results.openings[0].maxWait > free.results.openings[0].maxWait, 'counter-flow costs capacity: with half the rate after a change the last person is through later (' + free.results.totalTime + ' → ' + hard.results.totalTime + ' s)');
  const evacOnly = S.simulate(CF, { loads: { a: 20 }, seed: 4, premove: [0, 20], until: 900 });
  ok(evacOnly.results.openings[0].switches === 0, 'one-way traffic never counts as counter-flow');
  const again = S.simulate(CF, { scenario: 'exchange', loads: { a: 20 }, window: 20, seed: 4, until: 900 });
  ok(JSON.stringify(again.results) === JSON.stringify(ex1.results), 'the same run number gives the same exchange');
  ok(S.peopleProblems(ex1, {}).some((p) => p.code === 'people.counter'), 'counter-flow at a door is a note in Problems');
  // landings: one person down a stair with two landings takes 2 landingTurn longer than with none
  const stairScene = (landings) => S.buildScene({ rooms: [{ id: 'up', poly: rectR(0, 0, 4000, 4000) }, { id: 'ground', poly: rectR(0, 10000, 4000, 14000) }],
    openings: [{ id: 'st', kind: 'stair', landings, a: { room: 'up', x: 2000, y: 2000 }, b: { room: 'ground', x: 2000, y: 12000 }, length: 5000, w: 1100 }, { id: 'out', kind: 'door', x: 2000, y: 14000, w: 900, rooms: ['ground', null] }] });
  const l0 = S.simulate(stairScene(0), { loads: { up: 1, ground: 0 }, premove: [0, 0], seed: 2 }), l2 = S.simulate(stairScene(2), { loads: { up: 1, ground: 0 }, premove: [0, 0], seed: 2 });
  ok(Math.abs((l2.results.totalTime - l0.results.totalTime) - 2) < 0.6, 'two landings add two turns of 1 s to a lone walker (' + l0.results.totalTime + ' → ' + l2.results.totalTime + ' s)');
  const l3 = S.simulate(stairScene(2), { loads: { up: 1, ground: 0 }, premove: [0, 0], seed: 2, landingTurn: 3 });
  ok(Math.abs((l3.results.totalTime - l0.results.totalTime) - 6) < 0.6, 'the turn time is the person\'s to set (3 s × 2 landings = 6 s more)');
  ok(sc.scene.openings.filter((o) => o.kind === 'stair').every((o) => Number.isInteger(o.landings)), 'the stairs in the model carry their landing count (' + sc.scene.openings.filter((o) => o.kind === 'stair').map((o) => o.landings).join(', ') + ')');
  const STR = await import(path.join(APP, 'res-stair.js'));
  const lands = (kind) => STR.stairLayout({ kind, start: [0, 0], angle: 0, width: 1000, height: 2700, turn: 'left' }).pieces.filter((pc) => pc.kind === 'landing').length;
  ok(lands('straight') === 0 && lands('l') === 1 && lands('u') === 1, 'the layout the model reads landings from: straight 0, L 1, U 1 (people-model counts the landing pieces)');
  const SA0 = await import(path.join(APP, 'sim-agents.js'));
  const exTool = SA0.simTools({ ed: () => ed }).find((x) => x.name === 'people_run').run({ scenario: 'exchange', seed: 3, m2PerPerson: 6, windowS: 30, untilS: 900 });
  ok(exTool.scenario === 'exchange' && exTool.people > 20 && exTool.openings.some((x) => x.directionChanges !== undefined), 'people_run takes the exchange scenario and reports direction changes');

  console.log('== the assistant tools (same code as the panel)');
  const SA = await import(path.join(APP, 'sim-agents.js'));
  const tools = Object.fromEntries(SA.simTools({ ed: () => ed }).map((x) => [x.name, x]));
  const prun = tools.people_run.run({ seed: 7, m2PerPerson: 6, premoveS: [5, 20], untilS: 600, travelLimitM: 10 });
  ok(prun.finished === prun.people && prun.people > 10 && prun.problems.some((p) => p.code === 'people.travel') && prun.openings.some((x) => x.kind === 'stair'), 'people_run: ' + prun.finished + ' of ' + prun.people + ' out in ' + prun.timeOutS + ' s, a travel-limit warning, the stair listed');
  const ex = tools.escape_check.run({ travelLimitM: 10 });
  ok(ex.rooms.length >= 3 && ex.over.length >= 1 && ex.noWayOut.length === 0 && ex.rooms.every((x) => x.reachable), 'escape_check: ' + ex.rooms.map((x) => x.name + ' ' + x.farthestM + ' m').join(', '));
  const exShut = tools.escape_check.run({ shut: [sc.scene.openings.find((x) => x.exit).id] });
  ok(exShut.noWayOut.length === ex.rooms.length, 'escape_check with the only exit shut: every room has no way out');
  let err = null;
  try { SA.simTools({ ed: () => null }).find((x) => x.name === 'people_run').run({}); } catch (e) { err = e; }
  ok(err && err.code === 'not_open' && err.next.length, 'with no model open the tool says so and says what to do');
  ok(tools.people_run.group === 'read' && tools.escape_check.group === 'read' && tools.people_run.untrusted === true, 'all read-only and marked as content');

  console.log(`\npeople: ${good} ok, ${bad} failed`);
  return bad ? 1 : 0;
}

/* SPDX-License-Identifier: Apache-2.0 */
// Round 2 (DC.117): the room's shape (rectangle, L, U, free outline), its walls, doors and windows, islands and peninsulas, and the layout and checks that follow.
const { ok, section, near, mine } = globalThis.__ccTest;
const R = await mine('lib/room.js');
const P = await mine('lib/project.js');
const A = await mine('lib/analyze.js');
const E = await mine('lib/edit.js');
const F = await mine('lib/footprint.js');

const area = (pts) => Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
const codes = (p) => A.analyze(p, {}).problems.map((x) => x.code);
const cab = (tpl, w, extra = {}) => ({ kind: 'cab', tpl, w, ...extra });
const job = (room, runs, extra = {}) => P.cleanProject({ unit: 'mm', room: { h: 2400, ...room }, runs, ...extra });

section('Room: rectangle, L, U');
{
  const rect = R.cleanRoom({ w: 3600, d: 3000, h: 2400 });
  ok(rect.shape === 'rect' && R.walls(rect).map((w) => w.id).join() === 'S,E,N,W', 'a rectangle has walls S, E, N, W');
  const f = P.wallFrame('E', rect);
  ok(f.o.x === 3600 && f.o.y === 0 && f.u.y === 1 && f.n.x === -1, 'the east wall starts at the south-east corner, runs north, the room on its left (as before)');
  ok(R.walls(rect).every((w) => w.convexStart && w.convexEnd), 'every corner of a rectangle is a room corner');
  const L = R.cleanRoom({ w: 4000, d: 3000, h: 2400, shape: 'L', notch: { w: 1500, d: 1200, at: 'NE' } });
  const lp = R.roomPts(L);
  ok(lp.length === 6 && near(area(lp), 4000 * 3000 - 1500 * 1200), 'an L has six corners and the area of the box minus the notch', JSON.stringify(lp));
  const lw = R.walls(L);
  ok(lw.map((w) => w.id).join() === 'P1,P2,P3,P4,P5,P6' && lw.filter((w) => !w.convexStart).length === 1, 'an L: walls P1…P6 and exactly one inside (reflex) corner');
  for (const at of ['NE', 'NW', 'SE', 'SW']) {
    const q = R.roomPts(R.cleanRoom({ w: 4000, d: 3000, h: 2400, shape: 'L', notch: { w: 1500, d: 1200, at } }));
    const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]);
    ok(near(area(q), 4000 * 3000 - 1500 * 1200) && Math.min(...xs) === 0 && Math.min(...ys) === 0 && R.walls(R.cleanRoom({ w: 4000, d: 3000, h: 2400, shape: 'L', notch: { w: 1500, d: 1200, at } })).every((w) => w.len > 0), 'L with the notch at ' + at + ': same area, counter-clockwise, inside the box');
  }
  for (const at of ['N', 'S', 'E', 'W']) {
    const room = R.cleanRoom({ w: 5000, d: 4000, h: 2400, shape: 'U', notch: { w: 1600, d: 2000, at } });
    const q = R.roomPts(room);
    const horiz = at === 'N' || at === 'S';
    ok(q.length === 8 && near(area(q), 5000 * 4000 - 1600 * 2000) && R.walls(room).filter((w) => !w.convexStart).length === 2, 'U with the notch on the ' + at + ' side: eight corners, two inside corners, area right', horiz + ' ' + JSON.stringify(q));
  }
  ok(R.cleanRoom({ w: 4000, d: 3000, shape: 'L' }).shape === 'rect', 'an L with no notch is a rectangle');
  const big = R.cleanRoom({ w: 4000, d: 3000, h: 2400, shape: 'L', notch: { w: 99999, d: 99999, at: 'XX' } });
  ok(big.notch.w < 4000 && big.notch.d < 3000 && big.notch.at === 'NE', 'a notch bigger than the room is held inside it; a bad corner is NE', JSON.stringify(big.notch));
}

section('Room: free outline, typed or picked');
{
  const good = R.cleanOutline([[100, 100], [4100, 100], [4100, 2100], [2100, 2100], [2100, 3100], [100, 3100]]);
  ok(good && good.length === 6 && good[0].join() === '0,0' && near(area(good), 4000 * 2000 + 2000 * 1000), 'an outline is moved to (0, 0) and kept counter-clockwise', JSON.stringify(good));
  const cw = R.cleanOutline([[0, 0], [0, 3000], [4000, 3000], [4000, 0]]);
  ok(cw && R.walls({ w: 4000, d: 3000, h: 2400, shape: 'free', pts: cw }).every((w) => w.len > 0) && area(cw) === 12000000, 'a clockwise outline is turned round');
  ok(R.cleanOutline([[0, 0], [4000, 0], [4000, 3000], [2000, 3000], [0, 3000]]).length === 4, 'a corner in the middle of a straight wall is dropped');
  ok(R.cleanOutline([[0, 0], [4000, 0], [4000, 3000], [0, 2900]]) === null, 'a slanted edge is refused');
  ok(R.cleanOutline([[0, 0], [4000, 0], [4000, 3000], [3000, 3000], [3000, -500], [0, -500]]) === null, 'edges that cross are refused');
  ok(R.cleanOutline([[0, 0], [10, 0], [10, 10]]) === null && R.cleanOutline('x') === null && R.cleanOutline([[0, 0], ['a', 1], [1, 1], [2, 2]]) === null, 'too few corners, not a list and non-numbers are refused');
  ok(R.cleanOutline(Array.from({ length: 80 }, (_, i) => [i, 0])) === null, 'at most 32 corners');
  const typed = E.setOutline(P.newProject('mm'), '0,0 4000,0\n4000,2500; 2500 2500  2500,3500 0,3500');
  ok(typed.room.shape === 'free' && typed.room.pts.length === 6, 'typed text becomes an outline', JSON.stringify(typed.room));
  ok(E.setOutline(typed, '0,0 100,0') === typed && E.setOutline(typed, '0,0 400,0 400,400 0,400 100,-50') === typed, 'a bad typed outline (too few corners, crossing edges) leaves the job as it was');
  const rectAgain = E.setOutline(P.newProject('mm'), '0,0 3000,0 3000,2000 0,2000');
  ok(rectAgain.room.shape === 'rect' && rectAgain.room.w === 3000 && rectAgain.room.d === 2000, 'four corners typed as an outline is a rectangle');
  ok(R.outlineFromTurns([4000, 2500, 1500, 1000, 2500, 1500], ['L', 'L', 'R', 'L', 'L', 'L']).length === 6, 'an outline from edge lengths and turns');
}

section('Room: inside and outside');
{
  const L = R.cleanRoom({ w: 4000, d: 3000, h: 2400, shape: 'L', notch: { w: 1500, d: 1200, at: 'NE' } });
  ok(R.pointInRoom(L, 100, 100) && R.pointInRoom(L, 3900, 100) && !R.pointInRoom(L, 3500, 2800) && R.pointInRoom(L, 0, 0), 'points: in the box part yes, in the notch no, a corner counts');
  ok(R.rectInRoom(L, [0, 0, 600, 600]) && !R.rectInRoom(L, [3000, 2000, 3900, 2900]) && !R.rectInRoom(L, [2000, 1200, 3000, 3000]), 'rectangles: inside yes; in the notch no; one that has the inside corner in it no');
  ok(near(R.distToWalls(L, [500, 500, 1500, 1500]), 500) && R.distToWalls(L, [0, 500, 500, 1000]) === 0, 'distance to the nearest wall');
}

section('Room: what a file can say about the room, the runs, the openings');
{
  const p = P.cleanProject({ unit: 'mm', room: { w: 4000, d: 3000, h: 2400, shape: 'L', notch: { w: 1500, d: 1200, at: 'NE' } }, runs: [{ id: 'A', wall: 'P3', base: [] }, { id: 'B', wall: 'ZZ', base: [] }, { id: 'C', wall: 'S', base: [] }],
    openings: [{ kind: 'door', wall: 'P1', at: 500, w: 900 }, { kind: 'window', wall: 'nope' }, { kind: 'door', wall: 'P1', at: -50, w: 99999 }, null, { kind: 'window', wall: 'P2', at: 100, w: 1200, h: 99999, sill: -5 }] });
  ok(p.runs[0].wall === 'P3' && p.runs[1].wall === 'P1' && p.runs[2].wall === 'P1', 'a run on an unknown wall (or S in an L) goes to the first wall');
  ok(p.openings.length === 3 && p.openings[0].w === 900 && p.openings[1].at === 0 && p.openings[1].w <= 4000, 'openings: unknown wall dropped, width and position held to the wall', JSON.stringify(p.openings));
  ok(p.openings[2].h <= 2400 && p.openings[2].sill === 0 && new Set(p.openings.map((o) => o.id)).size === 3, 'an opening is no taller than the room, a sill is not negative, ids are unique', JSON.stringify(p.openings[2]));
  ok(JSON.stringify(P.cleanProject(p)) === JSON.stringify(p), 'cleaning twice changes nothing');
  const many = P.cleanProject({ openings: Array.from({ length: 90 }, () => ({ kind: 'door', wall: 'S', w: 100 })), islands: Array.from({ length: 20 }, () => ({ len: 1000 })) });
  ok(many.openings.length === 40 && many.islands.length === 6, 'at most 40 openings and 6 islands');
  const old = P.cleanProject({ unit: 'mm', room: { w: 3600, d: 3000, h: 2400 }, runs: [{ id: 'A', wall: 'N', base: [cab('base-door', 600)] }] });
  ok(old.room.shape === 'rect' && old.islands.length === 0 && old.openings.length === 0 && old.runs[0].wall === 'N', 'a job file from before this round opens as it was');
}

section('Layout in an L room');
{
  // the box 4000 × 3000 with the north-east notch 1500 × 1200 cut out. P1 south (4000), P2 east (1800), P3 along the notch's floor going west (1500, ends at the inside corner),
  // P4 up the notch's west side, P5 north, P6 west.
  const p = job({ w: 4000, d: 3000, shape: 'L', notch: { w: 1500, d: 1200, at: 'NE' } }, [
    { id: 'A', wall: 'P1', base: [cab('base-door', 600), cab('base-pair', 900), cab('base-door', 600), cab('base-pair', 900), cab('base-pair', 1000)] },
    { id: 'B', wall: 'P2', base: [cab('base-door', 600), cab('base-door', 600)] },
    { id: 'C', wall: 'P3', base: [cab('base-door', 600), cab('base-door', 300)] },
    { id: 'D', wall: 'P6', base: [cab('base-door', 600)] }]);
  const lay = P.layoutProject(p);
  const run = (id) => lay.runs.find((r) => r.run.id === id);
  ok(lay.walls.length === 6 && run('A').wall === 'P1' && near(run('A').len, 4000) && near(run('B').len, 1800) && near(run('C').len, 1500), 'the layout carries the room\'s walls and each run its wall\'s length');
  ok(run('B').rows.base.blocked.start === 560 && run('B').rows.base.cells[0].x === 560, 'at the south-east room corner the east run starts after the south run\'s depth (they butt)', JSON.stringify(run('B').rows.base.blocked));
  ok(run('C').closedStart === true && run('C').closedEnd === false, 'the notch\'s floor wall starts at a room corner and ends at an inside corner');
  ok(run('C').rows.base.blocked.start === 560, 'at the room corner between the east wall and the notch wall the later run butts too');
  ok(run('C').rows.base.cells.at(-1).kind === 'endpanel', 'a run that ends at an inside corner gets an end panel there', run('C').rows.base.cells.map((c) => c.kind).join());
  ok(near(run('D').len, 3000) && run('D').frame.u.y === -1 && run('D').frame.n.x === 1, 'the west wall (P6) runs south with the room on its left');
  const q = codes(p);
  ok(!q.includes('cab.outside') && !q.includes('cab.collide'), 'no cabinet is outside the L or collides with another', q.join());
  // something put in the notch is outside
  const bad = P.cleanProject({ ...p, islands: [{ id: 'I1', x: 3000, y: 2200, len: 900, base: [cab('base-pair', 900)] }] });
  ok(codes(bad).includes('cab.outside'), 'a cabinet in the notch is outside the room', codes(bad).join());
}

section('Layout in a U room');
{
  const p = job({ w: 5000, d: 4000, shape: 'U', notch: { w: 1600, d: 2000, at: 'N' } }, [
    { id: 'A', wall: 'P1', base: [cab('base-door', 600), cab('base-pair', 900)] },
    { id: 'B', wall: 'P5', base: [cab('base-door', 600), cab('base-door', 600)] }]);
  const lay = P.layoutProject(p);
  ok(lay.walls.length === 8 && lay.walls.filter((w) => !w.convexStart).length === 2, 'a U room has eight walls and two inside corners');
  const q = codes(p);
  ok(!q.includes('cab.outside') && !q.includes('cab.collide'), 'cabinets along the U\'s walls stand inside it', q.join());
}

section('Islands and peninsulas');
{
  let p = job({ w: 5000, d: 4000 }, [{ id: 'A', wall: 'S', base: [cab('base-door', 600), cab('base-pair', 900)] }]);
  p = E.addIsland(p, 'island');
  ok(p.islands.length === 1 && p.islands[0].id === 'I1', 'an island is added');
  p = E.setIsland(p, 'I1', { x: 1000, y: 1300, rot: 0, len: 2000, seat: 300 });
  p = E.addItem(p, 'I1', 'base', cab('base-drawers3', 600));
  p = E.addItem(p, 'I1', 'base', cab('base-pair', 900));
  p = E.addItem(p, 'I1', 'base', cab('base-door', 300));
  ok(p.islands[0].base.length === 3, 'cabinets are added to the island\'s row through the same edits as a run');
  const lay = P.layoutProject(p);
  const I = lay.runs.find((r) => r.run.id === 'I1');
  ok(I.island && I.frame.o.x === 1000 && I.frame.o.y === 1300 && I.frame.u.x === 1 && I.frame.n.y === 1, 'the island\'s front row starts at its x, y, runs east, fronts facing north (its left)');
  ok(I.rows.base.cells[0].kind === 'endpanel' && I.rows.base.cells.at(-1).kind === 'endpanel', 'a free-standing row has end panels at both ends', I.rows.base.cells.map((c) => c.kind).join());
  const ctr = lay.counters.find((c) => c.run === 'I1');
  ok(ctr && ctr.y0 === -300 && near(ctr.width, 300 + 560 + 25), 'the island\'s countertop overhangs the back by the seat depth and the front by the usual overhang', JSON.stringify(ctr));
  ok(P.layoutProject(E.setIsland(p, 'I1', { rot: 90 })).runs.find((r) => r.run.id === 'I1').frame.n.x === -1, 'turned 90°: the fronts face west');
  // back row
  let q = E.addItem(p, 'I1', 'back', cab('base-door', 600));
  const lq = P.layoutProject(q);
  const back = lq.runs.find((r) => r.run.id === 'I1b');
  ok(back && back.frame.n.y === -1 && back.frame.u.x === -1 && back.frame.o.x === 3000, 'a second row faces the other way from the far end', JSON.stringify(back && back.frame));
  // peninsula
  let pen = E.addIsland(job({ w: 5000, d: 4000 }, [{ id: 'A', wall: 'W', base: [cab('base-door', 600)] }]), 'peninsula');
  ok(pen.islands[0].kind === 'peninsula' && pen.islands[0].attach.start === true, 'a peninsula starts against a wall');
  pen = E.setIsland(pen, 'I1', { x: 0, y: 2000, len: 1500 });
  pen = E.addItem(pen, 'I1', 'base', cab('base-door', 600)); pen = E.addItem(pen, 'I1', 'base', cab('base-door', 600));
  const pr = P.layoutProject(pen).runs.find((r) => r.run.id === 'I1').rows.base.cells;
  ok(pr[0].kind === 'cab' && pr.at(-1).kind === 'endpanel', 'a peninsula has no end panel at the wall end and one at the free end', pr.map((c) => c.kind).join());
  const pc = P.layoutProject(pen).counters.find((c) => c.run === 'I1');
  ok(pc.ends.start === 'wall' && pc.ends.end === 'panel', 'its countertop butts the wall at one end', JSON.stringify(pc.ends));
  // checks
  ok(codes(p).includes('island.aisle'), 'an island 740 mm from the cabinets behind it: the aisle warning', codes(p).join());
  ok(!codes(E.setIsland(p, 'I1', { y: 2000 })).includes('island.aisle'), '…and none once it stands 1440 mm from them')
  const hit = E.setIsland(p, 'I1', { x: 500, y: 300 });
  ok(codes(hit).includes('cab.collide'), 'an island on top of the south run: the cabinets collide', codes(hit).join());
  const out = E.setIsland(p, 'I1', { x: 4500, y: 2000 });
  ok(codes(out).includes('cab.outside'), 'an island going through the east wall: outside the room', codes(out).join());
  ok(E.removeIsland(p, 'I1').islands.length === 0, 'removed');
  const sz = E.setUnit(p, 'in');
  ok(near(sz.islands[0].x, 1000 / 25.4, 0.1) && sz.islands[0].base.length === 3, 'changing the unit converts the island too');
}

section('Doors and windows: cabinets respect them');
{
  let p = job({ w: 4000, d: 3000 }, [{ id: 'A', wall: 'S', base: [cab('base-door', 600), cab('base-pair', 900), cab('base-door', 600), cab('base-door', 600)], upper: [cab('wall-door', 600), cab('wall-pair', 800), cab('wall-door', 600)] }]);
  p = E.addOpening(p, 'S', 'door'); p = E.setOpening(p, 'D1', { at: 1700, w: 900 });
  const c1 = A.analyze(p, {}).problems.filter((x) => x.code === 'cab.opening');
  ok(c1.length >= 2, 'a door in the middle of the run: base and wall cabinets stand in front of it', c1.map((x) => x.id).join());
  const gap = E.openGap(p, 'A', 'D1');
  const lay = P.layoutProject(gap).runs[0].rows.base.cells;
  const g = lay.find((c) => c.kind === 'gap');
  ok(g && g.x <= 1700 - 50 + 1e-6 && g.x + g.w >= 2600 + 50 - 1e-6, 'Leave it free: a gap in the floor row covers the door and 50 mm each side', JSON.stringify(g));
  const after = A.analyze(gap, {}).problems.filter((x) => x.code === 'cab.opening' && x.id.includes('B') );
  ok(A.analyze(gap, {}).problems.filter((x) => x.code === 'cab.opening' && /\.[BDT]\d/.test(x.id)).length === 0, 'after that no floor cabinet is in front of the door', after.map((x) => x.id).join());
  // windows
  let w = job({ w: 4000, d: 3000 }, [{ id: 'A', wall: 'S', base: [cab('base-door', 600), cab('base-pair', 900), cab('tall-pantry', 600)], upper: [cab('wall-door', 600), cab('wall-pair', 800)] }]);
  w = E.addOpening(w, 'S', 'window'); w = E.setOpening(w, 'W1', { at: 100, w: 1500, sill: 1000, h: 1200 });
  const cw = codes(w);
  ok(cw.includes('cab.opening'), 'a wall cabinet in front of the glass, and a pantry as tall as the window, are errors', cw.join());
  const a1 = A.analyze(w, {}).problems.filter((x) => x.code === 'cab.opening').map((x) => x.id);
  ok(!a1.some((id) => /B0[12]\b/.test(id)), 'base cabinets under a window with a 1000 mm sill are fine', a1.join());
  const low = E.setOpening(w, 'W1', { sill: 1800, h: 500 });
  ok(A.analyze(low, {}).problems.some((x) => x.code === 'cab.under-window'), 'a window above the wall cabinets: they hang under it (warning)', codes(low).join());
  ok(A.analyze(low, {}).problems.find((x) => x.code === 'cab.under-window').severity === 'warning', 'under-window is a warning');
  // swing
  let d = job({ w: 4000, d: 3000 }, [{ id: 'A', wall: 'N', base: [cab('base-door', 600)] }, { id: 'B', wall: 'S', base: [cab('base-door', 600)] }]);
  d = E.addOpening(d, 'S', 'door'); d = E.setOpening(d, 'D1', { at: 1500, w: 900 });
  d = E.addIsland(d); d = E.setIsland(d, 'I1', { x: 1400, y: 500, len: 1200 }); d = E.addItem(d, 'I1', 'base', cab('base-pair', 900));
  ok(codes(d).includes('cab.door-swing'), 'an island in the swing of a door that opens in: warned', codes(d).join());
  ok(!codes(E.setOpening(d, 'D1', { swing: 'out' })).includes('cab.door-swing'), '…and not when it opens out');
  // tight
  let t = job({ w: 4000, d: 3000 }, [{ id: 'A', wall: 'S', base: [cab('base-door', 600), cab('base-door', 600)] }]);
  t = E.addOpening(t, 'S', 'door'); t = E.setOpening(t, 'D1', { at: 1230, w: 900 });
  ok(codes(t).includes('cab.opening-tight') && !codes(t).includes('cab.opening'), 'a cabinet 30 mm from a door frame: tight (warning), not in front');
  ok(E.removeOpening(t, 'D1').openings.length === 0, 'removed');
  // the wall change
  const moved = E.setRoomShape(E.addOpening(job({ w: 4000, d: 3000 }, [{ id: 'A', wall: 'N', base: [] }]), 'N', 'door'), 'L');
  ok(R.walls(moved.room).find((x) => x.id === moved.runs[0].wall).frame.u.x === -1 && moved.openings[0].wall === moved.runs[0].wall, 'changing the shape to an L moves the north run and its door to the L\'s north wall');
}

section('Room edits');
{
  let p = P.newProject('mm');
  p = E.setRoomShape(p, 'L');
  ok(p.room.shape === 'L' && p.room.notch.at === 'NE', 'shape: L with a default notch');
  p = E.setRoomNotch(p, { w: 1000, d: 800, at: 'SW' });
  ok(p.room.notch.at === 'SW' && p.room.notch.w === 1000, 'notch edited');
  p = E.setRoomShape(p, 'U'); ok(p.room.shape === 'U' && p.room.notch.at === 'N', 'shape: U');
  p = E.setRoomShape(p, 'free'); ok(p.room.shape === 'free' && p.room.pts.length === 8, 'shape: free keeps the U\'s corners to edit');
  p = E.setRoomShape(p, 'rect'); ok(p.room.shape === 'rect' && !p.room.pts && !p.room.notch, 'back to a rectangle');
  const inch = E.setUnit(E.setRoomShape(P.newProject('mm'), 'L'), 'in');
  ok(inch.room.notch.w < 100 && inch.room.w < 200, 'inches: the notch is converted too');
}

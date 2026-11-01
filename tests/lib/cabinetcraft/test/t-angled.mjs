/* SPDX-License-Identifier: Apache-2.0 */
// Round 3 (DC.117, 0.8.2): angled and curved walls. Geometry checked by hand: angles, chords, sagittas, gaps, areas; then the room, the layout, the checks,
// the drawings, the solids and the bodies on a bay room (45 degree corners) and a curved wall.
const { ok, section, near, mine } = globalThis.__ccTest;
const G = await mine('lib/angled.js');
const R = await mine('lib/room.js');
const P = await mine('lib/project.js');
const A = await mine('lib/analyze.js');
const F = await mine('lib/footprint.js');
const D = await mine('lib/drawings.js');
const S = await mine('lib/solids.js');
const V = await mine('lib/bodies3d.js');
const E = await mine('lib/edit.js');
const C = await mine('lib/corner.js');

const cab = (tpl, w, extra = {}) => ({ kind: 'cab', tpl, w, ...extra });
const BAY = [[0, 0], [4000, 0], [4000, 2000], [3000, 3000], [1000, 3000], [0, 2000]];
const bay = (runs, extra = {}) => P.cleanProject({ unit: 'mm', room: { shape: 'free', pts: BAY, h: 2400, ...extra }, runs });
const curve = (runs, sweep = 90) => P.cleanProject({ unit: 'mm', room: { shape: 'free', pts: [[0, 0], [4000, 0], [4000, 2500], [0, 2500]], arcs: [{ i: 2, sweep }], h: 2400 }, runs });
const area = (pts) => Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
const codes = (p) => A.analyze(p, {}).problems.map((x) => x.code);

section('Angled geometry (hand-checked)');
{
  const e = G.edgeEnd([0, 0], 1000, 60);
  ok(near(e[0], 500, 1e-4) && near(e[1], 866.025404, 1e-4), 'a wall typed as length 1000 at 60 degrees ends at (500, 866.025)');
  const a = G.arcEnd([0, 0], 0, 1000, 60);
  ok(near(a[0], 1000, 1e-4) && near(a[1], 0, 1e-4), 'an arc of radius 1000 and sweep 60 has a chord of 1000 (2 r sin 30)');
  const g = G.arcGeom([0, 0], [1000, 0], 60);
  ok(near(g.r, 1000, 1e-4) && near(g.arcLen, 1047.1976, 1e-3) && near(g.sag, 133.9746, 1e-3) && g.bay && near(g.cx, 500, 1e-4) && near(g.cy, 866.0254, 1e-3), 'bay arc: radius 1000, length 1047.198, sagitta 133.975, centre (500, 866.025) on the room side');
  const b = G.arcGeom([0, 0], [1000, 0], -60);
  ok(!b.bay && near(b.cy, -866.0254, 1e-3), 'a bow has its centre on the far side');
  ok(near(G.sagitta(1000, 600), 46.0607, 1e-3), 'a 600 chord on radius 1000 is 46.061 off the curve (r - sqrt(r2 - w2/4))');
  const t = G.arcFromThree([0, 0], [500, 133.975], [1000, 0]);
  ok(near(t.r, 1000, 0.01) && near(t.sweep, -60, 0.01), 'three points: the middle one on the room (left) side is a bow of radius 1000 and sweep -60', JSON.stringify(t));
  const t2 = G.arcFromThree([0, 0], [500, -133.975], [1000, 0]);
  ok(near(t2.sweep, 60, 0.01), 'and on the other side a bay (+60)');
  ok(G.arcFromThree([0, 0], [1, 0], [2, 0]) === null, 'three points on a line make no arc');
  ok(near(G.turnBetween({ x: 1, y: 0 }, { x: 0, y: 1 }), 90) && near(G.turnBetween({ x: 1, y: 0 }, { x: Math.SQRT1_2, y: -Math.SQRT1_2 }), -45), 'turns: +90 left, -45 right');
  ok(near(G.cornerBlock(90, 560), 560) && near(G.cornerBlock(45, 560), 395.9798, 1e-3) && near(G.cornerBlock(60, 560), 484.9742, 1e-3) && G.cornerBlock(150, 560) === 560, 'a run stops short by depth x sin(turn): 560, 395.98 at 45, 484.97 at 60');
  const w = G.wedgeCorner(60, 560);
  ok(near(w.leg1, 484.9742, 1e-3) && near(w.leg2, 280, 1e-3) && near(w.area, 67896.3, 1), 'wedge at 60: legs 484.974 and 280, area 67 896');
  ok(G.wedgeCorner(120, 560) === null, 'no wedge past 90 degrees of turn');
}

section('Diagonal-front cabinet at a true angle');
{
  const d90 = G.diagAt(90, 900, 560);
  ok(near(d90.ell, 340) && near(d90.Q[0], 340) && near(d90.Q[1], 560) && near(d90.front, 340 * Math.SQRT2, 1e-3), 'at 90 degrees it is the right-angled diagonal: legs 340, front 340 x sqrt 2 = 480.83');
  const pent = [[0, 0], [900, 0], [900, 900], [340, 900], [0, 560]];
  ok(near(d90.area, area(pent), 1e-3), 'and its outline has the right-angled diagonal\'s area (' + Math.round(d90.area) + ')');
  const d60 = G.diagAt(60, 900, 560);
  ok(near(d60.ell, 900 - 560 * Math.tan(Math.PI / 6), 1e-6) && near(d60.ell, 576.684, 1e-2) && near(d60.mitre, 560 / Math.cos(Math.PI / 6), 1e-3) && near(d60.mitreAngle, 60) && near(d60.apex, 120) && near(d60.front, 998.84, 1e-1), 'at 60: legs 576.68, mitre 646.64 long at 60 degrees, apex 120, front 998.84');
  const tri = 0.5 * d60.ell * d60.ell * Math.sin(Math.PI * 2 / 3), trap = (900 + d60.Q[0]) / 2 * 560;
  ok(near(d60.area, 2 * trap + tri, 0.5), 'its area is two trapezoids plus the isosceles triangle (' + Math.round(d60.area) + ')');
  ok(near(d60.Q[1], 560) && near(d60.Q[0], 900 - 560 * Math.tan(Math.PI / 6), 1e-6), 'the inside corner Q lies on the first arm\'s front line');
  ok(!G.diagAt(60, 300, 560).valid && G.diagAt(60, 600, 560).valid, 'an arm shorter than the front\'s inset (300 - 323) makes no cabinet');
}

section('Stepping cabinets along a curve (hand-checked)');
{
  const g = G.arcGeom([0, 0], [2000 * Math.SQRT2, 0], 90);   // bay, radius 2000
  const items = [1, 2, 3, 4].map(() => ({ w: 600, d: 560 }));
  const st = G.stepArc(g, items);
  ok(near(g.r, 2000, 1e-3), 'radius 2000');
  ok(st.cells.length === 4 && st.invalid.length === 0 && st.overflow === 0, 'four 600 cabinets fit on a 90 degree bay of radius 2000');
  ok(near(st.cells[0].gap, 22.628, 1e-2), 'the gap between a cabinet\'s back middle and the curve is the sagitta, 22.628');
  for (const c of st.cells) ok(near(Math.hypot(c.corners.bl.x - g.cx, c.corners.bl.y - g.cy), 2000, 1e-3) && near(Math.hypot(c.corners.br.x - g.cx, c.corners.br.y - g.cy), 2000, 1e-3), 'a bay cabinet\'s back corners are on the wall circle');
  const dphi = Math.abs(st.cells[1].phi - st.cells[0].phi) * 180 / Math.PI;
  ok(near(dphi, 23.898, 0.01), 'neighbours are 23.898 degrees apart (2 atan(300 / (1977.372 - 560)))', String(dphi));
  ok(st.wedges.every((w) => w.front < 0.01), 'their fronts touch');
  ok(near(st.wedges[0].back, 231.78, 0.3), 'and the void at the wall is 231.8 wide', String(st.wedges[0].back));
  let clash = 0;
  for (let i = 1; i < st.cells.length; i++) { const a = st.cells[i - 1].corners, b = st.cells[i].corners; clash += F.overlap([a.bl, a.br, a.fr, a.fl].map((q) => [q.x, q.y]), [b.bl, b.br, b.fr, b.fl].map((q) => [q.x, q.y])); }
  ok(clash < 1e-3, 'no neighbours overlap');
  // a bow
  const gb = G.arcGeom([0, 0], [2000 * Math.SQRT2, 0], -90);
  const sb = G.stepArc(gb, items);
  ok(near(sb.cells[0].gap, Math.sqrt(2000 * 2000 + 300 * 300) - 2000, 1e-3) && sb.cells[0].gapAt === 'corners', 'on a bow the gap to the curve is at the back corners (22.4)');
  ok(near(Math.abs(sb.cells[1].phi - sb.cells[0].phi) * 180 / Math.PI, 17.0617, 0.01), 'neighbours 17.062 degrees apart (2 atan(300 / 2000))');
  ok(near(sb.wedges[0].back, 0, 0.01) && near(sb.wedges[0].front, 166.3, 0.6), 'backs touch, a wedge of 166.3 opens at the fronts', String(sb.wedges[0].front));
  const over = G.stepArc(g, [1, 2, 3, 4, 5, 6, 7, 8].map(() => ({ w: 600, d: 560 })));
  ok(over.overflow > 100, 'eight cabinets overflow the curve (by ' + Math.round(over.overflow) + ')');
  ok(G.stepArc(g, [{ w: 4500, d: 560 }]).invalid.length >= 1, 'a cabinet wider than the circle is refused');
}

section('Rooms with angled and curved walls');
{
  const r = R.cleanRoom({ shape: 'free', pts: BAY, h: 2400 });
  ok(r.shape === 'free' && r.pts.length === 6, 'a bay room keeps its slanted walls (six corners)');
  const w = R.walls(r);
  ok(w.map((x) => Math.round(x.len)).join() === '4000,2000,1414,2000,1414,2000', 'wall lengths 4000, 2000, 1414.2 ...');
  ok(w.map((x) => Math.round(x.turnEnd)).join() === '90,45,45,45,45,90' && w.reduce((s, x) => s + x.turnEnd, 0) === 360, 'corner turns 90, 45, 45, 45, 45, 90 add to 360');
  ok(near(w[2].angle, 135, 1e-4) && near(w[4].angle, -135, 1e-4), 'the bay walls run at 135 and -135 degrees');
  ok(near(area(R.roomOutline(r)), 11000000, 1), 'the bay room has area 4000 x 2000 + (4000 + 2000) / 2 x 1000 = 11 000 000');
  ok(R.pointInRoom(r, 2000, 2900) && !R.pointInRoom(r, 3900, 2900) && R.pointInRoom(r, 3500, 2400) && !R.pointInRoom(r, 3600, 2600), 'inside tests follow the slanted walls');
  ok(R.cleanOutline(BAY) === null, 'the right-angle cleaner still refuses slanted edges');
  const c = R.cleanRoom({ shape: 'free', pts: [[0, 0], [4000, 0], [4000, 2500], [0, 2500]], arcs: [{ i: 2, sweep: 90 }], h: 2400 });
  ok(c.arcs.length === 1 && c.shape === 'free', 'an arc wall is kept');
  const wc = R.walls(c)[2];
  ok(near(wc.arc.r, 2828.427, 1e-2) && near(wc.chord, 4000) && near(wc.len, 4442.883, 1e-2) && near(wc.arc.sag, 828.427, 1e-2), 'the arc wall: radius 2828.43, chord 4000, length 4442.88, sagitta 828.43');
  const segs = 12283185;   // 4000 x 2500 + the segment: r2/2 (pi/2 - 1)
  ok(Math.abs(area(R.roomOutline(c)) - segs) < 3000, 'its area is 4000 x 2500 + the circular segment, about 12 283 185', String(area(R.roomOutline(c))));
  ok(c.d > 3300 && near(c.d, 2500 + 828.427, 0.1), 'the room is 3328.4 deep at the middle of the bay');
  ok(R.pointInRoom(c, 2000, 3200) && !R.pointInRoom(c, 2000, 3400), 'inside tests follow the arc');
  const cw = R.cleanRoom({ shape: 'free', pts: [[0, 0], [0, 2500], [4000, 2500], [4000, 0]], arcs: [{ i: 1, sweep: 90 }], h: 2400 });
  ok(cw.arcs.length === 1 && near(cw.d, 3328.427, 0.1) && R.walls(cw).filter((x) => x.arc).length === 1, 'the same room clicked clockwise is made counter-clockwise with its arc kept');
  ok(R.cleanRoom({ shape: 'free', pts: [[0, 0], [4000, 0], [4000, 2500]], arcs: [{ i: 5, sweep: 90 }, { i: 0, sweep: 0 }] }).arcs === undefined, 'arcs on edges that do not exist or with no sweep are dropped');
  ok(R.cleanRoom({ shape: 'free', pts: [[0, 0], [4000, 0], [0, 2000], [4000, 2000]] }).shape === 'rect', 'an outline that crosses itself is refused (falls back to the plain rectangle)');
  // typed walls
  const t = E.setSegments(P.newProject('mm'), '4000 0\n2000 90\n1414.214 135\n2000 180\n1414.214 225');
  ok(t.room.shape === 'free' && t.room.pts.length === 6 && near(t.room.pts[3][0], 3000, 0.01) && near(t.room.pts[3][1], 3000, 0.01), 'walls typed as length + angle make the bay room', JSON.stringify(t.room.pts));
  const t2 = E.setSegments(P.newProject('mm'), '4000 0\n2500 90\n4000 180\narc 2828.427 90 180');
  ok(t2.room.arcs && t2.room.arcs.length === 1 && near(t2.room.d, 3328.4, 0.2), 'an arc typed as radius, sweep and heading closes the room', JSON.stringify(t2.room));
  const keep = P.newProject('mm');
  ok(E.setSegments(keep, 'nonsense') === keep && E.setSegments(keep, '100 0') === keep && E.setSegments(keep, 'arc 100 400 0\n100 90') === keep, 'text that makes no room leaves the job as it was');
  const wa = E.setWallArc(bay([]), 'P1', 40);
  ok(wa.room.arcs.length === 1 && wa.room.arcs[0].sweep === 40 && E.setWallArc(wa, 'P1', 0).room.arcs === undefined, 'one wall made an arc, and straight again');
}

section('Runs on angled walls');
{
  // P3 runs from (4000, 2000) to (3000, 3000) at 135 degrees; P4 along the top. 700 + 700 on P3 reaches its end (1414.2 - 1400 = 14.2 of filler).
  const p = bay([{ id: 'A', wall: 'P3', base: [cab('base-door', 700), cab('base-door', 700)] }, { id: 'B', wall: 'P4', base: [cab('base-door', 600), cab('base-door', 600)] }]);
  const lay = P.layoutProject(p);
  const A1 = lay.runs[0], B1 = lay.runs[1];
  ok(near(A1.frame.u.x, -Math.SQRT1_2, 1e-5) && near(A1.frame.u.y, Math.SQRT1_2, 1e-5) && near(A1.frame.n.x, -Math.SQRT1_2, 1e-5), 'the run on the slanted wall has its frame turned 135 degrees, the room on its left');
  const ev = lay.corners.find((c) => c.from === 'A' && c.to === 'B');
  ok(ev && ev.kind === 'wedge' && near(ev.tau, 45) && near(ev.stop, 395.98, 0.01), 'a corner of 45 degrees turn: the later run stops 395.98 short (560 x sin 45)', JSON.stringify(ev));
  ok(near(B1.rows.base.blocked.start, 395.98, 0.01) && near(B1.rows.base.cells[0].x, 395.98, 0.01), 'the north run starts 395.98 from the corner');
  const wd = lay.wedges[0];
  ok(wd && wd.no === 'W01' && near(wd.leg1, 395.98, 0.01) && near(wd.leg2, 395.98, 0.01) && near(wd.area, 78400, 1), 'the dead corner is a right triangle of 395.98 x 395.98, area 78 400');
  // its vertices: the corner (3000, 3000), 395.98 along P4 (west), and 560 into the room along P3\'s normal
  const [P0, Q1, X1] = wd.tri;
  ok(near(P0[0], 3000, 1e-3) && near(P0[1], 3000, 1e-3) && near(Q1[0], 3000 - 395.98, 0.01) && near(Q1[1], 3000, 0.01) && near(X1[0], 3000 - 560 * Math.SQRT1_2, 0.01) && near(X1[1], 3000 - 560 * Math.SQRT1_2, 0.01), 'its corners are where the geometry says', JSON.stringify(wd.tri));
  const a = A.analyze(p, {});
  const cs = a.problems.map((x) => x.code);
  ok(!cs.includes('cab.collide') && !cs.includes('cab.outside') && !cs.includes('run.over'), 'nothing collides or sticks out', cs.join());
  ok(cs.includes('corner.wedge'), 'a note describes the wedge');
  const wp = a.build.parts.filter((x) => x.group === 'W01');
  ok(wp.length === 1 && wp[0].nameKey === 'part.corner-wedge' && near(wp[0].width, 560) && near(wp[0].length, 870 - 150, 1), 'a closing panel 560 wide and as high as the cabinet\'s box (870 - 150 for the legs = 720) is in the cut list', JSON.stringify(wp));
  // the footprint of a cabinet on the slanted wall is turned
  const fp = F.footprints(a.build).find((f) => f.no === A1.rows.base.cells[0].no);
  const xs = fp.pieces[0].map((q) => q[0]);
  ok(fp.pieces[0].length === 4 && Math.max(...xs) - Math.min(...xs) > 700 * 0.7 * 0.9 + 560 * 0.7 * 0.9, 'the footprint is a turned rectangle');
  // the opening on a slanted wall
  const withDoor = P.cleanProject({ ...p, openings: [{ id: 'D1', kind: 'door', wall: 'P3', at: 100, w: 900 }] });
  ok(codes(withDoor).includes('cab.opening'), 'a door on the slanted wall in front of a cabinet is an error');
  const free = P.cleanProject({ ...withDoor, runs: [{ ...withDoor.runs[0], base: [{ kind: 'gap', w: 1000 }, cab('base-door', 400)] }, withDoor.runs[1]] });
  ok(!codes(free).includes('cab.opening'), 'with the place left free it is not');
  // corner too sharp: a turn of 150
  const sharp = P.cleanProject({ unit: 'mm', room: { shape: 'free', pts: [[0, 0], [4000, 0], [4000, 2000], [3500, 1500], [0, 1500]], h: 2400 }, runs: [{ id: 'A', wall: 'P2', base: [cab('base-door', 600), cab('base-door', 600), cab('base-door', 600)] }, { id: 'B', wall: 'P3', base: [cab('base-door', 350)] }] });
  void sharp;
}

section('Corner cabinets at other angles');
{
  const mk = (tpl) => bay([{ id: 'A', wall: 'P4', base: [cab('base-door', 600), cab(tpl, 900)] }, { id: 'B', wall: 'P5', base: [cab('base-door', 400)] }]);
  const p = mk('base-corner-diag');
  const lay = P.layoutProject(p);
  const c = lay.runs[0].rows.base.cells.find((x) => x.turn);
  ok(c && c.corner === 'end' && near(c.tau, 45) && near(c.x + c.w, 2000), 'a diagonal-front cabinet sits in the 45 degree-turn corner at the end of the north run');
  ok(near(lay.runs[1].rows.base.blocked.start, 900), 'the next wall\'s run starts after its 900 arm');
  const b = A.analyze(p, {}).build;
  const cb = b.cells.find((x) => x.corner).corner;
  ok(cb.form === 'adiag' && near(cb.dg.ell, 900 - 560 * Math.tan(Math.PI / 8), 1e-6) && near(cb.dg.mitreAngle, 67.5), 'built at the true angle (legs 668.03, mitre 67.5)');
  const fl = Math.hypot(900 + Math.cos(Math.PI / 4) * 882 - Math.sin(Math.PI / 4) * 560 - 18, Math.sin(Math.PI / 4) * 882 + Math.cos(Math.PI / 4) * 560 - 560);
  ok(near(cb.frontLen, fl, 1e-3) && near(cb.doorW, fl - 3, 1e-3), 'its door is the front length (from the arms\' ends, side thickness off) less the reveal: ' + fl.toFixed(2) + ' - 3');
  ok(cb.parts.filter((x) => x.name === 'part.corner-triangle').length >= 2 && cb.parts.some((x) => x.name === 'part.corner-bottom-b'), 'arm boards and triangles are in the cut list');
  const fp = F.footprints(b).find((f) => f.cell.turn);
  ok(fp && near(area(fp.pieces[0]), G.diagAt(45, 900, 560).area, 1), 'its footprint is the outline of diagAt');
  const cs = codes(p);
  ok(cs.includes('corner.diag') && !cs.includes('corner.angle') && !cs.includes('corner.misplaced'), 'a note for the diagonal at a true angle; no error', cs.join());
  for (const tpl of ['base-corner-l', 'base-corner-lazy']) {
    const q = mk(tpl);
    const lay2 = P.layoutProject(q);
    ok(!lay2.runs[0].rows.base.cornerEnd && lay2.runs[0].rows.base.cells.filter((x) => x.kind === 'cab').at(-1).angleMismatch && codes(q).includes('corner.angle'), tpl + ' does not fit a 45 degree corner: laid out plain, with an error');
  }
  const mir = bay([{ id: 'A', wall: 'P3', base: [cab('base-door', 600), cab('base-corner-diag', 900)] }]);   // P3 -> P4 is a 45 degree turn: a corner cabinet LAST on P3
  ok(P.layoutProject(mir).runs[0].rows.base.cornerEnd, 'a diagonal at the end of the slanted run is a corner cabinet too');
  // mirrored: first on a run
  const st = bay([{ id: 'A', wall: 'P4', base: [cab('base-corner-diag', 900), cab('base-door', 600)] }]);
  const stc = P.layoutProject(st).runs[0].rows.base.cells[0];
  ok(stc.corner === 'start' && near(stc.tau, 45), 'first on the run it turns the corner at the start');
  const fps = F.footprints(A.analyze(st, {}).build).find((f) => f.cell.turn);
  ok(fps && !codes(st).includes('cab.outside'), 'and stays inside the room');
}

section('Runs on a curved wall');
{
  const p = curve([{ id: 'A', wall: 'P3', base: [cab('base-door', 600), cab('base-door', 600), cab('base-door', 600), cab('base-door', 600)] }]);
  const lay = P.layoutProject(p);
  const rw = lay.runs[0].rows.base;
  ok(rw.arc && rw.arc.bay && near(rw.arc.r, 2828.427, 1e-2) && rw.cells.filter((x) => x.pf).length === rw.cells.length, 'the run is stepped along the arc; each cell has its own frame');
  const sag = 2828.427125 - Math.sqrt(2828.427125 ** 2 - 300 ** 2);
  ok(near(rw.arc.gapMax, sag, 0.01) && near(sag, 15.9, 0.1), 'stated maximum gap to the curve = the sagitta of a 600 chord on radius 2828.43, 15.9');
  const cabs = rw.cells.filter((x) => x.kind === 'cab');
  ok(cabs.every((c) => near(Math.hypot(c.pf.u.x, c.pf.u.y), 1, 1e-4)) && !near(cabs[0].pf.u.x, cabs[2].pf.u.x, 0.01), 'each cabinet is turned to the tangent at its own middle');
  const a = A.analyze(p, {});
  const cs = a.problems.map((x) => x.code);
  ok(!cs.includes('cab.collide') && !cs.includes('cab.outside') && !cs.includes('arc.over'), 'no collisions, nothing outside the curved room, no overflow', cs.join());
  ok(cs.includes('arc.gap') && cs.includes('arc.void'), 'notes: the gap to the curve and the voids behind the cabinets');
  ok(rw.cells.every((c) => c.ext && c.ext[0] >= -1 && c.ext[1] <= 4001), 'each cell knows its place along the chord');
  // overflow
  const big = curve([{ id: 'A', wall: 'P3', base: Array.from({ length: 9 }, () => cab('base-door', 600)) }]);
  ok(codes(big).includes('arc.over'), 'nine 600 cabinets do not fit: arc.over');
  // a bow: wedge gaps at the fronts
  const bow = curve([{ id: 'A', wall: 'P3', base: [cab('base-door', 600), cab('base-door', 600), cab('base-door', 600)] }], -60);
  const bc = A.analyze(bow, {}).problems.map((x) => x.code);
  ok(bc.includes('arc.wedge') && !bc.includes('cab.collide'), 'on a bow the wedge gaps at the fronts are a warning and nothing collides', bc.join());
  const wedges = P.layoutProject(bow).runs[0].rows.base.arc.wedges;
  ok(wedges.filter((w) => w.cabs).length === 2 && wedges.filter((w) => w.cabs).every((w) => w.front > 1 && w.back < 0.05), 'bow: backs touch, fronts open');
  // plan, elevation, 3d
  const plan = D.planSvg(a.build);
  ok(plan.svg.includes('<svg') && plan.svg.length > 2000, 'the plan draws');
  const el = D.elevationSvg(a.build, 'A');
  ok(el.svg.includes('<svg'), 'the elevation (seen straight on) draws');
  ok(D.isoSvg(a.build).svg.includes('<svg') && D.sheetSet(a.build, {}).length >= 3, '3D drawing and the sheet set');
  const sol = S.allSolids(a.build);
  ok(sol.length > 20 && sol.every((s) => s.to(0, 0, 0).every(Number.isFinite)), 'solids exist in room coordinates');
  const bodies = V.viewportBodies(a.build, { room: true });
  ok(bodies.length > 40 && bodies.some((x) => /wall/i.test(x.name || '') || (x.name || '').includes('bodies.wall')), 'viewport bodies include the room, with the curved wall in facets');
  const walls = bodies.filter((x) => (x.name || '').includes('bodies.wall'));
  ok(walls.length >= 12 + 3, 'the curved wall is many facets (' + walls.length + ' wall pieces)');
  // countertop follows the curve as one piece
  const ct = lay.counters[0];
  ok(ct && ct.world && ct.cabs === 4 && ct.poly.length >= 16, 'one countertop piece following the cabinets\' corners');
  // island and aisle checks use turned rectangles
  const k = curve([{ id: 'A', wall: 'P3', base: [cab('base-door', 600)] }]);
  ok(A.analyze(k, {}).build.layout.runs[0].rows.base.cells[0].pf !== undefined, 'single cabinet on the curve is placed');
}

section('Curved-front cabinet, made to order');
{
  const p = curve([{ id: 'A', wall: 'P3', base: [cab('base-door', 600), cab('base-curved-front', 1000), cab('base-door', 600)] }]);
  const a = A.analyze(p, {});
  const c = a.build.cells.find((x) => x.madeToOrder);
  ok(c && c.parts.length === 0 && c.drill.length === 0, 'a made-to-order cabinet has no cut list and no drilling');
  ok(near(c.madeToOrder.rBack, 2828.427, 0.01) && near(c.madeToOrder.rFront, 2828.427 - 560, 0.01) && near(c.madeToOrder.arcLen, 1000), 'front radius = wall radius - depth = 2268.43 for a bay');
  ok(c.madeToOrder.slices.length >= 3, 'a segmented body');
  const cs = a.problems.map((x) => x.code);
  ok(cs.includes('curved.order') && !cs.includes('curved.straight') && !cs.includes('cab.collide'), 'flagged as made to order, nothing collides (the sector clears its straight neighbours)', cs.join());
  const row = a.est.rows.find((r) => r.key.startsWith('mto:'));
  ok(row && row.placeholder && row.path === 'madeToOrder.curvedPerM' && near(row.qty, 1, 1e-6), 'one estimate line per metre of front arc, on a placeholder rate');
  const fl = P.cleanProject({ unit: 'mm', room: { w: 4000, d: 3000, h: 2400 }, runs: [{ id: 'A', wall: 'N', base: [cab('base-curved-front', 900)] }] });
  ok(codes(fl).includes('curved.straight'), 'on a straight wall it is an error');
  const sol = S.allSolids(a.build).filter((s) => s.no === c.no);
  ok(sol.length === c.madeToOrder.slices.length && sol.every((s) => s.shape.kind === 'prism'), 'the body is prism slices');
  const bow = A.analyze(curve([{ id: 'A', wall: 'P3', base: [cab('base-door', 600), cab('base-curved-front', 900), cab('base-door', 600)] }], -60), {}).build.cells.find((x) => x.madeToOrder);
  ok(near(bow.madeToOrder.rFront, bow.madeToOrder.rBack + 560, 0.01), 'on a bow the front radius is the wall radius + depth');
}

section('Angled rooms through the panel files');
{
  const p = bay([{ id: 'A', wall: 'P3', base: [cab('base-door', 700), cab('base-door', 700)] }]);
  const back = P.cleanProject(JSON.parse(JSON.stringify(p)));
  ok(JSON.stringify(back.room) === JSON.stringify(p.room), 'the job file round-trips with slanted walls');
  const q = curve([{ id: 'A', wall: 'P3', base: [cab('base-door', 600)] }]);
  ok(JSON.stringify(P.cleanProject(JSON.parse(JSON.stringify(q))).room.arcs) === JSON.stringify(q.room.arcs), 'and with arcs');
  const old = P.cleanProject({ unit: 'mm', room: { w: 3600, d: 3000, h: 2400 }, runs: [{ id: 'A', wall: 'N', base: [cab('base-door', 600)] }] });
  ok(old.room.shape === 'rect' && old.hw && Object.keys(old.hw).length === 0 && old.ratesOk.length === 0, 'an older job opens as it was (rectangle, no sizes typed, no rates confirmed)');
  void C;
}

section('The bay-window kitchen (the /lab test job): angled wall, curved wall, curved-front cabinet, diagonal corner cabinet');
{
  const { pathToFileURL } = await import('node:url');
  const path = await import('node:path');
  const { ROOT } = globalThis.__ccTest;
  const { BAY_JOB } = await import(pathToFileURL(path.join(ROOT, 'tools/addons-test/cabinetcraft-bay-job.mjs')).href);
  const p = P.cleanProject(JSON.parse(JSON.stringify(BAY_JOB)));
  ok(p.runs.length === 5 && p.room.arcs.length === 1 && p.room.pts.length === 6 && p.openings.length === 1, 'the job loads: five runs, six corners, one arc, one window');
  const a = A.analyze(p, {});
  const errors = a.problems.filter((x) => x.severity === 'error');
  ok(errors.length === 0, 'no errors in the whole job', errors.map((x) => x.code + ' ' + x.id).join());
  const lay = a.build.layout;
  ok(lay.corners.map((c) => c.kind + c.tau.toFixed(0)).join() === 'wedge45,wedge20,wedge20,diag45', 'the corners: wedge 45 (A to B), wedge 20 and 20 (into and out of the curve), a diagonal at 45 (D to E)');
  ok(lay.wedges.length === 3 && lay.wedges.every((w) => w.leg1 > 100 && w.no.startsWith('W')), 'three closing panels (W01 to W03)');
  ok(near(lay.wedges[0].leg1, 560 * Math.SQRT1_2, 0.01), 'the 45 corner\'s dead corner has legs of 395.98');
  ok(near(lay.wedges[1].leg1, 560 * Math.sin(Math.PI / 9), 0.01), 'the 20 degree corner\'s: 560 x sin 20 = 191.53');
  const cs = a.problems.map((x) => x.code);
  ok(['corner.wedge', 'corner.diag', 'arc.gap', 'arc.void', 'curved.order', 'corner.drillsize'].every((c) => cs.includes(c)), 'the notes: wedges, diagonal, curve gap and voids, made to order, blank drilling sizes', cs.join());
  const w = a.build.cells.find((c) => c.kind === 'cab' && c.madeToOrder);
  ok(w && near(w.madeToOrder.rBack, 2125.0, 1.5) && near(w.madeToOrder.rFront, w.madeToOrder.rBack - 560, 1e-6), 'the curved-front cabinet\'s front radius is the wall radius (2125) less the depth');
  const arc = lay.runs.find((r) => r.run.id === 'C').rows.base.arc;
  ok(arc.bay && near(arc.r, 1795.84 / (2 * Math.sin(Math.PI * 25 / 180)), 0.5) && arc.overflow === 0, 'the curve: radius 2124.4 from a chord of 1795.84 and a sweep of 50 degrees, no overflow');
  const open = D.sheetSet(a.build, {});
  ok(open.length >= 8 && open.every((s) => s.svg.includes('<svg')), 'every drawing draws (' + open.length + ' sheets)');
  const bodies = V.viewportBodies(a.build, { room: true });
  ok(bodies.length > 150, 'the viewport bodies: ' + bodies.length);
  ok(a.build.parts.some((x) => x.group === 'W01') && a.build.drill.length > 10, 'closing panels in the cut list, the corner cabinet drilled');
  const fp = F.footprints(a.build);
  let worst = 0;
  for (let i = 0; i < fp.length; i++) for (let j = i + 1; j < fp.length; j++) { if (fp[i].row !== fp[j].row) continue; for (const x of fp[i].pieces) for (const y of fp[j].pieces) worst = Math.max(worst, F.overlap(x, y)); }
  ok(worst < 1e-3, 'no two footprints overlap at all (worst ' + worst.toFixed(6) + ')');
  const again = A.analyze(P.cleanProject(JSON.parse(JSON.stringify(p))), {});
  ok(again.build.parts.length === a.build.parts.length, 'saved and opened again it builds the same');
}

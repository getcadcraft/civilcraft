#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** wall-square-test.mjs — 0.9 FX.22, the geometry alone (no browser): node tools/bimcraft-test/wall-square-test.mjs */
import { moveJoined, squareMove, squareUp, setAngle, angleOf, setLength, lengthFrom, roomSize, setRoomSize, moveOutward, squareSnap } from '../../public_html/assets/apps/bimcraft/dev/wall-square.js';
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + JSON.stringify(d) + ')' : '')); } };
const near = (p, q, e = 1e-3) => Math.hypot(p[0] - q[0], p[1] - q[1]) < e;
const num = (x, y, e = 1e-3) => Math.abs(x - y) < e;
const W = (guid, a, b, t = 200, x = {}) => ({ guid, a, b, t, storey: 1, bulge: 0, extSide: 'left', len: Math.hypot(b[0] - a[0], b[1] - a[1]), ...x });
const apply = (walls, plan) => walls.map((w) => { const m = plan.get(w.guid); return m ? { ...w, ...m, len: Math.hypot(m.b[0] - m.a[0], m.b[1] - m.a[1]) } : w; });
const by = (walls, g) => walls.find((w) => w.guid === g);
const dir = (w) => Math.atan2(w.b[1] - w.a[1], w.b[0] - w.a[0]) * 180 / Math.PI;
// clockwise seen from +y up: the outside is on the left of each wall
const rect = (w = 5000, h = 3000) => [W('s', [0, 0], [w, 0], 200, { extSide: 'right' }), W('e', [w, 0], [w, h], 200, { extSide: 'right' }), W('n', [w, h], [0, h], 200, { extSide: 'right' }), W('w', [0, h], [0, 0], 200, { extSide: 'right' })];

console.log('== the report: a move stays square');
let R = rect(), M = apply(R, squareMove(R, 's', -400));
ok(near(by(M, 's').a, [0, -400]) && near(by(M, 's').b, [5000, -400]), 'the south wall moves 400 square to itself');
ok(near(by(M, 'e').a, [5000, -400]) && near(by(M, 'e').b, [5000, 3000]) && dir(by(M, 'e')) === 90, 'the east wall stretches and stays at 90');
ok(near(by(M, 'w').b, [0, -400]) && dir(by(M, 'w')) === -90, 'the west wall too');
ok(by(M, 'n') === by(R, 'n'), 'the north wall is not touched');
ok(squareMove(R, 's', 0).size >= 3, 'a zero move still answers (no change)');

console.log('== a room that is not square keeps its angles');
const skew = [W('s', [0, 0], [5000, 0]), W('e', [5000, 0], [6000, 3000]), W('n', [6000, 3000], [1000, 3000]), W('w', [1000, 3000], [0, 0])];
M = apply(skew, squareMove(skew, 's', 300));
ok(num(dir(by(M, 'e')), dir(by(skew, 'e'))) && num(dir(by(M, 'w')), dir(by(skew, 'w'))), 'joined walls at another angle keep it (the corners slide along them)');
ok(num(by(M, 's').a[1], 300) && num(by(M, 's').a[0], 100) && num(by(M, 's').len, 5000), 'parallelogram: the wall keeps its direction');

console.log('== T joints, curved and in-line neighbours');
let T = [...rect(), W('p', [2000, 3000], [2000, 0], 100)];
M = apply(T, squareMove(T, 'n', -500));
ok(near(by(M, 'p').a, [2000, 3500]) && near(by(M, 'p').b, [2000, 0]), 'a partition butting into the moved wall comes with it');
M = apply(T, squareMove(T, 'p', 300));
ok(near(by(M, 'p').a, [2000 - 300, 3000]) || near(by(M, 'p').a, [2300, 3000]), 'a partition moved: it slides along the walls it butts into');
ok(by(M, 'n') === by(T, 'n'), 'the wall it butts into stays');
const inl = [W('a', [0, 0], [2000, 0]), W('b', [2000, 0], [4000, 0])];
M = apply(inl, squareMove(inl, 'a', 300));
ok(near(by(M, 'b').a, [2000, 300]), 'a wall in line with it: nothing to guide the corner, it carries it');
ok(squareMove([W('c', [0, 0], [1000, 0], 200, { bulge: 0.3 })], 'c', 100).size === 0, 'a curved wall has no square move');

console.log('== refusals');
let threw = null;
try { squareMove(rect(), 's', 3200); } catch (e) { threw = e.key; }
ok(threw === 'model.err.short', 'moving past the joined walls\' far ends is refused', threw);
threw = null; try { squareMove(rect(), 'nope', 1); } catch (e) { threw = e.key; }
ok(threw === 'model.err.nowall', 'an unknown wall is refused', threw);

console.log('== square up');
const bad = [W('s', [0, 0], [5170, 0]), W('e', [5170, 0], [5000, 2850]), W('n', [5000, 2850], [-170, 2850]), W('w', [-170, 2850], [0, 0])];
for (const pick of ['s', 'e', 'n', 'w']) {
  M = apply(bad, squareUp(bad, pick));
  ok(M.every((w) => Math.abs(((dir(w) % 90) + 90) % 90 % 90) < 1e-3 || Math.abs(((dir(w) % 90) + 90) % 90 - 90) < 1e-3), 'the skewed room comes back to 90 whichever wall is picked (' + pick + ')', M.map(dir));
  ok(near(by(M, 's').b, by(M, 'e').a) && near(by(M, 'e').b, by(M, 'n').a) && near(by(M, 'n').b, by(M, 'w').a) && near(by(M, 'w').b, by(M, 's').a), '  and every corner still joins');
  ok(num(by(M, 's').a[1], 0) && num(by(M, 'n').a[1], 2850), '  the two long straight walls stay where they are');
}
ok(squareUp(rect(), 's').size === 0, 'a room already square: nothing changes');
const turn = (p, r = 30 * Math.PI / 180) => [p[0] * Math.cos(r) - p[1] * Math.sin(r), p[0] * Math.sin(r) + p[1] * Math.cos(r)];
ok(squareUp(rect().map((w) => ({ ...w, a: turn(w.a), b: turn(w.b) })), 's').size === 0, 'a square room turned 30 degrees is square too');
const oneOff = [...rect().slice(0, 1), W('e', [5000, 0], [5200, 3000]), W('n', [5200, 3000], [0, 3000]), W('w', [0, 3000], [0, 0])];
M = apply(oneOff, squareUp(oneOff, 'e'));
ok(num(dir(by(M, 's')), 0) && num(dir(by(M, 'n')) % 180, 0) && num(dir(by(M, 'e')), 90), 'one tilted wall picked: it turns, the others stay the datum', M.map(dir));
const wing = [...rect(), W('x', [5000, 3000], [7000, 5000])];
ok(apply(wing, squareUp(wing, 's')).find((w) => w.guid === 'x').b[0] === 7000, 'a wall set at 45 degrees is left alone');
ok(!(squareUp(rect(), 's').has('x')), 'nothing else is in the answer');

console.log('== angle');
const ang0 = [W('s', [0, 0], [5170, 0]), W('e', [5170, 0], [5000, 2850]), W('n', [5000, 2850], [-170, 2850]), W('w', [-170, 2850], [0, 0])];
const info = angleOf(ang0, 'e');
ok(info.to === 's' && num(info.deg, Math.acos(170 / Math.hypot(170, 2850)) * 180 / Math.PI), 'reads the angle to the wall at its start', info);
M = apply(ang0, setAngle(ang0, 'e', 90));
ok(num(by(M, 'e').b[0], 5170) && num(by(M, 'e').b[1], 2850), 'Angle 90: square to it, the far corner slides along the north wall', by(M, 'e'));
ok(near(by(M, 'n').a, by(M, 'e').b), 'the north wall follows');
ok(num(angleOf(M, 'e').deg, 90), 'reads 90 afterward');
threw = null; try { setAngle(ang0, 'e', 200); } catch (e) { threw = e.key; }
ok(threw === 'model.err.angle', 'over 180 to a joined wall is refused', threw);
const lone = [W('l', [0, 0], [1000, 0])];
ok(angleOf(lone, 'l').to === null && near(apply(lone, setAngle(lone, 'l', 90))[0].b, [0, 1000]), 'a wall on its own: Direction from east');

console.log('== measuring: centre, inside, outside');
R = rect();
ok(num(lengthFrom(R, by(R, 's'), 'center'), 5000), 'length from the centre');
ok(num(lengthFrom(R, by(R, 's'), 'outside'), 5200), 'from outside: 5200, what the plan dimension reads');
ok(num(lengthFrom(R, by(R, 's'), 'inside'), 4800), 'from inside: 4800');
const r0 = rect().map((w) => ({ ...w, extSide: 'left' }));
ok(num(lengthFrom(r0, by(r0, 's'), 'outside'), 5200), 'square corners: the same whichever side its outside is');
const lone2 = [W('l', [0, 0], [1000, 0])];
ok(num(lengthFrom(lone2, lone2[0], 'inside'), 1000) && num(lengthFrom(lone2, lone2[0], 'outside'), 1000), 'a free wall is its own length from any face');
M = apply(R, setLength(R, 's', 6000, 'center'));
ok(near(by(M, 's').b, [6000, 0]) && near(by(M, 'e').b, [6000, 3000]) && num(dir(by(M, 'e')), 90) && near(by(M, 'n').a, [6000, 3000]), 'Length 6000: the joined wall moves and stays square');
M = apply(R, setLength(R, 's', 6000, 'inside'));
ok(num(lengthFrom(M, by(M, 's'), 'inside'), 6000) && num(by(M, 'e').a[0], 6200), 'Length 6000 from inside');
M = apply(R, setLength(R, 's', 6000, 'outside'));
ok(num(lengthFrom(M, by(M, 's'), 'outside'), 6000) && num(by(M, 'e').a[0], 5800), 'Length 6000 from outside');
ok(near(apply(lone2, setLength(lone2, 'l', 2000))[0].b, [2000, 0]), 'a free wall: its end moves');
const room = roomSize(R, by(R, 's'), 'inside');
ok(room.opposite === 'n' && num(room.value, 2800), 'room size across: the opposite wall, 2800 inside');
ok(num(roomSize(R, by(R, 's'), 'outside').value, 3200) && num(roomSize(R, by(R, 's'), 'center').value, 3000), '3200 outside, 3000 between centres');
M = apply(R, setRoomSize(R, 's', 4000, 'inside'));
ok(num(by(M, 's').a[1], -1200) && num(roomSize(M, by(M, 's'), 'inside').value, 4000) && num(dir(by(M, 'e')), 90), 'Room size 4000 inside: the wall moves away, walls stay square');
M = apply(R, setRoomSize(R, 'n', 2000, 'outside'));
ok(num(by(M, 'n').a[1], 1800) && num(roomSize(M, by(M, 'n'), 'outside').value, 2000), 'Room size 2000 outside, from the north wall');
ok(roomSize(lone2, lone2[0]) === null, 'nothing across: no room size');
ok(roomSize(oneOff, by(oneOff, 'e')) === null, 'a tilted wall with no parallel partner has no room size');

console.log('== typed move');
M = apply(R, moveOutward(R, 's', 200));
ok(num(by(M, 's').a[1], -200), 'Move square +200: outward');
M = apply(R, moveOutward(R, 's', -200));
ok(num(by(M, 's').a[1], 200), '-200: inward');

console.log('== end grip');
const near90 = squareSnap(R, by(R, 'e'), [5000, 0], [5100, 3000]);
ok(near90 && near(near90.p, [5000, 3001], 2), 'dragged within 3 degrees of square to the joined wall: it snaps', near90);
ok(squareSnap(R, by(R, 'e'), [5000, 0], [5800, 3000]) === null, 'further off: it stays free');

console.log('== 0.9 FX.62: the Move tool keeps walls joined (wall tool spec tests 1 and 2)');
R = rect(5000, 4000);
M = apply(R, moveJoined(R, new Map([['n', [0, 500]]])));
ok(near(by(M, 'n').a, [5000, 4500]) && near(by(M, 'n').b, [0, 4500]), 'test 1: the top wall moves 500 up');
ok(num(by(M, 'e').len, 4500) && num(by(M, 'w').len, 4500) && num(dir(by(M, 'e')), 90) && num(dir(by(M, 'w')), -90), 'test 1: the side walls lengthen 500 and stay at 90');
ok(near(by(M, 'e').b, by(M, 'n').a) && near(by(M, 'w').a, by(M, 'n').b) && by(M, 's') === by(R, 's'), 'test 1: all four corners still meet, the bottom wall is not touched');
T = [...rect(5000, 4000), W('p', [2000, 4000], [2000, 0], 100)];
M = apply(T, moveJoined(T, new Map([['s', [0, -300]]])));
ok(near(by(M, 'p').b, [2000, -300]) && near(by(M, 'p').a, [2000, 4000]) && num(by(M, 'p').len, 4300), 'test 2: the partition on the bottom wall lengthens 300 and stays joined');
M = apply(R, moveJoined(R, new Map([['n', [300, 500]]])));
ok(near(by(M, 'n').a, [5000, 4500]) && near(by(M, 'n').b, [0, 4500]) && num(dir(by(M, 'e')), 90), 'a sideways part of a Move does not tear a corner: the corner slides');
M = apply(R, moveJoined(R, new Map(R.map((w) => [w.guid, [700, -200]]))));
ok(R.every((w) => num(by(M, w.guid).len, w.len) && near(by(M, w.guid).a, [w.a[0] + 700, w.a[1] - 200])), 'a whole room moved together moves rigidly');
const free = [W('f', [0, 0], [2000, 0])];
M = apply(free, moveJoined(free, new Map([['f', [300, 400]]])));
ok(near(by(M, 'f').a, [300, 400]) && near(by(M, 'f').b, [2300, 400]), 'a wall joined to nothing moves exactly by the drag');
const L1 = [W('x', [0, 0], [3000, 0]), W('y', [3000, 0], [3000, 2000])];
M = apply(L1, moveJoined(L1, new Map([['x', [200, 300]]])));
ok(near(by(M, 'x').a, [200, 300]) && near(by(M, 'x').b, [3000, 300]) && near(by(M, 'y').a, [3000, 300]) && near(by(M, 'y').b, [3000, 2000]), 'an L: the joined end slides, the free end goes with the move');
const par = [W('a', [0, 0], [2000, 0]), W('b', [2000, 0], [4000, 0])];
M = apply(par, moveJoined(par, new Map([['a', [0, 300]]])));
ok(near(by(M, 'b').a, [2000, 300]) && near(by(M, 'b').b, [4000, 0]), 'a wall in line with it cannot guide: it is carried (turns), as before');
ok(moveJoined(R, new Map()).size === 0 && moveJoined(R, new Map([['n', [0, 0]]])).size === 0, 'a zero move changes nothing');
let thrown = null; try { moveJoined(R, new Map([['n', [0, -4500]]])); } catch (e) { thrown = e.key; }
ok(thrown === 'model.err.short', 'a move that would turn a joined wall back through itself is refused');

console.log('== wall tool spec tests 3 and 4 (the typed Length and the parallel distance)');
R = rect(5000, 4000).map((w) => ({ ...w, extSide: 'right' }));
M = apply(R, setLength(R, 's', 6000));
ok(near(by(M, 's').a, [0, 0]) && near(by(M, 's').b, [6000, 0]), 'test 3: the start end stays, the end moves 1000');
ok(near(by(M, 'e').a, [6000, 0]) && near(by(M, 'e').b, [6000, 4000]) && num(dir(by(M, 'e')), 90) && num(by(M, 'n').len, 6000), 'test 3: the right wall moves with it and keeps its direction, the top wall lengthens 1000 (D1 option A)');
M = apply(R, setRoomSize(R, 'e', 6000));
ok(near(by(M, 'e').a, [6000, 0]) && near(by(M, 'w').a, [0, 4000]) && num(by(M, 's').len, 6000) && num(by(M, 'n').len, 6000), 'test 4: the right wall moves, the left stays, the top and bottom stretch to stay joined');

console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);

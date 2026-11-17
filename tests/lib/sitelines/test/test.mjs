// SPDX-License-Identifier: Apache-2.0
// node lib/sitelines/test/test.mjs: every expected value is worked out by hand in the comment beside it (BK.104).
import * as S from '../sitelines.js';
let good = 0, bad = 0;
const ok = (c, label, detail = '') => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + label + (!c && detail !== '' ? ' (' + JSON.stringify(detail) + ')' : '')); };
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
const has = (poly, x, y) => poly.some((p) => near(p[0], x, 1e-6) && near(p[1], y, 1e-6));

console.log('== building line from setbacks');
// a 20 000 x 30 000 lot (mm), counter-clockwise from the origin. Edges: 0 south (street), 1 east, 2 north, 3 west.
const LOT = [[0, 0], [20000, 0], [20000, 30000], [0, 30000]];
// front 5000, sides 1500, rear 3000 → x from 1500 to 18500, y from 5000 to 27000: 17 000 x 22 000 = 374 000 000 mm2
let r = S.buildingLine(LOT, [5000, 1500, 3000, 1500]);
ok(r.poly && r.poly.length === 4 && has(r.poly, 1500, 5000) && has(r.poly, 18500, 5000) && has(r.poly, 18500, 27000) && has(r.poly, 1500, 27000), 'front 5000, sides 1500, rear 3000: corners (1500, 5000) (18500, 5000) (18500, 27000) (1500, 27000)', r);
ok(near(S.ringArea(r.poly), 374e6, 1), 'its area: 17 000 x 22 000 = 374 000 000 mm2', S.ringArea(r.poly));
// the same lot drawn clockwise: edge 0 is now west (0,0 → 0,30000), 1 north, 2 east, 3 south. The same distances by edge give the same line.
const CW = [[0, 0], [0, 30000], [20000, 30000], [20000, 0]];
r = S.buildingLine(CW, [1500, 3000, 1500, 5000]);
ok(r.poly && has(r.poly, 1500, 5000) && has(r.poly, 18500, 27000) && near(Math.abs(S.ringArea(r.poly)), 374e6, 1), 'a clockwise outline: each edge keeps its own distance (same line)', r);
ok(S.buildingLine(LOT, [0, 0, 0, 0]).poly.every((p, i) => near(p[0], LOT[i][0]) && near(p[1], LOT[i][1])), 'no setbacks: the building line is the boundary');
// sides of 10 000 + 10 000 on a 20 000 wide lot leave nothing
r = S.buildingLine(LOT, [0, 10000, 0, 10000]);
ok(r.poly === null && r.problem === 'fold', 'side setbacks that meet in the middle: no line, reason fold', r);
ok(S.buildingLine([[0, 0], [1, 1]], [1, 1]).poly === null, 'under three corners: no line');
// a triangle lot with 1000 all round: 3-4-5 triangle scaled (0,0) (40000,0) (0,30000); inradius = (40+30-50)/2 = 10 000, so an
// inset of 1000 scales it about the incentre (10000, 10000) by 0.9: corners (1000,1000) (37000,1000) (1000,28000); area 600e6 x 0.81 = 486e6
r = S.buildingLine([[0, 0], [40000, 0], [0, 30000]], [1000, 1000, 1000]);
ok(r.poly && has(r.poly, 1000, 1000) && has(r.poly, 37000, 1000) && has(r.poly, 1000, 28000) && near(S.ringArea(r.poly), 486e6, 1), 'a 3-4-5 triangle lot, 1000 all round: (1000,1000) (37000,1000) (1000,28000), area 486 000 000', r);
ok(JSON.stringify(S.cleanSetbacks([1, -2, 'x'], 4)) === '[1,0,0,0]', 'cleanSetbacks: negatives and words are 0, a short list is filled');

console.log('== strips and wall footprints');
// a strip 3000 wide on the line (0,0) → (10000,0): y from -1500 to 1500, area 30 000 000
let strip = S.stripPolygon([[0, 0], [10000, 0]], 3000);
ok(strip.length === 4 && has(strip, 0, 1500) && has(strip, 10000, 1500) && has(strip, 10000, -1500) && has(strip, 0, -1500) && near(Math.abs(S.ringArea(strip)), 30e6), 'a straight strip 3000 wide: y from -1500 to 1500, area 30 000 000', strip);
// an L strip 2000 wide: (0,0) → (10000,0) → (10000,10000). Mitred at the corner: left side (0,1000) (9000,1000) (9000,10000),
// right side (0,-1000) (11000,-1000) (11000,10000). Area = two legs of 10 000 x 2000 = 40 000 000 (the mitre neither adds nor loses)
strip = S.stripPolygon([[0, 0], [10000, 0], [10000, 10000]], 2000);
ok(strip.length === 6 && has(strip, 9000, 1000) && has(strip, 11000, -1000) && near(Math.abs(S.ringArea(strip)), 40e6), 'an L strip 2000 wide: inner corner (9000, 1000), outer (11000, -1000), area 40 000 000', strip);
ok(S.stripPolygon([[0, 0]], 100) === null && S.stripPolygon([[0, 0], [1, 0]], 0) === null, 'no strip from one point or no width');
// a wall 200 thick from (0,0) to (5000,0): y from -100 to 100, area 1 000 000
let fp = S.wallFootprint({ a: [0, 0], b: [5000, 0], t: 200 });
ok(fp.length === 4 && has(fp, 0, 100) && has(fp, 5000, -100) && near(Math.abs(S.ringArea(fp)), 1e6), 'a straight wall 200 x 5000: area 1 000 000');
// a half-circle wall: chord (−5000,0) → (5000,0), bulge −1 (clockwise, over the top): radius 5000, centre (0,0), top at (0, 5000).
// Footprint = half ring between radii 4900 and 5100: pi/2 x (5100² − 4900²) = pi x 1 000 000 = 3 141 592.65 (chords: a little under)
fp = S.wallFootprint({ a: [-5000, 0], b: [5000, 0], t: 200, bulge: -1 });
const A = Math.abs(S.ringArea(fp));
ok(A < 3141593 && A > 3141593 * 0.999 && fp.some((p) => near(p[0], 0, 60) && near(p[1], 5100, 1)) && fp.every((p) => p[1] > -1), 'a half-circle wall of radius 5000, 200 thick: area just under pi x 1 000 000, its top at y = 5100', A);
fp = S.wallFootprint({ a: [-5000, 0], b: [5000, 0], t: 200, bulge: 1 });
ok(fp.every((p) => p[1] < 1) && fp.some((p) => near(p[1], -5100, 1)), 'bulge +1 (anticlockwise) goes under the chord: bottom at y = -5100');

console.log('== a wall and a closed building line (the area one may build in)');
const BL = [[1500, 5000], [18500, 5000], [18500, 27000], [1500, 27000]];
const wall = (a, b, t = 200, bulge = 0) => S.wallFootprint({ a, b, t, bulge });
// inside: centre line y = 6000, faces at 5900 and 6100, 900 clear of the line at y = 5000
ok(!S.outsideOf(wall([3000, 6000], [10000, 6000]), BL), 'a wall well inside: no warning');
// touching: centre line y = 5100, outer face exactly on y = 5000
ok(!S.outsideOf(wall([3000, 5100], [10000, 5100]), BL), 'outer face exactly on the line (centre at 5100, 200 thick): touching is allowed');
// 0.5 over (inside the 1 mm tolerance): face at 4999.5
ok(!S.outsideOf(wall([3000, 5099.5], [10000, 5099.5]), BL), 'half a millimetre over: inside the tolerance');
// 2 over: face at 4998
ok(S.outsideOf(wall([3000, 5098], [10000, 5098]), BL), '2 mm over the line: a warning');
// crossing: a wall from (10000, 3000) to (10000, 9000) runs across the front line
ok(S.outsideOf(wall([10000, 3000], [10000, 9000]), BL), 'a wall across the front building line: a warning');
// wholly outside (in the front setback)
ok(S.outsideOf(wall([3000, 2000], [10000, 2000]), BL), 'a wall wholly in front of the line: a warning');
// its end 50 past the east line: from (15000, 10000) to (18550, 10000)
ok(S.outsideOf(wall([15000, 10000], [18550, 10000]), BL), 'a wall whose end runs 50 past the side line: a warning');
ok(!S.outsideOf(wall([15000, 10000], [18500, 10000]), BL), 'the same wall ending on the side line: no warning');
// a concave (L) building area: a wall whose four corners are inside but which bridges the notch
const LSHAPE = [[0, 0], [10000, 0], [10000, 4000], [4000, 4000], [4000, 10000], [0, 10000]];
ok(S.outsideOf([[3000, 6000], [3000, 5800], [8000, 3000], [8000, 3200]], LSHAPE), 'an L-shaped area: a wall cutting across the notch (all four corners inside) still warns');
// a curved wall: half circle of radius 5000 centred (10000, 8000), top at y = 13100 inside; turned down (bulge +1) its bottom is at y = 2900: over the y = 5000 line
ok(!S.outsideOf(wall([5000, 8000], [15000, 8000], 200, -1), BL), 'a curved wall bowing into the area: no warning');
ok(S.outsideOf(wall([5000, 8000], [15000, 8000], 200, 1), BL), 'the same wall bowing out over the front line (its ends are inside): a warning');

console.log('== a wall and an open (drawn) building line');
const OPEN = [[0, 5000], [20000, 5000]];
ok(S.crossesPath(wall([10000, 3000], [10000, 9000]), OPEN), 'a wall across the drawn line: crosses');
ok(!S.crossesPath(wall([3000, 5100], [10000, 5100]), OPEN), 'a wall with its face on the line: touching, no crossing');
ok(!S.crossesPath(wall([3000, 6000], [10000, 6000]), OPEN) && !S.crossesPath(wall([3000, 2000], [10000, 2000]), OPEN), 'a wall on either side of an open line: no crossing (an open line has no inside)');
// the line ends inside the wall
ok(S.crossesPath(wall([10000, 3000], [10000, 9000], 400), [[0, 5000], [10000, 5000]]), 'a line that ends inside the wall: crosses');

console.log('== a wall and a servitude');
// a 3000 wide sewer servitude along x = 16000 (x from 14500 to 17500), the full depth of the lot
const SERV = S.stripPolygon([[16000, 0], [16000, 30000]], 3000);
ok(S.overlaps(wall([10000, 10000], [15000, 10000]), SERV), 'a wall ending 500 inside the servitude (x = 15000, edge at 14500): over it');
ok(!S.overlaps(wall([10000, 10000], [14500, 10000]), SERV), 'a wall ending on the servitude edge: touching, not over it');
ok(!S.overlaps(wall([10000, 10000], [14000, 10000]), SERV), 'a wall ending 500 short: clear');
ok(S.overlaps(wall([12000, 10000], [19000, 10000]), SERV), 'a wall right across the strip: over it');
ok(S.overlaps(wall([16000, 8000], [16000, 12000]), SERV), 'a wall wholly inside the strip: over it');
// face on the long edge: wall along x = 14400, 200 thick: faces 14300 and 14500
ok(!S.overlaps(wall([14400, 8000], [14400, 12000]), SERV), 'a wall alongside with its face on the edge: not over it');
ok(S.overlaps(wall([14402, 8000], [14402, 12000]), SERV), 'the same wall 2 mm in: over it');
// a drawn polygon servitude and a wall that is the same rectangle
ok(S.overlaps([[0, 0], [1000, 0], [1000, 200], [0, 200]], [[0, 0], [1000, 0], [1000, 200], [0, 200]]), 'identical areas overlap');
ok(S.overlaps(wall([13000, 10000], [19000, 10000], 200, -0.4), SERV), 'a curved wall across the strip: over it');

console.log('== checkConstraints');
const found = S.checkConstraints({
  walls: [
    { id: 'in', label: 'W1', poly: wall([3000, 8000], [10000, 8000]) },
    { id: 'front', label: 'W2', poly: wall([10000, 3000], [10000, 9000]) },
    { id: 'serv', label: 'W3', poly: wall([12000, 12000], [16000, 12000]) },
    { id: 'out', label: 'W4', poly: wall([-500, 20000], [5000, 20000]) },
  ],
  boundary: LOT,
  lines: [{ id: 'bl', name: 'Building line', pts: BL, closed: true }],
  servitudes: [{ id: 'sv', name: 'Sewer servitude', kind: 'sewer', poly: SERV }],
});
const key = found.map((f) => f.wall + ':' + f.kind).sort().join(' ');
// W1 nothing; W2 over the building line; W3 over the servitude (inside the building line); W4 from x = -500: over the boundary and the building line
ok(key === 'front:buildingline out:boundary out:buildingline serv:servitude', 'four findings: W2 building line, W3 servitude, W4 boundary and building line; W1 none', key);
ok(found.find((f) => f.wall === 'serv').name === 'Sewer servitude' && found.find((f) => f.wall === 'serv').servitude === 'sewer' && found.find((f) => f.wall === 'front').sub === 'outside', 'a finding names the constraint, its kind and how');
ok(S.checkConstraints({ walls: [{ id: 'x', poly: null }] }).length === 0 && S.checkConstraints().length === 0, 'nothing to check: no findings');

console.log('== mitreInset (CivilCraft calls it)');
const mi = S.mitreInset([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 0, y: 50 }], [10, 5, 10, 5]);
ok(mi.poly && near(mi.poly[0].x, 5) && near(mi.poly[0].y, 10) && near(mi.poly[2].x, 95) && near(mi.poly[2].y, 40), 'a 100 x 50 lot, 10 front and rear, 5 sides: (5, 10) to (95, 40)', mi);
ok(S.mitreInset([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 }], [1, 1, 1]).problem === 'repeat', 'a repeated corner is refused');

console.log(`\n${good} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);

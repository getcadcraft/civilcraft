/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/mep-route tests (0.10 MEP.1): node lib/mep-route/test/test.mjs
 * The router's 0.10 options (per-axis clearance, leads), then a network: an air handler and three diffusers in three rooms
 * behind partitions, under a beam and a slab — boxes only, no app. BimCraft's own test (bin/test-bimcraft.mjs --autoroute)
 * draws the same kind of network as runs and saves it as IFC4.
 */
import { route, legsOf, hitsObstacle } from '../route.js';
import { routeNetwork, sliceLine, lineLength, selfOverlaps } from '../network.js';

let good = 0, bad = 0;
const ok = (c, label, detail = '') => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + label + (!c && detail ? ' (' + detail + ')' : '')); };
const box = (min, max) => ({ min, max });
const axisLegs = (pts) => legsOf(pts).every((l) => ['x', 'y', 'z'].filter((k, i) => Math.abs(l.b[i] - l.a[i]) > 1e-6).length === 1);

console.log('== route.js (0.10 options)');
{
  // a low beam over a straight run: a uniform clearance of 250 cannot pass under it, [250, 250, 150] can
  const beam = box([2000, -2000, 500], [2300, 2000, 1000]), floor = box([-5000, -5000, -200], [9000, 5000, 0]);
  const from = { p: [0, 0, 300], out: [1, 0, 0] }, to = { p: [4500, 0, 300], out: [-1, 0, 0] };
  const tight = route({ from, to, obstacles: [beam, floor], od: 500, clearance: 250 + 25, minLeg: 1050, lead: 550 });
  const fine = route({ from, to, obstacles: [beam, floor], od: 500, clearance: [275, 275, 150], minLeg: 1050, lead: 550 });
  ok(fine.ok && fine.bends === 0, 'per-axis clearance: a 500 × 250 duct goes straight under a beam 500 mm up', JSON.stringify(fine));
  ok(!tight.ok || tight.bends > 0 || tight.points.some((p) => p[2] !== 300), 'with one clearance of 275 all round it cannot take that line');
  ok(fine.ok && !hitsObstacle(fine.points, [beam], 149), 'and its centre line keeps 150 mm from the beam');
  // leads: [from, to]
  const L = route({ from: { p: [0, 0, 0], out: [0, 0, 1] }, to: { p: [3000, 0, 0], out: [0, 0, 1] }, obstacles: [], od: 250, clearance: 150, minLeg: 800, lead: [300, 900] });
  ok(L.ok && L.points[1][2] >= 300 - 1e-6 && L.points[L.points.length - 2][2] >= 900 - 1e-6, 'lead [300, 900]: at least 300 straight out of the start, 900 out of the end', JSON.stringify(L.points));
  ok(L.ok && axisLegs(L.points), 'every leg runs along X, Y or Z');
}

console.log('== sliceLine');
{
  const P = [[0, 0, 0], [1000, 0, 0], [1000, 500, 0]];
  const s = sliceLine(P, 400, 1200);
  ok(s.length === 3 && s[0][0] === 400 && s[1][0] === 1000 && s[2][1] === 200, 'the part between 400 and 1200 mm keeps the corner', JSON.stringify(s));
  ok(lineLength(sliceLine(P, 0, 1500)) === 1500 && sliceLine(P, 0, 1500).length === 3, 'the whole line back');
}

console.log('== selfOverlaps');
ok(!selfOverlaps([[0, 0, 0], [1000, 0, 0], [1000, 1000, 0], [2000, 1000, 0]]), 'a stair-step line does not overlap itself');
ok(selfOverlaps([[0, 0, 0], [0, 1000, 0], [-500, 1000, 0], [-500, 500, 0], [500, 500, 0]]), 'a line crossing its own first leg does');
ok(selfOverlaps([[0, 0, 0], [0, 1000, 0], [500, 1000, 0], [500, 2000, 0], [0, 2000, 0], [0, 200, 0]]), 'a line coming back down its own first leg does');

console.log('== routeNetwork: an air handler, three diffusers in three rooms');
const obstacles = [
  box([0, 0, -200], [14000, 8000, 0]), box([0, 0, 4000], [14000, 8000, 4200]),
  box([-150, -150, 0], [0, 8150, 4200]), box([14000, -150, 0], [14150, 8150, 4200]), box([0, -150, 0], [14000, 0, 4200]), box([0, 8000, 0], [14000, 8150, 4200]),
  box([4950, 0, 0], [5050, 8000, 2600]), box([5000, 3950, 0], [14000, 4050, 2600]), box([9450, 0, 0], [9550, 4000, 2600]),
  { ...box([6000, 0, 3600], [6300, 8000, 4000]), id: 'beam' },
  box([800, 3400, 0], [3250, 4600, 1500]),
];
const ROUND = { shape: 'round', w: 250, h: 250 };
const sizeFor = (q) => (q <= 150 ? ROUND : { shape: 'rect', w: Math.max(250, Math.round(q / 25) * 25), h: 250 });
const terminals = [
  { id: 'D1', p: [7250, 2000, 2575], out: [0, 0, 1], flow: 150, section: ROUND },
  { id: 'D2', p: [11750, 2000, 2575], out: [0, 0, 1], flow: 150, section: ROUND },
  { id: 'D3', p: [9500, 6000, 2575], out: [0, 0, 1], flow: 150, section: ROUND },
];
const src = { p: [3250, 4000, 1325], out: [1, 0, 0], section: { shape: 'rect', w: 450, h: 250 } };
const t0 = Date.now();
const N = routeNetwork({ source: src, terminals, obstacles, sizeFor });
const ms = Date.now() - t0;
ok(N.ok && !N.failed.length, 'every terminal reached (' + ms + ' ms)', JSON.stringify(N.failed));
const mains = N.runs.filter((r) => r.role === 'main'), branches = N.runs.filter((r) => r.role === 'branch');
ok(branches.length === 2 && mains.length >= 2, 'one main in pieces + two branches', N.runs.map((r) => r.role).join(' '));
ok(N.runs.every((r) => axisLegs(r.points)), 'every leg of every run is orthogonal');
ok(!N.clash, 'no centre line comes within its half size + 25 mm of a wall, the beam, the slab or the air handler');
ok(mains[0].start === 'source' && mains[0].section.w === 450 && mains[mains.length - 1].end === 'terminal', 'the main starts at the air handler at its outlet size and ends at a diffuser');
const flows = mains.map((r) => r.flow);
ok(flows[0] === 450 && flows.every((f, i) => !i || f < flows[i - 1]), 'the main carries less after each tee: ' + flows.join(' → '));
ok(mains.every((r, i) => !i || (r.section.w <= mains[i - 1].section.w && (r.section.w !== mains[i - 1].section.w || r.section.shape !== mains[i - 1].section.shape))), 'each new piece is a smaller size (a reducer at each joint): ' + mains.map((r) => r.section.shape + ' ' + r.section.w).join(' → '));
ok(mains.every((r, i) => !i || Math.hypot(...[0, 1, 2].map((k) => r.points[0][k] - mains[i - 1].points[mains[i - 1].points.length - 1][k])) < 1e-6), 'the pieces meet end to end');
/** the main leg a point lies inside (not at its ends), or null */
const hostLeg = (p) => { for (const r of mains) for (const l of legsOf(r.points)) { const ax = 'xyz'.indexOf(l.axis); if ([0, 1, 2].every((k) => (k === ax ? p[k] > Math.min(l.a[k], l.b[k]) + 1 && p[k] < Math.max(l.a[k], l.b[k]) - 1 : Math.abs(p[k] - l.a[k]) < 1e-6))) return l; } return null; };
ok(branches.every((b) => hostLeg(b.points[0])), 'each branch starts inside a straight leg of a main piece (a tee there)');
ok(branches.every((b) => { const h = hostLeg(b.points[0]); return h && legsOf(b.points)[0].axis !== h.axis; }), 'branches leave the main at right angles');
const ends = new Set(N.runs.filter((r) => r.end === 'terminal').map((r) => r.terminal));
ok(ends.size === 3 && [...ends].every((id) => terminals.some((t) => t.id === id)), 'each diffuser is the end of exactly one run');
ok(N.runs.filter((r) => r.end === 'terminal').every((r) => { const t = terminals.find((x) => x.id === r.terminal), q = r.points[r.points.length - 1]; return q.every((v, k) => Math.abs(v - t.p[k]) < 1e-6); }), 'and ends on its neck');
const again = routeNetwork({ source: src, terminals, obstacles, sizeFor });
ok(JSON.stringify(again.runs) === JSON.stringify(N.runs), 'same input → same network');
const blocked = routeNetwork({ source: src, terminals: [...terminals, { id: 'X', p: [6150, 4000, 3800], out: [0, 0, 1], flow: 100 }], obstacles, sizeFor });
ok(blocked.ok && blocked.failed.length === 1 && blocked.failed[0].id === 'X' && blocked.runs.filter((r) => r.end === 'terminal').length === 3, 'a terminal inside the beam is listed as failed; the rest is still made', JSON.stringify(blocked.failed));
console.log((bad ? 'FAILED ' : 'passed ') + good + ' / ' + (good + bad));
process.exit(bad ? 1 : 0);

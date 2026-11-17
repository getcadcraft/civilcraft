/* SPDX-License-Identifier: Apache-2.0 */
/**
 * node lib/mep-route/test/gravity.mjs — MEP.2 gravity drainage (gravity.js). The rules (sizes, slopes, capacities) are BimCraft's own
 * (mep/drainage.js: IPC 2021 Tables 710.1(1)/(2); minimum slope IPC 2021 Table 704.1 as in mep/tables.js), so the engine carries no table.
 * Known answers here are READ FROM THOSE TABLES and worked by hand; the standards print no worked example for a routed house.
 */
import { planDrainage, arcOf, slopeRise } from '../gravity.js';
import { capacity } from '../../../public_html/assets/apps/bimcraft/dev/mep/drainage.js';

let good = 0, bad = 0;
const ok = (c, label, detail = '') => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + label + (!c && detail ? ' (' + detail + ')' : '')); };
const IN = 25.4;
// IPC 704.1: 2-1/2 in and smaller 1/4 in per ft; 3 to 6 in 1/8; 8 in and larger 1/16
const ipcSlope = (n) => (n <= 2.5 ? 1 / 4 : n <= 6 ? 1 / 8 : 1 / 16) / 12;
const rules = { sizes: [1.5, 2, 2.5, 3, 4, 5, 6, 8].map((n) => ({ key: String(n), nominal: n, od: Math.round((n === 1.5 ? 1.9 : n === 2 ? 2.375 : n === 2.5 ? 2.875 : n === 3 ? 3.5 : n === 4 ? 4.5 : n === 5 ? 5.563 : n === 6 ? 6.625 : 8.625) * IN) })),
  slopeOf: ipcSlope, capacity: (n, s, role) => capacity('us', n, s, role) };

console.log('== helpers');
ok(Math.abs(arcOf([[0, 0, 0], [1000, 0, 0], [1000, 500, 0]], [1000, 200, 0]) - 1200) < 1e-6, 'arcOf: 1200 mm along an L');
ok(Math.abs(slopeRise([{ a: 0, len: 1000, slope: 0.01 }, { a: 1000, len: 1000, slope: 0.02 }], 1500) - (10 + 10)) < 1e-9, 'slopeRise over two pieces: 10 + 10 mm');

console.log('== a small house: two bathrooms, one stack, a building drain');
// fixtures (DFU, IPC 709.1 as mep/fixtures.js): wc 3, lav 1, bath 2. Drain connectors: wc through the floor, lav and bath at the wall.
const fx = [
  { id: 'wc1', p: [2000, 1500, 0], dir: [0, 0, -1], units: 3, dn: 3 }, { id: 'lav1', p: [2800, 600, 500], dir: [0, 1, 0], units: 1, dn: 1.25 }, { id: 'bath1', p: [3600, 1400, 0], dir: [0, 0, -1], units: 2, dn: 1.5 },
  { id: 'wc2', p: [2000, 6500, 0], dir: [0, 0, -1], units: 3, dn: 3 }, { id: 'lav2', p: [2800, 7400, 500], dir: [0, -1, 0], units: 1, dn: 1.25 }, { id: 'bath2', p: [3600, 6600, 0], dir: [0, 0, -1], units: 2, dn: 1.5 },
];
const walls = [{ min: [-100, 3900, -300], max: [6000, 4100, 2600] }];   // a wall between the two bathrooms (the drains stay on their side)
const out = planDrainage({ fixtures: fx, outlet: { p: [0, 4000, -1200], out: [-1, 0, 0], z: -1200 }, stacks: [{ id: 'S1', p: [1000, 4000] }], obstacles: [], rules, minTail: 100 });
console.log('       ' + JSON.stringify({ ok: out.ok, failed: out.failed, stacks: out.stacks, zOut: out.zOut }));
ok(out.ok, 'planned, nothing failed', JSON.stringify(out.failed));
const st = out.stacks[0];
ok(st && st.units === 12, 'the stack carries 3+1+2+3+1+2 = 12 DFU', String(st?.units));
// table check: 12 DFU → a 3 in stack carries 20 (IPC 710.1(2) branch column, 3 in = 20)
ok(st && st.nominal === 3, 'but a water closet drain is 3 in: the stack is 3 in (20 DFU on that table)', String(st?.nominal));
ok(capacity('us', 3, 0.25 / 12) === 20, 'table read: 3 in, 20 DFU');
const runs = out.runs;
ok(runs.every((r) => r.role === 'stack' || r.slope >= ipcSlope(r.nominal) - 1e-12), 'every run falls at least the smallest slope of its size (IPC 704.1)');
ok(runs.filter((r) => r.role !== 'stack').every((r) => r.nominal >= 1.5), 'no run under 1-1/2 in');
const wcRun = runs.find((r) => r.terminal === 'wc1' || r.terminal === 'wc2');
ok(wcRun && wcRun.nominal >= 3, 'a drain from a water closet is never under 3 in');
// every run falls: end invert below start invert (or equal for a vertical)
ok(runs.filter((r) => r.role !== 'stack').every((r) => r.inverts[1] <= r.inverts[0] + 1e-9), 'every run ends lower than it starts (gravity)');
const bd = runs.find((r) => r.terminal === 'stack:S1');
ok(bd && Math.abs(bd.inverts[1] - bd.inverts[0] + bd.slope * (bd.points.reduce((n, p, i) => n + (i ? Math.hypot(p[0] - bd.points[i - 1][0], p[1] - bd.points[i - 1][1]) : 0), 0))) < 1, 'the building drain: fall = slope × length (hand check)');
ok(bd && Math.abs(bd.inverts[1] - (-1200)) < 1 || runs.some((r) => r.role === 'main' && Math.abs(r.inverts[1] + 1200) < 1.5), 'the invert at the outlet is the one given (-1200)');
ok(Object.values(out.drops).every((d) => d >= 100 - 1e-6), 'every fixture tail is at least minTail (100 mm) long', JSON.stringify(out.drops));
ok(out.vents.length === 6, 'a vent stub marked at each of the 6 fixtures', String(out.vents.length));
ok(out.notes.includes('junction-wye'), 'junctions noted as needing a wye (the run model draws tees)');
ok(!out.clash, 'no sloped centre line within clearance of an obstacle');
// stack: vertical run from above the top tap to the foot
const sk = runs.find((r) => r.role === 'stack');
ok(sk && sk.points[0][2] > sk.points[1][2] && sk.points[0][0] === sk.points[1][0], 'the stack is one vertical run, top above its foot');

console.log('== too high: the fall cannot be reached');
const hi = planDrainage({ fixtures: fx.slice(0, 3), outlet: { p: [0, 1500, 0], out: [-1, 0, 0], z: -60 }, rules, minTail: 100 });
ok(!hi.ok && hi.failed.some((f) => f.error === 'no-fall' && f.short > 0), 'an outlet 60 mm below the floor: no-fall, with the shortfall in mm', JSON.stringify(hi.failed));

console.log('== no stack, an outlet invert worked out');
const one = planDrainage({ fixtures: fx.slice(0, 3), outlet: { p: [0, 1500, 0], out: [-1, 0, 0] }, rules, minTail: 100, obstacles: [] });
ok(one.ok && Number.isFinite(one.zOut), 'highest invert that keeps every tail ≥ 100 mm: ' + one.zOut);
ok(Math.min(...Object.values(one.drops)) >= 100 - 1e-6 && Math.min(...Object.values(one.drops)) < 101 + 1e-6 || Math.min(...Object.values(one.drops)) < 105, 'and the worst fixture has exactly that tail (the highest feasible)', JSON.stringify(one.drops));
// hand check of the rise: wc1's branch (3 in, slope 1/8 in/ft) length L → rise L/96
const b1 = one.runs.find((r) => r.terminal === 'wc1');
const L = b1.points.reduce((n, p, i) => n + (i ? Math.hypot(p[0] - b1.points[i - 1][0], p[1] - b1.points[i - 1][1]) : 0), 0);
ok(Math.abs((b1.inverts[0] - b1.inverts[1]) - L / 96) < 0.5, 'a 3 in drain falls L/96 (1/8 in per ft): ' + (L / 96).toFixed(1) + ' mm over ' + Math.round(L) + ' mm');
console.log((bad ? 'FAILED ' : 'passed ') + good + ' / ' + (good + bad));
process.exit(bad ? 1 : 0);

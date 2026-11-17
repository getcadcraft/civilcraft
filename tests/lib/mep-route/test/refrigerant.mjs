/* SPDX-License-Identifier: Apache-2.0 */
/** node lib/mep-route/test/refrigerant.mjs — MEP.4 refrigerant pairs (refrigerant.js): geometry, kits, limits. No product data. */
import { planRefrigerant, offsetPath, lateral0 } from '../refrigerant.js';
import { legsOf } from '../route.js';
let good = 0, bad = 0;
const ok = (c, label, detail = '') => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + label + (!c && detail ? ' (' + detail + ')' : '')); };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
console.log('== offsetPath: a pair round corners');
const path = [[0, 0, 0], [2000, 0, 0], [2000, 1500, 0], [2000, 1500, 800]];
const a = offsetPath(path, lateral0(path), 40), b = offsetPath(path, lateral0(path), -40);
ok(a.length === 4 && legsOf(a).every((l) => ['x', 'y', 'z'].filter((k, i) => Math.abs(l.b[i] - l.a[i]) > 1e-6).length === 1), 'both lines stay orthogonal');

const legsGap = legsOf(a).map((l, i) => { const lb = legsOf(b)[i], k = 'xyz'.indexOf(l.axis); return Math.hypot(...[0, 1, 2].filter((q) => q !== k).map((q) => l.a[q] - lb.a[q])); });
ok(legsGap.every((g) => Math.abs(g - 80) < 1e-6), 'perpendicular distance 80 mm on all three legs (parallel, never crossing)', JSON.stringify(legsGap));

console.log('== an outdoor unit and three indoor units');
const od = (k, o) => ({ key: k, od: o });
const rules = { gap: 25, lineSet: (kw) => (kw >= 6 ? { liquid: od('3/8', 9.53), gas: od('5/8', 15.88) } : { liquid: od('1/4', 6.35), gas: od('1/2', 12.7) }) };   // a typed table, not a maker's
const ind = [{ id: 'u1', p: [6000, 1000, 2400], out: [0, 0, 1], capacity: 2.5 }, { id: 'u2', p: [6000, 5000, 2400], out: [0, 0, 1], capacity: 3.5 }, { id: 'u3', p: [11000, 3000, 2400], out: [0, 0, 1], capacity: 2.5 }];
const wall = { min: [4000, 2000, 0], max: [4150, 3000, 2600] };
const r = planRefrigerant({ outdoor: { p: [0, 3000, 300], out: [1, 0, 0], liquid: od('1/4', 6.35), gas: od('5/8', 15.88) }, indoors: ind, obstacles: [wall], rules, limits: { maxTotal: 40000, maxLongest: 30000, maxOutdoorAbove: 15000, maxOutdoorBelow: 15000, maxIndoorIndoor: 5000 } });
console.log('       ' + JSON.stringify({ ok: r.ok, failed: r.failed, lengths: r.lengths && { total: Math.round(r.lengths.total), longest: Math.round(r.lengths.longest) } }));
ok(r.ok && !r.clash, 'routed, nothing over its limits, no clash', JSON.stringify(r.failed));
ok(r.runs.filter((x) => x.line === 'liquid').length === r.runs.filter((x) => x.line === 'gas').length && r.runs.length >= 6, 'liquid and gas lines in pairs (' + r.runs.length + ' runs)');
ok(r.kits.length === 2, 'two branch kits marked (three units: one at the end of the trunk)', String(r.kits.length));
ok(r.runs.filter((x) => x.role === 'trunk').some((x) => x.capacity === 8.5), 'the trunk after the outdoor unit carries 2.5 + 3.5 + 2.5 = 8.5 kW (the typed table gives it the bigger pair)');
ok(r.runs.filter((x) => x.line === 'gas' && x.role === 'trunk')[0].size === '5/8' && r.runs.filter((x) => x.line === 'liquid' && x.role === 'trunk')[0].size === '3/8', 'trunk pair from the person\'s table: gas 5/8, liquid 3/8');
ok(Math.abs(r.heights.u1 - 2100) < 1e-6, 'height of unit 1 above the outdoor unit: 2400 − 300 = 2100 mm');
ok(r.lengths.perUnit.u3 >= 11000, 'the length to unit 3 is at least its straight distance (' + Math.round(r.lengths.perUnit.u3) + ' mm)');
ok(r.checks.length === 1 + 1 + 3 + 3 + 1, 'every limit typed was checked (' + r.checks.length + ' checks)');
const tight = planRefrigerant({ outdoor: { p: [0, 3000, 300], out: [1, 0, 0], liquid: od('1/4', 6.35), gas: od('5/8', 15.88) }, indoors: ind, obstacles: [wall], rules, limits: { maxLongest: 9000, maxIndoorIndoor: 1000 } });
ok(!tight.ok && tight.failed.some((f) => f.error === 'limit-maxLongest' && f.over > 0), 'a longest-run limit of 9 m is exceeded and says by how many mm', JSON.stringify(tight.failed));
const none = planRefrigerant({ outdoor: { p: [0, 3000, 300], out: [1, 0, 0], liquid: od('1/4', 6.35), gas: od('5/8', 15.88) }, indoors: ind, obstacles: [wall], rules });
ok(none.ok && none.notes.includes('limits-not-set') && none.checks.length === 0, 'no limits typed: nothing checked, and it says so');
console.log((bad ? 'FAILED ' : 'passed ') + good + ' / ' + (good + bad));
process.exit(bad ? 1 : 0);

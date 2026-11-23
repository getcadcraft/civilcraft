// SPDX-License-Identifier: Apache-2.0
// lib/landscape: parking street access and other regions. numbers worked by hand. node lib/landscape/test/street.test.mjs
import { streetAccess } from '../street.js';
import { REGIONS, IDS, forUnits } from '../parking-regions.js';
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) pass++; else { fail++; console.log('FAIL ' + m, x !== '' ? JSON.stringify(x).slice(0, 300) : ''); } };
const rect = (x0, y0, x1, y1) => [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];
// one aisle 40 x 6 at y 10..16, stalls on both sides, a street along y = 20 (4 m above the aisle: not within the aisle width 6? yes, 4 <= 6)
const layout = { aisles: [{ poly: rect(0, 10, 40, 16) }], stalls: [{ poly: rect(0, 5, 2.5, 10) }, { poly: rect(0, 16, 2.5, 21) }] };
let r = streetAccess(layout, [[{ x: -10, y: 20 }, { x: 50, y: 20 }]]);
ok(r.ok && r.aisles[0].reaches && r.unreachableStalls === 0 && r.entrances.length === 1, 'an aisle within one aisle width of a street reaches it', r);
r = streetAccess(layout, [[{ x: -10, y: 40 }, { x: 50, y: 40 }]]);
ok(!r.ok && !r.aisles[0].reaches && r.unreachableAisles.length === 1 && r.unreachableStalls === 2, 'a street 24 m away is not reached: the aisle and both stalls are unreachable', r);
// two aisles that touch are one group; the street reaches only the second: both reach
const two = { aisles: [{ poly: rect(0, 10, 40, 16) }, { poly: rect(40, 10, 46, 40) }], stalls: [{ poly: rect(0, 5, 2.5, 10) }] };
r = streetAccess(two, [[{ x: 46, y: 41 }, { x: 60, y: 41 }]]);
ok(r.groups === 1 && r.aisles.every((a) => a.reaches) && r.ok, 'aisles that touch are one group; the street reaches the group through the second', r);
// aisles that do not touch (a 5 m gap) are two groups: only the one by the street reaches
const gap = { aisles: [{ poly: rect(0, 10, 30, 16) }, { poly: rect(35, 10, 46, 40) }], stalls: [{ poly: rect(0, 5, 2.5, 10) }] };
r = streetAccess(gap, [[{ x: 46, y: 41 }, { x: 60, y: 41 }]]);
ok(r.groups === 2 && !r.ok && r.unreachableAisles.join() === '0' && r.unreachableStalls === 1, 'a gap splits the lot: the aisle with stalls does not reach the street', r);
// an unreachable aisle with no stalls beside it does not fail the lot
r = streetAccess({ aisles: [{ poly: rect(0, 0, 10, 4) }, { poly: rect(100, 100, 110, 104) }], stalls: [{ poly: rect(0, 4, 2.5, 9) }] }, [[{ x: 0, y: 6 }, { x: 10, y: 6 }]]);
ok(r.ok && r.unreachableAisles.join() === '1', 'a far aisle nobody parks beside is listed but does not fail the lot', r);
ok(streetAccess({}, []).ok && streetAccess({ aisles: [] }, [[{ x: 0, y: 0 }, { x: 1, y: 1 }]]).ok, 'an empty layout is ok');
ok(!streetAccess(layout, []).ok, 'no streets given: not reached');
ok(!streetAccess(layout, [[{ x: NaN, y: 0 }, { x: 1, y: 1 }]]).ok, 'a street with a bad number is ignored');
// regions
ok(IDS.join() === 'uk,au,eu' && IDS.every((id) => REGIONS[id].read === false && REGIONS[id].accessibleCount === null && REGIONS[id].source.length > 20), 'every other region is marked not read, names its source, and enters no accessible count');
const f = forUnits('au', 'ft');
ok(Math.abs(f.stall.w - 2.4 / 0.3048) < 0.001 && f.read === false && f.units === 'ft' && forUnits('zz') === null && forUnits('uk').stall.l === 4.8, 'units convert, read stays false, unknown is null');
console.log(`landscape street: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);

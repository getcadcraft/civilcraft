#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * typeswap.test.mjs: lib/walls/typeswap.js and lod.js known-answer tests (0.10 BK.7, BK.16; session bk-typeswap-10). Plain rows only; every
 * expected value is worked out in the comment beside it:   node lib/walls/test/typeswap.test.mjs
 */
import { LOD_SCALE, LOD_PROPERTY, isLod, parseLod, lodLabel, lodBand, lodOf, lodChange } from '../lod.js';
import { planSwap, swapChoices, swapLabel, swapReport, reportLines } from '../typeswap.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

console.log('== lod.js: the scale and the tag');
ok(LOD_SCALE.join() === '100,200,300,350,400,500' && LOD_PROPERTY === 'LOD', 'the fixed scale 100, 200, 300, 350, 400, 500; the plain property is named LOD');
ok(isLod(300) && isLod(350) && !isLod(250) && !isLod('300') && !isLod(0) && !isLod(null) && !isLod(undefined), 'isLod: a number of the scale only (250, "300", 0, null are not)');
ok(parseLod(300) === 300 && parseLod('350') === 350 && parseLod('LOD 400') === 400 && parseLod('lod500') === 500 && parseLod('250') === null && parseLod('LOD') === null && parseLod(3) === null, 'parseLod reads 300, "350", "LOD 400", "lod500"; 250 and junk give null');
ok(lodLabel(300) === 'LOD 300' && lodLabel(null) === '' && lodLabel(250) === '', 'lodLabel: "LOD 300"; nothing for a type with no tag');
ok(lodBand(100) === 'generic' && lodBand(200) === 'generic' && lodBand(300) === 'specific' && lodBand(500) === 'specific' && lodBand(undefined) === '', 'a generic type is 100 or 200, a specific build-up 300 and up');
ok(lodOf({ lod: 400 }, { lod: 200 }) === 400 && lodOf({}, { lod: 200 }) === 200 && lodOf({}, {}) === null && lodOf(null, null) === null, 'lodOf: the element\'s own tag, else its type\'s, else none (for BK.13)');
ok(lodChange(200, 300) === 'up' && lodChange(350, 300) === 'down' && lodChange(300, 300) === 'same' && lodChange(null, 300) === 'set' && lodChange(300, undefined) === 'cleared' && lodChange(null, null) === 'none', 'lodChange: up, down, same, set, cleared, none');

console.log('== planSwap: which walls change');
const WALLS = [
  { guid: 'S', typeKey: 'g110', typeName: 'Wall 110 generic', t: 110, a: [0, 0], b: [5000, 0], lod: 200 },
  { guid: 'E', typeKey: 'g110', typeName: 'Wall 110 generic', t: 110, a: [5000, 0], b: [5000, 4000], lod: 200 },
  { guid: 'N', typeKey: 'b230', typeName: '230 clay brick, plastered both sides', t: 260, a: [5000, 4000], b: [0, 4000], lod: 300 },
  { guid: 'W', typeKey: 'plain', typeName: 'Plain wall', t: 100, a: [0, 4000], b: [0, 0] },
];
let p = planSwap(WALLS, ['S', 'N', 'S', 'zz', 'W'], 'b230');
ok(p.change.join() === 'S,W' && p.same.join() === 'N' && p.missing.join() === 'zz', 'S and W change, N already has the type, an unknown id is named missing, a wall asked twice counts once', p);

console.log('== swapChoices: the swap list');
const TYPES = [
  { key: 'g110', name: 'Wall 110 generic', t: 110, lod: 200 },
  { key: 'g230', name: 'Wall 230 generic', t: 230, lod: 200 },
  { key: 'b230', name: '230 clay brick, plastered both sides', t: 260, lod: 300, exterior: true, custom: true },
  { key: 'plain', name: 'Plain wall', t: 100 },
];
let rows = swapChoices(TYPES, WALLS);
ok(rows.length === 4 && rows.map((r) => r.current).join() === '2,0,1,1' && rows[2].tag === 'LOD 300' && rows[3].tag === '' && rows[3].lod === null && rows[2].exterior && rows[2].custom, 'four rows in the order given; 2 picked walls are g110, 1 is b230, 1 has the plain type; the tag reads "LOD 300", a type with no tag has none', rows);
ok(swapLabel(rows[1]) === 'Wall 230 generic [LOD 200]' && swapLabel(rows[2]) === '230 clay brick, plastered both sides [LOD 300]' && swapLabel(rows[3]) === 'Plain wall', 'labels: "Wall 230 generic [LOD 200]", "230 clay brick, plastered both sides [LOD 300]", and no brackets without a tag');
ok(swapChoices(TYPES, WALLS, { query: 'lod 300' }).map((r) => r.key).join() === 'b230' && swapChoices(TYPES, WALLS, { query: 'LOD200' }).length === 2 && swapChoices(TYPES, WALLS, { query: '230' }).map((r) => r.key).join() === 'g230,b230' && swapChoices(TYPES, WALLS, { query: 'generic 110' }).map((r) => r.key).join() === 'g110' && swapChoices(TYPES, WALLS, { query: 'zinc' }).length === 0, 'Find: "lod 300" one row, "LOD200" two, "230" two (by name), "generic 110" one, "zinc" none');

console.log('== swapReport: a partition 110 to 280 on its centre line');
// two rooms 2890 x 3890 and 1890 x 3890 beside a partition at x = 3000; it gets 170 thicker on its centre line, so each face moves 85:
// room 1: 2890 x 3890 = 11 242 100 → 2805 x 3890 = 10 911 450 (-330 650); room 2: 1890 x 3890 = 7 352 100 → 1805 x 3890 = 7 021 450 (-330 650)
const part = { guid: 'P', typeKey: 'g110', typeName: 'Wall 110 generic', t: 110, a: [3000, 0], b: [3000, 4000], lod: 200 };
const before = {
  walls: [...WALLS, part],
  openings: [{ guid: 'd1', kind: 'door', wall: 'S', offset: 1000, width: 900, p: [1450, 0] }, { guid: 'w1', kind: 'window', wall: 'P', offset: 1500, width: 1200, p: [3000, 2100] }],
  rooms: [{ guid: 'r1', number: '101', name: 'Room 1', area: 11242100 }, { guid: 'r2', number: '102', name: 'Room 2', area: 7352100 }, { guid: 'r3', number: '103', name: 'Store', area: 5e6 }],
};
const C280 = { key: 'c280', name: '280 cavity wall', t: 280, lod: 350 };
let after = { walls: [...WALLS, { ...part, typeKey: 'c280', typeName: '280 cavity wall', t: 280, lod: 350 }], openings: before.openings, rooms: [{ ...before.rooms[0], area: 10911450 }, { ...before.rooms[1], area: 7021450 }, before.rooms[2]] };
let r = swapReport(before, after, { guids: ['P'], to: C280 });
ok(!r.nothing && r.walls.asked === 1 && r.walls.changed === 1 && r.walls.thicker === 1 && r.walls.thinner === 0 && r.walls.shifted === 0 && r.walls.followed === 0 && r.walls.from.length === 1 && r.walls.from[0].count === 1 && r.walls.from[0].t === 110 && r.walls.list[0].tTo === 280, 'walls: 1 asked, 1 changed, thicker (110 → 280), its centre line did not move, no other wall followed', r.walls);
ok(r.openings.rehosted === 1 && r.openings.windows === 1 && r.openings.doors === 0 && r.openings.refit === 1 && r.openings.moved === 0 && r.openings.slid === 0 && r.openings.list.length === 1 && r.openings.list[0].guid === 'w1', 'openings: the window of the partition is hosted again in the thicker wall, in the same place; the door of the south wall is not counted', r.openings);
ok(r.rooms.changed === 2 && r.rooms.list.map((x) => x.number).join() === '101,102' && r.rooms.list[0].before === 11242100 && r.rooms.list[0].after === 10911450 && r.rooms.list[0].delta === -330650 && r.rooms.list[1].delta === -330650, 'rooms: 101 11 242 100 → 10 911 450 (-330 650), 102 7 352 100 → 7 021 450 (-330 650); the store is unchanged and not listed', r.rooms);
ok(r.rooms.before === 18594200 && r.rooms.after === 17932900 && r.rooms.delta === -661300 && !r.rooms.lost.length && !r.rooms.made.length, 'together 18 594 200 → 17 932 900 (-661 300)');
ok(r.lod.kind === 'up' && r.lod.to === 350 && r.lod.from.join() === '200' && r.lod.changed === 1 && r.to.name === '280 cavity wall' && r.to.lod === 350, 'LOD 200 → 350: up, 1 wall');
let keys = reportLines(r).map((l) => l.key.replace('typeswap.rep.', ''));
ok(keys.join() === 'walls,thick,lod.up,openings,rooms,room,room', 'the lines: walls, thickness, LOD raised, openings, rooms, one line per room', keys);
let L = reportLines(r);
ok(L[0].fill.n === 1 && L[0].fill.to === '280 cavity wall [LOD 350]' && L[1].fill.fromLen === 110 && L[1].fill.toLen === 280 && L[2].fill.from === 'LOD 200' && L[2].fill.to === 'LOD 350' && L[4].fill.beforeArea === 18594200 && L[4].fill.deltaArea === -661300 && L[5].fill.room === '101 Room 1' && L[5].room === 'r1', 'their fills: the type with its tag, 110 and 280 mm, LOD 200 and LOD 350, the areas in mm2, the room named "101 Room 1"');

console.log('== swapReport: the location line on the outside face, a corner follows, a door moves with its wall');
// S 110 → 230 with its right (outside) face held at y = -55: the centre line goes from y = 0 to y = -55 + 115 = 60, a sideways shift of 60 to its left.
// E and W end on it: their ends follow to y = 60. The door moves 60 with the wall. The room loses (175 - 55) = 120 of depth: 4890 x 3890 = 19 022 100 → 4890 x 3770 = 18 435 300
const b2 = { walls: WALLS.map((w) => ({ ...w })), openings: [{ guid: 'd1', kind: 'door', wall: 'S', offset: 1000, width: 900, p: [1450, 0] }, { guid: 'w2', kind: 'window', wall: 'E', offset: 1000, width: 1200, p: [5000, 1600] }], rooms: [{ guid: 'r1', number: '101', name: 'Room 1', area: 19022100 }] };
const a2 = { walls: [{ ...WALLS[0], typeKey: 'g230', typeName: 'Wall 230 generic', t: 230, a: [0, 60], b: [5000, 60] }, { ...WALLS[1], a: [5000, 60] }, WALLS[2], { ...WALLS[3], b: [0, 60] }],
  openings: [{ guid: 'd1', kind: 'door', wall: 'S', offset: 1000, width: 900, p: [1450, 60] }, { guid: 'w2', kind: 'window', wall: 'E', offset: 940, width: 1200, p: [5000, 1600] }], rooms: [{ guid: 'r1', number: '101', name: 'Room 1', area: 18435300 }] };
r = swapReport(b2, a2, { guids: ['S'], to: TYPES[1] });
ok(r.walls.changed === 1 && r.walls.shifted === 1 && near(r.walls.maxShift, 60) && near(r.walls.list[0].shift, 60) && r.walls.followed === 2, 'the wall moved 60 sideways to keep its location line; 2 joined walls followed', r.walls);
ok(r.openings.rehosted === 1 && r.openings.doors === 1 && r.openings.refit === 1 && r.openings.moved === 1 && near(r.openings.maxMove, 60) && r.openings.slid === 1 && r.openings.list.length === 2 && r.openings.list.find((o) => o.guid === 'w2').move === 0 && near(r.openings.list.find((o) => o.guid === 'w2').slide, -60), 'the door is hosted again and moved 60 with its wall; the window of the east wall kept its place (its offset along the shorter wall is 60 less)', r.openings);
ok(r.rooms.changed === 1 && r.rooms.delta === -586800 && r.lod.kind === 'same', 'the room: 19 022 100 → 18 435 300 (-586 800); LOD unchanged (200 and 200)');
keys = reportLines(r).map((l) => l.key.replace('typeswap.rep.', ''));
ok(keys.join() === 'walls,thick,lod.same,shifted,followed,openings,openmoved,rooms,room', 'the lines add: moved sideways, joined walls followed, doors and windows that changed place', keys);

console.log('== swapReport: mixed walls, thinner, tags set and cleared, rooms lost and made, nothing to do');
r = swapReport({ walls: WALLS, openings: [], rooms: [] }, { walls: WALLS.map((w) => (['S', 'W'].includes(w.guid) ? { ...w, typeKey: 'b230', typeName: TYPES[2].name, t: 260, lod: 300 } : w)), openings: [], rooms: [] }, { guids: ['S', 'N', 'W', 'zz'], to: TYPES[2] });
ok(r.walls.asked === 4 && r.walls.changed === 2 && r.walls.same === 1 && r.walls.missing === 1 && r.walls.thicker === 2 && r.walls.from.length === 2 && r.lod.kind === 'mixed' && r.lod.from.includes(null) && r.lod.from.includes(200) && r.lod.changed === 2, '4 asked: 2 changed (from two types), 1 already that type, 1 missing; the tag was 200 on one and not set on the other: mixed', [r.walls, r.lod]);
keys = reportLines(r).map((l) => l.key.replace('typeswap.rep.', ''));
ok(keys.join() === 'walls,same,thickmixed,lod.mixed,noopenings,norooms' && reportLines(r)[3].fill.from === '200, -' && reportLines(r)[3].fill.to === 'LOD 300', 'lines: walls, left alone, thickness (mixed), LOD (mixed: "200, -" to LOD 300), no door or window, no room', keys);
r = swapReport({ walls: [WALLS[2]], openings: [{ guid: 'd9', kind: 'door', wall: 'N', offset: 0, width: 900, p: [0, 0] }], rooms: [{ guid: 'r1', number: '101', name: 'A', area: 100 }, { guid: 'r2', number: '102', name: 'B', area: 100.5 }] },
  { walls: [{ ...WALLS[2], typeKey: 'plain', typeName: 'Plain wall', t: 100, lod: undefined }], openings: [], rooms: [{ guid: 'r2', number: '102', name: 'B', area: 101 }, { guid: 'r3', number: '103', name: 'C', area: 50 }] }, { guids: ['N'], to: TYPES[3] });
ok(r.walls.thinner === 1 && r.lod.kind === 'cleared' && r.openings.lost === 1 && r.rooms.lost.length === 1 && r.rooms.lost[0].number === '101' && r.rooms.made.length === 1 && r.rooms.made[0].number === '103' && r.rooms.changed === 0, 'thinner; the tag is cleared; a door that is gone is counted lost; room 101 no longer there, 103 new; 102 changed by 0.5 mm2 only: within the 1 mm2 tolerance, not listed', r);
keys = reportLines(r).map((l) => l.key.replace('typeswap.rep.', ''));
ok(keys.join() === 'walls,thick,lod.cleared,openlost,norooms,roomslost,roomsmade', 'lines: lost door, rooms no longer enclosed, new rooms', keys);
r = swapReport({ walls: WALLS, openings: [], rooms: [] }, { walls: WALLS, openings: [], rooms: [] }, { guids: ['N'], to: TYPES[2] });
ok(r.nothing && r.walls.same === 1 && r.walls.changed === 0 && r.lod.kind === 'none' && reportLines(r).length === 1 && reportLines(r)[0].key === 'typeswap.rep.none' && reportLines(null)[0].key === 'typeswap.rep.none', 'a wall that already has the type: nothing changed, one line says so');
r = swapReport({ walls: [WALLS[3]], openings: [], rooms: [] }, { walls: [{ ...WALLS[3], typeKey: 'g110', typeName: TYPES[0].name, t: 110, lod: 200 }], openings: [], rooms: [] }, { guids: ['W'], to: TYPES[0] });
ok(r.lod.kind === 'set' && reportLines(r).find((l) => l.key === 'typeswap.rep.lod.set').fill.to === 'LOD 200', 'a type with no tag to a tagged one: set, "LOD 200"');

console.log('== one copy: the hosts carry byte copies');
{
  const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '../../..');
  for (const app of ['bimcraft', 'cadcraft']) for (const f of ['typeswap.js', 'lod.js']) {
    const copy = path.join(root, 'public_html/assets/apps', app, 'dev/walls', f);
    ok(fs.existsSync(copy) && fs.readFileSync(copy).equals(fs.readFileSync(path.join(here, '..', f))), app + '/dev/walls/' + f + ' is a byte copy of lib/walls/' + f);
  }
  const src = fs.readFileSync(path.join(here, '../typeswap.js'), 'utf8') + fs.readFileSync(path.join(here, '../lod.js'), 'utf8');
  ok(!/document\.|window\.|localStorage/.test(src) && (src.match(/^import .*$/gm) || []).every((l) => /from '\.\/lod\.js'/.test(l)), 'host-free: no DOM, the only import is lod.js');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

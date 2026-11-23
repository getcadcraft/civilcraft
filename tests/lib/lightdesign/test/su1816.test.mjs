#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * su1816.test.mjs — 0.11 SU.1816 (su-finish-11 `site-light`): the CivilCraft host's areas and landscape features (hosts/civil.js siteAreas), the night scene with the
 * model's own surfaces plus only the outline's missing floor or ceiling (view.js nightScene shell object), and the lamp names the BimCraft host writes (renderLamps).
 *   node lib/lightdesign/test/su1816.test.mjs
 */
import { siteAreas } from '../hosts/civil.js';
import { nightScene, modelItem, landscapeLuminaires, renderLamps, genericPhoto, inside } from '../lib/index.js';

let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];

// ---- siteAreas: a lot in feet at survey coordinates, a parcel round it, a paving and a bed; trees and a path
const st = {
  units: 'ft',
  parking: [{ id: 'pk1', name: 'North lot', boundary: rect(2000000, 600000, 200, 100) }],
  parcels: [{ id: 'r1', name: 'Site', pts: rect(1999900, 599900, 500, 400) }],
  landscape: {
    palette: [{ key: 'my-oak', type: 'tree' }, { key: 'acer-campestre', type: 'shrub' }],
    plants: [{ key: 'my-oak', x: 2000050, y: 600050 }, { key: 'acer-campestre', x: 2000060, y: 600050 }, { key: 'quercus-robur', x: 2000150, y: 600020 }, { key: 'my-oak', x: 2000300, y: 600290 }],
    hardscape: [{ kind: 'paving', id: 'h1', name: 'Plaza', pts: rect(2000250, 600250, 60, 40) }, { kind: 'path', id: 'h2', pts: [{ x: 1999950, y: 600070 }, { x: 2000250, y: 600070 }] }, { kind: 'path', id: 'h3', pts: [{ x: 2000350, y: 599950 }, { x: 2000380, y: 599950 }] }],
    beds: [{ id: 'b1', name: 'Bed', pts: rect(2000210, 600010, 20, 20) }],
  },
};
const trees = new Set(['my-oak', 'quercus-robur', 'acer-campestre']);   // the seed says acer is a tree; the project's own list says shrub (the host drops it: tested below as the caller's job)
const A = siteAreas(st, { trees: new Set(['my-oak', 'quercus-robur']) });
ok(A.length === 4 && A[0].kind === 'parcel' && A.map((a) => a.kind).sort().join() === 'bed,lot,parcel,paving', 'four areas, largest first', A.map((a) => a.kind + ' ' + a.area.toFixed(0)));
const lot = A.find((a) => a.kind === 'lot');
ok(Math.abs(lot.area - 200 * 100 * 0.3048 ** 2) < 0.01, 'the lot is 20 000 ft² = ' + lot.area.toFixed(1) + ' m²');
ok(lot.poly[0][0] === 0 && lot.poly[0][1] === 0 && lot.poly[2][0] === 60960 && lot.poly[2][1] === 30480, 'its outline is in millimetres from its own corner', lot.poly);
ok(lot.origin.x === 2000000 && lot.origin.y === 600000 && lot.origin.units === 'ft' && lot.outdoor === true, 'with the origin in project units, outdoors');
ok(lot.features.trees.length === 2 && lot.features.trees.some((q) => q.x === 15240 && q.y === 15240), 'two trees in the lot (the shrub left out), in the same millimetres', lot.features.trees);
ok(lot.features.paths.length === 1 && lot.features.paths[0].pts[0][0] === -15240, 'the path that crosses it, not the one far away', lot.features.paths);
const parcel = A.find((a) => a.kind === 'parcel');
ok(parcel.features.trees.length === 3 && parcel.features.paths.length === 2, 'the parcel holds three trees and both paths', parcel.features);
ok(siteAreas({ units: 'm', parcels: [{ id: 'x', pts: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }] }).length === 0 && siteAreas(null).length === 0, 'a sliver or nothing gives no area');
const M = siteAreas({ units: 'm', parking: [{ id: 'p', boundary: rect(10, 20, 50, 30) }] })[0];
ok(M.poly[2][0] === 50000 && M.poly[2][1] === 30000, 'metres: 50 x 30 m = 50 000 x 30 000 mm');
void trees;

// ---- landscape lights for the lot, kept inside it (what the panel's Landscape layout does)
const L = landscapeLuminaires(lot.features).filter((q) => inside(lot.poly, q.p[0], q.p[1]));
const byKind = L.reduce((m, q) => ((m[q.kind] = (m[q.kind] || 0) + 1), m), {});
ok(byKind.tree === 2 && byKind.path === [...Array(40).keys()].map((i) => -15240 + i * 5000).filter((x) => x > 0 && x < 60960).length, 'two up-lights and a bollard every 5 m along the lot (' + byKind.path + ')', byKind);
ok(L.every((q) => q.photo && q.photo.lumens > 0), 'each with its own generic type');

// ---- the night scene: model surfaces + only the missing floor
const room = { polygon: [[0, 0], [6000, 0], [6000, 4000], [0, 4000]], height: 2800, refl: { ceiling: 0.7, walls: 0.5, floor: 0.2 } };
const wall = modelItem([[[0, 0, 0], [6000, 0, 0], [6000, 0, 2800]], [[0, 0, 0], [6000, 0, 2800], [0, 0, 2800]]], '#c8c0b0', 'y');
const full = nightScene({ room, luminaires: [], axes: 'y', lamps: [] });
const none = nightScene({ room, luminaires: [], axes: 'y', lamps: [], modelItems: [wall], shell: false });
const floorOnly = nightScene({ room, luminaires: [], axes: 'y', lamps: [], modelItems: [wall], shell: { floor: true, ceiling: false, walls: false } });
const fc = nightScene({ room, luminaires: [], axes: 'y', lamps: [], modelItems: [wall], shell: { floor: true, ceiling: true, walls: false } });
ok(full.items.length === 3 && none.items.length === 1 && floorOnly.items.length === 2 && fc.items.length === 3, 'shell: all three, none, the floor only, floor and ceiling', [full.items.length, none.items.length, floorOnly.items.length, fc.items.length]);
ok(floorOnly.items[0].pos.length === full.items[0].pos.length && floorOnly.items[1] === wall, 'the floor is the outline\'s, then the model\'s wall');
ok(Math.abs(none.bounds.max[1] - 2.8) < 1e-9 && Math.abs(none.bounds.min[1]) < 1e-9, 'the bounds come from the model\'s triangles', none.bounds);

// ---- the names the BimCraft host writes on its fixtures: one per light web, the same as the lamps file
const pan = genericPhoto('panel'), down = genericPhoto('downlight');
const lums = [{ photo: pan, p: [1000, 1000, 2800] }, { photo: pan, p: [3000, 1000, 2800] }, { photo: down, p: [5000, 1000, 2800] }];
const rl = renderLamps(lums, { axes: 'y', cct: 3000 });
const names = rl.lamps.map((q) => q.name);
ok(names[0] === names[1] && names[0] !== names[2] && Object.keys(rl.ies).length === 2 && names.every((n) => rl.ies[n] && /^IESNA/.test(rl.ies[n].text)), 'two panels share a web, the downlight has its own; every name has IES text', names);
ok(names.every((n) => n.length <= 80) && JSON.stringify(rl.ies).length < 262144, 'names fit the fixture label (80) and the webs fit Render\'s limit');

console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);

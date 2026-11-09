#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-snap.mjs — CivilCraft 0.9 WB.10 + WB.15 (snap.js), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-snap.mjs [--build dev|x.y]
 *
 * By hand: a PI at (100, 50) is 4.2 px from a pointer at (103, 53) (hit), 9.9 px from (107, 57) (hit) and 11.3 px from (108, 58) (no hit);
 * translating the square (0,0)-(10,10) by (5, -3) gives (5,-3)-(15,7); turning it 90° about (0, 0) gives (0,0) (0,10)... i.e.
 * (10,0) -> (0,10), (10,10) -> (-10,10); 180° about its middle (5,5) maps (0,0) to (10,10); a tangent from (0,0) to (100,0)
 * turned to 90° ends at (0,100) (length 100 kept) and a later PI stays; a zero-length tangent and an out-of-range one are refused;
 * a copy has its own id and name and the original is untouched.
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const { snapTargets, nearestSnap, translate, rotate, bearingBetween, setTangent, copyOf } = await import(pathToFileURL(path.join(APP, 'snap.js')).href);

let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x) : '')); } };
const near = (a, b, e = 1e-9) => Math.abs(a - b) <= e;
const id = (x, y) => ({ x, y });

const state = {
  alignments: [{ id: 'a1', pis: [{ x: 0, y: 0 }, { x: 100, y: 50 }, { x: 200, y: 50 }] }],
  pads: [{ id: 'p1', pts: [id(300, 0), id(320, 0), id(320, 20)] }],
  parcels: [{ id: 'r1', pts: [id(400, 0), id(420, 0), id(420, 30)] }],
  masses: [{ id: 'm1', pts: [id(500, 0), id(510, 0), id(510, 10)] }],
  features: [{ id: 'f1', pts: [{ x: 600, y: 0, z: 1 }, { x: 610, y: 5, z: 2 }] }],
  network: { structures: [{ id: 's1', x: 700, y: 0 }] },
};
const T = snapTargets(state);
ok(T.length === 3 + 3 + 3 + 3 + 2 + 1, 'every drawn vertex is a target (PIs, pad, parcel, mass, feature line, structure)', T.length);
ok(['pi', 'corner', 'vertex', 'structure'].every((k) => T.some((t) => t.kind === k)), 'the kinds are pi, corner, vertex and structure');
const skip = state.alignments[0].pis[1];
ok(snapTargets(state, { skip }).length === T.length - 1 && !snapTargets(state, { skip }).some((t) => t.ref === skip), 'the vertex being dragged is left out');
ok(snapTargets({}).length === 0 && snapTargets(null).length === 0 && snapTargets({ pads: [{ pts: [{ x: NaN, y: 1 }] }] }).length === 0, 'an empty or bad state gives no targets');

const toScreen = (x, y) => ({ x, y });
const hit = nearestSnap(T, toScreen, { x: 103, y: 53 }, 10);
ok(hit && hit.x === 100 && hit.y === 50 && hit.kind === 'pi', 'a pointer 4.2 px from a PI snaps to it', hit);
ok(nearestSnap(T, toScreen, { x: 107, y: 57 }, 10)?.x === 100, 'a pointer 9.9 px away (7, 7) still snaps');
ok(nearestSnap(T, toScreen, { x: 108, y: 58 }, 10) === null, 'a pointer 11.3 px away does not snap');
const two = nearestSnap([{ x: 0, y: 0 }, { x: 6, y: 0 }], toScreen, { x: 4, y: 0 }, 10);
ok(two && two.x === 6, 'the closer of two targets wins');
ok(nearestSnap(T, (x, y) => ({ x: x * 2, y: y * 2 }), { x: 203, y: 103 }, 10)?.x === 100, 'distance is measured on the screen (scale 2)');

const sq = () => [id(0, 0), id(10, 0), id(10, 10), id(0, 10)];
let q = translate(sq(), 5, -3);
ok(q[0].x === 5 && q[0].y === -3 && q[2].x === 15 && q[2].y === 7, 'translate moves every vertex');
q = [{ x: 10, y: 0, b: 0.4 }, id(10, 10)];
rotate(q, 0, 0, Math.PI / 2);
ok(near(q[0].x, 0) && near(q[0].y, 10) && near(q[1].x, -10) && near(q[1].y, 10), 'rotate 90° about the origin: (10,0) → (0,10), (10,10) → (-10,10)', q);
ok(q[0].b === 0.4, 'a curve bulge is kept by a rotation');
q = rotate(sq(), 5, 5, Math.PI);
ok(near(q[0].x, 10) && near(q[0].y, 10) && near(q[2].x, 0) && near(q[2].y, 0), '180° about the middle swaps opposite corners');
q = sq(); rotate(q, 3, 4, 0.7); rotate(q, 3, 4, -0.7);
ok(q.every((p, i) => near(p.x, sq()[i].x, 1e-9) && near(p.y, sq()[i].y, 1e-9)), 'rotating and rotating back gives the same square');
const sideLen = (p) => Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y);
q = sq(); rotate(q, 1, 2, 0.3);
ok(near(sideLen(q), 10, 1e-9), 'rotation keeps lengths');

ok(near(bearingBetween(id(0, 0), id(0, 5)), Math.PI / 2) && near(bearingBetween(id(0, 0), id(-5, 0)), Math.PI), 'bearingBetween is the atan2 direction');

const pis = [id(0, 0), id(100, 0), id(200, 20)];
ok(setTangent(pis, 0, Math.PI / 2) && near(pis[1].x, 0, 1e-9) && near(pis[1].y, 100, 1e-9), 'tangent 1 turned to 90° ends at (0, 100), length 100 kept');
ok(pis[2].x === 200 && pis[2].y === 20 && pis[0].x === 0, 'the other PIs keep their place');
ok(!setTangent([id(1, 1), id(1, 1)], 0, 1) && !setTangent(pis, 2, 1) && !setTangent(pis, -1, 1) && !setTangent(pis, 0, NaN), 'a zero-length tangent, a missing tangent and a bad angle are refused');

const orig = { id: 'a1', name: 'Road', pis: [id(0, 0), id(10, 0)], pvis: [{ sta: 0, z: 1 }] };
const c = copyOf(orig, 'a2', 'Road copy', 5, 5);
ok(c.id === 'a2' && c.name === 'Road copy' && c.pis[0].x === 5 && c.pis[1].y === 5 && c.pvis[0].z === 1, 'a copy is moved and keeps the profile');
ok(orig.id === 'a1' && orig.pis[0].x === 0 && c.pis !== orig.pis, 'the original is untouched and the copy shares nothing');
const pc = copyOf({ id: 'r1', name: 'Lot', pts: [id(0, 0), id(1, 1)] }, 'r2', 'Lot copy', 0, 0);
ok(pc.pts[1].x === 1 && pc.id === 'r2', 'a copy of a pad or parcel works on pts');

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

/* SPDX-License-Identifier: Apache-2.0 */
// scan-progress-test.mjs — EG.39 engine (scan-progress.js): node tools/bimcraft-test/scan-progress-test.mjs
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SP = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/apps/bimcraft/dev/scan-progress.js')).href);
let good = 0, bad = 0;
const ok = (c, m, d = '') => { if (c) good++; else { bad++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
// a room 6 x 4 x 2.7 m scanned from inside: walls are boxes 0.2 thick. Point cloud lies on the inner faces.
const boxes = new Map([
  ['W_south', { min: [0, -0.2, 0], max: [6, 0, 2.7] }], ['W_north', { min: [0, 4, 0], max: [6, 4.2, 2.7] }],
  ['W_west', { min: [-0.2, 0, 0], max: [0, 4, 2.7] }], ['W_east', { min: [6, 0, 0], max: [6.2, 4, 2.7] }],
  ['W_far', { min: [20, 0, 0], max: [26, 0.2, 2.7] }],   // another building the scan never reached
]);
const pts = [];
const wall = (f, n, noise = 0.005) => { for (let i = 0; i < n; i++) pts.push(...f(rnd(), rnd()).map((v) => v + (rnd() - 0.5) * 2 * noise)); };
wall((u, v) => [u * 6, 0, v * 2.7], 6000);      // south inner face y = 0
wall((u, v) => [u * 6, 4, v * 2.7], 6000);      // north inner face y = 4
wall((u, v) => [0, u * 4, v * 2.7], 4000);      // west face x = 0 ... but only the lower 20% of the east wall is built
wall((u, v) => [6, u * 4, v * 0.3], 150);       // east wall: a sliver (a stub) -> partly or missing
const P = new Float32Array(pts);
const n = P.length / 3;
let r = SP.scanProgress({ pos: P, n, boxes, tol: 0.05 });
const st = Object.fromEntries(r.rows.map((x) => [x.key, x]));
ok(r.ok, 'runs');
ok(st.W_south.state === 'built' && st.W_north.state === 'built' && st.W_west.state === 'built', 'three scanned walls are built', JSON.stringify(r.rows.map((x) => [x.key, x.state, x.coverage])));
ok(st.W_east.state !== 'built', 'a wall with only a stub (' + st.W_east.coverage + ') is not built');
ok(st.W_far.state === 'unseen', 'a wall the scan never reached is unseen, not missing');
ok(r.totals.built === 3 && r.totals.unseen === 1 && r.totals.pct === 75, 'totals: 3 built of 4 judged = 75 %', JSON.stringify(r.totals));
ok(st.W_south.dev === 'ok' && Math.abs(st.W_south.mean) < 0.02, 'noise of 5 mm reads within tolerance', String(st.W_south.mean));
// a wall built 0.12 m off its place (the scan sees it shifted)
const pts2 = []; for (let i = 0; i < 4000; i++) pts2.push(rnd() * 6, 0.12 + (rnd() - 0.5) * 0.01, rnd() * 2.7);
r = SP.scanProgress({ pos: new Float32Array(pts2), n: 4000, boxes: new Map([['W_south', boxes.get('W_south')]]), tol: 0.05 });
ok(r.rows[0].state !== 'unseen' && r.rows[0].dev === 'off' || r.rows[0].state === 'missing', 'a wall 12 cm off is flagged off (or not seen as built)', JSON.stringify(r.rows[0]));
// a matrix: cloud in millimetres, y up
const mm = new Float32Array(P.length); for (let i = 0; i < P.length; i++) mm[i] = P[i] * 1000;
const M = [0.001, 0, 0, 0, 0, 0.001, 0, 0, 0, 0, 0.001, 0, 0, 0, 0, 1];
r = SP.scanProgress({ pos: mm, n, matrix: M, boxes, tol: 0.05 });
ok(r.totals.built === 3, 'a matrix carries the cloud into the model space (mm to m)');
// the schedule
const expected = new Map([['W_south', 'built'], ['W_north', 'built'], ['W_west', 'built'], ['W_east', 'built'], ['W_far', 'waiting']]);
r = SP.scanProgress({ pos: P, n, boxes, tol: 0.05, expected });
ok(r.plan.behind === 1 && r.rows.find((x) => x.key === 'W_east').flag === 'behind', 'the east wall is behind the schedule');
ok(r.plan.scheduled === 5 && r.plan.expectedBuilt === 4 && r.plan.pctSeen === 75, 'plan summary', JSON.stringify(r.plan));
const e2 = new Map([['W_south', 'waiting']]);
r = SP.scanProgress({ pos: P, n, boxes, tol: 0.05, expected: e2 });
ok(r.plan.ahead === 1, 'built but not yet scheduled = ahead');
ok(SP.scanProgress({ pos: new Float32Array(0), n: 0, boxes }).reason === 'nopoints' && SP.scanProgress({ pos: P, n, boxes: new Map() }).reason === 'noboxes', 'empty inputs answer with a reason');
const csv = SP.progressCsv(r, new Map([['W_south', '=cmd()']]));
ok(/"'=cmd\(\)"/.test(csv) && csv.split('\r\n').length === 7, 'CSV guards formula cells');
console.log(`\nscan-progress: ${good} ok, ${bad} failed`); process.exit(bad ? 1 : 0);

#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-open11.mjs — CivilCraft 0.11 PERF.33 in Node: open-async.js (buildSurfaceAsync on this thread gives exactly buildSurface; primeSurface
 * hands a built surface to p.eg() so nothing is built twice and only the plain case is taken) and the 2,000,000-point cap (Project.fromJSON says how many
 * points it left out, apart from points it could not read).  The Worker itself is exercised in the real page: tools/civilcraft-test/browser-open11.mjs.
 *   node bin/test-civilcraft-open11.mjs [--build dev]
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
(await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const { buildSurface } = await import(pathToFileURL(path.join(APP, 'tin.js')).href);
const { buildSurfaceAsync, primeSurface, ASYNC_FROM, openWorkerState } = await import(pathToFileURL(path.join(APP, 'open-async.js')).href);
const { Project, MAX_POINTS } = await import(pathToFileURL(path.join(APP, 'project.js')).href);
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 200)); } };

let seed = 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const pts = (n) => Array.from({ length: n }, (_, i) => { const x = 1000 + rnd() * 400, y = 2000 + rnd() * 300; return { n: String(i + 1), x, y, z: 50 + Math.sin(x / 40) * 5 + y / 100, d: '' }; });
const same = (a, b) => a.surface.nT === b.surface.nT && a.surface.ox === b.surface.ox && a.surface.oy === b.surface.oy
  && Buffer.from(a.surface.tris.buffer).equals(Buffer.from(b.surface.tris.buffer)) && Buffer.from(a.surface.Z.buffer).equals(Buffer.from(b.surface.Z.buffer))
  && JSON.stringify(a.surface.constrainedEdges) === JSON.stringify(b.surface.constrainedEdges) && JSON.stringify(a.report) === JSON.stringify(b.report);

// ---- buildSurfaceAsync on this thread is buildSurface
const P = pts(3000), BL = [{ name: 'ridge', pts: [{ x: 1050, y: 2050, z: 60 }, { x: 1300, y: 2200, z: 62 }] }];
const a = await buildSurfaceAsync({ points: P, breaklines: BL, boundary: null, maxEdge: 0 }, { worker: false }), b = buildSurface({ points: P, breaklines: BL, boundary: null, maxEdge: 0 });
ok(a.surface && same(a, b), 'buildSurfaceAsync (no worker) equals buildSurface with a breakline');
ok(openWorkerState() === 'main', 'no Worker in Node: the state says main');
const bnd = [{ x: 1100, y: 2050 }, { x: 1350, y: 2050 }, { x: 1350, y: 2250 }, { x: 1100, y: 2250 }];
ok(same(await buildSurfaceAsync({ points: P, boundary: bnd, maxEdge: 60 }, { worker: false }), buildSurface({ points: P, boundary: bnd, maxEdge: 60 })), 'a boundary and a longest edge give the same surface');
const bad = await buildSurfaceAsync({ points: P.slice(0, 2) }, { worker: false });
ok(bad.surface === null && bad.report.errors.length === 1, 'two points: no surface, one error', bad.report);

// ---- primeSurface
const mk = (n, edit) => { const p = new Project(); p.setPoints(pts(n), 'x.csv'); if (edit) edit(p); return p; };
const p1 = mk(600);
ok(await primeSurface(p1, { minPoints: 100 }) === true, 'primeSurface takes a plain project at or past minPoints');
const eg1 = p1.eg();
ok(eg1.surface && p1.cache.get('eg').value === eg1, 'p.eg() answers with the primed surface');
const ref = buildSurface({ points: p1.egPoints(), breaklines: p1.egBreaklines(), boundary: null, maxEdge: 0 });
ok(same(eg1, ref), 'the primed surface is the one p.eg() would have built');
ok(await primeSurface(mk(50), { minPoints: 100 }) === false, 'a small project is left to p.eg()');
ok(await primeSurface(mk(600, (p) => { p.state.surface.method = 'idw'; }), { minPoints: 100 }) === false, 'a gridding method is left to p.eg()');
ok(await primeSurface(mk(600, (p) => { p.state.surface.tin = { pts: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }], faces: [[0, 1, 2]] }; }), { minPoints: 100 }) === false, 'a TIN read from a file is left alone');
ok(await primeSurface(mk(600, (p) => { p.state.surface.flatFix = 1; }), { minPoints: 100 }) === false, 'a flat fix is left to p.eg()');
ok(ASYNC_FROM === 20000, 'ASYNC_FROM is 20,000');

// ---- the point cap
ok(MAX_POINTS === 2e6, 'the cap is 2,000,000 (perf-finish-11 civil: the size Save and autosave are proven at)');
const file = (n, extra = []) => ({ format: 'civilcraft-project', version: 1, name: 'cap', units: 'm', points: Array.from({ length: n }, (_, i) => [String(i), i, i * 2, 1, '']).concat(extra) });
const small = Project.fromJSON(file(10, [['bad']]));
ok(small.project.points.length === 10 && small.notes.length === 1 && /could not be read/.test(small.notes[0]), 'an unreadable row is still "could not be read"', small.notes);
const big = Project.fromJSON({ ...file(5), points: new Proxy(file(5).points, {}) });
ok(big.notes.length === 0, 'five points: no note');
// 16,000,007 rows are too many arrays for a Node test: the open Worker's rows stand in (pre = { table, total }, what files-ui hands fromJSON)
const { PointTable } = await import(pathToFileURL(path.join(APP, 'point-table.js')).href);
const capped = PointTable.from(Array.from({ length: 50 }, (_, i) => ({ n: String(i), x: i, y: i * 2, z: 1, d: '' })));
const r = Project.fromJSON({ ...file(0), points: undefined }, { table: capped, total: 50 });
ok(r.notes.length === 0, 'rows as many as the file had: no note', r.notes);
const r2 = Project.fromJSON({ ...file(0), points: undefined }, { table: PointTable.from([]), total: MAX_POINTS + 7 });
ok(r2.notes.length === 2 && /7 points past the limit of 2,000,000/.test(r2.notes[0]), 'past the cap: the note says how many were left out (and the rows that did not come, as could not be read)', r2.notes);
const r3 = Project.fromJSON(file(2e6 + 7));
ok(r3.project.points.length === 2e6 && r3.notes.length === 1 && /7 points past the limit of 2,000,000/.test(r3.notes[0]), 'a file of 2,000,007 points opens with 2,000,000 and says 7 were left out', [r3.project.points.length, r3.notes]);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

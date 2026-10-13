#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-undo.mjs — CivilCraft 0.4 V9: replacing the surface's TIN is an undo step (project.setTin), DOM-free, in
 * Node: a grid surface over a point surface, undo / redo, the coordinate system set in the same step, mixed with point and
 * state steps, "rebuild the surface from the points" undone, the TIN never put into the JSON snapshots.
 *
 *   node bin/test-civilcraft-undo.mjs [--build dev|x.y] [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
// The build's language file: DOM-free modules speak through t() (docs/LANG.md); a build without one keeps its English.
if (fs.existsSync(path.join(APP, 'lang/en.json'))) (await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const PJ = await mod('project.js');
const PTS = await mod('points.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
console.log('\n== replacing the surface is an undo step');
const p = new PJ.Project();
p.setPoints(PTS.parsePoints(fs.readFileSync(path.join(REPO, 'tools/civilcraft-test/site-topo.csv'), 'utf8')).points, 'site');
const b = p.eg().surface.bounds, nT0 = p.eg().surface.nT, z0 = p.eg().surface.elevationAt((b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2);
// a 3 × 3 grid surface over the site at a constant 500
const pts = [], faces = [];
for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) pts.push({ x: b.minX + ((b.maxX - b.minX) * i) / 2, y: b.minY + ((b.maxY - b.minY) * j) / 2, z: 500 });
for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { const a = j * 3 + i; faces.push([a, a + 1, a + 4], [a, a + 4, a + 3]); }
const steps = p.undoStack.length;
p.setTin('Surface from dem.tif', { pts, faces, from: 'grid' }, (s) => { s.name = 'From the grid'; });
ok(p.undoStack.length === steps + 1 && p.eg().surface.nT === 8 && p.eg().surface.elevationAt((b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2) === 500 && p.state.name === 'From the grid', 'the grid surface replaces the point surface, with the name, in one step');
ok(!JSON.stringify(p.undoStack.at(-1).json).includes('"faces"'), 'the replaced TIN is kept beside the snapshot, not in it');
p.change('Rename', (s) => { s.surface.name = 'EG 2'; });
p.undo();
ok(p.state.surface.tin?.from === 'grid', 'undoing a later step leaves the grid surface');
p.undo();
ok(p.state.surface.tin === null && p.eg().surface.nT === nT0 && p.eg().surface.elevationAt((b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2) === z0 && p.state.name !== 'From the grid', 'undo: the point surface is back (same triangles, same elevations) and the name');
p.redo();
ok(p.state.surface.tin?.faces.length === 8 && p.eg().surface.nT === 8, 'redo: the grid surface again');
p.redo();
ok(p.state.surface.name === 'EG 2' && p.state.surface.tin?.from === 'grid', 'redo the later step: both');
// rebuild from the points, undone
p.setTin('Rebuild the surface from the points', null);
ok(p.state.surface.tin === null && p.eg().surface.nT === nT0, 'rebuild from the points');
p.undo();
ok(p.state.surface.tin?.from === 'grid' && p.eg().surface.nT === 8, 'undo: the grid surface is back');
// a point step after it keeps both working
p.editPoints('Delete one', (all) => all.slice(1));
p.undo(); p.undo();
ok(p.points.length === 276 && p.state.surface.tin?.from === 'grid', 'a point step and the TIN step undo in order');
const json = JSON.parse(JSON.stringify(p.toJSON()));
ok(json.surface.tin?.faces?.length === 8, 'the project file carries the grid surface as before');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

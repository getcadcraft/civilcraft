#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-points.mjs — CivilCraft 0.4 V2: editing one survey point at a time (point-edit.js), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-points.mjs [--build dev|x.y] [--verbose]
 *
 * Every field (number, easting, northing, elevation, description) as typed text and as numbers; refusals (empty or
 * taken number, junk, huge values, long descriptions, control characters); one undo step per edit that rebuilds the
 * surface; drawn breaklines through the point follow it; a description change regroups the point; a LandXML TIN keeps
 * its triangles (said); the project file round trip.
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
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const PE = await mod('point-edit.js');
const PJ = await mod('project.js');
const PTS = await mod('points.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const section = (s) => console.log('\n== ' + s);

const csv = fs.readFileSync(path.join(REPO, 'tools/civilcraft-test/site-topo.csv'), 'utf8');
const fresh = () => { const p = new PJ.Project(); p.setPoints(PTS.parsePoints(csv).points, 'site-topo.csv'); return p; };

section('checkPointEdit: values and refusals');
{
  const p = fresh(), pts = p.points, a = pts[10], b = pts[11];
  let r = PE.checkPointEdit(pts, a.n, { x: '1,234.5', y: String(a.y), z: ' 101.25 ' });
  ok(r.ok && r.point.x === 1234.5 && r.point.z === 101.25 && r.point !== a && a.x !== 1234.5, 'typed text with a thousands comma and spaces; a new object, the old untouched');
  r = PE.checkPointEdit(pts, a.n, { z: '' });
  ok(r.ok && r.point.z === null, 'an empty elevation = none');
  r = PE.checkPointEdit(pts, a.n, { z: null });
  ok(r.ok && r.point.z === null, 'null elevation = none');
  r = PE.checkPointEdit(pts, a.n, { n: b.n });
  ok(!r.ok && /already exists/.test(r.errors.n), 'a taken number is refused');
  r = PE.checkPointEdit(pts, a.n, { n: '   ' });
  ok(!r.ok && r.errors.n, 'an empty number is refused');
  r = PE.checkPointEdit(pts, a.n, { n: 'x'.repeat(41) });
  ok(!r.ok && r.errors.n, 'a 41-character number is refused');
  r = PE.checkPointEdit(pts, a.n, { n: ' CP-1\u0007 ' });
  ok(r.ok && r.point.n === 'CP-1', 'a name with control characters and spaces is cleaned');
  for (const bad of ['abc', '1e10', 'NaN', 'Infinity', '12..3', '--1', {}, []]) {
    const q = PE.checkPointEdit(pts, a.n, { x: bad });
    ok(!q.ok && q.errors.x, 'easting ' + JSON.stringify(bad) + ' refused');
  }
  ok(!PE.checkPointEdit(pts, a.n, { z: '2e6' }).ok, 'an elevation of 2,000,000 refused');
  ok(PE.checkPointEdit(pts, a.n, { y: -5e8 }).ok, 'a negative coordinate is fine');
  ok(!PE.checkPointEdit(pts, a.n, { d: 'x'.repeat(201) }).ok, 'a 201-character description refused');
  r = PE.checkPointEdit(pts, a.n, { d: 'EP\tedge\n' });
  ok(r.ok && r.point.d === 'EP edge', 'tabs and newlines in a description become spaces');
  r = PE.checkPointEdit(pts, a.n, { x: a.x, d: a.d });
  ok(!r.ok && !Object.keys(r.errors).length, 'no change → nothing to do, no error');
  ok(!PE.checkPointEdit(pts, 'no-such-point', { x: 1 }).ok, 'an unknown point is refused');
  r = PE.checkPointEdit(pts, a.n, { x: 'oops', z: 'bad' });
  ok(!r.ok && r.errors.x && r.errors.z, 'every bad field is reported');
}

section('editPoint: one undo step, the surface follows');
{
  const p = fresh();
  const a = p.points.find((q) => q.z !== null && p.eg().surface?.elevationAt(q.x, q.y) != null);
  const steps = p.undoStack.length, z0 = a.z, v0 = p.pointsVersion;
  let r = PE.editPoint(p, a.n, { z: z0 + 10 });
  ok(r.ok && p.undoStack.length === steps + 1 && p.pointsVersion === v0 + 1, 'one undo step');
  const at = p.eg().surface.elevationAt(a.x, a.y);
  ok(Math.abs(at - (z0 + 10)) < 1e-9, 'the surface rebuilds through the new elevation (' + at + ')');
  ok(p.undo() && p.points.find((q) => q.n === a.n).z === z0 && Math.abs(p.eg().surface.elevationAt(a.x, a.y) - z0) < 1e-9, 'undo puts the elevation and the surface back');
  ok(p.redo() && p.points.find((q) => q.n === a.n).z === z0 + 10, 'redo');
  p.undo();
  r = PE.movePoint(p, a.n, a.x + 3, a.y - 4);
  const moved = p.points.find((q) => q.n === a.n);
  ok(r.ok && moved.x === a.x + 3 && moved.y === a.y - 4 && moved.z === z0, 'movePoint moves x, y and keeps z');
  ok(p.undoStack.at(-1).label === 'Move point ' + a.n, 'its undo label says Move point');
  p.undo();
  // renumber, then the group from a new description
  const free = 'S-' + Date.now();
  r = PE.editPoint(p, a.n, { n: free });
  ok(r.ok && p.points.some((q) => q.n === free) && !p.points.some((q) => q.n === a.n) && /now point/.test(r.message), 'renumbered, said');
  p.undo();
  r = PE.editPoint(p, a.n, { d: 'NEWCODE spot' });
  ok(r.ok && p.state.surface.groups.NEWCODE === 'points', 'a new description code makes a point group in the same step');
  p.undo();
  ok(!('NEWCODE' in p.state.surface.groups) || p.state.surface.groups.NEWCODE === undefined, 'undo takes the new group away too');
  ok(p.points.length === PTS.parsePoints(csv).points.length, 'no point lost or doubled through all of that');
}

section('drawn breaklines through the point follow it');
{
  const p = fresh();
  const [a, b, c] = p.points.filter((q) => q.z !== null).slice(0, 3);
  p.change('Draw breakline', (s) => s.surface.breaklines.push({ name: 'Breakline 1', pts: [a, b, c].map((q) => ({ x: q.x, y: q.y, z: q.z })) }));
  let r = PE.editPoint(p, b.n, { x: b.x + 1, z: b.z + 2 });
  const v = p.state.surface.breaklines[0].pts[1];
  ok(r.ok && r.followed === 1 && v.x === b.x + 1 && v.z === b.z + 2, 'the vertex moved and took the new elevation');
  ok(/1 drawn breakline vertex/.test(r.message), 'said: ' + r.message);
  ok(p.state.surface.breaklines[0].pts[0].x === a.x && p.state.surface.breaklines[0].pts[2].x === c.x, 'the other vertices stay');
  p.undo();
  ok(p.state.surface.breaklines[0].pts[1].x === b.x && p.points.find((q) => q.n === b.n).x === b.x, 'one undo puts the point and the vertex back');
  r = PE.editPoint(p, b.n, { x: b.x + 1, z: '' });
  ok(r.ok && p.state.surface.breaklines[0].pts[1].z === b.z && /old elevation/.test(r.message), 'a point losing its elevation leaves the vertex z, said');
  p.undo();
  r = PE.editPoint(p, b.n, { d: 'renamed' });
  ok(r.ok && r.followed === 0, 'a description change moves no vertex');
}

section('LandXML TIN projects and the project file');
{
  const p = fresh();
  p.state.surface.tin = { faces: [], pts: [] };
  const a = p.points[0];
  const r = PE.editPoint(p, a.n, { z: 1 });
  ok(r.ok && /LandXML/.test(r.message), 'a TIN project says the surface changes only after rebuilding');
  p.state.surface.tin = null;
  const q = fresh();
  PE.editPoint(q, q.points[5].n, { n: 'CTRL 5', x: 100, y: 200, z: 3.5, d: 'CP control' });
  const back = PJ.Project.fromJSON(JSON.parse(JSON.stringify(q.toJSON())));
  const bp = (back.project || back).points.find((x) => x.n === 'CTRL 5');
  ok(bp && bp.x === 100 && bp.y === 200 && bp.z === 3.5 && bp.d === 'CP control', 'an edited point survives the project file');
}

section('Lasso selection of survey points (0.4 W2.7, lasso-core.js)');
{
  const P = [{ n: '1', x: 0, y: 0 }, { n: '2', x: 10, y: 0 }, { n: '3', x: 10, y: 10 }, { n: '4', x: 30, y: 30 }, { n: '5', x: 20, y: 5 }];
  // an L-shaped lasso round 1, 2 and 3 (5 sits in the notch, 4 far away): a box round the same points would take 5 too
  const L = [{ x: -2, y: -2 }, { x: 12, y: -2 }, { x: 12, y: 12 }, { x: 8, y: 12 }, { x: 8, y: 2 }, { x: -2, y: 2 }];
  const ns = (a) => a.map((p) => p.n).join(',');
  ok(ns(PTS.lassoPoints(P, L, 'window', 0.1)) === '1,2,3', 'a window lasso takes the points inside its outline only (' + ns(PTS.lassoPoints(P, L, 'window', 0.1)) + ')');
  ok(ns(PTS.lassoPoints(P, L, 'crossing', 0.1)) === '1,2,3', 'a crossing lasso takes the same (a point is inside or not)');
  const edge = [{ x: -2, y: -2 }, { x: 10.05, y: -2 }, { x: 10.05, y: 2 }, { x: -2, y: 2 }];
  ok(ns(PTS.lassoPoints(P, edge, 'window', 0.1)) === '1' && ns(PTS.lassoPoints(P, edge, 'crossing', 0.1)) === '1,2', 'a point on the outline (within the pick size) is taken by a crossing lasso, not a window');
  const fence = [{ x: -5, y: 0.05 }, { x: 10.05, y: 0.05 }, { x: 10.05, y: 10.5 }];
  ok(ns(PTS.lassoPoints(P, fence, 'fence', 0.1)) === '1,2,3', 'a fence takes the points its path passes over (' + ns(PTS.lassoPoints(P, fence, 'fence', 0.1)) + ')');
  ok(PTS.lassoPoints(P, fence, 'fence', 0.01).length === 0, '… within the pick size only');
  ok(PTS.lassoPoints(P, [{ x: 0, y: 0 }, { x: 1, y: 1 }], 'window', 0.1).length === 0, 'a two-point lasso has no inside');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-agent.mjs — CivilCraft 0.4 X.12: the live tools for AI assistants (civil-agent.js) through host.js's
 * dispatcher (createDispatcher, the same code the page uses), DOM-free, in Node, on the sample site (site-topo.csv) with an
 * alignment drawn across it.
 *
 *   node bin/test-civilcraft-agent.mjs [--build dev|x.y] [--verbose]
 *
 * Permissions (read lists four tools, edit adds points_select; refused calls change nothing), site_describe, points_list
 * (groups, text, box, paging, the schema's limit), surface_elevation (eg; off the surface = null; no graded surface = an
 * error result), alignment_station (points → station/offset and back, both ends, the only alignment by default, a wrong
 * name), points_select (numbers, a group, unknown numbers refused), and no answer ever throws.
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
const PJ = await mod('project.js');
const PTS = await mod('points.js');
const AG = await mod('civil-agent.js');
const { createDispatcher } = await mod('host.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const section = (s) => console.log('\n== ' + s);

const csv = fs.readFileSync(path.join(REPO, 'tools/civilcraft-test/site-topo.csv'), 'utf8');
const p = new PJ.Project();
p.setPoints(PTS.parsePoints(csv).points, 'site-topo.csv');
p.state.name = 'Sample site';
const xs = p.points.map((q) => q.x), ys = p.points.map((q) => q.y);
const box = { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
const mid = { x: (box.minX + box.maxX) / 2, y: (box.minY + box.maxY) / 2 };
// a straight alignment across the site, west to east through the middle, starting at station 1000
p.state.alignments.push({ id: 'a1', name: 'Main Street', start: 1000, pis: [{ x: box.minX + 10, y: mid.y }, { x: box.maxX - 10, y: mid.y }], pvis: [] });

let picked = new Set();
const app = {
  project: () => p,
  select: (nums, mode) => { if (mode === 'replace') picked = new Set(nums); else for (const n of nums) mode === 'add' ? picked.add(n) : picked.delete(n); return picked.size; },
};
let allowed = ['read'];
const d = createDispatcher({ server: { name: 'civilcraft', title: 'CivilCraft', version: 'test' }, allowed: () => allowed });
for (const def of AG.civilTools(app)) d.tool(def);
const call = async (name, a) => { const r = await d.call(name, a); return { r, v: r.structuredContent, text: r.content?.[0]?.text || '' }; };

section('the tools and their permissions');
ok(d.list().map((t) => t.name).join() === 'site_describe,points_list,surface_elevation,alignment_station', 'read: site_describe, points_list, surface_elevation, alignment_station');
allowed = ['read', 'edit'];
ok(d.list().length === 5 && d.list().at(-1).name === 'points_select', 'edit adds points_select');
allowed = ['read'];
let x = await call('points_select', { group: 'TREE' });
ok(x.r.isError && /edit permission/.test(x.text) && picked.size === 0, 'points_select is refused without edit, nothing selected');

section('site_describe');
x = await call('site_describe', {});
ok(x.v.name === 'Sample site' && x.v.points.count === 276 && x.v.points.withElevation === 276, 'name, 276 points, all with elevations');
ok(x.v.points.groups.find((g) => g.group === 'GRD')?.count === 201 && x.v.points.groups.find((g) => g.group === 'TREE')?.count === 4, 'groups: GRD 201, TREE 4 (as the Points panel)');
const al = x.v.alignments[0];
ok(al.name === 'Main Street' && al.ok && al.start === 1000 && Math.abs(al.end - al.start - al.length) < 1e-6 && al.length > 0, 'the alignment: start 1000, end = start + length (' + al.length + ')');
ok(x.v.surfaces.existingGround?.triangles > 400 && x.v.surfaces.existingGround.minZ < x.v.surfaces.existingGround.maxZ && x.v.surfaces.graded === null, 'existing ground: ' + x.v.surfaces.existingGround?.triangles + ' triangles, z ' + x.v.surfaces.existingGround?.minZ + '–' + x.v.surfaces.existingGround?.maxZ + '; no graded surface');

section('points_list');
x = await call('points_list', { group: 'tree' });
ok(x.v.total === 4 && x.v.points.every((q) => /^TREE/i.test(q.d)), 'a group, any case: the 4 trees');
x = await call('points_list', { description: 'ridge' });
ok(x.v.total === 14, 'description contains "ridge": 14');
const half = { minX: box.minX, minY: box.minY, maxX: mid.x, maxY: box.maxY };
x = await call('points_list', { within: half, limit: 1000 });
ok(x.v.total > 50 && x.v.total < 276 && x.v.points.every((q) => q.x <= mid.x), 'a box: the west half (' + x.v.total + ')');
x = await call('points_list', { offset: 270, limit: 10 });
ok(x.v.total === 276 && x.v.points.length === 6 && x.v.offset === 270, 'paged: offset 270 gives the last 6');
x = await call('points_list', { limit: 5000 });
ok(x.r.isError && /Invalid arguments/.test(x.text), 'a limit over 1000 is refused by the schema');

section('surface_elevation');
const q0 = p.points[100];
x = await call('surface_elevation', { points: [{ x: q0.x, y: q0.y }, { x: box.maxX + 1000, y: box.maxY + 1000 }] });
ok(Math.abs(x.v.points[0].z - q0.z) < 1e-6 && x.v.points[1].z === null, 'at a survey point: its own elevation (' + x.v.points[0].z + '); far outside: null');
x = await call('surface_elevation', { points: [mid], surface: 'graded' });
ok(x.r.isError && /no graded surface/.test(x.text), 'no graded surface: an error result that says so');

section('alignment_station');
x = await call('alignment_station', { points: [{ x: box.minX + 10, y: mid.y + 5 }, { x: mid.x, y: mid.y - 3 }] });
ok(Math.abs(x.v.points[0].station - 1000) < 1e-6 && Math.abs(x.v.points[0].offset + 5) < 1e-6, 'a point 5 north of the start, going east: station 1000, offset −5 (left)');
ok(Math.abs(x.v.points[1].station - (1000 + (mid.x - box.minX - 10))) < 1e-6 && Math.abs(x.v.points[1].offset - 3) < 1e-6 && !x.v.points[1].outside, '3 south of the middle: offset +3 (right), inside');
x = await call('alignment_station', { alignment: 'main street', stations: [1000, al.end, al.end + 50] });
ok(Math.abs(x.v.stations[0].x - (box.minX + 10)) < 1e-6 && Math.abs(x.v.stations[0].direction - 90) < 1e-6 && x.v.stations[0].ground !== null, 'station 1000: the first PI, direction 90° (east), ground ' + x.v.stations[0].ground);
ok(Math.abs(x.v.stations[1].x - (box.maxX - 10)) < 1e-6 && x.v.stations[2].outside === true, 'the end station is the last PI; beyond it: outside');
x = await call('alignment_station', { alignment: 'Side Road', stations: [1000] });
ok(x.r.isError && /No alignment "Side Road".*Main Street/.test(x.text), 'a wrong name: an error that lists the alignments');
x = await call('alignment_station', {});
ok(x.r.isError && /Give points/.test(x.text), 'no points and no stations: says what to give');

section('points_select (edit: the selection only)');
allowed = ['read', 'edit'];
x = await call('points_select', { group: 'TREE' });
ok(!x.r.isError && x.v.selected === 4 && picked.size === 4, 'the TREE group: 4 selected');
const nums = p.points.slice(0, 3).map((q) => q.n);
x = await call('points_select', { numbers: nums, mode: 'add' });
ok(x.v.selected === 7, 'add 3 by number: 7');
x = await call('points_select', { numbers: [nums[0], 'NOPE-1'] });
ok(x.r.isError && /NOPE-1/.test(x.text) && picked.size === 7, 'an unknown number is refused, the selection unchanged');
x = await call('points_select', {});
ok(x.r.isError && /Say which points/.test(x.text), 'nothing to select by: refused');
const before = JSON.stringify(p.points);
await call('points_select', { within: half, mode: 'remove' });
ok(JSON.stringify(p.points) === before, 'no point is ever changed');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

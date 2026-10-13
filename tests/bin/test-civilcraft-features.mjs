#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-features.mjs — CivilCraft 0.4 V14: feature lines with grades (featureline.js + project + grading.js
 * per-corner elevations), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-features.mjs [--build dev|x.y] [--verbose]
 *
 * Worked by hand: grades and stations; set grade / even grade / raise / elevations from a plane surface; stepped offsets
 * (straight, closed square out and in, by Δz and by slope; hairpins and folds refused); a feature line as a breakline of
 * the existing ground (the surface runs through it); a closed design feature line on flat ground whose corners lie on the
 * plane z = 101 + 0.01x + 0.01y — the graded surface inside IS that plane and the fill is exactly 20,000 cu ft (sections by
 * average end areas, exact here, and the grid method); with daylight, every fill ray reaches the ground at
 * (edge elevation − 100) × 3; untrusted project data; undo; the project file.
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
const FL = await mod('featureline.js');
const PJ = await mod('project.js');
const TIN = await mod('tin.js');
const SE = await mod('sections.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const F = (pts, extra = {}) => ({ id: 'f1', name: 'FL', pts: pts.map(([x, y, z]) => ({ x, y, z })), closed: false, use: 'eg', daylight: false, cut: 2, fill: 3, ...extra });
function flat(z = 100) {
  const p = new PJ.Project(), pts = [];
  let n = 1;
  for (let x = -200; x <= 300; x += 20) for (let y = -200; y <= 300; y += 20) pts.push({ n: String(n++), x, y, z, d: 'G' });
  p.setPoints(pts, 'flat');
  return p;
}

section('grades, stations, edits');
{
  const f = F([[0, 0, 100], [30, 40, 101], [30, 100, 98]]);
  ok(JSON.stringify(FL.stations(f)) === '[0,50,110]', 'stations along the plan: 0, 50, 110');
  const sg = FL.segments(f);
  near(sg[0].grade, 0.02, 1e-15, 'segment 1: +1 over 50 = +2 %'); near(sg[1].grade, -0.05, 1e-15, 'segment 2: −3 over 60 = −5 %');
  ok(FL.gradeLabel(0.02) === '+2.00%' && FL.gradeLabel(-0.05) === '-5.00%' && FL.gradeLabel(null) === '—', 'grade labels');
  let g = FL.setGrade(f, 0, -0.01);
  ok(g.pts[1].z === 99.5 && g.pts[2].z === 98 && f.pts[1].z === 101, 'set grade −1 % on segment 1: vertex 2 → 99.5, the rest and the original untouched');
  g = FL.setGrade(f, 1, 0.1);
  ok(g.pts[2].z === 107, 'set grade +10 % on segment 2: vertex 3 → 107');
  g = FL.evenGrade(F([[0, 0, 100], [10, 0, 0], [30, 0, 0], [40, 0, 104]]), 0, 3);
  ok(g.pts.map((p) => p.z).join() === '100,101,103,104', 'even grade from first to last: 100, 101, 103, 104');
  ok(FL.evenGrade(f, 0, 1) === f, 'even grade needs a vertex between');
  g = FL.raise(f, 2.5);
  ok(g.pts.map((p) => p.z).join() === '102.5,103.5,100.5', 'raise by 2.5');
  ok(FL.setElevation(f, 1, NaN) === f && FL.setElevation(f, 9, 1) === f, 'bad elevation or vertex: unchanged');
  const sf = TIN.buildSurface({ points: [[-10, -10], [200, -10], [200, 200], [-10, 200]].map(([x, y]) => ({ x, y, z: 50 + 0.1 * x - 0.2 * y })) }).surface;
  const r = FL.fromSurface(F([[0, 0, 0], [100, 50, 0], [500, 500, 7]]), sf);
  ok(r.f.pts[0].z === 50 && Math.abs(r.f.pts[1].z - 50) < 1e-9 && r.f.pts[2].z === 7 && r.missing.join() === '2', 'elevations from a plane surface; a vertex off the surface keeps its z and is listed');
  const closed = F([[0, 0, 1], [10, 0, 2], [10, 10, 3], [0, 10, 4]], { closed: true });
  ok(FL.stations(closed).length === 5 && FL.stations(closed)[4] === 40 && FL.segments(closed).length === 4 && FL.segments(closed)[3].dz === -3, 'a closed line has its closing segment');
}

section('stepped offsets');
{
  const f = F([[0, 0, 100], [100, 0, 102]]);
  let o = FL.offsetFeature(f, 10, { dz: -0.5 });
  ok(o.f && o.f.pts[0].x === 0 && o.f.pts[0].y === -10 && o.f.pts[1].y === -10 && o.f.pts[0].z === 99.5 && o.f.pts[1].z === 101.5, 'right 10 (travel east → south side), down 0.5');
  ok(o.f.id === null && f.pts[0].y === 0, 'a new line (no id); the original untouched');
  o = FL.offsetFeature(f, -6, { slope: 0.02 });
  ok(o.f.pts[0].y === 6 && Math.abs(o.f.pts[0].z - 100.12) < 1e-12, 'left 6 at +2 %: up 0.12');
  const L = F([[0, 0, 0], [100, 0, 0], [100, 100, 0]]);
  o = FL.offsetFeature(L, 5);
  ok(Math.abs(o.f.pts[1].x - 105) < 1e-9 && Math.abs(o.f.pts[1].y + 5) < 1e-9, 'the corner mitres to (105, −5)');
  const sq = F([[0, 0, 0], [100, 0, 0], [100, 100, 0], [0, 100, 0]], { closed: true });
  o = FL.offsetFeature(sq, 10);
  const xs = o.f.pts.map((p) => [p.x, p.y].join()).join(' ');
  ok(xs === '-10,-10 110,-10 110,110 -10,110', 'a counter-clockwise square, 10 to the right = 10 outward: ' + xs);
  o = FL.offsetFeature(sq, -10);
  ok(o.f.pts.map((p) => [p.x, p.y].join()).join(' ') === '10,10 90,10 90,90 10,90', '10 to the left = inward');
  ok(FL.offsetFeature(sq, -60).f === null && /folds/.test(FL.offsetFeature(sq, -60).problem), 'inward past the middle: refused (folds over)');
  ok(FL.offsetFeature(F([[0, 0, 0], [100, 0, 0], [0, 1, 0]]), 5).f === null, 'a hairpin: refused');
  ok(FL.offsetFeature(f, 0).f === null && FL.offsetFeature(F([[0, 0, 0], [0, 0, 0], [5, 0, 0]]), 1).f === null, 'zero distance or a repeated vertex: refused');
}

section('untrusted data');
{
  ok(FL.cleanFeature(null) === null && FL.cleanFeature({ pts: [{ x: 1, y: 1 }] }) === null, 'not an object, or one vertex → dropped');
  const c = FL.cleanFeature({ id: 'f12', name: 'A\u0007B', pts: [{ x: 0, y: 0, z: 'x' }, { x: 1e10, y: 0 }, { x: 5, y: 5, z: 2e7 }, { x: 6, y: 6, z: 3 }], closed: true, use: 'weird', daylight: 'yes', cut: -1, fill: 1e6 });
  ok(c && c.id === 'f12' && c.name === 'A B' && c.pts.length === 3 && c.pts[0].z === 0 && c.pts[1].z === 0 && c.use === 'eg' && !c.daylight && c.cut === 2 && c.fill === 3 && c.closed, 'cleaned: name, far vertex dropped, bad z → 0, use/daylight/slopes defaulted');
  ok(FL.cleanFeature({ pts: [{ x: 0, y: 0 }, { x: 1, y: 0 }], closed: true }).closed === false, 'two vertices cannot be closed');
}

section('a feature line as a breakline of the existing ground');
{
  const p = flat();
  p.change('Draw feature line', (s) => { s.features.push(F([[-50, 10, 103], [150, 10, 103]], { id: 'f1' })); });
  const sf = p.eg().surface;
  ok(p.egBreaklines().some((b) => b.feature === 'f1'), 'it is one of the existing-ground breaklines');
  near(sf.elevationAt(50, 10), 103, 1e-9, 'the surface runs through it (a berm at 103 on flat ground at 100)');
  near(sf.elevationAt(50, 20), 100, 1e-9, 'and back to the ground at the next survey row');
  p.change('Feature line off', (s) => { s.features[0].use = 'off'; });
  near(p.eg().surface.elevationAt(50, 10), 100, 1e-9, 'use Off: the surface is the ground again');
  p.undo();
  near(p.eg().surface.elevationAt(50, 10), 103, 1e-9, 'undo: the berm is back');
  const fresh = new PJ.Project();
  fresh.change('fl only', (s) => { s.features.push(F([[0, 0, 1], [10, 0, 2], [10, 10, 3], [0, 10, 4]], { id: 'f1', closed: true })); });
  ok(!!fresh.eg().surface, 'feature lines alone (no points) make a surface');
}

section('a closed design feature line: a sloped pad worked by hand');
{
  const plane = (x, y) => 101 + 0.01 * x + 0.01 * y;
  const p = flat();
  p.change('Draw feature line', (s) => { s.features.push(F([[0, 0, plane(0, 0)], [100, 0, plane(100, 0)], [100, 100, plane(100, 100)], [0, 100, plane(0, 100)]], { id: 'f1', closed: true, use: 'design' })); });
  const g = p.graded();
  ok(!!g.surface && g.items.length === 1 && g.items[0].kind === 'feature' && g.regions[0]?.length === 4, 'one grading item; its region is the outline');
  let worst = 0;
  for (let k = 0; k < 200; k++) { const x = 1 + (k * 37) % 98, y = 1 + (k * 53) % 98; worst = Math.max(worst, Math.abs(g.surface.elevationAt(x, y) - plane(x, y))); }
  ok(worst < 1e-9, `inside, the graded surface is the plane (worst ${worst.toExponential(2)})`);
  p.change('Sample', (s) => s.alignments.push({ id: 'a1', name: 'A', start: 0, pis: [{ x: 0, y: 50, r: 0 }, { x: 100, y: 50, r: 0 }], pvis: [], corridor: null, sampling: { step: 10, left: 70, right: 70, extra: [] } }));
  const set = p.sections(p.state.alignments[0]);
  near(set.sections[0].fill, 150, 1e-6, 'section at x = 0: fill 150 sq ft (100 × (1 + 0.5))');
  near(set.totals.fill, 20000, 1e-4, 'end-area fill = 20,000 cu ft exactly (area linear in x)');
  ok(set.totals.cut < 1e-9, 'no cut');
  near(p.volumes().fill, 20000, 20000 * 0.01, 'the grid method agrees within 1 %');
  // daylight on: fill slopes 3:1 from every edge to the ground at 100
  p.change('Daylight', (s) => { s.features[0].daylight = true; });
  const it = p.graded().items[0];
  ok(it.problems.length === 0 && it.rays?.length > 8, 'with daylight: rays from every edge, no problems');
  let wr = 0;
  for (const r of it.rays) if (r.kind === 'fill') wr = Math.max(wr, Math.abs(r.d * (1 / 3) - (r.z0 - 100)) / (r.z0 - 100) * (r.x0 === r.x && r.y0 === r.y ? 0 : 1));
  ok(wr < 1e-5, 'each fill ray drops (edge z − 100) over 3 × that distance (worst relative ' + wr.toExponential(1) + ')');
  ok(it.rays.some((r) => Math.abs(r.z0 - plane(100, 100)) < 1e-9) && it.rays.some((r) => Math.abs(r.z0 - plane(0, 0)) < 1e-9), 'rays start at each corner’s own elevation');
  const v2 = p.volumes().fill;
  // by hand: along each edge a half prism ∫ 1.5 h² ds (fill 3:1, h from the corner heights 1 2 3 2) = 350 + 950 + 950 + 350,
  // at each corner a quarter cone (3π/4) h³ — 2600 + 103.67 on top of the 20,000 inside
  const corners = [1, 2, 3, 2].reduce((t, h) => t + (3 * Math.PI / 4) * h ** 3, 0);
  near(v2, 20000 + 2600 + corners, (20000 + 2600 + corners) * 0.005, 'with daylight: inside + side-slope prisms + corner cones, worked by hand, within 0.5 %');
  // an open design line grades nothing
  p.change('open', (s) => { s.features[0].closed = false; });
  ok(!p.graded().surface, 'an open design feature line is not a grading item');
}

section('the project file');
{
  const p = flat();
  p.change('fl', (s) => { s.features.push(F([[0, 0, 1], [5, 0, 2], [5, 5, 3]], { id: 'f7', closed: true, use: 'design', daylight: true, cut: 1.5, fill: 4 })); });
  const json = JSON.parse(JSON.stringify(p.toJSON()));
  json.features.push({ pts: 'junk' }, { id: 'evil', pts: [{ x: 0, y: 0 }, { x: 1, y: 1 }] });
  const q = PJ.Project.fromJSON(json).project;
  ok(q.state.features.length === 2 && JSON.stringify(q.state.features[0]) === JSON.stringify(p.state.features[0]), 'kept exactly; junk dropped');
  ok(/^f\d+$/.test(q.state.features[1].id) && q.state.features[1].id !== 'evil', 'a bad id gets a new one');
  ok(PJ.Project.fromJSON({ format: 'civilcraft-project', version: 1, units: 'ft' }).project.state.features.length === 0, 'an older file: no feature lines');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-platform.mjs — CivilCraft 0.8 SU.914: house platforms on a sloped site (platform.js), DOM-free, in Node.
 *
 * By hand: ground z = 100 + 0.1·x on a 200 × 200 square, a 30 × 20 pad at 105.5 between x = 40 and 70 (ground 104 → 107): the
 * ground crosses the pad level at x = 55, so there are 15 × 20 columns of cut averaging 0.75 deep and the same of fill:
 * 225 cubic units each, and the deepest cut / highest fill are 1.5 at the two ends. With retaining walls all round there is no
 * embankment, so the numbers hold (within the thin wall strip).
 *   - depthMap: the same cells and totals as grading.js gridVolume; cut 225 / fill 225 within the wall strip; depth extremes 1.5
 *   - depthClasses: equal steps, one class per step, level apart; spotLevels: grid nodes, extremes marked
 *   - planePad / rampPad: the plane's elevation at every corner; the ramp's grade
 *   - freeSection: a line through the pad along x: lengths, cut and fill areas (11.25 × 1 per unit width... 11.25 each), the design
 *     only inside the graded region; a line off the pad has none; SVG and CSV
 *   node bin/test-civilcraft-platform.mjs [--build dev|x.y] [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const VERBOSE = process.argv.includes('--verbose');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m && spec !== 'three') return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const EN = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
(await mod('i18n.js')).init({ strings: EN });
const PF = await mod('platform.js'), PJ = await mod('project.js'), GR = await mod('grading.js'), SD = await mod('sides.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);

const p = new PJ.Project();
const pts = [];
for (let x = 0, n = 1; x <= 200; x += 10) for (let y = 0; y <= 200; y += 10) pts.push({ n: String(n++), x, y, z: 100 + 0.1 * x, d: 'GR' });
p.setPoints(pts, 'slope.csv');
p.change('Pad', (s) => s.pads.push({ id: 'p1', name: 'House', pts: [{ x: 40, y: 60 }, { x: 70, y: 60 }, { x: 70, y: 80 }, { x: 40, y: 80 }], z: 105.5, cut: 2, fill: 2 }));
p.change('Retaining walls all round', (s) => { s.pads[0].sides = SD.setSide(s.pads[0].sides, 'all', { wall: true }, 4, 'ft'); s.pads[0].sides.wallT = 0.05; });
const eg = p.eg().surface, g = p.graded();
ok(eg && g.surface && g.regions.filter(Boolean).length === 1, 'a sloped site with one walled pad grades');

section('cut and fill map');
{
  const m = PF.depthMap(eg, g.surface, { cell: 1, region: g.regions });
  const v = GR.gridVolume(eg, g.surface, { cell: 1, region: g.regions });
  near(m.cut, v.cut, 1e-9, 'cut = the grid method\'s cut'); near(m.fill, v.fill, 1e-9, 'fill = the grid method\'s fill');
  ok(m.cells.length === v.cells, 'the same cells (' + m.cells.length + ')');
  near(m.cut, 225, 14, 'cut by hand: 225 (the wall strip is the only difference)'); near(m.fill, 225, 14, 'fill by hand: 225');
  near(m.maxCut, 1.5, 0.12, 'deepest cut 1.5'); near(m.maxFill, 1.5, 0.12, 'highest fill 1.5');
  ok(Math.abs(m.cells.reduce((s, c) => s + c.dz, 0) - (m.fill - m.cut)) < 1e-9, 'the cells add up to net fill');
  const cl = PF.depthClasses(m, { step: 0.5 });
  ok(cl.nCut === 3 && cl.nFill === 3 && cl.legend.length === 7 && cl.levels.length === 7, 'steps of 0.5 over 1.5: 3 cut + level + 3 fill classes');
  ok(cl.classOf(-1.4) === 0 && cl.classOf(-0.2) === 2 && cl.classOf(0) === 3 && cl.classOf(0.2) === 4 && cl.classOf(1.4) === 6, 'classOf: deepest cut first, level in the middle, fill after');
  ok(cl.classOf(-1.5) === 0 && cl.classOf(1.5) === 6 && cl.classOf(-0.5) === 2 && cl.classOf(0.5000001) === 5, 'class edges');
  ok(PF.depthClasses(m).step > 0, 'a step is picked when none is given (' + PF.depthClasses(m).step + ')');
  const sp = PF.spotLevels(eg, g.surface, { spacing: 5, region: g.regions });
  ok(sp.length === 24, 'spot levels on a 5-unit grid inside the 30 × 20 pad: 6 × 4 = 24 (' + sp.length + ')');
  ok(sp.filter((s) => s.extreme).length === 2, 'the deepest cut and the highest fill are marked');
  const lo = sp.find((s) => s.extreme && s.dz < 0), hi = sp.find((s) => s.extreme && s.dz > 0);
  ok(lo && hi && lo.x > 62 && hi.x < 48, 'cut is deepest at the high (east) end, fill at the low (west) end');
  near(lo.zd - lo.zg, lo.dz, 1e-9, 'a spot\'s dz = design − ground');
  ok(PF.spotLevels(eg, g.surface, { spacing: 0 }).length === 0, 'spacing 0 gives nothing');
}

section('sloped pads');
{
  const sq = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
  const q = PF.planePad(sq, { at: { x: 0, y: 0 }, z: 100, dir: 0, grade: 0.05 });
  ok(q[0].z === 100 && Math.abs(q[1].z - 100.5) < 1e-12 && Math.abs(q[2].z - 100.5) < 1e-12 && q[3].z === 100, 'a plane rising 5 % along x');
  const d = PF.planePad(sq, { at: { x: 0, y: 0 }, z: 100, dir: Math.PI / 4, grade: 0.1 });
  near(d[2].z, 100 + 0.1 * Math.hypot(10, 10), 1e-12, 'a plane rising along the diagonal');
  const r = PF.rampPad({ x: 0, y: 0 }, { x: 20, y: 0 }, 100, 101, 3);
  ok(r.ok && r.pts.length === 4 && Math.abs(r.grade - 0.05) < 1e-12 && r.length === 20, 'a ramp 20 long rising 1: 5 %');
  ok(r.pts[0].y === 1.5 && r.pts[3].y === -1.5 && r.pts[0].z === 100 && r.pts[1].z === 101, 'its corners: 3 wide, low end 100, high end 101');
  ok(!PF.rampPad({ x: 0, y: 0 }, { x: 0, y: 0 }, 0, 1, 3).ok && !PF.rampPad({ x: 0, y: 0 }, { x: 1, y: 0 }, 0, 1, 0).ok, 'no length or no width: not ok');
  // a graded ramp: the ramp pad as a pad in the project grades and its high end lies 1 above its low end
  const p2 = new PJ.Project(); p2.setPoints(pts, 's.csv');
  const rp = PF.rampPad({ x: 100, y: 100 }, { x: 120, y: 100 }, 110, 111, 3);
  p2.change('Ramp', (s) => s.pads.push({ id: 'r1', name: 'Ramp', pts: rp.pts.map((c) => ({ x: c.x, y: c.y, z: c.z })), z: 110.5, cut: 2, fill: 2 }));
  const gs = p2.graded().surface;
  ok(gs && Math.abs(gs.elevationAt(102, 100) - 110.1) < 0.02 && Math.abs(gs.elevationAt(118, 100) - 110.9) < 0.02, 'in the project the ramp pad rises along its length (110.1 → 110.9 at 2 and 18 along)');
}

section('free sections');
{
  const line = [{ x: 0, y: 70 }, { x: 100, y: 70 }];
  const s = PF.freeSection(eg, g.surface, line, { regions: g.regions.filter(Boolean) });
  near(s.length, 100, 1e-9, 'length');
  near(s.cut, 11.25, 0.8, 'cut area by hand 11.25'); near(s.fill, 11.25, 0.8, 'fill area by hand 11.25');
  ok(s.parts.some((q) => q.kind === 'fill') && s.parts.some((q) => q.kind === 'cut'), 'fill pieces and cut pieces');
  const f = s.parts.find((q) => q.kind === 'fill'), c = s.parts.find((q) => q.kind === 'cut');
  ok(f.o1 <= 56 && c.o0 >= 54, 'fill to the west of x = 55, cut to the east');
  ok(s.ground.length === 1 && s.ground[0][0].o === 0 && Math.abs(s.ground[0][0].z - 100) < 1e-9 && Math.abs(s.ground[0].at(-1).z - 110) < 1e-9, 'the ground runs 100 → 110 along 100 units');
  ok(s.design.length >= 1 && s.design.every((r) => r[0].o > 30 && r.at(-1).o < 80), 'the design counts only inside the graded region');
  const off = PF.freeSection(eg, g.surface, [{ x: 0, y: 150 }, { x: 100, y: 150 }], { regions: g.regions.filter(Boolean) });
  ok(off.cut === 0 && off.fill === 0 && off.design.length === 0, 'a line that misses the pad has no cut or fill');
  const bent = PF.freeSection(eg, g.surface, [{ x: 20, y: 70 }, { x: 55, y: 70 }, { x: 55, y: 110 }], { regions: g.regions.filter(Boolean) });
  near(bent.length, 75, 1e-9, 'a bent line: length of both legs'); ok(bent.marks.length === 3 && bent.marks[1].o === 35, 'the corner is marked at 35');
  const none = PF.freeSection(eg, null, line);
  ok(none.design.length === 0 && none.cut === 0, 'ground only when there is no design');
  const svg = PF.freeSectionSvg(s, { t: (k, v) => (EN[k] || k).replace(/\{(\w+)\}/g, (_, a) => v?.[a] ?? ''), units: 'ft' });
  ok(svg.startsWith('<svg') && svg.includes('data-kind="cut"') && svg.includes('data-kind="fill"') && svg.includes('data-free-section'), 'SVG: both shaded kinds');
  ok(/100 ft/.test(svg) && /11\.2|11\.3|11\.1|11\.0/.test(svg), 'the SVG title carries the length and areas');
  const csv = PF.freeSectionCsv(s, { units: 'ft', t: (k, v) => (EN[k] || k).replace(/\{(\w+)\}/g, (_, a) => v?.[a] ?? '') }).split('\r\n');
  ok(csv[0] === 'Distance (ft),Ground,Design' && csv.some((l) => l.startsWith('Cut area')) && csv[1].startsWith('0,100'), 'CSV header, first row, areas');
  const keys = ['sx.su914.sec.title', 'sx.su914.sec.areas'];
  ok(keys.every((k) => EN[k]), 'the strings the SVG uses exist');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

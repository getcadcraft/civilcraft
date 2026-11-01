#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-walls.mjs — 0.7.1 71.22 (MickeyWolf): the slope between a pad / Landscape platform and the existing ground set per
 * side, cut and fill apart, or vertical: a retaining wall instead of an embankment (sides.js, grading.js daylightPad).
 *
 *   node bin/test-civilcraft-walls.mjs [--build dev] [--verbose]
 *
 * By hand on flat ground: a 20 × 20 ft pad 2 ft up with walls all round fills 800 + 80 × 0.5 × 2 / 2 = 840 cu ft (+ the mitres),
 * against 1,120 + the corner cones with 2:1 slopes; one walled side (east) puts the daylight 0.5 ft out there; cut pads, per-side
 * slopes, a pad drawn clockwise, the warnings (tall wall, slope steeper than the soil stands) as data in the Problems shape, slopes
 * typed as ratio / % / °, the project file (cleanSides), one undo step per change, the plan symbol (C-GRAD-WALL, heights), DXF,
 * the 3D solid (GLB), a Landscape platform with walls, sections across a wall.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire, registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const VERBOSE = process.argv.includes('--verbose');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m && spec !== 'three') return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await mod('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const TIN = await mod('tin.js'), GR = await mod('grading.js'), SD = await mod('sides.js'), PJ = await mod('project.js'), S3 = await mod('site3d.js');
const EX = await mod('site3d-export.js'), DXF = await mod('dxf.js'), SC = await mod('scene.js'), GD = await mod('landscape/grade.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);

section('slopes typed as ratio, percent or degrees');
near(SD.parseSlope('3'), 3, 1e-12, '"3" = 3:1');
near(SD.parseSlope('3:1'), 3, 1e-12, '"3:1" = 3:1');
near(SD.parseSlope('1:2'), 0.5, 1e-12, '"1:2" = 0.5:1 (H:V as typed)');
near(SD.parseSlope('50%'), 2, 1e-12, '"50%" = 2:1');
near(SD.parseSlope('45°'), 1, 1e-9, '"45°" = 1:1');
near(SD.parseSlope('18.4349488 deg'), 3, 1e-6, '"18.43 deg" = 3:1');
ok(SD.parseSlope('vertical') === 0 && SD.parseSlope('abc') === null && SD.parseSlope('-2') === null && SD.parseSlope('') === null, '"vertical" = 0; junk, negatives and blank refused');
ok(SD.slopeLabel(2) === '2.00:1 (50.0 %, 26.6°)', 'a slope shown as ' + SD.slopeLabel(2));

section('the side settings (untrusted, as in a project file)');
ok(SD.cleanSides(null, 'ft', 4) === null && SD.cleanSides({ edges: [null, null] }, 'ft', 4) === null, 'nothing set: no settings kept');
const cs = SD.cleanSides({ edges: [{ wall: 1, cut: 9 }, { cut: -1, fill: 4 }, 'x', { cut: 1e9 }, { wall: true }], wallT: -3, wallLimit: 'tall', maxSlope: 2 }, 'm', 4);
ok(cs.edges.length === 2 && cs.edges[0].wall === true && cs.edges[0].cut === undefined && cs.edges[1].fill === 4 && cs.edges[1].cut === undefined, 'a wall side keeps no slopes; bad slopes dropped; sides past the outline cut off: ' + JSON.stringify(cs.edges));
ok(cs.wallT === 0.3 && cs.wallLimit === 1 && cs.maxSlope === 2 && cs.u === 'm', 'metres: wall 0.3 m thick, warn above 1.0 m (defaults for junk)');
ok(SD.sideDefaults('ft').wallT === 1 && SD.sideDefaults('ft').wallLimit === 3.3, 'feet: 1 ft thick, warn above 3.3 ft');
const ss = SD.setSide(null, 2, { wall: true }, 4, 'ft');
ok(ss.edges[2].wall && ss.edges.length === 3 && SD.setSide(ss, 2, null, 4, 'ft') === null, 'setSide: one side a wall, then back to the pad\'s slopes (nothing left to keep)');
ok(SD.setSide(null, 'all', { wall: true }, 4, 'ft').edges.filter((e) => e?.wall).length === 4, 'setSide all: walls all round');

section('a pad on flat ground: walls all round, one wall, slopes per side');
const pts = [];
for (let i = -10; i <= 10; i++) for (let j = -10; j <= 10; j++) pts.push({ x: i * 10, y: j * 10, z: 0 });
const egf = TIN.buildSurface({ points: pts }).surface;
const build = (input) => TIN.buildSurface(input);
const pad = { id: 'p1', name: 'Pad A', pts: [{ x: -10, y: -10 }, { x: 10, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }], z: 2, cut: 2, fill: 2 };
const grade = (p) => { const g = GR.gradedSurface(egf, pts, [], [p], build); return { g, v: GR.gridVolume(egf, g.surface, { region: g.regions, cell: 0.05 }) }; };
const sloped = grade(pad);
{
  const sides = SD.cleanSides({ edges: [{ wall: true }, { wall: true }, { wall: true }, { wall: true }], wallT: 0.5 }, 'ft', 4);
  const dl = GR.daylightPad(egf, { ...pad, sides });
  ok(!dl.problems.length && dl.rays.every((r) => r.kind === 'wall'), 'walls all round: every ray is a wall, no slope');
  ok(dl.rays.filter((r) => r.edge !== undefined).every((r) => Math.abs(r.d - 0.5) < 1e-9 && Math.abs(r.z) < 1e-9), 'along the sides the outer face is the wall\'s 0.5 ft out, at the ground (0)');
  ok(dl.walls.length === 1 && dl.walls[0].closed, 'one wall, closed all round (mitred corners)');
  const q = SD.wallQuantities(dl.walls);
  near(q.length, 80, 1e-9, 'wall length = the pad\'s perimeter, 80 ft');
  near(q.faceArea, 160, 1e-9, 'exposed face = 80 × 2 = 160 sq ft');
  ok(q.maxH === 2 && Math.abs(q.avgH - 2) < 1e-9, 'tallest and average height 2 ft');
  const { g, v } = grade({ ...pad, sides });
  ok(!!g.surface && !g.report.errors.length, 'the graded surface builds with the walls');
  near(v.fill, 840, 1.5, `fill ${v.fill.toFixed(1)} cu ft: the pad (800) + the wall strip (40), no embankment (sloped: ${sloped.v.fill.toFixed(1)})`);
  ok(sloped.v.fill - v.fill > 300, 'the embankment volume is gone');
  near(g.surface.elevationAt(0, 9.9), 2, 1e-9, 'the pad stays at 2 up to its edge');
  near(g.surface.elevationAt(0, 10.6), 0, 1e-9, 'past the wall (0.5 ft) the ground is untouched');
}
{
  const sides = SD.cleanSides({ edges: [null, { wall: true }], wallT: 0.5 }, 'ft', 4);   // side 1 = (10,-10) → (10,10): east
  const dl = GR.daylightPad(egf, { ...pad, sides });
  const east = dl.rays.filter((r) => r.k === 1);
  ok(east.length > 5 && east.every((r) => r.kind === 'wall' && Math.abs(r.x - 10.5) < 1e-9), 'only the east side is a wall: its rays end 0.5 ft out (x = 10.5)');
  ok(dl.rays.filter((r) => r.kind === 'fill').every((r) => r.k !== 1) && dl.rays.some((r) => r.kind === 'fill' && Math.abs(r.x + 14) < 1e-6), 'the other sides keep their 2:1 slopes (west daylight at x = −14)');
  ok(dl.walls.length === 1 && !dl.walls[0].closed && Math.abs(dl.walls[0].pts[0].y + 10) < 1e-9 && Math.abs(dl.walls[0].pts.at(-1).y - 10) < 1e-9, 'the wall runs the whole east side, corner to corner');
  ok(!GR.selfCrosses(dl.daylight), 'clean corners: where the wall meets the slopes the daylight line does not cross itself');
  const { g, v } = grade({ ...pad, sides });
  ok(!!g.surface && !g.report.errors.length, 'the mixed pad grades');
  near(g.surface.elevationAt(11, 0), 0, 1e-9, 'east: ground right past the wall');
  near(g.surface.elevationAt(-12, 0), 1, 1e-6, 'west: halfway down the slope = 1');
  ok(v.fill < sloped.v.fill - 60 && v.fill > 840, `fill ${v.fill.toFixed(1)}: one embankment side less`);
  // cut and fill per side: south (side 0) fill 4:1 → 8 ft out
  const dl4 = GR.daylightPad(egf, { ...pad, sides: SD.cleanSides({ edges: [{ fill: 4 }] }, 'ft', 4) });
  ok(dl4.rays.filter((r) => r.k === 0 && r.edge !== undefined).every((r) => Math.abs(r.d - 8) < 1e-6) && dl4.rays.filter((r) => r.k === 2 && r.edge !== undefined).every((r) => Math.abs(r.d - 4) < 1e-6), 'side 0 fill 4:1 → 8 ft out; the others 2:1 → 4 ft');
  // the same pad drawn clockwise: side numbers follow the drawn order
  const cw = { ...pad, pts: pad.pts.slice().reverse() };   // sides: 0 = (-10,10)→(10,10) north … 2 = (10,-10)→(-10,-10) south
  const dlc = GR.daylightPad(egf, { ...cw, sides: SD.cleanSides({ edges: [{ wall: true }] }, 'ft', 4) });
  ok(dlc.rays.filter((r) => r.kind === 'wall').every((r) => Math.abs(r.y0 - 10) < 1e-9 && r.y > 10), 'drawn clockwise: side 0 is still the side from the first corner (north) that was set');
}
{
  // a cut pad: ground at 10, pad at 8, walls all round: the wall retains the ground, top 10, bottom 8
  const p2 = pts.map((p) => ({ ...p, z: 10 })), eg2 = TIN.buildSurface({ points: p2 }).surface;
  const dl = GR.daylightPad(eg2, { ...pad, z: 8, sides: SD.cleanSides({ edges: [{ wall: true }, { wall: true }, { wall: true }, { wall: true }] }, 'ft', 4) });
  ok(dl.walls[0].pts.every((p) => p.top === 10 && p.bottom === 8 && p.h === 2 && p.zPad === 8 && p.zGround === 10), 'a cut pad\'s wall: top at the ground (10), bottom at the pad (8)');
}

section('warnings, as data (the shared Problems shape)');
{
  const sides = SD.cleanSides({ edges: [null, { wall: true }], wallT: 0.5, wallLimit: 1.5, maxSlope: 3 }, 'ft', 4);
  const dl = GR.daylightPad(egf, { ...pad, sides, about: { kind: 'pad', id: 'p1' } });
  const tall = dl.warnings.filter((w) => w.code === 'grade.wall.tall'), steep = dl.warnings.filter((w) => w.code === 'grade.slope.steep');
  ok(tall.length === 1 && tall[0].hard === false && tall[0].severity === 'warning' && tall[0].ref === 'p1' && tall[0].about.kind === 'pad' && tall[0].h === 2 && tall[0].limit === 1.5, 'a 2 ft wall over the 1.5 ft limit: one warning { code, hard: false, severity, ref, about, h, limit }');
  ok(/engineered wall or a permit/.test(tall[0].text) && tall[0].msg.key === 'sides.w.tall' && tall[0].msg.vars.h === '2.00', 'its words: ' + tall[0].text);
  ok(steep.length === 3 && steep.every((w) => w.kind === 'fill' && w.H === 2 && w.limit === 3 && w.k[0] !== 1), 'fill 2:1 steeper than the 3:1 the soil stands: one warning per sloped side (3), none for the wall side');
  const quiet = GR.daylightPad(egf, { ...pad, sides: SD.cleanSides({ edges: [null, { wall: true }], wallT: 0.5 }, 'ft', 4) });
  ok(quiet.warnings.length === 0, 'under the limit (3.3 ft) and no soil limit set: no warnings');
  ok(GR.daylightPad(egf, pad).warnings === undefined, 'a pad without side settings: unchanged result (no walls, no warnings)');
}

section('in a project: file, undo, volumes, plan, DXF, 3D, Landscape platforms');
const FIX = await import(pathToFileURL(path.join(REPO, 'tools/civilcraft-test/make-fixture.mjs')).href);
const PTS = await mod('points.js');
const p = new PJ.Project();
p.setPoints(PTS.parsePoints(fs.readFileSync(path.join(REPO, 'tools/civilcraft-test/site-topo.csv'), 'utf8')).points, 'site-topo.csv');
const E = FIX.E0, N = FIX.N0;
p.change('Pad', (s) => s.pads.push({ id: 'p1', name: 'Pad A', pts: [{ x: E + 60, y: N + 120 }, { x: E + 120, y: N + 120 }, { x: E + 120, y: N + 170 }, { x: E + 60, y: N + 170 }], z: 252, cut: 2, fill: 2 }));
const volBefore = p.volumes();
const nUndo = p.undoStack.length;
p.change('Retaining walls all round', (s) => { s.pads[0].sides = SD.setSide(s.pads[0].sides, 'all', { wall: true }, 4, 'ft'); });
ok(p.undoStack.length === nUndo + 1, 'one change = one undo step');
const gi = p.graded().items.find((x) => x.id === 'p1');
ok(gi.walls?.length === 1 && gi.walls[0].closed && !gi.problems.length, 'the graded pad has its wall');
const volAfter = p.volumes();
ok(volAfter.cut < volBefore.cut && volAfter.fill < volBefore.fill, `earthworks recomputed without the embankments: cut ${volBefore.cut.toFixed(0)} → ${volAfter.cut.toFixed(0)}, fill ${volBefore.fill.toFixed(0)} → ${volAfter.fill.toFixed(0)} cu ft`);
const j = JSON.parse(JSON.stringify(p.toJSON()));
const p2 = PJ.Project.fromJSON(j).project;
ok(p2.state.pads[0].sides?.edges.length === 4 && p2.state.pads[0].sides.edges.every((e) => e.wall), 'saved and opened again: the walls are kept');
p.undo();
ok(!p.state.pads[0].sides && !p.graded().items.find((x) => x.id === 'p1').walls?.length, 'undo: slopes again');
p.redo();
// plan symbol, DXF
const items = SD.wallSceneItems(gi.walls, { layer: 'C-GRAD-WALL', unitPerMm: 1, fixed: (v) => v.toFixed(2) });
const lines = items.filter((x) => x.kind === 'poly'), labels = items.filter((x) => x.kind === 'text');
ok(SC.LAYERS.some((l) => l.name === 'C-GRAD-WALL') && lines.length > 20 && labels.length === 1 && /^h \d+\.\d\d$/.test(labels[0].text), `plan: the outer face + ${lines.length - 1} ticks on layer C-GRAD-WALL, the height at the tallest point ("${labels[0]?.text}")`);
const q = SD.wallQuantities(gi.walls);
ok(Math.abs(Number(labels[0].text.slice(2)) - q.maxH) < 0.006, 'the label is the tallest height (' + q.maxH.toFixed(2) + ' ft)');
const open = SD.wallSceneItems([{ ...gi.walls[0], closed: false }], { unitPerMm: 1 });
ok(open.filter((x) => x.kind === 'text').length === 3, 'an open wall: heights at both ends and the tallest');
const dxf = DXF.writeDxf({ units: 'ft', layers: SC.LAYERS, entities: lines.map((l) => ({ type: 'poly', layer: l.layer, pts: l.pts, closed: !!l.closed, elev: 0 })) });
ok(dxf.text.includes('C-GRAD-WALL') && (dxf.text.match(/C-GRAD-WALL/g) || []).length > lines.length, 'DXF carries the wall layer');
// 3D
const sc = S3.buildSite3D(S3.siteInput(p), { exag: 1 });
const wm = sc.meshes.find((m) => m.key === 'walls');
ok(wm && wm.owners[0].kind === 'pad' && wm.owners[0].id === 'p1' && wm.indices.length / 3 > 100, `3D: the wall as a solid (${wm?.indices.length / 3} triangles), owned by the pad`);
let zlo = Infinity, zhi = -Infinity;
for (let i = 2; i < wm.positions.length; i += 3) { zlo = Math.min(zlo, wm.positions[i] + sc.origin.z); zhi = Math.max(zhi, wm.positions[i] + sc.origin.z); }
ok(zhi >= 252 - 1e-3 && zlo < 252, `from the ground to the pad (${zlo.toFixed(2)} … ${zhi.toFixed(2)})`);
ok(!S3.buildSite3D(S3.siteInput(p), { show: { walls: false } }).meshes.some((m) => m.key === 'walls'), 'Show › Retaining walls off: not drawn');
let validator = null;
try { validator = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('gltf-validator'); } catch { console.log('  note gltf-validator missing'); }
if (validator) { const rep = await validator.validateBytes(EX.exportGLB(sc), { maxIssues: 10 }); ok(rep.issues.numErrors === 0, 'GLB with the walls validates'); }
ok(/^o Retaining_walls$/m.test(EX.exportOBJ(sc)), 'OBJ carries the walls');
// section across the wall: the ground steps within the wall's thickness
const fg = p.graded().surface, eg = p.eg().surface;
const yMid = N + 145, gIn = fg.elevationAt(E + 119.9, yMid, 1e-6), gOut = fg.elevationAt(E + 121.1, yMid, 1e-6);
near(gIn, 252, 1e-6, 'section across the east wall: the pad at 252 up to the wall');
near(gOut, eg.elevationAt(E + 121.1, yMid, 1e-6), 0.02, 'and the existing ground 1 ft (the thickness) past it (within the new triangles\' 0.02 ft)');
// a Landscape platform with mixed sides
const gr = GD.cleanGrading([{ id: 'l1', kind: 'platform', name: 'Terrace', pts: [{ x: E + 250, y: N + 50 }, { x: E + 300, y: N + 50 }, { x: E + 300, y: N + 90 }, { x: E + 250, y: N + 90 }], z: 251, cut: 2, fill: 3, sides: { edges: [{ wall: true }, null, { cut: 1.5 }], wallT: 0.8, wallLimit: 1 } }], 'ft');
ok(gr[0].sides.edges[0].wall && gr[0].sides.edges[2].cut === 1.5 && gr[0].sides.wallT === 0.8, 'a platform keeps its side settings (cleanGrading)');
p.change('Terrace', (s) => { s.landscape = { palette: [], plants: [], beds: [], hedges: [], hardscape: [], grading: gr, show: 'mature', label: '{name}', labels: true }; });
const ti = p.graded().items.find((x) => x.id === 'l1');
ok(ti && !ti.problems.length && ti.walls?.length === 1 && ti.walls[0].pts.every((q) => Math.abs(q.y - (N + 50)) < 1e-6), 'the platform\'s south side is a wall, the rest graded');
ok(ti.warnings.some((w) => w.code === 'grade.wall.tall' && w.about.kind === 'ls-grade' && w.ref === 'l1') || ti.walls[0].pts.every((q) => q.h <= 1), 'a wall over 1 ft on the platform warns, about the platform (ls-grade)');
const sc2 = S3.buildSite3D(S3.siteInput(p), {});
ok(sc2.meshes.find((m) => m.key === 'walls').owners.some((o) => o.kind === 'ls-grade' && o.id === 'l1'), '3D: the platform\'s wall too');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

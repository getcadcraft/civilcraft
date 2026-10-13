#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft.mjs — the DOM-free CivilCraft modules (assets/apps/civilcraft/<build>/) in Node.
 *
 *   node bin/test-civilcraft.mjs [--build dev|x.y] [--verbose] [--keep]
 *
 * Points files (formats, delimiters, headers, bad rows), the constrained Delaunay TIN (validity on
 * random input, breaklines forced in, crossings split, boundaries, long-edge trimming, exact planes),
 * contours/bands/slopes, alignments (curve formulas, stationing, station/offset), profiles (vertical
 * curves worked by hand, high/low points, K), pad grading + grid volumes against hand-computed solids,
 * LandXML 1.2 out → in (and checked by a second reader: Python's ElementTree, plus the LandXML 1.2
 * XSD with lxml when tools/civilcraft-test/venv exists), the R12 DXF (read back by ezdxf), the PDF
 * plot (poppler), the project file, and copy/paste of survey points (clip.js: renumbering, point rows for a
 * spreadsheet and back, untrusted clipboard data, point edits as undo steps that rebuild the surface). Fixture: tools/civilcraft-test/site-topo.csv (make-fixture.mjs).
 * --keep writes the exported files to tmp/civilcraft-test/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const KEEP = process.argv.includes('--keep');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
// The build's language file: DOM-free modules speak through t() (docs/LANG.md); a build without one keeps its English.
if (fs.existsSync(path.join(APP, 'lang/en.json'))) (await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const VENDOR = path.join(REPO, 'public_html/assets/vendor');
const TOOLS = path.join(REPO, 'tools/civilcraft-test');
const OUT = KEEP ? path.join(REPO, 'tmp/civilcraft-test') : fs.mkdtempSync('/tmp/civilcraft-test-');
fs.mkdirSync(OUT, { recursive: true });

// the page's import map, for Node: bare library names → the vendored files
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const U = await mod('units.js');
const PTS = await mod('points.js');
const TIN = await mod('tin.js');
const AL = await mod('alignment.js');
const PR = await mod('profile.js');
const GR = await mod('grading.js');
const LX = await mod('landxml.js');
const DXF = await mod('dxf.js');
const SC = await mod('scene.js');
const PL = await mod('plot.js');
const PJ = await mod('project.js');
const XML = await mod('xml.js');
const PI_ = await mod('pipes.js');
const CO = await mod('corridor.js');
const CL = await mod('clip.js');
const { orient2d, incircle } = await import(pathToFileURL(path.join(VENDOR, 'robust-predicates/current/index.js')).href);
const FIX = await import(pathToFileURL(path.join(TOOLS, 'make-fixture.mjs')).href);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const python = fs.existsSync(path.join(TOOLS, 'venv/bin/python')) ? path.join(TOOLS, 'venv/bin/python') : 'python3';
const check = (mode, file) => JSON.parse(execFileSync(python, [path.join(TOOLS, 'check.py'), mode, file], { encoding: 'utf8' }));

// ---------------------------------------------------------------------------
section('units and stations');
ok(U.formatStation(1234.56, 'ft') === '12+34.56', 'ft station 12+34.56');
ok(U.formatStation(0, 'ft') === '0+00.00', 'ft station 0+00.00');
ok(U.formatStation(-50, 'ft') === '-0+50.00', 'negative station');
ok(U.formatStation(99.999, 'ft') === '1+00.00', 'rounds up into the next station');
ok(U.formatStation(1234.5, 'm') === '1+234.500', 'metric station 1+234.500');
ok(U.formatStation(1200, 'ft', 0) === '12+00', 'station label without decimals');
ok(U.parseStation('12+34.56', 'ft') === 1234.56 && U.parseStation('1+234.5', 'm') === 1234.5 && U.parseStation('-0+50', 'ft') === -50 && U.parseStation('987.6') === 987.6, 'parseStation');
ok(U.parseStation('12+ab') === null && U.parseStation('') === null, 'parseStation refuses junk');
let rt = true;
for (let s = -500; s <= 5000; s += 7.31) if (Math.abs(U.parseStation(U.formatStation(s, 'ft'), 'ft') - Number(s.toFixed(2))) > 1e-9) rt = false;
ok(rt, 'stations round-trip through text (ft)');
ok(U.bearing(Math.PI / 4) === 'N 45°00\'00" E' && U.bearing(-Math.PI / 2) === 'S 0°00\'00" E', 'bearings');

// ---------------------------------------------------------------------------
section('point files');
const fixtureText = fs.readFileSync(path.join(TOOLS, 'site-topo.csv'), 'utf8');
const fx = PTS.parsePoints(fixtureText);
ok(fx.format === 'PNEZD' && fx.formatFrom === 'header' && fx.delimiter === ',', 'fixture: PNEZD from its header, comma');
ok(fx.points.length === 276 && fx.badCount === 0, 'fixture: 276 points, no bad rows');
const p1 = fx.points.find((p) => p.n === '3');
ok(p1 && p1.x === 6150000 && p1.y === 2080000 && p1.z === 250 && p1.d === 'GRD', 'fixture point 3: easting/northing/elevation/description in the right places');
const groups = PTS.pointGroups(fx.points);
ok(JSON.stringify(groups.map((g) => g.key + g.count)) === JSON.stringify(['CP2', 'FL21', 'GRD201', 'RIDGE14', 'TBN17', 'TBS17', 'TREE4']), 'groups by first word of the description');
ok(PTS.groupPoints(fx.points, 'FL').map((p) => Number(p.n)).every((n, i, a) => !i || n > a[i - 1]), 'group points in number order');

const penzd = PTS.parsePoints('1 5000.000 1000.000 100.5 EP\n2 5010 1001 100.7 EP LT\n', { format: 'PENZD' });
ok(penzd.delimiter === 'ws' && penzd.points[0].x === 5000 && penzd.points[0].y === 1000 && penzd.points[1].d === 'EP LT', 'PENZD space-delimited, description with a space');
const nez = PTS.parsePoints('1000.0\t2000.0\t50.0\n1001\t2002\t51\n1003\t2001\t52\n');
ok(nez.format === 'NEZ' && nez.delimiter === '\t' && nez.points.length === 3 && nez.points[0].n === '1' && nez.points[0].x === 2000, 'NEZ tab, auto-numbered');
const quoted = PTS.parsePoints('Pt,N,E,Z,Desc\n10,1,2,3,"TREE, 12"" OAK"\n');
ok(quoted.points[0].d === 'TREE, 12" OAK', 'quoted CSV description with a comma and quotes');
const swapped = PTS.parsePoints('Point,Easting,Northing,Elevation,Description\n1,10,20,30,A\n');
ok(swapped.format === 'PENZD' && swapped.points[0].x === 10 && swapped.points[0].y === 20, 'header order PENZD recognised');
const badText = '# a comment\nP,N,E,Z,D\n1,100,200,10,A\n2,abc,200,10,B\n3,100\n1,101,201,11,C\n4,102,202,x,D\n5,103,203,,E\n';
const bad = PTS.parsePoints(badText);
ok(bad.points.length === 2 && bad.badCount === 4, 'bad rows: 2 good, 4 reported');
ok(bad.bad.map((b) => b.line).join() === '4,5,6,7', 'bad rows carry their line numbers');
ok(/northing or easting/.test(bad.bad[0].why) && /columns/.test(bad.bad[1].why) && /twice/.test(bad.bad[2].why) && /elevation/.test(bad.bad[3].why), 'bad rows say why');
ok(bad.points[1].z === null, 'an empty elevation is a 2D point');
const back = PTS.parsePoints(PTS.writePoints(fx.points));
ok(back.points.length === 276 && back.points.every((p, i) => p.n === fx.points[i].n && Math.abs(p.x - fx.points[i].x) < 1e-6 && p.d === fx.points[i].d), 'writePoints → parsePoints round trip');

// ---------------------------------------------------------------------------
section('TIN: validity on random input');
function validate(sf, segs, label) {
  const { X, Y, Z, tris } = sf;
  let ccwOk = true, area = 0;
  const edges = new Map();
  for (let t = 0; t < tris.length; t += 3) {
    const a = tris[t], b = tris[t + 1], c = tris[t + 2];
    const o = -orient2d(X[a], Y[a], X[b], Y[b], X[c], Y[c]);
    if (!(o > 0)) ccwOk = false;
    area += ((X[b] - X[a]) * (Y[c] - Y[a]) - (Y[b] - Y[a]) * (X[c] - X[a])) / 2;
    for (const [u, v, w] of [[a, b, c], [b, c, a], [c, a, b]]) edges.set(u + '_' + v, w);
  }
  ok(ccwOk, label + ': every triangle counter-clockwise with area');
  let manifold = true;
  for (const k of edges.keys()) { const [u, v] = k.split('_'); if (edges.has(k) && edges.get(k) === undefined) manifold = false; void u; void v; }
  ok(manifold, label + ': each directed edge used once');
  const con = new Set(sf.constrainedEdges.map(([a, b]) => (a < b ? a + '_' + b : b + '_' + a)));
  let delaunay = true, worst = 0;
  for (const [k, w] of edges) {
    const [u, v] = k.split('_').map(Number);
    const w2 = edges.get(v + '_' + u);
    if (w2 === undefined) continue;
    if (con.has(u < v ? u + '_' + v : v + '_' + u)) continue;
    const ic = incircle(X[u], Y[u], X[v], Y[v], X[w], Y[w], X[w2], Y[w2]);
    const scale = Math.max(Math.hypot(X[u] - X[v], Y[u] - Y[v]), 1) ** 4;
    if (ic / scale > 1e-9) { delaunay = false; worst = Math.max(worst, ic / scale); }
  }
  ok(delaunay, label + ': every edge that is not a breakline is locally Delaunay' + (worst ? ' (worst ' + worst + ')' : ''));
  if (segs) {
    const has = (a, b) => edges.has(a + '_' + b) || edges.has(b + '_' + a);
    ok(segs.every(([a, b]) => has(a, b)), label + ': every breakline piece is an edge');
  }
  return { area, edges };
}
{
  const r = rng(7), pts = [];
  for (let i = 0; i < 1500; i++) pts.push({ x: 2e6 + r() * 1000, y: 6e5 + r() * 800, z: 100 + r() * 20 });
  // breaklines: a zig-zag, a long diagonal crossing it, and one through existing points
  const bl = [
    { name: 'zig', pts: [0, 1, 2, 3, 4, 5, 6].map((k) => ({ x: 2e6 + 50 + k * 140, y: 6e5 + (k % 2 ? 600 : 200), z: 110 })) },
    { name: 'diag', pts: [{ x: 2e6 + 20, y: 6e5 + 780, z: 105 }, { x: 2e6 + 980, y: 6e5 + 30, z: 115 }] },
    { name: 'thru', pts: [pts[10], pts[20], pts[30]].map((p) => ({ ...p })) },
  ];
  const t0 = performance.now();
  const { surface: sf, report } = TIN.buildSurface({ points: pts, breaklines: bl });
  const ms = performance.now() - t0;
  ok(!!sf && !report.errors.length, `1500 random points + 3 breaklines triangulate (${ms.toFixed(0)} ms)`);
  // brute force: how many proper crossings do the input breaklines have?
  const segsIn = bl.flatMap((b) => b.pts.slice(1).map((p, i) => [b.pts[i], p]));
  let crossN = 0;
  const o3 = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  for (let i = 0; i < segsIn.length; i++) for (let j = i + 1; j < segsIn.length; j++) {
    const [a, b] = segsIn[i], [c, d] = segsIn[j];
    if (o3(a, b, c) * o3(a, b, d) < 0 && o3(c, d, a) * o3(c, d, b) < 0) crossN++;
  }
  ok(crossN >= 6 && report.crossings === crossN && report.zConflicts > 0, `crossing breaklines split where they cross (${report.crossings} of ${crossN}) and the height differences are reported`);
  ok(report.constraintFailures === 0, 'no breakline piece failed');
  // the pieces as vertex pairs (find vertices by position)
  const idx = new Map();
  for (let i = 0; i < sf.X.length; i++) idx.set(Math.round((sf.X[i] + sf.ox) * 1e4) + ',' + Math.round((sf.Y[i] + sf.oy) * 1e4), i);
  const vi = (p) => idx.get(Math.round(p.x * 1e4) + ',' + Math.round(p.y * 1e4));
  const conSet = new Set(sf.constrainedEdges.map(([a, b]) => (a < b ? a + '_' + b : b + '_' + a)));
  const { area } = validate(sf, sf.constrainedEdges, 'random CDT');
  ok(conSet.size >= 6 + 1 + 2 + 6, 'constrained edges include every piece (' + conSet.size + ')');
  ok(vi(bl[2].pts[0]) !== undefined && [...conSet].some((k) => k.split('_').map(Number).includes(vi(bl[2].pts[1]))), 'a breakline through survey points uses those points');
  const allV = [...pts, ...bl.flatMap((b) => b.pts)];
  const hullA = TIN.polyArea(TIN.convexHull(allV));
  near(area, hullA, 1e-6 * hullA, 'triangles cover exactly the convex hull');
  const st = sf.stats();
  near(st.area2d, hullA, 1e-6 * hullA, 'stats area2d = hull area');
  ok(st.points === 1500 + 7 + 2 + crossN, 'stats points = survey points + new breakline vertices + crossing points (' + st.points + ')');
  ok(st.triangles === 2 * st.points - 2 - TIN.convexHull(allV).length, 'Euler: triangles = 2n − 2 − hull');
  // along a breakline, the surface is the breakline (linear between its vertices)
  let alongOk = true;
  for (let k = 0; k < 6; k++) {
    const a = bl[0].pts[k], b = bl[0].pts[k + 1];
    for (const t of [0.13, 0.5, 0.77]) {
      const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t, z = sf.elevationAt(x, y);
      // the zig-zag is given first, so where the diagonal crosses it the zig-zag's 110 wins
      if (Math.abs(z - 110) > 1e-6) alongOk = false;
    }
  }
  ok(alongOk, 'elevations along a flat breakline are exactly its elevation');
}
{
  // degenerate input
  ok(!!TIN.buildSurface({ points: [{ x: 0, y: 0, z: 1 }, { x: 1, y: 1, z: 1 }, { x: 2, y: 2, z: 1 }] }).report.errors.length, 'points on one line: an error, no surface');
  ok(TIN.buildSurface({ points: [] }).report.errors.length === 1, 'no points: an error');
  const dup = TIN.buildSurface({ points: [{ x: 0, y: 0, z: 1 }, { x: 10, y: 0, z: 1 }, { x: 0, y: 10, z: 1 }, { x: 0, y: 0, z: 1 }, { x: 0, y: 0.00001, z: 5 }] });
  ok(dup.surface && dup.report.merged === 1 && dup.report.zConflicts === 1, 'duplicates joined, a different elevation at the same place reported');
}

section('TIN: planes, contours, bands, slopes');
{
  const plane = (x, y) => 100 + 0.02 * x - 0.03 * y;
  const r = rng(3), pts = [];
  for (let i = 0; i < 400; i++) { const x = r() * 500, y = r() * 300; pts.push({ x, y, z: plane(x, y) }); }
  for (const [x, y] of [[0, 0], [500, 0], [500, 300], [0, 300]]) pts.push({ x, y, z: plane(x, y) });
  const { surface: sf } = TIN.buildSurface({ points: pts });
  let worst = 0;
  for (let i = 0; i < 500; i++) { const x = r() * 500, y = r() * 300; worst = Math.max(worst, Math.abs(sf.elevationAt(x, y) - plane(x, y))); }
  ok(worst < 1e-9, 'a plane is reproduced exactly (worst ' + worst.toExponential(1) + ')');
  ok(sf.elevationAt(-1, 10) === null && sf.elevationAt(250, 301) === null, 'outside the surface: no elevation');
  const st = sf.stats();
  near(st.area2d, 150000, 1e-6, 'area2d of a 500 × 300 plane');
  near(st.area3d, 150000 * Math.hypot(1, 0.02, 0.03), 1e-4, 'area3d = area2d × √(1 + gx² + gy²)');
  near(st.minZ, plane(0, 300), 1e-9, 'min elevation');
  near(st.maxZ, plane(500, 0), 1e-9, 'max elevation');
  const cs = sf.contours(1);
  const levels = new Set(cs.map((c) => c.z));
  ok(levels.size === Math.floor(st.maxZ) - Math.ceil(st.minZ) - 1, 'one contour per whole foot strictly between min (91) and max (110) — a level touching only a corner draws nothing');
  let onLevel = true, straight = true;
  for (const c of cs) {
    for (const p of c.pts) if (Math.abs(sf.elevationAt(p.x, p.y, 1e-6) - c.z) > 1e-6) onLevel = false;
    if (c.closed) straight = false;
  }
  ok(onLevel, 'every contour vertex lies at its level');
  ok(straight && cs.every((c) => c.pts.length >= 2), 'contours on a plane are open lines');
  const slopes = sf.slopes();
  ok(slopes.every((s) => Math.abs(s.slope - Math.hypot(0.02, 0.03)) < 1e-9), 'slope of every triangle = |gradient|');
  ok(slopes.every((s) => Math.abs(U.fixed(s.dir, 6) - U.fixed(Math.atan2(0.03, -0.02), 6)) < 1e-6), 'slope arrows point downhill');
  const levelsB = [95, 97, 99, 101, 103, 105];
  const bands = sf.bands(levelsB);
  let bandArea = 0;
  const per = new Map();
  for (const b of bands) { let a = 0; const L = b.loop; for (let i = 0; i < L.length; i += 2) { const j = (i + 2) % L.length; a += L[i] * L[j + 1] - L[j] * L[i + 1]; } bandArea += a / 2; per.set(b.band, (per.get(b.band) || 0) + a / 2); }
  near(bandArea, 150000, 1e-6, 'elevation bands tile the surface (areas add up)');
  // band 99..101 on a plane: the strip between two lines
  ok(per.get(2) > 0 && per.get(2) < 150000, 'band 99–101 has some of the area');
}
{
  // pyramid: closed contours
  const pts = [{ x: 0, y: 0, z: 0 }, { x: 100, y: 0, z: 0 }, { x: 100, y: 100, z: 0 }, { x: 0, y: 100, z: 0 }, { x: 50, y: 50, z: 10 }];
  const { surface: sf } = TIN.buildSurface({ points: pts });
  const cs = sf.contours(2.5);
  ok(cs.length === 3 && cs.every((c) => c.closed), 'a pyramid gives closed contours at 2.5, 5 and 7.5 (and none at 0 or 10 on the edge/top)');
  const c5 = cs.find((c) => c.z === 5);
  let len = 0; for (let i = 1; i < c5.pts.length; i++) len += Math.hypot(c5.pts[i].x - c5.pts[i - 1].x, c5.pts[i].y - c5.pts[i - 1].y);
  near(len, 200, 1e-9, 'the 5-contour of the pyramid is a 50 × 50 square (perimeter 200)');
}

section('TIN: breaklines, boundary, edge trimming (fixture)');
const flPts = PTS.groupPoints(fx.points, 'FL');
const bls = ['FL', 'TBN', 'TBS', 'RIDGE'].map((k) => ({ name: k, pts: PTS.groupPoints(fx.points, k) }));
const plain = TIN.buildSurface({ points: fx.points }).surface;
const withBl = TIN.buildSurface({ points: fx.points, breaklines: bls });
const eg = withBl.surface;
ok(!!eg && withBl.report.constraintFailures === 0 && withBl.report.errors.length === 0, 'fixture surface with FL/TBN/TBS/RIDGE breaklines');
validate(eg, eg.constrainedEdges, 'fixture CDT');
// along the flowline the surface follows the flowline shots exactly (linear between them)
let flowWorst = 0;
for (let i = 0; i + 1 < flPts.length; i++) {
  const a = flPts[i], b = flPts[i + 1], m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, zl = (a.z + b.z) / 2;
  flowWorst = Math.max(flowWorst, Math.abs(eg.elevationAt(m.x, m.y) - zl));
}
// how many breakline pieces the plain Delaunay surface cuts across
const plainEdges = new Set();
for (let t = 0; t < plain.tris.length; t += 3) for (let k = 0; k < 3; k++) { const a = plain.tris[t + k], b = plain.tris[t + (k + 1) % 3]; plainEdges.add(Math.min(a, b) + '_' + Math.max(a, b)); }
const vid = new Map(); for (let i = 0; i < plain.X.length; i++) vid.set((plain.X[i] + plain.ox).toFixed(3) + ',' + (plain.Y[i] + plain.oy).toFixed(3), i);
let missingPieces = 0;
for (const b of bls) for (let i = 0; i + 1 < b.pts.length; i++) { const a = vid.get(b.pts[i].x.toFixed(3) + ',' + b.pts[i].y.toFixed(3)), c = vid.get(b.pts[i + 1].x.toFixed(3) + ',' + b.pts[i + 1].y.toFixed(3)); if (!plainEdges.has(Math.min(a, c) + '_' + Math.max(a, c))) missingPieces++; }
ok(missingPieces > 0, `without breaklines, ${missingPieces} of the 65 breakline pieces are not triangle edges (triangles cut across the swale banks and ridge)`);
// accuracy against the terrain formula at random spots inside the site
{
  const r = rng(11);
  let e1 = 0, e0 = 0, n = 0;
  for (let i = 0; i < 2000; i++) {
    const u = 5 + r() * 390, v = 5 + r() * 290;
    const z = FIX.terrain(u, v), a = eg.elevationAt(FIX.E0 + u, FIX.N0 + v), b = plain.elevationAt(FIX.E0 + u, FIX.N0 + v);
    e1 += Math.abs(a - z); e0 += Math.abs(b - z); n++;
  }
  ok(e1 / n < 0.25 && e1 < e0, `TIN vs the true ground: mean error ${(e1 / n).toFixed(3)} ft with breaklines, ${(e0 / n).toFixed(3)} ft without`);
}
{
  const B = [{ x: FIX.E0 + 20, y: FIX.N0 + 20 }, { x: FIX.E0 + 380, y: FIX.N0 + 20 }, { x: FIX.E0 + 380, y: FIX.N0 + 280 }, { x: FIX.E0 + 20, y: FIX.N0 + 280 }];
  const b = TIN.buildSurface({ points: fx.points, breaklines: bls, boundary: B });
  ok(!!b.surface && b.report.constraintFailures === 0, 'boundary: surface built, every boundary edge forced in');
  near(b.surface.stats().area2d, 360 * 260, 1e-6, 'boundary: area is exactly the boundary rectangle');
  ok(b.surface.elevationAt(FIX.E0 + 10, FIX.N0 + 100) === null && b.surface.elevationAt(FIX.E0 + 30, FIX.N0 + 100) !== null, 'boundary: outside has no elevation, inside does');
  near(b.surface.elevationAt(FIX.E0 + 200, FIX.N0 + 150), eg.elevationAt(FIX.E0 + 200, FIX.N0 + 150), 1e-6, 'boundary: same ground inside');
  const corner = b.surface.elevationAt(FIX.E0 + 20, FIX.N0 + 20, 1e-6);
  near(corner, eg.elevationAt(FIX.E0 + 20, FIX.N0 + 20), 1e-6, 'boundary corner takes the surface elevation there');
  const big = TIN.buildSurface({ points: fx.points, boundary: [{ x: FIX.E0 - 100, y: FIX.N0 + 150 }, { x: FIX.E0 + 200, y: FIX.N0 - 100 }, { x: FIX.E0 + 600, y: FIX.N0 + 150 }, { x: FIX.E0 + 200, y: FIX.N0 + 450 }] });
  ok(!!big.surface && big.report.notes.some((n) => /cut back/.test(n)), 'a boundary past the points is cut back to their outline (and says so)');
  const trimmed = TIN.buildSurface({ points: fx.points, breaklines: bls, maxEdge: 30 });
  ok(trimmed.surface.stats().area2d < eg.stats().area2d && trimmed.surface.stats().triangles < eg.stats().triangles, 'maximum edge length trims long outside triangles (the control points\' slivers)');
}
{
  const { pts, faces } = eg.toFaces();
  const again = TIN.surfaceFromFaces({ pts, faces });
  near(again.surface.stats().area3d, eg.stats().area3d, 1e-6, 'a TIN rebuilt from its own faces is the same surface');
  const broken = TIN.surfaceFromFaces({ pts, faces: [...faces.slice(0, 10), [0, 0, 1], [1, 2, 99999]] });
  ok(broken.surface.nT === 10 && broken.report.notes.length === 1, 'faces with missing points or no area are dropped and counted');
}

// ---------------------------------------------------------------------------
section('alignments');
{
  const a = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 500, y: 0, r: 200 }, { x: 500, y: 600 }], start: 1000 });
  ok(a.ok && a.elements.map((e) => e.type).join() === 'line,arc,line', 'tangent, curve, tangent');
  const c = a.elements[1];
  near(c.T, 200, 1e-9, 'T = R tan(Δ/2) = 200 for a 90° turn');
  near(c.len, 100 * Math.PI, 1e-9, 'L = RΔ = 314.159');
  near(c.E, 200 * (Math.SQRT2 - 1), 1e-9, 'E = R(sec(Δ/2) − 1)');
  near(c.M, 200 * (1 - Math.SQRT1_2), 1e-9, 'M = R(1 − cos(Δ/2))');
  near(c.chord, 200 * Math.SQRT2, 1e-9, 'chord = 2R sin(Δ/2)');
  ok(c.ccw === true && Math.abs(c.c.x - 300) < 1e-9 && Math.abs(c.c.y - 200) < 1e-9, 'left turn: centre at (300, 200)');
  near(a.length, 300 + 100 * Math.PI + 400, 1e-9, 'length = 300 + 314.16 + 400');
  near(c.sta, 1300, 1e-9, 'PC at 13+00');
  near(a.end, 1000 + 700 + 100 * Math.PI, 1e-9, 'end station');
  const mid = a.pointAt(c.sta + c.len / 2);
  near(Math.hypot(mid.x - 300, mid.y - 200), 200, 1e-9, 'mid-curve point on the circle');
  near(mid.x, 300 + 200 * Math.SQRT1_2, 1e-9, 'mid-curve point x');
  const pt = a.pointAt(a.end);
  ok(Math.abs(pt.x - 500) < 1e-9 && Math.abs(pt.y - 600) < 1e-9, 'end point is the last PI');
  let so = a.stationOffset(150, -10);
  near(so.sta, 1150, 1e-9, 'station of a point beside the first tangent');
  near(so.off, 10, 1e-9, 'offset right of the alignment is +');
  so = a.stationOffset(150, 25);
  near(so.off, -25, 1e-9, 'offset left is −');
  so = a.stationOffset(300 + 150 * Math.SQRT1_2, 200 - 150 * Math.SQRT1_2);   // inside the curve, on the bisector, 50 from the arc
  near(so.sta, c.sta + c.len / 2, 1e-9, 'station on the curve (bisector)');
  near(so.off, -50, 1e-9, 'inside the left-turning curve = left = −50');
  ok(a.stationOffset(-20, 3).outside === true && a.stationOffset(10, 3).outside === false, 'points before the start are flagged outside');
  let roundTrip = 0;
  for (let s = a.start; s <= a.end; s += 13.7) { const p = a.pointAt(s); for (const off of [-30, 0, 45]) { const q = { x: p.x + Math.sin(p.dir) * off, y: p.y - Math.cos(p.dir) * off }; const r = a.stationOffset(q.x, q.y); roundTrip = Math.max(roundTrip, Math.abs(r.sta - s) + Math.abs(r.off - off)); } }
  ok(roundTrip < 1e-6, 'pointAt(sta) + offset → stationOffset gives them back (worst ' + roundTrip.toExponential(1) + ')');
  const ticks = a.ticks(100);
  ok(ticks.length === 11 && ticks[0].sta === 1000 && ticks[10].sta === 2000, 'ticks every 100 ft (10+00 … 20+00)');
  const poly = a.polyline();
  near(poly[poly.length - 1].sta, a.end, 1e-9, 'polyline reaches the end station');
  const cw = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 100, y: 0, r: 50 }, { x: 100, y: -100 }] });
  ok(cw.elements[1].ccw === false && Math.abs(cw.elements[1].c.y + 50) < 1e-9, 'right turn: centre to the right');
  const over = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 100, y: 0, r: 500 }, { x: 100, y: 100, r: 500 }, { x: 0, y: 100 }] });
  ok(!over.ok && /overlap/.test(over.errors[0]), 'curves too big for their tangents are refused with the reason');
  ok(!AL.buildAlignment({ pis: [{ x: 0, y: 0 }] }).ok, 'one point is not an alignment');
  const angle = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 50 }] });
  ok(angle.ok && angle.elements.length === 2 && angle.elements.every((e) => e.type === 'line'), 'a PI without a radius is an angle point');
}

// ---------------------------------------------------------------------------
section('profiles');
{
  const p = PR.buildProfile([{ sta: 0, z: 100 }, { sta: 500, z: 110, L: 200 }, { sta: 1000, z: 100 }]);
  ok(p.ok && p.curves.length === 1, 'crest curve built');
  const c = p.curves[0];
  near(c.g1, 0.02, 1e-12, 'g1 = +2%'); near(c.g2, -0.02, 1e-12, 'g2 = −2%');
  near(c.A, -4, 1e-9, 'A = −4%'); near(c.K, 50, 1e-9, 'K = L/|A| = 50');
  ok(c.kind === 'crest' && c.high, 'crest with a high point');
  near(c.high.sta, 500, 1e-9, 'high point station (symmetric curve: at the PVI)');
  near(c.high.z, 109, 1e-9, 'high point elevation 109.00 (PVI 110 − e, e = AL/800 = 1.00)');
  near(p.elevationAt(400), 108, 1e-12, 'BVC elevation 108');
  near(p.elevationAt(450), 108 + 0.02 * 50 - 0.04 * 2500 / 400, 1e-12, 'on the curve: z = zBVC + g1 x + (g2 − g1) x²/2L');
  near(p.elevationAt(800), 104, 1e-12, 'on the tangent after the curve');
  near(p.gradeAt(450), 0.01, 1e-12, 'grade on the curve changes linearly');
  const q = PR.buildProfile([{ sta: 0, z: 100 }, { sta: 300, z: 94 }, { sta: 600, z: 97, K: 40 }, { sta: 900, z: 97 }]);
  ok(q.ok, 'sag profile with K');
  near(q.pvis[1].L || 0, 0, 0, 'no curve where none was asked');
  const kc = q.curves.find((x) => x.i === 2);
  ok(!!kc && Math.abs(kc.L - 40) < 1e-9 && kc.kind === 'crest', 'L = K·|A| = 40 × 1 at the third PVI (+1% → 0%, a crest)');
  const lowP = PR.buildProfile([{ sta: 0, z: 100 }, { sta: 400, z: 92, L: 300 }, { sta: 1000, z: 98 }]);
  const lc = lowP.curves[0];
  // g1 = −2%, g2 = +1%: x = −g1 L/(g2 − g1) = 0.02·300/0.03 = 200 from BVC (250) → 450; z = 95 − 0.02·200 + 0.03·200²/600 = 93
  near(lc.low.sta, 450, 1e-9, 'low point station 4+50 (worked by hand)');
  near(lc.low.z, 93, 1e-9, 'low point elevation 93.00');
  const bad = PR.buildProfile([{ sta: 0, z: 100 }, { sta: 100, z: 102, L: 300 }, { sta: 200, z: 100 }]);
  ok(!bad.ok && bad.errors.length >= 1, 'a vertical curve longer than its tangents is refused');
  // existing ground along an alignment on a plane
  const plane = (x, y) => 50 + 0.01 * x + 0.02 * y;
  const pts = [];
  for (let i = 0; i <= 10; i++) for (let j = 0; j <= 10; j++) pts.push({ x: i * 100, y: j * 100, z: plane(i * 100, j * 100) });
  const sf = TIN.buildSurface({ points: pts }).surface;
  const al = AL.buildAlignment({ pis: [{ x: 50, y: 50 }, { x: 900, y: 120, r: 150 }, { x: 700, y: 900 }] });
  const egp = PR.sampleSurface(sf, al);
  let w = 0; for (const s of egp) { const p = al.pointAt(s.sta); w = Math.max(w, Math.abs(s.z - plane(p.x, p.y))); }
  ok(egp.length > 500 && w < 1e-9, 'existing ground profile on a plane is exact (' + egp.length + ' samples)');
  ok(egp.some((s) => Math.abs(s.sta - al.elements[1].sta) < 1e-9), 'samples include the PC and PT');
}

// ---------------------------------------------------------------------------
section('grading and volumes');
{
  // two planes: base z = x/10 on 0..100 × 0..100, top flat at 5 → cut = fill = 12,500 (by hand: ∫50..100 (x/10 − 5) dx × 100)
  const sq = (f) => { const p = []; for (let i = 0; i <= 10; i++) for (let j = 0; j <= 10; j++) p.push({ x: i * 10, y: j * 10, z: f(i * 10, j * 10) }); return TIN.buildSurface({ points: p }).surface; };
  const base = sq((x) => x / 10), top = sq(() => 5);
  const v = GR.gridVolume(base, top, { cell: 1 });
  near(v.cut, 12500, 1e-6, 'grid volume: cut = 12,500 (plane against plane)');
  near(v.fill, 12500, 1e-6, 'grid volume: fill = 12,500');
  near(v.area, 10000, 1e-9, 'grid volume: covered area 10,000');
  const v5 = GR.gridVolume(base, top, { cell: 5 });
  near(v5.cut, 12500, 1e-6, 'a plane difference is exact at any whole-cell size (cell 5)');
}
{
  // flat ground at 0, 20 × 20 pad at +2 with 2:1 fill slopes
  const pts = [];
  for (let i = -10; i <= 10; i++) for (let j = -10; j <= 10; j++) pts.push({ x: i * 10, y: j * 10, z: 0 });
  const egf = TIN.buildSurface({ points: pts }).surface;
  const pad = { pts: [{ x: -10, y: -10 }, { x: 10, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }], z: 2, cut: 2, fill: 2 };
  const dl = GR.daylightPad(egf, pad);
  ok(!dl.problems.length && dl.rays.every((r) => r.kind === 'fill'), 'fill pad: every slope line is fill');
  ok(dl.rays.every((r) => Math.abs(r.d - 4) < 1e-6 && Math.abs(r.z) < 1e-6), 'fill pad: daylight 4 ft out (2 ft at 2:1) at elevation 0');
  const perEdge = Math.ceil(20 / (Math.hypot(20, 20) / 20)) - 1;
  ok(dl.rays.length === 4 * 10 + 4 * perEdge, `rays: 10 per corner fan (every 10°) + ${perEdge} along each edge`);
  const build = (input) => TIN.buildSurface(input);
  const g = GR.gradedSurface(egf, pts, [], [pad], build);
  ok(!!g.surface && !g.report.errors.length, 'proposed surface built');
  near(g.surface.elevationAt(3, -4), 2, 1e-9, 'proposed surface: the pad is flat at 2');
  near(g.surface.elevationAt(12, 0), 1, 1e-6, 'proposed surface: halfway down the slope = 1');
  near(g.surface.elevationAt(30, 30), 0, 1e-9, 'proposed surface: ground beyond the daylight line unchanged');
  // by hand: pad prism 20·20·2 = 800; four side wedges 20 × (½·4·2) = 320; corners: polygonal cones of 9 slices (10°),
  // base 36 · ½·4²·sin 10°, volume = base · 2/3
  const corners = 36 * 0.5 * 16 * Math.sin(Math.PI / 18) * 2 / 3;
  const want = 800 + 320 + corners;
  const v = GR.gridVolume(egf, g.surface, { region: g.regions, cell: 0.05 });
  near(v.fill, want, want * 0.002, `pad fill ${v.fill.toFixed(2)} cu ft vs ${want.toFixed(2)} by hand (prism + wedges + corner cones)`);
  ok(v.cut < 0.5, 'no cut on a fill pad');
  // cut pad on flat ground at 10, pad at 8, 3:1 → 6 ft out
  const pts2 = pts.map((p) => ({ ...p, z: 10 }));
  const eg2 = TIN.buildSurface({ points: pts2 }).surface;
  const dl2 = GR.daylightPad(eg2, { ...pad, z: 8, cut: 3, fill: 2 });
  ok(dl2.rays.every((r) => r.kind === 'cut' && Math.abs(r.d - 6) < 1e-6), 'cut pad: daylight 6 ft out (2 ft at 3:1)');
  // a pad straddling a slope: cut on the high side, fill on the low side
  const pts3 = pts.map((p) => ({ ...p, z: p.x / 10 }));
  const eg3 = TIN.buildSurface({ points: pts3 }).surface;
  const dl3 = GR.daylightPad(eg3, { ...pad, z: 0, cut: 2, fill: 2 });
  ok(dl3.rays.some((r) => r.kind === 'cut') && dl3.rays.some((r) => r.kind === 'fill'), 'a pad across a slope has both cut and fill');
  const east = dl3.rays.find((r) => Math.abs(r.x0 - 10) < 1e-9 && Math.abs(r.y0) < 9 && Math.abs(r.y - r.y0) < 1e-9);
  // ground z = x/10, pad 0 at x = 10 (ground 1, cut): design z = (x − 10)/2 meets x/10 at x = 12.5
  near(east.x, 12.5, 1e-6, 'east side: daylight where (x − 10)/2 = x/10 → x = 12.5 (by hand)');
  ok(GR.daylightPad(egf, { ...pad, pts: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }).problems.length === 1, 'a pad needs three corners');
  ok(GR.daylightPad(egf, { ...pad, pts: [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 10, y: 0 }, { x: 0, y: 10 }] }).problems.some((p) => /crosses/.test(p)), 'a self-crossing pad is refused');
  ok(GR.daylightPad(egf, { ...pad, z: 500 }).problems.some((p) => /off the surface/.test(p)), 'a pad too high for the surface says the slopes run off it');
  const L = { ...pad, pts: [{ x: -30, y: -30 }, { x: 30, y: -30 }, { x: 30, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 30 }, { x: -30, y: 30 }] };
  const dlL = GR.daylightPad(egf, L);
  const inner = dlL.rays.find((r) => Math.abs(r.x0) < 1e-9 && Math.abs(r.y0) < 1e-9);
  // concave corner: the bisector at 45°, the slope climbs at cos(45°)/2 per unit → 2 / (cos45/2) = 5.657
  near(inner.d, 2 / (Math.SQRT1_2 / 2), 1e-6, 'concave corner: daylight along the bisector where the two slopes meet');
  ok(!dlL.problems.length, 'an L-shaped pad grades without problems ' + dlL.problems.join(' '));
}
{
  // the fixture: a pad in the swale area gives both
  const pad = { pts: [{ x: FIX.E0 + 150, y: FIX.N0 + 120 }, { x: FIX.E0 + 230, y: FIX.N0 + 120 }, { x: FIX.E0 + 230, y: FIX.N0 + 180 }, { x: FIX.E0 + 150, y: FIX.N0 + 180 }], z: 254, cut: 2, fill: 3 };
  const g = GR.gradedSurface(eg, fx.points, bls, [pad], (input) => TIN.buildSurface(input));
  ok(!!g.surface && !g.report.items[0].problems.length, 'fixture pad grades onto the site');
  const v = GR.gridVolume(eg, g.surface, { region: g.regions });
  ok(v.cut > 0 && v.fill > 0, `fixture pad: cut ${U.volumeText(v.cut, 'ft')} and fill ${U.volumeText(v.fill, 'ft')} (cell ${v.cell} ft)`);
  const fine = GR.gridVolume(eg, g.surface, { region: g.regions, cell: v.cell / 4 });
  near(fine.cut, v.cut, Math.max(5, v.cut * 0.02), 'volumes settle as the grid gets finer (cut within 2%)');
}

// ---------------------------------------------------------------------------
section('corridors');
{
  const pts = [];
  for (let i = -5; i <= 25; i++) for (let j = -8; j <= 8; j++) pts.push({ x: i * 10, y: j * 10, z: 100 });
  const flat = TIN.buildSurface({ points: pts }).surface;
  const al = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 200, y: 0 }] });
  const prof = PR.buildProfile([{ sta: 0, z: 103 }, { sta: 200, z: 103 }]);
  const asm = CO.defaultAssembly('ft');
  const c = CO.corridorPatch(flat, al, prof, asm);
  ok(!c.problems.length && c.info.sections.length === 21, 'a 200 ft corridor on flat ground: 21 sections (every 10 ft)');
  const s0 = c.info.sections[5];
  // by hand: lane 12 at 2% → 102.76, shoulder 4 at 4% → 102.60, then 3:1 fill down 2.60 → 7.80 out: daylight at 23.80
  near(s0.R[1].z, 102.76, 1e-9, 'edge of lane 102.76'); near(s0.R[2].z, 102.6, 1e-9, 'edge of shoulder 102.60');
  near(Math.abs(s0.R[3].y), 23.8, 1e-6, 'right daylight 23.80 ft out (2.60 at 3:1 beyond the shoulder)');
  near(s0.L[3].y, 23.8, 1e-6, 'left daylight the same, on the left (+y for an eastbound alignment)');
  ok(s0.R[3].kind === 'fill', 'side slope in fill');
  const g = GR.gradedSurface(flat, pts, [], [{ name: 'c', patch: (sf) => CO.corridorPatch(sf, al, prof, asm) }], (input) => TIN.buildSurface(input));
  ok(!!g.surface, 'corridor graded into the ground');
  near(g.surface.elevationAt(100, 0), 103, 1e-9, 'graded surface: centreline at the profile (103.00)');
  near(g.surface.elevationAt(100, -6), 102.88, 1e-9, 'graded surface: halfway across the lane 102.88');
  near(g.surface.elevationAt(100, 20), 100 + (23.8 - 20) / 3, 1e-6, 'graded surface: on the side slope');
  near(g.surface.elevationAt(100, 40), 100, 1e-9, 'graded surface: beyond the daylight the ground is unchanged');
  // by hand per foot: 2 × [12·(3 + 2.76)/2 + 4·(2.76 + 2.60)/2 + 7.8·2.6/2] = 2 × (34.56 + 10.72 + 10.14) = 110.84 → × 200 = 22,168 cu ft
  const v = GR.gridVolume(flat, g.surface, { region: g.regions, cell: 0.1 });
  near(v.fill, 22168, 22168 * 0.003, `corridor fill ${v.fill.toFixed(0)} cu ft vs 22,168 by hand`);
  ok(v.cut < 1, 'no cut');
  const cutProf = PR.buildProfile([{ sta: 0, z: 97 }, { sta: 200, z: 97 }]);
  const cc = CO.corridorPatch(flat, al, cutProf, asm);
  // shoulder at 97 − 0.40 = 96.60, 3.40 below ground, 2:1 cut → 6.80 out → 22.80
  near(Math.abs(cc.info.sections[3].R[3].y), 22.8, 1e-6, 'in cut: daylight 22.80 out (3.40 at 2:1)');
  const curve = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 150, y: 0, r: 15 }, { x: 150, y: 50 }] });
  const tight = CO.corridorPatch(flat, curve, PR.buildProfile([{ sta: 0, z: 103 }, { sta: curve.end, z: 103 }]), asm);
  ok(tight.problems.some((p) => /cross/.test(p)), 'a curve tighter than the corridor is half wide: overlapping sections are reported');
  ok(CO.corridorPatch(flat, al, PR.buildProfile([]), asm).problems.length === 1, 'no design profile: says so');
}

// ---------------------------------------------------------------------------
section('pipe networks');
{
  const plane = (f) => { const p = []; for (let i = -2; i <= 32; i++) for (let j = -5; j <= 5; j++) p.push({ x: i * 10, y: j * 10, z: f(i * 10, j * 10) }); return TIN.buildSurface({ points: p }).surface; };
  const flat = plane(() => 100);
  const net = PI_.defaultNetwork('ft');
  net.structures = [{ id: 's1', name: 'S1', x: 0, y: 0, rim: null, sumpDepth: 0.5, dia: 48 }, { id: 's2', name: 'S2', x: 100, y: 0, rim: null, sumpDepth: 0, dia: 48 }, { id: 's3', name: 'S3', x: 200, y: 0, rim: null, sumpDepth: 0, dia: 48 }];
  net.pipes = [{ id: 'q1', name: 'P1', from: 's1', to: 's2', dia: 12, invUp: null, invDn: null }, { id: 'q2', name: 'P2', from: 's2', to: 's3', dia: 12, invUp: null, invDn: null }];
  ok(PI_.analyzeNetwork(net, flat, 'ft').problems.filter((p) => /no inverts/.test(p.msg)).length === 2, 'pipes without inverts are listed');
  const a1 = PI_.autoInverts(net, flat, 'ft');
  // by hand: P1 starts 100 − 2 cover − 1 (12") = 97.00, falls 0.5% × 100 = 0.50 → 96.50; P2 drops 0.10 in S2 → 96.40, → 95.90
  ok(a1.pipes[0].invUp === 97 && a1.pipes[0].invDn === 96.5 && a1.pipes[1].invUp === 96.4 && a1.pipes[1].invDn === 95.9, 'inverts from the rules on flat ground: 97.00 → 96.50, 96.40 → 95.90 (by hand)');
  net.pipes = a1.pipes;
  const c1 = PI_.analyzeNetwork(net, flat, 'ft');
  ok(c1.problems.length === 0, 'that network passes every check');
  near(c1.pipes.get('q1').slope, 0.005, 1e-12, 'slope = (97.00 − 96.50) / 100 = 0.50%');
  near(c1.pipes.get('q1').cover, 2, 1e-9, 'least cover on P1 = 2.00 at its upper end (100 − 98)');
  near(c1.structs.get('s1').rim, 100, 1e-9, 'rim from the surface');
  near(c1.structs.get('s1').sump, 96.5, 1e-9, 'sump = lowest invert − sump depth (97.00 − 0.50)');
  const slope = plane((x) => 100 - 0.02 * x);
  const a2 = PI_.autoInverts({ ...net, pipes: net.pipes.map((p) => ({ ...p, invUp: null, invDn: null })) }, slope, 'ft');
  // ground falls 2%: P1 follows it at minimum cover, 97.00 → 95.00; P2 starts 0.10 lower (the drop) and ends at minimum
  // cover again: ground 96.00 − 2 − 1 = 93.00 (its slope 1.90% is above the minimum)
  ok(a2.pipes[0].invUp === 97 && a2.pipes[0].invDn === 95 && a2.pipes[1].invUp === 94.9 && a2.pipes[1].invDn === 93, 'on a 2% slope the pipes follow the ground at minimum cover (97.00 → 95.00, 94.90 → 93.00, by hand)');
  const dip = plane((x) => (x > 140 && x < 160 ? 99 : 100));
  const a3 = PI_.autoInverts({ ...net, pipes: net.pipes.map((p) => ({ ...p, invUp: null, invDn: null })) }, dip, 'ft');
  const c3 = PI_.analyzeNetwork({ ...net, pipes: a3.pipes }, dip, 'ft');
  ok(c3.problems.length === 0 && c3.pipes.get('q2').cover >= 2 - 1e-9 && a3.pipes[1].invDn < 95.9, 'a dip in the ground under P2 makes it go deeper to keep 2 ft of cover');
  const bad = { ...net, pipes: [{ ...net.pipes[0], invUp: 96, invDn: 96.2 }, { ...net.pipes[1], invUp: 96.3, invDn: 96.29 }] };
  const cb = PI_.analyzeNetwork(bad, flat, 'ft');
  ok(cb.problems.some((p) => /P1 runs uphill/.test(p.msg)), 'uphill pipe flagged');
  ok(cb.problems.some((p) => /P2 at 0\.01% is flatter than the minimum 0\.50%/.test(p.msg)), 'flatter than the minimum slope flagged');
  ok(cb.problems.some((p) => /In S2, P2 leaves at 96\.30, above P1 coming in at 96\.20/.test(p.msg)), 'a pipe leaving above the incoming one flagged');
  ok(cb.problems.some((p) => /P1 has 2\.80 of cover|P2 has 2\.70 of cover/.test(p.msg)) === false, 'cover above the minimum is not flagged');
  const shallow = PI_.analyzeNetwork({ ...net, pipes: [{ ...net.pipes[0], invUp: 98.5, invDn: 98 }] }, flat, 'ft');
  ok(shallow.problems.some((p) => /P1 has 0\.50 of cover at its upper end, less than the minimum 2/.test(p.msg)), 'shallow pipe: 0.50 of cover flagged');
  const loop = { ...net, pipes: [...net.pipes, { id: 'q3', name: 'P3', from: 's3', to: 's1', dia: 12, invUp: 95, invDn: 94 }] };
  ok(PI_.analyzeNetwork(loop, flat, 'ft').problems.some((p) => /loop/.test(p.msg)) && PI_.flowOrder(loop) === null, 'a loop is flagged');
  const split = { ...net, structures: [...net.structures, { id: 's4', name: 'S4', x: 100, y: 50, rim: 101, sumpDepth: 0, dia: 48 }], pipes: [...net.pipes, { id: 'q4', name: 'P4', from: 's2', to: 's4', dia: 12, invUp: 96.3, invDn: 96 }] };
  const cs = PI_.analyzeNetwork(split, flat, 'ft');
  ok(cs.problems.some((p) => /S2 has 2 pipes leaving/.test(p.msg)), 'two pipes leaving one structure flagged');
  ok(cs.structs.get('s4').rimFrom === 'set' && cs.structs.get('s4').rim === 101, 'a rim typed in wins over the surface');
  const xmlN = LX.writeLandXml({ units: 'ft', networks: [{ ...net, structures: net.structures.map((x) => ({ ...x, rimShown: c1.structs.get(x.id).rim, sump: c1.structs.get(x.id).sump })) }] });
  const fN = path.join(OUT, 'pipes.xml');
  fs.writeFileSync(fN, xmlN);
  const rN = LX.readLandXml(xmlN).networks[0];
  ok(rN && rN.structures.length === 3 && rN.pipes.length === 2 && rN.pipes.every((p, i) => p.invUp === net.pipes[i].invUp && p.invDn === net.pipes[i].invDn && p.dia === 12), 'LandXML PipeNetworks: structures, pipes, inverts and diameters back');
  ok(rN.structures[0].rim === 100 && Math.abs(rN.structures[0].sumpDepth - 0.5) < 1e-9 && rN.structures[0].dia === 48, 'LandXML: rim, sump depth and structure size back');
  const cN = check('landxml', fN);
  ok(cN.schema === 'valid' || cN.schema === 'skipped', 'the pipe network file validates against the LandXML 1.2 XSD' + (cN.schema_errors?.length ? ': ' + cN.schema_errors.join(' | ') : ''));
  const m = PI_.defaultNetwork('m');
  ok(m.rules.minCover === 0.6 && PI_.defaultPipeDia('m') === 300, 'metric defaults (placeholders the user sets)');
}

// ---------------------------------------------------------------------------
section('LandXML out and back in');
const project = new PJ.Project();
project.setPoints(fx.points, 'site-topo.csv');
project.change('Breaklines from groups', (s) => { for (const k of ['FL', 'TBN', 'TBS', 'RIDGE']) s.surface.groups[k] = 'breakline'; s.surface.groups.CP = 'off'; });
const al = { id: 'a1', name: 'Access road', start: 1000, pis: [{ x: FIX.E0 + 10, y: FIX.N0 + 260, r: 0 }, { x: FIX.E0 + 200, y: FIX.N0 + 230, r: 120 }, { x: FIX.E0 + 300, y: FIX.N0 + 40, r: 90 }, { x: FIX.E0 + 390, y: FIX.N0 + 30, r: 0 }], pvis: [] };
project.change('Alignment', (s) => s.alignments.push(al));
{
  const a = project.alignment(project.state.alignments[0]);
  const egp = project.egProfile(project.state.alignments[0]).filter((p) => p.z !== null);
  const z0 = egp[0].z, z1 = egp[egp.length - 1].z, mid = a.start + a.length / 2;
  project.change('Profile', (s) => { s.alignments[0].pvis = [{ sta: a.start, z: Number(z0.toFixed(2)), L: 0 }, { sta: Number(mid.toFixed(2)), z: 256, L: 120 }, { sta: Number(a.end.toFixed(2)), z: Number(z1.toFixed(2)), L: 0 }]; });
}
ok(project.eg().surface && project.state.alignments[0].pvis.length === 3, 'project: surface + alignment + design profile');
const xmlText = LX.writeLandXml({
  name: 'Fixture site', units: 'ft', points: fx.points,
  surfaces: [{ name: 'EG', desc: 'Existing ground', surface: project.eg().surface, breaklines: project.egBreaklines(), boundary: null }],
  alignments: project.state.alignments.map((a) => ({ name: a.name, alignment: project.alignment(a), eg: { name: 'EG', pts: project.egProfile(a) }, profile: { name: 'FG', profile: project.designProfile(a) } })),
});
const xmlFile = path.join(OUT, 'fixture.xml');
fs.writeFileSync(xmlFile, xmlText);
const rd = LX.readLandXml(xmlText);
ok(rd.units === 'ft' && rd.linearUnit === 'USSurveyFoot', 'units: US survey feet');
ok(rd.points.length === 276 && rd.points.every((p, i) => p.n === fx.points[i].n && Math.abs(p.x - fx.points[i].x) < 1e-6 && Math.abs(p.y - fx.points[i].y) < 1e-6 && Math.abs(p.z - fx.points[i].z) < 1e-6 && p.d === fx.points[i].d), 'CgPoints: every point back (name, N/E order, elevation, description)');
const s0 = project.eg().surface, rs = rd.surfaces[0];
ok(rd.surfaces.length === 1 && rs.faces.length === s0.nT && rs.pts.length === s0.stats().points, `Surface: ${rs.pts.length} points and ${rs.faces.length} faces back`);
const rsf = TIN.surfaceFromFaces(rs).surface;
near(rsf.stats().area3d, s0.stats().area3d, 1e-3, 'Surface: the re-read TIN has the same 3D area');
{
  const r = rng(5); let w = 0;
  for (let i = 0; i < 500; i++) { const x = FIX.E0 + r() * 400, y = FIX.N0 + r() * 300; const a = s0.elevationAt(x, y), b = rsf.elevationAt(x, y); if (a !== null && b !== null) w = Math.max(w, Math.abs(a - b)); }
  ok(w < 1e-5, 'Surface: same elevations everywhere after the round trip');
}
ok(rs.breaklines.length === 4 && rs.breaklines[0].pts.length === project.egBreaklines()[0].pts.length, 'Surface: breaklines in SourceData come back');
const ra = rd.alignments[0], a0 = project.alignment(project.state.alignments[0]);
ok(rd.alignments.length === 1 && ra.name === 'Access road' && ra.start === 1000, 'Alignment: name and start station');
const ral = AL.buildAlignment({ pis: ra.pis, start: ra.start });
ok(ral.ok && ral.elements.map((e) => e.type).join() === a0.elements.map((e) => e.type).join(), 'Alignment: same lines and curves when rebuilt from the file');
near(ral.length, a0.length, 1e-5, 'Alignment: same length');
ok(ral.elements.filter((e) => e.type === 'arc').every((e, i) => Math.abs(e.r - a0.elements.filter((x) => x.type === 'arc')[i].r) < 1e-6), 'Alignment: same radii');
ok(ra.pis.every((p, i) => Math.hypot(p.x - al.pis[i].x, p.y - al.pis[i].y) < 1e-5), 'Alignment: the PIs are recovered from the curves');
const rp = ra.profiles[0], dp = project.designProfile(project.state.alignments[0]);
ok(rp && rp.pvis.length === 3 && rp.pvis.every((v, i) => Math.abs(v.sta - dp.pvis[i].sta) < 1e-6 && Math.abs(v.z - dp.pvis[i].z) < 1e-6 && Math.abs(v.L - dp.pvis[i].L) < 1e-6), 'Profile: PVIs and the 120 ft vertical curve back');
ok(ra.surfProfiles.length >= 1 && ra.surfProfiles[0].pts.length > 100, 'Profile: the existing-ground profile (ProfSurf) back');
{
  const c = check('landxml', xmlFile);
  if (c.schema === 'skipped') console.log('  (LandXML schema check skipped: no lxml — python3 -m venv tools/civilcraft-test/venv && …/pip install lxml ezdxf)');
  else ok(c.schema === 'valid', 'the file validates against the LandXML 1.2 XSD' + (c.schema_errors?.length ? ': ' + c.schema_errors.join(' | ') : ''));
  ok(c.points === 276 && c.first_point.name === '1' && Math.abs(c.first_point.n - 2079988) < 1e-6 && Math.abs(c.first_point.e - 6149985) < 1e-6, 'second reader (ElementTree): 276 points, northing first');
  ok(c.surfaces[0].F === s0.nT && c.surfaces[0].bad_refs === 0 && c.surfaces[0].breaklines === 4, 'second reader: faces refer to existing points');
  near(c.surfaces[0].area2d, s0.stats().area2d, 1e-3, 'second reader: area2DSurf');
  ok(c.alignments[0].curves === 2 && c.alignments[0].lines === 3 && Math.abs(c.alignments[0].radii[0] - 120) < 1e-9, 'second reader: 3 lines, 2 curves, R = 120');
  ok(c.alignments[0].pvis === 2 && c.alignments[0].paracurves[0] === 120, 'second reader: 2 PVIs + 1 ParaCurve of 120');
  ok(JSON.stringify(c.units) === '["Imperial:USSurveyFoot"]', 'second reader: Imperial units');
}
{
  // metric + conversions + unsupported content
  const m = LX.writeLandXml({ units: 'm', points: [{ n: 'A', x: 1, y: 2, z: 3, d: 'X & <Y>' }] });
  const r = LX.readLandXml(m);
  ok(r.units === 'm' && r.points[0].d === 'X & <Y>', 'metric file; escaped description comes back');
  const scaled = LX.scaleImport(LX.readLandXml(m), 1 / 0.3048);
  near(scaled.points[0].x, 1 / 0.3048, 1e-12, 'scaleImport converts lengths');
  const spiral = '<?xml version="1.0"?><LandXML xmlns="http://www.landxml.org/schema/LandXML-1.2" version="1.2"><Units><Metric linearUnit="meter" areaUnit="squareMeter" volumeUnit="cubicMeter" temperatureUnit="celsius" pressureUnit="milliBars"/></Units>'
    + '<Alignments><Alignment name="S" length="1" staStart="0"><CoordGeom><Line><Start>0 0</Start><End>0 10</End></Line><Spiral length="5" radiusEnd="50" radiusStart="INF" rot="cw" spiType="clothoid"><Start>0 10</Start><PI>0 12</PI><End>1 15</End></Spiral></CoordGeom></Alignment></Alignments>'
    + '<PipeNetworks/><!-- c --><CgPoints><CgPoint name="1">1 2 3</CgPoint><CgPoint name="2" pntRef="1"/></CgPoints></LandXML>';
  const sr = LX.readLandXml(spiral);
  ok(sr.alignments.length === 0 && sr.notes.some((n) => /spirals/.test(n)), 'an alignment with a spiral is skipped and named (not guessed)');
  ok(sr.notes.some((n) => /pntRef/.test(n)) && sr.points.length === 1 && sr.networks.length === 0, 'point references are named as not read; an empty pipe network gives nothing');
  let threw = false; try { LX.readLandXml('<foo/>'); } catch { threw = true; }
  ok(threw, 'XML that is not LandXML is refused');
  threw = false; try { XML.parseXml('<a><b></a>'); } catch { threw = true; }
  ok(threw, 'broken XML is refused');
  const ent = XML.parseXml('<!DOCTYPE x [<!ENTITY e SYSTEM "file:///etc/passwd">]><x a="&lt;&#65;&e;">t&amp;</x>');
  ok(ent.attrs.a === '<A&e;' && ent.text === 't&', 'entities: only the five predefined + numeric (no external entities)');
}

// ---------------------------------------------------------------------------
section('DXF (R12) and PDF');
{
  const st = project.state;
  const scene = SC.planScene({
    units: 'ft', points: fx.points, surface: project.eg().surface,
    contours: { interval: 1, major: 5, list: project.contours() }, breaklines: project.egBreaklines(),
    alignments: st.alignments.map((a) => ({ name: a.name, alignment: project.alignment(a) })), pads: [],
  }, { mmPerUnit: 25.4 / 40 });
  const majors = scene.items.filter((i) => i.layer === 'C-TOPO-MAJR'), minors = scene.items.filter((i) => i.layer === 'C-TOPO-MINR');
  ok(majors.length > 0 && minors.length > majors.length, `scene: ${majors.length} major and ${minors.length} minor contour lines`);
  ok(scene.items.some((i) => i.kind === 'text' && i.text === '255'), 'scene: major contours labelled (255)');
  ok(scene.items.some((i) => i.kind === 'text' && i.text === '11+00'), 'scene: station labels (11+00)');
  ok(scene.items.some((i) => i.kind === 'text' && /^PC 1\d\+\d\d\.\d\d$/.test(i.text)), 'scene: PC/PT labels');
  const { text, report } = DXF.writeDxf({ units: 'ft', layers: SC.LAYERS.map((l) => ({ name: l.name, color: l.aci })), entities: SC.toDxfEntities(scene, 25.4 / 40) });
  const dxfFile = path.join(OUT, 'fixture.dxf');
  fs.writeFileSync(dxfFile, text);
  ok(text.includes('AC1009') && text.trimEnd().endsWith('EOF') && !report.notes.length, 'DXF: R12 header, ends with EOF, no renamed layers');
  // own reader: group-code pairs
  const g = text.split(/\r\n/); let pairsOk = g.length % 2 === 1;
  for (let i = 0; i + 1 < g.length; i += 2) if (!/^\s*-?\d+$/.test(g[i])) { pairsOk = false; break; }
  ok(pairsOk, 'DXF: well-formed group code / value pairs');
  const c = check('dxf', dxfFile);
  if (c.skipped) console.log('  (ezdxf check skipped: no venv)');
  else {
    ok(c.version === 'AC1009' && c.errors === 0, `ezdxf reads it as R12 with no audit errors (${c.fixes} fixes)`);
    ok(c.counts.POLYLINE === scene.items.filter((i) => i.kind === 'poly').length && c.counts.ARC === 2 && c.counts.POINT === 276, `ezdxf: ${c.counts.POLYLINE} polylines, 2 arcs, 276 points`);
    ok(c.layers['C-TOPO-MAJR'] === majors.length, 'ezdxf: majors on C-TOPO-MAJR');
    const want = [...new Set(project.contours().map((x) => x.z))].sort((a, b) => a - b);
    ok(want.every((z) => c.elevations.includes(z)), 'ezdxf: contour polylines carry their elevations');
    ok(c.texts.includes('255') || c.texts.length > 0, 'ezdxf: labels are TEXT');
  }
  const ext = project.eg().surface.bounds;
  const scale = PL.fitScale('ft', ext, PL.paperBy('tabloid'));
  ok(scale.label === '1" = 40\'', 'plot: fits the site on tabloid at 1" = 40\' (' + scale.label + ')');
  const sceneP = SC.planScene({ units: 'ft', points: fx.points, surface: project.eg().surface, contours: { interval: 1, major: 5, list: project.contours() }, breaklines: [], alignments: st.alignments.map((a) => ({ name: a.name, alignment: project.alignment(a) })), pads: [] }, { mmPerUnit: scale.mmPerUnit });
  const sheet = PL.planSheet(sceneP, { extents: ext, paper: 'tabloid', scale, title: 'Fixture site — existing ground', units: 'ft', notes: ['Contours 1 ft'] });
  const pdf = await PL.toPdf(sheet, {});
  const pdfFile = path.join(OUT, 'fixture.pdf');
  fs.writeFileSync(pdfFile, pdf.bytes);
  const head = Buffer.from(pdf.bytes.slice(0, 8)).toString('latin1');
  ok(head.startsWith('%PDF-1.4') && pdf.report.missing === 0, 'PDF: header; every character printable (the em dash is in Windows-1252)');
  ok((await PL.toPdf({ ...sheet, chromeTexts: [...sheet.chromeTexts, { color: '#000000', x: 20, y: 20, h: 2, rot: 0, text: 'Δ 坂' }] })).report.missing === 2, 'PDF: characters outside Windows-1252 are counted');
  try {
    const info = execFileSync('pdfinfo', [pdfFile], { encoding: 'utf8' });
    ok(/Page size:\s+1224 x 792 pts/.test(info) && /Pages:\s+1/.test(info), 'poppler: one tabloid landscape page');
    const txt = execFileSync('pdftotext', ['-layout', pdfFile, '-'], { encoding: 'utf8' });
    ok(txt.includes('Scale 1" = 40\'') && txt.includes('11+00') && txt.includes('255'), 'poppler: scale, station and contour labels are real text');
  } catch (e) { ok(false, 'poppler could not read the PDF: ' + e.message); }
}

// ---------------------------------------------------------------------------
section('DWG (R2000–R2018) — cc-dwg (our own library), read back by independent readers');
{
  const DW = await mod('dwg-write.js');
  // the app ships byte-identical copies of lib/dwg (apps cannot import outside their build folder)
  {
    const { WRITER_FILES } = await import(pathToFileURL(path.join(REPO, 'tools/dwg-test/writer-sync.mjs')).href);
    const differ = WRITER_FILES.filter((f) => !fs.existsSync(path.join(APP, 'dwg', f)) || !fs.readFileSync(path.join(REPO, 'lib/dwg', f)).equals(fs.readFileSync(path.join(APP, 'dwg', f))));
    ok(!differ.length, `dwg/ holds byte-identical copies of the ${WRITER_FILES.length} lib/dwg files the writer needs` + (differ.length ? ' — differ: ' + differ.join(', ') + ' (node tools/dwg-test/writer-sync.mjs)' : ''));
  }
  const DWG_VERSIONS = ['AC1015', 'AC1018', 'AC1021', 'AC1024', 'AC1027', 'AC1032'];
  // bit codes against the worked examples in the ODA "Open Design Specification for .dwg files", ch. 2
  const bitStr = (w) => { let s = ''; for (let i = 0; i < w.bit; i++) s += (w.buf[i >> 3] >> (7 - (i & 7))) & 1; return s; };
  let w = new DW.BitWriter(); for (const v of [257, 0, 256, 15, 0]) w.BS(v);
  ok(bitStr(w) === '0000000001000000011011010000111110', 'BITSHORT: the spec example 257, 0, 256, 15, 0 (2.2)');
  w = new DW.BitWriter(); for (const v of [257, 0, 15, 0]) w.BL(v);
  ok(bitStr(w) === '000000000100000001000000000000000010010000111110', 'BITLONG: the spec example 257, 0, 15, 0 (2.3)');
  w = new DW.BitWriter(); w.BD(0); w.BD(1); w.BD(2.5);
  ok(bitStr(w).startsWith('1001' + '00') && w.bit === 4 + 66, 'BITDOUBLE: 0 → 10, 1 → 01, else 00 + 8 bytes (2.5)');
  w = new DW.BitWriter(); w.H(5, 0x5E7);
  ok(bitStr(w) === '010100100000010111100111', 'handle reference 5.2.05E7 (2.13 example)');
  const mc = (v) => { const b = new DW.ByteWriter(); b.MC(v); return [...b.bytes()]; };
  ok(JSON.stringify(mc(4610)) === '[130,36]' && JSON.stringify(mc(112823273)) === '[233,151,230,53]' && JSON.stringify(mc(-1413)) === '[133,75]', 'modular chars 4610, 112823273, −1413 (2.6 examples)');
  const ms = new DW.ByteWriter(); ms.MS(4650033);
  ok(JSON.stringify([...ms.bytes()]) === '[49,244,141,0]', 'modular short 4650033 (2.7 example)');
  ok(DW.crc16(0, [1]) === 0xC0C1 && DW.crc16(0, [2]) === 0xC181 && DW.crc16(0, [3]) === 0x0140 && DW.crc16(0, [255]) === 0x4040, 'CRC-16 table matches the spec (2.14.1)');
  w = new DW.BitWriter(); w.TV('AB');
  ok(JSON.stringify([...w.bytes()]) === JSON.stringify([...(() => { const x = new DW.BitWriter(); x.BS(3); x.RC(65); x.RC(66); x.RC(0); return x.bytes(); })()]), 'text: length counts the closing NUL');
  ok(String.fromCharCode(...DW.encode1252('°Ω€')) === '°\\U+03A9\\U+20AC', 'text: Latin-1 as bytes, the rest as \\U+XXXX');

  // ---- the drawings
  const st = project.state;
  const scene = SC.planScene({
    units: 'ft', points: fx.points, surface: project.eg().surface,
    contours: { interval: 1, major: 5, list: project.contours() }, breaklines: project.egBreaklines(),
    alignments: st.alignments.map((a) => ({ name: a.name, alignment: project.alignment(a) })), pads: [],
  }, { mmPerUnit: 25.4 / 40 });
  const layersOf = SC.LAYERS.map((l) => ({ name: l.name, color: l.aci }));
  const cases = [];
  cases.push({ name: 'fixture', units: 'ft', layers: layersOf, entities: SC.toDxfEntities(scene, 25.4 / 40) });
  cases.push({
    name: 'every-kind', units: 'm', layers: [{ name: 'Lay/er:1', color: 3 }, { name: 'Lay_er_1', color: 4 }, { name: 'Pads', color: 'blue' }],
    entities: [
      { type: 'line', layer: 'Lay/er:1', a: { x: -12.5, y: 3.25, z: 1.5 }, b: { x: 100.125, y: -7, z: -2 } },
      { type: 'line', layer: 'Lay_er_1', a: { x: 0, y: 0 }, b: { x: 0, y: 10 } },
      { type: 'poly', layer: 'Pads', pts: [{ x: 1, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 4 }], closed: true },
      { type: 'poly', layer: 'C-TOPO-MAJR', pts: [{ x: 0.1, y: 0.2 }, { x: 0.1, y: 0.3 }, { x: 0.4, y: 0.3 }], elev: -3.75 },
      { type: 'poly', layer: 'Pads', pts: [{ x: 1, y: 1 }] },
      { type: 'poly3d', layer: 'C-TOPO-BRKL', pts: [{ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 }, { x: 7, y: 9, z: 8 }], closed: true },
      { type: 'arc', layer: 'C-ROAD-CNTR', c: { x: 50, y: 60 }, r: 12.5, a0: 5.5, a1: 0.5 },
      { type: 'circle', layer: 'C-STRM-STRC', c: { x: -5, y: -6 }, r: 0.6 },
      { type: 'point', layer: 'V-NODE', x: 3, y: 4, z: -1.25 },
      { type: 'text', layer: 'V-NODE-TEXT', x: 10, y: 20, h: 1.5, rot: 0, text: 'Left 12° ±0.5 Ω € — ½', align: 'left' },
      { type: 'text', layer: 'C-ROAD-STAN', x: 11, y: 21, h: 2, rot: 1.25, text: '11+00', align: 'center' },
      { type: 'text', layer: 'C-ROAD-STAN', x: 12, y: 22, h: 2.5, rot: -0.5, text: 'PC 12+34.56', align: 'right' },
    ],
  });
  {
    const ents = [], layers = [];
    for (let i = 0; i < 300; i++) layers.push({ name: 'L' + i, color: 1 + (i % 255) });
    let s = 7; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < 70000; i++) ents.push({ type: 'point', layer: 'L' + (i % 300), x: 6.2e6 + r() * 1e4, y: 2.1e6 + r() * 1e4, z: r() * 100 });
    ents.push({ type: 'poly', layer: 'L1', pts: Array.from({ length: 20000 }, (_, i) => ({ x: i * 0.5, y: Math.sin(i / 100) * 50 })), elev: 250.5 });
    ents.push({ type: 'poly3d', layer: 'L2', pts: Array.from({ length: 3000 }, (_, i) => ({ x: i, y: Math.cos(i / 30) * 9, z: i / 10 })) });
    cases.push({ name: 'big', units: 'ft', layers, entities: ents });
  }
  const t0 = Date.now();
  const files = [];   // every drawing in every version: { c, v, file, bytes, report }
  for (const c of cases) {
    for (const v of DWG_VERSIONS) {
      const { bytes, report } = DW.writeDwg({ units: c.units, layers: c.layers, entities: c.entities, created: new Date(Date.UTC(2026, 9, 10, 12)), version: v });
      const f = { c, v, bytes, report, file: path.join(OUT, `${c.name}-${v}.dwg`) };
      fs.writeFileSync(f.file, bytes);
      files.push(f);
      if (v === 'AC1015') { c.bytes = bytes; c.report = report; c.file = f.file; }
    }
  }
  const big = cases[2];
  ok(Date.now() - t0 < 60000, `writing all three in all ${DWG_VERSIONS.length} versions took ${Date.now() - t0} ms (the big one: ${big.report.objects} objects, ${(big.bytes.length / 1048576).toFixed(1)} MB as R2000)`);
  for (const f of files) ok(new TextDecoder().decode(f.bytes.subarray(0, 6)) === f.v, `${f.c.name}-${f.v}: starts ${f.v}`);
  ok(cases[1].report.notes.some((n) => /1 item was left out/.test(n)) && cases[1].report.notes.some((n) => /2 layer names were changed/.test(n)), 'every-kind: the one-point polyline left out and two layer names changed, both reported');
  ok(cases[1].report.layers.some((l) => l.name === 'Lay_er_1_2'), 'every-kind: a cleaned name that collides gets a suffix');
  ok(big.report.objects > 65536, 'big: more than 65,536 objects (three-byte handles, a many-page object map)');

  // what each drawing should read back as
  const deg = (a) => { let d = a * 180 / Math.PI % 360; if (d < 0) d += 360; return d; };
  const expected = (c) => {
    const ren = new Map(c.report.layers.map((l, i) => [i, l.name]));
    const nameOf = (n) => { const i = [{ name: '0' }, ...c.layers].findIndex((l) => l.name === n); return i >= 0 ? ren.get(i) : n; };
    const out = [];
    for (const e of c.entities) {
      const layer = nameOf(e.layer);
      if (e.type === 'poly') { if (e.pts.length >= 2) out.push({ t: 'lwpoly', layer, closed: !!e.closed, elev: e.elev || 0, pts: e.pts.map((p) => [p.x, p.y]) }); }
      else if (e.type === 'poly3d') out.push({ t: 'poly3d', layer, closed: !!e.closed, pts: e.pts.map((p) => [p.x, p.y, p.z || 0]) });
      else if (e.type === 'line') out.push({ t: 'line', layer, a: [e.a.x, e.a.y, e.a.z || 0], b: [e.b.x, e.b.y, e.b.z || 0] });
      else if (e.type === 'arc') out.push({ t: 'arc', layer, c: [e.c.x, e.c.y], r: e.r, a0: deg(e.a0), a1: deg(e.a1) });
      else if (e.type === 'circle') out.push({ t: 'circle', layer, c: [e.c.x, e.c.y], r: e.r });
      else if (e.type === 'point') out.push({ t: 'point', layer, p: [e.x, e.y, e.z || 0] });
      else if (e.type === 'text') out.push({ t: 'text', layer, text: e.text, at: [e.x, e.y], h: e.h, rot: deg(e.rot || 0), halign: e.align === 'center' ? 1 : e.align === 'right' ? 2 : 0 });
    }
    return out;
  };
  // compare a reader's entities with the expected list: same order, kinds, layers, coordinates, text
  const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a));
  const closeArr = (a, b, tol) => a.length === b.length && a.every((v, i) => close(v, b[i], tol));
  const angle = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d) < 1e-9; };
  function compare(exp, got, { dropLast3d = false } = {}) {
    if (exp.length !== got.length) return `${got.length} entities, expected ${exp.length}`;
    for (let i = 0; i < exp.length; i++) {
      const e = exp[i], g = got[i], at = `#${i} ${e.t}`;
      if (g.t !== e.t) return `${at}: read as ${g.t}`;
      if (g.layer !== e.layer) return `${at}: layer ${g.layer}, expected ${e.layer}`;
      let pts = e.pts;
      if (e.t === 'poly3d' && dropLast3d) pts = pts.slice(0, -1);
      if (pts) {
        if (g.pts.length !== pts.length) return `${at}: ${g.pts.length} vertices, expected ${pts.length}`;
        for (let k = 0; k < pts.length; k++) if (!closeArr(pts[k], g.pts[k], 1e-12)) return `${at}: vertex ${k} ${g.pts[k]} vs ${pts[k]}`;
        if (g.closed !== e.closed) return `${at}: closed ${g.closed}`;
        if (e.t === 'lwpoly' && !close(g.elev, e.elev)) return `${at}: elevation ${g.elev} vs ${e.elev}`;
      }
      if (e.t === 'line' && !(closeArr(e.a, g.a, 1e-12) && closeArr(e.b, g.b, 1e-12))) return `${at}: ends ${g.a} ${g.b}`;
      if ((e.t === 'arc' || e.t === 'circle') && !(closeArr(e.c, g.c, 1e-12) && close(e.r, g.r))) return `${at}: centre/radius ${g.c} ${g.r}`;
      if (e.t === 'arc' && !(angle(e.a0, g.a0) && angle(e.a1, g.a1))) return `${at}: angles ${g.a0} ${g.a1} vs ${e.a0} ${e.a1}`;
      if (e.t === 'point' && !closeArr(e.p, g.p, 1e-12)) return `${at}: ${g.p}`;
      if (e.t === 'text') {
        if (g.text !== e.text) return `${at}: text ${JSON.stringify(g.text)} vs ${JSON.stringify(e.text)}`;
        if (!(closeArr(e.at, g.at, 1e-12) && close(e.h, g.h) && angle(e.rot, g.rot) && e.halign === g.halign)) return `${at}: placement ${g.at} h ${g.h} rot ${g.rot} halign ${g.halign}`;
      }
    }
    return '';
  }
  {
    // the comparison itself must notice a wrong vertex, text or layer
    const e = expected(cases[1]);
    const bad1 = structuredClone(e); bad1[2].pts[1][0] += 1e-6;
    const bad2 = structuredClone(e); bad2[8].text += 'x';
    const bad3 = structuredClone(e); bad3[0].layer = 'X';
    ok(!compare(e, structuredClone(e)) && compare(e, bad1) && compare(e, bad2) && compare(e, bad3), 'the reader comparison catches a 1e-6 vertex shift, a changed label and a wrong layer');
  }
  const layersMatch = (c, got) => c.report.layers.every((l) => got.some((g) => g.name === l.name && g.color === l.color)) ? '' : 'layers/colours differ';

  // ---- reader 1: the vendored libredwg-web (LibreDWG → WASM), in this process
  // A test-only black box: a clone has it only with `npm test -- --oracles` (PROVENANCE.md); without it these checks skip.
  const LDIR = path.join(VENDOR, 'libredwg-web/current');
  let lw = null;
  try { lw = await import(pathToFileURL(path.join(LDIR, 'dist/libredwg-web.js')).href); } catch (e) {
    console.log('  (skipped: the libredwg-web oracle is not in this checkout — npm test -- --oracles fetches it)');
  }
  const msgs = [];
  const quietly = async (fn) => { const l = console.log, wn = console.warn, er = console.error; console.log = console.warn = console.error = (...a) => msgs.push(a.join(' ')); try { return await fn(); } finally { console.log = l; console.warn = wn; console.error = er; } };
  const LW = lw ? await quietly(() => lw.LibreDwg.create(LDIR + '/wasm/')) : null;
  const fromLibredwgWeb = (db) => db.entities.map((e) => {
    const layer = e.layer;
    switch (e.type) {
      case 'LWPOLYLINE': return { t: 'lwpoly', layer, closed: !!(e.flag & 512), elev: e.elevation || 0, pts: e.vertices.map((v) => [v.x, v.y]) };
      case 'POLYLINE3D': return { t: 'poly3d', layer, closed: !!(e.flag & 1), pts: e.vertices.map((v) => [v.x, v.y, v.z]) };
      case 'LINE': return { t: 'line', layer, a: [e.startPoint.x, e.startPoint.y, e.startPoint.z], b: [e.endPoint.x, e.endPoint.y, e.endPoint.z] };
      case 'ARC': return { t: 'arc', layer, c: [e.center.x, e.center.y], r: e.radius, a0: deg(e.startAngle), a1: deg(e.endAngle) };
      case 'CIRCLE': return { t: 'circle', layer, c: [e.center.x, e.center.y], r: e.radius };
      case 'POINT': return { t: 'point', layer, p: [e.position.x, e.position.y, e.position.z] };
      case 'TEXT': return { t: 'text', layer, text: e.text, at: e.halign ? [e.endPoint.x, e.endPoint.y] : [e.startPoint.x, e.startPoint.y], h: e.textHeight, rot: deg(e.rotation), halign: e.halign };
      default: return { t: e.type, layer };
    }
  });
  for (const { c, v, bytes } of LW ? files : []) {
    msgs.length = 0;
    const raw = await quietly(() => LW.dwg_read_data(bytes, lw.Dwg_File_Type.DWG));
    const db = raw ? await quietly(() => LW.convert(raw)) : null;
    if (raw) LW.dwg_free(raw);
    // libredwg-web 0.7.17 flags VALUEOUTOFBOUNDS (error code 64) on every R2004+ file — AutoCAD's own samples
    // (testfiles/dwg-samples/example_2004 … 2018.dwg) included — while reading them in full; R2000 must be clean
    const problems = msgs.filter((m) => /error|warn/i.test(m) && !(v !== 'AC1015' && /error code: 64$/.test(m)));
    if (!db) continue;
    // libredwg-web 0.7.17 returns one vertex too few for every R2000 3D polyline — files saved by AutoCAD
    // included (checked on LibreDWG's example_2000.dwg); from R2004 (vertices listed by their owner) it reads all
    const diff = compare(expected(c), fromLibredwgWeb(db), { dropLast3d: v === 'AC1015' });
    ok(!diff, `libredwg-web: ${c.name}-${v} — every entity, layer, coordinate and text as written` + (diff ? ' — ' + diff : ''));
    ok(!layersMatch(c, db.tables.LAYER.entries.map((l) => ({ name: l.name, color: l.colorIndex }))), `libredwg-web: ${c.name}-${v} — ${c.report.layers.length} layers with their colours`);
    if (c.name === 'fixture' && v === 'AC1015') {
      ok(db.header.INSUNITS === 2 && db.header.EXTMIN && Math.abs(db.header.EXTMIN.x - Math.min(...fx.points.map((p) => p.x))) < 200, 'libredwg-web: fixture — INSUNITS feet, extents in state-plane coordinates');
      const contourZ = new Set(project.contours().map((x) => x.z));
      ok(db.entities.filter((e) => e.type === 'LWPOLYLINE' && /TOPO-M/.test(e.layer)).every((e) => contourZ.has(e.elevation)), 'libredwg-web: fixture — every contour is an LWPOLYLINE at its contour elevation');
    }
  }

  // ---- readers 2–4: LibreDWG CLI, libdxfrw, ODA File Converter (tools/civilcraft-test/setup-dwg-readers.sh)
  const { availableReaders } = await import(pathToFileURL(path.join(TOOLS, 'dwg-readers.mjs')).href);
  const readers = availableReaders(TOOLS);
  if (!readers.length) console.log('  (independent DWG readers not installed: sh tools/civilcraft-test/setup-dwg-readers.sh)');
  // LibreDWG's dwg2dxf writes these R2004+ layer colours as other indexes — for the ODA File Converter's own R2004
  // file of the same drawing too (tools/dwg-test/writer-check.mjs): a reader quirk, not the file
  const LIBREDWG_LAYER_ACI = { 79: 178, 104: 176, 129: 174, 189: 172, 255: 5 };
  for (const rd of readers) {
    const res = rd.run(files.map((f) => f.file), OUT);
    for (const { c, v, file } of files) {
      const r = res.get(file);
      ok(!r.problems.length, `${rd.name} opens ${c.name}-${v}.dwg with no errors` + (r.problems.length ? ': ' + r.problems.slice(0, 3).join(' | ') : ''));
      if (r.problems.length || !fs.existsSync(r.dxf)) continue;
      const d = JSON.parse(execFileSync(python, [path.join(TOOLS, 'check.py'), 'dxfdump', r.dxf, ...(r.encoding ? [r.encoding] : [])], { encoding: 'utf8', maxBuffer: 1 << 30 }));
      if (d.skipped) { console.log('  (ezdxf missing: no venv)'); break; }
      const got = d.entities.map((e) => e.t === 'text' ? { ...e, at: e.halign ? e.align : e.ins } : e);
      const diff = compare(expected(c), got);
      ok(!diff, `${rd.name}: ${c.name}-${v} — every entity, layer, coordinate and text as written` + (diff ? ' — ' + diff : ''));
      const quirk = /LibreDWG/.test(rd.name) && v !== 'AC1015';
      const layers = d.layers.map((l) => { const want = c.report.layers.find((x) => x.name === l.name); return quirk && want && LIBREDWG_LAYER_ACI[want.color] === Math.abs(l.color) ? { ...l, color: want.color } : l; });
      ok(!layersMatch(c, layers) && d.insunits === (c.units === 'm' ? 6 : 2) && d.measurement === (c.units === 'm' ? 1 : 0), `${rd.name}: ${c.name}-${v} — layers with colours, units ${c.units}`);
    }
  }
}

// ---------------------------------------------------------------------------
section('project: undo and the project file');
{
  const p = new PJ.Project();
  p.setPoints(fx.points, 'site-topo.csv');
  const t0 = p.eg().surface.nT;
  p.change('FL breakline', (s) => { s.surface.groups.FL = 'breakline'; });
  const t1 = p.eg().surface;
  ok(t1.constrainedEdges.length === 20, 'marking FL a breakline forces its 20 pieces in');
  ok(p.undo() === 'FL breakline' && p.eg().surface.nT === t0 && p.eg().surface.constrainedEdges.length === 0, 'undo puts the surface back');
  ok(p.redo() === 'FL breakline' && p.eg().surface.constrainedEdges.length === 20, 'redo');
  ok(!p.change('nothing', () => {}), 'a change that changes nothing is not an undo step');
  p.change('Pad', (s) => s.pads.push({ id: 'p1', name: 'Pad A', pts: [{ x: FIX.E0 + 150, y: FIX.N0 + 120 }, { x: FIX.E0 + 230, y: FIX.N0 + 120 }, { x: FIX.E0 + 230, y: FIX.N0 + 180 }, { x: FIX.E0 + 150, y: FIX.N0 + 180 }], z: 254, cut: 2, fill: 3 }));
  const gr = p.graded();
  ok(!!gr.surface && gr.items[0].daylight.length > 0, 'project: graded surface + daylight line');
  const vol = p.volumes();
  ok(vol && vol.cut > 0 && vol.fill > 0, 'project: volumes inside the daylight line');
  const json = JSON.parse(JSON.stringify(p.toJSON()));
  const { project: q, notes } = PJ.Project.fromJSON(json);
  ok(!notes.length && q.points.length === 276 && q.state.pads.length === 1 && q.state.surface.groups.FL === 'breakline', 'project file round trip');
  near(q.volumes().cut, vol.cut, 1e-6, 'reopened project gives the same cut');
  {
    const r2 = PJ.Project.fromJSON(JSON.parse(JSON.stringify({ ...p.toJSON(), network: { name: 'Storm', type: 'storm', rules: { minSlope: 0.005, minCover: 2, minDrop: 0.1 }, structures: [{ id: 's1', name: 'S1', x: FIX.E0 + 50, y: FIX.N0 + 50, rim: null, sumpDepth: 0, dia: 48 }, { id: 's2', name: 'S2', x: FIX.E0 + 150, y: FIX.N0 + 60, rim: null, sumpDepth: 0, dia: 48 }], pipes: [{ id: 'q3', name: 'P1', from: 's1', to: 's2', dia: 15, invUp: 250, invDn: 249 }, { id: 'q4', name: 'bad', from: 's1', to: 's9' }] } })));
    ok(r2.project.state.network.pipes.length === 1 && r2.notes.some((n) => /1 pipes could not be read/.test(n)) && r2.project.networkCheck().pipes.get('q3').slope > 0, 'project file: pipe network read, a pipe to a missing structure dropped');
  }
  json.pads.push({ id: 'x', pts: [{ x: 'a' }], z: NaN }); json.points.push(['bad', 'x', null]); json.surface.groups.EVIL = '<script>'; json.name = 'A\u0000B';
  const t = PJ.Project.fromJSON(json);
  ok(t.project.state.pads.length === 1 && t.notes.length === 1 && !('EVIL' in t.project.state.surface.groups) && t.project.state.name === 'A B', 'a tampered project file is cleaned (bad pad, point, group value, control characters)');
  let threw = false; try { PJ.Project.fromJSON({ format: 'nope' }); } catch { threw = true; }
  ok(threw, 'not a project file → refused');
}

// ---------------------------------------------------------------------------
section('copy and paste of survey points (clip.js + project.editPoints)');
{
  const P = (n, x, y, z, d = 'GRD') => ({ n: String(n), x, y, z, d });
  // renumbering: never clash, keep free numbers, say how
  const have = [P(1, 0, 0, 1), P(2, 1, 0, 1), P(10, 2, 0, 1), P('CP1', 3, 0, 1)];
  const r1 = CL.renumber([P(1, 5, 5, 1), P(2, 6, 5, 1), P(3, 7, 5, 1)], have);
  ok(r1.points.map((p) => p.n).join() === '11,12,3' && r1.kept === 1 && r1.changed.length === 2, 'clash mode: 1 and 2 are taken → 11, 12 (after the highest, 10); 3 is free → kept');
  ok(CL.renumberText(r1.changed, r1.kept) === '1 kept its number; 2 got new numbers: 1–2 became 11–12', 'the renumbering is said: ' + CL.renumberText(r1.changed, r1.kept));
  const r2 = CL.renumber([P(3, 0, 0, 1), P(4, 0, 0, 1)], have, { mode: 'always' });
  ok(r2.points.map((p) => p.n).join() === '11,12' && r2.kept === 0, 'always mode: every pasted point gets a new number');
  const r3 = CL.renumber([P(1, 0, 0, 1), P(2, 0, 0, 1), P(3, 0, 0, 1)], [...have, P(1001, 0, 0, 1)], { mode: 'always', start: 1000 });
  ok(r3.points.map((p) => p.n).join() === '1000,1002,1003', 'a start number counts up from it, skipping 1001 (taken)');
  const r4 = CL.renumber([P('CP1', 0, 0, 1), P('CP1', 1, 1, 1)], have);
  ok(r4.points[0].n === '11' && r4.points[1].n === '12', 'named points that clash get whole numbers too');
  const r5 = CL.renumber([P(20, 0, 0, 1), P(20, 1, 1, 1), P(21, 2, 2, 1)], have);
  ok(r5.points.map((p) => p.n).join() === '20,22,21' && new Set(r5.points.map((p) => p.n)).size === 3, 'two pasted points with one number: the second is renumbered past the highest kept (22)');
  let unique = true;
  { const base = fx.points; for (let k = 0; k < 3; k++) { const r = CL.renumber(base, base, { mode: k ? 'always' : 'clash', start: k === 2 ? 5 : null }); const all = new Set([...base.map((p) => p.n), ...r.points.map((p) => p.n)]); if (all.size !== base.length * 2) unique = false; } }
  ok(unique, 'pasting all 276 fixture points onto themselves (3 ways): 552 distinct numbers every time');

  // point rows for a spreadsheet, and back through the import parser
  const tricky = [P(5, 6150000.1234, 2080000.5, 250.25, 'TREE, 12" OAK'), P(6, 6150010, 2080001, null, '=HYPERLINK("x")'), P(7, -1.5, -2.25, -3, '-5 OFFSET')];
  const csv = CL.pointsText(tricky, 'PNEZD');
  ok(csv.split('\r\n')[0] === '5,2080000.5,6150000.123,250.25,"TREE, 12"" OAK"', 'P,N,E,Z,D row: northing first, 3 decimals, quoted description: ' + csv.split('\r\n')[0]);
  ok(csv.split('\r\n')[1].startsWith('6,2080001,6150010,,"\'=HYPERLINK'), 'a description a spreadsheet would run as a formula gets a leading \'; no elevation = empty cell');
  ok(csv.split('\r\n')[2] === '7,-2.25,-1.5,-3,-5 OFFSET', 'negative numbers and a description starting with a number are left alone');
  const penz = CL.pointsText(tricky, 'PENZD');
  ok(penz.split('\r\n')[0].startsWith('5,6150000.123,2080000.5,'), 'P,E,N,Z,D row: easting first');
  const back1 = CL.textPoints(csv, 'PNEZD').points;
  ok(back1.length === 3 && back1[0].x === 6150000.123 && back1[0].y === 2080000.5 && back1[0].d === 'TREE, 12" OAK' && back1[1].z === null && back1[1].d === '=HYPERLINK("x")', 'the rows read back through parsePoints: same points, the leading \' dropped');
  const back2 = CL.textPoints(penz, 'PENZD').points;
  ok(back2[0].x === 6150000.123 && back2[0].y === 2080000.5, 'P,E,N,Z,D rows read back with the PENZD setting');
  const tsv = '101\t5000.5\t1000.25\t99.5\tEP\n102\t5010\t1001\t99.7\tEP\n';
  ok(CL.textPoints(tsv, 'PNEZD').points[0].y === 5000.5 && CL.textPoints(tsv, 'PENZD').points[0].x === 5000.5, 'tab-separated rows from a spreadsheet: the point row setting decides N/E when there is no header');
  const hdr = CL.textPoints('Point,Easting,Northing,Elevation,Description\n1,10,20,30,A\n', 'PNEZD').points;
  ok(hdr[0].x === 10 && hdr[0].y === 20, 'a header row wins over the setting');
  const imp = PTS.parsePoints('1,5000,1000,10,A\n2,5001,1001,11,B\n', { prefer: 'PENZD' });
  ok(imp.format === 'PENZD' && imp.formatFrom === 'columns' && imp.points[0].x === 5000, 'parsePoints prefer PENZD: the import guess follows the setting');

  // the clipboard object: made, stored, read back as untrusted
  const c = CL.makeClip(tricky, { units: 'm', order: 'PNEZD', source: 'tab1' });
  const rc = CL.readClip(JSON.parse(JSON.stringify(c)));
  ok(rc && rc.points.length === 3 && rc.units === 'm' && rc.points[1].z === null && rc.csv === csv, 'makeClip → JSON → readClip round trip (units, null elevation, the rows text)');
  const evil = { format: 'civilcraft-clip', v: 1, units: '<script>', at: 'x', source: 'a\u0000b', pts: [['1\u0007', 'NaN', 2, 3, 'x'], ['2', 1, Infinity, 3, 'x'], ['3', 1, 2, 1e12, 'y'], ['4', 1, 2, 'z', 'D\u0000<b>' + 'x'.repeat(500)], ['4', 5, 6, 7, 'dupe'], 'junk', null, ['', 1, 2, 3, ''], ['5', 2e9, 0, 0, '']], csv: 42 };
  const re = CL.readClip(evil);
  ok(re && re.points.length === 2 && re.points[0].n === '3' && re.points[0].z === null && re.points[1].n === '4' && re.points[1].z === null && re.points[1].d.length === 200 && !/[\u0000-\u001f]/.test(re.points[1].d) && re.units === 'ft' && re.csv === '' && re.at === 0, 'a tampered clipboard is cleaned: bad coordinates, duplicates, junk rows, control characters, long text, bad units dropped');
  ok(CL.readClip({ format: 'civilcraft-clip', v: 2, pts: [['1', 1, 2, 3, '']] }) === null && CL.readClip({ format: 'other', v: 1, pts: [] }) === null && CL.readClip('x') === null && CL.readClip({ format: 'civilcraft-clip', v: 1, pts: [['1', 'a', 'b']] }) === null && CL.readClip({ format: 'civilcraft-clip', v: 1, pts: { length: 5 } }) === null, 'not a clip, a newer format, or nothing usable → refused (null)');

  // which paste: our copy, or newer text on the system clipboard
  ok(CL.choosePaste(rc, rc.csv).kind === 'clip', 'system clipboard holds our own rows → our copy is used');
  ok(CL.choosePaste(rc, rc.csv.replace(/\r\n/g, '\n') + '\n\n').kind === 'clip', '… also after a spreadsheet changed the line endings');
  const ch = CL.choosePaste(rc, tsv);
  ok(ch.kind === 'text' && ch.points.length === 2 && ch.points[0].n === '101', 'different point rows on the system clipboard (copied later) win');
  ok(CL.choosePaste(rc, 'hello world').kind === 'clip' && CL.choosePaste(rc, null).kind === 'clip' && CL.choosePaste(rc, '').kind === 'clip', 'text that is not points, or an unreadable clipboard → our copy');
  ok(CL.choosePaste(null, tsv).kind === 'text', 'no copy of our own → point rows from the clipboard');
  const none = CL.choosePaste(null, 'hello');
  ok(none.kind === 'none' && /no points could be read/.test(none.why) && CL.choosePaste(null, null).kind === 'none', 'nothing usable anywhere → nothing pasted, with the reason');
  ok(JSON.stringify(CL.centre([P(1, 0, 0, 0), P(2, 10, 4, 0)])) === '{"x":5,"y":2}' && CL.moveBy([P(1, 1, 1, 0)], 2, 3)[0].x === 3, 'centre and moveBy');

  // in the project: paste, cut, duplicate, delete are undo steps and the surface rebuilds
  const p = new PJ.Project();
  p.setPoints(fx.points, 'site-topo.csv');
  p.change('FL breakline', (s) => { s.surface.groups.FL = 'breakline'; });
  const nT0 = p.eg().surface.nT, v0 = p.pointsVersion;
  const pick = p.points.filter((q) => ['10', '11', '12'].includes(q.n));
  ok(pick.every((q) => PTS.groupKey(q.d) === 'GRD'), 'points 10–12 are ground shots (GRD)');
  const pr = CL.renumber(CL.moveBy(pick, 500, 0), p.points);
  ok(p.editPoints('Paste 3 points', (all) => all.concat(pr.points)), 'editPoints: a paste is one step');
  ok(p.points.length === 279 && pr.points.map((q) => q.n).join() === '277,278,279', 'pasted 3 copies as 277–279 (the fixture runs 1–276)');
  ok(p.pointsVersion > v0 && p.eg().surface.nT > nT0 && p.eg().surface.bounds.maxX >= Math.max(...pr.points.map((q) => q.x)) - 1e-6, 'the surface was rebuilt and reaches the pasted points (' + nT0 + ' → ' + p.eg().surface.nT + ' triangles)');
  ok(p.undo() === 'Paste 3 points' && p.points.length === 276 && p.eg().surface.nT === nT0, 'undo removes the pasted points and the surface is as before');
  ok(p.redo() === 'Paste 3 points' && p.points.length === 279 && p.points.some((q) => q.n === '279'), 'redo pastes them again');
  ok(p.state.surface.groups.FL === 'breakline', 'undo/redo of points keep the breakline groups');
  const gone = new Set(['1', '2', '3']);
  p.editPoints('Cut 3 points', (all) => all.filter((q) => !gone.has(q.n)));
  ok(p.points.length === 276 && !p.points.some((q) => q.n === '1'), 'cut: the points are gone');
  const back3 = CL.renumber(fx.points.filter((q) => gone.has(q.n)), p.points);
  ok(back3.kept === 3 && back3.points.map((q) => q.n).join() === '1,2,3', 'cut then paste: their numbers are free again, so they keep them');
  p.editPoints('New code', (all) => all.concat([P(900, FIX.E0 + 10, FIX.N0 + 10, 251, 'MH RIM')]));
  ok(p.state.surface.groups.MH === 'points' && p.groups().some((g) => g.key === 'MH'), 'a pasted description code becomes a point group (as on import)');
  ok(p.undo() === 'New code' && !('MH' in p.state.surface.groups), 'undo takes the new group away again');
  p.change('Pad', (s) => s.pads.push({ id: 'p1', name: 'Pad A', pts: [{ x: FIX.E0 + 150, y: FIX.N0 + 120 }, { x: FIX.E0 + 230, y: FIX.N0 + 120 }, { x: FIX.E0 + 230, y: FIX.N0 + 180 }], z: 254, cut: 2, fill: 3 }));
  ok(p.undo() === 'Pad' && p.undo() === 'Cut 3 points' && p.points.length === 279 && p.state.pads.length === 0, 'state steps and point steps undo in order');
  ok(p.redo() === 'Cut 3 points' && p.points.length === 276 && p.redo() === 'Pad' && p.state.pads.length === 1, 'and redo in order');
  ok(p.dirty, 'point edits make the project unsaved');
  const json = JSON.parse(JSON.stringify(p.toJSON()));
  ok(PJ.Project.fromJSON(json).project.points.length === 276, 'the project file keeps the edited points');
  // scene: what a point label shows (Settings › CivilCraft)
  const lab = (t) => SC.planScene({ units: 'ft', points: [P(5, 0, 0, 250.5, 'TREE OAK')] }, { mmPerUnit: 1, show: { pointLabels: true, pointLabelText: t } }).items.find((i) => i.layer === 'V-NODE-TEXT')?.text;
  ok(lab('n') === '5' && lab('nz') === '5  250.50' && lab('nzd') === '5  250.50  TREE OAK' && lab(undefined) === '5  250.50  TREE OAK', 'point labels: number / + elevation / + description (default)');
}

console.log(`\n${pass} passed, ${fail} failed` + (KEEP ? `  (files in ${OUT})` : ''));
if (!KEEP) fs.rmSync(OUT, { recursive: true, force: true });
process.exit(fail ? 1 : 0);

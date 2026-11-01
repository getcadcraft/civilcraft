#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-ground.mjs — CivilCraft 0.8 SU.911 / SU.935: the shared ground-surface builder (ground-surface.js),
 * DOM-free, in Node. Known answers:
 *   - levels: own elevation, shared vertex elevation, 0 = plan linework (none), start/interval pick, typed levels.
 *   - checks: a crossing at the exact point, same-level crossing, duplicate (reversed too), off-grid level, short, no level.
 *   - simplify: a straight run collapses, a corner stays, z kept.
 *   - two-point placement: scale, rotation and shift recovered exactly; the picked points land on their targets.
 *   - contours → TIN: every contour vertex keeps its elevation; a planar slope is exact; contours of a parabolic hill and ridge:
 *     the flat-triangle fix cuts the error against the true surface (numbers printed with --verbose).
 *   node bin/test-civilcraft-ground.mjs [--build dev|x.y] [--verbose]
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
const G = await mod('ground-surface.js');
const GC = await mod('ground-classify.js');
const LAS = await mod('las.js');
const TH = await mod('thin.js');
const SCENE = await import(pathToFileURL(path.join(REPO, 'tools/civilcraft-test/drone-scene.mjs')).href);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const line = (z, ...xy) => ({ z, pts: xy.map(([x, y]) => ({ x, y })) });

section('levels');
{
  ok(G.levelOf({ pts: [{ x: 0, y: 0, z: 5 }, { x: 1, y: 0, z: 5 }] }) === 5, 'one shared vertex elevation');
  ok(G.levelOf({ pts: [{ x: 0, y: 0, z: 5 }, { x: 1, y: 0, z: 6 }] }) === null, 'varying vertex elevations are not a contour level');
  ok(G.levelOf({ pts: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }] }) === null, 'all-zero = plan linework, no level');
  ok(G.levelOf({ z: 12, pts: [] }) === 12, 'a typed level wins');
  const ls = [line(null, [0, 0], [1, 0]), line(null, [0, 1], [1, 1]), line(null, [0, 2], [1, 2])];
  const p = G.assignPick(ls, [2, 0, 1, 0], 100, 5);
  ok(p[2].z === 100 && p[0].z === 105 && p[1].z === 110, 'pick order gives start + k·interval; a repeated pick keeps its first');
  ok(G.assignTyped(ls, { 1: 42 })[1].z === 42 && G.assignTyped(ls, { 1: 42 })[0].z === null, 'typed per line');
}

section('checks');
{
  const a = line(10, [0, 0], [10, 10]), b = line(11, [0, 10], [10, 0]);
  const c = G.checkContours([a, b], { interval: 1 });
  const x = c.find((i) => i.code === 'crossing');
  ok(x && Math.abs(x.x - 5) < 1e-9 && Math.abs(x.y - 5) < 1e-9 && x.z === 10 && x.zb === 11, 'a crossing at (5, 5) between levels 10 and 11');
  ok(G.checkContours([a, line(10, [0, 10], [10, 0])], {}).some((i) => i.code === 'samelevel'), 'same-level lines that cross');
  const d = G.checkContours([a, line(10, [10, 10], [0, 0])], {});
  ok(d.some((i) => i.code === 'duplicate' && i.a === 1 && i.b === 0), 'a duplicate, even reversed');
  ok(G.checkContours([line(10.5, [0, 0], [1, 0])], { interval: 1 }).some((i) => i.code === 'offgrid'), 'a level off the interval');
  ok(G.checkContours([line(10, [0, 0], [1, 0])], { interval: 5, base: 0 }).length === 0, 'on the interval: clean');
  const e = G.checkContours([line(null, [0, 0], [1, 0]), { z: 3, pts: [{ x: 0, y: 0 }] }], {});
  ok(e.some((i) => i.code === 'noz' && i.a === 0) && e.some((i) => i.code === 'short' && i.a === 1), 'no level; too short');
  const self = G.checkContours([line(5, [0, 0], [10, 10], [10, 0], [0, 10])], {});
  ok(self.some((i) => i.code === 'crossing' || i.code === 'samelevel'), 'a line crossing itself');
  // two lines touching at an end are fine
  ok(G.checkContours([line(5, [0, 0], [5, 5]), line(6, [5, 5], [9, 1])], {}).length === 0, 'meeting at an end is not a crossing');
}

section('simplify and placement');
{
  const pts = [0, 1, 2, 3, 4].map((i) => ({ x: i, y: 0, z: 7 })).concat([{ x: 4, y: 3, z: 7 }]);
  const s = G.simplifyLine(pts, 0.01);
  ok(s.length === 3 && s[1].x === 4 && s[1].y === 0 && s.every((p) => p.z === 7), 'a straight run collapses, the corner and z stay');
  const T = (p) => { const k = 2.5, r = 0.7; return { x: k * (Math.cos(r) * p.x - Math.sin(r) * p.y) + 1000, y: k * (Math.sin(r) * p.x + Math.cos(r) * p.y) - 200 }; };
  const a = { x: 10, y: 20 }, b = { x: 110, y: 70 };
  const pl = G.placeByTwoPoints(a, b, T(a), T(b));
  near(pl.k, 2.5, 1e-12, 'scale'); near(pl.rot, 0.7, 1e-12, 'rotation');
  const q = pl.apply({ x: 33, y: -12, z: 4 }), tq = T({ x: 33, y: -12 });
  ok(Math.hypot(q.x - tq.x, q.y - tq.y) < 1e-9 && q.z === 4, 'another point lands where the true transform puts it; z kept');
  ok(G.placeByTwoPoints(a, a, b, b) === null, 'two equal points give nothing');
}

section('contours → ground surface');
{
  // a plane z = 100 + 0.1 x: vertical contour lines every 1 m
  const plane = [];
  for (let k = 0; k <= 10; k++) plane.push(line(100 + k, [10 * k, 0], [10 * k, 50], [10 * k, 100]));
  const r = G.groundFromContours(plane, { interval: 1 });
  ok(r.surface && r.issues.length === 0, 'plane contours build with no issues');
  let worst = 0;
  for (const [x, y] of [[5, 5], [37, 61], [88.3, 99], [50, 0.5]]) worst = Math.max(worst, Math.abs(r.surface.elevationAt(x, y) - (100 + 0.1 * x)));
  ok(worst < 1e-9, 'a planar slope is exact between its contours (worst ' + worst + ')');
  ok(r.breaklines.every((b) => b.pts.every((p) => p.z === b.pts[0].z)), 'each contour is a flat breakline');
  // a bad line is left out when asked
  const bad = [...plane, line(103, [0, 45], [100, 45])];
  const r2 = G.groundFromContours(bad, { interval: 1, dropCrossing: true });
  ok(r2.issues.some((i) => i.code === 'crossing') && r2.dropped.length === 1 && r2.dropped[0] === 11 && r2.used.length === 11, 'the stray line that cuts all the contours is the one left out (the 11 contours stay)');
}

section('flat triangles: ridge and hill');
{
  // ridge: z = 100 − 0.0002 x² on x ∈ [−150, 150], y ∈ [0, 200]. Contours at 91, 94, 97 (two sides each); the top is above 97
  const f = (x, y) => 100 - 0.0002 * x * x;
  const rid = [];
  for (const z of [91, 94, 97]) { const x = Math.sqrt((100 - z) / 0.0002); for (const s of [-1, 1]) rid.push(line(z, [s * x, 0], [s * x, 100], [s * x, 200])); }
  const rms = (surf, xmax) => {
    let n = 0, s2 = 0, mx = 0;
    for (let x = -xmax + 1; x < xmax; x += 5) for (let y = 3; y < 200; y += 7) { const z = surf.elevationAt(x, y); if (z === null) continue; const e = z - f(x, y); n++; s2 += e * e; mx = Math.max(mx, Math.abs(e)); }
    return { rms: Math.sqrt(s2 / n), max: mx, n };
  };
  const xmax = Math.sqrt(9 / 0.0002);
  const off = G.groundFromContours(rid, { interval: 3, fixFlat: false }), on = G.groundFromContours(rid, { interval: 3, fixFlat: true });
  const A = rms(off.surface, xmax), B = rms(on.surface, xmax);
  if (VERBOSE) console.log('  ridge  flat-fix off', A, ' on', B, ' points added', on.report.flatPoints);
  ok(on.report.flatPoints > 0, 'flat triangles found on the ridge top (' + on.report.flatPoints + ' points added)');
  ok(B.rms < A.rms, `the fix lowers the RMS error (${A.rms.toFixed(3)} → ${B.rms.toFixed(3)} m)`);
  ok(B.max <= 3.0001, 'and never off by more than one interval (max ' + B.max.toFixed(3) + ')');
  // hill: z = 50 − 0.01 r², rings every 2 m from 48 down to 30
  const h = (x, y) => 50 - 0.01 * (x * x + y * y), hill = [];
  for (let z = 48; z >= 30; z -= 2) {
    const r = Math.sqrt((50 - z) / 0.01), pts = [];
    for (let i = 0; i < 48; i++) pts.push([r * Math.cos(i * Math.PI / 24), r * Math.sin(i * Math.PI / 24)]);
    hill.push({ z, closed: true, pts: pts.map(([x, y]) => ({ x, y })) });
  }
  const hoff = G.groundFromContours(hill, { interval: 2, fixFlat: false }), hon = G.groundFromContours(hill, { interval: 2, fixFlat: true });
  const hr = (surf) => { let n = 0, s2 = 0; for (let x = -40; x <= 40; x += 2) for (let y = -40; y <= 40; y += 2) { if (x * x + y * y > 42 * 42) continue; const z = surf.elevationAt(x, y); if (z === null) continue; n++; s2 += (z - h(x, y)) ** 2; } return Math.sqrt(s2 / n); };
  const ha = hr(hoff.surface), hb = hr(hon.surface);
  if (VERBOSE) console.log('  hill   flat-fix off', ha, ' on', hb, ' points added', hon.report.flatPoints);
  ok(hb <= ha, `hill: the fix does not make it worse (${ha.toFixed(3)} → ${hb.toFixed(3)} m)`);
  const top = hon.surface.elevationAt(0, 0);
  ok(top > 48 && top < 51, 'hill top is above the highest ring and near the truth (' + top.toFixed(2) + ' vs 50)');
}

section('SU.935: ground from a drone point cloud (testfiles/generated/drone-survey-300m.las)');
{
  const lasPath = path.join(REPO, 'testfiles/generated/drone-survey-300m.las');
  if (!fs.existsSync(lasPath)) { console.log('  (cloud not made: node tools/civilcraft-test/make-drone-cloud.mjs)'); }
  else {
    const file = await fs.openAsBlob(lasPath);
    const h = await LAS.readLasHeader(file);
    ok(h.count === 360200 && h.available === 360200, 'LAS header: 360,200 points');
    const CELL = 2, th = new TH.Thinner({ cell: CELL, mode: 'lowest', origin: [SCENE.X0, SCENE.Y0] });
    let classes = new Set();
    await LAS.scanPoints(file, h, (x, y, z, c) => { classes.add(c); th.add(x, y, z, c); });
    ok(classes.size === 1 && classes.has(0), 'every point is unclassified (class 0): the file has no ground class');
    const thin = th.points();
    ok(thin.length > 20000 && thin.length < 22600, 'thinned to the lowest point per 2 m cell (' + thin.length + ' cells)');
    const t0 = performance.now();
    const res = GC.classifyGround(thin, { cell: CELL, maxObject: 40, slope: 0.3, initialHeight: 0.4, maxHeight: 3 });
    const ms = Math.round(performance.now() - t0);
    const T = SCENE.trees(), truth = (p) => SCENE.terrainZ(p.x, p.y);
    let s2 = 0, worst = 0, onBuilding = 0, onTree = 0;
    for (const p of res.ground) {
      const e = p.z - truth(p); s2 += e * e; worst = Math.max(worst, Math.abs(e));
      const st = SCENE.standing(p.x - SCENE.X0, p.y - SCENE.Y0, T);
      if (st?.kind === 'building' && Math.abs(e) > 0.5) onBuilding++;
      if (st?.kind === 'tree' && Math.abs(e) > 0.5) onTree++;
    }
    const rmsG = Math.sqrt(s2 / res.ground.length);
    if (VERBOSE) console.log('  ground', res.counts, 'rms', rmsG, 'worst', worst, 'on roofs', onBuilding, 'in canopy', onTree, 'windows', res.windows, ms + ' ms');
    ok(rmsG < 0.15, 'ground points lie on the true terrain (RMS ' + rmsG.toFixed(3) + ' m)');
    ok(onBuilding === 0, 'no roof is kept as ground (' + onBuilding + ')');
    ok(onTree <= 2, 'no canopy is kept as ground (' + onTree + ')');
    ok(worst < 0.1, 'the worst ground point is within 10 cm of the truth (' + worst.toFixed(3) + ' m)');
    ok(res.counts.lowNoise >= 195, 'stray low points are dropped (' + res.counts.lowNoise + ' of 200 cells)');
    // how much of the open ground is kept: cells with nothing standing on them
    let open = 0, kept = 0;
    for (const p of thin) { const st = SCENE.standing(p.x - SCENE.X0, p.y - SCENE.Y0, T); if (!st && Math.abs(p.z - truth(p)) < 0.2) open++; }
    for (const p of res.ground) { const st = SCENE.standing(p.x - SCENE.X0, p.y - SCENE.Y0, T); if (!st) kept++; }
    ok(kept / open > 0.97, 'open ground is kept (' + (100 * kept / open).toFixed(1) + ' % of ' + open + ' cells)');
    // the TIN and its contours
    const g = G.buildGround({ points: res.ground });
    ok(!!g.surface, 'a ground TIN builds');
    let s3 = 0, n = 0, w3 = 0;
    for (let u = 5; u < 295; u += 3.7) for (let v = 5; v < 295; v += 3.7) {
      const st = SCENE.standing(u, v, T); if (st) continue;
      const z = g.surface.elevationAt(SCENE.X0 + u, SCENE.Y0 + v); if (z === null) continue;
      const e = z - SCENE.terrainZ(SCENE.X0 + u, SCENE.Y0 + v); s3 += e * e; n++; w3 = Math.max(w3, Math.abs(e));
    }
    const rmsS = Math.sqrt(s3 / n);
    if (VERBOSE) console.log('  surface rms', rmsS, 'worst', w3, 'n', n);
    ok(rmsS < 0.25, 'the ground surface follows the terrain in the open (RMS ' + rmsS.toFixed(3) + ' m)');
    // volume against a design surface (grading.js gridVolume): the same ground raised 2 m is 2 m × its area of fill
    const GR = await mod('grading.js');
    const up = G.buildGround({ points: res.ground.map((p) => ({ ...p, z: p.z + 2 })) }).surface;
    const vol = GR.gridVolume(g.surface, up, { cell: 2 });
    const area = g.surface.stats().area2d;
    if (VERBOSE) console.log('  volume', JSON.stringify(vol).slice(0, 200), 'area', area);
    ok(vol && Math.abs((vol.fill ?? vol.fillVol ?? 0) - 2 * area) / (2 * area) < 0.03, 'volume to a design surface: 2 m of fill over the ground area within 3 %');
    const cs = g.surface.contours(1);
    ok(cs && cs.length > 20, 'contours at 1 m come out (' + (cs?.length ?? 0) + ' lines)');
    // against the raw lowest-point TIN (no filtering): the filter must beat it
    const raw = G.buildGround({ points: thin }).surface;
    let s4 = 0, n4 = 0;
    for (let u = 5; u < 295; u += 3.7) for (let v = 5; v < 295; v += 3.7) { const z = raw.elevationAt(SCENE.X0 + u, SCENE.Y0 + v); if (z === null) continue; const e = z - SCENE.terrainZ(SCENE.X0 + u, SCENE.Y0 + v); s4 += e * e; n4++; }
    const gAll = (() => { let a = 0, m = 0; for (let u = 5; u < 295; u += 3.7) for (let v = 5; v < 295; v += 3.7) { const z = g.surface.elevationAt(SCENE.X0 + u, SCENE.Y0 + v); if (z === null) continue; const e = z - SCENE.terrainZ(SCENE.X0 + u, SCENE.Y0 + v); a += e * e; m++; } return Math.sqrt(a / m); })();
    ok(gAll < Math.sqrt(s4 / n4) / 3, `over the whole site the filtered surface is far closer than the raw lowest points (${gAll.toFixed(2)} vs ${Math.sqrt(s4 / n4).toFixed(2)} m RMS)`);
    // thinning inside buildGround gives the same surface from the unthinned points
    const all = []; await LAS.scanPoints(file, h, (x, y, z) => all.push({ x, y, z }));
    const g2 = G.buildGround({ points: res.ground, spacing: 0 });
    ok(g2.surface.stats().points === g.surface.stats().points, 'buildGround without thinning keeps every ground point');
    const g3 = G.buildGround({ points: all.slice(0, 60000), spacing: 4, mode: 'lowest' });
    ok(g3.thinned && g3.thinned.kept < 60000 / 8 && g3.surface, 'buildGround thins first when asked (' + g3.thinned?.kept + ' kept of ' + g3.thinned?.seen + ')');
  }
  // settings you can see are used: a tiny maxObject leaves the buildings in
  const small = GC.classifyGround([...Array(400)].map((_, i) => ({ x: (i % 20) * 2, y: Math.floor(i / 20) * 2, z: (i % 20 > 7 && i % 20 < 12 && Math.floor(i / 20) > 7 && Math.floor(i / 20) < 12) ? 8 : 0 })), { cell: 2, maxObject: 4, slope: 0.3, initialHeight: 0.4 });
  const big = GC.classifyGround([...Array(400)].map((_, i) => ({ x: (i % 20) * 2, y: Math.floor(i / 20) * 2, z: (i % 20 > 7 && i % 20 < 12 && Math.floor(i / 20) > 7 && Math.floor(i / 20) < 12) ? 8 : 0 })), { cell: 2, maxObject: 20, slope: 0.3, initialHeight: 0.4 });
  ok(small.counts.objects === 0 && big.counts.objects === 16, `maxObject sets what is taken out (a 4 × 4-cell block: ${small.counts.objects} removed with 4, ${big.counts.objects} with 20)`);
  ok(GC.classifyGround([], { cell: 1 }).ground.length === 0, 'an empty cloud gives nothing');
  let threw = false; try { GC.classifyGround([{ x: 0, y: 0, z: 0 }, { x: 1e9, y: 1e9, z: 0 }], { cell: 1 }); } catch (e) { threw = e.code === 'cells'; }
  ok(threw, 'a cell size that would need more cells than allowed is refused with a code');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

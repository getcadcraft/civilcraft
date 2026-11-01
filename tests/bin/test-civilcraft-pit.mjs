#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-pit.mjs — CivilCraft 0.8 EG.27 (civil_PART_4): an open pit with a haul ramp in the pit run, cut into the fixture site's ground, and drawn in the 3D scene.
 * Known answers: the ramp's grade and width reach the run; a wider ramp makes the pit smaller (flatter wall); the cut ground is never above the original and is lower
 * inside the pit by the pit's depth; the dug volume equals the column sum; the scene carries the ramp ribbon and bench rims; unknown ground and a pit above the model top are said.
 *   node bin/test-civilcraft-pit.mjs [--build dev|x.y]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire, registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const KEEP = process.argv.includes('--keep');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
// The build's language file: DOM-free modules speak through t() (docs/LANG.md); a build without one keeps its English.
if (fs.existsSync(path.join(APP, 'lang/en.json'))) (await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const MC = path.join(REPO, 'public_html/assets/apps/modelcraft/dev');
const TOOLS = path.join(REPO, 'tools/civilcraft-test');
const OUT = KEEP ? path.join(REPO, 'tmp/civilcraft-3d-test') : fs.mkdtempSync('/tmp/civilcraft-3d-test-');
fs.mkdirSync(OUT, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m && spec !== 'three') return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const PTS = await mod('points.js');
const TIN = await mod('tin.js');
const PJ = await mod('project.js');
const PI_ = await mod('pipes.js');
const S3 = await mod('site3d.js');
const EX = await mod('site3d-export.js');
const { Camera } = await mod('camera.js');
const FIX = await import(pathToFileURL(path.join(TOOLS, 'make-fixture.mjs')).href);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const note = (s) => console.log('  note ' + s);
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const zRange = (P, I) => { let lo = Infinity, hi = -Infinity; for (const i of I) { const z = P[3 * i + 2]; if (z < lo) lo = z; if (z > hi) hi = z; } return [lo, hi]; };
const ownerVerts = (m, k) => { const s = new Set(); for (let t = 0; t < m.triOwner.length; t++) if (m.triOwner[t] === k) for (let j = 0; j < 3; j++) s.add(m.indices[3 * t + j]); return [...s]; };

// ---------------------------------------------------------------------------
section('the fixture site');
const fx = PTS.parsePoints(fs.readFileSync(path.join(TOOLS, 'site-topo.csv'), 'utf8'));
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
  project.change('Corridor', (s) => { s.alignments[0].corridor = { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 10 }; });
}
project.change('Pad', (s) => s.pads.push({ id: 'p1', name: 'Pad A', pts: [{ x: FIX.E0 + 60, y: FIX.N0 + 120 }, { x: FIX.E0 + 120, y: FIX.N0 + 120 }, { x: FIX.E0 + 120, y: FIX.N0 + 170 }, { x: FIX.E0 + 60, y: FIX.N0 + 170 }], z: 252, cut: 2, fill: 2 }));
{
  const net = PI_.defaultNetwork('ft');
  net.structures = [
    { id: 's1', name: 'S1', x: FIX.E0 + 250, y: FIX.N0 + 150, rim: null, sumpDepth: 0.5, dia: 48 },
    { id: 's2', name: 'S2', x: FIX.E0 + 170, y: FIX.N0 + 110, rim: null, sumpDepth: 0, dia: 48 },
    { id: 's3', name: 'S3', x: FIX.E0 + 60, y: FIX.N0 + 70, rim: null, sumpDepth: 1, dia: 60 },
  ];
  net.pipes = [{ id: 'q1', name: 'P1', from: 's1', to: 's2', dia: 12, invUp: null, invDn: null }, { id: 'q2', name: 'P2', from: 's2', to: 's3', dia: 18, invUp: null, invDn: null }];
  net.pipes = PI_.autoInverts(net, project.pipeSurface(), 'ft').pipes;
  project.change('Pipes', (s) => { s.network = net; });
}

const GS = await mod('geo-state.js'), GR = await mod('geo-run.js'), PV = await mod('pit-view.js'), PS = await mod('pit-surface.js');
const eg0 = project.eg().surface, cx = FIX.E0 + 150, cy = FIX.N0 + 150, gz = eg0.elevationAt(cx, cy);
ok(Number.isFinite(gz), 'ground at the pit site ' + gz);
const raw = { name: 'Test pit', nx: 10, ny: 10, nz: 5, size: [10, 10, 10], origin: [cx - 50, cy - 50, gz - 50], density: 2.7, price: 100, recovery: 1, processCost: 10, miningCost: 1, slope: 55, rampGrade: 0.1, rampWidth: 0, rampOn: 'no', cut: 'yes', show3d: 'yes',
  samples: [{ x: cx, y: cy, z: gz - 45, grade: 5 }, { x: cx, y: cy, z: gz - 5, grade: 0.01 }] };
let seq = 1; const idf = (v, p) => (/^[a-z]+\d+$/.test(String(v)) ? String(v) : p + seq++);
const setPit = (o) => project.change('pit', (s) => { s.geo = GS.cleanGeo({ pits: [{ ...raw, ...o }] }, 'ft', idf); });
setPit({});
const p0 = project.state.geo.pits[0];
ok(p0.cut === 'yes' && p0.show3d === 'yes' && p0.rampOn === 'no', 'fields survive the cleaner');
ok(GS.cleanGeo({ pits: [{ rampWidth: 1e9, rampOn: 'junk', cut: 'x', show3d: 'x' }] }, 'ft', idf).pits[0].rampWidth === 200 && GS.cleanGeo({ pits: [{ rampOn: 'junk', cut: 'x', show3d: 'x' }] }, 'ft', idf).pits[0].cut === 'no', 'hostile values bounded');
const r0 = GR.runPit(p0, 'ft');
ok(r0.result.blocks > 10, 'a pit is mined: ' + r0.result.blocks + ' blocks'); ok(r0.road === null, 'no ramp width = no road');
setPit({ rampWidth: 20 });
const r1 = GR.runPit(project.state.geo.pits[0], 'ft');
ok(r1.road && r1.road.pts.length > 3, 'ramp laid'); near(Math.max(...r1.road.pts.map((q) => q[2])) - Math.min(...r1.road.pts.map((q) => q[2])), r1.road.drop, 1e-9, 'road drop'); ok(r1.road.width === 20 * 0.3048, 'width in metres');
setPit({ rampWidth: 20, rampOn: 'yes' });
const r2 = GR.runPit(project.state.geo.pits[0], 'ft');
ok(r2.slopeUsed < 55 && r2.result.blocks <= r1.result.blocks, `a ramp lane flattens the wall: ${r2.slopeUsed.toFixed(1)} deg, ${r2.result.blocks} <= ${r1.result.blocks} blocks`);
{
  const sc = PV.pitScene(project);
  ok(sc.ground && sc.pits.length === 1, 'scene: a cut ground and one pit');
  ok(sc.pits[0].road && sc.pits[0].benches.length >= 1 && sc.pits[0].benches[0].loops.length >= 1, 'road and bench rims in project units');
  const g = sc.ground; let lower = 0, higher = 0;
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const x = cx + i * 12, y = cy + j * 12, a = eg0.elevationAt(x, y), b = g.elevationAt(x, y); if (a === null || b === null) continue; if (b > a + 1e-6) higher++; if (b < a - 5) lower++; }
  ok(higher === 0, 'the cut ground never rises above the original'); ok(lower > 3, 'it is lower inside the pit: ' + lower + ' places by more than 5 ft');
  const mid = g.elevationAt(cx, cy), floorZ = gz - 50; ok(mid !== null && mid < gz - 10 && mid >= floorZ - 1e-6, `centre ${mid?.toFixed(2)} between the floor ${floorZ.toFixed(1)} and the ground ${gz.toFixed(1)}`);
  near(g.elevationAt(FIX.E0 + 20, FIX.N0 + 20), eg0.elevationAt(FIX.E0 + 20, FIX.N0 + 20), 0.05, 'far from the pit the ground is the original');
  const direct = PS.pitGround(eg0, project.state.geo.pits[0], 'ft'); ok(direct && direct.dug > 0, 'dug volume ' + direct?.dug?.toFixed(0) + ' ft3'); 
  // dug by columns: sum of (ground - floor) x cell area, in project units
  let want = 0; const M = r2.model, k = 0.3048;
  for (let j = 0; j < M.ny; j++) for (let i = 0; i < M.nx; i++) { for (let kk = 0; kk < M.nz; kk++) if (r2.result.mined[M.index(i, j, kk)]) { const x = (M.origin[0] + (i + .5) * M.size[0]) / k, y = (M.origin[1] + (j + .5) * M.size[1]) / k, zg = eg0.elevationAt(x, y); const fl = (M.origin[2] + kk * M.size[2]) / k; if (zg !== null) want += Math.max(0, zg - fl) * 100; break; } }
  near(direct.dug, want, want * 0.001 + 1e-6, 'dug volume = the column sum');
  const inp = S3.siteInput(project), scn = S3.buildSite3D(inp, { exag: 1, color: 'single' });
  ok(inp.pitCut && inp.eg === sc.ground, 'siteInput uses the cut ground'); ok(scn.meshes.some((m) => m.key === 'pit-ramp' && m.owners.some((o) => o.kind === 'pit')), 'ramp ribbon mesh owned by the pit');
  ok(scn.lines.some((l) => l.key === 'pit-bench' && l.positions.length >= 24), 'bench rims drawn');
  ok(!S3.buildSite3D(inp, { exag: 1, show: { pit: false } }).meshes.some((m) => m.key === 'pit-ramp'), 'Pit switch off');
}
setPit({ cut: 'no' }); ok(PV.pitScene(project).ground === null && S3.siteInput(project).eg === eg0 ? true : S3.siteInput(project).eg === project.eg().surface, 'cut off: the original ground'); 
setPit({ show3d: 'no' }); ok(PV.pitScene(project).pits.length === 0, '3D off: nothing in the scene');
setPit({ cut: 'yes', origin: [cx - 50, cy - 50, gz - 90] }); ok(PV.pitScene(project).notes.some((n) => n.code === 'pit.top.belowground'), 'ground far above the model top is said');
setPit({ rampWidth: 20, rampGrade: 0.01 }); ok(PV.pitScene(project).notes.some((n) => n.code === 'pit.ramp.wraps'), 'a ramp that cannot fit is said (wraps)');
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);

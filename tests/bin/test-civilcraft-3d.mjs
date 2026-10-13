#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-3d.mjs — the CivilCraft 3D site view's DOM-free parts (assets/apps/civilcraft/<build>/) in Node.
 *
 *   node bin/test-civilcraft-3d.mjs [--build dev|x.y] [--verbose] [--keep]
 *
 * camera.js + vec.js are byte-identical copies of ModelCraft's; site3d.js (the scene builder) and
 * site3d-export.js (GLB/OBJ) never import three.js; the mesh builder on the fixture site (vertex and
 * triangle counts, local origin kept at state-plane magnitudes, vertical exaggeration, elevation bands cut
 * exactly at their levels, draped contours, the alignment on its design profile, corridor feature lines,
 * pipes between their inverts with the crown one inside diameter up (inches on a feet project, millimetres
 * on a metre project), structures rim to sump, problem colours, survey points); picking through a Camera;
 * GLB checked by the Khronos glTF validator (tools/modelcraft-test's node_modules: `(cd tools/modelcraft-test
 * && npm install)`, skipped with a note when missing) and read back (meters, Y up, true scale, origin
 * recorded); OBJ read back; a 100k-triangle surface built quickly. --keep writes the exports to tmp/civilcraft-3d-test/.
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
section('copies and imports');
if (!fs.existsSync(MC)) note('modelcraft/dev is not here (a one-app clone): the byte-identical copy checks are skipped');   // 0.8
else for (const f of ['camera.js', 'vec.js', 'viewcube.js', 'viewcube-camera.js']) {
  const a = fs.readFileSync(path.join(APP, f)), b = fs.readFileSync(path.join(MC, f));
  ok(a.equals(b), `${f} is a byte-identical copy of ModelCraft's (re-copy it from modelcraft/dev when this fails)`);
}
ok(manifest.imports?.three === '/assets/vendor/three/current/three.module.js', 'manifest maps "three" to the vendored three.module.js');
for (const f of ['site3d.js', 'site3d-export.js', 'camera.js', 'vec.js', 'viewcube-camera.js']) {
  const src = fs.readFileSync(path.join(APP, f), 'utf8');
  ok(!/from\s+['"]three['"]|import\(\s*['"]three['"]/.test(src) && !/\bdocument\.|\bwindow\./.test(src), `${f} is DOM-free and never imports three`);
}
{
  const src = fs.readFileSync(path.join(APP, 'site-view3d.js'), 'utf8');
  ok(/from 'three'/.test(src) && /from '\.\/camera\.js'/.test(src) && /from '\.\/site3d\.js'/.test(src), 'site-view3d.js draws with three and our own camera + scene builder');
  ok(/from '\.\/viewcube\.js'/.test(src) && /cameraCubeOptions\(view\.cam/.test(src) && /cube\.update\(\)/.test(src), 'the 3D view mounts the view cube on its camera (cameraCubeOptions) and updates it after every render');
  const app = fs.readFileSync(path.join(APP, 'civilcraft.js'), 'utf8');
  ok(/from '\.\/viewcube\.js'/.test(app) && /import\('\.\/site-view3d\.js'\)/.test(app) && !/from '\.\/site-view3d\.js'/.test(app), 'civilcraft.js shows the plan\'s cube and imports the 3D view only on first use');
  ok(!/modelcraft/.test(src.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')), 'the view module never imports another app\'s folder');
}

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
const input = S3.siteInput(project);
const eg = input.eg, fg = input.fg;
ok(eg && fg && input.corridors.length === 1 && input.pads[0].daylight.length > 3 && input.check.problems.length === 0, `siteInput: EG (${eg.nT} triangles), graded surface (${fg?.nT}), a corridor, a daylighted pad, a clean pipe network`);

// ---------------------------------------------------------------------------
section('surfaces: vertex counts, local origin, exaggeration, bands');
const sc1 = S3.buildSite3D(input, { exag: 1, color: 'single' });
const egM = sc1.meshes.find((m) => m.key === 'eg'), fgM = sc1.meshes.find((m) => m.key === 'fg');
ok(egM && fgM, 'both surfaces drawn when both are on');
ok(egM.positions.length / 3 === eg.stats().points && egM.indices.length / 3 === eg.nT, `single colour: one vertex per surface point (${egM.positions.length / 3}) and one triangle per TIN triangle (${egM.indices.length / 3})`);
ok(sc1.origin.x === eg.ox && sc1.origin.y === eg.oy && sc1.origin.z === Math.floor(Math.min(eg.stats().minZ, fg.stats().minZ)), `the origin is the surface's own local origin (${sc1.origin.x}, ${sc1.origin.y}) and the lowest elevation rounded down (${sc1.origin.z})`);
{
  let worst = 0, naive = 0, bigLocal = 0;
  const used = eg.usedVertices();
  const map = [];
  for (let i = 0; i < eg.X.length; i++) if (used[i]) map.push(i);
  // vertices are emitted in triangle order; check each against the surface through its triangle
  const seen = new Map();
  for (let t = 0; t < eg.tris.length; t++) { const v = eg.tris[t]; if (!seen.has(v)) seen.set(v, seen.size); }
  for (const [v, k] of seen) {
    const X = egM.positions[3 * k] + sc1.origin.x, Y = egM.positions[3 * k + 1] + sc1.origin.y, Z = egM.positions[3 * k + 2] + sc1.origin.z;
    const ex = eg.X[v] + eg.ox, ey = eg.Y[v] + eg.oy, ez = eg.Z[v];
    worst = Math.max(worst, Math.abs(X - ex), Math.abs(Y - ey), Math.abs(Z - ez));
    naive = Math.max(naive, Math.abs(Math.fround(ex) - ex), Math.abs(Math.fround(ey) - ey));
    bigLocal = Math.max(bigLocal, Math.abs(egM.positions[3 * k]), Math.abs(egM.positions[3 * k + 1]));
  }
  ok(worst < 1e-4, `state-plane precision kept: every vertex back within ${worst.toExponential(2)} ft (Float32 of the raw coordinates would be off by up to ${naive.toFixed(3)} ft)`);
  ok(bigLocal < 1000, `local coordinates stay small (largest ${bigLocal.toFixed(1)} ft)`);
}
const sc3 = S3.buildSite3D(input, { exag: 3, color: 'single' });
{
  const m3 = sc3.meshes.find((m) => m.key === 'eg');
  let w = 0, xy = 0, nl = 0;
  for (let i = 0; i < m3.positions.length; i += 3) {
    w = Math.max(w, Math.abs(m3.positions[i + 2] - 3 * egM.positions[i + 2]));
    xy = Math.max(xy, Math.abs(m3.positions[i] - egM.positions[i]), Math.abs(m3.positions[i + 1] - egM.positions[i + 1]));
    nl = Math.max(nl, Math.abs(Math.hypot(m3.normals[i], m3.normals[i + 1], m3.normals[i + 2]) - 1));
  }
  ok(w < 1e-3 && xy === 0, `3× exaggeration: every z three times as high above the origin (worst ${w.toExponential(2)}), x and y unchanged`);
  ok(nl < 1e-5, 'normals are unit length');
  let steeper = 0, n = 0;
  for (let i = 0; i < m3.normals.length; i += 3) { n++; if (m3.normals[i + 2] <= egM.normals[i + 2] + 1e-6) steeper++; }
  ok(steeper === n, 'exaggerated normals lean further from vertical (the slopes look steeper)');
  ok(sc3.exag === 3 && S3.buildSite3D(input, { exag: 40 }).exag === 10 && S3.buildSite3D(input, { exag: 0 }).exag === 1, 'exaggeration kept within 1×–10×');
}
const scB = S3.buildSite3D(input, { exag: 2, color: 'bands', bandCount: 8, show: { fg: false } });
{
  const m = scB.meshes.find((x) => x.key === 'eg');
  ok(scB.meshes.length >= 1 && !scB.meshes.some((x) => x.key === 'fg'), 'the graded surface toggles off');
  const st = eg.stats(), levels = S3.bandLevels(st, 8);
  const cols = Array.from({ length: 8 }, (_, i) => S3.rgb(S3.bandColor(i / 7, false)));
  let wrong = 0, area = 0;
  for (let t = 0; t < m.indices.length; t += 3) {
    const vs = [m.indices[t], m.indices[t + 1], m.indices[t + 2]];
    const c = [m.colors[3 * vs[0]], m.colors[3 * vs[0] + 1], m.colors[3 * vs[0] + 2]];
    const b = cols.findIndex((k) => Math.abs(k[0] - c[0]) < 1e-6 && Math.abs(k[1] - c[1]) < 1e-6 && Math.abs(k[2] - c[2]) < 1e-6);
    for (const v of vs) {
      const z = m.positions[3 * v + 2] / 2 + scB.origin.z;
      if (b < 0 || (b > 0 && z < levels[b - 1] - 1e-3) || (b < 7 && z > levels[b] + 1e-3)) wrong++;
    }
    const P = (v) => [m.positions[3 * v], m.positions[3 * v + 1]];
    const [a, bb, cc] = vs.map(P);
    const cr = (bb[0] - a[0]) * (cc[1] - a[1]) - (bb[1] - a[1]) * (cc[0] - a[0]);
    if (cr < 0) wrong++;
    area += cr / 2;
  }
  ok(wrong === 0, 'bands: every piece is one band colour and lies between that band\'s levels; every triangle faces up');
  near(area / st.area2d, 1, 1e-6, 'bands: the pieces cover exactly the surface\'s plan area');
  ok(m.indices.length / 3 > eg.nT, `bands cut triangles at the levels (${m.indices.length / 3} pieces from ${eg.nT} triangles)`);
}

// ---------------------------------------------------------------------------
section('linework: contours, breaklines, alignment, corridor, pads');
const scL = S3.buildSite3D(input, { exag: 2, show: { fg: false, triangles: true } });
{
  const L = (k) => scL.lines.find((l) => l.key === k);
  const minor = L('eg-minor'), major = L('eg-major');
  ok(minor && major, 'minor and major contours draped on the existing ground');
  let off = 0, nmaj = 0;
  for (const l of [minor, major]) for (let i = 0; i < l.positions.length; i += 3) {
    const z = l.positions[i + 2] / 2 + scL.origin.z;
    if (Math.abs(z - Math.round(z)) > 1e-3) off++;
    if (l === major && Math.abs(z / 5 - Math.round(z / 5)) > 1e-3) nmaj++;
  }
  ok(off === 0 && nmaj === 0, 'contour vertices sit at their whole-foot levels (×2), majors every 5 ft');
  let gap = 0;
  for (let i = 0; i < minor.positions.length; i += 3) {
    const x = minor.positions[i] + scL.origin.x, y = minor.positions[i + 1] + scL.origin.y, z = minor.positions[i + 2] / 2 + scL.origin.z;
    const g = eg.elevationAt(x, y, 1e-6);
    if (g !== null) gap = Math.max(gap, Math.abs(g - z));
  }
  ok(gap < 1e-3, `contours lie on the surface (worst ${gap.toExponential(2)} ft)`);
  ok(L('eg-tin')?.positions.length / 6 === eg.edges().length / 2, 'triangle edges on request: one segment per TIN edge');
  ok(L('eg-edge')?.positions.length > 0, 'the surface edge as a 3D line');
  const bl = L('breaklines');
  const nbl = project.egBreaklines().reduce((n, b) => n + b.pts.length - 1, 0);
  ok(bl && bl.positions.length / 6 === nbl, `breaklines as 3D lines (${nbl} segments)`);
  const alg = L('alignments'), prof = project.designProfile(project.state.alignments[0]), A = project.alignment(project.state.alignments[0]);
  let wz = 0, onP = 0, past = 0;
  for (let i = 0; i < alg.positions.length; i += 3) {
    const x = alg.positions[i] + scL.origin.x, y = alg.positions[i + 1] + scL.origin.y, z = alg.positions[i + 2] / 2 + scL.origin.z;
    const so = A.stationOffset(x, y), pz = prof.elevationAt(so.sta);
    // the last PVI was typed to 0.01 of the end station: the last few hundredths fall back to the ground
    if (pz === null) { past = Math.max(past, Math.abs(eg.elevationAt(x, y, 1e-6) - z)); continue; }
    onP++;
    wz = Math.max(wz, Math.abs(pz - z));
  }
  ok(onP > 500 && wz < 0.02, `the alignment rides on its design profile (${onP} vertices, worst ${wz.toFixed(4)} ft, chords on the curves)`);
  ok(past < 1e-3, 'past the profile\'s ends it lies on the existing ground');
  const ticks = L('stations');
  ok(ticks && ticks.positions.length / 6 === A.ticks(50).length, `station ticks every 50 ft (${ticks?.positions.length / 6})`);
  const cor = L('corridors');
  const g = project.graded().items.find((x) => x.kind === 'corridor');
  const nCor = Object.entries(g.lines).filter(([k]) => k !== 'CL').reduce((n, [, p]) => n + p.length - 1, 0);
  ok(cor && cor.positions.length / 6 === nCor, `corridor feature lines EOP, shoulder, daylight both sides (${nCor} segments)`);
  ok(L('pads')?.positions.length / 6 === 4 && Math.abs(L('pads').positions[2] / 2 + scL.origin.z - 252) < 1e-4, 'the pad outline at its elevation (252)');
  ok(L('daylight')?.positions.length > 0, 'the pad\'s daylight line');
  const scNo = S3.buildSite3D(input, { show: { contours: false, breaklines: false, alignments: false, corridors: false, pads: false, boundary: false, pipes: false } });
  ok(scNo.lines.length === 0 && scNo.meshes.every((m) => m.key === 'eg' || m.key === 'fg'), 'every line kind and the pipes toggle off');
  const scAllOff = S3.buildSite3D(input, { show: { eg: false, fg: false, contours: false } });
  ok(!scAllOff.meshes.some((m) => m.key === 'eg' || m.key === 'fg'), 'both surfaces toggle off');
  // no profile → on the existing ground
  const noProf = { ...input, alignments: input.alignments.map((a) => ({ ...a, profile: null })) };
  const scE = S3.buildSite3D(noProf, { show: { fg: false } });
  const ae = scE.lines.find((l) => l.key === 'alignments');
  let we = 0;
  for (let i = 0; i < ae.positions.length; i += 3) { const x = ae.positions[i] + scE.origin.x, y = ae.positions[i + 1] + scE.origin.y; we = Math.max(we, Math.abs(eg.elevationAt(x, y, 1e-6) - (ae.positions[i + 2] + scE.origin.z))); }
  ok(we < 1e-3, 'without a design profile the alignment lies on the existing ground');
}

// ---------------------------------------------------------------------------
section('pipes and structures');
{
  const sc = S3.buildSite3D(input, { exag: 1 });
  const pm = sc.meshes.find((m) => m.key === 'pipes'), sm = sc.meshes.find((m) => m.key === 'structures');
  ok(pm && sm && pm.owners.length === 2 && sm.owners.length === 3, 'two pipes and three structures as meshes, each triangle knows its owner');
  const net = project.state.network;
  for (const [k, p] of net.pipes.entries()) {
    const D = p.dia / 12;
    const vs = ownerVerts(pm, k);
    const up = net.structures.find((s) => s.id === p.from);
    const atUp = vs.filter((v) => Math.hypot(pm.positions[3 * v] + sc.origin.x - up.x, pm.positions[3 * v + 1] + sc.origin.y - up.y) < D);
    const [lo, hi] = zRange(pm.positions, atUp);
    const slope = (p.invUp - p.invDn) / Math.hypot(...['x', 'y'].map((c) => net.structures.find((s) => s.id === p.to)[c] - up[c]));
    near(lo + sc.origin.z, p.invUp, 1e-3 + D * slope, `${p.name} (${p.dia}"): the bottom at the upper end is the invert ${p.invUp.toFixed(2)}`);
    near(hi - lo, D, 1e-3 + D * slope, `${p.name}: crown − invert = the inside diameter ${D} ft (${p.dia} in)`);
  }
  const chk = project.networkCheck();
  for (const [k, s] of net.structures.entries()) {
    const [lo, hi] = zRange(sm.positions, ownerVerts(sm, k));
    const st = chk.structs.get(s.id);
    near(hi + sc.origin.z, st.rim, 1e-3, `${s.name}: top at the rim ${st.rim.toFixed(2)}`);
    near(lo + sc.origin.z, st.sump, 1e-3, `${s.name}: bottom at the sump ${st.sump.toFixed(2)}`);
    const vs = ownerVerts(sm, k);
    const rr = Math.max(...vs.map((v) => Math.hypot(sm.positions[3 * v] + sc.origin.x - s.x, sm.positions[3 * v + 1] + sc.origin.y - s.y)));
    near(rr, s.dia / 24, 1e-3, `${s.name}: radius = ${s.dia} in / 2`);
  }
  const blue = S3.rgb(S3.DEFAULT_COLORS.pipe), red = S3.rgb(S3.DEFAULT_COLORS.problem);
  const colorOf = (m, k) => { const v = ownerVerts(m, k)[0]; return [m.colors[3 * v], m.colors[3 * v + 1], m.colors[3 * v + 2]]; };
  const same = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 1e-6);
  ok(same(colorOf(pm, 0), blue) && same(colorOf(sm, 0), blue), 'pipes and structures without problems in the pipe colour');
  const badNet = { ...net, pipes: net.pipes.map((p, i) => (i === 0 ? { ...p, invUp: p.invDn - 0.5 } : p)) };
  const badIn = { ...input, network: badNet, check: PI_.analyzeNetwork(badNet, project.pipeSurface(), 'ft') };
  const scBad = S3.buildSite3D(badIn, {});
  const pb = scBad.meshes.find((m) => m.key === 'pipes');
  ok(same(colorOf(pb, 0), red) && same(colorOf(pb, 1), blue), 'an uphill pipe turns the problem colour; the others stay');
  const noInv = { ...input, network: { ...net, pipes: [{ ...net.pipes[0], invUp: null, invDn: null }, net.pipes[1]] } };
  const scNI = S3.buildSite3D(noInv, {});
  ok(scNI.meshes.find((m) => m.key === 'pipes').owners.length === 1 && scNI.notes.some((n) => /One pipe has no inverts/.test(n)), 'a pipe without inverts is left out and named in the notes');
  // a metre project: 300 mm pipe
  const mNet = { name: 'Storm', type: 'storm', rules: {}, structures: [{ id: 's1', name: 'A', x: 0, y: 0, rim: 10, sumpDepth: 0.3, dia: 1200 }, { id: 's2', name: 'B', x: 50, y: 0, rim: 9.5, sumpDepth: 0, dia: 1200 }], pipes: [{ id: 'q1', name: 'P', from: 's1', to: 's2', dia: 300, invUp: 8, invDn: 7.5 }] };
  const mIn = { units: 'm', eg: null, fg: null, network: mNet, check: PI_.analyzeNetwork(mNet, null, 'm'), points: [] };
  const scM = S3.buildSite3D(mIn, {});
  const mp = scM.meshes.find((m) => m.key === 'pipes'), ms = scM.meshes.find((m) => m.key === 'structures');
  const atA = ownerVerts(mp, 0).filter((v) => Math.hypot(mp.positions[3 * v] + scM.origin.x, mp.positions[3 * v + 1] + scM.origin.y) < 0.3);
  const [mlo, mhi] = zRange(mp.positions, atA);
  near(mlo + scM.origin.z, 8, 2e-3, 'metre project: invert 8.000 at the upper end');
  near(mhi - mlo, 0.3, 2e-3, 'metre project: 300 mm → crown 0.300 m above the invert');
  const [slo, shi] = zRange(ms.positions, ownerVerts(ms, 0));
  ok(Math.abs(shi + scM.origin.z - 10) < 1e-4 && Math.abs(slo + scM.origin.z - 7.7) < 1e-4, 'metre project: structure A from rim 10.00 down to its sump 7.70 (8.00 − 0.30)');
}

// ---------------------------------------------------------------------------
section('survey points and picking');
const scP = S3.buildSite3D(input, { exag: 2, show: { points: true } });
{
  const withZ = project.points.filter((p) => p.z !== null).length;
  ok(scP.points && scP.points.ids.length === withZ && scP.counts.points === withZ, `survey points as markers (${withZ})`);
  ok(!S3.buildSite3D(input, {}).points, 'points off by default');
  const cam = new Camera();
  cam.setSize(1000, 700);
  cam.standard('iso', scP.bbox);
  const toLocal = (x, y, z) => [x - scP.origin.x, y - scP.origin.y, (z - scP.origin.z) * scP.exag];
  const net = project.state.network, chk = project.networkCheck();
  // a structure: aim at the middle of its side
  const s2 = net.structures[1], st2 = chk.structs.get('s2');
  const sp = cam.project(toLocal(s2.x, s2.y, st2.rim));
  const hit = S3.pickSite(scP, cam, sp[0], sp[1] + 1);
  ok(hit?.kind === 'structure' && hit.id === 's2', `clicking a structure's rim picks it (${hit?.kind} ${hit?.id})`);
  // a survey point
  const p = project.points.find((q) => q.n === '100');
  const pp = cam.project(toLocal(p.x, p.y, p.z));
  const hp = S3.pickSite(scP, cam, pp[0] + 2, pp[1] - 2);
  ok(hp?.kind === 'point' && hp.id === '100' && Math.abs(hp.at.z - p.z) < 1e-3 && Math.abs(hp.at.x - p.x) < 1e-3, 'clicking near a survey point picks it, with its coordinates back');
  // the surface: elevation read back
  const top = new Camera(); top.setSize(800, 600);
  const noPts = S3.buildSite3D(input, { exag: 2, show: { fg: false, pipes: false } });
  top.standard('top', noPts.bbox); top.persp = false;
  const hs = S3.pickSite(noPts, top, 400, 300);
  ok(hs?.kind === 'surface' && hs.id === 'eg' && Math.abs(eg.elevationAt(hs.at.x, hs.at.y) - hs.at.z) < 1e-3, `clicking the ground reads its elevation (${hs?.at.z.toFixed(2)} at E ${hs?.at.x.toFixed(1)})`);
  // a pipe, viewed from the top with the surfaces off
  const pipesOnly = S3.buildSite3D(input, { show: { eg: false, fg: false, contours: false, alignments: false, corridors: false, pads: false, breaklines: false } });
  top.standard('top', pipesOnly.bbox);
  const a = net.structures[0], b = net.structures[1];
  const mid = cam.project.call(top, [(a.x + b.x) / 2 - pipesOnly.origin.x, (a.y + b.y) / 2 - pipesOnly.origin.y, (net.pipes[0].invUp + net.pipes[0].invDn) / 2 + 0.5 - pipesOnly.origin.z]);
  const hq = S3.pickSite(pipesOnly, top, mid[0], mid[1]);
  ok(hq?.kind === 'pipe' && hq.id === 'q1' && hq.name === 'P1', `clicking a pipe picks it (${hq?.kind} ${hq?.id})`);
  ok(S3.pickSite(pipesOnly, top, 2, 2) === null, 'clicking empty sky picks nothing');
}

// ---------------------------------------------------------------------------
section('view cube → the 3D camera');
{
  const VC = await mod('viewcube.js');
  const VCC = await mod('viewcube-camera.js');
  const sc = S3.buildSite3D(input, {});
  const cam = new Camera(); cam.setSize(900, 600); cam.standard('iso', sc.bbox);
  const t0 = cam.target.slice(), d0 = cam.distance;
  const opts = VCC.cameraCubeOptions(cam, {});
  const look = (key) => { opts.setView(VC.viewForTarget(key, opts.getView()), { animate: false }); return opts.getView(); };
  let v = look('front');
  ok(Math.abs(v.dir[1] - 1) < 1e-9 && Math.abs(v.up[2] - 1) < 1e-9, 'cube Front: the camera looks north (+Y, grid north), Z up on the screen');
  ok(cam.target.every((x, i) => Math.abs(x - t0[i]) < 1e-9) && Math.abs(cam.distance - d0) < 1e-6 * d0, 'the target and distance stay');
  v = look('top-front-right');
  const k = 1 / Math.sqrt(3);
  ok(Math.abs(v.dir[0] + k) < 1e-9 && Math.abs(v.dir[1] - k) < 1e-9 && Math.abs(v.dir[2] + k) < 1e-9, 'a corner (top front right) looks from up, south and east toward the site');
  look('front'); v = look('top');
  ok(v.dir[2] < -0.9999 && v.up[1] > 0.99, 'Top (coming from Front): straight down, north up — the plan\'s view');
  // the plan's cube: any other target from the plan view opens 3D looking from there
  const PLAN = { dir: [0, 0, -1], up: [0, 1, 0], persp: false };
  const fromPlan = VC.viewForTarget('right', PLAN);
  ok(Math.abs(fromPlan.dir[0] + 1) < 1e-9, 'from the plan, Right looks west (from the east side)');
}

// ---------------------------------------------------------------------------
section('GLB export (glTF 2.0 binary)');
const req = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'));
let validator = null;
try { validator = req('gltf-validator'); } catch { note('gltf-validator missing: (cd tools/modelcraft-test && npm install)'); }
const parseGLB = (glb) => {
  const dv = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
  const jl = dv.getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(glb.subarray(20, 20 + jl)));
  const bin = glb.subarray(28 + jl);
  const read = (ai) => { const a = json.accessors[ai], bv = json.bufferViews[a.bufferView]; const n = a.count * (a.type === 'VEC3' ? 3 : 1); return a.componentType === 5126 ? new Float32Array(bin.buffer.slice(bin.byteOffset + bv.byteOffset, bin.byteOffset + bv.byteOffset + n * 4)) : new Uint32Array(bin.buffer.slice(bin.byteOffset + bv.byteOffset, bin.byteOffset + bv.byteOffset + n * 4)); };
  return { json, read };
};
const FT = 1200 / 3937;
{
  const scene = S3.buildSite3D(input, { exag: 3, color: 'bands', show: { points: true, triangles: false } });
  const glb = EX.exportGLB(scene, { name: 'Fixture site' });
  fs.writeFileSync(path.join(OUT, 'site.glb'), glb);
  const dv = new DataView(glb.buffer);
  ok(dv.getUint32(0, true) === 0x46546c67 && dv.getUint32(4, true) === 2 && dv.getUint32(8, true) === glb.length && glb.length % 4 === 0, `GLB header, version 2, length and padding (${(glb.length / 1024).toFixed(0)} KB)`);
  if (validator) {
    const rep = await validator.validateBytes(glb, { maxIssues: 100 });
    ok(rep.issues.numErrors === 0, `Khronos glTF validator: ${rep.issues.numErrors} errors, ${rep.issues.numWarnings} warnings`);
    if (VERBOSE || rep.issues.numErrors) for (const i of rep.issues.messages.slice(0, 12)) console.log('       ' + i.severity + ' ' + i.code + ' ' + i.pointer + ' ' + i.message);
  }
  const { json, read } = parseGLB(glb);
  ok(json.asset.generator === 'CivilCraft' && json.scenes[0].extras.origin.easting === scene.origin.x && json.scenes[0].extras.units === 'US survey feet', 'generator, and the origin (easting, northing, elevation, units) recorded in extras');
  const names = json.meshes.map((m) => m.name);
  ok(['Existing ground', 'Graded surface', 'Pipes', 'Structures', 'Survey points', 'Alignments', 'Breaklines'].every((n) => names.includes(n)), 'surfaces, pipes, structures, lines and points are all in the file');
  ok(json.meshes.find((m) => m.name === 'Alignments').primitives[0].mode === 1 && json.meshes.find((m) => m.name === 'Survey points').primitives[0].mode === 0, 'lines as LINES, points as POINTS');
  // structures: rim in meters, Y up, true scale (the 3× exaggeration taken out)
  const smi = json.meshes.findIndex((m) => m.name === 'Structures');
  const sacc = json.accessors[json.meshes[smi].primitives[0].attributes.POSITION];
  const rims = [...project.networkCheck().structs.values()].map((s) => s.rim), sumps = [...project.networkCheck().structs.values()].map((s) => s.sump);
  near(sacc.max[1], (Math.max(...rims) - scene.origin.z) * FT, 1e-4, 'structures: highest rim, in meters above the origin, is the glTF +Y maximum (true scale)');
  near(sacc.min[1], (Math.min(...sumps) - scene.origin.z) * FT, 1e-4, 'structures: lowest sump is the +Y minimum');
  const s1 = project.state.network.structures[0];
  const sp = read(sacc.bufferView !== undefined ? json.meshes[smi].primitives[0].attributes.POSITION : 0);
  let found = false;
  for (let i = 0; i < sp.length; i += 3) if (Math.abs(sp[i] - (s1.x - scene.origin.x) * FT) < 1e-3 && Math.abs(sp[i + 2] - -(s1.y - scene.origin.y) * FT) < 1e-3) found = true;
  ok(found, 'Z up → Y up: easting → +X, northing → −Z (the centre of S1 is there)');
  const em = json.meshes.find((m) => m.name === 'Existing ground').primitives[0];
  const eacc = json.accessors[em.attributes.POSITION];
  const st = eg.stats();
  near(eacc.max[1], (st.maxZ - scene.origin.z) * FT, 1e-4, 'existing ground: highest point in meters, exaggeration undone');
  near(eacc.max[0] - eacc.min[0], (st.bounds.maxX - st.bounds.minX) * FT, 1e-3, 'existing ground: east–west extent in meters');
  const N = read(em.attributes.NORMAL);
  let nb = 0, up = 0;
  for (let i = 0; i < N.length; i += 3) { if (Math.abs(Math.hypot(N[i], N[i + 1], N[i + 2]) - 1) > 1e-4) nb++; if (N[i + 1] > 0) up++; }
  ok(nb === 0 && up === N.length / 3, 'surface normals are unit length and point up (+Y) at true scale');
  const g1 = EX.exportGLB(S3.buildSite3D(input, { exag: 1, color: 'bands', show: { points: true } }));
  const j1 = parseGLB(g1).json;
  ok(j1.accessors.every((a, i) => !a.max || a.max.every((v, k) => Math.abs(v - json.accessors[i].max[k]) < 1e-3)), 'the export is the same at 1× and 3× exaggeration (true scale)');
  // metric project: no unit conversion
  const mNet = { name: 'Storm', type: 'storm', rules: {}, structures: [{ id: 's1', name: 'A', x: 500000, y: 4000000, rim: 10, sumpDepth: 0.3, dia: 1200 }, { id: 's2', name: 'B', x: 500050, y: 4000000, rim: 9.5, sumpDepth: 0, dia: 1200 }], pipes: [{ id: 'q1', name: 'P', from: 's1', to: 's2', dia: 300, invUp: 8, invDn: 7.5 }] };
  const mg = EX.exportGLB(S3.buildSite3D({ units: 'm', network: mNet, check: PI_.analyzeNetwork(mNet, null, 'm'), points: [] }, {}));
  const mj = parseGLB(mg).json, ma = mj.accessors[mj.meshes.find((m) => m.name === 'Structures').primitives[0].attributes.POSITION];
  ok(Math.abs(ma.max[0] - ma.min[0] - 51.2) < 1e-3 && mj.scenes[0].extras.units === 'meters', 'metre project: meters stay meters (structures span 50 m + 1.2 m)');
  if (validator) ok((await validator.validateBytes(mg)).issues.numErrors === 0, 'the metre-project GLB validates too');
  const empty = EX.exportGLB(S3.buildSite3D({ units: 'ft', points: [] }, {}));
  if (validator) ok((await validator.validateBytes(empty)).issues.numErrors === 0, 'an empty scene still writes a valid GLB');
}

// ---------------------------------------------------------------------------
section('OBJ export');
{
  const scene = S3.buildSite3D(input, { exag: 2, show: { points: true } });
  const obj = EX.exportOBJ(scene, { name: 'Fixture site' });
  fs.writeFileSync(path.join(OUT, 'site.obj'), obj);
  const L = obj.split('\n');
  const v = L.filter((l) => l.startsWith('v ')).map((l) => l.split(' ').slice(1).map(Number));
  const fcount = L.filter((l) => l.startsWith('f ')).length, lcount = L.filter((l) => l.startsWith('l ')).length, pcount = L.filter((l) => l.startsWith('p ')).length;
  const tris = scene.meshes.reduce((n, m) => n + m.indices.length / 3, 0), segs = scene.lines.reduce((n, l) => n + l.positions.length / 6, 0);
  ok(fcount === tris && lcount === segs && pcount === scene.points.ids.length, `faces ${fcount}, line segments ${lcount}, points ${pcount} — as in the scene`);
  ok(L.some((l) => l === `# origin easting ${scene.origin.x} northing ${scene.origin.y} elevation ${scene.origin.z}`), 'the origin is written as a comment');
  let bad = 0;
  for (const l of L) if (/^[flp] /.test(l)) for (const t of l.split(' ').slice(1)) { const i = Number(t.split('/')[0]); if (!(i >= 1 && i <= v.length)) bad++; }
  ok(bad === 0, 'every face/line/point index refers to a vertex');
  const maxY = Math.max(...v.map((q) => q[1]));
  const st = eg.stats(), rims = [...project.networkCheck().structs.values()].map((s) => s.rim);
  near(maxY, (Math.max(st.maxZ, fg.stats().maxZ, ...rims) - scene.origin.z) * FT, 2e-4, 'OBJ: meters, Y up, exaggeration undone (highest vertex)');
}

// ---------------------------------------------------------------------------
section('a large surface stays quick');
{
  const r = rng(11), pts = [];
  for (let i = 0; i < 50500; i++) { const x = 6.2e6 + r() * 3000, y = 2.1e6 + r() * 3000; pts.push({ x, y, z: 500 + 20 * Math.sin(x / 300) + 15 * Math.cos(y / 400) }); }
  let t0 = performance.now();
  const big = TIN.buildSurface({ points: pts }).surface;
  const tTin = performance.now() - t0;
  const bigIn = { units: 'ft', eg: big, fg: null, contours: { eg: big.contours(2) }, interval: 2, major: 5, points: [] };
  t0 = performance.now();
  const sc = S3.buildSite3D(bigIn, { color: 'bands', bandCount: 8, exag: 2 });
  const tBands = performance.now() - t0;
  t0 = performance.now();
  S3.buildSite3D(bigIn, { color: 'single', exag: 2 });
  const tSingle = performance.now() - t0;
  ok(big.nT >= 100000, `${big.nT} triangles from ${pts.length} points (TIN ${tTin.toFixed(0)} ms)`);
  ok(sc.meshes.length === 1 && tBands < 3000 && tSingle < 1500, `the 3D scene builds in ${tBands.toFixed(0)} ms with bands, ${tSingle.toFixed(0)} ms in one colour, as one mesh`);
  t0 = performance.now();
  const glb = EX.exportGLB(sc);
  ok(performance.now() - t0 < 3000 && glb.length > 1e6, `GLB of it in ${(performance.now() - t0).toFixed(0)} ms (${(glb.length / 1048576).toFixed(1)} MB)`);
  if (validator) { const rep = await validator.validateBytes(glb, { maxIssues: 10 }); ok(rep.issues.numErrors === 0, `the large GLB validates (${rep.issues.numErrors} errors)`); }
}

console.log(`\n${pass} passed, ${fail} failed${KEEP ? ' — files in ' + OUT : ''}`);
if (!KEEP) fs.rmSync(OUT, { recursive: true, force: true });
process.exit(fail ? 1 : 0);

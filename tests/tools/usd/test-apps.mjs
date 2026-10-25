#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-apps.mjs — every app's USD export (0.7 XF.8, session `usd`): each app's `usd-<slug>.js` run in Node on that app's
 * own showcase / fixture data, the files read back by our reader (lib/usd) and, when the oracle is there, by the
 * reference library (its validators find no error; its world points of every mesh agree with ours).
 *
 *   node tools/usd/test-apps.mjs [--apps bimcraft,civilcraft,…] [--verbose] [--keep]
 *
 * Oracle (test-only, outside every repo): /var/www/CADCRAFT/oracles/usd-venv. Files in tmp/usd-apps-test/ (removed unless --keep).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { register } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = path.join(ROOT, 'public_html/assets/apps');
const PY = process.env.USD_ORACLE_PY || '/var/www/CADCRAFT/oracles/usd-venv/bin/python';
const VERBOSE = process.argv.includes('--verbose');
const KEEP = process.argv.includes('--keep');
const ai = process.argv.indexOf('--apps');
const ONLY = ai > 0 ? process.argv[ai + 1].split(',') : null;
const OUT = path.join(ROOT, 'tmp/usd-apps-test');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const U = await import(path.join(ROOT, 'lib/usd/index.js'));
const oracle = fs.existsSync(PY) ? (args) => execFileSync(PY, ['-I', path.join(ROOT, 'tools/usd/oracle.py'), ...args], { maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'ignore'] }).toString() : null;

// apps import vendored libraries by name (their manifests map them); Node gets the vendored builds
register('data:text/javascript,' + encodeURIComponent(`export async function resolve(spec, ctx, next) {
  const map = ${JSON.stringify({
    'manifold-3d': 'manifold-3d/current/manifold.js', proj4: 'proj4/current/proj4.esm.min.js', delaunator: 'delaunator/current/index.js',
    'robust-predicates': 'robust-predicates/current/index.js',
  })};
  if (map[spec]) return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor')).href)} + '/' + map[spec], shortCircuit: true };
  return next(spec, ctx);
}`), import.meta.url);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const section = (s) => console.log('\n== ' + s);
const want = (a) => !ONLY || ONLY.includes(a);
const quiet = async (fn) => { const l = console.log, w = console.warn; console.log = () => {}; console.warn = () => {}; try { return await fn(); } finally { console.log = l; console.warn = w; } };
const lang = async (app) => { const I = await import(path.join(APPS, app, 'dev/i18n.js')); const f = path.join(APPS, app, 'dev/lang/en.json'); if (fs.existsSync(f)) I.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(f, 'utf8')) }); };
const bytesOf = (d) => (typeof d === 'string' ? new TextEncoder().encode(d) : d);

/** Write the three formats, read each back with our reader, run the oracle's validators and points. → {stage, files} */
function checkFiles(app, make) {
  const files = [];
  let stage = null;
  for (const fmt of ['usda', 'usdc', 'usdz']) {
    const b = bytesOf(make(fmt));
    const f = path.join(OUT, app + '.' + fmt);
    fs.writeFileSync(f, b);
    files.push(f);
    try { const st = U.openStage(f, { read: (n) => (n === f ? b : null) }); if (fmt === 'usdc') stage = st; } catch (e) { ok(false, app + ': our reader opens the .' + fmt + ': ' + e.message); }
  }
  ok(!!stage, app + ': .usda, .usdc and .usdz written and read back');
  if (oracle) {
    fs.writeFileSync(path.join(OUT, app + '.json'), JSON.stringify(files));
    const checks = JSON.parse(oracle(['many', 'check', path.join(OUT, app + '.json')]));
    const errs = [];
    for (const [f, l] of Object.entries(checks)) {
      if (l === null) { errs.push(path.basename(f) + ' unreadable'); continue; }
      for (const e of l) if (/Error/.test(e.type)) errs.push(path.basename(f) + ' ' + e.validator + ': ' + e.message.slice(0, 140));
    }
    ok(!errs.length, app + ': the reference validators find no error in the three files' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
    const ref = JSON.parse(oracle(['points', files[1]]));
    let worst = 0, n = 0;
    const F = U.stageFrame(stage);
    for (const [p, r] of Object.entries(ref)) {
      const prim = stage.prim(p);
      const m = prim && U.meshOf(prim);
      if (!m || m.points.length / 3 !== r.points.length) { worst = Infinity; continue; }
      n++;
      const W = U.mul(F, U.worldMatrix(prim));
      for (let i = 0; i < r.points.length; i++) {
        const q = U.transformPoint(W, [m.points[i * 3], m.points[i * 3 + 1], m.points[i * 3 + 2]]);
        for (let c = 0; c < 3; c++) worst = Math.max(worst, Math.abs(q[c] - r.points[i][c]));
      }
    }
    ok(n > 0 && worst < 1e-6, `${app}: world points of ${n} meshes agree with the reference library (worst ${worst.toExponential(1)} m)`);
  } else console.log('  (no oracle: validators and points skipped)');
  return stage;
}

// ------------------------------------------------------------------ BimCraft
if (want('bimcraft')) {
  section('BimCraft: the showcase house IFC as USD (usd-bimcraft.js)');
  const B = path.join(APPS, 'bimcraft/dev');
  await lang('bimcraft');
  const WebIFC = await import(path.join(B, 'ifc/api.js'));
  const { IfcModel } = await import(path.join(B, 'ifc-model.js'));
  const { bimUsd } = await import(path.join(B, 'usd-bimcraft.js'));
  const ifc = await quiet(() => IfcModel.create(WebIFC, null));
  const model = await quiet(() => ifc.load(new Uint8Array(fs.readFileSync(path.join(ROOT, 'fixtures/showcase/bimcraft-house.ifc')))));
  const entries = [{ mi: 0, ifc, model, name: 'bimcraft-house.ifc', visible: true }];
  const out = {};
  for (const fmt of ['usda', 'usdc', 'usdz']) out[fmt] = await bimUsd(entries, { format: fmt, name: 'bimcraft-house.ifc' });
  const stage = checkFiles('bimcraft', (fmt) => out[fmt].data);
  const els = [...stage.walk()].filter((p) => p.props.has('ifc:globalId') && p.props.get('ifc:class') && !/^Ifc(Site|Building|BuildingStorey)$/.test(U.valueAt(p.props.get('ifc:class')).v));
  ok(els.length === model.elements + model.spaces && out.usdc.report.elements === els.length, `every element and space is a prim with its GlobalId (${els.length}; the model has ${model.elements} + ${model.spaces} spaces)`);
  const guids = new Set(els.map((p) => U.valueAt(p.props.get('ifc:globalId')).v));
  ok(guids.size === els.length && [...guids].every((g) => /^[0-9A-Za-z_$]{22}$/.test(g)), 'GlobalIds are the file\'s 22-character ids, each once');
  const storeys = [...stage.walk()].filter((p) => p.props.get('ifc:class') && U.valueAt(p.props.get('ifc:class')).v === 'IfcBuildingStorey');
  ok(storeys.length === model.storeys.length && storeys.every((s) => s.meta.get('kind')?.v === 'group'), `storeys: ${storeys.length}, kind group`);
  const discs = new Set([...stage.walk()].filter((p) => storeys.includes(p.parent)).map((p) => p.name));
  ok([...discs].every((d) => ['Architecture', 'Structure', 'MEP', 'Furnishing', 'Site', 'Spaces', 'Other'].includes(d)), 'discipline groups under the storeys: ' + [...discs].join(', '));
  const withProps = els.filter((p) => [...p.props.keys()].some((k) => k.startsWith('ifc:pset:') || k.startsWith('ifc:qto:')));
  ok(withProps.length > els.length / 2, `${withProps.length} elements carry their property / quantity sets`);
  const lens = els.flatMap((p) => [...p.props.values()].filter((q) => q.meta.get('customData')?.v.get('unit')?.v === 'm'));
  ok(lens.length > 0 && lens.every((q) => U.valueAt(q).v < 1000), `${lens.length} lengths in metres (none looks like millimetres)`);
  const spaces = [...stage.walk()].filter((p) => p.name === 'Spaces');
  ok(!model.spaces || (spaces.length && spaces.every((s) => U.purposeOf(s) === 'guide')), 'spaces are guides');
  // geometry back in the file's coordinates: the Site's transform undoes the coordination offset
  const C = [...ifc.api.GetCoordinationMatrix(model.modelID)];
  const bt = model.batches.find((x) => x.elems.ids.length);
  const key = bt.elems.ids[0], v0 = bt.elems.v0[0];
  const vy = [bt.positions[v0 * 3], bt.positions[v0 * 3 + 1], bt.positions[v0 * 3 + 2]];
  const Ci = U.invert(C);
  const fy = U.transformPoint(Ci, vy);
  const fileZ = [fy[0], -fy[2], fy[1]];
  const ep = els.find((p) => U.valueAt(p.props.get('ifc:globalId')).v === String(ifc.api.GetLine(model.modelID, key, false).GlobalId.value));
  const body = ep && ep.children.find((c) => c.typeName === 'Mesh');
  const m = body && U.meshOf(body);
  const got = m && U.transformPoint(U.worldMatrix(body), [m.points[0], m.points[1], m.points[2]]);
  ok(!!got && got.every((x, i) => Math.abs(x - fileZ[i]) < 1e-3), 'an element\'s first point lands at its IFC file coordinates (Z up): ' + (got ? got.map((x) => x.toFixed(3)).join(', ') + ' vs ' + fileZ.map((x) => x.toFixed(3)).join(', ') : 'none'));
  ifc.close();
}

// ------------------------------------------------------------------ CivilCraft
if (want('civilcraft')) {
  section('CivilCraft: the fixture site in 3D as USD (usd-civilcraft.js)');
  const C = path.join(APPS, 'civilcraft/dev');
  await lang('civilcraft');
  const mod = (f) => import(pathToFileURL(path.join(C, f)).href);
  const [PTS, PJ, S3, { siteUsd }] = await Promise.all([mod('points.js'), mod('project.js'), mod('site3d.js'), mod('usd-civilcraft.js')]);
  const TOOLS = path.join(ROOT, 'tools/civilcraft-test');
  const FIX = await import(pathToFileURL(path.join(TOOLS, 'make-fixture.mjs')).href);
  const fx = PTS.parsePoints(fs.readFileSync(path.join(TOOLS, 'site-topo.csv'), 'utf8'));
  const project = new PJ.Project();
  project.setPoints(fx.points, 'site-topo.csv');
  project.change('Breaklines', (st) => { for (const k of ['FL', 'TBN', 'TBS', 'RIDGE']) st.surface.groups[k] = 'breakline'; st.surface.groups.CP = 'off'; });
  project.change('Alignment', (st) => st.alignments.push({ id: 'a1', name: 'Access road', start: 1000, pis: [{ x: FIX.E0 + 10, y: FIX.N0 + 260, r: 0 }, { x: FIX.E0 + 200, y: FIX.N0 + 230, r: 120 }, { x: FIX.E0 + 390, y: FIX.N0 + 30, r: 0 }], pvis: [] }));
  const scene = S3.buildSite3D(S3.siteInput(project), { exag: 3, color: 'single', show: { ...S3.SHOW_DEFAULTS, points: true } });
  const out = {};
  for (const fmt of ['usda', 'usdc', 'usdz']) out[fmt] = siteUsd(scene, { format: fmt, name: 'fixture site', crs: { code: 'EPSG:2249' } });
  const stage = checkFiles('civilcraft', (fmt) => out[fmt].data);
  const r = out.usdc.report;
  ok(r.meshes >= 1 && r.lines >= 2 && r.points === fx.points.length, `surfaces (${r.meshes}), lines (${r.lines}) and every survey point (${r.points})`);
  const site = stage.root.children[0].children[0];
  ok(U.valueAt(site.props.get('ifc:crs:name'))?.v === 'EPSG:2249' && U.valueAt(site.props.get('ifc:class'))?.v === 'IfcSite', 'the Site names its coordinate system');
  // a survey point at its true project coordinates (feet → metres), exaggeration taken out
  const pts = [...stage.walk()].find((p) => p.typeName === 'Points');
  const W = U.worldMatrix(pts);
  const P = U.valueAt(pts.props.get('points')).v;
  const got = U.transformPoint(W, [P[0], P[1], P[2]]);
  const k = 1200 / 3937, p0 = fx.points[0];
  ok(Math.abs(got[0] - p0.x * k) < 1e-3 && Math.abs(got[1] - p0.y * k) < 1e-3 && Math.abs(got[2] - p0.z * k) < 1e-3, `point ${p0.n ?? 1} lands at its easting, northing and elevation in metres (${got.map((x) => x.toFixed(3)).join(', ')})`);
  const align = [...stage.walk()].filter((p) => p.parent && p.parent.name === 'Facility_Alignments');
  ok(align.length === 1 && align[0].meta.get('displayName')?.v === 'Access road', 'the alignment is its own curve, by name');
}

// ------------------------------------------------------------------ CadCraft
if (want('cadcraft')) {
  section('CadCraft: the 3D tab as USD (usd-cadcraft.js on the shared m3d writer)');
  const D = path.join(APPS, 'cadcraft/dev');
  await lang('cadcraft');
  const { Doc } = await import(path.join(D, 'doc.js'));
  const M3 = await import(path.join(D, 'model3d.js'));
  const { cadUsd } = await import(path.join(D, 'usd-cadcraft.js'));
  const d = new Doc();
  d.model3d.change('Box', (m) => M3.makeBox(m, [0, 0], [0.2, 0.1], 0, 0.05));
  d.model3d.change('Cylinder', (m) => M3.makeCylinder(m, [1, 1], 0.25, 0, 0.5));
  const out = {};
  for (const fmt of ['usda', 'usdc', 'usdz']) out[fmt] = cadUsd(d.model3d, { format: fmt, name: 'Drawing1' });
  const stage = checkFiles('cadcraft', (fmt) => out[fmt].data);
  const solids = stage.root.children[0].children.filter((p) => p.meta.get('kind')?.v === 'component');
  ok(solids.length === 2 && out.usdc.report.objects === 2, 'two solids, one component each');
  const box = solids.find((p) => p.children.some((c) => c.typeName === 'Mesh' && U.meshOf(c).points.length === 24));
  const bm = box && U.meshOf(box.children.find((c) => c.typeName === 'Mesh'));
  let lo = Infinity, hi = -Infinity;
  if (bm) for (let i = 0; i < bm.points.length; i += 3) { const q = U.transformPoint(U.worldMatrix(box), [bm.points[i], bm.points[i + 1], bm.points[i + 2]]); lo = Math.min(lo, q[2]); hi = Math.max(hi, q[2]); }
  ok(!!bm && Math.abs(lo) < 1e-6 && Math.abs(hi - 0.05) < 1e-6, 'the box keeps its height in metres (' + (hi - lo).toFixed(4) + ' m)');
}

// ------------------------------------------------------------------ DetailCraft
if (want('detailcraft')) {
  section('DetailCraft: the sample frame as USD (usd-detailcraft.js)');
  const D = path.join(APPS, 'detailcraft/dev');
  await lang('detailcraft');
  const { sampleModel } = await import(path.join(D, 'sample.js'));
  const { build } = await import(path.join(D, 'build.js'));
  const { markParts } = await import(path.join(D, 'marks.js'));
  const { steelUsd } = await import(path.join(D, 'usd-detailcraft.js'));
  const sm = sampleModel();
  const state = sm.state || sm;
  const built = build(state);
  const marks = markParts(built);
  const out = {};
  for (const fmt of ['usda', 'usdc', 'usdz']) out[fmt] = steelUsd(built, marks, { format: fmt, name: 'Sample frame' });
  const stage = checkFiles('detailcraft', (fmt) => out[fmt].data);
  const parts = [...stage.walk()].filter((p) => p.meta.get('kind')?.v === 'subcomponent');
  ok(parts.length === built.parts.length && out.usdc.report.assemblies === new Set(built.parts.map((p) => marks.asmOf.get(p.id))).size, `every part (${parts.length}) inside its assembly (${out.usdc.report.assemblies})`);
  ok(parts.every((p) => U.valueAt(p.props.get('cadcraft:mark'))?.v && U.valueAt(p.props.get('cadcraft:profile'))?.v), 'each part carries its mark and profile');
  // a member's solid: its volume = section area × length (closed and outward: the divergence theorem over its triangles)
  const first = built.parts.find((p) => !p.cuts.length && p.profile.loops.length);
  const pp = parts.find((p) => U.valueAt(p.props.get('cadcraft:mark')).v === marks.partMark.get(first.id));
  const body = pp.children.find((c) => c.typeName === 'Mesh');
  const m = U.meshOf(body);
  let vol = 0, at = 0;
  for (let f = 0; f < m.counts.length; f++) {
    const n = m.counts[f], q = [];
    for (let k = 0; k < n; k++) q.push(m.indices[at + k] * 3);
    at += n;
    for (let k = 1; k + 1 < n; k++) {
      const a = q[0], b = q[k], c = q[k + 1], P = m.points;
      vol += (P[a] * (P[b + 1] * P[c + 2] - P[b + 2] * P[c + 1]) - P[a + 1] * (P[b] * P[c + 2] - P[b + 2] * P[c]) + P[a + 2] * (P[b] * P[c + 1] - P[b + 1] * P[c])) / 6;
    }
  }
  const want_ = first.profile.area * 1e-6 * first.length / 1000;
  ok(Math.abs(vol - want_) / want_ < 0.01, `a member's solid has its volume, outward (${(vol * 1e6).toFixed(0)} cm³ vs area × length ${(want_ * 1e6).toFixed(0)} cm³)`);
}

// ------------------------------------------------------------------ PartCraft
if (want('partcraft')) {
  section('PartCraft: a part and an assembly as USD (usd-partcraft.js)');
  const DEV = path.join(APPS, 'partcraft/dev') + '/';
  await lang('partcraft');
  const F = await import(path.join(ROOT, 'tools/partcraft-test/fixtures.mjs'));
  const [K, P, A, Vx, { partUsd, assemblyUsd }] = await Promise.all(['kernel.js', 'part.js', 'assembly.js', 'vec.js', 'usd-partcraft.js'].map((f) => import(DEV + f)));
  const { default: Module } = await import(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
  const M = await Module(); M.setup();
  const fl = F.flange().part;
  fl.material = { name: 'Steel (carbon)', density: 7.85 };
  const r = K.regenerate(fl, M);
  const out = {};
  for (const fmt of ['usda', 'usdc', 'usdz']) out[fmt] = partUsd(fl, r, { format: fmt, name: 'flange.usdz' });
  const st = checkFiles('partcraft-part', (fmt) => out[fmt].data);
  const pp = st.root.children[0].children[0];
  const vol = U.valueAt(pp.props.get('cadcraft:volume'))?.v, mass = U.valueAt(pp.props.get('cadcraft:mass'))?.v;
  ok(Math.abs(vol - r.stats.volume * 1e-9) < 1e-12 && Math.abs(mass - r.stats.volume * 7.85e-6) < 1e-9, `the part's volume (${(vol * 1e6).toFixed(1)} cm³) and mass (${mass.toFixed(3)} kg)`);
  // Z up: the flange's height (PartCraft's Y) is the stage's Z, in metres
  const body = pp.children.find((c) => c.typeName === 'Mesh');
  const m = U.meshOf(body);
  let zlo = Infinity, zhi = -Infinity;
  for (let i = 2; i < m.points.length; i += 3) { zlo = Math.min(zlo, m.points[i]); zhi = Math.max(zhi, m.points[i]); }
  ok(Math.abs((zhi - zlo) - (r.stats.bbox.max[1] - r.stats.bbox.min[1]) / 1000) < 1e-6, 'Z up, metres: the height is PartCraft\'s Y extent');
  const box = P.newPart('Block');
  const s1 = P.addFeature(box, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: F.blockSketch(100, 50).sk });
  P.addFeature(box, 'extrude', { sketch: s1.id, depth: 20 });
  const asm = A.newAssembly('Flange stack');
  const i1 = A.insertPart(asm, fl);
  A.insertPart(asm, null, { pid: i1.part, place: Vx.translation([0, 0, 400]) });
  const ib = A.insertPart(asm, box, { place: Vx.translation([300, 0, 0]) });
  const builds = new Map([[i1.part, K.regenerate(P.readPart(asm.parts[i1.part].part), M)], [ib.part, K.regenerate(P.readPart(asm.parts[ib.part].part), M)]]);
  const world = A.placeAll(asm, builds).world;
  const ao = {};
  for (const fmt of ['usda', 'usdc', 'usdz']) ao[fmt] = assemblyUsd(asm, builds, world, { format: fmt, name: 'stack.usdz' });
  const sa = checkFiles('partcraft-asm', (fmt) => ao[fmt].data);
  const insts = sa.root.children[0].children.filter((p) => p.meta.get('kind')?.v === 'component');
  ok(ao.usdc.report.parts === 2 && insts.length === 3 && insts.every((p) => p.meta.get('instanceable')?.v === true && p.instanceKey), 'two prototypes, three instanceable placements');
  const shared = new Set(insts.map((p) => p.instanceKey));
  ok(shared.size === 2, 'the two flanges share one prototype');
}

// ------------------------------------------------------------------ TakeoffCraft
if (want('takeoffcraft')) {
  section('TakeoffCraft: the 3D check view as USD (usd-takeoffcraft.js)');
  const T = path.join(APPS, 'takeoffcraft/dev');
  await lang('takeoffcraft');
  const [Mo, Un, S3, { checkUsd }] = await Promise.all(['model.js', 'units.js', 'scene3d.js', 'usd-takeoffcraft.js'].map((f) => import(path.join(T, f))));
  const td = new Mo.Takeoff();
  const sk = Mo.sheetKey('d'.repeat(64), 0);
  td.setScale(sk, Un.scaleRecord({ method: 'preset', preset: 'a1/4', ftPerUnit: 1 / 18, label: '1/4"' }));
  const wall = td.addItem({ name: 'Wall', type: 'linear', heightFt: 10 });
  td.addMark({ item: wall, sheet: sk, pts: [{ x: 0, y: 0 }, { x: 18 * 20, y: 0 }, { x: 18 * 20, y: 18 * 10 }] });
  const slab = td.addItem({ name: 'Slab', type: 'area', heightFt: 0.5 });
  td.addMark({ item: slab, sheet: sk, pts: [{ x: 0, y: 0 }, { x: 18 * 20, y: 0 }, { x: 18 * 20, y: 18 * 10 }, { x: 0, y: 18 * 10 }] });
  const sc = S3.buildScene(td.state, sk);
  const out = {};
  for (const fmt of ['usda', 'usdc', 'usdz']) out[fmt] = checkUsd(sc, { format: fmt, name: 'Takeoff' });
  const st = checkFiles('takeoffcraft', (fmt) => out[fmt].data);
  const objs = st.root.children[0].children.filter((p) => p.meta.get('kind')?.v === 'component');
  ok(objs.length === out.usdc.report.objects && objs.length >= 2 && objs.every((p) => U.valueAt(p.props.get('cadcraft:item'))?.v), `${objs.length} objects, each with its item`);
  const w = objs.find((p) => U.valueAt(p.props.get('cadcraft:item')).v === 'Wall');
  const wm = w && U.meshOf(w.children.find((c) => c.typeName === 'Mesh'));
  let zh = 0; if (wm) for (let i = 2; i < wm.points.length; i += 3) zh = Math.max(zh, wm.points[i]);
  ok(Math.abs(zh - 10 * 0.3048) < 1e-5, 'the 10 ft wall is 3.048 m tall, Z up (' + zh.toFixed(4) + ')');
}

console.log(`\n${pass} passed, ${fail} failed`);
if (!KEEP) fs.rmSync(OUT, { recursive: true, force: true });
process.exit(fail ? 1 : 0);

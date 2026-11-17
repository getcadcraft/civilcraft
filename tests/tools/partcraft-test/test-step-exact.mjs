#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-step-exact.mjs — 0.9.1 FIX-091-EXACT-STEP: exact STEP (a true B-rep) written from the mesh kernel's result (step-exact.js).
 *
 * Each part is built with the shipped mesh kernel (manifold-3d), written with stepExact(), and read back by readers that are
 * not ours:
 *   - native OpenCascade 7.9 (cadquery-ocp in tools/partcraft-test/venv): the shape is VALID (BRepCheck_Analyzer), one solid
 *     per body, the number of faces, their surface types, and the exact volume;
 *   - occt-import-js (another OpenCascade build, wasm): reads it, same number of B-rep faces.
 * Volumes are compared with closed forms where there is one, else with the exact kernel's volume (OpenCascade as a test-only
 * oracle, never shipped), else with the mesh kernel's at a fine Curves setting.
 * OpenCascade is LGPL: test-only here. Without it the read-back checks are skipped and the writer's own checks run.
 *
 *   node tools/partcraft-test/test-step-exact.mjs [--verbose] [--keep]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const VERBOSE = process.argv.includes('--verbose'), KEEP = process.argv.includes('--keep');
const TMP = path.join(REPO, 'tmp/partcraft-test/step-exact');
fs.mkdirSync(TMP, { recursive: true });
const require = createRequire(import.meta.url);

let pass = 0, fail = 0, skipped = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const skip = (m) => { skipped++; console.log('  skip ' + m); };
const section = (t) => console.log('\n== ' + t);

const I18N = await import(DEV + 'i18n.js');
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
const K = await import(DEV + 'kernel.js'), P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js'), ST = await import(DEV + 'sketch-tools.js');
const SE = await import(DEV + 'step-exact.js');
const F = await import(path.join(HERE, 'fixtures.mjs'));
const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
const M = await Module(); M.setup();

// ---- second readers
const PY = path.join(HERE, 'venv/bin/python');
const HAVE_OCP = fs.existsSync(PY) && spawnSync(PY, ['-c', 'import OCP'], { encoding: 'utf8' }).status === 0;
const OCP_CODE = `
import sys, json
from OCP.STEPControl import STEPControl_Reader
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_SOLID, TopAbs_FACE, TopAbs_EDGE
from OCP.TopoDS import TopoDS
from OCP.BRepAdaptor import BRepAdaptor_Surface, BRepAdaptor_Curve
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from OCP.TopTools import TopTools_IndexedMapOfShape
from OCP.TopExp import TopExp
out = []
for f in sys.argv[1:]:
    r = STEPControl_Reader()
    if r.ReadFile(f) != 1:
        out.append({'read': False}); continue
    r.TransferRoots()
    sh = r.OneShape()
    g = GProp_GProps(); BRepGProp.VolumeProperties_s(sh, g, 1e-11, False, False)
    a = GProp_GProps(); BRepGProp.SurfaceProperties_s(sh, a)
    fm = TopTools_IndexedMapOfShape(); TopExp.MapShapes_s(sh, TopAbs_FACE, fm)
    em = TopTools_IndexedMapOfShape(); TopExp.MapShapes_s(sh, TopAbs_EDGE, em)
    sm = TopTools_IndexedMapOfShape(); TopExp.MapShapes_s(sh, TopAbs_SOLID, sm)
    st = {}
    for i in range(1, fm.Extent() + 1):
        t = str(BRepAdaptor_Surface(TopoDS.Face_s(fm.FindKey(i))).GetType()).split('_')[-1]
        st[t] = st.get(t, 0) + 1
    ct = {}
    for i in range(1, em.Extent() + 1):
        t = str(BRepAdaptor_Curve(TopoDS.Edge_s(em.FindKey(i))).GetType()).split('_')[-1]
        ct[t] = ct.get(t, 0) + 1
    b = Bnd_Box(); BRepBndLib.AddOptimal_s(sh, b, False, False)
    x0, y0, z0, x1, y1, z1 = b.Get()
    out.append({'read': True, 'valid': bool(BRepCheck_Analyzer(sh).IsValid()), 'solids': sm.Extent(), 'faces': fm.Extent(), 'edges': em.Extent(),
                'volume': g.Mass(), 'area': a.Mass(), 'surfaces': st, 'curves': ct, 'bbox': [x0, y0, z0, x1, y1, z1]})
print(json.dumps(out))
`;
function ocpRead(files) {
  const r = spawnSync(PY, ['-c', OCP_CODE, ...files], { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error('OCP: ' + r.stderr.slice(-600));
  return JSON.parse(r.stdout.trim().split('\n').pop());
}
let occt2 = null;
try { occt2 = await require('occt-import-js')(); } catch { /* skipped below */ }
let oc = null, B = null;
const OCCT = path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js');
if (fs.existsSync(OCCT)) { try { const { default: init } = await import(OCCT); oc = await init({ print: () => {}, printErr: () => {} }); B = await import(DEV + 'brep.js'); } catch { oc = null; } }

// ---- parts
const sketchOn = (part, plane, draw) => { const sk = S.newSketch(); draw(sk); return P.addFeature(part, 'sketch', { plane, sketch: sk }); };
const TOP = { kind: 'base', name: 'top' }, FRONT = { kind: 'base', name: 'front' };
const PI = Math.PI;
const parts = [];
const add = (key, part, want = {}) => parts.push({ key, part, want });

add('flange', F.flange().part, { volume: PI * 302160, faces: 14, surfaces: { Plane: 3, Cylinder: 10, Cone: 1 }, allExact: true, noSpline: true });
{
  const part = P.newPart('Holes'); const b = F.blockSketch(100, 50);
  const s1 = P.addFeature(part, 'sketch', { plane: TOP, sketch: b.sk });
  const e1 = P.addFeature(part, 'extrude', { sketch: s1.id, depth: 20 });
  const end = { kind: 'face', feature: e1.id, face: 'end' };
  const s2 = sketchOn(part, end, (sk) => { S.addPoint(sk, 20, 15); S.addPoint(sk, 20, 35); });
  const h1 = P.addFeature(part, 'hole', { sketch: s2.id, kind: 'cbore', d: 6, cboreD: 11, cboreDepth: 5, through: true });
  const s3 = sketchOn(part, end, (sk) => S.addPoint(sk, 50, 25));
  P.addFeature(part, 'hole', { sketch: s3.id, kind: 'csink', d: 6, csinkD: 12, csinkAngle: 90, through: false, depth: 12 });
  P.addFeature(part, 'lpattern', { seeds: [h1.id], dir: { kind: 'world', axis: 'x' }, count: 2, spacing: 50 });
  const s4 = sketchOn(part, end, (sk) => ST.addSlot(sk, [70, 10], [90, 10], 8));
  const c4 = P.addFeature(part, 'extrude', { sketch: s4.id, op: 'cut', end: 'blind', depth: 6 });
  P.addFeature(part, 'mirror', { seeds: [c4.id], plane: FRONT });
  add('holes', part, { oracle: true, allExact: true, noSpline: true });
}
{
  const part = P.newPart('Revolve');
  const s1 = sketchOn(part, FRONT, (sk) => { const pts = [[0, 0], [20, 0], [30, 10], [30, 25], [0, 25]]; for (let i = 0; i < pts.length; i++) S.addLine(sk, pts[i], pts[(i + 1) % pts.length]); S.addLine(sk, [0, -5], [0, 40], { construction: true }); });
  P.addFeature(part, 'revolve', { sketch: s1.id, angle: 270 });
  // 3/4 of: cylinder r20 h0 … cone frustum 20→30 over 10 + cylinder r30 × 15
  add('revolve270', part, { volume: 0.75 * (PI * 10 / 3 * (400 + 600 + 900) + PI * 900 * 15), allExact: true, noSpline: true });
}
{
  const part = P.newPart('Round');
  const s1 = sketchOn(part, FRONT, (sk) => { S.addArc(sk, [0, 0], [0, -20], [0, 20]); S.addLine(sk, [0, 20], [0, -20]); S.addCircle(sk, [40, 0], 5); S.addLine(sk, [0, -40], [0, 40], { construction: true }); });
  P.addFeature(part, 'revolve', { sketch: s1.id, angle: 360 });
  add('ball-and-ring', part, { volume: 4 / 3 * PI * 8000 + 2 * PI * PI * 40 * 25, solids: 2, surfaces: { Sphere: 1, Torus: 1 }, allExact: true });
}
{
  // a ball with a closed cavity: a void
  const part = P.newPart('Hollow');
  const s1 = sketchOn(part, FRONT, (sk) => { S.addArc(sk, [0, 0], [0, -20], [0, 20]); S.addLine(sk, [0, 20], [0, -20]); S.addLine(sk, [0, -40], [0, 40], { construction: true }); });
  P.addFeature(part, 'revolve', { sketch: s1.id, angle: 360 });
  const s2 = sketchOn(part, FRONT, (sk) => { S.addArc(sk, [0, 0], [0, -12], [0, 12]); S.addLine(sk, [0, 12], [0, -12]); S.addLine(sk, [0, -40], [0, 40], { construction: true }); });
  P.addFeature(part, 'revolve', { sketch: s2.id, angle: 360, op: 'cut' });
  add('hollow-ball', part, { volume: 4 / 3 * PI * (8000 - 1728), solids: 1, voids: 1, allExact: true });
}
{
  // a shaft drilled across: two cylinders crossing (a curve that is no line, circle or ellipse)
  const part = P.newPart('CrossDrilled');
  const s1 = sketchOn(part, TOP, (sk) => S.addCircle(sk, [0, 0], 15));
  P.addFeature(part, 'extrude', { sketch: s1.id, depth: 60 });
  const s2 = sketchOn(part, FRONT, (sk) => S.addCircle(sk, [0, 30], 5));
  P.addFeature(part, 'extrude', { sketch: s2.id, op: 'cut', end: 'mid', depth: 80 });
  // closed form: the bar less ∫ 2√(R²−x²) · 2√(r²−x²) dx over the hole's width (midpoint rule, 2 million steps)
  let hole = 0; { const R = 15, r = 5, n = 2e6; for (let i = 0; i < n; i++) { const x = -r + (i + 0.5) * 2 * r / n; hole += 2 * Math.sqrt(R * R - x * x) * 2 * Math.sqrt(r * r - x * x); } hole *= 2 * r / n; }
  add('cross-drilled', part, { volume: PI * 225 * 60 - hole, volTol: 1e-7, oracle: true, allExact: true, spline: true });
}
{
  // a round bar cut at an angle: an ellipse
  const part = P.newPart('Mitre');
  const s1 = sketchOn(part, TOP, (sk) => S.addCircle(sk, [0, 0], 15));
  P.addFeature(part, 'extrude', { sketch: s1.id, depth: 60 });
  const s2 = sketchOn(part, FRONT, (sk) => { const pts = [[-40, 70], [40, 70], [40, 50], [-40, 30]]; for (let i = 0; i < pts.length; i++) S.addLine(sk, pts[i], pts[(i + 1) % pts.length]); });
  P.addFeature(part, 'extrude', { sketch: s2.id, op: 'cut', end: 'mid', depth: 80 });
  // what is left: the cylinder up to the slanted plane, mean height 40
  add('mitre', part, { volume: PI * 225 * 40, volTol: 1e-6, surfaces: { Plane: 2, Cylinder: 1 }, ellipse: [15 * Math.sqrt(17) / 4, 15, [0, 0, 40]], allExact: true, noSpline: true });
}
{
  // fillets on straight edges: an L bracket's inside corner (adds material) and a cube's top edge
  const L = P.newPart('L');
  const sl = sketchOn(L, FRONT, (sk) => { const pts = [[0, 0], [80, 0], [80, 8], [8, 8], [8, 60], [0, 60]]; for (let i = 0; i < pts.length; i++) S.addLine(sk, pts[i], pts[(i + 1) % pts.length]); });
  P.addFeature(L, 'extrude', { sketch: sl.id, depth: 40 });
  const lb = K.regenerate(L, M);
  const inner = lb.edges.find((e) => e.type === 'line' && Math.abs(e.a[0] - 8) < 1e-4 && Math.abs(e.a[1] - 8) < 1e-4 && Math.abs(e.b[0] - 8) < 1e-4);
  P.addFeature(L, 'fillet', { edges: [{ faces: [...inner.faces], at: inner.at }], r: 6 });
  add('bracket-fillet', L, { volume: (80 * 8 + 8 * 52 + (36 - PI * 9)) * 40, surfaces: { Cylinder: 1 }, allExact: true, noSpline: true });
  const C = P.newPart('C');
  const sc = sketchOn(C, FRONT, (sk) => S.addRect(sk, [0, 0], [50, 50]));
  P.addFeature(C, 'extrude', { sketch: sc.id, depth: 50 });
  const cb = K.regenerate(C, M);
  const top = cb.edges.filter((e) => e.type === 'line' && Math.abs(e.a[1] - 50) < 1e-4 && Math.abs(e.b[1] - 50) < 1e-4);
  P.addFeature(C, 'fillet', { edges: [{ faces: [...top[0].faces], at: top[0].at }], r: 5 });
  P.addFeature(C, 'chamfer', { edges: [{ faces: [...top[2].faces], at: top[2].at }], d: 4 });
  // the fillet takes the first 5 mm of the chamfered edge, so the chamfer runs 45 mm and ends in a small flat step
  add('cube-fillet-chamfer', C, { volume: 125000 - (25 - PI * 25 / 4) * 50 - 8 * 45, surfaces: { Cylinder: 1 }, allExact: true, noSpline: true });
}
{
  // a spline side stays faceted; the round hole beside it is still a true cylinder
  const part = P.newPart('Spline');
  const s1 = sketchOn(part, TOP, (sk) => { S.addSpline(sk, [[0, 0], [30, 12], [60, -6], [90, 0]]); S.addLine(sk, [90, 0], [90, 40]); S.addLine(sk, [90, 40], [0, 40]); S.addLine(sk, [0, 40], [0, 0]); });
  const e1 = P.addFeature(part, 'extrude', { sketch: s1.id, depth: 12 });
  const s2 = sketchOn(part, { kind: 'face', feature: e1.id, face: 'end' }, (sk) => S.addPoint(sk, 45, 25));
  P.addFeature(part, 'hole', { sketch: s2.id, kind: 'simple', d: 10, through: true });
  add('spline-side', part, { holeFix: (PI - F.facetFactor(64)) * 25 * 12, faceted: true, surfaces: { Cylinder: 1 } });
}
{
  // a modelled M10 thread on a boss: the helix has no analytic surface, so it stays faceted; the block stays exact
  const part = P.newPart('Boss'); const b = F.blockSketch(40, 40);
  const s1 = P.addFeature(part, 'sketch', { plane: TOP, sketch: b.sk });
  const e1 = P.addFeature(part, 'extrude', { sketch: s1.id, depth: 10 });
  const s2 = sketchOn(part, { kind: 'face', feature: e1.id, face: 'end' }, (sk) => S.addCircle(sk, [20, 20], 5));
  P.addFeature(part, 'extrude', { sketch: s2.id, depth: 20 });
  const r0 = K.regenerate(part, M);
  const cyl = r0.faces.find((f) => f.type === 'cylinder');
  P.addFeature(part, 'thread', { faces: [{ name: cyl.name, at: cyl.at }], modelled: true });
  add('threaded-boss', part, { meshClose: 2e-3, faceted: true });
}
{
  // a cone with its point (a revolved triangle), and a shelled box (inner faces from the Shell feature)
  const part = P.newPart('Cone');
  const s1 = sketchOn(part, FRONT, (sk) => { S.addLine(sk, [0, 0], [20, 0]); S.addLine(sk, [20, 0], [0, 30]); S.addLine(sk, [0, 30], [0, 0]); S.addLine(sk, [0, -5], [0, 40], { construction: true }); });
  P.addFeature(part, 'revolve', { sketch: s1.id, angle: 360 });
  add('cone', part, { volume: PI * 400 * 30 / 3, faces: 2, surfaces: { Cone: 1, Plane: 1 }, allExact: true, noSpline: true });
  const bp = P.newPart('Box');
  const sb = P.addFeature(bp, 'sketch', { plane: TOP, sketch: F.blockSketch(100, 50).sk });
  P.addFeature(bp, 'extrude', { sketch: sb.id, depth: 20 });
  const rb = K.regenerate(bp, M);
  const top = rb.faces.find((f) => f.type === 'plane' && f.n[1] > 0.9);
  P.addFeature(bp, 'shell', { faces: [{ name: top.name, at: top.at }], t: 2 });
  add('shelled-box', bp, { volume: 100 * 50 * 20 - 96 * 46 * 18, allExact: true, noSpline: true });
}
{
  // the showcase frame (a weldment of hollow tubes): several bodies, two closed cavities, and empty cavities left out
  const part = P.readPart(fs.readFileSync(path.join(REPO, 'fixtures/showcase/partcraft-frame.partcraft.json'), 'utf8'));
  add('frame', part, { solids: 6, voids: 2, slivers: true, meshClose: 1e-5, anyFaces: true });
}
{
  // sixteen holes on a fine Curves setting: speed and many faces
  const fl = F.flange({ resolution: 256, holes: 16 });
  add('flange-256', fl.part, { volume: PI * (302160 + 8 * 49 * 30) - 16 * PI * 49 * 30, faces: 22, allExact: true, noSpline: true });
}

section('exact STEP from the mesh kernel: writing');
const files = [];
for (const it of parts) {
  const r = K.regenerate(it.part, M);
  const bad = [...r.results.values()].filter((x) => x.status !== 'ok');
  ok(!bad.length && r.mesh, `${it.key}: the mesh kernel builds it${bad.length ? ' (' + bad.map((x) => x.message).join('; ') + ')' : ''}`);
  if (!r.mesh) continue;
  it.regen = r;
  const t0 = performance.now();
  let out = null;
  try { out = SE.stepExact(r, it.part.name, { segments: it.part.resolution || 64 }); } catch (e) { ok(false, `${it.key}: stepExact threw ${e.message}`); continue; }
  it.ms = performance.now() - t0; it.out = out;
  const c = out.counts;
  ok(/^ISO-10303-21;/.test(out.text) && /ADVANCED_BREP_SHAPE_REPRESENTATION\(/.test(out.text) && !/FACETED_BREP|POLY_LOOP/.test(out.text) && /SI_UNIT\(\.MILLI\.,\.METRE\.\)/.test(out.text), `${it.key}: an advanced B-rep in millimetres, no faceted B-rep (${c.faces} faces, ${c.edges} edges, ${it.ms.toFixed(0)} ms)`);
  if (it.want.allExact) ok(c.faceted === 0 && !out.demoted.length, `${it.key}: every face on its exact surface (${c.exact} exact, ${c.faceted} faceted${out.demoted.length ? ', demoted ' + out.demoted.join(',') : ''})`);
  if (it.want.faceted) ok(c.faceted > 0 && c.exact > 0, `${it.key}: faceted where there is no analytic surface (${c.faceted}), exact elsewhere (${c.exact})`);
  if (it.want.noSpline) ok(c.spline === 0, `${it.key}: only lines, circles and ellipses (${c.line} / ${c.circle} / ${c.ellipse}), no fitted curve`);
  if (it.want.spline) ok(c.spline > 0 && out.maxDev <= SE.FIT_TOL, `${it.key}: ${c.spline} fitted curves, within ${out.maxDev.toExponential(1)} mm of both surfaces (limit ${SE.FIT_TOL})`);
  if (it.want.ellipse) {
    const m = /ELLIPSE\('',#(\d+),([-+0-9.E]+),([-+0-9.E]+)\)/.exec(out.text), [ea, eb, ec] = it.want.ellipse;
    const pl = m && new RegExp('#' + m[1] + "=AXIS2_PLACEMENT_3D\\('',#(\\d+),").exec(out.text);
    const cpt = pl && new RegExp('#' + pl[1] + "=CARTESIAN_POINT\\('',\\(([^)]*)\\)\\)").exec(out.text)?.[1].split(',').map(Number);
    ok(m && Math.abs(+m[2] - ea) < 1e-12 * ea && Math.abs(+m[3] - eb) < 1e-12 && cpt && cpt.every((x, i) => Math.abs(x - ec[i]) < 1e-9), `${it.key}: the ellipse as worked out by hand (semi-axes ${m?.[2]} and ${m?.[3]}, centre ${cpt})`);
  }
  if (it.want.voids !== undefined) ok(c.voids === it.want.voids && /BREP_WITH_VOIDS\(/.test(out.text), `${it.key}: ${c.voids} void(s)`);
  if (it.want.slivers) ok(c.slivers > 0, `${it.key}: ${c.slivers} empty cavities (no room inside) left out`);
  // Euler–Poincaré on what was written (per shell: V − E + F − (L − F) = 2 − 2g); here only that the counts are sane
  ok(c.vertices > 0 || c.faces <= 2, `${it.key}: vertices ${c.vertices}`);
  it.file = path.join(TMP, it.key + '.step');
  fs.writeFileSync(it.file, out.text);
  files.push(it);
}
{
  const fl = parts[0];
  const s214 = SE.stepExact(fl.regen, 'Flange', { schema: 'AP214' });
  ok(/FILE_SCHEMA\(\('AUTOMOTIVE_DESIGN/.test(s214.text) && /FILE_SCHEMA\(\('AP242_MANAGED_MODEL_BASED_3D_ENGINEERING/.test(fl.out.text), 'AP214 and AP242 schemas');
  fs.writeFileSync(path.join(TMP, 'flange-214.step'), s214.text);
  const yUp = SE.stepExact(fl.regen, 'Flange', { zUp: false });
  ok(yUp.text !== fl.out.text, 'zUp: false keeps the model axes');
  // work coordinates (the Manufacture button): the setup's origin and tool axis, through cam.js's own machine model
  const CAM = await import(DEV + 'cam.js');
  const model = CAM.machineModel(fl.regen, CAM.newSetup());
  const work = SE.stepExact(fl.regen, 'Flange', { map: model.toM });
  fs.writeFileSync(path.join(TMP, 'flange-work.step'), work.text);
  parts.workModel = model;
  let threw = null;
  try { SE.stepExact({ mesh: null }, 'x'); } catch (e) { threw = e; }
  ok(threw instanceof SE.StepExactError && threw.code === 'no_solid', 'no solid: StepExactError no_solid');
  const open = { mesh: { positions: fl.regen.mesh.positions, indices: fl.regen.mesh.indices.slice(3), triFace: fl.regen.mesh.triFace.slice(1) }, faces: fl.regen.faces };
  threw = null;
  try { SE.stepExact(open, 'x'); } catch (e) { threw = e; }
  ok(threw instanceof SE.StepExactError && threw.code === 'open', 'a mesh with a hole in it is refused (open)');
  // no face table at all: everything faceted, still a closed B-rep
  const bare = SE.stepExact({ mesh: { positions: fl.regen.mesh.positions, indices: fl.regen.mesh.indices }, faces: [] }, 'bare');
  ok(bare.counts.exact === 0 && bare.counts.faceted > 0, `no face table: ${bare.counts.faceted} flat faces`);
  fs.writeFileSync(path.join(TMP, 'bare.step'), bare.text);
}

section('exact STEP: read back by native OpenCascade 7.9 (valid solid, exact volume)');
if (!HAVE_OCP) skip('cadquery-ocp missing in tools/partcraft-test/venv: validity and exact volume not checked');
else {
  const res = ocpRead([...files.map((f) => f.file), path.join(TMP, 'flange-214.step'), path.join(TMP, 'bare.step'), path.join(TMP, 'flange-work.step')]);
  files.forEach((it, i) => {
    const o = res[i], w = it.want;
    ok(o.read && o.valid, `${it.key}: read, and BRepCheck says the shape is valid`);
    ok(o.solids === (w.solids || 1), `${it.key}: ${o.solids} solid(s)`);
    if (!w.anyFaces) ok(o.faces === it.out.counts.faces, `${it.key}: ${o.faces} faces, as written`);
    if (w.faces) ok(o.faces === w.faces, `${it.key}: ${w.faces} faces`);
    if (w.surfaces) ok(Object.entries(w.surfaces).every(([k, n]) => o.surfaces[k] === n), `${it.key}: surfaces ${JSON.stringify(o.surfaces)}`);
    if (w.curves) ok(Object.entries(w.curves).every(([k, n]) => o.curves[k] === n), `${it.key}: curves ${JSON.stringify(o.curves)}`);
    if (w.volume) ok(Math.abs(o.volume - w.volume) <= (w.volTol || 1e-9) * w.volume, `${it.key}: volume ${o.volume.toFixed(6)} = closed form ${w.volume.toFixed(6)} (rel ${(Math.abs(o.volume - w.volume) / w.volume).toExponential(1)})`);
    if (w.oracle) {
      if (!oc) skip(`${it.key}: exact kernel oracle missing`);
      else { const x = B.regenerateBrep(it.part, oc); const xv = x.stats?.volume; ok(xv > 0 && Math.abs(o.volume - xv) <= 2e-6 * xv, `${it.key}: volume ${o.volume.toFixed(6)} = the exact kernel's ${xv?.toFixed(6)} (rel ${(Math.abs(o.volume - xv) / xv).toExponential(1)})`); }
    }
    if (w.meshClose) { const mv = it.regen.stats.volume; ok(Math.abs(o.volume - mv) <= w.meshClose * mv, `${it.key}: volume ${o.volume.toFixed(3)} against the mesh's ${mv.toFixed(3)} (rel ${(Math.abs(o.volume - mv) / mv).toExponential(1)})`); }
    if (w.holeFix) { const mv = it.regen.stats.volume - w.holeFix; ok(Math.abs(o.volume - mv) <= 1e-6 * mv, `${it.key}: volume ${o.volume.toFixed(4)} = the mesh's less what the round hole takes beyond its 64 facets (${mv.toFixed(4)})`); }
    // Z up: the model's Y is the file's Z
    const bb = it.regen.stats.bbox;
    ok(Math.abs(o.bbox[2] - bb.min[1]) < 1e-3 + 2e-3 * Math.abs(bb.max[1] - bb.min[1]) && Math.abs(o.bbox[5] - bb.max[1]) < 1e-3 + 2e-3 * Math.abs(bb.max[1] - bb.min[1]), `${it.key}: Z up (${o.bbox[2].toFixed(3)} … ${o.bbox[5].toFixed(3)})`);
  });
  const o214 = res[files.length], obare = res[files.length + 1];
  ok(o214.read && o214.valid && o214.faces === 14 && Math.abs(o214.volume - PI * 302160) <= 1e-9 * PI * 302160, 'AP214: valid, 14 faces, exact volume');
  const owork = res[files.length + 2], wm = parts.workModel;
  ok(owork.read && owork.valid && Math.abs(owork.volume - PI * 302160) <= 1e-9 * PI * 302160 && [0, 1, 2].every((k) => Math.abs(owork.bbox[k] - wm.box.min[k]) < 1e-3 && Math.abs(owork.bbox[k + 3] - wm.box.max[k]) < 1e-3),
    `work coordinates: valid, same volume, and the box the machine model gives (Z ${owork.bbox[2].toFixed(3)} … ${owork.bbox[5].toFixed(3)}, the setup's origin at 0)`);
  ok(obare.read && obare.valid && obare.solids === 1 && Math.abs(obare.volume - parts[0].regen.stats.volume) <= 1e-6 * obare.volume, 'no face table: a valid faceted solid with the mesh\'s volume');
}

section('exact STEP: read back by occt-import-js');
if (!occt2) skip('occt-import-js missing (cd tools/partcraft-test && npm install)');
else for (const it of files) {
  const r = occt2.ReadStepFile(new Uint8Array(fs.readFileSync(it.file)), null);
  const nfaces = (r.meshes || []).reduce((n, m) => n + m.brep_faces.length, 0);
  ok(r.success && r.meshes.length === (it.want.solids || 1) && (it.want.anyFaces || nfaces === it.out.counts.faces), `${it.key}: ${r.meshes?.length} solid(s), ${nfaces} B-rep faces`);
}

if (!KEEP) fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed${skipped ? ', ' + skipped + ' skipped' : ''}`);
process.exit(fail ? 1 : 0);

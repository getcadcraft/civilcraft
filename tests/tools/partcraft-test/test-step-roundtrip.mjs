#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-step-roundtrip.mjs — 0.9.1 FX.223: a STEP file opened on the mesh kernel keeps its exact surfaces, so Export › STEP writes
 * them back as true planes, cylinders, cones, spheres and tori (before: every round face of an opened STEP left as flat facets).
 *
 * Each fixture is read by cc-step (step/read.js), repaired (meshimport.js), made a body by the shipped mesh kernel and written
 * by step-exact.js; native OpenCascade (cadquery-ocp in tools/partcraft-test/venv, test-only, never shipped) reads the original
 * and the export and must find a VALID solid with the same number of faces of each kind and the same volume. Also: the saved
 * part keeps the surfaces (and a damaged or older file falls back to facets, never an error), inches and Y up, a hole cut
 * after the import, and the flat faces sketches use keep their numbers. Spline, swept and revolved faces stay facets (said so).
 *
 *   node tools/partcraft-test/test-step-roundtrip.mjs [--verbose] [--keep]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const VERBOSE = process.argv.includes('--verbose'), KEEP = process.argv.includes('--keep');
const TMP = path.join(REPO, 'tmp/partcraft-test/step-roundtrip');
fs.mkdirSync(TMP, { recursive: true });

let pass = 0, fail = 0, skipped = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const skip = (m) => { skipped++; console.log('  skip ' + m); };
const section = (t) => console.log('\n== ' + t);

const I18N = await import(DEV + 'i18n.js');
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
const K = await import(DEV + 'kernel.js'), P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js'), ST = await import(DEV + 'sketch-tools.js');
const SE = await import(DEV + 'step-exact.js'), MI = await import(DEV + 'meshimport.js'), RD = await import(DEV + 'step/read.js');
const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
const M = await Module(); M.setup();

const PY = path.join(HERE, 'venv/bin/python');
const HAVE_OCP = fs.existsSync(PY) && spawnSync(PY, ['-c', 'import OCP'], { encoding: 'utf8' }).status === 0;
const OCP_CODE = `
import sys, json
from OCP.STEPControl import STEPControl_Reader
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
from OCP.TopAbs import TopAbs_SOLID, TopAbs_FACE
from OCP.TopTools import TopTools_IndexedMapOfShape
from OCP.TopExp import TopExp
from OCP.TopoDS import TopoDS
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
out = []
for f in sys.argv[1:]:
    r = STEPControl_Reader()
    if r.ReadFile(f) != 1:
        out.append({'read': False}); continue
    r.TransferRoots(); sh = r.OneShape()
    g = GProp_GProps(); BRepGProp.VolumeProperties_s(sh, g, 1e-10, False, False)
    fm = TopTools_IndexedMapOfShape(); TopExp.MapShapes_s(sh, TopAbs_FACE, fm)
    sm = TopTools_IndexedMapOfShape(); TopExp.MapShapes_s(sh, TopAbs_SOLID, sm)
    kinds = {}
    for i in range(1, fm.Extent() + 1):
        t = str(BRepAdaptor_Surface(TopoDS.Face_s(fm.FindKey(i))).GetType()).split('_')[-1]
        kinds[t] = kinds.get(t, 0) + 1
    b = Bnd_Box(); BRepBndLib.AddOptimal_s(sh, b, False, False)
    out.append({'read': True, 'valid': bool(BRepCheck_Analyzer(sh).IsValid()), 'solids': sm.Extent(), 'faces': fm.Extent(), 'volume': g.Mass(), 'kinds': kinds, 'bbox': list(b.Get())})
print('JSON' + json.dumps(out))
`;
const ocp = (files) => {
  const r = spawnSync(PY, ['-c', OCP_CODE, ...files], { encoding: 'utf8', maxBuffer: 1 << 26 });
  const line = (r.stdout || '').split('\n').find((l) => l.startsWith('JSON'));
  if (!line) throw new Error('OpenCascade did not answer: ' + (r.stderr || '').slice(-400));
  return JSON.parse(line.slice(4));
};
const kindsLine = (k) => Object.keys(k).sort().map((x) => `${k[x]} ${x}`).join(', ');

/** A STEP file → { read, fixed } as File › Open does it on the mesh kernel. */
const readFile = (file) => {
  const read = MI.meshFromStep(RD.readStep(new Uint8Array(fs.readFileSync(file))));
  return { read, fixed: MI.repairMesh(read) };
};
/** … and the part with it as its first feature. */
const partOf = (fixed, props = {}) => {
  const part = P.newPart('Imported');
  const g = P.addFeature(part, 'import', { file: 'x.step', mesh: MI.encodeMesh(fixed), units: 'mm', up: 'z', op: 'add', report: fixed.report, ...props });
  return { part, g };
};
const build = (part) => K.regenerate(part, M);

const FIX = path.join(REPO, 'fixtures/step'), FIX2 = path.join(REPO, 'fixtures/step-roundtrip');
// file → the exact faces the export must have (all of them)
const EXACT = [
  [path.join(FIX2, 'w-beam-cut-ends.step'), 'a W-beam with root fillets, two mitred ends and two bolt holes'],
  [path.join(FIX, 'plate.step'), 'a plate with four holes'],
  [path.join(FIX, 'boss.step'), 'a block with a round boss'],
  [path.join(FIX, 'rounded.step'), 'a box with every edge and corner rounded (cylinders and spheres)'],
  [path.join(FIX, 'cone.step'), 'a cone with its apex'],
  [path.join(FIX, 'frustum.step'), 'a frustum'],
  [path.join(FIX, 'sphere.step'), 'a whole sphere (one face, no edge)'],
  [path.join(FIX, 'torus.step'), 'a whole torus (one face, no edge)'],
  [path.join(FIX, 'assembly.step'), 'an assembly of three placed solids'],
  [path.join(FIX, 'box-inch.step'), 'a box in inches'],
];
const FACETED = [
  [path.join(FIX, 'extrusion.step'), 'a spline side (surface of extrusion)'],
  [path.join(FIX, 'loft.step'), 'a B-spline side'],
  [path.join(FIX, 'vase.step'), 'a surface of revolution'],
];

section('A STEP file opened on the mesh kernel goes back out exact');
const jobs = [];
for (const [file, what] of [...EXACT, ...FACETED]) {
  const name = path.basename(file);
  let out = null, r = null, err = '';
  try {
    const { fixed } = readFile(file);
    const { part, g } = partOf(fixed);
    r = build(part);
    if (r.results.get(g.id)?.status !== 'ok') throw new Error(r.results.get(g.id)?.message || 'not built');
    out = SE.stepExact(r, 'Imported', { segments: 64 });
  } catch (e) { err = String(e && e.message ? e.message : e); }
  ok(!!out, `${name}: opened, built and written${err ? ' — ' + err : ''}`);
  if (!out) continue;
  const dst = path.join(TMP, name);
  fs.writeFileSync(dst, out.text);
  jobs.push({ file, dst, name, what, counts: out.counts, exact: EXACT.some((x) => x[0] === file), inBytes: fs.statSync(file).size, outBytes: out.text.length });
}
for (const j of jobs.filter((x) => x.exact)) ok(j.counts.faceted === 0 && j.counts.exact === j.counts.faces, `${j.name} (${j.what}): every face exact (${j.counts.faces} faces, ${j.counts.faceted} facets; ${j.inBytes} bytes in, ${j.outBytes} out)`);
for (const j of jobs.filter((x) => !x.exact)) ok(j.counts.faceted > 0, `${j.name} (${j.what}): still written as facets, as the help says (${j.counts.faceted} facets)`);

section('Read back by native OpenCascade: the original and the export');
if (!HAVE_OCP) skip('cadquery-ocp is not installed in tools/partcraft-test/venv: no read-back');
else {
  const res = ocp(jobs.flatMap((j) => [j.file, j.dst]));
  jobs.forEach((j, i) => {
    const a = res[i * 2], b = res[i * 2 + 1];
    ok(b.read && b.valid && b.solids === a.solids, `${j.name}: the export is ${b.valid ? 'a valid' : 'NOT a valid'} shape of ${b.solids} solid(s) (the original has ${a.solids})`);
    if (j.exact) {
      ok(b.faces === a.faces && kindsLine(b.kinds) === kindsLine(a.kinds), `${j.name}: the same faces as the original (${kindsLine(a.kinds)}; export: ${kindsLine(b.kinds)})`);
      const dv = Math.abs(b.volume - a.volume) / a.volume;
      ok(dv < 1e-7, `${j.name}: the original's volume to 1e-7 (${a.volume} → ${b.volume}, off by ${dv.toExponential(2)})`);
    } else {
      const dv = Math.abs(b.volume - a.volume) / a.volume;
      ok(dv < 5e-3, `${j.name}: the faceted volume within 0.5 % (off by ${dv.toExponential(2)})`);
    }
  });
}

section('The saved part keeps the surfaces; older and damaged files fall back to facets');
{
  const { fixed } = readFile(path.join(FIX2, 'w-beam-cut-ends.step'));
  const nsurf = fixed.round ? fixed.round.surfs.length : 0, ncyl = fixed.round ? fixed.round.surfs.filter((q) => q.type === 'cylinder').length : 0;
  ok(!!fixed.round && ncyl === 6 && nsurf - ncyl >= 8 && fixed.round.triSurf.length === fixed.indices.length / 3 && !fixed.round.triSurf.includes(-1), `the repair keeps every triangle's surface (${nsurf} surfaces: ${nsurf - ncyl} planes, faces in one plane counted once, and ${ncyl} cylinders)`);
  const { part } = partOf(fixed);
  const text = P.toJSON(part);
  const again = P.readPart(JSON.parse(text));
  const m2 = again.features[0].mesh;
  ok(Array.isArray(m2.s) && m2.s.length === nsurf && typeof m2.f === 'string', 'saved and opened again: the import feature still has its surfaces');
  const c2 = SE.stepExact(build(again), 'x', { segments: 64 }).counts;
  ok(c2.faceted === 0 && c2.cylinder === 6 && c2.plane === 14, `… and exports exact again (${c2.cylinder} cylinders, ${c2.plane} planes, ${c2.faceted} facets)`);
  // a file from before 0.9.1 (no s / f)
  const old = JSON.parse(text); delete old.features[0].mesh.s; delete old.features[0].mesh.f;
  const oldPart = P.readPart(old);
  const c3 = SE.stepExact(build(oldPart), 'x', { segments: 64 }).counts;
  ok(oldPart.features[0].mesh.s === undefined && c3.cylinder === 0 && c3.faceted > 0, `a part saved before 0.9.1 opens as before: facets (${c3.faceted})`);
  // damaged surfaces: dropped, never an error
  const bad = [
    ['a surface of an unknown type', (m) => { m.s[3] = { type: 'blob', o: [0, 0, 0] }; }],
    ['a radius that is not a number', (m) => { const k = m.s.findIndex((q) => q.type === 'cylinder'); m.s[k].r = 'x'; }],
    ['a direction that is not unit length', (m) => { const k = m.s.findIndex((q) => q.type === 'cylinder'); m.s[k].d = [0, 0, 5]; }],
    ['a triangle list of the wrong length', (m) => { m.f = m.f.slice(0, -8); }],
    ['a triangle pointing past the list', (m) => { m.s = m.s.slice(0, 2); }],
  ];
  for (const [what, hurt] of bad) {
    const raw = JSON.parse(text); hurt(raw.features[0].mesh);
    let pr = null, c = null, err = '';
    try { pr = P.readPart(raw); c = SE.stepExact(build(pr), 'x', { segments: 64 }).counts; } catch (e) { err = String(e.message || e); }
    ok(pr && pr.features[0].mesh.s === undefined && c && c.cylinder === 0, `${what}: the surfaces are dropped and the body is its triangles${err ? ' — ' + err : ''}`);
  }
}

section('Flat faces keep their numbers; inches and Y up; a hole cut after the import');
{
  const { fixed } = readFile(path.join(FIX, 'plate.step'));
  const plain = { positions: fixed.positions, indices: fixed.indices, report: fixed.report };
  const a = build(partOf(fixed).part), b = build(partOf(plain).part);
  const flats = (r) => r.faces.filter((f) => /\.flat:\d+$/.test(f.name || '')).map((f) => `${f.name}@${f.at.map((x) => x.toFixed(3)).join(',')}`).sort().join(' ');
  ok(flats(a) === flats(b) && flats(a).length > 0, 'the flat faces a sketch can sit on have the same names and places with and without the kept surfaces');
  ok(a.faces.filter((f) => f.type === 'cylinder').length === 4 && b.faces.filter((f) => f.type === 'cylinder').length === 0, 'the four holes are cylinder faces now (none before)');
  const holes = a.faces.filter((f) => f.type === 'cylinder');
  ok(holes.every((f) => f.r > 0 && f.axis && Math.abs(Math.hypot(...f.axis.d) - 1) < 1e-9), `each hole face has an axis and a radius (r = ${holes.map((f) => +f.r.toFixed(4)).join(', ')})`);

  // inches, Y up: sizes × 25.4, and the round faces follow
  const { part: pin } = partOf(fixed, { units: 'in', up: 'y' });
  const rin = build(pin);
  const hin = rin.faces.filter((f) => f.type === 'cylinder');
  ok(hin.length === 4 && hin.every((f, i) => Math.abs(f.r - holes[0].r * 25.4) < 1e-6), `read as inches, Y up: four holes of radius ${hin[0] ? +hin[0].r.toFixed(3) : '?'} (${+holes[0].r.toFixed(3)} × 25.4)`);
  const cin = SE.stepExact(rin, 'x', { segments: 64 }).counts;
  ok(cin.faceted === 0 && cin.cylinder === 4, `… and the export is exact (${cin.cylinder} cylinders, ${cin.faceted} facets)`);

  // a hole drilled after the import: the file's faces and the new one, all exact
  const { part: pc } = partOf(fixed);
  const r0 = build(pc);
  const cand = (r0.candidates.get(pc.features[0].id) || []);
  const top = cand.map((c, i) => ({ c, i, f: r0.faces.find((f) => f.name === `${pc.features[0].id}.flat:${c.ref.entity}`) })).filter((x) => x.f).sort((p, q) => q.f.area - p.f.area)[0];
  ok(!!top, 'the imported plate offers a flat face to sketch on');
  if (top) {
    const sk = P.addFeature(pc, 'sketch', { plane: { kind: 'face', feature: pc.features[0].id, face: 'flat', entity: top.c.ref.entity } });
    const fr = top.c.frame, rel = top.f.at.map((x, k) => x - fr.o[k]);
    const dotv = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    S.addCircle(sk.sketch, [dotv(rel, fr.x), dotv(rel, fr.y)], 3);   // at the middle of the face, clear of the four holes
    P.addFeature(pc, "extrude", { sketch: sk.id, op: "cut", end: "through" });
    const r1 = build(pc);
    const bad = [...r1.results.values()].filter((x) => x.status === 'error');
    ok(!bad.length, 'a sketch on that face and a cut through the plate build' + (bad.length ? ' — ' + bad[0].message : ''));
    if (!bad.length) {
      const o = SE.stepExact(r1, 'x', { segments: 64 });
      ok(o.counts.cylinder === 5 && o.counts.faceted === 0, `the export has five true cylinders: four from the file, one drilled here (${o.counts.cylinder}, ${o.counts.faceted} facets)`);
      fs.writeFileSync(path.join(TMP, 'plate-drilled.step'), o.text);
      if (HAVE_OCP) { const [x] = ocp([path.join(TMP, 'plate-drilled.step')]); ok(x.valid && x.solids === 1 && x.kinds.Cylinder === 5, `OpenCascade: a valid solid with ${x.kinds.Cylinder} cylinders`); }
    }
  }
}

section('A flat face as DXF: round holes are true circles');
{
  const FC = await import(DEV + 'faces.js'), X = await import(DEV + 'export.js'), V = await import(DEV + 'vec.js');
  const { fixed } = readFile(path.join(FIX, 'plate.step'));
  const r = build(partOf(fixed).part);
  const grp = FC.planarGroups(r.mesh);
  const big = grp.groups.map((g, i) => ({ g, i })).sort((a, b) => b.g.area - a.g.area)[0];
  const fl = FC.faceLoops2D(r.mesh, big.g);
  const circles = FC.loopCircles(fl.frame, fl.loops, r.faces);
  const holes = r.faces.filter((f) => f.type === 'cylinder');
  ok(fl.loops.length === 5 && circles.filter(Boolean).length === 4 && circles[0] === null, `the plate's top face: ${fl.loops.length} outlines, the four holes found as circles, the rectangle not`);
  ok(circles.filter(Boolean).every((c) => holes.some((h) => h.r === c.r)), `each circle has its cylinder's own radius (${circles.filter(Boolean).map((c) => c.r).join(', ')}), not one fitted to the facets`);
  const d = X.dxfLoops(fl.loops, circles);
  ok(d.counts.circle === 4 && d.counts.polyline === 1 && (d.text.match(/\r\nCIRCLE\r\n/g) || []).length === 4 && (d.text.match(/\r\nPOLYLINE\r\n/g) || []).length === 1, 'the DXF has four CIRCLE entities and one POLYLINE');
  const plain = X.dxfLoops(fl.loops);
  ok(plain.counts.polyline === 5 && !/\r\nCIRCLE\r\n/.test(plain.text), 'without the circles it is five polylines, as before');
  // a body with no cylinder faces (the same triangles, no kept surfaces): nothing is guessed from the facets
  const r2 = build(partOf({ positions: fixed.positions, indices: fixed.indices, report: fixed.report }).part);
  const g2 = FC.planarGroups(r2.mesh).groups.sort((a, b) => b.area - a.area)[0];
  const fl2 = FC.faceLoops2D(r2.mesh, g2);
  ok(FC.loopCircles(fl2.frame, fl2.loops, r2.faces).every((c) => c === null), 'a body with no cylinder faces gets no circles: a many-sided polygon is never guessed to be round');
}

if (!KEEP) fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed${skipped ? `, ${skipped} skipped` : ''}`);
process.exit(fail ? 1 : 0);

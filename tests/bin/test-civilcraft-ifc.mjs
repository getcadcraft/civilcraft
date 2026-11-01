#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-ifc.mjs — 0.7.1 71.24 (semhustej): IFC as a first-class format in CivilCraft. The project export in IFC 4.3 ADD2,
 * IFC4 and IFC2x3 (ifc-civil-model.js + ifc-civil.js), the import (ifc-civil-read.js) and the round trip, checked three ways:
 * against CivilCraft's own geometry, through cc-ifc, and through IfcOpenShell (an independent reader: schema validation WITH the
 * EXPRESS where/global rules, its alignment API, its own geometry kernel for the alignment curves and the transition codes).
 *
 *   node bin/test-civilcraft-ifc.mjs [--verbose] [--no-ifcopenshell]
 *
 * Fixtures (made once by tools/civilcraft-test/make-ifc-fixture.mjs): tools/civilcraft-test/fixtures/ifc/demo.civilcraft.json and its
 * three exports; this test checks that the writer still gives those exact files. Temporary files (the feet / local-grid variant) go in
 * a temporary folder that is removed at the end.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
const FIX = path.join(REPO, 'tools/civilcraft-test/fixtures/ifc');
const VERBOSE = process.argv.includes('--verbose');
const PY = path.join(REPO, 'tools/detailcraft-test/venv/bin/python');
const IOS = !process.argv.includes('--no-ifcopenshell') && fs.existsSync(PY);
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m && spec !== 'three') return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const EN = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
(await mod('i18n.js')).init({ strings: EN });
const PJ = await mod('project.js'), IM = await mod('ifc-civil-model.js'), IW = await mod('ifc-civil.js'), RD = await mod('ifc-civil-read.js');
const CO = await mod('corridor.js'), SEC = await mod('sections.js');
const IMS = await mod('ifc-massing.js'), ILS = await mod('landscape/ifc-landscape.js'), AL = await mod('alignment.js'), PR = await mod('profile.js'), S3 = await mod('site3d.js');
const { IfcFile } = await mod('ifc/model.js'), { GeoCtx } = await mod('ifc/geo-ctx.js'), GA = await mod('ifc/geo-align.js');
await mod('ifc-civil-ui.js');   // loaded, so a slip in the dialog's module shows here first
const { demoProject } = await import(pathToFileURL(path.join(REPO, 'tools/civilcraft-test/make-ifc-fixture.mjs')).href);

let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 400) : '')); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-ifc-'));
const ios = (file) => JSON.parse(execFileSync(PY, ['-I', path.join(REPO, 'tools/civilcraft-test/ifc-check.py'), file, '--samples', '24'], { encoding: 'utf8', maxBuffer: 64 << 20 }));
const NOW = new Date('2026-10-26T00:00:00Z');

try {
  section('the demo project (fixture) and what the export collects');
  const json = fs.readFileSync(path.join(FIX, 'demo.civilcraft.json'), 'utf8');
  const p = PJ.Project.fromJSON(JSON.parse(json)).project;
  ok(JSON.stringify({ ...demoProject().toJSON(), saved: '2026-10-26T00:00:00.000Z' }, null, 1) + '\n' === json, 'the fixture project is the one make-ifc-fixture.mjs builds');
  const model = IM.civilIfcModel(p, { lat: 48.75, lon: 9 });
  const a = model.alignments[0], al = p.alignment(p.state.alignments[0]), prof = p.designProfile(p.state.alignments[0]);
  ok(model.alignments.length === 1 && al.ok && prof.ok, 'one alignment with its design profile');
  ok(a.h.map((s) => s.type).join(',') === 'LINE,CLOTHOID,CIRCULARARC,CLOTHOID,LINE,CIRCULARARC,LINE', 'horizontal segments: tangent, spiral, curve, spiral, tangent, curve, tangent', a.h.map((s) => s.type));
  ok(a.h[2].r0 === 400 && a.h[5].r0 === -300 && a.h[1].r0 === 0 && a.h[1].r1 === 400 && a.h[3].r0 === 400 && a.h[3].r1 === 0, 'radii signed: + turns left (400), − right (300); the spirals run 0 → R and R → 0');
  ok(a.v.map((s) => s.type).join(',') === 'CONSTANTGRADIENT,PARABOLICARC,CONSTANTGRADIENT,CONSTANTGRADIENT', 'vertical: grade, vertical curve, grade, grade (the break at 1700 has no curve)', a.v.map((s) => s.type));
  near(a.v[1].len, 120, 1e-9, 'the vertical curve is L = 120');
  near(a.v[1].g0, 7 / 300, 1e-12, 'the grade into it 7 m in 300 m');
  let joints = 0;
  for (let i = 0; i + 1 < a.h.length; i++) { const e = RD.segEnd(a.h[i]); if (Math.hypot(e.x - a.h[i + 1].x, e.y - a.h[i + 1].y) < 1e-6 && Math.abs(Math.sin(e.dir - a.h[i + 1].dir)) < 1e-9) joints++; }
  ok(joints === a.h.length - 1, 'every segment ends where the next starts, in the same direction (spirals integrated independently)', joints);
  ok(a.superEvents.length >= 8 && a.superEvents.some((e) => e.L < 0 || e.R < 0), 'superelevation: the transition stations, with the outside lane rising (negative fall-away)', a.superEvents.length);
  const c = model.corridors[0];
  ok(c && !c.standIn && c.parts.map((x) => x.side + x.part).sort().join() === 'Lcurb,Lgutter,Llane,Lstrip,Lwalk,Rcurb,Rgutter,Rlane,Rstrip,Rwalk', 'the urban corridor: lanes, gutter, curb, strip, walk on each side', c?.parts.map((x) => x.side + x.part));
  ok(c.cut && c.fill && c.volumes.cut > 0 && c.volumes.fill > 0, 'its daylight slopes split into cut and fill, with the corridor\'s cut and fill volumes', c.volumes);
  near(c.parts.find((x) => x.side === 'L' && x.part === 'lane').area / (c.to - c.from), 7.2, 0.25, 'two 3.6 m lanes a side: the lane surface is about 7.2 m wide');
  ok(model.surfaces.map((s) => s.key).join() === 'eg,fg' && model.surfaces[0].faces.length === 512, 'surfaces: existing ground (289 points, 512 triangles) and the graded surface');
  const pad = model.pads[0];
  ok(pad && pad.walls.length === 1 && pad.walls[0].mesh.closed && pad.walls[0].length > 40 && (pad.cut || pad.fill), 'the pad: top, slopes, one retaining wall run (a closed solid)', pad && { walls: pad.walls.length, len: pad.walls[0]?.length });
  {
    // the wall solid is watertight and outward: every edge used once each way, positive volume
    const m = pad.walls[0].mesh, E = new Map();
    for (let i = 0; i < m.idx.length; i += 3) for (let k = 0; k < 3; k++) { const u = m.idx[i + k], v = m.idx[i + (k + 1) % 3], key = u + '>' + v; E.set(key, (E.get(key) || 0) + 1); }
    let bad = 0; for (const [key, n] of E) { const [u, v] = key.split('>'); if (n !== 1 || E.get(v + '>' + u) !== 1) bad++; }
    let vol = 0; const P = m.pos;
    for (let i = 0; i < m.idx.length; i += 3) { const [A, B, C] = [0, 1, 2].map((k) => [P[m.idx[i + k] * 3], P[m.idx[i + k] * 3 + 1], P[m.idx[i + k] * 3 + 2]]); vol += (A[0] * (B[1] * C[2] - B[2] * C[1]) - A[1] * (B[0] * C[2] - B[2] * C[0]) + A[2] * (B[0] * C[1] - B[1] * C[0])) / 6; }
    ok(bad === 0, 'the wall\'s triangles close it: every edge once each way', bad);
    near(vol, pad.walls[0].volume, pad.walls[0].volume * 0.02, 'its volume (outward faces) ≈ face area × thickness');
  }
  ok(model.network.pipes.length === 1 && model.network.structures.length === 2 && model.network.structures.every((s) => s.rim > s.bottom), 'the storm sewer: 2 manholes (rim from the surface), 1 pipe');
  ok(model.parcels.length === 1 && Math.abs(model.parcels[0].area - 70 * 60) < 1e-6, 'the parcel, 70 × 60 m');
  ok(IM.modelEmpty(IM.civilIfcModel(new PJ.Project())) && !IM.modelEmpty(model), 'an empty project has nothing to write');

  section('pavement courses and design speed (owner 2026-10-26): recorded, shown in sections, quantified');
  {
    ok(JSON.stringify(CO.cleanLayers([{ name: 'A', t: 0.1, course: 'base' }, { t: -1 }, { name: 'x'.repeat(99), material: 'M', t: 0.2, course: 'mud' }, null, { t: 9 }], 'm')) === JSON.stringify([{ name: 'A', material: '', t: 0.1, course: 'base' }, { name: 'x'.repeat(60), material: 'M', t: 0.2, course: 'other' }]), 'cleanLayers: bad thickness dropped, names cut to 60, unknown kinds = other');
    const lanes = p.state.alignments[0].corridor.parts.L.filter((q) => q.type === 'lane');
    ok(lanes.length === 2 && lanes.every((q) => q.layers?.length === 2) && p.state.alignments[0].design?.speed === 80, 'the fixture file keeps the courses and the design speed through its own save / open');
    const old = JSON.parse(json);
    for (const sd of ['L', 'R']) for (const q of old.alignments[0].corridor.parts[sd]) delete q.layers;
    delete old.alignments[0].design;
    const po = PJ.Project.fromJSON(old).project;
    ok(!po.state.alignments[0].design && po.state.alignments[0].corridor.parts.L.every((q) => !q.layers) && !IM.civilIfcModel(po).corridors[0].courses.length, 'a file from before this change opens with no courses and no design speed (and writes none)');
    ok(PJ.cleanDesign({ speed: 50, unit: 'mph', cls: ' Arterial ' }).cls === 'Arterial' && PJ.cleanDesign({ speed: -5 }) === null && PJ.cleanDesign({ speed: 'x', cls: '' }) === null && PJ.cleanDesign({ speed: 60, unit: 'knots' }).unit === 'km/h', 'cleanDesign: speed > 0 with km/h or mph, a class as text; junk dropped');
    const it = p.graded().items.find((x) => x.kind === 'corridor'), q = CO.courseQuantities(it);
    const len = it.to - it.from;
    const inner = q.find((x) => x.side === 'L' && x.code === 'LANE' && x.k === 0), base = q.find((x) => x.side === 'L' && x.code === 'LANE' && x.k === 1);
    near(inner.area, 3.6 * len, 1e-6, 'by hand: the inner left lane\'s courses cover 3.6 m × ' + len + ' m (plan width is held through the superelevation)');
    near(inner.volume, 3.6 * len * 0.1, 1e-6, 'asphalt 0.10 m thick: volume = area × 0.10');
    near(base.volume, 3.6 * len * 0.25, 1e-6, 'base 0.25 m: area × 0.25');
    ok(q.length === 10 && q.filter((x) => x.part === 'walk').length === 2, 'every course of every part: 2 lanes × 2 courses × 2 sides + a walk course each side', q.length);
    const set = p.sections(Object.assign(p.state.alignments[0], { sampling: { step: 1000, left: 30, right: 30, extra: [1040] } }));
    delete p.state.alignments[0].sampling;
    const sx = set.sections.find((x) => Math.abs(x.sta - 1040) < 1e-6);   // a corridor section on the first tangent
    const lyr = sx.layers.filter((L) => L.side === 'R' && L.code === 'LANE');
    const top = SEC.zAt(sx.design, (lyr[0].a.o + lyr[0].b.o) / 2);
    ok(lyr.length === 2 && Math.abs(lyr[0].a.o) < 1e-6 && Math.abs(lyr[0].b.o - 3.6) < 1e-6, 'the section at 1+040 draws the right inner lane\'s two course bottoms from the centreline to 3.6 m', lyr);
    near(top - (lyr[1].a.z + lyr[1].b.z) / 2, 0.35, 1e-3, 'and the base course bottom lies 0.10 + 0.25 m under the design surface');
    const m0 = model.corridors[0].courses.find((x) => x.side === 'L' && x.code === 'LANE' && x.k === 0);
    let vol = 0; const P = m0.mesh.pos, I = m0.mesh.idx;
    for (let i = 0; i < I.length; i += 3) { const [A, B, C] = [0, 1, 2].map((k) => [P[I[i + k] * 3], P[I[i + k] * 3 + 1], P[I[i + k] * 3 + 2]]); vol += (A[0] * (B[1] * C[2] - B[2] * C[1]) - A[1] * (B[0] * C[2] - B[2] * C[0]) + A[2] * (B[0] * C[1] - B[1] * C[0])) / 6; }
    near(vol, m0.volume, m0.volume * 0.02, 'the course solid written to IFC holds its volume (closed, faces outward)');
  }

  section('the writer: the same project gives the same files (the fixtures), per schema');
  const out = {};
  for (const schema of IW.SCHEMAS) {
    const r = IW.writeCivilIfc(model, { schema, now: NOW, seed: 'ifc-demo' });
    out[schema] = r;
    const fixFile = path.join(FIX, 'demo-' + IW.SCHEMA_INFO[schema].file + '.ifc');
    ok(r.text === fs.readFileSync(fixFile, 'utf8'), schema + ': byte for byte the fixture ' + path.basename(fixFile) + ' (stable ids, ordering, numbers)');
    ok(r.text.includes("FILE_SCHEMA(('" + schema + "'));") && r.unit === 'm', schema + ': FILE_SCHEMA and metres');
    ok(IW.writeCivilIfc(model, { schema, now: NOW, seed: 'ifc-demo' }).text === r.text, schema + ': written twice, the same text');
    for (const k of IW.SCHEMA_INFO[schema].losses) ok(typeof EN[k] === 'string' && EN[k].length > 20, schema + ': the dialog says what it loses (' + k + ')');
  }
  const has = (sc, e) => out[sc].text.includes('=' + e + '(');
  ok(['IFCALIGNMENT', 'IFCALIGNMENTHORIZONTALSEGMENT', 'IFCALIGNMENTVERTICALSEGMENT', 'IFCGRADIENTCURVE', 'IFCCLOTHOID', 'IFCPOLYNOMIALCURVE', 'IFCROAD', 'IFCROADPART', 'IFCPAVEMENT', 'IFCKERB', 'IFCEARTHWORKSCUT', 'IFCEARTHWORKSFILL', 'IFCTRIANGULATEDIRREGULARNETWORK', 'IFCRELPOSITIONS', 'IFCREFERENT', 'IFCMAPCONVERSION', 'IFCPIPESEGMENT', 'IFCDISTRIBUTIONCHAMBERELEMENT', 'IFCDISTRIBUTIONSYSTEM', 'IFCRELVOIDSELEMENT'].every((e) => has('IFC4X3_ADD2', e)), 'IFC 4.3: alignment layouts + curves, road, road parts, pavement, kerb, earthworks, TIN, positions, referents, map conversion, pipes');
  ok(!has('IFC4X3_ADD2', 'IFCALIGNMENTCANT') && !has('IFC4X3_ADD2', 'IFCSEGMENTEDREFERENCECURVE'), 'IFC 4.3: no cant layout (road superelevation is events + surfaces)');
  ok(!['IFCALIGNMENT', 'IFCROAD', 'IFCPAVEMENT', 'IFCTRIANGULATEDIRREGULARNETWORK'].some((e) => has('IFC4', e)) && ['IFCCIVILELEMENT', 'IFCGROUP', 'IFCTRIANGULATEDFACESET', 'IFCMAPCONVERSION', 'IFCPOLYLINE'].every((e) => has('IFC4', e)), 'IFC4: civil elements, groups per road, triangulated face sets, map conversion, the alignment as a polyline');
  ok(!['IFCCIVILELEMENT', 'IFCTRIANGULATEDFACESET', 'IFCMAPCONVERSION', 'IFCPIPESEGMENT'].some((e) => has('IFC2X3', e)) && ['IFCBUILDINGELEMENTPROXY', 'IFCSHELLBASEDSURFACEMODEL', 'IFCFACETEDBREP', 'IFCFLOWSEGMENT', 'IFCOWNERHISTORY', 'IFCSYSTEM'].every((e) => has('IFC2X3', e)) && /ePSet_MapConversion/.test(out.IFC2X3.text), 'IFC2x3: proxies, surface models / faceted breps, flow segments, owner history, georeferencing in ePSet_MapConversion');
  ok(out.IFC4X3_ADD2.counts.alignments === 1 && out.IFC4X3_ADD2.counts.segments === a.h.length + a.v.length && out.IFC4X3_ADD2.counts.referents === 1 + 2 * a.superEvents.length, 'IFC 4.3 counts: segments = horizontal + vertical (+ the zero-length ends), referents = the station + two per superelevation event', out.IFC4X3_ADD2.counts);
  ok(/IFCALIGNMENTHORIZONTALSEGMENT\([^;]*,0\.,0\.,0\.,\$,\.LINE\.\);/.test(out.IFC4X3_ADD2.text) && /IFCALIGNMENTVERTICALSEGMENT\([^;]*,0\.,[^;]*\.CONSTANTGRADIENT\.\);/.test(out.IFC4X3_ADD2.text) && (out.IFC4X3_ADD2.text.match(/IFCLENGTHMEASURE\(0\.\),IFCLENGTHMEASURE\(0\.\)/g) || []).length >= 2, 'each layout and curve ends in the zero-length segment ADD2 asks for');
  near(out.IFC4X3_ADD2.georef.E0, 500400, 1e-9, 'IfcMapConversion eastings = the file origin (the content\'s middle, rounded to 100 m)');

  section('cc-ifc reads them; the alignment curve it draws is CivilCraft\'s');
  for (const schema of IW.SCHEMAS) {
    const f = IfcFile.open(new TextEncoder().encode(out[schema].text));
    ok(f.schemaName === IW.SCHEMA_INFO[schema].key && !f.errors.length, schema + ': cc-ifc opens it with no errors', f.errors);
  }
  {
    const f = IfcFile.open(new TextEncoder().encode(out.IFC4X3_ADD2.text)), g = new GeoCtx(f), o = out.IFC4X3_ADD2.origin;
    const comp = f.ofType('IFCCOMPOSITECURVE')[0], grad = f.ofType('IFCGRADIENTCURVE')[0];
    let worst = 0, worstZ = 0;
    for (let d = 0; d <= al.length; d += al.length / 60) {
      const q = GA.pointAlong(g, comp, d).p, w = al.pointAt(al.start + d);
      worst = Math.max(worst, Math.hypot(q[0] + o.x - w.x, q[1] + o.y - w.y));
      if (al.start + d <= prof.end) { const z = GA.pointAlong(g, grad, d).p[2]; worstZ = Math.max(worstZ, Math.abs(z - prof.elevationAt(al.start + d))); }
    }
    ok(worst < 0.05, 'cc-ifc\'s drawing of the footprint curve is within 5 cm of the alignment everywhere (its sampling)', worst);
    ok(worstZ < 0.01, 'and of the gradient curve within 1 cm of the profile', worstZ);
  }

  if (IOS) {
    section('IfcOpenShell (independent): schema + EXPRESS rules, its alignment API and geometry kernel');
    const chk = {};
    for (const schema of IW.SCHEMAS) {
      const r = chk[schema] = ios(path.join(FIX, 'demo-' + IW.SCHEMA_INFO[schema].file + '.ifc'));
      ok(r.rules && r.nproblems === 0, schema + ': ifcopenshell.validate with EXPRESS rules finds nothing', r.problems);
      ok(r.georef && Math.abs(r.georef.eastings - 500400) < 1e-6 && Math.abs(r.georef.northings - 5400400) < 1e-6 && /25832/.test(r.georef.crs), schema + ': georeferenced in EPSG:25832 at the origin', r.georef);
    }
    const r4 = chk.IFC4X3_ADD2, x = r4.alignments[0];
    ok(r4.counts.IfcRoad === 1 && r4.counts.IfcRoadPart === 3 && r4.counts.IfcPavement === 6 && r4.counts.IfcKerb === 2 && r4.counts.IfcEarthworksCut >= 1 && r4.counts.IfcEarthworksFill >= 1 && r4.counts.IfcWall === 1, 'IFC 4.3 classes: 1 road, 3 road parts (carriageway, roadside, sidewalk), 6 pavements, 2 kerbs, earthworks, 1 wall', r4.counts);
    ok(r4.predefined.IfcWall?.RETAININGWALL === 1 && r4.predefined.IfcRoadPart?.CARRIAGEWAY === 1 && r4.predefined.IfcRoadPart?.SIDEWALK === 1 && r4.predefined.IfcGeographicElement?.TERRAIN >= 3, 'predefined types: RETAININGWALL, CARRIAGEWAY, SIDEWALK, TERRAIN', r4.predefined);
    ok(r4.tree['IfcPavement in IfcRoadPart'] === 6 && r4.tree['IfcSite > IfcRoad'] === 1 && r4.tree['IfcProject > IfcAlignment,IfcSite'] === 1 && !r4.tree['IfcEarthworksCut in IfcRoad'], 'spatial tree: Project > Site > Road > Road parts > pavements; the alignment aggregated to the project; the cut not contained (it voids the ground)', r4.tree);
    ok(r4.psets.IfcRoad?.Pset_RoadDesignCriteriaCommon?.LaneWidth === 3.6 && r4.psets.IfcRoad?.Pset_RoadDesignCriteriaCommon?.NumberOfThroughLanes === 4, 'Pset_RoadDesignCriteriaCommon: lane width 3.6, 4 through lanes', r4.psets.IfcRoad);
    ok(r4.psets.IfcEarthworksFill?.Qto_EarthworksFillBaseQuantities?.CompactedVolume > 0 && r4.psets.IfcWall?.Qto_WallBaseQuantities?.Length > 40 && r4.psets.IfcPipeSegment?.Qto_PipeSegmentBaseQuantities?.Length === 60, 'quantities: fill volume, wall length, pipe length 60 m (IfcElementQuantity)');
    ok(r4.counts.IfcCourse === 10 && r4.predefined.IfcCourse?.PAVEMENT === 6 && r4.predefined.IfcCourse?.USERDEFINED === 4 && r4.psets.IfcCourse?.Qto_CourseBaseQuantities?.Thickness === 0.1, 'IFC 4.3: 10 IfcCourse (asphalt and pavers PAVEMENT, base USERDEFINED "Base course"), Qto_CourseBaseQuantities with the thickness', { c: r4.counts.IfcCourse, p: r4.predefined.IfcCourse });
    {
      const T = out.IFC4X3_ADD2.text, ids = [...T.matchAll(/^(#\d+)=IFCCOURSE\(/gm)].map((m) => m[1]), contained = [...T.matchAll(/IFCRELCONTAINEDINSPATIALSTRUCTURE\([^;]*/g)].join(' ');
      ok(r4.tree['IfcPavement > IfcCourse'] >= 2 && ids.length === 10 && ids.every((i) => !new RegExp(i + '[,)]').test(contained)), 'the courses are parts of their pavement (IfcRelAggregates), never contained on their own', r4.tree);
    }
    near(r4.psets.IfcRoad?.Pset_RoadDesignCriteriaCommon?.DesignSpeed, 80 / 3.6, 1e-6, 'Pset_RoadDesignCriteriaCommon.DesignSpeed = 80 km/h in m/s');
    ok(r4.psets.IfcRoad?.Pset_RoadDesignCriteriaCommon?.RoadDesignClass === 'Collector', 'RoadDesignClass = Collector');
    ok(chk.IFC4.counts.IfcCivilElement >= 21 && chk.IFC2X3.counts.IfcBuildingElementProxy >= 26, 'IFC4 / IFC2x3: the courses as civil elements / proxies', { a: chk.IFC4.counts, b: chk.IFC2X3.counts });
    const H = x.layouts.find((l) => l.type === 'IfcAlignmentHorizontal'), V = x.layouts.find((l) => l.type === 'IfcAlignmentVertical');
    ok(H.segments.length === a.h.length + 1 && H.segments.at(-1).SegmentLength === 0 && V.segments.length === a.v.length + 1, 'its alignment API reads every layout segment (+ the zero-length end)');
    ok(H.segments.map((s) => s.PredefinedType).join() === a.h.map((s) => s.type).join() + ',LINE' && H.segments[2].StartRadiusOfCurvature === 400 && H.segments[5].StartRadiusOfCurvature === -300, 'segment types and signed radii as written');
    ok(x.referents[0].type === 'STATION' && x.referents[0].psets.Pset_Stationing.Station === 1000 && x.referents.filter((q) => q.type === 'SUPERELEVATIONEVENT').length === 2 * a.superEvents.length, 'referents: STATION 1000 (Pset_Stationing), superelevation events (Pset_Superelevation)');
    const fp = x.samples.FootPrint, ax = x.samples.Axis, o = out.IFC4X3_ADD2.origin;
    ok(fp && !fp.error && Math.abs(fp.length - al.length) < 1e-4, 'IfcOpenShell evaluates the IfcCompositeCurve; its length is the alignment\'s (' + al.length.toFixed(4) + ')', fp);
    let worst = 0;
    for (const [u, X, Y] of fp.pts) { const w = al.pointAt(al.start + u); worst = Math.max(worst, Math.hypot(X + o.x - w.x, Y + o.y - w.y)); }
    ok(worst < 1e-3, 'every point IfcOpenShell computes on the footprint (lines, clothoids, arcs both ways) is within 1 mm of CivilCraft\'s alignment', worst);
    let worstZ = 0;
    for (const [u, X, Y, Z] of ax.pts) { const w = al.pointAt(al.start + u); worstZ = Math.max(worstZ, Math.abs(Z - prof.elevationAt(al.start + u)), Math.hypot(X + o.x - w.x, Y + o.y - w.y)); }
    ok(ax && !ax.error && worstZ < 1e-3, 'and on the IfcGradientCurve: plan within 1 mm, height within 1 mm of the design profile (parabola included)', worstZ);
    const tr = x.transitions || [];
    ok(tr.length >= a.h.length + a.v.length && tr.every((q) => q.written === q.computed), 'every IfcCurveSegment.Transition written equals the one IfcOpenShell works out from the geometry', tr.filter((q) => q.written !== q.computed));
    const r4b = chk.IFC4, r2 = chk.IFC2X3;
    ok(r4b.counts.IfcCivilElement >= 11 && r4b.psets.IfcCivilElement?.CadCraft_Alignment?.PIs && r2.counts.IfcBuildingElementProxy >= 16 && r2.counts.IfcFlowSegment === 1, 'IFC4 / IFC2x3 fallbacks as described; the PI table in CadCraft_Alignment', { a: r4b.counts, b: r2.counts });
    ok(r2.psets.IfcWall?._ObjectType === 'Retaining wall' && r4b.psets.IfcWall?._ObjectType === 'Retaining wall', 'a retaining wall says so in ObjectType where the schema has no RETAININGWALL');
  } else console.log('  (IfcOpenShell not found: those checks skipped)');

  section('import: the round trip (export → import gives the same alignment)');
  for (const schema of IW.SCHEMAS) {
    const r = RD.readCivilIfc(new TextEncoder().encode(out[schema].text), { units: 'm' });
    const b = r.alignments[0], src = p.state.alignments[0];
    ok(r.alignments.length === 1 && b.from === (schema === 'IFC4X3_ADD2' ? 'layout' : 'pset'), schema + ': one alignment, read from ' + (schema === 'IFC4X3_ADD2' ? 'the IFC 4.3 layout' : 'its PI table'), b?.from);
    near(b.start, 1000, 1e-9, schema + ': start station');
    let dPi = 0, dR = 0;
    src.pis.forEach((q, i) => { dPi = Math.max(dPi, Math.hypot(q.x - b.pis[i].x, q.y - b.pis[i].y)); dR = Math.max(dR, Math.abs((q.r || 0) - b.pis[i].r), Math.abs((q.ls1 || 0) - (b.pis[i].ls1 || 0)), Math.abs((q.ls2 || 0) - (b.pis[i].ls2 || 0))); });
    ok(b.pis.length === src.pis.length && dPi < 1e-5 && dR < 1e-6, schema + ': the same PIs (within 0.01 mm), radii and spiral lengths', { dPi, dR, pis: b.pis });
    let dV = 0;
    src.pvis.forEach((q, i) => { dV = Math.max(dV, Math.abs(q.sta - b.pvis[i].sta), Math.abs(q.z - b.pvis[i].z), Math.abs(q.L - b.pvis[i].L)); });
    ok(b.pvis.length === src.pvis.length && dV < 1e-5, schema + ': the same PVIs (station, elevation, curve length)', { dV, pvis: b.pvis });
    ok(b.design?.speed === 80 && b.design.unit === 'km/h' && b.design.cls === 'Collector', schema + ': the design speed and class come back', b.design);
    const eg = r.surfaces.find((s) => s.kind === 'eg');
    ok(eg && eg.faces.length === 512 && eg.pts.length === 289, schema + ': the existing ground comes back as a TIN of 289 points and 512 triangles', eg && [eg.pts.length, eg.faces.length]);
    ok(r.refs.length >= 15 && r.refs.every((x) => x.positions.length && x.indices.length), schema + ': the other elements as reference meshes', r.refs.length);
    // the imported alignment rebuilds with CivilCraft's own code to the same geometry
    const al2 = AL.buildAlignment({ pis: b.pis, start: b.start }), pr2 = PR.buildProfile(b.pvis);
    let d = 0; for (let s = al.start; s <= al.end; s += 7) { const u = al.pointAt(s), v = al2.pointAt(s); d = Math.max(d, Math.hypot(u.x - v.x, u.y - v.y)); }
    ok(al2.ok && Math.abs(al2.length - al.length) < 1e-5 && d < 1e-5 && pr2.ok && Math.abs(pr2.elevationAt(1170) - prof.elevationAt(1170)) < 1e-6, schema + ': rebuilt, the alignment and profile match the original everywhere', { d, len: al2.length - al.length });
  }
  {
    const r = RD.readCivilIfc(new TextEncoder().encode(out.IFC4X3_ADD2.text), { units: 'm' });
    const q = new PJ.Project(); q.state.units = 'm';
    const res = RD.applyIfcImport(q, r, { eg: r.surfaces.findIndex((s) => s.kind === 'eg'), refs: true, file: 'demo-4x3.ifc' });
    ok(res.alignments.length === 1 && res.eg && q.eg().surface?.nT === 512 && q.state.surface.tin.from === 'ifc' && q.undoStack.length === 1, 'into a project: the alignment and the existing ground (marked as from IFC) in ONE undo step', { res, undo: q.undoStack.length });
    ok(q.ifcRefs.length === r.refs.length + r.surfaces.length - 1 && q.alignment(q.state.alignments[0]).ok, 'the rest (the graded surface too) as reference elements');
    const sc = S3.buildSite3D(S3.siteInput(q), {});
    ok(sc.meshes.some((m) => m.key === 'ifc-refs' && m.indices.length > 1000), 'the 3D view draws them (mesh "ifc-refs")');
    q.undo();
    ok(!q.state.alignments.length && !q.eg().surface, 'undo takes the alignment and the ground back out');
  }

  section('a feet project in a local (ground) system, landscape and masses, all schemas');
  {
    const q = new PJ.Project(), s = q.state;
    s.units = 'ft'; s.name = 'Feet ground system';
    s.crs = { code: 2277, name: 'NAD83 / Texas Central (ftUS)', proj4: '+proj=lcc +lat_0=29.6666666666667 +lon_0=-100.333333333333 +lat_1=31.8833333333333 +lat_2=30.1166666666667 +x_0=700000 +y_0=3000000 +ellps=GRS80 +units=us-ft +no_defs', unit: 'ftUS',
      local: { scale: 1.00012, rotation: 30, from: [5000, 5000], to: [3100000, 10070000] } };
    const pts = [];
    for (let i = 0; i <= 10; i++) for (let j = 0; j <= 10; j++) pts.push({ n: pts.length + 1, x: 4500 + i * 100, y: 4500 + j * 100, z: 700 + i * 0.5 + j * 0.2, d: 'G' });
    q.setPoints(pts, 'g.csv');
    s.alignments.push({ id: 'a1', name: 'Ranch road', start: 0, pis: [{ x: 4600, y: 4600, r: 0 }, { x: 5000, y: 4700, r: 300 }, { x: 5300, y: 5300, r: 0 }], pvis: [{ sta: 0, z: 701, L: 0 }, { sta: 400, z: 705, L: 200 }, { sta: 700, z: 703, L: 0 }] });
    s.seq = 2;
    const m2 = IM.civilIfcModel(q);
    m2.masses = [{ id: 'm9', name: 'Barn', use: 'farm', pts: [{ x: 5200, y: 4600 }, { x: 5260, y: 4600 }, { x: 5260, y: 4640 }, { x: 5200, y: 4640 }], floors: 2, floorHeight: 12, z0: 702, base: 'stepped', ground: 'eg', parcel: '' }];
    m2.landscape = [
      { cls: 'IfcGeographicElement', predefined: 'VEGETATION', name: 'Live oak', tag: 'l1', at: { x: 5100, y: 4800, z: 703 }, body: { kind: 'cylinders', parts: [{ r: 1, z0: 0, z1: 12 }, { r: 15, z0: 12, z1: 40 }] },
        type: { key: 'plant-oak', cls: 'IfcGeographicElementType', predefined: 'VEGETATION', name: 'Live oak (Quercus virginiana)', psets: { CadCraft_Plant: { BotanicalName: 'Quercus virginiana', MatureHeight: 15 } } }, psets: { CadCraft_Planting: { Source: 'plant', TreeCount: 1 } } },
      { cls: 'IfcPavement', predefined: 'NOTDEFINED', name: 'Patio', tag: 'h1', at: { x: 5150, y: 4700, z: 702.5 }, body: { kind: 'prism', pts: [{ x: -10, y: -10 }, { x: 10, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }], z0: -0.5, z1: 0 }, material: [{ name: 'Pavers', thickness: 0.2 }, { name: 'Sand', thickness: 0.3 }] },
      { cls: 'IfcStair', predefined: 'STRAIGHT_RUN_STAIR', name: 'Steps', tag: 'h2', at: { x: 5170, y: 4700, z: 702.5, rot: 0.5 }, body: { kind: 'prisms', list: [{ pts: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 4 }, { x: 0, y: 4 }], z0: 0, z1: 0.6 }, { pts: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 4 }, { x: 1, y: 4 }], z0: 0, z1: 1.2 }] } },
      { cls: 'IfcBuildingElementProxy', predefined: 'USERDEFINED', objectType: 'Boulder', name: 'Boulder', tag: 'f1', at: { x: 5120, y: 4760, z: 703 }, body: { kind: 'mesh', positions: [0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3], indices: [0, 2, 1, 0, 1, 3, 1, 2, 3, 0, 3, 2] } },
    ];
    for (const schema of IW.SCHEMAS) {
      const r = IW.writeCivilIfc(m2, { schema, now: NOW, seed: 'feet' });
      ok(r.unit === 'ftUS' && /'US survey foot'/.test(r.text) && r.counts.masses === 1 && r.counts.landscape === 4, schema + ': US survey foot (IfcConversionBasedUnit), a mass, four landscape objects', r.counts);
      const E = 3100000 + 1.00012 * (Math.cos(Math.PI / 6) * (r.origin.x - 5000) - Math.sin(Math.PI / 6) * (r.origin.y - 5000));
      near(r.georef.E0, E, 1e-6, schema + ': the map conversion carries the local system: eastings = the origin in grid coordinates');
      ok(Math.abs(r.georef.xa - Math.cos(Math.PI / 6)) < 1e-12 && Math.abs(r.georef.scale - 1.00012) < 1e-12, schema + ': its rotation (30°) and scale');
      const file = path.join(TMP, 'feet-' + IW.SCHEMA_INFO[schema].file + '.ifc');
      fs.writeFileSync(file, r.text);
      if (IOS) {
        const v = ios(file);
        ok(v.nproblems === 0, schema + ': IfcOpenShell (rules on) finds nothing', v.problems);
        ok(v.counts.IfcBuilding === 1 && v.counts.IfcBuildingStorey === 2 && (v.counts.IfcStair === 1 || schema === 'IFC2X3' ? true : false), schema + ': building + 2 storeys, stairs', v.counts);
        if (schema === 'IFC4X3_ADD2') ok(v.alignments[0]?.samples?.FootPrint?.pts?.length && !v.alignments[0].samples.Axis.error, 'IFC 4.3 (feet): IfcOpenShell evaluates the alignment curves');
      }
      // the round trip comes back in grid coordinates (the file's map), rotated and scaled
      const back = RD.readCivilIfc(new TextEncoder().encode(r.text), { units: 'ft' });
      const toGrid = (x, y) => { const c = Math.cos(Math.PI / 6), sn = Math.sin(Math.PI / 6), dx = x - 5000, dy = y - 5000; return [3100000 + 1.00012 * (c * dx - sn * dy), 10070000 + 1.00012 * (sn * dx + c * dy)]; };
      const want = toGrid(4600, 4600), got = back.alignments[0]?.pis[0];
      if (schema === 'IFC4X3_ADD2') ok(got && Math.hypot(got.x - want[0], got.y - want[1]) < 1e-4 && Math.abs(back.alignments[0].pis[1].r - 300 * 1.00012) < 1e-6, 'IFC 4.3 back: PIs in grid coordinates, radius × the scale', { got, want });
      else ok(got && got.x === 4600 && got.y === 4600, schema + ' back: the PI table gives the project\'s own coordinates', got);
    }
  }

  section('IFC 4x1 alignments (IfcAlignmentCurve), read by position');
  {
    const R = 200, L = 100;   // a tangent east 100, a 200-radius left curve of length 100, a tangent; profile: 2 % then a 60 long parabola to −1 %
    const d1 = L / R, cx = 100, cy = R, ex = cx + R * Math.sin(d1), ey = cy - R * Math.cos(d1);
    const text = ['ISO-10303-21;', 'HEADER;', "FILE_DESCRIPTION((''),'2;1');", "FILE_NAME('a.ifc','2026-10-26T00:00:00',(''),(''),'','','');", "FILE_SCHEMA(('IFC4X1'));", 'ENDSEC;', 'DATA;',
      "#1=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);", '#2=IFCUNITASSIGNMENT((#1));', "#3=IFCPROJECT('0000000000000000000001',$,'P',$,$,$,$,$,#2);",
      '#10=IFCCARTESIANPOINT((0.,0.));', '#11=IFCLINESEGMENT2D(#10,0.,100.);', '#12=IFCALIGNMENT2DHORIZONTALSEGMENT(.T.,$,$,#11);',
      '#13=IFCCARTESIANPOINT((100.,0.));', '#14=IFCCIRCULARARCSEGMENT2D(#13,0.,100.,200.,.T.);', '#15=IFCALIGNMENT2DHORIZONTALSEGMENT(.T.,$,$,#14);',
      `#16=IFCCARTESIANPOINT((${ex},${ey}));`, `#17=IFCLINESEGMENT2D(#16,${d1},80.);`, '#18=IFCALIGNMENT2DHORIZONTALSEGMENT(.T.,$,$,#17);',
      '#19=IFCALIGNMENT2DHORIZONTAL(500.,(#12,#15,#18));',
      '#20=IFCALIGNMENT2DVERSEGLINE(.T.,$,$,500.,70.,10.,0.02);', '#21=IFCALIGNMENT2DVERSEGPARABOLICARC(.T.,$,$,570.,60.,11.4,0.02,2000.,.T.);', '#22=IFCALIGNMENT2DVERSEGLINE(.T.,$,$,630.,150.,11.79,-0.01);',
      '#23=IFCALIGNMENT2DVERTICAL((#20,#21,#22));', "#24=IFCALIGNMENTCURVE(#19,#23,'A');", "#25=IFCALIGNMENT('0000000000000000000002',$,'Old road',$,$,$,$,#24,$);", 'ENDSEC;', 'END-ISO-10303-21;', ''].join('\n');
    const r = RD.readCivilIfc(new TextEncoder().encode(text), { units: 'm' });
    const b = r.alignments[0];
    ok(r.schema === 'IFC4X1' && b?.from === 'layout-4x1', '4x1: read from the IfcAlignmentCurve', { schema: r.schema, notes: r.notes });
    const T = R * Math.tan(d1 / 2);
    ok(b && b.start === 500 && b.pis.length === 3 && Math.abs(b.pis[1].x - (100 + T)) < 1e-6 && Math.abs(b.pis[1].y) < 1e-6 && Math.abs(b.pis[1].r - 200) < 1e-9, '4x1: start 500, the curve\'s PI at 100 + T = ' + (100 + T).toFixed(4) + ', R 200', b?.pis);
    ok(b && b.pvis.length === 3 && Math.abs(b.pvis[1].sta - 600) < 1e-9 && Math.abs(b.pvis[1].z - 12) < 1e-9 && b.pvis[1].L === 60, '4x1: the parabolic arc → PVI 600 at 12.0, L 60 (end grade 2 % − 60/2000 = −1 %)', b?.pvis);
  }

  section('what CivilCraft cannot hold is said, not guessed');
  {
    const h = [{ type: 'LINE', x: 0, y: 0, dir: 0, r0: 0, r1: 0, len: 50 }, { type: 'CIRCULARARC', x: 50, y: 0, dir: 0, r0: 100, r1: 100, len: 30 }, { type: 'CIRCULARARC', x: 0, y: 0, dir: 0.3, r0: 200, r1: 200, len: 30 }];
    ok(RD.layoutToPis(h).pis === null && /compound/.test(RD.layoutToPis([...h, { type: 'LINE', x: 0, y: 0, dir: 0.45, r0: 0, r1: 0, len: 10 }]).notes[0]), 'a compound curve: no PI alignment, with the reason');
    ok(RD.layoutToPis([{ type: 'CIRCULARARC', x: 0, y: 0, dir: 0, r0: 100, r1: 100, len: 30 }]).pis === null, 'an alignment that starts in a curve: refused');
    const pv = RD.layoutToPvis([{ type: 'CONSTANTGRADIENT', d0: 0, len: 100, z0: 10, g0: 0.01, g1: 0.01 }, { type: 'CIRCULARARC', d0: 100, len: 40, z0: 11, g0: 0.01, g1: -0.01 }, { type: 'CONSTANTGRADIENT', d0: 140, len: 60, z0: 11.0, g0: -0.01, g1: -0.01 }], 0);
    ok(pv.pvis.length === 3 && pv.pvis[1].L === 40 && pv.notes.length === 1, 'a circular vertical curve becomes a parabola of the same length and grades, with a note', pv);
  }

  section('rail transitions (71.26 / B): each kind as its IFC 4.3 type, IfcOpenShell\'s geometry within 1 mm, read back');
  {
    const TYPE = { clothoid: 'CLOTHOID', cubic: 'CUBIC', bloss: 'BLOSSCURVE', helmert: 'HELMERTCURVE', sinehalf: 'COSINECURVE', sine: 'SINECURVE' };
    for (const kind of Object.keys(TYPE)) for (const turn of [1, -1]) {
      const q = new PJ.Project(); q.state.units = 'm'; q.state.name = 'tr ' + kind;
      q.state.alignments.push({ id: 'a1', name: 'K', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 400, y: 250 * turn, r: 500, ls1: 120, ls2: 90, tr: kind }, { x: 800, y: 0, r: 0 }], pvis: [] });
      const al = q.alignment(q.state.alignments[0]);
      const r = IW.writeCivilIfc(IM.civilIfcModel(q), { schema: 'IFC4X3_ADD2', now: NOW, seed: 'tr' });
      const types = [...r.text.matchAll(/IFCALIGNMENTHORIZONTALSEGMENT\([^;]*\.([A-Z]+)\.\);/g)].map((m) => m[1]);
      ok(types.join() === 'LINE,' + TYPE[kind] + ',CIRCULARARC,' + TYPE[kind] + ',LINE,LINE', kind + (turn > 0 ? ' (left)' : ' (right)') + ': written as ' + TYPE[kind], types);
      const back = RD.readCivilIfc(new TextEncoder().encode(r.text), { units: 'm' }).alignments[0], pb = back?.pis[1];
      ok(pb && (pb.tr || 'clothoid') === kind && Math.abs(pb.ls1 - 120) < 1e-6 && Math.abs(pb.ls2 - 90) < 1e-6 && Math.abs(pb.r - 500) < 1e-9 && Math.hypot(pb.x - 400, pb.y - 250 * turn) < 1e-5, kind + (turn > 0 ? ' (left)' : ' (right)') + ': read back as the same PI (kind, R, spiral lengths' + (kind === 'cubic' ? ' along the tangent' : '') + ')', pb);
      if (IOS && turn < 0) {
        const file = path.join(TMP, 'tr-' + kind + '.ifc');
        fs.writeFileSync(file, r.text);
        const v = ios(file), fp = v.alignments[0].samples.FootPrint || v.alignments[0].samples.Axis, o = r.origin;
        let worst = 0;
        for (const [u, X, Y] of fp.pts) { const p0 = al.pointAt(Math.min(u, al.length)); worst = Math.max(worst, Math.hypot(X + o.x - p0.x, Y + o.y - p0.y)); }
        ok(v.nproblems === 0 && !fp.error && Math.abs(fp.length - al.length) < 1e-4 && worst < 1e-3, kind + ': valid, and IfcOpenShell\'s own geometry runs within 1 mm of CivilCraft\'s alignment (' + (worst * 1000).toFixed(4) + ' mm)', { p: v.problems, len: [fp.length, al.length] });
      }
    }
  }

  section('a railway (71.26 / B): IfcRailway, IfcAlignmentCant, rails, sleepers, ballast; all schemas');
  {
    const RL = await mod('rail.js'), NA = await mod('ifc-native.js');
    const jr = JSON.parse(json);
    jr.alignments = [{ id: 'a1', name: 'Line 1', start: 0, design: { speed: 120, unit: 'km/h' }, rail: { ...RL.railDefaults('m'), tracks: 2 },
      pis: [{ x: 500000, y: 5400040, r: 0 }, { x: 500240, y: 5400120, r: 400, ls1: 80, ls2: 80, tr: 'bloss', cant: 90 }, { x: 500500, y: 5400570, r: 300, ls1: 60, ls2: 60, tr: 'helmert', cant: 60 }, { x: 500660, y: 5400626, r: 0 }],
      pvis: [{ sta: 0, z: 103, L: 0 }, { sta: 300, z: 110, L: 200 }, { sta: 850, z: 114, L: 0 }], corridor: { on: true, step: 20 } }];
    jr.pads = []; jr.network = null; jr.parcels = [];
    const q = PJ.Project.fromJSON(jr).project, ar = q.state.alignments[0], plan = q.railPlan(ar), mr = IM.civilIfcModel(q), c = mr.corridors[0];
    ok(c?.facility === 'rail' && c.track.rails.length === 4 && c.track.sleepers.length === 2 && c.track.ballast && c.track.sub, 'the model: a track of 2 × 2 rails, sleepers per track, the ballast bed and the sub-ballast as solids');
    ok(c.track.sleepers.every((sp) => Math.abs(sp.at.length - c.track.quantities.tracks[sp.track].sleepers) <= 1), 'sleepers placed: as many as the track\'s quantities count', c.track.sleepers.map((x) => x.at.length));
    ok(mr.alignments[0].cant?.segments.map((x) => x.type).join() === plan.segments.map((x) => x.type).join() && mr.alignments[0].cant.base === RL.baseOf(ar.rail), 'the cant: rail.js cantPlan\'s segments, rail head distance = baseOf (' + RL.baseOf(ar.rail) + ' mm)');
    const out2 = {};
    for (const schema of IW.SCHEMAS) out2[schema] = IW.writeCivilIfc(mr, { schema, now: NOW, seed: 'rail' });
    const t4 = out2.IFC4X3_ADD2.text;
    ok(['IFCRAILWAY', 'IFCRAILWAYPART', 'IFCRAIL', 'IFCTRACKELEMENT', 'IFCALIGNMENTCANT', 'IFCALIGNMENTCANTSEGMENT', 'IFCSEGMENTEDREFERENCECURVE', 'IFCMAPPEDITEM', 'IFCTHIRDORDERPOLYNOMIALSPIRAL', 'IFCSECONDORDERPOLYNOMIALSPIRAL'].every((e) => t4.includes('=' + e + '(')) && /\.BALLASTBED\./.test(t4) && /\.SLEEPER\./.test(t4) && !t4.includes('=IFCROAD('), 'IFC 4.3: IfcRailway (not a road), parts, rails, sleepers (mapped boxes), BALLASTBED, the cant layout and its segmented reference curve, Bloss / Helmert spirals');
    ok(!out2.IFC4.text.includes('=IFCRAILWAY(') && /'Sleepers'/.test(out2.IFC4.text) && /'Rail'/.test(out2.IFC2X3.text), 'IFC4 / IFC2x3: the same parts as civil elements / proxies named Rail, Sleepers, Ballast bed');
    const back = RD.readCivilIfc(new TextEncoder().encode(t4), { units: 'm' }).alignments[0];
    ok(back.pis[1].tr === 'bloss' && back.pis[1].cant === 90 && back.pis[2].tr === 'helmert' && back.pis[2].cant === 60 && back.rail?.on && back.rail.tracks === 2, 'read back from IFC 4.3: transitions, each curve\'s cant (from IfcAlignmentCant) and the track settings', back.pis);
    for (const schema of ['IFC4', 'IFC2X3']) { const b2 = RD.readCivilIfc(new TextEncoder().encode(out2[schema].text), { units: 'm' }).alignments[0]; ok(b2.pis[1].tr === 'bloss' && b2.pis[2].cant === 60 && b2.rail?.tracks === 2, schema + ': read back from the PI table (kinds, cant, settings)'); }
    const nat = await NA.writePair(q, { stem: 'rail', now: NOW }), rn = await NA.readNative(new TextEncoder().encode(nat.ifcText));
    ok(rn.native.jsonText === nat.jsonText && JSON.parse(nat.jsonText).alignments[0].rail.tracks === 2, 'the native pair keeps the railway (embedded project byte for byte)');
    if (IOS) {
      for (const schema of IW.SCHEMAS) {
        const file = path.join(TMP, 'rail-' + IW.SCHEMA_INFO[schema].file + '.ifc');
        fs.writeFileSync(file, out2[schema].text);
        const v = ios(file);
        ok(v.nproblems === 0, schema + ' railway: IfcOpenShell (rules on) finds nothing', v.problems);
        if (schema === 'IFC4X3_ADD2') {
          ok(v.counts.IfcRailway === 1 && v.counts.IfcRailwayPart === 2 && v.counts.IfcRail === 4 && v.counts.IfcTrackElement === 2 && v.predefined.IfcCourse?.BALLASTBED === 1 && v.predefined.IfcTrackElement?.SLEEPER === 2, 'classes: 1 railway, 2 parts (TRACK, SUBSTRUCTURE), 4 rails, 2 sleeper sets, 1 ballast bed', v.counts);
          ok(v.tree['IfcRail in IfcRailwayPart'] === 4 && v.tree['IfcSite > IfcRailway'] === 1, 'rails in the TRACK part, the railway in the site');
          ok(v.psets.IfcRail?.Qto_RailBaseQuantities?.Weight > 0 && v.psets.IfcCourse?.Qto_CourseBaseQuantities?.Volume > 0, 'quantities: rail weight, ballast volume');
          const x = v.alignments[0], C = x.layouts.find((l) => l.type === 'IfcAlignmentCant');
          ok(C && C.segments.length === plan.segments.length + 1, 'IfcAlignmentCant: every cant segment + the zero-length end', C?.segments.length);
          const ax = x.samples.Axis, prf = q.designProfile(ar), alr = q.alignment(ar), o = out2[schema].origin;
          ok(ax && ax.item === 'IfcSegmentedReferenceCurve' && !ax.error, 'IfcOpenShell evaluates the IfcSegmentedReferenceCurve (cant on the gradient curve)');
          let worst = 0, n = 0;
          for (const [u, X, Y, Z] of ax.pts) {
            const sta = alr.start + u, h = RL.cantAt(plan, sta), z0 = prf.elevationAt(sta);
            if (z0 === null || !(Math.abs(h.L - h.R) > 1) || Math.abs(h.E) < Math.max(...ar.pis.map((p) => p.cant || 0)) - 1e-6) continue;   // in full cant only
            const p0 = alr.pointAt(sta);
            worst = Math.max(worst, Math.abs(Z - z0 - (h.L + h.R) / 2000), Math.hypot(X + o.x - p0.x, Y + o.y - p0.y)); n++;
          }
          ok(n >= 1 && worst < 1e-3, 'in full cant the segmented curve lies at the rails\' mean height over the profile, within 1 mm (' + n + ' samples)', worst);
        }
      }
    }
  }

  section('the landscape and massing exports keep working (their own writers, unchanged output)');
  {
    const masses = [{ id: 'm1', name: 'A', use: 'office', pts: [{ x: 0, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 40 }, { x: 0, y: 40 }], floors: 3, floorHeight: 12, z0: 100, base: 'stepped', ground: 'eg', parcel: '' }];
    const r1 = IMS.writeMassingIfc({ name: 'Lot', units: 'ft', masses }, { now: NOW });
    ok(r1.unit === 'ftUS' && IMS.fileUnit('ft', null) === 'ftUS' && IMS.fileUnit('m', null) === 'm' && IMS.fileUnit('ft', { unit: 'ft' }) === 'ft' && IMS.fileUnit('ft', { unit: 'm' }) === 'm', 'ifc-massing.js: the unit rule now shared as fileUnit (same answers)');
    const sha = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0; return h >>> 0; };
    ok(sha(r1.text) === 4178419555, 'ifc-massing.js output byte for byte as before this change (pinned hash; equal to the pre-71.24 code when pinned)', sha(r1.text));
    const r2 = ILS.writeLandscapeIfc({ name: 'L', units: 'm', elements: [{ cls: 'IfcGeographicElement', predefined: 'VEGETATION', name: 'Oak', tag: 't', at: { x: 10, y: 10, z: 0 }, body: { kind: 'cylinders', parts: [{ r: 1, z0: 0, z1: 5 }] } }] }, { now: NOW });
    ok(sha(r2.text) === 2583527095, 'ifc-landscape.js output byte for byte as before (pinned hash; the file is untouched)', sha(r2.text));
  }
} finally {
  fs.rmSync(TMP, { recursive: true, force: true });
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

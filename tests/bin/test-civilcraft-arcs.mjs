#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-arcs.mjs — CivilCraft 0.6 WL.24: 3D arcs in feature lines (featureline.js, landxml.js, dxf.js,
 * dwg-write.js, cad-linework.js), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-arcs.mjs [--build dev|x.y] [--verbose] [--keep]
 *
 * Worked by hand: a quarter circle of radius 50 rising 100 → 102 (bulge tan 22.5°, plan length 25π, grade 2 / 25π, 3D
 * length √((25π)² + 4)); three-point and radius bulges; the arc's pieces on the circle within 0.01; z even along the arc;
 * set grade on an arc; offsets of an arc (concentric, and refused when it would turn inside out); crossings with a straight
 * and a curved alignment (exact, against a 1e-7 polyline); a profile run along an arc; the existing ground built through
 * an arc feature line; a closed design line of two half circles grading a round pad (area πr²); untrusted bulges; the
 * project file; LandXML out (the 1.2 XSD, PlanFeature Curve radii) and back, and a Civil 3D-style file with a cw Curve and
 * an IrregularLine; DXF R12 out (ezdxf reads the CADCRAFT extended data) and back as feature lines with their arcs; DWG in
 * all six versions back through cc-dwg, and through the ODA File Converter (its DXF keeps the extended data) when installed.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const KEEP = process.argv.includes('--keep');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
const TOOLS = path.join(REPO, 'tools/civilcraft-test');
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
const FL = await mod('featureline.js');
const PJ = await mod('project.js');
const AL = await mod('alignment.js');
const LX = await mod('landxml.js');
const DXF = await mod('dxf.js');
const DXFM = await mod('dxf-model.js');
const DWGW = await mod('dwg-write.js');
const DWGR = await mod('dwg/read.js');
const CL = await mod('cad-linework.js');

let pass = 0, fail = 0;
const ok = (cond, msg, extra) => { if (cond) { pass++; if (VERBOSE) console.log('  ok  ' + msg); } else { fail++; console.log('  FAIL ' + msg + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); } };
const near = (a, b, tol, msg) => ok(Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol, msg, { got: a, want: b });
const head = (s) => console.log('== ' + s);
const OUT = KEEP ? path.join(REPO, 'tmp/civilcraft-arcs') : fs.mkdtempSync(path.join(os.tmpdir(), 'cv-arcs-'));
fs.mkdirSync(OUT, { recursive: true });
const PY = path.join(TOOLS, 'venv/bin/python');
const py = (mode, file, ...a) => (fs.existsSync(PY) ? JSON.parse(execFileSync(PY, [path.join(TOOLS, 'check.py'), mode, file, ...a], { encoding: 'utf8', maxBuffer: 1 << 28 })) : null);

// the quarter circle: centre (0, 0), radius 50, from (50, 0) to (0, 50) turning left, rising 100 → 102
const Q = Math.tan(Math.PI / 8);
const quarter = () => FL.cleanFeature({ id: 'f1', name: 'Curb', pts: [{ x: 50, y: 0, z: 100, b: Q }, { x: 0, y: 50, z: 102 }], use: 'eg' });

head('arcs by hand');
{
  const A = FL.arcOf({ x: 50, y: 0 }, { x: 0, y: 50 }, Q);
  near(A.cx, 0, 1e-12, 'centre x'); near(A.cy, 0, 1e-12, 'centre y'); near(A.r, 50, 1e-12, 'radius 50');
  near(A.sweep, Math.PI / 2, 1e-12, 'sweep +90° (left)'); near(A.L, 25 * Math.PI, 1e-12, 'plan length 25π');
  const m = { x: 50 * Math.cos(Math.PI / 4), y: 50 * Math.sin(Math.PI / 4) };
  near(FL.bulgeThrough({ x: 50, y: 0 }, m, { x: 0, y: 50 }), Q, 1e-12, 'bulge through three points');
  near(FL.bulgeThrough({ x: 0, y: 50 }, m, { x: 50, y: 0 }), -Q, 1e-12, 'the other way round: −bulge');
  near(FL.bulgeThrough({ x: 50, y: 0 }, { x: 0, y: 50 }, { x: -50, y: 0 }), 1, 1e-12, 'a half circle: bulge 1');
  near(FL.bulgeThrough({ x: 50, y: 0 }, { x: 0, y: -50 }, { x: 0, y: 50 }), -Math.tan(3 * Math.PI / 8), 1e-12, 'three quarters turning right');
  ok(FL.bulgeThrough({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }) === 0, 'three in a line: straight');
  near(FL.bulgeForRadius({ x: 50, y: 0 }, { x: 0, y: 50 }, 50, true), Q, 1e-12, 'bulge for radius 50 left');
  near(FL.bulgeForRadius({ x: 50, y: 0 }, { x: 0, y: 50 }, 50, false), -Q, 1e-12, 'bulge for radius 50 right');
  ok(FL.bulgeForRadius({ x: 0, y: 0 }, { x: 100, y: 0 }, 49.9) === null, 'radius under half the chord refused');
  const f = quarter(), sg = FL.segments(f)[0];
  near(sg.len, 25 * Math.PI, 1e-12, 'segment length along the arc');
  near(sg.chord, 50 * Math.SQRT2, 1e-12, 'chord');
  near(sg.grade, 2 / (25 * Math.PI), 1e-15, 'grade = Δz / arc length');
  near(sg.len3d, Math.hypot(25 * Math.PI, 2), 1e-12, '3D length of the helix piece');
  near(FL.stations(f)[1], 25 * Math.PI, 1e-12, 'station at the end');
  const g = FL.setGrade(f, 0, 0.05);
  near(g.pts[1].z, 100 + 0.05 * 25 * Math.PI, 1e-12, 'set grade on an arc moves the far end by grade × arc length');
  ok(g.pts[0].b === Q, 'the arc stays');
  ok(FL.arcText(f, 0) === '50.00 L', 'radius words', FL.arcText(f, 0));
  ok(JSON.stringify(FL.parseArc('50 R')) === '{"r":50,"left":false}' && FL.parseArc('-30').left === false && FL.parseArc('30').left === true && FL.parseArc('').r === 0 && FL.parseArc('x') === null, 'parse radius words');
  const st = FL.setArc({ ...f, pts: f.pts.map((p) => ({ x: p.x, y: p.y, z: p.z })) }, 0, 50, false);
  near(FL.segments(st)[0].arc.sweep, -Math.PI / 2, 1e-12, 'setArc 50 R');
  ok(!FL.setArc(f, 0, 0).pts[0].b, 'setArc 0 = straight');
  ok(FL.setArc(f, 0, 10) === f, 'setArc too small = unchanged');
  const p = FL.pointOnSeg(f.pts[0], f.pts[1], Q, 0.5);
  near(p.x, m.x, 1e-12, 'middle of the arc x'); near(p.y, m.y, 1e-12, 'middle y'); near(p.dir, Math.PI * 3 / 4, 1e-12, 'travel direction at the middle');
}

head('pieces on the curve');
{
  const f = quarter(), flat = FL.flatten(f);
  ok(flat.length > 10 && flat[0].v === 0 && flat[flat.length - 1].v === 1 && flat.slice(1, -1).every((q) => q.v === -1), 'pieces: real vertices at the ends', flat.length);
  ok(flat.every((q) => Math.abs(Math.hypot(q.x, q.y) - 50) < 1e-9), 'every piece end on the circle');
  let worst = 0;
  for (let i = 1; i < flat.length; i++) { const mx = (flat[i - 1].x + flat[i].x) / 2, my = (flat[i - 1].y + flat[i].y) / 2; worst = Math.max(worst, 50 - Math.hypot(mx, my)); }
  ok(worst <= 0.01 + 1e-12, 'the pieces stay within 0.01 of the arc', worst);
  ok(flat.every((q) => Math.abs(q.z - (100 + 2 * Math.atan2(q.y, q.x) / (Math.PI / 2))) < 1e-9), 'z even along the arc');
  const big = FL.flatten({ pts: [{ x: 1000, y: 0, z: 0, b: Q }, { x: 0, y: 1000, z: 0 }], closed: false });
  ok(big.length - 1 === FL.arcPieces(FL.arcOf({ x: 1000, y: 0 }, { x: 0, y: 1000 }, Q)) && big.length < 200, 'a 1000-radius quarter in ' + (big.length - 1) + ' pieces');
  ok(!FL.hasArcs(FL.cleanFeature({ pts: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }] })) && FL.hasArcs(f), 'hasArcs');
}

head('offsets of an arc');
{
  const f = quarter();
  const r = FL.offsetFeature(f, 5);   // right of travel (CCW) = away from the centre
  ok(r.f && r.f.pts[0].b === Q, 'offset keeps the bulge');
  const A = FL.arcOf(r.f.pts[0], r.f.pts[1], r.f.pts[0].b);
  near(A.r, 55, 1e-9, 'offset right by 5: radius 55'); near(Math.hypot(A.cx, A.cy), 0, 1e-9, 'concentric');
  const l = FL.offsetFeature(f, -20);
  near(FL.arcOf(l.f.pts[0], l.f.pts[1], Q).r, 30, 1e-9, 'offset left by 20: radius 30');
  ok(FL.offsetFeature(f, -60).f === null, 'offset left past the centre: refused');
  // an S: straight, then an arc turning left, tangent
  const s = FL.cleanFeature({ pts: [{ x: 50, y: -100, z: 0 }, { x: 50, y: 0, z: 0, b: Q }, { x: 0, y: 50, z: 0 }] });
  const so = FL.offsetFeature(s, 10);
  near(so.f.pts[1].x, 60, 1e-9, 'tangent joint offsets square to both'); near(so.f.pts[1].y, 0, 1e-9, 'tangent joint y');
  near(FL.arcOf(so.f.pts[1], so.f.pts[2], Q).r, 60, 1e-9, 'and the arc is concentric at 60');
}

head('crossings with an alignment');
{
  const f = quarter();
  const al = AL.buildAlignment({ pis: [{ x: -100, y: 30 }, { x: 100, y: 30 }], start: 0 });
  const c = FL.alignmentCrossings(al, f);
  ok(c.length === 1, 'a straight alignment crosses the arc once', c.length);
  near(c[0].sta, 140, 1e-9, 'at station 140 (x = 40)');
  near(c[0].z, 100 + 2 * Math.atan2(30, 40) / (Math.PI / 2), 1e-9, 'z there, by arc length');
  // a curved alignment against the arc, checked against the same line in 1e-7 pieces
  const al2 = AL.buildAlignment({ pis: [{ x: -80, y: -40 }, { x: 40, y: 70 }, { x: 120, y: -60 }].map((p, i) => (i === 1 ? { ...p, r: 60 } : p)) });
  ok(al2.ok, 'curved alignment builds');
  const exact = FL.alignmentCrossings(al2, f), fine = FL.alignmentCrossings(al2, { ...f, pts: FL.flatten(f, { tol: 1e-9, maxDeg: 0.05 }).map(({ x, y, z }) => ({ x, y, z })) });
  ok(exact.length >= 1 && exact.length === fine.length, 'curved alignment: as many crossings as the fine pieces', [exact.length, fine.length]);
  // the crossing meets the alignment at a shallow angle, so the pieces' station is the rougher one: the exact one must lie
  // on both curves, and the pieces must agree within their own error
  ok(exact.every((q, k) => Math.abs(q.sta - fine[k].sta) < 1e-4 && Math.abs(q.z - fine[k].z) < 1e-6), 'and about the same stations and elevations', exact.map((q, k) => [q.sta, fine[k].sta, q.z, fine[k].z]));
  ok(exact.every((q) => { const p = al2.pointAt(q.sta); return Math.abs(Math.hypot(p.x, p.y) - 50) < 1e-9; }), 'the exact crossings lie on the arc (radius 50 from its centre)');
  const runs = FL.projectedRuns(AL.buildAlignment({ pis: [{ x: -100, y: 40 }, { x: 100, y: 40 }] }), f, 30);
  ok(runs.length === 1 && runs[0].length > 3 && runs[0].every((q, k) => !k || q.sta >= runs[0][k - 1].sta), 'a profile run follows the arc in station order', runs.map((r) => r.length));
}

head('the existing ground through an arc');
{
  const p = new PJ.Project();
  const pts = [];
  let n = 1;
  for (let x = -80; x <= 80; x += 40) for (let y = -80; y <= 80; y += 40) pts.push({ n: String(n++), x, y, z: 90, d: 'GND' });
  p.setPoints(pts, 'grid');
  p.change('fl', (s) => { s.features = [quarter()]; });
  const sf = p.eg().surface;
  ok(!!sf, 'surface builds');
  const mid = FL.pointOnSeg({ x: 50, y: 0 }, { x: 0, y: 50 }, Q, 0.5);
  near(sf.elevationAt(mid.x, mid.y), 101, 0.01, 'the surface at the arc middle is the arc there (101)');
  const q = FL.pointOnSeg({ x: 50, y: 0 }, { x: 0, y: 50 }, Q, 0.25);
  near(sf.elevationAt(q.x, q.y), 100.5, 0.01, 'and a quarter along (100.5)');
  // a closed design line: two half circles of radius 20 at z = 95, grading a round pad
  // (cleanFeature wants 3 vertices for a closed line; two half circles is a closed line of 2 — so it is pushed as is)
  p.change('pad', (s) => { s.features.push({ id: 'f2', name: 'Round pad', pts: [{ x: -20, y: -60, z: 95, b: 1 }, { x: 20, y: -60, z: 95, b: 1 }], closed: true, use: 'design', daylight: false, cut: 2, fill: 3 }); });
  const it = FL.featureItem(p.state.features[1]);
  const reg = it.patch().region;
  let a2 = 0;
  for (let i = 0; i < reg.length; i++) { const u = reg[i], v = reg[(i + 1) % reg.length]; a2 += u.x * v.y - v.x * u.y; }
  ok(Math.abs(Math.abs(a2 / 2) - Math.PI * 400) / (Math.PI * 400) < 1e-3, 'a closed line of two half circles grades a round region (πr²)', a2 / 2);
  const g = p.graded().surface;
  near(g.elevationAt(0, -60), 95, 1e-9, 'graded surface inside it at 95');
}

head('untrusted bulges and the project file');
{
  const c = FL.cleanFeature({ pts: [{ x: 0, y: 0, z: 0, b: NaN }, { x: 10, y: 0, z: 0, b: 0.5 }, { x: 10, y: 0, z: 0, b: 1e5 }, { x: 20, y: 0, z: 0, b: 0.3 }] });
  ok(!('b' in c.pts[0]) && !('b' in c.pts[1]) && !('b' in c.pts[2]) && !('b' in c.pts[3]), 'NaN, huge, zero-length and last-vertex bulges dropped', c.pts);
  const cl = FL.cleanFeature({ pts: [{ x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 }, { x: 10, y: 10, z: 0, b: 0.4 }], closed: true });
  ok(cl.pts[2].b === 0.4, 'a closed line keeps the closing arc');
  const p = new PJ.Project();
  p.change('fl', (s) => { s.features = [quarter()]; });
  const back = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  ok(back.state.features[0].pts[0].b === Q, 'the project file keeps the arc');
}

head('LandXML');
{
  const f1 = quarter(), f2 = FL.cleanFeature({ id: 'f2', name: 'Ditch & swale', pts: [{ x: 0, y: 0, z: 10 }, { x: 30, y: 0, z: 11, b: -0.25 }, { x: 60, y: 10, z: 9 }, { x: 40, y: 40, z: 9.5, b: 0.6 }], closed: true, use: 'design' });
  const xml = LX.writeLandXml({ name: 'arcs', units: 'ft', features: [f1, f2] });
  const file = path.join(OUT, 'arcs.xml');
  fs.writeFileSync(file, xml);
  const r = LX.readLandXml(xml);
  ok(r.features.length === 2, 'two feature lines read back');
  const same = (a, b) => a.pts.length === b.pts.length && a.closed === b.closed && a.pts.every((p, i) => Math.abs(p.x - b.pts[i].x) < 1e-6 && Math.abs(p.y - b.pts[i].y) < 1e-6 && Math.abs(p.z - b.pts[i].z) < 1e-6 && Math.abs((p.b || 0) - (b.pts[i].b || 0)) < 1e-6);
  ok(same(r.features[0], f1) && r.features[0].use === 'eg', 'the quarter circle back: vertices, elevations, bulge, use', r.features[0]);
  ok(same(r.features[1], f2) && r.features[1].use === 'design' && r.features[1].name === 'Ditch & swale', 'a closed line with a right and a left arc (the closing one too)', r.features[1]);
  const c = py('landxml', file);
  if (c) {
    ok(c.schema === 'valid' || c.schema === 'skipped', 'LandXML 1.2 XSD: ' + c.schema, c.schema_errors);
    ok(c.planfeatures.length === 2 && Math.abs(c.planfeatures[0].radii[0] - 50) < 1e-6 && c.planfeatures[1].curves === 2 && c.planfeatures[1].lines === 2, 'second reader: PlanFeatures with their Curves and radii', c.planfeatures);
  } else console.log('  (no tools/civilcraft-test/venv: the XSD check is skipped)');
  // a file from another program: a cw Curve and an IrregularLine, no CivilCraft properties
  const other = `<?xml version="1.0"?><LandXML xmlns="http://www.landxml.org/schema/LandXML-1.2" version="1.2"><Units><Imperial linearUnit="USSurveyFoot" areaUnit="squareFoot" volumeUnit="cubicYard" temperatureUnit="fahrenheit" pressureUnit="inHG"/></Units>
<PlanFeatures name="x"><PlanFeature name="FL-EOP"><CoordGeom>
<Curve rot="cw" radius="50"><Start>50 0 100</Start><Center>0 0</Center><End>0 50 102</End></Curve>
<IrregularLine><PntList3D>0 50 102 -20 60 103 -40 70 104</PntList3D></IrregularLine>
</CoordGeom></PlanFeature></PlanFeatures></LandXML>`;
  const o = LX.readLandXml(other);
  const g = o.features[0];
  ok(g && g.pts.length === 4 && g.use === null, 'another program\'s feature line: 4 vertices, no use', g);
  // N E Z: Start (N 50, E 0) → x 0, y 50; centre (0, 0); End x 50, y 0; turning clockwise
  near(g.pts[0].b, -Q, 1e-12, 'its cw Curve is a right-turning quarter');
  near(FL.segments(g)[0].len, 25 * Math.PI, 1e-9, 'arc length 25π');
  ok(g.pts[3].x === 70 && g.pts[3].z === 104, 'the IrregularLine vertices follow');
}

head('DXF and DWG');
{
  const f1 = quarter(), f2 = FL.cleanFeature({ id: 'f2', name: 'Pad edge', pts: [{ x: 0, y: 0, z: 10, b: 0.2 }, { x: 30, y: 0, z: 11 }, { x: 30, y: 30, z: 9, b: -0.35 }], closed: true, use: 'design' });
  const ents = [f1, f2].map((f) => { const c = FL.cadPolyline(f); return { type: 'poly3d', layer: 'C-GRAD-FEAT', pts: c.pts, closed: c.closed, xdata: c.xdata }; });
  ents.push({ type: 'line', layer: 'C-ROAD-CNTR', a: { x: 0, y: 0 }, b: { x: 1, y: 1 } });
  const same = (a, b) => a.pts.length === b.pts.length && a.closed === b.closed && a.use === b.use && a.name === b.name && a.pts.every((p, i) => Math.abs(p.x - b.pts[i].x) < 1e-9 && Math.abs(p.y - b.pts[i].y) < 1e-9 && Math.abs(p.z - b.pts[i].z) < 1e-9 && Math.abs((p.b || 0) - (b.pts[i].b || 0)) < 1e-12);
  // DXF R12
  const { text } = DXF.writeDxf({ units: 'ft', layers: [{ name: 'C-GRAD-FEAT', color: 3 }], entities: ents });
  const dxfFile = path.join(OUT, 'arcs.dxf');
  fs.writeFileSync(dxfFile, text);
  const dm = DXFM.readDxfModel(text);
  const back = CL.cadFeatureLines(dm, { projectUnit: 'ft' });
  ok(back.length === 2 && same(back[0], f1) && same(back[1], f2), 'DXF: both feature lines back with their arcs', back);
  const lw = CL.cadLinework(dm, { projectUnit: 'ft', skipFeatureLines: true });
  ok(!lw.cadLayers.some((l) => l.name === 'C-GRAD-FEAT'), 'and left out of the linework when they come in as feature lines');
  ok(CL.cadLinework(dm, { projectUnit: 'ft' }).cadLayers.some((l) => l.name === 'C-GRAD-FEAT'), 'else they are linework as before');
  const x = py('xdata', dxfFile);
  if (x) {
    ok(x.errors === 0, 'ezdxf audit: no errors', x.errors);
    const pl = x.polylines.filter((q) => q.xdata);
    ok(pl.length === 2 && pl.every((q) => q.is3d) && pl[0].xdata[0][1] === FL.CAD_TAG && pl[0].pts.length === FL.cadPolyline(f1).pts.length, 'ezdxf: two 3D polylines with CivilCraft\'s extended data', pl.map((q) => q.xdata?.slice(0, 3)));
    ok(x.apps.includes('CADCRAFT'), 'APPID table names CADCRAFT');
  }
  // DWG, every version
  for (const [version] of DWGW.DWG_FORMATS) {
    const { bytes } = DWGW.writeDwg({ units: 'ft', layers: [{ name: 'C-GRAD-FEAT', color: 3 }], entities: ents, version });
    const file = path.join(OUT, 'arcs-' + version + '.dwg');
    fs.writeFileSync(file, bytes);
    const m = DWGR.readDwg(bytes);
    const b2 = CL.cadFeatureLines(m, { projectUnit: 'ft' });
    ok(b2.length === 2 && same(b2[0], f1) && same(b2[1], f2), 'DWG ' + version + ': back through cc-dwg with their arcs', b2.map((f) => f.pts.length));
  }
  // the ODA File Converter (a test-only black box): its DXF of our DWG still carries the extended data
  const RD = await import(pathToFileURL(path.join(TOOLS, 'dwg-readers.mjs')).href);
  const oda = RD.availableReaders(TOOLS).find((r) => /ODA/.test(r.name));
  if (oda && fs.existsSync(PY)) {
    const files = ['AC1015', 'AC1032'].map((v) => path.join(OUT, 'arcs-' + v + '.dwg'));
    const res = oda.run(files, OUT);
    for (const f of files) {
      const o = res.get(f);
      ok(o && !o.problems.length, 'ODA reads ' + path.basename(f) + ' without problems', o?.problems);
      if (!o || !fs.existsSync(o.dxf)) continue;
      const xx = py('xdata', o.dxf), pl = xx.polylines.filter((q) => q.xdata);
      ok(pl.length === 2 && pl.every((q) => q.is3d), 'ODA ' + path.basename(f) + ': two 3D polylines keep CivilCraft\'s extended data', xx.polylines.map((q) => [q.is3d, !!q.xdata]));
      const back3 = CL.cadFeatureLines(DXFM.readDxfModel(fs.readFileSync(o.dxf, 'latin1')), { projectUnit: 'ft' });
      ok(back3.length === 2 && back3.every((g, i) => g.pts.length === [f1, f2][i].pts.length && g.pts.filter((p) => p.b).length === [f1, f2][i].pts.filter((p) => p.b).length), 'and CivilCraft reads its DXF back as feature lines with the arcs', back3.map((g) => g.pts.length));
    }
  } else console.log('  (ODA File Converter not installed: tools/civilcraft-test/setup-dwg-readers.sh)');
}

if (!KEEP) fs.rmSync(OUT, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

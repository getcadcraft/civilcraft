#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-cad.mjs — CivilCraft 0.4 V1: a DWG or DXF opened as linework (cad-linework.js) and used for the surface
 * (breaklines from contours and 3D polylines, the boundary from a closed polyline, survey points from POINTs), DOM-free,
 * in Node, through the same modules and import map the page uses.
 *
 *   node bin/test-civilcraft-cad.mjs [--build dev|x.y] [--verbose]
 *
 * Fixture: tools/civilcraft-test/fixtures/cad/site-linework.dxf (written by ezdxf, make-cad-fixture.py) and the same
 * drawing as DWG 2018 and 2000 written by the ODA File Converter — so neither the DXF nor the DWG was written by us. The
 * drawing is a hill z = 120 − 0.0004·r² (r from X0, Y0) drawn as contour circles: the surface built from those contours
 * must give the hill back. Readers: cc-dwg's readDwg (civilcraft/dev/dwg/read.js, else lib/dwg until cad-files copies it)
 * and dxf-model.js (civilcraft/dev, else bimcraft/dev's canonical copy). Also: CivilCraft's own DWG and DXF exports read
 * back as linework, units, OCS, blocks, splines, untrusted/odd input.
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
const FX = path.join(REPO, 'tools/civilcraft-test/fixtures/cad');

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
const CAD = await mod('cad-linework.js');
const GL = await mod('gis-layers.js');
const PJ = await mod('project.js');
const SC = await mod('scene.js');
const DXF = await mod('dxf.js');
const DW = await mod('dwg-write.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);

// readers: the app's own copies once cad-files has made them, else the canonical files (said)
const own = (f) => fs.existsSync(path.join(APP, f));
const readerFile = own('dwg/read.js') ? path.join(APP, 'dwg/read.js') : path.join(REPO, 'lib/dwg/read.js');
const dxfFile = own('dxf-model.js') ? path.join(APP, 'dxf-model.js') : path.join(REPO, 'public_html/assets/apps/bimcraft/dev/dxf-model.js');
if (!own('dwg/read.js')) console.log('note: civilcraft/' + BUILD + '/dwg/read.js not there yet (asked of cad-files): reading with lib/dwg');
if (!own('dxf-model.js')) console.log('note: civilcraft/' + BUILD + '/dxf-model.js not there yet: reading with bimcraft/dev/dxf-model.js');
// in a one-app clone (0.8) neither the canonical files nor (until cad-files copies them) the app's own may be here
if (!fs.existsSync(readerFile) || !fs.existsSync(dxfFile)) { console.log('note: no DWG/DXF reader in this checkout: the linework checks are skipped'); console.log('\n0 passed, 0 failed'); process.exit(0); }
const { readDwg } = await import(pathToFileURL(readerFile).href);
const { readDxfModel } = await import(pathToFileURL(dxfFile).href);
if (own('dxf-model.js') && !fs.existsSync(path.join(REPO, 'public_html/assets/apps/bimcraft/dev/dxf-model.js'))) console.log('  (bimcraft/dev not in this checkout — byte-identical check skipped)');
else if (own('dxf-model.js')) ok(Buffer.compare(fs.readFileSync(path.join(APP, 'dxf-model.js')), fs.readFileSync(path.join(REPO, 'public_html/assets/apps/bimcraft/dev/dxf-model.js'))) === 0, 'dxf-model.js is byte-identical to bimcraft/dev');

const X0 = 2000500, Y0 = 500500;
const hill = (x, y) => 120 - 0.0004 * ((x - X0) ** 2 + (y - Y0) ** 2);
const read = (f) => (f.endsWith('.dxf') ? readDxfModel(fs.readFileSync(path.join(FX, f), 'utf8')) : readDwg(new Uint8Array(fs.readFileSync(path.join(FX, f)))));
const byName = (r, n) => r.layers.find((l) => l.name === n);

for (const file of ['site-linework.dxf', 'site-linework-2018.dwg', 'site-linework-2000.dwg']) {
  section(file + ' as linework');
  const model = read(file);
  const r = CAD.cadLinework(model, { file, projectUnit: 'ft' });
  ok(r.units.code === 21 && r.scale === 1, 'US survey feet into a feet project: no scaling');
  const cl = Object.fromEntries(r.cadLayers.map((l) => [l.name, l]));
  ok(cl['C-TOPO-MAJR']?.polygons === 4 && cl['C-TOPO-MINR']?.polygons === 16, 'contours: 4 major + 16 minor closed polylines');
  ok(cl['C-TOPO-BRKL']?.lines === 1 && cl['C-TOPO-BRKL'].z, 'the 3D polyline is a line with z');
  ok(cl['V-BNDY']?.polygons === 1 && !cl['V-BNDY'].z, 'the boundary rectangle is a 2D polygon');
  ok(cl['V-NODE']?.points === 5 && cl['V-NODE'].z, 'five POINTs with z');
  ok(cl['C-ROAD']?.lines === 3 && !cl['C-ROAD'].z, 'road: line, arc and bulged polyline, 2D');
  ok(cl['L-PLNT']?.polygons === 3 && cl['L-PLNT']?.lines === 6, 'three TREE references → 3 circles + 6 lines on the reference layer (layer 0 inherits)');
  ok(!cl['0'], 'nothing left on layer 0');
  ok(r.skipped.TEXT === 1 && !cl.ANNO, 'TEXT counted as skipped, no ANNO layer');
  ok(r.notes.some((n) => /TEXT 1/.test(n)), 'the note lists what was left out');
  ok(!r.layers.some((l) => l.features.some((f) => f.g.t === 'ln' && f.g.c[0].some((p) => p[0] < 100 && p[1] < 100))), 'paper space left out');

  // contours: every vertex on its circle at its elevation; ELEV field set
  const maj = byName(r, 'C-TOPO-MAJR');
  let worstR = 0, worstZ = 0;
  for (const f of [...maj.features, ...byName(r, 'C-TOPO-MINR').features]) {
    const ring = f.g.c[0][0], z = f.p.ELEV, rad = Math.sqrt((120 - z) / 0.0004);
    for (const p of ring) { worstR = Math.max(worstR, Math.abs(Math.hypot(p[0] - X0, p[1] - Y0) - rad)); worstZ = Math.max(worstZ, Math.abs(p[2] - z)); }
    if (ring.length < 72) worstR = Infinity;
  }
  ok(worstR < 1e-6 && worstZ === 0, `contour vertices lie on their circles (worst ${worstR.toExponential(1)}), ≥ 72 per circle, z = elevation`);
  ok(maj.features.map((f) => f.p.ELEV).sort((a, b) => a - b).join() === '100,105,110,115', 'major contours carry ELEV 100 105 110 115');
  ok(maj.features.every((f) => f.p.TYPE === 'LWPOLYLINE' && f.p.LAYER === 'C-TOPO-MAJR'), 'TYPE and LAYER fields');

  // OCS: extrusion (0,0,−1) mirrors x
  const ocsL = byName(r, 'TEST-OCS').features[0].g.c[0];
  ok(Math.abs(ocsL[0][0] - (X0 + 10)) < 1e-6 && Math.abs(ocsL[0][1] - (Y0 + 400)) < 1e-6 && Math.abs(ocsL[2][0] - (X0 + 60)) < 1e-6, 'OCS (0,0,−1): x mirrored into world coordinates');
  // arc on C-ROAD: centre (X0+500, Y0−200), radius 100, 270°→360°
  const arc = byName(r, 'C-ROAD').features.find((f) => f.p.TYPE === 'ARC').g.c[0];
  ok(arc.every((p) => Math.abs(Math.hypot(p[0] - (X0 + 500), p[1] - (Y0 - 200)) - 100) < 1e-6), 'arc vertices on the arc');
  ok(Math.abs(arc[0][0] - (X0 + 500)) < 1e-6 && Math.abs(arc[0][1] - (Y0 - 300)) < 1e-6 && Math.abs(arc.at(-1)[0] - (X0 + 600)) < 1e-6, 'arc from 270° to 360°');
  // bulge 0.5 on the first segment of the road polyline: the arc's mid point bulges by s = c/2·b
  const bp = byName(r, 'C-ROAD').features.find((f) => f.p.TYPE === 'LWPOLYLINE').g.c[0];
  const mid = bp.reduce((best, p) => (Math.abs(p[0] - (X0 - 400)) < Math.abs(best[0] - (X0 - 400)) ? p : best));
  near(Math.abs(mid[1] - (Y0 - 340)), 100 * 0.5, 0.05, 'bulged segment: sagitta = half chord × bulge');
  // block references: TREE at (−320, 340) scale 2 rotation 45° → circle radius 20 round that point
  const trees = byName(r, 'L-PLNT (closed)').features.map((f) => f.g.c[0][0]);
  const rads = trees.map((ring) => { const q = ring.slice(0, -1), cx = q.reduce((s, p) => s + p[0], 0) / q.length, cy = q.reduce((s, p) => s + p[1], 0) / q.length; return [Math.round(cx - X0), Math.round(cy - Y0), +Math.hypot(ring[0][0] - cx, ring[0][1] - cy).toFixed(3)]; });
  ok(JSON.stringify(rads.sort()) === JSON.stringify([[-280, 300, 15], [-320, 340, 20], [-350, 300, 10]].sort()), 'TREE circles placed and scaled: ' + JSON.stringify(rads));
  const rotLine = byName(r, 'L-PLNT').features.map((f) => f.g.c[0]).find((l) => Math.abs((l[0][0] + l[1][0]) / 2 - (X0 - 320)) < 1e-6 && Math.abs((l[0][1] + l[1][1]) / 2 - (Y0 + 340)) < 1e-6);
  ok(rotLine && Math.abs(Math.abs(Math.atan2(rotLine[1][1] - rotLine[0][1], rotLine[1][0] - rotLine[0][0]) * 180 / Math.PI) % 90 - 45) < 1e-6, 'the 45° reference rotates its cross by 45°');
  // spline: passes near its fit points (the curve, not the control polygon)
  const sp = byName(r, 'C-TOPO-SPLN').features[0].g.c[0];
  const fitPts = [[X0 + 300, Y0 + 300], [X0 + 340, Y0 + 360], [X0 + 400, Y0 + 380], [X0 + 440, Y0 + 430]];
  const segD = (q, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy, u = L ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L)) : 0; return Math.hypot(q[0] - a[0] - u * dx, q[1] - a[1] - u * dy); };
  const dmin = (q) => Math.min(...sp.slice(1).map((p, i) => segD(q, sp[i], p)));
  ok(Math.max(...fitPts.map(dmin)) < 0.05 && sp.length >= 20, `spline curve passes its fit points (worst ${Math.max(...fitPts.map(dmin)).toFixed(3)} ft, ${sp.length} vertices)`);
  ok(Math.abs(sp[0][0] - fitPts[0][0]) < 1e-6 && Math.abs(sp.at(-1)[1] - fitPts[3][1]) < 1e-6, 'spline starts and ends on its end fit points');

  // into a project: layers, then use for the surface
  section(file + ' → GIS layers → the surface');
  const p = new PJ.Project();
  const ids = GL.addLayers(p, r.layers, { label: 'Open ' + file });
  ok(ids.length === r.layers.length && GL.gisOf(p).layers.every((l) => l.source.format === 'CAD'), r.layers.length + ' layers added in one step');
  const idOf = (n) => ids[r.layers.findIndex((l) => l.name === n)];
  const ch = GL.useChoices(GL.layerOf(p, idOf('C-TOPO-MINR')), GL.featuresOf(p, idOf('C-TOPO-MINR')));
  ok(ch.some((c) => c.use === 'breaklines' && c.from === 'z') && ch.some((c) => c.use === 'boundary'), 'contours offer breaklines (own z) and boundary');
  ok(!GL.useChoices(GL.layerOf(p, idOf('V-BNDY')), GL.featuresOf(p, idOf('V-BNDY'))).some((c) => c.use === 'breaklines' && c.from === 'z'), 'a 2D polygon offers no breaklines from its own z');
  let u = GL.useForSurface(p, idOf('C-TOPO-MAJR'), { use: 'breaklines', from: 'z' });
  ok(u.ok && u.count === 4, 'major contours → 4 breaklines');
  u = GL.useForSurface(p, idOf('C-TOPO-MINR'), { use: 'breaklines', from: 'field', field: 'ELEV' });
  ok(u.ok && u.count === 16, 'minor contours by their ELEV field → 16 breaklines');
  u = GL.useForSurface(p, idOf('V-NODE'), { use: 'points', from: 'z' });
  ok(u.ok && p.points.length === 5, 'POINTs → 5 survey points');
  const sf = p.eg().surface;
  ok(!!sf, 'the surface builds from contours + spot points');
  let worst = 0, n = 0;
  for (let i = 0; i < 400; i++) {
    const a = (i * 2.399963) % (2 * Math.PI), rr = 30 + (i * 37) % 180;
    const x = X0 + rr * Math.cos(a), y = Y0 + rr * Math.sin(a), z = sf?.elevationAt(x, y);
    if (z == null) continue;
    n++; worst = Math.max(worst, Math.abs(z - hill(x, y)));
  }
  ok(n > 350 && worst < 0.6, `the surface gives the hill back: worst ${worst.toFixed(3)} ft over ${n} samples (contour interval 1 ft)`);
  u = GL.useForSurface(p, idOf('V-BNDY'), { use: 'boundary' });
  ok(u.ok && p.state.surface.boundary.length === 4, 'the rectangle → the 4-corner boundary');
  const b = p.eg().surface?.stats().bounds;
  ok(b && b.maxX - b.minX <= 900 + 1e-6, 'triangles clipped to the boundary');
  u = GL.useForSurface(p, idOf('C-TOPO-BRKL'), { use: 'breaklines', from: 'z' });
  ok(u.ok && u.count === 1, 'the 3D polyline → a breakline with its own z');
  ok(!GL.useForSurface(p, idOf('C-ROAD'), { use: 'breaklines', from: 'z' }).ok, '2D road linework refused as breaklines (no elevations)');
  const before = p.state.surface.breaklines.length;
  p.undo();
  ok(p.state.surface.breaklines.length === before - 1, 'undo takes the last use back');
  const json = JSON.parse(JSON.stringify(p.toJSON()));
  const p2 = PJ.Project.fromJSON ? PJ.Project.fromJSON(json) : null;
  if (p2) ok(GL.gisOf(p2.project || p2).layers.length === ids.length, 'the CAD layers survive the project file');
}

section('units');
{
  const m = read('site-linework.dxf');
  const mm = { ...m, header: { ...m.header, INSUNITS: 4 } };
  let r = CAD.cadLinework(mm, { projectUnit: 'm' });
  ok(r.scale === 0.001 && r.notes.some((n) => /mm/.test(n)), 'millimetres into a metre project: × 0.001, said');
  const c = r.layers.find((l) => l.name === 'C-TOPO-MAJR').features[0].g.c[0][0][0];
  ok(Math.abs(c[2] - 0.1) < 1e-12 || Math.abs(c[2] - 0.115) < 1e-12 || Math.abs(c[2] - 0.105) < 1e-12 || Math.abs(c[2] - 0.11) < 1e-12, 'z scaled too (' + c[2] + ')');
  r = CAD.cadLinework({ ...m, header: { ...m.header, INSUNITS: 6 } }, { projectUnit: 'ft' });
  near(r.scale, 3937 / 1200, 1e-12, 'metres into a feet project: × 3937/1200 (US survey feet)');
  r = CAD.cadLinework({ ...m, header: { ...m.header, INSUNITS: 2 } }, { projectUnit: 'ft' });
  ok(r.scale === 1 && r.notes.some((n) => /2 parts per million/.test(n)), 'international feet: not scaled, said');
  r = CAD.cadLinework({ ...m, header: { ...m.header, INSUNITS: 1 } }, { projectUnit: 'ft' });
  near(r.scale, 1 / 12, 1e-15, 'inches into feet: ÷ 12');
  r = CAD.cadLinework({ ...m, header: { ...m.header, INSUNITS: 0 } }, { projectUnit: 'm' });
  ok(r.scale === 1 && r.notes.some((n) => /does not say its units/.test(n)), 'no units: read as project units, said');
  r = CAD.cadLinework(m, { projectUnit: 'ft', scale: 2 });
  ok(r.scale === 2 && !r.notes.some((n) => /survey/.test(n)), 'a chosen scale wins');
  r = CAD.cadLinework(m, { projectUnit: 'ft', layers: ['V-BNDY'] });
  ok(r.layers.length === 1 && r.layers[0].name === 'V-BNDY', 'a layer filter keeps only those layers');
}

section('CivilCraft’s own exports read back as linework');
{
  const csv = fs.readFileSync(path.join(REPO, 'tools/civilcraft-test/site-topo.csv'), 'utf8');
  const PTS = await mod('points.js');
  const p = new PJ.Project();
  p.editPoints('import', () => PTS.parsePoints(csv).points);
  const eg = p.eg().surface;
  const list = p.contours(eg, 'eg');
  ok(!!eg && list.length > 10, 'fixture surface and ' + list.length + ' contours');
  const sc = SC.planScene({ units: 'ft', points: p.points, surface: eg, contours: { interval: 1, major: 5, list }, breaklines: [], alignments: [], pads: [], corridors: [], network: null }, { mmPerUnit: 1, show: { ...PJ.DISPLAY_DEFAULTS, labels: false } });
  const ents = SC.toDxfEntities(sc, 1);
  const layers = SC.LAYERS.map((l) => ({ name: l.name, color: l.aci }));
  const { text } = DXF.writeDxf({ units: 'ft', layers, entities: ents });
  const fromDxf = CAD.cadLinework(readDxfModel(text), { projectUnit: 'ft' });
  const { bytes } = DW.writeDwg({ units: 'ft', layers, entities: ents, version: 'AC1032' });
  const fromDwg = CAD.cadLinework(readDwg(bytes), { projectUnit: 'ft' });
  for (const [what, r] of [['R12 DXF', fromDxf], ['DWG 2018', fromDwg]]) {
    const topo = r.layers.filter((l) => /^C-TOPO-(MAJR|MINR)/.test(l.cadLayer));
    const n = topo.reduce((s2, l) => s2 + l.features.length, 0);
    ok(n === list.length, `${what}: every contour back (${n} of ${list.length})`);
    const q = new PJ.Project();
    q.editPoints('spots', () => p.points.filter((_, i) => i % 40 === 0));   // a few spots so peaks and pits are not flat
    const ids = GL.addLayers(q, topo);
    for (const id of ids) ok(GL.useForSurface(q, id, { use: 'breaklines', from: 'z' }).ok, `${what}: ${GL.layerOf(q, id).name} → breaklines`);
    const s2 = q.eg().surface;
    let worst = 0, m = 0;
    for (const pt of p.points) { const z2 = s2?.elevationAt(pt.x, pt.y), z1 = eg.elevationAt(pt.x, pt.y); if (z2 == null || z1 == null) continue; m++; worst = Math.max(worst, Math.abs(z2 - z1)); }
    ok(m > 150 && worst < 1.0, `${what}: a surface from the contours alone stays within one contour interval of the original (worst ${worst.toFixed(3)} ft, ${m} points)`);
  }
}

section('odd and untrusted input');
{
  ok(CAD.cadLinework({}, {}).notes.length === 1 && CAD.cadLinework({}, {}).layers.length === 0, 'an empty model: no layers, one note');
  const ent = (e) => ({ handle: '1', layer: 'L', ...e });
  const model = (ents, blocks = []) => ({ header: { INSUNITS: 6 }, tables: { layers: [] }, blocks: [{ name: '*Model_Space', entities: ents }, ...blocks] });
  let r = CAD.cadLinework(model([ent({ type: 'LINE', start: { x: NaN, y: 0 }, end: { x: 1, y: 1 } }), ent({ type: 'LINE', start: { x: 0, y: 0, z: 0 }, end: { x: 1, y: 1, z: 0 } })]), { projectUnit: 'm' });
  ok(r.layers.length === 1 && r.layers[0].features.length === 1, 'a NaN vertex drops that object only');
  ok(r.layers[0].features[0].g.c[0][0].length === 2 && !r.layers[0].hasZ, 'all-zero z → 2D');
  const self = { name: 'LOOP', base: { x: 0, y: 0, z: 0 }, entities: [ent({ type: 'INSERT', block: 'LOOP', insert: { x: 1, y: 0, z: 0 } }), ent({ type: 'LINE', start: { x: 0, y: 0 }, end: { x: 1, y: 0 } })] };
  r = CAD.cadLinework(model([ent({ type: 'INSERT', block: 'LOOP', insert: { x: 0, y: 0, z: 0 } })], [self]), { projectUnit: 'm' });
  ok(r.layers[0]?.features.length === CAD.MAX_DEPTH && r.notes.some((n) => /nested/.test(n)), 'a block that inserts itself stops at ' + CAD.MAX_DEPTH + ' deep, said');
  r = CAD.cadLinework(model([ent({ type: 'INSERT', block: 'NOPE', insert: { x: 0, y: 0 } }), ent({ type: 'HATCH' }), ent({ type: 'UNKNOWN' })]), { projectUnit: 'm' });
  ok(r.layers.length === 0 && r.skipped.HATCH === 1 && r.skipped['INSERT_NO_BLOCK'] === 1, 'missing block and non-linework counted');
  r = CAD.cadLinework(model([ent({ type: 'CIRCLE', center: { x: 0, y: 0, z: 5 }, radius: 2, extrusion: { x: 0, y: 0, z: 1 } }), ent({ type: 'LWPOLYLINE', vertices: [{ x: 0, y: 0 }], closed: false })]), { projectUnit: 'm' });
  ok(r.layers.length === 1 && r.layers[0].geom === 'pg' && r.layers[0].features[0].p.ELEV === 5, 'a circle at z 5 is a polygon with ELEV 5; a one-vertex polyline is dropped');
  const xr = { name: 'XR', flags: 4, xrefPath: 'x.dwg', base: { x: 0, y: 0 }, entities: [] };
  r = CAD.cadLinework(model([ent({ type: 'INSERT', block: 'XR', insert: { x: 0, y: 0 } })], [xr]), { projectUnit: 'm' });
  ok(r.skipped.XREF === 1, 'a linked drawing (xref) is counted, not read');
  const sp = CAD.splinePts({ degree: 1, control: [{ x: 0, y: 0 }, { x: 10, y: 0 }], knots: [0, 0, 1, 1] });
  ok(sp.length >= 8 && Math.abs(sp.at(-1)[0] - 10) < 1e-12 && sp.every((q) => q[1] === 0), 'a degree-1 spline is its control polygon');
  const arcSp = CAD.splinePts({ degree: 2, control: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }], knots: [0, 0, 0, 1, 1, 1], weights: [1, Math.SQRT1_2, 1] });
  ok(arcSp.every((q) => Math.abs(Math.hypot(q[0], q[1]) - 1) < 1e-12), 'a rational quadratic quarter circle lies on the circle');
  const o = CAD.ocs({ x: 0, y: 0, z: -1 });
  ok(o && o[0] === -1 && o[5] === 1 && o[10] === -1, 'arbitrary axis: (0,0,−1) → x mirrored, y kept, z flipped');
  ok(CAD.ocs({ x: 0, y: 0, z: 1 }) === null && CAD.ocs({ x: 0, y: 0, z: 0 }) === null, '+Z (and a zero vector) need no OCS');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

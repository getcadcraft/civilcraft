#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-blocks.mjs — CivilCraft 0.5 WL.19: survey points from block references in a DWG or DXF (block-points.js),
 * DOM-free, in Node, through the same modules and import map the page uses.
 *
 *   node bin/test-civilcraft-blocks.mjs [--build dev|x.y] [--verbose]
 *
 * Fixture: tools/civilcraft-test/fixtures/cad/survey-blocks.dxf (ezdxf) and the same drawing as DWG 2018 and 2000 written
 * by the ODA File Converter (make-block-fixture.py), with its facts in survey-blocks.json — so neither the drawing nor its
 * expected positions come from our code (MINSERT cells are ezdxf's own multi_insert()). Checks: every top-level reference
 * found (nested ones not), true positions incl. an extruded (OCS) reference and a turned MINSERT, attributes, choosing by
 * block or layer, numbers from an attribute (a duplicate renumbered, an empty one given the next), descriptions, elevations
 * from an attribute or the insertion, one undo step through Project.editPoints, the block kept through the project file,
 * units, untrusted `blk`.
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
const B = await mod('block-points.js');
const PJ = await mod('project.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const section = (s) => console.log('\n== ' + s);
const close = (a, b, tol = 1e-6) => Number.isFinite(a) && Math.abs(a - b) <= tol;

const own = (f) => fs.existsSync(path.join(APP, f));
const readerFile = own('dwg/read.js') ? path.join(APP, 'dwg/read.js') : path.join(REPO, 'lib/dwg/read.js');
const dxfFile = own('dxf-model.js') ? path.join(APP, 'dxf-model.js') : path.join(REPO, 'public_html/assets/apps/bimcraft/dev/dxf-model.js');
if (!fs.existsSync(readerFile) || !fs.existsSync(dxfFile) || !fs.existsSync(path.join(FX, 'survey-blocks.dxf'))) {
  console.log('note: no DWG/DXF reader or fixture in this checkout: skipped'); console.log('\n0 passed, 0 failed'); process.exit(0);
}
const { readDwg } = await import(pathToFileURL(readerFile).href);
const { readDxfModel } = await import(pathToFileURL(dxfFile).href);
const facts = JSON.parse(fs.readFileSync(path.join(FX, 'survey-blocks.json'), 'utf8'));

const drawings = [['DXF (ezdxf)', () => readDxfModel(fs.readFileSync(path.join(FX, 'survey-blocks.dxf'), 'utf8'))]];
for (const v of ['2018', '2000']) {
  const f = path.join(FX, 'survey-blocks-' + v + '.dwg');
  if (fs.existsSync(f)) drawings.push(['DWG ' + v + ' (ODA)', () => readDwg(new Uint8Array(fs.readFileSync(f)))]);
}

for (const [label, read] of drawings) {
  section(label);
  const model = read();
  const r = B.blockRefs(model, { projectUnit: 'ft' });
  const by = (name) => r.refs.filter((x) => x.block === name);
  ok(r.scale === 1, 'feet drawing into a feet project: no scaling');
  ok(by('SURVEY_PT').length === 11 && by('SPOT').length === 7 && by('GROUP').length === 1 && r.refs.length === 19, 'top-level references only: 11 SURVEY_PT (10 + the extruded one), 7 SPOT (3 + a 2 × 2 MINSERT), 1 GROUP — its two nested SURVEY_PTs are not points (' + r.refs.length + ')');
  ok(r.blocks.map((b) => b.name + ':' + b.count).join() === 'SURVEY_PT:11,SPOT:7,GROUP:1' && r.blocks[0].tags.join() === 'DESC,ELEV,PT' && r.blocks[0].layers.join() === 'V-NODE,V-NODE-OCS', 'blocks, most used first, with their layers and attribute tags');
  ok(r.layers.map((l) => l.name + ':' + l.count).join() === 'V-NODE:11,V-SPOT:7,V-NODE-OCS:1', 'layers holding references');
  const pts = by('SURVEY_PT').filter((x) => x.layer === 'V-NODE');
  ok(pts.length === 10 && facts.points.every((f, i) => close(pts[i].x, f.x) && close(pts[i].y, f.y) && pts[i].z === 0 && pts[i].attrs.PT === f.pt && pts[i].attrs.DESC === f.desc && pts[i].attrs.ELEV === f.elev), 'the ten 2D survey blocks: places and attributes as written');
  const spots = by('SPOT').slice(0, 3);
  ok(facts.spots.every((f, i) => close(spots[i].x, f.x) && close(spots[i].y, f.y) && close(spots[i].z, f.z)), 'SPOT references keep their insertion Z: ' + spots.map((s) => s.z).join(', '));
  const oc = by('SURVEY_PT').find((x) => x.layer === 'V-NODE-OCS');
  ok(oc && close(oc.x, facts.ocs.x) && close(oc.y, facts.ocs.y), 'the reference with extrusion (0, 0, −1): world X = −OCS X (' + oc?.x + ')');
  const cells = by('SPOT').slice(3);
  ok(cells.length === 4 && facts.minsert.every((f) => cells.some((c) => close(c.x, f.x) && close(c.y, f.y))) && new Set(cells.map((c) => c.handle)).size === 4, 'the MINSERT, turned 90°: four cells where ezdxf puts them, each its own handle (#1…#4)');

  // points: the survey blocks by block name, numbers / descriptions / elevations from attributes
  const existing = [{ n: '101', x: 0, y: 0, z: 0, d: 'X' }, { n: '500', x: 0, y: 0, z: 0, d: 'X' }];
  const out = B.pointsFromBlocks(r.refs, { blocks: ['SURVEY_PT'], desc: 'attr:DESC', z: 'attr:ELEV', number: 'attr:PT', existing });
  const P = out.points;
  ok(P.length === 11, '11 points from SURVEY_PT');
  ok(P[0].n === '501' && P[1].n === '102' && P[5].n === '502' && P[7].n === '503', 'numbers from PT: 101 is taken in the project → 501, the second 105 → 502, an empty PT → 503 (' + P.slice(0, 8).map((p) => p.n).join(' ') + ')');
  ok(out.renumbered === 2 && out.skipped.noNumber === 1, 'two renumbered, one had no number');
  ok(P.slice(0, 10).every((p, i) => p.d === facts.points[i].desc) && P[10].d === 'OCS', 'descriptions from DESC');
  ok(close(P[0].z, 100) && close(P[9].z, 103.33) && P[8].z === null && out.skipped.noZ === 1, 'elevations from ELEV (100.00 … 103.33); "N/A" → no elevation, counted');
  ok(P.every((p) => p.blk && p.blk.name === 'SURVEY_PT' && p.blk.handle), 'every point remembers its block and handle');
  const sp = B.pointsFromBlocks(r.refs, { layers: ['V-SPOT'], desc: 'block', z: 'insert', existing: [] });
  ok(sp.points.length === 7 && sp.points.map((p) => p.n).join() === '1,2,3,4,5,6,7' && sp.points.every((p) => p.d === 'SPOT') && close(sp.points[2].z, 101.75), 'by layer V-SPOT: 7 points numbered 1–7, described SPOT, Z from the insertion');
  const lay = B.pointsFromBlocks(r.refs, { blocks: ['GROUP'], desc: 'layer', z: 'none', existing: [], start: 9000 });
  ok(lay.points.length === 1 && lay.points[0].n === '9000' && lay.points[0].d === 'V-NODE' && lay.points[0].z === null && close(lay.points[0].x, facts.group.x), 'a GROUP by its block: one point at 9000 (start), the layer as description, no elevation');
  ok(B.pointsFromBlocks(r.refs, {}).points.length === 0, 'nothing chosen → no points');
}

section('units, the project file, undo');
{
  const model = readDxfModel(fs.readFileSync(path.join(FX, 'survey-blocks.dxf'), 'utf8'));
  const m = B.blockRefs(model, { projectUnit: 'm' });
  const f0 = facts.points[0];
  ok(close(m.scale, 0.3048) && close(m.refs[0].x, f0.x * 0.3048, 1e-6) && m.notes.length === 1, 'a feet drawing into a metres project: scaled by 0.3048 (said)');
  const p = new PJ.Project();
  p.setPoints([{ n: '1', x: 0, y: 0, z: 10, d: 'BM' }]);
  const r = B.blockRefs(model, { projectUnit: 'ft' });
  const add = B.pointsFromBlocks(r.refs, { blocks: ['SURVEY_PT'], desc: 'attr:DESC', z: 'attr:ELEV', number: 'attr:PT', existing: p.points }).points;
  p.editPoints('Points from blocks', (pts) => [...pts, ...add]);
  ok(p.points.length === 12 && p.undoStack.length === 1, 'added as one step (12 points, one undo step)');
  const json = JSON.parse(JSON.stringify(p.toJSON()));
  ok(json.points[1].length === 6 && json.points[1][5].name === 'SURVEY_PT' && json.points[0].length === 5, 'the project file keeps each point\'s block (a 6th field), plain points stay 5');
  const back = PJ.Project.fromJSON(json).project ?? PJ.Project.fromJSON(json);
  const q = (back.points || []).find((x) => x.n === add[3].n);
  ok(q && q.blk && q.blk.name === 'SURVEY_PT' && q.blk.layer === 'V-NODE', 'read back: the point still knows its block');
  p.undo();
  ok(p.points.length === 1, 'one Ctrl+Z takes all of them away');
  ok(B.cleanBlk({ name: 'A\u0000B', layer: 7, handle: 'x'.repeat(99) }).name === 'A B' && B.cleanBlk({ name: 5 }) === undefined && B.cleanBlk(null) === undefined && B.cleanBlk({ name: 'X', handle: 'x'.repeat(99) }).handle.length === 40, 'cleanBlk: control characters out, lengths capped, junk dropped');
  ok(B.attrNumber('EL 105.32\'') === 105.32 && B.attrNumber('105,5') === 105.5 && B.attrNumber('-3e2') === -300 && B.attrNumber('N/A') === null, 'attrNumber reads "EL 105.32\'", "105,5", "-3e2"; not "N/A"');
}

console.log(fail ? `\n${fail} FAILED, ${pass} passed` : `\nall ${pass} block point checks passed`);
process.exit(fail ? 1 : 0);

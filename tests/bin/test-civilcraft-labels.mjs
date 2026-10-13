#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-labels.mjs — CivilCraft 0.4 V7: labels from GIS attributes (gis-layers.js labelItems / setLayer label,
 * gis-state.js), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-labels.mjs [--build dev|x.y] [--verbose]
 *
 * Values as text (numbers to 3 decimals, yes/no, blanks skipped), where labels go (beside a point; along the middle of a
 * line's longest part, upright; at a polygon's centre, or on its outline when the centre is outside it), 1.8 mm on paper
 * at any scale, the 5,000 cap, an unknown field refused, one undo step, the project file (a label on a field that is gone
 * is dropped), and the labels in the R12 DXF export read back.
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
const GL = await mod('gis-layers.js');
const PJ = await mod('project.js');
const SC = await mod('scene.js');
const DXF = await mod('dxf.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const F = (g, p) => ({ g, p });

section('values and places');
{
  ok(GL.labelText(12.34567) === '12.346' && GL.labelText(7) === '7' && GL.labelText(true) === 'Yes' && GL.labelText('') === '' && GL.labelText(null) === '' && GL.labelText('  two\n words ') === 'two words', 'text of a value: 12.346, 7, Yes, blank skipped, whitespace folded');
  const mm = 1 / 40 * 25.4;   // 1" = 40'
  const L = { label: { field: 'N' } };
  const pt = GL.labelItems(L, [F({ t: 'pt', c: [100, 200] }, { N: 'MH-1' })], mm)[0];
  near(pt.x, 100 + 1.2 / mm, 1e-9, 'a point label 1.2 mm to the right'); ok(pt.align === 'left' && pt.text === 'MH-1' && pt.mm === 1.8, 'left-aligned, 1.8 mm');
  const ln = GL.labelItems(L, [F({ t: 'ln', c: [[[0, 0], [10, 0]], [[0, 0], [-100, 0], [-100, -50]]] }, { N: 'Elm St' })], mm)[0];
  ok(ln.align === 'center' && Math.abs(ln.rot) < 1e-12, 'a line label along its longest part, upright (the part runs west: turned to read left to right)');
  near(ln.x, -75, 1e-9, 'at the middle of that part (150 long: 75 along)'); near(ln.y, 1.4 / mm, 1e-9, '1.4 mm off the line');
  const pg = GL.labelItems(L, [F({ t: 'pg', c: [[[[0, 0], [40, 0], [40, 20], [0, 20], [0, 0]]]] }, { N: 'Lot 7' })], mm)[0];
  ok(Math.abs(pg.x - 20) < 1e-9 && Math.abs(pg.y - 10) < 1e-9, 'a polygon label at its centre (20, 10)');
  const u = GL.labelItems(L, [F({ t: 'pg', c: [[[[0, 0], [30, 0], [30, 30], [20, 30], [20, 10], [10, 10], [10, 30], [0, 30], [0, 0]]]] }, { N: 'U' })], mm)[0];
  ok(u.x === 0 && u.y === 0, 'a U-shape whose centre falls in the gap: the label goes on its outline');
  ok(GL.labelItems(L, [F({ t: 'pt', c: [0, 0] }, { N: '' }), F(null, { N: 'x' })], mm).length === 0, 'blank values and empty geometry: no label');
  const many = Array.from({ length: 6000 }, (_, i) => F({ t: 'pt', c: [i, 0] }, { N: i }));
  ok(GL.labelItems(L, many, mm).length === GL.MAX_LABELS, 'at most ' + GL.MAX_LABELS + ' labels per layer');
  const fs1 = [F({ t: 'pt', c: [0, 0] }, { N: 'a' })];
  ok(GL.labelItems(L, fs1, mm) === GL.labelItems(L, fs1, mm) && GL.labelItems(L, fs1, mm * 2) !== GL.labelItems(L, fs1, mm), 'cached per features and scale');
}

section('setting labels, undo, the project file, the DXF');
{
  const p = new PJ.Project();
  const [id] = GL.addLayers(p, [{ name: 'Manholes', geom: 'pt', hasZ: false, fields: [{ name: 'ID', type: 'text' }, { name: 'Rim', type: 'number' }], features: [F({ t: 'pt', c: [1000, 2000] }, { ID: 'MH-1', Rim: 101.5 }), F({ t: 'pt', c: [1100, 2050] }, { ID: 'MH-2', Rim: 99.25 })] }]);
  ok(!GL.setLayer(p, id, { label: 'Nope' }) && !GL.layerOf(p, id).label, 'an unknown field is refused');
  const steps = p.undoStack.length;
  ok(GL.setLayer(p, id, { label: 'Rim' }) && GL.layerOf(p, id).label.field === 'Rim' && p.undoStack.length === steps + 1, 'label with Rim: one undo step');
  const items = GL.gisScene(p, 1).items.filter((it) => it.kind === 'text');
  ok(items.length === 2 && items.map((it) => it.text).join() === '101.5,99.25' && items.every((it) => it.layer === 'GIS-' + id), 'the plan scene has the two labels on the layer GIS-' + id);
  p.undo();
  ok(!GL.layerOf(p, id).label && !GL.gisScene(p, 1).items.some((it) => it.kind === 'text'), 'undo: no labels');
  p.redo();
  const json = JSON.parse(JSON.stringify(p.toJSON()));
  ok(PJ.Project.fromJSON(json).project.state.gis.layers[0].label?.field === 'Rim', 'the project file keeps the label field');
  json.gis.layers[0].label = { field: 'Gone' };
  ok(!PJ.Project.fromJSON(json).project.state.gis.layers[0].label, 'a label on a field the layer does not have is dropped on open');
  GL.setLayer(p, id, { label: null });
  ok(!GL.layerOf(p, id).label, 'No labels');
  GL.setLayer(p, id, { label: 'ID' });
  // the DXF: the plan scene + the GIS scene, as civilcraft.js builds it, written as R12 and read back
  const scene = SC.planScene({ units: 'ft' }, { mmPerUnit: 1 });
  const g = GL.gisScene(p, 1);
  scene.layers = [...g.layers, ...scene.layers]; scene.items.push(...g.items);
  const { text } = DXF.writeDxf({ units: 'ft', layers: scene.layers.map((l) => ({ name: l.name, color: l.aci })), entities: SC.toDxfEntities(scene, 1) });
  const texts = [...text.matchAll(/\n\s*0\s*\nTEXT\s*\n([\s\S]*?)(?=\n\s*0\s*\n)/g)].map((m) => m[1]);
  const vals = texts.map((b) => { const m = b.match(/\n\s*1\s*\n([^\n]*)/); return m ? m[1].trim() : ''; });
  ok(vals.includes('MH-1') && vals.includes('MH-2'), 'the R12 DXF has TEXT MH-1 and MH-2');
  ok(texts.some((b) => /(^|\n)\s*8\s*\nGIS-/.test(b)), 'on the GIS layer');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

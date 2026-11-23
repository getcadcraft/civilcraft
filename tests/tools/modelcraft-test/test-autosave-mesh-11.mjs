#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-autosave-mesh-11.mjs — 0.11 PERF.24 (ModelCraft part, session perf-finish-11): an edited mesh is written by the autosave
 * journal as its edits, not whole. On imported meshes (glTF, OBJ) and an edited one: a base (the worker's fileTextChecked, run
 * here), then position edits, topology edits (inset, extrude, delete, subdivide, bevel), paints, undo, redo, a new branch after
 * undo, a placement move; after every write the copy (base + changes) recovers to exactly the text the page would save, and the
 * mesh's changes are written as steps (bytes printed). Also: a mesh whose base cannot be read back slot for slot is written
 * once in slot form, then as steps; a step that adds a layer falls back to slot form; a recovered copy of each step type.
 *   node tools/modelcraft-test/test-autosave-mesh-11.mjs [--big]   (--big adds the 500k-face glTF)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, '../../public_html/assets/apps/modelcraft/dev');
const imp = (rel) => import(pathToFileURL(path.join(APP, rel)));
(await imp('i18n.js')).init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const M = await imp('model.js'), FT = await imp('file-text.js'), J = await imp('autosave-journal.js'), IJ = await imp('import-job.js'), OPS = await imp('mesh/ops.js');
const { makePrimitive } = await imp('mesh/primitives.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const T = '/var/www/CADCRAFT/testfiles/generated/m3d/';
const files = [path.resolve(HERE, '../../testfiles/generated/model11/MetalRoughSpheres.glb'), T + 'm3d-50k-faces.glb', T + 'm3d-50k-faces.obj'];
if (process.argv.includes('--big')) files.push(T + 'm3d-500k-faces.glb');

async function run(label, model) {
  const fileData = () => { const j = model.toJSON(false, { raw: true }); j.images = model.imagesJSON(); return j; };
  const text = () => FT.fileText({ j: fileData() });
  const head = () => { const j = model.toJSON(true, { raw: true }); j.images = model.imagesJSON(); return j; };
  const journal = J.modelJournal({ model, baseText: () => FT.fileTextChecked({ j: fileData() }), head });
  const base = await journal.base(); base.commit();
  const segs = [];
  const check = async (what, { steps = true } = {}) => {
    const d = await journal.delta();
    if (!d) { ok(false, `${label}: ${what}: nothing written`); return; }
    segs.push(structuredClone(d.data)); d.commit();
    const meshDefs = d.data.defs.filter((x) => x.kind === 'mesh');
    const kinds = meshDefs.map((x) => (x.meshSteps ? 'steps' : x.meshSlots ? 'slots' : x.mesh ? 'whole' : 'head'));
    if (steps) ok(meshDefs.length > 0 && kinds.every((k) => k === 'steps'), `${label}: ${what}: the mesh written as its edits (${kinds.join(',') || 'no mesh'})`);
    ok(J.recoverModelText({ data: base.data, segments: segs }) === text(), `${label}: ${what}: the copy recovers to the page's text`);
    console.log(`  ${label}: ${what}: ${d.size.toLocaleString()} bytes (${kinds.join(',') || '-'})`);
  };
  const md = [...model.defs.values()].filter((d) => d.mesh).sort((a, b) => b.mesh.nf - a.mesh.nf)[0];
  const m = md.mesh;
  const whole = m.nv * 24 + m.nh * 4 * 3;
  console.log(`${label}: ${md.name}, ${m.faceCount} faces; base ${base.size.toLocaleString()} characters; the mesh whole is about ${whole.toLocaleString()} bytes`);
  const edit = (name, fn) => model.meshEdit(md.id, name, (mm) => fn(mm));
  edit('nudge', (mm) => mm.setPos(3, mm.P[9] + 0.25, mm.P[10], mm.P[11] - 0.5));
  await check('a vertex moved');
  edit('inset', (mm) => OPS.insetFaces(mm, [0, 1000, 2000], { thickness: 0.01, individual: true }));
  await check('three faces inset (apart)');
  edit('extrude', (mm) => OPS.extrudeRegion(mm, [5]));
  await check('a face extruded');
  edit('delete', (mm) => OPS.deleteElems(mm, { faces: [7, 8] }));
  await check('two faces deleted');
  edit('paint', (mm) => { const p = mm.paintIndex('#ff0000'); mm.setFaceMat(10, p); mm.setFaceMat(11, p); });
  await check('two faces painted');
  model.undo(); await check('undo');
  model.undo(); await check('undo again');
  model.redo(); await check('redo');
  edit('subdivide', (mm) => OPS.subdivide(mm, { faces: [12] }, 1));
  await check('a new branch after undo: a face subdivided');
  model.undo(); model.undo(); model.undo(); await check('three undos in one write');
  model.redo(); model.redo(); await check('two redos in one write');
  model.change('move', (mm) => { const [iid] = [...mm.root.insts.keys()]; const i = mm.root.insts.get(iid); const n = i.m.slice(); n[12] += 1; i.m = n; }, [model.root.id]);
  await check('a placement moved', { steps: false });
  edit('layer', (mm) => { mm.addAttr('weight.test', 'vertex', 1, 'f32'); mm.setAttr('weight.test', 0, [0.5]); });
  { const d = await journal.delta(); segs.push(structuredClone(d.data)); d.commit(); const x = d.data.defs.find((y) => y.id === md.id);
    ok(x && x.meshSlots, `${label}: a step that adds a layer writes the mesh in slot form`); ok(J.recoverModelText({ data: base.data, segments: segs }) === text(), `${label}: layer added: recovers`); }
  edit('nudge2', (mm) => mm.setPos(4, mm.P[12], mm.P[13] + 1, mm.P[14]));
  await check('a vertex moved after the slot form');
  for (let k = 0; k < 6; k++) { model.undo(); }
  { const d = await journal.delta(); segs.push(structuredClone(d.data)); d.commit(); const x = d.data.defs.find((y) => y.id === md.id);
    ok(x && x.meshSlots, `${label}: undos back past the layer step: slot form`); ok(J.recoverModelText({ data: base.data, segments: segs }) === text(), `${label}: six undos: recovers`); }
}

for (const f of files) {
  if (!fs.existsSync(f)) { console.log('skipped (not there): ' + f); continue; }
  const model = new M.Model();
  const pkg = await IJ.importJob({ kind: /\.obj$/i.test(f) ? 'obj' : 'gltf', bytes: new Uint8Array(fs.readFileSync(f)).buffer, name: path.basename(f).replace(/\.[^.]+$/, '') });
  model.change('import', (m) => { const x = IJ.graftImport(m, pkg); m.place(m.root, x.def.id, I); return x; }, [model.root.id]);
  await run(path.basename(f), model);
}

// a mesh edited before the base (dead slots): the copy does not read it back slot for slot, so the first change is its slot form
{
  const model = new M.Model();
  const cube = makePrimitive('cube', { size: 1 });
  const d = model.change('cube', (m) => { const x = m.newMeshDef(cube, 'Cube'); m.place(m.root, x.id, I); return x; });
  model.meshEdit(d.id, 'del', (mm) => OPS.deleteElems(mm, { faces: [0] }));
  const fileData = () => model.toJSON(false, { raw: true });
  const journal = J.modelJournal({ model, baseText: () => FT.fileTextChecked({ j: fileData() }), head: () => model.toJSON(true, { raw: true }) });
  const base = await journal.base(); base.commit();
  const segs = [];
  model.meshEdit(d.id, 'nudge', (mm) => mm.setPos(1, 0, 0, 2));
  let w = await journal.delta(); segs.push(structuredClone(w.data)); w.commit();
  ok(w.data.defs[0].meshSlots, 'a mesh with dead slots at the base: first written in slot form');
  ok(J.recoverModelText({ data: base.data, segments: segs }) === FT.fileText({ j: fileData() }), 'slot form recovers');
  model.meshEdit(d.id, 'nudge', (mm) => mm.setPos(2, 0, 1, 2));
  w = await journal.delta(); segs.push(structuredClone(w.data)); w.commit();
  ok(w.data.defs[0].meshSteps, 'then as its edits');
  ok(J.recoverModelText({ data: base.data, segments: segs }) === FT.fileText({ j: fileData() }), 'its edits recover');
  // the old state let go (gc of the mesh journal): written in slot form, no error
  model.meshEdit(d.id, 'nudge', (mm) => mm.setPos(3, 1, 1, 2));
  d.mesh.gc(new Set());
  w = await journal.delta(); segs.push(structuredClone(w.data)); w.commit();
  ok(w.data.defs[0].meshSlots || w.data.defs[0].meshSteps, 'a state let go: still written');
  ok(J.recoverModelText({ data: base.data, segments: segs }) === FT.fileText({ j: fileData() }), 'and recovers');
}
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

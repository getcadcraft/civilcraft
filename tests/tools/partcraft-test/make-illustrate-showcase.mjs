#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-illustrate-showcase.mjs — makes fixtures/showcase/partcraft-four-bar.partcraft-manual.json ONCE (0.7 TP.12, session
 * `illustrate`; CC0, ours): a manual of part-08's four-bar showcase assembly (partcraft-four-bar.partcraft-asm.json) with part
 * numbers and materials, three views (Assembled with balloons and the parts list; Exploded along the pivots with a label, a
 * turn arrow and trails; Pivot detail with the magnifier), a two-step instructions document and an animation (the views as
 * camera stops). Refuses to overwrite; `--check` rebuilds in memory and compares (the date is fixed, thumbnails are left empty:
 * open the manual and Update view to give the views pictures).
 *   node tools/partcraft-test/make-illustrate-showcase.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EN } from './illustrate-lang.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const SRC = path.join(REPO, 'fixtures/showcase/partcraft-four-bar.partcraft-asm.json');
const OUT = path.join(REPO, 'fixtures/showcase/partcraft-four-bar.partcraft-manual.json');
const check = process.argv.includes('--check');
if (fs.existsSync(OUT) && !check) { console.log('exists, left as it is: ' + OUT); process.exit(0); }
const I18N = await import(DEV + 'i18n.js');
I18N.init({ locale: 'en', strings: { ...JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')), ...EN } });
const A = await import(DEV + 'assembly.js'), K = await import(DEV + 'kernel.js');
const W = await import(DEV + 'ws-illustrate.js');
const MN = await import(DEV + 'illustrate/all.js');
const AN = await import(DEV + 'illustrate/annotate.js'), PL = await import(DEV + 'illustrate/parts-list.js');
const CAM = await import(DEV + 'illustrate/camera.js'), LK = await import(DEV + 'illustrate/look.js');
const IN = await import(DEV + 'illustrate/instructions.js'), TL = await import(DEV + 'illustrate/timeline.js');
const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
const M = await Module(); M.setup();

const text = fs.readFileSync(SRC, 'utf8');
const asm = A.readAssembly(text);
const builds = new Map(Object.entries(asm.parts).map(([pid, p]) => [pid, K.regenerate(p.part, M, { checkpoints: false })]));
const world = A.placeAll(asm, builds).world;
const crypto = await import('node:crypto');
const made = W.manualFromAssembly(asm, builds, world, { sourceName: 'partcraft-four-bar.partcraft-asm.json', sha: crypto.createHash('sha256').update(text).digest('hex') });
made.m.created = '2026-10-23T00:00:00.000Z';
const doc = new MN.Doc(made);
const aspect = 1.6;
doc.edit('showcase', (m) => {
  const props = { p1: ['FB-100', 'Ground link'], p3: ['FB-110', 'Crank'], p5: ['FB-120', 'Coupler'], p7: ['FB-130', 'Rocker'] };
  for (const [pid, [number, description]] of Object.entries(props)) Object.assign(m.parts[pid], { number, description, material: 'Aluminium 6061', density: 2.7 });
  const box = MN.sceneBox(m, doc.meshes, null);
  // 1. Assembled
  m.scene = MN.blankScene(CAM.fitCamera(box, { dir: [0.55, 0.45, 1], aspect, fill: 0.7 }));
  for (const b of AN.autoBalloons(m, doc.meshes, m.scene, { aspect })) AN.addAnnotation(m, b, m.scene);
  m.scene.table = PL.readTable({ at: [0.98, 0.03], columns: ['item', 'qty', 'number', 'name', 'material'] });
  MN.addView(m, { from: { ...m.scene, id: 'x' }, name: 'Assembled' });
  // 2. Exploded: each bar pulled out along the pivots (Z), the ground stays
  const ids = m.instances.map((i) => i.id);
  m.scene.annots = []; m.scene.table = null;
  ids.slice(1).forEach((id, k) => MN.moveInstances(m.scene, [id], [0, 0, 22 * (k + 1)]));
  m.scene.camera = MN.readCamera(CAM.fitCamera(MN.sceneBox(m, doc.meshes, m.scene), { dir: [0.75, 0.5, 1], aspect, fill: 0.72 }));
  for (const b of AN.autoBalloons(m, doc.meshes, m.scene, { aspect })) AN.addAnnotation(m, b, m.scene);
  const crank = m.instances.find((i) => m.parts[i.part].name === 'Crank');
  AN.addAnnotation(m, { kind: 'label', anchor: { inst: crank.id, p: [0, 8, 5] }, off: [-0.02, -0.3], text: '{name} {number}\n{material}', frame: 'box' }, m.scene);
  AN.addAnnotation(m, { kind: 'arrow', anchor: { inst: crank.id, p: [0, 0, 5] }, arrow: { dir: [0, 0, 1], len: 22, style: 'turn' } }, m.scene);
  MN.addView(m, { from: { ...m.scene, id: 'x' }, name: 'Exploded' });
  // 3. Pivot detail: the assembled view with a magnifier on the crank's pivot
  m.scene = MN.sceneOf(m.views[0]);
  const P = CAM.projector(m.scene.camera, aspect);
  const pivot = P.project(MN.worldOf(m, m.scene).get(crank.id).slice(12, 15));
  m.scene.look = LK.readLook({ style: 'outlined', magnifier: { at: [0.32, 0.72], target: [pivot[0], pivot[1]], r: 0.18, zoom: 3.5, mode: 'zoom' } });
  m.scene.annots = []; m.scene.table = null;
  MN.addView(m, { from: { ...m.scene, id: 'x' }, name: 'Pivot detail' });
  m.scene = MN.sceneOf(m.views[0]);
  // instructions and the animation
  m.instructions = IN.defaultInstructions(m);
  Object.assign(m.instructions, { title: 'Four-bar linkage', subtitle: 'Assembly instructions (sample)' });
  m.instructions.steps = m.instructions.steps.slice(0, 2);
  Object.assign(m.instructions.steps[0], { title: 'Lay out the parts', notes: 'Check that you have the four links shown, and the pins for the four pivots.', tools: ['Hex key set'] });
  Object.assign(m.instructions.steps[1], { title: 'Stack the links on the pivots', notes: 'Fit the crank, the coupler and the rocker in this order, each over the one before.', warnings: ['Keep fingers clear of the linkage while it turns.'], tools: ['Soft mallet'] });
  TL.viewsAsStops(m, m.views.slice(0, 2).map((v) => v.id), { start: 0, move: 2, hold: 1.5 });
});
const out = doc.toJSON();
if (check) {
  const same = fs.readFileSync(OUT, 'utf8') === out;
  console.log(same ? 'same as the saved file' : 'DIFFERS from the saved file');
  process.exit(same ? 0 : 1);
}
fs.writeFileSync(OUT, out);
console.log('wrote ' + OUT + ' (' + Math.round(out.length / 1024) + ' KB)');

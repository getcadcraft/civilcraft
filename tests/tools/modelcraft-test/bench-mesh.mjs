#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bench-mesh.mjs — how fast a big mesh edits with delta undo (0.7 MD.1). A grid of --faces quads (default 100 000) as a
 * mesh definition; 20 edits that each move --touch vertices (default 50) through model.meshEdit, then 20 undos and 20
 * redos. Prints JSON: per-edit, undo and redo times (median, ms), what one undo step holds, the journal's size, the
 * mesh file size, what a whole-model JSON snapshot of the same model costs (what undo did before MD.1), and the work the
 * view redoes per edit (triangulate + corner normals; three.js itself is not timed here).
 *   node tools/modelcraft-test/bench-mesh.mjs [--faces 1000000] [--touch 50]
 * On this VPS run it small and capped (rule 14):  systemd-run --scope --slice=forkrust.slice nice -n 19 ionice -c3 node …
 * The 1 M-face number belongs to the owner's machine: paste the JSON back.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? +process.argv[i + 1] : d; };
const FACES = arg('--faces', 100000), TOUCH = arg('--touch', 50);
const I18N = await import(path.join(APP, 'i18n.js'));
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const M = await import(path.join(APP, 'model.js'));
const { Mesh } = await import(path.join(APP, 'mesh.js'));

const n = Math.max(1, Math.round(Math.sqrt(FACES)));
const nv = (n + 1) * (n + 1), p = new Float64Array(nv * 3);
for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) { const k = (j * (n + 1) + i) * 3; p[k] = i * 0.01; p[k + 1] = j * 0.01; }
const fc = new Int32Array(n * n).fill(4), fi = new Int32Array(n * n * 4);
for (let j = 0, k = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = j * (n + 1) + i; fi[k++] = a; fi[k++] = a + 1; fi[k++] = a + n + 2; fi[k++] = a + n + 1; }
let t0 = performance.now();
const mesh = new Mesh();
mesh._bulk(p, nv, fc, fi);
const build = performance.now() - t0;
const model = new M.Model();
const def = model.change('add', () => { const d = model.newMeshDef(mesh, 'Grid'); model.place(model.root, d.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); return d; });

const med = (a) => { const b = a.slice().sort((x, y) => x - y); return +b[b.length >> 1].toFixed(3); };
const edits = [], undos = [], redos = [];
let seed = 1;
const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 2 ** 32);
for (let e = 0; e < 20; e++) {
  const vs = Array.from({ length: TOUCH }, () => Math.floor(rnd() * nv));
  t0 = performance.now();
  model.meshEdit(def.id, 'nudge', (m) => { for (const v of vs) m.setPos(v, m.P[v * 3], m.P[v * 3 + 1], m.P[v * 3 + 2] + 0.01); });
  edits.push(performance.now() - t0);
}
const step = model.lastStep();
const stepChars = step.b.head.length + step.b.parts.reduce((s, q) => s + q[1].length, 0) + step.a.head.length + step.a.parts.reduce((s, q) => s + q[1].length, 0);
for (let e = 0; e < 20; e++) { t0 = performance.now(); model.undo(); undos.push(performance.now() - t0); }
for (let e = 0; e < 20; e++) { t0 = performance.now(); model.redo(); redos.push(performance.now() - t0); }
// a drag in edit mode (MD.2): a preview frame puts the moved vertices back and moves them again (1 % of the mesh's vertices)
const dragVs = Array.from({ length: Math.max(1, Math.round(nv / 100)) }, (_, i) => (i * 97) % nv), frames = [];
model.begin();
for (let k = 0; k < 20; k++) {
  t0 = performance.now();
  model.meshPreview(def.id, (m) => { for (const v of dragVs) m.setPos(v, m.P[v * 3], m.P[v * 3 + 1], m.P[v * 3 + 2] + k * 0.001); });
  frames.push(performance.now() - t0);
}
model.commit('drag');
model.undo();
t0 = performance.now();
const file = JSON.stringify(model.def(def.id).mesh.toJSON());
const toJSONms = performance.now() - t0;
// what one undo step cost before MD.1: the whole definition as push/pull JSON (faces as kernel faces), twice
t0 = performance.now();
const geo = M.meshGeometry(model.def(def.id).mesh);
const asGeometry = performance.now() - t0;
t0 = performance.now();
const oldStep = JSON.stringify({ verts: [...geo.verts].map(([id, q]) => [id, ...q]), faces: [...geo.faces].map(([id, f]) => ({ id, loops: f.loops })), edges: [...geo.edges].map(([id, e]) => [id, e.a, e.b, e.soft ? 1 : 0]) });
const oldSnapMs = performance.now() - t0;
t0 = performance.now();
const T = model.def(def.id).mesh.triangulate(); model.def(def.id).mesh.cornerNormals();
const viewWork = performance.now() - t0;
console.log(JSON.stringify({
  machine: { host: os.hostname(), cpus: os.cpus().length, cpu: os.cpus()[0]?.model, node: process.version, load: os.loadavg().map((x) => +x.toFixed(2)) },
  faces: n * n, verts: nv, touched_per_edit: TOUCH, build_ms: +build.toFixed(1),
  edit_ms_median: med(edits), undo_ms_median: med(undos), redo_ms_median: med(redos),
  drag_frame_ms_median: med(frames), drag_verts: dragVs.length,
  undo_step_chars: stepChars, journal_bytes: model.def(def.id).mesh.journalBytes(), mesh_states: model.def(def.id).mesh.stateCount,
  file_chars: file.length, mesh_toJSON_ms: +toJSONms.toFixed(1),
  before_md1: { whole_def_json_chars: oldStep.length, json_ms: +oldSnapMs.toFixed(1), note: 'one undo step held this twice (before and after) and made it on every edit' },
  pushpull_view_of_mesh_ms: +asGeometry.toFixed(1), view_rebuild_cpu_ms: +viewWork.toFixed(1), triangles: T.n,
}, null, 2));

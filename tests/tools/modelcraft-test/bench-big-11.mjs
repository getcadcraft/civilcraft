#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bench-big-11.mjs — ModelCraft's model code on a big glTF in Node (0.11 PERF.21 / PERF.7 / PERF.24, session perf-finish-11,
 * lane `model`): the import (the page's way: readGltf + importGltfScene in one change; or the worker's: import-job.js importJob,
 * then graftImport, timed apart), then the first edits (a vertex of the biggest mesh, a placement), undo and redo, and what the
 * autosave writes after one mesh edit (now: its edits; before 0.11: the whole mesh, defToJSON raw). Wall time and peak RSS.
 * Paths are relative to this file or given, so it runs on workstation11a too:
 *   node --max-old-space-size=16000 tools/modelcraft-test/bench-big-11.mjs <file.glb> [--path page|job] [--no-base]
 *   tools/gpu-remote/run.sh --session pf11-model-big --wsl -- tools/modelcraft-test/bench-big-11.mjs ~/cc-data/model-11/m3d-gen-5m-faces.glb --path job
 * One RESULT line (JSON).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// a big file needs a big heap: run again with one when started without (run.sh starts plain `node file`)
if (!process.execArgv.some((a) => a.startsWith('--max-old-space-size'))) {
  const { spawnSync } = await import('node:child_process');
  process.exit(spawnSync(process.execPath, ['--max-old-space-size=24000', ...process.execArgv, fileURLToPath(import.meta.url), ...process.argv.slice(2)], { stdio: 'inherit' }).status ?? 1);
}
const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, '../../public_html/assets/apps/modelcraft/dev');
const imp = (rel) => import(pathToFileURL(path.join(APP, rel)));
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const file = process.argv[2].replace(/^~/, os.homedir());
const PATH = arg('--path', 'job');
let peak = 0;
const sample = () => { const r = process.memoryUsage().rss; if (r > peak) peak = r; return r; };
setInterval(sample, 25).unref();
const t = () => performance.now();
const MB = (n) => Math.round(n / 1048576);
const R = { file: path.basename(file), mb: MB(fs.statSync(file).size), path: PATH, host: os.hostname(), cpus: os.cpus().length, load: os.loadavg().map((x) => x.toFixed(2)).join(' ') };
const lap = (k, a) => { R[k] = Math.round(t() - a); sample(); R[k + '_rss'] = MB(process.memoryUsage().rss); };

(await imp('i18n.js')).init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const M = await imp('model.js'), FT = await imp('file-text.js'), J = await imp('autosave-journal.js');
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

let a = t();
const bytes = new Uint8Array(fs.readFileSync(file));
lap('read_file_ms', a);
const model = new M.Model();
if (PATH === 'page') {
  const { readGltf } = await imp('io/gltf-read.js'); const { importGltfScene } = await imp('io/gltf-import.js');
  a = t(); const scene = await readGltf(bytes); lap('gltf_read_ms', a);
  a = t(); model.change('import', (m) => { const x = importGltfScene(m, scene, 'big'); m.place(m.root, x.def.id, I); return x; }, [model.root.id]); lap('import_change_ms', a);
} else {
  const IJ = await imp('import-job.js');
  a = t(); const pkg = await IJ.importJob({ kind: 'gltf', bytes: bytes.buffer, name: 'big' }); lap('worker_job_ms', a);
  if (pkg.fail || pkg.pageOnly) { console.log('RESULT ' + JSON.stringify({ ...R, error: pkg.fail || pkg.pageOnly })); process.exit(1); }
  a = t(); const moved = structuredClone(pkg, { transfer: pkg.buffers.flat() }); lap('transfer_ms', a);
  a = t(); model.change('import', (m) => { const x = IJ.graftImport(m, moved); m.place(m.root, x.def.id, I); return x; }, [model.root.id]); lap('page_graft_ms', a);
}
const md = [...model.defs.values()].filter((d) => d.mesh).sort((x, y) => y.mesh.nf - x.mesh.nf)[0];
R.faces = [...model.defs.values()].reduce((n, d) => n + (d.mesh ? d.mesh.faceCount : 0), 0);
R.biggest = md.mesh.faceCount;

// the autosave's first copy (the page's worker pool writes it; timed here in-process), then a journal on it
const fileData = () => model.toJSON(false, { raw: true });
const journal = J.modelJournal({ model, baseText: () => FT.fileTextChecked({ j: fileData() }), head: () => model.toJSON(true, { raw: true }) });
if (!process.argv.includes('--no-base')) {
  a = t(); const base = await journal.base(); lap('autosave_base_ms', a); base.commit(); R.autosave_base_mb = MB(base.size);
}
// first edit of the biggest mesh, then a placement move, undo, redo
a = t(); model.meshEdit(md.id, 'nudge', (m) => m.setPos(7, m.P[21], m.P[22], m.P[23] + 0.5)); lap('first_mesh_edit_ms', a);
a = t(); model.change('move', (m) => { const [iid] = [...m.root.insts.keys()]; const i = m.root.insts.get(iid); const n = i.m.slice(); n[12] += 1; i.m = n; }, [model.root.id]); lap('placement_move_ms', a);
a = t(); model.undo(); lap('undo_ms', a);
a = t(); model.redo(); lap('redo_ms', a);
if (!process.argv.includes('--no-base')) {
  a = t(); const d = await journal.delta(); lap('autosave_delta_ms', a);
  R.autosave_delta_bytes = d ? d.size : 0;
  R.autosave_delta_kind = d ? d.data.defs.filter((x) => x.kind === 'mesh').map((x) => (x.meshSteps ? 'steps' : x.meshSlots ? 'slots' : 'whole')).join(',') : 'none';
  a = t(); const old = M.defToJSON(md, true); lap('before_whole_mesh_ms', a);   // what 0.10's delta wrote for this mesh
  let n = 0; const walk = (x) => { if (!x || typeof x !== 'object') return; if (ArrayBuffer.isView(x)) { n += x.byteLength; return; } for (const k of Object.keys(x)) walk(x[k]); }; walk(old.mesh);
  R.before_whole_mesh_mb = MB(n);
}
R.undo_journal_mb = +(md.mesh.journalBytes() / 1048576).toFixed(2);
R.peak_rss_mb = MB(peak);
console.log('RESULT ' + JSON.stringify(R));

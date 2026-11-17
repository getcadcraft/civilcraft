#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gltf-import-hash.mjs — every glTF of the test corpus (and the m3d files) read and imported in Node with the dev build
 * (io/gltf-read.js + io/gltf-import.js), printed as one line per file: definitions, faces, and a SHA-256 of the model's
 * file text (meshes included). Run before and after a change to the importer and diff: equal lines = the same model
 * (0.10 PERF.7, session `model-part-10`). Files that need a browser decoder (Draco, meshopt, KTX2) are listed as skipped.
 *   node tools/modelcraft-test/gltf-import-hash.mjs > before.txt   …change…   node … > after.txt; diff before.txt after.txt
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, '../../public_html/assets/apps/modelcraft/dev');
const imp = (rel) => import(pathToFileURL(path.join(APP, rel)));
const I18N = await imp('i18n.js');
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { readGltf } = await imp('io/gltf-read.js');
const { importGltfScene } = await imp('io/gltf-import.js');
const M = await imp('model.js');

const files = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(glb|gltf)$/i.test(e.name)) files.push(p); } };
walk('/var/www/CADCRAFT/testfiles/gltf-corpus');
for (const k of ['50k', '500k']) { const p = `/var/www/CADCRAFT/testfiles/generated/m3d/m3d-${k}-faces.glb`; if (fs.existsSync(p)) files.push(p); }
for (const f of files.sort()) {
  const name = path.relative('/var/www/CADCRAFT/testfiles', f);
  try {
    const dir = path.dirname(f);
    const resolve = async (uri) => { const p = path.join(dir, decodeURIComponent(String(uri))); return fs.existsSync(p) ? new Uint8Array(fs.readFileSync(p)) : null; };
    const scene = await readGltf(new Uint8Array(fs.readFileSync(f)), { resolve });
    const g = new M.Model();
    g.change('i', (m) => { const x = importGltfScene(m, scene, 'imp'); m.place(m.root, x.def.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); return x; });
    let faces = 0, verts = 0;
    for (const d of g.defs.values()) if (d.mesh) { faces += d.mesh.faceCount; verts += d.mesh.vertexCount; }
    const h = crypto.createHash('sha256').update(JSON.stringify(g.toJSON())).update(JSON.stringify(g.imagesJSON())).digest('hex').slice(0, 24);
    console.log(`${name} | defs ${g.defs.size} faces ${faces} verts ${verts} | ${h}`);
  } catch (e) { console.log(`${name} | skipped: ${String(e.message).slice(0, 80)}`); }
}

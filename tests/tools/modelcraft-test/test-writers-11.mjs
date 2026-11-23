#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-writers-11.mjs — 0.11 PERF.26 (ModelCraft part, session perf-finish-11): the OBJ (io/obj.js exportObj), Collada (io.js
 * exportDAE over cc-collada documentParts) and USDA (usd-modelcraft.js saveUsd over cc-usd writeUsdaTo) writers now write into
 * lib/textout's TextChunks. Their text must be byte for byte what the writers before the change wrote: BEFORE=<a copy of
 * modelcraft/dev with the 0.10 writers> (tmp/pf11-model/before-writers/dev by default), compared on painted, unpainted, textured,
 * meshed and push/pull models and the m3d-50k / 500k glTFs; and past 300 M characters the result is a Blob of the same parts
 * (forced with a small blobFrom). Prints the time of each writer before and after.
 *   node tools/modelcraft-test/test-writers-11.mjs [--big]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const NEW = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev');
const OLD = path.resolve(process.env.BEFORE || path.join(ROOT, 'tmp/pf11-model/before-writers/dev'));
if (!fs.existsSync(OLD)) { console.log('no BEFORE copy at ' + OLD); process.exit(2); }
const load = async (dir) => {
  const imp = (f) => import(pathToFileURL(path.join(dir, f)).href);
  (await imp('i18n.js')).init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(dir, 'lang/en.json'), 'utf8')) });
  return { M: await imp('model.js'), IO: await imp('io.js'), OBJ: await imp('io/obj.js'), USD: await imp('usd-modelcraft.js'), J: await imp('import-job.js'), P: await imp('mesh/primitives.js'), C: await imp('chunks.js') };
};
const A = await load(OLD), B = await load(NEW);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const date = new Date('2026-11-21T12:00:00Z');

/** The same model built in both trees (each tree's own Model and kernel). */
async function build(L, kind) {
  const m = new L.M.Model();
  if (kind === 'pushpull' || kind === 'painted-pp') {
    m.change('box', (x) => { L.M.addPolygon(x.root, L.M.rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 2, 3)); L.M.pushPull(x.root, [...x.root.faces.keys()][0], 1.5); if (kind === 'painted-pp') { const [fid] = x.root.faces.keys(); x.root.faces.get(fid).color = '#aa3300'; } });
  } else if (kind === 'meshes') {
    m.change('m', (x) => { const a = x.newMeshDef(L.P.makePrimitive('cube', { size: 1 }), 'Cube'); x.place(x.root, a.id, I); const b = x.newMeshDef(L.P.makePrimitive('cylinder', { r: 0.5, h: 2, segs: 24 }), 'Cyl'); const iid = x.place(x.root, b.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 3, 0, 0, 1]); x.root.insts.get(iid).color = '#2266cc'; });
  } else {
    const pkg = await L.J.importJob({ kind: /\.obj$/.test(kind) ? 'obj' : 'gltf', bytes: new Uint8Array(fs.readFileSync(kind)).buffer, name: path.basename(kind).replace(/\.[^.]+$/, '') });
    m.change('i', (x) => { const r = L.J.graftImport(x, pkg); x.place(x.root, r.def.id, I); });
  }
  return m;
}
const T = '/var/www/CADCRAFT/testfiles/';
const cases = ['pushpull', 'painted-pp', 'meshes', T + 'gltf-corpus/sample-assets/Duck/glTF-Binary/Duck.glb', T + 'gltf-corpus/sample-assets/BoxVertexColors/glTF-Binary/BoxVertexColors.glb', T + 'generated/m3d/m3d-50k-faces.glb', T + 'generated/m3d/m3d-50k-faces.obj'];
if (process.argv.includes('--big')) cases.push(T + 'generated/m3d/m3d-500k-faces.glb');
const time = (fn) => { const t = performance.now(); const r = fn(); return [r, Math.round(performance.now() - t)]; };
const fileOf = (L, m) => { const j = m.toJSON(); j.images = m.imagesJSON(); return j; };

for (const c of cases) {
  const name = c.includes('/') ? path.basename(c) : c;
  const ma = await build(A, c), mb = await build(B, c);
  const [oa, ta] = time(() => A.OBJ.exportObj(ma, { base: 'x' })), [ob, tb] = time(() => B.OBJ.exportObj(mb, { base: 'x' }));
  ok(typeof ob.obj === 'string' && ob.obj === oa.obj, `${name}: OBJ byte for byte (${oa.obj.length.toLocaleString()} characters)`);
  ok(ob.mtl === oa.mtl && ob.mtlName === oa.mtlName && ob.images.length === oa.images.length, `${name}: MTL and textures the same`);
  const [da, tda] = time(() => A.IO.exportDAE(ma, { name, date })), [db, tdb] = time(() => B.IO.exportDAE(mb, { name, date }));
  ok(typeof db === 'string' && db === da, `${name}: Collada byte for byte (${da.length.toLocaleString()} characters)`);
  const [ua, tua] = time(() => A.USD.saveUsd(fileOf(A, ma), ma, { format: 'usda', name: 'x.modelcraft' }).data), [ub, tub] = time(() => B.USD.saveUsd(fileOf(B, mb), mb, { format: 'usda', name: 'x.modelcraft' }).data);
  ok(typeof ub === 'string' && ub === ua, `${name}: USDA byte for byte (${ua.length.toLocaleString()} characters)`);
  console.log(`${name}: OBJ ${ta} → ${tb} ms · DAE ${tda} → ${tdb} ms · USDA ${tua} → ${tub} ms`);
}

// past the Blob size: the same text as parts in a Blob (blobFrom lowered so a small model shows it)
{
  const m = await build(B, 'meshes');
  const s = B.OBJ.exportObj(m, { base: 'x' }).obj;
  const lines = s.slice(0, -1).split('\n');
  const tc = new B.C.TextChunks('\n'); tc.addAll(lines);
  const blob = tc.finish(true).output('text/plain', { blobFrom: 10 });
  ok(blob instanceof Blob && await blob.text() === s, 'past blobFrom: a Blob holding exactly the text');
}
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

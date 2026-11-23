#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-import-job.mjs — 0.11 PERF.7: a glTF / OBJ import through import-job.js (the worker's job run here in-process, then
 * graftImport into the page's model) gives the same model as the importer run on the page: the same file text (SHA-256 of
 * Model.toJSON + imagesJSON), the same undo step, and view data (triangles + corner normals) equal to what the mesh itself
 * works out. Also: the package's buffers are transferable (structuredClone with transfer), a Draco file asks for the page,
 * a broken file comes back as its importer's own message, the ids stay right in a model that already holds things.
 *   node tools/modelcraft-test/test-import-job.mjs [--quick]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, '../../public_html/assets/apps/modelcraft/dev');
const imp = (rel) => import(pathToFileURL(path.join(APP, rel)));
const strings = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
(await imp('i18n.js')).init({ locale: 'en', strings });
const lang = { locale: 'en', strings };
const { readGltf } = await imp('io/gltf-read.js');
const { importGltfScene } = await imp('io/gltf-import.js');
const { readObj, importObj } = await imp('io/obj.js');
const M = await imp('model.js');
const J = await imp('import-job.js');
const FM = await imp('firstmodel.js');
const QUICK = process.argv.includes('--quick');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const sha = (m) => crypto.createHash('sha256').update(JSON.stringify(m.toJSON())).update(JSON.stringify(m.imagesJSON())).update(JSON.stringify([...m.lights])).update(JSON.stringify(m.scenes)).digest('hex').slice(0, 24);
const same = (a, b) => a.length === b.length && Buffer.compare(Buffer.from(a.buffer, a.byteOffset, a.byteLength), Buffer.from(b.buffer, b.byteOffset, b.byteLength)) === 0;

const files = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(glb|gltf)$/i.test(e.name)) files.push(p); } };
walk('/var/www/CADCRAFT/testfiles/gltf-corpus');
files.sort();
const extra = ['/var/www/CADCRAFT/testfiles/generated/m3d/m3d-50k-faces.glb', '/var/www/CADCRAFT/testfiles/generated/m3d/m3d-50k-faces.obj',
  '/var/www/CADCRAFT/forks/work/ref/manifold-3.5.4/test/models/hull-body.obj', '/var/www/CADCRAFT/forks/work/ref/manifold-3.5.4/test/models/Offset1.obj'];
if (!QUICK) extra.push('/var/www/CADCRAFT/testfiles/generated/m3d/m3d-500k-faces.glb', '/var/www/CADCRAFT/testfiles/generated/m3d/m3d-500k-faces.obj');
const list = (QUICK ? files.filter((_, i) => i % 6 === 0) : files).concat(extra.filter((f) => fs.existsSync(f)));

/** A model that already holds a placed mesh and an image, so the import's ids and image ids are not the first. */
async function busyModel() {
  const m = new M.Model();
  const { makePrimitive } = await imp('mesh/primitives.js');
  m.change('seed', (x) => { const d = x.newMeshDef(makePrimitive('cube', { size: 1 }), 'Seed'); x.place(x.root, d.id, I); x.addLight({ kind: 'point', p: [0, 0, 3], dir: [0, 0, -1], color: '#ffffff', lumens: 800, angle: 60, name: 'Seed lamp' }); });
  return m;
}

let same_n = 0, skipped = 0, page_only = 0;
for (const f of list) {
  const name = path.relative('/var/www/CADCRAFT', f);
  const kind = /\.obj$/i.test(f) ? 'obj' : 'gltf';
  const dir = path.dirname(f);
  const bytes = new Uint8Array(fs.readFileSync(f));
  const companions = kind === 'gltf' && /\.gltf$/i.test(f)
    ? fs.readdirSync(dir).filter((n) => !/\.gltf$/i.test(n) && fs.statSync(path.join(dir, n)).isFile()).map((n) => ({ name: n, bytes: new Uint8Array(fs.readFileSync(path.join(dir, n))).buffer }))
    : [];
  const byName = new Map(companions.map((c) => [c.name.toLowerCase(), c.bytes]));
  // the page path, as import-ui.js runs it
  const A = await busyModel();
  let ra, ea = null;
  try {
    const nm = path.basename(f).replace(/\.[^.]+$/, '');
    if (kind === 'gltf') {
      const scene = await readGltf(bytes, { resolve: async (u) => { const b = byName.get(String(u).split('/').pop().toLowerCase()); return b ? new Uint8Array(b) : null; } });
      ra = A.change('import', (m) => { const x = importGltfScene(m, scene, nm); m.place(m.root, x.def.id, I); return x; }, [A.root.id]);
    } else {
      const obj = await readObj(bytes, { resolve: async () => null });
      ra = A.change('import', (m) => { const x = importObj(m, obj, nm); m.place(m.root, x.def.id, I); return x; }, [A.root.id]);
    }
  } catch (e) { ea = e.message; }
  // the worker path
  const B = await busyModel();
  const pkg = await J.importJob({ kind, bytes: bytes.slice().buffer, companions, name: path.basename(f).replace(/\.[^.]+$/, ''), lang });
  if (pkg.pageOnly) { page_only++; ok(ea !== null || /draco/i.test(JSON.stringify(readJsonExt(bytes))), name + ': page only (' + pkg.pageOnly + ') for a file the page reads'); console.log(`${name} | page only: ${pkg.pageOnly}`); continue; }
  if (ea !== null || pkg.fail) {
    skipped++;
    ok(ea === pkg.fail, `${name}: the same refusal (page "${ea}", job "${pkg.fail}")`);
    console.log(`${name} | refused alike: ${String(ea).slice(0, 70)}`);
    continue;
  }
  // the package survives a transfer (what postMessage does)
  const moved = structuredClone(pkg, { transfer: pkg.buffers.flat() });
  ok(pkg.buffers.flat().every((b) => b.byteLength === 0), name + ': every buffer was transferred');
  const rb = B.change('import', (m) => { const x = J.graftImport(m, moved); m.place(m.root, x.def.id, I); return x; }, [B.root.id]);
  const ha = sha(A), hb = sha(B);
  ok(ha === hb, `${name}: the same model (${ha} vs ${hb})`);
  ok(JSON.stringify(ra.report) === JSON.stringify(rb.report), name + ': the same report');
  ok(A.undoStack.length === B.undoStack.length && A.undoStack.at(-1).before === B.undoStack.at(-1).before, name + ': the same undo step');
  const before = sha(await busyModel());
  B.undo(); ok(sha(B) === before, name + ': undo takes the import away');
  B.redo();
  ok(sha(B) === ha, name + ': redo gives the model back');
  // view data: the worker's triangles and normals are what the grafted mesh works out itself
  let views = 0;
  for (const d of B.defs.values()) {
    if (!d.mesh || !d.mesh._viewPre) continue;
    const P = d.mesh._viewPre, T = d.mesh.triangulate(), N = d.mesh.cornerNormals();
    ok(P.T.n === T.n && same(P.T.tri.subarray(0, T.n * 3), T.tri.subarray(0, T.n * 3)) && same(P.T.face.subarray(0, T.n), T.face.subarray(0, T.n)) && same(P.N, N), `${name}: view data of ${d.name}`);
    views++;
    // the guide card's shells handed in = meshShells worked out here; the file arrays by the column copy = by the walk
    const kept = FM.meshShells(d.mesh), fresh = FM.meshShells(Object.assign(Object.create(Object.getPrototypeOf(d.mesh)), d.mesh));
    ok(kept.length === fresh.length && kept.every((x, i) => x.closed === fresh[i].closed && x.volume === fresh[i].volume && same(Int32Array.from(x.faces), Int32Array.from(fresh[i].faces))), `${name}: shells of ${d.name}`);
    const fast = d.mesh.toArrays(), slowM = Object.assign(Object.create(Object.getPrototypeOf(d.mesh)), d.mesh, { _compactArrays: () => null }), slow = slowM.toArrays();
    ok(d.mesh._compactArrays() !== null, `${name}: ${d.name} is in file order`);
    ok(JSON.stringify(d.mesh.toJSON()) === JSON.stringify(slowM.toJSON()), `${name}: toJSON of ${d.name}, column copy = walk`);
    ok(JSON.stringify(Object.keys(fast)) === JSON.stringify(Object.keys(slow)) && ['p', 'fc', 'fi', 'fm', 'ff', 'vf', 'hf'].every((k) => same(fast[k], slow[k])) && fast.nv === slow.nv && fast.nf === slow.nf
      && JSON.stringify(fast.paints) === JSON.stringify(slow.paints) && fast.attrs.length === slow.attrs.length && fast.attrs.every((a, i) => a.name === slow.attrs[i].name && same(a.data, slow.attrs[i].data)), `${name}: toArrays of ${d.name}, column copy = walk`);
  }
  same_n++;
  console.log(`${name} | defs ${B.defs.size} faces ${rb.report.faces} | ${hb} | view data ${views}`);
}
function readJsonExt(u8) { try { const t = new TextDecoder().decode(u8.subarray(20, Math.min(u8.length, 200000))); return /KHR_draco_mesh_compression/.test(t) ? 'draco' : ''; } catch { return ''; } }

// edited meshes: faces added at the end keep the column copy (it must equal the walk); a face taken out falls back to the walk
{
  const { makePrimitive } = await imp('mesh/primitives.js');
  const a = makePrimitive('cube', { size: 1 }), b = makePrimitive('cube', { size: 2 });
  a.begin(); a.appendMesh(b); a.end();
  const walk = (m) => Object.assign(Object.create(Object.getPrototypeOf(m)), m, { _compactArrays: () => null });
  ok(a._compactArrays() !== null && JSON.stringify(a.toJSON()) === JSON.stringify(walk(a).toJSON()), 'faces appended: column copy = walk');
  a.begin(); a.replaceFaces([0], []); a.end();
  ok(a._compactArrays() === null, 'a face removed: the walk is used');
  ok(JSON.stringify(a.toJSON()) === JSON.stringify(walk(a).toJSON()), 'a face removed: the same JSON');
}
// a .glb that is cut short: the importer's own words, from the worker
const cut = new Uint8Array(fs.readFileSync(files.find((f) => /\.glb$/i.test(f)))).slice(0, 400);
const bad = await J.importJob({ kind: 'gltf', bytes: cut.buffer, name: 'cut', lang });
ok(typeof bad.fail === 'string' && bad.fail.length > 5, 'a broken glb comes back as a message: ' + bad.fail);
console.log(`\n${list.length} files: ${same_n} identical, ${skipped} refused alike, ${page_only} left to the page`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

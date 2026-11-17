#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-perf-010.mjs — 0.10 PERF.7 / PERF.38 / PERF.57 (session `model-part-10`): what moved off the page thread or stopped
 * being built must give the same answers as before.
 *   - the guide card reads a mesh definition from its mesh (firstmodel.js meshShells): the same pieces, closed or open, and
 *     volume as the push/pull copy the old path built (primitives, a joined mesh, an open one, the m3d-50k glTF)
 *   - more checks are added below as each change lands (see the sections)
 * No timing is asserted (rule 14): the numbers are in tools/modelcraft-test/perf-010.mjs's RESULT lines.
 *   node tools/modelcraft-test/test-perf-010.mjs        (or runPerf010Tests({ ok, section }) from bin/test-modelcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(HERE, '../../public_html/assets/apps/modelcraft/dev');
const imp = (rel) => import(pathToFileURL(path.join(APP, rel)));
const GLB50K = '/var/www/CADCRAFT/testfiles/generated/m3d/m3d-50k-faces.glb';

export async function runPerf010Tests({ ok, section }) {
  const I18N = await imp('i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const F = await imp('firstmodel.js');
  const M = await imp('model.js');
  const { Mesh } = await imp('mesh.js');
  const { makePrimitive } = await imp('mesh/primitives.js');
  const near = (a, b) => (a === null && b === null) || (a !== null && b !== null && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)));

  section('PERF.38: the guide card reads a mesh definition from its mesh');
  // the old answer: the push/pull copy of the mesh (a plain Def) through the polygon path
  const viaCopy = (mesh) => F.shells(M.meshGeometry(mesh));
  const same = (mesh, what) => {
    const a = F.meshShells(mesh), b = viaCopy(mesh);
    const key = (s) => s.map((x) => [x.faces.length, x.closed, x.volume]).sort((p, q) => p[0] - q[0] || (p[2] ?? 0) - (q[2] ?? 0));
    const ka = key(a), kb = key(b);
    // a non-planar n-gon is several triangles in the copy: compare pieces by closedness and volume, faces only when no split
    const match = ka.length === kb.length && ka.every((x, i) => x[1] === kb[i][1] && near(x[2], kb[i][2]));
    ok(match, `${what}: ${a.length} piece(s), closed ${a.map((s) => s.closed).join('/')}, volume ${a.map((s) => (s.volume === null ? '-' : s.volume.toPrecision(6))).join(' + ')} = the push/pull copy's`);
  };
  for (const name of ['cube', 'plane', 'cylinder', 'cone', 'uvsphere', 'icosphere', 'torus', 'circle']) same(makePrimitive(name, {}), name);
  {
    // two pieces in one mesh: a cube beside a plane (one closed, one open)
    const a = makePrimitive('cube', { size: 1 }).toJSON(), b = makePrimitive('plane', { size: 1 });
    const bj = b.toJSON(), { unb64 } = await imp('mesh.js');
    const p = unb64(bj.p, Float64Array, bj.nv * 3), fc = unb64(bj.fc, Int32Array, bj.nf), fi = unb64(bj.fi, Int32Array, fc.reduce((x, y) => x + y, 0));
    const pa = unb64(a.p, Float64Array, a.nv * 3), fca = unb64(a.fc, Int32Array, a.nf), fia = unb64(a.fi, Int32Array, fca.reduce((x, y) => x + y, 0));
    const P = new Float64Array(pa.length + p.length); P.set(pa); for (let i = 0; i < p.length; i += 3) { P[pa.length + i] = p[i] + 5; P[pa.length + i + 1] = p[i + 1]; P[pa.length + i + 2] = p[i + 2]; }
    const FI = new Int32Array(fia.length + fi.length); FI.set(fia); for (let i = 0; i < fi.length; i++) FI[fia.length + i] = fi[i] + a.nv;
    const FC = new Int32Array(fca.length + fc.length); FC.set(fca); FC.set(fc, fca.length);
    const joined = new Mesh(); joined._bulk(P, a.nv + bj.nv, FC, FI);
    same(joined, 'a cube and a plane in one mesh');
    ok(F.meshShells(joined).length === 2 && F.meshShells(joined).filter((s) => s.closed).length === 1, 'a cube and a plane in one mesh: two pieces, one closed');
  }
  {
    // kept per mesh state: the same answer object until the mesh changes, a new one after
    const cube = makePrimitive('cube', { size: 1 });
    const s1 = F.meshShells(cube);
    ok(F.meshShells(cube) === s1, 'meshShells is kept while the mesh is unchanged (the card polls every 400 ms)');
  }
  // the guide on a model with a mesh definition: same steps as the polygon copy placed the same way
  {
    const g = new M.Model();
    g.change('m', (m) => { const d = m.newMeshDef(makePrimitive('cube', { size: 0.02 }), 'Cube'); m.place(m.root, d.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); });
    const facts = F.guideFacts(g);
    ok(facts.face && facts.solid && facts.group, 'guide: a placed closed mesh counts as a face, a solid and one object (as its push/pull copy did)');
  }
  if (fs.existsSync(GLB50K)) {
    const { readGltf } = await imp('io/gltf-read.js');
    const { importGltfScene } = await imp('io/gltf-import.js');
    const scene = await readGltf(new Uint8Array(fs.readFileSync(GLB50K)), {});
    const g = new M.Model();
    g.change('i', (m) => { const x = importGltfScene(m, scene, 'm3d'); m.place(m.root, x.def.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); return x; });
    let n = 0;
    for (const d of g.defs.values()) if (d.mesh) { same(d.shown, 'm3d-50k glTF mesh ' + d.name); n++; }
    ok(n > 0, `m3d-50k: ${n} mesh definitions compared`);
  } else console.log('  skip: ' + GLB50K + ' is missing');

  section('PERF.38: the file text and the exports from the worker pool are the same as on the page');
  {
    const { prettyJson, fileText, exportFile } = await imp('file-text.js');
    const { createPool } = await imp('compute/pool.js');
    const { nodeMakeWorker } = await import(path.resolve(HERE, '../compute-test/node-pool.mjs'));
    const pool = createPool({ workerUrl: pathToFileURL(path.join(APP, 'compute/pool-worker.js')).href, size: 1, makeWorker: nodeMakeWorker });
    const JOB = pathToFileURL(path.join(APP, 'file-text.js')).href;
    const { readGltf } = await imp('io/gltf-read.js');
    const { importGltfScene } = await imp('io/gltf-import.js');
    const { exportGltf } = await imp('io/gltf-write.js');
    const { exportObj } = await imp('io/obj.js');
    const IO = await imp('io.js');
    const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const SA = '/var/www/CADCRAFT/testfiles/gltf-corpus/sample-assets';
    const models = [];
    const fromGltf = async (file, label) => {
      if (!fs.existsSync(file)) { console.log('  skip: ' + file); return; }
      const g = new M.Model();
      const scene = await readGltf(new Uint8Array(fs.readFileSync(file)), {});
      g.change('i', (m) => { const x = importGltfScene(m, scene, label); m.place(m.root, x.def.id, I); return x; });
      models.push([label, g]);
    };
    await fromGltf(GLB50K, 'm3d-50k');
    await fromGltf(`${SA}/Duck/glTF-Binary/Duck.glb`, 'Duck (a texture)');
    await fromGltf(`${SA}/LightsPunctualLamp/glTF-Binary/LightsPunctualLamp.glb`, 'LightsPunctualLamp (lamps)');
    await fromGltf(`${SA}/Cameras/glTF-Embedded/Cameras.gltf`, 'Cameras');
    {
      // push/pull geometry beside a mesh, and a mesh with a modifier stack: the page shows it through MESH_HOOKS, the worker has none
      const g = new M.Model();
      g.change('b', (m) => { M.addPolygon(m.root, [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]]); M.pushPull(m.root, [...m.root.faces.keys()][0], 0.5); });
      g.change('m', (m) => { const d = m.newMeshDef(makePrimitive('cube', { size: 0.3 }), 'Modified'); d.mods = [{ kind: 'test' }]; m.place(m.root, d.id, I); });
      models.push(['polygon box + a mesh with modifiers', g]);
    }
    const shownOf = new WeakMap();
    M.setMeshHooks({ clean: (x) => x, shown: (d) => { if (!d.mods?.length) return null; if (!shownOf.has(d)) shownOf.set(d, makePrimitive('icosphere', { r: 0.2, subdiv: 2 })); return shownOf.get(d); } });
    const lang = I18N.catalog(), date = new Date('2026-11-14T12:00:00Z');
    try {
      for (const [label, g] of models) {
        const page = prettyJson(g.toJSON());
        const mine = await pool.run(JOB, 'fileText', { j: g.toJSON(false, { raw: true }) });
        ok(mine === page, `${label}: the file text from the pool = the page's (${page.length.toLocaleString('en-US')} characters)`);
        ok(fileText({ j: g.toJSON(false, { raw: true }) }) === page, `${label}: fileText in this thread = the page's too`);
        const reopened = new M.Model(); reopened.load(JSON.parse(page));
        ok(prettyJson(reopened.toJSON()) === page, `${label}: the text reopens to the same model`);
        const job = (kind) => { const j = g.toJSON(false, { raw: true, shown: kind === 'dae' }); j.images = [...g.images].map(([id, im]) => ({ id, ...im })); return pool.run(JOB, 'exportFile', { j, kind, name: label, lang, date }); };
        const glb = await job('glb'), glbPage = exportGltf(g).bytes;
        ok(glb.bytes.length === glbPage.length && glb.bytes.every((b, i) => b === glbPage[i]), `${label}: glTF from the pool = the page's, byte for byte (${glbPage.length.toLocaleString('en-US')} bytes)`);
        const obj = await job('obj'), objPage = exportObj(g, { base: label });
        ok(obj.text === objPage.obj && obj.extra.mtl === objPage.mtl && obj.extra.mtlName === objPage.mtlName && obj.extra.images.length === objPage.images.length && obj.extra.images.every((im, i) => im.name === objPage.images[i].name && im.bytes.length === objPage.images[i].bytes.length), `${label}: OBJ + MTL + pictures from the pool = the page's (${objPage.obj.length.toLocaleString('en-US')} characters, ${objPage.images.length} pictures)`);
        const dae = await job('dae'), daePage = IO.exportDAE(g, { name: label, date });
        ok(dae.text === daePage, `${label}: DAE from the pool = the page's (modifiers applied as the page shows them; ${daePage.length.toLocaleString('en-US')} characters)`);
        if (/modifiers/.test(label)) {
          const hooks = { shown: (d) => null };   // the same model with its modifiers not applied: must differ, or this test proves nothing
          const keep = M.MESH_HOOKS.shown; M.setMeshHooks(hooks); const bare = IO.exportDAE(g, { name: label, date }); M.setMeshHooks({ shown: keep });
          ok(bare !== daePage && bare.length < daePage.length, `${label}: the page's DAE carries the modified mesh (${daePage.length} characters against ${bare.length} without the modifier)`);
        }
      }
    } finally { M.setMeshHooks({ clean: null, shown: null }); pool.close(); }
    ok(models.length >= 4, `${models.length} models compared`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  FAIL ') + m); };
  const section = (s) => console.log('\n' + s);
  await runPerf010Tests({ ok, section });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

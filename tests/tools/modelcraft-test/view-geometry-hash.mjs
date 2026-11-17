#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * view-geometry-hash.mjs — what the 3D view builds for mesh definitions (view3d.js meshGeometry), as one SHA-256 per
 * definition over every array it makes (faces: position, normal, colour, index; edges; each textured or material group:
 * position, normal, colour, uv), in /lab/modelcraft. Run before and after a change to view3d.js and diff the two outputs:
 * equal lines = the view draws the same thing (0.10 PERF.7, session `model-part-10`).
 *   node tools/modelcraft-test/view-geometry-hash.mjs > before.txt   …change…   node … > after.txt; diff before.txt after.txt
 * Models: MetalRoughSpheres (image paints with a uv layer), Duck (one texture), m3d-50k (plain colours), a cube painted with
 * a library material and one with an image paint, both without a uv layer (the planar and imageUV paths).
 */
import { execFileSync } from 'node:child_process';
import { launch, BASE } from '../perf/apps3d-lib.mjs';

const SA = '/var/www/CADCRAFT/testfiles/gltf-corpus/sample-assets';
const FILES = [`${SA}/MetalRoughSpheres/glTF-Binary/MetalRoughSpheres.glb`, `${SA}/Duck/glTF-Binary/Duck.glb`, '/var/www/CADCRAFT/testfiles/generated/m3d/m3d-50k-faces.glb'];
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', new URL('../cadcraft-test/admin.php', import.meta.url).pathname, 'session'], { encoding: 'utf8' }));
const browser = await launch();
const hashAll = (page) => page.evaluate(async () => {
  const mc = window.modelcraft, v = mc.view, out = [];
  const sha = async (arrs) => { const parts = arrs.map((a) => new Uint8Array(a.buffer, a.byteOffset, a.byteLength)); const n = parts.reduce((x, p) => x + p.length, 0); const all = new Uint8Array(n); let o = 0; for (const p of parts) { all.set(p, o); o += p.length; } return [...new Uint8Array(await crypto.subtle.digest('SHA-256', all))].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24); };
  const arr = (g, k) => { const a = g.attributes[k]?.array; return a ? (a instanceof Float32Array ? a : Float32Array.from(a)) : new Float32Array(0); };
  for (const d of mc.model.defs.values()) {
    if (!d.mesh) continue;
    const g = v.meshGeometry(d, null);
    const list = [arr(g.faces, 'position'), arr(g.faces, 'normal'), arr(g.faces, 'color'), g.faces.index ? Uint32Array.from(g.faces.index.array) : new Uint32Array(0), arr(g.edges, 'position')];
    for (const m of g.mats) list.push(arr(m.geometry, 'position'), arr(m.geometry, 'normal'), arr(m.geometry, 'color'), arr(m.geometry, 'uv'));
    out.push(`${d.name} faces ${d.mesh.nf} mats ${g.mats.map((m) => m.id.slice(0, 12) + ':' + m.geometry.attributes.position.count).join(',') || '-'} ${await sha(list)}`);
  }
  return out;
});
for (const f of [...FILES, 'cubes']) {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript(() => { window.showOpenFilePicker = undefined; });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/lab/modelcraft`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.modelcraft?.view?.renderer, null, { timeout: 60000 });
  if (f === 'cubes') {
    await page.evaluate(async () => {
      const mc = window.modelcraft, M = mc.model;
      const src = performance.getEntriesByType('resource').map((e) => e.name).find((n) => /\/modelcraft\.js(\?|$)/.test(n)), base = src.replace(/modelcraft\.js.*$/, '');
      const { Mesh } = await import(base + 'mesh.js');
      const { makePrimitive } = await import(base + 'mesh/primitives.js');
      const bare = (size) => { const j = makePrimitive('cube', { size }).toJSON(); delete j.attrs; return Mesh.fromJSON(j); };   // no uv layer
      const img = M.addImage({ name: 'px.png', mime: 'image/png', data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==' });
      M.change('cubes', (m) => {
        const a = m.newMeshDef(bare(1), 'Brick cube'); for (let f = 0; f < a.mesh.nf; f++) a.mesh.fMat[f] = a.mesh.paintIndex('mat:brick-red');
        const b = m.newMeshDef(bare(2), 'Image cube'); for (let f = 0; f < b.mesh.nf; f++) b.mesh.fMat[f] = b.mesh.paintIndex('img:' + img + '|0.5,0,0,0,0,0.5,0,0|');
        m.place(m.root, a.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); m.place(m.root, b.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 3, 0, 0, 1]);
      });
    });
  } else {
    await page.setInputFiles('[data-file-import]', f);
    await page.waitForFunction(() => [...window.modelcraft.model.defs.values()].some((d) => d.mesh), null, { timeout: 120000 });
  }
  await page.waitForTimeout(800);
  for (const line of await hashAll(page)) console.log((f === 'cubes' ? 'cubes' : f.split('/').pop()) + ' | ' + line);
  await ctx.close();
}
await browser.close();

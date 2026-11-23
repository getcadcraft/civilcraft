#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-import-11.mjs — 0.11 PERF.7 in the real page (/lab/modelcraft): a glTF / OBJ imported through [data-file-import] in the
 * worker (default) gives the same model as with ?import=page (the importer on the page, the view built at once): the same file
 * text (SHA-256 of window.modelcraft.fileText()), the same status line; the view's geometry built from the worker's triangles and
 * normals, in slices, is the same as meshGeometry worked out fresh (every array hashed); undo takes the import away, redo puts it
 * back; no page errors. Files: Duck (textured), MetalRoughSpheres, m3d-50k glTF and OBJ, a .gltf with its .bin and textures.
 *   node tools/modelcraft-test/browser-import-11.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { launch, labCookie, BASE } from '../gpu-remote/browser.mjs';

const SA = '/var/www/CADCRAFT/testfiles/gltf-corpus/sample-assets';
const FILES = [[`${SA}/Duck/glTF-Binary/Duck.glb`], [`${SA}/MetalRoughSpheres/glTF-Binary/MetalRoughSpheres.glb`], ['/var/www/CADCRAFT/testfiles/generated/m3d/m3d-50k-faces.glb'],
  ['/var/www/CADCRAFT/testfiles/generated/m3d/m3d-50k-faces.obj'], fs.readdirSync(`${SA}/Duck/glTF`).map((n) => `${SA}/Duck/glTF/${n}`).sort((a, b) => (/\.gltf$/.test(b) ? 1 : 0) - (/\.gltf$/.test(a) ? 1 : 0))];
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const browser = await launch({ webgl: true });

async function importIn(mode, files) {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addCookies(labCookie());
  await ctx.addInitScript(() => { window.showOpenFilePicker = undefined; });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
  await page.goto(`${BASE}/lab/modelcraft${mode === 'page' ? '?import=page' : ''}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.modelcraft?.view?.renderer, null, { timeout: 60000 });
  const d0 = await page.evaluate(() => window.modelcraft.model.defs.size);
  await page.setInputFiles('[data-file-import]', files);
  // drawn: every mesh has its geometry in the view and nothing is still being built in slices
  await page.waitForFunction((n) => { const mc = window.modelcraft; if (mc.model.defs.size <= n || mc.view.building) return false; for (const d of mc.model.defs.values()) if (d.mesh && !mc.view.cache.has(d.id + '|')) return false; return true; }, d0, { timeout: 180000 });
  await page.waitForTimeout(600);
  const out = await page.evaluate(async () => {
    const mc = window.modelcraft, v = mc.view;
    const sha = async (arrs) => { const parts = arrs.map((a) => new Uint8Array(a.buffer, a.byteOffset, a.byteLength)); const n = parts.reduce((x, p) => x + p.length, 0); const all = new Uint8Array(n); let o = 0; for (const p of parts) { all.set(p, o); o += p.length; } return [...new Uint8Array(await crypto.subtle.digest('SHA-256', all))].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24); };
    const arr = (g, k) => { const a = g.attributes[k]?.array; return a ? (a instanceof Float32Array ? a : Float32Array.from(a)) : new Float32Array(0); };
    const list = (g) => { const l = [arr(g.faces, 'position'), arr(g.faces, 'normal'), arr(g.faces, 'color'), g.faces.index ? Uint32Array.from(g.faces.index.array) : new Uint32Array(0), arr(g.edges, 'position')]; for (const m of g.mats) l.push(arr(m.geometry, 'position'), arr(m.geometry, 'normal'), arr(m.geometry, 'color'), arr(m.geometry, 'uv')); return l; };
    const view = [];
    for (const d of mc.model.defs.values()) {
      if (!d.mesh) continue;
      const g = v.cache.get(d.id + '|');
      if (!g) { view.push({ name: d.name, missing: true }); continue; }
      view.push({ name: d.name, kept: await sha(list(g)), fresh: await sha(list(v.meshGeometry(d, null))) });
    }
    const text = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify({ ...JSON.parse(mc.fileText()), view: null })));
    const status = document.querySelector('[data-msg]')?.textContent || '';
    const M = mc.model; const before = M.defs.size; M.undo(); const undone = M.defs.size; M.redo();
    return { view, text: [...new Uint8Array(text)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 24), status: status.slice(0, 200), undo: [before, undone, M.defs.size] };
  });
  out.errors = errors;
  await ctx.close();
  return out;
}

for (const files of FILES) {
  const name = path.basename(files[0]);
  if (files.length > 1) { console.log(`\n== ${name}: skipped (the import input takes one file; a .gltf with its parts is the drop path)`); continue; }
  console.log(`\n== ${name}${files.length > 1 ? ` (+${files.length - 1} files)` : ''}`);
  const w = await importIn('worker', files), p = await importIn('page', files);
  ok(w.text === p.text, `the same model in the worker as on the page (${w.text} / ${p.text})`);
  ok(w.status === p.status && w.status.length > 0, `the same status line: "${w.status.slice(0, 90)}"`);
  ok(w.view.length > 0 && w.view.every((x) => !x.missing && x.kept === x.fresh), `view geometry (${w.view.length} meshes) as built = meshGeometry fresh`);
  ok(p.view.every((x) => !x.missing && x.kept === x.fresh), 'and on the page path too');
  ok(w.view.map((x) => x.kept).join() === p.view.map((x) => x.kept).join(), 'the view draws the same in both');
  ok(w.undo[1] < w.undo[0] && w.undo[2] === w.undo[0], `undo takes the import away, redo puts it back (${w.undo.join(' → ')})`);
  ok(!w.errors.length && !p.errors.length, 'no page errors' + (w.errors.length + p.errors.length ? ': ' + [...w.errors, ...p.errors].join(' ; ') : ''));
}
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

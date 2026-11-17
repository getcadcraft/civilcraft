#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-perf-010.mjs — 0.10 PERF.39 / PERF.40 (session `model-part-10`), the parts that need no browser:
 *   - the rebuild a worker sends back (mesh-kernel-worker.js meshRegen, its result through structured clone, as postMessage
 *     carries it) is the page's own regenerate(): same statuses, triangles, volume, named faces and edges, mesh bytes
 *     (features-750 cut to 200, plate-20, the sample bracket)
 *   - progress: regenerate's progress callback rises from 0 towards 1 and never passes it
 *   - PERF.40: placeAll gives the same world matrices with the id map whatever the instance order (5000 lattice); a file over
 *     the 50,000 cap is refused with its count (it used to say it had no instance list)
 * No timing is asserted (rule 14); the numbers are in tools/partcraft-test/perf-010.mjs and bench-placeall-010.mjs.
 *   node tools/partcraft-test/test-perf-010.mjs        (or runPerf010Tests({ ok, section }) from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev');
const GEN = '/var/www/CADCRAFT/testfiles/generated/partcraft';
const imp = (rel) => import(pathToFileURL(path.join(DEV, rel)));

export async function runPerf010Tests({ ok, section }) {
  const I18N = await imp('i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(DEV, 'lang/en.json'), 'utf8')) });
  const P = await imp('part.js');
  const K = await imp('kernel.js');
  const W = await imp('mesh-kernel-worker.js');
  const manifoldUrl = pathToFileURL(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js')).href;
  const { default: Module } = await import(manifoldUrl);
  const M = await Module(); M.setup();

  section('PERF.39: the worker\'s rebuild is the page\'s rebuild');
  const parts = [];
  const f750 = path.join(GEN, 'features-750.partcraft.json');
  if (fs.existsSync(f750)) { const j = JSON.parse(fs.readFileSync(f750, 'utf8')); parts.push(['features-750 cut to 200', JSON.stringify({ ...j, features: j.features.slice(0, 200) })]); }
  const p20 = path.join(GEN, 'plate-20.partcraft.json');
  if (fs.existsSync(p20)) parts.push(['plate-20 (400 holes)', fs.readFileSync(p20, 'utf8')]);
  const bracket = path.join(DEV, 'samples/sample-bracket.partcraft.json');
  if (fs.existsSync(bracket)) parts.push(['the sample bracket', fs.readFileSync(bracket, 'utf8')]);
  const sameArr = (a, b) => (!a && !b) || (a && b && a.length === b.length && a.every((x, i) => x === b[i]));
  for (const [label, text] of parts) {
    const page = P.readPart(text), work = P.readPart(text);
    K.clearCheckpoints();
    const a = K.regenerate(page, M);
    K.clearCheckpoints();
    const seen = [];
    const ctx = { progress: (f) => seen.push(f), transfer() {} };
    const b = structuredClone(await W.meshRegen({ part: structuredClone(work), manifoldUrl }, ctx));   // what postMessage hands the page
    const st = (r) => [...r.results].map(([id, x]) => id + ':' + x.status + (x.message ? '=' + x.message : '')).join('|');
    ok(st(a) === st(b), `${label}: every feature's status and message the same (${a.results.size} features)`);
    ok(a.stats?.tris === b.stats?.tris && Math.abs(a.stats.volume - b.stats.volume) <= 1e-9 * Math.abs(a.stats.volume) && a.stats.faces === b.stats.faces && a.stats.edges === b.stats.edges, `${label}: ${a.stats?.tris} triangles, volume ${a.stats?.volume.toPrecision(8)}, ${a.stats?.faces} named faces, ${a.stats?.edges} edges in both`);
    ok(['positions', 'indices', 'triFeature', 'triFace'].every((k) => sameArr(a.mesh[k], b.mesh[k])) && sameArr(a.mesh.featIds, b.mesh.featIds), `${label}: the mesh the view draws is the same, value for value`);
    ok(b.results instanceof Map && b.candidates instanceof Map && b.frames instanceof Map && JSON.stringify([...a.candidates]) === JSON.stringify([...b.candidates]), `${label}: the result crosses to the page as Maps, sketch candidates unchanged`);
    ok(seen.length === 0 || (seen.every((f, i) => f >= 0 && f <= 1 && (i === 0 || f >= seen[i - 1]))), `${label}: progress rises within 0 to 1 (${seen.length} reports, throttled)`);
  }
  {
    const seen = [];
    const j = JSON.parse(fs.readFileSync(f750, 'utf8'));
    const p = P.readPart(JSON.stringify({ ...j, features: j.features.slice(0, 60) }));
    K.clearCheckpoints();
    K.regenerate(p, M, { checkpoints: false, progress: (f) => seen.push(f) });
    ok(seen.length >= 50 && seen[0] === 0 && seen.every((f, i) => i === 0 || f >= seen[i - 1]) && seen[seen.length - 1] < 1, `regenerate progress: one report per feature built (${seen.length}), from 0, rising, below 1 until done`);
  }
  K.clearCheckpoints();

  section('PERF.40: placing an assembly by the id map');
  {
    const A = await imp('assembly.js');
    const G = await import(path.join(HERE, 'gen-assembly-large.mjs'));
    const file = G.FILES[5000];
    if (!fs.existsSync(file)) { console.log('  skip: no 5000 lattice'); return; }
    const asm = A.readAssembly(fs.readFileSync(file, 'utf8'));
    const B = new Map(Object.keys(asm.parts).map((p) => [p, { results: new Map(), candidates: [] }]));
    const r1 = A.placeAll(asm, B, { solve: false });
    // shuffle the instance list after the grounded one: a search finds the same instances, a stale map would not
    const head = asm.instances[0], rest = asm.instances.slice(1).reverse();
    asm.instances.length = 0; asm.instances.push(head, ...rest);
    const r2 = A.placeAll(asm, B, { solve: false });
    let worst = 0;
    for (const [id, m] of r1.world) { const w = r2.world.get(id); for (let k = 0; k < 16; k++) worst = Math.max(worst, Math.abs(m[k] - w[k])); }
    ok(r1.world.size === 5000 && r2.world.size === 5000 && worst === 0 && r2.problems.length === 0, `5000 instances: the same matrices after the list is reordered (largest difference ${worst})`);
    // over the cap: the message says so (it said "The assembly has no instance list.")
    const big = path.join(GEN, 'assembly-200000.partcraft-asm.json');
    if (fs.existsSync(big)) {
      let msg = '';
      try { A.readAssembly(fs.readFileSync(big, 'utf8')); } catch (e) { msg = e.message; }
      ok(msg === 'The assembly has 200,000 parts placed; PartCraft opens up to 50,000.', `200,000 instances: "${msg}"`);
    }
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

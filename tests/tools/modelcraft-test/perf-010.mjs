#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools/modelcraft-test/perf-010.mjs — ModelCraft in /lab (the dev build), the numbers of PERF.7, PERF.38 and PERF.57
 * (0.10 session `model-part-10`), measured the way tools/perf/apps3d-modelcraft.mjs measured /use in wave 3 (same helpers,
 * same software GL), so a before and an after on this machine compare:
 *   - start: navigation → quiet, long tasks during start (the swatches), a CDP profile of the start, 12 s idle after it
 *   - import of each file through [data-file-import]: quiet, blocking, longest task, heap peak / settled, profile
 *   - after the import: move a placement (change + frame), undo (+ frame), exportGLB / OBJ / DAE, the file text,
 *     the longest task while each runs (an export or autosave in a worker shows here as a short task), 12 s idle
 *   nice -n 10 node tools/modelcraft-test/perf-010.mjs [--area lab|use] [--label before] [--files a,b] [--no-export] [--no-start]
 * Files by key: spheres (MetalRoughSpheres.glb, 10.7 MB: PERF.7), 50k, 500k (glb), 500kobj. RESULT lines are JSON;
 * --label writes them to docs/results/0.10/model-part-10-<label>.jsonl as well.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { launch, waitQuiet, longTasks, ltCount, heap, rendererRss, profile, timeIn, requestTracker, mb, ms, loadavg, fmtTop, BASE } from '../perf/apps3d-lib.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const AREA = arg('--area', 'lab'), LABEL = arg('--label', null), doExport = !process.argv.includes('--no-export'), doStart = !process.argv.includes('--no-start');
const T = '/var/www/CADCRAFT/testfiles';
const ALL = {
  spheres: `${T}/gltf-corpus/sample-assets/MetalRoughSpheres/glTF-Binary/MetalRoughSpheres.glb`,
  '50k': `${T}/generated/m3d/m3d-50k-faces.glb`,
  '500k': `${T}/generated/m3d/m3d-500k-faces.glb`,
  '500kobj': `${T}/generated/m3d/m3d-500k-faces.obj`,
};
const keys = (arg('--files', 'spheres,50k,500k,500kobj')).split(',').filter((k) => ALL[k] && fs.existsSync(ALL[k]));
const OUT = LABEL ? path.join(new URL('../../docs/results/0.10/', import.meta.url).pathname, `model-part-10-${LABEL}.jsonl`) : null;
const emit = (R) => { R.load = loadavg(); R.area = AREA; R.at = new Date().toISOString(); console.log('RESULT ' + JSON.stringify(R)); if (OUT) fs.appendFileSync(OUT, JSON.stringify(R) + '\n'); };
const admin = AREA === 'lab' ? JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', new URL('../cadcraft-test/admin.php', import.meta.url).pathname, 'session'], { encoding: 'utf8' })) : null;

const browser = await launch();
async function open({ prof = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, acceptDownloads: true });
  if (admin) await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript(() => {
    window.__lt = [];
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch { /* no longtask API */ }
    window.showOpenFilePicker = undefined;
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)); });
  const t0 = Date.now();
  const go = async () => {
    await page.goto(`${BASE}/${AREA}/modelcraft`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForFunction(() => window.modelcraft?.view?.renderer, null, { timeout: 60000 });
    return waitQuiet(page, { t0, timeout: 60000, settle: 2000 });
  };
  const pr = prof ? await profile(page, go) : { result: await go() };
  return { ctx, page, errors, start: { quiet: pr.result.quiet, prof: prof ? pr : null } };
}

console.log(`ModelCraft /${AREA}, Chromium software GL, load ${loadavg()}`);

if (doStart) {
  const { ctx, page, errors, start } = await open({ prof: true });
  const lt = await longTasks(page, 0);
  const n0 = await ltCount(page);
  await page.waitForTimeout(12000);
  const idle = await longTasks(page, n0);
  const R = { kind: 'start', quiet_ms: start.quiet, block_ms: lt.block, longest_ms: lt.longest, tasks: lt.tasks, idle, heap: await heap(page), profile: start.prof.top.slice(0, 14), swatch: start.prof.top.filter((r) => /swatch|material|procedural|texture/i.test(r.fn + r.at)).slice(0, 6), errors: errors.slice(0, 3) };
  console.log(`start: quiet ${ms(R.quiet_ms)} | blocking ${ms(lt.block)} in ${lt.tasks} long tasks, longest ${ms(lt.longest)} | idle 12 s: ${idle.tasks} tasks, ${idle.block} ms (longest ${idle.longest})`);
  console.log(`profile of the start:\n    ${fmtTop(start.prof, 14)}`);
  emit(R);
  await ctx.close();
}

for (const key of keys) {
  const file = ALL[key];
  const size = fs.statSync(file).size;
  console.log(`\n== ${path.basename(file)} ${(size / 1048576).toFixed(1)} MB`);
  const { ctx, page, errors } = await open();
  const R = { kind: 'import', key, file: path.basename(file), mb: +(size / 1048576).toFixed(1) };
  try {
    const req = requestTracker(page);
    const heap0 = await heap(page), lt0 = await ltCount(page);
    const defs0 = await page.evaluate(() => window.modelcraft.model.defs.size);
    req.reset();
    const t0 = Date.now();
    const pr = await profile(page, async () => {
      await page.setInputFiles('[data-file-import]', file);
      return waitQuiet(page, { t0, timeout: 600000, requests: req, heap0, settle: 2000 });
    });
    const q = pr.result;
    const lt = await longTasks(page, lt0);
    const scene = await page.evaluate((d0) => {
      const M = window.modelcraft.model; let faces = 0;
      for (const d of M.defs.values()) faces += d.mesh ? (d.mesh.nf || 0) : d.faces.size;
      return { defs: M.defs.size - d0, faces };
    }, defs0);
    Object.assign(R, { import_ms: q.quiet, timed_out: q.timedOut, block_ms: lt.block, longest_ms: lt.longest, tasks: lt.tasks, heap0, heap_peak: q.peak, heap_settled: await heap(page), rss_mb: await rendererRss(browser), scene, gc_ms: pr.gc, profile: pr.top.slice(0, 12) });
    console.log(`import: ${q.timedOut ? 'TIMED OUT ' : ''}${ms(q.quiet)} | blocking ${ms(lt.block)} in ${lt.tasks} long tasks, longest ${ms(lt.longest)} | heap ${mb(heap0)} → peak ${mb(q.peak)} → ${mb(R.heap_settled)} | RSS ${R.rss_mb} MB | +${scene.defs} defs, ${scene.faces} faces`);
    console.log(`profile (${ms(pr.total)} sampled, GC ${ms(pr.gc)}):\n    ${fmtTop(pr, 12)}`);
    if (!scene.defs) throw new Error('nothing imported');

    // move the imported placement 1 m, then undo: the time inside change()/undo() and to the next frame, and the longest
    // task until things are quiet again (work moved off the thread shows as short tasks)
    const step = async (fn) => { const n = await ltCount(page); const v = await timeIn(page, fn); await page.waitForTimeout(1500); return { ...v.value, ...(await longTasks(page, n)) }; };
    R.move = await step(async () => {
      const M = window.modelcraft.model; const [iid] = [...M.root.insts].pop();
      const t0 = performance.now();
      M.change('Move (perf)', (m) => { const i = m.root.insts.get(iid); const n = i.m.slice(); n[12] += 1; i.m = n; });
      const t1 = performance.now();
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return { change: Math.round(t1 - t0), toFrame: Math.round(performance.now() - t1) };
    });
    R.undo = await step(async () => {
      const M = window.modelcraft.model; const t0 = performance.now(); M.undo(); const t1 = performance.now();
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return { undo: Math.round(t1 - t0), toFrame: Math.round(performance.now() - t1) };
    });
    console.log(`move: change() ${R.move.change} ms + ${R.move.toFrame} ms to the frame (longest task ${R.move.longest}) | undo: ${R.undo.undo} ms + ${R.undo.toFrame} ms (longest ${R.undo.longest})`);

    if (doExport) {
      // `page`: the app's own writers on the page thread (io/gltf-write.js exportGltf, io/obj.js exportObj, io.js exportDAE, the
      // file text: what the Export menu, Save and autosave ran before 0.10); `worker`: the same through window.modelcraft.exportAsync /
      // fileTextAsync (the worker pool, 0.10 PERF.38) when the build has them. Each with the longest task while it ran.
      R.export = { page: {}, worker: {} };
      for (const mode of ['page', 'worker']) for (const k of ['glb', 'obj', 'dae', 'file']) {
        const has = await page.evaluate(() => !!window.modelcraft.exportAsync);
        if (mode === 'worker' && !has) continue;
        const n = await ltCount(page);
        const v = await timeIn(page, async ([kind, mode]) => {
          const mc = window.modelcraft, M = mc.model;
          const src = performance.getEntriesByType('resource').map((e) => e.name).find((n) => /\/modelcraft\.js(\?|$)/.test(n));
          const base = src.replace(/modelcraft\.js.*$/, '');
          const t0 = performance.now();
          let r;
          if (mode === 'worker') r = kind === 'file' ? await mc.fileTextAsync() : await mc.exportAsync(kind);
          else if (kind === 'file') r = mc.fileText();
          else if (kind === 'glb') r = (await import(base + 'io/gltf-write.js')).exportGltf(M).bytes;
          else if (kind === 'obj') r = (await import(base + 'io/obj.js')).exportObj(M, { base: 'perf' }).obj;
          else r = (await import(base + 'io.js')).exportDAE(M, { name: 'perf' });
          const b = r?.byteLength ?? (typeof r === 'string' ? r.length : 0);
          return { ms: Math.round(performance.now() - t0), bytes: b };
        }, [k, mode]);
        await page.waitForTimeout(800);
        R.export[mode][k] = { ...v.value, ...(await longTasks(page, n)) };
      }
      for (const mode of ['page', 'worker']) if (Object.keys(R.export[mode]).length) console.log(`export (${mode}): ` + Object.entries(R.export[mode]).map(([k, v]) => `${k} ${ms(v.ms)} → ${mb(v.bytes)} (longest task ${v.longest})`).join(' | '));
    }
    const n0 = await ltCount(page);
    await page.waitForTimeout(12000);
    R.idle = { ...(await longTasks(page, n0)), heap: await heap(page) };
    console.log(`idle 12 s: ${R.idle.tasks} long tasks, ${R.idle.block} ms (longest ${R.idle.longest}), heap ${mb(R.idle.heap)}`);
  } catch (e) { console.log('ERROR ' + e.message.split('\n')[0].slice(0, 200)); R.error = e.message.slice(0, 200); }
  if (errors.length) console.log(`page errors: ${errors.slice(0, 3).join(' ; ')}`);
  R.errors = errors.slice(0, 5);
  emit(R);
  await ctx.close();
}
await browser.close();

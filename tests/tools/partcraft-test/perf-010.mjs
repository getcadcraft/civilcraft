#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools/partcraft-test/perf-010.mjs — PartCraft in /lab (the dev build, mesh kernel), the numbers of PERF.39 (0.10 session
 * `model-part-10`), measured as tools/perf/apps3d-partcraft.mjs measured /use in wave 3 (same helpers, software GL), plus what a
 * rebuild off the page thread changes: the longest task while it runs.
 *   features   features-750.partcraft.json cut to 200 and 750 features: open + rebuild; at 750 an edit of the last extrude,
 *              undo, redo, a thicker first plate (a full rebuild), each with its time to built() and the longest task
 *   plates     plate-20 and plate-40: open + rebuild, longest task
 *   input      at 750: three edits sent 50 ms apart (the newest wins): time to built() and the longest task
 *   nice -n 10 node tools/partcraft-test/perf-010.mjs [--label before] [--part features|plates] [--no-worker]
 *   --no-worker  the page has no Worker, so every rebuild runs on the page thread: what /lab did before PERF.39 (same code path)
 * RESULT lines are JSON; --label also writes them to docs/results/0.10/model-part-10-partcraft-<label>.jsonl.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { launch, longTasks, ltCount, heap, timeIn, mb, ms, loadavg, BASE } from '../perf/apps3d-lib.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const LABEL = arg('--label', null), only = arg('--part', null), NO_WORKER = process.argv.includes('--no-worker');
const GEN = '/var/www/CADCRAFT/testfiles/generated/partcraft';
const F750 = path.join(GEN, 'features-750.partcraft.json');
const OUT = LABEL ? path.join(new URL('../../docs/results/0.10/', import.meta.url).pathname, `model-part-10-partcraft-${LABEL}.jsonl`) : null;
const emit = (R) => { R.worker = !NO_WORKER; R.load = loadavg(); R.at = new Date().toISOString(); console.log('RESULT ' + JSON.stringify(R)); if (OUT) fs.appendFileSync(OUT, JSON.stringify(R) + '\n'); };
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', new URL('../cadcraft-test/admin.php', import.meta.url).pathname, 'session'], { encoding: 'utf8' }));

const browser = await launch();
async function open() {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  if (NO_WORKER) await ctx.addInitScript(() => { window.Worker = undefined; });
  await ctx.addInitScript(() => { window.__lt = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch { /* none */ } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
  await page.goto(`${BASE}/lab/partcraft`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.partcraft?.view?.renderer && window.partcraft.regen, null, { timeout: 90000 });
  await page.evaluate(() => window.partcraft.built());
  await page.waitForTimeout(1500);
  return { ctx, page, errors };
}
const openText = async (page, text, name) => {
  const n = await ltCount(page);
  const r = await timeIn(page, async ([t, nm]) => { const pc = window.partcraft, t0 = performance.now(); await pc.openText(t, nm); await pc.built(); return { ms: Math.round(performance.now() - t0), tris: pc.regen.stats?.tris, bad: [...pc.regen.results.values()].filter((x) => x.status === 'error' || x.status === 'skipped').length, heap: performance.memory?.usedJSHeapSize }; }, [text, name]);
  return { ...r.value, ...(await longTasks(page, n)) };
};
console.log(`PartCraft /lab (mesh kernel), Chromium software GL, load ${loadavg()}`);

if ((!only || only === 'features') && fs.existsSync(F750)) {
  const { ctx, page, errors } = await open();
  const full = JSON.parse(fs.readFileSync(F750, 'utf8'));
  const R = { kind: 'features', rows: [] };
  try {
    for (const n of [200, 750]) {
      const r = await openText(page, JSON.stringify({ ...full, features: full.features.slice(0, n) }), 'cut.partcraft.json');
      R.rows.push({ n, ...r });
      console.log(`  n=${n}: open + rebuild ${ms(r.ms)}, ${r.tris} triangles, ${r.bad} failing | longest task ${ms(r.longest)} (${r.tasks} tasks, ${ms(r.block)}) | heap ${mb(r.heap)}`);
    }
    const step = async (what) => {
      const n = await ltCount(page);
      const v = await timeIn(page, async (w) => {
        const pc = window.partcraft, ex = pc.part.features.filter((f) => f.type === 'extrude'), last = ex[ex.length - 1], first = ex[0];
        const t0 = performance.now();
        if (w === 'edit') pc.commit('Deeper', () => { last.depth += 2; });
        else if (w === 'undo') pc.undoRedo(true);
        else if (w === 'redo') pc.undoRedo(false);
        else if (w === 'plate') pc.commit('Thicker plate', () => { first.depth += 1; });
        else if (w === 'burst') { for (let k = 0; k < 3; k++) { pc.commit('Deeper ' + k, () => { last.depth += 0.5; }); await new Promise((r) => setTimeout(r, 50)); } }
        const tCall = performance.now() - t0;
        await pc.built();
        return { call: Math.round(tCall), ms: Math.round(performance.now() - t0), depth: last.depth, tris: pc.regen.stats?.tris };
      }, what);
      await page.waitForTimeout(600);
      return { ...v.value, ...(await longTasks(page, n)) };
    };
    for (const w of ['edit', 'undo', 'redo', 'plate', 'burst']) {
      R[w] = await step(w);
      console.log(`  ${w}: ${ms(R[w].ms)} to built() (the call itself ${R[w].call} ms) | longest task ${ms(R[w].longest)} (${R[w].tasks} tasks)`);
    }
  } catch (e) { console.log('ERROR ' + e.message.split('\n')[0].slice(0, 200)); R.error = e.message.slice(0, 200); }
  R.errors = errors.slice(0, 5);
  emit(R);
  await ctx.close();
}

if (!only || only === 'plates') {
  for (const n of [20, 40]) {
    const f = path.join(GEN, `plate-${n}.partcraft.json`); if (!fs.existsSync(f)) continue;
    const { ctx, page, errors } = await open();
    const R = { kind: 'plate', file: path.basename(f), holes: n * n };
    try {
      Object.assign(R, await openText(page, fs.readFileSync(f, 'utf8'), 'plate.partcraft.json'));
      console.log(`  plate-${n} (${n * n} holes): open + rebuild ${ms(R.ms)}, ${R.tris} triangles | longest task ${ms(R.longest)} | heap ${mb(R.heap)}`);
    } catch (e) { console.log('ERROR ' + e.message.split('\n')[0].slice(0, 200)); R.error = e.message.slice(0, 200); }
    R.errors = errors.slice(0, 3);
    emit(R);
    await ctx.close();
  }
}
await browser.close();

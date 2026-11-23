#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools/modelcraft-test/perf-11.mjs — ModelCraft's glTF / OBJ import in /lab, the numbers of PERF.7 (0.11 session `perf-finish-11`, lane
 * `model`): the import through [data-file-import] until the page is quiet, every long task it caused (how many pass 200 ms, the longest),
 * the JS heap before / at the peak / settled, a CDP profile of the import, then a move + undo of the imported placement.
 * Runs here (VPS Chromium, SwiftShader) or on workstation11a (Windows Chrome, the real card) through tools/gpu-remote/run.sh:
 *
 *   tools/gpu-remote/run.sh --session pf11-model --lab --with testfiles/generated/model11 -- tools/modelcraft-test/perf-11.mjs [--files spheres,500k,500kobj] [--modes page,worker] [--label x] [--runs 2]
 *
 * Files (testfiles/generated/model11/, links to the registered large files): spheres (MetalRoughSpheres.glb 10.7 MB), 500k (m3d-500k-faces.glb),
 * 500kobj (m3d-500k-faces.obj), 5m (m3d-5m-faces.glb, 114 MB). RESULT lines are JSON; --label also writes them to tmp/perf-11-<label>.jsonl.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, machine, BASE } from '../gpu-remote/browser.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const LABEL = arg('--label', null), RUNS = Number(arg('--runs', 1)), MODES = arg('--modes', 'worker').split(',');   // page = ?import=page (the import as before PERF.7's worker and slices)
const DIR = path.join(REPO, arg('--dir', 'testfiles/generated/model11'));
const ALL = { spheres: 'MetalRoughSpheres.glb', '500k': 'm3d-500k-faces.glb', '500kobj': 'm3d-500k-faces.obj', '5m': 'm3d-5m-faces.glb' };   // 5m: testfiles/generated/model11-big (pass --dir)
const keys = arg('--files', 'spheres,500k,500kobj').split(',').filter((k) => ALL[k] && fs.existsSync(path.join(DIR, ALL[k])));
const OUT = LABEL ? path.join(REPO, 'tmp', `perf-11-${LABEL}.jsonl`) : null;
if (OUT) fs.mkdirSync(path.dirname(OUT), { recursive: true });
const emit = (R) => { R.at = new Date().toISOString(); console.log('RESULT ' + JSON.stringify(R)); if (OUT) fs.appendFileSync(OUT, JSON.stringify(R) + '\n'); };
const mb = (n) => (n / 1048576).toFixed(0) + ' MB';

const browser = await launch({ webgl: true, args: ['--enable-precise-memory-info', '--js-flags=--max-old-space-size=8000'] });
let machineLine = '';

async function open(mode) {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addCookies(labCookie());
  await ctx.addInitScript(() => {
    window.__lt = [];
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch { /* no longtask API */ }
    window.showOpenFilePicker = undefined;   // the plain <input type=file> path
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)); });
  try {
    await page.goto(`${BASE}/lab/modelcraft${mode === 'page' ? '?import=page' : ''}`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => window.modelcraft?.view?.renderer, null, { timeout: 120000 });
  } catch (e) { await ctx.close(); throw e; }
  await quiet(page, Date.now(), 2500, 120000);
  if (!machineLine) { machineLine = await machine(page); console.log('machine: ' + machineLine); }
  return { ctx, page, errors };
}

/** Wait until no long task, no heap change over 1.5 MB, for `settle` ms. → { quiet (ms from t0 to the last activity), peak } */
async function quiet(page, t0, settle = 2500, timeout = 600000) {
  let peak = 0, prev = 0, steady = Date.now();
  for (;;) {
    await page.waitForTimeout(250);
    const s = await page.evaluate(() => { const lt = window.__lt; const last = lt.length ? lt[lt.length - 1][0] + lt[lt.length - 1][1] : 0; return { last, now: performance.now(), heap: performance.memory?.usedJSHeapSize || 0 }; });
    peak = Math.max(peak, s.heap);
    if (Math.abs(s.heap - prev) > 1.5 * 1048576) steady = Date.now();
    prev = s.heap;
    if (Date.now() - t0 > 3000 && s.now - s.last > settle && Date.now() - steady > settle) return { quiet: Date.now() - t0 - settle, peak };
    if (Date.now() - t0 > timeout) return { quiet: Date.now() - t0, peak, timedOut: true };
  }
}

async function profile(page, fn) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 1000 });
  await cdp.send('Profiler.start');
  const out = await fn();
  const { profile: p } = await cdp.send('Profiler.stop');
  await cdp.detach().catch(() => {});
  const byId = new Map(p.nodes.map((n) => [n.id, n]));
  const self = new Map();
  for (let i = 0; i < p.samples.length; i++) {
    const cf = byId.get(p.samples[i]).callFrame, dt = (p.timeDeltas[i] || 0) / 1000;
    const key = `${cf.functionName || '(anonymous)'} ${(cf.url.replace(/^.*\/assets\//, '').replace(/\?.*$/, '') || '(native)')}${cf.url ? ':' + (cf.lineNumber + 1) : ''}`;
    self.set(key, (self.get(key) || 0) + dt);
  }
  // busy stretches (no idle sample in between): what each long one spent its time in
  const runs = [];
  let cur = null;
  for (let i = 0; i < p.samples.length; i++) {
    const cf = byId.get(p.samples[i]).callFrame, dt = (p.timeDeltas[i] || 0) / 1000;
    if (cf.functionName === '(idle)') { if (cur) runs.push(cur); cur = null; continue; }
    if (!cur) cur = { ms: 0, self: new Map() };
    cur.ms += dt;
    const k = `${cf.functionName || '(anon)'} ${(cf.url.replace(/^.*\/(dev|vendor)\//, '').replace(/\?.*$/, '') || 'native')}${cf.url ? ':' + (cf.lineNumber + 1) : ''}`;
    cur.self.set(k, (cur.self.get(k) || 0) + dt);
  }
  if (cur) runs.push(cur);
  const stretches = runs.filter((r) => r.ms > 120).map((r) => `${Math.round(r.ms)} ms: ` + [...r.self].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k} ${Math.round(v)}`).join(' · '));
  const top = [...self].filter(([k]) => !/^\((idle|program|root)\)/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => `${Math.round(v)} ms ${k}`);
  return { top, stretches, result: out };
}

// --start N: N cold loads of /lab/modelcraft: long tasks until quiet, then 12 s of idle (PERF.57: ModelCraft's start-up and idle tasks)
for (let n = 1; n <= Number(arg('--start', 0)); n++) {
  const t0 = Date.now();
  let o = null;
  try { o = await open('worker'); } catch (e) { console.log('start ' + n + ': did not open'); continue; }
  const { ctx, page } = o;
  const start = await page.evaluate(() => window.__lt.map(([, d]) => Math.round(d)));
  const n0 = start.length;
  await page.waitForTimeout(12000);
  const idle = await page.evaluate((k) => window.__lt.slice(k).map(([, d]) => Math.round(d)), n0);
  const R = { kind: 'start', n, open_ms: Date.now() - t0 - 12000, tasks: start.length, block_ms: start.reduce((a, b) => a + b, 0), longest_ms: Math.max(0, ...start), start, idle, idle_ms: idle.reduce((a, b) => a + b, 0), machine: machineLine };
  console.log(`start ${n}: ${R.tasks} long tasks, ${R.block_ms} ms blocked, longest ${R.longest_ms} [${start.join(', ')}] | idle 12 s: ${idle.length} tasks, ${R.idle_ms} ms [${idle.join(', ')}]`);
  emit(R);
  await ctx.close();
}

for (let run = 1; run <= RUNS; run++) for (const key of keys) for (const mode of MODES) {
  const file = path.join(DIR, ALL[key]);
  const size = fs.statSync(file).size;
  console.log(`\n== ${ALL[key]} ${(size / 1048576).toFixed(1)} MB (run ${run}, ${mode})`);
  let opened = null;
  for (let tries = 0; tries < 3 && !opened; tries++) { try { opened = await open(mode); } catch (e) { console.log('page did not open (' + String(e.message).split('\n')[0].slice(0, 80) + '), again'); } }
  if (!opened) { emit({ kind: 'import', key, mode, run, error: 'page did not open' }); continue; }
  const { ctx, page, errors } = opened;
  const R = { kind: 'import', key, mode, run, file: ALL[key], mb: +(size / 1048576).toFixed(1), machine: machineLine };
  try {
    const n0 = await page.evaluate(() => window.__lt.length), heap0 = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);
    const defs0 = await page.evaluate(() => window.modelcraft.model.defs.size);
    const t0 = Date.now();
    const pr = await profile(page, async () => { await page.setInputFiles('[data-file-import]', file); return quiet(page, t0); });
    const lt = await page.evaluate((n) => window.__lt.slice(n).map(([s, d]) => Math.round(d)), n0);
    const scene = await page.evaluate((d0) => { const M = window.modelcraft.model; let faces = 0; for (const d of M.defs.values()) faces += d.mesh ? d.mesh.faceCount : d.faces.size; return { defs: M.defs.size - d0, faces, status: document.querySelector('[data-status], .status, #status')?.textContent?.slice(0, 160) || '' }; }, defs0);
    Object.assign(R, { import_ms: pr.result.quiet, timed_out: !!pr.result.timedOut, tasks: lt.length, over200: lt.filter((d) => d > 200).length, block_ms: lt.reduce((a, b) => a + b, 0), longest_ms: Math.max(0, ...lt), long_tasks: lt, heap0, heap_peak: pr.result.peak, heap_settled: await page.evaluate(() => performance.memory?.usedJSHeapSize || 0), scene, profile: pr.top });
    console.log(`import: ${R.timed_out ? 'TIMED OUT ' : ''}${R.import_ms} ms | ${lt.length} long tasks (${R.over200} over 200 ms), ${R.block_ms} ms blocked, longest ${R.longest_ms} ms [${lt.join(', ')}] | heap ${mb(heap0)} → peak ${mb(R.heap_peak)} → ${mb(R.heap_settled)} | +${scene.defs} defs, ${scene.faces} faces`);
    console.log('profile:\n    ' + pr.top.join('\n    '));
    console.log('busy stretches over 120 ms:\n    ' + pr.stretches.join('\n    '));
    R.stretches = pr.stretches;
    if (!scene.defs) throw new Error('nothing imported: ' + scene.status);
    const step = async (fn) => { const n = await page.evaluate(() => window.__lt.length); const v = await page.evaluate(fn); await page.waitForTimeout(1500); const l = await page.evaluate((k) => window.__lt.slice(k).map(([, d]) => Math.round(d)), n); return { ...v, longest: Math.max(0, ...l) }; };
    R.move = await step(async () => {
      const M = window.modelcraft.model; const [iid] = [...M.root.insts].pop(); const t = performance.now();
      M.change('Move (perf)', (m) => { const i = m.root.insts.get(iid); const n = i.m.slice(); n[12] += 1; i.m = n; });
      const a = performance.now(); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return { change: Math.round(a - t), toFrame: Math.round(performance.now() - a) };
    });
    R.undo = await step(async () => { const M = window.modelcraft.model; const t = performance.now(); M.undo(); const a = performance.now(); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return { undo: Math.round(a - t), toFrame: Math.round(performance.now() - a) }; });
    console.log(`move: ${R.move.change} + ${R.move.toFrame} ms (longest ${R.move.longest}) | undo: ${R.undo.undo} + ${R.undo.toFrame} ms (longest ${R.undo.longest})`);
    const n1 = await page.evaluate(() => window.__lt.length);
    await page.waitForTimeout(8000);
    R.idle = await page.evaluate((k) => window.__lt.slice(k).map(([, d]) => Math.round(d)), n1);
    console.log(`idle 8 s after: long tasks [${R.idle.join(', ')}]`);
  } catch (e) { console.log('ERROR ' + String(e.message).split('\n')[0].slice(0, 200)); R.error = String(e.message).slice(0, 200); }
  if (errors.length) console.log('page errors: ' + errors.slice(0, 3).join(' ; '));
  R.errors = errors.slice(0, 5);
  emit(R);
  await ctx.close();
}
await browser.close();

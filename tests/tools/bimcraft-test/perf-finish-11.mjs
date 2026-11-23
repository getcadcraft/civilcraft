#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * perf-finish-11.mjs — BimCraft /lab opening big IFC files, for PERF.8 / 23 / 37 (session perf-finish-11, lane bim). Runs here (SwiftShader, VPS)
 * or on workstation11a through tools/gpu-remote/run.sh --lab (Windows Chrome, the real GPU; the files are kept there once in
 * C:\Users\Public\cc-large\ifc, testfiles/LARGE-FILES.md).
 *
 *   tools/gpu-remote/run.sh --session perf-finish-bim --lab -- tools/bimcraft-test/perf-finish-11.mjs [--files water,120,210] [--mode worker|page|both] [--reps 1]
 *
 * Per file and mode, one fresh browser (so the renderer's peak memory is that open's):
 *   open        first geometry on screen, "Opened", quiet; main-thread blocking (long tasks: count, sum, longest); JS heap peak / settled (page only);
 *               renderer process peak working set (Windows: the page + its workers; 0 here)
 *   same        a digest of every batch (positions, normals, indices, triIds, element runs) and of IfcFile.save() with a fixed time stamp:
 *               the worker and the page path must give the same model, before and after a change must give the same bytes
 *   click       10 s after the open, a click at the centre (pick + properties panel), 3 s after: blocking
 *   section     viewer.setSection at half height, then moved to a quarter (stencil caps rebuilt): ms each
 *   pick        viewer.hitAt at 5 points: ms each
 *   save        IfcFile.save() of the open model: ms
 * `--mode page` sets window.ccIfcGeoWorker = false before the page runs (the geometry on the page thread, as before PERF.8's worker).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, machine, remote, BASE } from '../gpu-remote/browser.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const only = arg('--files', 'water,120,210').split(',');
const modeArg = arg('--mode', 'both');
const MODES = modeArg === 'both' ? ['page', 'worker'] : [modeArg];
const REPS = Number(arg('--reps', 1));
const PROFILE = process.argv.includes('--profile');
/** CDP sampling profile around fn: the top self-time functions (name file:line ms). */
async function profiled(page, fn) {
  if (!PROFILE) return { result: await fn(), top: null };
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 1000 }); await cdp.send('Profiler.start');
  const result = await fn();
  const { profile } = await cdp.send('Profiler.stop');
  const self = new Map(), nodes = new Map(profile.nodes.map((x) => [x.id, x]));
  for (let k = 0; k < profile.samples.length; k++) { const n = nodes.get(profile.samples[k]); const cf = n.callFrame; if (cf.functionName === '(idle)' || cf.functionName === '(program)') continue; const key = (cf.functionName || '(anon)') + ' ' + cf.url.split('/').slice(-2).join('/') + ':' + (cf.lineNumber + 1); self.set(key, (self.get(key) || 0) + (profile.timeDeltas[k] || 0) / 1000); }
  const top = [...self].sort((a, b) => b[1] - a[1]).slice(0, 18).map(([k, v]) => Math.round(v) + ' ms ' + k);
  // by caller: each sample goes to the nearest frame of the app's own code (bimcraft/dev, not dev/ifc/, not three.js), with that frame's caller
  const parent = new Map(); for (const n of profile.nodes) for (const c of n.children || []) parent.set(c, n.id);
  const own = (cf) => /\/apps\/bimcraft\/dev\//.test(cf.url) && !/\/dev\/ifc\//.test(cf.url);
  const by = new Map();
  for (let k = 0; k < profile.samples.length; k++) {
    let id = profile.samples[k], n = nodes.get(id); const cf0 = n.callFrame;
    if (cf0.functionName === '(idle)' || cf0.functionName === '(program)' || cf0.functionName === '(garbage collector)') continue;
    // the chain of app frames from the outside in: the second one from the outside names the job (the first is the event handler)
    const chain = [];
    while (n) { if (own(n.callFrame)) chain.push(n.callFrame); id = parent.get(id); n = id ? nodes.get(id) : null; }
    chain.reverse();
    const nm = (cf) => (cf.functionName || '(anon)') + ' ' + cf.url.split('/').pop().split('?')[0] + ':' + (cf.lineNumber + 1);
    const key = chain.length ? chain.slice(0, 5).map(nm).join(' > ') : '(no app frame)';
    by.set(key, (by.get(key) || 0) + (profile.timeDeltas[k] || 0) / 1000);
  }
  top.push('-- by app caller:', ...[...by].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => Math.round(v) + ' ms ' + k));
  await cdp.detach().catch(() => {});
  return { result, top };
}
const DIR = remote ? 'C:\\Users\\Public\\cc-large\\ifc\\' : '';
const FILES = {
  water: remote ? DIR + 'bimcraft-water-treatment.ifc' : path.join(REPO, 'fixtures/showcase/bimcraft-water-treatment.ifc'),
  120: remote ? DIR + 'cc-ifc-big-120.ifc' : '/var/www/CADCRAFT/testfiles/generated/ifc/cc-ifc-big-120.ifc',
  210: remote ? DIR + 'cc-ifc-big-210.ifc' : '/var/www/CADCRAFT/testfiles/generated/ifc/cc-ifc-big-210.ifc',
};
const OUT = path.join(REPO, 'tmp', 'perf-finish-11-bim.jsonl');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const ms = (n) => (n == null ? '-' : n >= 10000 ? (n / 1000).toFixed(1) + ' s' : Math.round(n) + ' ms');
const mb = (n) => (n / 1048576).toFixed(0) + ' MB';

/** Peak working set (MB) of the Playwright Chrome renderer processes (Windows only). */
function rendererPeak() {
  if (!remote) return 0;
  try {
    const ps = 'Get-CimInstance Win32_Process -Filter "Name=\'chrome.exe\'" | ? { $_.CommandLine -like \'*playwright_chrom*\' -and $_.CommandLine -like \'*--type=renderer*\' } | % { $_.PeakWorkingSetSize }';
    const out = execFileSync('powershell.exe', ['-NoProfile', '-Command', ps], { encoding: 'utf8' });
    return Math.round(Math.max(0, ...out.split(/\s+/).filter(Boolean).map(Number)) / 1024);   // PeakWorkingSetSize is in KB
  } catch { return -1; }
}

const INIT = (mode) => `
  window.__lt = [];
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch (e) {}
  window.showOpenFilePicker = undefined;
  ${mode === 'page' ? 'window.ccIfcGeoWorker = false;' : ''}
  window.__geo = 0;
  const look = () => { const v = document.querySelector('[data-canvas]')?.viewer; if (v && window.__t0 && !window.__geo && ((v.meshes?.length || 0) + (v.previewCount || 0)) > 0) window.__geo = performance.now(); requestAnimationFrame(look); };
  requestAnimationFrame(look);
`;

async function digest(page) {
  return page.evaluate(async () => {
    const v = document.querySelector('[data-canvas]').viewer, L = [...v.layers.values()][0], m = L.model;
    const h = async (a) => { const d = await crypto.subtle.digest('SHA-256', a); return [...new Uint8Array(d)].slice(0, 8).map((x) => x.toString(16).padStart(2, '0')).join(''); };
    const parts = [];
    for (const b of m.batches) {
      parts.push(b.storey + '|' + b.space + '|' + b.color.join(','));
      for (const a of [b.positions, b.normals, b.indices, b.triIds, b.elems.ids, b.elems.t0, b.elems.tn, b.elems.v0, b.elems.vn]) parts.push(await h(a));
    }
    const geo = await h(new TextEncoder().encode(parts.join(';')));
    const ed = window.bimcraftLive.editor, f = ed.api.file(ed.mid);
    const t0 = performance.now(); const bytes = f.save({ timeStamp: '2026-01-01T00:00:00' }); const saveMs = performance.now() - t0;
    return { geo, batches: m.batches.length, elements: m.elements, spaces: m.spaces, triangles: m.triangles, save: await h(bytes), saveBytes: bytes.length, saveMs: Math.round(saveMs) };
  });
}

const lines = [];
const say = (s) => { console.log(s); lines.push(s); };
for (const key of only) {
  const file = FILES[key] || (/\.ifc$/i.test(key) ? key : null);
  if (!file) continue;
  for (let rep = 0; rep < REPS; rep++) for (const mode of MODES) {
    const browser = await launch({ webgl: true });
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
    await ctx.addCookies(labCookie());
    await ctx.addInitScript(INIT(mode));
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
    const R = { file: key, mode, rep };
    try {
      console.log(`${new Date().toISOString()} ${key} ${mode}: loading the page`);
      await page.goto(`${BASE}/lab/bimcraft`, { waitUntil: 'load', timeout: 180000 });
      await page.waitForSelector('[data-file]', { state: 'attached', timeout: 120000 }).catch(async (e) => { throw new Error('no file input on ' + page.url() + ' ("' + (await page.title().catch(() => '')) + '"): ' + e.message.split('\n')[0]); });
      await page.waitForTimeout(2500);
      if (!lines.length) say('machine: ' + await machine(page));
      const status = () => page.evaluate(() => [...document.querySelectorAll('[data-status], [role="status"]')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' | '));
      const n0 = await page.evaluate(() => window.__lt.length);
      const heap0 = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);
      await page.evaluate(() => { window.__t0 = performance.now(); });
      const tStart = Date.now();
      let peak = heap0, opened = null, prevHeap = heap0, steady = Date.now();
      const openProf = await profiled(page, async () => { await page.setInputFiles('[data-file]', file); for (;;) {
        await page.waitForTimeout(250);
        const s = await page.evaluate(() => ({ heap: performance.memory?.usedJSHeapSize || 0, now: performance.now(), last: window.__lt.length ? window.__lt[window.__lt.length - 1][0] + window.__lt[window.__lt.length - 1][1] : 0 }));
        peak = Math.max(peak, s.heap);
        if (Math.abs(s.heap - prevHeap) > 2 * 1048576) steady = Date.now();
        prevHeap = s.heap;
        if (opened === null && /Opened .*element/.test(await status())) { opened = Date.now() - tStart; console.log(`   opened at ${ms(opened)}`); }
        // quiet: Opened, then no long task for 2 s and the heap steady for 2 s (or 10 s after Opened, whatever the heap does)
        if (opened !== null && s.now - s.last > 2000 && (Date.now() - steady > 2000 || Date.now() - tStart - opened > 10000)) { R.quiet = Math.max(opened, Math.round(s.last - (await page.evaluate(() => window.__t0)))); break; }
        if (Date.now() - tStart > 600000) { R.timedOut = true; console.log('   timed out; status: ' + (await status()).slice(0, 120)); break; }
      } });
      if (openProf.top) { R.openTop = openProf.top; say('   open profile, self time:\n      ' + openProf.top.join('\n      ')); }
      R.opened = opened;
      Object.assign(R, await page.evaluate((n) => { const lt = window.__lt.slice(n); return { firstGeo: window.__geo ? Math.round(window.__geo - window.__t0) : null, tasks: lt.length, block: Math.round(lt.reduce((a, x) => a + x[1], 0)), longest: Math.round(lt.reduce((a, x) => Math.max(a, x[1]), 0)) }; }, n0));
      R.heapPeak = peak; R.heapSettled = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0);
      R.status = (await status()).slice(0, 140);
      say(`\n== ${key} ${mode}${REPS > 1 ? ' rep ' + rep : ''}: first geometry ${ms(R.firstGeo)} | Opened ${ms(R.opened)} | quiet ${ms(R.quiet)} | blocking ${ms(R.block)} in ${R.tasks} long tasks, longest ${ms(R.longest)} | heap ${mb(heap0)} -> peak ${mb(R.heapPeak)} -> ${mb(R.heapSettled)}`);
      say(`   status "${R.status}"`);
      await page.waitForTimeout(10000);
      const canvas = await page.$('[data-canvas]'); const box = await canvas.boundingBox();
      const n1 = await page.evaluate(() => window.__lt.length);
      const clickProf = await profiled(page, async () => { await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await page.waitForTimeout(3000); });
      if (clickProf.top) { R.clickTop = clickProf.top; say('   click profile, self time:\n      ' + clickProf.top.join('\n      ')); }
      R.click = await page.evaluate((n) => { const lt = window.__lt.slice(n); return { tasks: lt.length, block: Math.round(lt.reduce((a, x) => a + x[1], 0)), longest: Math.round(lt.reduce((a, x) => Math.max(a, x[1]), 0)), sel: document.querySelector('[data-canvas]').viewer.selection.size, rows: document.querySelectorAll('[data-props] *').length }; }, n1);
      R.pick = await page.evaluate((b) => { const v = document.querySelector('[data-canvas]').viewer; return [[0.5, 0.5], [0.4, 0.45], [0.6, 0.55], [0.3, 0.6], [0.7, 0.4]].map(([fx, fy]) => { const t0 = performance.now(); v.hitAt(b.x + b.width * fx, b.y + b.height * fy); return +(performance.now() - t0).toFixed(1); }); }, box);
      R.section = await page.evaluate(() => {
        const v = document.querySelector('[data-canvas]').viewer, B = v.secBox(), H = B.max.y - B.min.y;
        let t0 = performance.now(); v.setSection({ axis: 'top', offset: H / 2 }); v.renderer.render(v.scene, v.camera); const set = performance.now() - t0;
        t0 = performance.now(); v.setSection({ axis: 'top', offset: H / 4 }); v.renderer.render(v.scene, v.camera); const move = performance.now() - t0;
        v.setSection(null);
        return { set: Math.round(set), move: Math.round(move) };
      });
      say(`   click +10 s: blocking ${ms(R.click.block)} in ${R.click.tasks} (longest ${ms(R.click.longest)}), ${R.click.sel} selected, ${R.click.rows} panel nodes | hitAt ${R.pick.join(' / ')} ms | section set ${ms(R.section.set)}, moved ${ms(R.section.move)}`);
      R.same = await digest(page);
      say(`   model ${R.same.elements} elements + ${R.same.spaces} spaces, ${R.same.triangles} triangles, ${R.same.batches} batches, geometry ${R.same.geo} | save ${ms(R.same.saveMs)} ${R.same.saveBytes} bytes ${R.same.save}`);
      R.rendererPeakMB = rendererPeak();
      say(`   renderer peak working set ${R.rendererPeakMB} MB`);
    } catch (e) { R.error = e.message.split('\n')[0].slice(0, 200); say('ERROR ' + R.error); }
    if (errors.length) say('   page errors: ' + errors.slice(0, 3).join(' ; '));
    R.errors = errors.slice(0, 5);
    fs.appendFileSync(OUT, JSON.stringify(R) + '\n');
    await browser.close();
  }
}
fs.writeFileSync(path.join(REPO, 'tmp', 'perf-finish-11-bim.txt'), lines.join('\n') + '\n');

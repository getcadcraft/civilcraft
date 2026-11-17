#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * perf-open-ifc.mjs — BimCraft /lab (dev) opening one IFC, with a CDP profile of the open and the first click, for PERF.8 / 23 / 37 (session bim-core-10).
 * Same measures as tools/perf/open-file.mjs and apps3d-bimcraft.mjs (long tasks, heap, time to quiet) on the lab page.
 *   nice -n 10 node tools/bimcraft-test/perf-open-ifc.mjs [file.ifc] [--click]       run as root; note `uptime` beside every number
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { launch, waitQuiet, longTasks, ltCount, heap, profile, ms, mb, loadavg, fmtTop, BASE } from '../perf/apps3d-lib.mjs';

const file = process.argv.slice(2).find((a) => !a.startsWith('--')) || '/var/www/CADCRAFT/getcadcraft.com/fixtures/showcase/bimcraft-water-treatment.ifc';
const click = process.argv.includes('--click');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', new URL('../cadcraft-test/admin.php', import.meta.url).pathname, 'session', 'bimperf'], { encoding: 'utf8' }));
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
await ctx.addInitScript(() => { window.__lt = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch { /* none */ } window.showOpenFilePicker = undefined; });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
await page.goto(`${BASE}/lab/bimcraft`, { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(1500);
const status = () => page.evaluate(() => [...document.querySelectorAll('[data-status], [role="status"]')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' | '));
console.log(`${file.split('/').pop()} ${(fs.statSync(file).size / 1048576).toFixed(1)} MB, load ${loadavg()}`);
const heap0 = await heap(page), lt0 = await ltCount(page), t0 = Date.now();
const pr = await profile(page, async () => {
  await page.setInputFiles('[data-file]', file);
  return waitQuiet(page, { t0, timeout: 600000, heap0, done: async () => /^Opened/.test(await status()) });
});
const q = pr.result, lt = await longTasks(page, lt0);
console.log(`open: ${ms(q.quiet)} | blocking ${ms(lt.block)} in ${lt.tasks} long tasks, longest ${ms(lt.longest)} | heap ${mb(heap0)} -> peak ${mb(q.peak)} -> ${mb(await heap(page))}`);
console.log(`profile (GC ${ms(pr.gc)}):\n    ${fmtTop(pr, 10)}`);
if (click) {
  const lt1 = await ltCount(page), h1 = await heap(page);
  const box = await (await page.$('[data-canvas]')).boundingBox();
  const p2 = await profile(page, async () => { await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await page.waitForTimeout(8000); });
  const l2 = await longTasks(page, lt1);
  console.log(`first click + 8 s: blocking ${ms(l2.block)} in ${l2.tasks} long tasks, longest ${ms(l2.longest)} | heap ${mb(h1)} -> ${mb(await heap(page))}\n    ${fmtTop(p2, 6)}`);
}
console.log('page errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
try { execFileSync('sudo', ['-u', 'www-data', 'php', new URL('../cadcraft-test/admin.php', import.meta.url).pathname, 'down', 'bimperf']); } catch { /* ok */ }

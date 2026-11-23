#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * perf-start-11.mjs — civil-11, 0.11 PERF.57 (CivilCraft's part: the plants seed): start-up of /lab/civilcraft in headless Chromium, N loads per mode, median.
 * Measured: long tasks (count, ms blocked, longest) from navigation until window.civilcraft exists and 1.5 s of quiet follow, and how many of those tasks start
 * before civilcraft is ready. Modes: AFTER = the working tree (the seed is fetched and cleaned when something needs it or the page is idle); BEFORE = the same
 * page with landscape-ui.js served with the seed loaded at once in the start-up task (what 0.10 shipped before PERF.57), through a route, same machine, same time.
 *   node tools/civilcraft-test/perf-start-11.mjs [--n 5]       Run as root, one at a time. `uptime` is printed beside the numbers.
 */
import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const N = Number(arg('--n', 5));
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cv11'], { encoding: 'utf8' }) || '{}');
const load = () => execSync('uptime').toString().trim().replace(/^.*load average: /, 'load ');
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const SRC = fs.readFileSync(path.join(REPO, 'public_html/assets/apps/civilcraft/dev/landscape/landscape-ui.js'), 'utf8');
const IDLE = /\(globalThis\.requestIdleCallback \? [^\n]*\(\(\) => start\(\)\);/;
if (!IDLE.test(SRC)) throw new Error('landscape-ui.js: the idle start line is not as this tool expects');
const EAGER = SRC.replace(IDLE, 'start();   // BEFORE: loaded in the start-up task');
admin('up'); const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const runOnce = async (eager) => {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript(() => { window.__lt = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch { /* */ } try { localStorage.setItem('cc-autofocus', 'off'); } catch { /* */ } window.__ready = 0; const iv = setInterval(() => { if (window.civilcraft?.project) { window.__ready = performance.now(); clearInterval(iv); } }, 5); });
  const page = await ctx.newPage();
  if (eager) await page.route('**/civilcraft/dev/landscape/landscape-ui.js*', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: EAGER }));
  await page.goto('https://getcadcraft.com/lab/civilcraft', { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.__ready > 0, null, { timeout: 120000 });
  await page.waitForTimeout(3500);
  const r = await page.evaluate(() => { const lt = window.__lt, pre = lt.filter((x) => x[0] < window.__ready + 50); return { tasks: lt.length, block: Math.round(lt.reduce((a, x) => a + x[1], 0)), longest: Math.round(lt.reduce((a, x) => Math.max(a, x[1]), 0)), preTasks: pre.length, preBlock: Math.round(pre.reduce((a, x) => a + x[1], 0)), ready: Math.round(window.__ready) }; });
  await ctx.close();
  return r;
};
console.log(`CivilCraft /lab start-up, ${N} loads per mode, medians  (${load()})`);
const out = { BEFORE: [], AFTER: [] };
for (let i = 0; i < N; i++) for (const m of i % 2 ? ['AFTER', 'BEFORE'] : ['BEFORE', 'AFTER']) out[m].push(await runOnce(m === 'BEFORE'));   // alternate, so a load change hits both
for (const m of ['BEFORE', 'AFTER']) { const a = out[m]; console.log(`${m}: ready ${med(a.map((x) => x.ready))} ms; long tasks until ready ${med(a.map((x) => x.preTasks))} (${med(a.map((x) => x.preBlock))} ms blocked); in all ${med(a.map((x) => x.tasks))} tasks, ${med(a.map((x) => x.block))} ms, longest ${med(a.map((x) => x.longest))} ms   runs: ${a.map((x) => x.preBlock + '/' + x.block).join(' ')}`); }
console.log(load());
await browser.close(); admin('down');

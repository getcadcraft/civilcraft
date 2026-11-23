#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * perf-open-11.mjs — CivilCraft 0.11 PERF.33 (civil-11, after civil-10's perf-open-10) / PERF.31 / PERF.32 in the real /lab page (headless Chromium, software GL: frame times are the main
 * thread's). Opens a project file through the page's own file input, then times: the open until quiet (long tasks, heap), wheel-zoom frames
 * (every power-of-two zoom step rebuilds the plan scene), drag-pan frames, and a few long-task counts. `uptime` is printed beside the numbers.
 *   node tools/civilcraft-test/perf-open-11.mjs [--file path] [--before] [--profile]   (--profile: top self-time functions of the zoom steps)
 * --before serves the files this session changed (MINE below, when git says they differ from HEAD) from HEAD instead, so one run measures the
 * old code on the same machine, same file, same page. Run one at a time: nice -n 10 timeout 900 node …. Minted session, tag cv10.
 */
import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const FILE = arg('--file') || '/var/www/CADCRAFT/testfiles/generated/civil/survey-500k.civilcraft.json';
const BEFORE = process.argv.includes('--before');
const MINE = ['files-ui.js', 'project.js'];   // the files civil-11 changed for PERF.33: only these go back to HEAD
const BASE = 'https://getcadcraft.com';
const DEV = 'public_html/assets/apps/civilcraft/dev/';
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cv11'], { encoding: 'utf8' }) || '{}');
const load = () => execSync('uptime').toString().trim().replace(/^.*load average: /, 'load ');
const pct = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * p))] : 0; };
admin('up'); const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--enable-precise-memory-info', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--js-flags=--max-old-space-size=8000'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript(() => { window.__lt = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch { /* */ } localStorage.setItem('cc-autofocus', 'off'); });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(e.message.slice(0, 200))); page.on('console', (m) => { if (m.type() === 'warning' && /civilcraft:/.test(m.text())) console.log('WARN ' + m.text().slice(0, 300)); if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });
  if (BEFORE) {
    const files = execSync(`git diff --name-only HEAD -- ${DEV}`, { cwd: REPO, encoding: 'utf8' }).split('\n').filter((f) => MINE.includes(path.basename(f)) && path.dirname(f) + '/' === DEV.replace(/\/$/, '') + '/');
    for (const f of files) { const body = execSync(`git show HEAD:${f}`, { cwd: REPO, maxBuffer: 1 << 28 }); await page.route('**/' + f.slice('public_html/'.length) + '*', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body })); }
    console.log('serving from HEAD: ' + files.map((f) => path.basename(f)).join(', '));
  }
  console.log(`CivilCraft /lab ← ${path.basename(FILE)} ${(fs.statSync(FILE).size / 1048576).toFixed(0)} MB, ${BEFORE ? 'BEFORE (HEAD code)' : 'AFTER (working tree)'}  (${load()})`);
  await page.goto(BASE + '/lab/civilcraft', { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForFunction(() => window.civilcraft?.project, null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  const ltN = () => page.evaluate(() => window.__lt.length);
  const ltSince = (n0) => page.evaluate((n0) => { const lt = window.__lt.slice(n0); return { tasks: lt.length, block: lt.reduce((a, x) => a + x[1], 0) | 0, longest: lt.reduce((a, x) => Math.max(a, x[1]), 0) | 0, heap: ((performance.memory?.usedJSHeapSize || 0) / 1048576) | 0 }; }, n0);
  const n0 = await ltN(), t0 = Date.now();
  const cdpO = process.argv.includes('--profile-open') ? await ctx.newCDPSession(page) : null;
  if (cdpO) { await cdpO.send('Profiler.enable'); await cdpO.send('Profiler.setSamplingInterval', { interval: 1000 }); await cdpO.send('Profiler.start'); }
  await page.setInputFiles('[data-file]', FILE);
  await page.waitForFunction(() => window.civilcraft.project.points.length > 1000, null, { timeout: 600000 });
  // quiet: no long task in the last 1.5 s
  for (;;) { await page.waitForTimeout(500); const q = await page.evaluate((n0) => { const lt = window.__lt.slice(n0), last = lt.length ? lt[lt.length - 1][0] + lt[lt.length - 1][1] : 0; return performance.now() - last; }, n0); if (q > 1500 && Date.now() - t0 > 2500) break; if (Date.now() - t0 > 600000) break; }
  const open = await ltSince(n0);
  if (cdpO) { const { profile } = await cdpO.send('Profiler.stop'); const self = new Map(), byId = new Map(profile.nodes.map((n) => [n.id, n])); profile.samples.forEach((id, i) => { const cf = byId.get(id)?.callFrame; if (!cf) return; const k = (cf.functionName || '(anonymous)') + ' @ ' + cf.url.replace(/\?.*$/, '').replace(/^.*\/dev\//, '') + ':' + (cf.lineNumber + 1); self.set(k, (self.get(k) || 0) + (profile.timeDeltas[i] || 0)); }); console.log('profile of the open: ' + [...self.entries()].filter(([k]) => !/^\((idle|program|root)\)/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${v / 1000 | 0} ms ${k}`).join(' · ')); }
  const pts = await page.evaluate(() => window.civilcraft.project.points.length);
  console.log(`open: ${pts} points; quiet after ${Date.now() - t0 - 1500} ms; ${open.tasks} long tasks, ${open.block} ms blocked, longest ${open.longest} ms; heap ${open.heap} MB  (${load()})`);
  console.log('long tasks after the first mark [start, ms]: ' + JSON.stringify(await page.evaluate(() => { const m0 = performance.getEntriesByName('cv-open:start')[0]?.startTime ?? 0; return window.__lt.filter((x) => x[0] >= m0 - 3000).map((x) => [Math.round(x[0] - m0), Math.round(x[1])]); })));
  console.log('marks (ms after the first mark): ' + JSON.stringify(await page.evaluate(() => { const m = performance.getEntriesByType('mark').filter((x) => x.name.startsWith('cv-open:')); return m.map((x) => [x.name.slice(8), Math.round(x.startTime - m[0].startTime)]); })));
  if (process.argv.includes('--open-only')) { console.log('state: ' + await page.evaluate(() => window.civilcraft.project.eg().surface?.nT + ' triangles; notes ' + JSON.stringify(window.civilcraft.project.eg().report.notes))); console.log(errors.length ? 'errors: ' + errors.join(' | ') : 'no console errors'); await browser.close(); admin('down'); process.exit(0); }
  const frames = async (label, fn) => {
    await page.evaluate(() => { window.__fr = []; let last = performance.now(); const tick = (t) => { window.__fr.push(t - last); last = t; if (window.__fr.length < 100000) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
    const n = await ltN(), t = Date.now(); await fn(); await page.waitForTimeout(400);
    const f = await page.evaluate(() => window.__fr.slice(1).filter((x) => x > 0)); const lt = await ltSince(n);
    console.log(`${label}: frames p50 ${pct(f, 0.5) | 0} ms, p95 ${pct(f, 0.95) | 0} ms, max ${pct(f, 1) | 0} ms (${f.length} frames in ${Date.now() - t} ms; ${lt.tasks} long tasks, ${lt.block} ms blocked; ${load()})`);
  };
  const box = await page.evaluate(() => { const r = document.querySelector('[data-plan]')?.getBoundingClientRect() || document.querySelector('canvas').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  await page.mouse.move(box.x, box.y);
  const cdp = process.argv.includes('--profile') ? await ctx.newCDPSession(page) : null;
  if (cdp) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 1000 }); await cdp.send('Profiler.start'); }
  await frames('wheel zoom in x6', async () => { for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, -400); await page.waitForTimeout(250); } });
  if (cdp) {
    const { profile } = await cdp.send('Profiler.stop'); const self = new Map(), byId = new Map(profile.nodes.map((n) => [n.id, n])); let total = 0;
    profile.samples.forEach((id, i) => { const d = profile.timeDeltas[i] || 0; total += d; const cf = byId.get(id)?.callFrame; if (!cf) return; const k = (cf.functionName || '(anonymous)') + ' @ ' + cf.url.replace(/\?.*$/, '').replace(/^.*\/dev\//, '') + ':' + (cf.lineNumber + 1); self.set(k, (self.get(k) || 0) + d); });
    console.log('profile of the zoom-in steps (' + (total / 1000 | 0) + ' ms sampled): ' + [...self.entries()].filter(([k]) => !/^\((idle|program|root)\)/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${v / 1000 | 0} ms ${k}`).join(' · '));
  }
  await frames('wheel zoom out x6', async () => { for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(250); } });
  await frames('drag pan', async () => { await page.keyboard.down('Space'); await page.mouse.down(); for (let i = 0; i < 12; i++) await page.mouse.move(box.x + i * 12, box.y + i * 6); await page.mouse.up(); await page.keyboard.up('Space'); });
  console.log(errors.length ? 'errors: ' + errors.join(' | ') : 'no console errors');
} finally { await browser.close(); admin('down'); }

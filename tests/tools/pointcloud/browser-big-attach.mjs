#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-big-attach.mjs — 0.9 FX.36 (a big LAS / E57 attach seemed to freeze CadCraft): PCATTACH of the big test files in /lab/cadcraft with the
 * main thread watched. cad-fix-09 tried the small files only; the files here are the registry's (testfiles/LARGE-FILES.md, never regenerated):
 *   generated/pointcloud/big-90mb.las (90 MB, LAS 1.4)    generated/pointcloud/e57-5900000-rgb.e57 (89 MB, 5.9 M points)
 *   --also-210   also the 212 MB LAS (over CivilCraft's 200 MB terrain limit, which CadCraft's attach may not share)
 * For each: seconds until CadCraft asks where to put the cloud (the read), seconds until it is attached, the longest block of the main
 * thread (PerformanceObserver "longtask" + a 50 ms heartbeat), the busy overlay and anything covering the drawing afterwards, and whether a
 * line can still be drawn by real clicks.   node tools/pointcloud/browser-big-attach.mjs [--also-210]   (run as root, nice)
 * Headless software rendering: the long-task numbers are what counts, not frame rates.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TF = path.resolve(REPO, '../testfiles/generated/pointcloud');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const files = [['LAS 90 MB', 'big-90mb.las'], ['E57 89 MB', 'e57-5900000-rgb.e57']];
if (process.argv.includes('--also-210')) files.push(['LAS 212 MB', 'big-210mb-10600000.las']);

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
await ctx.addInitScript(() => {
  try { localStorage.setItem('cadcraft.tour', 'skipped'); } catch { /* none */ }
  window.__long = [];
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push(Math.round(e.duration)); }).observe({ entryTypes: ['longtask'] }); } catch { /* none */ }
  window.__beat = { last: performance.now(), worst: 0 };
  setInterval(() => { const n = performance.now(); window.__beat.worst = Math.max(window.__beat.worst, n - window.__beat.last - 50); window.__beat.last = n; }, 50);
});
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(80); };
const all = () => page.evaluate(() => window.cadcraft.doc.all().length);
try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email); await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  for (const [label, name] of files) {
    const file = path.join(TF, name);
    if (!fs.existsSync(file)) { console.log('  skip ' + label + ': ' + file + ' is missing'); continue; }
    console.log('\n== ' + label);
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    await typeCmd('ERASE'); await typeCmd('ALL'); await typeCmd('');
    await page.evaluate(() => { window.cadcraft.host.cloud?.detach?.(); window.__long.length = 0; window.__beat.worst = 0; });
    const chP = page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null);
    await typeCmd('PCATTACH');
    const ch = await chP;
    if (!ch) { ok(false, label + ': PCATTACH opens the file chooser'); continue; }
    const t0 = Date.now();
    await ch.setFiles(file);
    let asked = true;
    await page.waitForFunction(() => window.cadcraft.engine.waiting?.kind === 'point', null, { timeout: 240000 }).catch(() => { asked = false; });
    const tRead = (Date.now() - t0) / 1000;
    const readLong = await page.evaluate(() => ({ worst: window.__beat.worst, long: Math.max(0, ...window.__long) }));
    console.log(`   read: ${tRead.toFixed(1)} s, longest main-thread block ${Math.round(readLong.worst)} ms (heartbeat), ${readLong.long} ms (longtask)`);
    ok(asked, label + ': the read finishes and it asks where to put the cloud (' + tRead.toFixed(1) + ' s)');
    if (!asked) { console.log('   history: ' + (await page.textContent('[data-history]')).slice(-300)); continue; }
    await page.evaluate(() => { window.__long.length = 0; window.__beat.worst = 0; });
    const t1 = Date.now();
    await typeCmd('F');
    await page.waitForFunction(() => !window.cadcraft.engine.running, null, { timeout: 240000 }).catch(() => {});
    const tAttach = (Date.now() - t1) / 1000;
    const attLong = await page.evaluate(() => ({ worst: window.__beat.worst, long: Math.max(0, ...window.__long), n: window.__long.length }));
    console.log(`   attach: ${tAttach.toFixed(1)} s, longest main-thread block ${Math.round(attLong.worst)} ms (heartbeat), ${attLong.long} ms (longtask, ${attLong.n} of them)`);
    ok(tAttach < 120, label + ': the attach is done in ' + tAttach.toFixed(1) + ' s');
    await page.waitForTimeout(800);
    const cover = await page.evaluate(() => {
      const o = document.querySelector('[data-over]'), r = o.getBoundingClientRect(), top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      const busy = [...document.querySelectorAll('[data-busy], .cc-busy')].filter((e) => getComputedStyle(e).display !== 'none' && !e.hidden).length;
      return { over: top === o, top: top && top.tagName + '.' + String(top.className).slice(0, 40), busy };
    });
    ok(cover.over && cover.busy === 0, label + ': nothing covers the drawing, no busy overlay (' + cover.top + ')', JSON.stringify(cover));
    const n0 = await all(), ob = await page.evaluate(() => { const r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await typeCmd('L'); await page.mouse.click(ob.x, ob.y); await page.waitForTimeout(80); await page.mouse.click(ob.x + 60, ob.y + 40); await page.waitForTimeout(80); await typeCmd('');
    ok((await all()) === n0 + 1, label + ': a line can be drawn over the cloud');
    // the freeze the reporter described would be a block of many seconds: say what we measured
    ok(Math.max(readLong.worst, attLong.worst) < 5000, label + ': the main thread never blocked for 5 s or more (' + Math.round(Math.max(readLong.worst, attLong.worst)) + ' ms)');
    console.log('   history: ' + (await page.textContent('[data-history]')).slice(-220).replace(/\n/g, ' '));
  }
  ok(problems.length === 0, 'no console errors or page errors', problems.slice(0, 4).join(' | '));
} catch (err) { ok(false, 'ran to the end', err.stack || err.message); }
finally { await browser.close(); execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

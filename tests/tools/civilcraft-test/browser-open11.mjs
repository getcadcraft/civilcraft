#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-open11.mjs — civil-11, 0.11 PERF.33 in the real /lab page: a 40,000-point project opened through the file input builds its surface in a Worker
 * (a blob: module Worker is started, the main thread has no long task while it works, the same triangles come out as the sync path, the status line
 * said what it was doing), and a 15-point project starts no Worker.   Run as root: nice -n 10 timeout 600 node tools/civilcraft-test/browser-open11.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cv11'], { encoding: 'utf8' }) || '{}');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-open11-'));
let seed = 11; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const proj = (n) => ({ format: 'civilcraft-project', version: 1, name: 'open11 ' + n, units: 'm', seq: 1, points: Array.from({ length: n }, (_, i) => { const x = 1000 + rnd() * 900, y = 2000 + rnd() * 700; return [String(i + 1), x, y, 50 + Math.sin(x / 60) * 6 + y / 100, '']; }) });
fs.writeFileSync(path.join(dir, 'big.civilcraft.json'), JSON.stringify(proj(40000)));
fs.writeFileSync(path.join(dir, 'small.civilcraft.json'), JSON.stringify(proj(15)));
admin('up'); const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript(() => {
    window.__workers = []; const W = window.Worker;
    window.Worker = function (u, o) { window.__workers.push(String(u).slice(0, 5)); return new W(u, o); }; window.Worker.prototype = W.prototype;
    window.__lt = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch { /* */ }
    window.__busy = []; const mo = () => { const n = document.querySelector('[data-busy-text]'); if (!n) return setTimeout(mo, 50); new MutationObserver(() => { if (n.textContent) window.__busy.push(n.textContent); }).observe(n, { childList: true, characterData: true, subtree: true }); };
    document.addEventListener('DOMContentLoaded', mo);
  });
  const page = await ctx.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text().slice(0, 200)); });
  await page.goto('https://getcadcraft.com/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);

  await page.setInputFiles('[data-file]', path.join(dir, 'small.civilcraft.json'));
  await page.waitForFunction(() => window.civilcraft.project.points.length === 15, null, { timeout: 60000 });
  await page.waitForTimeout(500);
  ok(await page.evaluate(() => window.__workers.length) === 0, 'a 15-point project starts no Worker');

  await page.setInputFiles('[data-file]', path.join(dir, 'big.civilcraft.json'));
  await page.waitForFunction(() => window.civilcraft.project.points.length === 40000, null, { timeout: 120000 });
  await page.waitForFunction(() => performance.getEntriesByName('cv-open:shown').length > 0, null, { timeout: 120000 });
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const m = Object.fromEntries(performance.getEntriesByType('mark').filter((x) => x.name.startsWith('cv-open:')).slice(-4).map((x) => [x.name.slice(8), x.startTime]));
    const lt = window.__lt.filter((x) => x[0] > m.parsed && x[0] < m.surface);
    const p = window.civilcraft.project, eg = p.eg();
    return { workers: window.__workers, m, ltInSurface: lt.map((x) => Math.round(x[1])), nT: eg.surface?.nT, primed: p.cache.get('eg')?.value === eg, busy: window.__busy.filter((s) => /surface/i.test(s)).slice(0, 2) };
  });
  ok(r.workers.includes('blob:'), 'the 40,000-point project started a blob: module Worker', r.workers);
  ok(r.nT > 70000 && r.primed, 'the surface is there (' + r.nT + ' triangles) and p.eg() holds the one the Worker built', r);
  ok(r.ltInSurface.every((d) => d < 200), 'no long task on the page while the Worker built the surface', r.ltInSurface);
  ok(r.busy.length >= 1 && /40,000 points/.test(r.busy[0]), 'the status line said it was building the surface from 40,000 points', r.busy);
  const eq = await page.evaluate(() => { const p = window.civilcraft.project, e = p.eg(); p.cache.delete('eg'); const e2 = p.eg(); return { a: e.surface.nT, b: e2.surface.nT, tris: Array.from(e.surface.tris).every((v, i) => v === e2.surface.tris[i]), z: Array.from(e.surface.Z.slice(0, 2000)).every((v, i) => v === e2.surface.Z[i]) }; });
  ok(eq.a === eq.b && eq.tris && eq.z, 'the Worker\'s surface equals the page\'s own build (triangles and heights)', eq);
  ok(problems.length === 0, 'no page errors', problems);
} finally { await browser.close(); admin('down'); fs.rmSync(dir, { recursive: true, force: true }); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-plumbstd.mjs — 0.8 SU.955 (session `mep-08`): the Pipe bar's plumbing standard in the real /lab/bimcraft page. Run as root (it mints the add-on test admin's
 * session with sudo -u www-data, as browser-mep07.mjs does).
 *
 *   node tools/bimcraft-test/browser-plumbstd.mjs [--shots <dir>]
 *
 * A new building: the Pipe bar offers "follows the material", US and Brazil; choosing Brazil is one change, sets the bar to PVC soldável
 * DN 25 (cold water), a sanitary run to PVC esgoto DN 100, and a drawn run keeps that material; Undo takes the choice back.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : path.join(ROOT, 'tmp/shots/plumbstd');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const php = (script, cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', script, cmd], { cwd: ROOT }).toString().trim().split('\n').pop());
const { cookie } = php('tools/addons-test/admin.php', 'session');
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((x) => path.join(cacheDir, build, x)).find((x) => fs.existsSync(x));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const [cn, cv] = cookie.split('=');
  await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(e.message));
  const waitStatus = (re) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout: 60000 });
  const status = () => page.evaluate(() => document.querySelector('[data-status]')?.textContent || '');
  const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
  const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
  const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
  const build = async () => { await page.click('[data-res-tools] summary'); };

  await page.goto('https://getcadcraft.com/lab/bimcraft?space=paper', { waitUntil: 'load' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'load' });
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'STD');
  await page.fill('[data-new-levels]', '2');
  await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await waitStatus(/^New building STD/);
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();

  await build();
  await page.click('[data-mtool="pipe"]');
  const opts = await page.$$eval('[data-mep-std] option', (o) => o.map((x) => x.value + '=' + x.textContent));
  ok(opts.length === 3 && opts[0].startsWith('=') && opts.some((x) => x.startsWith('br=Brazil')) && !opts.some((x) => /mep\./.test(x)), 'the Pipe bar lists: follows the material, US, Brazil', opts.join(' | '));
  const P = () => page.evaluate(() => { const p = window.bimcraftMep.state.pipe; return { mat: p.mat, size: p.size, system: p.system, slope: p.slope }; });
  ok((await P()).mat === 'copper', 'nothing set: the bar starts as in 0.7 (copper water)');
  const n0 = await page.evaluate(() => window.bimcraftLive.editor.changes.length);
  await page.selectOption('[data-mep-std]', 'br');
  await settled();
  ok(await page.evaluate((n) => window.bimcraftLive.editor.changes.length === n + 1, n0), 'choosing Brazil is ONE change');
  let p = await P();
  ok(p.mat === 'pvc-sold' && p.size === '25', 'the bar starts cold water as PVC soldável 25', JSON.stringify(p));
  ok(/Brazil/.test(await status()), 'the status line says so', await status());
  await page.selectOption('[data-mep-sys]', 'san');
  p = await P();
  ok(p.mat === 'pvc-esg' && p.size === '100' && p.slope > 0, 'a sanitary run starts as PVC esgoto DN 100 at its NBR 8160 slope', JSON.stringify(p));
  await page.screenshot({ path: path.join(SHOTS, 'plumbstd-01-bar.png') });
  await planClick(0, 0); await planClick(3000, 0); await page.keyboard.press('Enter');
  await settled();
  const runs = () => page.evaluate(() => window.bimcraftMep.state.runs.map((r) => ({ mat: r.mat, size: r.size, system: r.system })));
  ok(JSON.stringify(await runs()) === JSON.stringify([{ mat: 'pvc-esg', size: '100', system: 'san' }]), 'the drawn run is PVC esgoto DN 100', JSON.stringify(await runs()));
  await page.selectOption('[data-mep-std]', 'us');
  await settled();
  p = await P();
  ok(p.mat === 'pvc' && p.size === '3', 'choosing US: the bar is PVC 3" drain', JSON.stringify(p));
  ok((await runs())[0].mat === 'pvc-esg', 'the run already drawn keeps its material');
  await page.click('[data-act="undo"]');
  await settled();
  ok(await page.$eval('[data-mep-std]', (s) => s.value) === 'br', 'Undo: the model says Brazil again');
  await page.click('[data-act="undo"]');
  await settled();
  ok(await page.$eval('[data-mep-std]', (s) => s.value) === 'br', 'Undo of the run leaves the standard');
  const missing = await page.evaluate(() => (window.ccI18n?.missing?.() || []).filter((k) => /^mep\./.test(k)));
  ok(!missing.length, 'no language key missing', missing.join(', '));
  ok(!problems.filter((x) => !/unsigned/.test(x)).length, 'no console errors', problems.slice(0, 3).join(' | '));
} finally {
  await browser.close();
  php('tools/addons-test/admin.php', 'down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

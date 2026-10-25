#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-laser.mjs — CadCraft's Laser panel (0.7 SU.772, session laser-cad) in the real page (/lab/cadcraft): View › More › Laser…
 * and LASER open the panel over the drawing; the drawing's layers are its rows; a mode change is kept in the drawing (one undo
 * step); the preview and its numbers follow an edit; Save G-code downloads GRBL laser-mode G-code; without Web Serial the panel
 * offers saving only; Esc closes it. (The panel's own controls and the serial sender against a fake GRBL: tools/laser/browser.mjs.)
 *
 *   node tools/cadcraft-test/browser-laser.mjs [--shots <dir>]
 *
 * Run as root (a session for the test admin is minted by tools/cadcraft-test/admin.php). Cached Playwright Chromium.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const page = await ctx.newPage();
page.setDefaultTimeout(10000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const T = (ms) => page.waitForTimeout(ms);
const say = () => page.evaluate(() => document.querySelector('[data-history]')?.textContent || '');
try {
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  // Chromium has Web Serial: hide it, as Firefox, Safari and the system web views without it do
  await page.addInitScript(() => { try { Object.defineProperty(Navigator.prototype, 'serial', { get: () => undefined, configurable: true }); } catch { /* no serial already */ } });
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await page.evaluate(() => {
    const d = window.cadcraft.doc;
    d.addLayer({ name: 'CUT', color: 1 }); d.addLayer({ name: 'SCORE', color: 5 });
    d.change('seed', () => {
      d.add({ type: 'poly', layer: 'CUT', closed: true, pts: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 60 }, { x: 0, y: 60 }] });
      d.add({ type: 'circle', layer: 'CUT', cx: 30, cy: 30, r: 8 });
      d.add({ type: 'line', layer: 'SCORE', x1: 10, y1: 50, x2: 90, y2: 50 });
      d.add({ type: 'text', layer: 'SCORE', x: 0, y: -10, h: 2.5, s: 'Plate A' });
    });
    window.cadcraft.host.zoomExtents?.();
  });

  console.log('\n== opening it');
  const item = page.locator('[data-tb-key="View"] [data-cmd="LASER"]');
  ok(await item.count() === 1, 'View › More has Laser…');
  await page.locator('[data-tb-key="View"] details.cc-menu > summary').click();
  await item.click();
  await page.waitForSelector('[data-laser-panel]:not([hidden])');
  ok(await page.locator('[data-laser-panel] [data-lp-layer]').count() === 2, 'the panel lists the two layers with something on them');
  ok(await page.locator('[data-laser-panel] [data-laser-skipped="text"]').count() === 1, 'it says the text is not sent');
  ok(await page.locator('[data-laser-panel] [data-lp-noserial]').count() === 1 && await page.locator('[data-laser-panel] [data-lp-connect]').count() === 0, 'without Web Serial: saving only, no Connect button');
  ok(await page.locator('[data-laser-panel] [data-lp-nothing]').count() === 1, 'every layer starts as Not sent: nothing to send yet');

  console.log('\n== choosing what each layer does');
  await page.selectOption('[data-lp-layer="CUT"] select[data-lp="mode"]', 'cut');
  await T(250);
  await page.selectOption('[data-lp-layer="SCORE"] select[data-lp="mode"]', 'score');
  await T(250);
  const meta = await page.evaluate(() => window.cadcraft.doc.meta.laser?.layers?.map((l) => l.name + ':' + l.mode).join());
  ok(/CUT:cut/.test(meta || '') && /SCORE:score/.test(meta || ''), 'the modes are kept in the drawing (doc.meta.laser)', meta);
  ok(await page.locator('[data-laser-panel] [data-lp-canvas]').count() === 1, 'the preview draws');
  const stats1 = await page.locator('[data-lp-stats]').textContent();
  ok(/100 × 60 mm/.test(stats1), 'its size is the plate, 100 × 60 mm', stats1);
  await page.evaluate(() => window.cadcraft.engine.text('UNDO'));
  await T(300);
  const after = await page.evaluate(() => window.cadcraft.doc.meta.laser?.layers?.find((l) => l.name === 'SCORE')?.mode || 'off');
  ok(after === 'off', 'UNDO takes the last mode change back', after);
  await page.evaluate(() => window.cadcraft.engine.text('REDO'));
  await T(300);

  console.log('\n== the preview follows the drawing');
  await page.evaluate(() => { const d = window.cadcraft.doc; d.change('more', () => d.add({ type: 'line', layer: 'SCORE', x1: 0, y1: 0, x2: 150, y2: 0 })); });
  await T(400);
  const stats2 = await page.locator('[data-lp-stats]').textContent();
  ok(/150 × 60 mm/.test(stats2), 'a new line widens the job to 150 mm', stats2);

  console.log('\n== saving the G-code');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-lp-save]')]);
  const file = await dl.path();
  const g = file ? fs.readFileSync(file, 'utf8') : '';
  ok(/\.gcode$/.test(dl.suggestedFilename()), 'a .gcode file named after the drawing', dl.suggestedFilename());
  ok(/\$32=1/.test(g) && /\bM4\b/.test(g) && /\bM5\b/.test(g) && /\bG1\b/.test(g), 'GRBL laser mode G-code');
  ok(/G-code saved/.test(await say()), 'the history says it was saved');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'laser-panel.png') });

  console.log('\n== closing, and the command');
  await page.keyboard.press('Escape');
  await T(200);
  ok(await page.locator('[data-laser-panel]').isHidden(), 'Esc closes the panel');
  await page.evaluate(() => window.cadcraft.engine.text('LASER'));
  await page.waitForSelector('[data-laser-panel]:not([hidden])');
  ok(true, 'LASER opens it again');
  ok(!problems.length, 'no errors in the page', problems.join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

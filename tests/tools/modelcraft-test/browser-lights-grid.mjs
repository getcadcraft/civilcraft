#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-lights-grid.mjs — ModelCraft's lamp editor in the shared property grid (0.8 PANEL-COMPACT; assets/js/app-propgrid.js,
 * modelcraft.js renderLights). A spot lamp is added through the model and selected; then through the real panel: the rows by lamp kind
 * (spot: angle; area: width and depth), brightness, colour (picker row and the preset buttons), lengths read in the model's units
 * (a bad length is refused with the app's words and the box goes back), one undo step per edit, no console errors.
 *
 *   node tools/modelcraft-test/browser-lights-grid.mjs [--shots <dir>]
 * Signs in with the MarkupCraft test admin (tools/markupcraft-test/admin.php; disabled again at the end).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/markupcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const dc = (fn, arg) => page.evaluate(fn, arg);
const row = (id) => page.locator(`[data-light-edit] [data-pg-row="${id}"]`);
const lamp = () => dc(() => JSON.parse(JSON.stringify([...window.modelcraft.model.lights.values()][0])));
const add = (o) => dc((o) => { const mc = window.modelcraft; const id = mc.model.change('test lamp', (m) => m.addLight(o), []); mc.host.changed(); mc.host.lightPlaced(id); return id; }, o);

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(`${BASE}/lab/modelcraft?space=paper`, { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('cc-propgrid:modelcraft:light'); } catch {} });
  ok(await dc(() => !!window.ccPropGrid), 'the shell loads the property grid (manifest "propgrid")');

  await add({ kind: 'spot', p: [1, 1, 2], dir: [0, 0, -1], color: '#ffd2a1', lumens: 800, angle: 40, size: [0.1, 0.1] });
  await page.waitForSelector('[data-light-edit] .pg');
  const ids = await page.$$eval('[data-light-edit] [data-pg-row]', (e) => e.map((x) => x.getAttribute('data-pg-row')));
  ok(['lumens', 'color', 'angle', 'b', 'x', 'y', 'z'].every((i) => ids.includes(i)) && !ids.includes('w'), 'a spot lamp: brightness, colour, angle, bulb size and position rows: ' + ids.join(','));

  await row('lumens').fill('1600'); await row('lumens').press('Tab');
  ok((await lamp()).lumens === 1600, 'brightness 1600');
  await row('angle').fill('55'); await row('angle').press('Tab');
  ok((await lamp()).angle === 55, 'angle 55');
  await row('x').fill('2m'); await row('x').press('Tab');
  const lx = (await lamp()).p[0];
  ok(Math.abs(lx - 2) < 1e-6, 'x typed as 2m moves the lamp to 2 m (x = ' + lx + ')');
  const zBefore = (await lamp()).p[2];
  await row('z').fill('not a length'); await row('z').press('Tab');
  ok(Math.abs((await lamp()).p[2] - zBefore) < 1e-9 && /\S/.test(await dc(() => document.querySelector('[data-msg]')?.textContent || '')), 'a bad length is refused with the app\'s words and the lamp is unchanged: ' + (await dc(() => document.querySelector('[data-msg]')?.textContent || '')).slice(0, 50));
  ok(await row('z').inputValue() !== 'not a length', 'the box goes back to the real value');
  await page.locator('[data-light-edit] .mc-light-presets button').nth(2).click();
  ok((await lamp()).color === '#eef3ff', 'a preset button (cool) sets the colour');
  await row('color').evaluate((e) => { e.value = '#336699'; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); });
  ok((await lamp()).color === '#336699', 'the colour row sets the colour');
  await dc(() => window.modelcraft.model.undo?.());
  ok((await lamp()).color !== '#336699', 'Undo takes the last edit back (one step)');

  // an area lamp has width and depth instead of a bulb size
  await add({ kind: 'area', p: [0, 0, 2.4], dir: [0, 0, -1], color: '#fff1dc', lumens: 2000, angle: 60, size: [0.6, 0.6] });
  await page.waitForSelector('[data-light-edit] [data-pg-row="w"]');
  const ids2 = await page.$$eval('[data-light-edit] [data-pg-row]', (e) => e.map((x) => x.getAttribute('data-pg-row')));
  ok(ids2.includes('w') && ids2.includes('d') && !ids2.includes('b') && !ids2.includes('angle'), 'an area lamp: width and depth, no bulb size or angle: ' + ids2.join(','));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'modelcraft-light-grid.png') });
  await page.click('[data-light-delete]');
  ok(await dc(() => window.modelcraft.model.lights.size) === 1, 'Delete removes the selected lamp');
} finally {
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch {}
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

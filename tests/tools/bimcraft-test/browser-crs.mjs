#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-crs.mjs — D8.9 (0.8, session d89_PART_3): any projection in BimCraft, in the lab, headless, real clicks.
 *   node tools/bimcraft-test/browser-crs.mjs [--shots <dir>]
 * Signs in with a minted session (tools/shell-test/admin.php session; the shared admin login is never touched; run `down` after).
 *   Measure › Coordinate system…: a file whose map system has no EPSG code gets one by "UTM 56S" / a pasted definition; the dialog
 *   shows it next time; Measure › Location then gives latitude and longitude; take it off; Settings › Location › Choose another
 *   system…: EPSG number, UTM zone, own projection kept in My projections (and removed). Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureIfc, GEOREF } from './ifc-fixture.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
const [cname, cval] = minted.cookie.split('=');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const text = fixtureIfc({ georef: 'map' }).replace("'" + GEOREF.crs + "'", "'Plant grid'");
const press = async (k) => { await page.locator('[data-canvas]').focus().catch(() => {}); await page.keyboard.press(k); };
const dlg = 'dialog[data-crs-pick][open]';

try {
  await ctx.addCookies([{ name: cname, value: cval, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('bimcraft.settings'); localStorage.removeItem('cadcraft.projections'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', { name: 'plant.ifc', mimeType: 'application/x-step', buffer: Buffer.from(text) });
  await waitStatus(/^Opened /);
  await page.click('[data-view="iso"]');
  await press('m');
  ok(await page.isVisible('[data-measure-crs]'), 'Measure shows the "Coordinate system…" button');

  console.log('== choose a UTM zone for a model whose map system has no EPSG code');
  await page.click('[data-measure-mode="point"]');
  await page.click('[data-measure-crs]');
  await page.waitForSelector(dlg);
  ok(/Plant grid/.test(await page.textContent(dlg + ' [data-crs-current]')), 'the dialog names what the file says: ' + (await page.textContent(dlg + ' [data-crs-current]')));
  await page.fill('[data-crs-q]', 'UTM 56S');
  await page.waitForFunction(() => !document.querySelector('[data-crs-use]').disabled);
  ok(/EPSG:32756/.test(await page.textContent('[data-crs-msg]')), 'UTM 56S is found: ' + await page.textContent('[data-crs-msg]'));
  await shot('crs-01-dialog');
  await page.click('[data-crs-use]');
  await waitStatus(/is this model's coordinate system/);
  ok(!(await page.$(dlg)), 'the dialog closed');
  await page.click('[data-measure-crs]');
  await page.waitForSelector(dlg);
  ok(/WGS 84 \/ UTM zone 56S/.test(await page.textContent(dlg + ' [data-crs-current]')) && !!(await page.$('[data-crs-off]')), 'opened again: the choice is shown and can be taken off');

  console.log('== your own definition, checked and kept');
  await page.fill('[data-crs-q]', '+proj=foo');
  await page.waitForFunction(() => document.querySelector('[data-crs-msg]').classList.contains('bc-input-err'));
  ok(await page.isDisabled('[data-crs-use]'), 'a definition that cannot be built is refused and Use stays off');
  await page.fill('[data-crs-q]', 'Plant = +proj=tmerc +lat_0=0 +lon_0=153 +k=0.9996 +x_0=500000 +y_0=10000000 +ellps=GRS80 +units=m');
  await page.waitForFunction(() => !document.querySelector('[data-crs-use]').disabled);
  ok(/same coordinates as EPSG/.test(await page.textContent('[data-crs-msg]')), 'a definition equal to a listed system says so: ' + (await page.textContent('[data-crs-msg]')).slice(0, 110));
  await page.fill('[data-crs-q]', 'Plant = +proj=tmerc +lat_0=0 +lon_0=152.5 +k=0.9996 +x_0=500000 +y_0=10000000 +ellps=GRS80 +units=m');
  await page.waitForFunction(() => !document.querySelector('[data-crs-use]').disabled && !document.querySelector('.bc-crs-custom').hidden);
  await page.fill('[data-crs-name]', 'Plant half-degree grid');
  await page.click('[data-crs-keep]');
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.projections') || '[]'));
  ok(kept.length === 1 && kept[0].name === 'Plant half-degree grid' && kept[0].unit === 'm', 'kept in My projections (this browser): ' + JSON.stringify(kept.map((k) => k.name)));
  await shot('crs-02-custom');
  await page.click('[data-crs-use]');
  await page.waitForSelector('dialog[data-georef-choice][open]');   // 0.8 round 3: a model on the map asks what a new system should do
  await page.click('[data-georef-only]');
  await waitStatus(/Plant half-degree grid is this model/);

  console.log('== Measure › Location through the chosen system');
  const key = await page.evaluate(() => window.bimcraftKeys('W-101'));
  const spot = await page.evaluate((k) => {
    const v = document.querySelector('[data-canvas]').viewer, c = v.screenOf(k), R = v.canvas.getBoundingClientRect();
    for (let r = 0; r <= 240; r += 6) for (let a = 0; a < 360; a += r ? 15 : 360) {
      const x = c.x + r * Math.cos(a * Math.PI / 180), y = c.y + r * Math.sin(a * Math.PI / 180);
      if (x > R.left + 2 && x < R.right - 2 && y > R.top + 2 && y < R.bottom - 2 && document.elementFromPoint(x, y)?.matches('[data-canvas]') && v.hitAt(x, y)?.id === k) return { x, y };
    }
    return null;
  }, key);
  await page.evaluate(() => { document.querySelector('[data-status]').textContent = ''; });
  await page.mouse.click(spot.x, spot.y);
  await waitStatus(/^(Location found|Moving from)/, 30000);
  const st = await page.evaluate(() => window.bimcraftMeasure.state());
  const it = st.items[st.items.length - 1];
  const out = await page.textContent('[data-measure-out]');
  ok(it.lonlat && it.lonlat.every(Number.isFinite) && /Plant half-degree grid/.test(out), 'Location works for a file with no EPSG code: lon, lat ' + (it.lonlat || []).map((v) => v.toFixed(6)).join(', ') + ' in "Plant half-degree grid"');
  ok(it.lonlat[0] > 150 && it.lonlat[0] < 152.2, 'longitude follows the chosen central meridian (152.5), half a degree west of MGA 56: ' + it.lonlat[0].toFixed(5));
  await shot('crs-03-location');

  console.log('== take it off');
  await page.click('[data-measure-crs]');
  await page.waitForSelector(dlg);
  await page.click('[data-crs-off]');
  await waitStatus(/taken off|Se quitó|is taken off|choice is taken off/);
  await page.evaluate(() => { document.querySelector('[data-status]').textContent = ''; });
  await page.mouse.click(spot.x, spot.y);
  await waitStatus(/without an EPSG code/, 30000);
  ok(true, 'taken off: Location says again that the file names its system without an EPSG code');

  console.log('== Settings › Location › Choose another system…');
  await page.click('[data-settings-open]');
  await page.waitForSelector('dialog[data-app-settings][open]');
  await page.click('[data-settings-tab="app"]');
  await page.locator('dialog[data-app-settings]').getByText('Location', { exact: true }).first().click();
  await page.click('[data-bc-geo-more]');
  await page.waitForSelector('dialog[data-crs-pick="target"][open]');
  await page.fill('[data-crs-q]', 'UTM 33N');
  await page.waitForFunction(() => !document.querySelector('[data-crs-use]').disabled);
  await page.click('[data-crs-use]');
  await page.waitForFunction(() => document.querySelector('select[name="bcGeoCrs"]').value === '32633');
  await page.waitForFunction(() => /UTM zone 33N/.test(document.querySelector('select[name="bcGeoCrs"] option[data-geo-extra]')?.textContent || ''));
  ok(JSON.parse(await page.evaluate(() => localStorage.getItem('bimcraft.settings'))).geoCrs === '32633', 'the list shows "WGS 84 / UTM zone 33N (EPSG:32633)" and it is stored');
  await page.click('[data-bc-geo-more]');
  await page.waitForSelector('dialog[data-crs-pick="target"][open]');
  await page.click('[data-crs-mine-use]');
  await page.click('[data-crs-use]');
  const g = await page.evaluate(() => JSON.parse(localStorage.getItem('bimcraft.settings')).geoCrs);
  ok(/^my:/.test(g), 'one of My projections can be the Location system too (' + g + ')');
  await page.click('[data-bc-geo-more]');
  await page.waitForSelector('dialog[data-crs-pick="target"][open]');
  await page.click('[data-crs-mine-remove]');
  ok((await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.projections') || '[]'))).length === 0, 'removed from My projections');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.reload({ waitUntil: 'networkidle' });
  ok(true, 'reload with a removed "my:" system selected does not throw');
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'crs-error.png') }).catch(() => {});
}
ok(problems.length === 0, 'no console errors', problems.slice(0, 3).join(' | '));
await browser.close();
execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'down']);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

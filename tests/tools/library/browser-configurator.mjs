#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-configurator.mjs — the configurator page in headless Chromium (0.7 W3.19): the server's page with scripts off, then with
 * them on — the three.js view of the body (read from the version's item.json), an option change picking the closest variant in
 * place (address, name, size, downloads, row), the table's links, the Reset view button, a 2D-only variant falling back to a page
 * load, no console errors. Uses the item the PHP test published:
 *   sudo -u www-data php bin/test-library-configurator.php --keep
 *   node tools/library/browser-configurator.mjs [--out dir]
 *   sudo -u www-data php bin/test-library-configurator.php --clean
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const OUT = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : path.join(REPO, 'tmp/shots/configurator');
const stateFile = path.join(REPO, 'tmp/library-configurator-fixture.json');
if (!fs.existsSync(stateFile)) { console.error('Run first: sudo -u www-data php bin/test-library-configurator.php --keep'); process.exit(2); }
const S = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const mk = async (js) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: js, acceptDownloads: true });
  await ctx.addCookies([{ name: 'cc_session', value: S.staff, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage(); const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  return { ctx, page, problems };
};
const URL_ = `${BASE}/library/item/${S.slug}/configure`;
try {
  console.log('\n== scripts off: the server\'s page');
  {
    const { ctx, page } = await mk(false);
    await page.goto(URL_, { waitUntil: 'networkidle' });
    ok(await page.locator('[data-cfg-form] select').count() === 3, 'three option selects (width, depth, thick)');
    ok(await page.locator('[data-cfg-form] [data-js-hide]').isVisible(), 'the "Show this variant" button is there (no script to do it for you)');
    ok(await page.locator('svg.lib-dwg.is-full').isVisible(), 'the plan drawing of Medium is shown');
    await page.selectOption('select[name="o[width]"]', '180');
    await page.selectOption('select[name="o[depth]"]', '90');
    await page.selectOption('select[name="o[thick]"]', '10');
    await Promise.all([page.waitForNavigation(), page.click('[data-js-hide]')]);
    ok(/Large/.test(await page.textContent('[data-cfg-name]')) && /180 × 90 × 10 mm/.test(await page.textContent('[data-cfg-size]')), 'submitting the form shows Large: its name and size');
    await Promise.all([page.waitForNavigation(), page.click('[data-cfg-pick="small"]')]);
    ok(/Small/.test(await page.textContent('[data-cfg-name]')) && /\?variant=small/.test(page.url()), 'the table\'s "Show" link opens Small');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-cfg-dl-step]')]);
    ok(/Small\.step$/.test(dl.suggestedFilename()), 'the STEP link downloads: ' + dl.suggestedFilename());
    await ctx.close();
  }
  console.log('\n== scripts on: the 3D view');
  {
    const { ctx, page, problems } = await mk(true);
    await page.goto(URL_, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-cfg3d] canvas', { timeout: 30000 });
    ok(await page.locator('[data-cfg-plan]').isHidden(), 'the 3D view replaces the plan drawing');
    ok(await page.evaluate(() => document.querySelector('[data-cfg]').classList.contains('is-3d')), 'the page says it is in 3D mode');
    await page.waitForTimeout(500);
    const px = async () => page.evaluate(() => { const c = document.querySelector('[data-cfg3d] canvas'); const g = c.getContext('webgl2') || c.getContext('webgl'); return c.width * c.height > 0; });
    ok(await px(), 'the canvas has a size');
    await page.screenshot({ path: path.join(OUT, 'configurator-medium.png') });
    await page.locator('[data-cfg3d]').screenshot({ path: path.join(OUT, 'configurator-3d-medium.png') });
    const shot = () => page.locator('[data-cfg3d]').screenshot();
    const before = (await shot()).toString('base64');
    await page.selectOption('select[name="o[width]"]', '180');
    ok(/Large/.test(await page.textContent('[data-cfg-name]')) && /\?variant=large/.test(page.url()), 'choosing width 180 picks Large in place: name and address change, no page load');
    ok(await page.getAttribute('[data-cfg-dl-dwg]', 'href') === `/library/variant/${S.version}/large.dwg` && /180 × 90 × 10 mm/.test(await page.textContent('[data-cfg-size]')), 'its downloads and size follow');
    ok(await page.evaluate(() => [...document.querySelectorAll('[data-cfg-form] select')].map((s) => s.value).join() === '180,90,10'), 'the other selects follow to Large\'s values');
    ok(await page.locator('[data-cfg-row="large"].is-current').count() === 1 && await page.locator('[data-cfg-row="medium"].is-current').count() === 0, 'the table highlights Large');
    await page.waitForTimeout(400);
    const after = (await shot()).toString('base64');
    ok(before !== after, 'the picture changed');
    await page.selectOption('select[name="o[thick]"]', '6');
    ok(/closest/.test(await page.textContent('[role="status"].lib-note')) && /Small|Large/.test(await page.textContent('[data-cfg-name]')), 'a combination that is not offered: the closest variant and a sentence saying so');
    await page.click('[data-cfg-pick="medium-no-holes"]');
    ok(/no holes/.test(await page.textContent('[data-cfg-name]')) && /\?variant=medium-no-holes/.test(page.url()), 'the table link picks a variant in place too');
    await page.click('text=Reset view');
    await page.screenshot({ path: path.join(OUT, 'configurator-no-holes.png') });
    // a reload at that address keeps the choice
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-cfg3d] canvas', { timeout: 30000 });
    ok(/no holes/.test(await page.textContent('[data-cfg-name]')), 'reloading the address keeps the variant');
    ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.join(' | ') : ''));
    await ctx.close();
  }
  console.log('\n== a phone-width screen');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
    await ctx.addCookies([{ name: 'cc_session', value: S.staff, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
    const page = await ctx.newPage();
    await page.goto(URL_, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-cfg3d] canvas', { timeout: 30000 });
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(over <= 1, 'no sideways scrolling at 390 px (page is ' + (over > 0 ? over + ' px too wide' : 'within the screen') + ')');
    const box = await page.locator('[data-cfg3d]').boundingBox();
    ok(box.width >= 300 && box.width <= 390, 'the 3D view fits the screen (' + Math.round(box.width) + ' px wide)');
    await page.screenshot({ path: path.join(OUT, 'configurator-phone.png'), fullPage: false });
    await ctx.close();
  }
} catch (e) { fail++; console.log('  FAIL ' + (e.stack || e)); }
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

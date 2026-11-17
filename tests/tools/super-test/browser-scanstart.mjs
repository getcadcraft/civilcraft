// SPDX-License-Identifier: Apache-2.0
// Super 0.1: Start from a scan in the Layout workspace (lib/scanstart through the Site view's engine) — the tool is in Layout's tool set
// and runs the engine's own command; a scan opened in Layout goes to the Site view and opens the dialog; a PDF opened in Layout does too.
// Served like browser.mjs (tools/super-test/serve.mjs: no sign-in, no database).
//   node tools/super-test/browser-scanstart.mjs
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { ROOT, start, launch } from './serve.mjs';
import { writePng } from '../../lib/raster/index.js';
const { url: URL0, close } = await start();
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + d + ')' : '')); } };

// a small black-and-white sheet with a box on it
const W = 400, H = 300, data = new Uint8Array(W * H).fill(255);
for (let y = 80; y <= 220; y++) for (let x = 100; x <= 300; x++) if (y < 83 || y > 217 || x < 103 || x > 297) data[y * W + x] = 0;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-scan-'));
const png = path.join(tmp, 'site-plat.png');
fs.writeFileSync(png, await writePng({ w: W, h: H, channels: 1, data }, { dpi: { x: 100, y: 100 } }));

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource|bad HTTP response code/.test(m.text())) errors.push(m.text()); });
const ws = (id) => page.click(`.sc-wstab[data-ws="${id}"]`);
const dialogOpen = () => page.waitForSelector('[data-scanin-dialog][open]', { timeout: 40000 }).then(() => true).catch(() => false);
const cancel = async () => { await page.click('[data-scanin-dialog][open] .cv-dlg-foot .btn-line'); await page.waitForTimeout(300); };

try {
  await page.evaluate(() => localStorage.removeItem('cc-super-window')).catch(() => {});
  await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  ok(await page.evaluate(() => window.superWindow.catalog.tools.some((t) => t.key === 'civilcraft:surface.scan-start')), 'the catalog has Start from a scan (from the site engine\'s registry)');

  console.log('== a scan opened in Layout');
  await ws('layout');
  await page.setInputFiles('[data-sc-open-input]', png);
  ok(await dialogOpen(), 'a PNG opened in Layout opens Start from a scan in the Site view');
  ok(/site-plat\.png/.test(await page.textContent('[data-scanin-dialog][open] h2')), '... for that file');
  ok(await page.evaluate(() => window.superWindow.ctx().view) === 'civil', 'the Site view is in front', await page.evaluate(() => window.superWindow.ctx().view));
  await cancel();
  ok(!(await page.$('[data-scanin-dialog][open]')), 'Cancel closes it, nothing placed');
  ok(await page.evaluate(() => (window.civilcraft.project.state.gis?.maps || []).length) === 0, '... no map layer');

  console.log('== the tool in Layout');
  const tool = await page.$('.sc-tool[data-key="civilcraft:surface.scan-start"]');
  ok(!!tool, 'Layout\'s tool set lists it');
  if (tool) {
    await tool.click();
    ok(await page.waitForSelector('[data-scanin-source-dialog][open]', { timeout: 20000 }).then(() => true).catch(() => false), 'clicking Scan asks where the sheet comes from (the engine\'s own command)');
    ok(await page.isDisabled('[data-scanin-src="scanner"]'), '... a scanner only with Studio on a computer');
    const [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 20000 }), page.click('[data-scanin-src="file"]')]);
    ok(!!fc, '"A photo or PDF file" asks for the file');
    await fc.setFiles(png);
    ok(await dialogOpen(), 'and opens the dialog');
    // place it: two points 200 px apart are 50 ft
    await page.click('[data-scanin-mode-btn="stated"]');
    ok(await page.inputValue('[data-scanin-dpi]') === '100', 'the dpi comes from the file');
    await page.fill('[data-scanin-stated]', '20');
    await page.click('[data-scanin-go]');
    await page.waitForFunction(() => window.civilcraft.gis?.scan?.last, null, { timeout: 30000 });
    const m = await page.evaluate(() => window.civilcraft.project.state.gis.maps.at(-1));
    ok(m && Math.abs(m.a1 - 0.2) < 1e-6 && m.scanPlaced === 'stated', 'placed at its printed scale (1 in = 20 ft at 100 dpi = 0.2 ft a pixel)', JSON.stringify(m || {}).slice(0, 200));
    ok(m.scanState === 'drawn', 'converted into a drawing by default');
    ok(await page.isVisible(`[data-panel="civil"] [data-scan="${m.id}"]`), 'the Site panel lists the scan, waiting for keep or remove');
    if (process.env.SC_SHOT) { await page.waitForTimeout(400); await page.screenshot({ path: process.env.SC_SHOT.replace(/\.png$/, '-list.png') }); }
    await page.click(`[data-scan-keep="${m.id}"]`);
    ok(await page.getAttribute(`[data-scan="${m.id}"]`, 'data-scan-state') === 'kept', 'Keep the scan, inside SuperCad Studio');
  }
} catch (e) {
  ok(false, 'ran to the end', e.stack || e.message);
} finally {
  ok(errors.length === 0, 'no page errors', errors.slice(0, 4).join(' | '));
  await browser.close(); await close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

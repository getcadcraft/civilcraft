#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-uk-shop.mjs — UK sections and the whole shop drawing set in the real app (0.9 SU.1192, SU.1193): the picker lists every UK family; Shop drawing opens with nothing selected, holds one sheet per part mark, saves one sheet or all in one PDF, no console errors. //iles of the parts (uploaded, never
 * started), says what happened; no console errors. The dialog here is a stand-in for studio_PART_3's.
 *
 *   node tools/detailcraft-test/browser-uk-shop.mjs [--shots <dir>]
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
const lab = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' })).cookie.split('=');   // a signed-in lab session: no password login (the sign-in is throttled for everyone at once)
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true })).newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const dc = (fn, arg) => page.evaluate(fn, arg);
const row = (id) => page.locator(`[data-props] [data-pg-row="${id}"]`);
const footing = () => dc(() => { const f = window.detailcraft.model.state.footings[0]; return JSON.parse(JSON.stringify(f)); });

try {
  await page.context().addCookies([{ name: lab[0], value: lab.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await page.goto(`${BASE}/lab/detailcraft?space=paper`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.detailcraft, null, { timeout: 15000 });
  const names = ['UB305x165x40', 'UC203x203x46', 'PFC200x90x30', 'EA100x100x10.0', 'UEA150x90x10.0', 'SHS100x100x5.0', 'RHS200x100x8.0', 'CHS88.9x5.0', 'CFRHS200x100x8.0'];
  await dc((names) => {
    const m = window.detailcraft.model;
    m.change('UK', (tx) => names.forEach((profile, i) => {
      const id = tx.addMember({ type: 'beam', profile, start: [0, i * 1500, 3000], end: [4000 + i * 300, i * 1500, 3000] });
      if (['UB305x165x40', 'PFC200x90x30', 'RHS200x100x8.0'].includes(profile)) { tx.addHole(id, { face: 'web', x: 400, y: 40, d: 22 }); tx.addHole(id, { face: 'web', x: 400, y: -40, d: 22 }); tx.addHole(id, { face: 'top', x: 1200, y: 20, d: 18 }); }
    }));
    window.detailcraft.select?.(null);
  }, names);
  await page.waitForTimeout(400);
  const before = await dc(() => window.detailcraft.built?.parts?.length ?? null);
  const disabled = await page.evaluate(() => document.querySelector('[data-act="shop"]')?.disabled);
  ok(disabled === false, 'Shop drawing is on with nothing selected');
  await page.evaluate(() => document.querySelector('[data-act="shop"]').click());
  await page.waitForSelector('[data-shop][open]');
  const options = await page.$$eval('[data-shop-sheet] option', (o) => o.map((x) => x.textContent));
  ok(options.length >= names.length && names.every((n) => options.some((o) => o.includes(n))), options.length + ' part marks in the list, every UK section there');
  ok(/Download all \(\d+ sheets\)/.test(await page.textContent('[data-shop-all]')), 'the all-sheets button says how many');
  for (const n of ['UB305x165x40', 'PFC200x90x30', 'UEA150x90x10.0', 'RHS200x100x8.0', 'CHS88.9x5.0']) {
    const i = options.findIndex((o) => o.includes(n));
    await page.selectOption('[data-shop-sheet]', String(i));
    await page.waitForTimeout(150);
    ok((await page.textContent('[data-shop-note]')).includes(n), 'choosing ' + n + ' shows its sheet');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'shop-' + n.replace(/[^\w]/g, '_') + '.png') });
  }
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-shop-all]')]);
  const file = path.join(SHOTS || fs.mkdtempSync('/tmp/uk-shop-'), 'all.pdf');
  await dl.saveAs(file);
  const pages = Number((execFileSync('pdfinfo', [file], { encoding: 'utf8' }).match(/Pages:\s+(\d+)/) || [])[1]);
  ok(pages === options.length, 'the PDF has ' + pages + ' pages, one per mark');
  ok(/\.pdf$/.test(dl.suggestedFilename()) && /Shop drawings/.test(dl.suggestedFilename()), 'named ' + dl.suggestedFilename());
  await page.selectOption('[data-shop-paper]', 'A4');
  await page.waitForTimeout(150);
  ok(/A4/.test(await page.textContent('[data-shop-note]')), 'changing the sheet size remakes the set');
  await page.selectOption('[data-shop-paper]', 'A3');
  await page.click('[data-shop-close]');
  ok(!problems.length, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
} catch (e) { fail++; console.log('  FAIL ' + e.message); if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'error.png') }).catch(() => {}); }
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

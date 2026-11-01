#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-congestion.mjs — DetailCraft's Congestion tab in the real app (0.8 round 2, EG.74): two footings, one with tight #8 mats; the
 * heat maps draw, the tight one is flagged and lands in Problems, an aggregate size raises the need, no console errors.
 *
 *   node tools/detailcraft-test/browser-congestion.mjs [--shots <dir>]
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
const lab = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' })).cookie.split('=');   // a signed-in lab session: no password login (that sign-in is throttled for every test at once)
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const dc = (fn, arg) => page.evaluate(fn, arg);
const row = (id) => page.locator(`[data-props] [data-pg-row="${id}"]`);
const footing = () => dc(() => { const f = window.detailcraft.model.state.footings[0]; return JSON.parse(JSON.stringify(f)); });

try {
  await page.context().addCookies([{ name: lab[0], value: lab.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(`${BASE}/lab/detailcraft?space=paper`, { waitUntil: 'networkidle' });
  await dc(() => { const m = window.detailcraft.model; m.change('t', (tx) => {
    tx.addFooting({ x: 0, y: 0, top: 0, L: 1500, B: 1500, H: 500 });
    tx.addFooting({ x: 4000, y: 0, top: 0, L: 800, B: 800, H: 500, mat: { barX: '#8', sX: 50, barY: '#8', sY: 50, cover: 75, hooks: false }, starters: { on: false } }); }); });
  await page.click('[data-tab="congestion"]');
  await page.waitForSelector('canvas[data-cong-map]');
  ok(await page.locator('canvas[data-cong-map]').count() === 2, 'one map per footing');
  const worst = await page.$$eval('canvas[data-cong-map]', (c) => c.map((x) => Number(x.dataset.worst)));
  ok(worst[0] < 1 && worst[1] > 1, 'the normal footing is fine (' + worst[0] + '), the #8-at-50 mat is flagged (' + worst[1] + ')');
  const inked = await page.$eval('canvas[data-cong-map]', (c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; });
  ok(inked > 1000, 'the map is drawn (' + inked + ' cells)');
  const left = await dc(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => /^cong\./.test(p.code || '')).length : -1));
  ok(left === 1, 'the shell\'s Problems lists the tight footing (' + left + ')');
  const agg = page.locator('[data-report] .dc-props input').first();
  await agg.fill('38'); await agg.press('Tab');
  await page.waitForTimeout(300);
  const worst2 = await page.$$eval('canvas[data-cong-map]', (c) => c.map((x) => Number(x.dataset.worst)));
  ok(worst2[0] > worst[0], 'a 38 mm aggregate makes the normal footing tighter (' + worst[0] + ' → ' + worst2[0] + ')');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'detailcraft-congestion.png') });
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

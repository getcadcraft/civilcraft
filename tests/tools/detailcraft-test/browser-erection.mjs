#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-erection.mjs — DetailCraft's Erection tab in the real app (0.8 round 2, EG.72): the sample frame, a crane typed into the
 * chart box, the lifts table, the movie file saved, Problems for a chart that is too small, no console errors.
 *
 *   node tools/detailcraft-test/browser-erection.mjs [--shots <dir>]
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
  await dc(() => window.detailcraft.act('sample'));
  await page.click('[data-tab="erection"]');
  ok(await page.locator('[data-erect-none]').count() === 1, 'no crane: the panel says to enter one');
  await page.click('[data-crane-add]');
  const chart = page.locator('[data-crane-chart="0"]');
  await chart.waitFor();
  await chart.fill('6 8000\n10 5000\n14 3000\n20 1500'); await chart.press('Tab');
  await page.waitForSelector('[data-erect-table] tbody tr');
  const rows = await page.locator('[data-erect-table] tbody tr').count();
  ok(rows > 5, 'the lifts table lists ' + rows + ' lifts');
  ok(/lifts/.test(await page.textContent('[data-erect-summary]')), 'the summary line');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-erect-movie]')]);
  const f = await dl.path(); const html = fs.readFileSync(f, 'utf8');
  ok(/erection\.html$|\.html$/.test(dl.suggestedFilename()) && html.includes('cadcraft-erection'), 'the movie file downloads (' + Math.round(html.length / 1024) + ' KB)');
  await chart.fill('6 100'); await chart.press('Tab');
  await page.waitForTimeout(300);
  ok(await page.locator('[data-erect-table] tbody tr.is-over, [data-erect-table] tbody tr.is-out').count() > 0, 'a chart of 100 kg puts lifts over the chart');
  const probs = await dc(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => /^erect/.test(p.code || '')).length : -1));
  ok(probs > 0, 'the shell\'s Problems carries them (' + probs + ')');
  await dc(() => window.detailcraft.act('undo'));
  await page.waitForTimeout(200);
  ok(await page.locator('[data-crane-chart="0"]').inputValue() === '6 8000\n10 5000\n14 3000\n20 1500', 'Undo puts the chart back');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'detailcraft-erection.png') });
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

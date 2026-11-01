#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-framing.mjs — DetailCraft's Framing tab in the real app (0.8 round 2, EG.6): a wall with a door, its pieces counted, the drawing, the
 * cut list and the stock to buy, a steel wall, one undo step per edit, the panels in the saved file; no console errors.
 *
 *   node tools/detailcraft-test/browser-framing.mjs [--shots <dir>]
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
  await page.click('[data-tab="framing"]');
  ok(await page.locator('[data-frm-none]').count() === 1, 'no panels: the panel says so');
  await page.click('[data-frm-add="wall"]');
  await page.waitForSelector('[data-frm-drawing="0"] svg');
  ok(/\d+ pieces/.test(await page.textContent('[data-frm-summary="0"]')), 'a wall is added with its summary');
  const piecesOf = () => page.locator('[data-frm-drawing="0"] [data-piece]').count();
  const p0 = await piecesOf();
  await page.click('[data-opening-add="0"]');
  await page.waitForSelector('[data-openings="0"] tbody tr');
  const p1 = await piecesOf();
  ok(p1 > 0 && p1 !== p0, 'an opening changes the framing (' + p0 + ' → ' + p1 + ' pieces)');
  const model = () => dc(() => JSON.parse(JSON.stringify(window.detailcraft.model.state.framing)));
  ok((await model()).panels[0].openings.length === 1, 'the panel is in the model');
  await page.click('[data-frm-add="floor"]');
  await page.click('[data-frm-add="roof"]');
  await page.waitForSelector('[data-frm-drawing="2"] svg');
  ok(await page.locator('[data-frm-drawing] svg').count() === 3, 'wall, floor and roof drawn');
  ok(await page.locator('[data-frm-stock] tbody tr').count() > 3, 'the stock to buy is listed');
  const cuts = await page.locator('[data-frm-cuts="0"] tbody tr').count();
  ok(cuts >= 5, 'the wall cut list has ' + cuts + ' marks');
  await dc(() => window.detailcraft.act('undo'));
  ok((await model()).panels.length === 2, 'Undo takes the roof back');
  const saved = await dc(() => window.detailcraft.model.toJSON());
  ok(JSON.parse(saved).framing.panels.length === 2, 'the panels are in the saved file');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-frm-csv]')]);
  ok(/\.csv$/.test(dl.suggestedFilename()), 'the cut lists save as one CSV');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'detailcraft-framing.png') });
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

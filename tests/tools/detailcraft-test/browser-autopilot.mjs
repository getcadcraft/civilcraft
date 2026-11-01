#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-autopilot.mjs — DetailCraft's Autopilot tab in the real app (0.8 round 2, EG.73): an empty frame of two columns and a beam,
 * the proposal table, an end shear that does not fit (left for the person, in Problems), Add them all as one undo step, no console errors.
 *
 *   node tools/detailcraft-test/browser-autopilot.mjs [--shots <dir>]
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
  await dc(() => { const m = window.detailcraft.model; m.change('t', (tx) => { for (const x of [0, 6000]) tx.addMember({ type: 'column', profile: 'W10x49', start: [x, 0, 0], end: [x, 0, 4000] }); tx.addMember({ type: 'beam', profile: 'W16x26', start: [0, 0, 4000], end: [6000, 0, 4000] }); }); });
  await page.click('[data-tab="autopilot"]');
  await page.waitForSelector('[data-auto-table] tbody tr');
  ok(await page.locator('[data-auto-table] tbody tr').count() === 4, 'four proposals: two base plates, two shear tabs');
  const n0 = await dc(() => window.detailcraft.model.state.connections.length);
  ok(n0 === 0, 'nothing is added by looking');
  const uni = page.locator('[data-report] .dc-props input').first();
  await uni.fill('1000'); await uni.press('Tab');
  await page.waitForSelector('[data-auto-table] tr.is-hard');
  ok(await page.locator('[data-auto-table] tr.is-hard').count() === 2, '1000 kN/m: both beam ends are left for the person');
  const left = await dc(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => /^auto\./.test(p.code || '')).length : -1));
  ok(left === 2, 'the shell\'s Problems lists them (' + left + ')');
  await page.locator('[data-report] .dc-props input').first().fill('30'); await page.locator('[data-report] .dc-props input').first().press('Tab');
  await page.waitForTimeout(200);
  await page.click('[data-auto-apply]');
  const n1 = await dc(() => window.detailcraft.model.state.connections.length);
  ok(n1 === 4, 'Add them all: 4 connections (' + n1 + ')');
  await dc(() => window.detailcraft.act('undo'));
  ok(await dc(() => window.detailcraft.model.state.connections.length) === 0, 'one undo takes them all back');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'detailcraft-autopilot.png') });
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

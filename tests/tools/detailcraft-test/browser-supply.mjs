#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-supply.mjs — the Supply tab in the real app (0.8 round 3, EG.51): a supplier CSV added to a small frame, the cut list's bars against its stock and
 * lead times, a short section in the shell's Problems, the rows kept in the model file; no console errors.
 *
 *   node tools/detailcraft-test/browser-supply.mjs [--shots <dir>]
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
  await page.waitForFunction(() => window.detailcraft, null, { timeout: 15000 });
  await dc(() => { const m = window.detailcraft.model; m.change('x', (tx) => {
    for (const x of [0, 6000, 12000]) tx.addMember({ type: 'column', profile: 'W10x49', material: 'A992', position: 'middle', rotation: 0, start: [x, 0, 0], end: [x, 0, 4000], phase: 1 });
    tx.addMember({ type: 'beam', profile: 'W16x26', material: 'A992', position: 'middle', rotation: 0, start: [0, 0, 4000], end: [6000, 0, 4000], phase: 1 });
    tx.addMember({ type: 'beam', profile: 'W16x26', material: 'A992', position: 'middle', rotation: 0, start: [6000, 0, 4000], end: [12000, 0, 4000], phase: 1 }); }); });
  await page.click('[data-tab="supply"]');
  await page.waitForSelector('[data-supply-none]');
  ok(true, 'no file yet: the tab says so');
  const csv = 'Item,SKU,Unit,In stock,Lead time,Supplier\nW16x26 12m,A1,ea,4,2 days,North yard\nW10x49 12m,A2,ea,,3 weeks,North yard\n';
  fs.writeFileSync('/tmp/claude-0/dc-supply.csv', csv);
  await page.setInputFiles('[data-supply-file]', '/tmp/claude-0/dc-supply.csv');
  await page.waitForSelector('[data-supply-rows] tbody tr');
  const rows = await page.$$eval('[data-supply-rows] tbody tr', (r) => r.map((x) => ({ name: x.dataset.supplyRow, st: x.dataset.status, text: x.textContent })));
  ok(rows.length === 2, 'both sections are looked up: ' + rows.map((r) => r.name + ' ' + r.st).join(', '));
  const w10 = rows.find((r) => /W10/i.test(r.name)), w16 = rows.find((r) => /W16/i.test(r.name));
  ok(w16 && w16.st === 'ok', 'W16x26: covered');
  ok(w10 && w10.st === 'late', 'W10x49: no stock figure and 21 days away: over the 14 you accept (' + (w10 && w10.st) + ')');
  // a second look with a stricter wait
  const lim = page.locator('[data-supply-limit]');
  await lim.fill('30'); await lim.press('Tab');
  await page.waitForFunction(() => document.querySelector('[data-supply-row]') && [...document.querySelectorAll('[data-supply-row]')].every((r) => r.dataset.status !== 'late'));
  ok(true, 'with 30 days accepted, nothing is late (the unknown stock stays "no stock figure")');
  await lim.fill('14'); await lim.press('Tab');
  const probs = await dc(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => /^supply\./.test(p.code || '')).map((p) => p.code) : []));
  ok(probs.includes('supply.lead'), 'the late section is in the shell\'s Problems: ' + probs.join(','));
  const kept = await dc(() => { const m = window.detailcraft.model; m.load(m.toJSON()); return m.state.supply && m.state.supply.sources[0].rows.length; });
  ok(kept === 2, 'the supplier rows are in the saved model file');
  await dc(() => window.detailcraft.model.undo());
  ok(await dc(() => window.detailcraft.model.canUndo) !== undefined, 'every change is an undo step');
  fs.unlinkSync('/tmp/claude-0/dc-supply.csv');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'detailcraft-supply.png') });
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

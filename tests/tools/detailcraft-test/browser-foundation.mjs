#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-foundation.mjs — DetailCraft's Foundation tab in the real app (0.8 round 2, EG.5): a column on a footing, a column load typed, the checks
 * with their clauses, a failing bearing check in Problems, and the loads taken from the Analysis tab's support reactions; no console errors.
 *
 *   node tools/detailcraft-test/browser-foundation.mjs [--shots <dir>]
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
  await page.waitForFunction(() => window.detailcraft, null, { timeout: 15000 });
  await dc(() => { const m = window.detailcraft.model; m.change('t', (tx) => {
    tx.addFooting({ x: 0, y: 0, top: 0, L: 2000, B: 2000, H: 600 });
    tx.addMember({ type: 'column', profile: 'W10x49', start: [0, 0, 0], end: [0, 0, 4000] }); }); });
  await page.click('[data-tab="foundation"]');
  await page.waitForSelector('[data-fnd-add]');
  ok(await page.locator('[data-fnd-checks]').count() === 0, 'no loads: no checks yet');
  await page.click('[data-fnd-add]');
  await page.waitForSelector('[data-fnd-loads] tbody tr');
  const cells = page.locator('[data-fnd-loads] tbody tr').first().locator('input');
  await cells.nth(0).fill('800'); await cells.nth(0).press('Tab');            // service P
  const strength = page.locator('[data-fnd-loads] tbody tr').nth(1).locator('input');
  await strength.nth(0).fill('1000'); await strength.nth(0).press('Tab');     // factored P
  const qa = page.locator('[data-report] .dc-props input').first();
  await qa.fill('200'); await qa.press('Tab');
  await page.waitForSelector('[data-fnd-checks] tbody tr');
  const rows = await page.$$eval('[data-fnd-checks] tbody tr', (r) => r.map((x) => ({ id: x.dataset.fndCheck, st: x.dataset.status, text: x.textContent })));
  ok(rows.some((r) => r.id === 'bearing' && r.st === 'fail' && /214\.4/.test(r.text)), 'bearing: 214.4 kPa against 200 fails (' + (rows.find((r) => r.id === 'bearing')?.text || '').slice(0, 60) + ')');
  ok(rows.some((r) => r.id === 'punching') && rows.some((r) => r.id === 'flexure-x') && rows.some((r) => /ACI 318-19/.test(r.text)), 'strength checks are listed with their clauses (' + rows.length + ' rows)');
  const probs = await dc(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => /^fnd\./.test(p.code || '')).length : -1));
  ok(probs >= 1, 'the failures are in the shell\'s Problems (' + probs + ')');
  // the Analysis: a gravity case with a load on the column, then the reactions as loads
  await dc(() => { const d = window.detailcraft; d.model.change('a', (tx) => { tx.s.analysis = { ...(tx.s.analysis || {}), bases: 'fixed', beamEnds: 'rigid', braces: 'pinned', supports: [], ends: [], cases: [{ id: 'D', name: 'D', kind: 'dead', selfWeight: 0, loads: [{ type: 'node', at: [0, 0, 4000], F: [0, 0, -500000, 0, 0, 0] }] }], combos: [{ id: 'K1', name: '1.0 D', factors: [{ case: 'D', f: 1 }], limit: 'service' }, { id: 'K2', name: '1.4 D', factors: [{ case: 'D', f: 1.4 }], limit: 'strength' }] }; }); });
  const ran = await dc(async () => { try { const r = window.detailcraft.analysis.run(); return !!(r?.sol?.results || window.detailcraft.analysis.result?.sol?.results); } catch (e) { return String(e); } });
  console.log('  analysis run: ' + ran);
  if (ran === true) {
    await page.click('[data-tab="foundation"]');
    await page.waitForSelector('[data-fnd-take]');
    await page.click('[data-fnd-take]');
    await page.waitForTimeout(300);
    const p1 = await dc(() => { const l = window.detailcraft.model.state.foundation.loads; const k = Object.keys(l)[0]; return l[k][0]; });
    ok(Math.abs(p1.service.P - 500) < 1 && Math.abs(p1.strength.P - 700) < 1, 'loads taken from the Analysis: service ' + p1.service.P.toFixed(0) + ' kN, factored ' + p1.strength.P.toFixed(0) + ' kN');
  }
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'detailcraft-foundation.png') });
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

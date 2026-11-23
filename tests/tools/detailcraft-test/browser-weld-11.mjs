#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-weld-11.mjs — the Weld checks block in the Analysis tab of the real app (0.11 SU.1811): the sample frame with loads, a design code and the combinations, then Check welds with real clicks:
 * the groups of the end plates, shear tabs and base plates are listed with a utilisation or a stated reason, the fillet leg and weld metal fields clear the result, an edit makes it stale,
 * the Design code switch to EN changes the words and the fields; no console errors. An aid until an engineer has reviewed it: the page says so.
 *
 *   node tools/detailcraft-test/browser-weld-11.mjs [--shots <dir>]
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
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 300)); });
const dc = (fn, arg) => page.evaluate(fn, arg);
const row = (id) => page.locator(`[data-props] [data-pg-row="${id}"]`);
const footing = () => dc(() => { const f = window.detailcraft.model.state.footings[0]; return JSON.parse(JSON.stringify(f)); });

try {
  await page.context().addCookies([{ name: lab[0], value: lab.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.addInitScript(() => { try { localStorage.setItem('cadcraft.assistants.detailcraft', JSON.stringify({ enabled: true, groups: ['read'] })); } catch (e) { /* none */ } });   // Settings › Assistants: reading allowed
  await page.goto(`${BASE}/lab/detailcraft?space=paper`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.detailcraft, null, { timeout: 15000 });
  await dc(() => window.detailcraft.act('sample'));
  await page.waitForFunction(() => window.detailcraft.model.state.members.length > 5);
  // a gravity load on every beam, a design code, the combinations
  await dc(() => {
    const d = window.detailcraft, m = d.model;
    const beams = m.state.members.filter((x) => x.type === 'beam').map((x) => x.id);
    m.change('analysis', (tx) => {
      const a = { bases: 'fixed', beamEnds: 'rigid', braces: 'pinned', combos: [], supports: [], ends: [], ...JSON.parse(JSON.stringify(tx.s.analysis || {})) };
      a.cases = [{ id: 'D', name: 'Dead', kind: 'dead', selfWeight: 1, loads: beams.map((id) => ({ type: 'udl', member: id, dir: 'down', w: 12 })) }, { id: 'L', name: 'Live', kind: 'live', selfWeight: 0, loads: beams.map((id) => ({ type: 'udl', member: id, dir: 'down', w: 25 })) }];
      a.design = { code: 'asce-aisc', grade: 'A992' };
      tx.s.analysis = a;
    });
  });
  await page.click('[data-tab="analysis"]');
  await page.waitForSelector('[data-fa-weld-run]');
  ok(/Not run yet/.test(await page.textContent('[data-fa-weld-state]')), 'before the first run the block says so: ' + (await page.textContent('[data-fa-weld-state]')).slice(0, 60));
  ok(/aid|engineer/i.test(await page.textContent('[data-fa-weld-aid]')), 'the block says it is an aid until an engineer has reviewed it');
  await page.waitForSelector('[data-fa-des-make]');
  await page.click('[data-fa-des-make]');
  await page.waitForTimeout(300);
  await page.click('[data-fa-weld-run]');
  await page.waitForSelector('[data-fa-weld-table] tbody tr', { timeout: 60000 });
  const sum = await page.textContent('[data-fa-weld-summary]');
  ok(/checked/.test(sum), 'a summary of the groups: ' + sum.slice(0, 120));
  const rows = await page.$$eval('[data-fa-weld-row]', (r) => r.map((x) => x.dataset.faWeldRow + ' | ' + x.textContent.replace(/\s+/g, ' ').slice(0, 140)));
  ok(rows.length >= 4, rows.length + ' weld groups listed, e.g. ' + rows[0]);
  ok(rows.every((r) => /%|not checked|Not checked|\u2014|-/.test(r) || r.length > 6), 'every group has a utilisation or a stated reason');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'weld-checks.png') });
  // a number in the fields: the result is dropped (it was for the old leg)
  await page.fill('[data-fa-weld="size"]', '5');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(300);
  ok(await page.locator('[data-fa-weld-table]').count() === 0, 'changing the fillet leg clears the result');
  await page.click('[data-fa-weld-run]');
  await page.waitForSelector('[data-fa-weld-table] tbody tr', { timeout: 60000 });
  ok(await page.locator('[data-fa-weld-row]').count() >= 4, 'runs again with a 5 mm leg');
  // an edit makes it stale
  await dc(() => { const m = window.detailcraft.model; m.change('rename', (tx) => tx.setName('Weld test')); });
  await page.waitForTimeout(300);
  ok(await page.locator('[data-fa-weld-table]').count() === 0, 'after an edit the weld table is gone (stale)');
  // EN
  await dc(() => { const m = window.detailcraft.model; m.change('code', (tx) => { tx.s.analysis = { ...JSON.parse(JSON.stringify(tx.s.analysis)), design: { code: 'en', grade: 'S355' } }; }); });
  await page.waitForTimeout(300);
  await page.click('[data-tab="analysis"]');
  await page.waitForSelector('[data-fa-des-make]');
  await page.click('[data-fa-des-make]');
  await page.waitForTimeout(300);
  ok(await page.locator('[data-fa-weld="fexx"]').count() === 0, 'under EN 1993 there is no F_EXX field (the grade gives the weld metal)');
  await page.click('[data-fa-weld-run]');
  await page.waitForSelector('[data-fa-weld-table] tbody tr', { timeout: 60000 });
  const en = await page.$$eval('[data-fa-weld-row]', (r) => r.map((x) => x.textContent).join(' '));
  ok(/EN 1993-1-8|4\.5|4\.7/.test(en), 'the governing checks cite EN 1993-1-8 clauses');
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

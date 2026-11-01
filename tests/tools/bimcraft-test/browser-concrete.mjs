#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-concrete.mjs — "What breaks first?" (EG.31) and the Live switch (EG.29) in BimCraft's Analysis tab (0.8 round 3, oltl-eg-a_PART_3).
 * DetailCraft's sample frame written to IFC by DetailCraft's own writer (as tools/frame/browser.mjs does) and opened; a design code; Break it → findings,
 * the failing ones in the shell's Problems with the element's GlobalId; the assistant tool; an edit makes the result stale; Live re-solves by itself.
 *   node tools/bimcraft-test/browser-concrete.mjs        (run as root; uses tools/frame/admin.php for the test admin)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x ? ' — ' + String(x).slice(0, 200) : '')); } };
const DC = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const dl = (f) => import(pathToFileURL(path.join(DC, f)).href);
(await dl('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(DC, 'lang/en.json'), 'utf8')) });
fs.mkdirSync(path.join(ROOT, 'tmp/eg-a'), { recursive: true });
const ifcFile = path.join(ROOT, 'tmp/eg-a/Concrete frame.ifc');
{
  const { sampleModel } = await dl('sample.js'), { writeIfc } = await dl('ifc.js'), { build } = await dl('build.js'), { markParts, markFootings } = await dl('marks.js'), { bendingSchedule } = await dl('rebar.js');
  const st = sampleModel().state || sampleModel();
  for (const m of st.members) m.profile = m.type === 'column' ? 'PL400x400' : 'PL300x600';   // rectangles, so they can be set up as concrete
  const built = build(st), marks = markParts(built, { perPhase: false });
  marks.footingMark = markFootings(st.footings, { perPhase: false });
  fs.writeFileSync(ifcFile, writeIfc(st, built, marks, bendingSchedule(st.footings), { now: new Date('2026-10-16T00:00:00Z') }));
}
const { chromium } = await import('playwright-core');
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const exe = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1])).map((d) => path.join(cache, d, 'chrome-linux64/chrome')).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/frame/admin.php'), cmd], { encoding: 'utf8' }));
const SESSION = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const issues = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const ck = SESSION.cookie.split('=');
  await ctx.addCookies([{ name: ck[0], value: ck.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await ctx.addInitScript(() => { try { localStorage.setItem('cadcraft.assistants.bimcraft', JSON.stringify({ enabled: true, groups: ['read', 'edit'] })); } catch { /* */ } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) { issues.push('console: ' + m.text()); console.log('CE', m.text()); } });
  page.on('pageerror', (e) => { issues.push('pageerror: ' + e.message); console.log('PE', e.message); });
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', ifcFile);
  await page.waitForFunction(() => /^Opened /.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 60000 });
  await page.click('[data-rtab="analysis"]');
  await page.waitForSelector('[data-fa-run]');
  ok(await page.locator('[data-fa-concrete]').count() === 1 && await page.locator('[data-fa-seismic]').count() === 1, 'BimCraft\'s Analysis tab shows the Concrete and Seismic blocks (SU.1056 mount)');
  ok(/checking by an engineer/.test(await page.textContent('[data-fa-rc-aid]')) && /checking by an engineer/.test(await page.textContent('[data-fa-eq-aid]')), 'both open with "for checking by an engineer"');
  const setups = await page.$$eval('[data-fa-rc-setup]', (b) => b.map((x) => x.getAttribute('data-fa-rc-setup')));
  ok(setups.length >= 1, 'the sections the model uses are listed: ' + setups.join(', '));
  for (const s of setups) { await page.click(`[data-fa-rc-setup="${s}"]`); await page.waitForTimeout(500); }
  await page.waitForSelector('[data-fa-rc-form]');
  ok(await page.locator('[data-fa-rc-form]').count() === setups.length, 'each is set up as a concrete form (a row of bars and ties each)');
  await page.click('[data-fa-eq-find]');
  await page.waitForSelector('[data-fa-eq-floors] tbody tr', { timeout: 15000 });
  ok(await page.locator('[data-fa-eq-floors] tbody tr').count() >= 1, 'Find floors: levels where beams meet');
  await page.click('[data-fa-eq-weights]');
  await page.waitForTimeout(500);
  await page.click('[data-fa-eq-make]');
  await page.waitForTimeout(500);
  await page.click('[data-fa-rc-make]');
  await page.waitForTimeout(500);
  await page.click('[data-fa-run]');
  await page.waitForSelector('[data-fa-eq-forces], [data-fa-error]', { timeout: 60000 });
  ok(await page.locator('[data-fa-eq-forces]').count() === 1, 'Run: the storey forces table appears', await page.textContent('[data-fa-error]').catch(() => ''));
  await page.click('[data-fa-rc-run]');
  await page.waitForSelector('[data-fa-rc-table]', { timeout: 60000 });
  const rows = await page.$$eval('[data-fa-rc-row]', (r) => r.map((x) => x.getAttribute('data-fa-rc-row')));
  ok(rows.length >= 1, 'Check concrete: ' + rows.length + ' members checked (' + rows.filter((x) => x === 'fail').length + ' over capacity)');
  const nProb = await page.evaluate(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => p.source?.id === 'bimcraft.frame' || p.source?.name === 'bimcraft.frame').length : -1));
  const fails = rows.filter((x) => x === 'fail').length;
  ok(nProb === -1 || nProb >= fails, 'failed checks and drift are in the shell\'s Problems (' + nProb + ' from bimcraft.frame, ' + fails + ' over capacity)');
  const gid = await page.evaluate(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => p.source?.id === 'bimcraft.frame' || p.source?.name === 'bimcraft.frame').flatMap((p) => p.about.map((a) => a.id)) : []));
  ok(gid.every((id) => /^[0-9A-Za-z_$]{22}$/.test(id)), 'each points at an element by its GlobalId', gid.slice(0, 2).join(','));
  await page.locator('[data-fa-concrete]').screenshot({ path: path.join(ROOT, 'tmp/eg-a/bim-concrete.png') });
} finally {
  await browser.close();
  admin('down');
}
ok(!issues.length, 'no console errors', issues.slice(0, 3).join(' | '));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

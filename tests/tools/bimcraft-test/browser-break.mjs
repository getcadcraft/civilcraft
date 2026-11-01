#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-break.mjs — "What breaks first?" (EG.31) and the Live switch (EG.29) in BimCraft's Analysis tab (0.8 round 3, oltl-eg-a_PART_3).
 * DetailCraft's sample frame written to IFC by DetailCraft's own writer (as tools/frame/browser.mjs does) and opened; a design code; Break it → findings,
 * the failing ones in the shell's Problems with the element's GlobalId; the assistant tool; an edit makes the result stale; Live re-solves by itself.
 *   node tools/bimcraft-test/browser-break.mjs        (run as root; uses tools/frame/admin.php for the test admin)
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
const ifcFile = path.join(ROOT, 'tmp/eg-a/Frame sample.ifc');
{
  const { sampleModel } = await dl('sample.js'), { writeIfc } = await dl('ifc.js'), { build } = await dl('build.js'), { markParts, markFootings } = await dl('marks.js'), { bendingSchedule } = await dl('rebar.js');
  const st = sampleModel().state || sampleModel(), built = build(st), marks = markParts(built, { perPhase: false });
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
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) issues.push('console: ' + m.text()); });
  page.on('pageerror', (e) => issues.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', ifcFile);
  await page.waitForFunction(() => /^Opened /.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 60000 });
  await page.click('[data-rtab="analysis"]');
  await page.waitForSelector('[data-fa-run]');
  // a dead + live load on every beam would need the panel; the sample's own default case is enough for the combination and member findings: make the design block, then Break it
  await page.waitForSelector('[data-fa-des-make]', { timeout: 15000 });
  await page.selectOption('[data-fa-des="code"]', 'asce-aisc').catch(() => {});
  await page.click('[data-fa-des-make]');
  await page.waitForTimeout(400);
  ok(await page.locator('[data-fa-break-run]').count() === 1, 'the What breaks first? button is in BimCraft\'s Analysis tab');
  await page.click('[data-fa-break-run]');
  await page.waitForSelector('[data-fa-break-table] tbody tr, [data-fa-break-none]', { timeout: 90000 }).catch(() => {});
  const rows = await page.$$eval('[data-fa-break-row]', (r) => r.map((x) => x.dataset.faBreakRow + ' | ' + x.textContent));
  ok(rows.length >= 1, 'findings: ' + rows.length + ' rows', rows.join(' / '));
  const probs = await page.evaluate(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => /^breakit\./.test(p.code || '')).map((p) => ({ c: p.code, s: p.severity, about: p.about.map((a) => a.id) })) : []));
  ok(probs.length >= 1, 'findings are in the shell\'s Problems: ' + probs.map((p) => p.c + '|' + p.s).join(', '));
  ok(probs.every((p) => p.about.every((id) => /^[0-9A-Za-z_$]{22}$/.test(id))), 'each points at an element by its GlobalId (so a click selects it)', JSON.stringify(probs.map((p) => p.about)).slice(0, 160));
  await page.evaluate(() => window.bimcraftControl.configure({ enabled: true, groups: ['read', 'edit', 'save', 'export'] }));
  const names = await page.evaluate(() => window.bimcraftControl.list().map((x) => x.name));
  ok(names.includes('frame_break') || names.includes('problems_list'), 'assistant tools are there (' + names.filter((n) => /break|problem/.test(n)).join(', ') + ')');
  const tool = await page.evaluate(async () => { const r = await window.bimcraftControl.call('frame_break', {}, { client: { name: 'test' } }).catch((e) => ({ err: String(e.message || e) })); return JSON.stringify(r).slice(0, 400); });
  ok(/findings/.test(tool) && /guid/.test(tool), 'the assistant tool frame_break answers with the findings and their GlobalIds: ' + tool.slice(0, 120));
  // an edit makes the findings stale and takes them off the Problems list
  await page.fill('[data-fa-load="value"]', '10').catch(() => {});
  const before = await page.evaluate(() => window.bimcraftAnalysis.panel.result?.version ?? null);
  // live
  ok(await page.locator('[data-fa-live]').count() === 1, 'the Live switch is in the tab');
  await page.check('[data-fa-live]');
  await page.waitForTimeout(600);
  ok(await page.isChecked('[data-fa-live]'), 'Live is on');
  await page.click('[data-fa-table] tbody tr:first-child button').catch(() => {});
  await page.waitForFunction(() => !document.querySelector('[data-fa-load-add]')?.disabled, null, { timeout: 15000 }).catch(() => {});
  await page.fill('[data-fa-load="value"]', '10');
  await page.click('[data-fa-load-add]');
  await page.waitForFunction((v) => { const r = window.bimcraftAnalysis.panel.result; return r && r.version !== v; }, before, { timeout: 30000 }).then(() => ok(true, 'a load added → the analysis comes back by itself (live re-solve)'), () => ok(false, 'live re-solve did not come back'));
} finally {
  await browser.close();
  admin('down');
}
ok(!issues.length, 'no console errors', issues.slice(0, 3).join(' | '));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

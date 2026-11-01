#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-survey.mjs — LA.3 in headless Chromium at https://getcadcraft.com/lab/civilcraft: the DWG/DXF dialog's "Survey levels and check"
 * section on our own fixtures (survey-text.dxf, survey-blocks-2018.dwg). Run as root (admin tag civsv). One file, one run.
 *   node tools/civilcraft-test/browser-survey.mjs [--out dir]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(REPO, 'tmp/shots/civilcraft-survey'));
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), cmd, 'civsv'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
let up = false;
try {
  const cred = admin('up'); up = true;
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => {
    new MutationObserver(() => { const b = document.querySelector('[data-autosave-dialog][open] [data-autosave-discard]'); if (b) b.click(); })
      .observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
  });
  const p0 = await ctx.newPage();
  await p0.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p0.fill('input[name="email"]', cred.email); await p0.fill('input[name="password"]', cred.password);
  await Promise.all([p0.waitForNavigation(), p0.click('form button[type="submit"]')]);
  await p0.close();
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });

  console.log('\n== text levels and the check (survey-text.dxf)');
  // a stand-in for the shell's Problems store, to see what the dialog hands over
  await page.evaluate(() => { window.__rows = null; window.ccProblems = { source: (d) => ({ set: (rows) => { window.__rows = { id: d.id, kind: d.kind, rows }; } }) }; });
  await page.setInputFiles('[data-file]', path.join(HERE, 'fixtures/cad/survey-text.dxf'));
  await page.waitForSelector('dialog[data-cad-dialog][open] [data-sv-sec]', { timeout: 30000 });
  const label = (await page.textContent('[data-sv-take-label]')).trim();
  ok(/^Take 22 levels as survey points \(22 from text, 0 from block attributes\)$/.test(label), 'the section counts 22 levels: ' + label);
  ok(!(await page.isChecked('[data-sv-take]')), 'off until the person takes them');
  const codes = await page.$$eval('[data-sv-issue]', (l) => l.map((x) => x.dataset.svIssue.replace('survey.', '')).sort().join());
  ok(codes === 'contours.flat,crs.none,units.scaled', 'the check before taking: flat contours, no coordinate system (' + codes + ')');
  await page.check('[data-sv-take]');
  const codes2 = await page.$$eval('[data-sv-issue]', (l) => l.map((x) => x.dataset.svIssue.replace('survey.', '')).sort().join());
  ok(codes2 === 'contours.flat,crs.none,dup.same,units.scaled,z.outlier,z.zero', 'after taking them the levels are checked too: ' + codes2);
  ok(/Contour layer TOPO-CONT: 2 of 2 lines have no height/.test(await page.textContent('[data-sv-report]')), 'the contour message names the layer and the counts');
  await page.screenshot({ path: path.join(OUT, 'survey-dialog.png') });
  for (const box of await page.$$('dialog[data-cad-dialog] [data-cad-layer] input[type="checkbox"]')) await box.uncheck();
  await page.click('dialog[data-cad-dialog] [data-cad-go]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 22);
  const pts = await page.evaluate(() => window.civilcraft.project.points.map((p) => ({ n: p.n, z: p.z })));
  console.log('  note first:', JSON.stringify(pts[0]), pts.length);
  ok(pts[0].n === '1' && pts.some((p) => Math.abs(p.z - 2500 * (3937 / 1200)) < 0.01) && pts.some((p) => Math.abs(p.z - 101.25 * (3937 / 1200)) < 0.01), '22 survey points numbered from 1 with the levels as z');
  const rows = await page.evaluate(() => window.__rows);
  ok(rows && rows.id === 'civilcraft.survey' && rows.kind === 'import' && rows.rows.length === 6 && rows.rows.every((r) => r.text && !/survey\.p\./.test(r.text)), 'Problems got 6 import rows (units converted m to ft is a note), in words');
  await page.locator('[data-over]').focus();
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 0);
  ok(true, 'one Ctrl+Z takes all 22 points away');

  console.log('\n== attribute levels (survey-blocks-2018.dwg)');
  await page.setInputFiles('[data-file]', path.join(HERE, 'fixtures/cad/survey-blocks-2018.dwg'));
  await page.waitForSelector('dialog[data-cad-dialog][open] [data-sv-sec]', { timeout: 30000 });
  ok(await page.$eval('[data-sv-tag]', (s) => [...s.options].some((o) => o.value === 'attr:ELEV')), 'the attribute list offers ELEV');
  await page.selectOption('[data-sv-tag]', 'attr:ELEV');
  const stored = await page.evaluate(() => localStorage.getItem('cc.survey.tag.survey-blocks-2018.dwg'));
  ok(stored === 'ELEV', 'the choice is remembered per file');
  await page.click('dialog[data-cad-dialog] [data-cad-go]').catch(() => {});
  await wait(300);
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
} catch (e) { fail++; console.log('  FAIL ' + (e?.stack || e)); }
finally {
  await browser.close();
  if (up) try { admin('down'); } catch { /* */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

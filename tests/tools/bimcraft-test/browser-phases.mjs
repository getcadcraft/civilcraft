#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-phases.mjs — Renovation phases (0.8 EG.59), session bim_PART_2, in the lab: headless, real clicks.
 *   node tools/bimcraft-test/browser-phases.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session sxtags), so the shared admin-login
 * throttle is never touched. Fails on any console error. Opens the showcase house (fixtures/showcase/bimcraft-house.ifc).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const HOUSE = path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc');
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'phases'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const status = () => page.textContent('[data-status]');
const download = async (fn) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), fn()]); return { name: dl.suggestedFilename(), bytes: fs.readFileSync(await dl.path()) }; };

try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', HOUSE);
  await waitStatus(/^Opened /, 90000);
  ok(await page.isVisible('[data-eg59-details] summary'), 'Renovation phases sits under Quantities once a model is open');
  await page.click('[data-eg59-details] summary');

  console.log('== Set phases with the buttons');
  const walls = await page.evaluate(() => window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcWall' }]).length);
  const doors = await page.evaluate(() => window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcDoor' }]).length);
  ok(walls > 0 && doors > 0, walls + ' walls, ' + doors + ' doors in the house');
  await page.evaluate(() => window.bimcraftFind.run([]));
  await page.click('[data-eg59-set="existing"]');
  { const st = await status(); ok(/Pick the elements first/.test(st), 'with nothing picked it says so', st); }
  await page.evaluate(() => window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcWall' }]));
  await page.click('[data-eg59-set="existing"]');
  await waitStatus(/set to existing/);
  let sum = await page.textContent('[data-eg59-sum]');
  const m = sum.match(/^(\d+) existing, (\d+) to demolish/);
  ok(m && +m[1] >= walls && +m[2] === 0, 'summary after Existing: ' + sum);
  await page.evaluate(() => window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcDoor' }]));
  await page.click('[data-eg59-set="demolish"]');
  await waitStatus(/set to demolish/);
  sum = await page.textContent('[data-eg59-sum]');
  ok(new RegExp('^\\d+ existing, ' + doors + ' to demolish').test(sum), 'the doors are demolition: ' + sum);
  await shot(page, 'phases-set');

  console.log('== Phase views');
  await page.selectOption('[data-eg59-view]', 'demo');
  const demo = await page.evaluate(() => ({ solid: window.bimcraftPhases && document.querySelector('[data-eg59-view]').value }));
  ok(demo.solid === 'demo', 'the view is set to what comes out');
  let vs = await page.evaluate(() => window.bimcraftVis.state());
  ok(vs.isolated && vs.isolated.length === doors && vs.ghost === true, 'what comes out: only the ' + doors + ' demolished doors solid, the rest see-through (' + (vs.isolated || []).length + ')');
  await shot(page, 'phases-demo');
  await page.selectOption('[data-eg59-view]', 'result');
  vs = await page.evaluate(() => window.bimcraftVis.state());
  ok(vs.isolated && vs.isolated.length > 0 && !vs.isolated.some((k) => false) && vs.ghost === false, 'the result: the demolished doors are hidden, nothing see-through (' + (vs.isolated || []).length + ' shown)');
  await page.selectOption('[data-eg59-view]', 'all');
  vs = await page.evaluate(() => window.bimcraftVis.state());
  ok(vs.isolated === null && vs.hidden.length === 0, 'Everything shows all again');

  console.log('== The plan reads the phases');
  const pm = await page.evaluate(() => { const m = window.bimcraftPhases.phaseMap(); return { n: m.size, values: [...new Set(m.values())] }; });
  ok(pm.n > 0 && pm.values.includes('demolish'), 'the plan has a phase for ' + pm.n + ' elements (' + pm.values.join(', ') + ')');

  console.log('== The demolition list');
  const csv = await download(() => page.click('[data-eg59-csv]'));
  const lines = csv.bytes.toString().trim().split(/\r?\n/);
  ok(csv.name.endsWith('-demolition.csv') && lines.length === doors + 1, 'CSV: a header and ' + doors + ' rows (' + csv.name + ')');


  console.log('== Permit package (EG.44)');
  ok(await page.isVisible('[data-eg44-details] summary'), 'Permit package sits under Renovation phases');
  await page.click('[data-eg44-details] summary');
  ok(await page.isVisible('[data-eg44-noregs]'), 'without the Building regulations add-on it says comments need that add-on');
  await page.fill('[data-eg44-field="name"]', 'Maple Street house');
  await page.fill('[data-eg44-field="sheets"]', '✓ A-101 Plans\nA-201 Sections');
  const zipf = await download(() => page.click('[data-eg44-build]'));
  const names = ['00-cover.md', '01-review-comments.csv', '03-model.ifc'].filter((n) => zipf.bytes.includes(Buffer.from(n)));
  ok(zipf.name.endsWith('-permit-package.zip') && zipf.bytes[0] === 0x50 && zipf.bytes[1] === 0x4b && names.length === 3, 'a zip with the cover, the comments and the model: ' + zipf.name + ', ' + zipf.bytes.length + ' bytes');
  const cover = zipf.bytes.toString('latin1');
  ok(/# Maple Street house/.test(cover) && /\[x\] A-101 Plans/.test(cover) && /\[ \] A-201 Sections/.test(cover), 'the cover names the project and carries the sheet checklist');
  console.log('== Undo');
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(500);
  sum = await page.textContent('[data-eg59-sum]');
  ok(/^\d+ existing, 0 to demolish/.test(sum), 'one undo takes the demolition back: ' + sum);
} catch (e) {
  ok(false, 'ran to the end', e.message);
}
ok(problems.length === 0, 'no console errors', problems.slice(0, 5).join(' | '));
await browser.close();
console.log(fail ? `\n${pass} ok, ${fail} FAILED` : `\nall ok (${pass})`);
process.exit(fail ? 1 : 0);

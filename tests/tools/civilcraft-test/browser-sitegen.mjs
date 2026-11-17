#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-sitegen.mjs — CivilCraft 0.10 SU.1815 (parking lot) and SU.1814b (fences) in headless Chromium at https://getcadcraft.com/lab/civilcraft:
 * the Parking lot window on a selected parcel (spaces, grading with falls to drains, paving, island planting, one undo step, DXF layers), the Fences window on a feature line
 * (a gate, a style change, the schedule CSV, DXF layers), console clean.
 * Run as root, one at a time: nice -n 10 timeout 300 node tools/civilcraft-test/browser-sitegen.mjs   (minted session, tag cv10)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-sitegen'); fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cv10'], { encoding: 'utf8' }) || '{}');
admin('up'); const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus', 'off'); } catch { /* */ } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto('https://getcadcraft.com/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  await page.evaluate(() => { window.civilcraft.project.change('units', (s) => { s.units = 'm'; }); window.civilcraft.command('fit'); });
  await page.waitForTimeout(300);
  const P = (src) => page.evaluate((s) => { const p = window.civilcraft.project; return eval(s); }, src);   // eslint-disable-line no-eval

  // ---- a parcel inside the sample site, selected
  const pid = await page.evaluate(() => {
    const p = window.civilcraft.project, b = p.eg().surface.bounds, X = (f) => b.minX + (b.maxX - b.minX) * f, Y = (f) => b.minY + (b.maxY - b.minY) * f, id = p.nextId('r');
    p.change('parcel', (s) => { (s.parcels ||= []).push({ id, name: 'Test lot', pts: [{ x: X(0.15), y: Y(0.15) }, { x: X(0.85), y: Y(0.15) }, { x: X(0.85), y: Y(0.7) }, { x: X(0.15), y: Y(0.7) }] }); });
    window.civilcraft.select({ kind: 'parcel', id }); return id;
  });
  // ---- Parking lot
  await page.evaluate(() => window.civilcraft.command('parking'));
  await page.waitForSelector('[data-pk-dialog][open]');
  const undo0 = await P('p.undoStack.length');
  await page.click('[data-pk-build]'); await page.waitForTimeout(1500);
  ok(await P('p.state.parking?.length === 1 && p.state.parking[0].boundary.length === 4'), 'a lot is made from the selected parcel');
  ok(await P('p.undoStack.length === ' + (undo0 + 1)), 'one undo step');
  ok(await P('p.state.landscape.grading.length === 1 && p.state.landscape.hardscape.length === 1 && p.state.landscape.beds.length > 0'), 'grading, paving and island beds were made');
  const sum = await page.textContent('[data-pk-sum]'); ok(/\d+ spaces/.test(sum) && /accessible/.test(sum), 'the summary says: ' + sum);
  ok((await page.textContent('[data-pk-vol]')).includes('cut'), 'cut and fill shown: ' + (await page.textContent('[data-pk-vol]')));
  ok(await P('p.graded().surface !== null'), 'the proposed surface exists');
  await page.screenshot({ path: path.join(SHOTS, '01-parking.png') });
  await page.fill('#cv-pk-maxRun', '6'); await page.click('[data-pk-rebuild]'); await page.waitForTimeout(1200);
  ok(await P('p.state.parking.length === 1 && p.state.landscape.grading.length === 1'), 'laying out again replaces what the lot made');
  const [cx] = await Promise.all([page.waitForEvent('download'), page.click('[data-pk-csv]')]); const csvp = path.join(SHOTS, 'lot.csv'); await cx.saveAs(csvp);
  ok(fs.readFileSync(csvp, 'utf8').includes('"stalls"'), 'the schedule CSV downloads');
  const [dx] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => window.civilcraft.command('dxf'))]);
  const dxf = path.join(SHOTS, 'out.dxf'); await dx.saveAs(dxf); const txt = fs.readFileSync(dxf, 'utf8');
  ok(txt.includes('C-PARK-STALL') && txt.includes('C-PARK-AISLE'), 'the DXF carries the parking layers');
  await page.evaluate(() => window.civilcraft.command('undo')); await page.waitForTimeout(300);
  ok(await P('p.state.parking?.length === 1'), 'undo goes back one step (the rebuild)');
  await page.click('[data-pk-remove]'); await page.waitForTimeout(300);
  ok(await P('!p.state.parking && !p.state.landscape.grading.length && !p.state.landscape.hardscape.length'), 'removing the lot removes what it made');
  await page.click('[data-pk-dialog] .cv-x'); await page.waitForTimeout(150);

  // ---- Fences
  await page.evaluate((id) => window.civilcraft.select({ kind: 'parcel', id }), pid);
  await page.evaluate(() => window.civilcraft.command('fences'));
  await page.waitForSelector('[data-fc-dialog][open]');
  await page.click('[data-fc-fromsel-gate]'); await page.waitForTimeout(300);
  ok(await P('p.state.fences?.length === 1 && p.state.fences[0].closed === true && p.state.fences[0].gates.length === 1'), 'a closed fence with a gate along the parcel');
  ok((await page.textContent('[data-fc-sum]')).includes('gates'), 'the summary: ' + (await page.textContent('[data-fc-sum]')));
  await page.selectOption('[data-fc-row] select >> nth=1', 'stepped'); await page.waitForTimeout(300);
  ok(await P('p.state.fences[0].terrain === "stepped"'), 'stepped on the ground'); 
  await page.selectOption('[data-fc-row] select >> nth=0', 'rails'); await page.waitForTimeout(300);
  ok(await P('p.state.fences[0].style === "rails"'), 'rails');
  await page.screenshot({ path: path.join(SHOTS, '02-fences.png') });
  const [fx] = await Promise.all([page.waitForEvent('download'), page.click('[data-fc-csv]')]); const fcsv = path.join(SHOTS, 'fence.csv'); await fx.saveAs(fcsv);
  ok(fs.readFileSync(fcsv, 'utf8').includes('"post"') && fs.readFileSync(fcsv, 'utf8').includes('"gate"'), 'the fence schedule has posts and a gate');
  const [dx2] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => window.civilcraft.command('dxf'))]);
  const dxf2 = path.join(SHOTS, 'out2.dxf'); await dx2.saveAs(dxf2); const t2 = fs.readFileSync(dxf2, 'utf8');
  ok(t2.includes('C-FENC-POST') && t2.includes('C-FENC-GATE'), 'the DXF carries the fence layers');
  await page.evaluate(() => window.civilcraft.command('undo')); await page.waitForTimeout(200);
  ok(await P('p.state.fences?.length === 1 && p.state.fences[0].style === "panel"'), 'undo takes the style change back');
  await page.click('[data-fc-remove]'); await page.waitForTimeout(200);
  ok(await P('!p.state.fences'), 'removing the fence empties the list');
  ok(!problems.length, 'no console errors', problems);
} catch (e) { fail++; console.log('  FAIL ' + e.stack); } finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);

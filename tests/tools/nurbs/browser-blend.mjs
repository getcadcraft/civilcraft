#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-blend.mjs — 0.9 SU.747c (session nurbs-s3-09) in the real pages /lab/modelcraft and /lab/partcraft (rule 49), headless Chromium:
 * Surfaces › Solids › Box solid, then Fillet between faces (the top and front faces picked from the list, radius 5; then 3 to 8 mm), the
 * measured line, the solid's volume against the closed form; Thicken into a solid on a flat patch; STEP out with the solid as ONE closed
 * shell (the status line says so; the file has a CLOSED_SHELL and no OPEN_SHELL); Undo. No console errors.
 *   node tools/nurbs/browser-blend.mjs [modelcraft|partcraft] [--out <dir>]      (root; PartCraft with PC_EXACT=0 as its other tests)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const APPS = process.argv.slice(2).filter((a) => /^(modelcraft|partcraft)$/.test(a));
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/blend')));
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };
const Q = 1 - Math.PI / 4;
const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));

async function run(app) {
  console.log('== ' + app);
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, locale: 'en-US', ignoreHTTPSErrors: true, serviceWorkers: 'block', acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU stall|GL_|status of 429/i.test(m.text())) problems.push(app + ' console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push(app + ' pageerror: ' + e.message));
  await page.addInitScript(() => { window.showOpenFilePicker = undefined; window.showSaveFilePicker = undefined; });
  let session;
  if (app === 'modelcraft') {
    await page.goto(BASE + '/lab/modelcraft?space=model', { waitUntil: 'load' });
    await page.waitForFunction(() => window.modelcraft?.model, null, { timeout: 60000 });
    // the right panel folds its sections (one open at a time, app-settings.js): open the Surfaces section by its heading, as a person does
    if (await page.evaluate(() => document.querySelector('[data-nurbs]').classList.contains('af-collapsed'))) await page.click('#mc-nurbs-h');
    await page.evaluate(() => document.querySelector('[data-nurbs-open]').scrollIntoView());
    await page.click('[data-nurbs-open]');
    session = 'window.modelcraft.surfaces.session';
  } else {
    await page.goto(BASE + '/lab/partcraft?space=model', { waitUntil: 'load' });
    await page.waitForFunction(() => window.partcraft?.openText, null, { timeout: 60000 });
    await page.selectOption('[data-workspace]', 'surfaces');
    await page.waitForSelector('[data-nurbs-panel]', { timeout: 60000 });
    // PartCraft's adapter keeps its session in the module (surfaces-pc.js _state, for tests): the same module the page loaded
    await page.evaluate(async () => { const u = performance.getEntriesByType('resource').map((e) => e.name).find((n) => /\/surfaces-pc\.js/.test(n)); window.__pcS = (await import(u))._state; });
    session = 'window.__pcS.session';
  }
  await page.waitForSelector('[data-nurbs-panel]', { timeout: 60000 });
  const S = (expr) => page.evaluate('(() => { const s = ' + session + '; return ' + expr + '; })()');
  const opt = async (name, v) => { await page.fill(`[data-nurbs-opt="${name}"]`, v); await page.dispatchEvent(`[data-nurbs-opt="${name}"]`, 'change'); };
  const note = () => page.evaluate(() => [...document.querySelectorAll('[data-nurbs-panel] .nui-note[aria-live]')].map((e) => e.textContent).join(' '));
  const volume = () => S('s.N.solid.mesh(s.doc, s.doc.solids[0].id).report.volume');
  await S('(s.load(null), true)');

  const names = await page.$$eval('[data-nurbs-start^="solid."]', (b) => b.map((x) => x.dataset.nurbsStart));
  ok(names.includes('solid.fillet') && names.includes('solid.thicken'), app + ': the Solids group has Fillet between faces and Thicken into a solid — ' + names.join(', '));
  await page.click('[data-nurbs-start="solid.box"]');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-solid="b1"]');
  const faces = await S('s.doc.solids[0].faces');
  // the edge between the box's top (its 2nd face) and front (3rd), 100 mm long
  await page.click('[data-nurbs-start="solid.fillet"]');
  ok((await page.getAttribute('[data-nurbs-need]', 'data-nurbs-need')) === 'surface', app + ': Fillet asks for a face');
  await page.click(`[data-nurbs-pick="${faces[1]}"]`);
  await page.click(`[data-nurbs-pick="${faces[2]}"]`);
  await opt('radius', '5');
  await page.click('[data-nurbs-run]');
  await page.waitForFunction(() => /Fillet radius/.test([...document.querySelectorAll('[data-nurbs-panel] .nui-note')].map((e) => e.textContent).join(' ')), null, { timeout: 60000 });
  let line = await note();
  const v1 = await volume(), want1 = 240000 - Q * 25 * 100;
  ok(/close again/.test(line) && /within 0 mm of the rolling ball|within 0\.000001 mm of the rolling ball/.test(line), app + ': the measured line — ' + line.slice(0, 300));
  ok(Math.abs((240000 - v1) - Q * 2500) / (Q * 2500) < 0.03, app + ': removed ' + (240000 - v1).toFixed(2) + ' mm³ vs (1 − π/4)·r²·L = ' + (Q * 2500).toFixed(2) + ' (volume ' + v1.toFixed(1) + ' vs ' + want1.toFixed(1) + ')');
  ok((await S('s.doc.solids.length')) === 1 && (await S('s.doc.solids[0].faces.length')) === 7, app + ': one solid of 7 faces (the fillet face added)');
  await page.screenshot({ path: path.join(OUT, app + '-fillet.png') });
  await page.click('[data-nurbs-undo]');
  ok((await S('s.doc.solids[0].faces.length')) === 6, app + ': Undo brings the sharp edge back');
  await page.click('[data-nurbs-start="solid.fillet"]');
  await page.click(`[data-nurbs-pick="${faces[1]}"]`);
  await page.click(`[data-nurbs-pick="${faces[2]}"]`);
  await opt('radius', '3'); await opt('radius2', '8');
  await page.click('[data-nurbs-run]');
  await page.waitForFunction(() => /Fillet radius 3 to 8 mm/.test([...document.querySelectorAll('[data-nurbs-panel] .nui-note')].map((e) => e.textContent).join(' ')), null, { timeout: 60000 });
  const v2 = await volume(), want2 = Q * 100 * (9 + 24 + 64) / 3;
  ok(Math.abs((240000 - v2) - want2) / want2 < 0.03, app + ': variable 3 to 8 mm removes ' + (240000 - v2).toFixed(2) + ' vs ' + want2.toFixed(2) + ' mm³ — ' + (await note()).slice(0, 200));

  console.log('== ' + app + ': STEP with the solid as one closed shell');
  const [stp] = await Promise.all([page.waitForEvent('download'), page.click('[data-nurbs-export="step"]')]);
  const text = fs.readFileSync(await stp.path(), 'utf8');
  ok(/CLOSED_SHELL/.test(text) && /MANIFOLD_SOLID_BREP/.test(text) && !/OPEN_SHELL/.test(text), app + ': the STEP file has one MANIFOLD_SOLID_BREP / CLOSED_SHELL and no open shell');
  ok(/1 solid\(s\) written as one closed shell/.test(await note()), app + ': the status line says so — ' + (await note()).slice(0, 160));

  console.log('== ' + app + ': Thicken into a solid');
  await S("(s.load({ format: 'cadcraft-nurbs', version: 1, unit: 'mm', items: [{ id: 's1', name: 'plate', kind: 'surface', surface: s.N.construct.planarPatch([[0, 0, 0], [100, 0, 0], [100, 60, 0], [0, 60, 0]]) }], links: [] }), true)");
  await page.evaluate('(() => { const p = window.modelcraft?.surfaces || window.__pcS?.panel; p?.refresh?.(); })()');
  await page.click('[data-nurbs-start="solid.thicken"]');
  await page.click('[data-nurbs-pick="s1"]');
  await opt('thickness', '5');
  await page.click('[data-nurbs-run]');
  await page.waitForFunction(() => /mm thick, volume/.test([...document.querySelectorAll('[data-nurbs-panel] .nui-note')].map((e) => e.textContent).join(' ')), null, { timeout: 60000 });
  line = await note();
  ok(/5 mm thick, volume 30000 mm³/.test(line), app + ': a 100 × 60 plate 5 mm thick — ' + line.slice(0, 200));
  ok((await S('s.doc.solids.length')) === 1 && (await S('s.doc.solids[0].faces.length')) === 6, app + ': one solid of 6 faces');
  await page.click('[data-nurbs-start="solid.thicken"]');
  await page.click('[data-nurbs-pick="' + (await S('s.doc.solids[0].faces[0]')) + '"]');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-error]', { timeout: 15000 });
  ok((await page.getAttribute('[data-nurbs-error]', 'data-nurbs-error')) === 'nurbs.err.solid_taken', app + ': a face already in a solid is refused in words — ' + (await page.textContent('[data-nurbs-error]')));
  await page.screenshot({ path: path.join(OUT, app + '-thicken.png') });
  await ctx.close();
}

try {
  for (const app of APPS.length ? APPS : ['modelcraft']) await run(app);
} catch (e) {
  fail++; console.log('  FAIL threw: ' + (e && e.stack || e));
} finally {
  for (const p of problems) { fail++; console.log('  FAIL ' + p); }
  await browser.close();
  console.log((fail ? 'FAILED' : 'ok') + ' - ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

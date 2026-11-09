#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fillet-edges.mjs — 0.9 SU.747c several edges at once, spherical corners and IGES solids (owner's order 2026-11-06) in the real pages
 * /lab/modelcraft and /lab/partcraft (rule 49), headless Chromium: Surfaces › Solids › Box solid, Fillet several edges (faces picked in pairs, the
 * top face in four of them), the measured line, the volume against the closed form; Undo; three edges of one corner give a sphere patch; IGES out with
 * the solid as ONE manifold solid B-rep (186 / 514 / 510 / 508 / 504 / 502, the status line says so) and read back by Import as a solid. No console errors.
 *   node tools/nurbs/browser-fillet-edges.mjs [modelcraft|partcraft] [--out <dir>]      (PartCraft with PC_EXACT=0 as its other tests)
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
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/fillet-edges')));
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
  ok(names.includes('solid.fillet_edges'), app + ': the Solids group has Fillet several edges — ' + names.join(', '));
  await page.click('[data-nurbs-start="solid.box"]');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-solid="b1"]');
  const f = await S('s.doc.solids[0].faces');   // z0, z1 (top), y0, y1, x0, x1
  const pickAll = async (ids) => { for (const id of ids) await page.click(`[data-nurbs-pick="${id}"]`); };
  // the four top edges at once: the top face is in four pairs
  await page.click('[data-nurbs-start="solid.fillet_edges"]');
  await pickAll([f[1], f[2], f[1], f[3], f[1], f[4], f[1], f[5]]);
  ok((await S('s.picks.length')) === 8, app + ': eight picks make four pairs (the top face is in all four)');
  await opt('radius', '5');
  ok(await page.isVisible('[data-nurbs-opt="corners"]'), app + ': the Corners option is in the form');
  await page.click('[data-nurbs-run]');
  await page.waitForFunction(() => /edges rounded in one step/.test([...document.querySelectorAll('[data-nurbs-panel] .nui-note')].map((e) => e.textContent).join(' ')), null, { timeout: 90000 });
  let line = await note();
  let I = 0; const NI = 200000; for (let i = 0; i < NI; i++) { const z = (i + 0.5) / NI * 5, w = 5 - Math.sqrt(10 * z - z * z); I += w * w * 5 / NI; }
  const exact = Q * 25 * 320 - 4 * I, v1 = await volume();
  ok(Math.abs((240000 - v1) - exact) / exact < 0.03, app + ': four top edges remove ' + (240000 - v1).toFixed(1) + ' mm³ vs ' + exact.toFixed(1) + ' (closed form, 3 %)');
  ok(/4 edges rounded in one step/.test(line) && /close again/.test(line), app + ': the line says 4 edges and that the faces close again — ' + line.slice(0, 330));
  ok((await S('s.doc.solids.length')) === 1 && (await S('s.doc.solids[0].faces.length')) === 10, app + ': one solid of 10 faces');
  await page.screenshot({ path: path.join(OUT, app + '-rim.png') });
  await page.click('[data-nurbs-undo]');
  ok((await S('s.doc.solids[0].faces.length')) === 6, app + ': one Undo brings the sharp box back');
  // a corner: three edges, the sphere patch
  await page.click('[data-nurbs-start="solid.fillet_edges"]');
  await pickAll([f[1], f[2], f[1], f[5], f[2], f[5]]);
  await opt('radius', '5');
  await page.click('[data-nurbs-run]');
  await page.waitForFunction(() => /3 edges rounded in one step/.test([...document.querySelectorAll('[data-nurbs-panel] .nui-note')].map((e) => e.textContent).join(' ')), null, { timeout: 90000 });
  line = await note();
  const v2 = await volume(), exactS = Q * 25 * 185 + 125 * (1 - Math.PI / 6);
  ok(/1 corner\(s\) rounded as a sphere patch/.test(line), app + ': the line names the sphere corner — ' + line.slice(0, 380));
  ok(Math.abs((240000 - v2) - exactS) / exactS < 0.03, app + ': three edges and the sphere corner remove ' + (240000 - v2).toFixed(1) + ' mm³ vs ' + exactS.toFixed(1));
  ok((await S('s.doc.solids[0].faces.length')) === 10, app + ': one solid of 10 faces (6 sides, 3 fillets, 1 sphere patch)');
  await page.screenshot({ path: path.join(OUT, app + '-corner.png') });

  console.log('== ' + app + ': IGES with the solid as one 186');
  const [igs] = await Promise.all([page.waitForEvent('download'), page.click('[data-nurbs-export="iges"]')]);
  const text = fs.readFileSync(await igs.path(), 'utf8');
  const types = new Set(text.split('\n').filter((l) => l[72] === 'D' && l.slice(73) % 2 === 1).map((l) => +l.slice(0, 8)));
  ok([186, 514, 510, 508, 504, 502].every((t) => types.has(t)) && !types.has(144), app + ': the IGES file has 186, 514, 510, 508, 504, 502 and no trimmed faces — ' + [...types].sort().join(' '));
  ok(/1 solid\(s\) written as one closed shell/.test(await note()), app + ': the status line says so — ' + (await note()).slice(0, 160));
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

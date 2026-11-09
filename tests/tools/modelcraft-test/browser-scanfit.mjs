#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-scanfit.mjs — 0.9 SU.1082 (session reverse-nurbs-09) in ModelCraft's real page, headless Chromium at /lab/modelcraft (rule 49): the
 * Surfaces panel's Scan group. A mesh group of the model (a 100 x 60 x 40 mm box made by Box solid + Add to the model) is
 * selected; "Fit surfaces to the scan" makes six planes, the measured error line and table appear, "Stitch the surfaces to a solid" closes them with the volume measured, the panel Undo takes it back; with no selection
 * and an empty model the fit says so in words. No console errors.
 *   node tools/modelcraft-test/browser-scanfit.mjs [--out <dir>]      (root)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { roundedBox, roundedVolume, binaryStl } = await import(path.join(REPO, 'tools/nurbs/scan-fixtures.mjs'));
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/scanfit')));
fs.mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function signedInContext(opts) {
  // a minted staff session (as tools/problems-test/*): sign-in by password races other sessions' test runs on the shared test admin
  const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
  const c = await browser.newContext(opts);
  await c.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  return c;
}

const modUrl = (page, re) => page.evaluate((src) => { const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports; return Object.entries(map).find(([k]) => new RegExp(src).test(k))?.[1] || null; }, re.source);
const problems = [];
try {
  const ctx = await signedInContext({ viewport: { width: 1600, height: 1000 }, locale: 'en-US', ignoreHTTPSErrors: true, serviceWorkers: 'block', acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU stall|GL_|status of 429/i.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.addInitScript(() => { window.showOpenFilePicker = undefined; window.showSaveFilePicker = undefined; });
  await page.goto(BASE + '/lab/modelcraft?space=model', { waitUntil: 'load' });
  await page.waitForFunction(() => window.modelcraft?.model, null, { timeout: 60000 });
  await page.evaluate(() => document.querySelector('[data-nurbs-open]').scrollIntoView());
  await page.click('[data-nurbs-open]');
  await page.waitForSelector('[data-nurbs-panel]');
  const opt = async (name, v) => { await page.fill(`[data-nurbs-opt="${name}"]`, v); await page.dispatchEvent(`[data-nurbs-opt="${name}"]`, 'change'); };
  const note = () => page.evaluate(() => [...document.querySelectorAll('[data-nurbs-panel] .nui-note[aria-live]')].map((e) => e.textContent).join(' '));

  const sess = () => page.evaluate(() => { const s = window.modelcraft.surfaces.session; return { items: s.doc.items.length, solids: (s.doc.solids || []).length, kinds: s.doc.items.map((i) => i.name) }; });

  console.log('== the Scan group');
  const names = await page.$$eval('[data-nurbs-start^="scan."]', (b) => b.map((x) => x.dataset.nurbsStart));
  ok(names.join() === 'scan.fit,scan.solid', 'the panel has the Scan group: ' + names.join(', '));

  console.log('== nothing selected, nothing in the model');
  await page.evaluate(() => window.modelcraft.host.setSel([]));
  await page.click('[data-nurbs-start="scan.fit"]');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-error]');
  ok(/mesh/i.test(await page.textContent('[data-nurbs-error]')), 'Fit with no mesh says to select one — ' + await page.textContent('[data-nurbs-error]'));
  await page.click('[data-nurbs-cancel]');

  console.log('== a scan in the model: a box made from NURBS faces, then added as a mesh group');
  await page.click('[data-nurbs-start="solid.box"]');
  await opt('size', '100, 60, 40');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-solid="b1"]');
  const n0 = await page.evaluate(() => window.modelcraft.model.root.insts.size);
  await page.click('[data-nurbs-bake="b1"]');
  await page.waitForFunction((n) => window.modelcraft.model.root.insts.size === n + 1, n0, { timeout: 15000 });
  // remove the NURBS box so only the mesh remains to be fitted
  await page.click('[data-nurbs-solid-delete="b1"]');
  ok((await sess()).items === 0, 'the NURBS box is deleted; the mesh group stays in the model');
  await page.evaluate(() => { const m = window.modelcraft.model; const iid = [...m.root.insts.keys()].at(-1); window.modelcraft.host.setSel([{ t: 'i', id: iid }]); });

  console.log('== Fit surfaces to the scan');
  await page.click('[data-nurbs-start="scan.fit"]');
  const fields = await page.$$eval('[data-nurbs-opt]', (e) => e.map((x) => x.dataset.nurbsOpt));
  ok(fields.join() === 'tol,minShare,maxPatches', 'options: ' + fields.join(', '));
  await opt('tol', '0.05');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-scan-table]', { timeout: 30000 });
  const line = await note();
  ok(/Fitted 6 faces to 12 triangles/.test(line), 'six faces from the 12 triangles of the box — ' + line.slice(0, 200));
  const rows = await page.$$eval('[data-nurbs-scan-row]', (r) => r.map((x) => ({ ok: x.dataset.ok, t: x.textContent })));
  ok(rows.length === 6 && rows.every((r) => r.ok === '1' && /Plane/.test(r.t)), 'six Plane rows, every largest error within the tolerance');
  const mx = await page.evaluate(() => window.modelcraft.surfaces.session.doc.items.length);
  ok(mx === 6, 'six surfaces in the patch set');
  ok(/mesh to the closest point|from the scan points to the closest point/.test(await page.textContent('[data-nurbs-scan]')), 'the note says which way the error is measured');
  await page.screenshot({ path: path.join(OUT, '1-fit.png') });

  console.log('== Stitch to a solid');
  await page.click('[data-nurbs-start="scan.solid"]');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-solid]', { timeout: 30000 });
  const l2 = await note();
  const vol = Number((l2.match(/Volume ([\d.]+) mm/) || [])[1]);
  ok(Math.abs(vol - 240000) < 5, 'the stitched solid closes, volume ' + vol + ' mm3 vs 240000 — ' + l2.slice(0, 160));
  ok((await sess()).solids === 1, 'one solid in the patch set');
  await page.click('[data-nurbs-undo]');
  ok((await sess()).solids === 0 && (await sess()).items === 6, 'the panel Undo takes the solid back and keeps the six faces');

  console.log('== round 2: a box with 3 mm fillets (an STL with a known truth), spheres, cylinders, fillets, the deviation map');
  await page.evaluate(() => window.modelcraft.surfaces.session.load(null));
  const A = 94, B = 54, C = 34, R = 3, fmesh = roundedBox(A, B, C, R, 6, 0.01);
  await page.setInputFiles('[data-file-import]', { name: 'rounded-box.stl', mimeType: 'model/stl', buffer: binaryStl(fmesh) });
  await page.waitForFunction(() => /rounded-box/.test(document.body.textContent || ''), null, { timeout: 30000 }).catch(() => {});
  await page.evaluate(() => { const m = window.modelcraft.model; const iid = [...m.root.insts.keys()].at(-1); window.modelcraft.host.setSel([{ t: 'i', id: iid }]); });
  await page.click('[data-nurbs-start="scan.fit"]');
  await opt('tol', '0.1');
  await page.click('[data-nurbs-run]');
  await page.waitForFunction(() => document.querySelectorAll('[data-nurbs-scan-row]').length >= 20, null, { timeout: 90000 });
  const rows2 = await page.$$eval('[data-nurbs-scan-row]', (r) => r.map((x) => ({ ok: x.dataset.ok, t: x.textContent })));
  const cnt = (re) => rows2.filter((r) => re.test(r.t)).length;
  ok(cnt(/Plane/) === 6 && cnt(/Cylinder/) === 12 && cnt(/Sphere/) === 8, 'six planes, twelve cylinders, eight spheres — ' + rows2.length + ' faces');
  ok(rows2.every((r) => r.ok === '1'), 'every face: largest error within 0.1 mm');
  const frad = rows2.map((r) => Number((r.t.match(/fillet, radius ([\d.]+) mm/) || [])[1])).filter((x) => x > 0);
  ok(frad.length === 20 && frad.every((x) => Math.abs(x - 3) < 0.05), 'twenty round faces listed as fillets, each radius within 0.05 mm of 3 - ' + frad.length + ', worst ' + Math.max(...frad.map((x) => Math.abs(x - 3))).toFixed(3));
  ok(/rounded edges or corners/.test(await note()), 'the result line says fillets were found');
  const dev = await page.evaluate(() => { const d = window.modelcraft.surfaces.display; return { n: d.cloud ? d.cloud.userData.nurbsCloud : 0, vis: !!(d.cloud && d.cloud.parent) }; });
  ok(dev.n > 1000 && dev.vis, 'the deviation map is drawn in the view: ' + dev.n + ' coloured points');
  ok(await page.isChecked('[data-nurbs-devmap]') && /blue on the face/.test(await page.textContent('[data-nurbs-devlegend]')), 'the checkbox is on and the legend explains the colours');
  await page.screenshot({ path: path.join(OUT, '2-fillets-devmap.png') });
  await page.click('[data-nurbs-devmap]');
  ok(await page.evaluate(() => !window.modelcraft.surfaces.display.cloud), 'unticking the box takes the map out of the view');
  await page.click('[data-nurbs-start="scan.solid"]');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-solid]', { timeout: 60000 });
  const l3 = await note();
  const vol3 = Number((l3.match(/Volume ([\d.]+) mm/) || [])[1]), want3 = roundedVolume(A, B, C, R);
  ok(Math.abs(vol3 - want3) / want3 < 0.005, 'the filleted box stitches to a closed solid: volume ' + vol3 + ' vs ' + want3.toFixed(0) + ' mm3 (closed form) — ' + l3.slice(0, 120));
} catch (e) {
  fail++; console.log('  FAIL threw: ' + (e && e.stack || e));
} finally {
  for (const p of problems) { fail++; console.log('  FAIL ' + p); }
  await browser.close();
  console.log((fail ? 'FAILED' : 'ok') + ' - ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

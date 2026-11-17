#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-main-10.mjs: guard for PERF.71 (0.10, code-mains2-10), which moves topics out of modelcraft.js's init() closure into their own
 * modules. One page load, a mesh dropped on the stage (importFile), the Info panel, the small dialogs, and a failure on any console or page
 * error, which is how a missed closure variable shows. The same file runs on the ORIGINAL main and on the split one. Goes through
 * tools/gpu-remote/browser.mjs, so it runs on the workstation (a heavy page, rule 68):
 *   tools/gpu-remote/run.sh --session code-mains2-10 --lab -- tools/modelcraft-test/browser-main-10.mjs
 */
import path from 'node:path';
import { launch, labCookie, machine, BASE } from '../gpu-remote/browser.mjs';

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
await ctx.addCookies(labCookie());
const page = await ctx.newPage();
page.setDefaultTimeout(30000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + ' @ ' + String(e.stack || '').split('\n').slice(1, 3).map((x) => x.trim().replace(/^at /, '')).join(' < ')));
const act = (a) => page.evaluate((x) => document.querySelector('[data-act="' + x + '"]').click(), a);
const drop = (files) => page.evaluate(async (list) => {
  const dt = new DataTransfer();
  for (const { name, text } of list) dt.items.add(new File([text], name));
  const stage = window.modelcraft.ui.stage;
  stage.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }));
  stage.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
}, files);
const state = () => page.evaluate(() => { const m = window.modelcraft.model; const meshes = [...m.defs.values()].filter((d) => d.mesh); return { msg: window.modelcraft.ui.msg.textContent, meshes: meshes.length, faces: meshes.reduce((n, d) => n + d.mesh.faceCount, 0), top: m.root.insts.size }; });
const dialog = async (a, label) => {
  await act(a);
  await page.waitForSelector('dialog[open]', { timeout: 8000 }).catch(() => {});
  const n = await page.locator('dialog[open]').count();
  ok(n === 1, label + ' opens its dialog');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  if (await page.locator('dialog[open]').count()) { await page.locator('dialog[open] button[type=button], dialog[open] [value=cancel]').first().click().catch(() => {}); await page.waitForTimeout(250); }
};

try {
  console.log('machine: ' + await machine(page));
  await page.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.modelcraft && window.modelcraft.model, null, { timeout: 40000 });
  await page.click('[data-autosave-discard-all]', { timeout: 1500 }).catch(() => {});

  // ---- import a mesh by dropping it (importFile) ----
  const obj = ['o Slab', 'v 0 0 0', 'v 2 0 0', 'v 2 0 -1', 'v 0 0 -1', 'f 1 2 3 4', 'o Wedge', 'v 3 0 0', 'v 5 0 0', 'v 4 0 -2', 'v 4 1 -1', 'f 5 6 7', 'f 5 6 8', 'f 6 7 8', 'f 7 5 8', ''].join('\n');
  await drop([{ name: 'slab.obj', text: obj }]);
  await page.waitForFunction(() => /slab\.obj/.test(window.modelcraft.ui.msg.textContent), null, { timeout: 60000 });
  const s = await state();
  ok(s.meshes >= 1 && s.faces >= 1, 'an OBJ dropped on the stage becomes a mesh', JSON.stringify(s));

  // ---- the Info panel (renderInfo) for the selection ----
  await act('select-all');
  await page.waitForTimeout(400);
  const info = (await page.locator('[data-info]').innerText()).trim();
  ok(info.length > 10, 'the Info panel describes the selection', info.slice(0, 80));

  // ---- the small dialogs ----
  await dialog('scale-by', 'Scale by');
  await dialog('storeys', 'Storeys');
  await dialog('text3d', '3D text');
  await dialog('terrain-grid', 'Terrain grid');

  ok(problems.length === 0, 'no console or page errors', problems.slice(0, 3).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL threw: ' + e.message.split('\n')[0]);
  for (const p of problems.slice(0, 5)) console.log('       ' + p);
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

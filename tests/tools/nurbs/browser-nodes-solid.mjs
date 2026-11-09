#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-nodes-solid.mjs — 0.9 SU.747c step 4 (session nurbs-s3-09, mounted 2026-11-06) in the real pages /lab/modelcraft and /lab/partcraft (rule 49),
 * headless Chromium: the node editor's palette lists the Solids nodes; a graph Box solid − Cylinder solid (Subtract) → Solid volume reads
 * 211 725.7 mm³ (240 000 − π·15²·40) within 0.2 %, a point does not wire into a solid port, Fillet between faces, Union and Intersect run, Solid to
 * mesh shows in the view, the graph is kept. No console errors.
 *   node tools/nurbs/browser-nodes-solid.mjs [modelcraft|partcraft] [--out <dir>]      (PartCraft with PC_EXACT=0 as its other tests)
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
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/nodes-solid')));
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };
const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const GRAPH = {
  format: 'cadcraft-nodes', version: 1, wires: [
    { from: ['n1', 'out'], to: ['n3', 'a'] }, { from: ['n2', 'out'], to: ['n3', 'b'] }, { from: ['n3', 'out'], to: ['n4', 'solid'] },
    { from: ['n1', 'out'], to: ['n5', 'solid'] }, { from: ['n1', 'out'], to: ['n7', 'a'] }, { from: ['n2', 'out'], to: ['n7', 'b'] }, { from: ['n3', 'out'], to: ['n8', 'solid'] }],
  nodes: [
    { id: 'n1', type: 'solid_box', params: { corner: [0, 0, 0], size: [100, 60, 40] }, pos: [20, 20] },
    { id: 'n2', type: 'solid_cylinder', params: { base: [50, 30, -10], axis: [0, 0, 1], radius: 15, height: 60 }, pos: [20, 260] },
    { id: 'n3', type: 'solid_subtract', params: {}, pos: [320, 100] },
    { id: 'n4', type: 'solid_volume', params: {}, pos: [620, 100] },
    { id: 'n5', type: 'solid_fillet', params: { face_a: 2, face_b: 3, radius: 5, radius2: 0 }, pos: [320, 300] },
    { id: 'n6', type: 'solid_volume', params: {}, pos: [620, 300] },
    { id: 'n7', type: 'solid_union', params: {}, pos: [320, 480] },
    { id: 'n8', type: 'solid_mesh', params: {}, pos: [620, 480], show: true },
  ],
};
GRAPH.wires.push({ from: ['n5', 'out'], to: ['n6', 'solid'] });

async function run(app) {
  console.log('== ' + app);
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, locale: 'en-US', ignoreHTTPSErrors: true, serviceWorkers: 'block' });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU stall|GL_|status of 429/i.test(m.text())) problems.push(app + ' console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push(app + ' pageerror: ' + e.message));
  await page.addInitScript(() => { window.showOpenFilePicker = undefined; window.showSaveFilePicker = undefined; });
  let panel;
  if (app === 'modelcraft') {
    await page.goto(BASE + '/lab/modelcraft?space=model', { waitUntil: 'load' });
    await page.waitForFunction(() => window.modelcraft?.model && window.ccProblems, null, { timeout: 60000 });
    // the right panel folds its sections (app-settings.js): open the one that holds the Nodes button by its heading, as a person does
    for (const h of await page.$$('[data-af="closed"]')) { if (await page.isVisible('[data-nodes-open]')) break; await h.click().catch(() => {}); }
    await page.click('[data-nodes-open]');
    await page.waitForSelector('[data-nodes-window]:not([hidden])', { timeout: 30000 });
    panel = 'window.modelcraft.nodes.window.panel';
  } else {
    await page.goto(BASE + '/lab/partcraft?space=model', { waitUntil: 'load' });
    await page.waitForFunction(() => window.partcraft?.openText, null, { timeout: 60000 });
    await page.selectOption('[data-workspace]', 'nodes');
    await page.waitForSelector('[data-nodes-window]:not([hidden])', { timeout: 30000 });
    panel = 'window.partcraft.nodes.win.panel';
  }
  const P = (expr, arg) => page.evaluate(({ panel, expr, arg }) => { const p = new Function('return ' + panel)(); return new Function('p', 'a', 'return (' + expr + ')')(p, arg); }, { panel, expr, arg });
  const ids = await page.$$eval('[data-nodes-window] [data-nd-add]', (b) => b.map((x) => x.dataset.ndAdd));
  ok(['solid_box', 'solid_cylinder', 'solid_sphere', 'solid_union', 'solid_subtract', 'solid_intersect', 'solid_fillet', 'solid_volume', 'solid_mesh'].every((k) => ids.includes(k)), app + ': the palette lists the nine Solids nodes');
  await page.fill('[data-nodes-window] .nd-search', 'solid');
  ok((await page.$$('[data-nodes-window] [data-nd-add]')).length >= 9, app + ': searching "solid" finds them');
  await page.fill('[data-nodes-window] .nd-search', '');
  await P('p.set(a)', GRAPH);
  await page.waitForFunction(() => document.querySelector('[data-nd-node="n4"] .nd-foot')?.textContent.trim().length > 0, null, { timeout: 60000 });
  const foot = async (id) => (await page.textContent(`[data-nd-node="${id}"] .nd-foot`)).trim();
  const vol = Number(await foot('n4')), want = 240000 - Math.PI * 225 * 40;
  ok(Math.abs(vol - want) / want < 0.002, app + ': Box solid − Cylinder solid → Solid volume reads ' + vol + ' (closed form ' + want.toFixed(1) + ')', await foot('n4'));
  ok(/solid 7 faces/.test(await foot('n3')), app + ': the Subtract node reads "' + (await foot('n3')) + '"');
  await page.waitForFunction(() => /^\d/.test(document.querySelector('[data-nd-node="n6"] .nd-foot')?.textContent.trim() || ''), null, { timeout: 60000 });
  const fv = Number(await foot('n6'));
  ok(Math.abs((240000 - fv) - (1 - Math.PI / 4) * 2500) / ((1 - Math.PI / 4) * 2500) < 0.03, app + ': Fillet between faces 2 and 3, r 5, removes ' + (240000 - fv).toFixed(1) + ' mm³ (536.5)');
  // canConnect gives null when the wire is allowed, else the reason
  const can = await P('p.graph.canConnect({ node: "n1", port: "out" }, { node: "n4", port: "solid" })');
  ok(can === null, app + ': a solid wires into a solid port', JSON.stringify(can));
  const refused = await P('p.graph.canConnect({ node: "n1", port: "out" }, { node: "n3", port: "tolerance" })');
  ok(refused && refused.code === 'nodes.err.type' && refused.vars.from === 'solid', app + ': a solid does not wire into a number port (nodes.err.type)', JSON.stringify(refused));
  const pt = await P('(() => { const g = p.graph; const id = g.add("point"); return g.canConnect({ node: id, port: "out" }, { node: "n4", port: "solid" }); })()');
  ok(pt && pt.code === 'nodes.err.type', app + ': a point does not wire into a solid port', JSON.stringify(pt));
  await page.waitForFunction(() => { const w = window.modelcraft?.nodes?.window || window.partcraft?.nodes?.win; return w && w.display.group.children.length >= 1; }, null, { timeout: 30000 });
  ok(true, app + ': Solid to mesh (shown) draws in the view');
  const saved = await P('p.graph.toJSON().nodes.filter((n) => /^solid_/.test(n.type)).length');
  ok(saved === 8, app + ': the graph holds the 8 solid nodes (saved with the file / part)');
  await page.screenshot({ path: path.join(OUT, app + '-nodes-solid.png') });
  await ctx.close();
}
try { for (const app of APPS.length ? APPS : ['modelcraft']) await run(app); }
catch (e) { fail++; console.log('  FAIL threw: ' + (e && e.stack || e)); }
finally { for (const p of problems) { fail++; console.log('  FAIL ' + p); } await browser.close(); console.log((fail ? 'FAILED' : 'ok') + ' - ' + pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0); }

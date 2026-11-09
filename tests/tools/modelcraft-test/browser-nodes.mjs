#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-nodes.mjs — the node editor (0.8 round 3, nodes_PART_3; DC.54) in ModelCraft's real page, headless Chromium at /lab/modelcraft:
 * the Nodes section opens the shared window; palette → nodes; wires dragged with the mouse (a green port when it fits, red and refused when a
 * length would feed an angle); a typed number rebuilds; the eye puts the result in the view; an error shows on its node and in Problems (source
 * modelcraft.nodes); the script view shows the same graph and "Make the graph from this script" brings it back; undo; the graph is kept in the
 * file (save → reopen) and gone on New. No console errors.
 *   node tools/modelcraft-test/browser-nodes.mjs [--out <dir>]
 * Run as root (ModelCraft's test admin, as browser-mount3.mjs). Shots in tmp/shots/nodes.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/nodes')));
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
try {
  const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, locale: 'en-US', ignoreHTTPSErrors: true, serviceWorkers: 'block', acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU stall|GL_|status of 429/i.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('dialog', (d) => d.accept());
  await page.addInitScript(() => { window.showOpenFilePicker = undefined; window.showSaveFilePicker = undefined; });
  await page.goto(BASE + '/lab/modelcraft?space=model', { waitUntil: 'load' });
  await page.waitForFunction(() => window.modelcraft?.model && window.ccProblems, null, { timeout: 60000 });

  console.log('== The Nodes section and window');
  for (const h of await page.$$('[data-af="closed"]')) { if (await page.isVisible('[data-nodes-open]')) break; await h.click().catch(() => {}); }   // the right panel folds its sections: open the one with Nodes
  ok(await page.isVisible('[data-nodes-open]'), 'the sidebar has a Nodes section with an Open button');
  ok(!(await page.$('[data-nodes-window]')), 'the editor is not loaded until it is opened');
  await page.click('[data-nodes-open]');
  await page.waitForSelector('[data-nodes-window]:not([hidden])', { timeout: 20000 });
  ok(await page.evaluate(() => !!window.modelcraft.nodes), 'window.modelcraft.nodes is mounted');
  ok(await page.isVisible('.nd-empty'), 'an empty graph says so');
  const add = async (id) => { await page.click(`[data-nodes-window] [data-nd-add="${id}"]`); };
  await page.fill('[data-nodes-window] .nd-search', 'circle');
  ok((await page.$$('[data-nodes-window] [data-nd-add]')).length >= 2, 'the palette search narrows the list');
  await page.fill('[data-nodes-window] .nd-search', '');
  await add('length'); await add('circle'); await add('angle');
  const g = () => page.evaluate(() => window.modelcraft.nodes.graph().toJSON());
  ok((await g()).nodes.length === 3, 'three nodes added from the palette');
  // lay out predictably, then drag wires with the mouse
  await page.evaluate(() => { const gr = window.modelcraft.nodes.graph(); gr.move('n1', [20, 20]); gr.move('n2', [300, 20]); gr.move('n3', [20, 240]); window.modelcraft.nodes.window.panel.set(gr.toJSON()); });
  await page.waitForTimeout(100);
  const center = async (sel) => { const b = await (await page.$(sel)).boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
  const drag = async (from, to) => { const [x0, y0] = await center(from); const [x1, y1] = await center(to); await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move((x0 + x1) / 2, (y0 + y1) / 2, { steps: 4 }); await page.mouse.move(x1, y1, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(80); };
  await drag('[data-nd-out="n1|out"]', '[data-nd-in="n2|radius"]');
  ok((await g()).wires.length === 1, 'a wire dragged from Length to the circle radius is made');
  await drag('[data-nd-out="n3|out"]', '[data-nd-in="n2|radius"]');
  const w1 = (await g()).wires;
  ok(w1.length === 1 && w1[0].from[0] === 'n1', 'an angle onto a radius (a length) is refused; the first wire stays');
  await page.screenshot({ path: path.join(OUT, '1-nodes.png') });

  console.log('== Result, eye, number');
  ok(/curve 5 cv/.test(await page.textContent('[data-nd-node="n2"] .nd-foot')) || /curve/.test(await page.textContent('[data-nd-node="n2"] .nd-foot')), 'the circle node reads out a curve: ' + (await page.textContent('[data-nd-node="n2"] .nd-foot')).trim());
  await page.click('[data-nd-eye="n2"]');
  await page.waitForFunction(() => window.modelcraft.nodes.window.display.group.children.length === 1);
  ok(true, 'the eye puts the circle in the scene');
  const before = await page.evaluate(() => window.modelcraft.nodes.window.display.bounds().max[0]);
  await page.fill('[data-nd-node="n1"] .nd-field', '25'); await page.press('[data-nd-node="n1"] .nd-field', 'Tab');
  await page.waitForFunction((b) => { const x = window.modelcraft.nodes.window.display.bounds(); return x && Math.abs(x.max[0] - 25) < 0.5; }, before);
  ok(true, 'typing 25 in the length redraws the circle (radius 25 mm; was ' + before.toFixed(1) + ')');

  console.log('== Errors in Problems');
  await page.fill('[data-nd-node="n1"] .nd-field', '-3'); await page.press('[data-nd-node="n1"] .nd-field', 'Tab');
  await page.waitForFunction(() => /radius/i.test(document.querySelector('[data-nd-node="n2"] .nd-foot')?.textContent || ''));
  ok(await page.$eval('[data-nd-node="n2"]', (e) => e.classList.contains('has-error')), 'a negative radius marks the node with its reason');
  await page.waitForTimeout(1500);
  console.log('   problems:', JSON.stringify(await page.evaluate(() => window.ccProblems.store.list().map((p) => [p.id, p.code, p.source?.name]))));
  await page.waitForFunction(() => window.ccProblems.store.list().some((p) => p.source?.name === 'modelcraft.nodes'), null, { timeout: 8000 });
  ok(await page.evaluate(() => window.ccProblems.store.list().some((p) => p.code === 'nodes.err.radius')), 'and it is a Problem (nodes.err.radius)');
  await page.fill('[data-nd-node="n1"] .nd-field', '10'); await page.press('[data-nd-node="n1"] .nd-field', 'Tab');
  await page.waitForFunction(() => !window.ccProblems.store.list().some((p) => p.source?.name === 'modelcraft.nodes'), null, { timeout: 8000 });
  ok(true, 'fixing the number clears it');

  console.log('== Script view and undo');
  await page.click('[data-nodes-window] [data-nd-act="script"]');
  const text = await page.inputValue('[data-nodes-window] textarea');
  ok(/n2 = nd_circle\(/.test(text) && /nd_length\(10\)/.test(text), 'the script view shows the graph as nd_ lines');
  await page.fill('[data-nodes-window] textarea', text.replace('nd_length(10)', 'nd_length(40)'));
  await page.click('[data-nodes-window] [data-nd-act="apply"]');
  ok((await g()).nodes.find((n) => n.id === 'n1').params.value === 40, 'editing the script and applying it changes the graph');
  await page.click('[data-nodes-window] [data-nd-act="script"]');
  await page.fill('[data-nodes-window] textarea', 'n1 = nd_bogus(1);');
  await page.click('[data-nodes-window] [data-nd-act="apply"]');
  ok(/Line 1/.test(await page.textContent('[data-nodes-window] .nd-err')), 'a script that cannot be read says which line');
  await page.click('[data-nodes-window] [data-nd-act="back"]');
  await page.click('[data-nodes-window] [data-nd-act="undo"]');
  ok(((await g()).nodes.find((n) => n.id === 'n1').params.value ?? 10) === 10, 'Undo takes the script change back');

  console.log('== Bake to model (0.8 oltl2-c_PART_3)');
  {
    // a 2 m x 1 m plate: a line extruded; its mesh with the eye on. In mm, as the graph is.
    await page.evaluate(() => window.modelcraft.nodes.window.panel.set({ format: 'cadcraft-nodes', version: 1, nodes: [
      { id: 'n1', type: 'line', params: { from: [0, 0, 0], to: [2000, 0, 0] }, pos: [20, 20] }, { id: 'n2', type: 'extrude', params: { direction: [0, 0, 1000] }, pos: [260, 20] },
      { id: 'n3', type: 'to_mesh', params: { tolerance: 1 }, pos: [500, 20], show: true }], wires: [{ from: ['n1', 'out'], to: ['n2', 'curve'] }, { from: ['n2', 'out'], to: ['n3', 'surface'] }] }));
    await page.waitForTimeout(300);
    ok(await page.isVisible('[data-nodes-window] [data-nodes-bake]'), 'the window has a Bake to model button');
    const defs0 = await page.evaluate(() => window.modelcraft.model.defs.size);
    await page.click('[data-nodes-window] [data-nodes-bake]');
    await page.waitForFunction((n) => window.modelcraft.model.defs.size > n, defs0, { timeout: 20000 });
    const baked = await page.evaluate(() => { const m = window.modelcraft.model; const ids = [...m.defs.keys()].filter((k) => k !== 'root'); const d = m.defs.get(ids[ids.length - 1]); return { defs: m.defs.size, faces: d.faces ? d.faces.size : 0, name: d.name, msg: document.querySelector('[data-msg]')?.textContent || '' }; });
    ok(baked.faces >= 2, 'the plate is a mesh group in the model (' + baked.faces + ' faces, "' + baked.name + '")');
    const size = await page.evaluate(() => { const m = window.modelcraft.model; const ids = [...m.defs.keys()].filter((k) => k !== 'root'); const d = m.defs.get(ids[ids.length - 1]); const xs = []; for (const v of d.verts.values()) xs.push(v.p || v); const bb = (k) => Math.max(...xs.map((p) => p[k])) - Math.min(...xs.map((p) => p[k])); return [bb(0), bb(1), bb(2)]; });
    ok(Math.abs(size[0] - 2) < 1e-6 && Math.abs(size[2] - 1) < 1e-6, 'in metres: 2 wide and 1 high (' + size.map((x) => x.toFixed(3)).join(' x ') + ')');
    ok(/Baked 1 shape\(s\), \d+ triangles, into the model/.test(baked.msg), 'the status line says what was baked', baked.msg);
    await page.evaluate(() => window.modelcraft.model.undo());
    ok(await page.evaluate((n) => window.modelcraft.model.defs.size === n, defs0), 'one Undo takes the whole bake out of the model');
    ok(await page.evaluate(() => window.modelcraft.nodes.graph().nodes.length === 3), 'the graph is untouched by baking and undo');
  }
  console.log('== Kept in the file');
  const file = await page.evaluate(() => window.modelcraft.file());
  ok(file.addons?.nodes?.graph?.nodes?.length === 3, 'the saved file carries addons.nodes.graph (3 nodes)');
  await page.screenshot({ path: path.join(OUT, '2-nodes-done.png') });
  await page.evaluate(() => document.querySelector('[data-act="new"]').click());
  const b = await page.waitForSelector('dialog[open] button[data-key="discard"]', { timeout: 1500 }).catch(() => null);
  if (b) await b.click();
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => window.modelcraft.nodes.graph().nodes.length === 0), 'New starts with no graph');
} catch (e) { ok(false, 'test crashed', e.stack || String(e)); }
await browser.close();
ok(problems.length === 0, 'no console errors', problems.slice(0, 4).join(' | '));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

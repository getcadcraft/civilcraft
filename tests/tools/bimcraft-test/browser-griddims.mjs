#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-griddims.mjs — 0.10.1 (support #1509) in the real page, /lab, headless: the dimension tool with Direction left on Horizontal
 * between two walls that run left to right turns to Vertical and measures their spacing (typing the value then moves the wall); the same
 * the other way round; a picked grid line's "From line X" field moves it, for numbered and for lettered lines.
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-griddims.mjs [--shots <dir>]      run as root (a test admin session)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimgriddims'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const throttled = new Set();
page.on('response', (r) => { if (r.status() === 429) throttled.add(r.url()); });
await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.setItem('cc-autofocus', 'off'); localStorage.removeItem('bimcraft.walls'); } catch (e) { /* none */ } });
await page.reload({ waitUntil: 'networkidle' });
const quiet = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const settled = async () => { await quiet(); await page.waitForTimeout(350); await quiet(); };
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, o) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, o); };
const walls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => ({ guid: w.guid, a: w.a, b: w.b, t: w.t, len: w.len })));
const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
const tool = async (menu, name) => { if (menu && !(await page.isVisible(`[data-mtool="${name}"]`))) { await page.click(`[${menu}] > summary`); } await page.click(`[data-mtool="${name}"]`); await settled(); };
const setField = async (sel, v) => { await page.fill(sel, v); await page.press(sel, 'Enter'); await settled(); };
const imp = (mod) => `new URL('./${mod}', [...document.scripts].map((s) => s.src).find((s) => /\\/bimcraft\\.js/.test(s)) || location.href)`;
const gridTool = async () => { if (!(await page.isVisible('[data-mtool="grid"]'))) await page.click('[data-res-tools] > summary'); await page.click('[data-mtool="grid"]'); await settled(); };
const hz = (W, y) => W.find((w) => near(w.a[1], y, 1) && near(w.b[1], y, 1));
const vt = (W, x) => W.find((w) => near(w.a[0], x, 1) && near(w.b[0], x, 1));
/** The saved dimensions, resolved: [{ guid, id, axis, value }] */
const dims = () => page.evaluate(async (u) => {
  const D = await import(eval(u)), api = window.bimcraftGrids.api, ed = api.ed();
  const { ModelWriter } = await import(eval(u.replace('wall-dimensions.js', 'model-write.js')));
  return D.readWallDimensions(new ModelWriter(ed.W, ed.api, ed.mid)).map((d) => ({ guid: d.guid, id: d.id, axis: d.axis, value: D.resolveDimension(d, window.bimcraftPlan.state.data.walls).value }));
}, imp('wall-dimensions.js'));
const pickDim = async (id) => { await page.click('[data-mtool="select"]'); await settled(); await page.evaluate((id) => { const api = window.bimcraftGrids.api; api.host.select([api.kb() + id]); }, id); await page.waitForSelector('[data-mp-dimvalue]'); };
const axes = () => page.evaluate(() => (window.bimcraftGrids.state.grids.find((g) => g.own)?.axes || []).map((x) => ({ tag: x.tag, a: x.a, b: x.b })));
try {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Grid dimensions'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);
  await tool('data-wall-shapes', 'wrect');
  await planClick(0, 0); await planClick(8000, 5000); await settled();
  let W = await walls();
  ok(W.length === 4, 'a room 8000 x 5000', W.length);

  console.log('== Dimension, Direction Horizontal, between the two walls that run left to right');
  await tool('data-annot-tools', 'wallDimension');
  const dirSel = '[data-mopts="wallDimension"] select >> nth=1';
  ok(await page.$eval('[data-mopts="wallDimension"]', (r) => r.querySelectorAll('select')[1].value) === 'x', 'Direction starts on Horizontal');
  await page.selectOption('[data-mopts="wallDimension"] select >> nth=0', 'center');
  await planClick(2000, 0); await planClick(2600, 5000); await planClick(-900, 2500); await settled();
  let D = await dims();
  ok(D.length === 1 && D[0].axis === 'y' && near(D[0].value, 5000, 1), 'the dimension turned to Vertical and reads the spacing, 5000 (before: Horizontal, 600 along the walls)', D);
  ok(await page.$eval('[data-mopts="wallDimension"]', (r) => r.querySelectorAll('select')[1].value) === 'y', 'the Direction list says Vertical now');
  await pickDim(D[0].id);
  await setField('[data-mp-dimvalue]', '4200');
  W = await walls();
  ok(hz(W, 0) && hz(W, 4200) && !hz(W, 5000), 'typing 4200: the second wall moved, the first holds', W.map((w) => [w.a, w.b]));
  await shot('1-dim-vertical');

  console.log('== Direction Vertical, between the two walls that run up');
  await tool('data-annot-tools', 'wallDimension');
  await page.selectOption('[data-mopts="wallDimension"] select >> nth=1', 'y');
  await planClick(0, 1000); await planClick(8000, 1700); await planClick(4000, -900); await settled();
  D = await dims();
  const d2 = D.find((d) => d.axis === 'x');
  ok(D.length === 2 && d2 && near(d2.value, 8000, 1), 'the dimension turned to Horizontal and reads 8000', D);
  await pickDim(d2.id);
  await setField('[data-mp-dimvalue]', '7000');
  W = await walls();
  ok(vt(W, 0) && vt(W, 7000), 'typing 7000: the east wall moved', W.map((w) => [w.a, w.b]));
  void dirSel;

  console.log('== Grid: a picked line\'s spacing, typed');
  await gridTool();
  await page.click('[data-grid-place]');
  await page.waitForSelector('[data-grid-dialog]');
  await page.fill('[data-gp-nu]', '3'); await page.fill('[data-gp-su]', '3000'); await page.fill('[data-gp-nv]', '3'); await page.fill('[data-gp-sv]', '2000');
  await page.click('[data-gp-ok]');
  await planClick(500, 600); await settled();   // inside the room, so every line is in view
  let A = await axes();
  ok(A.length === 6, 'a 3 x 3 grid', A.map((x) => x.tag));
  const g = (tag) => A.find((x) => x.tag === tag);
  ok(await page.isHidden('[data-grid-space-row]'), 'no line picked: no spacing field');
  // numbered line 2 (runs up the page; spaced left to right). Click it away from the crossings.
  await planClick(g('2').a[0], 1500); await settled();
  await page.waitForSelector('[data-grid-space]', { state: 'visible' });
  ok(/1/.test(await page.textContent('[data-grid-space-label]')) && /3000/.test((await page.inputValue('[data-grid-space]')).replace(/[\s,]/g, '')), 'line 2 picked: "From line 1" 3000', await page.inputValue('[data-grid-space]'));
  await setField('[data-grid-space]', '4500');
  A = await axes();
  ok(near(Math.abs(g('2').a[0] - g('1').a[0]), 4500, 0.5) && near(Math.abs(g('3').a[0] - g('1').a[0]), 6000, 0.5), 'typing 4500: line 2 is 4500 from line 1, line 3 stayed', A);
  // lettered line B (runs across; spaced up the page)
  await planClick(2000, g('B').a[1]); await settled();
  await page.waitForFunction(() => /A/.test(document.querySelector('[data-grid-space-label]')?.textContent || ''));
  ok(/2000/.test((await page.inputValue('[data-grid-space]')).replace(/[\s,]/g, '')), 'line B picked: "From line A" 2000', await page.inputValue('[data-grid-space]'));
  await setField('[data-grid-space]', '3200');
  A = await axes();
  ok(near(Math.abs(g('B').a[1] - g('A').a[1]), 3200, 0.5) && near(Math.abs(g('C').a[1] - g('A').a[1]), 4000, 0.5), 'typing 3200: line B is 3200 from line A, line C stayed', A);
  // the first line measures from the second
  await planClick(2000, g('A').a[1]); await settled();
  await page.waitForFunction(() => /B/.test(document.querySelector('[data-grid-space-label]')?.textContent || ''));
  await setField('[data-grid-space]', '4000');
  A = await axes();
  ok(near(Math.abs(g('B').a[1] - g('A').a[1]), 4000, 0.5), 'line A, the first: 4000 from line B', A);
  await page.click('[data-act="undo"]'); await page.waitForTimeout(600); await settled();
  A = await axes();
  ok(near(Math.abs(g('B').a[1] - g('A').a[1]), 3200, 0.5), 'one Undo puts line A back', A);
  await shot('2-grid-spacing');
  const real = problems.filter((m) => !(/429/.test(m) && [...throttled].every((u) => /\/api\/v1\/hardware/.test(u))));
  if (throttled.size) console.log('   (429 from: ' + [...throttled].join(', ') + ')');
  ok(real.length === 0, 'no console errors', real.slice(0, 4));
} catch (e) { fail++; console.log('  FAIL ' + e.message); console.log(problems.slice(0, 4)); await shot('zz-error'); }
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

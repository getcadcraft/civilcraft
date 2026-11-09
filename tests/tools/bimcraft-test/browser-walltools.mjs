#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-walltools.mjs — 0.9 WT.2, WT.3, WT.4, WT.7, FX.67, D3 (session walls-09) in the real page, /lab, headless: a rectangle of walls from the
 * Shapes menu (one undo step), a polygon, Split and the left part moved (spec test 6), Offset with a typed distance, Box stretch, edit by
 * dimension and Lock dimension in Properties, lock a wall to a grid line and move the line, Measure from on the model bar, the Wall row's
 * Shape list, placement offset and Join off on the Wall tool, Grow from in Properties.
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-walltools.mjs [--shots <dir>]      run as root (a test admin session)
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimwtools'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
// the anonymous hardware report is throttled per network (30 an hour): after many runs from this machine it answers 429; not this test's
const throttled = new Set();
page.on('response', (r) => { if (r.status() === 429) throttled.add(r.url()); });
await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('bimcraft.walls'); } catch (e) { /* none */ } });
await page.reload({ waitUntil: 'networkidle' });
const quiet = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const settled = async () => { await quiet(); await page.waitForTimeout(350); await quiet(); };   // a Redo's rebuild starts a moment after the click
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, o) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, o); };
const hover = async (x, y) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); };
const walls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => ({ guid: w.guid, a: w.a, b: w.b, t: w.t, len: w.len, joins: (w.joins || []).length, joinOff: w.joinOff })));
const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
// Undo / Redo rebuild the model from bimcraft.js (not the plan's own queue): wait until the 3D view has the model back
const rebuilt = () => page.waitForFunction(() => !/Working/.test(document.body.innerText.slice(0, 200000)), null, { timeout: 90000 }).catch(() => {});
const undo = async () => { await page.click('[data-act="undo"]'); await page.waitForTimeout(400); await rebuilt(); await settled(); };
const tool = async (menu, name) => { if (menu) { await page.click(`[${menu}] > summary`); } await page.click(`[data-mtool="${name}"]`); await settled(); };
const typed = async (v) => { await page.fill('[data-model-typed]', v); await page.press('[data-model-typed]', 'Enter'); await settled(); };
const setField = async (sel, v) => { await page.fill(sel, v); await page.press(sel, 'Enter'); await settled(); };
const pick = async (x, y) => { await page.click('[data-mtool="select"]'); await settled(); await planClick(x, y); await settled(); };
const imp = (mod) => `new URL('./${mod}', [...document.scripts].map((s) => s.src).find((s) => /\\/bimcraft\\.js/.test(s)) || location.href)`;
const gridTool = async () => { if (!(await page.isVisible('[data-mtool="grid"]'))) await page.click('[data-res-tools] > summary'); await page.click('[data-mtool="grid"]'); await settled(); };
const hz = (W, y) => W.find((w) => near(w.a[1], y, 1) && near(w.b[1], y, 1));
const vt = (W, x) => W.find((w) => near(w.a[0], x, 1) && near(w.b[0], x, 1));
try {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Wall tools'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);

  console.log('== WT.2 Rectangle from the Shapes menu');
  await tool('data-wall-shapes', 'wrect');
  ok(await page.evaluate(() => !document.querySelector('[data-mopts="wall"]').hidden), 'the Wall row (type, reference, outside, top, offset, join) shows with the Rectangle tool');
  ok(await page.$eval('[data-model-wallshape]', (s) => s.value) === 'rect', 'the Wall row\'s Shape list says Rectangle');
  await planClick(0, 0); await planClick(5000, 4000); await settled();
  let W = await walls();
  ok(W.length === 4 && W.every((w) => w.joins === 2), 'two clicks: four walls, each joined at both ends', W);
  await shot('1-rectangle');
  await undo();
  ok((await walls()).length === 0, 'one Undo takes the four walls away');
  await page.click('[data-act="redo"]'); await page.waitForTimeout(400); await rebuilt(); await settled();
  ok((await walls()).length === 4, 'Redo brings them back');

  console.log('== WT.2 Polygon (5 sides), then undo');
  await tool('data-wall-shapes', 'wpoly');
  await page.fill('[data-wall-sides]', '5'); await page.press('[data-wall-sides]', 'Tab');
  await planClick(2500, 2000); await planClick(3500, 2000); await settled();   // inside the room, in view
  W = await walls();
  ok(W.length === 9 && W.slice(4).every((w) => near(w.len, 2 * 1000 * Math.sin(Math.PI / 5), 0.5)), 'five walls of 1175.6 (2 R sin 36 deg, R 1000)', W.slice(4).map((w) => w.len));
  await shot('2-polygon');
  await undo();

  console.log('== WT.4 Split, then move the left part down 200 (spec test 6)');
  await tool('data-wall-tools', 'wsplit');
  await planClick(2500, 0); await settled();
  W = await walls();
  const left = W.find((w) => near(Math.max(w.a[0], w.b[0]), 2500, 1) && near(w.a[1], 0, 1)), right = W.find((w) => near(Math.min(w.a[0], w.b[0]), 2500, 1) && near(w.a[1], 0, 1));
  ok(W.length === 5 && left && right, 'two walls where the bottom wall was, meeting at 2500', W);
  await pick(1250, 0);
  const [gx, gy] = await at(1250, 0), [hx, hy] = await at(1250, -200);
  await page.mouse.move(gx, gy); await page.mouse.down(); await page.mouse.move((gx + hx) / 2, (gy + hy) / 2, { steps: 4 }); await page.mouse.move(hx, hy, { steps: 4 }); await page.mouse.up(); await settled();
  W = await walls();
  const L2 = W.find((w) => w.guid === left.guid), west = vt(W, 0);
  ok(L2 && near(Math.min(L2.a[1], L2.b[1]), -200, 11) && west && near(Math.min(west.a[1], west.b[1]), Math.min(L2.a[1], L2.b[1]), 0.5), 'the left part moved down and still joins the left wall at its corner', { L2, west });
  await shot('3-split-moved');
  await undo(); await undo();
  ok((await walls()).length === 4, 'two Undos: the move, then the split');

  console.log('== WT.3 Offset: the east wall 500 out, typed');
  await tool('data-wall-tools', 'woffset');
  await planClick(5000, 2000); await hover(5600, 2000);
  await typed('500');
  W = await walls();
  ok(vt(W, 5500) && hz(W, 0) && near(Math.max(hz(W, 0).a[0], hz(W, 0).b[0]), 5500), 'the east wall moved 500 out, the walls joined to it stretched', W);
  await undo();

  console.log('== WT.3 Box stretch: the north wall and the ends inside the box go 600 up');
  await tool('data-wall-tools', 'wbox');
  await planClick(-1000, 3500); await planClick(7000, 4500); await planClick(0, 4000); await planClick(0, 4600); await settled();
  W = await walls();
  ok(hz(W, 4600) && vt(W, 0) && near(Math.max(vt(W, 0).a[1], vt(W, 0).b[1]), 4600), 'the north wall moved 600, the side walls stretched 600', W);
  await shot('4-box');
  await undo();

  console.log('== WT.3 Edit by dimension and Lock dimension (spec test 4)');
  W = await walls();
  await page.evaluate(async ([u, west, east, lv]) => {
    const D = await import(eval(u));
    const api = window.bimcraftGrids.api;
    api.commit(D.saveWallDimension({ level: lv, view: 'plan:' + lv, axis: 'x', offset: 600, refs: [{ wall: west, reference: 'center', station: 0.5 }, { wall: east, reference: 'center', station: 0.5 }] }), { label: 'Dimension', verb: 'Drew' });
  }, [imp('wall-dimensions.js'), vt(W, 0).guid, vt(W, 5000).guid, await page.evaluate(() => window.bimcraftPlan.state.data.levels[0].guid)]);
  await settled();
  // pick the dimension (its key) and type a new value
  await page.evaluate(async (u) => { const D = await import(eval(u)), api = window.bimcraftGrids.api, ed = api.ed(); const { ModelWriter } = await import(eval(u.replace('wall-dimensions.js', 'model-write.js'))); const d = D.readWallDimensions(new ModelWriter(ed.W, ed.api, ed.mid))[0]; api.host.select([api.kb() + d.id]); }, imp('wall-dimensions.js'));
  await page.waitForSelector('[data-mp-dimvalue]');
  await setField('[data-mp-dimvalue]', '6000');
  W = await walls();
  ok(vt(W, 0) && vt(W, 6000) && near(hz(W, 0).len, 6000, 0.5), 'typing 6000: the east wall moves, the west wall holds, the walls between stretch', W);
  await page.evaluate(async (u) => { const D = await import(eval(u)), api = window.bimcraftGrids.api, ed = api.ed(); const { ModelWriter } = await import(eval(u.replace('wall-dimensions.js', 'model-write.js'))); const d = D.readWallDimensions(new ModelWriter(ed.W, ed.api, ed.mid))[0]; api.host.select([api.kb() + d.id]); }, imp('wall-dimensions.js'));
  await page.waitForSelector('[data-mp-dimlock]');
  await page.click('[data-mp-dimlock]'); await settled();
  await pick(0, 2000);
  await page.waitForSelector('[data-mp-move]');
  await setField('[data-mp-move]', '400');   // the west wall 400 out (west)
  W = await walls();
  ok(vt(W, -400) && vt(W, 5600), 'the dimension is locked: move the west wall 400 out, the east wall follows (still 6000)', W);
  await shot('5-dim-locked');
  await undo(); await undo(); await undo(); await undo();

  console.log('== WT.7 Lock a wall to a grid line, move the line');
  await gridTool();
  await planClick(0, -2000); await planClick(0, 6000); await settled();
  W = await walls();
  await pick(0, 2000);
  await page.waitForSelector('[data-mp-lockgrid]');
  const opt = await page.$$eval('[data-mp-lockgrid] option', (o) => o.map((x) => x.value).find((v) => v.startsWith('line:')));
  await page.selectOption('[data-mp-lockgrid]', opt); await settled();
  await pick(0, 2000);
  ok(await page.$('[data-mp-holds]') !== null, 'Properties lists the lock (with Unlock)');
  await gridTool();
  await planClick(0, 5600); await settled();
  await page.waitForSelector('[data-grid-move]', { state: 'visible' });
  await setField('[data-grid-move]', '800');   // drawn south to north: + is west
  W = await walls();
  ok(vt(W, -800) && near(hz(W, 0).len, 5800, 0.5), 'grid line moved 800 west: the wall locked to it followed, the room is 5800 wide', W);
  await shot('6-grid-lock');
  await pick(-800, 2000);
  let refusedMsg = '';
  await setField('[data-mp-move]', '300');
  refusedMsg = await page.evaluate(() => document.body.innerText.includes('A lock holds that wall'));
  ok(refusedMsg && vt(await walls(), -800), 'moving the locked wall itself is refused, and the plan says why');
  await undo(); await undo(); await undo();   // the move of the line, the lock, the line

  console.log('== D3 Measure from on the model bar; FX.67 Grow from');
  await page.selectOption('[data-model-from]', 'outside'); await settled();
  const dims = await page.evaluate(() => (window.bimcraftPlan.view.scene.dims || []).map((d) => d.from));
  ok(dims.length && dims.every((f) => f === 'outside' || f === undefined), 'the plan\'s wall dimensions now read the outside face', dims.slice(0, 4));
  await pick(2500, 0);
  ok(await page.$eval('[data-mp-from]', (s) => s.value) === 'outside', 'and Properties\' Measure from follows (one setting)');
  await page.selectOption('[data-model-from]', 'center'); await settled();
  await pick(2500, 0);
  await page.selectOption('[data-mp-grow]', 'end'); await settled();
  await page.focus('[data-mp-len]');
  ok(await page.evaluate(() => !!window.bimcraftPlan.state.fixedMark), 'with the Length field in use, the plan marks the side that holds');
  await setField('[data-mp-len]', '6000');
  W = await walls();
  ok(vt(W, -1000) && vt(W, 5000), 'Grow from: End holds: the start goes 1000 back, the west wall moves square with it', W);
  await undo();

  console.log('== WT.2 Arc by centre, tangent arc');
  await tool('data-wall-shapes', 'warcc');
  await planClick(2500, 6500); await planClick(4500, 6500); await planClick(2500, 8500); await settled();
  W = await walls();
  const arc = W.find((w) => near(w.a[0], 4500, 1) && near(w.a[1], 6500, 1));
  ok(arc && near(arc.len, Math.PI * 1000, 1), 'centre, start, end: a quarter circle of radius 2000 (3141.6 long)', arc);
  await tool('data-wall-shapes', 'wtan');
  await planClick(2500, 8500);
  await planClick(500, 6500); await settled();
  W = await walls();
  const tanW = W.find((w) => near(w.a[0], 2500, 1) && near(w.a[1], 8500, 1));
  ok(tanW && near(tanW.len, Math.PI * 1000, 1), 'tangent arc from its end to (500, 6500): the next quarter of the same circle', W.slice(-3));
  await shot('7-arcs');
  await undo(); await undo();

  console.log('== WT.2 Pick lines (Tab: the chain) and Trace outline, on drafting lines');
  await page.click('[data-annot-tools] > summary'); await page.click('[data-mtool="drect"]'); await settled();
  await planClick(-3500, -3000); await planClick(-1500, -1000); await settled();
  const n0 = (await walls()).length;
  await tool('data-wall-shapes', 'wpick');
  await hover(-2500, -3000); await page.keyboard.press('Tab'); await planClick(-2500, -3000); await settled();
  W = await walls();
  ok(W.length === n0 + 4 && W.slice(n0).every((w) => near(w.len, 2000, 5)), 'Tab then a click on the drafted rectangle: four walls on its four lines', W.slice(n0));
  await undo();
  await tool('data-wall-shapes', 'wtrace');
  await planClick(-2500, -2000); await settled();
  W = await walls();
  ok(W.length === n0 + 4, 'Trace outline: a click inside the drafted rectangle walls it', W.length - n0);
  await undo();

  console.log('== WT.4 Delete segment, Rejoin');
  await tool('data-wall-tools', 'wdelseg');
  await planClick(1000, 0); await planClick(2000, 0); await settled();
  W = await walls();
  ok(W.length === 5 && W.some((w) => near(Math.max(w.a[0], w.b[0]), 1000, 1) && near(w.a[1], 0, 1)) && W.some((w) => near(Math.min(w.a[0], w.b[0]), 2000, 1) && near(w.a[1], 0, 1)), 'two clicks on the bottom wall: the piece 1000-2000 is gone, two walls left', W);
  await tool('data-wall-tools', 'wrejoin');
  await planClick(500, 0); await planClick(3500, 0); await settled();
  W = await walls();
  ok(W.length === 4 && hz(W, 0) && near(hz(W, 0).len, 5000, 1), 'Rejoin: the bottom wall is one 5000 wall again', W);
  await shot('8-rejoin');
  await undo(); await undo();

  console.log('== WT.3 Align and lock to a grid line, then move the line');
  await page.click('[data-model-fit]'); await page.waitForTimeout(300);
  await page.click('[data-mtool="wall"]'); await settled();
  await planClick(-800, 500); await planClick(-800, 3500); await page.keyboard.press('Escape'); await settled();
  await gridTool();
  await planClick(-2000, 0); await planClick(-2000, 4000); await settled();
  await tool('data-wall-tools', 'walign');
  await page.check('[data-wall-lock]');
  await planClick(-2000, 3800); await planClick(-800, 2000); await settled();
  W = await walls();
  ok(vt(W, -2000), 'Align and lock: the wall moved onto the grid line', W.slice(-1));
  await shot('9-aligned');
  await gridTool();
  await planClick(-2000, 3800); await settled();
  await page.waitForSelector('[data-grid-move]', { state: 'visible' });
  await setField('[data-grid-move]', '500');   // drawn south to north: + is west
  W = await walls();
  ok(vt(W, -2500), 'the grid line moved 500 west: the locked wall followed', W.slice(-1));
  await undo(); await undo(); await undo(); await undo();

  console.log('== FX.65 in Properties: outside face holds, the wall gets thicker, the corners follow');
  await pick(2500, 0);
  await page.selectOption('[data-mp-just]', 'exterior'); await settled();
  await pick(2500, 0);
  W = await walls();
  const S0 = hz(W, 0), out0 = S0.a[1] + (S0.t / 2) * -1;   // drawn anticlockwise: its outside is on the right (south), face y = -t/2
  await setField('[data-mp-thick]', '300');
  W = await walls();
  const S1 = W.find((w) => w.guid === S0.guid);
  ok(S1 && near(S1.t, 300, 0.5) && near(S1.a[1] - S1.t / 2, out0, 0.5) && near(vt(W, 0)?.b[1] ?? vt(W, 0)?.a[1], S1.a[1], 0.5), 'thickness 300: the outside face stays at ' + out0.toFixed(1) + ', the wall grows inward and both corners follow', { S1, west: vt(W, 0) });
  await undo(); await undo();

  console.log('== FX.67 Alt-drag: a move that breaks the joins');
  await pick(2500, 4000);
  const [ax, ay] = await at(2500, 4000), [bx, by] = await at(2500, 4800);
  await page.mouse.move(ax, ay); await page.keyboard.down('Alt'); await page.mouse.down(); await page.mouse.move((ax + bx) / 2, (ay + by) / 2, { steps: 4 }); await page.mouse.move(bx, by, { steps: 4 }); await page.mouse.up(); await page.keyboard.up('Alt'); await settled();
  W = await walls();
  const moved = W.find((w) => near(w.a[1], 4800, 12) && near(w.b[1], 4800, 12));
  ok(moved && moved.joins === 0 && vt(W, 0) && near(Math.max(vt(W, 0).a[1], vt(W, 0).b[1]), 4000, 0.5), 'Alt + drag the middle grip: the wall moves alone, its joins break, the side walls stay', { moved, west: vt(W, 0) });
  await undo();

  console.log('== WT.3 Set on the Wall tool: placement offset 300 and Join off');
  await page.click('[data-mtool="wall"]'); await settled();
  await page.selectOption('[data-model-wallshape]', 'straight');
  await setField('[data-wall-offset]', '300');
  await page.uncheck('[data-wall-join]');
  await planClick(1000, 1500); await planClick(3000, 1500); await page.keyboard.press('Escape'); await settled();
  W = await walls();
  const off = W.find((w) => near(w.a[1], 1800, 1));
  ok(off && off.joinOff?.a && off.joinOff?.b, 'the wall is drawn 300 to the left of the line clicked, with Join off at both ends', W.slice(-1));
  await page.selectOption('[data-model-wallshape]', 'rect');
  ok(await page.$eval('[data-mtool="wrect"]', (b) => b.getAttribute('aria-pressed')) === 'true', 'picking Rectangle in the Wall row\'s Shape list switches to the Rectangle tool');
  const real = problems.filter((m) => !(/429/.test(m) && [...throttled].every((u) => /\/api\/v1\/hardware/.test(u))));
  if (throttled.size) console.log('   (429 from: ' + [...throttled].join(', ') + ')');
  ok(real.length === 0, 'no console errors', real.slice(0, 4));
} catch (e) { fail++; console.log('  FAIL ' + e.message); console.log(problems.slice(0, 4)); await shot('zz-error'); }
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

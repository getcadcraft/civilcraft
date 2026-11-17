#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-walljoins.mjs — 0.9 WT.5 (join style, layer priority), FX.70 (Disallow join as a tool), FX.62 (Align keeps joins), FX.66 (a group Move
 * with the Move tool) and WT.1 (the wall icons on the Walls menu) in the real page, /lab, headless (session walls-join-10):
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-walljoins.mjs [--shots <dir>]      run as root (a test admin session)
 * Walls are int-2x4 or the Wall tool's default type; T = their thickness, read from the page. Expected values are worked out beside each check.
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimwjoins'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const throttled = new Set();   // the anonymous hardware report answers 429 after many runs from this machine: not this test's
page.on('response', (r) => { if (r.status() === 429) throttled.add(r.url()); });
await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('bimcraft.walls'); } catch (e) { /* none */ } });
await page.reload({ waitUntil: 'networkidle' });
const quiet = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const settled = async () => { await quiet(); await page.waitForTimeout(350); await quiet(); };
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, o) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, o); };
const hover = async (x, y) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); };
const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) s += p[i][0] * p[(i + 1) % p.length][1] - p[i][1] * p[(i + 1) % p.length][0]; return Math.abs(s / 2); };
const walls = () => page.evaluate(() => { const S = window.bimcraftPlan.state; return S.data.walls.map((w) => ({ guid: w.guid, key: window.bimcraftRes.api.kb() + w.id, a: w.a, b: w.b, t: w.t, joins: (w.joins || []).map((j) => ({ kind: j.kind, pos: j.pos, other: j.other, style: j.style || 'mitre', through: j.through === true })), joinOff: { a: !!w.joinOff?.a, b: !!w.joinOff?.b }, outline: [...(S.outlines?.get(w.guid) || [])].map((q) => [q[0], q[1]]) })); });
const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
const rebuilt = () => page.waitForFunction(() => !/Working/.test(document.body.innerText.slice(0, 200000)), null, { timeout: 90000 }).catch(() => {});
const undo = async () => { await page.click('[data-act="undo"]'); await page.waitForTimeout(400); await rebuilt(); await settled(); };
const tool = async (menu, name) => { if (menu) { await page.click(`[${menu}] > summary`); } await page.click(`[data-mtool="${name}"]`); await settled(); };
const pickKeys = (keys) => page.evaluate((k) => window.bimcraftVis.pick(k), keys);
const hz = (W, y) => W.find((w) => near(w.a[1], y, 1) && near(w.b[1], y, 1));
const vt = (W, x) => W.find((w) => near(w.a[0], x, 1) && near(w.b[0], x, 1));
const styleAt = (W, g1, g2) => W.find((w) => w.guid === g1).joins.find((j) => j.other === g2 && j.kind === 'L');
try {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Wall joins'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);

  console.log('== WT.1 the Join tools are on the Walls menu with their own icons');
  await page.click('[data-wall-tools] > summary');
  const menu = await page.evaluate(() => ['wjoinstyle', 'wdisjoin'].map((n) => { const b = document.querySelector(`[data-wall-tools] [data-mtool="${n}"]`); return { n, shown: !!b && b.offsetParent !== null, icon: b?.querySelector('[data-ccic]')?.dataset.ccic || '', svg: !!b?.querySelector('svg'), label: b?.textContent.trim() }; }).concat((() => { const b = document.querySelector('[data-wall-tools] [data-wall-layerprio]'); return [{ n: 'layerprio', shown: !!b && b.offsetParent !== null, icon: b?.querySelector('[data-ccic]')?.dataset.ccic || '', svg: !!b?.querySelector('svg'), label: b?.textContent.trim() }]; })()));
  ok(menu.every((m) => m.shown) && menu[0].label === 'Join style' && menu[1].label === 'Disallow join' && menu[2].label === 'Layer priority', 'Edit › Walls shows Join style, Disallow join and Layer priority', menu);
  ok(menu[0].icon === 'walljoinstyle' && menu[1].icon === 'walldisjoin' && menu[2].icon === 'walllayerprio', 'each carries its DU.1 wall icon (walljoinstyle, walldisjoin, walllayerprio)' + (menu.every((m) => m.svg) ? ', drawn as the CadCraft icon' : ' (the icon set is not loaded in this layout: the Bootstrap icon shows)'), menu);
  const every = await page.evaluate(() => [...document.querySelectorAll('[data-wall-tools] .bc-mb-menu button, [data-wall-shapes] .bc-mb-menu button')].map((b) => ({ t: b.dataset.mtool || 'layerprio', ic: b.querySelector('[data-ccic]')?.dataset.ccic || '' })));
  ok(every.length >= 16 && every.every((b) => /^wall/.test(b.ic)), 'every button of the Shapes and Walls menus names a wall icon: ' + every.length, every.filter((b) => !/^wall/.test(b.ic)));
  await shot('1-walls-menu');
  await page.click('[data-wall-tools] > summary');

  console.log('== a room 5000 x 4000');
  await tool('data-wall-shapes', 'wrect');
  await planClick(0, 0); await planClick(5000, 4000); await settled();
  let W = await walls();
  const T = W[0].t, H = T / 2, S0 = hz(W, 0), E0 = vt(W, 5000), N0 = hz(W, 4000), W0 = vt(W, 0);
  ok(W.length === 4 && near(area(S0.outline), T * 5000, 1) && near(area(E0.outline), T * 4000, 1), 'four mitred walls: south ' + T + ' x 5000, east ' + T + ' x 4000', [area(S0.outline), area(E0.outline)]);

  console.log('== WT.5 Join style: click the south-east corner');
  await tool('data-wall-tools', 'wjoinstyle');
  ok(await page.evaluate(() => !document.querySelector('[data-mopts="wjoinstyle"]').hidden && document.querySelector('[data-join-style]').disabled), 'the Join style row shows (Style, Next), empty until a corner is clicked');
  await planClick(5000, 0); await settled();
  W = await walls();
  let j = styleAt(W, S0.guid, E0.guid), th = j.through ? S0 : E0, st = j.through ? E0 : S0, len = (w) => Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
  const A = (g) => area(W.find((w) => w.guid === g).outline);
  // butt: the wall that runs through gains half a thickness (to the other's far face), the other loses it: T x (L + T/2) and T x (L - T/2)
  ok(j.style === 'butt' && near(A(th.guid), T * (len(th) + H), 1) && near(A(st.guid), T * (len(st) - H), 1), 'one click: butt; the wall that runs through is T x (L + T/2), the other T x (L - T/2)', [j, A(th.guid), A(st.guid)]);
  ok(await page.$eval('[data-join-style]', (s) => !s.disabled && s.value) === 'butt' && await page.$eval('[data-join-next]', (b) => !b.disabled), 'the row shows Butt, Next is on');
  await shot('2-butt');
  await page.click('[data-join-next]'); await settled();
  W = await walls();
  j = styleAt(W, S0.guid, E0.guid);
  ok(j.style === 'butt' && near(A(st.guid), T * (len(st) + H), 1) && near(A(th.guid), T * (len(th) - H), 1), 'Next: the other wall runs through now', [j, A(th.guid), A(st.guid)]);
  await planClick(5000, 0); await settled();
  W = await walls();
  ok(styleAt(W, S0.guid, E0.guid).style === 'square' && near(A(st.guid), T * (len(st) + H), 1), 'a second click: square off (the same shape at a right angle), the same wall runs through');
  await planClick(5000, 0); await settled();
  W = await walls();
  ok(styleAt(W, S0.guid, E0.guid).style === 'mitre' && near(A(S0.guid), T * 5000, 1) && near(A(E0.guid), T * 4000, 1), 'a third click: mitre again, both outlines as drawn');
  await undo();
  W = await walls();
  ok(styleAt(W, S0.guid, E0.guid).style === 'square', 'one Undo: square off again (each click is one step)');
  await page.selectOption('[data-join-style]', 'butt'); await settled();
  W = await walls();
  ok(styleAt(W, S0.guid, E0.guid).style === 'butt', 'the row\'s Style list sets the corner clicked last: Butt');
  await planClick(2500, 2000); await settled();
  ok(/No join here/.test(await page.textContent('[data-status]')), 'a click away from every join says so');

  console.log('== WT.5 in Properties: Join style at an end, Runs through');
  await page.click('[data-mtool="select"]'); await settled();
  await pickKeys([S0.key]); await settled(); await page.waitForTimeout(300);
  const endSel = await page.evaluate(() => ['a', 'b'].filter((e) => document.querySelector(`[data-mp-joinstyle-${e}]`)));
  const seEnd = near(S0.b[0], 5000, 1) ? 'b' : 'a';
  ok(endSel.length === 2 && await page.$eval(`[data-mp-joinstyle-${seEnd}]`, (s) => s.value) === 'butt', 'the south wall\'s Properties list Join style at start and at end; the south-east end says Butt', endSel);
  await page.selectOption(`[data-mp-joinstyle-${seEnd}]`, 'square'); await settled(); await page.waitForTimeout(300);
  W = await walls();
  ok(styleAt(W, S0.guid, E0.guid).style === 'square' && await page.$(`[data-mp-through-${seEnd}]`) !== null, 'choosing Square off there changes the corner; the Runs through list is beside it');
  await page.selectOption(`[data-mp-through-${seEnd}]`, 'this'); await settled(); await page.waitForTimeout(300);
  W = await walls();
  ok(styleAt(W, S0.guid, E0.guid).through === true && near(A(S0.guid), T * (5000 + H), 1), 'Runs through: This wall: the south wall is T x (5000 + T/2)', [styleAt(W, S0.guid, E0.guid), A(S0.guid)]);
  await shot('3-properties');

  console.log('== the style stays through a Move with the Move tool');
  await pickKeys([N0.key]); await settled();
  await page.mouse.move(10, 10); await page.keyboard.press('Shift+M');
  await planClick(2500, 4000); await planClick(2500, 4500); await settled();
  W = await walls();
  ok(near(hz(W, 4500)?.a[1], 4500, 1) && styleAt(W, S0.guid, E0.guid).style === 'square' && near(Math.max(vt(W, 5000).a[1], vt(W, 5000).b[1]), 4500, 1), 'the north wall 500 up: the side walls follow and the south-east corner keeps its style');
  await undo();

  console.log('== FX.70 Disallow join as a tool');
  await tool('data-wall-tools', 'wdisjoin');
  await planClick(4900, 4000); await settled();   // on the north wall, near its east end
  W = await walls();
  let Nw = W.find((w) => w.guid === N0.guid), endN = near(Nw.a[0], 5000, 1) ? 'a' : 'b';
  ok(Nw.joinOff[endN] === true && Nw.joins.length === 1 && /free/.test(await page.textContent('[data-status]')), 'a click near the north wall\'s east end: Disallow join there (one join left on that wall)', Nw);
  await shot('4-disjoin');
  await planClick(4900, 4000); await settled();
  W = await walls(); Nw = W.find((w) => w.guid === N0.guid);
  ok(Nw.joinOff[endN] === false && Nw.joins.length === 2, 'a second click allows it again: two joins');
  await undo(); await undo();

  console.log('== FX.62 Align keeps the joins');
  // a free wall above the room, top face at 5500 + T/2; Align top to the last picked: the north wall (top face 4000 + T/2) goes 1500 up
  await page.click('[data-mtool="wall"]'); await settled();
  await planClick(7000, 5500); await planClick(9000, 5500); await settled();
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await settled();
  W = await walls();
  const F = hz(W, 5500);
  ok(!!F && W.length === 5, 'a free wall drawn at y = 5500', W.length);
  await page.click('[data-mtool="select"]'); await settled();
  await pickKeys([N0.key, F.key]); await settled();
  await page.click('[data-res-tools] summary').catch(() => {});
  await page.evaluate(() => document.querySelector('[data-mtool="align"]').click());
  await page.selectOption('[data-mod-side]', 'top'); await page.selectOption('[data-mod-to]', 'last');
  await page.click('[data-mod-apply="align"]'); await settled();
  W = await walls();
  const N1 = W.find((w) => w.guid === N0.guid), E1 = W.find((w) => w.guid === E0.guid), W1 = W.find((w) => w.guid === W0.guid);
  ok(near(N1.a[1], 5500, 1) && near(N1.b[1], 5500, 1) && near(Math.max(E1.a[1], E1.b[1]), 5500, 1) && near(Math.max(W1.a[1], W1.b[1]), 5500, 1) && near(E1.a[0], 5000, 1) && near(E1.b[0], 5000, 1), 'Align top: the north wall is at y = 5500 and the east and west walls reach it (the corners stay joined)', [N1.a, N1.b, E1.a, E1.b]);
  ok(N1.joins.length === 2 && E1.joins.length === 2 && W.find((w) => w.guid === F.guid).joins.length === 0, 'the join records are as before');
  await shot('5-aligned');
  await undo();
  W = await walls();
  ok(near(W.find((w) => w.guid === N0.guid).a[1], 4000, 1) && near(Math.max(...['a', 'b'].map((e) => W.find((w) => w.guid === E0.guid)[e][1])), 4000, 1), 'one Undo puts the north wall and the side walls back');

  console.log('== FX.66 a group Move with the Move tool: the walls outside the group stretch');
  // the north and east walls picked together, moved 600 to the right and 400 up: their shared corner goes with them (5600, 4400); the south wall
  // stretches to x = 5600 (its end slides along its own line), the west wall to y = 4400
  await page.click('[data-mtool="select"]'); await settled();
  await pickKeys([N0.key, E0.key]); await settled();
  await page.mouse.move(10, 10); await page.keyboard.press('Shift+M');
  await planClick(5000, 4000); await planClick(5600, 4400); await settled();
  W = await walls();
  const g = (w0) => W.find((w) => w.guid === w0.guid), mx = (w, i) => Math.max(w.a[i], w.b[i]), mn = (w, i) => Math.min(w.a[i], w.b[i]);
  ok(near(g(N0).a[1], 4400, 1) && near(g(N0).b[1], 4400, 1) && near(g(E0).a[0], 5600, 1) && near(g(E0).b[0], 5600, 1) && near(mx(g(N0), 0), 5600, 1), 'the two walls moved together and keep their corner at (5600, 4400)', [g(N0).a, g(N0).b, g(E0).a, g(E0).b]);
  ok(near(mx(g(S0), 0), 5600, 1) && near(g(S0).a[1], 0, 1) && near(g(S0).b[1], 0, 1) && near(mx(g(W0), 1), 4400, 1) && near(g(W0).a[0], 0, 1) && near(mn(g(E0), 1), 0, 1) && near(mn(g(N0), 0), 0, 1), 'the south wall stretched to x = 5600 and the west wall to y = 4400; every corner is still joined', [g(S0).a, g(S0).b, g(W0).a, g(W0).b]);
  ok(W.filter((w) => w.guid !== F.guid).every((w) => w.joins.length === 2), 'four corners, each wall joined at both ends');
  await shot('6-group-move');
  await undo();
  W = await walls();
  ok(near(mx(g(S0), 0), 5000, 1) && near(g(N0).a[1], 4000, 1), 'one Undo puts all four walls back');

  console.log('== WT.5 Layer priority on the plan (Medium detail)');
  // a partition from the south wall up into the room: a T. With the view's detail on Medium the plan draws layers, cleaned at the junctions
  await page.click('[data-mtool="wall"]'); await settled();
  await planClick(2500, 0); await planClick(2500, 2500); await settled();
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await settled();
  await page.click('[data-mtool="select"]'); await settled();
  const hasRange = await page.evaluate(() => { const b = document.querySelector('[data-pb-range]'); if (b) b.click(); return !!b; });
  let rows = null;
  if (hasRange) {
    await page.waitForSelector('[data-pv-detail]', { timeout: 15000 });
    await page.selectOption('[data-pv-detail]', 'medium');
    await page.click('[data-pv-ok]'); await settled(); await page.waitForTimeout(400);
    rows = await page.evaluate(() => window.bimcraftPlan.view.scene.walls.map((w) => ({ guid: w.guid, layers: w.layers ? w.layers.length : 0, joins: w.layerJoins || 0, lines: (w.boundaries || []).filter((b) => b.join).reduce((n, b) => n + b.paths.length, 0), warn: w.graphicWarning || '' })));
  }
  ok(hasRange && rows && rows.some((r) => r.layers > 0), 'the plan\'s view range sets Medium detail: the walls are drawn with their layers', rows);
  ok(rows && rows.filter((r) => r.joins > 0).length >= 2 && rows.reduce((n, r) => n + r.lines, 0) > 0 && await page.evaluate(() => window.bimcraftPlan.state.layerPriority) === true, 'the junctions are cleaned by layer priority (rows say how many junctions; junction lines are in the scene)', rows);
  await shot('7-layer-priority');
  if (SHOTS) {   // close up on the T (the partition on the south wall) and on the south-west corner
    await page.evaluate(() => { const pv = window.bimcraftPlan.view; pv.fit({ x0: 2000, y0: -350, x1: 3000, y1: 450 }); pv.render(); });
    await page.waitForTimeout(300); await shot('7b-layer-priority-tee');
    await page.evaluate(() => { const pv = window.bimcraftPlan.view; pv.fit({ x0: -400, y0: -400, x1: 600, y1: 400 }); pv.render(); });
    await page.waitForTimeout(300); await shot('7c-layer-priority-corner');
    await page.evaluate(() => { const pv = window.bimcraftPlan.view; pv.fit(); pv.render(); });
  }
  // the switch in Settings › BimCraft › Walls turns it off: the same scene without the clean-up
  const off = await page.evaluate(() => { const c = document.querySelector('[data-walls-settings] [name="bcWallPrio"]'); if (!c) return null; c.checked = false; c.dispatchEvent(new Event('change', { bubbles: true })); return window.bimcraftPlan.view.scene.walls.map((w) => w.layerJoins || 0); });
  ok(off && off.every((n) => n === 0) && JSON.parse(await page.evaluate(() => localStorage.getItem('bimcraft.walls'))).prio === 'off', 'Settings › BimCraft › Walls › Clean wall layers…: off draws the layers as before (kept for this viewer)', off);
  await page.evaluate(() => { const c = document.querySelector('[data-walls-settings] [name="bcWallPrio"]'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); });

  console.log('== WT.5 Layer priority opens the wall assembly, a Priority per layer');
  await page.click('[data-wall-tools] > summary');
  await page.click('[data-wall-layerprio]');
  await page.waitForSelector('[data-assembly-editor]', { timeout: 15000 });
  const pr = await page.evaluate(() => [...document.querySelectorAll('[data-assembly-editor] [data-layer-priority]')].map((i) => ({ v: i.value, ph: i.placeholder })));
  ok(pr.length >= 1 && pr.every((x) => x.v === '' && /^\d+$/.test(x.ph)) && pr.some((x) => x.ph === '800') && await page.evaluate(() => [...document.querySelectorAll('[data-assembly-editor] thead th')].some((th) => th.textContent === 'Priority')), 'the editor has a Priority column: empty boxes showing each layer\'s default (structure 800)', pr);
  await shot('8-assembly-priority');
  await page.evaluate(() => document.querySelector('[data-assembly-editor]').close());

  const real = problems.filter((p) => !(/429/.test(p) && [...throttled].some((u) => /hardware/.test(u))));
  ok(real.length === 0, 'no console errors', real.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'stopped.png') }).catch(() => {});
} finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-wallshape.mjs — 0.9 WT.6 in the lab, headless: one wall, its Properties' Shape part: a gable profile typed in the
 * Profile dialog (the 3D body grows to 4500), Undo / Redo, a wall opening (a gap in the plan), a double slant, the attach lists.
 * walls-shape-10: the slanted wall's plan outline; in the elevation panel profile grips (drag, add, remove, piece, typed), a wall
 * opening dragged, resized, moved, typed and deleted, attach top by picking the ceiling, the slant handle on a wall seen end-on; a
 * section view; the four commands and the wall's own face view; in 3D an opening by two clicks, its grip, a profile grip, attach by
 * picking; Move with Copy and Copy level carrying shapes and openings; a curved shaped wall.
 *   node tools/bimcraft-test/browser-wallshape.mjs [--shots <dir>]        run as root (test admin session, never the shared login)
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimwshape'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
await page.reload({ waitUntil: 'networkidle' });
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, o) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, o); };
const walls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => ({ guid: w.guid, a: w.a, b: w.b, t: w.t, len: w.len })));
const dirMod = (w) => { const d = Math.atan2(w.b[1] - w.a[1], w.b[0] - w.a[0]) * 180 / Math.PI, m = ((d % 90) + 90) % 90; return Math.min(m, 90 - m); };
const square = (W) => W.every((w) => dirMod(w) < 0.01);
const joinedUp = (W) => W.every((w) => [w.a, w.b].every((p) => W.some((x) => x.guid !== w.guid && (Math.hypot(x.a[0] - p[0], x.a[1] - p[1]) < 1 || Math.hypot(x.b[0] - p[0], x.b[1] - p[1]) < 1))));
const undo = async () => { await page.click('[data-act="undo"]'); await settled(); };
const setField = async (sel, v) => { await page.fill(sel, v); await page.press(sel, 'Enter'); await settled(); };
const pickSouth = async () => { await page.click('[data-mtool="select"]'); await settled(); await planClick(2500, 0); await page.waitForSelector('[data-mp-square]'); };
/** Press on the wall's middle grip, drag there; options: ctrl, keep the button down. */
async function gripDrag(from, to, { ctrl = false, hold = false } = {}) {
  const [ax, ay] = await at(...from), [bx, by] = await at(...to);
  await page.mouse.move(ax, ay); await page.mouse.down();
  if (ctrl) await page.keyboard.down('Control');
  await page.mouse.move((ax + bx) / 2, (ay + by) / 2, { steps: 4 }); await page.mouse.move(bx, by, { steps: 4 });
  if (!hold) { await page.mouse.up(); if (ctrl) await page.keyboard.up('Control'); await settled(); }
}
const south = (W) => W.find((w) => Math.abs(w.a[1] + w.b[1]) / 2 < Math.abs(w.a[0] + w.b[0]) && Math.abs(w.a[1] - w.b[1]) < 1000 && Math.min(w.a[1], w.b[1]) < 1500);
const height3d = async (id) => page.evaluate((id) => { const S = window.bimcraftWallShape, b = S.bounds([S.keyOf(id)]); return b ? b.max.map((v, i) => v - b.min[i]) : null; }, id);
try {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Shape'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);
  await page.click('[data-mtool="wall"]');
  for (const [x, y] of [[0, 0], [5000, 0]]) { await planClick(x, y); await settled(); }
  await page.keyboard.press('Escape'); await settled();
  let W = await walls();
  ok(W.length === 1, 'one wall drawn', W.length);
  const id = await page.evaluate(() => window.bimcraftPlan.state.data.walls[0].id);
  const d0 = await height3d(id);
  ok(Array.isArray(d0), 'the wall is in the 3D view', d0);
  await page.click('[data-mtool="select"]'); await settled();
  await planClick(2500, 0);
  await page.waitForSelector('[data-ws-profile]', { timeout: 15000 });
  ok(await page.$('[data-ws-attachtop]') && await page.$('[data-ws-slant]') && await page.$('[data-ws-addopen]'), 'Properties has the Shape part: attach, slant, profile, openings');
  await shot('1-props');

  console.log('== a gable profile typed in the dialog');
  await page.click('[data-ws-profile]');
  await page.waitForSelector('[data-ws-pdialog]');
  await page.click('[data-ws-paddrow="top"]');
  const rows = await page.$$('[data-ws-prow="top"]');
  ok(rows.length === 3, 'three rows in the top line', rows.length);
  await rows[2].$eval('[data-ws-ps]', (i) => { i.value = '2500'; });
  await rows[2].$eval('[data-ws-pz]', (i) => { i.value = '4500'; });
  await shot('2-profile');
  await page.click('[data-ws-psave]'); await settled();
  await page.waitForTimeout(500);
  const sh = await page.evaluate(() => { const S = window.bimcraftWallShape, w = window.bimcraftPlan.state.data.walls[0]; return S.readShape(w); });
  ok(sh.profile?.top?.length === 3 && sh.profile.top[1][1] === 4500, 'the profile is stored', JSON.stringify(sh.profile));
  const d1 = await height3d(id);
  const k = d0.map((v, i) => d1[i] / v), grew = k.findIndex((r) => Math.abs(r - 1.5) < 0.02);
  ok(grew >= 0, 'the 3D body is 1.5 times as tall (3000 → 4500): the brep is drawn', JSON.stringify(k));
  await shot('3-gable');
  await undo();
  const d2 = await height3d(id);
  ok(d2 && Math.abs(d2[grew] / d0[grew] - 1) < 0.02, 'one undo: back to 3000', JSON.stringify(d2));
  await page.click('[data-act="redo"]'); await settled();

  console.log('== a wall opening');
  await planClick(2500, 0); await page.waitForSelector('[data-ws-addopen]');
  await page.click('[data-ws-addopen]'); await settled();
  const ops = await page.evaluate(() => window.bimcraftWallShape.readWallOpenings());
  ok(ops.length === 1 && Math.abs(ops[0].width - 900) < 0.5, 'one opening, 900 wide', JSON.stringify(ops.map((o) => [o.offset, o.width, o.height])));
  const pieces = await page.evaluate(() => window.bimcraftPlan.view.scene.walls.map((r) => r.pieces.length));
  ok(pieces[0] === 2, 'the plan shows a gap: two pieces', JSON.stringify(pieces));
  await planClick(500, 0); await page.waitForSelector('[data-ws-opening]');
  await page.fill('[data-ws-ooff]', '400'); await page.press('[data-ws-ooff]', 'Enter'); await settled();
  ok(Math.abs((await page.evaluate(() => window.bimcraftWallShape.readWallOpenings()))[0].offset - 400) < 0.5, 'its offset typed in Properties: 400');
  await shot('4-opening');

  console.log('== a double slant');
  await planClick(4500, 0); await page.waitForSelector('[data-ws-slant]');
  await page.selectOption('[data-ws-slant]', 'double');
  await page.fill('[data-ws-slantl]', '5'); await page.fill('[data-ws-slantr]', '-5'); await page.press('[data-ws-slantr]', 'Enter'); await settled();
  const sh2 = await page.evaluate(() => window.bimcraftWallShape.readShape(window.bimcraftPlan.state.data.walls[0]));
  ok(JSON.stringify(sh2.slant) === '[5,-5]', 'slant stored as left 5°, right -5°', JSON.stringify(sh2.slant));
  await shot('5-slant');
  const opts = await page.$$eval('[data-ws-attachtop] option', (o) => o.length);
  ok(opts === 1, 'no roof or slab yet: the attach list offers its own height only', opts);

  // ------------------------------------------------------------------------------------------ walls-shape-10 (2026-11-11)
  const EV = {
    open: async (key) => { await page.evaluate((k) => window.bimcraftElevEdit.open(k), key); await page.waitForSelector('[data-ev-dialog]'); await page.waitForTimeout(250); },
    close: async () => { await page.evaluate(() => window.bimcraftElevEdit.close()); await page.waitForTimeout(150); },
    pt: (x, y) => page.evaluate(([x, y]) => { const svg = document.querySelector('[data-ev-svg]'), q = new DOMPoint(x, -y).matrixTransform(svg.getScreenCTM()); return [q.x, q.y]; }, [x, y]),
    click: async (x, y) => { const q = await EV.pt(x, y); await page.mouse.click(q[0], q[1]); await page.waitForTimeout(120); },
    drag: async (from, to) => {
      const a0 = await EV.pt(...from), b0 = await EV.pt(...to);
      await page.mouse.move(a0[0], a0[1]); await page.mouse.down();
      await page.mouse.move((a0[0] + b0[0]) / 2, (a0[1] + b0[1]) / 2, { steps: 3 }); await page.mouse.move(b0[0], b0[1], { steps: 3 });
      await page.mouse.up(); await settled(); await page.waitForTimeout(250);
    },
    tool: async (k) => { await page.click(`[data-ev-tool="${k}"]`); await page.waitForTimeout(120); },
    type: async (sel, v) => { await page.fill(sel, v); await page.press(sel, 'Enter'); await settled(); await page.waitForTimeout(250); },
  };
  const shapeOf = (guid) => page.evaluate((g) => { const w = window.bimcraftPlan.state.data.walls.find((x) => x.guid === g); return w ? window.bimcraftWallShape.readShape(w) : null; }, guid);
  const wopen = () => page.evaluate(() => window.bimcraftWallShape.readWallOpenings().map((o) => ({ guid: o.guid, wallGuid: o.wallGuid, offset: Math.round(o.offset), width: Math.round(o.width), sill: Math.round(o.sill), height: Math.round(o.height) })));
  const mtool = async (name) => { await page.evaluate((n) => document.querySelector(`[data-mtool="${n}"]`).click(), name); await page.waitForTimeout(150); };
  const g1 = W[0].guid;

  console.log('== a slanted wall on the plan');
  const lean = await page.evaluate(() => { const sc = window.bimcraftPlan.view.scene, r = sc.walls[0]; return { ys: r.poly.map((q) => q[1]), base: (r.basePoly || []).map((q) => q[1]), below: (sc.below || []).some((b0) => b0.key === r.key) }; });
  const off5 = Math.tan(5 * Math.PI / 180) * 1200, half = W[0].t / 2;
  ok(Math.abs(Math.max(...lean.ys) - (half + off5)) < 0.01 && Math.abs(Math.min(...lean.ys) + half + off5) < 0.01, 'double slant 5° / −5° at the 1200 cut: each face is tan 5° × 1200 = 104.99 further out', [Math.max(...lean.ys), Math.min(...lean.ys)]);
  ok(lean.below && Math.abs(Math.max(...lean.base) - half) < 0.01, 'its outline at the floor is drawn with the thin lines below the cut');
  await shot('6-slant-plan');
  await planClick(4500, 0); await page.waitForSelector('[data-ws-slant]');
  await page.selectOption('[data-ws-slant]', 'none'); await settled();
  ok((await shapeOf(g1)).slant === null, 'upright again');

  console.log('== the elevation view: profile grips');
  await EV.open('elevation:south');
  await EV.click(4600, 300);
  ok((await page.$$('[data-ws-pv]')).length === 5, 'the wall picked in the south elevation: a grip on each of its five profile points', (await page.$$('[data-ws-pv]')).length);
  await shot('7-elev-grips');
  await EV.drag([2500, 4500], [2500, 4000]);
  let sp = await shapeOf(g1);
  ok(JSON.stringify(sp.profile.top) === '[[0,3000],[2500,4000],[5000,3000]]', 'the peak dragged down to 4000', JSON.stringify(sp.profile.top));
  { const q = await EV.pt(630, 3252); await page.mouse.dblclick(q[0], q[1]); await settled(); await page.waitForTimeout(250); }
  sp = await shapeOf(g1);
  ok(sp.profile.top.length === 4 && sp.profile.top[1][0] === 630 && sp.profile.top[1][1] === 3252, 'a double-click on the top line adds a point at 630 (on the line: 3252 high)', JSON.stringify(sp.profile.top));
  await EV.click(630, 3252);
  ok(await page.$('[data-ws-pv="top:1"][aria-selected="true"]'), 'a click picks that point');
  await page.keyboard.press('Delete'); await settled(); await page.waitForTimeout(250);
  sp = await shapeOf(g1);
  ok(sp.profile.top.length === 3, 'Delete removes it', JSON.stringify(sp.profile.top));
  await EV.drag([1250, 3500], [1250, 3800]);
  sp = await shapeOf(g1);
  ok(JSON.stringify(sp.profile.top) === '[[0,3300],[2500,4300],[5000,3000]]', 'the dot on the first piece dragged up 300: both its ends rise', JSON.stringify(sp.profile.top));
  await page.keyboard.press('Control+z'); await settled(); await page.waitForTimeout(300);
  sp = await shapeOf(g1);
  ok(JSON.stringify(sp.profile.top) === '[[0,3000],[2500,4000],[5000,3000]]', 'Ctrl+Z in the view: one step back', JSON.stringify(sp.profile.top));
  await EV.click(2500, 4000);
  await EV.type('[data-ws-vz]', '4200');
  sp = await shapeOf(g1);
  ok(sp.profile.top[1][1] === 4200, 'the picked point\'s height typed in the view: 4200', JSON.stringify(sp.profile.top));

  console.log('== the elevation view: wall openings');
  await EV.tool('wsopen');
  await EV.drag([3000, 500], [4000, 1500]);
  let ops2 = await wopen();
  const made = ops2.find((o) => o.offset === 3000);
  ok(ops2.length === 2 && made && made.width === 1000 && made.sill === 500 && made.height === 1000, 'a rectangle dragged on the wall face: an opening 3000 along, 1000 wide, sill 500, 1000 high', JSON.stringify(ops2));
  await EV.tool('select');
  await EV.click(3500, 1000);
  ok((await page.$$('[data-ws-voh]')).length === 8, 'picked: eight grips');
  await shot('8-elev-opening');
  await EV.drag([4000, 1000], [4300, 1000]);
  ok((await wopen()).find((o) => o.guid === made.guid).width === 1300, 'its right grip dragged 300: 1300 wide');
  await EV.drag([3500, 1200], [3000, 1400]);
  let mv = (await wopen()).find((o) => o.guid === made.guid);
  ok(mv.offset === 2500 && mv.sill === 700 && mv.width === 1300 && mv.height === 1000, 'dragged by its middle: 2500 along, sill 700, the size kept', JSON.stringify(mv));
  await EV.click(3000, 1000);
  await EV.type('[data-ws-sh]', '1200');
  ok((await wopen()).find((o) => o.guid === made.guid).height === 1200, 'its height typed in the view: 1200');
  await EV.click(3000, 1000);
  await page.keyboard.press('Delete'); await settled(); await page.waitForTimeout(250);
  ok((await wopen()).length === 1, 'Delete removes the picked opening');
  await EV.close();

  console.log('== the commands and the wall\'s own face view');
  ok(await page.evaluate(() => ['wsattach', 'wsprofile', 'wsslant', 'wsopen'].every((n) => { const b0 = document.querySelector(`[data-wall-tools] [data-mtool="${n}"]`); return b0 && b0.textContent.trim().length > 3; })), 'the Walls menu has Attach top / base, Edit profile, Slant, Wall opening');
  await mtool('wsprofile');
  await planClick(4600, 0);
  await page.waitForSelector('[data-ev-dialog][data-ev-key^="wall:"]', { timeout: 10000 });
  ok((await page.$$('[data-ws-pv]')).length === 5, 'Edit profile, a click on the wall in the plan: its face view with the grips');
  await page.click('[data-ws-evadd="top"]'); await settled(); await page.waitForTimeout(250);
  ok((await shapeOf(g1)).profile.top.length === 4, 'Add a point (top) in the face view');
  await shot('9-face-view');
  await EV.close();
  await mtool('wsopen');
  await page.fill('[data-ws-ow]', '600'); await page.press('[data-ws-ow]', 'Enter');
  await planClick(4000, 0); await page.waitForTimeout(200); await settled(); await page.waitForTimeout(300);
  ops2 = await wopen();
  ok(ops2.length === 2 && ops2.some((o) => o.offset === 3700 && o.width === 600), 'Wall opening, a click on the wall in the plan: 600 wide, centred on the click', JSON.stringify(ops2));
  await mtool('wsslant');
  await planClick(4800, 0);
  await page.waitForSelector('[data-ws-sdialog]');
  await page.fill('[data-ws-sl]', '8'); await page.click('[data-ws-sok]'); await page.waitForTimeout(200); await settled(); await page.waitForTimeout(300);
  ok(JSON.stringify((await shapeOf(g1)).slant) === '[8]', 'Slant, a click on the wall and 8 typed: slanted 8°');
  await planClick(4800, 0); await page.waitForSelector('[data-ws-sdialog]');
  await page.selectOption('[data-ws-skind]', 'none'); await page.click('[data-ws-sok]'); await page.waitForTimeout(200); await settled(); await page.waitForTimeout(300);
  ok((await shapeOf(g1)).slant === null, 'and upright again');

  console.log('== attach by picking, slant by its handle (a room with a partition and a ceiling)');
  const fitTo = async (bb) => { await page.evaluate((b0) => { const pv = window.bimcraftPlan.view; pv.userMoved = true; pv.fit(b0); pv.render(); }, bb); await page.waitForTimeout(200); };
  await fitTo({ x0: -2000, y0: -5000, x1: 18000, y1: 6000 });
  await page.click('[data-mtool="wall"]');
  for (const [x, y] of [[10000, 0], [16000, 0], [16000, 4000], [10000, 4000], [10000, 0]]) { await planClick(x, y); await settled(); }
  await page.keyboard.press('Escape'); await settled();
  await page.click('[data-mtool="wall"]');
  for (const [x, y] of [[11000, 1500], [15000, 1500]]) { await planClick(x, y); await settled(); }
  await page.keyboard.press('Escape'); await settled();
  await page.click('[data-mtool="ceiling"]');
  await planClick(13000, 3000); await settled();
  W = await walls();
  const part = W.find((w) => Math.abs(w.a[1] - 1500) < 1 && Math.abs(w.b[1] - 1500) < 1), north = W.find((w) => Math.abs(w.a[1] - 4000) < 1 && Math.abs(w.b[1] - 4000) < 1);
  const ceil = await page.evaluate(() => { const c = window.bimcraftPlan.state.data.derived.ceilings[0]; return c ? { guid: c.guid, height: c.height, id: c.id } : null; });
  ok(W.length === 6 && part && north && ceil, 'four walls, a partition and a ceiling drawn', [W.length, !!part, !!ceil]);
  await EV.open('elevation:south');
  await EV.tool('wsattachtop');
  await page.evaluate((g) => { const r = document.querySelector(`[data-ev-wall="${g}"]`).getBoundingClientRect(); window.__c = [r.left + r.width / 2, r.top + r.height * 0.75]; }, part.guid);
  { const c = await page.evaluate(() => window.__c); await page.mouse.click(c[0], c[1]); await page.waitForTimeout(150); }
  ok(await page.$(`[data-ws-picked="${part.guid}"]`) && (await page.$$('[data-ws-target]')).length >= 1, 'Attach top: the partition picked, the ceiling shown as a box to click');
  await shot('10-attach');
  await EV.click(13000, ceil.height + 5); await settled(); await page.waitForTimeout(300);
  ok((await shapeOf(part.guid)).attachTop === ceil.guid, 'a click on the ceiling: the partition\'s top is attached to it');
  await EV.close();
  const hp = await height3d(await page.evaluate((g) => window.bimcraftPlan.state.data.walls.find((w) => w.guid === g).id, part.guid));
  ok(hp && hp.some((v) => Math.abs(v - ceil.height / 1000) < 0.002), 'in 3D the partition now stops under the ceiling', JSON.stringify(hp));
  // what the elevation panel did before still works with the Shape grips there: a wall dragged along the view moves
  await EV.open('elevation:south');
  await EV.drag([13000, 1000], [13500, 1000]);
  let pm = (await walls()).find((w) => w.guid === part.guid);
  ok(Math.abs(Math.min(pm.a[0], pm.b[0]) - 11500) < 1, 'Select and move still moves a wall along the view (the partition 500 to the right)', [pm.a[0], pm.b[0]]);
  await page.keyboard.press('Control+z'); await settled(); await page.waitForTimeout(300);
  pm = (await walls()).find((w) => w.guid === part.guid);
  ok(Math.abs(Math.min(pm.a[0], pm.b[0]) - 11000) < 1 && (await shapeOf(part.guid)).attachTop === ceil.guid, 'and Ctrl+Z puts it back, still attached');
  await EV.close();
  await EV.open('elevation:east');
  await page.evaluate((g) => { const r = document.querySelector(`[data-ws-cross="${g}"]`).getBoundingClientRect(); window.__c = [r.left + r.width / 2, r.top + r.height / 2]; }, part.guid);
  { const c = await page.evaluate(() => window.__c); await page.mouse.click(c[0], c[1]); await page.waitForTimeout(150); }
  ok(await page.$('[data-ws-slanth]'), 'east elevation: the partition seen end-on, picked: a handle at its top');
  await EV.drag([1500, 3000], [1900, 3000]);
  ok(JSON.stringify((await shapeOf(part.guid)).slant) === '[7.5]', 'the handle dragged 400 across a 3000 wall: atan(400 / 3000) = 7.59°, kept to half a degree: 7.5°', JSON.stringify((await shapeOf(part.guid)).slant));
  await shot('11-slant-handle');
  await page.selectOption('[data-ws-cslant]', 'none'); await settled(); await page.waitForTimeout(250);
  ok((await shapeOf(part.guid)).slant === null, 'Upright picked in the view\'s strip');
  await EV.close();

  console.log('== a section view');
  await mtool('section');
  await planClick(9000, 3000); await planClick(17000, 3000); await settled(); await page.waitForTimeout(400);
  await page.keyboard.press('Escape');
  const secKey = await page.evaluate(() => document.querySelector('[data-pb-elevedit^="section:"]')?.dataset.pbElevedit || null);
  ok(!!secKey, 'a section line drawn through the room', secKey);
  if (secKey) {
    await EV.open(secKey);
    const info = await page.evaluate((g) => { const R = window.bimcraftElevEdit.state, it = R.items.walls.find((w) => w.guid === g); return it ? { x0: it.x0, x1: it.x1, y1: it.y1, cross: document.querySelectorAll('[data-ws-cross]').length } : null; }, north.guid);
    ok(info && info.cross >= 2, 'the section looks at the north wall and cuts the east and west walls end-on', JSON.stringify(info));
    if (info) {
      await EV.click((info.x0 + info.x1) / 2, 600);
      const n5 = (await page.$$('[data-ws-pv]')).length;
      // the wall's start is at one end of its rectangle: drag whichever top end grip is at x1
      await EV.drag([info.x1, info.y1], [info.x1, info.y1 + 600]);
      const spn = await shapeOf(north.guid);
      ok(n5 === 4 && spn.profile?.top && Math.max(spn.profile.top[0][1], spn.profile.top[1][1]) === 3600 && Math.min(spn.profile.top[0][1], spn.profile.top[1][1]) === 3000, 'a top end grip dragged up 600 in the section: the wall\'s top slopes 3600 to 3000', JSON.stringify(spn.profile));
      await shot('12-section');
    }
    await EV.close();
  }

  console.log('== Attach top / base in the plan');
  const east = W.find((w) => Math.abs(w.a[0] - 16000) < 1 && Math.abs(w.b[0] - 16000) < 1);
  await mtool('wsattach');
  await planClick(16000, 2000); await page.waitForTimeout(200);
  await planClick(13000, 3000); await page.waitForTimeout(200); await settled(); await page.waitForTimeout(300);
  ok(east && (await shapeOf(east.guid)).attachTop === ceil.guid, 'a click on a wall, then a point under the ceiling: its top is attached');
  await mtool('select');
  await undo();
  ok(east && !(await shapeOf(east.guid)).attachTop, 'one Undo lets it go');

  console.log('== the 3D view');
  await page.click('[data-model-layout="split"]'); await page.waitForTimeout(800);
  const V3 = (fn, ...a) => page.evaluate(([fn, a]) => window.bimcraftWallShapeView[fn](...a), [fn, a]);
  // a wall whose face the camera sees at two points
  let seen = null;
  for (const w of [W.find((x) => x.guid === g1), ...W.filter((x) => x.guid !== g1 && x.guid !== part.guid)]) {
    for (const off of [w.t / 2, -w.t / 2]) {
      const p1 = await V3('pageOf', w.guid, 1000, 800, off), p2 = await V3('pageOf', w.guid, 2200, 2000, off);
      if (!p1 || !p2) continue;
      const h1 = await V3('hit3d', p1.x, p1.y), h2 = await V3('hit3d', p2.x, p2.y);
      if (h1?.guid === w.guid && h2?.guid === w.guid && Math.abs(h1.s - 1000) < 3 && Math.abs(h1.z - 800) < 3 && Math.abs(h2.s - 2200) < 3) { seen = { w, off, p1, p2 }; break; }
    }
    if (seen) break;
  }
  ok(!!seen, 'a wall face the 3D camera sees', seen && seen.w.guid);
  if (seen) {
    const before = (await wopen()).length;
    await mtool('wsopen');
    await page.mouse.click(seen.p1.x, seen.p1.y); await page.waitForTimeout(400);
    await page.mouse.click(seen.p2.x, seen.p2.y); await settled(); await page.waitForTimeout(500);
    ops2 = await wopen();
    const o3 = ops2.find((o) => o.wallGuid === seen.w.guid && Math.abs(o.offset - 1000) <= 10 && Math.abs(o.width - 1200) <= 10);
    ok(ops2.length === before + 1 && o3 && Math.abs(o3.sill - 800) <= 10 && Math.abs(o3.height - 1200) <= 10, 'Wall opening in 3D, two clicks on the face: 1000 along, sill 800, 1200 × 1200', JSON.stringify(ops2.filter((o) => o.wallGuid === seen.w.guid)));
    await shot('13-3d-opening');
    if (o3) {
      await page.waitForTimeout(300);
      let gr = await V3('grips');
      const se = gr.find((q) => q.kind === 'wo' && q.guid === o3.guid && q.handle === 'se');
      ok(!!se?.page, 'the wall is picked: its opening has grips in the 3D view', gr.length);
      if (se?.page) {
        const to = await V3('pageOf', seen.w.guid, se.s + 300, se.z, 0);
        await page.mouse.move(se.page.x, se.page.y); await page.mouse.down();
        await page.mouse.move((se.page.x + to.x) / 2, (se.page.y + to.y) / 2, { steps: 3 }); await page.mouse.move(to.x, to.y, { steps: 3 });
        await page.mouse.up(); await settled(); await page.waitForTimeout(500);
        const o4 = (await wopen()).find((o) => o.guid === o3.guid);
        ok(o4 && Math.abs(o4.width - 1500) <= 10 && Math.abs(o4.offset - o3.offset) <= 10, 'its corner grip dragged 300 along the wall in 3D: 1500 wide', JSON.stringify(o4));
      }
    }
    await mtool('wsprofile');
    await page.waitForTimeout(300);
    let gp = await V3('grips');
    const tp = gp.find((q) => q.kind === 'pv' && q.line === 'top' && q.i === 0);
    ok(!!tp?.page, 'Edit profile in 3D: grips on the picked wall\'s profile points', gp.length);
    if (tp?.page) {
      const to = await V3('pageOf', seen.w.guid, tp.s, tp.z + 500, 0);
      await page.mouse.move(tp.page.x, tp.page.y); await page.mouse.down();
      await page.mouse.move((tp.page.x + to.x) / 2, (tp.page.y + to.y) / 2, { steps: 3 }); await page.mouse.move(to.x, to.y, { steps: 3 });
      await page.mouse.up(); await settled(); await page.waitForTimeout(500);
      const s3 = await shapeOf(seen.w.guid);
      ok(s3.profile?.top && Math.abs(s3.profile.top[0][1] - (tp.z + 500)) <= 10, 'a top point dragged up 500 in 3D', JSON.stringify(s3.profile?.top));
      await shot('14-3d-profile');
    }
    // attach in 3D: the wall (picked), then the ceiling seen from above
    await mtool('wsattach');
    let cp = null;
    for (const q of [[13000, 3000], [12000, 2800], [14500, 3300], [13000, 2200]]) {
      const pg = await V3('pagePlan', part.guid, [q[0], q[1], ceil.height + 12.7]);
      if (pg && (await V3('hitKey', pg.x, pg.y)) === (await page.evaluate((id) => window.bimcraftWallShape.keyOf(id), ceil.id))) { cp = pg; break; }
    }
    if (cp) {
      await page.mouse.click(cp.x, cp.y); await settled(); await page.waitForTimeout(500);
      ok((await shapeOf(seen.w.guid)).attachTop === ceil.guid, 'Attach top in 3D: the picked wall, then a click on the ceiling');
    } else console.log('  note the ceiling is not in sight of the 3D camera here: Attach by picking in 3D not driven');
  }
  await mtool('select');
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(400);

  console.log('== copies keep the shape; a curved wall');
  const nW = (await walls()).length, nO = (await wopen()).length, on1 = (await wopen()).filter((o) => o.wallGuid === g1).length;
  await planClick(4900, 0); await page.waitForSelector('[data-ws-profile]');
  await mtool('move');
  await page.evaluate(() => { window.bimcraftModify.setCopy(true); window.bimcraftModify.moveBy([0, -3000]); });
  await settled(); await page.waitForTimeout(300);
  await page.evaluate(() => window.bimcraftModify.setCopy(false));
  W = await walls();
  const dup = W.find((w) => Math.abs(w.a[1] + 3000) < 1 && Math.abs(w.b[1] + 3000) < 1);
  ok(W.length === nW + 1 && dup && JSON.stringify((await shapeOf(dup.guid)).profile) === JSON.stringify((await shapeOf(g1)).profile), 'Move with Copy: the copy has the wall\'s profile', dup && JSON.stringify(await shapeOf(dup.guid)));
  ok((await wopen()).length === nO + on1 && (await wopen()).filter((o) => dup && o.wallGuid === dup.guid).length === on1, 'and its wall openings (' + on1 + ')', (await wopen()).length);
  await undo();
  ok((await walls()).length === nW && (await wopen()).length === nO, 'one Undo takes the copy and its openings away');
  await page.click('[data-act="redo"]'); await settled();
  await mtool('select');
  if (dup) {
    await planClick(4900, -3000); await page.waitForSelector('[data-mp-arc]', { timeout: 10000 });
    await setField('[data-mp-arc]', '600');
    const cv = await page.evaluate((g) => { const w = window.bimcraftPlan.state.data.walls.find((x) => x.guid === g); return w ? { bulge: w.bulge, id: w.id, len: w.len, shape: window.bimcraftWallShape.readShape(w) } : null; }, dup.guid);
    ok(cv && Math.abs(cv.bulge) > 0.01 && cv.shape.profile?.top?.length >= 3, 'the copy bent into a curved wall keeps its profile', JSON.stringify(cv));
    const hc = cv ? await height3d(cv.id) : null, peak = cv ? Math.max(...cv.shape.profile.top.map((q) => q[1])) : 0;
    ok(hc && hc.some((v) => Math.abs(v - peak / 1000) < 0.003), 'its 3D body reaches the profile\'s peak (' + peak + '): a curved shaped wall is drawn', JSON.stringify(hc));
    ok((await wopen()).filter((o) => o.wallGuid === dup.guid).length === on1, 'and its wall openings are still in it');
    await page.waitForSelector('[data-ws-attachtop]');
    ok(!!(await page.$('[data-ws-attachtop]')) && !!(await page.$('[data-ws-addopen]')) && !!(await page.$('[data-ws-profile]')), 'Properties shows the whole Shape part for a curved wall');
    await shot('15-curved');
  }
  const lvN = await page.evaluate(() => window.bimcraftPlan.state.data.levels.length);
  await page.evaluate(() => document.querySelector('[data-lv-copy]').click());
  await page.waitForSelector('[data-lvc-to]');
  await page.selectOption('[data-lvc-to]', '');
  await page.click('[data-lvc-ok]'); await settled(); await page.waitForTimeout(500);
  const after = await page.evaluate(() => { const d = window.bimcraftPlan.state.data, top = d.levels[d.levels.length - 1].id; return { levels: d.levels.length, shaped: d.walls.filter((w) => w.storey === top && w.shape).length, walls: d.walls.filter((w) => w.storey === top).length }; });
  const oAll = await wopen(), nBefore = (await walls()).length;
  ok(after.levels === lvN + 1 && after.shaped >= 2, 'Copy level to a new level: the copied walls keep their shapes', JSON.stringify(after));
  ok(oAll.length === 2 * (nO + on1), 'and every wall opening is copied (' + (nO + on1) + ' → ' + oAll.length + ')', oAll.length);
  ok(problems.length === 0, 'no console errors', problems.slice(0, 4));
} catch (e) { fail++; console.log('  FAIL ' + e.message); console.log(problems.slice(0, 4)); await shot('zz-error'); }
await browser.close();
console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);

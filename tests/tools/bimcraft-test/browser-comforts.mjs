#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-comforts.mjs — BimCraft's drawing comforts (0.6 round 2, session `bim-comforts_PART_2`) in the lab, headless.
 *   node tools/bimcraft-test/browser-comforts.mjs [--shots <dir>] [--only 1,2,3,4,5,6,7]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimcomf), so the shared admin-login
 * throttle is never touched. Fails on any console error.
 *   1   a curved wall drawn with Shape › Curved (start, end, a point on the arc), a door in it, bent with its middle grip
 *   2   a wall drawn on its outside face keeps that face when it gets thicker (Properties › Location line)
 *   3   a placed library item dragged and turned in the plan, R, Properties X / Y / Rotation; Ctrl+Z
 *   4   a gable dormer put on a roof face with the Dormer tool
 *   5   a spiral stair with the Stair tool
 *   6, 7  interior elevations, dimensions and tags (when built)
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
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? process.argv[oi + 1].split(',') : null;
const want = (k) => !ONLY || ONLY.includes(String(k));

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimcomf'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
let ctx = null, page = null;
async function fresh() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + ' @ ' + String(e.stack || '').split('\n').slice(1, 4).join(' < ')));
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
}
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
async function newBuilding(name, n = 2, h = 3000) {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', name);
  await page.fill('[data-new-levels]', String(n));
  await page.fill('[data-new-height]', h + ' mm');
  await page.click('[data-new-ok]');
  await waitStatus(new RegExp('^New building ' + name));
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
  await page.click('[data-model-layout="plan"]');   // the plan alone: the Draw bar fits on fewer rows
  await page.waitForTimeout(300);
}
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
const planDrag = async (from, to) => { const [ax, ay] = await at(...from), [bx, by] = await at(...to); await page.mouse.move(ax, ay); await page.mouse.down(); await page.mouse.move((ax + bx) / 2, (ay + by) / 2, { steps: 4 }); await page.mouse.move(bx, by, { steps: 4 }); await page.mouse.up(); };
const room = async (x0, y0, x1, y1) => { await page.click('[data-mtool="wall"]'); await planClick(x0, y0); await planClick(x1, y0); await planClick(x1, y1); await planClick(x0, y1); await planClick(x0, y0); await page.keyboard.press('Escape'); await settled(); };
const walls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => ({ guid: w.guid, id: w.id, a: w.a, b: w.b, t: w.t, bulge: w.bulge, len: w.len, justification: w.justification, typeKey: w.typeKey })));
const saveText = () => page.evaluate(() => new TextDecoder().decode(window.bimcraftLive.editor.save()));
const pick = async (key) => { await page.evaluate((k) => window.bimcraftComforts.api.host.select([k]), key); await page.waitForTimeout(150); };
const near = (a, b, e = 1) => Math.abs(a - b) <= e;
/** Show this part of the plan (so every point clicked is on the canvas). */
const frame = (x0, y0, x1, y1) => page.evaluate((b) => {
  // below the Draw bar, which covers the plan's top (as model-ui.js fitPlan does)
  const pv = window.bimcraftPlan.view, c = pv.canvas.getBoundingClientRect(), bar = document.querySelector('[data-modelbar]').getBoundingClientRect();
  pv.padTop = Math.max(0, bar.bottom - c.top) + 12; pv.fit(b); pv.render();
}, { x0, y0, x1, y1 });

try {
  if (want(1) || want(2)) {
    await fresh();
    await newBuilding('Comforts');
  }
  if (want(1)) {
    console.log('== 1: a curved wall');
    await frame(-1000, -3000, 7000, 3000);
    await page.click('[data-mtool="wall"]');
    await page.selectOption('[data-model-wallshape]', 'arc');
    ok(/Curved wall/.test(await page.textContent('[data-model-hint]')), 'Shape › Curved: the hint says how (start, end, a point on the arc)');
    await planClick(0, 0);
    await planClick(6000, 0);
    const [hx, hy] = await at(3000, -2000);
    await page.mouse.move(hx, hy, { steps: 3 });
    const pre = await page.evaluate(() => ({ walls: window.bimcraftPlan.view.overlay?.walls?.[0]?.length || 0, hud: window.bimcraftPlan.view.overlay?.hud?.text || '' }));
    ok(pre.walls > 20 && /Arc height/.test(pre.hud), 'after its end: the curved wall follows the pointer (' + pre.walls + ' outline points), with its length, radius and arc height', pre.hud);
    await page.mouse.click(hx, hy);
    await page.keyboard.press('Escape');
    await settled();
    let W = await walls();
    ok(W.length === 1 && W[0].bulge > 0.5 && W[0].bulge < 0.8 && near(W[0].len, 3000 * Math.PI * 0.9, 1500), 'a curved wall through the three points (bulge ' + W[0]?.bulge?.toFixed(3) + ', ' + Math.round(W[0]?.len) + ' mm along its arc)');
    const txt = await saveText();
    ok(/IFCTRIMMEDCURVE\(/.test(txt) && /IFCARCINDEX/.test(txt), 'saved as IFC with an arc Axis and arc faces');
    await shot('1-01-curved-wall');
    // a door in it
    await page.click('[data-mtool="door"]');
    const mid = await page.evaluate(() => { const w = window.bimcraftPlan.state.data.walls[0]; const k = w.bulge, c = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]), nl = [-(w.b[1] - w.a[1]) / c, (w.b[0] - w.a[0]) / c], h = k * c / 2; return [(w.a[0] + w.b[0]) / 2 - nl[0] * h, (w.a[1] + w.b[1]) / 2 - nl[1] * h]; });
    await planClick(mid[0], mid[1]);
    await settled();
    const ops = await page.evaluate(() => window.bimcraftPlan.state.data.openings.map((o) => ({ offset: o.offset, wall: o.wallGuid })));
    ok(ops.length === 1 && ops[0].wall === W[0].guid && Math.abs(ops[0].offset + 457 - W[0].len / 2) < 200, 'Door: placed in the curved wall at its middle (offset ' + Math.round(ops[0]?.offset) + ' along the arc)');
    await shot('1-02-door-in-curved-wall');
    // bend it with its middle grip
    await page.click('[data-mtool="select"]');
    await pick(await page.evaluate(() => window.bimcraftPlan.state.data.walls[0].id + (window.bimcraftComforts.api.kb())));
    await page.waitForFunction(() => (window.bimcraftPlan.view.overlay?.grips?.length || 0) > 0, null, { timeout: 5000 }).catch(() => {});
    const grips = await page.evaluate(() => window.bimcraftPlan.view.overlay?.grips?.length || 0);
    const dbg = await page.evaluate(() => JSON.stringify({ tool: window.bimcraftPlan.state.tool, sel: [...(document.querySelector('[data-canvas]')?.viewer?.selection || [])], ov: Object.keys(window.bimcraftPlan.view.overlay || {}), walls: window.bimcraftPlan.state.data.walls.map((w) => w.id), kb: window.bimcraftComforts.api.kb() }));
    ok(grips === 3, 'picked: its ends and the middle of its arc have grips', String(grips) + ' ' + dbg);
    const before = (await walls())[0].bulge;
    await planDrag(mid, [mid[0], mid[1] + 1200]);
    await settled();
    W = await walls();
    ok(W[0].bulge < before - 0.1 && W[0].bulge > 0, 'its middle grip dragged toward the chord: the wall is flatter (bulge ' + before.toFixed(3) + ' → ' + W[0].bulge.toFixed(3) + '), one step');
    await page.waitForSelector('[data-mp-arc]');
    ok(await page.isVisible('[data-mp-arc]') && await page.isVisible('[data-mp-just]'), 'Properties: Arc height and Location line');
    await page.fill('[data-mp-arc]', '0');
    await page.press('[data-mp-arc]', 'Enter');
    await settled();
    W = await walls();
    ok(W[0].bulge === 0, 'Arc height 0: straight again');
    await page.mouse.move(5, 5);
    await page.keyboard.press('Control+z');
    await settled();
    W = await walls();
    ok(W[0].bulge > 0, 'Ctrl+Z: curved again');
    await shot('1-03-bent');
    await page.keyboard.press('Control+z'); await settled();
    await page.keyboard.press('Control+z'); await settled();
    await page.keyboard.press('Control+z'); await settled();
    ok((await walls()).length === 0, 'three more Ctrl+Z: the door and the wall gone (each was one step)');
  }
  if (want(2)) {
    console.log('== 2: a wall drawn on its outside face keeps it');
    await page.click('[data-mtool="wall"]');
    await page.selectOption('[data-model-wallshape]', 'straight');
    await page.selectOption('[data-model-wallref]', 'outside');
    await page.selectOption('[data-model-wallside]', 'right');
    await frame(-1000, 7000, 7000, 13000);
    await planClick(0, 8000); await planClick(6000, 8000); await planClick(6000, 12000);
    await page.keyboard.press('Escape');
    await settled();
    let W = (await walls()).filter((w) => w.a[1] > 7000);
    ok(W.length === 2 && W.every((w) => w.justification === 'exterior'), 'drawn on the outside face: Location line = Outside face on both');
    await page.click('[data-mtool="select"]');
    const k = await page.evaluate(() => window.bimcraftComforts.api.kb());
    await pick(k + W[0].id);
    await page.waitForSelector('[data-mp-just]');
    ok(await page.$eval('[data-mp-just]', (s) => s.value) === 'exterior', 'Properties shows Location line › Outside face');
    const ov = await page.evaluate(() => window.bimcraftPlan.view.overlay?.dashed?.length || 0);
    ok(ov >= 1, 'the picked wall\'s location line is dashed on the plan');
    const y0 = W[0].a[1];
    await page.fill('[data-mp-thick]', '300');
    await page.press('[data-mp-thick]', 'Enter');
    await settled();
    W = (await walls()).filter((w) => w.a[1] > 7000);
    const A2 = W.find((w) => Math.abs(w.b[0] - w.a[0]) > 1000);
    ok(near(A2.t, 300, 0.5) && near(A2.a[1] - A2.t / 2, 8000, 1) && y0 < A2.a[1] && near(Math.hypot(A2.b[0] - W.find((w) => w !== A2).a[0], A2.b[1] - W.find((w) => w !== A2).a[1]), 0, 1), 'Thickness 300: the outside face stays on y = 8000, the wall grows inward and the corner still meets', JSON.stringify(W.map((w) => [w.a, w.b])));
    await shot('2-01-justified');
  }
  if (want(3)) {
    console.log('== 3: moving and turning a placed library item');
    await fresh();
    await newBuilding('Kitchen', 1);
    await frame(-1000, -1000, 7000, 5000);
    await room(0, 0, 6000, 4000);
    const item = JSON.parse(fs.readFileSync(path.join(REPO, 'tools/library/seed/range.item.json'), 'utf8'));
    await page.evaluate(async (it) => {
      const e = window.bimcraftLive.editor, st = window.bimcraftPlan.state.data.levels[0].id;
      e.placeItem(it, { storey: st, x: 2000, y: 1000, rot: 0, itemNumber: '1', quantity: 1 });
      window.bimcraftLive.refresh(true);
    }, item);
    await page.waitForTimeout(400);
    await settled();
    const items = () => page.evaluate(() => window.bimcraftComforts.items().map((x) => ({ id: x.id, x: x.x, y: x.y, rot: x.rot })));
    let I = await items();
    ok(I.length === 1 && near(I[0].x, 2000) && near(I[0].y, 1000), 'a range placed at (2000, 1000)');
    const k = await page.evaluate(() => window.bimcraftComforts.api.kb());
    await page.click('[data-mtool="select"]');
    await pick(k + I[0].id);
    const g = await page.evaluate(() => window.bimcraftPlan.view.overlay?.grips || []);
    ok(g.length === 2, 'picked in the plan: a square grip at its insertion point, a round one to turn it');
    await planDrag([2000, 1000], [3500, 2000]);
    await settled();
    I = await items();
    ok(near(I[0].x, 3500, 30) && near(I[0].y, 2000, 30), 'its grip dragged: moved to (' + Math.round(I[0].x) + ', ' + Math.round(I[0].y) + ')');
    await shot('3-01-moved');
    await pick(k + I[0].id);
    const rg = await page.evaluate(() => window.bimcraftPlan.view.overlay.grips[1].p);
    await planDrag(rg, [I[0].x, I[0].y + 1000]);
    await settled();
    I = await items();
    ok(near(I[0].rot, 90, 0.01), 'its round grip dragged straight up: turned to 90° (15° steps)');
    await pick(k + I[0].id);
    await page.mouse.move(5, 5);
    await page.keyboard.press('r');
    await settled();
    I = await items();
    ok(near(Math.abs(I[0].rot), 180, 0.01), 'R: another 90°');
    await pick(k + I[0].id);
    await page.waitForSelector('[data-mp-itemx]');
    await page.fill('[data-mp-itemx]', '1000');
    await page.press('[data-mp-itemx]', 'Enter');
    await settled();
    I = await items();
    ok(near(I[0].x, 1000, 0.5), 'Properties › X 1000: moved there');
    await page.mouse.move(5, 5);
    for (let i = 0; i < 4; i++) { await page.keyboard.press('Control+z'); await settled(); }
    I = await items();
    ok(near(I[0].x, 2000, 0.5) && near(I[0].y, 1000, 0.5) && near(I[0].rot, 0, 0.01), 'four Ctrl+Z: back where it was placed (each move was one step)');
    await shot('3-02-undone');
  }
  if (want(4)) {
    console.log('== 4: a dormer');
    await fresh();
    await newBuilding('Dormer', 2);
    await frame(-1000, -1000, 9000, 7000);
    await room(0, 0, 8000, 6000);
    await page.click('[data-mtool="roof"]');
    await page.fill('[data-model-rfpitch]', '10/12');
    await page.press('[data-model-rfpitch]', 'Enter');
    await planClick(4000, 3000);
    await settled();
    const st4 = (await page.textContent('[data-status]')) + ' ' + JSON.stringify(await walls()) + ' loops ' + await page.evaluate(() => JSON.stringify((window.bimcraftPlan.state.loops?.outlines || []).map((o) => o.poly.length)));
    ok(await page.evaluate(() => (window.bimcraftPlan.state.data.derived.roofs || []).length) === 1, 'the Roof tool: a hip roof at 10/12', st4);
    const L = await page.evaluate(() => window.bimcraftPlan.state.data.levels.map((l) => ({ id: l.id, guid: l.guid })));
    await page.selectOption('[data-model-level]', String(L[1].id));
    await settled();
    await frame(-1000, -1000, 9000, 7000);
    await page.click('[data-res-tools] > summary');
    await page.click('[data-mtool="dormer"]');
    ok(await page.isVisible('[data-mopts="dormer"]'), 'Dormer tool: its row (kind, width, front wall, pitch, overhang)');
    await page.fill('[data-cf-dw]', '1500'); await page.press('[data-cf-dw]', 'Enter');
    await page.fill('[data-cf-dh]', '600'); await page.press('[data-cf-dh]', 'Enter');
    const [hx, hy] = await at(4000, 900);
    await page.mouse.move(hx, hy, { steps: 3 });
    const pre = await page.evaluate(() => window.bimcraftPlan.view.overlay?.walls?.length || 0);
    const dbg4 = await page.evaluate(() => { const C = window.bimcraftComforts, S = window.bimcraftPlan.state; return JSON.stringify({ tool: S.tool, level: S.level, roofs: (S.data.derived.roofs || []).map((r) => [r.storey, r.parts.length]), hover: C.state.hover && { rp: !!C.state.hover.rp, err: C.state.hover.G?.error, at: C.state.hover.at }, plans: C.api.ed() ? 'ed' : 'no ed' }); });
    ok(pre === 1, 'hovering the roof\'s south face: the dormer\'s outline previews', dbg4);
    await page.mouse.click(hx, hy);
    await settled();
    const txt = await saveText();
    ok(/'CadCraft_Dormer'/.test(txt) && /'CadCraft_DormerCut'/.test(txt) && /IFCROOF\([^;]*'Dormer'[^;]*\.GABLE_ROOF\.\)/.test(txt), 'placed: a gable dormer (IfcRoof "Dormer") and the hole in the roof');
    const sym = await page.evaluate(() => window.bimcraftPlan.view.scene.symbols.filter((s) => s.roof).length);
    ok(sym >= 2, 'the plan shows the roof and the dormer on it');
    await page.keyboard.press('Escape');
    await page.click('[data-model-layout="split"]').catch(() => {});
    await page.waitForTimeout(600);
    await shot('4-01-dormer');
  }
  if (want(5)) {
    console.log('== 5: a spiral stair');
    await fresh();
    await newBuilding('Spiral', 2);
    await frame(-1000, -1000, 7000, 6000);
    await room(0, 0, 6000, 5000);
    await page.click('[data-res-tools] > summary');
    await page.click('[data-mtool="stair"]');
    await page.selectOption('[data-res-stkind]', 'spiral');
    ok(/Spiral stair/.test(await page.textContent('[data-model-hint]')) && Math.abs(Number(await page.inputValue('[data-res-stwidth]')) - 762) < 1, 'Stair › Spiral: its own hint; 30" (762 mm) wide');
    await planClick(3000, 2500);
    const [hx, hy] = await at(4000, 2500);
    await page.mouse.move(hx, hy, { steps: 3 });
    await page.mouse.click(hx, hy);
    await settled();
    const txt = await saveText();
    ok(/\.SPIRAL_STAIR\./.test(txt) && /\.POST\./.test(txt), 'placed: an IfcStair .SPIRAL_STAIR. with its post');
    await shot('5-01-spiral');
  }

  if (want(6) || want(7)) {
    console.log('== 6 / 7: a room\'s interior elevations with their dimensions and tags');
    await fresh();
    await newBuilding('Interior', 2);
    await frame(-1000, -1000, 5000, 4000);
    await room(0, 0, 4000, 3000);
    await page.evaluate(() => {
      const S = window.bimcraftPlan.state, e = window.bimcraftLive.editor;
      const south = S.data.walls.find((w) => Math.abs(w.a[1]) < 1 && Math.abs(w.b[1]) < 1);
      window.__south = south.guid;
    });
    await page.click('[data-mtool="door"]');
    await planClick(1500, 0);
    await settled();
    await page.click('[data-mtool="window"]');
    await planClick(2000, 3000);
    await settled();
    await page.click('[data-mtool="select"]');
    const k = await page.evaluate(() => window.bimcraftComforts.api.kb());
    const sp = await page.evaluate(() => window.bimcraftPlan.state.data.derived.spaces[0]?.id);
    await pick(k + sp);
    await page.waitForSelector('[data-mp-intel]');
    await page.click('[data-mp-intel]');
    await page.waitForSelector('dialog[data-cf-ie][open]');
    const svg = await page.$eval('[data-cf-iestage]', (x) => x.innerHTML);
    ok(/North wall/.test(svg) && /West wall/.test(svg) && />D1</.test(svg) && />W1</.test(svg), 'Room › Interior elevations…: the four walls on one sheet, the door and window tagged');
    await shot('6-01-interior');
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.click('[data-cf-iepdf]')]);
    const bytes = fs.readFileSync(await dl.path());
    ok(bytes.slice(0, 5).toString() === '%PDF-' && /Interior elevations/.test(dl.suggestedFilename()), 'Download PDF: ' + dl.suggestedFilename());
    await page.click('[data-cf-ieclose]');
    ok(!(await page.$('dialog[data-cf-ie]')), 'Close: the dialog goes');
    // 7: the drawing set's elevations carry level marks, heights and tags
    await page.click('[data-res-sheetsopen]');
    await page.waitForSelector('[data-res-sheets-dlg][open]');
    await page.waitForFunction(() => document.querySelectorAll('[data-res-shlist] button').length > 1, null, { timeout: 60000 });
    const btns = await page.$$('[data-res-shlist] button');
    let found = '';
    for (const b of btns) { await b.click(); const h = await page.$eval('[data-res-shview]', (x) => x.innerHTML); if (/>Level 2</.test(h) && />D1</.test(h)) { found = await b.textContent(); break; } }
    const dbg7 = found ? '' : await page.evaluate(() => [...document.querySelectorAll('[data-res-shlist] button')].map((b) => b.textContent.trim()).join('|')) + ' :: ' + (await page.$eval('[data-res-shview]', (x) => (x.innerHTML.match(/>[^<]{1,12}</g) || []).slice(0, 40).join(' ')));
    ok(!!found, 'Sheets: an elevation sheet with level marks (Level 2) and the door\'s tag D1 (' + found.trim().slice(0, 40) + ')', dbg7);
    await shot('7-01-elevation-notes');
    await page.click('[data-res-shclose]');
    // 6: an interior elevation on your own sheet
    const sg = await page.evaluate(() => window.bimcraftPlan.state.data.derived.spaces[0].guid);
    await page.click('[data-pb-newsheet]');
    await page.waitForSelector('[data-sh-dialog][open]');
    await page.click(`[data-sh-add="interior:${sg}:north"]`);
    await page.waitForSelector('[data-sh-view="0"]');
    ok(await page.$eval('[data-sh-stage]', (x) => />W1</.test(x.innerHTML)), 'New sheet › Interior elevations: a room\'s north wall placed, with the window\'s tag W1');
    await shot('6-02-own-sheet');
    await page.click('[data-sh-dialog] button[value="cancel"]');
  }

  const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
  ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  await shot('zz-error').catch(() => {});
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimcomf']); } catch (e) { /* the session ends on its own */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

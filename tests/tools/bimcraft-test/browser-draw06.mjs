#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-draw06.mjs — BimCraft's 0.6 drawing work (session `bim-draw`) in the lab, headless, with real clicks and keys.
 *   node tools/bimcraft-test/browser-draw06.mjs [--shots <dir>] [--only fixes,df15,…]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimdraw06), so the shared
 * admin-login throttle is never touched. Fails on any console error. One section per finished item:
 *   fixes  BIM-F1–F5 on the showcase house (fixtures/showcase/bimcraft-house.ifc): the roof over the L only (8 parts, not
 *          12), "Updating the model…" gone after a reload, no Flip for fixed / picture windows, Paint and the plan-only
 *          layout, the Render dialog's sun boxes readable in the model theme (BIM-F6 is Node-tested: test-bimcraft --render)
 *   df29   pipes and ducts (mep-ui.js): a pipe with its elbow, a branch making a tee, a valve, a duct sized from its airflow,
 *          Properties, the schedules, the takeoff, a riser shown on the level above, Delete and undo
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
const want = (k) => !ONLY || ONLY.includes(k);

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimdraw06'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

// BimCraft opens drawings in 3D by default (Settings › BimCraft › Drawings open in); these checks are written for the 2D view,
// so every page starts with "2D" unless the test itself sets bimcraft.settings.dwgStart.
{
  const pin2d = () => { try { const k = 'bimcraft.settings', v = JSON.parse(localStorage.getItem(k) || '{}') || {}; if (!v.dwgStart) { v.dwgStart = '2d'; localStorage.setItem(k, JSON.stringify(v)); } } catch { /* another origin */ } };
  const nc = browser.newContext.bind(browser), np = browser.newPage.bind(browser);
  browser.newContext = async (...a) => { const c = await nc(...a); await c.addInitScript(pin2d); return c; };
  browser.newPage = async (...a) => { const p = await np(...a); await p.addInitScript(pin2d); return p; };
}
const problems = [];
let ctx = null, page = null;
/** A fresh browser context (its own storage: no autosave from an earlier section), signed in, on /lab/bimcraft in mm. */
async function fresh() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('bimcraft.render'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
}
/** File › New building from the empty start page: n levels of h mm. */
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
}
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const statusOf = () => page.textContent('[data-status]');
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const pick = (keys) => page.evaluate((k) => window.bimcraftVis.pick(k), keys);
/** Open a file; when edits are waiting, answer the in-page question with "Discard". */
const openFile = async (file, re) => {
  await page.setInputFiles('[data-file]', file);
  const asked = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"]', { timeout: 1500 }).catch(() => null);
  if (asked) await asked.click();
  await waitStatus(re, 120000);
};
const openShowcase = async () => {
  await openFile({ name: 'bimcraft-house.ifc', mimeType: 'application/x-step', buffer: fs.readFileSync(path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc')) }, /^Opened bimcraft-house/);
};

try {
  await fresh();

  if (want('fixes')) {
    console.log('== fixes: BIM-F1–F5 on the showcase house');
    await openShowcase();
    await page.click('[data-model-toggle]');
    await page.waitForSelector('[data-plan-wrap]:not([hidden])');
    await settled();
    const roofParts = () => page.evaluate(() => window.bimcraftPlan.state.data.derived.roofs.map((r) => r.parts.length));
    ok((await roofParts())[0] === 12, 'the showcase as saved by 0.5: its hip roof has 12 parts (the porch post at the L\'s corner taken in)');
    // BIM-F1: any wall change on Level 1 re-fits the roof to the walls that enclose the house
    await page.click('[data-mtool="wall"]');
    await planClick(9000, 1000); await planClick(12000, 1000);   // a free wall in the L's notch (the porch)
    await page.keyboard.press('Escape');
    await settled();
    ok((await roofParts())[0] === 8, 'BIM-F1: a wall drawn: the roof is fitted again over the L only (six faces, fascia, soffit = 8 parts)', String(await roofParts()));
    // BIM-F4
    await page.waitForTimeout(300);
    ok(!/Updating the model/.test(await statusOf()), 'BIM-F4: "Updating the model…" is gone once the reload is done', await statusOf());
    await shot(page, 'fixes-01-roof');
    // BIM-F2: the Window tool's Flip, and Properties
    await page.click('[data-mtool="window"]');
    await page.selectOption('[data-model-otype="window"]', 'win-fixed');
    ok(await page.isHidden('[data-mopts="window"] [data-model-flip]'), 'BIM-F2: Window tool, Fixed: no Flip');
    await page.selectOption('[data-model-otype="window"]', 'win-casement');
    ok(await page.isVisible('[data-mopts="window"] [data-model-flip]'), 'a casement: Flip shows');
    await page.keyboard.press('Escape');
    const ops = await page.evaluate(() => { const k = window.bimcraftRes.api.kb(); return window.bimcraftPlan.state.data.openings.map((o) => ({ key: k + o.id, type: o.typeKey })); });
    const pic = ops.find((o) => o.type === 'win-picture'), dh = ops.find((o) => o.type === 'win-double-hung'), single = ops.find((o) => o.type === 'door-single');
    await pick([pic.key]);
    await page.waitForSelector('[data-model-props]');
    ok(!(await page.$('[data-mp-hand]')) && !!(await page.$('[data-mp-face]')), 'the picture window\'s Properties: no "Hinges: Flip" (its face still flips)');
    await pick([dh.key]);
    await page.waitForSelector('[data-model-props]');
    ok(!(await page.$('[data-mp-hand]')), 'a double-hung window: no "Hinges: Flip"');
    if (single) { await pick([single.key]); await page.waitForSelector('[data-model-props]'); ok(!!(await page.$('[data-mp-hand]')), 'a single door: "Hinges: Flip" stays'); }
    await shot(page, 'fixes-02-picture-window');
    // BIM-F5: Paint from the plan-only layout
    await page.click('[data-model-layout="plan"]');
    ok(await page.evaluate(() => document.querySelector('.bc-stage').classList.contains('is-plan-only')), 'the plan-only layout');
    await page.click('[data-toolbar] [data-paint-open]');
    await page.waitForSelector('[data-paint-panel]');
    ok(await page.evaluate(() => !document.querySelector('.bc-stage').classList.contains('is-plan-only')) && await page.isVisible('[data-paint-panel]') && await page.isVisible('[data-canvas]'), 'BIM-F5: Paint goes to Split: the palette over the 3D view, the plan beside it');
    await shot(page, 'fixes-03-paint');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('[data-paint-panel]'));
    // BIM-F3: the Render dialog's sun boxes in the model theme
    await page.evaluate(() => { document.documentElement.dataset.space = 'model'; });
    await page.click('[data-toolbar] [data-render-open]');
    await page.waitForSelector('[data-render-dialog][open]');
    const sun = await page.evaluate(() => {
      const lum = (c) => { const m = c.match(/[\d.]+/g).map(Number); const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); };
      const ti = document.querySelector('[data-render-sun-time]'), cs = getComputedStyle(ti);
      const a = lum(cs.backgroundColor), b = lum(cs.color);
      return { disabled: ti.disabled, value: ti.value, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), bg: cs.backgroundColor };
    });
    ok(sun.disabled && /^\d\d:\d\d$/.test(sun.value) && sun.ratio >= 3, 'BIM-F3: model theme, "another date and time" off: the time box shows its time readable (contrast ' + sun.ratio.toFixed(1) + ':1, ' + sun.bg + ')');
    await shot(page, 'fixes-04-render-sun');
    await page.keyboard.press('Escape');
    await page.evaluate(() => { document.documentElement.dataset.space = 'paper'; });
  }

  if (want('df15')) {
    console.log('== df15: where am I working');
    const { fixtureIfc } = await import(path.join(REPO, 'tools/bimcraft-test/ifc-fixture.mjs'));
    await openFile({ name: 'coords-site.ifc', mimeType: 'application/x-step', buffer: Buffer.from(fixtureIfc({ georef: 'site', shift: 5000 })) }, /^Opened coords-site/);
    // from the top, backed off so the origin (5 m west of the building) is in view too
    await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer; v.view('top'); const tg = v.controls.target; v.camera.position.sub(tg).multiplyScalar(2.5).add(tg); v.controls.update(); v.render(); });
    await page.waitForTimeout(400);
    ok(await page.evaluate(() => [...document.querySelectorAll('[data-coords="3d"] [data-coords-lines] span')].map((s) => s.textContent).join()) === 'Point at the model to read where it is', 'before the pointer comes: the 3D box asks you to point at the model');
    const marks = await page.evaluate(() => [...document.querySelectorAll('[data-coords-mark]')].map((m) => ({ kind: m.dataset.coordsMark, hidden: m.hidden || m.closest('[hidden]') !== null, x: parseFloat(m.style.left), y: parseFloat(m.style.top), title: m.title })));
    const mo = marks.find((m) => m.kind === 'origin'), ms = marks.find((m) => m.kind === 'survey');
    ok(mo && ms && !mo.hidden && !ms.hidden && Math.abs(mo.x - ms.x) > 10, 'the site moved 5 m east: the project origin and the survey point are two markers over the 3D view, apart', JSON.stringify(marks));
    ok(ms && /33° 51′ 35\.90″ S, 151° 12′ 33\.48″ E/.test(ms.title), 'the survey point says where it is (the site\'s latitude and longitude)', ms?.title);
    const box = await page.evaluate(() => { const r = document.querySelector('[data-canvas]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.mouse.move(box.x, box.y, { steps: 3 });
    await page.waitForFunction(() => !document.querySelector('[data-coords="3d"]').hidden, null, { timeout: 5000 });
    const r3 = await page.evaluate(() => [...document.querySelectorAll('[data-coords="3d"] [data-coords-lines] span')].map((s) => s.textContent));
    ok(r3.length >= 2 && /^Level [12], /.test(r3[0]) && /^X -?\d+ {2}Y -?\d+ {2}Z -?\d+$/.test(r3[1]), 'the pointer over the model: its level and X Y Z in millimetres', r3.join(' | '));
    await shot(page, 'df15-01-3d');
    // the plan: the level in its corner, the pointer's X and Y from the project origin
    await page.click('[data-model-toggle]');
    await page.waitForSelector('[data-plan-wrap]:not([hidden])');
    await settled();
    const planLines = () => page.evaluate(() => [...document.querySelectorAll('[data-coords="plan"] [data-coords-lines] span')].map((s) => s.textContent));
    let pl = await planLines();
    ok(pl[0] === 'Level 1 (floor at 0)', 'Draw on: the plan names its level in the corner', pl.join(' | '));
    const [px, py] = await at(1000, 2000);
    await page.mouse.move(px, py, { steps: 2 });
    pl = await planLines();
    ok(pl[1] === 'X 6000  Y 2000', 'the pointer at plan point (1000, 2000) of a site moved 5 m east: X 6000  Y 2000 from the project origin', pl.join(' | '));
    const pm = await page.evaluate(() => window.bimcraftPlan.view.markers.map((m) => m.kind + '@' + m.p.map(Math.round).join(',')));
    ok(pm.join(' ') === 'origin@-5000,0 survey@0,0', 'the plan draws the origin 5 m west of the survey point (the storey sits on the site)', pm.join(' '));
    await shot(page, 'df15-02-plan');
    await page.click('[data-coords="plan"] [data-coords-marks]');
    ok(await page.evaluate(() => window.bimcraftPlan.view.markers.length === 0 && document.querySelector('.bc-coords-marks').hidden && localStorage.getItem('bimcraft.coords') === 'off'), 'the crosshair button hides the markers in both views and remembers it');
    await page.click('[data-coords="3d"] [data-coords-marks]');
    ok(await page.evaluate(() => window.bimcraftPlan.view.markers.length === 2 && !document.querySelector('.bc-coords-marks').hidden), 'and shows them again');
    await page.click('[data-model-toggle]');
    // a map conversion: the map grid line
    await openFile({ name: 'coords-map.ifc', mimeType: 'application/x-step', buffer: Buffer.from(fixtureIfc({ georef: 'map' })) }, /^Opened coords-map/);
    await page.mouse.move(box.x + 3, box.y + 2, { steps: 2 });
    await page.waitForFunction(() => !document.querySelector('[data-coords="3d"]').hidden, null, { timeout: 5000 });
    const r3m = await page.evaluate(() => [...document.querySelectorAll('[data-coords="3d"] [data-coords-lines] span')].map((s) => s.textContent));
    ok(r3m.length === 3 && /^E 33\d \d{3}\.\d{3} {2}N 6 25\d \d{3}\.\d{3} m$/.test(r3m[2]), 'a map conversion: the readout adds eastings and northings on the map grid', r3m.join(' | '));
    ok(await page.evaluate(() => document.querySelectorAll('[data-coords-mark]').length === 1 && document.querySelector('[data-coords-mark]').dataset.coordsMark === 'both'), 'the site on the project origin: one marker for both');
    await shot(page, 'df15-03-map');
  }

  if (want('df17')) {
    console.log('== df17: trim / extend / corner');
    await fresh();
    await newBuilding('Trim test');
    const walls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => ({ guid: w.guid, a: w.a.map(Math.round), b: w.b.map(Math.round), type: w.typeKey })));
    // a room left open at its south-east corner
    await page.click('[data-mtool="wall"]');
    // Fit again under the Draw bar as the Wall tool left it (its 0.6 round 2 options rows make it taller than at the first
    // fit; in Split at 1440 px it would cover the inside wall's north end at y 5500 below)
    await page.click('[data-model-fit]');
    await planClick(0, 0); await planClick(5000, 0); await page.keyboard.press('Escape');
    await settled();
    await page.click('[data-mtool="wall"]');
    await planClick(6000, 600); await planClick(6000, 4000); await planClick(0, 4000); await planClick(0, 0); await page.keyboard.press('Escape');
    await settled();
    ok((await walls()).length === 4 && !(await page.evaluate(() => window.bimcraftPlan.state.data.derived.spaces.length)), 'four walls, the south-east corner open: no room');
    await page.click('[data-modify-tools] summary');
    await page.click('[data-mtool="corner"]');
    ok(await page.textContent('[data-model-hint]') === 'Click the first of the two walls to join.', 'Modify › Corner: the hint asks for the first wall');
    await planClick(2500, 0);
    ok((await page.textContent('[data-model-hint]')).startsWith('Click the second wall'), 'the first wall chosen');
    const [ex, ey] = await at(6000, 2500);
    await page.mouse.move(ex, ey, { steps: 3 });
    const pre = await page.evaluate(() => window.bimcraftTrim.state.plan?.changes?.length);
    ok(pre === 2, 'hovering the second wall previews both walls joined');
    await shot(page, 'df17-01-corner-preview');
    await page.mouse.click(ex, ey);
    await settled();
    let W = await walls();
    ok(W.some((w) => w.a.join() === '0,0' && w.b.join() === '6000,0') && W.some((w) => w.a.join() === '6000,0' && w.b.join() === '6000,4000'), 'Corner: the south wall runs to x 6000, the east wall down to it', JSON.stringify(W));
    ok(await page.evaluate(() => window.bimcraftPlan.state.data.derived.spaces.length) === 1, 'the room closes (one space)');
    // an inside wall drawn right through, trimmed back to the south and north walls
    await page.click('[data-mtool="wall"]');
    await page.selectOption('[data-model-walltype]', 'int-2x4');
    await planClick(2500, -1500); await planClick(2500, 5500); await page.keyboard.press('Escape');
    await settled();
    await page.click('[data-modify-tools] summary');
    await page.click('[data-mtool="trim"]');
    await planClick(1000, 0);   // the edge: the south wall
    ok((await page.textContent('[data-model-hint]')).startsWith('Click each wall to trim or extend'), 'Trim / extend: the south wall is the edge');
    await planClick(2500, 2000);   // the part inside stays
    await settled();
    await page.keyboard.press('Escape');   // choose another edge
    await planClick(1000, 4000);   // the north wall
    await planClick(2500, 1000);
    await settled();
    W = await walls();
    const thru = W.find((w) => w.type === 'int-2x4');
    ok(thru && thru.a.join() === '2500,0' && thru.b.join() === '2500,4000', 'trimmed back to the south wall, then to the north wall', JSON.stringify(thru));
    ok(await page.evaluate(() => window.bimcraftPlan.state.data.derived.spaces.length) === 2, 'it now splits the room in two');
    await shot(page, 'df17-02-trimmed');
    // one undo step per trim
    await page.keyboard.press('Escape');   // the edge is let go; Ctrl+Z goes to the app
    await page.keyboard.press('Control+z');
    await settled();
    ok((await walls()).find((w) => w.type === 'int-2x4').b.join() === '2500,5500', 'Ctrl+Z takes the last trim back (one step)');
    await page.keyboard.press('Control+y');
    await settled();
    ok((await walls()).find((w) => w.type === 'int-2x4').b.join() === '2500,4000', 'Ctrl+Y does it again');
    // a refusal is said before anything changes
    const before = JSON.stringify(await walls());
    await planClick(0, 2000);      // the edge: the west wall
    await planClick(6000, 2000);   // the east wall is parallel to it
    ok(/parallel/.test(await statusOf()) && JSON.stringify(await walls()) === before, 'a parallel wall: refused in the status line, nothing changed', await statusOf());
  }

  if (want('df16')) {
    console.log('== df16: grids and columns');
    await fresh();
    await newBuilding('Grid test');
    const G = () => page.evaluate(() => { const g = window.bimcraftGrids.state.grids.find((x) => x.own); return g ? g.axes.map((x) => ({ tag: x.tag, a: x.a.map(Math.round), b: x.b.map(Math.round) })) : []; });
    await page.click('[data-res-tools] summary');
    await page.click('[data-mtool="grid"]');
    ok(await page.isVisible('[data-mopts="grid"] [data-grid-place]'), 'Build › Grid: its row with "Place a grid…"');
    await page.click('[data-grid-place]');
    await page.waitForSelector('[data-grid-dialog][open]');
    await page.fill('[data-gp-nu]', '3'); await page.fill('[data-gp-su]', '6000');
    await page.fill('[data-gp-nv]', '2'); await page.fill('[data-gp-sv]', '7000');
    await page.fill('[data-gp-extend]', '1500');
    await page.click('[data-gp-ok]');
    ok((await page.textContent('[data-model-hint]')).startsWith('Click where the first crossing'), 'the dialog closes and asks where the first crossing goes');
    await planClick(0, 0);
    await settled();
    let ax = await G();
    ok(ax.map((x) => x.tag).join() === '1,2,3,A,B' && ax.find((x) => x.tag === '2').a.join() === '6000,-1500', 'a grid of 1, 2, 3 by A, B placed with its first crossing on the click');
    await page.evaluate(() => window.bimcraftPlan.view.fit());
    await page.waitForTimeout(200);
    ok(await page.evaluate(() => window.bimcraftPlan.view.scene.grids.length) === 5, 'the plan draws five grid lines with their bubbles');
    await shot(page, 'df16-01-grid');
    // pick a line, rename it, delete it, undo
    await planClick(6000, 3000);
    ok(await page.isVisible('[data-grid-tag]') && await page.inputValue('[data-grid-tag]') === '2', 'clicking line 2 picks it: its label in the row');
    await page.fill('[data-grid-tag]', '2a'); await page.press('[data-grid-tag]', 'Enter');
    await settled();
    ok((await G()).some((x) => x.tag === '2a'), 'renamed to 2a');
    await planClick(6000, 3000);
    await page.mouse.move(10, 10);
    await page.keyboard.press('Delete');
    await settled();
    ok((await G()).length === 4, 'Delete removes the picked line');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Control+z');
    await settled();
    ok((await G()).length === 5, 'Ctrl+Z brings it back');
    // a line drawn one by one joins the numbered lines
    await page.click('[data-res-tools] summary'); await page.click('[data-mtool="grid"]');
    await planClick(13000, -1500); await planClick(13000, 8500);
    await settled();
    ok((await G()).some((x) => x.tag === '4'), 'a line drawn up the plan becomes 4');
    // columns: one by a click near a crossing, then every crossing
    await page.click('[data-res-tools] summary');
    await page.click('[data-mtool="column"]');
    await planClick(6000 + 80, 7000 - 60);
    await settled();
    const cols = () => page.evaluate(() => window.bimcraftGrids.state.cols.map((c) => c.at.map(Math.round).join(',')));
    ok((await cols()).join() === '6000,7000', 'Build › Column: a click near 2a / B puts a column exactly on the crossing');
    await page.click('[data-col-grid]');
    await settled();
    ok((await cols()).length === 8, 'At every grid crossing: the other seven crossings get theirs (eight in all)', String((await cols()).length));
    // the Wall tool snaps to the grid
    await page.click('[data-mtool="wall"]');
    await planClick(60, 40); await planClick(12000 - 50, 30); await page.keyboard.press('Escape');
    await settled();
    const wl = await page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => w.a.map(Math.round).join(',') + '→' + w.b.map(Math.round).join(',')));
    ok(wl.includes('0,0→12000,0'), 'the Wall tool snaps to the grid crossings 1 / A and 3 / A', wl.join(' '));
    // a column's Properties
    const key = await page.evaluate(() => window.bimcraftRes.api.kb() + window.bimcraftGrids.state.cols[0].id);
    await pick([key]);
    await page.waitForSelector('[data-mp-colshape]');
    await page.selectOption('[data-mp-colshape]', 'round');
    await settled();
    ok(await page.evaluate(() => window.bimcraftGrids.state.cols.filter((c) => c.shape === 'round').length) === 1, 'Properties: the picked column made round');
    await shot(page, 'df16-02-columns');
  }

  if (want('df18')) {
    console.log('== df18: floors of any shape, ramps');
    await fresh();
    await newBuilding('Floor test');
    const st = () => page.evaluate(() => { const R = window.bimcraftFloors.state; return { floors: R.floors.map((f) => ({ area: Math.round(f.area), holes: f.openings.length, id: f.id })), ramps: R.ramps.map((r) => ({ id: r.id, run: Math.round(r.runUsed), parts: r.parts.length, slope: r.slope })) }; });
    await page.click('[data-res-tools] summary');
    await page.click('[data-mtool="drawfloor"]');
    for (const q of [[0, 0], [4000, 0], [4000, 1500], [1500, 1500], [1500, 3000], [0, 3000]]) await planClick(q[0], q[1]);
    const [hx, hy] = await at(2000, 2000);
    await page.mouse.move(hx, hy);
    ok(/m²/.test(await page.evaluate(() => window.bimcraftPlan.view.overlay?.hud?.text || '')), 'while drawing: the outline\'s area in the HUD');
    await planClick(0, 0);   // back on the first corner: closed
    await settled();
    let s1 = await st();
    ok(s1.floors.length === 1 && s1.floors[0].area === 8250000, 'Build › Floor by outline: an L-shaped balcony of 8.25 m², closed on its first corner', JSON.stringify(s1));
    await shot(page, 'df18-01-floor');
    const kb = await page.evaluate(() => window.bimcraftRes.api.kb());
    await pick([kb + s1.floors[0].id]);
    await page.waitForSelector('[data-mp-flhole]');
    await page.click('[data-mp-flhole]');
    for (const q of [[300, 300], [1200, 300], [1200, 1200], [300, 1200]]) await planClick(q[0], q[1]);
    await page.keyboard.press('Enter');
    await settled();
    s1 = await st();
    ok(s1.floors[0].holes === 1, 'Properties › Add an opening, four corners and Enter: the floor has an opening');
    // a ramp up 600 at 1:12
    await page.click('[data-res-tools] summary');
    await page.click('[data-mtool="ramp"]');
    await page.selectOption('[data-ramp-top]', 'rise');
    await page.fill('[data-ramp-rise]', '600'); await page.press('[data-ramp-rise]', 'Enter');
    await planClick(6000, -500);
    const [rx, ry] = await at(6000, 2000);
    await page.mouse.move(rx, ry, { steps: 2 });
    ok(/7200, one flight at 1:12/.test(await page.evaluate(() => window.bimcraftPlan.view.overlay?.hud?.text || '')), 'the ramp preview: 7200 long, one flight at 1:12', await page.evaluate(() => window.bimcraftPlan.view.overlay?.hud?.text || ''));
    await page.mouse.click(rx, ry);
    await settled();
    s1 = await st();
    ok(s1.ramps.length === 1 && s1.ramps[0].run === 7200 && s1.ramps[0].parts === 1, 'Build › Ramp: two clicks place a ramp up 600, 7200 long');
    await pick([kb + s1.ramps[0].id]);
    await page.waitForSelector('[data-mp-rpslope]');
    await page.fill('[data-mp-rpslope]', '1:15'); await page.press('[data-mp-rpslope]', 'Enter');
    await settled();
    s1 = await st();
    ok(s1.ramps[0].run === 9000, 'Properties: slope 1:15 makes it 9000 long');
    await shot(page, 'df18-02-ramp');
    await pick([kb + s1.ramps[0].id]);
    await page.mouse.move(10, 10);
    await page.keyboard.press('Delete');
    await settled();
    ok((await st()).ramps.length === 0, 'Delete removes the picked ramp');
    await page.keyboard.press('Control+z');
    await settled();
    ok((await st()).ramps.length === 1, 'Ctrl+Z brings it back');
  }

  if (want('df20')) {
    console.log('== df20: site, building, levels');
    await fresh();
    await newBuilding('Site test');
    await page.click('[data-res-tools] summary');
    await page.click('[data-mtool="site"]');
    for (const q of [[0, 0], [6000, 0], [6000, 4000], [0, 4000]]) await planClick(q[0], q[1]);
    await page.keyboard.press('Enter');
    await settled();
    const site = () => page.evaluate(() => { const s = window.bimcraftSite.state.site; return s && { n: s.points.length, at: s.building.at.map(Math.round), angle: Math.round(s.building.angle * 100) / 100 }; });
    let st = await site();
    ok(st && st.n === 4 && (await page.textContent('[data-site-area]')) === 'Site: 24.00 m²', 'Build › Site: four corners and Enter make the site outline (24 m²)', JSON.stringify(st) + ' ' + await page.textContent('[data-site-area]'));
    ok(await page.evaluate(() => window.bimcraftPlan.view.scene.symbols.some((x) => x.key === -1 && x.dashed?.length === 4)), 'the plan draws it as a property line');
    await page.fill('[data-site-bx]', '3000'); await page.press('[data-site-bx]', 'Tab');
    await settled();
    await page.fill('[data-site-bang]', '15'); await page.press('[data-site-bang]', 'Tab');
    await settled();
    st = await site();
    ok(st.at.join() === '3000,0' && st.angle === 15, 'X 3000 and Turn 15 in the row: the building moves and turns on the site', JSON.stringify(st));
    await shot(page, 'df20-01-site');
    // levels
    await page.click('[data-lv-addmany]');
    await page.waitForSelector('[data-lv-dialog][open]');
    await page.fill('[data-lvd-heights]', '6000, 9000');
    await page.click('[data-lvd-ok]');
    await settled();
    const lvs = () => page.evaluate(() => window.bimcraftPlan.state.data.levels.map((l) => l.name + '@' + Math.round(l.elevation) + '/' + Math.round(l.height)));
    ok((await lvs()).join() === 'Level 1@0/3000,Level 2@3000/3000,Level 3@6000/3000,Level 4@9000/3000', 'Add levels… at 6000, 9000: Level 3 and Level 4', (await lvs()).join());
    await page.click('[data-lv-addmany]');
    await page.waitForSelector('[data-lv-dialog][open]');
    await page.selectOption('[data-lvd-mode]', 'split');
    await page.fill('[data-lvd-total]', '14000'); await page.fill('[data-lvd-count]', '4');
    await page.click('[data-lvd-ok]');
    await settled();
    ok((await lvs()).join() === 'Level 1@0/3500,Level 2@3500/3500,Level 3@7000/3500,Level 4@10500/3500', 'Split 14000 into 4: every level 3500', (await lvs()).join());
    // a Draw tool on a chosen level
    const l3 = await page.evaluate(() => window.bimcraftPlan.state.data.levels[2].id);
    await page.selectOption('[data-model-level]', String(l3));
    await page.click('[data-mtool="wall"]');
    await planClick(0, 0); await planClick(4000, 0); await page.keyboard.press('Escape');
    await settled();
    ok(await page.evaluate((id) => window.bimcraftPlan.state.data.walls.some((w) => w.storey === id), l3), 'a wall drawn with Level 3 chosen is on Level 3');
    await shot(page, 'df20-02-levels');
  }

  if (want('df22')) {
    console.log('== df22: drawing on a point cloud');
    await fresh();
    await newBuilding('Scan test');
    await page.click('[data-mtool="wall"]');
    await planClick(0, 0); await planClick(6000, 0); await page.keyboard.press('Escape');
    await settled();
    // a scanned room as XYZ text (metres): 6 × 4 m turned 10° about (2, 1), 2.7 m tall, its floor 350 mm up
    const lines = [], a = 10 * Math.PI / 180, R2 = (x, y) => [x * Math.cos(a) - y * Math.sin(a) + 2, x * Math.sin(a) + y * Math.cos(a) + 1];
    let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    const put = (x, y, z) => { const q = R2(x, y); lines.push(q[0].toFixed(4) + ' ' + q[1].toFixed(4) + ' ' + (z + 0.35).toFixed(4)); };
    for (let k = 0; k < 24000; k++) { const z = rnd() * 2.7, tt = rnd(), side = k % 4; if (side === 0) put(tt * 6, 0, z); else if (side === 1) put(6, tt * 4, z); else if (side === 2) put(tt * 6, 4, z); else put(0, tt * 4, z); }
    for (let k = 0; k < 12000; k++) put(rnd() * 6, rnd() * 4, 0);
    await page.setInputFiles('[data-cloud-input]', { name: 'room-scan.xyz', mimeType: 'text/plain', buffer: Buffer.from(lines.join('\n')) });
    await page.waitForFunction(() => window.bimcraftCloud?.state?.()?.kept > 0, null, { timeout: 60000 });
    await page.evaluate(() => window.bimcraftScan.api.changed());
    await page.waitForTimeout(300);
    const sliceN = () => page.evaluate(() => window.bimcraftScan.state.slice?.n || 0);
    ok(await page.isVisible('[data-scan-tools]') && (await sliceN()) > 200 && await page.evaluate(() => window.bimcraftPlan.view.scene.cloud?.n > 200), 'a cloud open beside the model: the plan shows its slice at the cut (' + await sliceN() + ' points), the Scan menu shows');
    await shot(page, 'df22-01-slice');
    // the Wall tool snaps to the slice
    // a slice point the plan shows (the cloud bar stacks under the Draw bar, over the top of the plan)
    const sp = await page.evaluate(() => {
      const s = window.bimcraftScan.state.slice, pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect();
      for (let i = 0; i < s.n; i++) {
        const p = [s.xy[2 * i] + 40, s.xy[2 * i + 1] + 30], q = pv.toScreen(p);
        if (document.elementFromPoint(r.left + q.x, r.top + q.y) === pv.canvas) return p;
      }
      return [s.xy[0] + 40, s.xy[1] + 30];
    });
    await page.click('[data-mtool="wall"]');
    const [sx, sy] = await at(sp[0], sp[1]);
    await page.mouse.move(sx, sy, { steps: 2 });
    const sn = await page.evaluate(() => window.bimcraftPlan.state.last?.snap);
    ok(sn?.kind === 'cloud' || sn?.kind === 'end', 'pointing near the slice: the Wall tool snaps to a scanned point (' + sn?.kind + ')');
    await page.keyboard.press('Escape');
    // slice thickness and off
    await page.click('[data-scan-tools] summary');
    await page.fill('[data-scan-thick]', '300'); await page.press('[data-scan-thick]', 'Enter');
    const n300 = await sliceN();
    ok(n300 > 0 && await page.evaluate(() => window.bimcraftScan.thick) === 300, 'a 300 mm slice (' + n300 + ' points)');
    // aligning: the floor to the level, the walls square (pointcloud's cloud-ui.js gives pc.adjust)
    if (await page.evaluate(() => typeof window.bimcraftCloud.adjust === 'function')) {
      await page.click('[data-scan-floor]');
      await page.waitForTimeout(300);
      ok(/its floor is on this level/.test(await statusOf()), 'Align its floor to this level', await statusOf());
      await page.evaluate(() => { document.querySelector('[data-scan-tools]').open = true; });
      await page.click('[data-scan-square]');
      await page.waitForTimeout(300);
      ok(/its walls are square to the building/.test(await statusOf()), 'Turn it square to the building', await statusOf());
    } else {
      await page.click('[data-scan-floor]');
      ok(/needs a newer point cloud viewer/.test(await statusOf()), 'without cloud-ui.js\'s pc.adjust (asked of pointcloud): Align says so', await statusOf());
    }
    // Discord (scan-to-BIM, 2026-10-19): drawing walls must not move the cloud — not in the scene, not on the plan
    {
      const where = () => page.evaluate(() => ({ box: window.bimcraftCloud.state().box, key: window.bimcraftScan.state.key }));
      await page.evaluate(() => { document.querySelector('[data-scan-tools]').open = false; });
      const w0 = await where();
      await page.click('[data-mtool="wall"]');
      await planClick(6000, 0); await planClick(6000, 4000); await planClick(0, 4000); await planClick(0, 0); await page.keyboard.press('Escape');
      await settled();
      await page.evaluate(() => window.bimcraftScan.api.changed());
      const w1 = await where();
      const same = (a, b) => a.every((p, i) => p.every((v, k) => Math.abs(v - b[i][k]) < 1e-6));
      ok(same(w0.box, w1.box) && w0.key === w1.key, 'three more walls drawn: the cloud stays where it was (its box in the scene and its slice on the plan)', JSON.stringify([w0.box, w1.box]));
    }
    await page.evaluate(() => { document.querySelector('[data-scan-tools]').open = true; });
    await page.click('[data-scan-slice]');
    ok((await sliceN()) === 0 && await page.evaluate(() => !window.bimcraftPlan.view.scene.cloud), 'Show the slice off: the plan drops it');
    await page.click('[data-scan-slice]');
    await shot(page, 'df22-02-aligned');
    // the reported case: the cloud opened on an empty model, then its first walls drawn (cc-ifc used to centre the reloaded
    // model on its first wall, so the model moved 1.5 m down and sideways in the scene and the plan's slice went with it)
    await fresh();
    await newBuilding('Scan jump');
    await page.setInputFiles('[data-cloud-input]', { name: 'room-scan.xyz', mimeType: 'text/plain', buffer: Buffer.from(lines.join('\n')) });
    await page.waitForFunction(() => window.bimcraftCloud?.state?.()?.kept > 0, null, { timeout: 60000 });
    await page.evaluate(() => window.bimcraftScan.api.changed());
    const sliceAt = () => page.evaluate(() => { const s = window.bimcraftScan.state.slice; return { key: window.bimcraftScan.state.key, n: s?.n || 0, p: s?.n ? [s.xy[0], s.xy[1]] : null }; });
    const j0 = await sliceAt();
    await page.click('[data-mtool="wall"]');
    await planClick(2000, 1000); await planClick(8000, 1000); await planClick(8000, 5000); await planClick(2000, 5000); await page.keyboard.press('Escape');
    await settled();
    await page.evaluate(() => window.bimcraftScan.api.changed());
    const j1 = await sliceAt();
    ok(j0.n > 200 && j0.key === j1.key && j0.p[0] === j1.p[0] && j0.p[1] === j1.p[1], 'cloud first, then the first walls drawn: the slice stays put on the plan (' + j0.n + ' points)', JSON.stringify([j0.p, j1.p]));
    await shot(page, 'df22-03-walls-on-scan');
  }

  if (want('wallside')) {
    // 0.6.1 FIX-061-WALL-SIDE (Discord, scan-to-BIM): exterior walls drawn clockwise on their inside face, "Outside on left",
    // came out with the body inside the line drawn. Each way round, each face: the body on the side it should be.
    console.log('== wallside: walls drawn on a face, clockwise and anticlockwise');
    await fresh();
    await newBuilding('Side test');
    const R = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
    const ways = [['clockwise', [R[0], R[3], R[2], R[1]], 'left'], ['anticlockwise', R, 'right']];
    let n = 0;
    for (const [name, pts, side] of ways) for (const ref of ['inside', 'outside']) {
      n++;
      const dx = (n - 1) * 12000;
      await page.click('[data-mtool="wall"]');
      await page.selectOption('[data-model-wallref]', ref);
      await page.selectOption('[data-model-wallside]', side);
      await page.evaluate((b) => {   // this room's place in view, below the Draw bar
        const pv = window.bimcraftPlan.view, c = pv.canvas.getBoundingClientRect(), bar = document.querySelector('[data-modelbar]').getBoundingClientRect();
        pv.padTop = Math.max(0, bar.bottom - c.top) + 12; pv.fit(b); pv.render();
      }, { x0: dx - 1500, y0: -1500, x1: dx + 9500, y1: 6500 });
      for (const p of [...pts, pts[0]]) await planClick(p[0] + dx, p[1]);
      await page.keyboard.press('Escape');
      await settled();
      const got = await page.evaluate(([x0]) => window.bimcraftPlan.state.data.walls.filter((w) => w.a[0] > x0 - 1000 && w.a[0] < x0 + 9000)
        .map((w) => ({ m: [(w.a[0] + w.b[0]) / 2 - x0, (w.a[1] + w.b[1]) / 2], ext: w.extSide, j: w.justification, t: w.t })), [dx]);
      const inR = (m) => m[0] > 1 && m[0] < 7999 && m[1] > 1 && m[1] < 4999;
      const want_ = ref === 'inside' ? 'outside' : 'inside';
      ok(got.length === 4 && got.every((w) => (want_ === 'outside' ? !inR(w.m) : inR(w.m)) && w.ext === side), name + ', ' + ref + ' face, Outside on ' + side + ': four walls, the body ' + want_ + ' the line drawn, the outside where it was asked', JSON.stringify(got.map((w) => [w.m.map(Math.round), w.ext, w.j])));
    }
    // the centre line: the Outside select counts for walls that do not close a room (it was always left); a room closed
    // on the centre line still gets its outside to the outside of the loop, whichever way it was drawn
    const dxC = 4 * 12000;
    await page.click('[data-mtool="wall"]');
    await page.selectOption('[data-model-wallref]', 'center');
    await page.selectOption('[data-model-wallside]', 'right');
    await page.evaluate((b) => { const pv = window.bimcraftPlan.view, c = pv.canvas.getBoundingClientRect(), bar = document.querySelector('[data-modelbar]').getBoundingClientRect(); pv.padTop = Math.max(0, bar.bottom - c.top) + 12; pv.fit(b); pv.render(); }, { x0: dxC - 1500, y0: -1500, x1: dxC + 21500, y1: 6500 });
    await planClick(dxC, 0); await planClick(dxC + 8000, 0); await planClick(dxC + 8000, 5000);
    await page.keyboard.press('Escape');
    await settled();
    await page.click('[data-mtool="wall"]');
    for (const p of [[0, 0], [0, 5000], [8000, 5000], [8000, 0], [0, 0]]) await planClick(dxC + 12000 + p[0], p[1]);
    await page.keyboard.press('Escape');
    await settled();
    const cl = await page.evaluate(([x0]) => window.bimcraftPlan.state.data.walls.filter((w) => w.a[0] > x0 - 1000).map((w) => ({ x: (w.a[0] + w.b[0]) / 2 - x0, ext: w.extSide, j: w.justification })), [dxC]);
    const open_ = cl.filter((w) => w.x < 10000), room = cl.filter((w) => w.x >= 10000);
    ok(open_.length === 2 && open_.every((w) => w.ext === 'right' && w.j === 'center'), 'Centerline, Outside on right, two walls not closing a room: both have their outside on the right', JSON.stringify(open_));
    ok(room.length === 4 && room.every((w) => w.ext === 'left'), 'Centerline, a room closed clockwise: every wall\'s outside to the outside of the room (left), whatever the select said', JSON.stringify(room));
    await shot(page, 'wallside-01');
  }

  if (want('square')) {
    // 0.6.1 FIX-061-SQUARE (Discord, scan-to-BIM): "Turn it square to the building" once swung the scan out of view in Model
    // coordinates. In 0.6 the turn was made against where the cloud was drawn and then laid on a placement worked out again
    // (the model's frame had moved: 61.1), so it turned about a point the cloud had left. The alignment now lives in the
    // cloud's own frame: placed again (here: Place › Centered on the model, then back to Model coordinates), the aligned scan
    // moves exactly as the scan itself does, and stays square.
    console.log('== square: Turn it square, then the cloud placed again');
    await fresh();
    await newBuilding('Square test');
    await page.click('[data-mtool="wall"]');
    await planClick(0, 0); await planClick(6000, 0); await page.keyboard.press('Escape');
    await settled();
    const lines = [], a = 10 * Math.PI / 180, R2 = (x, y) => [x * Math.cos(a) - y * Math.sin(a) + 2, x * Math.sin(a) + y * Math.cos(a) + 1];
    let seed = 11; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
    const put = (x, y, z) => { const q = R2(x, y); lines.push(q[0].toFixed(4) + ' ' + q[1].toFixed(4) + ' ' + (z + 0.35).toFixed(4)); };
    for (let k = 0; k < 24000; k++) { const z = rnd() * 2.7, tt = rnd(), side = k % 4; if (side === 0) put(tt * 6, 0, z); else if (side === 1) put(6, tt * 4, z); else if (side === 2) put(tt * 6, 4, z); else put(0, tt * 4, z); }
    for (let k = 0; k < 12000; k++) put(rnd() * 6, rnd() * 4, 0);
    for (let k = 0; k < 400; k++) put(40 + rnd() * 3, 25 + rnd() * 3, 1.2 + rnd() * 0.1);   // a tree 40 m off, at the cut height
    await page.setInputFiles('[data-cloud-input]', { name: 'room-scan.xyz', mimeType: 'text/plain', buffer: Buffer.from(lines.join('\n')) });
    await page.waitForFunction(() => window.bimcraftCloud?.state?.()?.kept > 0, null, { timeout: 60000 });
    await page.evaluate(() => window.bimcraftScan.api.changed());
    const box = () => page.evaluate(() => window.bimcraftCloud.state().box);
    const place = async (v) => { await page.selectOption('[data-cloud-place]', v); await page.waitForTimeout(200); await page.evaluate(() => window.bimcraftScan.api.changed()); };
    await place('model');
    const bM = await box();
    await place('center');
    const bC = await box();
    const d = [0, 1, 2].map((k) => bC[0][k] - bM[0][k]);   // Model coordinates → Centered: a plain move
    ok(Math.hypot(...d) > 1, 'Centered on the model puts the scan elsewhere than Model coordinates (' + Math.hypot(...d).toFixed(2) + ' m away)');
    await page.evaluate(() => { document.querySelector('[data-scan-tools]').open = true; });
    await page.click('[data-scan-floor]');
    await page.waitForTimeout(300);
    await page.evaluate(() => { document.querySelector('[data-scan-tools]').open = true; });
    await page.click('[data-scan-square]');
    await page.waitForTimeout(300);
    const msg = await statusOf();
    const turned = Number((/turned (-?[\d.]+)°/.exec(msg) || [])[1]);
    ok(Math.abs(Math.abs(turned) - 10) < 0.3, 'Turn it square: about 10° (' + msg + ')');
    const bA = await box();
    const sq0 = await page.evaluate(() => { const s = window.bimcraftScan.state.slice; return s?.n || 0; });
    ok(sq0 > 200, 'the slice after the turn (' + sq0 + ' points)');
    // placed again: the aligned scan moves by the same d, it does not swing round the old place
    await place('model');
    const bAM = await box();
    const off = Math.max(...[0, 1].flatMap((i) => [0, 1, 2].map((k) => Math.abs(bAM[i][k] - (bA[i][k] - d[k])))));
    ok(off < 0.005, 'aligned, then placed in Model coordinates: the scan keeps its turn and moves only as the placement does (off by ' + (off * 1000).toFixed(1) + ' mm)', JSON.stringify([bA, bAM, d]));
    await place('center');
    const bAC = await box();
    const back = Math.max(...[0, 1].flatMap((i) => [0, 1, 2].map((k) => Math.abs(bAC[i][k] - bA[i][k]))));
    ok(back < 0.005, 'and back to Centered: where it was aligned', String(back));
    // the room's walls in the slice still run square: turning again finds next to nothing to do
    await page.evaluate(() => { document.querySelector('[data-scan-tools]').open = true; });
    await page.click('[data-scan-square]');
    await page.waitForTimeout(300);
    const again = Number((/turned (-?[\d.]+)°/.exec(await statusOf()) || [])[1]);
    ok(Math.abs(again) < 0.3, 'placed again, Turn it square once more: ' + again + '° (it stayed square)', await statusOf());
    await page.evaluate(() => { document.querySelector('[data-scan-tools]').open = true; });
    await page.click('[data-scan-reset]');
    await page.waitForTimeout(300);
    const bR = await box();
    const reset = Math.max(...[0, 1].flatMap((i) => [0, 1, 2].map((k) => Math.abs(bR[i][k] - bC[i][k]))));
    ok(reset < 0.005, 'Undo the alignment: the scan is back where Centered put it', String(reset));
    await shot(page, 'square-01');
  }

  if (want('df23')) {
    console.log('== df23: from a traced drawing to walls');
    const { traceDxf } = await import(path.join(REPO, 'tools/bimcraft-test/draw06-test.mjs'));
    await fresh();
    await newBuilding('Trace test');
    await page.click('[data-res-tools] summary');
    await page.click('[data-trace-open]');
    await page.waitForSelector('[data-trace-dialog][open]');
    await page.setInputFiles('[data-trace-file]', { name: 'traced.dxf', mimeType: 'application/dxf', buffer: Buffer.from(traceDxf()) });
    await page.waitForSelector('[data-trace-make]');
    ok(await page.isChecked('[data-trace-layer="A-WALL"]') && !(await page.isChecked('[data-trace-layer="A-ANNO"]')), 'the dialog ticks A-WALL (its name says walls), not A-ANNO');
    ok(await page.inputValue('[data-trace-block="DOOR36"]') === 'door-single' && await page.inputValue('[data-trace-block="WIN48"]') === 'win-casement', 'DOOR36 guessed a door, WIN48 a window (by their names)');
    ok(/^Makes 4 walls and 2 doors and windows\./.test(await page.textContent('[data-trace-count]')), 'it will make 4 walls and 2 doors and windows', await page.textContent('[data-trace-count]'));
    await page.selectOption('[data-trace-mode]', 'center');
    ok(/^Makes 8 walls/.test(await page.textContent('[data-trace-count]')), 'as centre lines it would make 8', await page.textContent('[data-trace-count]'));
    await page.selectOption('[data-trace-mode]', 'pairs');
    await shot(page, 'df23-01-dialog');
    await page.click('[data-trace-make]');
    await settled();
    const sn = await page.evaluate(() => { const d = window.bimcraftPlan.state.data; return { walls: d.walls.length, t: d.walls.map((w) => Math.round(w.t)), ops: d.openings.length, spaces: d.derived.spaces.length, under: window.bimcraftTrace.state.underlays.length }; });
    ok(sn.walls === 4 && sn.t.every((x) => x === 200) && sn.ops === 2 && sn.spaces === 1 && sn.under === 1, 'Make them: four 200 mm walls, a door, a window, the room, and the drawing kept under the plan', JSON.stringify(sn));
    ok(await page.evaluate(() => window.bimcraftPlan.view.scene.below.some((b) => b.segs.length >= 40)), 'the plan draws the underlay\'s lines');
    await shot(page, 'df23-02-made');
    await page.keyboard.press('Control+z');
    await settled();
    ok(await page.evaluate(() => window.bimcraftPlan.state.data.walls.length === 0 && window.bimcraftTrace.state.underlays.length === 0), 'one Ctrl+Z takes it all back');
    await page.keyboard.press('Control+y');
    await settled();
    await page.click('[data-res-tools] summary');
    await page.click('[data-trace-open]');
    await page.waitForSelector('[data-trace-dialog][open]');
    ok(await page.isVisible('[data-trace-underlays] [data-trace-remove]'), 'the dialog lists the drawing kept on this level, with Remove');
    await page.click('[data-trace-underlays] [data-trace-remove]');
    await settled();
    ok(await page.evaluate(() => window.bimcraftTrace.state.underlays.length === 0 && window.bimcraftPlan.state.data.walls.length === 4), 'Remove takes the underlay away; the walls stay');
  }

  if (want('df24')) {
    console.log('== df24: CivilCraft\'s ground (LandXML)');
    // a LandXML file written by CivilCraft's own writer: two surfaces, in US survey feet, round the model's origin
    const civil = await import(path.join(REPO, 'public_html/assets/apps/civilcraft/dev/landxml.js'));
    // the writer asks a surface only for toFaces(): a 13 × 13 grid of points, two triangles a cell
    const pts = [], faces = [];
    for (let i = 0; i <= 12; i++) for (let j = 0; j <= 12; j++) pts.push({ x: -30 + i * 5, y: -30 + j * 5, z: 100 + i * 0.3 });
    for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) { const a = i * 13 + j, b = a + 13; faces.push([a, b, b + 1], [a, b + 1, a + 1]); }
    const sf = { toFaces: () => ({ pts, faces }), stats: () => ({ area2d: 3600, area3d: 3601, minZ: 100, maxZ: 103.6 }) };   // and stats() for the Definition's attributes
    let xml = null;
    try { xml = civil.writeLandXml({ name: 'Civil site', units: 'ft', surfaces: [{ name: 'Existing ground', surface: sf }, { name: 'Design', surface: sf }] }); } catch (e) { console.log('  (writer: ' + e.message + ')'); }
    ok(!!xml, 'a LandXML file from CivilCraft\'s own writer');
    if (xml) {
      await fresh();
      await newBuilding('Ground test');
      await page.click('[data-mtool="wall"]');
      await planClick(0, 0); await planClick(6000, 0); await planClick(6000, 4000); await planClick(0, 4000); await planClick(0, 0);
      await page.keyboard.press('Escape');
      await settled();
      await page.click('[data-res-tools] summary');
      await page.click('[data-mtool="terrain"]');
      await page.setInputFiles('[data-res-trfile]', { name: 'civil-site.xml', mimeType: 'application/xml', buffer: Buffer.from(xml) });
      await page.waitForSelector('[data-res-lxdialog][open]', { timeout: 20000 });
      ok((await page.$$eval('[data-res-lxpick]', (b) => b.map((x) => x.textContent))).join(' | ') === 'Existing ground (169 points) | Design (169 points)', 'two surfaces: BimCraft asks which one is the ground');
      await page.click('[data-res-lxpick="0"]');
      await page.waitForFunction(() => window.bimcraftRes?.state?.terrain, null, { timeout: 60000 });
      await settled();
      const trn = await page.evaluate(() => { const x = window.bimcraftRes.state.terrain; return { source: x.source, n: x.pts.length, faces: x.faces.length }; });
      ok(trn.source === 'landxml' && trn.n === 169 && trn.faces === 288, 'the ground is the chosen LandXML surface, its own points and triangles', JSON.stringify(trn));
      ok(/from LandXML/.test(await statusOf()), 'the status line says where it came from', await statusOf());
      await shot(page, 'df24-01-ground');
    }
  }

  if (want('df21')) {
    console.log('== df21: linked models');
    const { fixtureIfc } = await import(path.join(REPO, 'tools/bimcraft-test/ifc-fixture.mjs'));
    await fresh();
    await newBuilding('Link test');
    await page.click('[data-mtool="wall"]');
    await planClick(0, 0); await planClick(6000, 0); await planClick(6000, 4000); await page.keyboard.press('Escape');
    await settled();
    // the browser's file picker answers with a file handle whose file the test can change ("saved again" on disk)
    await page.evaluate(([a, b]) => {
      window.__linkTexts = [a, b];
      window.__linkFile = new File([a], 'Structure.ifc', { lastModified: 1000 });
      window.showOpenFilePicker = async () => [{ kind: 'file', name: 'Structure.ifc', getFile: async () => window.__linkFile }];
    }, [fixtureIfc(), fixtureIfc({ rev: 'b' })]);
    await page.click('[data-link-add]');
    await page.waitForFunction(() => window.bimcraftLinks?.state.loaded.size === 1, null, { timeout: 60000 });
    const links = () => page.evaluate(() => window.bimcraftLinks.state.links.map((l) => l.id + ':' + l.name + ':' + l.mode));
    ok((await links()).join() === 'link-1:Structure.ifc:file' && await page.isVisible('[data-link="link-1"]') && await page.isVisible('[data-model-link="link-1"]'), 'Link a model…: link-1 written into the model and shown, its row in Links and a Link tag in Models');
    ok(await page.evaluate(() => document.querySelector('[data-model-link="link-1"]').closest('li').querySelector('[data-model-active]').disabled), 'a link is never the model you edit (its radio is off)');
    await page.waitForFunction(() => window.bimcraftPlan.view.scene.below.some((b) => b.key === -2 && b.segs.length > 8), null, { timeout: 10000 }).catch(() => {});
    ok(await page.evaluate(() => window.bimcraftPlan.view.scene.below.some((b) => b.key === -2 && b.segs.length > 8)), 'the plan shows the link cut at the level\'s cut height');
    await shot(page, 'df21-01-linked');
    // by two points: a corner of the link onto a corner of the model, then a second pair (picked through the view's own clicks)
    await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer; v.view('top'); v.render(); });
    await page.waitForTimeout(300);
    await page.selectOption('[data-link-place="link-1"]', 'points');
    await page.evaluate(() => {
      const v = document.querySelector('[data-canvas]').viewer, link = window.bimcraftLinks.state.loaded.get('link-1').ent;
      // the corners on top of each model, in the scene
      const tops = (m, mi) => {
        const M = v.modelMatrix(mi), out = [];
        for (const b of m.batches) for (let i = 0; i < b.positions.length; i += 3) { const x = b.positions[i], y = b.positions[i + 1], z = b.positions[i + 2]; out.push([M[0] * x + M[4] * y + M[8] * z + M[12], M[1] * x + M[5] * y + M[9] * z + M[13], M[2] * x + M[6] * y + M[10] * z + M[14]]); }
        const top = Math.max(...out.map((p) => p[1]));
        return out.filter((p) => p[1] > top - 0.001);
      };
      const lt = tops(link.model, link.mi), ht = tops(window.bimcraftRes.api.host.model(), 0);
      const most = (list, f) => list.reduce((a, b) => (f(b) > f(a) ? b : a));
      // a little inside each corner (a ray exactly on a silhouette may miss; the view snaps to the corner)
      const inside = (p, list) => { const c = [0, 1, 2].map((k) => list.reduce((s, q) => s + q[k], 0) / list.length); return p.map((v2, k) => (k === 1 ? v2 : v2 + (c[k] - v2) * 0.01)); };
      const pick = [inside(most(lt, (p) => -p[0] - p[2]), lt), inside(most(ht, (p) => -p[0] - p[2]), ht), inside(most(lt, (p) => p[0] - p[2]), lt), inside(most(ht, (p) => p[0] + p[2]), ht)];
      for (const p of pick) { const sc = v.project(p); v.measuring.click(sc.x, sc.y); }
    });
    await settled();
    const mode = await page.evaluate(() => window.bimcraftLinks.state.links.find((x) => x.id === 'link-1').mode);
    ok(mode === 'points' && /placed by your two points/.test(await statusOf()), 'By two points…: four clicks (link, model, link, model) place the link', await statusOf());
    await page.selectOption('[data-link-place="link-1"]', 'file');
    await settled();
    // map placement refused (neither file has map coordinates)
    await page.selectOption('[data-link-place="link-1"]', 'map');
    ok(/need map coordinates/.test(await statusOf()), 'Map coordinates without map conversions: said, not done', await statusOf());
    // the file changes on disk: reloaded by itself
    const n0 = await page.evaluate(() => window.bimcraftLinks.state.loaded.get('link-1').ent.model.elements);
    await page.evaluate(() => { window.__linkFile = new File([window.__linkTexts[1]], 'Structure.ifc', { lastModified: 2000 }); });
    await page.waitForFunction(() => /changed: reloaded/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 15000 }).catch(() => {});
    const st1 = await page.evaluate(() => { const L = window.bimcraftLinks.state.loaded.get('link-1'); return L && { stamp: L.stamp, w203: [...L.ent.model.batches].length >= 0 && L.ent.ifc.api ? true : false }; });
    ok(/changed: reloaded/.test(await statusOf()) && st1?.stamp === 2000, 'the linked file changed: reloaded by itself (now the version saved at 2000)', await statusOf());
    void n0;
    // unload keeps the link; remove takes it out of the model
    await page.click('[data-link-unload="link-1"]');
    ok(await page.evaluate(() => window.bimcraftLinks.state.loaded.size === 0) && (await page.textContent('[data-link="link-1"] [data-link-state]')) === 'Not loaded', 'Unload: the link stays, not loaded');
    await page.click('[data-link-remove="link-1"]');
    await settled();
    ok((await links()).length === 0, 'Remove: the link is gone from the model');
  }

  if (want('df19')) {
    console.log('== df19: views the BIM way');
    await fresh();
    await newBuilding('Views test');
    await page.click('[data-mtool="wall"]');
    await planClick(0, 0); await planClick(6000, 0); await planClick(6000, 4000); await planClick(0, 4000); await planClick(0, 0); await page.keyboard.press('Escape');
    await settled();
    const L = await page.evaluate(() => window.bimcraftPlan.state.data.levels.map((l) => ({ id: l.id, guid: l.guid, name: l.name })));
    ok(await page.isVisible('[data-pb-sec]') && (await page.$$('[data-pb-plan]')).length === 2 && await page.isVisible('[data-pb-group="sheets"] [data-pb-newsheet]'), 'the project browser: both floor plans, the sheets with New sheet');
    // a plan's view range: cut lower, walls left out of this plan
    const wallsInPlan = () => page.evaluate(() => window.bimcraftPlan.view.scene.walls.length);
    ok(await wallsInPlan() === 4, 'before: the plan shows its four walls');
    await page.click(`[data-pb-range="${L[0].guid}"]`);
    await page.waitForSelector('[data-pv-dialog][open]');
    await page.fill('[data-pv-cut]', '900 mm');
    await page.uncheck('[data-pv-cat="IfcWall"]');
    await shot(page, 'df19-01-range');
    await page.click('[data-pv-ok]');
    await settled();
    const pv = await page.evaluate((id) => { const v = window.bimcraftViews.state.views.get(id); return v && { cut: v.cut, hidden: v.hiddenClasses }; }, L[0].id);
    ok(pv && Math.abs(pv.cut - 900) < 0.01 && pv.hidden.includes('IfcWall') && await wallsInPlan() === 0, 'View range: cut at 900, walls not shown in this plan (kept in the model as CadCraft_PlanView)', JSON.stringify(pv));
    ok(await page.evaluate(() => window.bimcraftPlan.state.data.walls.length) === 4, 'the walls are still in the model');
    await page.keyboard.press('Control+z');
    await settled();
    ok(await wallsInPlan() === 4 && !(await page.evaluate((id) => window.bimcraftViews.state.views.has(id), L[0].id)), 'Ctrl+Z: one step back, the plan as it was');
    // a view template, used by the second level
    await page.click('[data-pb-newtpl]');
    await page.waitForSelector('[data-vt-dialog][open]');
    await page.fill('[data-vt-name]', 'No rooms');
    await page.uncheck('[data-vt-cat="IfcSpace"]');
    await page.click('[data-vt-ok]');
    await settled();
    ok(await page.isVisible('[data-pb-tpl="No rooms"]'), 'New template: listed under View templates');
    await page.click(`[data-pb-range="${L[1].guid}"]`);
    await page.waitForSelector('[data-pv-dialog][open]');
    await page.selectOption('[data-pv-template]', 'No rooms');
    ok(await page.isDisabled('[data-pv-cut]') && /follows the template/.test(await page.textContent('[data-pv-tplnote]')), 'choosing a template: its settings shown, not editable here');
    await page.click('[data-pv-ok]');
    await settled();
    ok(await page.evaluate((id) => window.bimcraftViews.state.views.get(id)?.template, L[1].id) === 'No rooms' && /No rooms/.test(await page.textContent(`[data-pb-plan="${L[1].guid}"]`).then(() => page.textContent('[data-pb-group="plans"]'))), 'the second level\'s plan follows "No rooms" (named beside it in the browser)');
    // clicking a plan in the browser goes to that level
    await page.click(`[data-pb-plan="${L[1].guid}"]`);
    ok(await page.evaluate(() => window.bimcraftPlan.state.level) === L[1].id, 'a floor plan clicked in the browser: the plan shows that level');
    await page.click(`[data-pb-plan="${L[0].guid}"]`);
    // a sheet of your own: a plan and the door schedule, dragged, scaled, saved
    await page.click('[data-pb-newsheet]');
    await page.waitForSelector('[data-sh-dialog][open]');
    await page.click('[data-sh-add^="plan:"]');
    await page.waitForSelector('[data-sh-view="0"]');
    const r0 = await page.$eval('[data-sh-view="0"]', (r) => { const b = r.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
    await page.mouse.move(r0.x, r0.y); await page.mouse.down(); await page.mouse.move(r0.x - 120, r0.y - 40, { steps: 6 }); await page.mouse.up();
    await page.waitForSelector('[data-sh-scale]');
    await page.selectOption('[data-sh-scale]', '100');
    await page.fill('[data-sh-number]', 'A-601');
    await page.fill('[data-sh-title]', 'Ground floor');
    await shot(page, 'df19-02-sheet');
    await page.click('[data-sh-save]');
    await settled();
    const sh = await page.evaluate(() => window.bimcraftViews.state.sheets);
    const pw = 420 / 2;   // a3 for mm drawings: the plan started in the middle
    ok(sh.length === 1 && sh[0].number === 'A-601' && sh[0].views.length === 1 && sh[0].views[0].ratio === 100 && sh[0].views[0].x < pw - 20, 'Save the sheet: one sheet in the model, its plan at 1:100 where it was dragged', JSON.stringify(sh));
    ok(await page.isVisible('[data-pb-sheet="sheet-1"]'), 'listed under Sheets in the browser');
    await page.click('[data-pb-sheet="sheet-1"]');
    await page.waitForSelector('[data-sh-dialog][open]');
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('[data-sh-pdf]')]);
    const pdfPath = await dl.path();
    const head = fs.readFileSync(pdfPath).subarray(0, 8).toString('latin1');
    ok(/A-601\.pdf$/.test(dl.suggestedFilename()) && head.startsWith('%PDF-1.4') && fs.readFileSync(pdfPath).toString('latin1').includes('(A-601)'), 'Download as PDF: one page with the sheet\'s number in its title block', dl.suggestedFilename());
    await page.click('[data-sh-dialog] button[value="cancel"]');
    await shot(page, 'df19-03-browser');
    // the generated drawing set from the browser (and with a grid in the model: its lines on the elevations, DF.16)
    await page.click('[data-res-tools] summary');
    await page.click('[data-mtool="grid"]');
    await page.click('[data-grid-place]');
    await page.waitForSelector('[data-grid-dialog][open]');
    await page.fill('[data-gp-nu]', '2'); await page.fill('[data-gp-su]', '6000'); await page.fill('[data-gp-nv]', '2'); await page.fill('[data-gp-sv]', '4000');
    await page.click('[data-gp-ok]');
    await planClick(0, 0);
    await settled();
    await page.keyboard.press('Escape');
    const pe0 = problems.length;
    await page.click('[data-pb-set]');
    await page.waitForSelector('[data-res-sheets-dlg][open] [data-res-shlist] button[data-sheet]', { timeout: 30000 });
    const nSheets = (await page.$$('[data-res-shlist] button[data-sheet]')).length;
    ok(nSheets >= 2 && problems.length === pe0, 'Drawing set… from the browser: the generated sheets (plans, elevations) with a grid in the model, no errors', nSheets + ' | ' + problems.slice(pe0).join(' | '));
    await page.click('[data-res-shclose]');
  }

  if (want('df25')) {
    console.log('== df25: assistant tools through the window\'s control channel');
    await fresh();
    await newBuilding('Agent test');
    // Settings › BimCraft › Assistants: on, with Draw edits and Save (the person's switches)
    await page.click('[data-settings-open]');
    await page.waitForSelector('dialog[data-app-settings][open]');
    await page.click('[data-settings-tab="app"]');
    await page.check('[name="bcAssist"]');
    ok(await page.isVisible('[name="bcAssistSave"]') && !(await page.isChecked('[name="bcAssistSave"]')), 'Settings › BimCraft › Assistants: a Save switch beside Read and Change the view and draw, off');
    await page.check('[name="bcAssistEdit"]');
    await page.check('[name="bcAssistSave"]');
    await page.locator('[data-bc-assist-set]').scrollIntoViewIfNeeded();
    await shot(page, 'df25-01-settings');
    await page.keyboard.press('Escape');
    await page.waitForSelector('dialog[data-app-settings][open]', { state: 'detached', timeout: 3000 }).catch(() => {});
    const rpc = (method, params, id = 1) => page.evaluate(([m, p, i]) => window.bimcraftControl.handle({ jsonrpc: '2.0', id: i, method: m, params: p }, 'test-session', { name: 'Test assistant', version: '1' }), [method, params, id]);
    let r = await rpc('tools.list', {});
    const names = (r.result?.tools || []).map((x) => x.name);
    ok(['elements_find', 'element_properties', 'elements_isolate', 'app_info', 'model_describe', 'walls_list', 'walls_add', 'opening_add', 'floor_add', 'levels_add', 'grid_add', 'selection_get', 'selection_set', 'undo', 'model_save'].every((n) => names.includes(n)), 'tools.list: the 0.4 tools plus the Draw edits, app_info, selection, undo and Save', names.join(','));
    r = await rpc('tools.call', { name: 'walls_add', arguments: { points: [[0, 0], [5000, 0], [5000, 4000], [0, 4000]], closed: true, type: 'ext-2x6' } });
    const made = r.result?.structuredContent?.walls || [];
    await settled();
    ok(!r.result?.isError && made.length === 4 && await page.evaluate(() => window.bimcraftPlan.state.data.walls.length) === 4, 'walls_add: four walls drawn in the open model; the plan shows them', JSON.stringify(r).slice(0, 200));
    ok(await page.evaluate(() => window.bimcraftPlan.view.scene.walls.length) === 4 && await page.evaluate(() => window.bimcraftPlan.state.data.derived.spaces?.length || 0) >= 1, 'the room they close is found, as when drawn by hand');
    const lastLabel = () => page.evaluate(() => { const ch = document.querySelector('[data-change-list]'); return ch ? ch.textContent : ''; });
    ok(/Assistant: add 4 walls/.test(await lastLabel()), 'the change list names the step "Assistant: add 4 walls"');
    r = await rpc('tools.call', { name: 'opening_add', arguments: { wall: made[0], kind: 'door' } });
    await settled();
    ok(!r.result?.isError && await page.evaluate(() => window.bimcraftPlan.state.data.openings.length) === 1, 'opening_add: a door in the first wall', JSON.stringify(r).slice(0, 200));
    await shot(page, 'df25-02-drawn');
    r = await rpc('tools.call', { name: 'selection_set', arguments: { guids: [made[0]] } });
    const selCount = await page.evaluate(() => document.querySelector('[data-canvas]').viewer.selection.size);
    ok(!r.result?.isError && selCount === 1, 'selection_set: the wall picked in the view (Properties shows it)');
    r = await rpc('tools.call', { name: 'undo', arguments: {} });
    await settled();
    ok(!r.result?.isError && r.result.structuredContent.undone.join() === 'Assistant: add a door' && await page.evaluate(() => window.bimcraftPlan.state.data.openings.length) === 0, 'undo: the door taken back (the assistant\'s step)', JSON.stringify(r).slice(0, 200));
    r = await rpc('tools.call', { name: 'app_info', arguments: {} });
    ok(r.result?.structuredContent?.app === 'bimcraft' && r.result.structuredContent.levels === 2 && r.result.structuredContent.unsaved === true, 'app_info: BimCraft, two levels, unsaved changes');
    // the person turns Draw edits off: the edit tools disappear and are refused
    await page.evaluate(() => window.bimcraftControl.configure({ groups: ['read'] }));
    r = await rpc('tools.call', { name: 'walls_add', arguments: { points: [[0, 0], [1000, 0]] } });
    ok(r.result?.isError && /edit permission/.test(r.result.content[0].text), 'with only Read allowed: walls_add refused');
  }

  if (want('df29')) {
    console.log('== df29: pipes and ducts');
    await fresh();
    await newBuilding('MEP test');
    const st = () => page.evaluate(() => { const R = window.bimcraftMep.state; return R.runs.map((r) => ({ guid: r.guid, kind: r.kind, size: r.size, w: Math.round(r.w), parts: r.parts.length, valves: r.valves.length, system: r.system, ids: r.parts })); });
    const kinds = (guid) => page.evaluate((g) => { const R = window.bimcraftMep.state, r = R.runs.find((x) => x.guid === g); return (R.lay.get(r.storey)?.runs.get(g)?.parts || []).map((p) => p.kind).join(','); }, guid);
    await page.click('[data-res-tools] summary');
    await page.click('[data-mtool="pipe"]');
    ok(await page.isVisible('[data-mopts="pipe"]') && await page.$eval('[data-mep-sys]', (s) => s.options.length) === 10 && await page.$eval('[data-mep-mat]', (s) => s.value) === 'copper', 'Build › Pipe: the bar shows its system (10), material (copper for cold water), class and size');
    await page.selectOption('[data-mep-mat]', 'steel');
    await page.selectOption('[data-mep-size]', '2');
    ok(await page.$eval('[data-mep-size] option[value="2"]', (o) => o.textContent) === 'DN50', 'sizes read as DN in a metric model (NPS 2 = DN50)');
    await page.fill('[data-mep-z]', '2700'); await page.press('[data-mep-z]', 'Enter');
    for (const q of [[0, 0], [3000, 0], [3000, 2000]]) await planClick(q[0], q[1]);
    ok(/at 2700/.test(await page.evaluate(() => window.bimcraftPlan.view.overlay?.hud?.text || '')), 'while drawing: the length and the height in the HUD', await page.evaluate(() => window.bimcraftPlan.view.overlay?.hud?.text || ''));
    await page.keyboard.press('Enter');
    await settled();
    let s1 = await st();
    ok(s1.length === 1 && s1[0].parts === 3 && await kinds(s1[0].guid) === 'segment,bend,segment', 'three clicks and Enter: a steel pipe with its elbow made for it', JSON.stringify(s1));
    const main = s1[0].guid;
    // a branch: ending on the main's line makes a tee
    await page.selectOption('[data-mep-size]', '1');
    await planClick(1500, 1000);
    await planClick(1500, 0);
    await settled();
    s1 = await st();
    ok(s1.length === 2 && await kinds(main) === 'segment,tee,segment,bend,segment', 'a 1" branch ending on the main: a tee in the main, made by itself', await kinds(main));
    const sc = await page.evaluate(() => { const v = window.bimcraftPlan.view.scene; return { colored: v.symbols.filter((x) => x.color === '--layer-blue').length, labels: (v.rooms || []).flatMap((r) => r.label) }; });
    ok(sc.colored >= 6 && sc.labels.includes('DN50 CW') && sc.labels.includes('DN25 CW'), 'the plan: the parts in cold water\'s colour, labelled DN50 CW and DN25 CW', JSON.stringify(sc));
    await shot(page, 'df29-01-pipes');
    // a ball valve on the main
    await page.click('[data-res-tools] summary');
    await page.click('[data-mtool="valve"]');
    await page.selectOption('[data-mep-valve]', 'ball');
    await planClick(700, 0);
    await settled();
    ok(await kinds(main) === 'segment,valve,segment,tee,segment,bend,segment' && (await st()).find((r) => r.guid === main).valves === 1, 'Valve › Ball valve, one click on the main: the pipe is cut round it');
    // a duct sized from its airflow
    await page.click('[data-res-tools] summary');
    await page.click('[data-mtool="duct"]');
    await page.selectOption('[data-mep-shape]', 'round');
    await page.fill('[data-mep-flow]', '470'); await page.press('[data-mep-flow]', 'Enter');
    await page.fill('[data-mep-rate]', '0.8'); await page.press('[data-mep-rate]', 'Enter');
    await page.click('[data-mep-sizeit]');
    ok(/^Sized: \d+, [\d.]+ m\/s\./.test(await statusOf()) && Number(await page.inputValue('[data-mep-w]')) >= 250, 'Duct: 470 L/s at 0.8 Pa/m, Size it: a round size by equal friction (' + await statusOf() + ')');
    // (kept low on the plan: the duct's long option bar covers the top of it)
    for (const q of [[0, 4000], [4500, 4000], [4500, 1000]]) await planClick(q[0], q[1]);
    await page.keyboard.press('Enter');
    await settled();
    s1 = await st();
    const duct = s1.find((r) => r.kind === 'duct');
    ok(duct && duct.parts === 3, 'the duct drawn: segment, elbow, segment', JSON.stringify(s1.map((r) => [r.kind, r.parts])) + ' ' + (duct ? await kinds(duct.guid) : '') + ' ' + await statusOf());
    // Properties: a bigger main
    const kb = await page.evaluate(() => window.bimcraftRes.api.kb());
    await pick([kb + s1.find((r) => r.guid === main).ids[0]]);
    await page.waitForSelector('[data-mp-mepsize]');
    await page.selectOption('[data-mp-mepsize]', '2-1/2');
    await settled();
    ok((await st()).find((r) => r.guid === main).size === '2-1/2', 'Properties › Size: the main made 2-1/2" (its fittings made again)');
    const k3 = await page.evaluate(() => [...document.querySelector('[data-canvas]').viewer.allKeys()]), want3 = (await st()).flatMap((r) => r.ids.map((id) => kb + id));
    ok(want3.length >= 10 && want3.every((k) => k3.includes(k)), 'the 3D view has every part', k3.length + ' keys in 3D, ' + want3.filter((k) => !k3.includes(k)).length + ' parts missing of ' + want3.length);
    // schedules
    await page.selectOption('[data-msched-kind]', 'pipes');
    const rows = await page.$$eval('[data-msched] tbody tr', (trs) => trs.map((tr) => tr.textContent));
    ok(rows.length === 2 && rows.some((r) => /DN65/.test(r)) && rows.some((r) => /DN25/.test(r)), 'Schedules › Pipes: DN65 and DN25 with their lengths', rows.join(' | '));
    await page.selectOption('[data-msched-kind]', 'mepfit');
    const frows = await page.$$eval('[data-msched] tbody tr', (trs) => trs.map((tr) => tr.textContent));
    ok(frows.some((r) => /Ball valve/.test(r)) && frows.some((r) => /Tee/.test(r)) && frows.some((r) => /Elbow/.test(r)), 'Schedules › Fittings and valves: the elbows, the tee, the ball valve', frows.join(' | '));
    // the takeoff for TakeoffCraft carries them
    const to = await page.evaluate(async () => { const r = await window.bimcraftRes.makeTakeoff(); return { items: r.takeoff.items.map((i) => i.name + ':' + i.type), marks: r.takeoff.marks.length }; });
    ok(to.items.some((n) => /^Pipe DN65, Steel, Schedule 40, Domestic cold water:linear$/.test(n)) && to.items.some((n) => /^Ball valve DN65, Domestic cold water:count$/.test(n)) && to.items.some((n) => /^Duct Ø\d+, Round, Supply air:linear$/.test(n)), 'Takeoff: pipe and duct by size as runs, the valve counted', to.items.join(' | '));
    // a riser into Level 2: shown there with its mark
    await page.click('[data-res-tools] summary');
    await page.click('[data-mtool="pipe"]');
    await page.fill('[data-mep-z]', '2700'); await page.press('[data-mep-z]', 'Enter');
    await planClick(6000, 0);
    await planClick(7000, 0);
    await page.fill('[data-mep-z]', '4500'); await page.press('[data-mep-z]', 'Enter');
    await planClick(9000, 0);
    await page.keyboard.press('Enter');
    await settled();
    s1 = await st();
    const ris = s1.find((r) => r.parts === 5);
    ok(ris && await kinds(ris.guid) === 'segment,bend,segment,bend,segment', 'a new height typed while drawing: a riser at the last point (two elbows)');
    const l2 = await page.evaluate(() => window.bimcraftPlan.state.data.levels[1].id);
    await page.selectOption('[data-model-level]', String(l2));
    await settled();
    const parts2 = (ids) => page.evaluate((ids) => { const v = window.bimcraftPlan.view.scene, kb = window.bimcraftRes.api.kb(); return { mine: [...new Set(v.symbols.filter((x) => ids.includes(x.key - kb)).map((x) => x.key - kb))], marks: (v.rooms || []).flatMap((r) => r.label).filter((l) => l === 'UP' || l === 'DN') }; }, ids);
    const sc2 = await parts2(ris.ids);
    ok(sc2.mine.length === 3 && sc2.mine.every((id) => ris.ids.slice(2).includes(id)) && sc2.marks.join() === 'DN', 'on Level 2: only the riser and the parts above it, the riser marked DN (it goes down from here)', JSON.stringify(sc2));
    await shot(page, 'df29-02-level2');
    await page.selectOption('[data-model-level]', String(await page.evaluate(() => window.bimcraftPlan.state.data.levels[0].id)));
    await settled();
    const sc1 = await parts2(ris.ids);
    ok(sc1.mine.length === 3 && sc1.mine.every((id) => ris.ids.slice(0, 3).includes(id)) && sc1.marks.join() === 'UP', 'back on Level 1: the lower leg, its elbow and the riser, marked UP', JSON.stringify(sc1));
    // delete and undo
    await pick([kb + (await st()).find((r) => r.kind === 'duct').ids[0]]);
    await page.mouse.move(10, 10);
    await page.keyboard.press('Delete');
    await settled();
    ok(!(await st()).some((r) => r.kind === 'duct'), 'Delete removes the picked duct run');
    await page.keyboard.press('Control+z');
    await settled();
    ok((await st()).some((r) => r.kind === 'duct'), 'Ctrl+Z brings it back');
    await shot(page, 'df29-03-done');
  }

  const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
  ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  await shot(page, 'zz-error').catch(() => {});
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimdraw06']); } catch (e) { /* the session ends on its own */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

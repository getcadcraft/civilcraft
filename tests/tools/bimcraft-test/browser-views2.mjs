#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-views2.mjs — BimCraft views, round 2 (0.6 DC.117, session `bim-views_PART_2`) in the lab, headless, real clicks.
 *   node tools/bimcraft-test/browser-views2.mjs [--shots <dir>] [--only a,b]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimviews2), so the shared
 * admin-login throttle is never touched. Fails on any console error.
 *   a   a plan's scale, underlay (another level, light) and crop region drawn with two clicks; Esc; Ctrl+Z; Print at the
 *       view's scale clipped to the crop; a sheet placing the plan at its own scale
 *   b   the reflected ceiling plan: a ceiling with a grid pattern, a light placed at the ceiling, what the ceiling plan shows
 *   c   callouts: Annotate › Callout (two corners), its tag opens it (cropped, at its scale, the bar says so), Up, its settings,
 *       on a sheet (the tag then says where), Print, delete and Ctrl+Z
 *   d   drafting: Line, Polyline, Rectangle, Hatch region (corners, and Fill a room), shown only in its own view (not the ceiling
 *       plan, not a callout), picked on the plan, pattern in Properties, Move, Delete + Ctrl+Z, drafting inside a callout, Print
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimviews2'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
let ctx = null, page = null;
/** A fresh browser context, signed in, on /lab/bimcraft in mm. */
async function fresh() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
}
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
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const room = async (x0, y0, x1, y1) => { await page.click('[data-mtool="wall"]'); await planClick(x0, y0); await planClick(x1, y0); await planClick(x1, y1); await planClick(x0, y1); await planClick(x0, y0); await page.keyboard.press('Escape'); await settled(); };
const download = async (sel) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.click(sel)]); return { name: dl.suggestedFilename(), bytes: fs.readFileSync(await dl.path()) }; };

try {
  if (want('a')) {
    console.log('== a: a plan\'s scale, underlay and crop region');
    await fresh();
    await newBuilding('Crop test');
    await room(0, 0, 8000, 5000);   // Level 1
    const L = await page.evaluate(() => window.bimcraftPlan.state.data.levels.map((l) => ({ id: l.id, guid: l.guid, name: l.name })));
    await page.click(`[data-pb-plan="${L[1].guid}"]`);
    await settled();
    await room(0, 0, 4000, 5000);   // Level 2: half of it
    ok(!(await page.evaluate(() => window.bimcraftPlan.view.scene.underlay)), 'before: Level 2 shows no underlay');
    // scale and underlay in the View range dialog
    await page.click(`[data-pb-range="${L[1].guid}"]`);
    await page.waitForSelector('[data-pv-dialog][open]');
    ok(await page.isVisible('[data-pv-scale]') && await page.isVisible('[data-pv-underlay]') && /None/.test(await page.textContent('[data-pv-crop]')), 'View range: Scale, Underlay and Crop region (none yet) are there');
    await page.selectOption('[data-pv-scale]', '50');
    await page.selectOption('[data-pv-underlay]', L[0].guid);
    await page.click('[data-pv-ok]');
    await settled();
    let v = await page.evaluate((id) => { const x = window.bimcraftViews.state.views.get(id); return x && { scale: x.scale, underlay: x.underlay }; }, L[1].id);
    const under = await page.evaluate(() => window.bimcraftPlan.view.scene.underlay?.segs?.length || 0);
    ok(v?.scale === 50 && v.underlay === L[0].guid, 'saved: 1:50 and Level 1 as the underlay', JSON.stringify(v));
    ok(under >= 4 * 4, 'Level 2\'s plan now draws Level 1 under it (' + under / 4 + ' segments)');
    await shot(page, 'a-01-underlay');
    // the crop, by two clicks on the plan
    await page.click(`[data-pb-range="${L[1].guid}"]`);
    await page.waitForSelector('[data-pv-dialog][open]');
    await page.click('[data-pv-cropdraw]');
    await page.waitForFunction(() => window.bimcraftPlan.state.tool === 'crop');
    ok(/one corner/.test(await page.textContent('[data-model-hint]')), 'Draw on the plan…: the Crop tool asks for one corner');
    await page.keyboard.press('Escape');
    ok(await page.evaluate(() => window.bimcraftPlan.state.tool) === 'select', 'Esc: back to Select, nothing cropped');
    await page.click(`[data-pb-range="${L[1].guid}"]`);
    await page.waitForSelector('[data-pv-dialog][open]');
    await page.click('[data-pv-cropdraw]');
    await page.waitForFunction(() => window.bimcraftPlan.state.tool === 'crop');
    await planClick(-500, -500);
    const [mx, my] = await at(3000, 2500);
    await page.mouse.move(mx, my, { steps: 3 });
    ok((await page.evaluate(() => window.bimcraftPlan.view.overlay?.dashed?.length)) === 4, 'after one corner the rectangle follows the pointer (dashed)');
    await page.mouse.click(mx, my);
    await settled();
    v = await page.evaluate((id) => window.bimcraftViews.state.views.get(id)?.crop, L[1].id);
    const sc = await page.evaluate(() => window.bimcraftPlan.view.scene.crop);
    ok(v && Math.abs(v[0] + 500) < 1 && Math.abs(v[2] - 3000) < 1 && Math.abs(v[3] - 2500) < 1 && sc?.join() === v.join(), 'the second corner: the crop region saved on the plan and shown (veiled outside)', JSON.stringify(v));
    ok(await page.evaluate(() => window.bimcraftPlan.state.tool) === 'select', 'the tool ends after the crop');
    await shot(page, 'a-02-crop');
    // Print: at 1:50, clipped
    const pr = await download('[data-model-print]');
    const ptxt = pr.bytes.toString('latin1');
    ok(ptxt.startsWith('%PDF') && / re W n\n/.test(ptxt) && /\(1:50\)/.test(ptxt), 'Print: a PDF at the view\'s 1:50, clipped to the crop', pr.name);
    // a sheet takes the plan at its own scale
    await page.click('[data-pb-newsheet]');
    await page.waitForSelector('[data-sh-dialog][open]');
    await page.click(`[data-sh-add="plan:${L[1].guid}"]`);
    await page.waitForSelector('[data-sh-view="0"]');
    const svgClip = await page.$eval('[data-sh-stage]', (s) => /clip-path="url\(#cc-crop-0\)"/.test(s.innerHTML) && /\b1:50\b/.test(s.innerHTML));
    ok(svgClip, 'New sheet: the plan comes in at its own 1:50, cropped');
    await shot(page, 'a-03-sheet');
    await page.click('[data-sh-dialog] button[value="cancel"]');
    // one step back: the crop goes, the scale and underlay stay
    await page.mouse.move(10, 10);
    await page.keyboard.press('Control+z');
    await settled();
    v = await page.evaluate((id) => { const x = window.bimcraftViews.state.views.get(id); return x && { crop: x.crop, scale: x.scale }; }, L[1].id);
    ok(v && v.crop === null && v.scale === 50 && !(await page.evaluate(() => window.bimcraftPlan.view.scene.crop)), 'Ctrl+Z: the crop undone in one step; the scale stays', JSON.stringify(v));
  }

  if (want('b')) {
    console.log('== b: the reflected ceiling plan');
    await fresh();
    await newBuilding('Ceiling test');
    await room(0, 0, 6000, 4000);
    const L = await page.evaluate(() => window.bimcraftPlan.state.data.levels.map((l) => ({ id: l.id, guid: l.guid })));
    // a door, so the ceiling plan can leave it out
    await page.click('[data-mtool="door"]');
    await planClick(3000, 0);
    await settled();
    // a ceiling in the room, with a 600 grid
    await page.click('[data-mtool="ceiling"]');
    await planClick(3000, 2000);
    await settled();
    const ce = await page.evaluate(() => { const s = window.bimcraftPlan.state; return (s.data.derived.ceilings || []).map((c) => ({ id: c.id, h: c.height, pattern: c.pattern })); });
    ok(ce.length === 1 && ce[0].pattern === '', 'Ceiling tool: a ceiling in the room (plain)', JSON.stringify(ce));
    await page.click('[data-mtool="select"]');
    const kb = await page.evaluate(() => window.bimcraftRes.api.kb());
    await page.evaluate((k) => window.bimcraftVis.pick(k), [kb + ce[0].id]);
    await page.waitForSelector('[data-mp-cepat]');
    await page.selectOption('[data-mp-cepat]', '600x600');
    await settled();
    ok(await page.evaluate(() => window.bimcraftPlan.state.data.derived.ceilings[0].pattern) === '600x600', 'Properties › Pattern: 600 × 600 grid (one step)');
    const doorSyms = await page.evaluate(() => window.bimcraftPlan.view.scene.symbols.length);
    ok(doorSyms >= 1, 'the floor plan draws the door symbol');
    // the ceiling plan
    ok((await page.$$('[data-pb-rcp]')).length === 2, 'the project browser lists a ceiling plan for each level');
    await page.click(`[data-pb-rcp="${L[0].guid}"]`);
    await settled();
    const sc = await page.evaluate(() => { const s = window.bimcraftPlan.view.scene; return { kind: s.kind, sel: document.querySelector('[data-model-viewkind]').value, grid: s.symbols.reduce((n, x) => n + (x.thin?.length || 0), 0), doors: s.symbols.filter((x) => x.lines?.length).length, tag: s.rooms.map((r) => r.label?.[0]).join('|'), walls: s.walls.length, below: s.below.length }; });
    ok(sc.kind === 'rcp' && sc.sel === 'rcp', 'a ceiling plan clicked in the browser: the plan shows it (the bar says Ceiling plan)', JSON.stringify(sc));
    ok(sc.grid >= 10 && sc.doors === 0, 'the ceiling\'s 600 grid is drawn (' + sc.grid + ' lines); the door symbol is not');
    ok(/^CLG /.test(sc.tag) && sc.walls === 4, 'the height tag "' + sc.tag + '" and the four walls cut at 2300');
    await shot(page, 'b-01-ceiling-plan');
    // a light at the ceiling, from the library panel's own entry point
    const item = JSON.parse(fs.readFileSync(path.join(REPO, 'tools/library/seed/range.item.json'), 'utf8'));
    item.name = 'Test light'; item.body.h = 150; item.params.height = 150;   // a fixture 150 mm deep: wholly above the 2300 cut
    await page.evaluate((it) => window.bimcraftLibrary.host.place({ item: it, meta: { library: '', sha256: '', sourceFile: '' } }), item);
    await page.waitForSelector('[data-placebar]:not([hidden])');
    ok(await page.inputValue('[data-place-mount]') === 'ceiling', 'Place with the ceiling plan shown: Mount says At the ceiling');
    await page.fill('[data-place-xy]', '3000, 2000');
    await page.click('[data-place-typed]');
    await page.waitForSelector('dialog.bc-dialog[open] [data-ask-number]');
    await page.click('dialog.bc-dialog[open] button[value="ok"]');
    await waitStatus(/Test light/);
    await settled();
    const placed = await page.evaluate(() => {
      const ed = window.bimcraftRes.api.ed(), api = ed.api, mid = ed.mid;
      const id = ed.placer().placements().find((x) => x.name === 'Test light')?.id;
      if (id === undefined) return null;
      const o = api.GetLine(mid, id, false), lp = api.GetLine(mid, o.ObjectPlacement.value, false), ax = api.GetLine(mid, lp.RelativePlacement.value, false), c = api.GetLine(mid, ax.Location.value, false);
      return { id, z: Number(c.Coordinates[2]?.value ?? c.Coordinates[2]) };
    });
    const ceh = ce[0].h, top = placed ? placed.z + item.body.h : NaN;
    ok(placed && Math.abs(top - ceh) < 1, 'placed: its top at the ceiling\'s underside (' + (placed?.z ?? '?') + ' + ' + item.body.h + ' = ' + ceh + ')', JSON.stringify(placed));
    if (await page.isVisible('[data-place-stop]')) await page.click('[data-place-stop]');
    await settled();
    const shown = await page.evaluate((k) => window.bimcraftPlan.view.scene.below.some((b) => b.key === k), kb + (placed?.id ?? -1));
    ok(shown, 'the ceiling plan draws the light (above the cut, under the level\'s top)');
    await shot(page, 'b-02-light');
    // back to the floor plan: the light is above its cut and not drawn there
    await page.selectOption('[data-model-viewkind]', 'plan');
    await settled();
    const fl = await page.evaluate((k) => { const s = window.bimcraftPlan.view.scene; return { kind: s.kind || 'plan', light: [...s.below, ...s.above, ...s.cut].some((b) => b.key === k), doors: s.symbols.filter((x) => x.lines?.length).length }; }, kb + (placed?.id ?? -1));
    ok(fl.kind === 'plan' && !fl.light && fl.doors >= 1, 'Floor plan again: the door is back, the light (above the cut) is not drawn', JSON.stringify(fl));
    // a sheet takes the ceiling plan
    await page.click('[data-pb-newsheet]');
    await page.waitForSelector('[data-sh-dialog][open]');
    ok(await page.isVisible(`[data-sh-add="rcp:${L[0].guid}"]`), 'New sheet: ceiling plans are offered');
    await page.click(`[data-sh-add="rcp:${L[0].guid}"]`);
    await page.waitForSelector('[data-sh-view="0"]');
    ok(/ceiling plan/.test(await page.textContent('[data-sh-stage]')), 'the ceiling plan placed on the sheet with its title');
    await shot(page, 'b-03-sheet');
    await page.click('[data-sh-dialog] button[value="cancel"]');
  }

  const annot = async (tool) => { if (!(await page.isVisible(`[data-mtool="${tool}"]`))) await page.click('[data-annot-tools] > summary'); await page.click(`[data-mtool="${tool}"]`); };
  const S = (fn, arg) => page.evaluate(fn, arg);

  if (want('c')) {
    console.log('== c: callouts');
    await fresh();
    await newBuilding('Callout test');
    await room(0, 0, 8000, 5000);
    const L = await S(() => window.bimcraftPlan.state.data.levels.map((l) => ({ id: l.id, guid: l.guid })));
    await annot('callout');
    ok(await S(() => window.bimcraftPlan.state.tool) === 'callout' && /one corner/.test(await page.textContent('[data-model-hint]')), 'Annotate › Callout: the tool asks for one corner');
    await planClick(1000, 1000);
    const [mx, my] = await at(4000, 3000);
    await page.mouse.move(mx, my, { steps: 3 });
    ok((await S(() => window.bimcraftPlan.view.overlay?.lines?.length)) === 4, 'after one corner the rectangle follows the pointer');
    await page.mouse.click(mx, my);
    await settled();
    let co = await S(() => window.bimcraftViews.state.callouts.map((c) => ({ id: c.id, name: c.name, crop: c.crop, scale: c.scale, parent: c.parent })));
    ok(co.length === 1 && co[0].name === 'Callout 1' && Math.abs(co[0].crop[2] - 4000) < 1 && co[0].scale === 20 && co[0].parent === 'plan:' + L[0].guid, 'the second corner: "Callout 1" of Level 1\'s floor plan at 1:20', JSON.stringify(co));
    ok(/Callout 1 made/.test(await page.textContent('[data-status]')) && await S(() => window.bimcraftPlan.state.tool) === 'select', 'it says so; the tool ends');
    const tag = await S(() => window.bimcraftPlan.view.scene.rooms.find((r) => r.callout)?.at);
    ok(!!tag && (await S(() => window.bimcraftPlan.view.scene.symbols.filter((x) => x.callout).length)) === 1, 'the plan draws its rectangle and a tag');
    ok(await page.isVisible('[data-pb-callout="callout-1"]'), 'the project browser lists it under Callouts');
    await shot(page, 'c-01-callout-on-plan');
    await planClick(tag[0], tag[1]);
    await settled();
    let st = await S(() => ({ co: window.bimcraftPlan.state.callout, crop: window.bimcraftPlan.view.scene.crop, chip: document.querySelector('[data-co-chip]')?.hidden === false ? document.querySelector('[data-co-chip]').textContent : '' }));
    ok(st.co === 'callout-1' && st.crop?.join() === co[0].crop.join() && /Callout: Callout 1/.test(st.chip), 'a click on its tag opens it: the plan cropped to its rectangle, the bar says "Callout: Callout 1"', JSON.stringify(st));
    await shot(page, 'c-02-callout-open');
    const pr = await download('[data-model-print]');
    const ptxt = pr.bytes.toString('latin1');
    ok(ptxt.startsWith('%PDF') && /\(Callout: Callout 1\)/.test(ptxt) && /\(1:20\)/.test(ptxt) && / re W n\n/.test(ptxt), 'Print in the callout: titled "Callout: Callout 1", at 1:20, clipped');
    await page.click('[data-co-back]');
    await settled();
    st = await S(() => ({ co: window.bimcraftPlan.state.callout, crop: window.bimcraftPlan.view.scene.crop, chip: document.querySelector('[data-co-chip]')?.hidden }));
    ok(st.co === null && !st.crop && st.chip === true, 'Up: back to the floor plan (no crop, the chip gone)');
    // its settings
    await page.click('[data-pb-coedit="callout-1"]');
    await page.waitForSelector('[data-co-dialog][open]');
    await page.fill('[data-co-name]', 'Kitchen');
    await page.selectOption('[data-co-scale]', '25');
    await page.click('[data-co-ok]');
    await settled();
    co = await S(() => window.bimcraftViews.state.callouts.map((c) => ({ name: c.name, scale: c.scale })));
    ok(co[0]?.name === 'Kitchen' && co[0].scale === 25, 'its settings: renamed Kitchen, 1:25 (one step)', JSON.stringify(co));
    // a sheet takes it; the tag then says where
    await page.click('[data-pb-newsheet]');
    await page.waitForSelector('[data-sh-dialog][open]');
    ok(await page.isVisible('[data-sh-add="callout:callout-1"]'), 'New sheet: callouts are offered');
    await page.click('[data-sh-add="callout:callout-1"]');
    await page.waitForSelector('[data-sh-view="0"]');
    const stage = await page.$eval('[data-sh-stage]', (x) => x.innerHTML);
    ok(/Kitchen/.test(stage) && /\b1:25\b/.test(stage) && /clip-path/.test(stage), 'the callout placed at its 1:25, cropped, titled');
    await shot(page, 'c-03-sheet');
    await page.click('[data-sh-save]');
    await settled();
    const lab = await S(() => window.bimcraftPlan.view.scene.rooms.find((r) => r.callout)?.label);
    ok(lab?.[0] === 'Kitchen' && /^1 \/ A-5\d\d$/.test(lab?.[1] || ''), 'the tag now says where it is: "' + (lab || []).join(' | ') + '"');
    // delete, then Ctrl+Z
    await page.click('[data-pb-coedit="callout-1"]');
    await page.waitForSelector('[data-co-dialog][open]');
    await page.click('[data-co-delete]');
    await settled();
    ok((await S(() => window.bimcraftViews.state.callouts.length)) === 0 && !(await S(() => window.bimcraftPlan.view.scene.rooms.some((r) => r.callout))), 'Delete callout: gone from the browser and the plan');
    await page.mouse.move(10, 10);
    await page.keyboard.press('Control+z');
    await settled();
    ok((await S(() => window.bimcraftViews.state.callouts.map((c) => c.name).join())) === 'Kitchen', 'Ctrl+Z: Kitchen back');
  }

  if (want('d')) {
    console.log('== d: drafting lines and hatch regions');
    await fresh();
    await newBuilding('Drafting test');
    await room(0, 0, 8000, 5000);
    // Since SU.751 (0.7, bim-07) the plan is fitted beside the narrow Draw bar, so x 11000 (the cross-hatch's corners) fell
    // off the canvas onto the right panel. Zoom out one wheel step about the room, as a person would, so the whole working
    // area (-1000…11000 × -1000…8000) is on the plan; a wheel zoom also stops the automatic re-fit (userMoved).
    { const [cx, cy] = await at(4000, 2500); await page.mouse.move(cx, cy); await page.mouse.wheel(0, 150); await page.waitForTimeout(100); }
    const L = await S(() => window.bimcraftPlan.state.data.levels.map((l) => ({ id: l.id, guid: l.guid })));
    const items = () => S(() => window.bimcraftDrafting.api.items().map((d) => ({ guid: d.guid, id: d.id, kind: d.kind, view: d.view, n: d.pts.length, closed: d.closed, pattern: d.pattern, x0: d.pts[0][0], y0: d.pts[0][1] })));
    await annot('dline');
    await planClick(1000, 6000); await planClick(4000, 6000);
    await settled();
    await page.keyboard.press('Escape');
    await annot('dpoly');
    await planClick(1000, 7000); await planClick(3000, 7000); await planClick(3000, 8000);
    await page.keyboard.press('Enter');
    await settled();
    await annot('drect');
    await planClick(5000, 6000); await planClick(7000, 7500);
    await settled();
    let D = await items();
    ok(D.length === 3 && D.every((d) => d.kind === 'lines' && d.view === 'plan:' + L[0].guid) && D.map((d) => d.n).join() === '2,3,4' && D[2].closed, 'Line (2 points), Polyline (3, Enter ends it), Rectangle (closed, 4): each in Level 1\'s floor plan', JSON.stringify(D));
    // a hatch region by its corners, cross-hatch
    await annot('dhatch');
    ok(await page.isVisible('[data-dr-pattern]'), 'Hatch region: the Draw bar shows the pattern');
    await page.selectOption('[data-dr-pattern]', 'cross');
    await planClick(9000, 0); await planClick(11000, 0); await planClick(11000, 2000); await planClick(9000, 2000); await planClick(9000, 0);
    await settled();
    // and one filling the room, solid
    await page.selectOption('[data-dr-pattern]', 'concrete');
    await page.check('[data-dr-room]');
    await planClick(4000, 2500);
    await settled();
    await page.keyboard.press('Escape');
    D = await items();
    const hc = D.find((d) => d.kind === 'hatch' && d.pattern === 'cross'), hr = D.find((d) => d.kind === 'hatch' && d.pattern === 'concrete');
    ok(hc && hc.n === 4 && hr && hr.n >= 4, 'Hatch region: cross-hatch by four corners (a click on the first closes it); Fill a room: concrete over the room', JSON.stringify(D.filter((d) => d.kind === 'hatch')));
    const sc = await S(() => (window.bimcraftPlan.view.scene.drafting || []).map((d) => ({ kind: d.kind, segs: d.segs.length / 4 })));
    ok(sc.length === 5 && sc.filter((d) => d.kind === 'hatch').every((d) => d.segs > 5), 'the plan draws all five, the hatches with their strokes', JSON.stringify(sc));
    await shot(page, 'd-01-drafting');
    // only in its own view: not in the ceiling plan, not in 3D
    await page.selectOption('[data-model-viewkind]', 'rcp');
    await settled();
    ok(!(await S(() => (window.bimcraftPlan.view.scene.drafting || []).length)), 'the ceiling plan of the same level does not show them');
    await page.selectOption('[data-model-viewkind]', 'plan');
    await settled();
    const in3d = await S((ids) => { const m = window.bimcraftRes.api.host.model(); const kb = m.keyBase || 0; const set = new Set(ids.map((i) => kb + i)); return (m.batches || []).some((b) => [...(b.triIds || [])].some((k) => set.has(k))); }, D.map((d) => d.id));
    ok(!in3d, 'nothing of them in the 3D view');
    // picked on the plan: Properties › Pattern; Move
    const [hx, hy] = await at(10500, 1500);
    await page.mouse.click(hx, hy);
    await page.waitForSelector('[data-mp-drpat]');
    await page.selectOption('[data-mp-drpat]', 'earth');
    await settled();
    ok((await items()).find((d) => d.guid === hc.guid)?.pattern === 'earth', 'picked on the plan (inside it): Properties › Pattern earth (one step)');
    await page.waitForSelector('[data-mp-drmove]');
    await page.click('[data-mp-drmove]');
    await planClick(9000, 0); await planClick(9500, -1000);
    await settled();
    let moved = (await items()).find((d) => d.guid === hc.guid);
    ok(Math.abs(moved.x0 - 9500) < 30 && Math.abs(moved.y0 + 1000) < 30, 'Move: two points, 500 across and 1000 down (within a pixel)', JSON.stringify(moved));
    ok(await page.isVisible('[data-mp-drmove]'), 'still picked after the move (Properties shows it)');
    // Delete, Ctrl+Z
    const [lx, ly] = await at(2500, 6000);
    await page.mouse.click(lx, ly);
    await page.waitForFunction(() => window.bimcraftViews && document.querySelector('[data-mp-drmove]'));
    await page.mouse.move(lx, ly);
    await page.keyboard.press('Delete');
    await settled();
    ok((await items()).length === 4, 'the line picked on the plan, Delete: gone');
    await page.mouse.move(10, 10);
    await page.keyboard.press('Control+z');
    await settled();
    ok((await items()).length === 5, 'Ctrl+Z: back');
    // drafting inside a callout stays there
    await annot('callout');
    await planClick(500, 500); await planClick(3500, 3000);
    await settled();
    await page.click('[data-pb-callout="callout-1"]');
    await settled();
    await annot('dline');
    await planClick(1000, 1000); await planClick(3000, 2500);
    await settled();
    await page.keyboard.press('Escape');
    D = await items();
    const inCo = D.filter((d) => d.view === 'callout:callout-1');
    ok(inCo.length === 1 && (await S(() => (window.bimcraftPlan.view.scene.drafting || []).length)) === 1, 'a line drawn in the callout: in the callout\'s view only (the callout shows 1, not the floor plan\'s 5)');
    await shot(page, 'd-02-in-callout');
    await page.click('[data-co-back]');
    await settled();
    ok((await S(() => (window.bimcraftPlan.view.scene.drafting || []).length)) === 5, 'Up to the floor plan: its own five, not the callout\'s line');
    // Print and a sheet
    const pr = await download('[data-model-print]');
    ok(pr.bytes.toString('latin1').startsWith('%PDF') && pr.bytes.length > 4000, 'Print: the floor plan with its drafting (' + pr.bytes.length + ' bytes)');
    await page.click('[data-pb-newsheet]');
    await page.waitForSelector('[data-sh-dialog][open]');
    await page.click(`[data-sh-add="plan:${L[0].guid}"]`);
    await page.waitForSelector('[data-sh-view="0"]');
    const lines = await page.$eval('[data-sh-stage]', (x) => x.querySelectorAll('polyline').length);
    ok(lines > 60, 'New sheet: the plan comes with its drafting and hatch strokes (' + lines + ' lines)');
    await shot(page, 'd-03-sheet');
    await page.click('[data-sh-dialog] button[value="cancel"]');
  }

  const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
  ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  await shot(page, 'zz-error').catch(() => {});
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimviews2']); } catch (e) { /* the session ends on its own */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

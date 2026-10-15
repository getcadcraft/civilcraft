#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-model.mjs — BimCraft's building tools (0.5 part 3, track BM) in the lab, headless, with real clicks and keys.
 *   node tools/bimcraft-test/browser-model.mjs [--shots <dir>] [--only bm2,bm3]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimmodel; disabled at the
 * end), so the shared admin-login throttle is never touched. Fails on any console error.
 *   bm2  New building opens with Draw on: the plan of Level 1 beside 3D, the Levels panel (rename, height moves the levels
 *        above, add a level), Plan / Split / 3D, units
 *   bm3  the Wall tool: four clicks and a click on the start close a room (one wall per click, one undo step each), a typed
 *        length, Shift keeps it square, a T wall, Undo / Redo, the 3D view has the walls, Delete, Save as IFC read back
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
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimmodel'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const statusOf = () => page.textContent('[data-status]');

/** The plan: page position of a plan point (mm). */
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
/** Wait until the model has settled (no reload running, nothing queued). */
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 60000 });
const walls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => ({ guid: w.guid, a: w.a.map(Math.round), b: w.b.map(Math.round), t: Math.round(w.t * 100) / 100, h: Math.round(w.height), type: w.typeKey, side: w.extSide, storey: w.storey })));
const levels = () => page.evaluate(() => window.bimcraftPlan.state.data.levels.map((l) => ({ name: l.name, e: Math.round(l.elevation), h: Math.round(l.height) })));
const elementsIn3d = () => page.evaluate(() => document.querySelector('[data-canvas]').viewer.allKeys().size);

try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });

  console.log('== bm2: a new building opens with its plan');
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Draw test');
  await page.fill('[data-new-levels]', '2');
  await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await waitStatus(/^New building Draw test/);
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  ok(await page.getAttribute('[data-model-toggle]', 'aria-pressed') === 'true' && await page.isVisible('[data-plan-canvas]') && await page.isVisible('[data-canvas]'), 'Draw is on: the plan and the 3D view side by side');
  ok(await page.isVisible('[data-levels-sec]') && JSON.stringify(await levels()) === JSON.stringify([{ name: 'Level 1', e: 0, h: 3000 }, { name: 'Level 2', e: 3000, h: 3000 }]), 'Levels panel: Level 1 at 0, Level 2 at 3000, both 3000 tall');
  ok((await page.$$eval('[data-model-level] option', (o) => o.map((x) => x.textContent))).join() === 'Level 2,Level 1' && await page.inputValue('[data-model-level]') !== '', 'the plan\'s level list, top level first; Level 1 shown');
  await shot(page, 'bm2-01-new');
  if (want('bm2')) {
    await page.fill('[data-lv-name]:below(:text("Name")) >> nth=1', 'Ground floor').catch(() => {});
    const nameInputs = await page.$$('[data-levels] [data-lv-name]');
    await nameInputs[1].fill('Ground floor');
    await nameInputs[1].press('Enter');
    await settled();
    ok((await levels())[0].name === 'Ground floor', 'renamed Level 1 to "Ground floor" in the panel');
    const hts = await page.$$('[data-levels] [data-lv-height]');
    await hts[1].fill('3600');
    await hts[1].press('Enter');
    await settled();
    const L = await levels();
    ok(L[0].h === 3600 && L[1].e === 3600, 'Ground floor 3600 tall: Level 2 moved up to 3600');
    await page.click('[data-lv-add]');
    await settled();
    const L2 = await levels();
    ok(L2.length === 3 && L2[2].e === 6600 && L2[2].h === 3000, 'Add a level on top: Level 3 at 6600');
    await page.click('[data-act="undo"]');
    await settled();
    ok((await levels()).length === 2, 'Undo takes the new level away');
    await page.click('[data-model-layout="plan"]');
    ok(await page.evaluate(() => getComputedStyle(document.querySelector('[data-canvas-wrap]')).visibility) === 'hidden', 'Plan: the plan alone');
    await page.click('[data-model-layout="split"]');
    await page.selectOption('[data-model-units]', 'ftin');
    ok(/'-/.test(await page.inputValue('[data-levels] [data-lv-height] >> nth=1')), 'feet and inches: heights read ' + await page.inputValue('[data-levels] [data-lv-height] >> nth=1'));
    await page.selectOption('[data-model-units]', 'mm');
  }

  if (want('bm3')) {
    console.log('== bm3: draw walls');
    await page.click('[data-mtool="wall"]');
    ok(await page.isVisible('[data-mopts="wall"]') && await page.isVisible('[data-model-typed]'), 'the Wall tool shows the wall type, its height and the length box');
    await page.selectOption('[data-model-walltype]', 'ext-2x6');
    await planClick(0, 0);
    await planClick(8000, 0);
    await settled();
    let W = await walls();
    ok(W.length === 1 && W[0].a.join() === '0,0' && W[0].b.join() === '8000,0', 'two clicks: one wall 0,0 → 8000,0 (snapped to round numbers)');
    await planClick(8000, 6000);
    // a typed length: 8000 to the left along the pointer's direction
    const [px, py] = await at(2000, 6000); await page.mouse.move(px, py, { steps: 3 });
    await page.keyboard.type('8000');
    ok(await page.inputValue('[data-model-typed]') === '8000', 'typing a number goes to the length box');
    await page.keyboard.press('Enter');
    await settled();
    W = await walls();
    ok(W.length === 3 && W[2].b.join() === '0,6000', 'typed 8000 + Enter: the wall to 0,6000');
    await page.focus('[data-plan-canvas]').catch(() => {});
    await planClick(0, 0);   // back on the start: closes the room
    await settled();
    W = await walls();
    ok(W.length === 4 && /Room closed: 4 walls/.test(await statusOf()), 'a click on the first point closes the room: ' + await statusOf());
    ok(W.every((w) => w.side === 'right'), 'drawn anticlockwise: every wall\'s outside is on its right (the outside of the room)');
    ok(W.every((w) => w.h === 3600), 'walls run up to Level 2 (3600)');
    await shot(page, 'bm3-01-room');
    // a T wall with Shift (square)
    await page.click('[data-mtool="wall"]');
    await planClick(4000, 6000);
    const [tx, ty] = await at(4150, 2000); await page.keyboard.down('Shift'); await page.mouse.move(tx, ty, { steps: 2 }); await page.mouse.click(tx, ty); await page.keyboard.up('Shift');
    await page.keyboard.press('Escape');
    await settled();
    W = await walls();
    const T = W.find((w) => w.a.join() === '4000,6000');
    ok(T && T.b[0] === 4000, 'Shift keeps the wall square: 4000,6000 → ' + T?.b.join());
    ok(await elementsIn3d() >= 5, 'the 3D view has the walls (' + await elementsIn3d() + ' elements)');
    await page.click('[data-act="undo"]');
    await settled();
    ok((await walls()).length === 4, 'Undo: the T wall goes');
    await page.click('[data-edit-menu] summary');
    await page.click('[data-edit-menu] [data-act="redo"]').catch(async () => { await page.keyboard.press('Control+y'); });
    await settled();
    ok((await walls()).length === 5, 'Redo: back');
    // pick the T wall in the plan and delete it
    await page.click('[data-mtool="select"]');
    await planClick(4000, 4000);
    ok((await page.evaluate(() => [...document.querySelector('[data-canvas]').viewer.selection])).length === 1 && /Wall/.test(await page.textContent('[data-props]')), 'a click in the plan picks the wall (3D and Properties follow)');
    await page.keyboard.press('Delete');
    await settled();
    ok((await walls()).length === 4, 'Delete removes it');
    await shot(page, 'bm3-02-after');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-save]')]);
    const text = fs.readFileSync(await dl.path(), 'utf8');
    ok((text.match(/IFCWALL\(/g) || []).length === 4 && /'Qto_WallBaseQuantities'/.test(text), 'Save as IFC: 4 IfcWall with their quantities');
  }
  if (want('bm4') && want('bm3')) {
    console.log('== bm4: doors and windows in the walls');
    const ops = () => page.evaluate(() => window.bimcraftPlan.state.data.openings.map((o) => ({ guid: o.guid, kind: o.kind, type: o.typeKey, off: Math.round(o.offset), w: Math.round(o.width), sill: Math.round(o.sill), hand: o.hand, face: o.face, wall: o.wallGuid })));
    const W = await walls();
    const south = W.find((w) => w.a[1] === 0 && w.b[1] === 0), east = W.find((w) => w.a[0] === 8000 && w.b[0] === 8000), north = W.find((w) => w.a[1] === 6000 && w.b[1] === 6000);
    await page.click('[data-mtool="door"]');
    ok(await page.isVisible('[data-mopts="door"]') && (await page.$$eval('[data-model-otype="door"] option', (o) => o.map((x) => x.textContent))).length === 9, 'the Door tool: nine door types (five starters + four residential, RC.4), width and height');
    // hover inside the room near the south wall at x = 2000: the preview swings in, with distances to both corners
    const [hx, hy] = await at(2000, 300);
    await page.mouse.move(hx, hy, { steps: 3 });
    const pre = await page.evaluate(() => { const o = window.bimcraftPlan.view.overlay; return { sym: o.symbols?.length || 0, dims: (o.dims || []).map((d) => d.text) }; });
    ok(pre.sym === 1 && pre.dims.length === 2, 'the preview: the door\'s symbol and its distance to each corner (' + pre.dims.join(', ') + ')');
    await page.mouse.click(hx, hy);
    await settled();
    let O = await ops();
    ok(O.length === 1 && O[0].kind === 'door' && O[0].wall === south.guid && O[0].face === 'left' && Math.abs(O[0].off - (2000 - 457)) <= 10, 'click: a single swing door in the south wall, centred on the pointer, swinging into the room (offset ' + O[0]?.off + ')');
    await shot(page, 'bm4-01-door');
    // the windows: east wall, typed distance from the nearer corner
    await page.click('[data-mtool="window"]');
    const [ex, ey] = await at(8000, 1000);
    await page.mouse.move(ex, ey, { steps: 3 });
    await page.keyboard.type('900');
    await page.keyboard.press('Enter');
    await settled();
    O = await ops();
    const win = O.find((o) => o.kind === 'window');
    ok(win && win.wall === east.guid && win.face === 'right' && win.type === 'win-single-hung' && win.sill === Math.round(32 * 25.4), 'typed 900: a single hung window (the first window type) in the east wall, on the wall\'s outside, sill 2\'-8"');
    ok(win && Math.abs(win.off - (900 - east.t / 2)) <= 1, 'it sits 900 from the nearer corner of its outside face (the face starts half a wall before the centre line: offset ' + win?.off + ')');
    // a door with H (flip): north wall
    await page.click('[data-mtool="door"]');
    const [nx, ny] = await at(6000, 5700);
    await page.mouse.move(nx, ny, { steps: 3 });
    await page.keyboard.press('h');
    await page.mouse.click(nx, ny);
    await settled();
    O = await ops();
    const nd = O.find((o) => o.wall === north.guid);
    ok(nd && nd.hand === 'b', 'H flips the hinges before the click (hand b)');
    ok(await elementsIn3d() >= 4 + 3, 'the 3D view has the walls, two doors and the window (' + await elementsIn3d() + ')');
    // drag the first door along the south wall with Select
    await page.click('[data-mtool="select"]');
    const d0 = O.find((o) => o.wall === south.guid);
    const [sx, sy] = await at(d0.off + 457, 0);
    const [tx, ty] = await at(d0.off + 457 + 3000, 0);
    await page.mouse.move(sx, sy); await page.mouse.down(); await page.mouse.move(tx, ty, { steps: 8 }); await page.mouse.up();
    await settled();
    const moved = (await ops()).find((o) => o.guid === d0.guid);
    ok(moved && Math.abs(moved.off - (d0.off + 3000)) <= 13, 'Select + drag moves the door 3000 along the wall (offset ' + moved?.off + ')');
    ok((await page.evaluate(() => [...document.querySelector('[data-canvas]').viewer.selection])).length === 1, 'the moved door stays picked');
    await page.keyboard.press('Delete');
    await settled();
    ok((await ops()).length === 2, 'Delete: the door goes, its wall closes');
    await page.click('[data-act="undo"]');
    await settled();
    ok((await ops()).length === 3, 'Undo brings it back');
    await shot(page, 'bm4-02-all');
    await page.click('[data-model-layout="plan"]');
    await page.click('[data-model-fit]');
    await page.waitForTimeout(150);
    await shot(page, 'bm4-03-plan');
    await page.click('[data-model-layout="split"]');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-save]')]);
    const text = fs.readFileSync(await dl.path(), 'utf8');
    ok((text.match(/IFCDOOR\(/g) || []).length === 2 && (text.match(/IFCWINDOW\(/g) || []).length === 1 && (text.match(/IFCOPENINGELEMENT\(/g) || []).length === 3 && (text.match(/IFCRELFILLSELEMENT\(/g) || []).length === 3, 'Save as IFC: 2 doors, 1 window, each in its opening');
  }

  if (want('bm5') && want('bm4') && want('bm3')) {
    console.log('== bm5: click it, change it');
    const ops = () => page.evaluate(() => window.bimcraftPlan.state.data.openings.map((o) => ({ guid: o.guid, off: Math.round(o.offset), w: Math.round(o.width), hand: o.hand, wall: o.wallGuid })));
    const setField = async (sel, value) => { await page.fill(sel, value); await page.press(sel, 'Enter'); await settled(); };
    await page.click('[data-mtool="select"]');
    let W = await walls();
    const south = W.find((w) => w.a[1] === 0 && w.b[1] === 0), north = W.find((w) => w.a[1] === 6000 && w.b[1] === 6000);
    await planClick(1000, 0);
    await page.waitForSelector('[data-model-props]');
    ok(await page.isVisible('[data-mp-type]') && await page.isVisible('[data-mp-thick]') && await page.isVisible('[data-mp-len]'), 'a click on a wall: Properties shows its type, thickness, length, height, base offset, outside');
    await page.selectOption('[data-mp-type]', 'int-2x4');
    await settled();
    W = await walls();
    ok(W.find((w) => w.guid === south.guid).t === Math.round(4.5 * 25.4 * 100) / 100 && W.find((w) => w.guid === south.guid).type === 'int-2x4', 'Type: the wall becomes an interior 2×4 (114.3 thick), in one step');
    await page.waitForSelector('[data-mp-thick]');
    await setField('[data-mp-thick]', '200');
    W = await walls();
    ok(W.find((w) => w.guid === south.guid).t === 200 && /@200/.test(W.find((w) => w.guid === south.guid).type), 'Thickness 200: a 200 mm variant of its type');
    // length of the north wall: its end moves, the joined west wall follows
    await planClick(4000, 6000);
    await page.waitForSelector('[data-mp-len]');
    await setField('[data-mp-len]', '9000');
    W = await walls();
    const west = W.find((w) => w.b[0] === 0 && w.b[1] === 0 && w.guid !== south.guid);
    ok(W.find((w) => w.guid === north.guid).b.join() === '-1000,6000' && west && west.a.join() === '-1000,6000', 'Length 9000: the wall\'s end moves out 1000 and the joined wall comes with it');
    await page.click('[data-act="undo"]');
    await settled();
    // a door: width, distance from the start, hinges
    const d0 = (await ops()).find((o) => o.wall === south.guid);
    await planClick(d0.off + d0.w / 2, -200);
    await page.waitForSelector('[data-mp-ow]');
    ok(await page.isVisible('[data-mp-ostart]') && await page.isVisible('[data-mp-hand]'), 'a click on a door: width, height, distances from both ends, hinges, swing side');
    await setField('[data-mp-ow]', '900');
    let d1 = (await ops()).find((o) => o.guid === d0.guid);
    ok(d1.w === 900, 'Width 900');
    await page.waitForSelector('[data-mp-ostart]');
    await setField('[data-mp-ostart]', '1000');
    d1 = (await ops()).find((o) => o.guid === d0.guid);
    const westT = (await walls()).find((w) => w.b.join() === '0,0' && w.a[0] === 0).t;
    ok(Math.abs(d1.off - (1000 + westT / 2)) <= 1, 'From the start 1000: measured from where the room-side face starts, at the west wall\'s inner face (offset ' + d1.off + ')');
    const hand0 = d1.hand;
    await page.click('[data-mp-hand]');
    await settled();
    ok((await ops()).find((o) => o.guid === d0.guid).hand !== hand0, 'Hinges › Flip');
    await shot(page, 'bm5-01-door-props');
    // two walls at once: Change type…
    await page.keyboard.press('Escape');
    await planClick(8000, 3000);
    const [nx2, ny2] = await at(4000, 6000);
    await page.keyboard.down('Shift'); await page.mouse.click(nx2, ny2); await page.keyboard.up('Shift');
    await page.waitForSelector('[data-model-props] [data-mp-type]');
    ok(/2 walls/.test(await page.textContent('[data-model-props]')), 'two walls picked: Properties offers what they share');
    await page.selectOption('[data-model-props] [data-mp-type]', 'cmu-8');
    await settled();
    W = await walls();
    ok(W.filter((w) => w.type === 'cmu-8').length === 2, 'Change type: both are concrete block now');
    // grips: drag the east wall's middle 1000 to the right; its neighbours stretch
    await page.keyboard.press('Escape');
    await planClick(8000, 4500);
    const east = (await walls()).find((w) => w.a[0] === 8000 && w.b[0] === 8000);
    const [gx, gy] = await at(8000, 3000), [hx2, hy2] = await at(9000, 3000);
    await page.mouse.move(gx, gy); await page.mouse.down(); await page.mouse.move(hx2, hy2, { steps: 8 }); await page.mouse.up();
    await settled();
    W = await walls();
    const e2 = W.find((w) => w.guid === east.guid);
    ok(e2 && e2.a[0] === 9000 && e2.b[0] === 9000 && W.find((w) => w.guid === south.guid).b[0] === 9000, 'drag the middle grip: the wall moves 1000, the walls joined to it stretch (' + e2?.a.join() + ')');
    await shot(page, 'bm5-02-grip');
  }

  if (want('bm6') && want('bm3')) {
    console.log('== bm6: rooms, floors, ceilings, a roof');
    const derived = () => page.evaluate(() => { const d = window.bimcraftPlan.state.data.derived; return { spaces: d.spaces.map((x) => x.name), floors: d.floors.length, ceilings: d.ceilings.length, roofs: d.roofs.map((r) => ({ parts: r.parts.length, gables: r.gables.length + (String(r.edges || '').match(/=g/g) || []).length })) }; });   // RC.1: gables are per wall (edges)
    let D = await derived();
    const labels = await page.evaluate(() => window.bimcraftPlan.view.scene.rooms.map((r) => r.label.join(' ')));
    ok(D.spaces.length === 1 && labels.length === 1 && /Room 1 .*(ft²|m²)/.test(labels[0]), 'the closed room is a room by itself: "' + labels[0] + '" on the plan');
    await page.click('[data-mtool="select"]');
    await page.keyboard.press('Escape');
    await planClick(3000, 3000);
    await page.waitForSelector('[data-mp-rname]');
    await page.fill('[data-mp-rname]', 'Kitchen'); await page.press('[data-mp-rname]', 'Enter');
    await settled();
    ok((await derived()).spaces[0] === 'Kitchen' && (await page.evaluate(() => window.bimcraftPlan.view.scene.rooms[0].label[0])) === 'Kitchen', 'a click inside picks the room; its name changes in Properties and on the plan');
    await page.keyboard.press('Escape');
    await page.click('[data-mtool="floor"]');
    await page.selectOption('[data-model-flmode="floor"]', 'building');
    const [fx, fy] = await at(3000, 3000);
    await page.mouse.move(fx, fy, { steps: 3 });
    ok(await page.evaluate(() => (window.bimcraftPlan.view.overlay.walls || []).length >= 1 && !!window.bimcraftPlan.view.overlay.hud), 'the Floor tool shows what it would cover and its area');
    await page.mouse.click(fx, fy);
    await settled();
    await page.click('[data-mtool="ceiling"]');
    await planClick(3000, 3000);
    await settled();
    D = await derived();
    ok(D.floors === 1 && D.ceilings === 1, 'a floor under the whole building and a ceiling in the room');
    await page.click('[data-mtool="roof"]');
    await page.fill('[data-model-rfpitch]', '6/12'); await page.press('[data-model-rfpitch]', 'Enter');
    await page.selectOption('[data-model-rfends]', 'gable-short');
    const [rx, ry] = await at(3000, 3000);
    await page.mouse.move(rx, ry, { steps: 3 });
    ok(await page.evaluate(() => (window.bimcraftPlan.view.overlay.symbols || []).some((s) => (s.thin || []).length)), 'the Roof tool previews the eave and the ridge');
    await page.mouse.click(rx, ry);
    await settled();
    D = await derived();
    ok(D.roofs.length === 1 && D.roofs[0].gables === 2 && D.roofs[0].parts === 6, 'a 6/12 roof with gables on the short sides: two roof planes, two gable ends, fascia and soffit (RC.1)');
    await page.click('[data-toolbar] [data-view="iso"]');
    await page.waitForTimeout(300);
    await shot(page, 'bm6-01-roof');
    // the roof's level shows it
    const l2 = await page.$$eval('[data-model-level] option', (o) => o.map((x) => x.value));
    await page.selectOption('[data-model-level]', l2[0]);
    await settled();
    ok(await page.evaluate(() => window.bimcraftPlan.view.scene.symbols.some((s) => s.roof)), 'on the level above, the plan shows the roof (eave dashed, ridge thin)');
    await page.selectOption('[data-model-level]', l2[l2.length - 1]);
    await settled();
    // moving a wall: the roof follows
    const W2 = await walls();
    const north = W2.find((w) => w.a[1] === 6000 && w.b[1] === 6000);
    await page.click('[data-mtool="select"]');
    await planClick((north.a[0] + north.b[0]) / 2, 6000);
    const [gx, gy] = await at((north.a[0] + north.b[0]) / 2, 6000), [hx, hy] = await at((north.a[0] + north.b[0]) / 2, 7000);
    await page.mouse.move(gx, gy); await page.mouse.down(); await page.mouse.move(hx, hy, { steps: 6 }); await page.mouse.up();
    await settled();
    const area1 = await page.evaluate(() => window.bimcraftPlan.view.scene.rooms[0].label[1]);
    ok(/Kitchen/.test((await derived()).spaces.join()) && (await derived()).roofs[0].parts === 6, 'the north wall dragged out 1000: the room keeps its name and grows (' + area1 + '), the roof is made again over it');
    await shot(page, 'bm6-02-moved');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-save]')]);
    const text = fs.readFileSync(await dl.path(), 'utf8');
    ok(/IFCROOF\(/.test(text) && /IFCSPACE\([^;]*'Kitchen'/.test(text) && /\.FLOOR\.\)/.test(text) && /\.CEILING\.\)/.test(text), 'Save as IFC: the roof, the room "Kitchen", the floor and the ceiling');
  }

  if (want('bm7') && want('bm4')) {
    console.log('== bm7: schedules, dimensions, print');
    await page.keyboard.press('Escape');
    await page.click('[data-mtool="select"]');
    const dimsOn = await page.evaluate(() => (window.bimcraftPlan.view.scene.dims || []).length);
    ok(dimsOn > 4, 'dimensions on the plan: ' + dimsOn + ' (each wall\'s length, the doors and the window to the corners)');
    await page.click('[data-model-dims]');
    ok((await page.evaluate(() => (window.bimcraftPlan.view.scene.dims || []).length)) === 0 && await page.getAttribute('[data-model-dims]', 'aria-pressed') === 'false', 'the Dimensions button hides them');
    await page.click('[data-model-dims]');
    ok(await page.isVisible('[data-msched-sec]'), 'Schedules in the left panel while Draw is on');
    const doorRows = await page.$$eval('[data-msched] tbody tr', (r) => r.map((x) => x.textContent));
    ok(doorRows.length === 2 && /^D1/.test(doorRows[0]), 'Doors: ' + doorRows.length + ' rows, D1 first');
    await page.click('[data-msched] tbody tr >> nth=0');
    ok((await page.evaluate(() => [...document.querySelector('[data-canvas]').viewer.selection])).length === 1, 'a row picks its door');
    await page.selectOption('[data-msched-kind]', 'rooms');
    ok(/Kitchen/.test(await page.textContent('[data-msched]')), 'Rooms: the kitchen with its area');
    const [csv] = await Promise.all([page.waitForEvent('download'), page.click('[data-msched-csv]')]);
    ok(/rooms\.csv$/.test(csv.suggestedFilename()) && /Kitchen/.test(fs.readFileSync(await csv.path(), 'utf8')), 'Download CSV: ' + csv.suggestedFilename());
    const [pdf] = await Promise.all([page.waitForEvent('download'), page.click('[data-model-print]')]);
    const bytes = fs.readFileSync(await pdf.path());
    ok(bytes.slice(0, 8).toString() === '%PDF-1.4' && /\.pdf$/.test(pdf.suggestedFilename()) && /Saved the plan as a PDF at/.test(await statusOf()), 'Print: ' + pdf.suggestedFilename() + ' — "' + await statusOf() + '"');
    try { const txt = execFileSync('pdftotext', ['-layout', await pdf.path(), '-'], { encoding: 'utf8' }); ok(/Plan of Ground floor/.test(txt) && /Kitchen/.test(txt), 'the PDF has the plan\'s title and the room as text'); } catch (e) { console.log('  --   pdftotext not installed'); }
  }

  if (want('bm9')) {
    console.log('== bm9: sections square to a building turned 30° in its site');
    const turned = path.join(REPO, 'tmp/bimcraft-rotated.ifc');
    execFileSync('node', [path.join(REPO, 'bin/test-bimcraft.mjs'), '--rotated', '--keep'], { stdio: 'ignore' });
    page.once('dialog', (d) => d.accept());
    await page.setInputFiles('[data-file]', turned);
    const keep = await page.waitForSelector('dialog[open] button[value="discard"]', { timeout: 4000 }).catch(() => null);
    if (keep) await keep.click();
    await waitStatus(/^Opened /, 120000);
    await page.click('[data-toolbar] [data-toggle="section"]');
    await page.click('[data-sec-axis="front"]');
    ok(await page.isVisible('[data-sec-turn]'), 'the section bar offers "Square to the building" (its walls run at 30°)');
    const along = (n) => Math.abs(n.x * Math.cos(Math.PI / 6) - n.z * Math.sin(Math.PI / 6));   // the wall's direction in the viewer: (cos 30°, −sin 30°) in x, z
    const normal = () => page.evaluate(() => { const n = document.querySelector('[data-canvas]').viewer.section.plane.normal; return { x: n.x, y: n.y, z: n.z }; });
    ok(along(await normal()) > 0.4, 'off: the Front plane cuts the wall at an angle (it runs along the model\'s axes)');
    await page.click('[data-sec-turn]');
    ok(along(await normal()) < 1e-6 && await page.getAttribute('[data-sec-turn]', 'aria-pressed') === 'true' && /turned 30°/.test(await statusOf()), 'on: the Front plane runs square to the wall — "' + await statusOf() + '"');
    await page.click('[data-sec-axis="box"]');
    const size = await page.evaluate(() => document.querySelector('[data-canvas]').viewer.sizeIfc());
    ok(Math.abs(size[0] - 6) < 0.01 && Math.abs(size[1] - 0.2) < 0.06, 'the section box fits the building in its own axes: ' + size.map((v) => v.toFixed(2)).join(' × ') + ' m (the 6 m wall, 200 thick)');
    await shot(page, 'bm9-01-box');
    await page.click('[data-sec-turn]');
    const size0 = await page.evaluate(() => document.querySelector('[data-canvas]').viewer.sizeIfc());
    ok(size0[0] > 5.1 && size0[1] > 2.9, 'off again: the box along the model\'s axes (' + size0.map((v) => v.toFixed(2)).join(' × ') + ')');
    await page.click('[data-sec-off]');
  }

  const SAMPLE = path.join(REPO, '..', 'testfiles/samples/AC20-FZK-Haus.ifc');
  if (want('bm2') && fs.existsSync(SAMPLE)) {
    console.log('== bm2: the plan of a model from elsewhere (public sample AC20-FZK-Haus)');
    // the drawn building is unsaved: leaving it asks; keep going without saving
    page.once('dialog', (d) => d.accept());
    await page.setInputFiles('[data-file]', SAMPLE);
    const keep = await page.waitForSelector('dialog[open] button[value="discard"], dialog[open] [data-discard]', { timeout: 4000 }).catch(() => null);
    if (keep) await keep.click();
    await waitStatus(/^Opened /, 120000);
    ok(await page.getAttribute('[data-model-toggle]', 'aria-pressed') === 'false', 'another file opens with Draw off');
    await page.click('[data-model-toggle]');
    await page.waitForSelector('[data-plan-wrap]:not([hidden])');
    await settled();
    const sc = await page.evaluate(() => { const s = window.bimcraftPlan.view.scene; return { cut: s.cut.length, loops: s.cut.reduce((n, c) => n + (c.loops?.length || 0), 0), below: s.below.length, walls: s.walls.length }; });
    ok(sc.cut > 10 && sc.loops > 10 && sc.walls === 0, 'its ground floor cut at 1200 mm from the meshes: ' + sc.cut + ' elements, ' + sc.loops + ' closed outlines, ' + sc.below + ' below the cut; no drawn walls');
    const lvls = await page.$$eval('[data-model-level] option', (o) => o.map((x) => x.textContent));
    ok(lvls.length >= 2, 'its levels: ' + lvls.join(', '));
    await shot(page, 'bm2-02-sample');
    // pick something in the plan: the middle of the first cut outline
    const hitKey = await page.evaluate(() => { const pv = window.bimcraftPlan.view, c = pv.scene.cut.find((x) => x.loops?.length); const l = c.loops[0]; let x = 0, y = 0; for (let i = 0; i < l.length; i += 2) { x += l[i]; y += l[i + 1]; } return { key: c.key, p: [l[0] + (l[2] - l[0]) / 2, l[1] + (l[3] - l[1]) / 2] }; });
    ok(hitKey && typeof hitKey.key === 'number', 'a cut element has a key the 3D view knows');
  }
  ok(!problems.length, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 5).join(' | ') : ''));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  await shot(page, 'zz-error');
  if (problems.length) console.log('  console: ' + problems.slice(0, 8).join('\n  '));
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimmodel']);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

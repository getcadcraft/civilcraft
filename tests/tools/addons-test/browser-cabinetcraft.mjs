#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-cabinetcraft.mjs — the CabinetCraft add-on in /lab/partcraft (0.8 DC.117; session cabinetcraft_addon). Run as root: a signed-in session
 * is minted in-process by tools/addons-test/admin.php and root's Playwright Chromium is used (the same set-up as browser-pid.mjs).
 *
 *   node tools/addons-test/browser-cabinetcraft.mjs [--shots dir]     (shots default: tmp/shots/cabinetcraft)
 *
 * Bundled and off, switched on; its tab in the right panel; the example kitchen; a cabinet added; Checks; Cost with its placeholder banner; the
 * drawings; the nest, a G-code file and the downloads; no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/cabinetcraft'));
fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString());

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const SESSION = admin('session');
const [cname, cvalue] = SESSION.cookie.split('=');
await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const problems = [];
const page = await ctx.newPage();
const workers = [];
page.on('worker', (w) => workers.push(w.url()));
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));



const shot = async (name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
// a number box keeps its value when it loses focus: fill, then Tab (the panel redraws after each change)
const setf = async (sel, v) => { await page.fill(sel, String(v)); await page.press(sel, 'Tab'); };
const tab = (v) => page.click('[data-cc-view="' + v + '"]');
const pane = '[data-cabinetcraft]';
try {
  await page.goto(BASE + '/lab/partcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:partcraft:cabinetcraft:')) localStorage.removeItem(k); const k = 'cc-addons:partcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.cabinetcraft; localStorage.setItem(k, JSON.stringify(s)); });
  await page.goto(BASE + '/lab/partcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.ccAddons && !!window.partcraft, null, { timeout: 30000 });
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'cabinetcraft' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
  let me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'cabinetcraft'));
  ok(me && me.state === 'off' && me.source === 'bundled', 'CabinetCraft is bundled and starts off', JSON.stringify(me && { state: me.state, source: me.source, reason: me.reason, detail: me.detail }));
  ok(me && me.version === '0.8.3' && me.manifest.api === '1.1', 'version 0.8.3, add-on API 1.1');
  ok(await page.evaluate(() => window.partcraft.host !== undefined && !!document.querySelector('[data-partcraft]')), 'the real PartCraft page is up (host, viewport)');
  // Settings › Add-ons: the row and its switch, used for real
  await page.click('[data-settings-open]');
  if (await page.isVisible('[data-settings-tab="general"]')) await page.click('[data-settings-tab="general"]');
  const rowSel = '[data-addons-set] li[data-addon="cabinetcraft"]';
  const nav = page.locator('.shell-sec-nav button', { hasText: /^\s*Add-ons\s*$/ });   // the 0.7 Settings list on the left, when the dialog has it
  if (await nav.count()) await nav.first().click();
  await page.waitForSelector(rowSel, { state: 'visible', timeout: 10000 });
  ok(/CabinetCraft/.test(await page.textContent(rowSel)) && /0\.8\.3/.test(await page.textContent(rowSel)), 'Settings › Add-ons lists CabinetCraft 0.8.3');
  ok(!(await page.isChecked('[data-addon-toggle="cabinetcraft"]')), 'its switch is off');
  await shot('cabinetcraft-00-settings');
  await page.click('[data-addon-toggle="cabinetcraft"]');
  await page.waitForFunction(() => window.ccAddons.list().find((a) => a.id === 'cabinetcraft')?.state === 'active', null, { timeout: 15000 });
  ok(await page.isChecked('[data-addon-toggle="cabinetcraft"]'), 'the switch turned it on (state active)');
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.querySelector('[data-settings-close]')?.click());
  const tabBtn = await page.$('.pc-tabs [data-addon="cabinetcraft"]');
  ok(!!tabBtn, 'a CabinetCraft tab is in the right panel strip');
  await tabBtn.click();
  await page.waitForSelector(pane, { timeout: 10000 });
  ok(await page.isVisible(pane), 'its panel is shown');
  await shot('cabinetcraft-01-empty');

  // ---- the ten-step path: an L-shaped kitchen with an island, a window and a door
  const job = () => page.evaluate(() => JSON.parse(localStorage.getItem('cc-addon:partcraft:cabinetcraft:job')));
  // 1 Job › New (a clean job), Room › L-shaped
  await tab('job'); await page.click('[data-cc-new]');
  await tab('room');
  await page.selectOption('[data-cc-shape]', 'L');
  await setf('[data-cc-room="w"]', '4800'); await setf('[data-cc-room="d"]', '3600');
  await setf('[data-cc-notch="w"]', '1800'); await setf('[data-cc-notch="d"]', '1500');
  let j = await job();
  ok(j.room.shape === 'L' && j.room.w === 4800 && j.room.notch.w === 1800, 'step 1: an L-shaped room 4800 × 3600 with a 1800 × 1500 notch at the north-east');
  ok((await page.$$('[data-cc-wall]')).length === 6, 'six walls listed');
  await shot('cabinetcraft-02-room');
  // 2 pick a free outline on the plan with real clicks, then back to the L
  await page.selectOption('[data-cc-shape]', 'rect');
  // real mouse clicks on the plan: the drawing's own scale is read each time (the panel redraws after every click)
  const clickAt = async (x, y) => {
    await page.locator('[data-cc-pickplan]').scrollIntoViewIfNeeded();
    const m = await page.evaluate(() => { const s = document.querySelector('[data-cc-pickplan]'); const c = s.getScreenCTM(); return { a: c.a, d: c.d, e: c.e, f: c.f }; });
    await page.mouse.click(m.a * x + m.e, m.d * -y + m.f);
  };
  for (const [x, y] of [[0, 0], [3000, 0], [3000, 2000], [1500, 2000], [1500, 3000], [0, 3000]]) await clickAt(x, y);
  ok(await page.getAttribute('[data-cc-pick-count]', 'data-cc-pick-count') === '6', 'step 2: six corners clicked on the real plan');
  await page.click('[data-cc-pick-close]');
  j = await job();
  ok(j.room.shape === 'free' && j.room.pts.length === 6 && j.room.w === 3000, 'Close outline: the picked outline is the room (a free outline, 6 corners, 3000 wide)');
  await shot('cabinetcraft-03-picked');
  await page.selectOption('[data-cc-shape]', 'L');
  await setf('[data-cc-room="w"]', '4800'); await setf('[data-cc-room="d"]', '3600');
  await setf('[data-cc-notch="w"]', '1800'); await setf('[data-cc-notch="d"]', '1500');
  // 3 a window and a door
  await page.click('[data-cc-add-window]'); await page.click('[data-cc-add-door]');
  await setf('[data-cc-opening="W1"] [data-cc-op="at"]', '1200');
  await setf('[data-cc-opening="D1"] [data-cc-op="at"]', '300');
  j = await job();
  ok(j.openings.length === 2 && j.openings[0].at === 1200 && j.openings[1].at === 300, 'step 3: a window and a door on the first wall');
  // 4 runs: south wall run with a corner cabinet at the south-east end and the east wall after it
  await tab('layout');
  const addCab = async (tpl, w, row = 'base') => { await page.selectOption('[data-cc-tpl="' + row + '"]', tpl); await page.fill('[data-cc-addw="' + row + '"]', String(w)); await page.click('[data-cc-add="' + row + '"]'); };
  await page.click('[data-cc-addrun]');
  await addCab('base-door', 600); await addCab('base-sink', 900); await addCab('base-drawers3', 600); await addCab('base-pair', 900); await addCab('base-corner-l', 900);
  j = await job();
  ok(j.runs[0].base.length === 5 && j.runs[0].base[4].tpl === 'base-corner-l', 'step 4: the first run along the south wall, ending in an L-shaped corner cabinet');
  await page.click('[data-cc-addrun]');
  await page.selectOption('[data-cc-run-wall]', 'P2');
  await addCab('base-drawers3', 600); await addCab('base-door', 600);
  await shot('cabinetcraft-04-layout');
  // 5 an island
  await tab('room'); await page.click('[data-cc-add-island]');
  await setf('[data-cc-island="I1"] [data-cc-isl="x"]', '900'); await setf('[data-cc-island="I1"] [data-cc-isl="y"]', '1800'); await setf('[data-cc-island="I1"] [data-cc-isl="len"]', '2000'); await setf('[data-cc-island="I1"] [data-cc-isl="seat"]', '300');
  await page.click('[data-cc-island-edit="I1"]');
  await addCab('base-drawers3', 600); await addCab('base-pair', 900); await addCab('base-door', 450);
  j = await job();
  ok(j.islands.length === 1 && j.islands[0].base.length === 3 && j.islands[0].seat === 300, 'step 5: an island 2000 long with three cabinets and a 300 mm seating overhang', JSON.stringify(j.islands));
  // wall cabinets on the south run (the window is above the base cabinets)
  await page.click('[data-cc-run="A"]');
  await addCab('wall-door', 600, 'upper'); await addCab('wall-pair', 800, 'upper');
  // 6 Checks
  await tab('checks');
  const probs = await page.$$eval('[data-cc-problem]', (n) => n.map((x) => x.getAttribute('data-cc-problem')));
  ok(probs.length >= 1, 'step 6: Checks lists what to look at: ' + [...new Set(probs)].join(', '));
  await shot('cabinetcraft-05-checks');
  // 7 cost with the shop's own rates
  await tab('cost');
  ok(/PLACEHOLDER/.test(await page.textContent('[data-cc-placeholder]')), 'step 7: Cost says every rate is a placeholder');
  const rates = path.join(SHOTS, 'my-rates.csv');
  fs.writeFileSync(rates, 'path,value\nlabour.perHour,62\nmarkup,0.3\nsheet.melamine-18,51\ncurrency,CAD\n');
  const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 10000 }), page.click('[data-cc-rates-import]')]);
  await chooser.setFiles(rates);
  await page.waitForFunction(() => /rates imported/.test(document.querySelector('[data-cc-rates-result]')?.textContent || ''), null, { timeout: 10000 });
  j = await job();
  ok(j.rates.labour.perHour === 62 && j.rates.currency === 'CAD' && /lines still use a placeholder/.test(await page.textContent('[data-cc-placeholder]')), 'the shop\'s own rates are imported and saved with the job; the others stay placeholders');
  await shot('cabinetcraft-06-cost');
  // 8 drawings: plan, elevation, 3D
  await tab('drawings');
  ok((await page.innerHTML('[data-cc-drawing]')).startsWith('<svg') && (await page.innerHTML('[data-cc-drawing]')).includes('<polygon'), 'step 8: the plan of the L room is drawn');
  await shot('cabinetcraft-07-plan');
  await page.selectOption('[data-cc-draw-pick]', 'iso');
  ok((await page.innerHTML('[data-cc-drawing]')).includes('<polygon'), 'the SVG 3D drawing still works');
  await page.selectOption('[data-cc-draw-pick]', 'elev-A');
  ok((await page.innerHTML('[data-cc-drawing]')).includes('stroke-dasharray'), 'the elevation shows the window');
  await page.selectOption('[data-cc-draw-pick]', 'plan');
  // 9 3D in the viewport: real scene objects
  const sceneBodies = () => page.evaluate(() => { const v = window.partcraft.view; const out = []; for (const [k, o] of v.overlays) if (k.startsWith('addon-bodies:')) { let tri = 0, lines = 0; o.traverse((c) => { if (c.isMesh) tri += c.geometry.getAttribute('position').count / 3; if (c.isLineSegments) lines++; }); out.push({ key: k, bodies: o.userData.addonBodies, tri, lines }); } return out; });
  ok((await sceneBodies()).length === 0, 'before: no CabinetCraft bodies in the viewport scene');
  const hist0 = await page.evaluate(() => window.partcraft.hist.undoStack.length);
  await page.click('[data-cc-3d-place]');
  await page.waitForFunction(() => [...window.partcraft.view.overlays.keys()].some((k) => k.startsWith('addon-bodies:')), null, { timeout: 15000 });
  let sb = await sceneBodies();
  ok(sb.length === 1 && sb[0].key === 'addon-bodies:cabinetcraft:kitchen' && sb[0].bodies > 100 && sb[0].tri > 1000 && sb[0].lines === 1, 'step 9: the cabinets are real bodies in the viewport scene: ' + JSON.stringify(sb));
  const st = await page.evaluate(() => ({ undo: window.partcraft.hist.undoStack.length, last: window.partcraft.hist.undoStack.at(-1).label, bodies: window.partcraft.part.addonBodies.cabinetcraft.kitchen.bodies.length, ex: window.partcraft.view.extraBox && window.partcraft.view.extraBox.max.toArray() }));
  ok(st.undo === hist0 + 1 && /CabinetCraft/.test(st.last), 'one undo step: "' + st.last + '"');
  ok(st.ex && st.ex[1] > 2000 && st.ex[0] > 4000, 'the view knows the bodies\' extent (the camera frames them)', JSON.stringify(st.ex));
  await page.waitForTimeout(400);
  await shot('cabinetcraft-08-viewport');
  const canvasInk = await page.evaluate(() => { const c = document.querySelector('[data-gl]'); const g = document.createElement('canvas'); g.width = 200; g.height = 120; const x = g.getContext('2d'); x.drawImage(c, 0, 0, 200, 120); const d = x.getImageData(0, 0, 200, 120).data; const bg = [d[0], d[1], d[2]]; let diff = 0; for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]) > 40) diff++; return diff; });
  ok(canvasInk > 800, 'the viewport canvas shows something other than its background (' + canvasInk + ' pixels)');
  // undo and redo are the app's own
  await page.evaluate(() => window.partcraft.undoRedo(true));
  await page.waitForTimeout(200);
  ok((await sceneBodies()).length === 0, 'Undo takes the bodies out of the viewport');
  await page.evaluate(() => window.partcraft.undoRedo(false));
  await page.waitForTimeout(200);
  ok((await sceneBodies()).length === 1, 'Redo brings them back');
  // replace, then remove
  await tab('drawings');
  await page.click('[data-cc-3d-place]');
  await page.waitForTimeout(200);
  sb = await sceneBodies();
  ok(sb.length === 1, 'placing again replaces the group (still one)');
  await page.click('[data-cc-3d-remove]');
  await page.waitForTimeout(200);
  ok((await sceneBodies()).length === 0 && !(await page.evaluate(() => window.partcraft.part.addonBodies)), 'Remove from viewport: gone from the scene and the part');
  await page.click('[data-cc-3d-place]'); await page.waitForTimeout(300);
  // the part file keeps them
  const saved = await page.evaluate(() => window.partcraft.P.toJSON(window.partcraft.part));
  ok(JSON.parse(saved).addonBodies.cabinetcraft.kitchen.bodies.length > 100, 'the saved part carries the bodies (' + Math.round(saved.length / 1024) + ' KB)');
  // 10 the nest off the page's thread
  await tab('export');
  await page.evaluate(() => { window.__ticks = []; window.__t0 = performance.now(); clearInterval(window.__iv); window.__iv = setInterval(() => window.__ticks.push(performance.now()), 25); });
  await page.click('[data-cc-nest]');
  ok(await page.isVisible('[data-cc-progress]'), 'step 10: the nest shows a progress bar');
  await page.waitForSelector('[data-cc-nested]', { timeout: 120000 });
  const live = await page.evaluate(() => { clearInterval(window.__iv); const t = window.__ticks; let gap = 0; for (let i = 1; i < t.length; i++) gap = Math.max(gap, t[i] - t[i - 1]); return { ticks: t.length, maxGap: Math.round(gap), total: Math.round(performance.now() - window.__t0) }; });
  ok(live.total > 1500 && live.maxGap < 700 && live.ticks > 20, 'the page stayed alive while the nest ran: ' + live.ticks + ' timer ticks in ' + live.total + ' ms, longest gap ' + live.maxGap + ' ms');
  ok(/sheets; 0 parts did not fit/.test(await page.textContent('[data-cc-nested]')), 'the nest ran and every part fits');
  ok(workers.some((u) => u.startsWith('blob:')), 'the nest ran in a real Web Worker made from the add-on\'s modules (blob: worker seen by the browser): ' + workers.filter((u) => u.startsWith('blob:')).length);
  await shot('cabinetcraft-09-export');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('[data-cc-exp="cutlist"]')]);
  const f = path.join(SHOTS, dl.suggestedFilename());
  await dl.saveAs(f);
  ok(/^Part,Name,Cabinet/.test(fs.readFileSync(f, 'utf8')), 'the cut list CSV downloads');
  const [dx] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('[data-cc-exp="drillxml"]')]);
  const xf = path.join(SHOTS, dx.suggestedFilename());
  await dx.saveAs(xf);
  const xmlOk = await page.evaluate((txt) => { const d = new DOMParser().parseFromString(txt, 'application/xml'); return { err: !!d.querySelector('parsererror'), panels: d.querySelectorAll('panel').length, holes: d.querySelectorAll('hole').length, root: d.documentElement.nodeName }; }, fs.readFileSync(xf, 'utf8'));
  ok(!xmlOk.err && xmlOk.root === 'cabinetcraft-holes' && xmlOk.panels > 10 && xmlOk.holes > 100, 'the generic hole list is well-formed XML: ' + JSON.stringify(xmlOk));
  await page.click('[data-cc-gcode]');
  await page.waitForSelector('[data-cc-gfile]', { timeout: 90000 });
  const nfiles = (await page.$$('[data-cc-gfile]')).length;
  ok(nfiles > 3, 'G-code files listed: ' + nfiles);
  const [gl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('[data-cc-gfile]')]);
  const gf = path.join(SHOTS, gl.suggestedFilename());
  await gl.saveAs(gf);
  ok(fs.readFileSync(gf, 'utf8').length > 200, 'a G-code program downloads');
  // ---- 0.8.2: the dry run on the real programs, the two printable sheets
  await setf('[data-cc-rapid]', 6000);
  await page.click('[data-cc-dry-run]');
  await page.waitForSelector('[data-cc-dry-file]', { timeout: 30000 });
  const dry = await page.evaluate(() => [...document.querySelectorAll('[data-cc-dry-file]')].map((n) => ({ ok: n.getAttribute('data-cc-dry-ok'), text: n.textContent })));
  ok(dry.length > 3 && dry.every((d) => d.ok === '1') && /minutes in all/.test(dry[0].text) && /Reaches X 0 to/.test(dry[0].text), 'dry run: ' + dry.length + ' programs read, all without errors; ' + dry[0].text.slice(0, 150));
  ok((await page.getAttribute('[data-cc-holes-ok]', 'data-cc-holes-ok')) === '1', 'the hole list: every hole inside its panel');
  await shot('cabinetcraft-09b-dryrun');
  const [rc] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('[data-cc-exp="runcheck"]')]);
  const rcf = path.join(SHOTS, rc.suggestedFilename()); await rc.saveAs(rcf);
  const rct = fs.readFileSync(rcf, 'utf8');
  ok(/No run has been made yet/.test(rct) && (rct.match(/class="box"/g) || []).length === 15, 'the first-run checklist downloads: it says no run has been made, fifteen empty boxes');
  const [rv] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('[data-cc-exp="review"]')]);
  const rvf = path.join(SHOTS, rv.suggestedFilename()); await rv.saveAs(rvf);
  ok(/Maker.{1,6}s review sheet/.test(fs.readFileSync(rvf, 'utf8')), 'the maker\'s review sheet downloads');
  // the print view of the checklist, once, as an image
  const pp = await ctx.newPage(); await pp.setContent(rct); await pp.screenshot({ path: path.join(SHOTS, 'cabinetcraft-09c-checklist.png'), fullPage: true }); await pp.close();

  // ---- 0.8.2: the bay-window kitchen: an angled wall, a curved wall, a curved-front cabinet, a diagonal corner cabinet, opened as a job file
  const { BAY_JOB } = await import(pathToFileURL(path.join(ROOT, 'tools/addons-test/cabinetcraft-bay-job.mjs')).href);
  await tab('job');
  const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-cc-open]')]);
  await fc.setFiles({ name: 'bay.cabinetcraft.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(BAY_JOB)) });
  await tab('room');
  await page.waitForFunction(() => document.querySelectorAll('[data-cc-wall]').length === 6, null, { timeout: 10000 });
  const wallsText = await page.evaluate(() => [...document.querySelectorAll('[data-cc-wall]')].map((n) => n.textContent));
  ok(/direction 135/.test(wallsText[2]) && /corner turns 45/.test(wallsText[2]) && /arc, radius 2124/.test(wallsText[3]), 'Room: the slanted wall (direction 135, corner turns 45) and the curved wall (arc, radius 2124.4): ' + wallsText[3]);
  await shot('cabinetcraft-10-bay-room');
  // typed walls: the same bay room, from text
  await tab('job'); await page.click('[data-cc-new]'); await tab('room');
  await page.click('[data-cc-seg-example]'); await page.click('[data-cc-seg-apply]');
  j = await job();
  ok(j.room.shape === 'free' && j.room.pts.length === 6, 'typed walls (length and angle) make a free outline with slanted walls');
  // pick at any angle with an arc, on the real plan
  await tab('job'); await page.click('[data-cc-new]'); await tab('room');
  await page.check('[data-cc-pick-any]');
  for (const [x, y] of [[0, 0], [4000, 0], [4000, 1500]]) await clickAt(x, y);
  await page.check('[data-cc-pick-arc]');
  await clickAt(2000, 2600); await clickAt(0, 1500);
  ok(await page.getAttribute('[data-cc-pick-count]', 'data-cc-pick-count') === '4', 'real clicks: an arc is a point on it and its end');
  await page.uncheck('[data-cc-pick-arc]');
  await page.click('[data-cc-pick-close]');
  j = await job();
  ok(j.room.arcs && j.room.arcs.length === 1 && j.room.arcs[0].sweep > 0, 'closed: an arc wall bulging away from the room (' + JSON.stringify(j.room.arcs) + ')');
  // the bay kitchen again, then its checks, drawings and the viewport
  await tab('job');
  const [fc2] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-cc-open]')]);
  await fc2.setFiles({ name: 'bay.cabinetcraft.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(BAY_JOB)) });
  await tab('checks');
  const bprobs = await page.evaluate(() => [...document.querySelectorAll('[data-cc-problem]')].map((n) => ({ code: n.getAttribute('data-cc-problem'), cls: n.className })));
  ok(!bprobs.some((x) => /cc-error/.test(x.cls)) && bprobs.some((x) => x.code === 'corner.wedge') && bprobs.some((x) => x.code === 'curved.order') && bprobs.some((x) => x.code === 'arc.gap'), 'Checks: no errors; wedges, made to order and the curve\'s gaps are explained (' + bprobs.map((x) => x.code).join(' ') + ')');
  await shot('cabinetcraft-11-bay-checks');
  await tab('drawings');
  await page.selectOption('[data-cc-draw-pick]', 'plan');
  const planSvg = await page.evaluate(() => document.querySelector('[data-cc-drawing]').innerHTML);
  ok(planSvg.includes('<svg') && planSvg.length > 8000, 'the plan draws the bay room');
  await shot('cabinetcraft-12-bay-plan');
  await page.selectOption('[data-cc-draw-pick]', 'elev-C');
  await shot('cabinetcraft-13-bay-elevation-C');
  await page.selectOption('[data-cc-draw-pick]', 'iso');
  await shot('cabinetcraft-14-bay-iso');
  await page.click('[data-cc-3d-place]');
  await page.waitForFunction(() => Number(document.querySelector('[data-cc-3d-status]')?.getAttribute('data-cc-3d-status')) > 100, null, { timeout: 30000 });
  const n3 = Number(await page.getAttribute('[data-cc-3d-status]', 'data-cc-3d-status'));
  ok(n3 > 150, 'the bay kitchen is placed in the real viewport as ' + n3 + ' bodies');
  await shot('cabinetcraft-15-bay-viewport');
  // its drilling and the typed sizes
  await tab('export');
  await setf('[data-cc-hw="fastenDia"]', '8');
  j = await job();
  ok(j.hw && j.hw.fastenDia === 8, 'a typed fixing size is kept');
  await page.click('[data-cc-dry-run]');
  ok((await page.getAttribute('[data-cc-holes-ok]', 'data-cc-holes-ok')) === '1', 'the corner cabinet\'s holes are checked too');
  const [dd] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('[data-cc-exp="drill"]')]);
  const ddf = path.join(SHOTS, 'bay-' + dd.suggestedFilename()); await dd.saveAs(ddf);
  const dcsv = fs.readFileSync(ddf, 'utf8');
  ok(/,edge,dowel,/.test(dcsv) && /corner/.test(dcsv), 'the hole list CSV carries the corner cabinet\'s edge holes');
  // rates: the first-run prompt and the final-quote gate
  await tab('cost');
  ok(await page.isVisible('[data-cc-rates-prompt]') && /DRAFT/.test(await page.textContent('[data-cc-quote]')), 'Cost: the "type your shop\'s rates" prompt and the DRAFT label');
  await shot('cabinetcraft-16-rates-prompt');

  // the example kitchen too (the old path)
  await tab('job'); await page.click('[data-cc-sample]');
  await tab('layout');
  ok((await page.$$('[data-cc-items="base"] [data-cc-item]')).length === 5, 'the example kitchen still loads: five floor items in run A');
  await page.evaluate(() => window.ccAddons.loader.setEnabled('cabinetcraft', false));
  await page.waitForTimeout(400);
  ok(!(await page.$('.pc-tabs [data-addon="cabinetcraft"]')), 'switched off: the tab goes');
  ok((await sceneBodies()).length === 1, 'the bodies stay in the part (they belong to the part file, not to the panel)');
  const real = problems.filter((p) => !/favicon|ResizeObserver|net::ERR|404/.test(p));
  ok(real.length === 0, 'no console errors', real.slice(0, 3).join(' | '));
} catch (e) {
  fail++; console.log('  FAIL ' + e.message);
  await shot('cabinetcraft-error').catch(() => {});
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

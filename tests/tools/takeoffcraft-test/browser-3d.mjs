#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-3d.mjs — TakeoffCraft's 3D check view in headless Chromium (run as root: it uses
 * `sudo -u www-data php` for its own test admin takeoff3dtest+cadcraft@projectz.xyz, random password,
 * disabled again at the end, and root's cached Playwright Chromium).
 *
 *   node tools/takeoffcraft-test/browser-3d.mjs [--shots <dir>] [--verbose]
 *
 * plan-sheet takeoff by pointer (a wall run with a height, a slab with a depth, a circular plate with no
 * depth, a run with no height, three counts) → three.js is not loaded until 3D opens → 3D: object
 * kinds and the wall area / slab volume agree with the app's quantities, the sheet is on the ground,
 * orbit (middle drag), pan (right drag), zoom (wheel), standard views, perspective off, pick a post
 * and the wall (the app's own selection and panel), Shift+click adds, Esc clears, Delete + Ctrl+Z,
 * a height edited while in 3D, both themes (background pixels), an unscaled sheet refuses with the
 * reason (also when you switch to one), a drawing tool goes back to the sheet, the toolbar stays one
 * row at 1280 px; the view cube (only in 3D; Front → looks along +Y; Home) and Settings › Corner indicator (axis icon /
 * none, stored, kept over a reload). Screenshots (default tmp/shots/takeoffcraft): takeoffcraft-3d-paper.png,
 * takeoffcraft-3d-pick-paper.png, takeoffcraft-3d-model.png, takeoffcraft-3d-top-model.png,
 * takeoffcraft-3d-viewcube-front-paper.png, takeoffcraft-3d-axis-icon-paper.png.
 * Fails on any console error, page error or failed request. Prints "N passed, M failed".
 */
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const VERBOSE = args.includes('--verbose');
const SHOTS = path.resolve(opt('--shots', path.join(ROOT, 'tmp/shots/takeoffcraft')));
const PLAN = path.join(ROOT, 'fixtures/pdf/kitchen-plan-sheet.pdf');   // public fixture (0.4 item 0.7; facts in fixtures/facts.json)
const EMAIL = 'takeoff3dtest+cadcraft@projectz.xyz';

let pass = 0, fail = 0;
const ok = (cond, name, extra = '') => { if (cond) { pass++; if (VERBOSE) console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const near = (a, b, rel = 1e-9) => Math.abs(a - b) <= rel * Math.max(1, Math.abs(a), Math.abs(b));
console.log('\n3D check view in the browser: /lab/takeoffcraft');

const { chromium } = await import('playwright-core');
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const exe = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))
  .map((d) => path.join(cache, d, 'chrome-linux64/chrome')).find((p) => fs.existsSync(p));
const PDFLib = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
// a signed-in session minted in-process (tools/takeoffcraft-test/admin.php): the shared admin-login throttle is untouched
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/takeoffcraft-test/admin.php'), cmd, '3d'], { encoding: 'utf8' }));
const SESSION = admin('session');
fs.mkdirSync(SHOTS, { recursive: true });
const tmp = fs.mkdtempSync(path.join(ROOT, 'tmp/takeoff3d-'));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const issues = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') issues.push('console: ' + m.text()); });
  page.on('pageerror', (e) => issues.push('pageerror: ' + e.message));
  page.on('response', (r) => { if (r.status() >= 400) issues.push(r.status() + ' ' + r.url()); });
  const requested = [];
  page.on('request', (r) => requested.push(r.url()));
  await ctx.addCookies([{ name: SESSION.name, value: SESSION.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto('https://getcadcraft.com/lab/takeoffcraft?space=paper');
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 20000 });
  // an earlier page may have left an autosaved takeoff: the shell asks "Recover your work?" — not this test's subject
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  ok(true, 'signed in, app ready');
  const T = (fn, a) => page.evaluate(fn, a);
  const status = () => T(() => document.querySelector('[data-status]').textContent);
  const v3 = () => T(() => window.takeoffcraft.view3d());

  // the toolbar keeps its shape and stays one row with the new button
  const bar = await T(() => {
    const tb = document.querySelector('main > [role="toolbar"]');
    const groups = [...tb.querySelectorAll(':scope > [role="group"]')];
    const btn = document.querySelector('[data-act="view-3d"]');
    return { groups: groups.length, tops: [...new Set(groups.map((g) => Math.round(g.getBoundingClientRect().top)))].length,
      inBar: !!btn?.closest('[data-sheetbar]'), inToolbar: !!btn?.closest('[role="toolbar"]'), pressed: btn?.getAttribute('aria-pressed') };
  });
  ok(bar.groups === 6 && bar.tops === 1, 'the toolbar keeps its six groups in one row at 1280 px', JSON.stringify(bar));
  ok(bar.inBar && !bar.inToolbar && bar.pressed === 'false', '3D is a toggle on the page view (the sheet bar), not in the toolbar');

  // nothing open: no sheet bar, and the key refuses
  await page.keyboard.press('3');
  ok(/open a pdf/i.test(await status()) && (await T(() => document.querySelector('[data-sheetbar]').hidden)), '3D with no sheet says to open a PDF first');

  await page.setInputFiles('[data-file-pdf]', PLAN);
  await page.waitForFunction(() => window.takeoffcraft.sheets().length === 1 && window.takeoffcraft.rendered() > 0, null, { timeout: 30000 });
  // unscaled: refused with the reason
  await page.keyboard.press('3');
  ok(/no scale/i.test(await status()) && !(await v3()).open, 'an unscaled sheet refuses 3D, with the reason', await status());
  await page.selectOption('[data-scale-preset]', 'a1/4');
  await T(() => window.takeoffcraft.zoomTo({ minX: 880, minY: 1120, maxX: 1260, maxY: 1360 }));
  await page.waitForTimeout(400);

  const at = (x, y) => T(([x, y]) => window.takeoffcraft.toScreen({ x, y }), [x, y]);
  const click = async (x, y, o = {}) => { const p = await at(x, y); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.up(); if (o.dbl) { await page.mouse.down({ clickCount: 2 }); await page.mouse.up({ clickCount: 2 }); } };
  const addItem = async (name, type) => {
    await page.click('[data-item-new]');
    await page.fill('[data-item-form] [name="name"]', name);
    await page.selectOption('[data-item-form] [name="type"]', type);
    await page.click('[data-item-form] button[type="submit"]');
    await page.waitForTimeout(100);
  };
  const setHeight = async (text) => { await page.fill('#tc-i-height', text); await page.press('#tc-i-height', 'Enter'); await page.waitForTimeout(150); };

  await addItem('Walk-in panel', 'linear');
  await setHeight('9\'-0"');
  await page.click('[data-tool="linear"]');
  await click(924.48, 1151.28); await click(1226.76, 1151.28); await click(1226.76, 1334.28, { dbl: true });
  await page.waitForTimeout(150);
  await addItem('Freezer floor', 'area');
  await setHeight('4"');
  await page.click('[data-tool="area"]');
  await click(930.48, 1157.28); await click(1220.76, 1157.28); await click(1220.76, 1328.28); await click(930.48, 1328.28);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  await addItem('Drain pan', 'area');
  await page.click('[data-tool="circle"]');
  await click(1000, 1240); await click(1030, 1240);
  await page.waitForTimeout(150);
  await addItem('Base line', 'linear');
  await page.click('[data-tool="linear"]');
  await click(924.48, 1345); await click(1100, 1345, { dbl: true });
  await page.waitForTimeout(150);
  await addItem('Shelving units', 'count');
  await page.click('[data-tool="count"]');
  for (const [x, y] of [[960, 1300], [1050, 1300], [1150, 1300]]) await click(x, y);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const st = await T(() => ({ marks: window.takeoffcraft.model.state.marks.length, items: window.takeoffcraft.model.state.items.map((i) => [i.name, i.heightFt]) }));
  ok(st.marks === 7, 'seven marks taken off by pointer', JSON.stringify(st));
  ok(st.items.find((i) => i[0] === 'Walk-in panel')[1] === 9 && Math.abs(st.items.find((i) => i[0] === 'Freezer floor')[1] - 1 / 3) < 1e-12, 'height 9\'-0" and depth 4" typed in the item editor');
  ok(!requested.some((u) => /three\.(module|core)\.js|view3d\.js|scene3d\.js/.test(u)), 'three.js and the 3D modules are not loaded before 3D opens');

  // open 3D
  await page.click('[data-act="view-3d"]');
  await page.waitForFunction(() => { const s = window.takeoffcraft.view3d(); return s.open && s.ground && s.frames > 0; }, null, { timeout: 30000 });
  await page.waitForTimeout(300);
  ok(requested.some((u) => /\/assets\/vendor\/three\/[^/]+\/three\.module\.js/.test(u)) && requested.some((u) => /takeoffcraft\/dev\/view3d\.js/.test(u)), 'opening 3D loads three.js (import map) and view3d.js');
  ok(await T(() => document.querySelector('[data-act="view-3d"]').getAttribute('aria-pressed') === 'true' && !document.querySelector('[data-3d]').hidden), 'the 3D button is pressed and the 3D view shows');
  let s = await v3();
  const kinds = s.objects.map((o) => o.kind).sort().join(',');
  ok(kinds === 'marker,marker,marker,plate,run,slab,wall', 'a wall, a slab, a plate, a flat run and three posts', kinds);
  ok(s.ground, 'the sheet is rendered onto the ground');
  const q = await T(() => window.takeoffcraft.quantities());
  const qOf = (n) => q.find((r) => r.name === n).qty;
  const wall = s.objects.find((o) => o.kind === 'wall'), slab = s.objects.find((o) => o.kind === 'slab'), plate = s.objects.find((o) => o.kind === 'plate');
  ok(near(wall.measure.lengthFt, qOf('Walk-in panel')) && near(wall.measure.wallSqft, qOf('Walk-in panel') * 9), `wall area = L × H = ${wall.measure.wallSqft.toFixed(3)} SF (the app's L ${qOf('Walk-in panel').toFixed(3)} × 9)`);
  ok(near(slab.measure.netSqft, qOf('Freezer floor')) && near(slab.measure.volumeCuft, qOf('Freezer floor') / 3), `slab volume = area × depth = ${slab.measure.volumeCuft.toFixed(3)} CF`);
  ok(near(plate.measure.netSqft, qOf('Drain pan')) && plate.measure.volumeCuft === null && near(plate.measure.netSqft, Math.PI * (30 / 18) ** 2, 0.02), 'the circle with no depth is a plate of the exact circle area');
  const note = await T(() => document.querySelector('[data-3d-note]').innerText);
  ok(/1 wall, 1 slab, 1 plate, 1 flat run, 3 counts/.test(note) && /one sheet at a time/i.test(note) && /no height/.test(note) && /2" plate/.test(note), 'the note lists what is shown, says one sheet at a time, and names the run with no height and the plate', note);
  await page.screenshot({ path: path.join(SHOTS, 'takeoffcraft-3d-paper.png') });

  // orbit (middle drag), pan (right drag), zoom (wheel)
  const box = await T(() => { const r = document.querySelector('.tc-3d-canvas').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const cx = box.x + box.w * 0.55, cy = box.y + box.h * 0.45;
  const dist = (a) => Math.hypot(a.eye[0] - a.target[0], a.eye[1] - a.target[1], a.eye[2] - a.target[2]);
  let a0 = await v3();
  await page.mouse.move(cx, cy); await page.mouse.down({ button: 'middle' }); await page.mouse.move(cx + 120, cy + 40, { steps: 6 }); await page.mouse.up({ button: 'middle' });
  let a1 = await v3();
  ok(a1.target.every((v, i) => near(v, a0.target[i])) && a1.eye.some((v, i) => Math.abs(v - a0.eye[i]) > 1) && near(dist(a1), dist(a0), 1e-6), 'middle-drag orbits about the target (same distance)');
  await page.mouse.move(cx, cy); await page.mouse.down({ button: 'right' }); await page.mouse.move(cx - 80, cy + 30, { steps: 5 }); await page.mouse.up({ button: 'right' });
  const a2 = await v3();
  ok(a2.target.some((v, i) => Math.abs(v - a1.target[i]) > 0.5) && near(dist(a2), dist(a1), 1e-6), 'right-drag pans');
  await page.mouse.move(cx, cy); await page.mouse.wheel(0, -300); await page.waitForTimeout(150);
  const a3 = await v3();
  ok(dist(a3) < dist(a2) * 0.9, 'the wheel zooms in');
  ok((await T(() => window.takeoffcraft.model.state.marks.length)) === 7 && (await T(() => window.takeoffcraft.selection().length)) === 0, 'dragging the view adds nothing and selects nothing');
  await page.click('[data-3d-persp]');
  ok((await v3()).persp === false, 'Perspective off = parallel');
  await page.click('[data-3d-persp]');
  await page.click('[data-3d-view="iso"]');
  await page.waitForTimeout(150);

  // pick a post, then the wall: the app's own selection
  s = await v3();
  const post = s.objects.find((o) => o.kind === 'marker');
  await page.mouse.click(post.screen.x, post.screen.y);
  await page.waitForTimeout(150);
  let sel = await T(() => ({ ids: window.takeoffcraft.selection(), panel: !document.querySelector('[data-mark-sec]').hidden, three: window.takeoffcraft.view3d().selected }));
  ok(sel.ids.length === 1 && sel.ids[0] === post.id && sel.panel && sel.three.join() === post.id, 'clicking a post selects its count mark (panel shows it, highlighted in 3D)', JSON.stringify(sel));
  s = await v3();
  const w2 = s.objects.find((o) => o.kind === 'wall');
  await page.mouse.click(w2.screen.x, w2.screen.y);
  await page.waitForTimeout(150);
  sel = await T(() => window.takeoffcraft.selection());
  ok(sel.length === 1 && sel[0] === w2.id && /Walk-in panel/.test(await status()) && /9'-0"/.test(await status()), 'clicking the wall selects its run; the status gives length and height', await status());
  await page.screenshot({ path: path.join(SHOTS, 'takeoffcraft-3d-pick-paper.png') });
  await page.click('[data-3d-view="top"]');
  await page.waitForTimeout(150);
  s = await v3();
  const sl = s.objects.find((o) => o.kind === 'slab');
  await page.keyboard.down('Shift'); await page.mouse.click(sl.screen.x, sl.screen.y); await page.keyboard.up('Shift');
  await page.waitForTimeout(100);
  sel = await T(() => window.takeoffcraft.selection());
  ok(sel.length === 2 && sel.includes(sl.id) && sel.includes(w2.id), 'Shift+click adds the slab to the selection', JSON.stringify({ sel, sl: sl.id, at: sl.screen, top: await T(([x, y]) => document.elementFromPoint(x, y)?.className, [sl.screen.x, sl.screen.y]) }));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  ok((await T(() => window.takeoffcraft.selection().length)) === 0 && (await v3()).selected.length === 0, 'Esc selects none, in 3D too');
  // delete a post from 3D, undo
  await page.click('[data-3d-view="iso"]');
  await page.waitForTimeout(150);
  s = await v3();
  const p2 = s.objects.filter((o) => o.kind === 'marker')[1];
  await page.mouse.click(p2.screen.x, p2.screen.y);
  await page.keyboard.press('Delete');
  await page.waitForTimeout(150);
  ok((await v3()).objects.filter((o) => o.kind === 'marker').length === 2 && (await T(() => window.takeoffcraft.quantities().find((r) => r.name === 'Shelving units').qty)) === 2, 'Delete removes the picked count; 3D and quantities follow');
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(150);
  ok((await v3()).objects.filter((o) => o.kind === 'marker').length === 3, 'Ctrl+Z brings it back in 3D');
  // a height changed while in 3D
  s = await v3();
  await page.mouse.click(s.objects.find((o) => o.kind === 'wall').screen.x, s.objects.find((o) => o.kind === 'wall').screen.y);
  await page.waitForTimeout(100);
  await setHeight('12\'');
  s = await v3();
  ok(s.objects.find((o) => o.kind === 'wall').measure.heightFt === 12 && (await v3()).open, 'a height typed in the item editor rebuilds the wall at once (still in 3D)');

  // model theme
  const bg = () => T(() => {
    const src = document.querySelector('.tc-3d-canvas');
    const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
    const g = c.getContext('2d'); g.drawImage(src, 0, 0);
    const d = g.getImageData(4, Math.round(c.height / 2), 1, 1).data;
    return (d[0] + d[1] + d[2]) / 3;
  });
  const paperBg = await bg();
  await T(() => { document.documentElement.dataset.space = 'model'; });
  await page.waitForTimeout(400);
  const modelBg = await bg();
  ok(paperBg > 150 && modelBg < 110, `the 3D view re-themes: background ${paperBg.toFixed(0)} in paper, ${modelBg.toFixed(0)} in model`);
  await page.screenshot({ path: path.join(SHOTS, 'takeoffcraft-3d-model.png') });
  await page.click('[data-3d-view="top"]');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(SHOTS, 'takeoffcraft-3d-top-model.png') });
  await T(() => { document.documentElement.dataset.space = 'paper'; });
  await page.waitForTimeout(200);

  // the view cube (ModelCraft's viewcube.js copy): only in 3D, Front → camera direction, the corner setting
  const vc = () => T(() => { const c = document.querySelector('.cc-vc[data-viewcube]'); const a = document.querySelector('.cc-axes');
    return { inHost: !!c?.closest('[data-3d-host]'), cubeShown: !!c && !c.hidden && c.offsetParent !== null, axesShown: !!a && !a.hidden && a.offsetParent !== null, view: c?.dataset.vcView }; });
  await page.click('[data-3d-view="iso"]');
  await page.waitForTimeout(200);
  let cs = await vc();
  ok(cs.inHost && cs.cubeShown && !cs.axesShown, 'the view cube shows in the 3D view by default (axis icon hidden)', JSON.stringify(cs));
  const fbox = await page.locator('.cc-vc [data-vc-face="front"]').boundingBox();
  await page.mouse.move(fbox.x + fbox.width / 2, fbox.y + fbox.height / 2, { steps: 4 });
  await page.mouse.down(); await page.mouse.up();
  await page.waitForTimeout(700);
  const cd = await v3();
  const dv = [cd.target[0] - cd.eye[0], cd.target[1] - cd.eye[1], cd.target[2] - cd.eye[2]], dl = Math.hypot(...dv);
  ok(Math.abs(dv[0] / dl) < 0.01 && dv[1] / dl > 0.999 && Math.abs(dv[2] / dl) < 0.01 && (await vc()).view === 'front', 'clicking the cube\'s Front looks along +Y (from the south, Z up)', JSON.stringify(dv.map((v) => +(v / dl).toFixed(4))));
  await page.screenshot({ path: path.join(SHOTS, 'takeoffcraft-3d-viewcube-front-paper.png') });
  await page.click('.cc-vc [data-vc-home]');
  await page.waitForTimeout(600);
  await page.mouse.move(5, 300);
  const setCorner = async (v) => {
    await page.keyboard.press('Control+Comma');
    await page.waitForSelector('[data-app-settings][open]');
    await page.click('[data-settings-tab="app"]');
    await page.check(`input[name="tcCorner"][value="${v}"]`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
  };
  await setCorner('axes');
  cs = await vc();
  ok(!cs.cubeShown && cs.axesShown && (await v3()).corner === 'axes', 'Settings › Corner indicator › Axis icon: the cube goes, the X/Y/Z icon shows');
  ok((await T(() => JSON.parse(localStorage.getItem('takeoffcraft.settings') || '{}').corner)) === 'axes', 'stored in takeoffcraft.settings');
  await page.screenshot({ path: path.join(SHOTS, 'takeoffcraft-3d-axis-icon-paper.png') });
  await setCorner('none');
  cs = await vc();
  ok(!cs.cubeShown && !cs.axesShown, 'None: neither shows');
  await setCorner('axes');

  // a drawing tool goes back to the sheet; 3 comes back
  await page.keyboard.press('l');
  ok(!(await v3()).open && (await T(() => document.querySelector('[data-tool="linear"]').getAttribute('aria-pressed'))) === 'true', 'choosing Linear (L) goes back to the flat sheet');
  await page.keyboard.press('Escape');
  await page.keyboard.press('3');
  await page.waitForFunction(() => window.takeoffcraft.view3d().open, null, { timeout: 10000 });
  ok(true, '3 opens it again');

  // switching to an unscaled sheet closes 3D with the reason
  const gen = await PDFLib.PDFDocument.create();
  const pg = gen.addPage([612, 792]);
  pg.drawRectangle({ x: 150, y: 300, width: 300, height: 150, borderColor: PDFLib.rgb(0, 0, 0), borderWidth: 3 });
  const f = path.join(tmp, 'Unscaled sheet.pdf');
  fs.writeFileSync(f, await gen.save());
  await page.setInputFiles('[data-file-pdf]', f);
  await page.waitForFunction(() => window.takeoffcraft.sheets().length === 2, null, { timeout: 20000 });
  await page.waitForTimeout(300);
  ok(!(await v3()).open && /no scale/i.test(await status()), 'showing an unscaled sheet leaves 3D and says why', await status());
  await page.click('[data-act="view-3d"]');
  ok(!(await v3()).open && /no scale/i.test(await status()), 'the 3D button refuses on it too');
  await page.keyboard.press('PageUp');
  await page.waitForTimeout(400);
  await page.click('[data-act="view-3d"]');
  await page.waitForFunction(() => window.takeoffcraft.view3d().open, null, { timeout: 10000 });
  ok((await v3()).objects.length === 7, 'back on the plan sheet, 3D shows its seven marks again');
  await page.click('[data-3d-close]');
  ok(!(await v3()).open && (await T(() => getComputedStyle(document.querySelector('.tc-canvases')).visibility)) === 'visible', 'Back to the sheet shows the flat sheet');
  const words = await T(() => document.querySelector('[data-takeoffcraft]').innerText);
  ok(!/\b(null|undefined|NaN)\b/.test(words), 'no "null", "undefined" or "NaN" on the page');
  ok(!(await T(() => [...document.querySelectorAll('.cc-vc, .cc-axes')].some((e) => e.offsetParent !== null))), 'the flat sheet shows no corner indicator');
  await T(() => window.takeoffcraft.model.markSaved());
  // the corner setting survives a reload and applies to a new 3D view
  await page.reload();
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 20000 });
  // an earlier page may have left an autosaved takeoff: the shell asks "Recover your work?" — not this test's subject
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  ok((await T(() => window.takeoffcraft.settings.corner)) === 'axes', 'the corner setting is kept over a reload');
  await page.setInputFiles('[data-file-pdf]', PLAN);
  await page.waitForFunction(() => window.takeoffcraft.sheets().length === 1 && window.takeoffcraft.rendered() > 0, null, { timeout: 30000 });
  await page.selectOption('[data-scale-preset]', 'a1/4');
  await page.keyboard.press('3');
  await page.waitForFunction(() => window.takeoffcraft.view3d().open, null, { timeout: 20000 });
  await page.waitForTimeout(200);
  cs = await T(() => ({ cube: document.querySelector('.cc-vc')?.hidden, axes: document.querySelector('.cc-axes')?.hidden }));
  ok(cs.cube === true && cs.axes === false, 'after the reload the 3D view opens with the axis icon', JSON.stringify(cs));
  await setCorner('cube');
  ok(!(await T(() => document.querySelector('.cc-vc').hidden)), 'back to the view cube');

  // T5: a wall with a thickness, a base and an opening head, set in the item editor
  await page.click('[data-3d-close]');
  await page.click('[data-item-new]');
  await page.fill('[data-item-form] [name="name"]', 'Block wall');
  await page.selectOption('[data-item-form] [name="type"]', 'linear');
  await page.click('[data-item-form] button[type="submit"]');
  await page.fill('#tc-i-height', '10'); await page.press('#tc-i-height', 'Enter');
  await page.fill('#tc-i-thick', '8"'); await page.press('#tc-i-thick', 'Enter');
  await page.fill('#tc-i-base', '1'); await page.press('#tc-i-base', 'Enter');
  ok(await T(() => { const it = window.takeoffcraft.model.state.items.find((i) => i.name === 'Block wall'); return it.thickFt === 2 / 3 && it.baseFt === 1; }), 'the item editor sets the wall thickness (8") and base (1\')');
  await T(() => { const tk = window.takeoffcraft; const it = tk.model.state.items.find((i) => i.name === 'Block wall'); tk.model.addMark({ item: it.id, sheet: tk.sheets()[0].key, pts: [{ x: 930, y: 1100 }, { x: 1110, y: 1100 }] }); });
  await page.keyboard.press('3');
  await page.waitForFunction(() => window.takeoffcraft.view3d().open, null, { timeout: 20000 });
  const bw = (await v3()).objects.find((o) => o.measure?.thickFt);
  ok(bw && bw.measure.thickFt === 2 / 3 && bw.measure.baseFt === 1 && bw.measure.wallSqft === 100, 'in 3D it stands as an 8" solid from 1\' up, its wall area still 10\' × 10\'', JSON.stringify(bw?.measure));
  await page.screenshot({ path: path.join(SHOTS, 'takeoffcraft-3d-thick-wall-paper.png') });

  // T4: a second sheet at 12', stacked; T6: the view as a GLB
  const gen2 = await PDFLib.PDFDocument.create();
  const pg2 = gen2.addPage([1296, 1728]);
  pg2.drawRectangle({ x: 930, y: 1100, width: 180, height: 120, borderWidth: 2, borderColor: PDFLib.rgb(0, 0, 0) });
  const f2 = path.join(tmp, 'Upper floor.pdf');
  fs.writeFileSync(f2, await gen2.save());
  await page.click('[data-3d-close]');
  await page.setInputFiles('[data-file-pdf]', f2);
  await page.waitForFunction(() => window.takeoffcraft.sheets().length === 2, null, { timeout: 20000 });
  await page.waitForTimeout(300);
  await page.selectOption('[data-scale-preset]', 'a1/4');
  await T(() => { const tk = window.takeoffcraft; const id = tk.model.addItem({ name: 'Upper slab', type: 'area', heightFt: 0.5 }); tk.model.addMark({ item: id, sheet: tk.sheets()[1].key, pts: [{ x: 930, y: 1100 }, { x: 1110, y: 1100 }, { x: 1110, y: 1220 }, { x: 930, y: 1220 }] }); });
  await page.keyboard.press('PageUp');
  await page.waitForTimeout(400);
  await page.keyboard.press('3');
  await page.waitForFunction(() => window.takeoffcraft.view3d().open, null, { timeout: 20000 });
  await page.click('[data-3d-levels]');
  await page.waitForSelector('dialog[open] [data-level-for]');
  const inputs = await page.$$('dialog[open] [data-level-for]');
  await inputs[1].fill("12'");
  await page.click('dialog[open] [data-key="ok"]');
  await page.waitForTimeout(150);
  await page.click('[data-3d-stack]');
  await page.waitForTimeout(400);
  const stk = await v3();
  const up = stk.objects.find((o) => o.kind === 'slab' && o.measure.depthFt === 0.5);
  ok(up && /Stacked: 2 sheets/.test(await status()) && stk.objects.some((o) => o.kind === 'frame'), 'Levels… sets 12\' on the second sheet; Stack shows both floors (the upper one outlined)', await status());
  await page.screenshot({ path: path.join(SHOTS, 'takeoffcraft-3d-stacked-paper.png') });
  const [gdl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.click('[data-3d-glb]')]);
  const gf = path.join(tmp, gdl.suggestedFilename());
  await gdl.saveAs(gf);
  const { createRequire } = await import('node:module');
  const validator = createRequire(path.join(ROOT, 'tools/takeoffcraft-test/package.json'))('gltf-validator');
  const vr = await validator.validateBytes(new Uint8Array(fs.readFileSync(gf)));
  ok(gf.endsWith('.glb') && vr.issues.numErrors === 0 && vr.info?.totalVertexCount > 0, `GLB downloads and validates (${vr.issues.numErrors} errors, ${vr.info?.totalVertexCount} vertices, ${gdl.suggestedFilename()})`);
  // model 1.7: the view as a PNG, and at twice the size with Shift
  const pngSize = (b) => [b.readUInt32BE(16), b.readUInt32BE(20)];
  const cv = await T(() => { const c = document.querySelector('[data-3d-host] canvas, .tc-3d canvas'); return c ? [c.width, c.height] : null; });
  const [pdl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.click('[data-3d-png]')]);
  const pf = path.join(tmp, pdl.suggestedFilename()); await pdl.saveAs(pf);
  const pb = fs.readFileSync(pf);
  ok(pb.subarray(1, 4).toString() === 'PNG' && /3D\.png$/.test(pdl.suggestedFilename()) && (!cv || pngSize(pb).join() === cv.join()), `PNG: the view at its size (${pngSize(pb).join(' × ')}, ${pdl.suggestedFilename()})`);
  const [pdl2] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.click('[data-3d-png]', { modifiers: ['Shift'] })]);
  const pf2 = path.join(tmp, pdl2.suggestedFilename()); await pdl2.saveAs(pf2);
  const s2 = pngSize(fs.readFileSync(pf2)), s1 = pngSize(pb);
  ok(/@2x\.png$/.test(pdl2.suggestedFilename()) && s2[0] === 2 * s1[0] && s2[1] === 2 * s1[1], `Shift + PNG: twice the size (${s2.join(' × ')})`);
  await page.click('[data-3d-stack]');
  await T(() => window.takeoffcraft.model.markSaved());
} catch (err) {
  ok(false, 'browser run', err.stack?.split('\n').slice(0, 4).join(' | '));
} finally {
  await browser.close();
  admin('down');
  fs.rmSync(tmp, { recursive: true, force: true });
}
for (const i of issues) console.log('    ! ' + i);
ok(issues.length === 0, 'no console errors, page errors or failed requests');
console.log('  screenshots in ' + SHOTS);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

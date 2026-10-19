#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fixes2.mjs — BimCraft's 0.6 round-2 fixes (session `bim-fixes_PART_2`) in the lab, headless, on the saved
 * showcase files (fixtures/showcase/bimcraft-house.ifc and bimcraft-house-turned.ifc).
 *   node tools/bimcraft-test/browser-fixes2.mjs [--shots <dir>] [--only dc53,dc57,dc101] [--explore]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimfix2), so the shared
 * admin-login throttle is never touched. Fails on any console error.
 *   dc53   section ghosting: a section plane and a box round the house, seen from eight directions
 *   dc57   a turned model: sections square to the building, a copied door pasted along its wall with wall snap
 *   dc101  the section bar (plane and box) and the plan's Draw bar never overlap, every section control stays reachable,
 *          the Draw bar stays in its pane and its menus drop over the section bar (Draw off, Split, Plan only; interface
 *          size 80/100/140 % on the 1440 px laptop width, 80/100 % at 1280 px; --cases 1280x800@1.4,… for others)
 * --explore only takes the shots (no checks), for the repro notes.
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
const EXPLORE = process.argv.includes('--explore');
const want = (k) => !ONLY || ONLY.includes(k);

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (EXPLORE) return; if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimfix2'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
let ctx = null, page = null;
/** A fresh context (no autosave from an earlier section), signed in, on /lab/bimcraft. `ui` = interface size (1 = 100 %). */
async function fresh({ width = 1440, height = 900, ui = 1, space = 'paper' } = {}) {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width, height }, acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/bimcraft?space=' + space, { waitUntil: 'networkidle' });
  await page.evaluate((u) => {
    try {
      localStorage.setItem('bimcraft.model.units', 'mm');
      const k = 'cc-app-settings:bimcraft', s = JSON.parse(localStorage.getItem(k) || '{}');
      if (u === 1) delete s.ui; else s.ui = u;
      localStorage.setItem(k, JSON.stringify(s));
    } catch (e) { /* none */ }
  }, ui);
  await page.reload({ waitUntil: 'networkidle' });
}
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return !s || (!s.busy && !s.reloading && !s.queue.length); }, null, { timeout: 90000 });
async function openShowcase(file) {
  await page.setInputFiles('[data-file]', { name: file, mimeType: 'application/x-step', buffer: fs.readFileSync(path.join(REPO, 'fixtures/showcase', file)) });
  const asked = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"]', { timeout: 1500 }).catch(() => null);
  if (asked) await asked.click();
  await waitStatus(new RegExp('^Opened ' + file.replace(/\..*$/, '').replace(/[-()]/g, '.')), 120000);
  await settled();
}
/** Camera from direction d (viewer axes, Y up) at the fit distance, looking at the model's centre; `close` = 'walls' or a
 *  list of element keys to frame instead (the showcase's terrain is far bigger than the house). */
const look = (d, close = null) => page.evaluate(([d, close]) => {
  const v = document.querySelector('[data-canvas]').viewer;
  v.view('iso');
  let c = v.controls.target.clone(), dist = v.camera.position.distanceTo(c);
  if (close) {
    const bb = v.keyBounds(close === 'walls' ? window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcWall' }]) : close);
    v.select([]);
    c = c.set((bb.min[0] + bb.max[0]) / 2, (bb.min[1] + bb.max[1]) / 2, (bb.min[2] + bb.max[2]) / 2);
    dist = Math.hypot(bb.max[0] - bb.min[0], bb.max[1] - bb.min[1], bb.max[2] - bb.min[2]) * 1.3;
    v.controls.target.copy(c);
  }
  const n = Math.hypot(...d);
  v.camera.position.set(c.x + d[0] / n * dist, c.y + d[1] / n * dist, c.z + d[2] / n * dist);
  v.controls.update(); v.render();
}, [d, close]);
/** Is the pixel at each viewer-space point the cut colour? (the canvas keeps its drawing buffer) */
const capAt = (pts) => page.evaluate(async (pts) => {
  const v = document.querySelector('[data-canvas]').viewer, cv = v.renderer.domElement;
  v.render(); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const g = document.createElement('canvas'); g.width = cv.width; g.height = cv.height;
  const gc = g.getContext('2d'); gc.drawImage(cv, 0, 0);
  const [cr, cg, cb] = v.colors.cap.getStyle().match(/\d+/g).map(Number);
  const V = v.camera.position.constructor;
  return pts.map((p) => {
    const q = new V(...p).project(v.camera), x = Math.round((q.x + 1) / 2 * cv.width), y = Math.round((1 - q.y) / 2 * cv.height);
    const d = gc.getImageData(x, y, 1, 1).data;
    return Math.abs(d[0] - cr) < 14 && Math.abs(d[1] - cg) < 14 && Math.abs(d[2] - cb) < 14;
  });
}, pts);
/** Draw on in Split or Plan only (the Draw bar's own buttons), or Draw off ('3d'). */
async function setLayout(l) {
  const on = await page.evaluate(() => !!window.bimcraftPlan?.state?.on);
  // a real click; a button something else covers is a finding (DC.101), so say so and press it anyway
  const press = async (q) => {
    const covered = await page.evaluate((q) => {
      const b = document.querySelector(q).getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
      const top = document.elementFromPoint(x, y);
      return top && !document.querySelector(q).contains(top) ? (top.closest('[class]')?.className?.baseVal ?? top.closest('[class]')?.className) || top.tagName : null;
    }, q);
    ok(!covered, q + ' can be clicked', covered ? 'covered by ' + covered : '');
    if (covered) { console.log('  note: ' + q + ' covered by ' + covered); await page.evaluate((q) => document.querySelector(q).click(), q); }
    else await page.click(q);
  };
  if (l === '3d') { if (on) await press('[data-model-layout="3d"]'); }
  else { if (!on) await press('[data-model-toggle]'); await press(`[data-model-layout="${l}"]`); }
  await page.waitForTimeout(200);
  await settled();
}
/** Sections through the house itself (the terrain block sets the model's bounds): a top cut 1.2 m above the walls' foot,
 *  a front cut through the middle of the walls, and a box round the walls. Nothing is left selected. */
const houseCuts = () => page.evaluate(() => {
  const v = document.querySelector('[data-canvas]').viewer;
  const keys = window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcWall' }]);
  v.select([]);
  const bb = v.keyBounds(keys), B = v.secBox();
  const r = (x) => Math.round(x * 1000) / 1000;
  return {
    top: { axis: 'top', offset: r(bb.min[1] - B.min.y + 1.2) },
    front: { axis: 'front', offset: r((bb.min[2] + bb.max[2]) / 2 - B.min.z) },
    box: { axis: 'box', box: v.boxAround(keys, 0.5) },
  };
});
const DIRS = { se: [1, 0.6, 1], sw: [-1, 0.6, 1], ne: [1, 0.6, -1], nw: [-1, 0.6, -1], lowse: [1, 0.12, 0.7], lownw: [-0.7, 0.12, -1], high: [0.3, 1.6, 0.4], under: [0.8, -0.5, 0.6] };

// ---- DC.53: section ghosting ----
if (want('dc53')) {
  console.log('== DC.53 section ghosting');
  await fresh({ space: 'model' });
  await openShowcase('bimcraft-house.ifc');
  const cuts = await houseCuts();
  for (const [name, s] of Object.entries(cuts)) {
    await page.evaluate((s) => window.bimcraftSection.set(s), s);
    for (const [dn, d] of Object.entries(DIRS)) { await look(d, name === 'box' ? 'walls' : null); await shot('dc53-' + name + '-' + dn); }
  }
  ok(true, 'the showcase house cut three ways (top, front, box) from eight directions: shots dc53-*');
  await page.evaluate(() => window.bimcraftSection.set(null));
  // An element of two colours whose parts are open alone (two shells closing a box), a box in one colour and an open sheet
  // on the floor, cut through the middle: both boxes are filled, the sheet never is, from every direction above the cut.
  const { splitBoxIfc } = await import('./fixes2-test.mjs');
  await page.setInputFiles('[data-file]', { name: 'split-box.ifc', mimeType: 'application/x-step', buffer: Buffer.from(splitBoxIfc()) });
  const asked = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"]', { timeout: 1500 }).catch(() => null);
  if (asked) await asked.click();
  await waitStatus(/^Opened split-box/, 60000);
  const keys = await page.evaluate(() => ['Split box', 'Whole box', 'Sheet'].map((n) => window.bimcraftKeys(n)));
  await page.evaluate(() => window.bimcraftSection.set({ axis: 'top', offset: 0.5 }));
  const pts = await page.evaluate((keys) => {
    const v = document.querySelector('[data-canvas]').viewer, y = v.secBox().min.y + 0.5;
    return keys.map((k) => { const b = v.keyBounds([k]); return [(b.min[0] + b.max[0]) / 2, k === keys[2] ? b.min[1] : y, (b.min[2] + b.max[2]) / 2]; });
  }, keys);
  for (const [dn, d] of Object.entries(DIRS)) {
    if (d[1] <= 0.2) continue;   // from below or along the cut the boxes' own faces hide it
    await look(d, keys);
    const [split, whole, sheet] = await capAt(pts);
    ok(split && whole && !sheet, `from ${dn}: the two-colour box and the one-colour box are filled where cut, the open sheet is not`, JSON.stringify({ split, whole, sheet }));
    if (dn === 'se') await shot('dc53-split-box-se');
  }
  // control: judged batch by batch, as before this fix, the two-colour box is left hollow (so the check above can fail)
  await look(DIRS.se, keys);
  await page.evaluate(async () => {
    const C = await import('/assets/apps/bimcraft/dev/caps-closed.js'), v = document.querySelector('[data-canvas]').viewer;
    for (const m of v.meshes) { const b = m.userData.batch; if (b && !m.userData.space) b.openIds = C.openElements(b.positions, b.indices, b.triIds); }
    v.updateCaps();
  });
  const [was] = await capAt(pts);
  ok(!was, 'control: judged batch by batch (before the fix) the two-colour box is not filled');
  await shot('dc53-split-box-se-before');
  await page.evaluate(() => window.bimcraftSection.set(null));
}

// ---- DC.57: a turned model ----
/** The screen's right edge in plan after a view preset, degrees folded to [0, 90): 0 = along the model's axes, 30 = along
 *  the turned house's walls. */
const screenTurn = (name) => page.evaluate((name) => {
  const v = document.querySelector('[data-canvas]').viewer;
  if (name) v.view(name);
  v.camera.updateMatrixWorld();
  const e = v.camera.matrixWorld.elements, a = Math.atan2(-e[2], e[0]) * 180 / Math.PI;
  return Math.round((((a % 90) + 90) % 90) * 100) / 100;
}, name);
const near30 = (a) => Math.abs(a - 30) < 0.6;
const near = (a, b) => Math.abs(a - b) < 0.6;
if (want('dc57')) {
  console.log('== DC.57 a turned model (the showcase house turned 30° at map coordinates)');
  await fresh({ space: 'model' });
  await openShowcase('bimcraft-house-turned.ifc');
  // (a) it opens square to the house: the opening view and Top / Front / Side look along its walls
  // Fit (iso) looks from a corner: 45° + the house's 30°
  const open = await screenTurn(null);
  ok(near(open, 75), 'the model opens square to the house: Fit from its corner (screen ' + open + '° from the model\'s axes; 75 = 45 + 30)');
  for (const n of ['top', 'front', 'side']) { const a = await screenTurn(n); ok(near30(a), n + ' looks along the house\'s walls: ' + a + '°'); }
  ok(near(await screenTurn('iso'), 75), 'Fit: from the house\'s corner');
  // the view cube shows the house's faces: its Front face gives the same view as the toolbar's Front
  const cubeFront = await page.evaluate(() => {
    const cell = [...document.querySelectorAll('[data-canvas-wrap] [data-vc-face="front"]')].find((c) => c.getBoundingClientRect().width > 4);
    if (!cell) return null;
    const r = cell.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  });
  if (cubeFront) { await page.mouse.click(cubeFront[0], cubeFront[1]); await page.waitForTimeout(800); }
  if (cubeFront) { const a = await screenTurn(null); ok(near30(a), 'the view cube\'s Front faces the house: ' + a + '°'); }
  else ok(false, 'the view cube\'s Front face is there');
  await page.evaluate(() => document.querySelector('[data-canvas]').viewer.view('top')); await shot('dc57-a-top');
  // (b) a section is square to the house from the start; the button still switches it to the model's axes
  await page.click('[data-toolbar] [data-toggle="section"]');
  await page.click('[data-sec-axis="front"]');
  const sec = await page.evaluate(() => ({ turn: document.querySelector('[data-canvas]').viewer.sectionTurn * 180 / Math.PI, pressed: document.querySelector('[data-sec-turn]').getAttribute('aria-pressed') }));
  ok(near30(((sec.turn % 90) + 90) % 90) && sec.pressed === 'true', 'a new section is square to the house: ' + JSON.stringify(sec));
  await page.evaluate(() => document.querySelector('[data-canvas]').viewer.view('top')); await shot('dc57-b-front-cut');
  await page.click('[data-sec-axis="box"]');
  await shot('dc57-b-box');
  await page.click('[data-sec-turn]');
  ok(await page.evaluate(() => document.querySelector('[data-canvas]').viewer.sectionTurn) === 0, 'Square to the building off: the section runs along the model\'s axes again');
  await page.click('[data-sec-off]');
  // the setting: As placed in the site = the model's axes, as in 0.5
  await page.click('[data-settings-open]');
  const dlg = await page.waitForSelector('dialog[data-app-settings][open]', { timeout: 3000 }).catch(() => null);
  if (dlg) {
    const tab = await page.$('dialog[data-app-settings] [role="tab"]');   // BimCraft's own tab first
    if (tab) await tab.click();
    await page.check('[name="bcTurned"][value="placed"]');
    ok(near(await screenTurn(null), 45), 'Settings › As placed in the site: Fit along the model\'s axes again (' + await screenTurn(null) + '°)');
    ok(near(await screenTurn('top'), 0), 'and Top along the model\'s axes');
    await page.check('[name="bcTurned"][value="square"]');
    ok(near30(await screenTurn('top')), 'Square to the building again: Top along the walls');
    await page.keyboard.press('Escape');
  } else ok(false, 'the Settings dialog opens');

  // (c) a copied door pasted with wall snap runs along the wall it snaps to, not square to the model's axes. The showcase's
  // doors are drawn in BimCraft (copying those is "not built yet", said so on Copy), so this is the model the 0.5 test
  // generates: a 6 m wall and a door from another program in it, turned 30° at map coordinates.
  execFileSync('node', [path.join(REPO, 'bin/test-bimcraft.mjs'), '--rotated', '--keep'], { stdio: 'ignore' });
  await page.setInputFiles('[data-file]', path.join(REPO, 'tmp/bimcraft-rotated.ifc'));
  { const asked = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"]', { timeout: 1500 }).catch(() => null); if (asked) await asked.click(); }
  await waitStatus(/^Opened bimcraft-rotated/, 60000);
  const door = await page.evaluate(() => {
    const v = document.querySelector('[data-canvas]').viewer, keys = window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcDoor' }]);
    const sized = keys.map((k) => { const b = v.keyBounds([k]); return { k, w: b.max[0] - b.min[0], d: b.max[2] - b.min[2] }; });
    return sized.find((x) => Math.max(x.w, x.d) < 1.6) || sized[0];   // a single door (not the garage's)
  });
  await page.evaluate((k) => window.bimcraftVis.pick([k]), door.k);
  await page.click('[data-toolbar] [data-act="copy"]');
  ok(/^Copied/.test((await page.textContent('[data-status]')).trim()), 'Copy: "' + (await page.textContent('[data-status]')).trim() + '"');
  await page.click('[data-toolbar] [data-act="paste"]');
  await page.waitForSelector('[data-placebar]:not([hidden])');
  if (await page.getAttribute('[data-place-snap]', 'aria-pressed') !== 'true') await page.click('[data-place-snap]');
  // over the wall, 80 % along it (the wall runs from its bounds' (min x, max z) corner to (max x, min z) in the viewer),
  // half a metre off its face, so the snap has to pull the door onto the wall
  const target = await page.evaluate(() => {
    const v = document.querySelector('[data-canvas]').viewer, keys = window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcWall' }]);
    v.select([]);
    const b = v.keyBounds(keys), t = 0.8, n = [Math.sin(Math.PI / 6), Math.cos(Math.PI / 6)];   // the wall's normal in x, z
    return { x: b.min[0] + (b.max[0] - b.min[0]) * t + n[0] * 0.5, y: v.placeY, z: b.max[2] + (b.min[2] - b.max[2]) * t + n[1] * 0.5 };
  });
  await page.evaluate((p) => { const v = document.querySelector('[data-canvas]').viewer; v.placing.move(new v.camera.position.constructor(p.x, p.y, p.z)); }, target);
  const at = await page.textContent('[data-place-at]');
  const rot = Number((at.match(/(-?\d+)\s*°/) || [])[1]);
  ok(Number.isFinite(rot) && near30(((rot % 90) + 90) % 90), 'the ghost snaps to the wall turned with it: "' + at.trim() + '"');
  const ghost = await page.evaluate(() => {
    const g = document.querySelector('[data-canvas]').viewer.ghost, p = g?.children[0]?.geometry?.getAttribute('position');
    if (!p) return null;
    const a = [p.getX(1) - p.getX(0), p.getZ(1) - p.getZ(0)];
    return Math.round(((((Math.atan2(-a[1], a[0]) * 180 / Math.PI) % 90) + 90) % 90) * 100) / 100;
  });
  ok(ghost !== null && near30(ghost), 'the ghost box is the door\'s own shape along the wall: ' + ghost + '°');
  await shot('dc57-c-ghost');
  await page.evaluate((p) => { const v = document.querySelector('[data-canvas]').viewer; v.placing.click(new v.camera.position.constructor(p.x, p.y, p.z)); }, target);
  await waitStatus(/^Pasted|pasted/i, 60000);
  await page.keyboard.press('Escape');
  const pasted = await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer, k = [...v.selection][0], b = k && v.keyBounds([k]); return b && { k, w: b.max[0] - b.min[0], d: b.max[2] - b.min[2] }; });
  const same = pasted && ((Math.abs(pasted.w - door.w) < 0.02 && Math.abs(pasted.d - door.d) < 0.02) || (Math.abs(pasted.w - door.d) < 0.02 && Math.abs(pasted.d - door.w) < 0.02));
  ok(same, 'the pasted door has the original\'s footprint (turned with the walls): ' + JSON.stringify({ door, pasted }));
  await shot('dc57-c-pasted');
}

// ---- DC.101: the section bar over the Draw bar ----
if (want('dc101')) {
  console.log('== DC.101 section bar and Draw bar');
  // e.g. --cases 1280x800@1.4. Default: the 1440 px laptop at 80, 100 and 140 %, and 1280 × 800 at 80 and 100 % — at 140 % a
  // 1280 × 800 window with both side panels open leaves a 430 px stage whose toolbar and Draw bar fill it (log § Found).
  const ci = process.argv.indexOf('--cases');
  const CASES = ci > 0 ? process.argv[ci + 1].split(',').map((c) => c.split(/[x@]/).map(Number))
    : [[1440, 900, 0.8], [1440, 900, 1], [1440, 900, 1.4], [1280, 800, 0.8], [1280, 800, 1]];
  for (const [w, h, u] of CASES) {
    {
      await fresh({ width: w, height: h, ui: u });
      await openShowcase('bimcraft-house.ifc');
      for (const layout of ['split', 'plan', '3d']) {
        await setLayout(layout);
        for (const axis of ['top', 'box']) {   // the plane's bar, and the box's taller panel (sliders, boxes, tilt)
        await page.evaluate((axis) => window.bimcraftSection.set(axis === 'box' ? { axis } : { axis, offset: 1.2 }), axis);
        await page.waitForTimeout(150);
        const r = await page.evaluate(() => {
          const box = (q) => { const e = document.querySelector(q); if (!e || e.hidden || !e.offsetParent) return null; const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
          const pane = (q) => { const e = document.querySelector(q); if (!e) return null; const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
          return { sec: box('[data-sectionbar]'), draw: box('[data-plan-wrap]:not([hidden]) [data-modelbar]'), tb: box('[data-toolbar]'),
            view: pane('[data-canvas-wrap]'), plan: box('[data-plan-wrap]'), stacked: document.querySelector('.bc-stage').classList.contains('is-plan-stacked') };
        });
        const hit = (a, b) => a && b && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
        const inside = (a, b) => a && b && a.l >= b.l - 1 && a.r <= b.r + 1 && a.t >= b.t - 1;
        const tag = `${w} px, ${Math.round(u * 100)} %, ${layout}${r.stacked ? ' (stacked)' : ''}, ${axis}`;
        if (EXPLORE) console.log(`  ${tag}: sec ${JSON.stringify(r.sec)} draw ${JSON.stringify(r.draw)} overlap ${!!hit(r.sec, r.draw)}`);
        ok(!hit(r.sec, r.draw), tag + ': the section bar and the Draw bar do not overlap');
        ok(!hit(r.sec, r.tb), tag + ': the section bar is clear of the toolbar');
        if (layout !== 'plan') ok(inside(r.sec, r.view), tag + ': the section bar sits on the 3D view it cuts', JSON.stringify({ sec: r.sec, view: r.view }));
        if (r.draw) ok(inside(r.draw, r.plan), tag + ': the Draw bar stays inside the plan', JSON.stringify({ draw: r.draw, plan: r.plan }));
        // every control of the section bar can be reached and clicked: inside the window (scrolled into view within the bar
        // when it scrolls) and under nothing else (view cube, coordinates, the other bars)
        const covered = await page.evaluate(() => [...document.querySelectorAll('[data-sectionbar] button, [data-sectionbar] input, [data-sectionbar] select, [data-sectionbar] summary')]
          .filter((b) => b.offsetParent && !b.closest('[hidden]') && b.checkVisibility({ visibilityProperty: true })).map((b) => {
            const bar = document.querySelector('[data-sectionbar]'), br = bar.getBoundingClientRect();   // scroll the bar only, never the page
            let q = b.getBoundingClientRect();
            if (q.bottom > br.bottom || q.top < br.top) { bar.scrollTop += q.top - br.top - 4; q = b.getBoundingClientRect(); }
            const x = q.left + q.width / 2, y = q.top + q.height / 2;
            if (y > innerHeight || x > innerWidth || y < 0) return (b.textContent.trim() || b.name || b.type) + ' off the window';
            const top = document.elementFromPoint(x, y);
            return top && (b.contains(top) || top.contains(b)) ? null : (b.textContent.trim() || b.name || b.type) + ' under ' + (top?.closest('[class]')?.getAttribute('class') || top?.tagName);
          }).filter(Boolean).concat(document.querySelector('.bc-stage').scrollTop ? ['the stage scrolled'] : []));
        await page.evaluate(() => { document.querySelector('[data-sectionbar]').scrollTop = 0; });
        ok(!covered.length, tag + ': every section bar control can be clicked', covered.join('; '));
        await shot(`dc101-${w}-${Math.round(u * 100)}-${layout}-${axis}`);
        if (layout === 'plan' && axis === 'box') {   // the Draw bar's menus drop over the section bar under it
          await page.click('[data-modelbar] details.bc-mb-more > summary');
          const menuOk = await page.evaluate(() => {
            const items = [...document.querySelectorAll('[data-modelbar] details[open] .bc-mb-menu .bc-tool')].filter((b) => { const q = b.getBoundingClientRect(); return b.offsetParent && q.top + q.height / 2 < innerHeight; });   // a long menu runs past the window's foot
            const bad = items.map((b) => { const q = b.getBoundingClientRect(), top = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return top && b.contains(top) ? null : b.textContent.trim() + ' under ' + (top?.closest('[class]')?.getAttribute('class') || top?.tagName); }).filter(Boolean);
            return items.length ? bad.join('; ') || true : 'no menu items';
          });
          ok(menuOk === true, tag + ': the Draw bar\'s Build menu opens over the section bar', menuOk === true ? '' : menuOk);
          await page.keyboard.press('Escape');
          await page.evaluate(() => document.querySelectorAll('[data-modelbar] details[open]').forEach((d) => { d.open = false; }));
        }
        }
        await page.evaluate(() => window.bimcraftSection.set(null));
      }
    }
  }
}

await browser.close();
for (const p of problems) { fail++; console.log('  FAIL ' + p); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

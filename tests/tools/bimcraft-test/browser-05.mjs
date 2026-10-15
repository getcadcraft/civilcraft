#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-05.mjs — BimCraft's 0.5 items in the lab (session `bim-civil`), headless, with real clicks and keys. Grows one
 * section per finished item. Opens the generated IFC fixture (tools/bimcraft-test/ifc-fixture.mjs): no client files.
 *   node tools/bimcraft-test/browser-05.mjs [--shots <dir>] [--only wl1,wl2,…]
 * Run as root: signs in with BimCraft's own test admin (tools/bimcraft-test/admin.php up|down, disabled again at the
 * end) and drives the cached Playwright Chromium. The admin-login throttle (10 / 10 min for 127.0.0.1) is shared: run
 * it once per finished item. Fails on any console error.
 *
 *   caps  section caps leave open elements alone (Discord, 2026-10-14): a single-sided sheet inside the box keeps its own
 *         colour (the cut colour must not spread over it), closed solids are still filled. CAPS_DEBUG=1 keeps the sheet and
 *         takes a shot; BC_BUILD=<x.y> opens a release instead of dev.
 *   WL.1  free-form section volumes: a second box → twelve planes and an L-shaped cut (Level 2's wall picked only inside
 *         the second box), the cut faces filled (pixels counted, both themes), a tilted roof face, an extra plane added,
 *         typed and removed, the second box removed; an issue keeps the first box, and a tilted issue comes back as a volume
 *   WL.2  Settings › BimCraft › Section box: the margin (300 mm, set to 1000, stored); Show › Section box round the pick and
 *         Shift+X fit the box with that margin; 26 grips; a corner grip dragged in Top moves two faces (camera and pick
 *         untouched), an edge grip in Front moves X and Z, a face grip only its face; the pointer turns into a move cursor
 *   WL.3  copy buttons on Properties values: the GlobalId, a property set value, an editable Name (copying does not start an
 *         edit); Copy all (text) and Copy as CSV; an element of a second (federated) model: copy buttons there too, the CSV
 *         with a Model column
 *   DB.11 dynamic blocks (AutoCAD's blocks sample from testfiles, when this machine has it): BimCraft's drawing panel lists
 *         them (Receptacle 45 placed, shown as Duplex / GFI, its states); a picked reference in 3D names its block, the state
 *         it shows and the others; ModelCraft's DWG import says the same in its status
 *   WL.4  Measure › Location on the georeferenced fixture (EPSG:28356 + IfcMapConversion): a click on W-101 → latitude and
 *         longitude equal to PROJ's for that file point, the grid E/N, AHD, GDA94 labelled; Copy; Settings › Location →
 *         NAD83 named; the site-only fixture (approximate, said so); a model with no georeference says so
 *   WL.5  Color by Class, the door's swatch changed to green (painted), Save scheme → the JSON downloaded and checked; revision
 *         b opened, Open scheme… → the same colors (the door green), a value it lacks listed with 0, the theme keeps the
 *         scheme's colors; a file that is not a scheme is refused
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureIfc } from './ifc-fixture.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : path.join(REPO, 'tmp/shots/bimcraft-05');
fs.mkdirSync(SHOTS, { recursive: true });
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? new Set(process.argv[oi + 1].split(',')) : null;
const want = (k) => !ONLY || ONLY.has(k);

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const shot = async (page, name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/bimcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

const statusOf = () => page.textContent('[data-status]');
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const disabled = async (sel) => (await page.getAttribute(sel, 'aria-disabled')) === 'true';
const fixtureFile = (opts = {}, name = 'bimcraft-fixture.ifc') => ({ name, mimeType: 'application/x-step', buffer: Buffer.from(fixtureIfc(opts)) });
const openFile = async (file) => { await page.setInputFiles('[data-file]', file); await waitStatus(/^Opened /); };
/** key of an element by Name, from the open model (expressID for the first model). */
const keyOf = (name) => page.evaluate((n) => {
  const v = document.querySelector('[data-canvas]').viewer;
  return window.bimcraftKeys ? window.bimcraftKeys(n) : null;
}, name);
const screenOf = (key) => page.evaluate((k) => document.querySelector('[data-canvas]').viewer.screenOf(k), key);
/** A page point where a click lands on this element (it may be partly behind others): a grid search round its middle. */
const spotOf = (key) => page.evaluate((k) => {
  const v = document.querySelector('[data-canvas]').viewer, c = v.screenOf(k), R = v.canvas.getBoundingClientRect();
  if (!c) return null;
  const inside = (x, y) => x > R.left + 2 && x < R.right - 2 && y > R.top + 2 && y < R.bottom - 2;
  for (let r = 0; r <= 240; r += 6) for (let a = 0; a < 360; a += r ? 15 : 360) {
    const x = c.x + r * Math.cos(a * Math.PI / 180), y = c.y + r * Math.sin(a * Math.PI / 180);
    if (inside(x, y) && v.hitAt(x, y)?.id === k) return { x, y };
  }
  return null;
}, key);
const openVis = async () => { if (!(await page.evaluate(() => document.querySelector('[data-vis-menu]').open))) await page.click('[data-vis-menu] > summary'); };
const pickedKeys = () => page.evaluate(() => [...document.querySelector('[data-canvas]').viewer.selection]);
const hitKey = (pt) => page.evaluate(({ x, y }) => document.querySelector('[data-canvas]').viewer.hitAt(x, y)?.id ?? null, pt);
const elementCount = () => page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer, out = new Set(); for (const m of v.meshes) if (!m.userData.space) for (const k of m.userData.batch.elems.ids) out.add(k); return out.size; });   // elements; spaces (rooms) apart
const trisOf = (key) => page.evaluate((k) => document.querySelector('[data-canvas]').viewer.batches.reduce((a, b) => { const r = [...b.elems.ids].indexOf(k); return a + (r >= 0 ? b.elems.tn[r] : 0); }, 0), key);
const openMore = async () => { if (!(await page.evaluate(() => document.querySelector('[data-edit-menu]').open))) await page.click('[data-edit-menu] > summary'); };
const item = (act) => `[data-edit-menu] [role="menuitem"][data-act="${act}"]`;
const clickPick = async (key, add = false) => {
  const p = await spotOf(key);
  if (!p) throw new Error('no visible spot on element ' + key);
  if (add) await page.keyboard.down('Control');
  await page.mouse.click(p.x, p.y);
  if (add) await page.keyboard.up('Control');
};
function danglingRefs(text) {
  const defined = new Set(), refs = new Set();
  for (const m of text.matchAll(/^#(\d+)=/gm)) defined.add(Number(m[1]));
  for (const line of text.split('\n')) {
    if (!/^#\d+=/.test(line)) continue;
    for (const m of line.slice(line.indexOf('=') + 1).replace(/'(?:[^']|'')*'/g, "''").matchAll(/#(\d+)/g)) refs.add(Number(m[1]));
  }
  return [...refs].filter((r) => !defined.has(r));
}
/** Ctrl+Z, then wait until the model is rebuilt (the status line says so last). */
const undo = async () => { await page.evaluate(() => { document.querySelector('[data-status]').textContent = ''; }); await press('Control+z'); await waitStatus(/^Undid/); };
const press = async (k) => { await page.locator('[data-canvas]').focus().catch(() => {}); await page.keyboard.press(k); };

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/bimcraft' + (process.env.BC_BUILD ? '/' + process.env.BC_BUILD : '') + '?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.removeItem('bimcraft.settings'); localStorage.removeItem('bimcraft.clipboard'); });
  await page.reload({ waitUntil: 'networkidle' });
  await openFile(fixtureFile());
  ok(true, 'opened the generated fixture');

  /** Share of canvas pixels in the cut color (the theme's --ink-2), read back from the WebGL canvas. */
  const capShare = () => page.evaluate(async () => {
    const v = document.querySelector('[data-canvas]').viewer;
    v.renderer.render(v.scene, v.camera);
    const img = new Image(); img.src = v.canvas.toDataURL('image/png'); await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const [tr, tg, tb] = v.colors.cap.getStyle().match(/\d+/g).map(Number);
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - tr) < 12 && Math.abs(d[i + 1] - tg) < 12 && Math.abs(d[i + 2] - tb) < 12) n++;
    return n / (d.length / 4);
  });
  const slide = (sel, v) => page.$eval(sel, (r, val) => { r.value = String(val); r.dispatchEvent(new Event('input', { bubbles: true })); }, v);
  const sec = () => page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer, c = window.bimcraftSection.get(); return { planes: v.clip.length, groups: v.section?.groups?.map((g) => g.length), cells: c?.cells?.length, cell: c?.cell, frame: !!v.sectionFrame, empty: !!v.section?.empty, caps: v.caps.filter((o) => o.userData.capPlane).length }; });

  if (want('wl1')) {
    console.log('== WL.1 free-form section volumes');
    await page.click('[data-view="iso"]');
    const w201 = await keyOf('W-201'), w202 = await keyOf('W-202');
    const p201 = await spotOf(w201), p202 = await spotOf(w202);
    ok(p201 && p202, 'W-201 and W-202 (Level 2) can be picked before the cut');
    await page.click('[data-toggle="section"]');
    await page.click('[data-sec-axis="box"]');
    await slide('[data-box-axis="z"] [data-box-to]', 2.5);
    ok((await hitKey(p201)) !== w201 && (await hitKey(p202)) !== w202, 'one box up to 2.5 m: Level 2\'s walls are cut away');
    await page.click('[data-sec-cell-add]');
    await waitStatus(/^Box 2 added/);
    let s = await sec();
    ok(s.cells === 2 && s.cell === 1 && s.planes === 12 && s.groups.join() === '6,6' && await page.isVisible('[data-sec-cell-remove]'), 'Add a box: two cells, twelve planes, the sliders now edit Box 2 (' + JSON.stringify(s) + ')');
    ok((await page.$$eval('[data-sec-cell] option', (os) => os.map((o) => o.textContent))).join() === 'Box 1,Box 2', 'the box list says Box 1, Box 2');
    // Box 2: the east end only (X 8 m on), full height → an L-shaped cut seen from the side
    await slide('[data-box-axis="x"] [data-box-from]', 8);
    await slide('[data-box-axis="z"] [data-box-to]', 99);
    const c2 = await page.evaluate(() => window.bimcraftSection.get().cells.map((c) => c.box));
    ok(Math.abs(c2[0].max[2] - 2.5) < 0.01 && Math.abs(c2[1].min[0] - 8) < 0.02 && c2[1].max[2] > 5, 'Box 1 keeps its 2.5 m top; Box 2 runs from X 8 m to the full height (' + JSON.stringify(c2) + ')');
    ok((await hitKey(p201)) !== w201, 'W-201 at its middle (X ≈ 5 m) is still cut away: it is in neither box');
    const in202 = await spotOf(w202);
    ok(in202 && (await hitKey(in202)) === w202, 'W-202 (X = 10 m, Level 2) can be picked again: it is inside Box 2');
    await shot(page, 'wl1-01-l-shape-iso');
    await page.click('[data-view="top"]');
    const capL = await capShare();
    ok(capL > 0.001 && (await sec()).caps === 12, 'the L-shaped cut is filled where it cuts solids (' + (capL * 100).toFixed(2) + '% of the view; 12 cut faces)');
    await shot(page, 'wl1-02-l-shape-top');
    await page.evaluate(() => { document.documentElement.dataset.space = 'model'; });
    await page.waitForTimeout(200);
    ok((await capShare()) > 0.001, 'model theme: filled too');
    await page.click('[data-view="iso"]');
    await shot(page, 'wl1-03-l-shape-model');
    await page.evaluate(() => { document.documentElement.dataset.space = 'paper'; });
    // a sloping roof on Box 1
    await page.selectOption('[data-sec-cell]', '0');
    ok((await sec()).cell === 0, 'choosing Box 1 in the list: the sliders edit Box 1');
    await page.click('[data-sec-shape] > summary');
    await page.selectOption('[data-sec-tilt-face]', 'z1');
    ok((await page.textContent('[data-sec-tilt-alabel]')) === 'Tilt towards X' && (await page.textContent('[data-sec-tilt-blabel]')) === 'Tilt towards Y', 'the top face tilts towards X or Y');
    await page.fill('[data-sec-tilt-b]', '20');
    const tilt = await page.evaluate(() => { const c = window.bimcraftSection.get(), v = document.querySelector('[data-canvas]').viewer; const n = v.section.planes[5].normal; return { t: c.cells[0].tilt.z1, n: n.toArray() }; });
    ok(tilt.t && tilt.t[1] === 20 && Math.abs(tilt.n[1] + Math.cos(Math.PI / 9)) < 1e-6, 'Box 1\'s top leans 20° towards Y (the plane turned with it: ' + tilt.n.map((x) => x.toFixed(3)) + ')');
    await shot(page, 'wl1-04-tilted-top');
    await page.click('[data-sec-tilt-level]');
    ok(!(await page.evaluate(() => window.bimcraftSection.get().cells[0].tilt.z1)), 'Square puts the face back');
    // an extra plane
    await page.click('[data-sec-plane-add]');
    s = await sec();
    ok(s.planes === 13 && s.groups.join() === '7,6' && (await page.$$('[data-sec-plane-row]')).length === 1, 'Add a plane: Box 1 has seven planes, one row to set it');
    await page.fill('[data-sec-plane-row="0"] [data-pl="az"]', '180');
    await page.fill('[data-sec-plane-row="0"] [data-pl="off"]', '1');
    const pl = await page.evaluate(() => window.bimcraftSection.get().cells[0].planes[0]);
    ok(pl.az === 180 && pl.off === 1 && pl.el === 0, 'typed: faces 180°, 1 m from the centre (' + JSON.stringify(pl) + ')');
    const keep = await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer, lo = v.box.min; const P = (x, y, z) => [lo.x + x, lo.y + z, v.box.max.z - y]; return [v.keeps(P(1, 3, 1)), v.keeps(P(7, 3, 1)), v.keeps(P(9, 3, 4))]; });
    ok(!keep[0] && keep[1] && keep[2], 'the plane takes away Box 1 west of X 4 m; Box 2 still keeps its own space (' + keep + ')');
    await shot(page, 'wl1-05-extra-plane');
    await page.click('[data-sec-plane-row="0"] [data-sec-plane-remove]');
    ok((await sec()).planes === 12, 'the plane removed');
    // an issue with two boxes keeps the first
    await page.click('[data-rtab="issues"]');
    await page.click('[data-bcf-new]');
    await page.fill('[data-bcf-f-title]', 'L-shaped cut');
    await page.click('[data-bcf-form] button[type="submit"]');
    await waitStatus(/^Created the issue/);
    ok(/first box of the section volume/.test(await statusOf()), 'New issue: the status says the issue keeps the first box');
    const vp = await page.evaluate(() => window.bimcraftIssues.capture());
    ok(vp.clipping.length === 6, 'its viewpoint has Box 1\'s six planes');
    // Box 2 removed
    await page.selectOption('[data-sec-cell]', '1');
    await page.click('[data-sec-cell-remove]');
    s = await sec();
    ok(s.cells === 1 && s.planes === 6 && await page.isHidden('[data-sec-cell-remove]'), 'Remove this box: one box, six planes, nothing more to remove');
    // a tilted cut through an issue comes back as a volume
    await page.selectOption('[data-sec-tilt-face]', 'x1');
    await page.fill('[data-sec-tilt-a]', '30');
    await page.click('[data-bcf-new]');
    await page.fill('[data-bcf-f-title]', 'Tilted cut');
    await page.click('[data-bcf-form] button[type="submit"]');
    await waitStatus(/^Created the issue/);
    await page.evaluate(() => window.bimcraftSection.set(null));
    const tilted = await page.evaluate(() => window.bimcraftIssues.list().find((x) => x.title === 'Tilted cut').guid);
    await page.evaluate((g) => window.bimcraftIssues.show(g), tilted);
    const back = await page.evaluate(() => { const c = window.bimcraftSection.get(); return c && { axis: c.axis, planes: c.cells?.[0].planes.length, clip: document.querySelector('[data-canvas]').viewer.clip.length }; });
    ok(back && back.axis === 'box' && back.planes === 6 && back.clip === 12, 'Show: the tilted cut comes back as a volume (the whole model cut by its six planes): ' + JSON.stringify(back));
    ok(!/not lined up/.test(await statusOf()), 'and the status no longer says its planes are skipped');
    await shot(page, 'wl1-06-issue-back');
    await page.click('[data-sec-off]');
  }
  if (want('caps')) {
    // Discord, 2026-10-14 (PokeJohn): with a section, open elements (tree foliage, single-sided panels) were painted
    // in the cut colour, depending on the view. An open sheet inside the box must keep its own colour; closed solids
    // are still filled where cut (caps-closed.js + the parity stencil in viewer3d.js updateCaps).
    console.log('== section caps leave open elements alone');
    await page.click('[data-view="iso"]');
    if (!(await page.evaluate(() => document.querySelector('[data-canvas]').viewer.clip.length))) {
      await page.click('[data-toggle="section"]');
      await page.click('[data-sec-axis="box"]');
    }
    await slide('[data-box-axis="z"] [data-box-to]', 2.5);
    if (process.env.CAPS_DEBUG) await page.evaluate(() => { window.__capsKeep = true; });
    const r = await page.evaluate(async () => {
      const v = document.querySelector('[data-canvas]').viewer, m0 = v.meshes.find((m) => !m.userData.space);
      const Geo = m0.geometry.constructor, Attr = m0.geometry.getAttribute('position').constructor, Mesh = m0.constructor;
      // a flat, single-sided sheet 1 m up (the viewer is Y-up), under the 2.5 m cut, facing up
      const lo = v.box.min, hi = v.box.max, y = lo.y + 1.0;
      const P = new Float32Array([lo.x, y, lo.z, lo.x, y, hi.z, hi.x, y, hi.z, hi.x, y, lo.z]);
      const I = new Uint32Array([0, 1, 2, 0, 2, 3]);
      const cv = v.renderer.domElement;
      const [tr, tg, tb] = v.colors.cap.getStyle().match(/\d+/g).map(Number);
      const frame = () => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
      const measure = async () => {
        v.render(); await frame();
        const g = document.createElement('canvas'); g.width = cv.width; g.height = cv.height; const gc = g.getContext('2d'); gc.drawImage(cv, 0, 0);
        const d = gc.getImageData(0, 0, cv.width, cv.height).data;
        let capPx = 0, greenPx = 0;
        for (let k = 0; k < d.length; k += 4) {
          if (Math.abs(d[k] - tr) < 12 && Math.abs(d[k + 1] - tg) < 12 && Math.abs(d[k + 2] - tb) < 12) capPx++;
          if (d[k + 1] > 120 && d[k + 1] > d[k] * 1.8 && d[k + 1] > d[k + 2] * 1.8) greenPx++;
        }
        return { cap: capPx / (d.length / 4), green: greenPx / (d.length / 4) };
      };
      const before = await measure();
      const geo = new Geo(); geo.setAttribute('position', new Attr(P, 3)); geo.setIndex(new Attr(I, 1)); geo.computeVertexNormals(); geo.addGroup(0, 6, 0);
      const sheet = new Mesh(geo, m0.material.map((x) => x.clone()));
      sheet.material[0].color.setRGB(0.05, 0.75, 0.05); sheet.material[0].transparent = false; sheet.material[0].opacity = 1;
      sheet.userData = { batch: { positions: P, indices: I, triIds: [999999, 999999] }, triIds: [999999, 999999], nSolid: 2, color: sheet.material[0].color };
      m0.parent.add(sheet); v.meshes.push(sheet);
      v.updateCaps();
      const after = await measure();
      const open = sheet.userData.batch.openIds && sheet.userData.batch.openIds.has(999999);
      if (window.__capsKeep) return { before, after, open };
      sheet.removeFromParent(); v.meshes.pop(); v.updateCaps();
      return { before, after, open };
    });
    if (process.env.CAPS_DEBUG) await shot(page, 'caps-debug');
    ok(r.open, 'a single-sided sheet is seen as open (left out of the cut fill)');
    ok(r.after.green > 0.01 && r.after.cap <= r.before.cap + 0.005, 'an open sheet inside the section keeps its own colour; the cut colour does not spread over it (cut colour ' + (r.before.cap * 100).toFixed(2) + '% → ' + (r.after.cap * 100).toFixed(2) + '% of the view; the sheet shows on ' + (r.after.green * 100).toFixed(1) + '%)');
    ok((await capShare()) > 0.001, 'closed solids are still filled where cut');
  }

  if (want('wl2')) {
    console.log('== WL.2 section box from the pick, grips');
    await page.evaluate(() => { window.bimcraftSection.set(null); const d = document.querySelector('[data-sec-shape]'); if (d) d.open = false; });   // WL.1 may have left it open
    await page.click('[data-settings-open]');
    await page.waitForSelector('dialog[data-app-settings][open]');
    await page.click('[data-settings-tab="app"]');
    ok((await page.inputValue('input[name="bcBoxMargin"]')) === '300', 'Settings › BimCraft › Section box: room round the pick 300 mm by default');
    await page.fill('input[name="bcBoxMargin"]', '1000');
    await page.press('input[name="bcBoxMargin"]', 'Tab');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('bimcraft.settings')).boxMargin);
    ok(stored === 1000, 'set to 1000 mm: stored (' + stored + ')');
    await shot(page, 'wl2-01-settings');
    await page.keyboard.press('Escape');
    const w101 = await keyOf('W-101');
    await page.evaluate((k) => window.bimcraftVis.pick([k]), w101);
    await openVis();
    await page.click('[data-vis="secbox"]');
    await waitStatus(/^The box is round the picked element, with 1000 mm to spare/);
    let b = await page.evaluate(() => window.bimcraftSection.get().box);
    ok(Math.abs(b.max[2] - b.min[2] - 4) < 0.05 && Math.abs(b.min[2]) < 1e-9, 'Show › Section box round the pick: the 3 m wall + 1 m above, clamped at the bottom (Z ' + b.min[2].toFixed(2) + ' – ' + b.max[2].toFixed(2) + ')');
    await page.evaluate(() => window.bimcraftSection.set(null));
    await page.evaluate((k) => window.bimcraftVis.pick([k]), w101);
    await press('Shift+X');
    await waitStatus(/^The box is round the picked element/);
    ok((await page.evaluate(() => window.bimcraftSection.get()?.axis)) === 'box', 'Shift+X does the same');
    // grips: back to the whole model, seen from the top
    await page.click('[data-sec-box-all]');
    await page.evaluate(() => window.bimcraftVis.pick([]));
    await page.click('[data-view="top"]');
    const grips = await page.evaluate(() => document.querySelector('[data-canvas]').viewer.grips.map((g) => g.id));
    ok(grips.length === 26, '26 grips on the box (' + grips.length + ')');
    const gripAt = (id) => page.evaluate((gid) => { const v = document.querySelector('[data-canvas]').viewer, g = v.grips.find((x) => x.id === gid), lo = v.box.min, hi = v.box.max; return v.project([lo.x + g.p[0], lo.y + g.p[2], hi.z - g.p[1]]); }, id);
    const camNow = () => page.evaluate(() => document.querySelector('[data-canvas]').viewer.camera.position.toArray().map((x) => +x.toFixed(4)).join());
    const drag = async (from, dx, dy) => { await page.mouse.move(from.x, from.y); await page.mouse.down(); for (let k = 1; k <= 6; k++) await page.mouse.move(from.x + dx * k / 6, from.y + dy * k / 6); await page.mouse.up(); };
    const size = await page.evaluate(() => document.querySelector('[data-canvas]').viewer.sizeIfc());
    const onCanvas = (pt) => page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.matches('[data-canvas]'), pt);
    const pc = await gripAt('x1y0z1');
    ok(await onCanvas(pc), 'the south-east corner grip is in view (not under the section bar)');
    await page.mouse.move(pc.x, pc.y);
    ok((await page.evaluate(() => document.querySelector('[data-canvas]').style.cursor)) === 'move', 'over a grip the pointer is a move cursor');
    const cam0 = await camNow();
    await drag(pc, -120, -80);
    b = await page.evaluate(() => window.bimcraftSection.get().box);
    ok(b.max[0] < size[0] - 0.5 && b.min[1] > 0.5 && Math.abs(b.max[2] - size[2]) < 1e-9 && b.min[0] === 0 && Math.abs(b.max[1] - size[1]) < 1e-9, 'Top: the south-east corner dragged in → X to and Y from both move in, Z and the far faces stay (' + JSON.stringify(b) + ')');
    ok((await camNow()) === cam0 && (await pickedKeys()).length === 0, 'the drag did not turn the view or pick anything');
    ok(/^Section box: X 0 – /.test(await statusOf()), 'the status gives the box: ' + await statusOf());
    await shot(page, 'wl2-02-corner-dragged-top');
    await page.click('[data-view="front"]');
    const pe = await gripAt('x0z0');
    ok(await onCanvas(pe), 'the bottom-left edge grip is in view');
    await drag(pe, 90, -70);
    const b2 = await page.evaluate(() => window.bimcraftSection.get().box);
    ok(b2.min[0] > 0.5 && b2.min[2] > 0.5 && Math.abs(b2.max[0] - b.max[0]) < 1e-9 && Math.abs(b2.min[1] - b.min[1]) < 1e-9 && Math.abs(b2.max[2] - b.max[2]) < 1e-9, 'Front: the X-from/Z-from edge moves X from and the bottom together, the rest stays (' + JSON.stringify(b2) + ')');
    const pf = await gripAt('x1');
    ok(await onCanvas(pf), 'the X-to face grip is in view');
    await drag(pf, -60, -40);
    const b3 = await page.evaluate(() => window.bimcraftSection.get().box);
    ok(b3.max[0] < b2.max[0] - 0.3 && b3.min[2] === b2.min[2] && b3.min[0] === b2.min[0], 'a face grip moves only its face (X to ' + b2.max[0].toFixed(2) + ' → ' + b3.max[0].toFixed(2) + ')');
    const sliders = await page.evaluate(() => Number(document.querySelector('[data-box-axis="x"] [data-box-to]').value));
    ok(Math.abs(sliders - b3.max[0]) < 0.02, 'the X slider follows the grip');
    await shot(page, 'wl2-03-grips-front');
    await page.click('[data-sec-axis="top"]');
    ok((await page.evaluate(() => document.querySelector('[data-canvas]').viewer.grips)) === null, 'a section plane has no grips');
    await page.click('[data-sec-off]');
  }

  if (want('wl3')) {
    console.log('== WL.3 copy property values');
    await page.click('[data-rtab="props"]');   // an earlier section may have left another tab showing
    const clip = () => page.evaluate(() => navigator.clipboard.readText());
    await openFile(fixtureFile());
    await page.click('[data-view="iso"]');
    const w101 = await keyOf('W-101');
    await clickPick(w101);
    await page.waitForFunction(() => /W-101/.test(document.querySelector('[data-props]').textContent));
    const guid = await page.evaluate(() => { const dts = [...document.querySelectorAll('[data-props] dt')]; return dts.find((d) => d.textContent === 'GlobalId').nextElementSibling.querySelector('.bc-copy-text-val').textContent; });
    ok(/^[0-9A-Za-z_$]{22}$/.test(guid), 'Properties shows W-101\'s GlobalId (' + guid + ')');
    const nCopy = await page.$$eval('[data-props] [data-copy-value]', (bs) => bs.length);
    ok(nCopy >= 8, 'every filled value has a copy button (' + nCopy + ')');
    ok(!/null/.test(await page.textContent('[data-props]')), 'empty values show no stray "null" (no copy button on them)');
    await page.hover('[data-props] [data-copy-value="GlobalId"]');
    await shot(page, 'wl3-01-copy-buttons');
    await page.click('[data-props] [data-copy-value="GlobalId"]');
    await waitStatus(/^Copied GlobalId: /);
    ok((await clip()) === guid, 'the GlobalId\'s button copies it exactly');
    const cost = await page.evaluate(() => [...document.querySelectorAll('[data-props] [data-copy-value="Cost"]')].length);
    await page.click('[data-props] [data-copy-value="Cost"] >> nth=0');
    ok(cost > 0 && (await clip()) === '1250.5', 'a property set value (Fixture_Data Cost) copies as shown: ' + await clip());
    await page.click('[data-props] [data-copy-value="Name"]');
    ok((await clip()) === 'W-101' && !(await page.$('[data-props] input.bc-input')), 'the editable Name copies too, and copying does not start an edit');
    await page.click('[data-props-copy-text]');
    await waitStatus(/^Copied every value of W-101 as text/);
    const txt = await clip();
    ok(txt.startsWith('Wall: W-101\n') && txt.includes('GlobalId: ' + guid) && /Cost: 1250\.5/.test(txt), 'Copy all: the element as text');
    await page.click('[data-props-copy-csv]');
    await waitStatus(/^Copied every value of W-101 as CSV/);
    const csv = await clip();
    ok(csv.startsWith('Group,Property,Value\r\nElement,Class,') && csv.includes('Element,GlobalId,' + guid + '\r\n') && /\r\n[^,]+,Cost,1250\.5\r\n/.test(csv), 'Copy as CSV: group, property, value rows (CRLF), the GlobalId and Cost among them');
    // a second model: its element is read only here, but its values copy all the same
    await page.setInputFiles('[data-model-input]', fixtureFile({ shift: 100000, rev: 'b' }, 'bimcraft-fixture-b.ifc'));
    await waitStatus(/^Added bimcraft-fixture-b\.ifc/);
    await page.click('[data-view="iso"]');
    const w203 = await page.evaluate(() => window.bimcraftKeys('W-203', 1));
    await clickPick(w203);
    await page.waitForSelector('[data-props] [data-foreign]');
    await page.click('[data-props] [data-copy-value="GlobalId"]');
    const g2 = await clip();
    ok(/^[0-9A-Za-z_$]{22}$/.test(g2) && g2 !== guid, 'an element of the other model: its GlobalId copies (' + g2 + ')');
    await page.click('[data-props-copy-csv]');
    const csv2 = await clip();
    ok(csv2.startsWith('Model,Group,Property,Value\r\nbimcraft-fixture-b.ifc,Element,Class,') && csv2.includes('W-203'), 'its CSV starts with a Model column naming its file');
    await shot(page, 'wl3-02-other-model');
  }

  if (want('wl4')) {
    console.log('== WL.4 latitude and longitude of a picked point');
    const { GEOREF } = await import('./ifc-fixture.mjs');
    const CRS = await import(path.join(REPO, 'public_html/assets/apps/bimcraft/dev/crs.js')).catch(() => null);
    void CRS;
    const py = (code) => JSON.parse(execFileSync(path.join(REPO, 'tools/civilcraft-test/venv/bin/python'), ['-c', code], { encoding: 'utf8' }));
    await openFile(fixtureFile({ georef: 'map' }, 'bimcraft-georef.ifc'));
    await page.click('[data-view="iso"]');
    const w101 = await keyOf('W-101');
    const spot = await spotOf(w101);
    await press('m');
    await page.click('[data-measure-mode="point"]');
    await waitStatus(/^Click a point on the model/);
    await page.mouse.click(spot.x, spot.y);
    await waitStatus(/^(Location found|Moving from)/, 30000);
    const st = await page.evaluate(() => window.bimcraftMeasure.state());
    // later clicks: a spot on W-101 the (now taller) Measure bar does not cover
    const freeSpot = await page.evaluate((k) => {
      const v = document.querySelector('[data-canvas]').viewer, c = v.screenOf(k);
      for (let r = 0; r <= 300; r += 6) for (let a = 0; a < 360; a += r ? 15 : 360) {
        const x = c.x + r * Math.cos(a * Math.PI / 180), y = c.y + r * Math.sin(a * Math.PI / 180);
        if (document.elementFromPoint(x, y)?.matches('[data-canvas]') && v.hitAt(x, y)?.id === k) return { x, y };
      }
      return null;
    }, w101);
    ok(!!freeSpot, 'a spot on W-101 clear of the Measure bar');
    const it = st.items[st.items.length - 1];
    const P = await page.evaluate(({ a, k }) => window.bimcraftMeasure.fileOf(a, k), { a: it.a, k: w101 });
    ok(P[1] > -101 && P[1] < 101 && P[0] >= -1 && P[0] <= 10001 && P[2] >= -1 && P[2] <= 3001, 'the click is on W-101 in the file\'s own coordinates (mm): ' + P.map((v) => v.toFixed(1)).join(', '));
    const r = GEOREF.rotationDeg * Math.PI / 180, s0 = GEOREF.scale;
    const E = GEOREF.e + s0 * (Math.cos(r) * P[0] - Math.sin(r) * P[1]), N = GEOREF.n + s0 * (Math.sin(r) * P[0] + Math.cos(r) * P[1]), H = GEOREF.h + P[2] * 0.001;
    const o = py(`import json,pyproj; t=pyproj.Transformer.from_crs(28356,4283,always_xy=True); print(json.dumps(t.transform(${E},${N})))`);
    ok(it.lonlat && Math.abs(it.lonlat[0] - o[0]) < 1e-8 && Math.abs(it.lonlat[1] - o[1]) < 1e-8, 'latitude and longitude = PROJ\'s for that point (EPSG:28356 → lat/long; WGS 84 = GDA94 within its 3 m shift): ' + (it.lonlat || []).map((v) => v.toFixed(8)).join(', '));
    const out = await page.textContent('[data-measure-out]');
    ok(out.includes('(WGS 84)') && out.includes('E ' + E.toFixed(3)) && out.includes('N ' + N.toFixed(3)) && out.includes('EPSG:28356') && out.includes('AHD') && out.includes('datum: GDA94') && /° \d\d′ [\d.]+″ [NS], \d+° \d\d′ [\d.]+″ [EW]/.test(out), 'the bar: lat/long in WGS 84 (and as degrees, minutes, seconds), E/N on EPSG:28356, height (AHD) ' + H.toFixed(3) + ' m, the file\'s datum GDA94');
    ok(out.includes('height ' + H.toFixed(3)), 'height on the map: ' + H.toFixed(3) + ' m');
    ok(/^Moving from GDA94 to another datum is good to about 3 m/.test(await statusOf()), 'the status says how good the datum move is: ' + await statusOf());
    await page.click('[data-measure-copy]');
    ok((await page.evaluate(() => navigator.clipboard.readText())).startsWith('Lat '), 'Copy puts the location on the clipboard');
    await shot(page, 'wl4-01-location');
    // the display system is a setting
    await page.click('[data-settings-open]');
    await page.waitForSelector('dialog[data-app-settings][open]');
    await page.click('[data-settings-tab="app"]');
    ok((await page.inputValue('select[name="bcGeoCrs"]')) === '4326', 'Settings › Location: WGS 84 to start');
    await page.selectOption('select[name="bcGeoCrs"]', '4269');
    await page.keyboard.press('Escape');
    ok(!(await page.$('dialog[data-app-settings][open]')) && (await page.evaluate(() => window.bimcraftMeasure.state()?.mode)) === 'point', 'Esc closes Settings and leaves Measure › Location on');
    await page.mouse.click(freeSpot.x, freeSpot.y);
    await waitStatus(/^(Location found|Moving from)/, 30000);
    ok((await page.textContent('[data-measure-out]')).includes('(NAD83)'), 'set to NAD83: the latitude and longitude say NAD83');
    await page.click('[data-settings-open]');
    await page.click('[data-settings-tab="app"]');
    await page.selectOption('select[name="bcGeoCrs"]', 'file');
    await page.keyboard.press('Escape');
    await page.mouse.click(freeSpot.x, freeSpot.y);
    await waitStatus(/^Location found/, 30000);
    ok((await page.textContent('[data-measure-out]')).includes('(GDA94, the file\'s own datum)'), 'the file\'s own datum: named GDA94');
    await page.click('[data-measure-done]');
    // only the site's latitude / longitude
    await openFile(fixtureFile({ georef: 'site' }, 'bimcraft-site.ifc'));
    await page.click('[data-view="iso"]');
    const s2 = await spotOf(await keyOf('W-101'));
    await press('m');
    await page.click('[data-measure-mode="point"]');
    await page.mouse.click(s2.x, s2.y);
    await waitStatus(/^The file has no map coordinates/, 30000);
    const st2 = await page.evaluate(() => window.bimcraftMeasure.state());
    const ll2 = st2.items[st2.items.length - 1].lonlat;
    ok(ll2 && Math.abs(ll2[1] - GEOREF.latDeg) < 0.001 && Math.abs(ll2[0] - GEOREF.lonDeg) < 0.001 && (await page.textContent('[data-measure-out]')).includes('from the site\'s latitude and longitude'), 'a site-only file: a position next to the site\'s own latitude and longitude, marked approximate (' + (ll2 || []).map((v) => v.toFixed(6)).join(', ') + ')');
    await shot(page, 'wl4-02-site');
    await page.click('[data-measure-done]');
    await openFile(fixtureFile());
    await page.click('[data-view="iso"]');
    const s3 = await spotOf(await keyOf('W-101'));
    await press('m');
    await page.click('[data-measure-mode="point"]');
    await page.mouse.click(s3.x, s3.y);
    await waitStatus(/has no georeference/);
    ok(true, 'a model with no georeference says so: ' + await statusOf());
    await page.click('[data-measure-done]');
  }

  if (want('wl5')) {
    console.log('== WL.5 color schemes');
    const colorOf = (k) => page.evaluate((key) => window.bimcraftColor.legend()?.colorOf.get(key) || null, k);
    await openFile(fixtureFile());
    await page.click('[data-view="iso"]');
    await page.click('[data-rtab="color"]');
    await page.waitForSelector('[data-color-field]');
    await page.selectOption('[data-color-field]', 'cls');
    await waitStatus(/^Colored by Class/);
    ok(await page.$$eval('[data-legend] [data-legend-color]', (is) => is.length) === 5 && await page.isVisible('[data-color-save]') && await page.isVisible('[data-color-open]'), 'each legend row has a swatch to change its color; Save scheme and Open scheme… are there');
    const doorRow = await page.$$eval('[data-legend] li', (ls) => ls.findIndex((l) => /Door/.test(l.textContent)));
    await page.$eval('[data-legend-color="' + doorRow + '"]', (i) => { i.value = '#00aa44'; i.dispatchEvent(new Event('change', { bubbles: true })); });
    await waitStatus(/^Color changed/);
    const door = await keyOf('D-101');
    ok((await colorOf(door)) === '#00aa44', 'the door\'s swatch set to green: the door is painted #00aa44');
    await shot(page, 'wl5-01-door-green');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-color-save]')]);
    const saved = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
    ok(dl.suggestedFilename() === 'Class colors.json' && saved.format === 'bimcraft-color-scheme' && saved.field.id === 'cls' && saved.values.find((v) => v.value === 'IfcDoor')?.color === '#00aa44' && saved.values.length === 5, 'Save scheme: "Class colors.json" with the five values and the green door');
    // a revision with W-104 gone and W-203 added: same classes; the scheme without IfcSlab gives its slab "not in the scheme"
    saved.values = saved.values.filter((v) => v.value !== 'IfcSlab').concat([{ value: 'IfcColumn', color: '#123456' }]);
    await openFile(fixtureFile({ rev: 'b' }, 'bimcraft-fixture-b.ifc'));
    await page.click('[data-rtab="color"]');
    await page.setInputFiles('[data-color-input]', { name: 'Class colors.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(saved)) });
    await waitStatus(/^Colored by Class from the scheme/);
    ok(/1 value here is not in the scheme/.test(await statusOf()), 'Open scheme… on revision b: ' + await statusOf());
    const door2 = await keyOf('D-101');
    ok((await colorOf(door2)) === '#00aa44', 'the door is green in this model too');
    const rows = await page.$$eval('[data-legend] li', (ls) => ls.map((l) => l.querySelector('.bc-lv').textContent + ' ' + l.querySelector('.n').textContent));
    ok(rows.includes('Column 0') && rows.some((r) => /^1 value not in the scheme 1$/.test(r)), 'IfcColumn listed with 0; the slab under "1 value not in the scheme": ' + rows.join(', '));
    await shot(page, 'wl5-02-scheme-on-rev-b');
    await page.evaluate(() => { document.documentElement.dataset.space = 'model'; });
    await page.waitForTimeout(200);
    ok((await colorOf(door2)) === '#00aa44' && (await page.evaluate(() => !!window.bimcraftColor.scheme())), 'the model theme keeps the scheme\'s colors');
    await shot(page, 'wl5-03-scheme-model');
    await page.evaluate(() => { document.documentElement.dataset.space = 'paper'; });
    await page.setInputFiles('[data-color-input]', { name: 'notes.json', mimeType: 'application/json', buffer: Buffer.from('{"hello": 1}') });
    await waitStatus(/^This file is not a BimCraft color scheme/);
    ok((await colorOf(door2)) === '#00aa44', 'a file that is not a scheme is refused, the colors stay');
    await page.click('[data-color-off]');
  }

  if (want('db11')) {
    console.log('== DB.11 dynamic block states in BimCraft and ModelCraft');
    const sample = path.join(REPO, '..', 'testfiles', 'dwg-samples', 'blocks_and_tables_-_imperial.dwg');
    if (!fs.existsSync(sample)) console.log('  skip: AutoCAD\'s blocks sample is not on this machine');
    else {
      await page.click('[data-rtab="props"]');   // an earlier section may have left another tab showing
      await page.setInputFiles('[data-file]', sample);
      await waitStatus(/^Opened /, 90000);
      await page.waitForSelector('[data-dyn-blocks]');
      const rec = await page.textContent('[data-dyn-block="Receptacle"]');
      ok(/Receptacle/.test(rec) && /45 placed/.test(rec) && /Shown as: Duplex \(38\), GFI/.test(rec) && /GFI \(7\)/.test(rec) && /Visibility states: Duplex, GFI/.test(rec), 'the drawing panel lists Receptacle: 45 placed, shown as Duplex (38) and GFI (7), its states: ' + rec.replace(/\s+/g, ' '));
      ok((await page.$$('[data-dyn-blocks] [data-dyn-block]')).length === 11, 'every dynamic block placed in model space is listed (11)');
      await shot(page, 'db11-01-panel');
      // the model-space index of a Sink reference showing "Kitchen - Plan" (the reader's order = the 3D owners' order)
      const { readDwg } = await import(path.join(REPO, 'public_html/assets/apps/bimcraft/dev/dwg/read.js'));
      const md = readDwg(new Uint8Array(fs.readFileSync(sample)));
      const msEnts = md.blocks.find((b) => /^\*model_space$/i.test(b.name)).entities;
      const idx = msEnts.findIndex((e) => e.type === 'INSERT' && e.dyn?.state === 'Kitchen - Plan');
      await page.keyboard.press('3');
      await page.waitForFunction(() => document.querySelector('[data-dwg3d-canvas]')?.view?.model, null, { timeout: 60000 });
      await page.evaluate((i) => window.bimcraftPick3d(i), idx);
      await page.waitForSelector('[data-dwg-pick]');
      const pr = await page.textContent('[data-props]');
      ok(/INSERT of a dynamic block/.test(pr) && /Sink/.test(pr) && /State shown\s*Kitchen - Plan/.test(pr) && /Other states\s*Bathroom - Plan, Bathroom - Front/.test(pr), 'a picked Sink in 3D: dynamic block Sink, state shown Kitchen - Plan, other states Bathroom - Plan, Bathroom - Front');
      await shot(page, 'db11-02-pick');
      await page.keyboard.press('3');
      // ModelCraft: the same drawing imported as a site plan
      const mp = await ctx.newPage();
      mp.on('console', (m) => { if (m.type() === 'error') problems.push('modelcraft console: ' + m.text()); });
      await mp.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
      await mp.setInputFiles('[data-file-import]', sample);
      const askBtn = await mp.waitForSelector('dialog[open] button', { timeout: 20000 }).catch(() => null);
      if (askBtn) { const ft = await mp.$('dialog[open] button:has-text("Feet"), dialog[open] button:has-text("feet")'); if (ft) await ft.click(); else await askBtn.click(); }
      await mp.waitForFunction(() => /Dynamic blocks, as the drawing shows them/.test(document.body.textContent), null, { timeout: 90000 });
      const msg = await mp.evaluate(() => [...document.querySelectorAll('[data-msg], .mc-msg, [role="status"]')].map((x) => x.textContent).find((x) => /Dynamic blocks/.test(x)) || document.body.textContent.match(/Dynamic blocks, as the drawing shows them:[^.]*\./)?.[0] || '');
      ok(/Receptacle shown as Duplex ×38, GFI ×7 \(states: Duplex, GFI\)/.test(msg), 'ModelCraft\'s import status lists the dynamic blocks as shown, with their states: ' + msg.slice(0, 200));
      await mp.screenshot({ path: path.join(SHOTS, 'db11-03-modelcraft.png') });
      await mp.close();
    }
  }

} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
  await shot(page, 'zz-failure').catch(() => {});
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
for (const p of problems) { fail++; console.log('  FAIL ' + p); }
console.log(fail ? '\n' + fail + ' FAILED, ' + pass + ' passed' : '\nall ' + pass + ' browser checks passed (shots: ' + SHOTS + ')');
process.exit(fail ? 1 : 0);

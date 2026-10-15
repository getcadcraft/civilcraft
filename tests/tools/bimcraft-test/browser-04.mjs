#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-04.mjs — BimCraft's 0.4 items in the lab, headless, with real clicks and keys. Grows one section per finished
 * item (0.4 session `bim`). Opens the generated IFC fixture (tools/bimcraft-test/ifc-fixture.mjs): no client files.
 *   node tools/bimcraft-test/browser-04.mjs [--shots <dir>] [--only b12,b1,…]
 * Run as root: signs in with BimCraft's own test admin (tools/bimcraft-test/admin.php up|down, disabled again at the
 * end) and drives the cached Playwright Chromium. The admin-login throttle (10 / 10 min for 127.0.0.1) is shared: run
 * it once per finished item. Fails on any console error.
 *
 *   B12  Show group: disabled with reasons, Ctrl+click picks two, H hides them (picking goes past them), Shift+H shows all,
 *        I isolates, T shows the rest see-through and clicks go through it, both themes
 *   B1   Delete (key and menu; a door takes its opening, the wall closes), Undo, Select all, Copy → Paste by a click,
 *        Paste in place beside, Cut two → Paste in place where they were, Duplicate, spaces refused, Save as IFC →
 *        no missing references in the download
 *   B2   a drawing in 3D (tools/bimcraft-test/fixtures/dwg3d-acad2018.dwg): click a block reference → its properties,
 *        Ctrl+click a 3D face → two picked, a line by a click near it, Esc, a layer turned off cannot be picked
 *   B13  the model tree: opened down to the storeys, groups by class, a storey's checkbox hides it (mixed above), a
 *        storey's name picks its elements, its info button its own properties, a pick in 3D opens the tree to it,
 *        keys (arrows, Space), double-click zooms, the stair row deletes the stair and its flights, Undo
 *   B15  Color tab: fields listed, Class → 5 values painted, a value isolates, Ctrl+click adds, Shift+H, a number field with
 *        "No value", the model theme recolors, Off
 *   B16  a second model (the fixture's site 100 m east, revision b) added beside the first: placed 100 m away, its element
 *        picks read only, "Edit that model" makes it active (tree, changes), a delete saved from it alone, hide it, move it,
 *        removing it with unsaved changes asks
 *   B3   a section plane on the drawing's 3D view: Section on its bar, offset in drawing units, a cut-away block cannot be
 *        picked, Flip, Front, X turns it off, leaving 3D drops it
 *   B4   section box on an IFC model: Box in the bar, six planes, the Z "to" slider lowered to under Level 2 hides the
 *        upper walls from picking, "Box round the pick", Whole model, Top goes back to one plane, not offered for drawings
 *   B5   filled cut faces: a Top cut through Level 1 seen from above shows the walls' cut in the cut color (pixels counted),
 *        Fill off shows them hollow, the section box fills too, both themes
 *   B6   Measure (M): two clicks near W-102's top corners snap to them → 6.000 m, ΔY 6; Face area on its side → 18 m²;
 *        labels follow; measuring does not pick; Esc drops a half-made distance, then stops
 *   B7   the kitchen fixture in 3D: its texts and attributes drawn (text meshes), a click on a text picks its entity
 *   B8   a binary DXF says what it is and what to do; the 3D fixture's polyface and mesh are no longer "Not drawn yet" in 2D
 *   B9   Issues: a new issue from a view (W-101 picked, W-102 hidden, cut at 1.5 m), the view changed, Show puts it all back;
 *        Save BCF → valid against the BCF 2.1 schemas (bcf_check.py) with the GlobalIds and the plane; Open BCF reads it back
 *   B14  Find: Class is IfcDoor → 1 picked; two rules (walls, Cost > 1000) → 3; saved as a set, used again after a reload
 *   B17  Clash check: walls against everything in the worker → the 9 clashes Node finds, deepest first; a row isolates the
 *        pair see-through; "Make an issue of it" opens the issue form with the title filled in
 *   B18  Walk: click on the Level 2 slab → the eye 1.6 m over it; W walks toward W-201 and stops short of it (collision);
 *        gravity off + E rises, gravity on again drops back; Esc stops
 *   B19  Model checks on the fixture with problems: a wall rule (Fixture_Data.Cost) → W-105 bare; GlobalId twice, no storey,
 *        stacked each found; clicking a result picks it; the rule is kept after a reload
 *   B20  Quantity totals: by Class with the wall quantities ticked → Wall row 6 / 48000 mm; + Storey; the pick only;
 *        the CSV downloaded and read back (header, rows, total, BOM)
 *   B21  Compare versions: the fixture + revision b (same place) → W-104 removed, W-203 added, W-201 and the desk changed,
 *        painted, the rest see-through; a list row picks; CSV; Clear restores; removing a model clears it
 *   B10  Schedules: spaces now load (the Spaces button shows the room); Show Spaces → 101, 53.76 m² measured (italic), CSV;
 *        One row per element → a row per element with its GlobalId in the CSV
 *   B22  4D schedule: the template downloads; a task CSV opens (a row that matches nothing is reported); day 1 → Level 1 in
 *        progress (ochre), Level 2 see-through; the slider to the end → all built, own colors; Play moves the date; Clear
 *   h15  Handoff (0.4 1.5): Edit in CadCraft through sendHandoff → CadCraft opens the drawing in the new tab, the address
 *        loses ?handoff; "Open in DetailCraft" on an IFC shows exactly when DetailCraft's build declares "accepts": ["handoff"],
 *        and then hands the model over
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureIfc } from './ifc-fixture.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : path.join(REPO, 'tmp/shots/bimcraft-04');
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
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.removeItem('bimcraft.settings'); localStorage.removeItem('bimcraft.clipboard'); });
  await page.reload({ waitUntil: 'networkidle' });
  await openFile(fixtureFile());
  ok(true, 'opened the generated fixture');

  if (want('b12')) {
    console.log('== B12 hide, isolate, see-through');
    const labels = await page.$$eval('[data-vis-menu] [data-vis]', (bs) => bs.map((b) => b.childNodes[0].textContent.trim() + ' [' + b.querySelector('kbd').textContent + ']'));
    ok(labels.join(', ') === 'Hide [H], Isolate [I], See-through [T], Section box round the pick [Shift+X], Show all [Shift+H]', 'the Show menu: ' + labels.join(', '));
    const rows = await page.$$eval('[data-toolbar] .bc-tool', (bs) => new Set(bs.filter((b) => b.offsetParent).map((b) => Math.round(b.getBoundingClientRect().top))).size);
    ok(rows <= 2, 'at 1440 px the toolbar is still two rows (' + rows + ')', rows <= 2 ? '' : await page.$$eval('[data-toolbar] .bc-tool', (bs) => bs.filter((b) => b.offsetParent).map((b) => { const r = b.getBoundingClientRect(); return b.textContent.trim().slice(0, 14) + '@' + Math.round(r.top) + '/' + Math.round(r.width); }).join(' ') + ' | bar ' + Math.round(document.querySelector('[data-toolbar]').getBoundingClientRect().width)));
    ok(await disabled('[data-vis="hide"]') && /Pick one or more/.test(await page.getAttribute('[data-vis="hide"]', 'title')), 'Hide is disabled until something is picked, the reason in its title');
    ok(await disabled('[data-vis="all"]') && /Nothing is hidden/.test(await page.getAttribute('[data-vis="all"]', 'title')), 'Show all is disabled while nothing is hidden');
    await openVis();
    await shot(page, 'b12-00-menu');
    await page.click('[data-vis="hide"]', { force: true });
    ok(/^Pick one or more/.test(await statusOf()) && !(await page.evaluate(() => document.querySelector('[data-vis-menu]').open)), 'clicking it anyway says why, and the menu closes');

    const w1 = await keyOf('W-101'), w2 = await keyOf('W-102'), door = await keyOf('D-101');
    ok(w1 && w2 && door, 'the fixture\'s walls and door have keys (' + [w1, w2, door].join(', ') + ')');
    const p1 = await spotOf(w2);
    await page.mouse.click(p1.x, p1.y);
    await page.waitForFunction(() => /W-102/.test(document.querySelector('[data-props]').textContent));
    const p2 = await spotOf(w1);
    await page.keyboard.down('Control'); await page.mouse.click(p2.x, p2.y); await page.keyboard.up('Control');
    await page.waitForFunction(() => document.querySelector('[data-pick-count]')?.dataset.pickCount === '2');
    ok(JSON.stringify((await pickedKeys()).sort()) === JSON.stringify([w1, w2].sort()), 'Ctrl+click adds W-101 to the pick: Properties says "2 elements picked"');
    ok(!(await disabled('[data-vis="hide"]')), 'Hide is enabled now');
    await openVis();
    await shot(page, 'b12-01-two-picked');
    await press('h');
    await waitStatus(/^Hid 2 elements/);
    ok((await page.evaluate(() => window.bimcraftVis.state().hidden.length)) === 2 && (await pickedKeys()).length === 0, 'H hides both and clears the pick: ' + await statusOf());
    const under = await hitKey(p1);
    ok(under !== w2 && under !== w1, 'a click where W-102 was no longer picks it (' + under + ')');
    ok(!(await disabled('[data-vis="all"]')), 'Show all is enabled');
    await shot(page, 'b12-02-hidden');
    await press('Shift+H');
    await waitStatus(/^Showing every element again/);
    ok((await page.evaluate(() => window.bimcraftVis.state().hidden.length)) === 0 && (await hitKey(p1)) === w2, 'Shift+H shows them again: W-102 picks again');

    const pd = await spotOf(door);
    await page.mouse.click(pd.x, pd.y);
    await page.waitForFunction(() => /D-101/.test(document.querySelector('[data-props]').textContent));
    await press('i');
    await waitStatus(/^Showing only the picked element/);
    const groups = await page.evaluate(() => document.querySelector('[data-canvas]').viewer.meshes.map((m) => m.geometry.groups.length));
    ok((await page.evaluate(() => window.bimcraftVis.state().isolated)).join() === String(door) && groups.every((g) => g === 1), 'I isolates the door: one draw group per batch, nothing see-through');
    const pw = p1;
    ok((await hitKey(pw)) === null, 'a click where another wall is picks nothing');
    await shot(page, 'b12-03-isolated');
    await press('t');
    await waitStatus(/the rest see-through/);
    const ghostGroups = await page.evaluate(() => document.querySelector('[data-canvas]').viewer.meshes.filter((m) => m.geometry.groups.length === 2).length);
    ok(ghostGroups > 0 && (await page.evaluate(() => window.bimcraftVis.state().ghost)), 'T: the others are drawn in a second, see-through group (' + ghostGroups + ' batches)');
    ok((await hitKey(pw)) === null, 'see-through walls do not catch clicks');
    await shot(page, 'b12-04-see-through-paper');
    await page.evaluate(() => { document.documentElement.dataset.space = 'model'; });
    await page.waitForTimeout(200);
    await shot(page, 'b12-05-see-through-model');
    await page.evaluate(() => { document.documentElement.dataset.space = 'paper'; });
    await openVis();
    await page.click('[data-vis="all"]');
    await waitStatus(/^Showing every element again/);
    ok(await page.evaluate(() => { const s = window.bimcraftVis.state(); return !s.ghost && s.isolated === null && s.hidden.length === 0; }), 'the Show all button clears it all');
    await press('Escape');
    ok((await pickedKeys()).length === 0, 'Esc clears the pick');
  }

  if (want('b1')) {
    console.log('== B1 delete, cut, select all, copy and paste any element');
    await openFile(fixtureFile());
    await page.click('[data-view="iso"]');
    const n0 = await elementCount();
    await openMore();
    ok(await disabled(item('delete')) && /Pick one or more elements first/.test(await page.getAttribute(item('delete'), 'title')), 'Delete: disabled until something is picked, the reason in its title');
    ok(await disabled(item('cut')) && !(await disabled(item('select-all'))), 'Cut disabled too; Select all is enabled');
    await page.keyboard.press('Escape');

    const w2 = await keyOf('W-102');
    await clickPick(w2);
    await page.waitForFunction(() => /W-102/.test(document.querySelector('[data-props]').textContent));
    await press('Delete');
    await waitStatus(/^Deleted 1 element/);
    ok((await keyOf('W-102')) === null && (await elementCount()) === n0 - 1, 'Delete key: W-102 is gone (' + n0 + ' → ' + (await elementCount()) + ' elements)');
    ok(/Deleted: Wall W-102/.test(await page.textContent('[data-change-list]')), 'the Changes list says "Deleted: Wall W-102"');
    await shot(page, 'b1-01-deleted');
    await undo();
    ok((await keyOf('W-102')) === w2 && (await elementCount()) === n0, 'Ctrl+Z puts it back with its own id');

    const door = await keyOf('D-101'), w1 = await keyOf('W-101');
    const t1 = await trisOf(w1);
    await clickPick(door);
    await page.waitForFunction(() => /D-101/.test(document.querySelector('[data-props]').textContent));
    await openMore();
    await page.click(item('delete'));
    await waitStatus(/^Deleted 1 element\. .*1 part or opening went with it/);
    ok((await trisOf(w1)) === 12 && t1 > 12, 'deleting the door from the menu takes its opening: the wall closes (' + t1 + ' → 12 triangles)');
    await shot(page, 'b1-02-door-deleted');
    await undo();
    ok((await keyOf('D-101')) === door && (await trisOf(w1)) === t1, 'Ctrl+Z: door and opening back');

    await press('Control+a');
    await waitStatus(/^Picked all \d+ elements shown/);
    const nAll = Number(await page.getAttribute('[data-pick-count]', 'data-pick-count'));
    ok(nAll === n0 && (await pickedKeys()).length === n0, 'Ctrl+A picks every element shown (' + nAll + ')');
    await press('Escape');

    await clickPick(w2);
    await page.waitForFunction(() => /W-102/.test(document.querySelector('[data-props]').textContent));
    await press('Control+c');
    await waitStatus(/^Copied 1 element/);
    const text = await page.evaluate(() => navigator.clipboard.readText());
    ok(/^Wall: W-102/.test(text) && /GlobalId: /.test(text), 'Ctrl+C: the wall\'s name and properties are on the system clipboard too');
    ok(!(await disabled('[data-toolbar] > [data-act="paste"]')), 'Paste is enabled for a building element now');
    await press('Control+v');
    await waitStatus(/^Pasting: click where the copy goes/);
    ok(await page.isVisible('[data-placebar]'), 'Ctrl+V: the placing bar shows, the copy follows the pointer');
    const box = await page.locator('[data-canvas]').boundingBox();
    await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
    await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.3);
    await waitStatus(/^Pasted 1 element/);
    ok((await elementCount()) === n0 + 1, 'a click pastes a copy (' + (await elementCount()) + ' elements)');
    await shot(page, 'b1-03-pasted');
    await press('Escape');
    await press('Control+Shift+v');
    await waitStatus(/^Pasted 1 element beside the original/);
    ok((await elementCount()) === n0 + 2, 'Ctrl+Shift+V while the original is there: beside it');
    await undo();
    await undo();
    ok((await elementCount()) === n0, 'two Undos take both copies away');

    await page.click('[data-view="iso"]');   // pasting turned the view to Top, where the Level 2 slab covers the walls
    await clickPick(w1);
    await clickPick(door, true);
    await page.waitForFunction(() => document.querySelector('[data-pick-count]')?.dataset.pickCount === '2');
    await press('Control+x');
    await waitStatus(/^Cut 2 elements/);
    ok((await keyOf('W-101')) === null && (await keyOf('D-101')) === null, 'Ctrl+X on the wall and its door: both gone');
    await press('Control+Shift+v');
    await waitStatus(/^Pasted 2 elements where they were cut from/);
    const nw = await keyOf('W-101'), nd = await keyOf('D-101');
    ok(nw && nd && nw !== w1 && (await trisOf(nw)) === t1, 'Ctrl+Shift+V after a cut: back where they were, the opening cut in the wall again (' + (await trisOf(nw)) + ' triangles)');
    await shot(page, 'b1-04-cut-pasted');

    await page.click('[data-view="iso"]');
    await clickPick(w2);
    await page.waitForFunction(() => /W-102/.test(document.querySelector('[data-props]').textContent));
    await press('Control+d');
    await waitStatus(/^Duplicated: click where the copy goes/);
    await press('Escape');
    ok(!(await page.isVisible('[data-placebar]')), 'Ctrl+D starts pasting a copy; Esc stops');

    const st = await keyOf('Level 1');   // storeys have no geometry; the model tree (B13) is where they are picked
    await page.evaluate((k) => window.bimcraftVis.pick([k]), st);
    await page.waitForFunction(() => /BuildingStorey/.test(document.querySelector('[data-props]').textContent));
    await openMore();
    ok(await disabled(item('delete')) && /cannot be copied or deleted/.test(await page.getAttribute(item('delete'), 'title')), 'a storey is refused: Delete says why');
    await page.keyboard.press('Escape');

    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-save]')]);
    await waitStatus(/^Saved /);   // the change list is cleared once the save finishes (the download starts first)
    const saved = fs.readFileSync(await dl.path(), 'utf8');
    const d = danglingRefs(saved);
    ok(/\(edited\)\.ifc$/.test(dl.suggestedFilename()) && d.length === 0 && /IFCDOOR\(/.test(saved), 'Save as IFC: ' + dl.suggestedFilename() + ', no reference to a missing line');
  }

  if (want('b2')) {
    console.log('== B2 pick objects in a drawing\'s 3D view');
    await page.setInputFiles('[data-file]', path.join(REPO, 'tools/bimcraft-test/fixtures/dwg3d-acad2018.dwg'));
    await waitStatus(/^Opened /);
    ok((await page.evaluate(() => window.bimcraftDwgState())) === 'worker', 'the DWG was read in a worker (1.3, dwg/read-async.js)');
    await page.keyboard.press('3');
    await page.waitForFunction(() => document.querySelector('[data-dwg3d-canvas]')?.view?.model);
    ok(/Click an object to see its properties/.test(await page.textContent('[data-props]')), 'Properties in 3D says a click picks');
    const at = (p) => page.evaluate((q) => { const v = document.querySelector('[data-dwg3d-canvas]').view, r = v.canvas.getBoundingClientRect(), s = v.screenOf(q); return { x: r.left + s.x, y: r.top + s.y }; }, p);
    const c = await at([5250, 5750, 500]);   // the top of the plain CUBE reference
    await page.mouse.click(c.x, c.y);
    await page.waitForSelector('[data-dwg-pick]');
    const props = await page.textContent('[data-props]');
    ok(/INSERT/.test(props) && /CUBE/.test(props) && /Insertion point/.test(props) && /5000, 5500, 0/.test(props), 'a click on a block reference shows INSERT, block CUBE, its insertion point');
    ok((await page.evaluate(() => document.querySelector('[data-dwg3d-canvas]').view.picked.size)) === 1, 'it is highlighted');
    await shot(page, 'b2-01-picked-insert');
    const f = await at([3500, 3500, 500]);   // the middle of the sloping 3D face
    await page.keyboard.down('Control'); await page.mouse.click(f.x, f.y); await page.keyboard.up('Control');
    await page.waitForFunction(() => document.querySelector('[data-props] [data-pick-count]')?.dataset.pickCount === '2');
    ok(/3DFACE/.test(await page.textContent('[data-props]')) && /INSERT/.test(await page.textContent('[data-props]')), 'Ctrl+click adds the 3D face: "2 objects picked", by type');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => /Click an object to see its properties/.test(document.querySelector('[data-props]').textContent));
    ok((await page.evaluate(() => document.querySelector('[data-dwg3d-canvas]').view.picked.size)) === 0, 'Esc clears the pick and shows what the 3D view holds again');
    const l = await at([1500, 1500, 750]);   // the middle of the 3D line
    await page.mouse.click(l.x + 3, l.y);
    await page.waitForSelector('[data-dwg-pick]');
    ok(/LINE/.test(await page.textContent('.bc-prop-cls')) && /2061\.55/.test(await page.textContent('[data-props]')), 'a click 3 px from a line picks it: LINE, length 2061.55');
    await shot(page, 'b2-02-picked-line');
    await page.keyboard.press('Escape');
    await page.click('[data-layer-list] label:has-text("BLK") input');
    await page.mouse.click(c.x, c.y);
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => document.querySelector('[data-dwg-pick]') ? document.querySelector('.bc-prop-cls').textContent : 'none');
    ok(after !== 'INSERT', 'with layer BLK off, the same click does not pick the hidden reference (' + after + ')');
    await page.click('[data-layer-list] label:has-text("BLK") input');
    await page.keyboard.press('3');
  }

  if (want('b13')) {
    console.log('== B13 model tree');
    await openFile(fixtureFile());
    await page.click('[data-view="iso"]');
    const rowOf = (key) => `[data-tree] li[data-node="${key}"]`;
    const labels = () => page.$$eval('[data-tree] .bc-tree-name', (bs) => bs.map((b) => b.querySelector('.bc-tree-label').textContent + (b.querySelector('.bc-tree-sub') ? ' [' + b.querySelector('.bc-tree-sub').textContent + ']' : '')));
    ok(await page.isVisible('[data-tree-sec]'), 'the Model tree section shows for an IFC model');
    const first = await labels();
    ok(first.join(' | ') === 'BimCraft fixture [Project] | Site [Site] | Fixture building [Building] | Level 1 [Storey] | Level 2 [Storey]', 'it opens down to the storeys: ' + first.join(' | '));
    const l1 = await keyOf('Level 1'), l2 = await keyOf('Level 2');
    await page.click(rowOf(l1) + ' > .bc-tree-row .bc-tree-twisty');
    const opened = await labels();
    ok(opened.includes('101 Office [Space]') && opened.includes('Wall [4]') && opened.includes('Door [1]') && opened.includes('Stair [1]'), 'Level 1 opens: the space, then Wall 4, Door 1, Stair 1');
    await shot(page, 'b13-01-tree');
    await page.click(rowOf(l2) + ' > .bc-tree-row input');
    const st = await page.evaluate(({ a, b }) => { const q = (k) => document.querySelector(`[data-tree] li[data-node="${k}"] > .bc-tree-row input`); const root = document.querySelector('[data-tree] > li > .bc-tree-row input'); return { l1: q(a).checked, l2: q(b).checked, rootMixed: root.indeterminate, hidden: window.bimcraftVis.state().hidden.length }; }, { a: l1, b: l2 });
    ok(!st.l2 && st.l1 && st.rootMixed && st.hidden === 3, 'unticking Level 2 hides its 3 elements; the project shows mixed (' + JSON.stringify(st) + ')');
    await shot(page, 'b13-02-level2-off');
    await page.click(rowOf(l2) + ' > .bc-tree-row input');
    ok((await page.evaluate(() => window.bimcraftVis.state().hidden.length)) === 0, 'ticking it again shows them');
    await page.click(rowOf(l1) + ' > .bc-tree-row .bc-tree-name');
    await waitStatus(/^Picked the 8 elements in Level 1/);
    ok((await page.getAttribute('[data-pick-count]', 'data-pick-count')) === '8', 'a click on the storey\'s name picks its 8 elements');
    await page.click(rowOf(l1) + ' > .bc-tree-row .bc-tree-info');
    await page.waitForFunction(() => /BuildingStorey/.test(document.querySelector('.bc-prop-cls')?.textContent || ''));
    ok(/Level 1/.test(await page.textContent('.bc-prop-name')), 'its info button shows the storey\'s own properties');
    await press('Escape');
    const w2 = await keyOf('W-102');
    await clickPick(w2);
    await page.waitForSelector(rowOf(w2) + '[aria-selected="true"]');
    ok(await page.isVisible(rowOf(w2)), 'picking W-102 in 3D opens the tree to it and marks its row');
    await page.focus(rowOf(w2) + ' > .bc-tree-row .bc-tree-name');
    await page.keyboard.press('ArrowDown');
    const next = await page.evaluate(() => document.activeElement.querySelector('.bc-tree-label')?.textContent);
    ok(next === 'W-103', 'ArrowDown moves to the next row (' + next + ')');
    await page.keyboard.press(' ');
    ok((await page.evaluate(() => window.bimcraftVis.state().hidden.length)) === 1 && (await page.evaluate(() => document.activeElement.closest('li').classList.contains('is-hidden'))), 'Space unticks it: hidden, its row struck through');
    await page.keyboard.press(' ');
    await page.dblclick(rowOf(w2) + ' > .bc-tree-row .bc-tree-name');
    await waitStatus(/^Zoomed to W-102/);
    ok(true, 'double-click on a row zooms to it');
    await shot(page, 'b13-03-picked-in-tree');
    await page.click('[data-view="iso"]');
    const stairKey = await page.evaluate(() => { const t = window.bimcraftTree().tree; for (const [k, n] of t.byKey) if (n.cls === 'IfcStair') return k; return null; });
    await page.click(rowOf(l1) + ' > ul > li:has(.bc-tree-label:text-is("Stair")) > .bc-tree-row .bc-tree-twisty');
    await page.click(rowOf(stairKey) + ' > .bc-tree-row .bc-tree-name');
    await page.waitForFunction(() => /Stair/.test(document.querySelector('.bc-prop-cls')?.textContent || ''));
    ok(/ST-1/.test(await page.textContent('.bc-prop-name')), 'the stair row (no body of its own) shows the stair\'s properties');
    await press('Delete');
    await waitStatus(/^Deleted 1 element\. .*2 parts and openings went with them/);
    ok(!(await page.evaluate(() => { for (const n of window.bimcraftTree().tree.byKey.values()) if (n.cls === 'IfcStair') return true; return false; })), 'Delete: the stair and its two flights are gone from the model and the tree');
    await undo();
    ok(await page.evaluate(() => { for (const n of window.bimcraftTree().tree.byKey.values()) if (n.cls === 'IfcStair') return true; return false; }), 'Undo brings them back into the tree');
  }

  if (want('b15')) {
    console.log('== B15 color by property');
    await openFile(fixtureFile());
    await page.click('[data-view="iso"]');
    await page.click('[data-rtab="color"]');
    await page.waitForSelector('[data-color-field]');
    const opts = await page.$$eval('[data-color-field] option', (os) => os.map((o) => o.value).filter(Boolean));
    ok(opts.includes('cls') && opts.includes('p:Fixture_Data.Cost') && opts.includes('material'), 'the Color tab lists built-in and property-set fields (' + opts.length + ')');
    await page.selectOption('[data-color-field]', 'cls');
    await waitStatus(/^Colored by Class: 5 values/);
    const rows = await page.$$eval('[data-legend] button', (bs) => bs.map((b) => b.querySelector('.bc-lv').textContent + ' ' + b.querySelector('.n').textContent));
    ok(rows.join(', ') === 'Wall 6, StairFlight 2, Door 1, Furniture 1, Slab 1', 'legend: ' + rows.join(', '));
    ok(await page.evaluate(() => document.querySelector('[data-canvas]').viewer.meshes.every((m) => m.geometry.getAttribute('color') && m.material[0].vertexColors)), 'the model is painted (vertex colors on every batch)');
    await shot(page, 'b15-01-by-class-paper');
    await page.click('[data-legend-row="0"]');
    await waitStatus(/^Showing the 6 elements with Wall/);
    ok((await page.evaluate(() => window.bimcraftVis.state().isolated.length)) === 6 && (await page.getAttribute('[data-legend-row="0"]', 'aria-pressed')) === 'true', 'a click on Wall shows only the 6 walls');
    await page.keyboard.down('Control'); await page.click('[data-legend-row="2"]'); await page.keyboard.up('Control');
    ok((await page.evaluate(() => window.bimcraftVis.state().isolated.length)) === 7, 'Ctrl+click adds the door');
    await shot(page, 'b15-02-isolated');
    await press('Shift+H');
    await waitStatus(/^Showing every element again/);
    ok((await page.$$eval('[data-legend] [aria-pressed="true"]', (x) => x.length)) === 0, 'Shift+H shows all and clears the marked values');
    await page.selectOption('[data-color-field]', 'p:Fixture_Data.Cost');
    await waitStatus(/^Colored by Cost: 4 values/);
    ok(/No value/.test(await page.textContent('[data-legend]')), 'Cost: 4 values and a "No value" row for the elements without it');
    // the swatch is a color input since 0.5 WL.5 (each row's color can be changed)
    const before = await page.$eval('[data-legend] [data-legend-color]', (e) => e.value);
    await page.evaluate(() => { document.documentElement.dataset.space = 'model'; });
    await page.waitForFunction((b) => document.querySelector('[data-legend] [data-legend-color]').value !== b, before);
    ok(true, 'the model theme repaints with its own steps');
    await shot(page, 'b15-03-cost-model');
    await page.evaluate(() => { document.documentElement.dataset.space = 'paper'; });
    await page.click('[data-color-off]');
    await waitStatus(/^Colors are back/);
    ok(await page.evaluate(() => document.querySelector('[data-canvas]').viewer.meshes.every((m) => !m.geometry.getAttribute('color') && !m.material[0].vertexColors)), 'Off: the model\'s own colors again');
    await page.click('[data-rtab="props"]');
  }

  if (want('b16')) {
    console.log('== B16 several models in one scene');
    await openFile(fixtureFile());
    ok(await page.isVisible('[data-models-sec]') && (await page.$$('[data-model-list] li')).length === 1, 'the Models section lists the one open model');
    await page.setInputFiles('[data-model-input]', fixtureFile({ shift: 100000, rev: 'b' }, 'bimcraft-fixture-b.ifc'));
    await waitStatus(/^Added bimcraft-fixture-b\.ifc: 11 elements/);
    const list = await page.evaluate(() => window.bimcraftModels.list());
    ok(list.length === 2 && list[0].active && !list[1].active && list[1].mi === 1, 'Add a model: two models, the first one active');
    const m1 = await page.evaluate(() => window.bimcraftModels.matrix(1));
    ok(Math.abs(m1[12] - 100) < 1e-3 && Math.abs(m1[13]) < 1e-3 && Math.abs(m1[14]) < 1e-3, 'the second is placed 100 m along X, where its own coordinates put it');
    await page.click('[data-view="iso"]');
    await shot(page, 'b16-01-two-models');
    const w203 = await page.evaluate(() => window.bimcraftKeys('W-203', 1));
    ok(w203 >= 2 ** 26, 'its elements have model 1 keys (W-203 = ' + w203 + ')');
    await clickPick(w203);
    await page.waitForSelector('[data-foreign]');
    ok(/bimcraft-fixture-b\.ifc/.test(await page.textContent('[data-foreign]')) && !(await page.$('[data-props] .bc-editable')), 'picking it shows its properties read only, naming its file');
    await page.click('[data-foreign] button');
    await waitStatus(/^Editing bimcraft-fixture-b\.ifc now/);
    ok((await page.evaluate(() => window.bimcraftModels.list()[1].active)) && (await page.isChecked('[data-model-active="1"]')), '"Edit that model" makes it the active one');
    ok((await page.textContent('[data-tree]')).includes('W-203') || (await page.evaluate(() => [...window.bimcraftTree().tree.byKey.keys()].every((k) => k >= 2 ** 26))), 'the tree is the second model\'s now');
    await page.waitForSelector('[data-props] .bc-editable');
    await press('Delete');
    await waitStatus(/^Deleted 1 element/);
    ok((await page.evaluate(() => window.bimcraftKeys('W-203', 1))) === null && (await page.evaluate(() => window.bimcraftKeys('W-101', 0))) !== null, 'Delete removes W-203 from model 1; model 0 is untouched');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-save]')]);
    const saved = fs.readFileSync(await dl.path(), 'utf8');
    ok(dl.suggestedFilename() === 'bimcraft-fixture-b (edited).ifc' && !/'W-203'/.test(saved) && /'W-201'/.test(saved) && danglingRefs(saved).length === 0, 'Save as IFC saves the active model alone: ' + dl.suggestedFilename());
    await page.uncheck('[data-model-visible="1"]');
    ok((await page.evaluate(() => [...document.querySelector('[data-canvas]').viewer.shownKeys()].every((k) => k < 2 ** 26))), 'unticking it hides the whole model');
    await page.check('[data-model-visible="1"]');
    await page.click('[data-model-offset="1"] summary');
    await page.fill('[data-model-offset="1"] input[data-axis="Y"]', '-20');
    await page.click('[data-model-offset="1"] button[type="submit"]');
    await waitStatus(/^Moved bimcraft-fixture-b\.ifc to X 0, Y -20, Z 0/);
    const m1b = await page.evaluate(() => window.bimcraftModels.matrix(1));
    ok(Math.abs(m1b[14] - 20) < 1e-3, 'Move Y −20 m: placed 20 m south (viewer Z +20)');
    await shot(page, 'b16-02-moved');
    const w201 = await page.evaluate(() => window.bimcraftKeys('W-201', 1));
    await page.evaluate((k) => window.bimcraftVis.pick([k]), w201);
    await page.waitForSelector('[data-props] .bc-editable');
    await page.click('[data-props] .bc-editable button');
    await page.keyboard.type('X');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => /Save as IFC \(1\)/.test(document.querySelector('[data-save]').textContent));
    await page.click('[data-model-remove="1"]');
    await page.waitForSelector('dialog.bc-dialog[open]');
    ok(/unsaved change/.test(await page.textContent('dialog.bc-dialog[open]')), 'taking out a model with unsaved changes asks first');
    await page.click('dialog.bc-dialog[open] button[value="discard"]');
    await waitStatus(/^Took bimcraft-fixture-b\.ifc out of the scene/);
    const after = await page.evaluate(() => window.bimcraftModels.list());
    ok(after.length === 1 && after[0].active && (await page.evaluate(() => document.querySelector('[data-canvas]').viewer.layers.size)) === 1, 'Discard: the model is gone, the first one is active again');
  }

  if (want('b3')) {
    console.log('== B3 section plane on a drawing in 3D');
    await page.setInputFiles('[data-file]', path.join(REPO, 'tools/bimcraft-test/fixtures/dwg3d-acad2018.dwg'));
    await waitStatus(/^Opened /);
    await page.keyboard.press('3');
    await page.waitForFunction(() => document.querySelector('[data-dwg3d-canvas]')?.view?.model);
    await page.click('[data-v3="section"]');
    await page.waitForSelector('[data-sectionbar]:not([hidden])');
    const unit = await page.textContent('[data-sec-unit]');
    ok((await page.getAttribute('[data-v3="section"]', 'aria-pressed')) === 'true' && unit !== 'm', 'Section on the 3D bar shows the bar, offsets in ' + unit);
    const v3 = () => page.evaluate(() => { const v = document.querySelector('[data-dwg3d-canvas]').view; return { sec: v.section && { axis: v.section.axis, offset: Math.round(v.section.offset), flip: v.section.flip }, planes: v.renderer.clippingPlanes.length }; });
    await page.fill('[data-sec-offset]', '1000');
    await page.press('[data-sec-offset]', 'Enter');
    let st = await v3();
    ok(st.sec && st.sec.axis === 'top' && st.sec.offset === 1000 - 0 && st.planes === 1, 'typed 1000: the cut is 1000 ' + unit + ' above the bottom (' + JSON.stringify(st) + ')');
    const cube = await page.evaluate(() => { const v = document.querySelector('[data-dwg3d-canvas]').view, r = v.canvas.getBoundingClientRect(); v.standard('iso'); v.draw(); const p = v.screenOf([6500, 5500, 2500]); const h = v.pick(p.x, p.y); return { owner: h?.owner ?? null, type: h ? v.model.owners[h.owner].type : null }; });
    ok(cube.type !== 'INSERT' || cube.owner === null, 'the raised block above the cut cannot be picked (' + JSON.stringify(cube) + ')');
    await shot(page, 'b3-01-dwg-section-top');
    await page.click('[data-sec-flip]');
    st = await v3();
    ok(st.sec.flip, 'Flip keeps the other side');
    await page.click('[data-sec-axis="front"]');
    st = await v3();
    ok(st.sec.axis === 'front', 'Front cuts across Y');
    await shot(page, 'b3-02-dwg-section-front');
    await page.locator('[data-dwg3d-canvas]').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('x');
    st = await v3();
    ok(!st.sec && st.planes === 0 && await page.isHidden('[data-sectionbar]'), 'X turns it off');
    await page.keyboard.press('x');
    st = await v3();
    ok(st.sec && st.planes === 1, 'X turns it on again');
    await page.keyboard.press('3');
    ok(await page.isHidden('[data-sectionbar]') && (await page.evaluate(() => document.querySelector('[data-dwg3d-canvas]').view.renderer.clippingPlanes.length)) === 0, 'back to 2D: the cut goes with the 3D view');
  }

  if (want('b4')) {
    console.log('== B4 section box');
    await openFile(fixtureFile());
    await page.click('[data-view="iso"]');
    await page.click('[data-toggle="section"]');
    await page.click('[data-sec-axis="box"]');
    const planes = () => page.evaluate(() => document.querySelector('[data-canvas]').viewer.clip.length);
    ok((await planes()) === 6 && await page.isVisible('[data-sec-box]') && await page.isHidden('[data-sec-plane]'), 'Box: six clipping planes, the from/to sliders instead of the offset');
    const w201 = await keyOf('W-201'), w101 = await keyOf('W-101');
    const p201 = await spotOf(w201);
    ok(p201 !== null, 'W-201 (Level 2) can be picked inside the whole-model box');
    await page.$eval('[data-box-axis="z"] [data-box-to]', (r) => { r.value = '2.5'; r.dispatchEvent(new Event('input', { bubbles: true })); });
    const zval = await page.textContent('[data-box-axis="z"] [data-box-val]');
    ok(/^0 – 2\.5\d* m$/.test(zval), 'Z to 2.5 m: ' + zval);
    ok((await hitKey(p201)) !== w201, 'Level 2\'s wall is outside the box now: a click there does not pick it');
    await shot(page, 'b4-01-box-z');
    await page.evaluate((k) => window.bimcraftVis.pick([k]), w101);
    await page.click('[data-sec-box-pick]');
    await waitStatus(/^The box is round the picked element/);
    const box = await page.evaluate(() => window.bimcraftSection.get().box);
    ok(box.max[0] - box.min[0] > 10 && box.max[0] - box.min[0] < 11 && box.max[2] - box.min[2] > 3 && box.max[2] - box.min[2] < 3.7, 'Box round the pick: W-101 (10 m × 3 m) with 0.3 m to spare (' + box.min.map((v) => v.toFixed(2)) + ' → ' + box.max.map((v) => v.toFixed(2)) + ')');
    await shot(page, 'b4-02-box-round-pick');
    await page.click('[data-sec-box-all]');
    const all = await page.evaluate(() => { const c = window.bimcraftSection.get(), s = document.querySelector('[data-canvas]').viewer.sizeIfc(); return c.box.min.every((v) => v === 0) && c.box.max.every((v, k) => Math.abs(v - s[k]) < 1e-9); });
    ok(all, 'Whole model: the box is the model\'s bounds again');
    await page.click('[data-sec-axis="top"]');
    ok((await planes()) === 1 && await page.isHidden('[data-sec-box]'), 'Top: back to one plane');
    await page.click('[data-sec-off]');
  }

  if (want('b5')) {
    console.log('== B5 filled cut faces');
    await openFile(fixtureFile());
    await page.click('[data-view="top"]');
    await page.evaluate(() => window.bimcraftSection.set({ axis: 'top', offset: 1.5 }));
    /** Share of canvas pixels in the cut color (the theme's --ink-2), read back from the WebGL canvas. */
    const capShare = () => page.evaluate(async () => {
      const v = document.querySelector('[data-canvas]').viewer;
      v.renderer.render(v.scene, v.camera);
      const img = new Image(); img.src = v.canvas.toDataURL('image/png'); await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      const want = v.colors.cap.clone().convertLinearToSRGB?.() || v.colors.cap;
      const tr = Math.round(v.colors.cap.getStyle().match(/\d+/g)[0]), tg = Math.round(v.colors.cap.getStyle().match(/\d+/g)[1]), tb = Math.round(v.colors.cap.getStyle().match(/\d+/g)[2]);
      void want;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - tr) < 12 && Math.abs(d[i + 1] - tg) < 12 && Math.abs(d[i + 2] - tb) < 12) n++;
      return n / (d.length / 4);
    });
    const on = await capShare();
    ok(on > 0.002, 'Fill on: the walls cut at 1.5 m show in the cut color from above (' + (on * 100).toFixed(2) + '% of the view)');
    await shot(page, 'b5-01-filled-paper');
    await page.click('[data-sec-fill]');
    const off = await capShare();
    ok(off < on / 5 && (await page.getAttribute('[data-sec-fill]', 'aria-pressed')) === 'false', 'Fill off: hollow (' + (off * 100).toFixed(2) + '%)');
    await shot(page, 'b5-02-hollow');
    await page.click('[data-sec-fill]');
    await page.evaluate(() => window.bimcraftSection.set({ axis: 'box', box: { min: [0, 0, 0], max: [5, 6.2, 1.5] } }));
    const box = await capShare();
    ok(box > 0.001, 'a section box fills its cuts too (' + (box * 100).toFixed(2) + '%)');
    await page.click('[data-view="iso"]');
    await shot(page, 'b5-03-box-filled-iso');
    await page.evaluate(() => { document.documentElement.dataset.space = 'model'; });
    await page.waitForTimeout(200);
    const dark = await capShare();
    ok(dark > 0.001, 'model theme: the cut color follows the theme (' + (dark * 100).toFixed(2) + '%)');
    await shot(page, 'b5-04-box-filled-model');
    await page.evaluate(() => { document.documentElement.dataset.space = 'paper'; window.bimcraftSection.set(null); });
  }

  if (want('b6')) {
    console.log('== B6 measure');
    await openFile(fixtureFile());
    await page.click('[data-view="iso"]');
    await press('m');
    await waitStatus(/^Measure: click two points/);
    ok(await page.isVisible('[data-measurebar]') && (await page.getAttribute('[data-toggle="measure"]', 'aria-pressed')) === 'true', 'M: the measure bar shows, Measure is pressed');
    const w2 = await keyOf('W-102');
    // W-102's outer top edge: its bounds' corners are real corners (an axis-aligned box)
    // aim 5 cm inside each corner on the outer face (a click must land on the wall); the 10 px snap pulls it to the corner
    const ends = await page.evaluate((k) => { const v = document.querySelector('[data-canvas]').viewer, b = v.keyBounds([k]); const a = [b.max[0], b.max[1] - 0.05, b.max[2] - 0.05], c = [b.max[0], b.max[1] - 0.05, b.min[2] + 0.05]; return [a, c].map((p) => v.project(p)); }, w2);
    await page.mouse.move(ends[0].x, ends[0].y);
    await page.mouse.click(ends[0].x, ends[0].y);
    await waitStatus(/^Click the second point/);
    await page.mouse.move(ends[1].x, ends[1].y);
    const snap = await page.evaluate(() => [...document.querySelectorAll('[data-measure-labels] .bc-measure-label')].map((x) => x.textContent).pop());
    ok(snap === 'corner', 'hovering near the other end: the pointer snaps to the corner (' + snap + ')');
    await page.mouse.click(ends[1].x, ends[1].y);
    const st = await page.evaluate(() => window.bimcraftMeasure.state());
    const it = st.items[0];
    ok(it && it.kind === 'distance' && Math.abs(it.value - 6) < 1e-3 && Math.abs(it.delta[0]) < 1e-3 && Math.abs(Math.abs(it.delta[1]) - 6) < 1e-3 && Math.abs(it.delta[2]) < 1e-3, 'the two corners are 6.000 m apart, all along IFC Y (' + it?.text + ')');
    ok((await page.textContent('[data-measure-out]')).startsWith('6.000 m') && (await page.$$eval('[data-measure-labels] [data-measure-label]', (x) => x.map((e) => e.textContent))).includes('6.000 m'), 'the bar and a label on the line say 6.000 m');
    ok((await pickedKeys()).length === 0, 'measuring does not pick elements');
    await shot(page, 'b6-01-distance');
    await page.click('[data-measure-mode="area"]');
    const face = await page.evaluate((k) => { const v = document.querySelector('[data-canvas]').viewer, b = v.keyBounds([k]); const s = v.project([b.max[0], (b.min[1] + b.max[1]) / 2, (b.min[2] + b.max[2]) / 2]); return s; }, w2);
    await page.mouse.click(face.x, face.y);
    const st2 = await page.evaluate(() => window.bimcraftMeasure.state());
    ok(st2.items.length === 2 && st2.items[1].kind === 'area' && Math.abs(st2.items[1].value - 18) < 1e-3, 'Face area on W-102\'s side: 18.000 m² (' + st2.items[1]?.text + ')');
    await shot(page, 'b6-02-area');
    await page.click('[data-measure-mode="distance"]');
    await page.mouse.click(ends[0].x, ends[0].y);
    await press('Escape');
    ok((await page.evaluate(() => window.bimcraftMeasure.state())).a === null && await page.isVisible('[data-measurebar]'), 'Esc drops a half-made distance, measuring goes on');
    await press('Escape');
    ok(await page.isHidden('[data-measurebar]') && (await page.$$('[data-measure-labels] *')).length === 0, 'Esc again stops measuring and clears the labels');
  }

  if (want('b7')) {
    console.log('== B7 text, attributes and wide polylines in 3D');
    await page.setInputFiles('[data-file]', path.join(REPO, 'fixtures/dwg/kitchen-equipment.dwg'));
    await waitStatus(/^Opened /);
    await page.keyboard.press('3');
    await page.waitForFunction(() => document.querySelector('[data-dwg3d-canvas]')?.view?.model);
    const info = await page.evaluate(() => { const v = document.querySelector('[data-dwg3d-canvas]').view; return { meshes: v.textMeshes, texts: v.model.batches.reduce((a, b) => a + b.texts.length, 0), flat: v.model.stats.flatOnly }; });
    ok(info.meshes > 0 && info.texts > 100 && !info.flat.TEXT && !info.flat.MTEXT, 'texts drawn in 3D: ' + info.texts + ' lines of text in ' + info.meshes + ' meshes; none left as 2D only');
    ok(!/In the 2D view only[\s\S]*TEXT/.test(await page.textContent('[data-props]')), 'Properties no longer lists text under "In the 2D view only"');
    await page.click('[data-v3="top"]');
    await shot(page, 'b7-01-kitchen-text-top');
    // a text's middle on screen → a click there picks its entity
    const tgt = await page.evaluate(() => {
      const v = document.querySelector('[data-dwg3d-canvas]').view;
      for (const b of v.model.batches) for (const tx of b.texts) {
        if (tx.s.length < 6) continue;
        const mid = [0, 1, 2].map((k) => tx.o[k] + tx.xd[k] * tx.s.length * 0.25 + tx.yd[k] * 0.4);
        const p = v.screenOf(mid), h = v.pick(p.x, p.y);
        if (h && h.owner === tx.owner) { const r = v.canvas.getBoundingClientRect(); return { x: r.left + p.x, y: r.top + p.y, owner: tx.owner, s: tx.s }; }
      }
      return null;
    });
    ok(tgt !== null, 'a text can be hit where it is drawn' + (tgt ? ' ("' + tgt.s + '")' : ''));
    if (tgt) {
      await page.mouse.click(tgt.x, tgt.y);
      await page.waitForSelector('[data-dwg-pick]');
      ok(Number(await page.getAttribute('[data-dwg-pick]', 'data-dwg-pick')) === tgt.owner, 'clicking it picks its entity: ' + await page.textContent('.bc-prop-cls'));
      await shot(page, 'b7-02-text-picked');
      await page.evaluate((o) => {   // zoom right in on that text, to look at the lettering
        const v = document.querySelector('[data-dwg3d-canvas]').view;
        for (const b of v.model.batches) for (const tx of b.texts) if (tx.owner === o) {
          const a = v.toScene(tx.o), c = v.toScene([0, 1, 2].map((k) => tx.o[k] + tx.xd[k] * tx.s.length * 0.7 + tx.yd[k] * 3));
          v.cam.fit({ min: [0, 1, 2].map((k) => Math.min(a[k], c[k])), max: [0, 1, 2].map((k) => Math.max(a[k], c[k])) }); v.render(); return;
        }
      }, tgt.owner);
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
      await shot(page, 'b7-03-text-close');
    }
    await page.keyboard.press('3');
  }

  if (want('b8')) {
    console.log('== B8 binary DXF, meshes in 2D');
    const bin = Buffer.concat([Buffer.from('AutoCAD Binary DXF\r\n\x1a\x00', 'latin1'), Buffer.alloc(64)]);
    await page.setInputFiles('[data-file]', { name: 'plan-binary.dxf', mimeType: 'application/dxf', buffer: bin });
    await waitStatus(/binary DXF/);
    ok(/^plan-binary\.dxf: this is a binary DXF/.test(await statusOf()) && /ASCII DXF/.test(await statusOf()), 'a binary DXF: ' + await statusOf());
    await page.setInputFiles('[data-file]', path.join(REPO, 'tools/bimcraft-test/fixtures/dwg3d-acad2018.dwg'));
    await waitStatus(/^Opened /);
    const nd = await page.$$eval('.bc-notdrawn li', (x) => x.map((e) => e.textContent));
    ok(!nd.some((t) => /POLYLINE_PFACE|POLYLINE_MESH/.test(t)), 'polyface and polygon meshes are drawn in 2D (not listed under Not drawn yet): ' + nd.join(', '));
  }

  if (want('b9')) {
    console.log('== B9 issues and BCF viewpoints');
    await openFile(fixtureFile());
    await page.click('[data-view="iso"]');
    const w1 = await keyOf('W-101'), w2 = await keyOf('W-102');
    await page.evaluate((k) => window.bimcraftVis.pick([k]), w2);
    await press('h');
    await page.evaluate((k) => window.bimcraftVis.pick([k]), w1);
    await page.evaluate(() => window.bimcraftSection.set({ axis: 'top', offset: 1.5 }));
    const cam0 = await page.evaluate(() => document.querySelector('[data-canvas]').viewer.camera.position.toArray());
    await page.click('[data-rtab="issues"]');
    await page.click('[data-bcf-new]');
    await page.fill('[data-bcf-f-title]', 'Wall W-101 & "door" <check>');
    await page.fill('[data-bcf-f-comment]', 'Door swing clashes');
    await page.fill('[data-bcf-f-author]', 'tester@example.com');
    await page.click('[data-bcf-form] button[type="submit"]');
    await waitStatus(/^Created the issue/);
    ok((await page.$$('[data-issue-list] [data-issue]')).length === 1 && await page.isVisible('[data-issue-list] img'), 'New issue from this view: listed with its snapshot');
    await shot(page, 'b9-01-issue');
    await press('Shift+H');
    await page.evaluate(() => window.bimcraftSection.set(null));
    await page.click('[data-view="top"]');
    await press('Escape');
    await page.click('[data-issue-show]');
    await waitStatus(/^Showing "Wall W-101/);
    const st = await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer; return { cam: v.camera.position.toArray(), hidden: window.bimcraftVis.state().hidden, picked: [...v.selection], cut: window.bimcraftSection.get() }; });
    ok(st.cam.every((x, i) => Math.abs(x - cam0[i]) < 1e-3), 'Show: the camera is back where it was');
    ok(st.hidden.length === 1 && st.hidden[0] === w2 && st.picked.join() === String(w1), 'W-102 hidden again, W-101 picked again');
    ok(st.cut && st.cut.axis === 'top' && Math.abs(st.cut.offset - 1.5) < 1e-3, 'the section is back at 1.5 m');
    await shot(page, 'b9-02-shown');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-bcf-save]')]);
    const file = await dl.path();
    ok(dl.suggestedFilename() === 'bimcraft-fixture issues.bcf', 'Save BCF: ' + dl.suggestedFilename());
    const py = path.join(REPO, 'tools/markupcraft-test/venv/bin/python'), checker = path.join(REPO, 'tools/markupcraft-test/bcf_check.py');
    if (fs.existsSync(py)) {
      let res; try { res = JSON.parse(execFileSync(py, [checker, file], { encoding: 'utf8' })); } catch (e) { res = JSON.parse(e.stdout || '{}'); }
      ok(res.ok && res.topics === 1, 'the saved BCF is valid against the BCF 2.1 schemas' + (res.ok ? '' : ': ' + (res.errors || []).slice(0, 2).join(' | ')));
    }
    const B = await import(path.join(REPO, 'public_html/assets/apps/bimcraft/dev/bcf.js'));
    const back = await B.readBcf(new Uint8Array(fs.readFileSync(file)));
    const vp = back.topics[0]?.viewpoints[0];
    ok(back.topics[0]?.title === 'Wall W-101 & "door" <check>' && vp.selection.join() === '0BimCraftFixture000201' && vp.visibility.defaultVisible && vp.visibility.exceptions.join() === '0BimCraftFixture000202', 'it names W-101 picked and W-102 hidden by their GlobalIds');
    ok(vp.clipping.length === 1 && Math.abs(vp.clipping[0].location[2] - 1.5) < 1e-3 && vp.clipping[0].direction[2] > 0.99, 'the plane in model coordinates: 1.5 m up, pointing at the part cut away (up)');
    ok(vp.camera.kind === 'perspective' && Math.abs(Math.hypot(...vp.camera.direction) - 1) < 1e-6 && vp.camera.up[2] > 0, 'a perspective camera, Z up');
    await openFile(fixtureFile());
    await page.click('[data-rtab="issues"]');
    await page.setInputFiles('[data-bcf-input]', file);
    await waitStatus(/^Read 1 issue from/);
    await page.click('[data-issue-show]');
    await waitStatus(/^Showing/);
    ok((await page.evaluate(() => window.bimcraftVis.state().hidden.length)) === 1, 'Open BCF in a freshly opened model: Show hides W-102 again');
    await page.click('[data-rtab="props"]');
  }

  if (want('b14')) {
    console.log('== B14 find and search sets');
    await page.evaluate(() => { try { localStorage.removeItem('bimcraft.searchsets'); } catch (e) { /* none */ } });
    await openFile(fixtureFile());
    await page.$eval('[data-find-details]', (d) => { d.open = true; });
    await page.waitForSelector('[data-find-rule="0"]');
    await page.fill('[data-find-rule="0"] [data-find-value]', 'IfcDoor');
    await page.click('[data-find-go]');
    await waitStatus(/^Found 1 element/);
    ok((await pickedKeys()).length === 1 && /D-101/.test(await page.textContent('[data-props]')), 'Class is IfcDoor: the door is picked, its properties show');
    await page.fill('[data-find-rule="0"] [data-find-value]', 'IfcWall');
    await page.click('[data-find-add]');
    await page.selectOption('[data-find-rule="1"] [data-find-field]', 'p:Fixture_Data.Cost');
    await page.selectOption('[data-find-rule="1"] [data-find-op]', 'gt');
    await page.fill('[data-find-rule="1"] [data-find-value]', '1000');
    await page.click('[data-find-go]');
    await waitStatus(/^Found 3 elements/);
    ok((await pickedKeys()).length === 3, 'walls costing more than 1000: 3 picked');
    await shot(page, 'b14-01-find');
    await page.click('[data-find-save]');
    await page.fill('[data-find-setname]', 'Expensive walls');
    await page.click('[data-find-save]');
    await waitStatus(/^Saved the search set "Expensive walls"/);
    ok(await page.isVisible('[data-find-set="Expensive walls"]'), 'saved as a set, listed under Search sets');
    await page.evaluate(() => { window.onbeforeunload = null; });
    await page.reload({ waitUntil: 'networkidle' });
    await openFile(fixtureFile());
    await page.$eval('[data-find-details]', (d) => { d.open = true; });
    await page.click('[data-find-set="Expensive walls"]');
    await waitStatus(/^Found 3 elements/);
    ok((await pickedKeys()).length === 3 && (await page.$$('[data-find-rule]')).length === 2, 'after a reload the set is still there: its two rules come back and find the same 3');
  }

  if (want('b17')) {
    console.log('== B17 clash check');
    await openFile(fixtureFile());
    await page.click('[data-view="iso"]');
    await page.$eval('[data-clash-details]', (d) => { d.open = true; });
    await page.waitForSelector('[data-clash-a]');
    const opts = await page.$$eval('[data-clash-a] option', (os) => os.map((o) => o.value));
    ok(opts.includes('pick') && opts.includes('all') && opts.includes('cls:IfcWall'), 'sets to choose: the pick, everything, each class (' + opts.length + ')');
    await page.selectOption('[data-clash-a]', 'cls:IfcWall');
    await page.selectOption('[data-clash-b]', 'all');
    await page.fill('[data-clash-tol]', '0.01');
    await page.click('[data-clash-run]');
    await waitStatus(/^9 clashes/);
    const rows = await page.$$eval('[data-clash-row]', (bs) => bs.map((b) => b.textContent));
    ok(rows.length === 9 && rows.every((r) => /× .* m$/.test(r)), 'walls against everything: 9 clashes, as in Node (' + rows[0] + ' …)');
    ok(await page.evaluate(() => performance.getEntriesByType('resource').some((e) => /clash-worker\.js/.test(e.name))), 'it ran in a worker (clash-worker.js loaded)');
    await shot(page, 'b17-01-results');
    await page.click('[data-clash-row="0"]');
    await waitStatus(/^Showing .* everything else see-through/);
    const st = await page.evaluate(() => window.bimcraftVis.state());
    ok(st.isolated.length === 2 && st.ghost && (await pickedKeys()).length === 2, 'a result isolates the two, the rest see-through, both picked');
    await shot(page, 'b17-02-clash');
    await page.click('[data-clash-issue]');
    await page.waitForSelector('[data-bcf-form]');
    ok(/^Clash: .+ × .+/.test(await page.inputValue('[data-bcf-f-title]')), 'Make an issue of it: the Issues form opens, titled "' + await page.inputValue('[data-bcf-f-title]') + '"');
    await page.click('[data-rtab="props"]');
  }

  if (want('b18')) {
    console.log('== B18 walk');
    await openFile(fixtureFile());
    await page.click('[data-view="iso"]');
    await page.click('[data-toggle="walk"]');
    await waitStatus(/^Walk: click the floor/);
    // a spot on the Level 2 slab's top, 3 m in from W-201 (south wall, IFC y = 0) and mid-way along it
    const spot = await page.evaluate((k) => {
      const v = document.querySelector('[data-canvas]').viewer;
      const s = v.keyBounds([k]);
      for (let dz = -3; dz >= -5; dz -= 0.25) { const p = v.project([(s.min[0] + s.max[0]) / 2, s.max[1], s.max[2] + dz]); if (p && v.hitAt(p.x, p.y)?.id === k) return p; }
      return null;
    }, await keyOf('S-201'));
    ok(spot !== null, 'a spot on the slab can be clicked');
    await page.mouse.click(spot.x, spot.y);
    await waitStatus(/^Walking:/);
    const slabTop = await page.evaluate((k) => document.querySelector('[data-canvas]').viewer.keyBounds([k]).max[1], await keyOf('S-201'));
    let w = await page.evaluate(() => window.bimcraftWalk.state());
    ok(Math.abs(w.pos[1] - (slabTop + 1.6)) < 1e-3, 'standing on the slab: the eye 1.6 m above its top');
    // face south (toward W-201: viewer +z) and walk into it
    await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer; v.walk.yaw = Math.PI; v.walk.pitch = 0; v.applyWalk(); });
    const w201 = await page.evaluate((k) => document.querySelector('[data-canvas]').viewer.keyBounds([k]), await keyOf('W-201'));
    await page.keyboard.down('w'); await page.waitForTimeout(3500); await page.keyboard.up('w');
    w = await page.evaluate(() => window.bimcraftWalk.state());
    ok(w.pos[2] < w201.min[2] - 0.1 && w.pos[2] > w201.min[2] - 0.5, 'W walks south and stops short of W-201 (eye at z ' + w.pos[2].toFixed(2) + ', wall face at ' + w201.min[2].toFixed(2) + ')');
    await shot(page, 'b18-01-walk');
    await page.uncheck('[data-walk-gravity]');
    const y0 = (await page.evaluate(() => window.bimcraftWalk.state())).pos[1];
    await page.keyboard.down('e'); await page.waitForTimeout(800); await page.keyboard.up('e');
    const y1 = (await page.evaluate(() => window.bimcraftWalk.state())).pos[1];
    ok(y1 > y0 + 0.3, 'gravity off: E rises (' + (y1 - y0).toFixed(2) + ' m)');
    await page.check('[data-walk-gravity]');
    await page.keyboard.down('a'); await page.waitForTimeout(600); await page.keyboard.up('a');
    await page.waitForTimeout(800);
    const y2 = (await page.evaluate(() => window.bimcraftWalk.state())).pos[1];
    ok(Math.abs(y2 - (slabTop + 1.6)) < 1e-2, 'gravity on again: back down to the slab');
    await page.keyboard.press('Escape');
    ok((await page.evaluate(() => window.bimcraftWalk.state())) == null && await page.isHidden('[data-walkbar]'), 'Esc stops walking');
  }

  if (want('b19')) {
    console.log('== B19 model checks');
    const probFile = fixtureFile({ problems: true }, 'bimcraft-problems.ifc');
    await openFile(probFile);
    await page.$eval('[data-checks-details]', (d) => { d.open = true; });
    await page.waitForSelector('[data-checks-rule="0"]');
    await page.click('[data-checks-add]');
    await page.selectOption('[data-checks-rule="1"] [data-checks-cls]', 'IfcWall');
    await page.selectOption('[data-checks-rule="1"] [data-checks-field]', 'p:Fixture_Data.Cost');
    await page.click('[data-checks-run]');
    await waitStatus(/^Model checks: \d+ elements to look at/);
    const res = await page.$$eval('[data-check]', (ls) => Object.fromEntries(ls.map((l) => [l.dataset.check, l.querySelector('.bc-check-head').textContent])));
    ok(/1$/.test(res.required) && /2$/.test(res.guid) && /1$/.test(res.storey) && /2$/.test(res.stacked), 'four checks: required 1, GlobalId 2, no storey 1, stacked 2 (' + JSON.stringify(res) + ')');
    await page.click('[data-check="required"] [data-checks-pick]');
    await waitStatus(/^Picked 1 element/);
    const names = await page.evaluate(() => [...document.querySelector('[data-canvas]').viewer.selection]);
    ok(names.length === 1 && names[0] === await keyOf('W-105 bare'), 'a result picks its element (W-105 bare)');
    await shot(page, 'b19-01-checks');
    await page.click('[data-check="stacked"] [data-checks-pick]');
    await waitStatus(/^Picked 2 elements/);
    ok(true, 'stacked copies picked together');
    await page.reload({ waitUntil: 'networkidle' });
    await openFile(probFile);
    await page.$eval('[data-checks-details]', (d) => { d.open = true; });
    await page.waitForSelector('[data-checks-rule="1"]');
    ok(await page.inputValue('[data-checks-rule="1"] [data-checks-field]') === 'p:Fixture_Data.Cost', 'the rule is kept after a reload');
  }

  if (want('b20')) {
    console.log('== B20 quantity totals');
    await openFile(fixtureFile());
    await page.$eval('[data-qto-details]', (d) => { d.open = true; });   // open, whatever an earlier section left
    await page.waitForSelector('[data-qto-table]');
    const L = 'p:Qto_WallBaseQuantities.Length';
    ok(await page.isChecked(`[data-qto-sum="${L}"]`), 'the quantity sets\' fields are ticked to start with');
    const row = async (name) => page.$$eval('[data-qto-table] tbody tr', (trs, n) => trs.map((tr) => [...tr.cells].map((c) => c.textContent)).find((c) => c[0] === n), name);
    let wall = await row('Wall');
    ok(wall && wall[1] === '6' && wall[2] === '48000', 'by Class: Wall 6, length 48000 (' + JSON.stringify(wall) + ')');
    await page.click('[data-qto-add]');
    await page.selectOption('[data-qto-group="1"]', 'storey');
    const rows = await page.$$eval('[data-qto-table] tbody tr', (trs) => trs.map((tr) => tr.cells[0].textContent + '/' + tr.cells[1].textContent + ':' + tr.cells[2].textContent));
    ok(rows.includes('Wall/Level 1:4') && rows.includes('Wall/Level 2:2'), 'Class + Storey: walls split by level (' + rows.filter((r) => r.startsWith('Wall')).join(', ') + ')');
    await page.$eval('[data-qto-table]', (t) => t.scrollIntoView({ block: 'center' }));
    await shot(page, 'b20-01-totals');
    await page.evaluate(async (k) => { const v = document.querySelector('[data-canvas]').viewer; v.select([k]); }, await keyOf('W-101'));
    await page.selectOption('[data-qto-scope]', 'pick');
    const foot = await page.$eval('[data-qto-table] tfoot tr', (tr) => [...tr.cells].map((c) => c.textContent));
    ok(foot[1] === '1', 'the pick only: 1 element in the total');
    await page.selectOption('[data-qto-scope]', 'all');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-qto-csv]')]);
    const csv = fs.readFileSync(await dl.path(), 'utf8');
    const lines = csv.replace(/^\ufeff/, '').trim().split('\r\n');
    ok(csv.startsWith('\ufeff') && /^Class,Storey,Count,Qto_WallBaseQuantities\.Length/.test(lines[0]) && lines.some((l) => /^IfcWall,Level 1,4,16000|^IfcWall,Level 1,4,32000/.test(l)) && /^Total,,11,/.test(lines[lines.length - 1]), 'CSV ' + dl.suggestedFilename() + ': BOM, header, Wall/Level 1 row, total (' + lines[0] + ')');
  }

  if (want('b21')) {
    console.log('== B21 compare versions');
    await openFile(fixtureFile());
    ok(await page.isHidden('[data-compare-details]'), 'Compare is hidden with one model');
    await page.setInputFiles('[data-model-input]', fixtureFile({ rev: 'b' }, 'bimcraft-fixture-b.ifc'));
    await waitStatus(/^Added bimcraft-fixture-b\.ifc/);
    await page.$eval('[data-compare-details]', (d) => { d.open = true; });
    await page.waitForSelector('[data-cmp-old]');
    ok(await page.inputValue('[data-cmp-new]') === '0' && await page.inputValue('[data-cmp-old]') === '1', 'starts as the active model (newer) against the other');
    await page.selectOption('[data-cmp-old]', '0');
    await page.selectOption('[data-cmp-new]', '1');
    await page.click('[data-cmp-run]');
    await waitStatus(/^Compared: 1 added, 1 removed, 2 changed/);
    const heads = await page.$$eval('[data-cmp]', (ls) => Object.fromEntries(ls.map((l) => [l.dataset.cmp, [...l.querySelectorAll('[data-cmp-pick]')].map((b) => b.textContent)])));
    ok(heads.added[0]?.startsWith('W-203') && heads.removed[0]?.startsWith('W-104') && heads.changed.length === 2, 'lists: added W-203, removed W-104, changed ' + heads.changed.join(' / '));
    const st = await page.evaluate(() => window.bimcraftVis.state());
    ok(st.isolated.length === 4 && st.ghost, 'the four changes stay solid, the rest see-through');
    await page.click('[data-view="iso"]');
    await shot(page, 'b21-01-compare');
    await page.click('[data-cmp="changed"] [data-cmp-pick]');
    ok((await pickedKeys()).length === 1, 'a list row picks its element');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-cmp-csv]')]);
    const csv = fs.readFileSync(await dl.path(), 'utf8').replace(/^\ufeff/, '');
    ok(/^Change,GlobalId,Element,What,Before,After\r\n/.test(csv) && /\r\nChanged,\w+,W-201 .*Fixture_Data\.Cost,1100,1400/.test(csv) && /\r\nMoved,\w+,F-101 .*,,,0\.5/.test(csv), 'CSV ' + dl.suggestedFilename() + ': Cost 1100 → 1400 and the desk moved 0.5 m');
    await page.click('[data-cmp-clear]');
    ok((await page.evaluate(() => window.bimcraftVis.state())).isolated === null, 'Clear shows everything again');
    await page.click('[data-cmp-run]');
    await waitStatus(/^Compared:/);
    await page.click('[data-model-remove="1"]');
    await waitStatus(/^Took .* out of the scene/);
    ok(await page.isHidden('[data-compare-details]') && (await page.evaluate(() => window.bimcraftVis.state())).isolated === null, 'removing a model clears the comparison and hides Compare');
  }

  if (want('b10')) {
    console.log('== B10 schedules');
    await openFile(fixtureFile());
    ok(await page.evaluate(() => document.querySelector('[data-canvas]').viewer.meshes.some((m) => m.userData.space)), 'the space is loaded now (the Spaces button has a room to show)');
    await page.$eval('[data-qto-details]', (d) => { d.open = true; });   // open, whatever an earlier section left
    await page.waitForSelector('[data-qto-view]');
    await page.selectOption('[data-qto-view]', 'spaces');
    const sp = await page.$$eval('[data-qto-table] tbody tr', (trs) => trs.map((tr) => [...tr.cells].map((c) => c.textContent + (c.classList.contains('is-measured') ? '*' : ''))));
    ok(sp.length === 1 && sp[0].join('|') === '101|101 Office|Level 1|53.76*|155.904*', 'Spaces: ' + JSON.stringify(sp[0]) + ' (* = measured from its shape)');
    await page.$eval('[data-qto-table]', (t) => t.scrollIntoView({ block: 'center' }));
    await shot(page, 'b10-01-spaces');
    let [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-qto-csv]')]);
    let csv = fs.readFileSync(await dl.path(), 'utf8').replace(/^\ufeff/, '');
    ok(csv.startsWith('Number,Name,Storey,Area,Area from,Volume,Volume from\r\n101,101 Office,Level 1,53.76,"Shape (m², m³)",155.904,"Shape (m², m³)"\r\nTotal,,,53.76,,155.904,'), 'spaces CSV ' + dl.suggestedFilename());
    await page.selectOption('[data-qto-view]', 'rows');
    const n = await page.$$eval('[data-qto-table] tbody tr', (trs) => trs.length);
    ok(n === 11, 'One row per element: 11 rows (spaces are rooms, not elements)');
    [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-qto-csv]')]);
    csv = fs.readFileSync(await dl.path(), 'utf8').replace(/^\ufeff/, '').trim().split('\r\n');
    ok(/^GlobalId,Class,Qto_WallBaseQuantities\.Length/.test(csv[0]) && csv.length === 12 && csv.some((l) => /^\w{22},IfcWall,\d+/.test(l)), 'elements CSV ' + dl.suggestedFilename() + ': GlobalId first, a row each (' + csv[0].slice(0, 60) + '…)');
  }

  if (want('b22')) {
    console.log('== B22 4D schedule');
    await openFile(fixtureFile());
    await page.$eval('[data-4d-details]', (d) => { d.open = true; });
    await page.waitForSelector('[data-4d-template]');
    const [tdl] = await Promise.all([page.waitForEvent('download'), page.click('[data-4d-template]')]);
    const tpl = fs.readFileSync(await tdl.path(), 'utf8').replace(/^\ufeff/, '').trim().split('\r\n');
    ok(tpl[0] === 'Task,Start,Finish,Field,Value' && tpl.length === 3 && /^Level 1,\d{4}-\d\d-\d\d,\d{4}-\d\d-\d\d,Storey,Level 1$/.test(tpl[1]), 'template ' + tdl.suggestedFilename() + ': a task per storey (' + tpl[1] + ')');
    const csv = 'Task,Start,Finish,Field,Value\nLevel 1,2026-11-02,2026-11-13,Storey,Level 1\nLevel 2,2026-11-16,2026-11-27,Storey,Level 2\nTypo,2026-11-30,2026-12-01,Storey,Level 9\n';
    await page.setInputFiles('[data-4d-input]', { name: 'tasks.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
    await waitStatus(/^Opened tasks\.csv: 3 tasks/);
    ok(/Line 4: no element has Storey = Level 9/.test(await page.textContent('[data-4d-errors]')), 'a row that matches nothing is reported with its line');
    const legend = async () => page.$$eval('[data-4d-legend] li', (ls) => Object.fromEntries(ls.map((l) => [l.dataset['4dN'], Number(l.querySelector('.n').textContent)])));
    let lg = await legend();
    ok(await page.textContent('[data-4d-date]') === '2026-11-02' && lg.progress === 8 && lg.waiting === 3 && lg.built === 0, 'first day 2026-11-02: Level 1 in progress (8), Level 2 not started (3)');
    const st = await page.evaluate(() => ({ vis: window.bimcraftVis.state(), colors: document.querySelector('[data-canvas]').viewer.colorMap?.size ?? 0 }));
    ok(st.vis.ghost && st.vis.isolated.length === 8 && st.colors === 8, 'painted: 8 ochre, the 3 not started see-through');
    await page.click('[data-view="iso"]');
    await shot(page, 'b22-01-4d');
    await page.$eval('[data-4d-day]', (r) => { r.value = r.max; r.dispatchEvent(new Event('input', { bubbles: true })); });
    lg = await legend();
    ok(lg.built === 11 && lg.progress === 0 && (await page.evaluate(() => window.bimcraftVis.state())).isolated === null, 'the last day: all 11 built, shown in their own colors');
    await page.$eval('[data-4d-day]', (r) => { r.value = r.min; r.dispatchEvent(new Event('input', { bubbles: true })); });
    const d0 = await page.textContent('[data-4d-date]');
    await page.click('[data-4d-play]');
    await page.waitForTimeout(700);
    await page.click('[data-4d-play]');
    ok(await page.textContent('[data-4d-date]') > d0, 'Play moves the date on (' + d0 + ' → ' + await page.textContent('[data-4d-date]') + '), Pause stops it');
    await page.click('[data-4d-clear]');
    ok((await page.evaluate(() => window.bimcraftVis.state())).isolated === null && await page.evaluate(() => !document.querySelector('[data-canvas]').viewer.colorMap), 'Clear: back to normal');
  }

  if (want('h15')) {
    console.log('== 1.5 handoff');
    await openFile({ name: 'base-plan.dxf', mimeType: 'application/dxf', buffer: fs.readFileSync(path.join(REPO, 'fixtures/dwg/base-plan.dxf')) });
    const [tab] = await Promise.all([page.context().waitForEvent('page'), page.click('[data-edit-drawing]')]);
    await waitStatus(/^Opened base-plan\.dxf in CadCraft in a new tab/);
    await tab.waitForFunction(() => window.cadcraft?.doc && window.cadcraft.doc.model.size > 0, null, { timeout: 60000 });
    ok(!/handoff=/.test(tab.url()) && await tab.evaluate(() => window.cadcraft.doc.model.size) > 0, 'Edit in CadCraft: the drawing opens in the new tab, the address no longer carries the id (' + await tab.evaluate(() => window.cadcraft.doc.model.size) + ' objects)');
    await tab.close();
    const detailAccepts = (JSON.parse(fs.readFileSync(path.join(REPO, 'public_html/assets/apps/detailcraft/dev/manifest.json'), 'utf8')).accepts || []).includes('handoff');
    await openFile(fixtureFile());
    ok((await page.$('[data-handoff-ifc]') !== null) === detailAccepts, 'Open in DetailCraft is ' + (detailAccepts ? 'shown: its build takes a handoff' : 'not shown: DetailCraft\'s build does not declare "accepts": ["handoff"] yet'));
    if (detailAccepts) {
      const [dt] = await Promise.all([page.context().waitForEvent('page'), page.click('[data-handoff-ifc]')]);
      await waitStatus(/^Opened bimcraft-fixture\.ifc in DetailCraft/);
      await dt.waitForLoadState('domcontentloaded');
      await dt.waitForFunction(() => !/handoff=/.test(location.search), null, { timeout: 30000 });
      ok(true, 'DetailCraft took the model (the address no longer carries the id)');
      await dt.close();
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

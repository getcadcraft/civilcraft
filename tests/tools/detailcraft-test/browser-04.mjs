#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-04.mjs — DetailCraft's 0.4 part 2 items in headless Chromium at https://getcadcraft.com/lab/detailcraft
 * (session `detail`; the older checks stay in browser.mjs).
 *
 *   node tools/detailcraft-test/browser-04.mjs [--only d1,d2,…] [--out <shots dir>]
 * Run as root: like browser.mjs it uses `sudo -u www-data php tools/detailcraft-test/admin.php up|down` (test admin
 * detailcrafttest+cadcraft@projectz.xyz, disabled again at the end) and signs in once per run (the admin-login
 * throttle is 10 per 10 minutes for 127.0.0.1). One section per item; --only runs some of them.
 *
 *   d1  window and crossing selection by real drags (plan, 3D with Shift), "Change on all of them" (Varies, one undo
 *       step), Move by typed offset, the Move tool (M) by two clicked grid intersections with the ghost, Rotate 90° of
 *       everything (still builds), Mirror a copy in a grid line (doubles, still builds), Esc drops a window
 *   d2  drag a selected beam across the Level 2 plan onto grid B (snaps, one undo step), a free drag in 3D in 10 mm steps,
 *       Ctrl+drag up in 3D (z only), Esc mid-drag puts it back, a press on an unselected part still turns the view,
 *       a column dragged in an elevation
 *   d3  the sheet size list in the Drawings window (A1: the set made again, the PDF's pages are A1 — pdfinfo), the shop
 *       drawing window on the same setting (A4 PDF), Settings › DetailCraft › Sheet size kept over a reload
 *   d4  the Drawings window's format list: DXF R12 for this sheet (read by ezdxf in tools/detailcraft-test/venv) and all
 *       sheets (a zip of 12), DWG 2018 when dev/dwg/ has cc-dwg's writer (read back by lib/dwg)
 *   d13 the Phases panel: add a phase, a window round grid A's elevation put in phase 2 from Properties (one undo step),
 *       per-phase marks in the BOM tab, hide phase 2 (not drawn, Ctrl+A leaves it out), a refused removal, a new beam
 *       placed in the current phase, the saved file (format 2, phases)
 *   d14 Report on the toolbar opens the By phase tab (summary + one table per phase, per-phase marks), CSV and PDF downloads
 *       read back (the CSV's total, pdftotext)
 *   d15 Clashes tab: Check now on the sample (6, all the brace), Show selects both and centers the view, a stale note
 *       after an edit, no clashes once the brace is deleted
 *   d16 KISS on the toolbar: a .kss download read back (KISS,1.1 / H / D lines, quantities)
 *   d17 Drawings window issue log: status, Issue changed sheets (12 at rev A), a hole added → that sheet needs re-issue,
 *       Issue this sheet → rev B, the title block and revision table in the sheet, the PDF text
 *   d18 the anchor bolt plan in the Drawings window (GA-08): rods and schedules on the sheet, its PDF text
 *   files  1.2 + W2.19: an unsaved edit leaves a copy; a fresh page (?autosave=offer) after the first one closed shows the
 *       shell's "Recover your work?" and Recover brings the model back unsaved; Open goes through host.js (the plain
 *       input here) and Ctrl+S downloads <name>.detailcraft.json
 *   handoff  a model handed over with handoff.js sendHandoff (as BimCraft's "Open in DetailCraft" does) opens in the new
 *       tab, which drops ?handoff from its address; the view cube speaks the language file (?lang=en-XA)
 *   s8  touch (CDP Input.dispatchTouchEvent in a touch context): tap selects, a long press adds to the selection, two
 *       fingers pinch the view without selecting, a tap 25 px from a grid intersection places a column on it, one finger
 *       drags a selected beam onto the next grid, toolbar targets at least 44 px
 *   d5  Shear tabs from the Connect group on a skewed beam (built by the page's model): a tab per end, Properties "Shear
 *       tab" with its settings, no hard problems; Similar copies it as a shear tab
 *   x12 Settings › Assistants (host.js mounts it): off → refused; on with edit → tools/list has DetailCraft's 10 tools,
 *       member_add adds a beam as one "Assistant: add beam" undo step, the page shows it; Ctrl+Z takes it back
 *   d24 Cut list tab: the sample nested into 6 / 12 m bars; stock "12000" changes the bars to buy; CSV download
 *   d12 base plates with 4 stiffeners: the column's assembly sheet draws the stiffener behind the web dashed
 *   w24 Settings › Dragging to select: Lasso; plan Level 1: a lasso drawn to the right round A/1 takes what is wholly
 *       inside (not the brace), drawn to the left also the brace; Space twice → a fence across the A line takes footings
 *   d23 S → Place stair; click A/1 at Level 1 → a stair up to Level 2 (23 risers); click it → Properties "Stair ST1"
 *   d22 the sample's brace: select it, Connect › More › Gusset → 2 gussets, Clashes tab says no clashes
 *   d21 two W16x26 beams end to end: select one, Connect › More › Splice → a splice, Properties "Splice", 36 bolts
 *   d20 select the sample's base plate: Stiffeners select → 4, Plate washers → on: 8 new parts, DG1 washer note
 *   d19 issue all, add a hole to a beam: its assembly sheet shows a revision cloud with triangle "B" in the preview
 *   d9  Settings › European steel → a new footing has H16 / H20 bars; Settings › Rebar: BS 8666 codes and soft-metric
 *       names change the Bending schedule tab (21, 11; #16)
 * Fails on any console error or native dialog.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(REPO, 'tmp/shots/detailcraft-04'));
const ONLY = new Set((arg('--only', '') || '').split(',').filter(Boolean));
const run = (id) => !ONLY.size || ONLY.has(id);
fs.mkdirSync(OUT, { recursive: true });
const DL = fs.mkdtempSync(path.join(os.tmpdir(), 'dc04-dl-'));

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/detailcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
// host.js opens files with the File System Access picker when there is one; headless runs drive the plain
// <input type=file> instead (Playwright's file chooser), as tools/partcraft-test/browser.mjs does
await ctx.addInitScript(() => { window.showOpenFilePicker = undefined; });
let page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('dialog', (d) => { problems.push('native dialog: ' + d.message()); d.dismiss(); });

const dc = (fn, a) => page.evaluate(fn, a);
const settle = () => page.waitForTimeout(150);
/** A toolbar action; one in a closed "More" menu opens it first, as a person would. */
async function act(a) {
  const b = page.locator('.dc-tools [data-act="' + a + '"]').first();
  if (!(await b.isVisible())) await page.locator('.dc-tools details:has([data-act="' + a + '"]) > summary').click();
  await b.click();
}
async function download(action) {
  const [d] = await Promise.all([page.waitForEvent('download'), action()]);
  const f = path.join(DL, d.suggestedFilename());
  await d.saveAs(f);
  return f;
}
async function canvasBox() { return page.locator('[data-canvas]').boundingBox(); }
/** Screen point (page px) of a model point. */
async function at(p) { const s = await dc((pt) => window.detailcraft.nodeScreen(pt), p); const b = await canvasBox(); return { x: b.x + s.x, y: b.y + s.y }; }
async function clickModel(p) { const s = await at(p); await page.mouse.move(s.x, s.y); await settle(); await page.mouse.click(s.x, s.y); await settle(); }
/** A real drag from a to b (page px) in steps, with optional modifier held. */
async function drag(a, b, { shift = false, shot = null } = {}) {
  if (shift) await page.keyboard.down('Shift');
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) await page.mouse.move(a.x + (b.x - a.x) * i / 8, a.y + (b.y - a.y) * i / 8);
  await settle();
  if (shot) await page.screenshot({ path: path.join(OUT, shot) });
  await page.mouse.up();
  if (shift) await page.keyboard.up('Shift');
  await settle();
}
async function freshSample(view = '3d') {
  await page.evaluate(() => window.detailcraft?.model.markSaved()).catch(() => {});   // leaving with unsaved work asks (beforeunload)
  await page.goto(BASE + '/lab/detailcraft?space=paper', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.detailcraft && window.detailcraft.view, null, { timeout: 20000 });
  await dc(() => { localStorage.removeItem('detailcraft.clipboard'); localStorage.removeItem('detailcraft.settings'); });
  await act('sample');
  await page.waitForFunction(() => window.detailcraft.built.parts.length === 25);
  if (view !== '3d') await page.click('[data-view="' + view + '"]');
  await settle();
}
const sel = () => dc(() => window.detailcraft.selected.map((r) => r.kind + ':' + r.id));
const kinds = () => dc(() => { const d = window.detailcraft; const out = {}; for (const r of d.selected) { const k = r.kind === 'member' ? d.model.member(r.id).type : r.kind; out[k] = (out[k] || 0) + 1; } return out; });

try {
  // ---- sign in once ----
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/detailcraft?space=paper', { waitUntil: 'domcontentloaded' });
  ok(page.url().includes('/lab/detailcraft'), 'lab page opens for staff', page.url());

  if (run('d1')) {
    console.log('\nD1 — window selection, change many, move, rotate, mirror');
    await freshSample('plan');
    await page.selectOption('[data-vlevel]', 'Level 1');
    await settle();
    // a window round the whole frame in the Level 1 plan: columns, brace, base plates, footings — not the beams above
    const lo = await at([-2500, 9500, 0]), hi = await at([19000, -2500, 0]);
    await drag(lo, hi, { shot: 'd1-01-window-drag.png' });
    const k1 = await kinds();
    ok(k1.column === 6 && k1.brace === 1 && !k1.beam && k1.footing === 7 && k1.conn === 6, 'plan Level 1, drag to the right round everything: 6 columns, the brace, 6 base plates, 7 footings — not the beams above the cut', JSON.stringify(k1));
    ok(/wholly inside/.test(await page.textContent('[data-status]')), 'status bar says the window took what is wholly inside');
    ok((await page.textContent('[data-props-h]')).includes('selected'), 'Properties: "N selected"');
    // change many: profile varies (W12x50 columns vs the HSS brace); set the material on all 7
    const many = await dc(() => { const s = document.querySelector('[data-many="profile"]'); return { has: !!document.querySelector('[data-many-edit]'), profile: s?.value, varies: s?.options[0]?.textContent }; });
    ok(many.has && many.profile === '' && many.varies === 'Varies', 'Change on all of them: Profile shows Varies', JSON.stringify(many));
    await page.screenshot({ path: path.join(OUT, 'd1-02-change-many.png') });
    const undo0 = await dc(() => window.detailcraft.model.undoStack.length);
    await page.selectOption('[data-many="material"]', 'S355');
    await settle();
    const mats = await dc(() => window.detailcraft.selected.filter((r) => r.kind === 'member').map((r) => window.detailcraft.model.member(r.id).material));
    ok(mats.length === 7 && mats.every((m) => m === 'S355') && await dc(() => window.detailcraft.model.undoStack.length) === undo0 + 1, 'material S355 on all 7 members in one undo step');
    ok(/set on 7 members/.test(await page.textContent('[data-status]')), 'status: "Material set on 7 members."');
    await page.keyboard.press('Control+z');
    await settle();
    ok(await dc(() => window.detailcraft.model.state.members.filter((m) => m.type === 'column').every((m) => m.material === 'A992')), 'Ctrl+Z: back to A992');
    // crossing: right to left round column A/1 takes the column, its footing, the brace and base plate it touches
    await page.keyboard.press('Escape');
    const c1 = await at([400, -400, 0]), c2 = await at([-400, 400, 0]);
    await drag(c1, c2, { shot: 'd1-03-crossing-drag.png' });
    const k2 = await kinds();
    ok(k2.column === 1 && k2.footing === 1 && k2.brace === 1, 'drag to the left (crossing) round A/1: the column, its footing and the brace that touches the box', JSON.stringify(k2));
    ok(await dc(() => document.querySelector('.dc-winsel')?.hidden === true), 'the window box is gone after release');
    // Esc while dragging drops the window
    const e1 = await at([5000, -1000, 0]), e2 = await at([7000, 1000, 0]);
    await page.mouse.move(e1.x, e1.y); await page.mouse.down();
    for (let i = 1; i <= 5; i++) await page.mouse.move(e1.x + (e2.x - e1.x) * i / 5, e1.y + (e2.y - e1.y) * i / 5);
    const shown = await dc(() => !document.querySelector('.dc-winsel').hidden);
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await settle();
    ok(shown && /dropped/.test(await page.textContent('[data-status]')), 'Esc while dragging drops the window');
    // 3D: Shift+drag adds a window to the selection; a plain drag still turns the model
    await page.click('[data-view="3d"]');
    await settle();
    await page.keyboard.press('Escape');
    await clickModel([3000, 0, 3990]);
    const before3d = (await sel()).length;
    const cam0 = await dc(() => window.detailcraft.view.camera.position.toArray().join());
    const b1 = await at([-1000, 8000, 5000]), b2 = await at([13000, -1000, -1000]);
    await drag({ x: (b1.x + b2.x) / 2 + 200, y: (b1.y + b2.y) / 2 }, { x: (b1.x + b2.x) / 2 + 260, y: (b1.y + b2.y) / 2 + 20 });
    const cam1 = await dc(() => window.detailcraft.view.camera.position.toArray().join());
    ok(cam0 !== cam1 && (await sel()).length === before3d, '3D: a plain drag turns the model and leaves the selection alone');
    await page.click('[data-act="fit"]');
    await settle();
    const box = await canvasBox();
    await drag({ x: box.x + 5, y: box.y + 60 }, { x: box.x + box.width - 5, y: box.y + box.height - 5 }, { shift: true, shot: 'd1-04-3d-shift-window.png' });
    const n3 = (await sel()).length;
    ok(n3 > before3d + 10, '3D: Shift+drag to the right adds what is wholly inside to the selection (' + before3d + ' → ' + n3 + ')');
    // move by typed offset: one beam down 500 mm, then Ctrl+Z
    await page.keyboard.press('Escape');
    await clickModel([3000, 0, 3990]);
    const beamId = await dc(() => window.detailcraft.selection?.id);
    const z0 = await dc((id) => window.detailcraft.model.member(id).start[2], beamId);
    await page.fill('#dc-xfoff2', '-500');
    await page.click('[data-xf-move] button[type="submit"]');
    await settle();
    ok(await dc((id) => window.detailcraft.model.member(id).start[2], beamId) === z0 - 500, 'Move by x 0, y 0, z −500: the beam is 500 mm lower');
    ok(/Moved 1 member by x 0, y 0, z -500 mm/.test(await page.textContent('[data-status]')) && await dc(() => window.detailcraft.built.problems.length) === 0, 'status says so; its end plates follow it down the columns (no problems)', await page.textContent('[data-status]'));
    await page.keyboard.press('Control+z');
    await settle();
    ok(await dc((id) => window.detailcraft.model.member(id).start[2], beamId) === z0, 'Ctrl+Z puts it back');
    // the Move tool: M, click from A/2 then to A/3 (Level 2): the ghost follows, the beam lands 6 m along
    await clickModel([3000, 0, 3990]);
    const x0 = await dc((id) => window.detailcraft.model.member(id).start[0], beamId);
    await page.keyboard.press('m');
    await settle();
    ok(await dc(() => window.detailcraft.tool) === 'move' && (await page.textContent('[data-props-h]')) === 'Move', 'M starts the Move tool (Properties: Move)');
    await clickModel([6000, 0, 4000]);
    const to = await at([12000, 0, 4000]);
    await page.mouse.move(to.x, to.y);
    await settle();
    ok(await dc(() => window.detailcraft.view.ghost?.length === 1), 'after the first click a dashed ghost of the beam follows the pointer');
    await page.screenshot({ path: path.join(OUT, 'd1-05-move-ghost.png') });
    await page.mouse.click(to.x, to.y);
    await settle();
    ok(await dc((id) => window.detailcraft.model.member(id).start[0], beamId) === x0 + 6000 && await dc(() => window.detailcraft.tool) === 'select', 'second click: moved 6000 mm along x, back to Select with it still selected');
    await page.keyboard.press('Control+z');
    await settle();
    // rotate everything 90° about the middle: still builds, same parts
    await page.keyboard.press('Control+a');
    await settle();
    const marks0 = await dc(() => window.detailcraft.marks.parts.map((p) => p.profile + ' ' + p.length.toFixed(2) + ' ×' + p.count).sort().join('|'));
    await page.fill('#dc-xfdeg', '90');
    await page.click('[data-xf-rotate] button[type="submit"]');
    await settle();
    ok(await dc(() => window.detailcraft.built.problems.length) === 0 && await dc(() => window.detailcraft.marks.parts.map((p) => p.profile + ' ' + p.length.toFixed(2) + ' ×' + p.count).sort().join('|')) === marks0, 'Ctrl+A, rotate 90° about the middle: every connection still fits, same parts');
    await page.screenshot({ path: path.join(OUT, 'd1-06-rotated.png') });
    await page.keyboard.press('Control+z');
    await settle();
    // mirror a copy in grid 3
    await page.keyboard.press('Control+a');
    await settle();
    await page.check('[data-xf-copy]');
    await page.selectOption('#dc-xfline', 'x:3');
    await page.click('[data-xf-mirror] button[type="submit"]');
    await settle();
    const after = await dc(() => ({ m: window.detailcraft.model.state.members.length, c: window.detailcraft.model.state.connections.length, f: window.detailcraft.model.state.footings.length, p: window.detailcraft.built.problems.length }));
    ok(after.m === 22 && after.c === 28 && after.f === 14 && after.p === 0, 'Ctrl+A, Keep the original, Mirror in grid 3: 22 members, 28 connections, 14 footings, no problems', JSON.stringify(after));
    await page.click('[data-view="3d"]');
    await page.click('[data-act="fit"]');
    await settle();
    await page.screenshot({ path: path.join(OUT, 'd1-07-mirrored-copy.png') });
    ok(/Copied 11 members and 7 footings mirrored in grid line 3/.test(await page.textContent('[data-status]')), 'status: "Copied 11 members and 7 footings mirrored in grid line 3."', await page.textContent('[data-status]'));
  }

  if (run('d2')) {
    console.log('\nD2 — drag members');
    await freshSample('plan');
    await page.selectOption('[data-vlevel]', 'Level 2');
    await settle();
    await clickModel([3000, 0, 3990]);
    const id = await dc(() => window.detailcraft.selection?.id);
    const undo0 = await dc(() => window.detailcraft.model.undoStack.length);
    const a = await at([3000, 0, 4000]), b = await at([3000, 6950, 4000]);
    await drag(a, b, { shot: 'd2-01-drag-plan.png' });
    const m1 = await dc((i) => window.detailcraft.model.member(i), id);
    ok(m1.start.join() === '0,7000,4000' && m1.end.join() === '6000,7000,4000', 'plan: the selected beam dragged ~6950 mm toward grid B snaps exactly onto B (B/1 → B/2)', JSON.stringify(m1.start));
    ok(await dc(() => window.detailcraft.model.undoStack.length) === undo0 + 1 && /Moved 1 member by x 0, y 7000, z 0 mm/.test(await page.textContent('[data-status]')), 'one undo step; the status bar says the offset');
    await page.keyboard.press('Control+z');
    await settle();
    // 3D: a press on an unselected part turns the view; the selected beam stays put
    await page.click('[data-view="3d"]');
    await settle();
    await clickModel([3000, 0, 3990]);
    const cam0 = await dc(() => window.detailcraft.view.camera.position.toArray().join());
    const colTop = await at([12000, 7000, 2000]);
    await drag(colTop, { x: colTop.x + 80, y: colTop.y + 30 });
    ok(await dc(() => window.detailcraft.view.camera.position.toArray().join()) !== cam0 && (await dc((i) => window.detailcraft.model.member(i).start.join(), id)) === '0,0,4000', 'press on an unselected column and drag: the view turns, nothing moves');
    await page.click('[data-act="fit"]');
    await settle();
    // free drag in 3D: 10 mm steps, z unchanged
    const p0 = await at([3000, 0, 3990]);
    await drag(p0, { x: p0.x + 37, y: p0.y + 23 });
    const m2 = await dc((i) => window.detailcraft.model.member(i), id);
    ok(m2.start[2] === 4000 && (m2.start[0] !== 0 || m2.start[1] !== 0) && m2.start.every((v) => Math.abs(v / 10 - Math.round(v / 10)) < 1e-9), '3D: a short drag moves it across the level in 10 mm steps (' + m2.start.join(', ') + ')');
    await page.keyboard.press('Control+z');
    await settle();
    // Esc while dragging: nothing changes
    const json0 = await dc(() => JSON.stringify(window.detailcraft.model.state));
    const p1 = await at([3000, 0, 3990]);
    await page.mouse.move(p1.x, p1.y); await page.mouse.down();
    for (let i = 1; i <= 6; i++) await page.mouse.move(p1.x + i * 15, p1.y + i * 8);
    await settle();
    const ghost = await dc(() => !!window.detailcraft.view.partDrag?.moved);
    await page.screenshot({ path: path.join(OUT, 'd2-02-drag-3d-ghost.png') });
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await settle();
    ok(ghost && await dc(() => JSON.stringify(window.detailcraft.model.state)) === json0 && /nothing moved/.test(await page.textContent('[data-status]')), 'Esc mid-drag (ghost showing): put back, nothing changed');
    // Ctrl+drag in 3D: up and down only
    const p2 = await at([3000, 0, 3990]);
    await page.keyboard.down('Control');
    await drag(p2, { x: p2.x + 5, y: p2.y - 60 });
    await page.keyboard.up('Control');
    const m3 = await dc((i) => window.detailcraft.model.member(i), id);
    ok(m3.start[0] === 0 && m3.start[1] === 0 && m3.start[2] > 4000, 'Ctrl+drag up in 3D: only z changes (' + m3.start.join(', ') + ')');
    await page.keyboard.press('Control+z');
    await settle();
    // elevation on grid A: a column dragged sideways snaps onto the next grid line
    await page.click('[data-view="elevation"]');
    await page.selectOption('[data-vgrid]', 'A');
    await settle();
    await page.keyboard.press('Escape');
    await clickModel([12000, 0, 2000]);
    const col = await dc(() => window.detailcraft.selection?.id);
    const c0 = await at([12000, 0, 2000]), c1 = await at([18050, 0, 2000]);
    await drag(c0, c1);
    const mc = await dc((i) => window.detailcraft.model.member(i), col);
    ok(mc && mc.start[1] === 0 && mc.start[2] === 0 && mc.start[0] !== 12000, 'elevation: a column dragged sideways stays on grid A and its level (x ' + mc?.start[0] + ')');
  }

  if (run('d3')) {
    console.log('\nD3 — sheet sizes');
    await freshSample('3d');
    await act('drawings');
    await page.waitForSelector('[data-dwg][open]');
    const p0 = await dc(() => ({ v: document.querySelector('[data-dwg-paper]').value, n: document.querySelector('[data-dwg-paper]').options.length, note: document.querySelector('[data-dwg-note]').textContent }));
    ok(p0.v === 'A3' && p0.n === 7 && /12 sheets \(A3/.test(p0.note), 'Drawings window: sheet size list (7 sizes), A3 to start', JSON.stringify(p0));
    await page.selectOption('[data-dwg-paper]', 'A1');
    await settle();
    const p1 = await dc(() => ({ note: document.querySelector('[data-dwg-note]').textContent, w: window.detailcraft.openDrawingSet?.sheets[0].w, opt: document.querySelector('[data-dwg-sheet]').options[0].textContent }));
    ok(/A1 \(841 × 594 mm\)/.test(p1.note) && p1.w === 841, 'A1 chosen: the set is made again on 841 × 594 mm', JSON.stringify(p1));
    await page.screenshot({ path: path.join(OUT, 'd3-01-drawings-A1.png') });
    const f = await download(() => page.click('[data-dwg-all]'));
    let info = '';
    try { info = execFileSync('pdfinfo', [f], { encoding: 'utf8' }); } catch { info = ''; }
    ok(!info || (/Pages:\s+12/.test(info) && /Page size:\s+2383\.9\d* x 1683\.7\d*/.test(info)), 'All sheets (PDF): 12 A1 pages (pdfinfo)', (info.match(/Page size:.*$/m) || ['no pdfinfo'])[0]);
    await page.click('[data-dwg-close]');
    await clickModel([3000, 0, 3990]);
    await act('shop');
    await page.waitForSelector('[data-shop][open]');
    ok(await dc(() => document.querySelector('[data-shop-paper]').value) === 'A1' && /A1 \(841 × 594 mm\) landscape/.test(await page.textContent('[data-shop-note]')), 'shop drawing window: the same sheet size (A1)');
    await page.selectOption('[data-shop-paper]', 'A4');
    await settle();
    ok(/A4 \(297 × 210 mm\) landscape/.test(await page.textContent('[data-shop-note]')), 'changed to A4 there: the shop drawing is made again on A4');
    await page.screenshot({ path: path.join(OUT, 'd3-02-shop-A4.png') });
    const g = await download(() => page.click('[data-shop-pdf]'));
    try { info = execFileSync('pdfinfo', [g], { encoding: 'utf8' }); } catch { info = ''; }
    ok(!info || /Page size:\s+841\.89 x 595\.27/.test(info), 'shop drawing PDF is A4 (pdfinfo)', (info.match(/Page size:.*$/m) || ['no pdfinfo'])[0]);
    await page.click('[data-shop-close]');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.detailcraft && window.detailcraft.view);
    await page.keyboard.press('Control+,');
    await page.waitForSelector('[data-app-settings][open]');
    await settle();
    ok(await dc(() => document.querySelector('[name="dcPaper"]')?.value) === 'A4' && await dc(() => window.detailcraft.settings.paper) === 'A4', 'after a reload, Settings › DetailCraft › Sheet size says A4');
    await page.screenshot({ path: path.join(OUT, 'd3-03-settings.png') });
    await page.keyboard.press('Escape');
    await dc(() => localStorage.removeItem('detailcraft.settings'));
  }

  if (run('d4')) {
    console.log('\nD4 — drawings as DWG and DXF');
    await freshSample('3d');
    await act('drawings');
    await page.waitForSelector('[data-dwg][open]');
    await page.selectOption('[data-dwg-format]', 'dxf');
    ok(await page.textContent('[data-dwg-one-label]') === 'This sheet (DXF (R12))' && await page.textContent('[data-dwg-all-label]') === 'All sheets (DXF (R12))', 'format list: DXF chosen, the buttons say so');
    await page.selectOption('[data-dwg-sheet]', '8');
    await settle();
    const f = await download(() => page.click('[data-dwg-one]'));
    ok(/\.dxf$/.test(f), 'This sheet → a .dxf file (' + path.basename(f) + ')');
    const PY = path.join(REPO, 'tools/detailcraft-test/venv/bin/python');
    if (fs.existsSync(PY)) {
      const d = JSON.parse(execFileSync(PY, [path.join(REPO, 'tools/detailcraft-test/dxf_check.py'), f, '--encoding', 'cp1252'], { encoding: 'utf8' }));
      const n = await dc(() => window.detailcraft.openDrawingSet.sheets[8].items.filter((i) => i.k === 'text' && String(i.s).trim()).length);
      ok(d.version === 'AC1009' && d.audit_errors === 0 && d.counts.TEXT === n && d.layers['DC-HIDDEN']?.linetype === 'DC_HIDDEN', 'ezdxf reads it: R12, no audit errors, all ' + n + ' words, DC-HIDDEN dashed', JSON.stringify({ v: d.version, a: d.audit_errors, t: d.counts.TEXT }));
    }
    const z = await download(() => page.click('[data-dwg-all]'));
    let list = '';
    try { list = execFileSync('unzip', ['-l', z], { encoding: 'utf8' }); } catch (e) { list = String(e.stdout || ''); }
    ok(/\.zip$/.test(z) && (list.match(/\.dxf/g) || []).length === 12, 'All sheets → one zip of 12 .dxf files (unzip -l)');
    ok(/12 sheets downloaded as DXF \(R12\) in one zip/.test(await page.textContent('[data-status]')), 'status bar says so');
    if (fs.existsSync(path.join(REPO, 'public_html/assets/apps/detailcraft/dev/dwg/write.js'))) {
      await page.selectOption('[data-dwg-format]', 'dwg-AC1032');
      const g = await download(() => page.click('[data-dwg-one]'));
      const { readDwg } = await import(path.join(REPO, 'lib/dwg/read.js'));
      const back = readDwg(new Uint8Array(fs.readFileSync(g)));
      const ms = back.blocks.find((b) => b.name === '*Model_Space');
      ok(/\.dwg$/.test(g) && back.version === 'AC1032' && ms.entities.some((e) => e.type === 'TEXT'), 'DWG (2018 format): a .dwg that cc-dwg reads back (' + ms.entities.length + ' objects)');
    } else console.log('  (dev/dwg/ has no writer yet: DWG in the browser not checked)');
    await page.screenshot({ path: path.join(OUT, 'd4-01-format.png') });
    await page.click('[data-dwg-close]');
  }

  if (run('d13')) {
    console.log('\nD13 — phases');
    await freshSample('elevation');
    await page.selectOption('[data-vgrid]', 'A');
    await settle();
    const p0 = await dc(() => [...document.querySelectorAll('[data-phases] li')].map((li) => li.textContent.trim()));
    ok(p0.length === 1 && /18 parts/.test(p0[0]), 'Phases panel: one phase with all 18 parts (11 members, 7 footings)', JSON.stringify(p0));
    await page.click('[data-phase-add]');
    await settle();
    ok(await dc(() => document.querySelectorAll('[data-phases] li').length) === 2 && await dc(() => document.querySelector('[data-phase-current]').value) === '2', 'Add phase: phase 2 listed, new parts go in it');
    await page.fill('[data-phase-name="2"]', 'Second lift');
    await page.press('[data-phase-name="2"]', 'Enter');
    await settle();
    // grid A's elevation: window round everything in it
    const lo = await at([-2000, 0, -1500]), hi = await at([14000, 0, 5000]);
    await drag(lo, hi);
    const k = await kinds();
    const undo0 = await dc(() => window.detailcraft.model.undoStack.length);
    await page.selectOption('[data-phase-of]', '2');
    await settle();
    const ph = await dc(() => ({ m: window.detailcraft.model.state.members.filter((x) => x.phase === 2).length, f: window.detailcraft.model.state.footings.filter((x) => x.phase === 2).length }));
    ok(ph.m === (k.column || 0) + (k.beam || 0) + (k.brace || 0) && ph.m === 6 && await dc(() => window.detailcraft.model.undoStack.length) === undo0 + 1, 'window round grid A → Phase 2 in Properties: its 6 members (and ' + ph.f + ' footings) in phase 2, one undo step', JSON.stringify({ k, ph }));
    await page.click('[data-tab="bom"]');
    const bom = await dc(() => [...document.querySelectorAll('.dc-table')[0].querySelectorAll('tbody tr td:first-child')].map((td) => td.textContent));
    ok(bom.includes('1-b1') && bom.includes('2-b1') && bom.includes('2-br1'), 'BOM: marks numbered per phase (1-b1, 2-b1, 2-br1 …)', bom.join(' '));
    await page.screenshot({ path: path.join(OUT, 'd13-01-phases.png') });
    // hide phase 2
    await page.click('[data-view="3d"]');
    await settle();
    const before = await dc(() => window.detailcraft.view.pickables.length);
    await page.uncheck('[data-phase-show="2"]');
    await settle();
    const after = await dc(() => window.detailcraft.view.pickables.length);
    ok(after < before, 'phase 2 hidden: fewer parts drawn (' + before + ' → ' + after + ')');
    await page.keyboard.press('Control+a');
    await settle();
    const all = await kinds();
    ok(all.column === 3 && all.beam === 2 && !all.brace, 'Ctrl+A with phase 2 hidden: only phase 1 (3 columns, 2 beams, no brace)', JSON.stringify(all));
    await page.screenshot({ path: path.join(OUT, 'd13-02-phase2-hidden.png') });
    await page.check('[data-phase-show="2"]');
    await page.keyboard.press('Escape');
    // removing a phase with parts is refused
    await page.click('[data-phase-remove="2"]');
    await settle();
    ok(/still has/.test(await page.textContent('[data-status]')) && await dc(() => window.detailcraft.model.state.phases.length) === 2, 'removing phase 2 (with parts) is refused and says why');
    // a new beam goes in the current phase (2)
    await page.keyboard.press('b');
    await settle();
    await page.click('[data-by-grid] button[type="submit"]');
    await settle();
    const nb = await dc(() => { const ms = window.detailcraft.model.state.members; return ms[ms.length - 1]; });
    ok(nb.type === 'beam' && nb.phase === 2, 'a beam placed with Add by grid goes in phase 2 (the current phase)');
    await page.keyboard.press('Escape');
    const f = await download(() => page.keyboard.press('Control+s'));
    const saved = JSON.parse(fs.readFileSync(f, 'utf8'));
    ok(saved.version === 2 && saved.phases.length === 2 && saved.phases[1].name === 'Second lift' && saved.members.some((x) => x.phase === 2), 'saved file: format 2 with both phases, the name, and each part\'s phase');
  }

  if (run('d14')) {
    console.log('\nD14 — material and weight report by phase');
    await freshSample('3d');
    await page.click('[data-phase-add]');
    await page.keyboard.press('Escape');
    await page.click('[data-view="elevation"]');
    await page.selectOption('[data-vgrid]', 'A');
    await settle();
    await drag(await at([-2000, 0, -1500]), await at([14000, 0, 5000]));
    await page.selectOption('[data-phase-of]', '2');
    await settle();
    await act('report');
    await settle();
    const tab = await dc(() => ({ sel: document.querySelector('[data-tab="phases"]').getAttribute('aria-selected'), h: [...document.querySelectorAll('[data-report] h3')].map((h) => h.textContent), first: [...document.querySelectorAll('[data-report] .dc-table')[0].querySelectorAll('tbody tr')].map((tr) => tr.firstChild.textContent) }));
    ok(tab.sel === 'true' && tab.h[0] === 'Summary by phase' && tab.h.includes('Phase 1') && tab.h.includes('Phase 2') && tab.first.join(',') === 'Phase 1,Phase 2,Total', 'Report: the By phase tab with the summary (Phase 1, Phase 2, Total) and a table per phase', JSON.stringify(tab));
    await page.screenshot({ path: path.join(OUT, 'd14-01-by-phase.png') });
    const c = await download(() => page.click('[data-rep-csv]'));
    const csv = fs.readFileSync(c, 'utf8');
    ok(/weight report\.csv$/.test(c) && /^\ufeff/.test(csv) && /\nTotal,25,3082\.2,/.test(csv.replace(/\r/g, '')), 'Download CSV: <name> weight report.csv, BOM, summary total 25 parts 3082.2 kg');
    const p = await download(() => page.click('[data-rep-pdf]'));
    let txt = '';
    try { txt = execFileSync('pdftotext', ['-layout', p, '-'], { encoding: 'utf8' }); } catch { txt = ''; }
    ok(!txt || (/Material and weight report/.test(txt) && /2-b1/.test(txt) && /Page 1 of/.test(txt)), 'Download PDF: title, per-phase marks and page numbers (pdftotext)');
  }

  if (run('d15')) {
    console.log('\nD15 — clash check');
    await freshSample('3d');
    await page.click('[data-tab="clashes"]');
    await settle();
    ok(/Check now looks at the phases shown/.test(await page.textContent('[data-report]')), 'Clashes tab: says what it checks before the first run');
    await page.click('[data-clash-run]');
    await settle();
    const rows = await dc(() => [...document.querySelectorAll('[data-clash]')].map((tr) => [...tr.children].slice(0, 2).map((td) => td.textContent.trim()).join(' × ')));
    ok(rows.length === 6 && rows.every((r) => /HSS4x4x1\/4/.test(r)) && /\(6\)/.test(await page.textContent('[data-tab="clashes"]')), 'Check now: 6 clashes, each with the brace (HSS4x4x1/4); the tab says (6)', rows.join(' | '));
    const cam0 = await dc(() => window.detailcraft.view.controls.target.toArray().join());
    await page.click('[data-clash] .dc-linkbtn');
    await settle();
    ok((await sel()).length === 2 && await dc(() => window.detailcraft.view.controls.target.toArray().join()) !== cam0, 'Show: both parts selected, the view moves to the clash');
    await page.screenshot({ path: path.join(OUT, 'd15-01-clash.png') });
    // delete the brace: the list is stale, then clean
    await page.keyboard.press('Escape');
    await dc(() => { const b = window.detailcraft.model.state.members.find((m) => m.type === 'brace'); window.detailcraft.setSelection([{ kind: 'member', id: b.id }]); });
    await page.keyboard.press('Delete');
    await settle();
    ok(/model changed since this check/.test(await page.textContent('[data-report]')), 'after deleting the brace the list says the model changed');
    await page.click('[data-clash-run]');
    await settle();
    ok(/No clashes among the 31 parts and footings/.test(await page.textContent('[data-report]')), 'Check now again: no clashes among the 31 parts and footings');
  }

  if (run('d16')) {
    console.log('\nD16 — KISS export');
    await freshSample('3d');
    const f = await download(() => act('kiss'));
    const txt = fs.readFileSync(f, 'latin1');
    const L = txt.split('\r\n').filter(Boolean).map((l) => l.split(','));
    ok(/\.kss$/.test(f) && L[0].join() === 'KISS,1.1,DetailCraft' && L[1][0] === 'H' && L[1][6] === 'F', 'KISS button: <name>.kss, KISS 1.1, H line with Metric F (all AISC)');
    ok(L.filter((x) => x[0] === 'D' && x[1] !== 'BOLTS').reduce((t, x) => t + Number(x[5]), 0) === 25 && L.filter((x) => x[0] === 'M').length === 4, '25 parts in D lines, 4 assembly (M) lines');
    ok(/KISS file downloaded: job SAMPLEFR, imperial sizes/.test(await page.textContent('[data-status]')), 'status bar names the job number and units');
  }

  if (run('d17')) {
    console.log('\nD17 — drawing issue log');
    await freshSample('3d');
    await act('drawings');
    await page.waitForSelector('[data-dwg][open]');
    ok(await page.textContent('[data-issue-status]') === 'Not issued yet.' && await page.textContent('[data-issue-all]') === 'Issue changed sheets (12)', 'new set: "Not issued yet", Issue changed sheets (12)');
    await page.click('[data-issue-all]');
    await settle();
    ok(/Rev A, issued .*unchanged since/.test(await page.textContent('[data-issue-status]')) && await dc(() => window.detailcraft.model.state.issues.length) === 12 && await page.isDisabled('[data-issue-one]'), 'issued: rev A for all 12, this sheet current, Issue this sheet greyed');
    await page.click('[data-dwg-close]');
    // add a hole to the first beam: its sheet needs re-issue
    await dc(() => { const d = window.detailcraft; const b = d.model.state.members.find((m) => m.type === 'beam'); d.model.change('Hole', (tx) => tx.addHole(b.id, { face: 'web', x: 900, y: 60, d: 22 })); });
    await act('drawings');
    await page.waitForSelector('[data-dwg][open]');
    const flagged = await dc(() => [...document.querySelectorAll('[data-dwg-sheet] option')].filter((o) => /needs re-issue/.test(o.textContent)).map((o) => o.value));
    ok(flagged.length >= 1, 'the sheet list marks what needs re-issue (' + flagged.length + ')');
    await page.selectOption('[data-dwg-sheet]', flagged[flagged.length - 1]);
    await settle();
    ok(/needs re-issue/.test(await page.textContent('[data-issue-status]')), 'status (red): changed since rev A, needs re-issue');
    await page.fill('[data-issue-note]', 'Web hole added');
    await page.click('[data-issue-one]');
    await settle();
    const sh = await dc(() => window.detailcraft.openDrawingSet.sheets[Number(document.querySelector('[data-dwg-sheet]').value)]);
    const words = sh.items.filter((i) => i.k === 'text').map((i) => i.s);
    ok(words.includes(sh.number + '  rev B') && words.includes('Web hole added') && /Rev B, issued/.test(await page.textContent('[data-issue-status]')), 'Issue this sheet: rev B in the title block, "Web hole added" in its revision table');
    await page.screenshot({ path: path.join(OUT, 'd17-01-issue.png') });
    const f = await download(() => page.click('[data-dwg-one]'));
    let txt = '';
    try { txt = execFileSync('pdftotext', ['-layout', f, '-'], { encoding: 'utf8' }); } catch { txt = ''; }
    ok(!txt || (/rev B/.test(txt) && /Web hole added/.test(txt) && /Description/.test(txt)), 'the sheet\'s PDF has the revision and the revision table (pdftotext)');
    await page.click('[data-dwg-close]');
  }

  if (run('d18')) {
    console.log('\nD18 — anchor bolt plan');
    await freshSample('3d');
    await act('drawings');
    await page.waitForSelector('[data-dwg][open]');
    const opt = await dc(() => [...document.querySelectorAll('[data-dwg-sheet] option')].find((o) => /Anchor bolt plan/.test(o.textContent))?.value);
    ok(opt === '7', 'the sheet list has GA-08 Anchor bolt plan after the elevations');
    await page.selectOption('[data-dwg-sheet]', opt);
    await settle();
    await page.screenshot({ path: path.join(OUT, 'd18-01-anchor-plan.png') });
    const f = await download(() => page.click('[data-dwg-one]'));
    let txt = '';
    try { txt = execFileSync('pdftotext', ['-layout', f, '-'], { encoding: 'utf8' }); } catch { txt = ''; }
    ok(!txt || (/Anchor bolt plan/.test(txt) && /Anchor rods/.test(txt) && /R1\s+24\s+20\s+575/.test(txt) && /Base plates/.test(txt) && /A\/1/.test(txt)), 'its PDF: the plan, the rod schedule (R1 24 20 575 …) and the base plate schedule (pdftotext)');
    await page.click('[data-dwg-close]');
  }

  if (run('files')) {
    console.log('\n1.2 + W2.19 — autosave and files through host.js');
    await freshSample('3d');
    await dc(() => { const d = window.detailcraft; d.model.change('Rename', (tx) => tx.setName('Autosave check')); });
    await page.waitForTimeout(3500);                     // the copy is written ~2 s after the last edit
    const p2 = await ctx.newPage();
    p2.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
    await page.evaluate(() => { window.onbeforeunload = null; });
    await page.close({ runBeforeUnload: false });
    await p2.goto(BASE + '/lab/detailcraft?space=paper&autosave=offer', { waitUntil: 'domcontentloaded' });
    await p2.waitForSelector('[data-autosave-recover]', { timeout: 15000 });
    await p2.screenshot({ path: path.join(OUT, 'files-01-recover.png') });
    await p2.click('[data-autosave-recover]');
    await p2.waitForFunction(() => window.detailcraft?.model.state.name === 'Autosave check', null, { timeout: 10000 });
    ok(await p2.evaluate(() => window.detailcraft.model.dirty && window.detailcraft.model.state.members.length === 11), 'Recover your work? → Recover: the renamed sample comes back with its 11 members, not saved yet');
    page = p2;
    await page.keyboard.press('Escape');
    const f = await download(() => page.keyboard.press('Control+s'));
    await page.waitForFunction(() => !window.detailcraft.model.dirty, null, { timeout: 5000 }).catch(() => {});   // save() resolves after the download starts
    ok(/Autosave check\.detailcraft\.json$/.test(f) && await page.evaluate(() => !window.detailcraft.model.dirty), 'Ctrl+S: downloads Autosave check.detailcraft.json (browser host) and the model is saved', path.basename(f) + ' dirty=' + await page.evaluate(() => window.detailcraft.model.dirty) + ' ' + await page.textContent('[data-status]'));
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), act('open')]);
    ok(/\.json/.test(await chooser.element().getAttribute('accept')) && /\.ifc/.test(await chooser.element().getAttribute('accept')), 'Open asks for .json and .ifc through host.js');
    await chooser.setFiles(f);
    await page.waitForFunction(() => window.detailcraft.model.state.name === 'Autosave check');
    ok(true, 'the saved file opens again');
  }

  if (run('handoff')) {
    console.log('\nHandoff receiver and view cube words');
    await freshSample('3d');
    const json = await dc(() => window.detailcraft.model.toJSON());
    const [popup] = await Promise.all([ctx.waitForEvent('page'), dc(async (text) => {
      const H = await import('/assets/apps/detailcraft/dev/handoff.js');
      return H.sendHandoff('/lab/detailcraft', new File([text], 'Handed over.detailcraft.json', { type: 'application/json' }), 'test');
    }, json)]);
    popup.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
    await popup.waitForFunction(() => window.detailcraft?.model.state.members.length === 11, null, { timeout: 20000 });
    ok(!/handoff=/.test(popup.url()) && await popup.evaluate(() => window.detailcraft.model.state.name) === 'Sample frame', 'the handed-over model opens in the new tab; the address loses ?handoff');
    await popup.close();
    await page.goto(BASE + '/lab/detailcraft?space=paper&lang=en-XA', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.detailcraft && window.detailcraft.viewCube);
    await settle();
    const cube = await dc(() => document.querySelector('.cc-vc')?.textContent || '');
    ok(/\[/.test(cube), 'with ?lang=en-XA the view cube shows the language file\'s (pseudo-locale) words', cube.slice(0, 60));
    await page.goto(BASE + '/lab/detailcraft?lang=en', { waitUntil: 'domcontentloaded' });
  }

  if (run('s8')) {
    console.log('\nS.8 — touch');
    const state = await ctx.storageState();
    // the sign-in cookie only: earlier checks' localStorage (settings, panel layout) must not carry over
    const tctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, hasTouch: true, isMobile: false, storageState: { cookies: state.cookies, origins: [] } });
    const tp = await tctx.newPage();
    tp.on('pageerror', (e) => problems.push('touch pageerror: ' + e.message));
    tp.on('console', (m) => { if (m.type() === 'error') problems.push('touch console: ' + m.text()); });
    await tp.goto(BASE + '/lab/detailcraft?space=paper', { waitUntil: 'domcontentloaded' });
    await tp.waitForFunction(() => window.detailcraft && window.detailcraft.view, null, { timeout: 20000 });
    await tp.click('.dc-tools [data-act="sample"]');
    await tp.waitForFunction(() => window.detailcraft.built.parts.length === 25);
    const cdp = await tctx.newCDPSession(tp);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p.x, y: p.y, id: i + 1, radiusX: 4, radiusY: 4, force: 1 })) });
    const tat = async (p) => { const s2 = await tp.evaluate((pt) => window.detailcraft.nodeScreen(pt), p); const b = await tp.locator('[data-canvas]').boundingBox(); return { x: b.x + s2.x, y: b.y + s2.y }; };
    const tap = async (p) => { await touch('touchStart', [p]); await tp.waitForTimeout(60); await touch('touchEnd', []); await tp.waitForTimeout(200); };
    const coarse = await tp.evaluate(() => ({ m: matchMedia('(pointer: coarse)').matches, h: Math.round(document.querySelector('.dc-tool').getBoundingClientRect().height) }));
    ok(!coarse.m || coarse.h >= 44, 'coarse pointer: toolbar buttons ' + coarse.h + ' px tall (≥ 44)' + (coarse.m ? '' : ' — this browser does not report a coarse pointer; checked by CSS only'));
    await tp.click('[data-view="plan"]');
    await tp.selectOption('[data-vlevel]', 'Level 2');
    await tp.waitForTimeout(200);
    await tap(await tat([3000, 0, 4000]));
    const s1 = await tp.evaluate(() => window.detailcraft.selected.map((r) => window.detailcraft.model.member(r.id)?.type));
    ok(s1.length === 1 && s1[0] === 'beam', 'a tap selects the beam', JSON.stringify(s1));
    const lp = await tat([3000, 7000, 4000]);
    await touch('touchStart', [lp]); await tp.waitForTimeout(800); await touch('touchEnd', []); await tp.waitForTimeout(200);
    ok(await tp.evaluate(() => window.detailcraft.selected.length) === 2, 'a long press on another beam adds it to the selection');
    const z0 = await tp.evaluate(() => window.detailcraft.view.camera.zoom);
    const c = await tat([6000, 3500, 4000]);
    await touch('touchStart', [{ x: c.x - 40, y: c.y }, { x: c.x + 40, y: c.y }]);
    for (let i = 1; i <= 6; i++) { await touch('touchMove', [{ x: c.x - 40 - i * 15, y: c.y }, { x: c.x + 40 + i * 15, y: c.y }]); await tp.waitForTimeout(30); }
    await touch('touchEnd', []); await tp.waitForTimeout(250);
    ok(await tp.evaluate(() => window.detailcraft.view.camera.zoom) > z0 && await tp.evaluate(() => window.detailcraft.selected.length) === 2, 'two fingers pinch: the plan zooms in, the selection stays');
    await tp.click('[data-act="fit"]');
    await tp.waitForTimeout(200);
    // one finger on a selected beam drags it onto grid B … the first beam (A, y = 0) to y = 7000 is a clash with B's beam; move it up 2 m instead
    await tp.evaluate(() => { const d = window.detailcraft; const b = d.model.state.members.find((m) => m.type === 'beam' && m.start[1] === 0); d.setSelection([{ kind: 'member', id: b.id }]); });
    const from = await tat([3000, 0, 4000]), to = await tat([3000, 3500, 4000]);
    await touch('touchStart', [from]);
    for (let i = 1; i <= 8; i++) { await touch('touchMove', [{ x: from.x + (to.x - from.x) * i / 8, y: from.y + (to.y - from.y) * i / 8 }]); await tp.waitForTimeout(30); }
    await touch('touchEnd', []); await tp.waitForTimeout(250);
    const moved = await tp.evaluate(() => window.detailcraft.model.state.members.filter((m) => m.type === 'beam').map((m) => m.start[1]));
    ok(moved.some((y) => y > 3000 && y < 4000), 'one finger drags the selected beam across the plan (' + moved.join(', ') + ')');
    // placing by tap: Column tool, a tap 25 px from A/3 on Level 1
    await tp.selectOption('[data-vlevel]', 'Level 1');
    await tp.click('.dc-tools [data-act="tool:column"]');
    await tp.waitForTimeout(150);
    const n3 = await tat([6000, 0, 0]);
    const before = await tp.evaluate(() => window.detailcraft.model.state.members.length);
    await tap({ x: n3.x + 18, y: n3.y + 17 });
    const col = await tp.evaluate(() => { const ms = window.detailcraft.model.state.members; return ms.length + ':' + ms[ms.length - 1].start.join(','); });
    ok(col === (before + 1) + ':6000,0,0', 'Column tool: a tap 25 px from A/2 places the column on A/2 (' + col + ')');
    await tp.screenshot({ path: path.join(OUT, 's8-01-touch.png') });
    await tctx.close();
  }

  if (run('d5')) {
    console.log('\nD5 / D7 — shear tabs, skewed');
    await freshSample('3d');
    await act('new');
    await settle();
    await dc(() => { const d = window.detailcraft; d.model.change('Set up', (tx) => {
      const a = tx.addMember({ type: 'column', profile: 'W12x50', start: [0, 0, 0], end: [0, 0, 4000] });
      const b = tx.addMember({ type: 'column', profile: 'W12x50', start: [6000, 0, 0], end: [6000, 0, 4000] });
      const c = tx.addMember({ type: 'column', profile: 'W12x50', start: [6000, 3500, 0], end: [6000, 3500, 4000] });
      tx.addMember({ type: 'beam', profile: 'W16x26', start: [0, 0, 4000], end: [6000, 3500, 4000] });           // skewed ≈ 30°
      tx.addMember({ type: 'beam', profile: 'W16x26', start: [0, 0, 3800], end: [6000, 0, 3600] });            // sloped
      void a; void b; void c;
    }); });
    await page.click('[data-act="fit"]');
    await dc(() => { const d = window.detailcraft; const b = d.model.state.members.find((m) => m.type === 'beam'); d.setSelection([{ kind: 'member', id: b.id }]); });
    await act('sheartabs');
    await settle();
    const st = await dc(() => ({ conns: window.detailcraft.model.state.connections.map((c) => c.type), head: document.querySelector('[data-props-h]').textContent, hard: window.detailcraft.built.problems.filter((p) => p.hard).length }));
    ok(st.conns.join() === 'sheartab,sheartab' && st.head === 'Shear tab' && st.hard === 0, 'Shear tabs on the skewed beam: two tabs, Properties "Shear tab", nothing refused', JSON.stringify(st));
    ok(/2 shear tabs added/.test(await page.textContent('[data-status]')), 'status: 2 shear tabs added');
    await page.screenshot({ path: path.join(OUT, 'd5-01-sheartab.png') });
    const sim = await dc(() => document.querySelector('[data-props] .dc-actions button')?.textContent || '');
    ok(/\(\d+\)/.test(sim), 'Properties offer Apply to similar (' + sim + ')');
  }

  if (run('d9')) {
    console.log('\nD9 — metric bars and shape codes');
    await freshSample('plan');
    await page.keyboard.press('Control+,');
    await page.waitForSelector('[data-app-settings][open]');
    await page.check('input[name="dcSteel"][value="eu"]');
    await page.check('input[name="dcShapeCodes"][value="bs8666"]');
    await page.check('input[name="dcBarNames"][value="metric"]');
    await page.screenshot({ path: path.join(OUT, 'd9-01-settings.png') });
    await page.keyboard.press('Escape');
    await page.click('[data-tab="bending"]');
    await settle();
    const rows = await dc(() => [...document.querySelectorAll('[data-report] .dc-table tbody tr')].map((tr) => [...tr.children].slice(0, 3).map((td) => td.textContent)));
    ok(rows.some((r) => r[1] === '#16' && r[2] === '21'), 'Bending schedule tab: the sample\'s #5 mat bars named #16, shape code 21 (BS 8666)', JSON.stringify(rows.slice(0, 3)));
    await page.keyboard.press('f');
    await settle();
    const fo = await dc(() => window.detailcraft.toolOptions.footing);
    ok(fo.mat.barX === 'H16' && fo.starters.bar === 'H20' && fo.concrete === 'C30/37', 'European steel: new footings start with H16 mats, H20 starters, C30/37');
    await page.click('[data-by-grid] button[type="submit"]');
    await settle();
    const sched = await dc(() => window.detailcraft.schedule.rows.map((r) => r.mark));
    ok(sched.includes('H16F1') && sched.includes('H20F1'), 'the placed footing\'s bars are scheduled as H16F1 and H20F1', sched.join(' '));
    await page.keyboard.press('Escape');
    await dc(() => localStorage.removeItem('detailcraft.settings'));
  }

  if (run('d19')) {
    console.log('\nD19 — revision clouds');
    await freshSample('3d');
    await act('drawings');
    await page.waitForSelector('[data-dwg][open]');
    await page.click('[data-issue-all]');
    await settle();
    await page.click('[data-dwg-close]');
    await dc(() => { const d = window.detailcraft; const b = d.model.state.members.find((m) => m.type === 'beam'); d.model.change('Hole', (tx) => tx.addHole(b.id, { face: 'web', x: 900, y: 60, d: 22 })); });
    await act('drawings');
    await page.waitForSelector('[data-dwg][open]');
    const idx = await dc(() => window.detailcraft.openDrawingSet.sheets.findIndex((s) => s.kind === 'assembly' && s.clouds.length));
    ok(idx >= 0, 'an assembly sheet of the changed beam carries a revision cloud');
    await page.selectOption('[data-dwg-sheet]', String(idx));
    await settle();
    const info = await dc((i) => { const s = window.detailcraft.openDrawingSet.sheets[i]; return { n: s.clouds.length, b: s.items.filter((it) => it.k === 'text' && it.s === 'B').length }; }, idx);
    ok(info.n >= 1 && info.b === info.n, 'its clouds each have a revision triangle "B" (' + info.n + ')');
    await page.screenshot({ path: path.join(OUT, 'd19-01-cloud.png') });
    await page.click('[data-dwg-close]');
  }

  if (run('d20')) {
    console.log('\nD20 — column base details');
    await freshSample('3d');
    await dc(() => { const d = window.detailcraft; const c = d.model.state.connections.find((x) => x.type === 'baseplate'); d.setSelection([{ kind: 'conn', id: c.id }]); });
    await settle();
    const n0 = await dc(() => window.detailcraft.built.parts.length);
    const sels = await dc(() => [...document.querySelectorAll('[data-props] select.dc-select')].map((s) => [...s.options].map((o) => o.textContent).join('/')));
    ok(sels.some((t) => /2, in line with the web/.test(t)) && sels.some((t) => /On every rod/.test(t)), 'Properties: Stiffeners and Plate washers are choice lists', JSON.stringify(sels));
    const pick = async (re, value) => { await dc(([src, v]) => { const s = [...document.querySelectorAll('[data-props] select.dc-select')].find((x) => new RegExp(src).test([...x.options].map((o) => o.textContent).join('/'))); s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); }, [re.source, value]); await settle(); };
    await pick(/in line with the web/, '4');
    await pick(/On every rod/, '1');
    const st = await dc(() => ({ n: window.detailcraft.built.parts.length, note: [...document.querySelectorAll('[data-props] .dc-note')].map((p) => p.textContent).join(' ') }));
    ok(st.n === n0 + 8, '4 stiffeners and 4 washers in the model (' + (st.n - n0) + ' new parts)');
    ok(/Design Guide 1, Table 2.3/.test(st.note), 'the panel names the washer size used (DG1)', st.note);
    await page.click('[data-act="fit"]');
    await page.screenshot({ path: path.join(OUT, 'd20-01-base.png') });
  }

  if (run('d21')) {
    console.log('\nD21 — splices');
    await freshSample('3d');
    await act('new');
    await settle();
    await dc(() => { const d = window.detailcraft; d.model.change('Set up', (tx) => {
      tx.addMember({ type: 'beam', profile: 'W16x26', start: [0, 0, 4000], end: [3000, 0, 4000] });
      tx.addMember({ type: 'beam', profile: 'W16x26', start: [3000, 0, 4000], end: [6000, 0, 4000] });
    }); });
    await page.click('[data-act="fit"]');
    await dc(() => { const d = window.detailcraft; d.setSelection([{ kind: 'member', id: d.model.state.members[0].id }]); });
    await settle();
    await act('splice');
    await settle();
    const st = await dc(() => ({ conns: window.detailcraft.model.state.connections.map((c) => c.type), head: document.querySelector('[data-props-h]').textContent, bolts: window.detailcraft.built.bolts.length, hard: window.detailcraft.built.problems.length }));
    ok(st.conns.join() === 'splice' && st.head === 'Splice' && st.bolts === 36 && st.hard === 0, 'Splice: one splice, Properties "Splice", 36 bolts, no warnings', JSON.stringify(st));
    ok(/1 splice added/.test(await page.textContent('[data-status]')), 'status: 1 splice added');
    const rows = await dc(() => [...document.querySelectorAll('[data-props] dt')].filter((d) => d.textContent === 'Bolts').length);
    ok(rows === 2, 'flange and web bolts listed separately (' + rows + ' rows)');
    await page.screenshot({ path: path.join(OUT, 'd21-01-splice.png') });
  }

  if (run('d22')) {
    console.log('\nD22 — brace gussets');
    await freshSample('3d');
    await dc(() => { const d = window.detailcraft; d.setSelection([{ kind: 'member', id: d.model.state.members.find((m) => m.type === 'brace').id }]); });
    await settle();
    await act('gusset');
    await settle();
    const st = await dc(() => ({ g: window.detailcraft.model.state.connections.filter((c) => c.type === 'gusset').length, head: document.querySelector('[data-props-h]').textContent }));
    ok(st.g === 2 && st.head === 'Brace gusset', 'Gusset on the sample brace: 2 gussets, Properties "Brace gusset"', JSON.stringify(st));
    ok(/2 gussets added/.test(await page.textContent('[data-status]')), 'status: 2 gussets added');
    await page.click('[data-tab="clashes"]');
    await settle();
    await page.click('[data-clash-run]');
    await settle();
    const rows = await dc(() => document.querySelectorAll('[data-clash]').length);
    ok(rows === 0, 'Clashes tab, Check now: none left (the sample\'s 6 brace clashes are gone)', String(rows));
    await page.screenshot({ path: path.join(OUT, 'd22-01-gusset.png') });
  }

  if (run('d23')) {
    console.log('\nD23 — stairs');
    await freshSample('3d');
    await page.locator('[data-canvas]').focus().catch(() => {});
    await page.keyboard.press('s');
    await settle();
    ok(await page.textContent('[data-props-h]') === 'Place stair', 'S: the Stair tool, its settings on the right');
    await dc(() => { const o = window.detailcraft.toolOptions.stair; o.dir = 90; o.width = 900; });
    const p = await at([6000, 0, 0]);
    await page.mouse.click(p.x, p.y);
    await settle();
    const st = await dc(() => ({ n: window.detailcraft.model.state.stairs.length, s: window.detailcraft.model.state.stairs[0], parts: window.detailcraft.built.parts.filter((q) => q.stair).length }));
    ok(st.n === 1 && st.s.x === 6000 && st.s.y === 0 && st.s.rise === 4000 && st.s.dir === 90 && st.parts === 2 + 22, 'clicked A/2: a stair up to Level 2 (rise 4000, 23 risers: 22 treads + 2 stringers)', JSON.stringify(st));
    ok(/23 risers of 173.9 mm/.test(await page.textContent('[data-status]')), 'status: 23 risers of 173.9 mm');
    await page.keyboard.press('Escape');
    await dc(() => { const d = window.detailcraft; d.setSelection([{ kind: 'stair', id: d.model.state.stairs[0].id }]); });
    await settle();
    ok(/^Stair ST\d$/.test(await page.textContent('[data-props-h]')), 'selected: Properties "Stair ST…" (' + await page.textContent('[data-props-h]') + ')');
    await page.click('[data-act="fit"]');
    await page.screenshot({ path: path.join(OUT, 'd23-01-stair.png') });
  }

  if (run('w24')) {
    console.log('\nW2.4 — lasso');
    await freshSample('plan');
    await page.selectOption('[data-vlevel]', 'Level 1');
    await settle();
    await page.keyboard.press('Control+,');
    await page.waitForSelector('[data-app-settings][open]');
    await page.check('input[name="dcDragSel"][value="lasso"]');
    await page.keyboard.press('Escape');
    await settle();
    ok(await dc(() => window.detailcraft.settings.dragSel) === 'lasso', 'Settings: dragging to select = lasso');
    const loop = async (pts, { space = 0, shot = null } = {}) => {
      const sp = []; for (const q of pts) sp.push(await at(q));
      await page.mouse.move(sp[0].x, sp[0].y); await page.mouse.down();
      for (let i = 1; i < sp.length; i++) for (let k = 1; k <= 6; k++) {
        await page.mouse.move(sp[i - 1].x + (sp[i].x - sp[i - 1].x) * k / 6, sp[i - 1].y + (sp[i].y - sp[i - 1].y) * k / 6);
        if (i === 1 && k === 3) for (let j = 0; j < space; j++) await page.keyboard.press('Space');
      }
      await settle();
      if (shot) await page.screenshot({ path: path.join(OUT, shot) });
      await page.mouse.up(); await settle();
    };
    const R = 1800;
    await loop([[-R, R, 0], [R, R, 0], [R, -R, 0], [-R, -R, 0], [-R, R * 0.9, 0]], { shot: 'w24-01-lasso.png' });
    const k1 = await kinds();
    ok(k1.column === 1 && !k1.brace && k1.footing === 1 && /wholly inside/.test(await page.textContent('[data-status]')), 'lasso drawn to the right round A/1: the column, its footing (and base plate), not the brace', JSON.stringify(k1));
    await loop([[R, R, 0], [-R, R, 0], [-R, -R, 0], [R, -R, 0], [R, R * 0.9, 0]]);
    const k2 = await kinds();
    ok(k2.column === 1 && k2.brace === 1 && /touches/.test(await page.textContent('[data-status]')), 'drawn to the left: the brace it touches too', JSON.stringify(k2));
    await loop([[-1500, 300, 0], [3000, 300, 0], [7500, 300, 0]], { space: 2, shot: 'w24-02-fence.png' });
    const k3 = await kinds();
    ok(k3.footing >= 2 && /fence crosses/.test(await page.textContent('[data-status]')), 'Space twice: a fence along A takes the footings it crosses', JSON.stringify(k3));
    await dc(() => localStorage.removeItem('detailcraft.settings'));
  }

  if (run('d12')) {
    console.log('\nD12 — hidden lines');
    await freshSample('3d');
    await dc(() => { const d = window.detailcraft; d.model.change('St', (tx) => { for (const c of d.model.state.connections.filter((x) => x.type === 'baseplate')) tx.updateConnection(c.id, { stiffeners: 4 }); }); });
    await act('drawings');
    await page.waitForSelector('[data-dwg][open]');
    const idx = await dc(() => window.detailcraft.openDrawingSet.sheets.findIndex((s) => s.kind === 'assembly' && s.id.startsWith('assembly:C')));
    await page.selectOption('[data-dwg-sheet]', String(idx));
    await settle();
    const n = await dc((i) => window.detailcraft.openDrawingSet.sheets[i].items.filter((it) => it.k === 'path' && it.dash && it.dash[0] === 1.5).length, idx);
    ok(n > 0, 'the column sheet has dashed hidden lines (' + n + ')');
    await page.screenshot({ path: path.join(OUT, 'd12-01-hidden.png') });
    await page.click('[data-dwg-close]');
  }

  if (run('d24')) {
    console.log('\nD24 — cut list');
    await freshSample('3d');
    await page.click('[data-tab="nest"]');
    await settle();
    const h1 = await page.textContent('[data-report] h3');
    ok(/^Cut list — \d+ bars to buy, [\d.]+ % waste$/.test(h1), 'Cut list tab: "' + h1 + '"');
    const labels = await dc(() => [...document.querySelectorAll('[data-report] .dc-nest-form label, [data-report] .dc-nest-form .k, [data-report] .dc-nest-form dt')].map((x) => x.textContent.trim()).join('|'));
    ok(/Keep drops from \(mm\)/.test(labels) && /Saw kerf/.test(labels), 'its settings are labeled (stock, kerf, trim, keep drops from)', labels);
    await page.fill('[data-nest-stock]', '12000');
    await page.press('[data-nest-stock]', 'Tab');
    await settle();
    const rows = await dc(() => [...document.querySelectorAll('[data-report] table')][1].querySelectorAll('tbody tr').length);
    const stock = await dc(() => [...[...document.querySelectorAll('[data-report] table')][1].querySelectorAll('tbody tr')].map((tr) => tr.children[2].textContent));
    ok(rows > 0 && stock.every((x) => x === '12000') && await dc(() => window.detailcraft.settings.nest.stock.join()) === '12000', 'stock "12000": every bar is a 12 m bar, and the setting is kept', JSON.stringify(stock));
    const f = await download(() => page.click('[data-nest-csv]'));
    const txt = fs.readFileSync(f, 'utf8');
    ok(/cut list\.csv$/.test(f) && /Bars to buy/.test(txt) && /Cuts \(mark length\)/.test(txt), 'CSV: summary and bars');
    await page.screenshot({ path: path.join(OUT, 'd24-01-cutlist.png') });
    await dc(() => localStorage.removeItem('detailcraft.settings'));
  }

  if (run('x12')) {
    console.log('\nX.12 — assistants');
    await freshSample('3d');
    const rpc = (method, params) => dc(([m, p]) => window.detailcraftControl.handle({ jsonrpc: '2.0', id: 1, method: m, params: p }, 'test', { name: 'Browser test' }), [method, params]);
    let a = await rpc('tools/list', {});
    ok(a.error && /turned off/.test(a.error.message), 'assistants off (the default): every request refused');
    await page.keyboard.press('Control+,');
    await page.waitForSelector('[data-app-settings][open]');
    ok(await page.isVisible('[data-assistants-settings] [data-assist-on]'), 'Settings has the Assistants section (mounted by host.js)');
    await page.check('[data-assistants-settings] [data-assist-on]');
    await page.check('[data-assistants-settings] [data-assist-group="edit"]');
    await page.screenshot({ path: path.join(OUT, 'x12-01-settings.png') });
    await page.keyboard.press('Escape');
    a = await rpc('tools/list', {});
    const names = (a.result?.tools || []).map((t) => t.name);
    ok(names.includes('member_add') && names.includes('clash_check') && !names.includes('model_save') && names.length === 10, 'on with read + edit: 10 tools (no save, no export)', names.join(','));
    const n0 = await dc(() => window.detailcraft.built.parts.length);
    a = await rpc('tools/call', { name: 'member_add', arguments: { type: 'beam', profile: 'W16x26', start: [0, 3500, 4000], end: [6000, 3500, 4000] } });
    await settle();
    const st = await dc(() => ({ n: window.detailcraft.built.parts.length, label: window.detailcraft.model.undoStack.at(-1)?.label }));
    ok(!a.result?.isError && st.n === n0 + 1 && st.label === 'Assistant: add beam', 'member_add: the beam is in the model and the view, one undo step "Assistant: add beam"', JSON.stringify(st));
    await page.keyboard.press('Control+z');
    await settle();
    ok(await dc(() => window.detailcraft.built.parts.length) === n0, 'Ctrl+Z takes it back');
    await dc(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cadcraft.assistants.')) localStorage.removeItem(k); });
  }
} catch (err) {
  fail++;
  console.log('  FAIL ' + (err.stack || err.message));
  await page.screenshot({ path: path.join(OUT, 'error.png') }).catch(() => {});
} finally {
  ok(problems.length === 0, 'no console errors, no native dialogs', problems.slice(0, 5).join(' | '));
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down'], { encoding: 'utf8' });
  fs.rmSync(DL, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed (screenshots in ' + OUT + ')');
process.exit(fail ? 1 : 0);

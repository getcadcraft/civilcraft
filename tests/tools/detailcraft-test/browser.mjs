#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser.mjs — DetailCraft in headless Chromium at https://getcadcraft.com/lab/detailcraft.
 *
 *   node tools/detailcraft-test/browser.mjs [--out <shots dir>] [--state <storageState.json>]
 * Run as root: it calls `sudo -u www-data php tools/detailcraft-test/admin.php up|down` for the test admin
 * detailcrafttest+cadcraft@projectz.xyz (disabled again at the end). The admin login is throttled (10 per
 * 10 minutes for 127.0.0.1, shared): it signs in once per run (`up` sets a new password, which ends older
 * sessions) and keeps that state in --state for the rest of the run.
 *
 * Real clicks and keys: the sample, a new model built by clicking grid intersections in plan views (beam,
 * two columns), selecting by clicking in the 3D canvas, end plates + base plate + Similar from the toolbar,
 * a footing, undo/redo, every export (BOM, bending schedule, IFC, NC zip, shop drawing PDF) downloaded and
 * read, the Drawings dialog (12 GA, anchor plan and assembly sheets previewed, all-sheets and one-sheet PDFs read by poppler),
 * Import IFC through the file chooser (an IfcOpenShell-made IFC2X3: members, levels, grids, the report
 * dialog listing what was not brought in), save → reopen, the unsaved-changes dialog (focus returns), a hostile model name (stays text),
 * the dark theme, 390 px phone width (no sideways scroll), keyboard-only placing, and the Edit group: Copy/Paste on the
 * toolbar, every item of the More menu, Ctrl+C/X/V, Ctrl+Shift+V, Ctrl+D, Ctrl+A, Delete, Esc, Shift+click, paste by a
 * clicked grid intersection (ghost follows the pointer) and by typed offset, one undo step each, the stored clipboard
 * pasted by a fresh page, tampered clipboards refused; Settings › DetailCraft (steel, offset, connections, bolts) kept
 * over a reload and reset. Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(REPO, 'tmp/shots/detailcraft'));
const STATE = arg('--state', path.join(os.tmpdir(), 'detailcraft-browser-state.json'));
fs.mkdirSync(OUT, { recursive: true });
const DL = fs.mkdtempSync(path.join(os.tmpdir(), 'dc-dl-'));

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/detailcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, storageState: fs.existsSync(STATE) ? STATE : undefined });
// host.js opens files with the File System Access picker when there is one; headless runs drive the plain
// <input type=file> instead (Playwright's file chooser), as tools/partcraft-test/browser.mjs does
await ctx.addInitScript(() => { window.showOpenFilePicker = undefined; });
// 0.7 WS.13: CC_WORKSPACE=docked|toolbox runs the suite with that workspace layout on (Settings › Global › Layout)
// (without it: classic, whatever a stored --state remembers)
await ctx.addInitScript((w) => { try { if (w) localStorage.setItem('cc-workspace', w); else localStorage.removeItem('cc-workspace'); } catch (e) { /* no storage: classic */ } }, process.env.CC_WORKSPACE || '');
const page = await ctx.newPage();
// CC_WORKSPACE: after a load, wait until the layout is mounted (it starts once the app has drawn), as a person would see it
const wsSettled = (p) => { if (!process.env.CC_WORKSPACE) return; for (const m of ['goto', 'reload']) { const f = p[m].bind(p); p[m] = async (...a) => { const r = await f(...a); await p.waitForFunction(() => !document.querySelector('[data-detailcraft]') || document.querySelector('main')?.classList.contains('ws-on') || window.matchMedia('(max-width: 760px)').matches, null, { timeout: 30000 }).catch(() => {}); return r; }; }
  // the classic controls a layout hides (its view bar, its toolbar): the layout's own buttons click them (the registry), so do the same;
  // a control in a palette tab not shown (the left panel's own sections sit in the Model tab of the ribbon layout): that tab first
  const prep = async (sel) => {
    const h = typeof sel === 'string' ? await p.$(sel).catch(() => null) : null; if (!h) return false;
    return h.evaluate((e) => {
      const slot = e.closest('.ws-palette-scroll[hidden]');
      const name = slot && [...slot.attributes].map((a) => /^data-ws-(.+)-scroll$/.exec(a.name)?.[1]).find(Boolean);
      if (name) document.querySelector('[data-ws-lower="' + name + '"]')?.click();
      return !!e.closest('.ws-hide');
    }).catch(() => false);
  };
  const click = p.click.bind(p), choose = p.selectOption.bind(p), fill = p.fill.bind(p), check = p.check.bind(p);
  p.click = async (sel, o) => (await prep(sel) ? p.$eval(sel, (e) => e.click()) : click(sel, o));
  p.selectOption = async (sel, v, o) => (await prep(sel) ? p.$eval(sel, (e, x) => { e.value = x; e.dispatchEvent(new Event('change', { bubbles: true })); }, v) : choose(sel, v, o));
  p.fill = async (sel, v, o) => { await prep(sel); return fill(sel, v, o); };
  p.check = async (sel, o) => { await prep(sel); return check(sel, o); };
  // a hidden toolbar button focused and pressed with Enter (the classic keyboard path): the button is clicked, the Enter that follows dropped
  let clicked = false;
  const focus = p.focus.bind(p), press = p.keyboard.press.bind(p.keyboard);
  p.focus = async (sel, o) => { if (await prep(sel)) { clicked = true; return p.$eval(sel, (e) => e.click()); } return focus(sel, o); };
  p.keyboard.press = async (k, o) => { const skip = clicked && k === 'Enter'; clicked = false; return skip ? undefined : press(k, o); };
};
wsSettled(page);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('dialog', (d) => { problems.push('native dialog: ' + d.message()); d.dismiss(); });

const dc = (fn, arg) => page.evaluate(fn, arg);
const settle = () => page.waitForTimeout(120);
async function download(action) {
  const [d] = await Promise.all([page.waitForEvent('download'), action()]);
  const f = path.join(DL, d.suggestedFilename());
  await d.saveAs(f);
  return f;
}
/** Click a model point (mm) on the canvas, as a person would. */
async function clickModel(p) {
  const s = await dc((pt) => window.detailcraft.nodeScreen(pt), p);
  const box = await page.locator('[data-canvas]').boundingBox();
  await page.mouse.move(box.x + s.x, box.y + s.y);
  await settle();
  await page.mouse.click(box.x + s.x, box.y + s.y);
  await settle();
}
/** A toolbar action; one in a closed "More" menu opens it first, as a person would. */
async function act(a) {
  const b = page.locator('.dc-tools [data-act="' + a + '"]').first();
  // CC_WORKSPACE: a layout that hides the toolbar (the ribbon layout) runs the same command through the menu-style registry, the path
  // its ribbon takes (bin/test-app-workspaces.mjs checks the ribbon's buttons themselves)
  if (process.env.CC_WORKSPACE && !(await page.locator('.dc-tools').isVisible())) {
    await page.evaluate((x) => { const btn = document.querySelector('.dc-tools [data-act="' + x + '"]'); const c = window.ccInput.commands.find((k) => document.querySelector(k.sel) === btn); if (c) window.ccInput.run(c.id); else window.detailcraft.act(x); }, a);
    return;
  }
  if (!(await b.isVisible())) await page.locator('.dc-tools details:has([data-act="' + a + '"]) > summary').click();
  await b.click();
}

try {
  // ---- sign in (at most once; the state is reused) ----
  await page.goto(BASE + '/lab/detailcraft?space=paper', { waitUntil: 'domcontentloaded' });
  if (/\/(admin\/)?login\b/.test(page.url())) {   // lab now sends visitors to /login; staff sign in at /admin/login
    console.log('  (signing in once)');
    await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[name="email"]', admin.email);
    await page.fill('input[name="password"]', admin.password);
    await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
    await ctx.storageState({ path: STATE });
    await page.goto(BASE + '/lab/detailcraft?space=paper', { waitUntil: 'domcontentloaded' });
  }
  ok(page.url().includes('/lab/detailcraft'), 'lab page opens for staff', page.url());
  await page.waitForFunction(() => window.detailcraft && window.detailcraft.view, null, { timeout: 20000 });
  ok(await dc(() => { const t = document.querySelector('main > [role="toolbar"]'); return !!t && t.parentElement.id === 'main'; }), 'toolbar is role=toolbar, a direct child of <main>');
  ok(await dc(() => !!window.detailcraft.view), 'WebGL view started');
  await page.screenshot({ path: path.join(OUT, '01-empty-paper.png') });

  // ---- screen modes (shared app-shell.js): the toolbar hides with the app bar ----
  await page.locator('[data-canvas]').hover();
  await page.keyboard.press('Control+Shift+F');
  await page.waitForTimeout(300);
  await page.keyboard.press('Control+Shift+F');
  await page.mouse.move(700, 600);
  await page.waitForTimeout(1200);
  const hid = await dc(() => ({ auto: document.body.classList.contains('shell-autohide'), bottom: document.querySelector('.dc-tools').getBoundingClientRect().bottom, stage: document.querySelector('.dc-stage').getBoundingClientRect().top }));
  ok(hid.auto && hid.bottom <= 1, 'Ctrl+Shift+F twice: bars hidden, the DetailCraft toolbar slides away with them', JSON.stringify(hid));
  await page.keyboard.press('Control+Shift+F');
  await page.waitForTimeout(300);
  ok(await dc(() => !document.body.classList.contains('shell-autohide') && !document.fullscreenElement), 'Ctrl+Shift+F again: normal view');
  // ---- sample ----
  await act('sample');
  await page.waitForFunction(() => window.detailcraft.built.parts.length === 25);
  ok(true, 'Sample: 25 parts');
  const bom1 = await dc(() => window.detailcraft.marks.parts.map((p) => p.mark + ':' + p.count).join(' '));
  ok(bom1 === 'c1:2 c2:4 b1:4 br1:1 p1:8 p2:6', 'sample marks in the page: ' + bom1);
  await page.click('[data-tab="bom"]');
  ok(await page.locator('.dc-table').first().locator('tbody tr').count() === 7, 'BOM tab: 6 marks + total');
  await page.screenshot({ path: path.join(OUT, '02-sample-3d-paper.png') });
  // select by clicking a beam in the 3D view (midspan of A 1–2 at top of steel)
  await clickModel([3000, 0, 4000 - 10]);
  const s1 = await dc(() => window.detailcraft.selection);
  ok(s1 && s1.kind === 'member', 'clicking a beam in 3D selects it', JSON.stringify(s1));
  ok((await page.textContent('[data-props-h]')).startsWith('Beam b1'), 'properties show Beam b1');
  // shop drawing from the toolbar
  await act('shop');
  await page.waitForSelector('[data-shop][open]');
  await settle();
  await page.screenshot({ path: path.join(OUT, '03-shop-drawing.png') });
  const pdf = await download(() => page.click('[data-shop-pdf]'));
  const pdfBytes = fs.readFileSync(pdf);
  ok(pdfBytes.subarray(0, 5).toString() === '%PDF-', 'shop drawing PDF downloaded');
  const text = execFileSync('/usr/bin/pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8' });
  ok(text.includes('b1') && text.includes('W16x26') && text.includes('5650') && text.includes('Holes'), 'PDF text: b1, W16x26, 5650 long');
  await page.keyboard.press('Escape');
  await settle();
  ok(await dc(() => !document.querySelector('dialog[open]')), 'Esc closes the dialog');
  ok(await dc(() => document.activeElement && document.activeElement.closest('.dc-tools') !== null), 'focus returns to the toolbar after the dialog');

  // exports
  const bomF = await download(() => act('bom'));
  const bom = fs.readFileSync(bomF, 'utf8');
  ok(bom.charCodeAt(0) === 0xfeff && bom.includes('b1,beam,W16x26,A992,5650,4,') && bom.includes('Bolt,20,70,A325,64'), 'BOM CSV: b1 × 4 at 5650, 64 bolts 20 × 70');
  const bendF = await download(() => act('bending'));
  ok(fs.readFileSync(bendF, 'utf8').includes('5F1,#5,U,1850,254,254,108'), 'bending schedule CSV: 5F1 #5 U 1850/254/254 × 108');
  const ifcF = await download(() => act('ifc'));
  const ifc = fs.readFileSync(ifcF, 'utf8');
  ok(ifc.startsWith('ISO-10303-21;') && (ifc.match(/=IFCBEAM\(/g) || []).length === 4 && (ifc.match(/=IFCREINFORCINGBAR\(/g) || []).length === 132, 'IFC download: 4 IfcBeam, 132 IfcReinforcingBar');
  const ncF = await download(() => act('nc'));
  const unz = execFileSync('/usr/bin/unzip', ['-l', ncF], { encoding: 'utf8' });
  ok(['c1.nc1', 'c2.nc1', 'b1.nc1', 'p1.nc1', 'p2.nc1', 'br1.nc1'].every((n) => unz.includes(n)), 'NC zip: c1 c2 b1 p1 p2 and the HSS brace br1 (D10)');
  ok(!/Not written/.test(await page.textContent('[data-status]')), 'status lists no part left out');
  ok((await page.textContent('[data-status]')).includes('NC viewer before cutting'), 'status asks for the NC files to be checked in the shop\'s own viewer');

  // ---- drawings: GA plans and elevations + assembly drawings ----
  await act('drawings');
  await page.waitForSelector('[data-dwg][open]');
  await settle();
  const opts = await page.$$eval('[data-dwg-sheet] option', (o) => o.map((x) => x.textContent));
  ok(opts.length === 12 && opts[0].startsWith('GA-01 — Plan at Level 1') && opts.some((t) => t.startsWith('A-B1 — Assembly B1')), 'Drawings: 12 sheets listed (' + opts[0] + ' … ' + opts[opts.length - 1] + ')');
  ok(await dc(() => document.activeElement?.matches('[data-dwg-sheet]')), 'focus starts on the sheet list');
  const inked = () => dc(() => { const c = document.querySelector('[data-dwg-canvas]'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let k = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 100) k++; return k; });
  ok(await inked() > 2000, 'plan preview drawn on the canvas');
  await page.screenshot({ path: path.join(OUT, '04-drawings-plan.png') });
  await page.keyboard.press('ArrowDown');                     // keyboard: next sheet
  await settle();
  ok((await page.inputValue('[data-dwg-sheet]')) === '1', 'arrow key moves to the next sheet');
  await page.selectOption('[data-dwg-sheet]', { label: opts.find((t) => t.startsWith('A-B1')) });
  await settle();
  await page.screenshot({ path: path.join(OUT, '04b-drawings-assembly.png') });
  const allF = await download(() => page.click('[data-dwg-all]'));
  const allInfo = execFileSync('/usr/bin/pdfinfo', [allF], { encoding: 'utf8' });
  ok(/Pages:\s+12/.test(allInfo) && /1190\.55 x 841\.89/.test(allInfo), 'All sheets PDF: 12 A3 pages (pdfinfo)');
  const oneF = await download(() => page.click('[data-dwg-one]'));
  const oneText = execFileSync('/usr/bin/pdftotext', ['-layout', oneF, '-'], { encoding: 'utf8' });
  ok(/Pages:\s+1\b/.test(execFileSync('/usr/bin/pdfinfo', [oneF], { encoding: 'utf8' })) && oneText.includes('Assembly B1') && oneText.includes('Part list') && oneText.includes('PL20x180'), 'This sheet PDF: one page, Assembly B1 with its part list');
  await page.keyboard.press('Escape');
  await settle();
  ok(await dc(() => !document.querySelector('dialog[open]') && document.activeElement?.closest('.dc-tools') !== null), 'Esc closes Drawings; focus back on the toolbar');

  // ---- dark theme ----
  await page.goto(BASE + '/lab/detailcraft?space=model', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.detailcraft && window.detailcraft.view);
  await act('sample');
  await page.waitForFunction(() => window.detailcraft.built.parts.length === 25);
  await settle(); await settle();
  const bg = await dc(() => getComputedStyle(document.querySelector('.dc-stage')).backgroundColor);
  ok(/rgb\((2\d|3\d), (3\d|4\d), (4\d|5\d)\)/.test(bg), 'Model (dark) theme tokens on the stage: ' + bg);
  const px = await dc(() => { const c = document.querySelector('[data-canvas]'); const g = c.getContext('webgl2') || c.getContext('webgl'); const p = new Uint8Array(4); g.readPixels(4, 4, 1, 1, g.RGBA, g.UNSIGNED_BYTE, p); return [...p]; });
  ok(px[0] < 80 && px[1] < 80 && px[2] < 80, '3D background follows the dark theme', px.join(','));
  await act('drawings');
  await page.waitForSelector('[data-dwg][open]');
  await settle();
  await page.screenshot({ path: path.join(OUT, '04c-drawings-dark.png') });
  await page.click('[data-dwg-close]');
  await settle();
  await page.click('[data-view="plan"]');
  await settle();
  await page.screenshot({ path: path.join(OUT, '05-sample-plan-model.png') });
  await page.click('[data-view="elevation"]');
  await settle();
  await page.screenshot({ path: path.join(OUT, '05-sample-elevation-model.png') });

  // ---- build a model by clicking ----
  await page.goto(BASE + '/lab/detailcraft?space=paper', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.detailcraft && window.detailcraft.view);
  await page.click('[data-view="plan"]');
  await page.selectOption('[data-vlevel]', 'Level 2');
  await page.locator('[data-canvas]').hover();
  await page.keyboard.press('b');
  ok(await dc(() => window.detailcraft.tool === 'beam'), 'B picks the beam tool');
  await clickModel([0, 0, 4000]);
  await clickModel([6000, 0, 4000]);
  let st = await dc(() => window.detailcraft.model.state.members.map((m) => m.type + ' ' + m.start.join(',') + ' → ' + m.end.join(',')));
  ok(st.length === 1 && st[0] === 'beam 0,0,4000 → 6000,0,4000', 'two clicks in plan: beam A/1 → A/2 at Level 2', st.join('; '));
  await page.selectOption('[data-vlevel]', 'Level 1');
  await page.locator('[data-canvas]').hover();
  await page.keyboard.press('c');
  await clickModel([0, 0, 0]);
  await clickModel([6000, 0, 0]);
  st = await dc(() => window.detailcraft.model.state.members.filter((m) => m.type === 'column').map((m) => m.start[2] + '→' + m.end[2]));
  ok(st.length === 2 && st.every((x) => x === '0→4000'), 'one click each: two columns from Level 1 up to Level 2');
  await page.keyboard.press('Escape');
  ok(await dc(() => window.detailcraft.tool === 'select'), 'Esc goes back to Select');
  await page.selectOption('[data-vlevel]', 'Level 2');
  await settle();
  await clickModel([3000, 0, 4000]);
  ok((await dc(() => window.detailcraft.selection?.kind)) === 'member' && (await page.textContent('[data-props-h]')).startsWith('Beam'), 'click the beam in plan: selected');
  await act('endplates');
  ok(await dc(() => window.detailcraft.model.state.connections.length) === 2, 'End plates: both beam ends connected');
  const len = await dc(() => window.detailcraft.built.parts.find((p) => p.type === 'beam').length);
  ok(Math.abs(len - (6000 - 2 * (309.88 / 2 + 20))) < 1e-6, 'beam cut back to the plates: ' + len.toFixed(2));
  // select a column from the marks list, base plate, then Similar
  await page.click('[data-marks] button:has-text("c1")');
  ok((await dc(() => window.detailcraft.selection?.kind)) === 'member', 'marks list selects a column');
  await act('baseplate');
  ok(await dc(() => window.detailcraft.model.state.connections.filter((c) => c.type === 'baseplate').length) === 1, 'Base plate added');
  await act('similar');
  ok(await dc(() => window.detailcraft.model.state.connections.filter((c) => c.type === 'baseplate').length) === 2, 'Similar: the other column gets the same base plate');
  await page.keyboard.press('Control+z');
  ok(await dc(() => window.detailcraft.model.state.connections.length) === 3, 'Ctrl+Z undoes the copy (one step)');
  await page.keyboard.press('Control+y');
  ok(await dc(() => window.detailcraft.model.state.connections.length) === 4, 'Ctrl+Y redoes it');
  // footing by keyboard: F, then the "Add by grid" form
  await page.locator('[data-canvas]').hover();
  await page.keyboard.press('f');
  await page.selectOption('[data-by-grid] select >> nth=1', '2');
  await page.locator('[data-by-grid] button[type="submit"]').focus();
  await page.keyboard.press('Enter');
  const ft = await dc(() => window.detailcraft.model.state.footings.map((f) => f.x + ',' + f.y + ',' + f.top));
  ok(ft.length === 1 && ft[0] === '6000,0,0', 'footing placed from the keyboard form at A/2, Level 1', ft.join(';'));
  ok(await dc(() => window.detailcraft.schedule.rows.length) >= 2, 'its bars are in the bending schedule');
  await page.keyboard.press('Escape');
  await page.click('[data-view="3d"]');
  await settle();
  await page.screenshot({ path: path.join(OUT, '06-built-by-clicks.png') });

  // ---- save, reopen ----
  const saved = await download(() => act('save'));
  const savedJson = JSON.parse(fs.readFileSync(saved, 'utf8'));
  ok(savedJson.format === 'detailcraft' && savedJson.version === 2 && savedJson.members.length === 3, 'Save downloads the model (format, version, 3 members)');
  await act('new');
  ok(await dc(() => window.detailcraft.model.state.members.length) === 0, 'New after saving: no question, empty model');
  await page.setInputFiles('[data-file]', saved);
  await page.waitForFunction(() => window.detailcraft.model.state.members.length === 3);
  ok(await dc(() => window.detailcraft.model.state.connections.length === 4 && window.detailcraft.model.state.footings.length === 1), 'reopened: members, connections and footing back');

  // ---- unsaved changes → in-page dialog, focus back ----
  await page.click('[data-marks] button:has-text("b1")');
  await page.click('[data-props] button:has-text("Delete")');
  ok(await dc(() => window.detailcraft.model.dirty), 'a delete makes the model dirty');
  await page.focus('.dc-tools [data-act="new"]');
  await page.keyboard.press('Enter');
  await page.waitForSelector('dialog.dc-ask[open]');
  ok(true, 'New with unsaved changes asks in the page (no native dialog)');
  await page.screenshot({ path: path.join(OUT, '07-ask.png') });
  await page.click('dialog.dc-ask button[data-key="cancel"]');
  await settle();
  ok(await dc(() => window.detailcraft.model.state.members.length === 2 && document.activeElement?.dataset.act === 'new'), 'Cancel keeps the model; focus back on New');
  await page.keyboard.press('Control+z');
  ok(await dc(() => window.detailcraft.model.state.members.length) === 3, 'undo the delete');

  // ---- IFC import through the toolbar's file chooser ----
  await page.evaluate(() => window.detailcraft.model.markSaved());
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), act('import')]);
  ok((await chooser.element().getAttribute('accept')) === '.ifc', 'Import IFC asks for .ifc files (through host.js)');
  await chooser.setFiles(path.join(REPO, 'tools/detailcraft-test/fixtures/ios-steel-ifc2x3.ifc'));
  await page.waitForSelector('[data-import-report]', { timeout: 30000 });
  await settle();
  const imp = await dc(() => ({ n: window.detailcraft.model.state.members.length, lv: window.detailcraft.model.state.levels.map((l) => l.name).join(','), g: window.detailcraft.model.state.grids.x.length + window.detailcraft.model.state.grids.y.length, dirty: window.detailcraft.model.dirty, rows: [...document.querySelectorAll('[data-import-report] tbody tr')].map((r) => r.textContent) }));
  ok(imp.n === 8 && imp.lv === 'Ground,First' && imp.g === 4 && imp.dirty, 'IFC imported: 8 members, levels Ground and First, 4 grid lines, model not saved yet', JSON.stringify(imp));
  ok(imp.rows.length === 4 && imp.rows.some((r) => r.includes('IfcWall')) && imp.rows.some((r) => r.includes('unequal-leg angle')), 'import report lists what was not brought in, by class (' + imp.rows.length + ' rows)');
  await page.screenshot({ path: path.join(OUT, '07b-ifc-import-report.png') });
  await page.keyboard.press('Enter');
  await settle();
  ok(await dc(() => !document.querySelector('dialog[open]') && document.activeElement?.closest('.dc-tools') !== null), 'OK closes the report; focus back on the toolbar');
  ok((await page.textContent('[data-status]')).startsWith('Imported ios-steel-ifc2x3.ifc: 8 members'), 'status line sums the import');
  // 0.4 D11: its two holes and the bolt came in; the bolt is loose, listed in the Model panel with a way to remove it
  const imp2 = await dc(() => { const d = window.detailcraft; return { holes: d.model.state.members.reduce((t, m) => t + m.holes.length, 0), bolts: d.model.state.bolts.length, built: d.built.bolts.length }; });
  ok(imp2.holes === 2 && imp2.bolts === 1 && imp2.built === 1, 'the file\'s 2 holes and its bolt came in (0.4 D11)', JSON.stringify(imp2));
  ok(await dc(() => window.detailcraft.built.parts.length === 8 && window.detailcraft.built.problems.length === 0), 'imported members build into 8 parts with no problems');
  await page.screenshot({ path: path.join(OUT, '07c-ifc-imported.png') });
  await dc(() => window.detailcraft.setSelection([]));
  await settle();
  ok(/1 loose bolt from an IFC import/.test(await page.textContent('[data-props]')), 'nothing selected: the Model panel counts the loose bolt');
  await page.click('[data-remove-bolts]');
  await settle();
  ok(await dc(() => window.detailcraft.model.state.bolts.length === 0 && window.detailcraft.built.bolts.length === 0) && /1 loose bolt removed/.test(await page.textContent('[data-status]')), 'Remove loose bolts takes it out (one undo step)');
  await page.keyboard.press('Control+z');
  await settle();
  ok(await dc(() => window.detailcraft.model.state.bolts.length) === 1, 'Ctrl+Z brings it back');

  // ---- hostile file contents stay text ----
  const evil = { ...savedJson, name: '<img src=x onerror="window.__pwned=1">' };
  const evilF = path.join(DL, 'evil.detailcraft.json');
  fs.writeFileSync(evilF, JSON.stringify(evil));
  await page.evaluate(() => window.detailcraft.model.markSaved());
  await page.setInputFiles('[data-file]', evilF);
  await page.waitForFunction(() => window.detailcraft.model.state.name.startsWith('<img'));
  await settle();
  ok(await dc(() => !window.__pwned && !document.querySelector('main img') && document.querySelector('[data-model-name]').value.startsWith('<img')), 'a model named <img …> shows as text, runs nothing');

  // ---- Edit: copy, cut, paste (follows the pointer, lands on a clicked grid intersection), paste in place,
  //      duplicate, delete, select all/none — toolbar buttons, the More menu and the keys; one undo step each ----
  await page.goto(BASE + '/lab/detailcraft?space=paper', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.removeItem('detailcraft.clipboard'); localStorage.removeItem('detailcraft.settings'); });
  await page.evaluate(() => window.detailcraft?.model.markSaved());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.detailcraft && window.detailcraft.view);
  await act('sample');
  await page.waitForFunction(() => window.detailcraft.built.parts.length === 25);
  const tb = await dc(() => {
    const g = document.querySelector('.dc-tools [role="group"][aria-label="Edit"]');
    const row = g?.querySelector('[class$="-tool-row"]');
    const tops = new Set([...document.querySelectorAll('.dc-tools > [role="group"]')].map((x) => Math.round(x.getBoundingClientRect().top)));
    return {
      kids: row ? [...row.children].map((c) => c.dataset.act || (c.matches('details[data-edit-menu]') ? 'more' : c.tagName)) : [],
      groups: [...document.querySelectorAll('.dc-tools > [role="group"]')].map((x) => x.getAttribute('aria-label')),
      rows: tops.size, h: Math.round(document.querySelector('.dc-tools').getBoundingClientRect().height),
      menu: [...document.querySelectorAll('[data-edit-menu] [role="menuitem"]')].map((b) => b.dataset.act + '|' + (b.querySelector('kbd')?.textContent || '')),
    };
  });
  ok(tb.kids.join(',') === 'undo,redo,copy,paste,more', 'Edit group: Undo, Redo, Copy, Paste, More (tools are children of the tool row)', tb.kids.join(','));
  ok(tb.groups.join(',') === 'File,Place,Connect,Edit,Output', 'toolbar groups File, Place, Connect, Edit, Output', tb.groups.join(','));
  ok(tb.menu.join(' ') === 'cut|Ctrl+X copy|Ctrl+C paste|Ctrl+V paste-in-place|Ctrl+Shift+V duplicate|Ctrl+D move|M delete|Delete select-all|Ctrl+A select-none|Esc', 'More menu: every item with its key', tb.menu.join(' '));
  ok(tb.rows <= 2 && tb.h < 150, 'toolbar at 1440 px: ' + tb.rows + ' row(s), ' + tb.h + ' px tall');
  const copyBtn = page.locator('.dc-tool-row > [data-act="copy"]');
  ok(await copyBtn.isDisabled() && /select members or footings first/.test(await copyBtn.getAttribute('title')), 'nothing selected: Copy is disabled and its title says why');
  ok(await page.locator('.dc-tool-row > [data-act="paste"]').isDisabled() && /nothing copied yet/.test(await page.locator('.dc-tool-row > [data-act="paste"]').getAttribute('title')), 'empty clipboard: Paste is disabled and says why');
  await page.screenshot({ path: path.join(OUT, '10-edit-toolbar-1440.png'), clip: { x: 0, y: 0, width: 1440, height: 220 } });

  // copy one beam with the toolbar, paste it by clicking a grid intersection
  await clickModel([3000, 0, 4000 - 10]);
  ok((await dc(() => window.detailcraft.selection?.kind)) === 'member', 'beam selected by a click');
  await copyBtn.click();
  const stored = await dc(() => JSON.parse(localStorage.getItem('detailcraft.clipboard') || 'null'));
  ok(stored && stored.format === 'detailcraft-clip' && stored.members.length === 1 && stored.members[0].profile === 'W16x26' && stored.connections.length === 0, 'Copy: the beam is on the clipboard (localStorage detailcraft.clipboard), its end plates left out (columns not copied)');
  ok(/Copied 1 member\..*2 connections left out/.test(await page.textContent('[data-status]')), 'status says what was copied and what was left out');
  await page.click('.dc-tool-row > [data-act="paste"]');
  ok(await dc(() => window.detailcraft.tool === 'paste' && document.querySelector('[data-props-h]').textContent === 'Paste'), 'Paste: the paste tool is on, Properties shows the paste panel');
  const box0 = await page.locator('[data-canvas]').boundingBox();
  const sNode = await dc((pt) => window.detailcraft.nodeScreen(pt), [0, 0, 0]);
  await page.mouse.move(box0.x + sNode.x, box0.y + sNode.y);
  await settle();
  ok(await dc(() => window.detailcraft.view.ghost?.length === 1 && !!window.detailcraft.view.hoverNode), 'the copy follows the pointer (a dashed ghost at the hovered grid intersection)');
  await page.screenshot({ path: path.join(OUT, '11-paste-follows-pointer.png') });
  await page.mouse.click(box0.x + sNode.x, box0.y + sNode.y);
  await settle();
  const pasted = await dc(() => { const d = window.detailcraft, s = d.model.state, m = s.members[s.members.length - 1]; return { n: s.members.length, m, sel: d.selection, mark: d.marks.partMark.get(m.id), orig: d.marks.partMark.get(s.members.find((x) => x.type === 'beam').id), tool: d.tool, ids: new Set(s.members.map((x) => x.id)).size }; });
  ok(pasted.n === 12 && pasted.m.start.join() === '0,0,0' && pasted.m.end.join() === '6000,0,0' && pasted.tool === 'select', 'click A/1 at Level 1: the beam is pasted there (0,0,0 to 6000,0,0)', JSON.stringify(pasted.m));
  ok(pasted.ids === 12 && pasted.sel?.id === pasted.m.id && pasted.mark && pasted.mark !== pasted.orig && /^b\d+$/.test(pasted.orig || ''), 'new id, selected, and its own part mark (' + pasted.mark + '; the cut-back originals are ' + pasted.orig + ': marks are numbered again from the model)');
  await page.keyboard.press('Control+z');
  ok(await dc(() => window.detailcraft.model.state.members.length) === 11, 'Ctrl+Z: the paste is one undo step');
  await page.keyboard.press('Control+y');
  ok(await dc(() => window.detailcraft.model.state.members.length) === 12, 'Ctrl+Y: back again');
  await page.keyboard.press('Control+z');

  // select all with the keys, copy, paste in place from the More menu
  await page.locator('[data-canvas]').hover();
  await page.keyboard.press('Control+a');
  ok(await dc(() => window.detailcraft.selected.length) === 32 && (await page.textContent('[data-props-h]')) === '32 selected', 'Ctrl+A selects all 32 (11 members, 14 connections, 7 footings)');
  await page.keyboard.press('Control+c');
  ok((await page.textContent('[data-status]')).startsWith('Copied 11 members, 14 connections, 7 footings'), 'Ctrl+C copies all of it, connections with their members');
  await page.keyboard.press('Escape');
  ok(await dc(() => window.detailcraft.selected.length) === 0, 'Esc: nothing selected');
  await page.click('[data-edit-menu] > summary');
  ok(await page.locator('[data-edit-menu] .dc-menu-list').isVisible(), 'More opens the menu');
  ok(await page.locator('[data-edit-menu] [data-act="copy"]').isDisabled() && !(await page.locator('[data-edit-menu] [data-act="paste-in-place"]').isDisabled()), 'in the menu, Copy is disabled (nothing selected) and Paste in place is ready');
  await page.screenshot({ path: path.join(OUT, '12-edit-more-menu.png') });
  await page.click('[data-edit-menu] [data-act="paste-in-place"]');
  await settle();
  const inPlace = await dc(() => { const d = window.detailcraft, s = d.model.state; return { m: s.members.length, c: s.connections.length, f: s.footings.length, marks: d.marks.parts.map((p) => p.mark + ':' + p.count).join(' '), open: document.querySelector('[data-edit-menu]').open, sel: d.selected.length, ids: new Set([...s.members, ...s.connections, ...s.footings].map((x) => x.id)).size }; });
  ok(inPlace.m === 22 && inPlace.c === 28 && inPlace.f === 14 && !inPlace.open && inPlace.sel === 32, 'Paste in place (menu): 22 members, 28 connections, 14 footings, the copy selected, the menu closed', JSON.stringify(inPlace));
  ok(inPlace.ids === 64 && inPlace.marks === 'c1:4 c2:8 b1:8 br1:2 p1:16 p2:12', 'new ids for everything; identical pieces share their marks (' + inPlace.marks + ')');
  ok(/sit exactly on members already there/.test(await page.textContent('[data-status]')), 'status warns that the copy sits on the originals');
  await page.keyboard.press('Control+z');
  ok(await dc(() => window.detailcraft.model.state.members.length === 11 && window.detailcraft.model.state.connections.length === 14), 'one Ctrl+Z takes the whole paste away');

  // Shift+click adds to the selection; Duplicate (menu) uses the Settings offset; Delete (menu)
  await clickModel([3000, 0, 4000 - 10]);
  const col = await dc(() => window.detailcraft.model.state.members.find((m) => m.type === 'column' && m.start[0] === 12000 && m.start[1] === 0));
  const box1 = await page.locator('[data-canvas]').boundingBox();
  const sc = await dc((pt) => window.detailcraft.nodeScreen(pt), [12000, 0, 2000]);
  await page.keyboard.down('Shift');
  await page.mouse.click(box1.x + sc.x, box1.y + sc.y);
  await page.keyboard.up('Shift');
  await settle();
  ok(await dc(() => window.detailcraft.selected.length) === 2 && (await page.textContent('[data-props-h]')) === '2 selected', 'Shift+click adds the column: 2 selected');
  await page.click('[data-edit-menu] > summary');
  await page.click('[data-edit-menu] [data-act="duplicate"]');
  await settle();
  const dup = await dc(() => { const s = window.detailcraft.model.state; return { n: s.members.length, last: s.members.slice(-2).map((m) => m.type + ' ' + m.start.join(',')) }; });
  ok(dup.n === 13 && dup.last.includes('beam 6000,0,4000') && dup.last.includes('column 18000,0,0'), 'Duplicate: both copied 6000 mm along x (the default offset)', JSON.stringify(dup));
  await page.click('[data-edit-menu] > summary');
  await page.click('[data-edit-menu] [data-act="delete"]');
  ok(await dc(() => window.detailcraft.model.state.members.length) === 11, 'Delete (menu) removes both copies at once');
  await page.keyboard.press('Control+z');
  await page.keyboard.press('Control+z');
  ok(await dc(() => window.detailcraft.model.state.members.length) === 11 && col, 'undo the delete, then the duplicate');

  // Cut, Esc out of a paste, Ctrl+Shift+V
  await clickModel([3000, 0, 4000 - 10]);
  await page.keyboard.press('Control+x');
  ok(await dc(() => window.detailcraft.model.state.members.length === 10 && window.detailcraft.model.state.connections.length === 12), 'Ctrl+X cuts the beam (and its two end plates go with it)');
  await page.locator('[data-canvas]').hover();
  await page.keyboard.press('Control+v');
  ok(await dc(() => window.detailcraft.tool) === 'paste', 'Ctrl+V starts pasting');
  await page.keyboard.press('Escape');
  ok(await dc(() => window.detailcraft.tool === 'select' && window.detailcraft.model.state.members.length === 10), 'Esc cancels the paste; nothing added');
  await page.keyboard.press('Control+Shift+V');
  ok(await dc(() => { const s = window.detailcraft.model.state, m = s.members[s.members.length - 1]; return s.members.length === 11 && m.start.join() === '0,0,4000' && m.end.join() === '6000,0,4000'; }), 'Ctrl+Shift+V pastes it back in place');
  await page.keyboard.press('Control+z'); await page.keyboard.press('Control+z');
  ok(await dc(() => window.detailcraft.model.state.connections.length) === 14, 'two undos: back to the sample with every connection');

  // keyboard paste: typed offset in the paste panel; Delete key
  await clickModel([3000, 0, 4000 - 10]);
  await page.keyboard.press('Control+c');
  await page.locator('[data-canvas]').hover();
  await page.keyboard.press('Control+v');
  await page.fill('#dc-poff0', '0'); await page.fill('#dc-poff1', '0'); await page.fill('#dc-poff2', '-1000');
  await page.locator('[data-paste-offset] button[type="submit"]').click();
  ok(await dc(() => { const s = window.detailcraft.model.state, m = s.members[s.members.length - 1]; return s.members.length === 12 && m.start.join() === '0,0,3000'; }), 'typed offset (0, 0, -1000) in the paste panel: pasted 1 m lower');
  await page.locator('[data-canvas]').hover();
  await page.keyboard.press('Delete');
  ok(await dc(() => window.detailcraft.model.state.members.length) === 11, 'Delete key removes the pasted beam');

  // the clipboard survives in localStorage: a fresh page (as another tab would) pastes it; a tampered one is refused
  await page.evaluate(() => window.detailcraft?.model.markSaved());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.detailcraft && window.detailcraft.view);
  await act('sample');
  await page.waitForFunction(() => window.detailcraft.built.parts.length === 25);
  ok(!(await page.locator('.dc-tool-row > [data-act="paste"]').isDisabled()), 'a fresh page finds the stored clipboard: Paste is ready');
  await page.click('[data-edit-menu] > summary');
  await page.click('[data-edit-menu] [data-act="paste-in-place"]');
  ok(await dc(() => window.detailcraft.model.state.members.length) === 12, 'and pastes it (another tab would too)');
  await page.evaluate(() => window.detailcraft?.model.markSaved());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.detailcraft && window.detailcraft.view);
  await act('sample');
  await page.waitForFunction(() => window.detailcraft.built.parts.length === 25);
  await page.evaluate(() => localStorage.setItem('detailcraft.clipboard', JSON.stringify({ format: 'detailcraft-clip', version: 1, base: [0, 0, 0], members: [{ id: 'm1', type: 'beam', profile: '<img src=x onerror="window.__pwned=1">', start: [0, 0, 0], end: [1000, 0, 0] }] })));
  await page.locator('[data-canvas]').hover();
  await page.keyboard.press('Control+v');
  ok(await dc(() => window.detailcraft.model.state.members.length === 11 && window.detailcraft.tool === 'select' && !window.__pwned) && /Could not paste: The clipboard is empty/.test(await page.textContent('[data-status]')), 'a tampered clipboard (unknown profile) is refused with a plain message; nothing pasted, nothing run');
  await page.evaluate(() => localStorage.setItem('detailcraft.clipboard', JSON.stringify({ format: 'detailcraft-clip', version: 99, base: [0, 0, 0], members: [] })));
  await page.keyboard.press('Control+Shift+V');
  ok(/newer DetailCraft/.test(await page.textContent('[data-status]')), 'a clipboard from a newer version is refused');
  await page.evaluate(() => localStorage.removeItem('detailcraft.clipboard'));

  // ---- Settings › DetailCraft: steel for new members, duplicate offset, copy connections, bolts; kept; reset ----
  await page.keyboard.press('Control+,');
  await page.waitForSelector('[data-app-settings][open]');
  await page.click('[data-settings-tab="app"]');
  ok(await page.locator('[data-dc-settings]').isVisible() && await page.locator('[data-settings-tab="app"]').textContent() === 'DetailCraft', 'Settings has a DetailCraft tab with its own fields');
  ok(await dc(() => document.querySelector('input[name="dcSteel"][value="us"]').checked && document.querySelector('input[name="dcOffX"]').value === '6000' && document.querySelector('input[name="dcBolts"]').checked), 'fields filled from the defaults when the dialog opens');
  await page.check('input[name="dcSteel"][value="eu"]');
  await page.fill('input[name="dcOffX"]', '0');
  await page.fill('input[name="dcOffY"]', '7000');
  await page.locator('input[name="dcOffY"]').dispatchEvent('change');
  await page.uncheck('input[name="dcBolts"]');
  await page.uncheck('input[name="dcConns"]');
  await page.screenshot({ path: path.join(OUT, '13-settings-detailcraft.png') });
  const st1 = await dc(() => ({ s: JSON.parse(localStorage.getItem('detailcraft.settings')), beam: window.detailcraft.toolOptions.beam.profile + ' ' + window.detailcraft.toolOptions.beam.material, col: window.detailcraft.toolOptions.column.profile, bolts: window.detailcraft.view.root.children.find((o) => o.userData.bolts)?.visible }));
  ok(st1.s.steel === 'eu' && st1.s.offset.join() === '0,7000,0' && st1.s.bolts === false && st1.s.conns === false, 'stored in detailcraft.settings', JSON.stringify(st1.s));
  ok(st1.beam === 'IPE300 S355' && st1.col === 'HEB200', 'European steel: Beam starts as IPE300 S355, Column as HEB200');
  ok(st1.bolts === false, 'bolts and anchor rods hidden in the 3D view');
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.detailcraft?.model.markSaved());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.detailcraft && window.detailcraft.view);
  await act('sample');
  await page.waitForFunction(() => window.detailcraft.built.parts.length === 25);
  ok(await dc(() => window.detailcraft.settings.steel === 'eu' && window.detailcraft.toolOptions.beam.profile === 'IPE300' && window.detailcraft.view.root.children.find((o) => o.userData.bolts)?.visible === false), 'after a reload the settings are still in force');
  await clickModel([3000, 0, 4000 - 10]);
  await page.keyboard.press('Control+d');
  const dup2 = await dc(() => { const s = window.detailcraft.model.state, m = s.members[s.members.length - 1]; return { start: m.start.join(), c: s.connections.length }; });
  ok(dup2.start === '0,7000,4000', 'Duplicate uses the offset from Settings (0, 7000, 0)', dup2.start);
  await page.keyboard.press('Control+z');
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Control+c');
  ok(/Copied 11 members, 7 footings\. .*Connections were left out/.test(await page.textContent('[data-status]')), 'with "copy connections" off, a copy leaves them out and says so');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+,');
  await page.waitForSelector('[data-app-settings][open]');
  await page.click('[data-settings-reset]');
  const st2 = await dc(() => ({ s: JSON.parse(localStorage.getItem('detailcraft.settings') || 'null'), steel: document.querySelector('input[name="dcSteel"][value="us"]').checked, x: document.querySelector('input[name="dcOffX"]').value, beam: window.detailcraft.toolOptions.beam.profile, bolts: window.detailcraft.view.root.children.find((o) => o.userData.bolts)?.visible }));
  ok(st2.s?.steel === 'us' && st2.s.offset.join() === '6000,0,0' && st2.steel && st2.x === '6000' && st2.beam === 'W16x26' && st2.bolts === true, 'Reset puts the DetailCraft settings back (US steel, 6000 offset, bolts shown)', JSON.stringify(st2));
  await page.keyboard.press('Escape');
  await page.evaluate(() => { localStorage.removeItem('detailcraft.clipboard'); localStorage.removeItem('detailcraft.settings'); window.detailcraft.model.markSaved(); });

  // ---- phone width ----
  await page.setViewportSize({ width: 390, height: 844 });
  await act('sample').catch(() => {});
  await settle(); await settle();
  // DetailCraft's own markup (<main>) must fit; the shared app bar is reported separately (it is not this app's file)
  const wide = await dc(() => [...document.querySelectorAll('main *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 0.5 && !e.closest('.dc-tools, .dc-tabs, .dc-rep'); }).map((e) => e.tagName + '.' + e.className).slice(0, 5));
  ok(wide.length === 0, '390 px: nothing in the app runs off the right edge (toolbar, report tabs and tables scroll inside themselves)', wide.join(', '));
  const sw = await dc(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth, Math.round(document.querySelector('.app-bar form, .app-bar .space-toggle')?.getBoundingClientRect().right || 0)]);
  if (sw[0] > sw[1]) console.log('  note: the page scrolls sideways to ' + sw[0] + ' px because of the shared app bar (its Paper/Model toggle ends at ' + sw[2] + ' px); the CadCraft lab page does the same');
  await page.screenshot({ path: path.join(OUT, '08-phone.png'), fullPage: false });
  await page.screenshot({ path: path.join(OUT, '09-phone-full.png'), fullPage: true });
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

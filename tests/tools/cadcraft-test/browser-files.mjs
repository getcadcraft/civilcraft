#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-files.mjs — CadCraft 0.4 items of session cad-files in the lab, headless: linetypes and lineweights in the
 * right panel (C8), the layer tools menu and commands (C24, once commands.js installs them), undo of layer changes, autosave
 * (1.2), and the desktop app's files through host.js with a stand-in bridge (W2.18).
 *
 *   node tools/cadcraft-test/browser-files.mjs [--shots <dir>]
 *
 * Run as root (it calls `sudo -u www-data php tools/cadcraft-test/admin.php up|down` for the test admin
 * cctest+cadcraft@projectz.xyz, disabled again at the end). Uses the cached Playwright Chromium. Fails on console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(150); };
const log = () => page.textContent('[data-history]').catch(() => '');

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);

  for (const space of ['paper', 'model']) {
    await page.goto(BASE + '/lab/cadcraft?space=' + space, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.cadcraft);
    console.log('\n== linetypes and lineweights (' + space + ')');
    await page.evaluate(() => {
      const { doc } = window.cadcraft;
      doc.meta.units = 'millimeters';
      doc.change('lines', () => {
        for (let i = 0; i < 6; i++) doc.add({ type: 'line', layer: '0', x1: 0, y1: i * 20, x2: 400, y2: i * 20 });
        doc.add({ type: 'circle', layer: '0', cx: 200, cy: 200, r: 60 });
      });
      window.cadcraft.host.zoomExtents?.();
    });
    await typeCmd('ZOOM'); await typeCmd('E');
    ok(await page.isVisible('#cc-cur-lt') && await page.isVisible('#cc-cur-lw') && await page.isVisible('#cc-lay-lt') && await page.isVisible('#cc-lay-lw'), 'the right panel has Linetype and Lineweight for new objects and for the current layer');
    await page.selectOption('#cc-lay-lt', 'HIDDEN');
    await page.waitForTimeout(150);
    ok(await page.evaluate(() => window.cadcraft.doc.layers.get('0').linetype === 'HIDDEN'), 'choosing a linetype for the layer sets it');
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(150);
    ok(await page.evaluate(() => window.cadcraft.doc.layers.get('0').linetype === 'Continuous'), 'Ctrl+Z puts the layer\'s linetype back (layer changes are undoable)');
    await page.keyboard.press('Control+y');
    await page.waitForTimeout(150);
    // one line DASHED with its own lineweight, through the properties of a selection
    await page.evaluate(() => { const { doc, host } = window.cadcraft; host.setSelection(new Set([[...doc.model.values()][1].id])); });
    await page.waitForSelector('#cc-p-lt');
    await page.selectOption('#cc-p-lt', 'DASHEDX2');
    await page.selectOption('#cc-p-lw', '0.5');
    await page.waitForTimeout(150);
    const e1 = await page.evaluate(() => { const e = [...window.cadcraft.doc.model.values()][1]; return { lt: e.lt, lw: e.lw }; });
    ok(e1.lt === 'DASHEDX2' && e1.lw === 0.5, 'a selected object takes its own linetype and lineweight', JSON.stringify(e1));
    await page.evaluate(() => window.cadcraft.host.setSelection(new Set()));
    await page.waitForTimeout(200);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '01-linetypes-' + space + '.png') });
    await typeCmd('LTSCALE');
    const cmds = /Unknown command/.test(await log());
    if (!cmds) {
      await page.keyboard.type('2'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
      ok(await page.evaluate(() => window.cadcraft.doc.meta.ltscale === 2), 'LTSCALE 2 doubles every dash');
    } else console.log('  (LTSCALE not installed in commands.js yet: skipped)');
    await page.evaluate(() => { window.cadcraft.doc.markSaved(); });
  }

  console.log('\n== layer tools');
  const menu = await page.$('details[data-layer-menu]');
  ok(!!menu, 'the Layers panel has a Tools menu');
  if (menu) {
    await page.click('details[data-layer-menu] > summary');
    const items = await page.$$eval('details[data-layer-menu] [data-cmd]', (xs) => xs.map((x) => x.dataset.cmd));
    ok(items.join() === 'LAYISO,LAYUNISO,LAYOFF,LAYFRZ,LAYMCUR,LAYON,LAYTHW,LAYMRG,LAYDEL,RENAME', 'it lists the ten layer tools', items.join());
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '02-layer-tools-menu.png') });
    await page.keyboard.press('Escape');
  }
  if (!/Unknown command/.test(await log())) {
    console.log('\n== LAYISO / LAYUNISO typed (C24)');
    await page.evaluate(() => { const { doc, host } = window.cadcraft; doc.setLayer('Walls', { color: 1 }); doc.change('w', () => doc.add({ type: 'line', layer: 'Walls', x1: 0, y1: -20, x2: 400, y2: -20 })); host.setSelection(new Set([[...doc.model.values()].pop().id])); });
    await typeCmd('LAYISO');
    ok(await page.evaluate(() => { const L = window.cadcraft.doc.layers; return L.get('Walls').on && !L.get('0').on; }), 'LAYISO on a selected Walls line turns layer 0 off');
    await typeCmd('LAYUNISO');
    ok(await page.evaluate(() => window.cadcraft.doc.layers.get('0').on), 'LAYUNISO turns it back on');

    console.log('\n== PUBLISH from the Plot dialog (C36)');
    await page.evaluate(() => { const { doc } = window.cadcraft; for (const n of ['A-101', 'A-102']) doc.layouts.push({ name: n, paper: { w: 420, h: 297, unit: 'mm', x0: 0, y0: 0, key: 'iso-a3' }, entities: new Map() }); doc.markSaved(); });
    await typeCmd('PLOT');
    await page.waitForSelector('dialog[open] [data-plot-publish]:not([hidden])');
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('dialog[open] [data-plot-publish]')]);
    const f = await dl.path();
    const head = fs.readFileSync(f).subarray(0, 8).toString('latin1');
    const pages = (fs.readFileSync(f).toString('latin1').match(/\/Type \/Page\b/g) || []).length;
    ok(head.startsWith('%PDF') && pages === 2 && !(await page.$('dialog[open][data-plot]')), 'All sheets in one PDF closes the dialog and downloads one PDF of 2 pages', head + ' / ' + pages);
  } else console.log('  (the layer tools are not installed in commands.js yet: skipped)');

  console.log('\n== Save as DXF 2000 (C17)');
  await typeCmd('SAVEAS');
  await page.waitForSelector('dialog[open] input[name="cc-format"][value="dxf2000"]');
  await page.check('dialog[open] input[value="dxf2000"]');
  const [d2] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('dialog[open] button[data-key="ok"]')]);
  const t2 = fs.readFileSync(await d2.path(), 'latin1');
  await page.waitForFunction(() => /\(DXF 2000\)/.test(document.querySelector('[data-history]')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});   // host.js prints after the download starts
  ok(d2.suggestedFilename().endsWith('.dxf') && /\$ACADVER\r\n\s*1\r\nAC1015/.test(t2) && /\(DXF 2000\)/.test(await log()), 'DXF 2000 in Save as downloads an AC1015 .dxf', d2.suggestedFilename());
  ok((t2.match(/\r\nLAYOUT\r\n/g) || []).length >= 3, 'it holds Model and every sheet as a layout', String((t2.match(/\r\nLAYOUT\r\n/g) || []).length));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '03-saved-dxf2000.png') });

  console.log('\n== VIEWBASE: a front view of the solids on a sheet (C18)');
  await page.evaluate(async () => {
    const src = [...document.querySelectorAll('script[type="module"]')].map((s) => s.src).find((s) => /cadcraft\.js/.test(s));
    const M3 = await import(new URL('model3d.js', src).href);
    const { doc } = window.cadcraft, m = doc.model3d;
    doc.meta.units = 'millimeters';
    m.change('solids', () => { M3.makeBox(m, [0, 0], [1, 1], 0, 1); M3.makeCylinder(m, [0.5, 2], 0.3, 0, 2); });
  });
  if (!(await page.$('.cc-tab:has-text("A-101")'))) await page.evaluate(() => { window.cadcraft.doc.layouts.push({ name: 'A-101', paper: { w: 420, h: 297, unit: 'mm', x0: 0, y0: 0, key: 'iso-a3' }, entities: new Map() }); });
  await typeCmd('REGEN');
  await page.click('.cc-tab:has-text("A-101")');
  await page.waitForTimeout(200);
  await typeCmd('VIEWBASE');
  await page.keyboard.press('Enter'); await page.waitForTimeout(100);
  await page.keyboard.press('Enter'); await page.waitForTimeout(100);
  await page.keyboard.press('Enter'); await page.waitForTimeout(100);
  await page.keyboard.type('210,150'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  const vb = await page.evaluate(() => { const { doc } = window.cadcraft; const i = [...doc.space.values()].find((e) => e.type === 'insert' && /^VIEW-FRONT-/.test(e.block)); const b = i && doc.blocks.get(i.block); return i && { onSheet: !!doc.layout, block: i.block, n: b.entities.length, hidden: b.entities.filter((e) => e.layer === 'VIEW-HIDDEN').length }; });
  ok(vb?.onSheet && vb.n === 9 && vb.hidden === 2 && /Placed Front view .* at 1:20/.test(await log()), 'VIEWBASE on sheet A-101: the front view at 1:20, 7 visible and 2 hidden lines', JSON.stringify(vb));
  await typeCmd('ZOOM'); await typeCmd('E');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '04-viewbase-front.png') });
  console.log('\n== autosave and crash recovery (0.4 item 1.2)');
  {
    // a fresh tab: draw, wait for the copy, close the tab without saving, open CadCraft again → "Recover your work?"
    let p2 = await ctx.newPage();
    p2.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
    await p2.goto(BASE + '/lab/cadcraft?autosave=offer', { waitUntil: 'networkidle' });
    await p2.waitForFunction(() => !!window.cadcraft);
    await p2.evaluate(() => { const { doc } = window.cadcraft; doc.meta.name = 'Kept plan'; doc.change('x', () => { doc.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 100, y2: 50 }); doc.add({ type: 'circle', layer: '0', cx: 50, cy: 50, r: 10 }); }); });
    await p2.waitForTimeout(3500);   // the copy is written about 2 s after the last edit
    await p2.close();
    p2 = await ctx.newPage();
    p2.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
    await p2.goto(BASE + '/lab/cadcraft?autosave=offer', { waitUntil: 'networkidle' });
    await p2.waitForSelector('dialog[data-autosave-dialog][open]', { timeout: 15000 });
    const txt = (await p2.textContent('dialog[data-autosave-dialog]')).replace(/\s+/g, ' ');
    ok(/Kept plan/.test(txt), 'the next start asks to recover the drawing, by name', txt.slice(0, 160));
    if (SHOTS) await p2.screenshot({ path: path.join(SHOTS, '05-recover-dialog.png') });
    await p2.click('dialog[data-autosave-dialog] [data-autosave-recover]');
    await p2.waitForFunction(() => window.cadcraft.doc.count() === 2, null, { timeout: 15000 });
    const got = await p2.evaluate(() => { const { doc } = window.cadcraft; return { name: doc.meta.name, dirty: doc.dirty, n: doc.count() }; });
    ok(got.name === 'Kept plan' && got.dirty && got.n === 2, 'Recover opens it again, unsaved, with both objects', JSON.stringify(got));
    // saving drops the copy: the next start offers nothing
    await p2.waitForSelector('dialog[data-autosave-dialog]', { state: 'detached', timeout: 5000 }).catch(() => {});
    const [dl] = await Promise.all([p2.waitForEvent('download', { timeout: 30000 }), p2.evaluate(() => window.cadcraft.engine.text('SAVE'))]);
    ok(/^Kept plan\.(dwg|dxf)$/.test(dl.suggestedFilename()), 'SAVE downloads it (in the format this browser remembers)', dl.suggestedFilename());
    await p2.waitForTimeout(2500);
    await p2.close();
    p2 = await ctx.newPage();
    await p2.goto(BASE + '/lab/cadcraft?autosave=offer', { waitUntil: 'networkidle' });
    await p2.waitForTimeout(2500);
    ok(!(await p2.$('dialog[data-autosave-dialog][open]')), 'after the save the next start offers nothing');
    await p2.close();
  }
  console.log('\n== the desktop app: launch, save in place, save as, Open, a .ccsheets (W2.18; a stand-in bridge)');
  {
    // window.cadcraftDesktop as the desktop shell puts it on the page (host.js), over files kept in the page
    const FX = path.join(REPO, 'tools/cadcraft-test/fixtures/sheetset');
    const files = {};
    for (const rel of ['Clinic.ccsheets', 'plans/Level 1.dwg', 'plans/Level 2.dxf', 'details/Details.dwg']) files['/jobs/Clinic/' + rel] = fs.readFileSync(path.join(FX, rel)).toString('base64');
    const p3 = await ctx.newPage();
    p3.on('console', (m) => { if (m.type() === 'error') problems.push('desktop console: ' + m.text()); });
    p3.on('pageerror', (e) => problems.push('desktop pageerror: ' + e.message));
    await p3.addInitScript((files) => {
      const store = new Map(Object.entries(files).map(([k, v]) => [k, Uint8Array.from(atob(v), (c) => c.charCodeAt(0))]));
      const desk = window.__desk = { writes: [], dialogs: [], downloads: 0 };
      let launch = ['/jobs/Clinic/plans/Level 1.dwg'];
      window.cadcraftDesktop = {
        version: 1,
        openDialog: async () => ['/jobs/Clinic/plans/Level 2.dxf'],
        saveDialog: async (o) => { desk.dialogs.push(o.defaultPath); return '/jobs/Clinic/out/' + o.defaultPath; },
        readFile: async (p) => { if (!store.has(p)) throw new Error('no such file: ' + p); return store.get(p); },
        writeFile: async (p, b) => { store.set(p, b); desk.writes.push({ path: p, head: new TextDecoder().decode(b.slice(0, 6)) }); },
        stat: async (p) => (store.has(p) ? { size: store.get(p).length, mtime: 0 } : null),
        openFolderDialog: async () => '/jobs/Clinic',
        listDir: async (dir) => {
          const pre = dir.replace(/\/$/, '') + '/', names = new Map();
          for (const k of store.keys()) if (k.startsWith(pre)) { const rest = k.slice(pre.length), i = rest.indexOf('/'); names.set(i < 0 ? rest : rest.slice(0, i), i >= 0); }
          return [...names].map(([name, isDir]) => ({ name, dir: isDir }));
        },
        launchFiles: async () => { const l = launch; launch = []; return l; },
        onOpenFiles: (cb) => { window.__deskOpen = cb; },
      };
    }, files);
    p3.on('download', () => problems.push('desktop: a download started (the desktop saves through the bridge)'));
    await p3.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
    await p3.waitForFunction(() => window.cadcraft?.doc.meta.source === 'Level 1.dwg', null, { timeout: 30000 });
    const opened = await p3.evaluate(() => ({ n: window.cadcraft.doc.count(), layouts: window.cadcraft.doc.layouts.length }));
    ok(opened.n > 0 && opened.layouts === 2, 'the file the desktop app was started with opens (Level 1.dwg)', JSON.stringify(opened));
    await p3.evaluate(() => { const { doc } = window.cadcraft; doc.change('x', () => doc.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 500, y2: 500 })); });
    await p3.evaluate(() => { window.cadcraft.engine.text('SAVE'); });
    await p3.waitForFunction(() => window.__desk.writes.length === 1 && !window.cadcraft.doc.dirty, null, { timeout: 15000 }).catch(() => {});
    let w = await p3.evaluate(() => ({ writes: window.__desk.writes, dialogs: window.__desk.dialogs.length, dirty: window.cadcraft.doc.dirty }));
    const hist = (await p3.textContent('[data-history]')) || '';
    ok(w.writes[0].path === '/jobs/Clinic/plans/Level 1.dwg' && w.writes[0].head === 'AC1032' && !w.dialogs && !w.dirty && /Saved \/jobs\/Clinic\/plans\/Level 1\.dwg/.test(hist),
      'SAVE writes the drawing back in place, in its own version, with no dialog, and says where', JSON.stringify(w));
    await p3.evaluate(() => { window.cadcraft.engine.text('SAVEAS'); });   // not awaited: it waits for its dialog
    await p3.click('dialog[open] input[value="dxf2000"]');
    await p3.click('dialog[open] button[data-key="ok"]');
    await p3.waitForFunction(() => window.__desk.writes.length === 2, null, { timeout: 15000 });
    w = await p3.evaluate(() => window.__desk);
    ok(w.dialogs[0] === 'Level 1.dxf' && w.writes[1].path === '/jobs/Clinic/out/Level 1.dxf' && w.writes[1].head.startsWith('  0'), 'SAVEAS shows the save dialog and writes a DXF where it was pointed', JSON.stringify(w.writes[1]));
    await p3.evaluate(() => { const { doc } = window.cadcraft; doc.change('y', () => doc.add({ type: 'circle', layer: '0', cx: 0, cy: 0, r: 5 })); window.cadcraft.engine.text('SAVE'); });
    await p3.waitForFunction(() => window.__desk.writes.length === 3, null, { timeout: 15000 });
    w = await p3.evaluate(() => window.__desk);
    ok(w.writes[2].path === '/jobs/Clinic/out/Level 1.dxf' && w.dialogs.length === 1, 'the next SAVE goes to the file chosen in SAVEAS', JSON.stringify(w.writes[2]));
    await p3.keyboard.press('Control+o');
    await p3.waitForFunction(() => window.cadcraft.doc.meta.source === 'Level 2.dxf', null, { timeout: 15000 });
    ok(true, 'Ctrl+O opens through the desktop dialog, in its own tab (Level 2.dxf)');
    await p3.evaluate(() => window.__deskOpen(['/jobs/Clinic/Clinic.ccsheets']));
    await p3.waitForFunction(() => !!window.cadcraft.host.sheetSet?.state.set, null, { timeout: 15000 });
    const set = await p3.evaluate(() => { const st = window.cadcraft.host.sheetSet.state; return { name: st.set.name, writable: st.writable, folder: st.folder.path }; });
    ok(set.name === 'Riverside Clinic' && set.writable && set.folder === '/jobs/Clinic', 'a .ccsheets double-clicked while running opens in the Sheet Set panel with its folder, writable', JSON.stringify(set));
    if (SHOTS) await p3.screenshot({ path: path.join(SHOTS, '06-desktop.png') });
    await p3.close();
  }
  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (err) {
  ok(false, 'browser run', err.stack || err.message);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'error.png') }).catch(() => {});
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

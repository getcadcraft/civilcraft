#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-save.mjs — CadCraft's Save / Save as (DWG or DXF) in the lab, headless.
 *
 *   node tools/cadcraft-test/browser-save.mjs [--shots <dir>]
 *
 * Run as root (it calls `sudo -u www-data php tools/cadcraft-test/admin.php up|down` for the test admin
 * cctest+cadcraft@projectz.xyz, disabled again at the end). Uses the cached Playwright Chromium.
 * Checks: a DWG opens through the worker reader (0.4 1.3); it saves with Ctrl+S as a DWG in the version it came in (the public fixture
 * fixtures/dwg/kitchen-equipment.dwg: AutoCAD 2018, AC1032; same name, the report printed); the saved file opens again
 * in CadCraft with the same objects and sheets; Save as shows both formats with the current one chosen and the DWG
 * version; choosing AutoCAD 2004 saves AC1018 and Ctrl+S keeps it; it saves a DXF; Ctrl+S then keeps DXF for that
 * drawing; a new drawing uses the format chosen last; a DXF opened saves as DXF; DXFOUT always saves DXF without
 * changing what Save uses; Esc in Save as saves nothing; the toolbar has Save and Save as; a sheet draws each viewport without
 * the layers frozen in it (0.5 VP.1, Autodesk's sample when present); no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
const SAMPLE = path.join(REPO, 'fixtures/dwg/kitchen-equipment.dwg');   // public fixture (fixtures/README.md), AutoCAD 2018
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
// a session minted in-process (admin.php session): no password sign-in, so the shared login throttle is left alone
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session'], { encoding: 'utf8' }));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-save-'));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const log = () => page.textContent('[data-history]').catch(() => page.evaluate(() => document.body.innerText));
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(150); };
const download = async (action) => {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), action()]);
  const file = path.join(tmp, dl.suggestedFilename());
  await dl.saveAs(file);
  return { name: dl.suggestedFilename(), bytes: fs.readFileSync(file), file };
};
const objects = () => page.evaluate(() => window.cadcraft.doc.model.size);
const open = async (file) => {
  await page.setInputFiles('[data-file]', file);
  await page.waitForFunction((n) => window.cadcraft.doc.meta.source === n && window.cadcraft.doc.model.size > 0, path.basename(file), { timeout: 60000 });
};

try {
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await page.evaluate(() => { try { localStorage.removeItem('cadcraft.saveFormat'); localStorage.removeItem('cadcraft.dwgVersion'); } catch {} });

  console.log('\n== toolbar');
  ok(await page.isVisible('[data-cmd="SAVE"]') && await page.isVisible('[data-cmd="SAVEAS"]'), 'the File group has Save and Save as');
  ok((await page.textContent('[data-cmd="SAVE"]')).trim() === 'Save' && (await page.textContent('[data-cmd="SAVEAS"]')).trim() === 'Save as', 'labelled "Save" and "Save as"');

  console.log('\n== a DWG saves as DWG');
  await open(SAMPLE);
  const n0 = await objects();
  // 0.4 1.3: the DWG was read in a worker (cc-dwg read-async.js; the page's import map gives the same module instance)
  const how = await page.evaluate(async () => (await import('/assets/apps/cadcraft/dev/dwg/read-async.js')).dwgWorkerState());
  ok(how === 'worker', 'the DWG was read in a worker, off the page\'s thread', how);
  // 0.4 C6: its multileader opens as an editable one, its picture as a frame with the file name
  const c6 = await page.evaluate(() => { const d = window.cadcraft.doc; const all = [...d.everyEntity()]; const pic = all.find((e) => e.type === 'insert' && /^\*I/.test(e.block)); return { ml: all.filter((e) => e.type === 'mleader').length, pic: !!pic && d.blocks.get(pic.block).entities.some((e) => e.s === 'example-logo.png') }; });
  ok(c6.ml === 1 && c6.pic, 'its multileader opens as an editable multileader, its picture as a frame with the file name', JSON.stringify(c6));
  const sheets0 =await page.evaluate(() => window.cadcraft.doc.layouts.map((l) => l.name + ':' + l.entities.size).join());
  const a = await download(() => page.keyboard.press('Control+s'));
  ok(a.name === 'kitchen-equipment.dwg', 'Ctrl+S downloads the drawing under its own name as .dwg', a.name);
  ok(a.bytes.subarray(0, 6).toString('latin1') === 'AC1032', 'it is an AutoCAD 2018 DWG (AC1032), the version it came in', a.bytes.subarray(0, 6).toString('latin1'));
  await page.waitForFunction(() => /Saved a copy as/.test(document.querySelector('[data-history]')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});   // host.js prints after the download starts
  ok(/Saved a copy as kitchen-equipment\.dwg \(DWG \(AutoCAD 2018\)\)/.test(await log()), 'the command line says what was saved', (await log()).slice(-400));
  ok(await page.evaluate(() => !window.cadcraft.doc.dirty), 'the drawing counts as saved');

  console.log('\n== the saved DWG opens again');
  const again = path.join(tmp, 'reopen.dwg');
  fs.copyFileSync(a.file, again);
  await open(again);
  const n1 = await objects();
  const blocks = await page.evaluate(() => [...window.cadcraft.doc.blocks.values()].filter((b) => !b.name.startsWith('*')).length);
  ok(n1 === n0 && blocks > 0, 'CadCraft opens the saved DWG with the same objects (' + n1 + ' objects, ' + blocks + ' named blocks; the original had ' + n0 + ')');
  const sheets1 = await page.evaluate(() => window.cadcraft.doc.layouts.map((l) => l.name + ':' + l.entities.size).join());
  ok(sheets1 === sheets0 && sheets0.length > 0, 'and the same sheets with what is on them (' + sheets1 + ')', sheets0);

  console.log('\n== Save as');
  await open(SAMPLE);
  await page.keyboard.press('Control+Shift+s');
  await page.waitForSelector('dialog[open] input[name="cc-format"]');
  const choices = await page.$$eval('dialog[open] input[name="cc-format"]', (xs) => xs.map((x) => x.value + (x.checked ? '*' : '')));
  ok(choices.join() === 'dwg*,dxf,dxf2000', 'the dialog offers DWG (chosen, as the drawing came in), DXF R12 and DXF 2000', choices.join());
  ok(/kitchen-equipment\.dxf/.test(await page.textContent('dialog[open]')), 'it shows the file name each format gives');
  const vers = await page.$$eval('dialog[open] select[data-dwg-version] option', (xs) => xs.map((x) => x.value + (x.selected ? '*' : '')));
  ok(vers.join() === '2018*,2013,2010,2007,2004,2000', 'it offers every DWG version, the drawing\'s own chosen', vers.join());
  if (SHOTS) { await page.screenshot({ path: path.join(SHOTS, '01-save-as-paper.png') }); }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  ok(!(await page.$('dialog[open]')) && /Not saved\./.test(await log()), 'Esc closes it and saves nothing');
  await typeCmd('SAVEAS');
  await page.waitForSelector('dialog[open] input[name="cc-format"]');
  await page.selectOption('dialog[open] select[data-dwg-version]', '2004');
  const v4 = await download(() => page.click('dialog[open] button[data-key="ok"]'));
  await page.waitForFunction(() => /\(DWG \(AutoCAD 2004\)\)/.test(document.querySelector('[data-history]')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});   // host.js prints after the download starts
  ok(v4.name === 'kitchen-equipment.dwg' && v4.bytes.subarray(0, 6).toString('latin1') === 'AC1018' && /\(DWG \(AutoCAD 2004\)\)/.test(await log()), 'choosing AutoCAD 2004 saves an AC1018 DWG', v4.bytes.subarray(0, 6).toString('latin1'));
  const v4b = await download(() => page.keyboard.press('Control+s'));
  ok(v4b.bytes.subarray(0, 6).toString('latin1') === 'AC1018', 'Ctrl+S then keeps AutoCAD 2004 for this drawing', v4b.bytes.subarray(0, 6).toString('latin1'));
  await typeCmd('SAVEAS');
  await page.waitForSelector('dialog[open] input[name="cc-format"]');
  await page.check('dialog[open] input[value="dxf"]');
  const b = await download(() => page.click('dialog[open] button[data-key="ok"]'));
  ok(b.name === 'kitchen-equipment.dxf' && /AC1009/.test(b.bytes.toString('latin1', 0, 400)), 'choosing DXF downloads an R12 DXF', b.name);
  const c = await download(() => page.keyboard.press('Control+s'));
  ok(c.name.endsWith('.dxf'), 'Ctrl+S then keeps DXF for this drawing', c.name);

  console.log('\n== new drawings and DXF files');
  await page.evaluate(() => { const { doc } = window.cadcraft; doc.change('x', () => doc.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 10, y2: 0 })); doc.markSaved(); });
  await typeCmd('NEW');
  await page.evaluate(() => { const { doc } = window.cadcraft; doc.change('x', () => doc.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 10, y2: 10 })); });
  const d = await download(() => page.keyboard.press('Control+s'));
  ok(d.name === 'Drawing1.dxf', 'a new drawing saves in the format chosen last (DXF)', d.name);
  await page.evaluate(() => { try { localStorage.removeItem('cadcraft.saveFormat'); localStorage.removeItem('cadcraft.dwgVersion'); } catch {} window.cadcraft.doc.markSaved(); });
  await typeCmd('NEW');
  await page.evaluate(() => { const { doc } = window.cadcraft; doc.change('x', () => doc.add({ type: 'circle', layer: '0', cx: 0, cy: 0, r: 5 })); });
  const e = await download(() => page.keyboard.press('Control+s'));
  // (since Q.3 each NEW opens its own tab, so this second new drawing is Drawing2 — cad-draw, 2026-10-13)
  ok(e.name === 'Drawing2.dwg' && e.bytes.subarray(0, 6).toString('latin1') === 'AC1015', 'with nothing chosen yet, a new drawing saves as DWG (AutoCAD 2000)', e.name);
  const dxfIn = path.join(tmp, 'From DXF.dxf');
  fs.copyFileSync(b.file, dxfIn);
  await open(dxfIn);
  const f = await download(() => page.keyboard.press('Control+s'));
  ok(f.name === 'From DXF.dxf', 'a DXF opened saves as DXF', f.name);
  await open(SAMPLE);
  const g = await download(() => typeCmd('DXFOUT'));
  ok(g.name.endsWith('.dxf'), 'DXFOUT saves a DXF whatever the drawing is', g.name);
  const h = await download(() => page.keyboard.press('Control+s'));
  ok(h.name.endsWith('.dwg'), 'and Ctrl+S afterwards still saves the drawing as DWG (DXFOUT is a one-off export)', h.name);

  // 0.5 VP.1: Autodesk's sample (not public: skipped without it) — 4 of its 5 viewports freeze 6–7 layers each
  const ARCH = '/var/www/CADCRAFT/testfiles/dwg-samples/architectural_-_annotation_scaling_and_multileaders.dwg';
  if (fs.existsSync(ARCH)) {
    console.log('\n== layers frozen in a viewport (VP.1)');
    await page.evaluate(() => window.cadcraft.doc.markSaved());
    await open(ARCH);
    await page.click('[data-tabs] [role="tab"]:has-text("SECTIONS AND DETAILS")');
    await page.waitForFunction(() => !window.cadcraft.doc.inModel);
    await page.waitForTimeout(400);
    const vp1 = await page.evaluate(() => {
      const { doc, view } = window.cadcraft;
      const vps = [...doc.space.values()].filter((e) => e.type === 'viewport');
      const full = view.cacheOf(doc.model), byKey = view.frzCaches?.get(doc.model);
      const frozen = byKey ? [...byKey.caches.values()] : [];
      return { vps: vps.length, frz: vps.filter((e) => e.frz?.length).length, variants: frozen.length, fullTexts: full.texts.length, frozenTexts: frozen.map((c) => c.texts.length) };
    });
    ok(vp1.frz === 4 && vp1.variants >= 2 && vp1.frozenTexts.every((n) => n < vp1.fullTexts),
      'the sheet draws each viewport from a copy of the model without the layers frozen in it (fewer texts than with every layer)', JSON.stringify(vp1));
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '03-viewport-frozen-layers.png') });
  }

  // 0.5 VP.3: a viewport's own layer colours (fixture made by ezdxf, saved by ODA)
  {
    console.log('\n== viewport layer overrides (VP.3)');
    await page.evaluate(() => window.cadcraft.doc.markSaved());
    await open(path.join(REPO, 'tools/cadcraft-test/fixtures/vp-overrides/vp-overrides-2018.dwg'));
    await page.click('[data-tabs] [role="tab"]:has-text("Overrides")');
    await page.waitForFunction(() => !window.cadcraft.doc.inModel);
    await page.waitForTimeout(400);
    const vo = await page.evaluate(() => {
      const { doc, view } = window.cadcraft, byKey = view.frzCaches?.get(doc.model);
      const caches = byKey ? [...byKey.caches.values()] : [];
      return caches.map((c) => c.paths.map((p) => p.color).sort().join(','));
    });
    ok(vo.length === 2 && vo.some((x) => x.includes('#0000ff')) && vo.some((x) => x.includes('#ff8000')), 'the sheet draws each viewport with its own layer colours (blue walls in one, orange notes in the other)', JSON.stringify(vo));
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '04-viewport-overrides.png') });
  }

  // 0.5 WL.16: clipped references draw clipped (walk.js clips; the fixture is ezdxf's, saved by ODA)
  {
    console.log('\n== XCLIP (WL.16)');
    await page.evaluate(() => window.cadcraft.doc.markSaved());
    await open(path.join(REPO, 'tools/cadcraft-test/fixtures/xclip/xclip-2018.dwg'));
    await typeCmd('ZOOM'); await typeCmd('E');
    const xc = await page.evaluate(() => [...window.cadcraft.doc.model.values()].filter((e) => e.type === 'insert' && e.clip).length);
    ok(xc === 2, 'both clipped references open with their clips', xc);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '05-xclip.png') });
  }

  // 0.5 WL.14 / WL.13: IMAGEATTACH in the app (the file picker stood in for), saved as a DWG IMAGE, plotted as a picture
  {
    console.log('\n== pictures (WL.14, WL.13)');
    const png = fs.readFileSync(path.join(REPO, 'tools/cadcraft-test/fixtures/pictures/quad-rgb.png')).toString('base64');
    await typeCmd('NEW');
    await page.evaluate((b64) => { window.cadcraft.host.pickPictures = async () => [{ name: 'quad-rgb.png', bytes: Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)) }]; }, png);
    await typeCmd('IAT'); await typeCmd('100,100'); await typeCmd('80'); await typeCmd('0');
    const got = await page.evaluate(async () => {
      const { doc } = window.cadcraft;
      const ref = [...doc.model.values()].find((e) => e.type === 'insert');
      const Pl = await import('/assets/apps/cadcraft/dev/plot.js'), Pc = await import('/assets/apps/cadcraft/dev/pictures.js');
      const list = Pl.displayList(doc, Pl.modelSheet(doc, { area: { minX: 90, minY: 90, maxX: 200, maxY: 170 }, paper: 'iso-a4', n: 1 }));
      const pdf = await Pl.toPdf(list);
      return { block: ref?.block, frame: !!Pc.pictureFrame(doc.blocks.get(ref?.block)), pictures: pdf.report.pictures, image: new TextDecoder('latin1').decode(pdf.bytes).includes('/Subtype /Image /Width 40 /Height 30') };
    });
    ok(/^\*I\d+$/.test(got.block || '') && got.frame, 'IMAGEATTACH places a picture in the app', JSON.stringify(got));
    ok(got.pictures === 1 && got.image, 'its PDF holds the 40 × 30 picture (own resolution)', JSON.stringify(got));
    // on screen (cad-draw's view.js hook): the picture's pixels are drawn — red top-left quadrant, under the frame
    await typeCmd('ZOOM'); await typeCmd('E');
    await page.waitForTimeout(600);
    const px = await page.evaluate(() => {
      const { view } = window.cadcraft, c = document.querySelector('canvas'), ctx = c.getContext('2d');
      const s = view.toScreen(120, 145), d = window.devicePixelRatio || 1;
      return [...ctx.getImageData(Math.round((s.x + view.x0) * d), Math.round((s.y + view.y0) * d), 1, 1).data].slice(0, 3);
    });
    ok(px[0] > 180 && px[1] < 80 && px[2] < 80, 'and it shows on screen (the red quadrant where the drawing puts it)', JSON.stringify(px));
    // a background mask hides a line on screen too (WL.8)
    await page.evaluate(() => { const { doc } = window.cadcraft; doc.change('m', () => { doc.add({ type: 'line', layer: '0', color: null, x1: 90, y1: 95, x2: 200, y2: 95 }); doc.add({ type: 'text', layer: '0', color: null, x: 150, y: 93, h: 6, rot: 0, s: 'MASK', ha: 'left', va: 'baseline', bgm: { color: 'bg', scale: 1.5 } }); }); });
    await typeCmd('ZOOM'); await typeCmd('E');
    await page.waitForTimeout(600);
    const mk = await page.evaluate(() => {
      const { view } = window.cadcraft, c = document.querySelector('canvas'), ctx = c.getContext('2d'), d = window.devicePixelRatio || 1;
      const at = (x, y) => { const s = view.toScreen(x, y); let min = 255; for (let k = -2; k <= 2; k++) { const v = ctx.getImageData(Math.round((s.x + view.x0) * d), Math.round((s.y + view.y0) * d) + k, 1, 1).data; min = Math.min(min, (v[0] + v[1] + v[2]) / 3); } return min; };
      return { away: at(100, 95), under: at(148.5, 95) };
    });
    ok(mk.away < 160 && mk.under > 200, 'a masked label hides the line under it on screen, the line shows elsewhere', JSON.stringify(mk));
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '06-picture-mask.png') });
    const dwg = await download(() => typeCmd('SAVEAS').then(async () => { await page.waitForSelector('dialog[open] input[name="cc-format"]'); await page.click('dialog[open] button[data-key="ok"]'); }));
    const txt = dwg.bytes.toString('latin1');
    ok(dwg.name.endsWith('.dwg') && txt.includes('quad-rgb.png'), 'saved as DWG with the picture\'s IMAGEDEF naming its file', dwg.name);
    await page.evaluate(() => window.cadcraft.doc.markSaved());
  }

  console.log('\n== model space');
  await page.goto(BASE + '/lab/cadcraft?space=model', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await typeCmd('SAVEAS');
  await page.waitForSelector('dialog[open] input[name="cc-format"]');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '02-save-as-model.png') });
  ok(await page.$eval('dialog[open]', (x) => getComputedStyle(x).backgroundColor !== 'rgba(0, 0, 0, 0)'), 'the dialog draws in model space too');
  await page.keyboard.press('Escape');

  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (err) {
  ok(false, 'browser run', err.stack || err.message);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'error.png') }).catch(() => {});
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

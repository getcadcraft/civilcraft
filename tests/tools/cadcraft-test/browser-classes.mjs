#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-classes.mjs — CadCraft's Classes panel (0.8 SU.912, session sx-classes) in the real page (/lab/cadcraft): View › More ›
 * Classes… and CLASSES open it; add a class (its parent comes too); Set class on the selection with By class; the class's colour
 * (one undo step); hide / show; the active class takes new lines; on a sheet with a viewport selected, hide a class in that
 * viewport only; rename inline (the children follow); delete (asks, objects → None); design layer scale; a sheet set published to
 * DWG + PDF into its folder (publish-set.js); Esc closes; no console errors. The model, ByClass, overrides and file round trips are in tools/cadcraft-test/classes.mjs (Node).
 *
 *   node tools/cadcraft-test/browser-classes.mjs [--shots <dir>]
 *
 * Run as root (a session for the test admin is minted by tools/cadcraft-test/admin.php). Cached Playwright Chromium.
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
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const page = await ctx.newPage();
page.setDefaultTimeout(10000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const T = (ms) => page.waitForTimeout(ms);
const P = '[data-classes-panel]';
const ev = (fn, arg) => page.evaluate(fn, arg);
const classOf = (id) => ev((i) => { const e = window.cadcraft.doc.get(i) || window.cadcraft.doc.model.get(i); const x = e?.xd?.CADCRAFT_CLASS; return x ? x.find(([c]) => c === 1000)?.[1] + '/' + (x.find(([c]) => c === 1070)?.[1] || 0) : 'None/0'; }, id);
try {
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  const ids = await ev(() => {
    const d = window.cadcraft.doc;
    d.addLayer({ name: 'WALLS', color: 3 });
    let a, b;
    d.change('seed', () => {
      a = d.add({ type: 'line', layer: 'WALLS', x1: 0, y1: 0, x2: 100, y2: 0 }).id;
      b = d.add({ type: 'circle', layer: 'WALLS', cx: 50, cy: 30, r: 10 }).id;
      d.setLayouts([...d.layouts, { name: 'CLS-1', paper: { w: 420, h: 297, unit: 'mm', x0: 0, y0: 0 }, entities: new Map() }]);
    });
    window.cadcraft.host.zoomExtents?.();
    return { a, b };
  });

  console.log('\n== opening it');
  const item = page.locator('[data-tb-key="View"] [data-cmd="CLASSES"]');
  ok(await item.count() === 1, 'View › More has Classes…');
  await page.locator('[data-tb-key="View"] details.cc-menu > summary').click();
  await item.click();
  await page.waitForSelector(P + ':not([hidden])');
  ok(await page.locator(P + ' [data-cls]').count() === 1 && await page.locator(P + ' [data-cls="None"]').count() === 1, 'a new drawing lists only None');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'classes-empty.png') });

  console.log('\n== adding and setting classes');
  await page.fill(P + ' [data-cls-new-name]', 'Lighting - Spot');
  await page.press(P + ' [data-cls-new-name]', 'Enter');
  await T(200);
  const names = await page.locator(P + ' [data-cls]').evaluateAll((ls) => ls.map((l) => l.dataset.cls));
  ok(names.join('|') === 'None|Lighting|Lighting-Spot', 'Lighting - Spot is added as Lighting-Spot, with its parent', names.join('|'));
  ok(await page.locator(P + ' [data-cls-pick="Lighting-Spot"].is-picked').count() === 1, 'the new class is picked');
  ok(await page.locator(P + ' [data-cls-set]').isDisabled(), 'Set class waits for a selection');
  await ev((a) => window.cadcraft.host.setSelection(new Set([a])), ids.a);
  await T(200);
  ok(!(await page.locator(P + ' [data-cls-set]').isDisabled()), 'with a line selected, Set class is on');
  await page.check(P + ' [data-cls-set-by]');
  await page.click(P + ' [data-cls-set]');
  await T(200);
  ok(await classOf(ids.a) === 'Lighting-Spot/31', 'the line is in Lighting-Spot, every attribute by class', await classOf(ids.a));
  const steps0 = await ev(() => window.cadcraft.doc.undoStack.length);
  await page.check(P + ' [data-cls-attr-on="color"]');
  await T(150);
  await page.locator(P + ' input[type=color][data-cls-attr="color"]').evaluate((i) => { i.value = '#ff8800'; i.dispatchEvent(new Event('change', { bubbles: true })); });
  await T(200);
  const col = await ev(() => window.cadcraft.doc.meta.classes.find((c) => c.name === 'Lighting-Spot')?.color);
  ok(col === '#ff8800', 'the class colour is kept in the drawing', String(col));
  ok(await ev(() => window.cadcraft.doc.undoStack.length) === steps0 + 2, 'each attribute change is one undo step');
  await page.click(P + ' [data-cls-eye="Lighting"]');
  await T(200);
  ok(await page.locator(P + ' [data-cls="Lighting-Spot"].is-off').count() === 1, 'hiding Lighting greys out Lighting-Spot under it');
  await page.click(P + ' [data-cls-eye="Lighting"]');
  await T(200);
  ok(await page.locator(P + ' [data-cls="Lighting-Spot"].is-off').count() === 0, 'and shows it again');
  await page.click(P + ' [data-cls-active="Lighting-Spot"]');
  await ev(() => window.cadcraft.host.setSelection(new Set()));
  await page.keyboard.press('Escape');
  await ev(async () => { const e = window.cadcraft.engine; e.text('LINE'); await new Promise((r) => setTimeout(r, 30)); e.text('0,50'); await new Promise((r) => setTimeout(r, 30)); e.text('100,50'); await new Promise((r) => setTimeout(r, 30)); e.text(''); await new Promise((r) => setTimeout(r, 60)); });
  const newest = await ev(() => Math.max(...[...window.cadcraft.doc.model.keys()]));
  ok((await classOf(newest)).startsWith('Lighting-Spot'), 'a line drawn now goes in the active class', await classOf(newest));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'classes-panel.png') });

  console.log('\n== a viewport on a sheet');
  await page.evaluate(() => window.cadcraft.host.classesPanel());
  const vp = await ev(() => {
    const d = window.cadcraft.doc, L = d.layouts.find((l) => l.name === 'CLS-1');
    d.setSpace(L);
    let v; d.change('vp', () => { v = d.add({ type: 'viewport', x: 210, y: 150, w: 300, h: 200, cx: 50, cy: 20, s: 2 }); });
    window.cadcraft.host.setSelection(new Set([v.id]));
    return v.id;
  });
  await T(250);
  ok(await page.locator(P + ' [data-cls-vp]').count() === 1, 'with one viewport selected the panel shows This viewport');
  await page.check(P + ' [data-vp="hidden"]');
  await T(200);
  const vpc = await ev((id) => JSON.stringify(window.cadcraft.doc.get(id).vpc), vp);
  ok(vpc === '{"Lighting-Spot":{"hidden":true}}', 'Hide in this viewport is kept on the viewport', vpc);
  ok(await page.locator(P + ' [data-vp-list] li').count() === 1, 'and listed');
  const hiddenInModel = await ev(() => window.cadcraft.doc.meta.classes.find((c) => c.name === 'Lighting-Spot').visible);
  ok(hiddenInModel === true, 'the class itself stays visible everywhere else');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'classes-viewport.png') });
  await ev(() => { window.cadcraft.host.setSelection(new Set()); window.cadcraft.doc.setSpace(null); });
  await T(200);

  console.log('\n== rename, delete, design layers');
  await page.click(P + ' [data-cls-pick="Lighting"]');
  await page.click(P + ' [data-cls-rename]');
  await page.fill(P + ' [data-cls-rename-input]', 'Light');
  await page.press(P + ' [data-cls-rename-input]', 'Enter');
  await T(250);
  const names2 = await page.locator(P + ' [data-cls]').evaluateAll((ls) => ls.map((l) => l.dataset.cls));
  ok(names2.join('|') === 'None|Light|Light-Spot', 'Rename Lighting → Light: Lighting-Spot follows', names2.join('|'));
  ok((await classOf(ids.a)).startsWith('Light-Spot') && await ev((id) => Object.keys(window.cadcraft.doc.layouts.find((l) => l.name === 'CLS-1').entities.get(id).vpc).join(), vp) === 'Light-Spot', 'the objects and the viewport override follow');
  await page.click(P + ' [data-cls-pick="Light"]');
  await page.click(P + ' [data-cls-delete]');
  await page.waitForSelector('dialog.cc-ask');
  await page.click('dialog.cc-ask button[data-key="ok"]');
  await T(250);
  ok(await classOf(ids.a) === 'None/31' && await page.locator(P + ' [data-cls]').count() === 1, 'Delete: the classes go, their objects to None');
  await page.locator(P + ' [data-cls-design] summary').click();
  await page.fill(P + ' [data-design="scale"][data-layer="WALLS"]', '50');
  await page.press(P + ' [data-design="scale"][data-layer="WALLS"]', 'Tab');
  await T(200);
  ok(await ev(() => JSON.stringify(window.cadcraft.doc.meta.designLayers)) === '{"WALLS":{"scale":50}}', 'a design layer scale is kept in the drawing');
  await ev(() => window.cadcraft.doc.undo());
  ok(await ev(() => JSON.stringify(window.cadcraft.doc.meta.designLayers ?? null)) === 'null', 'and undone');

  console.log('\n== a sheet set published to DWG (publish-set.js)');
  {
    const FX = path.join(REPO, 'tools/cadcraft-test/fixtures/sheetset');
    const files = {};
    const walkFx = (dir, pre = '') => { for (const n of fs.readdirSync(dir)) { const f = path.join(dir, n); if (fs.statSync(f).isDirectory()) walkFx(f, pre + n + '/'); else files[pre + n] = fs.readFileSync(f).toString('base64'); } };
    walkFx(FX);
    await page.evaluate(async (files) => {
      const root = await navigator.storage.getDirectory();
      try { await root.removeEntry('ClinicCls', { recursive: true }); } catch { /* first run */ }
      const top = await root.getDirectoryHandle('ClinicCls', { create: true });
      for (const [p, b64] of Object.entries(files)) {
        let d = top;
        const parts = p.split('/');
        for (const x of parts.slice(0, -1)) d = await d.getDirectoryHandle(x, { create: true });
        const w = await (await d.getFileHandle(parts[parts.length - 1], { create: true })).createWritable();
        await w.write(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
        await w.close();
      }
      window.showDirectoryPicker = async () => top;
    }, files);
    const menu = async (key) => { await page.click('[data-sheetset-menu] > summary'); await page.click('[data-sheetset-menu] [data-ss="' + key + '"]'); };
    await menu('open');
    await page.waitForFunction(() => !!window.cadcraft.host.sheetSet?.state?.set, null, { timeout: 15000 });
    ok(await page.locator('[data-sheetset-menu] [data-ss="publishdwg"]').count() === 1, 'the sheet set menu has Publish to DWG…');
    await menu('publishdwg');
    await page.waitForSelector('dialog.cc-ask');
    await page.click('dialog.cc-ask button[data-key="both"]');
    await page.waitForFunction(() => /sheets published to the folder/.test(document.querySelector('[data-history]')?.textContent || ''), null, { timeout: 60000 });
    const out = await page.evaluate(async () => {
      const top = await (await navigator.storage.getDirectory()).getDirectoryHandle('ClinicCls');
      const d = await top.getDirectoryHandle('Riverside Clinic - published');
      const names = [];
      for await (const [n] of d.entries()) names.push(n);
      const man = JSON.parse(await (await (await d.getFileHandle('publish.json')).getFile()).text());
      return { names: names.sort(), man };
    });
    ok(out.names.filter((n) => n.endsWith('.dwg')).length === 6 && out.names.includes('Riverside Clinic.pdf') && out.names.includes('publish.json'), 'DWG + PDF: six DWGs, the PDF and the manifest in "Riverside Clinic - published"', out.names.join(' | '));
    ok(out.man.sheets.length === 6 && out.man.pdf === 'Riverside Clinic.pdf', 'the manifest names every sheet and the PDF');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'classes-publish.png') });
    await page.evaluate(async () => { try { await (await navigator.storage.getDirectory()).removeEntry('ClinicCls', { recursive: true }); } catch { /* gone */ } });
    await page.evaluate(() => window.cadcraft.host.classesPanel());
  }

  console.log('\n== the command and closing');
  await page.locator(P + ' [data-cls-new-name]').focus();
  await page.keyboard.press('Escape');
  await T(150);
  ok(await page.locator(P).isHidden(), 'Esc closes the panel');
  await ev(async () => { window.cadcraft.engine.text('CLASSES'); await new Promise((r) => setTimeout(r, 200)); });
  ok(await page.locator(P).isVisible(), 'CLASSES opens it again');
  for (const theme of ['model', 'paper']) {
    await page.evaluate((s) => document.documentElement.setAttribute('data-space', s), theme);
    await T(100);
    const box = await page.locator(P).boundingBox();
    ok(box && box.width > 200 && box.height > 100, theme + ': the panel shows', JSON.stringify(box));
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'classes-' + theme + '.png') });
  }
  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (err) {
  ok(false, 'ran to the end', err.stack);
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

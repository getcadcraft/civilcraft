#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-render.mjs — Render a picture in BimCraft (0.5 RC.11 (a), session `render`; render-bim.js + the shared render/)
 * in the lab, headless. Opens the generated IFC fixture (tools/bimcraft-test/ifc-fixture.mjs, georef 'site': Sydney), clicks
 * Render on the toolbar: the renderer loads only then; the dialog names the site's latitude; a draft picture at the view's
 * size has sky above and is not flat; a hidden storey leaves the picture; the section plane clips it; a see-through IFC
 * colour starts as Glass (AC20-FZK-Haus from testfiles/samples when present); Save PNG; every menu style reaches the
 * command; no console errors.    node tools/bimcraft-test/browser-render.mjs [--shots <dir>]
 * Run as root: a session minted for the shared test admin (tools/cadcraft-test/admin.php session bimmodel), as
 * browser-input.mjs does. SwiftShader draws on the CPU.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureIfc } from './ifc-fixture.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : path.join(REPO, 'tmp/shots/render-bim');
fs.mkdirSync(SHOTS, { recursive: true });
const SAMPLE = '/var/www/CADCRAFT/testfiles/samples/AC20-FZK-Haus.ifc';

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m + (d ? ' (' + d + ')' : '')); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };
const shot = (page, name) => page.screenshot({ path: path.join(SHOTS, name + '.png') });

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimmodel'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((s) => new RegExp(s).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });

async function render() {
  await page.click('[data-render-go]');
  await page.waitForFunction(() => /^(Done|Stopped|Could not|Nothing)/.test(document.querySelector('[data-render-status]')?.textContent || ''), null, { timeout: 600000 });
  const status = await page.textContent('[data-render-status]');
  const stats = await page.evaluate(async () => {
    const img = document.querySelector('[data-render-image]');
    if (!img) return null;
    const bmp = await createImageBitmap(await (await fetch(img.src)).blob());
    const c = new OffscreenCanvas(bmp.width, bmp.height), g = c.getContext('2d');
    g.drawImage(bmp, 0, 0);
    const d = g.getImageData(0, 0, bmp.width, bmp.height).data;
    let r = 0, gg = 0, b = 0, n = 0, sum = 0, sum2 = 0, m = 0, hash = 0;
    for (let y = 0; y < Math.floor(bmp.height * 0.05); y++) for (let x = 0; x < bmp.width; x += 3) { const i = (y * bmp.width + x) * 4; r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; }
    for (let i = 0; i < d.length; i += 4) { const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; sum += l; sum2 += l * l; m++; hash = (hash * 31 + d[i] + d[i + 1] * 7 + d[i + 2] * 13) >>> 0; }
    const mean = sum / m;
    return { w: bmp.width, h: bmp.height, top: [r / n, gg / n, b / n], sd: Math.sqrt(Math.max(0, sum2 / m - mean * mean)), hash };
  });
  return { status, stats };
}

try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('bimcraft.render'); } catch { /* none */ } });
  const file = { name: 'render-fixture.ifc', mimeType: 'application/x-step', buffer: Buffer.from(fixtureIfc({ georef: 'site' })) };
  await page.setInputFiles('[data-file]', file);
  await waitStatus(/^Opened /, 90000);
  ok(await page.isVisible('[data-toolbar] [data-render-open]'), 'Render is on the toolbar');
  ok(!(await page.evaluate(() => performance.getEntriesByType('resource').some((r) => /\/render\//.test(r.name)))), 'the renderer is not loaded before Render');
  await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer; v.camera.position.set(v.box.max.x + 14, v.box.max.y * 0.55, v.box.max.z + 18); v.controls.target.copy(v.box.getCenter(new v.box.min.constructor())); v.controls.update(); v.render(); });
  await page.click('[data-toolbar] [data-render-open]');
  await page.waitForSelector('[data-render-dialog][open]');
  ok(await page.evaluate(() => performance.getEntriesByType('resource').some((r) => /\/render\/render-core\.js/.test(r.name)) && performance.getEntriesByType('resource').some((r) => /render-bim\.js/.test(r.name))), 'Render loads render/ and render-bim.js');
  const note = await page.textContent('[data-render-sun-note]');
  ok(/site's latitude \(-33\.9°\)/.test(note), 'the sun line names the site\'s latitude', note);
  const looks = await page.$$eval('[data-render-look]', (s) => s.map((x) => x.dataset.renderLook + '=' + x.value));
  ok(looks.length >= 1 && looks.every((x) => /^(#[0-9a-f]{6}|default)=matte$/.test(x)), 'a material per colour on screen (the fixture has no styles: one white, matte)', looks.join(' '));
  await page.selectOption('[data-render-size]', 'view');
  await page.selectOption('[data-render-quality]', 'draft');
  await shot(page, '01-dialog');
  const r1 = await render();
  ok(/^Done: \d+ × \d+ pixels, 16 passes/.test(r1.status), 'draft render done', r1.status);
  ok(r1.stats && r1.stats.sd > 15, 'not a flat picture', r1.stats && 'sd ' + r1.stats.sd.toFixed(1));
  ok(r1.stats && r1.stats.top[2] > r1.stats.top[0] + 10, 'sky above', r1.stats && r1.stats.top.map(Math.round).join(','));
  await shot(page, '02-rendered');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-render-save]')]);
  const out = path.join(SHOTS, 'fixture-draft.png');
  await dl.saveAs(out);
  ok(dl.suggestedFilename() === 'render-fixture render.png' && fs.readFileSync(out).subarray(1, 4).toString() === 'PNG', 'Save PNG downloads "<file> render.png"', dl.suggestedFilename());
  const r1b = await render();
  ok(r1b.stats.hash === r1.stats.hash, 'the same model renders the same picture');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('[data-render-dialog]'));

  // a hidden storey leaves the picture
  await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer; const L = [...v.layers.values()][0]; const g = [...L.storeyGroups.values()][1]; g.visible = false; v.render(); });
  await page.click('[data-toolbar] [data-render-open]');
  await page.waitForSelector('[data-render-dialog][open]');
  const r2 = await render();
  ok(r2.stats.hash !== r1.stats.hash, 'a hidden storey: a different picture');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('[data-render-dialog]'));
  await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer; for (const L of v.layers.values()) for (const g of L.storeyGroups.values()) g.visible = true; v.render(); });

  // the section plane clips the picture
  await page.click('[data-toolbar] [data-toggle="section"]');
  await page.waitForSelector('[data-sectionbar]:not([hidden])');
  await page.click('[data-toolbar] [data-render-open]');
  await page.waitForSelector('[data-render-dialog][open]');
  const r3 = await render();
  ok(r3.stats.hash !== r1.stats.hash && /^Done/.test(r3.status), 'with a section: the cut shows in the picture');
  await shot(page, '03-section');
  await page.keyboard.press('Escape');
  await page.click('[data-toolbar] [data-toggle="section"]');

  // every menu style reaches Render (input-bimcraft.js)
  const reach = await page.evaluate(async () => {
    const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
    const url = Object.entries(map).find(([k]) => /\/bimcraft\/dev\/input-bimcraft\.js/.test(k))?.[1];
    const I = await import(url);
    const flat = (x) => JSON.stringify(x);
    return Object.values(I.STYLES || {}).map((s) => s.id + ':' + (s.layout === 'toolbar' || flat(s).includes('"view.render"')));
  });
  ok(reach.length >= 4 && reach.every((x) => x.endsWith(':true')), 'every menu style reaches Render', reach.join(' '));

  // Paint materials (RC.7): the palette, a selection painted, one side painted by clicking it, undo, the picture, the saved IFC
  {
    const keyOf = (name) => page.evaluate((n) => window.bimcraftKeys(n)?.[0] ?? window.bimcraftKeys(n), name);
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
    const paintOf = () => page.evaluate(async () => {
      const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
      const url = Object.entries(map).find(([k]) => /\/bimcraft\/dev\/paint-bim\.js/.test(k))?.[1];
      const PB = await import(url), v = document.querySelector('[data-canvas]').viewer, L = [...v.layers.values()][0];
      const out = {}; for (const [id, p] of PB.readPaint(L.model.api || window.bimcraftIfc?.api, L.model.modelID)) out[id] = p; return out;
    }).catch(() => null);
    await page.click('[data-toolbar] [data-paint-open]');
    await page.waitForSelector('[data-paint-panel]');
    ok(await page.$$eval('[data-paint-panel] .bc-paint-sw', (b) => b.length) >= 35, 'Paint opens the material palette');
    ok(await page.$eval('[data-toolbar] [data-paint-open]', (b) => b.getAttribute('aria-pressed')) === 'true', 'the Paint button shows pressed');
    const walls = [];
    for (const n of ['W-101', 'W-102', 'W-103', 'W-104']) walls.push(await keyOf(n));
    ok(walls.every((k) => Number.isFinite(k)), 'the fixture\'s Level 1 walls found', walls.join(','));
    await page.evaluate((ks) => document.querySelector('[data-canvas]').viewer.select(ks), walls);
    await page.click('[data-paint-panel] [data-paint-mat="brick-red"]');
    await waitStatus(/^Painted 4 elements: Red brick\./, 60000);
    ok(true, 'a material with four walls selected paints them all (one step)');
    const colOf = (k) => page.evaluate((key) => { const v = document.querySelector('[data-canvas]').viewer; const m = v.meshes.find((x) => [...x.userData.batch.elems.ids].includes(key)); return m ? '#' + m.userData.color.getHexString() : null; }, k);
    ok(await colOf(walls[0]) === '#94503c', 'reloaded: the walls show the brick colour', await colOf(walls[0]));
    await page.evaluate(() => document.querySelector('[data-canvas]').viewer.select(null));
    await page.click('[data-paint-panel] [data-paint-mat="siding-white"]');
    await page.check('[data-paint-panel] [data-paint-how="side"]');
    const spot = await spotOf(walls[0]);
    ok(!!spot, 'a spot on W-101 in the view');
    if (spot) {
      await page.mouse.click(spot.x, spot.y);
      await waitStatus(/^Painted one side of W-101: White lap siding\./, 60000);
      ok(true, 'a click with "Only the side clicked" paints one side');
    }
    await shot(page, '05-painted');
    await page.keyboard.press('Escape');
    ok(!(await page.$('[data-paint-panel]')), 'Esc closes the palette');
    await page.click('[data-toolbar] [data-render-open]');
    await page.waitForSelector('[data-render-dialog][open]');
    const rp = await render();
    ok(/^Done/.test(rp.status) && rp.stats.hash !== r1.stats.hash, 'the picture shows the painted walls', rp.status);
    await shot(page, '06-painted-render');
    const [dlp] = await Promise.all([page.waitForEvent('download'), page.click('[data-render-save]')]);
    await dlp.saveAs(path.join(SHOTS, 'fixture-painted.png'));
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('[data-render-dialog]'));
    // undo (before saving: Save commits the changes) takes the side paint off; the walls stay brick
    await page.keyboard.press('Control+z');
    await page.waitForFunction(() => /^Undid|^Undo/.test(document.querySelector('[data-status]').textContent) || !/side/.test(document.querySelector('[data-status]').textContent), null, { timeout: 30000 }).catch(() => {});
    await page.waitForFunction(() => !document.querySelector('[data-save]').disabled, null, { timeout: 30000 });
    const [sv2] = await Promise.all([page.waitForEvent('download'), page.click('[data-save]')]);
    const t2 = fs.readFileSync(await sv2.path(), 'utf8');
    ok(!/'siding-white'/.test(t2) && /'brick-red'/.test(t2), 'Ctrl+Z takes the side paint off; the brick stays (saved file)');
    // paint the side again and save: the file carries the side and the texture's name
    await page.click('[data-toolbar] [data-paint-open]');
    await page.waitForSelector('[data-paint-panel]');
    await page.click('[data-paint-panel] [data-paint-mat="siding-white"]');
    await page.check('[data-paint-panel] [data-paint-how="side"]');
    const spot2 = await spotOf(walls[0]);
    await page.mouse.click(spot2.x, spot2.y);
    await waitStatus(/^Painted one side of W-101/, 60000);
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('[data-save]').disabled, null, { timeout: 30000 });
    const [sv] = await Promise.all([page.waitForEvent('download'), page.click('[data-save]')]);
    const ifcText = fs.readFileSync(await sv.path(), 'utf8');
    ok(/'CadCraft_Render'/.test(ifcText) && /'Material Y[+-]'/.test(ifcText) && /'siding-white'/.test(ifcText) && /IFCIMAGETEXTURE\(.*'cadcraft-material:brick-red'/.test(ifcText), 'Save as IFC: CadCraft_Render, the side, the texture\'s name');
    void paintOf;
  }

  // Views and walkthroughs (RC.7): save two views, go back to one, play them, record a walk and play it, saved in the IFC
  {
    const camNow = () => page.evaluate(() => document.querySelector('[data-canvas]').viewer.camera.position.toArray());
    await page.click('[data-toolbar] [data-saved-views]');
    await page.waitForSelector('[data-views-panel]');
    ok(await page.$eval('[data-view-name]', (i) => i.value) === 'View 1', 'Views opens with a name ready');
    const c1 = await camNow();
    await page.click('[data-view-save]');
    await waitStatus(/^Saved the view View 1\./);
    await page.evaluate(() => document.querySelector('[data-canvas]').viewer.view('top'));
    await page.fill('[data-view-name]', 'Plan from above');
    await page.press('[data-view-name]', 'Enter');
    await waitStatus(/^Saved the view Plan from above\./);
    ok(await page.$$eval('[data-view-row]', (r) => r.length) === 2, 'two views listed');
    await page.click('[data-view-go="0"]');
    await page.waitForTimeout(1300);
    const c2 = await camNow();
    ok(c2.every((x, i) => Math.abs(x - c1[i]) < 0.02), 'going to View 1 puts the camera back', c2.map((x) => x.toFixed(2)).join(','));
    await page.click('[data-view-tour]');
    await waitStatus(/^(Playing the views|Played the views)/);
    await waitStatus(/^Played the views\./, 30000);
    ok(true, 'Play the views runs through both and stops');
    // a walkthrough: Walk on, start inside the building, record, walk forward, stop
    await page.click('[data-toolbar] [data-toggle="walk"]');
    await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer, c = v.box.getCenter(v.camera.position.clone()); v.walkPick([c.x, v.box.min.y + 0.05, c.z]); });
    await page.waitForFunction(() => !!document.querySelector('[data-canvas]').viewer.walk, null, { timeout: 10000 });
    await page.click('[data-walk-record]');
    await waitStatus(/^Recording the walk/);
    await page.focus('[data-canvas]').catch(() => {});
    await page.keyboard.down('w'); await page.waitForTimeout(1500); await page.keyboard.up('w');
    await page.click('[data-walk-record]');
    await waitStatus(/^Saved Walk 1 \(\d+ s\)\./);
    ok(true, 'a recorded walk is saved');
    await page.click('[data-toolbar] [data-toggle="walk"]');
    await page.click('[data-walk-play="0"]');
    await waitStatus(/^(Playing Walk 1|Played the walk)/);
    await waitStatus(/^Played the walk\./, 30000);
    ok(true, 'the walk plays back');
    await shot(page, '07-views');
    await page.click('[data-views-close]');
    await page.waitForFunction(() => !document.querySelector('[data-save]').disabled, null, { timeout: 30000 });
    const [sv3] = await Promise.all([page.waitForEvent('download'), page.click('[data-save]')]);
    const t3 = fs.readFileSync(await sv3.path(), 'utf8');
    ok(/'CadCraft_Views'/.test(t3) && /'View: View 1'/.test(t3) && /'View: Plan from above'/.test(t3) && /'Walk: Walk 1'/.test(t3), 'Save as IFC keeps the views and the walk');
  }

  // Entourage (RC.11 (e)): a CC0 tree from LibraryCraft placed like furniture keeps its trunk and leaf colours
  {
    await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer; v.view('iso'); });
    await page.click('[data-rtab="library"]');
    await page.click('.bc-lib-src:has-text("LibraryCraft")');
    await page.waitForSelector('.bc-lib-card', { timeout: 15000 });
    await page.fill('.bc-lib-search', 'Deciduous tree, 6 m');
    await page.press('.bc-lib-search', 'Enter');
    await page.waitForSelector('.bc-lib-card:has-text("Deciduous tree, 6 m")', { timeout: 15000 });
    await page.click('.bc-lib-card:has-text("Deciduous tree, 6 m")');
    await page.waitForSelector('[data-lib-place]', { timeout: 15000 });
    await page.click('[data-lib-place]');
    await page.waitForSelector('[data-placebar]:not([hidden])');
    await page.fill('[data-place-xy]', '-4000, -3000');
    await page.press('[data-place-xy]', 'Enter');
    const askN = await page.waitForSelector('dialog.bc-dialog [data-ask-number]', { timeout: 15000 }).catch(() => null);
    if (askN) await page.keyboard.press('Enter');
    await waitStatus(/^Placed Deciduous tree, 6 m/, 60000);
    ok(true, 'a CC0 tree from LibraryCraft placed like furniture');
    await page.waitForTimeout(800);
    const cols = await page.evaluate(() => {
      const v = document.querySelector('[data-canvas]').viewer, key = window.bimcraftKeys('Deciduous tree, 6 m');
      return v.meshes.filter((m) => [...m.userData.batch.elems.ids].includes(key)).map((m) => '#' + m.userData.color.getHexString()).sort();
    });
    ok(cols.length === 2 && cols.includes('#6b4a2f') && cols.includes('#4f7a3a'), 'in the view: trunk brown, leaves green', cols.join(' '));
    await page.click('[data-toolbar] [data-render-open]');
    await page.waitForSelector('[data-render-dialog][open]');
    await page.selectOption('[data-render-mode]', 'fast');
    const rt = await render();
    ok(/^Done/.test(rt.status), 'the picture renders with the tree', rt.status);
    await shot(page, '09-entourage');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('[data-render-dialog]'));
    // save, so opening the next file has nothing unsaved to ask about
    const [svT] = await Promise.all([page.waitForEvent('download'), page.click('[data-save]')]);
    ok(/'CC-RENDER-PARTS'/.test(fs.readFileSync(await svT.path(), 'utf8')), 'the saved IFC keeps the tree\'s parts (CadCraft_SourceAttributes)');
  }

  // High quality (RC.11 (c)) on BimCraft's Y-up scene: the sky must come out above, the picture not flat
  {
    // the walkthrough above may have ended inside a wall: back to the model's iso view
    await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer; v.view('iso'); });
    await page.click('[data-toolbar] [data-render-open]');
    await page.waitForSelector('[data-render-dialog][open]');
    await page.selectOption('[data-render-mode]', 'hq');
    await page.selectOption('[data-render-minutes]', '0');
    await page.selectOption('[data-render-size]', 'view');
    await page.selectOption('[data-render-quality]', 'draft');
    await page.setViewportSize({ width: 1000, height: 700 });
    const hq = await render({ timeout: 900000 });
    console.log('  info high quality: ' + hq.status + (hq.stats ? ' top ' + hq.stats.top.map(Math.round).join(',') + ' sd ' + hq.stats.sd.toFixed(1) : ''));
    ok(/^Done: \d+ × \d+ pixels, 16 samples/.test(hq.status) && hq.stats.sd > 10 && hq.stats.top[2] > hq.stats.top[0], 'High quality: sky above (Y up), not flat', hq.status);
    await shot(page, '08-high-quality');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('[data-render-dialog]'));
    await page.setViewportSize({ width: 1440, height: 900 });
  }

  if (fs.existsSync(SAMPLE)) {
    await page.setInputFiles('[data-file]', SAMPLE);
    await waitStatus(/^Opened /, 120000);
    await page.click('[data-toolbar] [data-render-open]');
    await page.waitForSelector('[data-render-dialog][open]');
    const glass = await page.$$eval('[data-render-look]', (s) => s.filter((x) => x.value === 'glass').length);
    ok(glass >= 1, 'AC20-FZK-Haus: its see-through window colour starts as Glass', glass + ' colour(s)');
    await page.selectOption('[data-render-size]', 'view');
    await page.selectOption('[data-render-quality]', 'draft');
    const r4 = await render();
    ok(/^Done/.test(r4.status) && r4.stats.sd > 15, 'AC20-FZK-Haus renders', r4.status);
    await shot(page, '04-fzk-haus');
    const saved = await page.evaluate(() => localStorage.getItem('bimcraft.render'));
    ok(saved && JSON.parse(saved).quality === 'draft', 'the settings are kept in this browser (bimcraft.render)');
    await page.keyboard.press('Escape');
  } else console.log('  skip AC20-FZK-Haus: ' + SAMPLE + ' not here');
  ok(!problems.length, 'no console errors', problems.join(' | '));
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

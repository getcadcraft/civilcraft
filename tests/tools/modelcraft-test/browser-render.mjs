#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-render.mjs — Render a picture (0.5 RC.11 (a), session `render`) in headless Chromium on /lab/modelcraft: Export ›
 * Render a picture… opens the dialog; a small house (with a window set to Glass) renders at draft quality; the picture is
 * checked by its pixels (sky above, ground below, not flat, the same picture twice and in both page themes, brighter with
 * more exposure, a white studio sky); Stop keeps a picture and Save PNG downloads it; Esc stops; the sun down at night says so;
 * the settings and looks travel in the .modelcraft file and come back on open; no console errors. Shots in tmp/shots/render.
 *
 *   node tools/modelcraft-test/browser-render.mjs [--out <dir>] [--keep-admin]
 * Run as root (ModelCraft's test admin via tools/modelcraft-test/admin.php). Headless Chromium draws with SwiftShader (the
 * CPU), so times are far slower than on a graphics card.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/render')));
const STATE = path.join(REPO, 'tmp/render-browser-state.json');
const KEEP_ADMIN = process.argv.includes('--keep-admin');
fs.mkdirSync(OUT, { recursive: true });

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/modelcraft-test/admin.php');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

let pass = 0, fail = 0;
const ok = (c, what, detail = '') => { if (c) { pass++; console.log('  ok    ' + what + (detail ? ' (' + detail + ')' : '')); } else { fail++; console.log('  FAIL  ' + what + (detail ? ' — ' + detail : '')); } };

async function signedInContext(opts) {
  if (fs.existsSync(STATE)) {
    const c = await browser.newContext({ ...opts, storageState: STATE, acceptDownloads: true });
    const p = await c.newPage();
    const r = await p.goto(BASE + '/lab/modelcraft', { waitUntil: 'domcontentloaded' });
    const okLab = r && r.status() === 200 && p.url().includes('/lab/modelcraft');
    await p.close();
    if (okLab) return c;
    await c.close();
  }
  const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
  const c = await browser.newContext({ ...opts, acceptDownloads: true });
  const p = await c.newPage();
  await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', admin.email);
  await p.fill('input[name="password"]', admin.password);
  await Promise.all([p.waitForNavigation(), p.click('form button[type="submit"]')]);
  await c.storageState({ path: STATE });
  fs.chmodSync(STATE, 0o600);
  await p.close();
  return c;
}

const house = (page) => page.evaluate(async () => {
  const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
  const url = Object.entries(map).find(([k]) => /\/modelcraft\/dev\/model\.js/.test(k))?.[1];
  const M = await import(url);
  const mc = window.modelcraft, m = mc.model;
  m.change('house', (mm) => {
    const solid = (pts, h, color, name) => {
      M.addPolygon(mm.root, pts);
      const f = [...mm.root.faces.keys()].pop();
      M.pushPull(mm.root, f, h);
      const id = mm.makeGroup(mm.root, M.connected(mm.root, [{ t: 'f', id: f }]), 'group', name);
      const d = mm.defs.get(mm.root.insts.get(id).def);
      if (color) for (const fc of d.faces.values()) fc.color = color;
      return d;
    };
    solid(M.rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 12, 9), 0.25, '#a3a19b', 'Slab');
    solid(M.rectPts([1.5, 1.5, 0.25], [1, 0, 0], [0, 1, 0], 8, 6), 3, null, 'Walls');
    solid([[1.2, 1.2, 3.25], [1.2, 7.8, 3.25], [1.2, 4.5, 5.4]], 8.6, '#9b3f2c', 'Roof');
    solid(M.rectPts([3, 1.45, 0.6], [1, 0, 0], [0, 0, 1], 1.4, 1.6), 0.08, '#4f7fae', 'Window');
    solid(M.rectPts([6.2, 1.45, 0.25], [1, 0, 0], [0, 0, 1], 1.1, 2.2), 0.08, '#5a3d2b', 'Door');
    solid(M.ngonPts([10.8, 2, 0.25], [0, 0, 1], [1, 0, 0], 0.18, 24), 1.6, '#6b4a2f', 'Trunk');
    solid(M.ngonPts([10.8, 2, 1.85], [0, 0, 1], [1, 0, 0], 0.9, 24), 1.8, '#3f7a45', 'Crown');
  });
  mc.cam.fit(m.bbox(), [-0.62, -1, 0.2]);
  mc.view.invalidate();
});

async function openDialog(page) {
  await page.evaluate(() => { document.querySelector('[data-export-menu]').open = true; });
  await page.click('[data-export="render"]');
  await page.waitForSelector('[data-render-dialog][open]');
}
/** Render with the dialog as it is; → {status, stats} once the picture is in. */
async function render(page, { timeout = 600000 } = {}) {
  await page.click('[data-render-go]');
  await page.waitForFunction(() => /^(Done|Stopped|Could not|The high-quality)/.test(document.querySelector('[data-render-status]')?.textContent || ''), null, { timeout });
  const status = await page.textContent('[data-render-status]');
  const stats = await page.evaluate(async () => {
    const img = document.querySelector('[data-render-image]');
    if (!img) return null;
    const bmp = await createImageBitmap(await (await fetch(img.src)).blob());
    const c = new OffscreenCanvas(bmp.width, bmp.height), g = c.getContext('2d');
    g.drawImage(bmp, 0, 0);
    const d = g.getImageData(0, 0, bmp.width, bmp.height).data;
    const band = (y0, y1) => { let r = 0, gg = 0, b = 0, n = 0; for (let y = Math.floor(y0 * bmp.height); y < Math.floor(y1 * bmp.height); y++) for (let x = 0; x < bmp.width; x += 3) { const i = (y * bmp.width + x) * 4; r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; } return [r / n, gg / n, b / n]; };
    let sum = 0, sum2 = 0, n = 0, hash = 0;
    for (let i = 0; i < d.length; i += 4) { const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; sum += l; sum2 += l * l; n++; hash = (hash * 31 + d[i] + d[i + 1] * 7 + d[i + 2] * 13) >>> 0; }
    const mean = sum / n;
    return { w: bmp.width, h: bmp.height, top: band(0, 0.06), bottom: band(0.94, 1), mean, sd: Math.sqrt(Math.max(0, sum2 / n - mean * mean)), hash };
  });
  return { status, stats };
}
const setSelect = (page, sel, value) => page.selectOption(sel, value);

const report = [];
try {
  const ctx = await signedInContext({ viewport: { width: 1200, height: 800 }, locale: 'en-US' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
  ok(await page.evaluate(() => !document.querySelector('[data-export="render"]').hidden), 'Export › Render a picture… is a normal menu item (no ?spike= flag)');
  const before = await page.evaluate(() => performance.getEntriesByType('resource').some((r) => /\/render\/render-(core|ui)\.js/.test(r.name)));
  ok(!before, 'the renderer is not loaded before it is used');
  await house(page);
  await page.waitForTimeout(300);
  const view = await page.evaluate(() => ({ w: window.modelcraft.ui?.gl?.clientWidth ?? document.querySelector('[data-gl], canvas').clientWidth, h: window.modelcraft.ui?.gl?.clientHeight ?? 0 }));
  await openDialog(page);
  ok(await page.evaluate(() => performance.getEntriesByType('resource').some((r) => /\/render\/render-core\.js/.test(r.name))), 'opening the dialog loads render/');
  const opts = await page.$$eval('[data-render-size] option', (os) => os.map((o) => o.value + '=' + o.textContent));
  ok(opts.length === 5 && opts[0].startsWith('view='), 'five sizes, the view\'s own first', opts.join(' | '));
  const looks = await page.$$eval('[data-render-look]', (s) => s.map((x) => x.dataset.renderLook));
  ok(looks.includes('#4f7fae') && looks.includes('default') && looks.includes('#9b3f2c'), 'a material per colour on screen, unpainted faces too', looks.join(' '));
  await page.screenshot({ path: path.join(OUT, '01-dialog-paper.png') });
  await setSelect(page, '[data-render-size]', 'view');
  await setSelect(page, '[data-render-quality]', 'draft');
  await setSelect(page, '[data-render-look="#4f7fae"]', 'glass');
  let t0 = Date.now();
  const r1 = await render(page);
  report.push({ what: 'draft clear', ms: Date.now() - t0, status: r1.status });
  ok(/^Done: \d+ × \d+ pixels, 16 passes/.test(r1.status), 'draft render done', r1.status);
  ok(r1.stats && r1.stats.w > 300 && r1.stats.h > 200, 'the picture is the view\'s size', r1.stats && r1.stats.w + '×' + r1.stats.h);
  ok(r1.stats.top[2] > r1.stats.top[0] + 15, 'sky above (blue over red)', r1.stats.top.map(Math.round).join(','));
  ok(Math.abs(r1.stats.bottom[0] - r1.stats.bottom[2]) < 60 && r1.stats.bottom[0] > 80, 'ground below (warm grey)', r1.stats.bottom.map(Math.round).join(','));
  ok(r1.stats.sd > 20, 'not a flat picture', 'sd ' + r1.stats.sd.toFixed(1));
  ok(await page.$eval('[data-render-save]', (b) => !b.disabled), 'Save PNG enabled with a picture');
  await page.screenshot({ path: path.join(OUT, '02-rendered-paper.png') });
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-render-save]')]);
  const pngPath = path.join(OUT, 'house-draft.png');
  await dl.saveAs(pngPath);
  const png = fs.readFileSync(pngPath);
  ok(dl.suggestedFilename().endsWith(' render.png') && png.subarray(1, 4).toString() === 'PNG', 'Save PNG downloads "<file> render.png"', dl.suggestedFilename() + ', ' + png.length + ' bytes');

  t0 = Date.now();
  const r2 = await render(page);
  report.push({ what: 'draft again', ms: Date.now() - t0 });
  ok(r2.stats.hash === r1.stats.hash, 'the same model renders the same picture');

  await page.fill('[data-render-exposure]', '2');
  await page.dispatchEvent('[data-render-exposure]', 'input');
  const rBright = await render(page);
  ok(rBright.stats.mean > r1.stats.mean + 8, 'brightness +2 stops: a brighter picture', r1.stats.mean.toFixed(1) + ' → ' + rBright.stats.mean.toFixed(1));
  await page.fill('[data-render-exposure]', '0');
  await page.dispatchEvent('[data-render-exposure]', 'input');

  await setSelect(page, '[data-render-sky]', 'white');
  const rWhite = await render(page);
  ok(rWhite.stats.top.every((c) => c > 225), 'white studio: a white background', rWhite.stats.top.map(Math.round).join(','));
  await page.screenshot({ path: path.join(OUT, '03-white-studio.png') });
  await setSelect(page, '[data-render-sky]', 'clear');

  // the sun down: own date and time at night
  await page.check('[data-render-sun-own]');
  await page.fill('[data-render-sun-time]', '02:00');
  await page.dispatchEvent('[data-render-sun-time]', 'change');
  const rNight = await render(page);
  ok(/It is night/.test(rNight.status), 'night: says so (the sky goes dark; lamps light the model)', rNight.status);
  ok(rNight.stats.hash !== r1.stats.hash, 'night: a different picture');
  await page.uncheck('[data-render-sun-own]');

  // Stop keeps a picture
  await setSelect(page, '[data-render-quality]', 'best');
  await page.click('[data-render-go]');
  await page.waitForFunction(() => /pass (\d+) of 256/.test(document.querySelector('[data-render-status]').textContent) && +/pass (\d+)/.exec(document.querySelector('[data-render-status]').textContent)[1] >= 8, null, { timeout: 300000 });
  ok(await page.$eval('[data-render-size]', (s) => s.disabled), 'settings locked while rendering');
  await page.click('[data-render-go]');   // now "Stop"
  await page.waitForFunction(() => /^Stopped/.test(document.querySelector('[data-render-status]').textContent), null, { timeout: 120000 });
  const stopTxt = await page.textContent('[data-render-status]');
  ok(/^Stopped after \d+ passes/.test(stopTxt) && await page.$('[data-render-image]'), 'Stop keeps the picture so far', stopTxt);
  // Esc while rendering stops too, and the dialog stays open
  await page.click('[data-render-go]');
  await page.waitForFunction(() => /pass (\d+) of 256/.test(document.querySelector('[data-render-status]').textContent) && +/pass (\d+)/.exec(document.querySelector('[data-render-status]').textContent)[1] >= 4, null, { timeout: 300000 });
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => /^Stopped/.test(document.querySelector('[data-render-status]').textContent), null, { timeout: 120000 });
  ok(await page.$('[data-render-dialog][open]'), 'Esc while rendering stops, the dialog stays');
  await setSelect(page, '[data-render-quality]', 'draft');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('[data-render-dialog]'));
  ok(true, 'Esc again closes the dialog');

  // the settings travel in the file
  const [sv] = await Promise.all([page.waitForEvent('download'), page.keyboard.press('Control+s')]);
  const mf = path.join(OUT, 'house.modelcraft');
  await sv.saveAs(mf);
  const j = JSON.parse(fs.readFileSync(mf, 'utf8'));
  ok(j.view && j.view.render && j.view.render.looks['#4f7fae'] === 'glass' && j.view.render.quality === 'draft' && j.view.render.size === 'view', 'the .modelcraft file keeps the render settings and looks', JSON.stringify(j.view?.render));

  // model theme: the same picture (unpainted faces do not follow the page theme)
  const p2 = await ctx.newPage();
  p2.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  p2.on('pageerror', (e) => errs.push(e.message));
  await p2.goto(BASE + '/lab/modelcraft?space=model', { waitUntil: 'networkidle' });
  await p2.setInputFiles('[data-file-open]', mf);
  await p2.waitForFunction(() => /^Opened/.test(document.querySelector('[data-msg]')?.textContent || ''), null, { timeout: 60000 });
  await openDialog(p2);
  ok(await p2.$eval('[data-render-look="#4f7fae"]', (s) => s.value) === 'glass' && await p2.$eval('[data-render-quality]', (s) => s.value) === 'draft', 'reopened: the dialog shows the saved settings');
  await p2.screenshot({ path: path.join(OUT, '04-dialog-model.png') });
  const r3 = await render(p2);
  ok(r3.stats.hash === r1.stats.hash, 'model theme: the same picture as on paper');
  await p2.setViewportSize({ width: 390, height: 800 });
  await p2.waitForTimeout(300);
  await p2.screenshot({ path: path.join(OUT, '05-dialog-390.png') });
  ok(await p2.evaluate(() => document.querySelector('[data-render-dialog]').scrollWidth <= window.innerWidth), 'fits a 390 px screen');
  // materials (RC.7 / RC.11 (b)): paint the walls and the roof from the library, the view shows the textures, the render too
  await p2.setViewportSize({ width: 1200, height: 800 });
  await p2.keyboard.press('Escape');
  await p2.waitForFunction(() => !document.querySelector('[data-render-dialog]'));
  await p2.waitForFunction(() => [...document.querySelectorAll('[data-matlib] .mc-swatch')].filter((b) => b.style.backgroundImage).length >= 20, null, { timeout: 30000 });
  ok(true, 'the library\'s swatches are drawn (on idle)');
  const nSw = await p2.$$eval('[data-matlib] .mc-swatch', (b) => b.length);
  ok(nSw >= 30, 'the Materials panel lists the library', String(nSw));
  const paintInst = async (name, mat) => {
    await p2.evaluate((nm) => { const mc = window.modelcraft, m = mc.model; const iid = [...m.root.insts].find(([, i]) => m.defs.get(i.def).name === nm)[0]; mc.host.path = []; mc.host.sel = [{ t: 'i', id: iid }]; }, name);
    await p2.click(`[data-matlib] [data-paint="mat:${mat}"]`);
    return p2.evaluate((nm) => { const m = window.modelcraft.model; return [...m.root.insts.values()].find((i) => m.defs.get(i.def).name === nm).color; }, name);
  };
  ok(await paintInst('Walls', 'brick-red') === 'mat:brick-red', 'a swatch paints the selected walls with Red brick');
  ok(await paintInst('Roof', 'shingles-gray') === 'mat:shingles-gray', 'and the roof group with Gray asphalt shingles');
  // the roof's faces have a colour of their own, which wins over the group's paint (as in SketchUp): paint the faces themselves
  await p2.evaluate(() => { const mc = window.modelcraft, m = mc.model; const iid = [...m.root.insts].find(([, i]) => m.defs.get(i.def).name === 'Roof')[0]; const d = m.defs.get(m.root.insts.get(iid).def); mc.host.path = [iid]; mc.host.sel = [...d.faces.keys()].map((id) => ({ t: 'f', id })); });
  await p2.click('[data-matlib] [data-paint="mat:shingles-gray"]');
  ok(await p2.evaluate(() => { const m = window.modelcraft.model; const d = [...m.defs.values()].find((x) => x.name === 'Roof'); return [...d.faces.values()].every((f) => f.color === 'mat:shingles-gray'); }), 'the roof\'s faces painted inside the group');
  await p2.evaluate(() => { window.modelcraft.host.path = []; });
  ok(/Red brick|Gray asphalt shingles/.test(await p2.textContent('[data-msg]')), 'the message names the material', await p2.textContent('[data-msg]'));
  await p2.evaluate(() => { const mc = window.modelcraft; mc.host.sel = []; mc.view.invalidate(); });
  await p2.waitForTimeout(400);
  const texInView = await p2.evaluate(() => { let n = 0; window.modelcraft.view.root.traverse((o) => { if (o.isMesh && o.material && o.material.map) n++; }); return n; });
  ok(texInView >= 2, 'the shaded view draws the textures', String(texInView));
  await p2.screenshot({ path: path.join(OUT, '06-materials-view.png') });
  await openDialog(p2);
  const lk = await p2.$$eval('[data-render-look]', (s) => s.map((x) => x.dataset.renderLook));
  ok(!lk.some((k) => k.startsWith('mat:')), 'the dialog\'s colour looks leave the materials out', lk.join(' '));
  const r4 = await render(p2);
  ok(/^Done/.test(r4.status) && r4.stats.hash !== r3.stats.hash, 'the render shows the materials (a different picture)', r4.status);
  await p2.screenshot({ path: path.join(OUT, '07-materials-render.png') });
  const [dl4] = await Promise.all([p2.waitForEvent('download'), p2.click('[data-render-save]')]);
  await dl4.saveAs(path.join(OUT, 'house-materials.png'));
  await p2.keyboard.press('Escape');
  // imported textures (RC.11 (b)): a textured SketchUp model shows its textures in the view and the picture, and keeps them in the file
  const SKP = '/var/www/CADCRAFT/testfiles/skp-corpus/openskp/capilla_quiroz_v17.skp';
  if (fs.existsSync(SKP)) {
    const p3 = await ctx.newPage();
    p3.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    p3.on('pageerror', (e) => errs.push(e.message));
    await p3.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
    await p3.setInputFiles('[data-file-import]', SKP);
    await p3.waitForFunction(() => /^Imported/.test(document.querySelector('[data-msg]')?.textContent || ''), null, { timeout: 120000 });
    await p3.evaluate(() => { const mc = window.modelcraft; mc.cam.fit(mc.model.bbox(), [-0.7, -1, 0.35]); mc.host.sel = []; mc.view.invalidate(); });
    await p3.waitForFunction(() => { let n = 0, loaded = 0; window.modelcraft.view.root.traverse((o) => { if (o.isMesh && o.material?.map && !o.material.map.isDataTexture) { n++; if (o.material.map.image) loaded++; } }); return n > 0 && loaded === n; }, null, { timeout: 30000 });
    ok(true, 'SketchUp import: the view draws its own textures once decoded');
    await p3.screenshot({ path: path.join(OUT, '08-skp-textures.png') });
    await openDialog(p3);
    const r5 = await render(p3);
    ok(/^Done/.test(r5.status) && r5.stats.sd > 15, 'SketchUp import: the picture renders with its textures', r5.status);
    await p3.screenshot({ path: path.join(OUT, '09-skp-render.png') });
    await p3.keyboard.press('Escape');
    await p3.waitForFunction(() => !document.querySelector('[data-render-dialog]'));
    const [sv5] = await Promise.all([p3.waitForEvent('download'), p3.click('[data-act="save"]')]);
    const f5 = path.join(OUT, 'capilla.modelcraft');
    await sv5.saveAs(f5);
    const j5 = JSON.parse(fs.readFileSync(f5, 'utf8'));
    ok(Array.isArray(j5.images) && j5.images.length >= 1 && j5.images.every((x) => /^image\//.test(x.mime)), 'the .modelcraft file carries the textures', (j5.images || []).length + ' images');
    await p3.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
    await p3.setInputFiles('[data-file-open]', f5);
    await p3.waitForFunction(() => /^Opened/.test(document.querySelector('[data-msg]')?.textContent || ''), null, { timeout: 60000 });
    await p3.waitForFunction(() => { let n = 0; window.modelcraft.view.root.traverse((o) => { if (o.isMesh && o.material?.map && !o.material.map.isDataTexture && o.material.map.image) n++; }); return n > 0; }, null, { timeout: 30000 });
    ok(true, 'reopened: the textures are back');
    await p3.close();
  } else console.log('  skip SketchUp textures: ' + SKP + ' not here');
  // lamps (RC.11 (d)): a closed room at night lit by a ceiling lamp placed by clicking the ceiling
  {
    const p4 = await ctx.newPage();
    p4.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    p4.on('pageerror', (e) => errs.push(e.message));
    await p4.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
    await p4.evaluate(async () => {
      const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
      const M = await import(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/model\.js/.test(k))[1]);
      const mc = window.modelcraft, m = mc.model;
      m.change('room', (mm) => { M.addPolygon(mm.root, M.rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 4, 4)); const f = [...mm.root.faces.keys()].pop(); M.pushPull(mm.root, f, 2.7); });
      mc.cam.eye = [0.6, 0.5, 1.5]; mc.cam.target = [3.4, 3.2, 1.3]; mc.cam.fov = 60;
      mc.view.style.sun = { ...mc.view.style.sun, hour: 23 };
      mc.view.invalidate();
    });
    await p4.waitForTimeout(300);
    await p4.click('[data-light-add="point"]');
    const at = await p4.evaluate(() => { const mc = window.modelcraft, s = mc.cam.project([2.6, 2.4, 2.7]), r = mc.ui.over.getBoundingClientRect(); return s ? { x: r.left + s[0], y: r.top + s[1] } : null; });
    await p4.mouse.move(at.x, at.y); await p4.waitForTimeout(100); await p4.mouse.click(at.x, at.y);
    const L1 = await p4.evaluate(() => [...window.modelcraft.model.lights.values()][0] || null);
    ok(L1 && L1.kind === 'point' && Math.abs(L1.p[2] - 2.45) < 0.02, 'Lamp, then a click on the ceiling: a lamp 0.25 m below it', L1 && L1.p.map((x) => x.toFixed(2)).join(','));
    ok(await p4.isVisible('[data-light-edit]') && /Added Lamp 1/.test(await p4.textContent('[data-msg]')), 'the new lamp is selected in Lights');
    await p4.fill('[data-light-lumens]', '1600');
    await p4.dispatchEvent('[data-light-lumens]', 'change');
    ok(await p4.evaluate(() => [...window.modelcraft.model.lights.values()][0].lumens) === 1600, 'brightness changed (one undo step)');
    await openDialog(p4);
    await p4.selectOption('[data-render-size]', 'view');
    await p4.selectOption('[data-render-quality]', 'draft');
    const lit = await render(p4);
    console.log('  info night room, 1600 lm: mean ' + lit.stats.mean.toFixed(1) + ', sd ' + lit.stats.sd.toFixed(1) + ', ' + lit.status);
    ok(/^Done/.test(lit.status) && /night/.test(lit.status) && lit.stats.mean > 45 && lit.stats.mean < 200, 'night, one 1600 lm lamp: the room is lit, neither black nor burnt out', 'mean ' + lit.stats.mean.toFixed(1));
    await p4.screenshot({ path: path.join(OUT, '10-lamp-room.png') });
    await p4.keyboard.press('Escape');
    await p4.waitForFunction(() => !document.querySelector('[data-render-dialog]'));
    await p4.uncheck('[data-lights] input[type=checkbox]');
    await openDialog(p4);
    const dark = await render(p4);
    ok(dark.stats.mean < lit.stats.mean / 3, 'the lamp off: dark', 'mean ' + dark.stats.mean.toFixed(1));
    await p4.keyboard.press('Escape');
    await p4.waitForFunction(() => !document.querySelector('[data-render-dialog]'));
    await p4.check('[data-lights] input[type=checkbox]');
    // a spotlight (two clicks) and a panel
    await p4.click('[data-light-add="spot"]');
    const a1 = await p4.evaluate(() => { const mc = window.modelcraft, s = mc.cam.project([1.5, 3.2, 2.7]), r = mc.ui.over.getBoundingClientRect(); return { x: r.left + s[0], y: r.top + s[1] }; });
    const a2 = await p4.evaluate(() => { const mc = window.modelcraft, s = mc.cam.project([1.5, 4, 1.0]), r = mc.ui.over.getBoundingClientRect(); return { x: r.left + s[0], y: r.top + s[1] }; });
    await p4.mouse.click(a1.x, a1.y); await p4.mouse.click(a2.x, a2.y);
    const sp = await p4.evaluate(() => [...window.modelcraft.model.lights.values()].find((x) => x.kind === 'spot') || null);
    ok(sp && sp.dir[1] > 0.3 && sp.dir[2] < -0.5, 'Spotlight: a click on the ceiling, a click on the wall it lights', sp && sp.dir.map((x) => x.toFixed(2)).join(','));
    // a click on a lamp's mark selects it
    const mk = await p4.evaluate(() => { const mc = window.modelcraft, L = [...mc.model.lights.values()][0], s = mc.cam.project(L.p), r = mc.ui.over.getBoundingClientRect(); return { x: r.left + s[0], y: r.top + s[1] }; });
    await p4.mouse.click(mk.x, mk.y);
    ok(/^Lamp 1: change it under Lights/.test(await p4.textContent('[data-msg]')), 'a click on a lamp\'s mark selects it');
    const [sv6] = await Promise.all([p4.waitForEvent('download'), p4.click('[data-act="save"]')]);
    const f6 = path.join(OUT, 'room.modelcraft');
    await sv6.saveAs(f6);
    const j6 = JSON.parse(fs.readFileSync(f6, 'utf8'));
    ok(Array.isArray(j6.lights) && j6.lights.length === 2 && j6.lights.some((x) => x.kind === 'spot' && x.angle === 60), 'the file keeps the lamps');
    await p4.close();
  }
  // Entourage (RC.11 (e)): the starter library's trees, people and cars beside the house, rendered
  {
    const p6 = await ctx.newPage();
    p6.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    p6.on('pageerror', (e) => errs.push(e.message));
    await p6.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
    await house(p6);
    const placed = await p6.evaluate(async () => {
      const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
      const S = await import(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/starter\.js/.test(k))[1]);
      const mc = window.modelcraft, m = mc.model, out = [];
      const put = (id, x, y, turn = 0) => m.change('place', (mm) => {
        let d = [...mm.defs.values()].find((q) => q.starter === id);
        if (!d) { d = S.buildStarter(mm, id, id); d.starter = id; }
        const c = Math.cos(turn), s2 = Math.sin(turn);
        mm.place(mm.root, d.id, [c, s2, 0, 0, -s2, c, 0, 0, 0, 0, 1, 0, x, y, 0, 1]);
        out.push(id);
      });
      put('ent-tree-deciduous-6m', -3, 6); put('ent-tree-conifer-8m', 14, 8); put('ent-shrub-round-1200', 9.5, 0.4); put('ent-hedge-2000', 2.5, -2.2);
      put('ent-person-standing', 5.2, -1.4); put('ent-person-walking', 6.6, -2.4, 0.6); put('ent-car-sedan', 12.5, -3.5, Math.PI / 2);
      mc.cam.fit(m.bbox(), [-0.62, -1, 0.22]);
      mc.view.invalidate();
      return out;
    });
    ok(placed.length === 7, 'seven entourage things placed from the starter library');
    await openDialog(p6);
    await p6.selectOption('[data-render-mode]', 'fast');
    await p6.selectOption('[data-render-size]', 'view2');
    await p6.selectOption('[data-render-quality]', 'good');
    const re = await render(p6);
    ok(/^Done/.test(re.status), 'the entourage renders', re.status);
    const [dle] = await Promise.all([p6.waitForEvent('download'), p6.click('[data-render-save]')]);
    await dle.saveAs(path.join(OUT, 'house-entourage.png'));
    await p6.close();
  }
  // High quality (RC.11 (c)): the house path traced — glass, the materials, light bouncing; a time limit; the library loads only now
  {
    const p5 = await ctx.newPage();
    p5.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    p5.on('pageerror', (e) => errs.push(e.message));
    await p5.setViewportSize({ width: 900, height: 640 });
    await p5.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
    await house(p5);
    await p5.evaluate(() => { const mc = window.modelcraft, m = mc.model; for (const [iid, i] of m.root.insts) if (m.defs.get(i.def).name === 'Walls') i.color = 'mat:brick-red'; m.version++; mc.view.invalidate(); });
    await openDialog(p5);
    ok(!(await p5.evaluate(() => performance.getEntriesByType('resource').some((r) => /three-gpu-pathtracer/.test(r.name)))), 'the path tracer is not loaded for the fast mode');
    await p5.selectOption('[data-render-mode]', 'hq');
    ok(await p5.isVisible('[data-render-minutes]') && !(await p5.isVisible('[data-render-edges]')), 'High quality shows a time limit (and no edges)');
    await p5.selectOption('[data-render-minutes]', '0');   // no limit: on the CPU (SwiftShader) compiling the tracer alone takes about a minute
    await p5.selectOption('[data-render-size]', 'view');
    await p5.selectOption('[data-render-quality]', 'draft');
    await p5.selectOption('[data-render-look="#4f7fae"]', 'glass');
    const hq = await render(p5, { timeout: 900000 });
    console.log('  info high quality: ' + hq.status + (hq.stats ? ' mean ' + hq.stats.mean.toFixed(1) + ' sd ' + hq.stats.sd.toFixed(1) : ''));
    ok(/^(Done: \d+ × \d+ pixels, \d+ samples|Stopped at the time limit after [1-9]\d* samples)/.test(hq.status), 'High quality renders samples', hq.status);
    ok(hq.stats && hq.stats.sd > 12 && hq.stats.top[2] > hq.stats.top[0], 'a picture with sky above', hq.stats && hq.stats.top.map(Math.round).join(','));
    ok(await p5.evaluate(() => performance.getEntriesByType('resource').some((r) => /three-gpu-pathtracer\/[0-9.]+\/index\.module\.js/.test(r.name)) && performance.getEntriesByType('resource').some((r) => /three-mesh-bvh\/[0-9.]+\/index\.module\.js/.test(r.name))), 'the path tracer and three-mesh-bvh load from their pinned vendor folders');
    await p5.screenshot({ path: path.join(OUT, '11-high-quality.png') });
    const [dlh] = await Promise.all([p5.waitForEvent('download'), p5.click('[data-render-save]')]);
    await dlh.saveAs(path.join(OUT, 'house-hq.png'));
    await p5.close();
  }
  // High quality on WebGPU (0.7 RN.1): the WGSL wavefront tracer. A second browser with SwiftShader WebGPU; the app's own adapter
  // scene through pathTraceStill at 128 × 96 (KICKOFF rule 14), then the dialog: the engine line, Stop, Resume.
  if (!process.argv.includes('--no-webgpu')) {
    const gb = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-unsafe-swiftshader'] });
    try {
      const gctx = await gb.newContext({ viewport: { width: 760, height: 520 }, locale: 'en-US', storageState: STATE, acceptDownloads: true });
      const p7 = await gctx.newPage();
      const gerrs = [];
      p7.on('console', (m) => { if (m.type() === 'error') gerrs.push(m.text()); });
      p7.on('pageerror', (e) => gerrs.push(e.message));
      await p7.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
      await house(p7);
      await p7.evaluate(() => { const mc = window.modelcraft, m = mc.model; for (const [, i] of m.root.insts) if (m.defs.get(i.def).name === 'Walls') i.color = 'mat:brick-red'; m.version++; mc.view.invalidate(); });
      // the showcase file (KICKOFF rule 11): this house, made once, opened for screenshots and the video instead of rebuilt
      const SHOW = path.join(REPO, 'fixtures/showcase/modelcraft-house.modelcraft');
      if (!fs.existsSync(SHOW)) {
        const text = await p7.evaluate(() => { const mc = window.modelcraft, j = mc.model.toJSON(); j.view = { cam: mc.cam.toJSON(), style: mc.view.style, render: { mode: 'hq', minutes: 5, size: 'view', quality: 'good', sky: 'clear', exposure: 0, edges: false, ground: true, sun: null, looks: { '#4f7fae': 'glass' } } }; return JSON.stringify(j); });
        fs.writeFileSync(SHOW, text);
        console.log('  info made ' + path.relative(REPO, SHOW) + ' (' + text.length + ' bytes)');
      }
      const direct = await p7.evaluate(async () => {
        const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
        const url = (re) => Object.entries(map).find(([k]) => re.test(k))?.[1];
        const [{ mcScene }, PT, L] = await Promise.all([import(url(/\/modelcraft\/dev\/render-mc\.js/)), import(url(/\/render\/render-pt\.js/)), import(url(/\/render\/looks\.js/))]);
        const mc = window.modelcraft;
        const settings = L.cleanSettings({ mode: 'hq', quality: 'draft', looks: { '#4f7fae': 'glass' } });
        const scene = mcScene(mc.model, mc.cam, mc.view.style, settings);
        const t0 = performance.now();
        const r = await PT.pathTraceStill(scene, settings, { w: 128, h: 96 });
        scene.dispose?.();
        const bmp = await createImageBitmap(r.blob), c = new OffscreenCanvas(bmp.width, bmp.height), g = c.getContext('2d');
        g.drawImage(bmp, 0, 0);
        const d = g.getImageData(0, 0, bmp.width, bmp.height).data;
        const band = (y0, y1) => { const s = [0, 0, 0]; let n = 0; for (let y = Math.floor(y0 * bmp.height); y < Math.floor(y1 * bmp.height); y++) for (let x = 0; x < bmp.width; x++) { const i = (y * bmp.width + x) * 4; s[0] += d[i]; s[1] += d[i + 1]; s[2] += d[i + 2]; n++; } return s.map((v) => v / n); };
        let sum = 0, sum2 = 0;
        for (let i = 0; i < d.length; i += 4) { const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; sum += l; sum2 += l * l; }
        const n = d.length / 4, mean = sum / n;
        return { engine: r.engine, fallback: r.fallback, passes: r.passes, w: bmp.width, h: bmp.height, top: band(0, 0.1), mean, sd: Math.sqrt(Math.max(0, sum2 / n - mean * mean)), ms: Math.round(performance.now() - t0),
          gptLoaded: performance.getEntriesByType('resource').some((x) => /three-gpu-pathtracer/.test(x.name)) };
      });
      console.log('  info WebGPU direct: ' + JSON.stringify(direct));
      ok(direct.engine === 'webgpu' && !direct.fallback, 'High quality runs on the WGSL tracer where WebGPU exists', direct.engine + (direct.fallback ? ' (' + direct.fallback + ')' : ''));
      ok(direct.passes === 16 && direct.w === 128 && direct.h === 96, 'the house at 128 × 96, 16 samples', direct.passes + ' samples, ' + direct.w + '×' + direct.h);
      ok(direct.top[2] > direct.top[0] && direct.sd > 12, 'a picture with sky above, not flat', direct.top.map(Math.round).join(',') + ' sd ' + direct.sd.toFixed(1));
      ok(!direct.gptLoaded, 'the WebGL tracer (three-gpu-pathtracer) is not loaded when WebGPU runs');
      // the dialog: Stop keeps the picture, Resume continues, the status says which engine ran
      await openDialog(p7);
      await p7.selectOption('[data-render-mode]', 'hq');
      await p7.selectOption('[data-render-minutes]', '0');
      await p7.selectOption('[data-render-size]', 'view');
      await p7.selectOption('[data-render-quality]', 'draft');
      await p7.click('[data-render-go]');
      await p7.waitForFunction(() => /High quality: sample [1-9]/.test(document.querySelector('[data-render-status]')?.textContent || ''), null, { timeout: 600000 });
      await p7.click('[data-render-go]');   // Stop
      await p7.waitForFunction(() => /^(Stopped|Done)/.test(document.querySelector('[data-render-status]')?.textContent || ''), null, { timeout: 600000 });
      const st1 = await p7.textContent('[data-render-status]');
      ok(/^Stopped after [1-9]\d* samples.*graphics card \(WebGPU\)/.test(st1), 'Stop keeps the picture and names the engine', st1);
      ok(await p7.isVisible('[data-render-resume]'), 'Resume is offered after Stop');
      const n1 = Number(/after (\d+) samples/.exec(st1)?.[1] || 0);
      await p7.click('[data-render-resume]');
      // the status changes when Resume finishes (the old "Stopped after …" line must not count)
      await p7.waitForFunction((prev) => { const x = document.querySelector('[data-render-status]')?.textContent || ''; return x !== prev && /^(Stopped|Done)/.test(x); }, st1, { timeout: 900000 });
      const st2 = await p7.textContent('[data-render-status]');
      ok(/^Done: \d+ × \d+ pixels, 16 samples/.test(st2), 'Resume finishes the same render to its 16 samples', n1 + ' → ' + st2);
      ok(!(await p7.isVisible('[data-render-resume]')), 'no Resume once the picture is finished');
      await p7.screenshot({ path: path.join(OUT, '12-webgpu-resumed.png') });
      // RN.3: the physical sky's haze, then a sky picture (a small .hdr made here: an orange band at the horizon, blue above)
      await p7.selectOption('[data-render-sky]', 'physical');
      ok(await p7.isVisible('[data-render-turbidity-row]') && !(await p7.isVisible('[data-render-hdri-rows]')) && await p7.isVisible('[data-render-sky-note]'), 'Physical sky shows its haze slider and the graphics-card note');
      await p7.selectOption('[data-render-sky]', 'hdri');
      ok(await p7.isVisible('[data-render-hdri-rows]') && !(await p7.isVisible('[data-render-turbidity-row]')), 'Sky picture shows its picture, turn and brightness controls');
      const { writeHdr } = await import(path.join(REPO, 'lib/exr/hdr.js'));
      const HW = 64, HH = 32, px = new Float32Array(HW * HH * 3);
      for (let y = 0; y < HH; y++) for (let x = 0; x < HW; x++) { const o = (y * HW + x) * 3, t = y / HH; px.set(t < 0.45 ? [0.3, 0.5, 1.2] : t < 0.55 ? [2.5, 1.2, 0.4] : [0.3, 0.25, 0.2], o); }
      const hdrPath = path.join(OUT, 'test-sky.hdr');
      fs.writeFileSync(hdrPath, writeHdr({ width: HW, height: HH, channels: 3, data: px }));
      await p7.setInputFiles('[data-render-hdri-file]', hdrPath);
      await p7.waitForFunction(() => /Sky picture test-sky\.hdr read \(64 × 32\)/.test(document.querySelector('[data-render-status]')?.textContent || ''), null, { timeout: 30000 });
      ok(/test-sky\.hdr/.test(await p7.textContent('[data-render-hdri-name]')), 'the chosen picture is named in the dialog');
      await p7.click('[data-render-go]');
      await p7.waitForFunction(() => /^(Stopped|Done|The render)/.test(document.querySelector('[data-render-status]')?.textContent || ''), null, { timeout: 900000 });
      const st3 = await p7.textContent('[data-render-status]');
      ok(/^Done: .*graphics card \(WebGPU\)/.test(st3) && !/No sky picture/.test(st3), 'a render under the sky picture finishes on the WGSL tracer', st3);
      await p7.screenshot({ path: path.join(OUT, '13-webgpu-hdri.png') });
      // RN.4: the camera — exposure from f-stop / shutter / ISO, depth of field, a 360° panorama (2:1)
      await p7.selectOption('[data-render-sky]', 'clear');
      ok(!(await p7.isVisible('[data-render-camera-row]')) && !(await p7.isVisible('[data-render-dof-row]')), 'Camera: the f-stop row and the focus row are hidden until asked for');
      await p7.selectOption('[data-render-exposure-mode]', 'camera');
      await p7.selectOption('[data-render-fstop]', '16');
      await p7.selectOption('[data-render-shutter]', String(1 / 125));
      ok(await p7.isVisible('[data-render-camera-row]') && /^EV 15/.test(await p7.textContent('[data-render-ev]')), 'Camera settings show f-stop, shutter, ISO and the EV', await p7.textContent('[data-render-ev]'));
      await p7.check('[data-render-dof]');
      ok(await p7.isVisible('[data-render-dof-row]'), 'Depth of field shows the focus distance and the aperture shape');
      await p7.uncheck('[data-render-dof]');
      await p7.selectOption('[data-render-projection]', 'equirect');
      await p7.click('[data-render-go]');
      await p7.waitForFunction(() => /^(Stopped|Done|The render)/.test(document.querySelector('[data-render-status]')?.textContent || '') && document.querySelector('[data-render-image]'), null, { timeout: 900000 });
      const pano = await p7.$eval('[data-render-image]', (im) => ({ w: im.naturalWidth, h: im.naturalHeight }));
      ok(pano.w === 2 * pano.h && /graphics card \(WebGPU\)/.test(await p7.textContent('[data-render-status]')), 'a 360° panorama renders 2:1 on the WGSL tracer', pano.w + ' × ' + pano.h);
      await p7.screenshot({ path: path.join(OUT, '14-webgpu-panorama.png') });
      await p7.selectOption('[data-render-projection]', 'normal');
      await p7.selectOption('[data-render-exposure-mode]', 'slider');
      // RN.6: light mixing + render elements — after the render, a group's brightness changes the picture with no new render
      await p7.check('[data-render-light-mix]');
      await p7.check('[data-render-elements]');
      await p7.click('[data-render-go]');
      await p7.waitForFunction(() => /^(Stopped|Done|The render)/.test(document.querySelector('[data-render-status]')?.textContent || '') && !document.querySelector('[data-render-mix-panel]')?.hidden, null, { timeout: 900000 });
      const st4 = await p7.textContent('[data-render-status]');
      const groupsShown = await p7.$$eval('[data-render-mix-on]', (xs) => xs.map((x) => x.dataset.renderMixOn));
      ok(groupsShown.includes('sky') && groupsShown.includes('sun'), 'Mix the picture lists the light groups (sky, sun)', groupsShown.join(', '));
      const sig = () => p7.$eval('[data-render-pic] canvas, [data-render-pic] img', (c) => { if (c.tagName === 'IMG') { const k = document.createElement('canvas'); k.width = c.naturalWidth; k.height = c.naturalHeight; k.getContext('2d').drawImage(c, 0, 0); c = k; } const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i + 1]; return s / (d.length / 4); });
      const before = await sig();
      await p7.$eval('[data-render-mix-stops="sky"]', (x) => { x.value = '-3'; x.dispatchEvent(new Event('input', { bubbles: true })); });
      await p7.waitForTimeout(300);
      const after = await sig();
      ok(after < before - 2 && (await p7.textContent('[data-render-status]')) === st4, 'the sky −3 stops darkens the picture at once, no new render', before.toFixed(1) + ' → ' + after.toFixed(1));
      await p7.selectOption('[data-render-show]', 'albedo');
      const alb = await sig();
      ok(Math.abs(alb - after) > 2, 'Show › Albedo shows the surface colours', alb.toFixed(1));
      await p7.screenshot({ path: path.join(OUT, '15-webgpu-mix.png') });
      await p7.selectOption('[data-render-show]', 'beauty');
      // RN.8: the look and the post change the finished picture at once, no new render
      const b8 = await sig();
      await p7.selectOption('[data-render-view]', 'agx');
      await p7.$eval('[data-render-post="vignette"]', (x) => { x.value = '0.8'; x.dispatchEvent(new Event('input', { bubbles: true })); });
      await p7.waitForTimeout(300);
      const a8 = await sig();
      ok(Math.abs(a8 - b8) > 1 && (await p7.textContent('[data-render-status]')) === st4, 'Picture › AgX + vignette redraws the finished picture, no new render', b8.toFixed(1) + ' → ' + a8.toFixed(1));
      await p7.screenshot({ path: path.join(OUT, '16-webgpu-post.png') });
      // RN.9: EXR with every layer, a 16-bit PNG, the render file — and reopening it
      const saveAs = async (fmt) => { await p7.selectOption('[data-render-format]', fmt); const [dl] = await Promise.all([p7.waitForEvent('download'), p7.click('[data-render-save]')]); const f = path.join(OUT, 'out-' + fmt + '-' + dl.suggestedFilename()); await dl.saveAs(f); return { f, b: fs.readFileSync(f), name: dl.suggestedFilename() }; };
      const ex = await saveAs('exr');
      ok(ex.b.readUInt32LE(0) === 20000630 && /\.exr$/.test(ex.name) && ex.b.includes(Buffer.from('albedo.R')) && ex.b.includes(Buffer.from('light_sky.R')), 'Save as EXR: an OpenEXR file with the elements and light groups', ex.name + ', ' + ex.b.length + ' bytes');
      const p16 = await saveAs('png16');
      ok(p16.b.subarray(1, 4).toString() === 'PNG' && p16.b[24] === 16, 'Save as PNG, 16 bits', p16.name);
      const cc = await saveAs('ccrender');
      ok(cc.b[0] === 0x50 && cc.b[1] === 0x4b && /\.ccrender$/.test(cc.name), 'Save as render file (.ccrender)', cc.b.length + ' bytes');
      await p7.selectOption('[data-render-format]', 'png');
      await p7.setInputFiles('[data-render-open-file]', cc.f);
      await p7.waitForFunction(() => /^Opened /.test(document.querySelector('[data-render-status]')?.textContent || ''), null, { timeout: 30000 });
      ok(/AgX|agx/.test(await p7.$eval('[data-render-view]', (x) => x.value)) && !(await p7.$eval('[data-render-mix-panel]', (x) => x.hidden)), 'Open a render file: the picture comes back with its grade and its light groups', await p7.textContent('[data-render-status]'));
      for (const x of [ex, p16, cc]) fs.unlinkSync(x.f);   // big files: checked, not kept (disk)
      await p7.selectOption('[data-render-view]', 'aces');
      await p7.$eval('[data-render-post="vignette"]', (x) => { x.value = '0'; x.dispatchEvent(new Event('input', { bubbles: true })); });
      await p7.click('[data-render-mix-reset]');
      await p7.uncheck('[data-render-light-mix]');
      await p7.uncheck('[data-render-elements]');
      ok(!gerrs.length, 'WebGPU pages: no console errors', gerrs.join(' | '));
    } finally { await gb.close(); }
  }
  ok(!errs.length, 'no console errors', errs.join(' | '));
  void view;
} finally {
  await browser.close();
  if (!KEEP_ADMIN) { try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch {} if (fs.existsSync(STATE)) fs.unlinkSync(STATE); }
}
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

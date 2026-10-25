#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-media.mjs — the Render dialog's fog, smoke-or-cloud, adaptive-sampling and caustics controls (0.7 RN.7, session
 * `render`) on /lab/modelcraft in headless Chromium: the section shows only in High quality; its rows follow their switches;
 * caustics are off (disabled) while fog is on; every value comes back when the dialog is opened again (the settings travel through
 * the model); a volume file (.ccvol) is read, kept for the session and refused when bad; one tiny high-quality render with fog and
 * adaptive sampling runs on the WGSL tracer (SwiftShader: slow, small) and the picture differs from the same render without
 * fog; no console errors. Shots in tmp/shots/media.
 *
 *   node tools/modelcraft-test/browser-media.mjs [--out <dir>] [--no-render] [--w 560 --h 420]   (a tall window shows the whole section in the shot)
 * Run as root (ModelCraft's test admin via tools/modelcraft-test/admin.php). Run it alone: the render takes minutes on a CPU.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/media')));
const STATE = path.join(REPO, 'tmp/render-browser-state.json');
const RENDER = !process.argv.includes('--no-render');
fs.mkdirSync(OUT, { recursive: true });

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/modelcraft-test/admin.php');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader'] });

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
  });
  mc.cam.fit(m.bbox(), [-0.62, -1, 0.2]);
  mc.view.invalidate();
});
async function openDialog(page) {
  await page.evaluate(() => { document.querySelector('[data-export-menu]').open = true; });
  await page.click('[data-export="render"]');
  await page.waitForSelector('[data-render-dialog][open]');
}
async function closeDialog(page) { await page.click('[data-render-close]'); await page.waitForFunction(() => !document.querySelector('[data-render-dialog][open]')); }
const vis = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); return !!e && !e.hidden && !e.closest('[hidden]') && e.getClientRects().length > 0; }, sel);
const set = async (page, sel, v) => { await page.$eval(sel, (e, x) => { e.value = String(x); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, v); };
const check = async (page, sel, on) => { await page.$eval(sel, (e, x) => { if (e.checked !== x) e.click(); }, on); };

try {
  const ctx = await signedInContext({ viewport: { width: +arg('--w', 560), height: +arg('--h', 420) }, locale: 'en-US' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
  await house(page);
  await page.waitForTimeout(300);
  await openDialog(page);

  console.log('\nthe section and its rows');
  ok(!(await vis(page, '[data-render-media-fs]')), 'Fog, smoke and noise: not shown in the fast mode');
  await set(page, '[data-render-mode]', 'hq');
  ok(await vis(page, '[data-render-media-fs]'), 'Fog, smoke and noise: shown in High quality');
  ok(!(await vis(page, '[data-render-fog-rows]')) && !(await vis(page, '[data-render-vol-rows]')) && !(await vis(page, '[data-render-adaptive-rows]')), 'its rows are hidden until their switches are on');
  await check(page, '[data-render-fog-on]', true);
  ok(await vis(page, '[data-render-fog-rows]'), 'Fog and haze: its rows appear');
  await set(page, '[data-render-fog-visibility]', 80); await set(page, '[data-render-fog-top]', 15); await set(page, '[data-render-fog-lean]', 0.6);
  await page.$eval('[data-render-fog-color]', (e) => { e.value = '#ffeedd'; e.dispatchEvent(new Event('input', { bubbles: true })); });
  ok(await page.$eval('[data-render-caustics-on]', (e) => e.disabled), 'Caustics: off (disabled) while fog is on');
  ok(/fog/i.test(await page.textContent('[data-render-caustics-note]')), '…and the note says why');
  await check(page, '[data-render-vol-on]', true);
  ok(await vis(page, '[data-render-vol-rows]') && await vis(page, '[data-render-vol-preset]') && !(await vis(page, '[data-render-vol-file-rows]')), 'Smoke or cloud: the preset rows show, the file row does not');
  await set(page, '[data-render-vol-kind]', 'file');
  ok(!(await vis(page, '[data-render-vol-preset]')) && await vis(page, '[data-render-vol-file-rows]'), 'From a volume file: the file row shows instead');
  await set(page, '[data-render-vol-kind]', 'plume');
  await set(page, '[data-render-vol-size]', 6); await set(page, '[data-render-vol-density]', 1.5);
  await check(page, '[data-render-adaptive-on]', true);
  await set(page, '[data-render-adaptive-noise]', 4);
  ok(await vis(page, '[data-render-adaptive-rows]'), 'Adaptive sampling: its row appears');
  await check(page, '[data-render-fog-on]', false); await check(page, '[data-render-vol-on]', false);
  ok(!(await page.$eval('[data-render-caustics-on]', (e) => e.disabled)), 'Caustics: available again with fog and smoke off');
  await check(page, '[data-render-caustics-on]', true);
  await check(page, '[data-render-fog-on]', true); await check(page, '[data-render-vol-on]', true);
  await page.locator('[data-render-media-fs]').scrollIntoViewIfNeeded();
  await page.locator('[data-render-media-fs]').screenshot({ path: path.join(OUT, '01-section.png') });

  console.log('\nthe values travel');
  await closeDialog(page);
  await openDialog(page);
  const back = await page.evaluate(() => {
    const v = (s) => { const e = document.querySelector(s); return e.type === 'checkbox' ? e.checked : e.value; };
    return { fog: v('[data-render-fog-on]'), vis: v('[data-render-fog-visibility]'), top: v('[data-render-fog-top]'), lean: v('[data-render-fog-lean]'), col: v('[data-render-fog-color]'), vol: v('[data-render-vol-on]'), kind: v('[data-render-vol-kind]'), size: v('[data-render-vol-size]'), den: v('[data-render-vol-density]'), ad: v('[data-render-adaptive-on]'), noise: v('[data-render-adaptive-noise]'), caus: v('[data-render-caustics-on]') };
  });
  ok(back.fog && back.vis === '80' && back.top === '15' && back.lean === '0.6' && back.col === '#ffeedd', 'fog: every value is there when the dialog is opened again', JSON.stringify(back));
  ok(back.vol && back.kind === 'plume' && back.size === '6' && back.den === '1.5' && back.ad && back.noise === '4' && back.caus === true, 'smoke, adaptive sampling and caustics too');

  console.log('\na volume file');
  const bytes = await page.evaluate(async () => {
    const V = await import('/assets/apps/modelcraft/dev/render/pt-volume.js');
    return Array.from(V.writeCcvol(V.cloudGrid(12, 4), 12, 12, 12));
  });
  await set(page, '[data-render-vol-kind]', 'file');
  await page.setInputFiles('[data-render-vol-file]', { name: 'mist.ccvol', mimeType: 'application/octet-stream', buffer: Buffer.from(bytes) });
  await page.waitForFunction(() => /Loaded mist\.ccvol \(12 × 12 × 12\)/.test(document.querySelector('[data-render-status]').textContent));
  ok(true, 'a .ccvol file is read and its size said');
  ok((await page.textContent('[data-render-vol-name]')).includes('mist.ccvol'), 'its name is shown');
  await page.setInputFiles('[data-render-vol-file]', { name: 'bad.ccvol', mimeType: 'application/octet-stream', buffer: Buffer.from('not a volume') });
  await page.waitForFunction(() => /not a volume file/.test(document.querySelector('[data-render-status]').textContent));
  ok(true, 'a bad file is refused with its reason', await page.textContent('[data-render-status]'));
  await set(page, '[data-render-vol-kind]', 'plume');

  if (RENDER) {
    console.log('\na small high-quality render with fog and adaptive sampling');
    await check(page, '[data-render-caustics-on]', false);
    await check(page, '[data-render-denoise]', false);
    await set(page, '[data-render-size]', 'view'); await set(page, '[data-render-quality]', 'draft');
    await check(page, '[data-render-vol-on]', false);
    const run = async () => {
      await page.click('[data-render-go]');
      await page.waitForFunction(() => /^(Done|Stopped|Could not|The high-quality)/.test(document.querySelector('[data-render-status]')?.textContent || ''), null, { timeout: 900000 });
      const status = await page.textContent('[data-render-status]');
      const hash = await page.evaluate(async () => {
        const img = document.querySelector('[data-render-image]'); if (!img) return null;
        const bmp = await createImageBitmap(await (await fetch(img.src)).blob());
        const c = new OffscreenCanvas(bmp.width, bmp.height), g = c.getContext('2d'); g.drawImage(bmp, 0, 0);
        const d = g.getImageData(0, 0, bmp.width, bmp.height).data; let h = 0, s = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) { h = (h * 31 + d[i] + d[i + 1] * 7 + d[i + 2] * 13) >>> 0; s += d[i] + d[i + 1] + d[i + 2]; n++; }
        return { h, mean: s / (3 * n), w: bmp.width, hh: bmp.height };
      });
      return { status, hash };
    };
    let t0 = Date.now();
    const withFog = await run();
    console.log('        (' + (Date.now() - t0) / 1000 + ' s: ' + withFog.status + ')');
    ok(/Path traced on the graphics card \(WebGPU\)/.test(withFog.status), 'High quality with fog runs on the WGSL tracer');
    ok(/Adaptive sampling: /.test(withFog.status), 'the finish line reports the adaptive sampling', (withFog.status.match(/Adaptive sampling: [^.]*\./) || [''])[0]);
    await page.screenshot({ path: path.join(OUT, '02-fog.png') });
    await check(page, '[data-render-fog-on]', false);
    t0 = Date.now();
    const noFog = await run();
    console.log('        (' + (Date.now() - t0) / 1000 + ' s)');
    ok(withFog.hash && noFog.hash && withFog.hash.h !== noFog.hash.h && Math.abs(withFog.hash.mean - noFog.hash.mean) > 0.5, 'the same view without fog is a different picture', 'mean ' + withFog.hash.mean.toFixed(1) + ' with fog, ' + noFog.hash.mean.toFixed(1) + ' without');
  }
  ok(!errs.filter((e) => !/WebGPU is experimental|powerPreference/i.test(e)).length, 'no console errors', errs.slice(0, 3).join(' | '));
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

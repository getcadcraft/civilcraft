#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-walkvideo.mjs — a rendered walkthrough video in BimCraft (0.8 WALK; session oltl-re_PART_3): a recorded walk gets a
 * "Render a video of this walk" button in Views; the shared Render video dialog draws it frame by frame along the walk, headless.
 * (Header of browser-render.mjs follows, which this was cut from.) Opens the generated IFC fixture (tools/bimcraft-test/ifc-fixture.mjs, georef 'site': Sydney), clicks
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
const SHOTS = si > 0 ? process.argv[si + 1] : path.join(REPO, 'tmp/shots/walk-video');
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
// BimCraft loads more than the browser's default 250 resource-timing entries before Render is clicked: keep them all, or the
// later entries (render-core.js, render-bim.js) are dropped and the checks below can't see them
await page.addInitScript(() => { try { performance.setResourceTimingBufferSize(10000); } catch { /* old browser */ } });
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((s) => new RegExp(s).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });


try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('bimcraft.render'); } catch { /* none */ } });
  await page.setInputFiles('[data-file]', { name: 'walk-fixture.ifc', mimeType: 'application/x-step', buffer: Buffer.from(fixtureIfc({ georef: 'site' })) });
  await waitStatus(/^Opened /, 90000);

  // 0.8 RE.1 / RE.2 / RE.6 in BimCraft: the Render dialog has an Engine choice, the file engines are listed, and the hand-off saves a real USD / glTF
  await page.click('[data-toolbar] [data-render-open]');
  await page.waitForSelector('[data-render-dialog][open]');
  await page.waitForFunction(() => { const s = document.querySelector('[data-render-engine]'); return s && s.options.length > 2; }, null, { timeout: 30000 });
  const engines = await page.$$eval('[data-render-engine] option', (o) => o.map((x) => x.value + ':' + (x.disabled ? 'off' : 'on')));
  ok(engines[0].startsWith('fast') && engines[1].startsWith('pt'), 'Engine: Fast and Path tracer come first', engines.join(' '));
  ok(engines.some((e) => /usd/i.test(e)) && engines.some((e) => /gl/i.test(e)), 'Engine: the USD file and glTF file engines are listed', engines.join(' '));
  const gl = engines.find((e) => /gl/i.test(e)).split(':')[0];
  await page.selectOption('[data-render-engine]', gl);
  const [fdl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.click('[data-render-go]')]);
  const gbytes = fs.readFileSync(await fdl.path());
  ok(fdl.suggestedFilename().endsWith('.glb') && gbytes.subarray(0, 4).toString() === 'glTF', 'the glTF file engine saves a real .glb of the BimCraft scene', fdl.suggestedFilename() + ' ' + gbytes.length + ' bytes');
  const usdId = engines.find((e) => /usd/i.test(e)).split(':')[0];
  await page.selectOption('[data-render-engine]', usdId);
  const [udl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.click('[data-render-go]')]);
  const ubytes = fs.readFileSync(await udl.path());
  ok(/\.usd[cz]$/.test(udl.suggestedFilename()) && (ubytes.subarray(0, 8).toString() === 'PXR-USDC' || (ubytes[0] === 0x50 && ubytes[1] === 0x4b)), 'the USD file engine saves a real .usdc / .usdz of the BimCraft scene', udl.suggestedFilename() + ' ' + ubytes.length + ' bytes');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('[data-render-dialog][open]'), null, { timeout: 10000 }).catch(() => {});
  await page.click('[data-toolbar] [data-saved-views]');
  await page.waitForSelector('[data-views-panel]');
  ok(await page.$$eval('[data-walk-video]', (b) => b.length) === 0, 'no walk yet: no video button');
  await page.click('[data-toolbar] [data-toggle="walk"]');
  await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer, c = v.box.getCenter(v.camera.position.clone()); v.walkPick([c.x, v.box.min.y + 0.05, c.z]); });
  await page.waitForFunction(() => !!document.querySelector('[data-canvas]').viewer.walk, null, { timeout: 10000 });
  await page.click('[data-walk-record]');
  await waitStatus(/^Recording the walk/);
  await page.focus('[data-canvas]').catch(() => {});
  await page.keyboard.down('w'); await page.waitForTimeout(1500); await page.keyboard.up('w');
  await page.click('[data-walk-record]');
  await waitStatus(/^Saved Walk 1 \(\d+ s\)\./);
  await page.click('[data-toolbar] [data-toggle="walk"]');
  ok(await page.$$eval('[data-walk-video]', (b) => b.length) === 1, 'the saved walk has a Render video button');
  await page.click('[data-walk-video="0"]');
  await page.waitForSelector('[data-video-dialog][open]');
  ok(/Render video/.test(await page.textContent('#cc-video-h')), 'the shared Render video dialog opens');
  const est = await page.textContent('[data-video-estimate]');
  ok(/frame/i.test(est), 'the estimate counts frames along the walk', est);
  await page.selectOption('[data-video-size]', 'p480');
  await page.selectOption('[data-video-fps]', '24');
  await page.selectOption('[data-video-quality]', 'quick');
  await page.selectOption('[data-video-format]', 'png');
  // the frames: a still of each moment along the walk — the camera must really move between the first and the last frame
  await page.click('[data-video-go]');
  await page.waitForFunction(() => /^(Done|Stopped|Could not|Nothing|Rendered)/i.test(document.querySelector('[data-video-status]')?.textContent || '') || !document.querySelector('[data-video-save]').disabled, null, { timeout: 600000 });
  const status = await page.textContent('[data-video-status]');
  ok(!/^Could not|^Nothing/.test(status), 'the video renders', status);
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-video-save]')]);
  const name = dl.suggestedFilename();
  ok(/walk-fixture Walk 1 frames\.zip$/.test(name), 'Save gives the frames zip named after the file and the walk', name);
  const zip = fs.readFileSync(await dl.path());
  ok(zip.length > 2000 && zip[0] === 0x50 && zip[1] === 0x4b, 'the zip holds pictures', zip.length + ' bytes');
  // frame count in the stored zip's central directory
  let n = 0; for (let i = 0; i + 4 < zip.length; i++) if (zip.readUInt32LE(i) === 0x02014b50) n++;
  ok(n >= 2, 'more than one frame', String(n));
  const crcs = []; for (let i = 0; i + 20 < zip.length; i++) if (zip.readUInt32LE(i) === 0x02014b50) crcs.push(zip.readUInt32LE(i + 16));
  ok(new Set(crcs).size >= Math.min(n, 3) && crcs[0] !== crcs[crcs.length - 1], 'the camera moves: the first and last frames differ', new Set(crcs).size + ' different pictures');
  await shot(page, 'walk-video');
  await page.click('[data-video-close]');
  const real = problems.filter((m) => !/status of 429/.test(m));   // the test machine shares one address with other sessions' runs (Throttle)
  ok(!real.length, 'no console errors', real.join(' | '));
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

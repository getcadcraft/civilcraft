#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-photo.mjs — BimCraft: material from a photo (0.8 EG.62 BimCraft half), in the lab, headless. Opens the IFC fixture, Paint ›
 * "From a photo…" with a made-up PNG, the material appears in the palette, four walls painted with it, the 3D view draws it with its
 * own picture (live textures), Save keeps it in the IFC (CadCraft_PhotoMaterials), reopening that file brings it back, a material in use
 * cannot be removed.   node tools/bimcraft-test/browser-photo.mjs [--shots <dir>]
 * Run as root (a session minted for the shared test admin, as browser-render.mjs does).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fixtureIfc } from './ifc-fixture.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : path.join(REPO, 'tmp/shots/photo-bim');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m + (d ? ' (' + d + ')' : '')); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };

const { pngBytes } = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/bimcraft/dev/render/pt-output.js')).href);
// a made-up photo: warm blobs lit from the left, 320 × 320
const W = 320, rgb = new Uint8Array(W * W * 3);
for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
  const n = 0.55 + 0.45 * Math.sin(x / 9) * Math.cos(y / 7) + 0.1 * ((x * 7919 + y * 104729) % 17) / 17, l = 0.55 + 0.45 * (1 - x / W), o = (y * W + x) * 3;
  rgb[o] = Math.min(255, 170 * n * l); rgb[o + 1] = Math.min(255, 100 * n * l); rgb[o + 2] = Math.min(255, 70 * n * l);
}
const photoPng = Buffer.from(pngBytes(W, W, rgb));

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimmodel'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((s) => (window.__st || []).some((x) => new RegExp(s).test(x)) || new RegExp(s).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout }).catch(async (e) => { throw new Error(e.message.split('\n')[0] + ' — status history: ' + await history()); });
const history = async () => (await page.evaluate(() => window.__st || [])).slice(-6).join(' | ');
const keyOf = (name) => page.evaluate((n) => window.bimcraftKeys(n)?.[0] ?? window.bimcraftKeys(n), name);

try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { window.__st = []; new MutationObserver(() => { const x = document.querySelector('[data-status]')?.textContent; if (x && window.__st[window.__st.length - 1] !== x) window.__st.push(x); }).observe(document.querySelector('[data-status]'), { childList: true, characterData: true, subtree: true }); });
  await page.setInputFiles('[data-file]', { name: 'photo-fixture.ifc', mimeType: 'application/x-step', buffer: Buffer.from(fixtureIfc({ georef: 'site' })) });
  await waitStatus(/^Opened /, 90000);

  console.log('== From a photo');
  await page.click('[data-toolbar] [data-paint-open]');
  await page.waitForSelector('[data-paint-panel]');
  ok(await page.isVisible('[data-paint-photo-add]') && /None yet/.test(await page.textContent('[data-paint-photo-note]')), 'the palette has "From a photo…" and says there are none yet');
  await page.fill('[data-paint-photo-size]', '0.9');
  await page.setInputFiles('[data-paint-photo-file]', { name: 'garden_brick.png', mimeType: 'image/png', buffer: photoPng });
  await waitStatus(/^Made garden brick: one repeat covers 0\.9 m/, 20000);
  ok(true, 'the photo became "garden brick", one repeat 0.9 m, the join reported');
  const mine = await page.$$eval('[data-paint-mine]', (b) => b.map((x) => x.dataset.paintMine));
  ok(mine.length === 1 && /^photo-[0-9a-f]{8}$/.test(mine[0]), 'its swatch is in "Your photo materials"', mine.join());
  const id = mine[0];
  ok(await page.$eval(`[data-paint-mine="${id}"]`, (b) => b.style.backgroundImage.startsWith('url(')), 'the swatch shows the tile');
  await page.screenshot({ path: path.join(SHOTS, '01-palette.png') });

  console.log('== Paint four walls');
  const walls = [];
  for (const n of ['W-101', 'W-102', 'W-103', 'W-104']) walls.push(await keyOf(n));
  await page.evaluate((ks) => document.querySelector('[data-canvas]').viewer.select(ks), walls);
  await page.click(`[data-paint-mine="${id}"]`);
  await waitStatus(/^Painted 4 elements: garden brick\./, 60000);
  ok(true, 'a click on the swatch with four walls selected paints them all');
  await page.waitForFunction((i) => window.bimcraftLiveTex && window.bimcraftLiveTex.info().materials.includes(i), id, { timeout: 30000 }).catch(() => {});
  const info = await page.evaluate(() => window.bimcraftLiveTex?.info());
  ok(info && info.materials.includes(id) && info.meshes >= 1 && info.triangles > 0, 'the 3D view draws it with its own picture (live textures)', JSON.stringify(info));
  await page.screenshot({ path: path.join(SHOTS, '02-painted.png') });

  console.log('== Remove while in use');
  await page.click(`[data-paint-photo-remove="${id}"]`);
  await waitStatus(/painted on 4 elements/i, 30000).catch(() => {});
  ok(/painted on 4 elements/i.test(await page.textContent('[data-status]')) && (await page.$$('[data-paint-mine]')).length === 1, 'a material in use is not removed; the status says why');

  console.log('== Save and reopen');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('[data-save]').disabled, null, { timeout: 30000 });
  const [sv] = await Promise.all([page.waitForEvent('download'), page.click('[data-save]')]);
  const text = fs.readFileSync(await sv.path(), 'utf8');
  ok(/CadCraft_PhotoMaterials/.test(text) && text.includes(id) && text.includes('garden brick') && text.includes('"png":"iVBOR'), 'the saved IFC carries the material and its picture', Math.round(text.length / 1024) + ' KB');
  fs.writeFileSync(path.join(SHOTS, 'saved.ifc'), text);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', { name: 'saved.ifc', mimeType: 'application/x-step', buffer: Buffer.from(text) });
  await waitStatus(/^Opened /, 90000);
  await page.waitForFunction((i) => window.bimcraftLiveTex && window.bimcraftLiveTex.info().materials.includes(i), id, { timeout: 60000 }).catch(() => {});
  const again = await page.evaluate(() => window.bimcraftLiveTex?.info());
  ok(again && again.materials.includes(id), 'reopened: the walls show the photo material without being painted again', JSON.stringify(again));
  await page.click('[data-toolbar] [data-paint-open]');
  await page.waitForSelector('[data-paint-panel]');
  ok((await page.$$eval('[data-paint-mine]', (b) => b.map((x) => x.dataset.paintMine))).join() === id, 'and the palette lists it');
  await page.screenshot({ path: path.join(SHOTS, '03-reopened.png') });
  await page.keyboard.press('Escape');
} catch (e) { fail++; console.log('  FAIL ' + (e.stack || e)); }
ok(problems.length === 0, 'no console errors', problems.slice(0, 3).join(' | '));
await browser.close();
console.log((fail ? 'FAIL ' : 'ok   ') + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

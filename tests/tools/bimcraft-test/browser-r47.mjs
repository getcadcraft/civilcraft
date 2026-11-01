#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-r47.mjs — BimCraft round 4 (session bim-model_PART_4) in the lab, headless, with real clicks. ONE app, SwiftShader, one pass.
 *   node bin/test-bimcraft.mjs --r47 --make-fixture && nice node tools/bimcraft-test/browser-r47.mjs [--shots <dir>]
 * Mints a session with tools/cadcraft-test/admin.php. Fails on any console error. Opens tmp/bimcraft-r47.ifc (drawn walls, a door and a
 * window, brick-red paint, a recorded walk) and checks: RENDER-NEXT live textures, EG.50 narration (editor, saved with the walk, subtitles while
 * it plays, SRT download), EG.20 Dimension the plan (one undo step), the IFC 4.3 Infrastructure view of the quantities, the Several-models team
 * button, and that the walk's narration and the add-on record survive Save and reopen.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const FIXTURE = path.join(REPO, 'tmp/bimcraft-r47.ifc');
if (!fs.existsSync(FIXTURE)) { console.log('make the fixture first: node bin/test-bimcraft.mjs --r47 --make-fixture'); process.exit(1); }

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m + (d ? ' (' + d + ')' : '')); } else { fail++; console.log('  FAIL ' + m + (d ? ' - ' + d : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimr47'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); if (process.env.DBG && m.type() === 'warning') console.log('   warn: ' + m.text().slice(0, 300)); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return !s || (!s.busy && !s.reloading && !s.queue.length); }, null, { timeout: 60000 });

try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('bimcraft.liveTextures'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', FIXTURE);
  await waitStatus(/^Opened /, 90000);

  console.log('== RENDER-NEXT live textures');
  await page.waitForFunction(() => window.bimcraftLiveTex && window.bimcraftLiveTex.info().meshes > 0, null, { timeout: 30000 }).catch(() => {});
  const info = await page.evaluate(() => window.bimcraftLiveTex && window.bimcraftLiveTex.info());
  ok(info && info.meshes > 0 && info.materials.includes('brick-red'), 'the painted brick walls are drawn with their texture in the 3D view', JSON.stringify(info));
  const lib = await page.evaluate(() => { const g = window.bimcraftLiveTex; const sc = document.querySelector('[data-canvas]').viewer.scene.getObjectByName('cc-live-textures'); return { n: sc ? sc.children.length : -1, uv: sc && sc.children[0] ? !!sc.children[0].geometry.getAttribute('uv') && sc.children[0].material.map != null : false, on: g.isOn() }; });
  ok(lib.n > 0 && lib.uv && lib.on, 'each overlay mesh has UVs and a texture map', JSON.stringify(lib));
  await shot(page, 'r47-01-textures');
  await page.evaluate(() => window.bimcraftLiveTex.on(false));
  ok(await page.evaluate(() => window.bimcraftLiveTex.info().meshes) === 0, 'switched off: flat colours again');
  await page.evaluate(() => window.bimcraftLiveTex.on(true));
  ok(await page.evaluate(() => window.bimcraftLiveTex.info().meshes) > 0, 'switched on again');
  await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer; v.vis.hide([...v.allKeys()]); v.applyVisibility(); });
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => window.bimcraftLiveTex.info().meshes) === 0, 'hide everything: the textures go with the elements');
  await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer; v.vis.showAll(); v.applyVisibility(); });
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => window.bimcraftLiveTex.info().meshes) > 0, 'show all: they come back');

  console.log('== EG.50 narration');
  await page.click('[data-toolbar] [data-saved-views]');
  await page.waitForSelector('[data-views-panel]');
  ok(await page.$$eval('[data-walk-narr]', (b) => b.length) === 1, 'the saved walk has a narration button');
  await page.click('[data-walk-narr="0"]');
  await page.waitForSelector('[data-narr-dialog][open]');
  await page.fill('[data-narr-script]', '0 Welcome to the house.\n3 The kitchen is on the right.\nThen we go up the stairs.');
  await page.fill('[data-narr-lang]', 'en-US');
  const [srt] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.click('[data-narr-srt]')]);
  const srtText = fs.readFileSync(await srt.path(), 'utf8');
  ok(srt.suggestedFilename().endsWith('.srt') && /00:00:00,000 --> /.test(srtText) && srtText.includes('The kitchen'), 'Subtitles (.srt) download with the cues', srt.suggestedFilename());
  await page.click('[data-narr-save]');
  await page.waitForFunction(() => !document.querySelector('[data-narr-dialog][open]'), null, { timeout: 10000 });
  ok(/Saved 3 lines of narration/.test(await page.textContent('[data-status]')), 'saved with the walk: ' + (await page.textContent('[data-status]')).trim());
  await page.evaluate(() => window.bimcraftNarration.reset());
  await page.click('[data-walk-play="0"]');
  await page.waitForSelector('[data-subtitle]', { timeout: 8000 });
  ok(/Welcome/.test(await page.textContent('[data-subtitle]')), 'playing the walk shows the first cue as a subtitle');
  await shot(page, 'r47-02-subtitle');
  await page.waitForFunction(() => window.bimcraftNarration.spoken.length >= 2, null, { timeout: 12000 }).catch(() => {});
  const spoken = await page.evaluate(() => window.bimcraftNarration.spoken);
  ok(spoken.length >= 2 && spoken[0].lang === 'en-US' && /kitchen/.test(spoken[1].text), 'the cues are spoken in turn, in the language', JSON.stringify(spoken.map((x) => x.t)));
  await page.keyboard.press('Escape');
  ok(await page.$$eval('[data-subtitle]', (b) => b.length) === 0, 'Esc stops it and clears the subtitle');
  await page.click('[data-views-close]');

  console.log('== Several models: the team button');
  ok(await page.$eval('[data-model-team]', (b) => b.hidden), 'a file not in the cloud has no "team models" button');

  console.log('== EG.20 Dimension the plan');
  await page.click('[data-model-toggle]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
  await page.evaluate(() => { document.querySelector('[data-annot-tools]').open = true; });
  await page.click('[data-autodim]');
  await page.waitForSelector('dialog[open] [data-autodim-go]');
  const say = await page.textContent('[data-autodim-say]');
  ok(/Will add 2 overall and \d+ row dimensions/.test(say), 'the dialog counts them first: ' + say.trim());
  await shot(page, 'r47-03-autodim-dialog');
  const before = await page.evaluate(() => document.querySelector('[data-change-list]')?.children.length ?? 0);
  await page.click('[data-autodim-go]');
  await settled();
  const dims = await page.evaluate(() => window.bimcraftPlan.state.data && document.querySelectorAll('[data-change-list] li').length);
  ok(/Added \d+ dimensions in one step/.test(await page.textContent('[data-status]')), 'added: ' + (await page.textContent('[data-status]')).trim());
  const after = await page.evaluate(() => document.querySelector('[data-change-list]')?.children.length ?? 0);
  ok(after === before + 1, 'one entry in the change list = one undo step', before + ' -> ' + after + ' ' + dims);
  await shot(page, 'r47-04-dimensions');
  await page.evaluate(() => { document.querySelector('[data-annot-tools]').open = true; });
  await page.click('[data-autodim]');
  await page.waitForSelector('dialog[open] [data-autodim-say]');
  ok(/already dimensioned/.test(await page.textContent('[data-autodim-say]')), 'asked again: everything is already dimensioned');
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.activeElement?.blur?.()); await page.mouse.move(10, 10);
  await page.keyboard.press('Control+z');
  await settled();
  await page.evaluate(() => { document.querySelector('[data-annot-tools]').open = true; });
  await page.click('[data-autodim]');
  await page.waitForSelector('dialog[open] [data-autodim-say]');
  ok(/Will add 2 overall/.test(await page.textContent('[data-autodim-say]')), 'Ctrl+Z took the whole set back');
  await page.keyboard.press('Escape');

  console.log('== Infrastructure quantities');
  await page.click('[data-model-toggle]');
  await page.evaluate(() => { document.querySelector('[data-qto-details]').open = true; });
  await page.evaluate(() => window.bimcraftQto.set({ view: 'infra' }));
  await page.waitForSelector('[data-qto-infra]');
  ok(await page.$('[data-qto-noinfra]') !== null, 'an architectural model says it has no infrastructure classes');
} catch (e) {
  fail++; console.log('  FAIL ' + (e.message || e).split('\n')[0]);
} finally {
  const real = problems.filter((p) => !/favicon|api\/v1\/hardware|status of 429/.test(p));
  ok(real.length === 0, 'no console errors' + (real.length ? ': ' + real.slice(0, 4).join(' | ') : ''));
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'down', 'bimr47'], { stdio: 'ignore' }); } catch (e) { /* none */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * layout-shots.mjs — one screenshot per app and layout, a document open, for looking at layouts side by side (no checks).
 *   node tools/workspace-test/layout-shots.mjs --layouts pro-cad1,pro-cad2 [--apps a,b] [--out dir] [--theme paper|model] [--size 1600x950] [--hide-staff]
 * Prints, per shot, the layout that mounted, the engine's notes and any console error.
 */
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const APPS = arg('--apps', 'cadcraft,bimcraft,modelcraft,markupcraft,takeoffcraft,civilcraft,detailcraft,partcraft').split(',');
const LAYOUTS = arg('--layouts', 'docked').split(','), OUT = arg('--out', path.join(REPO, 'tmp/layout-shots')), THEME = arg('--theme', '');
const HIDE_STAFF = process.argv.includes('--hide-staff');   // for pictures that are published: no staff panel tab over the corner
const [W, H] = arg('--size', '1600x950').split('x').map(Number);
fs.mkdirSync(OUT, { recursive: true });
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimres'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const slug of APPS) for (const layout of LAYOUTS) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', (e) => errors.push('pageerror ' + e.message)); page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errors.push('console ' + m.text()); });
  await page.goto('https://getcadcraft.com/lab/' + slug + (THEME ? '?space=' + THEME : ''), { waitUntil: 'networkidle' });
  await page.evaluate(([l, HIDE]) => { try { localStorage.setItem('cc-workspace', l); localStorage.setItem('cc-autofocus', 'off'); localStorage.setItem('cc-tours', 'off'); localStorage.setItem('cc-newhere', 'done'); if (HIDE) localStorage.setItem('cc-fit', 'never'); if (HIDE) localStorage.setItem('cc-hint-closed:' + location.pathname.split('/')[2], '1'); } catch (e) {} }, [layout, HIDE_STAFF]);
  await page.reload({ waitUntil: 'networkidle' });
  for (let i = 0; i < 10; i++) { const d = await page.$('dialog[data-autosave-dialog][open] [data-autosave-discard]'); if (!d) break; await d.click().catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForSelector('main.ws-on', { timeout: 15000 }).catch(() => {});
  const hooks = await import(pathToFileURL(path.join(REPO, 'tools/workspace-test/apps', slug + '.mjs')).href).catch(() => ({}));
  if (hooks.prepare) await hooks.prepare(page).catch((e) => errors.push('prepare ' + e.message));
  if (HIDE_STAFF) await page.addStyleTag({ content: '.staff-panel,[data-staff-panel],#staff-panel{display:none!important}' });
  await page.waitForTimeout(2200);
  const info = await page.evaluate(() => ({ layout: document.querySelector('main')?.dataset.wsLayout || null, notes: window.ccWorkspaceEngine?.notes?.() || [] }));
  await page.screenshot({ path: path.join(OUT, slug + '-' + layout + (THEME ? '-' + THEME : '') + '.png') });
  console.log(slug + ' ' + layout + ': mounted ' + info.layout + (info.notes.length ? ' | notes: ' + info.notes.join('; ') : '') + (errors.length ? ' | ERRORS: ' + errors.slice(0, 3).join(' | ') : ''));
  await page.evaluate(() => { try { localStorage.removeItem('cc-workspace'); } catch (e) {} }); await ctx.close();
}
await browser.close();

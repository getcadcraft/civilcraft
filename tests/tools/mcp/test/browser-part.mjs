#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-part.mjs — PartCraft's assistant tools in a real /lab/partcraft window (0.7 AS.4; session assistants).
 *
 *   node tools/mcp/test/browser-part.mjs [--shots <dir>] [--verbose]      (run as root)
 *
 * Studio stood in (studio-stand-in.mjs). On an ISO 4017 screw made by PartCraft's own standard-part template: Settings ›
 * PartCraft has Assistants (host.js), the tools listed, part_describe / features_list / params_list, param_set (rebuilt
 * longer, one undo step the person's Ctrl+Z takes back), mass_properties, script_run in the Script workspace's sealed worker
 * (CraftScript seeing part() and param()), part_export to a path (STL, faceted STEP), part_save to a path, and no console
 * errors. Own test admin partcrafttest+cadcraft@projectz.xyz (tools/partcraft-test/admin.php up|down).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..', '..');
const { studioStandIn } = await import(pathToFileURL(path.join(REPO, 'tools/mcp/test/studio-stand-in.mjs')).href);
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
const VERBOSE = args.includes('--verbose');
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + (typeof extra === 'string' ? extra : JSON.stringify(extra)).slice(0, 500) : '')); } };

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-part-'));
const JOB = path.join(TMP, 'parts');
fs.mkdirSync(JOB);
const DEV = pathToFileURL(path.join(REPO, 'public_html/assets/apps/partcraft/dev/')).href;
const I = await import(DEV + 'i18n.js'); I.init({ strings: JSON.parse(fs.readFileSync(new URL('lang/en.json', DEV), 'utf8')) });
const STD = await import(DEV + 'stdparts.js'), PJ = await import(DEV + 'part.js');
const TID = STD.TEMPLATES[0].id;
const SCREW = PJ.toJSON(STD.makeTemplate(TID, STD.templateSizes(TID)[2]));

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/partcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const S = await studioStandIn(page, { app: 'partcraft', folder: JOB });
const text = (r) => (r && r.content && r.content[0] && r.content[0].text) || '';
const sc = (r) => (r && r.structuredContent) || {};

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/partcraft?space=paper', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { try { localStorage.removeItem('cadcraft.assistants.partcraft'); } catch { /* fine */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.partcraft);
  await page.evaluate(() => window.partcraft.ready);
  await page.evaluate((txt) => window.partcraft.openText(txt, 'screw.partcraft.json'), SCREW);
  await page.waitForFunction(() => window.partcraft.part.features.length === 4 && !!window.partcraft.regen?.mesh, null, { timeout: 30000 });

  console.log('\n== Settings › PartCraft › Assistants');
  await page.click('[data-settings-open]');
  await page.waitForSelector('[data-app-settings][open]');
  const tab = await page.$('[data-app-settings] [role="tab"]');
  if (tab) await tab.click();
  ok(await page.evaluate(() => !!document.querySelector('[data-assistants-settings] [data-assist-on]')), 'PartCraft\'s Settings has Assistants (host.js), off');
  // Since 0.7 (data-shell-07) the dialog shows one section at a time: pick Assistants in the list on the left, as a person would.
  const { showSetting } = await import(pathToFileURL(path.join(REPO, 'tools/shell-test/show-setting.mjs')).href);
  await showSetting(page, '[data-assist-on]');
  await page.click('[data-assist-on]');
  for (const g of ['edit', 'save', 'export']) await page.click('[data-assist-group="' + g + '"]');
  await page.click('[data-assist-folder-add]');
  await wait(400);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'part-01-settings.png') });
  await page.keyboard.press('Escape');

  console.log('\n== the tools');
  const names = (await S.rpc('tools/list', {})).result.tools.map((t) => t.name);
  ok(['app_info', 'part_describe', 'features_list', 'params_list', 'mass_properties', 'param_set', 'undo', 'script_run', 'part_export', 'part_save', 'files_list'].every((n) => names.includes(n)), 'PartCraft lists its tools and files_list', names);
  let r = await S.call('part_describe', {});
  const l0 = sc(r).solid ? sc(r).solid.bbox.max[1] - sc(r).solid.bbox.min[1] : null;
  ok(!r.isError && sc(r).features === 4 && sc(r).material?.name === 'Steel' && sc(r).failing.length === 0 && l0 > 0, 'part_describe: the screw, steel, nothing failing', r);
  r = await S.call('params_list', {});
  const l = sc(r).variables?.find((v) => v.name === 'l');
  ok(!r.isError && l && l.value > 0, 'params_list: l = ' + (l && l.value), r);
  r = await S.call('param_set', { name: 'l', value: l.value + 25 });
  const len = await page.evaluate(() => { const b = window.partcraft.regen.stats.bbox; return b.max[1] - b.min[1]; });
  ok(!r.isError && Math.abs(len - (l0 + 25)) < 1e-6 && sc(r).undo === 'Assistant: set l = ' + (l.value + 25), 'param_set l + 25: the window rebuilt it 25 mm longer, one undo step', { r: sc(r), len });
  const top = await page.evaluate(() => window.partcraft.hist.undoStack.at(-1)?.label);
  ok(top === 'Assistant: set l = ' + (l.value + 25), 'the undo list names the assistant\'s step', top);
  r = await S.call('mass_properties', {});
  ok(!r.isError && Math.abs(sc(r).mass - sc(r).volume * 7.85 / 1000) < 1e-6, 'mass_properties in the window', r);
  r = await S.call('script_run', { source: "m = part();\ndisp(param('l') * 2)\n" });
  ok(!r.isError && sc(r).ok && sc(r).printed.join(' ').includes(String((l.value + 25) * 2)), 'script_run in the Script workspace\'s worker: part() and param() (l × 2)', r);
  r = await S.call('part_export', { format: 'stl', path: 'screw.stl' });
  const stl = fs.existsSync(path.join(JOB, 'screw.stl')) ? fs.readFileSync(path.join(JOB, 'screw.stl')) : Buffer.alloc(0);
  ok(!r.isError && stl.length > 84 && stl.length === 84 + 50 * stl.readUInt32LE(80), 'part_export STL to a path', r);
  r = await S.call('part_export', { format: 'step', path: 'screw.step' });
  ok(!r.isError && /^ISO-10303-21;/.test(fs.readFileSync(path.join(JOB, 'screw.step'), 'utf8')) && /Faceted/.test(sc(r).note), 'part_export STEP (faceted, said) to a path', r);
  r = await S.call('part_export', { format: 'usdz', path: 'screw.usdz' });   // 0.7 AS.6
  ok(!r.isError && fs.existsSync(path.join(JOB, 'screw.usdz')) && fs.readFileSync(path.join(JOB, 'screw.usdz')).subarray(0, 2).toString() === 'PK', 'part_export USDZ to a path', r);
  r = await S.call('part_save', { path: 'screw.partcraft.json' });
  ok(!r.isError && JSON.parse(fs.readFileSync(path.join(JOB, 'screw.partcraft.json'), 'utf8')).features.length === 4, 'part_save to a path', r);
  await page.evaluate(() => window.partcraft.undoRedo(true));
  await page.evaluate(() => window.partcraft.built());
  const back = await page.evaluate(() => { const b = window.partcraft.regen.stats.bbox; return b.max[1] - b.min[1]; });
  ok(Math.abs(back - l0) < 1e-6, 'the person\'s Ctrl+Z takes the assistant\'s change back');
  r = await S.call('param_set', { name: 'Extrude1.depth', value: 9 });
  ok(r.isError && /driven by the equation/.test(text(r)), 'a driven number is refused, naming its equation');
  ok(!S.dialogs.includes('save'), 'no save dialog was opened for the assistant', S.dialogs);
  ok(!problems.length, 'no console errors', problems.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL ' + (e && e.stack || e));
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch { /* fine */ }
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

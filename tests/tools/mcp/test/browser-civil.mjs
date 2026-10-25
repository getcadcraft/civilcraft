#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-civil.mjs — CivilCraft's assistant tools in a real /lab/civilcraft window (0.7 AS.3; session assistants).
 *
 *   node tools/mcp/test/browser-civil.mjs [--shots <dir>] [--verbose]      (run as root)
 *
 * Studio stood in (studio-stand-in.mjs). Checks Settings › CivilCraft › Assistants (Save and Export, the Folders list),
 * the tools listed by permission, points_add (one undo step, the plan redraws), surface_volume, profile_sample,
 * landxml_export to a path — the same LandXML as the app's own Export › LandXML button (dates aside) —, dwg_export to a
 * path (the app's own DWG), project_save to a path, a path outside the folder refused, and no console errors.
 * Own test admin civilcrafttest-asst+cadcraft@projectz.xyz (tools/civilcraft-test/admin.php up|down asst).
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

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-civil-'));
const JOB = path.join(TMP, 'site'), OUT = path.join(JOB, 'out');
fs.mkdirSync(OUT, { recursive: true });
const CSV = fs.readFileSync(path.join(REPO, 'tools/civilcraft-test/site-topo.csv'), 'utf8');

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/civilcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up', 'asst'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const S = await studioStandIn(page, { app: 'civilcraft', folder: JOB });
const text = (r) => (r && r.content && r.content[0] && r.content[0].text) || '';
const sc = (r) => (r && r.structuredContent) || {};
const undated = (x) => x.replace(/\s(date|time)="[^"]*"/g, '');

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { try { localStorage.removeItem('civilcraft.settings'); localStorage.removeItem('cadcraft.assistants.civilcraft'); } catch { /* fine */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.civilcraft && !!window.civilcraftControl);
  await page.evaluate((csv) => { window.civilcraft.openText(csv, 'site-topo.csv'); }, CSV);
  await page.click('[data-imp-ok]');   // the points import dialog, as a person confirms it
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276, null, { timeout: 30000 });

  console.log('\n== Settings › CivilCraft › Assistants');
  await page.click('[data-settings-open]');
  await page.waitForSelector('[data-app-settings][open]');
  const tab = await page.$('[data-app-settings] [role="tab"]');
  if (tab) await tab.click();
  const set0 = await page.evaluate(() => ({ save: !!document.querySelector('[name="cvAssistSave"]'), exp: !!document.querySelector('[name="cvAssistExport"]'), folders: !!document.querySelector('[data-assistants-folders] [data-assist-folder-add]'), head: document.querySelector('[data-assistants-folders] [data-assist-folders-head]')?.textContent }));
  ok(set0.save && set0.exp && set0.folders && set0.head === 'Folders it may use', 'Save and Export ticks and the Folders list are there (Studio)', set0);
  for (const n of ['cvAssist', 'cvAssistEdit', 'cvAssistSave', 'cvAssistExport']) await page.check('[name="' + n + '"]');
  await page.click('[data-assistants-folders] [data-assist-folder-add]');
  await wait(400);
  const st = await page.evaluate(() => ({ groups: window.civilcraftControl.groups, folders: window.civilcraftControl.folders, listed: [...document.querySelectorAll('[data-assistants-folders] .shell-assist-folder-path')].map((x) => x.textContent) }));
  ok(st.groups.join() === 'read,edit,save,export' && st.folders.join() === JOB && st.listed.join() === JOB, 'all four groups on; the folder added through Studio\'s dialog', st);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'civil-01-settings.png') });
  await page.keyboard.press('Escape');

  console.log('\n== the tools');
  const names = (await S.rpc('tools/list', {})).result.tools.map((t) => t.name);
  ok(['site_describe', 'parcels_list', 'surface_volume', 'profile_sample', 'points_add', 'project_save', 'landxml_export', 'dwg_export', 'files_list'].every((n) => names.includes(n)), 'CivilCraft lists the 0.7 tools and files_list', names);
  const n0 = await page.evaluate(() => window.civilcraft.project.points.length);
  let r = await S.call('points_add', { points: [{ n: 'CP1', x: 6150200, y: 2080150, z: 101.5, d: 'CTRL' }] });
  const n1 = await page.evaluate(() => window.civilcraft.project.points.length);
  ok(!r.isError && n1 === n0 + 1 && sc(r).undo === 'Assistant: add points', 'points_add: one more point in the window, one undo step', r);
  await page.evaluate(() => window.civilcraft.project.undo());
  ok((await page.evaluate(() => window.civilcraft.project.points.length)) === n0, 'the person\'s undo takes it back');
  r = await S.call('surface_volume', { datum: 0 });
  ok(!r.isError && sc(r).cut > 0 && sc(r).unit === 'cu yd', 'surface_volume against a datum', r);
  r = await S.call('landxml_export', { path: 'out/tool.xml' });
  ok(!r.isError && fs.existsSync(path.join(OUT, 'tool.xml')), 'landxml_export to a path in the folder', r);
  await page.evaluate((p) => window.civilcraftControl.files.into(p, async () => window.civilcraft.command('landxml')), path.join(OUT, 'button.xml'));
  const a = fs.readFileSync(path.join(OUT, 'tool.xml'), 'utf8'), b = fs.existsSync(path.join(OUT, 'button.xml')) ? fs.readFileSync(path.join(OUT, 'button.xml'), 'utf8') : '';
  ok(b.length > 1000 && undated(a) === undated(b), 'the tool\'s LandXML is the app\'s own Export › LandXML, byte for byte but the dates', { a: a.length, b: b.length });
  r = await S.call('dwg_export', { path: 'out/site.dwg', version: '2013' });
  ok(!r.isError && fs.readFileSync(path.join(OUT, 'site.dwg')).subarray(0, 6).toString() === 'AC1027', 'dwg_export: the app\'s own DWG, 2013 (AC1027), written to the path', r);
  r = await S.call('usd_export', { path: 'out/site-3d.usdz' });   // 0.7 AS.6
  ok(!r.isError && fs.existsSync(path.join(OUT, 'site-3d.usdz')) && fs.readFileSync(path.join(OUT, 'site-3d.usdz')).subarray(0, 2).toString() === 'PK', 'usd_export: the site in 3D as .usdz, written to the path', r);
  r = await S.call('project_save', { path: 'site.civilcraft.json' });
  ok(!r.isError && JSON.parse(fs.readFileSync(path.join(JOB, 'site.civilcraft.json'), 'utf8')).points.length === 276, 'project_save to a path: the project file', r);
  r = await S.call('landxml_export', { path: path.join(TMP, 'elsewhere.xml') });
  ok(r.isError && /outside the folders/.test(text(r)) && !fs.existsSync(path.join(TMP, 'elsewhere.xml')), 'a path outside the folder is refused', r);
  ok(!S.dialogs.includes('save'), 'no save dialog was opened for the assistant', S.dialogs);
  ok(!problems.length, 'no console errors', problems.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL ' + (e && e.stack || e));
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'asst']); } catch { /* fine */ }
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

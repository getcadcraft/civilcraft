#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-water.mjs — 0.8 round 3 (civil_PART_3), LC.16 rest + CV.2: the water mains showcase file opened in the lab, a hydrant and a valve added through Properties,
 * the fittings schedule, and the mains on the DXF plan (C-WATR-MAIN …) at https://getcadcraft.com/lab/civilcraft.
 *   node tools/civilcraft-test/browser-water.mjs [--out <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const OUT = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? process.argv[i + 1] : path.join(REPO, 'tmp/shots/civilcraft-water'); })();
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cwl'], { encoding: 'utf8' }) || '{}');
admin('up');
const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project && window.civilcraft.command);

  const file = path.join(REPO, 'fixtures/showcase/civilcraft-water-mains.civilcraft.json');
  await page.evaluate(async (text) => { await window.civilcraft.openText(text, 'civilcraft-water-mains.civilcraft.json'); }, fs.readFileSync(file, 'utf8'));
  await page.waitForFunction(() => window.civilcraft.project.state.water?.nodes?.length === 14, null, { timeout: 30000 });
  ok(true, 'the showcase file opens: 14 nodes, ' + await page.evaluate(() => window.civilcraft.project.state.water.fittings.length) + ' fittings');
  // pick a junction with no hydrant and give it one through Properties
  const target = await page.evaluate(() => { const w = window.civilcraft.project.state.water, has = new Set(w.fittings.filter((f) => f.kind === 'hydrant').map((f) => f.host.node)); return w.nodes.find((n) => n.kind === 'junction' && !has.has(n.id)).id; });
  await page.evaluate((id) => window.civilcraft.select({ kind: 'wnode', id }), target);
  await page.waitForSelector('[data-wm-hydrant]');
  const n0 = await page.evaluate(() => window.civilcraft.project.state.water.fittings.filter((f) => f.kind === 'hydrant').length);
  await page.check('[data-wm-hydrant]');
  const n1 = await page.evaluate(() => window.civilcraft.project.state.water.fittings.filter((f) => f.kind === 'hydrant').length);
  ok(n1 === n0 + 1, 'ticking Hydrant adds one (' + n0 + ' → ' + n1 + ')');
  await page.evaluate(() => window.civilcraft.project.undo());
  ok(await page.evaluate(() => window.civilcraft.project.state.water.fittings.filter((f) => f.kind === 'hydrant').length) === n0, 'one undo takes it back');
  // a valve on a main
  await page.evaluate(() => window.civilcraft.select({ kind: 'wpipe', id: 'wp5' }));
  await page.waitForSelector('[data-wm-valves]');
  await page.selectOption('[data-wm-fit-kind]', 'airvalve');
  const f0 = await page.evaluate(() => window.civilcraft.project.state.water.fittings.length);
  await page.click('[data-wm-fit-add]');
  ok(await page.evaluate(() => window.civilcraft.project.state.water.fittings.length) === f0 + 1 && !!(await page.$('[data-wm-fit]')), 'Add at the middle puts an air valve on the main and shows its chip');
  // the schedule
  await page.evaluate(() => window.civilcraft.command('water'));
  await page.waitForSelector('[data-wm-schedule]');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-wm-schedule]')]);
  const csv = fs.readFileSync(await dl.path(), 'utf8');
  ok(/Item,Size,Count,Length/.test(csv) && /Pipe,200 mm,/.test(csv) && /Hydrant/.test(csv) && /Tee/.test(csv), 'the fittings schedule downloads: ' + csv.split('\r\n').slice(1, 4).join(' | '));
  await page.evaluate(() => document.querySelectorAll('[data-eg-dialog][open],dialog[open]').forEach((d) => d.close()));
  // the plan as DXF carries the water layers
  const [dxf] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => window.civilcraft.command('dxf'))]);
  const text = fs.readFileSync(await dxf.path(), 'utf8');
  ok(/C-WATR-MAIN/.test(text) && /C-WATR-HYDR/.test(text) && /C-WATR-VALV/.test(text), 'the DXF plan has C-WATR-MAIN, C-WATR-HYDR and C-WATR-VALV');
  ok((text.match(/\n C-WATR-MAIN\n/g) || text.match(/C-WATR-MAIN/g) || []).length >= 19, 'one line for each of the 19 mains');
  await page.screenshot({ path: path.join(OUT, 'water.png') });
  ok(problems.length === 0, 'no console errors', problems);
} finally { await browser.close(); }
console.log('\n' + pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);

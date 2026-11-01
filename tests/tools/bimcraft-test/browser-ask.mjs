#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-ask.mjs — talk to the building (0.8 AC.8), session bim_PART_2, in the lab: headless, real clicks.
 *   node tools/bimcraft-test/browser-ask.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session sxtags), so the shared admin-login
 * throttle is never touched. Fails on any console error. Opens the showcase house (fixtures/showcase/bimcraft-house.ifc).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const HOUSE = path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc');
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimask'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const status = () => page.textContent('[data-status]');
const download = async (fn) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), fn()]); return { name: dl.suggestedFilename(), bytes: fs.readFileSync(await dl.path()) }; };

try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', HOUSE);
  await waitStatus(/^Opened /, 90000);
  await page.evaluate(() => window.bimcraftControl.configure({ enabled: true, groups: ['read'] }));
  const rpc = (method, params, id = 1) => page.evaluate(([m, p, i]) => window.bimcraftControl.handle({ jsonrpc: '2.0', id: i, method: m, params: p }, 'ask-session', { name: 'Test assistant', version: '1' }), [method, params, id]);
  const call = (name, args) => rpc('tools.call', { name, arguments: args });
  const sel = () => page.evaluate(() => document.querySelector('[data-canvas]').viewer.selection.size);
  const r0 = await rpc('tools.list', {});
  const names = (r0.result?.tools || []).map((x) => x.name);
  ok(['walls_find', 'rooms_find', 'elements_above_find'].every((n) => names.includes(n)), 'the three questions are tools an assistant can list');

  console.log('== "which rooms are under 200 square feet?"');
  let r = await call('rooms_find', { under: 200, unit: 'sqft' });
  const v = r.result?.structuredContent;
  ok(!r.result?.isError && v?.total === 2 && v.rooms_found.map((x) => x.number).join() === '105,103', 'rooms 105 and 103', JSON.stringify(r).slice(0, 220));
  ok(/found and selected/.test(await status()), 'the status line says so: ' + await status());
  await shot(page, 'ask-rooms');

  console.log('== "show me every 2-hour wall" (this house has no ratings)');
  r = await call('walls_find', { hours: 2 });
  ok(r.result?.isError && /FireRating/.test(JSON.stringify(r)), 'it says there is no FireRating property and what to do next');

  console.log('== "what\'s above this slab?"');
  const slabs = await page.evaluate(() => window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcSlab' }]));
  let a = null;
  for (const slab of slabs) {   // the first slab with anything over it (the roof slab has nothing)
    r = await call('elements_above_find', { id: slab, within_m: 4 });
    a = r.result?.structuredContent;
    if (a?.total > 0) break;
  }
  ok(!r.result?.isError && a?.total > 0 && (await sel()) === a.total, (a?.total ?? 'no') + ' elements above a slab, all selected in the view (' + await sel() + ')', JSON.stringify(r).slice(0, 200));
  await shot(page, 'ask-above');
  const log = await page.evaluate(() => window.bimcraftControl.log.map((e) => e.tool + ':' + e.outcome));
  ok(log.some((l) => l.startsWith('rooms_find')) && log.some((l) => l.startsWith('elements_above_find')), 'the activity list shows the calls: ' + log.join(', '));
} catch (e) {
  ok(false, 'ran to the end', e.message);
}
ok(problems.length === 0, 'no console errors', problems.slice(0, 5).join(' | '));
await browser.close();
console.log(fail ? `\n${pass} ok, ${fail} FAILED` : `\nall ok (${pass})`);
process.exit(fail ? 1 : 0);

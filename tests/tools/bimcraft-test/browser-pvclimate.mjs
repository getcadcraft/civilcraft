#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-pvclimate.mjs — Live NASA POWER and PVGIS calls from the page (0.8 EG.15), session bim-analysis_PART_4, in the lab: headless, real clicks.
 *   node tools/bimcraft-test/browser-people.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin. Fails on any console error. Opens the showcase house.
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimpvclimate'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
await ctx.addInitScript(() => { try { localStorage.setItem('bimcraft.model.units', 'm'); } catch (e) { /* none */ } });   // GH.3-A: results follow the display unit; these checks read metres
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const status = () => page.textContent('[data-status]');

try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  const csp = await page.evaluate(() => document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || '');
  console.log('  csp meta:', csp.slice(0, 160) || '(none in a meta tag)');
  for (const [prov, lat, lon] of [['nasa', 48.14, 11.58], ['pvgis', 48.14, 11.58], ['nasa', -33.9, 18.4]]) {
    const r = await page.evaluate(async ([prov, lat, lon]) => {
      const m = await import('/assets/apps/bimcraft/dev/data-packs.js');
      const got = await m.fetchClimate(prov, lat, lon, { store: null, refresh: true });
      return { ok: got.ok, from: got.from, error: got.error, ghi: got.climate?.ghi, tAmb: got.climate?.tAmb, src: got.climate?.source };
    }, [prov, lat, lon]);
    if (prov === 'pvgis') { ok(!r.ok, 'pvgis ' + lat + ',' + lon + ': the browser is refused the answer by CORS, as measured on 2026-10-30 (' + r.error + '); if this ever passes, set direct: true on PROVIDERS.pvgis'); continue; }
    ok(r.ok && r.from === 'network' && r.ghi?.length === 12 && r.tAmb?.length === 12, prov + ' ' + lat + ',' + lon + ': ' + (r.ok ? '12 monthly values, GHI ' + r.ghi.map((v) => v.toFixed(1)).join(' ') : 'failed (' + r.error + ')'), JSON.stringify(r).slice(0, 200));
    if (r.ok) {
      const north = lat > 0, summer = north ? [4, 5, 6, 7] : [10, 11, 0, 1], winter = north ? [10, 11, 0, 1] : [4, 5, 6, 7];
      const avg = (a) => a.reduce((s, i) => s + r.ghi[i], 0) / a.length;
      ok(avg(summer) > 2 * avg(winter), prov + ' ' + lat + ': summer months well above winter (' + avg(summer).toFixed(1) + ' vs ' + avg(winter).toFixed(1) + ' kWh/m2/day)');
    }
  }
} finally { await browser.close(); }
ok(problems.every((p) => /re\.jrc\.ec\.europa\.eu|ERR_FAILED/.test(p)), 'no console errors other than the expected PVGIS CORS refusal', problems.slice(0, 3).join(' | '));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

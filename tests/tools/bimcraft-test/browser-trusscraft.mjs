#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-trusscraft.mjs — the TrussCraft add-on in the lab, headless (0.8 round 4, roadmap DC.116).
 *   node tools/bimcraft-test/browser-trusscraft.mjs        (run as root; BimCraft's test admin, tools/bimcraft-test/admin.php up|down)
 * The showcase house opened; the add-on switched on; its panel lists the model's roofs; Design one truss draws the elevation; Lay out puts trusses on the roof and
 * shows the 3D view; Place writes IfcMembers (one undo step); the Problems carry the not-a-design label. Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 240) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/frame/admin.php'), cmd], { encoding: 'utf8' }));   // a signed-in lab session, minted in-process (no login throttle)
const SESSION = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text() + ' ' + (m.location().url || '')); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
try {
  const ck = SESSION.cookie.split('=');
  await ctx.addCookies([{ name: ck[0], value: ck.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('cc-addons:bimcraft'); Object.keys(localStorage).filter((k) => k.startsWith('cc-addon:bimcraft:trusscraft')).forEach((k) => localStorage.removeItem(k)); } catch { /* */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', { name: 'bimcraft-house.ifc', mimeType: 'application/x-step', buffer: fs.readFileSync(path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc')) });
  await page.waitForFunction(() => /^Opened bimcraft-house/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 120000 });
  // step 3: Settings › General › Add-ons › TrussCraft, by clicking (no script shortcut)
  await page.keyboard.press('Control+Comma');
  await page.waitForSelector('dialog[open]');
  await page.waitForSelector('dialog[open] [data-settings-tab="general"]', { state: 'attached', timeout: 15000 });
  await page.evaluate(() => document.querySelector('dialog[open] [data-settings-tab="general"]').click());
  await page.locator('dialog[open] >> text=/^Add-ons$/').first().click({ timeout: 5000 }).catch(() => {});
  const state0 = await page.evaluate(() => document.querySelector('li.shell-addon[data-addon="trusscraft"]')?.dataset.state);
  ok(state0 === 'off', 'Settings › Add-ons lists TrussCraft, off by default (data-state ' + state0 + ')');
  await page.check('[data-addon-toggle="trusscraft"]', { timeout: 10000 });
  await page.waitForFunction(() => document.querySelector('li.shell-addon[data-addon="trusscraft"]')?.dataset.state === 'active', null, { timeout: 20000 });
  ok(true, 'ticking it in Settings switches it on');
  await page.keyboard.press('Escape');
  await page.waitForSelector('[data-rtab="addon-trusscraft-trusses"]', { timeout: 20000 });
  await page.click('[data-rtab="addon-trusscraft-trusses"]');
  await page.waitForSelector('[data-trs-label]', { state: 'attached', timeout: 20000 });
  const label = await page.textContent('[data-trs-label]');
  ok(/Not a substitute for engineered truss design/.test(label), 'step 4: the Trusses tab carries the not-a-design label', label);
  const loadsLabel = await page.textContent('[data-trs-loads-label]');
  const nums = async () => page.$$('.trs-loads input[type=number]');
  const setNum = async (i, v) => { const el = (await nums())[i]; await el.fill(String(v)); await el.dispatchEvent('change'); };
  ok(/YOURS/.test(loadsLabel) && (await page.$eval('.trs-loads', (n) => n.hasAttribute('open'))), 'step 5: the Loads and combinations section is open with its label (your numbers, no code table)');
  const wind0 = await page.$eval('.trs-loads', (n) => [...n.querySelectorAll('input[type=number]')].slice(4, 7).map((i) => i.value).join('|'));
  ok(wind0 === '0|0|0', 'wind, leeward and uplift start at zero (' + wind0 + ')');
  // EXAMPLE numbers to try the wind and uplift combinations (not from any standard)
  await setNum(4, 0.5); await setNum(5, -0.3); await setNum(6, 0.6);
  await setNum(15, 1);    // Wind row: wind factor 1
  await setNum(21, 1);    // Uplift row: uplift factor 1 (dead factor left at 0)
  const roofs = await page.$$eval('select option', (o) => o.map((x) => x.textContent).filter((t) => /°\)/.test(t)));
  ok(roofs.length >= 1, 'step 6: the panel lists the roof(s) of the model: ' + roofs.join(' | '), roofs);
  await page.click('button:has-text("Design one truss")');
  await page.waitForSelector('[data-trs-drawing] svg', { timeout: 15000 });
  const dwg = await page.textContent('[data-trs-drawing]');
  ok(/Span \d+ mm/.test(dwg) && /Not a substitute/.test(dwg), 'Design one truss draws the elevation with its dimensions and the label');
  await page.selectOption('select:has(option:has-text("°)"))', { index: 1 });
  await page.selectOption('select:has(option:has-text("Step-down trusses"))', 'girder');
  await page.click('button:has-text("Lay out on the roof")');
  await page.waitForSelector('[data-trs-3d] svg', { timeout: 30000 });
  const say = await page.textContent('.trs-say');
  ok(/Set: .*girder/.test(say) && /distinct designs/.test(say), 'Lay out on the roof with the girder method: ' + say.split('\n').pop(), say);
  const rows = await page.$$eval('[data-trs-set] tbody tr', (n) => n.map((r) => r.textContent.replace(/\s+/g, ' ').trim()));
  ok(rows.some((r) => /^Girder truss/.test(r)) && rows.some((r) => /^Jack truss/.test(r)) && rows.some((r) => /^Corner jack/.test(r)), 'step 7: the set table lists girder, jack and corner jack trusses: ' + rows.slice(0, 4).join(' | '), rows);
  await page.click('[data-trs-set] tbody tr:has-text("Girder truss")');
  await page.waitForSelector('[data-trs-drawing] svg');
  const g = await page.textContent('[data-trs-drawing]');
  ok(/Truss elevation: girder/.test(g) && /kN/.test(g), 'clicking the girder row draws its elevation with member forces');
  const lines = await page.$$eval('[data-trs-3d] svg line', (n) => n.length);
  ok(lines > 100, 'the 3D view draws the whole set (' + lines + ' lines)');
  await page.fill('[data-trs-3d] input[type=range] >> nth=0', '120');
  const probs = await page.evaluate(() => (window.ccProblems ? window.ccProblems.store.list({}).map((p) => (p.source && p.source.name) + '|' + p.code + '|' + p.severity) : null));
  ok(Array.isArray(probs) && probs.some((x) => /trusscraft\|notdesign\|warning$/.test(x)) && probs.some((x) => /trusscraft\|defaults\|note$/.test(x)), 'the not-a-design label and the defaults note are in the shell\'s Problems', probs && probs.slice(0, 6));
  ok(probs.some((x) => /trusscraft\|uplift\|warning$/.test(x)) && probs.some((x) => /trusscraft\|bearing\|note$/.test(x)) && probs.some((x) => /trusscraft\|bracing\|note$/.test(x)), 'your uplift combination gives an uplift warning; bearings and the bracing checklist are Problems', probs.map((x) => x.split('|')[1]).filter((v, i, a) => a.indexOf(v) === i));
  ok(probs.some((x) => /trusscraft\|(endzone|smalljacks)\|warning$/.test(x)), 'what the hip end could not make is a Problem (endzone / smalljacks)');
  // step 8: your own plate table, then your own species table with an Fb
  await page.setInputFiles('.trs-plates input[type=file]', path.join(REPO, 'fixtures/trusscraft/example-plates.csv'));
  await page.waitForFunction(() => /Your table/.test(document.querySelector('[data-trs-plates]')?.textContent || ''), null, { timeout: 15000 });
  ok(/TEST FILE/.test(await page.textContent('[data-trs-plates]')), 'step 8: the plate table loads and the panel names it');
  await page.click('button:has-text("Lay out on the roof")');
  await page.waitForSelector('[data-trs-3d] svg', { timeout: 30000 });
  const dflt = await page.evaluate(() => window.ccProblems.store.list({}).find((p) => /trusscraft/.test(p.source && p.source.name) && p.code === 'defaults')?.text || '');
  ok(/TEST FILE/.test(dflt), 'the joint plates now come from your table (the defaults note names it)');
  await page.setInputFiles('.trs-timber input[type=file]', path.join(REPO, 'fixtures/trusscraft/example-species.csv'));
  await page.waitForFunction(() => /1 species loaded/.test(document.querySelector('.trs-say')?.textContent || ''), null, { timeout: 15000 });
  await page.click('button:has-text("Lay out on the roof")');
  await page.waitForSelector('[data-trs-3d] svg', { timeout: 30000 });
  const probs2 = await page.evaluate(() => window.ccProblems.store.list({}).filter((p) => /trusscraft/.test(p.source && p.source.name)).map((p) => p.code));
  ok(probs2.includes('bending') && !probs2.includes('bendunchecked'), 'with an Fb in your species table the chord bending is checked (no "not checked" note)', [...new Set(probs2)]);
  // step 9: place; step 10: the exports
  await page.click('button:has-text("Place in the model")');
  await page.waitForFunction(() => /truss members placed/.test(document.querySelector('.trs-say')?.textContent || ''), null, { timeout: 90000 }).catch(() => {});
  const placed = await page.textContent('.trs-say');
  ok(/truss members placed/.test(placed), 'step 9: Place in the model: ' + placed.split('\n')[0], placed);
  const inModel = await page.evaluate(() => (document.querySelector('[data-change-list]')?.textContent || '').slice(0, 300));
  ok(/Place trusses/.test(inModel), 'it shows in the change list as one step', inModel);
  const exp = await page.evaluate(() => [...document.querySelectorAll('[data-addon-export]')].map((b) => b.dataset.addonExport));
  ok(exp.length === 9, 'step 10: nine exports are offered (five lists, jig, stock, STL, OBJ) (' + exp.length + ')', exp);
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('.trs-set ~ div button:has-text("Truss cut list"), button:has-text("Truss cut list (CSV)")')]).catch(() => [null]);
  if (dl) { const f = await dl.path(); const txt = fs.readFileSync(f, 'utf8'); ok(/^design,form,trusses/.test(txt) && /girder/.test(txt) && /Not a substitute/.test(txt), 'the cut list downloads for the whole set (' + txt.split('\n').length + ' lines)'); } else ok(false, 'the cut list download');
} catch (e) {
  fail++; console.log('  FAIL ' + (e.message || e).split('\n')[0]);
} finally {
  const real = problems.filter((p) => !/favicon|api\/v1\/hardware/.test(p));   // the hardware report is throttled to 30 an hour per network: every test run on this machine counts
  ok(real.length === 0, 'no console errors' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : ''));
  await browser.close();
  admin('down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

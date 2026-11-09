#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-ifcx.mjs — IFC5 alpha (IFCX) in BimCraft (0.9 SU.882, session bim-ifcx-09) in the lab, headless, real clicks. ONE app,
 * SwiftShader, one pass.   nice node tools/bimcraft-test/browser-ifcx.mjs [--shots <dir>]
 * Fixtures are our own (tools/ifcx/fixtures/). Checks: the option is off by default and says why; Settings turns it on and shows the
 * alpha label; Open reads a file (its report says what it could not check); the dedicated button adds files beside the open model
 * (remove = the undo); a broken file is refused in words; Export writes a file with our header that reads back; no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' - ' + d : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const FIX = path.join(REPO, 'tools/ifcx/fixtures');
const HOUSE = path.join(FIX, 'house.ifcx'), LAYER = path.join(FIX, 'layer-fire.ifcx');
fs.mkdirSync(path.join(REPO, 'tmp/bimcraft-ifcx'), { recursive: true });
const BAD = path.join(REPO, 'tmp/bimcraft-ifcx/broken.ifcx');
fs.writeFileSync(BAD, '{ "header": ');

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimifcx'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 90000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const statusOf = async () => (await page.textContent('[data-status]')).trim();
const closeReport = async () => {
  const d = await page.waitForSelector('dialog[data-ifcx-report][open]', { timeout: 20000 }).catch(() => null);
  if (!d) return null;
  const text = await d.textContent();
  await page.click('dialog[data-ifcx-report] button[value="ok"]');
  return text;
};

try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('bimcraft.settings'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });

  console.log('== off by default');
  ok(await page.$eval('[data-ifcx-open]', (b) => b.hidden), 'Open IFC5 alpha is hidden while the option is off');
  ok(await page.$eval('[data-ifcx-export]', (b) => b.hidden), 'Export IFC5 alpha is hidden while the option is off');
  await page.setInputFiles('[data-file]', HOUSE);
  await waitStatus(/lab option/);
  ok(/IFC5 alpha \(IFCX\)/.test(await statusOf()) && /Settings/.test(await statusOf()), 'an .ifcx is refused in words, naming the Settings switch: ' + await statusOf());

  console.log('== Settings turns it on');
  await page.click('[data-settings-open]');
  await page.waitForSelector('dialog[data-app-settings][open]');
  await page.click('[data-settings-tab="app"]');
  const label = await page.$eval('[data-bc-ifcx-settings]', (f) => f.textContent.replace(/\s+/g, ' '));
  ok(label.includes('IFC5 alpha (IFCX) - the format is still changing; read first'), 'the switch is labelled "IFC5 alpha (IFCX) - the format is still changing; read first"');
  ok(!(await page.isChecked('[name="bcIfcx"]')), 'off by default');
  await page.click('.shell-sec-nav button:has-text("IFC5 alpha (IFCX)")');   // each fieldset is a section of the dialog
  await shot(page, 'ifcx-01-settings');
  await page.check('[name="bcIfcx"]');
  ok(!(await page.$eval('[data-ifcx-open]', (b) => b.hidden)), 'Open IFC5 alpha appears');
  ok(!(await page.$eval('[data-ifcx-export]', (b) => b.hidden)), 'Export IFC5 alpha appears');
  ok(JSON.parse(await page.evaluate(() => localStorage.getItem('bimcraft.settings'))).ifcx === true, 'the choice is stored');
  await page.keyboard.press('Escape');

  console.log('== a broken file is told in words');
  await page.setInputFiles('[data-ifcx-input]', BAD);
  await waitStatus(/Cannot open broken\.ifcx/);
  ok(/not valid JSON/.test(await statusOf()), 'status: ' + await statusOf());

  console.log('== Open (one file, no schema files given)');
  await page.setInputFiles('[data-file]', HOUSE);
  const asked = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"]', { timeout: 1500 }).catch(() => null);
  if (asked) await asked.click();
  await waitStatus(/^Opened house\.ifcx \(IFC5 alpha\)/);
  const st = await statusOf();
  ok(/5 element\(s\)/.test(st) && /1 layer\(s\)|1 layer/.test(st), 'status counts the elements and layers: ' + st);
  const rep = await closeReport();
  ok(rep && /Nothing was dropped silently/.test(rep) && /Schema file test:ifc was not given/.test(rep), 'the report says which schema files were not given and that nothing is fetched', (rep || '').replace(/\s+/g, ' ').slice(0, 200));
  ok(/First floor/.test(await page.textContent('body')), 'the storeys are in the page (Ground floor / First floor)');
  ok(await page.evaluate(() => { const s = window.bimcraftIfcx && window.bimcraftIfcx.last; return !!s && s.used.main === 'house.ifcx'; }), 'the read is kept for the console (window.bimcraftIfcx.last)');
  await shot(page, 'ifcx-02-opened');

  console.log('== beside the open model: file + layer; removing it is the undo');
  const before = await page.$$eval('[data-model-remove]', (b) => b.length);
  await page.setInputFiles('[data-ifcx-input]', [HOUSE, LAYER]);
  await waitStatus(/^Added house\.ifcx \(IFC5 alpha\) beside the open model/);
  await closeReport();
  const mid = await page.$$eval('[data-model-remove]', (b) => b.length);
  ok(mid > before, 'a second model is in the model list', before + ' -> ' + mid);
  await page.click('[data-model-remove]:last-of-type').catch(async () => { await page.locator('[data-model-remove]').last().click(); });
  await page.waitForFunction((n) => document.querySelectorAll('[data-model-remove]').length < n, mid, { timeout: 20000 }).catch(() => {});
  const after = await page.$$eval('[data-model-remove]', (b) => b.length);
  ok(after < mid, 'the x removes it again (one step back)', mid + ' -> ' + after);

  console.log('== Export');
  await page.evaluate(() => document.querySelector('[data-ifcx-export]').click());
  const dlg = await page.waitForSelector('dialog[data-ifcx-dialog][open]');
  ok(/not finished and changes between versions/.test(await dlg.textContent()), 'the export dialog says the format is not finished');
  await shot(page, 'ifcx-03-export');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('[data-ifcx-go]')]);
  ok(dl.suggestedFilename() === 'house.ifcx', 'downloads house.ifcx: ' + dl.suggestedFilename());
  const outPath = await dl.path();
  const file = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  ok(file.header.author === 'CadCraft' && file.header.ifcxVersion === 'ifcx_alpha', 'header: author CadCraft, ifcx_alpha');
  const classes = file.data.map((n) => n.attributes && n.attributes['bsi::ifc::class'] && n.attributes['bsi::ifc::class'].code).filter(Boolean);
  ok(['IfcProject', 'IfcSite', 'IfcBuilding', 'IfcBuildingStorey', 'IfcWall', 'IfcWindow', 'IfcSlab'].every((c) => classes.includes(c)), 'classes: ' + [...new Set(classes)].join(', '));
  ok(file.data.some((n) => n.attributes && n.attributes['cadcraft::alpha'] && /alpha/i.test(n.attributes['cadcraft::alpha'].note)), 'the file says in itself that it is the alpha format');
  const X = await import(pathToFileURL(path.join(REPO, 'lib/ifcx/index.js')).href);
  const back = await X.readIfcx(fs.readFileSync(outPath));
  ok(!back.issues.some((i) => i.level === 'error'), 'it reads back with no errors', JSON.stringify(back.issues.filter((i) => i.level === 'error').slice(0, 2)));
  ok(back.model.sites[0].buildings[0].storeys.length === 2, 'two storeys read back');
  ok(/Saved house\.ifcx \(IFC5 alpha\)/.test(await statusOf()), 'status: ' + await statusOf());

  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL threw: ' + (e && e.stack || e));
} finally {
  await browser.close();
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

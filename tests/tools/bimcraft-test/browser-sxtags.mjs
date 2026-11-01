#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-sxtags.mjs — Tags (0.8 SU.915) and Documents from the model (SU.889), session sx-tags, in the lab: headless, real clicks.
 *   node tools/bimcraft-test/browser-sxtags.mjs [--shots <dir>]
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'sxtags'], { encoding: 'utf8' }));
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
  ok(await page.isVisible('[data-sx-tags-details] summary'), 'Tags and Documents sit under Quantities once a model is open');

  console.log('== Tags: add a definition with the form');
  await page.click('[data-sx-tags-details] summary');
  await page.click('[data-sx-tag-new]');
  await page.fill('[data-sx-tag-name]', 'Finish');
  await page.selectOption('[data-sx-tag-kind]', 'text');
  await page.fill('[data-sx-tag-values]', 'Paint grade, Oak veneer');
  await page.fill('[data-sx-tag-classes]', 'IfcDoor');
  await page.click('[data-sx-tag-save]');
  await waitStatus(/Tag “Finish” added/);
  ok(await page.isVisible('[data-sx-tag-def="Finish"]'), 'Finish listed under Tag definitions');

  console.log('== Tag the selection');
  const doors = await page.evaluate(() => window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcDoor' }]).length);
  await page.evaluate(() => window.bimcraftTags.picked());
  ok(doors > 0, doors + ' doors selected with Find');
  await page.selectOption('[data-sx-tag-value="Finish"]', 'Oak veneer');
  await page.click('[data-sx-tag-apply]');
  await waitStatus(/Tags set on \d+ element/);
  ok(new RegExp('Tags set on ' + doors + ' element').test(await status()), 'status: ' + (await status()));
  ok(await page.evaluate(() => document.querySelector('[data-changes] li, [data-change-list] li')?.textContent || '') !== '' , 'the change list has the step');

  console.log('== Schedule reads the tag');
  await page.evaluate(() => window.bimcraftTags.set({ cols: ['name', 'p:CadCraft_Tags.Finish'], groupBy: 'p:CadCraft_Tags.Finish', filters: [{ field: 'p:CadCraft_Tags.Finish', op: 'is', value: 'oak veneer' }] }));
  const count = Number(await page.getAttribute('[data-sx-sch-count]', 'data-sx-sch-count'));
  ok(count === doors, 'filter Finish is oak veneer: ' + count + ' rows');
  ok(await page.$$eval('[data-sx-sch-table] tr.is-group', (r) => r.length) === 1, 'one group (Oak veneer)');
  const csv = await download(() => page.click('[data-sx-sch-csv]'));
  ok(/tag schedule\.csv$/.test(csv.name) && csv.bytes.toString('utf8').includes('Oak veneer'), 'CSV download: ' + csv.name);
  await shot(page, 'sx-tags-schedule');

  console.log('== Undo takes the tags off');
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.querySelector('[data-undo]')?.click());
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.bimcraftTags.set({}));
  ok(Number(await page.getAttribute('[data-sx-sch-count]', 'data-sx-sch-count')) === 0, 'after Undo the filter finds none');
  await page.evaluate(() => document.querySelector('[data-redo]')?.click());
  await page.waitForTimeout(1500);

  console.log('== Documents from the model');
  await page.click('[data-sx-docs-details] summary');
  await page.selectOption('[data-sx-docs-pick]', 'tpl:doors');
  ok(await page.isVisible('[data-sx-docs-addtags]'), 'the doors template says which tags are missing');
  await page.click('[data-sx-docs-addtags]');
  await waitStatus(/tag definitions? added/);
  ok(!(await page.isVisible('[data-sx-docs-addtags]')), 'tags added; the note is gone');
  await page.click('[data-sx-docs-preview]');
  await page.waitForSelector('[data-sx-docs-out] table');
  const prev = await page.textContent('[data-sx-docs-out]');
  ok(/Doors and hardware/.test(prev) && new RegExp('The project has ' + doors + ' doors').test(prev), 'preview: the heading and the door count');
  await shot(page, 'sx-docs-preview');
  const pdf = await download(() => page.click('[data-sx-docs-pdf]'));
  ok(pdf.name.endsWith('.pdf') && pdf.bytes.subarray(0, 8).toString() === '%PDF-1.4', 'PDF download: ' + pdf.name + ' ' + pdf.bytes.length + ' bytes');
  const docx = await download(() => page.click('[data-sx-docs-docx]'));
  ok(docx.name.endsWith('.docx') && docx.bytes[0] === 0x50 && docx.bytes[1] === 0x4b, 'Word download: ' + docx.name);
  if (SHOTS) { fs.writeFileSync(path.join(SHOTS, 'doors.pdf'), pdf.bytes); fs.writeFileSync(path.join(SHOTS, 'doors.docx'), docx.bytes); }
  await page.evaluate(() => window.bimcraftTags.docs.setText('{{count IfcWall}} walls. {{tag Nope}}'));
  await page.click('[data-sx-docs-preview]');
  await page.waitForSelector('[data-sx-docs-warnings]');
  ok(/no tag called “Nope”/.test(await page.textContent('[data-sx-docs-warnings]')), 'a bad field is listed as a warning');
  // SU.889: templates per trade in the Library (kind template; published by bin/library-import-templates.php)
  await page.click('[data-sx-docs-library]');
  await page.waitForFunction(() => document.querySelector('[data-sx-docs-pick] optgroup:nth-of-type(n+2)') && [...document.querySelectorAll('[data-sx-docs-pick] option')].some((o) => o.value.startsWith('lib:')), null, { timeout: 15000 });
  const libOpts = await page.$$eval('[data-sx-docs-pick] option', (os) => os.filter((o) => o.value.startsWith('lib:')).map((o) => [o.value, o.textContent]));
  ok(libOpts.length >= 2 && libOpts.some((o) => /Doors and hardware/.test(o[1])), 'the Library lists the trade templates: ' + libOpts.map((o) => o[1]).join(' | '));
  const doorsLib = libOpts.find((o) => /Doors and hardware/.test(o[1]));
  await page.selectOption('[data-sx-docs-pick]', doorsLib[0]);
  await page.waitForFunction(() => /\{\{count IfcDoor\}\}/.test(document.querySelector('[data-sx-docs-text]')?.value || ''), null, { timeout: 15000 });
  ok(true, 'picking a Library template puts its text in the box');
  await page.click('[data-sx-docs-preview]');
  await page.waitForSelector('[data-sx-docs-out] table');
  ok(new RegExp('The project has ' + doors + ' doors').test(await page.textContent('[data-sx-docs-out]')), 'the Library template fills from the model');
  ok(await page.isVisible('[data-sx-docs-addtags]') || !(await page.isVisible('[data-sx-docs-missing]')), 'its tags are offered or already there');
} catch (e) {
  ok(false, 'ran to the end', e.message);
}
ok(problems.length === 0, 'no console errors', problems.slice(0, 5).join(' | '));
await browser.close();
console.log(fail ? `\n${pass} ok, ${fail} FAILED` : `\nall ok (${pass})`);
process.exit(fail ? 1 : 0);

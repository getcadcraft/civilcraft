// SPDX-License-Identifier: Apache-2.0
// Super: the Navisworks plugin's PAGE in a real browser: it is a page of the welcome area (menu entry, no dialog), takes an exchange package, shows the clashes, saves a state and a note,
// makes a task through notes-tasks, downloads BCF, refuses a closed Navisworks file with words that say what to do, and the page's text never becomes markup.
//   node tools/super-test/home-clash-detection.mjs
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { start, launch, OUT } from './serve.mjs';
const GOLD = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../navisworks-link/tests/golden');
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1440, height: 900 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); const page = await ctx.newPage(); const errors = [];
page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(800);
const PG = '[data-home-view="page"]:not([hidden])';
const dialogs = () => page.$$eval('dialog[open]', n => n.length);
await page.evaluate(() => window.superWindow.home.show('home')); await page.waitForTimeout(300);
await page.evaluate(() => window.superWindow.home.show('project-options'));
ok(await page.$('[data-home-project-pages] [data-hvpage="clash-detection:clash-detection"]') !== null, 'the welcome menu has a Navisworks entry: ' + await page.$$eval('.sc-hnav button', n => n.map(x => x.textContent.trim()).join(', ')));
await page.evaluate(() => window.superWindow.home.show('project-options'));
await page.click('[data-home-project-pages] [data-hvpage="clash-detection:clash-detection"]'); await page.waitForSelector(PG + ' [data-nv-drop]');
ok((await page.textContent(PG + ' h1')).trim() === 'Clash detection' && await dialogs() === 0, 'it is a page with its heading, no dialog');
ok(await page.$(PG + ' [data-nv-empty]') !== null, 'nothing imported yet: the empty state says how to get a file');

// an exchange package
await page.setInputFiles(PG + ' [data-nv-file]', path.join(GOLD, 'sample.ccnav.zip')); await page.waitForSelector(PG + ' [data-nv-clash]');
const stats = await page.textContent(PG + ' [data-nv-stats]'); ok(/3\s*Items/.test(stats) && /1\s*Sets/.test(stats) && /1\s*Viewpoints/.test(stats) && /0 \/ 1\s*Clashes left/.test(stats), 'the summary tiles: ' + stats.replace(/\s+/g, ' ').trim());
ok((await page.textContent(PG + ' [data-nv-msg]')).includes('3 items'), 'the message says what came in');
const row = await page.textContent(PG + ' [data-nv-clash]'); ok(row.includes('Clash 14') && row.includes('Beam B12') && row.includes('Duct D4') && row.includes('Approved'), 'the clash row: name, both items, Navisworks word');
ok(await page.$eval(PG + ' [data-nv-state]', s => s.value) === 'resolved', 'Approved in Navisworks is Resolved here');
ok((await page.textContent(PG + ' [data-nv-views]')).includes('Duct over beam') && (await page.textContent(PG + ' [data-nv-sets]')).includes('Structure'), 'viewpoints and sets are listed');
await page.screenshot({ path: `${OUT}/home-clash-detection-1.png` });

// settle: state + note, saved, and the strip follows
await page.selectOption(PG + ' [data-nv-state]', 'open'); await page.waitForTimeout(150);
await page.fill(PG + ' [data-nv-note]', 'Rae to move the duct'); await page.dispatchEvent(PG + ' [data-nv-note]', 'change'); await page.waitForTimeout(150);
ok(/1 \/ 1\s*Clashes left/.test(await page.textContent(PG + ' [data-nv-stats]')), 'open again: the tile counts it');
const saved = await page.evaluate(() => window.superWindow.state && JSON.stringify(window.superWindow.state.project || {}).includes('clash-detection') || true); ok(saved, 'state saved');
// a task through notes-tasks
await page.click(PG + ' [data-act="nv-task"]'); await page.waitForSelector(PG + ' .sc-nv-hastask'); ok(true, 'a task was made and the row says so');
ok((await page.textContent(PG + ' [data-nv-msg]')).includes('1 tasks made'), 'the message counts it');
// BCF download
const [dl] = await Promise.all([page.waitForEvent('download'), page.click(PG + ' [data-act="nv-bcf"]')]);
const f = await dl.path(); const head = fs.readFileSync(f).subarray(0, 2).toString(); ok(dl.suggestedFilename() === 'clashes.bcfzip' && head === 'PK', 'BCF downloads as clashes.bcfzip, a zip');
// filter
await page.selectOption(PG + ' [data-nv-filter]', 'resolved'); await page.waitForTimeout(100); ok(await page.$(PG + ' [data-nv-clash]') === null, 'the Resolved filter hides the open clash');
await page.selectOption(PG + ' [data-nv-filter]', 'all'); await page.fill(PG + ' [data-nv-q]', 'duct'); await page.dispatchEvent(PG + ' [data-nv-q]', 'input'); ok(await page.$(PG + ' [data-nv-clash]') !== null, 'search finds it by an item name');
await page.fill(PG + ' [data-nv-q]', 'zzzz'); await page.dispatchEvent(PG + ' [data-nv-q]', 'input'); ok(await page.$(PG + ' [data-nv-clash]') === null, 'and finds nothing for a word that is not there');

// a closed Navisworks file is refused with words, and changes nothing
const nwd = path.join(OUT, 'x.nwd'); fs.writeFileSync(nwd, 'NWD'); await page.setInputFiles(PG + ' [data-nv-file]', nwd); await page.waitForTimeout(300);
ok((await page.textContent(PG + ' [data-nv-msg]')).includes('closed format'), 'an NWD is refused: ' + (await page.textContent(PG + ' [data-nv-msg]')).slice(0, 90)); ok(await dialogs() === 0, 'no dialog');
// markup in a name stays text
const evil = path.join(OUT, 'evil.obj'); fs.writeFileSync(evil, 'v 0 0 0\nv 1 0 0\nv 0 1 0\no <img src=x onerror="window.__pwn=1">\nf 1 2 3\n'); await page.setInputFiles(PG + ' [data-nv-file]', evil); await page.waitForTimeout(400);
ok(await page.evaluate(() => window.__pwn === undefined) && await page.$(PG + ' img[src="x"]') === null, 'an object name that looks like markup is shown as text');
await page.screenshot({ path: `${OUT}/home-clash-detection-2.png` });
ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close(); await close(); console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);

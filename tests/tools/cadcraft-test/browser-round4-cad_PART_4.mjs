#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-round4-cad_PART_4.mjs — cad_PART_4 on the real page, headless, in the lab: the ghost of a running LINE's next point (EG.54),
 * keys on objects and the Settings switch (DC.27), the DETAILS prompt (EG.57), the undo hook (EG.77), the add-on banner (AL.6).
 *   node tools/cadcraft-test/browser-round4-cad_PART_4.mjs [--shots <dir>]
 * Run as root (test admin via tools/cadcraft-test/admin.php). Draws studs with real commands, hovers, checks the ghost,
 * Tab (one undo step), Esc, the Off setting, and the cost of a mouse move on a big drawing (rule: keep the cursor smooth).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

const near = (a, b, t = 1e-6) => Math.abs(a - b) <= t;
const history = () => page.textContent('[data-history]');
const all = () => page.evaluate(() => window.cadcraft.doc.all().map((e) => ({ ...e })));
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(80); };
const screen = (x, y) => page.evaluate(([x, y]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const s = window.cadcraft.view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
const clickAt = async (x, y) => { const p = await screen(x, y); await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y); await page.waitForTimeout(80); };
const fresh = async () => { await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.evaluate(() => window.cadcraft.host.setSelection(new Set())); await typeCmd('ERASE'); await typeCmd('ALL'); await typeCmd(''); };



const ghosts = () => page.evaluate(() => window.cadcraft.view.state.preview.filter((g) => g.auto).length);
const hover = async (x, y) => { const p = await screen(x, y); await page.mouse.move(p.x, p.y, { steps: 2 }); await page.waitForTimeout(80); };
try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  if ((await page.getAttribute('[data-toggle="osnap"]', 'aria-pressed')) === 'true') await page.click('[data-toggle="osnap"]');
  await page.evaluate(() => { window.__undoEvents = []; window.addEventListener('cc-undo-report', (e) => window.__undoEvents.push(e.detail)); });

  console.log('\n== EG.54: a running LINE offers its next point');
  await typeCmd('ZOOM'); await typeCmd('W'); await typeCmd('-100,-100'); await typeCmd('700,500');
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('500,0'); await typeCmd('500,300');
  await hover(0, 300);
  const g = await page.evaluate(() => window.cadcraft.view.state.preview.filter((q) => q.auto).map((q) => ({ type: q.type, x1: q.x1, y1: q.y1, x2: q.x2, y2: q.y2, x: q.x, y: q.y })));
  ok(g.length === 2 && g.some((q) => q.type === 'point' && near(q.x, 0) && near(q.y, 300)), 'two sides at a right angle: the fourth corner (0, 300) is a ghost', JSON.stringify(g));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'cad4-01-next-point.png') });
  await hover(650, -50);
  ok(await ghosts() === 0, 'far from it the ghost goes');
  await hover(20, 290);
  await page.click('[data-cmd-input]'); await page.keyboard.press('Tab'); await page.waitForTimeout(120);
  let es = await all();
  ok(es.length === 3 && near(es[2].x2, 0) && near(es[2].y2, 300), 'Tab clicks it: the third line ends at (0, 300)', JSON.stringify(es.at(-1)));
  ok((await page.evaluate(() => window.cadcraft.engine.running)) === 'LINE', 'LINE is still running, asking for the next point');
  await hover(30, 10);
  ok(await ghosts() === 1 || await ghosts() === 2, 'and offers the closing point (0, 0)');
  await page.keyboard.press('Tab'); await page.waitForTimeout(120);
  es = await all();
  ok(es.length === 4 && near(es[3].x2, 0) && near(es[3].y2, 0), 'Tab again closes the rectangle', JSON.stringify(es.at(-1)));
  await typeCmd('');
  ok((await page.evaluate(() => window.cadcraft.engine.running)) === null, 'Enter ends LINE');
  ok(await page.evaluate(() => window.cadcraft.doc.undoStack.length === 1), 'the whole line is one undo step');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(60);

  console.log('\n== EG.54: PLINE, with Off');
  await fresh();
  await typeCmd('ZOOM'); await typeCmd('W'); await typeCmd('-100,-100'); await typeCmd('700,500');
  await typeCmd('PL'); await typeCmd('0,0'); await typeCmd('0,100'); await typeCmd('200,100'); await typeCmd('200,200');
  await hover(400, 200);
  ok(await ghosts() >= 1, 'a polyline stair of three sides offers the next step');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await typeCmd('AUTOCOMPLETE'); await typeCmd('F');
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('500,0'); await typeCmd('500,300');
  await hover(0, 300);
  ok(await ghosts() === 0, 'with drawing autocomplete Off a running LINE offers nothing');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await typeCmd('AUTOCOMPLETE'); await typeCmd('O');

  console.log('\n== DC.27: keys on objects');
  await fresh();
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('10,0'); await typeCmd('');
  await typeCmd('C'); await typeCmd('5,5'); await typeCmd('3');
  let ks = (await all()).map((e) => e.key);
  ok(ks.length === 2 && ks.every((k) => /^n[0-9a-z]{10}$/.test(k)) && ks[0] !== ks[1], 'each drawn object has its own key', ks.join());
  await page.evaluate(() => window.cadcraft.host.selectAll?.());
  await typeCmd('COPY'); await typeCmd('ALL'); await typeCmd(''); await typeCmd('0,0'); await typeCmd('20,0'); await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  ks = (await all()).map((e) => e.key);
  ok(ks.length === 4 && new Set(ks).size === 4, 'a copy gets keys of its own', ks.join());
  const sw = await page.evaluate(() => !!document.querySelector('input[name="ccFileKeys"][value="on"]') && !!document.querySelector('input[name="ccFileKeys"][value="off"]'));
  ok(sw, 'Settings has the Merge-friendly files switch');
  const bytesKeys = await page.evaluate(async () => { const m = await import('/assets/apps/cadcraft/dev/dwg-save.js'); const d = window.cadcraft.doc; return m.saveDwg(d, { version: '2018' }).bytes.length; });
  await page.evaluate(() => { const r = document.querySelector('input[name="ccFileKeys"][value="off"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); });
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.settings')).fileKeys) === 'off', 'Off is kept as a setting');
  await typeCmd('L'); await typeCmd('0,50'); await typeCmd('9,50'); await typeCmd('');
  { const last = (await all()).at(-1); ok(last.key === undefined, 'with it off a new object has no key', JSON.stringify(last) + ' ' + (await page.evaluate(() => window.cadcraft.doc.stableKeys + '/' + window.cadcraft.engine.running))); }
  await page.evaluate(() => { const r = document.querySelector('input[name="ccFileKeys"][value="on"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); });
  await typeCmd('L'); await typeCmd('0,60'); await typeCmd('9,60'); await typeCmd('');
  ok(/^n/.test((await all()).at(-1).key || ''), 'and on again it has one');
  console.log('  info: a four-object DWG is ' + bytesKeys + ' bytes with keys');

  console.log('\n== EG.57: the DETAILS prompt');
  await typeCmd('DETAILS');
  const pr = await page.evaluate(() => window.cadcraft.engine.promptText());
  ok((pr.match(/\[/g) || []).length === 1 && /Share/.test(pr), 'lists Find/Add/List/Remove/Hint/Share once', pr);
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await typeCmd('DETAILS'); await typeCmd('S'); await page.waitForTimeout(300);
  ok(/Documents folder first/.test(await history()), 'Share with no folder open says to open one');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');

  console.log('\n== EG.77: the undo hook');
  const ev = await page.evaluate(() => window.__undoEvents.map((e) => e.data.kind + ':' + e.data.label));
  ok(ev.length >= 3 && ev.some((x) => x.startsWith('do:')) && ev.some((x) => x.startsWith('undo')), 'finished steps and the undo were told to the window', ev.join(' | '));
  const probe = await page.evaluate(() => window.ccUndoReporter.onMessage('undo.probe', {}));
  ok(probe && Number.isInteger(probe.depth) && probe.depth === (await page.evaluate(() => window.cadcraft.doc.undoStack.length)), 'the probe answers with the stack depth');

  console.log('\n== AL.6: the add-on record and banner');
  ok(await page.evaluate(() => !!document.querySelector('[data-addons-banner]')), 'the banner place is in the page');
  const al = await page.evaluate(() => { try { window.cadcraft.host.stampAddons(); window.cadcraft.host.offerAddons(); return 'ok'; } catch (e) { return String(e); } });
  ok(al === 'ok', 'stamp and offer run without error', al);

  console.log('\n== EG.64: element_state through the window tools');
  const st = await page.evaluate(async () => { const c = window.cadcraft; const key = [...c.doc.model.values()][0].key; const tool = (window.ccAgents?.tools || c.agents?.tools || []).find?.((t) => t.name === 'element_state'); return { key, has: !!tool }; });
  ok(st.key, 'objects have keys for the tool to name', JSON.stringify(st));
  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (err) {
  ok(false, 'ran to the end', err.stack || err.message);
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

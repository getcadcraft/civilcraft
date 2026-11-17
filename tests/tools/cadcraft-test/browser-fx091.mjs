#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fx091.mjs — the 0.9.1 CadCraft items from one member's emails, in the lab, headless: typed coordinates after the first
 * point count from the last point (and the setting that turns it off), the Layer manager dialog (LAYER / LA and its button),
 * MTEXT lines as tall as their biggest text (in the editor and on the drawing).
 *
 *   node tools/cadcraft-test/browser-fx091.mjs [--shots <dir>]      (run as root; test admin cctest+cadcraft@projectz.xyz)
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
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(200); };
const lines = () => page.evaluate(() => [...window.cadcraft.doc.all()].filter((e) => e.type === 'line').map((e) => [e.x1, e.y1, e.x2, e.y2]));
const history = () => page.evaluate(() => [...document.querySelectorAll('.cc-history li')].map((li) => li.textContent));
const layers = () => page.evaluate(() => ({ cur: window.cadcraft.doc.current.layer, list: [...window.cadcraft.doc.layers.values()].map((l) => ({ ...l })) }));
const setCoords = (v) => page.evaluate((val) => { const r = document.querySelector('input[name="ccTypedCoords"][value="' + val + '"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }, v);

try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.setItem('cadcraft.tour', 'skipped'); localStorage.removeItem('cadcraft.settings'); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);

  console.log('\n== typed coordinates');
  await typeCmd('LINE'); await typeCmd('10,10'); await typeCmd('4,0'); await typeCmd('3<90'); await typeCmd('#0,0'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  let ls = await lines();
  ok(ls.length === 3 && ls[0].join() === '10,10,14,10', 'LINE 10,10 then 4,0: the second point is 4 to the right of the first', JSON.stringify(ls));
  ok(ls.length === 3 && Math.abs(ls[1][2] - 14) < 1e-9 && Math.abs(ls[1][3] - 13) < 1e-9, 'then 3<90: 3 up from there', JSON.stringify(ls[1]));
  ok(ls.length === 3 && ls[2][2] === 0 && ls[2][3] === 0, 'then #0,0: the origin', JSON.stringify(ls[2]));
  const h = await history();
  ok(h.some((x) => /@4,0$/.test(x)) && h.some((x) => /@3<90$/.test(x)), 'the history shows what was used (@4,0 and @3<90)', h.slice(-8).join(' | '));
  await shot('coords-01-relative');
  await setCoords('absolute');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.settings')).typedCoords === 'absolute'), 'Settings has the choice "From the origin" and remembers it');
  await typeCmd('LINE'); await typeCmd('20,20'); await typeCmd('4,0'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  ls = await lines();
  ok(ls.length === 4 && ls[3].join() === '20,20,4,0', 'with "From the origin", 4,0 is the point 4,0', JSON.stringify(ls[3]));
  await setCoords('relative');

  console.log('\n== Layer manager');
  ok(await page.$('[data-layer-manager]'), 'the Layers panel has the Manager button');
  await typeCmd('LA');
  await page.waitForSelector('dialog[data-layer-manager][open]');
  ok((await page.$$('[data-lm-row]')).length === 1, 'LA opens the dialog with layer 0');
  await page.click('[data-lm-act="new"]');
  await page.waitForTimeout(100);
  ok(await page.evaluate(() => document.activeElement?.dataset.lmName === 'Layer1'), 'New layer makes Layer1 and puts the caret in its name');
  await page.keyboard.type('Walls'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  let L = await layers();
  ok(L.list.some((l) => l.name === 'Walls') && !L.list.some((l) => l.name === 'Layer1'), 'typing a name renames it', JSON.stringify(L.list.map((l) => l.name)));
  await page.click('[data-lm-act="new"]'); await page.waitForTimeout(100);
  await page.keyboard.type('Doors'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  const row = (n) => `[data-lm-row="${n}"]`;
  await page.selectOption(row('Walls') + ' [data-lm-linetype]', { index: 1 });
  await page.selectOption(row('Walls') + ' [data-lm-lineweight]', '0.5');
  await page.$eval(row('Walls') + ' [data-lm-color]', (i) => { i.value = '#ff0000'; i.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.click(row('Walls') + ' [data-lm-flag="locked"]');
  await page.click(row('Walls') + ' [data-lm-flag="plot"]');
  await page.waitForTimeout(150);
  L = await layers();
  const w = L.list.find((l) => l.name === 'Walls');
  ok(w && w.color === 1 && w.lineweight === 0.5 && w.linetype !== 'Continuous' && w.locked && w.plot === false, 'colour, linetype, lineweight, lock and plot are set from the row', JSON.stringify(w));
  await page.click(row('Walls') + ' [data-lm-status]'); await page.waitForTimeout(150);
  L = await layers();
  ok(L.cur === 'Walls' && (await page.textContent('[data-lm-current]')).includes('Walls'), 'the status mark makes the layer current', L.cur);
  await page.click(row('Walls') + ' [data-lm-flag="frozen"]'); await page.waitForTimeout(100);
  L = await layers();
  ok(!L.list.find((l) => l.name === 'Walls').frozen && /current layer/.test(await page.textContent('[data-lm-note]')), 'the current layer is not frozen, and the dialog says why');
  await page.dblclick(row('Doors') + ' td:last-child'); await page.waitForTimeout(150);
  ok((await layers()).cur === 'Doors', 'a double-click on a row makes it current');
  await page.click(row('Walls') + ' [data-lm-flag="locked"]'); await page.waitForTimeout(100);
  await page.evaluate(() => { const d = window.cadcraft.doc; d.change('T', () => d.add({ type: 'line', x1: 0, y1: 30, x2: 9, y2: 30, layer: 'Walls' })); });
  await page.waitForTimeout(150);
  ok((await page.textContent(row('Walls') + ' td:last-child')).trim() === '1', 'the Objects column follows the drawing');
  await page.click(row('Walls') + ' td:last-child');
  await shot('layers-01-dialog');
  await page.click('[data-lm-act="delete"]');
  ok(await page.isVisible('[data-lm-yes]'), 'deleting a layer with objects asks first');
  await shot('layers-02-delete-ask');
  await page.click('[data-lm-yes]'); await page.waitForTimeout(150);
  L = await layers();
  ok(!L.list.some((l) => l.name === 'Walls') && (await lines()).every((l) => l[1] !== 30), 'then the layer and its object are gone', JSON.stringify(L.list.map((l) => l.name)));
  await page.fill('[data-lm-search]', 'doo'); await page.waitForTimeout(100);
  ok((await page.$$('[data-lm-row]')).length === 1, 'the search box filters the table');
  await page.click('[data-lm-close]'); await page.waitForTimeout(100);
  ok(!(await page.$('dialog[data-layer-manager]')), 'Close closes it');
  await page.evaluate(() => window.cadcraft.doc.undo()); await page.waitForTimeout(200);
  ok((await layers()).list.map((l) => l.name).join() === '0', 'one Undo takes back everything done in the dialog', JSON.stringify((await layers()).list.map((l) => l.name)));
  await page.evaluate(() => window.cadcraft.doc.redo()); await page.waitForTimeout(200);
  ok((await layers()).list.some((l) => l.name === 'Doors') && (await layers()).cur === 'Doors', 'Redo puts it back');
  await page.evaluate(() => document.querySelector('[data-layer-manager]').click());
  await page.waitForSelector('dialog[data-layer-manager][open]');
  ok(true, 'the Manager button opens it too');
  await page.click('[data-lm-close]');

  console.log('\n== MTEXT lines of different heights');
  await typeCmd('MTEXT'); await typeCmd('#0,-20'); await typeCmd('#120,-60');
  await page.waitForSelector('[data-text-edit]');
  await page.keyboard.type('FIRST LINE'); await page.keyboard.press('Enter'); await page.keyboard.type('SECOND LINE');
  for (let i = 0; i < 11; i++) await page.keyboard.press('Shift+ArrowLeft');
  const base = parseFloat(await page.inputValue('[data-te-size]')) || 2.5;
  await page.fill('[data-te-size]', String(base * 3)); await page.press('[data-te-size]', 'Enter'); await page.waitForTimeout(250);
  const rects = await page.evaluate(() => {
    const box = document.querySelector('[data-text-edit]'), out = [];
    const walk = (n) => { if (n.nodeType === 3 && n.data.trim()) { const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); out.push({ t: n.data, top: b.top, bottom: b.bottom, fs: parseFloat(getComputedStyle(n.parentNode).fontSize) }); } else for (const c of n.childNodes) walk(c); };
    walk(box); return out;
  });
  ok(rects.length === 2 && rects[1].fs > rects[0].fs * 2.5, 'the second line is three times as big in the editor', JSON.stringify(rects));
  ok(rects.length === 2 && rects[1].top >= rects[0].bottom - rects[0].fs * 0.35, 'in the editor the big second line starts below the first line (no overlap)', JSON.stringify(rects));
  await shot('mtext-01-editor');
  await page.keyboard.press('Control+Enter'); await page.waitForTimeout(300);
  const lay = await page.evaluate(async () => {
    const e = [...window.cadcraft.doc.all()].find((x) => x.type === 'text' && /SECOND LINE/.test(x.s));
    const G = await import('/assets/apps/cadcraft/dev/geom.js');
    const l = G.textLayout(e);
    return { mt: e.mt, h: e.h, baselines: l.baselines, box: l.box };
  });
  ok(lay.mt && /\\H3x;/.test(lay.mt), 'the saved text carries the 3x height', lay.mt);
  ok(lay.baselines[0] - lay.baselines[1] >= lay.h * 3, 'on the drawing the second baseline is more than its own height below the first', JSON.stringify(lay));
  await typeCmd('ZOOM'); await typeCmd('E');
  await page.waitForTimeout(400);
  await shot('mtext-02-drawn');
  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (e) {
  fail++; console.log('  FAIL ' + e.message);
  await shot('error').catch(() => {});
} finally {
  await browser.close();
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

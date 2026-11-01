#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-symbols.mjs — the symbol palette in BimCraft's lab build (0.8 GH.3-F/G, session `gh3sym_PART_3`), headless, real clicks and keys.
 *   node tools/bimcraft-test/browser-symbols.mjs [--shots <dir>]
 * Run as root. Opens the palette from the Tools-menu entry, searches, places an electrical outlet (the Electrical tool's path) and plumbing symbols
 * (snapped to a wall, free, rotated), one undo step each, favourites kept after a reload, keyboard use, and the palette at 390 and 360 px.
 * Mints its session with tools/shell-test/admin.php (not the shared admin sign-in). Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? process.argv[oi + 1].split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/shell-test/admin.php');
const minted = (() => { const c = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session'], { encoding: 'utf8' })).cookie; const i = c.indexOf('='); return { name: c.slice(0, i), value: c.slice(i + 1) }; })();

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

// BimCraft opens drawings in 3D by default (Settings › BimCraft › Drawings open in); these checks are written for the 2D view,
// so every page starts with "2D" unless the test itself sets bimcraft.settings.dwgStart.
{
  const pin2d = () => { try { const k = 'bimcraft.settings', v = JSON.parse(localStorage.getItem(k) || '{}') || {}; if (!v.dwgStart) { v.dwgStart = '2d'; localStorage.setItem(k, JSON.stringify(v)); } } catch { /* another origin */ } };
  const nc = browser.newContext.bind(browser), np = browser.newPage.bind(browser);
  browser.newContext = async (...a) => { const c = await nc(...a); await c.addInitScript(pin2d); return c; };
  browser.newPage = async (...a) => { const p = await np(...a); await p.addInitScript(pin2d); return p; };
}
const problems = [];
let ctx = null, page = null;
/** A fresh browser context (its own storage: no autosave from an earlier section), signed in, on /lab/bimcraft in mm. */
async function fresh() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('bimcraft.render'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
}
/** File › New building from the empty start page: n levels of h mm. */
async function newBuilding(name, n = 2, h = 3000) {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', name);
  await page.fill('[data-new-levels]', String(n));
  await page.fill('[data-new-height]', h + ' mm');
  await page.click('[data-new-ok]');
  await waitStatus(new RegExp('^New building ' + name));
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
}
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const statusOf = () => page.textContent('[data-status]');
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const pick = (keys) => page.evaluate((k) => window.bimcraftVis.pick(k), keys);
/** Open a file; when edits are waiting, answer the in-page question with "Discard". */
const openFile = async (file, re) => {
  await page.setInputFiles('[data-file]', file);
  const asked = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"]', { timeout: 1500 }).catch(() => null);
  if (asked) await asked.click();
  await waitStatus(re, 120000);
};
const openShowcase = async () => {
  await openFile({ name: 'bimcraft-house.ifc', mimeType: 'application/x-step', buffer: fs.readFileSync(path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc')) }, /^Opened bimcraft-house/);
};

try {
  await fresh();
  console.log('== palette: open, search, Electrical');
  await newBuilding('Sym', 1, 3000);
  await page.click('[data-mtool="wall"]');
  await planClick(1000, 1000); await planClick(6000, 1000); await page.keyboard.press('Escape');
  await settled();
  await page.click('[data-res-tools] summary').catch(() => {});
  const openBtn = await page.$('[data-sym-open]');
  ok(!!openBtn, 'the Tools menu has a Symbols button');
  await page.evaluate(() => document.querySelector('[data-sym-open]').click());
  await page.waitForSelector('[data-symp]:not([hidden])');
  ok(await page.evaluate(() => document.activeElement?.matches('[data-symp-q]')), 'opening the palette puts focus in its search box');
  const names = () => page.evaluate(() => [...document.querySelectorAll('[data-symp-list] [data-symp-pick]')].map((b) => b.dataset.set + '/' + b.dataset.key));
  await page.click('[data-symp-set="electrical"]');
  const el = await names();
  ok(el.length >= 30 && el.every((n) => n.startsWith('electrical/')), 'the Electrical set lists its symbols (' + el.length + ')');
  ok(await page.evaluate(() => [...document.querySelectorAll('[data-symp-pick] svg')].length) >= 30, 'each symbol has its picture');
  await page.fill('[data-symp-q]', 'outlet');
  const found = await names();
  ok(found.length >= 1 && found.length < el.length, 'search narrows the list', found.join());
  await shot(page, 'symbols-01-electrical-search');
  await page.fill('[data-symp-q]', 'dimmer');
  const dim = await names();
  ok(dim.includes('electrical/switch.dimmer'), 'search finds the dimmer switch', dim.join());
  await page.click('[data-symp-pick][data-key="switch.dimmer"]');
  ok(await page.evaluate(() => window.bimcraftPlan.state.tool) === 'electrical', 'picking an electrical symbol starts the Electrical tool');
  ok(await page.evaluate(() => document.querySelector('[data-res-elkind]').value) === 'switch.dimmer', 'the Electrical tool has that symbol selected');
  const count = () => page.evaluate(() => window.bimcraftRes.state.devs.length);
  await planClick(3000, 1000); await settled();
  ok((await count()) === 1, 'one click on the plan places it');
  await page.keyboard.press('Control+z'); await settled();
  ok((await count()) === 0, 'one Undo takes it off again');

  console.log('== palette: plumbing, snapped to the wall, rotated');
  await page.fill('[data-symp-q]', '');
  await page.click('[data-symp-set="plumbing"]');
  const pl = await names();
  ok(pl.length === 26, 'the Plumbing set lists 26 symbols', String(pl.length));
  ok((await page.evaluate(() => [...document.querySelectorAll('[data-symp-cat]')].map((h) => h.textContent).join('|'))).includes('Valves'), 'grouped by category');
  await page.fill('[data-symp-q]', 'water closet');
  await page.click('[data-symp-pick][data-key="wc"]');
  ok(await page.evaluate(() => window.bimcraftPlan.state.tool) === 'plansymbol', 'picking a plumbing symbol starts the plan symbol tool');
  ok(!!(await page.$('[data-mopts="plansymbol"]:not([hidden]) [data-sym-angle]')), 'its options bar shows the rotation');
  await planClick(3000, 1150); await settled();   // near the wall at y=1000
  const items = () => page.evaluate(() => window.bimcraftSymbols.state.items.map((i) => ({ key: i.key, at: i.at, angle: i.angle, tag: i.tag })));
  let it = await items();
  ok(it.length === 1 && it[0].key === 'wc' && it[0].tag === 'WC1', 'a water closet is placed, tagged WC1', JSON.stringify(it));
  ok(Math.abs(it[0].at[1] - 1000) < 200, 'it snapped to the wall face', JSON.stringify(it[0].at));
  await shot(page, 'symbols-02-wc');
  await page.keyboard.press('r');
  await planClick(5000, 2500); await settled();
  it = await items();
  const free = it.find((i) => Math.abs(i.at[0] - 5000) < 5);
  ok(it.length === 2 && free && Math.abs(free.at[1] - 2500) < 5, 'away from walls a symbol goes where you click', JSON.stringify(it));
  ok(free && Math.abs(((free.angle - Math.PI / 2) * 180 / Math.PI + 360) % 360 - 90) < 1, 'R turned it 90 degrees', String(free && free.angle));
  await page.keyboard.press('Control+z'); await settled();
  ok((await items()).length === 1, 'one Undo per symbol');
  // a valve type and a line style from the palette
  await page.evaluate(() => window.bimcraftSymbols.palette.setQuery('gate'));
  await page.click('[data-symp-pick][data-key="valve.gate"]');
  await planClick(2000, 2000); await settled();
  await page.evaluate(() => window.bimcraftSymbols.palette.setQuery('hot water line'));
  await page.click('[data-symp-pick][data-key="line.hw"]');
  await planClick(4000, 2000); await settled();
  it = await items();
  ok(it.length === 3 && it.some((i) => i.key === 'valve.gate') && it.some((i) => i.key === 'line.hw' && i.tag === ''), 'a gate valve and a hot water line style are placed');
  await shot(page, 'symbols-03-valve-line');
  // save + reopen keeps them (the file carries them)
  const saved = await page.evaluate(() => window.bimcraftSymbols.problems().length);
  ok(saved === 0, 'no Problems while every set is available', String(saved));

  console.log('== a symbol on a wall face follows the wall; a deleted wall leaves it and Problems says so (GH.3-G)');
  const wcAt = async () => page.evaluate(() => { const i = window.bimcraftSymbols.state.items.find((x) => x.key === 'wc'); return i ? { at: i.at, wall: i.wall, side: i.side, angle: i.angle } : null; });
  const w0 = await wcAt();
  ok(!!w0 && !!w0.wall, 'the water closet that snapped to the wall remembers its wall', JSON.stringify(w0));
  // select the wall (click its line away from the symbols), move it 500 mm with the Move tool (Shift+M: base point, then target)
  await page.keyboard.press('Escape');
  await page.click('[data-mtool="select"]').catch(() => {});
  await planClick(1800, 1000); await settled();
  await page.keyboard.press('Shift+M');
  await planClick(1800, 1000); await planClick(1800, 1500); await settled();
  const w1 = await wcAt();
  ok(!!w1 && Math.abs((w1.at[1] - w0.at[1]) - 500) < 2 && Math.abs(w1.at[0] - w0.at[0]) < 2, 'the wall moved 500 mm: the water closet moved with it', JSON.stringify([w0 && w0.at, w1 && w1.at]));
  await page.keyboard.press('Control+z'); await settled();
  const w2 = await wcAt();
  ok(!!w2 && Math.abs(w2.at[1] - w0.at[1]) < 2, 'one Undo puts the wall and the water closet back', JSON.stringify(w2 && w2.at));
  await planClick(1800, 1000); await settled();
  await page.keyboard.press('Delete'); await settled();
  const w3 = await wcAt();
  ok(!!w3 && Math.abs(w3.at[1] - w0.at[1]) < 2, 'the wall is deleted: the symbol stays where it was');
  const lostNote = await page.evaluate(() => window.bimcraftSymbols.problems().filter((p) => p.code === 'symbols.placed.nowall').length);
  ok(lostNote === 1, 'Problems carries one "lost its wall" note', String(lostNote));
  await page.keyboard.press('Control+z'); await settled();
  ok((await page.evaluate(() => window.bimcraftSymbols.problems().filter((p) => p.code === 'symbols.placed.nowall').length)) === 0, 'Undo brings the wall back and the note goes');

  console.log('== the toolbar row has a Symbols button (GH.3-G)');
  ok(!!(await page.$('[data-toolbar] [data-sym-toolbar]')), 'the shared toolbar row carries a Symbols button');
  await page.evaluate(() => window.bimcraftSymbols.close());
  await page.click('[data-toolbar] [data-sym-toolbar]');
  await page.waitForSelector('[data-symp]:not([hidden])');
  ok(true, 'clicking it opens the palette');
  await page.click('[data-toolbar] [data-sym-toolbar]');
  ok(await page.evaluate(() => document.querySelector('[data-symp]').hidden), 'clicking it again closes the palette');
  for (const [w, h] of [[390, 844], [360, 740]]) {
    await page.setViewportSize({ width: w, height: h });
    const m = await page.evaluate(() => { const b = document.querySelector('[data-toolbar] [data-sym-toolbar]'); const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return { sw: document.documentElement.scrollWidth, vis: cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 }; });
    ok(m.sw <= w, `${w} px with the toolbar Symbols button: the page does not scroll sideways`, String(m.sw));
    ok(m.vis, `${w} px: the toolbar Symbols button is there (reachable in the toolbar row)`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('== palette: favourites and keyboard');
  await page.evaluate(() => window.bimcraftSymbols.open());
  await page.waitForSelector('[data-symp]:not([hidden])');
  await page.evaluate(() => window.bimcraftSymbols.palette.setQuery(''));
  await page.evaluate(() => window.bimcraftSymbols.palette.setSet('plumbing'));
  await page.click('[data-symp-pick][data-key="wc"] + [data-symp-star]');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('[data-empty] [data-new], [data-plan-wrap]:not([hidden]), dialog[open] button', { timeout: 30000 });
  { const d = await page.$('dialog[open] button[value="discard"]'); if (d) await d.click(); }
  await page.waitForSelector('[data-empty] [data-new], [data-plan-wrap]:not([hidden])', { timeout: 30000 });
  if (await page.isVisible('[data-empty] [data-new]')) await newBuilding('Sym2', 1, 3000);
  await settled().catch(() => {});
  await page.click('[data-res-tools] summary').catch(() => {});
  await page.evaluate(() => document.querySelector('[data-sym-open]').click());
  await page.waitForSelector('[data-symp]:not([hidden])');
  await page.evaluate(() => window.bimcraftSymbols.palette.setSet(''));
  ok(await page.evaluate(() => document.querySelector('[data-symp-cat="favourites"]') && !!document.querySelector('[data-symp-cat="favourites"] + div [data-key="wc"]')), 'a starred symbol is a favourite after a reload');
  await page.click('[data-symp-favs]');
  ok((await names()).length === 1, 'Only favourites lists just the starred one');
  await page.click('[data-symp-favs]');
  await page.fill('[data-symp-q]', 'valve');
  await page.focus('[data-symp-q]');
  await page.keyboard.press('ArrowDown');
  ok(await page.evaluate(() => document.activeElement?.matches('[data-symp-pick]')), 'Down moves from the search box into the symbols');
  const k1 = await page.evaluate(() => document.activeElement.dataset.key);
  await page.keyboard.press('ArrowRight');
  const k2 = await page.evaluate(() => document.activeElement.dataset.key);
  ok(k1 !== k2, 'arrows move between symbols', k1 + ' ' + k2);
  await page.keyboard.press('f');
  ok(await page.evaluate((k) => window.bimcraftSymbols.favourites.has('plumbing', k) || window.bimcraftSymbols.favourites.has('electrical', k), k2), 'F stars the focused symbol');
  await page.keyboard.press('Enter');
  ok(await page.evaluate(() => window.bimcraftPlan.state.tool) === 'plansymbol', 'Enter picks it');
  await page.focus('[data-symp-q]');
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => document.querySelector('[data-symp]').hidden), 'Esc closes the palette');

  console.log('== palette: phone widths');
  for (const [w, h] of [[390, 844], [360, 740]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => document.querySelector('[data-sym-open]').click());
    await page.waitForSelector('[data-symp]:not([hidden])');
    const m = await page.evaluate(() => { const r = document.querySelector('[data-symp]').getBoundingClientRect(); const b = [...document.querySelectorAll('[data-symp-pick]')].slice(0, 6).map((x) => x.getBoundingClientRect()); return { l: r.left, r: r.right, t: r.top, b: r.bottom, sw: document.documentElement.scrollWidth, minH: Math.min(...b.map((x) => x.height)), minW: Math.min(...b.map((x) => x.width)) }; });
    ok(m.l >= 0 && m.r <= w && m.t >= 0 && m.b <= h, `${w} px: the palette fits the screen`, JSON.stringify(m));
    ok(m.sw <= w, `${w} px: no sideways scrolling`, String(m.sw));
    ok(m.minH >= 44 && m.minW >= 44, `${w} px: symbols are touch-size`, `${m.minW}x${m.minH}`);
    await shot(page, 'symbols-phone-' + w);
    await page.click('[data-symp-pick]');
    ok(await page.evaluate(() => document.querySelector('[data-symp]').hidden), `${w} px: picking a symbol steps the sheet aside so the plan shows`);
  }
  const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
  ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  if (problems.length) console.log('  page problems: ' + problems.slice(0, 6).join(' | '));
  await shot(page, 'zz-error').catch(() => {});
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch (e) { /* the session ends on its own */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

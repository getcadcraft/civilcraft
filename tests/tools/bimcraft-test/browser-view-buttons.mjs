#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-view-buttons.mjs — regression guard (owner 2026-11-09): the View group ALWAYS has all nine buttons
 * (Fit, Top, Front, Side, Edges, Spaces, Plan, Split, 3D) once a model is open, whatever Draw is doing, in every layout, at 960/1100/1280/1500
 * wide, and Plan / Split / 3D each switch the view (and drive the Library's Place control).
 *   node tools/bimcraft-test/browser-view-buttons.mjs [--path /lab/bimcraft] [--shots <dir>] [--quick]
 * Layouts: the default (classic) one, the Duncan one, two more workspace layouts, and a layout saved by the frozen build (/use/bimcraft) whose
 * localStorage is copied into the /lab context. --path /use/bimcraft shows the old behaviour (nine buttons missing with Draw off).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, BASE } from '../gpu-remote/browser.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const IFC = path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const PATH = arg('--path', '/lab/bimcraft'), SHOTS = arg('--shots', null), QUICK = process.argv.includes('--quick');
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const NINE = ['Fit', 'Top', 'Front', 'Side', 'Edges', 'Spaces', 'Plan', 'Split', '3D'];
const WIDTHS = QUICK ? [1280] : [960, 1100, 1280, 1500];

const browser = await launch({ webgl: true });
const cookie = labCookie();
const problems = [];
async function openPage(storage) {
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 900 } });
  await ctx.addCookies(cookie);
  if (storage) await ctx.addInitScript((kv) => { try { for (const [k, v] of Object.entries(kv)) if (localStorage.getItem(k) === null) localStorage.setItem(k, v); } catch { /* none */ } }, storage);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => problems.push(e.message));
  await page.goto(BASE + PATH, { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', IFC);   // an opened IFC (not "New building"): Draw starts off
  await page.waitForFunction(() => /^Opened /.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 90000 });
  await page.waitForTimeout(1200);
  return { ctx, page };
}
/** The visible View-group buttons by label (the page's own toolbar, or the layout's own when it moves them). */
const visibleNine = (page) => page.evaluate((names) => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && !e.closest('[hidden]'); };
  const got = {};
  for (const b of document.querySelectorAll('button')) { const t = b.textContent.trim(); if (names.includes(t) && vis(b) && !got[t]) got[t] = true; }
  return names.filter((n) => got[n]);
}, NINE);
const layoutBtn = (v) => `[data-model-layout="${v}"]`;
const mode = (page) => page.evaluate(() => { const on = [...document.querySelectorAll('[data-model-layout]')].find((b) => b.getAttribute('aria-pressed') === 'true'); return on ? on.dataset.modelLayout : null; });
const drawOn = (page) => page.$eval('[data-model-toggle]', (b) => b.getAttribute('aria-pressed') === 'true');
const setDraw = async (page, on) => { if ((await drawOn(page)) !== on) { await page.$eval('[data-model-toggle]', (b) => b.click()); await page.waitForTimeout(400); } };
/** A real click on the visible Plan / Split / 3D button (the first one on screen). */
const clickView = async (page, label) => { const b = page.locator(`button:visible:has(> span:text-is("${label}"))`).first(); await b.click({ timeout: 5000 }); await page.waitForTimeout(450); };

async function guard(name, page, { allNine }) {
  console.log('== ' + name);
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 }); await page.waitForTimeout(400);
    for (const st of ['draw off', 'draw on: plan', 'draw on: split']) {
      if (st === 'draw off') { await setDraw(page, false); await page.$eval(layoutBtn('3d'), (b) => b.click()).catch(() => {}); await page.waitForTimeout(300); }
      else { await page.$eval(layoutBtn(st.endsWith('plan') ? 'plan' : 'split'), (b) => b.click()); await page.waitForTimeout(400); }
      if (!allNine) {   // a workspace layout draws its own view controls (tabs) instead of the View group: the switches must still exist and be enabled
        const n = await page.$$eval('[data-model-layout]', (bs) => bs.length), hid = await page.$eval('[data-model-layout-group]', (g) => g.hidden);
        ok(n === 3 && !hid, `${w}px, ${st}: the layout's Plan / Split / 3D switches exist and are not hidden by the app`);
        continue;
      }
      const got = await visibleNine(page);
      const need = NINE;
      const missing = need.filter((n) => !got.includes(n));
      ok(!missing.length, `${w}px, ${st}: ${allNine ? 'all nine View buttons' : 'Plan, Split and 3D'} visible` + (missing.length ? ' (missing ' + missing.join(', ') + ')' : ''));
      if (SHOTS && w === 1280 && name.startsWith('default')) await page.screenshot({ path: path.join(SHOTS, `${PATH.includes('/use') ? 'before' : 'after'}-view-buttons-${st.replace(/[^a-z]+/g, '-')}.png`), clip: { x: 0, y: 0, width: 1280, height: 300 } });
    }
  }
  // each button switches the view, from each state, and shows pressed
  await page.setViewportSize({ width: 1280, height: 900 }); await page.waitForTimeout(300);
  if (!allNine) return;
  for (const from of ['draw off', 'draw on']) for (const to of [['Plan', 'plan'], ['Split', 'split'], ['3D', '3d']]) {
    if (from === 'draw off') { await page.$eval(layoutBtn('3d'), (b) => b.click()).catch(() => {}); } else { await page.$eval(layoutBtn('split'), (b) => b.click()); }
    await page.waitForTimeout(300);
    try { await clickView(page, to[0]); } catch (e) { ok(false, `from ${from}: click ${to[0]} (${e.message.split('\n')[0]})`); continue; }
    const m = await mode(page);
    ok(m === to[1], `from ${from}: ${to[0]} switches the view (now ${m})`);
    if (to[1] !== '3d') ok(await drawOn(page), `${to[0]} turns Draw on`);
  }
}

try {
  // 1. default layout (classic)
  let { ctx, page } = await openPage(null);
  await guard('default layout', page, { allNine: true });
  // the second row (Level / Floor plan / Draw tools) with Draw on, as before
  await page.$eval(layoutBtn('split'), (b) => b.click()); await page.waitForTimeout(500);
  ok(await page.isVisible('[data-model-level]') && await page.isVisible('[data-mtool="wall"]'), 'Draw on: the second row still shows Level, Floor plan and the Draw tools');
  await setDraw(page, false);
  ok(await page.isHidden('[data-model-level]'), 'Draw off: the second row is closed');
  // Library Place control still follows the view
  await page.click('[data-rtab="library"]'); await page.waitForSelector('.bc-lib-card'); await page.click('.bc-lib-card >> nth=0'); await page.waitForSelector('[data-lib-place]');
  await page.$eval(layoutBtn('plan'), (b) => b.click()); await page.waitForTimeout(300);
  ok((await page.textContent('[data-lib-place]')).trim() === 'Place in plan', 'the Library Place control still follows the view');
  await ctx.close();
  // 2. workspace layouts
  for (const ws of QUICK ? ['duncan'] : ['duncan', 'docked', 'toolbox', 'vector']) {
    ({ ctx, page } = await openPage({ 'cc-workspace': ws }));
    await guard('layout ' + ws, page, { allNine: false });
    await ctx.close();
  }
  // 3. a layout saved by the frozen build, copied through localStorage
  const frozen = await browser.newContext({ viewport: { width: 1500, height: 900 } });
  await frozen.addCookies(cookie);
  await frozen.addInitScript(() => { try { localStorage.setItem('cc-workspace', 'duncan'); } catch { /* none */ } });
  const fp = await frozen.newPage(); await fp.goto(BASE + '/use/bimcraft', { waitUntil: 'networkidle' }); await fp.waitForTimeout(1500);
  const saved = await fp.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  await frozen.close();
  console.log('   copied ' + Object.keys(saved).length + ' localStorage keys saved by the frozen build');
  ({ ctx, page } = await openPage(saved));
  await guard('layout saved by the frozen build', page, { allNine: false });
  await ctx.close();
} catch (e) { fail++; console.log('  FAIL exception: ' + (e.stack || e).toString().split('\n').slice(0, 3).join(' | ')); }
for (const p of problems) { fail++; console.log('  FAIL pageerror: ' + p); }
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);

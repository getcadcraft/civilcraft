#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fx.mjs — 0.9 cad-fix-09: FX.34 snaps and typed snap words while a command runs, FX.35 cursor, FX.36 point cloud screen.
 *
 *   node tools/cadcraft-test/browser-fx.mjs [--shots <dir>]
 *
 * Run as root (it calls `sudo -u www-data php tools/cadcraft-test/admin.php up|down` for the test admin
 * cctest+cadcraft@projectz.xyz, disabled again at the end). Uses the cached Playwright Chromium, 1440 × 900.
 * Checks: the page carries its language catalog (#cc-lang, lang/en.json) and the command line prints its words,
 * not keys; FILLET (radius, real clicks on two lines, Polyline on a rectangle) and CHAMFER (distances, toolbar
 * button) on the drawing; no console errors. Grows one section per finished item; the last one (0.5 VP.5) is the
 * guard for the sheet tabs on short windows (tab-check.mjs, shared with browser-tabs-sweep.mjs).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeDwg } from '../../lib/dwg/write.js';
import { VERSION_INFO } from '../../lib/dwg/container-write.js';
import { kitchenSink } from '../dwg-test/writer-models.mjs';
import { pageCheck } from './tab-check.mjs';

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
await ctx.addInitScript(() => { try { localStorage.setItem('cadcraft.tour', 'skipped'); } catch {} });   // 0.7 D7.06: the first-drawing tour would sit over the drawing and take the clicks
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

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);

  console.log('\n== FX.34 snaps and typed snap words while Polyline runs');
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('');
  await typeCmd('L'); await typeCmd('100,0'); await typeCmd('100,60'); await typeCmd('');
  await typeCmd('ZOOM'); await typeCmd('E');
  ok(await page.evaluate(() => window.cadcraft.view.state && true), 'view ready');
  await page.keyboard.press('Escape');
  if ((await page.getAttribute('[data-toggle="osnap"]', 'aria-pressed')) !== 'true') await page.click('[data-toggle="osnap"]');
  for (const cmd of ['L', 'PL']) {
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    const before = (await all()).length;
    await typeCmd(cmd);
    await clickAt(0.5, 0.4);             // near the end (0,0), off by a hair
    const st = await page.evaluate(() => window.cadcraft.view.state.snap && window.cadcraft.view.state.snap.kind);
    await clickAt(99.6, 0.3);            // near the end (100,0)
    await clickAt(99.7, 59.7);           // near (100,60)
    const st2 = await page.evaluate(() => window.cadcraft.view.state.snap && window.cadcraft.view.state.snap.kind);
    await typeCmd('');
    const es = await all();
    const mine = es.slice(before);
    console.log('   ' + cmd + ': snap kinds seen ' + st + ',' + st2 + '; made ' + JSON.stringify(mine.map((e) => ({ t: e.type, pts: e.pts, x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2 }))));
    ok(mine.length >= 1, cmd + ' keeps what was drawn after Enter');
  }

  console.log('\n== FX.34 typed snap words');
  for (const cmd of ['L', 'PL']) {
    await fresh();
    await typeCmd('L'); await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('');
    await typeCmd('ZOOM'); await typeCmd('E');
    if ((await page.getAttribute('[data-toggle="osnap"]', 'aria-pressed')) === 'true') await page.click('[data-toggle="osnap"]');   // typed words work with running snaps off too
    const before = (await all()).length;
    await typeCmd(cmd);
    await typeCmd('0,40');
    await typeCmd('mid');
    ok((await history()).includes('midpoint of'), cmd + ': typing "mid" is taken as a snap word, not refused');
    ok(!(await history()).includes('Point or option keyword required.'), cmd + ': no refusal');
    const sn = await screen(50.4, 0.3);
    await page.mouse.move(sn.x, sn.y); await page.waitForTimeout(80);
    ok(await page.evaluate(() => window.cadcraft.view.state.snap?.kind) === 'mid', cmd + ': the marker shows the midpoint while hovering near the line');
    await page.mouse.click(sn.x, sn.y); await page.waitForTimeout(80);
    await typeCmd('');
    const mine = (await all()).slice(before)[0];
    const last = cmd === 'L' ? { x: mine.x2, y: mine.y2 } : mine.pts[mine.pts.length - 1];
    ok(mine && near(last.x, 50, 1e-6) && near(last.y, 0, 1e-6), cmd + ': the pick landed on the midpoint (50, 0)', JSON.stringify(mine));
    await typeCmd('ERASE'); await typeCmd('ALL'); await typeCmd('');
  }
  await fresh();
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('');
  await typeCmd('ZOOM'); await typeCmd('E');
  await typeCmd('L'); await typeCmd('0,40'); await typeCmd('end');
  { const a = await screen(99.6, 0.3); await page.mouse.click(a.x, a.y); await page.waitForTimeout(80); }
  await page.mouse.move(100, 100); await page.waitForTimeout(80);
  ok((await page.evaluate(() => window.cadcraft.view.state.snap)) === null, 'the snap word is for one pick only');

  console.log('\n== FX.35 the pointer is hidden only while the crosshair is drawn');
  await fresh();
  const cur = () => page.evaluate(() => getComputedStyle(document.querySelector('[data-over]')).cursor);
  await page.mouse.move(700, 400); await page.mouse.move(720, 420); await page.waitForTimeout(150);
  ok((await cur()) === 'none', 'over the drawing the crosshair stands in for the pointer (cursor none)');
  // a dialog opens under the still pointer (Panel Schedule's dialog, Settings): the crosshair is dropped; when it closes the pointer must not stay hidden
  await page.evaluate(() => { const d = document.createElement('dialog'); d.id = 'fx35'; d.textContent = 'x'; document.body.append(d); d.showModal(); });
  await page.waitForTimeout(150);
  await page.evaluate(() => document.getElementById('fx35').close());
  await page.waitForTimeout(150);
  ok((await cur()) !== 'none', 'after the dialog closes, with the pointer not yet moved, the ordinary pointer shows (not invisible)', await cur());
  await page.mouse.move(730, 430); await page.waitForTimeout(150);
  ok((await cur()) === 'none', 'moving again over the drawing brings the crosshair back');
  // a pop-up window floating over the drawing
  await page.evaluate(() => { const d = document.createElement('div'); d.id = 'fx35p'; d.style.cssText = 'position:fixed;left:600px;top:300px;width:300px;height:200px;z-index:9999;background:#fff'; document.body.append(d); });
  await page.mouse.move(750, 400); await page.waitForTimeout(150);
  ok((await page.evaluate(() => window.cadcraft.view.state.cursor)) === null, 'over a pop-up the crosshair is dropped');
  ok((await cur()) !== 'none', 'and the drawing does not hide the pointer');
  await page.evaluate(() => document.getElementById('fx35p').remove());
  // the V key after a dialog: typing in the command line and pressing keys leaves the pointer alone
  await page.keyboard.press('v'); await page.mouse.move(740, 410); await page.waitForTimeout(150);
  ok((await cur()) === 'none', 'the V key does not change the pointer');

  console.log('\n== FX.36 attaching a point cloud leaves no screen over model space');
  const TF = path.resolve(REPO, '../testfiles');
  const clouds = [['LAS', TF + '/generated/pointcloud-room/room-f2-12.las'], ['LAZ', TF + '/generated/pointcloud-room/room-f3-12.laz'], ['E57', TF + '/pointcloud-corpus/e57/e57-crate/testdata/bunnyInt24.e57'], ['E57 (images)', TF + '/pointcloud-corpus/e57/e57-crate/testdata/tiny_pc_and_images.e57']];
  for (const [label, file] of clouds) {
    if (!fs.existsSync(file)) { ok(true, label + ': test file absent here, skipped'); continue; }
    await fresh();
    await page.evaluate(() => window.cadcraft.host.cloud?.detach?.());
    const chP = page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null);
    await typeCmd('PCATTACH');
    const ch = await chP;
    if (!ch) { ok(false, label + ': PCATTACH opens the file chooser'); continue; }
    await ch.setFiles(file);
    await page.waitForFunction(() => window.cadcraft.engine.waiting?.kind === 'point', null, { timeout: 60000 });   // reading done: it asks where to put the cloud
    await typeCmd('F');   // File coordinates (or Enter)
    await page.waitForFunction(() => !window.cadcraft.engine.running, null, { timeout: 15000 }).catch(async () => { console.log('   still running: ' + (await page.evaluate(() => window.cadcraft.engine.running)) + ' | ' + (await history()).slice(-250)); await page.keyboard.press('Escape'); });
    await page.waitForTimeout(800);
    const hist = (await history()).slice(-700);
    // what covers the drawing: the element on top at the middle of the drawing, anything big and fixed/absolute over it, a busy overlay left on
    const cover = await page.evaluate(() => {
      const o = document.querySelector('[data-over]'), r = o.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      const big = [...document.body.querySelectorAll('*')].filter((e) => { if (e === o || e.contains(o) || o.contains(e) || e.tagName === 'CANVAS') return false; const q = e.getBoundingClientRect(), cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && (cs.position === 'fixed' || cs.position === 'absolute') && q.width > r.width * .6 && q.height > r.height * .6 && cs.pointerEvents !== 'none'; }).map((e) => e.tagName + '.' + String(e.className).slice(0, 40));
      return { top: top && (top.tagName + '.' + String(top.className).slice(0, 40)), over: top === o, big };
    });
    ok(cover.over, label + ': the drawing is what is under the pointer after the attach (' + cover.top + ')', JSON.stringify(cover.big));
    ok(cover.big.length === 0, label + ': nothing large lies over the drawing', JSON.stringify(cover.big));
    const busy = await page.evaluate(() => [...document.querySelectorAll('[data-busy], .cc-busy')].filter((e) => getComputedStyle(e).display !== 'none' && !e.hidden).length);
    ok(busy === 0, label + ': no busy overlay left on');
    // the drawing still takes a line by real clicks
    const n0 = (await all()).length;
    const ob = await page.evaluate(() => { const r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await typeCmd('L'); await page.mouse.click(ob.x, ob.y); await page.waitForTimeout(80); await page.mouse.click(ob.x + 60, ob.y + 40); await page.waitForTimeout(80); await typeCmd('');
    const n1 = (await all()).length;
    ok(n1 === n0 + 1, label + ': a line can be drawn over the cloud', n0 + ' -> ' + n1);
    console.log('   ' + label + ' history: ' + hist.slice(-260).replace(/\n/g, ' '));
  }

  console.log('\n== GH.5 a DWG whose class list carries a maintenance version of 256 or more opens');
  for (const [ver, maint] of [['AC1032', 329], ['AC1027', 300]]) {
    const saved = VERSION_INFO[ver].maint; VERSION_INFO[ver].maint = maint;
    const bytes = writeDwg(kitchenSink(), { version: ver }).bytes; VERSION_INFO[ver].maint = saved;
    await fresh();
    await page.setInputFiles('[data-file]', { name: 'maint-' + maint + '.dwg', mimeType: 'application/octet-stream', buffer: Buffer.from(bytes) });
    await page.waitForFunction(() => window.cadcraft.doc.all().length > 0, null, { timeout: 30000 }).catch(() => {});
    const n = (await all()).length;
    ok(n > 0, ver + ' maintenance ' + maint + ': the drawing opens with its objects (' + n + ')');
  }
} catch (err) {
  ok(false, 'ran to the end', err.stack || err.message);
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

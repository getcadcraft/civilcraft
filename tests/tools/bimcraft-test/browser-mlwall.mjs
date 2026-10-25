#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-mlwall.mjs — 0.7 BIM-MLWALL (walls through several levels) in the lab, headless.
 *   node tools/bimcraft-test/browser-mlwall.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimmlwall; disabled at the end).
 *   a three-level building; the Wall tool's "up to" list offers Level 3; walls drawn on Level 1 up to Level 3 are 6000 tall,
 *   show in Level 2's plan as through walls (not picked), Properties says which levels they run through. Fails on any console error.
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
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimmlwall'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const statusOf = () => page.textContent('[data-status]');

/** The plan: page position of a plan point (mm). */
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
/** Wait until the model has settled (no reload running, nothing queued). */
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 60000 });
const walls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => ({ guid: w.guid, a: w.a.map(Math.round), b: w.b.map(Math.round), t: Math.round(w.t * 100) / 100, h: Math.round(w.height), type: w.typeKey, side: w.extSide, storey: w.storey })));
const levels = () => page.evaluate(() => window.bimcraftPlan.state.data.levels.map((l) => ({ name: l.name, e: Math.round(l.elevation), h: Math.round(l.height) })));
const elementsIn3d = () => page.evaluate(() => document.querySelector('[data-canvas]').viewer.allKeys().size);

try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Through test');
  await page.fill('[data-new-levels]', '3');
  await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await waitStatus(/^New building Through test/);
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');

  console.log('== the Wall tool goes up to any level above');
  await page.click('[data-mtool="wall"]');
  const lv = await levels();
  ok(lv.length === 3, 'three levels (' + lv.map((l) => l.name + ' ' + l.e).join(', ') + ')');
  const opts = await page.$$eval('[data-model-walltop] option', (o) => o.map((x) => [x.value, x.textContent]));
  ok(opts.length === 3 && opts[0][0] === 'level' && /^level:/.test(opts[1][0]) && opts[2][0] === 'fixed', 'the list: the level above, one level further up, a fixed height (' + opts.map((o) => o[1]).join(' | ') + ')');
  await page.selectOption('[data-model-walltop]', opts[1][0]);
  for (const [x, y] of [[0, 0], [6000, 0], [6000, 4000]]) { await page.evaluate((p) => window.bimcraftPlan.click(p), [x, y]); await settled(); }
  await settled();
  let W = await walls();
  ok(W.length === 2 && W.every((w) => w.h === 6000), 'two walls drawn on Level 1 up to Level 3: 6000 tall (' + W.map((w) => w.h).join(', ') + ')');

  console.log('== Level 2\'s plan cuts them; Properties says so');
  const l2 = await page.$$eval('[data-model-level] option', (o) => o.map((x) => [x.value, x.textContent]));
  await page.selectOption('[data-model-level]', l2.find((o) => o[1] === 'Level 2')[0]);
  await settled();
  const th = await page.evaluate(() => window.bimcraftPlan.view.scene.through.map((w) => w.pieces.length));
  ok(th.length === 2 && th.every((n) => n === 1), 'Level 2\'s plan has the two walls as through walls');
  const own = await page.evaluate(() => window.bimcraftPlan.view.scene.walls.length);
  ok(own === 0, 'and no walls of its own');
  await shot(page, 'mlwall-01-level2');
  console.log('== Level 2: a door and a window on the wall that runs through');
  await page.evaluate(() => window.bimcraftPlan.view.fit());
  await page.click('[data-mtool="door"]');
  await planClick(3000, 0);
  await settled();
  let ops = await page.evaluate(() => window.bimcraftPlan.state.data.openings.map((o) => ({ kind: o.kind, sill: Math.round(o.sill), storey: o.storey })));
  ok(ops.length === 1 && ops[0].kind === 'door' && ops[0].sill === 3000, 'a door clicked on the through wall from Level 2 stands on Level 2\'s floor (sill ' + (ops[0] && ops[0].sill) + ')');
  const sc = await page.evaluate(() => ({ sym: window.bimcraftPlan.view.scene.symbols.length, rooms: window.bimcraftPlan.view.scene.rooms.length, level: window.bimcraftPlan.state.level }));
  ok(sc.sym === 1, 'its symbol is drawn on Level 2\'s plan');
  await shot(page, 'mlwall-02-door');
  await page.selectOption('[data-model-level]', l2.find((o) => o[1] === 'Level 1')[0]);
  await settled();
  const sym1 = await page.evaluate(() => window.bimcraftPlan.view.scene.symbols.length);
  ok(sym1 === 0, 'and it is not on Level 1\'s plan');
  await page.click('[data-act="undo"]');
  await settled();
  ok((await page.evaluate(() => window.bimcraftPlan.state.data.openings.length)) === 0, 'one Undo takes the door off again');
  await page.selectOption('[data-model-level]', l2.find((o) => o[1] === 'Level 2')[0]);
  await settled();
  await page.selectOption('[data-model-level]', l2.find((o) => o[1] === 'Level 1')[0]);
  await settled();
  await page.click('[data-mtool="select"]');
  await page.evaluate(() => window.bimcraftPlan.view.fit()); await planClick(3000, 0); await settled();
  await page.waitForSelector('[data-mp-top]', { timeout: 8000 }).catch(async () => { console.log('    debug', await page.evaluate(() => JSON.stringify({ tool: window.bimcraftPlan.state.tool, level: window.bimcraftPlan.state.level, sel: [...(document.querySelector('[data-canvas]').viewer.selection || [])], props: [...document.querySelectorAll('[data-mp-height],[data-mp-type],[data-mp-thick]')].length }))); await shot(page, 'mlwall-debug'); });
  const topVal = await page.$eval('[data-mp-top]', (s) => s.options[s.selectedIndex].textContent);
  ok(/Level 3/.test(topVal), 'Properties: the wall\'s top reads "' + topVal + '"');
  const rows = await page.evaluate(() => document.body.innerText);
  ok(/Runs through/.test(rows) && /Level 2/.test(rows), 'Properties: Runs through Level 2');
  await shot(page, 'mlwall-02-props');
  await page.selectOption('[data-mp-top]', { index: 0 });
  await settled();
  W = await walls();
  ok(W.some((w) => w.h === 3000), 'choosing the level above shortens that wall to 3000');
  await page.click('[data-act="undo"]');
  await settled();
  W = await walls();
  ok(W.every((w) => w.h === 6000), 'one Undo puts it back to 6000');
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
} finally {
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimwalls'], { stdio: 'ignore' }); } catch {}
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

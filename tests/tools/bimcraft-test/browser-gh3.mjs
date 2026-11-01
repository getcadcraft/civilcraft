#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-gh3.mjs — GH.3-D (a selected roof's settings, one undo step) and GH.3-E (TJI floor from a table you load) in the lab,
 * headless, real clicks. Session gh3build_PART_3.
 *   node tools/bimcraft-test/browser-gh3.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/shell-test/admin.php session). One app. Fails on any console error.
 * The only table loaded is tools/bimcraft-test/fixtures/tji-example.json (made-up numbers, "EXAMPLE, not for design").
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
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py); };
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 60000 });
const roofs = () => page.evaluate(() => window.bimcraftPlan.state.data.derived.roofs.map((r) => ({ guid: r.guid, pitch: r.pitch, overhang: r.overhang, fascia: r.fascia, soffit: r.soffit })));
const levelValues = () => page.$$eval('[data-model-level] option', (o) => o.map((x) => x.value));
const changes = () => page.evaluate(() => document.querySelector('[data-canvas]')?.viewer ? null : null);

try {
  await ctx.addCookies([{ name: minted.cookie.split('=')[0], value: minted.cookie.split('=').slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('cc-bimcraft:tji-table'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'GH3 test');
  await page.fill('[data-new-levels]', '2');
  await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await waitStatus(/^New building GH3 test/);
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await page.click('[data-mtool="wall"]');
  await page.selectOption('[data-model-walltype]', 'ext-2x6');
  await page.click('[data-model-fit]');
  for (const [x, y] of [[0, 0], [5000, 0], [5000, 4500], [0, 4500], [0, 0]]) await planClick(x, y);
  await settled();
  ok((await page.evaluate(() => window.bimcraftPlan.state.data.walls.length)) === 4, 'a 5 x 4.5 m room of four walls');

  console.log('== GH.3-D: edit a selected roof');
  await page.click('[data-mtool="roof"]');
  await page.fill('[data-model-rfpitch]', '6/12'); await page.press('[data-model-rfpitch]', 'Enter');
  await page.selectOption('[data-model-rfends]', 'hip');
  await planClick(2500, 2250);
  await settled();
  const lv = await levelValues();
  await page.selectOption('[data-model-level]', lv[0]);
  await settled();
  await page.click('[data-mtool="select"]');
  await planClick(2500, 2250);
  await page.waitForSelector('[data-mp-rfpitch]');
  const R0 = (await roofs())[0];
  const undoCount = () => page.evaluate(() => document.querySelectorAll('[data-changes] li, [data-change-list] li').length);
  void undoCount;
  // three pitches typed one after another: one Undo puts back the first pitch
  for (const v of ['7/12', '8/12', '9/12']) { await page.fill('[data-mp-rfpitch]', v); await page.press('[data-mp-rfpitch]', 'Enter'); await settled(); await page.waitForSelector('[data-mp-rfpitch]'); }
  const R1 = (await roofs())[0];
  ok(Math.abs(Math.tan(R1.pitch * Math.PI / 180) - 0.75) < 0.01, 'pitch typed three times in Properties: the roof is at 9/12 (live in the plan and 3D)', String(R1.pitch));
  await page.fill('[data-mp-rfover]', '600'); await page.press('[data-mp-rfover]', 'Enter'); await settled();
  await page.waitForSelector('[data-mp-rffascia]');
  await page.fill('[data-mp-rffascia]', '0'); await page.press('[data-mp-rffascia]', 'Enter'); await settled();
  await page.waitForSelector('[data-mp-rfsoffit]');
  await page.uncheck('[data-mp-rfsoffit]'); await settled();
  let R2 = (await roofs())[0];
  ok(R2.fascia === 0 && R2.soffit === false && Math.abs(R2.overhang - 600) < 1, 'overhang, fascia and soffit changed on the selected roof');
  await page.click('[data-act="undo"]'); await settled();
  ok((await roofs())[0].soffit === true, 'Undo 1: the soffit is back (one step for the soffit)');
  await page.click('[data-act="undo"]'); await settled();
  ok((await roofs())[0].fascia > 0, 'Undo 2: the fascia is back');
  await page.click('[data-act="undo"]'); await settled();
  ok(Math.abs((await roofs())[0].overhang - R0.overhang) < 1, 'Undo 3: the overhang is back');
  await page.click('[data-act="undo"]'); await settled();
  const R3 = (await roofs())[0];
  ok(Math.abs(R3.pitch - R0.pitch) < 1e-6, 'Undo 4: the three pitch edits are ONE step; the roof is back at its first pitch', String(R3.pitch) + ' vs ' + R0.pitch);
  await planClick(2500, 2250);
  await page.waitForSelector('[data-mp-rfpitch]');
  await page.fill('[data-mp-rfpitch]', '89'); await page.press('[data-mp-rfpitch]', 'Enter'); await settled();
  ok(/pitch/i.test(await page.textContent('[data-status]')) && Math.abs((await roofs())[0].pitch - R0.pitch) < 1e-6, 'a pitch of 89 degrees is refused with the tool\'s message and the roof is unchanged', await page.textContent('[data-status]'));
  await shot(page, 'gh3-01-roof');

  console.log('== GH.3-E: TJI floor from a table you load');
  // the roof goes (so the click on the plan frames the floor, not the roof over it)
  await page.keyboard.press('Delete'); await settled();
  ok((await roofs()).length === 0, 'the roof deleted to leave the floor to frame', 'walls ' + await page.evaluate(() => window.bimcraftPlan.state.data.walls.length) + ' level ' + await page.evaluate(() => window.bimcraftPlan.state.level));
  await page.keyboard.press('Escape');
  await page.selectOption('[data-model-level]', (await levelValues()).at(-1)); await settled();
  await page.keyboard.press('Escape');
  await page.click('[data-mtool="floor"]');
  await page.selectOption('[data-model-flmode="floor"]', 'building');
  await planClick(2500, 2250);
  await settled();
  ok((await page.evaluate(() => window.bimcraftPlan.state.data.derived.floors.length)) === 1, 'a floor over the room', await page.textContent('[data-status]'));
  await page.click('[data-res-tools] > summary');
  await page.click('[data-mtool="framing"]');
  await page.selectOption('[data-res-frfloor]', 'tji');
  ok(await page.isVisible('[data-res-tjiload]') && /table/i.test(await page.textContent('[data-res-tjiname]')), 'the Framing tool offers "Load a table…" for TJI and says a table is needed');
  await planClick(2500, 2250);
  await settled();
  let F = await page.evaluate(() => window.bimcraftRes.state.frames.map((f) => ({ kind: f.kind, parts: f.parts.length, mode: f.floorMode })));
  const stat0 = await page.textContent('[data-status]');
  ok(!F.some((f) => f.kind === 'floor') && /Load a TJI table: the manufacturer's tables are theirs and are not built in/.test(stat0), 'no table: the TJI floor is refused in plain words and nothing is framed', stat0 + ' ' + JSON.stringify(F));
  // sawn lumber still frames with no table
  await page.selectOption('[data-res-frfloor]', 'lumber');
  await planClick(2500, 2250); await settled();
  F = await page.evaluate(() => window.bimcraftRes.state.frames.map((f) => ({ kind: f.kind, parts: f.parts.length, mode: f.floorMode })));
  ok(F.some((f) => f.kind === 'floor' && f.mode === 'lumber'), 'solid sawn joists still frame with no table');
  await page.selectOption('[data-res-frfloor]', 'tji');
  // a file that is not a table is refused with a message
  const bad = path.join(process.env.TMPDIR || '/tmp', 'gh3-bad-table.json');
  fs.writeFileSync(bad, '{"format":"nope"}');
  await page.setInputFiles('[data-res-tjifile]', bad);
  await page.waitForTimeout(500);
  ok(/joist table/i.test(await page.textContent('[data-status]')), 'a file that is not a joist table is refused with a plain message', await page.textContent('[data-status]'));
  fs.unlinkSync(bad);
  await page.setInputFiles('[data-res-tjifile]', path.join(REPO, 'tools/bimcraft-test/fixtures/tji-example.json'));
  await page.waitForTimeout(500);
  ok(/EXAMPLE/.test(await page.textContent('[data-res-tjiname]')), 'the table loads from the Framing tool and its name shows');
  await planClick(2500, 2250); await settled();
  F = await page.evaluate(() => window.bimcraftRes.state.frames.map((f) => ({ kind: f.kind, parts: f.parts.length, mode: f.floorMode })));
  ok(F.some((f) => f.kind === 'floor' && f.mode === 'tji'), 'a floor framed as TJI (preliminary) from the loaded table', JSON.stringify(F));
  await page.evaluate(() => { const f = window.bimcraftRes.state.frames.find((x) => x.kind === 'floor'); window.bimcraftRes.api.host.select([window.bimcraftRes.api.kb() + f.parts[0]]); });
  await page.waitForSelector('[data-mp-tjiload]');
  ok(/EXAMPLE/.test(await page.textContent('[data-mp-tjitable]')), 'Properties names the loaded table');
  await page.waitForSelector('[data-mp-tjiassume]', { timeout: 8000 }).catch(async () => console.log('   status: ' + await page.textContent('[data-status]') + ' | ' + await page.evaluate(() => JSON.stringify(window.bimcraftRes.state.frames.map((f) => [f.kind, f.floorMode, f.spacing, f.notes])))));
  const assume = await page.textContent('[data-mp-tjiassume]');
  ok(/EXAMPLE/.test(await page.textContent('[data-mp-tjitable]')) && /live load 40 psf/.test(assume) && /Preliminary layout guidance; final selection needs the manufacturer's tables and the project loads/.test(assume), 'the example table loaded: the assumptions are stated under it', assume);
  const sz = await page.evaluate(() => { const w = window.bimcraftRes.state.frames.find((x) => x.kind === 'floor'); return w.tji || null; });
  ok(sz && sz.Series, 'the framing recorded the table\'s series and assumptions', JSON.stringify(sz));
  await page.selectOption('[data-mp-tjicase]', 'EX-30-10-L360'); await settled();
  await page.waitForSelector('[data-mp-tjiassume]');
  ok(/live load 30 psf/.test(await page.textContent('[data-mp-tjiassume]')), 'another load case: its own loads are stated');
  await page.selectOption('[data-mp-tjicase]', 'EX-40-10-L480'); await settled();
  // the Lumber schedule carries the assumptions; Problems lists them
  await page.selectOption('[data-msched-kind]', 'lumber');
  await page.waitForTimeout(300);
  ok(/Preliminary layout guidance/.test((await page.textContent('[data-schedule-note]').catch(() => '')) || ''), 'the Lumber schedule prints the assumptions and the preliminary statement');
  await page.waitForFunction(() => window.ccProblems?.store.list({ source: 'bimcraft.framing' }).length, null, { timeout: 8000 }).catch(() => {});
  const probs = await page.evaluate(() => (window.ccProblems?.store.list({ source: 'bimcraft.framing' }) || []).filter((p) => /^frame\.tji\./.test(p.code)).map((p) => p.code));
  ok(probs.includes('frame.tji.example') && probs.includes('frame.tji.assumptions'), 'Problems: the EXAMPLE warning and the assumptions note', JSON.stringify(probs));
  await shot(page, 'gh3-02-tji');
  // reload keeps the table (this browser)
  await page.reload({ waitUntil: 'networkidle' });
  ok(await page.evaluate(() => !!localStorage.getItem('cc-bimcraft:tji-table')), 'the table is kept in this browser');
} catch (e) {
  fail++; console.log('  FAIL ' + (e && e.stack || e));
} finally {
  const real = problems.filter((p) => !/favicon|404|net::ERR/.test(p));
  ok(real.length === 0, 'no console errors', real.slice(0, 3).join(' | '));
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'down'], { stdio: 'ignore' }); } catch (e) { /* none */ }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

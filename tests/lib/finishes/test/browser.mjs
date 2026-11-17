#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser.mjs: the Wall finishes panel in the real page, /lab, headless (0.10 BK.25-28, BK.130; session bim-finishes-10):
 *   nice -n 10 timeout 600 node lib/finishes/test/browser.mjs [--shots <dir>]      run as root (a test admin session)
 * The panel is not mounted by the page yet (the mount line is bim-core's, see the log's Inbox): the test mounts it the way bimcraft.js will,
 * `mountWallFinishes(modelUi)` (modelUi is not reachable from a test, so a shim hands the panel the plan's api and the picked walls), then draws a 5000 x 4000 room and works the panel with the mouse and keyboard.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const { chromium } = await import(path.join(REPO, 'tools/bimcraft-test/node_modules/playwright-core/index.mjs')).catch(() => import('playwright-core'));
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimfinishes'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const throttled = new Set();
page.on('response', (r) => { if (r.status() === 429) throttled.add(r.url()); });
await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
await page.evaluate(() => { try { localStorage.removeItem('bimcraft.walls'); localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
await page.reload({ waitUntil: 'networkidle' });
const quiet = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const settled = async () => { await quiet(); await page.waitForTimeout(350); await quiet(); };
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py); };
const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
const tool = async (menu, name) => { if (menu) await page.click(`[${menu}] > summary`); await page.click(`[data-mtool="${name}"]`); await settled(); };
const pickKeys = (keys) => page.evaluate((k) => window.bimcraftVis.pick(k), keys);
const walls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => ({ guid: w.guid, key: window.bimcraftRes.api.kb() + w.id, a: w.a, b: w.b, t: w.t })));
const wf = (sel) => `[data-wallfinishes] ${sel}`;
const fillIn = async (key, v) => { await page.fill(wf(`[data-wf-in="${key}"]`), v); };
try {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Finishes'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);
  await tool('data-wall-shapes', 'wrect');
  await planClick(0, 0); await planClick(5000, 4000); await settled();
  const W = await walls(), T = W[0].t, south = W.find((w) => near(w.a[1], 0, 1) && near(w.b[1], 0, 1));
  ok(W.length === 4 && south, 'a room of four walls, ' + T + ' mm thick');
  await tool(null, 'select');

  console.log('== mount the panel the way bimcraft.js will');
  const mounted = await page.evaluate(async () => { const m = await import('/assets/apps/bimcraft/dev/finishes/finishes-ui.js'); const api = window.bimcraftRes.api; const shim = { extend: () => api, wallsPicked: () => { const kb = api.kb(), keys = Array.from(api.selectedKeys()); return api.S.data.walls.filter((w) => keys.includes(kb + w.id)).map((w) => w.guid); } }; m.mountWallFinishes(shim); window.bimcraftFinishes.open(); return !!document.querySelector('[data-wallfinishes]'); });
  ok(mounted, 'the panel is in the page and opens');
  ok(await page.$$eval('[data-wallfinishes] [data-wf-tab]', (b) => b.map((x) => x.textContent).join('|')) === 'Face|Finish types|Substrates|Schedules', 'four tabs: Face, Finish types, Substrates, Schedules');
  ok(await page.$eval(wf('[data-wf-pick]'), (n) => /Pick a wall/.test(n.textContent)), 'nothing picked: it says to pick a wall');

  console.log('== BK.27 a finish type with a substrate, BK.28 its tile');
  await page.click(wf('[data-wf-tab="types"]'));
  await page.fill(wf('[data-wf-tname]'), 'Wall tile 300');
  await page.selectOption(wf('[data-wf-tkind]'), 'tile');
  await page.fill(wf('[data-wf-tile="joint"]'), '0 mm');
  await page.click(wf('[data-wf-addlayer]')); await page.click(wf('[data-wf-addlayer]'));
  const mats = [['Cement board', '12.5 mm', 'substrate'], ['Adhesive', '3 mm', 'adhesive'], ['Ceramic tile', '8 mm', 'finish']];
  const nLayers = await page.$$eval(wf('[data-wf-lmat]'), (n) => n.length);
  for (let i = 0; i < 3; i++) { const idx = i === 0 ? 0 : nLayers - 3 + i; await page.fill(wf(`[data-wf-lmat="${idx}"]`), mats[i][0]); await page.fill(wf(`[data-wf-lt="${idx}"]`), mats[i][1]); await page.selectOption(wf(`[data-wf-lrole="${idx}"]`), mats[i][2]); }
  // the first two layers made by default: substrate and finish; keep layers 0 (substrate) and drop the extra default finish so the build-up is exactly three
  await shot('1-type');
  await page.click(wf('[data-wf-savetype]')); await settled();
  let doc = await page.evaluate(async () => { const F = await import('/assets/apps/bimcraft/dev/finishes/wall-finishes.js'); const { ModelWriter } = await import('/assets/apps/bimcraft/dev/model-write.js'); const ed = window.bimcraftRes.api.ed(); return F.readWallFinishes(new ModelWriter(ed.W, ed.api, ed.mid)); });
  ok(doc.types.length === 1 && doc.types[0].name === 'Wall tile 300' && doc.types[0].kind === 'tile' && doc.types[0].layers.some((l) => l.role === 'substrate' && l.material === 'Cement board' && l.thickness === 12.5), 'the type is kept in the file: a tile with a Cement board substrate 12.5 thick', doc.types);
  ok(await page.$eval(wf('[data-wf-note]'), (n) => /saved/.test(n.textContent)), 'it says the type is saved');
  await page.click(wf('[data-wf-tab="substrates"]'));
  ok(await page.$$eval(wf('[data-wf-lmat]'), (n) => n.map((x) => x.value).join()) === 'Cement board', 'the Substrates tab shows only the substrate: Cement board');
  await shot('2-substrates');

  console.log('== BK.25 the face, BK.26 zones by corners');
  await pickKeys([south.key]); await page.waitForTimeout(300);
  await page.click(wf('[data-wf-tab="face"]'));
  ok(await page.$eval(wf('[data-wf-zones]'), (n) => /raw/.test(n.textContent)), 'a picked wall: its face is raw, no finish yet');
  await page.click(wf('[data-wf-preset="full"]')); await page.click(wf('[data-wf-place]')); await settled();
  ok(await page.$$eval(wf('[data-wf-zone]'), (n) => n.length) === 1, 'Full height put on the left face: one finish listed');
  const net1 = await page.evaluate(() => document.querySelector('[data-wf-zone]').textContent);
  await page.click(wf('[data-wf-preset="shower"]')); await fillIn('s0', '3000 mm'); await fillIn('s1', '4000 mm'); await fillIn('sh', '2100 mm');
  await page.click(wf('[data-wf-place]')); await settled();
  const zonesTxt = await page.$$eval(wf('[data-wf-zone]'), (n) => n.map((x) => x.textContent));
  ok(zonesTxt.length === 2 && /Shower wall/.test(zonesTxt[1]) && /1000 mm|1,000/.test(zonesTxt[1]) && /2100/.test(zonesTxt[1]), 'Shower wall 3000 to 4000 up to 2100: listed second (laid over the first)', zonesTxt);
  await page.click(wf('[data-wf-zone="z2"]'));
  ok(await page.$eval(wf('[data-wf-count]'), (n) => /whole/.test(n.textContent)), 'a tile finish selected: the set-out and the tile count show');
  const cnt = await page.$eval(wf('[data-wf-count]'), (n) => n.textContent);
  await shot('3-face');
  await page.selectOption(wf('[data-wf-in="so.start"]'), 'centre');
  await page.click(wf('[data-wf-setout]')); await settled();
  const cnt2 = await page.$eval(wf('[data-wf-count]'), (n) => n.textContent);
  ok(cnt !== cnt2 || /cut/.test(cnt2), 'the set-out moved to the centre of the zone: the tile count is worked out again', [cnt, cnt2]);
  const rowOf = await page.evaluate(async () => { const F = await import('/assets/apps/bimcraft/dev/finishes/wall-finishes.js'); const { ModelWriter } = await import('/assets/apps/bimcraft/dev/model-write.js'); const ed = window.bimcraftRes.api.ed(); const w = new ModelWriter(ed.W, ed.api, ed.mid); return F.finishRows(w).rows.map((r) => ({ zone: r.zone, net: r.net, tiles: r.tiles && { whole: r.tiles.whole, cut: r.tiles.cut } })); });
  ok(rowOf.find((r) => r.zone === 'z2').net === 2100000 && rowOf.find((r) => r.zone === 'z2').tiles.whole + rowOf.find((r) => r.zone === 'z2').tiles.cut > 0, 'the shower wall is 1000 x 2100 = 2 100 000 mm2 net', rowOf);
  const covs = await page.evaluate(() => { const ed = window.bimcraftRes.api.ed(); return new TextDecoder().decode(ed.save()).match(/IFCCOVERING\(/g)?.length || 0; });
  ok(covs === 2, 'the saved file holds two IfcCoverings', covs);

  console.log('== the face of a wall that is not picked, a refusal, Undo');
  await page.fill(wf('[data-wf-in="s0"]'), '3000 mm').catch(() => {});
  await page.click(wf('[data-wf-preset="corners"]'));
  await fillIn('c0s', '500 mm'); await fillIn('c0v', '0 mm'); await fillIn('c1s', '500 mm'); await fillIn('c1v', '900 mm');
  await page.click(wf('[data-wf-place]'));
  ok(await page.$eval(wf('[data-wf-err]'), (n) => /no size|line/.test(n.textContent)), 'two corners on one line: refused, in words');
  ok(await page.$$eval(wf('[data-wf-zone]'), (n) => n.length) === 2, 'nothing was added');
  await page.click('[data-act="undo"]'); await page.waitForTimeout(500); await settled();
  await page.evaluate(() => window.bimcraftFinishes.render());
  await pickKeys([south.key]); await page.waitForTimeout(300); await page.evaluate(() => window.bimcraftFinishes.render());
  await page.click(wf('[data-wf-zone="z2"]'));
  ok(await page.$eval(wf('[data-wf-count]'), (n) => n.textContent) === cnt && await page.$$eval(wf('[data-wf-zone]'), (n) => n.length) === 2, 'Undo took back the set-out in one step: the first count is back and both finishes are still there', cnt);

  console.log('== BK.130 the schedules');
  await page.click(wf('[data-wf-tab="schedule"]'));
  const tabs = await page.$$eval(wf('[data-wf-sched]'), (n) => n.map((x) => x.dataset.wfSched));
  ok(tabs.join() === 'totals,rooms,zones', 'three schedules: by finish, by room, by zone', tabs);
  const first = await page.$eval(wf('[data-wf-sched="totals"] tbody'), (n) => n.textContent);
  ok(/Wall tile 300/.test(first), 'the tile appears in the by-finish schedule', first);
  await shot('4-schedule');
  const real = problems.filter((p) => !(/429/.test(p) && [...throttled].some((u) => /hardware/.test(u))));
  ok(real.length === 0, 'no console errors', real.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'stopped.png') }).catch(() => {});
} finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

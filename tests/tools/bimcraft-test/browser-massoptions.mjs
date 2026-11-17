#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-massoptions.mjs: BK.44 massing option sets in the real page, /lab, headless (session bk-r3-stages-10):
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-massoptions.mjs [--shots <dir>]      run as root (a test admin session)
 * A new one-level building on a 20 000 x 30 000 mm site. The room program's options are found in a 40 x 30 m outline, so they
 * can stand outside the 20 m wide site: the current option over the boundary is warned about in Problems, another is not.
 * Then ModelCraft's massing file (made here by ModelCraft's own massing-mc.js from tools/modelcraft-test/massing-model.mjs:
 * Bar 600 m2, Stepped 500 m2, L 600 m2 gross) is added through "Add massing options from a file".
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
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimmassopt'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const throttled = new Set();
page.on('response', (r) => { if (r.status() === 429) throttled.add(r.url()); });
await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
await page.reload({ waitUntil: 'networkidle' });
const quiet = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const settled = async () => { await quiet(); await page.waitForTimeout(350); await quiet(); };
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, o) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, o); };
const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
const rebuilt = () => page.waitForFunction(() => !/Working/.test(document.body.innerText.slice(0, 200000)), null, { timeout: 90000 }).catch(() => {});
const undo = async () => { await page.click('[data-act="undo"]'); await page.waitForTimeout(400); await rebuilt(); await settled(); };
const tool = async (menu, name) => { if (menu && !(await page.evaluate((m) => document.querySelector(`[${m}]`)?.open, menu))) await page.click(`[${menu}] > summary`); await page.click(`[data-mtool="${name}"]`); await settled(); };
const waitProblems = (n) => page.waitForFunction((n) => window.ccProblems.store.list({ source: 'bimcraft.site' }).length >= n, n, { timeout: 15000 }).catch(() => {});
const siteProblems = () => page.evaluate(() => window.ccProblems.store.list({ source: 'bimcraft.site' }).map((p) => ({ code: p.code, severity: p.severity, text: p.text, about: p.about.map((a) => a.id) })));
const sets = () => page.evaluate(() => window.bimcraftMassOptions.sets().map((s) => ({ set: s.set, options: s.options.map((o) => ({ guid: o.guid, id: o.id, option: o.option, current: o.current, floors: o.floors, foot: o.footprint_m2, gross: o.gross_m2, vol: o.volume_m3, spaces: o.spaces, simplified: o.simplified, x0: Math.min(...o.pts.map((p) => p[0])), x1: Math.max(...o.pts.map((p) => p[0])) })) })));
const rows = () => page.evaluate(() => [...document.querySelectorAll('[data-massopt-row]')].map((r) => ({ guid: r.dataset.massoptRow, name: r.querySelector('[data-massopt-option]')?.textContent, current: !!r.querySelector('[data-massopt-current]'), floors: r.querySelector('[data-massopt-floors]').textContent, gross: r.querySelector('[data-massopt-gross]').textContent, make: !!r.querySelector('[data-massopt-make]') })));
const changes = () => page.evaluate(() => window.bimcraftPlan.state && document.querySelectorAll('[data-change-list] li, [data-changes] li').length);
const frame = async () => { await page.evaluate(() => window.bimcraftPlan.view.fit({ x0: -2500, y0: -2500, x1: 22500, y1: 32500 })); };
// ModelCraft's massing file, made by ModelCraft's own code
const MC = path.join(REPO, 'public_html/assets/apps/modelcraft/dev');
const MCI = await import(path.join(MC, 'i18n.js'));
MCI.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(MC, 'lang/en.json'), 'utf8')) });
const { buildMassingModel } = await import(path.join(REPO, 'tools/modelcraft-test/massing-model.mjs'));
const MM = await import(path.join(MC, 'massing-mc.js'));
const mcFile = MM.massingFile((await buildMassingModel(MC)).model, { floorHeight: 3, set: 'From ModelCraft', name: 'tower' });
const TMP = path.join(REPO, 'tmp/bimcraft-test'); fs.mkdirSync(TMP, { recursive: true });
const mcPath = path.join(TMP, 'tower-massing.ifc'); fs.writeFileSync(mcPath, mcFile.text);
try {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Massing options'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);
  await page.waitForFunction(() => window.ccProblems && window.bimcraftSiteConstraints && window.bimcraftMassOptions);
  await page.click('[data-res-tools] > summary');
  await page.click('[data-mtool="site"]'); await settled(); await frame();
  await planClick(0, 0); await planClick(20000, 0); await planClick(20000, 30000); await planClick(0, 30000);
  await page.keyboard.press('Enter'); await settled();
  ok(await page.evaluate(() => window.bimcraftSite.state.site?.points.length === 4), 'a 20 x 30 m site is drawn');
  await page.keyboard.press('Escape');

  console.log('== keep options from the room program');
  await page.evaluate(() => { const d = document.querySelector('[data-eg58-details]'); d.open = true; d.scrollIntoView(); });
  await page.waitForSelector('[data-massopt-keep]');
  ok(await page.evaluate(() => !!document.querySelector('[data-massopt-empty]') && document.querySelector('[data-massopt]').previousElementSibling.matches('[data-eg58]')), 'the massing options block sits under the room program, empty at first');
  await page.fill('[data-eg58-field="width"]', '40'); await page.fill('[data-eg58-field="depth"]', '30');
  await page.click('[data-eg58-find]');
  await page.waitForSelector('[data-eg58-options] li');
  const opts = await page.evaluate(() => window.bimcraftMassOptions && [...document.querySelectorAll('[data-eg58-option]')].map((o) => o.value));
  const picked = await page.evaluate(() => document.querySelector('[data-eg58-option]:checked')?.value);
  const prog = await page.evaluate((k) => { const o = JSON.parse(JSON.stringify(window.bimcraftProgram?.options?.() || [])); return o.find((x) => x.key === k) || null; }, picked);
  await page.fill('[data-massopt-set]', 'Scheme A');
  await page.click('[data-massopt-keep]'); await rebuilt(); await settled();
  let S = await sets(), R = await rows();
  ok(S.length === 1 && S[0].set === 'Scheme A' && S[0].options.length === 1 && S[0].options[0].current && S[0].options[0].spaces === S[0].options[0].floors, 'Keep the selected option: one option in "Scheme A", current, with a floor space per floor', S);
  ok(R.length === 1 && R[0].current && !R[0].make && /m²/.test(R[0].gross), 'the list shows it as current with its gross floor area: ' + R[0]?.name + ', ' + R[0]?.gross, R);
  if (prog) ok(S[0].options[0].floors === prog.floors && near(S[0].options[0].foot, prog.footprint_m2, prog.footprint_m2 * 1e-3) && near(S[0].options[0].gross, prog.gross_m2, prog.gross_m2 * 1e-3), 'its floors, footprint and gross area are the program option\'s to a thousandth (its corners are whole millimetres) (' + prog.footprint_m2 + ' m2, ' + prog.gross_m2 + ' m2)', [S[0].options[0], prog.footprint_m2, prog.gross_m2]);
  ok(await page.evaluate(() => window.bimcraftPlan.state.data.walls.length === 0), 'nothing is built: no walls');
  ok(/kept as a massing option/.test(await page.evaluate(() => document.querySelector('[data-status]')?.textContent || '')), 'the status line says it was kept');
  const first = S[0].options[0];
  await waitProblems(first.x1 > 20000 ? 1 : 0);
  let P = await siteProblems();
  if (first.x1 > 20000.5) ok(P.length >= 1 && P.every((p) => p.severity === 'warning' && p.about[0] === first.guid) && P.some((p) => p.code === 'site.boundary.cross' && /Massing option/.test(p.text)), 'the current option reaches x = ' + Math.round(first.x1) + ' on a 20 000 wide site: a warning in Problems names it', P);
  else ok(P.length === 0, 'the current option stands inside the site: no warning', P);
  // a second option: pick another radio
  const other = opts.find((k) => k !== picked);
  await page.check(`[data-eg58-option="${other}"]`);
  await page.click('[data-massopt-keep]'); await rebuilt(); await settled();
  S = await sets(); R = await rows();
  ok(S[0].options.length === 2 && S[0].options[0].current && !S[0].options[1].current && S[0].options[1].spaces === 0 && R[1].make, 'a second option is kept beside it, not current, with a Make current button', S);
  const n1 = (await siteProblems()).length;
  await page.click(`[data-massopt-row="${S[0].options[1].guid}"] [data-massopt-make]`); await rebuilt(); await settled();
  S = await sets();
  ok(!S[0].options[0].current && S[0].options[1].current && S[0].options[1].spaces === S[0].options[1].floors && S[0].options[0].spaces === 0, 'Make current: the second is current, the floor spaces moved to it', S);
  await page.waitForTimeout(700);
  P = await siteProblems();
  ok(P.every((p) => p.about[0] === S[0].options[1].guid), 'the site warnings (' + P.length + ', before ' + n1 + ') are now about the new current option only', P);
  await undo();
  S = await sets();
  ok(S[0].options[0].current && !S[0].options[1].current, 'Undo: the first option is current again, the list follows', S);
  await shot('1-two-options');

  console.log('== rename, hide the others');
  await page.click(`[data-massopt-row="${S[0].options[1].guid}"] [data-massopt-rename]`);
  await page.fill('[data-massopt-name]', 'Slim tower'); await page.keyboard.press('Enter'); await rebuilt(); await settled();
  ok((await rows())[1]?.name === 'Slim tower' && (await sets())[0].options[1].option === 'Slim tower', 'Rename: the option is renamed in the list and in the model');
  await page.check('[data-massopt-hide]');
  const hid = await page.evaluate(() => { const v = window.bimcraftMassOptions.state; return v.hide; });
  const hiddenKeys = await page.evaluate(() => { const s = window.bimcraftMassOptions.sets()[0]; const kb = window.bimcraftRes.api.kb(); const vis = window.bimcraftLive?.viewer?.vis || null; return vis ? s.options.map((o) => vis.hidden.has(kb + o.id)) : null; });
  ok(hid && (hiddenKeys === null || (hiddenKeys[0] === false && hiddenKeys[1] === true)), 'Hide the options that are not current: the other option is hidden in the 3D view, the current one is not' + (hiddenKeys === null ? ' (the viewer is not exposed to the test: the switch state only)' : ''), hiddenKeys);
  await page.uncheck('[data-massopt-hide]');

  console.log('== add ModelCraft massing from a file');
  await page.setInputFiles('[data-massopt-file]', mcPath); await page.waitForFunction(() => window.bimcraftMassOptions.sets().length === 2, null, { timeout: 60000 }); await rebuilt(); await settled();
  S = await sets();
  const mc = S.find((s) => s.set === 'From ModelCraft');
  ok(S.length === 2 && mc && mc.options.map((o) => o.option).join() === 'Bar,Stepped,L', 'three options came in as the set "From ModelCraft": Bar, Stepped, L', S.map((s) => s.set));
  const by = Object.fromEntries((mc?.options || []).map((o) => [o.option, o]));
  ok(by.Bar && near(by.Bar.gross, 600, 0.01) && near(by.Bar.foot, 200, 0.01) && by.Bar.floors === 3 && near(by.Stepped.gross, 500, 0.01) && by.Stepped.simplified && near(by.Stepped.vol, 1500, 0.01) && near(by.L.gross, 600, 0.01) && near(by.L.foot, 300, 0.01) && by.L.floors === 2, 'with ModelCraft\'s figures: Bar 200 / 600 m2, Stepped 500 m2 and 1500 m3 (shape simplified), L 300 / 600 m2', by);
  ok(mc.options[0].current && mc.options.filter((o) => o.current).length === 1 && near(by.L.x0, 60000, 1), 'the set has one current option (its first); the L stands where it was modelled (x = 60 m)');
  ok(await page.evaluate(() => !!document.querySelector('[data-massopt-simplified]')), 'the list marks Stepped "(shape simplified)"');
  await undo();
  ok((await sets()).length === 1, 'one Undo takes all three away again (one step)');
  await page.click('[data-act="redo"]'); await page.waitForTimeout(400); await rebuilt(); await settled();
  ok((await sets()).length === 2, 'Redo brings them back');

  console.log('== develop one, remove one');
  S = await sets();
  const L = S.find((s) => s.set === 'From ModelCraft').options.find((o) => o.option === 'L');
  await page.click(`[data-massopt-row="${L.guid}"] [data-massopt-develop]`); await rebuilt(); await settled();
  const lv = await page.evaluate(() => window.bimcraftPlan.state.data.levels.length);
  const wallsAll = await page.evaluate(async () => { return window.bimcraftMassOptions.sets().flatMap((s) => s.options).length; });
  ok(lv === 2 && wallsAll === 4, 'Develop L: a second level was added for its second floor; four options are left in the list', [lv, wallsAll]);
  ok(/developed into levels, walls and floors/.test(await page.evaluate(() => document.querySelector('[data-status]')?.textContent || '')), 'the status line says so');
  const nw = await page.evaluate(() => window.bimcraftPlan.state.data.walls.length);
  ok(nw === 12, 'six walls on each of its two floors (12): ' + nw);
  S = await sets();
  const bar = S.find((s) => s.set === 'From ModelCraft').options.find((o) => o.option === 'Bar');
  await page.click(`[data-massopt-row="${bar.guid}"] [data-massopt-remove]`); await rebuilt(); await settled();
  S = await sets();
  const left = S.find((s) => s.set === 'From ModelCraft').options;
  ok(left.length === 1 && left[0].option === 'Stepped' && left[0].current, 'Remove Bar (the current one): Stepped is left and takes over as current', left);
  await shot('2-after');
  const real = problems.filter((p) => !(/429/.test(p) && [...throttled].some((u) => /hardware/.test(u))));
  ok(real.length === 0, 'no console errors', real.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'stopped.png') }).catch(() => {});
} finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

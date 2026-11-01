#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-hvac.mjs — 0.8 SU.888 (session `sx-mep`) in the real /lab/bimcraft page. Run as root (it mints the add-on test admin's
 * session with sudo -u www-data, as browser-mep07.mjs does).
 *
 *   node tools/bimcraft-test/browser-hvac.mjs [--shots <dir>]
 *
 * A new building: Build › Equipment lists the pack's kinds; a split outdoor unit and a wall indoor unit are placed (3.5 kW: the
 * wall unit's gas port reads 1/2 in Properties); both picked → Build › Line set draws the liquid and gas runs in ACR, fixed to both,
 * as ONE undo step; Undo / Redo; Check connections lists only the open condensate; Line set sizes opens the table, a changed row
 * is saved into the model; a pipe started on a refrigerant port takes ACR and its size. No console errors. Shots in
 * tmp/shots/hvac (removed with --clean-shots).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : path.join(ROOT, 'tmp/shots/hvac');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const php = (script, cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', script, cmd], { cwd: ROOT }).toString().trim().split('\n').pop());
const { cookie } = php('tools/addons-test/admin.php', 'session');
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((x) => path.join(cacheDir, build, x)).find((x) => fs.existsSync(x));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const [cn, cv] = cookie.split('=');
  await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(e.message));
  const waitStatus = (re) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout: 60000 });
  const status = () => page.evaluate(() => document.querySelector('[data-status]')?.textContent || '');
  const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
  const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
  const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
  const build = async () => { await page.click('[data-res-tools] summary'); };

  await page.goto('https://getcadcraft.com/lab/bimcraft?space=paper', { waitUntil: 'load' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'load' });
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'HVAC');
  await page.fill('[data-new-levels]', '2');
  await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await waitStatus(/^New building HVAC/);
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();

  await build();
  await page.click('[data-mtool="equip"]');
  const kinds = await page.$$eval('[data-eq-kind] option', (o) => o.map((x) => x.value + '=' + x.textContent));
  ok(['split-wall', 'split-cassette', 'split-ducted', 'split-outdoor', 'vrf-outdoor', 'refnet', 'fancoil'].every((k) => kinds.some((x) => x.startsWith(k + '='))) && !kinds.some((x) => /=mep\.eq/.test(x)), 'Build › Equipment lists the seven new kinds, named', kinds.slice(9).join(', '));
  await page.selectOption('[data-eq-kind]', 'split-outdoor');
  ok(await page.$eval('[data-eq-f="liquidline"]', (s) => s.selectedOptions[0].textContent) === 'From the table', 'tube fields start on "From the table"');
  await page.fill('[data-eq-tag]', 'OU-1'); await page.press('[data-eq-tag]', 'Enter');
  await planClick(0, 0);
  await settled();
  await page.selectOption('[data-eq-kind]', 'split-wall');
  await page.selectOption('[data-eq-f="capacity"]', '3.5');
  await page.fill('[data-eq-z]', '2100 mm'); await page.press('[data-eq-z]', 'Enter');
  await page.fill('[data-eq-tag]', 'IU-1'); await page.press('[data-eq-tag]', 'Enter');
  await planClick(4000, 3000);
  await settled();
  const eqs = () => page.evaluate(() => window.bimcraftMepEq.state.eqs.map((e) => ({ guid: e.guid, id: e.id, kind: e.kind, tag: e.tag, z: e.z })));
  const E = await eqs();
  ok(E.length === 2 && E[0].kind === 'split-outdoor' && E[1].kind === 'split-wall' && Math.abs(E[1].z - 2100) < 0.5, 'outdoor and wall units placed (the wall unit at 2100)', JSON.stringify(E));
  const kb = await page.evaluate(() => window.bimcraftMep.api.kb());
  await page.evaluate((k) => window.bimcraftMep.api.host.select([k]), kb + E[1].id);
  await page.waitForSelector('[data-mp-eqport="ref-gas"]', { timeout: 10000 }).catch(() => {});
  const gasText = await page.$eval('[data-mp-eqport="ref-gas"]', (x) => x.textContent).catch(() => '');
  ok(/Ø12.7 \(1\/2"\)/.test(gasText) && /Refrigerant gas line/.test(gasText), 'Properties: the 3.5 kW unit\'s gas port is Ø12.7 (1/2"), refrigerant gas line, open', gasText);
  await page.screenshot({ path: path.join(SHOTS, 'hvac-01-units.png') });
  // pick both, Line set
  await page.evaluate((keys) => window.bimcraftMep.api.host.select(keys), [kb + E[0].id, kb + E[1].id]);
  const n0 = await page.evaluate(() => window.bimcraftLive.editor.changes.length);
  await build();
  await page.click('[data-hv-lineset]');
  await settled();
  const st = await status();
  const runs = () => page.evaluate(() => window.bimcraftMep.state.runs.map((r) => ({ mat: r.mat, size: r.size, system: r.system, ends: r.ends })));
  let R = await runs();
  ok(R.length === 2 && R.every((r) => r.mat === 'acr' && r.ends[0] && r.ends[1]) && R.find((r) => r.system === 'refl')?.size === '1/4' && R.find((r) => r.system === 'refg')?.size === '1/2', 'Line set: liquid 1/4 and gas 1/2 in ACR, both ends fixed', JSON.stringify(R) + ' ' + st);
  ok(/Line set drawn/.test(st) && await page.evaluate((n) => window.bimcraftLive.editor.changes.length === n + 1, n0), 'one change, and the status line says what was drawn', st);
  await page.screenshot({ path: path.join(SHOTS, 'hvac-02-lineset.png') });
  const labels = await page.evaluate(() => (window.bimcraftPlan.view.scene.rooms || []).flatMap((r) => r.label || []));
  ok(labels.some((l) => /^Ø6\.35 RL$/.test(l)) && labels.some((l) => /^Ø12\.7 RG$/.test(l)), 'the plan labels the runs Ø6.35 RL and Ø12.7 RG', JSON.stringify(labels));
  await page.keyboard.press('Escape');
  await page.click('[data-act="undo"]');
  await settled();
  ok((await runs()).length === 0, 'Undo takes both runs back');
  await page.click('[data-act="redo"]');
  await settled();
  ok((await runs()).length === 2, 'Redo brings both back');
  await build();
  await page.click('[data-mep-check]');
  await page.waitForSelector('[data-mep-issues]:not([hidden])', { timeout: 10000 }).catch(() => {});
  const issues = await page.evaluate(() => [...document.querySelectorAll('[data-mep-issue]')].map((b) => b.dataset.mepIssue + ':' + b.textContent));
  ok(issues.length === 1 && /^open-port:.*Condensate/.test(issues[0]), 'Check connections: only the indoor unit\'s condensate is open', JSON.stringify(issues));
  // the table
  await build();
  await page.click('[data-hv-table]');
  await page.waitForSelector('[data-hv-dialog]');
  ok(await page.$$eval('[data-hv-dialog] tbody tr', (r) => r.length) === 9 && /not a maker's data/.test(await page.textContent('[data-hv-dialog]')), 'Line set sizes: nine typical rows, said to be typical, not a maker\'s');
  await page.screenshot({ path: path.join(SHOTS, 'hvac-03-table.png') });
  await page.fill('[data-hv-dialog] tbody tr:first-child [data-hv-kw]', '3');
  await page.click('[data-hv-save]');
  await settled();
  ok(await page.evaluate(() => window.bimcraftLive.editor.changes.at(-1)?.label === 'Line set sizes'), 'saved into the model as one change');
  // Pipe from a refrigerant port
  const lp = await page.evaluate(() => window.bimcraftMepEq.state.eqs.find((e) => e.kind === 'split-outdoor').ports.find((p) => p.name === 'ref-liquid').at);
  await build();
  await page.click('[data-mtool="pipe"]');
  await planClick(lp[0], lp[1]);
  const took = await page.evaluate(() => { const P = window.bimcraftMep.state.pipe; return { mat: P.mat, size: P.size, system: P.system }; });
  ok(took.mat === 'acr' && took.size === '1/4' && took.system === 'refl', 'a pipe started on the liquid port takes ACR 1/4, refrigerant liquid', JSON.stringify(took));
  await page.keyboard.press('Escape');
  const missing = await page.evaluate(() => (window.ccI18n?.missing?.() || []).filter((k) => /^(mep|sx\.su888)\./.test(k)));
  ok(!missing.length, 'no language key of the pack missing', missing.join(', '));
  ok(!problems.filter((p) => !/unsigned/.test(p)).length, 'no console errors', problems.slice(0, 3).join(' | '));
} finally {
  await browser.close();
  php('tools/addons-test/admin.php', 'down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

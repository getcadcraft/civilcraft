#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-pipespecs.mjs — 0.9.1 pipe specs, in-line components, manufacturers' families and radiators (suggestions #1499, #1493)
 * in the real /lab/bimcraft page. Run as root (it mints the add-on test admin's session with sudo -u www-data, as
 * browser-hvac.mjs does).
 *
 *   node tools/bimcraft-test/browser-pipespecs.mjs [--shots <dir>]
 *
 * A new building: Build › Pipe specs opens the manager; a starter spec is added (marked to be checked, with its source pages); a
 * size table is pasted from a spreadsheet, named, given a roughness and the chilled-water service; Save keeps both in the model
 * (one change). The Pipe tool on chilled water then starts in that spec and its size list holds only the spec's sizes; a run is
 * drawn. The Valve tool lists the new kinds: a butterfly valve goes on the run, a fire damper on a pipe is refused. A radiator is
 * placed and a pipe drawn from its port. A manufacturer's model (an OBJ) is imported as a family, its two ports given sizes,
 * saved, and placed on the run. No console errors, no missing language keys. Shots in tmp/shots/pipespecs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : path.join(ROOT, 'tmp/shots/pipespecs');
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
// a 100 × 40 × 40 mm box along X (a stand-in for a maker's valve body), in millimetres, Z up
const OBJ = ['v 0 -20 -20', 'v 100 -20 -20', 'v 100 20 -20', 'v 0 20 -20', 'v 0 -20 20', 'v 100 -20 20', 'v 100 20 20', 'v 0 20 20', 'f 1 4 3 2', 'f 5 6 7 8', 'f 1 2 6 5', 'f 2 3 7 6', 'f 3 4 8 7', 'f 4 1 5 8'].join('\n') + '\n';
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
  const buildMenu = async () => { await page.click('[data-res-tools] summary'); };
  const runs = () => page.evaluate(() => window.bimcraftMep.state.runs.map((r) => ({ guid: r.guid, kind: r.kind, mat: r.mat, size: r.size, system: r.system, parts: r.parts.length, valves: r.valves, ends: r.ends })));

  await page.goto('https://getcadcraft.com/lab/bimcraft?space=paper', { waitUntil: 'load' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'load' });
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'SPECS');
  await page.fill('[data-new-levels]', '1');
  await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await waitStatus(/^New building SPECS/);
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();

  // ---- the manager ----
  await buildMenu();
  ok(await page.isVisible('[data-res-tools] [data-pspec-open]') && await page.isVisible('[data-res-tools] [data-oem-open]'), 'Build has Pipe specs and Families');
  await page.click('[data-res-tools] [data-pspec-open]');
  await page.waitForSelector('[data-pspec-dialog][open]');
  ok(await page.isVisible('[data-pspec-empty]') && await page.$$eval('[data-pspec-starter] option', (o) => o.length) === 5, 'the manager opens empty, with four starter specs to add');
  await page.selectOption('[data-pspec-starter]', 'en-10357-a');
  await page.waitForSelector('[data-pspec-row]');
  ok(await page.$$eval('[data-pspec-row]', (r) => r.length) === 13 && /Check it against your project standard|project standard/.test(await page.textContent('[data-pspec-check]')) && (await page.$$eval('[data-pspec-src] a', (a) => a.map((x) => x.href))).length === 2,
    'a starter spec: 13 sizes, marked to be checked against the project standard, its two source pages linked');
  ok(await page.$eval('[data-pspec-row]:first-child [data-pspec-c="od"]', (i) => i.value) === '13' && await page.$eval('[data-pspec-row]:first-child [data-pspec-c="id"]', (i) => i.value) === '10', 'its first row reads DN10: outside 13, inside 10');
  // paste a table from a spreadsheet (tabs)
  await page.click('[data-pspec-pasteopen]');
  await page.fill('[data-pspec-paste]', 'Size\tDN\tOD\tWall\tPressure\nDN15\t15\t19\t1.5\tPN16\nDN25\t25\t29\t1.5\tPN16\nDN40\t40\t41\t1.5\tPN16\nDN50\t50\t53\t1.5\tPN10\n');
  await page.click('[data-pspec-pastego]');
  await page.waitForFunction(() => document.querySelectorAll('[data-pspec-item]').length === 2);
  ok(await page.$$eval('[data-pspec-row]', (r) => r.length) === 4 && /4 sizes/.test(await page.textContent('[data-pspec-err]')), 'pasted rows become a second spec of 4 sizes', await page.textContent('[data-pspec-err]'));
  ok(!/null|undefined/.test(await page.textContent('[data-pspec-pane]')), 'nothing stray is printed in the editor');
  await page.fill('[data-pspec-f="name"]', 'Site tube A');
  await page.fill('[data-pspec-f="standard"]', 'Company spec PS-12 rev C');
  await page.fill('[data-pspec-f="material"]', 'Stainless 316L');
  await page.selectOption('[data-pspec-f="joint"]', 'orbital');
  await page.fill('[data-pspec-f="roughness"]', '0.0008');
  await page.check('[data-pspec-sys][value="chw"]');
  // typing a wall fills the inside diameter
  await page.click('[data-pspec-addrow]');
  const last = '[data-pspec-row]:last-child ';
  await page.fill(last + '[data-pspec-c="name"]', 'DN65'); await page.fill(last + '[data-pspec-c="od"]', '70'); await page.fill(last + '[data-pspec-c="wall"]', '2'); await page.press(last + '[data-pspec-c="wall"]', 'Tab');
  ok(await page.$eval(last + '[data-pspec-c="id"]', (i) => i.value) === '66', 'a new row: outside 70 and wall 2 fill the inside diameter, 66');
  await page.screenshot({ path: path.join(SHOTS, 'pipespecs-01-manager.png') });
  // a bad row is said in the dialog and nothing is saved
  await page.fill(last + '[data-pspec-c="wall"]', '40'); await page.fill(last + '[data-pspec-c="id"]', '');
  await page.click('[data-pspec-save]');
  ok(await page.isVisible('[data-pspec-dialog][open]') && /DN65/.test(await page.textContent('[data-pspec-err]')), 'a wall that leaves no bore: said in the dialog, nothing saved', await page.textContent('[data-pspec-err]'));
  await page.fill(last + '[data-pspec-c="wall"]', '2');
  const n0 = await page.evaluate(() => window.bimcraftLive.editor.changes.length);
  await page.click('[data-pspec-save]');
  await settled();
  ok(/2 pipe specs saved/.test(await status()) && await page.evaluate((n) => window.bimcraftLive.editor.changes.length === n + 1, n0), 'Save: both specs kept in the model as one change', await status());

  // ---- a run in the spec ----
  await buildMenu();
  await page.click('[data-mtool="pipe"]');
  await page.selectOption('[data-mep-sys]', 'chw');
  const bar = await page.evaluate(() => ({ mat: document.querySelector('[data-mep-mat]').value, matText: document.querySelector('[data-mep-mat]').selectedOptions[0]?.textContent, sizes: [...document.querySelectorAll('[data-mep-size] option')].map((o) => o.textContent), clsHidden: document.querySelector('[data-mep-cls]').closest('label').hidden, mats: [...document.querySelectorAll('[data-mep-mat] option')].map((o) => o.textContent) }));
  ok(bar.mat === 'spec:site-tube-a' && bar.matText === 'Spec: Site tube A' && bar.sizes.join() === 'DN15,DN25,DN40,DN50,DN65' && bar.clsHidden, 'chilled water starts in its spec; the size list is only the spec\'s five sizes', JSON.stringify(bar).slice(0, 300));
  ok(bar.mats.includes('Spec: EN 10357 series A tube (DIN 11850 row 2)') && bar.mats.includes('Steel'), 'the material list offers both specs beside the built-in tables');
  await page.selectOption('[data-mep-size]', 'DN50');
  await planClick(0, 0); await planClick(6000, 0); await page.keyboard.press('Enter');
  await settled();
  let R = await runs();
  ok(R.length === 1 && R[0].mat === 'spec:site-tube-a' && R[0].size === 'DN50' && R[0].parts === 1, 'a run drawn in the spec, DN50', JSON.stringify(R));
  const labels = await page.evaluate(() => (window.bimcraftPlan.view.scene.rooms || []).flatMap((r) => r.label || []));
  ok(labels.some((l) => /^DN50 /.test(l)), 'the plan labels it DN50', JSON.stringify(labels));
  // ---- valves ----
  await buildMenu();
  await page.click('[data-mtool="valve"]');
  const kinds = await page.$$eval('[data-mep-valve] option', (o) => o.map((x) => x.value + '=' + x.textContent));
  ok(['gate', 'ball', 'butterfly', 'globe', 'check', 'balancing', 'control', 'strainer', 'damper-volume', 'damper-fire'].every((k) => kinds.some((x) => x.startsWith(k + '='))) && !kinds.some((x) => /=mep\./.test(x)), 'the Valve tool lists ten kinds, named', kinds.join(', '));
  await page.selectOption('[data-mep-valve]', 'butterfly');
  await planClick(2000, 0);
  await settled();
  R = await runs();
  ok(R[0].valves.length === 1 && R[0].valves[0].kind === 'butterfly' && R[0].parts === 3, 'a butterfly valve on the run: pipe, valve, pipe', JSON.stringify(R[0]));
  await page.selectOption('[data-mep-valve]', 'damper-fire');
  await planClick(4000, 0);
  await page.waitForTimeout(300);
  ok(/Click on a duct/.test(await status()) && (await runs())[0].valves.length === 1, 'a fire damper is for ducts: clicking the pipe places nothing and says so', await status());
  // ---- a radiator, and a pipe from its port ----
  await buildMenu();
  await page.click('[data-mtool="equip"]');
  const eqKinds = await page.$$eval('[data-eq-kind] option', (o) => o.map((x) => x.value + '=' + x.textContent));
  ok(['radiator=Radiator', 'convector=Convector / panel heater', 'oem=Manufacturer\'s family', 'ahu=Air handler', 'diffuser=Diffuser', 'grille=Grille'].every((k) => eqKinds.includes(k)), 'Equipment lists radiator, convector and a manufacturer\'s family beside the air handler, diffuser and grille', eqKinds.join(', '));
  await page.selectOption('[data-eq-kind]', 'radiator');
  ok(await page.$eval('[data-eq-z]', (i) => i.value) === '150 mm' || /150/.test(await page.$eval('[data-eq-z]', (i) => i.value)), 'a radiator starts 150 mm above the floor');
  await page.fill('[data-eq-tag]', 'RAD-1'); await page.press('[data-eq-tag]', 'Enter');
  await planClick(2500, -3000);
  await settled();
  const rad = await page.evaluate(() => { const e = window.bimcraftMepEq.state.eqs.find((x) => x.kind === 'radiator'); return e ? { id: e.id, guid: e.guid, ports: e.ports.map((p) => ({ name: p.name, at: p.at, nominal: p.nominal })) } : null; });
  ok(rad && rad.ports.map((p) => p.name).join() === 'flow,return', 'the radiator is placed with a flow and a return port', JSON.stringify(rad));
  const fl = rad.ports[0].at;
  await buildMenu();
  await page.click('[data-mtool="pipe"]');
  await planClick(fl[0], fl[1]);
  await planClick(fl[0] - 1500, fl[1]); await page.keyboard.press('Enter');
  await settled();
  R = await runs();
  const toRad = R.find((r) => r.ends[0]?.eq === rad.guid);
  ok(toRad && toRad.ends[0].port === 'flow' && toRad.system === 'hhw' && toRad.size === '1/2', 'a pipe started on the radiator\'s flow port takes heating water, 1/2", and is fixed to it', JSON.stringify(toRad));
  const open = await page.evaluate((id) => [...window.bimcraftMepEq.state.free].filter((k) => k.startsWith(id + '#')), rad.id);
  ok(open.length === 1 && /#return$/.test(open[0]), 'its flow port is connected, the return still open', JSON.stringify(open));
  await page.keyboard.press('Escape');
  // ---- a manufacturer's model as a family ----
  await page.evaluate(async (obj) => { await window.bimcraftOemFamilies.importFile(new File([obj], 'ACME V100 DN50.obj', { type: 'text/plain' })); }, OBJ);
  await page.waitForSelector('[data-oemed-dialog][open]');
  ok(await page.$$eval('[data-oemed-rows] tr', (r) => r.length) === 2 && /100 × 40 × 40 mm/.test(await page.textContent('[data-oemed-box]')) && await page.$eval('[data-oemed-f="name"]', (i) => i.value) === 'ACME V100 DN50', 'an OBJ model read with the app\'s own reader: 100 × 40 × 40 mm, two ports offered on its ends', await page.textContent('[data-oemed-box]'));
  await page.click('[data-oemed-save]');
  ok(await page.isVisible('[data-oemed-dialog][open]') && /size/i.test(await page.textContent('[data-oemed-err]')), 'no port size typed yet: refused, with the reason', await page.textContent('[data-oemed-err]'));
  for (const i of [1, 2]) { await page.fill(`[data-oemed-rows] tr:nth-child(${i}) [data-oemed-c="size"]`, '53'); await page.fill(`[data-oemed-rows] tr:nth-child(${i}) [data-oemed-c="nominal"]`, 'DN50'); await page.selectOption(`[data-oemed-rows] tr:nth-child(${i}) [data-oemed-c="end"]`, 'clamp'); }
  await page.fill('[data-oemed-f="maker"]', 'ACME'); await page.fill('[data-oemed-f="model"]', 'V100-50');
  await page.selectOption('[data-oemed-f="base"]', 'ball');
  await page.screenshot({ path: path.join(SHOTS, 'pipespecs-02-family-ports.png') });
  await page.click('[data-oemed-save]');
  await settled();
  ok(/ACME V100 DN50 is saved/.test(await status()), 'the family is saved in the model', await status());
  await buildMenu();
  await page.click('[data-mtool="valve"]');
  const famOpt = await page.$$eval('[data-mep-valve] option', (o) => o.map((x) => x.value + '=' + x.textContent).filter((x) => x.startsWith('oem:')));
  ok(famOpt.length === 1 && famOpt[0] === 'oem:acme-v100-dn50=Family: ACME V100 DN50', 'the Valve tool now lists the family', famOpt.join());
  await page.selectOption('[data-mep-valve]', 'oem:acme-v100-dn50');
  await planClick(4500, 0);
  await settled();
  R = await runs();
  const main = R.find((r) => r.mat === 'spec:site-tube-a');
  ok(main.valves.length === 2 && main.valves[1].kind === 'oem' && main.parts === 5 && !/drawn at its own size/.test(await status()), 'the family is placed on the DN50 run like a valve (its 53 mm ports fit: no warning)', JSON.stringify(main.valves) + ' ' + await status());
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.bimcraftPlan.view.fit({ x0: -600, y0: -4000, x1: 6600, y1: 800 }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, 'pipespecs-03-run-valve-radiator.png') });
  await page.evaluate(() => window.bimcraftPlan.view.fit({ x0: 1200, y0: -700, x1: 5400, y1: 700 }));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, 'pipespecs-06-valves-close.png') });
  await page.evaluate(() => window.bimcraftPlan.view.fit({ x0: -600, y0: -4000, x1: 6600, y1: 800 }));
  // the same in 3D beside the plan
  await page.click('[data-model-layout="split"]').catch(() => {});
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SHOTS, 'pipespecs-05-split-3d.png') });
  await page.click('[data-model-layout="plan"]').catch(() => {});
  await page.waitForTimeout(500);
  // Properties of the run: its spec, the valves with Remove
  const kb = await page.evaluate(() => window.bimcraftMep.api.kb());
  const partId = await page.evaluate((g) => window.bimcraftMep.state.runs.find((r) => r.guid === g).parts[0], main.guid);
  await page.evaluate((k) => window.bimcraftMep.api.host.select([k]), kb + partId);
  await page.waitForSelector('[data-mp-mepspec]', { timeout: 10000 }).catch(() => {});
  const specText = await page.$eval('[data-mp-mepspec]', (x) => x.textContent).catch(() => '');
  ok(/Company spec PS-12 rev C/.test(specText) && /Ø 53 × 1.5 mm, inside Ø 50 mm/.test(specText) && /check against your project standard/.test(specText), 'Properties shows the run\'s spec: standard, material, joint, Ø 53 × 1.5, inside Ø 50, and the check mark', specText);
  ok(await page.$$eval('[data-mp-mepsize] option', (o) => o.map((x) => x.textContent).join()) === 'DN15,DN25,DN40,DN50,DN65' && await page.$$eval('[data-mp-mepdelvalve]', (b) => b.length) === 2, 'its size list is the spec\'s; both in-line components can be removed there');
  await page.screenshot({ path: path.join(SHOTS, 'pipespecs-04-properties.png') });
  await page.click('[data-mp-mepdelvalve]');
  await settled();
  ok((await runs()).find((r) => r.guid === main.guid).parts === 3, 'Remove: the butterfly valve goes and the run heals round the family (3 parts)');
  // the manager again: the spec in use cannot be deleted
  await buildMenu();
  await page.click('[data-res-tools] [data-pspec-open]');
  await page.waitForSelector('[data-pspec-dialog][open]');
  await page.click('[data-pspec-item="site-tube-a"]');
  await page.click('[data-pspec-del]');
  ok(/cannot be deleted: 1 runs/.test(await page.textContent('[data-pspec-err]')) && await page.$$eval('[data-pspec-item]', (r) => r.length) === 2, 'the spec a run is drawn in cannot be deleted', await page.textContent('[data-pspec-err]'));
  await page.keyboard.press('Escape');
  // schedules count the family and the pipe by the spec
  const sch = await page.evaluate(() => { const s = document.querySelector('[data-msched-kind]'); return s ? [...s.options].map((o) => o.value) : []; });
  ok(sch.includes('pipes') && sch.includes('mepfit'), 'the schedules list pipes and fittings');
  const missing = await page.evaluate(() => (window.ccI18n?.missing?.() || []).filter((k) => /^mep\./.test(k)));
  ok(!missing.length, 'no MEP language key missing', missing.join(', '));
  ok(!problems.filter((p) => !/unsigned/.test(p)).length, 'no console errors', problems.slice(0, 4).join(' | '));
} finally {
  await browser.close();
  php('tools/addons-test/admin.php', 'down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-standard.mjs — the library panel's Standard tab in /lab/cadcraft (steel sections and standard parts; 0.5 MQ.3,
 * MQ.4) and PartCraft's File › Standard part, in Chromium with real clicks.
 *
 *   node tools/cadcraft-test/browser-standard.mjs [--shots dir]     (run as root: it uses sudo -u www-data php for the
 *                                                                    CadCraft test admin, tools/cadcraft-test/admin.php)
 *
 * CadCraft: the tab, its family list and search, a W12x26 section and a 3000 mm HSS elevation placed by clicks (blocks with
 * their CC-PART-* attributes), a 3D member from the panel (STEELMEMBER asks for the ends), an ISO 4017 M10 × 30 with a typed
 * length, a refused length, the Parts list view, PARTSLIST at the command line, both themes, no console errors.
 * PartCraft: File › Standard part → ISO 4032 nut at M12 opens as a part with its 10 configurations and rebuilds.
 * The admin-login throttle is shared (10 / 10 min for 127.0.0.1): clear form_throttle rows for ip_hash('127.0.0.1'), action
 * admin-login, when it bites.
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
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const cc = (fn, arg) => page.evaluate(fn, arg);
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(150); };
const stageClick = async (fx, fy) => { const b = await page.locator('[data-over]').boundingBox(); await page.mouse.click(b.x + b.width * fx, b.y + b.height * fy); await page.waitForTimeout(150); };
const promptIs = (re) => page.waitForFunction((s) => new RegExp(s).test(document.querySelector('[data-prompt]').textContent), re.source, { timeout: 5000 });
const dlg = 'dialog[data-lib]';
const openStandard = async () => {
  await page.click('[data-library]');
  await page.waitForSelector(dlg + '[open]');
  await page.click(dlg + ' button[data-src="standard"]');
  await page.waitForSelector(dlg + ' .cc-lib-std:not([hidden])');
};
const search = async (fam, q) => {
  await page.selectOption(dlg + ' .cc-lib-std > select', fam);
  await page.fill(dlg + ' input[type="search"]', q);
  await page.click(dlg + ' .cc-lib-search button[type="submit"]');
  await page.waitForTimeout(200);
};
const lastInsert = () => cc(() => { const e = window.cadcraft.doc.all().filter((x) => x.type === 'insert').pop(); return e && { block: e.block, attrs: e.attrs }; });

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await cc(() => { const { doc, view } = window.cadcraft; doc.change('seed', () => doc.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 8000, y2: 4000 })); view.fit(); });

  console.log('\n== CadCraft: the Standard tab');
  await openStandard();
  const fams = await page.$$eval(dlg + ' .cc-lib-std > select option', (l) => l.length);
  const groups = await page.$$eval(dlg + ' .cc-lib-std > select optgroup', (l) => l.map((g) => g.label));
  ok(fams === 20 && groups.join('|') === 'Steel sections|Standard parts', 'the Standard tab lists 20 families in two groups', fams + ' ' + groups.join('|'));
  const msg0 = await page.textContent(dlg + ' [role="status"]');
  ok((await page.locator(dlg + ' .cc-lib-card').count()) === 60 && /289 sizes, showing the first 60/.test(msg0), 'W shapes: the first 60 of 289 cards, and it says so', msg0);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'standard-01-paper.png') });
  await search('sec:W', 'W12x26');
  ok((await page.locator(dlg + ' .cc-lib-card').count()) === 1 && (await page.textContent(dlg + ' .cc-lib-card')).includes('309.9 × 164.8 mm, 38.69 kg/m'), 'search W12x26: one card with its depth × width and kg/m');
  await page.click(dlg + ' .cc-lib-card button:has-text("Place")');
  await promptIs(/insertion point/i);
  await stageClick(0.3, 0.5);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  let ins = await lastInsert();
  ok(ins && ins.block === 'LIB_w12x26-s_v1' && ins.attrs['CC-PART-SIZE'] === 'W12x26' && ins.attrs['CC-PART-STD'] === 'AISC Shapes Database v16.0' && ins.attrs['CC-LICENSE'] === 'CC0-1.0', 'Place → click → Enter: the section block with its size, table and CC0 license', JSON.stringify(ins));

  await openStandard();
  await search('sec:HSS', 'HSS6x6x1/4');
  await page.selectOption(dlg + ' select[data-std="view"]', 'elevation');
  await page.fill(dlg + ' input[data-std="length"]', '3000');
  ok(await page.isVisible(dlg + ' [data-std-opt="length"]') && !(await page.isVisible(dlg + ' [data-std-opt="teeth"]')), 'Elevation shows the Length box (and no gear boxes)');
  await page.click(dlg + ' .cc-lib-card button:has-text("Place")');
  await promptIs(/insertion point/i);
  await stageClick(0.5, 0.3);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  ins = await lastInsert();
  ok(ins && ins.block === 'LIB_hss6x6x1-4-e3000_v1' && ins.attrs['CC-PART-LENGTH'] === '3000' && Number(ins.attrs['CC-WEIGHT-KG']) > 80, 'a 3000 mm HSS6x6x1/4 elevation, its length and weight as attributes', JSON.stringify(ins));

  await openStandard();
  await search('sec:IPE', 'IPE300');
  await page.selectOption(dlg + ' select[data-std="view"]', 'member');
  await page.click(dlg + ' .cc-lib-card button:has-text("Place")');
  await promptIs(/Start point/);
  await typeCmd('0,0');
  await typeCmd('6000,0');
  const hist = await page.textContent('body');
  ok(/IPE300 member, 6000(\.0+)? long, on the 3D tab/.test(hist), '3D member: the panel hands IPE300 to STEELMEMBER, two points make it, the history says so', hist.slice(-400));

  await openStandard();
  await search('part:iso4017', 'M10');
  ok(await page.isVisible(dlg + ' [data-std-opt="length"]') && (await page.getAttribute(dlg + ' input[data-std="length"]', 'placeholder')) === '40' && !(await page.isVisible(dlg + ' [data-std-opt="view"]')), 'hex head screws: a Length box whose placeholder is the usual length (40 for M10); no Place-as list');
  await page.fill(dlg + ' input[data-std="length"]', '2');
  await page.click(dlg + ' .cc-lib-card button:has-text("Place")');
  await page.waitForTimeout(200);
  ok((await page.textContent(dlg + ' [role="status"]')).includes('Check the length') && await page.isVisible(dlg + '[open]'), 'a 2 mm screw is refused in words; the panel stays open');
  await page.fill(dlg + ' input[data-std="length"]', '30');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'standard-02-screws.png') });
  await page.click(dlg + ' .cc-lib-card button:has-text("Place")');
  await promptIs(/insertion point/i);
  await stageClick(0.6, 0.6);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  ins = await lastInsert();
  ok(ins && ins.attrs['CC-PART-SIZE'] === 'M10 × 30' && ins.attrs['CC-PART-STD'] === 'ISO 4017' && ins.attrs['CC-PART-MATERIAL'] === 'Steel, property class 8.8', 'ISO 4017 M10 × 30 placed with its size, standard and material', JSON.stringify(ins?.attrs || {}).slice(0, 300));

  await page.click('[data-library]');
  await page.click(dlg + ' button:has-text("Parts list")');
  await page.waitForSelector(dlg + ' .cc-lib-parts table');
  const rows = await page.$$eval(dlg + ' .cc-lib-parts tbody tr', (l) => l.map((r) => r.textContent));
  ok(rows.length === 3 && rows.some((r) => r.includes('M10 × 30')) && rows.some((r) => r.includes('W12x26')), 'Parts list view: the section, the elevation and the screw', JSON.stringify(rows));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'standard-03-parts-list.png') });
  await page.keyboard.press('Escape');
  const n0 = await cc(() => window.cadcraft.doc.count());
  await typeCmd('PARTSLIST');
  await stageClick(0.1, 0.9);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  ok(await cc(() => window.cadcraft.doc.count()) > n0 + 20, 'PARTSLIST draws the table');

  await page.goto(BASE + '/lab/cadcraft?space=model', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await openStandard();
  await search('part:iso15', '');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'standard-04-bearings-model.png') });
  ok((await page.locator(dlg + ' .cc-lib-card canvas').count()) === 33, 'model space: 33 bearing cards, each with its drawing');

  console.log('\n== PartCraft: File › Standard part');
  await page.goto(BASE + '/lab/partcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.partcraft?.ready, null, { timeout: 30000 });
  await cc(() => window.partcraft.ready);
  await page.click('button[data-cmd="std-part"]');
  await page.waitForSelector('dialog.pc-dialog #pc-std-fam');
  await page.selectOption('#pc-std-fam', 'iso4032');
  await page.selectOption('#pc-std-size', 'M12');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'standard-05-partcraft.png') });
  await page.click('dialog.pc-dialog button[data-key="open"]');
  await page.waitForFunction(() => window.partcraft.part?.name === 'Hex nut ISO 4032', null, { timeout: 15000 });
  await cc(() => window.partcraft.built());
  const pc = await cc(() => { const p = window.partcraft.part, r = window.partcraft.regen; return { rows: p.configs?.rows.length, active: p.configs?.active, vol: r?.stats?.volume, s: p.params.vars.find((v) => v.name === 's')?.expr }; });
  const want = (Math.sqrt(3) / 2 * 18 * 18 - 32 * 36 * Math.sin(Math.PI / 32)) * 10.8;
  ok(pc.rows === 10 && pc.active === 'M12' && pc.s === '18' && Math.abs(pc.vol / want - 1) < 0.003, 'ISO 4032 at M12: 10 configurations, M12 active, s = 18, rebuilt with the hexagon-less-hole volume', JSON.stringify(pc) + ' want ' + want.toFixed(1));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'standard-06-partcraft-nut.png') });

  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.join(' | ') : ''));
} catch (e) {
  fail++;
  if (problems.length) console.log('  console: ' + problems.join(' | '));
  console.log('  FAIL ' + (e.stack || e));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'standard-error.png') }).catch(() => {});
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

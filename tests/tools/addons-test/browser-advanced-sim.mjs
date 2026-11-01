#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-advanced-sim.mjs — the Advanced simulation add-on in /lab/partcraft (0.8 SU.891; session addons-finish-advanced-sim). Run as root: a
 * signed-in session is minted in-process by tools/addons-test/admin.php and root's Playwright Chromium is used (as browser-cabinetcraft.mjs).
 *
 *   node tools/addons-test/browser-advanced-sim.mjs [--shots dir]     (shots default: tmp/shots/advanced-sim)
 *
 * Bundled and off, switched on in Settings › Add-ons; the showcase part fixtures/showcase/partcraft-two-bars-contact.partcraft.json opened (mesh
 * kernel); its tab; Contact, Find touching faces, Add; Run on PartCraft's compute worker; the result (contact force, plastic strain, load steps);
 * the displacement plot as display bodies beside the part; the CalculiX deck downloaded with its not-checked header; no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/advanced-sim'));
const FIXTURE = path.join(ROOT, 'fixtures/showcase/partcraft-two-bars-contact.partcraft.json');
fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString());

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const SESSION = admin('session');
const [cname, cvalue] = SESSION.cookie.split('=');
await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const problems = [];
const page = await ctx.newPage();
const workers = [];
page.on('worker', (w) => workers.push(w.url()));
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

// the right panel scrolls sideways when its tab strip brings the add-on's tab into view: put the panel's own content back at the left
const unscroll = () => page.evaluate(() => { for (let e = document.querySelector('[data-asim]'); e; e = e.parentElement) if (e.scrollLeft) e.scrollLeft = 0; });
const shot = async (name) => { await unscroll().catch(() => {}); await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const pane = '[data-asim]';
const act = (a) => page.click(pane + ' [data-asim-act="' + a + '"]');
try {
  await page.goto(BASE + '/lab/partcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {   // a clean start: the add-on off, the mesh kernel (partcraft.exactKernel unset)
    for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:partcraft:advanced-sim:')) localStorage.removeItem(k);
    localStorage.removeItem('partcraft.exactKernel');
    const k = 'cc-addons:partcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on['advanced-sim']; if (s.off) delete s.off['advanced-sim']; localStorage.setItem(k, JSON.stringify(s));
  });
  await page.goto(BASE + '/lab/partcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.ccAddons && !!window.partcraft, null, { timeout: 30000 });
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'advanced-sim' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
  const me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'advanced-sim'));
  ok(me && me.state === 'off' && me.source === 'bundled', 'Advanced simulation is bundled and starts off', JSON.stringify(me && { state: me.state, source: me.source, reason: me.reason, detail: me.detail }));
  ok(me && me.version === '0.8.0' && me.manifest.api === '1.2', 'version 0.8.0, add-on API 1.2 (PartCraft says 1.2)');
  // Settings › Add-ons: the row and its switch, used for real
  await page.click('[data-settings-open]');
  if (await page.isVisible('[data-settings-tab="general"]')) await page.click('[data-settings-tab="general"]');
  const rowSel = '[data-addons-set] li[data-addon="advanced-sim"]';
  const nav = page.locator('.shell-sec-nav button', { hasText: /^\s*Add-ons\s*$/ });
  if (await nav.count()) await nav.first().click();
  await page.waitForSelector(rowSel, { state: 'visible', timeout: 10000 });
  ok(/Advanced simulation/.test(await page.textContent(rowSel)) && /never been run in CalculiX/.test(await page.textContent(rowSel)), 'Settings › Add-ons lists Advanced simulation, with the never-run-in-CalculiX line');
  ok(!(await page.isChecked('[data-addon-toggle="advanced-sim"]')), 'its switch is off');
  await page.click('[data-addon-toggle="advanced-sim"]');
  await page.waitForFunction(() => window.ccAddons.list().find((a) => a.id === 'advanced-sim')?.state === 'active', null, { timeout: 15000 });
  ok(await page.isChecked('[data-addon-toggle="advanced-sim"]'), 'the switch turned it on (state active)');
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.querySelector('[data-settings-close]')?.click());

  // the showcase part, opened as a file would be
  const opened = await page.evaluate(async ([t, n]) => { await window.partcraft.openText(t, n); await window.partcraft.built(); const r = window.partcraft.regen; return { faces: r.faces.length, named: !!r.named, bodies: r.stats.bodies, kind: window.partcraft.part.studies?.simulation?.kind }; }, [fs.readFileSync(FIXTURE, 'utf8'), path.basename(FIXTURE)]);
  ok(opened.faces === 12 && opened.named && opened.bodies === 2 && opened.kind === 'static', 'the showcase two bars open on the mesh kernel: 2 pieces, 12 named faces, a static study', JSON.stringify(opened));
  await page.waitForTimeout(800);

  const tabBtn = await page.$('.pc-tabs [data-addon="advanced-sim"]');
  ok(!!tabBtn, 'an "Advanced sim" tab is in the right panel strip');
  await tabBtn.click();
  await page.waitForSelector(pane, { timeout: 10000 });
  ok(/not a design approval/.test(await page.textContent(pane + ' [data-asim-honest]')), 'its panel opens with the honest note');
  ok(/Separate pieces\s*2/.test(await page.textContent(pane)) && /Static/.test(await page.textContent(pane)), 'it reads the part: 2 pieces, a static study');
  ok(await page.isDisabled(pane + ' [data-asim-act="run"]'), 'Run is off while the study is static');

  await act('kind-contact');
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.kind === 'contact', null, { timeout: 5000 });
  ok(true, 'Contact: the part\'s own Simulation study is now a contact study');
  await act('find-pairs');
  await page.waitForSelector(pane + ' [data-asim-found="1"]', { timeout: 5000 });
  ok(/0\.01 mm apart/.test(await page.textContent(pane + ' [data-asim-found]')), 'Find touching faces: one pair, 0.01 mm apart');
  await shot('advanced-sim-01-pairs');
  await act('add-pairs');
  await page.waitForSelector(pane + ' [data-asim-pair="p1"]', { timeout: 5000 });
  const undoLabel = await page.evaluate(() => window.partcraft.hist?.undoLabel?.() ?? window.partcraft.hist?.peek?.()?.label ?? null);
  ok(await page.evaluate(() => window.partcraft.part.studies.simulation.contacts.length === 1), 'Add: pair p1 is in the study', String(undoLabel));
  await page.fill(pane + ' [data-asim-field="steps"]', '6'); await page.press(pane + ' [data-asim-field="steps"]', 'Tab');
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.nonlinear.steps === 6, null, { timeout: 5000 });
  ok(true, 'Load steps typed: 6');

  const t0 = Date.now();
  await act('run');
  await page.waitForSelector(pane + ' [data-asim-result]', { timeout: 240000 });
  const secs = (Date.now() - t0) / 1000;
  ok((await page.getAttribute(pane + ' [data-asim-result]', 'data-asim-result')) === 'ok', `Run: converged (${secs.toFixed(1)} s in the page's compute worker)`);
  ok(workers.some((u) => /^blob:/.test(u) || /worker/i.test(u)), 'it ran on a Web Worker', workers.join(' '));
  const contact = await page.textContent(pane + ' [data-asim-row="res.contact"]');
  const force = Number((contact.match(/force ([\d.e+]+) N/) || [])[1]);
  ok(Math.abs(force - 27500) / 27500 < 0.01, `the contact carries the load: "${contact}"`);
  const plastic = await page.textContent(pane + ' [data-asim-row="res.plastic"]');
  const ep = Number((plastic.match(/Largest ([\d.e+-]+)/) || [])[1]), want = 25 * (1 / 2000 - 1 / 200000);
  ok(Math.abs(ep - want) / want < 0.03, `both bars yield: "${plastic}" vs ${want.toExponential(4)} by hand`);
  ok(Number(await page.getAttribute(pane + ' [data-asim-steps]', 'data-asim-steps')) >= 6, 'the load-step table');

  await page.selectOption(pane + ' [data-asim-field="plot"]', 'disp');
  await act('show-bands');
  await page.waitForSelector(pane + ' [data-asim-legend]', { timeout: 10000 });
  const placed = await page.evaluate(() => { const g = window.partcraft.part.addonBodies?.['advanced-sim']?.results; return g ? { n: g.bodies.length, name: g.name } : null; });
  ok(placed && placed.n >= 4 && /Displacement/.test(placed.name), `Show beside the part: ${placed?.n} colour bands as display bodies in the part`);
  await page.evaluate(() => { try { window.partcraft.view.view('iso'); } catch { /* the view */ } });
  await page.waitForTimeout(1200);
  await page.click(pane + ' [data-asim-result]').catch(() => {});
  await shot('advanced-sim-02-result');
  await page.$eval(pane + ' [data-asim-ccx]', (e) => e.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(300);
  await shot('advanced-sim-03-calculix');

  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), act('deck')]);
  const f = path.join(SHOTS, dl.suggestedFilename()); await dl.saveAs(f);
  const deck = fs.readFileSync(f, 'utf8');
  ok(/^\*\* .*\n\*\* NOT CHECKED IN CALCULIX/.test(deck) && /\*CONTACT PAIR/.test(deck) && /\*PLASTIC/.test(deck) && /TYPE=C3D10/.test(deck), `the deck "${dl.suggestedFilename()}" starts with its NOT CHECKED IN CALCULIX comment and has C3D10, *PLASTIC, *CONTACT PAIR (${Math.round(deck.length / 1024)} KB)`);
  fs.rmSync(f);
  ok(/never run in CalculiX/.test(await page.textContent(pane + ' [data-asim-msg]')), 'the status says the deck was never run in CalculiX');

  await act('clear-bands');
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => !window.partcraft.part.addonBodies?.['advanced-sim']?.results), 'Remove the plot takes the bodies away');
  await page.evaluate(() => window.ccAddons.loader.setEnabled('advanced-sim', false));
  await page.waitForTimeout(400);
  ok(!(await page.$('.pc-tabs [data-addon="advanced-sim"]')), 'switched off: the tab goes');
  ok(await page.evaluate(() => window.partcraft.part.studies.simulation.kind === 'contact'), 'the study stays the part\'s (the Simulation workspace can solve it too)');
  const real = problems.filter((p) => !/favicon|ResizeObserver|net::ERR|404/.test(p));
  ok(real.length === 0, 'no console errors', real.slice(0, 3).join(' | '));
} catch (e) {
  fail++; console.log('  FAIL ' + e.message);
  await shot('advanced-sim-error').catch(() => {});
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

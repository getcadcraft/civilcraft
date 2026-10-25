#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-model-apps.mjs — PartCraft's and BimCraft's add-on APIs 1.0 in the real lab pages (0.5 AO.7; session addons,
 * checked in the 0.5 final sweep). Run as root (it mints the test admin's session with sudo -u www-data; the admin-login
 * throttle is never touched).
 *
 *   node tools/addons-test/browser-model-apps.mjs [--shots <dir>] [--apps partcraft,bimcraft]
 *
 * Each app: its own loader starts (manifest "addons": "own": no #cc-addons on the page; window.ccAddons is the app's own),
 * nothing installed = nothing shown; the fixture add-on (tools/addons-test/<app>/…) installed in developer mode → active
 * after a reload.
 *   PartCraft: its tab in the right panel (shows the feature count), its command adds a feature (one undo step), its
 *              Properties section on a picked feature, its exporter in the Export menu (downloads the feature names).
 *   BimCraft:  the generated IFC fixture opened; its command tags the picked wall through IfcEditor (one undo step), its
 *              Properties section counts the pick, its exporter button beside Save as IFC downloads the IFC, its importer
 *              opens a .ifcw file (and the Open picker offers .ifcw).
 * Then switched off → gone; removed; no console errors (a 404 for the empty add-on list would count). Shots in
 * tmp/shots/addons-model-apps.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : path.join(ROOT, 'tmp/shots/addons-model-apps');
const APPS = (args.includes('--apps') ? args[args.indexOf('--apps') + 1] : 'partcraft,bimcraft').split(',');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const php = (script, cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', script, cmd], { cwd: ROOT }).toString().trim().split('\n').pop());
const pkgOf = (dir) => {
  const files = {};
  const walk = (d) => { for (const n of fs.readdirSync(path.join(dir, d))) { const p = d ? d + '/' + n : n; if (fs.statSync(path.join(dir, p)).isDirectory()) walk(p); else files[p] = fs.readFileSync(path.join(dir, p), 'utf8'); } };
  walk('');
  return { manifest: JSON.parse(files['addon.json']), files };
};
const { fixtureIfc } = await import(pathToFileURL(path.join(ROOT, 'tools/bimcraft-test/ifc-fixture.mjs')).href);

const { cookie } = php('tools/addons-test/admin.php', 'session');
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((x) => path.join(cacheDir, build, x)).find((x) => fs.existsSync(x));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
  const [cn, cv] = cookie.split('=');
  await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('response', (r) => { if (r.status() === 404 && /\/addons\//.test(r.url())) problems.push('404 ' + r.url()); });
  const ready = () => page.waitForFunction(() => window.ccAddons && window.ccAddons.loader && window.ccAddons.loader.started, null, { timeout: 60000 });
  const install = async (pkg) => {
    await page.evaluate(async (p) => { localStorage.setItem('cc-addons-dev', '1'); const r = await window.ccAddons.installPackage(p); if (!r.ok) throw new Error(r.reason); }, pkg);
    await page.reload({ waitUntil: 'load' });
    await ready();
    await page.waitForFunction((id) => ['active', 'failed', 'refused', 'off'].includes(window.ccAddons.list().find((a) => a.id === id)?.state), pkg.manifest.id, { timeout: 20000 });
  };
  const cleanup = async (id) => page.evaluate(async (x) => { await window.ccAddons.uninstall(x); localStorage.removeItem('cc-addons-dev'); localStorage.removeItem('cc-addons:' + window.ccAddons.loader.app); }, id);

  // ---------------------------------------------------------------- PartCraft
  if (APPS.includes('partcraft')) {
    console.log('\nPartCraft');
    await page.goto('https://getcadcraft.com/lab/partcraft', { waitUntil: 'load' });
    await ready();
    await page.waitForFunction(() => window.partcraft && window.partcraft.part, null, { timeout: 60000 });
    ok(await page.evaluate(() => !document.getElementById('cc-addons') && window.ccAddons.list().length === 0 && !document.querySelector('[data-addon]')), 'its own loader starts (no shell loader); nothing installed, nothing shown');
    await install(pkgOf(path.join(ROOT, 'tools/addons-test/partcraft/sketcher')));
    await page.waitForFunction(() => window.partcraft && window.partcraft.part, null, { timeout: 60000 });
    ok(await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'zz-test.sketcher')?.state === 'active'), 'the fixture add-on installed in developer mode is active after a reload');
    const tab = page.locator('[role="tab"][data-addon="zz-test.sketcher"]');
    ok(await tab.count() === 1, 'its tab is in the right panel');
    await tab.click();
    ok(await page.evaluate(() => { const p = document.querySelector('[data-rpane][data-addon="zz-test.sketcher"]'); return !!p && !p.hidden && /\d/.test(p.textContent); }), 'clicking it shows its pane (rendered by the add-on)');
    const n0 = await page.evaluate(() => window.partcraft.part.features.length);
    await page.evaluate(() => window.partcraft.run('zz-test.sketcher:add-sketch'));
    await page.waitForFunction((n) => window.partcraft.part.features.length === n + 1, n0, { timeout: 10000 }).catch(() => {});
    const added = await page.evaluate(() => window.partcraft.part.features.at(-1));
    ok(added && added.type === 'sketch' && added.name === 'From add-on', 'its command (run through PartCraft\'s run) adds a sketch feature', JSON.stringify(added && { type: added.type, name: added.name }));
    await page.evaluate(() => window.partcraft.undoRedo(true));
    ok(await page.evaluate((n) => window.partcraft.part.features.length === n, n0), 'one undo takes it back');
    await page.evaluate(() => window.partcraft.undoRedo(false));
    await page.evaluate(() => window.partcraft.selectFeature(window.partcraft.part.features.at(-1).id));
    await page.evaluate(() => window.partcraft.paramsUI.showTab('props'));
    await page.waitForSelector('[data-addon-section]', { timeout: 5000 }).catch(() => {});
    ok(await page.evaluate(() => { const s = document.querySelector('[data-addon-section]'); return !!s && /Features/.test(s.textContent); }), 'its Properties section shows on a picked feature');
    ok(await page.locator('[data-export-menu] [data-addon-export="zz-test.sketcher:names"], [data-export-menu] [data-addon-export]').count() >= 1, 'its exporter is in the Export menu');
    await page.screenshot({ path: path.join(SHOTS, '01-partcraft.png') });
    await page.evaluate(() => document.querySelector('[data-export-menu]').setAttribute('open', ''));
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 10000 }).catch(() => null), page.locator('[data-export-menu] [data-addon-export]').first().click()]);
    const text = dl ? fs.readFileSync(await dl.path(), 'utf8') : '';
    ok(dl && /\.txt$/.test(dl.suggestedFilename()) && /From add-on/.test(text), 'the exporter downloads the feature names', dl ? dl.suggestedFilename() : 'no download');
    await page.evaluate(() => window.ccAddons.loader.setEnabled('zz-test.sketcher', false));
    const goneP = () => !document.querySelector('[data-addon="zz-test.sketcher"]:not(.shell-addon), [data-addon-export]');
    await page.waitForFunction(goneP, null, { timeout: 5000 }).catch(() => {});
    ok(await page.evaluate(goneP), 'switched off: its tab and exporter are gone', await page.evaluate(() => JSON.stringify([...document.querySelectorAll('[data-addon="zz-test.sketcher"]:not(.shell-addon), [data-addon-export]')].map((e) => e.outerHTML.slice(0, 100)))));
    await cleanup('zz-test.sketcher');
  }

  // ---------------------------------------------------------------- BimCraft
  if (APPS.includes('bimcraft')) {
    console.log('\nBimCraft');
    await page.goto('https://getcadcraft.com/lab/bimcraft', { waitUntil: 'load' });
    await ready();
    ok(await page.evaluate(() => !document.getElementById('cc-addons') && window.ccAddons.list().every((a) => a.source === 'bundled' && a.state === 'off') && !document.querySelector('[data-addon]:not(.shell-addon), [data-addon-props], [data-addon-exports]')), 'its own loader starts (no shell loader); nothing installed (a bundled add-on that is off, like Plant, is only listed), nothing shown');
    await install(pkgOf(path.join(ROOT, 'tools/addons-test/bimcraft/tagger')));
    ok(await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'zz-test.tagger')?.state === 'active'), 'the fixture add-on installed in developer mode is active after a reload');
    const waitStatus = (re) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout: 60000 });
    ok(await page.evaluate(() => /\.ifcw/.test(document.querySelector('[data-file]').accept) && /\.ifc,/.test(document.querySelector('[data-file]').accept)), 'the Open picker offers its .ifcw files too');
    // opened through the add-on's importer (a .ifcw file → IFC bytes), before any edit (so no discard question)
    await page.setInputFiles('[data-file]', { name: 'bimcraft-fixture.ifcw', mimeType: 'application/octet-stream', buffer: Buffer.from(fixtureIfc()) });
    await waitStatus(/^Opened /);
    ok(await page.evaluate(() => /wrapped\.ifc/.test(window.bimcraftLive.name || '')), 'its importer opens a .ifcw file as IFC', await page.evaluate(() => window.bimcraftLive.name));
    ok(await page.locator('[data-addon-exports] [data-addon-export="zz-test.tagger:raw"], [data-addon-exports] [data-addon-export]').count() === 1, 'a model open: its exporter button sits beside Save as IFC');
    const wid = await page.evaluate(() => { const e = window.bimcraftLive.editor, f = e.api.file(e.mid); for (const id of f.ids()) if (f.type(id) === 'IFCWALL') return id; return null; });
    await page.evaluate((id) => window.__testTagger.model.select([id]), wid);
    await page.waitForSelector('[data-addon-props]', { timeout: 10000 }).catch(() => {});
    ok(await page.evaluate(() => { const s = document.querySelector('[data-addon-props]'); return !!s && /Selected/.test(s.textContent) && /1/.test(s.textContent); }), 'its Properties section counts the pick');
    const before = await page.evaluate(() => window.bimcraftLive.editor.changes.length);
    await page.evaluate(() => window.ccAddons.runCommand('zz-test.tagger:tag'));
    const tag = await page.evaluate((id) => { const e = window.bimcraftLive.editor; return e.api.GetLine(e.mid, id, false)?.Tag?.value ?? null; }, wid);
    ok(tag === 'T-' + wid && await page.evaluate((n) => window.bimcraftLive.editor.changes.length === n + 1, before), 'its command tags the picked wall: one IfcEditor change', String(tag));
    await page.screenshot({ path: path.join(SHOTS, '02-bimcraft.png') });
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }).catch(() => null), page.locator('[data-addon-exports] [data-addon-export]').first().click()]);
    const text = dl ? fs.readFileSync(await dl.path(), 'utf8') : '';
    ok(dl && /\.ifc$/.test(dl.suggestedFilename()) && text.includes("'T-" + wid + "'"), 'the exporter downloads the IFC with the tag in it', dl ? dl.suggestedFilename() : 'no download');
    await page.evaluate(() => window.ccAddons.loader.setEnabled('zz-test.tagger', false));
    const goneB = () => !document.querySelector('[data-addon="zz-test.tagger"]:not(.shell-addon), [data-addon-export]') && !window.ccAddons.commandList().length;
    await page.waitForFunction(goneB, null, { timeout: 5000 }).catch(() => {});
    ok(await page.evaluate(goneB), 'switched off: its exporter and command are gone', await page.evaluate(() => JSON.stringify({ els: [...document.querySelectorAll('[data-addon="zz-test.tagger"]:not(.shell-addon), [data-addon-export]')].map((e) => e.outerHTML.slice(0, 80)), cmds: window.ccAddons.commandList().length })));
    await cleanup('zz-test.tagger');
  }

  const unexpected = problems.filter((p) => !/unsigned/.test(p));
  ok(!unexpected.length, 'no console errors (and no 404 for an add-on list)', unexpected.slice(0, 3).join(' | '));
} finally {
  await browser.close();
  php('tools/addons-test/admin.php', 'down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

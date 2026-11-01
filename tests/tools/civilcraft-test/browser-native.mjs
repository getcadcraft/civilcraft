#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-native.mjs — CivilCraft 0.7.1 71.27 (owner 2026-10-26) at https://getcadcraft.com/lab/civilcraft: Save writes the pair
 * <name>.civilcraft.json + <name>.ifc, and opening finds the partner.
 *   Chromium: Save asks a folder (File System Access — stood in by the origin-private file system, a real directory handle) and writes
 *             both into it; both files opened together; the JSON alone after a reload asks for its partner (continue alone → warning
 *             ifc.native.missing in the Problems panel; add it → opens clean); an IFC edited by IfcOpenShell → ifc.native.changed and
 *             its fix "Show the IFC's geometry"; cancelling the folder picker downloads both.
 *   Firefox:  Save downloads both files (no File System Access there).
 * Run as root; minted session (tag cnt).   node tools/civilcraft-test/browser-native.mjs   Shots + files in tmp/shots/civilcraft-native/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-native');
const FIX = path.join(REPO, 'tools/civilcraft-test/fixtures/ifc');
const PY = path.join(REPO, 'tools/detailcraft-test/venv/bin/python');
fs.rmSync(SHOTS, { recursive: true, force: true });
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium, firefox } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pick = (re, sub) => { const b = fs.readdirSync(cacheDir).filter((d) => re.test(d)).sort((a, c) => parseInt(c.split('-')[1]) - parseInt(a.split('-')[1]))[0]; return sub.map((s) => path.join(cacheDir, b, s)).find((p) => fs.existsSync(p)); };
const chromeExe = pick(/^chromium-\d+$/, ['chrome-linux64/chrome', 'chrome-linux/chrome']), ffExe = pick(/^firefox-\d+$/, ['firefox/firefox']);
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cnt'], { encoding: 'utf8' }) || '{}');
admin('up');
const sess = admin('session');
const problems = [];
const ready = async (page) => {
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('dialog', (d) => d.accept());
  await page.goto(BASE + '/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
};
const openDemo = (page) => page.evaluate(async (text) => { window.civilcraft.project.saved = window.civilcraft.project.version; await window.civilcraft.openText(text, 'demo.civilcraft.json'); }, fs.readFileSync(path.join(FIX, 'demo.civilcraft.json'), 'utf8'));
const status = (page) => page.textContent('[data-status]');
const native = (page) => page.evaluate(() => (window.civilcraft.project.nativeWarnings || []).map((w) => w.code));

const chrome = await chromium.launch({ executablePath: chromeExe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
try {
  console.log('\n== Chromium: the folder');
  const ctx = await chrome.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  await ready(page);
  // the folder picker answered with the origin-private file system (a real directory handle; emptied first)
  await page.evaluate(() => { window.showDirectoryPicker = async () => { const r = await navigator.storage.getDirectory(); for await (const [n] of r.entries()) await r.removeEntry(n, { recursive: true }); window.__picked = (window.__picked || 0) + 1; return r; }; });
  await openDemo(page);
  await page.waitForFunction(() => window.civilcraft.project.state.alignments.length === 1);
  await page.click('.cv-tools [data-cmd="save"]');
  await page.waitForFunction(() => /^Saved /.test(document.querySelector('[data-status]').textContent), null, { timeout: 30000 });
  ok(/Saved IFC demo road\.civilcraft\.json and IFC demo road\.ifc into the folder you chose/.test(await status(page)), 'Save asks a folder once and writes both files into it: ' + await status(page));
  const files = await page.evaluate(async () => { const r = await navigator.storage.getDirectory(), out = {}; for await (const [n, h] of r.entries()) out[n] = await (await h.getFile()).text(); return out; });
  ok(Object.keys(files).sort().join() === 'IFC demo road.civilcraft.json,IFC demo road.ifc', 'the folder holds the pair', Object.keys(files));
  for (const [n, txt] of Object.entries(files)) fs.writeFileSync(path.join(SHOTS, n), txt);
  const J = path.join(SHOTS, 'IFC demo road.civilcraft.json'), I = path.join(SHOTS, 'IFC demo road.ifc');
  ok(JSON.parse(files['IFC demo road.civilcraft.json']).pair?.ifc === 'IFC demo road.ifc' && /'CadCraft_Native'/.test(files['IFC demo road.ifc']), 'each names the other');
  const v = JSON.parse(execFileSync(PY, ['-I', path.join(REPO, 'tools/civilcraft-test/ifc-check.py'), I, '--samples', '2'], { encoding: 'utf8', maxBuffer: 64 << 20 }));
  ok(v.nproblems === 0, 'IfcOpenShell (rules on) finds nothing in the saved IFC', v.problems);
  await page.evaluate(() => window.civilcraft.project.change('rename', (s) => { s.name = 'IFC demo road'; }));
  await page.click('.cv-tools [data-cmd="save"]');
  await page.waitForFunction(() => /^Saved /.test(document.querySelector('[data-status]').textContent) && !window.civilcraft.project.dirty);
  ok(await page.evaluate(() => window.__picked) === 1, 'the second Save writes to the same folder without asking');
  // both files opened together
  await page.evaluate(() => { const p = window.civilcraft.project; p.saved = p.version; });
  await page.setInputFiles('[data-file]', [J, I]);
  await page.waitForFunction(() => /Opened IFC demo road\.civilcraft\.json with IFC demo road\.ifc/.test(document.querySelector('[data-status]').textContent), null, { timeout: 30000 });
  ok((await native(page)).length === 0 && await page.evaluate(() => window.civilcraft.project.state.alignments.length === 1), 'both files opened together: the project, no warning');
  // the JSON alone, after a reload (the folder is forgotten): asked for the partner
  await page.evaluate(() => { const p = window.civilcraft.project; p.saved = p.version; });
  await page.reload({ waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  await page.setInputFiles('[data-file]', J);
  await page.waitForSelector('[data-ifc-pair]');
  ok(/IFC demo road\.civilcraft\.json is saved together with IFC demo road\.ifc/.test(await page.textContent('[data-ifc-pair]')), 'the JSON alone: CivilCraft asks to add IFC demo road.ifc or continue');
  await page.screenshot({ path: path.join(SHOTS, '01-partner.png') });
  await page.click('[data-ifc-pair-alone]');
  await page.waitForFunction(() => (window.civilcraft.project.nativeWarnings || []).length === 1);
  ok((await native(page))[0] === 'ifc.native.missing', 'continue alone: it opens, warning ifc.native.missing');
  await page.waitForTimeout(1200);
  const pc = await page.evaluate(() => (window.ccProblems?.store?.list?.() || window.ccProblems?.list?.() || []).filter?.((p) => /^ifc\.native/.test(p.code)).length ?? null);
  const badge = await page.textContent('.app-bar').catch(() => '');
  ok(pc === 1 || /Problems\s*[1-9]/.test(badge), 'the Problems panel counts it', { pc, badge: badge.slice(0, 200) });
  await page.evaluate(() => { const p = window.civilcraft.project; p.saved = p.version; });
  await page.setInputFiles('[data-file]', J);
  await page.waitForSelector('[data-ifc-pair]');
  await page.setInputFiles('[data-ifc-pair] input[type=file]', I);
  await page.waitForFunction(() => /Opened IFC demo road\.civilcraft\.json with IFC demo road\.ifc/.test(document.querySelector('[data-status]').textContent), null, { timeout: 30000 });
  ok((await native(page)).length === 0, 'add the partner: the pair opens, no warning');
  // the IFC edited by another program
  const E = path.join(SHOTS, 'edited', 'IFC demo road.ifc');
  fs.mkdirSync(path.dirname(E), { recursive: true });
  execFileSync(PY, ['-I', path.join(REPO, 'tools/civilcraft-test/ifc-edit.py'), I, E, '--delete', 'Lot 1']);
  await page.evaluate(() => { const p = window.civilcraft.project; p.saved = p.version; });
  await page.setInputFiles('[data-file]', [J, E]);
  await page.waitForFunction(() => (window.civilcraft.project.nativeWarnings || []).length === 1);
  ok((await native(page))[0] === 'ifc.native.changed' && /changed by another program/.test(await status(page)) && await page.evaluate(() => window.civilcraft.project.state.parcels.length === 1), 'the IFC changed by IfcOpenShell (a parcel deleted): the JSON opens (its parcel kept), warning ifc.native.changed');
  await page.screenshot({ path: path.join(SHOTS, '02-changed.png') });
  // cancelling the folder picker downloads both
  await page.evaluate(() => { window.showDirectoryPicker = async () => { throw new DOMException('cancelled', 'AbortError'); }; });
  const ctx2 = await chrome.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx2.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const p2 = await ctx2.newPage();
  await ready(p2);
  await p2.evaluate(() => { window.showDirectoryPicker = async () => { throw new DOMException('cancelled', 'AbortError'); }; });
  await openDemo(p2);
  const dls = [];
  p2.on('download', (dl) => dls.push(dl.suggestedFilename()));
  await p2.click('.cv-tools [data-cmd="save"]');
  await p2.waitForFunction(() => /^Saved /.test(document.querySelector('[data-status]').textContent), null, { timeout: 30000 });
  await p2.waitForTimeout(1500);
  ok(dls.sort().join() === 'IFC demo road.civilcraft.json,IFC demo road.ifc' && /as two downloads/.test(await status(p2)), 'no folder chosen: both download', dls);
  await ctx2.close();
  await ctx.close();

  console.log('\n== Studio / desktop (the host bridge, faked as browser-part2.mjs does)');
  const dctx = await chrome.newContext({ viewport: { width: 1440, height: 900 } });
  await dctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await dctx.addInitScript(() => {
    const files = new Map(), calls = [];
    let listener = null;
    window.__desk = { files, calls, fire: (p) => listener && listener(p), next: { save: '/home/u/Road/demo.civilcraft.json' } };
    window.cadcraftDesktop = {
      version: 1,
      async openDialog() { return null; },
      async saveDialog(o) { calls.push(['save', JSON.stringify(o)]); return window.__desk.next.save; },
      async readFile(p) { calls.push(['read', p]); if (!files.has(p)) throw new Error('not found'); return files.get(p); },
      async writeFile(p, b) { calls.push(['write', p, b.length]); files.set(p, b); },
      async stat(p) { return files.has(p) ? { size: files.get(p).length, mtime: 42 } : null; },
      async listDir(p) { return [...files.keys()].filter((k) => k.startsWith(p + '/')).map((k) => ({ name: k.slice(p.length + 1), dir: false })); },
      async launchFiles() { return []; },
      onOpenFiles(cb) { listener = cb; },
    };
  });
  const dp = await dctx.newPage();
  await ready(dp);
  await openDemo(dp);
  await dp.evaluate(() => window.civilcraft.command('save'));
  await dp.waitForFunction(() => /^Saved /.test(document.querySelector('[data-status]').textContent), null, { timeout: 30000 });
  const dc = await dp.evaluate(() => window.__desk.calls.filter((c) => c[0] !== 'read'));
  ok(/Saved demo\.civilcraft\.json and demo\.ifc side by side/.test(await status(dp)) && dc.some((c) => c[0] === 'write' && c[1] === '/home/u/Road/demo.civilcraft.json') && dc.some((c) => c[0] === 'write' && c[1] === '/home/u/Road/demo.ifc'), 'Studio: the save dialog once, then the JSON and the IFC written side by side', dc);
  await dp.evaluate(() => { window.__desk.calls.length = 0; window.civilcraft.project.change('rename', (s) => { s.name = 'Renamed'; }); });
  await dp.evaluate(() => window.civilcraft.command('save'));
  await dp.waitForFunction(() => !window.civilcraft.project.dirty);
  const dc2 = await dp.evaluate(() => window.__desk.calls);
  ok(!dc2.some((c) => c[0] === 'save') && dc2.filter((c) => c[0] === 'write').length === 2, 'the next Save writes both in place, no dialog', dc2);
  // double-click the JSON in the file manager: the IFC is found beside it
  await dp.evaluate(() => { const p = window.civilcraft.project; p.saved = p.version; window.__desk.fire(['/home/u/Road/demo.civilcraft.json']); });
  await dp.waitForFunction(() => /Opened demo\.civilcraft\.json with demo\.ifc/.test(document.querySelector('[data-status]').textContent), null, { timeout: 30000 });
  ok((await native(dp)).length === 0 && await dp.evaluate(() => window.__desk.calls.some((c) => c[0] === 'read' && c[1] === '/home/u/Road/demo.ifc')), 'opening the JSON reads its IFC from the same folder; no warning');
  // the IFC alone (the JSON gone): opens from its embedded copy, and Save writes the JSON beside it again
  await dp.evaluate(() => { window.__desk.files.delete('/home/u/Road/demo.civilcraft.json'); const p = window.civilcraft.project; p.saved = p.version; window.__desk.fire(['/home/u/Road/demo.ifc']); });
  await dp.waitForFunction(() => window.civilcraft.project.state.name === 'Renamed' && (window.civilcraft.project.nativeWarnings || []).length === 0 && /demo\.ifc/.test(document.querySelector('[data-status]').textContent), null, { timeout: 30000 });
  ok(true, 'the IFC alone opens the project from its embedded copy (name "Renamed"), no warning');
  await dp.evaluate(() => { window.__desk.calls.length = 0; window.civilcraft.project.change('x', (s) => { s.name = 'Renamed 2'; }); });
  await dp.evaluate(() => window.civilcraft.command('save'));
  await dp.waitForFunction(() => !window.civilcraft.project.dirty);
  ok(await dp.evaluate(() => window.__desk.calls.some((c) => c[0] === 'write' && c[1] === '/home/u/Road/demo.civilcraft.json')), 'Save writes the JSON beside the IFC again');
  await dctx.close();
} finally { await chrome.close(); }

if (ffExe) {
  console.log('\n== Firefox: two downloads');
  const ff = await firefox.launch({ executablePath: ffExe, firefoxUserPrefs: { 'network.dns.localDomains': 'getcadcraft.com', 'browser.download.folderList': 2 } });
  try {
    const ctx = await ff.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
    await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
    const page = await ctx.newPage();
    await ready(page);
    ok(await page.evaluate(() => typeof window.showDirectoryPicker) === 'undefined', 'Firefox has no folder picker');
    await openDemo(page);
    const dls = [];
    page.on('download', async (dl) => { dls.push(dl.suggestedFilename()); await dl.saveAs(path.join(SHOTS, 'ff-' + dl.suggestedFilename())); });
    await page.click('.cv-tools [data-cmd="save"]');
    await page.waitForFunction(() => /^Saved /.test(document.querySelector('[data-status]').textContent), null, { timeout: 30000 });
    await page.waitForTimeout(2500);
    ok(dls.sort().join() === 'IFC demo road.civilcraft.json,IFC demo road.ifc', 'Save downloads both files', dls);
    const ffj = path.join(SHOTS, 'ff-IFC demo road.civilcraft.json');
    ok(fs.existsSync(ffj) && JSON.parse(fs.readFileSync(ffj, 'utf8')).pair?.ifc === 'IFC demo road.ifc', 'and they are the pair');
    await ctx.close();
  } finally { await ff.close(); }
} else console.log('  (Firefox not installed: skipped)');
ok(!problems.filter((p) => !/favicon/.test(p)).length, 'no console errors', problems);
admin('down');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

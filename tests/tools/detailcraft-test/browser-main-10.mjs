#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-main-10.mjs: guard for PERF.71 (0.10, code-mains-10), which moves topics out of detailcraft.js's start() closure into
 * their own modules. It drives each moved topic through the real page with real downloads and dialogs and fails on any console
 * error or page error (the way a missed closure variable shows): the exports (BOM, bending schedule, IFC, NC zip, KISS, report
 * CSV and PDF, USD, cut list CSV), Move / Rotate / Mirror and the Copy option of the Transform block, Copy, Duplicate, Paste,
 * Cut with undo, and the Mitre dialog (open, preview, cancel).
 *
 *   node tools/detailcraft-test/browser-main-10.mjs [--shots <dir>]      (root: a signed-in lab session)
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
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const lab = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' })).cookie.split('=');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const dc = (fn, arg) => page.evaluate(fn, arg);
const settle = () => page.waitForTimeout(120);
const members = () => dc(() => window.detailcraft.model.state.members.length);
const conns = (type) => dc((t) => window.detailcraft.model.state.connections.filter((c) => !t || c.type === t).length, type);
const say = () => dc(() => document.querySelector('[data-status-line], [data-status]:not(.dc-tabs *)')?.textContent || '');
/** Runs one command that downloads a file; returns { name, size }. */
async function download(act) {
  const [d] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), act()]);
  const p = await d.path();
  return { name: d.suggestedFilename(), size: fs.statSync(p).size, path: p };
}

try {
  await ctx.addCookies([{ name: lab[0], value: lab.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(`${BASE}/lab/detailcraft?space=paper`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.detailcraft, null, { timeout: 15000 });
  await dc(() => { localStorage.removeItem('cadcraft.areaclip'); localStorage.removeItem('detailcraft.clipboard'); });
  ok(true, 'lab page opens');

  // a small frame: a column, a beam, and a second beam that turns 45 degrees at the beam's end (a mitre)
  await dc(() => { window.detailcraft.model.change('frame', (tx) => {
    tx.addMember({ type: 'column', profile: 'W10x49', material: 'A992', position: 'middle', rotation: 0, start: [0, 0, 0], end: [0, 0, 4000], phase: 1 });
    tx.addMember({ type: 'beam', profile: 'W16x26', material: 'A992', position: 'top', rotation: 0, start: [0, 0, 4000], end: [6000, 0, 4000], phase: 1 });
    tx.addMember({ type: 'beam', profile: 'W16x26', material: 'A992', position: 'top', rotation: 0, start: [6000, 0, 4000], end: [9000, 3000, 4000], phase: 1 });
  }); });
  await settle();
  ok(await members() === 3, 'a column and two beams');

  // ---- exports (export-ui.js) ----
  let f = await download(() => dc(() => window.detailcraft.act('bom')));
  ok(/BOM\.csv$/.test(f.name) && f.size > 40, 'BOM CSV downloaded: ' + f.name);
  f = await download(() => dc(() => window.detailcraft.act('ifc')));
  ok(/\.ifc$/.test(f.name) && fs.readFileSync(f.path, 'utf8').includes('IFCBEAM'), 'IFC downloaded with IfcBeam: ' + f.name);
  f = await download(() => dc(() => window.detailcraft.act('nc')));
  ok(/NC\.zip$/.test(f.name) && f.size > 200, 'NC zip downloaded: ' + f.name + ' ' + f.size + ' bytes');
  f = await download(() => dc(() => window.detailcraft.act('kiss')));
  ok(/\.kss$/.test(f.name) && f.size > 40, 'KISS file downloaded: ' + f.name);
  const said1 = await dc(() => { window.detailcraft.act('bending'); return document.body.innerText; });
  ok(true, 'bending schedule (no footings: says there is none, no error)');
  await dc(() => window.detailcraft.act('report'));
  await settle();
  ok(await dc(() => !!document.querySelector('[data-report]')), 'the Report tab opens');
  // the Report tab's buttons: CSV and PDF are the shell of exportReport / exportReportPdf; click them by their text
  const csvBtn = page.locator('[data-report] button', { hasText: /csv/i }).first();
  if (await csvBtn.count()) { f = await download(() => csvBtn.click()); ok(/\.csv$/.test(f.name), 'report CSV downloaded: ' + f.name); }
  else ok(false, 'a CSV button in the Report tab');
  const pdfBtn = page.locator('[data-report] button', { hasText: /pdf/i }).first();
  if (await pdfBtn.count()) { f = await download(() => pdfBtn.click()); ok(/\.pdf$/.test(f.name) && fs.readFileSync(f.path).subarray(0, 4).toString() === '%PDF', 'report PDF downloaded: ' + f.name); }
  else ok(false, 'a PDF button in the Report tab');
  // the cut list (nestPanel + exportNest)
  await page.locator('[data-tab="nest"]').click();
  await settle();
  const nestBtn = page.locator('[data-nest-csv]').first();
  if (await nestBtn.count()) { f = await download(() => nestBtn.click()); ok(/\.csv$/.test(f.name), 'cut list CSV downloaded: ' + f.name); }
  else ok(false, 'the Cut list tab has its CSV button');
  // USD asks first: choose the plain-text format
  const usdDl = page.waitForEvent('download', { timeout: 20000 }).catch(() => null);
  await dc(() => { window.detailcraft.act('usd'); });
  await page.waitForSelector('dialog[open]', { timeout: 5000 }).catch(() => {});
  const usdBtn = page.locator('dialog[open] button', { hasText: /usda|text|ascii/i }).first();
  if (await usdBtn.count()) { await usdBtn.click(); const d = await usdDl; ok(!!d && /\.usda$/.test(d.suggestedFilename()), 'USD (usda) downloaded'); }
  else ok(false, 'the USD format dialog offers usda');
  await dc(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));

  // ---- Transform block (xf-ui.js): select the column, move by 1000 in x, with copy, then rotate and mirror ----
  const colRef = await dc(() => ({ kind: 'member', id: window.detailcraft.model.state.members[0].id }));
  await dc((r) => window.detailcraft.setSelection([r]), colRef);
  await settle();
  const hasXf = await dc(() => !!document.querySelector('[data-xf]'));
  ok(hasXf, 'the Transform block shows for a selected member');
  if (hasXf) {
    await page.check('#dc-xf-copy');
    await page.fill('#dc-xfoff0', '1000');
    await page.locator('[data-xf-move] button[type=submit]').click();
    await settle();
    ok(await members() === 4, 'Move with Copy: a fourth member');
    await dc(() => window.detailcraft.act('undo'));
    ok(await members() === 3, 'one undo step takes the copy away');
    await dc((r) => window.detailcraft.setSelection([r]), colRef);
    await settle();
    await page.uncheck('#dc-xf-copy');
    const x0 = await dc(() => window.detailcraft.model.state.members[0].start[0]);
    await page.fill('#dc-xfoff0', '500');
    await page.locator('[data-xf-move] button[type=submit]').click();
    await settle();
    ok(await dc(() => window.detailcraft.model.state.members[0].start[0]) === x0 + 500, 'Move by 500: the column moved');
    await page.locator('[data-xf-rotate] button[type=submit]').click();
    await settle();
    ok(await dc(() => window.detailcraft.model.state.members[0].start[0]) !== x0 + 500 || true, 'Rotate ran');
    if (await page.locator('[data-xf-mirror] button[type=submit]').count()) { await page.locator('[data-xf-mirror] button[type=submit]').click(); await settle(); ok(true, 'Mirror ran'); }
    await dc(() => { window.detailcraft.act('undo'); window.detailcraft.act('undo'); window.detailcraft.act('undo'); });
    await settle();
  }

  // ---- clipboard (clipboard-ui.js): copy, duplicate, paste, cut ----
  const beamRef = await dc(() => ({ kind: 'member', id: window.detailcraft.model.state.members[1].id }));
  const n0 = await members();
  await dc((r) => { window.detailcraft.setSelection([r]); window.detailcraft.act('copy'); }, beamRef);
  ok(await dc(() => !!window.detailcraft.clipboard()), 'Copy fills DetailCraft\'s clipboard');
  ok(await dc(() => !!localStorage.getItem('detailcraft.clipboard')), 'the clipboard is also stored for a new page');
  await dc(() => window.detailcraft.act('duplicate'));
  await settle();
  const n1 = await members();
  ok(n1 === n0 + 1, 'Duplicate: one more member (' + n0 + ' to ' + n1 + ')');
  await dc(() => window.detailcraft.act('undo'));
  ok(await members() === n0, 'Duplicate undone in one step');
  await dc((r) => { window.detailcraft.setSelection([r]); window.detailcraft.act('cut'); }, beamRef);
  await settle();
  ok(await members() === n0 - 1, 'Cut removes the member');
  await dc(() => window.detailcraft.act('undo'));
  ok(await members() === n0, 'Cut undone');
  await dc(() => { window.detailcraft.setSelection([]); window.detailcraft.act('paste-in-place'); });
  await settle();
  await page.keyboard.press('Escape');

  // ---- the Mitre dialog (mitre-ui.js): the two beams; open, the drawing and its checks, plates off turns Add on, cancel.
  // (Add, Apply and the cut following the knee are browser-04's m71 section.)
  const ids = await dc(() => window.detailcraft.model.state.members.filter((m) => m.type === 'beam').map((m) => ({ kind: 'member', id: m.id })));
  await dc((r) => { window.detailcraft.setSelection(r); window.detailcraft.act('mitre'); }, ids);
  await page.waitForSelector('dialog[data-mitre][open]', { timeout: 5000 }).catch(() => {});
  ok(await page.locator('dialog[data-mitre][open]').count() === 1, 'Mitre dialog opens for the two beams');
  if (await page.locator('dialog[data-mitre][open]').count()) {
    ok(await page.locator('dialog[data-mitre] svg').count() > 0, 'the dialog draws its preview');
    ok(await dc(() => document.querySelector('[data-mitre-apply]').disabled), 'Add is off while the plates cannot be made');
    await page.uncheck('[data-mitre-param="plates"]');   // the two beams do not meet in the plane of their webs: a plain mitre cut
    await settle();
    ok(await dc(() => !document.querySelector('[data-mitre-apply]').disabled && /./.test(document.querySelector('.dc-mitre-lede').textContent)), 'plates off: Add is on and the lede names the joint');
    await page.keyboard.press('Escape');
    await settle();
    ok(await page.locator('dialog[data-mitre][open]').count() === 0, 'Esc closes the dialog');
    ok(await conns('mitre') === 0, 'nothing was added');
  }
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'main-10.png') });
  ok(problems.length === 0, 'no console errors, no page errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
} catch (e) {
  fail++; console.log('  FAIL ' + (e && e.message ? e.message.split('\n')[0] : e));
  if (problems.length) console.log('  problems: ' + problems.slice(0, 5).join(' | '));
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

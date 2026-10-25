#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-open.mjs — Open in the desktop app never hangs (0.6.1 FIX-061-OPEN-HANG; Karol's report: "clicking Open sometimes did
 * nothing and the app froze; only restarting and choosing the file from the Recent list worked").
 *
 *   node tools/cadcraft-test/browser-open.mjs [--shots <dir>]
 *
 * Run as root (a session for the test admin cctest+cadcraft@projectz.xyz is minted by `tools/cadcraft-test/admin.php session`,
 * disabled again at the end). Uses the cached Playwright Chromium and a stand-in desktop bridge (window.cadcraftDesktop, as the
 * desktop shell puts it on the page; host.js uses it). The cause was the OPEN command waiting for itself: Open from the toolbar
 * or the command line runs as the command OPEN, and opening the chosen file waited for the running command to finish first.
 * Checks, each with the engine free afterwards (no command left running, a next command starts):
 *   the toolbar Open button and the typed OPEN open the chosen file (they hung before the fix); Ctrl+O still does; the dialog
 *   cancelled; the dialog failing; the file failing to read; a damaged DWG; a second Open while the dialog is still up (no second
 *   dialog, said); two files handed over at once (opened one after another, each in its own tab); typing reaches the command
 *   line after the dialog; the busy overlay is never left up; no console errors.
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
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session'], { encoding: 'utf8' }));

// public fixtures (fixtures/README.md); a "DWG" that only has the right first bytes
const files = {
  '/jobs/kitchen-equipment.dwg': fs.readFileSync(path.join(REPO, 'fixtures/dwg/kitchen-equipment.dwg')).toString('base64'),
  '/jobs/base-plan.dxf': fs.readFileSync(path.join(REPO, 'fixtures/dwg/base-plan.dxf')).toString('base64'),
  '/jobs/base-plan.dwg': fs.readFileSync(path.join(REPO, 'fixtures/dwg/base-plan.dwg')).toString('base64'),
  '/jobs/damaged.dwg': Buffer.concat([Buffer.from('AC1032'), Buffer.alloc(4000, 0x5a)]).toString('base64'),
};

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/damaged|could not be read|unreadable/i.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('download', () => problems.push('a download started (the desktop goes through the bridge)'));

try {
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await page.addInitScript((files) => {
    const store = new Map(Object.entries(files).map(([k, v]) => [k, Uint8Array.from(atob(v), (c) => c.charCodeAt(0))]));
    // the next answer of the dialog: a list of paths, null (cancelled), 'throw', or 'wait' (stays up until __deskAnswer())
    const desk = window.__desk = { dialogs: 0, answers: [], reads: [], failRead: new Set() };
    window.cadcraftDesktop = {
      version: 1,
      openDialog: async () => {
        desk.dialogs++;
        const a = desk.answers.length ? desk.answers.shift() : null;
        if (a === 'throw') throw new Error('dialog: the system dialog could not be shown');
        if (a === 'wait') return new Promise((r) => { window.__deskAnswer = r; });
        return a;
      },
      saveDialog: async () => null,
      readFile: async (p) => { desk.reads.push(p); if (desk.failRead.has(p)) throw new Error('io: the disk said no'); if (!store.has(p)) throw new Error('not_found: ' + p); return store.get(p).slice(); },
      writeFile: async (p, b) => { store.set(p, b); },
      stat: async (p) => (store.has(p) ? { size: store.get(p).length, mtime: 0 } : null),
      launchFiles: async () => [],
      onOpenFiles: (cb) => { window.__deskOpen = cb; },
    };
  }, files);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.__deskOpen);
  const state = () => page.evaluate(() => ({
    running: window.cadcraft.engine.running, source: window.cadcraft.doc.meta.source || null, n: window.cadcraft.doc.count(),
    busy: !document.querySelector('[data-busy]').hidden, focus: document.activeElement?.matches('[data-cmd-input]') || false, dialogs: window.__desk.dialogs,
    log: document.querySelector('[data-history]')?.textContent || '',
  }));
  const idle = () => page.waitForFunction(() => !window.cadcraft.engine.running && document.querySelector('[data-busy]').hidden, null, { timeout: 30000 }).then(() => true, () => false);
  const answer = (a) => page.evaluate((a) => window.__desk.answers.push(a), a);
  // a next command starts and can be ended: the engine is free
  const nextCommandWorks = async () => {
    await page.evaluate(() => { window.cadcraft.engine.text('LINE'); });
    await page.waitForTimeout(150);
    const r = await page.evaluate(() => window.cadcraft.engine.running);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
    return r === 'LINE' && !(await page.evaluate(() => window.cadcraft.engine.running));
  };

  console.log('\n== the toolbar Open button (the hang Karol saw)');
  await answer(['/jobs/kitchen-equipment.dwg']);
  await page.click('[data-cmd="OPEN"]');
  await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'kitchen-equipment.dwg', null, { timeout: 30000 }).catch(() => {});
  let s = await state();
  ok(s.source === 'kitchen-equipment.dwg' && s.n > 0, 'the drawing chosen in the dialog opens', JSON.stringify({ source: s.source, n: s.n, running: s.running }));
  ok(await idle(), 'the OPEN command ends and the busy overlay is gone (before the fix: OPEN stayed running for good)', JSON.stringify(await state()));
  ok(await nextCommandWorks(), 'the next command (LINE) starts and ends: nothing is stuck');
  s = await state();
  ok(s.focus, 'typing goes to the command line after the dialog');

  console.log('\n== OPEN typed on the command line');
  await answer(['/jobs/base-plan.dxf']);
  await page.click('[data-cmd-input]'); await page.keyboard.type('OPEN'); await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'base-plan.dxf', null, { timeout: 30000 }).catch(() => {});
  s = await state();
  ok(s.source === 'base-plan.dxf' && await idle(), 'OPEN opens the DXF in its own tab and ends', JSON.stringify({ source: s.source, running: s.running }));
  ok(await nextCommandWorks(), 'and the next command works');

  console.log('\n== Ctrl+O (worked before, still does)');
  await answer(['/jobs/base-plan.dwg']);
  await page.click('[data-cmd-input]');
  await page.keyboard.press('Control+o');
  await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'base-plan.dwg', null, { timeout: 30000 }).catch(() => {});
  ok((await state()).source === 'base-plan.dwg' && await idle(), 'Ctrl+O opens the DWG');

  console.log('\n== the dialog cancelled, the dialog failing');
  const before = (await state()).source;
  await answer(null);
  await page.click('[data-cmd="OPEN"]');
  await page.waitForTimeout(400);
  s = await state();
  ok(s.source === before && await idle() && await nextCommandWorks(), 'cancelled: nothing changes, OPEN ends, the next command works');
  await answer('throw');
  await page.click('[data-cmd="OPEN"]');
  await page.waitForTimeout(400);
  s = await state();
  ok(/Could not open : dialog: the system dialog could not be shown|Could not open\s*: dialog/.test(s.log) && await idle() && await nextCommandWorks(), 'the dialog failing: said, OPEN ends, the next command works', s.log.slice(-200));

  console.log('\n== the file failing to read, a damaged DWG');
  await page.evaluate(() => window.__desk.failRead.add('/jobs/kitchen-equipment.dwg'));
  await answer(['/jobs/kitchen-equipment.dwg']);
  await page.click('[data-cmd="OPEN"]');
  await page.waitForTimeout(600);
  s = await state();
  ok(/Could not open kitchen-equipment\.dwg: io: the disk said no/.test(s.log) && await idle() && await nextCommandWorks(), 'a read error: said, no overlay left up, the next command works', s.log.slice(-200));
  await page.evaluate(() => window.__desk.failRead.clear());
  await answer(['/jobs/damaged.dwg']);
  await page.click('[data-cmd="OPEN"]');
  await page.waitForFunction(() => /Could not open damaged\.dwg/.test(document.querySelector('[data-history]')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
  s = await state();
  ok(/Could not open damaged\.dwg/.test(s.log) && await idle() && await nextCommandWorks(), 'a damaged DWG: said, no overlay left up, the next command works', s.log.slice(-200));

  console.log('\n== a second Open while the dialog is still up');
  await answer('wait');
  const d0 = (await state()).dialogs;
  await page.click('[data-cmd="OPEN"]');
  await page.waitForTimeout(200);
  await page.click('[data-cmd-input]');
  await page.keyboard.press('Control+o');   // Ctrl+O again while the first dialog waits
  await page.waitForTimeout(200);
  s = await state();
  ok(s.dialogs === d0 + 1 && /The Open dialog is still up/.test(await page.textContent('[data-status]').catch(() => '') || '') , 'no second dialog; the status line says the first is still up', JSON.stringify({ dialogs: s.dialogs - d0 }));
  await page.evaluate(() => window.__deskAnswer(['/jobs/kitchen-equipment.dwg']));
  await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'kitchen-equipment.dwg', null, { timeout: 30000 }).catch(() => {});
  ok((await state()).source === 'kitchen-equipment.dwg' && await idle() && await nextCommandWorks(), 'once a file is chosen it opens, and the engine is free');
  await answer(['/jobs/base-plan.dxf']);
  await page.click('[data-cmd="OPEN"]');
  await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'base-plan.dxf', null, { timeout: 30000 }).catch(() => {});
  ok((await state()).source === 'base-plan.dxf', 'and Open works again afterwards');

  console.log('\n== two files handed over at once (double-click while running)');
  const tabTitles = () => page.evaluate(() => [...document.querySelectorAll('.cc-doctab')].map((b) => b.title));
  const tabs0 = (await tabTitles()).length;
  await page.evaluate(() => window.__deskOpen(['/jobs/base-plan.dwg', '/jobs/kitchen-equipment.dwg']));
  await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'kitchen-equipment.dwg', null, { timeout: 60000 }).catch(() => {});
  await idle();
  const names = await tabTitles();
  ok(names.length === tabs0 + 2 && names.slice(-2).join('|') === 'base-plan.dwg|kitchen-equipment.dwg', 'both open, one after another, each in its own tab', JSON.stringify(names));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '01-open.png') });
  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (err) {
  ok(false, 'browser run', err.stack || err.message);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'error.png') }).catch(() => {});
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

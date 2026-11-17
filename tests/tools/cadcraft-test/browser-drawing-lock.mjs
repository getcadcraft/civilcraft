#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-drawing-lock.mjs — "open somewhere else, by …" (1.0 ORS.27) in the CadCraft lab build, headless Chromium, with a
 * MADE-UP desktop bridge put on the page before the app loads (window.cadcraftDesktop: an in-memory disk with the real
 * shell's rule that only opened files and chosen folders can be reached). It proves the app's hooks (open, read-only,
 * open anyway, save asks, WHOHAS). It is NOT CadCraft Studio: the real shell, a real shared folder and two real computers
 * have not been tried. The rules themselves: bin/test-drawing-lock.mjs.
 *
 *   node tools/cadcraft-test/browser-drawing-lock.mjs
 * Run as root (a session for the test admin from tools/cadcraft-test/admin.php). Fails on a console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DXF = '0\nSECTION\n2\nENTITIES\n0\nLINE\n8\n0\n10\n0\n20\n0\n11\n10\n21\n10\n0\nENDSEC\n0\nEOF\n';
const lockOf = (who, id, agoMs) => JSON.stringify({ format: 'cadcraft-drawing-lock', v: 1, file: 'Plan.dxf', who, computer: null, id, session: 's', app: 'CadCraft', version: 'dev', since: new Date(Date.now() - agoMs - 600000).toISOString(), seen: new Date(Date.now() - agoMs).toISOString() });

/** A page with the made-up bridge: `disk` path → text, `dirs` the folders "chosen", `launch` the files it starts with. */
async function open({ disk, dirs, launch }) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript(({ disk, dirs, launch }) => {
    try { localStorage.setItem('cadcraft.tour', 'skipped'); } catch { /* fine */ }
    if (window.top !== window) return;
    const files = new Map(Object.entries(disk)), grantFiles = new Set(launch), grantDirs = new Set(dirs);
    const allowed = (p) => grantFiles.has(p) || [...grantDirs].some((d) => p.startsWith(d + '/'));
    const chk = (p) => { if (!allowed(p)) throw new Error('not_allowed: the app can reach only files you opened or saved, or folders you chose'); };
    const enc = (s) => new TextEncoder().encode(s), dec = (b) => new TextDecoder().decode(b);
    let queue = launch.slice();
    window.__lockDisk = files; window.__lockAsked = [];
    window.cadcraftDesktop = {
      version: 1,
      openDialog: async () => null, saveDialog: async () => { window.__lockAsked.push('saveDialog'); return null; },
      openFolderDialog: async () => { grantDirs.add('/office'); return '/office'; },
      readFile: async (p) => { chk(p); if (!files.has(p)) throw new Error('not_found: ' + p); return enc(files.get(p)); },
      writeFile: async (p, b) => { chk(p); files.set(p, dec(b)); },
      createFileExclusive: async (p, b) => { chk(p); if (files.has(p)) return false; files.set(p, dec(b)); return true; },
      removeFile: async (p) => { chk(p); return files.delete(p); },
      stat: async (p) => { chk(p); return files.has(p) ? { size: files.get(p).length, mtime: Date.now() } : null; },
      listDir: async (d) => [...files.keys()].filter((k) => k.startsWith(d + '/')).map((k) => ({ name: k.slice(d.length + 1), dir: false })),
      launchFiles: async () => { const q = queue; queue = []; return q; },
      onOpenFiles: () => {},
    };
  }, { disk, dirs, launch });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.cadcraft.host.drawingLock);
  return { ctx, page };
}
const history = (page) => page.evaluate(() => document.querySelector('[data-history]')?.textContent || '');
const lock = (page, p = '/office/Plan.dxf.cclock') => page.evaluate((p) => { const s = window.__lockDisk.get(p); return s ? JSON.parse(s) : null; }, p);
const typeCmd = async (page, s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await sleep(200); };
const dialog = (page) => page.evaluate(() => { const d = document.querySelector('dialog.cc-ask[open]'); return d ? { title: d.querySelector('h2')?.textContent, text: d.querySelector('.cc-ask-text')?.textContent, keys: [...d.querySelectorAll('button[data-key]')].map((b) => b.dataset.key + ':' + b.textContent) } : null; });

try {
  // ---- nobody has it: opening writes the lock; saving does not ask; closing the window removes it
  {
    const { ctx, page } = await open({ disk: { '/office/Plan.dxf': DXF }, dirs: ['/office'], launch: ['/office/Plan.dxf'] });
    await page.waitForFunction(() => window.cadcraft.doc.count() === 1, null, { timeout: 30000 });
    await sleep(300);
    ok(await page.evaluate(() => window.cadcraft.host.drawingLock.available), 'with a desktop bridge the feature is there');
    const l = await lock(page);
    ok(l && l.format === 'cadcraft-drawing-lock' && l.file === 'Plan.dxf' && l.who && l.version === 'dev' && l.since && l.seen, 'opening a drawing writes Plan.dxf.cclock (who, when, version)', JSON.stringify(l));
    ok((await dialog(page)) === null, 'and asks nothing');
    await typeCmd(page, 'WHOHAS'); await typeCmd(page, 'C');
    ok(/Plan\.dxf: open here, by you/.test(await history(page)), 'WHOHAS Current: open here, by you');
    await typeCmd(page, 'LINE'); await typeCmd(page, '0,0'); await typeCmd(page, '5,5'); await page.keyboard.press('Enter'); await sleep(150);
    await typeCmd(page, 'SAVE'); await sleep(400);
    ok((await dialog(page)) === null && /LINE/.test(await page.evaluate(() => window.__lockDisk.get('/office/Plan.dxf'))) && await page.evaluate(() => !window.cadcraft.doc.dirty), 'saving my own drawing writes the file without a question');
    // someone opens it anyway meanwhile: my next refresh says so, and my next save asks
    await page.evaluate((text) => window.__lockDisk.set('/office/Plan.dxf.cclock', text), lockOf('Ben Ito', 'ben', 1000));
    await page.evaluate(() => window.cadcraft.host.drawingLock.beat()); await sleep(200);
    ok(/Ben Ito has opened this drawing as well/.test(await history(page)), 'someone opening it anyway is said at the next refresh');
    await typeCmd(page, 'LINE'); await typeCmd(page, '0,0'); await typeCmd(page, '7,7'); await page.keyboard.press('Enter'); await sleep(150);
    const before = await page.evaluate(() => window.__lockDisk.get('/office/Plan.dxf'));
    await typeCmd(page, 'SAVE'); await sleep(300);
    let d = await dialog(page);
    ok(d && /Ben Ito/.test(d.text) && d.keys.map((k) => k.split(':')[0]).join() === 'cancel,save', 'saving over a file someone else has open asks first, naming them', JSON.stringify(d));
    await page.click('dialog.cc-ask[open] button[data-key="cancel"]'); await sleep(300);
    ok((await page.evaluate(() => window.__lockDisk.get('/office/Plan.dxf'))) === before && /was not saved/.test(await history(page)), 'Cancel: the file is left as it was');
    await typeCmd(page, 'SAVE'); await sleep(300);
    await page.click('dialog.cc-ask[open] button[data-key="save"]'); await sleep(500);
    ok((await page.evaluate(() => window.__lockDisk.get('/office/Plan.dxf'))) !== before && (await lock(page)).who !== 'Ben Ito', 'Save anyway: written, and the lock is mine again');
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide'))); await sleep(300);
    ok((await lock(page)) === null, 'the window going away removes the lock file');
    await ctx.close();
  }
  // ---- someone has it: who, since when; read-only
  {
    const { ctx, page } = await open({ disk: { '/office/Plan.dxf': DXF, '/office/Plan.dxf.cclock': lockOf('Ben Ito', 'ben', 30000) }, dirs: ['/office'], launch: ['/office/Plan.dxf'] });
    await page.waitForSelector('dialog.cc-ask[open]', { timeout: 30000 });
    const d = await dialog(page);
    ok(d && /Plan\.dxf is already open/.test(d.title) && /Ben Ito has had Plan\.dxf open since/.test(d.text), 'opening a drawing someone has: says who and since when', JSON.stringify(d));
    ok(d && d.keys.map((k) => k.split(':')[1]).join(' / ') === 'Cancel / Open anyway / Open read-only', 'and offers Cancel / Open anyway / Open read-only', d?.keys.join());
    ok(await page.evaluate(() => window.cadcraft.doc.count() === 0), 'nothing is opened before the answer');
    await page.click('dialog.cc-ask[open] button[data-key="readonly"]');
    await page.waitForFunction(() => window.cadcraft.doc.count() === 1, null, { timeout: 30000 }); await sleep(300);
    ok((await lock(page)).who === 'Ben Ito' && /open read-only/.test(await history(page)), 'read-only: the drawing opens, Ben\'s lock is left alone, and the history says so');
    await typeCmd(page, 'LINE'); await typeCmd(page, '0,0'); await typeCmd(page, '5,5'); await page.keyboard.press('Enter'); await sleep(150);
    await typeCmd(page, 'SAVE'); await sleep(500);
    ok(await page.evaluate(() => window.__lockAsked.includes('saveDialog') && window.__lockDisk.get('/office/Plan.dxf').indexOf('5.0') < 0 && !/\n5\n/.test(window.__lockDisk.get('/office/Plan.dxf'))), 'read-only: Save asks for a new name (the save dialog) and the file is not written');
    await ctx.close();
  }
  // ---- cancel; open anyway; a stale lock
  {
    const { ctx, page } = await open({ disk: { '/office/Plan.dxf': DXF, '/office/Plan.dxf.cclock': lockOf('Ben Ito', 'ben', 30000) }, dirs: ['/office'], launch: ['/office/Plan.dxf'] });
    await page.waitForSelector('dialog.cc-ask[open]', { timeout: 30000 });
    await page.click('dialog.cc-ask[open] button[data-key="cancel"]'); await sleep(400);
    ok(await page.evaluate(() => window.cadcraft.doc.count() === 0) && (await lock(page)).who === 'Ben Ito', 'Cancel: nothing opens, the lock is untouched');
    await ctx.close();
    const b = await open({ disk: { '/office/Plan.dxf': DXF, '/office/Plan.dxf.cclock': lockOf('Ben Ito', 'ben', 30000) }, dirs: ['/office'], launch: ['/office/Plan.dxf'] });
    await b.page.waitForSelector('dialog.cc-ask[open]', { timeout: 30000 });
    await b.page.click('dialog.cc-ask[open] button[data-key="anyway"]');
    await b.page.waitForFunction(() => window.cadcraft.doc.count() === 1, null, { timeout: 30000 }); await sleep(300);
    ok((await lock(b.page)).who !== 'Ben Ito' && /you opened it anyway/.test(await history(b.page)), 'Open anyway: the lock becomes mine and the history says whose it was');
    await b.ctx.close();
    const c = await open({ disk: { '/office/Plan.dxf': DXF, '/office/Plan.dxf.cclock': lockOf('Ben Ito', 'ben', 20 * 60000) }, dirs: ['/office'], launch: ['/office/Plan.dxf'] });
    await c.page.waitForSelector('dialog.cc-ask[open]', { timeout: 30000 });
    const d = await dialog(c.page);
    ok(d && /stale/.test(d.text) && /Ben Ito/.test(d.text) && /20 minutes/.test(d.text), 'a lock not refreshed for 20 minutes is said to be stale', d?.text);
    await c.page.click('dialog.cc-ask[open] button[data-key="cancel"]');
    await c.ctx.close();
  }
  // ---- a folder the shell was never given (the real shell's rule for a drawing opened on its own)
  {
    const { ctx, page } = await open({ disk: { '/office/Plan.dxf': DXF, '/office/Other.dwg.cclock': lockOf('Ben Ito', 'ben', 1000) }, dirs: [], launch: ['/office/Plan.dxf'] });
    await page.waitForFunction(() => window.cadcraft.doc.count() === 1, null, { timeout: 30000 }); await sleep(300);
    ok((await lock(page)) === null && /Studio cannot note that this drawing is open/.test(await history(page)), 'no folder access: the drawing opens, no lock can be written, and the app says so');
    await typeCmd(page, 'WHOHAS'); await typeCmd(page, 'FO'); await sleep(500);
    const h = await history(page);
    ok(/Other\.dwg: open by Ben Ito/.test(h), 'WHOHAS FOlder (the folder chosen): lists who has what', h.slice(-400));
    ok(!!(await lock(page)), 'and the open drawing now has its lock');
    await ctx.close();
  }
  ok(problems.length === 0, 'no console errors', problems.slice(0, 5).join(' | '));
} catch (err) {
  fail++; console.log('  FAIL the run threw: ' + (err?.stack || err));
} finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

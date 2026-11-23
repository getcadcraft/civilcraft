// SPDX-License-Identifier: Apache-2.0
// SuperCad Studio on the desktop (owner 2026-11-21): a double-clicked .ccproject / .supercad opens in the page, and Save writes back to the file on disk. The real page
// (lab build) with a stand-in window.cadcraftDesktop (the shell's bridge: launchFiles, onOpenFiles, readFile, writeFile, saveDialog) backed by an in-page disk.
//   node tools/super-test/desktop-open.mjs
process.env.SUPER_TEST_FORMATS = '1';   // the real default: Save writes the .supercad
import path from 'node:path'; import { pathToFileURL } from 'node:url';
const { start, launch } = await import('./serve.mjs');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const P = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/apps/supercadcraft/dev/super-project.js')));
const { url, close } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch({ width: 1500, height: 950 });
const enc = s => new TextEncoder().encode(s);
const seed = P.newProject('Tower');
P.addMember(seed, { app: 'cadcraft', name: 'plan.dxf', bytes: enc('0\nSECTION\n2\nENTITIES\n0\nLINE\n8\n0\n10\n0\n20\n0\n11\n10\n21\n5\n0\nENDSEC\n0\nEOF\n') });
const seedBytes = Array.from(P.toBytes(seed, {}));

// the stand-in shell: a disk in the page, the launch list, and a log of what the page did with it
const shell = (disk, launchList) => `(() => {
  const disk = new Map(${JSON.stringify(Object.entries(disk))}.map(([k, v]) => [k, new Uint8Array(v)]));
  let onOpen = null; window.__disk = disk; window.__writes = []; window.__dialogs = 0; window.__fire = p => onOpen && onOpen(p);
  window.cadcraftDesktop = { info: () => ({ shell: 'test', app: 'supercadcraft' }),
    readFile: async p => { if (!disk.has(p)) throw new Error('no file'); return disk.get(p); },
    writeFile: async (p, b) => { disk.set(p, new Uint8Array(b)); window.__writes.push(p); },
    launchFiles: async () => ${JSON.stringify(launchList)}, onOpenFiles: cb => { onOpen = cb; },
    saveDialog: async () => { window.__dialogs++; return 'C:\\\\Jobs\\\\New one.supercad'; } };
})();`;
const errors = [];
async function boot(disk, launchList) {
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 } }); await ctx.addInitScript(shell(disk, launchList));
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(String(e.message)));
  page.on('download', d => errors.push('a download on the desktop: ' + d.suggestedFilename()));
  await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  return { ctx, page };
}
const status = page => page.evaluate(() => document.querySelector('.sc-status')?.textContent || '');
const until = (page, re, ms = 60000) => page.waitForFunction(s => new RegExp(s).test(document.querySelector('.sc-status')?.textContent || ''), re.source, { timeout: ms }).then(() => true, () => false);

// 1. started with a .ccproject (a double-click): it opens
const A = await boot({ 'C:\\Jobs\\Tower.ccproject': seedBytes }, ['C:\\Jobs\\Tower.ccproject']);
ok(await until(A.page, /Opened Tower/), 'started with a double-clicked .ccproject: the project opens: ' + await status(A.page));
ok(await A.page.evaluate(() => window.superWindow.project.members.some(m => m.name === 'plan.dxf')), 'with its member');
// 2. Save: the .supercad is written beside it (the default format), no download, no dialog
await A.page.evaluate(() => window.superWindow.saveProject()); await until(A.page, /Saved Tower\.supercad/);
const w1 = await A.page.evaluate(() => ({ writes: window.__writes, dialogs: window.__dialogs, sc: window.__disk.has('C:\\Jobs\\Tower.supercad') ? Array.from(window.__disk.get('C:\\Jobs\\Tower.supercad')) : null }));
ok(w1.writes.length === 1 && w1.writes[0] === 'C:\\Jobs\\Tower.supercad' && w1.dialogs === 0, 'Save wrote Tower.supercad next to the file it came from, without asking: ' + JSON.stringify(w1.writes));
ok(/Written to C:\\Jobs\\Tower\.supercad/.test(await status(A.page)), 'the status line says where: ' + await status(A.page));
ok(w1.sc && String.fromCharCode(...w1.sc.slice(0, 15)) === 'SQLite format 3', 'the file is a SQLite .supercad');
// 3. a second Save goes to the same file
await A.page.evaluate(() => window.superWindow.saveProject()); await A.page.waitForTimeout(800);
ok((await A.page.evaluate(() => window.__writes)).filter(p => p === 'C:\\Jobs\\Tower.supercad').length === 2, 'the next Save writes the same file again');
await A.ctx.close();

// 4. another start, double-clicking that .supercad: it opens; then a double-click on the .ccproject while it runs opens that one
const B = await boot({ 'C:\\Jobs\\Tower.supercad': w1.sc, 'C:\\Jobs\\Tower.ccproject': seedBytes }, ['C:\\Jobs\\Tower.supercad']);
ok(await until(B.page, /Opened Tower/), 'started with a double-clicked .supercad: the project opens: ' + await status(B.page));
ok(await B.page.evaluate(() => window.superWindow.project.members.some(m => m.name === 'plan.dxf')), 'the .supercad holds the member');
await B.page.evaluate(() => window.superWindow.saveProject()); await B.page.waitForTimeout(1500);
ok((await B.page.evaluate(() => window.__writes))[0] === 'C:\\Jobs\\Tower.supercad', 'Save writes back to that .supercad');
// 5. a new project: the first Save asks where (the system's Save dialog), then keeps that file
await B.page.evaluate(() => window.superWindow.newProject ? window.superWindow.newProject('New one') : null);
const hasNew = await B.page.evaluate(() => typeof window.superWindow.newProject === 'function');
if (hasNew) {
  await B.page.evaluate(() => window.superWindow.saveProject()); await B.page.waitForTimeout(1500);
  ok(await B.page.evaluate(() => window.__dialogs) === 1 && (await B.page.evaluate(() => window.__writes)).includes('C:\\Jobs\\New one.supercad'), 'a new project asks once where to save, then writes there');
}
await B.ctx.close();
ok(errors.length === 0, 'no page errors and no downloads on the desktop: ' + errors.slice(0, 3).join(' | '));
await browser.close(); close();
console.log(`desktop open: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);

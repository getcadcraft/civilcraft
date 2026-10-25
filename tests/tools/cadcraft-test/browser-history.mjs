#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-history.mjs — CadCraft 0.7 session studio-07, D7.31, in the real page (/lab/cadcraft): the History panel with a stand-in
 * desktop bridge (files in memory, a made-up cloud answering sync/versions and sync/open).
 *   copies kept on this computer: the file as opened, then one for each save; the panel lists them, opens one in a tab of its own,
 *   restores one (the drawing as it is now is kept first), compares: counts, the list of changes, the colours on the drawing;
 *   the cloud's versions of a drawing opened from there (versions, bytes, SHA-256 checked); a browser has no History.
 *
 *   node tools/cadcraft-test/browser-history.mjs [--shots <dir>]
 *
 * Run as root (a session for the test admin cctest+cadcraft@projectz.xyz is minted by tools/cadcraft-test/admin.php, disabled at the end).
 */
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
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
const HOUSE = fs.readFileSync(path.join(REPO, 'fixtures/showcase/cadcraft-sample-house.dwg'));
const UUID = '0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];

async function start({ desktop, cloud }) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  if (desktop) await page.addInitScript(({ house, cloudInit }) => {
    const files = new Map([['/jobs/house.dwg', Uint8Array.from(atob(house), (c) => c.charCodeAt(0))]]);
    window.__files = files;
    window.__cloudCalls = [];
    window.cadcraftDesktop = {
      version: 1,
      openDialog: async () => null, saveDialog: async () => null,
      readFile: async (p) => { if (!files.has(p)) throw new Error('not_found: ' + p); return files.get(p).slice(); },
      writeFile: async (p, b) => { files.set(p, Uint8Array.from(b)); },
      stat: async (p) => (files.has(p) ? { size: files.get(p).length, mtime: 0 } : null),
      launchFiles: async () => [], onOpenFiles: (cb) => { window.__deskOpen = cb; },
      ...(cloudInit ? { cloud: { request: async (o) => {
        window.__cloudCalls.push(o.path);
        const mk = (status, headers, body, json) => ({ status, headers, body: body || new Uint8Array(), json: () => json });
        if (o.path.startsWith('/api/v1/sync/versions')) return mk(200, {}, null, { data: { versions: cloudInit.versions } });
        const v = /version=(\d+)/.exec(o.path)?.[1];
        const b64 = cloudInit.files[v];
        if (!b64) return mk(404, {}, null, { code: 'not_found' });
        return mk(200, { 'x-cadcraft-sha256': cloudInit.sha[v] }, Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)), {});
      } } } : {}),
    };
  }, { house: HOUSE.toString('base64'), cloudInit: cloud || null });
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  return { ctx, page };
}
const cmd = (page, text) => page.evaluate((t) => { window.cadcraft.engine.text(t); }, text);
const settle = (page, ms = 500) => page.waitForTimeout(ms);
const count = (page) => page.evaluate(() => window.cadcraft.doc.count());
const rows = (page) => page.evaluate(() => [...document.querySelectorAll('.cc-hist-row')].map((r) => ({ label: r.querySelector('strong').textContent, text: r.querySelector('.cc-hist-what').textContent })));
const markPixels = (page) => page.evaluate(() => {
  const c = window.cadcraft.view.over, g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data;
  let green = 0, red = 0, orange = 0;
  for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; const [r, gg, b] = [d[i], d[i + 1], d[i + 2]]; if (gg > 120 && r < 60 && b < 110) green++; else if (r > 190 && gg < 80 && b < 70) red++; else if (r > 200 && gg > 110 && gg < 160 && b < 30) orange++; }
  return { green, red, orange };
});

try {
  console.log('\n== a browser has no History to show');
  {
    const { ctx, page } = await start({ desktop: false });
    await cmd(page, 'HISTORY');
    await page.waitForSelector('dialog.cc-hist[open]');
    const txt = await page.evaluate(() => document.querySelector('dialog.cc-hist').textContent);
    ok(/CadCraft Studio/.test(txt) && !(await page.$('.cc-hist-row')), 'in a browser it says what History needs and lists nothing', txt.slice(0, 120));
    await page.click('[data-hist-close]');
    await ctx.close();
  }

  console.log('\n== Studio: copies kept on this computer');
  const cloud = {
    versions: [
      { no: 3, size_bytes: 1000, sha256: 'x', saved_at: '2026-10-22T12:00:00Z', saved_by: 'Dana', note: 'moved the kitchen', source: 'desktop-app' },
      { no: 1, size_bytes: 900, sha256: 'y', saved_at: '2026-10-20T09:30:00Z', saved_by: 'Ann', note: '', source: 'web' } ],
    files: { 1: HOUSE.toString('base64') }, sha: { 1: crypto.createHash('sha256').update(HOUSE).digest('hex') },
  };
  const { ctx, page } = await start({ desktop: true, cloud });
  await page.evaluate(() => window.__deskOpen(['/jobs/house.dwg']));
  await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'house.dwg' && window.cadcraft.doc.count() > 20, null, { timeout: 30000 });
  const n0 = await count(page);
  await settle(page, 800);
  await cmd(page, 'HISTORY');
  await page.waitForSelector('.cc-hist-row');
  let r = await rows(page);
  ok(r.length === 1 && r[0].label === 'As opened', 'the file as opened is the first copy', JSON.stringify(r));
  await page.click('[data-hist-close]');
  // edit and save: one added line, one erased wall
  await page.evaluate(() => {
    const c = window.cadcraft, d = c.doc, all = d.all(), victim = all.find((e) => e.type === 'line');
    d.change('edit', () => { d.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 5000, y2: 5000 }); d.remove(victim.id); const m = all.filter((e) => e.type === 'line' && e.id !== victim.id)[3]; d.update(m.id, { ...m, x2: m.x2 + 1000 }); });
  });
  await cmd(page, 'SAVE');
  await page.waitForFunction(() => !window.cadcraft.doc.dirty, null, { timeout: 30000 });
  await settle(page, 1000);
  await page.evaluate(() => { const d = window.cadcraft.doc; d.change('edit2', () => d.add({ type: 'circle', layer: '0', cx: 9000, cy: 9000, r: 400 })); });
  await cmd(page, 'SAVE');
  await page.waitForFunction(() => !window.cadcraft.doc.dirty, null, { timeout: 30000 });
  await settle(page, 1000);
  await cmd(page, 'HISTORY');
  await page.waitForFunction(() => document.querySelectorAll('.cc-hist-row').length >= 3, null, { timeout: 10000 });
  r = await rows(page);
  ok(r.length === 3 && r[0].label === 'Saved here' && r[2].label === 'As opened', 'each save keeps a copy: newest first, the opened one last', JSON.stringify(r.map((x) => x.label)));
  ok((await page.evaluate(() => window.__files.get('/jobs/house.dwg').length)) > 1000, 'the saves really wrote the file through the bridge');
  // compare the opened copy with the drawing as it is now
  await page.click('.cc-hist-row:last-child [data-act="compare"]');
  await page.waitForSelector('.cc-hist-result', { timeout: 30000 });
  const res = await page.evaluate(() => ({ counts: document.querySelector('.cc-hist-result .cc-note').textContent, items: [...document.querySelectorAll('.cc-hist-item')].map((b) => b.textContent), legend: document.querySelector('.cc-hist-legend').textContent }));
  ok(/2 added, 1 removed, 1 changed/.test(res.counts), 'compare: the two additions, the erased line and the lengthened line are found', res.counts);
  ok(res.items.some((x) => /Added.*line/.test(x)) && res.items.some((x) => /Added.*circle/.test(x)) && res.items.some((x) => /Removed.*line/.test(x)) && res.items.some((x) => /Changed.*line.*(shape|moved)/.test(x)), 'the list says which', JSON.stringify(res.items.slice(0, 5)));
  await page.evaluate(() => window.cadcraft.view.fit());
  await settle(page, 400);
  const px = await markPixels(page);
  ok(px.green > 20 && px.red > 20 && px.orange > 20, 'the drawing shows added in green, removed in red, changed in orange', JSON.stringify(px));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'history-compare.png') });
  await page.uncheck('.cc-hist-show input');
  await settle(page, 300);
  ok((await markPixels(page)).green === 0, 'Show on the drawing off clears the colours');
  await page.check('.cc-hist-show input');
  await page.click('.cc-hist-result .btn-line');
  await settle(page, 300);
  ok(!(await page.$('.cc-hist-result')) && (await markPixels(page)).red === 0, 'Clear the colours takes the result away');
  // compare two copies
  await page.selectOption('#cc-hist-against', { index: 2 });
  await page.click('.cc-hist-row:nth-child(1) [data-act="compare"]');
  await page.waitForSelector('.cc-hist-result');
  const two = await page.evaluate(() => document.querySelector('.cc-hist-result .cc-note').textContent);
  ok(/1 added/.test(two) && !/removed, [1-9]/.test(two), 'two copies against each other: the older is the "from"', two);
  // open a copy in its own tab
  const tabsBefore = await page.evaluate(() => window.cadcraft.tabs?.list?.length ?? document.querySelectorAll('[role="tab"]').length);
  await page.click('.cc-hist-row:last-child [data-act="open"]');
  await page.waitForFunction((n) => document.querySelectorAll('.cc-doctabs [role="tab"], [data-doctabs] [role="tab"]').length > n || window.cadcraft.doc.meta.source?.includes('As opened') || /\(\d/.test(window.cadcraft.doc.meta.name || ''), tabsBefore, { timeout: 20000 }).catch(() => {});
  await page.waitForFunction(() => /^house \(/.test(window.cadcraft.doc.meta.name || ''), null, { timeout: 20000 }).catch(() => {});
  const opened = await page.evaluate(() => ({ name: window.cadcraft.doc.meta.name, n: window.cadcraft.doc.count() }));
  ok(opened.n === n0 && /^house \(/.test(opened.name), 'Open puts that copy in a tab of its own', JSON.stringify({ ...opened, n0 }));
  await page.evaluate(() => { document.querySelector('dialog.cc-hist [data-hist-close]')?.click(); });
  await ctx.close();

  console.log('\n== Studio: restore, and the cloud\'s versions');
  {
    const c2 = await start({ desktop: true, cloud });
    const { page: p2 } = c2;
    await p2.evaluate(() => window.__deskOpen(['/jobs/house.dwg']));
    await p2.waitForFunction(() => window.cadcraft.doc.meta.source === 'house.dwg' && window.cadcraft.doc.count() > 20, null, { timeout: 30000 });
    await settle(p2, 800);
    await p2.evaluate(() => { const d = window.cadcraft.doc; d.change('e', () => { for (const e of d.all().filter((x) => x.type === 'line').slice(0, 3)) d.remove(e.id); }); });
    const n1 = await count(p2);
    await cmd(p2, 'SAVE');
    await p2.waitForFunction(() => !window.cadcraft.doc.dirty, null, { timeout: 30000 });
    await settle(p2, 800);
    await cmd(p2, 'HISTORY');
    await p2.waitForFunction(() => document.querySelectorAll('.cc-hist-row').length >= 2);
    await p2.click('.cc-hist-row:last-child [data-act="restore"]');
    await p2.waitForSelector('dialog.cc-ask[open] [data-key="ok"]');
    ok(/History first/.test(await p2.evaluate(() => document.querySelector('dialog.cc-ask .cc-ask-text').textContent)), 'Restore asks first, and says a copy of the drawing as it is now is kept');
    await p2.click('dialog.cc-ask [data-key="ok"]');
    await p2.waitForFunction((n) => window.cadcraft.doc.count() > n, n1, { timeout: 30000 });
    ok((await count(p2)) === n0 && await p2.evaluate(() => window.cadcraft.doc.dirty && window.cadcraft.doc.meta.name === 'house'), 'the drawing is the opened copy again, unsaved, same name', String(await count(p2)));
    await p2.waitForFunction(() => [...document.querySelectorAll('.cc-hist-row')].some((x) => /Before a restore/.test(x.textContent)), null, { timeout: 10000 });
    ok(true, 'the drawing as it was before the restore is in History');
    await p2.evaluate(() => { document.querySelector('dialog.cc-hist [data-hist-close]')?.click(); });
    // a drawing opened from the cloud
    await p2.evaluate((u) => { window.cadcraft.doc.meta.cloud = { drawing: u, version: 3 }; }, UUID);
    await cmd(p2, 'HISTORY');
    await p2.waitForSelector('.cc-hist-tabs');
    ok((await p2.evaluate(() => [...document.querySelectorAll('.cc-hist-tab')].map((x) => x.textContent.trim()))).join('|').includes('In the cloud (2)'), 'a drawing from the cloud gets a "In the cloud" list beside "On this computer"');
    await p2.check('input[name="cc-hist-src"][value="cloud"]');
    await p2.waitForFunction(() => [...document.querySelectorAll('.cc-hist-row strong')].some((x) => x.textContent === 'Version 3'));
    const cr = await rows(p2);
    ok(cr.length === 2 && /Dana/.test(cr[0].text) && /moved the kitchen/.test(cr[0].text) && cr[1].label === 'Version 1', 'cloud versions: number, who, note', JSON.stringify(cr));
    ok((await p2.evaluate(() => window.__cloudCalls)).some((x) => x.includes('/api/v1/sync/versions?drawing=' + UUID)), 'the versions came from the sync API with the drawing\'s id');
    await p2.click('.cc-hist-row:last-child [data-act="compare"]');
    await p2.waitForSelector('.cc-hist-result', { timeout: 30000 });
    const cc = await p2.evaluate(() => document.querySelector('.cc-hist-result .cc-note').textContent);
    ok(/Nothing is different|added|removed|changed/.test(cc) && (await p2.evaluate(() => window.__cloudCalls)).some((x) => x.includes('version=1')), 'a cloud version compares with the drawing: its bytes are fetched and read', cc);
    await p2.click('.cc-hist-row:first-child [data-act="open"]');
    await p2.waitForSelector('.cc-hist-error');
    ok(/could not be opened/.test(await p2.evaluate(() => document.querySelector('.cc-hist-error').textContent)), 'a version the server cannot give says so, nothing else changes');
    if (SHOTS) await p2.screenshot({ path: path.join(SHOTS, 'history-cloud.png') });
    await c2.ctx.close();
  }
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
const bad = problems.filter((p) => !/favicon|404/.test(p));
if (bad.length) console.log('page problems:\n  ' + [...new Set(bad)].slice(0, 8).join('\n  '));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

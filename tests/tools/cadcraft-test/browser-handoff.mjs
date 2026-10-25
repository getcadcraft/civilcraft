#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-handoff.mjs — BimCraft's "Edit in CadCraft" in the lab, headless (handoff.js in both apps).
 *
 *   node tools/cadcraft-test/browser-handoff.mjs [--shots <dir>] [--file <drawing.dwg|.dxf>]
 *
 * Run as root (it calls `sudo -u www-data php tools/cadcraft-test/admin.php up|down` for the test admin
 * cctest+cadcraft@projectz.xyz, disabled again at the end). Uses the cached Playwright Chromium.
 * Checks: a drawing opened in /lab/bimcraft shows "Edit in CadCraft"; clicking it opens /lab/cadcraft in a new
 * tab that receives the same file (name, object count > 0, the ?handoff= id gone from the address), the stored
 * copy is gone afterwards (reloading finds nothing and says so), a stale id is refused politely, an IFC model
 * has no such button, and the try area only offers it when its CadCraft build accepts handoffs; no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots'), fi = args.indexOf('--file');
const SHOTS = si >= 0 ? args[si + 1] : null;
const DRAWING = fi >= 0 ? path.resolve(args[fi + 1]) : path.join(REPO, 'fixtures/dwg/kitchen-equipment.dwg');   // the public fixture (fixtures/README.md)
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

// BimCraft opens drawings in 3D by default (Settings › BimCraft › Drawings open in); these checks are written for the 2D view,
// so every page starts with "2D" unless the test itself sets bimcraft.settings.dwgStart.
{
  const pin2d = () => { try { const k = 'bimcraft.settings', v = JSON.parse(localStorage.getItem(k) || '{}') || {}; if (!v.dwgStart) { v.dwgStart = '2d'; localStorage.setItem(k, JSON.stringify(v)); } } catch { /* another origin */ } };
  const nc = browser.newContext.bind(browser), np = browser.newPage.bind(browser);
  browser.newContext = async (...a) => { const c = await nc(...a); await c.addInitScript(pin2d); return c; };
  browser.newPage = async (...a) => { const p = await np(...a); await p.addInitScript(pin2d); return p; };
}
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const problems = [];
const watch = (p, label) => {
  p.on('console', (m) => { if (m.type() === 'error') problems.push(label + ' console: ' + m.text()); });
  p.on('pageerror', (e) => problems.push(label + ' pageerror: ' + e.message));
};
const page = await ctx.newPage();
watch(page, 'bimcraft');

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);

  console.log('\n== BimCraft: open a drawing');
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  ok(await page.getAttribute('[data-bimcraft]', 'data-edit-url') === '/lab/cadcraft', 'the lab page names CadCraft in the lab as the editor');
  await page.setInputFiles('[data-file]', DRAWING);
  await page.waitForSelector('[data-edit-drawing]', { timeout: 60000 });
  const label = (await page.textContent('[data-edit-drawing]')).trim();
  ok(label === 'Edit in CadCraft', 'the 2D toolbar has "Edit in CadCraft"', label);
  ok(!/\bnull\b/.test(await page.textContent('[data-sheet-tabs]')), 'the sheet toolbar has no stray "null" (a drawing without equipment)');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '01-bimcraft-drawing.png') });

  console.log('\n== hand it over');
  const asked = [];   // CadCraft drops ?handoff= from the address at once, so check the page request itself
  ctx.on('request', (r) => { if (r.resourceType() === 'document' && r.url().includes('/lab/cadcraft')) asked.push(r.url()); });
  const [tab] = await Promise.all([ctx.waitForEvent('page'), page.click('[data-edit-drawing]')]);
  watch(tab, 'cadcraft');
  await tab.waitForLoadState('domcontentloaded');
  ok(asked.some((u) => /\/lab\/cadcraft\?handoff=[0-9a-f-]{36}$/.test(u)), 'a new tab opens CadCraft with a handoff id', asked.join(' '));
  await tab.waitForFunction(() => window.cadcraft && window.cadcraft.doc.count() > 0, null, { timeout: 90000 });
  const got = await tab.evaluate(() => ({ source: window.cadcraft.doc.meta.source, n: window.cadcraft.doc.count(), url: location.href, log: document.querySelector('[data-log]')?.textContent || document.body.innerText }));
  ok(got.source === path.basename(DRAWING), 'CadCraft opened the same file', got.source);
  ok(got.n > 0, 'with its objects (' + got.n + ')');
  ok(!got.url.includes('handoff='), 'the handoff id is gone from the address', got.url);
  ok(/Received /.test(got.log), 'the command line says the drawing was received');
  ok(/in CadCraft in a new tab/.test(await page.textContent('[data-status]')), 'BimCraft says where the drawing went');
  if (SHOTS) await tab.screenshot({ path: path.join(SHOTS, '02-cadcraft-received.png') });

  console.log('\n== edit it in CadCraft');
  const before = got.n;
  await tab.evaluate(() => { const { doc } = window.cadcraft; doc.change('test line', () => doc.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 100, y2: 100 })); });
  ok(await tab.evaluate(() => window.cadcraft.doc.count()) === before + 1 && await tab.evaluate(() => window.cadcraft.doc.dirty), 'the drawing takes an edit and is marked changed');
  await tab.evaluate(() => window.cadcraft.doc.markSaved());   // let the tab close without the leave prompt
  await tab.close();

  console.log('\n== a used or stale id');
  const left = await page.evaluate(() => new Promise((res) => { const r = indexedDB.open('cadcraft-handoff', 1); r.onsuccess = () => { const db = r.result; const q = db.transaction('files').objectStore('files').count(); q.onsuccess = () => { db.close(); res(q.result); }; }; r.onerror = () => res(-1); }));
  ok(left === 0, 'nothing is left in the browser\'s storage after the handoff', String(left));
  const stale = await ctx.newPage();
  watch(stale, 'stale');
  await stale.goto(BASE + '/lab/cadcraft?handoff=00000000-0000-4000-8000-000000000000', { waitUntil: 'networkidle' });
  await stale.waitForFunction(() => /did not arrive/.test(document.body.innerText), null, { timeout: 15000 });
  ok(await stale.evaluate(() => window.cadcraft.doc.count()) === 0, 'an unknown id opens an empty drawing and says the file did not arrive');
  await stale.close();

  console.log('\n== where the button is not offered');
  const ifc = path.join(REPO, 'fixtures/folder/Cad/Shell export.ifc');   // the public fixture's minimal IFC4
  if (fs.existsSync(ifc)) {
    await page.setInputFiles('[data-file]', ifc);
    await page.waitForSelector('[data-canvas-wrap]:not([hidden])', { timeout: 90000 });
    ok(!(await page.isVisible('[data-edit-drawing]')), 'an IFC model has no "Edit in CadCraft"');
  }
  const tryPage = await ctx.newPage();
  await tryPage.goto(BASE + '/use/bimcraft', { waitUntil: 'domcontentloaded' });
  const tryUrl = await tryPage.getAttribute('[data-bimcraft]', 'data-edit-url');
  const tryAccepts = JSON.parse(fs.readFileSync(path.join(REPO, 'public_html/assets/apps/cadcraft/current/manifest.json'), 'utf8')).accepts?.includes('handoff');
  ok(tryAccepts ? tryUrl === '/use/cadcraft' : tryUrl === null, 'the try area offers it only when its CadCraft release accepts handoffs (' + (tryAccepts ? 'it does' : 'not yet') + ')', String(tryUrl));
  await tryPage.close();

  // CadCraft "Open in 3D" (0.4 part 2): offered only when ModelCraft here accepts a handoff; then it opens ModelCraft
  // in a new tab with the drawing as a DWG waiting in the shared store
  console.log('\n== CadCraft: Open in 3D (ModelCraft)');
  const mcAccepts = JSON.parse(fs.readFileSync(path.join(REPO, 'public_html/assets/apps/modelcraft/dev/manifest.json'), 'utf8')).accepts?.includes('handoff');
  const cc = await ctx.newPage();
  await cc.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  const offered = await cc.getAttribute('[data-cadcraft]', 'data-open3d-url');
  ok(mcAccepts ? offered === '/lab/modelcraft' : offered === null && !(await cc.$('[data-cmd="OPENIN3D"]')), 'the lab offers Open in 3D only when its ModelCraft build accepts handoffs (' + (mcAccepts ? 'it does' : 'not yet') + ')', String(offered));
  if (!mcAccepts) {
    // the sender itself, with the attribute put in as the server will once ModelCraft takes handoffs
    await cc.route('**/lab/cadcraft', async (route) => { const r = await route.fetch(); await route.fulfill({ response: r, body: (await r.text()).replace('data-cadcraft', 'data-cadcraft data-open3d-url="/lab/modelcraft" data-open3d-app="ModelCraft"') }); });
    await cc.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  }
  await cc.waitForFunction(() => !!window.cadcraft);
  await cc.evaluate(() => { const { doc } = window.cadcraft; doc.change('x', () => { doc.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 100, y2: 0 }); doc.add({ type: 'circle', layer: '0', cx: 50, cy: 0, r: 20 }); }); });
  const [mc] = await Promise.all([ctx.waitForEvent('page', { timeout: 15000 }), cc.evaluate(() => window.cadcraft.engine.run('OPENIN3D'))]);
  const firstUrl = mc.url();   // ModelCraft strips ?handoff as soon as it takes the file
  await mc.waitForLoadState('domcontentloaded');
  const hid = new URL(firstUrl).searchParams.get('handoff') || new URL(mc.url()).searchParams.get('handoff');
  ok(/^\/lab\/modelcraft$/.test(new URL(mc.url()).pathname) && (mcAccepts || /^[0-9a-f-]{36}$/.test(hid || '')), 'it opens /lab/modelcraft?handoff=<id> in a new tab', firstUrl);
  if (mcAccepts) {
    // the receiving end (ModelCraft W2.3): the DWG comes in as a site plan, and the id leaves the address
    await mc.waitForFunction(() => window.modelcraft?.model.root.insts.size > 0 || !!document.querySelector('dialog[open] button[data-key="m"]'), null, { timeout: 30000 }).catch(() => {});
    if (await mc.$('dialog[open] button[data-key="m"]')) await mc.click('dialog[open] button[data-key="m"]');   // a drawing without units: ModelCraft asks
    await mc.waitForFunction(() => window.modelcraft?.model.root.insts.size > 0, null, { timeout: 10000 }).catch(() => {});
    const got = await mc.evaluate(() => { const m = window.modelcraft?.model; const i = m && [...m.root.insts.values()][0]; return { edges: i ? m.def(i.def).edges.size : 0, search: location.search }; });
    ok(got.edges >= 2 && !/handoff/.test(got.search), 'ModelCraft takes the drawing: a site plan group with its line and circle (' + got.edges + ' edges)', JSON.stringify(got));
  }
  const stored = mcAccepts ? null : await cc.evaluate((id) => new Promise((res) => {
    const rq = indexedDB.open('cadcraft-handoff');
    rq.onsuccess = () => { const g = rq.result.transaction('files').objectStore('files').get(id); g.onsuccess = async () => { const v = g.result; if (!v) return res(null); const b = new Uint8Array(await v.file.arrayBuffer()); res({ name: v.file.name, from: v.from, tag: String.fromCharCode(...b.subarray(0, 4)), size: b.length }); }; g.onerror = () => res(null); };
    rq.onerror = () => res(null);
  }), hid);
  ok(mcAccepts || (stored && stored.name === 'Drawing1.dwg' && stored.from === 'cadcraft' && stored.tag === 'AC10' && stored.size > 1000), 'the drawing waits in the store as a DWG from CadCraft', JSON.stringify(stored));
  ok((await cc.textContent('[data-history]')).includes('ModelCraft'), 'the command line says where it went');
  await mc.close(); await cc.close();

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

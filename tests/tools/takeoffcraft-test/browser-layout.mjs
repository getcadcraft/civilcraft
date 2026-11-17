#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-layout.mjs — booklet row BK.149 in the real TakeoffCraft page, /lab, headless (session bk-r3-schedules-10): the Default
 * Policies add-on hosted in TakeoffCraft, the office's schedule layout set with the real Settings controls, and the Quantities
 * tables, the export and the tools taking it. The policies are the same store BimCraft reads.
 *   nice -n 10 timeout 600 node tools/takeoffcraft-test/browser-layout.mjs [--shots <dir>]      run as root (a test admin session)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (...a) => execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/takeoffcraft-test/admin.php'), ...a], { encoding: 'utf8' });
const S = JSON.parse(admin('session', 'main'));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  const throttled = new Set();
  page.on('response', (r) => { if (r.status() === 429) throttled.add(r.url()); });
  await ctx.addCookies([{ name: S.name, value: S.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto('https://getcadcraft.com/lab/takeoffcraft?space=paper');
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 30000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  const T = (fn, a) => page.evaluate(fn, a);

  const ID = 'default-policies', KEY = 'cc-default-policies';
  const row = () => T((id) => { const a = window.ccAddons?.list().find((x) => x.id === id); return a ? { state: a.state, source: a.source } : null; }, ID);
  await page.waitForFunction((id) => !!window.ccAddons?.list().find((x) => x.id === id), ID, { timeout: 20000 });
  ok((await row()).state === 'off' && (await row()).source === 'bundled', 'Default Policies is listed in TakeoffCraft and is off until switched on', await row());
  await page.setInputFiles('[data-file-pdf]', path.join(ROOT, 'fixtures/pdf/kitchen-plan-sheet.pdf'));
  await page.waitForFunction(() => window.takeoffcraft.sheets().length > 0 && !!window.takeoffcraft.sheet(), null, { timeout: 30000 });
  await page.waitForTimeout(400);
  const made = await T(() => {
    const tc = window.takeoffcraft, m = tc.model, sheet = tc.sheet();
    m.addItems([{ name: 'Doors', type: 'count', unit: 'EA', mat: 2500000, lab: 800000 }, { name: 'Permit', type: 'fixed', unit: 'EA', qty: 1, mat: 5000000 }, { name: 'Sinks', type: 'count', unit: 'EA', mat: 900000 }]);
    const [d, , s] = m.state.items.slice(-3);
    for (let i = 0; i < 4; i++) m.addMark({ item: d.id, sheet, pts: [{ x: 100 + 40 * i, y: 100 }] });
    for (let i = 0; i < 2; i++) m.addMark({ item: s.id, sheet, pts: [{ x: 100 + 40 * i, y: 200 }] });
    return { total: tc.estimate().total, permit: m.state.items.slice(-2)[0] };
  });
  await page.waitForTimeout(300);
  if (await page.evaluate(() => document.querySelector('[data-qty-table]')?.getBoundingClientRect().height === 0)) { await page.click('[data-qty-toggle]'); await page.waitForTimeout(300); }
  const table = () => T(() => ({ head: [...document.querySelectorAll('[data-qty-table] thead th')].map((x) => x.textContent), rows: [...document.querySelectorAll('[data-qty-table] tbody tr')].map((tr) => (tr.dataset.layGroup !== undefined ? 'G:' : tr.dataset.laySubtotal !== undefined ? 'S:' : '') + tr.cells[0].textContent.trim() + (tr.dataset.laySubtotal !== undefined ? '|' + tr.cells[tr.cells.length - 1].textContent : '')),
    foot: [...document.querySelectorAll('[data-qty-table] tfoot td')].map((x) => x.textContent), title: document.querySelector('[data-qty-title]')?.textContent || '', std: document.querySelector('[data-qty-standard]')?.dataset.qtyStandard || '' }));
  let Q = await table();
  // Doors 4 x 330 = 1320; Permit 500 (typed; 0 if the typed quantity did not take); Sinks 2 x 90 = 180
  ok(Q.rows.join() === 'Doors,Permit,Sinks' && Q.head[0] === 'Item' && Q.std === '' && Q.title === '', 'the add-on off: Quantities › By item as it always was', Q);
  const plain = Q, total0 = made.total;

  console.log('== the add-on on; the office standard set with the real Settings controls');
  await T((id) => { localStorage.setItem('cc-addons:takeoffcraft', JSON.stringify({ off: {}, on: { [id]: true } })); }, ID);
  const keep = await T(() => JSON.stringify(window.takeoffcraft.model.toJSON()));
  await page.reload();
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 30000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  await page.waitForFunction((id) => window.ccAddons?.list().find((x) => x.id === id)?.state === 'active', ID, { timeout: 20000 });
  ok(true, 'switched on: the add-on is active in TakeoffCraft');
  await page.setInputFiles('[data-file-pdf]', path.join(ROOT, 'fixtures/pdf/kitchen-plan-sheet.pdf'));
  await page.waitForFunction(() => window.takeoffcraft.sheets().length > 0, null, { timeout: 30000 });
  await T((json) => window.takeoffcraft.model.load(JSON.parse(json)), keep);
  await page.waitForTimeout(400);
  if (await page.evaluate(() => document.querySelector('[data-qty-table]')?.getBoundingClientRect().height === 0)) { await page.click('[data-qty-toggle]'); await page.waitForTimeout(300); }
  Q = await table();
  ok(Q.rows.join() === plain.rows.join() && Q.std === '', 'on, with no policy set: nothing changes');
  await page.click('[data-settings-open]'); await page.waitForSelector('dialog[data-app-settings][open]');
  const tab = await page.$('dialog[data-app-settings] [data-settings-tab="general"]'); if (tab) await tab.click();
  await page.click('dialog[data-app-settings] .shell-sec-nav button:text-is("Default Policies") >> visible=true').catch(() => {});
  const secs = await T(() => ({ global: !!document.querySelector('[data-dp-global]'), app: !!document.querySelector('[data-dp-app]'), group: !!document.querySelector('[data-dp-global] [data-dp-group="schedules"]'), ids: [...document.querySelectorAll('[data-dp-global] [data-dp^="all.schedule."]')].map((n) => n.getAttribute('data-dp')) }));
  ok(secs.global && !secs.app && secs.group && secs.ids.join() === 'all.schedule.group,all.schedule.totals,all.schedule.title,all.schedule.headings', 'Settings › Global › Default Policies has "Schedule layout (the office standard)" with its four policies; TakeoffCraft has no section of its own', secs);
  await page.selectOption('[data-dp-global] [data-dp="all.schedule.group"]', 'type');
  await page.selectOption('[data-dp-global] [data-dp="all.schedule.totals"]', 'groups');
  await page.selectOption('[data-dp-global] [data-dp="all.schedule.headings"]', 'upper');
  await page.fill('[data-dp-global] [data-dp="all.schedule.title"]', '{schedule}: office layout'); await page.press('[data-dp-global] [data-dp="all.schedule.title"]', 'Tab');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'layout-settings.png') });
  const stored = await T((k) => JSON.parse(localStorage.getItem(k) || 'null'), KEY);
  ok(stored && stored.format === 'cc-default-policies' && stored.policies['all.schedule.group'] === 'type' && stored.policies['all.schedule.totals'] === 'groups' && stored.policies['all.schedule.headings'] === 'upper' && stored.policies['all.schedule.title'] === '{schedule}: office layout', 'the four policies are saved in the one store every app reads (cc-default-policies)', stored);
  await page.keyboard.press('Escape'); await page.waitForSelector('dialog[data-app-settings][open]', { state: 'detached', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(300);

  console.log('== Quantities › By item in the office layout');
  Q = await table();
  // Count: Doors 1320 + Sinks 180 = 1500.00; Typed quantity: Permit
  const permit = total0 - 150000;
  ok(Q.rows.join() === 'G:TYPE: Count,Doors,Sinks,S:Subtotal (2)|$1,500.00,G:TYPE: Typed quantity,Permit,S:Subtotal (1)|$' + (permit / 100).toLocaleString('en-US', { minimumFractionDigits: 2 }), 'grouped by item type, with a subtotal under each group: Count $1,500.00, then the typed Permit', Q.rows);
  ok(Q.head[0] === 'ITEM' && Q.title === 'Estimate: office layout' && Q.std.split(' ').sort().join() === 'groupBy,headings,title,totals' && /Job total/i.test(Q.foot[0]) && Q.foot[Q.foot.length - 1] === plain.foot[plain.foot.length - 1], 'headings in capitals, the office title, a line saying the office standard did it; the job total is unchanged', [Q.head[0], Q.title, Q.std, Q.foot]);
  ok(await page.locator('[data-qty-table] tbody tr[data-qty-row] input').count() >= 6, 'the rows are the page\'s own: their boxes are still there');
  const cell = page.locator('[data-qty-table] tbody tr[data-qty-row]').nth(1).locator('input[data-field$=":mat"]');
  await cell.fill('100'); await cell.press('Enter'); await page.waitForTimeout(500);
  Q = await table();
  // Sinks now 2 x 100 = 200: Count 1520.00
  ok(Q.rows[3] === 'S:Subtotal (2)|$1,520.00' && await T(() => window.takeoffcraft.estimate().total) === total0 + 2000, 'a rate typed in a moved row still edits the takeoff; the subtotal follows ($1,520.00)', Q.rows);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'layout-by-item.png') });
  await page.click('[data-qty-mode="sheet"]');
  await page.waitForTimeout(300);
  Q = await table();
  ok(Q.head[0] === 'SHEET' && Q.rows.length === 2 && !Q.rows.some((r) => r.startsWith('G:')) && Q.std.split(' ').sort().join() === 'headings,title,totals', 'By sheet has no type column: not grouped; the heading case and title still come from the office', Q);

  console.log('== the export and the tools');
  const csvText = await T(async () => { const E = await import('/assets/apps/takeoffcraft/dev/export.js'); return E.estimateCsv(window.takeoffcraft.model.state); });
  const cl = csvText.split('\r\n');
  ok(cl[0].startsWith('ITEM,TYPE') && cl[1] === 'TYPE: Count' && /^Subtotal \(2\),.*,1520,$/.test(cl[4]) && cl[5] === 'TYPE: Typed quantity', 'the CSV the page exports is laid out the same way', cl.slice(0, 7));
  await T(() => import('/assets/apps/takeoffcraft/dev/host.js').then((H) => H.getHost({ app: 'takeoffcraft' }).control.configure({ enabled: true, groups: ['read'] })));
  const r = await T(() => import('/assets/apps/takeoffcraft/dev/host.js').then((H) => H.getHost({ app: 'takeoffcraft' }).control.handle({ jsonrpc: '2.0', id: 1, method: 'tools.call', params: { name: 'takeoff_estimate', arguments: {} } }, 's', { name: 't', version: '1' })));
  const lay = r.result?.structuredContent?.layout;
  ok(lay && lay.groupedBy === 'type' && lay.lines[0].label === 'TYPE: Count' && lay.lines.find((l) => l.kind === 'subtotal').totalCents === 152000 && lay.fromOfficeStandard.length === 4, 'takeoff_estimate in the window answers with the office layout', lay);

  console.log('== switched off again');
  await T((k) => { localStorage.removeItem(k); }, KEY);
  await T(() => import('/assets/apps/takeoffcraft/dev/defaults-hook.js').then((H) => H.defaultsChanged()));
  await page.waitForTimeout(300);
  await page.click('[data-qty-mode="item"]'); await page.waitForTimeout(300);
  Q = await table();
  ok(Q.rows.join() === plain.rows.join() && Q.head[0] === 'Item' && Q.std === '' && Q.title === '', 'the policies cleared: the table is plain again', Q);
  await T(() => { localStorage.removeItem('cc-addons:takeoffcraft'); });
  ok(problems.filter((p) => !/429|Too Many Requests/.test(p)).length === 0, 'no console errors', problems.slice(0, 4));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
} finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

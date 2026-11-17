#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-signoff.mjs — booklet rows BK.62 (missing rates flagged; the estimate signed off by a person, recorded in the file, cleared
 * when a figure changes) and BK.142 (a figure of the estimate selects the marks it came from) in the real TakeoffCraft page, /lab,
 * headless (session bk-r3-schedules-10):
 *   nice -n 10 timeout 600 node tools/takeoffcraft-test/browser-signoff.mjs [--shots <dir>]      run as root (a test admin session)
 * Count items on a real PDF sheet (counts need no scale). Expected values are worked out beside each check.
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

  await page.setInputFiles('[data-file-pdf]', path.join(ROOT, 'fixtures/pdf/kitchen-plan-sheet.pdf'));
  await page.waitForFunction(() => window.takeoffcraft.sheets().length > 0 && !!window.takeoffcraft.sheet(), null, { timeout: 30000 });
  await page.waitForTimeout(500);
  // Doors 4 at $250.00 + $80.00; Sinks 2 with no rate; on the open sheet
  const made = await T(() => {
    const tc = window.takeoffcraft, m = tc.model, sheet = tc.sheet();
    m.addItems([{ name: 'Doors', type: 'count', unit: 'EA', mat: 2500000, lab: 800000 }, { name: 'Sinks', type: 'count', unit: 'EA' }]);
    const [d, s] = m.state.items.slice(-2);
    for (let i = 0; i < 4; i++) m.addMark({ item: d.id, sheet, pts: [{ x: 100 + 40 * i, y: 100 }] });
    for (let i = 0; i < 2; i++) m.addMark({ item: s.id, sheet, pts: [{ x: 100 + 40 * i, y: 200 }] });
    return { doors: d.id, sinks: s.id, total: tc.estimate().total, marks: m.state.marks.map((x) => ({ id: x.id, item: x.item })) };
  });
  await page.waitForTimeout(400);
  if (await page.evaluate(() => document.querySelector('.tc')?.classList.contains('is-qty-closed') || document.querySelector('[data-qty-table]')?.getBoundingClientRect().height === 0)) { await page.click('[data-qty-toggle]'); await page.waitForTimeout(300); }
  // 4 x (250 + 80) = 1320.00
  ok(made.total === 132000, 'the estimate: 4 doors at $330.00 = $1,320.00; the sinks have no rate', made.total);

  console.log('== BK.62 missing rates are flagged');
  ok(await page.locator(`tr[data-qty-row="${made.sinks}"] [data-norate]`).count() === 1 && await page.locator(`tr[data-qty-row="${made.doors}"] [data-norate]`).count() === 0, 'the Sinks line carries "no rate"; the Doors line does not');
  ok(await page.locator('[data-signoff] [data-norate-count="1"]').count() === 1 && /Not signed off/.test(await page.locator('[data-signoff]').textContent()), 'the bar above the table: No rate: 1, Not signed off');

  console.log('== BK.142 a figure selects the marks it came from');
  await page.locator(`tr[data-qty-row="${made.doors}"] td[data-fig]`).last().click(); await page.waitForTimeout(300);
  let sel = await T(() => window.takeoffcraft.selection());
  ok(sel.length === 4 && sel.slice().sort().join() === made.marks.filter((m) => m.item === made.doors).map((m) => m.id).sort().join(), 'a click on the Doors total selects its four marks on the sheet', sel);
  await page.locator(`tr[data-qty-row="${made.sinks}"] td[data-fig]`).first().click(); await page.waitForTimeout(300);
  sel = await T(() => window.takeoffcraft.selection());
  ok(sel.length === 2, 'a click on the Sinks quantity selects its two marks');
  await page.locator('[data-qty-table] tfoot td[data-fig]').last().click(); await page.waitForTimeout(300);
  ok((await T(() => window.takeoffcraft.selection())).length === 6, 'a click on the job total selects every mark on the sheet');

  console.log('== BK.62 a person signs the estimate off');
  await page.click('[data-signoff-open]');
  await page.waitForSelector('[data-signoff-dialog]');
  const dtext = await page.locator('[data-signoff-dialog]').textContent();
  ok(/\$1,320\.00/.test(dtext) && await page.locator('[data-signoff-missing="1"]').count() === 1 && /Sinks/.test(dtext), 'the dialog states the total being signed and lists the line with no rate');
  await page.fill('[data-signoff-name]', '');
  await page.click('[data-signoff-sign]');
  ok(/Type your name/.test(await page.locator('[data-signoff-error]').textContent()) && await T(() => window.takeoffcraft.model.signoff()) === null, 'no name: not signed');
  await page.fill('[data-signoff-name]', 'Duncan Philips'); await page.fill('[data-signoff-role]', 'Architect');
  await page.click('[data-signoff-sign]'); await page.waitForTimeout(400);
  const so = await T(() => window.takeoffcraft.model.signoff());
  ok(so && so.by === 'Duncan Philips' && so.role === 'Architect' && so.total === 132000 && so.missing === 1 && Math.abs(Date.parse(so.at) - Date.now()) < 120000, 'signed: who, when (now), what total, and that one line had no rate', so);
  ok(/Signed off by Duncan Philips, Architect/.test(await page.locator('[data-signoff]').textContent()) && /\$1,320\.00/.test(await page.locator('[data-signoff]').textContent()) && await page.locator('[data-signoff-clear]').count() === 1, 'the bar says who signed, when and for what total');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'signed.png') });
  const file = await T(() => window.takeoffcraft.model.toJSON());
  ok(file.signoff?.by === 'Duncan Philips' && file.signoff.total === 132000, 'the takeoff file carries the sign-off');

  console.log('== BK.62 cleared when the estimate changes');
  const cell = page.locator(`tr[data-qty-row="${made.sinks}"] input[data-field$=":mat"]`);
  await cell.fill('90'); await cell.press('Enter'); await page.waitForTimeout(500);
  // sinks now 2 x 90 = 180: total 1500.00
  ok(await T(() => window.takeoffcraft.model.signoff()) === null && await T(() => window.takeoffcraft.estimate().total) === 150000, 'a rate typed in the table (total now $1,500.00): the sign-off is gone');
  ok(/Not signed off/.test(await page.locator('[data-signoff]').textContent()) && await page.locator('[data-norate]').count() === 0 && /sign-off by Duncan Philips was cleared/.test(await page.locator('[data-status], .tc-status').first().textContent().catch(() => '') || await T(() => document.body.innerText)), 'the bar says Not signed off, the no-rate flag is gone, and the person is told the sign-off was cleared');
  await T(() => window.takeoffcraft.model.undo()); await page.waitForTimeout(400);
  ok((await T(() => window.takeoffcraft.model.signoff()))?.by === 'Duncan Philips' && /Signed off by Duncan Philips/.test(await page.locator('[data-signoff]').textContent()), 'undo: the estimate that was signed is back, and so is its sign-off');
  await page.click('[data-signoff-clear]'); await page.waitForTimeout(300);
  ok(await T(() => window.takeoffcraft.model.signoff()) === null, 'Remove the sign-off removes it');
  console.log('== BK.39 / BK.61 the estimate for Google Sheets');
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'https://getcadcraft.com' });
  await page.click('[data-est-sheets]'); await page.waitForTimeout(300);
  const tsv = await page.evaluate(async () => { try { return await navigator.clipboard.readText(); } catch (e) { return window.takeoffcraft.signoff().tsv(); } });
  const tl = tsv.split('\n');
  ok(tl[0].split('\t')[0] === 'Item' && tl[1].split('\t')[0] === 'Doors' && tl[1].split('\t').includes('1320') && /^Job total\t/.test(tl[3]), 'Copy for Google Sheets: the estimate as tab-separated text (headings, Doors with 1320, Sinks, the job total)', tl.slice(0, 4));
  ok(/does not sign in to Google and sends nothing there/.test(await page.locator('[data-est-sheets]').getAttribute('title') || await page.locator('[data-est-sheets]').getAttribute('data-bs-title') || await page.locator('[data-est-sheets]').getAttribute('aria-label') || ''), 'the button says what it is: a paste; nothing is sent to Google');
  await page.evaluate(() => window.takeoffcraft && import('/assets/apps/takeoffcraft/dev/host.js').then((H) => H.getHost({ app: 'takeoffcraft' }).control.configure({ enabled: true, groups: ['read', 'export'] })));
  const call = (name, args) => page.evaluate(([n, a]) => import('/assets/apps/takeoffcraft/dev/host.js').then((H) => H.getHost({ app: 'takeoffcraft' }).control.handle({ jsonrpc: '2.0', id: 1, method: 'tools.call', params: { name: n, arguments: a } }, 's', { name: 't', version: '1' })), [name, args]);
  let r = await call('takeoff_estimate', {});
  let sc = r.result?.structuredContent;
  ok(!r.result?.isError && sc?.missingRateCount === 1 && sc.missingRates[0].name === 'Sinks' && sc.rows.find((x) => x.name === 'Sinks').missingRate === true && sc.signoff.signedOff === false && sc.rows.find((x) => x.name === 'Doors').marks.length === 4, 'takeoff_estimate in the window: Sinks flagged as a missing rate, not signed off, the Doors line names its 4 marks', JSON.stringify(r).slice(0, 300));
  r = await call('marks_select', { item: 'Doors' }); await page.waitForTimeout(300);
  ok(!r.result?.isError && r.result.structuredContent.selected === 4 && (await T(() => window.takeoffcraft.selection())).length === 4, 'marks_select shows the marks behind the Doors line (BK.142)');
  r = await call('takeoff_export', { format: 'sheets' });
  ok(!r.result?.isError && /^Item\t/.test(r.result.structuredContent.text) && /Nothing was sent to Google/.test(r.result.structuredContent.how), 'takeoff_export sheets: the tab-separated text comes back with how to paste it');
  ok(problems.filter((p) => !/429|Too Many Requests/.test(p)).length === 0, 'no console errors', problems.slice(0, 4));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
} finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

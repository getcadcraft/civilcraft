#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * MarkupCraft field records (0.7 LC.7) in a real (headless) browser, against the live vhost:
 *   node tools/markupcraft-test/browser-field.mjs [--out tmp/shots/markupcraft-field] [--only desktop|phone|tablet|tablet-turned]
 *
 * Signs in the MarkupCraft test admin with a minted session (admin.php session/down — disabled again at the end), then for each size runs the same
 * story: open the kitchen plan sheet, add an RFI by tapping the sheet, a submittal and a daily log, fill them in, answer, change
 * a status, attach a name, filter the log (overdue, assigned to me, type), select a record by tapping its pin, export CSV and BCF,
 * save the PDF and read the records back out of it, then with the network CUT add another record and reply, and finally merge
 * the saved copy into a fresh open of the plain sheet (records join by id). Sizes: desktop 1280 × 800 (mouse), phone 412 × 892
 * and tablet 1024 × 768 / 768 × 1024 (touch). Checks that nothing is wider than the screen and that touch targets are at least
 * 44 px. Fails on any console error. Run as root (it calls `sudo -u www-data php` for the admin).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const { chromium } = await import('playwright-core');
const pdfjs = await import(path.join(HERE, 'node_modules/pdfjs-dist/legacy/build/pdf.mjs'));
const args = process.argv.slice(2);
const OUT = path.resolve(REPO, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'tmp/shots/markupcraft-field');
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : '';
const STD_FONTS = path.join(HERE, 'node_modules/pdfjs-dist/standard_fonts/');
const PLAN = path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf');
const BASE = 'https://getcadcraft.com';
fs.mkdirSync(OUT, { recursive: true });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'markupcraft-field-'));

let pass = 0, fail = 0;
const ok = (c, label, detail) => { if (c) { pass++; console.log('  ok   ' + label); } else { fail++; console.log('  FAIL ' + label + (detail !== undefined ? '  → ' + JSON.stringify(detail) : '')); } };
const noRecover = async (pg) => {
  const n = await pg.waitForFunction(() => window.markupcraft?.orphans !== undefined && { n: window.markupcraft.orphans }, null, { timeout: 15000 }).then(async (h) => (await h.jsonValue()).n, () => 0);
  const d = n ? await pg.waitForSelector('dialog[data-autosave-dialog][open]', { timeout: 10000 }).catch(() => null) : null;
  if (d) { await pg.click('[data-autosave-discard-all]'); await pg.waitForSelector('dialog[data-autosave-dialog][open]', { state: 'detached', timeout: 5000 }).catch(() => {}); }
};

const { cookie } = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'session'], { encoding: 'utf8' }).trim().split('\n').pop());
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];

/** A signed-in session minted in-process (admin.php session): no login form, so the admin-login throttle is never touched. */
const signIn = async () => ({ cookies: [{ name: cookie.split('=')[0], value: cookie.split('=')[1], domain: 'getcadcraft.com', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' }], origins: [] });

const SIZES = [
  { key: 'desktop', w: 1280, h: 800, touch: false },
  { key: 'phone', w: 412, h: 892, touch: true, dsf: 2.625 },
  { key: 'tablet', w: 1024, h: 768, touch: true, dsf: 2 },
  { key: 'tablet-turned', w: 768, h: 1024, touch: true, dsf: 2 },
];

async function story(size, state) {
  console.log('\n== ' + size.key + ' ' + size.w + ' × ' + size.h + (size.touch ? ' (touch)' : ' (mouse)'));
  const ctx = await browser.newContext({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: size.dsf || 1, isMobile: size.touch && size.w < 700, hasTouch: size.touch, acceptDownloads: true, storageState: state });
  await ctx.addInitScript(() => { try { localStorage.setItem('markupcraft.author', JSON.stringify('Field Tester')); } catch { /* */ } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(size.key + ' console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push(size.key + ' pageerror: ' + e.message));
  page.on('response', (r) => { if (r.status() >= 400) problems.push(size.key + ' ' + r.status() + ': ' + r.url()); });
  await page.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await noRecover(page);
  await page.setInputFiles('[data-file]', PLAN);
  await page.waitForFunction(() => window.markupcraft?.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });
  await page.waitForTimeout(500);

  const tap = async (x, y) => (size.touch ? page.touchscreen.tap(x, y) : page.mouse.click(x, y));
  const tapEl = async (sel) => { await page.locator(sel).first().scrollIntoViewIfNeeded(); const b = await page.locator(sel).first().boundingBox(); await tap(b.x + b.width / 2, b.y + b.height / 2); };
  const showField = async () => {
    // on a phone the right panel is a sheet over the drawing: open it (the shell's own switch) and let it settle
    const phone = await page.evaluate(() => !!window.ccShellPhone?.on());
    if (phone) {
      if (!(await page.evaluate(() => window.ccShellPhone.sheets().find((s) => s.id === 'right')?.open))) await page.evaluate(() => window.ccShellPhone.open('right'));
      await page.waitForTimeout(500);
    }
    await page.locator('[data-tab="field"]').click();
    await page.waitForSelector('#mc-pane-field:not([hidden])');
  };
  const hideSheet = async () => { if (await page.evaluate(() => !!window.ccShellPhone?.on())) { await page.evaluate(() => window.ccShellPhone.close()); await page.waitForTimeout(500); } };
  /** Where a user-space point lands on the page. */
  const at = async (x, y) => { const box = await page.locator('[data-over]').boundingBox(); const [sx, sy] = await page.evaluate(([a, b]) => window.markupcraft.view.toScreen([a, b]), [x, y]); return [box.x + sx, box.y + sy]; };
  const recs = () => page.evaluate(() => [...window.markupcraft.store.records.values()].map((r) => ({ id: r.id, type: r.type, n: r.n, title: r.title, at: r.at, status: r.status, due: r.due, assignee: r.assignee, replies: r.replies.length, attachments: r.attachments, removed: r.removed })));
  const place = async (type, user) => {
    await showField();
    await tapEl('[data-field-act="new"][data-type="' + type + '"]');
    await page.waitForFunction(() => window.markupcraft.tool === 'record');
    ok(await page.locator('[data-field-place-note]').isVisible(), size.key + ': placing says where to tap');
    await hideSheet();
    const want = (await recs()).length + 1;
    const [x, y] = await at(...user);
    await tap(x, y);
    await page.waitForFunction((n) => window.markupcraft.store.records.size === n, want, { timeout: 5000 }).catch(async (e) => { console.log('  tap at', x, y, 'canvas', JSON.stringify(await page.locator('[data-over]').boundingBox()), 'tool', await page.evaluate(() => window.markupcraft.tool + ' ' + JSON.stringify(window.markupcraft.view.page && [window.markupcraft.view.vpw, window.markupcraft.view.vph, window.markupcraft.view.z]))); throw e; });
  };
  const fill = async (label, value) => { const el = page.locator('#mc-rec-detail').getByLabel(label, { exact: true }); await el.fill(value); await el.press('Tab'); await page.waitForTimeout(150); };

  // ---- an RFI by tapping the sheet ----
  console.log('  an RFI');
  await place('rfi', [600, 700]);
  let all = await recs();
  ok(all.length === 1 && all[0].type === 'rfi' && all[0].n === 1 && Array.isArray(all[0].at), size.key + ': the tap made RFI 1 with a pin', all);
  await showField();
  await page.waitForSelector('#mc-rec-detail .mc-rec-grid');
  await fill('Title', 'Hood clearance over the line');
  await page.locator('#mc-rec-detail textarea.mc-rec-text').fill('Is 18 in above the cooking surface acceptable?');
  await page.locator('#mc-rec-detail textarea.mc-rec-text').press('Tab');
  await fill('Assignee', 'Field Tester');
  await page.locator('#mc-rec-detail input[type="date"]').first().fill('2026-01-05');
  await page.locator('#mc-rec-detail input[type="date"]').first().press('Tab');
  await page.waitForTimeout(200);
  all = await recs();
  ok(all[0].title === 'Hood clearance over the line' && all[0].assignee === 'Field Tester' && all[0].due === '2026-01-05', size.key + ': title, assignee and due date are kept', all[0]);
  // attachments by name
  await page.locator('#mc-rec-detail [aria-label="Attachment name"]').fill('hood spec 11 81 00.pdf');
  await tapEl('#mc-rec-detail .mc-rec-attach-add button:text("Add")');
  await page.waitForTimeout(200);
  ok((await recs())[0].attachments.join() === 'hood spec 11 81 00.pdf' && await page.locator('.mc-rec-names li').count() === 1, size.key + ': an attachment name is listed');
  // a reply
  await page.locator('#mc-rec-detail textarea[aria-label="Reply"]').fill('Checking with the hood maker.');
  await tapEl('#mc-rec-detail button:text("Send reply")');
  await page.waitForTimeout(200);
  ok((await recs())[0].replies === 1 && await page.locator('#mc-rec-detail .mc-reply').count() === 1, size.key + ': the reply is in the thread');
  const rowText = await page.locator('.mc-rec-row').first().innerText();
  ok(/RFI-0001/.test(rowText) && /Overdue/.test(rowText) && /Assigned to Field Tester/.test(rowText), size.key + ': the log row shows the number, overdue and the assignee', rowText);

  // ---- a submittal, status change ----
  console.log('  a submittal and a daily log');
  await place('submittal', [1000, 900]);
  await showField();
  await fill('Title', 'Walk-in cooler panels');
  await fill('Assignee', 'Sam Supplier');
  await page.locator('#mc-rec-detail input[type="date"]').first().fill('2026-01-06');
  await page.locator('#mc-rec-detail input[type="date"]').first().press('Tab');
  await page.locator('#mc-rec-detail').getByLabel('Status', { exact: true }).selectOption('Approved as noted');
  await page.waitForTimeout(250);
  all = await recs();
  const sub = all.find((r) => r.type === 'submittal');
  ok(sub.n === 1 && sub.status === 'Approved as noted' && sub.replies === 1, size.key + ': submittal 1, its status change is logged in the thread', sub);
  // the daily log: no pin
  await showField();
  await tapEl('[data-field-act="new"][data-type="log"]');
  await page.waitForFunction(() => window.markupcraft.store.records.size === 3);
  await page.waitForSelector('#mc-rec-detail .mc-rec-grid');
  await fill('Weather', 'Overcast, 8 C');
  await fill('People on site', '14');
  const lg = (await recs()).find((r) => r.type === 'log');
  ok(lg && lg.n === 1 && lg.at === null && lg.status === 'Draft', size.key + ': a daily log has no pin and starts as a draft', lg);
  ok(await page.evaluate(() => { const r = [...window.markupcraft.store.records.values()].find((x) => x.type === 'log'); return r.weather === 'Overcast, 8 C' && r.crew === 14 && /^\d{4}-\d{2}-\d{2}$/.test(r.date); }), size.key + ': weather, crew and the day are kept');

  // ---- the log view ----
  console.log('  the log view');
  const rows = () => page.locator('.mc-rec-row').count();
  ok(await rows() === 3, size.key + ': three rows');
  await page.locator('#mc-r-due').selectOption('overdue');
  ok(await rows() === 1 && /RFI-0001/.test(await page.locator('.mc-rec-row').first().innerText()), size.key + ': overdue lists only the RFI (the submittal is approved, so not late)');
  await page.locator('#mc-r-due').selectOption('');
  await page.locator('[data-field-mine]').check();
  ok(await rows() === 1 && /RFI-0001/.test(await page.locator('.mc-rec-row').first().innerText()), size.key + ': assigned to me shows the one assigned to Field Tester');
  await page.locator('[data-field-mine]').uncheck();
  await page.locator('#mc-r-type').selectOption('submittal');
  ok(await rows() === 1, size.key + ': filter by type');
  const statusOpts = await page.locator('#mc-r-status option').allInnerTexts();
  ok(statusOpts.includes('Approved as noted') && !statusOpts.includes('Answered'), size.key + ': the status filter follows the type', statusOpts);
  await page.locator('#mc-r-type').selectOption('');
  await page.locator('#mc-r-q').fill('cooler');
  ok(await rows() === 1, size.key + ': search by text');
  await page.locator('#mc-r-q').fill('');
  ok(/3 of 3 shown, 1 overdue/.test(await page.locator('[data-field-count]').innerText()), size.key + ': the count line', await page.locator('[data-field-count]').innerText());

  // ---- a pin selects its record ----
  console.log('  pins');
  await page.evaluate(() => window.markupcraft.field.setSelected(''));
  await page.locator('#mc-rec-detail').evaluate((n) => n.replaceChildren());
  await hideSheet();
  await page.evaluate(() => window.markupcraft.setTool('select'));
  const rfi = (await recs()).find((r) => r.type === 'rfi');
  const [px, py] = await at(...rfi.at);
  await page.screenshot({ path: path.join(OUT, size.key + '-pins.png') });
  const size1 = size.touch ? 30 : 22;
  await tap(px, py - size1 * 0.95);
  await page.waitForFunction((id) => window.markupcraft.field.selected === id, rfi.id, { timeout: 5000 });
  ok(true, size.key + ': a tap on the pin selects its record');
  await showField();
  ok(/Hood clearance/.test(await page.locator('#mc-rec-detail').innerText().catch(() => '')) || (await page.locator('#mc-rec-detail input').first().inputValue()) === 'Hood clearance over the line', size.key + ': and the Field tab shows it');

  // ---- layout ----
  console.log('  layout');
  const lay = await page.evaluate(() => {
    const pane = document.querySelector('#mc-pane-field');
    const vw = document.documentElement.clientWidth;
    const wide = [...pane.querySelectorAll('*')].filter((e) => { const b = e.getBoundingClientRect(); return b.width && b.right > vw + 1 && e.checkVisibility(); }).slice(0, 4).map((e) => (e.className || e.tagName) + '@' + Math.round(e.getBoundingClientRect().right));
    const small = [...pane.querySelectorAll('button, input:not([type=file]):not([type=checkbox]), select, textarea')].filter((e) => e.checkVisibility() && !e.closest('.mc-filters') ).map((e) => { const b = e.getBoundingClientRect(); return { n: (e.dataset.fieldAct || e.className || e.tagName) + ':' + (e.textContent || '').trim().slice(0, 16), h: Math.round(b.height), w: Math.round(b.width) }; }).filter((x) => x.h < 44 && x.h > 0);
    return { vw, scrollW: document.scrollingElement.scrollWidth, wide, small, paneScrollW: pane.scrollWidth, paneW: pane.clientWidth };
  });
  ok(lay.scrollW <= lay.vw + 1 && !lay.wide.length && lay.paneScrollW <= lay.paneW + 1, size.key + ': nothing wider than the screen', lay);
  if (size.touch) ok(lay.small.length === 0, size.key + ': touch targets in the Field tab are at least 44 px high', lay.small);
  await page.screenshot({ path: path.join(OUT, size.key + '-field.png') });

  // ---- exports ----
  console.log('  exports');
  const [dCsv] = await Promise.all([page.waitForEvent('download'), tapEl('[data-field-act="csv"]')]);
  const csv = fs.readFileSync(await dCsv.path(), 'utf8');
  ok(/\.csv$/.test(dCsv.suggestedFilename()) && /No\.,Type,Sheet/.test(csv) && /RFI-0001/.test(csv) && /SUB-0001/.test(csv) && /LOG-0001/.test(csv) && /Yes/.test(csv.split('\r\n')[1]), size.key + ': CSV has the three records and flags the overdue one', csv.slice(0, 300));
  const [dBcf] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), tapEl('[data-field-act="bcf"]')]);
  const bcf = fs.readFileSync(await dBcf.path());
  ok(/\.bcfzip$/.test(dBcf.suggestedFilename()) && bcf.subarray(0, 2).toString() === 'PK' && bcf.includes(Buffer.from('TopicType="RFI"')) && bcf.includes(Buffer.from('TopicType="Daily log"')), size.key + ': BCF has the topics');
  ok(bcf.includes(Buffer.from('snapshot.png')), size.key + ': each BCF topic has a snapshot');

  // ---- save, and read it back ----
  console.log('  save');
  const saveBtn = page.locator('[data-act="save"]').first();
  const [dPdf] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), saveBtn.click()]);
  const savedPath = path.join(TMP, size.key + '.pdf');
  fs.copyFileSync(await dPdf.path(), savedPath);
  const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(savedPath)), standardFontDataUrl: STD_FONTS, isEvalSupported: false }).promise;
  const meta = await doc.getMetadata();
  const raw = meta.info?.Custom instanceof Map ? meta.info.Custom.get('MarkupCraftRecords') : meta.info?.Custom?.MarkupCraftRecords;
  const saved = raw ? JSON.parse(String(raw)) : null;
  ok(saved?.records?.length === 3 && saved.records.every((r) => r.page === 0) && saved.records.filter((r) => r.type === 'rfi')[0].replies.length === 1, size.key + ': the saved PDF carries the three records with the thread', saved?.records?.length);

  // ---- offline ----
  console.log('  offline');
  await ctx.setOffline(true);
  const before = problems.length;
  await place('rfi', [300, 1200]);
  await showField();
  await fill('Title', 'Added with no network');
  await page.locator('#mc-rec-detail textarea[aria-label="Reply"]').fill('Noted on site.');
  await tapEl('#mc-rec-detail button:text("Send reply")');
  await page.waitForTimeout(250);
  all = await recs();
  const off = all.find((r) => r.title === 'Added with no network');
  ok(off && off.n === 2 && off.replies === 1, size.key + ': offline: a new RFI (number 2) with a reply', off);
  const [dPdf2] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.locator('[data-act="save"]').first().click()]);
  const offPath = path.join(TMP, size.key + '-offline.pdf');
  fs.copyFileSync(await dPdf2.path(), offPath);
  await ctx.setOffline(false);
  ok(problems.length === before, size.key + ': nothing failed while offline', problems.slice(before));

  // ---- merge into a fresh open of the plain sheet ----
  console.log('  merge');
  const page2 = await ctx.newPage();
  page2.on('console', (m) => { if (m.type() === 'error') problems.push(size.key + ' (2) console: ' + m.text()); });
  page2.on('pageerror', (e) => problems.push(size.key + ' (2) pageerror: ' + e.message));
  await page2.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await noRecover(page2);
  await page2.setInputFiles('[data-file]', savedPath);   // the first copy (three records)
  await page2.waitForFunction(() => window.markupcraft?.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });
  const n2 = await page2.evaluate(() => window.markupcraft.store.liveRecords().length);
  ok(n2 === 3, size.key + ': opening the saved PDF brings the records back', n2);
  // a local RFI made here too: it is number 2, like the one the other copy made offline
  if (await page2.evaluate(() => !!window.ccShellPhone?.on())) { await page2.evaluate(() => window.ccShellPhone.open('right')); await page2.waitForTimeout(500); }
  await page2.locator('[data-tab="field"]').click();
  const nb = await page2.locator('[data-field-act="new"][data-type="rfi"]').first().boundingBox();
  await (size.touch ? page2.touchscreen.tap(nb.x + nb.width / 2, nb.y + nb.height / 2) : page2.mouse.click(nb.x + nb.width / 2, nb.y + nb.height / 2));
  await page2.waitForFunction(() => window.markupcraft.tool === 'record');
  await page2.evaluate(() => window.ccShellPhone?.on() && window.ccShellPhone.close());
  await page2.waitForTimeout(500);
  const box2 = await page2.locator('[data-over]').boundingBox();
  const [sx2, sy2] = await page2.evaluate(() => window.markupcraft.view.toScreen([200, 300]));
  await (size.touch ? page2.touchscreen.tap(box2.x + sx2, box2.y + sy2) : page2.mouse.click(box2.x + sx2, box2.y + sy2));
  await page2.waitForFunction(() => window.markupcraft.store.liveRecords().length === 4);
  ok(await page2.evaluate(() => [...window.markupcraft.store.records.values()].filter((r) => r.type === 'rfi').map((r) => r.n).sort().join()) === '1,2', size.key + ': this copy has RFI 1 and its own RFI 2');
  await page2.setInputFiles('[data-field-merge-file]', offPath);
  await page2.waitForFunction(() => /Merged/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 20000 }).catch(() => {});
  const merged = await page2.evaluate(() => [...window.markupcraft.store.records.values()].map((r) => ({ n: r.n, type: r.type, title: r.title, replies: r.replies.length })));
  ok(merged.length === 5, size.key + ': merged: five records', merged);
  const rfis = merged.filter((r) => r.type === 'rfi').map((r) => r.n).sort();
  ok(rfis.join() === '1,2,3', size.key + ': the two RFIs both numbered 2 are told apart (1, 2, 3)', rfis);
  const status = await page2.locator('[data-status]').innerText();
  ok(/1 new/.test(status) && /1 renumbered/.test(status), size.key + ': the status says what happened', status);
  await page2.evaluate(() => window.markupcraft.store.undo());
  ok(await page2.evaluate(() => window.markupcraft.store.records.size) === 4, size.key + ': a merge is one undo step');
  await page2.close();
  await ctx.close();
}

try {
  const state = await signIn();
  for (const size of SIZES) if (!ONLY || ONLY === size.key) await story(size, state);
  ok(problems.length === 0, 'no console errors or failed requests', problems.slice(0, 8));
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'down'], { stdio: 'ignore' });
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed. Shots in ' + path.relative(REPO, OUT) + '/');
process.exit(fail ? 1 : 0);

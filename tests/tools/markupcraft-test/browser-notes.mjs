#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * MarkupCraft notes, the pasteboard and private notes (0.9 NOTES.1) in a real (headless) browser, against /lab/markupcraft: draw off the sheet,
 * show and hide, a snapshot to the pasteboard, set a passphrase, a private note, Save, a second person (a separate browser profile) opens
 * the same PDF and gets nothing, its writer on another profile unlocks it, lock and unlock, a clean copy, autosave holds no clear text.
 *   node tools/markupcraft-test/browser-notes.mjs [--out tmp/shots/markupcraft-notes]
 * Run as root. Fixture: testfiles/generated/markup/link-set.pdf (make-link-set.mjs, once).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const { chromium } = await import('playwright-core');
const PDFLib = await import(pathToFileURL(path.join(REPO, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
const args = process.argv.slice(2);
const OUT = path.resolve(REPO, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'tmp/shots/markupcraft-notes');
const SET = path.resolve(REPO, '../testfiles/generated/markup/link-set.pdf');
if (!fs.existsSync(SET)) { console.log('Skipped: no ' + SET); process.exit(0); }
const BASE = 'https://getcadcraft.com', PASS = 'correct horse battery';
fs.mkdirSync(OUT, { recursive: true });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'markupcraft-notes-'));
let pass = 0, fail = 0;
const ok = (c, label, d) => { if (c) { pass++; console.log('  ok   ' + label); } else { fail++; console.log('  FAIL ' + label + (d !== undefined ? ' — ' + JSON.stringify(d).slice(0, 400) : '')); } };

async function allText(bytes) {
  const doc = await PDFLib.PDFDocument.load(bytes, { updateMetadata: false, throwOnInvalidObject: false });
  let out = Buffer.from(bytes).toString('latin1');
  const hex = (s) => { const b = Buffer.from(s, 'hex'); return b[0] === 0xfe && b[1] === 0xff ? b.subarray(2).swap16().toString('utf16le') : b.toString('latin1'); };
  for (const [, o] of doc.context.enumerateIndirectObjects()) {
    if (o instanceof PDFLib.PDFRawStream) { try { out += '\n' + Buffer.from(PDFLib.decodePDFRawStream(o).decode()).toString('utf8'); } catch { /* not flate */ } }
    out += '\n' + o.toString().replace(/<([0-9A-Fa-f]{4,})>/g, (_, h) => hex(h));
  }
  return out;
}

const { cookie } = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'session'], { encoding: 'utf8' }).trim().split('\n').pop());
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];

async function person(name, file) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: cookie.split('=')[0], value: cookie.split('=')[1], domain: 'getcadcraft.com', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' }]);
  await ctx.addInitScript((n) => { try { localStorage.setItem('markupcraft.author', JSON.stringify(n)); } catch {} }, name);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(name + ' console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push(name + ' pageerror: ' + e.message));
  await page.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', file);
  await page.waitForFunction(() => window.markupcraft?.sheets.length >= 1 && window.markupcraft.view.page, null, { timeout: 30000 }).catch(async (e) => { console.log('app did not open the file:', problems, await page.locator('[data-status]').innerText().catch(() => '')); await page.screenshot({ path: path.join(OUT, 'fail-open.png') }); throw e; });
  await page.evaluate(() => window.markupcraft.notes.ready);
  return { ctx, page };
}
const openTab = (page, name) => page.click('#mc-tab-' + name);
const every = (page) => page.evaluate(() => window.markupcraft.store.everything().map((m) => ({ id: m.id, type: m.type, scope: m.scope, text: m.text, shared: window.markupcraft.store.isShared(m) })));
/** A drag on the stage, in sheet coordinates. */
async function drag(page, a, b) {
  const box = await page.locator('[data-over]').boundingBox();
  const [p, q] = await page.evaluate(([a, b]) => [window.markupcraft.view.toScreen(a), window.markupcraft.view.toScreen(b)], [a, b]);
  await page.mouse.move(box.x + p[0], box.y + p[1]);
  await page.mouse.down();
  await page.mouse.move(box.x + (p[0] + q[0]) / 2, box.y + (p[1] + q[1]) / 2);
  await page.mouse.move(box.x + q[0], box.y + q[1]);
  await page.mouse.up();
}
async function saveNow(page) {
  const [d] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => window.markupcraft.saveFiles())]);
  const f = path.join(TMP, 'dl-' + Date.now() + '.pdf');
  await d.saveAs(f);
  return f;
}
const SECRET = 'SECRETPRIVATEWORDS', NOTE = 'PLAINNOTEWORDS';
try {
  const { page, ctx } = await person('Ann Writer', SET);
  const sv = () => page.evaluate(() => window.markupcraft.view.page.view ?? window.markupcraft.sheets[window.markupcraft.cur].page.view);

  console.log('\n== The pasteboard');
  await openTab(page, 'notes');
  await page.click('[data-pn-act="board"]');
  const v = await page.evaluate(() => window.markupcraft.sheets[window.markupcraft.cur].page.view);
  await page.evaluate(() => window.markupcraft.setTool('rect'));
  await drag(page, [v[2] + 40, v[3] - 120], [v[2] + 200, v[3] - 240]);
  let all = await every(page);
  ok(all.length === 1 && all[0].shared === false && !all[0].scope, 'a shape drawn beside the sheet is on the pasteboard, and counts as a note', all);
  ok(await page.evaluate(() => window.markupcraft.store.all().length) === 0, 'it is not a markup to anything that leaves the app');
  await page.screenshot({ path: path.join(OUT, '1-pasteboard.png') });

  console.log('\n== A snapshot');
  await page.evaluate(() => window.markupcraft.setTool('areacopy'));
  await drag(page, [v[0] + 100, v[1] + 300], [v[0] + 500, v[1] + 600]);
  await page.click('[data-area-act="board"]');
  await page.waitForFunction(() => window.markupcraft.store.everything().some((m) => m.type === 'image'), null, { timeout: 15000 });
  const img = await page.evaluate((v) => { const m = window.markupcraft.store.everything().find((x) => x.type === 'image'); return { scope: m.scope, off: m.rect[0] > v[2], w: m.rect[2] - m.rect[0], h: m.rect[3] - m.rect[1], png: m.img.startsWith('data:image/png') }; }, v);
  ok(img.scope === 'note' && img.off && img.png, 'a picture of the area lands beside the sheet, as a note', img);
  ok(Math.abs(img.w - 400) < 3 && Math.abs(img.h - 300) < 3, 'at its size on paper', img);
  await page.evaluate(() => window.markupcraft.setTool('select'));
  await page.screenshot({ path: path.join(OUT, '2-snapshot.png') });

  console.log('\n== Off the sheet: pick and move');
  const offId = (await every(page)).find((m) => m.type === 'rect').id;
  const [cx, cy] = await page.evaluate((id) => { const m = window.markupcraft.store.get(id); return [m.rect[0] + 2, (m.rect[1] + m.rect[3]) / 2]; }, offId);
  const bx = await page.locator('[data-over]').boundingBox();
  const sc = await page.evaluate(([x, y]) => window.markupcraft.view.toScreen([x, y]), [cx, cy]);
  await page.mouse.click(bx.x + sc[0], bx.y + sc[1]);
  ok(await page.evaluate((id) => window.markupcraft.sel.has(id), offId), 'a note on the pasteboard can be selected');

  console.log('\n== A note, in Properties');
  await page.evaluate(() => { const s = window.markupcraft; s.setTool('rect'); });
  await drag(page, [v[0] + 100, v[1] + 100], [v[0] + 300, v[1] + 200]);
  all = await every(page);
  const regId = all.find((m) => m.shared)?.id;
  ok(!!regId && (await page.evaluate(() => window.markupcraft.store.all().length)) === 1, 'on the sheet it is a regular markup');
  await page.evaluate((id) => { const mc = window.markupcraft; mc.setTool('select'); mc.store.change('t', (tx) => tx.update(id, { text: 'REGULARWORDS' })); }, regId);
  await page.evaluate(([id]) => { window.markupcraft.jumpTo?.(id); }, [regId]);
  await openTab(page, 'props');
  const box = await page.locator('[data-over]').boundingBox();
  const c = await page.evaluate((v) => window.markupcraft.view.toScreen([v[0] + 100, v[1] + 150]), v);
  await page.mouse.click(box.x + c[0], box.y + c[1]);
  ok(await page.locator('[data-pn-scope]').count() >= 1, 'Properties has the control');
  await page.selectOption('[data-pn-scope]', 'note');
  ok((await page.evaluate((id) => window.markupcraft.store.get(id).scope, regId)) === 'note', 'it becomes a note');
  await page.evaluate((id) => window.markupcraft.store.undo(), regId);
  ok(!(await page.evaluate((id) => window.markupcraft.store.get(id).scope, regId)), 'undo makes it regular again');
  await page.evaluate(([id, t]) => { window.markupcraft.store.change('t', (tx) => tx.add({ sheet: window.markupcraft.store.get(id).sheet, type: 'text', rect: [100, 400, 400, 440], text: t, scope: 'note', author: 'Ann Writer' })); }, [regId, NOTE]);

  console.log('\n== Show and hide');
  const painted = () => page.evaluate(() => { const mc = window.markupcraft; return mc.store.everyOn(mc.sheets[mc.cur].page.key).filter((m) => mc.store.shown(m)).length; });
  const before = await painted();
  await page.locator('[data-over]').focus();
  await page.keyboard.press('Shift+H');
  ok(await page.evaluate(() => window.markupcraft.store.notesShown === false) && await painted() === 1, 'Shift+H hides every note; the regular markup stays', await painted());
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(OUT, '3-hidden.png') });
  await page.click('.mc-nav [data-act="notes-toggle"]');
  ok(await painted() === before, 'the switch in the bar shows them again');

  console.log('\n== A private note');
  await openTab(page, 'notes');
  ok(await page.locator('[data-pn-state]').innerText().then((s) => /Set a passphrase/.test(s)), 'the panel says to set a passphrase first');
  await page.selectOption('[data-pn-new]', 'private');
  await page.waitForSelector('dialog.mc-dialog [data-pn-pass]');
  await page.fill('dialog.mc-dialog [data-pn-pass]', 'short');
  await page.fill('dialog.mc-dialog [data-pn-again]', 'short');
  await page.click('dialog.mc-dialog button[data-key="ok"]');
  ok(await page.locator('dialog.mc-dialog .mc-dlg-err').innerText().then((s) => /at least 10/.test(s)), 'a short passphrase is refused');
  ok(await page.locator('dialog.mc-dialog').innerText().then((s) => /no way to recover/i.test(s)), 'the dialog says it cannot be recovered');
  await page.fill('dialog.mc-dialog [data-pn-pass]', PASS);
  await page.fill('dialog.mc-dialog [data-pn-again]', PASS);
  await page.screenshot({ path: path.join(OUT, '4-passphrase.png') });
  await page.click('dialog.mc-dialog button[data-key="ok"]');
  await page.waitForFunction(() => window.markupcraft.notes.keychain.state === 'open', null, { timeout: 15000 });
  await page.waitForFunction(() => window.markupcraft.store.defaultScope === 'private');
  await page.evaluate(() => window.markupcraft.setTool('rect'));
  await drag(page, [v[0] + 400, v[1] + 400], [v[0] + 600, v[1] + 500]);
  const pid = await page.evaluate(() => window.markupcraft.store.everything().find((m) => m.scope === 'private')?.id);
  ok(!!pid, 'with New markups set to private, a drawn shape is private');
  await page.evaluate(([id, t]) => { const mc = window.markupcraft; mc.store.defaultScope = undefined; mc.setTool('select'); mc.store.change('t', (tx) => tx.update(id, { comment: t })); }, [pid, SECRET]);
  await page.selectOption('[data-pn-new]', '');
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(OUT, '5-private.png') });

  console.log('\n== Nothing leaves');
  const stBefore = await page.evaluate(async () => { const mc = window.markupcraft; return JSON.stringify(await mc.notes.stateFor(mc.files[0])); });
  ok(stBefore.includes(NOTE) && !stBefore.includes(SECRET), 'an autosave holds the private note only sealed');
  ok((await page.evaluate(() => JSON.stringify(window.markupcraft.store.all()))).includes(SECRET) === false, 'the store\'s public view has no private words');
  await page.evaluate((id) => { window.markupcraft.setTool('select'); }, pid);
  const b0 = await page.locator('[data-over]').boundingBox();
  const c2 = await page.evaluate((v) => window.markupcraft.view.toScreen([v[0] + 400, v[1] + 450]), v);
  await page.mouse.click(b0.x + c2[0], b0.y + c2[1]);
  await page.keyboard.press('Control+c');
  await page.waitForTimeout(100);
  const clipT = await page.evaluate(() => localStorage.getItem('markupcraft.clipboard') || '');
  ok(!clipT.includes(SECRET), 'Copy leaves the clipboard without it');
  ok(/cannot be copied/.test(await page.locator('[data-status]').innerText()), 'and says so');

  const savedFile = await saveNow(page);
  const savedBytes = fs.readFileSync(savedFile);
  let txt = await allText(savedBytes);
  ok(!txt.includes(SECRET), 'saved PDF: the private words are nowhere in it, in any object or stream');
  ok(txt.includes(NOTE), 'saved PDF: the note is there');
  ok(txt.includes('REGULARWORDS'), 'saved PDF: the regular markup is there');
  ok(txt.includes('cc-private-notes') && !/writer/.test((txt.match(/\{"f":"cc-private-notes".{0,600}/) || [''])[0]), 'the sealed blob names nobody');

  const [dc] = await Promise.all([page.waitForEvent('download'), (async () => { await openTab(page, 'notes'); await page.click('[data-pn-act="clean"]'); })()]);
  const cleanFile = path.join(TMP, 'clean.pdf'); await dc.saveAs(cleanFile);
  ok(/\(clean\)\.pdf$/.test(dc.suggestedFilename()), 'the clean copy says so in its name', dc.suggestedFilename());
  txt = await allText(fs.readFileSync(cleanFile));
  ok(!txt.includes(SECRET) && !txt.includes(NOTE) && !txt.includes('cc-private-notes') && !txt.includes('MarkupCraftNotes'), 'clean copy: no notes, no sealed notes, no trace');
  ok(txt.includes('REGULARWORDS'), 'clean copy: regular markups are in it');
  const annots = (await PDFLib.PDFDocument.load(fs.readFileSync(cleanFile), { updateMetadata: false })).getPage(0).node.Annots()?.size() ?? 0;
  ok(annots === 1, 'clean copy: one annotation on the sheet, the regular one', annots);

  console.log('\n== Lock');
  await page.click('[data-pn-act="lock"]');
  await page.waitForFunction(() => window.markupcraft.notes.keychain.state === 'locked');
  ok(!(await page.evaluate(() => JSON.stringify(window.markupcraft.store.everything()))).includes(SECRET), 'locked: gone from memory');
  ok(!(await page.evaluate(() => JSON.stringify([window.markupcraft.store.undoStack, window.markupcraft.store.redoStack]))).includes(SECRET), 'and from undo');
  await page.click('[data-pn-act="unlock"]');
  await page.waitForSelector('dialog.mc-dialog [data-pn-pass]');
  await page.fill('dialog.mc-dialog [data-pn-pass]', 'not the right one');
  await page.click('dialog.mc-dialog button[data-key="ok"]');
  await page.waitForFunction(() => /not right/.test(document.querySelector('[data-status]').textContent), null, { timeout: 15000 });
  ok(true, 'a wrong passphrase is refused and asks again');
  await page.waitForSelector('dialog.mc-dialog [data-pn-pass]');
  await page.fill('dialog.mc-dialog [data-pn-pass]', PASS);
  await page.click('dialog.mc-dialog button[data-key="ok"]');
  await page.waitForFunction((s) => window.markupcraft.store.everything().some((m) => m.comment === s), SECRET, { timeout: 15000 });
  ok(true, 'unlocked: the note is back');

  console.log('\n== Somebody else opens the saved PDF');
  const bob = await person('Bob Reader', savedFile);
  const bobAll = await every(bob.page);
  ok(bobAll.some((m) => m.text === NOTE && m.scope === 'note'), 'a colleague in MarkupCraft sees the note, as a note', bobAll);
  ok(!(await bob.page.evaluate(() => JSON.stringify(window.markupcraft.store.everything()))).includes(SECRET) && !bobAll.some((m) => m.scope === 'private'), 'and not the private note');
  await openTab(bob.page, 'notes');
  const bobPanel = await bob.page.locator('[data-pnotes]').innerText();
  ok(!/SECRET|Ann Writer/.test(bobPanel) && !/locked/i.test(bobPanel), 'nothing tells them one exists', bobPanel.slice(0, 200));
  await bob.page.evaluate(() => window.markupcraft.store.change('t', (tx) => tx.add({ sheet: window.markupcraft.sheets[0].page.key, type: 'text', rect: [100, 500, 400, 540], text: 'BOBWORDS', author: 'Bob Reader' })));
  const bobFile = await saveNow(bob.page);
  await bob.ctx.close();

  console.log('\n== Its writer, on another device, opens what the colleague saved');
  const ann2 = await person('Ann Writer', bobFile);
  ok(!(await ann2.page.evaluate(() => JSON.stringify(window.markupcraft.store.everything()))).includes(SECRET), 'before the passphrase: nothing');
  await openTab(ann2.page, 'notes');
  await ann2.page.click('[data-pn-act="unlock"]');
  await ann2.page.waitForSelector('dialog.mc-dialog [data-pn-pass]');
  await ann2.page.fill('dialog.mc-dialog [data-pn-pass]', PASS);
  await ann2.page.fill('dialog.mc-dialog [data-pn-again]', PASS);
  await ann2.page.click('dialog.mc-dialog button[data-key="ok"]');
  await ann2.page.waitForFunction((s) => window.markupcraft.store.everything().some((m) => m.comment === s && m.scope === 'private'), SECRET, { timeout: 20000 });
  ok(true, 'the passphrase opens it, through a colleague\'s save');
  ok(await ann2.page.evaluate(() => window.markupcraft.store.all().some((m) => m.text === 'BOBWORDS')), 'with the colleague\'s work kept');
  await ann2.ctx.close();

  ok(!problems.length, 'no console errors', problems);
  await ctx.close();
} finally {
  await browser.close();
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail ? 1 : 0);

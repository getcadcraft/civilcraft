#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-optionkeys.mjs — OPT.1 in CadCraft's lab build, headless: the OPTIONKEYS editor (letters of your own for command options), the
 * short form nobody defined, the "could be" line, and the letters surviving a reload. Engine checks: bin/test-cadcraft.mjs (OPT.1).
 *
 *   node tools/cadcraft-test/browser-optionkeys.mjs [--shots <dir>]
 *
 * Run as root (a session minted by `sudo -u www-data php tools/cadcraft-test/admin.php session` for the test admin). Cached Playwright
 * Chromium. What it proves that Node cannot: the page loads with the new module, the dialog opens from the real command line, a click on
 * a met option starts its line, Save applies and stores the file, and the prompt on screen shows the person's letters.
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
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
await ctx.addInitScript(() => { try { localStorage.setItem('cadcraft.tour', 'skipped'); localStorage.setItem('cc-newhere', 'skipped'); localStorage.removeItem('cadcraft.arrays.assoc'); if (!sessionStorage.getItem('ok-test')) { localStorage.removeItem('cadcraft.optionkeys'); sessionStorage.setItem('ok-test', '1'); } } catch {} });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(150); };
const history = () => page.evaluate(() => document.querySelector('[data-history]')?.textContent || '');
const screen = (x, y) => page.evaluate(([x, y]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const s = window.cadcraft.view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
const clickAt = async (x, y) => { const p = await screen(x, y); await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y); await page.waitForTimeout(150); };
const cc = (fn, arg) => page.evaluate(fn, arg);
const esc = async () => { await page.click('[data-cmd-input]'); await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.waitForTimeout(80); };
/** The colour the drawing canvas shows at a world point: [r, g, b, a]. */
const pixel = (x, y) => page.evaluate(([x, y]) => {
  const v = window.cadcraft.view, s = v.toScreen(x, y), d = v.dpr || 1;
  return [...v.base.getContext('2d').getImageData(Math.round((s.x + v.x0) * d), Math.round((s.y + v.y0) * d), 1, 1).data];
}, [x, y]);
const settle = () => page.waitForTimeout(350);

const promptText = () => page.evaluate(() => document.querySelector('[data-prompt]')?.textContent || '');
const line = async () => { await cc(() => { const d = window.cadcraft.doc; d.change('fixture', () => { for (const e of d.all()) d.remove(e.id); d.add({ type: 'line', x1: 0, y1: 0, x2: 100, y2: 0 }); }); }); };

try {
  console.log('\n== the page');
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.cadcraft.commands);
  await cc(() => { window.cadcraft.doc.meta.units = 'millimeters'; window.cadcraft.host.zoomWindow({ x: -300, y: -300 }, { x: 600, y: 300 }); });
  // OPT.2: the test admin's account copy of the file starts empty (a removal dated now), so an earlier run cannot answer for this one
  const token = async (pg) => { await pg.waitForFunction(() => !!window.ccAddonsAccount?.token, null, { timeout: 30000 }).catch(() => {}); return pg.evaluate(() => window.ccAddonsAccount?.token || ''); };
  const accountCopy = (pg) => pg.evaluate(async () => { const r = await fetch('/api/v1/prefs', { headers: { Authorization: 'Bearer ' + window.ccAddonsAccount.token }, credentials: 'omit', cache: 'no-store' }); const j = await r.json(); return j?.data?.prefs?.sections?.['keep:cadcraft.optionkeys'] || null; });
  const resetAccount = (pg) => pg.evaluate(async () => { const at = new Date().toISOString().replace(/\.\d+Z$/, 'Z'); const r = await fetch('/api/v1/prefs', { method: 'PUT', headers: { Authorization: 'Bearer ' + window.ccAddonsAccount.token, 'Content-Type': 'application/json' }, credentials: 'omit', body: JSON.stringify({ format: 'supercadcraft-prefs', version: 1, saved: at, sections: { 'keep:cadcraft.optionkeys': { at, keys: {} } } }) }); return r.status; });
  const signedIn = !!(await token(page));
  ok(signedIn, 'the lab tab holds its account key (the shell asked the site)');
  if (signedIn) { await resetAccount(page); await page.waitForTimeout(1100); }
  await line(); await settle();

  console.log('\n== a short form two options share is named; one that fits a single option is taken');
  await typeCmd('ARRAY'); await typeCmd('ALL'); await typeCmd(''); await typeCmd('R');
  await typeCmd('C');
  ok(/C could be .*COU.*COL/i.test((await history()).slice(-400)), 'C at the rectangular options: "could be COUnt, COLumns"', (await history()).slice(-200));
  await typeCmd('ZZ');
  ok(/OPTIONKEYS/.test((await history()).slice(-400)), 'letters no option has: the tip names OPTIONKEYS', (await history()).slice(-200));
  await esc();

  console.log('\n== OPTIONKEYS: the editor');
  await typeCmd('OPTIONKEYS');
  await page.waitForSelector('dialog.cc-optkeys[open][data-ready]');
  const ed = page.locator('dialog.cc-optkeys');
  const nCmds = await ed.locator('[data-optkeys-command] option').count();
  ok(nCmds > 150 && await ed.locator('[data-optkeys-command]').inputValue() === 'ARRAY', 'the editor lists every command with options (' + nCmds + ') and starts on the one just used', await ed.locator('[data-optkeys-command]').inputValue());
  const optTexts = await ed.locator('[data-optkeys-option] option').allTextContents();
  ok(optTexts.some((x) => /POlar\s+\(PO\)/.test(x)) && optTexts.some((x) => /COUnt\s+\(COU\)/.test(x)) && optTexts.some((x) => /Rectangular\s+\(R\)/.test(x)), 'its options are listed with their built-in letters', optTexts.slice(0, 4).join(' | '));
  ok(await ed.locator('[data-optkeys-empty]').isVisible() && !(await ed.locator('[data-optkeys-table]').isVisible()), 'with nothing added yet, the list says so (no copy of the built-in letters)');
  await ed.locator('[data-optkeys-option]').selectOption('PO');
  await ed.locator('[data-optkeys-letters]').fill('r');
  await ed.locator('[data-optkeys-addbtn]').click();
  ok(/R already answers Rectangular in ARRAY/.test(await ed.locator('[data-optkeys-addmsg]').textContent()) && !(await ed.locator('[data-optkeys-row]').count()), 'letters another option of that command already has are refused, and it says which', await ed.locator('[data-optkeys-addmsg]').textContent());
  await ed.locator('[data-optkeys-letters]').fill('');
  await ed.locator('[data-optkeys-addbtn]').click();
  ok(/Type the letters/.test(await ed.locator('[data-optkeys-addmsg]').textContent()), 'Add with no letters asks for them');
  await ed.locator('[data-optkeys-letters]').pressSequentially('mid');
  ok((await ed.locator('[data-optkeys-addmsg]').textContent()) === '', 'the message goes away as soon as letters are typed');
  await ed.locator('[data-optkeys-addbtn]').click();
  ok(/already reads/.test(await ed.locator('[data-optkeys-addmsg]').textContent()), 'an object snap word is refused as letters', await ed.locator('[data-optkeys-addmsg]').textContent());
  {   // the three controls and the button are one row of one height, on the dialog's own white
    const m2 = await page.evaluate(() => { const d = document.querySelector('dialog.cc-optkeys'); const q = (s0) => d.querySelector(s0); const b = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.height)]; }; const bg = (e) => getComputedStyle(e).backgroundColor;
      return { c: b(q('[data-optkeys-command]')), o: b(q('[data-optkeys-option]')), k: b(q('[data-optkeys-letters]')), a: b(q('[data-optkeys-addbtn]')), bgc: bg(q('[data-optkeys-command]')), bgk: bg(q('[data-optkeys-letters]')), dlg: bg(d) }; });
    ok(new Set([m2.c[0], m2.o[0], m2.k[0], m2.a[0]]).size === 1 && new Set([m2.c[1], m2.o[1], m2.k[1], m2.a[1]]).size === 1, 'Command, Option, Your letters and Add sit on one line at one height', JSON.stringify(m2));
    ok(m2.bgc === m2.dlg && m2.bgk === m2.dlg, 'the fields are the dialog\'s white, not grey', JSON.stringify([m2.bgc, m2.bgk, m2.dlg]));
  }
  await shot('optionkeys-fields');
  await ed.locator('[data-optkeys-letters]').fill('p');
  await ed.locator('[data-optkeys-addbtn]').click();
  ok(await ed.locator('[data-optkeys-row="ARRAY.PO"]').count() === 1 && (await ed.locator('[data-optkeys-letters]').inputValue()) === '', 'P for POlar is added, and the box is cleared', await ed.locator('[data-optkeys-addmsg]').textContent());
  await ed.locator('[data-optkeys-remove="ARRAY.PO,P"]').click();
  await ed.locator('[data-optkeys-option]').selectOption('PO');
  await ed.locator('[data-optkeys-letters]').fill('q');
  await ed.locator('[data-optkeys-addbtn]').click();
  ok(await ed.locator('[data-optkeys-row="ARRAY.PO"]').count() === 1 && /POlar/.test(await ed.locator('[data-optkeys-row="ARRAY.PO"]').textContent()) && /Q/.test(await ed.locator('[data-optkeys-row="ARRAY.PO"]').textContent()), 'Add puts the option in "Your letters" with its word, built-in letters and yours', await ed.locator('[data-optkeys-rows]').textContent());
  await ed.locator('[data-optkeys-option]').selectOption('COU');
  await ed.locator('[data-optkeys-letters]').fill('zz');
  await ed.locator('[data-optkeys-letters]').press('Enter');
  ok(await ed.locator('[data-optkeys-row]').count() === 2, 'Enter in the letters box adds too');
  await ed.locator('[data-optkeys-remove="ARRAY.COU,ZZ"]').click();
  ok(await ed.locator('[data-optkeys-row]').count() === 1 && await ed.locator('[data-optkeys-row="ARRAY.COU"]').count() === 0, 'the x on a row removes that one');
  await ed.locator('[data-optkeys-command]').selectOption('*');
  ok((await ed.locator('[data-optkeys-option] option').allTextContents()).some((x) => /eXit/.test(x) && /\(X\)/.test(x)), 'Every command lists each distinct option');
  await ed.locator('[data-optkeys-option]').selectOption('X');
  await ed.locator('[data-optkeys-letters]').fill('k');
  await ed.locator('[data-optkeys-addbtn]').click();
  ok(/Every command/.test(await ed.locator('[data-optkeys-row="*.X"]').textContent()), 'a letter for every command is one row');
  await shot('optionkeys-editor');
  await ed.locator('[data-optkeys-astext] summary').click();
  const text = await ed.locator('[data-optkeys-text]').inputValue();
  ok(/ARRAY\.PO, Q/.test(text) && /\*\.X, K/.test(text) && !/ARRAY\.COU/.test(text), 'Edit as text shows the same list as lines');
  await ed.locator('[data-optkeys-text]').focus();
  await page.keyboard.press('Control+End');
  await page.keyboard.type('NOPE.X, Z');
  await page.waitForTimeout(500);
  ok(/NOPE is not a command/.test(await page.locator('[data-optkeys-errors]').textContent()), 'a bad line typed as text is flagged', await page.locator('[data-optkeys-errors]').textContent());
  ok(await ed.locator('[data-optkeys-save]').isDisabled() && await ed.locator('[data-optkeys-blocked]').isVisible(), 'Save is off while a line can\'t be used, and it says so');
  for (let i = 0; i < 9; i++) await page.keyboard.press('Backspace');
  await page.keyboard.type('ARRAY.COU, R');
  await page.waitForTimeout(500);
  ok(/R already answers Rectangular in ARRAY/.test(await page.locator('[data-optkeys-errors]').textContent()) && await ed.locator('[data-optkeys-save]').isDisabled(), 'a collision typed as text is named, and Save stays off', await page.locator('[data-optkeys-errors]').textContent());
  for (let i = 0; i < 12; i++) await page.keyboard.press('Backspace');
  await page.keyboard.type('NOPE.X, Z');
  await page.waitForTimeout(500);
  for (let i = 0; i < 9; i++) await page.keyboard.press('Backspace');
  await page.waitForTimeout(500);
  ok((await page.locator('[data-optkeys-errors] li').count()) === 0 && await ed.locator('[data-optkeys-row]').count() === 2, 'the corrected file has no errors and two rows');
  ok(!(await ed.locator('[data-optkeys-save]').isDisabled()) && !(await ed.locator('[data-optkeys-blocked]').isVisible()), 'with nothing listed, Save is on again');
  await page.click('[data-optkeys-save]');
  await page.waitForSelector('dialog.cc-optkeys', { state: 'detached' });
  ok(/Option letters reloaded: 2 of your own/.test((await history()).slice(-300)), 'Save applies the file: 2 letters', (await history()).slice(-200));
  ok(/ARRAY\.PO, Q/.test(await cc(() => localStorage.getItem('cadcraft.optionkeys') || '')), 'the file is kept in this browser');

  console.log('\n== the letters at the real command line');
  await line();
  await typeCmd('ARRAY'); await typeCmd('ALL'); await typeCmd('');
  ok(/\(Q\)/.test(await promptText()), 'the prompt shows (Q) after the polar option', await promptText());
  await shot('optionkeys-prompt');
  await typeCmd('q');
  ok(/center point of array/i.test(await promptText() + (await history()).slice(-300)), 'Q answers POlar: the centre is asked');
  await typeCmd('0,0'); await typeCmd('k');
  ok(await cc(() => window.cadcraft.doc.count() >= 6) && !(await cc(() => window.cadcraft.engine?.running || null)), 'K (the * line) answers eXit: six copies made', String(await cc(() => window.cadcraft.doc.count())));

  console.log('\n== after a reload');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.cadcraft.commands);
  await line();
  await typeCmd('ARRAY'); await typeCmd('ALL'); await typeCmd('');
  ok(/\(Q\)/.test(await promptText()), 'the letters are loaded at start', await promptText());
  await typeCmd('PO');
  ok(/center point of array/i.test(await promptText() + (await history()).slice(-300)), 'the built-in PO still works beside Q');
  await esc();

  console.log('\n== Settings > CadCraft > Option letters: edit, import, export');
  await page.click('[data-settings-open] >> visible=true');
  await page.waitForSelector('dialog[data-app-settings][open]');
  { const tab = await page.$('dialog[data-app-settings] [data-settings-tab="app"]'); if (tab) await tab.click(); }
  const box = page.locator('dialog[data-app-settings] [data-optkeys-settings]');
  await page.click('dialog[data-app-settings] .shell-sec-nav button:text-is("Option letters") >> visible=true');
  await box.scrollIntoViewIfNeeded();
  ok(/2 option letters of your own are in use/.test(await box.locator('[data-optkeys-count]').textContent()), 'the block says how many letters are in use', await box.locator('[data-optkeys-count]').textContent());
  await shot('optionkeys-settings');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), box.locator('[data-optkeys-export]').click()]);
  const saved = dl ? fs.readFileSync(await dl.path(), 'utf8') : await cc(() => window.__okSaved || '');
  ok(/ARRAY\.PO,\s+Q/.test(saved) && /\*\.X,\s+K/.test(saved), 'Export saves the letters as a text file', saved.slice(0, 160));
  const imp = path.join(fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'ok-')), 'letters.txt');
  fs.writeFileSync(imp, '; shared file\nARRAY.PO, W\nARRAY.R, V\n*.X, K\nNOPE.X, Z\n');
  { const [chooser] = await Promise.all([page.waitForEvent('filechooser'), box.locator('[data-optkeys-import]').click()]); await chooser.setFiles(imp); }
  await page.waitForFunction(() => /was not imported/.test(document.querySelector('[data-optkeys-count]')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});
  const after = await box.locator('[data-optkeys-count]').textContent();
  ok(/2 option letters of your own are in use/.test(after) && /was not imported: 1 line/.test(after) && /ARRAY\.PO, Q/.test(await cc(() => localStorage.getItem('cadcraft.optionkeys') || '')), 'Import in Settings refuses a file with a line that collides or can\'t be used: nothing changes', after);
  fs.writeFileSync(imp, '; shared file\nARRAY.PO, W\nARRAY.R, V\n*.X, K\n');
  { const [chooser] = await Promise.all([page.waitForEvent('filechooser'), box.locator('[data-optkeys-import]').click()]); await chooser.setFiles(imp); }
  await page.waitForFunction(() => /3 option letters/.test(document.querySelector('[data-optkeys-count]')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});
  ok(/3 option letters of your own are in use/.test(await box.locator('[data-optkeys-count]').textContent()), 'a clean file replaces yours: 3 letters', await box.locator('[data-optkeys-count]').textContent());
  ok(/ARRAY\.PO, Q/.test(await cc(() => localStorage.getItem('cadcraft.optionkeys.previous') || '')), 'the file before the import is kept beside it');
  const bad = path.join(path.dirname(imp), 'empty.txt');
  fs.writeFileSync(bad, 'hello\n');
  { const [chooser] = await Promise.all([page.waitForEvent('filechooser'), box.locator('[data-optkeys-import]').click()]); await chooser.setFiles(bad); }
  await page.waitForTimeout(400);
  ok(/ARRAY\.PO, W/.test(await cc(() => localStorage.getItem('cadcraft.optionkeys') || '')) && /nothing was changed/.test(await box.locator('[data-optkeys-count]').textContent()), 'a file with no usable line changes nothing, and says so', await box.locator('[data-optkeys-count]').textContent());
  await box.locator('[data-optkeys-edit]').click();
  await page.waitForSelector('dialog.cc-optkeys[open]');
  ok(/ARRAY\.PO, W/.test(await page.locator('[data-optkeys-text]').inputValue()) && !(await page.locator('dialog[data-app-settings][open]').count()), 'Edit closes Settings and opens the editor on the imported file');
  await page.keyboard.press('Escape');
  await page.waitForSelector('dialog.cc-optkeys', { state: 'detached' });
  await line();
  await typeCmd('ARRAY'); await typeCmd('ALL'); await typeCmd(''); await typeCmd('w');
  ok(/center point of array/i.test(await promptText() + (await history()).slice(-300)), 'the imported letters work at the command line (W = POlar)');
  await esc();

  console.log('\n== OPT.2: the file follows the account');
  await page.waitForTimeout(1500);
  const up = await accountCopy(page);
  ok(up && /ARRAY\.PO, W/.test(up.keys?.['cadcraft.optionkeys'] || ''), 'the account settings document holds the file as its own section', JSON.stringify(up).slice(0, 200));
  ok(up && up.previous && /ARRAY\.PO, Q/.test(up.previous.keys?.['cadcraft.optionkeys'] || ''), 'the account keeps the copy before it once (previous)');
  await page.click('[data-settings-open] >> visible=true');
  await page.waitForSelector('dialog[data-app-settings][open]');
  { const tab = await page.$('dialog[data-app-settings] [data-settings-tab="app"]'); if (tab) await tab.click(); }
  await page.click('dialog[data-app-settings] .shell-sec-nav button:text-is("Option letters") >> visible=true');
  await page.waitForFunction(() => /follow you to your other devices/.test(document.querySelector('[data-optkeys-account]')?.textContent || ''), null, { timeout: 8000 }).catch(() => {});
  ok(/Kept with your account/.test(await page.locator('[data-optkeys-account]').textContent()), 'Settings says the letters are kept with the account', await page.locator('[data-optkeys-account]').textContent());
  await shot('optionkeys-account');
  await page.keyboard.press('Escape');
  // another device: the same account, a browser that has never seen the file
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  await ctx2.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx2.addInitScript(() => { try { localStorage.setItem('cadcraft.tour', 'skipped'); localStorage.setItem('cc-newhere', 'skipped'); } catch {} });
  const page2 = await ctx2.newPage();
  await page2.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page2.waitForFunction(() => !!window.cadcraft && !!window.cadcraft.commands);
  await page2.waitForFunction(() => /ARRAY\.PO, W/.test(localStorage.getItem('cadcraft.optionkeys') || ''), null, { timeout: 45000 }).catch(() => {});
  const hist2 = await page2.evaluate(() => document.querySelector('[data-history]')?.textContent || '');
  ok(/ARRAY\.PO, W/.test(await page2.evaluate(() => localStorage.getItem('cadcraft.optionkeys') || '')) && /Option letters from your account: 3 of your own/.test(hist2), 'a second browser on the same account gets the file by itself, and says so', hist2.slice(-200));
  await page2.evaluate(() => { const d = window.cadcraft.doc; d.change('fixture', () => d.add({ type: 'line', x1: 0, y1: 0, x2: 100, y2: 0 })); });
  for (const s2 of ['ARRAY', 'ALL', '']) { await page2.click('[data-cmd-input]'); await page2.keyboard.type(s2); await page2.keyboard.press('Enter'); await page2.waitForTimeout(150); }
  ok(/\(W\)/.test(await page2.evaluate(() => document.querySelector('[data-prompt]')?.textContent || '')), 'and its prompt shows the letters at once, no restart', await page2.evaluate(() => document.querySelector('[data-prompt]')?.textContent || ''));
  await resetAccount(page2);
  await ctx2.close();

  console.log('\n== the help topic');
  const res = await page.request.get(BASE + '/tutorials/cadcraft/option-letters');
  const html = res.ok() ? await res.text() : '';
  ok(res.status() === 200 && /Give command options your own letters/.test(html) && /test build/.test(html), 'a lab viewer reads the topic on the site, marked as the test build', String(res.status()));
  const anon = await (await browser.newContext({ serviceWorkers: 'block' })).request.get(BASE + '/tutorials/cadcraft/option-letters').catch(() => null);
  ok(anon && anon.status() === 404, 'signed out, the unreleased topic is a 404', anon ? String(anon.status()) : 'no answer');
  await cc(() => { localStorage.removeItem('cadcraft.optionkeys'); localStorage.removeItem('cadcraft.optionkeys.previous'); });
  ok(!problems.length, 'no page errors', problems.slice(0, 3).join(' | '));
} catch (e) { fail++; console.log('  FAIL stopped: ' + e.message); await shot('optionkeys-stopped'); }
await browser.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

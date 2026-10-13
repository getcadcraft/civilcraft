#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-lisp.mjs — APPLOAD, LISP routines, their dialogs, the aliases file and DELBLOCKS in /lab/cadcraft (0.4 track Y;
 * session cad-lisp). Run as root (it uses `sudo -u www-data php tools/cadcraft-test/lisp-admin.php up|down` for its own test
 * admin, and root's Playwright Chromium).
 *
 *   node tools/cadcraft-test/browser-lisp.mjs [--shots dir]
 *
 * The command line's "(…" and "!x"; APPLOAD (load a corpus routine through the file chooser, a refused .fas, the Startup
 * Suite, the history); the routine's command with prompts and one Undo; a routine running in a worker, and Esc stopping a
 * loop; a dropped .lsp; ALIASEDIT (save, then the alias works, kept after a reload with the Startup Suite); the built-in
 * DELBLOCKS with its list; Lee Mac's DelBlocks with its own DCL dialog when it is on this machine (never in the repo);
 * the toolbar still two rows at 1440 px; no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const CORPUS = path.join(REPO, 'tools/cadcraft-test/lisp');
const LEEMAC = '/var/www/CADCRAFT/testfiles/lisp/leemac/DeleteBlocksV1-1.lsp';
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
const adminPhp = path.join(REPO, 'tools/cadcraft-test/lisp-admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
const tmp = fs.mkdtempSync('/tmp/cc-lisp-');

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

const all = () => page.evaluate(() => window.cadcraft.doc.all().map((e) => ({ ...e })));
const history = () => page.$$eval('.cc-history li', (ls) => ls.map((l) => l.textContent));
const lastLines = async (n = 6) => (await history()).slice(-n);
const typeCmd = async (s, wait = 120) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(wait); };
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const idle = () => page.waitForFunction(() => !window.cadcraft.engine.busy, null, { timeout: 15000 });
const openMore = async (group) => { await page.click('details[data-group-menu="' + group + '"] > summary'); await page.waitForTimeout(80); };

async function openLab() {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host);
  await page.waitForTimeout(300);
}

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await openLab();
  await page.evaluate(() => { for (const k of ['cadcraft.lisp.startup', 'cadcraft.lisp.history', 'cadcraft.aliases']) { try { localStorage.removeItem(k); } catch { /* fine */ } } });
  await openLab();
  const installed = await page.evaluate(() => !!window.cadcraft.lisp);
  ok(installed, 'LISP is installed in the page (commands.js installs lisp/install.js)');
  if (!installed) throw new Error('stop: commands.js does not install lisp/install.js yet');

  console.log('\n== the toolbar');
  const rows = await page.evaluate(() => new Set([...document.querySelectorAll('.cc-tools > .cc-tool-group')].map((g) => Math.round(g.getBoundingClientRect().top))).size);
  ok(rows === 2, 'the toolbar is still two rows at 1440 px', rows + ' rows');

  console.log('\n== the command line');
  await typeCmd('(+ 1 2)', 400);
  await idle();
  ok((await lastLines()).includes('3'), '(+ 1 2) prints 3', (await lastLines()).join(' | '));
  await typeCmd('(setq w (* 2 21))', 300); await idle();
  await typeCmd('!w', 300); await idle();
  ok((await lastLines(2)).includes('42'), '!w prints 42');
  await typeCmd('(defun sq (x)', 150);
  ok((await page.textContent('[data-prompt]')).includes('(_>'), 'an open expression waits for the next line', await page.textContent('[data-prompt]'));
  await typeCmd('(* x x))', 300); await idle();
  await typeCmd('(sq 9)', 300); await idle();
  ok((await lastLines(2)).includes('81'), 'and finishes on the next line');
  ok(await page.evaluate(() => window.cadcraft.lisp.runner?.worker === true), 'LISP runs in a worker');
  await typeCmd('CIRCLE', 150); await typeCmd('0,0', 150); await typeCmd('(* 2 2.5)', 400); await idle();
  ok((await all()).some((e) => e.type === 'circle' && Math.abs(e.r - 5) < 1e-9), 'an expression answers a prompt: radius (* 2 2.5) = 5');

  console.log('\n== APPLOAD');
  await openMore('View');
  await page.click('details[data-group-menu="View"] [data-cmd="APPLOAD"]');
  await page.waitForSelector('dialog.cc-appload[open]');
  ok(true, 'View › More › Load application opens the dialog');
  let chooser = page.waitForEvent('filechooser');
  await page.click('[data-al-load]');
  await (await chooser).setFiles(path.join(CORPUS, 'point-grid.lsp'));
  await page.waitForFunction(() => document.querySelector('[data-al-loaded]')?.textContent.includes('PTGRID'), null, { timeout: 15000 });
  ok(true, 'point-grid.lsp loads; Loaded applications lists PTGRID');
  const fas = path.join(tmp, 'secret.fas');
  fs.writeFileSync(fas, 'FAS4-FILE');
  chooser = page.waitForEvent('filechooser');
  await page.click('[data-al-load]');
  await (await chooser).setFiles(fas);
  await page.waitForTimeout(300);
  ok((await page.textContent('.cc-al-msg')).includes('compiled or protected LISP'), 'a .fas is refused with the reason', await page.textContent('.cc-al-msg'));
  await page.click('[data-al-startup="point-grid.lsp"]');
  await page.waitForTimeout(150);
  ok((await page.textContent('[data-al-startup]')).includes('point-grid.lsp'), 'Add to Startup Suite');
  ok((await page.textContent('[data-al-history]')).includes('point-grid.lsp'), 'the history lists it');
  await shot('01-appload');
  await page.click('[data-al-close]');
  await page.waitForSelector('dialog.cc-appload', { state: 'detached' });
  await idle();

  console.log('\n== a routine\'s command');
  const before = (await all()).length;
  await typeCmd('PTGRID', 300);
  for (const a of ['3', '2', '10', '1,1']) await typeCmd(a, 250);
  await idle();
  const pts = (await all()).filter((e) => e.type === 'point');
  ok(pts.length === 6 && pts.some((p) => p.x === 21 && p.y === 11), 'PTGRID: prompts on the command line, 6 points', pts.length);
  await page.keyboard.press('Control+z'); await page.waitForTimeout(200);
  ok((await all()).length === before, 'one Ctrl+Z takes the whole routine back');

  console.log('\n== Esc stops a busy routine');
  await typeCmd('(while t (setq zz 1))', 500);
  ok(await page.evaluate(() => window.cadcraft.lisp.busy), 'a loop is running');
  const t0 = Date.now();
  await page.keyboard.press('Escape');
  await idle();
  ok(Date.now() - t0 < 3000 && (await lastLines()).some((l) => l === 'The routine was stopped.'), 'Esc stops it and says so', (await lastLines()).join(' | '));
  await typeCmd('(+ 2 2)', 600); await idle();
  ok((await lastLines(2)).includes('4'), 'the next expression runs (a new worker)');
  await typeCmd('(c:ptgrid)', 300);
  ok(await page.evaluate(() => !!window.cadcraft.engine.waiting), 'the loaded routine is still there after the stop');
  await page.keyboard.press('Escape'); await idle();

  console.log('\n== a dropped .lsp');
  const dropped = fs.readFileSync(path.join(CORPUS, 'text-upper.lsp'), 'utf8');
  await page.evaluate((text) => {
    const dt = new DataTransfer();
    dt.items.add(new File([text], 'text-upper.lsp', { type: 'text/plain' }));
    const stage = document.querySelector('[data-over]').closest('.cc-stage') || document.querySelector('[data-over]').parentElement;
    for (const type of ['dragenter', 'dragover', 'drop']) stage.dispatchEvent(new DragEvent(type, { dataTransfer: dt, bubbles: true, cancelable: true }));
  }, dropped);
  await page.waitForTimeout(800); await idle();
  ok((await lastLines()).some((l) => /Loaded text-upper\.lsp: 1 command, TXTUPPER/.test(l)), 'dropping a .lsp on the drawing loads it', (await lastLines()).join(' | '));

  console.log('\n== ALIASEDIT');
  await openMore('View');
  await page.click('details[data-group-menu="View"] [data-cmd="ALIASEDIT"]');
  await page.waitForSelector('dialog.cc-aliases[open]');
  await page.fill('[data-alias-text]', 'QQ, *CIRCLE\nPG, *PTGRID\nXX, *NOSUCH\n');
  await page.waitForTimeout(450);
  ok((await page.textContent('[data-alias-errors]')).includes('Line 3'), 'errors listed by line while typing', await page.textContent('[data-alias-errors]'));
  await shot('02-aliases');
  await page.click('[data-alias-save]');
  await page.waitForSelector('dialog.cc-aliases', { state: 'detached' });
  await idle();
  await typeCmd('QQ', 200);
  ok(await page.evaluate(() => window.cadcraft.engine.running === 'CIRCLE'), 'QQ runs CIRCLE');
  await page.keyboard.press('Escape'); await idle();
  await typeCmd('PG', 200);
  ok(await page.evaluate(() => window.cadcraft.engine.running === 'PTGRID'), 'an alias reaches a routine\'s command');
  await page.keyboard.press('Escape'); await idle();

  console.log('\n== after a reload: the Startup Suite and the aliases');
  await openLab();
  await page.waitForFunction(() => window.cadcraft.lisp?.loaded?.has('point-grid.lsp'), null, { timeout: 15000 });
  ok(true, 'the Startup Suite loaded point-grid.lsp again');
  await idle();
  await typeCmd('QQ', 200);
  ok(await page.evaluate(() => window.cadcraft.engine.running === 'CIRCLE'), 'the aliases file is kept');
  await page.keyboard.press('Escape'); await idle();

  console.log('\n== DELBLOCKS');
  const makeBlocks = '(foreach n \'("ALPHA" "BETA" "GAMMA") (entmake (list \'(0 . "BLOCK") (cons 2 n) \'(10 0.0 0.0 0.0) \'(70 . 0))) (entmake \'((0 . "CIRCLE") (10 0.0 0.0 0.0) (40 . 1.0))) (entmake \'((0 . "ENDBLK"))))'
    + ' (entmake \'((0 . "INSERT") (2 . "ALPHA") (10 0.0 0.0 0.0))) (entmake \'((0 . "INSERT") (2 . "BETA") (10 10.0 0.0 0.0))) (entmake \'((0 . "INSERT") (2 . "GAMMA") (10 20.0 0.0 0.0)))';
  await typeCmd(makeBlocks, 600); await idle();
  ok(await page.evaluate(() => ['ALPHA', 'BETA', 'GAMMA'].every((n) => window.cadcraft.doc.blocks.has(n))), 'three blocks made with entmake');
  await openMore('Blocks');
  await page.click('details[data-group-menu="Blocks"] [data-cmd="DELBLOCKS"]');
  await page.waitForTimeout(200);
  await typeCmd('N', 300);
  await page.waitForSelector('dialog.cc-db[open]');
  await page.fill('[data-db-filter]', 'ta');
  await page.waitForTimeout(100);
  const opts = await page.$$eval('[data-db-list] option', (o) => o.map((x) => x.value));
  ok(opts.join(',') === 'BETA', 'the list filters (ta → BETA)', opts.join(','));
  await page.selectOption('[data-db-list]', ['BETA']);
  await shot('03-delblocks');
  await page.click('[data-db-ok]');
  await page.waitForTimeout(300);
  await typeCmd('', 300); await idle();
  ok(await page.evaluate(() => !window.cadcraft.doc.blocks.has('BETA') && window.cadcraft.doc.blocks.has('ALPHA')), 'DELBLOCKS deleted BETA (and only BETA)');
  ok((await lastLines(8)).some((l) => /Deleted block BETA and its 1 reference\./.test(l)), 'and said so', (await lastLines(8)).join(' | '));

  if (fs.existsSync(LEEMAC)) {
    console.log('\n== Lee Mac DelBlocks (local file, never in the repo)');
    await openMore('View');
    await page.click('details[data-group-menu="View"] [data-cmd="APPLOAD"]');
    await page.waitForSelector('dialog.cc-appload[open]');
    chooser = page.waitForEvent('filechooser');
    await page.click('[data-al-load]');
    await (await chooser).setFiles(LEEMAC);
    await page.waitForFunction(() => document.querySelector('[data-al-loaded]')?.textContent.includes('DELBLOCKS'), null, { timeout: 15000 }).catch(() => {});
    const shadow = (await page.textContent('.cc-al-msg')) || '';
    ok(/DeleteBlocksV1-1\.lsp/.test(shadow), 'loads (its DELBLOCKS stays the routine\'s own: (c:delblocks))', shadow);
    await page.click('[data-al-close]');
    await idle();
    await typeCmd('(c:delblocks)', 400);
    await typeCmd('N', 600);
    await page.waitForSelector('dialog.cc-dcl[open]', { timeout: 10000 });
    ok((await page.textContent('dialog.cc-dcl h2')) === 'Select Blocks to Delete', 'its DCL dialog shows with its title');
    const items = await page.$$eval('dialog.cc-dcl select option', (o) => o.map((x) => x.textContent));
    ok(items.join(',') === 'ALPHA,GAMMA', 'its list box lists the blocks', items.join(','));
    await page.fill('dialog.cc-dcl input[type=text]', '*GAM*');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => [...document.querySelectorAll('dialog.cc-dcl select option')].map((o) => o.textContent).join(',') === 'GAMMA', null, { timeout: 5000 }).catch(() => {});
    ok((await page.$$eval('dialog.cc-dcl select option', (o) => o.map((x) => x.textContent))).join(',') === 'GAMMA', 'its filter works (the routine\'s action_tile)');
    await shot('04-leemac-dcl');
    await page.click('dialog.cc-dcl button.btn-plot');
    await page.waitForSelector('dialog.cc-dcl', { state: 'detached', timeout: 5000 });
    await idle();   // the routine's Name path ends after the dialog (no Enter: it would repeat the last command)
    ok(await page.evaluate(() => !window.cadcraft.doc.blocks.has('GAMMA')), 'GAMMA deleted through the routine');
    ok((await lastLines(10)).some((l) => l === 'Deleted block GAMMA.'), 'the routine says "Deleted block GAMMA."', (await lastLines(10)).join(' | '));
  } else console.log('  (Lee Mac DelBlocks skipped: not on this machine)');

  await shot('05-end');
  ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
} catch (err) {
  ok(false, 'ran to the end', err.message);
  if (problems.length) console.log(problems.slice(0, 8).join('\n'));
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

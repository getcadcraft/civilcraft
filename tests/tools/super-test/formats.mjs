// SPDX-License-Identifier: Apache-2.0
// Super: the two project files. Save writes a .supercad (SQLite) and a .ccproject (zip) from ONE counted save; either one opens; "Project file formats" chooses
// which are written and keeps the comparison log (owner 2026-11-12: "make .supercad the file the app saves … managing both file types concurrently so that I can
// monitor and compare use cases"). super-supercad.js + super-formats-ui.js.
//   node tools/super-test/formats.mjs [--shots <dir>]
process.env.SUPER_TEST_FORMATS = '1';   // the real default (both files); the harness gives the older suites the zip only
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import { pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
const { start, launch } = await import('./serve.mjs');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const P = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/apps/supercadcraft/dev/super-project.js')));
const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : '';
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'super-formats-'));
const { url, close } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch({ width: 1500, height: 950 });
const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(String(e.message)));
const noTour = async () => { const b = await page.waitForSelector('.nh-offer [data-k="no"]', { timeout: 2500 }).catch(() => null); if (b) await b.click().catch(() => {}); };
const status = () => page.evaluate(() => document.querySelector('.sc-status .sc-msg')?.textContent || document.querySelector('.sc-status')?.textContent || '');
const until = (re, ms = 60000) => page.waitForFunction(s => new RegExp(s).test(document.querySelector('.sc-status')?.textContent || ''), re.source, { timeout: ms }).then(() => true, () => false);
await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await noTour();

/* ---- a small project, made as a .ccproject outside the page, opened through the window's own Open ---- */
const enc = s => new TextEncoder().encode(s);
const seed = P.newProject('Formats');
P.addMember(seed, { app: 'cadcraft', name: 'plan.dxf', bytes: enc('0\nSECTION\n2\nENTITIES\n0\nLINE\n8\n0\n10\n0\n20\n0\n11\n10\n21\n5\n0\nENDSEC\n0\nEOF\n') });
P.extSet(seed, 'notes-tasks', 'keep.json', enc('{"kept":true}'));
const seedFile = path.join(TMP, 'Formats.ccproject'); fs.writeFileSync(seedFile, P.toBytes(seed, {}));
await page.setInputFiles('[data-sc-open-input]', seedFile);
ok(await until(/Opened Formats/), 'the .ccproject opens: ' + await status());
ok(await page.evaluate(() => window.superWindow.formats.pref) === 'supercad', 'Save writes the .supercad unless the person chose otherwise (owner 2026-11-21)');
const downloads = []; page.on('download', d => downloads.push(d));
/* ---- the default: one .supercad ---- */
await page.click('[data-act="save"]');
ok(await until(/Saved Formats\.supercad with/, 120000), 'by default one save writes the .supercad only: ' + await status());
await page.waitForTimeout(800);
ok(JSON.stringify(downloads.map(d => d.suggestedFilename())) === JSON.stringify(['Formats.supercad']), 'one download, the .supercad: ' + downloads.map(d => d.suggestedFilename()).join(', '));
downloads.length = 0;
/* ---- Save: two files from one save (the person chose both, to compare) ---- */
await page.evaluate(() => window.superWindow.formats.setPref('both'));
await page.click('[data-act="save"]');
ok(await until(/Saved Formats\.supercad and Formats\.ccproject/, 120000), 'the status names both files: ' + await status());
await page.waitForTimeout(800);
const names = downloads.map(d => d.suggestedFilename()).sort();
ok(JSON.stringify(names) === JSON.stringify(['Formats.ccproject', 'Formats.supercad']), 'two downloads, one of each: ' + names.join(', '));
const files = {}; for (const d of downloads) { const f = path.join(TMP, 'saved', d.suggestedFilename()); await d.saveAs(f); files[path.extname(f)] = f; }
const log1 = await page.evaluate(() => window.superWindow.formats.log);
const s1 = log1.filter(e => e.op === 'save').at(-1);
ok(s1 && s1.same === true && s1.supercad.bytes > 0 && s1.ccproject.bytes > 0 && s1.rev === 3, 'the log has the save: both sizes, read back as the same project, one revision counted (the default save before it was revision 2): ' + JSON.stringify(s1));
ok(log1.some(e => e.op === 'open' && e.format === 'ccproject'), 'and the open of the .ccproject');
if (files['.supercad']) {
  ok(fs.statSync(files['.supercad']).size === s1.supercad.bytes && fs.statSync(files['.ccproject']).size === s1.ccproject.bytes, 'the files on disk are the sizes the log says');
  const db = new DatabaseSync(files['.supercad'], { readOnly: true });
  ok(db.prepare('PRAGMA application_id').get().application_id === 1396916548 && db.prepare('PRAGMA integrity_check').get().integrity_check === 'ok', 'the downloaded .supercad is a sound SQLite file that says SCAD');
  const mem = db.prepare(`SELECT app, path FROM proj_member WHERE role != 'process' ORDER BY sort`).all().map(r => r.app + ' ' + r.path);
  ok(mem.includes('cadcraft Drawings/2D/plan.dxf'), 'its member table lists the drawing: ' + mem.join(', '));
  ok(db.prepare(`SELECT COUNT(*) n FROM proj_ext WHERE path = 'Data/notes-tasks/keep.json'`).get().n === 1, 'and the plug-in file that came in with the project');
  ok(db.prepare('SELECT MAX(rev) r FROM sc_change').get().r === 3, 'and the save log up to this save');
  const zip = await P.fromBytes(new Uint8Array(fs.readFileSync(files['.ccproject'])));
  ok(zip.project.revision === 3 && zip.project.members.length === db.prepare(`SELECT COUNT(*) n FROM proj_member WHERE role != 'process'`).get().n, 'the .ccproject of the same save has the same revision and member count');
  db.close();
}

/* ---- the .supercad opens (by what it is, not its name) ---- */
await page.evaluate(() => window.superWindow.newProject && window.superWindow.newProject('Other'));
await page.setInputFiles('[data-sc-open-input]', files['.supercad']);
ok(await until(/Opened Formats: \d+ files/), 'the .supercad opens through the same Open: ' + await status());
const disguised = path.join(TMP, 'Disguised.ccproject'); fs.copyFileSync(files['.supercad'], disguised);
await page.setInputFiles('[data-sc-open-input]', disguised);
ok(await until(/Opened Formats: \d+ files/), 'a .supercad under the other extension still opens');
const log2 = await page.evaluate(() => window.superWindow.formats.log);
ok(log2.filter(e => e.op === 'open' && e.format === 'supercad' && e.skipped === 0).length === 2, 'both opens are logged as .supercad with nothing left out');
const junk = path.join(TMP, 'Junk.supercad'); fs.writeFileSync(junk, 'SQLite format 3\0 but not really');
await page.setInputFiles('[data-sc-open-input]', junk);
ok(await until(/Junk\.supercad is not a SuperCad Studio project/), 'a file that only looks like one is refused politely: ' + await status());

/* ---- the dialog: the choice and the list ---- */
await page.evaluate(() => window.superWindow.formats.show());
await page.waitForSelector('[data-sc-formats][open]');
const dlg = await page.evaluate(() => { const d = document.querySelector('[data-sc-formats]'); return { rows: d.querySelectorAll('[data-fmt-row]').length, saves: d.querySelectorAll('[data-fmt-row="save"]').length, text: d.textContent, checked: d.querySelector('input[name="sc-fmt"]:checked').value, w: d.getBoundingClientRect().width, vw: innerWidth }; });
ok(dlg.rows === log2.length && dlg.saves === 2 && dlg.checked === 'both', 'the dialog lists every save and open, newest first, and shows the choice: ' + dlg.rows + ' rows');
ok(/Same project in both/.test(dlg.text) && /Saves that wrote both files: 1\./.test(dlg.text), 'with the result of the comparison and the totals');
if (shots) { fs.mkdirSync(shots, { recursive: true }); await page.screenshot({ path: path.join(shots, 'formats-dialog.png') }); }
await page.check('[data-sc-formats] input[value="supercad"]');
ok(await page.evaluate(() => window.superWindow.formats.pref === 'supercad' && localStorage.getItem('cc-super-file-format') === 'supercad'), 'choosing is remembered on this computer');
await page.click('[data-fmt-close]');
downloads.length = 0;
await page.click('[data-act="save"]');
ok(await until(/Saved Formats\.supercad with/, 120000), 'now Save writes the .supercad alone: ' + await status());
await page.waitForTimeout(600);
ok(downloads.length === 1 && downloads[0].suggestedFilename() === 'Formats.supercad', 'one download: ' + downloads.map(d => d.suggestedFilename()).join(', '));
await page.evaluate(() => window.superWindow.formats.setPref('ccproject'));
downloads.length = 0; await page.click('[data-act="save"]');
ok(await until(/Saved Formats\.ccproject with/, 120000), 'and the .ccproject alone when that is chosen');
await page.waitForTimeout(600);
ok(downloads.length === 1 && downloads[0].suggestedFilename() === 'Formats.ccproject', 'one download: ' + downloads.map(d => d.suggestedFilename()).join(', '));

/* ---- not shown to people (owner 2026-11-12): no button on Home, no command; the window still opens through window.superWindow.formats (a release or profile setting drives it) ---- */
await page.evaluate(() => { window.superWindow.home.show('projects'); });
ok(await page.$('[data-home-act="formats"]') === null, 'Home has no Project file formats button');
await page.evaluate(() => window.superWindow.formats.show());
ok(await page.waitForSelector('[data-sc-formats][open]').then(() => true, () => false), 'the Project file formats window still opens from the window API');
await page.setViewportSize({ width: 390, height: 800 }); await page.waitForTimeout(300);
const small = await page.evaluate(() => { const d = document.querySelector('[data-sc-formats]').getBoundingClientRect(); return { l: d.left, r: d.right, vw: innerWidth }; });
ok(small.l >= 0 && small.r <= small.vw + 1, 'the dialog fits a phone screen: ' + JSON.stringify(small));
if (shots) await page.screenshot({ path: path.join(shots, 'formats-dialog-phone.png') });
ok(errors.length === 0, 'no page error: ' + errors.join('; '));
await browser.close(); await close(); fs.rmSync(TMP, { recursive: true, force: true });
console.log(`${fail ? 'FAILED' : 'ok'}: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);

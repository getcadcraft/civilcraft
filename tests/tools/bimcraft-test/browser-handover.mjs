#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-handover.mjs: BK.114 handover documents in the real page, /lab, headless (session bk-stages-10):
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-handover.mjs [--shots <dir>]      run as root (a test admin session)
 * Assets tab › Handover documents: add a linked completion certificate and an occupancy certificate with an attached file, edit,
 * open, remove; build the handover package (a real zip, unpacked here); save the IFC, open it again, attach the file again.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimhandover'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const throttled = new Set();
page.on('response', (r) => { if (r.status() === 429) throttled.add(r.url()); });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-handover-'));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const statusText = () => page.textContent('[data-status]');
const noOffer = () => page.evaluate(() => document.querySelector('.nh-offer [data-k="no"]')?.click());   // the "new here?" offer comes up after a while and sits over the right panel's foot
const download = async (fn) => { await noOffer(); const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), fn()]); const f = path.join(TMP, dl.suggestedFilename()); await dl.saveAs(f); return { name: dl.suggestedFilename(), file: f, bytes: fs.readFileSync(f) }; };
const tab = async (name) => { await page.click(`[data-rtab="${name}"]`); await page.waitForSelector(`[data-rpane="${name}"]:not([hidden])`); };
const docs = () => page.evaluate(() => [...document.querySelectorAll('[data-ho-list] > li')].map((li) => ({ rel: li.dataset.hoDoc, kind: li.dataset.hoKind, text: li.textContent })));
const openSection = async () => { if (!(await page.evaluate(() => document.querySelector('[data-ho]')?.open))) await page.click('[data-ho] > summary'); };
const PDF = Buffer.from('%PDF-1.4\n% occupancy certificate, a test file for BK.114\n');
try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Handover house'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await page.waitForTimeout(1200);

  await noOffer();
  console.log('== Assets tab › Handover documents');
  await tab('assets');
  await page.waitForSelector('[data-ho]');
  await openSection();
  ok(await page.isVisible('[data-ho-none]') && /Completion certificate, Occupancy certificate/.test(await page.textContent('[data-ho-missing]')), 'an empty list; completion and occupancy certificates are named as not in the list yet');
  ok(/can be built without them/.test(await page.textContent('[data-ho-missing]')), 'and it says the package can be built without them (advisory)');

  console.log('== add a linked completion certificate');
  await page.click('[data-ho-new]');
  const kinds = await page.$$eval('[data-ho-form] [data-ho-f="kind"] option', (o) => o.map((x) => x.textContent));
  ok(kinds.join('|') === 'Completion certificate|Occupancy certificate|Warranty|Manual|As-built drawings|Other document', 'the six kinds', kinds);
  await page.fill('[data-ho-f="title"]', 'Certificate of completion');
  await page.fill('[data-ho-f="date"]', '2026-10-30');
  await page.fill('[data-ho-f="issuer"]', 'City of Cape Town');
  await page.fill('[data-ho-f="reference"]', 'CC-2026-00417');
  await page.fill('[data-ho-f="location"]', 'javascript:alert(1)');
  await page.click('[data-ho-save]');
  ok(/Only web addresses/.test(await statusText()) && (await docs()).length === 0, 'a javascript: place is refused with the reason: ' + (await statusText()));
  await page.fill('[data-ho-f="location"]', 'https://example.com/docs/completion.pdf');
  await page.click('[data-ho-save]');
  await page.waitForSelector('[data-ho-list] > li');
  let D = await docs();
  ok(D.length === 1 && D[0].kind === 'completion' && /Certificate of completion/.test(D[0].text) && /dated 2026-10-30, issued by City of Cape Town, reference CC-2026-00417/.test(D[0].text), 'listed with its kind, title, date, issuer and reference', D);
  const link = await page.evaluate(() => { const a = document.querySelector('[data-ho-open]'); return a ? { href: a.href, target: a.target, rel: a.rel } : null; });
  ok(link && link.href === 'https://example.com/docs/completion.pdf' && link.target === '_blank' && /noopener/.test(link.rel), 'its title opens the link in a new tab (noopener)', link);
  ok(/Occupancy certificate/.test(await page.textContent('[data-ho-missing]')) && !/Completion certificate/.test(await page.textContent('[data-ho-missing]')), 'only the occupancy certificate is still named as missing');

  console.log('== add an occupancy certificate with an attached file');
  await page.click('[data-ho-new]');
  await page.selectOption('[data-ho-form] [data-ho-f="kind"]', 'occupancy');
  await page.setInputFiles('[data-ho-attach]', { name: 'Occupancy certificate.pdf', mimeType: 'application/pdf', buffer: PDF });
  await page.waitForSelector('[data-ho-file]');
  ok(/Attached file: Occupancy certificate\.pdf/.test(await page.textContent('[data-ho-file]')) && (await page.inputValue('[data-ho-f="title"]')) === 'Occupancy certificate' && (await page.inputValue('[data-ho-form] [data-ho-f="kind"]')) === 'occupancy', 'the file is attached, its name becomes the title, the kind chosen is kept');
  await page.fill('[data-ho-f="date"]', '2026-11-05'); await page.fill('[data-ho-f="issuer"]', 'City of Cape Town'); await page.fill('[data-ho-f="reference"]', 'OC-2026-00093');
  await page.click('[data-ho-save]');
  await page.waitForFunction(() => document.querySelectorAll('[data-ho-list] > li').length === 2);
  D = await docs();
  const occ = D.find((d) => d.kind === 'occupancy');
  ok(occ && /Attached file: Occupancy certificate\.pdf/.test(occ.text) && !(await page.$('[data-ho-missing]')), 'listed with its attached file; nothing is named as missing now', D);
  const opened = await download(() => page.click(`[data-ho-openfile="${occ.rel}"]`));
  ok(opened.name === 'Occupancy certificate.pdf' && opened.bytes.equals(PDF), 'Open the file hands back the same bytes');
  await shot('1-handover-list');

  console.log('== edit, undo, remove');
  await page.click(`[data-ho-edit="${D[0].rel}"]`);
  await page.fill('[data-ho-form] [data-ho-f="reference"]', 'CC-2026-00418');
  await page.click('[data-ho-save]');
  await page.waitForFunction(() => /CC-2026-00418/.test(document.querySelector('[data-ho-list]')?.textContent || ''));
  ok((await docs()).length === 2, 'the reference is edited in place (still two documents)');
  await page.click('[data-act="undo"]');
  await page.waitForFunction(() => /CC-2026-00417/.test(document.querySelector('[data-ho-list]')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
  ok(/CC-2026-00417/.test(await page.textContent('[data-ho-list]')), 'Undo puts the old reference back');
  await page.click('[data-ho-new]');
  await page.selectOption('[data-ho-form] [data-ho-f="kind"]', 'manual'); await page.fill('[data-ho-f="title"]', 'Boiler manual'); await page.fill('[data-ho-f="location"]', 'Manuals/boiler.pdf');
  await page.click('[data-ho-save]');
  await page.waitForFunction(() => document.querySelectorAll('[data-ho-list] > li').length === 3);
  const man = (await docs()).find((d) => d.kind === 'manual');
  ok(/A file kept beside the IFC: Manuals\/boiler\.pdf/.test(man.text), 'a file name is shown as a file kept beside the IFC');
  await page.click(`[data-ho-del="${man.rel}"]`);
  await page.waitForFunction(() => document.querySelectorAll('[data-ho-list] > li').length === 2);
  ok((await docs()).length === 2 && /removed/.test(await statusText()), 'Remove takes it off the list');

  console.log('== the handover package');
  const pkg = await download(() => page.click('[data-ho-build]'));
  ok(/-handover-package\.zip$/.test(pkg.name) && /Handover package built with 2 handover documents\./.test(await statusText()), 'a zip is downloaded: ' + pkg.name + ' / ' + (await statusText()));
  const out = path.join(TMP, 'unzipped');
  execFileSync('unzip', ['-q', '-o', pkg.file, '-d', out]);
  const names = execFileSync('find', [out, '-type', 'f'], { encoding: 'utf8' }).trim().split('\n').map((f) => path.relative(out, f)).sort();
  ok(names.includes('README.md') && names.includes('handover-documents.csv') && names.includes('handover/Occupancy certificate.pdf') && names.some((n) => / COBie\.xlsx$/.test(n)) && names.some((n) => /-as-built\.ifc$/.test(n)) && ['as-built/as-built-statement.md', 'as-built/verified-elements.csv'].every((n) => names.includes(n)) && names.filter((n) => !n.startsWith('as-built/')).length === 5, 'unzipped: the cover, the list, the COBie workbook, the as-built model and the attached file, plus the as-built part (0.10 BK.49: asbuilt.js)', names);
  ok(fs.readFileSync(path.join(out, 'handover/Occupancy certificate.pdf')).equals(PDF), 'the attached file in the zip is byte for byte the one attached');
  const readme = fs.readFileSync(path.join(out, 'README.md'), 'utf8');
  ok(/\*\*Completion certificate:\*\* Certificate of completion/.test(readme) && /\*\*Occupancy certificate:\*\* Occupancy certificate \(dated 2026-11-05, issued by City of Cape Town, reference OC-2026-00093\)\. In this package: `handover\/Occupancy certificate\.pdf`/.test(readme) && !/Not in the list/.test(readme), 'the cover lists both documents and where each is');
  const xlsx = path.join(out, names.find((n) => / COBie\.xlsx$/.test(n)));
  const py = path.join(REPO, 'tools/takeoffcraft-test/venv/bin/python');
  if (fs.existsSync(py)) {
    const r = JSON.parse(execFileSync(py, ['-I', path.join(REPO, 'tools/bimcraft-test/cobie_xlsx.py'), 'read', xlsx], { encoding: 'utf8' }));
    const head = r.sheets.Document[0], rows = r.sheets.Document.slice(1).map((x) => Object.fromEntries(head.map((h, i) => [h, x[i]])));
    const oc = rows.find((x) => x.Name === 'Occupancy certificate'), cc = rows.find((x) => x.Name === 'Certificate of completion');
    ok(rows.length === 2 && oc && oc.SheetName === 'Facility' && oc.Category === 'Certificate of occupancy' && oc.File === 'Occupancy certificate.pdf' && oc.Directory === 'handover/' && oc.Reference === 'OC-2026-00093' && oc.ApprovalBy === 'City of Cape Town' && cc && cc.Category === 'Certificate of completion' && cc.Reference === 'CC-2026-00417',
      'a spreadsheet library (openpyxl) reads the COBie Document sheet: both documents, on the Facility, with category, file and reference', rows);
  } else console.log('  --   no tools/takeoffcraft-test/venv (openpyxl): the workbook was not read by another program');
  // the COBie save of the Assets tab carries them too
  await page.click('[data-as-cobie] > summary');
  const cob = await download(() => page.click('[data-as-cobie-save]'));
  if (fs.existsSync(py)) {
    const r = JSON.parse(execFileSync(py, ['-I', path.join(REPO, 'tools/bimcraft-test/cobie_xlsx.py'), 'read', cob.file], { encoding: 'utf8' }));
    ok(r.sheets.Document.length === 3 && r.sheets.Document.slice(1).every((x) => x.includes('Facility')), 'Save as COBie on the Assets tab writes the same two Document rows');
  }

  console.log('== save the project as a bundle');
  ok(/not inside a plain \.ifc/.test(await page.textContent('[data-ho-bundle-note]')), 'the list says an attached file is not inside a plain .ifc, and that a bundle keeps it');
  // an ordinary Save (Ctrl+S) asks which file to write, because a plain .ifc cannot hold the attached file
  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press('Control+s');
  await page.waitForSelector('[data-pic-save-choice="plain"]', { timeout: 15000 });
  const asked = await page.evaluate(() => ({ text: document.querySelector('dialog[open]').textContent, choices: [...document.querySelectorAll('dialog[open] [data-pic-save-choice]')].map((b) => b.dataset.picSaveChoice) }));
  ok(/1 attached handover file/.test(asked.text) && /plain \.ifc keeps only its name, size and SHA-256/.test(asked.text) && asked.choices.join() === 'bundle,plain,cancel', 'Save asks: a project bundle (keeps the file), a plain .ifc (record only), or cancel', asked);
  const plain = await download(() => page.click('[data-pic-save-choice="plain"]'));
  ok(/\.ifc$/.test(plain.name) && plain.bytes.toString('utf8').includes('sha256=') && !plain.bytes.includes(PDF), 'the plain .ifc keeps the record (name, size, SHA-256), not the file: ' + plain.name);
  const bundle = await download(() => page.click('[data-ho-savebundle]'));
  await waitStatus(/handover file is in the bundle/, 20000).catch(() => {});
  ok(/\.ccbundle$/.test(bundle.name) && /1 handover file is in the bundle/.test(await statusText()), 'Save the project as a bundle downloads a .ccbundle: ' + bundle.name + ' / ' + (await statusText()));
  const bout = path.join(TMP, 'bundle');
  execFileSync('unzip', ['-q', '-o', bundle.file, '-d', bout]);
  ok(fs.existsSync(path.join(bout, 'manifest.json')) && fs.readFileSync(path.join(bout, 'handover/Occupancy certificate.pdf')).equals(PDF), 'unzipped: handover/Occupancy certificate.pdf is in the bundle, byte for byte');

  console.log('== save the IFC, open it again');
  // the bytes Save as IFC writes (the button sits in a folded File section in this layout): the editor's own save
  const savedIfc = { bytes: Buffer.from(await page.evaluate(() => Array.from(window.bimcraftRes.api.ed().save()))) };
  const txt = savedIfc.bytes.toString('utf8');
  ok(/IFCDOCUMENTINFORMATION\(/.test(txt) && /CadCraft_HandoverDocument/.test(txt) && /Certificate of occupancy/.test(txt), 'the saved IFC carries the documents (IfcDocumentInformation on the project)');
  await page.reload({ waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', { name: 'handover-house.ifc', mimeType: 'application/x-step', buffer: savedIfc.bytes });
  await waitStatus(/^Opened handover-house/, 120000);
  await page.waitForTimeout(800); await noOffer();
  await tab('assets');
  await page.waitForSelector('[data-ho]');
  await openSection();
  await page.waitForFunction(() => document.querySelectorAll('[data-ho-list] > li').length === 2, null, { timeout: 20000 });
  D = await docs();
  const occ2 = D.find((d) => d.kind === 'occupancy');
  ok(D.length === 2 && /CC-2026-00417/.test(D.find((d) => d.kind === 'completion').text) && /is not loaded/.test(occ2.text), 'opened again: both records are there; the attached file is said to be not loaded', D);
  await page.setInputFiles(`[data-ho-again="${occ2.rel}"]`, { name: 'Occupancy certificate.pdf', mimeType: 'application/pdf', buffer: PDF });
  await page.waitForFunction(() => /same SHA-256/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 20000 });
  ok(/Attached file: Occupancy certificate\.pdf/.test((await docs()).find((d) => d.kind === 'occupancy').text), 'the same file attached again is recognised by its SHA-256 and is loaded');
  await shot('2-handover-reopened');

  console.log('== the bundle opened again');
  await page.reload({ waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', { name: bundle.name, mimeType: 'application/zip', buffer: bundle.bytes });
  await page.waitForFunction(() => window.bimcraftRes?.api?.ed?.(), null, { timeout: 120000 });
  await page.waitForTimeout(1500); await noOffer();
  await tab('assets');
  await page.waitForSelector('[data-ho]');
  await openSection();
  await page.waitForFunction(() => document.querySelectorAll('[data-ho-list] > li').length === 2, null, { timeout: 30000 });
  D = await docs();
  const occ3 = D.find((d) => d.kind === 'occupancy');
  ok(/Attached file: Occupancy certificate\.pdf/.test(occ3.text) && !/is not loaded/.test(occ3.text), 'bundle reopened: the occupancy certificate\'s file is loaded without attaching it again', occ3);
  const again = await download(() => page.click(`[data-ho-openfile="${occ3.rel}"]`));
  ok(again.bytes.equals(PDF), 'Open the file gives back the attached bytes');
  const pkg2 = await download(() => page.click('[data-ho-build]'));
  const out2 = path.join(TMP, 'unzipped2');
  execFileSync('unzip', ['-q', '-o', pkg2.file, '-d', out2]);
  ok(fs.readFileSync(path.join(out2, 'handover/Occupancy certificate.pdf')).equals(PDF) && !/not loaded/.test(await statusText()), 'the handover package built from the reopened bundle includes the file: ' + (await statusText()));

  const real = problems.filter((p) => !(/429/.test(p) && [...throttled].some((u) => /hardware/.test(u))));
  ok(real.length === 0, 'no console errors', real.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'stopped.png') }).catch(() => {});
} finally { await browser.close(); fs.rmSync(TMP, { recursive: true, force: true }); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

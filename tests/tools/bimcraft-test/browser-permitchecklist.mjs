#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-permitchecklist.mjs: BK.109 the authority's supporting documents in the real page, /lab, headless (session bk-stages-10):
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-permitchecklist.mjs [--shots <dir>]      run as root (a test admin session)
 * Permit package › Supporting documents: choose South Africa's list, see it marked unverified with its source, an item linked to the
 * model's real sheet, mark a paper as supplied, and build the package with documents still missing (a real zip, unpacked here).
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
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: false }); };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimpermitcl'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const throttled = new Set();
page.on('response', (r) => { if (r.status() === 429) throttled.add(r.url()); });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-permitcl-'));
const statusText = () => page.textContent('[data-status]');
const noOffer = () => page.evaluate(() => document.querySelector('.nh-offer [data-k="no"]')?.click());
const items = () => page.evaluate(() => [...document.querySelectorAll('[data-cl-list] > li')].map((li) => ({ id: li.dataset.clItem, status: li.dataset.clStatus, chip: li.querySelector('[data-cl-chip]')?.textContent, by: li.querySelector('[data-cl-by]')?.textContent || '', hint: li.querySelector('[data-cl-hint]')?.textContent || '', how: li.querySelector('[data-cl-how]')?.value })));
const item = async (id) => (await items()).find((x) => x.id === id);
try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Checklist house'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await page.waitForTimeout(1200); await noOffer();
  const sheets = await page.evaluate(async () => { const V = await import('/assets/apps/bimcraft/dev/views-model.js'), { ModelWriter } = await import('/assets/apps/bimcraft/dev/model-write.js'); const e = window.bimcraftRes.api.ed(); return V.readSheets(new ModelWriter(e.W, e.api, e.mid)).map((s) => ({ id: s.id, label: [s.number, s.title].filter(Boolean).join(' '), kinds: s.views.map((v) => v.kind) })); });
  ok(sheets.length >= 1 && sheets[0].kinds.includes('plan'), 'the new building has its first sheet, with a floor plan on it: ' + sheets.map((s) => s.label).join(', '), sheets);

  // BK.67/156: the authority lists are regulation packs now: the Building regulations add-on has to be on
  await page.evaluate(() => window.ccAddons.loader.setEnabled('regs', true));
  await page.waitForFunction(() => window.ccAddons.list().find((x) => x.id === 'regs')?.state === 'active' && window.ccRegsLocal, null, { timeout: 30000 });
  console.log('== Permit package › Supporting documents');
  await page.evaluate(() => { const d = document.querySelector('[data-eg44-details]'); d.open = true; d.scrollIntoView({ block: 'start' }); });
  await page.waitForSelector('[data-cl-pack]');
  await page.waitForFunction(() => document.querySelectorAll('[data-cl-pack] option').length >= 6, null, { timeout: 20000 });
  const opts = await page.$$eval('[data-cl-pack] option', (o) => o.map((x) => x.textContent));
  ok(opts.length === 6 && opts[0] === 'None' && opts.some((x) => /^South Africa: SANS 10400/.test(x)) && opts.some((x) => /^England/.test(x)) && opts.some((x) => /^Portland, Oregon/.test(x)) && opts.some((x) => /^MADE-UP/.test(x)) && opts.includes('Generic submission checklist'), 'the authority lists come from the data folder: none, generic, South Africa, Cape Town, England, Portland', opts);
  ok(!(await page.$('[data-cl-list]')), 'no list chosen: no checklist shown');
  await page.selectOption('[data-cl-pack]', 'za-sans10400');
  await page.waitForSelector('[data-cl-list] > li', { timeout: 20000 });
  ok(/Unverified by a local practitioner/.test(await page.textContent('[data-cl-unverified]')) && (await page.getAttribute('[data-cl-unverified]', 'data-cl-unverified')) === 'unchecked', 'the list is marked "Unverified by a local practitioner"');
  const src = await page.evaluate(() => { const a = document.querySelector('[data-cl-sources] a'); return { href: a?.href, text: a?.textContent, li: a?.closest('li').textContent, target: a?.target, rel: a?.rel }; });
  ok(src.href === 'https://www.gov.za/documents/national-building-regulations-and-building-standards-act-regulations' && /Government Notice R\.2378/.test(src.text) && /read on 2026-11-11/.test(src.li) && src.target === '_blank' && /noopener/.test(src.rel), 'its official source is cited with a link and the date it was read', src);
  let I = await items();
  ok(I.length === 14, 'fourteen documents listed', I.length);
  const plans = I.find((x) => x.id === 'layout-plans');
  ok(plans.status === 'linked' && plans.chip === 'Linked' && plans.by.includes(sheets[0].label) && /it holds a floor plan/.test(plans.by), 'Layout drawings: plans is linked to the model\'s real sheet "' + sheets[0].label + '" (it holds a floor plan)', plans);
  ok(I.find((x) => x.id === 'layout-sections').status === 'missing' && I.find((x) => x.id === 'form-declaration').status === 'missing' && I.find((x) => x.id === 'site-plan').status === 'missing', 'sections, the site plan and the application form are missing');
  const sum0 = await page.textContent('[data-cl-sum]');
  ok(/^1 linked to the model, 0 supplied by you, 13 missing, 0 do not apply \(14 in all\)\.$/.test(sum0.trim()) && /do not stop this package being built/.test(await page.textContent('[data-cl-missing]')), 'the count: ' + sum0.trim() + ' and the line that missing documents do not stop the package');
  await shot('1-checklist');

  console.log('== mark a paper supplied, an item not applying, a sheet chosen by hand; undo');
  await page.selectOption('[data-cl-how="form-declaration"]', 'supplied');
  await page.waitForFunction(() => document.querySelector('[data-cl-item="form-declaration"]')?.dataset.clStatus === 'supplied', null, { timeout: 20000 });
  ok((await item('form-declaration')).chip === 'Supplied by you', 'the application form: Supplied by you');
  const naOpts = await page.evaluate(() => ({ req: [...document.querySelector('[data-cl-how="drainage-installation"]').options].map((o) => o.value), opt: [...document.querySelector('[data-cl-how="fire-protection"]').options].map((o) => o.value) }));
  ok(!naOpts.req.includes('na') && naOpts.opt.includes('na'), '"Does not apply here" is offered only for an item the list marks "if it applies"', naOpts);
  await page.selectOption('[data-cl-how="fire-protection"]', 'na');
  await page.waitForFunction(() => document.querySelector('[data-cl-item="fire-protection"]')?.dataset.clStatus === 'na', null, { timeout: 20000 });
  await page.selectOption('[data-cl-how="drainage-installation"]', sheets[0].id);
  await page.waitForFunction(() => document.querySelector('[data-cl-item="drainage-installation"]')?.dataset.clStatus === 'linked', null, { timeout: 20000 });
  ok(/chosen by you/.test((await item('drainage-installation')).by), 'the drainage drawing linked by hand to ' + sheets[0].label + ' (chosen by you)');
  ok(/^2 linked to the model, 1 supplied by you, 10 missing, 1 do not apply/.test((await page.textContent('[data-cl-sum]')).trim()), 'the count follows: ' + (await page.textContent('[data-cl-sum]')).trim());
  await page.click('[data-act="undo"]');
  await page.waitForFunction(() => document.querySelector('[data-cl-item="drainage-installation"]')?.dataset.clStatus === 'missing', null, { timeout: 30000 }).catch(() => {});
  ok((await item('drainage-installation')).status === 'missing' && (await item('form-declaration')).status === 'supplied', 'Undo takes back the last choice only (they are kept in the model)');

  console.log('== the package is built with documents missing');
  await noOffer();
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('[data-eg44-build]')]);
  const zipFile = path.join(TMP, dl.suggestedFilename()); await dl.saveAs(zipFile);
  const st = await statusText();
  ok(/-permit-package\.zip$/.test(dl.suggestedFilename()) && /11 supporting documents are still missing \(listed on the cover\)/.test(st), 'the zip is downloaded and the status says how many are missing: ' + st);
  const out = path.join(TMP, 'unzipped');
  execFileSync('unzip', ['-q', '-o', zipFile, '-d', out]);
  const names = fs.readdirSync(out).sort();
  ok(names.includes('00-cover.md') && names.includes('04-supporting-documents.csv') && names.includes('03-model.ifc'), 'unzipped: the cover, the model and 04-supporting-documents.csv', names);
  const cover = fs.readFileSync(path.join(out, '00-cover.md'), 'utf8');
  ok(/## Supporting documents: South Africa: SANS 10400/.test(cover) && /\*\*Unverified by a local practitioner\./.test(cover) && cover.includes('| Layout drawings: plans | A2(1)(b), A7 | Linked | ' + sheets[0].label + ' |') && /\| Application form with the professional's declaration \| A2\(1\)\(g\) \| Supplied by you \| Supplied by the person \|/.test(cover) && /### Missing/.test(cover) && /https:\/\/www\.gov\.za\/documents\/national-building-regulations-and-building-standards-act-regulations \(read on 2026-11-11\)/.test(cover), 'the cover carries the list: unverified, each document with its status and sheet, the missing ones, the source');
  const csv = fs.readFileSync(path.join(out, '04-supporting-documents.csv'), 'utf8');
  ok(csv.split('\r\n').filter(Boolean).length === 15 && /,linked,/.test(csv) && /,missing,/.test(csv) && /,supplied,/.test(csv), 'the CSV has the fourteen documents with their statuses');
  ok(/CadCraft_SubmissionChecklist/.test(fs.readFileSync(path.join(out, '03-model.ifc'), 'utf8')), 'the model in the package keeps the chosen list and the choices');

  console.log('== a pack with a process and a submission format (BK.67/156): Portland');
  await page.selectOption('[data-cl-pack]', 'us-or-portland');
  await page.waitForFunction(() => document.querySelectorAll('[data-cl-list] > li').length === 12, null, { timeout: 20000 });
  ok((await page.getAttribute('[data-cl-unverified]', 'data-cl-unverified')) === 'unchecked', 'the Portland list is marked unverified (a draft pack: nobody local has confirmed it)');
  await page.evaluate(() => { document.querySelector('[data-cl-process]').open = true; document.querySelector('[data-cl-format]').open = true; });
  const proc = await page.evaluate(() => ({ steps: [...document.querySelectorAll('[data-cl-step]')].map((li) => li.dataset.clStep), fee: document.querySelector('[data-cl-fee]')?.textContent, feeHref: document.querySelector('[data-cl-fee] a')?.href, time: document.querySelectorAll('[data-cl-time]').length, fmt: document.querySelector('[data-cl-format]').textContent }));
  ok(proc.steps.join() === 'research,prepare,apply,intake-fees,review,pre-issuance,issue' && /estimated cost of construction/.test(proc.fee) && proc.feeHref === 'https://www.portland.gov/ppd/get-permit' && /read 2026-11-11/.test(proc.fee.replace('Source, read', 'read')) && proc.time === 0, 'the approval process: 7 steps; the fee statement shows the City page it was read from and the date; no time frame is shown (none is stated)', proc);
  ok(/PDF \(all drawings in one file\)/.test(proc.fmt) && /Landscape/.test(proc.fmt) && /four sets if submitted in person/.test(proc.fmt) && !/Sheet sizes/.test(proc.fmt), 'the submission format: one PDF, landscape, the copies; no sheet size (the pages do not state one)');
  await page.waitForFunction(() => (window.ccProblems?.store?.list?.() || []).some((p) => /^submission\./.test(p.code)), null, { timeout: 20000 });
  const adv = await page.evaluate(() => window.ccProblems.store.list().filter((p) => /^submission\./.test(p.code)).map((p) => [p.code, p.severity]));
  ok(adv.length >= 4 && adv.every(([, sev]) => sev === 'note') && adv.some(([c]) => c === 'submission.drawing.missing') && adv.some(([c]) => c === 'submission.document.missing'), 'what the set still lacks shows in Problems as notes (advisory, never blocking): ' + adv.length, adv);
  await noOffer();
  const [dl2] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('[data-eg44-build]')]);
  const zip2 = path.join(TMP, 'p2-' + dl2.suggestedFilename()); await dl2.saveAs(zip2);
  const out2 = path.join(TMP, 'unzipped2'); execFileSync('unzip', ['-q', '-o', zip2, '-d', out2]);
  const cover2 = fs.readFileSync(path.join(out2, '00-cover.md'), 'utf8');
  ok(/## Approval process: Portland/.test(cover2) && /## Submission format: Portland/.test(cover2) && /\*\*File formats:\*\* PDF/.test(cover2) && /read 2026-11-11/.test(cover2) && /Unverified by a local practitioner/.test(cover2), 'the permit package cover carries the approval process and the submission format, with sources and dates, and says unverified');
  await shot('2-portland');

  console.log('== standard notes on a sheet (BK.157)');
  await page.evaluate(() => { document.querySelector('[data-eg44-details]').open = false; });
  await page.evaluate(() => document.querySelector('[data-pb-newsheet]').click());
  await page.waitForSelector('[data-sh-dialog][open]');
  await page.click('[data-sh-notes]');
  await page.waitForSelector('[data-sh-notes-list] li');
  const picker = await page.evaluate(() => ({ packs: [...document.querySelectorAll('[data-sh-notes-pack] option')].map((o) => o.textContent), n: document.querySelectorAll('[data-sh-note]').length, state: document.querySelector('[data-sh-notes-state]').dataset.shNotesState, text: document.querySelector('[data-sh-notes-state]').textContent }));
  ok(picker.packs.length === 1 && /^MADE-UP/.test(picker.packs[0]) && picker.n === 8 && picker.state === 'unchecked' && /not confirmed by anyone/.test(picker.text), 'the picker offers the one pack that has notes (the MADE-UP sample), its 8 notes, and says the pack is unconfirmed', picker);
  await page.selectOption('[data-sh-notes-disc]', 'general');
  ok((await page.$$('[data-sh-note]')).length === 3, 'filter by discipline: 3 general notes');
  await page.click('[data-sh-note="gen-dimensions"]'); await page.click('[data-sh-note="gen-codes"]');
  await page.click('[data-sh-notes-place]');
  await page.waitForFunction(() => /General notes/.test(document.querySelector('[data-sh-stage]')?.textContent || ''), null, { timeout: 8000 });
  const stage = await page.textContent('[data-sh-stage]');
  ok(/MADE-UP\s*G1/.test(stage) && /MADE-UP\s*G2/.test(stage) && /unverified, check before use/.test(stage), 'two notes placed on the sheet, each with its clause, and the source line says unverified');
  await shot('3-notes-dialog');
  ok(/2 standard notes placed/.test(await statusText()), 'status: ' + (await statusText()));
  await page.click('[data-sh-save]');
  await page.waitForSelector('[data-pb-sheet]', { state: 'attached', timeout: 8000 });
  const saved = await page.evaluate(async () => { const V = await import('/assets/apps/bimcraft/dev/views-model.js'), { ModelWriter } = await import('/assets/apps/bimcraft/dev/model-write.js'); const e = window.bimcraftRes.api.ed(); return V.readSheets(new ModelWriter(e.W, e.api, e.mid)).filter((s) => s.notes).map((s) => s.notes.items.map((x) => [x.id, x.pack, x.clause, x.review])); });
  ok(saved.length === 1 && saved[0].length === 2 && saved[0][0][1] === 'us-sample-practice' && saved[0][0][2] === 'MADE-UP G1', 'saved in the model with the pack, clause and review state', saved);
  const reopen = await page.evaluate(async () => { const rows = [...document.querySelectorAll('[data-pb-sheet]')]; return rows.length; });
  await page.evaluate(() => { const last = [...document.querySelectorAll('[data-pb-sheet]')].pop(); (last.matches('button') ? last : last.querySelector('button, .bc-pb-go')).click(); });
  await page.waitForSelector('[data-sh-dialog][open]');
  ok(/General notes/.test(await page.textContent('[data-sh-stage]')) && reopen >= 2, 'reopening the sheet shows the notes again');
  await page.click('[data-sh-notes]');
  await page.waitForSelector('[data-sh-notes-remove]:not([hidden])');
  await page.click('[data-sh-notes-remove]');
  ok(!/General notes/.test(await page.textContent('[data-sh-stage]')), 'Remove notes from sheet takes them off');
  await page.keyboard.press('Escape');
  await shot('3-notes');

  console.log('== the annotation standard offers the ticked pack\'s text heights');
  await page.evaluate(async () => { (await import('/assets/apps/bimcraft/dev/addons/regs/lib/active.js')).setActivePacks(['us-or-portland']); });
  await page.evaluate(() => document.querySelector('[data-pb-anno]').click());
  await page.waitForSelector('[data-anno-dialog][open]');
  await page.click('[data-anno-pack]');
  const sizes = await page.evaluate(() => ({ text: document.querySelector('[data-anno-h="text"]').value, dim: document.querySelector('[data-anno-h="dimension"]').value, tag: document.querySelector('[data-anno-h="tag"]').value, note: document.querySelector('.bc-input-err').textContent }));
  ok(sizes.text === '3.04' && sizes.dim === '3.04' && sizes.tag === '' && /Portland/.test(sizes.note) && /font size/.test(sizes.note), 'Annotation sizes › Use a regulation pack\'s sizes fills text and dimensions with 3.04 mm (12 pt as a capital height) and says where from; nothing is saved until Save', sizes);
  await page.click('[data-anno-ok]');
  await page.waitForFunction(() => /Annotation sizes saved|saved/i.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 8000 }).catch(() => {});
  console.log('== another authority; back to none');
  await page.evaluate(() => { document.querySelector('[data-eg44-details]').open = true; });
  await page.selectOption('[data-cl-pack]', 'gb-eng-planning');
  await page.waitForFunction(() => document.querySelectorAll('[data-cl-list] > li').length === 9, null, { timeout: 20000 });
  ok((await item('other-plans')).status === 'linked' && (await item('location-plan')).status === 'missing' && (await page.$$eval('[data-cl-sources] a', (a) => a.map((x) => x.href))).join() === 'https://www.legislation.gov.uk/uksi/2015/595/article/7,https://www.gov.uk/guidance/making-an-application' && /Unverified by a local practitioner/.test(await page.textContent('[data-cl-unverified]')), 'England: nine documents, the plans linked, the location plan missing, both official sources cited, unverified');
  await page.selectOption('[data-cl-pack]', '');
  await page.waitForFunction(() => !document.querySelector('[data-cl-list]'), null, { timeout: 20000 });
  ok(!(await page.$('[data-cl-list]')), 'None: the checklist goes');
  const real = problems.filter((p) => !(/429/.test(p) && [...throttled].some((u) => /hardware/.test(u))));
  ok(real.length === 0, 'no console errors', real.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e).toString().slice(0, 900));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'stopped.png') }).catch(() => {});
} finally { await browser.close(); fs.rmSync(TMP, { recursive: true, force: true }); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

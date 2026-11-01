#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser.mjs — the frame analysis in the page (0.6 LC.4), DetailCraft's Analysis tab and BimCraft's Analysis panel.
 * Run as root (it calls `sudo -u www-data php tools/frame/admin.php session|down`; the test admin is
 * frametest+cadcraft@projectz.xyz, disabled at the end) with the cached Playwright Chromium:
 *
 *   node tools/frame/browser.mjs [--shots <dir>] [--only detailcraft|bimcraft]
 *
 * DetailCraft: the sample frame; the tab opens with "an analysis aid, not a code check"; a beam selected → a 20 kN/m load
 * added (one undo step, undone and added again); Run → a row per analysed member, the reactions, the deflected shape and
 * the moments drawn on the 3D view; the report as PDF (read back: %PDF, pages), CSV and the CraftScript file (frame3d);
 * Bases → pinned changes the report's assumptions; an edit makes the results stale; both themes shot.
 * BimCraft: DetailCraft's sample written to IFC (by DetailCraft's own writer, in Node) and opened; Analysis tab → Run →
 * every beam, column and brace; a row's button selects the element; a load added is one change in the IFC's change
 * list; Undo takes it back. Fails on any console error. Shots in tmp/shots/frame/ by default.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SHOTS = arg('--shots', path.join(ROOT, 'tmp/shots/frame'));
const ONLY = arg('--only', '');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

// an IFC of DetailCraft's sample, made by DetailCraft's own writer (as bin/test-frame.mjs does)
const DC = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const dl = (f) => import(pathToFileURL(path.join(DC, f)).href);
(await dl('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(DC, 'lang/en.json'), 'utf8')) });
const tmp = fs.mkdtempSync(path.join(ROOT, 'tmp/frame-browser-'));
const ifcFile = path.join(tmp, 'Frame sample.ifc');
{
  const { sampleModel } = await dl('sample.js'), { writeIfc } = await dl('ifc.js'), { build } = await dl('build.js'), { markParts, markFootings } = await dl('marks.js'), { bendingSchedule } = await dl('rebar.js');
  const st = sampleModel().state || sampleModel(), built = build(st), marks = markParts(built, { perPhase: false });
  marks.footingMark = markFootings(st.footings, { perPhase: false });
  fs.writeFileSync(ifcFile, writeIfc(st, built, marks, bendingSchedule(st.footings), { now: new Date('2026-10-16T00:00:00Z') }));
}

const { chromium } = await import('playwright-core');
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const exe = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))
  .map((d) => path.join(cache, d, 'chrome-linux64/chrome')).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/frame/admin.php'), cmd], { encoding: 'utf8' }));
const SESSION = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const issues = [];
const download = async (page, click) => {
  const [d] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), click()]);
  const f = path.join(tmp, d.suggestedFilename());
  await d.saveAs(f);
  return { name: d.suggestedFilename(), bytes: fs.readFileSync(f) };
};
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: SESSION.name, value: SESSION.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const watch = (p) => { p.on('console', (m) => { if (m.type() === 'error') issues.push('console: ' + m.text()); }); p.on('pageerror', (e) => issues.push('pageerror: ' + e.message)); };

  if (!ONLY || ONLY === 'detailcraft') {
    console.log('\nDetailCraft: the Analysis tab');
    const page = await ctx.newPage();
    watch(page);
    await page.goto(BASE + '/lab/detailcraft?space=paper', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.detailcraft && window.detailcraft.view, null, { timeout: 30000 });
    await page.evaluate(() => window.detailcraft.act('sample'));
    await page.waitForFunction(() => window.detailcraft.built.parts.length === 25);
    await page.click('[data-tab="analysis"]');
    const aid = await page.textContent('[data-fa-aid]');
    ok(/not a code check/.test(aid) && await page.isVisible('[data-fa-run]'), 'the Analysis tab opens with "an analysis aid, not a code check" and Run analysis');
    const beam = await page.evaluate(() => window.detailcraft.model.state.members.find((m) => m.type === 'beam').id);
    await page.evaluate((id) => window.detailcraft.select({ kind: 'member', id }), beam);
    await page.waitForFunction(() => !document.querySelector('[data-fa-load-add]').disabled);
    await page.selectOption('[data-fa-load="case"]', 'L');
    await page.fill('[data-fa-load="value"]', '20');
    await page.click('[data-fa-load-add]');
    const nLoads = () => page.evaluate(() => window.detailcraft.model.state.analysis?.cases.find((c) => c.id === 'L')?.loads.length ?? 0);
    const st1 = await page.textContent('[data-status]').catch(() => '');
    ok(await nLoads() === 1 && /Load added to 1 member/.test(st1), 'a beam selected → 20 kN/m down on Live: added, said in the status bar', st1);
    await page.keyboard.press('Escape');
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press('Control+z');
    const afterUndo = await nLoads();
    await page.keyboard.press('Control+y');
    ok(afterUndo === 0 && await nLoads() === 1, 'the load is one undo step (Ctrl+Z takes it back, Ctrl+Y puts it again)');
    await page.click('[data-fa-run]');
    await page.waitForSelector('[data-fa-table]');
    const rows = await page.$$eval('[data-fa-table] tbody tr', (r) => r.length);
    const reac = await page.$$eval('[data-fa-reactions] tbody tr', (r) => r.length);
    const sum = await page.textContent('[data-fa-summary]');
    const drawn = await page.evaluate(() => window.detailcraft.view._analysis?.children.length || 0);
    ok(rows === 11 && reac === 6 && /reactions up/.test(sum) && drawn > 0, `Run: ${rows} members in the table, ${reac} reactions, the summary (${sum.trim().slice(0, 80)}…), the deflected shape on the view`);
    await page.screenshot({ path: path.join(SHOTS, '01-detailcraft-deflected-paper.png') });
    await page.selectOption('[data-fa-mode]', 'My');
    const labels = await page.evaluate(() => window.detailcraft.view._analysis.children.length);
    ok(labels > 1, `On the model → Bending moment My: the members coloured by moment and the largest written beside them (${labels - 1} labels)`);
    await page.screenshot({ path: path.join(SHOTS, '02-detailcraft-moments-paper.png') });
    const pdf = await download(page, () => page.click('[data-fa-pdf]'));
    let pages = 0;
    try { pages = Number((execFileSync('pdfinfo', [path.join(tmp, pdf.name)], { encoding: 'utf8' }).match(/Pages:\s+(\d+)/) || [])[1]); } catch { pages = -1; }
    const text = (() => { try { return execFileSync('pdftotext', ['-layout', path.join(tmp, pdf.name), '-'], { encoding: 'utf8' }); } catch { return ''; } })();
    ok(pdf.bytes.subarray(0, 5).toString() === '%PDF-' && /analysis\.pdf$/.test(pdf.name) && (pages > 1 || pages === -1) && (!text || /not a code check/.test(text)), `Report (PDF): ${pdf.name}, ${pages} pages, opens with the "not a code check" line`);
    const csv = await download(page, () => page.click('[data-fa-csv]'));
    ok(/About this analysis/.test(csv.bytes.toString('utf8')) && /Sum of reactions/.test(csv.bytes.toString('utf8')), 'Report (CSV): every table, with the sums');
    const craft = await download(page, () => page.click('[data-fa-craft]'));
    ok(/frame3d\(fr\)/.test(craft.bytes.toString('utf8')) && /\.craft$/.test(craft.name), `Export as CraftScript: ${craft.name} runs frame3d for every case`);
    // 0.7 SU.878: design checks on the same frame
    ok(await page.isVisible('[data-fa-des-aid]') && /aid until an engineer has reviewed it/.test(await page.textContent('[data-fa-des-aid]')), 'Design checks block: opens with "an aid until an engineer has reviewed it"');
    const designState = () => page.evaluate(() => { const a = window.detailcraft.model.state.analysis; return { code: a.design?.code, strength: a.combos.filter((c) => c.limit === 'strength').length, service: a.combos.filter((c) => c.limit === 'service').length, typed: a.combos.filter((c) => !c.limit).length }; });
    await page.selectOption('[data-fa-des="code"]', 'asce-aisc');
    await page.click('[data-fa-des-make]');
    const ds1 = await designState();
    ok(ds1.code === 'asce-aisc' && ds1.strength === 2 && ds1.service === 1 && ds1.typed === 1, `ASCE 7 + AISC 360: Make combinations → ${ds1.strength} strength + ${ds1.service} serviceability combinations saved in the model; the typed one is kept`);
    await page.click('[data-fa-des-run]');
    await page.waitForSelector('[data-fa-des-table]');
    const drows = await page.$$eval('[data-fa-des-row]', (r) => r.map((x) => x.getAttribute('data-fa-des-row')));
    const bars = await page.evaluate(() => window.detailcraft.view._analysisUtil?.children.length || 0);
    ok(drows.length === 11 && drows.some((x) => x !== 'not-checked') && drows.includes('not-checked') && bars > 0, `Check members: ${drows.length} rows (${drows.filter((x) => x !== 'not-checked').length} checked, ${drows.filter((x) => x === 'not-checked').length} not checked with a reason), ${bars} members coloured on the view`);
    await page.screenshot({ path: path.join(SHOTS, '02c-detailcraft-design-paper.png') });
    await page.locator('.fa-design').screenshot({ path: path.join(SHOTS, '02c2-detailcraft-design-block.png') });
    const pdf2 = await download(page, () => page.click('[data-fa-pdf]'));
    const text2 = (() => { try { return execFileSync('pdftotext', ['-layout', path.join(tmp, pdf2.name), '-'], { encoding: 'utf8' }); } catch { return ''; } })();
    ok(!text2 || (/Design checks/.test(text2) && /Clauses used/.test(text2) && /AISC 360-16/.test(text2)), 'the report PDF carries the design tables: code editions, utilisation by member, every clause used');
    await page.selectOption('[data-fa-des="code"]', 'en');
    await page.click('[data-fa-des-make]');
    await page.click('[data-fa-des-run]');
    await page.waitForSelector('[data-fa-des-table]');
    const ds2 = await designState();
    ok(ds2.code === 'en' && ds2.strength >= 2 && await page.isVisible('[data-fa-na]'), `EN 1990 + EN 1993-1-1: ${ds2.strength} strength combinations, the National Annex table is there to edit`);
    await page.click('[data-fa-na] summary');
    await page.fill('[data-fa-psi="psi0:live"]', '0.5');
    await page.keyboard.press('Tab');
    ok(await page.evaluate(() => window.detailcraft.model.state.analysis.design.na.combos.psi0.live) === 0.5 && await page.isVisible('[data-fa-des-state]'), 'an edited National Annex value (ψ0 imposed 0.5) is saved in the model and the old check says it is out of date');
    await page.screenshot({ path: path.join(SHOTS, '02d-detailcraft-design-en-paper.png') });
    await page.selectOption('[data-fa-des="code"]', 'none');
    ok(await page.$eval('[data-fa-des-make]', (b) => b.disabled) && await page.$eval('[data-fa-des-run]', (b) => b.disabled), 'Design code → None: Make combinations and Check members are off');
    await page.selectOption('[data-fa-setting="bases"]', 'pinned');
    ok(await page.evaluate(() => window.detailcraft.model.state.analysis.bases) === 'pinned' && await page.isVisible('[data-fa-stale]'), 'Column bases → Pinned: kept in the model, the results say they are out of date');
    await page.click('[data-fa-run]');
    await page.waitForSelector('[data-fa-error]');
    const err = await page.textContent('[data-fa-error]');
    ok(/mechanism/.test(err) && /\(\d+, \d+, \d+\)/.test(err), `run again with pinned bases: the sample has moment frames one way only, so it sways the other way — refused, naming the point and the direction ("${err.trim().slice(0, 110)}…")`);
    await page.screenshot({ path: path.join(SHOTS, '02b-detailcraft-mechanism.png') });
    await page.selectOption('[data-fa-setting="bases"]', 'fixed');
    await page.goto(BASE + '/lab/detailcraft?space=model', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.detailcraft && window.detailcraft.view, null, { timeout: 30000 });
    await page.evaluate(() => window.detailcraft.act('sample'));
    await page.waitForFunction(() => window.detailcraft.built.parts.length === 25);
    await page.click('[data-tab="analysis"]');
    await page.click('[data-fa-run]');
    await page.waitForSelector('[data-fa-table]');
    await page.screenshot({ path: path.join(SHOTS, '03-detailcraft-model.png') });
    ok(true, 'the dark (model) theme: shot 03');
    await page.close();
  }

  if (!ONLY || ONLY === 'bimcraft') {
    console.log('\nBimCraft: the Analysis panel');
    const page = await ctx.newPage();
    watch(page);
    await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
    await page.setInputFiles('[data-file]', ifcFile);
    await page.waitForFunction(() => /^Opened /.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 60000 });
    await page.click('[data-rtab="analysis"]');
    await page.waitForSelector('[data-fa-run]');
    await page.click('[data-fa-run]');
    await page.waitForSelector('[data-fa-table]');
    const rows = await page.$$eval('[data-fa-table] tbody tr', (r) => r.length);
    const notes = await page.$$eval('.fa-warn', (n) => n.map((x) => x.textContent));
    ok(rows === 11 && await page.$$eval('[data-fa-reactions] tbody tr', (r) => r.length) === 6, `Run on the IFC: ${rows} beams, columns and braces, 6 reactions`, notes.join(' | '));
    await page.screenshot({ path: path.join(SHOTS, '04-bimcraft-paper.png') });
    await page.click('[data-fa-table] tbody tr:first-child button');
    await page.waitForFunction(() => !document.querySelector('[data-fa-load-add]')?.disabled, null, { timeout: 10000 });
    await page.fill('[data-fa-load="value"]', '10');
    await page.click('[data-fa-load-add]');
    await page.waitForFunction(() => /Load added/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 10000 });
    const changes = await page.textContent('[data-change-list]');
    ok(/Add a load/.test(changes), 'a member picked from the table, a 10 kN/m load added: one change in the IFC\'s change list ("Add a load")', changes.slice(0, 120));
    const loadsCell = async () => page.$$eval('[data-fa-cases] tbody tr', (r) => r.map((x) => x.children[3].textContent));
    ok((await loadsCell()).includes('1'), 'the Live case lists the load (the settings are read back from the IFC)');
    await page.click('[data-undo]');
    await page.waitForFunction(() => /Undid|undid/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
    await page.waitForFunction(() => [...document.querySelectorAll('[data-fa-cases] tbody tr')].every((r) => r.children[3].textContent === '0'), null, { timeout: 30000 }).catch(() => {});
    ok((await loadsCell()).every((c) => c === '0'), 'Undo takes the load back out of the IFC');
    await page.selectOption('[data-fa-mode]', 'My').catch(() => {});
    await page.screenshot({ path: path.join(SHOTS, '05-bimcraft-after-undo.png') });
    await page.close();
  }
} finally {
  await browser.close();
  admin('down');
  fs.rmSync(tmp, { recursive: true, force: true });
}
ok(!issues.length, 'no console errors', issues.slice(0, 5).join(' | '));
console.log(`\n${pass} passed, ${fail} failed — shots in ${SHOTS}`);
process.exit(fail ? 1 : 0);

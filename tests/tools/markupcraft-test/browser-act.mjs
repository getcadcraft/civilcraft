#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * MarkupCraft 0.8 round 2 in a real (headless) browser, against /lab: the Tasks tab (make a task from a markup, link it to the drawing,
 * close it by itself when a newer revision changed the drawing), the plain list of changes, voice note (fake microphone) and decision
 * pins, and the redline package out and the answers file back in.
 *   node tools/markupcraft-test/browser-act.mjs [--out tmp/shots/markupcraft-act]
 * Run as root (it calls `sudo -u www-data php` for the test admin).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const { chromium } = await import('playwright-core');
const PDFLib = await import(path.join(REPO, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js'));
const args = process.argv.slice(2);
const OUT = path.resolve(REPO, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'tmp/shots/markupcraft-act');
const PLAN = path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf');
const BASE = 'https://getcadcraft.com';
fs.mkdirSync(OUT, { recursive: true });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'markupcraft-act-'));
let pass = 0, fail = 0;
const ok = (c, label, detail) => { if (c) { pass++; console.log('  ok   ' + label); } else { fail++; console.log('  FAIL ' + label + (detail !== undefined ? '  → ' + JSON.stringify(detail) : '')); } };

const REV = path.join(TMP, 'kitchen-rev-B.pdf');
{ const src = await PDFLib.PDFDocument.load(fs.readFileSync(PLAN)); const doc = await PDFLib.PDFDocument.create(); const [emb] = await doc.embedPdf(src, [0]);
  const page = doc.addPage([emb.width, emb.height]); page.drawPage(emb, { x: 0, y: 0 });
  page.drawRectangle({ x: 300, y: 300, width: 260, height: 140, borderColor: PDFLib.rgb(0, 0, 0), borderWidth: 2 });
  page.drawLine({ start: { x: 700, y: 200 }, end: { x: 1100, y: 600 }, thickness: 3 }); fs.writeFileSync(REV, await doc.save()); }

const { cookie } = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'session'], { encoding: 'utf8' }).trim().split('\n').pop());
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true, permissions: ['microphone'] });
  await ctx.addCookies([{ name: cookie.split('=')[0], value: cookie.split('=')[1], domain: 'getcadcraft.com', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' }]);
  await ctx.addInitScript(() => { try { localStorage.setItem('markupcraft.author', JSON.stringify('Act Tester')); } catch { /* */ } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  const orphans = await page.waitForFunction(() => window.markupcraft?.orphans !== undefined && { n: window.markupcraft.orphans }, null, { timeout: 15000 }).then(async (h) => (await h.jsonValue()).n, () => 0);
  if (orphans) { await page.click('[data-autosave-discard-all]').catch(() => {}); }
  await page.setInputFiles('[data-file]', PLAN);
  await page.waitForFunction(() => window.markupcraft?.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });
  const tab = async (k) => { await page.locator('[data-tab="' + k + '"]').click(); await page.waitForSelector('#mc-pane-' + k + ':not([hidden])'); };

  console.log('\n== Tasks');
  const id = await page.evaluate(() => { const m = window.markupcraft; const sh = m.sheets[0].page; let made; m.store.change('t', (tx) => { made = tx.add({ sheet: sh.key, type: 'cloudrect', rect: [300, 300, 560, 440], text: 'Redraw the hood wall', author: 'Ana' }); }); m.sel.add(made.id); return made.id; });
  await tab('tasks');
  ok(await page.locator('[data-task-list] .mc-note').count() === 1, 'no tasks yet says so');
  await page.click('[data-act="task-make"]');
  await page.waitForSelector('dialog[open] #mc-tk-title');
  ok(await page.inputValue('#mc-tk-title') === 'Redraw the hood wall', 'the dialog starts from the markup text');
  await page.selectOption('#mc-tk-kind', 'assistant'); await page.fill('#mc-tk-name', 'Claude'); await page.fill('#mc-tk-due', '2026-12-01');
  await page.click('dialog[open] .btn-plot');
  await page.waitForFunction((i) => window.markupcraft.store.get(i).task, id);
  let task = await page.evaluate((i) => window.markupcraft.store.get(i).task, id);
  ok(task.assignee.kind === 'assistant' && task.link?.kind === 'region' && task.link.segs.length > 5, 'task saved with an assistant and a region link holding the drawing', { a: task.assignee, link: task.link && task.link.segs.length });
  await page.waitForSelector('[data-task-list] .mc-item-title');
  ok((await page.locator('[data-task-list] .mc-item-meta').innerText()).includes('Claude'), 'the list shows the assistant');
  await page.click('[data-act="tasks-check"]');
  await page.waitForFunction(() => /no newer revision|Nothing changed/.test(document.querySelector('[data-status]').textContent));
  ok(await page.evaluate((i) => window.markupcraft.store.get(i).task.state, id) === 'Open', 'with no newer revision open the task stays open');
  await page.screenshot({ path: path.join(OUT, 'tasks.png') });

  console.log('\n== A newer revision closes it; the plain list of changes');
  await page.setInputFiles('[data-file]', [REV]);
  await page.waitForFunction(() => window.markupcraft.sheets.length === 2, null, { timeout: 30000 });
  await tab('compare');
  await page.locator('.mc-set-cmp summary').click();
  await page.click('[data-act="changes-list"]');
  await page.waitForFunction(() => /matched sheets changed/.test(document.querySelector('[data-changes-text]').textContent), null, { timeout: 30000 });
  const text = await page.locator('[data-changes-text]').innerText();
  ok(/1 of 1 matched sheets changed/.test(text) && /area/.test(text), 'the list says one sheet changed, with areas', text.slice(0, 300));
  await page.screenshot({ path: path.join(OUT, 'changes.png') });
  await tab('tasks');
  await page.click('[data-act="tasks-check"]');
  await page.waitForFunction((i) => window.markupcraft.store.get(i).task.state === 'Done', id, { timeout: 30000 });
  task = await page.evaluate((i) => window.markupcraft.store.get(i), id);
  ok(task.task.closed.how === 'change' && task.status === 'Completed' && /changed/.test(task.task.closed.summary), 'checking closes it because the drawing changed, and completes the markup', task.task.closed);
  await page.evaluate(() => window.markupcraft.store.undo());
  ok(await page.evaluate((i) => window.markupcraft.store.get(i).task.state, id) === 'Open', 'one undo step reopens it');

  console.log('\n== EG.64 (decided 2026-10-29): closing on a newer revision is a per-project setting, default off');
  ok(await page.locator('[data-task-autoclose]').isChecked() === false, 'the setting is off by default');
  await page.check('[data-task-autoclose]');
  ok(await page.evaluate(() => Object.keys(localStorage).some((k) => k.startsWith('markupcraft.autoclose:') && localStorage[k] === 'true')), 'turning it on is remembered for this project');
  await page.setInputFiles('[data-file]', [REV]);
  await page.waitForFunction(() => window.markupcraft.sheets.length === 3, null, { timeout: 30000 });
  await page.waitForFunction((i) => window.markupcraft.store.get(i).task.state === 'Done', id, { timeout: 30000 }).catch(() => {});
  ok(await page.evaluate((i) => window.markupcraft.store.get(i).task.state, id) === 'Done', 'with it on, opening a newer revision closes the task with no button press');
  await page.evaluate(() => window.markupcraft.store.undo());
  await page.uncheck('[data-task-autoclose]');

  console.log('\n== Voice note and decision');
  await tab('notes');
  await page.click('[data-act="voice-record"]');
  await page.waitForFunction(() => document.querySelector('[data-voice-label]').textContent === 'Stop recording', null, { timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.click('[data-act="voice-record"]');
  await page.waitForFunction(() => [...window.markupcraft.store.all()].some((m) => m.voice), null, { timeout: 8000 });
  const v = await page.evaluate(() => window.markupcraft.store.all().find((m) => m.voice).voice);
  ok(/^audio\//.test(v.mime) && v.dur > 0.5 && v.data.length > 100, 'a voice note is saved on the sheet', { mime: v.mime, dur: v.dur, len: v.data.length });
  await page.click('[data-act="decision-add"]');
  await page.fill('[data-decision-text]', 'Door D3 stays at 900');
  await page.click('[data-act="decision-save"]');
  await page.waitForFunction(() => [...window.markupcraft.store.all()].some((m) => m.decision));
  ok(await page.locator('[data-notes-list] li').count() === 2, 'the Notes list shows both');
  await page.screenshot({ path: path.join(OUT, 'notes.png') });

  console.log('\n== Redline out, answers in');
  await tab('tasks');
  await page.locator('#mc-pane-tasks details summary').first().click();
  await page.fill('[data-redline-rev]', 'B');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act="redline-export"]')]);
  ok(/\.redline\.json$/.test(dl.suggestedFilename()), 'a .redline.json file downloads', dl.suggestedFilename());
  const pkg = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  ok(pkg.format === 'cc-redline' && pkg.revision === 'B' && pkg.items.some((i) => i.id === id && i.task?.assignee?.kind === 'assistant'), 'the package holds the open markup with its task', pkg.items.map((i) => i.id));
  const ans = path.join(TMP, 'a.redline-answers.json');
  fs.writeFileSync(ans, JSON.stringify({ format: 'cc-redline-answers', v: 1, by: 'Dee', items: [{ id, decision: 'accepted', note: 'Redrawn in rev B' }] }));
  const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-act="redline-answers"]')]);
  await fc.setFiles(ans);
  await page.waitForFunction(() => /1 markups answered/.test(document.querySelector('[data-redline-status]').textContent));
  const m = await page.evaluate((i) => { const x = window.markupcraft.store.get(i); return { status: x.status, last: x.replies.at(-1).text, task: x.task.state }; }, id);
  ok(m.status === 'Accepted' && m.last === 'Redrawn in rev B' && m.task === 'Done', 'the answer sets Accepted, adds the note, finishes the task', m);
  console.log('\n== The showcase file: revision C closes the stair task and leaves the calm one');
  const p2 = await ctx.newPage();
  p2.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await p2.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  const orph = await p2.waitForFunction(() => window.markupcraft?.orphans !== undefined && { n: window.markupcraft.orphans }, null, { timeout: 15000 }).then(async (h) => (await h.jsonValue()).n, () => 0);
  if (orph) await p2.click('[data-autosave-discard-all]').catch(() => {});
  await p2.setInputFiles('[data-file]', path.join(REPO, 'fixtures/showcase/markupcraft-markups-that-act.pdf'));
  await p2.waitForFunction(() => window.markupcraft?.sheets.length === 4, null, { timeout: 30000 }); await p2.waitForTimeout(1500);
  await p2.locator('[data-tab="tasks"]').click();
  await p2.waitForFunction(() => document.querySelectorAll('[data-task-list] > li').length >= 3, null, { timeout: 5000 }).catch(() => {});
  ok(await p2.locator('[data-task-list] > li').count() === 3, 'the showcase opens with three tasks', await p2.locator('[data-task-list] > li').count());
  ok(await p2.locator('[data-task-list] .mc-item-meta', { hasText: 'overdue' }).count() === 1, 'one is overdue');
  await p2.setInputFiles('[data-file]', path.join(REPO, 'fixtures/showcase/cadcraft-sample-house-rev-C.pdf'));
  await p2.waitForFunction(() => window.markupcraft.sheets.length === 8, null, { timeout: 30000 });
  await p2.click('[data-act="tasks-check"]');
  await p2.waitForFunction(() => /closed because/.test(document.querySelector('[data-status]').textContent), null, { timeout: 30000 });
  const states = await p2.evaluate(() => Object.fromEntries(window.markupcraft.store.all().filter((m) => m.task).map((m) => [m.id, m.task.state])));
  ok(states['act-1'] === 'Done' && states['act-2'] === 'Open' && states['act-3'] === 'Open', 'revision C closes only the stair task', states);
  await p2.screenshot({ path: path.join(OUT, 'showcase-closed.png') });
  ok(problems.length === 0, 'no console errors', problems.slice(0, 6));
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'down'], { stdio: 'ignore' });
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed. Shots in ' + path.relative(REPO, OUT) + '/');
process.exit(fail ? 1 : 0);

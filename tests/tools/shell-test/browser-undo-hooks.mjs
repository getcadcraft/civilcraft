#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-undo-hooks.mjs — EG.77 (0.9 mounts-09): the undo hook in DetailCraft and TakeoffCraft, in the real lab page, headless. Run as root.
 *   node tools/shell-test/browser-undo-hooks.mjs
 * An edit through the app's own model is told to the window (event cc-undo-report, edit.done with step, label, depth); window.ccUndoReporter answers
 * Studio's undo.probe / undo.run for the app's own next undo and refuses a step that is no longer the top one; the app's own undo is told once.
 * Opening a file (DetailCraft replaces its model; TakeoffCraft reloads it) leaves the probe saying "moved", never a forced undo.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' - ' + JSON.stringify(d).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const lab = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' })).cookie.split('=');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: lab[0], value: lab.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const problems = [];

const APPS = {
  detailcraft: {
    model: 'window.detailcraft.model',
    edit: (n) => `m.change('Check step ${n}', (tx) => tx.setName('undo-check-${n}'))`,
    read: () => 'm.state.name',
    reopen: 'm.load(m.toJSON())',
  },
  takeoffcraft: {
    model: 'window.takeoffcraft.model',
    edit: (n) => `m.change('Check step ${n}', (s) => { s.name = 'undo-check-${n}'; })`,
    read: () => 'm.state.name',
    reopen: 'm.load(m.toJSON())',
  },
};

try {
  for (const [slug, a] of Object.entries(APPS)) {
    console.log('== ' + slug);
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push(slug + ' console: ' + m.text()); });
    page.on('pageerror', (e) => problems.push(slug + ' pageerror: ' + e.message));
    await page.goto(`${BASE}/lab/${slug}?space=paper`, { waitUntil: 'networkidle' });
    await page.waitForFunction((src) => { try { return !!eval(src) && !!window.ccUndoReporter; } catch (e) { return false; } }, a.model, { timeout: 30000 });
    ok(true, 'the window offers the undo reporter to Studio');
    await page.evaluate(() => { window.__ev = []; window.addEventListener('cc-undo-report', (e) => window.__ev.push(e.detail)); });
    const ev = () => page.evaluate(() => JSON.parse(JSON.stringify(window.__ev)));
    const m = `const m = ${a.model};`;
    await page.evaluate(`(() => { ${m} ${a.edit(1)}; })()`);
    let e = await ev();
    ok(e.length === 1 && e[0].type === 'edit.done' && e[0].data.kind === 'do' && e[0].data.label === 'Check step 1' && e[0].data.depth >= 1, 'one edit = one finished step told to Studio', e);
    const step1 = e[0]?.data.step;
    await page.evaluate(`(() => { ${m} ${a.edit(2)}; })()`);
    e = await ev();
    const step2 = e[1]?.data.step;
    ok(e.length === 2 && step2 && step2 !== step1 && e[1].data.depth === e[0].data.depth + 1, 'the next edit is a second step, one deeper');
    let probe = await page.evaluate(() => window.ccUndoReporter.onMessage('undo.probe', {}));
    ok(probe && probe.step === step2 && probe.label === 'Check step 2', 'Studio\'s probe names the top step', probe);
    const refused = await page.evaluate((s) => window.ccUndoReporter.onMessage('undo.run', { step: s }), step1);
    ok(refused && refused.ok === false, 'a run for a step that is not the top one is refused', refused);
    ok((await page.evaluate(`(() => { ${m} return ${a.read()}; })()`)) === 'undo-check-2', 'the refused run changed nothing');
    const run = await page.evaluate((s) => window.ccUndoReporter.onMessage('undo.run', { step: s }), step2);
    ok(run && run.ok === true, 'Studio\'s run undoes the top step through the app\'s own undo', run);
    ok((await page.evaluate(`(() => { ${m} return ${a.read()}; })()`)) === 'undo-check-1', 'the model is back at step 1');
    e = await ev();
    ok(e.length === 3 && e[2].data.kind === 'undo', 'the undo is told once', e.map((x) => x.data.kind));
    // the app's own undo (Ctrl+Z path) is told too
    await page.evaluate(`(() => { ${m} m.undo(); })()`);
    e = await ev();
    ok(e.length === 4 && e[3].data.kind === 'undo', 'the app\'s own undo is told to the journal');
    // a window that changed behind the reporter's back: the probe does not offer a step
    await page.evaluate(`(() => { ${m} ${a.edit(3)}; })()`);
    e = await ev();
    const top = e[e.length - 1].data.step;
    await page.evaluate(`(() => { ${m} ${a.reopen}; })()`);
    probe = await page.evaluate(() => window.ccUndoReporter.onMessage('undo.probe', {}));
    ok(!probe.step, 'after a file is opened the probe has no step to offer (Studio skips this window)', probe);
    const stale = await page.evaluate((s) => window.ccUndoReporter.onMessage('undo.run', { step: s }), top);
    ok(stale && stale.ok === false, 'a run for a step from before the file opened is refused');
    await page.close();
  }
  ok(problems.length === 0, 'no console or page errors', problems);
} catch (err) { fail++; console.log('  FAIL threw - ' + (err && err.message || err)); } finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

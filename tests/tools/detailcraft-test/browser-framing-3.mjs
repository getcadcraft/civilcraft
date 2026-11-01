#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-framing-3.mjs — the Framing tab's round-3 parts in the real app (EG.6): a wall placed as members (and removed), one undo step each, the Analysis
 * leaving them out, the weight a timber one, the PDF sheets downloaded and read back; no console errors.
 *
 *   node tools/detailcraft-test/browser-framing-3.mjs [--shots <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const lab = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' })).cookie.split('=');   // a signed-in lab session: no password login (the sign-in is throttled for everyone at once)
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const dc = (fn, arg) => page.evaluate(fn, arg);
const row = (id) => page.locator(`[data-props] [data-pg-row="${id}"]`);
const footing = () => dc(() => { const f = window.detailcraft.model.state.footings[0]; return JSON.parse(JSON.stringify(f)); });

try {
  await page.context().addCookies([{ name: lab[0], value: lab.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(`${BASE}/lab/detailcraft?space=paper`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.detailcraft, null, { timeout: 15000 });
  await page.click('[data-tab="framing"]');
  await page.click('[data-frm-add="wall"]');
  await page.waitForSelector('[data-frame-place="0"]');
  const before = await dc(() => window.detailcraft.model.state.members.length);
  await page.click('[data-frm-place="0"]');
  await page.waitForSelector('[data-frm-unplace="0"]');
  const after = await dc(() => ({ n: window.detailcraft.model.state.members.length, tagged: window.detailcraft.model.state.members.filter((m) => m.panel).length, kg: window.detailcraft.built.parts.reduce((a, p) => a + p.weight, 0), label: window.detailcraft.model.undoStack.at(-1).label }));
  const pieces = Number((await page.textContent('[data-frm-summary="0"]')).match(/(\d+) pieces/)[1]);
  ok(after.n - before === pieces && after.tagged === pieces, 'the wall\'s ' + pieces + ' pieces are in the model as members');
  ok(after.kg < 200, 'they weigh like timber (' + Math.round(after.kg) + ' kg), not steel');
  ok(/Place framing/.test(after.label), 'one undo step: ' + after.label);
  // the Analysis leaves them out
  const ana = await dc(() => { const a = window.detailcraft.analysis; try { const r = a.run(); return JSON.stringify(a.result?.frame?.model?.members?.length ?? r?.frame?.model?.members?.length ?? 'none'); } catch (e) { return 'err ' + e.message; } });
  ok(/^("none"|0|"0")$/.test(ana) || /none|0/.test(ana), 'the Analysis takes none of them: ' + ana);
  await dc(() => window.detailcraft.model.undo());
  ok(await dc(() => window.detailcraft.model.state.members.length) === before, 'undo takes them all back in one step');
  // place again then remove
  await dc(() => window.detailcraft.model.redo());
  await page.click('[data-tab="framing"]');
  await page.waitForSelector('[data-frm-unplace="0"]');
  await page.click('[data-frm-unplace="0"]');
  await page.waitForFunction((n) => window.detailcraft.model.state.members.length === n, before);
  ok(true, 'Remove takes them out again');
  // the PDF
  const dl = page.waitForEvent('download', { timeout: 20000 });
  await page.click('[data-frm-pdf]');
  const d = await dl;
  const f = '/tmp/claude-0/dc-framing-3-browser.pdf';
  await d.saveAs(f);
  const text = execFileSync('pdftotext', ['-layout', f, '-'], { encoding: 'utf8' });
  ok(/Wall 1/.test(text) && /2x4/.test(text) && /Mark/.test(text), 'the PDF sheet holds the title, the sizes and the cut list: ' + d.suggestedFilename());
  fs.unlinkSync(f);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'detailcraft-framing-3.png') });
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

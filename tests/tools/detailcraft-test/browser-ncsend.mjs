#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-ncsend.mjs — "Send NC" in the real app (0.8 round 3, EG.40): hidden without Studio's machine dialog, shown with one, hands over the NC1 files of the parts (uploaded, never
 * started), says what happened; no console errors. The dialog here is a stand-in for studio_PART_3's.
 *
 *   node tools/detailcraft-test/browser-ncsend.mjs [--shots <dir>]
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
  await dc(() => { const m = window.detailcraft.model; m.change('x', (tx) => {
    tx.addMember({ type: 'beam', profile: 'W16x26', material: 'A992', position: 'middle', rotation: 0, start: [0, 0, 4000], end: [6000, 0, 4000], phase: 1 });
    tx.addMember({ type: 'column', profile: 'W10x49', material: 'A992', position: 'middle', rotation: 0, start: [0, 0, 0], end: [0, 0, 4000], phase: 1 }); }); });
  const btn = page.locator('.dc-tool-row > [data-act="nc-send"]');
  ok(await btn.count() === 1 && await btn.isHidden(), 'without Studio\'s dialog the button is hidden');
  // a stand-in for the desktop bridge and the dialog
  await dc(() => { window.__sent = null; window.cadcraftDesktop = Object.assign(window.cadcraftDesktop || {}, { machines: { request() {} } }); window.ccSendToMachine = async (job) => { window.__sent = job; return { ok: true, sent: job.files.length }; }; window.detailcraft.model.emit('change'); });
  await page.waitForFunction(() => !document.querySelector('.dc-tool-row > [data-act="nc-send"]').hidden);
  ok(true, 'with the bridge and the dialog it shows');
  await btn.click();
  await page.waitForFunction(() => window.__sent);
  const job = await dc(() => ({ app: window.__sent.app, kind: window.__sent.kind, names: window.__sent.files.map((f) => f.name), bytes: window.__sent.files.map((f) => f.bytes.length), isBytes: window.__sent.files.every((f) => f.bytes instanceof Uint8Array), note: window.__sent.note }));
  ok(job.app === 'detailcraft' && job.kind === 'nc1' && job.names.length >= 2 && job.names.every((n) => /\.nc1$/.test(n)) && job.isBytes && job.bytes.every((n) => n > 100), 'the NC1 files of the parts are handed over as bytes: ' + job.names.join(', '));
  const text = await dc(() => document.querySelector('[data-status]').textContent);
  ok(/Sent \d+ NC files/.test(text), 'the status says so: ' + text.slice(0, 80));
  // refusal and failure are said, not hidden
  await dc(() => { window.ccSendToMachine = async () => ({ ok: false, error: 'machine is off' }); });
  await btn.click();
  await page.waitForFunction(() => /not sent/.test(document.querySelector('[data-status]').textContent));
  ok(true, 'a failure is told');
  await dc(() => { window.ccSendToMachine = async () => ({ ok: false, cancelled: true }); });
  await btn.click();
  await page.waitForFunction(() => /Nothing was sent/.test(document.querySelector('[data-status]').textContent));
  ok(true, 'cancelling is told');
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

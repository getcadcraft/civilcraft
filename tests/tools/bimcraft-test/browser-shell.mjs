#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-shell.mjs — BimCraft's mount of the shell modules (0.8 round 3, oltl-eg-a_PART_3) in the lab, headless.
 *   node tools/bimcraft-test/browser-shell.mjs        (run as root; BimCraft's test admin, tools/bimcraft-test/admin.php up|down)
 * A new building: calc sheets attached (a sheet is kept in the IFC as CadCraft_Shell, one undo step, the saved file holds it and reopening brings it
 * back), the lesson "Your first model" is registered and its steps complete from the model (wall, door by the app's own tools are covered by
 * shell-mount-test.mjs; here the first step), the totals tools and the Ask box are there. Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 200) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/bimcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const problems = [];
await ctx.addInitScript(() => { try { localStorage.setItem('cadcraft.assistants.bimcraft', JSON.stringify({ enabled: true, groups: ['read', 'edit'] })); } catch { /* */ } });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (p, re, timeout = 60000) => p.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Shell test');
  await page.click('[data-new-ok]');
  await waitStatus(page, /^New building Shell test/);

  console.log('== The modules are there');
  const st = await page.evaluate(() => ({ calc: window.ccCalc?.state?.(), lessons: !!window.ccLessons, reasons: !!window.ccReasons, totals: !!window.ccTotals, suggest: !!window.ccSuggest, ask: !!window.ccAsk }));
  ok(st.calc?.attached === true, 'calc sheets are attached (so they are saved)', st);
  ok(st.lessons && st.reasons && st.totals && st.suggest && st.ask, 'lessons, reasons, totals, Suggest and the Ask box are loaded', st);
  const les = await page.evaluate(() => { const s = window.ccLessons.state(); return JSON.stringify(s).slice(0, 400); });
  ok(/first-model/.test(les), 'the lesson "Your first model" is registered', les);
  const tools = await page.evaluate(() => { window.bimcraftControl.configure({ enabled: true, groups: ['read', 'edit', 'save', 'export'] }); return window.bimcraftControl.list().map((t) => t.name); });
  for (const n of ['calcs_list', 'reasons_list', 'lessons_status', 'ask_list', 'suggestions_list']) ok(tools.includes(n), 'assistant tool ' + n, tools.length);

  console.log('== Running totals: the change since the last save (EG.30)');
  const tt = await page.evaluate(async () => {
    let kg = 1000; const T = window.ccTotals; const h = T.source({ id: 'test.w', measure: 'weight', label: 'Test', read: () => kg });
    T.reset(); await new Promise((r) => setTimeout(r, 400)); kg = 1600; h.invalidate(); await new Promise((r) => setTimeout(r, 500));
    const chip = document.querySelector('.cct-chip-weight [data-since]'); const first = chip ? chip.textContent : null;
    T.markSaved(); await new Promise((r) => setTimeout(r, 500));
    const after = document.querySelector('.cct-chip-weight [data-since]'); h.remove();
    return { first, after: after ? after.textContent : null };
  });
  ok(tt.first === '+600 kg' && tt.after === null, 'the chip says +600 kg, and nothing after a save', tt);
  console.log('== A calc sheet lives in the IFC');
  await page.evaluate(() => { const c = window.ccCalc.calcs; const s = c.addSheet({ title: 'Beam check' }); c.setRow(s.id, null, { name: 'span', expr: '6 m' }); c.setRow(s.id, null, { name: 'half', expr: 'span / 2' }); });
  await page.waitForTimeout(900);
  const half = await page.evaluate(() => window.ccCalc.calcs.view({})[0].rows.map((r) => r.text).join('|'));
  ok(/3/.test(half), 'the sheet computes (span / 2)', half);
  const pr = await page.evaluate(async () => {
    window.ccCalc.open(); await new Promise((r) => setTimeout(r, 300));
    const b = document.querySelector('[data-k="print"]'); if (!b) return { button: false };
    let src = '';
    const mo = new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.tagName === 'IFRAME') { src = n.srcdoc; n.onload = null; } });
    mo.observe(document.body, { childList: true }); b.click(); await new Promise((r) => setTimeout(r, 400)); mo.disconnect();
    return { button: true, src };
  });
  ok(pr.button && /Beam check/.test(pr.src) && /9\.84|3 m|span/.test(pr.src), 'Print makes the page of every sheet (EG.18 printed with the set)', pr.src && pr.src.slice(0, 100));
  console.log('== Design reasons live in the IFC (EG.34)');
  await page.evaluate(() => window.ccReasons.reasons.set({ kind: 'element', id: 'beam-eg34', label: 'Beam B1' }, { requirement: 'Carry the floor over a 6 m span', decision: 'Steel for the span, 2026-10-29' }));
  await page.evaluate(() => { window.ccReasons.open(); });
  await page.waitForTimeout(900);
  const panel = await page.evaluate(() => [...document.querySelectorAll('[data-reason]')].map((b) => b.textContent).join('|'));
  ok(/Beam B1|Steel for the span/.test(panel), 'the Reasons panel shows the record', panel);
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('[data-save]')]);
  const p1 = path.join(REPO, 'tmp/eg-a/shell-saved.ifc');
  fs.mkdirSync(path.dirname(p1), { recursive: true });
  await dl.saveAs(p1);
  const txt = fs.readFileSync(p1, 'latin1');
  ok(/CadCraft_Shell/.test(txt) && /Beam check/.test(txt), 'the saved IFC holds the sheet (CadCraft_Shell on the IfcProject)');
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  const orphan = await page.$('[data-autosave-discard-all]'); if (orphan) await orphan.click().catch(() => {});
  await page.setInputFiles('[data-file]', p1);
  await waitStatus(page, /^Opened /);
  await page.waitForTimeout(600);
  const back = await page.evaluate(() => window.ccCalc.calcs.sheets().map((s) => s.title).join('|'));
  ok(back === 'Beam check', 'reopened: the sheet is back', back);
  const rb = await page.evaluate(() => { const r = window.ccReasons.reasons.get({ kind: 'element', id: 'beam-eg34' }); return r ? r.decision + ' | ' + r.requirement : null; });
  ok(rb === 'Steel for the span, 2026-10-29 | Carry the floor over a 6 m span', 'reopened: the reasons for the beam are back', rb);
  const l2 = await page.evaluate(() => { window.ccLessons.start('first-model'); return JSON.stringify(window.ccLessons.state()).slice(0, 300); });
  ok(/open|wall/.test(l2), 'the lesson starts and the model answers its first step', l2);
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.message || e).split('\n')[0]);
} finally {
  const real = problems.filter((p) => !/favicon/.test(p));
  ok(real.length === 0, 'no console errors' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : ''));
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

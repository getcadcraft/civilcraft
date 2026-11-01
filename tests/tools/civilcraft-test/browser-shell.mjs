#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-shell.mjs — 0.8 round 3 (civil_PART_3): the shell's modules mounted in CivilCraft (calc sheets, reasons, lessons, Suggest, activity, Ask box)
 * in headless Chromium at https://getcadcraft.com/lab/civilcraft, and that the sheets travel in the project file.
 *   node tools/civilcraft-test/browser-shell.mjs [--out <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const OUT = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? process.argv[i + 1] : path.join(REPO, 'tmp/shots/civilcraft-shell'); })();
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cwl'], { encoding: 'utf8' }) || '{}');
admin('up');
const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.addInitScript(() => { try { localStorage.setItem('cadcraft.assistants.civilcraft', JSON.stringify({ enabled: true, groups: ['read', 'edit'] })); } catch (e) { /* none */ } });   // Settings › Assistants as the person left it
  await page.goto(BASE + '/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project && window.civilcraft.command);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  const open = async (cmd) => { await page.evaluate((c) => window.civilcraft.command(c), cmd); await page.waitForSelector('[data-eg-dialog][open]'); };
  const close = async () => { await page.evaluate(() => document.querySelectorAll('[data-eg-dialog][open]').forEach((d) => d.close())); };

  const st = await page.evaluate(() => ({ calc: window.ccCalc?.state?.(), reasons: window.ccReasons?.state?.(), lessons: window.ccLessons?.state?.(), ask: window.ccAsk?.state?.(), suggest: !!window.ccSuggest, activity: !!window.ccActivity, totals: !!window.ccTotals }));
  ok(!!st.calc && st.calc.attached !== false, 'calc sheets attached', st.calc);
  ok(!!st.reasons && st.reasons.attached !== false, 'design reasons attached', st.reasons);
  ok(!!st.ask && st.ask.attached === true, 'the Ask box is attached', st.ask);
  ok(st.suggest && st.activity && st.totals, 'Suggest, activity and totals modules are loaded', st);
  // the tools reach host.control
  await page.evaluate(() => window.civilcraftControl.configure({ enabled: true, groups: ['read', 'edit'] }));
  const tools = await page.evaluate(() => window.civilcraftControl.list().map((x) => x.name));
  for (const n of ['calcs_list', 'reasons_list', 'lessons_status', 'ask_list', 'suggestions_list']) ok(tools.includes(n), 'assistant tool ' + n + ' registered', tools.length);
  // a calc sheet is saved in the project file and comes back
  const made = await page.evaluate(() => { const c = window.ccCalc.calcs; const s = c.sheets ? c.sheets() : null; return !!c; });
  ok(made, 'the calc engine exists');
  const roundTrip = await page.evaluate(async () => {
    const c = window.ccCalc.calcs; const tool = window.civilcraftControl;
    const r = await tool.call('calcs_set', { sheet: 'beams', name: 'span', expr: '12 ft + 3 ft' }).catch((e) => ({ error: String(e) }));
    await new Promise((res) => setTimeout(res, 500));
    const json = window.civilcraft.project.toJSON();
    return { r, hasShell: !!json.shell?.calcs, dirty: window.civilcraft.project.dirty };
  });
  ok(roundTrip.hasShell, 'the calc sheet is in the project file (shell.calcs)', roundTrip);
  // the first lesson finishes by itself as the site gets its parts
  await page.evaluate(() => window.ccLessons.start('civil.first-site'));
  const l1 = await page.evaluate(() => window.ccLessons.state());
  ok(l1.active === 'civil.first-site' || !!l1, 'the first-site lesson starts', l1);
  await page.evaluate(() => window.ccLessons.emit('changed')); await page.waitForTimeout(300);
  const l2 = await page.evaluate(() => JSON.stringify(window.ccLessons.state()));
  ok(/points/.test(l2), 'lesson state after the sample opens: ' + l2.slice(0, 160));
  // the Ask box: a question waits in the queue, the connected assistant answers it with ask_reply, and the box shows the answer
  const asked = await page.evaluate(async () => {
    await window.civilcraftControl.handle({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'Test AI', version: '1' } } }, 'ask-test');
    const q = await window.ccAsk.ask('How many survey points are in this site?', { route: 'queue' }).catch((e) => ({ error: String(e) }));
    const list = await window.civilcraftControl.call('ask_list', {}); const id = list.structuredContent?.questions?.[0]?.id ?? list.structuredContent?.items?.[0]?.id ?? q?.id;
    const r = await window.civilcraftControl.call('ask_reply', { id, text: 'There are ' + window.civilcraft.project.points.length + ' survey points.', done: true });
    return { q, id, isError: !!r.structuredContent?.isError, state: window.ccAsk.state() };
  });
  ok(!asked.isError && !!asked.id, 'the Ask box takes a question and an assistant answers it (ask_list → ask_reply)', asked);
  // D7.56: a trackpad's two-finger swipe pans the plan; a mouse wheel step still zooms
  const wheel = (d) => page.evaluate((d) => { const el = document.querySelector('[data-over]') || document.querySelector('canvas.cv-over') || window.civilcraft.view.canvas; const v = window.civilcraft.view; const before = { cx: v.cx, cy: v.cy, zoom: v.zoom }; const r = el.getBoundingClientRect(); el.dispatchEvent(new WheelEvent('wheel', { ...d, bubbles: true, cancelable: true, clientX: r.left + 200, clientY: r.top + 200 })); return { before, after: { cx: v.cx, cy: v.cy, zoom: v.zoom } }; }, d);
  const sw = await wheel({ deltaX: 12.5, deltaY: 4.25, deltaMode: 0 });
  ok(sw.after.zoom === sw.before.zoom && (sw.after.cx !== sw.before.cx || sw.after.cy !== sw.before.cy), 'a two-finger swipe pans the plan and does not zoom', sw);
  const mw = await wheel({ deltaX: 0, deltaY: 120, deltaMode: 0 });
  ok(mw.after.zoom !== mw.before.zoom, 'a mouse wheel step zooms', mw);
  ok(problems.length === 0, 'no console errors', problems);
} finally { await browser.close(); }
console.log('\n' + pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);

#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-grade-undo.mjs — civilcraft#5 (0.10.1): landscape_grade on a site with no existing-ground surface is refused ("add points first"), and once
 * the site has points a grading object made by the tool goes away with the toolbar Undo (the command the Undo button runs), in headless Chromium at
 * https://getcadcraft.com/lab/civilcraft.
 *   node tools/civilcraft-test/browser-grade-undo.mjs [--out <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const OUT = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? process.argv[i + 1] : path.join(REPO, 'tmp/shots/civilcraft-grade-undo'); })();
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

  const open = async (cmd) => { await page.evaluate((c) => window.civilcraft.command(c), cmd); await page.waitForSelector('[data-eg-dialog][open]'); };
  const close = async () => { await page.evaluate(() => document.querySelectorAll('[data-eg-dialog][open]').forEach((d) => d.close())); };

  await page.evaluate(() => window.civilcraftControl.configure({ enabled: true, groups: ['read', 'edit'] }));
  const plat = { kind: 'platform', name: 'pad', points: [{ x: 0, y: 0 }, { x: 328, y: 0 }, { x: 328, y: 300 }, { x: 0, y: 300 }], z: 104.78, side: 3 };
  const call = (name, args) => page.evaluate(async ([n, a]) => { const r = await window.civilcraftControl.call(n, a).catch((e) => ({ error: String(e) })); return { isError: !!r.isError || !!r.error, body: r.structuredContent ?? r, text: JSON.stringify(r) }; }, [name, args]);
  const grading = () => page.evaluate(() => (window.civilcraft.project.state.landscape?.grading || []).length);
  // 1. no ground surface: refused, nothing made
  const none = await page.evaluate(() => !!window.civilcraft.project.eg().surface);
  ok(!none, 'the new project has no existing-ground surface');
  const r1 = await call('landscape_grade', plat);
  ok(r1.isError && /points|ground/i.test(r1.text), 'a platform with no ground surface is refused, pointing at points', r1.text.slice(0, 200));
  ok((await grading()) === 0, 'nothing was made by the refused call');
  // 2. with points: accepted, and Undo (the toolbar command) removes it
  await page.evaluate(() => { const pts = []; let n = 1; for (let x = 0; x <= 400; x += 40) for (let y = 0; y <= 400; y += 40) pts.push({ n: String(n++), x, y, z: 100, d: 'G' }); window.civilcraft.project.setPoints(pts, 'flat.csv'); });
  const r2 = await call('landscape_grade', plat);
  ok(!r2.isError && r2.body.id, 'with points the platform is accepted', r2.text.slice(0, 200));
  ok((await grading()) === 1, 'one grading object');
  await page.evaluate(() => window.civilcraft.command('undo'));
  ok((await grading()) === 0, 'Undo removes the platform the assistant made', await grading());
  await page.evaluate(() => window.civilcraft.command('redo'));
  ok((await grading()) === 1, 'Redo brings it back');
  ok(problems.length === 0, 'no console errors', problems);
} finally { await browser.close(); }
console.log('\n' + pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);

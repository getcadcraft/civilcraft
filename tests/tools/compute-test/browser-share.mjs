#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-share.mjs — hardware specs shared for more efficient engines (owner 2026-10-24; lib/compute/report.js, HardwareReports,
 * POST /api/v1/hardware, Settings › Global › Hardware specs): in the browser one anonymous report is sent by default (no cookies,
 * once a month); "Don't share my hardware specs" stops it; in the desktop app (window.cadcraftDesktop) the default is not to share;
 * the "Your machine" card says which. 0.7 HW.2: the same for CadCraft (one of the six apps that send through the shell's light probe,
 * assets/js/app-hardware.js), and BimCraft never loads that copy. Run as root (Playwright; the bimres test admin). Reports it sends are deleted at the end.
 *   node tools/compute-test/browser-share.mjs
 */
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + d + ')' : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimres'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-unsafe-webgpu'] });
const php = (code) => execFileSync('sudo', ['-u', 'www-data', 'php', '-r', "require '" + path.join(REPO, 'public_html/core/bootstrap.php') + "'; " + code], { encoding: 'utf8' });
const before = +php("echo (int)db()->query('SELECT COALESCE(MAX(id),0) FROM hardware_reports')->fetchColumn();");

async function session(init, fn, app = 'bimcraft') {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  if (init) await page.addInitScript(init);
  const sent = [];
  page.on('request', (r) => { if (r.url().includes('/api/v1/hardware') && r.method() === 'POST') sent.push({ body: r.postDataJSON(), cookie: r.headers().cookie || '' }); });
  // the share waits for the page to settle (20 s): tests make the timers short
  await page.addInitScript(() => { const st = window.setTimeout; window.setTimeout = (f, ms, ...a) => st(f, ms === 20000 ? 300 : ms, ...a); });
  await page.goto('https://getcadcraft.com/lab/' + app, { waitUntil: 'networkidle' });
  try { await fn(page, sent); } finally { await ctx.close(); }
}

console.log('== the browser: shared by default, once');
await session(null, async (page, sent) => {
  await page.waitForTimeout(4000);
  ok(sent.length === 1, 'one report is sent a moment after the app opens', sent.length);
  const b = sent[0]?.body || {};
  ok(b.app === 'bimcraft' && b.surface === 'web' && 'facts' in b && typeof b.facts.cores === 'number' && b.screen?.w > 0, 'it carries the probe\'s facts, the app, the screen', JSON.stringify(b).slice(0, 160));
  ok(!sent[0]?.cookie && !JSON.stringify(b).includes('@') && !('user' in b) && !('email' in b), 'no cookies and nothing about the person');
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(3000);
  ok(sent.length === 1, 'not again on the next visit (once a month)', sent.length);
  await page.evaluate(() => document.querySelector('[data-settings-open]').click()); await page.waitForSelector('dialog[data-app-settings][open]');
  await page.click('[data-settings-tab="general"]').catch(() => {});
  await page.click('.shell-sec-nav button:has-text("Hardware specs")').catch(() => {});
  ok(await page.isVisible('[data-hw-set]') && !(await page.isChecked('[data-hw-noshare]')) && /aggregated and not associated with your account/.test(await page.textContent('[data-hw-set]')),
    'Settings › Global › Hardware specs: "Don\'t share my hardware specs" off, with the message');
  await page.click('[data-settings-tab="app"]').catch(() => {});
  const card = await page.evaluate(() => document.querySelector('[data-compute-share]')?.dataset.computeShare || '');
  ok(card === 'on' || card === '', 'the Your machine card says the specs are shared', card);
});
console.log('== the browser, "Don\'t share" ticked');
await session(() => { try { localStorage.setItem('cc-hw-share', 'off'); } catch (e) {} }, async (page, sent) => {
  await page.waitForTimeout(4000);
  ok(sent.length === 0, 'nothing is sent', sent.length);
});
console.log('== the desktop app: not shared unless turned on');
await session(() => { window.cadcraftDesktop = { version: 'test' }; }, async (page, sent) => {
  await page.waitForTimeout(4000);
  ok(sent.length === 0, 'nothing is sent by default', sent.length);
  await page.evaluate(() => document.querySelector('[data-settings-open]').click()); await page.waitForSelector('dialog[data-app-settings][open]');
  await page.click('[data-settings-tab="general"]').catch(() => {});
  await page.click('.shell-sec-nav button:has-text("Hardware specs")').catch(() => {});
  ok(await page.isChecked('[data-hw-noshare]') && /desktop app/.test(await page.textContent('[data-hw-default]')), '"Don\'t share my hardware specs" is ticked, and the line says why');
});

// 0.7 HW.2: the six apps without the compute engine send the same report through the shell (assets/js/app-hardware.js, light probe)
console.log('== CadCraft (light probe through the shell): shared by default, once');
await session(null, async (page, sent) => {
  await page.waitForTimeout(5000);
  ok(await page.evaluate(() => !!document.getElementById('cc-hardware')), 'the page carries #cc-hardware (manifest "hardware")');
  ok(sent.length === 1, 'one report is sent a moment after the app opens', sent.length);
  const b = sent[0]?.body || {};
  ok(b.app === 'cadcraft' && b.surface === 'web' && b.v === 1 && typeof b.facts?.cores === 'number' && b.facts.webgl2 === null && b.screen?.w > 0, 'the same report shape, light: no WebGL renderer', JSON.stringify(b).slice(0, 200));
  ok(!sent[0]?.cookie && !JSON.stringify(b).includes('@'), 'no cookies and nothing about the person');
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(3000);
  ok(sent.length === 1, 'not again on the next visit (once a month)', sent.length);
}, 'cadcraft');
console.log('== CadCraft, "Don\'t share" ticked');
await session(() => { try { localStorage.setItem('cc-hw-share', 'off'); } catch (e) {} }, async (page, sent) => {
  await page.waitForTimeout(5000);
  ok(sent.length === 0 && await page.evaluate(() => document.documentElement.dataset.ccHw) === 'off', 'nothing is sent', sent.length);
}, 'cadcraft');
console.log('== CadCraft in the desktop app: not shared unless turned on');
await session(() => { window.cadcraftDesktop = { version: 'test' }; }, async (page, sent) => {
  await page.waitForTimeout(5000);
  ok(sent.length === 0, 'nothing is sent by default', sent.length);
}, 'cadcraft');
console.log('== BimCraft does not load the shell\'s copy (no double report)');
await session(null, async (page) => {
  ok(await page.evaluate(() => !document.getElementById('cc-hardware') && ![...document.scripts].some((x) => /app-hardware\.js/.test(x.src))), 'no #cc-hardware, no app-hardware.js');
});

const after = +php("echo (int)db()->query('SELECT COALESCE(MAX(id),0) FROM hardware_reports')->fetchColumn();");
ok(after > before, 'the server stored the report', after - before);
const stored = php("echo json_encode(db()->query('SELECT * FROM hardware_reports WHERE id > " + before + "')->fetchAll());");
ok(!/ip|user|email|created_at|ua/i.test(Object.keys(JSON.parse(stored)[0] || {}).join(' ')), 'the stored row has no address, account or time of day', Object.keys(JSON.parse(stored)[0] || {}).join(','));
const apps = JSON.parse(stored).map((r) => r.app);
ok(apps.filter((a) => a === 'cadcraft').length === 1, 'exactly one CadCraft report reached the table', apps.join(','));
php("db()->exec('DELETE FROM hardware_reports WHERE id > " + before + "'); db()->exec(\"DELETE FROM form_throttle WHERE action = 'hw-report'\");");
await browser.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

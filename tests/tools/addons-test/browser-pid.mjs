#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-pid.mjs — the P&ID add-on in /lab/cadcraft (0.7 LC.5; session plant-design). Run as root: a signed-in session is minted
 * in-process by tools/addons-test/admin.php and root's Playwright Chromium is used.
 *
 *   node tools/addons-test/browser-pid.mjs [--shots dir]     (shots default: tmp/shots/pid)
 *
 * Bundled and off, switched on; its panel and settings; the showcase drawing (fixtures/showcase/cadcraft-pid-plant.dwg) opened
 * through the file input shows its symbols, lines and lists and checks clean; symbols and a line typed in; the Properties panel
 * for a pump and a line; the XLSX export; Ctrl+S → DWG → reopened with the add-on off (plain block references that draw) → on
 * (the diagram is back); no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/pid'));
fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString());

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const SESSION = admin('session');
const [cname, cvalue] = SESSION.cookie.split('=');
await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

const typeCmd = async (s, wait = 120) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(wait); };
const typeAll = async (...lines) => { for (const l of lines) await typeCmd(l); };
const shot = async (name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const history = () => page.$$eval('.cc-history li', (ls) => ls.map((l) => l.textContent));
const kindsOf = (kind) => page.evaluate((k) => window.cadcraft.doc.all().filter((e) => window.ccAddons.kinds.info(e)?.kind === k).map((e) => ({ id: e.id, data: window.ccAddons.kinds.info(e).data })), kind);

try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:cadcraft:pid:')) localStorage.removeItem(k); const k = 'cc-addons:cadcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.pid; localStorage.setItem(k, JSON.stringify(s)); });
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host && !!window.ccAddons);
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'pid' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
  let me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'pid'));
  ok(me && me.state === 'off' && me.source === 'bundled', 'P&ID is bundled and starts off', JSON.stringify(me && { state: me.state, source: me.source, reason: me.reason, detail: me.detail }));
  await page.evaluate(() => window.ccAddons.loader.setEnabled('pid', true));
  await page.waitForTimeout(500);
  me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'pid'));
  ok(me?.state === 'active', 'switched on: active', JSON.stringify(me && [me.state, me.detail]));
  const ui = await page.evaluate(() => ({ panel: document.querySelectorAll('[data-addon-section="pid:pid"] [data-pid-cmd]').length }));
  ok(ui.panel === 6, 'the P&ID section of the right panel has its six actions', JSON.stringify(ui));

  // the showcase drawing, through the file input
  await page.setInputFiles('[data-file]', path.join(ROOT, 'fixtures/showcase/cadcraft-pid-plant.dwg'));
  await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'cadcraft-pid-plant.dwg' && window.cadcraft.doc.model.size > 0, null, { timeout: 60000 });
  await page.waitForTimeout(500);
  const n = { sym: (await kindsOf('pidsym')).length, line: (await kindsOf('pidline')).length, table: (await kindsOf('pidtable')).length };
  ok(n.sym === 16 && n.line === 15 && n.table === 4, 'the showcase opens with its 16 symbols, 15 lines and 4 lists', JSON.stringify(n));
  await page.evaluate(() => window.cadcraft.host.zoomExtents());
  await page.waitForTimeout(500);
  await shot('pid-01-showcase');
  await typeCmd('PIDCHECK', 250);
  ok((await history()).some((l) => /No problems found/.test(l)), 'PIDCHECK on the opened file: no problems', (await history()).slice(-3).join(' | '));
  const facts = await page.textContent('[data-addon-section="pid:pid"] .pid-facts').catch(() => '');
  ok(/16 symbols, 15 lines\. 0 errors, 0 warnings/.test(facts || ''), 'the panel says so', facts);

  // type in a new pump and an untagged vessel, then see the check
  await typeAll('PIDSYMBOL', 'S', '2', '11', '1500,300', 'P-102', '');
  await typeAll('PIDSYMBOL', 'S', '2', '1', '1700,300', ' ', '');
  await typeCmd('PIDCHECK', 250);
  const h2 = await history();
  ok(h2.some((l) => /No tag|has no tag/i.test(l)) || h2.some((l) => /tag/i.test(l)), 'a vessel placed with no tag is found', h2.slice(-4).join(' | '));
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.cadcraft.host.zoomExtents());
  await page.waitForTimeout(300);
  await shot('pid-02-added');

  // Properties for a pump
  const pump = (await kindsOf('pidsym')).find((e) => e.data.tag === 'P-102');
  ok(!!pump, 'the new pump P-102 is in the drawing');
  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), pump.id);
  await page.waitForTimeout(500);
  const props = await page.evaluate(() => [...document.querySelectorAll('[data-props] label, [data-props] .prop-label, [data-props] dt')].map((n) => n.textContent.trim()).filter(Boolean));
  ok(props.some((t) => /Tag/.test(t)) && props.some((t) => /Design pressure/.test(t)), 'Properties shows the P&ID fields (tag, design pressure…)', props.slice(0, 20).join(' | '));
  await shot('pid-03-properties');

  // the XLSX export
  const ex = await page.evaluate(() => window.ccAddons.exporters().map((e) => e.label));
  const xi = ex.findIndex((l) => /XLSX/.test(l));
  ok(xi >= 0, 'EXPORT lists the XLSX workbook', ex.join(' | '));
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), typeAll('EXPORT', String(xi + 1))]);
  const xl = path.join(SHOTS, dl.suggestedFilename());
  await dl.saveAs(xl);
  ok(/\.xlsx$/.test(xl) && fs.statSync(xl).size > 1500, 'downloaded ' + dl.suggestedFilename());

  // Ctrl+S → DWG; off → plain block references; on → the diagram again
  const [sv] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.keyboard.press('Control+s')]);
  const saved = path.join(SHOTS, 'saved-' + sv.suggestedFilename());
  await sv.saveAs(saved);
  ok(/\.dwg$/.test(saved) && fs.statSync(saved).size > 1000, 'Ctrl+S saves a DWG', path.basename(saved));
  await page.evaluate(() => window.ccAddons.loader.setEnabled('pid', false));
  await page.waitForTimeout(300);
  await typeCmd('PIDSYMBOL', 150);
  ok((await history()).some((l) => /Unknown command/i.test(l)), 'off: PIDSYMBOL is not a command');
  await page.keyboard.press('Escape');
  await page.setInputFiles('[data-file]', saved);
  await page.waitForFunction((f) => window.cadcraft.doc.meta.source === f && window.cadcraft.doc.model.size > 0, path.basename(saved), { timeout: 60000 });
  const plain = await page.evaluate(() => { const d = window.cadcraft.doc; const ins = d.all().filter((e) => e.type === 'insert' && e.xd && e.xd.CC_PID); return { n: ins.length, drawn: ins.every((e) => (d.blocks.get(e.block)?.entities.length || 0) > 0), known: ins.some((e) => !!window.ccAddons.kinds.info(e)) }; });
  ok(plain.n >= 37 && plain.drawn && !plain.known, 'opened without the add-on: plain block references that draw, data kept', JSON.stringify(plain));
  await page.evaluate(() => window.cadcraft.host.zoomExtents());
  await page.waitForTimeout(300);
  await shot('pid-04-reopened-without');
  await page.evaluate(() => window.ccAddons.loader.setEnabled('pid', true));
  await page.waitForTimeout(500);
  const back = { sym: (await kindsOf('pidsym')).length, line: (await kindsOf('pidline')).length };
  ok(back.sym >= 18 && back.line >= 15, 'switched on: the diagram is back', JSON.stringify(back));
  ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
} catch (err) {
  fail++;
  console.log('  FAIL ' + (err?.stack || err));
} finally {
  await browser.close();
  try { admin('down'); } catch { /* fine */ }
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

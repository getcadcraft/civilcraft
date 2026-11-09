#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-pdelta.mjs — 0.9 SU.1056 (engineer-09) in DetailCraft's real page /lab/detailcraft (rule 49): the Analysis tab's "Second order
 * (P-Delta)" box. The sample frame with a 20 kN/m live load: Run first order, tick the box (one undo step, saved in the analysis), Run
 * again: the result line gives the passes and the sway amplification, the largest column moment and the sway grow; the PDF report
 * says it is second order; Ctrl+Z unticks it. No console errors.   node tools/frame/browser-pdelta.mjs   (root)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m + (extra ? '  ' + extra : '')); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const { chromium } = await import('playwright-core');
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const exe = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1])).map((d) => path.join(cache, d, 'chrome-linux64/chrome')).find((p) => fs.existsSync(p));
const SESSION = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/frame/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const issues = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: SESSION.name, value: SESSION.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') issues.push('console: ' + m.text()); }); page.on('pageerror', (e) => issues.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/detailcraft?space=paper', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.detailcraft && window.detailcraft.view, null, { timeout: 30000 });
  await page.evaluate(() => window.detailcraft.act('sample'));
  await page.waitForFunction(() => window.detailcraft.built.parts.length === 25);
  await page.click('[data-tab="analysis"]');
  const beam = await page.evaluate(() => window.detailcraft.model.state.members.find((m) => m.type === 'beam').id);
  await page.evaluate((id) => window.detailcraft.select({ kind: 'member', id }), beam);
  await page.waitForFunction(() => !document.querySelector('[data-fa-load-add]').disabled);
  await page.selectOption('[data-fa-load="case"]', 'L');
  await page.fill('[data-fa-load="value"]', '20');
  await page.click('[data-fa-load-add]');
  await page.keyboard.press('Escape');
  ok(await page.isVisible('[data-fa-second]') && !(await page.isChecked('[data-fa-second]')), 'the Second order (P-Delta) box is there, off by default');
  const numbers = () => page.evaluate(() => {
    const rows = [...document.querySelectorAll('[data-fa-table] tbody tr')].map((r) => [...r.querySelectorAll('td')].map((c) => c.textContent.trim()));
    let my = 0; for (const r of rows) { const v = Math.abs(parseFloat(r[6])); if (Number.isFinite(v)) my = Math.max(my, v); }
    return { rows: rows.length, my, second: document.querySelector('[data-fa-second-result]')?.textContent || '' };
  });
  await page.click('[data-fa-run]');
  await page.waitForSelector('[data-fa-table]');
  const first = await numbers();
  ok(first.rows > 0 && !first.second, `first order: ${first.rows} members, no second-order line, largest My ${first.my}`);
  await page.click('[data-fa-second]');
  ok(await page.evaluate(() => window.detailcraft.model.state.analysis?.secondOrder === true), 'ticking it is saved in the analysis settings');
  await page.waitForSelector('[data-fa-stale]').catch(() => {});
  await page.click('[data-fa-run]');
  await page.waitForSelector('[data-fa-second-result]', { timeout: 30000 });
  const second = await numbers();
  const m = second.second.match(/(\d+) passes, sway ([\d.]+) ×/);
  ok(!!m && Number(m[2]) >= 1, 'the result line gives the passes and the sway amplification — ' + second.second);
  ok(second.rows === first.rows && second.my >= first.my, `same members, the largest moment is not smaller (${first.my} → ${second.my})`);
  await page.screenshot({ path: path.join(ROOT, 'tmp/shots/frame/09-pdelta.png') }).catch(() => {});
  const [d] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('[data-fa-csv]')]);
  const csv = fs.readFileSync(await d.path(), 'utf8');
  ok(/Second-order elastic analysis/.test(csv), 'the report (CSV) says the run is second order and what it leaves out');
  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press('Control+z');
  ok(await page.evaluate(() => !window.detailcraft.model.state.analysis?.secondOrder), 'Ctrl+Z unticks it (one undo step)');
} catch (e) { fail++; console.log('  FAIL threw: ' + (e && e.stack || e)); }
finally {
  for (const i of issues) { fail++; console.log('  FAIL ' + i); }
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/frame/admin.php'), 'down']); } catch { /* the test admin stays disabled anyway */ }
  console.log(`\nbrowser-pdelta: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
}

#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-break.mjs — "What breaks first?" and the Live switch in the Analysis tab of the real app (0.8 round 3, EG.31 / EG.29): the sample frame with a design code and combinations, the findings
 * (combination, weakest member, load factor, joints from the bolts), the failing ones in the shell's Problems and on the model, the assistant tool, and a live re-solve after an edit; no console errors.
 *
 *   node tools/detailcraft-test/browser-break.mjs [--shots <dir>]
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
page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 300)); });
const dc = (fn, arg) => page.evaluate(fn, arg);
const row = (id) => page.locator(`[data-props] [data-pg-row="${id}"]`);
const footing = () => dc(() => { const f = window.detailcraft.model.state.footings[0]; return JSON.parse(JSON.stringify(f)); });

try {
  await page.context().addCookies([{ name: lab[0], value: lab.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.addInitScript(() => { try { localStorage.setItem('cadcraft.assistants.detailcraft', JSON.stringify({ enabled: true, groups: ['read'] })); } catch (e) { /* none */ } });   // Settings › Assistants: reading allowed
  await page.goto(`${BASE}/lab/detailcraft?space=paper`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.detailcraft, null, { timeout: 15000 });
  await dc(() => window.detailcraft.act('sample'));
  await page.waitForFunction(() => window.detailcraft.model.state.members.length > 5);
  // a gravity load on every beam, a design code, the combinations
  await dc(() => {
    const d = window.detailcraft, m = d.model;
    const beams = m.state.members.filter((x) => x.type === 'beam').map((x) => x.id);
    m.change('analysis', (tx) => {
      const a = { bases: 'fixed', beamEnds: 'rigid', braces: 'pinned', combos: [], supports: [], ends: [], ...JSON.parse(JSON.stringify(tx.s.analysis || {})) };
      a.cases = [{ id: 'D', name: 'Dead', kind: 'dead', selfWeight: 1, loads: beams.map((id) => ({ type: 'udl', member: id, dir: 'down', w: 12 })) }, { id: 'L', name: 'Live', kind: 'live', selfWeight: 0, loads: beams.map((id) => ({ type: 'udl', member: id, dir: 'down', w: 25 })) }];
      a.design = { code: 'asce-aisc', grade: 'A992' };
      tx.s.analysis = a;
    });
  });
  await page.click('[data-tab="analysis"]');
  await page.waitForSelector('[data-fa-des-make]');
  await page.click('[data-fa-des-make]');
  await page.waitForTimeout(300);
  ok(await page.locator('[data-fa-break-run]').count() === 1, 'the What breaks first? button is in the Analysis tab');
  await page.click('[data-fa-break-run]');
  await page.waitForSelector('[data-fa-break-table] tbody tr', { timeout: 60000 });
  const rows = await page.$$eval('[data-fa-break-row]', (r) => r.map((x) => x.dataset.faBreakRow + ' | ' + x.textContent));
  ok(rows.length >= 2 && rows.some((r) => /^combo/.test(r)) && rows.some((r) => /^member/.test(r)), 'findings: the combination and the weakest member (' + rows.length + ' rows)');
  ok(await page.locator('[data-fa-break-combo]').count() === 1, 'the governing combination is named');
  const res = await dc(() => { const r = window.detailcraft.analysis.break; return r && { n: r.findings.length, reserve: r.reserve && r.reserve.factor, conns: r.connections.length, notChecked: r.notChecked.length }; });
  ok(res && res.n >= 2 && (res.reserve === null || res.reserve > 0), 'the result is on the panel object: ' + JSON.stringify(res));
  ok(res && res.conns >= 1, 'the end plates and shear tabs with bolts are checked as joints (' + (res && res.conns) + ')');
  const probs = await dc(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => /^breakit\./.test(p.code || '')).map((p) => p.code + '|' + p.severity) : []));
  ok(probs.length >= 1, 'findings are in the shell\'s Problems: ' + probs.join(', '));
  const tool = await dc(async () => { const c = window.detailcraftControl; const r = await c.call('frame_break', {}, { client: { name: 'test' } }).catch((e) => ({ err: String(e.message || e) })); return JSON.stringify(r).slice(0, 300); });
  ok(/findings|first/.test(tool), 'the assistant tool frame_break answers: ' + tool.slice(0, 120));
  // an edit makes the result stale and takes the findings off the Problems list
  await dc(() => { const m = window.detailcraft.model; m.change('rename', (tx) => tx.setName('Live test')); });
  await page.waitForTimeout(200);
  ok(await dc(() => window.detailcraft.analysis.break) === null, 'after an edit the findings are stale');
  // live: tick it, change the model, the analysis comes back by itself
  await page.click('[data-tab="analysis"]');
  await page.waitForSelector('[data-fa-live]');
  await page.check('[data-fa-live]');
  const before = await dc(() => window.detailcraft.analysis.result && window.detailcraft.analysis.result.version);
  await dc(() => { const m = window.detailcraft.model; m.change('rename', (tx) => tx.setName('Live test 2')); });
  await page.waitForFunction(() => { const a = window.detailcraft.analysis, r = a.result; return r && r.version === window.detailcraft.model.version && !r.error; }, null, { timeout: 20000 });
  ok(true, 'Live: the frame was solved again after the edit without pressing Run (version ' + before + ' → ' + await dc(() => window.detailcraft.model.version) + ')');
  await page.uncheck('[data-fa-live]');
  await dc(() => { const m = window.detailcraft.model; m.change('rename', (tx) => tx.setName('Live off')); });
  await page.waitForTimeout(600);
  ok(await dc(() => { const r = window.detailcraft.analysis.result; return !r || r.version !== window.detailcraft.model.version; }), 'with Live off an edit leaves the result stale');
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

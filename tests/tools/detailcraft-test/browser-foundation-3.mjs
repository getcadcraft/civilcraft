#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-foundation-3.mjs — the Foundation tab's round-3 parts in the real app (EG.5): settlement, the flexible mat on springs, a pile group and a
 * retaining wall; saved in the model file; one undo step each; no console errors.
 *
 *   node tools/detailcraft-test/browser-foundation-3.mjs [--shots <dir>]
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
  await dc(() => { const m = window.detailcraft.model; m.change('t', (tx) => { tx.addFooting({ x: 0, y: 0, top: 0, L: 4000, B: 4000, H: 600 }); }); });
  await page.click('[data-tab="foundation"]');
  await page.waitForSelector('[data-fnd-add]');
  await page.click('[data-fnd-add]');
  await page.waitForSelector('[data-fnd-loads] tbody tr');
  const cells = page.locator('[data-fnd-loads] tbody tr').first().locator('input');
  await cells.nth(0).fill('800'); await cells.nth(0).press('Tab');
  const strength = page.locator('[data-fnd-loads] tbody tr').nth(1).locator('input');
  await strength.nth(0).fill('1100'); await strength.nth(0).press('Tab');
  const soilInput = async (label, value) => { const l = page.locator('[data-report] .dc-props label', { hasText: label }).first(); const id = await l.getAttribute('for'); await page.fill('#' + id, String(value)); await page.press('#' + id, 'Tab'); };
  await soilInput('Soil modulus Es', 15);
  await page.waitForSelector('[data-fnd-check="settlement"]');
  const st = await page.locator('[data-fnd-check="settlement"]').first().textContent();
  ok(/Settlement: \d/.test(st), 'settlement is listed once Es is entered: ' + st.slice(0, 80));
  const stored = await dc(() => window.detailcraft.model.state.foundation.soil.Es);
  ok(stored === 15, 'Es is saved in the model file');
  // the flexible mat
  await soilInput('Subgrade modulus ks', 25000);
  ok(await page.locator('[data-fnd-mat-checks]').count() === 0, 'no mat table until it is switched on');
  await page.check('[data-fnd-mat]');
  await page.waitForSelector('[data-fnd-mat-checks] tbody tr', { timeout: 20000 });
  const mat = await page.$$eval('[data-fnd-mat-checks] tbody tr', (r) => r.map((x) => x.dataset.fndCheck));
  ok(['mat-bearing', 'mat-flexure-x', 'mat-flexure-y', 'mat-shear', 'punching'].every((i) => mat.includes(i)), 'the mat is checked: ' + mat.join(', '));
  ok(/mesh \d+ mm/.test(await page.locator('[data-fnd-mat-info]').textContent()), 'the mesh and the peaks are told');
  const undo1 = await dc(() => window.detailcraft.model.undoStack.at(-1).label);
  ok(/mat/i.test(undo1), 'one undo step for the switch: ' + undo1);
  // a pile group (2 x 2 at 900) with a load
  await page.click('[data-fnd-pile-add]');
  await page.waitForSelector('[data-fnd-pile]');
  const pf = page.locator('[data-fnd-pile] input');
  const pileInput = async (label, value) => { const l = page.locator('[data-fnd-pile] label', { hasText: label }).first(); const id = await l.getAttribute('for'); await page.fill('#' + id, String(value)); await page.press('#' + id, 'Tab'); };
  await pileInput('P down', 1200);
  await page.waitForSelector('[data-fnd-pile-reactions]');
  ok(/4 piles.*300/.test(await page.locator('[data-fnd-pile-reactions]').textContent()), 'four piles under 1200 kN: 300 kN each');
  await pileInput('One pile in compression', 250);
  await page.waitForSelector('[data-fnd-pile-checks] tr[data-status="fail"]');
  ok(true, 'a pile over its capacity fails (300 kN against 250 kN)');
  // a retaining wall
  await page.click('[data-fnd-wall-add]');
  await page.waitForSelector('[data-fnd-wall-checks] tbody tr');
  const wall = await page.$$eval('[data-fnd-wall-checks] tbody tr', (r) => r.map((x) => x.dataset.fndCheck));
  ok(wall.includes('wall-overturning') && wall.includes('wall-sliding') && wall.includes('wall-bearing'), 'the wall is checked: ' + wall.join(', '));
  const f = await dc(() => { const x = window.detailcraft.model.state.foundation; return { piles: x.piles.length, walls: x.walls.length, mat: Object.keys(x.mats || {}).length }; });
  ok(f.piles === 1 && f.walls === 1 && f.mat === 1, 'pile group, wall and mat switch are in the model file');
  const probs = await dc(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => /^fnd\./.test(p.code || '')).map((p) => p.code) : []));
  ok(probs.includes('fnd.pile-compression'), 'the failed pile is in the shell\'s Problems: ' + probs.join(','));
  // saved and read back
  const back = await dc(() => { const m = window.detailcraft.model; m.load(m.toJSON()); const x = m.state.foundation; return x && x.piles?.length === 1 && x.walls?.length === 1 && x.mats && x.soil.ks === 25000; });
  ok(back === true, 'the file reads back with all of it');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'detailcraft-foundation-3.png') });
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

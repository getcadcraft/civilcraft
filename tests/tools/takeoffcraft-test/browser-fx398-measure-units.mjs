#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fx398-measure-units.mjs — roadmap FX.398 (lab pass 18, 2026-11-04: "the table displays m², the drawing itself still displays
 * square feet") in the real TakeoffCraft page, /lab, headless. With Settings › Show lengths as = m, the live readouts while drawing an
 * area or a circle say m² (and never SF / sq ft); with feet-inches they say SF, as before. The numbers are checked against the scale.
 *   node tools/takeoffcraft-test/browser-fx398-measure-units.mjs      (run as root: a session minted for the test admin by admin.php)
 */
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const { chromium } = await import('playwright-core');
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const exe = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))
  .map((d) => path.join(cache, d, 'chrome-linux64/chrome')).find((p) => fs.existsSync(p));
const admin = (...a) => execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/takeoffcraft-test/admin.php'), ...a], { encoding: 'utf8' });
const S = JSON.parse(admin('session', 'main'));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await ctx.addCookies([{ name: S.name, value: S.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto('https://getcadcraft.com/lab/takeoffcraft?space=paper');
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 30000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  const T = (fn, a) => page.evaluate(fn, a);
  await page.setInputFiles('[data-file-pdf]', path.join(ROOT, 'fixtures/pdf/kitchen-plan-sheet.pdf'));
  await page.waitForFunction(() => window.takeoffcraft.sheets().length > 0, null, { timeout: 30000 });
  await page.waitForTimeout(800);
  // 1 sheet unit = 0.1 ft (a made-up scale: only the unit text and the conversion are under test)
  await T(() => { const tc = window.takeoffcraft; tc.model.setScale(tc.sheet(), { method: 'drawing', ftPerUnit: 0.1, preset: null, label: 'test', cal: null }); });
  ok(await T(() => window.takeoffcraft.scale()?.ftPerUnit === 0.1), 'the sheet has a scale (1 unit = 0.1 ft)');

  const box = await T(() => document.querySelectorAll('[data-measure]').length || null);
  const over = await T(() => { const r = document.querySelector('[data-over]'); const b = r.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
  const at = (fx, fy) => ({ x: over.x + over.w * fx, y: over.y + over.h * fy });
  // three clicks of an outline and a hover: the readout under way; the exact number is the model's own polygon area
  async function readArea(tool) {
    await page.click('[data-tool="' + tool + '"]');
    if (await page.$('[data-item-form]:not([hidden])')) { await page.fill('#tc-new-name', 'Floor tiles ' + tool); await page.click('[data-item-form] button[type="submit"]'); await page.waitForTimeout(300); await page.click('[data-tool="' + tool + '"]'); }
    const pts = tool === 'circle' ? [at(0.4, 0.4)] : [at(0.3, 0.3), at(0.5, 0.3), at(0.5, 0.5)];
    for (const p of pts) { await page.mouse.click(p.x, p.y); await page.waitForTimeout(120); }
    const end = tool === 'circle' ? at(0.45, 0.4) : at(0.3, 0.5);
    await page.mouse.move(end.x, end.y, { steps: 4 });
    await page.waitForTimeout(250);
    const text = await T(() => [...document.querySelectorAll('[data-measure]')].map((e) => e.textContent).filter((x) => /Area|Radius|Side/.test(x)).join(' | '));
    if (process.env.FX398_DEBUG) console.log('   debug', tool, await T(() => ({ tool: window.takeoffcraft.tool(), items: window.takeoffcraft.model.state.items.length, status: document.querySelector('[data-status]')?.textContent, measures: [...document.querySelectorAll('[data-measure]')].map((e) => e.outerHTML.slice(0, 120)) })));
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    await page.click('[data-tool="select"]').catch(() => {});
    return text;
  }

  console.log('== Show lengths as: m');
  await T(() => { window.takeoffcraft.settings.lenShow = 'm'; });
  const aM = await readArea('area');
  ok(/Area [\d.,]+ m²/.test(aM) && !/SF|sq ft/.test(aM), 'area readout in m², never SF', aM);
  ok(/perimeter [\d.,]+ m\b/.test(aM), 'its perimeter in m', aM);
  const cM = await readArea('circle');
  ok(/Radius [\d.,]+ m\s+area [\d.,]+ m²/.test(cM) && !/SF|sq ft/.test(cM), 'circle readout: radius in m, area in m²', cM);
  const r = parseFloat(cM.match(/Radius ([\d.]+) m/)?.[1]), a = parseFloat(cM.match(/area ([\d.,]+) m²/)?.[1].replace(/,/g, ''));
  ok(Number.isFinite(r) && Math.abs(a - Math.PI * r * r) <= 0.01 + 0.002 * a, 'circle area = pi r² in m² (' + a + ' for r ' + r + ')');

  console.log('== Show lengths as: feet-inches (unchanged)');
  await T(() => { window.takeoffcraft.settings.lenShow = 'ftin'; });
  const aF = await readArea('area');
  ok(/Area [\d.,]+ SF/.test(aF) && !/m²/.test(aF), 'area readout in SF, as before', aF);
  const cF = await readArea('circle');
  ok(/area [\d.,]+ SF/.test(cF), 'circle readout in SF', cF);
  ok(box !== null, 'the measure readout is on the page');
  ok(problems.length === 0, 'no console errors', problems.slice(0, 3));
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

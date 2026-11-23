#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fx305.mjs — civil-11, 0.11 FX.305: CivilCraft fills the Properties palette in every interface style that names one (Ribbon, AutoRev, Duncan,
 * Vector, Sketch, Rhino in the upper palette; Toolbox in the lower). Per style: the layout is on, a palette named properties is on screen and holds
 * the app's own Properties (the selected alignment's fields are in it, there is exactly one [data-props] on the page), and going back to the
 * docked layout puts Properties back in the right panel.     Run as root: nice -n 10 timeout 600 node tools/civilcraft-test/browser-fx305.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-fx305'); fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cv11'], { encoding: 'utf8' }) || '{}');
admin('up'); const sess = admin('session');
const STYLES = ['docked', 'autorev', 'duncan', 'vector', 'sketch', 'rhino', 'toolbox'];   // docked = "Ribbon and project browser"
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto('https://getcadcraft.com/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project && window.civilcraftWorkspace);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  await page.evaluate(() => { window.civilcraft.project.change('units', (s) => { s.units = 'm'; }); window.civilcraft.command('fit'); });
  await page.evaluate(() => {
    const p = window.civilcraft.project, b = p.eg().surface.bounds, X = (f) => b.minX + (b.maxX - b.minX) * f, Y = (f) => b.minY + (b.maxY - b.minY) * f, id = p.nextId('a');
    p.change('alignment', (s) => { s.alignments.push({ id, name: 'Main St', start: 0, pis: [{ x: X(0.1), y: Y(0.5), r: 0 }, { x: X(0.9), y: Y(0.5), r: 0 }], pvis: [] }); });
    window.civilcraft.select({ kind: 'alignment', id });
  });
  const setLayout = async (k) => { await page.evaluate((k) => { localStorage.setItem('cc-workspace', k); window.dispatchEvent(new CustomEvent('cc-workspace')); }, k); await page.waitForTimeout(1200); };
  for (const key of STYLES) {
    await setLayout(key);
    const r = await page.evaluate(() => {
      const pal = document.querySelector('[data-ws-palette="properties"]') || document.querySelector('[data-ws-properties-scroll]'), body = document.querySelectorAll('[data-props]');
      const r = pal?.getBoundingClientRect();
      return { layout: window.civilcraftWorkspace.engine.inspect().layout, palette: !!pal, visible: !!r && r.width > 40 && r.height > 40, nBodies: body.length, inPalette: !!pal && pal.contains(document.querySelector('[data-props]')), text: (document.querySelector('[data-props]')?.textContent || '').slice(0, 80), field: !!document.querySelector('[data-props] input, [data-props] select') };
    });
    ok(r.layout && r.palette && r.visible, `${key}: a Properties palette is on screen`, r);
    ok(r.nBodies === 1 && r.inPalette, `${key}: it holds the app's own Properties (one [data-props] on the page)`, r);
    ok(/Main St|Alignment|Start station|Length/i.test(r.text) && r.field, `${key}: the selected alignment's fields are in it`, r.text);
    await page.screenshot({ path: path.join(SHOTS, key + '.png') });
  }
  await page.evaluate(() => { localStorage.removeItem('cc-workspace'); window.dispatchEvent(new CustomEvent('cc-workspace')); }); await page.waitForTimeout(1200);   // the classic layout
  const back = await page.evaluate(() => { const b = document.querySelector('[data-props]'); return { right: !!b?.closest('.cv-right'), h: !!document.querySelector('.cv-right [data-props-h]'), nPal: document.querySelectorAll('[data-ws-palette="properties"], [data-ws-properties-scroll]').length }; });
  ok(back.right && back.h && back.nPal === 0, 'back to the classic layout: Properties and its heading are in the right panel again', back);
  ok(problems.length === 0, 'no page errors', problems);
} finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

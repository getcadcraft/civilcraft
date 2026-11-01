#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-rain-showcase.mjs — builds fixtures/showcase/civilcraft-make-it-rain.civilcraft.json ONCE (memory `showcase-files`; 0.8 rule 37): the sample
 * hillside lot in metres with two graded platforms and a saved detention pond. Hero shot: Make it rain on this site (water runs off the pads, ponds in
 * the low corner, overtops). Run once; the file is kept.   node tools/civilcraft-test/make-rain-showcase.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(REPO, 'fixtures/showcase/civilcraft-make-it-rain.civilcraft.json');
if (fs.existsSync(FILE)) { console.log('already built: ' + FILE); process.exit(0); }
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cwl'], { encoding: 'utf8' }) || '{}');
admin('up'); const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  await page.goto('https://getcadcraft.com/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project && window.civilcraft.landscape);
  await page.evaluate(() => window.civilcraft.landscape.ready);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  const json = await page.evaluate(() => {
    const p = window.civilcraft.project, b = p.eg().surface.bounds, X = (f) => b.minX + (b.maxX - b.minX) * f, Y = (f) => b.minY + (b.maxY - b.minY) * f;
    p.change('units', (s) => { s.units = 'm'; s.name = 'Make it rain — hillside lot'; });
    p.change('landscape', (s) => { s.landscape = { palette: [], show: 'mature', label: '{name}', labels: true, hardscape: [], plants: [], beds: [], hedges: [], grading: [
      { id: 'l1', kind: 'platform', name: 'House pad', pts: [{ x: X(0.33), y: Y(0.3) }, { x: X(0.58), y: Y(0.3) }, { x: X(0.58), y: Y(0.62) }, { x: X(0.33), y: Y(0.62) }], z: 255, fall: null, cut: 3, fill: 3 },
      { id: 'l2', kind: 'platform', name: 'Yard', pts: [{ x: X(0.08), y: Y(0.5) }, { x: X(0.22), y: Y(0.5) }, { x: X(0.22), y: Y(0.7) }, { x: X(0.08), y: Y(0.7) }], z: 250, fall: null, cut: 3, fill: 3 }] }; });
    p.change('ponds', (s) => { s.ponds = [{ id: 'q1', name: 'Detention pond', area: 2, cn: 80, tc: 20, catchment: null, storm: { mode: 'uniform', depth: 75, duration: 60 }, start: null, target: null, drawdownMax: 72,
      storage: { bottom: 245, area0: 400, perimeter0: 80, side: 3, top: 248 }, devices: [{ kind: 'orifice', invert: 245, diameter: 0.15, cd: 0.6 }, { kind: 'spillway', crest: 247.5, length: 3 }] }]; });
    p.saved = p.version;
    return JSON.stringify(p.toJSON());
  });
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, json);
  console.log('wrote ' + FILE + ' (' + json.length + ' bytes)');
} finally { await browser.close(); admin('down'); }

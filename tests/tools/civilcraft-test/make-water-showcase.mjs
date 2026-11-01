#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-water-showcase.mjs — builds fixtures/showcase/civilcraft-water-mains.civilcraft.json ONCE (memory `showcase-files`; 0.8 rule 37; LC.16 + CV.2): the sample
 * hillside lot in metres with a looped water main fed from a reservoir on the high corner, a dead-end branch, mains of 200 / 150 / 100 mm, demands, six hydrants and
 * isolation valves. Hero shot: Surface › More › Water mains…, pressures turn green on the plan; the table lists the tees, bends, reducers and caps the layout implies; the PDF carries C-WATR-MAIN.
 * Run once; the file is kept.   node tools/civilcraft-test/make-water-showcase.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(REPO, 'fixtures/showcase/civilcraft-water-mains.civilcraft.json');
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
    const g = (x, y) => { const z = p.eg().surface.elevationAt(x, y); return Math.round(z * 100) / 100; };
    p.change('units', (s) => { s.units = 'm'; s.name = 'Water mains — hillside lot'; });
    // a 4 × 3 grid of junctions laid over the lot (rows follow the slope), a reservoir above the north-west corner, a dead-end branch east
    const nodes = [], pipes = [], fittings = [];
    const gx = [0.14, 0.38, 0.62, 0.86], gy = [0.2, 0.5, 0.8];
    gy.forEach((fy, r) => gx.forEach((fx, c) => { const x = X(fx), y = Y(fy); nodes.push({ id: 'wm' + (nodes.length + 1), name: 'J' + (r + 1) + String.fromCharCode(65 + c), x, y, z: g(x, y), demand: [0, 3, 2, 1][c] + (r === 1 ? 2 : 0), kind: 'junction' }); }));
    const R = { id: 'wm13', name: 'Reservoir', x: X(0.02), y: Y(0.2), z: g(X(0.02), Y(0.2)), demand: 0, kind: 'reservoir', head: g(X(0.02), Y(0.2)) + 40 };
    nodes.push(R);
    const cap = { id: 'wm14', name: 'J1E', x: X(0.98), y: Y(0.5), z: g(X(0.98), Y(0.5)), demand: 1, kind: 'junction' };
    nodes.push(cap);
    const link = (a, b, d) => { pipes.push({ id: 'wp' + (pipes.length + 1), name: '', a, b, kind: 'pipe', length: null, d, c: 130, minor: 0, status: 'open' }); return pipes[pipes.length - 1].id; };
    const feed = link('wm13', 'wm1', 200);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) link('wm' + (r * 4 + c + 1), 'wm' + (r * 4 + c + 2), r === 0 ? 200 : 150);   // along the rows
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) link('wm' + (r * 4 + c + 1), 'wm' + ((r + 1) * 4 + c + 1), c === 0 ? 200 : 150);   // down the columns
    link('wm8', 'wm14', 100);   // the dead end
    // hydrants where a street would put them, and an isolation valve on the feed and on each loop leg
    let n = 0; const wf = () => 'wf' + (++n);
    for (const id of ['wm2', 'wm4', 'wm6', 'wm7', 'wm10', 'wm12']) fittings.push({ id: wf(), kind: 'hydrant', host: { node: id }, name: '', note: '' });
    for (const id of [feed, 'wp2', 'wp11']) fittings.push({ id: wf(), kind: 'valve', host: { pipe: id, t: 0.5 }, name: '', note: '' });
    fittings.push({ id: wf(), kind: 'airvalve', host: { node: 'wm5' }, name: '', note: '' });
    p.state.seq = Math.max(p.state.seq, 100);
    p.change('water', (s) => { s.water = { nodes, pipes, settings: { minP: 140, maxP: 700, vMax: 3, c: 130, step: 3600, duration: 24, pattern: [] }, fittings }; });
    p.saved = p.version;
    return JSON.stringify(p.toJSON());
  });
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, json);
  console.log('wrote ' + FILE + ' (' + json.length + ' bytes)');
} finally { await browser.close(); admin('down'); }

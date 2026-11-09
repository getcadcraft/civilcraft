#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser.mjs — the chip panels (lib/chip/hdl) in real headless Chromium, on a bare harness page (NOT the add-on shell: that is the
 * chip-runners session's, HD.10). Files are served from this repo through page.route; nothing touches the live site.
 *   node lib/chip/hdl/test/browser.mjs [--shots <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../../..');
const si = process.argv.indexOf('--shots'), SHOTS = si > 0 ? process.argv[si + 1] : null;
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const fixtures = {};
for (const f of ['alu.v', 'two_stage.v', 'yosys_netlist.v', 'counter.vhd', 'top.vhd', 'bad.v']) fixtures[f] = fs.readFileSync(path.join(HERE, 'fixtures', f), 'utf8');

const HARNESS = `<!doctype html><meta charset="utf-8"><title>chip panels</title>
<style>body{margin:0;font-family:system-ui;display:grid;grid-template-columns:1fr 340px;grid-template-rows:520px 460px;gap:8px;padding:8px;height:1000px}#src{grid-row:1/3}#net{grid-column:2}</style>
<div id="src"></div><div id="hier"></div><div id="net" style="grid-column:1/3"></div>
<script type="module">
import * as S from '/lib/schematic/index.js';
import { allPanels as panels } from '/lib/chip/hdl/index.js';
const store = new Map(Object.entries(${JSON.stringify(fixtures)}));
window.__rows = {}; window.__store = store;
const ctx = { files: { list: async () => [...store.keys()], read: async (n) => store.get(n), write: async (n, t) => { store.set(n, t); } },
  problems: { set: (src, rows) => { window.__rows[src] = rows; } }, t: (k) => k, schematic: S };
const [a, b, c] = panels(ctx);
a.mount(document.getElementById('src'), ctx); b.mount(document.getElementById('hier'), ctx); c.mount(document.getElementById('net'), ctx);
window.__ready = true;
</script>`;

try {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1500 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.route('http://chip.test/**', (route) => {
    const u = new URL(route.request().url());
    if (u.pathname === '/') return route.fulfill({ contentType: 'text/html', body: HARNESS });
    const f = path.join(REPO, path.normalize(u.pathname));
    if (!f.startsWith(path.join(REPO, 'lib') + path.sep) || !fs.existsSync(f)) return route.fulfill({ status: 404, body: 'nf' });
    return route.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(f) });
  });
  await page.goto('http://chip.test/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__ready && window.__rows['hdl'] && document.querySelector('#net svg'), null, { timeout: 15000 });
  ok(errors.length === 0, 'no page errors', errors.join(' | '));
  const files = await page.$$eval('#src select option', (o) => o.map((x) => x.value));
  ok(JSON.stringify(files.slice(0, 3)) === JSON.stringify(['alu.v', 'bad.v', 'counter.vhd']), 'Source lists the project files', files.join(','));
  await page.selectOption('#src select', 'bad.v');
  const marks = await page.$$eval('#src .chip-gut span.error', (s) => s.map((x) => x.textContent));
  ok(marks.length === 4, 'four error markers in the gutter', marks.join(','));
  const rows = await page.evaluate(() => window.__rows['hdl'].map((r) => r.code + '@' + r.file + ':' + r.line));
  ok(rows.includes('hier.missing@top.vhd:19') && rows.includes('syn.expect@bad.v:1'), 'Problems rows from both languages', rows.join(','));
  await page.click('#src .chip-list li >> nth=0');
  const sel = await page.$eval('#src textarea', (t) => t.selectionStart);
  ok(sel > 0, 'clicking a problem moves the cursor');
  await page.focus('#src textarea');
  await page.keyboard.press('End'); await page.keyboard.type(';');
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => window.__rows['hdl'].filter((r) => r.file === 'bad.v' && r.line === 1 && r.severity === 'error').length);
  ok(after === 0, 'typing the missing ";" clears the error after the re-check', await page.evaluate(() => JSON.stringify(window.__rows['hdl'].filter((r) => r.file === 'bad.v').map((r) => r.line + ':' + r.col + ' ' + r.text)) + ' / ' + document.querySelector('#src textarea').value.split('\n')[0]));
  const tree = await page.$$eval('#hier .chip-tree li', (l) => l.map((x) => x.textContent));
  ok(tree.some((t) => /^pipe2/.test(t)) || tree.some((t) => /^top_v/.test(t)), 'hierarchy tree drawn', tree.slice(0, 4).join(' | '));
  const mods = await page.$$eval('#net select option', (o) => o.map((x) => x.value));
  ok(mods.includes('src|cnt2') && !mods.includes('src|top_v'), 'netlist module list: Verilog modules only');
  await page.selectOption('#net select', 'src|cnt2');
  const boxes = await page.$$eval('#net svg [data-cell]', (g) => g.length);
  ok(boxes === 10, 'cnt2 drawn: 6 cells and 4 port bits', String(boxes));
  const bb = await page.$eval('#net svg', (s) => { const r = s.getBoundingClientRect(); return [r.width, r.height]; });
  ok(bb[0] > 300 && bb[1] > 100, 'the drawing has a size on the page', bb.join('x'));
  // click on the middle of the first segment of a net's wire, as a person would
  const pt = await page.$eval('#net svg path[data-net="' + (await page.$eval('#net svg path[data-net]', (p) => p.getAttribute('data-net'))) + '"]', (p) => {
    const m = /M([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)/.exec(p.getAttribute('d')); const svg = p.ownerSVGElement, q = svg.createSVGPoint();
    q.x = (Number(m[1]) + Number(m[3])) / 2; q.y = (Number(m[2]) + Number(m[4])) / 2; const r = q.matrixTransform(svg.getScreenCTM()); return [r.x, r.y];
  });
  await page.mouse.click(pt[0], pt[1]);
  const hl = await page.$$eval('#net svg path.hl', (p) => p.length);
  ok(hl === 1, 'clicking a wire lights its net');
  await page.click('#net button:has-text("chip.net.saveSvg"), #net button:has-text("Save picture (SVG)")');
  await page.waitForTimeout(100);
  ok(await page.evaluate(() => (window.__store.get('cnt2.schematic.svg') || '').startsWith('<svg')), 'Save picture writes the SVG');
  const vb0 = await page.$eval('#net svg', (s) => s.getAttribute('viewBox'));
  const vr = await page.$eval('#net .chip-net-view', (v) => { const r = v.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await page.mouse.move(vr[0], vr[1]); await page.mouse.wheel(0, -300); await page.waitForTimeout(100);
  const vb1 = await page.$eval('#net svg', (s) => s.getAttribute('viewBox'));
  ok(vb0 !== vb1, 'wheel zooms');
  if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, 'chip-panels.png') }); console.log('  shot ' + path.join(SHOTS, 'chip-panels.png')); }
  ok(errors.length === 0, 'still no page errors', errors.join(' | '));
} catch (e) { fail++; console.log('  FAIL threw — ' + e.stack); }
await browser.close();
console.log(`\nchip hdl browser: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// Headless check of the three panels in a real Chromium, OUTSIDE any app: a throwaway local server serves lib/chip/fmt and a blank page that
// mounts panels(ctx) with a fake ctx (files = the fixtures + a generated GDSII/OASIS). This is not the /lab test (the add-on host is chip-runners-09's).
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '..'), REPO = path.resolve(ROOT, '../../..');
const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
let pass = 0, fail = 0; const ok = (c, m, x = '') => { if (c) pass++; else { fail++; console.log('FAIL ' + m + ' ' + x); } };
const PAGE = `<!doctype html><meta charset="utf-8"><body><div id="a" style="width:900px"></div><div id="b" style="width:900px"></div><div id="c" style="width:900px"></div>
<script type="module">
import { panels } from '/fmt/ui.js'; import * as L from '/fmt/layout.js'; import { writeGds } from '/fmt/gds.js'; import { writeOasis } from '/fmt/oasis.js';
const names = ['demo.lib', 'demo.lef', 'demo.def', 'demo.sdc', 'demo.spef', 'demo.sdf'], files = {};
for (const n of names) files[n] = await (await fetch('/fmt/test/fixtures/' + n)).text();
const lib = L.newLib('t'), c = L.newCell(lib, 'C'); c.shapes.add(L.POLY, 1, 0, [0, 0, 100, 0, 100, 100, 0, 100]); c.shapes.add(L.PATH, 2, 0, [0, 0, 300, 0], 20);
const top = L.newCell(lib, 'TOP'); top.refs.push({ cell: 'C', x: 0, y: 0, flip: false, angle: 0, mag: 1, rep: { kind: 'lattice', nx: 20, ny: 10, ax: [400, 0], ay: [0, 400] } });
files['t.gds'] = writeGds(lib); files['t.oas'] = writeOasis(lib); files['m.map'] = 'METAL1 1/0 #ff0000\\nMETAL2 2/0';
const written = {}, problems = {};
const ctx = { files: { list: () => Object.keys(files), read: (n) => (typeof files[n] === 'string' ? files[n] : new TextDecoder().decode(files[n])), readBytes: (n) => (typeof files[n] === 'string' ? new TextEncoder().encode(files[n]) : files[n]), write: (n, d) => { written[n] = d; } }, problems: { set: (s, rows) => { problems[s] = rows; } }, t: (k) => k };
const P = panels(ctx); window.T = { P, written, problems };
await P[0].mount(document.getElementById('a'), ctx); await P[1].mount(document.getElementById('b'), ctx); await P[2].mount(document.getElementById('c'), ctx);
window.T.ready = true;
</script>`;
const server = http.createServer((req, res) => {
  if (req.url === '/favicon.ico') { res.writeHead(204); return res.end(); }
  if (req.url === '/') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(PAGE); }
  const f = path.join(ROOT, decodeURIComponent(req.url.replace(/^\/fmt\//, '')).replace(/\?.*$/, ''));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.json') ? 'application/json' : 'text/plain' }); fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r)); const BASE = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 2400 } }), errors = [];
  page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => { if (m.type() === 'error' && !/favicon/.test(m.text())) errors.push(m.text()); });
  await page.goto(BASE + '/'); await page.waitForFunction(() => window.T && window.T.ready, null, { timeout: 15000 });
  ok(await page.evaluate(() => window.T.P.map((p) => p.title).join('|')) === 'Layout|Cell library and floorplan|Constraints and timing data', 'panel titles fall back to English');
  // layout panel: open the GDSII, layers, hierarchy, draw, layer map, save OASIS
  await page.selectOption('#a select >> nth=0', 't.gds'); await page.waitForFunction(() => document.querySelectorAll('#a ul li').length >= 3);
  const lay = await page.evaluate(() => [...document.querySelectorAll('#a ul')][0].innerText);
  ok(/1\/0/.test(lay) && /200 placed/.test(lay), 'layer list shows layers with placed counts', lay);
  ok(await page.evaluate(() => [...document.querySelectorAll('#a ul')][1].innerText.includes('TOP')), 'hierarchy lists the top cell');
  const st = await page.evaluate(() => document.querySelector('#a [role=status]').textContent); ok(/Drawn: \d+ shapes/.test(st), 'view drew shapes', st);
  const px = await page.evaluate(() => { const c = document.querySelector('#a canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; }); ok(px > 1000, 'canvas has drawn pixels', String(px));
  await page.selectOption('#a select >> nth=1', 'm.map'); await page.waitForTimeout(200); ok((await page.evaluate(() => [...document.querySelectorAll('#a ul')][0].innerText)).includes('METAL1'), 'layer map names the layers');
  await page.mouse.move(400, 150); await page.mouse.wheel(0, -300); await page.waitForTimeout(100); ok(/Drawn/.test(await page.evaluate(() => document.querySelector('#a [role=status]').textContent)), 'zoom redraws');
  await page.click('#a button:has-text("Save as OASIS")'); await page.waitForTimeout(200); ok(await page.evaluate(() => window.T.written['t.oas'] instanceof Uint8Array && window.T.written['t.oas'].length > 100), 'Save as OASIS wrote t.oas');
  await page.selectOption('#a select >> nth=0', 't.oas'); await page.waitForTimeout(300); ok(/200 placed/.test(await page.evaluate(() => [...document.querySelectorAll('#a ul')][0].innerText)), 'the OASIS file opens with the same counts');
  // library panel
  await page.selectOption('#b select', 'demo.lib'); await page.waitForTimeout(150); await page.selectOption('#b select', 'demo.lef'); await page.waitForTimeout(150); await page.selectOption('#b select', 'demo.def'); await page.waitForTimeout(200);
  const tb = await page.evaluate(() => document.querySelector('#b table')?.innerText || ''); ok(tb.includes('INV_X1') && tb.includes('0.8 × 3.6') && tb.includes('DFF_X1 (flip-flop)'), 'library table joins Liberty and LEF', tb.slice(0, 200));
  ok(/3 placed cells/.test(await page.evaluate(() => document.querySelector('#b [role=status]').textContent)) || /chip.fmt.floorinfo/.test(await page.evaluate(() => document.querySelector('#b [role=status]').textContent)), 'floorplan drawn');
  // constraints panel
  await page.selectOption('#c select', 'demo.sdc'); await page.waitForTimeout(150); await page.selectOption('#c select', 'demo.def'); await page.waitForTimeout(150); await page.selectOption('#c select', 'demo.spef'); await page.waitForTimeout(150); await page.selectOption('#c select', 'demo.sdf'); await page.waitForTimeout(200);
  const ct = await page.evaluate(() => document.querySelector('#c').innerText); ok(ct.includes('chip.fmt.sdc.clock') || ct.includes('Clock core_clk'), 'constraint list shown'); ok(ct.includes('din') && ct.includes('u1'), 'SPEF and SDF tables shown');
  ok(await page.evaluate(() => (window.T.problems['chip.fmt.constraints'] || []).some((p) => p.code === 'chip.fmt.sdc.port')), 'SDC checked against the DEF pins (rst_n) into Problems');
  await page.click('#c summary'); await page.fill('#c textarea', '00X\nP1X\nP0H'); await page.click('#c details button');
  await page.waitForTimeout(200); const stil = await page.evaluate(() => window.T.written['cc_demo_top.stil'] || ''); ok(stil.startsWith('STIL 1.0;') && (stil.match(/V \{/g) || []).length === 3, 'STIL file written from three vectors', stil.slice(0, 80));
  ok(errors.length === 0, 'no page errors', errors.join(' | '));
} finally { await browser.close(); server.close(); }
console.log(`lib/chip/fmt ui (headless, outside any app): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

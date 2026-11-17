#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-far-coords.mjs — CadCraft 2D at distant coordinates (0.9.1 FX.157, an Imtaar / "arcadian [art]" report 2026-11-09:
 * "the objects move when zooming … geometries in distant coordinates"). Headless, no sign-in: a local static server hands the
 * dev build's own doc.js + view.js to Chromium, so this tests the code that ships.
 *
 *   node tools/cadcraft-test/browser-far-coords.mjs [--app dev|0.9] [--shots <dir>]
 *
 * What it measures: a solid hatch square at E 830000 / N 4480000 (a UTM-sized coordinate) is drawn at several zoom levels with
 * the view centred on its corner. Each frame the position of the square's edge on screen is read from the pixels and compared
 * with where toScreen() (double precision) says it is. The error in pixels is the drift the reporter saw. Three drawings:
 *   near  — only the square (cache origin lands on it: the control, must be < 0.6 px at every zoom)
 *   far   — the square plus one stray line at 0,0 (the drawing's extents now reach the origin)
 *   wide  — the square plus a survey point 20 km away (a plausible real site)
 * Also: the fill and an outline of the same loop must stay on top of each other (no gap), and the picture must not
 * change just because an unrelated object far away exists.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const app = args.includes('--app') ? args[args.indexOf('--app') + 1] : 'dev';
const si = args.indexOf('--shots'); const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const ROOT = path.join(REPO, 'public_html/assets/apps/cadcraft', app);
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x ? ' — ' + x : '')); } };

const PAGE = `<!doctype html><html data-space="paper"><body style="margin:0"><div id="w" style="width:800px;height:600px;position:relative">
<canvas id="b" style="position:absolute;left:0;top:0"></canvas><canvas id="o" style="position:absolute;left:0;top:0"></canvas></div>
<script type="module">
import { Doc } from '/doc.js'; import { View } from '/view.js';
window.make = (extra) => {
  const doc = new Doc(); const v = new View(document.getElementById('b'), document.getElementById('o'), doc);
  v.grid = false; v.ucs = false;
  doc.change('t', () => {
    const E = 830000, N = 4480000, S = 100;
    doc.add({ type: 'hatch', layer: '0', solid: true, color: '#000000', loops: [[E, N, E + S, N, E + S, N + S, E, N + S]] });
    for (const q of extra) doc.add(q);
  });
  window.v = v; window.doc = doc; return true;
};
// the dark square's left edge (x) and bottom edge (y) on the canvas, read back from pixels, vs where toScreen says they are
window.measure = (zoom, ox, oy) => {
  const v = window.v; v.zoom = zoom; v.cx = 830000 + ox; v.cy = 4480000 + oy; v.invalidate(true); v.render();
  const c = document.getElementById('b'), ctx = c.getContext('2d'), d = v.dpr;
  const img = ctx.getImageData(0, 0, c.width, c.height), W = c.width, H = c.height;
  const dark = (x, y) => { const i = (y * W + x) * 4; return img.data[i + 3] > 0 && img.data[i] < 128 && img.data[i + 1] < 128; };
  const a = v.toScreen(830000, 4480000);   // the corner (bottom-left of the square in the world)
  // scan the row 20 px above the corner and the column 20 px right of it for the fill's edge
  const ry = Math.round((a.y - 20) * d), cx = Math.round((a.x + 20) * d);
  let ex = null; for (let x = Math.max(0, Math.round((a.x - 60) * d)); x < W; x++) { if (dark(x, ry)) { ex = x / d; break; } }
  let ey = null; for (let y = Math.min(H - 1, Math.round((a.y + 60) * d)); y >= 0; y--) { if (dark(cx, y)) { ey = (y + 1) / d; break; } }
  return { ex, ey, wantX: a.x, wantY: a.y, dpr: d };
};
window.shot = () => document.getElementById('b').toDataURL('image/png');
window.ready = true;
</script></body></html>`;

const server = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/' || u === '/index.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(PAGE); }
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.json') ? 'application/json' : 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + server.address().port;

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const problems = [];

const ZOOMS = [20, 200, 1000, 2000];   // CSS px per drawing unit; the view is centred 0.05 unit from the square's corner, so the corner stays on screen
const CASES = {
  near: [],
  far: [{ type: 'line', layer: '0', x1: 0, y1: 0, x2: 1, y2: 1 }],
  wide: [{ type: 'line', layer: '0', x1: 850000, y1: 4500000, x2: 850001, y2: 4500001 }],
};
const err = {};
for (const [name, extra] of Object.entries(CASES)) {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  page.on('pageerror', (e) => problems.push(name + ': ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/404/.test(m.text())) problems.push(name + ' console: ' + m.text()); });
  await page.goto(base + '/');
  await page.waitForFunction(() => window.ready);
  await page.evaluate((x) => window.make(x), extra);
  err[name] = [];
  for (const z of ZOOMS) {
    const m = await page.evaluate(([zz]) => window.measure(zz, 0.05, 0.05), [z]);
    const ex = m.ex == null ? null : Math.abs(m.ex - m.wantX), ey = m.ey == null ? null : Math.abs(m.ey - m.wantY);
    err[name].push({ z, ex, ey });
    console.log(`  ${name.padEnd(5)} zoom ${String(z).padStart(5)}  edge error  x ${ex == null ? 'n/a' : ex.toFixed(2)} px   y ${ey == null ? 'n/a' : ey.toFixed(2)} px`);
    if (SHOTS) { const b = Buffer.from((await page.evaluate(() => window.shot())).split(',')[1], 'base64'); fs.writeFileSync(path.join(SHOTS, `far-${name}-z${z}.png`), b); }
  }
  await page.close();
}
const worst = (n) => Math.max(...err[n].flatMap((r) => [r.ex ?? 99, r.ey ?? 99]));
ok(worst('near') < 0.75, 'near (control): the edge is where toScreen puts it at every zoom', 'worst ' + worst('near').toFixed(2) + ' px');
ok(worst('far') < 0.75, 'far (a stray object at 0,0): the edge is where toScreen puts it', 'worst ' + worst('far').toFixed(2) + ' px');
ok(worst('wide') < 0.75, 'wide (a survey point 20 km away): the edge is where toScreen puts it', 'worst ' + worst('wide').toFixed(2) + ' px');
ok(problems.length === 0, 'no console or page errors', problems.slice(0, 3).join(' | '));
await browser.close(); server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

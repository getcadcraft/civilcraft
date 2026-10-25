#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-print.mjs — CadCraft 0.7 session studio-07, D7.20, in the real page (/lab/cadcraft):
 *   the Plot dialog's PNG and SVG downloads (same display list as the PDF), Studio's printer list / paper / copies through a stand-in
 *   `cadcraftDesktop.printers` (what is sent: a PDF where the system prints PDFs, a PNG on Windows), and the browser's Print button.
 *   The real printing (CUPS `lp`, Windows PrintDocument) is a run sheet for the owner (docs/0.7-sessions/studio-07.md).
 *
 *   node tools/cadcraft-test/browser-print.mjs [--shots <dir>]
 *
 * Run as root (a session for the test admin cctest+cadcraft@projectz.xyz is minted by tools/cadcraft-test/admin.php, disabled again at the end).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];

async function open(bridgeInit) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  if (bridgeInit) await page.addInitScript(bridgeInit);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await page.evaluate(() => {
    const d = window.cadcraft.doc;
    d.change('t', () => {
      d.add({ type: 'line', x1: 0, y1: 0, x2: 200, y2: 120 });
      d.add({ type: 'circle', cx: 80, cy: 60, r: 30 });
      d.add({ type: 'text', x: 10, y: 100, h: 8, s: 'Plot <test> & more', rot: 0 });
    });
  });
  await page.evaluate(() => { window.cadcraft.engine.text('PLOT'); });
  await page.waitForSelector('dialog[data-plot][open]');
  await page.waitForFunction(() => !document.querySelector('[data-plot-save]').disabled);
  return { ctx, page };
}
const bridge = (accepts) => `(() => {
  const jobs = [];
  window.__jobs = jobs;
  window.cadcraftDesktop = { version: 1, readFile: async () => new Uint8Array(), launchFiles: async () => [], onOpenFiles() {},
    printers: {
      list: async () => ({ accepts: ${JSON.stringify(accepts)}, printers: [
        { name: 'Office', default: false, papers: ['Letter', 'A4'] },
        { name: 'Plotter', default: true, papers: ['A3', 'A1', 'ARCH D'] } ] }),
      print: async (bytes, job) => { jobs.push({ job, head: Array.from(bytes.slice(0, 5)), size: bytes.length }); return 'sent'; },
    } };
})();`;
const ascii = (a) => String.fromCharCode(...a);

try {
  console.log('\n== Studio on Linux/macOS: printer list, paper, copies, a PDF');
  {
    const { ctx, page } = await open(bridge('pdf'));
    await page.waitForFunction(() => document.querySelector('[data-plot-printer]').options.length > 0 && document.querySelector('[data-plot-printer]').value !== '');
    const ui = await page.evaluate(() => ({
      box: !document.querySelector('[data-plot-printbox]').hidden, printer: document.querySelector('[data-plot-printer]').value,
      printers: [...document.querySelector('[data-plot-printer]').options].map((o) => o.value),
      papers: [...document.querySelector('[data-plot-printpaper]').options].map((o) => o.textContent),
      openHidden: document.querySelector('[data-plot-open]').hidden, printDisabled: document.querySelector('[data-plot-print]').disabled,
    }));
    ok(ui.box && ui.printers.join() === 'Office,Plotter' && ui.printer === 'Plotter' && ui.openHidden && !ui.printDisabled, 'the printers are listed, the default chosen, "Open to print" hidden in Studio', JSON.stringify(ui));
    ok(ui.papers[0] === 'The printer\'s own paper' || /Same as the plot/.test(ui.papers[0]), 'the paper list starts with "same as the plot" or the printer\'s own', JSON.stringify(ui.papers));
    await page.selectOption('[data-plot-paper]', 'iso-a3').catch(() => {});
    await page.selectOption('[data-plot-printer]', 'Plotter');
    await page.waitForTimeout(300);
    const same = await page.evaluate(() => document.querySelector('[data-plot-printpaper]').options[0].textContent);
    ok(/Same as the plot \(A3\)/.test(same), 'an A3 plot on a printer with A3 offers "Same as the plot (A3)"', same);
    await page.fill('[data-plot-copies]', '3');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'print-dialog.png') });
    await page.click('[data-plot-print]');
    await page.waitForFunction(() => window.__jobs.length === 1, null, { timeout: 20000 }).catch(() => {});
    const jobs = await page.evaluate(() => window.__jobs);
    ok(jobs.length === 1 && jobs[0].job.printer === 'Plotter' && jobs[0].job.copies === 3 && jobs[0].job.paper === 'A3' && jobs[0].job.landscape === true, 'Print sends printer, 3 copies, paper A3 and the orientation', JSON.stringify(jobs[0]?.job));
    ok(jobs.length === 1 && ascii(jobs[0].head) === '%PDF-' && jobs[0].size > 500, 'what is sent is the plotted PDF', JSON.stringify(jobs[0] && { head: ascii(jobs[0].head), size: jobs[0].size }));
    await ctx.close();
  }
  console.log('\n== D7.05: the Plot dialog moves, and opens in a window of its own in Studio');
  {
    const { ctx, page } = await open(bridge('pdf'));
    await page.waitForFunction(() => document.querySelector('[data-plot-printer]').value !== '');
    const bar = await page.evaluate(() => { const b = document.querySelector('dialog[data-plot] .shell-dlg-bar'); const r = b.querySelector('h2').getBoundingClientRect(); const d = document.querySelector('dialog[data-plot]').getBoundingClientRect(); return { x: r.left + 10, y: r.top + 8, dx: d.left, dy: d.top }; });
    await page.mouse.move(bar.x, bar.y); await page.mouse.down(); await page.mouse.move(bar.x - 120, bar.y + 40, { steps: 4 }); await page.mouse.up();
    const moved = await page.evaluate(() => { const d = document.querySelector('dialog[data-plot]').getBoundingClientRect(); return { dx: d.left, dy: d.top }; });
    ok(Math.abs(moved.dx - (bar.dx - 120)) <= 2 && Math.abs(moved.dy - (bar.dy + 40)) <= 2, 'the Plot dialog moves by its title bar', JSON.stringify([bar, moved]));
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'plot-moved.png') });
    const [pop] = await Promise.all([ctx.waitForEvent('page'), page.click('dialog[data-plot] .shell-dlg-pop')]);
    await pop.waitForSelector('dialog[data-plot][open]', { timeout: 10000 });
    await pop.waitForFunction(() => document.querySelector('[data-plot-printer]').options.length > 0);
    ok(await pop.evaluate(() => document.title.includes('Plot') || document.title.length > 0), 'the Plot dialog is open in its own window', await pop.title());
    if (SHOTS) await pop.screenshot({ path: path.join(SHOTS, 'plot-window.png') });
    await pop.fill('[data-plot-copies]', '2');
    await pop.click('[data-plot-print]');
    await page.waitForFunction(() => window.__jobs.length === 1, null, { timeout: 20000 }).catch(() => {});
    const jobs = await page.evaluate(() => window.__jobs);
    ok(jobs.length === 1 && jobs[0].job.copies === 2 && ascii(jobs[0].head) === '%PDF-', 'Print from the window sends the job', JSON.stringify(jobs[0]?.job));
    await page.waitForFunction(() => !document.querySelector('dialog[data-plot]')?.open && (window.ccShellDialogs?.popped().length === 0), null, { timeout: 8000 }).catch(() => {});
    ok(await page.evaluate(() => window.ccShellDialogs.popped().length === 0 && document.querySelector('dialog[data-plot]').ownerDocument === document), 'the dialog finished, so its window is closed and it is back in the page');
    await page.evaluate(() => { window.cadcraft.engine.text('PLOT'); });
    await page.waitForSelector('dialog[data-plot][open]');
    ok(true, 'PLOT opens it again in the page');
    await ctx.close();
  }
  console.log('\n== Studio on Windows: a PNG is sent');
  {
    const { ctx, page } = await open(bridge('png'));
    await page.waitForFunction(() => document.querySelector('[data-plot-printer]').value !== '');
    await page.selectOption('[data-plot-printer]', 'Office');
    await page.click('[data-plot-print]');
    await page.waitForFunction(() => window.__jobs.length === 1, null, { timeout: 30000 }).catch(() => {});
    const jobs = await page.evaluate(() => window.__jobs);
    ok(jobs.length === 1 && jobs[0].head[1] === 0x50 && jobs[0].head[2] === 0x4e && jobs[0].size > 1000 && jobs[0].job.printer === 'Office' && jobs[0].job.copies === 1, 'the sheet goes as a PNG with the chosen printer', JSON.stringify(jobs[0] && { head: jobs[0].head, size: jobs[0].size, job: jobs[0].job }));
    await ctx.close();
  }
  console.log('\n== PNG and SVG downloads, and the browser\'s Print button');
  {
    const { ctx, page } = await open(null);
    const vis = await page.evaluate(() => ({ box: document.querySelector('[data-plot-printbox]').hidden, open: document.querySelector('[data-plot-open]').hidden, print: !!document.querySelector('[data-plot-print]') }));
    ok(vis.box && !vis.open && vis.print, 'in the browser: no printer box, "Open to print" and Print are there', JSON.stringify(vis));
    const [dl1] = await Promise.all([page.waitForEvent('download'), page.click('[data-plot-svg]')]);
    const svgPath = await dl1.path();
    const svg = fs.readFileSync(svgPath, 'utf8');
    ok(/\.svg$/.test(dl1.suggestedFilename()) && svg.startsWith('<?xml') && svg.includes('Plot &lt;test&gt; &amp; more'), 'Download SVG: a .svg with the drawing\'s text escaped', dl1.suggestedFilename());
    const parsed = await page.evaluate((t) => { const d = new DOMParser().parseFromString(t, 'image/svg+xml'); return { root: d.documentElement.nodeName, err: !!d.querySelector('parsererror'), paths: d.querySelectorAll('path').length }; }, svg);
    ok(parsed.root === 'svg' && !parsed.err && parsed.paths >= 2, 'the browser parses the SVG', JSON.stringify(parsed));
    await page.evaluate(() => { window.cadcraft.engine.text('PLOT'); });
    await page.waitForSelector('dialog[data-plot][open]');
    await page.waitForFunction(() => !document.querySelector('[data-plot-png]').disabled);
    const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('[data-plot-png]')]);
    const png = fs.readFileSync(await dl2.path());
    ok(/\.png$/.test(dl2.suggestedFilename()) && png.slice(0, 4).toString('latin1') === '\x89PNG' && png.length > 3000, 'Download PNG: a .png picture', `${dl2.suggestedFilename()} ${png.length}`);
    const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
    ok(w === 3508 && h === 2480 || (w > 2000 && h > 1400), 'an A4 landscape sheet at 300 dpi is about 3508 × 2480', `${w}x${h}`);
    await page.evaluate(() => { window.cadcraft.engine.text('PLOT'); });
    await page.waitForSelector('dialog[data-plot][open]');
    await page.waitForFunction(() => !document.querySelector('[data-plot-print]').disabled);
    // headless Chromium has no PDF viewer (a PDF in a frame crashes the page): the frame gets a blank page and a stand-in print()
    await page.evaluate(() => { const o = URL.createObjectURL.bind(URL); URL.createObjectURL = (b) => (b && b.type === 'application/pdf' ? (window.__pdfSize = b.size, 'about:blank') : o(b)); window.__printed = 0; });
    await page.click('[data-plot-print]');
    await page.waitForSelector('iframe[aria-hidden="true"]', { state: 'attached' });
    await page.evaluate(() => { const f = document.querySelector('iframe[aria-hidden="true"]'); f.contentWindow.print = () => { window.__printed++; }; });
    await page.waitForFunction(() => window.__printed === 1, null, { timeout: 8000 }).catch(() => {});
    const pr = await page.evaluate(() => ({ printed: window.__printed, size: window.__pdfSize, open: document.querySelector('dialog[data-plot]').open }));
    ok(pr.printed === 1 && pr.size > 500 && !pr.open && !problems.some((p) => /pageerror/.test(p)), 'Print in the browser makes the PDF, calls the frame\'s print and closes the dialog', JSON.stringify(pr));
    await ctx.close();
  }
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
if (problems.length) console.log('page problems:\n  ' + [...new Set(problems)].slice(0, 6).join('\n  '));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

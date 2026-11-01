#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-scanstart.mjs — Start from a scan (Super 0.1, lib/scanstart) in /lab/civilcraft, the Site view of SuperCad Studio's Layout:
 * the start card's link, a scanned plat (PNG, sheet 1.5° off square) straightened, scaled from two points and traced into a line layer;
 * page 2 of a two-page PDF placed on three points with known coordinates (residuals shown, a mistyped one found); both kept as map
 * layers with where they came from, saved in the project file and read back. Sheets are made here (small, in memory).
 * Run as root (Playwright; the CadCraft test admin's minted session).
 *   node tools/civilcraft-test/browser-scanstart.mjs
 */
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { writePng } from '../../lib/raster/index.js';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + d + ')' : '')); } };

// ---- the sheets ----
// a plat: a 400 × 200 px lot (100 ft × 50 ft at 4 px a foot), lines 3 px, the whole sheet turned 1.5° (a crooked scan), 100 dpi
const W = 1000, H = 700, DEG = 1.5;
const LOT = [[300, 450], [700, 450], [700, 250], [300, 250]];   // lower-left first, pixels (y down), before the turn
function platPng() {
  const th = DEG * Math.PI / 180, cx = W / 2, cy = H / 2;
  const turn = ([x, y]) => [cx + (x - cx) * Math.cos(th) + (y - cy) * Math.sin(th), cy - (x - cx) * Math.sin(th) + (y - cy) * Math.cos(th)];   // anticlockwise on screen
  const P = LOT.map(turn), segs = P.map((p, i) => [p, P[(i + 1) % 4]]);
  segs.push([turn([80, 650]), turn([920, 650])], [turn([80, 50]), turn([920, 50])]);   // a title strip and a border line: long lines to square on
  const data = new Uint8Array(W * H).fill(255);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    for (const [a, b] of segs) {
      const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)));
      if (Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy) <= 1.5) { data[y * W + x] = 0; break; }
    }
  }
  return writePng({ w: W, h: H, channels: 1, data }, { dpi: { x: 100, y: 100 } });
}
// a two-page PDF: page 2 holds a rectangle from (100, 100) to (500, 400) points
function pdf2() {
  const objs = [];
  const add = (s) => { objs.push(s); return objs.length; };
  const c1 = '0 0 0 RG 2 w 50 50 m 300 50 l S', c2 = '0 0 0 RG 2 w 100 100 400 300 re S';
  const cat = add('<< /Type /Catalog /Pages 2 0 R >>');
  add('<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>');
  add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>');
  add(`<< /Length ${c1.length} >>\nstream\n${c1}\nendstream`);
  add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 6 0 R >>');
  add(`<< /Length ${c2.length} >>\nstream\n${c2}\nendstream`);
  let out = '%PDF-1.4\n'; const offs = [];
  objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('');
  out += `trailer\n<< /Size ${objs.length + 1} /Root ${cat} 0 R >>\nstartxref\n${x}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const errors = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
await ctx.addInitScript(() => { try { localStorage.removeItem('cc-workspace'); } catch (e) {} });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(e.message));
page.on('dialog', (d) => d.dismiss());

/** Click sheet pixel (x, y) in the dialog's preview (fit view: the same arithmetic as the dialog). */
async function clickSheet(x, y, sheetW, sheetH) {
  const r = await page.$eval('[data-scanin-view]', (c) => { const b = c.getBoundingClientRect(); return { l: b.left, t: b.top, w: b.width, h: b.height, cw: c.width, ch: c.height }; });
  const s = Math.min(r.cw / sheetW, r.ch / sheetH), ox = (r.cw - sheetW * s) / 2, oy = (r.ch - sheetH * s) / 2;
  await page.mouse.click(r.l + (ox + x * s) * r.w / r.cw, r.t + (oy + y * s) * r.h / r.ch);
}
/** Scan → (the chooser) → "A photo or PDF file" → this file. */
async function chooseFile(name, mimeType, buffer, how) {
  await how();
  await page.waitForSelector('[data-scanin-source-dialog][open]', { timeout: 20000 });
  const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-scanin-src="file"]')]);
  await fc.setFiles({ name, mimeType, buffer });
  await page.waitForSelector('[data-scanin-dialog][open]', { timeout: 20000 });
  await page.waitForFunction(() => !document.querySelector('[data-busy]:not([hidden])'), null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(400);
}
const fill = async (sel, v) => { await page.fill(sel, String(v)); };

try {
  await page.goto('https://getcadcraft.com/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);

  console.log('== the start card offers it');
  ok(await page.isVisible('[data-hint] [data-cmd="scan-start"]'), 'the start card says "Only have it on paper? Start from a scan"', await page.textContent('[data-hint]').catch(() => ''));
  ok(await page.$('[data-cmd="scan-start"][role="menuitem"]') !== null, 'Surface › More has Start from a scan');

  console.log('== Scan: where the sheet comes from');
  await page.click('[data-hint] [data-cmd="scan-start"]');
  await page.waitForSelector('[data-scanin-source-dialog][open]');
  ok(await page.isDisabled('[data-scanin-src="scanner"]') && /needs CadCraft Studio on a computer/.test(await page.textContent('[data-scanin-src-why]')), 'in a browser the scanner choice is greyed, with the reason');
  ok(await page.isEnabled('[data-scanin-src="photo"]') && await page.isEnabled('[data-scanin-src="file"]'), 'a photo or a file can be chosen');
  const [camFc] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-scanin-src="photo"]')]);
  ok(await page.$eval('input[data-scanin-pick="camera"]', (i) => i.accept === 'image/*' && i.getAttribute('capture') === 'environment'), 'Take a photo asks the device for its camera');
  await camFc.setFiles([]);
  await page.click('[data-scanin-source-dialog][open] .cv-dlg-foot .btn-line');
  await page.waitForTimeout(300);

  console.log('== a crooked plat scan: straightened, scaled from two points, traced');
  await chooseFile('plat-12-34.png', 'image/png', Buffer.from(await platPng()), () => page.click('[data-hint] [data-cmd="scan-start"]'));
  ok(/Start from a scan: plat-12-34\.png/.test(await page.textContent('[data-scanin-dialog] h2')), 'the dialog names the file');
  const note = await page.textContent('[data-scanin-straight-note]');
  const deg = Number((/(-?\d+\.\d+)°/.exec(note) || [])[1]);
  ok(Math.abs(Math.abs(deg) - DEG) < 0.2, 'it finds the sheet 1.5° off square', note);
  // straighten off, so the lot's corners are where they were drawn turned; turn them the same way here
  await page.click('[data-scanin-straight]');
  await page.waitForTimeout(500);
  ok((await page.textContent('[data-scanin-straight-note]')).trim() === '', 'straighten off: used as scanned');
  await page.click('[data-scanin-straight]');   // back on: the lot is square again, corners where they were drawn
  await page.waitForTimeout(800);
  ok(await page.isDisabled('[data-scanin-go]'), 'nothing placed until it knows where');
  await clickSheet(300, 450, W, H); await clickSheet(700, 450, W, H);   // the lot's front, 100 ft
  await fill('[data-scanin-dist]', 100);
  await fill('[data-scanin-ox]', 5000); await fill('[data-scanin-oy]', 2000);
  const what1 = await page.textContent('[data-scanin-what]');
  ok(/1 inch = 2[45]\.\d+ ft/.test(what1), 'the summary says what scale that makes (≈ 25 ft an inch at 100 dpi, 4 px a foot)', what1);
  await page.check('[data-scanin-trace]');
  await page.click('[data-scanin-go]');
  await page.waitForFunction(() => window.civilcraft.gis?.scan?.last, null, { timeout: 30000 });
  const r1 = await page.evaluate(() => window.civilcraft.gis.scan.last);
  ok(Math.abs(Math.hypot(r1.gt[1], r1.gt[4]) - 0.25) < 0.01, 'placed at ≈ 0.25 ft a pixel', JSON.stringify(r1.gt));
  ok(r1.placed === 'two-points' && r1.traced >= 4, 'converted into a drawing by default: the lot (≥ 4 lines)', r1.traced);
  const m1 = await page.evaluate(() => window.civilcraft.project.state.gis.maps.at(-1));
  ok(m1.kind === 'image' && m1.scanFile === 'plat-12-34.png' && m1.scanPlaced === 'two-points' && /^[0-9a-f]{64}$/.test(m1.scanSha256) && m1.scanDpi === 100, 'a picture map layer that keeps where it came from', JSON.stringify(m1).slice(0, 300));
  ok(/straightened/.test(m1.scanSteps) && /traced/.test(m1.scanSteps), 'and what was done to it', m1.scanSteps);
  const lay = await page.evaluate(() => { const g = window.civilcraft.project.state.gis.layers.at(-1); const fs = window.civilcraft.project.gisFeatures.get(g.id); const lot = fs.filter((f) => { const c = f.g.c[0], a = c[0], b = c.at(-1); return Math.hypot(b[0] - a[0], b[1] - a[1]) < 150; });   // the lot, not the border lines
    const xs = lot.flatMap((f) => f.g.c[0].map((p) => p[0])), ys = lot.flatMap((f) => f.g.c[0].map((p) => p[1])); return { name: g.name, geom: g.geom, n: fs.length, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; });
  ok(lay.geom === 'ln' && /Drawing from plat-12-34/.test(lay.name), 'a line layer named for the sheet', JSON.stringify(lay));
  // the lot's front was clicked as 0 → 100 ft from E 5000; the sheet's lower-left is the origin, so the lot runs 5000 + (300 … 700)/4
  ok(Math.abs(lay.x1 - lay.x0 - 100) < 3 && Math.abs(lay.y1 - lay.y0 - 50) < 3, 'the traced lot is 100 ft × 50 ft', JSON.stringify(lay));
  ok(Math.abs(lay.x0 - (5000 + 300 * 0.25)) < 4 && Math.abs(lay.y0 - (2000 + (H - 450) * 0.25)) < 4, '... where the sheet put it', JSON.stringify(lay));
  const st = await page.textContent('[data-status]');
  ok(/Placed plat-12-34 under the plan \(scaled from two points\)\. Converted it into a drawing: \d+ lines/.test(st), 'the status line says what was made', st);

  console.log('== page 2 of a PDF on known points');
  await chooseFile('record-plat.pdf', 'application/pdf', pdf2(), () => page.evaluate(() => { window.civilcraft.command('scan-start'); }));
  ok(await page.$('[data-scanin-page]') !== null, 'a page picker for two pages');
  await page.selectOption('[data-scanin-page]', '1');
  await page.waitForTimeout(1500);
  await page.click('[data-scanin-mode-btn="pts"]');
  // at 200 dpi a point is 200/72 px; the rectangle's corners (100,100) (500,100) (500,400) on a 612 × 792 page, y down in pixels
  const k = 200 / 72, PW = Math.floor(612 * k), PH = Math.floor(792 * k);
  const corners = [[100, 100], [500, 100], [500, 400], [100, 400]].map(([x, y]) => [x * k, (792 - y) * k]);
  const coords = [[10000, 20000], [10400, 20000], [10400, 20300], [10000, 20300]];   // 1 pt = 1 ft: a made-up local grid
  for (const [x, y] of corners.slice(0, 3)) await clickSheet(x, y, PW, PH);
  for (let i = 0; i < 3; i++) { await fill(`[data-scanin-pt-e="${i}"]`, coords[i][0]); await fill(`[data-scanin-pt-n="${i}"]`, coords[i][1] + (i === 2 ? 60 : 0)); }
  const three = await page.textContent('[data-scanin-what]');
  ok(Number((/agree to ([\d.]+)/.exec(three) || [])[1]) > 10 && /One more point tells which/.test(three), 'three points with one mistyped: they disagree, and it does not guess which', three);
  await clickSheet(...corners[3], PW, PH);
  await fill('[data-scanin-pt-e="3"]', coords[3][0]); await fill('[data-scanin-pt-n="3"]', coords[3][1]);
  const bad = await page.textContent('[data-scanin-what]');
  ok(/Point 3 is the furthest off/.test(bad), 'a fourth point finds the mistyped northing', bad);
  await fill('[data-scanin-pt-n="2"]', coords[2][1]);
  const good = await page.textContent('[data-scanin-what]');
  const rms = Number((/agree to ([\d.]+)/.exec(good) || [])[1]);
  ok(rms < 3, 'typed right, the four points agree within a click (a few ft at this zoom)', good);
  await page.click('[data-scanin-go]');
  await page.waitForFunction(() => window.civilcraft.gis.scan.last?.placed === 'points', null, { timeout: 30000 });
  const m2 = await page.evaluate(() => window.civilcraft.project.state.gis.maps.at(-1));
  ok(m2.scanFile === 'record-plat.pdf' && m2.scanPage === 2 && m2.scanPages === 2 && m2.scanFormat === 'pdf' && m2.scanRms !== null, 'the PDF page keeps page 2 of 2 and how well it fits', JSON.stringify(m2).slice(0, 300));
  const corner = await page.evaluate(([m, x, y]) => [m.a0 + m.a1 * x + m.a2 * y, m.a3 + m.a4 * x + m.a5 * y], [m2, corners[1][0] * m2.width / PW, corners[1][1] * m2.height / PH]);
  ok(Math.hypot(corner[0] - 10400, corner[1] - 20000) < 5, 'the second corner lands on its coordinates', JSON.stringify(corner));

  console.log('== a picture WITH its world file is still a map layer');
  const before = await page.evaluate(() => window.civilcraft.project.state.gis.maps.length);
  const pngB64 = Buffer.from(await platPng()).toString('base64');
  await page.evaluate(async (b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    window.civilcraft.gis.open([new File([bytes], 'ortho.png', { type: 'image/png' }), new File(['0.5\n0\n0\n-0.5\n1000\n2000\n'], 'ortho.pgw')]);
  }, pngB64);
  // the map layer opener asks which system the picture is in: the project's own coordinates
  await page.click('dialog.cv-ask[open] button[data-key="same"]', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => window.civilcraft.project.state.gis.maps.at(-1));
  ok(!(await page.$('[data-scanin-dialog][open]')) && after?.name === 'ortho' && !after.scanFile, 'PNG + world file: a map layer, no scan dialog', JSON.stringify(after || {}).slice(0, 160));
  ok(await page.evaluate(() => window.civilcraft.project.state.gis.maps.length) === before + 1, '... one more layer');
  await page.evaluate(() => window.civilcraft.command('undo'));

  console.log('== the Scans list: each scan waits for the drafter');
  const ids = await page.evaluate(() => window.civilcraft.project.state.gis.maps.filter((m) => m.scanFile).map((m) => [m.scanFile, m.id]));
  const plat = ids.find((x) => x[0] === 'plat-12-34.png')[1], rec = ids.find((x) => x[0] === 'record-plat.pdf')[1];
  ok(await page.isVisible('[data-scans]') && (await page.$$('[data-scan]')).length === 2, 'the Site panel lists both scans');
  ok(/2 waiting for you/.test(await page.textContent('[data-scans-need]')), 'and how many wait for a decision', await page.textContent('[data-scans-need]'));
  ok(/Converted into a drawing \(\d+ lines\)\. Keep the scan as a reference, or remove it\?/.test(await page.textContent(`[data-scan-status="${plat}"]`)), 'a converted scan asks: keep or remove');
  await page.click(`[data-scan-keep="${plat}"]`);
  ok(await page.getAttribute(`[data-scan="${plat}"]`, 'data-scan-state') === 'kept' && /kept as a reference/.test(await page.textContent(`[data-scan-status="${plat}"]`)), 'Keep: a reference under the plan');
  ok(await page.evaluate((id) => window.civilcraft.project.state.gis.maps.find((m) => m.id === id).scanState, plat) === 'kept', '... saved on its record');
  const recLayer = await page.evaluate((id) => window.civilcraft.project.state.gis.maps.find((m) => m.id === id).scanLayers, rec);
  await page.click(`[data-scan-remove="${rec}"]`);
  ok(!(await page.$(`[data-scan="${rec}"]`)) && await page.evaluate((id) => !window.civilcraft.project.state.gis.maps.some((m) => m.id === id), rec), 'Remove the scan: the picture goes');
  ok(await page.evaluate((lid) => window.civilcraft.project.state.gis.layers.some((l) => l.id === lid), recLayer), '... its drawing stays');
  await page.evaluate(() => window.civilcraft.command('undo'));
  ok(await page.$(`[data-scan="${rec}"]`) !== null, 'Undo brings the scan back');
  await page.click(`[data-scan-remove-both="${rec}"]`);
  ok(!(await page.$(`[data-scan="${rec}"]`)) && await page.evaluate((lid) => !window.civilcraft.project.state.gis.layers.some((l) => l.id === lid), recLayer), 'Remove both: the scan and its drawing go');

  console.log('== a scanner (Studio on a computer; a stand-in network scanner here)');
  await page.evaluate(([b64, caps]) => {
    const png = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)), enc = new TextEncoder(); let pages = 0;
    window.__scanLog = [];
    window.cadcraftDesktop = { scanners: {
      browse: async () => [{ id: 'u-1', name: 'Office Copier 4500', host: '192.168.1.9', port: 80, rs: 'eSCL' }],
      request: async (id, m, p, b) => {
        window.__scanLog.push(m + ' ' + p + (b ? ' ' + (/<scan:XResolution>(\d+)</.exec(b) || [])[1] : ''));
        if (p === '/eSCL/ScannerCapabilities') return { status: 200, headers: {}, body: enc.encode(caps) };
        if (p === '/eSCL/ScannerStatus') return { status: 200, headers: {}, body: enc.encode('<pwg:State>Idle</pwg:State>') };
        if (m === 'POST') return { status: 201, headers: { location: 'http://192.168.1.9/eSCL/ScanJobs/1' }, body: new Uint8Array() };
        if (p === '/eSCL/ScanJobs/1/NextDocument') return pages++ ? { status: 404, headers: {}, body: new Uint8Array() } : { status: 200, headers: { 'content-type': 'image/png' }, body: png };
        return { status: 404, headers: {}, body: new Uint8Array() };
      } } };
  }, [Buffer.from(await platPng()).toString('base64'), '<scan:ScannerCapabilities><pwg:MakeAndModel>Office Copier 4500</pwg:MakeAndModel><scan:Platen><scan:ColorMode>Grayscale8</scan:ColorMode><scan:XResolution>100</scan:XResolution><scan:XResolution>300</scan:XResolution><pwg:DocumentFormat>image/png</pwg:DocumentFormat></scan:Platen></scan:ScannerCapabilities>']);
  await page.evaluate(() => { window.civilcraft.command('scan-start'); });
  await page.waitForSelector('[data-scanin-source-dialog][open]');
  ok(await page.isEnabled('[data-scanin-src="scanner"]'), 'with a scanner bridge the Scanner choice is open');
  await page.click('[data-scanin-src="scanner"]');
  await page.waitForFunction(() => document.querySelector('[data-scanin-scanner] option'), null, { timeout: 10000 });
  ok(/Office Copier 4500/.test(await page.textContent('[data-scanin-scanner]')), 'it lists the scanners found on the network');
  await page.selectOption('[data-scanin-scanner-dpi]', '150');
  await page.click('[data-scanin-scanner-go]');
  await page.waitForSelector('[data-scanin-dialog][open]', { timeout: 20000 });
  ok(/Start from a scan: Scan \d{4}-\d\d-\d\d/.test(await page.textContent('[data-scanin-dialog][open] h2')), 'the scanned page opens in the dialog');
  ok(await page.evaluate(() => window.__scanLog.includes('POST /eSCL/ScanJobs 100')), 'the job asked for the scanner\'s resolution nearest the one chosen (150 → 100)', await page.evaluate(() => window.__scanLog.join(' | ')));
  await page.uncheck('[data-scanin-trace]');   // place only: convert later from the list
  await page.click('[data-scanin-mode-btn="stated"]');
  await page.fill('[data-scanin-stated]', '25');
  await page.click('[data-scanin-go]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.maps.some((m) => m.scanSource === 'scanner'), null, { timeout: 30000 });
  const sc = await page.evaluate(() => window.civilcraft.project.state.gis.maps.find((m) => m.scanSource === 'scanner'));
  ok(sc.scanState === 'new' && /From a scanner/.test(await page.textContent(`[data-scan="${sc.id}"]`)) && /Not converted into a drawing yet/.test(await page.textContent(`[data-scan-status="${sc.id}"]`)), 'a scan placed without converting waits as "not converted yet", from a scanner');
  const nLayers = await page.evaluate(() => window.civilcraft.project.state.gis.layers.length);
  await page.click(`[data-scan-convert="${sc.id}"]`);
  await page.waitForFunction((id) => document.querySelector(`[data-scan="${id}"]`)?.dataset.scanState === 'drawn', sc.id, { timeout: 30000 });
  ok(await page.evaluate(() => window.civilcraft.project.state.gis.layers.length) === nLayers + 1, 'Convert into a drawing (later, from the list): a new drawing layer');
  ok(/Converted into a drawing \(\d+ lines\)/.test(await page.textContent(`[data-scan-status="${sc.id}"]`)), '... and the scan now asks keep or remove');
  await page.click(`[data-scan-convert="${sc.id}"]`);   // Convert again
  await page.waitForTimeout(1500);
  ok(await page.evaluate(() => window.civilcraft.project.state.gis.layers.length) === nLayers + 1, 'Convert again replaces its drawing (no second layer)');
  await page.evaluate(() => window.civilcraft.command('undo'));
  ok(await page.evaluate(() => window.civilcraft.project.state.gis.layers.length) === nLayers + 1 && await page.getAttribute(`[data-scan="${sc.id}"]`, 'data-scan-state') === 'drawn', 'Undo of Convert again: the first drawing is back (one step)');
  await page.evaluate(() => window.civilcraft.command('undo'));
  ok(await page.evaluate(() => window.civilcraft.project.state.gis.layers.length) === nLayers && await page.getAttribute(`[data-scan="${sc.id}"]`, 'data-scan-state') === 'new', 'Undo of Convert: no drawing, waiting again (one step)');
  await page.evaluate(() => window.civilcraft.command('redo'));
  await page.evaluate(() => { delete window.cadcraftDesktop; });

  console.log('== saved and read back');
  const json = await page.evaluate(() => JSON.stringify(window.civilcraft.project.toJSON ? window.civilcraft.project.toJSON() : window.civilcraft.project.serialize()));
  const back = JSON.parse(json);
  const maps = (back.state || back).gis?.maps || back.gis?.maps || [];
  ok(maps.some((m) => m.scanFile === 'plat-12-34.png' && m.scanState === 'kept') && maps.some((m) => m.scanSource === 'scanner'), 'the project file keeps the scans, their records and their state');
  ok(Object.keys(back.gisImages || {}).length >= 2, 'and their pictures', Object.keys(back.gisImages || {}).join(','));
} catch (e) {
  ok(false, 'ran to the end', (e.stack || e.message) + ' | status: ' + (await page.textContent('[data-status]').catch(() => '')));
} finally {
  ok(errors.length === 0, 'no console errors', errors.slice(0, 4).join(' | '));
  await browser.close();
}
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

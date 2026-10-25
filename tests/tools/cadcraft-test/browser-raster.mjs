#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-raster.mjs — scanned drawings (0.7 LC.6, session `trace`) in the real page (/lab/cadcraft): a TIFF and a PDF page that is
 * a picture are placed and drawn, the sheet is squared, cleaned and traced with the real PNG writer and pdf.js, the trace sits on the
 * ink, snapping finds the corners of the scan, and the page raises no errors.
 *
 *   node tools/cadcraft-test/browser-raster.mjs [--shots <dir>]
 *
 * Run as root (a session for the test admin cctest+cadcraft@projectz.xyz is minted by tools/cadcraft-test/admin.php, disabled
 * again at the end). Cached Playwright Chromium. Fixtures: fixtures/raster/ (made once by tools/raster/make-fixtures.mjs).
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
const b64 = (f) => fs.readFileSync(path.join(REPO, 'fixtures/raster', f)).toString('base64');
const FILES = { 'plan-2page-g4.tif': b64('plan-2page-g4.tif'), 'plan-scan.png': b64('plan-scan.png'), 'plan-scan.jpg': b64('plan-scan.jpg'), 'plan-scan-progressive.jpg': b64('plan-scan-progressive.jpg'), 'plan-raster.pdf': b64('plan-raster.pdf') };

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const page = await ctx.newPage();
page.setDefaultTimeout(30000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
try {
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.cadcraft.host);
  await page.evaluate((files) => {
    const dec = (b) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
    const h = window.cadcraft.host;
    h.__next = null;
    h.pickScans = async () => [{ name: h.__next, bytes: dec(files[h.__next]) }];
    window.__t = {
      busy: () => !!window.cadcraft.engine.running && !window.cadcraft.engine.waiting,
      say: async (...lines) => { for (const l of lines) { window.cadcraft.engine.text(l); await new Promise((r) => setTimeout(r, 30)); for (let i = 0; i < 3000 && window.cadcraft.engine.running && !window.cadcraft.engine.waiting; i++) await new Promise((r) => setTimeout(r, 10)); } },
      click: async (x, y) => { window.cadcraft.engine.click({ x, y }); await new Promise((r) => setTimeout(r, 30)); for (let i = 0; i < 3000 && window.cadcraft.engine.running && !window.cadcraft.engine.waiting; i++) await new Promise((r) => setTimeout(r, 10)); },
    };
  }, FILES);
  const say = (...l) => page.evaluate((l) => window.__t.say(...l), l);
  const click = (x, y) => page.evaluate(([x, y]) => window.__t.click(x, y), [x, y]);
  const pic = () => page.evaluate(() => {
    const d = window.cadcraft.doc, r = [...d.model.values()].find((e) => e.type === 'insert' && d.blocks.get(e.block)?.entities.some((x) => x.pic));
    if (!r) return null;
    const f = d.blocks.get(r.block).entities.find((x) => x.pic);
    return { ref: { x: r.x, y: r.y, sx: r.sx, rot: r.rot }, pic: f.pic };
  });

  console.log('\n== SCANATTACH: a TIFF page, drawn on screen');
  await page.evaluate(() => { window.cadcraft.host.__next = 'plan-2page-g4.tif'; });
  await say('SCANATTACH', '1', '0,0', '');
  let p = await pic();
  ok(p && p.pic.w === 1200 && p.pic.h === 848 && /\.png$/.test(p.pic.file), 'a G4 TIFF becomes a picture the page can show', JSON.stringify(p));
  await say('ZOOM', 'E');
  await page.waitForTimeout(600);
  const drawn = await page.evaluate(async () => {
    const v = window.cadcraft.view, c = document.querySelector('canvas');
    const cache = v.ensureCache();
    return { pictures: cache.pictures.length, w: c.width };
  });
  ok(drawn.pictures === 1, 'the picture is in the drawing\'s display list');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'scan-tiff.png') });
  await say('U');
  // undo of the attach
  p = await pic();
  ok(p === null, 'undo removes the picture');

  console.log('\n== squared, cleaned, traced (the real PNG writer)');
  await page.evaluate(() => { window.cadcraft.host.__next = 'plan-scan.png'; });
  await say('SCA', '0,0', '');
  await say('ZOOM', 'E');
  const corner = async () => page.evaluate(() => {
    const d = window.cadcraft.doc, r = [...d.model.values()].find((e) => e.type === 'insert' && d.blocks.get(e.block)?.entities.some((x) => x.pic));
    const f = d.blocks.get(r.block).entities.find((x) => x.pic).pic;
    return { x: r.x + f.x * r.sx, y: r.y + f.y * r.sx };
  });
  let c0 = await corner();
  await say('SCD'); await click(c0.x + 2, c0.y + 2);
  const prompt1 = await page.evaluate(() => document.body.innerText.match(/long lines lie at [-\d.]+°/)?.[0] || '');
  ok(/lie at 1\.7\d?°/.test(prompt1), 'SCANDESKEW shows the angle it found in the command history: ' + prompt1);
  await say('A');
  p = await pic();
  ok(/deskew/.test(p.pic.file), 'the sheet is squared into a new picture: ' + p.pic.file);
  await say('SCC'); c0 = await corner(); await click(c0.x + 2, c0.y + 2); await say('');
  p = await pic();
  ok(/clean/.test(p.pic.file), 'black and white: ' + p.pic.file);
  const bilevel = await page.evaluate(async () => {
    const d = window.cadcraft.doc, r = [...d.model.values()].find((e) => e.type === 'insert' && d.blocks.get(e.block)?.entities.some((x) => x.pic));
    const f = d.blocks.get(r.block).entities.find((x) => x.pic).pic, rec = d.pictures.get(f.file.toLowerCase());
    const bm = await createImageBitmap(new Blob([rec.bytes], { type: 'image/png' }));
    const c = new OffscreenCanvas(bm.width, bm.height), x = c.getContext('2d'); x.drawImage(bm, 0, 0);
    const px = x.getImageData(0, 0, bm.width, bm.height).data;
    let other = 0, ink = 0;
    for (let i = 0; i < px.length; i += 4) { if (px[i] !== 0 && px[i] !== 255) other++; if (px[i] === 0) ink++; }
    return { other, ink, w: bm.width };
  });
  ok(bilevel.other === 0 && bilevel.ink > 30000, 'the browser decodes our PNG: only black and white, ' + bilevel.ink + ' px of ink');
  await say('SCT'); c0 = await corner(); await click(c0.x + 2, c0.y + 2); await say('R');
  const traced = await page.evaluate(() => { const d = window.cadcraft.doc; const t = d.all().filter((e) => e.layer === 'SCAN-TRACE'); return { lines: t.filter((e) => e.type === 'line').length, arcs: t.filter((e) => e.type === 'arc').length, hist: document.body.innerText.match(/Traced \d+ lines and \d+ arcs onto layer SCAN-TRACE/)?.[0] || '' }; });
  ok(traced.lines > 25 && traced.arcs === 3, 'SCANTRACE: ' + traced.lines + ' lines and ' + traced.arcs + ' arcs on a new layer', traced.hist);
  await say('ZOOM', 'E');
  await page.waitForTimeout(500);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'scan-trace.png') });

  console.log('\n== snapping to the lines of the scan');
  // the first corner of the outer wall, from the trace: the lowest-left line end
  const target = await page.evaluate(() => {
    const d = window.cadcraft.doc, t = d.all().filter((e) => e.layer === 'SCAN-TRACE' && e.type === 'line');
    // an outer corner: the end shared by a level and a plumb long line at the minimum x + minimum y
    let best = null;
    for (const e of t) for (const [x, y] of [[e.x1, e.y1], [e.x2, e.y2]]) if (!best || x + y < best.x + best.y) best = { x, y };
    return best;
  });
  // hide the trace so only the raster can be snapped to
  await page.evaluate(() => { const d = window.cadcraft.doc; d.layers.get('SCAN-TRACE').on = false; d.emitLayers?.(); window.cadcraft.view.invalidate(true); });
  const snap1 = () => page.evaluate((t) => { const v = window.cadcraft.view; const s = v.snap({ x: t.x + 0.8, y: t.y - 0.6 }, { kinds: new Set(['end', 'mid', 'int']), px: 14 }); return s ? { kind: s.kind, x: s.x, y: s.y } : null; }, target);
  await snap1();                      // the first call starts reading the sheet
  await page.waitForTimeout(1500);
  const s = await snap1();
  ok(s && Math.hypot(s.x - target.x, s.y - target.y) < 3, 'the pointer near a corner of the scan snaps to it (' + (s ? s.kind : 'nothing') + ')', JSON.stringify({ s, target }));
  await say('RASTERSNAP', 'F');
  const off = await snap1();
  ok(off === null, 'RASTERSNAP Off: the scan offers nothing');
  await say('RASTERSNAP', 'O');

  console.log('\n== a PDF page that is a picture, and a JPEG');
  await page.evaluate(() => { window.cadcraft.host.__next = 'plan-raster.pdf'; });
  await say('SCA', '2', '3000,0', '100', '');
  const pdfPic = await page.evaluate(() => { const d = window.cadcraft.doc; const refs = [...d.model.values()].filter((e) => e.type === 'insert' && d.blocks.get(e.block)?.entities.some((x) => x.pic)); const f = d.blocks.get(refs[refs.length - 1].block).entities.find((x) => x.pic).pic; const rec = d.pictures.get(f.file.toLowerCase()); return { w: f.w, h: f.h, file: f.file, ok: !!rec, scan: [...(d.scans || new Map()).values()].some((s) => s.original.format === 'pdf' && s.original.page === 2) }; });
  ok(pdfPic.ok && pdfPic.scan && Math.abs(pdfPic.w - 1169) <= 2 && /-p2\.png$/.test(pdfPic.file), 'the raster PDF\'s page 2 is drawn at 100 dpi by pdf.js (' + pdfPic.w + ' × ' + pdfPic.h + ') and kept with its original', JSON.stringify(pdfPic));
  await page.evaluate(() => { window.cadcraft.host.__next = 'plan-scan.jpg'; });
  await say('SCA', '6000,0', '');
  const jpg = await page.evaluate(() => { const d = window.cadcraft.doc; const refs = [...d.model.values()].filter((e) => e.type === 'insert' && d.blocks.get(e.block)?.entities.some((x) => x.pic)); const f = d.blocks.get(refs[refs.length - 1].block).entities.find((x) => x.pic).pic; return { w: f.w, file: f.file }; });
  ok(jpg.w === 1200, 'a JPEG scan is placed (' + jpg.file + ')');
  await page.evaluate(() => { window.cadcraft.host.__next = 'plan-scan-progressive.jpg'; });
  await say('SCA', '9000,0', '');
  const prog = await page.evaluate(() => { const d = window.cadcraft.doc; const refs = [...d.model.values()].filter((e) => e.type === 'insert' && d.blocks.get(e.block)?.entities.some((x) => x.pic)); const f = d.blocks.get(refs[refs.length - 1].block).entities.find((x) => x.pic).pic; return { w: f.w, file: f.file }; });
  ok(prog.w === 1200 && /progressive/.test(prog.file), 'a progressive JPEG is read by the browser\'s own decoder (' + prog.file + ')');
  await say('ZOOM', 'E');
  await page.waitForTimeout(800);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'scan-all.png') });

  console.log('\n== errors');
  const relevant = problems.filter((m) => !/favicon|Failed to load resource.*(404|403)/.test(m));
  ok(!relevant.length, 'the page raised no errors', relevant.slice(0, 3).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e && e.stack || e));
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down'], { stdio: 'ignore' }); } catch { /* the account stays disabled when it was never up */ }
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

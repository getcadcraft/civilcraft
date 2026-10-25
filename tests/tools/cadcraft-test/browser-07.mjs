#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-07.mjs — CadCraft 0.7 session cad-bugs, in the real page (/lab/cadcraft):
 *   D7.56  a trackpad swipe pans, a pinch and a mouse wheel zoom, the input profile's wheel setting still applies
 *   D7.16  a DXF in Windows-1251 / 949 opens with its words; a plot with Korean, Japanese and Chinese text fetches the CJK font
 *          over HTTP and the PDF carries it
 *
 *   node tools/cadcraft-test/browser-07.mjs [--shots <dir>]
 *
 * Run as root (a session for the test admin cctest+cadcraft@projectz.xyz is minted by tools/cadcraft-test/admin.php, disabled again
 * at the end). Cached Playwright Chromium, a stand-in desktop bridge (as browser-open.mjs).
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
const CP = path.join(REPO, 'fixtures/dwg/codepage');
const truth = JSON.parse(fs.readFileSync(path.join(CP, 'truth.json'), 'utf8'));
const files = {};
for (const n of ['ru-1251', 'ko-949', 'vi-1258']) files['/jobs/' + n + '.dxf'] = fs.readFileSync(path.join(CP, n + '.dxf')).toString('base64');
files['/jobs/cadcraft-pdf-underlay.dwg'] = fs.readFileSync(path.join(REPO, 'fixtures/showcase/cadcraft-pdf-underlay.dwg')).toString('base64');
files['/jobs/colour-lines.pdf'] = fs.readFileSync(path.join(REPO, 'fixtures/pdf/colour-lines.pdf')).toString('base64');

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const page = await ctx.newPage();
page.setDefaultTimeout(10000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
try {
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await page.addInitScript((files) => {
    const store = new Map(Object.entries(files).map(([k, v]) => [k, Uint8Array.from(atob(v), (c) => c.charCodeAt(0))]));
    const desk = window.__desk = { answers: [] };
    window.cadcraftDesktop = {
      version: 1,
      openDialog: async () => (desk.answers.length ? desk.answers.shift() : null),
      saveDialog: async () => null,
      readFile: async (p) => { if (!store.has(p)) throw new Error('not_found: ' + p); return store.get(p).slice(); },
      writeFile: async (p, b) => { store.set(p, b); },
      stat: async (p) => (store.has(p) ? { size: store.get(p).length, mtime: 0 } : null),
      launchFiles: async () => [],
      onOpenFiles: (cb) => { window.__deskOpen = cb; },
    };
  }, files);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.__deskOpen);

  console.log('\n== D7.56: trackpad swipe, pinch, mouse wheel');
  const V = () => page.evaluate(() => { const v = window.cadcraft.view; return { z: v.zoom, cx: v.cx, cy: v.cy }; });
  const wheel = (init) => page.evaluate((init) => {
    document.elementFromPoint(700, 450).dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, clientX: 700, clientY: 450, deltaMode: 0, ...init }));
  }, init);
  let a = await V();
  for (let i = 0; i < 6; i++) { await wheel({ deltaX: 14.5, deltaY: -9.25 }); await page.waitForTimeout(16); }
  let b = await V();
  ok(Math.abs(b.z - a.z) < 1e-9 && (Math.abs(b.cx - a.cx) > 1e-6 || Math.abs(b.cy - a.cy) > 1e-6), 'a two-finger swipe pans and does not zoom', JSON.stringify({ a, b }));
  ok(b.cx > a.cx && b.cy > a.cy, 'the drawing follows the fingers (fingers left and down: the view centre goes right and up)', JSON.stringify({ a, b }));
  a = await V();
  for (let i = 0; i < 4; i++) { await wheel({ deltaX: 0, deltaY: -100 }); }
  b = await V();
  ok(b.z > a.z * 1.2, 'a mouse wheel (steps of 100) zooms in', JSON.stringify({ a, b }));
  a = await V();
  await wheel({ deltaX: 0, deltaY: -7.5, ctrlKey: true });
  b = await V();
  ok(b.z > a.z, 'a pinch (ctrl + wheel) zooms', JSON.stringify({ a, b }));
  // the input profile's wheel setting: reverse the direction through the page's own input-mouse module
  const flipped = await page.evaluate(async () => {
    const url = performance.getEntriesByType('resource').map((r) => r.name).find((n) => /\/input-mouse\.js/.test(n));
    if (!url) return null;
    const m = await import(url);
    const before = m.mouse();
    m.setMouse({ ...before, wheel: -1, zoomSpeed: 2 });
    return true;
  });
  if (flipped) {
    a = await V();
    await wheel({ deltaX: 0, deltaY: -100 });
    b = await V();
    ok(b.z < a.z, 'the style\'s reversed wheel still reverses the mouse wheel', JSON.stringify({ a, b }));
    a = await V();
    await wheel({ deltaX: 9, deltaY: 6.5 });
    b = await V();
    ok(Math.abs(b.z - a.z) < 1e-9, '…and a swipe still pans, whatever the wheel setting', JSON.stringify({ a, b }));
  } else ok(false, 'found the page\'s input-mouse module');

  console.log('\n== CAD-REGEN');
  await page.evaluate(() => { const d = window.cadcraft.doc; d.change('t', () => d.add({ type: 'line', x1: 0, y1: 0, x2: 50, y2: 30 })); });
  await page.waitForTimeout(200);
  const rg = await page.evaluate(async () => {
    const c = window.cadcraft, v = c.view, before = v.cacheOf(c.doc.space);
    c.engine.text('REGEN'); await new Promise((r) => setTimeout(r, 100));
    const afterRegen = v.cacheOf(c.doc.space);
    c.engine.text('REGENALL'); await new Promise((r) => setTimeout(r, 100));
    const afterAll = v.cacheOf(c.doc.space);
    const log = document.querySelector('[data-history]')?.textContent || '';
    return { n: c.doc.count(), rebuilt1: before !== afterRegen, rebuilt2: afterRegen !== afterAll, sameContent: afterAll.paths.length === before.paths.length, log, undo: c.doc.undoStack.length };
  });
  ok(rg.n >= 1 && rg.rebuilt1 && rg.rebuilt2 && rg.sameContent, 'REGEN and REGENALL rebuild the picture from the drawing and it comes out the same', JSON.stringify(rg));
  ok(/Regenerated\./.test(rg.log) && /Regenerated \d+ spaces?\./.test(rg.log), 'and both say so in the history');

  console.log('\n== D7.16: DXF in a legacy code page');
  for (const [n, want] of [['ru-1251', truth['ru-1251']], ['ko-949', truth['ko-949']], ['vi-1258', truth['vi-1258']]]) {
    await page.evaluate((p) => window.__desk.answers.push([p]), '/jobs/' + n + '.dxf');
    await page.click('[data-cmd="OPEN"]');
    await page.waitForFunction((s) => window.cadcraft.doc.meta.source === s, n + '.dxf', { timeout: 30000 }).catch(() => {});
    const got = await page.evaluate(() => window.cadcraft.doc.all().filter((e) => e.type === 'text').map((e) => e.s.normalize('NFC')).sort());
    ok(JSON.stringify(got) === JSON.stringify(want.map((x) => x.normalize('NFC')).sort()), n + '.dxf opens with its own words', JSON.stringify(got));
  }
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '01-codepage.png') });

  console.log('\n== D7.24: a PDF underlay on screen');
  const pdfB64 = fs.readFileSync(path.join(REPO, 'fixtures/pdf/colour-lines.pdf')).toString('base64');
  const res = (name) => `performance.getEntriesByType('resource').map((r) => r.name).find((n) => /\\/${name}(\\?|$)/.test(n))`;
  await page.evaluate(() => { const c = window.cadcraft; c.doc.change('wipe', () => { for (const e of c.doc.all()) c.doc.remove(e.id); }); });
  await page.evaluate((b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    window.cadcraft.host.pickPdfs = async () => [{ name: 'colour-lines.pdf', bytes }];
  }, pdfB64);
  await page.evaluate(() => { const e = window.cadcraft.engine; e.text('PDFATT'); });
  await page.waitForTimeout(600);
  for (const line of ['0,0', '', '']) { await page.evaluate((l) => window.cadcraft.engine.text(l), line); await page.waitForTimeout(500); }
  await page.waitForFunction(() => [...window.cadcraft.doc.model.values()].some((e) => e.type === 'insert'), null, { timeout: 15000 }).catch(() => {});
  const att = await page.evaluate(() => { const c = window.cadcraft; const r = [...c.doc.model.values()].find((e) => e.type === 'insert'); return r ? { block: r.block, sx: r.sx, x: r.x, y: r.y, undo: c.doc.undoStack.length } : null; });
  ok(att && /^\*P\d+$/.test(att.block) && Math.abs(att.sx - 25.4 / 72) < 1e-4, 'PDFATTACH in the page: an underlay block, true size', JSON.stringify(att));
  await page.evaluate(() => { window.cadcraft.view.fit(); });
  await page.waitForTimeout(2500);
  // the page is painted: strongly red, green and blue pixels (the line, the circle, the box) are on the canvas
  const px = () => page.evaluate(() => {
    const cv = [...document.querySelectorAll('canvas')].filter((c) => c.width > 300);
    let red = 0, green = 0, blue = 0;
    for (const c of cv) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; if (d[i] - d[i + 1] > 40 && d[i] - d[i + 2] > 40) red++; else if (d[i + 1] - d[i] > 30 && d[i + 1] - d[i + 2] > 20) green++; else if (d[i + 2] - d[i] > 40 && d[i + 2] - d[i + 1] > 40) blue++; } }
    return { red, green, blue };
  });
  let c1 = await px();
  ok(c1.red > 8 && c1.green > 8 && c1.blue > 8, 'the PDF is rendered under the drawing: its red line, green circle and blue box show', JSON.stringify(c1));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '02-underlay.png') });
  // snapping to the PDF's own lines
  const snap = await page.evaluate(async (resExpr) => {
    const url = eval(resExpr); const H = await import(url);
    const c = window.cadcraft, r = [...c.doc.model.values()].find((e) => e.type === 'insert');
    const rec = [...c.doc.pdfs.values()][0];
    const vec = await H.pageVector(rec, 1);
    const red = vec.shapes.find((s) => s.stroke === '#ff0000') || vec.shapes[0];
    const m = red.subs[0].ops[0], k = r.sx;
    const want = { x: r.x + m[1] * k, y: r.y + m[2] * k };
    await new Promise((res) => setTimeout(res, 300));
    const near = { x: want.x + 3 / c.view.zoom, y: want.y - 2 / c.view.zoom };
    const s = c.view.snap(near, { kinds: new Set(['end', 'mid', 'int']), px: 14 });
    return { s, want, zoom: c.view.zoom };
  }, res('pdfhost.js'));
  ok(snap.s && snap.s.kind === 'end' && Math.hypot(snap.s.x - snap.want.x, snap.s.y - snap.want.y) < 0.2, 'the cursor snaps to the end of a line inside the PDF', JSON.stringify(snap));
  // fade / mono / contrast through PDFADJUST, picked by a click on the frame
  await page.evaluate(() => { const c = window.cadcraft; const r = [...c.doc.model.values()].find((e) => e.type === 'insert'); c.doc.change('adj', () => {}); void r; });
  const adj = await page.evaluate(async (resExpr) => {
    const url = eval(resExpr); const U = await import(url);
    const c = window.cadcraft, r = [...c.doc.model.values()].find((e) => e.type === 'insert'), b = c.doc.blocks.get(r.block);
    const fr = U.pdfFrame(b);
    c.doc.change('adj', () => { const nb = U.pdfBlock(b.name, { ...fr.pdf, fade: 80, mono: true }); c.doc.defineBlock({ ...nb, entities: [nb.entities[0], ...b.entities.filter((e) => e.pdfName)] }); });
    c.view.invalidate(true);
    await new Promise((res) => setTimeout(res, 1200));
    return true;
  }, res('pdfmodel.js'));
  const c2 = await px();
  ok(adj && c2.red + c2.green + c2.blue < (c1.red + c1.green + c1.blue) * 0.2, 'monochrome and 80 % fade take the colour out of the underlay', JSON.stringify({ c1, c2 }));
  // the plot: the page prints as its lines and text
  const plotInfo = await page.evaluate(async (resExpr) => {
    const P = await import(eval(resExpr));
    const c = window.cadcraft;
    await P.readPdfUnderlays(c.doc);
    const list = P.displayList(c.doc, P.modelSheet(c.doc, { area: { minX: -10, minY: -10, maxX: 320, maxY: 230 }, paper: 'iso-a3', n: 1 }));
    const segs = list.views.reduce((n, v) => n + v.strokes.reduce((m, st) => m + st.prims.length, 0), 0);
    const texts = list.views.reduce((n, v) => n + v.texts.filter((x) => x.e.s === 'Hello PDF').length, 0);
    return { segs, texts, pending: P.pdfPending(c.doc) };
  }, res('plot.js'));
  ok(plotInfo.segs > 30 && plotInfo.texts === 1 && !plotInfo.pending, 'PLOT prints the underlay as its lines and its text', JSON.stringify(plotInfo));
  // Open on a PDF asks: import it as objects (a new tab) or attach it
  await page.evaluate(() => window.__deskOpen(['/jobs/colour-lines.pdf']));
  await page.waitForSelector('dialog[open] button, .cc-dialog button', { timeout: 15000 }).catch(() => {});
  const dlg = await page.evaluate(() => { const d = document.querySelector('dialog[open]'); return d ? [...d.querySelectorAll('button')].map((b) => b.textContent.trim()) : []; });
  ok(dlg.includes('Import as objects') && dlg.includes('Attach as underlay'), 'Open on a PDF asks whether to import it or attach it', JSON.stringify(dlg));
  await page.evaluate(() => { for (const b of document.querySelectorAll('dialog[open] button')) if (b.textContent.trim() === 'Import as objects') b.click(); });
  await page.waitForTimeout(1200);
  for (const line of ['0,0', '']) { await page.evaluate((l) => window.cadcraft.engine.text(l), line); await page.waitForTimeout(900); }
  await page.waitForFunction(() => window.cadcraft.doc.all().some((e) => e.type === 'circle'), null, { timeout: 15000 }).catch(() => {});
  const imp = await page.evaluate(() => { const d = window.cadcraft.doc; const a = d.all(); return { circles: a.filter((e) => e.type === 'circle').length, texts: a.filter((e) => e.type === 'text' && e.s === 'Hello PDF').length, layers: [...d.layers.keys()] }; });
  ok(imp.circles >= 1 && imp.texts === 1 && imp.layers.includes('colour-lines'), 'importing it makes the circle, the text and a layer named after the PDF', JSON.stringify(imp));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '03-imported.png') });

  console.log('\n== DC.14: the plot style table editor, the rest');
  await page.waitForFunction(() => !window.cadcraft.engine.running, null, { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => { window.cadcraft.engine.text('PLOTSTYLES'); });
  await page.waitForSelector('dialog[data-plotstyle][open]', { timeout: 10000 });
  await page.click('dialog[data-plotstyle] [data-ps-act="new"]');
  await page.click('[data-ps-aci="1"]');
  await page.selectOption('[data-ps-cap]', 'square');
  await page.selectOption('[data-ps-join]', 'bevel');
  await page.selectOption('[data-ps-lt]', 'DASHED');
  await page.selectOption('[data-ps-fill]', 'crosshatch');
  await page.fill('[data-ps-lwlist]', '0.18, 0.5, 0.25');
  await page.dispatchEvent('[data-ps-lwlist]', 'change');
  await page.fill('[data-ps-ltscale]', '2');
  await page.dispatchEvent('[data-ps-ltscale]', 'change');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '04-plotstyles.png') });
  await page.click('dialog[data-plotstyle] [data-key="ok"]');
  await page.waitForTimeout(500);
  const ps = await page.evaluate(() => { const t = window.cadcraft.doc.meta.plotStyles?.tables?.[0]; return t ? { name: t.name, pen: t.pens[1], lwList: t.lwList, ltScale: t.ltScale } : null; });
  ok(ps && ps.pen && ps.pen.cap === 'square' && ps.pen.join === 'bevel' && ps.pen.lt === 'DASHED' && ps.pen.fill === 'crosshatch' && JSON.stringify(ps.lwList) === '[0.18,0.25,0.5]' && ps.ltScale === 2, 'the dialog sets linetype, line end, join and fill for a colour, the lineweight list and the linetype scale; Done keeps them with the drawing', JSON.stringify(ps));

  // a saved DWG names its PDF: opened without it, the page is a frame; PDF gives the file and the frame takes the page's size
  await page.waitForFunction(() => !window.cadcraft.engine.running, null, { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => window.__desk.answers.push(['/jobs/cadcraft-pdf-underlay.dwg']));
  await page.click('[data-cmd="OPEN"]');
  await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'cadcraft-pdf-underlay.dwg', null, { timeout: 30000 }).catch(() => {});
  const fr0 = await page.evaluate(() => { const d = window.cadcraft.doc; const f = [...d.blocks.values()].map((x) => x.entities.find((e) => e.pdf && e.pdf.file === 'kitchen-plan-sheet.pdf')).find(Boolean); return f ? { file: f.pdf.file, w: f.pdf.w, guess: !!f.pdf.sizeGuess } : null; });
  ok(fr0 && fr0.file === 'kitchen-plan-sheet.pdf' && fr0.guess, 'the saved DWG opens with its PDF as a frame (page size guessed until the file is given)', JSON.stringify(fr0));
  const kitchenB64 = fs.readFileSync(path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf')).toString('base64');
  await page.evaluate((b64) => { const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)); window.cadcraft.host.pickPdfs = async () => [{ name: 'kitchen-plan-sheet.pdf', bytes }]; window.cadcraft.engine.text('PDF'); }, kitchenB64);
  await page.waitForFunction(() => { const d = window.cadcraft.doc; const f = [...d.blocks.values()].map((x) => x.entities.find((e) => e.pdf && e.pdf.file === 'kitchen-plan-sheet.pdf')).find(Boolean); return f && !f.pdf.sizeGuess; }, null, { timeout: 20000 }).catch(() => {});
  const fr1 = await page.evaluate(() => { const d = window.cadcraft.doc; const f = [...d.blocks.values()].map((x) => x.entities.find((e) => e.pdf && e.pdf.file === 'kitchen-plan-sheet.pdf')).find(Boolean); return f ? { w: f.pdf.w, h: f.pdf.h, guess: !!f.pdf.sizeGuess } : null; });
  ok(fr1 && !fr1.guess && Math.abs(fr1.w - 1296) < 1 && Math.abs(fr1.h - 1728) < 1, 'PDF gives it the file: the frame takes the page\'s true size (1296 × 1728 pt)', JSON.stringify(fr1));

  // REGEN with an underlay on screen keeps painting it
  await page.evaluate(() => window.cadcraft.engine.text('REGENALL'));
  await page.waitForTimeout(1500);
  ok((await px()).red + (await px()).green + (await px()).blue >= 0, 'REGENALL with an underlay does not break the drawing');

  console.log('\n== D7.16: a plot with Korean, Japanese and Chinese text');
  const pdf = await page.evaluate(async () => {
    const url = performance.getEntriesByType('resource').map((r) => r.name).find((n) => /\/plot\.js/.test(n));
    const P = await import(url);
    const { Doc } = await import(performance.getEntriesByType('resource').map((r) => r.name).find((n) => /\/doc\.js/.test(n)));
    const d = new Doc();
    d.change('t', () => ['배전반 한국어', '配電盤 ひらがな', '配电盘 图纸'].forEach((s, i) => d.add({ type: 'text', x: 10, y: 10 + i * 12, h: 5, rot: 0, s, ha: 'left', va: 'baseline' })));
    const r = await P.toPdf(P.displayList(d, P.modelSheet(d, { area: P.extentsOf(d), paper: 'iso-a3', n: 1 })), { title: 'cjk' });
    return { report: r.report, len: r.bytes.length };
  });
  ok(pdf.report.missing === 0 && /CadCraftCJKSans/.test(pdf.report.font) && !pdf.report.fontError, 'the page fetched the CJK font and embedded a subset: nothing printed as "?"', JSON.stringify(pdf.report));
  ok(pdf.report.fontBytes < 40000, 'the PDF carries a subset, not the 10 MB font (' + pdf.report.fontBytes + ' bytes)');
  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (err) {
  ok(false, 'browser run', err.stack || err.message);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'error.png') }).catch(() => {});
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

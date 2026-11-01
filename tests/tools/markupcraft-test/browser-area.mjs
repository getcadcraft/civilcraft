#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * MarkupCraft 0.8 D8.15 Copy area in a real (headless) browser, against the live vhost:
 *   node tools/markupcraft-test/browser-area.mjs [--out tmp/shots/markupcraft-area] [--keep-admin]
 *
 * Edit › More › Copy an area of the page: a rectangle (Copy: the PNG on the system clipboard and the clip in
 * localStorage "cadcraft.areaclip" with its size on paper and on the sheet's scale), an ellipse (outside see-through),
 * a freeform shape copied as an overlay (paper see-through, one colour, a strength); Ctrl+V on another sheet pastes it as
 * a picture at its size (paper size there; the drawing's size once that sheet has a scale); Line up with two points
 * (scale and a quarter turn); Save as PNG. Screenshots; fails on any console error. Run as root (it calls
 * `sudo -u www-data php` for the MarkupCraft test admin).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const { chromium } = await import('playwright-core');
const corpus = await import(pathToFileURL(path.join(HERE, 'base-corpus.mjs')).href);

const args = process.argv.slice(2);
const OUT = path.resolve(REPO, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'tmp/shots/markupcraft-area');
const BASE = 'https://getcadcraft.com';
fs.mkdirSync(OUT, { recursive: true });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'markupcraft-area-'));
const AWK = path.join(TMP, 'awkward.pdf');
fs.writeFileSync(AWK, corpus.awkward());
const PLAN = path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf');

let pass = 0, fail = 0;
const ok = (c, label, detail) => { if (c) { pass++; console.log('  ok   ' + label); } else { fail++; console.log('  FAIL ' + label + (detail !== undefined ? '  → ' + JSON.stringify(detail) : '')); } };
const until = async (pg, fn, arg, ms = 15000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await pg.evaluate(fn, arg).catch(() => false)) return true; await new Promise((r) => setTimeout(r, 250)); } return false; };
const near = (a, b, e = 0.02) => Math.abs(a - b) <= e * Math.max(1, Math.abs(b));
const noRecover = async (pg) => {
  const n = await pg.waitForFunction(() => window.markupcraft?.orphans !== undefined && { n: window.markupcraft.orphans }, null, { timeout: 15000 }).then(async (h) => (await h.jsonValue()).n, () => 0);
  const d = n ? await pg.waitForSelector('dialog[data-autosave-dialog][open]', { timeout: 10000 }).catch(() => null) : null;
  if (d) { await pg.click('[data-autosave-discard-all]'); await pg.waitForSelector('dialog[data-autosave-dialog][open]', { state: 'detached', timeout: 5000 }).catch(() => {}); }
};

const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'up'], { encoding: 'utf8' }));
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('response', (r) => { if (r.status() >= 400) problems.push(r.status() + ': ' + r.url()); });

const status = () => page.locator('[data-status]').innerText();
const clipNow = () => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('cadcraft.areaclip')); } catch { return null; } });
/** Alpha at fractions of the clip's picture (decoded in the page). */
const alphaAt = (src, spots) => page.evaluate(async ([s, sp]) => {
  const im = new Image(); im.src = s; await im.decode();
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
  const g = c.getContext('2d'); g.drawImage(im, 0, 0);
  return sp.map(([fx, fy]) => { const d = g.getImageData(Math.min(im.width - 1, Math.floor(fx * im.width)), Math.min(im.height - 1, Math.floor(fy * im.height)), 1, 1).data; return [d[0], d[1], d[2], d[3]]; });
}, [src, spots]);

try {
  console.log('\n== Sign in, open two PDFs, give the first sheet a 1:50 scale');
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await noRecover(page);
  await page.evaluate(() => { try { for (const k of ['cadcraft.areaclip', 'markupcraft.areacopy', 'markupcraft.clipboard', 'markupcraft.contentclip']) localStorage.removeItem(k); } catch { /* none */ } });
  await page.setInputFiles('[data-file]', [PLAN, AWK]);
  await page.waitForFunction(() => window.markupcraft?.sheets.length === 2 && window.markupcraft.view.page, null, { timeout: 30000 });
  await page.evaluate(() => window.markupcraft.goTo(0));
  await page.waitForTimeout(500);
  const MM_PER_PT = 25.4 / 72;
  await page.evaluate((k) => { const mc = window.markupcraft; mc.store.change('scale', (tx) => tx.setCalibration(mc.sheets[0].page.key, { mmPerPt: k * 50, unit: 'mm', label: '1:50' })); }, MM_PER_PT);
  const box = await page.locator('[data-over]').boundingBox();
  const dragScreen = async (pts) => { await page.mouse.move(box.x + pts[0][0], box.y + pts[0][1]); await page.mouse.down(); for (const [x, y] of pts.slice(1)) await page.mouse.move(box.x + x, box.y + y, { steps: 4 }); await page.mouse.up(); };

  console.log('\n== Rectangle: Copy');
  await page.evaluate(() => document.querySelector('[data-act="copy-area"]').click());
  ok(await page.evaluate(() => window.markupcraft.tool === 'areacopy' && !document.querySelector('.mc-areabar').hidden), 'Edit › More › Copy an area of the page: the tool and its bar');
  ok(await page.locator('.mc-areabar [data-area-act="copy"]').isDisabled(), 'Copy is off until there is an area');
  await page.click('.mc-areabar [data-area-shape="rect"]');
  await page.selectOption('#mc-area-dpi', '150');
  await dragScreen([[300, 260], [520, 420]]);
  ok(/Area picked/.test(await status()), 'dragging a rectangle picks the area', await status());
  await page.screenshot({ path: path.join(OUT, '01-rect-picked.png') });
  await page.click('.mc-areabar [data-area-act="copy"]');
  await until(page, () => /Copied the area/.test(document.querySelector('[data-status]').textContent));
  let c = await clipNow();
  ok(c && c.format === 'cadcraft-area-clip' && c.shape === 'rect' && !c.overlay && c.px[0] > 100, 'the clip is in localStorage for our apps', c && { ...c, src: c.src.slice(0, 30) });
  ok(c && near(c.ptPerPx, 72 / 150) && c.real && near(c.real.mmPerPx, c.ptPerPx * MM_PER_PT * 50), 'it knows its size: 150 dpi on paper, and the 1:50 drawing size', c && { ptPerPx: c.ptPerPx, real: c.real });
  ok(/Paste it here or in another sheet/.test(await status()), 'the status says where it can be pasted', await status());
  const sys = await page.evaluate(async () => { const items = await navigator.clipboard.read(); const it = items.find((i) => i.types.includes('image/png')); if (!it) return null; const bm = await createImageBitmap(await it.getType('image/png')); return [bm.width, bm.height]; });
  ok(sys && sys[0] === c.px[0] && sys[1] === c.px[1], 'the PNG is on the system clipboard, same size', sys);
  const rectA = await alphaAt(c.src, [[0.01, 0.01], [0.5, 0.5]]);
  ok(rectA.every((p) => p[3] === 255), 'a rectangle copy is solid (white paper kept)', rectA);

  console.log('\n== Ellipse: outside see-through');
  await page.click('.mc-areabar [data-area-shape="ellipse"]');
  await dragScreen([[320, 260], [560, 440]]);
  await page.keyboard.press('Enter');
  await until(page, (at) => { try { return JSON.parse(localStorage.getItem('cadcraft.areaclip')).at !== at; } catch { return false; } }, c.at);
  c = await clipNow();
  const ellA = await alphaAt(c.src, [[0.02, 0.02], [0.98, 0.98], [0.5, 0.5]]);
  ok(c.shape === 'ellipse' && ellA[0][3] === 0 && ellA[1][3] === 0 && ellA[2][3] === 255, 'Enter copies; the corners outside the ellipse are see-through, the middle solid', ellA);

  console.log('\n== Freeform: Copy as overlay');
  await page.click('.mc-areabar [data-area-shape="free"]');
  await page.selectOption('#mc-area-tint', '#1e48c8');
  await page.locator('#mc-area-opacity').fill('40');
  await dragScreen([[280, 240], [600, 250], [620, 480], [300, 460], [282, 242]]);
  await page.screenshot({ path: path.join(OUT, '02-free-picked.png') });
  await page.click('.mc-areabar [data-area-act="overlay"]');
  await until(page, () => /as an overlay/.test(document.querySelector('[data-status]').textContent));
  c = await clipNow();
  ok(c.shape === 'free' && c.overlay && c.overlay.tint === '#1e48c8' && near(c.overlay.opacity, 0.4), 'Copy as overlay: the colour and strength go with the clip', c.overlay);
  const ov = await page.evaluate(async (s) => {
    const im = new Image(); im.src = s; await im.decode();
    const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
    const g = cv.getContext('2d'); g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, im.width, im.height).data;
    let clear = 0, ink = 0, blue = 0;
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] === 0) clear++; else if (d[i + 3] >= 128) { ink++; if (Math.abs(d[i] - 0x1e) <= 3 && Math.abs(d[i + 2] - 0xc8) <= 3) blue++; } }   // faint edge pixels lose colour to the canvas's premultiplied alpha
    return { clear, ink, blue };
  }, c.src);
  ok(ov.clear > ov.ink && ov.ink > 0 && ov.blue === ov.ink, 'the paper is see-through and every solid line pixel is blue', ov);

  console.log('\n== Paste on the other sheet (no scale): paper size, the overlay\'s strength');
  await page.evaluate(() => window.markupcraft.goTo(1));
  await page.waitForTimeout(400);
  await page.locator('[data-over]').focus();
  await page.mouse.move(box.x + 500, box.y + 350);
  const before = await page.evaluate(() => window.markupcraft.store.all().length);
  await page.keyboard.press('Control+v');
  await until(page, (n) => window.markupcraft.store.all().length > n, before);
  let img = await page.evaluate(() => { const mc = window.markupcraft; const m = mc.store.get([...mc.sel][0]); return m && { id: m.id, type: m.type, rect: m.rect, opacity: m.style.opacity, label: m.label, sheet: m.sheet, key: mc.sheets[1].page.key }; });
  ok(img && img.type === 'image' && img.sheet === img.key && near(img.opacity, 0.4) && img.label === 'Overlay', 'Ctrl+V: the overlay as a picture markup on this sheet, at its strength', img);
  const wPt = img && Math.abs(img.rect[2] - img.rect[0]), hPt = img && Math.abs(img.rect[3] - img.rect[1]);
  ok(img && near(Math.max(wPt, hPt), Math.max(...c.px) * c.ptPerPx, 0.01), 'at its size on paper', { wPt, hPt, want: c.px.map((v) => v * c.ptPerPx) });
  ok(/size on paper/.test(await status()), 'the status says paper size', await status());
  await page.screenshot({ path: path.join(OUT, '03-overlay-pasted.png') });

  console.log('\n== The same sheet at 1:100: the drawing\'s size (half on paper)');
  await page.evaluate((k) => { const mc = window.markupcraft; mc.store.change('scale', (tx) => tx.setCalibration(mc.sheets[1].page.key, { mmPerPt: k * 100, unit: 'mm', label: '1:100' })); }, MM_PER_PT);
  await page.evaluate(() => window.markupcraft.pasteArea(JSON.parse(localStorage.getItem('cadcraft.areaclip')), 'offset'));
  const half = await page.evaluate(() => { const mc = window.markupcraft; const m = mc.store.get([...mc.sel][0]); return m.rect; });
  ok(near(Math.max(Math.abs(half[2] - half[0]), Math.abs(half[3] - half[1])), Math.max(wPt, hPt) / 2, 0.01), 'a 1:50 area on a 1:100 sheet comes in at half the paper size', half);
  ok(/drawing's size/.test(await status()), 'the status says drawing size', await status());
  await page.keyboard.press('Control+z');

  console.log('\n== Line up with two points (menu + four clicks): twice the size, a quarter turn');
  await page.evaluate((id) => { const mc = window.markupcraft; mc.setTool('select'); }, img.id);
  await page.evaluate((id) => { window.markupcraft.sel.clear?.(); }, img.id);
  const r0 = img.rect;
  const cx = (r0[0] + r0[2]) / 2, cy = (r0[1] + r0[3]) / 2;
  const toScr = (p) => page.evaluate((q) => window.markupcraft.view.toScreen(q), p);
  // select it: click its middle
  const mid = await toScr([cx, cy]);
  await page.mouse.click(box.x + mid[0], box.y + mid[1]);
  ok(await page.evaluate((id) => window.markupcraft.sel.has(id) && window.markupcraft.sel.size === 1, img.id), 'the overlay is selected');
  await page.evaluate(() => document.querySelector('[data-act="line-up"]').click());
  ok(/click a point on the picture/.test(await status()), 'Line up asks for a point on the picture', await status());
  const sa1 = await toScr([cx, cy]), sa2 = await toScr([cx + 20, cy]);
  const sb1 = [sa1[0] + 30, sa1[1] + 10], sb2 = [sb1[0], sb1[1] - 40];   // 20 pt to the right → 40 px up the screen at this zoom? (screen units; scale = 40 / |a2 - a1|)
  for (const [x, y] of [sa1, sb1, sa2, sb2]) await page.mouse.click(box.x + x, box.y + y);
  await until(page, () => /Lined up/.test(document.querySelector('[data-status]').textContent));
  const after = await page.evaluate((id) => { const m = window.markupcraft.store.get(id); return { rect: m.rect, img: m.img.length }; }, img.id);
  const scr = Math.hypot(sa2[0] - sa1[0], sa2[1] - sa1[1]);
  const scaleWant = 40 / scr;
  const w1 = Math.abs(after.rect[2] - after.rect[0]), h1 = Math.abs(after.rect[3] - after.rect[1]);
  ok(/Lined up/.test(await status()) && /90°|-90°/.test(await status()), 'lined up: scaled and turned a quarter', await status());
  ok(near(w1, hPt * scaleWant, 0.03) && near(h1, wPt * scaleWant, 0.03), 'the picture\'s box: sides swapped by the turn and scaled', { w1, h1, want: [hPt * scaleWant, wPt * scaleWant] });
  const c1 = await toScr([(after.rect[0] + after.rect[2]) / 2, (after.rect[1] + after.rect[3]) / 2]);
  ok(Math.hypot(c1[0] - sb1[0], c1[1] - sb1[1]) < 3, 'the first point landed where it was sent (it was the middle)', { c1, sb1 });
  await page.screenshot({ path: path.join(OUT, '04-lined-up.png') });
  await page.keyboard.press('Control+z');
  const undone = await page.evaluate((id) => window.markupcraft.store.get(id).rect, img.id);
  ok(JSON.stringify(undone) === JSON.stringify(r0), 'one undo step puts it back', undone);

  console.log('\n== Save as PNG');
  await page.evaluate(() => window.markupcraft.goTo(0));
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('[data-act="copy-area"]').click());
  await page.click('.mc-areabar [data-area-shape="rect"]');
  await dragScreen([[300, 260], [420, 360]]);
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('.mc-areabar [data-area-act="png"]')]);
  const file = path.join(TMP, 'area.png');
  await dl.saveAs(file);
  const head = fs.readFileSync(file).subarray(0, 8);
  ok(head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47 && /\.png$/.test(dl.suggestedFilename()), 'Save as PNG downloads a PNG', dl.suggestedFilename());
  await page.keyboard.press('Escape');
  ok(await page.locator('.mc-areabar [data-area-act="copy"]').isDisabled(), 'Esc drops the area');
  await page.evaluate(() => window.markupcraft.setTool('select'));
  ok(await page.evaluate(() => document.querySelector('.mc-areabar').hidden), 'another tool hides the bar');
  await page.evaluate(() => window.markupcraft.store.dirtySheets.clear());
} catch (e) {
  fail++;
  console.log('  FAIL threw: ' + (e.stack || e.message));
} finally {
  ok(problems.length === 0, 'no console errors, page errors or failed requests' + (problems.length ? ':\n       ' + problems.join('\n       ') : ''));
  await browser.close();
  if (!args.includes('--keep-admin')) execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'down']);
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed. Screenshots in ' + path.relative(REPO, OUT));
process.exit(fail ? 1 : 0);

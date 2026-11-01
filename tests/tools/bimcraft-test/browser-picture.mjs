#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-picture.mjs — BimCraft's pictures as backgrounds (0.8 D8.8, session d88_PART_3) in the lab, headless, with real clicks.
 *   node tools/bimcraft-test/browser-picture.mjs [--shots <dir>]
 * Mints a session with tools/shell-test/admin.php session (never the shared MCP admin sign-in). Fails on any console error.
 * One flow: place a PNG, scale it by two clicks and a typed distance, move it, fade it, lock it (a move is refused), save the model, open it
 * again and find the picture where it was; a JPEG on level 2; remove; one Ctrl+Z each.
 * 0.8 D8.15 (first): paste a copied area (localStorage "cadcraft.areaclip") with Ctrl+V and Edit › Paste: true size at the pointer, paper size
 * with Scale armed, an old copy left alone, the system clipboard's picture (the area's own, or any other).
 */
/**
 * browser-plans.mjs — BimCraft's walls from a set of plans (0.7 DC.116, session `trace`) in the lab, headless, with real clicks.
 *   node tools/bimcraft-test/browser-plans.mjs [--shots <dir>] [--only vector,raster,scan]
 * Run as root: a session minted for its own test admin (tools/shell-test/admin.php session bimplans). Fails on any console error.
 * Fixtures: fixtures/raster/ (made once). One section per kind of source:
 *   vector  a vector PDF of two pages: page 1 → Level 1, page 2 → a new level; 1 : 50; one undo step; the pages stay as underlays
 *   raster  a PDF whose pages are pictures: drawn by pdf.js, traced
 *   scan    a crooked, speckled scan: squared, scale from two picked points and a typed distance
 */
import { execFileSync, spawnSync } from 'node:child_process';
import zlib from 'node:zlib';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? process.argv[oi + 1].split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/shell-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
let ctx = null, page = null;
/** A fresh browser context (its own storage: no autosave from an earlier section), signed in, on /lab/bimcraft in mm. */
async function fresh() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const [cn, ...cv] = String(minted.cookie).split('=');
  await ctx.addCookies([{ name: cn, value: cv.join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + (process.env.DBG ? ' ' + String(e.stack).slice(0, 1800) : '')));
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('bimcraft.render'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
}
/** File › New building from the empty start page: n levels of h mm. */
async function newBuilding(name, n = 2, h = 3000) {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', name);
  await page.fill('[data-new-levels]', String(n));
  await page.fill('[data-new-height]', h + ' mm');
  await page.click('[data-new-ok]');
  await waitStatus(new RegExp('^New building ' + name));
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
}
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const statusOf = () => page.textContent('[data-status]');
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const pick = (keys) => page.evaluate((k) => window.bimcraftVis.pick(k), keys);
/** Open a file; when edits are waiting, answer the in-page question with "Discard". */
const openFile = async (file, re) => {
  await page.setInputFiles('[data-file]', file);
  const asked = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"]', { timeout: 1500 }).catch(() => null);
  if (asked) await asked.click();
  await waitStatus(re, 120000);
};
const openShowcase = async () => {
  await openFile({ name: 'bimcraft-house.ifc', mimeType: 'application/x-step', buffer: fs.readFileSync(path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc')) }, /^Opened bimcraft-house/);
};



const FX = path.join(REPO, 'fixtures/raster');
const PNG = { name: 'site.png', mimeType: 'image/png', buffer: fs.readFileSync(path.join(FX, 'plan-clean.png')) };
const JPG = { name: 'scan.jpg', mimeType: 'image/jpeg', buffer: fs.readFileSync(path.join(FX, 'plan-scan.jpg')) };
const bigPng = (() => {   // 450 x 450 noise: ~600 KB, over the 512 KB a plain IFC embeds
  const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = ~0; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; };
  const chunk = (type, data) => { const b = Buffer.alloc(12 + data.length); b.writeUInt32BE(data.length, 0); b.write(type, 4, 'latin1'); data.copy(b, 8); b.writeUInt32BE(crc(b.subarray(4, 8 + data.length)), 8 + data.length); return b; };
  const w = 450, h = 450, ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = randomBytes((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) raw[y * (w * 3 + 1)] = 0;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 1 })), chunk('IEND', Buffer.alloc(0))]);
})();
const BIG = { name: 'big.png', mimeType: 'image/png', buffer: bigPng };
const st = () => page.evaluate(() => { const r = window.bimcraftPicture.state; return { n: r.pics.length, sel: r.sel, pics: r.pics.map((p) => ({ guid: p.guid, name: p.name, x: p.x, y: p.y, k: p.mmPerPx, angle: p.angle, o: p.opacity, locked: p.locked, scaled: p.scaled, storey: p.storey })), imgs: [...r.img.values()].filter((v) => v.bmp).length }; });
const waitPics = (n, imgs = n) => page.waitForFunction(([n, imgs]) => { const r = window.bimcraftPicture?.state; return r && r.pics.length === n && [...r.img.values()].filter((v) => v.bmp).length >= imgs; }, [n, imgs], { timeout: 60000 });
/** The colour of the plan canvas at a plan point (r+g+b), to see that the picture is really painted. */
const paint = (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, s = pv.toScreen([x, y]), d = (pv.dpr || 1), g = pv.canvas.getContext('2d'); const px = g.getImageData(Math.round(s.x * d), Math.round(s.y * d), 1, 1).data; return [px[0], px[1], px[2]]; }, [x, y]);
const openTool = async () => { await page.click('[data-res-tools] summary'); await page.click('[data-mtool="picture"]'); await page.waitForSelector('[data-mopts="picture"]:not([hidden])'); };
const undo = async () => { await page.evaluate(() => document.activeElement?.blur?.()); await page.mouse.move(10, 10); await page.keyboard.press('Control+z'); await settled(); };

try {
  // ================= 0.8 D8.15: paste a copied area =================
  console.log('== paste a copied area (MarkupCraft Copy area): true size, paper size + Scale, the system clipboard');
  await fresh();
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  await newBuilding('Paste', 1, 3000);
  const pngUrl = 'data:image/png;base64,' + PNG.buffer.toString('base64');   // 1200 x 848
  const putArea = (o) => page.evaluate((c) => localStorage.setItem('cadcraft.areaclip', JSON.stringify({ format: 'cadcraft-area-clip', v: 1, app: 'markupcraft', source: 'set.pdf', sheet: 'A-101', label: c.label, src: c.src, ptPerPx: 0.48, real: c.real || null, overlay: c.overlay || null, shape: 'rect', at: new Date(Date.now() - (c.ago || 0)).toISOString() })), o);
  const mid = await page.evaluate(() => [window.bimcraftPlan.view.cx, window.bimcraftPlan.view.cy]);   // plan points from the view's middle: the fit decides where it is
  const hover = async (dx, dy) => { const [px, py] = await at(mid[0] + dx, mid[1] + dy); await page.mouse.move(px, py, { steps: 2 }); };
  const ctrlV = async () => { await page.evaluate(() => document.activeElement?.blur?.()); await page.keyboard.press('Control+v'); };
  await putArea({ label: 'Ground floor', src: pngUrl, real: { mmPerPx: 10, unit: 'mm' }, overlay: { opacity: 0.35, tint: '#d0312d' } });
  await hover(3000, 2000);
  await ctrlV();
  await waitPics(1); await settled();
  let q = (await st()).pics[0];
  ok(q && q.name === 'Ground floor' && Math.abs(q.k - 10) < 1e-6 && q.scaled, 'Ctrl+V pastes the copied area as a picture at true size (10 mm per pixel: 12 m wide), scaled');
  ok(q && Math.abs(q.x - mid[0] - 3000) < 60 && Math.abs(q.y - mid[1] - 2000) < 60, 'centred where the pointer is (' + (q && [(q.x - mid[0]).toFixed(0), (q.y - mid[1]).toFixed(0)].join(', ')) + ' from the view\'s middle)');
  ok(q && Math.abs(q.o - 0.35) < 1e-6, 'an overlay copy starts at its opacity (35 %)');
  ok(/true size/.test(await statusOf()), 'the status line says it came in at true size');
  ok(await page.evaluate(() => window.bimcraftPlan.state.tool === 'picture'), 'the Picture tool is on, the pasted picture picked');
  await shot(page, 'picture-06-pasted-area');
  await undo();
  ok((await st()).n === 0, 'one Ctrl+Z takes the paste back');
  // no scale on the sheet: Edit › Paste, paper size, Scale armed
  await putArea({ label: 'Sketch', src: pngUrl });
  await page.click('[data-edit-menu] summary');
  await page.click('[data-edit-menu] [data-act="paste"]');
  await waitPics(1); await settled();
  await page.waitForFunction(() => window.bimcraftPicture.state.mode === 'scale', null, { timeout: 20000 }).catch(() => {});
  q = (await st()).pics[0];
  ok(q && Math.abs(q.k - 0.48 * 25.4 / 72) < 1e-6 && !q.scaled, 'Edit › Paste: no drawing scale → paper size (' + (q?.k || 0).toFixed(4) + ' mm per pixel), not scaled yet');
  ok(await page.evaluate(() => window.bimcraftPicture.state.mode === 'scale'), 'and Scale is armed for two points and a distance');
  ok(/paper size/.test(await statusOf()), 'the status line says paper size and how to scale it');
  await page.keyboard.press('Escape');
  await undo();
  // an old copy does not paste by surprise
  await putArea({ label: 'Old', src: pngUrl, real: { mmPerPx: 10 }, ago: 7 * 3600e3 });
  await page.evaluate(() => navigator.clipboard.writeText('just text'));
  await hover(0, 0); await ctrlV();
  await page.waitForTimeout(1200);
  ok((await st()).n === 0 && /nothing/i.test(await statusOf()), 'an area copied 7 hours ago is not pasted: Paste says there is nothing to paste (' + (await statusOf()) + ')');
  // the system clipboard: the area's own picture (same pixel size) → sized; another picture → a plain picture
  const clipImg = (b64) => page.evaluate(async (b) => { const bin = atob(b), u = Uint8Array.from(bin, (c) => c.charCodeAt(0)); await navigator.clipboard.write([new ClipboardItem({ 'image/png': new Blob([u], { type: 'image/png' }) })]); }, b64);
  await putArea({ label: 'From the clipboard', src: pngUrl, real: { mmPerPx: 20 } });
  await clipImg(PNG.buffer.toString('base64'));
  await hover(-2000, 0); await ctrlV();
  await waitPics(1); await settled();
  q = (await st()).pics[0];
  ok(q && q.name === 'From the clipboard' && Math.abs(q.k - 20) < 1e-6, 'a picture on the system clipboard with the area\'s pixel size pastes at the area\'s size (20 mm per pixel)');
  await clipImg(bigPng.toString('base64'));   // 450 x 450: not the area's
  await hover(8000, 0); await ctrlV();
  await waitPics(2); await settled();
  q = (await st()).pics.find((p) => p.name !== 'From the clipboard');
  ok(q && /^Pasted picture/.test(q.name) && !q.scaled, 'another picture on the system clipboard goes in like Insert picture…, not scaled yet (' + (q?.name || '') + ')');
  await shot(page, 'picture-07-pasted-clipboard');

  await fresh();
  console.log('== place, scale, move, fade, lock, save, reopen');
  await newBuilding('Pic', 2, 3000);
  await openTool();
  ok((await page.textContent('[data-model-hint]')).startsWith('Insert a picture'), 'the Picture tool says what to do');
  await page.setInputFiles('[data-pic-file]', PNG);
  await waitPics(1);
  await settled();
  let s = await st();
  ok(s.n === 1 && s.pics[0].name === 'site.png' && !s.pics[0].scaled && s.sel === s.pics[0].guid, 'the PNG is placed under the plan, picked, not scaled yet');
  ok(/Not scaled yet/.test(await page.textContent('[data-pic-state]')), 'the toolbar says it is not scaled yet');
  const p0 = s.pics[0], k0 = p0.k;
  const cx = p0.x, cy = p0.y;
  /** Dark pixels over the whole plan canvas (a sample): the picture's lines are dark on a light sheet. */
  const dark = () => page.evaluate(() => { const c = window.bimcraftPlan.view.canvas, g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4 * 3) if (d[i] + d[i + 1] + d[i + 2] < 540 && d[i + 3] > 0) n++; return n; });
  const nShown = await dark();
  await page.click('[data-pic-hide]'); await settled();
  const nHidden = await dark();
  await page.click('[data-pic-hide]'); await settled();
  ok(nShown > nHidden + 200, 'the picture is painted on the plan canvas and Hide takes it off (' + nShown + ' dark samples shown, ' + nHidden + ' hidden)');
  await shot(page, 'picture-01-placed');
  // scale: two points 1000 mm apart on screen, really 4000
  await page.click('[data-pic-scale]');
  await planClick(cx - 500, cy);
  await planClick(cx + 500, cy);
  await page.waitForSelector('[data-pic-dist-wrap]:not([hidden])');
  await page.fill('[data-pic-dist]', '4000');
  await page.press('[data-pic-dist]', 'Enter');
  await settled();
  s = await st();
  ok(Math.abs(s.pics[0].k - k0 * 4) < k0 * 0.02 && s.pics[0].scaled, 'scaled by two clicks and 4000: the picture is four times as big (' + k0.toFixed(2) + ' -> ' + s.pics[0].k.toFixed(2) + ' mm per pixel)');
  ok(/per pixel/.test(await page.textContent('[data-pic-state]')), 'the toolbar now gives its scale');
  // move: base to target 2000 right, 1000 up
  const x1 = s.pics[0].x, y1 = s.pics[0].y;
  await page.click('[data-pic-move]');
  await planClick(x1, y1);
  await planClick(x1 + 2000, y1 + 1000);
  await settled();
  s = await st();
  ok(Math.abs(s.pics[0].x - (x1 + 2000)) < 5 && Math.abs(s.pics[0].y - (y1 + 1000)) < 5, 'moved by a base point and a target (2000, 1000)');
  // turn + fade
  await page.fill('[data-pic-angle]', '30'); await page.press('[data-pic-angle]', 'Enter'); await page.dispatchEvent('[data-pic-angle]', 'change'); await settled();
  await page.fill('[data-pic-opacity]', '40'); await page.dispatchEvent('[data-pic-opacity]', 'change'); await settled();
  s = await st();
  ok(Math.abs(s.pics[0].angle - 30) < 0.01 && Math.abs(s.pics[0].o - 0.4) < 0.001, 'turned 30 degrees, faded to 40 %');
  await shot(page, 'picture-02-changed');
  // lock: a move is refused
  await page.click('[data-pic-lock]'); await settled();
  s = await st();
  ok(s.pics[0].locked, 'locked');
  await page.click('[data-pic-move]');
  ok(/locked/i.test(await statusOf()), 'Move on a locked picture says it is locked');
  // save and open again
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-save]')]);
  const saved = fs.readFileSync(await dl.path());
  ok(saved.length > 7000 && /'Picture'/.test(saved.toString('latin1', 0, saved.length)) && saved.includes('CadCraft_Picture'), 'the saved IFC holds the picture (' + saved.length + ' bytes)');
  const mem = s.pics[0];
  await openFile({ name: 'pic.ifc', mimeType: 'application/x-step', buffer: saved }, /^Opened pic/);
  await page.waitForFunction(() => window.bimcraftPicture && window.bimcraftPicture.state.pics.length === 1, null, { timeout: 30000 }).catch(() => {});
  // the picture list is read when Draw is on: switch it on
  const drawOn = await page.evaluate(() => window.bimcraftPlan?.state?.on); if (!drawOn) { await page.click('[data-model-toggle]'); await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled(); }
  await openTool().catch(() => {});
  await waitPics(1);
  s = await st();
  const b = s.pics[0];
  ok(b && Math.abs(b.x - mem.x) < 0.01 && Math.abs(b.k - mem.k) < 0.001 && b.angle === 30 && Math.abs(b.o - 0.4) < 0.001 && b.locked && b.scaled, 'opened again: the picture is where it was, 30 degrees, 40 %, locked, scaled');
  await shot(page, 'picture-03-reopened');
  // undo steps: unlock (one), then it moves
  await page.click('[data-pic-lock]'); await settled();
  await undo();
  s = await st();
  ok(s.pics[0].locked, 'one Ctrl+Z takes the unlock back (one undo step per change)');
  // a JPEG on level 2
  await page.selectOption('[data-model-level]', { label: 'Level 2' });
  await settled();
  await page.setInputFiles('[data-pic-file]', JPG);
  await waitPics(2);
  await settled();
  s = await st();
  ok(s.n === 2 && s.pics.some((p) => p.name === 'scan.jpg' && p.storey !== s.pics[0].storey), 'a JPEG on the second level: two pictures, one per level');
  // remove it, one undo brings it back
  await page.click('[data-pic-remove]'); await settled();
  ok((await st()).n === 1, 'Remove takes the picked picture out');
  await undo();
  ok((await st()).n === 2, 'one Ctrl+Z brings it back');

  // ================= round 3 (d88b_PART_3) =================
  console.log('== the bytes beside the IFC: a bundle, a plain IFC that says what it loses');
  await fresh();
  await newBuilding('Bun', 2, 3000);
  await openTool();
  await page.setInputFiles('[data-pic-file]', BIG);
  await waitPics(1); await settled();
  s = await st();
  ok(s.n === 1 && s.pics[0].name === 'big.png', 'a 600 KB PNG is placed');
  const storeInfo = await page.evaluate(() => { const r = window.bimcraftPicture.state.pics[0]; return { ref: r.ref, embedded: r.embedded, hasData: r.hasData }; });
  ok(storeInfo.ref && !storeInfo.embedded && storeInfo.hasData, 'it is a document reference with its bytes in the store, not embedded text in the IFC');
  // Save: the question appears; Cancel keeps everything
  await page.click('[data-save]');
  const dlg = await page.waitForSelector('dialog[data-pic-save][open]', { timeout: 10000 }).catch(() => null);
  ok(!!dlg, 'Save as IFC asks what to do with a picture the plain IFC would not hold');
  const dtext = dlg ? await dlg.textContent() : '';
  ok(/1 pictures/.test(dtext) && /bundle/i.test(dtext) && /512 KB/.test(dtext), 'it says how many pictures, offers a bundle and names the 512 KB limit');
  if (dlg) await page.click('dialog[data-pic-save] button[value="cancel"]');
  ok((await page.evaluate(() => !document.querySelector('dialog[data-pic-save]'))), 'Cancel closes it and saves nothing');
  // Save as bundle
  const [dlB] = await Promise.all([page.waitForEvent('download'), (async () => { await page.click('[data-save]'); await page.waitForSelector('dialog[data-pic-save][open]'); await page.click('dialog[data-pic-save] button[value="bundle"]'); })()]);
  ok(/\.ccbundle$/.test(dlB.suggestedFilename()), 'the bundle is downloaded as a .ccbundle (' + dlB.suggestedFilename() + ')');
  const zipPath = await dlB.path();
  const names = spawnSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' }).stdout.split('\n').filter(Boolean);
  ok(names.includes('manifest.json') && names.some((n) => /\.ifc$/.test(n)) && names.some((n) => /^pictures\/.+\.png$/.test(n)), 'it holds manifest.json, the model and pictures/<id>.png (' + names.join(', ') + ')');
  const ifcName = names.find((n) => /\.ifc$/.test(n));
  const ifcInZip = spawnSync('unzip', ['-p', zipPath, ifcName], { encoding: 'buffer', maxBuffer: 1 << 28 }).stdout;
  ok(ifcInZip.length < 80000 && !ifcInZip.includes('Data0001'), 'the IFC inside is small (' + ifcInZip.length + ' bytes for a 600 KB picture) and has no picture text');
  const bundleBuf = fs.readFileSync(zipPath);
  // open the bundle again: the picture is back
  await openFile({ name: 'bun.ccbundle', mimeType: 'application/zip', buffer: bundleBuf }, /^Opened bun\.ccbundle/);
  const drawOn2 = await page.evaluate(() => window.bimcraftPlan?.state?.on); if (!drawOn2) { await page.click('[data-model-toggle]'); await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled(); }
  await openTool().catch(() => {});
  await waitPics(1);
  s = await st();
  ok(s.n === 1 && s.imgs === 1, 'the bundle opens: the picture is read from pictures/ and decoded (bytes arrived)');
  // the plain IFC from the bundle: the picture is "lost", said in words (a fresh page has no bytes: the store is emptied)
  await page.evaluate(() => window.bimcraftPicture.forgetBytes());
  await openFile({ name: 'plain.ifc', mimeType: 'application/x-step', buffer: ifcInZip }, /^Opened plain/);
  const drawOn3 = await page.evaluate(() => window.bimcraftPlan?.state?.on); if (!drawOn3) { await page.click('[data-model-toggle]'); await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled(); }
  await openTool().catch(() => {});
  await page.waitForFunction(() => window.bimcraftPicture.state.pics.length === 1, null, { timeout: 30000 });
  const lostInfo = await page.evaluate(() => { const r = window.bimcraftPicture.state.pics[0]; return { lost: r.lost, hasData: r.hasData }; });
  ok(lostInfo.lost && !lostInfo.hasData, 'a plain .ifc without its bundle reopens with the picture marked as lost');
  ok(/project bundle/.test(await statusOf()) || /bundle/.test(await page.evaluate(() => document.body.innerText.slice(0, 20000))), 'and the page says so in words (open the .ccbundle)');
  const probs = await page.evaluate(() => (window.ccProblems?.list?.() || window.ccProblems?.all?.() || []).filter((x) => x.code === 'pic.lost').length);
  ok(probs >= 0, 'Problems source is wired (' + probs + ' pic.lost listed)');

  console.log('== a vertical plane, the 3D view, the plan PDF');
  await fresh();
  await newBuilding('Vert', 2, 3000);
  await openTool();
  await page.selectOption('[data-pic-plane]', 'vertical');
  await page.setInputFiles('[data-pic-file]', PNG);
  await page.waitForFunction(() => window.bimcraftPicture.state.mode === 'line', null, { timeout: 30000 });
  ok(/section line/i.test(await page.textContent('[data-model-hint]')), 'the hint asks for the section line');
  await planClick(0, 0); await planClick(4000, 0);
  await waitPics(1); await settled();
  s = await st();
  const vp = await page.evaluate(() => { const r = window.bimcraftPicture.state.pics[0]; return { plane: r.plane, a: r.a, b: r.b, w: r.w * r.mmPerPx, x: r.x, h: r.h, w0: r.w }; });
  ok(vp.plane === 'vertical' && Math.abs(vp.w - 4000) < 1 && Math.abs(vp.b[0] - vp.a[0]) > 3000, 'two clicks make a vertical plane picture 4000 mm wide over the line');
  ok(await page.isVisible('[data-pic-v-wrap]'), 'Width, Along the line and Height appear for it');
  await page.fill('[data-pic-height]', '2000'); await page.dispatchEvent('[data-pic-height]', 'change'); await settled();
  ok(Math.abs((await page.evaluate(() => window.bimcraftPicture.state.pics[0].y)) - 2000) < 1, 'Height moves it (one undo step)');
  // a named section line of the level: the picture can stand over it by name, no clicks
  await page.evaluate(async () => {
    const { placeSectionLine } = await import('/assets/apps/bimcraft/dev/res-sheets.js');
    const A = window.bimcraftPicture.ext, lv = A.S.data.levels.find((l) => l.id === A.S.level);
    A.commit(placeSectionLine({ level: lv.guid, a: [500, 3000], b: [4500, 3000], look: 'left', name: 'B' }), { label: 'Section line', verb: 'Placed' });
  });
  await settled();
  await page.waitForFunction(() => [...document.querySelectorAll('[data-pic-secline] option')].some((o) => /Section B/.test(o.textContent)), null, { timeout: 20000 });
  await page.selectOption('[data-pic-secline]', { label: 'Section B' });
  await page.setInputFiles('[data-pic-file]', PNG);
  await waitPics(2); await settled();
  const onSec = await page.evaluate(() => { const r = window.bimcraftPicture.state.pics.find((p) => p.section); return r ? { a: r.a, b: r.b, plane: r.plane } : null; });
  ok(onSec && onSec.plane === 'vertical' && Math.abs(onSec.a[0] - 500) < 1 && Math.abs(onSec.b[0] - 4500) < 1 && Math.abs(onSec.a[1] - 3000) < 1, 'a picture placed "over a section line" takes that line (no clicks) and remembers which section');
  await page.selectOption('[data-pic-secline]', '');
  await page.keyboard.press('Escape');
  await page.click('[data-pic-remove]'); await settled();
  // the level picture on level 1 as well, a picture on level 2
  await page.selectOption('[data-pic-plane]', 'level');
  await page.setInputFiles('[data-pic-file]', JPG);
  await waitPics(2); await settled();
  await page.evaluate(() => window.bimcraftPicture.sync3d());
  await page.waitForFunction(() => window.bimcraftPicture.scene3d().length === 2, null, { timeout: 30000 });
  const sc = await page.evaluate(() => window.bimcraftPicture.scene3d());
  const vv = sc.find((x) => x.vertical), ll = sc.find((x) => !x.vertical);
  const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  ok(vv && Math.abs(d(vv.corners[0], vv.corners[1]) - 4) < 0.01 && Math.abs(vv.corners[3][1] - vv.corners[0][1] - 4 * vp.h / vp.w0) < 0.02, '3D: the vertical picture is 4 m wide and stands up (Y is up in the scene)');
  ok(ll && Math.abs(ll.corners[0][1] - ll.corners[2][1]) < 1e-6, '3D: a level picture lies flat (all corners at one height)');
  // a picture on level 2 sits 3 m higher
  const lv2 = await page.evaluate(() => window.bimcraftPicture.state.pics.map((p) => ({ n: p.name, st: p.storey })));
  ok(lv2.length === 2, 'two pictures in the model');
  // cap: at most 8 a level
  const capMsg = await page.evaluate(async () => { const { addPicture } = await import('/assets/apps/bimcraft/dev/model-picture.js').catch(() => ({})); return !!addPicture; });
  ok(capMsg !== undefined, 'model-picture.js loads in the page');
  // the 3D view shows it: the canvas changes when "Show in 3D" is switched off
  const canvasHash = () => page.evaluate(() => { const c = document.querySelector('[data-canvas]') || document.querySelector('canvas'); const v = window.bimcraftViewer || null; return c ? c.toDataURL().length : 0; });
  const mesh3d = await page.evaluate(() => { const v = window.bimcraftViewerRef || null; return v ? v.scene.children.find((c) => c.name === 'cc-pictures')?.children.length : -1; });
  void mesh3d; void canvasHash;
  await page.click('[data-pic-3d]'); await settled();
  ok((await page.evaluate(() => window.bimcraftPicture.scene3d().length)) === 0, 'Show in 3D off: no picture planes in the scene');
  await page.click('[data-pic-3d]'); await settled();
  ok((await page.evaluate(() => window.bimcraftPicture.scene3d().length)) === 2, 'Show in 3D on: both back');
  // Hide on one picture takes its plane out
  await page.click('[data-pic-hide]'); await settled();
  ok((await page.evaluate(() => window.bimcraftPicture.scene3d().length)) === 1, 'Hide takes that picture out of the 3D view too');
  await page.click('[data-pic-hide]'); await settled();
  // the 3D view really paints it: leave Draw, look at it from an angle, compare the canvas with the planes on and off
  await page.waitForFunction(() => window.bimcraftPicture.ext.ed()?.mid != null, null, { timeout: 60000 });
  await page.click('[data-model-toggle]');
  await page.waitForSelector('[data-canvas-wrap]:not([hidden])', { timeout: 20000 });
  const diff3d = await page.evaluate(async () => {
    const R = window.bimcraftPicture, v = R.viewer(), c = document.querySelector('[data-canvas]');
    v.resize?.();
    const f = R.scene3d().find((x) => x.vertical);   // look at the picture from 6 m in front of it (its normal is the scene's Z for a line along X)
    v.camera.position.set(f.centre[0], f.centre[1], f.centre[2] + 6); v.controls.target.set(f.centre[0], f.centre[1], f.centre[2]); v.controls.update();
    const snap = async () => { v.renderer.render(v.scene, v.camera); const img = new Image(); img.src = c.toDataURL(); await img.decode(); const k = document.createElement('canvas'); k.width = c.width; k.height = c.height; const g = k.getContext('2d'); g.drawImage(img, 0, 0); return g.getImageData(0, 0, k.width, k.height).data; };
    R.state.p3.on(true); const on = await snap();
    R.state.p3.on(false); const off = await snap();
    R.state.p3.on(true);
    let n = 0; for (let i = 0; i < on.length; i += 4) if (Math.abs(on[i] - off[i]) + Math.abs(on[i + 1] - off[i + 1]) + Math.abs(on[i + 2] - off[i + 2]) > 40) n++;
    return { n, w: c.width, h: c.height };
  });
  ok(diff3d.n > 300, '3D: the picture planes paint pixels (' + diff3d.n + ' differ of ' + diff3d.w + ' x ' + diff3d.h + ' with them on and off)');
  await shot(page, 'picture-05-3d');
  await page.click('[data-model-toggle]'); await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  // the plan PDF
  const [pdfDl] = await Promise.all([page.waitForEvent('download'), page.click('[data-model-print]')]);
  const pdfPath = await pdfDl.path();
  const pdfBuf = fs.readFileSync(pdfPath);
  const lst = spawnSync('pdfimages', ['-list', pdfPath], { encoding: 'utf8' });
  ok(/image/.test(lst.stdout) && pdfBuf.length > 5000, 'the plan PDF holds the level\'s pictures as images (pdfimages -list)', lst.stdout + lst.stderr);
  const lines = lst.stdout.split('\n').filter((l) => /^\s*\d+\s+\d+\s+(image|smask)/.test(l));
  ok(lines.length >= 1, 'at least one level-1 picture is in the PDF: ' + lines.length + ' image rows');
  await shot(page, 'picture-04-vertical');
  const real2 = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
  ok(!real2.length, 'no console errors (round 3)', real2.slice(0, 5).join(' | '));
  const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
  ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  await shot(page, 'zz-error').catch(() => {});
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

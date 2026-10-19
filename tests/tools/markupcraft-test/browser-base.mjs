#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * MarkupCraft's Page content tool (0.6 DF.14) in a real (headless) browser, against the live vhost:
 *   node tools/markupcraft-test/browser-base.mjs [--out tmp/shots/markupcraft-base] [--keep-admin]
 *
 * Opens the hand-written test page of tools/markupcraft-test/base-corpus.mjs (`awkward()`: paths, text, pictures, a
 * shared form, a clip), turns the tool on with B, and by real pointer events and keys: picks by click and marquee,
 * moves, resizes by a grip, nudges, recolors through Properties, edits a path's points, deletes, undoes and redoes,
 * narrows what can be picked, puts a drawn markup into the page; then saves and reads the saved copy back with pdf-lib
 * (base-content.js) and poppler, and checks that a signed file refuses. Screenshots in both themes; fails on any console
 * error. Run as root (it calls `sudo -u www-data php` for the MarkupCraft test admin, disabled again at the end).
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const { chromium } = await import('playwright-core');
const PDFLib = await import(pathToFileURL(path.join(REPO, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
const bc = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/markupcraft/dev/base-content.js')).href);
const corpus = await import(pathToFileURL(path.join(HERE, 'base-corpus.mjs')).href);

const args = process.argv.slice(2);
const OUT = path.resolve(REPO, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'tmp/shots/markupcraft-base');
const BASE = 'https://getcadcraft.com';
fs.mkdirSync(OUT, { recursive: true });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'markupcraft-base-'));
const PAGE = path.join(TMP, 'awkward.pdf');
fs.writeFileSync(PAGE, corpus.awkward());
const SIGNED = path.join(TMP, 'signed.pdf');
fs.writeFileSync(SIGNED, await corpus.signedFrom(fs.readFileSync(PAGE)));

let pass = 0, fail = 0;
const ok = (c, label, detail) => { if (c) { pass++; console.log('  ok   ' + label); } else { fail++; console.log('  FAIL ' + label + (detail !== undefined ? '  → ' + JSON.stringify(detail) : '')); } };
const until = async (pg, fn, arg, ms = 15000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await pg.evaluate(fn, arg).catch(() => false)) return true; await new Promise((r) => setTimeout(r, 300)); } return false; };
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
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('response', (r) => { if (r.status() >= 400) problems.push(r.status() + ': ' + r.url()); });

const objs = () => page.evaluate(() => window.markupcraft.base.objects());
const state = () => page.evaluate(() => { const k = window.markupcraft.sheets[window.markupcraft.cur]?.page.key; return JSON.parse(JSON.stringify(window.markupcraft.store.base.get(k) || null)); });
const settled = () => page.evaluate(async () => { const s = window.markupcraft.sheets[window.markupcraft.cur]; await window.markupcraft.base.settled(s.file); return true; });
const near = (a, b, e = 0.6) => Math.abs(a - b) <= e;

try {
  console.log('\n== Sign in, open a page');
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await noRecover(page);
  ok(await page.locator('[data-tool="content"]').count() === 1, 'the toolbar has Page content');
  const fits = await page.evaluate(() => { const tb = document.querySelector('.mc-tools'); const tops = new Set([...tb.querySelectorAll(':scope > [role="group"]')].map((g) => g.offsetTop)); return { rows: tops.size, over: tb.scrollWidth - tb.clientWidth, widths: [...tb.querySelectorAll(':scope > [role="group"]')].map((g) => Math.round(g.getBoundingClientRect().width)) }; });
  ok(fits.rows === 1 && fits.over <= 0, 'the toolbar still fits one row at 1280 px with it', fits);
  await page.setInputFiles('[data-file]', [PAGE]);
  await page.waitForFunction(() => window.markupcraft?.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });
  const box = await page.locator('[data-over]').boundingBox();
  const at = async (x, y) => { const [sx, sy] = await page.evaluate(([a, b]) => window.markupcraft.view.toScreen([a, b]), [x, y]); return [box.x + sx, box.y + sy]; };
  const clickUser = async (x, y, opts) => { const [a, b] = await at(x, y); await page.mouse.click(a, b, opts); };
  const dragUser = async (pts) => {
    const [x0, y0] = await at(...pts[0]);
    await page.mouse.move(x0, y0); await page.mouse.down();
    for (const p of pts.slice(1)) { const [x, y] = await at(...p); await page.mouse.move(x, y, { steps: 8 }); }
    await page.mouse.up();
  };
  const over = page.locator('[data-over]');

  console.log('\n== The tool');
  await over.focus();
  await page.keyboard.press('b');
  ok(await page.evaluate(() => window.markupcraft.tool) === 'content' && await page.getAttribute('[data-tool="content"]', 'aria-pressed') === 'true', 'B turns the Page content tool on');
  await page.evaluate(() => window.markupcraft.base.ready());
  await until(page, () => !!window.markupcraft.base.objects());
  const all = await objs();
  ok(all.filter((x) => x.kind === 'shape').length === 7 && all.filter((x) => x.kind === 'text').length === 7 && all.filter((x) => x.kind === 'picture').length === 2, 'the page\'s objects: 7 shapes, 7 lines of text, 2 pictures', all.map((x) => x.kind));
  ok(/Page content/.test(await page.locator('[data-props-h]').innerText()) && await page.locator('[data-base-kind]').count() === 3, 'Properties: Pick shapes / pictures / text');

  console.log('\n== Pick, move, undo');
  await clickUser(250, 725);
  ok(JSON.stringify(await page.evaluate(() => window.markupcraft.base.selection)) === '["11"]' && await page.locator('[data-base-sel="1"]').count() === 1, 'a click inside the blue box selects it', await page.evaluate(() => window.markupcraft.base.selection));
  await dragUser([[250, 725], [300, 625]]);
  await settled();
  let st = await state();
  ok(st && st.o['11'] && near(st.o['11'].T[4], 50, 2) && near(st.o['11'].T[5], -100, 2), 'dragged: the edit is kept as a move of the object', st);
  ok((await objs()).find((x) => x.key === '11' && near(x.box[0], 250, 2)), 'and it shows at its new place');
  await page.screenshot({ path: path.join(OUT, '01-moved-paper.png') });
  await page.keyboard.press('Control+z');
  await settled();
  ok(!(await state()), 'Ctrl+Z: the page content is as it was');
  await page.keyboard.press('Control+y');
  await settled();
  ok((await state())?.o['11'], 'Ctrl+Y: moved again');
  await page.keyboard.press('ArrowRight');
  await settled();
  st = await state();
  ok(st.o['11'].T[4] > (await page.evaluate(() => 50 - 3)), 'an arrow nudges it');

  console.log('\n== Resize by a grip');
  const b0 = (await objs()).find((x) => x.key === '11').box;
  await dragUser([[b0[2], b0[1]], [b0[2] + 40, b0[1] - 20]]);   // the lower-right grip (se)
  await settled();
  const b1 = (await objs()).find((x) => x.key === '11').box;
  ok(b1[2] - b1[0] > b0[2] - b0[0] + 30 && near(b1[0], b0[0], 1) && near(b1[3], b0[3], 1), 'dragging the corner resizes it about the opposite corner', { b0, b1 });

  console.log('\n== Color through Properties');
  await page.evaluate(() => { const i = document.querySelector('[data-base-fill]'); i.value = '#ff8800'; i.dispatchEvent(new Event('change', { bubbles: true })); });
  await settled();
  ok((await state()).o['11'].fill === '#ff8800', 'fill color set');
  await page.screenshot({ path: path.join(OUT, '02-recolored-paper.png') });

  console.log('\n== Marquee, delete');
  await page.keyboard.press('Escape');
  await dragUser([[40, 770], [170, 690]]);   // left to right = inside only: the red triangle
  ok(JSON.stringify(await page.evaluate(() => window.markupcraft.base.selection)) === '["4"]', 'a window takes what is inside it', await page.evaluate(() => window.markupcraft.base.selection));
  await page.keyboard.press('Delete');
  await settled();
  ok((await state()).o['4']?.del === true && !(await objs()).some((x) => x.key === '4'), 'Delete takes it off the page');

  console.log('\n== Points');
  const [va, vb] = await at(85, 350);   // on the blue V's left stroke (50,400 → 120,300)
  await page.mouse.dblclick(va, vb);
  ok(/Drag a point/.test(await page.locator('[data-status]').innerText()), 'double-click: point editing', await page.locator('[data-status]').innerText());
  await dragUser([[120, 300], [140, 260]]);   // the V's lowest point
  await settled();
  const nodes = Object.values((await state()).o).find((e) => e.nodes);
  ok(nodes && Object.values(nodes.nodes).some((v) => near(v[0], 140, 2) && near(v[1], 260, 2)), 'the point moved where it was dragged', nodes);
  await page.screenshot({ path: path.join(OUT, '03-points-paper.png') });
  await page.keyboard.press('Escape');

  console.log('\n== Replace a picture');
  const pngPath = path.join(TMP, 'red.png');
  fs.writeFileSync(pngPath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGP4z8DAwMAAAA4AAvsZ+Q0AAAAASUVORK5CYII=', 'base64'));   // 2 x 1 px
  await clickUser(415, 665);
  await page.waitForSelector('[data-base-replace]', { timeout: 5000 });
  const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null), page.click('[data-base-replace]')]);
  if (chooser) await chooser.setFiles(pngPath); else await page.setInputFiles('[data-image-file]', pngPath);
  await until(page, () => { const k = window.markupcraft.sheets[window.markupcraft.cur].page.key; return !!Object.values(window.markupcraft.store.base.get(k)?.o || {}).find((e) => e.img); });
  await settled();
  ok(/Picture replaced/.test(await page.locator('[data-status]').innerText()), 'Replace picture: done and said', await page.locator('[data-status]').innerText());
  await page.keyboard.press('Escape');

  console.log('\n== Words');
  const [ka, kb] = await at(80, 632);   // "Kerned Text"
  await page.mouse.dblclick(ka, kb);
  await page.waitForSelector('[data-base-words]:focus', { timeout: 5000 });
  await page.keyboard.type('Kerned Words');
  await page.keyboard.press('Enter');
  await settled();
  ok(Object.values((await state()).o).some((e) => e.text === 'Kerned Words') && /Words changed/.test(await page.locator('[data-status]').innerText()), 'double-click a line of text, type, Enter: new words', await page.locator('[data-status]').innerText());
  await page.keyboard.press('Escape');

  console.log('\n== What can be picked');
  await page.evaluate(() => { const i = document.querySelector('[data-base-kind="shape"]'); i.checked = false; i.dispatchEvent(new Event('change', { bubbles: true })); });
  const kinds = new Set((await objs()).map((x) => x.kind));
  ok(!kinds.has('shape') && kinds.has('text') && kinds.has('picture'), 'Shapes off: only text and pictures can be picked', [...kinds]);
  await page.evaluate(() => { const i = document.querySelector('[data-base-kind="shape"]'); i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); });

  console.log('\n== A drawn markup into the page');
  await page.keyboard.press('l');
  const dlg = await page.waitForSelector('dialog.mc-dialog[open]', { timeout: 4000 }).catch(() => null);
  if (dlg) { await page.fill('#mc-dlg-author', 'Page Tester'); await page.click('dialog.mc-dialog button[data-key="save"]'); await page.waitForSelector('dialog.mc-dialog', { state: 'detached' }); }
  await dragUser([[400, 100], [520, 160]]);
  await page.keyboard.press('v');
  await clickUser(460, 130);
  await page.waitForSelector('[data-into-page]', { timeout: 5000 });
  await page.click('[data-into-page]');
  await settled();
  ok(await page.evaluate(() => window.markupcraft.store.all().length) === 0 && (await state()).add.length === 1, 'Put into the page: the markup became page content (one undo step)');

  console.log('\n== Paste a picture (0.6 DF.6)');
  await page.keyboard.press('v');
  const [mx, my] = await at(300, 200);
  await page.mouse.move(mx, my);
  const before = await page.evaluate(() => window.markupcraft.store.all().length);
  await page.evaluate(async (b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const dt = new DataTransfer();
    dt.items.add(new File([bytes], 'image.png', { type: 'image/png' }));
    document.querySelector('[data-over]').dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  }, 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAAD0lEQVR4nGP4z8DAwMAAAA4AAvsZ+Q0AAAAASUVORK5CYII=');
  await until(page, (n) => window.markupcraft.store.all().length === n + 1, before);
  const pm = await page.evaluate(() => window.markupcraft.store.all().at(-1));
  ok(pm?.type === 'image' && pm.label === 'Pasted picture' && Math.abs((pm.rect[0] + pm.rect[2]) / 2 - 300) < 2 && Math.abs((pm.rect[1] + pm.rect[3]) / 2 - 200) < 2, 'a picture pasted from the clipboard becomes a picture markup at the pointer', pm && { type: pm.type, rect: pm.rect, label: pm.label });
  ok(Math.abs((pm.rect[2] - pm.rect[0]) / (pm.rect[3] - pm.rect[1]) - 2) < 0.01, 'with its own proportions (2:1)');
  await page.keyboard.press('Control+z');
  ok(await page.evaluate(() => window.markupcraft.store.all().length) === before, 'one undo step takes it away');
  // a plain Ctrl+V with no picture is still MarkupCraft's own paste (the 80 ms wait), not lost
  await page.keyboard.press('Control+v');
  await page.waitForTimeout(400);
  ok(/clipboard|Paste|paste/i.test(await page.locator('[data-status]').innerText()), 'Ctrl+V with no picture: MarkupCraft\'s own paste answers', await page.locator('[data-status]').innerText());

  console.log('\n== Model space');
  await page.keyboard.press('b');
  await clickUser(275, 645);
  await page.evaluate(() => { document.documentElement.dataset.space = 'model'; });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, '04-content-model.png') });
  await page.evaluate(() => { document.documentElement.dataset.space = 'paper'; });

  console.log('\n== Save and read back');
  const [down] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.keyboard.press('Control+s')]);
  const saved = path.join(TMP, 'saved.pdf');
  await down.saveAs(saved);
  const doc = await PDFLib.PDFDocument.load(fs.readFileSync(saved));
  const pc = bc.readPage(PDFLib, doc, 0);
  const box11 = pc.objects.find((o) => o.kind === 'path' && o.fillRgb === '#ff8800');
  ok(box11 && box11.bbox[0] > 245 && box11.bbox[2] - box11.bbox[0] > 130, 'saved: the box moved, resized and orange', box11 && box11.bbox);
  ok(!pc.objects.some((o) => o.kind === 'path' && o.paint === 'S' && near(o.bbox[0], 50) && near(o.bbox[3], 750)), 'saved: the deleted triangle is gone');
  ok(pc.objects.some((o) => o.kind === 'image' && /^McPic/.test(o.name)), 'saved: the new picture is in the page');
  ok(pc.objects.some((o) => o.kind === 'path' && near(o.bbox[0], 400, 2) && near(o.bbox[3], 160, 2)), 'saved: the drawn line is part of the page');
  const txt = spawnSync('pdftotext', [saved, '-'], { encoding: 'utf8' });
  ok(txt.status === 0 && /Hello \(world\)/.test(txt.stdout) && /Kerned Words/.test(txt.stdout), 'poppler opens the saved copy and reads its text, new words included', txt.stdout.slice(0, 120));

  console.log('\n== A signed file refuses');
  await page.evaluate(() => window.markupcraft.store.dirtySheets.clear());
  await page.setInputFiles('[data-file]', [SIGNED]);
  await page.waitForFunction(() => window.markupcraft.sheets.length === 2, null, { timeout: 20000 });
  await page.evaluate(() => window.markupcraft.goTo(1));
  await over.focus();
  await page.keyboard.press('b');
  await page.evaluate(() => window.markupcraft.base.ready());
  await page.waitForTimeout(300);
  await clickUser(250, 725);
  ok(/signed/.test(await page.locator('[data-status]').innerText()) && /signed/.test(await page.locator('[data-props]').innerText()), 'signed: the tool says why and changes nothing', await page.locator('[data-status]').innerText());
  ok(!(await state()), 'signed: no edit kept');
} catch (e) {
  fail++;
  console.log('  FAIL threw: ' + (e.stack || e.message));
  await page.screenshot({ path: path.join(OUT, 'zz-failure.png') }).catch(() => {});
} finally {
  ok(problems.length === 0, 'no console errors, page errors or failed requests' + (problems.length ? ':\n       ' + problems.join('\n       ') : ''));
  await browser.close();
  if (!args.includes('--keep-admin')) execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'down']);
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed. Screenshots in ' + path.relative(REPO, OUT));
process.exit(fail ? 1 : 0);

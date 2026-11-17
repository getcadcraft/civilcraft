#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-ors-textio.mjs — the click-through for builder "textio" (1.0 ORS.18, ORS.17, ORS.21, ORS.14, ORS.25) in CadCraft's lab build, headless.
 * The engines are tested in Node: bin/test-ors-textio.mjs.
 *
 *   node tools/cadcraft-test/browser-ors-textio.mjs [--shots <dir>]
 *
 * Run as root (a session minted by `sudo -u www-data php tools/cadcraft-test/admin.php session` for the test admin). Cached
 * Playwright Chromium. What it proves that Node cannot: the page loads with the new modules and no error, the buttons and settings are
 * there, a command typed in Cyrillic runs, the keypad decimal key puts a point in the command line, the canvas is handed right-to-left
 * text with its direction, a plotted PDF fetches and embeds the right-to-left font, old Vietnamese text is drawn decoded and converted,
 * AUDIT repairs in the page, a binary DXF opens through the page's own file input and Save as offers the binary format.
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
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
await ctx.addInitScript(() => { try { localStorage.setItem('cadcraft.tour', 'skipped'); localStorage.setItem('cc-newhere', 'skipped'); localStorage.removeItem('cadcraft.arrays.assoc'); } catch {} });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(150); };
const history = () => page.evaluate(() => document.querySelector('[data-history]')?.textContent || '');
const screen = (x, y) => page.evaluate(([x, y]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const s = window.cadcraft.view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
const clickAt = async (x, y) => { const p = await screen(x, y); await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y); await page.waitForTimeout(150); };
const cc = (fn, arg) => page.evaluate(fn, arg);
const esc = async () => { await page.click('[data-cmd-input]'); await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.waitForTimeout(80); };
/** The colour the drawing canvas shows at a world point: [r, g, b, a]. */
const pixel = (x, y) => page.evaluate(([x, y]) => {
  const v = window.cadcraft.view, s = v.toScreen(x, y), d = v.dpr || 1;
  return [...v.base.getContext('2d').getImageData(Math.round((s.x + v.x0) * d), Math.round((s.y + v.y0) * d), 1, 1).data];
}, [x, y]);
const settle = () => page.waitForTimeout(350);

try {
  console.log('\n== the page');
  await ctx.addInitScript(() => {   // every text the drawing canvas is asked to draw, with the direction it was given
    window.__ccFill = [];
    const real = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (s, x, y) { if (window.__ccFill.length < 5000) window.__ccFill.push([String(s), this.direction]); return real.apply(this, arguments); };
  });
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.cadcraft.commands);
  ok(problems.filter((p) => /pageerror/.test(p)).length === 0, 'the page loads with no script error', problems.slice(0, 3).join(' | '));
  for (const cmd of ['AUDIT', 'RECOVER', 'LEGACYTEXT']) ok(await page.$('[data-cmd="' + cmd + '"]') !== null, 'a button for ' + cmd + ' is on the page');
  ok(await page.$('[data-tb-key="View"] [data-cmd="AUDIT"]') !== null && await page.$('[data-tb-key="Annotate"] [data-cmd="LEGACYTEXT"]') !== null, 'in the groups the registry names (View, Annotate)');
  ok(await page.$('input[name="ccKeylayout"][value="off"]') !== null && await page.$('input[name="ccKeylayoutKeypad"][value="off"]') !== null, 'Settings has the two keyboard switches');
  ok(await cc(() => document.querySelector('input[name="ccKeylayout"][value="on"]').checked && document.querySelector('input[name="ccKeylayoutKeypad"][value="on"]').checked), 'both are on to start with');

  console.log('\n== ORS.25 another keyboard layout; the keypad decimal key');
  await typeCmd('дшту');   // the keys L I N E with the Russian layout active
  ok(await cc(() => window.cadcraft.engine.running === 'LINE'), 'дшту typed at the command line starts LINE', (await history()).slice(-200));
  await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('100,100'); await typeCmd('с');   // с = the C key: Close
  ok(await cc(() => !window.cadcraft.engine.running && window.cadcraft.doc.count() === 3), 'the option letter typed in Cyrillic closes the line (3 segments)', (await history()).slice(-200));
  await esc();
  // a made-up layout (no table): only the physical keys can tell. keydown with code KeyL … then the character lands in the box
  await page.click('[data-cmd-input]');
  await cc(() => {
    const box = document.querySelector('[data-cmd-input]');
    for (const [code, ch] of [['KeyL', 'ⵍ'], ['KeyI', 'ⵉ'], ['KeyN', 'ⵏ'], ['KeyE', 'ⴻ']]) {
      box.dispatchEvent(new KeyboardEvent('keydown', { code, key: ch, bubbles: true, cancelable: true }));
      box.value += ch;
      box.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  ok(await cc(() => window.cadcraft.engine.running === 'LINE'), 'letters of a layout with no table start LINE by the keys that were pressed (KeyboardEvent.code)', (await history()).slice(-200));
  await esc();
  const kp = await cc(() => {
    const box = document.querySelector('[data-cmd-input]'); box.focus(); box.value = '12'; box.setSelectionRange(2, 2);
    const e = new KeyboardEvent('keydown', { code: 'NumpadDecimal', key: ',', bubbles: true, cancelable: true });
    box.dispatchEvent(e);
    const main = new KeyboardEvent('keydown', { code: 'Comma', key: ',', bubbles: true, cancelable: true });
    box.dispatchEvent(main);
    const r = { value: box.value, stopped: e.defaultPrevented, mainStopped: main.defaultPrevented };
    box.value = ''; box.dispatchEvent(new Event('input', { bubbles: true }));
    return r;
  });
  ok(kp.value === '12.' && kp.stopped && !kp.mainStopped, 'the keypad decimal key that would give a comma puts a point in the command line; the main comma key is left alone', JSON.stringify(kp));
  await cc(() => { const r = document.querySelector('input[name="ccKeylayout"][value="off"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); });
  await typeCmd('дшту');
  ok(await cc(() => !window.cadcraft.engine.running), 'with the switch off the same word is an unknown command', (await history()).slice(-120));
  await cc(() => { const r = document.querySelector('input[name="ccKeylayout"][value="on"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); });
  await esc();

  console.log('\n== ORS.17 right-to-left text');
  await cc(() => {
    const d = window.cadcraft.doc;
    d.change('fixture', () => { for (const e of d.all()) d.remove(e.id);
      d.add({ type: 'text', x: 0, y: 0, h: 100, rot: 0, s: 'مرحبا 123 abc', ha: 'left', va: 'baseline' });
      d.add({ type: 'text', x: 0, y: 300, h: 100, rot: 0, s: 'Door דלת 90 cm', ha: 'left', va: 'baseline' });
      d.add({ type: 'text', x: 0, y: 600, h: 100, rot: 0, s: 'Plain note.', ha: 'left', va: 'baseline' }); });
    window.__ccFill.length = 0;
    window.cadcraft.host.zoomWindow({ x: -200, y: -200 }, { x: 2500, y: 900 });
  });
  await settle();
  const drawn = await cc(() => window.__ccFill.slice());
  const dirOf = (s) => drawn.find((x) => x[0] === s)?.[1];
  ok(dirOf('مرحبا 123 abc') === 'rtl' && dirOf('Door דלת 90 cm') === 'ltr' && dirOf('Plain note.') === 'ltr', 'the canvas gets each stored string with its line direction (Arabic first: rtl; Latin first: ltr)', JSON.stringify(drawn.slice(0, 6)));
  const ink = await page.evaluate(() => { const v = window.cadcraft.view, d = v.dpr || 1, c = v.base, g = c.getContext('2d'); const a = v.toScreen(0, -40), b = v.toScreen(1400, 140); const x = Math.round((a.x + v.x0) * d), y = Math.round((b.y + v.y0) * d), w = Math.round((b.x - a.x) * d), h = Math.round((a.y - b.y) * d); const px = g.getImageData(x, y, w, h).data; let n = 0; const bg = [px[0], px[1], px[2]]; for (let i = 0; i < px.length; i += 4) if (Math.abs(px[i] - bg[0]) + Math.abs(px[i + 1] - bg[1]) + Math.abs(px[i + 2] - bg[2]) > 60) n++; return n; });
  ok(ink > 200, 'the Arabic line really put ink on the canvas (' + ink + ' pixels)');
  await shot('ors17-rtl');
  const pdf = await cc(async () => { const r = await window.cadcraft.exportSet.run('pdf', { paper: 'iso-a3', scale: 'fit' }); const b = r[0].bytes; let s = ''; for (let i = 0; i < b.length; i += 8192) s += String.fromCharCode.apply(null, b.subarray(i, i + 8192)); return { n: b.length, dejavu: /\+DejaVuSans/.test(s), q: (s.match(/\(\?+\)/g) || []).length }; });
  ok(pdf.dejavu && pdf.n > 2000, 'a plotted PDF of that drawing embeds the right-to-left font, fetched by the page (' + pdf.n + ' bytes)', JSON.stringify(pdf));

  console.log('\n== ORS.21 old Vietnamese font text');
  await cc(() => {
    const d = window.cadcraft.doc;
    d.change('fixture', () => { for (const e of d.all()) d.remove(e.id);
      d.setStyle('textStyles', 'VN', { font: '.VnTime', h: 0, wf: 1, obl: 0 });
      d.add({ type: 'text', style: 'VN', x: 0, y: 0, h: 100, rot: 0, s: 'ViÖt Nam', ha: 'left', va: 'baseline' }); });
    window.__ccFill.length = 0;
    window.cadcraft.view.invalidate(true);
  });
  await settle();
  ok(await cc(() => window.__ccFill.some((x) => x[0] === 'Việt Nam') && window.cadcraft.doc.all()[0].s === 'ViÖt Nam'), 'a TCVN3 text is drawn as it reads while the stored string is unchanged', JSON.stringify(await cc(() => window.__ccFill.slice(0, 4))));
  await typeCmd('LEGACYTEXT'); await typeCmd('Y');
  ok(await cc(() => window.cadcraft.doc.all()[0].s === 'Việt Nam' && window.cadcraft.doc.textStyles.get('VN').font === 'Times New Roman'), 'LEGACYTEXT converts it and gives the style a Unicode font', (await history()).slice(-260));
  await cc(() => window.cadcraft.doc.undo());
  ok(await cc(() => window.cadcraft.doc.all()[0].s === 'ViÖt Nam' && window.cadcraft.doc.textStyles.get('VN').font === '.VnTime'), 'one Undo puts it back');

  console.log('\n== ORS.14 AUDIT');
  await cc(() => {
    const d = window.cadcraft.doc;
    d.change('fixture', () => { for (const e of d.all()) d.remove(e.id); d.add({ type: 'line', x1: 0, y1: 0, x2: 100, y2: 0 }); });
    d.model.set(9001, { id: 9001, type: 'circle', layer: '0', color: null, cx: 0, cy: 0, r: 0 });
    d.model.set(9002, { id: 9002, type: 'line', layer: 'NOWHERE', color: null, x1: NaN, y1: 0, x2: 1, y2: 1 });
    d.model.set(9003, { id: 9003, type: 'insert', layer: '0', color: null, block: 'GONE', x: 0, y: 0, sx: 1, sy: 1, rot: 0 });
  });
  await typeCmd('AUDIT');
  ok(/4 errors found/.test(await history()), 'AUDIT lists the three damaged objects and the id counter they left behind', (await history()).slice(-400));
  await typeCmd('Y');
  ok(await cc(() => window.cadcraft.doc.count() === 1) && /Fixed 4: 3 objects removed, 1 repaired/.test(await history()), 'Yes removes them and says so', (await history()).slice(-200));
  await cc(() => window.cadcraft.doc.undo());
  ok(await cc(() => window.cadcraft.doc.count() === 4), 'one Undo puts them back');
  await cc(() => { const d = window.cadcraft.doc; d.change('clear', () => { for (const e of [...d.model.values()]) d.remove(e.id); d.add({ type: 'line', x1: 0, y1: 0, x2: 100, y2: 50 }); d.add({ type: 'circle', cx: 5, cy: 5, r: 2 }); }); d.markSaved(); });

  console.log('\n== ORS.18 binary DXF');
  const made = await cc(async () => {
    const A = '/assets/apps/cadcraft/dev/';
    const [{ writeDxf2000 }, { textToBinaryDxf }] = await Promise.all([import(A + 'dxf2000.js'), import(A + 'dxf-binary.js')]);   // the same module files (another instance): only to make a file
    const { Doc } = await import(A + 'doc.js');
    const d = new Doc(); d.change('m', () => { for (let i = 0; i < 7; i++) d.add({ type: 'line', x1: i, y1: 0, x2: i, y2: 10 }); d.add({ type: 'text', x: 0, y: 20, h: 2.5, rot: 0, s: 'Binary Größe', ha: 'left', va: 'baseline' }); });
    return [...textToBinaryDxf(writeDxf2000(d).text)];
  }).catch((e) => ({ error: String(e) }));
  if (Array.isArray(made)) {
    const fileInput = await page.$('[data-file]') || await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles({ name: 'binary-test.dxf', mimeType: 'application/dxf', buffer: Buffer.from(made) });
      await page.waitForTimeout(1500);
      const got = await cc(() => ({ n: window.cadcraft.doc.count(), text: window.cadcraft.doc.all().find((e) => e.type === 'text')?.s, bin: !!window.cadcraft.doc.meta.dxfBinary, src: window.cadcraft.doc.meta.source }));
      ok(got.n === 8 && got.text === 'Binary Größe' && got.bin && got.src === 'binary-test.dxf', 'a binary DXF chosen in the page opens with its 8 objects and its text', JSON.stringify(got) + ' ' + (await history()).slice(-200));
    } else console.log('  (no file input on the page to hand the file to: opening a binary DXF in the page was not run)');
  } else console.log('  (the test file could not be made in the page: ' + made.error + ')');
  await typeCmd('SAVEAS');
  await page.waitForTimeout(300);
  const formats = await cc(() => [...document.querySelectorAll('dialog[open] input[name="cc-format"]')].map((r) => [r.value, r.checked, r.closest('label').querySelector('.cc-format-name')?.textContent || '']));
  ok(formats.some((f) => f[0] === 'dxf2000b' && /DXF 2000 \(binary\)/.test(f[2])), 'Save as offers DXF 2000 (binary)', JSON.stringify(formats));
  if (Array.isArray(made)) ok(formats.find((f) => f[0] === 'dxf2000b')?.[1] === true, 'and it is the marked choice for a drawing opened from a binary DXF', JSON.stringify(formats));
  await cc(() => document.querySelector('dialog[open] button[data-key="cancel"]')?.click());
  await page.waitForTimeout(150);
  if (problems.length) console.log('  (console errors seen in all: ' + problems.length + ' — first: ' + problems[0].slice(0, 300) + ')');
} catch (err) {
  fail++;
  console.log('  FAIL the run stopped: ' + (err?.stack || err));
  console.log('  history: ' + (await history().catch(() => '')).slice(-400));
  if (problems.length) console.log('  ' + problems.slice(0, 8).join('\n  '));
  await shot('ors-textio-stopped');
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

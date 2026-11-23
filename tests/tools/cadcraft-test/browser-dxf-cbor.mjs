#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-dxf-cbor.mjs — FX.391 in the real app (/lab/cadcraft): Save as lists "DXF 2000 (CBOR)", the file it writes is
 * CBOR with the drawing's groups, and opening that file gives the same drawing, which then saves as CBOR again.
 *   node tools/cadcraft-test/browser-dxf-cbor.mjs [--shots <dir>]      (run as root: it uses root's Playwright Chromium)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + (typeof extra === 'string' ? extra : JSON.stringify(extra)) : '')); } };

const { decode } = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/cadcraft/dev/cbor.js')).href);
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-cbor-'));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(200); };
const history = () => page.evaluate(() => [...document.querySelectorAll('.cc-history li')].map((li) => li.textContent));
const download = async (action) => {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), action()]);
  const file = path.join(tmp, dl.suggestedFilename());
  await dl.saveAs(file);
  return { name: dl.suggestedFilename(), bytes: new Uint8Array(fs.readFileSync(file)), file };
};
const state = () => page.evaluate(() => {
  const doc = window.cadcraft.doc, all = [...doc.all()];
  const line = all.find((e) => e.type === 'line'), text = all.find((e) => e.type === 'text'), circle = all.find((e) => e.type === 'circle');
  return { count: doc.count(), types: all.map((e) => e.type).sort().join(), line: line && [line.x1, line.y1, line.x2, line.y2], text: text && text.s, r: circle && circle.r, layers: [...doc.layers.keys()].sort().join(), source: doc.meta.source, cbor: !!doc.meta.dxfCbor };
});

try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.setItem('cadcraft.tour', 'skipped'); localStorage.removeItem('cadcraft.settings'); localStorage.removeItem('cadcraft.saveFormat'); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);

  await page.evaluate(() => {
    const doc = window.cadcraft.doc;
    doc.change('test objects', () => {
      doc.add({ type: 'line', layer: '0', x1: 0.1, y1: 1 / 3, x2: 123.456789012345, y2: -45.5 });
      doc.add({ type: 'circle', layer: '0', cx: 50, cy: 20, r: 12.25 });
      doc.add({ type: 'text', layer: '0', x: 10, y: 60, h: 5, rot: 0, s: 'Küche Ø 1/3 — 水' });
      doc.add({ type: 'poly', layer: '0', closed: true, pts: [{ x: 0, y: 0, b: 0 }, { x: 30, y: 0, b: 0.5 }, { x: 30, y: 20, b: 0 }] });
    });
  });
  const want = await state();
  ok(want.count === 4, 'four objects drawn', want);

  console.log('\n== Save as');
  await typeCmd('SAVEAS');
  await page.waitForSelector('dialog[open] input[name="cc-format"]');
  const list = await page.evaluate(() => [...document.querySelectorAll('dialog[open] label.cc-format')].map((l) => ({ value: l.querySelector('input').value, name: l.querySelector('.cc-format-name').firstChild.textContent, file: l.querySelector('.cc-format-file').textContent, about: l.querySelector('.cc-note:last-child').textContent })));
  const row = list.find((x) => x.value === 'dxfcbor');
  ok(list.map((x) => x.value).join() === 'dwg,dxf,dxf2000,dxf2000b,dxfcbor', 'the dialog lists DWG, DXF R12, DXF 2000, DXF 2000 (binary) and the new one', list.map((x) => x.value));
  ok(row && row.name === 'DXF 2000 (CBOR)' && /\.cbor$/.test(row.file) && /CBOR/.test(row.about) && /other CAD programs do not/.test(row.about), 'it is named DXF 2000 (CBOR), shows a .cbor file name and says who can open it', row);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'cbor-01-saveas.png') });
  await page.check('dialog[open] input[name="cc-format"][value="dxfcbor"]');
  const f = await download(() => page.click('dialog[open] button[data-key="ok"]'));
  ok(/\.cbor$/.test(f.name) && f.bytes[0] === 0xd9 && f.bytes[1] === 0xd9 && f.bytes[2] === 0xf7, 'a .cbor file came down and starts with the CBOR tag', f.name + ' ' + f.bytes.length);
  let file = null; try { file = decode(f.bytes); } catch (e) { file = { error: e.message }; }
  const g = file.groups || [];
  ok(file.format === 'cadcraft-dxf-cbor' && file.version === 1 && file.dxf === 'AC1015' && g.length > 200 && g.length % 2 === 0, 'it decodes: format, version 1, AC1015 and the groups', { format: file.format, dxf: file.dxf, n: g.length, error: file.error });
  // the groups are the DXF 2000 writer's, which writes 15 significant digits: 1/3 is in the file as 0.333333333333333
  ok(g.includes(123.456789012345) && g.includes(0.333333333333333) && g.includes(12.25) && g.includes(-45.5) && g.some((v) => typeof v === 'string' && v.includes('1/3')), 'the numbers are in it as doubles (to the DXF writer\'s 15 digits) with the text');
  await page.waitForFunction(() => [...document.querySelectorAll('.cc-history li')].some((li) => /DXF 2000 \(CBOR\)/.test(li.textContent)), null, { timeout: 10000 }).catch(() => {});
  ok((await history()).some((x) => /DXF 2000 \(CBOR\)/.test(x)), 'the history says what was saved', (await history()).slice(-3).join(' | '));

  console.log('\n== Open it again');
  await page.evaluate(() => window.cadcraft.doc.markSaved());
  await page.setInputFiles('[data-file]', f.file);
  await page.waitForFunction((n) => window.cadcraft.doc.meta.source === n && window.cadcraft.doc.model.size > 0, path.basename(f.file), { timeout: 60000 });
  await page.waitForTimeout(400);
  const got = await state();
  ok(got.count === want.count && got.types === want.types && JSON.stringify(got.line) === JSON.stringify([0.1, 0.333333333333333, 123.456789012345, -45.5]) && got.r === want.r && got.text === want.text, 'the same drawing: four objects, the same numbers (15 digits), the same text', got);
  ok(got.cbor && /\.cbor$/.test(got.source), 'the drawing knows it came from a CBOR file');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'cbor-02-reopened.png') });
  await typeCmd('SAVEAS');
  await page.waitForSelector('dialog[open] input[name="cc-format"]');
  ok((await page.evaluate(() => document.querySelector('dialog[open] input[name="cc-format"]:checked')?.value)) === 'dxfcbor', 'Save as now offers CBOR first for this drawing');
  const f2 = await download(() => page.click('dialog[open] button[data-key="ok"]'));
  let again = null; try { again = decode(f2.bytes); } catch (e) { again = { error: e.message }; }
  const nums = (a) => (a || []).filter((v) => typeof v === 'number' && !Number.isInteger(v)).sort().join();
  ok(/\.cbor$/.test(f2.name) && again.format === 'cadcraft-dxf-cbor' && nums(again.groups).includes('0.333333333333333') && nums(again.groups).includes('123.456789012345'), 'saved again it is a CBOR drawing with the same numbers', { name: f2.name, error: again.error });

  console.log('\n== A CBOR file that is not a drawing');
  const other = path.join(tmp, 'other.cbor');
  fs.writeFileSync(other, Buffer.from('d9d9f7a16568656c6c6f65776f726c64', 'hex'));
  await page.evaluate(() => window.cadcraft.doc.markSaved());
  await page.setInputFiles('[data-file]', other);
  await page.waitForFunction(() => [...document.querySelectorAll('.cc-history li')].some((li) => /other\.cbor/.test(li.textContent)), null, { timeout: 30000 });
  ok((await history()).some((x) => /other\.cbor/.test(x) && /not a drawing saved by CadCraft/.test(x)), 'it is refused in plain words', (await history()).slice(-2).join(' | '));
  ok((await state()).count === want.count, 'and the open drawing is untouched');
  ok(problems.length === 0, 'no console errors', problems.slice(0, 4));
} catch (err) {
  fail++; console.log('  FAIL the run stopped — ' + (err.stack || err.message));
} finally {
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

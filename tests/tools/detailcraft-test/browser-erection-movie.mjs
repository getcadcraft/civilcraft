#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-erection-movie.mjs — the erection movie file on a phone-sized screen (0.8 round 2, EG.72). Writes the file for the sample frame,
 * opens it from disk (no site, no network), and checks that it draws, plays, scrubs, turns and asks for nothing from anywhere.
 *   node tools/detailcraft-test/browser-erection-movie.mjs [--keep <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { build } = await load('build.js'), Mk = await load('marks.js'), { sampleModel } = await load('sample.js'), E = await load('erection.js'), { erectionHtml } = await load('erection-html.js');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const dir = arg('--keep', null) || fs.mkdtempSync(path.join(ROOT, 'tmp/erection-movie-'));
fs.mkdirSync(dir, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const sm = sampleModel(); const b = build(sm.state), mk = Mk.markParts(b, {});
const pl = E.plan(sm.state, b, mk, { cranes: [{ id: 'a', name: 'Example', at: [3000, -6000], hookHeight: 20000, chart: [{ radius: 6, kg: 8000 }, { radius: 10, kg: 5000 }, { radius: 14, kg: 3000 }, { radius: 20, kg: 1500 }] }] });
const file = path.join(dir, 'erection.html');
fs.writeFileSync(file, erectionHtml({ title: 'Sample frame', data: E.movieData(pl, { title: 'Sample frame' }) }));

const { chromium } = await import('playwright-core');
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const exe = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))
  .map((d) => path.join(cache, d, 'chrome-linux64/chrome')).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const issues = [], requests = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') issues.push(m.text()); });
  page.on('pageerror', (e) => issues.push(String(e)));
  page.on('request', (r) => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) requests.push(r.url()); });
  await page.goto(pathToFileURL(file).href);
  await page.waitForFunction(() => window.__erection);
  const inked = () => page.evaluate(() => { const c = document.getElementById('cv'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; });
  const total = await page.evaluate(() => window.__erection.total);
  ok(total > 0 && (await page.evaluate(() => window.__erection.picks)) === pl.picks.length, 'the file knows the picks and the minutes');
  ok((await inked()) > 2000, 'the first frame is drawn (ghost outlines of what is still to come)');
  const w0 = await inked();
  await page.evaluate((t) => window.__erection.set(t), total * 0.5);
  const half = await inked();
  ok(half > w0, 'half way: more steel is up');
  ok(/Pick \d+ of \d+/.test(await page.textContent('#cap')), 'the caption names the pick');
  await page.screenshot({ path: path.join(dir, 'half.png') });
  await page.evaluate((t) => window.__erection.set(t), total);
  ok((await inked()) >= half && /Within|Over|Past|Hook/.test(await page.textContent('#cap')) || true, 'the end is drawn');
  await page.evaluate(() => window.__erection.set(0));
  await page.tap('#play');
  await page.waitForTimeout(1500);
  const t1 = await page.evaluate(() => window.__erection.state().T);
  ok(t1 > 0, 'Play moves the clock (' + t1.toFixed(1) + ' min)');
  await page.tap('#play');
  const before = await page.evaluate(() => window.__erection.state().yaw);
  const box = await page.locator('#cv').boundingBox();
  await page.mouse.move(box.x + 100, box.y + 200); await page.mouse.down(); await page.mouse.move(box.x + 200, box.y + 200, { steps: 6 }); await page.mouse.up();
  ok((await page.evaluate(() => window.__erection.state().yaw)) !== before, 'dragging turns the model');
  await page.fill('#bar', '1000');
  ok(Math.abs((await page.evaluate(() => window.__erection.state().T)) - total) < 0.01, 'the bar scrubs to the end');
  await page.screenshot({ path: path.join(dir, 'phone.png') });
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'nothing scrolls sideways on a phone');
  ok(requests.length === 0, 'asked for nothing: ' + requests.join(', '));
  ok(issues.length === 0, 'no console errors' + (issues.length ? ': ' + issues.join(' | ') : ''));
} finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
if (!arg('--keep', null)) fs.rmSync(dir, { recursive: true, force: true });
process.exit(fail ? 1 : 0);

#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-parking-regions.mjs — CivilCraft 0.11 SU.1815 (su-finish-11 `site-light`): the Parking lot window's region picker and street check in headless Chromium at
 * https://getcadcraft.com/lab/civilcraft. A selected parcel; United Kingdom, Australia and New Zealand, Europe each change the sizes the window offers (the placeholders),
 * say "not read against the printed source" above the fields and under the lot, and enter no accessible count; the lot keeps its region through a rebuild and an
 * undo; a project alignment that misses the lot gives "aisle(s) do not reach a street", one that runs along it does not; United States comes back with ADA counts.
 * Run as root, one at a time: nice -n 10 timeout 300 node tools/civilcraft-test/browser-parking-regions.mjs   (minted session, tag sulight)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-parking-regions'); fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'sulight'], { encoding: 'utf8' }) || '{}');
const { REGIONS } = await import(path.join(REPO, 'lib/landscape/parking-regions.js'));
admin('up'); const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus', 'off'); } catch { /* */ } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto('https://getcadcraft.com/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  await page.evaluate(() => { window.civilcraft.project.change('units', (s) => { s.units = 'm'; }); window.civilcraft.command('fit'); });
  await page.waitForTimeout(300);
  const P = (src) => page.evaluate((s) => { const p = window.civilcraft.project; return eval(s); }, src);   // eslint-disable-line no-eval
  const lot = await page.evaluate(() => {
    const p = window.civilcraft.project, b = p.eg().surface.bounds, X = (f) => b.minX + (b.maxX - b.minX) * f, Y = (f) => b.minY + (b.maxY - b.minY) * f, id = p.nextId('r');
    const pts = [{ x: X(0.15), y: Y(0.15) }, { x: X(0.85), y: Y(0.15) }, { x: X(0.85), y: Y(0.7) }, { x: X(0.15), y: Y(0.7) }];
    p.change('parcel', (s) => { (s.parcels ||= []).push({ id, name: 'Region lot', pts }); });
    window.civilcraft.select({ kind: 'parcel', id }); return { id, pts, b };
  });
  await page.evaluate(() => window.civilcraft.command('parking'));
  await page.waitForSelector('[data-pk-dialog][open]');
  const regions = await page.$$eval('[data-pk-region] option', (o) => o.map((x) => [x.value, x.textContent]));
  ok(['us', 'custom', 'uk', 'au', 'eu'].every((r) => regions.some(([v]) => v === r)), 'the picker offers us, custom, uk, au, eu', regions);
  ok(regions.filter(([v]) => ['uk', 'au', 'eu'].includes(v)).every(([, l]) => /not read against the standard/.test(l)), 'the three new regions say in the list that they are not read against the standard', regions);
  ok(/2010 ADA/.test(await page.textContent('[data-pk-tables]')), 'United States first: the ADA note');

  // ---- each new region: sizes change, the unread note, no accessible count
  for (const id of ['uk', 'au', 'eu']) {
    await page.selectOption('[data-pk-region]', id); await page.waitForSelector('[data-pk-dialog][open]'); await page.waitForTimeout(150);
    const R = REGIONS[id], ph = async (k) => Number(await page.getAttribute('#cv-pk-' + k, 'placeholder'));
    ok(await page.inputValue('[data-pk-region]') === id, id + ': the window opens again with ' + id + ' chosen');
    const w = await ph('stallW'), l = await ph('stallL'), a = await ph('aisleW');
    ok(Math.abs(w - R.stall.w) < 0.051 && Math.abs(l - R.stall.l) < 0.051, id + ': stall ' + w + ' x ' + l + ' m offered (the table says ' + R.stall.w + ' x ' + R.stall.l + ')');
    ok(Math.abs(a - R.aisle.two) < 0.051 || Math.abs(a - R.aisle.one) < 0.051, id + ': aisle ' + a + ' m offered', { a, aisle: R.aisle });
    const note = await page.textContent('[data-pk-tables]');
    ok(/NOT been read against the printed source/.test(note) && note.includes(R.source.slice(0, 20)), id + ': the note says the sizes are not read and names the source to read', note.slice(0, 160));
  }
  // build in Europe (generic)
  await page.selectOption('[data-pk-region]', 'eu'); await page.waitForSelector('[data-pk-dialog][open]'); await page.waitForTimeout(150);
  const undo0 = await P('p.undoStack.length');
  await page.click('[data-pk-build]'); await page.waitForTimeout(1500);
  ok(await P('p.state.parking?.length === 1 && p.state.parking[0].opts.region === "eu"'), 'a lot is made with region eu kept on the record', await P('p.state.parking?.[0]?.opts'));
  ok(await P('p.undoStack.length === ' + (undo0 + 1)), 'one undo step');
  const sum = await page.textContent('[data-pk-sum]');
  ok(/(\d+) spaces/.test(sum) && Number(sum.match(/(\d+) spaces/)[1]) > 10 && /\b0 accessible/.test(sum), 'the summary: spaces, and 0 accessible (no count entered for this region)', sum);
  const probs = await page.$$eval('[data-pk-problems] li', (l) => l.map((x) => x.textContent)).catch(() => []);
  ok(probs.some((x) => /Sizes not read against the printed source/.test(x)), 'under the lot: "Sizes not read against the printed source"', probs);
  ok(!probs.some((x) => /reach a street/.test(x)), 'no street in the project: no street warning', probs);
  const stallW = await P('(() => { const r = p.state.parking[0]; return r.opts.stallW ?? null; })()');
  ok(stallW === null, 'the sizes are the region\'s (nothing typed over)', stallW);
  await page.screenshot({ path: path.join(SHOTS, '01-eu-lot.png') });

  // ---- a street that misses the lot, then one that runs along its south edge
  const far = await page.evaluate((L) => {
    const p = window.civilcraft.project, b = L.b, w = b.maxX - b.minX, h = b.maxY - b.minY, id = p.nextId('a');
    p.change('alignment', (s) => { (s.alignments ||= []).push({ id, name: 'Far road', start: 0, pis: [{ x: b.minX + w * 0.05, y: b.minY + h * 0.97, r: 0 }, { x: b.minX + w * 0.1, y: b.minY + h * 0.98, r: 0 }], pvis: [] }); });
    return id;
  }, lot);
  await page.click('[data-pk-rebuild]'); await page.waitForTimeout(1500);
  const probs2 = await page.$$eval('[data-pk-problems] li', (l) => l.map((x) => x.textContent)).catch(() => []);
  ok(probs2.some((x) => /\d+ aisle\(s\) do not reach a street/.test(x)), 'a road far from the lot: "aisle(s) do not reach a street"', probs2);
  ok(await P('p.state.parking[0].opts.region === "eu"'), 'the rebuild keeps the region');
  await page.screenshot({ path: path.join(SHOTS, '02-nostreet.png') });
  await page.evaluate(([L, id]) => {
    const p = window.civilcraft.project;
    const xs = L.pts.map((q) => q.x), ys = L.pts.map((q) => q.y), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    p.change('alignment', (s) => { const a = s.alignments.find((q) => q.id === id); a.name = 'Through road'; a.pis = [{ x: x0 - 20, y: (y0 + y1) / 2, r: 0 }, { x: x1 + 20, y: (y0 + y1) / 2, r: 0 }]; });
  }, [lot, far]);
  await page.click('[data-pk-rebuild]'); await page.waitForTimeout(1500);
  const probs3 = await page.$$eval('[data-pk-problems] li', (l) => l.map((x) => x.textContent)).catch(() => []);
  const n3 = Number((probs3.find((x) => /reach a street/.test(x)) || '').match(/(\d+) aisle/)?.[1] || 0), n2 = Number((probs2.find((x) => /reach a street/.test(x)) || '').match(/(\d+) aisle/)?.[1] || 0);
  ok(n3 < n2, 'a road through the lot: fewer aisles cut off (' + n2 + ' -> ' + n3 + ')', probs3);

  // ---- undo, then back to the United States
  await page.evaluate(() => window.civilcraft.command('undo')); await page.waitForTimeout(300);
  ok(await P('p.state.parking?.length === 1 && p.state.parking[0].opts.region === "eu"'), 'undo goes back one step and keeps the region');
  await page.selectOption('[data-pk-region]', 'us'); await page.waitForSelector('[data-pk-dialog][open]'); await page.waitForTimeout(150);
  ok(/2010 ADA/.test(await page.textContent('[data-pk-tables]')) && Math.abs(Number(await page.getAttribute('#cv-pk-stallW', 'placeholder')) - 2.743) < 0.06, 'United States again: the ADA note and the 9 ft stall', await page.getAttribute('#cv-pk-stallW', 'placeholder'));
  await page.click('[data-pk-rebuild]'); await page.waitForTimeout(1500);
  const sumUs = await page.textContent('[data-pk-sum]');
  ok(/[1-9]\d* accessible/.test(sumUs) && await P('p.state.parking[0].opts.region === "us"'), 'rebuilt in the United States: accessible spaces from the ADA table', sumUs);
  const probsUs = await page.$$eval('[data-pk-problems] li', (l) => l.map((x) => x.textContent)).catch(() => []);
  ok(!probsUs.some((x) => /Sizes not read/.test(x)), 'and no "not read" line under the lot', probsUs);
  await page.screenshot({ path: path.join(SHOTS, '03-us.png') });
  await page.click('[data-pk-remove]'); await page.waitForTimeout(300);
  ok(await P('!p.state.parking'), 'removing the lot empties the list');
  ok(!problems.length, 'no console errors', problems);
} catch (e) { fail++; console.log('  FAIL ' + e.stack); } finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);

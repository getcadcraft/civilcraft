#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-acoustics.mjs — Room acoustics (0.8 EG.49), session bim-sim_PART_2, in the lab: headless, real clicks.
 *   node tools/bimcraft-test/browser-people.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin. Fails on any console error. Opens the showcase house.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const HOUSE = path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc');
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimacoustics'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
await ctx.addInitScript(() => { try { localStorage.setItem('bimcraft.model.units', 'm'); } catch (e) { /* none */ } });   // GH.3-A: results follow the display unit; these checks read metres
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const status = () => page.textContent('[data-status]');

try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', HOUSE);
  await waitStatus(/^Opened /, 90000);

  console.log('== Reverberation by band (EG.49)');
  await page.click('[data-eg49-details] summary');
  await page.waitForSelector('[data-eg49-rooms] tbody tr');
  const rows = await page.$$eval('[data-eg49-rooms] tbody tr', (r) => r.length);
  ok(rows >= 2, rows + ' rooms in the table');
  const mid0 = await page.textContent('[data-eg49-mid]');
  const t0 = Number(/is ([\d.]+) s/.exec(mid0)[1]);
  ok(t0 > 0.1 && t0 < 10, 'a mid-frequency time for the first room: ' + mid0);
  const cells = await page.$$eval('[data-eg49-answer] td', (c) => c.map((x) => Number(x.textContent)));
  ok(cells.length === 6 && cells.every((v) => v > 0), 'six octave bands: ' + cells.join(', '));
  await page.selectOption('[data-eg49-finish="floor"]', 'carpet');
  await page.selectOption('[data-eg49-finish="ceiling"]', 'ceiling-tile');
  const t1 = Number(/is ([\d.]+) s/.exec(await page.textContent('[data-eg49-mid]'))[1]);
  ok(t1 < t0, 'carpet and a tiled ceiling shorten it: ' + t0 + ' → ' + t1 + ' s');
  await page.fill('[data-eg49-field="target"]', '0.2');
  await page.keyboard.press('Tab');
  await page.waitForSelector('[data-eg49-rooms] tbody tr td:last-child');
  const over = await page.$$eval('[data-eg49-rooms] tbody tr', (r) => r.filter((x) => /over/.test(x.textContent)).length);
  ok(over >= 1, over + ' rooms marked over a 0.2 s target');
  await shot(page, 'acoustics-bands');

  console.log('== Listening');
  await page.click('[data-eg49-dry]');
  await waitStatus(/Playing the sound as it is/, 20000);
  await page.click('[data-eg49-room-play]');
  await waitStatus(/Playing the sound in/, 30000);
  ok(/Playing the sound in/.test(await status()), 'plays through the room: ' + await status());
  await page.click('[data-eg49-stop]');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('[data-eg49-save-ir]')]);
  const bytes = fs.readFileSync(await dl.path());
  ok(/^impulse-.*\.wav$/.test(dl.suggestedFilename()) && bytes.slice(0, 4).toString() === 'RIFF' && bytes.length > 44100, 'the impulse response saved as ' + dl.suggestedFilename() + ' (' + bytes.length + ' bytes)');
  const [dl2] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('[data-eg49-save-room]')]);
  ok(/^in-.*\.wav$/.test(dl2.suggestedFilename()), 'the voice in the room saved as ' + dl2.suggestedFilename());
  await page.selectOption('[data-eg49-sound]', 'music');
  await page.click('[data-eg49-room-play]');
  await waitStatus(/Playing the sound in/, 30000);
  await shot(page, 'acoustics-listen');

  console.log('== finishes from the model, people, source and listener (EG.49 round 3)');
  ok(/from the model|default/.test(await page.textContent('[data-eg49]')), 'each finish says where it came from');
  const rt0 = Number((await page.textContent('[data-eg49-answer] td:nth-child(4)')) || 0);
  await page.fill('[data-eg49-people]', '12');
  await page.keyboard.press('Tab');
  await page.waitForSelector('[data-eg49-extras]');
  ok(/12 people/.test(await page.textContent('[data-eg49-extras]')), 'twelve people in the room: ' + await page.textContent('[data-eg49-extras]'));
  const rt1 = Number((await page.textContent('[data-eg49-answer] td:nth-child(4)')) || 0);
  ok(rt0 > 0 && rt1 > 0 && rt1 < rt0, 'they shorten the room at 500 Hz (' + rt0 + ' → ' + rt1 + ' s)');
  await page.click('[data-eg49-place="src"]');
  await page.click('[data-eg49-plan]', { position: { x: 70, y: 88 } });
  await page.click('[data-eg49-place="lis"]');
  await page.click('[data-eg49-plan]', { position: { x: 170, y: 88 } });
  await page.waitForSelector('[data-eg49-placed]');
  ok(/Source to listener: [\d.]+ m/.test(await page.textContent('[data-eg49-placed]')), 'a source and a listener placed on the plan: ' + await page.textContent('[data-eg49-placed]'));
  const dl3 = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('[data-eg49-save-room]')]);
  ok(/^in-.*\.wav$/.test(dl3[0].suggestedFilename()), 'the sound from the placed source saved as ' + dl3[0].suggestedFilename());

  console.log('== ISO 3382-1 measures, a measured response, ISO 717 ratings (XE.3, dec-ind_PART_3)');
  await page.click('[data-eg49-measures]');
  await page.waitForSelector('[data-eg49-mtable]');
  const t30 = await page.$$eval('[data-eg49-m="t30-pred"] td', (c) => c.map((x) => Number(x.textContent)));
  ok(t30.length === 6 && t30.every((v) => v > 0 && v < 10), 'T30 per octave band from the computed response: ' + t30.join(', '));
  const wavPath = path.join(REPO, 'tmp/browser-acoustics-meas.wav');
  const sr = 44100, nn = sr * 2, pcm = Buffer.alloc(44 + nn * 2);
  pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + nn * 2, 4); pcm.write('WAVEfmt ', 8); pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(sr, 24); pcm.writeUInt32LE(sr * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(nn * 2, 40);
  let seed = 7; for (let i = 0; i < nn; i++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; pcm.writeInt16LE(Math.round((seed / 4294967296 - 0.5) * 2 * 30000 * Math.pow(10, -3 * (i / sr) / 1.2)), 44 + i * 2); }
  fs.mkdirSync(path.dirname(wavPath), { recursive: true }); fs.writeFileSync(wavPath, pcm);
  await page.setInputFiles('[data-eg49-meas-file]', wavPath);
  await page.waitForSelector('[data-eg49-m="t30-meas"]');
  const m30 = await page.$$eval('[data-eg49-m="t30-meas"] td', (c) => c.map((x) => Number(x.textContent)));
  ok(m30.length === 6 && m30.every((v) => Math.abs(v - 1.2) < 0.15), 'a measured 1.2 s response read back: ' + m30.join(', '));
  ok(await page.$('[data-eg49-m="t30-diff"]') !== null, 'a difference row sits under the measured one');
  fs.rmSync(wavPath, { force: true });
  await shot(page, 'acoustics-measures');
  await page.fill('[data-eg49-rvals]', '50 50 50 50 50 50 50 50 50 50 50 50 50 50 50 50');
  await page.click('[data-eg49-rate]');
  ok(/Rw = 50 dB/.test(await page.textContent('[data-eg49-rating]')), 'a flat 50 dB curve rates Rw 50: ' + await page.textContent('[data-eg49-rating]'));
  await page.selectOption('[data-eg49-rkind]', 'imp');
  await page.fill('[data-eg49-rvals]', '62 62 62 62 62 62 61 60 59 58 57 54 51 48 45 42');
  await page.click('[data-eg49-rate]');
  ok(/Ln,w = 58 dB/.test(await page.textContent('[data-eg49-rating]')), 'the impact reference curve rates Ln,w 58: ' + await page.textContent('[data-eg49-rating]'));
  await page.fill('[data-eg49-rvals]', '1 2 3');
  await page.click('[data-eg49-rate]');
  ok(/Sixteen numbers/.test(await page.textContent('[data-eg49-rating]')), 'too few values are refused in words');
  ok(/Critical frequency 2\d\d\d Hz/.test(await page.textContent('[data-eg49-mass]')), 'the mass law for a 12.5 mm board: ' + (await page.textContent('[data-eg49-mass]')).slice(0, 80));
  // XE.3 S2 / S6 (ind_PART_4): uneven absorption and room modes of a box room
  const row = (k) => page.$$eval('[data-eg49-u="' + k + '"] td', (tds) => tds.map((x) => Number(x.textContent)));
  const sab = await row('sabine'), eyr = await row('eyring'), fit = await row('fitzroy'), arau = await row('arau');
  ok(sab.length === 6 && fit.length === 6 && arau.length === 6, 'the uneven-absorption table has six bands for four methods');
  ok(arau.every((v, i) => v >= eyr[i] - 0.011), 'Arau-Puchades is not shorter than Eyring: ' + arau.join(', ') + ' vs ' + eyr.join(', '));
  await page.selectOption('[data-eg49-box-mat="bf"]', 'carpet'); await page.selectOption('[data-eg49-box-mat="bc"]', 'ceiling-board');
  ok(/Below about \d+ Hz/.test(await page.textContent('[data-eg49-schroeder]')), 'the Schroeder frequency is stated: ' + (await page.textContent('[data-eg49-schroeder]')).slice(0, 60));
  ok(/^\s*100 \d+/.test(await page.textContent('[data-eg49-modes]')) || /\d+ \d+(\.\d)? Hz/.test(await page.textContent('[data-eg49-modes]')), 'the lowest modes are listed: ' + (await page.textContent('[data-eg49-modes]')).slice(0, 60));
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
}
await browser.close();
for (const p of problems) { fail++; console.log('  FAIL ' + p); }
console.log(`\nbrowser-acoustics: ${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);

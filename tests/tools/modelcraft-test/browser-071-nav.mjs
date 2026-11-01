#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-071-nav.mjs — ModelCraft 0.7.1 rows 71.11, 71.17 and 71.12 in headless Chromium on /lab/modelcraft:
 *   71.11 Settings › ModelCraft › Orbit and pan (orbit about the cursor on by default, speed sliders), a middle-drag
 *         orbits about the box point under the cursor
 *   71.17 Shift pressed during a middle-drag orbit pans, let go orbits again (same drag)
 *   71.12 Faces picked with the mouse hands the keys back to the view (arrow keys / "x" no longer switch it to X-ray);
 *         X-ray on says how to turn it off
 *
 *   node tools/modelcraft-test/browser-071-nav.mjs [--out <dir>] [--admin-down]
 * Run as root (ModelCraft's test admin via tools/modelcraft-test/admin.php, shared with other builders). Shots in tmp/shots/mc-071-nav.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/mc-071-nav')));
const STATE = path.join(REPO, 'tmp/mc-071-nav-browser-state.json');
fs.mkdirSync(OUT, { recursive: true });

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/modelcraft-test/admin.php');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

let pass = 0, fail = 0;
const ok = (c, what, detail = '') => { if (c) { pass++; console.log('  ok    ' + what + (detail ? ' (' + detail + ')' : '')); } else { fail++; console.log('  FAIL  ' + what + (detail ? ' — ' + detail : '')); } };

async function signedInContext(opts) {
  const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
  const c = await browser.newContext({ ...opts, acceptDownloads: true });
  const p = await c.newPage();
  await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', admin.email);
  await p.fill('input[name="password"]', admin.password);
  await Promise.all([p.waitForNavigation(), p.click('form button[type="submit"]')]);
  await p.close();
  return c;
}

/** A box on the ground (so the Render workspace opens). */
const box = (page) => page.evaluate(async () => {
  const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
  const url = Object.entries(map).find(([k]) => /\/modelcraft\/dev\/model\.js/.test(k))?.[1];
  const M = await import(url);
  const mc = window.modelcraft, m = mc.model;
  m.change('box', (mm) => {
    M.addPolygon(mm.root, M.rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 4, 3));
    const f = [...mm.root.faces.keys()].pop();
    M.pushPull(mm.root, f, 2.5);
  });
  mc.cam.fit(m.bbox(), [-0.62, -1, 0.2]);
  mc.afterHistory();
});

const rectOf = (page, sel) => page.$eval(sel, (n) => { const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
/** Screen point of a world point, and the view direction (for "it orbited" vs "it panned"). */
const scr = (page, p) => page.evaluate((p) => window.modelcraft.cam.project(p).slice(0, 2), p);
const dirOf = (page) => page.evaluate(() => { const c = window.modelcraft.cam, d = c.target.map((x, i) => x - c.eye[i]), l = Math.hypot(...d); return d.map((x) => x / l); });
const ang = (a, b) => Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));

try {
  const ctx = await signedInContext({ viewport: { width: 1280, height: 820 }, locale: 'en-US' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/WebGPU|webgpu|GPU/.test(m.text())) errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.modelcraft?.model);
  await page.evaluate(() => { try { localStorage.removeItem('modelcraft.settings'); } catch {} });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.modelcraft?.model);
  await box(page);
  const over = await rectOf(page, '[data-over]');

  // ---- 71.11: Settings › ModelCraft › Orbit and pan ----
  await page.keyboard.press('Control+Comma');
  await page.waitForSelector('[data-app-settings][open]');
  await page.click('[data-app-settings] [data-settings-tab="app"]').catch(() => {});
  const on = await page.$eval('[data-app-settings] input[name="mcOrbitAt"]', (n) => n.checked);
  ok(on, '71.11: "Orbit about what is under the cursor" is on by default');
  await page.$eval('[data-app-settings] input[name="mcOrbitSpeed"]', (n) => { n.value = '2'; n.dispatchEvent(new Event('input', { bubbles: true })); });
  ok(await page.evaluate(() => window.modelcraft.cam.orbitSpeed === 2 && JSON.parse(localStorage.getItem('modelcraft.settings')).orbitSpeed === 2), '71.11: the orbit speed slider sets the camera and is kept');
  ok((await page.textContent('[data-app-settings] [data-mc-out="orbitSpeed"]')).includes('2.00'), '71.11: the slider shows its value');
  await page.$eval('[data-app-settings] input[name="mcOrbitSpeed"]', (n) => { n.value = '1'; n.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.screenshot({ path: path.join(OUT, 'settings-orbit.png') });
  await page.keyboard.press('Escape');

  // ---- 71.11: a middle-drag orbits about the box point under the cursor ----
  const P = [3, 0, 1.5];   // on the box's front face
  const s0 = await scr(page, P), d0 = await dirOf(page);
  await page.mouse.move(over.x + s0[0], over.y + s0[1]);
  await page.mouse.down({ button: 'middle' });
  for (let i = 1; i <= 6; i++) await page.mouse.move(over.x + s0[0] + i * 12, over.y + s0[1] + i * 5);
  const s1 = await scr(page, P), d1 = await dirOf(page);
  ok(ang(d0, d1) > 0.1 && Math.hypot(s1[0] - s0[0], s1[1] - s0[1]) < 1, '71.11: middle-drag orbits and the point under the cursor stays put', `moved ${Math.hypot(s1[0] - s0[0], s1[1] - s0[1]).toFixed(3)} px`);
  // ---- 71.17: Shift pressed during the same drag pans, let go orbits again ----
  await page.keyboard.down('Shift');
  for (let i = 1; i <= 5; i++) await page.mouse.move(over.x + s0[0] + 72 + i * 10, over.y + s0[1] + 30);
  const d2 = await dirOf(page), s2 = await scr(page, P);
  ok(ang(d1, d2) < 1e-6 && Math.abs(s2[0] - (s0[0] + 50)) < 1, '71.17: Shift mid-drag pans (view direction kept, the point follows the cursor)', `turn ${ang(d1, d2).toExponential(1)} rad, x ${s2[0].toFixed(1)} vs ${(s0[0] + 50).toFixed(1)}`);
  await page.keyboard.up('Shift');
  for (let i = 1; i <= 4; i++) await page.mouse.move(over.x + s0[0] + 122 + i * 10, over.y + s0[1] + 30);
  ok(ang(d2, await dirOf(page)) > 0.05, '71.17: Shift let go: orbiting again in the same drag');
  await page.mouse.up({ button: 'middle' });

  // ---- 71.12: Faces picked with the mouse gives the keys back to the view ----
  await page.click('[data-style-mode]');
  await page.selectOption('[data-style-mode]', 'wire');
  ok(await page.evaluate(() => document.activeElement === document.querySelector('[data-over]') && window.modelcraft.view.style.mode === 'wire'), '71.12: after picking Wire with the mouse the view has the focus');
  const d3 = await dirOf(page);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('x');
  ok(await page.evaluate(() => window.modelcraft.view.style.mode === 'wire') && ang(d3, await dirOf(page)) > 1e-6, '71.12: the next arrow key orbits and "x" does not switch the faces to X-ray');
  await page.click('[data-style-mode]');
  await page.selectOption('[data-style-mode]', 'xray');
  ok(/X-ray/.test(await page.textContent('[data-msg]')), '71.12: turning X-ray on says how to turn it off');
  await page.selectOption('[data-style-mode]', 'shaded');
  await page.screenshot({ path: path.join(OUT, 'after.png') });
  ok(!errs.length, 'no console errors', errs.join(' | '));
} finally {
  await browser.close();
  if (process.argv.includes('--admin-down')) { try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch {} }
  if (fs.existsSync(STATE)) fs.unlinkSync(STATE);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

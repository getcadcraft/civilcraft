#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-071.mjs — ModelCraft 0.7.1 rows 71.1, 71.2 and 71.13 in headless Chromium on /lab/modelcraft:
 *   71.1  the Render workspace's notes sit in the side panel (never over the toolbar), the long note can be put away and
 *         stays away, and the toolbar under it takes clicks
 *   71.2  "Render in the view" prints no "null" (the region line when no region is drawn)
 *   71.13 Model info… (units, location, display, rendering, about, components, statistics, file) and Preferences…
 *         (the Settings dialog on its ModelCraft tab, with New models): edits reach the model, the about text and the
 *         rest travel in the .modelcraft file and come back on open; an old file without them opens with none.
 *
 *   node tools/modelcraft-test/browser-071.mjs [--out <dir>] [--admin-down]
 * Run as root (ModelCraft's test admin via tools/modelcraft-test/admin.php; other builders share it, so it is left
 * signed up unless --admin-down). Shots in tmp/shots/mc-071.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/mc-071')));
const STATE = path.join(REPO, 'tmp/mc-071-browser-state.json');
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
const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

try {
  const ctx = await signedInContext({ viewport: { width: 1280, height: 820 }, locale: 'en-US' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/WebGPU|webgpu|GPU/.test(m.text())) errs.push(m.text()); });
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.modelcraft?.model);
  await page.evaluate(() => { try { localStorage.removeItem('modelcraft.renderHint'); localStorage.removeItem('modelcraft.template'); } catch {} });
  await box(page);

  // ---- 71.1 + 71.2: the Render workspace's panel ----
  await page.evaluate(() => window.modelcraft.setWorkspace('render'));
  await page.waitForSelector('[data-ws-panel="render"]');
  await page.waitForTimeout(800);
  const panel = await page.evaluate(() => {
    const p = document.querySelector('[data-ws-panel="render"]');
    const kids = [...p.querySelectorAll('p, label')].map((n) => ({ pos: getComputedStyle(n).position, text: n.textContent }));
    return { text: p.textContent, kids, hints: p.querySelectorAll('.mc-hint').length };
  });
  ok(!/\bnull\b/.test(panel.text), '71.2: "Render in the view" prints no "null"', panel.text.slice(0, 160));
  ok(panel.hints === 0 && panel.kids.every((k) => k.pos === 'static'), '71.1: the panel\'s notes are ordinary paragraphs (not the floating stage hint)', panel.kids.map((k) => k.pos).join(','));
  const tb = await rectOf(page, '.mc-tools');
  const noteRects = await page.$$eval('[data-ws-panel="render"] p', (ns) => ns.map((n) => { const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }));
  const aside = await rectOf(page, '.mc-right');
  ok(noteRects.length && noteRects.every((r) => !overlaps(r, tb)), '71.1: no note of the Render panel covers the toolbar');
  ok(noteRects.every((r) => r.x >= aside.x - 1 && r.x + r.w <= aside.x + aside.w + 1), '71.1: the notes stay inside the side panel');
  await page.screenshot({ path: path.join(OUT, '01-render-panel.png') });
  // the toolbar under where the note used to float takes the click (File › Open)
  const openBtn = await rectOf(page, '.mc-tools [data-act="open"]');
  const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('[data-act]')?.dataset.act || '', { x: openBtn.x + openBtn.w / 2, y: openBtn.y + openBtn.h / 2 });
  ok(hit === 'open', '71.1: the toolbar button is the thing under the pointer', hit);
  // the long note can be put away, and it stays away (re-render, leaving and coming back, reload)
  const hasClose = await page.$('[data-ipr-hint-close]');
  ok(!!hasClose, '71.1: the long note has a close button');
  if (hasClose) {
    await page.click('[data-ipr-hint-close]');
    await page.waitForTimeout(200);
    ok(!(await page.$('[data-ipr-hint]')), '71.1: closed, the note is gone');
    await page.evaluate(() => window.modelcraft.setWorkspace('model'));
    await page.evaluate(() => window.modelcraft.setWorkspace('render'));
    await page.waitForSelector('[data-ws-panel="render"]');
    ok(!(await page.$('[data-ipr-hint]')), '71.1: it stays closed when the workspace opens again');
    ok(!!(await page.$('[data-ipr-hint-show]')), '71.1: a small link brings it back');
    await page.click('[data-ipr-hint-show]');
    await page.waitForTimeout(200);
    ok(!!(await page.$('[data-ipr-hint]')), '71.1: …and it does');
  }
  // the region note is the mode's instruction and shows while the mode is on
  await page.evaluate(() => window.modelcraft.setWorkspace('model'));
  ok(!(await page.$('[data-ws-panel="render"]')), '71.1: leaving the workspace clears its panel');

  // ---- 71.13: Model info ----
  const hasMenu = await page.$('[data-model-menu]');
  ok(!!hasMenu, '71.13: a Model menu in the File group');
  if (hasMenu) {
    await page.evaluate(() => { document.querySelector('[data-model-menu]').open = true; });
    await page.click('[data-act="model-info"]');
    await page.waitForSelector('[data-model-info][open]');
    const secs = await page.$$eval('[data-model-info] [data-mi-tab]', (ns) => ns.map((n) => n.dataset.miTab));
    ok(['units', 'location', 'display', 'rendering', 'about', 'components', 'stats', 'file'].every((s) => secs.includes(s)), '71.13: Model info has its sections', secs.join(','));
    await page.screenshot({ path: path.join(OUT, '02-model-info-units.png') });
    // units: the same choice as the status bar's
    await page.selectOption('[data-model-info] [data-mi-units]', 'mm');
    ok(await page.evaluate(() => window.modelcraft.model.units === 'mm' && document.querySelector('[data-units]').value === 'mm'), '71.13: Units change the model and the status bar picker');
    // location: the sun's place
    await page.click('[data-mi-tab="location"]');
    await page.fill('[data-mi-lat]', '51.5');
    await page.fill('[data-mi-lon]', '-0.12');
    await page.fill('[data-mi-tz]', '0');
    await page.dispatchEvent('[data-mi-tz]', 'change');
    const sun = await page.evaluate(() => window.modelcraft.view.style.sun);
    ok(sun.lat === 51.5 && sun.lon === -0.12 && sun.tz === 0, '71.13: Location sets the sun\'s latitude, longitude and time zone', JSON.stringify(sun));
    ok(await page.evaluate(() => document.querySelector('[data-sun-lat]').value === '51.5'), '71.13: …the Style panel shows the same place');
    // display
    await page.click('[data-mi-tab="display"]');
    await page.selectOption('[data-mi-mode]', 'hidden');
    ok(await page.evaluate(() => window.modelcraft.view.style.mode === 'hidden'), '71.13: Display sets the face style');
    await page.selectOption('[data-mi-mode]', 'shaded');
    // about: saved in the file
    await page.click('[data-mi-tab="about"]');
    await page.fill('[data-mi-author]', 'Ana Test');
    await page.fill('[data-mi-org]', 'Test Studio');
    await page.fill('[data-mi-desc]', 'A box for 0.7.1.');
    await page.dispatchEvent('[data-mi-desc]', 'change');
    ok(await page.evaluate(() => window.modelcraft.model.dirty === true), '71.13: an About edit is an unsaved change');
    // statistics
    await page.click('[data-mi-tab="stats"]');
    const faces = await page.$eval('[data-mi-stat="faces"]', (n) => n.textContent.trim());
    ok(faces === '6', '71.13: Statistics count the box\'s faces', faces);
    await page.click('[data-mi-tab="file"]');
    const fv = await page.$eval('[data-mi-file-version]', (n) => n.textContent.trim());
    ok(fv === '1', '71.13: File says which file version Save writes', fv);
    await page.screenshot({ path: path.join(OUT, '03-model-info-file.png') });
    await page.click('[data-model-info] [data-mi-close]');
    // the file keeps it all; opening it brings it back
    const text = await page.evaluate(() => window.modelcraft.fileText());
    const j = JSON.parse(text);
    ok(j.info && j.info.author === 'Ana Test' && j.info.org === 'Test Studio' && j.info.description === 'A box for 0.7.1.' && j.units === 'mm' && j.view.style.sun.lat === 51.5 && j.version === 1,
      '71.13: the .modelcraft file keeps the about text (info), units and location; the file version is unchanged', JSON.stringify(j.info));
    const f1 = path.join(OUT, 'info.modelcraft');
    fs.writeFileSync(f1, text);
    await page.evaluate(() => { window.modelcraft.model.dirty = false; });
    await page.click('[data-act="new"]');
    await page.waitForFunction(() => window.modelcraft.model.root.faces.size === 0);
    await page.setInputFiles('[data-file-open]', f1);
    await page.waitForFunction(() => window.modelcraft.model.root.faces.size === 6);
    await page.evaluate(() => { document.querySelector('[data-model-menu]').open = true; });
    await page.click('[data-act="model-info"]');
    await page.click('[data-mi-tab="about"]');
    const shown = await page.evaluate(() => [...document.querySelectorAll('[data-mi-author], [data-mi-desc]')].map((x) => x.value));
    ok(shown.join('|') === 'Ana Test|A box for 0.7.1.', '71.13: reopened, Model info shows the file\'s about text', shown.join('|'));
    await page.click('[data-model-info] [data-mi-close]');
    // an old file (no info) opens with none; untrusted info is cleaned
    delete j.info;
    j.info = { author: 'x'.repeat(5000), description: 42, org: ['no'] };
    fs.writeFileSync(f1, JSON.stringify(j));
    await page.evaluate(() => { window.modelcraft.model.dirty = false; });
    await page.setInputFiles('[data-file-open]', f1);
    await page.waitForTimeout(400);
    const back = JSON.parse(await page.evaluate(() => window.modelcraft.fileText()));
    ok(back.info && back.info.author.length <= 200 && !('description' in back.info) && !('org' in back.info), '71.13: info from a file is checked (lengths, kinds)', JSON.stringify(back.info).slice(0, 80));
    delete j.info;
    fs.writeFileSync(f1, JSON.stringify(j));
    await page.evaluate(() => { window.modelcraft.model.dirty = false; });
    await page.setInputFiles('[data-file-open]', f1);
    await page.waitForTimeout(400);
    ok(!('info' in JSON.parse(await page.evaluate(() => window.modelcraft.fileText()))), '71.13: a file without info opens and saves without it');
    fs.unlinkSync(f1);

    // ---- Preferences: the Settings dialog on ModelCraft's tab, with New models ----
    await page.evaluate(() => { document.querySelector('[data-model-menu]').open = true; });
    await page.click('[data-act="preferences"]');
    await page.waitForSelector('[data-app-settings][open]');
    const tab = await page.$eval('[data-app-settings] [data-settings-tab="app"]', (n) => n.getAttribute('aria-selected'));
    ok(tab === 'true', '71.13: Preferences… opens Settings on the ModelCraft tab');
    ok(!!(await page.$('[data-app-settings] [data-mc-template-save]')), '71.13: Preferences has New models');
    await page.evaluate(() => { const d = document.querySelector('[data-app-settings]'); d.ccShowSetting?.(d.querySelector('[data-mc-template]')); });
    await page.click('[data-app-settings] [data-mc-template-save]');
    const tpl = await page.evaluate(() => JSON.parse(localStorage.getItem('modelcraft.template') || 'null'));
    ok(tpl && tpl.units === 'mm' && tpl.sun.lat === 51.5, '71.13: "Use this model\'s" keeps units, display and location for new models', JSON.stringify(tpl));
    await page.screenshot({ path: path.join(OUT, '04-preferences.png') });
    await page.keyboard.press('Escape');
    await page.evaluate(() => { window.modelcraft.model.dirty = false; window.modelcraft.model.units = 'in'; });
    await page.click('[data-act="new"]');
    await page.waitForTimeout(200);
    ok(await page.evaluate(() => window.modelcraft.model.units === 'mm' && window.modelcraft.view.style.sun.lat === 51.5), '71.13: a new model starts from it');
    await page.evaluate(() => { document.querySelector('[data-model-menu]').open = true; });
    await page.click('[data-act="preferences"]');
    await page.waitForSelector('[data-app-settings][open]');
    await page.evaluate(() => { const d = document.querySelector('[data-app-settings]'); d.ccShowSetting?.(d.querySelector('[data-mc-template]')); });
    await page.click('[data-app-settings] [data-mc-template-clear]');
    ok(await page.evaluate(() => localStorage.getItem('modelcraft.template') === null), '71.13: "Forget" goes back to the built-in start');
    await page.keyboard.press('Escape');
  }
  ok(!errs.length, 'no console errors', errs.join(' | '));
} finally {
  await browser.close();
  if (process.argv.includes('--admin-down')) { try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch {} }
  if (fs.existsSync(STATE)) fs.unlinkSync(STATE);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

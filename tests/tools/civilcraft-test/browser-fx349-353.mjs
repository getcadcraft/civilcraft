#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fx349-353.mjs — civil-11, 0.11: FX.349 (Settings > Global > Add-ons visible and clickable at 1600 x 900), FX.350 (the Swept path button
 * shows with an alignment's and a feature line's own actions, not inside the folded "Sample lines"), FX.353 (Ctrl+, opens Settings after wheel,
 * pad swipe and pinch input). Real /lab page, headless Chromium, 1600 x 900.   Run as root: nice -n 10 timeout 300 node tools/civilcraft-test/browser-fx349-353.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cv11'], { encoding: 'utf8' }) || '{}');
admin('up'); const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus-off-never', '1'); } catch { /* */ } });
  const page = await ctx.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto('https://getcadcraft.com/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  await page.evaluate(() => { window.civilcraft.project.change('units', (s) => { s.units = 'm'; }); window.civilcraft.command('fit'); });
  const dlgOpen = () => page.evaluate(() => !!document.querySelector('dialog.shell-settings')?.open);

  // ---- FX.349
  await page.keyboard.press('Control+,'); await page.waitForTimeout(300);
  await page.click('dialog.shell-settings [role=tab]:has-text("Global")'); await page.waitForTimeout(300);
  const nav = await page.evaluate(() => {
    const d = document.querySelector('dialog.shell-settings'), dr = d.getBoundingClientRect();
    const b = [...d.querySelectorAll('.shell-sec-nav button')].find((x) => x.offsetParent && /^Add-ons$/.test(x.textContent.trim()));
    const r = b && b.getBoundingClientRect();
    return { found: !!b, top: r?.top, bottom: r?.bottom, dlgBottom: dr.bottom, last: [...d.querySelectorAll('.shell-sec-nav button')].filter((x) => x.offsetParent).slice(-1)[0]?.getBoundingClientRect().bottom };
  });
  ok(nav.found && nav.bottom <= nav.dlgBottom, 'Global > Add-ons is inside the dialog without scrolling', nav);
  ok(nav.last <= nav.dlgBottom, 'every Global entry is inside the dialog', nav);
  const cx = await page.evaluate(() => { const b = [...document.querySelectorAll('dialog.shell-settings .shell-sec-nav button')].find((x) => x.offsetParent && /^Add-ons$/.test(x.textContent.trim())); const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  await page.mouse.click(cx[0], cx[1]); await page.waitForTimeout(300);
  ok(await dlgOpen(), 'clicking the Add-ons entry keeps the dialog open');
  ok(await page.evaluate(() => [...document.querySelectorAll('dialog.shell-settings .shell-sec-nav button[aria-current="true"]')].some((b) => /^Add-ons$/.test(b.textContent.trim()))), 'Add-ons is the current section');
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);

  // ---- FX.350
  const aid = await page.evaluate(() => {
    const p = window.civilcraft.project, b = p.eg().surface.bounds, X = (f) => b.minX + (b.maxX - b.minX) * f, Y = (f) => b.minY + (b.maxY - b.minY) * f, id = p.nextId('a');
    p.change('alignment', (s) => { s.alignments.push({ id, name: 'Main St', start: 0, pis: [{ x: X(0.1), y: Y(0.5), r: 0 }, { x: X(0.9), y: Y(0.5), r: 0 }], pvis: [] }); });
    window.civilcraft.select({ kind: 'alignment', id });
    return id;
  });
  await page.waitForTimeout(400);
  const swVis = () => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Swept path/i.test(x.textContent)); if (!b) return 'none'; const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 && b.offsetParent !== null; });
  ok(await swVis() === true, 'alignment selected: the Swept path button is visible with no fold opened');
  await page.evaluate(() => { const p = window.civilcraft.project; const id = p.nextId('f'); p.change('line', (s) => { s.features.push({ id, name: 'Edge', pts: [{ x: 130, y: 250, z: 104 }, { x: 290, y: 250, z: 104 }], closed: false, use: 'off' }); }); window.civilcraft.select({ kind: 'feature', id }); });
  await page.waitForTimeout(400);
  ok(await swVis() === true, 'feature line selected: the Swept path button is visible with no fold opened');

  // ---- FX.353
  const box = await page.evaluate(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
  const tryKey = async (label) => { await page.keyboard.press('Control+,'); await page.waitForTimeout(250); const o = await dlgOpen(); ok(o, 'Ctrl+, opens Settings ' + label); if (o) { await page.keyboard.press('Control+,'); await page.waitForTimeout(250); } };
  await page.mouse.move(box[0], box[1]); await page.mouse.click(box[0], box[1]);
  await page.mouse.wheel(0, -120); await tryKey('after a wheel zoom');
  await page.mouse.wheel(2, -7.5); await tryKey('after a pad swipe');
  await page.keyboard.down('Control'); await page.mouse.wheel(0, -10); await page.keyboard.up('Control'); await tryKey('after a Ctrl+wheel pinch');
  // ---- CV.3 help: the profile and sections topics say what lock, slope, pick, zoom, snap, measure and the volume basis do (the real help panel)
  const topicText = async (slug) => {
    await page.evaluate((sl) => window.cadcraftHelp.open(sl), slug); await page.waitForTimeout(900);
    const t = await page.evaluate(() => document.querySelector('[data-help-panel]')?.innerText || '');
    await page.evaluate(() => window.cadcraftHelp.close()); await page.waitForTimeout(200);
    return t;
  };
  const prof = await topicText('profile'), sec = await topicText('sections');
  ok(/Slope %/.test(prof) && /Lock/.test(prof) && /Pick/.test(prof) && /Snap/.test(prof) && /Zoom and pan the profile/.test(prof), 'help topic "Design a vertical profile" describes slope, lock, pick, snap, zoom', prof.slice(0, 120));
  ok(/Measure in a section/.test(sec) && /Volumes measured to/.test(sec) && /Zoom and pan/.test(sec), 'help topic "Sample lines and cross sections" describes measure, the volume basis, zoom', sec.slice(0, 120));
  ok(problems.length === 0, 'no page errors', problems);
} finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

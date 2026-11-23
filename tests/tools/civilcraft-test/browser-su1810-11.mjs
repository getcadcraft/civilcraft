#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-su1810-11.mjs — civil-11, 0.11 SU.1810 in the real /lab page: the Utility run tool draws a run on the plan point by point (menu item, clicks, Enter;
 * one undo step; saved in the project), and the profile view shows the run where it crosses the selected alignment, as a bar at its station with its name.
 *   Run as root: nice -n 10 timeout 400 node tools/civilcraft-test/browser-su1810-11.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-su1810-11'); fs.mkdirSync(SHOTS, { recursive: true });
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
  const page = await ctx.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text().slice(0, 200)); });
  await page.goto('https://getcadcraft.com/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  await page.evaluate(() => { window.civilcraft.project.change('units', (s) => { s.units = 'm'; }); window.civilcraft.command('fit'); });
  await page.waitForTimeout(400);
  const aid = await page.evaluate(() => {
    const p = window.civilcraft.project, b = p.eg().surface.bounds, X = (f) => b.minX + (b.maxX - b.minX) * f, Y = (f) => b.minY + (b.maxY - b.minY) * f, id = p.nextId('a');
    p.change('alignment', (s) => { s.alignments.push({ id, name: 'Main St', start: 0, pis: [{ x: X(0.1), y: Y(0.5), r: 0 }, { x: X(0.9), y: Y(0.5), r: 0 }], pvis: [] }); });
    return id;
  });
  // the tool: from the plan's own geometry, two clicks across the alignment (north of it to south of it), Enter
  const sc = await page.evaluate(() => { const v = window.civilcraft.view, p = window.civilcraft.project, b = p.eg().surface.bounds, mx = (b.minX + b.maxX) / 2, my = (b.minY + b.maxY) / 2, h = (b.maxY - b.minY) * 0.3; const r = document.querySelector('[data-over]').getBoundingClientRect(); const a = v.toScreen(mx, my + h), c = v.toScreen(mx, my - h); return { a: [r.x + a.x, r.y + a.y], c: [r.x + c.x, r.y + c.y] }; });
  await page.evaluate(() => window.civilcraft.command('util-run'));
  ok(await page.evaluate(() => document.querySelector('[data-cmd="util-run"]')?.getAttribute('aria-checked') === 'true' || document.querySelector('[data-cmd="util-run"]')?.getAttribute('aria-pressed') === 'true'), 'the Utility run menu item shows as on');
  ok(/Utility run/.test(await page.evaluate(() => document.querySelector('[data-toolhint]')?.textContent || '')), 'the hint line names the tool');
  await page.mouse.click(sc.a[0], sc.a[1]); await page.waitForTimeout(150);
  await page.mouse.click(sc.c[0], sc.c[1]); await page.waitForTimeout(150);
  await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  const runs = await page.evaluate(() => window.civilcraft.project.state.utilities?.runs || []);
  ok(runs.length === 1 && runs[0].service === 'water' && runs[0].source === 'drawn' && runs[0].pts.length === 2, 'two clicks and Enter make one drawn water run', runs);
  ok(await page.evaluate(() => { const p = window.civilcraft.project, u = p.state.utilities.runs[0]; return u.pts[0].y > u.pts[1].y && Number.isFinite(u.pts[0].x); }), 'the run starts north and ends south, where the clicks were (a click may snap to a point or line)');
  ok(await page.evaluate(() => document.querySelector('[data-cmd="util-run"]')?.getAttribute('aria-checked') !== 'true'), 'the tool is off again after the run');
  await page.evaluate(() => window.civilcraft.project.undo());
  ok(await page.evaluate(() => !(window.civilcraft.project.state.utilities?.runs || []).length), 'one undo removes the whole run');
  await page.evaluate(() => window.civilcraft.project.redo());
  ok(await page.evaluate(() => window.civilcraft.project.state.utilities?.runs?.length === 1), 'redo brings it back');
  const saved = await page.evaluate(() => JSON.stringify(window.civilcraft.project.toJSON()));
  ok(/"utilities"/.test(saved) && /"drawn"/.test(saved), 'the run is in the saved project');

  // the profile
  await page.evaluate((id) => { window.civilcraft.select({ kind: 'alignment', id }); window.civilcraft.command('profile'); }, aid);
  await page.waitForTimeout(800);
  const pv = await page.evaluate(() => { const d = window.civilcraft.pview.data; return d && { n: (d.utilities || []).length, u: (d.utilities || []).map((x) => ({ name: x.name, service: x.service, sta: Math.round(x.sta), top: x.top, bottom: x.bottom, size: x.size })) }; });
  ok(pv && pv.n === 1 && pv.u[0].service === 'water' && pv.u[0].top !== null && pv.u[0].bottom < pv.u[0].top, 'the profile data holds the crossing with a top and a bottom', pv);
  const color = await page.evaluate(() => { const v = window.civilcraft.pview, d = v.data.utilities[0], s = v.toScreen(d.sta, (d.top + d.bottom) / 2), c = v.cv.getContext('2d'), r = v.dpr || 1, px = c.getImageData(Math.round(s.x * r), Math.round(s.y * r), 1, 1).data; return [px[0], px[1], px[2]]; });
  ok(color[2] > 150 && color[0] < 120, 'the bar is drawn in the water blue at the crossing', color);
  await page.screenshot({ path: path.join(SHOTS, 'profile.png') });
  ok(problems.length === 0, 'no page errors', problems);
} finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

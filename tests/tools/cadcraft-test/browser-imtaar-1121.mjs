#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-imtaar-1121.mjs — three CadCraft lab fixes from one member's email (2026-11-21), headless, in the layout he uses (PRO-cad1 Ribbon)
 * and the others:
 *   - Choose snaps (the chevron at the end of the status bar) opens the Object snaps list on the screen, every box visible and clickable
 *     (the workspace status bar clips, and app-popfit.js had cut it to 64 px below the window);
 *   - dragging the top edge of the command window shows more history lines in the Pro skin layouts (the skin's fixed height won);
 *   - WALLDIM (Edit by dimension) in a feet-and-inches drawing shows the value in feet and inches and takes 14'-10" typed.
 *
 *   node tools/cadcraft-test/browser-imtaar-1121.mjs [--shots <dir>]      (run as root; test admin session)
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
const problems = [];

async function open(layout, viewport = { width: 1366, height: 768 }) {
  const ctx = await browser.newContext({ viewport, serviceWorkers: 'block' });
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript((l) => { try { localStorage.setItem('cadcraft.tour', 'skipped'); localStorage.setItem('cc-newhere', 'skipped'); localStorage.setItem('cc-tours', 'off'); localStorage.setItem('cc-autofocus', 'off'); localStorage.setItem('cc-fit', 'never'); localStorage.removeItem('cadcraft.cmdline');
    if (l) localStorage.setItem('cc-workspace', l); else localStorage.removeItem('cc-workspace'); } catch {} }, layout);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(layout + ' console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push(layout + ' pageerror: ' + e.message));
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.cadcraft.commands);
  await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  return { ctx, page };
}

try {
  for (const layout of [null, 'pro-cad1', 'pro-cad2', 'docked', 'duncan', 'toolbox']) {
    const name = layout || 'default';
    console.log('\n== ' + name + ': Choose snaps, history lines');
    const { ctx, page } = await open(layout);
    const shot = async (n) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '-' + n + '.png') }); };
    await page.click('.cc-snapkinds summary');
    await page.waitForTimeout(300);
    const s = await page.evaluate(() => {
      const d = document.querySelector('.cc-snapkinds'), boxes = [...d.querySelectorAll('[data-snap-kinds] input')];
      const vis = boxes.filter((b) => { const r = b.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth) return false; const h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return h === b || h?.closest('label')?.contains(b); });
      const f = d.querySelector('[data-snap-kinds]').getBoundingClientRect();
      const xs = new Set(boxes.map((b) => Math.round(b.getBoundingClientRect().x)));
      return { open: d.open, n: boxes.length, visible: vis.length, column: xs.size === 1, box: [Math.round(f.x), Math.round(f.y), Math.round(f.width), Math.round(f.height)] };
    });
    ok(s.open && s.n === 10 && s.visible === 10 && s.column, name + ': Choose snaps opens the list with all ten snaps on the screen, clickable, one under another', JSON.stringify(s));
    await shot('snaps');
    // a click on a box changes the setting
    const before = await page.evaluate(() => document.querySelectorAll('[data-snap-kinds] input')[6].checked);
    await page.click('[data-snap-kinds] label:nth-of-type(7)');
    const after = await page.evaluate(() => document.querySelectorAll('[data-snap-kinds] input')[6].checked);
    ok(before !== after, name + ': clicking Tangent in the list changes it');
    await page.click('[data-snap-kinds] label:nth-of-type(7)');
    await page.mouse.click(700, 400); await page.waitForTimeout(150);
    ok(!(await page.evaluate(() => document.querySelector('.cc-snapkinds').open)), name + ': a click elsewhere closes it');

    const sz = await page.$('[data-cmd-size]');
    const b = await sz.boundingBox(); const x = b.x + b.width / 3, y = b.y + b.height / 2;
    const h0 = await page.evaluate(() => Math.round(document.querySelector('.cc-history').getBoundingClientRect().height));
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x, y - 60, { steps: 6 }); await page.mouse.move(x, y - 120, { steps: 6 }); await page.mouse.up();
    await page.waitForTimeout(250);
    const h1 = await page.evaluate(() => Math.round(document.querySelector('.cc-history').getBoundingClientRect().height));
    ok(h1 > h0 + 60, name + ': dragging the command window\'s top edge up 120 px shows more history (' + h0 + ' → ' + h1 + ' px)');
    await shot('history');
    await page.evaluate(() => localStorage.removeItem('cadcraft.cmdline'));
    await ctx.close();
  }

  console.log('\n== WALLDIM in a feet-and-inches drawing (PRO-cad1)');
  {
    const { ctx, page } = await open('pro-cad1', { width: 1440, height: 900 });
    const cc = (fn, arg) => page.evaluate(fn, arg);
    const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(200); };
    const screen = (x, y) => cc(([x, y]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const s = window.cadcraft.view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
    const clickAt = async (x, y) => { const p = await screen(x, y); await page.mouse.move(p.x - 3, p.y - 2); await page.mouse.move(p.x, p.y); await page.waitForTimeout(150); await page.mouse.click(p.x, p.y); await page.waitForTimeout(150); };
    const walls = () => cc(async () => { const W = await import('/assets/apps/cadcraft/dev/plan2d/walls.js'); return window.cadcraft.doc.all().filter(W.isWall).map((e) => { const m = W.model(e); return { id: m.id, a: m.a, b: m.b }; }); });
    await cc(() => { const m = window.cadcraft.doc.meta; m.units = 'inches'; m.lunits = 4; m.luprec = 4; window.cadcraft.host.zoomWindow({ x: -60, y: -60 }, { x: 320, y: 260 }); });
    await page.waitForTimeout(300);
    await typeCmd('WALLRECT'); await typeCmd('0,0'); await typeCmd('#180,144');
    await page.waitForTimeout(300);
    const vert = (await walls()).filter((w) => Math.abs(w.a.x - w.b.x) < 1e-6).sort((p, q) => p.a.x - q.a.x);
    ok(vert.length === 2, 'WALLRECT 15\'-0" by 12\'-0" made two upright walls', JSON.stringify(vert));
    const xw = vert[0].a.x, xe = vert[1].a.x, ym = (vert[0].a.y + vert[0].b.y) / 2;
    await typeCmd('DIMLINEAR'); await clickAt(xw, ym); await clickAt(xe, ym); await clickAt(90, 200);
    const dim = await cc(() => window.cadcraft.doc.all().find((e) => e.type === 'dim'));
    ok(dim && Math.abs(dim.p2.x - dim.p1.x - (xe - xw)) < 1e-6, 'DIMLINEAR between the wall centre lines', JSON.stringify(dim && [dim.p1, dim.p2]));
    await typeCmd('WALLDIM'); await clickAt(90, 200);
    await page.waitForTimeout(200);
    const prompt = await cc(() => document.querySelector('[data-prompt], .cc-prompt')?.textContent || '');
    ok(/New value for the dimension \(now 15'-0"\) <15'-0">/.test(prompt) && !/\d\.\d{3}/.test(prompt), 'the prompt reads in feet and inches: ' + prompt);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'walldim-prompt.png') });
    await page.keyboard.type('14\'-10"'); await page.keyboard.press('Enter'); await page.waitForTimeout(400);
    const after = (await walls()).filter((w) => Math.abs(w.a.x - w.b.x) < 1e-6).sort((p, q) => p.a.x - q.a.x);
    ok(Math.abs(after[1].a.x - after[0].a.x - 178) < 1e-6, '14\'-10" typed: the walls are 178 in apart, centre to centre', JSON.stringify(after.map((w) => w.a.x)));
    await typeCmd('CIRCLE'); await clickAt(250, 50); await typeCmd('30');
    await typeCmd('CIRCLE'); await clickAt(250, 150);
    const p2 = await cc(() => document.querySelector('[data-prompt], .cc-prompt')?.textContent || '');
    ok(/<2'-6">/.test(p2), 'other distance prompts too: CIRCLE offers the last radius as <2\'-6">: ' + p2);
    await ctx.close();
  }
  {
    const { ctx, page } = await open(null);
    await page.evaluate(() => { window.cadcraft.doc.meta.units = 'millimeters'; });
    await page.click('[data-cmd-input]'); await page.keyboard.type('CIRCLE'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    await page.keyboard.type('100,100'); await page.keyboard.press('Enter'); await page.keyboard.type('2.5'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    await page.keyboard.type('CIRCLE'); await page.keyboard.press('Enter'); await page.waitForTimeout(150); await page.keyboard.type('200,100'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    const p = await page.evaluate(() => document.querySelector('[data-prompt], .cc-prompt')?.textContent || '');
    ok(/<2\.5>/.test(p), 'a decimal drawing keeps the short number: ' + p);
    await ctx.close();
  }
} catch (e) { fail++; console.log('  FAIL threw: ' + (e.stack || e)); }
await browser.close();
const real = problems.filter((p) => !/429|favicon|ERR_|Failed to load resource/.test(p));
ok(real.length === 0, 'no page errors', real.slice(0, 5).join(' | '));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

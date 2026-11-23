#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-float-group.mjs — floating panels, as the owner asked on 2026-11-22, in /lab/cadcraft (PRO-cad2 and the standard layout), headless:
 *   1. "the panels aren't docking to each other … I should be able to make a 'super panel'": two floating panels, the second's title bar dragged onto the
 *      first's, become one floating panel with tabs; picking a tab keeps the group where it was moved; dragging a tab out to a dock takes only that one;
 *   2. "the resize anchor isn't attached to the panel": the corner grip sits on the panel's drawn corner, also after a resize and when the panel is drawn
 *      smaller than its remembered size (a CSS limit), and only the showing tab of a group has one.
 *
 *   node tools/shell-test/browser-float-group.mjs [--shots <dir>]      (run as root; test admin cctest+cadcraft@projectz.xyz)
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
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];

/** Each floating panel's drawn corner and its grip's corner (px), for the panels that show. */
const corners = (page) => page.evaluate(() => [...document.querySelectorAll('main > aside.shell-float')].filter((a) => getComputedStyle(a).display !== 'none').map((a) => {
  const r = a.getBoundingClientRect();
  const g = [...document.querySelectorAll('.shell-float-size')].filter((s) => !s.hidden).map((s) => s.getBoundingClientRect()).find((q) => Math.abs(q.right - r.right) < 40 && Math.abs(q.bottom - r.bottom) < 40);
  return { right: Math.round(r.right), bottom: Math.round(r.bottom), grip: g ? [Math.round(g.right), Math.round(g.bottom)] : null };
}));
const onCorners = (cs) => cs.length > 0 && cs.every((c) => c.grip && Math.abs(c.grip[0] - c.right) <= 2 && Math.abs(c.grip[1] - c.bottom) <= 2);

for (const layout of ['pro-cad2', 'standard']) {
  console.log(`\n# ${layout}`);
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, serviceWorkers: 'block' });
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript((l) => { try { localStorage.setItem('cc-workspace', l); Object.keys(localStorage).filter((k) => /panels/.test(k)).forEach((k) => localStorage.removeItem(k)); } catch (e) {} }, layout);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => problems.push(layout + ' pageerror: ' + e.message));
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'load' });
  await page.waitForFunction(() => window.cadcraft && window.ccShellPanels && window.ccShellPanels.panels().length >= 2, null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  const ids = await page.evaluate(() => ccShellPanels.panels().map((p) => p.id));
  const [a, b] = ids;
  // float both, apart
  await page.evaluate(([a, b]) => { ccShellPanels.move(a, 'float'); ccShellPanels.move(b, 'float'); }, [a, b]);
  await page.waitForTimeout(400);
  const gripOf = (id) => page.evaluate((id) => { const el = document.querySelector('main > aside.cc-' + id); const gr = el && el.querySelector('.shell-grip'); if (!gr) return null; const r = gr.getBoundingClientRect(); return { x: r.left + Math.min(60, r.width / 3), y: r.top + r.height / 2 }; }, id);
  { const gb = await gripOf(b); if (gb) { await page.mouse.move(gb.x, gb.y); await page.mouse.down(); await page.mouse.move(gb.x - 450, gb.y + 60, { steps: 12 }); await page.mouse.up(); await page.waitForTimeout(300); } }   // set the second one aside
  // drag panel b by its title bar over a's title bar
  const grips = { a: await gripOf(a), b: await gripOf(b) };
  ok(grips.a && grips.b, 'both floating panels have a title bar to drag', JSON.stringify(grips));
  if (!grips.a || !grips.b) { await ctx.close(); continue; }
  ok(onCorners(await corners(page)), 'each floating panel\'s grip sits on its corner', JSON.stringify(await corners(page)));
  await page.mouse.move(grips.b.x, grips.b.y); await page.mouse.down();
  await page.mouse.move(grips.b.x - 30, grips.b.y + 10, { steps: 4 });
  await page.mouse.move(grips.a.x, grips.a.y, { steps: 12 });
  const lit = await page.evaluate(() => !!document.querySelector('.shell-grip-drop'));
  await page.mouse.up(); await page.waitForTimeout(500);
  ok(lit, 'the target\'s title bar lights up while a panel is held over it');
  const fr = await page.evaluate(() => ccShellPanels.panels().map((p) => ({ id: p.id, dock: p.dock, tabbed: p.tabbed, showing: p.showing })));
  ok(fr.length >= 2 && fr.filter((p) => p.id === a || p.id === b).every((p) => p.dock === 'float' && p.tabbed), 'dropped on it: one floating panel with two tabs (a "super panel")', JSON.stringify(fr));
  const shown = await page.evaluate(() => [...document.querySelectorAll('main > aside.shell-float')].filter((x) => getComputedStyle(x).display !== 'none').length);
  ok(shown === 1, 'one panel shows, the other is its tab', String(shown));
  const tabs = await page.evaluate(() => [...document.querySelectorAll('main > aside.shell-float .shell-grip [role="tab"]')].filter((t) => t.getBoundingClientRect().width).map((t) => t.textContent.trim()));
  ok(tabs.length === 2, 'its title bar shows both as tabs', JSON.stringify(tabs));
  ok(onCorners(await corners(page)), 'one grip, on the group\'s corner', JSON.stringify(await corners(page)));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `float-group-${layout}.png`) });

  // move the group, then pick the other tab: the group stays where it was moved
  const g2 = await page.evaluate(() => { const el = [...document.querySelectorAll('main > aside.shell-float')].find((x) => getComputedStyle(x).display !== 'none'); const r = el.querySelector('.shell-grip').getBoundingClientRect(); return { x: r.right - 12, y: r.top + r.height / 2 }; });
  await page.mouse.move(g2.x, g2.y); await page.mouse.down(); await page.mouse.move(g2.x + 150, g2.y + 120, { steps: 10 }); await page.mouse.up(); await page.waitForTimeout(300);
  const at1 = await page.evaluate(() => { const r = [...document.querySelectorAll('main > aside.shell-float')].find((x) => getComputedStyle(x).display !== 'none').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top)]; });
  await page.evaluate(() => { const t = [...document.querySelectorAll('main > aside.shell-float .shell-grip [role="tab"]')].find((t) => t.getAttribute('aria-selected') !== 'true' && t.getBoundingClientRect().width); if (t) t.click(); });
  await page.waitForTimeout(300);
  const at2 = await page.evaluate(() => { const r = [...document.querySelectorAll('main > aside.shell-float')].find((x) => getComputedStyle(x).display !== 'none').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top)]; });
  ok(Math.abs(at1[0] - at2[0]) <= 2 && Math.abs(at1[1] - at2[1]) <= 2, 'picking the other tab keeps the group where it was moved', JSON.stringify([at1, at2]));
  ok(onCorners(await corners(page)), 'the grip follows the group', JSON.stringify(await corners(page)));

  // resize by the grip, then make the panel drawn smaller than its remembered size (as a CSS limit would): the grip stays on the drawn corner
  const gp = await page.evaluate(() => { const s = [...document.querySelectorAll('.shell-float-size')].find((x) => !x.hidden); const r = s.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.move(gp.x, gp.y); await page.mouse.down(); await page.mouse.move(gp.x + 120, gp.y + 90, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(300);
  ok(onCorners(await corners(page)), 'after a resize the grip is on the corner', JSON.stringify(await corners(page)));
  await page.evaluate(() => { const el = [...document.querySelectorAll('main > aside.shell-float')].find((x) => getComputedStyle(x).display !== 'none'); el.style.maxHeight = '14rem'; el.style.maxWidth = '15rem'; });
  await page.waitForTimeout(400);
  ok(onCorners(await corners(page)), 'drawn smaller than remembered (a CSS limit): the grip is still on the drawn corner', JSON.stringify(await corners(page)));
  await page.evaluate(() => { const el = [...document.querySelectorAll('main > aside.shell-float')].find((x) => getComputedStyle(x).display !== 'none'); el.style.maxHeight = ''; el.style.maxWidth = ''; });

  // a tab pulled out to the left dock goes alone
  await page.evaluate((b) => ccShellPanels.move(b, 'left'), b);
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => ccShellPanels.panels().map((p) => ({ id: p.id, dock: p.dock, tabbed: p.tabbed })));
  ok(after.find((p) => p.id === b).dock === 'left' && after.find((p) => p.id === a).dock === 'float' && !after.find((p) => p.id === a).tabbed, 'a tab moved to a dock leaves alone; the other stays floating', JSON.stringify(after));
  await page.evaluate(() => ccShellPanels.reset());
  await ctx.close();
}

// "panels are not restoring on click" (owner 2026-11-22): a closed floating panel came back at 0 x 0 (its size was saved while hidden)
{
  console.log('\n# closing and restoring');
  const sizes = (page) => page.evaluate(() => ccShellPanels.panels().map((x) => { const el = document.querySelector('main > aside.cc-' + x.id); const r = el.getBoundingClientRect(); const d = getComputedStyle(el).display; return { id: x.id, hidden: x.hidden, w: d === 'none' ? 0 : Math.round(r.width), h: d === 'none' ? 0 : Math.round(r.height) }; }));
  const clickTabs = async (page) => { for (let i = 0; i < 4; i++) { const n = await page.evaluate(() => { const t = [...document.querySelectorAll('.shell-pintab')].find((b) => b.getBoundingClientRect().width); if (t) { t.click(); return true; } return false; }); if (!n) break; await page.waitForTimeout(400); } };
  const closeAll = async (page) => { for (let i = 0; i < 4; i++) { const n = await page.evaluate(() => { const b = [...document.querySelectorAll('main > aside .shell-grip-close')].find((x) => x.getBoundingClientRect().width); if (b) { b.click(); return true; } return false; }); if (!n) break; await page.waitForTimeout(400); } };
  for (const [name, prep, seed] of [
    ['floating panels', (page) => page.evaluate(() => { ccShellPanels.move('left', 'float'); ccShellPanels.move('right', 'float'); }), null],
    ['a floating group', (page) => page.evaluate(() => { ccShellPanels.move('left', 'float'); ccShellPanels.move('right', 'float'); ccShellPanels.group('right', 'left'); }), null],
    ['a size of 0 saved by the old code', null, { left: { dock: 'float', order: 1, hidden: true, float: { x: 40, y: 2, w: 0, h: 0 } }, right: { dock: 'right', order: 2, hidden: true } }],
  ]) {
    const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, serviceWorkers: 'block' });
    await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
    await ctx.addInitScript((seed) => { try { localStorage.setItem('cc-workspace', 'pro-cad2'); const k = 'cc-app-settings:cadcraft'; const all = JSON.parse(localStorage.getItem(k) || '{}'); if (seed) all.panels = { v: 1, p: seed, docks: {} }; else delete all.panels; localStorage.setItem(k, JSON.stringify(all)); } catch (e) {} }, seed);
    const page = await ctx.newPage();
    page.on('pageerror', (e) => problems.push(name + ' pageerror: ' + e.message));
    await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'load' });
    await page.waitForFunction(() => window.cadcraft && window.ccShellPanels && window.ccShellPanels.panels().length >= 2, null, { timeout: 60000 });
    await page.waitForTimeout(1200);
    if (prep) { await prep(page); await page.waitForTimeout(400); await closeAll(page); }
    const closed = await sizes(page);
    if (!seed) ok(closed.every((x) => x.hidden), `${name}: closed`, JSON.stringify(closed));
    await clickTabs(page);
    const back = await sizes(page);
    ok(back.every((x) => !x.hidden && x.w >= 150 && x.h >= 100), `${name}: a click on each edge tab brings it back at a real size`, JSON.stringify(back));
    await ctx.close();
  }
}
ok(problems.length === 0, 'no page errors', problems.join(' / '));
await browser.close();
console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);

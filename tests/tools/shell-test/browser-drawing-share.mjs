#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * browser-drawing-share.mjs: BK.35 "about 75% of the screen for the drawing; side panels collapse to an icon strip".
 * At 1920 x 1080, in the real /lab page of BimCraft and CadCraft, for the classic layout and EVERY built-in layout the build lists,
 * it measures the drawing's share of the window (drawing-share.mjs: the AREA of the window where the drawing is the topmost thing,
 * over the window's area) in two states a person can reach from the interface:
 *
 *   labels    the first-use look (Settings › Toolbar buttons › Icons and labels) with every side panel collapsed to the edge strip
 *             (the panel bar's pin; the strip shows each panel's icon and name). The number is recorded and must not fall under the
 *             floor measured on 2026-11-11 (LABELS below, half a point of slack).
 *   compact   the compact bar: the command palette's "Give the drawing the most room" (app-fit.js room(true)) = icons without
 *             labels, one row of tools, a ribbon folded to its tab names, CadCraft's command line on one line, and the side panels
 *             pinned, each an icon alone in the edge strip. Must be >= 75 %, for every layout of both apps: BELOW_75 is empty
 *             (its one entry, CadCraft's toolbox layout, lost its duplicated toolbar on 2026-11-11 and now passes).
 *
 * It also checks the pieces: the edge strip is icons only in the compact state (each with a tooltip and a name for screen readers),
 * tool-row tools keep their names as tooltips when the labels go, and "Put the bars and panels back" restores what was there.
 *
 *   node tools/shell-test/browser-drawing-share.mjs [--apps bimcraft,cadcraft] [--layouts duncan,vector] [--shots <dir>] [--record <file.json>]
 * Run as root. One browser, one page at a time.
 */
import fs from 'node:fs';
import path from 'node:path';
import { openLab, layoutsOf } from './lab-page.mjs';
import { measureShare } from './drawing-share.mjs';

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APPS = (arg('--apps') || 'bimcraft,cadcraft').split(','), ONLY = arg('--layouts')?.split(','), SHOTS = arg('--shots'), RECORD = arg('--record');
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const pct = (x) => (x * 100).toFixed(1) + ' %';

export const TARGET = 0.75;
/** Floors with labels on and the panels in the edge strip, in percent: what was measured on 2026-11-11, less half a point. */
export const LABELS = {
  bimcraft: { standard: 70.0 /* 70.8 to 74.1: its Draw bar wraps to one row more when an add-on's tool arrives first */, docked: 73.6, toolbox: 71.8, autorev: 76.2, duncan: 79.7, vector: 73.3, sketch: 75.5, rhino: 74.0 },
  cadcraft: { standard: 63.7, docked: 62.8, toolbox: 57.4 /* 57.9 to 64.5 over three runs on 2026-11-11, after its duplicated toolbar went (53.5 before) */, autorev: 65.4, duncan: 68.5, vector: 64.3, sketch: 64.8, rhino: 63.5 },
};
/** Layouts that do not reach 75 % in the compact state: [floor in percent, why]. Reported in the session log; not counted as meeting BK.35. */
export const BELOW_75 = {
  // Empty since 2026-11-11 (owner: "smaller toolbars is better"): cadcraft/toolbox was the one entry, at 70.6 %, because it showed CadCraft's whole
  // toolbar AND a toolbox column. The toolbar now steps aside in that layout (tools/shell-test/browser-toolbox-reach.mjs proves every command is
  // still reachable) and the layout is held to 75 % like the rest: 75.2 % while the one-line command line's notice shows, 77.0 % after it.
  // The same rule applies to any layout that falls under 75 %: fix the layout, do not list it here.
};

const results = [];
const lab = await openLab('bkshare');
try {
  for (const slug of APPS) {
    const layouts = ['standard', ...layoutsOf(slug)].filter((l) => !ONLY || ONLY.includes(l));
    console.log(`\n== ${slug} at 1920 x 1080: ${layouts.join(', ')}`);
    for (const L of layouts) {
      const { ctx, page, errors } = await lab.page(slug, { layout: L, viewport: { width: 1920, height: 1080 } });
      ok(await page.evaluate((L) => (document.querySelector('main')?.dataset.wsLayout || 'standard') === L, L), `${slug} / ${L}: the layout is on`);
      const tb0 = await page.evaluate(() => document.body.dataset.shellTb);
      ok(tb0 === 'both', `${slug} / ${L}: first use shows icons with their labels (Settings › Toolbar buttons)`, String(tb0));
      // --- labels: only the panels go to the edge strip
      const side = await page.evaluate(() => { const P = window.ccShellPanels, l = P.panels().filter((p) => (p.dock === 'left' || p.dock === 'right') && !p.hidden); for (const p of l) P.pin(p.id); return l.map((p) => p.id); });
      await page.waitForTimeout(700); await page.mouse.move(960, 620); await page.waitForTimeout(500);
      const strip = await page.evaluate(() => [...document.querySelectorAll('.shell-pintab[data-kind="pin"]')].map((t) => { const r = t.getBoundingClientRect(), s = t.querySelector('span'); return { w: Math.round(r.width), h: Math.round(r.height), text: !!s && getComputedStyle(s).display !== 'none', icon: !!t.querySelector('i.bi'), label: t.getAttribute('aria-label') || '', title: t.title || t.dataset.bsOriginalTitle || t.dataset.ccTitle || '' }; }));
      ok(side.length > 0 && strip.length === side.length, `${slug} / ${L}: every side panel collapses to the edge strip (${side.join(', ')})`, JSON.stringify(strip));
      ok(strip.every((t) => t.icon && t.text && t.label), `${slug} / ${L}: with labels on, each edge tab shows its icon and its name`);
      const a = await measureShare(page);
      const floorA = LABELS[slug]?.[L] ?? 0;
      ok(a.share * 100 >= floorA, `${slug} / ${L}: LABELS ON, panels in the strip: the drawing has ${pct(a.share)} of the window (floor ${floorA} %)`);
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${slug}-${L}-labels.png`) });
      // --- compact: the palette's command
      const was = await page.evaluate(() => window.ccFit.room(true));
      await page.waitForTimeout(900); await page.mouse.move(960, 620); await page.waitForTimeout(500);
      const c = await page.evaluate(() => ({ tb: document.body.dataset.shellTb,
        tabs: [...document.querySelectorAll('.shell-pintab[data-kind="pin"]')].map((t) => { const r = t.getBoundingClientRect(), s = t.querySelector('span'); return { w: Math.round(r.width), h: Math.round(r.height), text: !!s && getComputedStyle(s).display !== 'none' && s.getBoundingClientRect().width > 0, icon: !!t.querySelector('i.bi'), label: t.getAttribute('aria-label') || '' }; }),
        rows: [...document.querySelectorAll('.tr-group .ws-tool')].filter((b) => !b.closest('.tr-more-list') && b.getBoundingClientRect().width > 0).map((b) => ({ h: Math.round(b.getBoundingClientRect().height), text: getComputedStyle(b.querySelector('span') || b).display !== 'none' && !!b.querySelector('span'), label: b.getAttribute('aria-label') || '', title: b.title || b.dataset.bsOriginalTitle || '' })) }));
      ok(c.tb === 'icons', `${slug} / ${L}: the compact bar is on (icons without labels)`, c.tb);
      ok(c.tabs.length === side.length && c.tabs.every((t) => t.icon && !t.text && t.label && t.w <= 40 && t.h <= 40), `${slug} / ${L}: the edge strip is icons only, each named for a screen reader and at most 40 px square`, JSON.stringify(c.tabs));
      if (L === 'vector') {   // the compact Vector palette: two columns of icons, no tool cut off, every tool named
        const pal = await page.evaluate(() => { const p = document.querySelector('.vw-toolpalette'); const rows = [...p.querySelectorAll('.vw-row')].filter((b) => b.getBoundingClientRect().width > 0); const pr = p.getBoundingClientRect();
          return { w: Math.round(pr.width), rows: rows.length, text: rows.filter((b) => { const s = b.querySelector('span'); return s && getComputedStyle(s).display !== 'none'; }).length, unnamed: rows.filter((b) => !(b.getAttribute('aria-label') || b.title || b.dataset.bsOriginalTitle)).length,
            scrolls: [...p.querySelectorAll('.vw-pal')].every((x) => x.scrollHeight <= x.clientHeight + 1 || getComputedStyle(x).overflowY === 'auto') }; });
        ok(pal.w <= 104 && pal.rows > 0 && pal.text === 0 && pal.unnamed === 0 && pal.scrolls, `${slug} / ${L}: the tool palette is two columns of icons (${pal.w} px wide), ${pal.rows} tool-set tools each named, and a palette short of height scrolls`, JSON.stringify(pal));
      }
      if (c.rows.length) ok(c.rows.every((b) => !b.text && b.label && b.h <= 40), `${slug} / ${L}: the tool rows lose their labels (${c.rows.length} tools, ${c.rows[0].h} px high) and every tool keeps its name`, JSON.stringify(c.rows.filter((b) => b.text || !b.label).slice(0, 3)));
      const b = await measureShare(page);
      const below = BELOW_75[slug + '/' + L];
      if (below) { ok(b.share * 100 >= below[0], `${slug} / ${L}: COMPACT: the drawing has ${pct(b.share)} of the window. UNDER 75 %, reported: ${below[1]} (held to its floor ${below[0]} %)`); ok(b.share < TARGET, `${slug} / ${L}: it is still under 75 % (when it reaches it, take it off the BELOW_75 list)`); }
      else ok(b.share >= TARGET, `${slug} / ${L}: COMPACT: the drawing has ${pct(b.share)} of the window (at least 75 %)`, 'drawing box ' + JSON.stringify(b.rect));
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${slug}-${L}-compact.png`) });
      results.push({ app: slug, layout: L, labels: +(a.share * 100).toFixed(2), compact: +(b.share * 100).toFixed(2), drawing: b.rect, changed: Object.keys(was || {}) });
      // --- and back (once per app is enough to prove it; it is cheap, so every layout)
      await page.evaluate(() => window.ccFit.room(false));
      await page.waitForTimeout(700);
      const back = await page.evaluate(() => ({ tb: document.body.dataset.shellTb, pinned: window.ccShellPanels.panels().filter((p) => p.pinned).length, kept: localStorage.getItem('cc-fit-room') }));
      ok(back.tb === 'both' && back.kept === null && back.pinned === side.length, `${slug} / ${L}: "Put the bars and panels back" restores the labels and leaves alone the panels the person pinned`, JSON.stringify(back));
      ok(!errors.length, `${slug} / ${L}: no page error`, errors.slice(0, 2).join(' | '));
      await ctx.close();
    }
    if (!ONLY) {   // the command alone, from the first-use state: it pins the panels itself, and the way back un-pins them
      const { ctx, page } = await lab.page(slug, { layout: 'duncan' });
      const inPalette = await page.evaluate(() => { const l = window.ccPalette?.items?.() || null; return l ? ['app:fit-room', 'app:fit-room-back'].every((id) => l.some((x) => x.id === id && x.label && !/^shell\./.test(x.label))) : null; });
      if (inPalette !== null) ok(inPalette, `${slug}: the command palette has "Give the drawing the most room" and "Put the bars and panels back"`);
      const on = await page.evaluate(() => { const was = window.ccFit.room(true); return { was, pinned: window.ccShellPanels.panels().filter((p) => p.pinned).map((p) => p.id), tb: document.body.dataset.shellTb }; });
      ok(on.pinned.length >= 2 && on.tb === 'icons' && on.was.tb === 'both', `${slug}: the command alone pins the side panels (${on.pinned.join(', ')}) and takes the labels off, remembering what was there`, JSON.stringify(on.was));
      await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(800);
      const kept = await page.evaluate(() => ({ pinned: window.ccShellPanels.panels().filter((p) => p.pinned).length, tb: document.body.dataset.shellTb }));
      ok(kept.pinned >= 2 && kept.tb === 'icons', `${slug}: the compact state is kept after a reload`, JSON.stringify(kept));
      const off = await page.evaluate(() => { window.ccFit.room(false); return { pinned: window.ccShellPanels.panels().filter((p) => p.pinned).length, tb: document.body.dataset.shellTb }; });
      ok(off.pinned === 0 && off.tb === 'both', `${slug}: the way back docks the panels again and shows the labels`, JSON.stringify(off));
      await ctx.close();
    }
  }
} finally { await lab.close(); }
console.log('\nDrawing share of a 1920 x 1080 window (area), panels collapsed to the edge strip:');
console.log('  app        layout     labels on   compact bar');
for (const r of results) console.log('  ' + r.app.padEnd(10) + ' ' + r.layout.padEnd(10) + ' ' + (r.labels.toFixed(1) + ' %').padStart(8) + '   ' + (r.compact.toFixed(1) + ' %').padStart(8) + (BELOW_75[r.app + '/' + r.layout] ? '   under 75 %' : ''));
if (RECORD) fs.writeFileSync(RECORD, JSON.stringify({ measured: new Date().toISOString().slice(0, 10), window: [1920, 1080], definition: 'area where the drawing is topmost / window area (tools/shell-test/drawing-share.mjs)', results }, null, 1) + '\n');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

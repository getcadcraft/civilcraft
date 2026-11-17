#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * browser-toolbox-reach.mjs: CadCraft's "Toolbox and info box" layout without the duplicated toolbar (0.10, owner 2026-11-11:
 * "smaller toolbars is better"; session bk-aiaddon-10). The layout showed CadCraft's whole toolbar AND a toolbox column, every tool
 * twice. Now the toolbar steps aside in a layout that has the toolbox column (adapter.toolbarIn, app-workspace.js mountToolbar) and
 * the column is the one place for tools. This test proves nothing was lost with the toolbar, in the real /lab page at 1920 x 1080:
 *
 *   - the app's toolbar is not on screen in this layout, and comes back in the classic layout;
 *   - EVERY command that has a button or a menu item in the toolbar is a tool of the toolbox column: on the column itself, or in
 *     its group's More list (what the toolbar kept under More);
 *   - every one of them is in the command palette, and every one has its typed command at the command line;
 *   - a tool on the column starts, a tool picked from a More list starts and the list closes, a typed command starts;
 *   - the More list opens beside the column, shows names in every toolbar-button setting, and stays inside the window;
 *   - BimCraft's toolbox layout is as it was (its toolbar is a few buttons that are not in its toolbox).
 * Screenshots (--shots <dir>): the column, a More list open, in the paper and the model space.
 *
 *   node tools/shell-test/browser-toolbox-reach.mjs [--shots <dir>]      (run as root; one browser)
 */
import fs from 'node:fs';
import path from 'node:path';
import { openLab } from './lab-page.mjs';

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const SHOTS = arg('--shots');
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };

const lab = await openLab('bkreach');
try {
  console.log('== cadcraft / toolbox at 1920 x 1080');
  const { ctx, page, errors } = await lab.page('cadcraft', { layout: 'toolbox' });
  await page.waitForSelector('[data-ws-blk="toolbox"] [data-tbx-tool]', { timeout: 90000, state: 'attached' });   // a cold first load can take longer than the page helper waits
  const read = () => page.evaluate(() => {
    const I = window.ccInput, list = I.commands;
    const tb = document.querySelector('.cc-toolbar, [data-toolbar]') || [...document.querySelectorAll('[data-ws-in]')][0] || document.querySelector('.ws-toolbar-strip');
    const bar = document.querySelector('[data-ws-in="toolbox"]') || tb;
    const r = bar ? bar.getBoundingClientRect() : null;
    const col = [...document.querySelectorAll('[data-ws-blk="toolbox"] [data-tbx-tool]')];
    const onColumn = new Set(col.filter((b) => !b.closest('.tbx-more')).map((b) => b.dataset.tbxTool)), inMore = new Set(col.filter((b) => b.closest('.tbx-more')).map((b) => b.dataset.tbxTool));
    const pal = new Set((window.ccPalette?.items?.() || []).map((p) => p.id));
    const inBar = bar ? list.filter((c) => c.sel && bar.querySelector(c.sel)) : [];
    return { bar: !!bar, marked: bar?.dataset.wsIn || null, shown: !!r && r.width > 0 && r.height > 0 && getComputedStyle(bar).display !== 'none', inBar: inBar.length,
      notInColumn: inBar.filter((c) => !onColumn.has(c.id) && !inMore.has(c.id)).map((c) => c.id), notInPalette: inBar.filter((c) => !pal.has('input:' + c.id)).map((c) => c.id),
      noTyped: inBar.filter((c) => !bar.querySelector(c.sel).dataset.cmd).map((c) => c.id), onColumn: onColumn.size, inMore: inMore.size,
      others: bar ? [...bar.querySelectorAll('button, [role="menuitem"], select, input')].filter((b) => !b.dataset.cmd && !b.matches('summary, [aria-haspopup], [data-tb-more], .dropdown-toggle')).map((b) => (b.tagName + ' ' + [...b.attributes].map((a) => a.name).join(',')).slice(0, 80)) : [],
      moreGroups: [...document.querySelectorAll('details.tbx-more')].map((d) => d.dataset.tbxMore + ':' + d.querySelectorAll('[data-tbx-tool]').length) };
  });
  let s = await read();
  ok(s.bar && s.marked === 'toolbox' && !s.shown, 'the app\'s toolbar is not on screen in this layout (it stepped aside for the toolbox column)', JSON.stringify({ bar: s.bar, marked: s.marked, shown: s.shown }));
  ok(s.inBar >= 150, s.inBar + ' commands have a button or a menu item in the toolbar');
  ok(s.notInColumn.length === 0, 'every one of them is a tool of the toolbox column: ' + s.onColumn + ' on the column, ' + s.inMore + ' in the groups\' More lists (' + s.moreGroups.join(', ') + ')', s.notInColumn.slice(0, 12).join(', '));
  ok(s.notInPalette.length === 0, 'every one of them is in the command palette', s.notInPalette.slice(0, 12).join(', '));
  const NEVER_TYPED = ['edit.paste-picture'];   // Paste a picture never had a typed command (it opens a file picker); it is on the column's More list and in the palette
  ok(s.noTyped.every((id) => NEVER_TYPED.includes(id)), 'every one of them has its typed command for the command line' + (s.noTyped.length ? ', except ' + s.noTyped.join(', ') + ', which never had one' : ''), s.noTyped.filter((id) => !NEVER_TYPED.includes(id)).slice(0, 12).join(', '));
  console.log('  note what else the toolbar holds that is not a command button: ' + (s.others.length ? s.others.join(' | ') : 'nothing'));

  // a tool on the column starts
  const running = () => page.evaluate(() => window.ccWorkspaceEngine?.inspect?.().tool ?? null).catch(() => null);
  const state = () => page.evaluate(() => { const h = document.querySelector('.cc-cmd'); return (h?.innerText || '').replace(/\s+/g, ' ').slice(-300); });   // what the command line shows (its history and prompt)
  await page.click('[data-ws-blk="toolbox"] [data-tbx-tool="draw.line"]');
  await page.waitForTimeout(400);
  let hist = await state();
  ok(/LINE/i.test(hist), 'a tool on the column starts (Line): the command line shows it', hist.slice(-120));
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');

  // a More list: opens beside the column, named, inside the window; a pick starts the tool and closes the list
  const group = await page.evaluate(() => { const d = [...document.querySelectorAll('details.tbx-more')].find((x) => x.querySelectorAll('[data-tbx-tool]').length >= 3 && x.closest('details.tbx-group')?.open !== false); d.querySelector('summary').scrollIntoView({ block: 'center' }); return d.dataset.tbxMore; });
  await page.click(`details.tbx-more[data-tbx-more="${group}"] > summary`);
  await page.waitForTimeout(400);
  const more = await page.evaluate((g) => {
    const d = document.querySelector(`details.tbx-more[data-tbx-more="${g}"]`), l = d.querySelector('.tr-more-list'), r = l.getBoundingClientRect(), col = document.querySelector('[data-ws-blk="toolbox"]').getBoundingClientRect();
    const tools = [...l.querySelectorAll('[data-tbx-tool]')];
    return { open: d.open, rect: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], colRight: Math.round(col.right), n: tools.length,
      named: tools.filter((b) => { const sp = b.querySelector('span'); return sp && getComputedStyle(sp).display !== 'none' && sp.getBoundingClientRect().width > 0 && sp.textContent.trim(); }).length,
      first: tools.find((b) => b.getAttribute('aria-disabled') !== 'true')?.dataset.tbxTool, firstLabel: tools.find((b) => b.getAttribute('aria-disabled') !== 'true')?.textContent.trim(), label: d.querySelector('summary').getAttribute('aria-label'), scrolls: l.scrollHeight <= l.clientHeight + 1 || getComputedStyle(l).overflowY === 'auto' };
  }, group);
  ok(more.open && more.n >= 3 && more.named === more.n, `the "${more.label}" list opens with ${more.n} tools, each shown by name`, JSON.stringify(more));
  ok(more.rect[0] >= more.colRight && more.rect[1] >= 0 && more.rect[2] <= 1920 && more.rect[3] <= 1080 && more.scrolls, 'it opens beside the column (which ends at x ' + more.colRight + '), inside the window (' + more.rect.join(', ') + ')');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'cadcraft-toolbox-more-labels-paper.png') });
  await page.click(`details.tbx-more[data-tbx-more="${group}"] [data-tbx-tool="${more.first}"]`);
  await page.waitForTimeout(500);
  const after = await page.evaluate((g) => ({ open: document.querySelector(`details.tbx-more[data-tbx-more="${g}"]`).open }), group);
  hist = await state();
  ok(!after.open, 'a pick from the More list ("' + more.firstLabel + '") closes the list');
  ok(/CIRCLE/i.test(hist.slice(-160)) || !/LINE\s*$/.test(hist), 'and the picked tool started: the command line shows "' + hist.slice(-110) + '"');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');

  // typed at the command line
  await page.click('#cc-cmd'); await page.keyboard.type('CIRCLE'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  hist = await state();
  ok(/CIRCLE/i.test(hist), 'a typed command starts (CIRCLE)', hist.slice(-120));
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');

  // icons only (the compact bar): the More button is an icon with a name, the list still shows names
  await page.evaluate(() => window.ccFit.room(true)); await page.waitForTimeout(6500);   // the one-line command line's notice has gone by then
  await page.evaluate((g) => document.querySelector(`details.tbx-more[data-tbx-more="${g}"] > summary`).scrollIntoView({ block: 'center' }), group);
  await page.click(`details.tbx-more[data-tbx-more="${group}"] > summary`); await page.waitForTimeout(400);
  const compact = await page.evaluate((g) => { const d = document.querySelector(`details.tbx-more[data-tbx-more="${g}"]`), sm = d.querySelector('summary'), r = sm.getBoundingClientRect(), tools = [...d.querySelectorAll('.tr-more-list [data-tbx-tool]')];
    return { tb: document.body.dataset.shellTb, w: Math.round(r.width), h: Math.round(r.height), name: sm.getAttribute('aria-label') || sm.title, text: getComputedStyle(sm.querySelector('span')).display !== 'none', named: tools.filter((b) => getComputedStyle(b.querySelector('span')).display !== 'none').length, n: tools.length, col: Math.round(document.querySelector('[data-ws-blk="toolbox"]').getBoundingClientRect().width) }; }, group);
  ok(compact.tb === 'icons' && compact.w <= 40 && compact.h <= 40 && !compact.text && compact.name && compact.named === compact.n, `icons only: the More button is an icon ${compact.w} x ${compact.h} px named "${compact.name}", the column is ${compact.col} px wide, and its list still shows all ${compact.n} names`, JSON.stringify(compact));
  if (SHOTS) {
    await page.screenshot({ path: path.join(SHOTS, 'cadcraft-toolbox-more-compact-paper.png') });
    await page.evaluate(() => { const b = document.querySelector('[data-space="model"]') || [...document.querySelectorAll('.space-toggle button')].pop(); if (b) b.click(); });
    await page.waitForTimeout(1500);
    await page.evaluate((g) => { const d = document.querySelector(`details.tbx-more[data-tbx-more="${g}"]`); if (d && !d.open) d.querySelector('summary').click(); }, group).catch(() => {});
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SHOTS, 'cadcraft-toolbox-more-compact-model.png') });
    await page.evaluate(() => { const b = document.querySelector('[data-space="paper"]') || document.querySelector('.space-toggle button'); if (b) b.click(); });
    await page.waitForTimeout(800);
  }
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.ccFit.room(false)); await page.waitForTimeout(500);

  // back to the classic layout: the toolbar is there again, with its More menus
  const classic = await page.evaluate(async () => { localStorage.setItem('cc-workspace', 'standard'); return true; });
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(1200);
  const back = await page.evaluate(() => { const bar = document.querySelector('[data-tb-key]')?.closest('[role="toolbar"], .cc-toolbar, nav, div'); const any = document.querySelector('[data-tb-key="Draw"] [data-cmd]'); const r = any?.getBoundingClientRect(); return { layout: document.querySelector('main')?.dataset.wsLayout || 'standard', shown: !!r && r.width > 0 && r.height > 0, marked: !!document.querySelector('[data-ws-in]'), tbx: document.querySelectorAll('[data-tbx-tool]').length }; });
  ok(classic && back.layout === 'standard' && back.shown && !back.marked && back.tbx === 0, 'in the classic layout the toolbar is on screen as before, and nothing is left of the column', JSON.stringify(back));
  ok(!errors.length, 'no page error', errors.slice(0, 2).join(' | '));
  await ctx.close();

  console.log('== bimcraft / toolbox: unchanged');
  {
    const { ctx, page, errors } = await lab.page('bimcraft', { layout: 'toolbox' });
    await page.waitForSelector('[data-ws-blk="toolbox"] [data-tbx-tool]', { timeout: 90000, state: 'attached' });
    const b = await page.evaluate(() => ({ marked: !!document.querySelector('[data-ws-in]'), strip: (() => { const t = document.querySelector('.ws-toolbar-strip'); const r = t?.getBoundingClientRect(); return !!r && r.width > 0 && r.height > 0; })(), more: document.querySelectorAll('details.tbx-more').length, tbx: document.querySelectorAll('[data-tbx-tool]').length }));
    ok(!b.marked && b.strip && b.more === 0 && b.tbx > 0, 'BimCraft keeps its own toolbar over the drawing in this layout and its column has no More lists (' + b.tbx + ' tools)', JSON.stringify(b));
    ok(!errors.length, 'no page error', errors.slice(0, 2).join(' | '));
    await ctx.close();
  }
} catch (e) { ok(false, 'stopped: ' + (e.stack || e.message || e)); } finally { await lab.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

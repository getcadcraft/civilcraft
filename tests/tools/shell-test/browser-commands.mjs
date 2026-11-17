#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * browser-commands.mjs: BK.126 "every button runs a typed command, so a new layout is not new geometry code".
 * In the real /lab page of CadCraft and BimCraft, for the classic layout under EVERY built-in menu style of the app's registry
 * (toolbar, menu bar and the ribbon styles) and for EVERY built-in layout the build lists (ribbon and project browser, toolbox,
 * auto-revise, Duncan, Vector, Sketch, Rhino), it reads every button that a LAYOUT or a MENU STYLE made and lists any that has
 * no command. "Made by a layout or a style" = a button of the layout engine (app-workspace*.js: its class or a data attribute
 * starts ws-, tbx-, tr- or vw-) or of the menu-style bar (app-input-ui.js: .cc-inbar and its menus, class cc-in-*). The app's own
 * controls (a running tool's options, the section bar, a select the layout only moved) are the same nodes in every layout: they are
 * not the layout's, and the app's own tool buttons are checked in part 2.
 *
 *  1. a tool button a layout made (data-ws-command / data-tbx-tool)  must be one the app's adapter has a command for
 *        (ccWorkspaceEngine.buttons(): adapter.tool(id, block).built, run by adapter.run(id, block)). A PLANNED tool a layout
 *        shows as not built (class ws-notbuilt: dashed, faded) must be off (aria-disabled) with its reason, and is listed by name;
 *     a menu item of the Vector / Sketch / Rhino menu bar (data-vw-cmd), a File-menu row (data-ws-file-cmd) and a button of a
 *        menu style (data-cmd)                                       must name a command of the registry (ccInput.commands);
 *     a File-menu action (data-ws-file-action)                       must be one of the adapter's actions (engine.caps().actions);
 *     a title-bar proxy (data-ws-shell = a selector)                 must stand for a button that is there, and that button is a
 *        registry command or the shell's own window control (full screen);
 *     what is left is either STRUCTURE (it opens, folds, switches or moves a part of the interface and is named below, each with
 *        why) or it FAILS as "a button without a command".
 *  2. every tool button of the app's own Draw bar / toolbar that a layout can show (the adapter's toolbox ids; BimCraft: every
 *        [data-mtool]) is a registry command, so keys, menu styles and layouts all reach it through the same typed layer.
 *
 *   node tools/shell-test/browser-commands.mjs [--apps cadcraft,bimcraft] [--layouts duncan,rhino] [--list]
 * Run as root. One browser, one page at a time. --list prints every structure button it let through.
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { openLab, layoutsOf, PUB, manifestOf } from './lab-page.mjs';

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APPS = (arg('--apps') || 'cadcraft,bimcraft').split(','), ONLY = arg('--layouts')?.split(','), LIST = process.argv.includes('--list');
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };

/** Buttons that are structure, not commands: [selector, why]. A button must match one of these to pass without a command. */
export const STRUCTURE = [
  ['[data-ws-tab], [role="tab"]', 'a tab: shows another group of the same bar'],
  ['[data-ws-ribbon-menu], .ws-tear, .shell-tb-tear button, .ws-popout-menu, [data-ws-grip], .shell-grip-btn, .shell-grip button', 'a bar\'s own handle or menu: move, fold, tear off'],
  ['.vw-menu-btn, [data-in-menu], [aria-haspopup="menu"], [aria-haspopup="true"], summary', 'opens a menu of commands'],
  ['[data-ws-inventory]', 'opens the list of what each tool does here'],
  ['[data-ws-file], .ws-file-tab', 'opens the File menu (its rows are checked as commands)'],
  ['.shell-tabs-chev, .tr-more > summary', 'scrolls a tab strip / opens a group\'s full set'],
  ['.cc-in-tab, .cc-in-mtitle, .cc-in-pin, .cc-in-splitarrow, .cc-in-link, [class*="cc-in-more"], [class*="cc-in-every"]', 'the menu style\'s own tabs, menu titles, pin and arrows'],
  ['[data-ws-rail], [data-ws-lower], [data-vw-set], [data-vw-pal], [data-vw-open], [data-tbx-group]', 'switches which palette or tool set shows'],
  ['[data-ws-drawing], [data-ws-close], [data-ws-view]', 'a view tab: shows or closes an open view'],
  ['[data-ribbon-pin], [data-split], [data-input-every], [data-input-essential], [data-input-default]', 'the menu style\'s own controls: fold the ribbon, open a split, show every tool'],
  ['[data-ws-dismiss], [data-ws-props], [data-ws-view-props]', 'closes a note / opens Properties for what is selected'],
  ['.shell-pintab', 'an edge tab: slides a pinned panel out'],
  ['[data-tbx-mine]', 'an empty "my tools" slot: asks which tool to put there'],
  ['[data-ws-pb-view], [data-ws-browser-3d], [data-vw-palette]', 'the project browser / Window menu: shows a view or a palette'],
  ['[data-newhere-open], [data-about-open]', 'the Help menu\'s shell pages: the welcome guide and About (dialogs of the shell, no drawing command)'],
  ['.space-toggle button, [data-space]', 'the site\'s paper / model theme switch'],
];
const read = (page) => page.evaluate(({ STRUCTURE }) => {
  const cmds = window.ccInput?.commands || [], ids = new Set(cmds.map((c) => c.id));
  const sels = cmds.map((c) => c.sel).filter(Boolean);
  const isCmdEl = (b) => sels.some((s) => { try { return b.matches(s); } catch (e) { return false; } });
  const eng = window.ccWorkspaceEngine;
  const made = new Map((eng?.buttons?.() || []).map((x) => [x.id + ' ' + x.block, x]));
  const actions = new Set(eng?.caps?.().actions || []);
  const name = (b) => (b.getAttribute('aria-label') || b.title || b.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30);
  const where = (b) => { const c = b.closest('[data-ws-blk], .cc-inbar, .ws-top, .ws-bottom, .ws-region, [role="menu"]'); return c ? (c.dataset.wsBlk || c.className.toString().split(' ')[0] || c.getAttribute('role')) : b.parentElement.className.toString().split(' ')[0] || b.parentElement.tagName.toLowerCase(); };
  const OURS = /^(ws|tbx|tr|vw|cc-in)-/;
  const byLayout = (b) => [...b.classList].some((c) => OURS.test(c)) || [...b.attributes].some((a) => /^data-(ws|tbx|vw)-/.test(a.name));
  const out = { layout: document.querySelector('main')?.dataset.wsLayout || 'standard', style: window.ccInput?.current?.()?.id ?? null, registry: cmds.length, total: 0, command: 0, structure: {}, planned: [], lost: [], unbuilt: [], unknownIds: [], appTools: 0, appLost: [] };
  for (const b of document.querySelectorAll('body button, body [role="menuitem"]')) {
    if (b.closest('dialog, [data-app-settings]') || !byLayout(b)) continue;
    out.total++;
    const d = b.dataset;
    if (d.wsCommand || d.tbxTool) {
      const k = (d.wsCommand || d.tbxTool) + ' ' + (d.tbxTool ? 'toolbox' : d.wsBlock || 'ribbon'), m = made.get(k);
      if (m && m.built) out.command++;
      else if (b.classList.contains('ws-notbuilt') && b.getAttribute('aria-disabled') === 'true' && (d.wsReason || b.title)) out.planned.push(name(b));
      else out.unbuilt.push(k + ' "' + name(b) + '"');
      continue;
    }
    if (d.extra !== undefined) { if (d.extra.startsWith('data-addon-tool')) (out.structure['an add-on\'s own tool, mirrored into the menu style (typed by the add-on API, not the app registry)'] ||= []).push(name(b)); else out.lost.push('mirrors an app button that is not a command: ' + d.extra + ' "' + name(b) + '"'); continue; }
    const named = d.vwCmd ?? d.wsFileCmd ?? d.wsPbRun ?? d.cmd;
    if (named !== undefined && named !== '') { if (ids.has(named)) out.command++; else out.unknownIds.push(named + ' "' + name(b) + '" in ' + where(b)); continue; }
    if (d.wsFileAction) { if (actions.has(d.wsFileAction)) out.command++; else out.unknownIds.push('action ' + d.wsFileAction + ' "' + name(b) + '"'); continue; }
    if (d.wsShell) { let src = null; try { src = document.querySelector(d.wsShell); } catch (e) { /* not a selector */ }
      if (src && (isCmdEl(src) || src.matches('[data-fs-cycle]'))) out.command++; else out.lost.push('data-ws-shell=' + d.wsShell + ' "' + name(b) + '"' + (src ? ' (its button is not a registry command)' : ' (no such button)')); continue; }
    if (isCmdEl(b)) { out.command++; continue; }
    const st = STRUCTURE.find(([sel]) => { try { return b.matches(sel); } catch (e) { return false; } });
    if (st) { (out.structure[st[1]] ||= []).push(name(b)); continue; }
    const attrs = [...b.attributes].filter((a) => a.name.startsWith('data-')).map((a) => a.name + (a.value ? '=' + a.value.slice(0, 20) : '')).join(' ');
    out.lost.push((attrs || b.className.toString().slice(0, 30) || 'button') + ' "' + name(b) + '" in ' + where(b));
  }
  // part 2: the app's own tool buttons a layout can show (the adapter's toolbox ids -> their source buttons; every [data-mtool])
  const tools = new Set([...document.querySelectorAll('main [data-mtool], template')].flatMap((n) => (n.tagName === 'TEMPLATE' ? [...n.content.querySelectorAll('[data-mtool]')] : [n])));
  for (const b of tools) { out.appTools++; if (!isCmdEl(b)) out.appLost.push('data-mtool=' + b.dataset.mtool + ' "' + name(b) + '"'); }
  return out;
}, { STRUCTURE });

const ALL = !!process.env.BK_ALL;
const planned = new Map();
const report = (slug, what, r) => {
  const st = Object.values(r.structure).reduce((n, l) => n + l.length, 0);
  ok(r.toolbarStyle || (r.total > 0 && r.command > 0), `${slug} / ${what}: ${r.total} layout or style buttons read, ${r.command} run a command, ${st} are structure` + (r.planned.length ? `, ${r.planned.length} planned (off, with a reason)` : ''));
  ok(!r.unbuilt.length, `${slug} / ${what}: every tool button the layout made has a command behind it`, r.unbuilt.slice(0, ALL ? 999 : 8).join('; '));
  ok(!r.unknownIds.length, `${slug} / ${what}: every menu item and style button names a command of the registry (${r.registry})`, r.unknownIds.slice(0, ALL ? 999 : 8).join('; '));
  ok(!r.lost.length, `${slug} / ${what}: no button without a command`, r.lost.length + ': ' + r.lost.slice(0, ALL ? 999 : 12).join('; '));
  ok(r.appTools === 0 || !r.appLost.length, `${slug} / ${what}: every tool button of the app's own Draw bar is a registry command (${r.appTools})`, r.appLost.length + ': ' + r.appLost.slice(0, ALL ? 999 : 12).join('; '));
  if (r.planned.length) planned.set(slug + ' / ' + what, [...new Set(r.planned)]);
  if (LIST) for (const [why, names] of Object.entries(r.structure)) console.log('       structure, ' + why + ': ' + names.length + ' (' + [...new Set(names)].slice(0, 6).join(', ') + ')');
};

const lab = await openLab('bkcommands');
try {
  for (const slug of APPS) {
    const man = manifestOf(slug);
    const reg = await import(pathToFileURL(path.join(PUB, 'assets/apps', slug, 'dev', man.input)).href);
    console.log(`\n== ${slug}: classic layout under each menu style (${reg.STYLE_ORDER.join(', ')})`);
    if (!ONLY || ONLY.includes('standard')) {
      const { ctx, page, errors } = await lab.page(slug, { layout: 'standard' });
      ok(await page.evaluate(() => !!window.ccInput && window.ccInput.commands.length > 0), slug + ': the registry is on the page (ccInput.commands)');
      for (const id of reg.STYLE_ORDER) {
        await page.evaluate((id) => window.ccInput.setStyle(id), id);
        await page.waitForTimeout(700);
        const r = await read(page); r.toolbarStyle = reg.STYLES[id].layout === 'toolbar';   // the app's own toolbar: the style makes no buttons
        ok(r.style === id, `${slug} / style ${id} (${reg.STYLES[id].layout}) is on`, String(r.style));
        report(slug, 'style ' + id, r);
      }
      await page.evaluate((id) => window.ccInput.setStyle(id), reg.STYLE_ORDER[0]);
      ok(!errors.length, slug + ': no page error under the menu styles', errors.slice(0, 2).join(' | '));
      await ctx.close();
    }
    const layouts = layoutsOf(slug).filter((l) => !ONLY || ONLY.includes(l));
    console.log(`== ${slug}: every built-in layout (${layouts.join(', ')})`);
    for (const L of layouts) {
      const { ctx, page, errors } = await lab.page(slug, { layout: L });
      const r = await read(page);
      ok(r.layout === L, `${slug} / layout ${L} is mounted`, r.layout);
      report(slug, 'layout ' + L, r);
      ok(!errors.length, `${slug} / layout ${L}: no page error`, errors.slice(0, 2).join(' | '));
      await ctx.close();
    }
  }
} finally { await lab.close(); }
if (planned.size) { console.log('\nPlanned tools a layout shows as not built (off, dashed, each with its reason; no command yet):'); for (const [k, v] of planned) console.log('  ' + k + ': ' + v.length + ' (' + v.join(', ') + ')'); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

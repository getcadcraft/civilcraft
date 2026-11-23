#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-split-11.mjs: second guard for PERF.71 round two (0.11 perf-finish-11 r2, lane civil-detail), which moves civilcraft.js's keyboard,
 * pointer, picking, overlay, draft, Edit-group, command and profile-view code out of init() into keys-ui / pointer-ui / pick-ui / overlay-ui /
 * draft-ui / edit-ui / command-ui / profile-ui. One page load with the sample site, by real keys and clicks, failing on any console or page error
 * (how a missed closure variable or a call before a mount shows). The same file runs on the ORIGINAL main and on the split one. browser-main-10.mjs
 * covers Properties, exports and dialogs; this covers what it does not touch:
 *   keys (A, R, I, M, G, Enter, Escape, Backspace, Delete, Ctrl+A/C/V/Z/Y, arrows, +/-), the plan pointer (clicks, hover status, Shift+drag
 *   box select, wheel zoom, a PI grip drag), the profile view (start from the ground, add a PVI by a click, drag, dblclick fit, close),
 *   copy / paste in place of points, Delete of a selected alignment, Fit.
 *   node tools/civilcraft-test/browser-split-11.mjs        (VPS or workstation, like browser-main-10.mjs)
 */
import { launch, labCookie, machine, BASE } from '../gpu-remote/browser.mjs';

const E0 = 6150000, N0 = 2080000;
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
await ctx.addCookies(labCookie());
const page = await ctx.newPage();
page.setDefaultTimeout(30000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + ' @ ' + String(e.stack || '').split('\n').slice(1, 3).map((x) => x.trim().replace(/^at /, '')).join(' < ')));
const W = (f, a) => page.evaluate(f, a);
const scr = (x, y) => W(([a, b]) => window.civilcraft.toScreen(a, b), [x, y]);
const clickWorld = async (x, y) => { const s = await scr(x, y); await page.mouse.click(s.x, s.y); await page.waitForTimeout(40); };
const key = async (k) => { await page.keyboard.press(k); await page.waitForTimeout(120); };
const st = () => W(() => { const c = window.civilcraft, s = c.project.state; return { pts: c.project.points.length, al: s.alignments.length, pads: s.pads.length, tool: c.tool, picked: c.picked.length, sel: c.sel, pvis: s.alignments[0]?.pvis?.length ?? 0 }; });

try {
  console.log('machine: ' + await machine(page));
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.civilcraft?.project, null, { timeout: 40000 });
  await page.click('[data-autosave-discard-all]', { timeout: 1500 }).catch(() => {});
  await page.click('[data-sample]');
  await page.waitForSelector('[data-import][open]');
  await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276, null, { timeout: 40000 });
  ok(true, 'the sample site is open (276 points)');
  await page.focus('[data-over]').catch(() => {});

  // ---- plan pointer + keys: hover, alignment by clicks, Backspace, Enter ----
  const c0 = await scr(E0 + 150, N0 + 150);
  await page.mouse.move(c0.x, c0.y); await page.mouse.move(c0.x + 5, c0.y + 5); await page.waitForTimeout(150);
  ok(/\d/.test(await page.textContent('[data-coords]')), 'hover: the status bar shows the cursor coordinates', await page.textContent('[data-coords]'));
  await key('a');
  ok((await st()).tool === 'alignment', 'A picks the alignment tool');
  for (const [u, v] of [[10, 260], [200, 230], [300, 40], [350, 35], [390, 30]]) await clickWorld(E0 + u, N0 + v);
  await key('Backspace');
  await key('Enter');
  await page.waitForTimeout(300);
  ok((await st()).al === 1, 'Enter finishes the alignment (Backspace dropped the last click)');
  const pis = await W(() => window.civilcraft.project.state.alignments[0].pis.length);
  ok(pis === 4, 'the alignment has 4 PIs (5 clicks, one taken back)', String(pis));

  // ---- a PI grip drag and undo / redo ----
  const pi = await W(() => ({ ...window.civilcraft.project.state.alignments[0].pis[1] }));
  const g = await scr(pi.x, pi.y);
  await page.mouse.move(g.x, g.y); await page.mouse.down(); await page.mouse.move(g.x + 30, g.y + 12, { steps: 5 }); await page.mouse.up();
  await page.waitForTimeout(150);
  const moved = await W(() => window.civilcraft.project.state.alignments[0].pis[1].x);
  ok(Math.abs(moved - pi.x) > 1, 'a PI grip drags');
  await key('Control+z');
  ok(await W((x) => Math.abs(window.civilcraft.project.state.alignments[0].pis[1].x - x) < 1e-9, pi.x), 'Ctrl+Z puts the PI back');
  await key('Control+y');
  ok(await W((x) => Math.abs(window.civilcraft.project.state.alignments[0].pis[1].x - x) < 1e-9, moved), 'Ctrl+Y moves it again');

  // ---- profile view ----
  await key('r');
  ok(await page.isVisible('[data-profile-panel]'), 'R shows the profile view');
  await W(() => document.querySelector('[data-start-profile]')?.click());
  await page.waitForTimeout(300);
  ok((await st()).pvis === 2, 'design profile started from the ground (2 PVIs)', String((await st()).pvis));
  await W(() => document.querySelector('[data-pvi-add]').click());
  const mid = await W(() => { const p = window.civilcraft.project, a = p.state.alignments[0], al = p.alignment(a); const sta = al.start + al.length / 2; return window.civilcraft.profToScreen(sta, Math.max(a.pvis[0].z, a.pvis[1].z) + 3); });
  await page.mouse.move(mid.x, mid.y); await page.waitForTimeout(80);
  await page.mouse.click(mid.x, mid.y); await page.waitForTimeout(250);
  ok((await st()).pvis === 3, 'Add PVI + a click in the profile adds a PVI', String((await st()).pvis));
  const z0 = await W(() => window.civilcraft.project.state.alignments[0].pvis[1].z);
  const pv = await W(() => { const a = window.civilcraft.project.state.alignments[0]; return window.civilcraft.profToScreen(a.pvis[1].sta, a.pvis[1].z); });
  await page.mouse.move(pv.x, pv.y); await page.mouse.down(); await page.mouse.move(pv.x, pv.y - 25, { steps: 5 }); await page.mouse.up();
  await page.waitForTimeout(200);
  const z1 = await W(() => window.civilcraft.project.state.alignments[0].pvis[1].z);
  ok(z1 !== z0, 'a PVI drags in the profile', `${z0} -> ${z1}`);
  await page.dblclick('[data-prof]'); await page.waitForTimeout(150);
  const armed0 = await page.getAttribute('[data-pvi-add]', 'aria-pressed');
  await key('i');
  const armed1 = await page.getAttribute('[data-pvi-add]', 'aria-pressed');
  ok(armed1 !== armed0, 'I switches Add PVI', `${armed0} -> ${armed1}`);
  if (armed1 === 'true') await key('i');
  await page.click('[data-prof-close]');
  await page.waitForTimeout(150);
  ok(!(await page.isVisible('[data-profile-panel]')), 'the profile view closes');

  // ---- pad by clicks (draft) + measure ----
  await page.focus('[data-over]').catch(() => {});
  await key('Escape');
  await key('g');
  for (const [u, v] of [[60, 60], [140, 60], [140, 140], [60, 140]]) await clickWorld(E0 + u, N0 + v);
  await key('Enter');
  await page.waitForTimeout(400);
  ok((await st()).pads === 1, 'G + four clicks + Enter makes a pad', JSON.stringify(await st()));
  await key('Escape'); await key('Escape');
  await key('m');
  await clickWorld(E0 + 20, N0 + 20); await clickWorld(E0 + 120, N0 + 90);
  await page.waitForTimeout(200);
  ok((await st()).tool === 'measure', 'M measures (two clicks)');
  await key('Escape'); await key('Escape');

  // ---- Edit group: select all, copy, paste in place, undo; box select; delete ----
  await page.focus('[data-over]').catch(() => {});
  await key('v');
  await key('Control+a');
  ok((await st()).picked === 276, 'Ctrl+A picks every point', String((await st()).picked));
  await W(() => window.civilcraft.command('copy'));
  await page.waitForTimeout(400);
  ok(((await W(() => window.civilcraft.clip()))?.points?.length ?? (await W(() => window.civilcraft.clip()))?.pts?.length ?? 0) > 0 || !!(await W(() => window.civilcraft.clip())), 'Copy keeps the points');
  await W(() => window.civilcraft.command('paste-in-place'));
  await page.waitForTimeout(500);
  let s = await st();
  if (s.tool === 'paste') { await key('Enter'); await page.waitForTimeout(400); s = await st(); }
  ok(s.pts === 552, 'Paste in place adds the copies', JSON.stringify(s));
  await key('Control+z'); await page.waitForTimeout(300);
  ok((await st()).pts === 276, 'Ctrl+Z takes the paste back', String((await st()).pts));
  await key('Escape'); await key('Escape');
  const b0 = await scr(E0 + 0, N0 + 0), b1 = await scr(E0 + 200, N0 + 200);
  await page.keyboard.down('Shift');
  await page.mouse.move(b0.x, b0.y); await page.mouse.down(); await page.mouse.move(b1.x, b1.y, { steps: 8 }); await page.mouse.up();
  await page.keyboard.up('Shift');
  await page.waitForTimeout(200);
  ok((await st()).picked > 0, 'Shift+drag box-selects points', String((await st()).picked));
  await key('Escape'); await key('Escape');
  await W(() => window.civilcraft.select({ kind: 'alignment', id: window.civilcraft.project.state.alignments[0].id }));
  await page.focus('[data-over]').catch(() => {});
  await key('Delete');
  ok((await st()).al === 0, 'Delete removes the selected alignment');
  await key('Control+z');
  ok((await st()).al === 1, 'Ctrl+Z brings it back');

  // ---- view: wheel, arrows, +/-, Fit ----
  const zA = await W(() => window.civilcraft.view.zoom);
  await page.mouse.move(c0.x, c0.y); await page.mouse.wheel(0, -300); await page.waitForTimeout(200);
  const zB = await W(() => window.civilcraft.view.zoom);
  ok(zB !== zA, 'the wheel zooms the plan', `${zA} -> ${zB}`);
  await page.focus('[data-over]').catch(() => {});
  await key('-'); await key('ArrowLeft');
  await key('f'); await page.waitForTimeout(200);
  ok(true, 'arrows, - and F ran');

  ok(problems.length === 0, 'no console or page errors', problems.slice(0, 3).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL threw: ' + e.message.split('\n')[0]);
  for (const p of problems.slice(0, 5)) console.log('       ' + p);
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

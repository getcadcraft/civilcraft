#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * browser-cmdline.mjs: BK.34 in the real pages. The command line docked in the status strip (assets/js/app-cmdline.js): what is typed
 * anywhere (focus not in a field) lands in it, the history opens on focus and the arrows walk it, Enter runs the word. BimCraft in
 * Duncan's layout (the layout with "command": true); the classic layout stays as it was (no docked line, W still starts the Wall tool).
 * CadCraft (its own command line) is opened in the same layout to prove nothing of it is taken.
 *
 *   node tools/shell-test/browser-cmdline.mjs [--apps bimcraft,cadcraft]
 * Run as root. One browser, one page at a time. The DOM-free half is node bin/test-app-cmdline.mjs.
 */
import { openLab } from './lab-page.mjs';

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APPS = (arg('--apps') || 'bimcraft,cadcraft').split(',');
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + (typeof d === 'string' ? d : JSON.stringify(d)) + ')' : '')); } };
const st = (page) => page.evaluate(() => { const f = document.querySelector('[data-ws-cmd]'), p = document.querySelector('.ws-cmd-pop');
  return { val: f?.value ?? null, focus: document.activeElement === f, open: !!p && !p.hidden, rows: p ? [...p.children].map((l) => l.getAttribute('data-ws-cmd-row')) : [], marked: p ? [...p.children].findIndex((l) => l.getAttribute('aria-selected') === 'true') : -1,
    tool: window.bimcraftPlan?.state?.tool ?? null, hist: window.ccInput?.history?.items.slice() ?? null, label: p?.getAttribute('aria-label') || '' }; });
const idle = async (page) => { await page.keyboard.press('Escape'); await page.evaluate(() => { document.activeElement?.blur?.(); }); await page.waitForTimeout(150); };

const lab = await openLab('bkcmdline');
try {
  if (APPS.includes('bimcraft')) {
    console.log('\n== bimcraft, Duncan layout: the docked command line');
    const { ctx, page, errors } = await lab.page('bimcraft', { layout: 'duncan', storage: { 'bimcraft.model.units': 'mm' } });
    await page.waitForFunction(() => !!window.bimcraftPlan?.state?.data && !!window.ccInput, null, { timeout: 30000 }).catch(() => {});
    await page.evaluate(() => { try { localStorage.removeItem('cc-cmd-history:bimcraft'); } catch (e) { /* none */ } window.ccInput.history.items.length = 0; });
    const made = await page.evaluate(() => ({ fields: document.querySelectorAll('[data-ws-cmd]').length, inStrip: !!document.querySelector('.ws-statusbar [data-ws-cmd]'), other: [...document.querySelectorAll('[data-input-cmdline]')].filter((n) => n.offsetParent !== null).length,
      floating: (() => { const f = document.querySelector('.ws-cmdline').getBoundingClientRect(), c = document.querySelector('[data-plan-canvas]')?.getBoundingClientRect(); return !!c && f.top < c.bottom - 2 && f.bottom > c.top && f.left < c.right && f.right > c.left; })() }));
    ok(made.fields === 1 && made.inStrip && made.other === 0, 'one command line, in the status strip, and no second one on screen', made);
    ok(!made.floating, 'it does not lie over the drawing');
    await idle(page);
    let s = await st(page);
    ok(s.val === '' && !s.focus && !s.open && s.tool === 'select', 'at rest: empty, not focused, nothing open');
    // type anywhere
    await page.keyboard.type('wall', { delay: 30 });
    await page.waitForTimeout(200);
    s = await st(page);
    ok(s.val === 'wall' && s.focus, 'typed with the focus nowhere: the four letters are in the docked command line (' + s.val + ')');
    ok(s.tool === 'select', 'the W of "wall" did not start the Wall tool on its own (the app\'s W key waits for Enter here)');
    ok(s.open && s.rows[0] === 'WALL', 'while typing, the commands that match are listed, the exact one first', s.rows);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.bimcraftPlan.state.tool === 'wall', null, { timeout: 5000 }).catch(() => {});
    s = await st(page);
    ok(s.tool === 'wall' && s.val === '' && !s.focus, 'Enter runs it: the Wall tool is on, the line is empty and the keys are back with the drawing', s);
    ok(JSON.stringify(s.hist) === '["WALL"]', 'the word is in the history', s.hist);
    // a running tool keeps its digits (typed lengths)
    await page.keyboard.press('5');
    await page.waitForTimeout(150);
    s = await st(page);
    ok(s.val === '', 'while the Wall tool runs a digit stays the tool\'s (a typed length), it does not go to the command line');
    await page.evaluate(() => { const i = document.querySelector('[data-model-typed]'); if (i) i.value = ''; });
    await idle(page); await idle(page);
    // a key as a word, ended with Space
    await page.keyboard.type('d'); await page.keyboard.press('Space');
    await page.waitForFunction(() => window.bimcraftPlan.state.tool === 'door', null, { timeout: 5000 }).catch(() => {});
    s = await st(page);
    ok(s.tool === 'door' && JSON.stringify(s.hist) === '["WALL","D"]', 'D then Space: the Door tool (a command\'s key works as its word)', s);
    await idle(page); await idle(page);
    // history on focus, arrows
    await page.click('[data-ws-cmd]');
    await page.waitForTimeout(200);
    s = await st(page);
    ok(s.open && JSON.stringify(s.rows) === '["WALL","D"]' && /before/i.test(s.label), 'focus opens the history (oldest at the top, newest by the field)', s);
    await page.keyboard.press('ArrowUp'); let a1 = await st(page);
    await page.keyboard.press('ArrowUp'); let a2 = await st(page);
    await page.keyboard.press('ArrowDown'); let a3 = await st(page);
    ok(a1.val === 'D' && a1.marked === 1 && a2.val === 'WALL' && a2.marked === 0 && a3.val === 'D', 'Up walks back through it (D, then WALL), Down comes forward again', [a1.val, a2.val, a3.val]);
    await page.keyboard.press('ArrowUp'); await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.bimcraftPlan.state.tool === 'wall', null, { timeout: 5000 }).catch(() => {});
    s = await st(page);
    ok(s.tool === 'wall', 'Enter on a history line runs it again');
    await idle(page); await idle(page);
    // Esc empties
    await page.keyboard.type('wi'); await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    s = await st(page);
    ok(s.val === '' && !s.focus && !s.open, 'Esc empties the line, closes the list and gives the keys back');
    // a field keeps its own typing
    const typedInField = await page.evaluate(() => { const i = document.createElement('input'); i.type = 'text'; i.id = 'bk34-field'; document.body.append(i); i.focus(); return document.activeElement === i; });
    await page.keyboard.type('wa'); await page.waitForTimeout(150);
    const fv = await page.evaluate(() => { const i = document.getElementById('bk34-field'), v = i.value; i.remove(); return v; });
    s = await st(page);
    ok(typedInField && fv === 'wa' && s.val === '', 'typing in a field stays in the field', [fv, s.val]);
    // Ctrl keys are not typing
    await idle(page);
    await page.keyboard.press('Control+k'); await page.waitForTimeout(400);
    const pal = await page.evaluate(() => !!document.querySelector('.shell-palette-input') && document.querySelector('.shell-palette-input').offsetParent !== null);
    s = await st(page);
    ok(pal && s.val === '', 'Ctrl+K still opens the command finder (a Ctrl key is not typing)');
    await page.keyboard.press('Escape'); await idle(page);
    // an unknown word goes to the finder
    await page.keyboard.type('zzqq'); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
    const pv = await page.evaluate(() => document.querySelector('.shell-palette-input')?.value || '');
    ok(pv.toLowerCase() === 'zzqq', 'a word no command answers to opens the command finder with it (' + pv + ')');
    await page.keyboard.press('Escape'); await idle(page);
    // the history is kept across a reload
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.ccInput?.history, null, { timeout: 30000 }).catch(() => {});
    const h2 = await page.evaluate(() => window.ccInput.history.items.slice());
    ok(JSON.stringify(h2) === '["WALL","D","WALL","ZZQQ"]', 'after a reload the history is still there', h2);
    ok(errors.length === 0, 'no page errors', errors.slice(0, 3));
    await ctx.close();

    console.log('\n== bimcraft, classic layout: unchanged');
    const c = await lab.page('bimcraft', { layout: 'standard', storage: { 'bimcraft.model.units': 'mm' } });
    await c.page.waitForFunction(() => !!window.bimcraftPlan?.state?.data, null, { timeout: 30000 }).catch(() => {});
    await idle(c.page);
    const none = await c.page.evaluate(() => document.querySelectorAll('[data-ws-cmd]').length);
    await c.page.keyboard.press('w'); await c.page.waitForTimeout(400);
    const tool = await c.page.evaluate(() => window.bimcraftPlan.state.tool);
    ok(none === 0 && tool === 'wall', 'no docked line there, and W starts the Wall tool at once as before', [none, tool]);
    ok(c.errors.length === 0, 'no page errors', c.errors.slice(0, 3));
    await c.ctx.close();
  }
  if (APPS.includes('cadcraft')) {
    console.log('\n== cadcraft, Duncan layout: its own command line keeps the typing');
    const { ctx, page, errors } = await lab.page('cadcraft', { layout: 'duncan' });
    await page.waitForTimeout(1500);
    await idle(page);
    await page.keyboard.type('line', { delay: 30 }); await page.waitForTimeout(300);
    const r = await page.evaluate(() => ({ docked: document.querySelector('[data-ws-cmd]')?.value ?? null, own: [...document.querySelectorAll('input')].filter((i) => i.offsetParent !== null && /line/i.test(i.value) && !i.hasAttribute('data-ws-cmd')).length }));
    ok((r.docked === null || r.docked === '') && r.own >= 1, 'the letters went to CadCraft\'s own command line, none to a second one', r);
    await page.keyboard.press('Escape');
    ok(errors.length === 0, 'no page errors', errors.slice(0, 3));
    await ctx.close();
  }
} finally { await lab.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

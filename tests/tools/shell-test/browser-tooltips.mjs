#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * browser-tooltips.mjs: BK.33 in the real pages (BimCraft, then CadCraft for the shared half).
 *   Two stages   a control that runs a command shows its name and shortcut almost at once, and one line of description a moment
 *                later; a control that is off keeps its reason; a control that is not a command keeps its plain tooltip.
 *                In Duncan's layout (a command line on screen) a tool row button says the same as the app's own button.
 *   Rollover     with the Select tool, resting the pointer on a wall, a door, a window, a dimension (and a room when the model has
 *                one) shows its type, level, size and, for a wall, straight or skew: without selecting it. Every one of them is a
 *                Bootstrap tooltip (.tooltip) of the one engine.
 *
 *   node tools/shell-test/browser-tooltips.mjs [--apps bimcraft,cadcraft]
 * Run as root. One browser, one page at a time. The DOM-free halves: node bin/test-bim-rollover.mjs.
 */
import { openLab } from './lab-page.mjs';

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APPS = (arg('--apps') || 'bimcraft,cadcraft').split(',');
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + (typeof d === 'string' ? d : JSON.stringify(d)) + ')' : '')); } };
const tip = (page) => page.evaluate(() => { const t = [...document.querySelectorAll('.tooltip.cc-tip.show, .tooltip.cc-tip')].pop(); if (!t) return null; const q = (s) => [...t.querySelectorAll(s)].map((n) => n.textContent);
  return { stage: t.getAttribute('data-cc-stage'), name: q('.cc-tip-name')[0] || '', keys: q('kbd'), typed: q('.cc-tip-typed')[0] || '', desc: q('.cc-tip-desc')[0] || '', lines: q('.cc-tip-line'), text: t.querySelector('.tooltip-inner').textContent, bootstrap: t.classList.contains('tooltip') && !!t.querySelector('.tooltip-arrow') }; });
const over = async (page, sel) => { const b = await page.locator(sel).first().boundingBox({ timeout: 5000 }).catch(() => null); if (!b) return false; await page.mouse.move(5, 5); await page.waitForTimeout(350); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 }); return true; };

const lab = await openLab('bktooltips');
const stacks = (page) => { const out = []; page.on('pageerror', (e) => out.push(String(e.stack || e.message).split('\n').slice(0, 4).join(' | '))); return out; };
try {
  if (APPS.includes('bimcraft')) {
    console.log('\n== bimcraft, classic layout: two-stage tooltips');
    const { ctx, page, errors } = await lab.page('bimcraft', { layout: 'standard', storage: { 'bimcraft.model.units': 'mm' } });
    const where = stacks(page);
    await page.waitForFunction(() => !!window.bimcraftPlan?.state?.data && !!window.ccInput?.describe, null, { timeout: 30000 }).catch(() => {});
    ok(await over(page, '[data-mtool="wall"]'), 'the Wall tool is on screen');
    await page.waitForTimeout(420);
    let t1 = await tip(page);
    ok(t1 && t1.stage === '1' && t1.name === 'Wall' && t1.keys.join() === 'W' && t1.desc === '', 'stage 1 (within half a second): the name and the shortcut, nothing else', t1);
    ok(t1?.bootstrap, 'it is a Bootstrap tooltip');
    await page.waitForTimeout(1000);
    let t2 = await tip(page);
    ok(t2 && t2.stage === '2' && t2.name === 'Wall' && t2.keys.join() === 'W' && t2.desc === 'Draw walls: click, click; Esc ends', 'stage 2 (a moment later): one line of description under it, the key not repeated', t2);
    const nat = await page.evaluate(() => document.querySelector('[data-mtool="wall"]').hasAttribute('title'));
    ok(!nat, 'no browser-native title bubble is left on the button');
    // leaving ends it; coming back starts at stage 1 again
    await over(page, '[data-mtool="wall"]'); await page.waitForTimeout(420);
    t1 = await tip(page);
    ok(t1?.stage === '1' && t1.desc === '', 'pointing at it again starts at stage 1');
    // a command with no description of its own: one stage only
    await page.evaluate(() => { const b = [...document.querySelectorAll('[data-toolbar] button')].find((x) => x.offsetParent !== null && window.ccInput.describe(x)?.id === 'edit.undo'); if (b) b.setAttribute('data-bk33-undo', ''); });
    ok(await over(page, '[data-bk33-undo]'), 'Undo is on screen');
    await page.waitForTimeout(1500);
    const u = await tip(page);
    ok(u && u.stage === null && u.name === '' && u.text.length > 3 && u.text !== 'Undo', 'Undo is off in a new model: its tooltip is the reason ("' + (u?.text || '') + '"), not the command card', u);
    // every command the toolbar shows gets a name from the registry, and never the same words twice
    const all = await page.evaluate(() => [...document.querySelectorAll('[data-toolbar] button, [data-modelbar] button')].filter((b) => b.offsetParent !== null).map((b) => window.ccInput.describe(b)).filter(Boolean));
    ok(all.length >= 40 && all.every((d) => d.name && d.desc.toLowerCase() !== d.name.toLowerCase()), all.length + ' controls on screen answer with a command name; none repeats its name as its description', all.filter((d) => d.desc.toLowerCase() === d.name.toLowerCase()).slice(0, 3));
    ok(all.filter((d) => d.desc).length >= 20, all.filter((d) => d.desc).length + ' of them have a description line (read from the command\'s own button, not written again)');
    ok(all.every((d) => !/\((Ctrl\+)?[A-Z0-9]\)$/.test(d.desc)), 'no description ends with a key in brackets (stage 1 shows the key of the style in use)', all.filter((d) => /\((Ctrl\+)?[A-Z0-9]\)$/.test(d.desc)).slice(0, 3));
    // a control that is off keeps its reason
    const off = await page.evaluate(() => { const b = document.querySelector('[data-mtool="wall"]'); b.setAttribute('aria-disabled', 'true'); const r = window.ccTooltips && window.ccInput.describe(b); b.removeAttribute('aria-disabled'); return r; });
    await page.evaluate(() => { const b = document.createElement('button'); b.id = 'bk33-off'; b.title = 'Open a model first'; b.setAttribute('aria-disabled', 'true'); b.setAttribute('data-cmd', 'model.wall'); b.textContent = 'x'; b.style.cssText = 'position:fixed;left:400px;top:300px;z-index:99999'; document.body.append(b); });
    await over(page, '#bk33-off'); await page.waitForTimeout(700);
    const r = await tip(page);
    ok(r && r.stage === null && r.text === 'Open a model first', 'a control that is off shows its reason, not the command card', r);
    await page.evaluate(() => { const b = document.getElementById('bk33-off'); b.removeAttribute('aria-disabled'); b.removeAttribute('data-cmd'); b.title = 'Just a note'; });
    await over(page, '#bk33-off'); await page.waitForTimeout(700);
    const p = await tip(page);
    ok(p && p.stage === null && p.text === 'Just a note', 'a control that is not a command keeps its plain tooltip', p);
    await page.evaluate(() => document.getElementById('bk33-off').remove());
    void off;

    console.log('\n== bimcraft: rollover information on the plan');
    await page.click('[data-model-layout="plan"]').catch(() => {});
    await page.waitForTimeout(500);
    const at = (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
    const click = async (x, y) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py); await page.waitForTimeout(140); };
    const nWalls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.length);
    const w0 = await nWalls();
    await page.evaluate(() => document.querySelector('[data-mtool="wall"]').click());
    for (const [x, y] of [[1000, 1000], [7000, 1000], [7000, 5000], [1000, 5000], [1000, 1000]]) await click(x, y);
    await page.keyboard.press('Escape');
    await page.waitForFunction((n) => window.bimcraftPlan.state.data.walls.length >= n + 4, w0, { timeout: 15000 }).catch(() => {});
    // a fifth wall off square: from the middle of the bottom wall to (5500, 3000): atan(1500/2000) = 36.87 degrees off the vertical
    await page.evaluate(() => document.querySelector('[data-mtool="wall"]').click());
    await click(4000, 1000); await click(5500, 3000);
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    await page.waitForFunction((n) => window.bimcraftPlan.state.data.walls.length >= n + 5, w0, { timeout: 15000 }).catch(() => {});
    ok(await nWalls() - w0 >= 5, 'a 6 m x 4 m room and one wall off square are drawn (' + (await nWalls() - w0) + ' walls)');
    // a door in the top wall, a window in the left wall
    await page.evaluate(() => document.querySelector('[data-mtool="door"]').click());
    await click(3000, 5000);
    await page.evaluate(() => document.querySelector('[data-mtool="window"]').click());
    await click(1000, 3000);
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    await page.waitForFunction(() => window.bimcraftPlan.state.data.openings.length >= 2 && window.bimcraftPlan.state.tool === 'select', null, { timeout: 15000 }).catch(() => {});
    await page.evaluate(() => window.bimcraftPlan.view && document.querySelector('[data-model-fit]')?.click());
    await page.waitForTimeout(600);
    const rest = async (x, y, ms = 750) => { const [px, py] = await at(x, y); await page.mouse.move(px - 40, py - 40); await page.waitForTimeout(120); await page.mouse.move(px, py, { steps: 3 }); await page.waitForTimeout(ms); return page.evaluate(() => ({ r: window.ccTooltips.rollover(), sel: window.bimcraftPlan.view.selection.size })); };
    let h = await rest(6000, 1000);
    ok(h.r && /^Wall: /.test(h.r.title) && h.r.lines.includes('Level: Level 1') && h.r.lines.some((l) => /^Length 6[.,]?\d* ?\d* ?mm|^Length 6\d{3}/.test(l) && /thickness/.test(l)) && h.r.lines.includes('Straight: square to the walls it joins'), 'a wall: type, level, size, straight', h.r);
    ok(h.sel === 0, 'nothing was selected to read it');
    const shown = await tip(page);
    ok(shown?.bootstrap && shown.stage === 'roll' && shown.name === h.r?.title && shown.lines.length === h.r?.lines.length, 'it is drawn as a Bootstrap tooltip by the pointer, title and lines', shown);
    h = await rest(4750, 2000);
    ok(h.r && /^Wall: /.test(h.r.title) && h.r.lines.some((l) => /^Skew: 36\.9° off square/.test(l)), 'the wall drawn off square says skew, by 36.9 degrees', h.r);
    const door = await page.evaluate(() => { const S = window.bimcraftPlan.state, o = S.data.openings.find((x) => x.kind === 'door'), w = S.data.walls.find((x) => x.id === o.wall), L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]), u = [(w.b[0] - w.a[0]) / L, (w.b[1] - w.a[1]) / L], m = o.offset + o.width / 2; return { p: [w.a[0] + u[0] * m, w.a[1] + u[1] * m], width: o.width, height: o.height }; });
    h = await rest(door.p[0], door.p[1]);
    ok(h.r && /^Door: \S/.test(h.r.title) && h.r.lines.includes('Level: Level 1') && h.r.lines.some((l) => / wide, .* high$/.test(l)) && h.r.lines.some((l) => /^In wall: /.test(l)), 'a door: type, level, size, its wall', h.r);
    const win = await page.evaluate(() => { const S = window.bimcraftPlan.state, o = S.data.openings.find((x) => x.kind === 'window'), w = S.data.walls.find((x) => x.id === o.wall), L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]), u = [(w.b[0] - w.a[0]) / L, (w.b[1] - w.a[1]) / L], m = o.offset + o.width / 2; return [w.a[0] + u[0] * m, w.a[1] + u[1] * m]; });
    h = await rest(win[0], win[1]);
    ok(h.r && /^Window: \S/.test(h.r.title) && h.r.lines.some((l) => /^Sill at /.test(l)), 'a window: type, size and sill', h.r);
    // a dimension: the overall dimension of the right wall, found from the plan's own scene
    const dim = await page.evaluate(() => { const pv = window.bimcraftPlan.view, ds = (pv.scene.dims || []).filter((d) => d.overall); const d = ds.find((x) => Math.abs(x.a[0] - x.b[0]) < 1 && x.a[0] > 6500) || ds[0]; if (!d) return null;
      const L = Math.hypot(d.b[0] - d.a[0], d.b[1] - d.a[1]), n = [-(d.b[1] - d.a[1]) / L, (d.b[0] - d.a[0]) / L], off = d.offPx !== undefined ? d.offPx / pv.scale : d.off || 0; return { p: [(d.a[0] + d.b[0]) / 2 + n[0] * off, (d.a[1] + d.b[1]) / 2 + n[1] * off], text: d.text }; });
    if (dim) {
      h = await rest(dim.p[0], dim.p[1]);
      ok(h.r && h.r.title === 'Dimension' && h.r.lines[0] === 'Length: ' + dim.text && /^The whole wall, measured from: /.test(h.r.lines[1]), 'a dimension: its length, what it measures and from which face', h.r);
    } else ok(false, 'the plan shows dimensions');
    const room = await page.evaluate(() => { const r = (window.bimcraftPlan.view.scene.rooms || [])[0]; return r ? r.at : null; });
    if (room) { h = await rest(room[0], room[1] + 600); ok(h.r && /^Room: /.test(h.r.title) && h.r.lines.some((l) => /^Area: /.test(l)), 'a room: its name, level and area', h.r); }
    else console.log('  note the model has no room element (rooms are made with the Room tool): the room line is covered by bin/test-bim-rollover.mjs');
    // it goes on a press, and does not come while a tool runs
    h = await rest(6000, 1000);
    await page.mouse.down(); await page.waitForTimeout(150);
    const gone = await page.evaluate(() => window.ccTooltips.rollover());
    await page.mouse.up(); await page.keyboard.press('Escape');
    ok(h.r && gone === null, 'a press takes it away');
    await page.evaluate(() => document.querySelector('[data-mtool="wall"]').click());
    h = await rest(6000, 1000);
    ok(h.r === null, 'while a Draw tool runs there is no rollover (the tool has its own hover marks)');
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    ok(errors.length === 0, 'no page errors', where.slice(0, 3));
    await ctx.close();

    console.log('\n== bimcraft, Duncan layout: the tool rows say the same');
    const d = await lab.page('bimcraft', { layout: 'duncan', storage: { 'bimcraft.model.units': 'mm' } });
    await d.page.waitForFunction(() => !!window.bimcraftPlan?.state?.data && !!window.ccInput?.describe, null, { timeout: 30000 }).catch(() => {});
    const rows = await d.page.evaluate(() => [...document.querySelectorAll('.tr-row [data-ws-command]')].filter((b) => b.offsetParent !== null).map((b) => ({ id: b.dataset.wsCommand, d: window.ccInput.describe(b) })));
    const wallBtn = rows.find((r) => r.d?.id === 'model.wall');
    ok(rows.length >= 10 && rows.filter((r) => r.d).length >= rows.length * 0.6, rows.filter((r) => r.d).length + ' of ' + rows.length + ' tool row buttons answer with their command', rows.filter((r) => !r.d).map((r) => r.id).slice(0, 12));
    ok(!!wallBtn && wallBtn.d.keys.join() === 'W' && wallBtn.d.desc === 'Draw walls: click, click; Esc ends', 'the Wall button of the tool rows: W, and the description of the app\'s own Wall button', wallBtn);
    if (wallBtn) {
      await over(d.page, `.tr-row [data-ws-command="${wallBtn.id}"]`); await d.page.waitForTimeout(1500);
      const t = await tip(d.page);
      ok(t && t.stage === '2' && t.name === 'Wall' && t.keys.join() === 'W' && t.desc === 'Draw walls: click, click; Esc ends', 'hovering it shows both stages', t);
    }
    const typed = rows.map((r) => r.d).filter((x) => x && x.typed);
    ok(typed.length >= 1 && typed.every((x) => x.typed === x.name.toUpperCase() || /^[A-Z0-9]+$/.test(x.typed)), 'with the command line on screen, a command without a key shows the word to type (' + (typed[0]?.typed || '') + ')', typed.slice(0, 2));
    ok(d.errors.length === 0, 'no page errors', d.errors.slice(0, 3));
    await d.ctx.close();
  }
  if (APPS.includes('cadcraft')) {
    console.log('\n== cadcraft: the same engine');
    const { ctx, page, errors } = await lab.page('cadcraft', { layout: 'standard' });
    await page.waitForFunction(() => !!window.ccInput?.describe, null, { timeout: 30000 }).catch(() => {});
    const all = await page.evaluate(() => [...document.querySelectorAll('main [role="toolbar"] button')].filter((b) => b.offsetParent !== null).map((b) => ({ sel: b.getAttribute('data-cmd') || '', d: window.ccInput.describe(b) })).filter((x) => x.d));
    ok(all.length >= 20, all.length + ' toolbar controls answer with a command name', all.length);
    const one = all.find((x) => x.d.desc && x.sel);
    if (one) {
      await over(page, `main [role="toolbar"] button[data-cmd="${one.sel}"]`); await page.waitForTimeout(450);
      const a = await tip(page); await page.waitForTimeout(1000); const b = await tip(page);
      ok(a?.stage === '1' && a.name === one.d.name && b?.stage === '2' && b.desc === one.d.desc, 'two stages on ' + one.d.name + ': then "' + one.d.desc.slice(0, 50) + '"', [a, b]);
    } else console.log('  note no CadCraft toolbar button carries a description of its own: one stage (name and key) only');
    ok(errors.length === 0, 'no page errors', errors.slice(0, 3));
    await ctx.close();
  }
} finally { await lab.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

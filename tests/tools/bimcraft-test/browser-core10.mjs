#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-core10.mjs — the real /lab/bimcraft page, headless (session bim-core-10, 0.10): FX.188 Enter / Backspace / first Esc reach the older
 * sketch tool (Floor by outline) in the ribbon layout; FX.189 the classic layout at 1600x1000 leaves the plan pane free; FX.190 no page error
 * while the Wall tool is on a type the model has not read yet.
 *   node tools/bimcraft-test/browser-core10.mjs        run as root (a test staff session; one browser)
 */
import { openLab } from '../shell-test/lab-page.mjs';

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + (typeof d === 'string' ? d : JSON.stringify(d)) + ')' : '')); } };
const lab = await openLab('bimcore10');
async function start(layout) {
  const { ctx, page } = await lab.page('bimcraft', { layout, viewport: { width: 1600, height: 1000 }, storage: { 'bimcraft.model.units': 'mm' } });
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|status of 429/.test(m.text())) problems.push(m.text().slice(0, 200)); });
  const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 }).then(() => page.waitForTimeout(150));
  if (await page.isVisible('[data-empty] [data-new]')) { await page.click('[data-empty] [data-new]'); await page.waitForSelector('dialog.bc-new'); await page.click('[data-new-ok]'); }
  await page.waitForFunction(() => window.bimcraftPlan?.state?.data && window.bimcraftPlan.view, null, { timeout: 60000 }); await settled();
  const at = (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
  const planClick = async (x, y) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py); await page.waitForTimeout(80); };
  return { ctx, page, problems, settled, planClick, at };
}
try {
  console.log('== FX.188: Floor by outline in the ribbon layout');
  let T = await start('docked'), page = T.page;
  await page.evaluate(() => window.bimcraftPlan.view.fit?.());
  await page.evaluate(() => { const b = document.querySelector('[data-mtool="drawfloor"]'); b.closest('details')?.setAttribute('open', ''); b.click(); });
  ok(await page.evaluate(() => document.querySelector('.bc').classList.contains('ws-active') && window.bimcraftPlan.state.tool === 'drawfloor'), 'ribbon layout, Floor by outline in hand');
  const st = () => page.evaluate(() => ({ pts: window.bimcraftFloors.state.pts.length, floors: window.bimcraftFloors.state.floors.length, tool: window.bimcraftPlan.state.tool }));
  for (const q of [[0, 0], [4000, 0], [4000, 3000], [0, 3000]]) await T.planClick(q[0], q[1]);
  ok((await st()).pts === 4, 'four corners down', await st());
  await page.keyboard.press('Backspace'); ok((await st()).pts === 3, 'Backspace takes the last corner back', await st());
  await page.keyboard.press('Enter'); await T.settled(); await page.waitForTimeout(300);
  let s = await st(); ok(s.pts === 0 && s.floors === 1, 'Enter finishes the outline: one floor, nothing half drawn', s);
  await T.planClick(0, 0); await T.planClick(2000, 0); await T.planClick(2000, 1000);
  await page.keyboard.press('Escape'); s = await st();
  ok(s.pts === 0 && s.tool === 'drawfloor', 'a first Esc drops the half-drawn outline and keeps the tool', s);
  ok(!T.problems.length, 'no page error', T.problems);
  await T.ctx.close();

  console.log('== FX.189: classic layout, 1600x1000, Wall tool on');
  T = await start('standard'); page = T.page;
  await page.evaluate(() => document.querySelector('[data-mtool="wall"]').click()); await page.waitForTimeout(600);
  const m = await page.evaluate(() => { const c = window.bimcraftPlan.view.canvas.getBoundingClientRect(); let f = 0, n = 0; for (let x = c.left + 4; x < c.right; x += 12) for (let y = c.top + 4; y < c.bottom; y += 12) { n++; if (document.elementFromPoint(x, y) === window.bimcraftPlan.view.canvas) f++; } return { free: Math.round(100 * f / n) }; });
  ok(m.free >= 30, 'the plan pane is ' + m.free + ' % free of the Draw bar and the tool rows (13 % before, 21 % in 0.9)', m);

  console.log('== PERF.57: the massing search waits for its panel');
  ok(await page.evaluate(() => { const b = document.querySelector('[data-eg58]'); return !!b && b.children.length === 0; }), 'start-up: the room-program (massing) panel has not been worked out or drawn: its search runs when the panel is first on screen');

  console.log('== FX.190: Wall tool, a type saved a moment ago (null while the model reloads)');
  const seg = await page.evaluate(async () => {
    const errs = []; window.addEventListener('error', (e) => errs.push(e.message));
    const S = window.bimcraftPlan.state; S.wall.typeKey = 'no-such-type-yet';
    const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect();
    const ev = (t, x, y) => pv.canvas.dispatchEvent(new PointerEvent(t, { clientX: r.left + x, clientY: r.top + y, bubbles: true, pointerId: 1, button: 0, isPrimary: true }));
    ev('pointermove', 120, 200); ev('pointerdown', 120, 200); ev('pointerup', 120, 200); ev('pointermove', 260, 210);
    await new Promise((res) => setTimeout(res, 300));
    return { errs, chain: !!S.chain };
  });
  ok(!seg.errs.length && !T.problems.length, 'no page error with the preview on an unreadable type', [seg, T.problems]);
  await T.ctx.close();

  console.log('== BK.175: the Duncan layout inside BimCraft: two rows, about 40 tools, the full sets under each arrow');
  T = await start('duncan'); page = T.page;
  const D = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.tr-toolrows [data-tr-row]')];
    const shown = rows.map((r) => [...r.querySelectorAll('.tr-group > button, .tr-group > .ws-tool')].filter((b) => b.offsetParent).length);
    const more = [...document.querySelectorAll('.tr-toolrows details.tr-more')];
    const inMore = more.map((d) => d.querySelectorAll('.tr-more-list button, .tr-more-list .ws-tool').length);
    const all = new Set([...document.querySelectorAll('.tr-toolrows [data-ws-cmd], .tr-toolrows [data-tr-id], .tr-toolrows button')].map((b) => b.dataset.wsCmd || b.dataset.trId || b.title)).size;
    const reach = new Set([...document.querySelectorAll('.tr-toolrows [data-ws-command]')].map((b) => b.dataset.wsCommand)), bar = [...new Set([...document.querySelectorAll('[data-mtool]')].map((b) => b.dataset.mtool))];
    return { reach: reach.size, bar: bar.length, missing: bar.filter((k) => !reach.has(k)).slice(0, 12), rows: rows.length, shown, groups: document.querySelectorAll('.tr-toolrows .tr-group').length, arrows: more.length, inMore, all, tear: !!document.querySelector('.tr-toolrows .ws-menubtn, .tr-toolrows [aria-label]'), cls: document.querySelector('.bc').className.includes('ws-active'), brand: !!document.querySelector('[data-ws-brand], .ws-brand') };
  });
  ok(D.rows === 2 && D.cls, 'the layout is on with two tool rows', D);
  const tot = D.shown.reduce((a, b) => a + b, 0);
  ok(tot >= 25 && tot <= 60, 'about 40 tools sit in the rows themselves (' + D.shown.join(' + ') + ' = ' + tot + ')', D);
  ok(D.arrows >= 2 && D.inMore.reduce((a, b) => a + b, 0) >= 40, 'a group with more tools than its row shows has its arrow, and the arrows hold the rest of the full sets (' + D.inMore.reduce((a, b) => a + b, 0) + ' more)', D);
  ok(D.reach >= D.bar * 0.9, 'nothing removed: ' + D.reach + ' of the build\'s ' + D.bar + ' Draw tools are in the rows or under an arrow (missing: ' + D.missing.join(' ') + ')', D);
  await page.evaluate(() => document.querySelector('.tr-toolrows details.tr-more > summary').click());
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => { const d = document.querySelector('.tr-toolrows details.tr-more[open]'); const l = d?.querySelector('.tr-more-list'); return !!l && l.getBoundingClientRect().height > 20; }), 'an arrow opens its list over the drawing');
  await page.evaluate(() => { const b = document.querySelector('.tr-toolrows details.tr-more[open] .tr-more-list button, .tr-toolrows details.tr-more[open] .tr-more-list .ws-tool'); b?.click(); });
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => window.bimcraftPlan?.state?.tool !== undefined), 'a tool picked from an arrow list is taken by the app (a tool is in hand: ' + await page.evaluate(() => window.bimcraftPlan?.state?.tool) + ')');
  ok(!T.problems.length, 'no page error in the Duncan layout', T.problems);
  await T.ctx.close();

  console.log('== PERF.8 / 23 / 37: the water treatment model opens in slices; picks with the trees = picks without');
  const { ctx, page: pg } = await lab.page('bimcraft', { layout: 'standard', viewport: { width: 1400, height: 900 }, storage: { 'bimcraft.model.units': 'mm' }, prepare: false });
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.evaluate(() => { window.__lt = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push(e.duration); }).observe({ type: 'longtask' }); } catch { /* none */ } });
  await pg.setInputFiles('[data-file]', '/var/www/CADCRAFT/getcadcraft.com/fixtures/showcase/bimcraft-water-treatment.ifc');
  await pg.waitForFunction(() => /Opened .*element/.test([...document.querySelectorAll('[data-status], [role="status"]')].map((e) => e.textContent.trim()).join(' ')), null, { timeout: 180000 });
  await pg.waitForFunction(() => { const v = document.querySelector('[data-canvas]')?.viewer; const L = v && [...v.layers.values()][0]; return L && L.edgesReady && L.meshes.every((m) => m.geometry.boundsTree); }, null, { timeout: 120000 });
  const r = await pg.evaluate(() => {
    const v = document.querySelector('[data-canvas]').viewer, L = [...v.layers.values()][0], b = v.canvas.getBoundingClientRect();
    const edges = L.edges.reduce((n, l) => n + l.userData.edges.positions.length / 6, 0);
    const pts = []; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 80; i++) pts.push([b.left + b.width * (0.15 + 0.7 * rnd()), b.top + b.height * (0.15 + 0.7 * rnd())]);
    const run = () => pts.map(([x, y]) => { const h = v.hitAt(x, y); return h ? h.id + ':' + h.point.map((c) => c.toFixed(3)).join(',') : '-'; });
    const t0 = performance.now(); const withTree = run(); const tTree = performance.now() - t0;
    const saved = L.meshes.map((m) => [m, m.geometry.boundsTree, m.raycast]);
    for (const [m] of saved) { m.geometry.boundsTree = null; m.raycast = Object.getPrototypeOf(m).raycast; }
    const t1 = performance.now(); const plain = run(); const tPlain = performance.now() - t1;
    for (const [m, bt, rc] of saved) { m.geometry.boundsTree = bt; m.raycast = rc; }
    const hits = plain.filter((x) => x !== '-').length;
    return { same: withTree.every((x, i) => x === plain[i]), hits, tTree: Math.round(tTree), tPlain: Math.round(tPlain), edges, lt: window.__lt.length ? [Math.round(Math.max(...window.__lt)), window.__lt.length] : [0, 0] };
  });
  ok(r.hits >= 10 && r.same, 'the same element and point under 80 rays, with the trees and without (' + r.hits + ' hits): ' + r.tTree + ' ms with, ' + r.tPlain + ' ms without', r);
  ok(r.edges > 1000, 'the edge lines were filled in after the open (' + r.edges + ' segments)', r.edges);
  ok(!errs.length, 'no page error', errs);
  console.log('  info longest long task ' + r.lt[0] + ' ms in ' + r.lt[1] + ' (software GL, load ' + (await import('node:fs')).readFileSync('/proc/loadavg', 'utf8').split(' ')[0] + ')');
  await ctx.close();
} catch (e) { fail++; console.log('  FAIL crashed: ' + (e.stack || e)); }
await lab.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

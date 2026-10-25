#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-sketch-tools.mjs — PartCraft's sketch splines and editing tools in headless Chromium, by real clicks and keys:
 * a closed spline drawn by clicks (B, five points, a click on the first) and extruded (exact volume = the spline's exact
 * area × depth), a crossing line trimmed (T + a click on the arm), a rectangle offset outside by 5 (O, a side, a typed
 * distance; its Offset dimension changed to 8 from the history panel's sketch), a line mirrored about a centerline
 * (selection, More › Mirror, a click on the centerline), a control-point spline, a line extended to a circle, a hexagon,
 * a slot and a linear pattern by clicks, the toolbar on one row at 1440 px in a sketch and the More menu only in a sketch,
 * no console errors.
 *   node tools/partcraft-test/browser-sketch-tools.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 *   (also run from browser.mjs by one line: run(h) gets the same helpers as browser-harness.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEV = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, built, tool, shot, nearRel, near } = h;
  const S = await import(path.join(DEV, 'sketch.js'));
  const SP = await import(path.join(DEV, 'sketch-spline.js'));
  const rows = () => page.evaluate(() => new Set([...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden).map((g) => g.offsetTop)).size);
  const sk2page = (p) => pc((p) => { const e = window.partcraft.editor; const r = e.canvas.getBoundingClientRect(); const [x, y] = e.toScreen(p); return [r.left + x, r.top + y]; }, p);
  const clickSk = async (p) => { const [x, y] = await sk2page(p); await page.mouse.move(x, y); await page.mouse.click(x, y); await page.waitForTimeout(40); };
  const typeIn = async (v) => { await page.waitForSelector('[data-dim-input]:not([hidden])'); await page.fill('[data-dim-input]', String(v)); await page.press('[data-dim-input]', 'Enter'); await page.waitForTimeout(60); };
  const sketch = () => pc(() => JSON.parse(JSON.stringify(window.partcraft.editing ? window.partcraft.part.features.find((f) => f.id === window.partcraft.editing).sketch : window.partcraft.part.features.at(-1).sketch)));
  const status = () => page.textContent('[data-status]');
  const openSketch = async (plane) => {
    await page.click(`[data-plane="${plane}"]`);
    await tool('sketch');
    await page.waitForFunction(() => window.partcraft.mode === 'sketch');
    await pc(() => window.partcraft.editor.setView({ cx: 50, cy: 10, s: 3 }));
  };

  console.log('\n== sketch tools: toolbar');
  await page.click('[data-cmd="new"]');
  if (await page.$('dialog[open]')) await page.click('dialog[open] button[data-key="discard"]');
  await page.waitForFunction(() => window.partcraft.part.features.length === 0);
  ok(await page.isHidden('[data-sketch-menu]'), 'outside a sketch the sketch More menu is hidden');
  await openSketch('front');
  const menu = await page.$$eval('[data-sketch-menu] [data-cmd]', (n) => n.map((b) => b.dataset.cmd));
  ok((await rows()) === 1 && await page.isVisible('[data-cmd="tool-spline"]') && await page.isVisible('[data-cmd="tool-trim"]') && await page.isVisible('[data-sketch-menu] > summary'), 'in a sketch: Spline, Trim and More show, and the toolbar is one row at 1440 px');
  ok(menu.join() === 'tool-cspline,tool-extend,tool-offset,tool-mirror,tool-polygon,tool-slot,tool-lpattern,tool-cpattern,tool-project', `More holds ${menu.length} tools: control-point spline, extend, offset, mirror, polygon, slot, linear and circular patterns, project edge`);

  console.log('\n== sketch tools: a closed spline by clicks, extruded exactly');
  await page.keyboard.press('b');
  ok((await pc(() => window.partcraft.editor.tool)) === 'spline' && /Spline: click/.test(await status()), 'B picks the spline tool; the status says how to use it');
  const Q = [[0, 0], [30, -6], [52, 14], [31, 40], [-6, 26]];
  for (const q of Q) await clickSk(q);
  await clickSk([0, 0]);   // the first point again closes it
  let sk = await sketch();
  const sp = sk.entities.find((e) => e.type === 'spline');
  ok(sp && sp.closed && sp.kind === 'fit' && sp.pts.length === 5, 'five clicks and a click on the first point: a closed fit spline of 5 points');
  ok(sk.constraints.some((c) => c.type === 'coincident' && c.refs.includes('O')), 'its first point snapped to the origin (coincident)');
  await tool('exit-sketch');
  await tool('extrude');
  await built();
  const st = await pc(() => window.partcraft.regen.stats);
  const ex = await pc(() => window.partcraft.part.features.find((f) => f.type === 'extrude'));
  sk = await pc(() => window.partcraft.part.features[0].sketch);
  const A = Math.abs(SP.areaTerm(S.splineCurve(sk, sk.entities.find((e) => e.type === 'spline'))));
  ok(st && nearRel(st.volume, A * ex.depth, 1e-9), `extruded ${ex.depth}: volume ${st.volume.toFixed(6)} = exact spline area × depth = ${(A * ex.depth).toFixed(6)} (1e-9)`);
  await shot('sk-spline-extrude');

  console.log('\n== sketch tools: trim, offset, mirror');
  await openSketch('top');
  await page.keyboard.press('l');
  await clickSk([-50, 10]); await clickSk([30, 10]); await page.keyboard.press('Escape');
  await clickSk([5, -30]); await clickSk([5, 40]); await page.keyboard.press('Escape');
  await page.keyboard.press('t');
  await clickSk([22, 10]);
  sk = await sketch();
  const hl = sk.entities.find((e) => e.type === 'line' && Math.abs(S.pointXY(sk, e.p1)[1] - 10) < 1e-6 && Math.abs(S.pointXY(sk, e.p2)[1] - 10) < 1e-6);
  const xs = hl ? [S.pointXY(sk, hl.p1)[0], S.pointXY(sk, hl.p2)[0]].sort((a, b) => a - b) : [];
  ok(hl && near(xs[0], -50, 1e-9) && near(xs[1], 5, 1e-9), `T + a click on the right arm: the horizontal line now ends at the crossing (x ${xs.map((v) => +v.toFixed(6)).join(' to ')})`);
  ok(/Trimmed/.test(await status()), 'the status says it was trimmed');
  // offset a rectangle outside by 5
  await page.keyboard.press('r');
  await clickSk([60, 0]); await clickSk([100, 30]);
  await page.click('[data-sketch-menu] > summary');
  await page.click('[data-sketch-menu] [data-cmd="tool-offset"]');
  await clickSk([80, 0]);
  await page.mouse.move(...await sk2page([80, -6]));
  await clickSk([80, -8]);
  await typeIn(5);
  sk = await sketch();
  const off = sk.constraints.find((c) => c.type === 'offset');
  const corners = sk.entities.filter((e) => e.type === 'point').map((p) => [p.x, p.y]).filter(([x, y]) => (near(x, 55, 1e-9) || near(x, 105, 1e-9)) && (near(y, -5, 1e-9) || near(y, 35, 1e-9)));
  ok(off && off.value === 5 && corners.length === 8 && sk.constraints.filter((c) => c.type === 'offsetlink').length === 3, `O, a click on the rectangle, a click outside, 5: a rectangle 5 out, corners exactly at (55, −5)…(105, 35); one Offset dimension + 3 links`);
  await shot('sk-offset');
  // the offset is parametric: Offset 5 → 8 (double-click its label)
  await page.keyboard.press('s');
  const box = await pc((id) => window.partcraft.editor.dimBoxes.find((b) => b.id === id), off.id);
  const r0 = await pc(() => { const r = window.partcraft.editor.canvas.getBoundingClientRect(); return [r.left, r.top]; });
  await page.mouse.dblclick(r0[0] + box.x + box.w / 2, r0[1] + box.y + box.h / 2);
  await typeIn(8);
  sk = await sketch();
  // the rectangle itself is free to move, so check the gap between each side and its copy (the solver moves least)
  const gaps = sk.constraints.filter((c) => c.type === 'offset' || c.type === 'offsetlink').map((c) => {
    const L = (id) => { const l = sk.entities.find((e) => e.id === id); return [S.pointXY(sk, l.p1), S.pointXY(sk, l.p2)]; };
    const [a, b] = L(c.refs[0]), q = L(c.refs[1])[0];
    return Math.abs((b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0])) / Math.hypot(b[0] - a[0], b[1] - a[1]);
  });
  ok(sk.constraints.find((c) => c.type === 'offset').value === 8 && gaps.length === 4 && gaps.every((g) => near(g, 8, 1e-7)), `double-click the Offset dimension, type 8: every side of the copy is 8 from its original (${gaps.map((g) => +g.toFixed(9)).join(', ')})`);
  // mirror a line about a centerline
  await page.keyboard.press('n');
  await clickSk([130, -20]); await clickSk([130, 40]);
  await page.keyboard.press('l');
  await clickSk([135, 0]); await clickSk([150, 20]); await page.keyboard.press('Escape');
  await page.keyboard.press('s');
  await clickSk([142.5, 10]);
  await page.click('[data-sketch-menu] > summary');
  await page.click('[data-sketch-menu] [data-cmd="tool-mirror"]');
  ok(/click the line or centerline to mirror about/i.test(await status()), 'with a line selected, Mirror asks for the line to mirror about');
  await clickSk([130, 30]);
  sk = await sketch();
  const mirrored = sk.entities.filter((e) => e.type === 'line').map((l) => [S.pointXY(sk, l.p1), S.pointXY(sk, l.p2)]).find(([a, b]) => near(a[0], 125, 1e-9) && near(b[0], 110, 1e-9) && near(b[1], 20, 1e-9));
  ok(mirrored && sk.constraints.filter((c) => c.type === 'symmetric').length === 2, 'the mirrored line runs (125, 0)–(110, 20), tied by 2 symmetric relations');
  ok(/symmetric relation/.test(await status()), 'the status says what ties the copy');
  ok((await pc(() => window.partcraft.lastSolve.conflicts.length)) === 0, 'the sketch solves with no conflicts');
  ok((await rows()) === 1, 'still one toolbar row');
  await shot('sk-trim-offset-mirror');

  console.log('\n== sketch tools: control-point spline, extend, polygon, slot, linear pattern');
  const more = async (cmd) => { await page.click('[data-sketch-menu] > summary'); await page.click(`[data-sketch-menu] [data-cmd="${cmd}"]`); };
  const count = async (type) => (await sketch()).entities.filter((e) => e.type === type).length;
  await pc(() => window.partcraft.editor.setView({ cx: 50, cy: 90, s: 3 }));
  await more('tool-cspline');
  for (const q of [[-40, 70], [-30, 100], [-10, 60], [0, 90]]) await clickSk(q);
  await page.keyboard.press('Enter');
  sk = await sketch();
  const cs = sk.entities.find((e) => e.type === 'spline' && e.kind === 'control');
  ok(cs && cs.pts.length === 4 && !cs.closed, 'More › Control-point spline, four clicks, Enter: an open control-point spline of 4 points');
  // extend a line to a circle
  await page.keyboard.press('c'); await clickSk([60, 80]); await clickSk([75, 80]);
  await page.keyboard.press('l'); await clickSk([20, 81]); await clickSk([30, 81]); await page.keyboard.press('Escape');
  await page.keyboard.press('e');
  await clickSk([29, 81]);
  sk = await sketch();
  const ext = sk.entities.filter((e) => e.type === 'line').map((l) => [S.pointXY(sk, l.p1), S.pointXY(sk, l.p2)]).find(([a, b]) => near(a[0], 20, 1e-6) && near(b[1], a[1], 1e-9));
  ok(ext && near(ext[1][0], 60 - Math.sqrt(225 - (ext[1][1] - 80) ** 2), 1e-9), `E + a click near the end: the line reaches the circle (x ${ext ? ext[1][0].toFixed(6) : '?'})`);
  // polygon
  const lines0 = await count('line');
  await more('tool-polygon');
  await clickSk([110, 90]); await clickSk([122, 90]);
  await typeIn(6);
  ok((await count('line')) === lines0 + 6 && /6-sided polygon/.test(await status()), 'More › Polygon, centre, corner, 6: six equal sides');
  // slot
  const arcs0 = await count('arc');
  await more('tool-slot');
  await clickSk([100, 120]); await clickSk([130, 120]); await clickSk([115, 125]);
  ok((await count('arc')) === arcs0 + 2 && /Slot 10 wide/.test(await status()), 'More › Slot, two centres and a click 5 off the axis: a slot 10 wide');
  // linear pattern of the circle
  await page.keyboard.press('s');
  await clickSk([75, 80]);
  await more('tool-lpattern');
  await clickSk([170, 70]); await clickSk([170, 50]);
  await typeIn(3);
  sk = await sketch();
  const cy = sk.entities.filter((e) => e.type === 'circle' && !e.construction).map((c) => S.pointXY(sk, c.c)[1]).sort((p, q) => p - q);
  ok(cy.length === 3 && near(cy[0], 40, 1e-9) && near(cy[1], 60, 1e-9) && near(cy[2], 80, 1e-9), 'More › Linear pattern, two clicks 20 apart, 3: circles at y 80, 60, 40');
  ok((await pc(() => window.partcraft.lastSolve.conflicts.length)) === 0 && (await rows()) === 1, 'no conflicts; one toolbar row');
  await shot('sk-more-tools');
  await tool('exit-sketch');
  await built();
  ok(h.problems.length === 0, 'sketch tools: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}

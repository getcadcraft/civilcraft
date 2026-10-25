#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-pu.mjs — the 0.6 PartCraft usability items (session part-usability, roadmap PU.1–PU.6) in headless Chromium,
 * on whichever kernel the harness runs (browser.mjs: exact; alone: the mesh kernel unless PC_EXACT=1).
 *   PU.4 base planes step back: full on an empty part; faint (drawn, never picked) once there is a solid; full again while
 *        choosing where to sketch or with one selected in the tree; View › Base planes off hides them (still shown while
 *        choosing where to sketch), kept in partcraft.settings.
 *   PU.3 a picked flat face: Extrude from it (+ face × 10, then 5 typed), Cut into it (halfway), Hole here (where clicked,
 *        then Ø4 typed); each one undo step.
 *   PU.1 dimension as you draw: a line typed 30 (horizontal, dimensioned), the chain on with 12 at 90° (Tab), a rectangle
 *        40 Tab 25, a circle Ø12, an arc R10 then 90°, a typed length kept through a click; the setting off ignores digits.
 *   PU.2 drag handles: an Extrude's arrow dragged 5 further (live, one undo step, no orbit), Esc mid-drag, typed in its box;
 *        a Revolve's curved arrow dragged to 180°.
 *   PU.6 the sketch panel groups repeated relations ("Coincident × 5"): closed at first, opens to each row, Select takes
 *        them all, Delete all is one undo step, an opened group stays open across redraws.
 * Every section ends with the toolbar still one row at 1440 px and no console errors.
 *   node tools/partcraft-test/browser-pu.mjs [--state <file>] [--out <dir>]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export async function run(h) {
  const { page, ok, pc, built, shot, F } = h;
  if ((await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace)) !== 'design') { await page.selectOption('[data-workspace]', 'design'); await page.waitForTimeout(300); }
  const oneRow = async () => {
    const r = await page.evaluate(() => [new Set([...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden).map((g) => g.offsetTop)).size, innerWidth]);
    return r[0] === 1 && r[1] === 1440;
  };
  // which kinds a grid of clicks over the 3D view would pick (planes only count where they are pickable)
  const pickKinds = () => pc(() => {
    const v = window.partcraft.view, r = v.canvas.getBoundingClientRect(), out = new Set();
    for (let i = 1; i < 24; i++) for (let j = 1; j < 16; j++) { const hit = v.pickAt(r.left + (r.width * i) / 24, r.top + (r.height * j) / 16); if (hit) out.add(hit.kind); }
    return [...out];
  });
  const planes = () => pc(() => ({ visible: window.partcraft.view.planes.visible, faint: window.partcraft.view.planesFaint }));
  const views = async (cmd) => { await page.click('[data-views-menu] > summary'); await page.click(`[data-views-menu] [data-cmd="${cmd}"]`); };

  console.log('\n== PU.4 base planes step back');
  await pc(() => { try { const s = JSON.parse(localStorage.getItem('partcraft.settings') || '{}'); delete s.planes; localStorage.setItem('partcraft.settings', JSON.stringify(s)); } catch { /* fine */ } window.partcraft.settings.planes = true; });
  const P = await import('../../public_html/assets/apps/partcraft/dev/part.js');
  const p = P.newPart('Plate');
  P.addFeature(p, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: F.blockSketch(40, 20).sk });
  await pc((t) => window.partcraft.openText(t, 'Plate.partcraft.json'), JSON.stringify(p));
  await built();
  let st = await planes();
  ok(st.visible && !st.faint && (await pickKinds()).includes('plane'), 'a part with no solid yet: the base planes are drawn in full and can be picked');
  await page.click('.pc-tree [data-id="f1"]');
  await h.tool('extrude');
  await built(); await page.waitForTimeout(150);
  st = await planes();
  const k1 = await pickKinds();
  ok(st.visible && st.faint && !k1.includes('plane') && k1.includes('face'), `after the first Extrude: drawn faint, and clicks around the part never pick a plane (${k1.join(', ')})`);
  await shot('pu4-1-faint');
  await page.keyboard.press('Escape');
  await page.click('.pc-tools [data-cmd="sketch"]');
  st = await planes();
  ok(st.visible && !st.faint && (await pickKinds()).includes('plane') && /Click a plane or a flat face/.test(await h.statusText()), 'Sketch with nothing picked: full again, ready to be picked');
  await page.keyboard.press('Escape');
  st = await planes();
  ok(st.visible && st.faint, 'Esc: faint again');
  await page.click('.pc-tree [data-plane="right"]');
  st = await planes();
  ok(st.visible && !st.faint && (await pc(() => window.partcraft.sel?.name)) === 'right', 'Right plane picked in the tree: full, and it is the selection');
  await page.keyboard.press('Escape');
  ok((await planes()).faint, 'Esc clears it: faint again');
  // the View toggle
  await views('view-planes');
  st = await planes();
  ok(!st.visible && (await page.getAttribute('[data-views-menu] [data-cmd="view-planes"]', 'aria-checked')) === 'false' && /Base planes hidden/.test(await h.statusText()), 'View › Base planes off: hidden, the menu item unchecked');
  await page.keyboard.press('Escape');
  await page.click('.pc-tools [data-cmd="sketch"]');
  ok((await planes()).visible, 'still shown while choosing where to sketch');
  await page.keyboard.press('Escape');
  ok(!(await planes()).visible, 'and hidden again after');
  ok((await pc(() => JSON.parse(localStorage.getItem('partcraft.settings') || '{}').planes)) === false, 'the choice is kept in partcraft.settings');
  await views('view-planes');
  st = await planes();
  ok(st.visible && st.faint && (await page.getAttribute('[data-views-menu] [data-cmd="view-planes"]', 'aria-checked')) === 'true', 'on again: faint (the part has a solid)');
  await page.keyboard.press('Escape');
  ok(await oneRow(), 'the toolbar is still one row at 1440 px');

  console.log('\n== PU.6 group repeated relations');
  await pc(() => window.partcraft.editSketch('f1'));
  await page.waitForTimeout(150);
  const rows = () => page.$$eval('[data-props] .pc-list:not(.pc-rel-group .pc-list) > li', (n) => n.map((li) => (li.querySelector(':scope > details > summary') || li.querySelector('.grow')).textContent.trim()));
  let r = await rows();
  const cons0 = await pc(() => window.partcraft.part.features.find((f) => f.id === 'f1').sketch.constraints.length);
  ok(r.includes('Coincident × 5') && r.includes('Horizontal × 2') && r.includes('Vertical × 2') && r.filter((x) => /^Distance/.test(x)).length === 2 && r.length === 5, `the block's ${cons0} relations and dimensions are 5 rows: ${r.join(' | ')}`);
  const grp = '[data-props] [data-rel-group="coincident"]';
  ok(!(await page.$eval(grp, (d) => d.open)), 'a group starts closed');
  await page.click(grp + ' > summary');
  ok((await page.$$eval(grp + ' li', (n) => n.length)) === 5, 'opened: one row per Coincident, each with Select and Delete');
  await shot('pu6-1-groups');
  await page.locator('[data-props] li.pc-rel-row:has(> [data-rel-group="coincident"]) > .pc-rel-acts > button', { hasText: 'Select' }).click();
  ok((await pc(() => window.partcraft.editor.sel.size)) === 5 && /Selected 5 Coincident relations/.test(await h.statusText()), 'Select on the group selects all five');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  await page.locator('[data-props] li.pc-rel-row:has(> [data-rel-group="horizontal"]) > .pc-rel-acts > button', { hasText: 'Delete all' }).click();
  await page.waitForTimeout(150);
  const cons = () => pc(() => window.partcraft.part.features.find((f) => f.id === 'f1').sketch.constraints.map((c) => c.type));
  let c1 = await cons();
  ok(!c1.includes('horizontal') && c1.length === cons0 - 2 && /Deleted 2 Horizontal relations/.test(await h.statusText()), 'Delete all on Horizontal × 2: both gone');
  await pc(() => document.activeElement?.blur());
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(150);
  c1 = await cons();
  ok(c1.filter((x) => x === 'horizontal').length === 2 && c1.length === cons0, 'one Ctrl+Z brings both back');
  r = await rows();
  ok(r.includes('Coincident × 5') && (await page.$eval(grp, (d) => d.open)), 'the Coincident group stays open across the redraw');
  await pc(() => window.partcraft.exitSketch());
  await built();
  ok(await oneRow(), 'the toolbar is still one row at 1440 px');

  console.log('\n== PU.5 the main value in the history row');
  const val = (id) => page.textContent(`.pc-tree [data-id="${id}"] .pc-node-val`);
  const depth = () => pc(() => window.partcraft.part.features.find((f) => f.id === 'f2').depth);
  const vol = () => pc(() => window.partcraft.regen.stats.volume);
  ok((await val('f2')) === '10 mm' && (await val('f1')) === '', `Extrude1's row reads "${await val('f2')}"; the sketch's row has no value`);
  await page.dblclick(`.pc-tree [data-id="f2"] .pc-node-name`);
  ok((await page.evaluate(() => document.activeElement?.classList.contains('pc-node-edit') && document.activeElement.value)) === '10' && /type the new value/.test(await h.statusText()), 'double-click on Extrude1: a box over its value, holding 10, selected');
  await page.keyboard.type('25');
  await page.keyboard.press('Enter');
  await built(); await page.waitForTimeout(100);
  ok((await depth()) === 25 && (await val('f2')) === '25 mm' && h.nearRel(await vol(), 40 * 20 * 25, 1e-9), 'Enter: depth 25, the row reads 25 mm, volume 40 × 20 × 25');
  await page.waitForTimeout(100);
  ok(await page.evaluate(() => document.activeElement?.closest('.pc-node')?.dataset.id === 'f2'), 'the focus is back on the row');
  await shot('pu5-1-values');
  await page.keyboard.press('F2');
  await page.keyboard.type('99');
  await page.keyboard.press('Escape');
  await built();
  ok((await depth()) === 25 && !(await page.$('.pc-node-edit')), 'F2 on the row, typing, then Esc: nothing changes');
  await page.dblclick(`.pc-tree [data-id="f2"] .pc-node-val`);
  await page.keyboard.type('=30/2');
  await page.keyboard.press('Enter');
  await built(); await page.waitForTimeout(100);
  ok((await depth()) === 15 && (await val('f2')) === '15 mm', 'an =expression works there as in the panel: =30/2 → 15');
  await pc(() => document.activeElement?.blur());
  await page.keyboard.press('Control+z'); await built();
  await page.keyboard.press('Control+z'); await built();
  ok((await depth()) === 10, `two Ctrl+Z: back to 10 (${await depth()}; undo steps: ${(await pc(() => window.partcraft.hist.undoStack.map((x) => x.label))).slice(-5).join(', ')})`);
  await page.dblclick('.pc-tree [data-id="f1"]');
  ok((await pc(() => window.partcraft.mode)) === 'sketch' && !(await page.$('.pc-node-edit')), "double-click on the sketch's row still opens the sketch");
  await pc(() => window.partcraft.exitSketch()); await built();
  ok(await oneRow(), 'the toolbar is still one row at 1440 px');

  console.log('\n== PU.3 more actions on a picked face');
  // click the block's top face (f2.end) where the view shows it; dx moves the click along the face
  const clickTop = async (name, dx = 0) => {
    const at = await pc(([nm, dx]) => {
      const v = window.partcraft.view, r = v.canvas.getBoundingClientRect(), faces = window.partcraft.regen.faces, hits = [];
      for (let i = 2; i < 40; i++) for (let j = 2; j < 30; j++) { const x = r.left + (r.width * i) / 41, y = r.top + (r.height * j) / 31, hh = v.pickAt(x, y); if (hh?.kind === 'face' && faces[hh.face]?.name === nm) hits.push([x, y]); }
      if (!hits.length) return null;
      hits.sort((a, b) => a[0] - b[0]);
      return hits[Math.min(hits.length - 1, Math.max(0, Math.floor(hits.length / 2) + dx))];
    }, [name, dx]);
    if (at) await page.mouse.click(at[0], at[1]);
    return !!at;
  };
  const nf = () => pc(() => window.partcraft.part.features.length);
  await page.keyboard.press('Escape');
  ok(await clickTop('f2.end') && (await page.$$('[data-props] [data-face-action]')).length === 3, 'the top face picked: Extrude from it, Cut into it and Hole here under its other buttons');
  await shot('pu3-1-face-actions');
  await page.click('[data-props] [data-face-action="extrude"]');
  await built(); await page.waitForTimeout(100);
  let last = await pc(() => window.partcraft.part.features.slice(-2).map((f) => [f.type, f.op, f.depth, f.sketch]));
  ok((await nf()) === 4 && last[0][0] === 'sketch' && last[1][0] === 'extrude' && last[1][1] === 'add' && h.nearRel(await vol(), 16000, 1e-9) && /pulls the face out 10 mm/.test(await h.statusText()), `Extrude from it: a sketch with the face's outline + an Extrude of 10, volume 16000 (${await vol()})`);
  await page.keyboard.type('5'); await page.keyboard.press('Enter'); await built();
  ok(h.nearRel(await vol(), 12000, 1e-9), 'typing 5 then Enter straight after sets its depth: 12000');
  await pc(() => document.activeElement?.blur());
  await page.keyboard.press('Control+z'); await built();
  await page.keyboard.press('Control+z'); await built();
  ok((await nf()) === 2 && h.nearRel(await vol(), 8000, 1e-9), 'two Ctrl+Z (the depth, then the one step that added sketch + Extrude): back to the block');
  await clickTop('f2.end');
  await page.click('[data-props] [data-face-action="cut"]');
  await built(); await page.waitForTimeout(100);
  last = await pc(() => window.partcraft.part.features.at(-1));
  ok(last.type === 'extrude' && last.op === 'cut' && last.depth === 5 && h.nearRel(await vol(), 4000, 1e-9) && /cuts 5 mm into the face/.test(await h.statusText()), `Cut into it: halfway (5 of 10), volume 4000 (${await vol()})`);
  await pc(() => document.activeElement?.blur());
  await page.keyboard.press('Control+z'); await built();
  await clickTop('f2.end', 4);
  await page.click('[data-props] [data-face-action="hole"]');
  await built(); await page.waitForTimeout(100);
  last = await pc(() => window.partcraft.part.features.slice(-2));
  const st3 = await pc(() => window.partcraft.regen.stats);
  ok(last[1].type === 'hole' && last[1].through && last[0].sketch.entities.filter((e) => e.type === 'point').length === 1 && st3.genus === 1 && h.nearRel(8000 - st3.volume, Math.PI * 9 * 10, 0.02) && /goes through where you clicked/.test(await h.statusText()), `Hole here: one point where clicked, a Ø6 hole through (−${(8000 - st3.volume).toFixed(2)} ≈ 90π)`);
  await page.keyboard.type('4'); await page.keyboard.press('Enter'); await built();
  ok((await pc(() => window.partcraft.part.features.at(-1).d)) === 4, 'typing 4 then Enter: diameter 4');
  await pc(() => document.activeElement?.blur());
  await page.keyboard.press('Control+z'); await built();
  await page.keyboard.press('Control+z'); await built();
  ok((await nf()) === 2, 'undone back to the block');
  ok(await oneRow(), 'the toolbar is still one row at 1440 px');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));

  console.log('\n== PU.1 dimension as you draw');
  {
    await pc(() => { window.partcraft.settings.autoRel = true; window.partcraft.editor.autoRelations = true; window.partcraft.settings.dimDraw = true; window.partcraft.editor.dimDraw = true; });
    const P2 = P.newPart('Typed');
    P.addFeature(P2, 'sketch', { plane: { kind: 'base', name: 'top' } });
    await pc((t) => window.partcraft.openText(t, 'Typed.partcraft.json'), JSON.stringify(P2));
    await built();
    await pc(() => window.partcraft.editSketch('f1'));
    await pc(() => window.partcraft.editor.setView({ cx: 0, cy: 0, s: 4 }));
    const scr = (u, v) => pc(([u, v]) => { const ed = window.partcraft.editor, r = ed.canvas.getBoundingClientRect(), p = ed.toScreen([u, v]); return [r.left + p[0], r.top + p[1]]; }, [u, v]);
    const at = async (u, v, click = true) => { const [x, y] = await scr(u, v); await page.mouse.move(x, y, { steps: 3 }); if (click) await page.mouse.click(x, y); };
    const sk = () => pc(() => window.partcraft.part.features.find((f) => f.id === 'f1').sketch);
    const dims = (s, type) => s.constraints.filter((c) => c.type === type).map((c) => c.value);
    const nUndo = () => pc(() => window.partcraft.hist.undoStack.length);
    const boxOpen = () => page.evaluate(() => { const i = document.querySelector('[data-sketch-input], .pc-dim-input') || document.activeElement; return i && i.tagName === 'INPUT' && !i.hidden ? [i.getAttribute('aria-label'), i.value] : null; });
    // a line: start at (5, 5), point roughly along +X, type 30, Enter
    await page.keyboard.press('l');
    await at(5, 5);
    ok(/type its length/.test(await h.statusText()), 'after the first click the status bar says the length can be typed');
    await at(20, 5.5, false);   // 1.9° off level: snaps horizontal
    const u0 = await nUndo();
    await page.keyboard.type('30');
    const b1 = await boxOpen();
    ok(b1 && b1[0] === 'Length' && b1[1] === '30', `typing opens the Length box beside the pointer, holding what was typed (${b1})`);
    await shot('pu1-1-length-box');
    await page.keyboard.press('Enter');
    let s = await sk();
    const ln = s.entities.find((e) => e.type === 'line');
    const p1 = s.entities.find((e) => e.id === ln.p1), p2 = s.entities.find((e) => e.id === ln.p2);
    ok(h.near(Math.hypot(p2.x - p1.x, p2.y - p1.y), 30, 1e-6) && h.near(p2.y, p1.y, 1e-9) && dims(s, 'distance').includes(30) && s.constraints.some((c) => c.type === 'horizontal'), `Enter: a horizontal line 30 long with a driving dimension of 30 (end at ${p2.x.toFixed(3)}, ${p2.y.toFixed(3)})`);
    ok((await nUndo()) === u0 + 1, 'line + dimension are one undo step');
    // the chain goes on: Tab to the angle, 90°, back to length 12 — a vertical line up
    await at(36, 10, false);
    await page.keyboard.type('12');
    await page.keyboard.press('Tab');
    const b2 = await boxOpen();
    await page.keyboard.type('90');
    await page.keyboard.press('Enter');
    s = await sk();
    const l2 = s.entities.filter((e) => e.type === 'line')[1];
    const q1 = s.entities.find((e) => e.id === l2?.p1), q2 = s.entities.find((e) => e.id === l2?.p2);
    ok(b2 && /^Angle/.test(b2[0]) && l2 && h.near(q2.x, q1.x, 1e-6) && h.near(q2.y - q1.y, 12, 1e-6) && dims(s, 'distance').includes(12) && s.constraints.some((c) => c.type === 'vertical'), `Tab goes to the Angle box; 12 at 90°: a vertical line 12 up, dimensioned (${b2})`);
    await page.keyboard.press('Escape');
    // a rectangle: corner (60, 0), pointer up and right, 40 Tab 25 Enter
    await page.keyboard.press('r');
    await at(60, 0);
    await at(70, 8, false);
    await page.keyboard.type('40'); await page.keyboard.press('Tab'); await page.keyboard.type('25'); await page.keyboard.press('Enter');
    s = await sk();
    const xs = s.entities.filter((e) => e.type === 'point' && e.x >= 59).map((e) => [e.x, e.y]);
    const bx = [Math.min(...xs.map((p) => p[0])), Math.max(...xs.map((p) => p[0])), Math.min(...xs.map((p) => p[1])), Math.max(...xs.map((p) => p[1]))];
    ok(h.near(bx[1] - bx[0], 40, 1e-6) && h.near(bx[3] - bx[2], 25, 1e-6) && h.near(bx[0], 60, 1e-6) && h.near(bx[2], 0, 1e-6) && dims(s, 'distance').filter((v) => v === 40 || v === 25).length === 2, `Rectangle: 40 × 25 from the clicked corner toward the pointer, both sizes dimensioned (${bx.map((v) => v.toFixed(2)).join(', ')})`);
    // a circle: centre (0, 50), Diameter 12
    await page.keyboard.press('c');
    await at(0, 50);
    await at(3, 51, false);
    await page.keyboard.type('12'); await page.keyboard.press('Enter');
    s = await sk();
    const ci = s.entities.find((e) => e.type === 'circle');
    ok(ci && h.near(ci.r, 6, 1e-9) && dims(s, 'diameter').includes(12), 'Circle: Diameter 12 → radius 6 with a diameter dimension');
    // an arc: centre (-50, 0), radius 10 typed toward +X, then 90° typed after turning the pointer anticlockwise
    await page.keyboard.press('a');
    await at(-50, 0);
    await at(-45, 0, false);
    await page.keyboard.type('10'); await page.keyboard.press('Enter');
    ok(/how far round/.test(await h.statusText()), 'radius set: the status bar asks for the arc angle');
    for (const [u, v] of [[-42, 3], [-45, 7], [-50, 9]]) await at(u, v, false);
    await page.keyboard.type('90'); await page.keyboard.press('Enter');
    s = await sk();
    const ar = s.entities.find((e) => e.type === 'arc');
    const A = (id) => s.entities.find((e) => e.id === id);
    const sw = ar && ((Math.atan2(A(ar.e).y, A(ar.e).x + 50) - Math.atan2(A(ar.s).y, A(ar.s).x + 50)) * 180 / Math.PI + 360) % 360;
    ok(ar && h.near(Math.hypot(A(ar.s).x + 50, A(ar.s).y), 10, 1e-6) && h.near(sw, 90, 1e-6) && dims(s, 'radius').includes(10), `Arc: radius 10 and 90° round, with a radius dimension (sweep ${sw?.toFixed(3)})`);
    await shot('pu1-2-typed-shapes');
    // a box left by a click keeps its value: type 20 for a line, click away from it — the line is 20 long toward the click
    await page.keyboard.press('l');
    await at(0, -30);
    await at(10, -40, false);
    await page.keyboard.type('20');
    await at(10, -40);
    s = await sk();
    const l3 = s.entities.filter((e) => e.type === 'line').at(-1), r1 = A(l3.p1), r2 = A(l3.p2);
    ok(h.near(Math.hypot(r2.x - r1.x, r2.y - r1.y), 20, 1e-6), 'a typed length is kept when you click instead of Enter: the line ends 20 along the pointer');
    await page.keyboard.press('Escape');
    // the setting off: digits do nothing while drawing
    await pc(() => { window.partcraft.settings.dimDraw = false; window.partcraft.editor.dimDraw = false; });
    await page.keyboard.press('l');
    await at(0, -60);
    await at(10, -60, false);
    await page.keyboard.type('5');
    ok(!(await boxOpen()) && !/type its length/.test(await h.statusText()), 'Dimension as you draw off: typing opens no box, the status bar says nothing about sizes');
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    await pc(() => { window.partcraft.settings.dimDraw = true; window.partcraft.editor.dimDraw = true; });
    await pc(() => window.partcraft.exitSketch()); await built();
    ok(await oneRow(), 'the toolbar is still one row at 1440 px');
    ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
  }

  console.log('\n== PU.2 drag handles on features');
  {
    const S2 = await import('../../public_html/assets/apps/partcraft/dev/sketch.js');
    const blk = P.newPart('Handles');
    const s1 = P.addFeature(blk, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: F.blockSketch(40, 20).sk });
    P.addFeature(blk, 'extrude', { sketch: s1.id, depth: 10 });
    await pc((t) => window.partcraft.openText(t, 'Handles.partcraft.json'), JSON.stringify(blk));
    await built();
    const hv = () => pc(() => { const hd = window.partcraft.handles; return hd && hd.h ? { kind: hd.h.kind, value: hd.h.value, box: hd.box.hidden ? null : hd.box.value } : null; });
    // a world point → page coordinates
    const toPage = (w) => pc((w) => { const v = window.partcraft.view, r = v.canvas.getBoundingClientRect(), p = new v.camera.position.constructor(...w).project(v.camera); return [r.left + (p.x + 1) / 2 * r.width, r.top + (1 - p.y) / 2 * r.height]; }, w);
    const grip = () => pc(() => window.partcraft.handles.group.children.at(-1).position.toArray());
    const dir = () => pc(() => window.partcraft.handles.h.dir);
    ok(!(await hv()), 'nothing selected: no handle');
    await page.click('.pc-tree [data-id="f2"]');
    let hs = await hv();
    ok(hs && hs.kind === 'extrude' && hs.value === 10 && hs.box === '10 mm', `Extrude1 selected: an arrow on its end face with "${hs?.box}" beside it`);
    await shot('pu2-1-extrude-handle');
    const g0 = await grip(), d0 = await dir();
    const [gx, gy] = await toPage(g0);
    await page.mouse.move(gx, gy);
    ok((await pc(() => window.partcraft.view.controls.enabled)) === false && (await page.$eval('[data-gl]', (c) => c.style.cursor)) === 'grab', 'hovering the arrow: a grab cursor, and a press grabs it instead of turning the view');
    const cam0 = await pc(() => window.partcraft.view.camera.position.toArray());
    const u0 = await pc(() => window.partcraft.hist.undoStack.length);
    await page.mouse.down();
    for (let i = 1; i <= 5; i++) { const [x, y] = await toPage(g0.map((v, k) => v + d0[k] * i)); await page.mouse.move(x, y, { steps: 2 }); }
    await built();
    ok(h.nearRel(await vol(), 40 * 20 * 15, 1e-9) && /Dragging the depth/.test(await h.statusText()), `while dragging 5 further the part follows live: volume ${await vol()}`);
    await page.mouse.up(); await built();
    const cam1 = await pc(() => window.partcraft.view.camera.position.toArray());
    ok((await pc(() => window.partcraft.part.features.find((f) => f.id === 'f2').depth)) === 15 && (await pc(() => window.partcraft.hist.undoStack.length)) === u0 + 1 && /depth 15 mm/.test(await h.statusText()) && cam0.every((v, i) => Math.abs(v - cam1[i]) < 1e-9), 'released: depth 15, one undo step, the view did not turn');
    ok((await hv()).box === '15 mm', 'the box beside it reads 15 mm');
    await pc(() => document.activeElement?.blur());
    await page.keyboard.press('Control+z'); await built();
    ok((await pc(() => window.partcraft.part.features.find((f) => f.id === 'f2').depth)) === 10, 'Ctrl+Z: back to 10');
    { const [cx, cy] = await toPage(await grip()); await page.mouse.click(cx, cy); }
    ok((await pc(() => window.partcraft.pick?.kind)) === 'face' && (await pc(() => window.partcraft.part.features.find((f) => f.id === 'f2').depth)) === 10, 'a plain click on the arrow (no drag) still picks the face under it');
    await page.click('.pc-tree [data-id="f2"]');
    // Esc during a drag puts it back
    const g1 = await grip(), [ax, ay] = await toPage(g1);
    await page.mouse.move(ax, ay); await page.mouse.down();
    for (let i = 1; i <= 3; i++) { const [x, y] = await toPage(g1.map((v, k) => v + d0[k] * 2 * i)); await page.mouse.move(x, y, { steps: 2 }); }
    await page.keyboard.press('Escape'); await page.mouse.up(); await built();
    ok((await pc(() => window.partcraft.part.features.find((f) => f.id === 'f2').depth)) === 10 && h.nearRel(await vol(), 8000, 1e-9) && /Drag cancelled/.test(await h.statusText()) && (await pc(() => window.partcraft.hist.undoStack.length)) === u0, 'Esc while dragging: back to 10, no undo step');
    // type in the box
    await page.click('[data-handle-box]');
    await page.keyboard.type('22'); await page.keyboard.press('Enter'); await built();
    ok((await pc(() => window.partcraft.part.features.find((f) => f.id === 'f2').depth)) === 22 && h.nearRel(await vol(), 40 * 20 * 22, 1e-9), 'typing 22 in the box and Enter: depth 22');
    await pc(() => document.activeElement?.blur());
    await page.keyboard.press('Control+z'); await built();
    // through all: no depth to drag
    await page.selectOption('[data-props] select >> nth=1', 'through').catch(() => {});
    await built();
    const thr = await pc(() => window.partcraft.part.features.find((f) => f.id === 'f2').end);
    ok(thr !== 'through' || !(await hv()), `End = Through all: no handle (${thr})`);
    if (thr === 'through') { await pc(() => document.activeElement?.blur()); await page.keyboard.press('Control+z'); await built(); }

    // a Revolve: a 10 × 10 square 10 from a centerline, 90° about it
    const rp = P.newPart('Ring');
    const sk = S2.newSketch();
    S2.addRect(sk, [10, 0], [20, 10]);
    const axl = S2.addLine(sk, [0, -5], [0, 15], { construction: true });
    const rs = P.addFeature(rp, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    P.addFeature(rp, 'revolve', { sketch: rs.id, axis: axl.id, angle: 90 });
    await pc((t) => window.partcraft.openText(t, 'Ring.partcraft.json'), JSON.stringify(rp));
    await built();
    await page.click('.pc-tree [data-id="f2"]');
    hs = await hv();
    ok(hs && hs.kind === 'revolve' && hs.value === 90 && hs.box === '90°', `Revolve1 selected: a curved arrow at its end with "${hs?.box}"`);
    await shot('pu2-2-revolve-handle');
    const rh = await pc(() => { const h = window.partcraft.handles.h; return { o: h.axis.o, d: h.axis.d, s: h.start }; });
    const HMn = await import('../../public_html/assets/apps/partcraft/dev/handle-math.js');
    const [tx, ty] = await toPage(HMn.turn(rh.s, rh, 90));
    await page.mouse.move(tx, ty);
    await page.mouse.down();
    for (const a of [100, 120, 140, 160, 180]) { const [x, y] = await toPage(HMn.turn(rh.s, rh, a)); await page.mouse.move(x, y, { steps: 2 }); }
    await page.mouse.up(); await built();
    const ang = await pc(() => window.partcraft.part.features.find((f) => f.id === 'f2').angle);
    ok(Math.abs(ang - 180) <= 1 && /angle 1[78][0-9]°/.test(await h.statusText()), `dragging it round to the far side: angle ${ang}`);
    await pc(() => document.activeElement?.blur());
    await page.keyboard.press('Control+z'); await built();
    ok((await pc(() => window.partcraft.part.features.find((f) => f.id === 'f2').angle)) === 90, 'Ctrl+Z: 90 again');
    await page.keyboard.press('Escape');
    ok(!(await hv()), 'Esc clears the selection: the handle goes');
    ok(await oneRow(), 'the toolbar is still one row at 1440 px');
    ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-pu');
  const h = await startHarness({ ...args, exact: process.env.PC_EXACT === '1' });
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}

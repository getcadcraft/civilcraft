#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-params.mjs — PartCraft's parameters in headless Chromium: the Parameters tab (keyboard tabs), variables added
 * in the table, a feature field linked by typing =thick (ƒ marker in its label), the parameter changed (forward), a
 * number typed into the driven field (backward), the "which parameter?" dialog for a field two parameters drive, one
 * undo step each, a sketch dimension linked from the Properties panel and from the sketch's own dimension box, a
 * design table imported, a row applied (one undo step) and exported; the rows saved in the part as configurations (save
 * current values, rename, delete + undo, reopen; 0.4 P18), the rollback bar stepped by [ ] End and its
 * buttons, a script saved and opened again, the Model theme; exact volumes throughout; no console errors.
 *   node tools/partcraft-test/browser-params.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out tmp/shots/partcraft-params]
 * Uses the shared PartCraft test admin through browser-harness.mjs (never runs admin.php down).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startHarness, cliArgs } from './browser-harness.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function run(h) {
  const { page, ok, pc, built, shot, F, nearRel } = h;
  const vol = async () => { await built(); return pc(() => window.partcraft.regen.stats.volume); };
  const params = () => pc(() => JSON.parse(JSON.stringify(window.partcraft.part.params || null)));
  const varExpr = async (n) => (await params())?.vars.find((v) => v.name === n)?.expr;
  const depthSel = 'label:has-text("Depth (mm)") + input';
  const tab = (t) => page.click(`#pc-tab-${t}`);
  const settle = () => page.waitForTimeout(120);

  console.log('\n== parameters: the tab, variables, a linked field');
  await pc(() => window.partcraft.exactReady());
  const bp = await (async () => {
    const S = await import(new URL('../../public_html/assets/apps/partcraft/dev/sketch.js', import.meta.url).href);
    const P = await import(new URL('../../public_html/assets/apps/partcraft/dev/part.js', import.meta.url).href);
    const pt = P.newPart('Block');
    const b = F.blockSketch(100, 50);
    const s1 = P.addFeature(pt, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: b.sk });
    P.addFeature(pt, 'extrude', { sketch: s1.id, depth: 20 });
    return { pt, dw: b.dw, dh: b.dh, S };
  })();
  await pc((t) => window.partcraft.openText(t, 'Block.partcraft.json'), JSON.stringify(bp.pt));
  ok(nearRel(await vol(), 100000, 1e-9), 'a 100 × 50 × 20 block opens: 100000');
  await tab('params');
  const tabs = await page.evaluate(() => ({ sel: document.querySelector('#pc-tab-params').getAttribute('aria-selected'), props: document.querySelector('#pc-sec-props').hidden, params: document.querySelector('#pc-sec-params').hidden }));
  ok(tabs.sel === 'true' && tabs.props && !tabs.params, 'the Parameters tab shows its panel and hides Properties');
  await page.focus('#pc-tab-params'); await page.keyboard.press('ArrowLeft');
  ok(await page.evaluate(() => document.activeElement.id === 'pc-tab-props' && !document.querySelector('#pc-sec-props').hidden), 'arrow keys move between the tabs');
  await page.keyboard.press('ArrowRight');
  for (const [n, e] of [['thick', '20'], ['w', '100'], ['extra', '5']]) {
    await page.fill('[data-new-name]', n); await page.fill('[data-new-expr]', e); await page.press('[data-new-expr]', 'Enter'); await settle();
  }
  ok((await params())?.vars.map((v) => v.name + '=' + v.expr).join() === 'thick=20,w=100,extra=5', 'three variables added from the table (Enter)');
  const bad = await (async () => { await page.fill('[data-new-name]', 'sin'); await page.fill('[data-new-expr]', '3'); await page.press('[data-new-expr]', 'Enter'); await settle(); return h.statusText(); })();
  ok(/function, constant or unit/.test(bad) && (await params()).vars.length === 3, `a reserved name is refused with the reason ("${bad.trim()}")`);
  await page.fill('[data-new-name]', '');

  await page.click('.pc-tree [data-id="f2"]');
  await tab('props');
  await page.fill(depthSel, '=thick'); await page.press(depthSel, 'Enter');
  await built(); await settle();
  const linked = await page.evaluate((s) => { const i = document.querySelector('[data-param-key="f2.depth"]'); const lab = i.previousElementSibling; return { fx: !!lab.querySelector('.pc-fx'), title: lab.querySelector('.pc-fx')?.title, adj: lab.nextElementSibling === i, driven: i.classList.contains('is-driven') }; }, depthSel);
  ok((await params()).links.some((l) => l.target === 'f2.depth' && l.expr === 'thick'), 'typing =thick into Extrude1\'s depth links it');
  ok(linked.fx && /= thick/.test(linked.title) && linked.adj && linked.driven, 'the field shows ƒ in its label with the equation in the title; label + input stay neighbours');
  await shot('01-linked-field');
  await tab('params');
  await page.fill('[data-var="thick"] td:nth-child(2) input', '30'); await page.press('[data-var="thick"] td:nth-child(2) input', 'Enter');
  ok(nearRel(await vol(), 150000, 1e-9) && (await pc(() => window.partcraft.part.features[1].depth)) === 30, 'forward: thick = 30 rebuilds the block to 150000');
  await shot('02-panel');
  await tab('props');
  await page.fill(depthSel, '25'); await page.press(depthSel, 'Enter');
  ok(nearRel(await vol(), 125000, 1e-9) && (await varExpr('thick')) === '25', 'backward: 25 typed into the driven depth sets thick = 25 (125000)');

  console.log('\n== parameters: two drivers, the dialog, undo');
  await page.fill(depthSel, '=thick + extra'); await page.press(depthSel, 'Enter'); await built(); await settle();
  ok(nearRel(await vol(), 150000, 1e-9), 'depth = thick + extra = 30 (150000)');
  const steps0 = await pc(() => window.partcraft.hist.undoStack.length);
  await page.fill(depthSel, '40'); await page.press(depthSel, 'Enter');
  await page.waitForSelector('dialog.pc-dialog[open]');
  const dlg = await page.evaluate(() => ({ h: document.querySelector('dialog.pc-dialog h2').textContent, keys: [...document.querySelectorAll('dialog.pc-dialog button')].map((b) => b.dataset.key) }));
  ok(/Which parameter/.test(dlg.h) && dlg.keys.join() === 'cancel,thick,extra', `40 typed: an in-page dialog asks which parameter (${dlg.keys.slice(1).join(', ')})`);
  await shot('03-which-parameter');
  await page.click('dialog.pc-dialog button[data-key="extra"]');
  await page.waitForFunction(() => window.partcraft.part.params.vars.find((v) => v.name === 'extra').expr !== '5', null, { timeout: 5000 }).catch(() => {});
  ok(nearRel(await vol(), 200000, 1e-9) && (await varExpr('extra')) === '15' && (await varExpr('thick')) === '25', 'extra picked: extra = 15, thick stays 25 (200000)');
  ok((await pc(() => window.partcraft.hist.undoStack.length)) === steps0 + 1, 'that was one undo step');
  await page.click('.pc-gl'); await page.keyboard.press('Control+z');
  ok(nearRel(await vol(), 150000, 1e-9) && (await varExpr('extra')) === '5', 'Ctrl+Z: extra back to 5, the block back to 150000');
  await page.keyboard.press('Control+y');
  ok(nearRel(await vol(), 200000, 1e-9), 'Ctrl+Y: redone');

  console.log('\n== parameters: sketch dimensions');
  await page.click('.pc-tree [data-id="f2"]');
  const dimSel = `[data-param-key="f1.${bp.dw}"]`;
  await page.fill(dimSel, '=w'); await page.press(dimSel, 'Enter'); await built(); await settle();
  await tab('params');
  await page.fill('[data-var="w"] td:nth-child(2) input', '120'); await page.press('[data-var="w"] td:nth-child(2) input', 'Enter');
  ok(nearRel(await vol(), 120 * 50 * 40, 1e-9), 'a sketch dimension linked from the Properties panel (=w); w = 120 widens the block (240000)');
  await tab('props');
  await pc(() => window.partcraft.editSketch('f1'));
  await pc((id) => window.partcraft.editor.editDimension(id), bp.dh);
  await page.waitForSelector('[data-dim-input]:not([hidden])');
  await page.fill('[data-dim-input]', '=w / 2'); await page.press('[data-dim-input]', 'Enter');
  await built(); await settle();
  ok((await params()).links.some((l) => l.target === `f1.${bp.dh}` && l.expr === 'w / 2'), 'in the sketch, "=w / 2" typed in the dimension box links that dimension');
  await shot('04-sketch-dimension');
  await pc(() => window.partcraft.exitSketch());
  ok(nearRel(await vol(), 120 * 60 * 40, 1e-9), 'the block is 120 × 60 × 40 = 288000');

  console.log('\n== parameters: design table');
  await tab('params');
  await page.setInputFiles('[data-table-file]', { name: 'sizes.csv', mimeType: 'text/csv', buffer: Buffer.from('name,thick,w\nshort,10,80\ntall,50,100\n') });
  await page.waitForSelector('[data-rows] [data-row="1"]');
  const rowNames = () => page.evaluate(() => [...document.querySelectorAll('[data-configs] [data-config-name]')].map((i) => i.value).join());
  ok((await rowNames()) === 'short,tall' && (await page.textContent('[data-rows]')).includes('thick 50, w 100'), 'a CSV design table lists its rows (configurations; the names in their own boxes)');
  const s1 = await pc(() => window.partcraft.hist.undoStack.length);
  await page.click('[data-rows] [data-row="1"] button');
  ok(nearRel(await vol(), 100 * 50 * 65, 1e-9) && (await pc(() => window.partcraft.hist.undoStack.length)) === s1 + 1, 'Apply "tall": thick 50, w 100 → 100 × 50 × 65 = 325000, one undo step');
  await shot('05-design-table');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-table-export]')]);
  const csv = fs.readFileSync(await dl.path(), 'utf8');
  ok(/^name,thick,w\r\nshort,10,80\r\ntall,50,100\r\n$/.test(csv), 'Export CSV gives the table back');
  // 0.4 P18: the rows are configurations saved in the part
  const cfgs = () => pc(() => JSON.parse(JSON.stringify(window.partcraft.part.configs || null)));
  let cf = await cfgs();
  ok(cf && cf.rows.map((r) => r.name).join() === 'short,tall' && cf.active === 'tall' && (await page.getAttribute('[data-config="tall"] [data-config-state]', 'data-config-state')) === 'active', 'the imported rows are configurations saved in the part; tall is marked active');
  await pc(() => window.partcraft.commit('thick', () => { window.partcraft.part.params.vars.find((v) => v.name === 'thick').expr = '30'; }));
  await built(); await settle();
  ok((await page.getAttribute('[data-config="tall"] [data-config-state]', 'data-config-state')) === 'changed', 'thick changed by hand: tall says "active, changed since"');
  await page.fill('[data-config-new]', 'mid'); await page.click('[data-config-save]'); await built(); await settle();
  cf = await cfgs();
  const extraNow = await pc(() => Number(window.partcraft.part.params.vars.find((v) => v.name === 'extra').expr));
  ok(cf.rows.length === 3 && cf.active === 'mid' && JSON.stringify(cf.rows[2].values) === JSON.stringify({ thick: 30, w: 100, extra: extraNow }), `Save current values as "mid": a third row with every driving parameter (${JSON.stringify(cf.rows[2]?.values)})`);
  await page.fill('[data-config-name="mid"]', 'middle'); await page.press('[data-config-name="mid"]', 'Enter'); await built(); await settle();
  cf = await cfgs();
  ok(cf.rows[2].name === 'middle' && cf.active === 'middle', 'typing a new name in its box renames it (still active)');
  await page.click('[data-config-delete="short"]'); await built(); await settle();
  ok((await cfgs()).rows.length === 2, 'Delete removes a configuration');
  await pc(() => document.activeElement?.blur()); await page.keyboard.press('Control+z'); await built(); await settle();
  ok((await cfgs()).rows.map((r) => r.name).join() === 'short,tall,middle', 'Ctrl+Z brings it back');
  await page.click('[data-config-apply="short"]'); await built();
  const pv = await pc(() => Object.fromEntries(window.partcraft.part.params.vars.map((v) => [v.name, v.expr])));
  ok(pv.thick === '10' && pv.w === '80' && (await cfgs()).active === 'short' && (await vol()) < 325000, `Apply short from the saved list: thick 10, w 80 (the part shrinks to ${(await vol()).toFixed(0)})`);
  const back = await pc(() => { const { P } = window.partcraft; return JSON.parse(JSON.stringify(P.readPart(P.toJSON(window.partcraft.part)).configs)); });
  ok(back && back.rows.map((r) => r.name).join() === 'short,tall,middle' && back.active === 'short', 'saved in the part file and read back: the three configurations, short active');
  await shot('05b-configurations');
  await page.click('[data-config-apply="tall"]'); await built();
  ok(nearRel(await vol(), 100 * 50 * 65, 1e-9), 'Apply tall again: 325000, as the next steps expect');

  console.log('\n== configurations that turn features off (0.6 LC.14)');
  const vol0 = () => pc(() => window.partcraft.regen?.stats?.volume || 0);   // nothing built = no stats
  await tab('props');
  await page.click('.pc-tree [data-id="f2"]');
  await page.click('.pc-actions button:has-text("Suppress")'); await built();
  ok((await pc(() => !!window.partcraft.part.features[1].suppressed)) && (await vol0()) === 0, 'Extrude1 suppressed from its Properties: nothing solid');
  await tab('params');
  await page.fill('[data-config-new]', 'sketch only'); await page.click('[data-config-save]'); await built(); await settle();
  const so = (await cfgs()).rows.find((r) => r.name === 'sketch only');
  ok(so && JSON.stringify(so.off) === '["f2"]' && (await page.getAttribute('[data-config="sketch only"] [data-config-off]', 'data-config-off')) === 'Extrude1', 'Save current values records Extrude1 as turned off, and the row says so');
  const stepsF = await pc(() => window.partcraft.hist.undoStack.length);
  await page.click('[data-config-apply="tall"]'); await built();
  ok(!(await pc(() => !!window.partcraft.part.features[1].suppressed)) && nearRel(await vol(), 325000, 1e-9) && (await pc(() => window.partcraft.hist.undoStack.length)) === stepsF + 1, 'Apply tall (saved with everything on): Extrude1 back on, 325000, one undo step');
  await page.click('[data-config-apply="sketch only"]'); await built();
  ok((await pc(() => !!window.partcraft.part.features[1].suppressed)) && (await vol0()) === 0 && (await page.getAttribute('[data-config="sketch only"] [data-config-state]', 'data-config-state')) === 'active', 'Apply "sketch only": Extrude1 off again, the row active');
  ok((await pc(() => { const { P } = window.partcraft; return JSON.parse(P.toJSON(window.partcraft.part)).version; })) === 4, 'the part file is version 4 now');
  await shot('05c-configuration-features');
  await page.click('[data-config-apply="tall"]'); await built();
  await page.click('[data-config-delete="sketch only"]'); await built(); await settle();
  ok(nearRel(await vol(), 325000, 1e-9) && !(await cfgs()).rows.some((r) => r.off), 'tall again and the row deleted: 325000, nothing turned off, as the next steps expect');

  console.log('\n== rollback both ways');
  await page.click('.pc-gl');
  await page.keyboard.press('[');
  await built();
  const rolled = await pc(() => ({ rb: window.partcraft.part.rollback, st: window.partcraft.regen.results.get('f2')?.status, v: window.partcraft.regen.stats?.volume || 0 }));
  ok(rolled.rb === 1 && rolled.st === 'rolled' && rolled.v === 0, '[ rolls back one feature: Extrude1 is below the bar, nothing solid is built');
  await page.keyboard.press('[');
  ok((await pc(() => window.partcraft.part.rollback)) === 0, '[ again: nothing built');
  await page.keyboard.press(']');
  ok((await pc(() => window.partcraft.part.rollback)) === 1, '] rolls forward one');
  await page.keyboard.press('End');
  ok((await pc(() => window.partcraft.part.rollback)) === null && nearRel(await vol(), 325000, 1e-9), 'End rolls to the end: 325000 again');
  ok(await page.isDisabled('[data-roll="forward"]') && await page.isDisabled('[data-roll="end"]'), 'at the end, the forward buttons are off');
  await page.click('[data-roll="back"]');
  ok((await pc(() => window.partcraft.part.rollback)) === 1, 'the history\'s "Roll back one feature" button');
  await shot('06-rolled-back');
  await page.click('[data-roll="end"]');
  ok((await pc(() => window.partcraft.part.rollback)) === null, 'its "Roll to the end" button');

  console.log('\n== scripts from the panel');
  await tab('params');
  const [sd] = await Promise.all([page.waitForEvent('download'), page.click('[data-script-save]')]);
  const script = fs.readFileSync(await sd.path(), 'utf8');
  ok(/^param thick = 50$/m.test(script) && /^  depth = thick \+ extra$/m.test(script) && /= w \/ 2/.test(script), 'Save as script writes the history with its parameters and equations');
  await page.setInputFiles('[data-script-file]', { name: 'edited.pcscript', mimeType: 'text/plain', buffer: Buffer.from(script.replace('param thick = 50', 'param thick = 5')) });
  await page.waitForFunction(() => window.partcraft.part.params?.vars.find((v) => v.name === 'thick')?.expr === '5');
  ok(nearRel(await vol(), 100 * 50 * 20, 1e-9), 'Open script on an edited copy (thick = 5): the part opens built from the text (100 × 50 × 20)');

  console.log('\n== look');
  await page.evaluate(() => document.documentElement.setAttribute('data-space', 'model'));
  await page.click('.pc-tree [data-id="f2"]');
  await tab('props');
  await shot('07-model-theme-field');
  await tab('params');
  await shot('08-model-theme-panel');
  await page.evaluate(() => document.documentElement.setAttribute('data-space', 'paper'));
  ok(!h.problems.length, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { state, out } = cliArgs();
  const h = await startHarness({ state, out: process.argv.includes('--out') ? out : path.join(REPO, 'tmp/shots/partcraft-params') });
  try { await run(h); } catch (e) { await h.failed(e); }
  await h.finish();
}

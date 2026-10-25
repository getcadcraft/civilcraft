#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-cam-07.mjs — PartCraft's 0.7 CAM work (LC.15) in headless Chromium, by clicks, on the flange: Parallel and Scallop
 * added from the toolbar (a ball end mill chosen for them, no pick needed), toolpaths made in the compute worker with no error;
 * the simulated stock drawn in colour with its key; the tool library (save a tool, it is in browser storage, export a file,
 * import a file with one new tool); the post editor (Edit post… on GRBL opens a copy, a bad line is named and Save is off, a
 * good edit shows in the preview as you type, Save chooses it as the control, the G-code downloaded has the edit); no console errors.
 *   node tools/partcraft-test/browser-cam-07.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function run(h) {
  const { page, ok, pc, built, tool, shot, F } = h;
  const choose = async (id) => { await page.selectOption('[data-workspace]', id); await page.waitForFunction((id) => window.partcraft.workspace === id, id); };
  const waitResult = () => page.waitForFunction(() => !!document.querySelector('[data-mgouges]') && !/Generating/.test(document.querySelector('[data-mprogram]')?.textContent || ''), null, { timeout: 240000 });
  const state = () => page.evaluate(async () => { const m = await import('/assets/apps/partcraft/dev/ws-manufacture.js'); const r = m._state.result; return { error: m._state.error, paths: r ? r.paths.map((p) => ({ op: p.op, error: p.error, moves: p.moves.length, warnings: p.warnings, info: p.info })) : null }; });
  const setParam = async (k, v) => { await page.fill(`[data-mparam="${k}"]`, String(v)); await page.press(`[data-mparam="${k}"]`, 'Tab'); };

  console.log('\n== cam 0.7: 3D finishing by clicks');
  await pc(() => window.partcraft.exactReady());
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
  await built();
  await choose('manufacture');
  await page.click('[data-mnew]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.manufacture);
  await page.click('[data-mtab="ops"]');
  ok(await page.isEnabled('.pc-tools [data-cmd="manufacture-parallel"]') && await page.isEnabled('.pc-tools [data-cmd="manufacture-scallop"]'), 'the toolbar has Parallel and Scallop');
  await tool('manufacture-parallel');
  await page.waitForSelector('[data-mop]');
  let ops = await pc(() => window.partcraft.part.studies.manufacture.ops.map((o) => ({ type: o.type, tool: o.tool })));
  ok(ops.length === 1 && ops[0].type === 'parallel' && ops[0].tool === 'bm6', 'Parallel added with the ball end mill chosen for it');
  ok(!(await page.isVisible('[data-mpick]')), 'no picking for a whole-model operation');
  await setParam('stepover', 0.4);
  await setParam('tolerance', 0.05);
  await tool('manufacture-scallop');
  await page.waitForFunction(() => window.partcraft.part.studies.manufacture.ops.length === 2);
  await setParam('height', 0.3);
  await page.selectOption('[data-mparam="from"]', 'top');
  await page.waitForFunction(() => window.partcraft.part.studies.manufacture.ops[1].params.from === 'top' && window.partcraft.part.studies.manufacture.ops[1].params.height === 0.3);
  await tool('manufacture-simulate');
  await waitResult();
  const st = await state();
  ok(!st.error && st.paths.length === 2 && st.paths.every((p) => !p.error && p.moves > 100), `both operations made toolpaths: ${st.paths.map((p) => p.op + ' ' + p.moves + ' moves' + (p.error ? ' ' + p.error : '')).join(', ')}`);
  ok(st.paths[1].info.passes > 5 && Math.abs(st.paths[1].info.spacing - 2 * Math.sqrt(2 * 3 * 0.3 - 0.09)) < 1e-9, `Scallop: ${st.paths[1].info.passes} passes ${st.paths[1].info.spacing.toFixed(3)} mm apart for a 0.3 mm ridge with a Ø6 ball`);
  ok(st.paths[0].warnings.length > 0, 'Parallel over uncut stock warns that the stock should be roughed first');
  const colored = await pc(() => { const o = window.partcraft.view.overlays.get('manufacture-stock'); const mesh = o && (o.geometry ? o : o.children && o.children[0]); return !!(mesh && mesh.geometry && mesh.geometry.attributes.color); });
  ok(colored, 'the simulated stock is drawn with a colour for every vertex');
  await page.check('[data-mshowstock]');
  ok(await page.isVisible('[data-mlegend]') && (await page.locator('[data-mlegend] li').count()) === 5, 'the key to the colours is shown (5 entries)');
  await shot('cam07-finishing');

  console.log('\n== cam 0.7: the tool library');
  await page.click('[data-mtab="tools"]');
  await page.click('[data-mtool]');
  await page.click('[data-mlibsave]');
  await page.waitForFunction(() => { try { return JSON.parse(localStorage.getItem('partcraft.toollib') || '{}').tools?.length >= 1; } catch { return false; } });
  const saved = await pc(() => JSON.parse(localStorage.getItem('partcraft.toollib')));
  ok(saved.format === 'partcraft-tool-library' && saved.tools.length === 1 && !('id' in saved.tools[0]), 'Save this tool: one tool in the browser\'s storage, without an id');
  await page.click('[data-mlibsave]');
  ok((await pc(() => JSON.parse(localStorage.getItem('partcraft.toollib')).tools.length)) === 1, 'saving the same tool again adds nothing');
  const [dl1] = await Promise.all([page.waitForEvent('download'), page.click('[data-mlibexport]')]);
  const lib = path.join(h.OUT, 'cam07-tools.json');
  await dl1.saveAs(lib);
  const libJson = JSON.parse(fs.readFileSync(lib, 'utf8'));
  ok(dl1.suggestedFilename().endsWith('-tools.json') && libJson.format === 'partcraft-tool-library' && libJson.tools.length === 7, `Export tools: ${dl1.suggestedFilename()}, the part's 7 starter tools`);
  const before = await pc(() => window.partcraft.part.studies.manufacture.tools.length);
  const fresh = { format: 'partcraft-tool-library', version: 1, name: 'test', tools: [libJson.tools[0], { ...libJson.tools[2], name: 'Ball 4', d: 4, number: 9 }] };
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-mlibimport]')]);
  await chooser.setFiles({ name: 'shop.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(fresh)) });
  await page.waitForFunction((n) => window.partcraft.part.studies.manufacture.tools.length === n + 1, before);
  const tl = await pc(() => window.partcraft.part.studies.manufacture.tools.at(-1));
  ok(tl.d === 4 && tl.number === 9, 'Import tools: the tool that was new came in (the one already there was skipped)');
  await page.click('[data-mlibadd]');
  await page.waitForTimeout(300);
  ok((await pc(() => window.partcraft.part.studies.manufacture.tools.length)) === before + 1, 'Add to this part: the saved tool is already in the part, so nothing is added twice');
  const bad = { format: 'nope', version: 1, tools: [] };
  const [chooser2] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-mlibimport]')]);
  await chooser2.setFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(bad)) });
  await page.waitForTimeout(300);
  ok(/not a PartCraft tool library/.test(await h.statusText()) && (await pc(() => window.partcraft.part.studies.manufacture.tools.length)) === before + 1, 'a file that is not a tool library is refused, saying so');

  console.log('\n== cam 0.7: the post editor');
  await page.click('[data-mtab="ops"]');
  await page.click('[data-mpostedit]');
  await page.waitForSelector('[data-mpost-editor]');
  const text0 = await page.inputValue('[data-mpost-text]');
  ok(/^post my-grbl$/m.test(text0) && /^name GRBL \(\.nc\), my copy$/m.test(text0) && /line-numbers off/.test(text0), 'Edit post… on GRBL opens a copy of it with an id and name of its own');
  ok(/Reads fine/.test(await page.textContent('[data-mpost-status]')) && (await page.textContent('[data-mpost-preview]')).includes('(Generated by PartCraft'), 'the status says it reads, the preview shows the G-code of this part');
  await page.fill('[data-mpost-text]', text0.replace('on spindle', 'frobnicate\non spindle'));
  await page.waitForFunction(() => /Line \d+:/.test(document.querySelector('[data-mpost-status]').textContent), null, { timeout: 5000 });
  ok(await page.isDisabled('[data-mpost-save]') && /Unknown statement "frobnicate"/.test(await page.textContent('[data-mpost-status]')), 'a bad line is named with its number and Save is off');
  await page.click('[data-mpost-jump]');
  const sel = await page.evaluate(() => { const a = document.querySelector('[data-mpost-text]'); return a.value.slice(a.selectionStart, a.selectionEnd); });
  ok(sel === 'frobnicate', 'Go to the line selects it');
  await page.fill('[data-mpost-text]', text0.replace('line-numbers off', 'line-numbers 10'));
  await page.waitForFunction(() => /^N10 /m.test(document.querySelector('[data-mpost-preview]').textContent), null, { timeout: 5000 });
  ok(!(await page.isDisabled('[data-mpost-save]')), 'a good edit: the preview gets line numbers as you type and Save is on');
  await page.click('[data-mpost-save]');
  await page.waitForFunction(() => !document.querySelector('[data-mpost-editor]'));
  const ctl = await pc(() => ({ post: window.partcraft.part.studies.manufacture.setup.machine.post, posts: window.partcraft.part.studies.manufacture.posts.map((p) => p.id) }));
  ok(ctl.post === 'custom:my-grbl' && ctl.posts.join() === 'my-grbl', 'Save keeps the post in the part and chooses it as the control');
  ok((await page.locator('select option[value="custom:my-grbl"]').count()) >= 1, 'it is in the Control list');
  const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('[data-mpost]')]);
  const f2 = path.join(h.OUT, 'cam07-post.nc');
  await dl2.saveAs(f2);
  const gtxt = fs.readFileSync(f2, 'utf8');
  ok(/^N10 /m.test(gtxt) && /^\(Generated by PartCraft/m.test(gtxt) && !/M6|G8[13]/.test(gtxt), 'the G-code downloaded is the edited post: line numbers N10, N20 …, GRBL\'s header, no M6 or canned cycles');
  const [dl3] = await Promise.all([page.waitForEvent('download'), (async () => { await page.click('[data-mpostedit]'); await page.waitForSelector('[data-mpost-editor]'); await page.click('[data-mpost-export]'); })()]);
  ok(dl3.suggestedFilename() === 'my-grbl.cpost', 'Save as a file… writes my-grbl.cpost');
  await page.click('[data-mpost-delete]');
  await page.waitForFunction(() => !document.querySelector('[data-mpost-editor]'));
  ok((await pc(() => window.partcraft.part.studies.manufacture.setup.machine.post)) === 'grbl' && (await pc(() => window.partcraft.part.studies.manufacture.posts.length)) === 0, 'Delete this post: gone, and the control falls back to GRBL');
  await choose('design');
  ok(h.problems.length === 0, 'cam 0.7: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}

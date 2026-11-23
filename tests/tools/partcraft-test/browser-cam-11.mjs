#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-cam-11.mjs — PartCraft's 0.11 Track CAM in headless Chromium, by clicks, on the flange in /lab: 3D roughing and rest
 * machining from the toolbar (toolpaths in the compute worker, no gouge), the machine's rotary axes in Setup, a tilted tool
 * direction on an operation, 5-axis finishing, the G-code downloaded with rotary words; turning operations that bring their
 * own tools, a milling post refusing a turning program and a lathe post writing it; no console errors.
 *   node tools/partcraft-test/browser-cam-11.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function run(h) {
  const { page, ok, pc, built, tool, shot, F } = h;
  const choose = async (id) => { await page.selectOption('[data-workspace]', id); await page.waitForFunction((id) => window.partcraft.workspace === id, id); };
  const waitResult = () => page.waitForFunction(() => !!document.querySelector('[data-mgouges]') && !/Generating/.test(document.querySelector('[data-mprogram]')?.textContent || ''), null, { timeout: 420000 });
  const state = () => page.evaluate(async () => { const m = await import('/assets/apps/partcraft/dev/ws-manufacture.js'); const r = m._state.result; return { error: m._state.error, busy: m._state.busy, report: r ? r.report : null, paths: r ? r.paths.map((p) => ({ op: p.op, error: p.error, moves: p.moves.length, warnings: p.warnings, info: p.info, kind: p.kind, frame: !!(p.frame && p.frame.Q), sim: p.sim ? { gouges: p.sim.gouges, rapidCuts: p.sim.rapidCuts, removed: p.sim.removed } : null })) : null }; });
  const settle = async () => { await page.waitForFunction(async () => { const m = await import('/assets/apps/partcraft/dev/ws-manufacture.js'); return !m._state.busy; }, null, { timeout: 420000 }); await page.waitForTimeout(400); await page.waitForFunction(async () => { const m = await import('/assets/apps/partcraft/dev/ws-manufacture.js'); return !m._state.busy; }, null, { timeout: 420000 }); };
  const setParam = async (k, v) => { await page.fill(`[data-mparam="${k}"]`, String(v)); await page.press(`[data-mparam="${k}"]`, 'Tab'); };
  const study = () => pc(() => window.partcraft.part.studies.manufacture);
  const download = async (name) => { const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-mpost]')]); const f = path.join(h.OUT, name); await dl.saveAs(f); return { text: fs.readFileSync(f, 'utf8'), file: dl.suggestedFilename() }; };

  console.log('\n== cam 0.11: 3D roughing and rest machining by clicks');
  await pc(() => window.partcraft.exactReady());
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
  await built();
  await choose('manufacture');
  await page.click('[data-mnew]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.manufacture);
  await page.click('[data-mtab="ops"]');
  ok(await page.isEnabled('.pc-tools [data-cmd="manufacture-more"]'), 'the toolbar has More');
  const rows = await page.evaluate(() => new Set([...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden).map((g) => g.offsetTop)).size);
  ok(rows === 1, 'the toolbar is still one row at 1440 px (' + rows + ')');
  await tool('manufacture-more');
  await page.waitForSelector('[data-madding]');
  const offered = await page.evaluate(() => [...document.querySelectorAll('[data-madd]')].map((b) => b.dataset.madd));
  ok(offered.join() === 'rough3d,rest3d,five,rotary,turnface,turnrough,turnfinish,turngroove,turnpart,turnthread,turndrill,probe', 'More offers the twelve new operations at the top of the Operations tab, by family');
  await page.click('[data-maddclose]');
  ok((await page.locator('[data-madd]').count()) === 0 && (await pc(() => window.partcraft.part.studies.manufacture.ops.length)) === 0, 'Close puts the list away; nothing was added');
  await tool('manufacture-more');
  await page.click('[data-madd="rough3d"]');
  await page.waitForSelector('[data-mop]');
  let st = await study();
  ok(st.ops.length === 1 && st.ops[0].type === 'rough3d' && st.tools.find((x) => x.id === st.ops[0].tool)?.kind === 'flat', '3D rough added with a flat end mill chosen for it');
  ok(!(await page.isVisible('[data-mpick]')), 'no picking for a whole-model operation');
  await setParam('stepdown', 5);
  await page.click('[data-madd="rest3d"]');
  await page.waitForFunction(() => window.partcraft.part.studies.manufacture.ops.length === 2);
  // the rest pass with the smaller end mill
  const small = (await study()).tools.filter((x) => x.kind === 'flat').sort((a, b) => a.d - b.d)[0];
  await page.selectOption('.pc-props select:has(option[value="' + small.id + '"])', small.id);
  await page.waitForFunction((id) => window.partcraft.part.studies.manufacture.ops[1].tool === id, small.id);
  await setParam('stepdown', 3);
  await tool('manufacture-simulate');
  await waitResult(); await settle();
  let s = await state();
  ok(!s.error && s.paths.length === 2 && s.paths.every((p) => !p.error), 'both operations made toolpaths in the worker: ' + (s.paths || []).map((p) => p.op + ' ' + p.moves + ' moves' + (p.error ? ' ' + p.error : '')).join(', ') + (s.error ? ' — ' + s.error : ''));
  ok(s.paths[0].moves > 100 && s.paths[0].sim.gouges === 0 && s.paths[0].sim.rapidCuts === 0 && s.paths[0].sim.removed > 1000, `3D roughing: ${s.paths[0].moves} moves, ${(s.paths[0].sim.removed / 1000).toFixed(1)} cm³ removed, no gouge, no rapid through stock`);
  ok(s.paths[1].sim.gouges === 0 && s.paths[1].sim.rapidCuts === 0 && s.paths[1].info.cutLength < s.paths[0].info.cutLength, `rest machining: no gouge, and less cutting than the roughing (${Math.round(s.paths[1].info.cutLength || 0)} mm against ${Math.round(s.paths[0].info.cutLength)} mm)`);
  ok(s.report.gouges === 0, 'the program\'s simulation reports no gouge');
  await page.check('[data-mshowstock]');
  await shot('cam11-roughing');

  console.log('\n== cam 0.11: rotary axes, a tilted tool, 5-axis finishing');
  await page.click('[data-mtab="setup"]');
  ok(await page.isVisible('[data-mkin]') && !(await page.isVisible('[data-mtcp]')), 'Setup has "Rotary axes" (None); the rest shows only for a machine that has them');
  await page.selectOption('[data-mkin]', 'ac');
  await page.waitForSelector('[data-mtcp]');
  ok((await study()).setup.machine.kin === 'ac', 'A and C chosen: the machine in the study has them, and Setup asks who carries them and for tool-tip control');
  await page.selectOption('.pc-props select:has(option[value="linuxcnc"])', 'linuxcnc');
  await page.click('[data-mtab="ops"]');
  await tool('manufacture-face');
  await page.waitForFunction(() => window.partcraft.part.studies.manufacture.ops.length === 3);
  ok(await page.isVisible('[data-morient="tilt"]') && await page.isDisabled('[data-morient="turn"]'), 'an ordinary operation has a tool tilt; the turn is off until it tilts');
  await page.fill('[data-morient="tilt"]', '90'); await page.press('[data-morient="tilt"]', 'Tab');
  await page.waitForFunction(() => window.partcraft.part.studies.manufacture.ops[2].orient?.tilt === 90);
  await page.fill('[data-morient="turn"]', '90'); await page.press('[data-morient="turn"]', 'Tab');
  await page.waitForFunction(() => window.partcraft.part.studies.manufacture.ops[2].orient?.turn === 90);
  await page.click('[data-madd="five"]');
  await page.waitForFunction(() => window.partcraft.part.studies.manufacture.ops.length === 4);
  st = await study();
  ok(st.ops[3].type === 'five' && st.tools.find((x) => x.id === st.ops[3].tool)?.kind === 'ball' && !(await page.isVisible('[data-morient="tilt"]')), '5-axis finishing added with the ball end mill; it has no fixed tilt of its own');
  await setParam('stepover', 0.5);
  await setParam('tolerance', 0.05);
  await tool('manufacture-simulate');
  await waitResult(); await settle();
  s = await state();
  ok(!s.error && s.paths.length === 4 && s.paths.every((p) => !p.error), 'all four operations made toolpaths: ' + (s.paths || []).map((p) => p.op + ' ' + p.moves + (p.error ? ' ' + p.error : '')).join(', ') + (s.error ? ' — ' + s.error : ''));
  ok(s.paths[2].frame && s.paths[2].sim && s.paths[2].sim.gouges === 0, 'the tilted facing has its own frame and its own simulation, no gouge');
  ok(s.paths[3].kind === 'multi' && !s.paths[3].sim && s.paths[3].info.maxTilt > 1, `the 5-axis pass leans up to ${(s.paths[3].info.maxTilt || 0).toFixed(1)}° and is not run through the stock simulation`);
  ok(s.paths[2].warnings.length === 0 && s.paths[3].warnings.filter((w) => /rotary|axis|tilt/i.test(w)).length === 0, 'no kinematics warning on a machine with A and C');
  await shot('cam11-multiaxis');
  const g1 = await download('cam11-ac.ngc');
  ok(/\.ngc$/.test(g1.file) && /G0 A-90 C-180/.test(g1.text) && /G0 A0 C0/.test(g1.text), 'the G-code turns the table for the tilted operation (A−90 C−180) and starts upright (A0 C0)');
  ok(/G93 [^\n]*A-?[\d.]+ C-?[\d.]+ F[\d.]+/.test(g1.text) && /G94/.test(g1.text), 'the 5-axis moves carry A and C with inverse-time feed (G93), then G94');
  // a 3-axis machine: the operations warn and the post refuses
  await page.click('[data-mtab="setup"]');
  await page.selectOption('[data-mkin]', 'none');
  await page.click('[data-mtab="ops"]');
  await settle(); await waitResult();
  s = await state();
  ok(s.paths[2].warnings.length > 0 && s.paths[3].warnings.length > 0, 'back on a 3-axis machine both operations warn: ' + s.paths[2].warnings[0]);
  await page.click('[data-mpost]');
  await page.waitForFunction(() => /No G-code was written/.test(document.querySelector('[data-status]')?.textContent || ''));
  ok(true, 'and Download G-code says why nothing was written: ' + (await h.statusText()).trim().slice(0, 110));

  console.log('\n== cam 0.11: turning');
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
  await built();
  await choose('design'); await choose('manufacture');
  await page.click('[data-mnew]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.manufacture);
  await page.selectOption('.pc-props select:has(option[value="cylinder"])', 'cylinder');
  await page.click('[data-mtab="ops"]');
  if (!(await page.isVisible('[data-madding]'))) await tool('manufacture-more');   // More is a toggle, and it was left open above
  await page.waitForSelector('[data-madding]');
  for (const c of ['turnface', 'turnrough', 'turnfinish', 'turnpart']) { await page.click(`[data-madd="${c}"]`); await page.waitForTimeout(120); }
  await page.waitForFunction(() => window.partcraft.part.studies.manufacture.ops.length === 4);
  st = await study();
  const kinds = st.ops.map((o) => st.tools.find((x) => x.id === o.tool)?.kind);
  ok(kinds.join() === 'turn,turn,turn,groove' && st.tools.filter((x) => x.kind === 'turn').length === 1 && st.tools.filter((x) => x.kind === 'groove').length === 1, 'the turning operations brought their own tools: one turning insert (shared), one grooving blade');
  await tool('manufacture-simulate');
  await waitResult(); await settle();
  s = await state();
  ok(!s.error && s.paths.length === 4 && s.paths.every((p) => !p.error && p.kind === 'lathe' && p.sim && p.sim.gouges === 0), 'facing, roughing, finishing and parting made lathe paths with no gouge: ' + (s.paths || []).map((p) => p.op + ' ' + p.moves + (p.error ? ' ' + p.error : '')).join(', ') + (s.error ? ' — ' + s.error : ''));
  ok(s.paths[1].sim.removed > 1000, `roughing removes ${(s.paths[1].sim.removed / 1000).toFixed(1)} cm³`);
  await shot('cam11-turning');
  await page.click('[data-mpost]');
  await page.waitForFunction(() => /No G-code was written/.test(document.querySelector('[data-status]')?.textContent || ''));
  ok(/lathe post/.test(await h.statusText()), 'GRBL (a milling post) refuses the turning program and says to choose a lathe post');
  await page.click('[data-mtab="setup"]');
  await page.selectOption('.pc-props select:has(option[value="fanuc-lathe"])', 'fanuc-lathe');
  await page.click('[data-mtab="ops"]');
  await settle();
  const g2 = await download('cam11-lathe.nc');
  ok(/G96 S\d+ M3/.test(g2.text) && /G50 S\d+/.test(g2.text) && /T0\d0\d/.test(g2.text) && !/\bY-?\d/.test(g2.text), 'the Fanuc-style lathe post writes it: G50, G96, T0n0n, X and Z only');
  await page.click('[data-mtab="tools"]');
  const turnTool = (await study()).tools.find((x) => x.kind === 'turn');
  await page.click(`[data-mtool="${turnTool.id}"]`);
  ok(/Nose radius/.test(await page.textContent('.pc-panel, body')) && /Cutting edge angle/.test(await page.textContent('body')), 'the tool editor shows a turning insert\'s nose radius, insert angle and cutting edge angle');
  await choose('design');
  ok(h.problems.length === 0, 'cam 0.11: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}

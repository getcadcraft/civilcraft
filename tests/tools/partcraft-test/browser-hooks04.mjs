#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-hooks04.mjs — PartCraft's round-4 seams (part-model_PART_4): EG.77 undo reporter (a finished step is told, Studio's probe/run work through the app's own undo)
 * and SC.5 (a feature pick is announced as `cc-pick`; ccPickApply selects a feature from another panel).
 *   node tools/partcraft-test/browser-hooks04.mjs [--state <file>] [--out <dir>]
 */
import { startHarness, cliArgs } from './browser-harness.mjs';
const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { ok, F } = h;
const page = h.page;
try {
  console.log('\n== EG.77 undo reporter and SC.5 pick');
  await page.evaluate((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
  await page.evaluate(() => window.partcraft.built());
  await page.evaluate(() => { window.__ev = []; window.addEventListener('cc-undo-report', (e) => window.__ev.push(e.detail)); window.__picks = []; window.addEventListener('cc-pick', (e) => window.__picks.push(e.detail)); });
  await page.evaluate(() => window.partcraft.commit('Rename', () => { window.partcraft.part.name = 'Hooked'; }));
  const ev = await page.evaluate(() => window.__ev);
  ok(ev.length >= 1 && ev.at(-1).type === 'edit.done' && ev.at(-1).data.kind === 'do' && ev.at(-1).data.label === 'Rename', 'a finished edit is told: ' + JSON.stringify(ev.at(-1)));
  const probe = await page.evaluate(() => window.ccUndoReporter.onMessage('undo.probe', {}));
  ok(probe && probe.step && probe.depth >= 1, 'the probe names the top step: ' + JSON.stringify(probe));
  const run = await page.evaluate((step) => window.ccUndoReporter.onMessage('undo.run', { step }), probe.step);
  ok(run && run.ok === true, 'a run undoes it through the app: ' + JSON.stringify(run));
  ok(await page.evaluate(() => window.partcraft.part.name) !== 'Hooked', 'the rename is undone');
  const stale = await page.evaluate(() => window.ccUndoReporter.onMessage('undo.run', { step: 'nope' }));
  ok(stale && stale.ok === false, 'a run for a step that is not on top is refused');
  const fid = await page.evaluate(() => window.partcraft.part.features[0].id);
  await page.evaluate((id) => window.partcraft.selectFeature(id), fid);
  const pk = await page.evaluate(() => window.__picks.at(-1));
  ok(pk && pk.app === 'partcraft' && pk.ids[0] === String(fid), 'picking a feature announces cc-pick: ' + JSON.stringify(pk));
  const fid2 = await page.evaluate(() => window.partcraft.part.features.at(-1).id);
  const applied = await page.evaluate((id) => window.ccPickApply([{ app: 'partcraft', id }]), fid2);
  ok(applied === true && await page.evaluate(() => window.partcraft.sel?.id) === fid2, 'ccPickApply selects the related feature');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
} catch (err) { await h.failed(err); }
await h.finish();

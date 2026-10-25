#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-autosave.mjs — 0.4 item 1.2 in PartCraft (the shell's app-autosave.js): an edit to the open part leaves a recovery
 * copy; a tab closed without saving offers it on the next start ("Recover your work?"), and recovering reopens the part with
 * the edit, as unsaved work; after a save the copy is gone and nothing is offered. Runs on the 0.4 default (mesh kernel).
 *   node tools/partcraft-test/browser-autosave.mjs [--state <file>] [--out <dir>]
 */
import { startHarness, cliArgs, BASE } from './browser-harness.mjs';

const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { ok, F } = h;
let page = h.page;

/** A fresh tab of the lab page (the previous one closed first, so its copies count as left behind). */
async function reopen() {
  await page.close();   // no beforeunload prompt: Playwright closes without running it
  page = await h.ctx.newPage();
  page.on('pageerror', (e) => h.problems.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') h.problems.push('console: ' + m.text()); });
  await page.goto(BASE + '/lab/partcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.partcraft && window.partcraft.regen, null, { timeout: 30000 });
}

try {
  console.log('\n== autosave (1.2): a copy after an edit, offered after a closed tab');
  await page.evaluate((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
  await page.evaluate(() => window.partcraft.built());
  await page.evaluate(() => window.partcraft.commit('Rename', () => { window.partcraft.part.name = 'Autosaved flange'; }));
  await page.waitForTimeout(3500);   // the copy is written about 2 s after the last edit
  await reopen();
  await page.waitForSelector('dialog[data-autosave-dialog][open]', { timeout: 15000 });
  const txt = await page.textContent('dialog[data-autosave-dialog]');
  ok(/Autosaved flange/.test(txt), `the next start asks to recover it, by name ("${txt.replace(/\s+/g, ' ').trim().slice(0, 120)}")`);
  await page.click('dialog[data-autosave-dialog] [data-autosave-recover]');
  await page.waitForFunction(() => window.partcraft.part.name === 'Autosaved flange' && !document.querySelector('dialog[data-autosave-dialog][open] [data-autosave-row]'), null, { timeout: 15000 });
  await page.evaluate(() => window.partcraft.built());
  const back = await page.evaluate(() => ({ n: window.partcraft.part.features.length, v: window.partcraft.regen.stats?.volume }));
  ok(back.n === F.flange().part.features.length && back.v > 0, `Recover reopens the part with the edit: "Autosaved flange", ${back.n} features, built (${back.v?.toFixed(1)} mm³)`);
  await page.screenshot({ path: h.OUT + '/autosave-recovered.png' });

  console.log('\n== autosave: after a save the copy goes');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => window.partcraft.run('save'))]);
  ok(/Autosaved flange\.partcraft\.json$/.test(dl.suggestedFilename()), `Save downloads ${dl.suggestedFilename()}`);
  await page.waitForTimeout(2500);   // the watcher drops the copy once the part is saved
  await reopen();
  await page.waitForTimeout(3000);
  ok(!(await page.$('dialog[data-autosave-dialog][open]')), 'the next start offers nothing');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
} catch (err) { await h.failed(err); }
await h.finish();

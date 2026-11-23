#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-main-11.mjs: guard for PERF.71 round two (0.11 perf-finish-11 r2, lane model-part), which puts init()'s state into one object (ST)
 * and moves eleven more topics out of partcraft.js into mountX(ctx) modules (keys + touch, workspaces, files, drawing sheet, assembly, edit,
 * toolbar + run, tree, features, sketch mode, 3D picking). One page; each step drives one moved module through the real /lab page, and the
 * run fails on any console or page error (how a closure name lost in a move shows). The same file runs on the ORIGINAL main and the split one.
 * Uses the PartCraft harness (this server's test admin), so it runs here:
 *   PC_EXACT=0 flock tmp/pf11-browser.lock nice -n 10 timeout 600 node tools/partcraft-test/browser-main-11.mjs [--state <file>] [--out <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startHarness, cliArgs } from './browser-harness.mjs';

const { state, out } = cliArgs();
const TMP = path.join(out, 'main-11');
fs.mkdirSync(TMP, { recursive: true });

export async function run(h) {
  const { page, ok, pc, built } = h;
  const download = async (fn) => { const [d] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), fn()]); const f = path.join(TMP, d.suggestedFilename()); await d.saveAs(f); return { name: d.suggestedFilename(), file: f, bytes: fs.readFileSync(f) }; };
  const nFeat = () => pc(() => window.partcraft.part.features.length);
  const stage = async () => { const r = await page.locator('.pc-stage canvas').first().boundingBox(); return r; };

  console.log('\n== the round-two modules of the split main');
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(h.F.flange().part));
  await built();
  if ((await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace)) !== 'design') { await page.selectOption('[data-workspace]', 'design'); await page.waitForTimeout(300); }
  ok(h.problems.length === 0, 'a part opens with no console or page errors (files, regen)');

  // the tree (tree-ui)
  const f0 = await nFeat();
  const rows = await pc(() => document.querySelectorAll('[data-tree] .pc-node').length);
  ok(rows >= f0, 'the tree lists every feature', `${rows} rows, ${f0} features`);
  const feats = await pc(() => window.partcraft.part.features.map((f) => ({ id: f.id, type: f.type })));
  const solid = feats.find((f) => f.type === 'extrude') || feats[feats.length - 1];
  await pc((id) => window.partcraft.selectFeature(id), solid.id);
  await page.waitForTimeout(200);
  ok(await pc((id) => window.partcraft.sel?.kind === 'feature' && window.partcraft.sel.id === id, solid.id), 'selecting a feature in the tree selects it');

  // edit: copy, paste (edit-ui), undo / redo from the keys (input-ui) and the toolbar (toolbar-ui run)
  const copyable = await pc(() => window.partcraft.part.features.filter((f) => window.partcraft.C.COPYABLE.has(f.type)).map((f) => f.id).pop() || null);
  if (copyable) await pc((id) => window.partcraft.selectFeature(id), copyable);
  await page.waitForTimeout(200);
  const st = await pc(() => { const s = window.partcraft.editState(); return { copy: !!s.copy?.ok, why: s.copy?.why || '' }; });
  ok(!!copyable && st.copy, 'Copy is offered for a selected copyable feature (editState): ' + (copyable || 'none') + ' ' + st.why);
  await pc(() => window.partcraft.run('duplicate'));
  await built();
  await page.waitForTimeout(400);
  const f1 = await nFeat();
  ok(f1 > f0, `Duplicate adds the feature again (${f0} -> ${f1})`);
  await page.locator('.pc-stage canvas').first().focus().catch(() => {});
  await page.evaluate(() => document.activeElement?.blur?.());
  await page.keyboard.press('Control+z');
  await built();
  await page.waitForTimeout(300);
  ok(await nFeat() === f0, `Ctrl+Z undoes it (${await nFeat()})`);
  await pc(() => window.partcraft.run('redo'));
  await built();
  await page.waitForTimeout(300);
  ok(await nFeat() === f1, 'Redo (the toolbar command) puts it back');
  await pc(() => window.partcraft.run('undo'));
  await built();

  // a new feature (features-ui): Fillet asks for edges in pick mode (pick-ui), Esc leaves it
  await pc(() => window.partcraft.run('fillet'));
  await page.waitForTimeout(500);
  const t1 = await pc(() => ({ mode: window.partcraft.mode, n: window.partcraft.part.features.length, editing: window.partcraft.editing }));
  ok(t1.mode === 'pick' || t1.n === f0 + 1 || !!t1.editing, 'Fillet starts a new feature (pick mode or a new row)', JSON.stringify(t1));
  await pc(() => (window.partcraft.mode === 'pick' ? window.partcraft.endPick() : null));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await built();
  { const r = await stage(); await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await page.mouse.move(r.x + r.width / 2 + 5, r.y + r.height / 2 + 5); await page.waitForTimeout(200); }
  ok(h.problems.length === 0, 'hovering the part (onHover) gives no error' + (h.problems.length ? ': ' + h.problems[0] : ''));

  // sketch mode (sketch-ui): edit an existing sketch, then leave it
  const sk = feats.find((f) => f.type === 'sketch');
  await pc((id) => window.partcraft.editSketch(id), sk.id);
  await page.waitForFunction(() => window.partcraft.mode === 'sketch', null, { timeout: 10000 });
  ok(await pc(() => !document.querySelector('[data-sketch-bar], .pc-skbar')?.hidden || window.partcraft.mode === 'sketch'), 'editing a sketch enters sketch mode');
  await pc(() => window.partcraft.exitSketch());
  await page.waitForFunction(() => window.partcraft.mode !== 'sketch', null, { timeout: 10000 });
  await built();

  // workspaces (workspaces-ui): every workspace and back to Design
  const wss = await pc(() => window.partcraft.WS.listWorkspaces().map((w) => w.id));
  let wsOk = 0;
  for (const id of wss) { if (await pc((x) => window.partcraft.setWorkspace(x) !== false, id)) wsOk++; await page.waitForTimeout(250); }
  await pc(() => window.partcraft.setWorkspace('design'));
  await page.waitForTimeout(300);
  ok(wsOk >= 2 && await pc(() => window.partcraft.workspace) === 'design', `the workspaces open and Design comes back (${wsOk} of ${wss.length})`);

  // save and open again (files-ui)
  const saved = await download(() => pc(() => window.partcraft.run('save')));
  let j = null; try { j = JSON.parse(saved.bytes.toString('utf8')); } catch { /* not JSON */ }
  ok(!!j && /partcraft/i.test(saved.name), 'Save downloads the part file: ' + saved.name + ' (' + (j?.features?.length ?? '?') + ' features)');
  await pc(() => window.partcraft.run('new'));
  await page.waitForTimeout(600);
  await page.keyboard.press('Escape');
  await built();
  const fNew = await nFeat();
  await page.setInputFiles('[data-file]', saved.file);
  await page.waitForTimeout(1500);
  if (await page.locator('dialog[open]').count()) { await page.keyboard.press('Enter'); await page.waitForTimeout(500); }
  await built();
  ok(await nFeat() === (j?.features?.length ?? -1), `the saved file opens again with its features (${j?.features?.length} saved; new ${fNew} -> ${await nFeat()}; ${saved.name}; dialogs ${await page.locator('dialog[open]').count()})`);

  // assembly (assembly-ui): a new assembly from the part, one more copy, back out
  await pc(() => window.partcraft.run('asm-new'));
  await page.waitForFunction(() => window.partcraft.mode === 'assembly', null, { timeout: 30000 }).catch(() => {});
  await pc(() => window.partcraft.asmBuilt?.());
  const a0 = await pc(() => window.partcraft.asm?.instances?.length || 0);
  await pc(() => window.partcraft.run('asm-insert-copy'));
  await page.waitForTimeout(800);
  await pc(() => window.partcraft.asmBuilt?.());
  const a1 = await pc(() => window.partcraft.asm?.instances?.length || 0);
  ok(a0 >= 1 && a1 === a0 + 1, 'an assembly starts and Insert copy adds an instance', `${a0} -> ${a1}`);
  ok(await pc(() => document.querySelectorAll('[data-tree] .pc-node, [data-tree] li').length) >= a1, 'the assembly tree lists the instances');
  await pc(() => window.partcraft.run('asm-check'));
  await page.waitForTimeout(600);
  ok(h.problems.length === 0, 'Check (clashes) runs' + (h.problems.length ? ': ' + h.problems[0] : ''));

  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const h = await startHarness({ state, out });
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}

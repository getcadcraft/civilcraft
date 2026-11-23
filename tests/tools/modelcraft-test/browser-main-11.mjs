#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-main-11.mjs: guard for PERF.71 round two (0.11 perf-finish-11 r2, lane model-part), which puts init()'s state into one object (ST)
 * and moves twelve more topics out of modelcraft.js into mountX(ctx) modules (pointer, context menu, actions, view menu, scenes, tree, paint +
 * lights, file save / open, export, print check, guide). One page load; each step drives one moved module through the real /lab page, and the
 * run fails on any console or page error (how a closure name lost in a move shows). The same file runs on the ORIGINAL main and the split one.
 *   flock tmp/pf11-browser.lock nice -n 10 node tools/modelcraft-test/browser-main-11.mjs        (the VPS; or tools/gpu-remote/run.sh --lab)
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { launch, labCookie, machine, BASE } from '../gpu-remote/browser.mjs';

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-main-11-'));

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
await ctx.addCookies(labCookie());
const page = await ctx.newPage();
page.setDefaultTimeout(30000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + ' @ ' + String(e.stack || '').split('\n').slice(1, 3).map((x) => x.trim().replace(/^at /, '')).join(' < ')));
const act = (a) => page.evaluate((x) => document.querySelector('[data-act="' + x + '"]').click(), a);
const click = (sel) => page.evaluate((s) => document.querySelector(s).click(), sel);
const mc = (fn, arg) => page.evaluate(fn, arg);
const focusView = () => page.evaluate(() => window.modelcraft.ui.over.focus());
const closeDialogs = async () => {
  for (let i = 0; i < 3 && await page.locator('dialog[open]').count(); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
  if (await page.locator('dialog[open]').count()) await page.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
};

try {
  console.log('machine: ' + await machine(page));
  await page.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.modelcraft && window.modelcraft.model, null, { timeout: 40000 });
  await page.click('[data-autosave-discard-all]', { timeout: 1500 }).catch(() => {});
  ok(problems.length === 0, 'the page boots with no console or page errors', problems.slice(0, 3).join(' | '));

  // ---- a mesh to work on (import-ui, round one), then the outliner (tree-ui) ----
  const obj = ['o Slab', 'v 0 0 0', 'v 2 0 0', 'v 2 0 -1', 'v 0 0 -1', 'f 1 2 3 4', 'o Wedge', 'v 3 0 0', 'v 5 0 0', 'v 4 0 -2', 'v 4 1 -1', 'f 5 6 7', 'f 5 6 8', 'f 6 7 8', 'f 7 5 8', ''].join('\n');
  await page.setInputFiles('[data-file-import]', { name: 'slab.obj', mimeType: 'text/plain', buffer: Buffer.from(obj) });
  await page.waitForFunction(() => /slab\.obj/.test(window.modelcraft.ui.msg.textContent), null, { timeout: 60000 });
  const top0 = await mc(() => window.modelcraft.model.root.insts.size);
  ok(top0 >= 1, 'an OBJ imported through the file input becomes a group', 'top-level ' + top0);
  await page.waitForTimeout(500);
  ok(await mc(() => window.modelcraft.ui.tree.querySelectorAll('li').length) >= 1, 'the outliner lists it (renderTree)');

  // ---- keyboard on the view (pointer-ui) and selection commands (actions-ui) ----
  await act('select-none');
  await focusView();
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(200);
  ok(await mc(() => window.modelcraft.host.sel.length) >= 1, 'Ctrl+A on the view selects everything (the key handler)');
  await page.waitForTimeout(400);
  ok((await page.locator('[data-info]').innerText()).trim().length > 10, 'the Info panel describes the selection');
  await act('hide');
  await page.waitForTimeout(200);
  const hidden = await mc(() => [...window.modelcraft.model.root.insts.values()].filter((i) => i.hidden).length);
  await act('unhide-all');
  await page.waitForTimeout(200);
  const hiddenAfter = await mc(() => [...window.modelcraft.model.root.insts.values()].filter((i) => i.hidden).length);
  ok(hidden >= 1 && hiddenAfter === 0, 'Hide, then Unhide all (act)', `hidden ${hidden} then ${hiddenAfter}`);
  await act('select-all');
  await act('copy');
  await act('paste-in-place');
  await page.waitForTimeout(400);
  const topDup = await mc(() => window.modelcraft.model.root.insts.size);
  ok(topDup > top0, 'Copy, then Paste in place adds a copy', `${top0} -> ${topDup}`);
  await focusView();
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(300);

  // ---- the context menu (context-menu-ui), opened from the keyboard (pointer-ui) ----
  await act('select-all');
  await focusView();
  await page.keyboard.press('Shift+F10');
  await page.waitForTimeout(300);
  const ctxItems = await mc(() => { const m = document.querySelector('.shell-ctx'); return m && !m.hidden && m.isConnected ? m.querySelectorAll('button, [role=menuitem]').length : 0; });
  ok(ctxItems >= 3, 'Shift+F10 opens the context menu with the selection\'s commands', 'items ' + ctxItems);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // ---- the View menu (view-menu-ui) ----
  const p0 = await mc(() => window.modelcraft.cam.persp);
  await click('[data-persp]');
  const p1 = await mc(() => window.modelcraft.cam.persp);
  await click('[data-persp]');
  ok(p1 === !p0 && await mc(() => window.modelcraft.cam.persp) === p0, 'Perspective switches and switches back');
  const x0 = await mc(() => document.querySelector('[data-xray]').getAttribute('aria-checked'));
  await click('[data-xray]');
  const x1 = await mc(() => document.querySelector('[data-xray]').getAttribute('aria-checked'));
  await click('[data-xray]');
  ok(x0 !== x1, 'X-ray turns on and off', `${x0} -> ${x1}`);
  await click('[data-view="top"]');
  await page.waitForTimeout(300);
  ok(true, 'the Top view runs');

  // ---- scenes (scenes-ui) ----
  await click('[data-scene-add]');
  await click('[data-view="front"]');
  await page.waitForTimeout(300);
  await click('[data-scene-add]');
  await page.waitForTimeout(200);
  const nScenes = await mc(() => document.querySelectorAll('[data-scenes] li').length);
  ok(nScenes === 2, 'two scenes saved in the Scenes list', 'listed ' + nScenes);
  await page.evaluate(() => document.querySelector('[data-scenes] li:first-child .mc-scene-go')?.click());
  await page.waitForTimeout(900);
  ok(await mc(() => window.modelcraft.sceneIndex) === 0, 'going to the first scene sets it current');

  // ---- paint and lights (paint-lights-ui) ----
  const tool0 = await mc(() => window.modelcraft.tools.tool);
  await page.evaluate(() => document.querySelector('[data-palette] button, [data-palette] [role=option], [data-palette] [data-color]')?.click());
  await page.waitForTimeout(200);
  const paintTool = await mc(() => window.modelcraft.tools.tool !== null);
  await page.evaluate(() => document.querySelector('[data-light-add]')?.click());
  await page.waitForTimeout(200);
  const tool2 = await mc(() => window.modelcraft.tools.tool);
  ok(paintTool && tool2 !== tool0, 'a swatch and Add light pick their tools');
  await focusView();
  await page.keyboard.press('Escape');
  await page.keyboard.press('Space');
  await page.waitForTimeout(200);

  // ---- export (export-ui) and save (file-save-ui) ----
  const [stl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), click('[data-export="stl"]')]);
  const stlPath = path.join(OUT, 'export.stl'); await stl.saveAs(stlPath);
  ok(fs.statSync(stlPath).size > 84, 'Export › STL downloads a file', fs.statSync(stlPath).size + ' bytes');
  await focusView();
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.keyboard.press('Control+s')]);
  const saved = path.join(OUT, 'saved.modelcraft'); await dl.saveAs(saved);
  const j = JSON.parse(fs.readFileSync(saved, 'utf8'));
  ok(j.format === 'modelcraft' && j.scenes?.length === 2, 'Ctrl+S downloads the .modelcraft (format, two scenes)');

  // ---- open it again (file-open-ui) ----
  await page.evaluate(() => { window.modelcraft.model.dirty = false; });
  await page.setInputFiles('[data-file-open]', saved);
  await page.waitForTimeout(800);
  await closeDialogs();
  const back = await mc(() => ({ top: window.modelcraft.model.root.insts.size, scenes: document.querySelectorAll('[data-scenes] li').length, name: window.modelcraft.fileName }));
  ok(back.top === top0 && back.scenes === 2, 'the saved file opens again (groups, scenes)', JSON.stringify(back));

  // ---- the print check (print-check-ui) ----
  const m0 = await mc(() => window.modelcraft.ui.msg.textContent);
  await click('[data-export="print3d"]');
  await page.waitForFunction((m) => window.modelcraft.ui.msg.textContent !== m, m0, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  ok(await mc((m) => window.modelcraft.ui.msg.textContent !== m, m0), 'Check for 3D printing runs and reports', await mc(() => window.modelcraft.ui.msg.textContent.slice(0, 80)));
  await closeDialogs();

  // ---- the guided first model (guide-ui) ----
  await page.evaluate(() => window.modelcraft.guide.open());
  await page.waitForTimeout(300);
  const step = await mc(() => window.modelcraft.guide.step());
  await page.evaluate(() => window.modelcraft.guide.close());
  ok(step !== null && await mc(() => window.modelcraft.guide.step()) === null, 'the guided first model opens and closes', 'step ' + step);

  // ---- the Info panel's sections (info-ui renderInfo): nothing, one face, one edge, one placement, several ----
  await page.evaluate(() => { window.modelcraft.model.dirty = false; });
  await page.evaluate(() => document.querySelector('[data-hint-sample]')?.click());
  await page.waitForFunction(() => window.modelcraft.model.root.faces.size + window.modelcraft.model.root.insts.size > 2, null, { timeout: 30000 }).catch(() => {});
  await closeDialogs();
  const heads = {};
  for (const kind of ['none', 'f', 'e', 'i', 'many']) {
    await page.evaluate((k) => {
      const m = window.modelcraft.model, h = window.modelcraft.host;
      // faces and edges: inside the first placement whose definition has faces (the sample's are groups), as Edit group would open it
      const inner = [...m.root.insts].find(([, i]) => m.def(i.def)?.faces.size);
      h.path = (k === 'f' || k === 'e') && inner ? [inner[0]] : [];
      const pick = (map, t) => { const id = [...map.keys()][0]; return id === undefined ? [] : [{ t, id }]; };
      const d = h.path.length ? m.def(inner[1].def) : m.root;
      const sel = k === 'none' ? [] : k === 'f' ? pick(d.faces, 'f') : k === 'e' ? pick(d.edges, 'e') : k === 'i' ? pick(d.insts, 'i') : [...pick(d.faces, 'f'), ...pick(d.insts, 'i')];
      h.setSel(sel);
    }, kind);
    await page.waitForTimeout(450);
    heads[kind] = (await page.locator('[data-info-h]').innerText()).trim() + ' / ' + (await page.locator('[data-info]').innerText()).trim().length;
  }
  const hs = Object.values(heads).map((x) => x.split(' / ')[0]);
  ok(new Set(hs).size >= 4 && Object.values(heads).every((x) => +x.split(' / ')[1] > 0), 'the Info panel draws its own section for nothing / a face / an edge / a placement / several', JSON.stringify(heads));

  ok(problems.length === 0, 'no console or page errors', problems.slice(0, 3).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL threw: ' + e.message.split('\n')[0]);
  for (const p of problems.slice(0, 5)) console.log('       ' + p);
} finally {
  await browser.close();
  fs.rmSync(OUT, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

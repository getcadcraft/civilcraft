#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-large.mjs — 0.7 D7.51 in the page: the 750-feature part (testfiles/generated/partcraft/features-750.partcraft.json, made
 * once by gen-750.mjs) opens, rebuilds, edits, undoes, saves and reopens; the history and the Parameters window stay quick. Mesh
 * kernel (the 0.4+ default). Prints what each step took, with the machine load beside it — VPS, headless, SwiftShader: never copy.
 *   node tools/partcraft-test/browser-large.mjs [--state <file>] [--out <dir>]
 */
import fs from 'node:fs';
import { startHarness, cliArgs } from './browser-harness.mjs';
import { OUT as FILE } from './gen-750.mjs';

const { state, out } = cliArgs();
if (!fs.existsSync(FILE)) { console.log('skip: ' + FILE + ' is missing (node tools/partcraft-test/gen-750.mjs)'); process.exit(0); }
const h = await startHarness({ state, out, exact: false });
const { ok, page } = h;
const text = fs.readFileSync(FILE, 'utf8');
const load = () => fs.readFileSync('/proc/loadavg', 'utf8').split(' ').slice(0, 3).join(' ');
const nums = {};
const note = (k, v) => { nums[k] = typeof v === 'number' ? +v.toFixed(1) : v; };

try {
  console.log('\n== 750 features in the page (0.7 D7.51)');
  const open = await page.evaluate(async (t) => {
    const pc = window.partcraft, t0 = performance.now();
    await pc.openText(t, 'features-750.partcraft.json');
    await pc.built();
    return { ms: performance.now() - t0, n: pc.part.features.length, vol: pc.regen.stats?.volume, tris: pc.regen.stats?.tris, bad: [...pc.regen.results.values()].filter((r) => r.status === 'error' || r.status === 'skipped').length };
  }, text);
  note('open_and_build_ms', open.ms);
  ok(open.n === 750 && open.bad === 0 && Math.abs(open.vol - 3212412.9) < 1, `opens and builds: 750 features, none failing, ${open.vol.toFixed(1)} mm³, ${open.tris} triangles`);

  const rows = await page.evaluate(() => document.querySelectorAll('[data-tree] .pc-node, .pc-tree .pc-node').length);
  note('tree_rows', rows);
  ok(rows >= 750, `the history lists every feature (${rows} rows)`);

  // select a feature (renders the tree, the properties and the view's highlight)
  const sel = await page.evaluate(async () => {
    const pc = window.partcraft, ids = pc.part.features.map((f) => f.id), ms = [];
    for (const k of [10, 200, 400, 600, 740]) { const t0 = performance.now(); pc.selectFeature(ids[k]); ms.push(performance.now() - t0); }
    return ms;
  });
  note('select_feature_ms', sel.reduce((a, b) => a + b, 0) / sel.length);

  // an edit: the last extrude 2 mm deeper (rebuild from a checkpoint), then undo, redo
  const ed = await page.evaluate(async () => {
    const pc = window.partcraft, ex = pc.part.features.filter((f) => f.type === 'extrude'), last = ex[ex.length - 1], d0 = last.depth;
    const time = async (fn) => { const t0 = performance.now(); await fn(); await pc.built(); return performance.now() - t0; };
    const edit = await time(() => pc.commit('Deeper', () => { last.depth = d0 + 2; }));
    const v1 = pc.regen.stats.volume;
    const undo = await time(() => pc.undoRedo(true));
    const v2 = pc.regen.stats.volume;
    const redo = await time(() => pc.undoRedo(false));
    const first = pc.part.features.filter((f) => f.type === 'extrude')[0];
    const plate = await time(() => pc.commit('Thicker plate', () => { first.depth += 1; }));   // every later feature changes: no checkpoint helps
    const snap = pc.hist.undoStack.reduce((a, s) => a + s.json.length, 0);
    return { edit, undo, redo, plate, v1, v2, v3: pc.regen.stats.volume, steps: pc.hist.undoStack.length, snapMB: snap / 1e6 };
  });
  for (const k of ['edit', 'undo', 'redo', 'plate']) note(k + '_ms', ed[k]);
  note('history_steps', ed.steps); note('history_MB', ed.snapMB);
  ok(ed.v1 > ed.v2 + 100 && Math.abs(ed.v2 - open.vol) < 1e-3, `an edit changes the volume (${ed.v1.toFixed(1)}), undo brings the first one back (${ed.v2.toFixed(1)})`);

  // the Parameters window with 558 equations
  const params = await page.evaluate(async () => {
    const pc = window.partcraft;
    const PPm = await import(new URL(performance.getEntriesByType('resource').map((e) => e.name).find((n) => /\/params-part\.js/.test(n)) || '/assets/apps/partcraft/dev/params-part.js', location.href).href);
    const t = PPm.partAdapter.targets(pc.part);
    pc.commit('Parameters', () => {
      const p = PPm.paramsOf(pc.part);
      for (const [n, v] of [['boss_h', '8'], ['hole_d', '4'], ['pocket', '3'], ['plate_t', '10']]) p.vars.push({ name: n, expr: v, note: '' });
      for (const key of t.keys()) if (/\.depth$/.test(key) || /\.d$/.test(key)) p.links.push({ target: key, expr: /\.d$/.test(key) ? 'hole_d' : 'boss_h' });
    });
    await pc.built();
    pc.paramsUI.showTab('params');
    const r = [];
    for (let i = 0; i < 5; i++) { const t0 = performance.now(); pc.paramsUI.render(); r.push(performance.now() - t0); }
    return { links: pc.part.params.links.length, ms: r, rows: document.querySelectorAll('.pc-peq').length };
  });
  note('params_equations', params.links); note('params_render_ms', Math.max(...params.ms));
  ok(params.rows === params.links && params.links > 500, `the Parameters window lists ${params.rows} equations`);

  // jank while the history scrolls
  const jank = await page.evaluate(() => new Promise((res) => {
    const box = [...document.querySelectorAll('.pc-node')][0]?.closest('[class*="tree"], ul, div');
    let el = box;
    while (el && el.scrollHeight <= el.clientHeight + 10) el = el.parentElement;
    if (!el) { res(null); return; }
    const gaps = []; let last = performance.now(), n = 0;
    const step = () => { const now = performance.now(); gaps.push(now - last); last = now; el.scrollTop = (n++ * 97) % (el.scrollHeight - el.clientHeight); if (n < 90) requestAnimationFrame(step); else res({ max: Math.max(...gaps), mean: gaps.reduce((a, b) => a + b, 0) / gaps.length }); };
    requestAnimationFrame(step);
  }));
  if (jank) { note('scroll_max_frame_ms', jank.max); note('scroll_mean_frame_ms', jank.mean); }

  // save and reopen
  const sv = await page.evaluate(async () => {
    const pc = window.partcraft, t0 = performance.now();
    const txt = pc.P.toJSON(pc.part), ms = performance.now() - t0;
    const n = pc.part.features.length, vol = pc.regen.stats.volume;
    const t1 = performance.now();
    await pc.openText(txt, 'again.partcraft.json'); await pc.built();
    return { save: ms, kb: txt.length / 1024, reopen: performance.now() - t1, n: pc.part.features.length === n, same: Math.abs(pc.regen.stats.volume - vol) < 1e-6 };
  });
  note('save_ms', sv.save); note('file_KB', sv.kb); note('reopen_ms', sv.reopen);
  ok(sv.n && sv.same, 'save and reopen: the same 750 features and the same solid');

  ok(h.problems.length === 0, 'no console or page errors' + (h.problems.length ? ': ' + h.problems.slice(0, 3).join(' | ') : ''));
  console.log('\n' + JSON.stringify(nums, null, 1));
  console.log('load average at the end: ' + load() + ' (VPS, headless, SwiftShader: not for copy)');
  await h.finish();
} catch (err) { await h.failed(err); await h.browser.close(); process.exit(1); }

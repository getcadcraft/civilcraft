#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools/detailcraft-test/browser-perf-10.mjs (0.10 PERF.36 / FX.144): DetailCraft in headless Chromium (software GL) on one generated model, in /use (0.9, the "before")
 * or /lab (the build in dev/, the "after"): open to quiet, the scene (objects, draw calls), a pick, one connection edit to the next frame and until the page is quiet again
 * (constructability runs 400 ms after every edit), undo. Every number is printed with the load average beside it. The lab sign-in is the test admin of admin.php (run as root).
 *   node tools/detailcraft-test/browser-perf-10.mjs --area lab|use --file grid10x6x4 [--cap 300] [--json out.json] [--shot out.png] [--unbatched]
 * --unbatched (lab only) sets view.batchParts = false and rebuilds the scene: the per-part Mesh path, for a picture and a draw-call count next to the batched one.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, waitQuiet, longTasks, ltCount, heap, requestTracker, loadavg, ms, mb } from '../perf/apps3d-lib.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const area = arg('--area', 'lab'), name = arg('--file', 'grid10x6x4'), cap = Number(arg('--cap', 300)) * 1000;
const file = `/var/www/CADCRAFT/testfiles/generated/detail/${name}.detailcraft.json`;
const R = { area, file: name, bytes: fs.statSync(file).size, load_start: loadavg() };

const adminPhp = path.join(REPO, 'tools/detailcraft-test/admin.php');
const admin = area === 'lab' ? JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' })) : null;
const browser = await launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, acceptDownloads: true });
  await ctx.addInitScript(() => {
    window.__lt = [];
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch { /* no long-task API */ }
    window.showOpenFilePicker = undefined;
    try { localStorage.setItem('cc-autofocus', 'off'); } catch { /* none */ }
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });
  if (admin) {
    await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[name=email]', admin.email); await page.fill('input[name=password]', admin.password);
    await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded' }), page.click('form button[type=submit], form input[type=submit]')]);
  }
  await page.goto(`${BASE}/${area}/detailcraft`, { waitUntil: 'networkidle', timeout: 120000 });
  try { await page.waitForFunction(() => window.detailcraft?.view?.renderer, null, { timeout: 60000 }); }
  catch (e) { console.log('the app did not start: at ' + page.url() + '; page errors: ' + JSON.stringify(errors.slice(0, 4))); throw e; }
  await page.waitForTimeout(1500);
  const req = requestTracker(page);
  const heap0 = await heap(page), lt0 = await ltCount(page);
  req.reset();
  const t0 = Date.now();
  await page.setInputFiles('[data-file]', file);
  // "open" = the model is in and the page has been quiet for 2 s (the constructability run at open counts: it is part of the open in 0.9)
  const q = await waitQuiet(page, { t0, timeout: cap, requests: req, heap0, settle: 2000 });
  const lt = await longTasks(page, lt0);
  Object.assign(R, { open_ms: q.quiet, timed_out: q.timedOut, block_ms: lt.block, longest_ms: lt.longest, tasks: lt.tasks, heap_peak: q.peak, load_open: loadavg() });
  console.log(`${area} ${name}: open ${q.timedOut ? 'TIMED OUT after ' : ''}${ms(q.quiet)} | blocking ${ms(lt.block)} in ${lt.tasks} long tasks, longest ${ms(lt.longest)} | heap peak ${mb(q.peak)} | load ${R.load_open}`);

  if (process.argv.includes('--unbatched')) await page.evaluate(() => { const v = window.detailcraft.view; v.batchParts = false; v.setModel(v.state, v.built, v.marks); });
  const scene = () => page.evaluate(() => {
    const dc = window.detailcraft, v = dc.view; v.renderer.info.reset(); v.renderer.render(v.scene, v.camera);
    let objs = 0, batched = 0; v.scene.traverse((o) => { objs++; if (o.isBatchedMesh) batched++; });
    return { members: dc.model.state.members.length, parts: dc.built?.parts?.length, bolts: dc.built?.bolts?.length, objects: objs, batched, calls: v.renderer.info.render.calls, triangles: v.renderer.info.render.triangles };
  });
  R.scene = await scene();
  console.log(`scene: ${R.scene.members} members, ${R.scene.parts} parts, ${R.scene.objects} objects (${R.scene.batched} batched), ${R.scene.calls} draw calls, ${R.scene.triangles} triangles`);

  const shot = arg('--shot', null);
  if (shot) await page.screenshot({ path: shot });

  // a pick at the canvas centre and a window of 10 picks: the ref the ray found, and whether selecting it changes nothing else
  const pick = await page.evaluate(() => {
    const dc = window.detailcraft, v = dc.view, c = v.canvas, out = [];
    const l = { w: c.clientWidth, h: c.clientHeight };
    for (const [fx, fy] of [[0.5, 0.5], [0.45, 0.55], [0.55, 0.45], [0.4, 0.4], [0.6, 0.6]]) { const r = v.pickRef({ ...l, x: l.w * fx, y: l.h * fy }); out.push(r.ref ? r.ref.kind + ':' + r.ref.id : null); }
    return out;
  });
  R.pick = pick;
  console.log('picks (centre and four nearby):', pick.join(' '));

  // selection through the batches: a picked part is drawn by a mesh of its own (pick colour), stays pickable, and goes back into its batch when the selection is cleared
  R.selection = await page.evaluate(() => {
    const dc = window.detailcraft, v = dc.view, c = v.canvas, l = { w: c.clientWidth, h: c.clientHeight, x: c.clientWidth * 0.5, y: c.clientHeight * 0.5 };
    const calls = () => { v.renderer.info.reset(); v.renderer.render(v.scene, v.camera); return v.renderer.info.render.calls; };
    const first = v.pickRef(l).ref;
    if (!first) return { skipped: 'nothing under the centre pixel' };
    const before = calls();
    v.setSelection([first]);
    const sel = { refs: v.selMeshes?.length ?? 0, hidden: v.batchHidden?.length ?? 0, calls: calls(), again: v.pickRef(l).ref, material: v.selMeshes?.[0]?.material === v.mats.pick };
    v.setSelection([]);
    const after = { refs: v.selMeshes?.length ?? 0, hidden: v.batchHidden?.length ?? 0, calls: calls(), again: v.pickRef(l).ref };
    return { first, calls_before: before, selected: sel, cleared: after };
  });
  console.log('selection:', JSON.stringify(R.selection));

  // one edit: a connection's bolt rows + 1 (else a member's profile), to the next frame, and until the page is quiet again
  const ltE = await ltCount(page), tE = Date.now(), reqE = requestTracker(page); reqE.reset();
  const ed = await page.evaluate(async () => {
    const dc = window.detailcraft, M = dc.model, out = {};
    const c = M.state.connections.find((x) => x.type === 'endplate') || M.state.connections[0];
    const t0 = performance.now();
    try { M.change('Edit (perf)', (tx) => tx.updateConnection(c.id, { ...c.params, rows: (Number(c.params.rows) || 2) + 1 })); out.edit = 'connection ' + c.id; }
    catch (e) { const m = M.state.members.find((x) => x.type === 'beam'); M.change('Edit (perf)', (tx) => tx.updateMember(m.id, { profile: 'W16x31' })); out.edit = 'member ' + m.id + ' (' + String(e.message).slice(0, 40) + ')'; }
    const t1 = performance.now(); out.change_ms = +(t1 - t0).toFixed(0);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    out.to_frame_ms = +(performance.now() - t1).toFixed(0);
    return out;
  });
  const qe = await waitQuiet(page, { t0: tE, timeout: cap, requests: reqE, heap0: await heap(page), settle: 1500 });
  const lte = await longTasks(page, ltE);
  R.edit = { ...ed, quiet_ms: qe.quiet, timed_out: qe.timedOut, block_ms: lte.block, longest_ms: lte.longest, load: loadavg() };
  console.log(`edit (${ed.edit}): change() ${ms(ed.change_ms)}, to the next frame ${ms(ed.to_frame_ms)}, quiet again after ${qe.timedOut ? 'TIMED OUT ' : ''}${ms(qe.quiet)}, blocking ${ms(lte.block)} in ${lte.tasks} long tasks (longest ${ms(lte.longest)}) | load ${R.edit.load}`);
  R.undo = await page.evaluate(async () => { const t = performance.now(); window.detailcraft.model.undo(); const t1 = performance.now(); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return { undo_ms: +(t1 - t).toFixed(0), to_frame_ms: +(performance.now() - t1).toFixed(0) }; });
  console.log(`undo: ${ms(R.undo.undo_ms)}, to the next frame ${ms(R.undo.to_frame_ms)}`);
  R.errors = errors;
  if (errors.length) console.log('page errors:', errors.slice(0, 5));
  const out = arg('--json', null);
  if (out) fs.writeFileSync(out, JSON.stringify(R, null, 2));
} finally {
  await browser.close();
  if (admin) execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down'], { encoding: 'utf8' });
}

#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-cabinetcraft-cadcraft.mjs — CabinetCraft in the real /lab/cadcraft page (0.8 DC.117, session cabinetcraft_hosts). Run as root, alone, nice, with a timeout:
 *   nice timeout 600 node tools/addons-test/browser-cabinetcraft-cadcraft.mjs [--shots dir]
 * A closed polyline is drawn as the room; CabinetCraft is switched on in Settings › Add-ons; its section in the right panel; Room › Find rooms lists the polyline, Use this room; the example
 * cabinets are laid along the room; Draw the sheets draws the shop drawings as CAD entities on CC- layers (blocks, dimensions, hatches, tables), one undo step through CadCraft's own undo;
 * Redraw; the DXF CadCraft writes carries them; the cabinets on the 3D tab; the CCDRAW command from the command line; Erase. No console errors.
 */
import { start } from './cabinetcraft-lib.mjs';
const L = await start('cadcraft', 'browser-cabinetcraft-cadcraft');
const { ok, page } = L;
try {
  await L.open(() => !!window.cadcraft && !!window.cadcraft.doc);
  const me0 = await L.entry();
  ok(me0 && me0.state === 'off' && me0.source === 'bundled' && me0.manifest.apps.includes('cadcraft'), 'CabinetCraft is bundled in CadCraft and starts off', me0 && { state: me0.state, source: me0.source });
  const how = await L.enable();
  ok((await L.entry()).state === 'active', 'switched on (' + how + ')');
  await L.showPanel();
  ok(await page.isVisible('[data-cabinetcraft]'), 'its section is in CadCraft\'s right panel');
  // a room: a closed polyline 5 m x 4 m (drawing units are millimetres in a new drawing)
  const u = await page.evaluate(() => String(window.cadcraft.doc.meta.units || ''));
  const k = await page.evaluate(() => { const d = window.cadcraft.doc, m = { '': 1, millimeters: 1, centimeters: 10, meters: 1000, inches: 25.4, feet: 304.8 }[String(d.meta.units || '')] ?? 1; return 1 / m; });
  const roomId = await page.evaluate((k) => { const d = window.cadcraft.doc; let id; d.change('room', () => { id = d.add({ type: 'poly', layer: '0', closed: true, pts: [[0, 0], [5000, 0], [5000, 4000], [0, 4000]].map(([x, y]) => ({ x: x * k, y: y * k })) }).id; }); window.cadcraft.host.setSelection(new Set([id])); return id; }, k);
  ok(roomId > 0, 'a closed polyline is drawn (units "' + u + '")');
  await L.tab('room');
  await L.click('[data-cc-hostroom-find]');
  await page.waitForSelector('[data-cc-hostroom-list]', { timeout: 20000 });
  ok(Number(await page.getAttribute('[data-cc-hostroom-list]', 'data-cc-hostroom-list')) === 1, 'Find rooms lists the polyline');
  await L.click('[data-cc-hostroom-use]');
  await L.waitSay(/taken from the model/);
  let job = await L.job();
  ok(job.room.shape === 'rect' && job.room.w === 5000 && job.room.d === 4000 && job.site.host === 'cad', 'Use this room: a 5000 x 4000 rectangle room');
  await L.tab('layout');
  await L.click('[data-cc-addrun]');
  await page.waitForSelector('[data-cc-add]', { timeout: 10000 });
  for (let i = 0; i < 4; i++) await L.click('[data-cc-add]');
  job = await L.job();
  const nCab = job.runs.reduce((s, r) => s + r.base.length + r.upper.length, 0);
  ok(nCab >= 4, 'cabinets in the run (' + nCab + ')');
  // what this app cannot do is said in Problems too: no G-code here, and the cabinets are made when asked
  const probs = await page.evaluate(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => /cabinetcraft/.test(p.source && p.source.name)).map((p) => p.text) : null));
  ok(probs === null || (probs.some((x) => /no G-code here/.test(x)) && probs.some((x) => /made from the job when you press the button/.test(x))), 'Problems says there is no G-code here and that the cabinets are made when asked' + (probs === null ? ' (this page has no Problems panel)' : ''), probs && probs.map((x) => x.slice(0, 40)));
  await L.tab('drawings');
  ok(await page.isVisible('[data-cc-host="cad-draw"]') && !(await page.$('[data-cc-3d]')), 'Drawings shows "Shop drawings in the drawing" and no PartCraft viewport box');
  const before = await page.evaluate(() => ({ n: window.cadcraft.doc.model.size, undo: window.cadcraft.doc.undoStack.length }));
  await L.click('[data-cc-host-action="cad-draw"]');
  await L.waitSay(/sheets drawn/, 60000);
  const after = await page.evaluate(() => {
    const d = window.cadcraft.doc, all = [...d.model.values()];
    const ours = all.filter((e) => /^CC-/.test(e.layer));
    return { n: d.model.size, undo: d.undoStack.length, layers: [...new Set(ours.map((e) => e.layer))].sort(), types: [...new Set(ours.map((e) => e.type))].sort(), blocks: [...d.blocks.keys()].filter((b) => /^CC-CAB-/.test(b)).length, dims: ours.filter((e) => e.type === 'dim').length, hatches: ours.filter((e) => e.type === 'hatch').length };
  });
  ok(after.undo === before.undo + 1, 'Draw the sheets is ONE undo step in CadCraft (' + (after.n - before.n) + ' entities)');
  ok(after.layers.length >= 7 && ['dim', 'hatch', 'insert', 'line', 'poly', 'text'].every((t) => after.types.includes(t)), 'on CC- layers: ' + after.layers.join(' ') + '; entity types ' + after.types.join(' '));
  ok(after.blocks >= 2 && after.dims >= 6 && after.hatches >= 2, 'cabinet blocks ' + after.blocks + ', real dimensions ' + after.dims + ', hatches ' + after.hatches);
  await page.evaluate(() => window.cadcraft.view?.zoomExtents?.());
  await L.shot('cad-01-sheets');
  // CadCraft's own Undo and Redo
  await page.evaluate(() => window.cadcraft.doc.undo());
  ok(await page.evaluate((n) => window.cadcraft.doc.model.size === n, before.n), 'CadCraft\'s Undo takes the whole drawing back');
  await page.evaluate(() => window.cadcraft.doc.redo());
  ok(await page.evaluate((n) => window.cadcraft.doc.model.size === n, after.n), 'Redo brings it again');
  // Redraw replaces
  await L.click('[data-cc-host-action="cad-draw"]');
  await page.waitForFunction((n) => window.cadcraft.doc.undoStack.length === n + 1, after.undo, { timeout: 30000 });
  ok(await page.evaluate((n) => window.cadcraft.doc.model.size === n, after.n), 'Redraw replaces the earlier drawing (same ' + after.n + ' entities)');
  // DXF written by CadCraft
  const dxf = await page.evaluate(async () => { const m = await import('/assets/apps/cadcraft/dev/dxf.js'); return m.writeDxf(window.cadcraft.doc).text; });
  ok(/CC-BASE/.test(dxf) && /CC-CAB-1/.test(dxf) && /CC-DIM/.test(dxf) && dxf.length > 50000, 'the DXF CadCraft writes carries the layers and the cabinet blocks (' + Math.round(dxf.length / 1024) + ' KB)');
  // 3D tab
  await L.click('[data-cc-host-action="cad-3d"]');
  await L.waitSay(/put on the 3D tab/);
  ok(await page.evaluate(() => window.cadcraft.doc.model3d.root.insts.size > 4), 'the cabinets are on the 3D tab (' + (await page.evaluate(() => window.cadcraft.doc.model3d.root.insts.size)) + ' groups)');
  await L.click('[data-cc-host-action="cad-3d-clear"]');
  // the command line: CCDRAW (the sheets were drawn above; take them out first so a new drawing is visible)
  await page.evaluate(() => { const d = window.cadcraft.doc; d.change('clear', () => { for (const e of [...d.model.values()]) if (/^CC-/.test(e.layer)) d.remove(e.id); }); });
  ok(await page.evaluate(() => ![...window.cadcraft.doc.model.values()].some((e) => /^CC-/.test(e.layer))), 'the sheets are cleared');
  await page.evaluate(() => window.cadcraft.engine.text('CCDRAW'));
  await page.waitForFunction(() => [...window.cadcraft.doc.model.values()].filter((e) => /^CC-/.test(e.layer)).length > 100, null, { timeout: 30000 });
  ok(true, 'CCDRAW typed on the command line draws the sheets again');
  // export view: no G-code
  await L.tab('export');
  ok(!!(await page.$('[data-cc-nogcode]')) && !(await page.$('[data-cc-gcode]')), 'Export says there is no G-code in this app and offers none');
  // erase
  await L.tab('drawings');
  await L.click('[data-cc-host-action="cad-draw"]');
  await L.waitSay(/sheets drawn/, 60000);
  await L.click('[data-cc-host-action="cad-erase"]');
  await L.waitSay(/entities erased/);
  ok(await page.evaluate((id) => [...window.cadcraft.doc.model.values()].every((e) => e.id === id || !/^CC-/.test(e.layer)), roomId), 'Erase removes the sheets and leaves the polyline');
} catch (e) { ok(false, 'the run broke: ' + (e && e.message || e)); await L.shot('cad-error').catch(() => {}); }
await L.finish();

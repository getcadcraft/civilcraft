#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-cabinetcraft-modelcraft.mjs — CabinetCraft in the real /lab/modelcraft page (0.8 DC.117, session cabinetcraft_hosts). Run as root, alone, nice, with a timeout:
 *   nice timeout 600 node tools/addons-test/browser-cabinetcraft-modelcraft.mjs [--shots dir]
 * A floor face is drawn and selected; CabinetCraft is switched on in Settings › Add-ons; its section in the right panel; Room › Find rooms lists the floor, Use this room; the example cabinets
 * are laid along the room; Place in the model puts them in as one tagged group of coloured faces (ONE undo step through ModelCraft's own history), Replace, OBJ and STL out through ModelCraft's
 * writers carry them, Undo / Redo, Remove. No console errors.
 */
import { start } from './cabinetcraft-lib.mjs';
const L = await start('modelcraft', 'browser-cabinetcraft-modelcraft');
const { ok, page } = L;
try {
  await L.open(() => !!window.modelcraft || !!document.querySelector('[data-modelcraft], canvas'));
  const me0 = await L.entry();
  ok(me0 && me0.state === 'off' && me0.source === 'bundled' && me0.manifest.apps.includes('modelcraft'), 'CabinetCraft is bundled in ModelCraft and starts off', me0 && { state: me0.state, source: me0.source });
  const how = await L.enable();
  ok((await L.entry()).state === 'active', 'switched on (' + how + ')');
  ok(await page.evaluate(() => !!window.ccAddonModel && typeof window.ccAddonModel.addBodies === 'function'), 'ModelCraft has put its model host where add-ons can reach it (read, addBodies, removeBodies, rooms)');
  await L.showPanel();
  ok(await page.isVisible('[data-cabinetcraft]'), 'its section is in ModelCraft\'s right panel');
  await L.shot('mod-01-panel');
  // a floor face in the model, selected (through the page's own model, as a drawn rectangle on the ground would be)
  const sel = await page.evaluate(async () => {
    const M = await import('/assets/apps/modelcraft/dev/model.js');
    const m = window.modelcraft && window.modelcraft.model;
    if (!m) return { err: 'no window.modelcraft.model' };
    m.change('floor', () => { M.addPolygon(m.root, [[0, 0, 0], [5, 0, 0], [5, 4, 0], [0, 4, 0]]); });
    const fid = [...m.root.faces.keys()][0];
    window.modelcraft.host?.setSel?.([{ t: 'f', id: fid }]);
    return { fid, sel: window.modelcraft.host?.sel };
  });
  ok(!sel.err && sel.fid, 'a 5 x 4 m floor face is in the model and selected', sel);
  await L.tab('room');
  await L.click('[data-cc-hostroom-find]');
  await page.waitForSelector('[data-cc-hostroom-list], [data-cc-hostroom-none]', { timeout: 20000 });
  ok(Number(await page.getAttribute('[data-cc-hostroom-list]', 'data-cc-hostroom-list').catch(() => 0)) === 1, 'Find rooms lists the selected floor face');
  await L.click('[data-cc-hostroom-use]');
  await L.waitSay(/taken from the model/);
  let job = await L.job();
  ok(job.room.shape === 'rect' && job.room.w === 5000 && job.room.d === 4000 && job.site.host === 'model', 'Use this room: a 5000 x 4000 rectangle');
  await L.tab('layout');
  await L.click('[data-cc-addrun]');
  await page.waitForSelector('[data-cc-add]', { timeout: 10000 });
  for (let i = 0; i < 4; i++) await L.click('[data-cc-add]');
  // what this app cannot do is said in Problems too: no G-code here, and the cabinets are made when asked
  const probs = await page.evaluate(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => /cabinetcraft/.test(p.source && p.source.name)).map((p) => p.text) : null));
  ok(probs === null || (probs.some((x) => /no G-code here/.test(x)) && probs.some((x) => /made from the job when you press the button/.test(x))), 'Problems says there is no G-code here and that the cabinets are made when asked' + (probs === null ? ' (this page has no Problems panel)' : ''), probs && probs.map((x) => x.slice(0, 40)));
  await L.tab('drawings');
  ok(await page.isVisible('[data-cc-host="model-place"]') && !(await page.$('[data-cc-3d]')), 'Drawings shows "Cabinets in the model" and no PartCraft viewport box');
  const count = () => page.evaluate(() => { const m = window.modelcraft.model; return { undo: m.undoStack.length, ours: [...m.root.insts.values()].filter((i) => i.tag === 'CabinetCraft / cabinets').length, faces: (() => { let n = 0; const walk = (d) => { n += d.faces.size; for (const i of d.insts.values()) { const c = m.defs.get(i.def); if (c) walk(c); } }; for (const i of m.root.insts.values()) if (i.tag === 'CabinetCraft / cabinets') walk(m.defs.get(i.def)); return n; })() }; });
  const c0 = await count();
  await L.click('[data-cc-host-action="model-place"]');
  await L.waitSay(/cabinets placed/, 60000);
  const c1 = await count();
  ok(c1.ours === 1 && c1.undo === c0.undo + 1 && c1.faces > 100, 'Place in the model: one tagged group, ONE undo step, ' + c1.faces + ' faces (' + (await L.say()).slice(0, 50) + ')');
  ok(/panel bodies/.test(await L.hostStatus('model-place')), 'the section counts them: ' + await L.hostStatus('model-place'));
  await L.shot('mod-02-placed');
  // replace
  await L.click('[data-cc-host-action="model-place"]');
  await page.waitForFunction((n) => window.modelcraft.model.undoStack.length === n + 1, c1.undo, { timeout: 30000 });
  const c2 = await count();
  ok(c2.ours === 1 && c2.faces === c1.faces, 'placing again replaces the group (still one, ' + c2.faces + ' faces)');
  // export through ModelCraft's writers
  const out = await page.evaluate(async () => {
    const IO = await import('/assets/apps/modelcraft/dev/io.js');
    const m = window.modelcraft.model;
    const obj = IO.exportOBJ(m), o = typeof obj === 'string' ? obj : (obj.obj || obj.text || '');
    const stl = IO.exportSTL(m);
    return { objFaces: (o.match(/^f /gm) || []).length, stl: stl.byteLength || stl.length };
  });
  ok(out.objFaces > 100 && out.stl > 5000, 'OBJ out has ' + out.objFaces + ' faces and STL ' + out.stl + ' bytes: the cabinets go out with the model');
  // ModelCraft's own Undo / Redo
  await page.evaluate(() => window.modelcraft.model.undo());
  ok((await count()).ours === 1, 'Undo goes back one step (the first placement stays)');
  await page.evaluate(() => { window.modelcraft.model.undo(); });
  ok((await count()).ours === 0, 'Undo again: the cabinets are gone');
  await page.evaluate(() => window.modelcraft.model.redo());
  ok((await count()).ours === 1, 'Redo puts them back');
  // remove from the panel
  await L.tab('drawings');
  await L.click('[data-cc-host-action="model-remove"]');
  await L.waitSay(/taken out/);
  ok((await count()).ours === 0, 'Remove from the model takes the group out');
  await L.tab('export');
  ok(!!(await page.$('[data-cc-nogcode]')) && !(await page.$('[data-cc-gcode]')), 'Export says there is no G-code in this app and offers none');
} catch (e) { ok(false, 'the run broke: ' + (e && e.message || e)); await L.shot('mod-error').catch(() => {}); }
await L.finish();

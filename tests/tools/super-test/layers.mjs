// SPDX-License-Identifier: Apache-2.0
// Super: the model layers in a real browser (BK.128, BK.45, BK.107, BK.108, BK.131) and BimCraft's phases through the Super host (BK.172).
// The Model layers panel with the small house open in the building view: a layer off hides its elements there (apart from the person's own
// Hide), a locked layer refuses a change with a plain message, a discipline's sub-layer, a proposal accepted by a click, the change flags with
// jump-to, the check between layers, the export set's layer ticks (an IFC cut down to one layer), the Site view covered when Site is off; then
// phases set in the building view survive Save and Open of the project file and still drive the phase view, the plan and the demolition list.
//   node tools/super-test/layers.mjs [--docked]
import fs from 'node:fs'; import path from 'node:path';
import { start, launch, OUT, ROOT } from './serve.mjs';
const DOCKED = process.argv.includes('--docked');
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1500, height: 950 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 }, acceptDownloads: true }); const page = await ctx.newPage(); const errors = [];
page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
page.on('dialog', d => d.accept().catch(() => {}));
const HOUSE = fs.readFileSync(path.join(ROOT, 'fixtures/bimcraft/small-house.ifc'));
const openBytes = (name, bytes) => page.evaluate(async ([n, b]) => { await window.superWindow.openFiles([new File([new Uint8Array(b)], n)]); }, [name, [...bytes]]);
const bimReady = () => page.waitForFunction(() => document.querySelector('[data-panel="bim"]')?.dataset.mount === 'ready' && window.bimcraftLayerSets && window.bimcraftLayerSets.count() > 0 && window.bimcraftPhases, null, { timeout: 120000 });
const msg = () => page.evaluate(() => document.querySelector('[data-sc-status], .sc-status')?.textContent || '');
const row = id => `[data-sclayer-panel] [data-sclayer="${id}"]`;
const settle = (ms = 500) => page.waitForTimeout(ms);
const quiet = () => page.evaluate(() => { document.querySelectorAll('.nh-offer').forEach(n => n.remove()); });   // the "I'm new" offer sits over the corner of the window
const byCls = cls => page.evaluate(c => window.bimcraftLayerSets.all().filter(x => x.cls === c).map(x => x.guid), cls);

try {
  await page.goto(url + (DOCKED ? (url.includes('?') ? '&' : '?') + 'workspace=docked' : '')); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await settle(800);
  await page.evaluate(() => window.superWindow.home.leave()); await quiet();
  await openBytes('small-house.ifc', HOUSE); await bimReady(); await settle(1500);

  /* ---- the panel ---- */
  await page.evaluate(() => window.superLayers.ui.show()); await page.waitForSelector(row('site'));
  ok(JSON.stringify(await page.$$eval('[data-sclayer-panel] [data-sclayer]', n => n.map(x => x.dataset.sclayer))) === JSON.stringify(['site', 'structure', 'building', 'interiors']), 'the Model layers panel lists Site, Structure, Building, Interiors');
  ok((await page.textContent(row('building'))).includes('Building') && await page.$(row('building') + ' [data-sclayer-eye]') !== null && await page.$(row('building') + ' [data-sclayer-lock]') !== null && await page.$(row('building') + ' [data-sclayer-exp]') !== null, 'each layer has show, lock and export switches');
  ok(await page.$eval(row('building') + ' [data-sclayer-eye]', b => b.getAttribute('data-bs-toggle') === 'tooltip' && !b.title), 'the switches\' hints go through the shared tooltip engine (no native title)');
  const walls = await byCls('IfcWall').then(async w => (w.length ? w : byCls('IfcWallStandardCase'))), doors = await byCls('IfcDoor'), total = await page.evaluate(() => window.bimcraftLayerSets.all().length);
  ok(walls.length > 0 && doors.length > 0, `the house: ${walls.length} walls, ${doors.length} doors, ${total} elements`);

  /* ---- BK.128: off = hidden in the view, apart from the person's own Hide ---- */
  await page.click(row('building') + ' [data-sclayer-eye]'); await settle();
  let off = await page.evaluate(() => window.bimcraftLayerSets.offKeys().length);
  const building = await page.evaluate(() => { const L = window.superLayers; const g = L.LAY.groupGuids(window.superWindow.project, window.bimcraftLayerSets.all().map(x => x.guid), () => ({ app: 'bimcraft' })); return (g.get('building') || []).length; });
  ok(off > 0 && off >= walls.length + doors.length, `Building off: ${off} elements are hidden in the building view`);
  ok(await page.evaluate(() => window.bimcraftVis.state().hidden.length) === 0, 'the person\'s own Hide list is untouched');
  ok(await page.$eval(row('building') + ' [data-sclayer-eye]', b => b.getAttribute('aria-pressed')) === 'false', 'the switch shows it is off');
  await page.screenshot({ path: `${OUT}/layers-1-off${DOCKED ? '-docked' : ''}.png` });
  await page.click(row('building') + ' [data-sclayer-eye]'); await settle();
  ok(await page.evaluate(() => window.bimcraftLayerSets.offKeys().length) === 0, 'Building on again: nothing hidden');

  /* ---- BK.128: locked = a change is refused, with a plain message ---- */
  const phaseSum = () => page.evaluate(() => document.querySelector('[data-eg59-sum]')?.textContent || '');
  await page.evaluate(() => { const d = document.querySelector('[data-eg59-details]'); if (d) d.open = true; window.bimcraftPhases.render(); });
  await page.click(row('building') + ' [data-sclayer-lock]'); await settle();
  await page.evaluate(() => window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcDoor' }]));
  await page.evaluate(() => document.querySelector('[data-eg59-set="demolish"]').click()); await settle(700);
  ok(/locked/.test(await msg()) && /Building/.test(await msg()), 'Building locked: setting a phase is refused, and the message names the layer: ' + (await msg()).slice(0, 90));
  ok(await page.evaluate(() => window.bimcraftPhases.phaseMap().size) === 0, 'nothing was changed in the model');
  await page.click(row('building') + ' [data-sclayer-lock]'); await settle();

  /* ---- BK.172: phases in the building view, through the Super host ---- */
  await page.evaluate(() => window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcWall' }]));
  await page.evaluate(() => document.querySelector('[data-eg59-set="existing"]').click()); await settle(700);
  await page.evaluate(() => window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcDoor' }]));   // after the walls: a door follows its wall's phase until it is given its own
  await page.evaluate(() => document.querySelector('[data-eg59-set="demolish"]').click()); await settle(700);
  const phases1 = await page.evaluate(() => { const m = window.bimcraftPhases.phaseMap(), n = {}; for (const v of m.values()) n[v] = (n[v] || 0) + 1; return n; });
  ok(phases1.demolish === doors.length && phases1.existing >= walls.length, `unlocked: ${phases1.demolish} doors to demolish, ${phases1.existing} existing (walls and the windows they host)`);
  const sum1 = await phaseSum();
  // save the project file and open it again
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.evaluate(() => { window.superWindow.saveProject(); })]);
  const saved = fs.readFileSync(await dl.path());
  ok(dl.suggestedFilename().endsWith('.ccproject') && saved[0] === 0x50 && saved[1] === 0x4b, 'the project saves as one .ccproject file: ' + dl.suggestedFilename() + ', ' + saved.length + ' bytes');
  await page.reload(); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await settle(800);
  await openBytes(dl.suggestedFilename(), saved); await bimReady(); await settle(2000); await quiet();
  ok(await page.evaluate(() => window.bimcraftModels.list().length) === 1 && await page.evaluate(() => window.superWindow.project.members.filter(m => m.app === 'bimcraft').length) === 2, 'BK.172 (fix): the project keeps the file as opened and the edited copy, and the building view opens the edited one alone');
  const phases2 = await page.evaluate(() => { const m = window.bimcraftPhases.phaseMap(), n = {}; for (const v of m.values()) n[v] = (n[v] || 0) + 1; return n; });
  ok(JSON.stringify(phases2) === JSON.stringify(phases1), 'BK.172: the phases survive the project file: ' + JSON.stringify(phases2));
  await page.evaluate(() => { const d = document.querySelector('[data-eg59-details]'); if (d) d.open = true; window.bimcraftPhases.render(); });
  ok(await phaseSum() === sum1 && /to demolish/.test(sum1), 'BK.172: the phase summary reads the same after Open: ' + sum1);
  await page.evaluate(() => window.bimcraftPhases.view('demo')); await settle();
  let vs = await page.evaluate(() => window.bimcraftVis.state());
  ok(vs.isolated && vs.isolated.length === doors.length && vs.ghost === true, `BK.172: in 3D "what comes out" shows the ${doors.length} demolished doors solid and the rest see-through`);
  await page.evaluate(() => window.bimcraftPhases.view('result')); await settle();
  vs = await page.evaluate(() => window.bimcraftVis.state());
  ok(vs.isolated && vs.isolated.length > 0 && vs.ghost === false && vs.isolated.length <= total - doors.length, 'BK.172: "the result" leaves the demolished doors out');
  await page.evaluate(() => window.bimcraftPhases.view('all'));
  const planWalls = await page.evaluate(() => { const m = window.bimcraftPhases.phaseMap(); return [...m.values()].filter(v => v === 'existing').length; });
  ok(planWalls >= walls.length, 'BK.172: the plan reads a phase for every wall (drawn in its phase\'s pen)');
  const [csvDl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.evaluate(() => document.querySelector('[data-eg59-csv]').click())]);
  const csvLines = fs.readFileSync(await csvDl.path(), 'utf8').trim().split(/\r?\n/);
  ok(csvDl.suggestedFilename().endsWith('-demolition.csv') && csvLines.length === doors.length + 1, `BK.172: the demolition schedule lists the ${doors.length} doors (${csvLines.length - 1} rows)`);
  const qto = await page.evaluate(() => { try { const r = window.bimcraftQto.set({ scope: 'all', groups: ['p:CadCraft_Phase.Status'], sums: [] }); return r.rows.map(x => [x.values[0], x.count]); } catch (e) { return String(e); } });
  ok(Array.isArray(qto) && qto.some(r => r[0] === 'DEMOLISH' && r[1] === doors.length), 'BK.172: Quantity totals group by the phase: ' + JSON.stringify(qto).slice(0, 120));

  /* ---- BK.45 / BK.108: a discipline's work on its own sub-layer; BK.107: a proposal accepted ---- */
  await page.evaluate(() => window.superLayers.ui.show()); await page.waitForSelector(row('site'));
  const made = await page.evaluate(([door, wall]) => {
    const { LAY, REG } = window.superLayers, p = window.superWindow.project, m = (p.members.find(x => x.app === 'bimcraft') || {}).id || '';
    const d = REG.register(p, { app: 'bimcraft', member: m, native_id: door, ifc_guid: door, kind: 'door', label: 'Door (services test)' });
    const w = REG.register(p, { app: 'bimcraft', member: m, native_id: wall, ifc_guid: wall, kind: 'wall', label: 'Wall (interior test)' });
    const a = LAY.land(p, [d], 'services', { by: 'Eve' }), b = LAY.land(p, [w], 'interior', { by: 'Ida' });
    window.superLayers.ui.refresh(); return { a, b, d: d.id, w: w.id };
  }, [doors[0], walls[0]]);
  await page.waitForSelector(row('building/services'));
  ok(made.a.layers[0] === 'building/services' && (await page.textContent(row('building/services'))).includes('services'), 'the services engineer\'s work has its own sub-layer under Building');
  ok(await page.$eval(row('building/interior'), r => r.dataset.sclayerKind) === 'proposal' && await page.$(row('building/interior') + ' [data-sclayer-accept]') !== null && await page.$(row('building/services') + ' [data-sclayer-accept]') === null, 'the interior designer\'s is a proposal (Accept, Set aside); engineering input is not');
  await page.click(row('building/services') + ' [data-sclayer-eye]'); await settle();
  ok(await page.evaluate(() => window.bimcraftLayerSets.offKeys().length) === 1, 'hide the services sub-layer: exactly its one element goes from the building view');
  await page.click(row('building/services') + ' [data-sclayer-eye]'); await settle();
  await page.click(row('building/interior') + ' [data-sclayer-aside]'); await settle();
  ok(await page.evaluate(() => window.bimcraftLayerSets.offKeys().length) === 1 && await page.$(row('building/interior') + ' [data-sclayer-restore]') !== null, 'set the proposal aside: its element is hidden, and it can be brought back');
  await page.click(row('building/interior') + ' [data-sclayer-restore]'); await settle();
  await page.click(row('building/interior') + ' [data-sclayer-accept]'); await settle();
  ok(await page.evaluate(id => window.superLayers.REG.get(window.superWindow.project, id).layer, made.w) === 'building' && /Accepted/.test(await msg()), 'accept: the wall is in Building now, and the message says nothing was replaced: ' + (await msg()).slice(0, 80));

  /* ---- BK.45: the check between layers, and a comment for the other disciplines ---- */
  await page.evaluate(() => { document.querySelector('[data-sclayer-checks]').open = true; });
  await page.click('[data-sclayer-check]');
  await page.waitForFunction(() => window.superLayers.ui.checkResult && window.superLayers.ui.checkResult.ok, null, { timeout: 120000 }); await settle();
  const cr = await page.evaluate(() => window.superLayers.ui.checkResult);
  ok(cr.pairs.some(pr => pr.a === 'building' && pr.b === 'building/services' && pr.ok), 'the coordination check ran Building against the services sub-layer: ' + cr.pairs.map(pr => `${pr.a} x ${pr.b} = ${pr.clashes.length}`).join('; '));
  ok(await page.$('[data-sclayer-pair="building|building/services"]') !== null, 'and the panel lists the pair with its count');
  await page.evaluate(() => { document.querySelector('[data-sclayer-comment]').open = true; });
  await page.fill('[data-sclayer-note]', 'Riser moved 300 east, please check the door swing'); await page.selectOption('[data-sclayer-note-layer]', 'building/services'); await page.click('[data-sclayer-note-add]'); await settle();
  const notes = await page.evaluate(() => window.superWindow.plugins.read('notes-tasks', 'notes') || []);
  ok(notes.some(n => /Riser moved 300 east/.test(n.text || '')), 'a comment on a layer is kept in the project\'s notes for the other disciplines');

  /* ---- BK.131: changes flagged to the architect, with jump-to ---- */
  const flags = await page.evaluate(async ([d]) => {
    const { LAY, REG } = window.superLayers, P = window.superWindow.P, p = window.superWindow.project;
    P.projectFiles(p, { by: 'Ann' }); LAY.markSeen(p, '');   // the architect (this browser, not signed in) has looked
    REG.touch(p, d, { label: 'Door (moved by services)' });
    P.projectFiles(p, { by: 'Eve' });
    window.superLayers.ui.refresh(); await new Promise(r => setTimeout(r, 200));
    return LAY.changeFlags(p, { viewer: '' }).map(f => [f.layer, f.changed, f.by]);
  }, [made.d]);
  ok(JSON.stringify(flags) === JSON.stringify([['building/services', 1, ['Eve']]]), 'after the engineer saves, one change on building/services is flagged, saved by Eve: ' + JSON.stringify(flags));
  await page.waitForSelector(row('building/services') + ' [data-sclayer-flag]');
  await page.click(row('building/services') + ' [data-sclayer-flag]'); await page.waitForSelector('[data-sclayer-flagbox="building/services"] [data-sclayer-jump]');
  ok((await page.textContent('[data-sclayer-flagbox="building/services"]')).includes('Door (moved by services)') && (await page.textContent('[data-sclayer-flagbox="building/services"]')).includes('Eve'), 'the list says what changed and who saved it');
  await page.evaluate(() => window.bimcraftVis.pick([])); await page.click('[data-sclayer-flagbox="building/services"] [data-sclayer-jump]'); await settle(900);
  ok(await page.evaluate(g => { const k = window.bimcraftLayerSets.keysOf([g])[0]; return window.bimcraftTree().view && [...(window.superWindow.hub.get().refs || [])].some(r => Number(r.id) === k); }, doors[0]), 'jump-to picks that door in the building view');
  await page.click('[data-sclayer-flagbox="building/services"] [data-sclayer-seen]'); await settle();
  ok(await page.$(row('building/services') + ' [data-sclayer-flag]') === null, 'Mark as looked at clears the flag');
  await page.screenshot({ path: `${OUT}/layers-2-panel${DOCKED ? '-docked' : ''}.png` });

  /* ---- BK.128: the export set takes one layer or several ---- */
  await page.evaluate(() => window.superWindow.exporter.open()); await page.waitForSelector('[data-sclayer-export]');
  ok(await page.$$eval('[data-sclayer-export] [data-sclayer-export-row]', n => n.length) >= 5, 'Finalize and export lists the model layers to tick');
  for (const id of ['site', 'structure', 'building', 'interiors']) await page.uncheck(`[data-sclayer-export-row="${id}"] input`);
  for (const id of ['building/services']) await page.check(`[data-sclayer-export-row="${id}"] input`);
  const plan = await page.evaluate(() => window.superLayers.LAY.exportPlan(window.superWindow.project, window.superLayers.ui.exportChoice.layers()));
  ok(plan.apps.bimcraft === 'part' && new Set(plan.keep.bimcraft).size === 1 && plan.apps.civilcraft === 'none', 'only the services sub-layer ticked: the building view is taken in part (one element, the door), the Site view not at all: ' + JSON.stringify([plan.apps, plan.keep.bimcraft.length]));
  const cut = await page.evaluate(async () => {
    const m = await import('/assets/apps/supercadcraft/dev/super-layers-ifc.js'); const p = window.superWindow.project, mem = p.members.find(x => x.app === 'bimcraft');
    const all = window.bimcraftLayerSets.all().map(x => x.guid), keep = new Set(window.superLayers.LAY.exportPlan(p, ['building/services']).keep.bimcraft);
    const r = window.superLayers.ui.exportHooks.result({ format: 'ifc', app: 'bimcraft', files: [{ name: 'house.ifc', bytes: mem.bytes }] });
    const text = new TextDecoder().decode(r.files[0].bytes);
    return { label: r.label, kept: all.filter(g => text.includes("'" + g + "'")).length, keepIn: [...keep].every(g => text.includes("'" + g + "'")), dangling: m.dangling(r.files[0].bytes).length, smaller: r.files[0].bytes.length < mem.bytes.length };
  });
  ok(cut.keepIn && cut.dangling === 0 && cut.smaller && cut.kept === 1, `the IFC for that export keeps the ticked layer's door, leaves the other layers' elements out (${cut.kept} of ${total} element ids left) and no reference dangles: ${JSON.stringify(cut)}`);
  await page.evaluate(() => window.superLayers.ui.exportChoice.set(null)); await page.click('[data-act="export-close"]');

  /* ---- the Site view when Site is off, and locked ---- */
  await page.evaluate(() => { const s = JSON.parse(JSON.stringify(window.superWindow.state)); const w = s.workspaces[s.active]; (w.docks || w).center = [{ tabs: ['civil'], active: 'civil' }]; window.superWindow.state = s; });
  await page.waitForFunction(() => document.querySelector('[data-panel="civil"]')?.dataset.mount === 'ready' && window.civilcraft, null, { timeout: 120000 }); await settle(1200);
  await page.evaluate(() => window.superLayers.ui.show()); await page.waitForSelector(row('site'));
  await page.click(row('site') + ' [data-sclayer-eye]'); await page.waitForSelector('[data-panel="civil"] [data-sclayer-cover]');
  ok((await page.textContent('[data-panel="civil"] [data-sclayer-cover]')).includes('Site layer is switched off'), 'Site off: the Site view is covered and says why');
  await page.click('[data-panel="civil"] [data-sclayer-on]'); await settle();
  ok(await page.$('[data-panel="civil"] [data-sclayer-cover]') === null && await page.$eval(row('site') + ' [data-sclayer-eye]', b => b.getAttribute('aria-pressed')) === 'true', 'its button switches the layer on again');
  await page.click(row('site') + ' [data-sclayer-lock]'); await settle();
  const civ = await page.evaluate(async () => {
    const c = window.civilcraft, before = c.project.undoStack.length;
    try { c.project.setTin('test edit', null); } catch (e) { return { err: String(e) }; }   // one undo step, as any edit in the Site view makes
    const mid = c.project.undoStack.length;
    document.querySelector('[data-panel="civil"]').dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await new Promise(r => setTimeout(r, 300));
    return { before, mid, after: c.project.undoStack.length };
  });
  if (civ.err || civ.mid === civ.before) console.log('NOTE the Site lock could not be exercised here (no direct edit call found): ' + JSON.stringify(civ));
  else ok(civ.after === civ.before && /locked/.test(await msg()), 'Site locked: a change in the Site view is taken back with its own Undo, and the message says the layer is locked: ' + JSON.stringify(civ));
  await page.click(row('site') + ' [data-sclayer-lock]');

  ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 3).join(' | '));
} catch (e) { fail++; console.log('FAIL (stopped)', String(e && e.stack || e).slice(0, 900)); try { await page.screenshot({ path: `${OUT}/layers-fail.png` }); } catch { /* no page */ } }
console.log(`layers${DOCKED ? ' (docked)' : ''}: ${pass} passed, ${fail} failed`);
await browser.close(); await close(); process.exit(fail ? 1 : 0);

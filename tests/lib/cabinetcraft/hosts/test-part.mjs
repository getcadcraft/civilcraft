/* SPDX-License-Identifier: Apache-2.0 */
// The add-on through PartCraft's own loader (partcraft-api.js, addons.js): switched on, its tab, a job edited through the panel,
// the checks, the cost, the nest, the G-code, the downloads, switched off. The DOM is a small stand-in (test/fake-dom.mjs).
const { ok, section, mine, app, ADDON, APP, EN } = globalThis.__ccTest;
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { makeDocument } from './fake-dom.mjs';

const doc = makeDocument();
globalThis.document = doc;
const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m }; };
const store = mem();
const problemsSeen = [];
globalThis.window = { ccProblems: { source: (def) => ({ set: (list) => { problemsSeen.push(list); return {}; }, dispose: () => { problemsSeen.disposed = true; }, def }) }, localStorage: store, addEventListener() {} };
const i18n = await app('i18n.js');
i18n.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const P = await app('part.js');
const A = await app('addons.js');
const PA = await app('addons/partcraft-api.js');

const part = P.newPart('Test');
let status = '';
const host = { get part() { return part; }, regen: { mesh: null }, commit: (l, fn) => fn(), status: (s) => { status = s; }, renderAll() {} };
const root = doc.createElement('div'), list = doc.createElement('div');
list.setAttribute('data-right-tabs', '');
root.append(list); doc.body.append(root);
const addonsDir = path.join(APP, 'addons');
const started = await PA.startAddons({
  host, selection: () => null, select() {}, find: (sel) => (sel.includes('data-right-tabs') ? list : null), showTab() {},
  base: pathToFileURL(addonsDir + '/').href, importer: (u) => import(u), storage: store, verify: async () => false, bundledOnly: false, noGlobal: true, packages: A.packageStore(null),
  fetchJson: async (u) => { try { return JSON.parse(fs.readFileSync(fileURLToPath(u), 'utf8')); } catch { return null; } },
});

section('Loader: bundled, off, switched on');
{
  const row = started.list().find((a) => a.id === 'cabinetcraft');
  ok(row && row.state !== 'active' && row.state !== 'failed', 'bundled and off until switched on', JSON.stringify(row));
  ok(started.panelTabs().length === 0, 'no tab while it is off');
  await started.loader.setEnabled('cabinetcraft', true);
  const on = started.list().find((a) => a.id === 'cabinetcraft');
  ok(on.state === 'active', 'active after the switch', JSON.stringify(on));
  ok(started.panelTabs().length === 1 && started.panelTabs()[0].title === 'CabinetCraft', 'its tab is "CabinetCraft"');
  ok(started.exporters().map((e) => e.id).sort().join() === 'cabinetcraft:cutlist,cabinetcraft:drawings,cabinetcraft:estimate,cabinetcraft:job', 'four exporters', started.exporters().map((e) => e.id).join());
  ok(started.commandList().map((c) => c.name).sort().join() === 'cab3d,cab3d-clear,check,nest,sample', 'five commands: check, nest, sample, cab3d, cab3d-clear');
  ok(problemsSeen.length >= 1, 'a source of Problems was opened and given the first result');
}

const paneEl = () => root.children.find((c) => c.tag === 'SECTION');
let pane = paneEl();
ok(pane && pane.hidden, 'the tab\'s pane exists, hidden until shown');
pane.fire('cc-tab-shown');
const q = (sel) => pane.querySelector(sel);
const qa = (sel) => pane.querySelectorAll(sel);
const settle = () => new Promise((r) => setTimeout(r, 120));

section('Panel: job, layout');
{
  ok(q('[data-cabinetcraft]') && qa('[data-cc-view]').length === 8, 'the panel shows eight views');
  ok(q('[data-cc-view="layout"]').attrs.get('aria-selected') === 'true', 'it opens on Layout');
  ok(qa('[data-cc-run]').length === 1, 'a new job has one empty run');
  q('[data-cc-view="job"]').click();
  ok(q('[data-cc-sample]'), 'the Job view has Example kitchen');
  q('[data-cc-sample]').click();
  ok(store.m.get('cc-addon:partcraft:cabinetcraft:job') && JSON.parse(store.m.get('cc-addon:partcraft:cabinetcraft:job')).runs.length === 2, 'the job is kept in this browser (2 runs after the example)');
  q('[data-cc-view="layout"]').click();
  ok(qa('[data-cc-run]').length === 2 && qa('[data-cc-items="base"] [data-cc-item]').length === 5, 'Layout: runs A and B, five floor items in A');
  const status0 = q('[data-cc-status="base"]').textContent;
  ok(/Used 3600 of 3600 mm; 0 mm left/.test(status0), 'the status line says the run is full', status0);
  // add a cabinet to run B's floor row through the controls
  q('[data-cc-run="B"]').click();
  const tpl = q('[data-cc-tpl="base"]');
  tpl.value = 'base-pair'; tpl.fire('change');
  const w = q('[data-cc-addw="base"]'); w.value = '900'; w.fire('change');
  q('[data-cc-add="base"]').click();
  ok(qa('[data-cc-items="base"] [data-cc-item]').length === 3, 'one cabinet added to run B (three floor items)');
  ok(/Used 1968 of 3000 mm; 1032 mm left/.test(q('[data-cc-status="base"]').textContent), 'status after: 450 + 600 + 900 and an 18 mm end panel = 1968: ' + q('[data-cc-status="base"]').textContent);
  // the width box changes the cabinet
  const wi = qa('[data-cc-items="base"] [data-cc-item] input')[0];
  wi.value = '500'; wi.fire('change');
  ok(/Used 2018 of 3000 mm; 982 mm left/.test(q('[data-cc-status="base"]').textContent), 'a new width for the first cabinet changes the sum: ' + q('[data-cc-status="base"]').textContent);
  // the gear opens the editor
  qa('[data-cc-items="base"] [data-cc-item] button').find((b) => b.textContent === '⚙').click();
  ok(q('[data-cc-editor]'), 'the gear opens the cabinet\'s own fields');
  q('[data-cc-view="job"]').click(); q('[data-cc-view="layout"]').click();
}

section('Panel: checks, cost, materials');
{
  q('[data-cc-view="checks"]').click();
  ok(q('[data-cc-problems]') && qa('[data-cc-problem]').length >= 1, 'Checks lists the problems');
  ok(problemsSeen.at(-1).some((x) => x.code === 'est.placeholder') && problemsSeen.at(-1).every((x) => x.text), 'the same list went to the shared Problems with its words');
  q('[data-cc-view="cost"]').click();
  ok(/PLACEHOLDER/.test(q('[data-cc-placeholder]').textContent), 'Cost says in capitals that every rate is a placeholder');
  const total0 = q('[data-cc-total]').textContent;
  const rate = q('[data-cc-rate="labour.perHour"]');
  rate.value = '60'; rate.fire('change');
  ok(q('[data-cc-total]').textContent !== total0 && !/Every rate/.test(q('[data-cc-placeholder]').textContent) && /lines still use a placeholder/.test(q('[data-cc-placeholder]').textContent), 'one rate of the shop\'s own: the total moves and the banner counts what is left: ' + q('[data-cc-placeholder]').textContent);
  q('[data-cc-rates-reset]').click();
  ok(/PLACEHOLDER/.test(q('[data-cc-placeholder]').textContent), 'Back to the placeholders restores the banner');
  q('[data-cc-view="materials"]').click();
  const pick = q('[data-cc-pick="fronts"]'); pick.value = 'laminate-19'; pick.fire('change');
  ok(JSON.parse(store.m.get('cc-addon:partcraft:cabinetcraft:job')).picks.fronts === 'laminate-19', 'a material pick is kept');
  const bad = q('[data-cc-pick="carcass"]'); bad.value = 'hdf-8'; bad.fire('change');
  ok(JSON.parse(store.m.get('cc-addon:partcraft:cabinetcraft:job')).picks.carcass === 'melamine-18', 'a board for the wrong role is refused');
  const rule = q('[data-cc-rule="kickH"]'); rule.value = '100'; rule.fire('change');
  ok(JSON.parse(store.m.get('cc-addon:partcraft:cabinetcraft:job')).rules.kickH === 100, 'a shop number is kept');
}

section('Panel: drawings, export, nest, G-code');
{
  q('[data-cc-view="drawings"]').click();
  ok(q('[data-cc-drawing]').innerHTML.startsWith('<svg') && /\bplan\b|Plan/.test(qa('[data-cc-draw-pick] option').map((o) => o.textContent).join()), 'Drawings: the plan is shown as SVG; the list has Plan');
  const pickD = q('[data-cc-draw-pick]'); pickD.value = 'iso'; pickD.fire('change');
  ok(q('[data-cc-drawing]').attrs.get('data-cc-drawing') === 'iso' && q('[data-cc-drawing]').innerHTML.includes('<polygon'), 'the 3D view');
  const v0 = q('[data-cc-drawing]').innerHTML;
  qa('button').find((b) => b.attrs.get('aria-label') === 'Turn the view right').click();
  ok(q('[data-cc-drawing]').innerHTML !== v0, 'turning the view changes the drawing');
  doc.downloads.length = 0;
  q('[data-cc-save-svg]').click();
  ok(doc.downloads.length === 1 && doc.downloads[0].name === 'iso.svg', 'Save this drawing downloads iso.svg');
  q('[data-cc-save-set]').click();
  ok(doc.downloads.at(-1).name.endsWith('-drawings.html'), 'Save all downloads the printable set');
  q('[data-cc-view="export"]').click();
  ok(q('[data-cc-exp="dxf"]').attrs.has('disabled') && q('[data-cc-gcode]').attrs.has('disabled'), 'the DXF and the G-code wait for a nest');
  for (const k of ['cutlist', 'drill', 'hardware', 'estimate', 'labels']) q('[data-cc-exp="' + k + '"]').click();
  ok(doc.downloads.slice(-5).map((d) => d.name.replace(/^.*-/, '')).join() === 'cutlist.csv,drilling.csv,hardware.csv,estimate.csv,labels.html', 'five downloads: cut list, drilling, hardware, estimate, labels', doc.downloads.map((d) => d.name).join());
  q('[data-cc-nest]').click();
  let tries = 0; while (!q('[data-cc-nested]') && tries++ < 400) await settle();
  ok(q('[data-cc-nested]') && /sheets; 0 parts did not fit/.test(q('[data-cc-nested]').textContent), 'the nest ran: ' + (q('[data-cc-nested]') ? q('[data-cc-nested]').textContent.slice(0, 80) : 'no result'));
  ok(!q('[data-cc-exp="dxf"]').attrs.has('disabled') && !q('[data-cc-gcode]').attrs.has('disabled'), 'after it the DXF and the G-code are open');
  q('[data-cc-exp="dxf"]').click();
  ok(doc.downloads.at(-1).name.endsWith('-sheets.dxf'), 'the nested DXF downloads');
  q('[data-cc-gcode]').click();
  tries = 0; while (!qa('[data-cc-gfile]').length && tries++ < 400) await settle();
  ok(qa('[data-cc-gfile]').length > 5, 'G-code files listed, one per sheet: ' + qa('[data-cc-gfile]').length);
  qa('[data-cc-gfile]')[0].click();
  ok(/\.nc$|\.gcode$|\.ngc$|\.tap$|\.cnc$|\.[a-z]{2,4}$/.test(doc.downloads.at(-1).name), 'a program downloads: ' + doc.downloads.at(-1).name);
  q('[data-cc-view="cost"]').click();
  ok(/Sheets counted from the nest/.test(pane.textContent), 'Cost now counts the sheets from the nest');
  // an edit that changes the parts makes the nest stale
  q('[data-cc-view="layout"]').click();
  qa('[data-cc-items="base"] [data-cc-item] button').find((b) => b.textContent === '✕').click();
  q('[data-cc-view="export"]').click();
  ok(!q('[data-cc-nested]') && q('[data-cc-exp="dxf"]').attrs.has('disabled'), 'after an edit the old nest is dropped (it would not match the parts)');
}

section('Panel: files and commands');
{
  q('[data-cc-view="job"]').click();
  const text = JSON.stringify({ cabinetcraft: 1, name: 'From a file', unit: 'in', runs: [{ id: 'A', wall: 'N', base: [{ kind: 'cab', tpl: 'base-door', w: 24 }] }] });
  const api = globalThis.__ccApp;
  void api;
  doc.downloads.length = 0;
  q('[data-cc-save]').click();
  ok(/\.cabinetcraft\.json$/.test(doc.downloads[0].name), 'Save the job file downloads a .cabinetcraft.json');
  // the commands
  ok(started.runCommand('cabinetcraft:sample') === true && /Example kitchen loaded/.test(status), 'the command "sample" loads the example');
  ok(started.runCommand('cabinetcraft:check') === true && /to look at/.test(status), 'the command "check" reports in the status line: ' + status);
  // the exporters write
  const ex = Object.fromEntries(started.exporters().map((e) => [e.id.split(':')[1], e]));
  const cut = await ex.cutlist.write({});
  ok(/^Part,Name,Cabinet/.test(cut), 'the cut-list exporter writes the CSV');
  const job = JSON.parse(await ex.job.write({}));
  ok(job.cabinetcraft === 1 && job.runs.length === 2, 'the job exporter writes the job');
  const est = await ex.estimate.write({});
  ok(/placeholder/i.test(est), 'the estimate exporter writes the placeholder column and note');
  const dr = await ex.drawings.write({});
  ok(dr.startsWith('<!doctype html>') && dr.includes('<svg'), 'the drawings exporter writes the sheet set');
  void text;
}

section('Panel: room, islands, openings, corners, viewport, rates');
{
  const job = () => JSON.parse(store.m.get('cc-addon:partcraft:cabinetcraft:job'));
  const bodiesBefore = part.addonBodies ? Object.keys(part.addonBodies).length : 0;
  q('[data-cc-view="job"]').click(); q('[data-cc-new]').click();
  q('[data-cc-view="room"]').click();
  ok(q('[data-cc-shape]') && qa('[data-cc-wall]').map((n) => n.attrs.get('data-cc-wall')).join() === 'S,E,N,W', 'Room view: shape, the four walls of a rectangle');
  const sh = () => q('[data-cc-shape]');
  sh().value = 'L'; sh().fire('change');
  ok(job().room.shape === 'L' && qa('[data-cc-wall]').length === 6 && q('[data-cc-notch="at"]'), 'shape L: six walls and the notch fields');
  const nw = q('[data-cc-notch="w"]'); nw.value = '1200'; nw.fire('change');
  ok(job().room.notch.w === 1200, 'the notch width is kept');
  sh().value = 'rect'; sh().fire('change');
  // pick an L on the plan: corners clicked in order
  const click = (x, y) => q('[data-cc-pickplan]').dispatchEvent({ type: 'click', clientX: x, clientY: -y });
  for (const [x, y] of [[0, 0], [4020, 0], [4000, 2010], [2040, 1990], [2000, 3000], [10, 3010]]) click(x, y);
  ok(q('[data-cc-pick-count]').attrs.get('data-cc-pick-count') === '6', 'six corners picked on the plan (snapped to 50 mm and to straight lines)');
  q('[data-cc-pick-undo]').click(); ok(q('[data-cc-pick-count]').attrs.get('data-cc-pick-count') === '5', 'remove the last corner');
  click(0, 3000);
  q('[data-cc-pick-close]').click();
  ok(job().room.shape === 'free' && job().room.pts.length === 6 && job().room.w === 4000 && job().room.d === 3000, 'Close outline: the room is the picked L (a free outline of six corners)', JSON.stringify(job().room));
  ok(qa('[data-cc-wall]').length === 6 && q('[data-cc-outline]').value.split('\n').length === 6, 'its walls and its typed corners are listed');
  const ta = q('[data-cc-outline]'); ta.value = '0,0 5000,0 5000,3500 0,3500'; q('[data-cc-outline-apply]').click();
  ok(job().room.shape === 'rect' && job().room.w === 5000, 'typed corners that make a rectangle: a rectangle');
  ta.value = '0,0 100,0 100,100 50,150'; if (q('[data-cc-outline]')) { q('[data-cc-outline]').value = '0,0 100,0 100,100 50,150'; }
  // L room with a run, a door, a window and an island
  sh().value = 'L'; sh().fire('change');
  q('[data-cc-add-door]').click(); q('[data-cc-add-window]').click();
  ok(qa('[data-cc-opening]').map((n) => n.attrs.get('data-cc-opening')).join() === 'D1,W1' && job().openings.length === 2, 'a door and a window are added to a wall');
  const at = qa('[data-cc-opening="D1"] [data-cc-op="at"]')[0]; at.value = '1000'; at.fire('change');
  ok(job().openings[0].at === 1000, 'the door\'s place is kept');
  q('[data-cc-add-island]').click(); q('[data-cc-add-peninsula]').click();
  ok(qa('[data-cc-island]').length === 2 && job().islands[1].kind === 'peninsula', 'an island and a peninsula are added');
  q('[data-cc-island-edit="I1"]').click();
  ok(q('[data-cc-island-note]') && q('[data-cc-row="base"]') && q('[data-cc-row="back"]'), 'the island is laid out like a run: a front row and a back row');
  const tpl = q('[data-cc-tpl="base"]'); tpl.value = 'base-pair'; tpl.fire('change');
  q('[data-cc-add="base"]').click(); q('[data-cc-add="base"]').click();
  ok(job().islands[0].base.length === 2, 'two cabinets on the island');
  // a run with a corner cabinet
  q('[data-cc-addrun]').click();
  const t2 = q('[data-cc-tpl="base"]'); t2.value = 'base-corner-l'; t2.fire('change');
  q('[data-cc-add="base"]').click();
  ok(job().runs.at(-1).base[0].tpl === 'base-corner-l' && job().runs.at(-1).base[0].w === 900, 'a corner cabinet is added from the template list (900 wide)');
  q('[data-cc-view="checks"]').click();
  ok(qa('[data-cc-problem]').length >= 1, 'Checks speak about the room as well');
  // the viewport
  q('[data-cc-view="drawings"]').click();
  ok(q('[data-cc-3d]') && q('[data-cc-3d-status]').attrs.get('data-cc-3d-status') === '0' && q('[data-cc-3d-remove]').attrs.has('disabled'), 'Drawings: "3D in the PartCraft viewport", nothing placed yet');
  q('[data-cc-3d-place]').click();
  const placed = part.addonBodies && part.addonBodies.cabinetcraft && part.addonBodies.cabinetcraft.kitchen;
  ok(placed && placed.bodies.length > 10 && Number(q('[data-cc-3d-status]').attrs.get('data-cc-3d-status')) === placed.bodies.length && !q('[data-cc-3d-remove]').attrs.has('disabled'), 'Place in viewport: bodies are in the part and the panel counts them: ' + (placed ? placed.bodies.length : 0));
  ok(/Replace/.test(q('[data-cc-3d-place]').textContent), 'the button now says Replace');
  q('[data-cc-3d-room]').click(); q('[data-cc-3d-place]').click();
  ok(part.addonBodies.cabinetcraft.kitchen.bodies.length < placed.bodies.length, 'without the room shell fewer bodies are placed');
  q('[data-cc-3d-remove]').click();
  ok(!part.addonBodies && q('[data-cc-3d-status]').attrs.get('data-cc-3d-status') === '0', 'Remove from viewport takes them out');
  void bodiesBefore;
  // rates
  q('[data-cc-view="cost"]').click();
  doc.downloads.length = 0;
  q('[data-cc-rates-sheet]').click();
  ok(doc.downloads.at(-1).name.endsWith('-rates.csv'), 'the rate sheet downloads');
  q('[data-cc-rates-import]').click();
  const input = doc.body.children.filter((c) => c.tag === 'INPUT' && c.type === 'file').at(-1);
  input._files = [{ text: async () => 'labour.perHour,62\nmarkup,0.3\nfoo,1' }];
  input.fire('change');
  let tries = 0; while (job().rates?.labour?.perHour !== 62 && tries++ < 50) await settle();
  ok(job().rates.labour.perHour === 62 && job().rates.markup === 0.3, 'importing a shop\'s own CSV puts its rates in the job');
  ok(/2 rates imported, 1 lines ignored/.test(q('[data-cc-rates-result]').textContent) && /foo \(not a rate\)/.test(q('[data-cc-rates-result]').textContent), 'and says what it took and what it left: ' + q('[data-cc-rates-result]').textContent);
  ok(/lines still use a placeholder/.test(q('[data-cc-placeholder]').textContent), 'the rest are still labelled placeholders');
  // the nest shows progress and the page keeps going
  q('[data-cc-view="layout"]').click(); q('[data-cc-view="job"]').click(); q('[data-cc-sample]').click();
  q('[data-cc-view="export"]').click();
  q('[data-cc-nest]').click();
  ok(q('[data-cc-progress]') && q('[data-cc-nest]').attrs.has('disabled'), 'while the nest runs there is a progress bar and the button waits');
  tries = 0; while (!q('[data-cc-nested]') && tries++ < 600) await settle();
  ok(q('[data-cc-nested]') && !q('[data-cc-progress]'), 'the nest finished and the progress is gone');
  doc.downloads.length = 0;
  q('[data-cc-exp="drillxml"]').click();
  ok(doc.downloads.at(-1).name.endsWith('-holes.xml'), 'the generic hole list downloads as .xml');
}

section('Panel: angled and curved walls, drilling sizes, the dry run, the rates prompt');
{
  const job = () => JSON.parse(store.m.get('cc-addon:partcraft:cabinetcraft:job'));
  q('[data-cc-view="job"]').click(); q('[data-cc-new]').click();
  q('[data-cc-view="room"]').click();
  ok(q('[data-cc-segments]') && q('[data-cc-seg-apply]') && q('[data-cc-arc-make]') && q('[data-cc-pick-any]') && q('[data-cc-pick-arc]'), 'Room view: typed walls, arc wall, "any angle" and "arc walls" on the plan');
  q('[data-cc-seg-example]').click();
  const seg = q('[data-cc-segments]');
  ok(/1414/.test(seg.attrs.get('placeholder') || '') && seg.value.includes('1414.21'), 'the example is filled in (a bay)');
  q('[data-cc-seg-apply]').click();
  ok(job().room.shape === 'free' && job().room.pts.length === 6, 'typed walls make a bay room', JSON.stringify(job().room));
  ok(qa('[data-cc-wall]').length === 6 && /corner turns 45/.test(qa('[data-cc-wall]')[2].textContent) && /direction 135/.test(qa('[data-cc-wall]')[2].textContent), 'the walls are listed with their direction and the turn at the corner: ' + qa('[data-cc-wall]')[2].textContent);
  const bad = q('[data-cc-segments]'); bad.value = 'nonsense'; q('[data-cc-seg-apply]').click();
  ok(job().room.pts.length === 6, 'text that is no room leaves the job as it was');
  // an arc wall
  const sw = q('[data-cc-arc-sweep]'); sw.value = '40'; sw.fire('change');
  const aw = q('[data-cc-arc-wall]'); aw.value = 'P1'; aw.fire('change');
  q('[data-cc-arc-make]').click();
  ok(job().room.arcs && job().room.arcs.length === 1 && job().room.arcs[0].sweep === 40 && /arc, radius/.test(qa('[data-cc-wall]')[0].textContent), 'one wall made an arc of 40 degrees, and the list says so: ' + qa('[data-cc-wall]')[0].textContent);
  q('[data-cc-arc-straight]').click();
  ok(!job().room.arcs, 'and straight again');
  // picking at any angle on the plan, with an arc
  q('[data-cc-view="job"]').click(); q('[data-cc-new]').click(); q('[data-cc-view="room"]').click();
  q('[data-cc-pick-any]').click();
  const click = (x, y) => q('[data-cc-pickplan]').dispatchEvent({ type: 'click', clientX: x, clientY: -y });
  for (const [x, y] of [[0, 0], [4000, 0], [4000, 1500]]) click(x, y);
  q('[data-cc-pick-arc]').click();
  click(2000, 2500); click(0, 1500);
  ok(q('[data-cc-pick-count]').attrs.get('data-cc-pick-count') === '4', 'an arc takes two clicks (a point on it, then its end): four corners now');
  q('[data-cc-pick-arc]').click();
  q('[data-cc-pick-close]').click();
  ok(job().room.shape === 'free' && job().room.arcs && job().room.arcs.length === 1 && job().room.arcs[0].i === 2 && job().room.arcs[0].sweep > 0, 'closed: the room has one arc wall that bulges away from the room (a bay)', JSON.stringify(job().room));
  // a corner cabinet in the bay room, the drilling sizes, the dry run
  q('[data-cc-view="job"]').click(); q('[data-cc-sample]').click();
  q('[data-cc-view="room"]').click();
  q('[data-cc-seg-example]').click(); q('[data-cc-seg-apply]').click();
  q('[data-cc-view="layout"]').click();
  q('[data-cc-addrun]').click();
  const rw = q('[data-cc-run-wall]'); rw.value = 'P4'; rw.fire('change');
  const tpl = q('[data-cc-tpl="base"]');
  tpl.value = 'base-corner-diag'; tpl.fire('change'); q('[data-cc-add="base"]').click();
  ok(job().runs.at(-1).wall === 'P4' && job().runs.at(-1).base[0].tpl === 'base-corner-diag', 'a diagonal corner cabinet on the north wall of the bay');
  q('[data-cc-view="checks"]').click();
  ok(qa('[data-cc-problem]').length >= 1, 'Checks speak');
  q('[data-cc-view="export"]').click();
  ok(q('[data-cc-hwsizes]') && qa('[data-cc-hw]').length === 6, 'Export: six drilling sizes, blank');
  const fd = q('[data-cc-hw="fastenDia"]'); fd.value = '8'; fd.fire('change');
  ok(job().hw && job().hw.fastenDia === 8, 'a typed size is kept in the job');
  ok(q('[data-cc-dryrun]') && /No machine run has happened/.test(q('[data-cc-dryrun]').textContent), 'the dry-run box says no machine run has happened');
  q('[data-cc-dry-run]').click();
  ok(q('[data-cc-holes-ok]') && q('[data-cc-holes-ok]').attrs.get('data-cc-holes-ok') === '1', 'the hole list was checked: every hole inside its panel');
  doc.downloads.length = 0;
  q('[data-cc-exp="runcheck"]').click();
  ok(doc.downloads.at(-1).name.endsWith('-first-run-checklist.html'), 'the first-run checklist downloads');
  q('[data-cc-exp="review"]').click();
  ok(doc.downloads.at(-1).name.endsWith('-maker-review.html'), 'and the maker\'s review sheet');
  // the G-code and its dry run
  q('[data-cc-view="job"]').click(); q('[data-cc-sample]').click(); q('[data-cc-view="export"]').click();
  q('[data-cc-nest]').click();
  let tries = 0; while (!q('[data-cc-nested]') && tries++ < 600) await settle();
  q('[data-cc-gcode]').click();
  tries = 0; while (qa('[data-cc-gfile]').length === 0 && tries++ < 200) await settle();
  ok(qa('[data-cc-gfile]').length >= 1, 'G-code made');
  const rp = q('[data-cc-rapid]'); rp.value = '6000'; rp.fire('change');
  q('[data-cc-dry-run]').click();
  const f1 = qa('[data-cc-dry-file]');
  ok(f1.length >= 1 && f1.every((n) => n.attrs.get('data-cc-dry-ok') === '1') && /minutes in all/.test(f1[0].textContent) && /Reaches X 0 to/.test(f1[0].textContent), 'every program was read: ok, bounding box, time with the typed rapid rate: ' + f1[0].textContent.slice(0, 200));
  // the rates prompt
  q('[data-cc-view="cost"]').click();
  ok(q('[data-cc-rates-prompt]') && q('[data-cc-quote]').attrs.get('data-cc-quote') === 'draft' && /DRAFT/.test(q('[data-cc-quote]').textContent), 'Cost: the first-run prompt "Type your shop\'s rates" and a DRAFT label');
  ok(q('[data-cc-lint]').attrs.get('data-cc-lint').split(',').includes('sheet') && qa('[data-cc-lint-cat]').length >= 6, 'the lint lists the categories still on placeholders');
  q('[data-cc-rates-import]').click();
  const input = doc.body.children.filter((c) => c.tag === 'INPUT' && c.type === 'file').at(-1);
  const all = [];
  { const E = await mine('lib/estimate.js'); for (const pth of E.leafPaths()) if (pth !== 'currency') all.push(pth + ',' + E.rateAt(E.ratesOf({}), pth)); }
  input._files = [{ text: async () => all.join('\n') }];
  input.fire('change');
  tries = 0; while (q('[data-cc-quote]').attrs.get('data-cc-quote') !== 'final' && tries++ < 50) await settle();
  ok(q('[data-cc-quote]').attrs.get('data-cc-quote') === 'final' && !q('[data-cc-rates-prompt]') && /FINAL QUOTE/.test(q('[data-cc-quote]').textContent), 'importing every rate (even ones equal to the placeholders) turns the label to FINAL QUOTE and the prompt goes');
  q('[data-cc-rates-reset]') && q('[data-cc-rates-reset]').click();
  ok(q('[data-cc-quote]').attrs.get('data-cc-quote') === 'draft', 'back to placeholders: DRAFT again');
}

section('Switch off');
{
  await started.loader.setEnabled('cabinetcraft', false);
  ok(started.panelTabs().length === 0 && started.exporters().length === 0 && started.commandList().length === 0, 'tab, exporters and commands go');
  ok(problemsSeen.disposed === true, 'the Problems source is disposed');
  ok(root.children.every((c) => c.tag !== 'SECTION'), 'the pane is removed from the page');
}

section('Add-on files');
{
  const man = JSON.parse(fs.readFileSync(path.join(ADDON, 'addon.json'), 'utf8'));
  ok(man.id === 'cabinetcraft' && man.apps.join() === 'partcraft,bimcraft,cadcraft,modelcraft' && man.default === 'off' && man.license === 'Apache-2.0' && man.api === '1.1', 'the manifest: the four apps, off by default, Apache-2.0, API 1.1 (api.model)');
  ok(JSON.parse(fs.readFileSync(path.join(addonsDir, 'index.json'), 'utf8')).addons.includes('cabinetcraft'), 'registered in dev/addons/index.json');
  ok(fs.readFileSync(path.join(ADDON, 'LICENSE'), 'utf8').includes('Apache License'), 'LICENSE is the Apache text');
  const sync = await import(pathToFileURL(path.join(globalThis.__ccTest.ROOT, 'tools/cabinetcraft/sync.mjs')).href);
  const same = sync.MAP.every(([a, b]) => fs.readFileSync(a).equals(fs.readFileSync(b)));
  ok(same, 'the shared files are byte-identical copies (tools/cabinetcraft/sync.mjs --check)');
  const src = ['main.js', ...fs.readdirSync(path.join(ADDON, 'lib')).filter((f) => f.endsWith('.js')).map((f) => 'lib/' + f)];
  const bad = src.filter((f) => /\binnerHTML\s*=/.test(fs.readFileSync(path.join(ADDON, f), 'utf8')) && f !== 'lib/ui.js');
  ok(bad.length === 0, 'innerHTML is used only in ui.js, for the drawings\' SVG', bad.join());
  const imports = src.flatMap((f) => [...fs.readFileSync(path.join(ADDON, f), 'utf8').matchAll(/from '(\.\.?\/[^']+)'/g)].map((m) => [f, m[1]]));
  const outside = imports.filter(([f, i]) => !path.resolve(path.dirname(path.join(ADDON, f)), i).startsWith(ADDON));
  ok(outside.length === 0, 'static imports stay inside the folder (the one app import, cam-sheets.js, is dynamic)', JSON.stringify(outside));
}

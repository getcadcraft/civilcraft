#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// TrussCraft in ModelCraft through ModelCraft's own loader (addons.js AddonLoader + the shared API, add-on API 1.0) over a REAL model (model.js): bundled and off,
// switched on, the set laid out from a typed outline and placed as one mesh object per truss in a group "TrussCraft" (one undo step), painted in the species colour,
// the roof outline taken from a selected face, Remove, Undo, switched off. The tab's DOM is a small stand-in; the real page is tools/addons-test/browser-trusscraft-modelcraft.mjs.
//   node public_html/assets/apps/modelcraft/dev/addons/trusscraft/test/host-modelcraft.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { makeDocument } from './fake-dom.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url)), ADDON = path.resolve(HERE, '..'), APP = path.resolve(ADDON, '../..');
let pass = 0, fail = 0;
const ok = (c, n, x = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + n + (x ? ' — ' + x : '')); } };
const section = (s) => console.log('\n' + s);
const app = (f) => import(pathToFileURL(path.join(APP, f)).href);

const doc = makeDocument();
globalThis.document = doc;
const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };
const store = mem();
const problemsSeen = [];
const i18n = await app('i18n.js');
i18n.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const MD = await app('model.js'), A = await app('addons.js');
const model = new MD.Model();
const host = { sel: [], path: [] };
globalThis.window = { modelcraft: { model, host }, ccProblems: { source: (def) => ({ set: (list) => { problemsSeen.push(list); return {}; }, dispose() {}, def }) }, localStorage: store, addEventListener() {}, removeEventListener() {}, dispatchEvent() {} };

section('TrussCraft in ModelCraft (shared add-on API, real model)');
const tabs = [], exporters = new Map(), registry = { importers: new Map(), exporters, listeners: new Set(), changed() {} };
const loader = new A.AddonLoader({
  app: 'modelcraft', appName: 'ModelCraft', apiVersion: '1.0', base: pathToFileURL(path.join(APP, 'addons') + '/').href, storage: store, packages: A.packageStore(null), importer: (u) => import(u),
  fetchJson: async (u) => { try { return JSON.parse(fs.readFileSync(fileURLToPath(u), 'utf8')); } catch { return null; } },
  makeApi: (base, addon) => { const api = A.sharedApi(base, addon, registry); api.ui.panelTab = ({ title, render }) => { tabs.push({ title, render }); return null; }; return api; },
});
await loader.start();
const me = () => loader.list().find((a) => a.id === 'trusscraft');
ok(me() && me().state !== 'active' && me().state !== 'failed' && me().source === 'bundled', 'bundled and off until switched on', JSON.stringify(me()));
const man = JSON.parse(fs.readFileSync(path.join(ADDON, 'addon.json'), 'utf8'));
ok(man.apps.includes('modelcraft') && man.api === '1.0' && man.default === 'off', 'manifest: modelcraft listed, API 1.0, default off');
await loader.setEnabled('trusscraft', true);
ok(me().state === 'active', 'active after the switch', JSON.stringify(me()));
ok(tabs.length === 1 && tabs[0].title === 'Trusses', 'its tab is "Trusses"');
ok(exporters.size === 9, 'nine exports', [...exporters.keys()].join());

const pane = doc.createElement('section'); doc.body.append(pane);
const show = () => { pane.replaceChildren(); tabs[0].render(pane); };
show();
const settle = () => new Promise((r) => setTimeout(r, 80));
const btn = (sel) => pane.querySelector(sel);
const text = () => (pane.querySelector('.trs-say') ? pane.querySelector('.trs-say').textContent : '');
ok(/Not a substitute for engineered truss design/.test(pane.textContent), 'the not-a-design label is in the tab');
btn('[data-trs-place]') && ok(/mesh objects/i.test(btn('[data-trs-place]').textContent), 'Place button wording is ModelCraft\'s');
// design + layout + place
const buttons = [...pane.querySelectorAll('button')];
const layoutBtn = buttons.find((b) => /Lay out/i.test(b.textContent));
ok(!!layoutBtn, 'a Lay out button');
layoutBtn.click(); await settle();
ok(/trusses/i.test(text()) || text().length > 10, 'laid out from the typed outline', text());
const before = model.root.insts.size;
btn('[data-trs-place]').click(); await settle();
const grpInst = [...model.root.insts].find(([, i]) => (model.defs.get(i.def) || {}).name === 'TrussCraft');
ok(!!grpInst, 'a group "TrussCraft" was placed in the model', text());
if (grpInst) {
  const gdef = model.defs.get(grpInst[1].def);
  ok(gdef.insts.size >= 5, 'one placement per truss', String(gdef.insts.size));
  const first = [...gdef.insts.values()][0];
  ok(/^#[0-9a-f]{6}$/i.test(first.color), 'painted in the species colour', String(first.color));
  const md = model.defs.get(first.def);
  ok(md.mesh && md.mesh.faceCount >= 12, 'each truss is a mesh object', md.mesh && String(md.mesh.faceCount));
  const bb = model.bbox();
  ok(bb && bb.max[2] > 1.0 && bb.max[0] > 10 && bb.max[0] < 20, 'metres, z up: the 12 m span and the ridge height', JSON.stringify(bb));
}
ok(text().length > 0 && /\d+/.test(text()), 'the status line counts what was placed', text());
// Undo takes it away in one step
const undo = model.undo ? model.undo() : null;
ok(!([...model.root.insts].some(([, i]) => (model.defs.get(i.def) || {}).name === 'TrussCraft')), 'one Undo removes the whole set', String(undo));
model.redo && model.redo();
// Remove button
show();
btn('[data-trs-clear]').click(); await settle();
ok(!([...model.root.insts].some(([, i]) => (model.defs.get(i.def) || {}).name === 'TrussCraft')), 'Remove takes the group away');
// outline from a selected face
const g = model.newDef ? null : null; void g;
model.change('floor', (m) => {
  const d = m.root;
  const vs = [[0, 0, 0], [9, 0, 0], [9, 5, 0], [0, 5, 0]].map((p) => MD.vAdd(d, p));
  const edges = vs.map((v, i) => MD.eAdd(d, v, vs[(i + 1) % 4]));
  d.__floor = MD.fAdd(d, [vs], '#cccccc'); void edges;
});
const fid = [...model.root.faces.keys()][0];
host.sel = []; show();
btn('[data-trs-pick]').click(); await settle();
ok(/face/i.test(text()), 'with no face selected it says what to select', text());
host.sel = [{ t: 'f', id: fid }]; show();
btn('[data-trs-pick]').click(); await settle();
const ta = pane.querySelector('textarea');
ok(ta && /9000/.test(ta.textContent + (ta.value || '')) && /5000/.test(ta.textContent + (ta.value || '')), 'the outline is the selected face (9 x 5 m, in mm)', ta && (ta.value || ta.textContent));
// Problems
const exp = (id) => exporters.get('trusscraft:' + id);
layoutBtn && [...pane.querySelectorAll('button')].find((b) => /Lay out/i.test(b.textContent)).click(); await settle();
const stl = await exp('set-stl').write({});
ok(/^solid /.test(stl) && stl.includes('facet normal'), 'STL export of the set');
const csvText = await exp('cuts-csv').write({});
ok(/mark|Mark/.test(csvText), 'cut list CSV');
await loader.setEnabled('trusscraft', false);
ok(exporters.size === 0, 'switched off: the exports are gone');
console.log(`\nhost-modelcraft: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

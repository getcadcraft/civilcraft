#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// TrussCraft in PartCraft through PartCraft's own loader (partcraft-api.js, add-on API 1.1): bundled and off, switched on, its tab, a truss set laid out from a
// typed outline and placed as display bodies (one undo step per group), species colour, the roof outline taken from a selected sketch, Remove, exports, switched off.
//   node public_html/assets/apps/partcraft/dev/addons/trusscraft/test/host-partcraft.mjs
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
const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m }; };
const store = mem();
const problemsSeen = [];
globalThis.window = { ccProblems: { source: (def) => ({ set: (list) => { problemsSeen.push(list); return {}; }, dispose() {}, def }) }, localStorage: store, addEventListener() {} };
const i18n = await app('i18n.js');
i18n.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const P = await app('part.js'), SK = await app('sketch.js'), A = await app('addons.js'), PA = await app('addons/partcraft-api.js');

section('TrussCraft in PartCraft (add-on API 1.1)');
const part = P.newPart('Test');
const history = [];
let status = '', selected = null;
const host = { get part() { return part; }, regen: { mesh: null }, commit: (label, fn) => { history.push(label); return fn(); }, status: (s) => { status = s; }, renderAll() {} };
const root = doc.createElement('div'), list = doc.createElement('div');
list.setAttribute('data-right-tabs', ''); root.append(list); doc.body.append(root);
const started = await PA.startAddons({
  host, selection: () => selected, select() {}, find: (sel) => (sel.includes('data-right-tabs') ? list : null), showTab() {}, bodies: { sync() {}, fit() {} },
  base: pathToFileURL(path.join(APP, 'addons') + '/').href, importer: (u) => import(u), storage: store, verify: async () => false, bundledOnly: false, noGlobal: true, packages: A.packageStore(null),
  fetchJson: async (u) => { try { return JSON.parse(fs.readFileSync(fileURLToPath(u), 'utf8')); } catch { return null; } },
});
const me = () => started.list().find((a) => a.id === 'trusscraft');
ok(me() && me().state !== 'active' && me().state !== 'failed' && me().source === 'bundled', 'bundled and off until switched on', JSON.stringify(me()));
const man = JSON.parse(fs.readFileSync(path.join(ADDON, 'addon.json'), 'utf8'));
ok(man.apps.includes('partcraft') && man.api === '1.1' && man.default === 'off', 'manifest: partcraft listed, API 1.1, default off');
await started.loader.setEnabled('trusscraft', true);
ok(me().state === 'active', 'active after the switch', JSON.stringify(me()));
ok(started.panelTabs().length === 1 && started.panelTabs()[0].title === 'Trusses', 'its tab is "Trusses"');
ok(['trusscraft:design', 'trusscraft:layout', 'trusscraft:check', 'trusscraft:place'].every((k) => started.commandList().some((c) => `${c.addon}:${c.name}` === k)), 'four commands');
ok(started.exporters().length === 9, 'nine exporters', started.exporters().map((e) => e.id).join());
ok(problemsSeen.length === 0, 'no Problems before a result');

const settle = () => new Promise((r) => setTimeout(r, 120));
started.runCommand('trusscraft:design'); await settle();
ok(/King|fink|Fink|truss|members/i.test(status) || status.length > 5, 'design: a summary on the status line', status);
ok(problemsSeen.at(-1)[0].code === 'notdesign' && problemsSeen.at(-1)[0].severity === 'warning', 'Problems: the not-a-design label comes first');
ok(problemsSeen.at(-1).some((p) => p.code === 'host0' && /display bodies/.test(p.text)) && problemsSeen.at(-1).some((p) => p.code === 'host1' && /no roofs to read/.test(p.text)), 'Problems say what PartCraft cannot do (display bodies, no roofs)');
ok(problemsSeen.at(-1)[0].source.name === 'partcraft.addon.trusscraft', 'Problems source names the app');

started.runCommand('trusscraft:place'); await settle();
const g = part.addonBodies && part.addonBodies.trusscraft && part.addonBodies.trusscraft.trusses;
ok(g && g.bodies.length > 100, 'the set was placed as display bodies', String(g && g.bodies.length) + ' ' + status);
ok(g && g.bodies.every((b) => b.mesh && b.mesh.positions.length % 3 === 0 && /^#[0-9a-f]{6}$/i.test(b.color)), 'every body is a closed mesh with a species colour');
ok(history.filter((h) => h === 'Place trusses').length === 1, 'one undo step for the group', history.join('|'));
// Y up: the ridge is the highest point; plan y becomes -z
const ys = g.bodies.flatMap((b) => b.mesh.positions.filter((_, i) => i % 3 === 1));
ok(Math.min(...ys) > -400 && Math.max(...ys) > 1500, 'PartCraft axes: height is Y', Math.min(...ys) + '..' + Math.max(...ys));

// the panel: place again from the button, then Remove
const pane = () => root.children.find((c) => c.tag === 'SECTION');
let sec = pane();
ok(!!sec, 'the tab renders a section');
sec.fire('cc-tab-shown');
const pick = sec.querySelector('[data-trs-pick]');
ok(!!pick, 'a "take outline from the selected sketch" button');
// a sketch feature with a closed 10 m x 6 m rectangle
const sk = SK.newSketch(); SK.addRect(sk, [0, 0], [10000, 6000]);
const f = P.addFeature(part, 'sketch', { sketch: sk });
selected = { kind: 'feature', id: f.id };
pick.click(); await settle();
const ta = sec.querySelector('textarea');
ok(ta && /10000/.test(ta.textContent + (ta.value || '')) && /6000/.test(ta.textContent + (ta.value || '')), 'the outline is the sketch\'s rectangle', ta && (ta.value || ta.textContent));
selected = null; sec.querySelector('[data-trs-pick]').click(); await settle();
ok(/sketch/i.test(sec.querySelector('.trs-say') ? sec.querySelector('.trs-say').textContent : ''), 'with no sketch selected it says what to select');
selected = { kind: 'feature', id: f.id };
const place = sec.querySelector('[data-trs-place]'), clear0 = sec.querySelector('[data-trs-clear]');
ok(place && /bodies/i.test(place.textContent) && clear0, 'Place and Remove buttons (host wording)');
// lay out on the sketched outline, place again: the group is replaced, not doubled
started.runCommand('trusscraft:layout'); await settle();
sec.querySelector('[data-trs-place]').click(); await settle();
const g2 = part.addonBodies.trusscraft.trusses;
ok(g2.bodies.length > 50 && g2.bodies.length !== g.bodies.length, 'placing again replaced the group (10 x 6 m)', g.bodies.length + ' -> ' + g2.bodies.length);
sec.querySelector('[data-trs-clear]').click(); await settle();
ok(!part.addonBodies || !part.addonBodies.trusscraft || !part.addonBodies.trusscraft.trusses, 'Remove takes the group away');

// exports
const ex = (id) => started.exporters().find((e) => e.id === 'trusscraft:' + id);
started.runCommand('trusscraft:layout'); await settle();
const stl = await ex('set-stl').write(started.exportInput('x')), obj = await ex('set-obj').write(started.exportInput('x'));
ok(/^solid /.test(stl) && /facet normal/.test(stl) && /^# TrussCraft/.test(obj) && /\nf \d+ \d+ \d+/.test(obj), 'STL and OBJ of the set');
const jig = await ex('jig-svg').write(started.exportInput('x'));
ok(/<svg[^>]+width="\d+(\.\d+)?mm"/.test(jig) && /polygon/.test(jig) && /Not a substitute/.test(jig), 'jig drawing: life-size SVG (width in mm) with member outlines and the label');
const stock = await ex('stock-csv').write(started.exportInput('x'));
ok(/^size,bar,stock mm,piece/.test(stock) && stock.split('\r\n').length > 20, 'stock plan CSV');

await started.loader.setEnabled('trusscraft', false);
ok(started.panelTabs().length === 0 && started.exporters().length === 0 && !started.commandList().some((c) => c.addon === 'trusscraft'), 'switched off: tab, exports and commands are gone');
console.log(`\nhost-partcraft: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

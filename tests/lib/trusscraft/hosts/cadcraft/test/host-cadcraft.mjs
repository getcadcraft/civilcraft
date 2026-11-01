#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// TrussCraft in CadCraft through CadCraft's own loader and command engine (cadcraft-api.js, a real Doc): bundled and off, switched on, its commands on the command
// line, the layout plan / elevation / force diagram / schedule drawn as real entities on TRUSS-* layers (lines, closed polylines, text, solid hatches, dimensions),
// one undo step each, the outline taken from a selected closed polyline in a metre drawing, Remove, DXF out, switched off.
//   node public_html/assets/apps/cadcraft/dev/addons/trusscraft/test/host-cadcraft.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url)), ADDON = path.resolve(HERE, '..'), APP = path.resolve(ADDON, '../..');
let pass = 0, fail = 0;
const ok = (c, n, x = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + n + (x ? ' — ' + x : '')); } };
const section = (s) => console.log('\n' + s);
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
const mine = (f) => import(pathToFileURL(path.join(ADDON, f)).href);

globalThis.document ??= { querySelector: () => null, querySelectorAll: () => [], getElementById: () => null };
const { Doc } = await load('doc.js'), Cmd = await load('commands.js'), CA = await load('addons/cadcraft-api.js'), A = await load('addons.js'), I18n = await load('i18n.js'), D = await load('dxf.js');
I18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const problemsSeen = [];
globalThis.window = { ccProblems: { source: (def) => ({ set: (l) => { problemsSeen.push(l); return {}; }, dispose() {}, def }) }, addEventListener() {}, removeEventListener() {} };

async function session(units) {
  const doc = new Doc(); doc.meta.units = units;
  const log = [];
  const host = { cursor: { x: 0, y: 0 }, selection: new Set(), print: (s) => log.push(String(s)), prompt() {}, setSelection: (s) => { host.selection = new Set(s); }, preview() {}, pickAt: () => null, pickWindow: () => [], zoomExtents() {}, zoomWindow() {}, props: { schedule() {} } };
  const eng = new Cmd.Engine(doc, host);
  const mem = new Map(), storage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
  const started = await CA.startAddons({
    doc, engine: eng, host, print: host.print, redraw: () => {}, pickFile: async () => null, download: async () => {}, openDrawing: async () => {},
    base: pathToFileURL(path.join(APP, 'addons') + '/').href, storage, packages: A.packageStore(null), noGlobal: true,
    fetchJson: async (u) => (/\/index\.json$/.test(u) ? { addons: ['trusscraft'] } : (() => { try { return JSON.parse(fs.readFileSync(fileURLToPath(u), 'utf8')); } catch { return null; } })()),
    importer: (u) => import(u),
  });
  const settle = async () => { for (let i = 0; i < 12; i++) await new Promise((r) => setTimeout(r, 0)); };
  const type = async (...l) => { for (const x of l) { eng.text(x); await settle(); } };
  return { doc, host, eng, started, log, type, settle, api: () => ({ doc, selection: () => [...host.selection], redraw() {} }) };
}

section('TrussCraft in CadCraft (add-on API 1.3, real Doc and command engine)');
const S = await session('millimeters');
const me = () => S.started.list().find((a) => a.id === 'trusscraft');
ok(me() && me().state !== 'active' && me().state !== 'failed' && me().source === 'bundled', 'bundled and off until switched on', JSON.stringify(me()));
const man = JSON.parse(fs.readFileSync(path.join(ADDON, 'addon.json'), 'utf8'));
ok(man.apps.includes('cadcraft') && man.api === '1.3' && man.default === 'off', 'manifest: cadcraft listed, API 1.3, default off');
await S.started.loader.setEnabled('trusscraft', true);
ok(me().state === 'active', 'active after the switch', JSON.stringify(me()));
ok(S.started.exporters().length === 9, 'nine exporters', S.started.exporters().map((e) => e.id).join());
await S.type('TRUSSLAYOUT');
ok(S.log.some((l) => /trusses/i.test(l)), 'TRUSSLAYOUT lays out from the typed outline and prints a summary', S.log.join(' | '));
ok(problemsSeen.at(-1) && problemsSeen.at(-1)[0].code === 'notdesign' && problemsSeen.at(-1)[0].source.name === 'cadcraft.addon.trusscraft', 'Problems: the label first, source cadcraft.addon.trusscraft');
ok(problemsSeen.at(-1).some((p) => /plain lines, polylines/.test(p.text)) && problemsSeen.at(-1).some((p) => /no roof model to read/.test(p.text)), 'Problems say what CadCraft cannot do');
await S.type('TRUSSPLACE');
const mineEnts = () => S.doc.all().filter((e) => String(e.layer).startsWith('TRUSS-'));
ok(S.doc.layers.has('TRUSS-LAYOUT') && S.doc.layers.has('TRUSS-DIMS') && S.doc.layers.has('TRUSS-MEMBERS'), 'the TRUSS-* layers were added');
const types = new Set(mineEnts().map((e) => e.type));
ok(types.has('line') && types.has('poly') && types.has('text') && types.has('dim'), 'layout plan: lines, the outline polyline, text and a dimension', [...types].join());
ok(mineEnts().filter((e) => e.type === 'line' && e.layer === 'TRUSS-LAYOUT').length >= 15, 'one line per truss on TRUSS-LAYOUT');
ok(S.doc.undoStack.length === 1, 'one undo step', S.doc.undoStack.map((s) => s.label).join());

// the host's other drawings, with real designs from the engine
const { makeHost } = await mine('host.js');
const H = makeHost(S.api(), { t: (k, v) => I18n.t ? k : k });
const TB = await mine('lib/tables.js'), DS = await mine('lib/design.js'), CORE = await mine('lib/core.js');
CORE.setT(CORE.lookupFrom(JSON.parse(fs.readFileSync(path.join(ADDON, 'lang/en.json'), 'utf8'))));
const d = DS.designTruss({ ...TB.DEFAULT_TRUSS, type: 'king', span: 8000, pitch: 30, spacing: 600 }, { loads: { ...TB.DEFAULT_LOADS }, combos: TB.DEFAULT_COMBOS, species: TB.DEFAULT_SPECIES[0], spacing: 600 });
ok(d.ok && d.res.status === 'ok', 'a king-post design to draw', d.error || d.res.status);
const before = mineEnts().length;
const by = (id) => H.buttons.find((b) => b.id === id);
await by('elevation').run({ design: d });
const el = mineEnts().slice(before);
ok(el.some((e) => e.type === 'hatch' && e.solid) && el.filter((e) => e.type === 'poly').length >= 5 && el.filter((e) => e.type === 'dim').length >= 2 && el.some((e) => e.type === 'text' && /Not a substitute/.test(e.s)), 'elevation: member outlines, plate hatches, dimensions and the label');
ok(Math.min(...el.filter((e) => e.type === 'poly').flatMap((e) => e.pts.map((p) => p.x))) > Math.max(...S.doc.all().filter((e) => !String(e.layer).startsWith('TRUSS-') || e.layer === 'TRUSS-LAYOUT').flatMap((e) => e.type === 'line' ? [e.x1, e.x2] : [])) - 1, 'the elevation lands to the right of what is drawn');
await by('forces').run({ design: d });
ok(S.doc.all().some((e) => e.layer === 'TRUSS-TENSION') && S.doc.all().some((e) => e.layer === 'TRUSS-COMPRESSION') && S.doc.all().some((e) => e.layer === 'TRUSS-FORCES' && /kN/.test(e.s || '')), 'force diagram: tension and compression layers, forces in kN');
await by('table').run({ design: d });
ok(S.doc.all().some((e) => e.layer === 'TRUSS-TABLE' && e.type === 'text' && /Cut length/.test(e.s)), 'schedule table: the cut list heading');
// DXF out
const dxf = D.writeDxf(S.doc).text;
ok(/TRUSS-LAYOUT/.test(dxf) && /TRUSS-TENSION/.test(dxf) && /TRUSS-PLATES/.test(dxf), 'DXF out carries the TRUSS-* layers');
// Remove
ok(await H.clear() === true && mineEnts().length === 0, 'Remove takes every TRUSS-* object away');
ok(await H.clear() === false, 'Remove with nothing to remove says so');

section('Outline from a selected closed polyline in a metre drawing');
const M = await session('meters');
const poly = M.doc.change('rect', () => M.doc.add({ type: 'poly', layer: '0', pts: [{ x: 0, y: 0 }, { x: 9, y: 0 }, { x: 9, y: 5 }, { x: 0, y: 5 }], closed: true }));
const Hm = (await mine('host.js')).makeHost(M.api(), { t: (k) => k });
let err = ''; try { Hm.pickOutline(); } catch (e) { err = e.message; }
ok(err === 'h.cadcraft.nopoly', 'nothing selected: it says what to select', err);
M.host.setSelection([poly.id]);
const o = Hm.pickOutline();
ok(o.length === 4 && o[1][0] === 9000 && o[2][1] === 5000, 'the corners come out in mm (9 x 5 m)', JSON.stringify(o));
const lay = (await mine('lib/roofset.js')).layoutRoof((await mine('lib/roofs-typed.js')).typedRoof(o, { pitch: 30, overhang: 450, ends: 'gable' }), { spacing: 600, type: 'fink' });
ok(lay.ok && lay.count >= 10, 'the typed roof lays out', String(lay.count));
const ds = new Map();
for (const g of lay.groups) ds.set(g.key, DS.designTruss({ ...lay.designs.get(g.key).spec }, { loads: { ...TB.DEFAULT_LOADS }, combos: TB.DEFAULT_COMBOS, species: TB.DEFAULT_SPECIES[0], spacing: 600 }));
const n = await Hm.place({ layout: lay, designs: ds, outline: o });
const lines = M.doc.all().filter((e) => e.layer === 'TRUSS-LAYOUT' && e.type === 'line');
ok(n > 10 && lines.length === lay.count && Math.max(...lines.map((e) => Math.max(e.x1, e.x2))) < 10 && Math.max(...lines.map((e) => Math.max(e.x1, e.x2))) > 8.5, 'drawn in the drawing\'s own units (metres)', String(Math.max(...lines.map((e) => e.x2))));
await S.started.loader.setEnabled('trusscraft', false);
ok(S.started.exporters().length === 0, 'switched off: the exports are gone');
console.log(`\nhost-cadcraft: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

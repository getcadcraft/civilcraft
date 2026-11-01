#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** 0.8 round 3 (civil_PART_3), LC.16 rest + CV.2: water mains as objects (hydrants, valves, the fittings the layout implies), the plan layers, LandXML and IFC out/in, the showcase file.
 *  Run: node bin/test-civilcraft-waterobjects.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m && spec !== 'three') return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await mod('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { t } = await mod('i18n.js'), W = await mod('water.js'), O = await mod('water-objects.js'), PJ = await mod('project.js'), LX = await mod('landxml.js'), IM = await mod('ifc-civil-model.js'), IW = await mod('ifc-civil.js'), PB = await mod('problems-water.js');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };

// ---- a small network: reservoir – J1 – J2 (bend) – J3 (tee) – J4 (reducer 150 → 100) – J5 (dead end); J3 – J6 (dead end)
const node = (id, x, y, z, extra = {}) => ({ id, name: id.toUpperCase(), x, y, z, demand: 0, kind: 'junction', ...extra });
const raw = { nodes: [node('r', 0, 0, 120, { kind: 'reservoir', head: 160 }), node('j1', 100, 0, 100, { demand: 2 }), node('j2', 200, 0, 99, { demand: 2 }), node('j3', 200, 100, 98, { demand: 2 }), node('j4', 300, 100, 97, { demand: 2 }), node('j5', 400, 100, 96, { demand: 1 }), node('j6', 200, 200, 97, { demand: 1 })],
  pipes: [['p1', 'r', 'j1', 200], ['p2', 'j1', 'j2', 200], ['p3', 'j2', 'j3', 200], ['p4', 'j3', 'j4', 150], ['p5', 'j4', 'j5', 100], ['p6', 'j3', 'j6', 150]].map(([id, a, b, d]) => ({ id, name: '', a, b, kind: 'pipe', length: null, d, c: 130, minor: 0, status: 'open' })),
  settings: {}, fittings: [{ id: 'wf1', kind: 'hydrant', host: { node: 'j2' }, name: 'H-1' }, { id: 'wf2', kind: 'valve', host: { pipe: 'p2', t: 0.25 } }, { id: 'wf3', kind: 'hydrant', host: { pipe: 'p2', t: 0.5 } }, { id: 'wf4', kind: 'valve', host: { node: 'zz' } }, { id: 'bad', kind: 'valve', host: { node: 'j1' } }, { id: 'wf5', kind: 'rocket', host: { node: 'j1' } }, { id: 'wf1', kind: 'valve', host: { node: 'j1' } }] };
const w = W.cleanWater(raw, 'm');
ok(w.fittings.length === 2 && w.fittings.map((f) => f.id).join() === 'wf1,wf2', 'cleanWater keeps a hydrant on a node and a valve on a pipe, drops a hydrant on a pipe, an unknown host, a bad id, a rocket and a repeated id', w.fittings.map((f) => f.id));
ok(w.fittings[1].host.t === 0.25, 'a valve keeps where along its pipe it is');
ok(W.cleanWater({ nodes: raw.nodes, pipes: raw.pipes }, 'm').fittings === undefined, 'a model with no fittings keeps its old shape');

const L = O.layout(w, 'm', { cover: 1.2 });
const kinds = L.fixtures.map((f) => f.kind + ':' + f.name).sort();
ok(L.pipes.length === 6 && L.pipes[0].a.z === 120 && Math.abs(L.pipes[0].b.z - 98.8) < 1e-9 && Math.abs(L.pipes[1].a.z - 98.8) < 1e-9, 'the mains lie 1.2 m under the ground; the reservoir end is at its ground', L.pipes.slice(0, 2).map((p) => [p.a.z, p.b.z]));
ok(L.fixtures.some((f) => f.kind === 'tee' && f.host.node === 'j3') && L.fixtures.some((f) => f.kind === 'bend' && f.host.node === 'j2' && Math.abs(f.angle - 90) < 0.5), 'a tee where three mains meet, a 90° bend where two turn', kinds);
ok(L.fixtures.some((f) => f.kind === 'reducer' && f.host.node === 'j4' && f.dia === 150 && f.dia2 === 100), 'a reducer where 150 mm meets 100 mm');
ok(L.fixtures.filter((f) => f.kind === 'cap').map((f) => f.host.node).sort().join() === 'j5,j6', 'a cap at each dead end');
ok(!L.fixtures.some((f) => f.host.node === 'r' && f.source === 'derived'), 'the reservoir gets no derived fitting');
const hyd = L.fixtures.find((f) => f.id === 'wf1'), val = L.fixtures.find((f) => f.id === 'wf2');
ok(hyd.x === 200 && hyd.source === 'placed' && Math.abs(val.x - 125) < 1e-9 && Math.abs(val.z - (98.8 + (99 - 1.2 - 98.8) * 0.25)) < 1e-9, 'a placed valve sits a quarter of the way along its main, at its depth', [val.x, val.z]);
const sch = O.schedule(L.fixtures, L.pipes, 'm');
ok(sch.pipes.find((p) => p.size === 200).count === 3 && Math.abs(sch.pipes.find((p) => p.size === 200).length - 300) < 1e-9, 'the pipe schedule: three 200 mm mains, 300 m', sch.pipes);
ok(sch.fittings.filter((r) => r.kind === 'cap').reduce((a, r) => a + r.count, 0) === 2 && sch.fittings.filter((r) => r.kind === 'cap').length === 2 && sch.fittings.some((r) => r.kind === 'hydrant' && r.count === 1), 'the fittings schedule counts them');
const csv = O.scheduleCsv(sch, 'm', (k) => t(k));
ok(csv.split('\r\n')[0] === 'Item,Size,Count,Length' && /Pipe,200 mm,3,300/.test(csv) && /Hydrant,—,1,/.test(csv), 'the schedule as CSV', csv.split('\r\n').slice(0, 3));
ok(!/^[=+@-]/m.test(csv.split('\r\n').slice(1).join('\n').replace(/^-/gm, '')), 'no cell can open as a formula');

// ---- the plan layers
const items = O.sceneItems(w, 'm', { mmPerUnit: 2, words: (k) => t(k) });
const layers = new Set(items.map((i) => i.layer));
ok(['C-WATR-MAIN', 'C-WATR-HYDR', 'C-WATR-VALV', 'C-WATR-FITT', 'C-WATR-TEXT'].every((l) => layers.has(l)), 'the plan has mains, hydrants, valves, fittings and text on their layers', [...layers]);
ok(items.filter((i) => i.layer === 'C-WATR-MAIN').length === 6 && items.some((i) => i.kind === 'text' && i.text === '200 mm') && items.some((i) => i.kind === 'text' && i.text === '90°'), 'six mains, sizes and the bend angle as text');
ok(items.filter((i) => i.kind === 'arc' && i.layer === 'C-WATR-HYDR').every((a) => Math.abs(a.r - 0.8) < 1e-9), 'a hydrant symbol is 1.6 mm on the sheet: 0.8 project units at 2 mm a unit', items.find((i) => i.kind === 'arc')?.r);
ok(items.filter((i) => i.kind === 'text').every((i) => Number.isFinite(i.x) && Number.isFinite(i.y) && i.mm > 0), 'every text has a place and a size');
ok(O.sceneItems({ nodes: [], pipes: [] }, 'm').length === 0, 'no mains, no items');

// ---- the project file
const p = new PJ.Project(); p.state.units = 'm';
const pts = []; let n = 1; for (let x = 0; x <= 500; x += 25) for (let y = 0; y <= 250; y += 25) pts.push({ n: n++, x, y, z: 100 - 0.01 * x, d: 'GRD' });
p.setPoints(pts, 'g.csv');
p.change('water', (s) => { s.water = w; });
const back = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
ok(back.state.water.fittings.length === 2 && back.state.water.nodes.length === 7, 'the fittings travel in the project file');
ok(back.state.water.fittings.every((f) => /^wf\d+$/.test(f.id)), 'ids are ours');
const dirty = PJ.Project.fromJSON({ ...p.toJSON(), water: { ...w, fittings: [...w.fittings, { id: 'wf9', kind: 'hydrant', host: { node: 'nope' } }, null, 5] } }).project;
ok(dirty.state.water.fittings.length === 2, 'junk fittings in a file are dropped');

// ---- LandXML out and back in
const ground = p.eg().surface, zAt = (x, y) => ground.elevationAt(x, y);
const net = O.waterNetwork(w, 'm', { zAt });
ok(net.type === 'water' && net.pipes.length === 6 && net.structures.length === 7 && net.structures.find((s) => s.id === 'j2').desc === 'Hydrant', 'the mains as a pipe network: structures, pipes, the hydrant named', net.structures.map((s) => s.desc));
const xml = LX.writeLandXml({ name: 'Water', units: 'm', points: [], surfaces: [], alignments: [], networks: [net] });
ok(/pipeNetType="water"/.test(xml) && (xml.match(/<Pipe /g) || []).length === 6 && /desc="Hydrant"/.test(xml) && /<CircPipe diameter="200"\/>/.test(xml), 'LandXML: a water PipeNetwork with six pipes, 200 mm and the hydrant');
const rd = LX.readLandXml(xml);
const wn = rd.networks.find((x) => x.type === 'water');
ok(wn && wn.pipes.length === 6 && wn.structures.length === 7, 'LandXML in: it reads back as a water network');
const wb = W.cleanWater(O.waterFromNetwork(wn, 'm'), 'm');
ok(wb.nodes.length === 7 && wb.pipes.length === 6 && wb.pipes.filter((q) => q.d === 200).length === 3, 'and becomes mains again with their sizes', wb.pipes.map((q) => q.d));
ok(wb.nodes.every((q) => Number.isFinite(q.z)), 'each node gets a ground level (from the file\'s rim or the invert plus the cover)');
ok(!rd.notes.some((x) => /storm|sanitary/i.test(x)), 'no note about an unknown network type');

// ---- IFC
p.change('wm2', (s) => { s.water = w; });
const model = IM.civilIfcModel(p, { lat: 48.75, lon: 9 });
ok(model.water && model.water.pipes.length === 6 && model.water.fixtures.some((f) => f.kind === 'hydrant') && !IM.modelEmpty(model), 'the IFC model carries the mains and their fixtures');
for (const schema of IW.SCHEMAS) {
  const r = IW.writeCivilIfc(model, { schema, now: new Date('2026-10-28T00:00:00Z'), seed: 'water' });
  const txt = r.text;
  ok((txt.match(/IFCPIPESEGMENT\(/g) || []).length + (txt.match(/IFCFLOWSEGMENT\(/g) || []).length >= 6, schema + ': six pipe segments');
  ok(/Water main/.test(txt) && /CadCraft_WaterMain/.test(txt), schema + ': named and with their property set');
  if (schema !== 'IFC2X3') ok(/IFCFIREHYDRANT|FIREHYDRANT/.test(txt) && /JUNCTION|BEND/.test(txt) && /DOMESTICCOLDWATER/.test(txt), schema + ': a hydrant, fittings and the water system');
  ok(IW.writeCivilIfc(model, { schema, now: new Date('2026-10-28T00:00:00Z'), seed: 'water' }).text === txt, schema + ': written twice, the same text');
}

// ---- Problems words and the showcase file
ok(PB.waterProblems(w, 'm', { t }).every((x) => x.text), 'the solver\'s findings are still worded');
const showcase = path.join(REPO, 'fixtures/showcase/civilcraft-water-mains.civilcraft.json');
if (fs.existsSync(showcase)) {
  const sp = PJ.Project.fromJSON(JSON.parse(fs.readFileSync(showcase, 'utf8'))).project, sw = sp.state.water;
  const res = W.solve(sw, 'm');
  ok(sw.nodes.length === 14 && sw.pipes.length === 19 && sw.fittings.filter((f) => f.kind === 'hydrant').length === 6 && sw.fittings.length === 10, 'the showcase: 14 nodes, 19 mains, six hydrants and four other fittings', [sw.nodes.length, sw.pipes.length, sw.fittings?.length]);
  ok(res.ok && res.converged !== false, 'the showcase network solves', res.problems?.map((p) => p.code));
  const lay = O.layout(sw, 'm', { zAt: (x, y) => sp.eg().surface.elevationAt(x, y) });
  ok(lay.fixtures.filter((f) => f.kind === 'tee').length >= 5 && lay.fixtures.some((f) => f.kind === 'cap'), 'it has tees and a dead-end cap', lay.fixtures.map((f) => f.kind).join());
  const pr = [...res.nodes.values()].filter((q) => q.pressure != null).map((q) => q.pressure);
  ok(Math.min(...pr) > 140 && Math.max(...pr) < 700, 'every pressure is inside 140–700 kPa: ' + Math.round(Math.min(...pr)) + '–' + Math.round(Math.max(...pr)));
}

// ---- the assistant tools
const WA = await mod('water-agent.js'), CT = await import(pathToFileURL(path.join(REPO, 'tools/mcp/contract.mjs')).href);
const tp = new PJ.Project(); tp.state.units = 'm'; tp.setPoints(pts, 'g.csv'); tp.change('w', (s) => { s.water = W.cleanWater({ ...raw, fittings: [] }, 'm'); });
const tdefs = WA.waterTools({ project: () => tp, groundAt: (x, y) => 100, changed: () => {} }), tt = Object.fromEntries(tdefs.map((d) => [d.name, d]));
for (const nm of ['water_fittings', 'water_fitting_add']) { const c = CT.checkTool(tt[nm], { app: 'civilcraft' }); ok(c.errors.length === 0, nm + ' passes the contract: ' + c.errors.join('; ')); }
const fx = tt.water_fittings.run({});
ok(fx.fixtures.some((f) => f.kind === 'tee') && fx.schedule.pipes.length === 3 && fx.cover === 1.2, 'water_fittings: the implied fittings and the schedule');
const added = tt.water_fitting_add.run({ kind: 'hydrant', node: 'j1', name: 'H-9' });
ok(/^wf\d+$/.test(added.fitting) && tp.state.water.fittings.length === 1 && tp.undoStack.at(-1).label === 'Assistant: place a hydrant', 'water_fitting_add: one hydrant, one undo step');
let e1; try { tt.water_fitting_add.run({ kind: 'hydrant', pipe: 'p1' }); } catch (e) { e1 = e.message; }
ok(/junction/.test(e1 || ''), 'a hydrant on a main is refused in words', e1);
let e2; try { tt.water_fitting_add.run({ kind: 'valve', pipe: 'zz' }); } catch (e) { e2 = e.message; }
ok(/no main zz/.test(e2 || ''), 'an unknown main is refused');
ok(tt.water_fittings.run({}).fixtures.some((f) => f.kind === 'hydrant' && f.source === 'placed'), 'the placed hydrant shows');
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);

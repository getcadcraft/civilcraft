#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-sitegen.mjs — CivilCraft 0.10 SU.1815 (parking lots) and SU.1814b (fences): the engines by hand-worked numbers, the project record, the assistant tools,
 * save and load, IFC. DOM-free. node bin/test-civilcraft-sitegen.mjs [--verbose]
 */
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
const K = await mod('parking.js'), PA = await mod('parking-apply.js'), PJ = await mod('project.js'), AG = await mod('site-gen-agent.js'), FE = await mod('fence/index.js'), LIBF = await import(pathToFileURL(path.join(REPO, 'lib/fence/index.js')).href);
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) pass++; else { fail++; console.log('FAIL', m, x !== '' ? JSON.stringify(x).slice(0, 300) : ''); } };
const near = (a, b, t, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= t, `${m}: ${a} vs ${b}`);
const rect = (w, h, x0 = 0, y0 = 0) => [{ x: x0, y: y0 }, { x: x0 + w, y: y0 }, { x: x0 + w, y: y0 + h }, { x: x0, y: y0 + h }];

// ---- the tables and the accessible count (ADA 2010 table 208.2 as typed in parking-tables.js, unverified)
const need = (n) => K.accessibleCount(n, 'us');
ok([1, 25, 26, 50, 51, 75, 76, 100, 101, 150, 151, 200, 201, 300, 301, 400, 401, 500, 501, 1000].map(need).join() === '1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,11,20', 'table 208.2 rows', [1, 25, 26, 50, 51, 75, 76, 100, 101, 150, 151, 200, 201, 300, 301, 400, 401, 500, 501, 1000].map(need).join());
ok(need(1001) === 21 && need(1100) === 21 && need(1101) === 22, '1001 and over: 20 plus 1 per 100 or fraction');
ok(K.vanCount(1) === 1 && K.vanCount(6) === 1 && K.vanCount(7) === 2, 'one van in six, rounded up');
ok(K.accessibleCount(40, 'custom', { percent: 5, min: 1 }) === 2 && K.accessibleCount(10, 'custom', { percent: 5, min: 1 }) === 1, 'custom rule');
ok(K.defaults('ft').stallW === 9 && K.defaults('ft').stallL === 18 && K.defaults('ft').aisleW === 24, 'feet defaults');
near(K.defaults('m').stallW, 2.75, 1e-9, 'metric defaults: 9 ft = 2.7432 m, rounded to 5 cm');
const tables = (await mod('parking-tables.js')).default;
ok(Object.values(tables.regions).every((r) => r.accessible.source && r.stall.source && r.aisle.source && r.accessible.verified === false), 'every table is cited and marked unverified');

// ---- the layout: 55 x 18.3 m is exactly one double module: 20 columns of 2.75 m, two rows
let L = K.layout(rect(55, 18.3), { units: 'm', maxRun: 0, endIslands: false, orientation: 0 });
ok(L.counts.total === 39 && L.counts.accessible === 2 && L.counts.van === 1 && L.counts.accessAisles === 1, '55 x 18.3 m: 40 slots, one used as an access aisle: 39 spaces, 2 accessible, 1 van', L.counts);
ok(L.counts.required === 2 && L.problems.length === 0, 'two needed (table: 26 to 50 spaces) and none missing', L.problems);
near(L.area.stalls, 39 * 2.75 * 5.5, 1e-6, 'stall area = 39 x 2.75 x 5.5');
ok(L.stalls.every((s) => s.poly.every((p) => p.x > -1e-6 && p.x < 55 + 1e-6 && p.y > -1e-6 && p.y < 18.3 + 1e-6)), 'every stall inside the outline');
// accessible spaces sit nearest the entrance (the first corner, the origin)
const accs = L.stalls.filter((s) => s.kind !== 'standard'), far = L.stalls.filter((s) => s.kind === 'standard');
const cx = (s) => s.poly.reduce((a, p) => a + p.x, 0) / 4, cy = (s) => s.poly.reduce((a, p) => a + p.y, 0) / 4, dd = (s) => Math.hypot(cx(s), cy(s));
ok(Math.max(...accs.map(dd)) < far.map(dd).sort((a, b) => a - b)[4], 'accessible spaces are among the nearest to the entrance');
// no overlaps between stalls: sum of polygon areas equals counted areas and bounding boxes of neighbours do not overlap in the row
ok(new Set(L.stalls.map((s) => s.row + ':' + s.col)).size === L.stalls.length, 'no two stalls share a slot');
// islands: end islands and one every 10 stalls
let L2 = K.layout(rect(55, 18.3), { units: 'm', maxRun: 10, endIslands: true, orientation: 0 });
ok(L2.counts.islands > 0 && L2.counts.total < 39, 'islands take slots', L2.counts);
ok(L2.islands.every((i) => i.area > 0), 'islands have area');
// angled stalls: 60 degrees, 9 x 18 ft: pitch 9 / sin 60 = 10.392 ft, depth 18 sin 60 + 9 cos 60 = 20.088 ft
const g60 = K.layout(rect(100, 60), { units: 'ft', angle: 60, orientation: 0, maxRun: 0, endIslands: false });
const s0 = g60.stalls[0], w60 = Math.hypot(s0.poly[1].x - s0.poly[0].x, s0.poly[1].y - s0.poly[0].y);
near(w60, 9 / Math.sin(Math.PI / 3), 1e-6, 'pitch along the aisle edge is W / sin a'); near(Math.abs(s0.poly[3].y - s0.poly[0].y), 18 * Math.sin(Math.PI / 3) + 9 * Math.cos(Math.PI / 3), 1e-6, 'depth is L sin a + W cos a');
ok(g60.counts.total > 0 && g60.problems.length === 0, 'angled layout fits', g60.problems);
// a polygon with a hole: the hole's stalls are skipped
const lh = K.layout(rect(55, 18.3), { units: 'm', maxRun: 0, endIslands: false, orientation: 0, holes: [rect(5, 5, 20, 2)] });
ok(lh.counts.total < 39 && lh.stalls.every((s) => !(s.poly.some((p) => p.x > 20.01 && p.x < 24.99 && p.y > 2.01 && p.y < 6.99))), 'stalls keep clear of a hole');
// setback 3 m
const lsb = K.layout(rect(55, 18.3), { units: 'm', maxRun: 0, endIslands: false, orientation: 0, setback: 3 });
ok(lsb.counts.total < L.counts.total, 'a setback takes stalls');
// nothing fits
ok(K.layout(rect(2, 2), { units: 'm' }).problems.some((p) => p.code === 'nofit'), 'a lot too small says so'); ok(K.layout([{ x: 0, y: 0 }, { x: 1, y: 1 }]).problems[0].code === 'boundary', 'bad outline');
// accessible override and shortfall
const lo = K.layout(rect(55, 18.3), { units: 'm', maxRun: 0, endIslands: false, orientation: 0, accessible: 6 });
ok(lo.counts.accessible === 6 || lo.problems.some((p) => p.code === 'access.short'), 'six accessible asked for');
// narrow stalls fail the accessible width
ok(K.layout(rect(55, 18.3), { units: 'm', maxRun: 0, endIslands: false, orientation: 0, stallW: 2.0 }).problems.some((p) => p.code === 'access.width'), 'a 2.0 m stall is narrower than 96 in');
// an L shaped lot, orientation tried from the edges
const Lshape = [{ x: 0, y: 0 }, { x: 60, y: 0 }, { x: 60, y: 20 }, { x: 25, y: 20 }, { x: 25, y: 50 }, { x: 0, y: 50 }];
const lL = K.layout(Lshape, { units: 'm' }); ok(lL.counts.total > 40 && lL.stalls.every((s) => s.poly.every((p) => p.x >= -1e-6 && p.y >= -1e-6 && !(p.x > 25 + 1e-6 && p.y > 20 + 1e-6))), 'an L shaped lot keeps every stall inside', lL.counts);
// drawing and csv
ok(K.sceneItems(L, [{ x: 1, y: 1 }]).some((i) => i.layer === 'C-PARK-ADA') && K.scheduleCsv(L, 'm').includes('"stalls","39"'), 'plan items and CSV');

// ---- the dish: a lot on the plane z = 0.02 x, one drain at the west edge
const dr = [{ x: 0, y: 9 }];
const D = K.dishGrade(rect(55, 18.3), dr, { zAt: (x) => 0.02 * x, fallPct: 1.5, units: 'm', step: 2.75, edgeTol: 0.1 });
near(D.fallPct, 1.5, 0, 'fall kept'); ok(D.spots.length > 100, 'spots on a grid', D.spots.length);
// each spot z = z0 + s * distance to the drain
const sp = D.spots.find((p) => Math.abs(p.x - 20) < 2 && Math.abs(p.y - 9) < 2); near(sp.z, D.z0 + 0.015 * Math.hypot(sp.x - 0, sp.y - 9), 1e-9, 'z rises from the drain at 1.5 percent');
// balanced: mean z equals mean ground over the same cells
const cells = D.spots.filter((p) => !(p.x === 0 && p.y === 9)); const meanZ = cells.reduce((a, p) => a + p.z, 0) / cells.length, meanG = cells.reduce((a, p) => a + 0.02 * p.x, 0) / cells.length;
near(meanZ, meanG, 0.02, 'balanced on the ground');
ok(D.cut > 0 && D.fill > 0 && Math.abs(D.cut - D.fill) / (D.cut + D.fill) < 0.15, 'cut and fill roughly balance', [D.cut, D.fill]);
ok(D.problems.some((p) => p.code === 'edgestep'), 'the edge step is reported where the dish leaves the ground', D.edgeStep);
ok(K.dishGrade(rect(10, 10), [], { units: 'm' }).problems[0].code === 'nodrain', 'no drains is a problem');
ok(K.dishGrade(rect(55, 18.3), dr, { zAt: () => 0, fallPct: 3, units: 'm', maxFallPct: 2.0833 }).problems.some((p) => p.code === 'fall.steep'), 'a 3 percent fall is over the 1:48 limit');
// drains on the aisle centre lines, none closer than the spacing
const dd2 = K.pickDrains(L, rect(55, 18.3), 30); ok(dd2.length >= 2 && dd2.every((a, i) => dd2.every((b, j) => i === j || Math.hypot(a.x - b.x, a.y - b.y) >= 30 - 1e-9)), 'drains at least 30 m apart', dd2);

// ---- into a project
const mk = () => { const p = new PJ.Project(); const pts = []; let n = 1; for (let x = -10; x <= 110; x += 5) for (let y = -10; y <= 70; y += 5) pts.push({ n: String(n++), x, y, z: 100 + 0.01 * x + 0.005 * y, d: 'G' }); p.setPoints(pts, 'g.csv'); p.state.units = 'm'; return p; };
const seed = JSON.parse(fs.readFileSync(path.join(APP, 'landscape/plants-seed.json'), 'utf8')).species;
const PS = (await mod('landscape/plants.js')).readPlants(JSON.parse(fs.readFileSync(path.join(APP, 'landscape/plants-seed.json'), 'utf8'))).library.species; void seed;
const p = mk(), zAt = (x, y) => { const z = p.eg().surface?.elevationAt(x, y); return Number.isFinite(z) ? z : null; };
ok(zAt(50, 30) !== null, 'the project has an existing surface');
const u0 = p.undoStack.length;
const r = PA.buildLot(p, { name: 'Lot A', boundary: rect(80, 40, 10, 10), opts: { orientation: 0 } }, { zAt, seed: PS });
ok(r.ok && /^pk\d+$/.test(r.id) && r.layout.counts.total > 80, 'a lot is built', r.problems);
ok(p.undoStack.length === u0 + 1, 'one undo step'); const L1 = p.state.landscape;
ok(L1.grading.length === 1 && L1.grading[0].kind === 'area' && L1.grading[0].spots.length > 100, 'a grading area with spot elevations');
ok(L1.hardscape.length === 1 && L1.hardscape[0].kind === 'paving', 'a paving'); ok(L1.beds.length === r.layout.counts.islands && L1.plants.length > 0, 'a bed per island and trees where wide enough', [L1.beds.length, L1.plants.length]);
ok(p.graded().surface !== null && p.graded().items.some((i) => i.id === r.made.grading && !i.problems?.length), 'the proposed surface takes the grading', p.graded().items?.map((i) => i.problems));
ok(r.volumes && Number.isFinite(r.volumes.cut) && Number.isFinite(r.volumes.fill), 'the project\'s own volumes: cut and fill', r.volumes);
// the proposed surface falls towards the drain
const d0 = r.drains[0], gs = p.graded().surface; const zd = gs.elevationAt(d0.x, d0.y), zf = gs.elevationAt(d0.x + 8, d0.y); ok(Number.isFinite(zd) && Number.isFinite(zf) && zf > zd, 'ground 8 m from a drain is higher than the drain', [zd, zf]);
// save and load
const js = JSON.parse(JSON.stringify(p.toJSON())); ok(js.parking?.length === 1 && js.parking[0].made.grading === r.made.grading, 'saved'); const back = PJ.Project.fromJSON(js).project;
ok(back.state.parking?.[0]?.id === r.id && back.state.parking[0].boundary.length === 4, 'loaded'); ok(PJ.Project.fromJSON({ ...js, parking: [{ id: 'bad', boundary: [] }, { id: 'pk9', boundary: [{ x: 0, y: 0 }] }, 5] }).project.state.parking === undefined, 'bad rows dropped on load');
// rebuild replaces what it made; remove takes it all away
const r2 = PA.buildLot(p, { id: r.id, boundary: rect(80, 40, 10, 10), opts: { orientation: 0, fallPct: 2 } }, { zAt, seed: PS }); ok(r2.ok && r2.id === r.id && p.state.parking.length === 1 && p.state.landscape.grading.length === 1 && p.state.landscape.hardscape.length === 1, 'rebuilding replaces the grading and the paving');
p.undo?.(); ok(p.state.landscape.grading[0].id === r.made.grading, 'undo brings back the first build');
ok(PA.removeLot(p, r.id) && !p.state.parking && !p.state.landscape.grading.length && !p.state.landscape.hardscape.length && !p.state.landscape.beds.length && !p.state.landscape.plants.length, 'remove takes everything it made');
ok(PA.removeLot(p, 'pk999') === false, 'removing an unknown lot is false');
// no existing ground: the layout still works, the grade says so
const pn = new PJ.Project(); pn.state.units = 'm'; const rn = PA.buildLot(pn, { boundary: rect(55, 18.3) , opts: { orientation: 0 } }, { zAt: () => null, seed: PS });
ok(rn.ok && rn.problems.some((q) => q.code === 'noground'), 'without ground it lays out and says no cut or fill'); 

// ---- assistant tools
let changed = 0; const pt = mk();
const tools = Object.fromEntries(AG.siteGenTools({ project: () => pt, seed: () => PS, zAt: (x, y) => { const z = pt.eg().surface?.elevationAt(x, y); return Number.isFinite(z) ? z : null; }, changed: () => changed++ }).map((d) => [d.name, d]));
ok(['parking_layout', 'parking_build', 'parking_remove', 'fence_build', 'fence_list'].every((k) => tools[k] && ['read', 'edit'].includes(tools[k].group) && tools[k].description && (tools[k].inputSchema || tools[k].group === 'read')), 'five tools, each read or edit with a description');
const before = pt.undoStack.length, pv = tools.parking_layout.run({ boundary: rect(55, 18.3), orientation: 0 });
ok(pt.undoStack.length === before && !pt.state.parking && pv.spaces > 30 && pv.note.includes('NOT checked'), 'parking_layout writes nothing and says its tables are unchecked', pv.spaces);
const pb = tools.parking_build.run({ boundary: rect(80, 40, 10, 10), orientation: 0, name: 'MCP lot' });
ok(pb.id && pb.spaces > 80 && pb.made.grading && pt.state.parking.length === 1 && changed === 1 && pt.undoStack.length === before + 1, 'parking_build writes the lot in one undo step', pb);
ok(pb.grade && pb.grade.cut > 0 && pb.volumes, 'and returns cut and fill');
pt.state.parcels = [{ id: 'r1', name: 'North lot', pts: rect(55, 18.3, 5, 5) }]; ok(tools.parking_layout.run({ parcel: 'north lot', orientation: 0 }).spaces > 30, 'a parcel can be named');
let err = ''; try { tools.parking_layout.run({}); } catch (e) { err = e.message; } ok(/boundary/i.test(err), 'no outline is an error');
ok(tools.parking_remove.run({ id: pb.id }).removed === pb.id && !pt.state.parking, 'parking_remove');
const fb = tools.fence_build.run({ points: [{ x: 0, y: 0 }, { x: 24, y: 0 }], height: 1.8, postSpacing: 2.4, gates: [{ station: 10, width: 1, name: 'Side' }] });
ok(/^fc\d+$/.test(fb.id) && fb.posts === 13 && fb.gates === 1 && pt.state.fences.length === 1 && fb.schedule.some((r2) => r2.item === 'gate'), 'fence_build', fb);
ok(tools.fence_list.run().length === 1 && tools.fence_list.run()[0].length === 24, 'fence_list');
pt.state.parcels = [{ id: 'r2', name: 'Yard', pts: rect(10, 10) }]; const fp = tools.fence_build.run({ feature: 'Yard', postSpacing: 2.5 }); ok(fp.posts === 16 && fp.length === 40, 'a parcel is fenced as a closed path', fp);
// fence save and load, copy is the lib
ok(JSON.parse(JSON.stringify(pt.toJSON())).fences.length === 2 && PJ.Project.fromJSON(JSON.parse(JSON.stringify(pt.toJSON()))).project.state.fences.length === 2, 'fences save and load');
ok(fs.readFileSync(path.join(REPO, 'lib/fence/index.js'), 'utf8') === fs.readFileSync(path.join(APP, 'fence/index.js'), 'utf8'), 'the CivilCraft copy is the lib (tools/fence/sync.mjs)'); void FE; void LIBF;
// ---- IFC
const IM = await mod('ifc-civil-model.js'), IC = await mod('ifc-civil.js');
const model = IM.civilIfcModel(pt);
ok(!!model, 'an IFC model is built', Object.keys(IM));
if (model) {
  ok(model.fences?.length === 2 && model.fences[0].posts.length === 13 && IM.modelEmpty(model) === false, 'the model carries the fences');
  const text = IC.writeCivilIfc(model, {}).text;
  ok(/IFCMEMBER\(/.test(text) && /IFCRAILING\(/.test(text) && /IFCDOOR\(/.test(text) && /\.POST\./.test(text) && /\.GATE\./.test(text), 'IFC holds posts, panels and a gate', text.length);
}
console.log(`civilcraft sitegen: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);

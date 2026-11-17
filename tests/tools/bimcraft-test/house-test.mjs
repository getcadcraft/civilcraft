/* SPDX-License-Identifier: Apache-2.0 */
/**
 * house-test.mjs: the small house checked without a page (0.10 BK.4, BK.80, BK.10; session bk-r3-scale-10). DOM-free, run by
 *   node bin/test-bimcraft.mjs --house
 * It opens THE fixture (fixtures/bimcraft/small-house.ifc, written by make-small-house.mjs; its numbers are HOUSE there) and
 * checks, against values worked out by hand: what the file holds (walls, doors, windows, rooms, floors, ceilings, the roof, grids,
 * section lines), the four elevations and the two sections (res-views.js), the drawing set on sheets with title blocks
 * (res-sheets.js), that annotations are sized from paper heights by the one rule (annoscale.js through anno-scale-bim.js) and keep
 * their paper size when a view's scale goes from 1:100 to 1:50, the building's annotation standard in the file (anno-standard.js),
 * and that the file saved and opened again is the same house. The page run is tools/bimcraft-test/browser-house.mjs.
 */
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { HOUSE as H } from './make-small-house.mjs';

export async function houseMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + detail + ')' : '')); };
  const near = (a, b, tol = 1) => Math.abs(a - b) <= tol;
  const A = await import(pathToFileURL(path.join(ROOT, 'lib/annoscale/annoscale.js')).href);
  const AB = await import(path.join(APP, 'anno-scale-bim.js'));
  const AS = await import(path.join(APP, 'anno-standard.js'));
  const HK = await import(path.join(APP, 'defaults-hook.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const V = await import(path.join(APP, 'res-views.js'));
  const SH = await import(path.join(APP, 'res-sheets.js'));
  const MG = await import(path.join(APP, 'model-grids.js'));
  const CV = await import(path.join(APP, 'comforts-views.js'));
  const EL = await import(path.join(APP, 'res-elec.js'));
  const { viewerToPlan } = await import(path.join(APP, 'model-plan.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { drift } = await import(pathToFileURL(path.join(ROOT, 'tools/annoscale/sync.mjs')).href);
  const open = async (bytes) => {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    const model = await quiet((b) => eng.load(b))(bytes);
    const ed = new IfcEditor(WebIFC, eng);
    return { eng, model, ed, w: () => new ModelWriter(WebIFC, ed.api, ed.mid) };
  };
  const counts = (ed, w) => { const s = OPS.snapshotModel(ed); return { walls: s.walls.length, doors: s.openings.filter((o) => o.kind === 'door').length, windows: s.openings.filter((o) => o.kind === 'window').length, rooms: s.derived.spaces.length, floors: s.derived.floors.length, ceilings: s.derived.ceilings.length, roofs: s.derived.roofs.length, grids: MG.readGrids(w).flatMap((g) => g.axes).length, sections: SH.readSectionLines(w).length }; };

  console.log('== BK.10 the rule (lib/annoscale): paper heights, model sizes, a scale change');
  // by hand: a 6 pt font has capitals 6 x 25.4 / 72 x 0.718 = 1.5198 mm tall; 2.5 mm capitals need 2.5 / 0.718 / (25.4 / 72) = 9.8699 pt
  ok(A.fontPt('dimension') === 6 && A.fontPt('room') === 7.5 && A.fontPt('title') === 9 && A.factor('tag') === 1, 'nothing set: BimCraft\'s own sizes (6, 7.5 and 9 pt), every gap factor 1');
  ok(near(A.paperMm('dimension'), 1.52, 0.001), 'the own 6 pt dimension text is 1.52 mm of capital height on paper', A.paperMm('dimension'));
  const std25 = A.cleanStandard({ heights: { text: 2.5, dimension: 2.5, room: 3.5, bogus: 3, tag: 0.1, grid: '4' } });
  ok(JSON.stringify(std25.standard.heights) === '{"text":2.5,"dimension":2.5,"room":3.5}' && std25.ignored.sort().join() === 'bogus,grid,tag', 'a standard is cleaned: unknown kinds, a height under 0.5 mm and a text value are left out and named');
  ok(near(A.fontPt('dimension', std25.standard), 9.8699, 0.0005) && near(A.factor('dimension', std25.standard), 9.8699 / 6, 0.0001), '2.5 mm on paper = a 9.87 pt font; gaps grow by 1.645', A.fontPt('dimension', std25.standard));
  ok(A.modelHeight('text', 100, std25.standard) === 250 && A.modelHeight('text', 50, std25.standard) === 125 && near(A.modelHeight('text', 100, std25.standard, 1000), 0.25, 1e-12) && near(A.modelHeight('text', 48, std25.standard, 25.4), 2.5 * 48 / 25.4, 1e-9), '2.5 mm text is 250 mm tall in the model at 1:100, 125 mm at 1:50, 0.25 in a drawing in metres, 4.72 in a drawing in inches at 1:48');
  ok(A.rescale(250, 100, 50) === 125 && A.rescale(125, 50, 100) === 250 && Number.isNaN(A.rescale(250, 0, 50)) && A.rescale(3, 1, 0.5) === 1.5, 'a scale change 1:100 to 1:50 halves the model size and back; 2:1 enlarged works; a scale of 0 is refused');
  const SG = await import(path.join(APP, 'spaces-geom.js'));
  ok(A.modelOf(2.5, 100) === 250 && SG.tagSize(['101', 'Living room'], 2.5, 100).hgt === 250 && SG.tagSize(['101', 'Living room'], 2.5, 50).hgt === 125 && SG.tagSize(['x'], 3.5, 50).gap === 262.5, 'room and area tags use the same sum (spaces-geom.js tagSize): 2.5 mm is 250 mm at 1:100 and 125 mm at 1:50; lines 1.5 heights apart');
  ok(drift(['bimcraft', 'cadcraft']).length === 0, 'BimCraft\'s and CadCraft\'s annoscale.js are byte copies of lib/annoscale/annoscale.js');

  console.log('== BK.4 the fixture: one small house, numbers worked by hand');
  const file = path.join(ROOT, H.file);
  const B = await open(new Uint8Array(fs.readFileSync(file)));
  const snap = OPS.snapshotModel(B.ed), w = B.w();
  const c0 = counts(B.ed, w);
  ok(JSON.stringify(c0) === JSON.stringify({ walls: 5, doors: 2, windows: 3, rooms: 2, floors: 2, ceilings: 2, roofs: 1, grids: 5, sections: 2 }), 'five walls, two doors, three windows, two rooms each with a floor and a ceiling, one roof, five grid lines, two section lines', JSON.stringify(c0));
  const ext = snap.walls.filter((x) => x.typeKey === H.ext.type), int = snap.walls.filter((x) => x.typeKey === H.int.type);
  ok(ext.length === 4 && ext.every((x) => near(x.t, 300, 0.01)) && ext.map((x) => Math.round(x.len)).sort().join() === '10000,10000,7000,7000' && int.length === 1 && near(int[0].t, 100, 0.01) && near(int[0].len, 7000), 'outside walls 300 thick, 10 000 and 7 000 long on their centre lines; the partition 100 thick, 7 000 long');
  ok(snap.openings.filter((o) => o.kind === 'door').map((o) => o.mark).join() === 'D1,D2' && snap.openings.filter((o) => o.kind === 'window').map((o) => o.mark).join() === 'W1,W2,W3', 'door marks D1, D2 and window marks W1, W2, W3');
  ok(snap.derived.spaces.map((s) => s.number + ' ' + s.name).join() === '101 Living room,102 Bedroom', 'rooms 101 Living room and 102 Bedroom');
  const loops = OPS.loopsOf(B.ed, snap.levels[0].id);
  const areas = (loops.rooms || []).map((r) => Math.round(r.area)).sort((a, b) => a - b);
  ok(areas.length === 2 && areas.every((a) => near(a, H.roomArea, 2000)), 'each room is 4 800 x 6 700 mm inside = 32.16 m2 ((5 000 - 150 - 50) x (7 000 - 300))', areas.map((a) => (a / 1e6).toFixed(3)).join(', '));
  const axes = MG.readGrids(w).flatMap((g) => g.axes);
  ok(axes.map((x) => x.tag).join() === H.grid.tags.join() && near(axes.find((x) => x.tag === '2').a[0], 5000) && near(axes.find((x) => x.tag === 'B').a[1], 7000) && near(axes.find((x) => x.tag === '1').a[1], -1500), 'grids 1, 2, 3 at x = 0, 5 000, 10 000 and A, B at y = 0, 7 000, running 1 500 past the house');
  const secs = SH.readSectionLines(w);
  ok(secs.map((s) => s.name).join() === 'A,B' && near(SH.sectionDir(secs[0]).dir[0], -1, 1e-9) && near(SH.sectionDir(secs[1]).dir[1], 1, 1e-9), 'Section A looks west, Section B looks north');

  console.log('== BK.4 four elevations and two sections from the same model');
  const g = snap.levels[0];
  const M = viewerToPlan(B.eng.api.GetCoordinationMatrix(B.model.modelID), w.storeyWorld(g.id));
  const els = V.modelTriangles(B.model, M);
  const gAxes = MG.toPlan(w, g.id, MG.readGrids(w)).flatMap((x) => x.axes);
  const fmt = (mm) => String(Math.round(mm));
  const elev = {};
  for (const [side, dir] of Object.entries(V.elevationDirs)) {
    const view = { ...V.projectView(els, { dir }), grids: MG.gridsInView(gAxes, dir) };
    const r = [dir[1], -dir[0]], xs = snap.walls.flatMap((x) => [x.a, x.b].flatMap((q) => [q[0] * r[0] + q[1] * r[1] - x.t / 2, q[0] * r[0] + q[1] * r[1] + x.t / 2]));
    view.notes = CV.viewNotes(view, { kind: 'elevation', dir, base: g.elevation, openings: [], width: { x0: Math.min(...xs), x1: Math.max(...xs) }, levels: snap.levels.map((l) => ({ name: l.name, elevation: l.elevation })), fmt });
    elev[side] = view;
  }
  // by hand: outside faces 150 past the centre lines, the roof 300 past those: 10 000 + 300 + 600 = 10 900; 7 000 + 300 + 600 = 7 900
  const wOf = (v) => v.bounds.x1 - v.bounds.x0;
  ok(near(wOf(elev.south), 10900, 30) && near(wOf(elev.north), 10900, 30) && near(wOf(elev.east), 7900, 30) && near(wOf(elev.west), 7900, 30), 'south and north elevations 10 900 wide, east and west 7 900 (walls + eaves)', Object.values(elev).map((v) => wOf(v).toFixed(0)).join(', '));
  const wallH = snap.walls[0].height;
  // a hip roof at 30 degrees over the 7 900 wide eaves rises 3 950 x tan 30 = 2 280 above the eaves
  ok(Object.values(elev).every((v) => v.bounds.y1 > wallH + 1500 && v.bounds.y1 < wallH + 3200), 'every elevation shows the roof over the ' + Math.round(wallH) + ' mm walls (top ' + Math.round(elev.south.bounds.y1) + ')');
  const flat = (v, h, min = 600, max = 1200) => v.lines.filter((l) => near(l[1], h, 3) && near(l[3], h, 3) && Math.abs(l[2] - l[0]) > min && Math.abs(l[2] - l[0]) < max).length;
  ok(flat(elev.south, 2032) >= 2 && flat(elev.south, 508) >= 1, 'south: the front door\'s head and the window\'s sill and head are drawn (door 914 x 2 032, window sill 508)');
  ok(flat(elev.west, 508) >= 1 && flat(elev.north, 508) >= 1 && flat(elev.east, 508) === 0, 'west and north each show their window; the east wall has none');
  ok(elev.south.grids.map((x) => x.tag).join() === '1,2,3' && elev.east.grids.map((x) => x.tag).sort().join() === 'A,B', 'the elevations carry the grids seen end on: 1, 2, 3 on south, A, B on east');
  ok(elev.south.notes.some((n) => n.t === 'level' && /Ground floor/.test(n.name)) && elev.south.notes.some((n) => n.t === 'dim' && n.text === '10300'), 'south elevation notes: the level mark and the building\'s width over its outside faces (10 300)', elev.south.notes.filter((n) => n.t === 'dim').map((n) => n.text).join());
  const secView = (sl) => { const sd = SH.sectionDir(sl); return V.projectView(els, { dir: sd.dir, cut: { o: sd.o }, far: sl.depth }); };
  const sA = secView(secs[0]), sB = secView(secs[1]);
  const wallsCut = (v) => new Set(v.cuts.filter((c) => c.cls === 'IfcWall').map((c) => c.key)).size;
  ok(wallsCut(sA) === 2 && sA.cuts.some((c) => /Roof|Slab/.test(c.cls)), 'Section A cuts the south and north walls, the floor and the roof', [...new Set(sA.cuts.map((c) => c.cls))].join());
  ok(wallsCut(sB) === 3, 'Section B cuts the west wall, the partition and the east wall', wallsCut(sB));
  ok(near(wOf(sA), 7900, 30) && near(wOf(sB), 10900, 30), 'Section A is 7 900 wide, Section B 10 900: the same house as the elevations');

  console.log('== BK.80 the drawing set on sheets, text and dimensions sized by the BK.10 rule');
  // a plan scene with the house's numbers (the page run, browser-house.mjs, uses the real plan scene)
  const scene = (ratio) => ({ walls: snap.walls.map((x, i) => { const u = [(x.b[0] - x.a[0]) / x.len, (x.b[1] - x.a[1]) / x.len], n = [-u[1] * x.t / 2, u[0] * x.t / 2]; const p = [[x.a[0] + n[0], x.a[1] + n[1]], [x.b[0] + n[0], x.b[1] + n[1]], [x.b[0] - n[0], x.b[1] - n[1]], [x.a[0] - n[0], x.a[1] - n[1]]]; return { key: i, poly: p, pieces: [p] }; }),
    symbols: [], cut: [], below: [], scale: ratio, rooms: [{ key: 'r', at: [2500, 3500], label: ['Living room', '32.16 m2'] }], dims: [{ a: [0, 0], b: [10000, 0], off: -900, text: '10000' }],
    grids: axes.map((x) => ({ tag: x.tag, a: x.a, b: x.b, bubbles: 'both' })) });
  const input = (ratio) => ({ plans: [{ ref: 'p', title: 'Ground floor plan', scene: scene(ratio) }], elevations: Object.entries(elev).map(([k, view]) => ({ ref: k, title: k + ' elevation', view })),
    sections: [{ ref: 'A', title: 'Section A', view: sA }, { ref: 'B', title: 'Section B', view: sB }],
    schedules: [{ ref: 'doors', title: 'Doors', head: ['Mark', 'Type', 'Size'], rows: snap.openings.filter((o) => o.kind === 'door').map((o) => [o.mark, o.typeName, o.sizeName]), total: null }] });
  const texts = (s, re) => s.items.filter((it) => it.t === 'text' && re.test(it.s));
  const opts = { paper: 'a1', units: 'mm', project: H.name, date: '2026-11-11' };
  AB.setAnnoStandard(null);
  const set0 = SH.buildSet(input(0), opts);
  ok(set0.map((s) => s.number).join() === 'A-101,A-201,A-202,A-301,A-401', 'the set: plan A-101, elevations A-201 and A-202, sections A-301, schedules A-401', set0.map((s) => s.number).join());
  ok(set0.every((s) => texts(s, new RegExp('^' + s.number + '$')).length === 1 && texts(s, /Small house {4}2026-11-11/).length === 1), 'every sheet has its title block: number, project and date');
  ok(set0[0].scale === '1:50' && set0[1].views.every((v) => v.scale === '1:50'), 'plan and elevations at 1:50 on A1');
  const pdf = SH.setPdf(set0, { paper: 'a1', title: H.name });
  ok(Buffer.from(pdf.subarray(0, 8)).toString('latin1') === '%PDF-1.4' && (Buffer.from(pdf).toString('latin1').match(/\/Type \/Page\b/g) || []).length === 5, 'the set as a PDF: five pages');
  // one plan on a sheet at 1:100 and at 1:50: the model doubles on paper, the text keeps its size
  const one = (ratio) => SH.composeSheet({ number: 'A-101', title: 'Plan', views: [{ kind: 'plan', ref: 'p', x: 400, y: 300, ratio }] }, input(ratio), opts);
  const at = (s) => { const d = texts(s, /^10000$/)[0], r = texts(s, /^Living room$/)[0], gb = texts(s, /^2$/)[0], wl = s.items.filter((it) => it.t === 'fill' && it.polys?.[0]?.length === 4)[0]; return { dim: d.size, room: r.size, grid: gb.size, wallW: Math.abs(wl.polys[0][1][0] - wl.polys[0][0][0]) }; };
  const p100 = at(one(100)), p50 = at(one(50));
  ok(near(p100.wallW, 100, 0.001) && near(p50.wallW, 200, 0.001), 'the 10 000 mm wall is 100 mm long on paper at 1:100 and 200 mm at 1:50 (the model is full size)');
  ok(p100.dim === 6 && p50.dim === 6 && p100.room === 7.5 && p50.room === 7.5 && p100.grid === 6.5 && p50.grid === 6.5, 'dimension text, the room name and the grid letter keep their paper size at both scales (6, 7.5, 6.5 pt: BimCraft\'s own)');
  const base100 = JSON.stringify(one(100).items);
  AB.setAnnoStandard({ heights: { dimension: 2.5, room: 3.5, grid: 3, title: 5, text: 2.5, tag: 2.5, schedule: 2.5 } });
  const q100 = at(one(100)), q50 = at(one(50));
  ok(near(q100.dim, 9.8699, 0.001) && q50.dim === q100.dim && near(q100.room, 3.5 / 0.718 * 72 / 25.4, 0.001) && q50.room === q100.room && near(q100.grid, 3 / 0.718 * 72 / 25.4, 0.001), 'the building\'s standard (dimension 2.5 mm, room names 3.5 mm, grid letters 3 mm): the same paper sizes at 1:100 and at 1:50', JSON.stringify(q100));
  ok(near(q100.wallW, 100, 0.001) && near(q50.wallW, 200, 0.001), 'the walls are untouched by the standard');
  const set1 = SH.buildSet(input(0), opts);
  const titleOf = (s) => s.items.find((it) => it.t === 'text' && /elevation$/.test(it.s));
  ok(near(titleOf(set1[1]).size, 5 / 0.718 * 72 / 25.4, 0.001) && titleOf(set0[1]).size === 9, 'view titles on the elevation sheet: 5 mm capitals by the standard, 9 pt before');
  const lv = (s) => s.items.find((it) => it.t === 'text' && it.s === 'Ground floor');
  ok(lv(set0[1])?.size === 6.5 && near(lv(set1[1])?.size, 2.5 / 0.718 * 72 / 25.4, 0.001), 'the level mark on an elevation follows the tag height (2.5 mm)');
  const rowsY = (s) => s.items.filter((it) => it.t === 'text' && /^D[12]$/.test(it.s)).map((it) => it.y);
  ok(near(rowsY(set0[4])[0] - rowsY(set0[4])[1], 5, 1e-6) && near(rowsY(set1[4])[0] - rowsY(set1[4])[1], 5 * (2.5 / 0.718 * 72 / 25.4) / 7, 1e-6), 'schedule rows are 5 mm apart with the own text and grow with a 2.5 mm standard (8.2 mm)');
  AB.setAnnoStandard(null);
  ok(JSON.stringify(one(100).items) === base100, 'the standard cleared: the sheet is item for item what it was');
  // plan symbols and their tags follow the view's scale
  AB.setAnnoRatio(0);
  ok(EL.symbolScale('mm') === 50 && EL.symbolScale('ftin') === 48, 'a view with no scale of its own: plan symbols at 1:50 / 1:48, as before');
  AB.setAnnoRatio(100);
  ok(EL.symbolScale('mm') === 100 && AB.sceneAnno(100).ratio === 100 && near(AB.sceneAnno(100).em.dimension, 6 * 25.4 / 72 * 100, 1e-9) && AB.sceneAnno(0) === null, 'a 1:100 view: symbols twice as large in the model (the same on paper); on screen its dimension text is 212 mm of model tall (6 pt x 100)');
  AB.setAnnoRatio(0);

  console.log('== BK.10 the building\'s annotation standard in the file; the office\'s for a new building');
  ok(Object.keys(AS.readAnnoStandard(w).heights).length === 0, 'the fixture has no standard of its own: BimCraft\'s own sizes');
  B.ed.modelChange(AS.saveAnnoStandard({ dimension: 2.5, room: 3.5 }));
  ok(JSON.stringify(AS.readAnnoStandard(B.w()).heights) === '{"dimension":2.5,"room":3.5}', 'saved: dimension 2.5 mm and room names 3.5 mm on IfcProject (CadCraft_AnnotationStandard)');
  let key = ''; try { B.ed.modelChange(AS.saveAnnoStandard({ dimension: 80 })); } catch (e) { key = e.key; }
  ok(key === 'model.err.anno.height' && JSON.stringify(AS.readAnnoStandard(B.w()).heights) === '{"dimension":2.5,"room":3.5}', 'a height of 80 mm is refused and nothing changes');
  const saved = B.ed.save();
  const B2 = await open(saved);
  ok(JSON.stringify(AS.readAnnoStandard(B2.w()).heights) === '{"dimension":2.5,"room":3.5}', 'saved as IFC and opened again: the standard travels with the file');
  ok(JSON.stringify(counts(B2.ed, B2.w())) === JSON.stringify(c0), 'opened again it is the same house: every count the same', JSON.stringify(counts(B2.ed, B2.w())));
  const s2 = OPS.snapshotModel(B2.ed);
  ok(s2.walls.every((x, i) => near(x.len, snap.walls[i].len, 0.01) && near(x.t, snap.walls[i].t, 0.01)) && s2.openings.every((o, i) => o.mark === snap.openings[i].mark && near(o.offset, snap.openings[i].offset, 0.01)) && s2.derived.spaces.map((x) => x.name).join() === 'Living room,Bedroom', 'walls, openings (marks and places) and room names are the same after the round trip');
  B.ed.undo();
  ok(Object.keys(AS.readAnnoStandard(B.w()).heights).length === 0, 'one Undo takes the standard away');
  ok(Object.keys(AB.officeStandard().heights).length === 0, 'no Default Policies add-on: no office standard');
  HK.setDefaults({ get: (id) => ({ 'all.anno.dimension': 2.5, 'all.anno.text': 2.5, 'all.anno.room': 99 }[id]), source: () => 'office' });
  ok(JSON.stringify(AB.officeStandard().heights) === '{"text":2.5,"dimension":2.5}', 'the office\'s policies give its standard (a height out of range is left out)');
  HK.setDefaults(null);

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}

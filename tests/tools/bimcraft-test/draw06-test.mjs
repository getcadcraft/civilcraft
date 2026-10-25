/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --draw06 [--only df15,df17,…] [--keep]` (0.6, session `bim-draw`): BimCraft's 0.6 drawing
 * work in Node, on models made here (no client files). One section per item as it lands:
 *   df15  where am I working: the project origin and survey point (coords.js readMarkers) on the fixture with a map
 *         conversion and on one with only a site latitude, moved; levelFor; the readout's lines; plan ↔ file and
 *         file ↔ viewer round trips
 * Called by bin/test-bimcraft.mjs with what it has set up (the build's folder, the engine, quiet()).
 */
import path from 'node:path';
import fs from 'node:fs';

export async function draw06Mode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? new Set(String(args[i + 1] || '').split(',')) : null; })();
  const want = (k) => !only || only.has(k);
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const saved = {};   // name → bytes, validated by IfcOpenShell at the end (when a venv with it is here)
  const danglingRefs = (txt) => {
    const defined = new Set([...txt.matchAll(/^#(\d+)=/gm)].map((m) => m[1])), out = new Set();
    for (const line of txt.split('\n')) for (const m of line.replace(/^#\d+=/, '').replace(/'(?:[^']|'')*'/g, '').matchAll(/#(\d+)/g)) if (!defined.has(m[1])) out.add('#' + m[1]);
    return [...out];
  };
  const { fixtureIfc, GEOREF } = await import(path.join(ROOT, 'tools/bimcraft-test/ifc-fixture.mjs'));
  const { t } = await import(path.join(APP, 'i18n.js'));
  const { ids } = await import(path.join(APP, 'ifc-util.js'));
  /** A fixture (or any IFC text) opened in cc-ifc: { api, mid, w (ModelWriter) }. */
  async function openText(text) {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    const m = await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    return { eng, m, api: eng.api, mid: m.modelID, w: new ModelWriter(WebIFC, eng.api, m.modelID) };
  }

  // ============================================================================================ DF.15 where am I working
  if (want('df15')) {
    console.log('== DF.15 where am I working (coords.js)');
    const CO = await import(path.join(APP, 'coords.js'));
    const { readLevels } = await import(path.join(APP, 'model-levels.js'));
    const { fmtLen } = await import(path.join(APP, 'model-units.js'));
    const { viewerToFile } = await import(path.join(APP, 'ifc-geo.js'));
    const { mul4 } = await import(path.join(APP, 'ifc-util.js'));
    // a map conversion: the survey point (the site's placement, here the origin) gets its map grid coordinates
    let f = await openText(fixtureIfc({ georef: 'map' }));
    let mk = CO.readMarkers(f.api, f.mid);
    ok(mk.unitMm === 1 && mk.same && mk.survey && near(mk.survey.at[0], 0, 1e-6), 'map conversion fixture: the site sits on the project origin (one marker)');
    ok(mk.survey.map && near(mk.survey.map[0], GEOREF.e, 1e-3) && near(mk.survey.map[1], GEOREF.n, 1e-3) && near(mk.survey.map[2], GEOREF.h, 1e-3), 'its map grid coordinates: E ' + GEOREF.e + ', N ' + GEOREF.n + ', H ' + GEOREF.h, mk.survey.map?.join());
    const mt = CO.mapText(mk.georef, mk.survey.map[0], mk.survey.map[1]);
    ok(mt.e === '334 567.800' && mt.n === '6 251 234.500' && mt.unit === 'm', 'map text in the map\'s unit, three decimals: E 334 567.800 N 6 251 234.500 m', JSON.stringify(mt));
    ok(CO.mapText({ mapUnitM: 1200 / 3937 }, 1200 / 3937 * 1000, 0).e === '1 000.000' && CO.mapText({ mapUnitM: 1200 / 3937 }, 0, 0).unit === 'US ft', 'a map in US survey feet reads in US feet');
    // only a latitude on the site, and the whole site moved 5 m east: two markers
    f = await openText(fixtureIfc({ georef: 'site', shift: 5000 }));
    mk = CO.readMarkers(f.api, f.mid);
    ok(!mk.same && near(mk.survey.at[0], 5000, 1e-6) && near(mk.survey.at[1], 0, 1e-6), 'site moved 5 m: the survey point at (5000, 0), apart from the project origin');
    ok(near(mk.survey.lat, GEOREF.latDeg, 1e-9) && near(mk.survey.lon, GEOREF.lonDeg, 1e-9) && near(mk.survey.elev, 42, 1e-9) && mk.survey.map === null, 'its latitude, longitude and elevation from IfcSite; no map grid');
    // levels and the readout
    const levels = readLevels(f.w);
    ok(levels.length === 2 && CO.levelFor(levels, 1500)?.name === 'Level 1' && CO.levelFor(levels, 3000)?.name === 'Level 2' && CO.levelFor(levels, 2999.5)?.name === 'Level 2' && CO.levelFor(levels, -300)?.name === 'Level 1' && CO.levelFor([], 0) === null,
      'levelFor: 1500 on Level 1, 3000 (and a hair under) on Level 2, below the lowest = the lowest');
    const fmt = (mm) => fmtLen(mm, 'mm');
    const r3 = CO.readout({ x: 1234, y: -500, z: 1500, level: levels[0], map: null }, fmt, t);
    ok(r3.length === 2 && r3[0] === 'Level 1, 1500 above its floor' && r3[1] === 'X 1234  Y -500  Z 1500', 'the 3D readout: the level and the height above its floor, then X Y Z', r3.join(' | '));
    const rp = CO.readout({ x: 3810, y: 0, level: null, map: { e: '1.000', n: '2.000', unit: 'm' } }, (mm) => fmtLen(mm, 'ftin'), t);
    ok(rp.length === 2 && rp[0] === 'X 12\'-6"  Y 0"' && rp[1] === 'E 1.000  N 2.000 m', 'the plan readout in feet and inches, with the map grid line', rp.join(' | '));
    // plan ↔ file on a turned, moved storey, and file ↔ viewer
    const a = 30 * Math.PI / 180, M = [Math.cos(a), Math.sin(a), 0, 0, -Math.sin(a), Math.cos(a), 0, 0, 0, 0, 1, 0, 1000, 2000, 3000, 1];
    const p = [1234.5, -678.25], back = CO.fileToPlan(M, CO.planToFile(M, p));
    ok(near(back[0], p[0], 1e-6) && near(back[1], p[1], 1e-6) && near(CO.planToFile(M, [0, 0])[2], 3000, 1e-9), 'a storey turned 30° and raised 3000: plan → file → plan comes back');
    const C = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -12.5, 0.25, 7, 1], place = mul4([0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 3, 0, -2, 1]);
    const q = [4321, -1200, 2750], v = CO.fileToViewer(q, place, C, 0.001), q2 = viewerToFile(v, place, C, 0.001);
    ok(q2.every((x, i) => near(x, q[i], 1e-6)), 'file → viewer → file comes back (ifc-geo.js viewerToFile is its inverse)');
    // a new building drawn in BimCraft: its site on the origin, levels named
    const N = await import(path.join(APP, 'new-model.js'));
    const text = N.newBuilding({ name: 'Coords', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'c.ifc', now: new Date('2026-10-16T12:00:00Z') });
    f = await openText(text);
    mk = CO.readMarkers(f.api, f.mid);
    ok(mk.same && !!mk.survey && mk.georef === null, 'a new building: the site on the project origin, no georeference');
  }

  /** A new building (n levels) opened in an editor: { ed, levels, OPS }. */
  async function building({ n = 2, h = 3000 } = {}) {
    const N = await import(path.join(APP, 'new-model.js'));
    const OPS = await import(path.join(APP, 'model-ops.js'));
    const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
    const text = N.newBuilding({ name: 'Draw06', levels: N.stackLevels(n, h, (i) => 'Level ' + (i + 1)), fileName: 'd.ifc', now: new Date('2026-10-16T12:00:00Z') });
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
    const ed = new IfcEditor(WebIFC, eng);
    return { ed, eng, OPS, levels: OPS.snapshotModel(ed).levels };
  }
  const P2 = (p) => p.map((v) => Math.round(v * 1000) / 1000).join(',');

  // ============================================================================================ DF.17 trim, extend, corner
  if (want('df17')) {
    console.log('== DF.17 trim / extend / corner (model-trim.js)');
    const TR = await import(path.join(APP, 'model-trim.js'));
    const m = TR.axisMeet([0, 0], [10, 0], [5, -5], [5, 5]);
    ok(m && near(m.t, 0.5, 1e-12) && near(m.u, 0.5, 1e-12) && P2(m.p) === '5,0' && TR.axisMeet([0, 0], [1, 0], [0, 1], [1, 1]) === null, 'axisMeet: the crossing point and both parameters; parallel lines meet nowhere');
    const edge = { guid: 'E', a: [3000, -2000], b: [3000, 2000], t: 160 };
    let r = TR.trimPlan({ guid: 'W', a: [0, 0], b: [5000, 0] }, edge, [1000, 0]);
    ok(P2(r.a) === '0,0' && P2(r.b) === '3000,0', 'a wall crossing the edge, clicked on its left part: trimmed to the edge\'s centre line, the left part stays');
    r = TR.trimPlan({ guid: 'W', a: [0, 0], b: [5000, 0] }, edge, [4500, 10]);
    ok(P2(r.a) === '3000,0' && P2(r.b) === '5000,0', 'clicked on its right part: the right part stays');
    r = TR.trimPlan({ guid: 'W', a: [0, 0], b: [2000, 0] }, edge, [500, 0]);
    ok(P2(r.a) === '0,0' && P2(r.b) === '3000,0', 'a wall short of the edge: its nearer end extends to it');
    r = TR.trimPlan({ guid: 'W', a: [6000, 0], b: [9000, 0] }, edge, [8000, 0]);
    ok(P2(r.a) === '3000,0' && P2(r.b) === '9000,0', 'beyond the edge on the other side: its start comes back to it');
    ok(TR.trimPlan({ guid: 'W', a: [0, 0], b: [2000, 0] }, { a: [3000, 500], b: [3000, 2000], t: 160 }, [0, 0]).error === 'model.err.trim.miss', 'an edge the wall\'s line passes beside: refused (model.err.trim.miss)');
    ok(TR.trimPlan({ guid: 'W', a: [0, 0], b: [2000, 0] }, { a: [3000, 80], b: [3000, 2000], t: 160 }, [0, 0]).b?.[0] === 3000, 'meeting the edge within half its thickness of its end still counts');
    ok(TR.trimPlan({ guid: 'W', a: [0, 0], b: [2000, 0] }, { a: [0, 500], b: [2000, 500], t: 160 }, [0, 0]).error === 'model.err.trim.parallel', 'a parallel edge: refused');
    ok(TR.trimPlan({ guid: 'W', a: [0, 0], b: [3020, 0] }, edge, [3010, 0]).error === 'model.err.trim.short', 'a part shorter than 50 mm: refused');
    ok(TR.trimPlan({ guid: 'E', a: [0, 0], b: [3020, 0] }, edge, [0, 0]).error === 'model.err.trim.same', 'a wall trimmed to itself: refused');
    const c = TR.cornerPlan({ guid: 'A', a: [0, 0], b: [4000, 0] }, [1000, 0], { guid: 'B', a: [5000, 1000], b: [5000, 4000] }, [5000, 3000]);
    ok(P2(c[0].b) === '5000,0' && P2(c[1].a) === '5000,0' && P2(c[0].a) === '0,0' && P2(c[1].b) === '5000,4000', 'corner: both walls run to where their centre lines meet');
    const c2 = TR.cornerPlan({ guid: 'A', a: [0, 0], b: [6000, 0] }, [1000, 0], { guid: 'B', a: [5000, -1000], b: [5000, 4000] }, [5000, 3000]);
    ok(P2(c2[0].b) === '5000,0' && P2(c2[1].a) === '5000,0', 'corner of two crossing walls: each keeps the side clicked');

    // in a model: a room left open at one corner is closed by Corner; a wall through the building is trimmed back to it
    const B = await building();
    const { ed, OPS, levels } = B;
    const L1 = levels[0].guid, top = levels[1].guid;
    const draw = (segs, typeKey = 'ext-2x6') => ed.modelChange(OPS.drawWalls({ storey: L1, segs, typeKey, topLevel: top, height: 3000, extSide: 'right' }));
    draw([{ a: [0, 0], b: [5000, 0] }]);
    draw([{ a: [6000, 500], b: [6000, 4000] }, { a: [6000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }]);
    let s = OPS.snapshotModel(ed);
    const south = s.walls.find((x) => near(x.a[1], 0) && near(x.b[1], 0)), east = s.walls.find((x) => near(x.a[0], 6000) && near(x.b[0], 6000));
    ok(s.derived.spaces.length === 0, 'an open corner: no room yet');
    const n0 = ed.changes.length;
    const cp = TR.cornerPlan(south, [2000, 0], east, [6000, 2000]);
    ed.modelChange(TR.reshapeWalls([{ guid: south.guid, ...cp[0] }, { guid: east.guid, ...cp[1] }]), { label: 'Corner', verb: 'Joined' });
    s = OPS.snapshotModel(ed);
    const s2 = s.walls.find((x) => x.guid === south.guid), e2 = s.walls.find((x) => x.guid === east.guid);
    ok(ed.changes.length === n0 + 1 && P2(s2.b) === '6000,0' && P2(e2.a) === '6000,0', 'Corner: one undo step, the south wall runs to x 6000 and the east wall down to y 0');
    ok(s.derived.spaces.length === 1 && near(s.derived.spaces[0].area || 0, 0, 1e9), 'the room closes: a space is found', String(s.derived.spaces.length));
    // an inside wall drawn right through the building, with a door on the part outside
    ed.modelChange(OPS.drawWalls({ storey: L1, segs: [{ a: [2500, -1500], b: [2500, 5500] }], typeKey: 'int-2x4', topLevel: top, height: 3000 }));
    s = OPS.snapshotModel(ed);
    const thru = s.walls.find((x) => x.typeKey === 'int-2x4');
    ed.modelChange(OPS.placeOpening({ wall: thru.guid, typeKey: 'door-single', offset: 100, face: 'left' }));
    s = OPS.snapshotModel(ed);
    ok(s.openings.length === 1, 'a door on the part of it outside the building');
    const southNow = s.walls.find((x) => x.guid === south.guid);
    const tp = TR.trimPlan(thru, southNow, [2500, 2000]);
    ed.modelChange(TR.reshapeWalls([{ guid: thru.guid, ...tp }]), { label: 'Trim', verb: 'Trimmed' });
    s = OPS.snapshotModel(ed);
    const t2 = s.walls.find((x) => x.guid === thru.guid);
    ok(P2(t2.a) === '2500,0' && P2(t2.b) === '2500,5500' && s.openings.length === 0, 'trimmed to the south wall, the inside part kept: the door on the part cut off goes with it');
    const north = s.walls.find((x) => near(x.a[1], 4000) && near(x.b[1], 4000));
    ed.modelChange(TR.reshapeWalls([{ guid: thru.guid, ...TR.trimPlan(t2, north, [2500, 1000]) }]), { label: 'Trim' });
    s = OPS.snapshotModel(ed);
    const t3 = s.walls.find((x) => x.guid === thru.guid);
    ok(P2(t3.a) === '2500,0' && P2(t3.b) === '2500,4000' && s.derived.spaces.length === 2, 'trimmed to the north wall too: it now splits the room in two');
    const { wallOutlines } = await import(path.join(APP, 'model-walls.js'));
    const polys = wallOutlines(s.walls.map((x) => ({ key: x.guid, a: x.a, b: x.b, t: x.t })));
    const pt = polys.get(thru.guid), ys = pt.map((q) => q[1]);
    ok(near(Math.min(...ys), south.t / 2, 0.5) && near(Math.max(...ys), 4000 - north.t / 2, 0.5), 'its outline stops at the faces of the walls it meets (clean T joins)', ys.map((y) => Math.round(y)).join(','));
    // a door the cut would pass through refuses the change
    ed.modelChange(OPS.placeOpening({ wall: thru.guid, typeKey: 'door-single', offset: 1500, face: 'left' }));
    s = OPS.snapshotModel(ed);
    const nChanges = ed.changes.length, mid = { guid: 'M', a: [0, 2000], b: [6000, 2000], t: 100 };
    let key = ''; try { ed.modelChange(TR.reshapeWalls([{ guid: thru.guid, ...TR.trimPlan(s.walls.find((x) => x.guid === thru.guid), mid, [2500, 500]) }])); } catch (e) { key = e.key; }
    ok(key === 'model.err.trim.cuts' && ed.changes.length === nChanges && OPS.snapshotModel(ed).openings.length === 1, 'a trim through a door: refused (model.err.trim.cuts), nothing changed');
    // undo / redo
    ed.undo();
    s = OPS.snapshotModel(ed);
    ok(P2(s.walls.find((x) => x.guid === thru.guid).b) === '2500,4000' && s.openings.length === 0, 'undo takes the door off again');
    ed.undo();
    s = OPS.snapshotModel(ed);
    ok(P2(s.walls.find((x) => x.guid === thru.guid).b) === '2500,5500', 'undo: back through the north wall');
    ed.redo();
    s = OPS.snapshotModel(ed);
    ok(P2(s.walls.find((x) => x.guid === thru.guid).b) === '2500,4000' && s.derived.spaces.length === 2, 'redo: trimmed again, two rooms');
    // the saved file reopens with the walls where they were left
    const back = await openText(new TextDecoder().decode(ed.save()));
    const { readWalls } = await import(path.join(APP, 'model-walls.js'));
    const rw = readWalls(back.w).find((x) => x.guid === thru.guid);
    ok(rw && P2(rw.a) === '2500,0' && P2(rw.b) === '2500,4000', 'saved and reopened in cc-ifc: the trimmed wall is where it was left');
  }

  // ============================================================================================ DF.16 grids and columns
  if (want('df16')) {
    console.log('== DF.16 grids (model-grids.js) and columns (model-columns.js)');
    const G = await import(path.join(APP, 'model-grids.js'));
    const C = await import(path.join(APP, 'model-columns.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    ok(['1', '9', 'A', 'H', 'N', 'Z', 'AZ', 'A.1', 'B9'].map(G.nextTag).join(' ') === '2 10 B J P AA BA A.2 B10', 'nextTag: numbers count on, letters skip I and O, Z → AA, A.1 → A.2');
    const lay = G.gridLayout({ origin: [0, 0], u: { count: 3, spacing: 6000 }, v: { count: 2, spacing: 7000 }, extend: 1500 });
    const L2 = lay.find((x) => x.tag === '2'), LB = lay.find((x) => x.tag === 'B');
    ok(lay.map((x) => x.tag).join() === '1,2,3,A,B' && P2(L2.a) === '6000,-1500' && P2(L2.b) === '6000,8500' && P2(LB.a) === '-1500,7000' && P2(LB.b) === '13500,7000', 'gridLayout: 1, 2, 3 across at 6000, A, B up at 7000, 1500 past the last lines');
    const rot = G.gridLayout({ origin: [1000, 1000], angle: 90, u: { count: 1, spacing: 1 }, v: { count: 0 }, extend: 0 });
    ok(P2(rot[0].a) === '1000,1000' && P2(rot[0].b) === '1000,1000' && G.gridLayout({ u: { count: 3, spacing: [5000, 4000] }, v: { count: 1 } }).filter((x) => x.fam === 'u').map((x) => Math.round(x.a[0])).join() === '0,5000,9000', 'a turned layout; a list of spacings');
    const sn = G.gridSnap(lay);
    ok(sn.lines.length === 5 && sn.points.length === 6 && sn.points.some((q) => P2(q) === '6000,7000'), 'gridSnap: five lines, six crossings (2 / B at 6000, 7000)');
    const seen = G.gridsInView(lay, [0, -1]);   // the south elevation looks north… (dir = where the eye looks: here −Y = south)
    ok(seen.map((x) => x.tag + '@' + Math.round(x.x)).join() === '3@-12000,2@-6000,1@0' && G.gridsInView(lay, [1, 0]).map((x) => x.tag).join() === 'B,A', 'gridsInView: a view along the numbered lines sees 1, 2, 3 end on (x along its right); one along the lettered lines sees A, B');
    const PDF = await import(path.join(APP, 'model-pdf.js'));
    const pdf = PDF.planPdf({ walls: [], grids: lay.map((x) => ({ ...x, bubbles: 'both' })) }, { title: 'Grid test', units: 'mm' });
    const ptxt = new TextDecoder('latin1').decode(pdf.bytes);
    ok(['(1)', '(2)', '(3)', '(A)', '(B)'].every((x) => (ptxt.match(new RegExp('\\' + x.slice(0, -1) + '\\)', 'g')) || []).length >= 2), 'the plan PDF prints every label twice (a bubble at each end)');
    const SH = await import(path.join(APP, 'res-sheets.js'));
    const set = SH.buildSet({ plans: [{ title: 'Plan', scene: { walls: [], grids: lay.map((x) => ({ ...x, bubbles: 'end' })) } }], elevations: [{ title: 'South', view: { lines: [[-1000, 0, 13000, 0], [-1000, 3000, 13000, 3000]], cuts: [], bounds: { x0: -13000, y0: 0, x1: 1000, y1: 3000 }, grids: seen } }] }, { units: 'mm' });
    const texts = (sh) => sh.items.filter((i) => i.t === 'text').map((i) => i.s);
    ok(['1', '2', '3', 'A', 'B'].every((tg) => texts(set[0]).filter((x) => x === tg).length === 1) && ['1', '2', '3'].every((tg) => texts(set[1]).includes(tg)), 'the sheets: the plan\'s bubbles at one end (Bubbles: End), the elevation\'s bubbles over 1, 2, 3');
    // in a model
    const B = await building();
    const { ed, OPS, levels } = B;
    const L1 = levels[0].guid, top = levels[1].guid;
    const w = () => new ModelWriter(WebIFC, ed.api, ed.mid);
    const n0 = ed.changes.length;
    ed.modelChange(G.placeGrid({ storey: L1, axes: lay }), { label: 'Grid', verb: 'Placed' });
    let gr = G.readGrids(w());
    ok(ed.changes.length === n0 + 1 && gr.length === 1 && gr[0].own && gr[0].axes.length === 5, 'placed: one undo step, one grid of five lines');
    let txt = new TextDecoder().decode(ed.save());
    ok(/IFCGRID\('[^']+',#\d+,'Grid',\$,\$,#\d+,#\d+,\(#\d+,#\d+,#\d+\),\(#\d+,#\d+\),\$,\.RECTANGULAR\.\)/.test(txt), 'IfcGrid: three numbered lines in UAxes, two lettered in VAxes, RECTANGULAR');
    ok((txt.match(/IFCGRIDAXIS\('[123AB]',#\d+,\.T\.\)/g) || []).length === 5 && /IFCGEOMETRICCURVESET\(\(#\d+,#\d+,#\d+,#\d+,#\d+\)\)/.test(txt) && /'FootPrint','GeometricCurveSet'/.test(txt), 'five IfcGridAxis with their labels; a FootPrint curve set for other programs');
    const gid = gr[0].id, bld = ids(ed.api, ed.mid, 'IFCBUILDING')[0];
    ok(ids(ed.api, ed.mid, 'IFCRELCONTAINEDINSPATIALSTRUCTURE').some((r) => { const l = ed.api.GetLine(ed.mid, r, false); return l.RelatingStructure?.value === bld && (l.RelatedElements || []).some((h) => h.value === gid); }), 'contained in the building (every level shows it)');
    const plan2 = G.toPlan(w(), levels[1].id, gr)[0].axes.find((x) => x.tag === '2');
    ok(P2(plan2.a) === '6000,-1500', 'on Level 2\'s plan the lines are where Level 1 has them');
    // reopen
    let back = await openText(txt);
    gr = G.readGrids(back.w);
    ok(gr[0].axes.map((x) => x.tag + x.fam).join() === '1u,2u,3u,Av,Bv' && P2(gr[0].axes.find((x) => x.tag === 'B').b) === '13500,7000', 'saved and reopened in cc-ifc: the same lines, labels and families');
    saved.grid = ed.save();
    // one by one: a line drawn along the numbered ones joins them, labelled 4; a label taken is refused
    ed.modelChange(G.placeGrid({ storey: L1, axes: [{ a: [18000, -1500], b: [18000, 8500] }] }));
    gr = G.readGrids(w());
    ok(gr[0].axes.find((x) => x.tag === '4')?.fam === 'u', 'a line drawn up the plan joins the numbered lines as 4');
    let key = ''; try { ed.modelChange(G.changeGridAxis('4', { tag: 'A' })); } catch (e) { key = e.key; }
    ok(key === 'model.err.grid.tag', 'renaming 4 to A (taken): refused');
    ed.modelChange(G.changeGridAxis('4', { tag: '3a', a: [18500, -1500], b: [18500, 8500], storey: L1 }));
    gr = G.readGrids(w());
    ok(gr[0].axes.some((x) => x.tag === '3a' && near(x.a[0], 18500, 1e-6)) && !gr[0].axes.some((x) => x.tag === '4'), 'renamed to 3a and moved 500');
    ed.modelChange(G.changeGrid({ bubbles: 'start' }));
    ok(G.readGrids(w())[0].bubbles === 'start', 'bubbles at the start only');
    ed.modelChange(G.removeGridAxes(['3a']));
    gr = G.readGrids(w());
    ok(gr[0].axes.length === 5 && !danglingRefs(new TextDecoder().decode(ed.save())).length, 'a line deleted; no dangling references');
    ed.undo();
    ok(G.readGrids(w())[0].axes.length === 6, 'undo brings it back');
    ed.redo();
    // columns at every crossing, to the level above
    const pts = G.gridSnap(G.toPlan(w(), levels[0].id, G.readGrids(w()))[0].axes).points;
    ed.modelChange(C.placeColumns({ storey: L1, points: pts, topLevel: top }), { label: 'Columns', verb: 'Placed' });
    let cols = C.readColumns(w());
    ok(cols.length === 6 && cols.every((c) => near(c.h, 3000, 1e-6) && near(c.width, 304.8, 1e-6)) && cols.some((c) => P2(c.at) === '6000,7000'), 'six columns, one at each crossing, 12" square, 3000 tall (to Level 2)');
    txt = new TextDecoder().decode(ed.save());
    ok((txt.match(/IFCCOLUMN\(/g) || []).length === 6 && /IFCCOLUMN\([^;]*\.COLUMN\.\)/.test(txt) && /'Qto_ColumnBaseQuantities'/.test(txt) && /'CadCraft_Column'/.test(txt), 'IfcColumn .COLUMN. with Qto_ColumnBaseQuantities and CadCraft_Column');
    const e3 = await quiet(IfcModel.create)(WebIFC, null);
    const m3 = await quiet((b) => e3.load(b))(ed.save());
    const colIds = new Set(cols.map((c) => c.id));
    let vol = 0;
    for (const b of m3.batches) for (let i = 0; i < b.elems.ids.length; i++) if (colIds.has(b.elems.ids[i])) {
      let s6 = 0; const P = b.positions, I = b.indices, t0 = b.elems.t0[i], tn = b.elems.tn[i];
      for (let k = t0; k < t0 + tn; k++) { const a = I[k * 3] * 3, bb = I[k * 3 + 1] * 3, c = I[k * 3 + 2] * 3; s6 += P[a] * (P[bb + 1] * P[c + 2] - P[bb + 2] * P[c + 1]) - P[a + 1] * (P[bb] * P[c + 2] - P[bb + 2] * P[c]) + P[a + 2] * (P[bb] * P[c + 1] - P[bb + 1] * P[c]); }
      vol += s6 / 6;
    }
    ok(near(Math.abs(vol), 6 * 0.3048 * 0.3048 * 3, 1e-3), 'cc-ifc draws them: six solids of 0.3048² × 3 m (' + Math.abs(vol).toFixed(4) + ' m³)');
    ed.modelChange(OPS.changeLevel(levels[0].guid, { height: 3600 }));
    cols = C.readColumns(w());
    ok(cols.every((c) => near(c.h, 3600, 1e-6)), 'Level 1 made 3600 tall: the columns follow (3600)');
    ed.modelChange(C.changeColumn(cols[0].guid, { shape: 'round', width: 400 }));
    cols = C.readColumns(w());
    ok(cols.find((c) => c.guid === cols[0].guid)?.shape === 'round' && /IFCCIRCLEPROFILEDEF\('?\.?AREA\.?'?,\$,#\d+,200\.?\)/.test(new TextDecoder().decode(ed.save())), 'one made round, 400 across (IfcCircleProfileDef radius 200)');
    key = ''; try { ed.modelChange(C.placeColumns({ storey: L1, points: [[0, 0]], width: 20 })); } catch (e) { key = e.key; }
    ok(key === 'model.err.col.size' && C.readColumns(w()).length === 6, 'a 20 mm column: refused, nothing written');
    ed.modelChange(C.removeColumns([cols[1].guid]));
    { const dg = danglingRefs(new TextDecoder().decode(ed.save())); if (dg.length) { const tx = new TextDecoder().decode(ed.save()); console.log('  dbg', dg.slice(0, 3).join(), tx.split('\n').filter((l) => dg.some((d) => l.includes(d + ',') || l.includes(d + ')'))).slice(0, 3).join(' || ').slice(0, 600)); } ok(C.readColumns(w()).length === 5 && !dg.length, 'one deleted; no dangling references', 'columns ' + C.readColumns(w()).length + ' dangling ' + dg.length); }
    saved.columns = ed.save();
    // a grid of one line only (schema: both lists hold a line): its twin is written, and read back as one line
    const B2 = await building();
    B2.ed.modelChange(G.placeGrid({ storey: B2.levels[0].guid, axes: [{ tag: '1', a: [0, 0], b: [0, 9000] }] }));
    const t2 = new TextDecoder().decode(B2.ed.save());
    ok(G.readGrids(new ModelWriter(WebIFC, B2.ed.api, B2.ed.mid))[0].axes.length === 1 && /IFCGRIDAXIS\(\$,#\d+,\.F\.\)/.test(t2) && /IFCGRID\([^;]*\.IRREGULAR\.\)/.test(t2), 'one line alone: an untagged twin in VAxes (IRREGULAR), read back as one line');
    saved.gridone = B2.ed.save();
    B2.ed.modelChange(G.removeGridAxes(['1']));
    ok(!ids(B2.ed.api, B2.ed.mid, 'IFCGRID').length && !ids(B2.ed.api, B2.ed.mid, 'IFCGRIDAXIS').length && !danglingRefs(new TextDecoder().decode(B2.ed.save())).length, 'its last line deleted: the grid and its axes go');
    // another program's grid is read (shown and snapped to), never changed
    try {
      const Wi = (await import('node:module')).createRequire(path.join(ROOT, 'tools/bimcraft-test/package.json'))('web-ifc');
      const api = new Wi.IfcAPI(); await quiet(() => api.Init())();
      const id = api.OpenModel(saved.columns);
      ok(api.GetLineIDsWithType(id, Wi.IFCGRID).size() === 1 && api.GetLineIDsWithType(id, Wi.IFCGRIDAXIS).size() === 5 && api.GetLineIDsWithType(id, Wi.IFCCOLUMN).size() === 5, 'web-ifc (oracle): one grid, five axes, five columns');
    } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped'); }
  }

  // ============================================================================================ DF.18 drawn floors and ramps
  if (want('df18')) {
    console.log('== DF.18 floors of any shape (model-floors.js) and ramps (model-ramps.js)');
    const F = await import(path.join(APP, 'model-floors.js'));
    const RP = await import(path.join(APP, 'model-ramps.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    ok(F.polyProblem([[0, 0], [1000, 0], [1000, 1000]]) === null && F.polyProblem([[0, 0], [1000, 0]]) === 'model.err.fl.shape' && F.polyProblem([[0, 0], [1000, 1000], [1000, 0], [0, 1000]]) === 'model.err.fl.shape', 'polyProblem: a triangle is fine; two corners or a bow tie are not');
    ok(F.inside([[0, 0], [4000, 0], [4000, 3000], [0, 3000]], [[1000, 1000], [2000, 1000], [2000, 2000]]) && !F.inside([[0, 0], [4000, 0], [4000, 3000], [0, 3000]], [[3000, 1000], [5000, 1000], [5000, 2000]]), 'inside: an opening within the floor; one over its edge is not');
    const B = await building();
    const { ed, OPS, levels } = B;
    const L1 = levels[0].guid, L2 = levels[1].guid;
    const w = () => new ModelWriter(WebIFC, ed.api, ed.mid);
    // a balcony on Level 2: an L-shaped outline drawn by hand, sticking out past where any wall is
    const bal = [[0, 0], [4000, 0], [4000, 1500], [1500, 1500], [1500, 3000], [0, 3000]];
    const n0 = ed.changes.length;
    ed.modelChange(F.placeDrawnFloor({ storey: L2, points: bal, kind: 'concrete', thickness: 200 }), { label: 'Floor', verb: 'Drew' });
    let fl = F.readDrawnFloors(w());
    ok(ed.changes.length === n0 + 1 && fl.length === 1 && near(fl[0].area, 8.25e6, 1) && fl[0].storey === levels[1].id, 'a balcony drawn on Level 2: one undo step, 8.25 m², on its level');
    let txt = new TextDecoder().decode(ed.save());
    ok(/IFCSLAB\([^;]*\.FLOOR\.\)/.test(txt) && /'CadCraft_DrawnFloor'/.test(txt) && /'Qto_SlabBaseQuantities'/.test(txt), 'IfcSlab .FLOOR. with CadCraft_DrawnFloor and Qto_SlabBaseQuantities');
    // an opening in it
    ed.modelChange(F.addFloorOpening(fl[0].guid, [[300, 300], [1200, 300], [1200, 1200], [300, 1200]]), { label: 'Opening' });
    fl = F.readDrawnFloors(w());
    ok(fl[0].openings.length === 1 && /IFCOPENINGELEMENT\(/.test(new TextDecoder().decode(ed.save())), 'an opening: an IfcOpeningElement voiding the slab');
    let key = ''; try { ed.modelChange(F.addFloorOpening(fl[0].guid, [[3500, 1000], [4500, 1000], [4500, 1400]])); } catch (e) { key = e.key; }
    ok(key === 'model.err.fl.hole' && F.readDrawnFloors(w())[0].openings.length === 1, 'an opening over the edge: refused (model.err.fl.hole)');
    // cc-ifc cuts it: the slab's volume = (area − opening) × thickness
    const volOf = async (idsSet) => {
      const e3 = await quiet(IfcModel.create)(WebIFC, null), m3 = await quiet((b) => e3.load(b))(ed.save());
      let v = 0;
      for (const b of m3.batches) for (let i = 0; i < b.elems.ids.length; i++) if (idsSet.has(b.elems.ids[i])) {
        let s6 = 0; const P = b.positions, I = b.indices, t0 = b.elems.t0[i], tn = b.elems.tn[i];
        for (let k = t0; k < t0 + tn; k++) { const a = I[k * 3] * 3, bb = I[k * 3 + 1] * 3, c = I[k * 3 + 2] * 3; s6 += P[a] * (P[bb + 1] * P[c + 2] - P[bb + 2] * P[c + 1]) - P[a + 1] * (P[bb] * P[c + 2] - P[bb + 2] * P[c]) + P[a + 2] * (P[bb] * P[c + 1] - P[bb + 1] * P[c]); }
        v += s6 / 6;
      }
      return Math.abs(v);
    };
    let v = await volOf(new Set([fl[0].id]));
    ok(near(v, (8.25 - 0.81) * 0.2, 1e-3), 'cc-ifc draws it with the opening cut: ' + v.toFixed(4) + ' m³ = (8.25 − 0.81) × 0.2');
    ed.modelChange(F.changeDrawnFloor(fl[0].guid, { thickness: 150, offset: -25, use: 'landing' }));
    fl = F.readDrawnFloors(w());
    ok(near(fl[0].thickness, 150, 1e-6) && fl[0].use === 'landing' && /IFCSLAB\([^;]*\.LANDING\.\)/.test(new TextDecoder().decode(ed.save())), 'made 150 thick, 25 under the level, a landing (.LANDING.)');
    v = await volOf(new Set([fl[0].id]));
    ok(near(v, (8.25 - 0.81) * 0.15, 1e-3), 'its opening follows the new thickness (' + v.toFixed(4) + ' m³)');
    key = ''; try { ed.modelChange(F.placeDrawnFloor({ storey: L1, points: [[0, 0], [1000, 1000], [1000, 0], [0, 1000]] })); } catch (e) { key = e.key; }
    ok(key === 'model.err.fl.shape' && F.readDrawnFloors(w()).length === 1, 'a crossing outline: refused, nothing written');
    ed.modelChange(F.removeFloorOpenings([fl[0].openings[0].guid]));
    ok(F.readDrawnFloors(w())[0].openings.length === 0 && !danglingRefs(new TextDecoder().decode(ed.save())).length, 'the opening deleted; no dangling references');
    ed.undo();
    ok(F.readDrawnFloors(w())[0].openings.length === 1, 'undo brings it back');
    saved.floor = ed.save();
    // ramps: Level 1 → Level 2 (3000 rise) at 1:12 → four flights of 750 with three landings
    let lay = RP.rampLayout({ start: [0, 0], angle: 0 }, 3000);
    const fls = lay.pieces.filter((p) => p.kind === 'flight');
    ok(fls.length === 4 && lay.pieces.length === 7 && near(fls[0].s1 - fls[0].s0, 9000, 1e-6) && near(lay.run, 4 * 9000 + 3 * 1524, 1e-6) && !lay.steep, 'layout: 3000 up at 1:12 = four flights of 9000 (750 up each, 30" max) and three 5\' landings');
    lay = RP.rampLayout({ start: [0, 0], mode: 'length', length: 6000 }, 600);
    ok(lay.pieces.length === 1 && near(lay.slope, 10, 1e-9) && lay.steep, 'by length: 600 up over 6000 = 1:10, flagged steeper than 1:12');
    ok(RP.rampLayout({ mode: 'length', length: 1000 }, 3000).error === 'model.err.ramp.short', 'a length too short for its landings: refused');
    ed.modelChange(RP.placeRamp({ storey: L1, start: [8000, 0], angle: 90, rise: 600, width: 1200 }), { label: 'Ramp', verb: 'Placed' });
    let rs = RP.readRamps(w());
    ok(rs.length === 1 && rs[0].parts.length === 1 && near(rs[0].riseUsed, 600, 1e-6) && near(rs[0].runUsed, 7200, 1e-6), 'a ramp up 600: one flight 7200 long (1:12)');
    txt = new TextDecoder().decode(ed.save());
    ok(/IFCRAMP\([^;]*\.STRAIGHT_RUN_RAMP\.\)/.test(txt) && /IFCRAMPFLIGHT\([^;]*\.STRAIGHT\.\)/.test(txt) && /'Pset_RampFlightCommon'/.test(txt) && /'CadCraft_Ramp'/.test(txt), 'IfcRamp .STRAIGHT_RUN_RAMP. aggregating an IfcRampFlight .STRAIGHT. with Pset_RampFlightCommon');
    // cc-ifc: the flight rises 600 over 7200 north (angle 90) from (8000, 0)
    const e4 = await quiet(IfcModel.create)(WebIFC, null), m4 = await quiet((b) => e4.load(b))(ed.save());
    const C4 = e4.api.GetCoordinationMatrix(m4.modelID);
    let zmax = -Infinity, ymin = Infinity, ymax = -Infinity;
    const fid = rs[0].parts[0];
    for (const b of m4.batches) for (let i = 0; i < b.elems.ids.length; i++) if (b.elems.ids[i] === fid) for (let vv = b.elems.v0[i]; vv < b.elems.v0[i] + b.elems.vn[i]; vv++) { zmax = Math.max(zmax, b.positions[vv * 3 + 1] - C4[13]); const yN = -(b.positions[vv * 3 + 2] - C4[14]); ymin = Math.min(ymin, yN); ymax = Math.max(ymax, yN); }
    ok(near(zmax * 1000, 600, 0.5) && near((ymax - ymin) * 1000, 7200, 0.5), 'cc-ifc draws the flight up to 600, 7200 long along the plan\'s north (' + Math.round(zmax * 1000) + ', ' + Math.round((ymax - ymin) * 1000) + ')');
    // to the level above: landings, and it follows the level's height
    ed.modelChange(RP.changeRamp(rs[0].guid, { topLevel: L2 }));
    rs = RP.readRamps(w());
    ok(rs[0].parts.length === 7 && /TWO_STRAIGHT|USERDEFINED/.test(new TextDecoder().decode(ed.save())), 'to Level 2 (3000 up): four flights and three landings (.USERDEFINED. "Straight ramp with landings")');
    ed.modelChange(OPS.changeLevel(levels[0].guid, { height: 1500 }));
    rs = RP.readRamps(w());
    ok(near(rs[0].riseUsed, 1500, 1e-6) && rs[0].parts.length === 3, 'Level 1 made 1500 tall: the ramp follows (two flights and a landing)');
    key = ''; try { ed.modelChange(RP.placeRamp({ storey: L2, start: [0, 0], topLevel: '', rise: 0 })); } catch (e) { key = e.key; }
    ok(key === 'model.err.ramp.rise', 'a ramp on the top level with no rise typed: refused');
    saved.ramp = ed.save();
    ed.modelChange(RP.removeRamps([rs[0].guid]));
    ok(!RP.readRamps(w()).length && !ids(ed.api, ed.mid, 'IFCRAMPFLIGHT').length && !danglingRefs(new TextDecoder().decode(ed.save())).length, 'deleted with its flights and landings; no dangling references');
    try {
      const Wi = (await import('node:module')).createRequire(path.join(ROOT, 'tools/bimcraft-test/package.json'))('web-ifc');
      const api = new Wi.IfcAPI(); await quiet(() => api.Init())();
      const id = api.OpenModel(saved.ramp);
      ok(api.GetLineIDsWithType(id, Wi.IFCRAMP).size() === 1 && api.GetLineIDsWithType(id, Wi.IFCRAMPFLIGHT).size() === 2 && api.GetLineIDsWithType(id, Wi.IFCOPENINGELEMENT).size() === 1, 'web-ifc (oracle): one ramp with two flights; the floor\'s opening');
    } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped'); }
  }

  // ============================================================================================ DF.20 site, building, levels
  if (want('df20')) {
    console.log('== DF.20 the spatial structure as tools (model-site.js)');
    const SI = await import(path.join(APP, 'model-site.js'));
    const G = await import(path.join(APP, 'model-grids.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    const { readLevels } = await import(path.join(APP, 'model-levels.js'));
    const B = await building();
    const { ed, OPS, levels } = B;
    const L1 = levels[0].guid;
    const w = () => new ModelWriter(WebIFC, ed.api, ed.mid);
    let site = SI.readSite(w());
    ok(site && !site.points.length && P2(site.building.at) === '0,0' && near(site.building.angle, 0, 1e-9), 'a new building: its site, no outline yet, the building on the site\'s origin');
    ed.modelChange(OPS.drawWalls({ storey: L1, segs: [{ a: [0, 0], b: [6000, 0] }], typeKey: 'ext-2x6', topLevel: levels[1].guid }));
    ed.modelChange(G.placeGrid({ storey: L1, axes: [{ tag: '1', a: [0, -1000], b: [0, 5000] }, { tag: 'A', a: [-1000, 0], b: [7000, 0] }] }));
    // the site outline drawn on Level 1's plan
    const n0 = ed.changes.length;
    ed.modelChange(SI.setSiteOutline({ storey: L1, points: [[-10000, -10000], [30000, -10000], [30000, 20000], [-10000, 20000]] }), { label: 'Site', verb: 'Drew' });
    site = SI.readSite(w());
    let txt = new TextDecoder().decode(ed.save());
    ok(ed.changes.length === n0 + 1 && site.points.length === 4 && /'GrossArea',\$,\$?,?1200\.?0*[,)]/.test(txt.replace(/IFCQUANTITYAREA\('GrossArea',\$,\$,([\d.]+)/, "'GrossArea',$,$,$1)")) , 'the site outline: one undo step, four corners, 1200 m² (Qto_SiteBaseQuantities)');
    ok(/IFCSITE\('[^']+',#\d+,'[^']*',\$,\$,#\d+,#\d+,/.test(txt) && /'FootPrint','GeometricCurveSet'/.test(txt), 'IfcSite gets its footprint (a closed curve)');
    // the building placed and turned on the site: the walls and the grid go with it, the site outline stays
    ed.modelChange(SI.placeBuilding({ at: [5000, 2000], angle: 30 }), { label: 'Building', verb: 'Moved' });
    site = SI.readSite(w());
    ok(P2(site.building.at.map((v) => Math.round(v))) === '5000,2000' && near(site.building.angle, 30, 1e-6), 'the building placed at (5000, 2000) and turned 30° on the site');
    const M = w().storeyWorld(B.levels[0].id ?? OPS.snapshotModel(ed).levels[0].id);
    const wall = OPS.snapshotModel(ed).walls[0];
    ok(P2(wall.a) === '0,0' && near(M[12], 5000, 1e-6) && near(M[13], 2000, 1e-6) && near(Math.atan2(M[1], M[0]) * 180 / Math.PI, 30, 1e-6), 'the walls keep their plan; Level 1 now sits at (5000, 2000) turned 30°');
    const g1 = G.readGrids(w())[0].axes.find((x) => x.tag === '1');
    ok(near(g1.a[0], 5000 + 1000 * Math.sin(Math.PI / 6), 1e-3) && near(g1.a[1], 2000 - 1000 * Math.cos(Math.PI / 6), 1e-3), 'the grid went with the building');
    const sp = SI.siteToPlan(w(), OPS.snapshotModel(ed).levels[0].id, site.points), back = SI.planToSite(w(), OPS.snapshotModel(ed).levels[0].id, sp);
    ok(back.every((q, i) => near(q[0], site.points[i][0], 1e-6) && near(q[1], site.points[i][1], 1e-6)) && !near(sp[0][0], site.points[0][0], 1), 'the site outline seen on the turned level\'s plan, and back');
    ed.undo();
    ok(P2(SI.readSite(w()).building.at.map((v) => Math.round(v))) === '0,0', 'undo puts the building back');
    // levels at heights, and by splitting the building's height
    ed.modelChange(SI.addLevels({ elevations: [6000, 9000] }), { label: 'Levels', verb: 'Added' });
    let L = readLevels(w());
    ok(L.map((l) => l.name + '@' + Math.round(l.elevation)).join() === 'Level 1@0,Level 2@3000,Level 3@6000,Level 4@9000', 'Add levels at 6000 and 9000: Level 3 and Level 4');
    let key = ''; try { ed.modelChange(SI.addLevels({ elevations: [3000] })); } catch (e) { key = e.key; }
    ok(key === 'model.err.lv.none' && readLevels(w()).length === 4, 'a height that already has a level: refused, nothing added');
    ed.undo();
    const B2 = await building({ n: 2, h: 3000 });
    const w2 = () => new ModelWriter(WebIFC, B2.ed.api, B2.ed.mid);
    B2.ed.modelChange(B2.OPS.drawWalls({ storey: B2.levels[0].guid, segs: [{ a: [0, 0], b: [5000, 0] }], typeKey: 'ext-2x6', topLevel: B2.levels[1].guid }));
    B2.ed.modelChange(SI.splitLevels({ total: 10500, count: 3 }), { label: 'Levels', verb: 'Split' });
    L = readLevels(w2());
    ok(L.length === 3 && L.map((l) => Math.round(l.elevation) + '/' + Math.round(l.height)).join() === '0/3500,3500/3500,7000/3500', 'split 10500 into three: 0, 3500, 7000, each 3500 tall (the third added)');
    ok(near(B2.OPS.snapshotModel(B2.ed).walls[0].height, 3500, 1e-6), 'the wall up to Level 2 follows (3500)');
    key = ''; try { B2.ed.modelChange(SI.splitLevels({ total: 2000, count: 3 })); } catch (e) { key = e.key; }
    ok(key === 'model.err.lv.split', 'levels under 1 m: refused');
    // a file whose building has no site: one is set up by itself, nothing moves
    const B3 = await building();
    const w3 = () => new ModelWriter(WebIFC, B3.ed.api, B3.ed.mid);
    B3.ed.modelChange((ed3) => {
      const wr = new ModelWriter(ed3.W, ed3.api, ed3.mid);
      return wr.run(() => {
        const sid = ids(wr.api, wr.mid, 'IFCSITE')[0], bid = ids(wr.api, wr.mid, 'IFCBUILDING')[0];
        for (const rid of ids(wr.api, wr.mid, 'IFCRELAGGREGATES')) {
          const r = wr.api.GetLine(wr.mid, rid, false);
          if (r.RelatingObject?.value === sid) { wr.touch(rid); wr.api.DeleteLine(wr.mid, rid); }
          else if ((r.RelatedObjects || []).some((h) => h.value === sid)) { const l = wr.touch(rid); l.RelatedObjects = [wr.H(bid)]; wr.write(l); }
        }
        const pl = wr.touch(wr.api.GetLine(wr.mid, bid, false).ObjectPlacement.value); pl.PlacementRelTo = null; wr.write(pl);
        wr.touch(sid); wr.api.DeleteLine(wr.mid, sid);
        return { id: bid, ids: [bid] };
      });
    });
    ok(!ids(B3.ed.api, B3.ed.mid, 'IFCSITE').length && SI.readSite(w3()) === null, 'a building with no site (made so here)');
    B3.ed.modelChange(SI.setSiteOutline({ storey: B3.levels[0].guid, points: [[0, 0], [20000, 0], [20000, 15000], [0, 15000]] }));
    site = SI.readSite(w3());
    txt = new TextDecoder().decode(B3.ed.save());
    ok(site && site.points.length === 4 && P2(site.building.at) === '0,0' && /IFCRELAGGREGATES\('[^']+',#\d+,\$,\$,#\d+,\(#\d+\)\)/.test(txt) && !danglingRefs(txt).length, 'drawing its outline sets up Site → Building by itself; the building stays where it was');
    saved.site = B3.ed.save();
    saved.placed = ed.save();
  }

  // ============================================================================================ DF.22 drawing on a point cloud
  if (want('df22')) {
    console.log('== DF.22 the cloud\'s slice on the plan (cloud-slice.js)');
    const CS = await import(path.join(APP, 'cloud-slice.js'));
    const { mul4 } = await import(path.join(APP, 'ifc-util.js'));
    // a scanned room: 6 × 4 m walls turned 10°, 2.7 m tall, a floor and a ceiling, its floor 350 mm up (the scanner's own zero)
    const pts = [], rnd = (() => { let x = 12345; return () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; }; })();
    const a = 10 * Math.PI / 180, R = (x, y) => [x * Math.cos(a) - y * Math.sin(a) + 2, x * Math.sin(a) + y * Math.cos(a) + 1];
    const add = (x, y, z) => { const q = R(x, y); pts.push(q[0], q[1], z + 0.35); };
    for (let k = 0; k < 20000; k++) {
      const z = rnd() * 2.7, t = rnd(), side = k % 4;
      if (side === 0) add(t * 6, (rnd() - 0.5) * 0.01, z); else if (side === 1) add(6 + (rnd() - 0.5) * 0.01, t * 4, z);
      else if (side === 2) add(t * 6, 4 + (rnd() - 0.5) * 0.01, z); else add((rnd() - 0.5) * 0.01, t * 4, z);
    }
    for (let k = 0; k < 15000; k++) add(rnd() * 6, rnd() * 4, (rnd() - 0.5) * 0.004);
    for (let k = 0; k < 6000; k++) add(rnd() * 6, rnd() * 4, 2.7);
    const pos = new Float32Array(pts), n = pts.length / 3;
    const I4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const YUP = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1];   // the cloud's Z up metres → the viewer's Y up
    let M = CS.planMatrix(YUP, I4, I4, I4);
    const fz = CS.floorZ(pos, n, M);
    ok(near(fz, 350, 3), 'floorZ: the floor band found 350 mm up (' + fz.toFixed(1) + ')');
    let sl = CS.slicePoints(pos, n, M, { cutZ: 1200 + 350, thick: 100 });
    ok(sl.n > 500 && sl.n < 1000 && Array.from(sl.zs).every((z) => z >= 1500 - 1e-3 && z <= 1600 + 1e-3), 'slicePoints at 1200 over the scan floor (100 thick): only wall points (' + sl.n + ')');
    const sq = CS.squareAngle(sl.xy, sl.n);
    ok(sq && near(sq.angle, 10, 0.15) && sq.strength > 0.6, 'squareAngle: the walls run at 10° (' + sq?.angle.toFixed(2) + '°, strength ' + sq?.strength.toFixed(2) + ')');
    const g = new CS.SliceGrid(sl.xy, sl.n, 200);
    const corner = R(6, 0).map((v) => v * 1000), q = g.nearest(corner[0] + 30, corner[1] - 20, 150);
    ok(q && Math.hypot(q[0] - corner[0], q[1] - corner[1]) < 150 && g.nearest(-50000, -50000, 100) === null, 'SliceGrid.nearest: a slice point near the corner; nothing far away');
    // aligned: the floor to the level (−350), turned square (−10° about the room's middle) — as cloud-ui.js would apply it
    const mid = R(3, 2).map((v) => v * 1000);
    const A = mul4(CS.rotZ(-sq.angle, mid), CS.moveZ(-fz));
    const Mvp = CS.planMatrix(I4, I4, I4, I4);   // the scene → plan part (no layer)
    const adj = CS.planAdjust(A, Mvp);
    M = CS.planMatrix(mul4(adj, YUP), I4, I4, I4);
    ok(near(CS.floorZ(pos, n, M), 0, 3), 'after Align to the level: the floor at 0');
    sl = CS.slicePoints(pos, n, M, { cutZ: 1200, thick: 100 });
    const sq2 = CS.squareAngle(sl.xy, sl.n);
    ok(sq2 && Math.abs(sq2.angle) < 0.15, 'after Turn square: the walls run at ' + sq2?.angle.toFixed(2) + '°');
    const thin = CS.slicePoints(pos, n, M, { cutZ: 1200, thick: 100, max: 100 });
    ok(thin.n === 100 && thin.total === sl.total, 'a slice thinned evenly to its budget (100 of ' + sl.total + ')');

    // 0.6.1 FIX-061-SQUARE (Discord, scan-to-BIM: in Model coordinates "Turn it square" once gave -4.17° and swung the scan
    // out of view; undone and done again, -3.2°). The turn's centre is the middle of the walls that gave the angle, and the
    // angle does not depend on how far from the origin the scan lies (a national grid puts it 460 km out).
    {
      const T = (x, y) => [1000, 0, 0, 0, 0, 1000, 0, 0, 0, 0, 1000, 0, x, y, 0, 1];   // cloud metres → plan mm, moved
      const pts2 = [], rnd2 = (() => { let x = 777; return () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; }; })();
      const b = 3.2 * Math.PI / 180, Rb = (x, y) => [x * Math.cos(b) - y * Math.sin(b), x * Math.sin(b) + y * Math.cos(b)];
      for (let k = 0; k < 20000; k++) {
        const t = rnd2(), e = (rnd2() - 0.5) * 0.01, s4 = k % 4, z = 1.15 + rnd2() * 0.1;
        const q = Rb(...(s4 === 0 ? [t * 12, e] : s4 === 1 ? [12 + e, t * 9] : s4 === 2 ? [t * 12, 9 + e] : [e, t * 9]));
        pts2.push(q[0], q[1], z);
      }
      for (let k = 0; k < 3000; k++) pts2.push(55 + rnd2() * 4, 40 + rnd2() * 4, 1.15 + rnd2() * 0.1);   // a tree 60 m off
      const pos2 = new Float32Array(pts2), n2 = pts2.length / 3;
      const res = [[0, 0], [155000e3, 463000e3]].map(([x, y]) => {
        const s2 = CS.slicePoints(pos2, n2, T(x, y), { cutZ: 1200, thick: 100 });
        let cx = 0, cy = 0; for (let i = 0; i < s2.n; i++) { cx += s2.xy[2 * i] - x; cy += s2.xy[2 * i + 1] - y; }
        const q = CS.squareAngle(s2.xy, s2.n);
        return { q, about: q && [q.about[0] - x, q.about[1] - y], all: [cx / s2.n, cy / s2.n], f64: s2.xy instanceof Float64Array };
      });
      const [o, far] = res;
      const room = Rb(6, 4.5).map((v) => v * 1000);
      ok(o.q && near(o.q.angle, 3.2, 0.1) && far.q && Math.abs(far.q.angle - o.q.angle) < 1e-6 && Math.abs(far.q.strength - o.q.strength) < 1e-9,
        'squareAngle 460 km from the origin = beside it (' + o.q?.angle.toFixed(3) + '° / ' + far.q?.angle.toFixed(3) + '°, strength ' + o.q?.strength.toFixed(2) + ' / ' + far.q?.strength.toFixed(2) + ')');
      ok(far.f64 && Math.hypot(far.about[0] - o.about[0], far.about[1] - o.about[1]) < 1, 'slicePoints keeps plan millimetres in a Float64Array: the walls\' middle lands on the same spot there too');
      ok(Math.hypot(o.about[0] - room[0], o.about[1] - room[1]) < 300 && Math.hypot(o.all[0] - room[0], o.all[1] - room[1]) > 5000 && o.q.walls > 1000,
        'the turn\'s centre = the middle of the walls (' + o.about.map(Math.round) + ', the room\'s ' + room.map(Math.round) + '), not of every slice point (' + o.all.map(Math.round) + ': the tree pulls it ' + (Math.hypot(o.all[0] - room[0], o.all[1] - room[1]) / 1000).toFixed(1) + ' m away)');
    }

    // Discord (scan-to-BIM, 2026-10-19): walls drawn on an empty model made the cloud "jump" ~1.5 m. cc-ifc centres a model
    // on its first element; the reload after an edit (bimcraft.js rebuildNow) found a new centre, so the model moved in the
    // scene and the cloud did not. The reload now keeps the coordination matrix.
    const Bc = await building();
    const L1 = Bc.levels[0].guid, L2 = Bc.levels[1].guid, room = [[10000, 5000], [22000, 5000], [22000, 14000], [10000, 14000]];
    const Ct = (e, m) => [...e.api.GetCoordinationMatrix(m.modelID)];
    const box = (m) => { const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity]; for (const b of m.batches) for (let i = 0; i < b.positions.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], b.positions[i + k]); hi[k] = Math.max(hi[k], b.positions[i + k]); } return [lo, hi]; };
    let mk = await quiet((b) => Bc.eng.load(b))(Bc.ed.save());
    const C0 = Ct(Bc.eng, mk);
    let firstBox = null, drift = 0, oldWay = null;
    for (let i = 0; i < 4; i++) {
      Bc.ed.modelChange(Bc.OPS.drawWalls({ storey: L1, segs: [{ a: room[i], b: room[(i + 1) % 4] }], typeKey: 'ext-2x6', topLevel: L2 }), { label: 'w', verb: 'Drew' });
      const bytes = Bc.ed.save();
      if (i === 0) { const e2 = await quiet(IfcModel.create)(WebIFC, null); const m2 = await quiet((b) => e2.load(b))(bytes); oldWay = Ct(e2, m2); }
      mk = await quiet((b) => Bc.eng.load(b, undefined, { keyBase: mk.keyBase, coordination: Bc.eng.api.GetCoordinationMatrix(mk.modelID) }))(bytes);
      Bc.ed.reindex();
      drift = Math.max(drift, ...Ct(Bc.eng, mk).map((v, k) => Math.abs(v - C0[k])));
      if (i === 0) firstBox = box(mk);
    }
    ok(near(oldWay[13], -1.5, 1e-6) && Math.hypot(oldWay[12], oldWay[14]) > 1, 'without it: the first wall moves the model\'s frame 1.5 m down and ' + Math.hypot(oldWay[12], oldWay[14]).toFixed(1) + ' m across (the reported jump)');
    ok(drift === 0, 'reloaded after each of four walls with the matrix kept: the frame never moves');
    const b4 = box(mk);
    ok(near(b4[0][1], firstBox[0][1], 1e-6) && near(b4[1][1], firstBox[1][1], 1e-6) && near(firstBox[0][1], 0, 1e-6) && b4[0][0] < firstBox[0][0] + 0.2,
      'the walls stay where they were drawn in the scene (floor at 0, the first wall unmoved)', JSON.stringify([firstBox, b4]));
  }

  // ============================================================================================ 0.6.1 FIX-061-WALL-SIDE
  if (want('wallside')) {
    console.log('== 0.6.1 FIX-061-WALL-SIDE: walls drawn on a face, both ways round (model-tools.js wallPath, model-ops.js drawWallPath)');
    const { wallType, typeThickness, locationLine } = await import(path.join(APP, 'model-walls.js'));
    const th = typeThickness(wallType('ext-2x6'));
    const rect = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
    // the chain as model-ui.js wallPoint draws it: one drawWallPath per click with every point so far, the walls already
    // made updated, the last click on the first point closing the room
    const drawChain = async (pts, reference, side) => {
      const B = await building();
      const L1 = B.levels[0].guid, L2 = B.levels[1].guid, chain = { points: [pts[0]], guids: [] };
      const just = reference === 'outside' ? 'exterior' : reference === 'inside' ? 'interior' : 'center';
      for (const q of [...pts.slice(1), pts[0]]) {
        chain.points.push(q);
        const r = B.ed.modelChange(B.OPS.drawWallPath({ storey: L1, points: chain.points.slice(), guids: chain.guids, typeKey: 'ext-2x6', thickness: th, reference, extSide: side, justification: just, topLevel: L2 }), { label: 'w' });
        for (const g of r.made.keys()) chain.guids.push(g);
      }
      return B.OPS.snapshotModel(B.ed).walls;
    };
    // where the body lies: + = outside the drawn rectangle (its centre line further out than the drawn line), − = inside
    const inRect = (p) => p[0] > 1 && p[0] < 7999 && p[1] > 1 && p[1] < 4999;
    const mid = (w) => [(w.a[0] + w.b[0]) / 2, (w.a[1] + w.b[1]) / 2];
    const bodyOut = (walls) => walls.every((w) => !inRect(mid(w)));
    const bodyIn = (walls) => walls.every((w) => inRect(mid(w)));
    const extOut = (w) => { // the face extSide names is the one away from the rectangle's middle
      const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]), n = [-(w.b[1] - w.a[1]) / L, (w.b[0] - w.a[0]) / L], s = w.extSide === 'right' ? -1 : 1, m = mid(w);
      return Math.hypot(m[0] + n[0] * s * 100 - 4000, m[1] + n[1] * s * 100 - 2500) > Math.hypot(m[0] - 4000, m[1] - 2500);
    };
    const onLine = (walls) => walls.every((w) => { const l = locationLine(w), p = [(l.a[0] + l.b[0]) / 2, (l.a[1] + l.b[1]) / 2]; return Math.min(Math.abs(p[0]), Math.abs(p[0] - 8000), Math.abs(p[1]), Math.abs(p[1] - 5000)) < 0.5; });
    const ccw = rect, cw = [rect[0], rect[3], rect[2], rect[1]];
    for (const [name, pts, outSide] of [['anticlockwise', ccw, 'right'], ['clockwise', cw, 'left']]) {
      for (const reference of ['inside', 'outside']) {
        const walls = await drawChain(pts, reference, outSide);
        const ok1 = walls.length === 4 && (reference === 'inside' ? bodyOut(walls) : bodyIn(walls)) && walls.every(extOut) && onLine(walls);
        ok(ok1, name + ', ' + (reference === 'inside' ? 'Inside face' : 'Outside face') + ', Outside on ' + outSide + ' (the outside of the loop): the body ' + (reference === 'inside' ? 'outside' : 'inside') + ' the drawn line, the outside face outside, the location line on the line drawn',
          JSON.stringify(walls.map((w) => [mid(w).map(Math.round), w.extSide, w.justification])));
      }
    }
  }

  // ============================================================================================ DF.23 traced drawing → walls
  if (want('df23')) {
    console.log('== DF.23 from a traced drawing to walls (model-trace.js)');
    const TR = await import(path.join(APP, 'model-trace.js'));
    const { readDxfModel } = await import(path.join(APP, 'dxf-model.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    const dxf = traceDxf();
    const model = readDxfModel(dxf);
    const parts = TR.drawingParts(model, { unitMm: 1 });
    ok(parts.layers.find((l) => l.name === 'A-WALL')?.segs === 8 && parts.layers.find((l) => l.name === 'A-ANNO')?.segs === 2 && parts.blocks.map((b) => b.name + '×' + b.count).join() === 'DOOR36×1,WIN48×1', 'drawingParts: 8 wall lines on A-WALL, 2 on A-ANNO, the door and window blocks once each');
    ok(parts.layers.find((l) => l.name === 'A-DOOR') === undefined && parts.inserts.find((i) => i.block === 'DOOR36')?.box?.map(Math.round).join() === '1000,100,1900,1000', 'the door\'s block extents placed where it is (1000,100 – 1900,1000)');
    let r = TR.wallsFromLines(parts.segs.get('A-WALL'), { mode: 'pairs', maxT: 400 });
    const key4 = (ws) => ws.map((x) => [x.a, x.b].map((q) => q.map(Math.round).join(',')).sort().join('–')).sort().join(' ');
    ok(r.walls.length === 4 && r.walls.every((x) => near(x.t, 200, 1e-6)) && key4(r.walls) === '0,0–0,4000 0,0–6000,0 0,4000–6000,4000 6000,0–6000,4000' && !r.left.length, 'pairs: four walls 200 thick on the centre lines, their corners run together (0,0 – 6000,4000)', key4(r.walls));
    const inner = [[100, 100, 5900, 100], [5900, 100, 5900, 3900], [5900, 3900, 100, 3900], [100, 3900, 100, 100]];
    r = TR.wallsFromLines(inner, { mode: 'right', t: 200 });
    ok(r.walls.length === 4 && key4(r.walls) === '0,0–0,4000 0,0–6000,0 0,4000–6000,4000 6000,0–6000,4000', 'one face (the inner one), the walls to its right: offset together, mitred at the corners', key4(r.walls));
    r = TR.wallsFromLines([[0, 0, 5000, 0], [5000, 0, 5000, 3000], [0, 0, 5000, 0], [10, 10, 50, 10]], { mode: 'center', t: 150 });
    ok(r.walls.length === 2, 'centre lines: one wall per line, the same line twice once, a 40 mm scrap left out');
    const pw = TR.wallsFromLines(parts.segs.get('A-WALL'), { mode: 'pairs', maxT: 400 }).walls;
    const ops = TR.openingsFromInserts(parts.inserts, { DOOR36: { typeKey: 'door-single' }, WIN48: { typeKey: 'win-casement' } }, pw);
    const dOp = ops.find((o) => o.kind === 'door'), wOp = ops.find((o) => o.kind === 'window');
    ok(ops.length === 2 && near(dOp.width, 900, 1) && near(pw[dOp.wall].a[1] + pw[dOp.wall].b[1], 0, 1) && wOp && near(wOp.width, 1200, 1), 'blocks → a door 900 wide in the south wall, a window 1200 wide', JSON.stringify(ops));
    // a real DWG through BimCraft's own cc-dwg copy: the public kitchen fixture (inches)
    const { readDwg } = await import(path.join(APP, 'dwg/read.js'));
    const kd = TR.drawingParts(readDwg(new Uint8Array(fs.readFileSync(path.join(ROOT, 'fixtures/dwg/kitchen-equipment.dwg')))));
    const kw = kd.layers.find((l) => l.name === 'A-WALL');
    ok(kd.unitMm === 25.4 && kw?.segs >= 4 && kd.blocks.length > 10 && kd.inserts.filter((i) => i.box).length > 100, 'the kitchen DWG (cc-dwg): inches → 25.4 mm, its A-WALL lines (' + kw?.segs + '), ' + kd.blocks.length + ' blocks placed with their extents');
    // into a model, one undo step, with the underlay
    const B = await building();
    const { ed, OPS, levels } = B;
    const underlay = { name: 'traced.dxf', units: 'mm', lines: [...parts.segs.values()].flat().map((q) => [...q]) };
    const n0 = ed.changes.length;
    ed.modelChange(TR.traceDrawing({ storey: levels[0].guid, walls: pw, openings: ops, typeKey: 'ext-2x6', topLevel: levels[1].guid, underlay }), { label: 'From a drawing', verb: 'Made' });
    const snap = OPS.snapshotModel(ed);
    ok(ed.changes.length === n0 + 1 && snap.walls.length === 4 && snap.walls.every((x) => near(x.t, 200, 0.05)) && snap.openings.length === 2 && snap.derived.spaces.length === 1, 'made: one undo step, four 200 mm walls (Exterior 2×6 at 200), a door and a window, the room found');
    const w = new ModelWriter(WebIFC, ed.api, ed.mid);
    let ul = TR.readUnderlays(w);
    ok(ul.length === 1 && ul[0].lines.length === 10 && ul[0].storey === levels[0].id && /IFCANNOTATION\([^;]*'Underlay'/.test(new TextDecoder().decode(ed.save())), 'the drawing stays as an underlay on Level 1 (an IfcAnnotation, its 10 lines)');
    const back = await openText(new TextDecoder().decode(ed.save()));
    ok(TR.readUnderlays(back.w)[0]?.lines.length === 10, 'saved and reopened: the underlay\'s lines are read back');
    saved.trace = ed.save();
    ed.modelChange(TR.removeUnderlays([ul[0].guid]));
    ok(!TR.readUnderlays(new ModelWriter(WebIFC, ed.api, ed.mid)).length && !danglingRefs(new TextDecoder().decode(ed.save())).length, 'the underlay removed; no dangling references');
    ed.undo(); ed.undo();
    ok(OPS.snapshotModel(ed).walls.length === 0 && !TR.readUnderlays(new ModelWriter(WebIFC, ed.api, ed.mid)).length, 'undo: back to the empty level');
  }

  // ============================================================================================ DF.24 CivilCraft's ground
  if (want('df24')) {
    console.log('== DF.24 LandXML surfaces as the ground (res-terrain.js readLandXmlSurfaces)');
    const RT = await import(path.join(APP, 'res-terrain.js'));
    const TIN = await RT.loadTin();
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    // a surface written by CivilCraft's own LandXML writer (civilcraft/dev/landxml.js), in US survey feet
    const pts = [];
    for (let i = 0; i <= 10; i++) for (let j = 0; j <= 8; j++) pts.push({ x: 1000 + i * 10, y: 5000 + j * 10, z: 100 + i * 0.5 + j * 0.25 });
    const sf = TIN.buildSurface({ points: pts, breaklines: [], maxEdge: 0 }).surface;
    const civil = await import(path.join(ROOT, 'public_html/assets/apps/civilcraft/dev/landxml.js'));
    const xml = civil.writeLandXml({ name: 'Civil test', units: 'ft', surfaces: [{ name: 'EG', surface: sf }, { name: 'FG', surface: sf }] });
    const lx = RT.readLandXmlSurfaces(xml);
    const f0 = sf.toFaces();
    ok(lx.unit === 'ftUS' && lx.surfaces.length === 2 && lx.surfaces[0].name === 'EG' && lx.surfaces[0].pts.length === f0.pts.length && lx.surfaces[0].faces.length === f0.faces.length, 'CivilCraft\'s export (USSurveyFoot): two TIN surfaces, EG with every point and triangle (' + lx.surfaces[0]?.pts.length + ' / ' + lx.surfaces[0]?.faces.length + ')');
    const p0 = lx.surfaces[0].pts[0], q0 = f0.pts[0];
    ok(near(p0.x, q0.x, 1e-4) && near(p0.y, q0.y, 1e-4) && near(p0.z, q0.z, 1e-4) && /<P id="1">5000 1000 100<\/P>/.test(xml), '"N E Z": northing first, read as x = easting, y = northing');
    // BimCraft's own export reads back too (metres)
    const own = RT.readLandXmlSurfaces(RT.landXml([{ name: 'Existing ground', surface: sf }], { name: 'x', unit: 'm' }));
    ok(own.unit === 'm' && own.surfaces[0].faces.length === f0.faces.length, 'BimCraft\'s own LandXML export reads back');
    let key = ''; try { RT.readLandXmlSurfaces('<LandXML><Surfaces/></LandXML>'); } catch (e) { key = e.key; }
    ok(key === 'res.err.landxml', 'a LandXML file with no surface: refused (res.err.landxml)');
    ok(RT.readLandXmlSurfaces('<LandXML><Units><Metric linearUnit="millimeter"/></Units><Surfaces><Surface name="A"><Definition surfType="TIN"><Pnts><P id="a">0 0 1</P><P id="b">0 1000 2</P><P id="c">1000 0 3</P><P id="d">1000 1000 4</P></Pnts><Faces><F>a b c</F><F i="1">b d c</F></Faces></Definition></Surface><Surface name="G"><Definition surfType="grid"/></Surface></Surfaces></LandXML>').surfaces[0].faces.length === 1, 'any point ids, an invisible face left out, a grid surface named in the notes');
    // into the model: the ground keeps CivilCraft's own triangles
    const B = await building();
    const { ed } = B;
    const s0 = lx.surfaces[0], mm = 1200 / 3937 * 1000;
    const model = s0.pts.map((p) => ({ x: (p.x - 1050) * mm, y: (p.y - 5040) * mm, z: (p.z - 100) * mm }));
    ed.modelChange(RT.placeTerrain({ source: 'landxml', points: model, faces: s0.faces, unit: 'ftUS', datum: 100, interval: 500 }), { label: 'Terrain' });
    const trn = RT.readTerrain(new ModelWriter(WebIFC, ed.api, ed.mid));
    ok(trn && trn.source === 'landxml' && trn.pts.length === s0.pts.length && trn.faces.length === s0.faces.length, 'placed as the ground: the same points and the same ' + s0.faces.length + ' triangles (not triangulated again)');
    saved.landxml = ed.save();
  }

  // ============================================================================================ DF.21 linked models
  if (want('df21')) {
    console.log('== DF.21 linked models (model-links.js)');
    const LK = await import(path.join(APP, 'model-links.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    const { readGeoref } = await import(path.join(APP, 'ifc-geo.js'));
    const { apply4, mul4 } = await import(path.join(APP, 'ifc-util.js'));
    const m = LK.pairsMatrix([[[0, 0, 0], [5000, 2000, 300]], [[1000, 0, 0], [5000, 3000, 300]]]);
    const q = apply4(m, 500, 0, 0);
    ok(near(q[0], 5000, 1e-6) && near(q[1], 2500, 1e-6) && near(q[2], 300, 1e-6), 'pairsMatrix: two pairs turn the link 90° and move it (500, 0, 0) → (5000, 2500, 300)');
    const F = mul4([1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1], [0.001, 0, 0, 0, 0, 0.001, 0, 0, 0, 0, 0.001, 0, -3, 1, 2, 1]);
    const back = LK.fileOfScene(LK.sceneAdjust(m, F), F);
    ok(back.every((v, i) => near(v, m[i], 1e-9)), 'sceneAdjust / fileOfScene: file mm ↔ the scene and back');
    const g = await openText(fixtureIfc({ georef: 'map' }));
    const geo = readGeoref(g.api, g.mid);
    const mm = LK.mapMatrix(geo, geo, 1, 1);
    ok(mm && mm.every((v, i) => near(v, LK.I4[i], 1e-6)), 'mapMatrix: two files on the same map conversion line up as they are');
    ok(LK.mapMatrix(geo, null, 1, 1) === null, 'mapMatrix: one file without a map conversion → null (the link says so)');
    // in a model: the document reference and its placement
    const B = await building();
    const { ed } = B;
    const w = () => new ModelWriter(WebIFC, ed.api, ed.mid);
    const n0 = ed.changes.length;
    ed.modelChange(LK.addLink({ name: 'Structure.ifc', location: 'Structure.ifc', mode: 'file' }), { label: 'Link' });
    let L = LK.readLinks(w());
    let txt = new TextDecoder().decode(ed.save());
    ok(ed.changes.length === n0 + 1 && L.length === 1 && L[0].id === 'link-1' && L[0].name === 'Structure.ifc' && L[0].mode === 'file' && L[0].m.every((v, i) => v === LK.I4[i]), 'a link: one undo step, link-1, shared coordinates');
    ok(/IFCDOCUMENTREFERENCE\('Structure\.ifc','link-1','Structure\.ifc',\$,\$\)/.test(txt) && /IFCRELASSOCIATESDOCUMENT\(/.test(txt) && /'CadCraft_Links'/.test(txt), 'written as IfcDocumentReference + IfcRelAssociatesDocument on the project, its placement in CadCraft_Links');
    ed.modelChange(LK.changeLink('link-1', { mode: 'points', m }));
    L = LK.readLinks(w());
    ok(L[0].mode === 'points' && near(L[0].m[12], m[12], 1e-6), 'placed by points: stored with the link');
    ed.modelChange(LK.addLink({ name: 'MEP.ifc', location: 'MEP.ifc' }));
    ok(LK.readLinks(w()).map((x) => x.id).join() === 'link-1,link-2', 'a second link: link-2');
    const back2 = await openText(new TextDecoder().decode(ed.save()));
    ok(LK.readLinks(back2.w).length === 2 && LK.readLinks(back2.w)[0].mode === 'points', 'saved and reopened: both links with their placements');
    saved.links = ed.save();
    ed.modelChange(LK.removeLink('link-2'));
    txt = new TextDecoder().decode(ed.save());
    ok(LK.readLinks(w()).length === 1 && !/'MEP\.ifc'/.test(txt) && !danglingRefs(txt).length, 'removed: its reference gone; no dangling references');
    ed.undo();
    ok(LK.readLinks(w()).length === 2, 'undo brings it back');
  }

  // ============================================================================================ DF.19 views the BIM way
  if (want('df19')) {
    console.log('== DF.19 views the BIM way (views-model.js, model-plan.js planCut, res-sheets.js composeSheet)');
    const V = await import(path.join(APP, 'views-model.js'));
    const { planCut } = await import(path.join(APP, 'model-plan.js'));
    const RS = await import(path.join(APP, 'res-sheets.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    // the plan cut with a view range: a box from 1500 to 2000 (above the cut), one from 0 to 500 (below), one through the cut
    const box = (x, z0, z1) => { const P = [], I = []; for (const z of [z0, z1]) for (const [a, b] of [[0, 0], [1, 0], [1, 1], [0, 1]]) P.push(x + a * 500, b * 500, z); for (const [a, b, c] of [[0, 1, 2], [0, 2, 3], [4, 6, 5], [4, 7, 6], [0, 4, 5], [0, 5, 1], [1, 5, 6], [1, 6, 2], [2, 6, 7], [2, 7, 3], [3, 7, 4], [3, 4, 0]]) I.push(a, b, c); return { P, I }; };
    const parts = [box(0, 1500, 2000), box(1000, 0, 500), box(2000, 0, 2500)];
    const P = [], I = [], E = { ids: [], t0: [], tn: [], v0: [], vn: [] };
    parts.forEach((b, k) => { const v0 = P.length / 3; E.ids.push(10 + k); E.t0.push(I.length / 3); E.tn.push(b.I.length / 3); E.v0.push(v0); E.vn.push(b.P.length / 3); P.push(...b.P); I.push(...b.I.map((i) => i + v0)); });
    const model = { batches: [{ storey: 1, positions: Float32Array.from(P), indices: Uint32Array.from(I), elems: E }] };
    const I4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    let c = planCut(model, { M: I4, storey: 1, cutZ: 1200 });
    ok(c.cut.has(12) && c.below.has(11) && !c.below.has(10) && !c.above.size, 'no top: the box through the cut is cut, the low one drawn below, the high one left out');
    c = planCut(model, { M: I4, storey: 1, cutZ: 1200, top: 3000 });
    ok(c.above.has(10) && c.above.get(10).length > 0 && c.below.has(11), 'top 3000: the box between the cut and the top comes back as "above" (drawn dashed)');
    c = planCut(model, { M: I4, storey: 1, cutZ: 1200, top: 1800 });
    ok(c.above.has(10), 'top 1800: a box starting at 1500 still counts (it starts under the top)', JSON.stringify([...c.above.keys()]));
    c = planCut(model, { M: I4, storey: 1, cutZ: 1200, top: 1400 });
    ok(!c.above.has(10), 'top 1400: the box starting at 1500 is above the top: left out');
    c = planCut(model, { M: I4, storey: 1, cutZ: 1200, bottom: 1000, depth: 50 });
    ok(!c.below.has(11) && c.cut.has(12), 'bottom 1000 (depth 50): the box under 950 is no longer drawn');
    c = planCut(model, { M: I4, storey: 1, cutZ: 2200 });
    ok(c.cut.has(12) && c.below.has(10) && c.below.has(11), 'cut at 2200: both lower boxes below it');

    // in a model: a plan's range, templates, sheets — each one undo step, all in the IFC
    const B = await building();
    const { ed, levels } = B;
    const w = () => new ModelWriter(WebIFC, ed.api, ed.mid);
    const [L1, L2] = levels;
    let n0 = ed.changes.length;
    ed.modelChange(V.setPlanView(L1.guid, { cut: 1500, top: 2700, bottom: 0, depth: 100, hiddenClasses: ['IfcFurniture', 'bad class'], hiddenGuids: ['0abc'] }), { label: 'Range' });
    let pv = V.readPlanViews(w()).get(L1.id);
    ok(ed.changes.length === n0 + 1 && pv && pv.cut === 1500 && pv.top === 2700 && pv.depth === 100 && pv.hiddenClasses.join() === 'IfcFurniture' && pv.hiddenGuids.join() === '0abc', 'a plan\'s view range: one undo step; cut 1500, top 2700, depth 100, furniture hidden (a non-class dropped), one element hidden', JSON.stringify(pv));
    let txt = new TextDecoder().decode(ed.save());
    ok(/'CadCraft_PlanView'/.test(txt) && /IFCPROPERTYSINGLEVALUE\('Cut',\$,IFCLENGTHMEASURE\(1500\.?\)/.test(txt), 'written on the level as CadCraft_PlanView (Cut an IfcLengthMeasure)');
    let eff = V.effectiveView(pv, [], L1.height);
    ok(eff.cut === 1500 && eff.top === 2700 && eff.hiddenClasses.has('IfcFurniture') && eff.hiddenGuids.has('0abc') && eff.template === '', 'effectiveView: its own settings');
    ok(V.effectiveView({ ...pv, top: 0 }, [], 3200).top === 3200, 'top 0 = the level\'s height');
    let refused = '';
    try { ed.modelChange(V.setPlanView(L1.guid, { cut: 3000, top: 2700 })); } catch (e) { refused = e.key || e.message; }
    ok(refused === 'model.err.vr.order' && V.readPlanViews(w()).get(L1.id).cut === 1500, 'a cut above the top: refused (model.err.vr.order), nothing changed');
    // templates
    n0 = ed.changes.length;
    ed.modelChange(V.saveTemplate({ name: '  Furniture   plan ', cut: 1100, top: 0, bottom: 0, depth: 50, hidden: ['IfcSpace'] }));
    let T = V.readTemplates(w());
    ok(ed.changes.length === n0 + 1 && T.length === 1 && T[0].name === 'Furniture plan' && T[0].cut === 1100 && T[0].hidden.join() === 'IfcSpace', 'a view template: one undo step, its name tidied', JSON.stringify(T));
    refused = '';
    try { ed.modelChange(V.saveTemplate({ name: 'Furniture plan', cut: 1200 })); } catch (e) { refused = e.key; }
    ok(refused === 'model.err.vr.name', 'a second template of that name: refused');
    ed.modelChange(V.setPlanView(L2.guid, { template: 'Furniture plan' }));
    eff = V.effectiveView(V.readPlanViews(w()).get(L2.id), V.readTemplates(w()), L2.height);
    ok(eff.template === 'Furniture plan' && eff.cut === 1100 && eff.hiddenClasses.has('IfcSpace') && !eff.hiddenClasses.has('IfcFurniture'), 'a plan using it takes its cut and categories');
    refused = '';
    try { ed.modelChange(V.setPlanView(L2.guid, { template: 'Nope' })); } catch (e) { refused = e.key; }
    ok(refused === 'model.err.vr.template', 'a template that is not there: refused');
    ed.modelChange(V.saveTemplate({ name: 'Furnished', cut: 1000, hidden: [] }, 'Furniture plan'));
    pv = V.readPlanViews(w()).get(L2.id);
    ok(V.readTemplates(w()).map((x) => x.name).join() === 'Furnished' && pv.template === 'Furnished', 'renamed: the plan using it follows the new name');
    ed.modelChange(V.deleteTemplate('Furnished'));
    pv = V.readPlanViews(w()).get(L2.id);
    ok(!V.readTemplates(w()).length && pv.template === '' && pv.cut === 1000, 'deleted: the plan keeps its settings as its own');
    ed.undo();
    ok(V.readTemplates(w()).length === 1 && V.readPlanViews(w()).get(L2.id).template === 'Furnished', 'undo brings the template back, the plan using it again');
    // sheets
    n0 = ed.changes.length;
    const spec = { number: 'A-501', title: 'Plan and doors', paper: 'tabloid', views: [{ kind: 'plan', ref: L1.guid, x: 150, y: 150, ratio: 50 }, { kind: 'schedule', ref: 'doors', x: 330, y: 160, ratio: 0 }, { kind: 'bogus', ref: 'x', x: 0, y: 0 }] };
    ed.modelChange(V.saveSheet(spec));
    let S = V.readSheets(w());
    ok(ed.changes.length === n0 + 1 && S.length === 1 && S[0].id === 'sheet-1' && S[0].number === 'A-501' && S[0].views.length === 2 && S[0].views[0].ratio === 50, 'a sheet of your own: one undo step, sheet-1, two views kept (an unknown kind dropped)', JSON.stringify(S));
    ed.modelChange(V.saveSheet({ ...S[0], title: 'Ground floor' }));
    ed.modelChange(V.saveSheet({ number: 'A-502', title: 'Second', views: [] }));
    S = V.readSheets(w());
    ok(S.length === 2 && S[0].title === 'Ground floor' && S[1].id === 'sheet-2', 'saved again under its id; a second sheet is sheet-2, sorted by number');
    txt = new TextDecoder().decode(ed.save());
    ok(/'CadCraft_Sheets'/.test(txt) && /'CadCraft_ViewTemplates'/.test(txt) && !danglingRefs(txt).length, 'sheets and templates on the project as CadCraft_Sheets / CadCraft_ViewTemplates; no dangling references');
    saved.views = ed.save();
    const re = await openText(new TextDecoder().decode(saved.views));
    ok(V.readSheets(re.w).length === 2 && V.readTemplates(re.w).length === 1 && V.readPlanViews(re.w).size === 2, 'saved and reopened: both sheets, the template and both plans\' settings');
    ed.modelChange(V.deleteSheet('sheet-2'));
    ok(V.readSheets(w()).length === 1, 'a sheet deleted');
    // composing a sheet from the model's drawings
    const input = { plans: [{ ref: L1.guid, title: 'Level 1 plan', scene: { walls: [{ poly: [[0, 0], [6000, 0], [6000, 4000], [0, 4000]] }] } }], elevations: [], sections: [],
      schedules: [{ ref: 'doors', title: 'Door schedule', head: ['Mark', 'Width'], rows: [['D1', '900'], ['D2', '800']], total: null }] };
    const sh = RS.composeSheet(spec, input, { paper: 'tabloid', units: 'mm', project: 'Test' });
    const pl = sh.views.find((v) => v.kind === 'plan'), sc = sh.views.find((v) => v.kind === 'schedule');
    ok(pl && pl.ratio === 50 && near((pl.box[0] + pl.box[2]) / 2, 150, 1e-6) && near((pl.box[1] + pl.box[3]) / 2, 150, 1e-6) && pl.label === '1:50', 'composeSheet: the plan at 1:50, centred where it was put', JSON.stringify(pl));
    ok(near(pl.box[2] - pl.box[0], (6000 + 2 * (6000 * 0.03 + 300)) / 50, 1e-6), 'its size on the sheet = the plan (with its margin) at 1:50');
    ok(sc && near(sc.box[2] - sc.box[0], 130, 1e-9) && sh.items.some((it) => it.t === 'text' && it.s === 'D2'), 'the door schedule drawn as a table');
    const auto = RS.composeSheet({ ...spec, views: [{ kind: 'plan', ref: L1.guid, x: 200, y: 140, ratio: 0 }] }, input, { paper: 'tabloid', units: 'mm' });
    ok(auto.views[0].ratio >= 50 && (auto.views[0].box[2] - auto.views[0].box[0]) <= 431.8 / 3 + 1e-6, 'scale 0: the largest standard scale that fits a third of the sheet (' + auto.views[0].label + ')');
    const gone = RS.composeSheet({ ...spec, views: [{ kind: 'plan', ref: 'deleted-level', x: 1, y: 1 }] }, input, { units: 'mm' });
    ok(gone.missing.join() === '0' && !gone.views.length, 'a view whose level is gone: listed as missing, nothing drawn');
    const pdf = RS.setPdf([sh], { paper: 'tabloid', title: 'Test' });
    ok(new TextDecoder().decode(pdf.slice(0, 8)).startsWith('%PDF-1.4') && /A-501/.test(new TextDecoder('latin1').decode(pdf)), 'the sheet as a PDF page with its number in the title block');
    ok(RS.scalesFor('mm').some((x) => x.ratio === 100 && x.label === '1:100') && RS.scalesFor('ftin')[3].label === '1/4" = 1\'-0"', 'scalesFor: the standard scales the sheet editor offers');
  }

  // ============================================================================================ DF.25 assistant tools
  if (want('df25')) {
    console.log('== DF.25 assistant tools (agents.js through host.js\'s dispatcher)');
    const AG = await import(path.join(APP, 'agents.js'));
    const { createDispatcher } = await import(path.join(APP, 'host.js'));
    const B = await building();
    const { ed } = B;
    let allowed = ['read'];
    const d = createDispatcher({ server: { name: 'bimcraft', title: 'BimCraft', version: 'test' }, allowed: () => allowed });
    for (const def of AG.modelTools({ ed: () => ed, apply: async (label, op) => ed.modelChange(op, { label: 'Assistant: ' + label }) })) d.tool(def);
    const call = async (name, a = {}) => { const r = await d.call(name, a); return { r, v: r.structuredContent, text: r.content?.[0]?.text || '' }; };
    ok(d.list().map((x) => x.name).join() === 'model_describe,walls_list', 'read only: model_describe, walls_list listed (finding elements stays bim-agent.js\'s elements_find)');
    let x = await call('walls_add', { points: [[0, 0], [6000, 0]] });
    ok(x.r.isError && /edit permission/.test(x.text) && ed.changes.length === 0, 'walls_add refused without edit; nothing changes');
    allowed = ['read', 'edit'];
    ok(d.list().length === 12, 'with edit: 12 tools (0.7 AS.5: + element_set, elements_delete, elements_move, wall_change, opening_change)');
    x = await call('model_describe');
    ok(x.v.units === 'mm' && x.v.levels.length === 2 && x.v.levels[0].name === 'Level 1' && x.v.walls.count === 0 && x.v.types.walls.includes('ext-2x6') && x.v.types.doors.includes('door-single'), 'model_describe: two levels, no walls, the types the edit tools take');
    x = await call('walls_add', { points: [[0, 0], [6000, 0], [6000, 4000], [0, 4000]], closed: true, type: 'ext-2x6' });
    ok(!x.r.isError && x.v.walls.length === 4 && ed.changes.length === 1 && ed.changes[0].label === 'Assistant: add 4 walls', 'walls_add closed: four walls, one undo step "Assistant: add 4 walls"', x.text);
    x = await call('model_describe');
    ok(x.v.walls.count === 4 && x.v.rooms.length === 1 && x.v.rooms[0].area > 20 && x.v.rooms[0].area < 24, 'they close a room (' + x.v.rooms[0]?.area + ' m²)');
    x = await call('walls_list', { level: 'level 1' });
    const south = x.v.walls.find((w) => w.a[1] === 0 && w.b[1] === 0);
    ok(x.v.walls.length === 4 && south && south.length === 6000 && south.height === 3000, 'walls_list (level by name, any case): the south wall 6000 long, up to Level 2 (3000)', JSON.stringify(south));
    x = await call('opening_add', { wall: south.guid, kind: 'door' });
    ok(!x.r.isError && x.v.door && ed.changes.at(-1).label === 'Assistant: add a door', 'opening_add: a single door in the middle of the south wall', x.text);
    x = await call('opening_add', { wall: south.guid, kind: 'window', type: 'door-single' });
    ok(x.r.isError && /door type, not a window/.test(x.text), 'a door type asked for as a window: refused');
    x = await call('opening_add', { wall: south.guid, kind: 'window', width: 7000 });
    ok(x.r.isError && ed.changes.length === 2, 'a window wider than the wall: refused with the model\'s reason, nothing changed', x.text);
    x = await call('opening_add', { wall: south.guid, kind: 'window', offset: 500, width: 1200 });
    ok(!x.r.isError && x.v.window, 'a window 500 from the wall\'s start');
    x = await call('walls_list');
    ok(x.v.walls.find((w) => w.guid === south.guid).openings.length === 2, 'walls_list shows the door and the window in the south wall');
    x = await call('floor_add', { level: 'Level 2', points: [[0, 0], [8000, 0], [8000, 5000], [0, 5000]], kind: 'wood' });
    ok(!x.r.isError && x.v.floor && x.v.level === 'Level 2', 'floor_add: a floor of any outline on Level 2', x.text);
    x = await call('floor_add', { points: [[0, 0], [1000, 1000], [1000, 0], [0, 1000]] });
    ok(x.r.isError && ed.changes.length === 4, 'a crossing outline: refused (nothing changed)', x.text);
    x = await call('levels_add', { elevations: [6000, 9000] });
    ok(!x.r.isError && x.v.levels.length === 4 && x.v.levels.at(-1).elevation === 9000, 'levels_add: levels at 6000 and 9000');
    x = await call('grid_add', { u: { count: 3, spacing: 3000 }, v: { count: 2, spacing: 4000 } });
    ok(!x.r.isError && x.v.lines.join() === '1,2,3,A,B', 'grid_add: lines 1, 2, 3 by A, B', x.text);
    x = await call('model_describe');
    ok(x.v.walls.count === 4 && x.v.doors === 1 && x.v.windows === 1 && x.v.floorsByOutline === 1 && x.v.levels.length === 4 && x.v.grids.join() === '1,2,3,A,B', 'model_describe after it all: 4 walls, a door, a window, a floor, 4 levels, grid 1–3 × A–B', JSON.stringify(x.v).slice(0, 300));
    x = await call('walls_add', { level: 'Basement', points: [[0, 0], [1, 1]] });
    ok(x.r.isError && /No level "Basement"/.test(x.text), 'a level that is not there: refused, naming the levels');
    ok(ed.changes.every((c) => c.label.startsWith('Assistant: ')) && ed.changes.length === 6, 'every edit was one undo step labelled "Assistant: …" (6)');
    ed.undo();
    x = await call('grid_add', { u: { count: 1 } });
    ok(!x.r.isError && x.v.lines.includes('1') && !x.v.lines.includes('3') && !x.v.lines.includes('B'), 'undo took the grid back (only the new one-line grid now)', x.text);
    const txt = new TextDecoder().decode(ed.save());
    ok(/IFCWALL/.test(txt) && /IFCDOOR\(/.test(txt) && /IFCWINDOW\(/.test(txt) && /IFCGRID\(/.test(txt) && !danglingRefs(txt).length, 'saved: walls, door, window, grid in the IFC; no dangling references');
    saved.agents = ed.save();

    // the headless core (CLI / MCP server): the same tools on a model by handle, IFC edits written to a file in its folder
    const os = await import('node:os');
    const HT = await import(path.join(ROOT, 'tools/cli/headless/tools.mjs'));
    const { createDispatcher: core } = await import(path.join(ROOT, 'tools/mcp/core.mjs'));
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-agents-'));
    const env = HT.createEnv({ roots: [dir] });
    let hAllowed = ['read'];
    const h = core({ server: { name: 'cadcraft-mcp', version: 'test' }, allowed: () => hAllowed });
    for (const tl of HT.headlessTools(env)) h.tool(tl);
    const hc = async (name, a = {}) => { const r = await h.call(name, a); return { r, v: r.structuredContent, text: r.content?.[0]?.text || '' }; };
    ok(['ifc_new', 'walls_add', 'opening_add', 'floor_add', 'levels_add', 'grid_add', 'ifc_save'].every((n) => !h.list().some((tl) => tl.name === n)) && h.list().some((tl) => tl.name === 'model_describe'), 'headless, read only: the BimCraft edit tools are not listed; model_describe is');
    hAllowed = ['read', 'edit', 'save'];
    x = await hc('ifc_new', { name: 'Agent house', levels: 2, height: 2800 });
    const doc = x.v?.doc;
    ok(!x.r.isError && /^d\d+$/.test(doc) && x.v.storeys.length === 2, 'ifc_new: a new building with two levels, handle ' + doc, x.text);
    x = await hc('walls_add', { doc, points: [[0, 0], [5000, 0], [5000, 4000], [0, 4000]], closed: true });
    const wl = await hc('walls_list', { doc });
    ok(!x.r.isError && x.v.walls.length === 4 && wl.v.walls.length === 4 && wl.v.walls[0].height === 2800, 'walls_add / walls_list on the handle: four walls up to the level above (2800)', x.text);
    x = await hc('opening_add', { doc, wall: wl.v.walls[0].guid, kind: 'door' });
    ok(!x.r.isError && x.v.door, 'opening_add: a door', x.text);
    x = await hc('ifc_query', { doc, class: 'IfcWall' });
    ok(x.v.total === 4, 'ifc_query sees the new walls (the index follows the edits)', JSON.stringify(x.v).slice(0, 200));
    x = await hc('undo', { doc });
    ok(!x.r.isError && x.v.undone.join() === 'Assistant: add a door', 'undo on an IFC handle: the door (an "Assistant:" step)', x.text);
    x = await hc('ifc_save', { doc });
    ok(x.r.isError && /no file yet/.test(x.text), 'ifc_save without a path on a new building: refused');
    x = await hc('ifc_save', { doc, path: 'agent-house.ifc' });
    ok(!x.r.isError && fs.existsSync(path.join(dir, 'agent-house.ifc')), 'ifc_save: written inside the allowed folder', x.text);
    const back = await openText(fs.readFileSync(path.join(dir, 'agent-house.ifc'), 'utf8'));
    const { readWalls } = await import(path.join(APP, 'model-walls.js'));
    ok(readWalls(back.w).length === 4 && !ids(back.api, back.mid, 'IFCDOOR').length, 'reopened: the four walls, no door (undone)');
    x = await hc('ifc_save', { doc, path: '../outside.ifc' });
    ok(x.r.isError && !fs.existsSync(path.join(dir, '..', 'outside.ifc')), 'a path outside the allowed folder: refused');
    saved.agentsHeadless = fs.readFileSync(path.join(dir, 'agent-house.ifc'));
    fs.rmSync(dir, { recursive: true, force: true });
  }

  // ======================================================================================== IfcOpenShell validation
  if (Object.keys(saved).length) {
    const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
    if (!py) console.log('  --   no venv with ifcopenshell: schema validation skipped');
    else {
      const { execFileSync } = await import('node:child_process');
      const os = await import('node:os');
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-draw06-'));
      const files = Object.entries(saved).map(([k, b]) => { const f = path.join(dir, k + '.ifc'); fs.writeFileSync(f, b); return f; });
      let out = '';
      try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), ...files], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || ''); }
      const res = out.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
      ok(res.length === files.length && res.every((r) => r.errors === 0), 'IfcOpenShell finds no schema errors in ' + res.map((r) => path.basename(r.file) + ' (' + r.errors + ')').join(', ') + (res.some((r) => r.errors) ? ': ' + res.flatMap((r) => r.first).slice(0, 3).join(' | ') : ''));
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}

/** A traced plan of our own as DXF R12 text (mm): a 6 × 4 m room drawn with both faces of 200 mm walls on A-WALL, a door
 *  block (leaf + swing) and a window block on the walls, two annotation lines on A-ANNO. */
export function traceDxf() {
  const out = [];
  const g = (code, v) => out.push(String(code), String(v));
  const line = (layer, x1, y1, x2, y2) => { g(0, 'LINE'); g(8, layer); g(10, x1); g(20, y1); g(30, 0); g(11, x2); g(21, y2); g(31, 0); };
  const arc = (layer, x, y, r, a0, a1) => { g(0, 'ARC'); g(8, layer); g(10, x); g(20, y); g(30, 0); g(40, r); g(50, a0); g(51, a1); };
  const insert = (layer, name, x, y, rot) => { g(0, 'INSERT'); g(8, layer); g(2, name); g(10, x); g(20, y); g(30, 0); g(50, rot); };
  g(0, 'SECTION'); g(2, 'HEADER'); g(9, '$ACADVER'); g(1, 'AC1009'); g(9, '$INSUNITS'); g(70, 4); g(0, 'ENDSEC');
  g(0, 'SECTION'); g(2, 'BLOCKS');
  g(0, 'BLOCK'); g(8, '0'); g(2, 'DOOR36'); g(70, 0); g(10, 0); g(20, 0); g(30, 0); g(3, 'DOOR36');
  line('0', 0, 0, 0, 900); arc('0', 0, 0, 900, 0, 90); line('0', 0, 0, 900, 0);
  g(0, 'ENDBLK'); g(8, '0');
  g(0, 'BLOCK'); g(8, '0'); g(2, 'WIN48'); g(70, 0); g(10, 0); g(20, 0); g(30, 0); g(3, 'WIN48');
  line('0', -600, -75, 600, -75); line('0', 600, -75, 600, 75); line('0', 600, 75, -600, 75); line('0', -600, 75, -600, -75);
  g(0, 'ENDBLK'); g(8, '0');
  g(0, 'ENDSEC');
  g(0, 'SECTION'); g(2, 'ENTITIES');
  const o = [[-100, -100], [6100, -100], [6100, 4100], [-100, 4100]], i = [[100, 100], [5900, 100], [5900, 3900], [100, 3900]];
  for (const P of [o, i]) for (let k = 0; k < 4; k++) line('A-WALL', P[k][0], P[k][1], P[(k + 1) % 4][0], P[(k + 1) % 4][1]);
  insert('A-DOOR', 'DOOR36', 1000, 100, 0);
  insert('A-GLAZ', 'WIN48', 6000, 2000, 90);
  line('A-ANNO', 0, -1500, 6000, -1500); line('A-ANNO', 0, -1600, 0, -1400);
  g(0, 'ENDSEC'); g(0, 'EOF');
  return out.join('\n') + '\n';
}

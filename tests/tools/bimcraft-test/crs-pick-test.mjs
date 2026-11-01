/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --crspick` (0.8 D8.9, session d89_PART_3): any projection in BimCraft. The shared picker (crs-pick.js: EPSG
 * numbers, UTM zones, words, proj4 and WKT definitions, "My projections"), the choice kept in the model (CadCraft_CRS on the IfcProject,
 * crs-model.js) through save, reopen and undo, and Measure › Location's maths on a custom projection that is really EPSG:28356.
 */
import fs from 'node:fs';
import path from 'node:path';

export async function crsPickMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0;
  const ok = (cond, label) => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const imp = (f) => import(path.join(APP, f));
  const C = await imp('crs.js'), P = await imp('crs-pick.js'), M = await imp('crs-model.js'), G = await imp('ifc-geo.js');
  const { IfcEditor } = await imp('ifc-edit.js');
  C.setCatalog(JSON.parse(fs.readFileSync(path.join(APP, 'crs-db.json'), 'utf8')));
  const { fixtureIfc, GEOREF } = await import(path.join(ROOT, 'tools/bimcraft-test/ifc-fixture.mjs'));

  console.log('== finding a system: number, UTM zone, words');
  const k = (s) => P.parse(s);
  ok(k('32633').crs?.code === 32633 && k('EPSG:2277').crs?.code === 2277 && k('epsg 28356').crs?.code === 28356, 'EPSG numbers: 32633, EPSG:2277, "epsg 28356"');
  ok(k('99999').error && k('99999').kind === 'code', 'a number that is not in the list says so');
  const utm = { 'UTM 33N': 32633, 'utm zone 20 s': 32720, 'WGS 84 / UTM zone 60 south': 32760, 'NAD83 UTM 15N': 26915, 'ETRS89 UTM 32N': 25832, 'GDA94 UTM 56S': 28356, 'GDA2020 UTM 55S': 7855 };
  for (const [text, code] of Object.entries(utm)) ok(k(text).crs?.code === code && k(text).kind === 'utm', `"${text}" → EPSG:${code} (${k(text).crs?.name})`);
  ok(P.utmCode('UTM 61N') === null && P.utmCode('UTM 0N') === null && P.utmCode('NAD83 UTM 30N') === null && P.utmCode('hello') === null, 'zones out of range and datums without that zone → null');
  const all = [...Array(60)].flatMap((_, i) => [P.utmCode('UTM ' + (i + 1) + 'N'), P.utmCode('UTM ' + (i + 1) + 'S')]);
  ok(all.every((c) => c && C.byCode(c) && !C.byCode(c).geographic) && new Set(all).size === 120, 'all 120 WGS 84 UTM zones (60 north, 60 south) are in the catalog and different');
  const w = k('lambert 93');
  ok(w.kind === 'words' && w.hits.length >= 1 && w.hits.some((e) => e.code === 2154), 'words: "lambert 93" lists RGF93 / Lambert-93 (EPSG:2154) among ' + w.hits.length);
  const near = P.parse('utm zone', { near: [-122.4, 37.8], limit: 5 });
  ok(near.hits[0].name.includes('10N') || /zone 10/.test(near.hits[0].name), 'systems round a place come first: UTM near San Francisco → ' + near.hits[0].name);
  ok(k('zzz not a system').error && k('').kind === 'none', 'nothing found and nothing typed are both said');

  console.log('== your own projection: proj4 definition and WKT');
  const p1 = k('+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs');
  ok(p1.crs.code === 32633 && p1.matched?.code === 32633 && p1.notes[0].includes('32633'), 'a proj4 definition that is UTM 33N takes EPSG:32633 and says so: ' + p1.notes[0]);
  const mga = k('MGA 56 mine = +proj=tmerc +lat_0=0 +lon_0=153 +k=0.9996 +x_0=500000 +y_0=10000000 +ellps=GRS80 +units=m +no_defs');
  ok([mga.matched, ...mga.others].some((e) => e.code === 28356) && [28356, 7856].includes(mga.crs.code) && mga.crs.name === 'MGA 56 mine' && mga.notes.length === 2, 'a written-out transverse Mercator is matched (EPSG:' + mga.crs.code + ', the others listed: ' + mga.others.map((e) => e.code).join(', ') + ') and keeps the name given');
  const my = k('Plant grid = +proj=tmerc +lat_0=48.1 +lon_0=11.6 +k=1 +x_0=1000 +y_0=2000 +ellps=bessel +units=us-ft');
  ok(my.crs.code === null && my.matched === null && my.crs.unit === 'ftUS' && my.crs.name === 'Plant grid', 'a really custom projection: no code, US survey feet, its own name');
  const mtr = k('+proj=lcc +lat_1=44 +lat_2=49 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +units=m +no_defs');
  ok(mtr.crs.code === 2154 || mtr.crs.code === 3944 || mtr.crs.code === 3949 || mtr.crs.code === 3950 || mtr.crs.code === 3945 || mtr.crs.code === null, 'a Lambert conic is matched or kept custom, never an error (EPSG:' + mtr.crs.code + ')');
  for (const [text, key] of [['+proj=foo +x=1', 'build'], ['+units=m', 'noproj'], ['+proj=tmerc +units=km', 'unit'], ['+proj=tmerc +lon_0=nope', '']]) {
    const r = k(text);
    ok(!!r.error && !r.crs, `refused: ${text} → ${r.error?.slice(0, 60)}`);
  }
  ok(k('+proj=tmerc ' + 'x'.repeat(21000)).error, 'a definition over 20,000 characters is refused');
  const wkt = 'PROJCS["Test grid",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",1000.0],PARAMETER["False_Northing",2000.0],PARAMETER["Central_Meridian",9.5],PARAMETER["Scale_Factor",1.0],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]';
  const rw = k(wkt);
  ok(rw.kind === 'wkt' && rw.crs.code === null && rw.crs.name === 'Test grid' && rw.crs.unit === 'm', 'a .prj of an unlisted projection: custom, named from the file');
  const wkt2 = 'PROJCS["WGS 84 / UTM zone 33N",GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",15.0],PARAMETER["Scale_Factor",0.9996],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]';
  ok(k(wkt2).crs.code === 32633, 'a .prj of UTM 33N is matched to EPSG:32633');
  ok(k('PROJCS["x"').error, 'a broken .prj says so');

  console.log('== My projections');
  const mem = new Map();
  const store = { getItem: (a) => (mem.has(a) ? mem.get(a) : null), setItem: (a, v) => mem.set(a, String(v)) };
  ok(P.readMine(store).length === 0, 'empty at first');
  const e1 = P.addMine(store, my.crs, 'Plant grid');
  const e2 = P.addMine(store, my.crs, 'Plant grid, renamed');
  ok(P.readMine(store).length === 1 && P.readMine(store)[0].name === 'Plant grid, renamed' && e1.id === e2.id, 'the same definition is one entry (renamed in place)');
  const e3 = P.addMine(store, rw.crs, 'Test grid');
  ok(P.readMine(store).length === 2 && P.systemFor('my:' + e3.id, store).proj4 === rw.crs.proj4 && P.systemFor('my:nope', store) === null, 'two kept; systemFor("my:<id>") finds one, a removed or unknown one → null');
  ok(P.systemFor('32633', store).code === 32633 && P.systemFor('file', store) === null && P.systemFor('4326', store).geographic, 'systemFor: EPSG numbers from the catalog, "file" → none, 4326 geographic');
  P.removeMine(store, e1.id);
  ok(P.readMine(store).length === 1, 'removed');
  mem.set(P.MINE_KEY, '[{"id":"a","name":"x","proj4":"+proj=tmerc","unit":"km"},{"id":5},"junk"]');
  ok(P.readMine(store).length === 0, 'a damaged list (bad unit, wrong shape) is ignored, not trusted');
  ok(P.readMine({ getItem() { throw new Error('blocked'); } }).length === 0, 'blocked storage: an empty list, no throw');

  console.log('== kept in the model (CadCraft_CRS on the IfcProject)');
  const text = fixtureIfc({ georef: 'map' }).replace("'" + GEOREF.crs + "'", "'Plant grid'");
  const open = async (bytes) => { const e = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => e.load(b))(bytes); return e; };
  const engine = await open(new TextEncoder().encode(text));
  const g0 = G.readGeoref(engine.api, engine.modelID ?? engine.model?.modelID);
  const mid = engine.modelID ?? engine.model?.modelID;
  ok(g0.kind === 'map' && g0.crs.code === null && g0.crs.record === null && P.modelSystem(g0.crs) === null, 'a file whose CRS is named "Plant grid" with no EPSG code: no system (the old geo.crs.nocode case)');
  const ed = new IfcEditor(WebIFC, engine);
  const n0 = ed.changes.length;
  ed.modelChange(M.crsOp(mga.crs), { label: 'Model', verb: 'Set coordinate system' });
  ok(ed.changes.length === n0 + 1, 'one undo step');
  const g1 = G.readGeoref(ed.api, ed.mid);
  const ms = P.modelSystem(g1.crs);
  ok(g1.crs.record?.Proj4 === mga.crs.proj4 && ms?.source === 'model' && ms.crs.code === mga.crs.code && ms.crs.name === 'MGA 56 mine', 'read back: the record, source "model", its code, the name given');
  const bytes = ed.save();
  const txt = new TextDecoder().decode(bytes);
  ok(/CadCraft_CRS/.test(txt) && /IFCPROPERTYSINGLEVALUE\('Proj4'/.test(txt), 'the saved IFC text has the CadCraft_CRS set with Proj4');
  const eng2 = await open(bytes);
  const g2 = G.readGeoref(eng2.api, eng2.modelID ?? eng2.model?.modelID);
  const ms2 = P.modelSystem(g2.crs);
  ok(ms2?.crs.proj4 === mga.crs.proj4 && ms2.crs.unit === 'm' && ms2.crs.code === mga.crs.code, 'saved and reopened: the same system');
  // Measure › Location's maths: file point → map → lat/long, through the custom definition and through the catalog's EPSG:28356
  const pt = [10000, -100, 3000], E = G.fileToMap(g2, pt);
  const a = C.transformer(ms2.crs, null)(E[0], E[1]);
  const typed = C.transformer('+proj=tmerc +lat_0=0 +lon_0=153 +k=0.9996 +x_0=500000 +y_0=10000000 +ellps=GRS80 +units=m +no_defs', null)(E[0], E[1]);
  ok(Math.hypot(a[0] - typed[0], a[1] - typed[1]) < 1e-9, 'the system taken for the typed definition gives the same latitude and longitude as the typed text itself, to 1e-9° (' + a.map((x) => x.toFixed(8)).join(', ') + ')');
  const mine2 = P.parse('+proj=tmerc +lat_0=0 +lon_0=152.5 +k=0.9996 +x_0=500000 +y_0=10000000 +ellps=GRS80 +units=m').crs;
  const c2 = C.transformer(mine2, null)(E[0], E[1]);
  ok(mine2.code === null && Math.abs(c2[0] - a[0]) > 0.3 && Math.abs(c2[0] - a[0]) < 0.7, 'a different central meridian moves the place by half a degree of longitude (' + (c2[0] - a[0]).toFixed(3) + '°): the choice matters');
  ed.undo();
  ok(G.readGeoref(ed.api, ed.mid).crs.record === null, 'undo: the choice is gone');
  ed.redo();
  ed.modelChange(M.crsOp(null), { label: 'Model', verb: 'Set coordinate system' });
  ok(G.readGeoref(ed.api, ed.mid).crs.record === null && P.modelSystem(G.readGeoref(ed.api, ed.mid).crs) === null, 'taken off: no record, back to the file\'s own');
  ed.modelChange(M.crsOp(null), { label: 'Model', verb: 'Set coordinate system' });
  ok(true, 'taking off twice does not fail');
  // a stored record that is not a projection is not trusted
  ok(P.fromRecord({ Name: 'x', Code: 0, Unit: 'km', Proj4: '+proj=tmerc' }) === null && P.fromRecord({ Name: 'x', Unit: 'm', Proj4: '+proj=nonsense' }) === null && P.fromRecord(null) === null, 'fromRecord refuses a bad unit, a projection proj4 cannot build, and nothing');
  // a model whose file names an EPSG code, and a choice that overrides it
  const eng3 = await open(await (async () => new TextEncoder().encode(fixtureIfc({ georef: 'map' })))());
  const g3 = G.readGeoref(eng3.api, eng3.modelID ?? eng3.model?.modelID);
  ok(P.modelSystem(g3.crs)?.source === 'file' && P.modelSystem(g3.crs).crs.code === 28356, 'a file that names EPSG:28356 uses it (source "file")');
  const ed3 = new IfcEditor(WebIFC, eng3);
  ed3.modelChange(M.crsOp(P.parse('32756').crs), { label: 'Model', verb: 'Set coordinate system' });
  ok(P.modelSystem(G.readGeoref(ed3.api, ed3.mid).crs).crs.code === 32756, 'the person\'s choice (EPSG:32756) wins over the code in the file name');

  console.log('== the shared module and its words are in step');
  const { spawnSync } = await import('node:child_process');
  const sy = spawnSync(process.execPath, [path.join(ROOT, 'tools/crs-pick/sync.mjs'), '--check'], { encoding: 'utf8' });
  ok(sy.status === 0, 'lib/crs-pick/crs-pick.js is byte-identical in BimCraft and every crs.pick / geo.pick word is in en + es-MX' + (sy.status ? ': ' + sy.stdout : ''));

  console.log(bad ? `\n${bad} FAILED` : '\nall passed');
  return bad ? 1 : 0;
}

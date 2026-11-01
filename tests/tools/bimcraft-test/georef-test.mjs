/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --georef` (0.8 D8.9 round 3, session d89b_PART_3): a model with no map conversion gets one (IFC4 entities, IFC2X3
 * property sets), a model that has one can be moved to another system (the georeference only), and files in another system are reprojected.
 * The maths (crs-georef.js) is DOM-free; the writing is georef-model.js through IfcEditor, one undo step each.
 */
import fs from 'node:fs';
import path from 'node:path';

export async function georefMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0;
  const ok = (cond, label) => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const imp = (f) => import(path.join(APP, f));
  const C = await imp('crs.js'), P = await imp('crs-pick.js'), Z = await imp('crs-georef.js'), M = await imp('georef-model.js'), G = await imp('ifc-geo.js');
  const { IfcEditor } = await imp('ifc-edit.js');
  const proj4 = (await import(path.join(ROOT, 'public_html/assets/vendor/proj4/current/proj4.esm.min.js'))).default;
  C.setCatalog(JSON.parse(fs.readFileSync(path.join(APP, 'crs-db.json'), 'utf8')));
  const { fixtureIfc } = await import(path.join(ROOT, 'tools/bimcraft-test/ifc-fixture.mjs'));
  const sys = (s) => P.parse(s).crs;
  const utm33 = sys('32633'), l93 = sys('2154'), tx = sys('EPSG:2277'), mga56 = sys('28356'), mga56s = sys('32756'), nad = sys('26915');

  console.log('== a model with no map conversion: the numbers');
  const mk = Z.makeConversion({ crs: utm33, eastings: 500000, northings: 5400000, height: 10, rotationDeg: 20, fileUnitM: 0.001 });
  ok(!mk.error && mk.conv.Scale === 0.001 && Math.abs(Z.rotationDeg(mk.conv) - 20) < 1e-9 && mk.conv.OrthogonalHeight === 10, 'millimetre model on a metre grid: scale 0.001 (the unit difference), rotation 20°, height kept');
  const mf = Z.makeConversion({ crs: tx, eastings: 3100000, northings: 10100000, rotationDeg: 0, fileUnitM: 0.001 });
  ok(Math.abs(mf.conv.Scale - 0.001 / (1200 / 3937)) < 1e-12, 'millimetres on a US-survey-foot grid: scale ' + mf.conv.Scale.toFixed(6));
  ok(Z.makeConversion({ crs: utm33, eastings: NaN, northings: 1 }).error?.code === 'georef.outside' || Z.makeConversion({ crs: utm33, eastings: NaN, northings: 1 }).error?.code === 'georef.numbers', 'NaN eastings refused with a Problem');
  ok(Z.makeConversion({ crs: utm33, eastings: 5e5, northings: 5.4e6, scale: -1 }).error?.severity === 'error' && Z.makeConversion({ crs: utm33, eastings: 5e5, northings: 5.4e6, scale: 5000 }).error?.code === 'georef.scale', 'a negative or absurd scale is refused');
  ok(Z.makeConversion({ crs: sys('4326'), eastings: 1, northings: 1 }).error?.code === 'georef.projected', 'a latitude-longitude system cannot be the map grid');
  const ll = Z.originFromLonLat(utm33, 15.0, 48.7);
  const back = Z.lonLatOf(utm33, ll.eastings, ll.northings);
  ok(Math.abs(back[0] - 15) < 1e-8 && Math.abs(back[1] - 48.7) < 1e-8, 'latitude/longitude → eastings/northings → back: within 1e-8° (E ' + ll.eastings + ', N ' + ll.northings + ')');
  ok(Z.originFromLonLat(utm33, 15, 95).error?.code === 'georef.latlon', 'latitude 95 refused');
  const far = Z.originFromLonLat(utm33, -100, 40);
  ok(far.problems.some((p) => p.code === 'georef.area' && p.severity === 'warning' && p.msg.key === 'georef.p.area'), 'a place outside UTM 33N\'s area: an area warning in the Problems shape');
  const p0 = far.problems[0];
  ok(typeof p0.text === 'string' && Array.isArray(p0.about) && p0.source?.name === 'georef' && p0.msg.vars && typeof p0.code === 'string', 'the Problems shape: code, severity, msg{key,vars}, text, about[], source');
  const north = Z.trueNorth(mk.conv, utm33);
  ok(north && Math.abs(Math.hypot(north[0], north[1]) - 1) < 1e-9 && Math.abs(Math.atan2(north[1], north[0]) * 180 / Math.PI - (90 - 20)) < 1.5, 'true north in the model\'s axes: about 70° (grid north is at 90° − 20°, convergence is small): ' + north.map((x) => x.toFixed(4)));
  const f = Z.projectedCrsFields(utm33), f2 = Z.projectedCrsFields(mga56), f3 = Z.projectedCrsFields(tx);
  ok(f.Name === 'EPSG:32633' && f.GeodeticDatum === 'WGS84' && f.MapProjection === 'UTM' && f.MapZone === '33N' && f.unit === 'm', 'IfcProjectedCRS fields, UTM 33N: ' + JSON.stringify(f));
  ok(f2.GeodeticDatum === 'GDA94' && f2.MapZone === '56' && f3.unit === 'ftUS' && /Lambert/.test(f3.MapProjection) && f3.MapZone, 'MGA 56 → GDA94 zone 56; Texas Central → ftUS, Lambert, zone "' + f3.MapZone + '"');

  console.log('== datum shifts are never silent');
  const osgb = sys('27700');
  const sh = Z.shiftProblems(mga56, osgb);
  ok(sh.length === 1 && /approx/.test(sh[0].code) && sh[0].severity !== 'error', 'GDA94 → British National Grid (a 7-parameter shift, no grid): ' + sh[0]?.code + ' (' + sh[0]?.severity + ') ' + JSON.stringify(sh[0]?.msg.vars));
  ok(Z.shiftProblems(utm33, l93).length === 0, 'WGS 84 UTM → RGF93 Lambert: same datum, nothing to say');
  const nd = Z.shiftProblems(nad, utm33);
  ok(nd.length === 1 && nd[0].code === 'georef.approx' && nd[0].msg.vars.acc === 4, 'NAD83 → WGS 84: the 4 m the registry states is said, not hidden');
  const grid = { code: null, name: 'Needs a grid', proj4: '+proj=tmerc +lat_0=0 +lon_0=-100 +k=0.9996 +x_0=500000 +y_0=0 +ellps=clrk66 +nadgrids=@missing.gsb +units=m +no_defs', unit: 'm', local: null };
  const gp = Z.shiftProblems(grid, utm33);
  ok(gp.length === 1 && gp[0].code === 'georef.grid' && gp[0].severity === 'error', 'a datum shift grid that is not loaded: an error Problem');
  ok(/grid/i.test(gp[0].text) || gp[0].msg.key === 'georef.p.grid', 'its words say grid-based shifts are not available (key georef.p.grid)');

  console.log('== item 2: moving a georeference to another system (A → B → A)');
  const pairs = [[utm33, l93], [utm33, tx], [mga56, mga56s], [nad, utm33], [l93, tx], [mga56, nad]];
  for (const [A, B] of pairs) {
    const m0 = Z.makeConversion({ crs: A, eastings: A.unit === 'ftUS' ? 3100000 : A.code === 2154 ? 650000 : A.code === 26915 ? 600000 : 500000, northings: A.unit === 'ftUS' ? 10100000 : A.code === 2154 ? 6860000 : A.code === 26915 ? 4900000 : A.code === 28356 ? 6250000 : 5400000, height: 12.5, rotationDeg: 33, fileUnitM: 0.001 });
    if (m0.error) { ok(false, A.code + ': ' + m0.error.code); continue; }
    const r = Z.reprojectConversion(m0.conv, A, B);
    if (r.error) { ok(false, A.code + '→' + B.code + ': ' + r.error.code); continue; }
    const b = Z.reprojectConversion(r.conv, B, A);
    const un = (c) => (c === A ? A : B);
    const mm = Math.hypot(b.conv.Eastings - m0.conv.Eastings, b.conv.Northings - m0.conv.Northings) * (A.unit === 'ftUS' ? 1200 / 3937 : A.unit === 'ft' ? 0.3048 : 1) * 1000;
    const llMove = Math.hypot(r.before[0] - r.after[0], r.before[1] - r.after[1]);
    ok(mm < 1 && llMove < 1e-8, `EPSG:${A.code} → ${B.code} → ${A.code}: origin back within ${mm.toFixed(4)} mm (< 1 mm); latitude/longitude of the origin unchanged (${llMove.toExponential(1)}°)`);
    ok(Math.abs(Z.rotationDeg(b.conv) - 33) < 2e-5 && Math.abs(b.conv.Scale / m0.conv.Scale - 1) < 2e-6 && Math.abs(b.conv.OrthogonalHeight - 12.5) < 1e-6, `  rotation ${Z.rotationDeg(b.conv).toFixed(7)}°, scale ratio ${(b.conv.Scale / m0.conv.Scale).toFixed(9)}, height ${b.conv.OrthogonalHeight}`);
    void un;
  }
  const tx1 = Z.reprojectConversion(Z.makeConversion({ crs: utm33, eastings: 500000, northings: 5400000, height: 10, rotationDeg: 0, fileUnitM: 0.001 }).conv, utm33, tx);
  ok(Math.abs(tx1.conv.OrthogonalHeight - 10 / (1200 / 3937)) < 1e-6, 'a unit change moves the height by the unit only: 10 m → ' + tx1.conv.OrthogonalHeight.toFixed(4) + ' ftUS');

  console.log('== writing it into the IFC (IFC4): no IfcMapConversion → one, one undo step');
  const open = async (bytes) => { const e = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => e.load(b))(bytes); return e; };
  const enc = (s) => new TextEncoder().encode(s);
  const midOf = (e) => e.modelID ?? e.model?.modelID;
  const engine = await open(enc(fixtureIfc()));
  const ed = new IfcEditor(WebIFC, engine);
  ok(G.readGeoref(ed.api, ed.mid) === null && M.readConversion(ed.api, ed.mid) === null, 'the fixture has no georeference at all');
  const want = Z.makeConversion({ crs: utm33, eastings: 500000, northings: 5400000, height: 10, rotationDeg: 20, fileUnitM: 0.001 });
  const op = M.georefOp({ crs: utm33, conv: want.conv, fields: Z.projectedCrsFields(utm33), trueNorth: Z.trueNorth(want.conv, utm33), lonlat: want.lonlat });
  const n0 = ed.changes.length;
  ed.modelChange(op, { label: 'Model', verb: 'Place on the map' });
  ok(ed.changes.length === n0 + 1, 'one undo step');
  const g1 = G.readGeoref(ed.api, ed.mid);
  ok(g1?.kind === 'map' && g1.crs.code === 32633 && g1.crs.record?.Code === 32633 && g1.mapUnitM === 1 && g1.crs.projection === 'UTM' && g1.crs.zone === '33N', 'read back: kind map, EPSG:32633, UTM zone 33N, map unit metre, the model\'s choice saved too');
  const E = G.fileToMap(g1, [0, 0, 0]);
  ok(Math.abs(E[0] - 500000) < 1e-6 && Math.abs(E[1] - 5400000) < 1e-6 && Math.abs(E[2] - 10) < 1e-6, 'the model\'s origin is at E 500000, N 5400000, H 10');
  const E2 = G.fileToMap(g1, [10000, 0, 0]);
  ok(Math.abs(Math.atan2(E2[1] - E[1], E2[0] - E[0]) * 180 / Math.PI - 20) < 1e-6 && Math.abs(Math.hypot(E2[0] - E[0], E2[1] - E[1]) - 10) < 1e-6, '10 m along the model\'s X axis is 10 m on the map, 20° from east');
  const txt = new TextDecoder().decode(ed.save());
  ok(/IFCMAPCONVERSION\(/.test(txt) && (txt.match(/IFCPROJECTEDCRS\(/g) || []).length === 1 && /IFCPROJECTEDCRS\('EPSG:32633'/.test(txt), 'the saved IFC has one IfcProjectedCRS (EPSG:32633) and an IfcMapConversion');
  const eng2 = await open(enc(txt));
  const g2 = G.readGeoref(eng2.api, midOf(eng2));
  ok(g2?.kind === 'map' && g2.crs.code === 32633 && Math.abs(G.fileToMap(g2, [0, 0, 0])[0] - 500000) < 1e-6, 'saved and reopened: the same georeference');
  ed.undo();
  ok(G.readGeoref(ed.api, ed.mid) === null, 'undo: the model is unplaced again');
  ed.redo();
  ok(G.readGeoref(ed.api, ed.mid)?.kind === 'map', 'redo: placed again');

  console.log('== feet: a US-survey-foot grid gets a conversion-based map unit');
  const e3 = new IfcEditor(WebIFC, await open(enc(fixtureIfc())));
  const mf2 = Z.makeConversion({ crs: tx, eastings: 3100000, northings: 10100000, height: 100, rotationDeg: 0, fileUnitM: 0.001 });
  e3.modelChange(M.georefOp({ crs: tx, conv: mf2.conv, fields: Z.projectedCrsFields(tx), lonlat: mf2.lonlat }), { label: 'Model', verb: 'Place on the map' });
  const g3 = G.readGeoref(e3.api, e3.mid);
  ok(g3?.kind === 'map' && Math.abs(g3.mapUnitM - 1200 / 3937) < 1e-9, 'map unit read back as US survey foot (' + g3?.mapUnitM + ' m)');
  const E3 = G.fileToMap(g3, [0, 0, 0]);
  ok(Math.abs(E3[0] - 3100000 * 1200 / 3937) < 1e-6, 'eastings come back in metres: ' + E3[0].toFixed(3));

  console.log('== IFC2X3: the standard\'s property sets, the site\'s latitude/longitude, true north');
  const t23 = fixtureIfc().replace("FILE_SCHEMA(('IFC4'))", "FILE_SCHEMA(('IFC2X3'))");
  const e23 = new IfcEditor(WebIFC, await open(enc(t23)));
  ok(e23.api.GetModelSchema(e23.mid) === 'IFC2X3' && G.readGeoref(e23.api, e23.mid) === null, 'an IFC2X3 model with no georeference');
  e23.modelChange(op, { label: 'Model', verb: 'Place on the map' });
  const g23 = G.readGeoref(e23.api, e23.mid);
  ok(g23?.kind === 'map' && g23.crs.code === 32633 && Math.abs(G.fileToMap(g23, [0, 0, 0])[0] - 500000) < 1e-6 && g23.mapUnitM === 1, 'read back through ePSet_MapConversion: E 500000, EPSG:32633, metre');
  const t23b = new TextDecoder().decode(e23.save());
  ok(/ePSet_MapConversion/.test(t23b) && /ePSet_ProjectedCRS/.test(t23b) && !/IFCMAPCONVERSION/.test(t23b) && /CadCraft_CRS/.test(t23b), 'saved: ePSet_MapConversion + ePSet_ProjectedCRS + CadCraft_CRS, no IfcMapConversion (the schema has none)');
  const site = /IFCSITE\([^;]*\);/.exec(t23b)?.[0] || '';
  ok(/\(48,/.test(site) || /\(14,|\(15,/.test(site) || /,\((\d+),/.test(site), 'IfcSite carries RefLatitude / RefLongitude: ' + site.slice(-90));
  const e23b = await open(enc(t23b));
  ok(G.readGeoref(e23b.api, midOf(e23b))?.kind === 'map', 'IFC2X3 saved and reopened: still on the map');
  e23.undo();
  ok(G.readGeoref(e23.api, e23.mid) === null, 'IFC2X3 undo: gone');

  console.log('== item 2 in the file: rewriting the file\'s own IfcProjectedCRS');
  const e4 = new IfcEditor(WebIFC, await open(enc(fixtureIfc({ georef: 'map' }))));
  const c0 = M.readConversion(e4.api, e4.mid);
  const g4 = G.readGeoref(e4.api, e4.mid);
  const before = new TextDecoder().decode(e4.save());
  ok(c0?.kind === 'ifc4' && Math.abs(c0.conv.Eastings - 334567.8) < 1e-6 && g4.crs.code === 28356, 'the fixture\'s EPSG:28356 conversion is read: E ' + c0.conv.Eastings);
  const from = P.modelSystem(g4.crs).crs;
  const rp = Z.reprojectConversion(c0.conv, from, mga56s);
  ok(!rp.error && rp.problems.every((p) => p.severity !== 'error'), 'GDA94 MGA 56 → WGS 84 UTM 56S: no error; Problems: ' + rp.problems.map((p) => p.code).join(', '));
  const n4 = e4.changes.length;
  e4.modelChange(M.georefOp({ crs: mga56s, conv: rp.conv, fields: Z.projectedCrsFields(mga56s), trueNorth: Z.trueNorth(rp.conv, mga56s), lonlat: rp.after }), { label: 'Model', verb: 'Move' });
  ok(e4.changes.length === n4 + 1, 'one undo step');
  const g5 = G.readGeoref(e4.api, e4.mid), c5 = M.readConversion(e4.api, e4.mid);
  const after = new TextDecoder().decode(e4.save());
  ok(g5.crs.name === 'EPSG:32756' && g5.crs.code === 32756 && g5.crs.zone === '56S' && g5.crs.geodeticDatum === 'WGS84' && g5.crs.projection === 'UTM', 'IfcProjectedCRS now says EPSG:32756 / WGS84 / UTM / zone 56S');
  ok((after.match(/IFCPROJECTEDCRS\(/g) || []).length === 1 && (after.match(/IFCMAPCONVERSION\(/g) || []).length === 1, 'still exactly one IfcProjectedCRS and one IfcMapConversion (rewritten in place)');
  const O = G.fileToMap(g5, [0, 0, 0]), O0 = G.fileToMap(g4, [0, 0, 0]);
  const ll0 = Z.lonLatOf(from, O0[0], O0[1]), ll1 = Z.lonLatOf(mga56s, O[0], O[1]);
  ok(Math.hypot(ll0[0] - ll1[0], ll0[1] - ll1[1]) < 1e-8, 'the model\'s origin has the same latitude and longitude as before (' + ll1.map((x) => x.toFixed(8)) + ')');
  const P1 = G.fileToMap(g4, [50000, 30000, 0]), P2 = G.fileToMap(g5, [50000, 30000, 0]);
  const L1 = Z.lonLatOf(from, P1[0], P1[1]), L2 = Z.lonLatOf(mga56s, P2[0], P2[1]);
  ok(Math.hypot(L1[0] - L2[0], L1[1] - L2[1]) * 111320 < 0.01, 'a point 58 m from the origin lands within 1 cm of where it was (grid scale carried): ' + (Math.hypot(L1[0] - L2[0], L1[1] - L2[1]) * 111320 * 1000).toFixed(3) + ' mm');
  const pts = (s) => (s.match(/^#\d+=IFCCARTESIANPOINT\([^;]*;/gm) || []).map((l) => l.replace(/^#\d+=/, '')).sort().join('\n');
  const solids = (s) => (s.match(/^#\d+=IFC(EXTRUDEDAREASOLID|WALL|LOCALPLACEMENT|AXIS2PLACEMENT3D)\([^;]*;/gm) || []).length;
  const beforePts = pts(before).split('\n'), afterPts = pts(after).split('\n');
  ok(beforePts.every((l) => afterPts.includes(l)) && solids(before) === solids(after), 'no element coordinate changed: every IfcCartesianPoint of the model is still there, same placements and solids (' + solids(after) + ')');
  ok(c5.fields.Name === 'EPSG:32756' || c5.fields.name === 'EPSG:32756', 'readConversion shows the new system');
  e4.undo();
  ok(G.readGeoref(e4.api, e4.mid).crs.code === 28356, 'undo: back to EPSG:28356');

  console.log('== item 3: reprojecting points (batched, cancellable, capped)');
  const N = 100000, xy = new Float64Array(2 * N), orig = new Float64Array(2 * N);
  for (let i = 0; i < N; i++) { xy[2 * i] = 480000 + (i % 400) * 25; xy[2 * i + 1] = 5380000 + Math.floor(i / 400) * 25; }
  orig.set(xy);
  let ticks = 0;
  const t0 = Date.now();
  const rr = await Z.reproject({ proj4, from: utm33, to: l93, xy, progress: () => { ticks++; }, sliceMs: 1 });
  const ref = C.transformer(utm33, l93);
  let worst = 0;
  for (let i = 0; i < N; i += 997) { const q = ref(orig[2 * i], orig[2 * i + 1]); worst = Math.max(worst, Math.hypot(q[0] - xy[2 * i], q[1] - xy[2 * i + 1])); }
  ok(rr.bad === 0 && worst < 1e-9, `${N} points UTM 33N → Lambert-93 match the single-point transformer (worst ${worst.toExponential(1)} m; ${Date.now() - t0} ms, VPS)`);
  ok(ticks > 0, 'the page was given back between slices (' + ticks + ' progress calls)');
  const rb = await Z.reproject({ proj4, from: l93, to: utm33, xy });
  let rt = 0;
  for (let i = 0; i < N; i += 331) rt = Math.max(rt, Math.hypot(orig[2 * i] - xy[2 * i], orig[2 * i + 1] - xy[2 * i + 1]));
  ok(rb.bad === 0 && rt < 0.001, 'and back: within ' + (rt * 1000).toFixed(4) + ' mm');
  const odd = new Float64Array([500000, 5400000, 1e15, 1e15, 500100, 5400100]);
  const ro = await Z.reproject({ proj4, from: utm33, to: l93, xy: odd });
  ok(ro.bad === 1 && Number.isNaN(odd[2]) && Number.isFinite(odd[4]) && ro.problems[0]?.code === 'georef.dropped', 'a point that does not project is NaN and counted, with a Problem; the rest are fine');
  const cap = await Z.reproject({ proj4, from: utm33, to: l93, xy: new Float64Array(2 * 11), max: 10 });
  ok(cap.refused && cap.problems[0].code === 'georef.toolarge' && cap.problems[0].msg.vars.max === 10, 'over the size cap: refused with a plain Problem, nothing changed');
  const ctl = new AbortController(); ctl.abort();
  let aborted = false;
  try { await Z.reproject({ proj4, from: utm33, to: l93, xy: new Float64Array(2 * 50000), signal: ctl.signal }); } catch (e) { aborted = e.name === 'AbortError'; }
  ok(aborted, 'cancel (AbortSignal) stops it');
  const ex = Z.extentProblems(mga56, nad, [334000, 6250000, 335000, 6251000]);
  ok(ex.some((p) => /georef\.(area|approx)/.test(p.code)), 'a file in Australia against a North American model: ' + ex.map((p) => p.code).join(', '));
  ok(Z.extentProblems(utm33, l93, [NaN, 0, 1, 1])[0].code === 'georef.nofinite', 'a box with NaN is refused');

  console.log('== "which system is this file in?" is remembered per file');
  const mem = new Map(), store = { getItem: (a) => (mem.has(a) ? mem.get(a) : null), setItem: (a, v) => mem.set(a, String(v)) };
  const key = Z.fileKey({ name: 'site.xyz', size: 1234, lastModified: 99 });
  ok(Z.recallFileCrs(store, key) === null, 'nothing remembered at first');
  Z.rememberFileCrs(store, key, mga56);
  ok(Z.recallFileCrs(store, key)?.code === 28356 && Z.recallFileCrs(store, Z.fileKey({ name: 'site.xyz', size: 1235, lastModified: 99 })) === null, 'remembered for that file only (name, size, date)');
  ok(Z.recallFileCrs({ getItem() { throw new Error('blocked'); } }, key) === null, 'blocked storage: nothing, no throw');

  console.log('== words and shared files in step');
  const { EN, ES } = await import(path.join(ROOT, 'tools/crs-georef/lang.mjs'));
  const src = ['crs-georef.js', 'georef-ui.js'].filter((f) => fs.existsSync(path.join(APP, f))).map((f) => fs.readFileSync(path.join(APP, f), 'utf8')).join('\n');
  const keys = [...[...src.matchAll(/\bt\('(georef\.[a-z0-9.]+|measure\.georef[a-z.]*)'/g)].map((m) => m[1]), ...[...src.matchAll(/problem\('([a-z.]+)'/g)].map((m) => 'georef.p.' + m[1]), ...[...src.matchAll(/fail\('([a-z.]+)'/g)].map((m) => 'georef.p.' + m[1])];
  const missing = [...new Set(keys)].filter((k) => !(k in EN) || !(k in ES));
  ok(missing.length === 0, 'every georef key the code uses is in en and es-MX' + (missing.length ? ': ' + missing.join(', ') : ' (' + new Set(keys).size + ' keys)'));
  const { spawnSync } = await import('node:child_process');
  const sy = spawnSync(process.execPath, [path.join(ROOT, 'tools/crs-georef/sync.mjs'), '--check', 'bimcraft'], { encoding: 'utf8' });
  ok(sy.status === 0, 'lib/crs-georef is byte-identical in BimCraft and the georef words are in en + es-MX' + (sy.status ? ': ' + sy.stdout : ''));

  console.log(bad ? `\n${bad} FAILED` : '\nall passed');
  return bad ? 1 : 0;
}

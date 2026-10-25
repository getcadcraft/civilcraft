/* SPDX-License-Identifier: Apache-2.0 */
/**
 * extra2-daylight.mjs — LC.20 (session bim-extra_PART_2): the average daylight factor (daylight-bim.js), known answers.
 * Part of extra2-test.mjs (`node bin/test-bimcraft.mjs --extra2 --only daylight`).
 *
 * The test building (IFC4, millimetres, written here as plain STEP; boxes = extruded rectangles):
 *   room "101"  space 6000 × 4000 × 2700 at the origin
 *   W1          window 2000 × 1500 (no Overall sizes: its box), centre at z 1500, inside the wall y −200…0 (W1 fills the
 *               wall's opening: the wall is its host and is left out), outer face y = −100 → looks toward −Y
 *   W2          window on the x = 0 side, OverallWidth 1000 × OverallHeight 1200 (= 1.2 m², its box is 1.2 × 1.2)
 *   room "102"  space 6000 × 4000 × 2700 at x 7000: no window
 *   W3          a roof window (thin in Z) over 102; W4 a window far from every room
 *   block       (variant) a building 10 m tall, its face at y = −10 000 → H = 8.5 m above W1's centre at D = 9.9 m
 *   balcony     (variant) a slab y −1100…−100, underside z 3000 → 1.5 m above W1's centre, 1.0 m out
 *   post        (variant) a post 100 × 100, 4 m tall, 0.9 m out in front of W1's centre: only the middle of the five sections meets it
 */
import path from 'node:path';

export function building({ block = false, balcony = false, post = false, site = null } = {}) {   // site (0.7 bim-ops): { lat: [d, m, s], lon: [d, m, s], north: [x, y] }
  const L = [];
  let n = 0, g = 0;
  const add = (s) => { L.push('#' + (++n) + '=' + s + ';'); return '#' + n; };
  const guid = () => "'" + '1' + String(++g).padStart(21, '0') + "'";
  const pt = (x, y, z) => add(`IFCCARTESIANPOINT((${x}.,${y}.,${z}.))`);
  const oh = add("IFCOWNERHISTORY($,$,$,.ADDED.,$,$,$,0)".replace('IFCOWNERHISTORY($,$', 'IFCOWNERHISTORY($,$'));
  void oh;
  L.length = 0; n = 0;
  const person = add("IFCPERSON($,$,'',$,$,$,$,$)"), org = add("IFCORGANIZATION($,'Test',$,$,$)"), po = add(`IFCPERSONANDORGANIZATION(${person},${org},$)`);
  const app = add(`IFCAPPLICATION(${org},'1','Test','Test')`);
  const own = add(`IFCOWNERHISTORY(${po},${app},$,.ADDED.,$,$,$,0)`);
  const unit = add('IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.)'), units = add(`IFCUNITASSIGNMENT((${unit}))`);
  const o = pt(0, 0, 0), ax = add(`IFCAXIS2PLACEMENT3D(${o},$,$)`);
  const tn = site?.north ? add(`IFCDIRECTION((${site.north[0]},${site.north[1]}))`) : '$';
  const ctx = add(`IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,${ax},${tn})`);
  const body = add(`IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,${ctx},$,.MODEL_VIEW.,$)`);
  const proj = add(`IFCPROJECT(${guid()},${own},'Daylight test',$,$,$,$,(${ctx}),${units})`);
  const lp0 = add(`IFCLOCALPLACEMENT($,${ax})`);
  const dms = (a) => '(' + a.join(',') + ')';
  const siteL = add(`IFCSITE(${guid()},${own},'Site',$,$,${lp0},$,$,.ELEMENT.,${site ? dms(site.lat) : '$'},${site ? dms(site.lon) : '$'},${site ? '0.' : '$'},$,$)`);
  const bld = add(`IFCBUILDING(${guid()},${own},'B',$,$,${lp0},$,$,.ELEMENT.,$,$,$)`);
  const st = add(`IFCBUILDINGSTOREY(${guid()},${own},'Level 1',$,$,${lp0},$,$,.ELEMENT.,0.)`);
  add(`IFCRELAGGREGATES(${guid()},${own},$,$,${proj},(${siteL}))`);
  add(`IFCRELAGGREGATES(${guid()},${own},$,$,${siteL},(${bld}))`);
  add(`IFCRELAGGREGATES(${guid()},${own},$,$,${bld},(${st}))`);
  const zdir = add('IFCDIRECTION((0.,0.,1.))');
  const box = (x0, y0, z0, x1, y1, z1) => {
    const c = add(`IFCCARTESIANPOINT((${(x0 + x1) / 2},${(y0 + y1) / 2}))`), p2 = add(`IFCAXIS2PLACEMENT2D(${c},$)`);
    const prof = add(`IFCRECTANGLEPROFILEDEF(.AREA.,$,${p2},${x1 - x0}.,${y1 - y0}.)`);
    const pos = add(`IFCAXIS2PLACEMENT3D(${pt(0, 0, z0)},$,$)`);
    const solid = add(`IFCEXTRUDEDAREASOLID(${prof},${pos},${zdir},${z1 - z0}.)`);
    const rep = add(`IFCSHAPEREPRESENTATION(${body},'Body','SweptSolid',(${solid}))`);
    return add(`IFCPRODUCTDEFINITIONSHAPE($,$,(${rep}))`);
  };
  const lp = () => add(`IFCLOCALPLACEMENT(${lp0},${ax})`);
  const contained = [];
  const space = (name, x0) => { const s = add(`IFCSPACE(${guid()},${own},'${name}',$,$,${lp()},${box(x0, 0, 0, x0 + 6000, 4000, 2700)},'Office',.ELEMENT.,.INTERNAL.,$)`); add(`IFCRELAGGREGATES(${guid()},${own},$,$,${st},(${s}))`); return s; };
  space('101', 0); space('102', 7000);
  const win = (name, b, ow = '$', ohh = '$') => { const w = add(`IFCWINDOW(${guid()},${own},'${name}',$,$,${lp()},${box(...b)},'${name}',${ohh},${ow},.WINDOW.,$,$)`); contained.push(w); return w; };
  const wall = add(`IFCWALL(${guid()},${own},'Wall S',$,$,${lp()},${box(-200, -200, 0, 6200, 0, 2700)},'WS',.STANDARD.)`);
  contained.push(wall);
  const opening = add(`IFCOPENINGELEMENT(${guid()},${own},'Opening',$,$,${lp()},${box(2000, -250, 750, 4000, 50, 2250)},$,.OPENING.)`);
  add(`IFCRELVOIDSELEMENT(${guid()},${own},$,$,${wall},${opening})`);
  const w1 = win('W1', [2000, -100, 750, 4000, -50, 2250]);
  add(`IFCRELFILLSELEMENT(${guid()},${own},$,$,${opening},${w1})`);
  win('W2', [-100, 1000, 900, -50, 2200, 2100], '1000.', '1200.');
  win('W3', [8000, 1000, 2700, 9000, 2000, 2750]);
  win('W4', [30000, 0, 0, 31000, 50, 1000]);
  if (block) contained.push(add(`IFCBUILDINGELEMENTPROXY(${guid()},${own},'Block opposite',$,$,${lp()},${box(-20000, -12000, 0, 26000, -10000, 10000)},$,$)`));
  if (post) contained.push(add(`IFCBUILDINGELEMENTPROXY(${guid()},${own},'Post',$,$,${lp()},${box(2950, -1100, 0, 3050, -1000, 4000)},$,$)`));
  if (balcony) contained.push(add(`IFCSLAB(${guid()},${own},'Balcony',$,$,${lp()},${box(1000, -1100, 3000, 5000, -100, 3200)},$,.FLOOR.)`));
  add(`IFCRELCONTAINEDINSPATIALSTRUCTURE(${guid()},${own},$,$,(${contained.join(',')}),${st})`);
  return 'ISO-10303-21;\nHEADER;FILE_DESCRIPTION((\'ViewDefinition [ReferenceView]\'),\'2;1\');FILE_NAME(\'d.ifc\',\'2026-10-18T12:00:00\',(\'\'),(\'\'),\'test\',\'test\',\'\');FILE_SCHEMA((\'IFC4\'));ENDSEC;\nDATA;\n' + L.join('\n') + '\nENDSEC;\nEND-ISO-10303-21;\n';
}

export async function daylightPart({ APP, WebIFC, IfcModel, quiet, ok, near }) {
  console.log('== LC.20 average daylight factor');
  const D = await import(path.join(APP, 'daylight-bim.js'));
  const deg = Math.atan2;   // eslint: plain maths below
  void deg;
  const R2D = 180 / Math.PI;

  // ---- the section on its own, triangles made by hand
  const quad = (a, b, c, d) => [...a, ...b, ...c, ...a, ...c, ...d];
  const o = [0, 0, 0], n = [0, -1, 0];
  ok(D.sectionTheta(o, n, []).theta === 90, 'nothing in front: θ = 90°');
  // a wall facing the window, 10 m away, its top 8 m above the window centre, 40 m wide (a quad in the plane y = −10)
  const facing = quad([-20, -10, -2], [20, -10, -2], [20, -10, 8], [-20, -10, 8]);
  ok(near(D.sectionTheta(o, n, facing).theta, 90 - Math.atan(8 / 10) * R2D, 1e-9), 'a facing wall H 8 m at D 10 m: θ = 90° − atan(8/10) = 51.34°');
  // the same wall off to the side (not crossed by the section through the window centre): no effect
  ok(D.sectionTheta(o, n, quad([5, -10, -2], [20, -10, -2], [20, -10, 8], [5, -10, 8])).theta === 90, 'a wall to the side, not in the section square to the window: no effect');
  // behind the window: no effect
  ok(D.sectionTheta(o, n, quad([-20, 10, -2], [20, 10, -2], [20, 10, 8], [-20, 10, 8])).theta === 90, 'a wall behind the window: no effect');
  // an overhang 1 m deep, 2 m above: hides atan(2/1)…90°
  const over = quad([-3, 0, 2], [3, 0, 2], [3, -1, 2], [-3, -1, 2]);
  ok(near(D.sectionTheta(o, n, over).theta, Math.atan(2 / 1) * R2D, 1e-6), 'an overhang 1 m out, 2 m up: θ = atan(2/1) = 63.43°');
  ok(near(D.sectionTheta(o, n, [...facing, ...over]).theta, Math.atan(2) * R2D - Math.atan(0.8) * R2D, 1e-6), 'both: θ = 63.43° − 38.66° = 24.78° (intervals merged, not double counted)');
  ok(near(D.sectionTheta(o, n, [...facing, ...quad([-20, -12, -2], [20, -12, -2], [20, -12, 5], [-20, -12, 5])]).theta, 90 - Math.atan(0.8) * R2D, 1e-9), 'a lower wall behind the first: hidden already, θ unchanged');
  ok(D.sectionTheta(o, n, quad([-20, -5, -3], [20, -5, -3], [20, -5, -1], [-20, -5, -1])).theta === 90, 'a wall below the horizon (a low fence below the window): no effect');

  // ---- the formula against a hand calculation (BRE / Littlefair form)
  ok(near(D.averageDF({ A: 102, R: 0.5, windows: [{ glazed: 2.25, theta: 90 }] }, { T: 0.7, M: 1 }), (0.7 * 2.25 * 90) / (102 * 0.75), 1e-12), 'ADF = T·Ag·θ·M / (A(1−R²)): 0.7 × 2.25 × 90 / (102 × 0.75) = 1.853 %');
  ok(near(D.meanReflectance({ floor: 24, wall: 51, ceiling: 24, glass: 3 }, { floor: 0.2, wall: 0.5, ceiling: 0.7 }), 47.4 / 102, 1e-12), 'mean reflectance: (24×0.2 + 51×0.5 + 24×0.7 + 3×0.1) / 102 = 0.4647');
  ok(D.band(1.99) === 'low' && D.band(2) === 'mid' && D.band(4.99) === 'mid' && D.band(5) === 'high', 'bands: under 2 % low, 2–5 % mid, 5 % and over high');

  // ---- from the model
  const open = async (text) => { const eng = await quiet(IfcModel.create)(WebIFC, null); const m = await quiet((b) => eng.load(b))(new TextEncoder().encode(text)); return { api: eng.api, mid: m.modelID }; };
  const run = async (opts) => { const { api, mid } = await open(building(opts)); return D.gatherRooms(WebIFC, api, mid); };
  const plain = await run();
  const r101 = plain.rooms.find((r) => r.name === '101'), r102 = plain.rooms.find((r) => r.name === '102');
  ok(plain.rooms.length === 2 && near(r101.A, 102, 1e-6) && near(r101.areas.floor, 24, 1e-6) && near(r101.areas.ceiling, 24, 1e-6), 'room 101: inside surfaces 102 m² (floor 24, ceiling 24) from its own shell', JSON.stringify(r101 && r101.areas));
  const w1 = r101.windows.find((w) => w.name === 'W1'), w2 = r101.windows.find((w) => w.name === 'W2');
  ok(r101.windows.length === 2 && w1 && w2, 'W1 and W2 are room 101\'s windows', r101.windows.map((w) => w.name).join());
  ok(near(w1.area, 3, 1e-6) && near(w2.area, 1.2, 1e-6), 'window areas: W1 from its box 2 × 1.5 = 3 m²; W2 from OverallWidth × OverallHeight = 1.2 m² (not its 1.44 m² box)', w1.area + ' ' + w2.area);
  ok(near(w1.n[1], -1, 1e-9) && near(w2.n[0], -1, 1e-9) && near(w1.origin[2] - w2.origin[2], 0, 1e-9), 'W1 looks toward −Y, W2 toward −X (level, square to their walls; both centres at the same height)', JSON.stringify({ n1: w1.n, n2: w2.n }));
  ok(w1.theta === 90 && w2.theta === 90, 'nothing outside: θ = 90° for both (the host wall around W1 is left out)', w1.theta + ' ' + w2.theta);
  ok(near(r101.areas.glass, 4.2, 1e-6) && near(r101.areas.wall, 54 - 4.2, 1e-6), 'the glass (4.2 m²) is taken out of the walls\' 54 m²');
  ok(r102.windows.length === 0 && plain.roof.map((w) => w.name).join() === 'W3' && plain.unassigned.map((w) => w.name).join() === 'W4', 'room 102 has no window; W3 is a roof window (listed apart); W4 belongs to no room');
  let res = D.daylight(plain, {});
  let a = res.find((r) => r.name === '101');
  // by hand: R = (24·0.2 + 49.8·0.5 + 24·0.7 + 4.2·0.1)/102 = 46.92/102 = 0.46; ADF = 0.7 · 0.75 · (3·90 + 1.2·90) / (102 · (1 − 0.46²))
  const hand1 = (0.7 * 0.75 * (3 * 90 + 1.2 * 90)) / (102 * (1 - 0.46 * 0.46));
  ok(near(a.R, 0.46, 1e-9) && near(a.adf, hand1, 1e-9) && near(a.adf, 2.4678, 1e-4) && a.band === 'mid', 'room 101, nothing outside: R 0.46, ADF 2.47 % by hand = by the model', a.adf.toFixed(4));
  ok(res.find((r) => r.name === '102').adf === 0, 'room 102 (no window): 0 %');
  const blk = await run({ block: true });
  const t1 = blk.rooms.find((r) => r.name === '101').windows.find((w) => w.name === 'W1').theta;
  const handT1 = 90 - Math.atan(8.5 / 9.9) * R2D;
  ok(near(t1, handT1, 1e-9), 'a building opposite (8.5 m above the centre, 9.9 m from the glass): θ = 90° − atan(8.5/9.9) = ' + handT1.toFixed(2) + '°', String(t1));
  ok(blk.rooms.find((r) => r.name === '101').windows.find((w) => w.name === 'W2').theta === 90, 'W2 on the other side: still 90°');
  const bal = await run({ balcony: true });
  ok(near(bal.rooms.find((r) => r.name === '101').windows.find((w) => w.name === 'W1').theta, Math.atan(1.5 / 1.0) * R2D, 1e-6), 'a balcony 1.0 m out, 1.5 m above the centre: θ = atan(1.5/1.0) = 56.31°');
  const both = await run({ block: true, balcony: true });
  const tb = both.rooms.find((r) => r.name === '101').windows.find((w) => w.name === 'W1').theta;
  ok(near(tb, Math.atan(1.5) * R2D - Math.atan(8.5 / 9.9) * R2D, 1e-6), 'both: θ = 56.31° − 40.65° = 15.66°', String(tb));
  const pst = await run({ post: true });
  const pw = pst.rooms.find((r) => r.name === '101').windows.find((w) => w.name === 'W1');
  const handPost = (4 * 90 + (90 - Math.atan(2.5 / 0.9) * R2D)) / 5;
  ok(near(pw.theta, handPost, 1e-6) && pw.sections.join() === [90, 90, 90 - Math.atan(2.5 / 0.9) * R2D, 90, 90].map((x) => x).join(), 'a post 0.1 m wide in front of W1\'s centre: only the middle section of five meets it, θ = (4 × 90° + 19.8°) / 5 = ' + handPost.toFixed(2) + '°', JSON.stringify(pw.sections));
  ok(both.rooms.find((r) => r.name === '101').windows.find((w) => w.name === 'W1').sections.every((x) => near(x, tb, 1e-9)), 'the building opposite and the balcony are wider than the window: all five sections agree');
  res = D.daylight(both, { T: 0.6, glazedShare: 0.8, M: 0.9, refl: { floor: 0.3, wall: 0.6, ceiling: 0.8 } });
  a = res.find((r) => r.name === '101');
  const R2 = (24 * 0.3 + 49.8 * 0.6 + 24 * 0.8 + 4.2 * 0.1) / 102;
  const hand2 = (0.6 * 0.9 * (3 * 0.8 * tb + 1.2 * 0.8 * 90)) / (102 * (1 - R2 * R2));
  ok(near(a.R, R2, 1e-9) && near(a.adf, hand2, 1e-9), 'other inputs (T 0.6, glazed 80 %, M 0.9, reflectances 0.3 / 0.6 / 0.8) with both obstructions: ADF ' + hand2.toFixed(3) + ' % by hand = by the model');
  // the showcase house, and the same house turned (fixtures/showcase): every room's factor must not change with the turn
  const fs = await import('node:fs');
  const showcase = path.resolve(APP, '../../../../../fixtures/showcase');
  const house = async (f) => { const { api, mid } = await open(new TextDecoder().decode(fs.readFileSync(path.join(showcase, f)))); return D.daylight(D.gatherRooms(WebIFC, api, mid), {}); };
  const h0 = await house('bimcraft-house.ifc'), h1 = await house('bimcraft-house-turned.ifc');
  const by = (rs) => Object.fromEntries(rs.map((r) => [r.name, r]));
  const b0 = by(h0), b1 = by(h1);
  ok(h0.length === 5 && h0.reduce((t, r) => t + r.windows.length, 0) === 9, 'the showcase house: 5 rooms, 9 windows, each window in a room');
  ok(Object.keys(b0).every((k) => b1[k] && near(b1[k].adf, b0[k].adf, 1e-6) && b1[k].windows.length === b0[k].windows.length), 'the same house turned: every room\'s daylight factor the same (the facing, the sections and the cut work at any angle)', h0.map((r) => r.name + ' ' + r.adf.toFixed(4) + '/' + (b1[r.name]?.adf ?? NaN).toFixed(4)).join(', '));
  const csv = D.daylightCsv(res, { storeyName: () => 'Level 1', inputs: { T: 0.6 } });
  ok(csv.startsWith('﻿Room,') && /101 Office,Level 1,102\.00,24\.00,/.test(csv) && /\n"?Inputs/.test(csv.replace(/\r/g, '')), 'CSV: a row per room (inside area, floor, R, windows, glazed area, θ, ADF, band) and the inputs');
}

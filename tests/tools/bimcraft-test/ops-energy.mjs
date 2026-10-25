/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ops-energy.mjs — LC.20 item 7 (session bim-ops): heating and cooling loads (energy-bim.js) against the hand-worked cases E1
 * and E2 in docs/0.7-sessions/bim-ops.md § Hand-worked cases (each checked twice). Part of ops-test.mjs (`--only energy`).
 *
 * The E1 building (IFC4, millimetres, plain STEP written here; boxes = extruded rectangles):
 *   room "1" 5000 × 4000 × 2500 at the origin; walls 300 thick all round (S, N full length; W, E between them), one
 *   Pset_WallCommon ThermalTransmittance 0.3 SHARED by the four walls; window 2000 × 1500 (OverallWidth / OverallHeight)
 *   in the S wall's opening, Pset_WindowCommon 1.4; floor slab (.FLOOR.) under it, U 0.25; roof slab (.ROOF.) over, U 0.2.
 *   Variant `layers`: no wall set; the walls carry a material layer set brick 102.5 / mineral wool 100 / plaster 13 (E2).
 *   Variant `site`: IfcSite at 51° 30′ N, 0° (for the cooling peak's sun).
 */
import path from 'node:path';

export function energyBuilding({ layers = false, site = false } = {}) {
  const L = [];
  let n = 0, g = 0;
  const add = (s) => { L.push('#' + (++n) + '=' + s + ';'); return '#' + n; };
  const guid = () => "'" + '2' + String(++g).padStart(21, '0') + "'";
  const person = add("IFCPERSON($,$,'',$,$,$,$,$)"), org = add("IFCORGANIZATION($,'Test',$,$,$)"), po = add(`IFCPERSONANDORGANIZATION(${person},${org},$)`);
  const app = add(`IFCAPPLICATION(${org},'1','Test','Test')`), own = add(`IFCOWNERHISTORY(${po},${app},$,.ADDED.,$,$,$,0)`);
  const unit = add('IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.)'), units = add(`IFCUNITASSIGNMENT((${unit}))`);
  const pt = (x, y, z) => add(`IFCCARTESIANPOINT((${x}.,${y}.,${z}.))`);
  const ax = add(`IFCAXIS2PLACEMENT3D(${pt(0, 0, 0)},$,$)`);
  const ctx = add(`IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,${ax},$)`);
  const body = add(`IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,${ctx},$,.MODEL_VIEW.,$)`);
  const proj = add(`IFCPROJECT(${guid()},${own},'Energy test',$,$,$,$,(${ctx}),${units})`);
  const lp0 = add(`IFCLOCALPLACEMENT($,${ax})`);
  const st0 = add(`IFCSITE(${guid()},${own},'Site',$,$,${lp0},$,$,.ELEMENT.,${site ? '(51,30,0)' : '$'},${site ? '(0,0,0)' : '$'},${site ? '0.' : '$'},$,$)`);
  const bld = add(`IFCBUILDING(${guid()},${own},'B',$,$,${lp0},$,$,.ELEMENT.,$,$,$)`);
  const st = add(`IFCBUILDINGSTOREY(${guid()},${own},'Ground',$,$,${lp0},$,$,.ELEMENT.,0.)`);
  add(`IFCRELAGGREGATES(${guid()},${own},$,$,${proj},(${st0}))`); add(`IFCRELAGGREGATES(${guid()},${own},$,$,${st0},(${bld}))`); add(`IFCRELAGGREGATES(${guid()},${own},$,$,${bld},(${st}))`);
  const zdir = add('IFCDIRECTION((0.,0.,1.))');
  const box = (x0, y0, z0, x1, y1, z1) => {
    const c = add(`IFCCARTESIANPOINT((${(x0 + x1) / 2},${(y0 + y1) / 2}))`), p2 = add(`IFCAXIS2PLACEMENT2D(${c},$)`);
    const prof = add(`IFCRECTANGLEPROFILEDEF(.AREA.,$,${p2},${x1 - x0}.,${y1 - y0}.)`);
    const solid = add(`IFCEXTRUDEDAREASOLID(${prof},${add(`IFCAXIS2PLACEMENT3D(${pt(0, 0, z0)},$,$)`)},${zdir},${z1 - z0}.)`);
    return add(`IFCPRODUCTDEFINITIONSHAPE($,$,(${add(`IFCSHAPEREPRESENTATION(${body},'Body','SweptSolid',(${solid}))`)}))`);
  };
  const lp = () => add(`IFCLOCALPLACEMENT(${lp0},${ax})`);
  const contained = [];
  const sp = add(`IFCSPACE(${guid()},${own},'1',$,$,${lp()},${box(0, 0, 0, 5000, 4000, 2500)},'Room',.ELEMENT.,.INTERNAL.,$)`);
  add(`IFCRELAGGREGATES(${guid()},${own},$,$,${st},(${sp}))`);
  const wall = (name, b) => { const w = add(`IFCWALL(${guid()},${own},'${name}',$,$,${lp()},${box(...b)},'${name}',.STANDARD.)`); contained.push(w); return w; };
  const wS = wall('Wall S', [-300, -300, 0, 5300, 0, 2500]), wN = wall('Wall N', [-300, 4000, 0, 5300, 4300, 2500]);
  const wW = wall('Wall W', [-300, 0, 0, 0, 4000, 2500]), wE = wall('Wall E', [5000, 0, 0, 5300, 4000, 2500]);
  const opening = add(`IFCOPENINGELEMENT(${guid()},${own},'Opening',$,$,${lp()},${box(1500, -350, 600, 3500, 50, 2100)},$,.OPENING.)`);
  add(`IFCRELVOIDSELEMENT(${guid()},${own},$,$,${wS},${opening})`);
  const win = add(`IFCWINDOW(${guid()},${own},'Window S',$,$,${lp()},${box(1500, -200, 600, 3500, -100, 2100)},'WS',1500.,2000.,.WINDOW.,$,$)`);
  contained.push(win);
  add(`IFCRELFILLSELEMENT(${guid()},${own},$,$,${opening},${win})`);
  const floor = add(`IFCSLAB(${guid()},${own},'Floor',$,$,${lp()},${box(-300, -300, -300, 5300, 4300, 0)},'F',.FLOOR.)`);
  const roof = add(`IFCSLAB(${guid()},${own},'Roof',$,$,${lp()},${box(-300, -300, 2500, 5300, 4300, 2800)},'R',.ROOF.)`);
  contained.push(floor, roof);
  const pset = (name, rows) => add(`IFCPROPERTYSET(${guid()},${own},'${name}',$,(${rows.map(([k, v]) => add(`IFCPROPERTYSINGLEVALUE('${k}',$,IFCTHERMALTRANSMITTANCEMEASURE(${v}),$)`)).join(',')}))`);
  const rel = (objs, ps) => add(`IFCRELDEFINESBYPROPERTIES(${guid()},${own},$,$,(${objs.join(',')}),${ps})`);
  if (!layers) rel([wS, wN, wW, wE], pset('Pset_WallCommon', [['ThermalTransmittance', '0.3']]));
  else {
    const mat = (nm) => add(`IFCMATERIAL('${nm}',$,$)`);
    const ly = (m, d) => add(`IFCMATERIALLAYER(${m},${d},$,$,$,$,$)`);
    const set = add(`IFCMATERIALLAYERSET((${ly(mat('Brick'), '102.5')},${ly(mat('Mineral wool'), '100.')},${ly(mat('Gypsum plaster'), '13.')}),'Cavity wall',$)`);
    const use = add(`IFCMATERIALLAYERSETUSAGE(${set},.AXIS2.,.POSITIVE.,0.,$)`);
    add(`IFCRELASSOCIATESMATERIAL(${guid()},${own},$,$,(${wS},${wN},${wW},${wE}),${use})`);
  }
  rel([win], pset('Pset_WindowCommon', [['ThermalTransmittance', '1.4']]));
  rel([floor], pset('Pset_SlabCommon', [['ThermalTransmittance', '0.25']]));
  rel([roof], pset('Pset_SlabCommon', [['ThermalTransmittance', '0.2']]));
  add(`IFCRELCONTAINEDINSPATIALSTRUCTURE(${guid()},${own},$,$,(${contained.join(',')}),${st})`);
  return 'ISO-10303-21;\nHEADER;FILE_DESCRIPTION((\'ViewDefinition [ReferenceView]\'),\'2;1\');FILE_NAME(\'e.ifc\',\'2026-10-23T12:00:00\',(\'\'),(\'\'),\'test\',\'test\',\'\');FILE_SCHEMA((\'IFC4\'));ENDSEC;\nDATA;\n' + L.join('\n') + '\nENDSEC;\nEND-ISO-10303-21;\n';
}

export default async function energyPart({ APP, WebIFC, ok, near, saved, open }) {
  console.log('== LC.20 heating and cooling loads');
  const E = await import(path.join(APP, 'energy-bim.js'));
  const D = await import(path.join(APP, 'daylight-bim.js'));
  const S = await import(path.join(APP, 'daylight-bim-sky.js'));
  const run = async (opts = {}, inputs = {}, extra = {}) => {
    const ed = await open(energyBuilding(opts));
    const g = D.gatherRooms(WebIFC, ed.api, ed.mid, { keep: true });
    const e = E.gatherEnergy(WebIFC, ed.api, ed.mid, g);
    const u = E.uValues(WebIFC, ed.api, ed.mid, [...e.ids], extra);
    return { ed, g, e, u, res: E.loads(e, u, inputs, extra) };
  };
  ok(near(E.RHO_C, 0.335, 1e-12), 'air: 1.2 kg/m³ × 1005 J/kgK = 0.335 Wh/m³K');

  // ---- E1: what bounds the room, measured from its own shell
  const { ed, e, u, res } = await run();
  const r = e.rooms[0], part = (cls, exp) => r.parts.filter((p) => p.cls === cls && p.exposure === exp).reduce((s, p) => s + p.area, 0);
  ok(e.rooms.length === 1 && near(r.floorArea, 20, 1e-9) && near(r.volume, 50, 1e-9) && r.lowest && r.open === 0, 'E1: one room, floor 20 m², volume 50 m³, on the lowest level, nothing open', JSON.stringify({ f: r.floorArea, v: r.volume, open: r.open }));
  ok(near(part('IFCWALL', 'outside'), 42, 1e-6) && near(part('IFCWINDOW', 'outside'), 3, 1e-9) && near(part('IFCSLAB', 'ground'), 20, 1e-6) && near(part('IFCSLAB', 'outside'), 20, 1e-6),
    'E1 by hand: walls 45 − 3 = 42 m² to outside, the window 2.0 × 1.5 = 3 m², the floor 20 m² on the ground, the roof 20 m² to outside', JSON.stringify(r.parts.map((p) => [p.name, p.exposure, +p.area.toFixed(4)])));
  const uw = [...u.values()];
  ok(uw.filter((x) => x.kind === 'wall').every((x) => x.u === 0.3 && x.source === 'ifc' && x.shared === 4) && uw.find((x) => x.kind === 'window').u === 1.4 && uw.find((x) => x.name === 'Roof').u === 0.2 && uw.find((x) => x.name === 'Floor').u === 0.25,
    'U from the IFC: walls 0.3 (one set shared by 4), window 1.4, roof 0.2, floor 0.25');
  const R = res[0];
  ok(near(R.H.out, 20.8, 1e-6) && near(R.H.ground, 5, 1e-6) && near(R.H.vent, 8.375, 1e-9), 'E1 by hand: H out = 0.3×42 + 1.4×3 + 0.2×20 = 20.8 W/K; ground 0.25×20 = 5; ventilation 0.335 × 0.5 × 50 = 8.375 W/K', JSON.stringify(R.H));
  ok(near(R.heat.fabric, 499.2, 1e-4) && near(R.heat.ground, 55, 1e-4) && near(R.heat.vent, 201, 1e-4) && near(R.heat.total, 755.2, 1e-4), 'E1 by hand: heat loss at 21 °C in, −3 °C out, 10 °C ground = 499.2 + 55 + 201 = 755.2 W', JSON.stringify(R.heat));
  ok(near(R.annual, 1510.4, 1e-3), 'E1 by hand: 2000 degree-days → (20.8 + 8.375 + 5 × 11/24) × 2000 × 24 / 1000 = 1510.4 kWh', String(R.annual));
  ok(near(R.cool.fabric, 124.8, 1e-4) && near(R.cool.vent, 50.25, 1e-4) && near(R.cool.people + R.cool.lights + R.cool.equip, 510, 1e-9) && R.cool.solar === 0 && near(R.cool.total, 685.05, 1e-4), 'E1 by hand: cooling at 30 °C out, 24 °C in, no sun given = 124.8 + 50.25 + people 150 + lights 160 + equipment 200 = 685.05 W', JSON.stringify(R.cool));
  // other inputs move it the way the formula says
  const R2 = E.loads(e, u, { te: -10, ach: 1, dd: 3000 })[0];
  ok(near(R2.heat.total, 20.8 * 31 + 5 * 11 + 16.75 * 31, 1e-6) && near(R2.annual, (20.8 + 16.75 + 5 * 11 / 31) * 3000 * 24 / 1000, 1e-6), 'colder (−10 °C), twice the air (1 an hour), 3000 degree-days: as the formula says');
  // the cooling peak with the sun (a site at 51° 30′ N): the room's own solar peak is added
  const s1 = await run({ site: true });
  const sun = S.solarDay(s1.g.rooms, s1.g.prods, S.siteOf(s1.ed.api, s1.ed.mid), { month: 7, day: 21, tz: 0, g: 0.6 });
  const Rs = E.loads(s1.e, s1.u, {}, { solar: sun })[0];
  ok(Rs.cool.solar > 0 && near(Rs.cool.solar, sun.rooms[0].peak, 1e-9) && near(Rs.cool.total, 685.05 + sun.rooms[0].peak, 1e-6), `with the sun of 21 July: the window's peak (${sun.rooms[0].peak.toFixed(0)} W at ${sun.rooms[0].peakAt} h) is added to the cooling peak`);

  // ---- E2: U from the walls' material layers
  const { u: u2 } = await run({ layers: true });
  const w2 = [...u2.values()].find((x) => x.kind === 'wall');
  const hand = 1 / (0.13 + 0.1025 / 0.77 + 0.1 / 0.035 + 0.013 / 0.5 + 0.04);
  ok(w2.source === 'layers' && near(w2.u, hand, 1e-9) && near(w2.u, 0.313848, 1e-6) && w2.layers.length === 3, 'E2 by hand: brick 102.5 / mineral wool 100 / plaster 13 → U = 1 / (0.13 + 0.1331 + 2.8571 + 0.0260 + 0.04) = 0.3138', String(w2.u));
  const { u: u3 } = await run({ layers: true }, {}, { lambdas: { 'mineral wool': 0.032 } });
  ok(near([...u3.values()].find((x) => x.kind === 'wall').u, 1 / (0.13 + 0.1025 / 0.77 + 0.1 / 0.032 + 0.013 / 0.5 + 0.04), 1e-9), 'a typed λ (the maker\'s 0.032 for the wool) is used instead of the typical one');

  // ---- a typed U written into the IFC: the shared set changes for all four walls; one undo step
  const wallGuid = (() => { for (const id of ed.api.GetLineIDsWithType(ed.mid, WebIFC.IFCWALL) ?? []) { const l = ed.api.GetLine(ed.mid, id, false); if (l.Name?.value === 'Wall N') return l.GlobalId.value; } return null; })();
  const n0 = ed.changes.length;
  ed.modelChange(E.uOp(wallGuid, 0.18));
  const after = E.uValues(WebIFC, ed.api, ed.mid, [...e.ids]);
  ok(ed.changes.length === n0 + 1 && [...after.values()].filter((x) => x.kind === 'wall').every((x) => x.u === 0.18) && /IFCTHERMALTRANSMITTANCEMEASURE\(0\.18\)/.test(new TextDecoder().decode(ed.save())), 'U 0.18 typed on Wall N: the set the four walls share now says 0.18 (IfcThermalTransmittanceMeasure); one undo step');
  ed.undo();
  ok([...E.uValues(WebIFC, ed.api, ed.mid, [...e.ids]).values()].filter((x) => x.kind === 'wall').every((x) => x.u === 0.3), 'undo: 0.3 again');
  ed.modelChange(E.uOp(wallGuid, ''));
  ok([...E.uValues(WebIFC, ed.api, ed.mid, [...e.ids]).values()].filter((x) => x.kind === 'wall').every((x) => x.source === 'default' && x.u === 0.3), 'cleared: the walls fall back to the stated default (0.3, marked default)');
  ok((() => { try { E.uOp(wallGuid, -1); return false; } catch (x) { return x.key === 'energy.err.u'; } })(), 'a U of −1: refused');
  saved['energy-ifc4'] = ed.save();

  // ---- the showcase house: every room bounded, the numbers in a sane range, quick
  {
    const fs = await import('node:fs');
    const showcase = path.resolve(APP, '../../../../../fixtures/showcase');
    const hed = await open(fs.readFileSync(path.join(showcase, 'bimcraft-house.ifc')));
    const t0 = Date.now();
    const hg = D.gatherRooms(WebIFC, hed.api, hed.mid, { keep: true });
    const he = E.gatherEnergy(WebIFC, hed.api, hed.mid, hg);
    const hres = E.loads(he, E.uValues(WebIFC, hed.api, hed.mid, [...he.ids]), {});
    const ms = Date.now() - t0;
    const shell = (r) => { const tr = hg.prods.get(r.id).tr; let a = 0; for (let i = 0; i + 8 < tr.length; i += 9) { const ab = [tr[i + 3] - tr[i], tr[i + 4] - tr[i + 1], tr[i + 5] - tr[i + 2]], ac = [tr[i + 6] - tr[i], tr[i + 7] - tr[i + 1], tr[i + 8] - tr[i + 2]]; a += Math.hypot(ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]) / 2; } return a; };
    const cover = he.rooms.map((r) => (r.parts.reduce((s, p) => s + p.area, 0) + r.open) / shell(r));
    ok(he.rooms.length === 5 && cover.every((c) => Math.abs(c - 1) < 1e-6), 'the showcase house: 5 rooms; every room\'s shell fully accounted for (bounded + open = its area)', cover.map((c) => c.toFixed(6)).join(' '));
    ok(he.rooms.every((r) => r.open / shell(r) < 0.05) && he.rooms.some((r) => r.parts.some((p) => p.exposure === 'adjacent')), 'under 5 % of any room\'s shell meets no element; rooms next to each other are found', he.rooms.map((r) => r.name + ' open ' + (100 * r.open / shell(r)).toFixed(1) + ' %').join(', '));
    ok(hres.every((r) => r.heat.total > 0 && r.heat.total / r.floorArea < 200 && r.annual > 0), `heat loss per room between 0 and 200 W/m² of floor (${hres.map((r) => (r.heat.total / r.floorArea).toFixed(0)).join(', ')} W/m²); ${ms} ms in all`);
  }

  // ---- degree-days from a CSV
  const dd = E.degreeDaysCsv('Month,HDD (15.5 °C)\nJan,380.5\nFeb,330\nMar,"300,5"\nApr,210\n');
  ok(near(dd.total, 1221, 1e-9) && dd.rows === 4, 'degree-days from a CSV: the column added up (a decimal comma read too): 1221 over 4 rows');
}

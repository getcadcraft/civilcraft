#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-fixture.mjs — writes a small IFC4 building we own (no client data, no third-party sample), for BimCraft's tests.
 * Plain STEP text, written line by line; units millimetres. What is in it, and what each test leans on:
 *
 *   project → site → building → Level 1 (0 mm), Level 2 (3000 mm)
 *   Level 1: walls W-101…W-104 (a 10 × 6 m box, 200 thick, 3 m high), W-101 has an opening with door D-101 in it
 *            (door placed relative to the opening); space "101 Office" (aggregated under the storey) holding desk F-101
 *            (contained in the space, not the storey); stair ST-1 = two stair flights (the stair itself has no body)
 *   Level 2: slab S-201, walls W-201, W-202
 *   types:   IfcWallType "Basic wall 200" (type pset Pset_WallCommon FireRating EI60) on every wall
 *   psets:   one Pset_WallCommon (IsExternal true, LoadBearing true) SHARED by W-101…W-104; W-201/W-202 have their own
 *            (IsExternal false); Fixture_Data.Cost (a real) on every wall, Fixture_Data.Zone on the Level 1 walls;
 *            Qto_WallBaseQuantities Length, NetSideArea, NetVolume on every wall; Pset_SpaceCommon on the space
 *   materials: Concrete (walls, slab), Oak (desk)
 *
 * Variants (options) for the checks and the compare tests:
 *   rev: 'b'        W-104 removed, W-203 added, W-201's Cost changed, the desk moved 500 mm — same GlobalIds otherwise
 *   shift: mm       the whole site moved along X (federation: a second model placed by its own coordinates)
 *   spaceQto: true  the space gets Qto_SpaceBaseQuantities NetFloorArea 52.5, NetVolume 152.25 (its shape: 9.6 × 5.6 × 2.9 m = 53.76 m², 155.904 m³)
 *   problems: true  adds a proxy contained nowhere (no storey), a wall with W-102's GlobalId (duplicate),
 *                   a copy of W-103 at the same place (stacked duplicate), and a wall without Fixture_Data
 *   georef: 'map'   (0.5 WL.4) IfcProjectedCRS EPSG:28356 (GDA94 / MGA zone 56, AHD, map unit metre) + IfcMapConversion:
 *                   E 334567.8, N 6251234.5, H 42 m, the model's X axis 30° north of east, scale 0.001 (mm → m) — GEOREF
 *                   holds the numbers; IfcSite also carries a latitude / longitude (the map conversion must win)
 *   georef: 'site'  only IfcSite RefLatitude −33° 51′ 35.9″, RefLongitude 151° 12′ 33.48″, RefElevation 42 m, and the
 *                   context's TrueNorth 20° west of the model's +Y (no map conversion)
 *
 *   node tools/bimcraft-test/ifc-fixture.mjs [out.ifc] [--rev b] [--problems]
 *   import { fixtureIfc, FIXTURE } from './ifc-fixture.mjs'   →  fixtureIfc({ rev, problems }) = the text
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/** GlobalIds (22 characters of IFC base64) fixed per element, so revisions compare by GlobalId. */
const G = (n) => ('0BimCraftFixture' + String(n).padStart(6, '0')).slice(0, 22);

/** The georeference the `georef` variants write (0.5 WL.4). */
export const GEOREF = {
  crs: 'EPSG:28356', e: 334567.8, n: 6251234.5, h: 42, rotationDeg: 30, scale: 0.001,
  lat: [-33, -51, -35, -900000], lon: [151, 12, 33, 480000], latDeg: -(33 + 51 / 60 + 35.9 / 3600), lonDeg: 151 + 12 / 60 + 33.48 / 3600,
  elevMm: 42000, northDeg: 20,
};

export const FIXTURE = {
  walls1: ['W-101', 'W-102', 'W-103', 'W-104'], walls2: ['W-201', 'W-202'], door: 'D-101', desk: 'F-101', space: '101 Office',
  stair: 'ST-1', flights: ['ST-1 flight 1', 'ST-1 flight 2'], slab: 'S-201', storeys: ['Level 1', 'Level 2'],
  guid: G,
};

export function fixtureIfc({ rev = 'a', problems = false, shift = 0, spaceQto = false, georef = null } = {}) {
  const L = [];
  let n = 0;
  const line = (s) => { n++; L.push('#' + n + '=' + s + ';'); return '#' + n; };
  const str = (s) => (s === null || s === undefined ? '$' : "'" + String(s).replace(/'/g, "''") + "'");
  const list = (a) => '(' + a.join(',') + ')';
  const num = (v) => (Number.isInteger(v) ? v.toFixed(1).replace(/\.0$/, '.') : String(v));
  const pt = (x, y, z) => line('IFCCARTESIANPOINT(' + list(z === undefined ? [num(x), num(y)] : [num(x), num(y), num(z)]) + ')');
  const dir = (x, y, z) => line('IFCDIRECTION(' + list(z === undefined ? [num(x), num(y)] : [num(x), num(y), num(z)]) + ')');
  const ax3 = (x = 0, y = 0, z = 0, rx = 1, ry = 0) => line('IFCAXIS2PLACEMENT3D(' + pt(x, y, z) + ',' + dir(0, 0, 1) + ',' + dir(rx, ry, 0) + ')');
  const place = (rel, x = 0, y = 0, z = 0, rx = 1, ry = 0) => line('IFCLOCALPLACEMENT(' + (rel || '$') + ',' + ax3(x, y, z, rx, ry) + ')');

  const oh = line("IFCOWNERHISTORY($,$,$,.NOCHANGE.,$,$,$,0)");   // minimal; web-ifc does not need more
  const units = line('IFCUNITASSIGNMENT(' + list([
    line('IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.)'), line('IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.)'),
    line('IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.)'), line('IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.)')]) + ')');
  const tn = georef === 'site' ? dir(-Math.sin(GEOREF.northDeg * Math.PI / 180), Math.cos(GEOREF.northDeg * Math.PI / 180)) : '$';
  const ctx = line("IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05," + ax3() + ',' + tn + ')');
  if (georef === 'map') {
    const metre = line('IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.)');
    const crs = line("IFCPROJECTEDCRS('" + GEOREF.crs + "','GDA94 / MGA zone 56','GDA94','AHD','UTM','56'," + metre + ')');
    const r = GEOREF.rotationDeg * Math.PI / 180;
    line('IFCMAPCONVERSION(' + ctx + ',' + crs + ',' + GEOREF.e + ',' + GEOREF.n + ',' + num(GEOREF.h) + ',' + Math.cos(r) + ',' + Math.sin(r) + ',' + GEOREF.scale + ')');
  }
  const siteRef = georef ? '(' + list(GEOREF.lat.map(String)) + ',' + list(GEOREF.lon.map(String)) + ',' + num(GEOREF.elevMm) + ')' : null;
  const body = line("IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*," + ctx + ',$,.MODEL_VIEW.,$)');
  const project = line('IFCPROJECT(' + str(G(1)) + ',' + oh + ",'BimCraft fixture',$,$,$,$," + list([ctx]) + ',' + units + ')');
  const sitePl = place(null, shift, 0, 0);   // `shift` (mm along X) moves the whole site: federation tests
  const site = line('IFCSITE(' + str(G(2)) + ',' + oh + ",'Site',$,$," + sitePl + ',$,$,.ELEMENT.,' + (siteRef ? siteRef.slice(1, -1) : '$,$,$') + ',$,$)');
  const bldPl = place(sitePl);
  const building = line('IFCBUILDING(' + str(G(3)) + ',' + oh + ",'Fixture building',$,$," + bldPl + ',$,$,.ELEMENT.,$,$,$)');
  const st1Pl = place(bldPl, 0, 0, 0), st2Pl = place(bldPl, 0, 0, 3000);
  const st1 = line('IFCBUILDINGSTOREY(' + str(G(4)) + ',' + oh + ",'Level 1',$,$," + st1Pl + ',$,$,.ELEMENT.,0.)');
  const st2 = line('IFCBUILDINGSTOREY(' + str(G(5)) + ',' + oh + ",'Level 2',$,$," + st2Pl + ',$,$,.ELEMENT.,3000.)');
  line('IFCRELAGGREGATES(' + str(G(6)) + ',' + oh + ',$,$,' + project + ',' + list([site]) + ')');
  line('IFCRELAGGREGATES(' + str(G(7)) + ',' + oh + ',$,$,' + site + ',' + list([building]) + ')');
  line('IFCRELAGGREGATES(' + str(G(8)) + ',' + oh + ',$,$,' + building + ',' + list([st1, st2]) + ')');

  /** A box body: rectangle (centred at cx, cy in the element's axes) extruded up by h. */
  const box = (cx, cy, w, d, h, z = 0) => {
    const prof = line("IFCRECTANGLEPROFILEDEF(.AREA.,$," + line('IFCAXIS2PLACEMENT2D(' + pt(cx, cy) + ',' + dir(1, 0) + ')') + ',' + num(w) + ',' + num(d) + ')');
    const solid = line('IFCEXTRUDEDAREASOLID(' + prof + ',' + ax3(0, 0, z) + ',' + dir(0, 0, 1) + ',' + num(h) + ')');
    const rep = line("IFCSHAPEREPRESENTATION(" + body + ",'Body','SweptSolid'," + list([solid]) + ')');
    return line('IFCPRODUCTDEFINITIONSHAPE($,$,' + list([rep]) + ')');
  };
  const concrete = line("IFCMATERIAL('Concrete',$,$)"), oak = line("IFCMATERIAL('Oak',$,$)");
  const wallType = line('IFCWALLTYPE(' + str(G(9)) + ',' + oh + ",'Basic wall 200',$,$," + list([
    line('IFCPROPERTYSET(' + str(G(10)) + ',' + oh + ",'Pset_WallCommon',$," + list([line("IFCPROPERTYSINGLEVALUE('FireRating',$,IFCLABEL('EI60'),$)")]) + ')')]) + ',$,$,$,.STANDARD.)');
  const prop = (name, v) => line('IFCPROPERTYSINGLEVALUE(' + str(name) + ',$,' + v + ',$)');
  const pset = (gi, name, props) => line('IFCPROPERTYSET(' + str(G(gi)) + ',' + oh + ',' + str(name) + ',$,' + list(props) + ')');
  let gi = 100;   // GlobalIds for relations and property sets (elements have their own fixed numbers)
  const rels = [];
  const defines = (objs, def) => rels.push(line('IFCRELDEFINESBYPROPERTIES(' + str(G(gi++)) + ',' + oh + ',$,$,' + list(objs) + ',' + def + ')'));

  const walls = [];   // { id, name, storey, external, cost, zone }
  const wall = (no, name, storey, stPl, x, y, len, rx, ry, extra = {}) => {
    const pl = place(stPl, x, y, 0, rx, ry);
    const id = line('IFCWALL(' + str(extra.guid || G(no)) + ',' + oh + ',' + str(name) + ',$,$,' + pl + ',' + box(len / 2, 0, len, 200, 3000) + ",'" + name + "',.STANDARD.)");
    walls.push({ id, name, storey, len, pl, ...extra });
    return id;
  };
  // Level 1: a 10 × 6 m box (walls run along their own X axis)
  const w101 = wall(201, 'W-101', st1, st1Pl, 0, 0, 10000, 1, 0, { cost: 1250.5, zone: 'North' });
  wall(202, 'W-102', st1, st1Pl, 10000, 0, 6000, 0, 1, { cost: 980, zone: 'East' });
  wall(203, 'W-103', st1, st1Pl, 10000, 6000, 10000, -1, 0, { cost: 1250.5, zone: 'South' });
  if (rev !== 'b') wall(204, 'W-104', st1, st1Pl, 0, 6000, 6000, 0, -1, { cost: 980, zone: 'West' });
  // Level 2
  wall(211, 'W-201', st2, st2Pl, 0, 0, 10000, 1, 0, { cost: rev === 'b' ? 1400 : 1100, internal: true });
  wall(212, 'W-202', st2, st2Pl, 10000, 0, 6000, 0, 1, { cost: 900, internal: true });
  if (rev === 'b') wall(213, 'W-203', st2, st2Pl, 5000, 0, 6000, 0, 1, { cost: 700, internal: true });
  if (problems) {
    wall(221, 'W-102 copy', st1, st1Pl, 12000, 0, 3000, 0, 1, { cost: 10, guid: G(202) });         // duplicate GlobalId
    wall(222, 'W-103', st1, st1Pl, 10000, 6000, 10000, -1, 0, { cost: 1250.5, zone: 'South' });   // stacked on W-103
    wall(223, 'W-105 bare', st1, st1Pl, -3000, 0, 2000, 1, 0, { noData: true });                    // no Fixture_Data
  }

  // the opening in W-101 (relative to the wall) and the door in it (relative to the opening)
  const w101Pl = walls[0].pl;
  const opPl = place(w101Pl, 2000, 0, 0);
  const opening = line('IFCOPENINGELEMENT(' + str(G(301)) + ',' + oh + ",'Opening D-101',$,$," + opPl + ',' + box(500, 0, 1000, 400, 2100) + ',$,.OPENING.)');
  line('IFCRELVOIDSELEMENT(' + str(G(302)) + ',' + oh + ',$,$,' + w101 + ',' + opening + ')');
  const door = line('IFCDOOR(' + str(G(303)) + ',' + oh + ",'D-101',$,$," + place(opPl, 0, 0, 0) + ',' + box(500, 0, 1000, 60, 2100) + ",'D-101',2100.,1000.,.DOOR.,.SINGLE_SWING_LEFT.,$)");
  line('IFCRELFILLSELEMENT(' + str(G(304)) + ',' + oh + ',$,$,' + opening + ',' + door + ')');

  // the space and the desk in it
  const spPl = place(st1Pl, 0, 0, 0);
  const space = line('IFCSPACE(' + str(G(401)) + ',' + oh + ",'101','Office',$," + spPl + ',' + box(5000, 3000, 9600, 5600, 2900, 0) + ",'101 Office',.ELEMENT.,.SPACE.,$)");
  line('IFCRELAGGREGATES(' + str(G(402)) + ',' + oh + ',$,$,' + st1 + ',' + list([space]) + ')');
  const deskX = rev === 'b' ? 3500 : 3000;
  const desk = line('IFCFURNITURE(' + str(G(403)) + ',' + oh + ",'F-101','Desk',$," + place(spPl, deskX, 2000, 0) + ',' + box(800, 400, 1600, 800, 740) + ",'F-101',$)");
  line('IFCRELCONTAINEDINSPATIALSTRUCTURE(' + str(G(404)) + ',' + oh + ',$,$,' + list([desk]) + ',' + space + ')');

  // the stair: an aggregate of two flights (geometry on the flights only)
  const stPl = place(st1Pl, 8000, 1000, 0);
  const stair = line('IFCSTAIR(' + str(G(501)) + ',' + oh + ",'ST-1',$,$," + stPl + ",$,'ST-1',.STRAIGHT_RUN_STAIR.)");
  const f1 = line('IFCSTAIRFLIGHT(' + str(G(502)) + ',' + oh + ",'ST-1 flight 1',$,$," + place(stPl, 0, 0, 0) + ',' + box(500, 1000, 1000, 2000, 1500) + ",'ST-1-1',10,9,180.,270.,.STRAIGHT.)");
  const f2 = line('IFCSTAIRFLIGHT(' + str(G(503)) + ',' + oh + ",'ST-1 flight 2',$,$," + place(stPl, 0, 2000, 1500) + ',' + box(500, 1000, 1000, 2000, 1500) + ",'ST-1-2',10,9,180.,270.,.STRAIGHT.)");
  line('IFCRELAGGREGATES(' + str(G(504)) + ',' + oh + ',$,$,' + stair + ',' + list([f1, f2]) + ')');

  // Level 2 slab
  const slab = line('IFCSLAB(' + str(G(601)) + ',' + oh + ",'S-201',$,$," + place(st2Pl, 0, 0, -200) + ',' + box(5000, 3000, 10000, 6000, 200) + ",'S-201',.FLOOR.)");

  let proxy = null;
  if (problems) proxy = line('IFCBUILDINGELEMENTPROXY(' + str(G(701)) + ',' + oh + ",'Loose proxy',$,$," + place(null, 20000, 0, 0) + ',' + box(250, 250, 500, 500, 500) + ",'P-1',.NOTDEFINED.)");

  // containment (the desk is in the space; the flights belong to the stair; the proxy is in nothing)
  const l1 = walls.filter((w) => w.storey === st1).map((w) => w.id), l2 = walls.filter((w) => w.storey === st2).map((w) => w.id);
  line('IFCRELCONTAINEDINSPATIALSTRUCTURE(' + str(G(801)) + ',' + oh + ',$,$,' + list([...l1, door, stair]) + ',' + st1 + ')');
  line('IFCRELCONTAINEDINSPATIALSTRUCTURE(' + str(G(802)) + ',' + oh + ',$,$,' + list([...l2, slab]) + ',' + st2 + ')');

  // type, properties, quantities, materials
  line('IFCRELDEFINESBYTYPE(' + str(G(803)) + ',' + oh + ',$,$,' + list(walls.map((w) => w.id)) + ',' + wallType + ')');
  const ext = walls.filter((w) => !w.internal && !w.noData && w.zone);
  defines(ext.map((w) => w.id), pset(gi++, 'Pset_WallCommon', [prop('IsExternal', 'IFCBOOLEAN(.T.)'), prop('LoadBearing', 'IFCBOOLEAN(.T.)')]));
  for (const w of walls.filter((x) => x.internal)) defines([w.id], pset(gi++, 'Pset_WallCommon', [prop('IsExternal', 'IFCBOOLEAN(.F.)'), prop('LoadBearing', 'IFCBOOLEAN(.F.)')]));
  for (const w of walls) {
    if (w.noData) continue;
    const ps = [prop('Cost', 'IFCREAL(' + num(w.cost) + ')')];
    if (w.zone) ps.push(prop('Zone', 'IFCLABEL(' + str(w.zone) + ')'));
    defines([w.id], pset(gi++, 'Fixture_Data', ps));
    const q = [
      line("IFCQUANTITYLENGTH('Length',$,$," + num(w.len) + ',$)'),
      line("IFCQUANTITYAREA('NetSideArea',$,$," + num(w.len * 3000 / 1e6) + ',$)'),
      line("IFCQUANTITYVOLUME('NetVolume',$,$," + num(w.len * 3000 * 200 / 1e9) + ',$)')];
    defines([w.id], line('IFCELEMENTQUANTITY(' + str(G(gi++)) + ',' + oh + ",'Qto_WallBaseQuantities',$,$," + list(q) + ')'));
  }
  defines([space], pset(gi++, 'Pset_SpaceCommon', [prop('Reference', "IFCIDENTIFIER('101')"), prop('IsExternal', 'IFCBOOLEAN(.F.)')]));
  if (spaceQto) defines([space], line('IFCELEMENTQUANTITY(' + str(G(gi++)) + ',' + oh + ",'Qto_SpaceBaseQuantities',$,$," + list([   // 0.4 B10
    line("IFCQUANTITYAREA('NetFloorArea',$,$,52.5,$)"), line("IFCQUANTITYVOLUME('NetVolume',$,$,152.25,$)")]) + ')'));
  line('IFCRELASSOCIATESMATERIAL(' + str(G(gi++)) + ',' + oh + ',$,$,' + list([...walls.map((w) => w.id), slab]) + ',' + concrete + ')');
  line('IFCRELASSOCIATESMATERIAL(' + str(G(gi++)) + ',' + oh + ',$,$,' + list([desk]) + ',' + oak + ')');
  void rels; void proxy;

  const head = [
    'ISO-10303-21;', 'HEADER;',
    "FILE_DESCRIPTION(('ViewDefinition [DesignTransferView]'),'2;1');",
    "FILE_NAME('bimcraft-fixture" + (rev === 'b' ? '-b' : '') + (problems ? '-problems' : '') + ".ifc','2026-10-12T00:00:00',('CadCraft'),('CadCraft'),'BimCraft fixture writer','BimCraft fixture writer','');",
    "FILE_SCHEMA(('IFC4'));", 'ENDSEC;', 'DATA;'];
  return [...head, ...L, 'ENDSEC;', 'END-ISO-10303-21;', ''].join('\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const a = process.argv.slice(2);
  const out = a.find((x, i) => !x.startsWith('--') && a[i - 1] !== '--rev');
  const text = fixtureIfc({ rev: a.includes('--rev') ? a[a.indexOf('--rev') + 1] : 'a', problems: a.includes('--problems') });
  if (out) { fs.writeFileSync(out, text); console.log('wrote ' + out + ' (' + text.length + ' bytes)'); } else process.stdout.write(text);
}

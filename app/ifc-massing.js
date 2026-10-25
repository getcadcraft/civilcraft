/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-massing.js — the building masses as an IFC4 file (0.7 LC.1 M6; session massing). DOM-free, no library: ISO 10303-21 text
 * written by hand, the same way landscape/ifc-landscape.js does (and read by cc-ifc and BimCraft: the test round-trips it).
 *
 *   writeMassingIfc({ name, units, crs, lat, lon, origin, masses }, { seed, now }) → { text, counts, unit }
 *     units  the project's ('ft' | 'm'); crs the project's coordinate system (state.crs) or null; lat / lon degrees at `origin`
 *     origin { x, y, z } the file's zero in project coordinates (default: the masses' middle, z = the lowest ground floor)
 *     masses [{ id, name, use, pts: [{x, y}], floors, floorHeight, z0 (ground floor level), base, ground, parcel (name), zone? }]
 *   defaultOrigin(masses) → { x, y, z }
 *
 * The file is written IN THE PROJECT'S LENGTH UNIT — a US survey foot is an IfcConversionBasedUnit (factor 1200/3937 m), a metre
 * an SI unit — and IfcProjectedCRS.MapUnit is that same unit, so IfcMapConversion carries the origin's easting, northing and
 * height as they are in the project, with no scale. (BimCraft reads the nested measure of the foot since the 0.7 fix in
 * ifc-util.js unitMm.) Areas and volumes are SI, so a Pset area is in square metres whatever the length unit.
 *
 * Structure: IfcProject → IfcSite (RefLatitude / RefLongitude / RefElevation) → one IfcBuilding per mass → its IfcBuildingStoreys
 * (one per floor, Elevation = the floor's level in project heights) and ONE IfcBuildingElementProxy "Building mass": the
 * footprint extruded from the ground floor to the roof, in pset CadCraft_SiteMass (Use, Floors, FloorHeight, Height,
 * GroundFloorLevel, FootprintArea and GrossFloorArea in m², BaseOnSlope, Ground, Parcel, MassId). BimCraft's "Develop this mass"
 * turns that proxy into levels, walls and floors (model-site.js).
 * Without a coordinate system there is no IfcProjectedCRS / IfcMapConversion and no site latitude: the file says nothing it
 * does not know.
 */

import { guid } from './landscape/ifc-landscape.js';
export { guid };

export const FT_US_M = 1200 / 3937;   // metres in a US survey foot
const R = (v, d = 9) => { if (!Number.isFinite(v)) return '0.'; let s = (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d).replace(/(\.\d*?)0+$/, '$1'); if (!s.includes('.')) s += '.'; return s === '-0.' ? '0.' : s; };
const S = (str) => {
  let out = '';
  for (const ch of String(str ?? '')) {
    const c = ch.codePointAt(0);
    if (c === 39) out += "''";
    else if (c === 92) out += '\\\\';
    else if (c >= 32 && c < 127) out += ch;
    else { const u = []; for (let i = 0; i < ch.length; i++) u.push(ch.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0')); out += '\\X2\\' + u.join('') + '\\X0\\'; }
  }
  return "'" + out + "'";
};
const angle = (deg) => {   // IfcCompoundPlaneAngleMeasure: degrees, minutes, seconds, millionths of a second, all with the sign
  const sg = deg < 0 ? -1 : 1, a = Math.abs(deg), d = Math.floor(a), m = Math.floor((a - d) * 60), sc = ((a - d) * 60 - m) * 60, s = Math.floor(sc), u = Math.round((sc - s) * 1e6);
  return '(' + [sg * d, sg * m, sg * s, sg * u].join(',') + ')';
};
const signedArea = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p.x * q.y - q.x * p.y; } return a / 2; };

class Step {
  constructor() { this.lines = []; this.n = 0; }
  add(s) { this.n++; this.lines.push('#' + this.n + '=' + s + ';'); return '#' + this.n; }
  pt(p) { return this.add('IFCCARTESIANPOINT((' + p.map((v) => R(v)).join(',') + '))'); }
}

export function defaultOrigin(masses) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, z = Infinity;
  for (const m of masses) { for (const p of m.pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); } z = Math.min(z, m.z0); }
  return masses.length ? { x: Math.round((x0 + x1) / 20) * 10, y: Math.round((y0 + y1) / 20) * 10, z: Number.isFinite(z) ? z : 0 } : { x: 0, y: 0, z: 0 };
}

export function writeMassingIfc({ name = 'Site', units = 'ft', crs = null, lat = null, lon = null, origin = null, masses = [] } = {}, { seed = name, now = new Date() } = {}) {
  const o = origin || defaultOrigin(masses);
  const unit = crs?.unit === 'm' || (!crs && units === 'm') ? 'm' : crs?.unit === 'ft' ? 'ft' : 'ftUS';
  const um = unit === 'm' ? 1 : unit === 'ft' ? 0.3048 : FT_US_M, area = (a) => a * um * um;   // sq project units → m²
  const w = new Step(), id = (s) => S(guid(seed + '|' + s)), counts = { masses: 0, storeys: 0, psets: 0 };
  const WCS = w.add('IFCAXIS2PLACEMENT3D(' + w.pt([0, 0, 0]) + ',$,$)');
  const north = w.add('IFCDIRECTION((0.,1.))');
  const ctx = w.add("IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05," + WCS + ',' + north + ')');
  const body = w.add("IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*," + ctx + ',$,.MODEL_VIEW.,$)');
  const metre = w.add('IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.)');
  // i18n-ignore: IFC file data (the unit's name, the proxy's description), English like every IFC we write
  const length = unit === 'm' ? metre : w.add('IFCCONVERSIONBASEDUNIT(IFCDIMENSIONALEXPONENTS(1,0,0,0,0,0,0),.LENGTHUNIT.,' + S(unit === 'ft' ? 'foot' : 'US survey foot') + ',IFCMEASUREWITHUNIT(IFCLENGTHMEASURE(' + R(um, 16) + '),' + metre + '))');
  const ua = w.add('IFCUNITASSIGNMENT((' + [length, w.add('IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.)'), w.add('IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.)'), w.add('IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.)')].join(',') + '))');
  const project = w.add('IFCPROJECT(' + id('project') + ',$,' + S(name) + ',$,$,$,$,(' + ctx + '),' + ua + ')');
  if (crs) {
    const crsId = w.add('IFCPROJECTEDCRS(' + S(crs.code ? 'EPSG:' + crs.code : crs.name || 'CRS') + ',' + S(crs.name || '') + ',$,$,$,$,' + length + ')');
    w.add('IFCMAPCONVERSION(' + ctx + ',' + crsId + ',' + R(o.x) + ',' + R(o.y) + ',' + R(o.z) + ',1.,0.,$)');
  }
  const siteLP = w.add('IFCLOCALPLACEMENT($,' + WCS + ')');
  const hasLL = Number.isFinite(lat) && Number.isFinite(lon);
  const site = w.add('IFCSITE(' + id('site') + ',$,' + S(name) + ',$,$,' + siteLP + ',$,$,.ELEMENT.,' + (hasLL ? angle(lat) + ',' + angle(lon) : '$,$') + ',' + R(o.z) + ',$,$)');
  w.add('IFCRELAGGREGATES(' + id('rel-project') + ',$,$,$,' + project + ',(' + site + '))');
  const buildings = [];
  const prop = (k, v, kind) => w.add('IFCPROPERTYSINGLEVALUE(' + S(k) + ',$,' + kind + '(' + (kind === 'IFCLABEL' || kind === 'IFCTEXT' ? S(v) : kind === 'IFCINTEGER' ? Math.round(v) : R(v)) + '),$)');
  for (const m of masses) {
    const tag = m.id || String(counts.masses);
    const P = signedArea(m.pts) < 0 ? m.pts.slice().reverse() : m.pts, H = m.floors * m.floorHeight, fp = Math.abs(signedArea(m.pts));
    const bPlace = w.add('IFCLOCALPLACEMENT(' + siteLP + ',' + w.add('IFCAXIS2PLACEMENT3D(' + w.pt([0, 0, m.z0 - o.z]) + ',$,$)') + ')');
    const building = w.add('IFCBUILDING(' + id('building|' + tag) + ',$,' + S(m.name) + ',$,$,' + bPlace + ',$,$,.ELEMENT.,$,$,$)');
    buildings.push(building);
    const storeys = [];
    for (let k = 0; k < m.floors; k++) {
      const pl = w.add('IFCLOCALPLACEMENT(' + bPlace + ',' + w.add('IFCAXIS2PLACEMENT3D(' + w.pt([0, 0, k * m.floorHeight]) + ',$,$)') + ')');
      storeys.push(w.add('IFCBUILDINGSTOREY(' + id('storey|' + tag + '|' + k) + ',$,' + S('Level ' + (k + 1)) + ',$,$,' + pl + ',$,$,.ELEMENT.,' + R(m.z0 + k * m.floorHeight) + ')'));
      counts.storeys++;
    }
    const ring = P.map((p) => w.pt([p.x - o.x, p.y - o.y]));
    ring.push(ring[0]);
    const profile = w.add('IFCARBITRARYCLOSEDPROFILEDEF(.AREA.,$,' + w.add('IFCPOLYLINE((' + ring.join(',') + '))') + ')');
    const solid = w.add('IFCEXTRUDEDAREASOLID(' + profile + ',' + w.add('IFCAXIS2PLACEMENT3D(' + w.pt([0, 0, 0]) + ',$,$)') + ',' + w.add('IFCDIRECTION((0.,0.,1.))') + ',' + R(H) + ')');
    const shape = w.add('IFCPRODUCTDEFINITIONSHAPE($,$,(' + w.add('IFCSHAPEREPRESENTATION(' + body + ",'Body','SweptSolid',(" + solid + '))') + '))');
    const proxyPlace = w.add('IFCLOCALPLACEMENT(' + bPlace + ',' + w.add('IFCAXIS2PLACEMENT3D(' + w.pt([0, 0, 0]) + ',$,$)') + ')');
    // i18n-ignore: IFC file data
    const proxy = w.add('IFCBUILDINGELEMENTPROXY(' + id('mass|' + tag) + ',$,' + S(m.name) + ',' + S('Building mass') + ',$,' + proxyPlace + ',' + shape + ',$,.NOTDEFINED.)');
    const props = [prop('MassId', tag, 'IFCLABEL'), prop('Use', m.use || '', 'IFCLABEL'), prop('Floors', m.floors, 'IFCINTEGER'), prop('FloorHeight', m.floorHeight, 'IFCLENGTHMEASURE'),
      prop('Height', H, 'IFCLENGTHMEASURE'), prop('GroundFloorLevel', m.z0, 'IFCLENGTHMEASURE'), prop('FootprintArea', area(fp), 'IFCAREAMEASURE'),
      prop('GrossFloorArea', area(fp * m.floors), 'IFCAREAMEASURE'), prop('BaseOnSlope', m.base || '', 'IFCLABEL'), prop('Ground', m.ground || '', 'IFCLABEL'), prop('Parcel', m.parcel || '', 'IFCLABEL')];
    const set = w.add('IFCPROPERTYSET(' + id('pset|' + tag) + ',$,' + S('CadCraft_SiteMass') + ',$,(' + props.join(',') + '))');
    counts.psets++;
    w.add('IFCRELDEFINESBYPROPERTIES(' + id('rel-pset|' + tag) + ',$,$,$,(' + proxy + '),' + set + ')');
    w.add('IFCRELCONTAINEDINSPATIALSTRUCTURE(' + id('rel-contain|' + tag) + ',$,$,$,(' + proxy + '),' + building + ')');
    w.add('IFCRELAGGREGATES(' + id('rel-storeys|' + tag) + ',$,$,$,' + building + ',(' + storeys.join(',') + '))');
    counts.masses++;
  }
  if (buildings.length) w.add('IFCRELAGGREGATES(' + id('rel-site') + ',$,$,$,' + site + ',(' + buildings.join(',') + '))');
  const stamp = now.toISOString().slice(0, 19);
  const text = 'ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION((\'ViewDefinition [ReferenceView]\'),\'2;1\');\nFILE_NAME(' + S(name + '-masses.ifc') + ',\'' + stamp + '\',(\'\'),(\'\'),\'CivilCraft\',\'CivilCraft building masses\',\'\');\nFILE_SCHEMA((\'IFC4\'));\nENDSEC;\nDATA;\n' + w.lines.join('\n') + '\nENDSEC;\nEND-ISO-10303-21;\n';
  return { text, counts, unit };
}

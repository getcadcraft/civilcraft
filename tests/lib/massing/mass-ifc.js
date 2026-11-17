/* SPDX-License-Identifier: Apache-2.0 */
/**
 * mass-ifc.js: building masses as an IFC4 file, the ONE writer (lib/massing; moved here from CivilCraft's ifc-massing.js for
 * 0.10 BK.44 so ModelCraft's push/pull massing is handed over in the same shape; CivilCraft imports it and its output is byte
 * for byte what it was). Host-free: no DOM, no app import; ISO 10303-21 text written by hand. The host hands over its own
 * GlobalId maker (opts.guid(seed) -> 22 characters), so no second one lives here.
 *
 *   writeMassingIfc({ name, units, crs, lat, lon, origin, masses, shared }, { seed, now, guid, app, about, fileName }) -> { text, counts, unit }
 *     units  the project's ('ft' | 'm'); crs the project's coordinate system or null; lat / lon degrees at `origin`
 *     origin { x, y, z } the file's zero in project coordinates (default: the masses' middle, z = the lowest ground floor)
 *     masses [{ id, name, use, pts: [{x, y}], floors, floorHeight, z0 (ground floor level), base, ground, parcel (name),
 *               -- optional, written only when given (a file without them is unchanged) --
 *               height (the mass's own height when it is not floors x floorHeight), gross (gross floor area, square project
 *               units, when it is not footprint x floors), volume (cubic project units), floorAreas [square project units per
 *               floor, lowest first] (one IfcSpace per floor with that gross floor area), option { set, label, current },
 *               simplified (bool: the proxy's shape is the footprint extruded, the solid was something else), source }]
 *     shared { name, floors, floorHeight, z0 } | null   ONE IfcBuilding for every mass (options of one building: the storeys are
 *               the building's, `floors` of them); without it each mass is its own IfcBuilding with its own storeys (a site study)
 *   defaultOrigin(masses) -> { x, y, z }     fileUnit(units, crs) -> 'm' | 'ft' | 'ftUS'
 *
 * The file is written IN THE PROJECT'S LENGTH UNIT (a US survey foot is an IfcConversionBasedUnit, factor 1200/3937 m; a metre
 * an SI unit) and IfcProjectedCRS.MapUnit is that same unit. Areas and volumes are SI, so a Pset area is in square metres
 * whatever the length unit.
 *
 * Structure: IfcProject -> IfcSite -> IfcBuilding(s) -> IfcBuildingStoreys (one per floor) and per mass ONE
 * IfcBuildingElementProxy "Building mass": the footprint extruded from the ground floor to the roof, with pset CadCraft_SiteMass
 * (MassId, Use, Floors, FloorHeight, Height, GroundFloorLevel, FootprintArea and GrossFloorArea in m2, BaseOnSlope, Ground,
 * Parcel; then, when given: Volume m3, FloorAreas "a;b;c" m2, OptionSet, Option, Current, Simplified, Source).
 * With floorAreas each floor is also an IfcSpace (ObjectType "MassingFloor", no shape) under its storey: Qto_SpaceBaseQuantities
 * (GrossFloorArea, Height) and pset CadCraft_MassFloor (Mass = the MassId, Floor = 1...). BimCraft reads the proxy as a mass
 * (model-site-mass.js readMasses), as an option (mass-options.js readOptionSets), and "Develop" turns it into walls and floors.
 * Without a coordinate system there is no IfcProjectedCRS / IfcMapConversion and no site latitude.
 */

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

/** The file's length unit for a project (0.7.1 71.24: shared with ifc-civil.js): the coordinate system's unit when there is one
 *  ('m' | 'ft' international foot), else the project's (a feet project = the US survey foot). → 'm' | 'ft' | 'ftUS' */
export function fileUnit(units, crs) { return crs?.unit === 'm' || (!crs && units === 'm') ? 'm' : crs?.unit === 'ft' ? 'ft' : 'ftUS'; }

export function writeMassingIfc({ name = 'Site', units = 'ft', crs = null, lat = null, lon = null, origin = null, masses = [], shared = null } = {}, { seed = name, now = new Date(), guid, app = 'CivilCraft', about = 'CivilCraft building masses', fileName = name + '-masses.ifc' } = {}) {
  if (typeof guid !== 'function') throw new Error('writeMassingIfc: the host gives its GlobalId maker (opts.guid)');   // i18n-ignore: a programming error, never shown to a person
  const o = origin || defaultOrigin(masses);
  const unit = fileUnit(units, crs);
  const um = unit === 'm' ? 1 : unit === 'ft' ? 0.3048 : FT_US_M, area = (a) => a * um * um;   // sq project units → m²
  const w = new Step(), id = (s) => S(guid(seed + '|' + s)), counts = { masses: 0, storeys: 0, psets: 0, spaces: 0 };
  const vol = (v) => v * um * um * um;   // cubic project units -> m3
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
  let SH = null;   // the building in hand: each mass's own, or the shared one
  for (const m of masses) {
    const tag = m.id || String(counts.masses);
    const P = signedArea(m.pts) < 0 ? m.pts.slice().reverse() : m.pts, H = m.height > 0 ? m.height : m.floors * m.floorHeight, fp = Math.abs(signedArea(m.pts));
    const own = !shared;
    if (own || !SH) {
      const z0b = own ? m.z0 : shared.z0, nFloors = own ? m.floors : Math.max(1, Math.round(shared.floors)), fhB = own ? m.floorHeight : shared.floorHeight;
      const bPlace = w.add('IFCLOCALPLACEMENT(' + siteLP + ',' + w.add('IFCAXIS2PLACEMENT3D(' + w.pt([0, 0, z0b - o.z]) + ',$,$)') + ')');
      const building = w.add('IFCBUILDING(' + id('building|' + (own ? tag : 'shared')) + ',$,' + S(own ? m.name : shared.name || name) + ',$,$,' + bPlace + ',$,$,.ELEMENT.,$,$,$)');
      buildings.push(building);
      const storeys = [];
      for (let k = 0; k < nFloors; k++) {
        const pl = w.add('IFCLOCALPLACEMENT(' + bPlace + ',' + w.add('IFCAXIS2PLACEMENT3D(' + w.pt([0, 0, k * fhB]) + ',$,$)') + ')');
        storeys.push(w.add('IFCBUILDINGSTOREY(' + id('storey|' + (own ? tag : 'shared') + '|' + k) + ',$,' + S('Level ' + (k + 1)) + ',$,$,' + pl + ',$,$,.ELEMENT.,' + R(z0b + k * fhB) + ')'));
        counts.storeys++;
      }
      SH = { bPlace, building, storeys, z0: z0b, fresh: true };
    }
    const { bPlace, building, storeys } = SH;
    const ring = P.map((p) => w.pt([p.x - o.x, p.y - o.y]));
    ring.push(ring[0]);
    const profile = w.add('IFCARBITRARYCLOSEDPROFILEDEF(.AREA.,$,' + w.add('IFCPOLYLINE((' + ring.join(',') + '))') + ')');
    const solid = w.add('IFCEXTRUDEDAREASOLID(' + profile + ',' + w.add('IFCAXIS2PLACEMENT3D(' + w.pt([0, 0, 0]) + ',$,$)') + ',' + w.add('IFCDIRECTION((0.,0.,1.))') + ',' + R(H) + ')');
    const shape = w.add('IFCPRODUCTDEFINITIONSHAPE($,$,(' + w.add('IFCSHAPEREPRESENTATION(' + body + ",'Body','SweptSolid',(" + solid + '))') + '))');
    const proxyPlace = w.add('IFCLOCALPLACEMENT(' + bPlace + ',' + w.add('IFCAXIS2PLACEMENT3D(' + w.pt([0, 0, m.z0 - SH.z0]) + ',$,$)') + ')');
    // i18n-ignore: IFC file data
    const proxy = w.add('IFCBUILDINGELEMENTPROXY(' + id('mass|' + tag) + ',$,' + S(m.name) + ',' + S('Building mass') + ',$,' + proxyPlace + ',' + shape + ',$,.NOTDEFINED.)');
    const props = [prop('MassId', tag, 'IFCLABEL'), prop('Use', m.use || '', 'IFCLABEL'), prop('Floors', m.floors, 'IFCINTEGER'), prop('FloorHeight', m.floorHeight, 'IFCLENGTHMEASURE'),
      prop('Height', H, 'IFCLENGTHMEASURE'), prop('GroundFloorLevel', m.z0, 'IFCLENGTHMEASURE'), prop('FootprintArea', area(fp), 'IFCAREAMEASURE'),
      prop('GrossFloorArea', area(m.gross > 0 ? m.gross : fp * m.floors), 'IFCAREAMEASURE'), prop('BaseOnSlope', m.base || '', 'IFCLABEL'), prop('Ground', m.ground || '', 'IFCLABEL'), prop('Parcel', m.parcel || '', 'IFCLABEL')];
    // the optional extras (0.10 BK.44): a mass without them writes exactly the lines it always did
    if (m.volume > 0) props.push(prop('Volume', vol(m.volume), 'IFCVOLUMEMEASURE'));
    const floorAreas = Array.isArray(m.floorAreas) ? m.floorAreas.slice(0, m.floors).map((a) => (a > 0 ? a : 0)) : null;
    if (floorAreas) props.push(prop('FloorAreas', floorAreas.map((a) => R(area(a), 4).replace(/\.$/, '')).join(';'), 'IFCTEXT'));
    if (m.option) {
      props.push(prop('OptionSet', m.option.set || '', 'IFCLABEL'), prop('Option', m.option.label || '', 'IFCLABEL'));
      props.push(w.add('IFCPROPERTYSINGLEVALUE(' + S('Current') + ',$,IFCBOOLEAN(' + (m.option.current ? '.T.' : '.F.') + '),$)'));
    }
    if (m.simplified) props.push(w.add('IFCPROPERTYSINGLEVALUE(' + S('Simplified') + ',$,IFCBOOLEAN(.T.),$)'));
    if (m.source) props.push(prop('Source', m.source, 'IFCLABEL'));
    const set = w.add('IFCPROPERTYSET(' + id('pset|' + tag) + ',$,' + S('CadCraft_SiteMass') + ',$,(' + props.join(',') + '))');
    counts.psets++;
    w.add('IFCRELDEFINESBYPROPERTIES(' + id('rel-pset|' + tag) + ',$,$,$,(' + proxy + '),' + set + ')');
    w.add('IFCRELCONTAINEDINSPATIALSTRUCTURE(' + id('rel-contain|' + tag) + ',$,$,$,(' + proxy + '),' + building + ')');
    if (SH.fresh) { w.add('IFCRELAGGREGATES(' + id('rel-storeys|' + (own ? tag : 'shared')) + ',$,$,$,' + building + ',(' + storeys.join(',') + '))'); SH.fresh = false; }
    if (floorAreas) {
      const fh = H / m.floors;
      floorAreas.forEach((a, k) => {
        const st = storeys[Math.min(k, storeys.length - 1)];
        // i18n-ignore: IFC file data
        const sp = w.add('IFCSPACE(' + id('floor|' + tag + '|' + k) + ',$,' + S(m.name + ' floor ' + (k + 1)) + ',$,' + S('MassingFloor') + ',$,$,' + S(m.name) + ',.ELEMENT.,.SPACE.,$)');
        const q = w.add('IFCELEMENTQUANTITY(' + id('floor-qto|' + tag + '|' + k) + ',$,' + S('Qto_SpaceBaseQuantities') + ',$,$,(' + w.add('IFCQUANTITYAREA(' + S('GrossFloorArea') + ',$,$,' + R(area(a), 6) + ',$)') + ',' + w.add('IFCQUANTITYLENGTH(' + S('Height') + ',$,$,' + R(fh) + ',$)') + '))');
        w.add('IFCRELDEFINESBYPROPERTIES(' + id('floor-rel-qto|' + tag + '|' + k) + ',$,$,$,(' + sp + '),' + q + ')');
        const ps = w.add('IFCPROPERTYSET(' + id('floor-pset|' + tag + '|' + k) + ',$,' + S('CadCraft_MassFloor') + ',$,(' + prop('Mass', tag, 'IFCLABEL') + ',' + prop('Floor', k + 1, 'IFCINTEGER') + '))');
        w.add('IFCRELDEFINESBYPROPERTIES(' + id('floor-rel-pset|' + tag + '|' + k) + ',$,$,$,(' + sp + '),' + ps + ')');
        w.add('IFCRELAGGREGATES(' + id('floor-agg|' + tag + '|' + k) + ',$,$,$,' + st + ',(' + sp + '))');
        counts.spaces++;
      });
    }
    counts.masses++;
    if (own) SH = null;
  }
  if (buildings.length) w.add('IFCRELAGGREGATES(' + id('rel-site') + ',$,$,$,' + site + ',(' + buildings.join(',') + '))');
  const stamp = now.toISOString().slice(0, 19);
  const text = 'ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION((\'ViewDefinition [ReferenceView]\'),\'2;1\');\nFILE_NAME(' + S(fileName) + ',\'' + stamp + '\',(\'\'),(\'\'),' + S(app) + ',' + S(about) + ',\'\');\nFILE_SCHEMA((\'IFC4\'));\nENDSEC;\nDATA;\n' + w.lines.join('\n') + '\nENDSEC;\nEND-ISO-10303-21;\n';
  return { text, counts, unit };
}

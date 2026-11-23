/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifcout.js — a dome as an IFC4 file (0.11 DOME.1 / DOME.2), written straight from the element list of build.js. Host-free, so every host
 * (and a script) can save the same file. Written from ISO 10303-21 and buildingSMART's published IFC4 schema.
 *
 * What is in the file: IfcProject › IfcSite › IfcBuilding › IfcBuildingStorey; one element per item of the list in its own class (IfcFooting,
 * IfcSlab, IfcWall, IfcRoof with the type DOME_ROOF, IfcCovering for the foam and the membrane), each a set of IfcRevolvedAreaSolid (the true
 * surface of revolution of a many-sided profile, not a faceted mesh) with a colour, a `CadCraft_Dome` property set, base quantities and a
 * material; one IfcGroup for the whole dome; the design figures and the first membrane forces on the building as `CadCraft_DomeDesign`.
 * Lengths in millimetres, areas m², volumes m³, angles in radians. GlobalIds come from the dome's name and the element's key, so the same
 * dome writes the same file (pass `date` to fix the timestamp).
 * Not written: reinforcement, doors and windows in the openings (the openings are real gaps in the solids), type objects, classification.
 */
import { polyArea2 } from './geometry.js';

const B64 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
function hash32(s, seed) { let h = seed >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995) >>> 0; } return (h ^ (h >>> 15)) >>> 0; }
/** A stable 22-character IFC GlobalId from a text key. */
export function guidFor(key) {
  let n = 0n;
  for (const seed of [0x811c9dc5, 0x01000193, 0x9e3779b9, 0x85ebca6b]) n = (n << 32n) | BigInt(hash32(String(key), seed));
  let out = '';
  for (let i = 0; i < 22; i++) out += B64[Number((n >> BigInt(6 * (21 - i))) & 63n)];
  return out;
}
const S = (v) => (v === null || v === undefined || v === '' ? '$' : "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/[^\x20-\x7e]/g, (c) => '\\X2\\' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0') + '\\X0\\') + "'");
const R = (n) => { let s = String(Number(Number(n).toFixed(6))); if (s === '-0') s = '0'; if (/e/i.test(s)) { let [m, e] = s.split(/e/i); if (!m.includes('.')) m += '.'; return m + 'E' + e; } return s.includes('.') ? s : s + '.'; };
const EN = (v) => '.' + String(v).toUpperCase() + '.';
const rgb = (hex) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(hex)); const n = m ? parseInt(m[1], 16) : 0xb8b8b0; return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };

/** An element's property rows as [name, 'IFCREAL' | 'IFCLABEL', value] (the BimCraft host writes the same rows). */
export function psetRows(e) {
  const rows = [['Key', 'IFCLABEL', e.key], ['Group', 'IFCLABEL', e.group], ['Material', 'IFCLABEL', e.material]];
  for (const [k, v] of Object.entries(e.props || {})) {
    if (typeof v === 'number' && Number.isFinite(v)) rows.push([k, 'IFCREAL', Number(v.toFixed(6))]);
    else if (typeof v === 'string' && v) rows.push([k, 'IFCLABEL', v]);
  }
  return rows;
}
/** An element's quantities as [name, 'volume' | 'area', value in mm³ / mm²]. */
export function qtyRows(e) {
  const rows = [];
  if (e.qty.volume > 0) rows.push(['NetVolume', 'volume', e.qty.volume]);
  if (e.qty.area > 0) rows.push(['NetArea', 'area', e.qty.area]);
  return rows;
}
/** The words a material is called in the file. */
export const materialName = (e, d) => (e.material === 'concrete' ? 'Concrete ' + d.concreteMPa + ' MPa' : e.material === 'foam' ? 'Sprayed foam insulation' : e.material === 'membrane' ? 'Form membrane' : '');
/** The frame a piece's profile is drawn in: its X is the radial direction at the angle a0, its Y is up, so turning about its Y by a positive angle goes counter-clockwise seen from above. */
export const pieceFrame = (pc) => ({ origin: [0, 0, 0], x: [Math.cos(pc.a0), Math.sin(pc.a0), 0], z: [Math.sin(pc.a0), -Math.cos(pc.a0), 0] });

/**
 * → the IFC file as text. result = what index.js design() returns; opts { name (the dome's), date (a Date), designRows: [[name, type, value]] }.
 */
export function toIfc(result, opts = {}) {
  const d = result.design, els = result.built.elements;
  const name = String(opts.name || d.name || 'Dome').slice(0, 80);
  const date = opts.date instanceof Date ? opts.date : new Date();
  const lines = [];
  const E = (type, ...args) => { lines.push('#' + (lines.length + 1) + '=' + type + '(' + args.join(',') + ');'); return '#' + lines.length; };
  const L = (list) => '(' + list.join(',') + ')';
  const G = (key) => S(guidFor(name + '|' + key));
  const P3 = (p) => E('IFCCARTESIANPOINT', L(p.map(R))), D3 = (v) => E('IFCDIRECTION', L(v.map(R)));
  const org = E('IFCORGANIZATION', '$', S('CadCraft'), '$', '$', '$');
  const person = E('IFCPERSON', '$', '$', S(''), '$', '$', '$', '$', '$');
  const pao = E('IFCPERSONANDORGANIZATION', person, org, '$');
  const app = E('IFCAPPLICATION', org, S('0.11'), S('CadCraft dome generator'), S('cadcraft-dome'));
  const oh = E('IFCOWNERHISTORY', pao, app, '$', '.ADDED.', '$', '$', '$', String(Math.floor(date.getTime() / 1000)));
  const units = E('IFCUNITASSIGNMENT', L([E('IFCSIUNIT', '*', '.LENGTHUNIT.', '.MILLI.', '.METRE.'), E('IFCSIUNIT', '*', '.AREAUNIT.', '$', '.SQUARE_METRE.'), E('IFCSIUNIT', '*', '.VOLUMEUNIT.', '$', '.CUBIC_METRE.'), E('IFCSIUNIT', '*', '.PLANEANGLEUNIT.', '$', '.RADIAN.')]));
  const o = P3([0, 0, 0]), ax = E('IFCAXIS2PLACEMENT3D', o, '$', '$');
  const ctx = E('IFCGEOMETRICREPRESENTATIONCONTEXT', '$', S('Model'), '3', '1.E-5', ax, '$');
  const body = E('IFCGEOMETRICREPRESENTATIONSUBCONTEXT', S('Body'), S('Model'), '*', '*', '*', '*', ctx, '$', '.MODEL_VIEW.', '$');
  const project = E('IFCPROJECT', G('project'), oh, S(name), '$', '$', '$', '$', L([ctx]), units);
  const lpSite = E('IFCLOCALPLACEMENT', '$', ax), lpB = E('IFCLOCALPLACEMENT', lpSite, ax), lpS = E('IFCLOCALPLACEMENT', lpB, ax);
  const site = E('IFCSITE', G('site'), oh, S('Site'), '$', '$', lpSite, '$', '$', '.ELEMENT.', '$', '$', '$', '$', '$');
  const building = E('IFCBUILDING', G('building'), oh, S(name), '$', '$', lpB, '$', '$', '.ELEMENT.', '$', '$', '$');
  const storey = E('IFCBUILDINGSTOREY', G('storey'), oh, S('Floor'), '$', '$', lpS, '$', '$', '.ELEMENT.', '0.');
  E('IFCRELAGGREGATES', G('agg-project'), oh, '$', '$', project, L([site]));
  E('IFCRELAGGREGATES', G('agg-site'), oh, '$', '$', site, L([building]));
  E('IFCRELAGGREGATES', G('agg-building'), oh, '$', '$', building, L([storey]));
  // every profile is turned about its own frame's Y axis (the dome's axis)
  const axis = E('IFCAXIS1PLACEMENT', E('IFCCARTESIANPOINT', L([R(0), R(0), R(0)])), D3([0, 1, 0]));
  const styles = new Map(), mats = new Map(), contained = [], all = [];
  const styleFor = (hex, alpha) => {
    const k = hex + '|' + alpha;
    if (!styles.has(k)) styles.set(k, E('IFCSURFACESTYLE', S('Dome ' + hex + (alpha < 1 ? ' ' + alpha : '')), '.BOTH.', L([E('IFCSURFACESTYLESHADING', E('IFCCOLOURRGB', '$', ...rgb(hex).map(R)), R(1 - alpha))])));
    return styles.get(k);
  };
  const pset = (target, key, setName, rows) => {
    if (!rows.length) return;
    const props = rows.map(([n, type, v]) => E('IFCPROPERTYSINGLEVALUE', S(n), '$', type + '(' + (type === 'IFCLABEL' || type === 'IFCTEXT' ? S(v) : type === 'IFCINTEGER' ? String(Math.round(v)) : R(v)) + ')', '$'));
    E('IFCRELDEFINESBYPROPERTIES', G(key + '-rel-' + setName), oh, '$', '$', L([target]), E('IFCPROPERTYSET', G(key + '-' + setName), oh, S(setName), '$', L(props)));
  };
  for (const e of els) {
    const items = [];
    for (const pc of e.pieces) {
      if (!(pc.a1 > pc.a0) || !(Math.abs(polyArea2(pc.profile)) > 0)) continue;
      const pts = pc.profile.map(([a, b]) => E('IFCCARTESIANPOINT', L([R(a), R(b)])));
      const prof = E('IFCARBITRARYCLOSEDPROFILEDEF', '.AREA.', '$', E('IFCPOLYLINE', L([...pts, pts[0]])));
      const f = pieceFrame(pc);
      const item = E('IFCREVOLVEDAREASOLID', prof, E('IFCAXIS2PLACEMENT3D', P3(f.origin), D3(f.z), D3(f.x)), axis, R(pc.a1 - pc.a0));
      E('IFCSTYLEDITEM', item, L([styleFor(e.color, e.alpha ?? 1)]), '$');
      items.push(item);
    }
    if (!items.length) continue;
    const shape = E('IFCPRODUCTDEFINITIONSHAPE', '$', '$', L([E('IFCSHAPEREPRESENTATION', body, S('Body'), S('SweptSolid'), L(items))]));
    const lp = E('IFCLOCALPLACEMENT', lpS, ax);
    const pre = e.predefined ? EN(e.predefined) : e.objectType ? '.USERDEFINED.' : '.NOTDEFINED.';
    const id = E(e.ifc, G(e.key), oh, S(e.name), '$', S(e.objectType), lp, shape, S(e.key), pre);
    contained.push(id); all.push(id);
    pset(id, e.key, 'CadCraft_Dome', psetRows(e));
    const q = qtyRows(e).map(([n, kind, v]) => (kind === 'volume' ? E('IFCQUANTITYVOLUME', S(n), '$', '$', R(v / 1e9), '$') : E('IFCQUANTITYAREA', S(n), '$', '$', R(v / 1e6), '$')));
    if (q.length) E('IFCRELDEFINESBYPROPERTIES', G(e.key + '-rel-qto'), oh, '$', '$', L([id]), E('IFCELEMENTQUANTITY', G(e.key + '-qto'), oh, S('Qto_CadCraftDomeBaseQuantities'), '$', '$', L(q)));
    const mn = materialName(e, d);
    if (mn) { if (!mats.has(mn)) mats.set(mn, []); mats.get(mn).push(id); }
  }
  if (contained.length) E('IFCRELCONTAINEDINSPATIALSTRUCTURE', G('contained'), oh, '$', '$', L(contained), storey);
  for (const [mn, ids] of mats) E('IFCRELASSOCIATESMATERIAL', G('mat-' + mn), oh, '$', '$', L(ids), E('IFCMATERIAL', S(mn), '$', '$'));
  if (all.length) E('IFCRELASSIGNSTOGROUP', G('group-rel'), oh, '$', '$', L(all), '$', E('IFCGROUP', G('group'), oh, S(name), '$', S('DOME')));
  pset(building, 'building', 'CadCraft_DomeDesign', opts.designRows || designRows(result));
  const stamp = date.toISOString().slice(0, 19);
  return ['ISO-10303-21;', 'HEADER;', "FILE_DESCRIPTION(('ViewDefinition [ReferenceView_V1.2]'),'2;1');",
    'FILE_NAME(' + S(name + '.ifc') + ",'" + stamp + "',(''),('CadCraft'),'CadCraft lib/dome','CadCraft dome generator','');", "FILE_SCHEMA(('IFC4'));", 'ENDSEC;', 'DATA;',
    ...lines, 'ENDSEC;', 'END-ISO-10303-21;', ''].join('\n');
}

/** The design figures written on the building. */
export function designRows(result) {
  const d = result.design, b = result.basis, M = result.built.metrics, F = result.forces, c = F.cases.snow || F.cases.dead;
  const B = result.bending && (result.bending.cases.snow || result.bending.cases.dead);
  const rows = [
    ['Shape', 'IFCLABEL', d.shape], ['FormDiameterMm', 'IFCREAL', d.diameter], ['FormHeightMm', 'IFCREAL', d.height], ['StemWallMm', 'IFCREAL', d.stem],
    ['ShellCrownMm', 'IFCREAL', d.shell], ['ShellBaseMm', 'IFCREAL', d.shell + d.thicken], ['FoamMm', 'IFCREAL', d.foam],
    ['ConcreteMPa', 'IFCREAL', d.concreteMPa], ['CoverMm', 'IFCREAL', d.cover], ['CoverEarthMm', 'IFCREAL', d.coverEarth], ['RebarRatio', 'IFCREAL', d.rebarRatio],
    ['FormAreaM2', 'IFCREAL', M.formArea / 1e6], ['FloorAreaM2', 'IFCREAL', M.floorArea / 1e6], ['InsideVolumeM3', 'IFCREAL', M.insideVolume / 1e9], ['ClearHeightMm', 'IFCREAL', M.clearHeight],
    ['Openings', 'IFCREAL', result.built.layout.kept.length],
    ['LoadCase', 'IFCLABEL', (F.cases.snow ? c.label.dead + ' x own weight + ' + c.label.snow + ' x snow ' + d.snow + ' kPa' : c.label.dead + ' x own weight') + (F.unfactored ? ', unfactored' : ', factored')],
    ['MembraneMaxCompressionMPa', 'IFCREAL', c.maxCompression.stress], ['MembraneRingTensionKN', 'IFCREAL', c.base.ringTension], ['MembraneHoopTensionKNm', 'IFCREAL', c.maxHoopTension ? c.maxHoopTension.n : 0],
    ...(B ? [['BaseCondition', 'IFCLABEL', result.bending.base], ['BendingBaseMomentKNmPerM', 'IFCREAL', B.baseMoment], ['BendingMaxMomentKNmPerM', 'IFCREAL', B.maxMoment.m], ['BendingRingBeamTensionKN', 'IFCREAL', B.ringTension], ['BendingMaxTensionMPa', 'IFCREAL', B.maxTension ? B.maxTension.stress : 0], ['BendingCrownDropMm', 'IFCREAL', B.crownDrop]] : []),
    ...(F.buckling ? [['BucklingClassicalRatio', 'IFCREAL', F.buckling.ratio]] : []),
    ...(F.cases.wind ? [['WindBaseShearKN', 'IFCREAL', F.cases.wind.baseShear], ['WindFloorForceMaxKNm', 'IFCREAL', F.cases.wind.floor.withDead.max]] : []),
    ...(F.cases.seismic ? [['SeismicBaseShearKN', 'IFCREAL', F.cases.seismic.baseShear], ['SeismicFloorForceMaxKNm', 'IFCREAL', F.cases.seismic.floor.withDead.max]] : []),
    ['Spec', 'IFCLABEL', result.spec ? result.spec.name : 'none'],
    ['FiguresFromSpec', 'IFCLABEL', Object.entries(b).filter(([, x]) => x.from === 'spec').map(([k]) => k).join(' ') || 'none'],
    ['FiguresNotFromAStandard', 'IFCLABEL', Object.entries(b).filter(([, x]) => x.from === 'start').map(([k]) => k).join(' ') || 'none'],
    ['Notice', 'IFCLABEL', 'A drawing and take-off aid. Not a structural design: the forces are linear elastic theory for an uncracked shell with simple load patterns. A licensed engineer must design and check the dome.'],
  ];
  return rows.map(([n, t, v]) => [n, t, typeof v === 'number' ? Number(v.toFixed(6)) : v]);
}

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifcout.js — a pool as an IFC4 file (0.11 POOL.1 / POOL.3), written straight from the element list of build.js. Host-free, so every host
 * (and a script) can save the same file. Written from ISO 10303-21 and buildingSMART's published IFC4 schema.
 *
 * What is in the file: IfcProject › IfcSite › IfcBuilding › IfcBuildingStorey; one element per item of the list in its own class (IfcSlab,
 * IfcWall, IfcStairFlight, IfcCovering, IfcRailing, IfcFilter, IfcPump, IfcTank, IfcPipeSegment, IfcWasteTerminal, IfcSpace, proxies for the
 * water, skimmers, inlets and jets), each a swept solid with a colour, a `CadCraft_Pool` property set, base quantities and a material; one
 * IfcGroup for the whole pool; the design figures on the building as `CadCraft_PoolDesign`. Lengths in millimetres, areas m², volumes m³.
 * GlobalIds come from the pool's name and the element's key, so the same pool writes the same file (pass `date` to fix the timestamp).
 * POOL.8: a piece that is a slab (a floor that falls, walls on it, any outline) is an IfcFacetedBrep; every pipe segment, fitting, terminal, pump
 * and filter carries its IfcDistributionPorts (IfcRelNests) and every pair that meets is an IfcRelConnectsPorts (network.js); the gate is an
 * IfcDoor of type GATE; with rebarMode 'bars' each bar mark is an IfcReinforcingBar.
 * Not written: type objects, classification, distribution systems.
 */
import { polyArea } from './build.js';

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
const INT_PROPS = new Set(['Risers', 'Treads', 'Bends', 'Side', 'Sides', 'Ports', 'Run', 'Count']);

/** An element's property rows as [name, 'IFCREAL' | 'IFCINTEGER' | 'IFCLABEL', value] (the BimCraft host writes the same rows). */
export function psetRows(e) {
  const rows = [['Key', 'IFCLABEL', e.key], ['Group', 'IFCLABEL', e.group], ['Material', 'IFCLABEL', e.material]];
  for (const [k, v] of Object.entries(e.props || {})) {
    if (typeof v === 'number' && Number.isFinite(v)) rows.push([k, INT_PROPS.has(k) ? 'IFCINTEGER' : 'IFCREAL', INT_PROPS.has(k) ? Math.round(v) : Number(v.toFixed(6))]);
    else if (typeof v === 'string' && v) rows.push([k, 'IFCLABEL', v]);
  }
  return rows;
}
/** An element's quantities as [name, 'volume' | 'area' | 'length', value in mm³ / mm² / mm]. */
export function qtyRows(e) {
  const rows = [];
  if (e.qty.volume > 0 && e.ifc !== 'IFCSPACE') rows.push(['NetVolume', 'volume', e.qty.volume]);
  if (e.qty.area > 0) rows.push(['NetArea', 'area', e.qty.area]);
  if (e.qty.length > 0) rows.push(['Length', 'length', e.qty.length]);
  return rows;
}
/** The words a material is called in the file. */
export const materialName = (e, d) => (e.material === 'concrete' ? 'Concrete ' + d.concreteMPa + ' MPa' : e.material === 'tile' ? 'Ceramic tile' : e.material === 'stone' ? 'Paving' : e.material === 'water' ? 'Water' : e.material === 'steel' ? 'Steel' : e.material === 'rebar' ? 'Reinforcing steel' : e.material === 'plastic' ? 'Plastic' : e.material === 'equipment' ? 'Equipment' : '');

/**
 * → the IFC file as text. result = what index.js design() returns; opts { name (the pool's), date (a Date), designRows: [[name, type, value]] }.
 */
export function toIfc(result, opts = {}) {
  const d = result.design, els = result.built.elements;
  const name = String(opts.name || d.name || 'Pool').slice(0, 80);
  const date = opts.date instanceof Date ? opts.date : new Date();
  const lines = [];
  const E = (type, ...args) => { lines.push('#' + (lines.length + 1) + '=' + type + '(' + args.join(',') + ');'); return '#' + lines.length; };
  const L = (list) => '(' + list.join(',') + ')';
  const G = (key) => S(guidFor(name + '|' + key));
  const P3 = (p) => E('IFCCARTESIANPOINT', L(p.map(R))), D3 = (v) => E('IFCDIRECTION', L(v.map(R)));
  const org = E('IFCORGANIZATION', '$', S('CadCraft'), '$', '$', '$');
  const person = E('IFCPERSON', '$', '$', S(''), '$', '$', '$', '$', '$');
  const pao = E('IFCPERSONANDORGANIZATION', person, org, '$');
  const app = E('IFCAPPLICATION', org, S('0.11'), S('CadCraft pool generator'), S('cadcraft-pool'));
  const oh = E('IFCOWNERHISTORY', pao, app, '$', '.ADDED.', '$', '$', '$', String(Math.floor(date.getTime() / 1000)));
  const units = E('IFCUNITASSIGNMENT', L([E('IFCSIUNIT', '*', '.LENGTHUNIT.', '.MILLI.', '.METRE.'), E('IFCSIUNIT', '*', '.AREAUNIT.', '$', '.SQUARE_METRE.'), E('IFCSIUNIT', '*', '.VOLUMEUNIT.', '$', '.CUBIC_METRE.'), E('IFCSIUNIT', '*', '.PLANEANGLEUNIT.', '$', '.RADIAN.')]));
  const o = P3([0, 0, 0]), ax = E('IFCAXIS2PLACEMENT3D', o, '$', '$');
  const ctx = E('IFCGEOMETRICREPRESENTATIONCONTEXT', '$', S('Model'), '3', '1.E-5', ax, '$');
  const body = E('IFCGEOMETRICREPRESENTATIONSUBCONTEXT', S('Body'), S('Model'), '*', '*', '*', '*', ctx, '$', '.MODEL_VIEW.', '$');
  const project = E('IFCPROJECT', G('project'), oh, S(name), '$', '$', '$', '$', L([ctx]), units);
  const lpSite = E('IFCLOCALPLACEMENT', '$', ax), lpB = E('IFCLOCALPLACEMENT', lpSite, ax), lpS = E('IFCLOCALPLACEMENT', lpB, ax);
  const site = E('IFCSITE', G('site'), oh, S('Site'), '$', '$', lpSite, '$', '$', '.ELEMENT.', '$', '$', '$', '$', '$');
  const building = E('IFCBUILDING', G('building'), oh, S(name), '$', '$', lpB, '$', '$', '.ELEMENT.', '$', '$', '$');
  const storey = E('IFCBUILDINGSTOREY', G('storey'), oh, S('Pool level'), '$', '$', lpS, '$', '$', '.ELEMENT.', '0.');
  E('IFCRELAGGREGATES', G('agg-project'), oh, '$', '$', project, L([site]));
  E('IFCRELAGGREGATES', G('agg-site'), oh, '$', '$', site, L([building]));
  E('IFCRELAGGREGATES', G('agg-building'), oh, '$', '$', building, L([storey]));
  const zdir = D3([0, 0, 1]);
  const styles = new Map(), mats = new Map(), contained = [], spaces = [], all = [];
  const styleFor = (hex, alpha) => {
    const k = hex + '|' + alpha;
    if (!styles.has(k)) styles.set(k, E('IFCSURFACESTYLE', S('Pool ' + hex + (alpha < 1 ? ' ' + alpha : '')), '.BOTH.', L([E('IFCSURFACESTYLESHADING', E('IFCCOLOURRGB', '$', ...rgb(hex).map(R)), R(1 - alpha))])));
    return styles.get(k);
  };
  const pset = (target, key, setName, rows) => {
    if (!rows.length) return;
    const props = rows.map(([n, type, v]) => E('IFCPROPERTYSINGLEVALUE', S(n), '$', type + '(' + (type === 'IFCLABEL' || type === 'IFCTEXT' ? S(v) : type === 'IFCINTEGER' ? String(Math.round(v)) : type === 'IFCBOOLEAN' ? (v ? '.T.' : '.F.') : R(v)) + ')', '$'));
    E('IFCRELDEFINESBYPROPERTIES', G(key + '-rel-' + setName), oh, '$', '$', L([target]), E('IFCPROPERTYSET', G(key + '-' + setName), oh, S(setName), '$', L(props)));
  };
  const portId = new Map(), portsOf = [];
  for (const e of els) {
    const items = [];
    let breps = 0;
    for (const pc of e.pieces) {
      if (pc.slab) {
        const n = pc.poly.length, zb = ([x]) => pc.bot[0] + pc.bot[1] * x, zt = ([x]) => pc.top[0] + pc.top[1] * x;
        const lo = pc.poly.map((q) => P3([q[0], q[1], zb(q)])), hi = pc.poly.map((q) => P3([q[0], q[1], zt(q)]));
        const face = (pts) => E('IFCFACE', L([E('IFCFACEOUTERBOUND', E('IFCPOLYLOOP', L(pts)), '.T.')]));
        const faces = [face([...lo].reverse()), face(hi)];
        for (let i = 0; i < n; i++) { const j = (i + 1) % n; faces.push(face([lo[i], lo[j], hi[j], hi[i]])); }
        const item = E('IFCFACETEDBREP', E('IFCCLOSEDSHELL', L(faces)));
        E('IFCSTYLEDITEM', item, L([styleFor(e.color, e.alpha ?? 1)]), '$');
        items.push(item); breps++;
        continue;
      }
      if (!(pc.depth > 0) || !(polyArea(pc.profile) > 0)) continue;
      const pts = pc.profile.map(([a, b]) => E('IFCCARTESIANPOINT', L([R(a), R(b)])));
      const prof = E('IFCARBITRARYCLOSEDPROFILEDEF', '.AREA.', '$', E('IFCPOLYLINE', L([...pts, pts[0]])));
      const item = E('IFCEXTRUDEDAREASOLID', prof, E('IFCAXIS2PLACEMENT3D', P3(pc.origin), D3(pc.z), D3(pc.x)), zdir, R(pc.depth));
      E('IFCSTYLEDITEM', item, L([styleFor(e.color, e.alpha ?? 1)]), '$');
      items.push(item);
    }
    if (!items.length) continue;
    const repType = !breps ? 'SweptSolid' : breps === items.length ? 'Brep' : 'SolidModel';
    const shape = E('IFCPRODUCTDEFINITIONSHAPE', '$', '$', L([E('IFCSHAPEREPRESENTATION', body, S('Body'), S(repType), L(items))]));
    const lp = E('IFCLOCALPLACEMENT', lpS, ax);
    const pre = e.predefined ? EN(e.predefined) : e.objectType ? '.USERDEFINED.' : '.NOTDEFINED.';
    const head = [G(e.key), oh, S(e.name), '$', S(e.objectType), lp, shape];
    let id;
    if (e.ifc === 'IFCSPACE') { id = E('IFCSPACE', ...head, S(e.name), '.ELEMENT.', pre, '$'); spaces.push(id); }
    else if (e.ifc === 'IFCSTAIRFLIGHT') { id = E('IFCSTAIRFLIGHT', ...head, S(e.key), String(e.props.Risers), String(e.props.Treads), R(e.props.RiserMm), R(e.props.TreadMm), pre); contained.push(id); }
    else if (e.ifc === 'IFCDOOR') { id = E('IFCDOOR', ...head, S(e.key), R(e.params?.height || 0), R(e.params?.width || 0), '.GATE.', '.SINGLE_SWING_LEFT.', '$'); contained.push(id); }
    else if (e.ifc === 'IFCREINFORCINGBAR') { id = E('IFCREINFORCINGBAR', ...head, S(e.key), '$', R(e.bar.dia), R(e.bar.area), R(e.bar.length), pre, '.TEXTURED.'); contained.push(id); }
    else { id = E(e.ifc, ...head, S(e.key), pre); contained.push(id); }
    all.push(id);
    if (e.ports && e.ports.length) portsOf.push([id, lp, e]);
    pset(id, e.key, 'CadCraft_Pool', psetRows(e));
    const q = qtyRows(e).map(([n, kind, v]) => (kind === 'volume' ? E('IFCQUANTITYVOLUME', S(n), '$', '$', R(v / 1e9), '$') : kind === 'area' ? E('IFCQUANTITYAREA', S(n), '$', '$', R(v / 1e6), '$') : E('IFCQUANTITYLENGTH', S(n), '$', '$', R(v), '$')));
    if (q.length) E('IFCRELDEFINESBYPROPERTIES', G(e.key + '-rel-qto'), oh, '$', '$', L([id]), E('IFCELEMENTQUANTITY', G(e.key + '-qto'), oh, S('Qto_CadCraftPoolBaseQuantities'), '$', '$', L(q)));
    const mn = materialName(e, d);
    if (mn && e.ifc !== 'IFCSPACE') { if (!mats.has(mn)) mats.set(mn, []); mats.get(mn).push(id); }
  }
  // ports, nested on their element, and the connections between them
  for (const [id, lp, e] of portsOf) {
    const list = [];
    for (const p of e.ports) {
      const z = p.dir, x = Math.abs(z[2]) < 0.9 ? [-z[1], z[0], 0] : [1, 0, 0], xn = Math.hypot(...x) || 1;
      const plp = E('IFCLOCALPLACEMENT', lp, E('IFCAXIS2PLACEMENT3D', P3(p.at), D3(z), D3(x.map((v) => v / xn))));
      const pid = E('IFCDISTRIBUTIONPORT', G('port|' + p.key), oh, S(p.flow === 'SOURCE' ? 'Outlet' : 'Inlet'), '$', S(String(p.system || '').toUpperCase()), plp, '$', '.' + p.flow + '.', '.PIPE.', '.NOTDEFINED.');
      portId.set(p.key, pid); list.push(pid);
    }
    E('IFCRELNESTS', G('nest|' + e.key), oh, '$', '$', id, L(list));
  }
  for (const [a, b] of (result.net && result.net.links) || []) if (portId.has(a) && portId.has(b)) E('IFCRELCONNECTSPORTS', G('link|' + a + '|' + b), oh, '$', '$', portId.get(a), portId.get(b), '$');
  if (contained.length) E('IFCRELCONTAINEDINSPATIALSTRUCTURE', G('contained'), oh, '$', '$', L(contained), storey);
  if (spaces.length) E('IFCRELAGGREGATES', G('agg-storey'), oh, '$', '$', storey, L(spaces));
  for (const [mn, ids] of mats) E('IFCRELASSOCIATESMATERIAL', G('mat-' + mn), oh, '$', '$', L(ids), E('IFCMATERIAL', S(mn), '$', '$'));
  if (all.length) E('IFCRELASSIGNSTOGROUP', G('group-rel'), oh, '$', '$', L(all), '$', E('IFCGROUP', G('group'), oh, S(name), '$', S('POOL')));
  pset(building, 'building', 'CadCraft_PoolDesign', opts.designRows || designRows(result));
  const stamp = date.toISOString().slice(0, 19);
  return ['ISO-10303-21;', 'HEADER;', "FILE_DESCRIPTION(('ViewDefinition [ReferenceView_V1.2]'),'2;1');",
    'FILE_NAME(' + S(name + '.ifc') + ",'" + stamp + "',(''),('CadCraft'),'CadCraft lib/pool','CadCraft pool generator','');", "FILE_SCHEMA(('IFC4'));", 'ENDSEC;', 'DATA;',
    ...lines, 'ENDSEC;', 'END-ISO-10303-21;', ''].join('\n');
}

/** The design figures written on the building (and by the BimCraft host on the pool's elements' level). */
export function designRows(result) {
  const d = result.design, c = result.circ, b = result.basis;
  const rows = [
    ['Kind', 'IFCLABEL', d.kind], ['Setting', 'IFCLABEL', d.setting], ['Use', 'IFCLABEL', d.use], ['Overflow', 'IFCLABEL', d.overflow],
    ['LengthMm', 'IFCREAL', d.length], ['WidthMm', 'IFCREAL', d.width], ['DepthShallowMm', 'IFCREAL', d.depthShallow], ['DepthDeepMm', 'IFCREAL', d.depthDeep],
    ['WaterVolumeM3', 'IFCREAL', c.volume], ['WaterSurfaceM2', 'IFCREAL', c.surface], ['FlowM3h', 'IFCREAL', c.flow], ['TurnoverH', 'IFCREAL', c.turnoverH],
    ['FilterCount', 'IFCINTEGER', c.filter.count], ['FilterDiameterMm', 'IFCREAL', c.filter.diameter], ['FilterRateMh', 'IFCREAL', c.filter.rate],
    ['PumpMotorKw', 'IFCREAL', c.pump.motorKw], ['PumpHeadM', 'IFCREAL', c.pump.head],
    ['WallMm', 'IFCREAL', d.wall], ['FloorMm', 'IFCREAL', d.floor], ['ConcreteMPa', 'IFCREAL', d.concreteMPa], ['CoverWaterMm', 'IFCREAL', d.coverWater], ['CoverEarthMm', 'IFCREAL', d.coverEarth], ['RebarRatio', 'IFCREAL', d.rebarRatio],
    ['Spec', 'IFCLABEL', result.spec ? result.spec.name : 'none'],
    ['FiguresFromSpec', 'IFCLABEL', Object.entries(b).filter(([, x]) => x.from === 'spec').map(([k]) => k).join(' ') || 'none'],
    ['FiguresNotFromAStandard', 'IFCLABEL', Object.entries(b).filter(([, x]) => x.from === 'start').map(([k]) => k).join(' ') || 'none'],
    ['Notice', 'IFCLABEL', 'A drawing aid. Not a structural, hydraulic or safety design: a licensed engineer must design and check the pool.'],
  ];
  return rows.map(([n, t, v]) => [n, t, typeof v === 'number' ? Number(v.toFixed(6)) : v]);
}

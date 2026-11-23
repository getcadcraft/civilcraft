/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-civil-networks.js: ifc-civil.js's 3 bindings for this topic, moved out of writeCivilIfc() unchanged (0.11 PERF.78 per-feature writers, perf-finish-11 r2 civil-detail; output byte-identical).
 * writeIfcNetworks(ctx) is called once by writeCivilIfc(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables writeCivilIfc() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { stepString as S, stepList as L } from './ifc/step.js';

export function writeIfcNetworks(ctx) {
  const { w, lx, ly, lz, unit, counts, root, O2, ax2d0, cBody, pset, qto, shape, element, site, put, model } = ctx;

  // ---- the pipe network
  const net = model.network;
  if (net) {
    const members = [];
    const extrude = (profile, at, depth) => w.ent('IfcExtrudedAreaSolid', { SweptArea: profile, Position: at, ExtrudedDirection: w.dir([0, 0, 1]), Depth: ctx.R(Math.max(depth, 1e-6)) });
    for (const p of net.pipes) {
      const r = p.dia / 2, dx = p.b.x - p.a.x, dy = p.b.y - p.a.y, dz = p.b.z - p.a.z, L3 = Math.hypot(dx, dy, dz);
      if (!(L3 > 1e-9)) continue;
      const u = [dx / L3, dy / L3, dz / L3], hl = Math.hypot(u[0], u[1]) || 1, ref = [-u[1] / hl, u[0] / hl, 0];
      const solid = extrude(w.ent('IfcCircleProfileDef', { ProfileType: '.AREA.', Position: ax2d0, Radius: ctx.R(r) }), w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(p.a.x), ly(p.a.y), lz(p.a.z + r)]), Axis: w.dir(u), RefDirection: w.dir(ref) }), L3);
      const ptag = 'pipe|' + p.id;
      const el = element({ cls: 'IfcPipeSegment', pre: 'RIGIDSEGMENT', name: p.name, label: 'Pipe', tag: ptag, rep: shape([[cBody, 'Body', 'SweptSolid', [solid]]]) });   // i18n-ignore: IFC file data
      put(site, el); members.push(el); counts.pipes++;
      qto([el], 'Qto_PipeSegmentBaseQuantities', [['Length', 'len', p.len]], ptag);
      // i18n-ignore: IFC file data
      pset([el], 'CadCraft_Pipe', [['InvertUpstream', p.a.z, 'len'], ['InvertDownstream', p.b.z, 'len'], ['InsideDiameter', p.dia, 'pos'], ['Diameter', p.diaText, 'label'], ['Slope', p.slope, 'ratio'], ['MinimumCover', p.cover, 'len'], ['From', p.from, 'label'], ['To', p.to, 'label'], ['Note', 'Body = the inside diameter (wall thickness is not modelled)', 'text']], ptag);
    }
    for (const s of net.structures) {
      const stag = 'struct|' + s.id, at = w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(s.x), ly(s.y), lz(s.bottom)]) });
      const prof = s.shape === 'rect'
        ? w.ent('IfcRectangleProfileDef', { ProfileType: '.AREA.', Position: w.ent('IfcAxis2Placement2D', { Location: O2, RefDirection: w.dir([Math.cos(s.ang), Math.sin(s.ang)]) }), XDim: ctx.R(s.l), YDim: ctx.R(s.w) })
        : w.ent('IfcCircleProfileDef', { ProfileType: '.AREA.', Position: ax2d0, Radius: ctx.R(s.w / 2) });
      if (!(s.w > 0)) continue;
      const el = element({ cls: 'IfcDistributionChamberElement', pre: s.predefined, name: s.name, label: ctx.words(s.kind), tag: stag, rep: shape([[cBody, 'Body', 'SweptSolid', [extrude(prof, at, s.rim - s.bottom)]]]) });
      put(site, el); members.push(el); counts.structures++;
      qto([el], 'Qto_DistributionChamberElementBaseQuantities', [['Depth', 'len', s.rim - s.bottom]], stag);
      pset([el], 'CadCraft_Structure', [['Kind', s.kind, 'label'], ['Type', s.typeName, 'label'], ['Rim', s.rim, 'len'], ['Floor', s.bottom, 'len'], ['SumpDepth', s.sumpDepth, 'len'], ['RimFrom', s.rimFrom, 'label']], stag);
    }
    if (members.length) {
      const sys = root(w.has('IfcDistributionSystem') ? 'IfcDistributionSystem' : 'IfcSystem', 'system', { Name: S(net.name), ObjectType: S(net.type === 'sanitary' ? 'Sanitary sewer' : 'Storm drainage'), PredefinedType: net.type === 'sanitary' ? '.SEWAGE.' : '.STORMWATER.' });   // i18n-ignore: IFC file data
      root('IfcRelAssignsToGroup', 'system|members', { RelatedObjects: L(members), RelatingGroup: sys });
      pset([sys], 'CadCraft_PipeRules', [['MinimumSlope', net.rules.minSlope, 'ratio'], ['MinimumCover', net.rules.minCover, 'len'], ['MinimumDrop', net.rules.minDrop, 'len']], 'system');
    }
  }

  // ---- the water mains (0.8 LC.16 rest + CV.2, civil_PART_3): pipes under the ground, then hydrants, valves and fittings, in one distribution system
  const wat = model.water;
  if (wat) {
    const members = [];
    const extrudeW = (profile, at, depth) => w.ent('IfcExtrudedAreaSolid', { SweptArea: profile, Position: at, ExtrudedDirection: w.dir([0, 0, 1]), Depth: ctx.R(Math.max(depth, 1e-6)) });
    for (const p of wat.pipes) {
      const r = p.dia / 2, dx = p.b.x - p.a.x, dy = p.b.y - p.a.y, dz = p.b.z - p.a.z, L3 = Math.hypot(dx, dy, dz);
      if (!(L3 > 1e-9)) continue;
      const u = [dx / L3, dy / L3, dz / L3], hl = Math.hypot(u[0], u[1]) || 1, ref = [-u[1] / hl, u[0] / hl, 0];
      const solid = extrudeW(w.ent('IfcCircleProfileDef', { ProfileType: '.AREA.', Position: ax2d0, Radius: ctx.R(r) }), w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(p.a.x), ly(p.a.y), lz(p.a.z)]), Axis: w.dir(u), RefDirection: w.dir(ref) }), L3);
      const ptag = 'wmain|' + p.id;
      const el = element({ cls: 'IfcPipeSegment', pre: 'RIGIDSEGMENT', name: p.name, label: 'Water main', tag: ptag, rep: shape([[cBody, 'Body', 'SweptSolid', [solid]]]) });   // i18n-ignore: IFC file data
      put(site, el); members.push(el); counts.pipes++;
      qto([el], 'Qto_PipeSegmentBaseQuantities', [['Length', 'len', p.len]], ptag);
      pset([el], 'CadCraft_WaterMain', [['Diameter', p.diaText, 'label'], ['InsideDiameter', p.dia, 'pos'], ['Cover', p.cover, 'len'], ['Note', 'Laid at the ground less the cover (a design aid: the invert is not surveyed).', 'label']], ptag);   // i18n-ignore: IFC file data
    }
    const KIND = { hydrant: ['IfcFireSuppressionTerminal', 'FIREHYDRANT', 'Hydrant'], valve: ['IfcValve', 'ISOLATING', 'Gate valve'], airvalve: ['IfcValve', 'AIRRELEASE', 'Air valve'], blowoff: ['IfcValve', 'FLUSHING', 'Blow-off'], meter: ['IfcFlowMeter', 'WATERMETER', 'Water meter'],
      tee: ['IfcPipeFitting', 'JUNCTION', 'Tee'], cross: ['IfcPipeFitting', 'JUNCTION', 'Cross'], bend: ['IfcPipeFitting', 'BEND', 'Bend'], reducer: ['IfcPipeFitting', 'TRANSITION', 'Reducer'], cap: ['IfcPipeFitting', 'OBSTRUCTION', 'Cap'] };   // i18n-ignore: IFC file data
    for (const f of wat.fixtures) {
      const k = KIND[f.kind]; if (!k) continue;
      const rr = Math.max(f.dia > 0 ? f.dia / 2 : 0, (unit === 'm' ? 0.1 : 0.35)), h = f.kind === 'hydrant' ? (unit === 'm' ? 1 : 3.3) + wat.cover : 2 * rr;
      const base = f.kind === 'hydrant' ? f.z : f.z - rr;   // a hydrant stands from the main to above the ground; the rest are centred on the main
      const ftag = 'wfit|' + f.id;
      const el = element({ cls: k[0], pre: k[1], name: f.name, label: k[2], tag: ftag, rep: shape([[cBody, 'Body', 'SweptSolid', [extrudeW(w.ent('IfcCircleProfileDef', { ProfileType: '.AREA.', Position: ax2d0, Radius: ctx.R(rr) }), w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(f.x), ly(f.y), lz(base)]) }), h)]]]) });
      put(site, el); members.push(el); counts.pipes++;
      pset([el], 'CadCraft_WaterFitting', [['Kind', k[2], 'label'], ['Source', f.source === 'placed' ? 'Placed by the person' : 'Implied by the layout', 'label'], ...(f.angle != null ? [['Angle', f.angle, 'real']] : [])], ftag);   // i18n-ignore: IFC file data
    }
    if (members.length) {
      const sys = root(w.has('IfcDistributionSystem') ? 'IfcDistributionSystem' : 'IfcSystem', 'system|water', { Name: S(wat.name), ObjectType: S('Water main'), PredefinedType: '.DOMESTICCOLDWATER.' });   // i18n-ignore: IFC file data
      root('IfcRelAssignsToGroup', 'system|water|members', { RelatedObjects: L(members), RelatingGroup: sys });
    }
  }

  // ---- utility networks (0.10 SU.1810): pipes (IfcPipeSegment) and cables (IfcCableSegment) under the ground, chambers, hydrants and valves, one system per service
  const utl = model.utilities;
  if (utl) {
    const bySvc = new Map();
    const extrudeU = (profile, at, depth) => w.ent('IfcExtrudedAreaSolid', { SweptArea: profile, Position: at, ExtrudedDirection: w.dir([0, 0, 1]), Depth: ctx.R(Math.max(depth, 1e-6)) });
    const attr = utl.attribution ? [['Attribution', utl.attribution, 'label']] : [];
    for (const p of utl.runs) {
      const r = p.dia / 2, dx = p.b.x - p.a.x, dy = p.b.y - p.a.y, dz = p.b.z - p.a.z, L3 = Math.hypot(dx, dy, dz);
      if (!(L3 > 1e-9)) continue;
      const u = [dx / L3, dy / L3, dz / L3], hl = Math.hypot(u[0], u[1]) || 1, ref = [-u[1] / hl, u[0] / hl, 0];
      const solid = extrudeU(w.ent('IfcCircleProfileDef', { ProfileType: '.AREA.', Position: ax2d0, Radius: ctx.R(r) }), w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(p.a.x), ly(p.a.y), lz(p.a.z)]), Axis: w.dir(u), RefDirection: w.dir(ref) }), L3);
      const ptag = 'util|' + p.id;
      const el = element({ cls: p.cable ? 'IfcCableSegment' : 'IfcPipeSegment', pre: p.cable ? 'CABLESEGMENT' : 'RIGIDSEGMENT', name: p.name, label: p.service, tag: ptag, rep: shape([[cBody, 'Body', 'SweptSolid', [solid]]]) });   // i18n-ignore: IFC file data
      put(site, el); (bySvc.get(p.service) || bySvc.set(p.service, []).get(p.service)).push(el); counts.pipes++;
      pset([el], 'CadCraft_Utility', [['Service', p.service, 'label'], ['Material', p.material || '', 'label'], ['Owner', p.owner || '', 'label'], ['Cover', p.depth, 'len'], ['Source', p.source === 'osm' ? 'OpenStreetMap ' + p.osm : 'Drawn', 'label'], ...attr], ptag);   // i18n-ignore: IFC file data
    }
    const NK = { hydrant: ['IfcFireSuppressionTerminal', 'FIREHYDRANT'], manhole: ['IfcDistributionChamberElement', 'MANHOLE'], chamber: ['IfcDistributionChamberElement', 'INSPECTIONCHAMBER'], valve: ['IfcValve', 'ISOLATING'], cabinet: ['IfcDistributionChamberElement', 'FORMEDDUCT'] };
    for (const n of utl.nodes) {
      const k = NK[n.kind]; if (!k) continue;
      const rr = unit === 'm' ? 0.4 : 1.3, ntag = 'util|' + n.id;
      const el = element({ cls: k[0], pre: k[1], name: n.name, label: n.kind, tag: ntag, rep: shape([[cBody, 'Body', 'SweptSolid', [extrudeU(w.ent('IfcCircleProfileDef', { ProfileType: '.AREA.', Position: ax2d0, Radius: ctx.R(rr) }), w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(n.x), ly(n.y), lz(n.z)]), Axis: w.dir([0, 0, 1]), RefDirection: w.dir([1, 0, 0]) }), 2 * rr)]]]) });   // i18n-ignore: IFC file data
      put(site, el); (bySvc.get(n.service) || bySvc.set(n.service, []).get(n.service)).push(el); counts.pipes++;
      pset([el], 'CadCraft_Utility', [['Service', n.service, 'label'], ['Owner', n.owner || '', 'label'], ['Source', n.source === 'osm' ? 'OpenStreetMap ' + n.osm : 'Drawn', 'label'], ...attr], ntag);   // i18n-ignore: IFC file data
    }
    const PT = { water: '.DOMESTICCOLDWATER.', sewer: '.SEWAGE.', storm: '.STORMWATER.', gas: '.GAS.', power: '.ELECTRICAL.', telecom: '.COMMUNICATION.' };
    for (const [svc, members] of bySvc) {
      const sys = root(w.has('IfcDistributionSystem') ? 'IfcDistributionSystem' : 'IfcSystem', 'system|util|' + svc, { Name: S(svc), ObjectType: S('Utility network'), PredefinedType: PT[svc] || '.NOTDEFINED.' });   // i18n-ignore: IFC file data
      root('IfcRelAssignsToGroup', 'system|util|' + svc + '|members', { RelatedObjects: L(members), RelatingGroup: sys });
    }
  }
}

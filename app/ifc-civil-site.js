/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-civil-site.js: ifc-civil.js's 7 bindings for this topic, moved out of writeCivilIfc() unchanged (0.11 PERF.78 per-feature writers, perf-finish-11 r2 civil-detail; output byte-identical).
 * writeIfcSite(ctx) is called once by writeCivilIfc(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables writeCivilIfc() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { stepString as S, stepList as L } from './ifc/step.js';

export function writeIfcSite(ctx) {
  const { w, lx, ly, lz, o, m2, counts, root, O3, ax2d0, cBody, cFoot, T, pset, place, shape, tess, element, siteLP, site, siteKids, put, model } = ctx;

  // ---- fences (0.10 SU.1814b, lib/fence): posts (IfcMember POST), panels (IfcRailing, user defined "Fence panel"), rails (IfcMember), gates (IfcDoor GATE), one system per fence
  for (const fm of model.fences || []) {
    const members = [], ptag = 'fence|' + fm.id, rect = (xd, yd) => w.ent('IfcRectangleProfileDef', { ProfileType: '.AREA.', Position: ax2d0, XDim: ctx.R(xd), YDim: ctx.R(yd) });
    const solidAlong = (a, b, xd, yd, midUp) => {   // a rectangle xd by yd swept from a to b; the profile's Y runs up (perpendicular to the run in the vertical plane)
      const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, L3 = Math.hypot(dx, dy, dz); if (!(L3 > 1e-9)) return null;
      const u = [dx / L3, dy / L3, dz / L3], hl = Math.hypot(u[0], u[1]) || 1, ref = [-u[1] / hl, u[0] / hl, 0];
      return w.ent('IfcExtrudedAreaSolid', { SweptArea: rect(xd, yd), Position: w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(a.x), ly(a.y), lz(a.z + midUp)]), Axis: w.dir(u), RefDirection: w.dir(ref) }), ExtrudedDirection: w.dir([0, 0, 1]), Depth: ctx.R(L3) });
    };
    const add = (spec, solid, kind, props) => { if (!solid) return; const el = element({ ...spec, rep: shape([[cBody, 'Body', 'SweptSolid', [solid]]]) }); put(site, el); members.push(el); counts.fences = (counts.fences || 0) + 1; pset([el], 'CadCraft_Fence', [['Fence', fm.name || fm.id, 'label'], ['Part', kind, 'label'], ['Type', fm.type || '', 'label'], ...props], spec.tag); };
    for (const p of fm.posts) add({ cls: 'IfcMember', pre: 'POST', name: fm.name + ' post', label: 'Fence post', tag: ptag + '|' + p.id }, w.ent('IfcExtrudedAreaSolid', { SweptArea: rect(p.size, p.size), Position: w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(p.x), ly(p.y), lz(p.base)]) }), ExtrudedDirection: w.dir([0, 0, 1]), Depth: ctx.R(p.top - p.base) }), 'post', [['PostKind', p.kind, 'label'], ['Length', p.top - p.base, 'len']]);   // i18n-ignore: IFC file data
    for (const n of fm.panels) add({ cls: 'IfcRailing', pre: 'USERDEFINED', name: fm.name + ' panel', label: 'Fence panel', tag: ptag + '|' + n.id }, solidAlong(n.a, n.b, fm.panelThk || n.height * 0.02, n.height, n.height / 2), 'panel', [['Height', n.height, 'len'], ['Length', n.len, 'len']]);   // i18n-ignore: IFC file data
    for (const r of fm.rails) add({ cls: 'IfcMember', pre: 'USERDEFINED', name: fm.name + ' rail', label: 'Fence rail', tag: ptag + '|' + r.id }, solidAlong(r.a, r.b, r.size, r.size, 0), 'rail', []);   // i18n-ignore: IFC file data
    for (const k of fm.pickets || []) { const L = Math.hypot(k.dx, k.dy) || 1, thk = fm.panelThk || k.w * 0.5; add({ cls: 'IfcMember', pre: 'USERDEFINED', name: fm.name + ' picket', label: 'Fence picket', tag: ptag + '|' + k.id }, w.ent('IfcExtrudedAreaSolid', { SweptArea: rect(k.w, thk), Position: w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(k.x), ly(k.y), lz(k.z)]), Axis: w.dir([0, 0, 1]), RefDirection: w.dir([k.dx / L, k.dy / L, 0]) }), ExtrudedDirection: w.dir([0, 0, 1]), Depth: ctx.R(k.height) }), 'picket', [['Height', k.height, 'len']]); }   // i18n-ignore: IFC file data; SU.1814b: one element per picket (a pickets fence's panels are schedule rows only)
    for (const g of fm.gates) add({ cls: 'IfcDoor', pre: 'GATE', name: g.name || fm.name + ' gate', label: 'Fence gate', tag: ptag + '|' + g.id, extra: { OverallHeight: ctx.R(g.height), OverallWidth: ctx.R(g.width) } }, solidAlong(g.a, g.b, fm.panelThk || g.height * 0.02, g.height, g.height / 2), 'gate', [['Width', g.width, 'len'], ['Leaves', g.leaves, 'int']]);   // i18n-ignore: IFC file data
    if (members.length) {
      const sys = root(w.has('IfcDistributionSystem') ? 'IfcDistributionSystem' : 'IfcSystem', 'system|' + ptag, { Name: S(fm.name || fm.id), ObjectType: S('Fence'), PredefinedType: '.NOTDEFINED.' });   // i18n-ignore: IFC file data
      root('IfcRelAssignsToGroup', 'system|' + ptag + '|members', { RelatedObjects: L(members), RelatingGroup: sys });
    }
  }

  // ---- parcels (footprints)
  for (const r of model.parcels) {
    const ring = r.pts.map((q) => w.pt([lx(q.x), ly(q.y)]));
    ring.push(ring[0]);
    const el = element({ cls: 'IfcGeographicElement', pre: 'USERDEFINED', name: r.name, label: 'Parcel', tag: 'parcel|' + r.id, rep: shape([[cFoot, 'FootPrint', 'Curve2D', [w.ent('IfcPolyline', { Points: L(ring) })]]]), extra: { ObjectType: S('Parcel') } });   // i18n-ignore: IFC file data
    put(site, el); counts.parcels++;
    pset([el], 'CadCraft_Parcel', [['Area', m2(r.area), 'area']], 'parcel|' + r.id);
  }

  // ---- the Landscape workspace (ifc-landscape.js elements; bodies in project units, relative to `at`)
  const types = new Map(), materials = new Map(), Z = w.dir([0, 0, 1]), XD = w.dir([1, 0, 0]);
  const value = (v, key) => (typeof v === 'boolean' ? ['bool', v] : typeof v === 'number' && ctx.fin(v) ? (/Count$/.test(key) && Number.isInteger(v) ? ['int', v] : ['real', v]) : String(v ?? '').length > 255 ? ['text', String(v).slice(0, 2000)] : ['label', String(v ?? '')]);
  const lsSolids = (b) => {
    if (!b) return [];
    const polyProf = (pts) => { const ring = pts.map((p) => w.pt([p.x, p.y])); ring.push(ring[0]); return w.ent('IfcArbitraryClosedProfileDef', { ProfileType: '.AREA.', OuterCurve: w.ent('IfcPolyline', { Points: L(ring) }) }); };
    const ext = (prof, z0, z1) => w.ent('IfcExtrudedAreaSolid', { SweptArea: prof, Position: w.ent('IfcAxis2Placement3D', { Location: w.pt([0, 0, z0]) }), ExtrudedDirection: Z, Depth: ctx.R(Math.max(1e-4, z1 - z0)) });
    if (b.kind === 'cylinders') return b.parts.filter((p) => p.r > 0 && p.z1 > p.z0).map((p) => ['SweptSolid', ext(w.ent('IfcCircleProfileDef', { ProfileType: '.AREA.', Position: ax2d0, Radius: ctx.R(p.r) }), p.z0, p.z1)]);
    if (b.kind === 'prism') return b.pts?.length >= 3 && b.z1 > b.z0 ? [['SweptSolid', ext(polyProf(b.pts), b.z0, b.z1)]] : [];
    if (b.kind === 'prisms') return b.list.flatMap((q) => lsSolids({ kind: 'prism', ...q }));
    if (b.kind === 'mesh' && b.indices?.length >= 3) {
      // a freeform mesh relative to its element's placement: written as is (tess() moves to the origin; undo that first)
      return [tessLocal({ pos: Array.from(b.positions), idx: Array.from(b.indices), closed: false })];
    }
    return [];
  };
  const tessLocal = (m) => { const P = m.pos.slice(); for (let i = 0; i < P.length; i += 3) { P[i] += o.x; P[i + 1] += o.y; P[i + 2] += o.z; } return tess({ ...m, pos: P }); };
  model.landscape.forEach((e, i) => {
    const tag = 'ls|' + (e.tag || i), at = e.at || { x: o.x, y: o.y, z: 0, rot: 0 }, rot = at.rot || 0;
    const plc = w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(at.x), ly(at.y), lz(at.z || 0)]), Axis: Z, RefDirection: rot ? w.dir([Math.cos(rot), Math.sin(rot), 0]) : XD });
    const items = lsSolids(e.body);
    const kinds = [...new Set(items.map((x) => x[0]))];
    const rep = items.length ? shape([[cBody, 'Body', kinds.length === 1 ? kinds[0] : 'SolidModel', items.map((x) => x[1])]]) : null;
    const label = e.objectType || ctx.words((e.predefined && e.predefined !== 'NOTDEFINED' && e.predefined !== 'USERDEFINED' ? e.predefined : e.cls.replace(/^Ifc/, '')));
    const el = element({ cls: e.cls, pre: e.predefined || 'NOTDEFINED', name: e.name, label, tag, rep, at: plc, extra: e.objectType ? { ObjectType: S(e.objectType) } : {} });
    put(site, el); counts.landscape++;
    for (const [pn, pr] of Object.entries(e.psets || {})) pset([el], pn, Object.entries(pr).filter(([, v]) => v !== '' && v != null).map(([k, v]) => { const [f, x] = value(v, k); return [k, x, f]; }), tag);
    if (e.material) {
      let ref;
      const mat = (n) => { if (!materials.has(n)) materials.set(n, w.ent('IfcMaterial', { Name: S(n) })); return materials.get(n); };
      if (typeof e.material === 'string') ref = mat(e.material);
      else ref = w.ent('IfcMaterialLayerSet', { MaterialLayers: L(e.material.map((m) => w.ent('IfcMaterialLayer', { Material: mat(m.name), LayerThickness: ctx.R(Math.max(m.thickness, 1e-6)), Name: S(m.name) }))), LayerSetName: S(tag) });
      root('IfcRelAssociatesMaterial', 'mat|' + tag, { RelatedObjects: L([el]), RelatingMaterial: ref });
    }
    if (e.type) {
      let ty = types.get(e.type.key);
      if (!ty) {
        const want = e.type.cls || e.cls + 'Type', tcls = w.has(want) ? want : w.has('IfcCivilElementType') ? 'IfcCivilElementType' : 'IfcBuildingElementProxyType';
        const sets = Object.entries(e.type.psets || {}).map(([pn, pr]) => {
          const ps = Object.entries(pr).filter(([, v]) => v !== '' && v != null).map(([k, v]) => { const [f, x] = value(v, k); return w.ent('IfcPropertySingleValue', { Name: S(k), NominalValue: T[f](x) }); });
          if (!ps.length) return null;
          counts.psets++;
          return root('IfcPropertySet', 'tpset|' + e.type.key + '|' + pn, { Name: S(pn), HasProperties: L(ps) });
        }).filter(Boolean);
        const t = root(tcls, 'type|' + e.type.key, { Name: S(e.type.name), HasPropertySets: sets.length ? L(sets) : null, Tag: S(e.type.key), ElementType: tcls !== want ? S(label) : null, PredefinedType: ctx.E(e.type.predefined || e.predefined || 'NOTDEFINED'), _ot: label });
        ty = { ref: t, members: [] };
        types.set(e.type.key, ty);
      }
      ty.members.push(el);
    }
  });
  for (const [key, ty] of types) root('IfcRelDefinesByType', 'rdt|' + key, { RelatedObjects: L(ty.members), RelatingType: ty.ref });

  // ---- building masses (ifc-massing.js's shape: a building, its storeys, the mass as a proxy)
  for (const m of model.masses) {
    const tag = m.id || String(counts.masses);
    let P = m.pts, a = 0;
    for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p.x * q.y - q.x * p.y; }
    if (a < 0) P = P.slice().reverse();
    const Hm = m.floors * m.floorHeight, fp = Math.abs(a / 2);
    const bLP = place(siteLP, w.ent('IfcAxis2Placement3D', { Location: w.pt([0, 0, lz(m.z0)]) }));
    const building = root('IfcBuilding', 'building|' + tag, { Name: S(m.name), ObjectPlacement: bLP, CompositionType: '.ELEMENT.' });
    siteKids.push(building);
    const storeys = [];
    for (let k = 0; k < m.floors; k++) storeys.push(root('IfcBuildingStorey', 'storey|' + tag + '|' + k, { Name: S('Level ' + (k + 1)), ObjectPlacement: place(bLP, w.ent('IfcAxis2Placement3D', { Location: w.pt([0, 0, k * m.floorHeight]) })), CompositionType: '.ELEMENT.', Elevation: ctx.R(m.z0 + k * m.floorHeight) }));   // i18n-ignore: IFC file data
    const ring = P.map((p) => w.pt([lx(p.x), ly(p.y)]));
    ring.push(ring[0]);
    const solid = w.ent('IfcExtrudedAreaSolid', { SweptArea: w.ent('IfcArbitraryClosedProfileDef', { ProfileType: '.AREA.', OuterCurve: w.ent('IfcPolyline', { Points: L(ring) }) }), Position: w.ent('IfcAxis2Placement3D', { Location: O3 }), ExtrudedDirection: Z, Depth: ctx.R(Hm) });
    const proxy = root('IfcBuildingElementProxy', 'mass|' + tag, { Name: S(m.name), Description: S('Building mass'), ObjectPlacement: place(bLP), Representation: shape([[cBody, 'Body', 'SweptSolid', [solid]]]), PredefinedType: '.NOTDEFINED.' });   // i18n-ignore: IFC file data
    pset([proxy], 'CadCraft_SiteMass', [['MassId', tag, 'label'], ['Use', m.use || '', 'label'], ['Floors', m.floors, 'int'], ['FloorHeight', m.floorHeight, 'len'], ['Height', Hm, 'len'], ['GroundFloorLevel', m.z0, 'len'],
      ['FootprintArea', m2(fp), 'area'], ['GrossFloorArea', m2(fp * m.floors), 'area'], ['BaseOnSlope', m.base || '', 'label'], ['Ground', m.ground || '', 'label'], ['Parcel', m.parcel || '', 'label']], 'mass|' + tag);
    put(building, proxy);
    root('IfcRelAggregates', 'rel-storeys|' + tag, { RelatingObject: building, RelatedObjects: L(storeys) });
    counts.masses++;
  }
}

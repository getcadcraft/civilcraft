/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-civil-corridors.js: ifc-civil.js's 10 bindings for this topic, moved out of writeCivilIfc() unchanged (0.11 PERF.78 per-feature writers, perf-finish-11 r2 civil-detail; output byte-identical).
 * writeIfcCorridors(ctx) is called once by writeCivilIfc(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables writeCivilIfc() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { stepString as S, stepList as L } from './ifc/step.js';

export function writeIfcCorridors(ctx) {
  const { X4, w, lx, ly, lz, um, m2, meshArea, counts, root, O3, ax2d0, cBody, pset, qto, place, shape, body, element, isCut, siteLP, site, siteKids, contain, put, MPS, designProps, alOut, model } = ctx;

  // ---- surfaces (first: in IFC 4.3 an IfcEarthworksCut is a subtraction that voids the existing ground)
  let egEl = null;
  for (const s of model.surfaces) {
    if (!s.faces.length) continue;
    const pos = [];
    for (const q of s.pts) pos.push(q.x, q.y, q.z);
    const mesh = { pos, idx: s.faces.flat(), closed: false };
    const label = s.key === 'eg' ? 'Existing ground' : 'Design surface';   // i18n-ignore: IFC file data
    const el = element({ cls: 'IfcGeographicElement', pre: 'TERRAIN', name: s.name, label, tag: 'surface|' + s.key, rep: body(mesh, { tin: true }), extra: { ObjectType: S(label) } });
    put(site, el); counts.surfaces++;
    if (s.key === 'eg') egEl = el;
    pset([el], 'CadCraft_Surface', [['Kind', label, 'label'], ['Points', s.pts.length, 'int'], ['Triangles', s.faces.length, 'int'], ['SurfaceArea', meshArea(mesh), 'area']], 'surface|' + s.key);
  }

  // ---- corridors: roads, their parts, earthworks
  // i18n-ignore-start: IFC file data (names and object types in English, like every IFC we write)
  const PART = {
    lane: { cls: 'IfcPavement', pre: 'NOTDEFINED', label: 'Lanes', rp: 'CARRIAGEWAY' }, shoulder: { cls: 'IfcPavement', pre: 'NOTDEFINED', label: 'Shoulder', rp: 'SHOULDER' },
    gutter: { cls: 'IfcPavement', pre: 'USERDEFINED', label: 'Gutter', rp: 'CARRIAGEWAY' }, curb: { cls: 'IfcKerb', pre: 'NOTDEFINED', label: 'Curb', rp: 'ROADSIDE' },
    strip: { cls: 'IfcGeographicElement', pre: 'VEGETATION', label: 'Planting strip', rp: 'ROADSIDE' }, walk: { cls: 'IfcPavement', pre: 'USERDEFINED', label: 'Sidewalk', rp: 'SIDEWALK' },
  };
  const SIDE = { L: 'left', R: 'right' };
  // 0.7.1 71.24: CivilCraft's course kinds → IfcCourseTypeEnum (4.3 has PAVEMENT for the courses traffic runs on; base, subbase and
  // capping have no value of their own there: USERDEFINED with the name in ObjectType)
  const COURSE = { surface: { pre: 'PAVEMENT', label: 'Surface course' }, binder: { pre: 'PAVEMENT', label: 'Binder course' }, base: { pre: 'USERDEFINED', label: 'Base course' },
    subbase: { pre: 'USERDEFINED', label: 'Subbase' }, capping: { pre: 'USERDEFINED', label: 'Capping layer' }, other: { pre: 'USERDEFINED', label: 'Course' } };
  const RP_NAME = { CARRIAGEWAY: 'Carriageway', SHOULDER: 'Shoulders', ROADSIDE: 'Roadside', SIDEWALK: 'Sidewalks' };
  // i18n-ignore-end
  const earthworks = (owner, tag, nameOf, meshes, volumes) => {
    const out = [];
    for (const kind of ['cut', 'fill']) {
      const mesh = meshes[kind], v = volumes?.[kind];
      if (!mesh && !(v > 0)) continue;
      const cut = kind === 'cut';
      if (cut && X4 && !egEl) continue;   // a cut needs the ground it is cut from
      // i18n-ignore: IFC file data
      const el = element({ cls: cut ? 'IfcEarthworksCut' : 'IfcEarthworksFill', pre: cut ? 'CUT' : 'EMBANKMENT', name: nameOf(cut ? 'cut slopes' : 'fill slopes'), label: cut ? 'Earthworks cut' : 'Earthworks fill', tag: tag + '|' + kind, rep: mesh ? body(mesh) : null });
      counts.earthworks++;
      if (ctx.fin(v)) qto([el], cut ? 'Qto_EarthworksCutBaseQuantities' : 'Qto_EarthworksFillBaseQuantities', [[cut ? 'UndisturbedVolume' : 'CompactedVolume', 'vol', v]], tag + '|' + kind);
      // i18n-ignore: IFC file data
      pset([el], 'CadCraft_Earthworks', [['Of', owner, 'label'], ['VolumeMethod', 'Grid method between the existing ground and the graded surface inside the daylight line', 'text'], ['SlopeArea', mesh ? meshArea(mesh) : null, 'real']], tag + '|' + kind);
      // IFC 4.3: the cut is a subtraction feature, never in the spatial structure: it voids the existing ground
      if (cut && X4) root('IfcRelVoidsElement', tag + '|voids', { RelatingBuildingElement: egEl, RelatedOpeningElement: el });
      out.push(el);
    }
    return out;
  };

  const mats = new Map(), material = (n) => { if (!mats.has(n)) mats.set(n, w.ent('IfcMaterial', { Name: S(n) })); return mats.get(n); };
  /**
   * 0.7.1 71.26 / B: a railway corridor (corridor.js info.rail, ifc-civil-model.js trackSolids). IFC 4.3: IfcRailway (in the site) >
   * IfcRailwayPart TRACK (Pset_RailwayTrackStructurePart: a ballasted track) holding each rail (IfcRail RAIL, a solid of its section along
   * the head line, Qto_RailBaseQuantities length and weight), each track's sleepers (IfcTrackElement SLEEPER: one element per track, every
   * sleeper an IfcMappedItem of one box, Qto_SleeperBaseQuantities + the count and spacing) and the ballast bed (IfcCourse BALLASTBED, its
   * net volume), and IfcRailwayPart SUBSTRUCTURE with the sub-ballast (IfcCourse USERDEFINED 'Sub-ballast') and the fill; the cut voids the
   * ground as for a road. The alignment is referenced in the railway and positions its elements. IFC4 / 2x3: the same elements as
   * IfcCivilElement / proxies (ObjectType Rail, Sleepers, Ballast bed, Sub-ballast) in an IfcGroup 'Railway'.
   */
  const sleeperMaps = new Map();
  function writeTrack(c, tag, al) {
    const T = c.track, rs = T.rail, Q = T.quantities || {}, els = [], d = c.design || {};
    let fac = null, group = null, track = null, substructure = null;
    // i18n-ignore-start: IFC file data
    const props = [...designProps(c.design), ['Alignment', c.name, 'label'], ['FromStation', c.from, 'len'], ['ToStation', c.to, 'len'], ['Gauge', rs.gauge + ' mm', 'label'], ['RailHeadDistance', T.base + ' mm', 'label'],
      ['Tracks', rs.tracks || 1, 'int'], ['TrackCentres', rs.tracks > 1 ? rs.centres : null, 'len'], ['RailSection', rs.rail, 'label'], ['CantPivot', rs.pivot, 'label'], ['SleeperMaterial', rs.sleeper.material, 'label'], ['SleeperSpacing', rs.sleeper.spacing, 'len'],
      ['BallastDepth', rs.ballast.depth, 'len'], ['SubBallastDepth', rs.sub.depth, 'len'], ['Provisional', c.standIn, 'bool']];
    // i18n-ignore-end
    if (X4) {
      fac = root('IfcRailway', tag, { Name: S(c.name), ObjectPlacement: place(siteLP), CompositionType: '.ELEMENT.', PredefinedType: '.NOTDEFINED.' });
      siteKids.push(fac);
      track = root('IfcRailwayPart', tag + '|TRACK', { Name: S('Track'), ObjectPlacement: place(siteLP), UsageType: '.LONGITUDINAL.', PredefinedType: '.TRACK.' });   // i18n-ignore: IFC file data
      substructure = root('IfcRailwayPart', tag + '|SUBSTRUCTURE', { Name: S('Substructure'), ObjectPlacement: place(siteLP), UsageType: '.LONGITUDINAL.', PredefinedType: '.SUBSTRUCTURE.' });   // i18n-ignore: IFC file data
      root('IfcRelAggregates', tag + '|parts', { RelatingObject: fac, RelatedObjects: L([track, substructure]) });
      pset([track], 'Pset_RailwayTrackStructurePart', [['HasBallastTrack', true, 'bool']], tag + '|TRACK');
      pset([fac], 'CadCraft_Track', props, tag);
      counts.roadParts += 2;
    } else {
      group = root('IfcGroup', tag, { Name: S(c.name), ObjectType: S('Railway') });   // i18n-ignore: IFC file data
      pset([group], 'CadCraft_Track', props, tag);
    }
    const inTrack = [], inSub = [];
    for (const r of T.rails) {
      const rtag = tag + '|rail|' + r.track + r.side;
      // i18n-ignore: IFC file data
      const el = element({ cls: 'IfcRail', pre: 'RAIL', name: 'Rail, track ' + (r.track + 1) + ', ' + SIDE[r.side], label: 'Rail', tag: rtag, rep: body(r.mesh) });
      inTrack.push(el); els.push(el);
      qto([el], 'Qto_RailBaseQuantities', [['Length', 'len', r.length], ['Weight', 'kg', r.length * um * r.kg]], rtag);
      pset([el], 'CadCraft_Rail', [['Section', r.profile, 'label'], ['MassPerMetre', r.kg, 'real'], ['Track', r.track + 1, 'int'], ['Side', SIDE[r.side], 'label']], rtag);
    }
    for (const sp of T.sleepers) {
      if (!sp.at.length) continue;
      const stag = tag + '|sleepers|' + sp.track, key = [sp.length, sp.width, sp.depth].join(',');
      if (!sleeperMaps.has(key)) {
        const solid = w.ent('IfcExtrudedAreaSolid', { SweptArea: w.ent('IfcRectangleProfileDef', { ProfileType: '.AREA.', Position: ax2d0, XDim: ctx.R(sp.length), YDim: ctx.R(sp.width) }), Position: w.ent('IfcAxis2Placement3D', { Location: w.pt([0, 0, -sp.depth]) }), ExtrudedDirection: w.dir([0, 0, 1]), Depth: ctx.R(sp.depth) });
        sleeperMaps.set(key, w.ent('IfcRepresentationMap', { MappingOrigin: w.ent('IfcAxis2Placement3D', { Location: O3 }), MappedRepresentation: w.ent('IfcShapeRepresentation', { ContextOfItems: cBody, RepresentationIdentifier: S('Body'), RepresentationType: S('SweptSolid'), Items: L([solid]) }) }));
      }
      const items = sp.at.map((q) => {
        const sl = q.slope, a1 = [q.across.x, q.across.y, sl], n1 = Math.hypot(...a1), A1 = a1.map((v) => v / n1), A2 = [-q.across.y, q.across.x, 0];
        const A3 = [A1[1] * A2[2] - A1[2] * A2[1], A1[2] * A2[0] - A1[0] * A2[2], A1[0] * A2[1] - A1[1] * A2[0]];
        return w.ent('IfcMappedItem', { MappingSource: sleeperMaps.get(key), MappingTarget: w.ent('IfcCartesianTransformationOperator3D', { Axis1: w.dir(A1), Axis2: w.dir(A2), LocalOrigin: w.pt([lx(q.x), ly(q.y), lz(q.z)]), Scale: '1.', Axis3: w.dir(A3) }) });
      });
      // i18n-ignore: IFC file data
      const el = element({ cls: 'IfcTrackElement', pre: 'SLEEPER', name: 'Sleepers, track ' + (sp.track + 1), label: 'Sleepers', tag: stag, rep: shape([[cBody, 'Body', 'MappedRepresentation', items]]) });
      inTrack.push(el); els.push(el);
      qto([el], 'Qto_SleeperBaseQuantities', [['Length', 'len', sp.length], ['Width', 'len', sp.width], ['Height', 'len', sp.depth]], stag);
      pset([el], 'CadCraft_Sleepers', [['Count', sp.at.length, 'int'], ['Spacing', sp.spacing, 'len'], ['Material', sp.material, 'label']], stag);
    }
    if (T.ballast) {
      const btag = tag + '|ballast';
      // i18n-ignore: IFC file data
      const el = element({ cls: 'IfcCourse', pre: 'BALLASTBED', name: 'Ballast bed', label: 'Ballast bed', tag: btag, rep: body(T.ballast) });
      inTrack.push(el); els.push(el); counts.courses++;
      qto([el], 'Qto_CourseBaseQuantities', [['Length', 'len', Q.length], ['Volume', 'vol', Q.ballast], ['GrossVolume', 'vol', Q.ballastGross], ['Thickness', 'len', rs.ballast.depth]], btag);
    }
    if (T.sub) {
      const stag = tag + '|subballast';
      // i18n-ignore: IFC file data
      const el = element({ cls: 'IfcCourse', pre: 'USERDEFINED', name: 'Sub-ballast', label: 'Sub-ballast', tag: stag, rep: body(T.sub) });
      inSub.push(el); els.push(el); counts.courses++;
      qto([el], 'Qto_CourseBaseQuantities', [['Length', 'len', Q.length], ['Volume', 'vol', Q.sub], ['Thickness', 'len', rs.sub.depth]], stag);
    }
    for (const el of earthworks(c.name, tag, (what) => c.name + ', ' + what, { cut: c.cut, fill: c.fill }, c.volumes)) { els.push(el); if (!isCut(el)) inSub.push(el); }
    if (X4) { contain.set(track, inTrack); contain.set(substructure, inSub); } else for (const el of [...inTrack, ...inSub]) put(site, el);
    if (X4 && al) {
      root('IfcRelReferencedInSpatialStructure', tag + '|ref-al', { RelatedElements: L([al.el]), RelatingStructure: fac });
      root('IfcRelPositions', tag + '|positions', { RelatingPositioningElement: al.el, RelatedProducts: L([fac, ...els]) });
    }
    if (group && els.length) root('IfcRelAssignsToGroup', tag + '|group', { RelatedObjects: L(els), RelatingGroup: group });
    counts.railways = (counts.railways || 0) + 1;
    void d;
  }

  for (const c of model.corridors) {
    if (c.track) { writeTrack(c, 'rail|' + c.id, alOut.get(c.alignment)); continue; }   // 0.7.1 71.26 / B
    const tag = 'road|' + c.id, al = alOut.get(c.alignment), partEl = new Map();
    counts.roads++;
    const els = [];
    let road = null, group = null;
    // i18n-ignore: IFC file data
    const roadProps = [...designProps(c.design), ['Alignment', c.name, 'label'], ['FromStation', c.from, 'len'], ['ToStation', c.to, 'len'], ['Assembly', c.assembly, 'text'], ['CutSlope', c.cutSlope + ':1', 'label'], ['FillSlope', c.fillSlope + ':1', 'label'], ['SectionStep', c.step, 'len'], ['Superelevation', c.superOn, 'bool'], ['Provisional', c.standIn, 'bool']];
    const parts = new Map();   // road part type → { el, items }
    if (X4) {
      road = root('IfcRoad', tag, { Name: S(c.name), ObjectPlacement: place(siteLP), CompositionType: '.ELEMENT.', PredefinedType: '.NOTDEFINED.' });
      siteKids.push(road);
      for (const p of c.parts) {
        const rp = PART[p.part].rp;
        if (!parts.has(rp)) parts.set(rp, { el: root('IfcRoadPart', tag + '|' + rp, { Name: S(RP_NAME[rp]), ObjectPlacement: place(siteLP), UsageType: '.LONGITUDINAL.', PredefinedType: ctx.E(rp) }), items: [] });
      }
      if (parts.size) { root('IfcRelAggregates', tag + '|parts', { RelatingObject: road, RelatedObjects: L([...parts.values()].map((x) => x.el)) }); counts.roadParts += parts.size; }
      const d = c.design || {};
      pset([road], 'Pset_RoadDesignCriteriaCommon', [['Crossfall', c.nc, 'ratio'], ['LaneWidth', c.laneWidth, 'pos'], ['NumberOfThroughLanes', c.lanes, 'count'],
        ['DesignSpeed', ctx.fin(d.speed) ? d.speed * MPS[d.unit] : null, 'speed'], ['RoadDesignClass', d.cls || null, 'label']], tag);   // DesignSpeed in m/s (SI)
      pset([road], 'CadCraft_Corridor', roadProps, tag);
    } else {
      group = root('IfcGroup', tag, { Name: S(c.name), ObjectType: S('Road') });   // i18n-ignore: IFC file data
      pset([group], 'CadCraft_Corridor', roadProps, tag);
    }
    for (const p of c.parts) {
      const d = PART[p.part], ptag = tag + '|' + p.side + '|' + p.part;
      const el = element({ cls: d.cls, pre: d.pre, name: d.label + ', ' + SIDE[p.side], label: d.label, tag: ptag, rep: body(p.mesh) });
      els.push(el); partEl.set(p.side + ':' + p.part, el);
      if (X4) parts.get(d.rp).items.push(el); else put(site, el);
      const area = meshArea(p.mesh);
      if (d.cls === 'IfcPavement') qto([el], 'Qto_PavementBaseQuantities', [['Length', 'len', p.length], ['Width', 'len', p.length > 0 ? p.area / p.length : null], ['GrossArea', 'area', p.area]], ptag);
      else if (d.cls === 'IfcKerb') qto([el], 'Qto_KerbBaseQuantities', [['Length', 'len', p.length]], ptag);
      pset([el], 'CadCraft_CorridorPart', [['Part', p.part, 'label'], ['Side', SIDE[p.side], 'label'], ['SurfaceArea', area, 'area']], ptag);   // i18n-ignore: IFC file data
    }
    // 0.7.1 71.24: the pavement courses under each part: IfcCourse solids (IFC4: civil elements, IFC2x3: proxies) aggregated into
    // their part, with a material each, Qto_CourseBaseQuantities and the part's IfcMaterialLayerSet (top down)
    const byPart = new Map();
    for (const q of c.courses || []) {
      const key = q.side + ':' + q.part, host = partEl.get(key);
      if (!host || !q.mesh) continue;
      const ctag = tag + '|course|' + q.side + '|' + q.code + '|' + q.k, kind = COURSE[q.course] || COURSE.other;
      const label = q.name || kind.label;
      const el = element({ cls: 'IfcCourse', pre: kind.pre, name: label + ', ' + PART[q.part].label.toLowerCase() + ', ' + SIDE[q.side], label: kind.pre === 'USERDEFINED' ? label : 'Course: ' + label, tag: ctag, rep: body(q.mesh) });   // i18n-ignore: IFC file data
      counts.courses++;
      if (!byPart.has(key)) byPart.set(key, { host, items: [], layers: [] });
      const bp = byPart.get(key);
      bp.items.push(el);
      if (!bp.codes) bp.codes = new Set();
      if (!bp.codes.size || bp.codes.has(q.code)) { bp.codes.add(q.code); bp.layers.push(q); }
      if (q.material) root('IfcRelAssociatesMaterial', 'mat|' + ctag, { RelatedObjects: L([el]), RelatingMaterial: material(q.material) });
      qto([el], 'Qto_CourseBaseQuantities', [['Length', 'len', q.length], ['Width', 'len', q.length > 0 ? q.area / q.length : null], ['Thickness', 'len', q.t], ['Volume', 'vol', q.volume]], ctag);
      // i18n-ignore: IFC file data
      pset([el], 'CadCraft_Course', [['Kind', q.course, 'label'], ['Material', q.material, 'label'], ['Thickness', q.t, 'len'], ['PlanArea', m2(q.area), 'area'], ['Part', q.part, 'label'], ['Side', SIDE[q.side], 'label']], ctag);
    }
    for (const [key, bp] of byPart) {
      root('IfcRelAggregates', tag + '|courses|' + key, { RelatingObject: bp.host, RelatedObjects: L(bp.items) });
      const set = w.ent('IfcMaterialLayerSet', { MaterialLayers: L(bp.layers.map((q) => w.ent('IfcMaterialLayer', { Material: material(q.material || q.name || COURSE[q.course]?.label || 'Course'), LayerThickness: ctx.R(Math.max(q.t, 1e-6)), Name: S(q.name || COURSE[q.course]?.label || 'Course') }))), LayerSetName: S(key) });   // i18n-ignore: IFC file data
      root('IfcRelAssociatesMaterial', 'matset|' + tag + '|' + key, { RelatedObjects: L([bp.host]), RelatingMaterial: set });
    }
    const ew = earthworks(c.name, tag, (what) => c.name + ', ' + what, { cut: c.cut, fill: c.fill }, c.volumes);
    for (const el of ew) { els.push(el); if (!isCut(el)) put(X4 ? road : site, el); }
    for (const [, x] of parts) if (x.items.length) contain.set(x.el, x.items);
    if (X4 && al) {
      root('IfcRelReferencedInSpatialStructure', tag + '|ref-al', { RelatedElements: L([al.el]), RelatingStructure: road });
      root('IfcRelPositions', tag + '|positions', { RelatingPositioningElement: al.el, RelatedProducts: L([road, ...els]) });
    }
    if (group && els.length) root('IfcRelAssignsToGroup', tag + '|group', { RelatedObjects: L(els), RelatingGroup: group });
  }

  // ---- pads, their slopes and retaining walls
  for (const p of model.pads) {
    const tag = 'pad|' + p.id;
    counts.pads++;
    const top = p.top ? element({ cls: 'IfcGeographicElement', pre: 'TERRAIN', name: p.name, label: 'Graded pad', tag, rep: body(p.top, { tin: true }), extra: { ObjectType: S('Graded pad') } }) : null;   // i18n-ignore: IFC file data
    if (top) {
      put(site, top);
      pset([top], 'CadCraft_Pad', [['Elevation', p.z, 'len'], ['CutSlope', p.cutSlope + ':1', 'label'], ['FillSlope', p.fillSlope + ':1', 'label'], ['Area', m2(p.area), 'area']], tag);
    }
    for (const el of earthworks(p.name, tag, (what) => p.name + ', ' + what, { cut: p.cut, fill: p.fill }, p.volumes)) if (!isCut(el)) put(site, el);
    p.walls.forEach((wl, k) => {
      const wt = tag + '|wall|' + k;
      const el = element({ cls: 'IfcWall', pre: 'RETAININGWALL', name: p.name + ', retaining wall ' + (k + 1), label: 'Retaining wall', tag: wt, rep: body(wl.mesh) });   // i18n-ignore: IFC file data
      put(site, el); counts.walls++;
      qto([el], 'Qto_WallBaseQuantities', [['Length', 'len', wl.length], ['Width', 'len', wl.thickness], ['Height', 'len', wl.maxH], ['GrossSideArea', 'area', wl.faceArea], ['GrossVolume', 'vol', wl.volume]], wt);
      pset([el], 'CadCraft_RetainingWall', [['Pad', p.name, 'label'], ['AverageHeight', wl.avgH, 'len'], ['TallestHeight', wl.maxH, 'len'], ['Sides', (wl.sides || []).map((x) => x + 1).join(', '), 'label']], wt);
    });
  }
}

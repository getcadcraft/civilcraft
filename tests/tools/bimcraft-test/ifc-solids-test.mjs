/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --ifcsolids` (0.8 DC.115, session ifc_PART_3): ifc-solids.js keeps IFC geometry editable.
 * Known answers worked by hand: an L-shaped prism (area 3 × 2 − 1 × 1 = 5 … see below), a block with a hole, an extruded cylinder.
 */
import path from 'node:path';

export async function ifcSolidsMode({ APP, WebIFC, IfcModel }) {
  const S = await import(path.join(APP, 'ifc-solids.js'));
  const { IfcFile } = await import(path.join(APP, 'ifc/model.js'));
  const { solidsToIfc } = await import(path.join(APP, 'step-ifc.js'));
  const { GeoCtx } = await import(path.join(APP, 'ifc/geo-ctx.js'));
  const { extruded } = await import(path.join(APP, 'ifc/geo-solid.js'));
  let bad = 0, good = 0;
  const ok = (c, l) => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + l); };
  const near = (a, b, t = 1e-6) => Math.abs(a - b) <= t * Math.max(1, Math.abs(b));

  // a prism mesh from a counter-clockwise outline (+ clockwise holes), z from 0 to h, caps fan-triangulated (convex) or given
  function prismMesh(outer, h, capTris, { tilt = null } = {}) {
    const n = outer.length, P = [];
    for (const [x, y] of outer) P.push(x, y, 0);
    for (const [x, y] of outer) P.push(x, y, h);
    const I = [];
    for (const [a, b, c] of capTris) { I.push(a, c, b); I.push(n + a, n + b, n + c); }   // bottom faces down, top faces up
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; I.push(i, j, n + j, i, n + j, n + i); }
    return { positions: P, indices: I };
  }
  // L shape: (0,0) (3,0) (3,1) (1,1) (1,2) (0,2): area 3 + 1 = 4, height 2000 → volume 8000
  const L = [[0, 0], [3, 0], [3, 1], [1, 1], [1, 2], [0, 2]];
  const Lcap = [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 5]];
  const m = prismMesh(L, 2, Lcap);
  ok(near(S.meshVolume(m.positions, m.indices), 8), 'the test mesh: L prism volume 4 × 2 = 8');
  const pr = S.meshToPrism(m.positions, m.indices);
  ok(!!pr, 'the L prism is recognised');
  ok(pr && near(pr.depth, 2) && near(S.prismArea(pr), 4), 'depth 2, profile area 4' + (pr ? ' (' + pr.depth + ', ' + S.prismArea(pr) + ')' : ''));
  ok(pr && pr.outer.length === 6 && pr.holes.length === 0, 'the L keeps its six corners');

  // a tilted copy: rotate about x by 30 degrees, translate: still a prism along the tilted axis
  const c = Math.cos(Math.PI / 6), s = Math.sin(Math.PI / 6);
  const tp = [];
  for (let i = 0; i < m.positions.length; i += 3) { const [x, y, z] = [m.positions[i] + 5, m.positions[i + 1], m.positions[i + 2]]; tp.push(x, y * c - z * s + 7, y * s + z * c - 3); }
  const pt = S.meshToPrism(tp, m.indices);
  ok(pt && near(pt.depth, 2, 1e-5) && near(S.prismArea(pt), 4, 1e-5), 'a rotated and moved prism is recognised too (depth 2, area 4)');

  // not prisms: a pyramid-like taper, an open mesh, a cut corner
  const taper = { positions: m.positions.slice(), indices: m.indices };
  taper.positions[3 * 6 + 0] += 0.5;   // moves a top vertex sideways: the side is no longer along the axis
  ok(S.meshToPrism(taper.positions, taper.indices) === null, 'a prism with one top vertex moved is not a prism');
  ok(S.meshToPrism(m.positions, m.indices.slice(0, -6)) === null, 'an open mesh is refused');
  ok(S.meshToPrism([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1], [0, 1, 2, 0, 1, 3, 1, 2, 3, 0, 2, 3]) === null, 'a tetrahedron is not a prism');
  ok(S.meshToPrism([], []) === null && S.meshToPrism([NaN, 0, 0, 1, 1, 1], [0, 1, 2]) === null, 'empty and non-finite input are refused');

  // a plate with a square hole: outer 4 × 4, hole 1 × 1 (clockwise in the cap), height 1 → area 15, volume 15
  const O = [[0, 0], [4, 0], [4, 4], [0, 4]], Hh = [[1, 1], [1, 2], [2, 2], [2, 1]];
  const pts = [...O, ...Hh], n = pts.length;
  const P = []; for (const [x, y] of pts) P.push(x, y, 0); for (const [x, y] of pts) P.push(x, y, 1);
  // cap triangles (counter-clockwise seen from +z), all 8 around the hole
  const cap = [[0, 1, 7], [0, 7, 4], [0, 4, 5], [0, 5, 3], [3, 5, 6], [3, 6, 2], [1, 2, 6], [1, 6, 7]];
  const I = [];
  for (const [a, b, c2] of cap) { I.push(a, c2, b); I.push(n + a, n + b, n + c2); }
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; I.push(i, j, n + j, i, n + j, n + i); }
  for (let i = 0; i < 4; i++) { const a = 4 + i, b = 4 + ((i + 1) % 4); I.push(a, b, n + b, a, n + b, n + a); }   // same winding as the outside: right of travel, which is into the hole for a clockwise loop
  const vol = S.meshVolume(P, I);
  const ph = S.meshToPrism(P, I);
  ok(near(vol, 15), 'plate with a hole: mesh volume 15 (' + vol + ')');
  ok(ph && ph.holes.length === 1 && near(S.prismArea(ph), 15), 'plate with a hole: one hole, area 15' + (ph ? ' (' + S.prismArea(ph) + ')' : ' (not recognised)'));

  // ---- IFC: a tessellated file becomes extrusions, same volume, saved and read back ----
  const mm = (k) => k * 1000;
  const solids = [{ name: 'L post', positions: m.positions.map(mm), indices: m.indices }, { name: 'Taper', positions: taper.positions.map(mm), indices: taper.indices }];
  const text = solidsToIfc(solids, { title: 'T' });
  const f = IfcFile.open(new TextEncoder().encode(text));
  const before = S.report(f);
  ok(before.products === 2 && before.tessellated === 2 && before.share === 0, 'before: 2 products, both tessellated, 0 % editable');
  const r = S.keepEditable(f);
  ok(r.converted === 1 && r.skipped === 1, 'keepEditable: the L became an extrusion, the tapered one stayed (' + JSON.stringify({ c: r.converted, s: r.skipped }) + ')');
  const after = S.report(f);
  ok(after.parametric === 1 && after.tessellated === 1 && after.share === 50, 'after: 1 parametric, 1 tessellated, 50 %');
  const saved = f.save();
  const g = IfcFile.open(saved);
  const rep = S.report(g);
  ok(rep.parametric === 1 && rep.tessellated === 1, 'saved and read again: the same split');
  const ex = g.ofType('IFCEXTRUDEDAREASOLID');
  ok(ex.length === 1, 'one IfcExtrudedAreaSolid in the saved file');
  const ctx = new GeoCtx(g);
  const vExt = extruded(ctx, ex[0]).volume();
  ok(near(vExt, 8e9, 1e-4), 'the extrusion reads back with the mesh volume 8e9 mm³ (' + vExt + ')');
  const t = S.solidTree(g, ex[0]);
  ok(t.kind === 'extrusion' && near(t.depth, 2000) && t.profile.shape === 'outline', 'solidTree: extrusion, depth 2000, an outline profile');
  const shapeType = g.attr(g.ofType('IFCSHAPEREPRESENTATION')[0], 'RepresentationType');
  ok(shapeType === 'SweptSolid', 'its representation type is SweptSolid');

  // edit by parameter: depth 2000 → 3000 gives volume 12e9, nothing re-meshed
  ok(S.setDepth(g, ex[0], 3000), 'setDepth accepted');
  ok(!S.setDepth(g, ex[0], -5) && !S.setDepth(g, ex[0], NaN), 'a negative or non-numeric depth is refused');
  const g2 = IfcFile.open(g.save());
  const vNew = extruded(new GeoCtx(g2), g2.ofType('IFCEXTRUDEDAREASOLID')[0]).volume();
  ok(near(vNew, 12e9, 1e-4), 'after the edit and a save: volume 12e9 (' + vNew + ')');

  // ---- an IFC written with rectangle + circle extrusions and a Boolean: classes, tree, edits ----
  const hand = `ISO-10303-21;
HEADER;FILE_DESCRIPTION(('ViewDefinition [x]'),'2;1');FILE_NAME('a.ifc','2026-10-28T00:00:00',(''),(''),'','','');FILE_SCHEMA(('IFC4'));ENDSEC;
DATA;
#1=IFCCARTESIANPOINT((0.,0.,0.));
#2=IFCAXIS2PLACEMENT3D(#1,$,$);
#3=IFCRECTANGLEPROFILEDEF(.AREA.,$,$,200.,100.);
#4=IFCDIRECTION((0.,0.,1.));
#5=IFCEXTRUDEDAREASOLID(#3,#2,#4,3000.);
#6=IFCCIRCLEPROFILEDEF(.AREA.,$,$,30.);
#7=IFCEXTRUDEDAREASOLID(#6,#2,#4,500.);
#8=IFCBOOLEANRESULT(.DIFFERENCE.,#5,#7);
#9=IFCCSGSOLID(#8);
#10=IFCSHAPEREPRESENTATION($,'Body','CSG',(#9));
#11=IFCPRODUCTDEFINITIONSHAPE($,$,(#10));
#12=IFCLOCALPLACEMENT($,#2);
#13=IFCWALL('0000000000000000000001',$,'W',$,$,#12,#11,$,$);
#20=IFCTRIANGULATEDFACESET($,$,$,((1,2,3)),$);
#21=IFCSHAPEREPRESENTATION($,'Body','Tessellation',(#20));
#22=IFCPRODUCTDEFINITIONSHAPE($,$,(#21));
#23=IFCSLAB('0000000000000000000002',$,'S',$,$,#12,#22,$,$);
#30=IFCBOOLEANRESULT(.DIFFERENCE.,#5,#20);
#31=IFCSHAPEREPRESENTATION($,'Body','CSG',(#30));
#32=IFCPRODUCTDEFINITIONSHAPE($,$,(#31));
#33=IFCBEAM('0000000000000000000003',$,'B',$,$,#12,#32,$,$);
ENDSEC;
END-ISO-10303-21;`;
  const h = IfcFile.open(new TextEncoder().encode(hand));
  const hr = S.report(h);
  ok(hr.products === 3 && hr.parametric === 1 && hr.tessellated === 1 && hr.mixed === 0 && hr.other === 1, 'report: wall parametric, slab tessellated, a Boolean with a face set is neither (' + JSON.stringify([hr.parametric, hr.tessellated, hr.mixed, hr.other]) + ')');
  const tr = S.solidTree(h, 9);
  ok(tr.kind === 'csg' && tr.root.kind === 'boolean' && tr.root.operator === 'DIFFERENCE', 'solidTree: CSG solid holding a DIFFERENCE');
  ok(tr.root.a.profile.shape === 'rectangle' && tr.root.a.profile.xDim === 200 && tr.root.b.profile.radius === 30, 'its operands: a 200 × 100 rectangle post and a circle of radius 30');
  ok(S.leaves(tr) === 2, 'two parametric leaves');
  ok(S.setBooleanOperator(h, 8, 'UNION') && S.solidTree(h, 8).operator === 'UNION', 'the Boolean turns into a UNION');
  ok(!S.setBooleanOperator(h, 8, 'XOR') && !S.setBooleanOperator(h, 5, 'UNION'), 'an unknown operator, or a non-Boolean, is refused');
  ok(S.setProfileSize(h, 5, { xDim: 250, yDim: 120 }) && S.solidTree(h, 5).profile.xDim === 250, 'the rectangle profile is resized');
  ok(S.setProfileSize(h, 7, { radius: 45 }) && S.solidTree(h, 7).profile.radius === 45, 'the circle profile is resized');
  ok(!S.setProfileSize(h, 7, { radius: -1 }), 'a negative radius is refused');
  const h2 = IfcFile.open(h.save());
  ok(S.solidTree(h2, 9).root.operator === 'UNION' && S.solidTree(h2, 5).depth === 3000, 'the edits survive a save');

  // ---- OBJ import keeps a box as an extrusion (STEP shares the writer) ----
  const { objToIfc } = await import(path.join(APP, 'obj-ifc.js'));
  const obj = 'o Box\nv 0 0 0\nv 2 0 0\nv 2 0 1\nv 0 0 1\nv 0 3 0\nv 2 3 0\nv 2 3 1\nv 0 3 1\n' +
    'f 1 3 2\nf 1 4 3\nf 5 6 7\nf 5 7 8\nf 1 2 6\nf 1 6 5\nf 2 3 7\nf 2 7 6\nf 3 4 8\nf 3 8 7\nf 4 1 5\nf 4 5 8\n';
  const objOut = obj.replace(/^f (\d+) (\d+) (\d+)$/gm, 'f $1 $3 $2');   // the faces above are written inward; flipped here they face out
  const ro = objToIfc(objOut, { name: 'Box' });
  ok(ro.prisms === 1 && /IFCEXTRUDEDAREASOLID/.test(ro.text) && !/IFCTRIANGULATEDFACESET/.test(ro.text), 'OBJ box: one extrusion, no face set (prisms ' + ro.prisms + ')');
  const fo = IfcFile.open(new TextEncoder().encode(ro.text));
  const eo = fo.ofType('IFCEXTRUDEDAREASOLID')[0];
  ok(eo && near(extruded(new GeoCtx(fo), eo).volume(), 2 * 3 * 1 * 1e9, 1e-4), 'its volume reads back as 2 × 3 × 1 m = 6e9 mm³');
  const rt = objToIfc(objOut, { name: 'Box', parametric: false });
  ok(rt.prisms === 0 && /IFCTRIANGULATEDFACESET/.test(rt.text), 'parametric: false keeps the face set (the old output)');
  ok(objToIfc(obj, { name: 'Inward' }).prisms === 0, 'a box whose faces point inward is not turned into an extrusion');
  // ---- IFC 4.3 entities in BimCraft (SU.882): a road with a part and a bearing built from an extrusion opens in the tree ----
  if (WebIFC && IfcModel) {
    const T = await import(path.join(APP, 'ifc-tree.js'));
    const ifc43 = `ISO-10303-21;
HEADER;FILE_DESCRIPTION(('ViewDefinition [ReferenceView]'),'2;1');FILE_NAME('road.ifc','2026-10-28T00:00:00',(''),(''),'','','');FILE_SCHEMA(('IFC4X3_ADD2'));ENDSEC;
DATA;
#1=IFCCARTESIANPOINT((0.,0.,0.));
#2=IFCAXIS2PLACEMENT3D(#1,$,$);
#3=IFCDIRECTION((0.,0.,1.));
#4=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#2,$);
#5=IFCUNITASSIGNMENT((#6));
#6=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);
#7=IFCPROJECT('0000000000000000000010',$,'Road',$,$,$,$,(#4),#5);
#8=IFCLOCALPLACEMENT($,#2);
#9=IFCSITE('0000000000000000000011',$,'Site',$,$,#8,$,$,.ELEMENT.,$,$,$,$,$);
#10=IFCROAD('0000000000000000000012',$,'Main road',$,$,#8,$,$);
#11=IFCROADPART('0000000000000000000013',$,'Carriageway',$,$,#8,$,$,.ELEMENT.,.ROADSEGMENT.);
#12=IFCRELAGGREGATES('0000000000000000000014',$,$,$,#7,(#9));
#13=IFCRELAGGREGATES('0000000000000000000015',$,$,$,#9,(#10));
#14=IFCRELAGGREGATES('0000000000000000000016',$,$,$,#10,(#11));
#20=IFCRECTANGLEPROFILEDEF(.AREA.,$,$,500.,300.);
#21=IFCEXTRUDEDAREASOLID(#20,#2,#3,2000.);
#22=IFCSHAPEREPRESENTATION(#4,'Body','SweptSolid',(#21));
#23=IFCPRODUCTDEFINITIONSHAPE($,$,(#22));
#24=IFCBEARING('0000000000000000000017',$,'B1',$,$,#8,#23,$,.ELASTOMERIC.);
#25=IFCRELCONTAINEDINSPATIALSTRUCTURE('0000000000000000000018',$,$,$,(#24),#11);
ENDSEC;
END-ISO-10303-21;`;
    try {
      const em = await IfcModel.create(WebIFC, null);
      const m4 = await em.load(new TextEncoder().encode(ifc43), () => {});
      const tr = T.buildTree(m4, { className: (id) => em.className(id) });
      const chain = []; for (let n = tr.root; n; n = n.kids.find((k) => k.kind === 'spatial')) chain.push(n.cls);
      ok(chain.join(' > ') === 'IfcProject > IfcSite > IfcRoad > IfcRoadPart', 'IFC 4.3: the tree reads Project > Site > Road > RoadPart (' + chain.join(' > ') + ')');
      const part = (function find(n) { return n.cls === 'IfcRoadPart' ? n : n.kids.map(find).find(Boolean); })(tr.root);
      ok(part && part.size === 1, 'the bearing (a 4.3 class) sits under the road part and carries geometry');
      em.close?.();
    } catch (e) { ok(false, 'IFC 4.3 file opened in BimCraft: ' + (e && e.message)); }
  }

  console.log(good + ' passed, ' + bad + ' failed');
  return bad ? 1 : 0;
}

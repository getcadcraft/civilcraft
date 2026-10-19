/* SPDX-License-Identifier: Apache-2.0 */
/**
 * comforts-test.mjs — BimCraft's drawing comforts (0.6 round 2, DC.58 gap, session `bim-comforts_PART_2`), DOM-free, run by
 *   node bin/test-bimcraft.mjs --comforts [--only 1,2,3,4,5,6,7]
 *   1   curved walls (model-arcs.js, model-walls.js): geometry, joins, rooms, IFC (IfcTrimmedCurve axis, IfcIndexedPolyCurve
 *       profile with IfcArcIndex), cc-ifc volumes, a door in a curved wall, bending, IFC2X3, one undo step each
 *   2   wall justification (location line): kept when the wall gets thicker or flips, corners meet again
 *   3   moving placed library items (model-move.js): one undo step, rotation, the storey's own axes
 *   4   dormers (res-dormer.js): gable and shed on a roof face, the cut in the roof, following the roof
 *   5   spiral stairs (res-stair.js kind 'spiral'): treads, post, railing, checks
 *   6   interior elevations (comforts-views.js): a room's four walls
 *   7   dimensions and tags on elevations and sections
 * Saved files are checked by IfcOpenShell at the end when a venv with it is here (tools/bimcraft-test/ifc_validate.py), and
 * opened by web-ifc (the oracle, test-only) when it is installed.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export async function comfortsMode({ APP, ROOT, WebIFC, IfcModel, quiet, require, args = [] }) {
  const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? new Set(String(args[i + 1] || '').split(',')) : null; })();
  const want = (k) => !only || only.has(String(k));
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const saved = {};
  const dec = (b) => new TextDecoder().decode(b);
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const MA = await import(path.join(APP, 'model-arcs.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  async function building({ n = 2, h = 3000 } = {}) {
    const N = await import(path.join(APP, 'new-model.js'));
    const text = N.newBuilding({ name: 'Comforts', levels: N.stackLevels(n, h, (i) => 'Level ' + (i + 1)), fileName: 'c.ifc', now: new Date('2026-10-18T12:00:00Z') });
    return editorFor(new TextEncoder().encode(text));
  }
  async function editorFor(bytes) {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(bytes);
    const ed = new IfcEditor(WebIFC, eng);
    return { ed, eng, levels: OPS.snapshotModel(ed).levels, w: () => new ModelWriter(WebIFC, ed.api, ed.mid) };
  }
  async function reopenModel(bytes) {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    return quiet((b) => eng.load(b))(bytes);
  }
  /** Volume of the closed meshes of one class (or of the keys given) in a load result, m³. */
  function volumeOf(m, pick) {
    let v = 0;
    for (const b of m.batches) {
      if (b.space) continue;
      const P = b.positions, I = b.indices;
      for (let i = 0; i < I.length; i += 3) {
        const id = b.triIds[i / 3] - (m.keyBase || 0);
        if (!pick(id, m.classOf.get(id))) continue;
        const a = I[i] * 3, c = I[i + 1] * 3, d = I[i + 2] * 3;
        v += (P[a] * (P[c + 1] * P[d + 2] - P[c + 2] * P[d + 1]) - P[a + 1] * (P[c] * P[d + 2] - P[c + 2] * P[d]) + P[a + 2] * (P[c] * P[d + 1] - P[c + 1] * P[d])) / 6;
      }
    }
    return Math.abs(v);
  }
  const lastChange = (ed) => ed.changes[ed.changes.length - 1];
  const { ids: idsOf } = await import(path.join(APP, 'ifc-util.js'));
  const ids = (w, cls) => idsOf(w.api, w.mid, cls);

  // ============================================================================================ 1 curved walls
  if (want(1)) {
    console.log('== 1 Curved walls: geometry');
    {
      const k = MA.arcOf([4000, 0], [0, 0], 1);
      ok(k && near(k.C[0], 2000) && near(k.C[1], 0) && near(k.R, 2000) && near(k.theta, Math.PI) && near(k.mid[1], 2000), 'a half circle from (4000, 0) to (0, 0), bulge 1: centre (2000, 0), radius 2000, through (2000, 2000)');
      const q = MA.arcOf([0, 0], [4000, 0], -Math.tan(Math.PI / 8));
      ok(q && near(q.theta, -Math.PI / 2) && near(q.R, 4000 / Math.SQRT2) && q.C[1] < 0 && q.mid[1] > 0 && near(q.len, q.R * Math.PI / 2), 'a quarter turn clockwise: θ = −90°, R = chord / √2, the centre on the right of travel (below), bowing up, length R·π/2');
      ok(near(MA.bulgeThrough([4000, 0], [2000, 2000], [0, 0]), 1, 1e-9) && near(MA.bulgeThrough([0, 0], [2000, -500], [4000, 0]), 0.25, 1e-9) && MA.bulgeThrough([0, 0], [1, 0], [2, 0]) === 0, 'bulgeThrough: the half circle (1), a flat arc bowing down (0.25), three points in a line (0)');
      ok(near(MA.arcHeight([0, 0], [4000, 0], MA.bulgeFromHeight([0, 0], [4000, 0], 600)), 600, 1e-9) && MA.bulgeFromHeight([0, 0], [4000, 0], 600) < 0, 'arc height 600 (to the left) ↔ bulge −0.3 and back');
      const g = MA.wallGeom({ a: [4000, 0], b: [0, 0], bulge: 1 });
      const p = g.param([2000, 2100]);
      ok(near(g.L, 2000 * Math.PI) && near(p.s, 1000 * Math.PI) && near(p.off, -100) && near(g.at(p.s, p.off)[1], 2100), 'wallGeom: along the arc (s = R·angle) and off it (− = outside an anticlockwise arc), and back');
      ok(near(MA.chordFor(MA.arcLength([0, 0], [4000, 0], 0.5), 0.5), 4000, 1e-6), 'chord ↔ arc length for the same turn');
      ok(MA.flatPoly([[0, 0, 1], [4000, 0], [4000, -10]]).length > 40, 'a bulged polygon flattens to chords of at most 4°');
    }
    console.log('== 1 Curved walls: joins and rooms');
    {
      // a half-round room: a straight wall (0,0)→(4000,0), a half circle back over the top
      const o = MW.wallOutlines([{ key: 's', a: [0, 0], b: [4000, 0], t: 200 }, { key: 'c', a: [4000, 0], b: [0, 0], t: 200, bulge: 1 }]);
      const s = o.get('s'), c = o.get('c'), cb = c.bulged;
      const onCircle = (q, r) => near(Math.hypot(q[0] - 2000, q[1]), r, 0.01);
      ok(cb && cb.length === 4 && onCircle(cb[0], 2100) && onCircle(cb[1], 2100) && onCircle(cb[2], 1900) && onCircle(cb[3], 1900), 'the curved wall\'s corners sit on its faces (radius 2100 outside, 1900 inside)');
      ok(near(cb[0][1], -100) && near(cb[0][0], 2000 + Math.sqrt(2100 ** 2 - 100 ** 2), 0.01) && s.some((q) => near(q[0], cb[0][0], 0.001) && near(q[1], -100)), 'the outer corner: where the straight wall\'s outside face (y = −100) meets the curved outside face — both walls share it');
      const sweep = ((Math.atan2(cb[1][1], cb[1][0] - 2000) - Math.atan2(cb[0][1], cb[0][0] - 2000)) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      ok(near(cb[0][2], Math.tan(sweep / 4), 1e-9) && cb[2][2] < 0, 'the faces are arc edges: the outside one anticlockwise (bulge = tan(sweep / 4)), the inside one back the other way');
      const { planLoops } = await import(path.join(APP, 'model-rooms.js'));
      const L = planLoops([...o.values()]);
      const r = 1900, seg = r * r * Math.acos(100 / r) - 100 * Math.sqrt(r * r - 100 * 100);   // the circle's segment above y = 100
      ok(L.rooms.length === 1 && near(L.rooms[0].area, seg, seg * 0.002), 'one room inside: the half disc above the straight wall\'s face, ' + (L.rooms[0]?.area / 1e6).toFixed(3) + ' m² (exact ' + (seg / 1e6).toFixed(3) + ')');
      // a T against a curved wall's side: the stem stops at the inside face
      const o2 = MW.wallOutlines([{ key: 'c', a: [4000, 0], b: [0, 0], t: 200, bulge: 1 }, { key: 't', a: [2000, 500], b: [2000, 2000], t: 100 }]);
      const st = o2.get('t');
      ok(st.some((q) => near(Math.hypot(q[0] - 2000, q[1]), 1900, 0.5)) && Math.max(...st.map((q) => q[1])) < 1900.5, 'a wall ending on a curved wall\'s side: a T, it stops at the inside face');
    }
    console.log('== 1 Curved walls: in a building, IFC, 3D');
    {
      const B = await building();
      const { ed, levels } = B;
      const [L1, L2] = levels;
      let n0 = ed.changes.length;
      ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [6000, 0] }, { a: [6000, 0], b: [0, 0], bulge: 1 }], typeKey: 'int-2x4', topLevel: L2.guid }), { label: 'Curved room' });
      let snap = OPS.snapshotModel(ed);
      const cw = snap.walls.find((x) => x.bulge);
      const th = MW.typeThickness(MW.wallType('int-2x4'));
      ok(ed.changes.length === n0 + 1 && snap.walls.length === 2 && cw && near(cw.bulge, 1, 1e-9), 'a straight wall and a half-round one: one undo step; the curve read back (Bulge 1)');
      ok(cw && near(cw.len, 3000 * Math.PI, 0.01) && near(cw.a[0], 6000) && near(cw.b[0], 0, 0.01) && near(cw.b[1], 0, 0.01), 'its Length runs along the arc (3000·π = ' + cw?.len.toFixed(1) + ' mm); its end is the chord away (0, 0)');
      const txt = dec(ed.save());
      ok(/IFCTRIMMEDCURVE\(#\d+,\(#\d+\),\(#\d+\),\.T\.,\.CARTESIAN\.\)/.test(txt) && /IFCCIRCLE\(#\d+,3000\.?\)/.test(txt), 'Axis: an IfcTrimmedCurve of an IfcCircle (radius 3000), trimmed by its ends, anticlockwise (SenseAgreement .T.)');
      ok(/IFCINDEXEDPOLYCURVE\(#\d+,\(IFCARCINDEX\(\(\d+,\d+,\d+\)\),IFCLINEINDEX/.test(txt) && (txt.match(/IFCARCINDEX/g) || []).length === 2, 'Body: an IfcIndexedPolyCurve profile with two IfcArcIndex edges (the faces)', (txt.match(/IFCINDEXEDPOLYCURVE[^;]*/) || [''])[0]);
      ok(/'Bulge',\$,IFCREAL\(1\.?\)/.test(txt) && !/'Justification'/.test(txt), 'CadCraft_Wall Bulge 1; a centre-line wall writes no Justification');
      const q = [...txt.matchAll(/IFCQUANTITYLENGTH\('Length',\$,\$,([-\d.E+]+)/g)].map((m) => Number(m[1]));
      ok(q.some((v) => near(v, 3000 * Math.PI, 0.01)), 'Qto_WallBaseQuantities Length = the arc length');
      const m = await reopenModel(ed.save());
      const curvedId = cw.id;
      const vol = volumeOf(m, (id) => id === curvedId);
      // the curved wall alone: the half annulus from 3000 − t/2 to 3000 + t/2, less what the straight wall's corners take
      const ring = Math.PI / 2 * ((3000 + th / 2) ** 2 - (3000 - th / 2) ** 2) * 3000 / 1e9;
      ok(m.types.find((x) => x.name === 'IfcWall')?.count === 2 && near(vol, ring, ring * 0.02), 'cc-ifc builds the curved wall: ' + vol.toFixed(4) + ' m³ against the half annulus ' + ring.toFixed(4) + ' m³ (within 2 %: the mitred corners)');
      // nothing is rewritten when nothing changed (the stored arc shape compares equal)
      const w = B.w();
      const before = dec(ed.save());
      const r0 = w.run((ww) => ({ n: MW.regenWalls(ww, L1.id).walls }));
      ok(r0.n === 0 && dec(ed.save()) === before, 'regenWalls again: 0 walls rewritten (the stored IfcIndexedPolyCurve and IfcTrimmedCurve read back as the same shape)');
      // bend it, flatten it, undo
      n0 = ed.changes.length;
      ed.modelChange(OPS.changeWall(cw.guid, { bulge: MA.bulgeFromHeight(cw.a, cw.b, -1500) }));
      snap = OPS.snapshotModel(ed);
      let c2 = snap.walls.find((x) => x.guid === cw.guid);
      ok(ed.changes.length === n0 + 1 && near(MA.arcHeight(c2.a, c2.b, c2.bulge), -1500, 0.01) && near(c2.b[0], 0, 0.01), 'arc height 1500 (Properties): one step, the ends stay, the curve flatter', JSON.stringify({ h: MA.arcHeight(c2.a, c2.b, c2.bulge), b: c2.b }));
      ed.modelChange(OPS.changeWall(cw.guid, { bulge: 0 }));
      c2 = OPS.snapshotModel(ed).walls.find((x) => x.guid === cw.guid);
      const t0 = dec(ed.save());
      ok(c2.bulge === 0 && near(c2.len, 6000, 0.01) && !/IFCTRIMMEDCURVE/.test(t0) && /'Bulge',\$,IFCREAL\(0\.?\)/.test(t0), 'arc height 0: a straight wall again (an IfcPolyline axis, Bulge 0, Length 6000)');
      ed.undo(); ed.undo();
      c2 = OPS.snapshotModel(ed).walls.find((x) => x.guid === cw.guid);
      ok(near(c2.bulge, 1, 1e-9) && near(c2.len, 3000 * Math.PI, 0.01), 'two undos: the half circle back');
      ed.redo();
      c2 = OPS.snapshotModel(ed).walls.find((x) => x.guid === cw.guid);
      ok(near(MA.arcHeight(c2.a, c2.b, c2.bulge), -1500, 0.01), 'redo: the flatter curve again (the same GlobalId)');
      ed.undo();
      // moving an end keeps the turn
      ed.modelChange(OPS.changeWall(cw.guid, { b: [-1000, 0] }));
      c2 = OPS.snapshotModel(ed).walls.find((x) => x.guid === cw.guid);
      ok(near(c2.bulge, 1, 1e-9) && near(c2.len, 3500 * Math.PI, 0.01) && near(c2.b[0], -1000, 0.01), 'its end dragged out 1000: still a half circle, now 3500·π long');
      ed.undo();
      // too tight a turn: refused, nothing changes
      n0 = ed.changes.length;
      let why = '';
      try { ed.modelChange(OPS.changeWall(cw.guid, { bulge: 5 })); } catch (e) { why = e.key; }
      ok(why === 'comforts.err.arc' && ed.changes.length === n0, 'more than three quarters of a circle: refused (comforts.err.arc), no step');
      // a door in the curved wall
      ed.modelChange(OPS.placeOpening({ wall: cw.guid, typeKey: 'door-single', offset: 3000, width: 900 }), { label: 'Door' });
      snap = OPS.snapshotModel(ed);
      const door = snap.openings[0];
      ok(snap.openings.length === 1 && near(door.offset, 3000, 0.01), 'a door 3000 along the curved wall: its offset reads back along the arc (' + door?.offset.toFixed(2) + ')');
      const { openingSymbol } = await import(path.join(APP, 'model-openings.js'));
      const sym = openingSymbol(door, snap.walls.find((x) => x.guid === cw.guid));
      const g = MA.wallGeom(cw);
      const j0 = sym.lines[0];   // the near jamb: across the wall along the radius
      ok(near(Math.hypot(j0[0] - 3000, j0[1]), 3000 + th / 2, 0.5) && near(Math.hypot(j0[2] - 3000, j0[3]), 3000 - th / 2, 0.5) && near(Math.hypot(j0[0] - g.at(3000, -th / 2)[0], j0[1] - g.at(3000, -th / 2)[1]), 0, 0.5), 'the plan symbol: its jambs run along the radius, from face to face of the curved wall');
      const { wallPieces } = await import(path.join(APP, 'model-plan.js'));
      const outl = MW.wallOutlines(snap.walls.map((x) => ({ key: x.guid, a: x.a, b: x.b, t: x.t, bulge: x.bulge })));
      const pcs = wallPieces(snap.walls.find((x) => x.guid === cw.guid), outl.get(cw.guid), snap.openings, 1200);
      ok(pcs.length === 2, 'the plan cuts the curved wall in two at the door (' + pcs.length + ' pieces)');
      const t2 = dec(ed.save());
      ok(/IFCOPENINGELEMENT\(/.test(t2) && /IFCRELVOIDSELEMENT\(/.test(t2), 'IFC: the opening voids the curved wall');
      const m2 = await reopenModel(ed.save());
      const v2 = volumeOf(m2, (id) => id === curvedId);
      const doorV = 900 * th * 2032 / 1e9;
      ok(near(vol - v2, doorV, doorV * 0.05), 'cc-ifc cuts the door out of the curved wall: ' + ((vol - v2) * 1000).toFixed(1) + ' l less, the opening is ' + (doorV * 1000).toFixed(1) + ' l');
      saved.curved = ed.save();
      // web-ifc (oracle): it reads the same file
      try {
        const W = require('web-ifc');
        const a = new W.IfcAPI(); await quiet(() => a.Init())();
        const id = a.OpenModel(saved.curved);
        let tris = 0;
        a.StreamAllMeshes(id, (mesh) => { if (mesh.expressID !== curvedId) return; for (let i = 0; i < mesh.geometries.size(); i++) { const gg = a.GetGeometry(id, mesh.geometries.get(i).geometryExpressID); tris += gg.GetIndexDataSize() / 3; gg.delete(); } });
        ok(tris > 40, 'web-ifc (oracle) builds the curved wall too (' + tris + ' triangles)');
      } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped'); }
    }
    {
      console.log('== 1 Curved walls: what follows the walls');
      const B = await building();
      const { ed, levels } = B;
      ed.modelChange(OPS.drawWalls({ storey: levels[0].guid, segs: [{ a: [0, 0], b: [6000, 0] }, { a: [6000, 0], b: [6000, 4000] }, { a: [6000, 4000], b: [0, 4000], bulge: 0.3 }, { a: [0, 4000], b: [0, 0] }], typeKey: 'ext-2x6', topLevel: levels[1].guid }));
      const snap = OPS.snapshotModel(ed);
      ok(snap.derived.spaces.length === 1, 'a room with one curved side gets its space (IfcSpace) like any other');
      const t0 = Date.now();
      let why = '';
      try { ed.modelChange(OPS.placeRoof({ storey: levels[0].guid, seed: [3000, 2000], pitch: 30, overhang: 300, edges: '' })); } catch (e) { why = e.key || e.message; }
      const dt = Date.now() - t0;
      ok(dt < 20000 && (why === '' ? OPS.snapshotModel(ed).derived.roofs.length === 1 : /^(model|res)\./.test(why)), 'a roof over it: made over the curve\'s chords, or a plain refusal (' + (why || 'made') + ', ' + dt + ' ms)');
      const { trimPlan, cornerPlan } = await import(path.join(APP, 'model-trim.js'));
      const cw = snap.walls.find((x) => x.bulge), sw = snap.walls.find((x) => !x.bulge);
      ok(trimPlan(cw, sw, [0, 0]).error === 'comforts.err.curvedtrim' && cornerPlan(sw, [0, 0], cw, [0, 0]).error === 'comforts.err.curvedtrim', 'Trim / extend and Corner refuse a curved wall (not built yet), with their own message');
      const { frameWall } = await import(path.join(APP, 'res-framing.js'));
      ok(frameWall(cw, { walls: snap.walls, openings: [] }).error === 'comforts.err.curvedframe', 'framing refuses a curved wall (not built yet), with its own message');
    }
    {
      console.log('== 1 Curved walls: an IFC2X3 file');
      const F = await editorFor(fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures', 'ios-steel-ifc2x3.ifc')));
      F.ed.modelChange(OPS.drawWalls({ storey: F.levels[0].guid, segs: [{ a: [0, 0], b: [5000, 0], bulge: 0.4 }], typeKey: 'ext-2x6', height: 3000 }));
      const t3 = dec(F.ed.save());
      const wl = OPS.snapshotModel(F.ed).walls[0];
      ok(wl && near(wl.bulge, 0.4, 1e-9) && /IFCTRIMMEDCURVE\(/.test(t3) && !/IFCINDEXEDPOLYCURVE/.test(t3), 'IFC2X3: the curved wall\'s axis an IfcTrimmedCurve, its profile an IfcPolyline of chords (2X3 has no IfcIndexedPolyCurve)');
      saved.x3 = F.ed.save();
    }
  }

  // ============================================================================================ 2 wall justification
  if (want(2)) {
    console.log('== 2 Wall justification (the location line)');
    ok(MW.locationOffset('center', 200, 'left') === 0 && MW.locationOffset('exterior', 200, 'left') === 100 && MW.locationOffset('exterior', 200, 'right') === -100 && MW.locationOffset('interior', 200, 'left') === -100 && MW.locationOffset('left', 200, 'right') === 100 && MW.locationOffset('right', 200, 'left') === -100, 'locationOffset: centre 0, the outside face on its side, the inside face opposite, left / right faces');
    const B = await building();
    const { ed, levels } = B;
    const [L1, L2] = levels;
    const t4 = MW.typeThickness(MW.wallType('ext-2x4')), t6 = MW.typeThickness(MW.wallType('ext-2x6'));
    // an L drawn on its outside face: the walls' centre lines lie inside by half their thickness
    ed.modelChange(OPS.drawWallPath({ storey: L1.guid, points: [[0, 0], [8000, 0], [8000, 6000]], guids: [], typeKey: 'ext-2x4', thickness: t4, reference: 'outside', extSide: 'right', justification: 'exterior', topLevel: L2.guid }), { label: 'L' });
    let W = OPS.snapshotModel(ed).walls;
    const [A, Bw] = W;
    ok(W.length === 2 && W.every((x) => x.justification === 'exterior') && /'Justification',\$,IFCLABEL\('exterior'\)/.test(dec(ed.save())), 'drawn on the outside face: both walls keep Justification exterior (CadCraft_Wall)');
    const llA = MW.locationLine(A);
    ok(near(llA.a[1], 0, 0.01) && near(llA.b[1], 0, 0.01) && near(A.a[1], t4 / 2, 0.01), 'the location line is the drawn line (y = 0); the centre line is half a thickness inside', JSON.stringify({ ll: llA, a: A.a }));
    // thicker: the outside face stays where it was drawn, the wall grows inward; the corner still meets
    let n0 = ed.changes.length;
    ed.modelChange(OPS.changeWall(A.guid, { typeKey: 'ext-2x6' }), { label: 'Thicker' });
    W = OPS.snapshotModel(ed).walls;
    let A2 = W.find((x) => x.guid === A.guid), B2 = W.find((x) => x.guid === Bw.guid);
    const ll2 = MW.locationLine(A2);
    ok(ed.changes.length === n0 + 1 && near(A2.t, t6) && near(ll2.a[1], 0, 0.01) && near(ll2.b[1], 0, 0.01) && near(A2.a[1], t6 / 2, 0.01), 'a thicker type: one step; the outside face stays on y = 0, the centre line moves in to ' + A2.a[1].toFixed(2));
    ok(near(Math.hypot(A2.b[0] - B2.a[0], A2.b[1] - B2.a[1]), 0, 0.01) && near(B2.a[0], 8000 - t4 / 2, 0.01) && near(A2.b[1], t6 / 2, 0.01), 'the corner: the other wall\'s end moved along its own line to meet the new centre line (still one node)');
    const outl = MW.wallOutlines(W.map((x) => ({ key: x.guid, a: x.a, b: x.b, t: x.t })));
    const oA = outl.get(A.guid);
    ok(oA.some((q) => near(q[0], 8000, 0.01) && near(q[1], 0, 0.01)), 'the outside corner is still (8000, 0): the mitre joins as before');
    // flipping the outside: the exterior face stays put, the wall goes to the other side of it
    ed.modelChange(OPS.changeWall(A.guid, { extSide: 'left' }), { label: 'Flip' });
    A2 = OPS.snapshotModel(ed).walls.find((x) => x.guid === A.guid);
    ok(near(MW.locationLine(A2).a[1], 0, 0.01) && near(A2.a[1], -t6 / 2, 0.01) && A2.extSide === 'left', 'flip the outside: the outside face stays on y = 0, the wall flips across it');
    ed.undo();
    // changing the location line itself moves nothing
    const before = OPS.snapshotModel(ed).walls.find((x) => x.guid === A.guid);
    ed.modelChange(OPS.changeWall(A.guid, { justification: 'interior' }));
    A2 = OPS.snapshotModel(ed).walls.find((x) => x.guid === A.guid);
    ok(A2.justification === 'interior' && near(A2.a[0], before.a[0], 1e-6) && near(A2.a[1], before.a[1], 1e-6) && near(A2.b[0], before.b[0], 1e-6), 'Location line › Inside face: the wall stays where it is; only the line it keeps changes');
    ed.modelChange(OPS.changeWall(A.guid, { typeKey: 'ext-2x4' }));
    A2 = OPS.snapshotModel(ed).walls.find((x) => x.guid === A.guid);
    ok(near(MW.locationLine(A2).a[1], before.a[1] + t6 / 2, 0.01), 'then thinner: the inside face stays put now (y = ' + MW.locationLine(A2).a[1].toFixed(2) + ')');
    // several walls at once
    ed.modelChange(OPS.changeWalls([A.guid, Bw.guid], { justification: 'center' }));
    ok(OPS.snapshotModel(ed).walls.every((x) => x.justification === 'center'), 'several walls: Location line › Center line for all of them in one step');
    // a curved wall on its outside face: concentric
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 10000], b: [6000, 10000], bulge: 0.5, justification: 'left' }], typeKey: 'int-2x4', height: 2400 }));
    const cw = OPS.snapshotModel(ed).walls.find((x) => x.bulge);
    const k0 = MA.arcOf(cw.a, cw.b, cw.bulge);
    ed.modelChange(OPS.changeWall(cw.guid, { typeKey: 'int-2x6' }));
    const cw2 = OPS.snapshotModel(ed).walls.find((x) => x.guid === cw.guid), k1 = MA.arcOf(cw2.a, cw2.b, cw2.bulge);
    const tA = MW.typeThickness(MW.wallType('int-2x4')), tB = MW.typeThickness(MW.wallType('int-2x6'));
    ok(near(k1.C[0], k0.C[0], 0.01) && near(k1.C[1], k0.C[1], 0.01) && near(k1.R - k1.sg * tB / 2, k0.R - k0.sg * tA / 2, 0.01), 'a curved wall kept on its left face gets thicker: the same centre, the left face at the same radius');
    saved.just = ed.save();
  }

  // ============================================================================================ 3 moving library items
  if (want(3)) {
    console.log('== 3 Moving and turning placed library items');
    const MV = await import(path.join(APP, 'model-move.js'));
    const B = await building();
    const { ed, levels } = B;
    const [L1, L2] = levels;
    const item = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/library/seed/range.item.json'), 'utf8'));
    const r1 = ed.placeItem(item, { storey: L1.id, x: 3000, y: 2000, rot: 0, itemNumber: '7', quantity: 1 });
    const r2 = ed.placeItem(item, { storey: L2.id, x: 1000, y: 1000, rot: 0, itemNumber: '8', quantity: 1 });
    let P = MV.placedItems(B.w());
    const p1 = P.find((x) => x.id === r1.id), p2 = P.find((x) => x.id === r2.id);
    ok(P.length === 2 && near(p1.x, 3000) && near(p1.y, 2000) && near(p1.rot, 0) && p1.storey === L1.id && near(p2.z, 0), 'placedItems: both placed items, in their storey\'s plan (3000, 2000), turned 0°, z 0 on its level');
    const pl0 = B.w().placements().find((x) => x.id === p1.id);
    let n0 = ed.changes.length;
    ed.modelChange(MV.moveItems([{ guid: p1.guid, x: 5000, y: 1000 }]), { label: p1.name, verb: 'Moved' });
    P = MV.placedItems(B.w());
    let q1 = P.find((x) => x.guid === p1.guid);
    ok(ed.changes.length === n0 + 1 && lastChange(ed).kind === 'model' && near(q1.x, 5000) && near(q1.y, 1000) && near(q1.rot, 0), 'moved to (5000, 1000): one undo step, a model change (it travels in Live)');
    const pl = B.w().placements().find((x) => x.id === q1.id);
    ok(pl && pl.itemNumber === '7' && pl.typeId === pl0.typeId && pl.sha256 === pl0.sha256 && pl.name === pl0.name && near(pl.x, 5000), 'the item keeps its number (7), its library data and its type; IfcPlacer reads the new spot too');
    ed.modelChange(MV.moveItems([{ guid: p1.guid, drot: 90 }]), { label: p1.name, verb: 'Turned' });
    q1 = MV.placedItems(B.w()).find((x) => x.guid === p1.guid);
    ok(near(q1.rot, 90) && near(q1.x, 5000), 'R (turn 90°): turned about its insertion point, which stays');
    const m = await reopenModel(ed.save());
    let bb = null;
    for (const b of m.batches) for (let i = 0; i < b.indices.length; i++) {
      if (b.triIds[Math.floor(i / 3)] - (m.keyBase || 0) !== q1.id) continue;
      const v = b.indices[i] * 3, x = b.positions[v] * 1000, z = -b.positions[v + 2] * 1000;   // viewer Y up: plan y = −z
      bb = bb ? [Math.min(bb[0], x), Math.min(bb[1], z), Math.max(bb[2], x), Math.max(bb[3], z)] : [x, z, x, z];
    }
    const w0 = item.body.w || item.params?.width_mm || 0, d0 = item.body.d || item.params?.depth_mm || 0;
    ok(bb && near(bb[2] - bb[0], d0, 2) && near(bb[3] - bb[1], w0, 2), 'reopened: the turned item\'s footprint is ' + (bb ? Math.round(bb[2] - bb[0]) + ' × ' + Math.round(bb[3] - bb[1]) : '?') + ' (depth × width, turned)', JSON.stringify({ bb, w0, d0 }));
    ed.undo();
    q1 = MV.placedItems(B.w()).find((x) => x.guid === p1.guid);
    ok(near(q1.rot, 0) && near(q1.x, 5000), 'undo: not turned');
    ed.undo();
    q1 = MV.placedItems(B.w()).find((x) => x.guid === p1.guid);
    ok(near(q1.x, 3000) && near(q1.y, 2000), 'undo again: back where it was placed');
    ed.redo();
    q1 = MV.placedItems(B.w()).find((x) => x.guid === p1.guid);
    ok(near(q1.x, 5000) && near(q1.y, 1000), 'redo: moved again');
    // on the level above: its z (above its level) stays
    ed.modelChange(MV.moveItems([{ guid: p2.guid, dx: 500, dy: -250, rot: 45 }]));
    const q2 = MV.placedItems(B.w()).find((x) => x.guid === p2.guid);
    const wz = B.w().api.GetWorldTransformMatrix(ed.mid, B.w().api.GetLine(ed.mid, q2.id, false).ObjectPlacement.value)[14] * B.w().unitMm;
    ok(near(q2.x, 1500) && near(q2.y, 750) && near(q2.rot, 45) && near(q2.z, 0) && near(wz, L2.elevation), 'on Level 2: moved by (500, −250) and set to 45°; still on its level (world z ' + wz + ')');
    // two together, turned about a shared point
    ed.modelChange(MV.moveItems([{ guid: p1.guid, drot: 180, about: [0, 0] }, { guid: p2.guid, drot: 180, about: [0, 0] }]));
    P = MV.placedItems(B.w());
    ok(near(P.find((x) => x.guid === p1.guid).x, -5000) && near(P.find((x) => x.guid === p2.guid).y, -750) && near(Math.abs(P.find((x) => x.guid === p1.guid).rot), 180), 'two turned 180° about (0, 0) together: one step, both go round');
    n0 = ed.changes.length;
    let why = '';
    try { ed.modelChange(MV.moveItems([{ guid: 'nope', x: 0 }])); } catch (e) { why = e.key; }
    ok(why === 'comforts.err.noitem' && ed.changes.length === n0, 'an item that is gone: refused (comforts.err.noitem), no step');
    const txt = dec(ed.save());
    ok(!danglingRefs(txt).length, 'nothing in the saved file points at a line that is gone (the old placements were deleted)');
    saved.moved = ed.save();
  }

  // ============================================================================================ 4 dormers
  if (want(4)) {
    console.log('== 4 Dormers');
    const DM = await import(path.join(APP, 'res-dormer.js'));
    const B = await building();
    const { ed, levels } = B;
    const [L1, L2] = levels;
    const P = [[0, 0], [8000, 0], [8000, 6000], [0, 6000]];
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: L2.guid }));
    const pitch = Math.atan(10 / 12) * 180 / Math.PI;
    ed.modelChange(OPS.placeRoof({ storey: L1.guid, seed: [4000, 3000], pitch, overhang: 300, edges: '' }));
    let plans = DM.roofPlans(B.w());
    const rp = plans[0];
    const south = DM.faceAt(rp.plan, [4000, 900]);
    ok(plans.length === 1 && south && near(south.n[1], 1, 1e-9) && near(1 / south.speed, 10 / 12, 1e-9), 'roofPlans: the hip roof with its faces as written (plate height); the face over (4000, 900) runs up +y at 10/12');
    const spec = { at: [4000, 900], kind: 'gable', width: 1500, height: 600, pitch: Math.atan(8 / 12) * 180 / Math.PI, overhang: 150, wall: 140 };
    const G = DM.dormerGeometry(rp.plan, south, spec);
    const sm = 10 / 12, sd = 8 / 12;
    ok(!G.error && near(G.zp - G.zf, 600) && near(G.yBack, (600 + rp.plan.thickness * Math.sqrt(1 + sd * sd) + sd * 750) / sm, 1e-6), 'gable dormer geometry: its eave 600 above the roof\'s top at its front; its ridge runs back to where it meets the roof', JSON.stringify({ e: G.error, zf: G.zf, zp: G.zp, yb: G.yBack }));
    // the valley: each roof plane meets the main roof's top along a straight line (both planes there)
    const topZ = (q) => DM.faceAt(rp.plan, q) && (rp.plan.faces.find((f) => f === south) ? (south.start + (south.n[0] * q[0] + south.n[1] * q[1] - south.c) / south.speed) + G.tv : null);
    const back = G.faces[0].pts.filter((q) => q[1] > 1000);
    ok(back.length === 2 && back.every((q) => near(q[2] + G.tvd, topZ(q), 0.01)), 'the dormer roof\'s top meets the roof\'s top along its back edge (the valley line)', JSON.stringify(back.map((q) => [q[2] + G.tvd, topZ(q)])));
    ok(G.walls.length === 3 && G.cut.length === 5, 'three walls (front with its gable, two cheeks) and a five-sided hole (up to the ridge)');
    ok(DM.dormerGeometry(rp.plan, south, { ...spec, kind: 'shed', pitch: 45 }).error === 'comforts.err.shedpitch', 'a shed dormer steeper than the roof: refused (comforts.err.shedpitch)');
    ok(DM.dormerGeometry(rp.plan, south, { ...spec, at: [800, 900], width: 3000 }).error === 'comforts.err.dormerfit', 'a dormer past the face\'s hip: refused (comforts.err.dormerfit)');
    // place it: one step
    const roofOnly = ed.save();
    let n0 = ed.changes.length;
    ed.modelChange(DM.placeDormer({ roof: rp.roof.guid, ...spec }), { label: 'Dormer' });
    let D = DM.readDormers(B.w());
    ok(ed.changes.length === n0 + 1 && D.length === 1 && D[0].kind === 'gable' && D[0].parts.length === 5 && near(D[0].width, 1500), 'placed: one undo step; an IfcRoof "Dormer" with 5 parts (two roof planes, front, two cheeks)');
    let txt = dec(ed.save());
    ok(/IFCROOF\('[^']+',#\d+,'Dormer',\$,'Dormer',#\d+,\$,\$,\.GABLE_ROOF\.\)/.test(txt) && /'CadCraft_Dormer'/.test(txt) && /'CadCraft_DormerCut'/.test(txt), 'IFC: IfcRoof .GABLE_ROOF. ObjectType Dormer, CadCraft_Dormer; the hole tagged CadCraft_DormerCut');
    const W = B.w();
    const slab = rp.roof.parts.find((p) => Number(W.readPset(p, 'CadCraft_RoofFace')?.Edge) === south.edge);
    const voids = ids(W, 'IFCRELVOIDSELEMENT').map((r) => W.api.GetLine(W.mid, r, false)).filter((r) => r.RelatingBuildingElement?.value === slab);
    ok(voids.length === 1 && /OPENINGELEMENT/i.test(W.api.GetLine(W.mid, voids[0].RelatedOpeningElement.value, false)?.constructor?.name || ''), 'the hole voids the south face\'s slab (IfcRelVoidsElement)');
    const m = await reopenModel(ed.save());
    const slabV0 = volumeOf(await reopenModel(roofOnly), (id) => id === slab);
    const slabV1 = volumeOf(m, (id) => id === slab);
    const dParts = DM.readDormers(B.w())[0].parts;
    const dormV = volumeOf(m, (id) => dParts.includes(id));
    const cutA = Math.abs(G.cut.reduce((s, p, i) => s + p[0] * G.cut[(i + 1) % G.cut.length][1] - G.cut[(i + 1) % G.cut.length][0] * p[1], 0) / 2);
    ok(slabV0 - slabV1 > 0 && near(slabV0 - slabV1, cutA * rp.plan.thickness * Math.sqrt(1 + sm * sm) / 1e9, (cutA * rp.plan.thickness * Math.sqrt(1 + sm * sm) / 1e9) * 0.08) && dormV > 0.05, 'cc-ifc: the roof slab is ' + ((slabV0 - slabV1) * 1000).toFixed(1) + ' l lighter (the hole: ' + (cutA * rp.plan.thickness * Math.sqrt(1 + sm * sm) / 1e6).toFixed(1) + ' l); the dormer\'s parts ' + dormV.toFixed(3) + ' m³');
    // change it: shed, wider
    ed.modelChange(DM.changeDormer(D[0].guid, { kind: 'shed', width: 2000 }));
    D = DM.readDormers(B.w());
    txt = dec(ed.save());
    ok(D[0].kind === 'shed' && near(D[0].width, 2000) && D[0].parts.length === 4 && near(D[0].pitch, DM.DORMER_DEFAULTS.shedPitch, 1e-6) && /\.SHED_ROOF\.\)/.test(txt), 'changed to a shed dormer 2000 wide: one roof plane at 3/12, front and cheeks; .SHED_ROOF.');
    // the walls move: the roof is made again, the dormer stands on its new face
    const sw = OPS.snapshotModel(ed).walls.find((x) => near(x.a[1], 0) && near(x.b[1], 0));
    ed.modelChange(OPS.changeWall(sw.guid, { a: [0, -1000], b: [8000, -1000] }));
    const plans2 = DM.roofPlans(B.w());
    D = DM.readDormers(B.w());
    const W2 = B.w(), slab2 = plans2[0].roof.parts.find((p) => Number(W2.readPset(p, 'CadCraft_RoofFace')?.Edge) === D[0].face);
    const v2 = ids(W2, 'IFCRELVOIDSELEMENT').map((r) => W2.api.GetLine(W2.mid, r, false)).filter((r) => r.RelatingBuildingElement?.value === slab2);
    ok(D.length === 1 && D[0].parts.length === 4 && v2.length === 1 && !danglingRefs(dec(ed.save())).length, 'the south wall moved out 1000: the roof made again, the dormer with it on the new face (one hole in the new slab, nothing dangling)');
    ed.undo();
    // delete
    ed.modelChange(DM.removeDormers([D[0].guid]));
    txt = dec(ed.save());
    ok(DM.readDormers(B.w()).length === 0 && !/'CadCraft_DormerCut'/.test(txt) && !danglingRefs(txt).length, 'removed: the dormer, its parts and its hole are gone; nothing dangling');
    ed.undo();
    ok(DM.readDormers(B.w()).length === 1, 'undo: the dormer is back');
    saved.dormer = ed.save();
    try {
      const Wi = require('web-ifc');
      const a = new Wi.IfcAPI(); await quiet(() => a.Init())();
      const id = a.OpenModel(saved.dormer);
      ok(a.GetLineIDsWithType(id, Wi.IFCROOF).size() === 2 && a.GetLineIDsWithType(id, Wi.IFCOPENINGELEMENT).size() >= 1, 'web-ifc (oracle): the roof and the dormer, the hole');
    } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped'); }
  }

  // ============================================================================================ 5 spiral stairs
  if (want(5)) {
    console.log('== 5 Spiral stairs');
    const ST = await import(path.join(APP, 'res-stair.js'));
    const IN = 25.4;
    const L0 = ST.stairLayout({ kind: 'spiral', start: [2000, 2000], angle: 0, height: 2743.2, width: 30 * IN, railings: 'both', railHeight: 36 * IN });
    const sp = L0.spiral, rp = 4.5 * IN / 2;
    ok(!L0.error && L0.n === Math.ceil(2743.2 / (9.5 * IN)) && near(L0.riser, 2743.2 / L0.n) && L0.treads === L0.n - 1, 'a 9\'-0" floor to floor: ' + L0.n + ' risers of ' + L0.riser.toFixed(1) + ' mm (the spiral default: at most 9½"), ' + L0.treads + ' treads');
    ok(near(sp.angle, 7.5 * IN / (rp + 12 * IN) * 180 / Math.PI, 1e-9) && near(sp.outer, rp + 30 * IN), 'each tread turns ' + sp.angle.toFixed(2) + '° so it is 7½" deep on the walk line 12" from the post; outside radius = post + 30"');
    const t0 = L0.pieces[0].treads[0].poly, t1 = L0.pieces[0].treads[1].poly;
    const inner = t0.every((q) => Math.hypot(q[0] - 2000, q[1] - 2000) > rp - 0.01 && Math.hypot(q[0] - 2000, q[1] - 2000) < sp.outer + 0.01);
    ok(inner && L0.pieces[0].spiral && L0.pieces.some((p) => p.kind === 'post' && near(p.r, rp)), 'wedge treads between the post and the outside; a post piece');
    const ang = (poly) => { const c = poly.reduce((a, q) => [a[0] + q[0] / poly.length, a[1] + q[1] / poly.length], [0, 0]); return Math.atan2(c[1] - 2000, c[0] - 2000); };
    ok(ang(t1) > ang(t0), 'turning left (the default): the treads go round anticlockwise going up');
    const R1 = ST.stairLayout({ kind: 'spiral', turn: 'right', start: [2000, 2000], angle: 0, height: 2743.2, width: 30 * IN });
    ok(ang(R1.pieces[0].treads[1].poly) < ang(R1.pieces[0].treads[0].poly), 'turning right: clockwise');
    ok(L0.sides.length === 1 && L0.sides[0].length === 2 * L0.treads + 1 && L0.sides[0].every((q) => near(Math.hypot(q[0] - 2000, q[1] - 2000), sp.outer - 2 * IN, 0.01)) && near(L0.sides[0].at(-1)[2], L0.riser * (L0.treads + 1), 0.01), 'one handrail on the outside, a helix rising with the nosings to the top');
    ok(Object.values(L0.checks).every(Boolean), 'its labelled defaults pass (9½" riser, 6¾" on the walk line, 26" wide, 36" handrail)');
    const narrow = ST.stairLayout({ kind: 'spiral', start: [0, 0], angle: 0, height: 2743.2, width: 22 * IN, tread: 6 * IN });
    ok(!narrow.checks.width && !narrow.checks.tread, 'a 22" spiral with 6" treads: flagged narrower than 26" and too shallow on the walk line');
    ok(L0.outline.length === 2 && L0.outline[0].length > 20, 'the plan outline: the part of the circle its treads cover, and the post');
    // placed in a building: one step, IFC
    const B = await building();
    const { ed, levels } = B;
    const [L1] = levels;
    let n0 = ed.changes.length;
    ed.modelChange(ST.placeStair({ level: L1.guid, start: [3000, 3000], angle: 90, kind: 'spiral', turn: 'left', railings: 'both' }), { label: 'Stair' });
    const S = ST.readStairs(B.w());
    ok(ed.changes.length === n0 + 1 && S.length === 1 && S[0].kind === 'spiral' && near(S[0].post, 4.5 * IN, 0.01) && near(S[0].width, 30 * IN, 0.01) && near(S[0].riserMax, 9.5 * IN, 0.01), 'placed: one undo step, read back as a spiral with its post and its own defaults (30" wide, 9½" risers)');
    const txt = dec(ed.save());
    ok(/IFCSTAIR\([^;]*\.SPIRAL_STAIR\.\)/.test(txt) && /IFCSTAIRFLIGHT\([^;]*\.SPIRAL\.\)/.test(txt) && /IFCMEMBER\([^;]*\.POST\.\)/.test(txt) && /IFCRAILING\([^;]*\.HANDRAIL\.\)/.test(txt), 'IFC: IfcStair .SPIRAL_STAIR. aggregating an IfcStairFlight .SPIRAL., the post (IfcMember .POST.) and the handrail');
    ok(/'Post',\$,IFCLENGTHMEASURE\(114\.3\)/.test(txt), 'CadCraft_Stair Post 114.3 (4½")');
    const m = await reopenModel(ed.save());
    ok(m.types.some((x) => x.name === 'IfcStairFlight') && m.types.some((x) => x.name === 'IfcMember'), 'cc-ifc builds the treads and the post');
    ed.modelChange(ST.changeStair(S[0].guid, { turn: 'right', post: 150 }));
    const S2 = ST.readStairs(B.w())[0];
    ok(S2.turn === 'right' && near(S2.post, 150, 0.01) && S2.parts.length === S[0].parts.length, 'changed: winds the other way, a 150 mm post; made again with as many parts');
    ed.modelChange(ST.changeStair(S[0].guid, { kind: 'straight' }));
    const S3 = ST.readStairs(B.w())[0];
    ok(S3.kind === 'straight' && near(S3.riserMax, 7.75 * IN, 0.01) && near(S3.width, 36 * IN, 0.01), 'turned into a straight stair: back to the straight stair\'s defaults');
    ed.undo();
    saved.spiral = ed.save();
  }

  // ============================================================================================ 6 / 7 interior elevations, notes
  if (want(6) || want(7)) {
    console.log('== 6 Interior elevations, 7 dimensions and tags on elevations and sections');
    const CV = await import(path.join(APP, 'comforts-views.js'));
    const RV = await import(path.join(APP, 'res-views.js'));
    const { viewerToPlan } = await import(path.join(APP, 'model-plan.js'));
    const B = await building();
    const { ed, levels } = B;
    const [L1, L2] = levels;
    const P = [[0, 0], [4000, 0], [4000, 3000], [0, 3000]];
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'int-2x6', topLevel: L2.guid, extSide: 'right' }));
    let snap = OPS.snapshotModel(ed);
    const south = snap.walls.find((x) => near(x.a[1], 0) && near(x.b[1], 0)), north = snap.walls.find((x) => near(x.a[1], 3000) && near(x.b[1], 3000));
    ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 1500 }));
    ed.modelChange(OPS.placeOpening({ wall: north.guid, typeKey: 'win-slider', offset: 1200, sill: 900 }));
    const item = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/library/seed/range.item.json'), 'utf8'));
    ed.placeItem(item, { storey: L1.id, x: 3000, y: 2850, rot: 180, itemNumber: '4', quantity: 1 });
    snap = OPS.snapshotModel(ed);
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    const m = await quiet((b) => eng.load(b))(ed.save());
    const M = viewerToPlan(eng.api.GetCoordinationMatrix(m.modelID), B.w().storeyWorld(L1.id));
    const els = RV.modelTriangles(m, M);
    const room = OPS.loopsOf(ed, L1.id).rooms[0];
    const t6 = MW.typeThickness(MW.wallType('int-2x6'));
    const t0 = Date.now();
    const v = CV.interiorView(els, { poly: room.poly, name: 'Room 101' }, 'north', { height: 3000 });
    const dt = Date.now() - t0;
    ok(v.bounds && near(v.frame.x1 - v.frame.x0, 4000 - t6, 0.5) && v.frame.y1 === 3000 && dt < 15000, 'interiorView north: framed on the room, wall to wall ' + Math.round(v.frame.x1 - v.frame.x0) + ' mm, floor to 3000 (' + dt + ' ms)');
    const cutKeys = new Set(v.cuts.map((c) => c.key - (m.keyBase || 0)));
    const east = snap.walls.find((x) => near(x.a[0], 4000) && near(x.b[0], 4000)), west = snap.walls.find((x) => near(x.a[0], 0) && near(x.b[0], 0));
    ok(cutKeys.has(east.id) && cutKeys.has(west.id) && !cutKeys.has(north.id), 'the side walls come out cut (poché round the frame); the north wall is seen, not cut');
    const win = snap.openings.find((o) => o.kind === 'window'), door = snap.openings.find((o) => o.kind === 'door');
    // looking north the view's x runs east (right = [dir.y, −dir.x] = [1, 0]): the window's middle along the north wall
    const nu = [(north.b[0] - north.a[0]) / north.len, (north.b[1] - north.a[1]) / north.len];
    const winX = north.a[0] + nu[0] * (win.offset + win.width / 2);
    const near1 = v.lines.filter((l) => Math.abs((l[0] + l[2]) / 2 - winX) < win.width / 2 + 50 && (l[1] + l[3]) / 2 > 900 && (l[1] + l[3]) / 2 < 900 + win.height + 10);
    ok(near1.length >= 4, 'the window in the north wall is drawn (' + near1.length + ' lines round x ' + Math.round(winX) + ')');
    const facts = CV.openingFacts(snap.openings, snap.walls, MA.wallGeom);
    const items = MV_items(B.w());
    const notesN = CV.viewNotes(v, { kind: 'interior', openings: facts, items, fmt: (mm) => String(Math.round(mm)) });
    const tagsN = notesN.filter((n) => n.t === 'tag').map((n) => n.s).sort();
    ok(notesN.some((n) => n.t === 'dim' && n.text === String(Math.round(4000 - t6))) && notesN.some((n) => n.t === 'dim' && n.text === '3000'), 'its dimensions: the room\'s width under it, its height beside it');
    ok(tagsN.join() === '4,W1', 'its tags: the window W1 and the range (item 4) on the north wall; not the south door', tagsN.join());
    const vs = CV.interiorView(els, { poly: room.poly }, 'south', { height: 3000 });
    const tagsS = CV.viewNotes(vs, { kind: 'interior', openings: facts, items }).filter((n) => n.t === 'tag').map((n) => n.s);
    ok(tagsS.join() === 'D1', 'the south interior elevation: the door D1 only', tagsS.join());
    const all4 = CV.ROOM_SIDES.map((s) => CV.interiorView(els, { poly: room.poly }, s, { height: 3000 }));
    ok(all4.every((x) => x.bounds && x.cuts.length >= 2), 'all four sides of the room (N / E / S / W) come out, each with its side walls cut');
    // 7: an exterior elevation and a section carry level marks, heights, the width and tags
    const ev = RV.projectView(els, { dir: RV.elevationDirs.south });
    const lvls = levels.map((l) => ({ name: l.name, elevation: l.elevation }));
    const nE = CV.viewNotes(ev, { kind: 'elevation', dir: RV.elevationDirs.south, levels: lvls, base: 0, openings: facts, width: { x0: -t6 / 2, x1: 4000 + t6 / 2 }, fmt: (mm) => String(Math.round(mm)) });
    ok(nE.filter((n) => n.t === 'level').map((n) => n.name).join() === 'Level 1,Level 2', 'the south elevation: level marks for Level 1 and Level 2', JSON.stringify(nE.filter((n) => n.t === 'level')));
    ok(nE.some((n) => n.t === 'dim' && n.text === '3000') && nE.some((n) => n.t === 'dim' && n.text === String(Math.round(4000 + t6))), 'the height between the levels (3000) and the building\'s width (' + Math.round(4000 + t6) + ')');
    ok(nE.filter((n) => n.t === 'tag').map((n) => n.s).join() === 'D1', 'tags on the wall facing the viewer only: D1 (the window W1 is on the far side)', nE.filter((n) => n.t === 'tag').map((n) => n.s).join());
    // the room's sheet: four walls two by two at one scale, with their notes, as SVG and PDF (res-sheets.js writers)
    const RS = await import(path.join(APP, 'res-sheets.js'));
    const views = CV.ROOM_SIDES.map((side, i) => ({ side, view: all4[i], notes: CV.viewNotes(all4[i], { kind: 'interior', openings: facts, items, fmt: (mm) => String(Math.round(mm)) }) }));
    const sh = CV.interiorSheet({ name: '101 Kitchen' }, views, { paper: 'a3', units: 'mm', project: 'Comforts', date: '2026-10-18' });
    const svg = RS.sheetSvg(sh, { paper: 'a3' });
    const texts = sh.items.filter((x) => x.t === 'text').map((x) => x.s);
    ok(sh.scale.ratio >= 20 && ['North wall', 'East wall', 'South wall', 'West wall'].every((s) => texts.includes(s)) && texts.includes('W1') && texts.includes('D1') && texts.includes('4') && /^<svg/.test(svg), 'interiorSheet: the four walls at one scale (1:' + sh.scale.ratio + '), each named, with W1, D1 and item 4 tagged; the SVG preview');
    const pdf = RS.setPdf([sh], { paper: 'a3', title: 'Comforts' });
    let pdfText = '';
    try { const tmp = path.join(os.tmpdir(), 'bim-comforts-ie.pdf'); fs.writeFileSync(tmp, pdf); pdfText = (await import('node:child_process')).execFileSync('pdftotext', ['-layout', tmp, '-'], { encoding: 'utf8' }); fs.rmSync(tmp); } catch (e) { pdfText = null; }
    ok(new TextDecoder('latin1').decode(pdf.slice(0, 5)) === '%PDF-' && (pdfText === null || (/Interior elevations/.test(pdfText) && /North wall/.test(pdfText) && /\bW1\b/.test(pdfText) && pdfText.includes(String(Math.round(4000 - t6))))), 'the PDF: one page, its title, the walls\' names, the tags and the room\'s width as text' + (pdfText === null ? ' (pdftotext not here: text not checked)' : ''));
    const sv = RV.projectView(els, { dir: [0, 1], cut: { o: [2000, 1500] } });
    const nS = CV.viewNotes(sv, { kind: 'section', dir: [0, 1], levels: lvls, base: 0 });
    ok(nS.filter((n) => n.t === 'level').length === 2 && !nS.some((n) => n.t === 'tag'), 'a section: level marks and the height between them, no tags');
    // on the drawing set (res-sheets.js): an elevation's notes drawn on its sheet; an interior elevation placed on your own sheet
    ev.notes = nE; sv.notes = nS;
    const set = RS.buildSet({ elevations: [{ ref: 'south', title: 'South', view: ev }], sections: [{ ref: 's', title: 'A', view: sv }] }, { paper: 'tabloid', units: 'mm' });
    const tx = set.flatMap((x) => x.items).filter((x) => x.t === 'text').map((x) => x.s);
    ok(tx.includes('Level 2') && tx.includes('3000') && tx.includes('D1') && tx.includes(String(Math.round(4000 + t6))), 'the drawing set draws the notes: level marks, the 3000 between levels, the width, the D1 tag');
    const iv = { ...all4[0], notes: notesN };
    const cs = RS.composeSheet({ number: 'A-601', title: 'Kitchen', views: [{ kind: 'interior', ref: 'r:north', x: 200, y: 140, ratio: 25 }] }, { interiors: [{ ref: 'r:north', title: 'Kitchen — North wall', view: iv }] }, { paper: 'tabloid', units: 'mm' });
    const tc = cs.items.filter((x) => x.t === 'text').map((x) => x.s);
    ok(!cs.missing?.length && tc.includes('W1') && tc.includes('4'), 'your own sheet: an interior elevation placed at 1:25 with its tags (W1, item 4)', JSON.stringify(cs.missing));
  }
  function MV_items(w) {
    const rows = w.placements();
    return rows.map((p) => ({ tag: p.itemNumber, at: [p.x, p.y], z: 0, h: Number(p.equipment?.Height || 0) * w.unitMm || 900 }));
  }

  // ============================================================================================ checks on the saved files
  console.log('== IfcOpenShell schema validation (when a venv with it is on this machine)');
  {
    const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
    if (!py) console.log('  --   no venv with ifcopenshell: skipped');
    else if (!Object.keys(saved).length) console.log('  --   nothing saved');
    else {
      const { execFileSync } = await import('node:child_process');
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-comforts-'));
      const files = Object.entries(saved).map(([k, b]) => { const f = path.join(dir, k + '.ifc'); fs.writeFileSync(f, b); return f; });
      let out = '';
      try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), ...files], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || ''); }
      const res = out.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
      ok(res.length === files.length && res.every((r) => r.errors === 0), 'IfcOpenShell finds no schema errors in ' + res.map((r) => path.basename(r.file) + ' (' + r.errors + ')').join(', ') + (res.some((r) => r.errors) ? ': ' + res.flatMap((r) => r.first).slice(0, 3).join(' | ') : ''));
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}

/** #ids referenced in the DATA section that are not defined. */
function danglingRefs(txt) {
  const defined = new Set([...txt.matchAll(/^#(\d+)=/gm)].map((m) => m[1]));
  const out = new Set();
  for (const line of txt.split('\n')) {
    const body = line.replace(/^#\d+=/, '').replace(/'(?:[^']|'')*'/g, '');
    for (const m of body.matchAll(/#(\d+)/g)) if (!defined.has(m[1])) out.add('#' + m[1]);
  }
  return [...out];
}

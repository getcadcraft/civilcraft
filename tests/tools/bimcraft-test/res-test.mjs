/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --res [--only rc1,rc2…] [--keep]` (0.5 part 4, track RC; session bim-residential): the
 * residential tools in Node, on models made here (no client files) — roofs from the walls (RC.1), and each later item as
 * it lands. Saved models are reopened in cc-ifc and — when installed — web-ifc (the oracle), and validated by
 * IfcOpenShell when a venv with it is on this machine.
 * Called by bin/test-bimcraft.mjs with what it has set up (the build's folder, the engine, quiet()).
 */
import path from 'node:path';
import fs from 'node:fs';

export async function resMode({ APP, ROOT, WebIFC, IfcModel, quiet, require, args = [] }) {
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? new Set(String(args[i + 1] || '').split(',')) : null; })();
  const want = (k) => !only || only.has(k);
  let bad = 0, good = 0;
  const ok = (cond, label) => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const IN = 25.4;
  const saved = {};   // name → bytes, validated at the end
  const lv = (n, h) => N.stackLevels(n, h, (i) => 'Level ' + (i + 1));
  const txtOf = (ed) => new TextDecoder().decode(ed.save());
  /** An element's own quantity set: name → value (file units: mm, m², m³). */
  const qtoOf = (w, id, name) => {
    const d = w.defNamed(id, name), out = {};
    for (const h of d?.line?.Quantities || []) { const q = w.api.GetLine(w.mid, h.value, false); const v = q.LengthValue ?? q.AreaValue ?? q.VolumeValue ?? q.CountValue; out[q.Name?.value ?? q.Name] = Number(v?.value ?? v); }
    return out;
  };
  /** #ids referenced in the DATA section that are not defined. */
  const danglingRefs = (txt) => {
    const defined = new Set([...txt.matchAll(/^#(\d+)=/gm)].map((m) => m[1])), out = new Set();
    for (const line of txt.split('\n')) for (const m of line.replace(/^#\d+=/, '').replace(/'(?:[^']|'')*'/g, '').matchAll(/#(\d+)/g)) if (!defined.has(m[1])) out.add('#' + m[1]);
    return [...out];
  };
  /** A new building with `n` levels and closed rooms of walls drawn on Level 1 (corner lists, anticlockwise). */
  async function building({ n = 2, h = 3000, loops = [], typeKey = 'ext-2x6' } = {}) {
    const text = N.newBuilding({ name: 'Res', levels: lv(n, h), fileName: 'res.ifc', now: new Date('2026-10-14T12:00:00Z') });
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
    const ed = new IfcEditor(WebIFC, eng);
    const levels = OPS.snapshotModel(ed).levels;
    for (const P of loops) ed.modelChange(OPS.drawWalls({ storey: levels[0].guid, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % P.length] })), typeKey, topLevel: levels[1]?.guid || '', height: h, extSide: 'right' }));
    return { ed, eng, levels };
  }
  /** Highest point (mm, above the model's origin) of the meshes of these element ids, read back by cc-ifc. */
  async function topOf(ed, idsList) {
    const e = await quiet(IfcModel.create)(WebIFC, null);
    const m = await quiet((b) => e.load(b))(ed.save());
    const C = e.api.GetCoordinationMatrix(m.modelID);
    let z = -Infinity;
    const want2 = new Set(idsList);
    for (const b of m.batches) for (let i = 0; i < b.elems.ids.length; i++) if (want2.has(b.elems.ids[i])) for (let v = b.elems.v0[i]; v < b.elems.v0[i] + b.elems.vn[i]; v++) z = Math.max(z, b.positions[v * 3 + 1] * 1000);
    return { z: z - C[13] * 1000, m, classOf: m.classOf };
  }
  const th6 = 5.5 * IN + 0.5 * IN + 0.5 * IN;   // the exterior 2×6 type's thickness, read below to be sure

  // ================================================================================================== RC.1 roofs
  if (want('rc1')) {
    const SK = await import(path.join(APP, 'res-skeleton.js'));
    const RR = await import(path.join(APP, 'res-roof.js'));
    console.log('== RC.1 the roof solver (res-skeleton.js)');
    const v = 2;   // 6/12
    const area = (p) => Math.abs(SK.polyArea(p));
    const sumA = (r) => r.faces.reduce((s, f) => s + area(f.poly), 0);
    const all = (P, sp) => SK.skeleton(P, sp || P.map(() => ({ speed: v, start: 0 })));
    const rect = [[0, 0], [8000, 0], [8000, 6000], [0, 6000]];
    let r = all(rect);
    ok(r.faces.length === 4 && near(r.top, 1500, 1e-6) && near(sumA(r), 48e6, 1), 'hip on 8 × 6 m at 6/12: four faces covering the plan once, the ridge 1500 up');
    const ridge = r.lines.filter((l) => near(l.a[2], 1500, 1e-6) && near(l.b[2], 1500, 1e-6));
    ok(ridge.length === 1 && near(Math.hypot(ridge[0].b[0] - ridge[0].a[0], ridge[0].b[1] - ridge[0].a[1]), 2000, 1e-3), 'its ridge is 2000 long (8000 − 6000)');
    r = all(rect, rect.map((_, i) => ({ speed: i % 2 ? 0 : v, start: 0 })));
    ok(r.faces.length === 2 && near(r.top, 1500, 1e-6) && near(sumA(r), 48e6, 1), 'gable ends (speed 0): two faces');
    r = all(rect, rect.map((_, i) => ({ speed: i === 0 ? v : 0, start: 0 })));
    ok(r.faces.length === 1 && near(r.top, 3000, 1e-6) && near(sumA(r), 48e6, 1), 'shed: one face rising 3000 over 6000 at 6/12');
    const L = [[0, 0], [10000, 0], [10000, 4000], [4000, 4000], [4000, 9000], [0, 9000]];
    r = all(L);
    ok(r.faces.length === 6 && near(r.top, 1000, 1e-6) && near(sumA(r), 60e6, 1), 'an L: six faces (not two overlapping hips), the top 1000');
    const T = [[0, 0], [12000, 0], [12000, 4000], [8000, 4000], [8000, 10000], [4000, 10000], [4000, 4000], [0, 4000]];
    ok(all(T).faces.length === 8 && near(sumA(all(T)), 72e6, 1), 'a T: eight faces, the plan once');
    const U = [[0, 0], [12000, 0], [12000, 10000], [8000, 10000], [8000, 4000], [4000, 4000], [4000, 10000], [0, 10000]];
    ok(all(U).faces.length === 8 && near(sumA(all(U)), 96e6, 1), 'a U: eight faces, the plan once');
    const plus = [[4000, 0], [8000, 0], [8000, 4000], [12000, 4000], [12000, 8000], [8000, 8000], [8000, 12000], [4000, 12000], [4000, 8000], [0, 8000], [0, 4000], [4000, 4000]];
    ok(all(plus).faces.length === 12 && near(sumA(all(plus)), 80e6, 1), 'a plus: twelve faces, four valleys');
    const odd = [[0, 0], [6000, 0], [6000, 3000], [3000, 1000], [0, 3000]];
    r = all(odd);
    ok(r.faces.length === 5 && near(sumA(r), 12e6, 1) && r.faces.every((f) => f.poly.every((p) => SK.faceZ(f, p) > -1e-6)), 'a notched shape no square-corner rule fits: five faces, every corner at or above the eave');
    const oct = Array.from({ length: 8 }, (_, i) => [5000 * Math.cos(i * Math.PI / 4 + 0.1), 5000 * Math.sin(i * Math.PI / 4 + 0.1)]);
    r = all(oct);
    ok(r.faces.length === 8 && near(sumA(r), area(oct), 1) && near(r.top, 5000 * Math.cos(Math.PI / 8) / v, 0.01), 'an octagon: eight faces meeting at a point (the inradius × pitch)');
    // different pitches: each plane still passes through its wall line at the plate (z = 0 here)
    const ov = 300;
    const eave = [[-ov, -ov], [8000 + ov, -ov], [8000 + ov, 6000 + ov], [-ov, 6000 + ov]];
    r = SK.skeleton(eave, [{ speed: 2, start: -ov / 2 }, { speed: 1, start: -ov }, { speed: 2, start: -ov / 2 }, { speed: 1, start: -ov }]);
    const at = { 0: [4000, 0], 1: [8000, 3000], 2: [4000, 6000], 3: [0, 3000] };
    ok(r.faces.length === 4 && r.faces.every((f) => near(SK.faceZ(f, at[f.edge]), 0, 1e-6)) && near(sumA(r), area(eave), 1), '6/12 sides and 12/12 ends with a 300 overhang: every face meets its wall line at the plate, the eaves drop differently');

    console.log('== RC.1 the roof from the walls (res-roof.js)');
    const W4 = [{ guid: 'S', a: [0, 0], b: [8000, 0], t: 200 }, { guid: 'E', a: [8000, 0], b: [8000, 6000], t: 200 }, { guid: 'N', a: [8000, 6000], b: [0, 6000], t: 200 }, { guid: 'Wst', a: [0, 6000], b: [0, 0], t: 200 }];
    const out4 = [[-100, -100], [8100, -100], [8100, 6100], [-100, 6100]];
    ok(JSON.stringify(RR.edgeWalls(out4, W4)) === '["S","E","N","Wst"]', 'each outline edge finds the wall under it');
    const m1 = RR.parseEdges('S=p:45:450;E=g;N=n;@3=p');
    ok(m1.get('S').kind === 'pitch' && m1.get('S').pitch === 45 && m1.get('S').overhang === 450 && m1.get('E').kind === 'gable' && m1.get('N').kind === 'none' && RR.formatEdges(m1) === 'S=p:45:450;E=g;N=n;@3=p', 'per-wall settings read and written back the same');
    const pd = Math.atan(0.5) * 180 / Math.PI;
    const roof0 = { pitch: pd, overhang: 0, edges: '' };
    let k = RR.edgeKinds(out4, W4, roof0);
    let g = RR.roofGeometry(out4, k, { plate: 3000, fascia: 0, soffit: false });
    const hipLen = Math.hypot(3100, 3100, 1550);
    ok(!g.error && near(g.lengths.ridge, 2000, 0.5) && near(g.lengths.hip, 4 * hipLen, 1) && g.lengths.valley === 0 && near(RR.heightAt(g, [4000, 3000]), 3000 + 1550, 0.01), 'hip, no overhang: ridge 2000, four hips of ' + hipLen.toFixed(0) + ', the ridge 1550 over the plate');
    const kL = RR.edgeKinds(L, [], { pitch: pd, overhang: 0 });
    const gL = RR.roofGeometry(L, kL, { plate: 0, fascia: 0, soffit: false });
    ok(gL.lines.filter((l) => l.kind === 'valley').length === 1 && gL.lines.filter((l) => l.kind === 'ridge').length === 2 && near(gL.lengths.valley, Math.hypot(2000, 2000, 1000), 0.5), 'an L: one valley from the inside corner, two ridges');
    k = RR.edgeKinds(out4, W4, { pitch: pd, overhang: 300, edges: RR.formatEdges(RR.presetEdges(out4, W4, 'shed', [4000, -500])) });
    ok(k.filter((x) => x.kind === 'pitch').length === 1 && k[0].kind === 'pitch' && RR.roofTypeOf(k) === 'SHED_ROOF', 'Shed preset: the side nearest the pointer is the low eave, the rest are gable ends');
    g = RR.roofGeometry(out4, k, { plate: 0, fascia: 0, soffit: false });
    ok(g.faces.length === 1 && g.gables.length === 3 && near(RR.heightAt(g, [4000, 6100 - 1]), 6200 / 2, 1), 'a shed roof: one face, three gable walls, 3100 high at the back wall');
    k = RR.edgeKinds(out4, W4, { pitch: pd, overhang: 300, edges: 'E=p:45;Wst=p:45' });
    g = RR.roofGeometry(out4, k, { plate: 0, fascia: 0, soffit: false });
    ok(g.faces.length === 4 && near(RR.heightAt(g, [4000, 3000]), 1550, 0.01) && g.faces.filter((f) => near(f.pitch, 45, 1e-6)).length === 2, 'steeper ends (12/12) on 6/12 sides: the hips move, the ridge height stays');
    g = RR.roofGeometry(out4, RR.edgeKinds(out4, W4, roof0), { plate: 0, fascia: 0, soffit: false });
    const gR = RR.roofGeometry(out4, RR.edgeKinds(out4, W4, roof0), { plate: 600, fascia: 0, soffit: false });
    ok(near(RR.heightAt(gR, [4000, 3000]) - RR.heightAt(g, [4000, 3000]), 600, 1e-6), 'a plate 600 higher lifts the whole roof 600');
    g = RR.roofGeometry(out4, RR.edgeKinds(out4, W4, { pitch: pd, overhang: 12 * IN }), { plate: 0, thickness: 8 * IN, fascia: 7.25 * IN, fasciaT: 1.5 * IN, soffit: true });
    const eaveRun = 2 * (8200 + 2 * 12 * IN - 2 * 1.5 * IN) + 2 * (6200 + 2 * 12 * IN - 2 * 1.5 * IN);
    ok(g.fascia.length >= 4 && near(g.lengths.eave, eaveRun, 2) && g.soffit.length === 4, 'fascia all round the eave (' + g.lengths.eave.toFixed(0) + ' mm) and four soffit panels');
    const s4 = g.soffit[0];
    const zE = -(12 * IN - 1.5 * IN) * 0.5;
    ok(near(s4.z, Math.min(zE, zE + 8 * IN / Math.cos(pd * Math.PI / 180) - 7.25 * IN), 0.01), 'the soffit is level with the bottom of the fascia (never above the roof\'s underside at the eave)');
    ok(RR.roofGeometry(out4, RR.edgeKinds(out4, W4, { pitch: pd, overhang: 0, edges: 'S=g;E=g;N=g;Wst=g' }), {}).error === 'res.err.nopitch', 'no pitched side at all: refused');

    console.log('== RC.1 roofs in the model (IFC, follows the walls, undo)');
    const B = [[0, 0], [9000, 0], [9000, 6000], [0, 6000]];
    const { ed, levels } = await building({ loops: [B] });
    const walls = OPS.snapshotModel(ed).walls;
    const T6 = walls[0].t;
    ed.modelChange(OPS.placeRoof({ storey: levels[0].guid, seed: [3000, 3000], pitch: pd, overhang: 12 * IN, edges: '' }));
    let s = OPS.snapshotModel(ed), roof = s.derived.roofs[0];
    let txt = txtOf(ed);
    ok(roof && /IFCROOF\([^;]*\.HIP_ROOF\.\)/.test(txt) && (txt.match(/\.ROOF\.\)/g) || []).length === 4 && /IFCMEMBER\([^;]*'Fascia'[^;]*\.USERDEFINED\.\)/.test(txt) && /IFCCOVERING\([^;]*'Soffit'[^;]*\.CEILING\.\)/.test(txt), 'a hip roof with its fascia (IfcMember) and soffit (IfcCovering), all parts of the IfcRoof');
    ok(/'RidgeLength'/.test(txt) && /'ValleyLength'/.test(txt) && /'EaveLength'/.test(txt), 'CadCraft_RoofLines: ridge, hip, valley, eave and rake lengths for the takeoff');
    const top1 = await topOf(ed, roof.parts);
    const want1 = 3000 + (6000 + T6) / 2 * 0.5 + 8 * IN * Math.sqrt(1.25);
    ok(near(top1.z, want1, 2), 'cc-ifc draws it: the top at ' + top1.z.toFixed(0) + ' (wall top 3000 + half the width × 6/12 + the thickness)');
    // per wall: the east and west ends become gables, then the north side "none" → a shed-like lean
    const guidAt = (x, y) => walls.find((w) => near((w.a[0] + w.b[0]) / 2, x, 1) && near((w.a[1] + w.b[1]) / 2, y, 1)).guid;
    const east = guidAt(9000, 3000), west = guidAt(0, 3000), north = guidAt(4500, 6000), south = guidAt(4500, 0);
    ed.modelChange(OPS.changeDerived([roof.guid], { edges: `${east}=g;${west}=g` }));
    txt = txtOf(ed);
    s = OPS.snapshotModel(ed); roof = s.derived.roofs[0];
    ok(/\.GABLE_ROOF\./.test(txt) && (txt.match(/\.ROOF\.\)/g) || []).length === 2 && (txt.match(/IFCWALL\([^;]*'Gable end'/g) || []).length === 2, 'east and west walls set to gable: two faces, two gable walls');
    ed.modelChange(OPS.changeDerived([roof.guid], { edges: `${east}=g;${west}=g;${north}=g` }));
    txt = txtOf(ed);
    ok(/\.SHED_ROOF\./.test(txt) && (txt.match(/\.ROOF\.\)/g) || []).length === 1 && (txt.match(/IFCWALL\([^;]*'Gable end'/g) || []).length === 3, 'north too: a shed roof — one face, three gable walls (the high wall closed up to the roof)');
    ed.modelChange(OPS.changeDerived([roof.guid], { edges: `${south}=p:45` }));
    s = OPS.snapshotModel(ed); roof = s.derived.roofs[0];
    txt = txtOf(ed);
    ok((txt.match(/\.ROOF\.\)/g) || []).length === 4 && /'PitchDegrees',\$,IFCREAL\(45\.?\)/.test(txt), 'back to hip with the south side at 12/12: four faces, one at 45°');
    const before45 = (await topOf(ed, roof.parts)).z;
    ed.modelChange(OPS.changeDerived([roof.guid], { edges: '', plate: 3300, fascia: 0, soffit: false }));
    s = OPS.snapshotModel(ed); roof = s.derived.roofs[0];
    txt = txtOf(ed);
    const top2 = await topOf(ed, roof.parts);
    ok(roof.parts.length === 4 && !/IFCMEMBER\(/.test(txt) && !/IFCCOVERING\([^;]*'Soffit'/.test(txt) && near(top2.z, want1 + 300, 2), 'plate height 3300, fascia and soffit off: the roof 300 higher, four faces only');
    ed.undo();
    s = OPS.snapshotModel(ed); roof = s.derived.roofs[0];
    const top3 = await topOf(ed, roof.parts);
    ok(roof.parts.length === 6 && near(top3.z, before45, 0.5), 'undo: the 12/12 south side on the walls\' top again, fascia and soffit back');
    ed.redo();
    ok(near((await topOf(ed, OPS.snapshotModel(ed).derived.roofs[0].parts)).z, want1 + 300, 2), 'redo: 300 higher again');
    // the walls move: the roof follows (east wall out 1000)
    const ew = OPS.snapshotModel(ed).walls.find((w) => w.guid === east);
    ed.modelChange(OPS.changeWall(east, { a: [10000, ew.a[1]], b: [10000, ew.b[1]] }));
    txt = txtOf(ed);
    ok(/'ProjectedArea',\$,\$,([\d.]+)/.test(txt) && near(Number(txt.match(/'ProjectedArea',\$,\$,([\d.E+-]+)/)[1]), (10000 + T6 + 2 * 12 * IN) * (6000 + T6 + 2 * 12 * IN) / 1e6, 1e-3), 'the east wall moves out: the roof follows (projected area with the overhang)');
    saved.hip = ed.save();
    // an L-shaped house with a valley, then gables on both wing ends
    const LB = [[0, 0], [10000, 0], [10000, 4000], [4000, 4000], [4000, 9000], [0, 9000]];
    const b2 = await building({ loops: [LB] });
    b2.ed.modelChange(OPS.placeRoof({ storey: b2.levels[0].guid, seed: [2000, 2000], pitch: pd, overhang: 300 }));
    let tx2 = txtOf(b2.ed);
    ok((tx2.match(/\.ROOF\.\)/g) || []).length === 6 && Number(tx2.match(/'ValleyLength',\$,IFCLENGTHMEASURE\(([\d.E+-]+)/)?.[1]) > 1000, 'an L-shaped house: six faces and a valley over 1 m long');
    const w2 = OPS.snapshotModel(b2.ed).walls;
    const endE = w2.find((w) => near(w.a[0], 10000, 1) && near(w.b[0], 10000, 1)).guid, endN = w2.find((w) => near(w.a[1], 9000, 1) && near(w.b[1], 9000, 1)).guid;
    b2.ed.modelChange(OPS.changeDerived([OPS.snapshotModel(b2.ed).derived.roofs[0].guid], { edges: `${endE}=g;${endN}=g` }));
    tx2 = txtOf(b2.ed);
    ok((tx2.match(/IFCWALL\([^;]*'Gable end'/g) || []).length === 2 && (tx2.match(/\.ROOF\.\)/g) || []).length === 4, 'gables on both wing ends: four faces, two gable walls, still one valley');
    saved.lroof = b2.ed.save();
    // a manual roof plane: a porch roof against the house, drawn on Level 1, eave at 2400
    const RP = await import(path.join(APP, 'res-roofplane.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    const wr = () => new ModelWriter(b2.ed.W, b2.ed.api, b2.ed.mid);
    const porch2 = [[6500, 9000], [6500, 6000], [4100, 6000], [4100, 9000]];
    b2.ed.modelChange(RP.placeRoofPlane({ level: b2.levels[0].guid, points: porch2, pitch: Math.atan(3 / 12) * 180 / Math.PI, base: 2400, thickness: 6 * IN }));
    let planes = RP.readRoofPlanes(wr());
    tx2 = txtOf(b2.ed);
    ok(planes.length === 1 && planes[0].parts.length === 1 && /IFCROOF\([^;]*'Roof plane'[^;]*\.FREEFORM\.\)/.test(tx2) && planes[0].storey === b2.levels[1].id, 'a roof plane: an IfcRoof (.FREEFORM.) on Level 2 with one face slab');
    ok(near(RP.planeZ(planes[0], [6500, 7000]), 2400, 0.01) && near(RP.planeZ(planes[0], [4100, 7000]), 2400 + 2400 * 0.25, 0.5), 'its eave (the first side) at 2400, rising 3/12 inward: 3000 at the far side');
    const tp = await topOf(b2.ed, planes[0].parts);
    ok(near(tp.z, 3000 + 6 * IN * Math.sqrt(1 + 1 / 16), 2), 'cc-ifc draws it where it should be (top ' + tp.z.toFixed(0) + ')');
    b2.ed.modelChange(RP.changeRoofPlane(planes[0].guid, { pitch: 45 }));
    planes = RP.readRoofPlanes(wr());
    ok(near(planes[0].pitch, 45, 1e-6) && near(RP.planeZ(planes[0], [4100, 7000]), 2400 + 2400, 1e-6), 'pitch changed to 12/12 in Properties: the plane is made again');
    let kk = ''; try { b2.ed.modelChange(RP.placeRoofPlane({ level: b2.levels[0].guid, points: [[0, 0], [1000, 0]], pitch: 20 })); } catch (e) { kk = e.key; }
    ok(kk === 'res.err.plane' && RP.readRoofPlanes(wr()).length === 1, 'two corners only: refused, nothing written');
    b2.ed.modelChange(RP.removeRoofPlanes([planes[0].guid]));
    ok(RP.readRoofPlanes(wr()).length === 0 && !danglingRefs(txtOf(b2.ed)).length, 'deleted with its slab; no dangling references');
    b2.ed.undo();
    ok(RP.readRoofPlanes(wr()).length === 1, 'undo brings it back');
    saved.plane = b2.ed.save();
    try {
      const Wi = require('web-ifc');
      const a = new Wi.IfcAPI(); await quiet(() => a.Init())();
      const id = a.OpenModel(saved.hip);
      ok(a.GetLineIDsWithType(id, Wi.IFCROOF).size() === 1 && a.GetLineIDsWithType(id, Wi.IFCSLAB).size() === 4 && a.GetLineIDsWithType(id, Wi.IFCMEMBER).size() === 0, 'web-ifc (oracle): one roof, four face slabs, no fascia (it was turned off)');
    } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped'); }
  }

  // ============================================================================================ RC.2 foundations
  if (want('rc2')) {
    const FD = await import(path.join(APP, 'res-foundation.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    console.log('== RC.2 foundation sizes and shapes (res-foundation.js)');
    const fs1 = FD.footingSize({ kind: 'stemslab', stories: 1 }), fs2 = FD.footingSize({ kind: 'stemslab', stories: 2 }), fc3 = FD.footingSize({ kind: 'crawl', stories: 3 }), fh = FD.footingSize({ kind: 'stemslab', stories: 1, heavy: true });
    ok(near(fs1.width, 12 * IN) && near(fs2.width, 15 * IN) && near(fc3.width, 27 * IN) && near(fc3.depth, 10 * IN) && near(fh.width, 16 * IN) && near(fs1.depth, 8 * IN), 'footing widths: 12" / 15" for 1 / 2 stories on a slab, 27" × 10" for 3 over a crawlspace, 4" more under masonry');
    const box = [[0, 0], [10000, 0], [10000, 8000], [0, 8000]];
    const ring = (g) => Math.abs(SKA(g.outer)) - Math.abs(SKA(g.inner || []));
    const SKA = (p) => { let s2 = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s2 += a[0] * b[1] - a[1] * b[0]; } return s2 / 2; };
    let pr = FD.foundationParams('slab', {}, { stories: 1 });
    let geo = FD.foundationGeometry(box, pr);
    ok(geo.length === 2 && geo[0].role === 'slab' && near(geo[0].z1, 0) && near(geo[0].z0, -4 * IN) && geo[1].role === 'edge' && near(geo[1].z0, -12 * IN) && near(ring(geo[1]), 2 * (10000 + 8000) * 12 * IN - 4 * (12 * IN) ** 2, 1), 'slab on grade: a 4" slab with its top at the floor, a 12" × 12" thickened edge all round');
    pr = FD.foundationParams('stemslab', {}, { stories: 2 });
    geo = FD.foundationGeometry(box, pr);
    const st = geo.find((g) => g.role === 'stem'), ft = geo.find((g) => g.role === 'footing');
    ok(st && ft && near(st.z1, 0) && near(ft.z0, -24 * IN) && near(st.z0, -16 * IN) && near(ft.outer[0][0], -(15 - 8) / 2 * IN, 1e-6) && geo.some((g) => g.role === 'slab'), 'stem walls and slab: 8" walls up to the floor on a 15" footing centred under them, its underside 24" down, a slab inside');
    pr = FD.foundationParams('crawl', {}, { stories: 1 });
    geo = FD.foundationGeometry(box, pr);
    ok(geo.length === 2 && near(geo.find((g) => g.role === 'stem').z1, -12 * IN) && near(geo.find((g) => g.role === 'footing').z0, -36 * IN) && !geo.some((g) => g.role === 'slab'), 'crawlspace: walls stop 12" under the floor (the floor framing sits on them), footing 36" down, no slab');
    pr = FD.foundationParams('basement', {}, { stories: 1 });
    geo = FD.foundationGeometry(box, pr);
    const bs = geo.find((g) => g.role === 'slab');
    ok(near(bs.z1, -12 * IN - 96 * IN) && near(geo.find((g) => g.role === 'footing').z1, -12 * IN - 96 * IN - 4 * IN), 'basement: an 8\' basement under the floor framing, its slab on top of the footing');
    pr = FD.foundationParams('stemslab', { footW: 600 }, { stories: 1 });
    ok(near(pr.footW, 600) && !pr.auto.footW && pr.auto.footD, 'a footing width typed in wins over the default; the others stay automatic');

    console.log('== RC.2 foundations in the model (follow the walls, undo)');
    const B = [[0, 0], [9000, 0], [9000, 6000], [0, 6000]];
    const { ed, levels } = await building({ loops: [B] });
    const wr = () => new ModelWriter(ed.W, ed.api, ed.mid);
    ed.modelChange(FD.placeFoundation({ level: levels[0].guid, seed: [3000, 3000], kind: 'slab' }));
    let F = FD.readFoundations(wr());
    let txt = txtOf(ed);
    ok(F.length === 1 && F[0].parts.length === 2 && /IFCELEMENTASSEMBLY\([^;]*'Foundation'[^;]*\.SITE\.,\.USERDEFINED\.\)/.test(txt) && /IFCSLAB\([^;]*\.BASESLAB\.\)/.test(txt) && /IFCFOOTING\([^;]*\.STRIP_FOOTING\.\)/.test(txt), 'a slab on grade under the walls: an IfcElementAssembly with an IfcSlab .BASESLAB. and a thickened edge (IfcFooting)');
    const T6 = OPS.snapshotModel(ed).walls[0].t;
    const ga = Number(txt.match(/'GrossArea',\$,\$,([\d.E+-]+)/)?.[1]);
    ok(near(ga, (9000 + T6) * (6000 + T6) / 1e6, 1e-3), 'the slab reaches the outside of the walls (' + ga.toFixed(3) + ' m²)');
    const lowest = async (idsL) => { const e = await quiet(IfcModel.create)(WebIFC, null); const m = await quiet((b) => e.load(b))(ed.save()); const C = e.api.GetCoordinationMatrix(m.modelID); let z = Infinity; const s2 = new Set(idsL); for (const b of m.batches) for (let i = 0; i < b.elems.ids.length; i++) if (s2.has(b.elems.ids[i])) for (let v = b.elems.v0[i]; v < b.elems.v0[i] + b.elems.vn[i]; v++) z = Math.min(z, b.positions[v * 3 + 1] * 1000); return z - C[13] * 1000; };
    ok(near(await lowest(F[0].parts), -12 * IN, 1), 'cc-ifc draws it: its lowest point 12" under the floor');
    ed.modelChange(FD.changeFoundation(F[0].guid, { kind: 'crawl' }));
    F = FD.readFoundations(wr());
    txt = txtOf(ed);
    ok(F[0].kind === 'crawl' && F[0].parts.length === 2 && /IFCWALL\([^;]*'Foundation wall'/.test(txt) && near(await lowest(F[0].parts), -36 * IN, 1), 'changed to a crawlspace: foundation walls on a footing 36" down');
    ok(/'FootingWidthUsed',\$,IFCPOSITIVELENGTHMEASURE\(457\.2/.test(txt), 'one story of walls over a crawlspace: an 18" footing');
    // walls on Level 2 too: two stories → a wider footing, without touching the foundation
    ed.modelChange(OPS.drawWalls({ storey: levels[1].guid, segs: B.map((p, i) => ({ a: p, b: B[(i + 1) % 4] })), typeKey: 'ext-2x6', height: 3000, extSide: 'right' }));
    ok(/'FootingWidthUsed',\$,IFCPOSITIVELENGTHMEASURE\(558\.8/.test(txtOf(ed)), 'walls drawn on Level 2: the footing below widens to 22" for two stories');
    ed.modelChange(FD.changeFoundation(F[0].guid, { footW: 700 }));
    ok(/'FootingWidthUsed',\$,IFCPOSITIVELENGTHMEASURE\(700/.test(txtOf(ed)), 'a footing width typed in Properties (700) is used');
    ed.modelChange(FD.changeFoundation(F[0].guid, { footW: 0 }));
    ok(/'FootingWidthUsed',\$,IFCPOSITIVELENGTHMEASURE\(558\.8/.test(txtOf(ed)), '0 puts it back to automatic');
    // the east wall moves out: the foundation follows
    const walls = OPS.snapshotModel(ed).walls.filter((w2) => w2.storey === levels[0].id);
    const east = walls.find((w2) => near(w2.a[0], 9000, 1) && near(w2.b[0], 9000, 1));
    ed.modelChange(OPS.changeWall(east.guid, { a: [10000, east.a[1]], b: [10000, east.b[1]] }));
    txt = txtOf(ed);
    F = FD.readFoundations(wr());
    const stemId = F[0].parts.find((id) => /IFCWALL/i.test(ed.api.GetLine(ed.mid, id, false).constructor.name));
    const len = qtoOf(wr(), stemId, 'Qto_WallBaseQuantities').Length;
    ok(F[0].parts.length === 2 && near(len, 2 * (10000 + T6 - 8 * IN) + 2 * (6000 + T6 - 8 * IN), 2), 'the east wall moved out 1000: the foundation follows (wall centre line ' + len.toFixed(0) + ' mm)');
    ed.modelChange(FD.changeFoundation(F[0].guid, { kind: 'basement' }));
    F = FD.readFoundations(wr());
    ok(F[0].parts.length === 3 && near(await lowest(F[0].parts), -(12 + 96 + 4) * IN - 8 * IN, 1), 'a basement: walls, footing and slab, the footing\'s underside 8\' + framing + slab + footing down');
    ed.undo();
    ok(FD.readFoundations(wr())[0].kind === 'crawl', 'undo: back to the crawlspace');
    ed.redo();
    ok(FD.readFoundations(wr())[0].kind === 'basement', 'redo: the basement again');
    saved.basement = ed.save();
    let kk = ''; try { ed.modelChange(FD.changeFoundation(F[0].guid, { stemT: 5000 })); } catch (e) { kk = e.key; }
    ok(kk === 'res.err.fdsize', 'walls 5 m thick: refused, nothing changed');
    ed.modelChange(FD.removeFoundations([F[0].guid]));
    ok(!FD.readFoundations(wr()).length && !danglingRefs(txtOf(ed)).length, 'deleted with its parts; no dangling references');
    // masonry walls: wider footings and walls
    const b3 = await building({ loops: [B], typeKey: 'cmu-8' });
    b3.ed.modelChange(FD.placeFoundation({ level: b3.levels[0].guid, seed: [3000, 3000], kind: 'stemslab' }));
    const t3 = txtOf(b3.ed);
    ok(/'FootingWidthUsed',\$,IFCPOSITIVELENGTHMEASURE\(406\.4/.test(t3), 'concrete block walls: a 16" footing (12" + 4" under masonry)');
    saved.stemslab = b3.ed.save();
    try {
      const Wi = require('web-ifc');
      const a = new Wi.IfcAPI(); await quiet(() => a.Init())();
      const id = a.OpenModel(saved.stemslab);
      ok(a.GetLineIDsWithType(id, Wi.IFCELEMENTASSEMBLY).size() === 1 && a.GetLineIDsWithType(id, Wi.IFCFOOTING).size() === 1 && a.GetLineIDsWithType(id, Wi.IFCSLAB).size() === 1, 'web-ifc (oracle): the assembly, its footing and its slab');
    } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped'); }
  }

  // ============================================================================================ RC.4 residential library
  if (want('rc4')) {
    const LI = await import(path.join(APP, 'libitem.js'));
    const CT = await import(path.join(APP, 'res-counter.js'));
    const MO = await import(path.join(APP, 'model-openings.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    const LIB = process.env.CADCRAFT_LIBRARY || path.resolve(ROOT, '../repos/library');
    console.log('== RC.4 the residential set (library repo items/residential)');
    let items = [];
    if (!fs.existsSync(path.join(LIB, 'items/residential'))) console.log('  --   no library repo at ' + LIB + ': item checks skipped');
    else {
      const dir = path.join(LIB, 'items/residential');
      items = fs.readdirSync(dir).map((d) => ({ slug: d, item: JSON.parse(fs.readFileSync(path.join(dir, d, 'item.json'), 'utf8')), credit: JSON.parse(fs.readFileSync(path.join(dir, d, 'credit.json'), 'utf8')) }));
      const bad = items.filter((x) => !LI.validateItem(x.item, { partial: true }).ok);
      ok(items.length >= 70 && !bad.length, items.length + ' items, every one a valid library item (format 1)' + (bad.length ? ': ' + bad.map((x) => x.slug).join(', ') : ''));
      ok(items.every((x) => x.credit.license === 'CC0-1.0' && x.credit.author === 'CadCraft' && x.credit.source_kind === 'own'), 'every one CC0, drawn by CadCraft (source "own")');
      const cats = new Set(items.map((x) => x.item.category));
      ok(['casework/base', 'casework/wall', 'casework/tall', 'appliances/residential', 'plumbing/fixtures', 'furniture/seating', 'furniture/beds', 'furniture/tables', 'furniture/storage'].every((c) => cats.has(c)), 'cabinets (base, wall, tall), appliances, plumbing fixtures and furniture');
      const W = items.find((x) => /w3030/.test(x.slug)).item;
      ok(Math.min(...W.body.positions.filter((_, i) => i % 3 === 2)) === 54 * IN && W.source_attrs['CC-MOUNT-HEIGHT'] === String(Math.round(54 * IN)), 'a wall cabinet carries its 54" mounting height in its body and says so');
      ok(items.every((x) => { const P = x.item.body.positions; let y1 = -Infinity; for (let i = 1; i < P.length; i += 3) y1 = Math.max(y1, P[i]); return y1 <= 0.1; }), 'every item\'s back is at y = 0 (the insertion point is the middle of the back): wall snap puts it on the wall');
      try {
        const { execFileSync } = await import('node:child_process');
        execFileSync(process.execPath, [path.join(LIB, 'tools/make-residential.mjs'), '--libitem', path.join(APP, 'libitem.js'), '--check'], { encoding: 'utf8' });
        ok(true, 'make-residential.mjs --check: the repo matches the generator');
      } catch (e) { ok(false, 'make-residential.mjs --check: ' + String(e.stdout || e.message).trim().split('\n').slice(-2).join(' ')); }
    }

    console.log('== RC.4 cabinets placed, countertops that follow them');
    if (items.length) {
      const B = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
      const { ed, levels } = await building({ loops: [B] });
      const wr = () => new ModelWriter(ed.W, ed.api, ed.mid);
      const T6 = OPS.snapshotModel(ed).walls[0].t;
      const get = (re) => items.find((x) => re.test(x.slug)).item;
      const place = async (it, x, y, rot) => ed.placeItem(it, { storey: levels[0].id, x, y, rot, sha256: await LI.itemHash(it) });
      // along the north wall's inside face (y = 4000 − t/2), facing south (rot 0: the front is −Y): B24, SB33, B24; the lazy
      // susan in the NW corner
      const yFace = 4000 - T6 / 2, xFace = T6 / 2;
      const ls = get(/lazy-susan/), b24 = get(/^base-cabinet-24-in/), sb33 = get(/^sink-base-cabinet-33/), b18 = get(/^base-cabinet-18-in/);
      const s36 = 36 * IN, w24 = 24 * IN, w33 = 33 * IN;
      await place(ls, xFace + s36 / 2, yFace, 0);
      await place(b24, xFace + s36 + w24 / 2, yFace, 0);
      await place(sb33, xFace + s36 + w24 + w33 / 2, yFace, 0);
      await place(b24, xFace + s36 + w24 + w33 + w24 / 2, yFace, 0);
      // down the west wall from the corner cabinet: a B18 facing east (rot 90: its back on x = t/2)
      await place(b18, xFace, yFace - s36 - 18 * IN / 2, 90);
      let cabs = CT.counterCabinets(wr(), levels[0].id);
      ok(cabs.length === 5, 'five counter-ready cabinets found on the level (' + cabs.map((c) => c.name.split(' (')[0]).join(', ') + ')');
      let runs = CT.counterRuns(cabs, { overhang: IN });
      const runA = (s36 + 2 * w24 + w33) * w24 + (s36 - w24) * (s36 - w24 - 0) * 0;
      ok(runs.length === 1 && runs[0].cabinets.length === 5, 'one L-shaped run: the corner cabinet joins both walls');
      const want1 = (s36 + 2 * w24 + w33) * (w24 + IN) + (s36 + 18 * IN - w24 - IN) * (w24 + IN);
      ok(near(runs[0].area, want1, 50), 'its area: both legs, 24" deep plus the 1" front overhang (' + (runs[0].area / 1e6).toFixed(3) + ' m²)');
      void runA;
      ed.modelChange(CT.placeCountertop({ level: levels[0].guid, seed: [xFace + s36 + 300, yFace - 300] }));
      let C = CT.readCountertops(wr());
      let txt = txtOf(ed);
      ok(C.length === 1 && /IFCFURNITURE\([^;]*'Countertop'[^;]*\.USERDEFINED\.\)/.test(txt) && /'CadCraft_CountertopQuantities'/.test(txt), 'a countertop: IfcFurniture "Countertop" with its area, perimeter and front edge');
      const top = await topOf(ed, [C[0].id]);
      ok(near(top.z, 36 * IN, 1), 'its top at 36" (cabinets 34½" + 1½")');
      ok(!CT.countertopState(wr(), C[0]).stale, 'it fits the cabinets');
      // one more base cabinet at the end of the run: the countertop is out of date, then fitted again
      await place(b18, xFace + s36 + 2 * w24 + w33 + 18 * IN / 2, yFace, 0);
      C = CT.readCountertops(wr());
      let st = CT.countertopState(wr(), C[0]);
      ok(st.stale && st.run.cabinets.length === 6, 'a cabinet added at the end of the run: the countertop is marked out of date');
      ed.modelChange(CT.fitCountertop(C[0].guid));
      C = CT.readCountertops(wr());
      st = CT.countertopState(wr(), C[0]);
      ok(!st.stale && near(st.run.area, want1 + 18 * IN * (w24 + IN), 50), 'Fit to the cabinets: it grows by the new cabinet');
      ed.modelChange(CT.changeCountertop(C[0].guid, { overhang: 1.5 * IN, thickness: 2 * IN }));
      C = CT.readCountertops(wr());
      ok(near(C[0].overhang, 1.5 * IN) && near((await topOf(ed, [C[0].id])).z, 34.5 * IN + 2 * IN, 1), 'overhang 1½" and thickness 2" changed in Properties');
      ed.undo();
      ok(near(CT.readCountertops(wr())[0].overhang, IN), 'undo: back to 1"');
      saved.kitchen = ed.save();
      let kk = ''; try { ed.modelChange(CT.placeCountertop({ level: levels[0].guid, seed: [3000, 1500] })); } catch (e) { kk = e.key; }
      ok(kk === 'res.err.nocabinet', 'clicking where there are no cabinets: refused');
      // the cabinets go: a wall change on the level leaves a countertop with no run as it was (no crash)
      const C0 = CT.readCountertops(wr())[0];
      ed.modelChange(CT.removeCountertops([C0.guid]));
      ok(!CT.readCountertops(wr()).length && !danglingRefs(txtOf(ed)).length, 'deleted; no dangling references');
    }

    console.log('== RC.4 door and window types');
    {
      const { ed, levels } = await building({ loops: [[[0, 0], [8000, 0], [8000, 5000], [0, 5000]]] });
      const W0 = OPS.snapshotModel(ed).walls;
      const south = W0.find((w) => near(w.a[1], 0, 1) && near(w.b[1], 0, 1)), north = W0.find((w) => near(w.a[1], 5000, 1) && near(w.b[1], 5000, 1));
      const keys = ['door-bifold', 'door-french', 'door-barn', 'door-entry-sidelites'];
      let off = 300;
      for (const k of keys) {
        const ty = MO.openingType(k);
        ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: k, offset: off, width: ty.width, height: ty.height, sill: 0, hand: 'a', face: 'left' }));
        off += ty.width + (k === 'door-barn' ? ty.width + 200 : 300);
      }
      let x = 400;
      for (const k of ['win-awning', 'win-picture', 'win-transom']) {
        const ty = MO.openingType(k);
        ed.modelChange(OPS.placeOpening({ wall: north.guid, typeKey: k, offset: x, width: ty.width, height: ty.height, sill: ty.sill, hand: 'a', face: north.extSide }));
        x += ty.width + 400;
      }
      const ops = OPS.snapshotModel(ed).openings;
      const txt = txtOf(ed);
      ok(ops.length === 7 && keys.every((k) => ops.some((o) => o.typeKey === k)), 'four new doors and three new windows placed in walls');
      ok(/\.FOLDING_TO_LEFT\./.test(txt) && /\.DOUBLE_DOOR_SINGLE_SWING\./.test(txt) && (txt.match(/IFCOPENINGELEMENT\(/g) || []).length === 7, 'IFC: the bifold folds (FOLDING_TO_LEFT), the French doors are a double door, each in its opening');
      const sym = (k) => { const o = ops.find((q) => q.typeKey === k); return MO.openingSymbol(o, OPS.snapshotModel(ed).walls.find((w) => w.id === o.wall)); };
      ok(sym('door-bifold').lines.length >= 6 && sym('door-barn').dashed.length === 1 && sym('door-entry-sidelites').arcs.length === 1 && sym('door-entry-sidelites').thin.length === 2, 'plan symbols: bifold panels folded out, the barn door\'s slide (dashed), one swing between two sidelites');
      ok(MO.openingTypeName(MO.openingType('door-bifold')) === 'Bifold closet door' && MO.openingTypeName(MO.openingType('door-single')) !== 'model.ot.door-single', 'their names (res.ot.*) beside the starter types\' (model.ot.*)');
      saved.doors = ed.save();
      try {
        const Wi = require('web-ifc');
        const a = new Wi.IfcAPI(); await quiet(() => a.Init())();
        const id = a.OpenModel(saved.doors);
        ok(a.GetLineIDsWithType(id, Wi.IFCDOOR).size() === 4 && a.GetLineIDsWithType(id, Wi.IFCWINDOW).size() === 3, 'web-ifc (oracle): four doors, three windows');
      } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped'); }
    }
  }

  // ============================================================================================ RC.3 stairs and railings
  if (want('rc3')) {
    const ST = await import(path.join(APP, 'res-stair.js'));
    const RL = await import(path.join(APP, 'res-railing.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    console.log('== RC.3 stair layouts (res-stair.js)');
    const H = 108 * IN + 12 * IN;   // 9' walls + a 12" floor: 10' floor to floor
    let L = ST.stairLayout({ kind: 'straight', start: [0, 0], angle: 0, height: H });
    ok(L.n === 16 && near(L.riser, 7.5 * IN, 1e-6) && L.treads === 15 && near(L.run, 150 * IN, 1e-6) && Object.values(L.checks).every(Boolean), 'straight, 10\' floor to floor: 16 risers of 7½", 15 treads of 10" (a 12\'-6" run), every labelled check met');
    const zs = L.pieces[0].treads.map((t) => t.z);
    ok(near(zs[0], 7.5 * IN) && near(zs[14], 15 * 7.5 * IN) && L.sides.length === 2 && near(L.sides[0][1][2], H, 1e-6), 'tread tops 7½" apart; the handrails follow the nosings up to the floor above');
    const tot = (Lx) => Lx.pieces.reduce((n, p) => n + (p.kind === 'landing' ? 1 : p.treads.length), 0);
    for (const kind of ['l', 'u', 'winder']) for (const turn of ['left', 'right']) {
      const Lk = ST.stairLayout({ kind, turn, start: [0, 0], angle: 90, height: H });
      ok(!Lk.error && tot(Lk) === 15 && Lk.outline.length === 1 && Lk.pieces.flatMap((p) => p.kind === 'landing' ? [p.z] : p.treads.map((x) => x.z)).every((z, i, arr) => i === 0 || z > arr[i - 1]), kind + ' turning ' + turn + ': 15 steps (a landing counts as one), each higher than the last, one outline');
    }
    const W = ST.stairLayout({ kind: 'winder', turn: 'left', start: [0, 0], angle: 0, height: H, width: 36 * IN });
    const wPolys = W.pieces.find((p) => p.kind === 'winders').treads.map((t) => Math.abs(t.poly.reduce((a2, q, i, arr) => a2 + q[0] * arr[(i + 1) % arr.length][1] - q[1] * arr[(i + 1) % arr.length][0], 0) / 2));
    ok(wPolys.length === 3 && near(wPolys.reduce((x, y) => x + y, 0), (36 * IN) ** 2, 1), 'three winders fanned from the inside corner fill the corner square');
    ok(ST.stairLayout({ kind: 'straight', start: [0, 0], height: H, riserMax: 8.25 * IN }).checks.riser === false, 'risers allowed up to 8¼": the check says they are over the 7¾" default');
    ok(ST.stairLayout({ kind: 'u', start: [0, 0], height: 350 }).error === 'res.err.stairshort', 'two risers are too few steps for a U: refused');
    const rp = RL.railingParts([[0, 0, 0], [3000, 0, 0]], { height: 36 * IN });
    const xs = [3.5 * IN / 2 - 0, ...rp.balusters.map((b) => b[0]), 3000 - 3.5 * IN / 2];
    const gaps = xs.slice(1).map((x2, i) => x2 - xs[i] - (i === 0 ? 0.75 * IN : 1.5 * IN) - (i === xs.length - 2 ? -0.75 * IN : 0));
    ok(rp.posts.length === 2 && rp.balusters.length >= 20 && gaps.every((g) => g < 4 * IN), 'a 3 m guard: posts at the ends, ' + rp.balusters.length + ' balusters, no gap 4" or wider (widest ' + (Math.max(...gaps) / IN).toFixed(2) + '")');

    console.log('== RC.3 stairs in the model (IFC, follows the level, the stairwell)');
    const B = [[0, 0], [8000, 0], [8000, 6000], [0, 6000]];
    const { ed, levels } = await building({ loops: [B], h: 3000 });
    const wr = () => new ModelWriter(ed.W, ed.api, ed.mid);
    // a floor on Level 2 over the whole building first, so the stair cuts its stairwell
    ed.modelChange(OPS.drawWalls({ storey: levels[1].guid, segs: B.map((p, i) => ({ a: p, b: B[(i + 1) % 4] })), typeKey: 'ext-2x6', height: 3000, extSide: 'right' }));
    ed.modelChange(OPS.placeFloor({ storey: levels[1].guid, seed: [4000, 3000], mode: 'building', kind: 'wood', thickness: 12 * IN }));
    ed.modelChange(ST.placeStair({ level: levels[0].guid, start: [1000, 800], angle: 0, kind: 'straight', width: 36 * IN }));
    let S = ST.readStairs(wr());
    let txt = txtOf(ed);
    ok(S.length === 1 && /IFCSTAIR\([^;]*\.STRAIGHT_RUN_STAIR\.\)/.test(txt) && (txt.match(/IFCSTAIRFLIGHT\(/g) || []).length === 1 && (txt.match(/IFCRAILING\([^;]*\.HANDRAIL\.\)/g) || []).length === 2, 'a straight stair: IfcStair with one IfcStairFlight and two handrails');
    const fl = txt.match(/IFCSTAIRFLIGHT\([^;]*\);/)?.[0] || '';
    ok(/,16,15,187\.5\d*,254[.\d]*,\.STRAIGHT\.\);$/.test(fl), 'the flight says 16 risers, 15 treads, 187.5 riser (3000 / 16), 254 tread (IFC4 attributes): ' + fl.slice(-40));
    ok(/'NumberOfRiser',\$,IFCCOUNTMEASURE\(16/.test(txt), 'Pset_StairCommon: 16 risers');
    const wellOpen = (t2) => (t2.match(/IFCOPENINGELEMENT\([^;]*'Stairwell'/g) || []).length;
    ok(wellOpen(txt) === 1 && /IFCRELVOIDSELEMENT/.test(txt), 'the stairwell: an opening voids the floor of Level 2 over the steps');
    // the floor's volume read back by cc-ifc: the well is cut out of it
    const volOf = async (cls) => { const e = await quiet(IfcModel.create)(WebIFC, null); const m = await quiet((b) => e.load(b))(ed.save()); let v = 0; for (const b of m.batches) { const P = b.positions, I = b.indices; for (let i = 0; i < I.length; i += 3) { const id = b.triIds[i / 3] - (m.keyBase || 0); if (!cls(id, m)) continue; const a2 = I[i] * 3, c = I[i + 1] * 3, d = I[i + 2] * 3; v += (P[a2] * (P[c + 1] * P[d + 2] - P[c + 2] * P[d + 1]) - P[a2 + 1] * (P[c] * P[d + 2] - P[c + 2] * P[d]) + P[a2 + 2] * (P[c] * P[d + 1] - P[c + 1] * P[d])) / 6; } } return Math.abs(v) * 1e9; };
    const floorId = OPS.snapshotModel(ed).derived.floors[0].id;
    const vFloor = await volOf((id) => id === floorId);
    const full = (8000 + 2 * 3.375 * IN * 0 + OPS.snapshotModel(ed).walls[0].t) * (6000 + OPS.snapshotModel(ed).walls[0].t) * 12 * IN;
    ok(vFloor < full - 0.5 * 36 * IN * 12 * IN * 1000, 'cc-ifc cuts it: the floor is ' + ((full - vFloor) / 1e9).toFixed(3) + ' m³ lighter');
    // Level 1 made taller: the stair re-sizes itself
    ed.modelChange(OPS.changeLevel(levels[0].guid, { height: 3300, shiftAbove: true }));
    txt = txtOf(ed);
    ok(/'NumberOfRiser',\$,IFCCOUNTMEASURE\(17/.test(txt) && wellOpen(txt) === 1, 'Level 1 made 3300 tall: the stair has 17 risers now, its stairwell made again');
    // L with a landing, turning right, handrail on the outside only
    S = ST.readStairs(wr());
    ed.modelChange(ST.changeStair(S[0].guid, { kind: 'l', turn: 'right', railings: 'left' }));
    txt = txtOf(ed);
    ok(/\.QUARTER_TURN_STAIR\./.test(txt) && (txt.match(/IFCSTAIRFLIGHT\(/g) || []).length === 2 && /IFCSLAB\([^;]*\.LANDING\.\)/.test(txt) && (txt.match(/IFCRAILING\([^;]*\.HANDRAIL\.\)/g) || []).length === 1, 'changed to an L turning right: two flights, a landing, one handrail (on the outside)');
    ed.modelChange(ST.changeStair(S[0].guid, { kind: 'winder' }));
    txt = txtOf(ed);
    ok(/\.QUARTER_WINDING_STAIR\./.test(txt) && /\.WINDER\.\)/.test(txt), 'with winders: an IfcStairFlight .WINDER. in place of the landing');
    ed.undo();
    ok(/\.QUARTER_TURN_STAIR\./.test(txtOf(ed)), 'undo: the landing again');
    let kk = ''; try { ed.modelChange(ST.changeStair(S[0].guid, { width: 100 })); } catch (e) { kk = e.key; }
    ok(kk === 'res.err.stairwidth', 'a 100 mm wide stair: refused');
    saved.stair = ed.save();
    // a guard round the stairwell on Level 2
    ed.modelChange(RL.placeRailing({ level: levels[1].guid, points: [[1000, 2000], [3000, 2000], [3000, 800]], kind: 'guard' }));
    let R = RL.readRailings(wr());
    txt = txtOf(ed);
    const rq = wr().readPset(R[0].id, 'CadCraft_RailingQuantities');
    ok(R.length === 1 && /IFCRAILING\([^;]*'Guardrail'[^;]*\.GUARDRAIL\.\)/.test(txt) && rq.Balusters > 20 && rq.Posts === 3, 'a guardrail drawn on Level 2: IfcRailing .GUARDRAIL. with 3 posts and ' + rq.Balusters + ' balusters');
    ed.modelChange(RL.changeRailing(R[0].guid, { height: 42 * IN }));
    R = RL.readRailings(wr());
    ok(near(R[0].height, 42 * IN, 0.01), 'its height 42" in Properties');
    ed.modelChange(RL.removeRailings([R[0].guid]));
    ed.modelChange(ST.removeStairs([S[0].guid]));
    txt = txtOf(ed);
    ok(!RL.readRailings(wr()).length && !ST.readStairs(wr()).length && !wellOpen(txt) && !danglingRefs(txt).length, 'railing and stair deleted, the stairwell with them; no dangling references');
    try {
      const Wi = require('web-ifc');
      const a = new Wi.IfcAPI(); await quiet(() => a.Init())();
      const id = a.OpenModel(saved.stair);
      ok(a.GetLineIDsWithType(id, Wi.IFCSTAIR).size() === 1 && a.GetLineIDsWithType(id, Wi.IFCSTAIRFLIGHT).size() === 2 && a.GetLineIDsWithType(id, Wi.IFCRAILING).size() === 1, 'web-ifc (oracle): the stair, its two flights, its handrail');
    } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped'); }
  }

  // ============================================================================================ RC.9 framing
  if (want('rc9')) {
    const FR = await import(path.join(APP, 'res-framing.js'));
    const RR = await import(path.join(APP, 'res-roof.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    console.log('== RC.9 framing rules and tables (res-framing.js)');
    ok(FR.headerFor(36 * IN).size === '2x6' && FR.headerFor(48 * IN).size === '2x8' && FR.headerFor(72 * IN).size === '2x10' && FR.headerFor(96 * IN).size === '2x12' && FR.headerFor(120 * IN).over && FR.headerFor(120 * IN).plies === 3, 'headers by width: 3\' 2-2x6, 4\' 2-2x8, 6\' 2-2x10, 8\' 2-2x12, wider = 3-2x12 flagged for a designer');
    ok(near(FR.boardFeet('2x4', 8 * 304.8), 16 / 3, 1e-9) && near(FR.boardFeet('2x10', 12 * 304.8), 20, 1e-9), 'board feet: a 2x4 8\' = 5.33, a 2x10 12\' = 20');
    ok(FR.sizeFor(FR.JOIST_TABLE[406.4], 12 * 304.8).size === '2x8' && FR.sizeFor(FR.JOIST_TABLE[406.4], 13 * 304.8).size === '2x10' && FR.sizeFor(FR.JOIST_TABLE[406.4], 25 * 304.8).over, 'joists by span at 16": 12\' 2x8, 13\' 2x10, 25\' beyond the table');
    const t6 = 7.25 * IN;
    const mk = (guid, a, b, typeKey = 'ext-2x6') => ({ guid, a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]), t: typeKey === 'int-2x4' ? 4.5 * IN : t6, height: 2438.4, typeKey, extSide: 'right', z: 0, baseOffset: 0 });
    const W4 = [mk('A', [0, 0], [6000, 0]), mk('B', [6000, 0], [6000, 4000]), mk('C', [6000, 4000], [0, 4000]), mk('D', [0, 4000], [0, 0])];
    const tee = mk('T', [3000, 0 + t6 / 2], [3000, 4000 - t6 / 2], 'int-2x4');
    const ops = [{ kind: 'door', offset: 1000, width: 36 * IN, sill: 0, height: 80 * IN }, { kind: 'window', offset: 4000, width: 48 * IN, sill: 36 * IN, height: 48 * IN }];
    const rA = FR.frameWall(W4[0], { walls: [...W4, tee], openings: ops, spacing: 16 * IN, corners: 'three-stud', blocking: true });
    const cnt = (r, role) => r.pieces.filter((p2) => p2.role === role).length;
    ok(!rA.error && cnt(rA, 'plate.top') === 1 && cnt(rA, 'plate.cap') === 1 && cnt(rA, 'plate.bottom') === 2, 'plates: a double top plate, the bottom plate cut at the door');
    ok(cnt(rA, 'king') === 4 && cnt(rA, 'jack') === 4 && cnt(rA, 'header') === 2 && rA.pieces.filter((p2) => p2.role === 'header').map((p2) => p2.size).join() === '2x6,2x8', 'each opening: two kings, two jacks and a header (2x6 over the door, 2x8 over the window)');
    ok(cnt(rA, 'sill') === 1 && cnt(rA, 'cripple') >= 4, 'the window: a rough sill with cripples under it, cripples over both headers');
    ok(cnt(rA, 'stud.corner') === 4 && cnt(rA, 'stud.tee') === 2, 'three-stud corners at both ends (the wall that runs through), two backer studs where the inside wall tees in');
    const studs = rA.pieces.filter((p2) => p2.role === 'stud').map((p2) => (p2.box.x0 + p2.box.x1) / 2 - rA.x0);
    ok(studs.length > 5 && studs.every((x) => near(x / (16 * IN), Math.round(x / (16 * IN)), 1e-6)), 'common studs on the 16" layout from the wall\'s start');
    const vert = rA.pieces.filter((p2) => /^(stud|king|jack)/.test(p2.role) && p2.box.z0 < 100).map((p2) => [p2.box.x0, p2.box.x1, p2.box.y0, p2.box.y1]).sort((a2, b2) => a2[0] - b2[0]);
    ok(vert.every((v, i) => i === 0 || v[0] >= vert[i - 1][1] - 0.01 || v[2] >= vert[i - 1][3] - 0.01 || v[3] <= vert[i - 1][2] + 0.01), 'no two studs in the same place');
    ok(cnt(rA, 'blocking') > 8, 'a row of blocking between the studs (not across openings)');
    const rB = FR.frameWall(W4[1], { walls: W4, openings: [], spacing: 16 * IN });
    ok(near(rA.x0, -60.3, 0.2) && near(rB.x0, 79.4, 0.2) && cnt(rB, 'stud.corner') === 2, 'at a corner the first wall runs through to the outside of the other\'s studs; the other stops against it (and runs through at its far corner)');
    const rC = FR.frameWall(W4[0], { walls: W4, openings: [], spacing: 24 * IN, corners: 'california', blocking: false });
    ok(cnt(rC, 'stud.corner') === 2 && rC.pieces.filter((p2) => p2.role === 'stud.corner').every((p2) => near(p2.box.y1 - p2.box.y0, 1.5 * IN, 0.01)) && !cnt(rC, 'blocking'), 'California corners: one flat stud at each corner; 24" layout without blocking');
    ok(FR.frameWall(mk('X', [0, 0], [3000, 0], 'cmu-8'), { walls: [] }).error === 'res.err.nostuds', 'a block wall has no studs to frame: refused');
    const fl = FR.frameFloor([[0, 0], [6000, 0], [6000, 4000], [0, 4000]], { top: 0, openings: [[[1000, 1000], [3500, 1000], [3500, 2000], [1000, 2000]]] });
    ok(fl.size === '2x10' && fl.pieces.filter((p2) => p2.role === 'rim').length === 4 && fl.pieces.filter((p2) => p2.role === 'trimmer').length === 4 && fl.pieces.filter((p2) => p2.role === 'header.floor').length === 4, 'a floor spanning 12\'-10": 2x10 joists, rims all round, doubled trimmers and headers round the stairwell');
    const cutJ = fl.pieces.filter((p2) => p2.role === 'joist' && Math.abs(p2.line[0][0] - p2.line[1][0]) < 1 && p2.line[0][0] > 1000 && p2.line[0][0] < 3500);
    ok(cutJ.length > 2 && cutJ.every((p2) => { const y0 = Math.min(p2.line[0][1], p2.line[1][1]), y1 = Math.max(p2.line[0][1], p2.line[1][1]); return y1 <= 1000 - 3 * IN + 1 || y0 >= 2000 + 3 * IN - 1; }), 'joists through the opening are cut short of it (tail joists)');
    const out4 = [[-100, -100], [6100, -100], [6100, 4100], [-100, 4100]];
    const k4 = RR.edgeKinds(out4, [], { pitch: Math.atan(0.5) * 180 / Math.PI, overhang: 300 });
    const rs = FR.frameRoof({ outline: out4, kinds: k4, plate: 2438.4, thickness: 203, spacing: 16 * IN, mode: 'stick' });
    const rc = (role) => rs.pieces.filter((p2) => p2.role === role).length;
    ok(rc('hip') === 4 && rc('ridge') === 1 && rc('rafter') > 40 && rc('ceilingjoist') > 10 && rc('collar') >= 1, 'a hip roof in rafters: four hips, a ridge board, common and jack rafters, ceiling joists, collar ties');
    ok(rs.pieces.filter((p2) => p2.role === 'rafter').every((p2) => p2.line[1][2] >= p2.line[0][2] - 1e-6 || p2.line[0][2] >= p2.line[1][2] - 1e-6), 'rafters follow the roof\'s planes');
    const rt = FR.frameRoof({ outline: out4, kinds: k4, plate: 2438.4, thickness: 203, spacing: 24 * IN, mode: 'truss' });
    ok(rt.pieces.length >= 10 && rt.pieces.every((p2) => p2.role === 'truss'), 'or trusses: ' + rt.pieces.length + ' at 24", one element each');

    console.log('== RC.9 framing in the model (follows the walls, kept pieces, the cut list)');
    const B = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
    const { ed, levels } = await building({ loops: [B] });
    const wr = () => new ModelWriter(ed.W, ed.api, ed.mid);
    let walls = OPS.snapshotModel(ed).walls;
    const south = walls.find((w2) => near(w2.a[1], 0, 1) && near(w2.b[1], 0, 1));
    ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 1500, width: 36 * IN, height: 80 * IN, sill: 0, hand: 'a', face: 'left' }));
    ed.modelChange(FR.frameHosts({ hosts: walls.map((w2) => w2.guid), spacing: 16 * IN }));
    let F = FR.readFraming(wr());
    let txt = txtOf(ed);
    ok(F.length === 4 && F.every((f) => f.parts.length > 20) && /IFCELEMENTASSEMBLY\([^;]*'Framing'/.test(txt) && /IFCMEMBER\([^;]*\.STUD\.\)/.test(txt) && /IFCMEMBER\([^;]*\.PLATE\.\)/.test(txt) && /IFCBEAM\([^;]*\.LINTEL\.\)/.test(txt), 'every wall framed: an assembly each of IfcMember studs and plates, an IfcBeam header over the door');
    const studCount = (txt.match(/IFCMEMBER\([^;]*\.STUD\.\)/g) || []).length;
    let lst = FR.lumberList(wr());
    ok(lst.rows.length >= 2 && lst.pieces > studCount && lst.rows.some((r) => r.size === '2x6' && r.stock === 8 * 304.8), 'the cut list: ' + lst.pieces + ' pieces, ' + lst.bf.toFixed(0) + ' board feet, 2x6 studs ordered as 8\' stock');
    const top = await topOf(ed, F.flatMap((f) => f.parts));
    ok(near(top.z, 2438.4 + 0, 1) || near(top.z, 3000, 1), 'cc-ifc draws the framing up to the top of the walls (' + top.z.toFixed(0) + ')');
    // keep one stud, then move the door: the framing is made again round it, the kept stud stays (flagged)
    const southFr = F.find((f) => f.host === south.guid);
    const studPid = southFr.parts.find((pid) => wr().readPset(pid, 'CadCraft_Lumber')?.Role === 'stud');
    const studGuid = wr().guidOf(studPid);
    ed.modelChange(FR.keepPiece(studGuid));
    const door = OPS.snapshotModel(ed).openings[0];
    const before = southFr.parts.length;
    ed.modelChange(OPS.changeOpening(door.guid, { offset: 3500 }));
    F = FR.readFraming(wr());
    const sf2 = F.find((f) => f.host === south.guid);
    const keptId = sf2.parts.find((pid) => wr().guidOf(pid) === studGuid);
    const kp = keptId && wr().readPset(keptId, 'CadCraft_Lumber');
    ok(keptId && kp && /check/i.test(String(kp.Check)) && sf2.parts.length >= before - 2, 'the door moved: the wall\'s framing is made again, the kept stud stays and is flagged to check');
    // a wall deleted: its framing goes with it
    const east = walls.find((w2) => near(w2.a[0], 8000, 1) && near(w2.b[0], 8000, 1));
    ed.modelChange(OPS.removeWalls([east.guid]));
    F = FR.readFraming(wr());
    ok(F.length === 3 && !F.some((f) => f.host === east.guid) && !danglingRefs(txtOf(ed)).length, 'a wall deleted: its framing goes too; no dangling references');
    ed.undo();
    ok(FR.readFraming(wr()).length === 4, 'undo: the wall and its framing back');
    // spacing 24" on one framing
    F = FR.readFraming(wr());
    ed.modelChange(FR.changeFraming(F[0].guid, { spacing: 24 * IN, blocking: false }));
    ok(near(FR.readFraming(wr()).find((f) => f.guid === F[0].guid).spacing, 24 * IN, 0.1), 'one wall changed to 24" on centre without blocking');
    saved.framing = ed.save();
    // a floor and a roof framed, the roof in trusses
    const { ed: ed2, levels: lv2 } = await building({ loops: [B] });
    const wr2 = () => new ModelWriter(ed2.W, ed2.api, ed2.mid);
    ed2.modelChange(OPS.placeFloor({ storey: lv2[0].guid, seed: [4000, 2500], mode: 'building', kind: 'wood', thickness: 12 * IN }));
    ed2.modelChange(OPS.placeRoof({ storey: lv2[0].guid, seed: [4000, 2500], pitch: Math.atan(0.5) * 180 / Math.PI, overhang: 300, edges: '' }));
    const D2 = OPS.snapshotModel(ed2).derived;
    ed2.modelChange(FR.frameHosts({ hosts: [D2.floors[0].guid, D2.roofs[0].guid], spacing: 16 * IN, roofMode: 'stick' }));
    F = FR.readFraming(wr2());
    txt = txtOf(ed2);
    ok(F.length === 2 && /IFCBEAM\([^;]*\.JOIST\.\)/.test(txt) && /IFCMEMBER\([^;]*\.RAFTER\.\)/.test(txt) && /IFCMEMBER\([^;]*\.COLLAR\.\)/.test(txt), 'a floor (IfcBeam joists, rims) and a roof (rafters, hips, a ridge, ceiling joists, collar ties) framed');
    const roofFr = F.find((f) => f.kind === 'roof');
    ed2.modelChange(FR.changeFraming(roofFr.guid, { roofMode: 'truss' }));
    txt = txtOf(ed2);
    ok((txt.match(/IFCMEMBER\([^;]*'Truss'/g) || []).length >= 10 && !/\.RAFTER\./.test(txt), 'the roof switched to trusses: one element each, no rafters left');
    saved.framed2 = ed2.save();
    try {
      const Wi = require('web-ifc');
      const a2 = new Wi.IfcAPI(); await quiet(() => a2.Init())();
      const id = a2.OpenModel(saved.framing);
      ok(a2.GetLineIDsWithType(id, Wi.IFCMEMBER).size() > 80 && a2.GetLineIDsWithType(id, Wi.IFCELEMENTASSEMBLY).size() === 4, 'web-ifc (oracle): ' + a2.GetLineIDsWithType(id, Wi.IFCMEMBER).size() + ' members in four assemblies');
    } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped'); }
  }

  // ============================================================================================ RC.10 terrain
  if (want('rc10')) {
    const TR = await import(path.join(APP, 'res-terrain.js'));
    await TR.loadTin();
    const FD = await import(path.join(APP, 'res-foundation.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    console.log('== RC.10 the ground (res-terrain.js, CivilCraft\'s tin.js)');
    const { execFileSync } = await import('node:child_process');
    let syncOk = true; try { execFileSync(process.execPath, [path.join(ROOT, 'tools/bimcraft-test/terrain-sync.mjs'), '--check'], { encoding: 'utf8' }); } catch (e) { syncOk = false; }
    ok(syncOk, 'tin.js and raster.js are byte-identical copies of CivilCraft\'s (terrain-sync.mjs --check)');
    const csv = 'Point,Northing,Easting,Elevation,Desc\n1,1000,2000,101.5,GND\n2,1010,2000,101.0,GND\n3,1000,2010,102.0,GND\n4,1010,2010,101.25,GND';
    const P4 = TR.parsePointText(csv);
    ok(P4.length === 4 && P4[0].x === 2000 && P4[0].y === 1000 && P4[0].z === 101.5, 'a PNEZD file: four points, the header skipped, easting as x');
    ok(TR.parsePointText('100 200 5\n110 200 6\n100 210 7').length === 3, 'bare E N Z rows');
    const pts = [];
    for (let x = -20000; x <= 20000; x += 2000) for (let y = -15000; y <= 15000; y += 2000) pts.push({ x, y, z: x / 10 });
    const g = TR.buildGround({ points: pts }).surface;
    const pad = { poly: [[-6000, -5000], [6000, -5000], [6000, 5000], [-6000, 5000]], z: 0, slope: 2 };
    const fin = TR.gradeSurface(g, [pad]);
    ok(near(fin.elevationAt(0, 0), 0, 1e-6) && near(fin.elevationAt(5900, 0), 0, 1) && near(fin.elevationAt(7000, 0), 500, 5) && near(fin.elevationAt(15000, 0), 1500, 5) && near(fin.elevationAt(-7000, 0), -500, 5), 'a 12 × 10 m pad on a 1:10 slope: flat on the pad, 2:1 slopes out of it (cut uphill, fill downhill), back on the ground beyond');
    const cf = TR.cutFill(g, fin);
    ok(cf.cut > 20 && cf.fill > 20 && Math.abs(cf.cut - cf.fill) < 0.5, 'cut and fill balance on a pad set at the middle of an even slope (' + cf.cut.toFixed(1) + ' / ' + cf.fill.toFixed(1) + ' m³)');
    const xml = TR.landXml([{ name: 'Existing', surface: g }], { unit: 'm' });
    ok(/<LandXML[^>]*version="1\.2"/.test(xml) && (xml.match(/<P id=/g) || []).length === g.toFaces().pts.length && /<F>\d+ \d+ \d+<\/F>/.test(xml), 'LandXML 1.2 with the surface\'s points and faces (CivilCraft reads it)');
    const C = TR.drawingContours({ blocks: [{ name: '*Model_Space', entities: [{ type: 'LWPOLYLINE', elevation: 100, vertices: [{ x: 0, y: 0 }, { x: 10, y: 0 }], closed: false }, { type: 'POLYLINE_3D', vertices: [{ x: 0, y: 5, z: 101 }, { x: 10, y: 5, z: 102 }] }, { type: 'LWPOLYLINE', elevation: 0, vertices: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }] }] });
    ok(C.lines.length === 2 && C.lines[0][0].z === 100, 'contours from a drawing: polylines at their elevation and 3D polylines (flat lines at 0 left out)');
    ok(TR.thinToGrid([{ x: 1, y: 1, z: 5 }, { x: 2, y: 2, z: 3 }, { x: 15, y: 1, z: 9 }], 10).length === 2, 'a cloud thinned to the lowest point in each cell');

    console.log('== RC.10 the ground in the model (IFC, a pad that follows the walls, paving, stepped footings)');
    const B = [[-4000, -3000], [4000, -3000], [4000, 3000], [-4000, 3000]];
    const { ed, levels } = await building({ loops: [B] });
    const wr = () => new ModelWriter(ed.W, ed.api, ed.mid);
    // survey: 1:10 slope down to the west, ground 200 under the floor at the middle
    const sv = [];
    for (let x = -20000; x <= 20000; x += 2500) for (let y = -15000; y <= 15000; y += 2500) sv.push({ x, y, z: x / 10 - 200 });
    ed.modelChange(TR.placeTerrain({ points: sv, source: 'points', interval: 500 }));
    let trn = TR.readTerrain(wr());
    let txt = txtOf(ed);
    ok(trn && trn.pts.length === sv.length && /IFCGEOGRAPHICELEMENT\([^;]*\.TERRAIN\.\)/.test(txt) && /IFCTRIANGULATEDFACESET\(/.test(txt) && /IFCRELCONTAINEDINSPATIALSTRUCTURE\([^;]*#\d+\);/.test(txt), 'the ground: an IfcGeographicElement .TERRAIN. in the site, a closed triangulated body, the survey kept with it');
    const site = ed.api.GetLineIDsWithType ? null : null; void site;
    const e3 = await quiet(IfcModel.create)(WebIFC, null), m3 = await quiet((b) => e3.load(b))(ed.save());
    const terrTris = m3.batches.reduce((n2, b) => n2 + b.elems.ids.filter((id) => id === trn.id).length, 0);
    ok(terrTris > 0, 'cc-ifc draws the ground');
    // a building pad round the house: 5' margin, 2:1 slopes, 8" under the floor
    ed.modelChange(TR.placePad({ level: levels[0].guid, seed: [0, 0] }));
    trn = TR.readTerrain(wr());
    ok(TR.readPads(wr()).length === 1 && trn.cut > 1 && trn.fill > 1, 'a building pad: cut on the uphill side, fill downhill (' + trn.cut.toFixed(1) + ' / ' + trn.fill.toFixed(1) + ' m³)');
    ok(near(TR.groundAt(wr(), 0, 0), -8 * IN, 1) && near(TR.groundAt(wr(), 4000 + 5 * 304.8 - 10, 0), -8 * IN, 2), 'the finished grade is flat 8" under the floor out to the pad\'s edge');
    // the east wall moves out 1000: the pad follows
    const east = OPS.snapshotModel(ed).walls.find((w2) => near(w2.a[0], 4000, 1) && near(w2.b[0], 4000, 1));
    ed.modelChange(OPS.changeWall(east.guid, { a: [5000, east.a[1]], b: [5000, east.b[1]] }));
    ok(near(TR.groundAt(wr(), 5000 + 5 * 304.8 - 10, 0), -8 * IN, 2), 'the east wall moved out 1000: the pad (and the grade) follow');
    // a driveway draped on the ground
    ed.modelChange(TR.placeHardscape({ level: levels[0].guid, points: [[6500, -1500], [15000, -1500], [15000, 1500], [6500, 1500]], kind: 'driveway' }));
    const H = TR.readHardscape(wr());
    txt = txtOf(ed);
    ok(H.length === 1 && /IFCSLAB\([^;]*'Paving'[^;]*\.USERDEFINED\.\)/.test(txt), 'a driveway: IfcSlab "Paving" draped on the grade');
    const e4 = await quiet(IfcModel.create)(WebIFC, null), m4 = await quiet((b) => e4.load(b))(ed.save());
    const C4 = e4.api.GetCoordinationMatrix(m4.modelID);
    let zmax = -Infinity, zmin = Infinity;
    for (const b of m4.batches) for (let i = 0; i < b.elems.ids.length; i++) if (b.elems.ids[i] === H[0].id) for (let v = b.elems.v0[i]; v < b.elems.v0[i] + b.elems.vn[i]; v++) { const z = b.positions[v * 3 + 1] * 1000 - C4[13] * 1000; zmax = Math.max(zmax, z); zmin = Math.min(zmin, z); }
    ok(zmax - zmin > 500, 'it follows the slope (rising ' + (zmax - zmin).toFixed(0) + ' mm along its length)');
    // a stem-wall foundation steps to the grade where the pad's slopes are (a pad set 3' down makes the grade fall away)
    ed.modelChange(FD.placeFoundation({ level: levels[0].guid, seed: [0, 0], kind: 'stemslab' }));
    let F = FD.readFoundations(wr());
    ok(F.length === 1 && F[0].parts.length === 3, 'a stem-wall foundation on the pad');
    ok(!/'CadCraft_Stepped'/.test(txtOf(ed)), 'on the flat pad the footings stay level');
    ed.modelChange(TR.removePads([TR.readPads(wr())[0].guid]));
    F = FD.readFoundations(wr());
    txt = txtOf(ed);
    const stepsN = Number(txt.match(/'Steps',\$,IFCINTEGER\((\d+)\)/)?.[1] || 0);
    ok(/'CadCraft_Stepped'/.test(txt) && stepsN >= 2, 'the pad taken away: on the 1:10 slope the footings step down with the ground in 8" steps (' + stepsN + ' steps)');
    ed.undo();
    ok(!/'CadCraft_Stepped'/.test(txtOf(ed)) && TR.readPads(wr()).length === 1, 'undo: the pad back, the footings level again');
    saved.terrain = ed.save();
    let kk = ''; try { ed.modelChange(TR.placeTerrain({ points: sv })); } catch (e) { kk = e.key; }
    ok(kk === 'res.err.terrainthere', 'a second ground: refused');
    ed.modelChange(TR.removeTerrain(TR.readTerrain(wr()).guid));
    ok(!TR.readTerrain(wr()) && !TR.readPads(wr()).length && !TR.readHardscape(wr()).length && !danglingRefs(txtOf(ed)).length, 'the ground deleted with its pad and its paving; no dangling references');
    try {
      const Wi = require('web-ifc');
      const a2 = new Wi.IfcAPI(); await quiet(() => a2.Init())();
      const id = a2.OpenModel(saved.terrain);
      ok(a2.GetLineIDsWithType(id, Wi.IFCGEOGRAPHICELEMENT).size() === 2 && a2.GetLineIDsWithType(id, Wi.IFCTRIANGULATEDFACESET).size() >= 2, 'web-ifc (oracle): the ground, the pad, their triangulated bodies');
    } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped'); }
  }

  // ================================================================================ RC.5 elevations, sections, sheets
  if (want('rc5')) {
    const V = await import(path.join(APP, 'res-views.js'));
    const SH = await import(path.join(APP, 'res-sheets.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    const { viewerToPlan } = await import(path.join(APP, 'model-plan.js'));
    console.log('== RC.5 hidden lines (res-views.js)');
    // boxes as triangle lists (plan mm, z up)
    const boxTris = (x0, y0, z0, x1, y1, z1) => {
      const c = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
      const f = [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]];
      return Float64Array.from(f.flatMap((t) => t.flatMap((i) => c[i])));
    };
    const front = { key: 1, cls: 'IfcWall', tris: boxTris(0, 0, 0, 4000, 200, 3000) };
    const behind = { key: 2, cls: 'IfcWall', tris: boxTris(1000, 2000, 0, 2000, 2200, 2000) };   // smaller, wholly behind the first
    const tall = { key: 3, cls: 'IfcWall', tris: boxTris(1500, 3000, 0, 2500, 3200, 4000) };      // taller: its top shows over it
    const s1 = V.projectView([front, behind, tall], { dir: V.elevationDirs.south });
    const lenOf = (key) => s1.lines.filter((l) => l[4] === key).reduce((n, l) => n + Math.hypot(l[2] - l[0], l[3] - l[1]), 0);
    ok(near(s1.bounds.x1 - s1.bounds.x0, 4000, 1) && near(s1.bounds.y1 - s1.bounds.y0, 4000, 1), 'the south elevation of three boxes: 4000 wide, 4000 high');
    ok(near(lenOf(1), 2 * 4000 + 2 * 3000, 30), 'the front box: its outline, every edge seen (' + lenOf(1).toFixed(0) + ' of 14000)');
    ok(lenOf(2) < 30, 'the box hidden behind it: no lines (' + lenOf(2).toFixed(0) + ')');
    ok(near(lenOf(3), 1000 + 2 * 1000, 40), 'the taller box behind: only the part over the front one (top and the two sides above 3000: ' + lenOf(3).toFixed(0) + ' of 3000)');
    const s2 = V.projectView([front, behind, tall], { dir: V.elevationDirs.north });
    ok(near(s2.lines.filter((l) => l[4] === 3).reduce((n, l) => n + Math.hypot(l[2] - l[0], l[3] - l[1]), 0), 2 * 1000 + 2 * 4000, 40), 'from the north the tall box is in front: its whole outline');
    const sc = V.projectView([front, behind, tall], { dir: [0, 1], cut: { o: [0, 2100] } });
    const area = (loop) => Math.abs(loop.reduce((s, p, i) => { const q = loop[(i + 1) % loop.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
    ok(sc.cuts.length === 1 && sc.cuts[0].key === 2 && near(area(sc.cuts[0].loops[0]), 1000 * 2000, 1), 'a section through the middle box: it is cut (poché 1000 × 2000), the front box is left out');
    ok(sc.lines.some((l) => l[4] === 3) && !sc.lines.some((l) => l[4] === 1), 'beyond the cut the tall box is seen; nothing in front of the plane is drawn');
    const scFar = V.projectView([front, behind, tall], { dir: [0, 1], cut: { o: [0, 2100] }, far: 500 });
    ok(!scFar.lines.some((l) => l[4] === 3), 'with a depth of 500 the tall box 900 behind is left out');

    const site = { key: 9, cls: 'IfcGeographicElement', tris: boxTris(-20000, -20000, -1000, 24000, 24000, -100) };
    const sg = V.projectView([front, site], { dir: V.elevationDirs.south });
    ok(near(sg.bounds.x0, -3000, 1) && near(sg.bounds.x1, 7000, 1) && near(sg.bounds.y0, -1000, 1) && sg.ground && sg.lines.every((l) => Math.min(l[0], l[2]) >= -3000 - 1e-6 && Math.max(l[0], l[2]) <= 7000 + 1e-6), 'with a 44 m site round it the elevation is framed on the building: the ground cut 3000 past each side');
    console.log('== RC.5 a house: elevations, a section line, the sheet set');
    const B = [[0, 0], [9000, 0], [9000, 6000], [0, 6000]];
    const { ed, levels } = await building({ loops: [B] });
    const wr = () => new ModelWriter(ed.W, ed.api, ed.mid);
    const walls = OPS.snapshotModel(ed).walls;
    const south = walls.find((w2) => near(w2.a[1], 0, 1) && near(w2.b[1], 0, 1));
    ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 2000, width: 36 * IN, height: 80 * IN, sill: 0, hand: 'a', face: 'left' }));
    ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'win-double-hung', offset: 6000, width: 36 * IN, height: 60 * IN, sill: 30 * IN, hand: 'a', face: 'right' }));
    ed.modelChange(OPS.placeRoof({ storey: levels[0].guid, seed: [4500, 3000], pitch: Math.atan(6 / 12) * 180 / Math.PI, overhang: 300, edges: '' }));
    ed.modelChange(SH.placeSectionLine({ level: levels[0].guid, a: [4500, -2000], b: [4500, 8000] }));
    let SL = SH.readSectionLines(wr());
    const txt = txtOf(ed);
    ok(SL.length === 1 && SL[0].name === 'A' && SL[0].look === 'left' && near(SL[0].b[1], 8000, 0.01) && /IFCANNOTATION\('[^']+',#\d+,'Section A',\$,'Section line',#\d+,\$\);/.test(txt), 'a section line: an IfcAnnotation "Section A" in its level, its ends and look kept in CadCraft_SectionLine');
    ok(near(SH.sectionDir(SL[0]).dir[0], -1, 1e-9), 'drawn south → north it looks to the left: west');
    ed.modelChange(SH.changeSectionLine(SL[0].guid, { look: 'right', name: 'B' }));
    SL = SH.readSectionLines(wr());
    ok(SL[0].look === 'right' && SL[0].name === 'B' && near(SH.sectionDir(SL[0]).dir[0], 1, 1e-9) && /'Section B'/.test(txtOf(ed)), 'flipped and renamed: looks east, "Section B"');
    ed.undo();
    ok(SH.readSectionLines(wr())[0].name === 'A', 'undo: back to Section A');
    let kk = ''; try { ed.modelChange(SH.placeSectionLine({ level: levels[0].guid, a: [0, 0], b: [50, 0] })); } catch (e) { kk = e.key; }
    ok(kk === 'res.err.sectionshort', 'a section line 50 mm long: refused');
    // the views, from the model read back by cc-ifc
    const e5 = await quiet(IfcModel.create)(WebIFC, null), m5 = await quiet((b) => e5.load(b))(ed.save());
    const M = viewerToPlan(e5.api.GetCoordinationMatrix(m5.modelID), wr().storeyWorld(levels[0].id));
    const els = V.modelTriangles(m5, M);
    const sEl = V.projectView(els, { dir: V.elevationDirs.south });
    const wallH = OPS.snapshotModel(ed).walls[0].height;
    ok(near(sEl.bounds.x1 - sEl.bounds.x0, 9000 + th6 + 600, 40) && sEl.bounds.y1 > wallH + 1000, 'the south elevation: the house with its eaves (' + (sEl.bounds.x1 - sEl.bounds.x0).toFixed(0) + ' wide), the roof over the walls (' + sEl.bounds.y1.toFixed(0) + ' high)');
    const doorKey = m5.batches.length && OPS.snapshotModel(ed).openings.find((o) => o.kind === 'door');
    const atH = (h) => sEl.lines.filter((l) => near(l[1], h, 3) && near(l[3], h, 3) && Math.abs(l[2] - l[0]) > 800).length;
    ok(doorKey && atH(80 * IN) >= 1 && atH(30 * IN) >= 1 && atH((30 + 60) * IN) >= 1, 'the door\'s head and the window\'s sill and head are lines on it');
    const nEl = V.projectView(els, { dir: V.elevationDirs.north });
    ok(nEl.lines.length > 4 && atH(80 * IN) >= 1 && !nEl.lines.some((l) => near(l[1], 30 * IN, 3) && near(l[3], 30 * IN, 3) && Math.abs(l[2] - l[0]) > 800 && Math.abs(l[2] - l[0]) < 1000), 'the north elevation: no window drawn (it is on the far side)');
    const sl = SH.readSectionLines(wr())[0], sd = SH.sectionDir(sl);
    const sec = V.projectView(els, { dir: sd.dir, cut: { o: sd.o }, far: sl.depth });
    ok(sec.cuts.filter((c) => c.cls === 'IfcWall').length === 2 && sec.cuts.some((c) => /Roof|Slab|Covering|Member/.test(c.cls)), 'Section A cuts both long walls and the roof (' + sec.cuts.map((c) => c.cls).join(', ') + ')');
    // the sheet set: elevations, the section, a schedule, a framed wall; a plan from a small scene
    const scene = { walls: [{ key: 1, poly: [[0, 0], [9000, 0], [9000, 200], [0, 200]], pieces: [[[0, 0], [9000, 0], [9000, 200], [0, 200]]] }], symbols: [], cut: [], below: [], rooms: [{ key: 2, at: [4500, 3000], label: ['Living', '540 sq ft'] }], dims: [{ a: [0, 0], b: [9000, 0], offPx: -24, text: '29\'-6"' }] };
    const FR = await import(path.join(APP, 'res-framing.js'));
    const fw = FR.frameWall({ guid: 'A', a: [0, 0], b: [6000, 0], len: 6000, t: th6, height: 2438.4, typeKey: 'ext-2x6', extSide: 'right', z: 0, baseOffset: 0 }, { walls: [], openings: [{ kind: 'door', offset: 1000, width: 36 * IN, sill: 0, height: 80 * IN }], spacing: 16 * IN });
    const input = {
      plans: [{ title: 'Level 1 plan', scene }],
      elevations: Object.entries(V.elevationDirs).map(([k, dir]) => ({ title: k[0].toUpperCase() + k.slice(1) + ' elevation', view: V.projectView(els, { dir }) })),
      sections: [{ title: 'Section A', view: sec }],
      schedules: [{ title: 'Doors', head: ['Mark', 'Width', 'Height'], rows: [['D1', '3\'-0"', '6\'-8"']], total: null }],
      framing: [{ title: 'Wall, 19\'-8"', pieces: fw.pieces }],
    };
    const sheets = SH.buildSet(input, { paper: 'tabloid', units: 'ftin', project: 'Test house', date: '2026-10-14' });
    ok(sheets.map((s) => s.number).join() === 'A-101,A-201,A-202,A-301,A-401,S-101', 'six sheets: the plan, two of elevations, the section, the schedule, the framing (' + sheets.map((s) => s.number).join(', ') + ')');
    const texts = (s) => s.items.filter((i) => i.t === 'text').map((i) => i.s);
    ok(texts(sheets[1]).includes('North elevation') && texts(sheets[1]).includes('East elevation') && texts(sheets[2]).includes('South elevation') && texts(sheets[2]).includes('West elevation') && ['1/4" = 1\'-0"', '3/16" = 1\'-0"', '1/8" = 1\'-0"'].includes(texts(sheets[1]).find((x) => /= 1'-0"/.test(x))), 'the four elevations two to a sheet, at a standard architectural scale (' + texts(sheets[1]).find((x) => /= 1'-0"/.test(x)) + ')');
    const sc1 = texts(sheets[1]).find((x) => /= 1'-0"/.test(x)), sc2 = texts(sheets[2]).find((x) => /= 1'-0"/.test(x));
    ok(sc1 === sc2, 'every elevation at the same scale');
    ok(sheets.every((s) => texts(s).includes('Test house    2026-10-14    Drawn with BimCraft') && texts(s).includes(s.number)), 'each sheet\'s title block: number, title, project and date');
    const frame = sheets[0].items[0].pts;
    ok(near(frame[2][0], 431.8 - 10, 1e-9) && near(frame[2][1], 279.4 - 10, 1e-9), 'tabloid paper, 10 mm border');
    const inside = sheets.every((s) => s.items.every((i) => i.t !== 'line' || i.pts.every((q) => q[0] >= 9.9 && q[0] <= 431.8 - 9.9 && q[1] >= 9.9 && q[1] <= 279.4 - 9.9)));
    ok(inside, 'every line on every sheet inside its border');
    const pdf = SH.setPdf(sheets, { paper: 'tabloid', title: 'Test house' });
    const ptxt = new TextDecoder('latin1').decode(pdf);
    const xref = Number(ptxt.match(/startxref\n(\d+)/)[1]);
    const offs = [...ptxt.slice(xref).matchAll(/^(\d{10}) 00000 n $/gm)].map((m2) => Number(m2[1]));
    ok(ptxt.startsWith('%PDF-1.4') && ptxt.slice(xref, xref + 4) === 'xref' && offs.every((o, i) => ptxt.slice(o).startsWith((i + 1) + ' 0 obj')), 'the PDF: header, every xref offset lands on its object');
    const { execFileSync } = await import('node:child_process');
    const os = await import('node:os');
    try {
      const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bim-sheets-')), 'set.pdf');
      fs.writeFileSync(f, pdf);
      const info = execFileSync('pdfinfo', [f], { encoding: 'utf8' });
      const words = execFileSync('pdftotext', ['-layout', f, '-'], { encoding: 'utf8' });
      ok(/Pages:\s+6/.test(info) && /1224 x 792 pts/.test(info), 'poppler reads it: six 11 × 17 pages');
      ok(/A-201/.test(words) && /South elevation/.test(words) && /Section A/.test(words) && /Living/.test(words) && /D1/.test(words), 'and finds the words: sheet numbers, view titles, room names, the schedule');
      if (args.includes('--keep')) { const k = path.join(ROOT, 'tmp/bimcraft-res-sheets.pdf'); fs.copyFileSync(f, k); console.log('  (kept ' + k + ')'); }
      fs.rmSync(path.dirname(f), { recursive: true, force: true });
    } catch (e) { console.log('  --   poppler not installed: PDF reader checks skipped (' + e.message.split('\n')[0] + ')'); }
    const svg = SH.sheetSvg(sheets[1], { paper: 'tabloid' });
    ok(svg.startsWith('<svg') && svg.endsWith('</svg>') && (svg.match(/<polyline/g) || []).length > 50 && !/NaN/.test(svg), 'the preview: an SVG of the sheet (' + (svg.match(/<polyline/g) || []).length + ' lines)');
    ok(!/<script|onload/i.test(SH.sheetSvg({ items: [{ t: 'text', s: '<script>x</script>', x: 10, y: 10, size: 8 }] })), 'text in the preview is escaped');
    saved.sections = ed.save();
    ed.modelChange(SH.removeSectionLines([SH.readSectionLines(wr())[0].guid]));
    ok(!SH.readSectionLines(wr()).length && !danglingRefs(txtOf(ed)).length, 'the section line deleted; no dangling references');
    try {
      const Wi = require('web-ifc');
      const a2 = new Wi.IfcAPI(); await quiet(() => a2.Init())();
      const id = a2.OpenModel(saved.sections);
      ok(a2.GetLineIDsWithType(id, Wi.IFCANNOTATION).size() === 1, 'web-ifc (oracle): the section line\'s annotation');
    } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped'); }
  }

  // ================================================================================================ RC.6 electrical
  if (want('rc6')) {
    const EL = await import(path.join(APP, 'res-elec.js'));
    const SY = await import(path.join(APP, 'res-elec-symbols.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    console.log('== RC.6 the symbols (CadCraft\'s Electrical add-on) and the rules');
    const { execFileSync } = await import('node:child_process');
    let syncOk = true; try { execFileSync(process.execPath, [path.join(ROOT, 'tools/bimcraft-test/elec-sync.mjs'), '--check'], { encoding: 'utf8' }); } catch (e) { syncOk = false; }
    ok(syncOk, 'res-elec-symbols.js is what the Electrical add-on\'s installation symbols give (elec-sync.mjs --check)');
    ok(SY.SYMBOLS.length === EL.KINDS.length && SY.SYMBOLS.every((s) => EL.DEVICES[s.key]), 'every add-on symbol has a device (' + EL.KINDS.length + ': outlets, switches, a sensor, lights, a junction box, an appliance outlet, a panel)');
    // the socket's half circle faces the room: on a wall along +x with the room to the north (+y), its arc bulges north
    const sp = EL.symbolPlan('socket', [1000, 0], Math.PI / 2, 50);
    const arc = sp.arcs[0];
    const mid = (arc.a0 + arc.a1) / 2;
    ok(near(arc.r, 150, 1e-9) && Math.sin(mid) > 0.99 && sp.lines.some((l) => near(l[1], 0, 1e-9) && near(l[3], 0, 1e-9) && near(Math.abs(l[2] - l[0]), 300, 1e-9)), 'a socket on a wall facing north: its flat side on the wall (300 wide at 1:50), the half circle into the room');
    const sw = EL.symbolPlan('socket', [0, 0], -Math.PI / 2, 50);
    ok(Math.sin((sw.arcs[0].a0 + sw.arcs[0].a1) / 2) < -0.99, 'facing south: the half circle turns with it');
    const walls = [{ guid: 'W1', a: [0, 0], b: [4000, 0], t: 200 }, { guid: 'W2', a: [4000, 0], b: [4000, 3000], t: 200 }];
    const ws = EL.wallSpot(walls, [1500, 250]);
    ok(ws && ws.wall === 'W1' && ws.side === 1 && near(ws.offset, 1500, 1e-9) && near(ws.at[1], 100, 1e-9) && near(ws.angle, Math.PI / 2, 1e-9), 'a click 250 inside the wall: the device sits on its inside face (y = 100), 1500 along, facing in');
    ok(EL.wallSpot(walls, [1500, -260]).side === -1 && EL.wallSpot(walls, [2000, 2000]) === null, 'the other face from outside; nothing far from a wall');
    ok(EL.defaultHeight('socket', 'ftin', 2438) === 16 * IN && EL.defaultHeight('switch', 'mm', 2500) === 1100 && EL.defaultHeight('luminaire', 'ftin', 2438) === 2438, 'mounting heights (planning defaults): outlets 16", switches 1100 mm, lights at the ceiling');

    console.log('== RC.6 devices in the model');
    const B = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
    const { ed, levels } = await building({ loops: [B] });
    const wr = () => new ModelWriter(ed.W, ed.api, ed.mid);
    const W = OPS.snapshotModel(ed).walls.filter((x) => x.storey === levels[0].id);
    const south = W.find((x) => near(x.a[1], 0, 1) && near(x.b[1], 0, 1));
    const spotS = EL.wallSpot(W.map((x) => ({ guid: x.guid, a: x.a, b: x.b, t: x.t })), [2000, 300]);
    ed.modelChange(EL.placeDevice({ level: levels[0].guid, kind: 'socket.double', units: 'ftin', ...spotS, circuit: '1' }));
    const spotS2 = EL.wallSpot(W.map((x) => ({ guid: x.guid, a: x.a, b: x.b, t: x.t })), [5500, 300]);
    ed.modelChange(EL.placeDevice({ level: levels[0].guid, kind: 'switch', units: 'ftin', ...spotS2, circuit: '2' }));
    ed.modelChange(EL.placeDevice({ level: levels[0].guid, kind: 'luminaire', units: 'ftin', at: [3000, 2000], circuit: '2' }));
    ed.modelChange(EL.placeDevice({ level: levels[0].guid, kind: 'downlight', units: 'ftin', at: [1500, 2000], circuit: '2' }));
    const spotB = EL.wallSpot(W.map((x) => ({ guid: x.guid, a: x.a, b: x.b, t: x.t })), [200, 2000]);
    ed.modelChange(EL.placeDevice({ level: levels[0].guid, kind: 'board', units: 'ftin', ...spotB }));
    let D = EL.readDevices(wr());
    let txt = txtOf(ed);
    ok(D.map((d) => d.tag).join() === 'L1,L2,P1,R1,S1', 'five devices tagged by kind: ' + D.map((d) => d.tag).join(', '));
    ok(/IFCOUTLET\([^;]*'R1',\.POWEROUTLET\.\)/.test(txt) && /IFCSWITCHINGDEVICE\([^;]*'S1',\.TOGGLESWITCH\.\)/.test(txt) && /IFCLIGHTFIXTURE\([^;]*\.POINTSOURCE\.\)/.test(txt) && /IFCELECTRICDISTRIBUTIONBOARD\([^;]*\.DISTRIBUTIONBOARD\.\)/.test(txt), 'IFC4 classes: IfcOutlet, IfcSwitchingDevice, IfcLightFixture, IfcElectricDistributionBoard, with their predefined types');
    const r1 = D.find((d) => d.tag === 'R1'), s1 = D.find((d) => d.tag === 'S1'), l1 = D.find((d) => d.tag === 'L1');
    ok(near(r1.height, 16 * IN, 0.01) && near(s1.height, 48 * IN, 0.01) && near(l1.height, 3000, 1) && r1.wall === south.guid && near(r1.at[1], south.t / 2, 0.5), 'heights 16", 48", the lights at the ceiling (the walls\' top); the outlet on the south wall\'s inside face');
    const top = await topOf(ed, [r1.id]);
    ok(near(top.z, 16 * IN + 115 / 2, 1), 'cc-ifc draws the outlet\'s box at its height (top ' + top.z.toFixed(0) + ')');
    // a switch controls the lights
    ed.modelChange(EL.linkLight(s1.guid, l1.guid));
    ed.modelChange(EL.linkLight(s1.guid, D.find((d) => d.tag === 'L2').guid));
    D = EL.readDevices(wr());
    ok(D.find((d) => d.tag === 'S1').controls.length === 2, 'S1 switches both lights');
    ed.modelChange(EL.linkLight(s1.guid, l1.guid));
    ok(EL.readDevices(wr()).find((d) => d.tag === 'S1').controls.length === 1, 'clicking L1 again unlinks it');
    let kk = ''; try { ed.modelChange(EL.changeDevice(r1.guid, { controls: [l1.guid] })); } catch (e) { kk = e.key; }
    ok(kk === 'res.err.elnotswitch', 'an outlet switches nothing: refused');
    kk = ''; try { ed.modelChange(EL.placeDevice({ level: levels[0].guid, kind: 'socket', at: [3000, 2000] })); } catch (e) { kk = e.key; }
    ok(kk === 'res.err.elwall', 'an outlet in the middle of the room: refused (it goes on a wall)');
    kk = ''; try { ed.modelChange(EL.changeDevice(r1.guid, { tag: 'S1' })); } catch (e) { kk = e.key; }
    ok(kk === 'res.err.eltag', 'a tag that is taken: refused');
    ed.modelChange(EL.changeDevice(r1.guid, { tag: 'R10', circuit: '3', load: 360, height: 1100 }));
    D = EL.readDevices(wr());
    const r10 = D.find((d) => d.tag === 'R10');
    ok(r10 && r10.circuit === '3' && r10.load === 360 && near(r10.height, 1100, 0.01), 'retagged R10, on circuit 3, 360 W, at 1100 mm');
    // the schedules
    const ds = EL.deviceSchedule(D, levels, { fmtLen: (mm) => Math.round(mm) + '' });
    ok(ds.rows.length === 5 && ds.rows.find((r) => r[0] === 'S1')[6] === 'L2' && ds.total[1] === '5', 'the device schedule: tag, device, level, circuit, load, height, what a switch controls');
    const cs = EL.circuitSchedule(D, { units: 'ftin' });
    const c2 = cs.rows.find((r) => r[0] === '2');
    ok(cs.rows.length === 2 && c2 && c2[1] === '3' && c2[3] === '70' && c2[4] === (70 / 120).toFixed(1), 'the circuit schedule: circuit 2 = a switch and two lights, 70 W, 0.6 A at 120 V; the panel itself left out');
    // the south wall moves out: its devices follow
    ed.modelChange(OPS.changeWall(south.guid, { a: [south.a[0], -500], b: [south.b[0], -500] }));
    D = EL.readDevices(wr());
    ok(near(D.find((d) => d.tag === 'R10').at[1], -500 + south.t / 2, 0.5) && near(D.find((d) => d.tag === 'L1').at[1], 2000, 0.01), 'the south wall moved 500 out: its outlet and switch move with it, the lights stay');
    ed.undo();
    ok(near(EL.readDevices(wr()).find((d) => d.tag === 'R10').at[1], south.t / 2, 0.5), 'undo: back on the wall where it was');
    saved.electrical = ed.save();
    // a light deleted: the switch forgets it
    ed.modelChange(EL.removeDevices([D.find((d) => d.tag === 'L2').guid]));
    D = EL.readDevices(wr());
    ok(D.length === 4 && D.find((d) => d.tag === 'S1').controls.length === 0 && !danglingRefs(txtOf(ed)).length, 'a light deleted: gone from its switch; no dangling references');
    try {
      const Wi = require('web-ifc');
      const a2 = new Wi.IfcAPI(); await quiet(() => a2.Init())();
      const id = a2.OpenModel(saved.electrical);
      ok(a2.GetLineIDsWithType(id, Wi.IFCOUTLET).size() === 1 && a2.GetLineIDsWithType(id, Wi.IFCLIGHTFIXTURE).size() === 2 && a2.GetLineIDsWithType(id, Wi.IFCSWITCHINGDEVICE).size() === 1, 'web-ifc (oracle): the outlet, two lights, the switch');
    } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped'); }
  }

  // ================================================================================================ RC.8 TakeoffCraft
  if (want('rc8')) {
    const TO = await import(path.join(APP, 'res-takeoff.js'));
    const EL = await import(path.join(APP, 'res-elec.js'));
    const FD = await import(path.join(APP, 'res-foundation.js'));
    const FR = await import(path.join(APP, 'res-framing.js'));
    const RR = await import(path.join(APP, 'res-roof.js'));
    const MW = await import(path.join(APP, 'model-walls.js'));
    const MO = await import(path.join(APP, 'model-openings.js'));
    const MS = await import(path.join(APP, 'model-slabs.js'));
    const MR = await import(path.join(APP, 'model-rooms.js'));
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    const TC = path.join(ROOT, 'public_html/assets/apps/takeoffcraft/dev');
    const TM = await import(path.join(TC, 'model.js'));
    const EMB = await import(path.join(TC, 'embed.js'));
    console.log('== RC.8 the trade packs (TakeoffCraft\'s) and the hand-off file');
    const { execFileSync } = await import('node:child_process');
    let syncOk = true; try { execFileSync(process.execPath, [path.join(ROOT, 'tools/bimcraft-test/takeoff-sync.mjs'), '--check'], { encoding: 'utf8' }); } catch (e) { syncOk = false; }
    ok(syncOk, 'res-takeoff-packs.js is what TakeoffCraft\'s trade packs give (takeoff-sync.mjs --check)');
    // a house: 8 × 6 m of 2×6, an inside 2×4 wall with a door, a window, a hip roof, a stem-wall foundation, devices, framing
    const B = [[0, 0], [8000, 0], [8000, 6000], [0, 6000]];
    const { ed, levels } = await building({ loops: [B] });
    const wr = () => new ModelWriter(ed.W, ed.api, ed.mid);
    ed.modelChange(OPS.drawWalls({ storey: levels[0].guid, segs: [{ a: [4000, 0], b: [4000, 6000] }], typeKey: 'int-2x4', topLevel: levels[1].guid, height: 3000 }));
    let walls = OPS.snapshotModel(ed).walls.filter((x) => x.storey === levels[0].id);
    const inner = walls.find((x) => x.typeKey === 'int-2x4'), south = walls.find((x) => near(x.a[1], 0, 1) && near(x.b[1], 0, 1) && x.typeKey === 'ext-2x6');
    ed.modelChange(OPS.placeOpening({ wall: inner.guid, typeKey: 'door-single', offset: 1000, width: 32 * IN, height: 80 * IN, sill: 0, hand: 'a', face: 'left' }));
    ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'win-double-hung', offset: 1000, width: 36 * IN, height: 48 * IN, sill: 36 * IN, hand: 'a', face: 'right' }));
    ed.modelChange(OPS.placeRoof({ storey: levels[0].guid, seed: [2000, 3000], pitch: Math.atan(6 / 12) * 180 / Math.PI, overhang: 300, edges: '' }));
    ed.modelChange(FD.placeFoundation({ level: levels[0].guid, seed: [2000, 3000], kind: 'stemslab' }));
    const ws = (p) => EL.wallSpot(OPS.snapshotModel(ed).walls.filter((x) => x.storey === levels[0].id).map((x) => ({ guid: x.guid, a: x.a, b: x.b, t: x.t })), p);
    ed.modelChange(EL.placeDevice({ level: levels[0].guid, kind: 'socket.double', units: 'ftin', ...ws([2000, 300]) }));
    ed.modelChange(EL.placeDevice({ level: levels[0].guid, kind: 'socket.double', units: 'ftin', ...ws([6000, 300]) }));
    ed.modelChange(EL.placeDevice({ level: levels[0].guid, kind: 'luminaire', units: 'ftin', at: [2000, 3000] }));
    walls = OPS.snapshotModel(ed).walls.filter((x) => x.storey === levels[0].id);
    ed.modelChange(FR.frameHosts({ hosts: walls.map((x) => x.guid), spacing: 16 * IN }));
    // the data the page gathers, read here from the model
    const w = wr();
    const snap = OPS.snapshotModel(ed);
    const fmtLen = (mm) => (mm / FT_).toFixed(2) + "'";
    var FT_ = 304.8;
    const wallsD = snap.walls.map((x) => ({ ...x, typeName: x.typeKey, exterior: MW.wallType(x.typeKey)?.exterior !== false }));
    const openings = MO.readOpenings(w, null, MW.readWalls(w)).map((o) => ({ ...o, typeName: o.typeKey }));
    const loopsOf = (st) => MS.storeyLoops ? MS.storeyLoops(w, st) : null;
    const roofs = [];
    for (const r of snap.derived.roofs) {
      const wl = snap.levels.find((l) => l.guid === r.walls);
      const loops = loopsOf(wl.id), o = MR.loopAt(loops.outlines, r.seed);
      roofs.push({ storey: r.storey, plan: RR.roofGeometry(o.poly, RR.edgeKinds(o.poly, MW.readWalls(w, wl.id), r), { thickness: r.thickness, fascia: r.fascia, soffit: r.soffit }) });
    }
    const founds = FD.readFoundations(w).map((f) => { const loops = loopsOf(f.storey), o = MR.loopAt(loops.outlines, f.seed); const prm = FD.foundationParams(f.kind, f.stored, FD.loadsOn(w, f.storey, loops)); return { storey: f.storey, prm, geo: FD.foundationGeometry(o.poly, prm) }; });
    const rooms = loopsOf(levels[0].id).rooms.map((r) => ({ storey: levels[0].id, poly: r.poly, holes: r.holes }));
    const lumber = FR.lumberList(w).rows;
    const scenes = new Map(snap.levels.map((l) => [l.id, { walls: snap.walls.filter((x) => x.storey === l.id).map((x) => { const d = [x.b[0] - x.a[0], x.b[1] - x.a[1]], L = Math.hypot(...d), n = [-d[1] / L * x.t / 2, d[0] / L * x.t / 2]; const poly = [[x.a[0] + n[0], x.a[1] + n[1]], [x.b[0] + n[0], x.b[1] + n[1]], [x.b[0] - n[0], x.b[1] - n[1]], [x.a[0] - n[0], x.a[1] - n[1]]]; return { key: x.id, poly, pieces: [poly] }; }), symbols: [], cut: [], below: [], rooms: [], dims: [] }]));
    const input = TO.modelQuantities({ name: 'Test house', units: 'ftin', levels: snap.levels, scenes, walls: wallsD, openings, roofs, founds, cabinets: [], devs: EL.readDevices(w), rooms, lumber, fmtLen, date: '2026-10-15' });
    ok(input.levels.length === 2 && Object.keys(input.items).length >= 12, 'the quantities gathered: ' + Object.keys(input.items).length + ' items on ' + input.levels.length + ' plans (walls, doors, windows, roof, foundation, devices, floor), ' + input.cutList.length + ' cut-list rows');
    const res = await TO.buildTakeoff(input);
    const txt = new TextDecoder('latin1').decode(res.pdf);
    ok(res.pdf && /\/EmbeddedFiles << \/Names \[\(takeoff\.takeoffcraft\.json\) \d+ 0 R\]/.test(txt) && /\/Type \/EmbeddedFile \/Subtype \/application#2Fjson/.test(txt), 'one PDF: the plans and the cut list, the takeoff attached inside (' + res.sheets.length + ' sheets)');
    // TakeoffCraft's own reader: pdf.js finds the attachment, embed.js reads it, model.js loads the takeoff
    let emb = null, pages = 0;
    try {
      const pdfjs = await import(path.join(ROOT, 'tools/takeoffcraft-test/node_modules/pdfjs-dist/legacy/build/pdf.mjs'));
      const doc = await pdfjs.getDocument({ data: res.pdf.slice(), isEvalSupported: false, verbosity: 0 }).promise;
      pages = doc.numPages;
      emb = await EMB.readEmbedded(doc);
      await (doc.destroy?.() ?? doc.cleanup?.());
    } catch (e) { console.log('  --   pdf.js for Node not installed (tools/takeoffcraft-test): ' + e.message.split('\n')[0]); }
    if (emb) ok(emb.standsFor === res.standsFor && pages === res.sheets.length, 'TakeoffCraft\'s embed.js reads the takeoff out of it (pdf.js: ' + pages + ' pages)');
    const loaded = TM.readProject(emb ? emb.takeoff : res.takeoff);
    ok(loaded.ok && !loaded.warnings.length && loaded.state.marks.length === res.takeoff.marks.length, 'TakeoffCraft\'s readProject loads it with no warnings: ' + loaded.state.items.length + ' items, ' + loaded.state.marks.length + ' marks');
    const Q = TM.quantities(loaded.state);
    const qOf = (name) => { const it = loaded.state.items.find((x) => x.name === name); return it ? Q.get(it.id) : null; };
    const FT = 304.8;
    const ext = snap.walls.filter((x) => x.typeKey === 'ext-2x6');
    const extName = loaded.state.items.find((x) => /^ext-2x6 walls/.test(x.name));
    const extQ = extName && Q.get(extName.id);
    ok(extQ && near(extQ.lengthFt, ext.reduce((s, x) => s + x.len, 0) / FT, 0.02) && extQ.unscaled === 0, 'the exterior walls: TakeoffCraft measures ' + (extQ?.lengthFt || 0).toFixed(2) + ' ft = their centrelines (' + (ext.reduce((s, x) => s + x.len, 0) / FT).toFixed(2) + ')');
    ok(extName && extName.components.length >= 4 && extName.heightFt > 9.8 && extName.csi, 'with the trade pack\'s exterior wall assembly (' + extName.components.length + ' components), the walls\' own height ' + extName.heightFt + ' ft');
    const roofIt = loaded.state.items.find((x) => /^Roof at/.test(x.name));
    const plan = roofs[0].plan, planArea = plan.faces.reduce((s, f) => s + Math.abs(RR.heightAt ? f.poly.reduce((a, p, i) => { const q = f.poly[(i + 1) % f.poly.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) / 2 : 0), 0);
    const roofQ = roofIt && Q.get(roofIt.id);
    ok(roofQ && near(roofQ.areaSqft, planArea / (FT * FT) * Math.sqrt(1 + 0.25), 0.5), 'the roof: ' + (roofQ?.areaSqft || 0).toFixed(1) + ' sq ft sloped = its plan area × 1.118 at 6/12 (TakeoffCraft\'s pitch ' + roofIt?.pitch + ' in 12)');
    const hips = loaded.state.items.find((x) => x.slope === 'hip' && x.components.length);
    const hipLen = plan.lines.filter((l) => l.kind === 'hip').reduce((s, l) => s + l.len, 0) / FT;
    ok(hips && near(Q.get(hips.id).lengthFt, hipLen, 0.05), 'the hips along their slope: ' + (hips ? Q.get(hips.id).lengthFt.toFixed(2) : '?') + ' ft = the roof\'s own hip lengths ' + hipLen.toFixed(2));
    const doorIt = loaded.state.items.find((x) => /door-single/.test(x.name));
    ok(doorIt && Q.get(doorIt.id).count === 1 && doorIt.components.length >= 3, 'the inside door counted once, with the prehung-door assembly');
    const rec = loaded.state.items.find((x) => /Duplex/.test(x.name));
    ok(rec && Q.get(rec.id).count === 2 && rec.components.some((c) => /receptacle/i.test(c.name)), 'two duplex outlets with the receptacle assembly');
    const slabIt = loaded.state.items.find((x) => x.type === 'area' && /lab/i.test(x.name));
    ok(slabIt && slabIt.heightFt > 0.3 && Q.get(slabIt.id).areaSqft > 400 && slabIt.components.some((c) => /Concrete/.test(c.name)), 'the slab by area and thickness (concrete by volume through the pack\'s formula)');
    const est = TM.estimate(loaded.state);
    ok(!est.errors?.length && est.rows.length > loaded.state.items.length, 'TakeoffCraft\'s estimate runs every assembly formula without an error (' + est.rows.length + ' rows; rates left empty)');
    const studRow = lumber[0];
    const lumIt = loaded.state.items.find((x) => x.name.startsWith(studRow.size));
    ok(lumIt && Q.get(lumIt.id).count === studRow.count, 'the cut list counted on its sheet: ' + studRow.size + ' — ' + studRow.count + ' pieces');
    if (args.includes('--keep')) { const k = path.join(ROOT, 'tmp/bimcraft-res-takeoff.pdf'); fs.writeFileSync(k, res.pdf); console.log('  (kept ' + k + ')'); }
    try { const f = path.join(ROOT, 'tmp/bimcraft-res-takeoff-check.pdf'); fs.writeFileSync(f, res.pdf); const info = execFileSync('pdfinfo', [f], { encoding: 'utf8' }); ok(new RegExp('Pages:\\s+' + res.sheets.length).test(info), 'poppler opens it too'); fs.rmSync(f); } catch (e) { console.log('  --   poppler: ' + e.message.split('\n')[0]); }
  }

  // ======================================================================================== IfcOpenShell validation
  console.log('== IfcOpenShell schema validation (when a venv with it is on this machine)');
  if (args.includes('--keep')) for (const [k, b] of Object.entries(saved)) { const f = path.join(ROOT, 'tmp/bimcraft-res-' + k + '.ifc'); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, b); console.log('  (kept ' + f + ')'); }
  {
    const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
    if (!py || !Object.keys(saved).length) console.log('  --   no venv with ifcopenshell (or nothing saved): skipped');
    else {
      const { execFileSync } = await import('node:child_process');
      const os = await import('node:os');
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-res-'));
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

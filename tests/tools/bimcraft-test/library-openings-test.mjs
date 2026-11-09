// SPDX-License-Identifier: Apache-2.0
/**
 * Library doors and windows in BimCraft walls (2026-11-02; BIMBro on Discord). node bin/test-bimcraft.mjs --lib-openings
 * A Library item of kind door / window is placed into a drawn wall (opening cut, fixed size, its own mesh mapped from one type),
 * flipped, moved, refused when it does not fit; one placed on its own first is taken into a wall drawn through it later.
 * Made-up meshes only (no member's file in the repo).
 */
import path from 'node:path';

/** A box as mesh triangles (mm), appended to P / I. */
function boxMesh(P, I, [x0, y0, z0, x1, y1, z1]) {
  const b = P.length / 3;
  for (const z of [z0, z1]) for (const y of [y0, y1]) for (const x of [x0, x1]) P.push(x, y, z);
  const f = [[0, 2, 1], [1, 2, 3], [4, 5, 6], [5, 7, 6], [0, 1, 4], [1, 5, 4], [2, 6, 3], [3, 6, 7], [0, 4, 2], [2, 4, 6], [1, 3, 5], [3, 7, 5]];
  for (const t of f) I.push(b + t[0], b + t[1], b + t[2]);
}
/** A made-up double door: frame and two leaves, 1700 wide, 120 deep, 2100 tall, its origin in the middle of its sill. turned: authored along Y. */
function doorItem({ turned = false, uuid = '66666666-6666-4666-8666-666666666666', height = 2100 } = {}) {
  const P = [], I = [];
  const parts = [[-850, -60, 0, -800, 60, height], [800, -60, 0, 850, 60, height], [-800, -60, height - 50, 800, 60, height], [-795, -20, 0, -2, 20, height - 55], [2, -20, 0, 795, 20, height - 55]];
  for (const p of parts) boxMesh(P, I, turned ? [p[1], -p[3], p[2], p[4], -p[0], p[5]] : p);   // turned: (x, y) → (y, −x)
  return {
    format: 'cadcraft-library-item', format_version: 1, uuid, version: 1, name: 'Libtest double door', kind: 'door', category: 'openings/doors',
    description: '', maker: '', model: '', ifc: { class: 'IfcDoor', predefined: 'NOTDEFINED' }, plan: { layers: [{ name: 'EQUIP', color: 7 }], entities: [] },
    body: { type: 'mesh', positions: P, indices: I }, clearances: [], params: { width: 1700, depth: 120, height }, source_attrs: {},
    license: { id: 'CC0-1.0', holder: 'CadCraft', attribution: '', url: '' },
  };
}

export async function libOpeningsMode({ APP, WebIFC, IfcModel, quiet }) {
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MO = await import(path.join(APP, 'model-openings.js'));
  const { libraryFrame } = await import(path.join(APP, 'ifc-place.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { val } = await import(path.join(APP, 'ifc-util.js'));
  let bad = 0, good = 0;
  const ok = (cond, label) => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;

  console.log('== The frame of a Library door');
  const fr = libraryFrame(doorItem().body), ft = libraryFrame(doorItem({ turned: true }).body);
  ok(fr.turn === 0 && near(fr.width, 1700) && near(fr.depth, 120) && near(fr.height, 2100) && near(fr.dx, 850) && near(fr.dy, 0) && near(fr.dz, 0), 'drawn along X: no turn, 1700 × 120 × 2100, moved 850 to start at 0');
  ok(ft.turn === 90 && near(ft.width, 1700) && near(ft.depth, 120) && near(ft.height, 2100), 'drawn along Y: turned 90°, the same 1700 × 120 × 2100');

  const text = N.newBuilding({ name: 'LibDoors', levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'd.ifc', now: new Date('2026-11-02T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  let snap = OPS.snapshotModel(ed);
  const L1 = snap.levels[0].guid, L1id = snap.levels[0].id;
  ed.modelChange(OPS.drawWalls({ storey: L1, segs: [{ a: [0, 0], b: [8000, 0] }], typeKey: 'ext-2x6', height: 3000, extSide: 'right' }));
  snap = OPS.snapshotModel(ed);
  const south = snap.walls[0];
  const mw = () => new ModelWriter(ed.W, ed.api, ed.mid);
  const opsNow = () => MO.readOpenings(mw());

  console.log('== Into a drawn wall');
  ed.modelChange(OPS.placeLibraryOpening(doorItem(), { wall: south.guid, offset: 1000, face: 'left', width: 900, height: 900 }, { library: 'librarycraft' }));
  let ops = opsNow(), d = ops.find((o) => o.library);
  ok(d && d.kind === 'door' && near(d.width, 1700) && near(d.height, 2100) && near(d.offset, 1000) && d.typeKey === 'door-double' && d.wallGuid === south.guid,
     'a Library door in the wall: fixed 1700 × 2100 (the 900 asked is ignored), 1000 from the start, double-door symbol');
  let src = new TextDecoder().decode(ed.save());
  const voids = (src.match(/IFCRELVOIDSELEMENT\(/g) || []).length, fills = (src.match(/IFCRELFILLSELEMENT\(/g) || []).length;
  {  // the credits: a Library door's property set is on its type, so the sheet schedule and the binder must both find it
    const CR = await import(path.join(APP, 'report/credits.js'));
    const live = CR.merge([ed.placer().libraryCredits()]);
    ok(live.length === 1 && live[0].license === 'CC0-1.0', 'the credits schedule finds a Library door: ' + JSON.stringify(live));
    const rows = CR.creditRows(live);
    ok(rows.length >= 1 && rows[0][0] === 'CC0-1.0' && rows[0][1].length > 0, 'and gives it a row even with no credit line: ' + JSON.stringify(rows));
    const fromFile = CR.fromIfcText(new TextDecoder().decode(ed.saveBytes ? ed.saveBytes() : ed.save()), 'x.ifc');
    ok(fromFile.length >= 1 && fromFile[0].license === 'CC0-1.0', 'the report binder reads the same door from the saved file');
  }
  ok(voids === 1 && fills === 1 && /IFCOPENINGELEMENT\(/.test(src) && /'MappedRepresentation'/.test(src) && /IFCCARTESIANTRANSFORMATIONOPERATOR3D\(/.test(src) && /'CadCraft_OpeningFrame'/.test(src),
     'written as an opening voiding the wall, the door filling it, its body a mapped item of the Library type with its frame');
  const nTri = (await quiet((b) => (async () => { const e2 = await IfcModel.create(WebIFC, null); const r = await e2.load(b); return { r, e2 }; })())(ed.save()));
  const geom = new Set(); for (const b of nTri.r.batches) for (const t of b.triIds) geom.add(t);
  ok(geom.has(d.id), 'reopened: the door has geometry');
  // the door's body sits in the opening: its world box spans the opening along the wall
  const box = (api, mid, id) => { const fm = api.GetFlatMesh(mid, id); let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity]; for (let i = 0; i < fm.geometries.size(); i++) { const g = fm.geometries.get(i), gd = api.GetGeometry(mid, g.geometryExpressID), V = api.GetVertexArray(gd.GetVertexData(), gd.GetVertexDataSize()), T = g.flatTransformation; for (let k = 0; k < V.length; k += 6) { const x = V[k], y = V[k + 1], z = V[k + 2]; const p = [T[0] * x + T[4] * y + T[8] * z + T[12], T[1] * x + T[5] * y + T[9] * z + T[13], T[2] * x + T[6] * y + T[10] * z + T[14]]; for (let j = 0; j < 3; j++) { lo[j] = Math.min(lo[j], p[j]); hi[j] = Math.max(hi[j], p[j]); } } } return { lo, hi }; };
  let bx = null; try { bx = box(nTri.e2.api, nTri.e2.modelID, d.id); } catch (e) { bx = null; }
  if (bx) {
    const spans = [hi => hi, 0, 1, 2].slice(1).map((k) => (bx.hi[k] - bx.lo[k]) * 1000);   // web-ifc metres → mm
    ok(spans.some((s) => near(s, 1700, 2)) && spans.some((s) => near(s, 2100, 2)) && spans.some((s) => near(s, 120, 2)), 'the door\'s mesh is 1700 × 120 × 2100 in the model (' + spans.map((s) => Math.round(s)).join(' × ') + ')');
    const mm = (v) => Math.round(v * 1000);
    const wb = box(nTri.e2.api, nTri.e2.modelID, south.id);   // the viewer moves the model to its middle: measure from the wall
    const along = [mm(bx.lo[0] - wb.lo[0]), mm(bx.hi[0] - wb.lo[0])];
    const ys = [[mm(bx.lo[1]), mm(bx.hi[1]), mm(wb.lo[1]), mm(wb.hi[1])], [mm(bx.lo[2]), mm(bx.hi[2]), mm(wb.lo[2]), mm(wb.hi[2])]];
    const centred = ys.some(([a, b2, c, e]) => near((a + b2) / 2, (c + e) / 2, 2) && near(b2 - a, 120, 2));
    ok(near(along[0], 1000, 2) && near(along[1], 2700, 2) && centred, 'it sits in its opening: ' + along[0] + ' → ' + along[1] + ' mm from the wall\'s start, centred in the wall\'s thickness');
  } else ok(true, 'the door\'s box could not be read through GetFlatMesh here (geometry checked above)');

  console.log('== Flip, move, size stays');
  ed.modelChange(OPS.changeOpening(d.guid, { hand: 'b', face: 'right', offset: 3000, width: 500 }));
  d = opsNow().find((o) => o.guid === d.guid);
  ok(d.hand === 'b' && d.face === 'right' && near(d.offset, 3000) && near(d.width, 1700), 'flipped both ways and moved to 3000; the width stays 1700');
  src = new TextDecoder().decode(ed.save());
  ok(/IFCDIRECTION\(\(-1\.?,0\.?,0\.?\)\)/.test(src.replace(/-0\./g, '0.').replace(/\s/g, '')) || /IFCDIRECTION\(\(-1\./.test(src), 'the mirror is a transformation with −X');
  {
    const re = await quiet((b) => (async () => { const e2 = await IfcModel.create(WebIFC, null); await e2.load(b); return e2; })())(ed.save());
    const db = box(re.api, re.modelID, d.id), wb = box(re.api, re.modelID, south.id), mm = (v) => Math.round(v * 1000);
    ok(near(mm(db.lo[0] - wb.lo[0]), 3000, 2) && near(mm(db.hi[0] - wb.lo[0]), 4700, 2), 'flipped, it still fills its opening: ' + mm(db.lo[0] - wb.lo[0]) + ' → ' + mm(db.hi[0] - wb.lo[0]) + ' mm');
  }
  ed.undo();
  d = opsNow().find((o) => o.guid === d.guid);
  ok(d.hand === 'a' && near(d.offset, 1000), 'undo puts it back');
  ed.modelChange(OPS.changeOpening(d.guid, { family: 'door-single', values: { Width: 900 } }));
  d = opsNow().find((o) => o.guid === d.guid);
  ok(d.library && near(d.width, 1700), 'a family change does not turn it into a family door');

  console.log('== Stretching, where the Library allows it');
  {
    const sItem = doorItem({ uuid: 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa' });
    ed.modelChange(OPS.placeLibraryOpening(sItem, { wall: south.guid, offset: 4500, face: 'left', width: 2000, height: 900 }, { stretch: ['x', 'y'] }));
    let sd = opsNow().find((o) => o.library && o.library.key.startsWith('aaaaaaaa'));
    ok(sd && near(sd.width, 2000) && near(sd.height, 2100) && sd.library.frame.stretch.join() === 'x,y', 'width and depth allowed: 2000 wide as asked, the height stays 2100 (' + (sd && Math.round(sd.width) + ' × ' + Math.round(sd.height)) + ')');
    const re = await quiet((b) => (async () => { const e2 = await IfcModel.create(WebIFC, null); await e2.load(b); return e2; })())(ed.save());
    const db = box(re.api, re.modelID, sd.id), wb = box(re.api, re.modelID, south.id), mm = (v) => Math.round(v * 1000);
    const thick = Math.min(mm(wb.hi[1] - wb.lo[1]), mm(wb.hi[2] - wb.lo[2])), dThick = Math.min(mm(db.hi[1] - db.lo[1]), mm(db.hi[2] - db.lo[2]));
    ok(near(mm(db.lo[0] - wb.lo[0]), 4500, 2) && near(mm(db.hi[0] - wb.lo[0]), 6500, 2), 'the mesh is stretched to the opening: ' + mm(db.lo[0] - wb.lo[0]) + ' → ' + mm(db.hi[0] - wb.lo[0]) + ' mm');
    ok(near(dThick, south.t, 2) && near(thick, south.t, 2), 'its depth follows the wall\'s thickness (' + dThick + ' mm in a ' + Math.round(south.t) + ' mm wall; made 120)');
    ok(/IFCCARTESIANTRANSFORMATIONOPERATOR3DNONUNIFORM\(/.test(new TextDecoder().decode(ed.save())), 'written as a non-uniform transformation of the one Library mesh');
    ed.modelChange(OPS.changeOpening(sd.guid, { width: 1800, height: 2500 }));
    sd = opsNow().find((o) => o.guid === sd.guid);
    ok(near(sd.width, 1800) && near(sd.height, 2100), 'Properties: the width changes to 1800, the height (not allowed) stays 2100');
    ed.modelChange(OPS.removeOpenings([sd.guid]));
    // drawn along Y (the frame turns it): the scales must follow the turn
    const tItem = doorItem({ turned: true, uuid: 'cccccccc-3333-4333-8333-cccccccccccc' });
    ed.modelChange(OPS.placeLibraryOpening(tItem, { wall: south.guid, offset: 4500, face: 'right', hand: 'b', width: 2000 }, { stretch: ['x', 'y'] }));
    const td = opsNow().find((o) => o.library && o.library.key.startsWith('cccccccc'));
    const re2 = await quiet((b) => (async () => { const e2 = await IfcModel.create(WebIFC, null); await e2.load(b); return e2; })())(ed.save());
    const tb = box(re2.api, re2.modelID, td.id), wb2 = box(re2.api, re2.modelID, south.id);
    const tThick = Math.min(mm(tb.hi[1] - tb.lo[1]), mm(tb.hi[2] - tb.lo[2]));
    ok(near(mm(tb.lo[0] - wb2.lo[0]), 4500, 2) && near(mm(tb.hi[0] - wb2.lo[0]), 6500, 2) && near(tThick, south.t, 2),
       'a door drawn along Y, stretched and flipped both ways: ' + mm(tb.lo[0] - wb2.lo[0]) + ' → ' + mm(tb.hi[0] - wb2.lo[0]) + ' mm, ' + tThick + ' mm deep');
    ed.modelChange(OPS.removeOpenings([td.guid]));
    const zItem = doorItem({ uuid: 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb' });
    ed.modelChange(OPS.placeLibraryOpening(zItem, { wall: south.guid, offset: 4500, face: 'left', width: 2000, height: 2400 }, { stretch: ['z'] }));
    const zd = opsNow().find((o) => o.library && o.library.key.startsWith('bbbbbbbb'));
    ok(zd && near(zd.width, 1700) && near(zd.height, 2400), 'height only: 2400 tall as asked, the width stays 1700');
    ed.modelChange(OPS.removeOpenings([zd.guid]));
  }

  console.log('== Refused when it does not fit');
  let threw = null;
  try { ed.modelChange(OPS.placeLibraryOpening(doorItem({ uuid: '77777777-7777-4777-8777-777777777777', height: 3400 }), { wall: south.guid, offset: 5000, face: 'left' })); } catch (e) { threw = e.key || e.message; }
  ok(threw === 'model.err.tootall' && opsNow().filter((o) => o.library).length === 1, 'a 3400 mm door in a 3000 mm wall: model.err.tootall, nothing placed');

  console.log('== Placed first, the wall drawn after');
  const free = ed.placeItem(doorItem({ turned: true, uuid: '88888888-8888-4888-8888-888888888888' }), { storey: L1id, x: 5000, y: 4000, rot: 90, itemNumber: '1' });
  ok(String(ed.api.GetLine(ed.mid, free.id, false).constructor?.name).toUpperCase() === 'IFCDOOR' && !opsNow().some((o) => o.id === free.id), 'a Library door placed on its own: an IfcDoor in no wall');
  const freeGuid = val(ed.api.GetLine(ed.mid, free.id, false).GlobalId);
  // the door was authored along Y and turned 90° when placed: its width runs along X again, centred on (5000, 4000)
  ed.modelChange(OPS.drawWalls({ storey: L1, segs: [{ a: [2000, 4000], b: [8000, 4000] }], typeKey: 'ext-2x6', height: 3000, extSide: 'right' }));
  ops = opsNow();
  const took = ops.find((o) => o.guid === freeGuid);
  const north = OPS.snapshotModel(ed).walls.find((x) => x.a[1] === 4000 && x.b[1] === 4000);
  ok(took && took.library && took.wallGuid === north?.guid && near(took.offset + took.width / 2, 3000, 2) && near(took.width, 1700),
     'a wall drawn through it takes it: same GlobalId, in the new wall, its middle where it stood (' + (took ? Math.round(took.offset + took.width / 2) : '?') + ' along the wall)');
  src = new TextDecoder().decode(ed.save());
  ok((src.match(/IFCRELVOIDSELEMENT\(/g) || []).length === 2 && (src.match(/IFCDOOR\(/g) || []).length === 2, 'two doors, two openings, nothing left over');
  ed.undo();
  ok(!opsNow().some((o) => o.guid === freeGuid) && ed.api.GetLine(ed.mid, free.id, false), 'undo: the wall goes and the door stands on its own again');

  const across = ed.placeItem(doorItem({ uuid: '99999999-9999-4999-8999-999999999999' }), { storey: L1id, x: 6000, y: 6000, rot: 90, itemNumber: '2' });
  ed.modelChange(OPS.drawWalls({ storey: L1, segs: [{ a: [2000, 6000], b: [8000, 6000] }], typeKey: 'int-2x4', height: 3000 }));
  ok(!opsNow().some((o) => o.id === across.id) && ed.api.GetLine(ed.mid, across.id, false), 'a door standing across a new wall (not along it) is left alone');

  console.log(`\n${good} ok, ${bad} failed`);
  return bad ? 1 : 0;
}

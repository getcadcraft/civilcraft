/* SPDX-License-Identifier: Apache-2.0 */
/**
 * wall-shape-test.mjs — the wall Shape tools (0.9 WT.6, session walls-09), DOM-free:  node bin/test-bimcraft.mjs --wallshape
 * Known answers (worked out by hand, mm):
 *   gable profile 3000 → 4500 → 3000 on a 5000 × 200 wall: elevation 5000·3000 + ½·5000·1500 = 18.75e6 mm², × 200 = 3.75 m³
 *   that wall with a 900 × 2000 wall opening: 3.75 − 0.9·2.0·0.2 = 3.39 m³ net
 *   single slant 10° on 5000 × 200 × 3000: a shear, the volume stays 5000·200·3000 = 3.0 m³
 *   double slant, both faces in by atan(0.02): thickness 200 − 2·0.02·z, volume 5000·(200·3000 − 0.02·3000²) = 2.1 m³
 *   a 4000 × 100 partition under a ceiling at 2400: 0.96 m³; the ceiling raised to 2500: 1.00 m³
 *   under a 45° hip roof with no overhang over a 6200 × 4200 outline (walls 0..6000 × 0..4000, 200 thick, 3000 high): a partition at x = 3000
 *   from y = 500 to 3500 reaches 3000 + (y + 100) up to the ridge at y = 2000 (5100), so its elevation is 3000 · (3600 + 5100) / 2 = 13.05e6 mm²,
 *   × 100 = 1.305 m³, with a ring vertex on the ridge
 */
import path from 'node:path';

export async function wallShapeMode({ APP, WebIFC, IfcModel, quiet }) {
  let bad = 0;
  const ok = (cond, label, detail = '') => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 1e-4) => Math.abs(a - b) <= e;
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const SH = await import(path.join(APP, 'wall-shape.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const { val } = await import(path.join(APP, 'ifc-util.js'));
  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  const fresh = async (name) => boot(new TextEncoder().encode(N.newBuilding({ name, levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 's.ifc', now: new Date('2026-11-06T12:00:00Z') })));
  let ed = await fresh('Shape');
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const L1 = () => OPS.snapshotModel(ed).levels[0];
  const walls = () => MW.readWalls(W());
  const qto = (id) => { const w = W(), d = w.defNamed(id, 'Qto_WallBaseQuantities'), out = {}; for (const h of d?.line.Quantities || []) { const q = w.api.GetLine(w.mid, h.value, false); out[val(q.Name)] = Number(val(q.VolumeValue ?? q.AreaValue ?? q.LengthValue)); } return out; };
  const bodyType = (id) => { const w = W(), g = (x) => (x ? w.api.GetLine(w.mid, x.value ?? x, false) : null); const sh = g(w.api.GetLine(w.mid, id, false).Representation); return (sh?.Representations || []).map((h) => val(g(h).RepresentationType)).find((t) => t !== 'Curve2D'); };
  const refuse = (fn) => { try { fn(); return null; } catch (e) { return e.key || e.message; } };

  console.log('== a gable profile on a free wall');
  ed.modelChange(OPS.drawWalls({ storey: L1().guid, segs: [{ a: [0, 0], b: [5000, 0] }], typeKey: 'concrete-200', height: 3000 }));
  let g = walls()[0];
  ok(near(qto(g.id).GrossVolume, 3.0), 'plain wall 5000 × 200 × 3000 = 3.0 m³', qto(g.id).GrossVolume);
  const n0 = ed.changes.length;
  ed.modelChange(SH.setWallShape(g.guid, { profile: { top: [[0, 3000], [2500, 4500], [5000, 3000]] } }));
  ok(ed.changes.length === n0 + 1, 'one undo step');
  g = walls()[0];
  ok(bodyType(g.id) === 'Brep', 'the body is a faceted brep', bodyType(g.id));
  ok(near(qto(g.id).GrossVolume, 3.75), 'gable volume 3.75 m³', qto(g.id).GrossVolume);
  ok(near(qto(g.id).GrossSideArea, 18.75), 'gable side area 18.75 m²', qto(g.id).GrossSideArea);
  ok(SH.readShape(g).profile?.top?.length === 3, 'the profile is stored on the wall');

  console.log('== a wall opening (no door or window)');
  ed.modelChange(SH.addWallOpening({ wall: g.guid, offset: 1000, width: 900, height: 2000, sill: 0 }));
  let wo = SH.readWallOpenings(W());
  ok(wo.length === 1 && near(wo[0].offset, 1000, 0.01) && near(wo[0].width, 900, 0.01), 'one wall opening at 1000, 900 wide', JSON.stringify(wo.map((o) => [o.offset, o.width])));
  ok(near(qto(g.id).NetVolume, 3.39), 'net volume 3.39 m³', qto(g.id).NetVolume);
  ok(refuse(() => ed.modelChange(SH.addWallOpening({ wall: g.guid, offset: 4500, width: 900, height: 2000, sill: 0 }))) === 'wshape.err.nofit', 'an opening past the wall\'s end is refused');
  ed.modelChange(SH.changeWallOpening(wo[0].guid, { offset: 2000 }));
  ok(near(SH.readWallOpenings(W())[0].offset, 2000, 0.01), 'the opening moves along the wall');
  ed.undo();
  ok(near(SH.readWallOpenings(W())[0].offset, 1000, 0.01), 'undo: back at 1000');

  console.log('== save and reopen');
  const bytes = ed.save(), txt = new TextDecoder().decode(bytes);
  ok(/IFCFACETEDBREP\(/.test(txt) && /'wallopening'/.test(txt), 'the file holds the brep and the wall opening');
  ed = await boot(bytes);
  g = walls()[0];
  ok(SH.readShape(g).profile?.top?.length === 3 && near(qto(g.id).NetVolume, 3.39) && SH.readWallOpenings(W()).length === 1, 'reopened: profile, quantities and opening kept');
  ed.modelChange(SH.removeWallOpenings([SH.readWallOpenings(W())[0].guid]));
  ok(!SH.readWallOpenings(W()).length && near(qto(g.id).NetVolume, 3.75), 'the opening removed: net = gross again');

  console.log('== slanted walls');
  ed.modelChange(SH.setWallShape(g.guid, { profile: null, slant: [10] }));
  g = walls()[0];
  ok(near(qto(g.id).GrossVolume, 3.0), 'single slant 10°: 3.0 m³ (a shear)', qto(g.id).GrossVolume);
  const a = Math.atan(0.02) * 180 / Math.PI;
  ed.modelChange(SH.setWallShape(g.guid, { slant: [-a, a] }));
  ok(near(walls()[0] && qto(g.id).GrossVolume, 2.1), 'double slant, both faces in by atan(0.02): 2.1 m³', qto(g.id).GrossVolume);
  ed.modelChange(SH.setWallShape(g.guid, { slant: null }));
  g = walls()[0];
  ok(!g.shape && bodyType(g.id) === 'SweptSolid' && near(qto(g.id).GrossVolume, 3.0), 'nothing set: the plain extrusion again', bodyType(g.id));
  ok(refuse(() => ed.modelChange(SH.setWallShape(g.guid, { profile: { top: [[0, 3000], [5000, 0]] } }))) === 'wshape.err.low', 'a top down to the base is refused');
  ok(refuse(() => ed.modelChange(SH.setWallShape(g.guid, { profile: { top: [[3000, 3000], [1000, 3500]] } }))) === 'wshape.err.profile', 'a profile running backwards is refused');

  console.log('== attach the top to a ceiling, then to a roof');
  ed = await fresh('Attach');
  ed.modelChange(OPS.drawWalls({ storey: L1().guid, segs: [{ a: [0, 0], b: [6000, 0] }, { a: [6000, 0], b: [6000, 4000] }, { a: [6000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }], typeKey: 'concrete-200', height: 3000 }));
  ed.modelChange(OPS.drawWalls({ storey: L1().guid, segs: [{ a: [1000, 2000], b: [5000, 2000] }], typeKey: 'int-100', height: 3000 }));
  let p = walls().find((x) => x.a[0] === 1000);
  ed.modelChange(OPS.placeCeiling({ storey: L1().guid, seed: [3000, 1000], mode: 'room', height: 2400, thickness: 12.7 }));
  const ce = OPS.snapshotModel(ed).derived.ceilings[0];
  ok(SH.attachChoices(W(), p).some((c) => c.guid === ce.guid && c.top), 'the ceiling is offered to attach to');
  ed.modelChange(SH.setWallShape(p.guid, { attachTop: ce.guid }));
  p = walls().find((x) => x.guid === p.guid);
  ok(near(qto(p.id).GrossVolume, 0.96), 'partition under the ceiling at 2400: 0.96 m³', qto(p.id).GrossVolume);
  ed.modelChange(OPS.changeDerived([ce.guid], { height: 2500 }));
  ok(near(qto(p.id).GrossVolume, 1.0), 'the ceiling raised to 2500: the wall follows, 1.00 m³', qto(p.id).GrossVolume);
  ed.undo();
  ok(near(qto(p.id).GrossVolume, 0.96), 'undo: 0.96 m³ again');
  ed.modelChange(OPS.removeWalls([p.guid]));
  ed.modelChange(OPS.drawWalls({ storey: L1().guid, segs: [{ a: [3000, 500], b: [3000, 3500] }], typeKey: 'int-100', height: 3000 }));
  ed.modelChange(OPS.placeRoof({ storey: L1().guid, seed: [3000, 2000], pitch: 45, overhang: 0, edges: '' }));
  const rf = OPS.snapshotModel(ed).derived.roofs[0];
  p = walls().find((x) => x.a[0] === 3000);
  ed.modelChange(SH.setWallShape(p.guid, { attachTop: rf.guid }));
  p = walls().find((x) => x.guid === p.guid);
  ok(near(qto(p.id).GrossVolume, 1.305, 2e-3), 'partition under the 45° hip roof: 1.305 m³', qto(p.id).GrossVolume);
  const w0 = W(), outl = MW.wallOutlines(walls().map((x) => ({ key: x.guid, a: x.a, b: x.b, t: x.t }))).get(p.guid);
  const body = SH.bodyFor(w0, p, outl);
  const peak = Math.max(...body.verts.slice(body.ring).map((v) => v[2]));
  ok(near(peak, 5100, 0.5), 'the top reaches the ridge at 5100 (a vertex on it)', peak);
  ok(refuse(() => ed.modelChange(SH.setWallShape(p.guid, { attachBase: rf.guid }))) === 'wshape.err.attach', 'a roof is not offered as a base');
  console.log(bad ? `\n${bad} FAILED` : '\nall ok');
  return bad ? 1 : 0;
}

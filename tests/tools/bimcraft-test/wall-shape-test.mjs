/* SPDX-License-Identifier: Apache-2.0 */
/**
 * wall-shape-test.mjs — the wall Shape tools (0.9 WT.6, sessions walls-09 and walls-shape-10), DOM-free:  node bin/test-bimcraft.mjs --wallshape
 * walls-shape-10 (curved walls, copies, the slanted plan outline, the tools in a view): its known answers are worked out where it starts, below.
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

export async function wallShapeMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
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

  // ------------------------------------------------------------------------------------------------ walls-shape-10 (2026-11-11)
  // Known answers (by hand, mm):
  //   A curved wall: a quarter circle, centre line 5000 long (R = 10000/π = 3183.10), 200 thick. The body runs along the plan's own
  //   chords: the 4° rule gives ceil(90/4) = 23 chords of δ = 90°/23 each on both faces, so every plan area is the true ring's times
  //   sin(δ)/δ = 0.999223. Gable 3000 → 4500 → 3000 along the arc: the true ring holds t·∫z ds = 200 · 18.75e6 = 3.75 m³ (the ring's
  //   area element is t·ds), the chord body 3.75 · 0.999223 = 3.7471 m³; its side area is measured along the centre line: 18.75 m².
  //   The same wall upright with a single slant of 10° towards its centre: each level's ring has radius R − z·tan10°, so
  //   V = t·(π/2)·(R·H − tan10°·H²/2) = 200 · 1.570796 · (9549297 − 793478) = 2.7507 m³, × 0.999223 = 2.7486 m³.
  //   A 900 × 2000 wall opening takes 0.9 · 2.0 · 0.2 = 0.36 m³ off the net volume.
  //   A slanted straight wall on the plan: cut 1200 above its base, 10°: the outline moves tan10° · 1200 = 211.59 mm to the wall's left.
  const VIEW = await import(path.join(APP, 'wall-shape-view.js'));
  const MOD = await import(path.join(APP, 'model-modify.js'));
  const EE = await import(path.join(APP, 'elev-edit.js'));
  const chordK = Math.sin(Math.PI / 46) / (Math.PI / 46);
  console.log('== curved walls: profile, slant, wall opening');
  ed = await fresh('Curved');
  const Rc = 10000 / Math.PI;
  ed.modelChange(OPS.drawWalls({ storey: L1().guid, segs: [{ a: [Rc, 0], b: [0, Rc], bulge: Math.tan(Math.PI / 8) }], typeKey: 'concrete-200', height: 3000 }));
  let cw = walls()[0];
  ok(near(cw.len, 5000, 0.01) && cw.bulge > 0, 'a quarter-circle wall, 5000 along its centre line', cw.len);
  ed.modelChange(SH.setWallShape(cw.guid, { profile: { top: [[0, 3000], [2500, 4500], [5000, 3000]] } }));
  cw = walls()[0];
  ok(bodyType(cw.id) === 'Brep', 'the curved wall takes a profile: its body is a faceted brep', bodyType(cw.id));
  ok(near(qto(cw.id).GrossVolume, 3.75 * chordK, 5e-4), 'gable along the arc: 3.75 m³ × sin δ / δ = 3.7471 m³ (23 chords)', qto(cw.id).GrossVolume);
  ok(near(qto(cw.id).GrossSideArea, 18.75, 1e-6), 'side area along the centre line: 18.75 m²', qto(cw.id).GrossSideArea);
  ed.modelChange(SH.addWallOpening({ wall: cw.guid, offset: 2000, width: 900, height: 2000, sill: 0 }));
  let cwo = SH.readWallOpenings(W());
  ok(cwo.length === 1 && near(cwo[0].offset, 2000, 0.01) && near(qto(cw.id).GrossVolume - qto(cw.id).NetVolume, 0.36, 1e-6), 'a wall opening in it at 2000 along the arc: 0.36 m³ off the net volume', JSON.stringify([cwo[0]?.offset, qto(cw.id).NetVolume]));
  ed.modelChange(SH.changeWallOpening(cwo[0].guid, { offset: 3000, width: 1200 }));
  cwo = SH.readWallOpenings(W());
  ok(near(cwo[0].offset, 3000, 0.01) && near(cwo[0].width, 1200, 0.01), 'moved and widened along the arc: 3000, 1200 wide', JSON.stringify([cwo[0].offset, cwo[0].width]));
  const savedFiles = { 'curved-gable-opening': ed.save() };
  ed.modelChange(SH.removeWallOpenings([cwo[0].guid]));
  ed.modelChange(SH.setWallShape(cw.guid, { profile: null, slant: [10] }));
  const vSl = 200 * (Math.PI / 2) * (Rc * 3000 - Math.tan(10 * Math.PI / 180) * 3000 * 3000 / 2) / 1e9;
  ok(near(qto(cw.id).GrossVolume, vSl * chordK, 5e-4), 'single slant 10° towards its centre: 2.7486 m³', qto(cw.id).GrossVolume);
  const bytes2 = ed.save();
  savedFiles['curved-slant'] = bytes2;
  ok(/IFCTRIMMEDCURVE\(/.test(new TextDecoder().decode(bytes2)), 'its Axis is still the arc');
  ed.modelChange(SH.setWallShape(cw.guid, { slant: null }));
  cw = walls()[0];
  ok(!cw.shape && bodyType(cw.id) === 'SweptSolid' && near(qto(cw.id).GrossVolume, 3.0, 5e-3), 'nothing set: the curved extrusion again', qto(cw.id).GrossVolume);

  console.log('== a curved wall under a ceiling');
  ed = await fresh('CurvedAttach');
  ed.modelChange(OPS.drawWalls({ storey: L1().guid, segs: [{ a: [0, 0], b: [8000, 0] }, { a: [8000, 0], b: [8000, 8000] }, { a: [8000, 8000], b: [0, 8000] }, { a: [0, 8000], b: [0, 0] }], typeKey: 'concrete-200', height: 3000 }));
  ed.modelChange(OPS.drawWalls({ storey: L1().guid, segs: [{ a: [2000 + Rc, 2000], b: [2000, 2000 + Rc], bulge: Math.tan(Math.PI / 8) }], typeKey: 'concrete-200', height: 3000 }));
  ed.modelChange(OPS.placeCeiling({ storey: L1().guid, seed: [6500, 6500], mode: 'room', height: 2400, thickness: 12.7 }));
  const ce2 = OPS.snapshotModel(ed).derived.ceilings[0];
  cw = walls().find((x) => x.bulge);
  ed.modelChange(SH.setWallShape(cw.guid, { attachTop: ce2.guid }));
  ok(near(qto(cw.id).GrossVolume, 200 * 5000 * 2400 / 1e9 * chordK, 5e-4), 'the free curved wall under the ceiling at 2400: 2.4 m³ × sin δ / δ = 2.3981 m³', qto(cw.id).GrossVolume);

  console.log('== copies carry the shape and the wall openings');
  ed = await boot(new TextEncoder().encode(N.newBuilding({ name: 'Copy', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'c.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  const LV = () => OPS.snapshotModel(ed).levels;
  ed.modelChange(OPS.drawWalls({ storey: LV()[0].guid, segs: [{ a: [0, 0], b: [6000, 0] }, { a: [6000, 0], b: [6000, 4000] }, { a: [6000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }], typeKey: 'concrete-200', height: 3000 }));
  // (the partition stands off the room's middle: a ceiling whose stored seed lies on a free-standing wall cannot be copied — model-slabs.js, as before)
  ed.modelChange(OPS.drawWalls({ storey: LV()[0].guid, segs: [{ a: [1000, 1500], b: [5000, 1500] }], typeKey: 'int-100', height: 3000 }));
  ed.modelChange(OPS.placeCeiling({ storey: LV()[0].guid, seed: [3000, 3000], mode: 'room', height: 2400, thickness: 12.7 }));
  const ce3 = OPS.snapshotModel(ed).derived.ceilings[0];
  let part = walls().find((x) => x.a[0] === 1000), south = walls().find((x) => x.a[0] === 0 && x.b[0] === 6000);
  ed.modelChange(SH.setWallShape(part.guid, { attachTop: ce3.guid, slant: [5] }));
  ed.modelChange(SH.addWallOpening({ wall: part.guid, offset: 1500, width: 900, height: 2000, sill: 0 }));
  ed.modelChange(SH.setWallShape(south.guid, { profile: { top: [[0, 3000], [3000, 3600], [6000, 3000]] } }));
  const nBefore = ed.changes.length;
  ed.modelChange(OPS.copyLevel({ from: LV()[0].guid, to: LV()[1].guid }));
  ok(ed.changes.length === nBefore + 1, 'Copy level: one undo step');
  const l2 = LV()[1].id;
  let part2 = walls().find((x) => x.storey === l2 && x.a[0] === 1000), south2 = walls().find((x) => x.storey === l2 && x.a[0] === 0 && x.b[0] === 6000);
  const ce4 = OPS.snapshotModel(ed).derived.ceilings.find((c) => c.storey === l2);
  ok(SH.readShape(south2).profile?.top?.[1]?.[1] === 3600 && bodyType(south2.id) === 'Brep', 'the copied wall keeps its profile (a brep on the new level)', JSON.stringify(SH.readShape(south2).profile));
  ok(JSON.stringify(SH.readShape(part2).slant) === '[5]', 'and its slant', JSON.stringify(SH.readShape(part2).slant));
  ok(!!ce4 && SH.readShape(part2).attachTop === ce4.guid && ce4.guid !== ce3.guid, 'an attached top goes to the copied ceiling of the new level');
  let wo2 = SH.readWallOpenings(W());
  ok(wo2.length === 2 && wo2.some((o) => o.wallGuid === part2.guid && near(o.offset, 1500, 0.01) && near(o.width, 900, 0.01)), 'the wall opening is copied: 2 in the model, the copy at 1500', JSON.stringify(wo2.map((o) => [o.offset, o.width])));
  ok(near(qto(part2.id).GrossVolume - qto(part2.id).NetVolume, 0.9 * 2.0 * 0.1, 1e-6), 'the copy\'s net volume has the opening off: 0.18 m³', qto(part2.id).GrossVolume - qto(part2.id).NetVolume);
  const copyGuid = wo2.find((o) => o.wallGuid === part2.guid).guid;
  ed.undo();
  ok(SH.readWallOpenings(W()).length === 1 && !walls().some((x) => x.storey === l2), 'undo: the level is empty again, one opening');
  ed.redo();
  ok(SH.readWallOpenings(W()).some((o) => o.guid === copyGuid), 'redo: the same opening again (same GlobalId)');
  // Copy (the Move tool with Copy on): model-modify.js moveElements, carried by withShapeCopies
  const nC = ed.changes.length, l1 = LV()[0].id;
  const moves = [{ guid: south.guid, dx: 0, dy: -3000 }];
  ed.modelChange(SH.addWallOpening({ wall: south.guid, offset: 500, width: 800, height: 1000, sill: 900 }));
  ed.modelChange(SH.withShapeCopies(MOD.moveElements(moves, { copy: true }), moves));
  ok(ed.changes.length === nC + 2, 'Copy: one undo step (after the opening\'s own)', ed.changes.length - nC);
  const dup = walls().find((x) => x.storey === l1 && Math.abs(x.a[1] + 3000) < 1 && Math.abs(x.b[1] + 3000) < 1);
  ok(!!dup && SH.readShape(dup).profile?.top?.[1]?.[1] === 3600, 'the copy of the gable wall has the gable', JSON.stringify(dup && SH.readShape(dup).profile));
  const dupOps = SH.readWallOpenings(W()).filter((o) => dup && o.wallGuid === dup.guid);
  ok(dupOps.length === 1 && near(dupOps[0].offset, 500, 0.01) && near(dupOps[0].sill, 900, 0.01) && near(dupOps[0].height, 1000, 0.01), 'and its wall opening (500 along, sill 900, 800 × 1000)', JSON.stringify(dupOps.map((o) => [o.offset, o.sill, o.width, o.height])));
  ed.undo();
  ok(!walls().some((x) => Math.abs(x.a[1] + 3000) < 1) && SH.readWallOpenings(W()).filter((o) => o.wallGuid === south.guid).length === 1, 'undo takes the copy and its opening away together');

  savedFiles['copies'] = ed.save();
  console.log('== a slanted wall on the plan');
  ed = await fresh('Lean');
  ed.modelChange(OPS.drawWalls({ storey: L1().guid, segs: [{ a: [0, 0], b: [5000, 0] }], typeKey: 'concrete-200', height: 3000 }));
  g = walls()[0];
  const base0 = MW.wallOutlines([{ key: g.guid, a: g.a, b: g.b, t: g.t }]).get(g.guid);
  ok(SH.planOutline(W(), g, base0, 1200) === base0, 'an upright wall: the plan keeps its outline');
  ed.modelChange(SH.setWallShape(g.guid, { slant: [10] }));
  g = walls()[0];
  const sh10 = Math.tan(10 * Math.PI / 180) * 1200;
  let po = SH.planOutline(W(), g, base0, 1200);
  ok(po.every((q, i) => near(q[0], base0[i][0], 1e-6) && near(q[1], base0[i][1] + sh10, 1e-6)), 'single slant 10°, cut at 1200: the outline is 211.59 mm to the wall\'s left', JSON.stringify(po.map((q) => q[1].toFixed(2))));
  ed.modelChange(SH.setWallShape(g.guid, { slant: [10, 0] }));
  g = walls()[0];
  po = SH.planOutline(W(), g, base0, 1200);
  const ys = po.map((q) => q[1]);
  ok(near(Math.max(...ys), 100 + sh10, 1e-6) && near(Math.min(...ys), -100, 1e-6), 'double slant 10° / 0°: the left face moves 211.59, the right face stays (wider at the cut)', JSON.stringify(ys.map((v) => v.toFixed(2))));
  po = SH.planOutline(W(), g, base0, 4000);
  ok(near(Math.max(...po.map((q) => q[1])), 100 + Math.tan(10 * Math.PI / 180) * 3000, 1e-6), 'a cut above the wall\'s top: no further than its top (528.98)');

  console.log('== the Shape tools in a view (elevation, section, the wall\'s own face)');
  ed.modelChange(SH.setWallShape(g.guid, { slant: null }));
  g = walls()[0];
  const snapV = () => OPS.snapshotModel(ed);
  const Fs = EE.frameOf('elevation:south', { levels: snapV().levels });
  let face = VIEW.faceOf(Fs, snapV(), g);
  ok(face && near(face.xOf(1250), 1250) && near(face.sOf(4000), 4000) && near(face.zOf(1500), 1500), 'south elevation: x is the distance along the wall, y its height');
  const Fn = EE.frameOf('elevation:north', { levels: snapV().levels });
  ok(near(VIEW.faceOf(Fn, snapV(), g).sOf(-1000), 1000), 'north elevation: the wall runs the other way (x −1000 is 1000 along)');
  const Fe = EE.frameOf('elevation:east', { levels: snapV().levels });
  ok(VIEW.faceOf(Fe, snapV(), g) === null, 'east elevation: the wall does not face it');
  // a drag of the middle of the top: add a point, raise it
  let pr = VIEW.editProfile(g, SH.readShape(g), { type: 'add', line: 'top', s: 2500 });
  ok(JSON.stringify(pr) === '{"top":[[0,3000],[2500,3000],[5000,3000]],"bottom":null}', 'a point added on the top line at 2500', JSON.stringify(pr));
  ed.modelChange(VIEW.profileOp(g, { type: 'add', line: 'top', s: 2500 }));
  g = walls()[0];
  ed.modelChange(VIEW.profileOp(g, { type: 'move', line: 'top', i: 1, s: face.sOf(2500), z: face.zOf(4500) }));
  g = walls()[0];
  ok(near(qto(g.id).GrossVolume, 3.75), 'the point dragged to 4500 in the view: the gable, 3.75 m³', qto(g.id).GrossVolume);
  ed.modelChange(VIEW.profileOp(g, { type: 'move', line: 'top', i: 1, s: 9000, z: 4500 }));
  g = walls()[0];
  ok(SH.readShape(g).profile.top[1][0] === 4990, 'a point cannot pass the next one (kept 10 mm short of the end)', SH.readShape(g).profile.top[1][0]);
  ed.undo(); g = walls()[0];
  ed.modelChange(VIEW.profileOp(g, { type: 'segment', line: 'top', i: 0, dz: 500 }));
  g = walls()[0];
  ok(JSON.stringify(SH.readShape(g).profile.top) === '[[0,3500],[2500,5000],[5000,3000]]', 'a piece of the top dragged up 500: both its ends rise', JSON.stringify(SH.readShape(g).profile.top));
  ok(near(qto(g.id).GrossVolume, 200 * (2500 * (3500 + 5000) / 2 + 2500 * (5000 + 3000) / 2) / 1e9), 'volume 200 · (2500 · 4250 + 2500 · 4000) = 4.125 m³', qto(g.id).GrossVolume);
  ed.undo(); g = walls()[0];
  ed.modelChange(VIEW.profileOp(g, { type: 'remove', line: 'top', i: 1 }));
  g = walls()[0];
  ok(!g.shape && bodyType(g.id) === 'SweptSolid', 'the point removed: straight again, no profile left on the wall');
  // a wall opening dragged as a rectangle, then resized and moved by its grips
  const oNew = VIEW.openingFromRect(face, g, [1003, 898], [1904, 2103]);
  ok(oNew.offset === 1000 && oNew.width === 900 && oNew.sill === 900 && oNew.height === 1200, 'a rectangle dragged on the face, snapped to 10 mm: 1000 along, 900 wide, sill 900, 1200 high', JSON.stringify(oNew));
  ed.modelChange(SH.addWallOpening(oNew));
  let vo = SH.readWallOpenings(W())[0];
  let ch = VIEW.dragOpening(face, g, vo, 'e', [2400, 1500]);
  ok(ch.offset === 1000 && ch.width === 1400 && ch.sill === 900 && ch.height === 1200, 'the right grip dragged to 2400: 1400 wide', JSON.stringify(ch));
  ch = VIEW.dragOpening(face, g, vo, 'nw', [800, 2500]);
  ok(ch.offset === 800 && ch.width === 1100 && ch.height === 1600, 'the top-left grip to (800, 2500): starts at 800, 1100 wide, 1600 high', JSON.stringify(ch));
  ch = VIEW.dragOpening(face, g, vo, 'move', [1500, 1000], [1000, 1200]);
  ok(ch.offset === 1500 && ch.sill === 700 && ch.width === 900 && ch.height === 1200, 'dragged by its middle 500 along and 200 down: 1500, sill 700, the size kept', JSON.stringify(ch));
  const faceN = VIEW.faceOf(Fn, snapV(), g);
  ch = VIEW.dragOpening(faceN, g, vo, 'e', [-700, 1500]);
  ok(ch.offset === 700 && ch.width === 1200, 'in the north elevation the view\'s right grip is the opening\'s start: 700, 1200 wide', JSON.stringify(ch));
  ed.modelChange(SH.changeWallOpening(vo.guid, VIEW.dragOpening(face, g, vo, 'e', [2400, 1500])));
  ok(near(SH.readWallOpenings(W())[0].width, 1400, 0.01), 'the resize written by the same op Properties uses');
  // slant: the wall seen end-on in the east elevation
  const cross = VIEW.crossWallsOf(Fe, snapV());
  ok(cross.length === 1 && cross[0].guid === g.guid && cross[0].side === 1 && near(cross[0].x, 0) && near(cross[0].y1, 3000), 'east elevation (looking west, its right is +y): the wall is seen end-on, its left to the view\'s right', JSON.stringify(cross));
  ok(VIEW.slantFromHandle(cross[0], Math.tan(10 * Math.PI / 180) * 3000) === 10 && VIEW.slantFromHandle(cross[0], -262.5) === -5, 'the top handle dragged 528.98 (tan 10° × 3000) to the wall\'s left: 10°; 262.5 the other way: −5°');
  const co = VIEW.crossOutline(cross[0], [10]);
  ok(near(co[1][0] - co[0][0], 528.98, 0.01) && near(co[2][0] - co[3][0], 528.98, 0.01), 'its leaning cross-section in the view: both faces 528.98 over at the top', JSON.stringify(co.map((q) => q[0].toFixed(1))));
  ok(VIEW.crossWallsOf(Fs, snapV()).length === 0, 'the south elevation sees it from the side: no slant handle there');
  // attach by picking in a view
  ed = await fresh('Pick');
  ed.modelChange(OPS.drawWalls({ storey: L1().guid, segs: [{ a: [0, 0], b: [6000, 0] }, { a: [6000, 0], b: [6000, 4000] }, { a: [6000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }], typeKey: 'concrete-200', height: 3000 }));
  ed.modelChange(OPS.drawWalls({ storey: L1().guid, segs: [{ a: [1000, 2000], b: [5000, 2000] }, { a: [3000, 500], b: [3000, 1500] }], typeKey: 'int-100', height: 3000 }));
  ed.modelChange(OPS.placeCeiling({ storey: L1().guid, seed: [2000, 1000], mode: 'building', height: 2400, thickness: 12.7 }));
  ed.modelChange(OPS.placeRoof({ storey: L1().guid, seed: [3000, 3000], pitch: 45, overhang: 0, edges: '' }));
  const tg = SH.attachTargets(W());
  ok(tg.length === 2 && tg.some((x) => x.kind === 'ceiling' && near(x.z0, 2400) && near(x.z1, 2412.7)) && tg.some((x) => x.kind === 'roof' && x.z1 > 4900), 'the ceiling (2400 to 2412.7) and the roof are there to attach to', JSON.stringify(tg.map((x) => [x.kind, x.z0, x.z1])));
  const Fs2 = EE.frameOf('elevation:south', { levels: snapV().levels });
  const tv = VIEW.targetsInView(Fs2, snapV(), tg);
  const pc = VIEW.pickTarget(tv, [3000, 2405], 'top', 0), prf = VIEW.pickTarget(tv, [3000, 4500], 'top', 0);
  ok(pc?.kind === 'ceiling' && prf?.kind === 'roof' && VIEW.pickTarget(tv, [3000, 4500], 'base', 0) === null, 'a click at 2405 picks the ceiling, at 4500 the roof; a roof is never a base');
  const pw = walls().filter((x) => x.t < 150);
  const nA = ed.changes.length;
  ed.modelChange(SH.setWallsShape(pw.map((x) => x.guid), { attachTop: pc.guid }));
  ok(ed.changes.length === nA + 1 && walls().filter((x) => x.t < 150).every((x) => SH.readShape(x).attachTop === pc.guid), 'two walls picked, then the ceiling: both attached in one undo step');
  ok(near(qto(pw[0].id).GrossVolume, 4000 * 100 * 2400 / 1e9) && near(qto(pw[1].id).GrossVolume, 1000 * 100 * 2400 / 1e9), 'their tops are at 2400: 0.96 m³ and 0.24 m³', JSON.stringify(pw.map((x) => qto(x.id).GrossVolume)));
  // the wall's own face view (any wall, a curved one unrolled) and the 3D helpers
  const Fw = VIEW.wallFrame('wall:' + pw[0].guid, snapV());
  const itW = Fw.items(snapV());
  ok(Fw.kind === 'wall' && itW.walls.length === 1 && near(itW.walls[0].x1, 4000) && near(VIEW.faceOf(Fw, snapV(), pw[0]).sOf(1234), 1234), 'a wall\'s own face view: x runs 0 to its length');
  const arcW = { guid: 'x'.repeat(22), id: 1, storey: L1().id, a: [Rc, 0], b: [0, Rc], bulge: Math.tan(Math.PI / 8), t: 200, len: 5000, height: 3000, baseOffset: 0 };
  const fa = VIEW.faceOf(Fs2, { levels: snapV().levels, walls: [arcW] }, arcW);
  ok(fa?.curved && near(fa.sOf(fa.xOf(1234)), 1234, 0.01) && near(fa.xOf(2500), Rc * Math.cos(Math.PI / 4), 0.01), 'a curved wall in an elevation: seen flattened, its points still found (1234 along ↔ x)');
  const hitP = VIEW.rayPlane([2500, -5000, 1500], [0, 1, 0], ...Object.values(VIEW.wallPlane({ a: [0, 0], b: [5000, 0], t: 200 }, 0)));
  const wc = VIEW.wallCoords({ a: [0, 0], b: [5000, 0], t: 200, baseOffset: 300 }, hitP);
  ok(near(wc.s, 2500) && near(wc.z, 1200) && near(wc.off, 0), '3D: a ray onto the wall\'s plane gives its place on the wall (2500 along, 1200 above its base)', JSON.stringify(wc));
  // the saved files against the IFC schema, when a venv with IfcOpenShell is on this machine (as model-test.mjs does)
  {
    const fs = await import('node:fs'), os = await import('node:os');
    const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((q) => fs.existsSync(q));
    if (!py) console.log('  --   no venv with ifcopenshell: schema check skipped');
    else {
      const { execFileSync } = await import('node:child_process');
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-wallshape-'));
      const files = Object.entries(savedFiles).map(([k, b0]) => { const f = path.join(dir, k + '.ifc'); fs.writeFileSync(f, b0); return f; });
      let out = '';
      try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), ...files], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || ''); }
      const res = out.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
      ok(res.length === files.length && res.every((r) => r.errors === 0), 'IfcOpenShell finds no schema errors in ' + res.map((r) => path.basename(r.file) + ' (' + r.errors + ')').join(', ') + (res.some((r) => r.errors) ? ': ' + res.flatMap((r) => r.first).slice(0, 3).join(' | ') : ''));
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  console.log(bad ? `\n${bad} FAILED` : '\nall ok');
  return bad ? 1 : 0;
}

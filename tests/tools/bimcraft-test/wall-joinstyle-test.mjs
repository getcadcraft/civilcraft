/* SPDX-License-Identifier: Apache-2.0 */
/**
 * wall-joinstyle-test.mjs — join style and layer priority on a real IFC model (0.9 WT.5; Disallow join FX.70; session walls-join-10), DOM-free:
 *   node bin/test-bimcraft.mjs --joinstyle
 * A 5000 x 4000 room of 114.3 mm walls (int-2x4: 12.7 + 88.9 + 12.7). Every expected value is worked out in the comment beside it.
 */
import path from 'node:path';

export async function joinStyleMode({ APP, WebIFC, IfcModel, quiet }) {
  let bad = 0;
  const ok = (cond, label, detail = '') => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const MM = await import(path.join(APP, 'model-modify.js'));
  const JS = await import(path.join(APP, 'wall-joinstyle.js'));
  const PG = await import(path.join(APP, 'wall-plan-graphics.js'));
  const PM = await import(path.join(APP, 'project-materials.js'));
  const { joinKey } = await import(path.join(APP, 'walls/joins.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const boot = async (bytes) => {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(bytes);
    return new IfcEditor(WebIFC, eng);
  };
  const text = N.newBuilding({ name: 'Join style', levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'js.ifc', now: new Date('2026-11-10T12:00:00Z') });
  let ed = await boot(new TextEncoder().encode(text));
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const L1 = OPS.snapshotModel(ed).levels[0];
  const walls = () => MW.readWalls(W());
  const recs = () => MW.readJoinRecords(W());
  const by = (list, g) => list.find((x) => x.guid === g);
  const area = (p) => Math.abs(MW.polyArea(p));
  const outlines = () => MW.wallOutlines(walls().map((x) => ({ key: x.guid, a: x.a, b: x.b, t: x.t, bulge: x.bulge, off: x.joinOff })));
  const foot = (g) => area(outlines().get(g));                                         // the plan outline
  const body = (g) => area(MW.storedShape(W(), by(walls(), g).id).points);             // the profile the 3D body is extruded from
  const roomArea = () => OPS.loopsOf(ed, L1.id).rooms.map((r) => r.area).sort((a, b) => b - a)[0];
  const T = 114.3, H = T / 2;

  console.log('== a room, every corner a mitre (the default)');
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [5000, 0] }, { a: [5000, 0], b: [5000, 4000] }, { a: [5000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }], typeKey: 'int-2x4', height: 2700 }));
  const [s, e, n] = walls();
  const SE = joinKey({ guid: s.guid, pos: 'end' }, { guid: e.guid, pos: 'start' });
  // a mitred wall's outline is a trapezoid on its centre line: thickness x centre length
  ok(near(foot(s.guid), T * 5000) && near(foot(e.guid), T * 4000) && near(body(s.guid), T * 5000), 'mitred: south 114.3 x 5000 = 571 500 mm2, east 114.3 x 4000 = 457 200 mm2 (plan outline and the body profile)', [foot(s.guid), foot(e.guid), body(s.guid)]);
  ok(recs().every((r) => r.style === 'mitre' && r.through === null) && walls().every((x) => !x.joinOff.st && x.joins.every((j) => j.style === undefined)), 'no style stored: every record reads as a mitre, the wall rows are as before');
  const room0 = roomArea();
  ok(near(room0, (5000 - T) * (4000 - T), 1), 'the room: 4885.7 x 3885.7 = 18 984 364 mm2', room0);
  const places = JS.joinPlaces(walls());
  const pSE = places.find((p) => p.key === SE);
  ok(places.length === 4 && pSE && pSE.kind === 'L' && pSE.can === 'style' && near(pSE.at[0], 5000) && near(pSE.at[1], 0) && JS.nearestJoin(places, [4950, 30], 100)?.key === SE && JS.nearestJoin(places, [2500, 2000], 100) === null, 'joinPlaces: four corners; the south-east one is found by a click near (5000, 0)');

  console.log('== butt: the south wall runs through');
  let n0 = ed.changes.length;
  ed.modelChange(JS.setJoinStyle(SE, { style: 'butt', through: s.guid }), { label: 'Join style' });
  ok(ed.changes.length === n0 + 1, 'one undo step');
  // south runs on to the east wall's far face x = 5057.15: its centre length grows by 57.15 → 114.3 x 5057.15 = 578 032.245
  // east stops on the south wall's side y = 57.15: 114.3 x (4000 - 57.15) = 450 667.755. Together as before: 1 028 700.
  ok(near(foot(s.guid), T * (5000 + H)) && near(foot(e.guid), T * (4000 - H)) && near(foot(s.guid) + foot(e.guid), T * 9000), 'butt: south 114.3 x 5057.15 = 578 032.245, east 114.3 x 3942.85 = 450 667.755 (sum unchanged 1 028 700)', [foot(s.guid), foot(e.guid)]);
  ok(near(body(s.guid), T * (5000 + H)) && near(body(e.guid), T * (4000 - H)), 'the 3D bodies (the extrusion profiles) follow');
  const { val } = await import(path.join(APP, 'ifc-util.js'));
  const qto = (g) => { const w = W(), d = w.defNamed(by(walls(), g).id, 'Qto_WallBaseQuantities'), out = {}; for (const h of d?.line.Quantities || []) { const x = w.api.GetLine(w.mid, h.value, false); out[val(x.Name)] = Number(val(x.VolumeValue ?? x.AreaValue ?? x.LengthValue)); } return out; };
  // quantities are in the file's units (m2, m3): 0.578032 m2 footprint, x 2.7 m high = 1.560687 m3
  ok(near(qto(s.guid).GrossFootprintArea, T * (5000 + H) / 1e6, 1e-5) && near(qto(s.guid).GrossVolume, T * (5000 + H) * 2700 / 1e9, 1e-5), 'the quantities follow: GrossFootprintArea 0.578032 m2, GrossVolume 1.560687 m3', qto(s.guid));
  const o = outlines().get(s.guid), oe = outlines().get(e.guid);
  ok(o.some((p) => near(p[0], 5000 + H) && near(p[1], -H)) && o.some((p) => near(p[0], 5000 + H) && near(p[1], H)) && oe.some((p) => near(p[0], 5000 - H) && near(p[1], H)) && oe.some((p) => near(p[0], 5000 + H) && near(p[1], H)), 'south ends at x = 5057.15 from y = -57.15 to 57.15; east starts at y = 57.15 from x = 4942.85 to 5057.15');
  let r = recs().find((x) => x.key === SE);
  ok(r.style === 'butt' && r.through === s.guid && recs().filter((x) => x.style !== 'mitre').length === 1, 'the record holds it: butt, the south wall runs through; the other three stay mitres');
  ok(by(walls(), s.guid).joins.find((j) => j.key === SE).through === true && by(walls(), e.guid).joins.find((j) => j.key === SE).through === false && by(walls(), s.guid).joinOff.st.b.style === 'butt', 'readWalls says it on both walls (through on the south wall only)');
  ok(near(roomArea(), room0, 1), 'the room stays closed, same area (the inside faces did not move)', roomArea());
  // the explicit option gives the same outline as the stored style
  const viaOpt = MW.wallOutlines(walls().map((x) => ({ key: x.guid, a: x.a, b: x.b, t: x.t })), { styles: new Map([[SE, { style: 'butt', through: s.guid }]]) });
  ok(near(area(viaOpt.get(s.guid)), T * (5000 + H)) && near(area(MW.wallOutlines(walls().map((x) => ({ key: x.guid, a: x.a, b: x.b, t: x.t }))).get(s.guid)), T * 5000), 'wallOutlines({ styles }) gives the same; with no styles and no stored style it is the mitre');

  console.log('== Next: the east wall runs through; square off; back to mitre');
  let pl = JS.joinPlaces(walls()).find((p) => p.key === SE);
  ed.modelChange(JS.setJoinStyle(SE, JS.otherThrough(pl)), { label: 'Join style' });
  // east runs down to the south wall's far face y = -57.15: 114.3 x 4057.15 = 463 732.245; south stops at x = 4942.85: 114.3 x 4942.85 = 564 967.755
  ok(near(foot(e.guid), T * (4000 + H)) && near(foot(s.guid), T * (5000 - H)) && recs().find((x) => x.key === SE).through === e.guid, 'Next: east 114.3 x 4057.15 = 463 732.245, south 114.3 x 4942.85 = 564 967.755', [foot(e.guid), foot(s.guid)]);
  pl = JS.joinPlaces(walls()).find((p) => p.key === SE);
  ok(JS.nextChoice(pl).style === 'square' && JS.nextChoice(pl).through === e.guid, 'a click cycles butt to square off and keeps which wall runs through');
  ed.modelChange(JS.setJoinStyle(SE, JS.nextChoice(pl)), { label: 'Join style' });
  ok(recs().find((x) => x.key === SE).style === 'square' && near(foot(e.guid), T * (4000 + H)), 'square off at a right angle: the same shape as butt (114.3 x 4057.15)');

  console.log('== the style stays with the join when walls move; undo, redo');
  n0 = ed.changes.length;
  ed.modelChange(MM.moveElements([{ guid: n.guid, dx: 0, dy: 500 }]), { label: 'Move' });
  // the north wall 500 up: the east wall is 4500 long on its centre line, + 57.15 through the corner = 114.3 x 4557.15 = 520 882.245
  ok(recs().find((x) => x.key === SE).style === 'square' && near(foot(e.guid), T * (4500 + H)), 'after a Move the corner is still square off: east 114.3 x 4557.15 = 520 882.245', foot(e.guid));
  ed.undo();
  ok(near(foot(e.guid), T * (4000 + H)), 'undo of the Move');
  ed.undo();
  ok(recs().find((x) => x.key === SE).style === 'butt' && recs().find((x) => x.key === SE).through === e.guid, 'undo of the style: butt again (one step)');
  ed.redo();
  ok(recs().find((x) => x.key === SE).style === 'square', 'redo: square off again');

  console.log('== save and reload; an older file');
  const bytes = ed.save(), txt = new TextDecoder().decode(bytes);
  ok(/IFCRELCONNECTSPATHELEMENTS\([^;]*'CadCraft join L square [12]'/.test(txt) && (txt.match(/'CadCraft join L'/g) || []).length === 3, 'the file: one IfcRelConnectsPathElements named "CadCraft join L square 1|2", three plain "CadCraft join L"');
  ed = await boot(bytes);
  r = recs().find((x) => x.key === SE);
  ok(r && r.style === 'square' && r.through === e.guid && near(foot(e.guid), T * (4000 + H)) && near(body(e.guid), T * (4000 + H)), 'reloaded: the style, the wall that runs through and the shapes are as saved');
  // an older file = the same file with the style word taken out of the name: it opens as a mitre
  const old = await boot(new TextEncoder().encode(txt.replace(/'CadCraft join L square [12]'/, "'CadCraft join L'")));
  const oldRecs = MW.readJoinRecords(new ModelWriter(WebIFC, old.api, old.mid));
  ok(oldRecs.length === 4 && oldRecs.every((x) => x.style === 'mitre'), 'a record with no style word (every older file) reads as a mitre');

  console.log('== the style goes only when the join goes; a T has no choice');
  ed.modelChange(OPS.changeWall(e.guid, { joinAllowed: { a: false } }), { label: 'Disallow join' });
  ok(!recs().some((x) => x.key === SE) && recs().every((x) => x.style === 'mitre'), 'Disallow join at the east wall\'s start: the record (and its style) is gone');
  // free at its start: the east wall's start is square at y = 0, its end still mitred: 114.3 x 4000
  ok(near(foot(e.guid), T * 4000), 'the free end is square at the wall\'s own end: 114.3 x 4000', foot(e.guid));
  ed.modelChange(OPS.changeWall(e.guid, { joinAllowed: { a: true } }), { label: 'Allow join' });
  r = recs().find((x) => x.key === SE);
  ok(r && r.style === 'mitre' && near(foot(s.guid), T * 5000), 'Allow join: a new join, a mitre again');
  ok(JS.wallEndAt(walls(), [4990, 20], 100)?.guid && JS.wallEndAt(walls(), [2500, 2000], 100) === null, 'wallEndAt: the wall end under a click (the Disallow join tool)');
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [2000, 0], b: [2000, 4000] }], typeKey: 'int-2x4', height: 2700 }));
  const tee = recs().find((x) => x.kind === 'T');
  let refused = '';
  try { ed.modelChange(JS.setJoinStyle(tee.key, { style: 'butt', through: tee.a.guid })); } catch (er) { refused = er.key || String(er.message); }
  ok(refused === 'walls.err.tjoin' && JS.joinPlaces(walls()).find((p) => p.key === tee.key).can === null, 'a T takes no style (walls.err.tjoin): the wall whose side is met runs through');
  let none = '';
  try { ed.modelChange(JS.setJoinStyle('nope:start|nope2:end', { style: 'butt' })); } catch (er) { none = er.key || String(er.message); }
  ok(none === 'model.err.nojoin', 'an unknown join is refused (model.err.nojoin)');

  console.log('== 60 degrees: butt and square off differ');
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [10000, 0], b: [14000, 0] }, { a: [14000, 0], b: [16000, 2000 * Math.sqrt(3)] }], typeKey: 'int-2x4', height: 2700 }));
  const wa = walls().find((x) => near(x.a[0], 10000)), wb = walls().find((x) => near(x.a[0], 14000) && near(x.a[1], 0));
  const K = joinKey({ guid: wa.guid, pos: 'end' }, { guid: wb.guid, pos: 'start' });
  // walls 120 degrees apart, both h = 57.15. In lib terms A = wa at its end (d = (-1, 0)), B = wb (d = (0.5, 0.866)): B's far face reaches A's side y = +57.15
  // at x = 14000 + (57.15 + 0.5 x 57.15) / 0.8660254 = 14000 + 98.986; butt cuts A's end from x = 14000 + (57.15 - 28.575) / 0.8660254 = 14032.995 (at y = -57.15)
  // to 14098.986 (at y = +57.15): A = 114.3 x (4000 + (32.995 + 98.986) / 2) = 114.3 x 4065.990 = 464 742.7; square off: A ends square at 14098.986 = 114.3 x 4098.986 = 468 514.1
  ed.modelChange(JS.setJoinStyle(K, { style: 'butt', through: wa.guid }));
  const aButt = foot(wa.guid);
  ed.modelChange(JS.setJoinStyle(K, { style: 'square', through: wa.guid }));
  const aSq = foot(wa.guid);
  ok(near(aButt, T * (4000 + (57.15 - 28.575) / Math.sqrt(0.75) / 2 + (57.15 + 28.575) / Math.sqrt(0.75) / 2), 0.5) && near(aSq, T * (4000 + (57.15 + 28.575) / Math.sqrt(0.75)), 0.5), 'butt 114.3 x 4065.990 = 464 742.7 mm2; square off 114.3 x 4098.986 = 468 514.1 mm2', [aButt, aSq]);

  console.log('== layer priority on the plan (medium detail)');
  // host: ext-300 along x at y = -6000 (render 15, insulation 100, block 175, plaster 10; exterior on its left = +y), so from its near (lower) face
  // y = -6150 upward: plaster 10 (finish), block 175 (structure). stem: int-100 (gypsum 12.5, studs 75, gypsum 12.5) coming up from below to the host.
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, -6000], b: [6000, -6000] }], typeKey: 'ext-300', height: 2700 }));
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [3000, -9000], b: [3000, -6000] }], typeKey: 'int-100', height: 2700 }));
  const all = walls(), host = all.find((x) => x.typeKey === 'ext-300'), stem = all.find((x) => x.typeKey === 'int-100');
  const mats = PM.readMaterials(W()), outl = outlines();
  const plain = PG.wallPlanGraphics(all, outl, [], mats, { detail: 'medium' });
  const clean = PG.wallPlanGraphics(all, outl, [], mats, { detail: 'medium', priority: true });
  const rowOf = (rows, g) => rows.find((x) => x.guid === g), sum = (row) => row.layers.flatMap((l) => l.polys).reduce((v, p) => v + area(p), 0), pieces = (row) => row.pieces.reduce((v, p) => v + area(p), 0);
  if (!rowOf(plain, host.guid).layers || !rowOf(plain, stem.guid).layers) ok(false, 'the starter types\' layers are drawn at medium detail', rowOf(plain, host.guid).graphicWarning);
  else {
    ok(near(sum(rowOf(plain, stem.guid)), pieces(rowOf(plain, stem.guid)), 0.01) && !rowOf(plain, stem.guid).layerJoins, 'without the option nothing changes: each wall\'s layers fill its own envelope');
    // the stem's studs (structure, 800; x 2962.5..3037.5) pass the host's plaster (finish, 200; 10 mm) and stop at the host's block (structure, 800): 75 x 10 = 750 mm2
    ok(near(sum(rowOf(clean, stem.guid)), pieces(rowOf(clean, stem.guid)) + 750, 0.01) && near(sum(rowOf(clean, host.guid)), pieces(rowOf(clean, host.guid)) - 750, 0.01), 'with it the stem\'s studs take 75 x 10 = 750 mm2 of the host\'s plaster (the stem + 750, the host - 750)', [sum(rowOf(clean, stem.guid)) - pieces(rowOf(clean, stem.guid)), sum(rowOf(clean, host.guid)) - pieces(rowOf(clean, host.guid))]);
    const studs = rowOf(clean, stem.guid).layers[1].polys.at(-1), xs = studs.map((p) => p[0]), ys = studs.map((p) => p[1]);
    ok(near(Math.min(...xs), 2962.5) && near(Math.max(...xs), 3037.5) && near(Math.min(...ys), -6150) && near(Math.max(...ys), -6140), 'the piece: x 2962.5..3037.5, y -6150..-6140 (the stem\'s core reaches the host\'s core)', studs);
    // lines: the piece's two sides (studs against plaster) and its end (studs against block: another material), and the two gypsum ends against the plaster (12.5 each)
    const jl = [rowOf(clean, host.guid), rowOf(clean, stem.guid)].flatMap((row) => row.boundaries.filter((b) => b.join).flatMap((b) => b.paths));
    const len = (sg) => Math.hypot(sg[0][0] - sg[1][0], sg[0][1] - sg[1][1]);
    ok(jl.length === 5 && jl.map(len).sort((a, b) => a - b).every((v, i) => near(v, [10, 10, 12.5, 12.5, 75][i])), 'five junction lines: two sides of 10, the end of 75, two contacts of 12.5', jl.map(len));
    // the host's plaster / block line (y = -6140) is interrupted where the studs pass: 6000 + its mitre-free ends, less 75
    const hb = rowOf(clean, host.guid).boundaries.find((b) => !b.join && near(Math.abs(b.offset), 140)), hb0 = rowOf(plain, host.guid).boundaries.find((b) => near(Math.abs(b.offset), 140));
    const tot = (b) => b.paths.reduce((v, pth) => v + len([pth[0], pth[pth.length - 1]]), 0);
    ok(hb && hb0 && near(tot(hb0) - tot(hb), 75, 0.01) && hb.paths.length === hb0.paths.length + 1, 'the host\'s plaster / block line is interrupted for 75 mm where the cores join', [tot(hb0), tot(hb)]);
    ok(rowOf(clean, host.guid).layerJoins === 1 && rowOf(clean, stem.guid).layerJoins === 1 && near(area(rowOf(clean, host.guid).poly), area(rowOf(plain, host.guid).poly)), 'the envelopes (the walls\' bodies) are untouched: display only');
  }
  // a layer's own priority, kept in the assembly
  const WA = await import(path.join(APP, 'wall-assemblies.js'));
  const base = { key: 'wall-prio-test', name: 'Priority test', exterior: false, layers: [{ mat: 'gypsum', t: 12.5, function: 'finish', core: false, priority: 850 }, { mat: 'studs', t: 75, function: 'structure', core: true }] };
  let va = null, vErr = '';
  try { va = WA.validateAssembly(base); } catch (er) { vErr = er.message; }
  ok(va && va.layers[0].priority === 850 && !('priority' in va.layers[1]), 'an assembly layer keeps its own priority (850); a layer without one has no field (older recipes unchanged)', vErr);
  let pErr = false;
  try { WA.validateAssembly({ ...base, layers: [{ ...base.layers[0], priority: 1200 }, base.layers[1]] }); } catch (er) { pErr = true; }
  ok(pErr, 'a priority outside 0..999 is refused');

  console.log('== Align and Distribute keep the joins (FX.62)');
  {
    // a room 6000 x 4000 at x = 20000 with three partitions at x = 21000, 21500 and 24000 (a T on the south and the north wall each), and a free wall far away
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [20000, 0], b: [26000, 0] }, { a: [26000, 0], b: [26000, 4000] }, { a: [26000, 4000], b: [20000, 4000] }, { a: [20000, 4000], b: [20000, 0] }], typeKey: 'int-2x4', height: 2700 }));
    for (const x of [21000, 21500, 24000]) ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [x, 0], b: [x, 4000] }], typeKey: 'int-2x4', height: 2700 }));
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [28000, 6000], b: [30000, 6000] }], typeKey: 'int-2x4', height: 2700 }));
    const at = (pa, pb) => walls().find((x) => near(x.a[0], pa[0]) && near(x.a[1], pa[1]) && near(x.b[0], pb[0]) && near(x.b[1], pb[1]));
    const S2 = at([20000, 0], [26000, 0]), E2 = at([26000, 0], [26000, 4000]), N2 = at([26000, 4000], [20000, 4000]), W2 = at([20000, 4000], [20000, 0]);
    const P = [21000, 21500, 24000].map((x) => at([x, 0], [x, 4000])), F = at([28000, 6000], [30000, 6000]);
    const mine = (g) => recs().filter((x) => x.a.guid === g || x.b.guid === g);
    const kinds0 = recs().map((x) => x.key).sort().join();
    // Distribute, centres, across: the outer two stay (21000, 24000); the middle one goes to their middle, 22500: 1000 to the right
    const list = MM.movables(W()).filter((m) => P.some((x) => x.guid === m.guid));
    const dm = MM.distributeMoves(list, { axis: 'h', mode: 'centers' });
    ok(dm.size === 1 && near(dm.get(P[1].guid)[0], 1000), 'Distribute (centres) of the three partitions: the middle one moves 1000 (21500 to 22500)');
    let k0 = ed.changes.length;
    ed.modelChange(MM.moveElements([...dm].map(([guid, v]) => ({ guid, dx: v[0], dy: v[1] }))), { label: 'Distribute' });
    let p1 = by(walls(), P[1].guid);
    ok(ed.changes.length === k0 + 1 && near(p1.a[0], 22500) && near(p1.a[1], 0) && near(p1.b[0], 22500) && near(p1.b[1], 4000), 'applied in one undo step: the partition stands at x = 22500, still from the south wall to the north wall');
    ok(mine(P[1].guid).length === 2 && mine(P[1].guid).every((x) => x.kind === 'T') && recs().map((x) => x.key).sort().join() === kinds0 && near(by(walls(), S2.guid).b[0], 26000), 'its two T joins are the same records; the walls it is joined to did not move');
    // Align top to the last picked (the free wall, top face 6000 + 57.15): the north wall (top face 4000 + 57.15) goes 2000 up
    const al = MM.alignMoves([MM.movables(W()).find((m) => m.guid === N2.guid), MM.movables(W()).find((m) => m.guid === F.guid)], { side: 'top', to: 'last' });
    ok(al.size === 1 && near(al.get(N2.guid)[1], 2000), 'Align top to the free wall: the north wall is to move 2000 up');
    k0 = ed.changes.length;
    ed.modelChange(MM.moveElements([...al].map(([guid, v]) => ({ guid, dx: v[0], dy: v[1] }))), { label: 'Align' });
    const ws = walls();
    ok(ed.changes.length === k0 + 1 && near(by(ws, N2.guid).a[1], 6000) && near(by(ws, E2.guid).b[1], 6000) && near(by(ws, W2.guid).a[1], 6000) && near(by(ws, E2.guid).b[0], 26000), 'one undo step: the north wall is at y = 6000 and the east and west walls reach it (6000 long), keeping their lines');
    ok(P.every((x) => near(by(ws, x.guid).b[1], 6000) && near(by(ws, x.guid).b[0], by(ws, x.guid).a[0])) && recs().map((x) => x.key).sort().join() === kinds0, 'the three partitions come with it (their T ends at y = 6000); every join record is the same');
    // the rooms stay closed: four rooms between the walls; together (6000 - 4 x 114.3 ... ) widths x (6000 - 114.3): inside width 5885.7 - 3 x 114.3 = 5542.8
    const rooms = OPS.loopsOf(ed, L1.id).rooms.map((x) => x.area).filter((a) => a > 1e5);
    const big = rooms.reduce((v, a) => v + a, 0) - (5000 - 2 * T) * (4000 - T);   // less the first room of this file (two rooms since its partition at x = 2000: (5000 - 2 x 114.3) x 3885.7)
    ok(near(big, (6000 - T - 3 * T) * (6000 - T), 5), 'the rooms stay closed: together (6000 - 4 x 114.3) x (6000 - 114.3) = 5542.8 x 5885.7 = 32 623 258 mm2', big);
    ed.undo();
    ok(near(by(walls(), N2.guid).a[1], 4000) && near(by(walls(), E2.guid).b[1], 4000) && P.every((x) => near(by(walls(), x.guid).b[1], 4000)), 'one Undo puts every wall back');
    // two joined walls, each its own vector (what Align gives when both are picked): the south wall 300 down, the east wall 400 to the right:
    // the corner goes to (26400, -300); the north wall's start slides to (26400, 4000), the west wall's end to (20000, -300)
    k0 = ed.changes.length;
    ed.modelChange(MM.moveElements([{ guid: S2.guid, dx: 0, dy: -300 }, { guid: E2.guid, dx: 400, dy: 0 }]), { label: 'Align' });
    const w3 = walls(), s3 = by(w3, S2.guid), e3 = by(w3, E2.guid);
    ok(ed.changes.length === k0 + 1 && near(s3.b[0], 26400) && near(s3.b[1], -300) && near(e3.a[0], 26400) && near(e3.a[1], -300) && near(s3.a[0], 20000) && near(s3.a[1], -300) && near(e3.b[0], 26400) && near(e3.b[1], 4000), 'two joined walls moved by different vectors keep their corner: (26400, -300)', [s3.a, s3.b, e3.a, e3.b]);
    ok(near(by(w3, N2.guid).a[0], 26400) && near(by(w3, W2.guid).b[1], -300) && P.every((x) => near(by(w3, x.guid).a[1], -300)) && recs().map((x) => x.key).sort().join() === kinds0, 'the walls joined to them follow (north to x = 26400, west and the partitions to y = -300); the records are the same');
    ed.undo();
  }

  console.log(bad ? `\n${bad} FAILED` : '\nall ok');
  return bad ? 1 : 0;
}

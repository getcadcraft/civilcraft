/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --furnish` (0.8 EG.60, session bim_PART_2): furnish rooms. Known answers: a drawn house of two rooms
 * (8000 × 5000 outer, an inner wall at x = 4000, a door in the south wall at x = 1000).
 */
import path from 'node:path';

export async function furnishMode({ APP, WebIFC, IfcModel, quiet }) {
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const F = await import(path.join(APP, 'furnish.js'));
  const FM = await import(path.join(APP, 'furnish-model.js'));
  const FO = await import(path.join(APP, 'family-ops.js'));
  const FS = await import(path.join(APP, 'family-starters.js'));
  let bad = 0, good = 0;
  const ok = (cond, label) => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };

  console.log('== the planner on a bare room (4000 × 5000, a door at x = 1000, a window in the north wall)');
  const room = { poly: [[0, 0], [4000, 0], [4000, 5000], [0, 5000]] };
  const door = { x: 1000, y: 0, w: 900 }, win = { x: 3000, y: 5000, w: 1500, sill: 900 };
  const rects = (res) => res.placements.map((p) => ({ ...p, box: F.PIECES[p.family] }));
  const inside = (p) => F.footprint(p).every(([x, y]) => x > -2 && x < 4002 && y > -2 && y < 5002);   // every corner inside the room
  for (const kind of F.KINDS) {
    const res = F.planFurnish(room, { kind, doors: [door], windows: [win] });
    ok(res.placements.length + res.skipped.length === F.PRESETS[kind].length, kind + ': every piece placed or said (' + res.placements.length + ' placed, ' + res.skipped.length + ' skipped)');
    ok(res.placements.every(inside), kind + ': all inside the room');
    const fp = res.placements.map(F.footprint);
    let hit = 0;
    for (let i = 0; i < fp.length; i++) for (let j = i + 1; j < fp.length; j++) if (F.boxesOverlap(fp[i], fp[j])) hit++;
    ok(hit === 0, kind + ': no two pieces overlap');
  }
  // 0.8 EG.60: an office has a desk with its chair in front of it, facing it; a bath tub is asked for, not in a preset
  const off = F.planFurnish(room, { kind: 'office', doors: [door], windows: [win] });
  const dk = off.placements.find((p) => p.family === 'fam-desk'), ch = off.placements.find((p) => p.family === 'fam-chair');
  ok(dk && ch && Math.abs(Math.abs(((ch.rot - dk.rot) % 360 + 360) % 360) - 180) < 0.01, 'office: the chair stands turned 180° to the desk, facing it');
  ok(dk && ch && Math.hypot(ch.x - dk.x, ch.y - dk.y) < 300, 'office: the chair is right in front of the desk (' + (ch ? Math.round(Math.hypot(ch.x - dk.x, ch.y - dk.y)) : '-') + ' mm from its front edge)');
  const tub = F.planFurnish({ poly: [[0, 0], [2600, 0], [2600, 2000], [0, 2000]] }, { kind: 'bath', pieces: ['fam-bathtub'] });
  ok(tub.placements.length === 1 && !F.PRESETS.bath.includes('fam-bathtub'), 'a bath tub fits a 2.6 × 2 m bath when asked for, and no preset adds it on its own');
  const nodesk = F.planFurnish(room, { kind: 'office', pieces: ['fam-chair'] });
  ok(nodesk.placements.length === 0 && nodesk.skipped[0]?.why === 'nofit', 'a chair with no desk is said not to fit, not dropped in the middle');
  const same = JSON.stringify(F.planFurnish(room, { kind: 'bedroom', doors: [door], windows: [win] })) === JSON.stringify(F.planFurnish(room, { kind: 'bedroom', doors: [door], windows: [win] }));
  ok(same, 'the same room gives the same layout (no randomness)');
  const bed = F.planFurnish(room, { kind: 'bedroom', doors: [door], windows: [win] }).placements.find((p) => p.family === 'fam-bed');
  ok(bed && (Math.abs(bed.rot) === 90 || bed.rot === 0 || bed.rot === 180), 'the bed turns square to a wall (rot ' + bed?.rot + ')');
  const tiny = F.planFurnish({ poly: [[0, 0], [1000, 0], [1000, 1000], [0, 1000]] }, { kind: 'bedroom' });
  ok(tiny.placements.length === 0 && tiny.skipped.length === 3, 'a 1 m closet fits no bedroom furniture: all three skipped and said');
  const pr = F.furnishProblems(room, tiny, { id: 'r1', label: 'Closet' });
  ok(pr.length === 3 && pr.every((p) => p.severity === 'note' && p.about[0].id === 'r1' && p.msg.key === 'eg60.p.nofit'), 'each skipped piece is a Problem note about the room');
  const L = F.planFurnish({ poly: [[0, 0], [5000, 0], [5000, 2500], [2500, 2500], [2500, 5000], [0, 5000]] }, { kind: 'living' });
  ok(L.placements.every((p) => p.x > -1 && p.y > -1) && L.placements.length >= 2, 'an L-shaped room: ' + L.placements.length + ' placed, none outside');
  ok(F.planFurnish({ poly: [[0, 0], [1, 1]] }, {}).reason === 'noroom', 'a room with no area is refused');

  console.log('== on a drawn model');
  const text = N.newBuilding({ name: 'Furnish', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'f.ifc', now: new Date('2026-10-28T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  let snap = OPS.snapshotModel(ed);
  const [A, B] = snap.levels.map((l) => l.guid);
  const pts = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
  ed.modelChange(OPS.drawWalls({ storey: A, segs: pts.map((p, i) => ({ a: p, b: pts[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: B, extSide: 'right' }));
  ed.modelChange(OPS.drawWalls({ storey: A, segs: [{ a: [4000, 0], b: [4000, 5000] }], typeKey: 'int-2x4', topLevel: B }));
  snap = OPS.snapshotModel(ed);
  const south = snap.walls.find((w) => w.a[1] === 0 && w.b[1] === 0 && w.typeKey === 'ext-2x6');
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 500, face: 'left' }));
  const rooms = FM.levelRooms(ed, A);
  ok(rooms.length === 2, 'two rooms found on the level');
  const op = FM.roomOpenings(ed, A);
  ok(op.doors.length === 1 && Math.abs(op.doors[0].x - (500 + op.doors[0].w / 2)) < 2 && Math.abs(op.doors[0].y) < 2, 'the door middle is read in plan (x ' + Math.round(op.doors[0]?.x) + ')');
  const plan = FM.furnishPlan(ed, { storey: A, at: [2000, 2500], kind: 'bedroom' });
  ok(plan.room !== undefined && plan.kind === 'bedroom' && plan.placements.length === 3, 'bedroom plan for the room at (2000, 2500): ' + plan.placements.map((p) => p.family.replace('fam-', '')).join(', '));
  ok(FM.furnishPlan(ed, { storey: A, at: [-5000, -5000] }).error === 'noroom', 'a point outside every room: no room');
  ok(FM.furnishPlan(ed, { storey: A, at: [2000, 2500] }).guessed === true, 'no kind given: a guess from the size, marked guessed');

  console.log('== place them (one undo step)');
  const before = (() => { const w = new ModelWriter(ed.W, ed.api, ed.mid); return FO.readFamilyElements(w).length; })();
  const r = ed.modelChange(FM.furnishOp(A, plan.placements), { label: 'Furnish' });
  const w1 = new ModelWriter(ed.W, ed.api, ed.mid);
  const els = FO.readFamilyElements(w1);
  ok(r.ids.length === 3 && els.length === before + 3, 'three pieces placed (bed, wardrobe, desk)');
  ok(['fam-bed', 'fam-wardrobe', 'fam-table'].every((k) => els.some((e) => e.family === k)), 'each is its starter family');
  ed.undo();
  ok(FO.readFamilyElements(new ModelWriter(ed.W, ed.api, ed.mid)).length === before, 'one undo takes the whole room back');
  ed.redo();
  ok(FO.readFamilyElements(new ModelWriter(ed.W, ed.api, ed.mid)).length === before + 3, 'redo puts it back');
  ok(FS.STARTER_FURNITURE.includes('fam-bed') && FS.starterRecipe('fam-sofa').kind === 'furniture', 'bed, sofa and wardrobe are starter furniture families');


  console.log('== the assistant tools (phase_set, phase_describe, furniture_add, massing_describe, massing_add)');
  const AG = await import(path.join(APP, 'agents.js'));
  const { createDispatcher } = await import(path.join(APP, 'host.js'));
  let allowed = ['read'];
  const d = createDispatcher({ server: { name: 'bimcraft', title: 'BimCraft', version: 'test' }, allowed: () => allowed });
  for (const def of AG.modelTools({ ed: () => ed, apply: async (label, op) => ed.modelChange(op, { label: 'Assistant: ' + label }) })) d.tool(def);
  const call = async (name, a = {}) => { const r = await d.call(name, a); return { r, v: r.structuredContent, text: r.content?.[0]?.text || '' }; };
  let x = await call('furniture_add', { room: 0 });
  ok(x.r.isError && /edit permission/.test(x.text), 'furniture_add is refused with read only');
  allowed = ['read', 'edit'];
  const levelGuid = OPS.snapshotModel(ed).levels[0].guid;
  const nb = FO.readFamilyElements(new ModelWriter(ed.W, ed.api, ed.mid)).length;
  x = await call('furniture_add', { level: levelGuid, at: [6000, 2500], kind: 'living' });
  ok(!x.r.isError && x.v.kind === 'living' && x.v.placed.length >= 2 && x.v.guessedKind === false, 'furniture_add: a living room furnished (' + (x.v?.placed || []).map((p) => p.family.replace('fam-', '')).join(', ') + ')');
  ok(ed.changes.at(-1).label === 'Assistant: furnish room' && FO.readFamilyElements(new ModelWriter(ed.W, ed.api, ed.mid)).length === nb + x.v.placed.length, 'one undo step "Assistant: furnish room"');
  x = await call('furniture_add', { level: levelGuid, at: [-9000, 0] });
  ok(x.r.isError && /No room there/.test(x.text), 'a point outside every room: an error that says to check model_describe');
  x = await call('furniture_add', { level: levelGuid });
  ok(x.r.isError && /Say which room/.test(x.text), 'no room given: an error that says what to give');
  const wall = OPS.snapshotModel(ed).walls[0].guid;
  x = await call('phase_set', { guids: [wall], phase: 'demolish' });
  ok(!x.r.isError && x.v.elements === 1, 'phase_set: a wall to demolish');
  x = await call('phase_describe');
  ok(x.v.counts.demolish >= 1 && x.v.demolish.includes(wall) && x.r.structuredContent && x.r._meta?.['com.getcadcraft/untrusted'] === true, 'phase_describe lists it and marks the result as file data (untrusted)');
  x = await call('phase_set', { guids: ['nope'], phase: 'new' });
  ok(x.r.isError, 'an unknown GlobalId is an error');
  x = await call('massing_describe', { program: [{ name: 'Office', count: 20, area_m2: 25 }, { name: 'Lobby', area_m2: 100, ground: true }], width_m: 40, depth_m: 30, height_cap_mm: 9600 });
  ok(!x.r.isError && x.v.options.length >= 4 && x.v.totals.gross === 750, 'massing_describe: ' + x.v.options.length + ' options for 750 m² gross');
  const lv0 = OPS.snapshotModel(ed).levels.length;
  x = await call('massing_add', { program: [{ name: 'Office', count: 20, area_m2: 25 }, { name: 'Lobby', area_m2: 100, ground: true }], width_m: 40, depth_m: 30, height_cap_mm: 9600, option: 'block2' });
  ok(!x.r.isError && x.v.floors === 2 && OPS.snapshotModel(ed).levels.length >= lv0, 'massing_add: block2 built (2 floors)');
  x = await call('massing_add', { program: [{ name: 'Office', area_m2: 25 }], width_m: 40, depth_m: 30, option: 'nope' });
  ok(x.r.isError && /options for this program are/.test(x.text), 'an unknown option: an error that lists the real ones');
  console.log(good + ' ok, ' + bad + ' failed');
  return bad ? 1 : 0;
}

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-regs-sample.mjs — a small house built to show the Building regulations add-on against the United States pack (IRC 2021), with
 * rooms and stairs that pass and others that fail on purpose (owner 2026-10-27: "a drawing against the US regulations so I can see what
 * might violate and what the warnings look like"). Built through BimCraft's own ops (new-model.js, model-ops.js, res-stair.js), so it is
 * a real BimCraft model; it checks itself with the add-on's rules before it is written.
 *
 *   node bin/test-bimcraft.mjs --make-regs-sample <out.ifc>
 *
 * Level 1 (3000 mm floor to floor, walls 2600 mm high), three 4 × 6 m rooms side by side, Level 2 an attic room with 2050 mm walls:
 *   west room     two double-hung windows                 meets glazing (8 %) and openable area (4 %)
 *   middle room   one double-hung window                  FAILS glazing and openable area
 *   east room     two fixed (picture) windows             meets glazing, FAILS openable area (fixed windows don't open)
 *   attic room    one sliding window, 2050 mm walls       FAILS ceiling height (at least 2134 mm)
 *   Stair A  (middle room) 7⅞" risers, 9" treads, 31½" wide, handrail 39⅜"   FAILS riser, tread, width and handrail height
 *   Stair B  (east room) the IRC's own limits              meets every stair rule
 * BimCraft numbers the rooms itself (101, 102, 103, 201), not in that west-to-east order. Tier 2 (owner 2026-10-27): the rooms are named
 * Family room, Living room, Bedroom (east: fixed windows only, so it FAILS the escape opening) and Attic bedroom (its slider passes), and
 * the only outside door is a 32 in pocket door: 30 in clear FAILS the 32 in egress door. Tier 3: a stem-wall foundation whose footing is 10 in wide
 * and 10 in below grade (FAILS depth and width), and Level 1's outside walls framed 2x6 at 16 in, with a 10 ft patio door whose header FAILS
 * Table R602.7(1).
 */
import path from 'node:path';
import fs from 'node:fs';

export async function makeRegsSample({ APP, WebIFC, IfcModel, quiet, out }) {
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const ST = await import(path.join(APP, 'res-stair.js'));
  const R = await import(path.join(APP, 'addons/regs/lib/regs.js'));
  const C = await import(path.join(APP, 'addons/regs/lib/check.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const IN = 25.4;

  const levels0 = N.stackLevels(2, 3000, (i) => (i === 0 ? 'Level 1' : 'Attic'));
  const text = N.newBuilding({ name: 'IRC check sample house', siteName: 'Sample site', levels: levels0, fileName: path.basename(out), now: new Date('2026-10-27T12:00:00Z') });
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, eng);
  const levels = OPS.snapshotModel(ed).levels;
  const [L1, L2] = levels;

  // Level 1: a 12 × 6 m outline and two partitions → three 4 × 6 m rooms; walls 2600 mm high
  const ring = (pts) => pts.map((p, i) => ({ a: p, b: pts[(i + 1) % pts.length] }));
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: ring([[0, 0], [12000, 0], [12000, 6000], [0, 6000]]), typeKey: 'ext-2x6', height: 2600, extSide: 'right' }));
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [4000, 0], b: [4000, 6000] }, { a: [8000, 0], b: [8000, 6000] }], typeKey: 'int-2x4', height: 2600 }));
  // Attic: a 4 × 4 m room with 2050 mm walls (too low; the windows are 80" to the head)
  ed.modelChange(OPS.drawWalls({ storey: L2.guid, segs: ring([[0, 0], [4000, 0], [4000, 4000], [0, 4000]]), typeKey: 'ext-2x6', height: 2050, extSide: 'right' }));

  const wallOn = (a, b) => OPS.snapshotModel(ed).walls.find((w) => Math.hypot(w.a[0] - a[0], w.a[1] - a[1]) < 1 && Math.hypot(w.b[0] - b[0], w.b[1] - b[1]) < 1)
    || OPS.snapshotModel(ed).walls.find((w) => Math.hypot(w.b[0] - a[0], w.b[1] - a[1]) < 1 && Math.hypot(w.a[0] - b[0], w.a[1] - b[1]) < 1);
  // the south and north walls are split at the partitions: find the piece over each room
  const piece = (y, x0, x1) => OPS.snapshotModel(ed).walls.find((w) => w.storey === L1.id && Math.abs(w.a[1] - y) < 1 && Math.abs(w.b[1] - y) < 1 && Math.min(w.a[0], w.b[0]) <= x0 + 1 && Math.max(w.a[0], w.b[0]) >= x1 - 1);
  const win = (wall, typeKey, offsetIntoWall) => ed.modelChange(OPS.placeOpening({ wall: wall.guid, typeKey, offset: offsetIntoWall, face: 'right' }));
  const offIn = (w, x) => Math.abs(x - w.a[0]);   // distance along the wall from its start to x
  const s1 = piece(0, 0, 4000), n1 = piece(6000, 0, 4000), s2 = piece(0, 4000, 8000), s3 = piece(0, 8000, 12000), n3 = piece(6000, 8000, 12000);
  if (![s1, n1, s2, s3, n3].every(Boolean)) throw new Error('could not find the wall pieces over each room');
  win(s1, 'win-double-hung', offIn(s1, 1200)); win(n1, 'win-double-hung', offIn(n1, 1200));   // Room 1: two hung windows
  win(s2, 'win-double-hung', offIn(s2, 5200));                                                 // Room 2: one hung window
  win(s3, 'win-fixed', offIn(s3, 9000)); win(n3, 'win-fixed', offIn(n3, 9000));                // Room 3: two fixed windows
  const as = wallOn([0, 0], [4000, 0]) || OPS.snapshotModel(ed).walls.find((w) => w.storey === L2.id && Math.abs(w.a[1]) < 1 && Math.abs(w.b[1]) < 1);
  win(as, 'win-slider', offIn(as, 1200));                                                      // Attic: one sliding window

  // Names (tier 2: bedrooms need an escape opening; kitchens and halls are not habitable rooms) and a front door that is too narrow
  const { updateDerived } = await import(path.join(APP, 'model-slabs.js'));
  const { op } = await import(path.join(APP, 'model-ops.js'));
  const nameAt = (x, y, storeyId, name) => {
    const sp = OPS.snapshotModel(ed).derived.spaces.find((q) => q.storey === storeyId && q.seed && Math.abs(q.seed[0] - x) < 2000 && Math.abs(q.seed[1] - y) < 3000);
    if (sp) ed.modelChange(op((w) => { updateDerived(w, sp.guid, { name }); return { id: null, ids: [], made: new Map() }; }));
  };
  nameAt(2000, 3000, L1.id, 'Family room'); nameAt(6000, 3000, L1.id, 'Living room'); nameAt(10000, 3000, L1.id, 'Bedroom'); nameAt(2000, 2000, L2.id, 'Attic bedroom');
  win(s1, 'door-pocket', offIn(s1, 2600));   // the only outside door: a 32 in pocket door, 30 in clear — too narrow for the egress door

  // Stairs from Level 1 to the attic level
  ed.modelChange(ST.placeStair({ level: L1.guid, start: [6000, 800], angle: 90, kind: 'straight', turn: 'left', width: 800, riserMax: 200, tread: 230, railings: 'both', railHeight: 1000 }));   // Stair A: everything wrong
  ed.modelChange(ST.placeStair({ level: L1.guid, start: [10000, 800], angle: 90, kind: 'straight', turn: 'left', width: 36 * IN, riserMax: 7.75 * IN, tread: 10 * IN, railings: 'both', railHeight: 36 * IN }));   // Stair B: within the limits

  // Tier 3 (owner 2026-10-27: "electrical, framing, foundation"): a stem-wall foundation under Level 1 with a footing 10 in wide whose
  // bottom is 16 in below the floor (10 in below grade: FAILS the 12 in depth, the 12 in width and the size table), and the outside walls
  // of Level 1 framed with BimCraft's own framing tool (2x6 at 16 in; its headers are checked against IRC Table R602.7(1))
  const FD = await import(path.join(APP, 'res-foundation.js'));
  const FR = await import(path.join(APP, 'res-framing.js'));
  ed.modelChange(FD.placeFoundation({ level: L1.guid, seed: [2000, 3000], kind: 'stemslab', footW: 10 * IN, bottom: 16 * IN }));
  const n2 = piece(6000, 4000, 8000);
  ed.modelChange(OPS.placeOpening({ wall: n2.guid, typeKey: 'door-sliding', width: 120 * IN, offset: offIn(n2, 4400), face: 'right' }));   // a 10 ft patio door: its header FAILS the table span
  const outside = OPS.snapshotModel(ed).walls.filter((w) => w.storey === L1.id && /^ext/.test(w.typeKey)).map((w) => w.guid);
  ed.modelChange(FR.frameHosts({ hosts: outside, ...FR.FRAME_DEFAULTS }));

  // Check it with the add-on's own rules before writing it
  const pack = R.cleanPack(JSON.parse(fs.readFileSync(path.join(APP, 'addons/regs/packs/us-irc-2021.json'), 'utf8'))).pack;
  const prof = R.resolve(new Map([[pack.id, pack]]), pack.id);
  const snap = OPS.snapshotModel(ed);
  const loops = new Map(levels.map((l) => [l.id, OPS.loopsOf(ed, l.id)]));
  const stairs = ST.readStairs(new (await import(path.join(APP, 'model-write.js'))).ModelWriter(ed.W, ed.api, ed.mid)).map((st) => ({ ...st, layout: ST.stairLayout({ ...st, height: 3000 }) }));
  const levelName = (id) => levels.find((l) => l.id === id)?.name || '';
  const MW = (await import(path.join(APP, 'model-write.js'))).ModelWriter, mw = new MW(ed.W, ed.api, ed.mid);
  const founds = FD.readFoundations(mw).map((f) => { const loads = FD.loadsOn(mw, f.storey); return { ...f, loads, params: FD.foundationParams(f.kind, f.stored, loads) }; });
  const framings = FR.readFraming(mw).filter((f) => f.kind === 'wall').map((f) => ({ guid: f.guid, storey: f.storey, host: f.host, spacing: f.spacing,
    pieces: f.parts.map((pid) => { const ps = mw.readPset(pid, FR.LUMBER_PSET) || {}; return { role: String(ps.Role || ''), size: String(ps.Size || ''), length: Number(ps.Length) * mw.unitMm || 0, guid: mw.api.GetLine(mw.mid, pid, false)?.GlobalId?.value || '' }; }) }));
  const rows = [...C.stairRows(stairs, prof, { whereOf: (st) => 'Stair at x ' + Math.round(st.start[0]) }), ...C.roomRows(snap, loops, prof), ...C.doorRows(snap, loops, prof),
    ...C.foundRows(founds, prof, { levelName }), ...C.framingRows(framings, snap, loops, prof, { levelName })];
  const sum = C.summary(rows);
  fs.writeFileSync(out, ed.save());
  return { rows, sum, rooms: snap.derived?.spaces?.length || 0, stairs: stairs.length, bytes: fs.statSync(out).size };
}

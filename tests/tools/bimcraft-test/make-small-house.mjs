/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-small-house.mjs: THE small house of the release check (0.10 BK.4 / BK.80 / BK.2, session bk-r3-scale-10). One fixture,
 * fixtures/bimcraft/small-house.ifc, built through BimCraft's own ops (new-model.js, model-ops.js, model-grids.js, res-sheets.js),
 * so it is a real BimCraft building. Every number below is chosen so the checks can be worked out by hand; HOUSE (exported) is the
 * one place those numbers live: the Node check (house-test.mjs) and the page run (browser-house.mjs) both read it.
 *
 *   node bin/test-bimcraft.mjs --make-small-house [out.ifc]      (default: fixtures/bimcraft/small-house.ifc)
 *
 * One level, 3000 mm floor to floor. Outside walls 10 000 x 7 000 mm on their centre lines, type ext-300 (300 thick); one
 * partition at x = 5 000, type int-100 (100 thick). Rooms: Living room (west), Bedroom (east).
 *   doors    D: front door in the south wall, centre x = 2 500; inside door in the partition, centre y = 3 500
 *   windows  south wall centre x = 7 500; west wall centre y = 3 500; north wall centre x = 7 500
 *   a floor and a ceiling in each room, one roof (30 degrees, 300 overhang)
 *   grids    1, 2, 3 at x = 0, 5 000, 10 000 and A, B at y = 0, 7 000 (1 500 past the house)
 *   sections A at x = 2 500 (south to north, looking west), B at y = 3 500 (west to east, looking north)
 */
import path from 'node:path';
import fs from 'node:fs';

export const HOUSE = {
  name: 'Small house', file: 'fixtures/bimcraft/small-house.ifc',
  w: 10000, d: 7000, levelHeight: 3000, ext: { type: 'ext-300', t: 300 }, int: { type: 'int-100', t: 100 }, partitionX: 5000,
  doors: [{ wall: 'south', at: 2500, type: 'door-single' }, { wall: 'partition', at: 3500, type: 'door-single' }],
  windows: [{ wall: 'south', at: 7500, type: 'win-double-hung' }, { wall: 'west', at: 3500, type: 'win-double-hung' }, { wall: 'north', at: 7500, type: 'win-double-hung' }],
  rooms: [{ name: 'Living room', seed: [2500, 3500] }, { name: 'Bedroom', seed: [7500, 3500] }],
  roof: { pitch: 30, overhang: 300 },
  grid: { u: { count: 3, spacing: 5000 }, v: { count: 2, spacing: 7000 }, extend: 1500, tags: ['1', '2', '3', 'A', 'B'] },
  sections: [{ name: 'A', a: [2500, -2000], b: [2500, 9000] }, { name: 'B', a: [-2000, 3500], b: [12000, 3500] }],
  // worked by hand from the numbers above (walls on their centre lines):
  //   Living room  (5000 - 150 - 50) x (7000 - 300) = 4800 x 6700 mm = 32.16 m2
  //   Bedroom      the same on the other side                         = 32.16 m2
  roomArea: 4800 * 6700,
};

export async function makeSmallHouse({ APP, WebIFC, IfcModel, quiet, out }) {
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MG = await import(path.join(APP, 'model-grids.js'));
  const SH = await import(path.join(APP, 'res-sheets.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const H = HOUSE;
  const levels0 = N.stackLevels(1, H.levelHeight, () => 'Ground floor');
  const text = N.newBuilding({ name: H.name, siteName: 'Site', levels: levels0, fileName: path.basename(out), now: new Date('2026-11-11T12:00:00Z') });
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, eng);
  const L1 = OPS.snapshotModel(ed).levels[0];
  const ring = (pts) => pts.map((p, i) => ({ a: p, b: pts[(i + 1) % pts.length] }));
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: ring([[0, 0], [H.w, 0], [H.w, H.d], [0, H.d]]), typeKey: H.ext.type, extSide: 'right' }));
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [H.partitionX, 0], b: [H.partitionX, H.d] }], typeKey: H.int.type }));
  const walls = () => OPS.snapshotModel(ed).walls;
  const along = (w, p) => Math.hypot(p[0] - w.a[0], p[1] - w.a[1]);
  /** The wall piece that runs through plan point p. */
  const wallAt = (p) => walls().find((w) => { const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]), t = ((p[0] - w.a[0]) * (w.b[0] - w.a[0]) + (p[1] - w.a[1]) * (w.b[1] - w.a[1])) / (L * L); const q = [w.a[0] + (w.b[0] - w.a[0]) * t, w.a[1] + (w.b[1] - w.a[1]) * t]; return t > 0 && t < 1 && Math.hypot(q[0] - p[0], q[1] - p[1]) < 1; });
  const spot = { south: (x) => [x, 0], north: (x) => [x, H.d], west: (y) => [0, y], east: (y) => [H.w, y], partition: (y) => [H.partitionX, y] };
  for (const o of [...H.doors, ...H.windows]) {
    const p = spot[o.wall](o.at), w = wallAt(p);
    if (!w) throw new Error('no wall at ' + p.join(','));
    ed.modelChange(OPS.placeOpening({ wall: w.guid, typeKey: o.type, offset: along(w, p), face: 'right' }));
  }
  for (const r of H.rooms) {
    ed.modelChange(OPS.placeFloor({ storey: L1.guid, seed: r.seed, mode: 'room' }));
    ed.modelChange(OPS.placeCeiling({ storey: L1.guid, seed: r.seed, mode: 'room' }));
    const sp = OPS.snapshotModel(ed).derived.spaces.find((q) => q.seed && Math.hypot(q.seed[0] - r.seed[0], q.seed[1] - r.seed[1]) < 2400);
    if (!sp) throw new Error('no room at ' + r.seed.join(','));
    ed.modelChange(OPS.changeDerived(sp.guid, { name: r.name }));
  }
  ed.modelChange(OPS.placeRoof({ storey: L1.guid, seed: H.rooms[0].seed, pitch: H.roof.pitch, overhang: H.roof.overhang, edges: '' }));
  ed.modelChange(MG.placeGrid({ storey: L1.guid, axes: MG.gridLayout({ origin: [0, 0], angle: 0, u: H.grid.u, v: H.grid.v, extend: H.grid.extend }) }));
  for (const s of H.sections) ed.modelChange(SH.placeSectionLine({ level: L1.guid, a: s.a, b: s.b, name: s.name }));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, ed.save());
  const snap = OPS.snapshotModel(ed);
  return { bytes: fs.statSync(out).size, walls: snap.walls.length, openings: snap.openings.length, rooms: snap.derived.spaces.length, floors: snap.derived.floors.length, ceilings: snap.derived.ceilings.length, roofs: snap.derived.roofs.length };
}

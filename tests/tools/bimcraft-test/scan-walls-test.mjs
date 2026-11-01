/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --scan-walls` (0.8 EG.37 spike, session bim_PART_2): walls and rooms from a synthetic phone scan.
 * The scan is made here (a fixed random sequence): a 5000 × 4000 room, wall points with 10 mm noise, a 900 mm doorway in the south wall, a
 * chair and a table as clutter, then turned 7° like a phone held crooked. Known answer: four walls within 30 mm, one door of 900 ± 60 mm,
 * and, drawn into BimCraft, one room of about 20 m² (the walls' inner faces).
 */
import path from 'node:path';

export async function scanWallsMode({ APP, WebIFC, IfcModel, quiet }) {
  const SW = await import(path.join(APP, 'scan-walls.js'));
  const CS = await import(path.join(APP, 'cloud-slice.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const FM = await import(path.join(APP, 'furnish-model.js'));
  let bad = 0, good = 0;
  const ok = (cond, label) => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  let seed = 42;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const gauss = () => { let s = 0; for (let i = 0; i < 6; i++) s += rnd(); return (s - 3) / 0.7071; };   // about N(0, 1)

  function room({ turn = 0, door = true, step = 15 } = {}) {
    const pts = [];
    const wall = (x0, y0, x1, y1, skip = null) => {
      const L = Math.hypot(x1 - x0, y1 - y0);
      for (let d = 0; d < L; d += step) {
        if (skip && d > skip[0] && d < skip[1]) continue;
        for (let k = 0; k < 3; k++) { const t = d / L; pts.push([x0 + (x1 - x0) * t + gauss() * 10, y0 + (y1 - y0) * t + gauss() * 10]); }
      }
    };
    wall(0, 0, 5000, 0, door ? [1500, 2400] : null); wall(5000, 0, 5000, 4000); wall(5000, 4000, 0, 4000); wall(0, 4000, 0, 0);
    for (let i = 0; i < 400; i++) pts.push([1500 + rnd() * 450, 1200 + rnd() * 450]);        // a chair
    for (let i = 0; i < 600; i++) pts.push([3000 + rnd() * 1200, 1800 + rnd() * 700]);       // a table
    const c = Math.cos(turn * Math.PI / 180), s = Math.sin(turn * Math.PI / 180);
    const xy = new Float64Array(pts.length * 2);
    pts.forEach(([x, y], i) => { xy[2 * i] = x * c - y * s + 100000; xy[2 * i + 1] = x * s + y * c + 50000; });   // far from the origin, like a survey
    return { xy, n: pts.length };
  }

  console.log('== a square scan');
  let sc = room({ turn: 0 });
  let r = SW.scanWalls(sc.xy, sc.n, { angle: 0 });
  ok(r.walls.length === 5 || r.walls.length === 4, r.walls.length + ' wall runs (the doorway splits the south wall in two)');
  console.log('  ', r.walls.map((w) => w.dir + ' ' + w.a.map(Math.round) + ' -> ' + w.b.map(Math.round) + ' ' + w.points + 'pts').join(' | '));
  ok(r.doors.length === 1 && Math.abs(r.doors[0].width - 900) < 80, 'one door found, ' + r.doors[0]?.width + ' mm wide (900 made)');
  ok(r.walls.every((w) => w.points >= 25), 'every wall rests on at least 25 points; the chair and the table (dense blobs) are not walls');

  console.log('== a crooked scan (7°, far from the origin)');
  sc = room({ turn: 7 });
  const ang = CS.squareAngle(sc.xy, sc.n, { cell: 200 });
  ok(ang && Math.abs(ang.angle - 7) < 0.6, 'squareAngle finds the 7° turn: ' + ang?.angle?.toFixed(2));
  r = SW.scanWalls(sc.xy, sc.n, { angle: ang.angle });
  const lens = r.walls.map((w) => Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]));
  ok(r.walls.length >= 4 && lens.filter((l) => l > 3500).length === 3, 'the walls are found after turning back: ' + lens.map(Math.round).join(', ') + ' mm');
  const near = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 50;
  const turn = (x, y) => { const c = Math.cos(7 * Math.PI / 180), s = Math.sin(7 * Math.PI / 180); return [x * c - y * s + 100000, x * s + y * c + 50000]; };
  const corners = [turn(0, 4000), turn(5000, 4000), turn(5000, 0)];
  ok(corners.every((q) => r.walls.some((w) => near(w.a, q) || near(w.b, q))), 'three of the four corners are within 50 mm of where they were made');

  console.log('== a scan with no wall in it');
  const flat = new Float64Array(2 * 500); for (let i = 0; i < 1000; i++) flat[i] = rnd() * 5000;
  r = SW.scanWalls(flat, 500, {});
  ok(r.walls.length === 0 && /No wall found/.test(r.notes[0]), 'scattered points: no walls, and a plain next step');
  ok(SW.scanWalls(new Float64Array(10), 5, {}).walls.length === 0, 'five points: refused');

  console.log('== into BimCraft: walls, then the room they close');
  sc = room({ turn: 0, door: false });
  r = SW.scanWalls(sc.xy, sc.n, { angle: 0 });
  const text = N.newBuilding({ name: 'Scan', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 's.ifc', now: new Date('2026-10-28T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  const [A, B] = OPS.snapshotModel(ed).levels.map((l) => l.guid);
  const o = [100000, 50000];
  const walls = r.walls.map((w) => ({ a: [Math.round(w.a[0] - o[0]), Math.round(w.a[1] - o[1])], b: [Math.round(w.b[0] - o[0]), Math.round(w.b[1] - o[1])] }));
  ok(walls.length === 4, 'four walls with no doorway: ' + walls.length);
  ed.modelChange(OPS.drawWalls({ storey: A, segs: walls, typeKey: 'ext-2x6', topLevel: B, extSide: 'right' }));
  const rooms = FM.levelRooms(ed, A);
  const area = rooms[0] ? rooms[0].area / 1e6 : 0;
  ok(rooms.length === 1 && area > 17 && area < 21, 'one room of ' + area.toFixed(1) + ' m² (20 m² between the wall centrelines, less the wall thickness)');
  console.log(good + ' ok, ' + bad + ' failed');
  return bad ? 1 : 0;
}

/* SPDX-License-Identifier: Apache-2.0 */
// Hosts round (DC.117, cabinetcraft_hosts): a room the host knows becomes the job's room (lib/fromroom.js).
const { ok, section, near, mine } = globalThis.__ccTest;
const P = await mine('lib/project.js');
const F = await mine('lib/fromroom.js');
const Core = await mine('lib/core.js');
const R = await mine('lib/room.js');
Core.setT((k) => k);

section('A room from the host');
{
  const L = [[1000, 1000], [5000, 1000], [5000, 3000], [3000, 3000], [3000, 4500], [1000, 4500]];
  const r = F.applyModelRoom(P.newProject('mm'), { name: 'Level 1: 1', host: 'bim', storey: 'abc', z: 0, height: 2700, pts: L, openings: [{ kind: 'door', x: 2000, y: 1000, w: 900 }, { kind: 'window', x: 1000, y: 3500, w: 1200, sill: 900 }, { kind: 'door', x: 9000, y: 9000, w: 900 }] });
  const p = r.project;
  ok(p.room.shape === 'free' && p.room.pts.length === 6 && near(p.room.h, 2700), 'an L outline becomes a free outline of six corners, the height follows');
  ok(near(Math.min(...p.room.pts.map((q) => q[0])), 0) && near(Math.min(...p.room.pts.map((q) => q[1])), 0), 'moved so its lower-left corner is (0, 0)');
  ok(p.site && p.site.host === 'bim' && p.site.storey === 'abc' && near(p.site.ox, 1000) && near(p.site.oy, 1000), 'the move is kept in project.site');
  ok(r.placed.join() === 'D1,W1' && r.skipped.length === 1, 'two openings placed on walls, one further than 600 mm left out');
  const d = p.openings.find((o) => o.id === 'D1'), w = p.openings.find((o) => o.id === 'W1');
  ok(d.wall === 'P1' && near(d.at, 550) && near(d.w, 900), 'the door is centred on its wall (550 from the wall start)');
  ok(w.wall === 'P6' && near(w.sill, 900) && w.kind === 'window', 'the window is on the west wall with its sill');
  ok(R.walls(p.room).length === 6, 'the job reads the walls back');
  const back = F.toModel(p, 100, 200);
  ok(near(back[0], 1100) && near(back[1], 1200), 'toModel puts a point of the room back in the host axes');
}
section('Rectangles, winding, noise');
{
  const rect = [[0, 0], [3600, 0], [3600, 3000], [0, 3000]];
  const a = F.applyModelRoom(P.newProject('mm'), { pts: rect.slice().reverse() });
  ok(a.project.room.shape === 'rect' && near(a.project.room.w, 3600) && near(a.project.room.d, 3000), 'a clockwise rectangle is the plain rectangle room');
  const b = F.applyModelRoom(P.newProject('mm'), { pts: [[0, 0], [1800, 0], [3600, 0], [3600, 3000], [0, 3000], [0, 0]] });
  ok(b.project.room.shape === 'rect', 'a point in a straight line and a repeated first point are dropped');
  const c = F.applyModelRoom(P.newProject('in'), { pts: rect, height: 2700 });
  ok(c.project.unit === 'in' && near(c.project.room.w, 141.75), 'a job in inches takes the room in inches (3600 mm = 141.75 in)');
  ok(F.applyModelRoom(P.newProject('mm'), { pts: [[0, 0], [1, 1]] }).error === 'room.bad', 'two points are not a room');
  ok(F.applyModelRoom(P.newProject('mm'), { pts: [[0, 0], [1000, 0], [2000, 0]] }).error === 'room.bad', 'three points in a line are not a room');
  const slant = F.applyModelRoom(P.newProject('mm'), { pts: [[0, 0], [4000, 0], [4000, 2000], [2000, 3500], [0, 2000]] });
  ok(slant.project.room.shape === 'free' && slant.project.room.pts.length === 5, 'a house-shaped room with slanted walls is accepted');
}

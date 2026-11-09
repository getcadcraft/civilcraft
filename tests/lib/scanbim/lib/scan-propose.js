/* SPDX-License-Identifier: Apache-2.0 */
/**
 * scan-propose.js — from a phone or laser scan to PROPOSED walls, doors and rooms (0.8 EG.37, session spikes_PART_4; the spike is
 * docs/spikes/EG.37_PART_2.md, the build's log docs/0.8-sessions/spikes_PART_4.md). DOM-free: `node bin/test-bimcraft.mjs --scan-propose`.
 * Nothing here changes the model. It returns a list the person accepts item by item (Suggest mode, scan-build.js applies the accepted ones
 * in one undo step) and Problems for what looks wrong. Rectilinear rooms only (every wall parallel to one of two perpendicular directions);
 * a curved or diagonal wall is not found, and it says so. It has been run on generated room scans and NOT on a real phone scan: tuning on
 * real scans is the owner's step.
 *
 *   meshSlice(solids, { cutZ, step }) → { xy, n }      the plan slice of a mesh (readObj's `solids`, mm, Z up): where the cut plane crosses
 *                                                      the triangles, sampled every `step` mm (default 20)
 *   cloudSlice(cloud, { above = 1200, thick = 100 })    a loaded cloud (pointcloud.js loadCloud) → { xy, n, floor } in millimetres,
 *                                                      relative to the cloud's own origin; the cut is `above` over the floor found in the cloud
 *   proposeFromScan(xy, n, { thickness = 150, snap = 350, ...scanWalls options })
 *        → { proposals, rooms, problems, notes, angle }
 *     proposals: [{ id: 'w1', kind: 'wall', a, b, thickness, points, ends: [closed, closed] }, { id: 'd1', kind: 'door', wall: 'w1', offset, width, at }]
 *       a, b in the slice's own axes (mm); offset = from the wall's start (a) to the door's near edge. Walls are moved from the scanned face to
 *       the wall's middle (half the thickness outward) where one side of the scan is empty (an outside wall).
 *     rooms: [{ area (m2), centroid, poly }] the closed spaces these walls make (the same finder the model uses)
 *     problems: Problems-shaped (docs/0.8-PROBLEMS-SPEC.md § 1), `scan.wall.open` / `scan.wall.short` / `scan.door.nowall` / `scan.noroom`
 *   shiftProposals(result, [dx, dy]) → the same proposals moved (to put the scan where the model wants it)
 */
import { squareAngle, floorZ, slicePoints } from './cloud-slice.js';
import { scanWalls } from './scan-walls.js';
import { planLoops, area as polyArea } from './model-rooms.js';

const r1 = (v) => Math.round(v * 10) / 10;

export function meshSlice(solids, { cutZ = 1200, step = 20 } = {}) {
  const pts = [];
  for (const s of solids || []) {
    const P = s.positions, I = s.indices;
    for (let t = 0; t + 2 < I.length; t += 3) {
      const z = [P[3 * I[t] + 2], P[3 * I[t + 1] + 2], P[3 * I[t + 2] + 2]];
      if ((z[0] > cutZ && z[1] > cutZ && z[2] > cutZ) || (z[0] < cutZ && z[1] < cutZ && z[2] < cutZ)) continue;
      const hit = [];
      for (let e = 0; e < 3; e++) {
        const i = I[t + e], j = I[t + (e + 1) % 3], za = P[3 * i + 2], zb = P[3 * j + 2];
        if ((za - cutZ) * (zb - cutZ) < 0 || (za === cutZ) !== (zb === cutZ) && (za === cutZ || zb === cutZ)) {
          const f = zb === za ? 0 : (cutZ - za) / (zb - za);
          if (f >= 0 && f <= 1) hit.push([P[3 * i] + f * (P[3 * j] - P[3 * i]), P[3 * i + 1] + f * (P[3 * j + 1] - P[3 * i + 1])]);
        }
      }
      if (hit.length < 2) continue;
      const [a, b] = hit, L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(L / step));
      for (let m = 0; m <= k; m++) pts.push(a[0] + (b[0] - a[0]) * m / k, a[1] + (b[1] - a[1]) * m / k);
      if (pts.length > 4_000_000) break;
    }
  }
  const n = pts.length / 2;
  return { xy: Float64Array.from(pts), n };
}

export function cloudSlice(cloud, { above = 1200, thick = 100, max = 200000 } = {}) {
  const k = cloud.unit === 'ft' ? 304.8 : cloud.unit === 'ftUS' ? 304.8006 : 1000;
  const M = [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, 0, 0, 0, 1];   // positions are relative to the cloud's own origin, in its unit → mm
  const floor = floorZ(cloud.pos, cloud.n, M);
  const s = slicePoints(cloud.pos, cloud.n, M, { cutZ: (floor ?? 0) + above, thick, max });
  return { xy: s.xy, n: s.n, floor: floor ?? 0, total: s.total };
}

export function proposeFromScan(xy, n, o = {}) {
  const { thickness = 150, snap = 350, ...walkOpts } = o;
  const notes = [], problems = [];
  const sq = n >= 100 ? squareAngle(xy, n, { cell: 200 }) : null;
  const sure = sq && sq.strength >= 0.2 && sq.walls >= 40;
  const angle = sure ? sq.angle : 0;
  if (n >= 100 && !sure) notes.push('The scan does not show two clear wall directions; it is taken as already square.');
  const res = scanWalls(xy, n, { angle, ...walkOpts });
  notes.push(...res.notes);
  if (!res.walls.length) return { proposals: [], rooms: [], problems: [], notes, angle };
  // into the squared frame (u, v): every wall is now constant in v ('x') or in u ('y')
  const ca = Math.cos((-angle * Math.PI) / 180), sa = Math.sin((-angle * Math.PI) / 180);
  const toUV = (p) => [p[0] * ca - p[1] * sa, p[0] * sa + p[1] * ca];
  const back = (u, v) => { const c = Math.cos((angle * Math.PI) / 180), s = Math.sin((angle * Math.PI) / 180); return [u * c - v * s, u * s + v * c]; };
  const U = new Float64Array(n), V = new Float64Array(n);
  for (let i = 0; i < n; i++) { const q = toUV([xy[2 * i], xy[2 * i + 1]]); U[i] = q[0]; V[i] = q[1]; }
  const raw = res.walls.map((w, i) => {
    const a = toUV(w.a), b = toUV(w.b);
    return w.dir === 'x' ? { i, dir: 'x', c: (a[1] + b[1]) / 2, lo: Math.min(a[0], b[0]), hi: Math.max(a[0], b[0]), points: w.points }
      : { i, dir: 'y', c: (a[0] + b[0]) / 2, lo: Math.min(a[1], b[1]), hi: Math.max(a[1], b[1]), points: w.points };
  });
  // runs on one line with a door-sized gap are ONE wall with a door in it
  const doors = res.doors.map((d) => { const m = toUV(d.at); return { along: raw[d.wall].dir === 'x' ? m[0] : m[1], dir: raw[d.wall].dir, c: raw[d.wall].c, width: d.width }; });
  const walls = [];
  for (const r of raw.slice().sort((p, q) => p.dir.localeCompare(q.dir) || p.lo - q.lo)) {
    const prev = walls.find((w) => w.dir === r.dir && Math.abs(w.c - r.c) < 100 && doors.some((d) => d.dir === r.dir && Math.abs(d.c - w.c) < 100 && d.along - d.width / 2 >= w.hi - 40 && d.along + d.width / 2 <= r.lo + 40));
    if (prev) { prev.hi = r.hi; prev.points += r.points; prev.c = (prev.c + r.c) / 2; } else walls.push({ ...r });
  }
  // the scan shows a wall's visible face: move an outside wall (one side empty) half its thickness outward, to its middle
  for (const w of walls) {
    let a = 0, b = 0;
    const P = w.dir === 'x' ? V : U, Q = w.dir === 'x' ? U : V;
    for (let i = 0; i < n; i++) {
      if (Q[i] < w.lo || Q[i] > w.hi) continue;
      const d = P[i] - w.c;
      if (d > 60 && d < 1500) a++; else if (d < -60 && d > -1500) b++;
    }
    const lo = Math.min(a, b), hi = Math.max(a, b);
    w.shift = hi > 20 && lo < 0.15 * hi ? (a < b ? 1 : -1) : 0;   // + toward the side with fewer points (the outside)
    w.c += w.shift * thickness / 2;
  }
  // corners: an end within `snap` of a perpendicular wall's line (and the wall reaches there) is moved onto that line
  for (const w of walls) {
    w.ends = [false, false];
    for (const end of [0, 1]) {
      const e = end ? w.hi : w.lo;
      let best = null;
      for (const q of walls) {
        if (q.dir === w.dir) continue;
        const d = Math.abs(q.c - e);
        if (d <= snap && w.c >= q.lo - snap && w.c <= q.hi + snap && (!best || d < best.d)) best = { d, c: q.c };
      }
      if (best) { if (end) w.hi = best.c; else w.lo = best.c; w.ends[end] = true; }
    }
  }
  // out: proposals in the slice's own axes
  const proposals = [], idOf = new Map();
  walls.forEach((w, k) => {
    const id = 'w' + (k + 1);
    idOf.set(w, id);
    const len = w.hi - w.lo;
    if (len < thickness) {
      problems.push(prob('scan.wall.short', 'warning', id, 'A wall run of ' + Math.round(len) + ' mm is shorter than the wall is thick (' + thickness + ' mm), so it is not proposed.', { op: '>=', value: thickness, unit: 'mm' }, { value: Math.round(len), unit: 'mm' }));
      return;
    }
    const a = w.dir === 'x' ? back(w.lo, w.c) : back(w.c, w.lo), b = w.dir === 'x' ? back(w.hi, w.c) : back(w.c, w.hi);
    proposals.push({ id, kind: 'wall', a: a.map(r1), b: b.map(r1), thickness, points: w.points, ends: w.ends, dir: w.dir });
    w.out = true;
    w.ends.forEach((closed, end) => { if (!closed) problems.push(prob('scan.wall.open', 'warning', id + (end ? 'b' : 'a'), 'The ' + (end ? 'end' : 'start') + ' of wall ' + id + ' does not meet another wall (nearest within ' + snap + ' mm: none). Check the scan there, or accept it as a free end.', { op: '<=', value: snap, unit: 'mm' }, { value: null, unit: 'mm' }, { x: (end ? b : a)[0], y: (end ? b : a)[1] })); });
  });
  let dn = 0;
  for (const d of doors) {
    const host = walls.find((w) => w.out && w.dir === d.dir && Math.abs(w.c - d.c) < 120 + thickness / 2 && d.along - d.width / 2 >= w.lo - 60 && d.along + d.width / 2 <= w.hi + 60);
    const at = d.dir === 'x' ? back(d.along, d.c) : back(d.c, d.along);
    dn++;
    if (!host) { problems.push(prob('scan.door.nowall', 'warning', 'd' + dn, 'A door-sized gap of ' + d.width + ' mm was found with no wall proposed around it.', null, { value: d.width, unit: 'mm' }, { x: at[0], y: at[1] })); continue; }
    proposals.push({ id: 'd' + dn, kind: 'door', wall: idOf.get(host), offset: Math.round(Math.max(0, d.along - d.width / 2 - host.lo)), width: d.width, at: at.map(r1) });
  }
  // the rooms these walls make: each wall a rectangle, its closed ends reaching the other wall's middle plus half its thickness
  const polys = walls.filter((w) => w.out).map((w) => {
    const h = thickness / 2, lo = w.lo - (w.ends[0] ? h : 0), hi = w.hi + (w.ends[1] ? h : 0);
    const R = w.dir === 'x' ? [[lo, w.c - h], [hi, w.c - h], [hi, w.c + h], [lo, w.c + h]] : [[w.c - h, lo], [w.c + h, lo], [w.c + h, hi], [w.c - h, hi]];
    return R.map((p) => back(p[0], p[1]));
  });
  const rooms = polys.length ? planLoops(polys).rooms.map((r) => ({ area: r1(r.area / 1e6), centroid: r.centroid.map(r1), poly: r.poly.map((p) => p.map(r1)) })) : [];
  if (proposals.some((p) => p.kind === 'wall') && !rooms.length) problems.push(prob('scan.noroom', 'note', 'rooms', 'The proposed walls do not close a room. Walls that run only part of the way, or a corner the scan missed, leave the plan open.', null, null));
  return { proposals, rooms, problems, notes, angle };
}

export function shiftProposals(r, [dx, dy]) {
  const mv = (p) => [r1(p[0] + dx), r1(p[1] + dy)];
  return { ...r, proposals: r.proposals.map((p) => (p.kind === 'wall' ? { ...p, a: mv(p.a), b: mv(p.b) } : { ...p, at: mv(p.at) })), rooms: r.rooms.map((m) => ({ ...m, centroid: mv(m.centroid), poly: m.poly.map(mv) })) };
}

function prob(code, severity, key, text, req, found, at) {
  return { id: 'scan:' + code + ':' + key, code, severity, text, source: { kind: 'import', name: 'scan' }, about: [{ kind: 'scan', id: key }], ...(at ? { where: { space: '2d', at: [r1(at.x), r1(at.y)] } } : {}), ...(req ? { req } : {}), ...(found ? { found } : {}) };
}

export { polyArea };

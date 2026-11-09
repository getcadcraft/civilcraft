/* SPDX-License-Identifier: Apache-2.0 */
// Scan to BIM engine tests (0.9 SU.1132): node lib/scanbim/test/test.mjs     (also exports makeRoom for the browser test)
// A synthetic cloud made from a KNOWN building: the answer is what the room was built from, and the recovery error is printed.
import * as E from '../lib/engine.js';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL ' + m); } };
const within = (a, b, tol, m) => { ok(Math.abs(a - b) <= tol, m + ' (' + a + ' vs ' + b + ', tol ' + tol + ')'); return Math.abs(a - b); };

// seeded noise so every run is the same cloud
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const gauss = (r) => { let u = 0; for (let i = 0; i < 6; i++) u += r(); return (u - 3) * Math.SQRT2; };

/**
 * A two-room building, millimetres, floor at z0, ceiling at z0 + 2700:
 *  outer inner faces 0..8000 x 0..5000 (walls 200 thick, scanned from inside only);
 *  a partition at x = 4000, 100 thick (faces 3950 and 4050, scanned from both rooms), a door 900 wide from y = 2000 to 2900 (sill 0, head 2100);
 *  a window in the south wall x 1500..2700, sill 900, head 2100. A table (a 1000 x 600 box top at 750) and clutter that must not become walls.
 *  step = point spacing on a surface, sigma = noise (mm). Returns { n, x, y, z, truth }.
 */
export function makeRoom({ z0 = 0, step = 25, sigma = 4, seed = 7, dx = 0, dy = 0 } = {}) {
  const r = rng(seed), X = [], Y = [], Z = [];
  const put = (x, y, z, flat = false) => { X.push(x + dx + gauss(r) * sigma); Y.push(y + dy + gauss(r) * sigma); Z.push(z0 + z + (flat ? 0 : (r() - 0.5) * step) + gauss(r) * sigma); };
  const H = 2700;
  const inWindow = (x, z) => x > 1500 && x < 2700 && z > 900 && z < 2100;
  const inDoor = (y, z) => y > 2000 && y < 2900 && z < 2100;
  // floor and ceiling
  for (let x = 0; x <= 8000; x += step * 2) for (let y = 0; y <= 5000; y += step * 2) { put(x, y, 0, true); put(x, y, H, true); }
  // south wall y = 0 (window), north y = 5000, west x = 0, east x = 8000
  for (let x = 0; x <= 8000; x += step) for (let z = 0; z <= H; z += step) { if (!inWindow(x, z)) put(x, 0, z); put(x, 5000, z); }
  for (let y = 0; y <= 5000; y += step) for (let z = 0; z <= H; z += step) { put(0, y, z); put(8000, y, z); }
  // partition faces both sides, door gap
  for (let y = 0; y <= 5000; y += step) for (let z = 0; z <= H; z += step) if (!inDoor(y, z)) { put(3950, y, z); put(4050, y, z); }
  // a table top and a chair-sized box: horizontal tops and legs, not walls
  for (let x = 5000; x <= 6000; x += step * 2) for (let y = 1000; y <= 1600; y += step * 2) put(x, y, 750, true);
  for (const [lx, ly] of [[5050, 1050], [5950, 1050], [5050, 1550], [5950, 1550]]) for (let z = 0; z <= 750; z += step) put(lx, ly, z);
  const n = X.length;
  return { n, x: Float64Array.from(X), y: Float64Array.from(Y), z: Float64Array.from(Z), truth: { z0, H, dx, dy,
    walls: [{ a: [-100, -100], b: [8100, -100], t: 200 }, { a: [8100, -100], b: [8100, 5100], t: 200 }, { a: [8100, 5100], b: [-100, 5100], t: 200 }, { a: [-100, 5100], b: [-100, -100], t: 200 }, { a: [4000, -100], b: [4000, 5100], t: 100 }],
    door: { y0: 2000, y1: 2900, sill: 0, height: 2100 }, window: { x0: 1500, x1: 2700, sill: 900, height: 1200 } } };
}

if (process.argv[1] && process.argv[1].endsWith('test.mjs')) {
  const R = makeRoom({ z0: 1234.5 });
  // ---- 1. floors from the height histogram
  const h = new E.ZHistogram(20); h.addMany(R.z);
  const planes = h.planes();
  ok(planes.length >= 2, 'at least two horizontal planes found: ' + planes.map((p) => Math.round(p.z)).join(', '));
  const st = E.storeysFromPlanes(planes);
  ok(st.length === 1, 'one storey (the table top at 750 mm is not a floor): ' + st.length);
  const eFloor = within(st[0].floor, 1234.5, 10, 'floor height');
  const eCeil = within(st[0].ceiling, 1234.5 + 2700, 10, 'ceiling height');
  console.log('floor error ' + eFloor.toFixed(1) + ' mm, ceiling error ' + eCeil.toFixed(1) + ' mm');
  // two storeys: the same room twice, 3000 above (slab 300): floor, ceiling, floor, ceiling
  const h2 = new E.ZHistogram(20); h2.addMany(R.z); for (let i = 0; i < R.n; i++) h2.add(R.z[i] + 3000);
  const st2 = E.storeysFromPlanes(h2.planes());
  ok(st2.length === 2 && Math.abs(st2[1].floor - st2[0].floor - 3000) < 15, 'two storeys 3000 apart: ' + st2.map((s) => Math.round(s.floor) + '/' + Math.round(s.ceiling)).join(' | '));

  // ---- 2. walls, thickness, height
  const P = { n: R.n, x: R.x, y: R.y, z: R.z };
  const t0 = Date.now();
  const S = E.proposeStorey(P, st[0]);
  console.log('proposed in ' + (Date.now() - t0) + ' ms: ' + S.walls.length + ' walls, ' + S.openings.length + ' openings, ' + S.floors.length + ' floors');
  ok(S.walls.length === 5, 'five walls found (four outside, one partition): ' + S.walls.length);
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  // each true wall: find the proposal whose ends are nearest (either order)
  const errs = [];
  for (const tw of R.truth.walls) {
    let best = null;
    for (const w of S.walls) { const e = Math.min(dist(w.a, tw.a) + dist(w.b, tw.b), dist(w.a, tw.b) + dist(w.b, tw.a)) / 2; if (!best || e < best.e) best = { e, w }; }
    errs.push({ truth: tw, e: best.e, w: best.w });
  }
  for (const q of errs) console.log('  wall truth t=' + q.truth.t + ' mm: ends off by ' + q.e.toFixed(1) + ' mm; proposed thickness ' + q.w.thickness + ' (' + q.w.thicknessFrom + '), height ' + q.w.height + ' (' + q.w.heightFrom + '), deviation rms ' + q.w.deviation.rms + ' mm over ' + q.w.deviation.n + ' points');
  for (const q of errs) ok(q.e <= 60, 'wall ends within 60 mm of the truth (t=' + q.truth.t + '): ' + q.e.toFixed(1));
  const part = errs[4].w;
  ok(part.thicknessFrom === 'points' && Math.abs(part.thickness - 100) <= 10, 'partition thickness read from its two faces: ' + part.thickness + ' mm (truth 100)');
  ok(errs.slice(0, 4).every((q) => q.w.thicknessFrom === 'assumed'), 'a wall seen from one side only has an ASSUMED thickness, and says so');
  ok(S.walls.every((w) => w.height === Math.round(st[0].ceiling - st[0].floor) && w.heightFrom === 'ceiling'), 'wall height = ceiling - floor: ' + S.walls[0].height);
  ok(S.walls.every((w) => w.deviation.rms != null && w.deviation.rms < 15), 'every wall carries a measured deviation under 15 mm: ' + S.walls.map((w) => w.deviation.rms).join(', '));

  // ---- 3. openings
  const door = S.openings.find((o) => o.kind === 'door'), win = S.openings.find((o) => o.kind === 'window');
  ok(!!door, 'a door is found'); ok(!!win, 'a window is found');
  if (door) {
    const w = S.walls.find((q) => q.id === door.wall), [ex, ey] = [(w.b[0] - w.a[0]), (w.b[1] - w.a[1])], L = Math.hypot(ex, ey), fwd = (ey / L) > 0;   // direction along +y?
    const y0 = fwd ? w.a[1] + door.offset : w.b[1] + (L - door.offset - door.width);
    console.log('  door: width ' + door.width + ' (truth 900), height ' + door.height + ' (truth 2100), sill ' + door.sill + ', near edge y ' + Math.round(y0) + ' (truth 2000), deviation ' + JSON.stringify(door.deviation));
    within(door.width, 900, 60, 'door width'); within(door.height, 2100, 80, 'door height'); within(y0, 2000, 60, 'door position along the wall');
    ok(door.sill === 0, 'a door starts at the floor');
  }
  if (win) {
    console.log('  window: width ' + win.width + ' (truth 1200), height ' + win.height + ' (truth 1200), sill ' + win.sill + ' (truth 900), deviation ' + JSON.stringify(win.deviation));
    within(win.width, 1200, 60, 'window width'); within(win.height, 1200, 80, 'window height'); within(win.sill, 900, 60, 'window sill');
  }
  ok(S.openings.length === 2, 'exactly two openings (no clutter, no shadows): ' + S.openings.length);

  // ---- 4. floors
  ok(S.floors.length === 2, 'two rooms, two floors: ' + S.floors.length);
  const areas = S.floors.map((f) => f.area).sort((a, b) => a - b), want = [3.95 * 5, 3.95 * 5].map((v) => v);   // the partition's centre at x = 4000, inner faces: 7.9 m wide in all; each room ~3.95 x 5 = 19.75 m2
  console.log('  floor areas ' + areas.join(', ') + ' m2 (rooms about 3.95 x 5 m); floor deviation rms ' + S.floors.map((f) => f.deviation.rms).join(', ') + ' mm over ' + S.floors.map((f) => f.deviation.n).join(', ') + ' points');
  ok(areas.every((a) => Math.abs(a - want[0]) < 1.2), 'room areas close to 19.75 m2 (walls assumed 150 mm where only one face was seen): ' + areas.join(', '));
  ok(S.floors.every((f) => f.deviation.rms != null && f.deviation.rms < 15), 'floor deviation measured (rms under 15 mm)');

  // ---- 5. the same building shifted far from the origin and turned: the answer moves with it
  const far = makeRoom({ z0: 0, dx: 4.6e8, dy: 1.2e8 });
  const H2 = new E.ZHistogram(20); H2.addMany(far.z);
  const S2 = E.proposeStorey({ n: far.n, x: far.x, y: far.y, z: far.z }, E.storeysFromPlanes(H2.planes())[0]);
  ok(S2.walls.length === 5 && S2.openings.length === 2, 'a building 460 km from the origin gives the same walls and openings: ' + S2.walls.length + '/' + S2.openings.length);

  // ---- 6. noise: a scan with 20 mm noise still finds the walls, and says its deviation is larger
  const noisy = makeRoom({ sigma: 20, seed: 3 });
  const Hn = new E.ZHistogram(20); Hn.addMany(noisy.z);
  const Sn = E.proposeStorey({ n: noisy.n, x: noisy.x, y: noisy.y, z: noisy.z }, E.storeysFromPlanes(Hn.planes())[0]);
  console.log('  noise 20 mm: ' + Sn.walls.length + ' walls, deviation rms ' + Sn.walls.map((w) => w.deviation.rms).join(', '));
  ok(Sn.walls.length >= 4, 'with 20 mm noise at least the four outside walls are found: ' + Sn.walls.length);
  ok(Math.max(...Sn.walls.map((w) => w.deviation.rms)) > Math.max(...S.walls.map((w) => w.deviation.rms)), 'the larger noise shows as a larger measured deviation');

  // ---- 7. nothing to find
  const empty = E.proposeStorey({ n: 0, x: new Float64Array(0), y: new Float64Array(0), z: new Float64Array(0) }, { floor: 0, ceiling: 2700 });
  ok(empty.walls.length === 0 && empty.notes.length > 0, 'an empty cloud gives no walls and a note');
  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

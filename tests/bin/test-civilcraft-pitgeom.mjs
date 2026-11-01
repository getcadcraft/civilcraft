#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-pitgeom.mjs — CivilCraft 0.8 EG.27 (civil_PART_4): bench outlines, the haul ramp and the pit cut into a ground (pit-geom.js), DOM-free.
 * Known answers: a terraced pit (rings of cells) has loops of known area/perimeter; the ramp drops one bench height over height/grade of road, holds its grade
 * on every piece, ends at the floor; a ramp wider than the strip is flagged; a flat ground gets a hole of known volume.
 *   node bin/test-civilcraft-pitgeom.mjs [--build dev|x.y]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const base = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const G = await import(pathToFileURL(path.join(base, 'pit-geom.js')).href), M = await import(pathToFileURL(path.join(base, 'mining.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);

// a terraced pit: 21 x 21 cells of 10 m, 4 layers; layer k mines a square of side (21 - 2*(3-k)... top layer k=3 widest) -> half-widths 10,8,6,4 cells... use sizes 21,17,13,9
const nx = 21, ny = 21, nz = 4, sizes = [9, 13, 17, 21];   // layer 0 (bottom) 9 cells wide ... layer 3 21
const m = M.makeModel({ nx, ny, nz, size: [10, 10, 10], origin: [0, 0, 100] });
const mined = new Uint8Array(nx * ny * nz);
for (let k = 0; k < nz; k++) { const w = sizes[k], o = (nx - w) / 2; for (let j = o; j < o + w; j++) for (let i = o; i < o + w; i++) mined[m.index(i, j, k)] = 1; }
for (let k = 0; k < nz; k++) { const L = G.benchLoops(m, mined, k); ok(L.length === 1, 'one loop at ' + k); near(L[0].area, (sizes[k] * 10) ** 2, 1e-6, 'area ' + k); near(L[0].perimeter, 4 * sizes[k] * 10, 1e-6, 'perimeter ' + k); ok(L[0].pts.length === 4, 'simplified to 4 corners'); }
{   // a hole: an unmined cell inside layer 3 gives a second loop of negative area
  const m2 = new Uint8Array(mined); m2[m.index(10, 10, 3)] = 0; const L = G.benchLoops(m, m2, 3);
  ok(L.length === 2 && L[1].area < 0, 'a hole is a second loop'); near(L[1].area, -100, 1e-6, 'hole area');
}
{   // an L shape and two touching corners stay simple loops
  const e = new Uint8Array(nx * ny * nz); for (const [i, j] of [[0, 0], [1, 0], [0, 1]]) e[m.index(i, j, 0)] = 1; const L = G.benchLoops(m, e, 0);
  ok(L.length === 1 && L[0].pts.length === 6, 'L shape = 6 corners'); near(L[0].area, 300, 1e-6, 'L area');
}
// floors
{ const f = G.columnFloors(m, mined); near(f[10 + nx * 10], 100, 1e-9, 'centre column floor = bottom'); near(f[0], 130, 1e-9, 'rim column: top layer only'); near(f[3 + nx * 10], 120, 1e-9, 'col 3: layer 2'); near(f[5 + nx * 10], 110, 1e-9, 'col 5: layer 1'); ok(Number.isNaN(G.columnFloors(m, new Uint8Array(mined.length))[0]), 'NaN where nothing is mined'); }
// ramp
const grade = 0.1, width = 8;
const R = G.rampRoute(m, mined, { grade, width });
ok(R.pts.length > 4 && !R.flags.includes('noRamp'), 'a route');
near(R.pts[0][2], 140, 1e-9, 'starts at the rim');
near(R.pts[R.pts.length - 1][2], 100, 1e-6, 'ends at the floor');
near(R.drop, 40, 1e-6, 'drops the pit depth');
{   // grade on the sloping pieces never exceeds the set grade (+ the flat steps between benches)
  let worst = 0, climb = 0; for (let i = 1; i < R.pts.length; i++) { const a = R.pts[i - 1], b = R.pts[i], h = Math.hypot(b[0] - a[0], b[1] - a[1]); if (h > 1e-9) { worst = Math.max(worst, Math.abs(b[2] - a[2]) / h); } if (b[2] > a[2] + 1e-9) climb++; }
  near(worst, grade, 1e-6, 'steepest piece = the grade'); ok(climb === 0, 'never climbs');
}
ok(R.benches.length === 4 && R.benches.every((b) => Math.abs(b.run - 100) < 1e-9), 'each bench: 10 m / 0.1 = 100 m of road');
ok(R.benches.every((b) => b.laps <= 1), 'fits one lap on every wall (perimeters 360 m+)');
ok(!R.flags.includes('wraps') && !R.flags.includes('ring-narrow'), 'no wrap or narrow ring: strip is 20 m and lane 4 m in');
{   // the lane is inset by half the width from the wall of its bench
  const b0 = R.pts[0]; const L = G.benchLoops(m, mined, 3)[0]; const xs = L.pts.map((p) => p[0]), ys = L.pts.map((p) => p[1]);
  const d = Math.min(b0[0] - Math.min(...xs), Math.max(...xs) - b0[0], b0[1] - Math.min(...ys), Math.max(...ys) - b0[1]); near(d, 4, 1e-6, 'lane half a width inside the wall');
}
{   // too wide for the strip (20 m strips: a 50 m road hangs over the lower bench), and the pit floor 90 m wide is fine for 50
  const W = G.rampRoute(m, mined, { grade, width: 50 }); ok(W.flags.includes('ring-narrow'), 'a 50 m road is wider than the strip');
  const S = G.rampRoute(m, mined, { grade: 0.01, width }); ok(S.flags.includes('wraps'), '1 % grade needs 1 km a bench: laps the wall');
  ok(G.rampRoute(m, new Uint8Array(mined.length), { grade, width }).flags.includes('noRamp'), 'nothing mined = noRamp');
  const F = G.rampRoute(m, mined, { grade, width: 100 }); ok(F.flags.includes('floor-narrow'), 'floor 90 m < 100 m road');
}
near(G.slopeWithRamp(45 * Math.PI / 180, 10, 0) * 180 / Math.PI, 45, 1e-9, 'no ramp, same slope');
near(G.slopeWithRamp(45 * Math.PI / 180, 10, 10) * 180 / Math.PI, Math.atan(10 / 20) * 180 / Math.PI, 1e-9, 'ramp width 10 on 10 m bench at 45 = atan(10/20)');
ok(G.slopeWithRamp(0.8, 10, 15) < G.slopeWithRamp(0.8, 10, 5), 'wider ramp, flatter');
// cut into a flat ground at 150
{
  const C = G.cutNodes(m, mined, () => 150, { margin: 2 });
  ok(C.nodes.length === (nx + 5) * (ny + 5), 'node grid ' + C.nodes.length);
  const mid = C.nodes.find((n) => n.a === 10 && n.b === 10); near(mid.z, 100, 1e-9, 'pit floor at the middle');
  const far = C.nodes.find((n) => n.a === -2 && n.b === -2); near(far.z, 150, 1e-9, 'ground outside');
  let v = 0; for (let k = 0; k < nz; k++) v += sizes[k] ** 2 * 1000;   // per layer cells x 10x10x... below
  // the dug volume to ground 150 over each column: (150 - floor) * 100
  let want = 0; const f = G.columnFloors(m, mined); for (const z of f) if (Number.isFinite(z)) want += (150 - z) * 100;
  near(C.dug, want, 1e-6, 'dug volume by columns'); void v;
  ok(!C.belowTop, 'model top (140) is under the ground (150) by one bench: not flagged'); ok(G.cutNodes(m, mined, () => 200).belowTop, 'ground far above the model top is flagged');
  ok(C.nodes.every((n) => n.z <= n.ground + 1e-9), 'never above the ground');
  ok(G.cutNodes(m, mined, (x) => (x > 100 ? null : 150)).nodes.length < C.nodes.length, 'unknown ground leaves nodes out');
}
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);

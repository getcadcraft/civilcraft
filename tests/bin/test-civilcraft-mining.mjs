#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-mining.mjs — CivilCraft 0.8 EG.27: block models and the ultimate pit (mining.js), DOM-free.
 * Known answers: OSA for 10 m benches, 70° face, 8 m berm = atan(10/(10/tan70° + 8)) = 40.7°; block value by hand; IDW at a sample = its grade, midway between two = their mean;
 * the ultimate pit equals the best closure found by trying EVERY closure on a small 2-D model (brute force); a 45° cone needs the 3 blocks above a deep ore block;
 * grade–tonnage: tonnes fall and the mean grade rises with the cut-off.
 *   node bin/test-civilcraft-mining.mjs [--build dev|x.y]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const M = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev', 'mining.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);
const D = Math.PI / 180;

near(M.overallSlope({ benchHeight: 10, faceAngle: 70 * D, berm: 8 }) / D, Math.atan(10 / (10 / Math.tan(70 * D) + 8)) / D, 1e-9, 'OSA formula'); near(M.overallSlope({ benchHeight: 10, faceAngle: 70 * D, berm: 8 }) / D, 40.7, 0.05, 'OSA ≈ 40.7°');
ok(M.overallSlope({ benchHeight: 10, faceAngle: 70 * D, berm: 8, ramp: 6 }) < M.overallSlope({ benchHeight: 10, faceAngle: 70 * D, berm: 8 }), 'a ramp flattens the overall slope');
{
  const m = M.makeModel({ nx: 3, ny: 1, nz: 1, size: [10, 10, 10], density: 2.5 });
  M.idw(m, [{ x: 5, y: 5, z: 5, grade: 2 }, { x: 25, y: 5, z: 5, grade: 4 }], { power: 2 });
  near(m.grade[0], 2, 1e-9, 'IDW at a sample'); near(m.grade[1], 3, 1e-9, 'IDW midway = mean'); near(m.grade[2], 4, 1e-9, 'IDW at the other sample');
  const v = M.blockValues(m, { price: 10, recovery: 0.9, processCost: 8, miningCost: 2 });
  const t = 10 * 10 * 10 * 2.5; near(v[0], t * (2 * 0.9 * 10 - 8) - t * 2, 1e-6, 'ore block value by hand'); near(M.blockValues(M.makeModel({ nx: 1, ny: 1, nz: 1, size: [10, 10, 10], density: 2.5 }), { price: 10, processCost: 8, miningCost: 2 })[0], -t * 2, 1e-6, 'waste block value');
}
{   // 2-D (ny = 1) brute force against all closures; slope 45°, blocks are cubes, 4-pattern = the three above (i-1, i, i+1)
  const nx = 5, nz = 3, m = M.makeModel({ nx, ny: 1, nz, size: [1, 1, 1] });
  let seed = 3; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  for (let trial = 0; trial < 6; trial++) {
    const v = new Float64Array(nx * nz); for (let b = 0; b < v.length; b++) v[b] = Math.round((rnd() - 0.55) * 20);
    const r = M.ultimatePit(m, v, { slope: 45 * D, pattern: 8 });
    // brute force
    let best = 0; const idx = (i, k) => i + nx * k;
    for (let mask = 0; mask < 1 << (nx * nz); mask++) {
      let valid = true, sum = 0;
      for (let k = 0; k < nz - 1 && valid; k++) for (let i = 0; i < nx && valid; i++) if (mask >> idx(i, k) & 1) for (let d = -1; d <= 1; d++) { const ii = i + d; if (ii >= 0 && ii < nx && !(mask >> idx(ii, k + 1) & 1)) { valid = false; break; } }
      if (!valid) continue; for (let b = 0; b < v.length; b++) if (mask >> b & 1) sum += v[b]; if (sum > best) best = sum;
    }
    near(r.value, best, 1e-9, `ultimate pit = best closure (trial ${trial}): ${best}`);
    // the result itself is a closure
    for (let k = 0; k < nz - 1; k++) for (let i = 0; i < nx; i++) if (r.mined[idx(i, k)]) for (let d = -1; d <= 1; d++) { const ii = i + d; if (ii >= 0 && ii < nx) ok(r.mined[idx(ii, k + 1)] === 1, 'precedence kept'); }
  }
}
{   // a deep ore block pays for the waste above it only if rich enough
  const m = M.makeModel({ nx: 5, ny: 1, nz: 3, size: [1, 1, 1] }), v = new Float64Array(15).fill(-1); v[m.index(2, 0, 0)] = 100;
  const r = M.ultimatePit(m, v, { slope: 45 * D }); ok(r.mined[m.index(2, 0, 0)] === 1, 'ore mined'); near(r.blocks, 1 + 3 + 5, 0, 'cone: 1 ore + 3 above + 5 on the top'); near(r.value, 100 - 8, 1e-9, 'value after stripping');
  v[m.index(2, 0, 0)] = 5; ok(M.ultimatePit(m, v, { slope: 45 * D }).blocks === 0, 'poor ore: nothing mined');
  const steep = M.ultimatePit(m, (() => { const w = new Float64Array(15).fill(-1); w[m.index(2, 0, 0)] = 100; return w; })(), { slope: 80 * D }); ok(steep.blocks < r.blocks, 'a steeper slope removes less waste');
}
{
  const m = M.makeModel({ nx: 4, ny: 1, nz: 1, size: [10, 10, 10], density: 2 }); m.grade.set([0.5, 1, 2, 4]);
  const g = M.gradeTonnage(m, [0, 1, 2]); ok(g[0].tonnes > g[1].tonnes && g[1].tonnes > g[2].tonnes, 'tonnes fall'); ok(g[2].grade > g[1].grade && g[1].grade > g[0].grade, 'grade rises');
  near(g[0].grade, (0.5 + 1 + 2 + 4) / 4, 1e-9, 'mean grade'); near(g[1].tonnes, 3 * 2000, 1e-9, 'tonnes at cut-off 1');
}
{
  const m = M.makeModel({ nx: 5, ny: 1, nz: 3, size: [1, 1, 1] }), v = new Float64Array(15).fill(-1); v[m.index(2, 0, 0)] = 100; m.grade[m.index(2, 0, 0)] = 3;
  const r = M.ultimatePit(m, v, { slope: 45 * D }), s = M.pitSummary(m, v, r); near(s.strip, 8, 1e-9, 'strip ratio 8 t waste per t ore (1 block of ore)'); ok(s.benches.length === 3, 'three benches');
}
console.log(`mining: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);

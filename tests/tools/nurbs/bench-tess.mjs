#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bench-tess.mjs — cc-nurbs tessellation and analysis benchmark (0.8 SU.747b, session `nurbs`). A WORKSTATION script (KICKOFF
 * rule 25: big tessellation benchmarks never run on the VPS); `--smoke` runs one small case to prove it works.
 *
 *   node tools/nurbs/bench-tess.mjs [--smoke] [--out result.json] [--repeat 3]
 *
 * For patch sets of growing size (1 to 400 bicubic patches of 12 × 12 control points, a rational sphere and torus), at
 * tolerances 0.1 / 0.01 / 0.001 mm: tessellate with analytic normals (and with K/H per vertex — the curvature map), count
 * triangles, measure the worst chord error on the sphere against r, and time each (best of `repeat`). Also: point and
 * derivative evaluations per second, closest-point queries per second, one continuity report over every shared edge.
 * Output JSON { script, machine, cpus, load, node, date, smoke, rows: [...] }; paste into docs/0.8-sessions/nurbs.md § Results.
 */
import os from 'node:os';
import fs from 'node:fs';
import { performance } from 'node:perf_hooks';
import * as C from '../../lib/nurbs/curve.js';
import * as F from '../../lib/nurbs/fit.js';
import * as S from '../../lib/nurbs/surface.js';
import * as K from '../../lib/nurbs/construct.js';
import * as G from '../../lib/nurbs/continuity.js';
import * as V from '../../lib/nurbs/vec.js';

const args = process.argv.slice(2);
const SMOKE = args.includes('--smoke');
const OUT = args.includes('--out') ? args[args.indexOf('--out') + 1] : null;
const REPEAT = args.includes('--repeat') ? +args[args.indexOf('--repeat') + 1] : SMOKE ? 1 : 3;
const best = (fn) => { let b = Infinity, r; for (let i = 0; i < REPEAT; i++) { const t = performance.now(); r = fn(); b = Math.min(b, performance.now() - t); } return { ms: b, r }; };

/** An n × n grid of bicubic patches on z = sin(x/7)·cos(y/9)·3, neighbours sharing edges exactly (G0 by construction). */
function grid(n) {
  const out = [];
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
    const t = Array.from({ length: 25 }, (_, i) => i / 24);
    const Q = t.map((u) => t.map((v) => { const x = (a + u) * 20, y = (b + v) * 20; return [x, y, Math.sin(x / 7) * Math.cos(y / 9) * 3]; }));
    out.push(F.fitSurfaceGrid(Q, t, t, 3, 3, [0, 0, 0, 0, ...Array.from({ length: 8 }, (_, i) => (i + 1) / 9), 1, 1, 1, 1], [0, 0, 0, 0, ...Array.from({ length: 8 }, (_, i) => (i + 1) / 9), 1, 1, 1, 1]));
  }
  return out;
}

const rows = [];
const sph = K.revolve(C.arc([0, 0, 0], [0, 0, -1], [1, 0, 0], 50, 0, Math.PI), [0, 0, 0], [0, 0, 1]).surface;
const tor = K.revolve(C.circle([80, 0, 0], [0, 1, 0], 20), [0, 0, 0], [0, 0, 1]).surface;
for (const tol of SMOKE ? [0.1] : [0.1, 0.01, 0.001]) {
  for (const [name, s] of [['sphere r50', sph], ['torus 80/20', tor]]) {
    const { ms, r } = best(() => S.tessellate(s, { tol, maxPerSpan: 512 }));
    let sag = 0;
    if (name.startsWith('sphere')) for (let k = 0; k < r.indices.length; k += 3) {
      const c = [0, 1, 2].map((j) => Array.from(r.positions.subarray(r.indices[k + j] * 3, r.indices[k + j] * 3 + 3)));
      sag = Math.max(sag, 50 - V.len(V.mul(V.add(V.add(c[0], c[1]), c[2]), 1 / 3)));
    }
    const km = best(() => S.tessellate(s, { tol, maxPerSpan: 512, curvature: true })).ms;
    rows.push({ case: name, tol, triangles: r.indices.length / 3, ms, msWithCurvature: km, sag: name.startsWith('sphere') ? sag : undefined });
  }
  for (const n of SMOKE ? [1] : [1, 5, 10, 20]) {
    const patches = grid(n);
    const { ms, r } = best(() => patches.map((p) => S.tessellate(p, { tol, maxPerSpan: 256 })));
    rows.push({ case: n * n + ' bicubic patches 12×12', tol, triangles: r.reduce((x, t) => x + t.indices.length / 3, 0), ms });
  }
}
{
  const p = grid(1)[0], n = SMOKE ? 2000 : 200000;
  const a = best(() => { let x = 0; for (let i = 0; i < n; i++) x += S.point(p, (i % 997) / 997, (i % 991) / 991)[2]; return x; });
  const d = best(() => { let x = 0; for (let i = 0; i < n; i++) x += S.derivs(p, (i % 997) / 997, (i % 991) / 991, 2)[1][1][2]; return x; });
  const q = SMOKE ? 50 : 5000;
  const c = best(() => { let x = 0; for (let i = 0; i < q; i++) x += S.closestPoint(p, [(i % 97) / 97 * 20, (i % 89) / 89 * 20, 5]).d; return x; });
  rows.push({ case: 'evaluation, bicubic 12×12', pointsPerSec: Math.round(n / a.ms * 1000), derivs2PerSec: Math.round(n / d.ms * 1000), closestPerSec: Math.round(q / c.ms * 1000) });
}
{
  const patches = grid(SMOKE ? 2 : 10);
  const { ms, r } = best(() => G.patchReport(patches, { want: () => 'G0' }));
  rows.push({ case: 'continuity report, ' + patches.length + ' patches', edges: r.edges.length, worst: r.worst ? r.worst.cls : null, ms });
}
const result = { script: 'tools/nurbs/bench-tess.mjs', machine: os.hostname(), cpus: os.cpus().length, load: os.loadavg(), node: process.version, date: new Date().toISOString(), smoke: SMOKE, repeat: REPEAT, rows };
const text = JSON.stringify(result, null, 1);
if (OUT) fs.writeFileSync(OUT, text); else console.log(text);

#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sweep-fit.mjs — cc-nurbs fitting and continuity sweeps (0.8 SU.747b, session `nurbs`). A WORKSTATION script (KICKOFF rule 25:
 * NURBS fitting sweeps never run on the VPS); `--smoke` runs a few cases only, to prove the script works.
 *
 *   node tools/nurbs/sweep-fit.mjs [--smoke] [--out result.json] [--seed n]
 *
 * Sweeps, each over seeded random inputs:
 *   interp   — interpolation through n points (degree 2–5, chord/centripetal): max distance at the data (must be ~0) and the
 *              curve's control-point count
 *   approx   — least squares of a dense sample of a known curve with k control points: max deviation vs k
 *   fitTo    — functions fitted to tolerances 1e-2 … 1e-6: control points needed, deviation reached
 *   match    — matchSurface G0/G1/G2 on random lofts against random neighbours: measured class, gap / angle / Δκ, refinements
 *   blend    — blendSurface G1/G2 between random patch pairs: measured class at both edges, sections
 *   network  — Gordon surfaces through random curve grids on z = f(x, y): deviation from the network
 * Output: one JSON object { script, machine, node, date, smoke, seed, sweeps: { name: { cases, failures, rows } }, seconds }.
 * Paste the JSON into docs/0.8-sessions/nurbs.md § Results (rule 30).
 */
import os from 'node:os';
import fs from 'node:fs';
import * as C from '../../lib/nurbs/curve.js';
import * as F from '../../lib/nurbs/fit.js';
import * as S from '../../lib/nurbs/surface.js';
import * as K from '../../lib/nurbs/construct.js';
import * as M from '../../lib/nurbs/match.js';
import * as G from '../../lib/nurbs/continuity.js';
import * as V from '../../lib/nurbs/vec.js';

const args = process.argv.slice(2);
const SMOKE = args.includes('--smoke');
const OUT = args.includes('--out') ? args[args.indexOf('--out') + 1] : null;
let seed = args.includes('--seed') ? +args[args.indexOf('--seed') + 1] : 20261027;
const SEED0 = seed;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const N = (full, smoke) => (SMOKE ? smoke : full);
const RANK = { none: 0, G0: 1, G1: 2, G2: 3 };
const t0 = Date.now();
const sweeps = {};
const sweep = (name, fn) => { const rows = [], fails = []; const s = Date.now(); fn(rows, fails); sweeps[name] = { cases: rows.length, failures: fails.length, failed: fails.slice(0, 20), seconds: (Date.now() - s) / 1000, rows: SMOKE ? rows : rows.slice(0, 400) }; console.error(name + ': ' + rows.length + ' cases, ' + fails.length + ' failures'); };

const rndPts = (n, s = 10) => { const P = []; let x = 0; for (let i = 0; i < n; i++) { x += 0.5 + rnd(); P.push([x * s / n, (rnd() - 0.5) * s, (rnd() - 0.5) * s]); } return P; };
const rndRow = (y, n = 4) => F.interpolate(Array.from({ length: n }, (_, i) => [i * 10 / (n - 1), y + (rnd() - 0.5), (rnd() - 0.5) * 3]), 3);

sweep('interp', (rows, fails) => {
  for (let k = 0; k < N(400, 6); k++) {
    const n = 4 + Math.floor(rnd() * N(60, 8)), p = 2 + (k % 4), kind = k % 2 ? 'centripetal' : 'chord';
    const Q = rndPts(n), t = F.params(Q, kind), c = F.interpolate(Q, p, { kind });
    const err = Math.max(...Q.map((q, i) => V.dist(C.point(c, t[i]), q)));
    rows.push({ n, p, kind, err });
    if (!(err < 1e-8)) fails.push({ n, p, kind, err });
  }
});

sweep('approx', (rows, fails) => {
  for (let k = 0; k < N(200, 4); k++) {
    const src = F.interpolate(rndPts(8 + (k % 12)), 3), pts = [], t = [];
    for (let i = 0; i <= 400; i++) { t.push(i / 400); pts.push(C.point(src, i / 400)); }
    for (const cv of [6, 10, 16, 24, 40]) {
      const c = F.approximate(pts, 3, cv, { params: t });
      const dev = F.deviation(c, pts).max;
      rows.push({ case: k, cvs: cv, dev });
      if (!Number.isFinite(dev)) fails.push({ case: k, cvs: cv });
    }
  }
});

sweep('fitTo', (rows, fails) => {
  for (let k = 0; k < N(60, 2); k++) {
    const a = 1 + rnd() * 6, b = rnd() * 3;
    const f = (s) => [s * 10, Math.sin(a * s) * 3, Math.cos(b * s * s) * 2];
    for (const tol of [1e-2, 1e-3, 1e-4, 1e-5, 1e-6]) {
      const r = F.fitTo(f, 3, tol, { maxCvs: 800 });
      rows.push({ case: k, tol, cvs: r.curve.cvs.length, dev: r.deviation });
      if (r.deviation > tol) fails.push({ case: k, tol, dev: r.deviation, cvs: r.curve.cvs.length });
    }
  }
});

sweep('match', (rows, fails) => {
  for (let k = 0; k < N(120, 3); k++) {
    const plane = rnd() < 0.5;
    const target = plane ? K.extrude(C.line([0, -5, 0], [0, 0, 0]), [10, 0, 0]).surface
      : K.extrude(C.arc([0, 0, 2 + rnd() * 3], [0, 0, -1], [0, 1, 0], 2 + rnd() * 3, 0, Math.PI / 2), [10, 0, 0]).surface;
    const edge = plane ? 'u1' : 'u1';
    const e0 = S.edgeCurve(target, edge);
    const start = Array.from({ length: 3 }, (_, i) => V.add(C.point(e0, i / 2), [(rnd() - 0.5) * 0.2, (rnd() - 0.5) * 0.2, (rnd() - 0.5) * 0.2]));
    const far = start.map((p) => V.add(p, [0, 3 + rnd() * 2, 2 + rnd() * 2]));
    const mid = start.map((p, i) => V.lerp(p, far[i], 0.5).map((x) => x + (rnd() - 0.5)));
    const s = K.loft([F.interpolate(start, 2), F.interpolate(mid, 2), F.interpolate(far, 2)], { degree: 2 }).surface;
    for (const want of ['G0', 'G1', 'G2']) {
      const r = M.matchSurface(s, 'v0', target, edge, { continuity: want });
      const m = G.surfaceEdge(r.surface, 'v0', target, edge);
      rows.push({ case: k, target: plane ? 'plane' : 'cylinder', want, got: m.cls, gap: m.gap, angle: m.angle, dk: m.dk.max, refinements: r.report.refinements });
      if (RANK[m.cls] < RANK[want]) fails.push({ case: k, want, got: m.cls, gap: m.gap, angle: m.angle, dk: m.dk.max });
    }
  }
});

sweep('blend', (rows, fails) => {
  for (let k = 0; k < N(80, 2); k++) {
    const a = K.loft([rndRow(0), rndRow(3)], { degree: 1 }).surface;
    const b = K.loft([rndRow(8 + rnd() * 3), rndRow(12)], { degree: 1 }).surface;
    for (const want of ['G1', 'G2']) {
      const r = M.blendSurface(a, 'v1', b, 'v0', { continuity: want });
      rows.push({ case: k, want, a: r.report.a.measured, b: r.report.b.measured, sections: r.report.sections, dkA: r.report.a.dk, dkB: r.report.b.dk });
      if (RANK[r.report.a.measured] < RANK[want] || RANK[r.report.b.measured] < RANK[want]) fails.push({ case: k, want, a: r.report.a, b: r.report.b });
    }
  }
});

sweep('network', (rows, fails) => {
  for (let k = 0; k < N(40, 2); k++) {
    const a = 0.5 + rnd(), b = 0.5 + rnd(), f = (x, y) => Math.sin(a * x) * Math.cos(b * y);
    const np = 3 + (k % 3), ng = 3 + ((k >> 1) % 3);
    const P = Array.from({ length: np }, (_, i) => { const y = i * 3 / (np - 1); return F.interpolate(Array.from({ length: 13 }, (_, j) => { const x = j / 12 * 3; return [x, y, f(x, y)]; }), 3); });
    const Gs = Array.from({ length: ng }, (_, i) => { const x = i * 3 / (ng - 1); return F.interpolate(Array.from({ length: 13 }, (_, j) => { const y = j / 12 * 3; return [x, y, f(x, y)]; }), 3); });
    try {
      const r = K.network(P, Gs, { tol: 0.01 });
      rows.push({ case: k, profiles: np, guides: ng, dev: r.report.deviation, exact: r.report.exact });
      if (r.report.deviation > 0.01) fails.push({ case: k, dev: r.report.deviation });
    } catch (e) { rows.push({ case: k, error: e.code || String(e) }); fails.push({ case: k, error: e.code || String(e) }); }
  }
});

const result = {
  script: 'tools/nurbs/sweep-fit.mjs', machine: os.hostname(), cpus: os.cpus().length, load: os.loadavg(), node: process.version,
  date: new Date().toISOString(), smoke: SMOKE, seed: SEED0, seconds: (Date.now() - t0) / 1000, sweeps,
};
const text = JSON.stringify(result, null, SMOKE ? 0 : 1);
if (OUT) fs.writeFileSync(OUT, text); else console.log(text);
process.exit(Object.values(sweeps).some((s) => s.failures) ? 1 : 0);

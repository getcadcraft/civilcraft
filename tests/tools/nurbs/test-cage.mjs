#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-cage.mjs — cc-nurbs 0.9 D9.8 option A: SubD cages that are exact NURBS (lib/nurbs/cage.js). Known answers:
 *   - the surface of a regular grid at u = m−1, v = l−1 IS the Catmull–Clark limit point of vertex (m, l) (the 1/36 stencil)
 *   - one Catmull–Clark step (rules written out on their own) gives the SAME surface: S'(2u+1, 2v+1) = S(u, v)
 *   - a quad mesh (grid, then a closed torus): one exact single-span patch per regular quad; each patch equals the grid surface's
 *     span; patches of neighbouring quads share their edge and meet with the same tangent plane (C2 in fact)
 *   - quads with a vertex that has other than four edges are left out and named; cube corners, borders
 *   - bad input is refused with a code
 *   node tools/nurbs/test-cage.mjs [--verbose]
 */
import * as N from '../../lib/nurbs/index.js';
const { cage, surface: S } = N;
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m + (x ? ' - ' + x : '')); } else { fail++; console.log('  FAIL ' + m + (x ? ' - ' + x : '')); } };
const section = (s) => console.log('\n== ' + s);
const code = (f) => { try { f(); return null; } catch (e) { return e && e.code ? e.code : String(e); } };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

let seed = 99; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const bumpy = (n, m) => Array.from({ length: n }, (_, i) => Array.from({ length: m }, (_, j) => [i * 2 + rnd() * 0.5, j * 2 + rnd() * 0.5, Math.sin(i * 0.7) * Math.cos(j * 0.6) * 3 + rnd() * 0.3]));

section('the regular grid is the limit surface');
{
  const g = bumpy(8, 7), s = cage.gridToSurface(g);
  const [u0, u1] = S.domainU(s), [v0, v1] = S.domainV(s);
  ok(u0 === 0 && u1 === 5 && v0 === 0 && v1 === 4, `open surface domain [0, ${u1}] × [0, ${v1}] for an 8 × 7 grid`);
  let worst = 0;
  for (let m = 1; m <= 6; m++) for (let l = 1; l <= 5; l++) worst = Math.max(worst, dist(S.point(s, m - 1, l - 1), cage.limitPoint(g, m, l)));
  ok(worst < 1e-12, 'S(m−1, l−1) equals the Catmull–Clark limit stencil of vertex (m, l)', worst.toExponential(1));
  const c = cage.gridToSurface(g, { ends: 'clamped' });
  ok(dist(S.point(c, 0, 0), g[0][0]) < 1e-12 && dist(S.point(c, 5, 4), g[7][6]) < 1e-12, 'clamped: the surface reaches the first and last cage points');
}

section('one Catmull–Clark step does not move the surface');
{
  const g = bumpy(7, 7), r = cage.catmullClarkGrid(g), s = cage.gridToSurface(g), s2 = cage.gridToSurface(r);
  ok(r.length === 13 && r[0].length === 13, 'a 7 × 7 grid refines to 13 × 13');
  let worst = 0;
  for (let k = 0; k < 40; k++) { const u = rnd() * 4, v = rnd() * 4; worst = Math.max(worst, dist(S.point(s, u, v), S.point(s2, 2 * u + 1, 2 * v + 1))); }
  ok(worst < 1e-12, 'S′(2u+1, 2v+1) = S(u, v) at 40 random points', worst.toExponential(1));
  let w2 = 0;
  for (let m = 1; m <= 5; m++) for (let l = 1; l <= 5; l++) w2 = Math.max(w2, dist(cage.limitPoint(g, m, l), cage.limitPoint(r, 2 * m, 2 * l)));
  ok(w2 < 1e-12, 'limit points are unchanged by the refinement', w2.toExponential(1));
}

// mesh builders
const gridMesh = (n, m, g) => { const verts = []; for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) verts.push(g[i][j]); const quads = []; for (let i = 0; i + 1 < n; i++) for (let j = 0; j + 1 < m; j++) quads.push([i * m + j, (i + 1) * m + j, (i + 1) * m + j + 1, i * m + j + 1]); return { verts, quads }; };

section('a quad mesh: one exact patch per regular quad');
{
  const n = 8, m = 8, g = bumpy(n, m), mesh = gridMesh(n, m, g), R = cage.quadMeshToSurfaces(mesh), big = cage.gridToSurface(g);
  ok(R.patches.length === 25 && R.pending.length === mesh.quads.length - 25, `${R.patches.length} patches, ${R.pending.length} left out (the border ring) of ${mesh.quads.length} quads`);
  ok(R.pending.every((p) => p.why === 'boundary'), 'a quad on the border is left out as "boundary"');
  let worst = 0;
  for (const p of R.patches) {
    const i = Math.floor(p.quad / (m - 1)), j = p.quad % (m - 1);   // quad (i, j): corner A = vertex (i, j), A→B along +i
    for (let k = 0; k < 6; k++) { const a = rnd(), b = rnd(); worst = Math.max(worst, dist(S.point(p.surface, a, b), S.point(big, i - 1 + b, j - 1 + a))); }
  }
  ok(worst < 1e-12, 'every patch equals its span of the grid surface (24 random points each)', worst.toExponential(1));
}

section('a closed torus: all regular, no border');
{
  const U = 8, W = 6, verts = [], quads = [], id = (i, j) => (i % U) * W + (j % W);
  for (let i = 0; i < U; i++) for (let j = 0; j < W; j++) { const a = (i / U) * 2 * Math.PI, b = (j / W) * 2 * Math.PI, rr = 3 + Math.cos(b); verts.push([rr * Math.cos(a), rr * Math.sin(a), Math.sin(b)]); }
  for (let i = 0; i < U; i++) for (let j = 0; j < W; j++) quads.push([id(i, j), id(i + 1, j), id(i + 1, j + 1), id(i, j + 1)]);
  const R = cage.quadMeshToSurfaces({ verts, quads });
  ok(R.patches.length === U * W && R.pending.length === 0, `all ${U * W} quads of the torus are exact patches`);
  // neighbouring patches: quad (i, j) and (i+1, j) share the edge B–C of the first = A–D of the second
  const by = new Map(R.patches.map((p) => [p.quad, p.surface])), q = (i, j) => by.get((i % U) * W + (j % W));
  let wp = 0, wn = 0;
  for (let i = 0; i < U; i++) for (let j = 0; j < W; j++) for (let k = 0; k <= 4; k++) {
    const t = k / 4;
    // patch (u = a, v = b): a along A→D (j), b along A→B (i). Quad (i, j)'s edge at b = 1 is the same curve as quad (i+1, j)'s edge at b = 0.
    const p1 = S.point(q(i, j), t, 1), p2 = S.point(q(i + 1, j), t, 0);
    wp = Math.max(wp, dist(p1, p2));
    const n1 = S.normal(q(i, j), t, 1), n2 = S.normal(q(i + 1, j), t, 0);
    wn = Math.max(wn, dist(n1, n2));
  }
  ok(wp < 1e-12, 'neighbouring patches share their edge exactly', wp.toExponential(1));
  ok(wn < 1e-9, 'and have the same normal along it (G1 at least)', wn.toExponential(1));
  // sanity: a coarse periodic cage shrinks under the limit (a ring of N points shrinks by (4 + 2 cos(2π/N)) / 6 = 0.83 for N = 6, 0.90 for N = 8)
  let area = 0; const nn = 12;
  for (const p of R.patches) for (let a = 0; a < nn; a++) for (let b = 0; b < nn; b++) { const u = (a + 0.5) / nn, v = (b + 0.5) / nn, du = S.derivs(p.surface, u, v, 1); const cr = [du[1][0][1] * du[0][1][2] - du[1][0][2] * du[0][1][1], du[1][0][2] * du[0][1][0] - du[1][0][0] * du[0][1][2], du[1][0][0] * du[0][1][1] - du[1][0][1] * du[0][1][0]]; area += Math.hypot(...cr) / (nn * nn); }
  const exact = 4 * Math.PI * Math.PI * 3 * 1, shrink = (4 + 2 * Math.cos(2 * Math.PI / 6)) / 6 * (4 + 2 * Math.cos(2 * Math.PI / 8)) / 6;
  ok(area > 0.6 * exact && area < exact && area > 0.9 * shrink * exact * 0.8 && area < 1.1 * shrink * exact, `surface area ${area.toFixed(1)}: below the smooth torus ${exact.toFixed(1)} and near the ring-shrink estimate ${(shrink * exact).toFixed(1)}`);
}

section('extraordinary vertices are left out and named');
{
  // a cube cage, each face split 3 × 3 so there are interior regular quads on every face; the 8 cube corners have 3 edges
  const verts = [], quads = [], key = new Map(), n = 3;
  const V = (x, y, z) => { const k = [x, y, z].join(','); if (!key.has(k)) { key.set(k, verts.length); verts.push([x, y, z]); } return key.get(k); };
  const face = (o, a, b) => { for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const p = (s, t) => V(o[0] + a[0] * s + b[0] * t, o[1] + a[1] * s + b[1] * t, o[2] + a[2] * s + b[2] * t); quads.push([p(i, j), p(i + 1, j), p(i + 1, j + 1), p(i, j + 1)]); } };
  face([0, 0, 0], [1, 0, 0], [0, 1, 0]); face([0, 0, n], [0, 1, 0], [1, 0, 0]); face([0, 0, 0], [0, 1, 0], [0, 0, 1]); face([n, 0, 0], [0, 0, 1], [0, 1, 0]); face([0, 0, 0], [0, 0, 1], [1, 0, 0]); face([0, n, 0], [1, 0, 0], [0, 0, 1]);
  const R = cage.quadMeshToSurfaces({ verts, quads });
  const val = verts.map(() => new Set()); quads.forEach((q) => q.forEach((v, k) => { val[v].add(q[(k + 1) % 4]); val[v].add(q[(k + 3) % 4]); }));
  const regular = (q) => q.every((v) => val[v].size === 4);
  ok(R.patches.length > 0 && R.patches.every((p) => regular(quads[p.quad])), `${R.patches.length} quads are exact: each has four corners with four edges`);
  ok(R.pending.length > 0 && R.pending.every((p) => !regular(quads[p.quad]) && p.why === 'valence'), `${R.pending.length} quads touch a cube corner (three edges) and are left out as "valence"`);
  ok(R.patches.length + R.pending.length === quads.length, 'every quad is either a patch or named');
}

section('bad input');
{
  ok(code(() => cage.gridToSurface([[[0, 0, 0]]])) === 'nurbs.err.cv_count', 'a 1 × 1 grid is refused');
  ok(code(() => cage.gridToSurface(Array.from({ length: 4 }, () => [[0, 0, 0], [1, 0, 0], [2, 0, 0], [NaN, 0, 0]]))) === 'nurbs.err.cv_value', 'NaN is refused');
  ok(code(() => cage.quadMeshToSurfaces({ verts: [[0, 0, 0]], quads: [[0, 0, 0, 0]] })) === 'nurbs.err.cv_grid', 'a quad that repeats a vertex is refused');
  ok(code(() => cage.quadMeshToSurfaces({})) === 'nurbs.err.cv_grid', 'no mesh is refused');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

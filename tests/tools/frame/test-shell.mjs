#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-shell.mjs — plates, slab/wall meshing and rigid diaphragms in the frame solver (0.8 SU.1056 steps 1–2).
 *
 *   node tools/frame/test-shell.mjs [--verbose]
 *
 * Known answers, each with its source on the check's line:
 *   - patch tests on MacNeal & Harder's distorted five-element patch (R. H. MacNeal, R. L. Harder, "A proposed standard set of
 *     problems to test finite element accuracy", Finite Elements in Analysis and Design 1 (1985) 3–20, Fig. 2): membrane
 *     (u = 10⁻³(x + y/2), v = 10⁻³(y + x/2) → σx = σy = 1333, τxy = 400) and bending (w = 10⁻³(1 + x + y + x² + xy + y²)/2 →
 *     Mx = My = 1.111·10⁻⁷, Mxy = 0.333·10⁻⁷), flat and turned 30° out of the XY plane;
 *   - square plates under uniform load and a centre load against S. Timoshenko, S. Woinowsky-Krieger, Theory of Plates and
 *     Shells, 2nd ed., McGraw-Hill 1959: simply supported Table 8 (ν = 0.3: w = 0.00406 qa⁴/D, Mx = My = 0.0479 qa²),
 *     Table 23 (centre load: w = 0.01160 Pa²/D), clamped Table 35 (w = 0.00126 qa⁴/D, Mx = 0.0231 qa² at the centre,
 *     −0.0513 qa² at the middle of an edge);
 *   - a shear wall and a plate strip turned into a skew plane against Timoshenko beam theory (bending + shear, κ = 5/6);
 *   - rigid diaphragms against closed forms of cantilever columns (lateral stiffness 3EI/h³, torsion of the group
 *     Σ k r² + Σ GJ/h), two storeys by superposition (cantilever deflection P x² (3a − x) / 6EI), a portal whose beam is a
 *     diaphragm against the same portal with an axially rigid beam;
 *   - the mesher (areas, conformity, nodes at columns), untrusted files, equilibrium of every run, and a frame-only model
 *     staying as it was (no `plates` key, the banded solver).
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + name + (extra ? ' — ' + extra : '')); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);
const pct = (a, b) => (100 * (a / b - 1)).toFixed(3) + ' %';
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const FM = await load('lib/frame/frame-model.js');
const FS = await load('lib/frame/frame-solve.js');
const PL = await load('lib/frame/plate.js');
const PS = await load('lib/frame/plate-solve.js');
const MS = await load('lib/frame/plate-mesh.js');

const head = (s) => console.log(s);
const eqm = (label, sol) => {
  let worst = 0;
  for (const R of Object.values(sol.results)) {
    const F = Math.max(1, ...R.applied.slice(0, 3).map(Math.abs)), Mo = Math.max(1, ...R.applied.slice(3).map(Math.abs));
    for (let k = 0; k < 6; k++) worst = Math.max(worst, Math.abs(R.applied[k] + R.reacted[k]) / (k < 3 ? F : Mo));
  }
  ok(worst < 1e-8, `${label}: loads and reactions balance (out of balance ${worst.toExponential(1)})`);
};
const clean = (j) => { const r = FM.cleanFrame({ format: 'cadcraft-frame', version: 1, name: 't', sections: [], members: [], combos: [], ...j }); return r; };

// ───────────────────────────────────────────────────────────── patch tests (element level)
head('Patch tests (MacNeal & Harder 1985, Fig. 2)');
{
  const XY = [[0, 0], [0.24, 0], [0.24, 0.12], [0, 0.12], [0.04, 0.02], [0.18, 0.03], [0.16, 0.08], [0.08, 0.08]];
  const ELS = [[0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7], [4, 5, 6, 7]];
  const E = 1e6, nu = 0.25, t = 0.001;
  /** solve the patch with the outer four corners prescribed; frame: point → 3D, local displacements → global */
  const patch = (exact, tilt) => {
    const c = Math.cos(tilt), s = Math.sin(tilt);
    const ex = [1, 0, 0], ey = [0, c, s], ez = [0, -s, c];
    const to3 = (p) => [p[0], c * p[1], s * p[1]];
    const glob = (loc) => { const g = new Array(6).fill(0); for (let k = 0; k < 3; k++) { g[k] = loc[0] * ex[k] + loc[1] * ey[k] + loc[2] * ez[k]; g[3 + k] = loc[3] * ex[k] + loc[4] * ey[k]; } return g; };
    const nn = XY.length, K = Array.from({ length: 6 * nn }, () => new Float64Array(6 * nn));
    const els = ELS.map((q) => { const el = PL.plateStiffness(q.map((i) => to3(XY[i])), E, nu, t); return { el, nodes: el.ax.order.map((k) => q[k]) }; });
    for (const { el, nodes } of els) for (let a = 0; a < 24; a++) for (let b = 0; b < 24; b++) K[6 * nodes[a / 6 | 0] + a % 6][6 * nodes[b / 6 | 0] + b % 6] += el.kg[a * 24 + b];
    const u = new Float64Array(6 * nn);
    for (let i = 0; i < 4; i++) u.set(glob(exact(XY[i])), 6 * i);
    // interior unknowns: every dof but the rotation about the normal (no drilling stiffness; it is not part of the test)
    const free = [];
    for (let i = 4; i < nn; i++) for (let d = 0; d < 6; d++) free.push(6 * i + d);
    // the drilling direction at each interior node is ez: replace the three rotations by the two in-plane ones
    const basis = [];
    for (let i = 4; i < nn; i++) { for (let d = 0; d < 3; d++) basis.push({ q: 6 * i + d, v: null }); basis.push({ node: i, v: ex }); basis.push({ node: i, v: ey }); }
    const col = (b) => { const v = new Float64Array(6 * nn); if (b.v) for (let k = 0; k < 3; k++) v[6 * b.node + 3 + k] = b.v[k]; else v[b.q] = 1; return v; };
    const C = basis.map(col), m = C.length;
    const Kv = (v) => K.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
    const Ku = Kv(u);
    const A = C.map((ci) => { const kc = Kv(ci); return C.map((cj) => cj.reduce((s, x, j) => s + x * kc[j], 0)); });
    const rhs = C.map((ci) => -ci.reduce((s, x, j) => s + x * Ku[j], 0));
    for (let i = 0; i < m; i++) { let p = i; for (let r = i + 1; r < m; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r; [A[i], A[p]] = [A[p], A[i]]; [rhs[i], rhs[p]] = [rhs[p], rhs[i]]; for (let r = i + 1; r < m; r++) { const f = A[r][i] / A[i][i]; for (let k = i; k < m; k++) A[r][k] -= f * A[i][k]; rhs[r] -= f * rhs[i]; } }
    const x = new Array(m); for (let i = m - 1; i >= 0; i--) { let s2 = rhs[i]; for (let k = i + 1; k < m; k++) s2 -= A[i][k] * x[k]; x[i] = s2 / A[i][i]; }
    C.forEach((ci, k) => { for (let j = 0; j < ci.length; j++) u[j] += x[k] * ci[j]; });
    let du = 0, scale = 0;
    for (let i = 4; i < nn; i++) { const g = glob(exact(XY[i])); for (let d = 0; d < 5; d++) { du = Math.max(du, Math.abs(u[6 * i + d] - g[d])); scale = Math.max(scale, Math.abs(g[d])); } }
    const res = [];
    for (const { el, nodes } of els) { const ug = new Float64Array(24); nodes.forEach((n, k) => ug.set(u.subarray(6 * n, 6 * n + 6), 6 * k)); res.push(...PL.plateGaussResultants(el, PL.toLocal(el, ug)), PL.plateResultants(el, PL.toLocal(el, ug), 0, 0)); }
    return { du: du / scale, res };
  };
  const mem = (p) => [1e-3 * (p[0] + p[1] / 2), 1e-3 * (p[1] + p[0] / 2), 0, 0, 0];
  const w = (p) => 1e-3 * (1 + p[0] + p[1] + p[0] ** 2 + p[0] * p[1] + p[1] ** 2) / 2;
  const bend = (p) => [0, 0, w(p), 1e-3 * (1 + p[0] + 2 * p[1]) / 2, -1e-3 * (1 + 2 * p[0] + p[1]) / 2];   // θx = w,y, θy = −w,x
  for (const tilt of [0, Math.PI / 6]) {
    const tag = tilt ? ' (turned 30°)' : '';
    const m1 = patch(mem, tilt);
    ok(m1.du < 1e-9, 'membrane patch: inner nodes exact' + tag, m1.du.toExponential(1));
    const sx = Math.max(...m1.res.map((r) => Math.abs(r[0] / t - 4000 / 3) / (4000 / 3))), sy = Math.max(...m1.res.map((r) => Math.abs(r[1] / t - 4000 / 3) / (4000 / 3))), sxy = Math.max(...m1.res.map((r) => Math.abs(r[2] / t - 400) / 400));
    ok(Math.max(sx, sy, sxy) < 1e-8, 'membrane patch: σx = σy = 1333, τxy = 400 at every Gauss point and centre' + tag, Math.max(sx, sy, sxy).toExponential(1));
    const b1 = patch(bend, tilt);
    ok(b1.du < 1e-8, 'bending patch: inner w, θ exact' + tag, b1.du.toExponential(1));
    const e = Math.max(...b1.res.map((r) => Math.max(rel(r[3], 1.111111e-7), rel(r[4], 1.111111e-7), rel(r[5], 0.333333e-7))));
    ok(e < 1e-5, 'bending patch: Mx = My = 1.111e-7, Mxy = 0.333e-7 everywhere' + tag, e.toExponential(1));
    const q = Math.max(...b1.res.map((r) => Math.abs(r[6]) + Math.abs(r[7])));
    ok(q < 1e-12, 'bending patch: no transverse shear (MITC4 ties it exactly)' + tag, q.toExponential(1));
  }
}

// ───────────────────────────────────────────────────────────── square plates vs Timoshenko
const E0 = 200000, NU = 0.3, G0 = E0 / (2 * (1 + NU));
function squarePlate(nx, a, t, bc, kind = 'q') {
  const nodes = [], plates = [], supports = [];
  const id = (i, j) => `n${i}_${j}`;
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nx; j++) nodes.push({ id: id(i, j), x: a * i / nx, y: a * j / nx, z: 0 });
  for (let i = 0; i < nx; i++) for (let j = 0; j < nx; j++) plates.push({ id: `p${i}_${j}`, nodes: [id(i, j), id(i + 1, j), id(i + 1, j + 1), id(i, j + 1)], t, material: 'm' });
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nx; j++) {
    const ex = i === 0 || i === nx, ey = j === 0 || j === nx;
    if (!ex && !ey) continue;
    // simply supported ("hard"): w and the rotation about the edge's normal held — w = 0 along the edge; clamped: both rotations
    const fix = bc === 'ss' ? [0, 0, 1, ex ? 1 : 0, ey ? 1 : 0, 0] : [0, 0, 1, 1, 1, 0];
    if (i === 0 && j === 0) { fix[0] = 1; fix[1] = 1; }
    if (i === nx && j === 0) fix[1] = 1;
    supports.push({ node: id(i, j), fix: fix.map(Boolean) });
  }
  const loads = kind === 'q' ? plates.map((p) => ({ type: 'area', plate: p.id, dir: 'Z', p: -0.01 })) : [{ type: 'node', node: id(nx / 2, nx / 2), F: [0, 0, -1000, 0, 0, 0] }];
  const { model, warnings } = clean({ nodes, materials: [{ id: 'm', E: E0, G: G0, rho: 0 }], supports, plates, cases: [{ id: 'c', loads }] });
  const sol = FS.solveFrame(model);
  const ix = FM.nodeIndex(model), R = sol.results?.['case:c'];
  const D = E0 * t ** 3 / (12 * (1 - NU * NU));
  const nodal = sol.ok ? PS.plateNodeResults(sol.prep, R) : null;
  const M = (i, j) => nodal.get(ix.get(id(i, j)))[0].values;
  return { sol, model, warnings, R, D, w: (i, j) => R.u[6 * ix.get(id(i, j)) + 2], M };
}
head('Square plates (Timoshenko & Woinowsky-Krieger 1959)');
{
  const a = 1000, q = 0.01;
  const ss = squarePlate(16, a, 10, 'ss');
  ok(ss.sol.ok && !ss.warnings.length, 'simply supported plate, 16 × 16 mesh, a/t = 100: solves');
  const cw = -ss.w(8, 8) * ss.D / (q * a ** 4), cm = ss.M(8, 8)[3] / (q * a * a);
  ok(rel(cw, 0.00406) < 0.005, 'SS, uniform load: centre w = 0.00406 qa⁴/D (Table 8) within 0.5 %', cw.toFixed(6) + ', ' + pct(cw, 0.00406));
  ok(rel(cm, 0.0479) < 0.01, 'SS, uniform load: centre Mx = 0.0479 qa² (Table 8) within 1 %', cm.toFixed(5) + ', ' + pct(cm, 0.0479));
  ok(rel(ss.M(8, 8)[4], ss.M(8, 8)[3]) < 1e-9, 'SS: Mx = My at the centre (symmetry)');
  ok(ss.M(8, 8)[3] > 0, 'sign: a slab sagging under gravity has Mx > 0 (bottom in tension)');
  eqm('SS plate', ss.sol);
  const reac = ss.R.reacted[2];
  ok(rel(reac, q * a * a) < 1e-9, 'SS: the edge reactions add up to q a² (consistent pressure loads)', (reac / 1000).toFixed(6) + ' kN');
  const thin = squarePlate(16, a, 1, 'ss');
  const tw = -thin.w(8, 8) * thin.D / (q * a ** 4);
  ok(rel(tw, 0.00406) < 0.005, 'SS, a/t = 1000: no shear locking (w within 0.5 % of Table 8)', tw.toFixed(6) + ', ' + pct(tw, 0.00406));
  const coarse = squarePlate(8, a, 10, 'ss');
  const c8 = -coarse.w(4, 4) * coarse.D / (q * a ** 4);
  ok(rel(c8, 0.00406) < 0.01 && Math.abs(c8 - 0.00406) > Math.abs(cw - 0.00406), 'SS: 8 × 8 within 1 %, and 16 × 16 closer (converging)', c8.toFixed(6) + ' → ' + cw.toFixed(6));
  const cl = squarePlate(16, a, 10, 'cl');
  const lw = -cl.w(8, 8) * cl.D / (q * a ** 4), lm = cl.M(8, 8)[3] / (q * a * a), le = cl.M(16, 8)[3] / (q * a * a);
  ok(rel(lw, 0.00126) < 0.01, 'clamped, uniform load: centre w = 0.00126 qa⁴/D (Table 35) within 1 %', lw.toFixed(6) + ', ' + pct(lw, 0.00126));
  ok(rel(lm, 0.0231) < 0.01, 'clamped: centre Mx = 0.0231 qa² (Table 35) within 1 %', lm.toFixed(5) + ', ' + pct(lm, 0.0231));
  // support moments converge slowly (about first order) with bilinear plates: 8 × 8 −36 %, 16 × 16 −16 %, 32 × 32 −7 %
  // (measured 2026-10-27, patch-recovered values); the test pins 16 × 16 and that refining closes in
  const cl8 = squarePlate(8, a, 10, 'cl'), le8 = cl8.M(8, 4)[3] / (q * a * a);
  ok(rel(le, -0.0513) < 0.2 && Math.abs(le + 0.0513) < 0.6 * Math.abs(le8 + 0.0513), 'clamped: Mx at the middle of an edge → −0.0513 qa² (Table 35): within 20 % at 16 × 16, error down by more than 40 % from 8 × 8 (refine at supports)', le8.toFixed(5) + ' → ' + le.toFixed(5) + ', ' + pct(le, -0.0513));
  eqm('clamped plate', cl.sol);
  const P = squarePlate(16, a, 10, 'ss', 'P');
  const pw = -P.w(8, 8) * P.D / (1000 * a * a);
  ok(rel(pw, 0.01160) < 0.005, 'SS, centre load: w = 0.01160 Pa²/D (Table 23) within 0.5 %', pw.toFixed(6) + ', ' + pct(pw, 0.0116));
}

// ───────────────────────────────────────────────────────────── a shear wall and a skew strip vs beam theory
head('Walls and strips vs Timoshenko beam theory');
{
  const json = { nodes: [], materials: [{ id: 'c', E: 30000, G: 12500, rho: 2400 }], supports: [], cases: [] };
  const b = 2000, H = 10000, t = 200, P = 1e5;
  const w = MS.wallPlates(json, { id: 'W', from: [0, 0], to: [b, 0], z0: 0, z1: H, t, material: 'c', size: 250 });
  ok(w.kind === 'grid' && w.plates.length === 8 * 40, 'wall 2 m × 10 m at 250 mm: 8 × 40 plates on a grid', w.plates.length + ' ' + w.kind);
  const base = json.nodes.filter((n) => Math.abs(n.z) < 1e-6), top = json.nodes.filter((n) => Math.abs(n.z - H) < 1e-6);
  json.supports = base.map((n) => ({ node: n.id, fix: [1, 1, 1, 1, 1, 1].map(Boolean) }));
  // the load spread over the top edge as consistent edge forces (ends half)
  json.cases = [{ id: 'c', loads: top.map((n) => ({ type: 'node', node: n.id, F: [P / 8 * (n.x === 0 || n.x === b ? 0.5 : 1), 0, 0, 0, 0, 0] })) }];
  const { model } = clean(json);
  const sol = FS.solveFrame(model);
  const ix = FM.nodeIndex(model);
  const ux = top.reduce((s, n) => s + sol.results['case:c'].u[6 * ix.get(n.id)], 0) / top.length;
  const I = t * b ** 3 / 12, A = t * b;
  const want = P * H ** 3 / (3 * 30000 * I) + P * H / (5 / 6 * 12500 * A);
  ok(sol.ok && rel(ux, want) < 0.02, 'shear wall: top drift = PH³/3EI + PH/κGA within 2 % (base held against Poisson: slightly stiffer)', ux.toFixed(4) + ' vs ' + want.toFixed(4) + ' mm, ' + pct(ux, want));
  eqm('shear wall', sol);
  const sw = FS.solveFrame(clean({ ...json, cases: [{ id: 'g', selfWeight: 1, loads: [] }] }).model);
  ok(rel(-sw.results['case:g'].applied[2], 2400e-9 * 9.80665 * b * H * t) < 1e-12, 'own weight of plates = ρ g t × area', (-sw.results['case:g'].applied[2] / 1000).toFixed(4) + ' kN');
  // a strip 2000 × 200 × 20 (ν = 0) as a cantilever in a skew plane: out-of-plane end load
  const L = 2000, bs = 200, ts = 20, Ps = 50;
  const dir = [Math.cos(0.4) * Math.cos(0.7), Math.sin(0.4) * Math.cos(0.7), Math.sin(0.7)];        // along the strip
  const across0 = [-Math.sin(0.4), Math.cos(0.4), 0];
  const nrm = [dir[1] * across0[2] - dir[2] * across0[1], dir[2] * across0[0] - dir[0] * across0[2], dir[0] * across0[1] - dir[1] * across0[0]];
  const n = 20, nodes = [], plates = [];
  for (let i = 0; i <= n; i++) for (let j = 0; j <= 2; j++) { const u = L * i / n, v = bs * j / 2 - bs / 2; nodes.push({ id: `s${i}_${j}`, x: 100 + u * dir[0] + v * across0[0], y: 50 + u * dir[1] + v * across0[1], z: 300 + u * dir[2] + v * across0[2] }); }
  for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) plates.push({ id: `q${i}_${j}`, nodes: [`s${i}_${j}`, `s${i + 1}_${j}`, `s${i + 1}_${j + 1}`, `s${i}_${j + 1}`], t: ts, material: 'p' });
  const strip = clean({ nodes, plates, materials: [{ id: 'p', E: 70000, G: 35000, rho: 0 }], supports: [0, 1, 2].map((j) => ({ node: `s0_${j}`, fix: [1, 1, 1, 1, 1, 1].map(Boolean) })),
    cases: [{ id: 'c', loads: [0, 1, 2].map((j) => ({ type: 'node', node: `s${n}_${j}`, F: nrm.map((x) => x * Ps * (j === 1 ? 0.5 : 0.25)).concat([0, 0, 0]) })) }] });
  const ss = FS.solveFrame(strip.model);
  const si = FM.nodeIndex(strip.model);
  const tip = [0, 1, 2].reduce((s, j) => { const u = ss.results['case:c'].u.subarray(6 * si.get(`s${n}_${j}`)); return s + u[0] * nrm[0] + u[1] * nrm[1] + u[2] * nrm[2]; }, 0) / 3;
  const Is = bs * ts ** 3 / 12, wantS = Ps * L ** 3 / (3 * 70000 * Is) + Ps * L / (5 / 6 * 35000 * bs * ts);
  ok(ss.ok && rel(tip, wantS) < 0.005, 'strip in a skew plane (ν = 0): tip deflection = PL³/3EI + PL/κGA within 0.5 % (plate axes and transformation)', tip.toFixed(4) + ' vs ' + wantS.toFixed(4) + ' mm, ' + pct(tip, wantS));
  eqm('skew strip', ss);
}

// ───────────────────────────────────────────────────────────── rigid diaphragms and drift
head('Rigid diaphragms (Wilson 2002, ch. 6) and storey drift');
const E = 200000, G = 77000, I = 1e8, J = 2e6, A = 1e4;
function tower(levels, h, loads, extra = {}) {
  const corners = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
  const nodes = [], members = [], supports = [];
  corners.forEach(([x, y], c) => {
    for (let k = 0; k <= levels; k++) nodes.push({ id: `c${c}_${k}`, x, y, z: k * h });
    for (let k = 0; k < levels; k++) members.push({ id: `m${c}_${k}`, i: `c${c}_${k}`, j: `c${c}_${k + 1}`, section: 'S', material: 's' });
    supports.push({ node: `c${c}_0`, fix: [1, 1, 1, 1, 1, 1].map(Boolean) });
  });
  const diaphragms = Array.from({ length: levels }, (_, k) => ({ id: `L${k + 1}`, name: `Level ${k + 1}`, z: (k + 1) * h }));
  return clean({ nodes, members, supports, materials: [{ id: 's', E, G, rho: 0 }], sections: [{ id: 'S', A, Iy: I, Iz: I, J }], diaphragms, cases: [{ id: 'c', loads }], ...extra });
}
{
  const h = 3500, F = 40000, k = 3 * E * I / h ** 3;
  const t1 = tower(1, h, [{ type: 'node', node: 'c0_1', F: [F, 0, 0, 0, 0, 0] }]);
  ok(t1.model.diaphragms?.[0].nodes.length === 4, 'diaphragm by height: the four column tops found at z = 3500');
  const sol = FS.solveFrame(t1.model);
  ok(sol.ok, 'one storey, load at a corner: solves');
  const R = sol.results['case:c'];
  const Mz = (4000 / 2) * F;                              // F at y = 0, master at y = 2000: Mz = −(y − ym) Fx
  const Kt = 4 * k * (3000 ** 2 + 2000 ** 2) + 4 * G * J / h;
  ok(rel(R.masters[0], F / (4 * k)) < 1e-9, 'master Ux = F / Σk, k = 3EI/h³ (cantilever columns)', R.masters[0].toFixed(6) + ' mm');
  ok(rel(R.masters[2], Mz / Kt) < 1e-9, 'master Rz = Mz / (Σ k r² + Σ GJ/h)', R.masters[2].toExponential(6));
  ok(Math.abs(R.masters[1]) < 1e-12 * R.masters[0], 'master Uy = 0 (load along X)');
  const ix = FM.nodeIndex(t1.model);
  const u2 = R.u.subarray(6 * ix.get('c2_1'));
  ok(rel(u2[0], R.masters[0] - (4000 - 2000) * R.masters[2]) < 1e-9 && rel(u2[1], (6000 - 3000) * R.masters[2]) < 1e-9 && rel(u2[5], R.masters[2]) < 1e-12, 'a slave node moves with the floor: ux = Ux − dy Rz, uy = Uy + dx Rz, rz = Rz');
  const tops = [0, 1, 2, 3].map((c) => R.u[6 * ix.get(`c${c}_1`) + 4]);
  ok(tops.every((r) => Math.abs(r) > 0), 'the floor leaves the column tops free to rotate out of plan (ry ≠ 0)');
  eqm('one-storey diaphragm', sol);
  const dr = PS.storyDrifts(sol.prep, R);
  ok(dr.length === 1 && rel(dr[0].dx, F / (4 * k)) < 1e-9 && rel(dr[0].ratioX, F / (4 * k) / h) < 1e-9, 'storey drift at the centre = Ux, ratio = drift / h', dr[0].dx.toFixed(4) + ' mm, ' + dr[0].ratioX.toExponential(3));
  const cornerMax = Math.max(...[0, 4000].map((y) => Math.abs(R.masters[0] - (y - 2000) * R.masters[2])));
  ok(rel(Math.abs(dr[0].maxX.value), cornerMax) < 1e-9, 'largest drift is at the edge torsion adds to', dr[0].maxX.node + ' ' + dr[0].maxX.value.toFixed(4) + ' mm');

  // two storeys, equal loads at every node of each floor (no twist): cantilever superposition
  const F1 = 30000, F2 = 50000;
  const t2 = tower(2, h, [0, 1, 2, 3].flatMap((c) => [{ type: 'node', node: `c${c}_1`, F: [F1 / 4, 0, 0, 0, 0, 0] }, { type: 'node', node: `c${c}_2`, F: [F2 / 4, 0, 0, 0, 0, 0] }]));
  const s2 = FS.solveFrame(t2.model), R2 = s2.results['case:c'];
  const d1 = (F1 / 4) * h ** 3 / (3 * E * I) + (F2 / 4) * h * h * (3 * 2 * h - h) / (6 * E * I);
  const d2 = (F1 / 4) * h * h * (3 * 2 * h - h) / (6 * E * I) + (F2 / 4) * (2 * h) ** 3 / (3 * E * I);
  const dd = PS.storyDrifts(s2.prep, R2);
  ok(rel(dd[0].dx, d1) < 1e-9 && rel(dd[1].dx, d2 - d1) < 1e-9, 'two storeys: drifts = cantilever superposition P x²(3a − x)/6EI', dd.map((d) => d.dx.toFixed(4)).join(', ') + ' mm');
  ok(dd[1].below === 'L1' && dd[0].below === null && dd[1].h === h, 'drifts listed lowest first, each with the floor below and the storey height');
  eqm('two-storey diaphragm', s2);

  // a portal whose beam lies in a floor vs the same portal with an axially rigid beam (no diaphragm)
  const portal = (dia, Abeam) => clean({
    nodes: [{ id: 'a', x: 0, y: 0, z: 0 }, { id: 'b', x: 0, y: 0, z: 3000 }, { id: 'c', x: 5000, y: 0, z: 3000 }, { id: 'd', x: 5000, y: 0, z: 0 }],
    members: [{ id: 'L', i: 'a', j: 'b', section: 'C', material: 's' }, { id: 'B', i: 'b', j: 'c', section: 'B', material: 's' }, { id: 'R', i: 'd', j: 'c', section: 'C', material: 's' }],
    sections: [{ id: 'C', A: 1e4, Iy: 1e8, Iz: 1e8, J: 1e6 }, { id: 'B', A: Abeam, Iy: 2e8, Iz: 1e8, J: 1e6 }], materials: [{ id: 's', E, G, rho: 0 }],
    supports: [{ node: 'a', fix: [1, 1, 1, 1, 1, 1].map(Boolean) }, { node: 'd', fix: [1, 1, 1, 1, 1, 1].map(Boolean) }],
    diaphragms: dia ? [{ id: 'F', nodes: ['b', 'c'] }] : [], cases: [{ id: 'c', loads: [{ type: 'node', node: 'b', F: [10000, 0, -20000, 0, 0, 0] }] }] }).model;
  const pa = FS.solveFrame(portal(true, 1e4)), pb = FS.solveFrame(portal(false, 1e12));
  const ua = pa.results['case:c'].u, ub = pb.results['case:c'].u;
  let worst = 0; for (let q = 0; q < ua.length; q++) worst = Math.max(worst, Math.abs(ua[q] - ub[q]));
  ok(worst < 1e-5 * Math.max(...ub.map(Math.abs)), 'portal with its beam in a floor = the portal with an axially rigid beam (EA ×10⁸)', 'largest difference ' + (worst / Math.max(...ub.map(Math.abs))).toExponential(1) + ' of the largest');
  ok(!('masters' in (FS.solveFrame(portal(false, 1e4)).results['case:c'])) && !portal(false, 1e4).diaphragms, 'a model without floors or plates takes the frame solver unchanged');

  // a floor on columns pinned at both ends: nothing holds it in plan → mechanism named with the floor
  const pinned = tower(1, h, [{ type: 'node', node: 'c0_1', F: [F, 0, 0, 0, 0, 0] }], {});
  pinned.model.members.forEach((m) => { m.rel = { i: [false, false, false, false, true, true], j: [false, false, false, true, true, true] }; });
  pinned.model.supports.forEach((s) => { s.fix = [true, true, true, false, false, false]; });
  const pm = FS.solveFrame(pinned.model);
  ok(!pm.ok && pm.error.code === 'mechanism' && pm.error.diaphragm === 'L1', 'a floor on pin-ended columns is refused as a mechanism and named', JSON.stringify(pm.error));
  const held = tower(1, h, [{ type: 'node', node: 'c0_1', F: [F, 0, 0, 0, 0, 0] }]);
  held.model.supports.push({ node: 'c3_1', fix: [true, false, false, false, false, false] });
  const hs = FS.solveFrame(held.model);
  ok(hs.ok && hs.warnings.some((w) => w.code === 'diaphragm-support' && w.node === 'c3_1'), 'a node held in plan is left out of its floor, with a warning');
  // combinations add up masters and plates
  const tc = tower(1, h, [{ type: 'node', node: 'c0_1', F: [F, 0, 0, 0, 0, 0] }], { combos: [{ id: 'k', factors: [{ case: 'c', f: 1.5 }] }] });
  const sc = FS.solveFrame(tc.model);
  ok(rel(sc.results['combo:k'].masters[0], 1.5 * sc.results['case:c'].masters[0]) < 1e-12, 'a combination scales the floor movement');
  const cb = FS.combine(sc.prep, [{ R: sc.results['case:c'], f: 2 }]);
  ok(rel(cb.masters[2], 2 * sc.results['case:c'].masters[2]) < 1e-12, 'combine() carries the floors (and plates) along');
}

// ───────────────────────────────────────────────────────────── a slab on columns, meshed
head('A slab meshed from its outline, on columns, as a floor');
{
  const json = { nodes: [], members: [], materials: [{ id: 'c', E: 30000, G: 12500, rho: 2500 }], sections: [{ id: 'col', A: 160000, Iy: 2.133e9, Iz: 2.133e9, J: 3.6e9 }], supports: [], cases: [], combos: [] };
  const cols = [[0, 0], [6000, 0], [6000, 6000], [0, 6000], [3000, 9000], [0, 9000]];
  cols.forEach(([x, y], k) => { json.nodes.push({ id: `b${k}`, x, y, z: 0 }, { id: `t${k}`, x, y, z: 3200 }); json.members.push({ id: `col${k}`, i: `b${k}`, j: `t${k}`, section: 'col', material: 'c' }); json.supports.push({ node: `b${k}`, fix: [1, 1, 1, 1, 1, 1].map(Boolean) }); });
  const L = [[0, 0], [6000, 0], [6000, 6000], [3000, 6000], [3000, 9000], [0, 9000]];
  const s = MS.slabPlates(json, { id: 'S1', outline: L, holes: [[[1000, 1000], [2000, 1000], [2000, 2500], [1000, 2500]]], z: 3200, t: 200, material: 'c', size: 500 });
  ok(s.kind === 'grid' && s.nodes > 0, 'L-shaped slab with an opening: a grid mesh', s.plates.length + ' plates, ' + s.nodes + ' new nodes');
  ok(cols.every((c, k) => s.nodeIds.includes(`t${k}`)), 'every column top is a slab node (found, not doubled)');
  json.diaphragms = [{ id: 'F1', z: 3200 }];
  json.cases = [{ id: 'D', kind: 'dead', selfWeight: 1, loads: [] }, { id: 'L', kind: 'live', loads: s.plates.map((p) => ({ type: 'area', plate: p, dir: 'Z', p: -0.003 })) }, { id: 'W', kind: 'wind', loads: [{ type: 'node', node: 't5', F: [20000, 0, 0, 0, 0, 0] }] }];
  json.combos = [{ id: 'U', factors: [{ case: 'D', f: 1.2 }, { case: 'L', f: 1.6 }] }];
  const { model, warnings } = clean(json);
  ok(!warnings.length && model.plates.length === s.plates.length, 'the model keeps every plate and the floor', warnings.map((w) => w.code).join(','));
  const sol = FS.solveFrame(model);
  ok(sol.ok, 'slab on columns solves (' + sol.dofs + ' unknowns)');
  const area = 6000 * 6000 + 3000 * 3000 - 1000 * 1500;
  ok(rel(-sol.results['case:L'].reacted[2] * -1, 0.003 * area) < 1e-9, 'live load: the column reactions add up to q × slab area (opening left out)', (sol.results['case:L'].reacted[2] / 1000).toFixed(3) + ' kN');
  ok(rel(-sol.results['case:D'].applied[2], 2500e-9 * 9.80665 * (200 * area + 160000 * 3200 * 6)) < 1e-9, 'own weight: slab ρ g t A + columns ρ g A L');
  eqm('slab on columns', sol);
  const sum = sol.results['combo:U'].plates, d = sol.results['case:D'].plates, l = sol.results['case:L'].plates;
  let worst = 0; for (let q = 0; q < sum.length; q++) worst = Math.max(worst, Math.abs(sum[q] - 1.2 * d[q] - 1.6 * l[q]));
  ok(worst < 1e-9 * Math.max(...sum.map(Math.abs)), 'combination plate results = 1.2 D + 1.6 L');
  const dr = PS.storyDrifts(sol.prep, sol.results['case:W']);
  ok(dr.length === 1 && dr[0].dx > 0 && dr[0].maxX.ratio >= dr[0].ratioX, 'wind on the floor: one storey drift, the edge at least the centre', dr[0].dx.toFixed(4) + ' / ' + dr[0].maxX.value.toFixed(4) + ' mm');
  const mid = sol.prep.shell.pl.findIndex((p) => p.el.ax.c[0] > 2900 && p.el.ax.c[0] < 3500 && p.el.ax.c[1] > 2900 && p.el.ax.c[1] < 3500);
  ok(mid >= 0 && PS.plateCentre(sol.prep, sol.results['case:L'], mid)[3] > 0, 'mid-panel of the slab sags (Mx > 0) under live load');
}

// ───────────────────────────────────────────────────────────── the mesher
head('Meshing outlines');
{
  const quadArea = (m) => m.quads.reduce((s, q) => { const P = q.map((i) => m.nodes[i]); let a = 0; for (let i = 0; i < 4; i++) a += P[i][0] * P[(i + 1) % 4][1] - P[(i + 1) % 4][0] * P[i][1]; return s + a / 2; }, 0);
  const conforming = (m, outline) => {
    const edges = new Map();
    for (const q of m.quads) for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4], k = Math.min(a, b) + ',' + Math.max(a, b); edges.set(k, (edges.get(k) || 0) + 1); }
    // every node that lies on another quad's edge must be a corner of it (no hanging nodes): count edge uses only 1 or 2
    return [...edges.values()].every((v) => v === 1 || v === 2);
  };
  const r = MS.meshOutline([[0, 0], [5000, 0], [5000, 3000], [0, 3000]], { size: 1000 });
  ok(r.kind === 'grid' && r.quads.length === 15 && rel(quadArea(r), 15e6) < 1e-12, 'rectangle 5 × 3 m at 1 m: 15 plates, area exact');
  const rp = MS.meshOutline([[0, 0], [5000, 0], [5000, 3000], [0, 3000]], { size: 1000, points: [[2500, 1500]] });
  ok(rp.nodes.some((p) => Math.hypot(p[0] - 2500, p[1] - 1500) < 1e-9), 'a column point lands on a node');
  ok(rp.quads.every((q) => { const P = q.map((i) => rp.nodes[i]); let a = 0; for (let i = 0; i < 4; i++) a += P[i][0] * P[(i + 1) % 4][1] - P[(i + 1) % 4][0] * P[i][1]; return a > 0; }), 'every plate counter-clockwise');
  const th = 0.5, rot = (p) => [Math.cos(th) * p[0] - Math.sin(th) * p[1], Math.sin(th) * p[0] + Math.cos(th) * p[1]];
  const rr = MS.meshOutline([[0, 0], [4000, 0], [4000, 2000], [0, 2000]].map(rot), { size: 1000, holes: [[[1000, 500], [2000, 500], [2000, 1500], [1000, 1500]].map(rot)] });
  ok(rr.kind === 'grid' && rel(quadArea(rr), 7e6) < 1e-9 && rr.quality.minAngle > 89.9999, 'a turned rectangle with an opening: grid along its own sides (square corners), area 8 − 1 m²');
  const tr = MS.meshOutline([[0, 0], [6000, 0], [5000, 3000], [1000, 3000]], { size: 1000 });
  ok(tr.kind === 'transfinite' && rel(quadArea(tr), 15e6) < 1e-12, 'trapezoid: transfinite mesh, area exact', tr.quads.length + ' plates');
  const pent = [[0, 0], [4000, 0], [5000, 2500], [2000, 4500], [-1000, 2500]];
  const pm = MS.meshOutline(pent, { size: 700 });
  const pa = Math.abs(pent.reduce((s, p, i) => s + p[0] * pent[(i + 1) % 5][1] - pent[(i + 1) % 5][0] * p[1], 0) / 2);
  ok(pm.kind === 'split' && rel(quadArea(pm), pa) < 1e-9 && conforming(pm) && pm.warnings.some((w) => w.code === 'mesh-irregular'), 'pentagon: split into quads, conforming, area exact, said as irregular', pm.quads.length + ' plates, min angle ' + pm.quality.minAngle.toFixed(1) + '°');
  const bad = (f) => { try { f(); return null; } catch (e) { return e.code; } };
  ok(bad(() => MS.meshOutline([[0, 0], [1, 0]], { size: 1 })) === 'mesh-outline' && bad(() => MS.meshOutline([[0, 0], [1, 0], [0, 1]], { size: 0 })) === 'mesh-size' && bad(() => MS.meshOutline(pent, { size: 100, holes: [[[0, 1], [1, 1], [1, 2]]] })) === 'mesh-holes', 'bad outlines, sizes and openings in a non-square outline refused');
  // a pentagon slab solves and balances (the irregular mesh is still a valid one)
  const json = { nodes: [], materials: [{ id: 'c', E: 30000, G: 12500, rho: 0 }], supports: [], cases: [] };
  const sp = MS.slabPlates(json, { id: 'P', outline: pent, z: 0, t: 200, material: 'c', size: 700 });
  json.supports = json.nodes.filter((n) => pent.some((c, i) => { const d = pent[(i + 1) % 5]; const cr = (d[0] - c[0]) * (n.y - c[1]) - (d[1] - c[1]) * (n.x - c[0]); return Math.abs(cr) / Math.hypot(d[0] - c[0], d[1] - c[1]) < 1e-6; })).map((n, k) => ({ node: n.id, fix: [k === 0, k < 2, true, false, false, false] }));
  json.cases = [{ id: 'c', loads: sp.plates.map((p) => ({ type: 'area', plate: p, dir: 'n', p: -0.005 })) }];
  const pl = FS.solveFrame(clean(json).model);
  ok(pl.ok, 'pentagon slab, simply supported along its edges, solves');
  if (pl.ok) eqm('pentagon slab', pl);
}

// ───────────────────────────────────────────────────────────── untrusted files, unchanged frames
head('Untrusted files');
{
  const nodes = [{ id: 'a', x: 0, y: 0, z: 0 }, { id: 'b', x: 1000, y: 0, z: 0 }, { id: 'c', x: 1000, y: 1000, z: 0 }, { id: 'd', x: 0, y: 1000, z: 0 }, { id: 'e', x: 500, y: 500, z: 0 }];
  const r = clean({ nodes, materials: [{ id: 'm', E: 1, G: 0.4 }], supports: [{ node: 'a', fix: [1, 1, 1, 1, 1, 1] }],
    plates: [{ id: 'p', nodes: ['a', 'b', 'c', 'd'], t: 10, material: 'm' }, { id: 'p', nodes: ['a', 'b', 'c', 'd'], t: 10, material: 'm' }, { id: 'q', nodes: ['a', 'b', 'c'], t: 10, material: 'm' },
      { id: 'r', nodes: ['a', 'b', 'e', 'd'], t: 10, material: 'm' }, { id: 's', nodes: ['a', 'c', 'b', 'd'], t: 10, material: 'm' }, { id: 't', nodes: ['a', 'b', 'c', 'zz'], t: 10, material: 'm' }, { id: 'u', nodes: ['a', 'b', 'c', 'd'], t: -1, material: 'm' }],
    diaphragms: [{ id: 'F', z: 0 }, { id: 'G', z: 0 }, { id: 'H' }],
    cases: [{ id: 'c', loads: [{ type: 'area', plate: 'p', dir: 'Z', p: -1 }, { type: 'area', plate: 'nope', dir: 'Z', p: -1 }, { type: 'area', plate: 'p', dir: 'Q', p: -1 }] }] });
  const codes = r.warnings.map((w) => w.code);
  ok(r.model.plates.length === 1 && codes.filter((c) => c === 'bad-plate').length === 3 && codes.includes('duplicate') && codes.filter((c) => c === 'plate-shape').length === 2, 'plates: duplicates, three corners, a corner bent in, a folded quad, an unknown node, a bad thickness dropped with warnings', codes.join(','));
  ok(r.model.diaphragms.length === 1 && codes.includes('diaphragm-shared') && codes.includes('bad-diaphragm'), 'diaphragms: a node in two floors, a floor with no nodes refused');
  ok(r.model.cases[0].loads.length === 1 && codes.filter((c) => c === 'bad-load').length === 2, 'area loads on an unknown plate or in an unknown direction dropped');
  const f = FM.cleanFrame({ format: 'cadcraft-frame', version: 1, nodes, materials: [{ id: 'm', E: 1, G: 0.4 }], sections: [{ id: 'S', A: 1, Iy: 1, Iz: 1, J: 1 }], members: [{ id: 'x', i: 'a', j: 'b', section: 'S', material: 'm' }], supports: [], cases: [{ id: 'c', loads: [{ type: 'area', plate: 'p', dir: 'Z', p: 1 }] }], plates: [], diaphragms: [] });
  ok(!('plates' in f.model) && !('diaphragms' in f.model) && f.warnings.some((w) => w.code === 'bad-load'), 'a frame-only file gets no plates/diaphragms keys; an area load there is a bad load as before');
  const pm = clean({ nodes, materials: [{ id: 'm', E: 1, G: 0.2 }], supports: [{ node: 'a', fix: [1, 1, 1, 1, 1, 1] }], plates: [{ id: 'p', nodes: ['a', 'b', 'c', 'd'], t: 10, material: 'm' }], cases: [{ id: 'c', loads: [] }] });
  const ps = FS.solveFrame(pm.model);
  ok(!ps.ok && ps.error.code === 'plate-material', 'a plate material with ν outside (−1, 0.5) refused (E = 1, G = 0.2 → ν = 1.5)');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

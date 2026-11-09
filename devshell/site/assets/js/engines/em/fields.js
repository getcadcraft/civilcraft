/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cc-em field solvers (0.8 XE.10), all from the textbook methods:
 *  - biotSavart / loops / mutualInductance: exact finite-segment Biot–Savart, Neumann integral, Maxwell's elliptic-integral formula for coaxial loops.
 *  - fem2d: linear-triangle finite elements for ∇·(k∇u) = −s in 2-D, used for magnetostatics (u = A_z, k = 1/μ, s = J + magnet term)
 *    and electrostatics (u = V, k = ε, s = ρ). Planar only (axisymmetric is not built). Dirichlet nodes, natural Neumann elsewhere.
 */
import { cgSolve } from './linalg.js';
export const MU0 = 4e-7 * Math.PI, EPS0 = 8.8541878128e-12;

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** B (tesla) at p from straight segments [{a:[x,y,z], b:[x,y,z], I}] (exact finite-segment formula). */
export function biotSavart(segs, p) {
  const B = [0, 0, 0];
  for (const s of segs) {
    const L = sub(s.b, s.a), l = Math.hypot(...L); if (l === 0) continue; const u = L.map((x) => x / l);
    const ap = sub(s.a, p), za = dot(ap, u), rho = [ap[0] - za * u[0], ap[1] - za * u[1], ap[2] - za * u[2]], d = Math.hypot(...rho);
    if (d < 1e-12 * Math.max(l, 1e-30)) continue; // on the wire: the field is not defined
    const zb = za + l, ph = cross(u, rho.map((x) => x / d)), f = MU0 * s.I / (4 * Math.PI * d) * (zb / Math.hypot(zb, d) - za / Math.hypot(za, d));
    B[0] += f * -ph[0]; B[1] += f * -ph[1]; B[2] += f * -ph[2]; // rho points from p to the foot, so the direction from the wire to p is -rho
  }
  return B;
}

/** A circular loop as n straight segments: centre c, radius r, unit normal nrm, current I (right-hand rule about nrm). */
export function circleLoop(c, r, nrm, I, n = 128) {
  const nl = Math.hypot(...nrm), z = nrm.map((x) => x / nl); const t = Math.abs(z[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const x = cross(t, z), xl = Math.hypot(...x), xu = x.map((v) => v / xl), yu = cross(z, xu), pts = [];
  for (let k = 0; k <= n; k++) { const a = 2 * Math.PI * k / n; pts.push([0, 1, 2].map((i) => c[i] + r * (Math.cos(a) * xu[i] + Math.sin(a) * yu[i]))); }
  return pts.slice(1).map((b, k) => ({ a: pts[k], b, I }));
}

/** Neumann mutual inductance M = μ0/4π ∮∮ dl1·dl2/R of two loops given as segment lists (current values ignored). Midpoint rule per segment pair, sub-sampled. */
export function mutualInductance(l1, l2, sub_ = 4) {
  let sum = 0;
  const pts = (s) => { const out = [], d = sub(s.b, s.a); for (let k = 0; k < sub_; k++) out.push({ r: [0, 1, 2].map((i) => s.a[i] + d[i] * (k + 0.5) / sub_), dl: d.map((v) => v / sub_) }); return out; };
  const P2 = l2.flatMap(pts);
  for (const s of l1) for (const p of pts(s)) for (const q of P2) { const R = Math.hypot(...sub(p.r, q.r)); if (R < 1e-15) continue; sum += dot(p.dl, q.dl) / R; }
  return MU0 / (4 * Math.PI) * sum;
}

export function agmKE(k) { // complete elliptic integrals K(k), E(k) by the arithmetic–geometric mean
  let a = 1, b = Math.sqrt(1 - k * k), c = k, sumE = 0.5 * c * c, p = 0.5;
  for (let i = 0; i < 30 && Math.abs(c) > 1e-16; i++) { const an = (a + b) / 2, cn = (a - b) / 2; b = Math.sqrt(a * b); a = an; c = cn; p *= 2; sumE += p * c * c; }
  const K = Math.PI / (2 * a); return { K, E: K * (1 - sumE) };
}
/** Maxwell's exact mutual inductance of two coaxial circular loops (radii r1, r2, axial gap d). */
export function coaxialLoopsM(r1, r2, d) {
  const k2 = 4 * r1 * r2 / ((r1 + r2) ** 2 + d * d), k = Math.sqrt(k2), { K, E } = agmKE(k);
  return MU0 * Math.sqrt(r1 * r2) * ((2 / k - k) * K - 2 / k * E);
}

// ---- meshes -------------------------------------------------------------------------------------------------------------
/** Structured triangle mesh of [x0,x1]×[y0,y1] with nx×ny cells (each split into two triangles). */
export function gridMesh(x0, x1, y0, y1, nx, ny) {
  const nodes = []; for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) nodes.push([x0 + (x1 - x0) * i / nx, y0 + (y1 - y0) * j / ny]);
  const tris = [], id = (i, j) => j * (nx + 1) + i;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { tris.push([id(i, j), id(i + 1, j), id(i + 1, j + 1)], [id(i, j), id(i + 1, j + 1), id(i, j + 1)]); }
  return { nodes, tris };
}
/** Polar mesh of the annulus r0..r1 (r0 may be 0 for a disk: the centre is one node). nr radial × nth angular cells; radii follow `grade` (1 = uniform, >1 packs towards r0). */
export function annulusMesh(r0, r1, nr, nth, grade = 1) {
  const nodes = [], tris = [], rad = (i) => r0 + (r1 - r0) * Math.pow(i / nr, grade);
  const disk = r0 === 0; if (disk) nodes.push([0, 0]);
  const ring = (i) => (disk ? 1 + (i - 1) * nth : i * nth);
  for (let i = disk ? 1 : 0; i <= nr; i++) for (let k = 0; k < nth; k++) { const a = 2 * Math.PI * k / nth; nodes.push([rad(i) * Math.cos(a), rad(i) * Math.sin(a)]); }
  for (let k = 0; k < nth; k++) {
    const k1 = (k + 1) % nth;
    if (disk) tris.push([0, ring(1) + k, ring(1) + k1]);
    for (let i = disk ? 1 : 0; i < nr; i++) { const a = ring(i) + k, b = ring(i) + k1, c = ring(i + 1) + k1, d = ring(i + 1) + k; tris.push([a, d, c], [a, c, b]); }
  }
  return { nodes, tris };
}
/** Nodes within tol of the boundary of the mesh's bounding box or of a circle (for Dirichlet sets). */
export const nodesWhere = (mesh, f) => mesh.nodes.map((p, i) => (f(p[0], p[1]) ? i : -1)).filter((i) => i >= 0);

// ---- 2-D FEM ------------------------------------------------------------------------------------------------------------
const area2 = (n, t) => { const [a, b, c] = t.map((i) => n[i]); return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]); };

/**
 * Solve ∇·(k ∇u) = −s on a triangle mesh. mesh {nodes, tris}; k (number | per-triangle array); s (number | per-triangle array of source per area);
 * fixed: Map or object node → value; extra: optional per-triangle [gx, gy] adds ∫ (gx ∂w/∂x + gy ∂w/∂y) to the right side (magnets).
 * Returns {u, grad (per tri [ux, uy]), area (per tri), problems}.
 */
export function fem2d(mesh, { k = 1, s = 0, fixed = new Map(), extra = null, tol = 1e-11 } = {}) {
  const { nodes, tris } = mesh, n = nodes.length, rows = Array.from({ length: n }, () => new Map()), b = new Float64Array(n), problems = [];
  const fx = fixed instanceof Map ? fixed : new Map(Object.entries(fixed).map(([a, v]) => [+a, v]));
  const kk = (e) => (Array.isArray(k) ? k[e] : k), ss = (e) => (Array.isArray(s) ? s[e] : s), area = new Float64Array(tris.length), grad = [];
  if (!fx.size) problems.push({ id: 'em:fem.no-boundary', severity: 'error', message: 'No node has a fixed value; the problem has no reference.', source: { kind: 'engine', engine: 'em' } });
  tris.forEach((t, e) => {
    const [p, q, r] = t.map((i) => nodes[i]), A2 = area2(nodes, t); if (Math.abs(A2) < 1e-300) { problems.push({ id: 'em:fem.degenerate', severity: 'error', message: 'Triangle ' + e + ' has no area.', source: { kind: 'engine', engine: 'em' } }); area[e] = 0; return; }
    area[e] = Math.abs(A2) / 2;
    const bx = [q[1] - r[1], r[1] - p[1], p[1] - q[1]].map((v) => v / A2), by = [r[0] - q[0], p[0] - r[0], q[0] - p[0]].map((v) => v / A2), ke = kk(e), se = ss(e);
    for (let i = 0; i < 3; i++) {
      b[t[i]] += se * area[e] / 3;
      if (extra) b[t[i]] += (extra[e][0] * bx[i] + extra[e][1] * by[i]) * area[e];
      for (let j = 0; j < 3; j++) { const v = ke * (bx[i] * bx[j] + by[i] * by[j]) * area[e], r_ = rows[t[i]]; r_.set(t[j], (r_.get(t[j]) || 0) + v); }
    }
  });
  if (problems.some((p) => p.severity === 'error')) return { ok: false, problems };
  // eliminate fixed nodes
  const x = new Float64Array(n); for (const [i, v] of fx) x[i] = v;
  for (let i = 0; i < n; i++) if (!fx.has(i)) for (const [j, v] of rows[i]) if (fx.has(j)) b[i] -= v * x[j];
  const free = [], pos = new Int32Array(n).fill(-1); for (let i = 0; i < n; i++) if (!fx.has(i)) { pos[i] = free.length; free.push(i); }
  const R = free.map((i) => { const out = []; for (const [j, v] of rows[i]) if (pos[j] >= 0) out.push([pos[j], v]); return out; });
  const res = cgSolve(R, free.map((i) => b[i]), { tol, maxIter: 40000 });
  if (!res.ok) problems.push({ id: 'em:fem.no-convergence', severity: 'error', message: 'The field solve did not converge in ' + res.iterations + ' iterations.', source: { kind: 'engine', engine: 'em' } });
  free.forEach((i, m) => { x[i] = res.x[m]; });
  tris.forEach((t, e) => { const [p, q, r] = t.map((i) => nodes[i]), A2 = area2(nodes, t), bx = [q[1] - r[1], r[1] - p[1], p[1] - q[1]], by = [r[0] - q[0], p[0] - r[0], q[0] - p[0]]; grad.push([(bx[0] * x[t[0]] + bx[1] * x[t[1]] + bx[2] * x[t[2]]) / A2, (by[0] * x[t[0]] + by[1] * x[t[1]] + by[2] * x[t[2]]) / A2]); });
  return { ok: !problems.some((p) => p.severity === 'error'), u: x, grad, area, iterations: res.iterations, problems };
}

/**
 * Magnetostatics, planar (per metre of depth). regions per triangle: nu = 1/μ (number | array), J (A/m², +z), M ([Mx,My] A/m per triangle or null).
 * Boundary: A = 0 on `fixed` nodes (outer boundary far enough away). Optional nonlinear iron: nuOf(B²) per triangle in `iron` (array of booleans).
 * Returns {A, B (per tri [Bx,By]), energy (J/m), ...}.
 */
export function magnetostatic2d(mesh, { nu, J = 0, M = null, fixed, nuOf = null, iron = null, relax = 0.5, maxIter = 200, tolNu = 1e-3 } = {}) {
  const nT = mesh.tris.length, nuA = Array.from({ length: nT }, (_, e) => (Array.isArray(nu) ? nu[e] : nu));
  const Jv = Array.from({ length: nT }, (_, e) => (Array.isArray(J) ? J[e] : J));
  // magnet weak form: ∫ν μ0 (Mx ∂w/∂y − My ∂w/∂x) = ∫ (gx ∂w/∂x + gy ∂w/∂y). The magnet's ν stays its own when iron iterates.
  let r, its = 0, worst = Infinity, prev = Infinity, rl = relax, converged = !nuOf;
  for (; its < (nuOf ? maxIter : 1); its++) {
    r = fem2d(mesh, { k: nuA, s: Jv, fixed, extra: M ? M.map((m, e) => (m ? [nuA[e] * MU0 * -m[1], nuA[e] * MU0 * m[0]] : [0, 0])) : null });
    if (!r.ok || !nuOf) break;
    worst = 0; const target = new Float64Array(nT);
    for (let e = 0; e < nT; e++) if (iron ? iron[e] : true) { target[e] = nuOf(r.grad[e][0] ** 2 + r.grad[e][1] ** 2); worst = Math.max(worst, Math.abs(target[e] - nuA[e]) / nuA[e]); }
    if (worst < tolNu) { converged = true; break; }
    if (worst > prev) rl = Math.max(0.02, rl / 2); // the iteration is oscillating: damp harder (geometric blend of old and target reluctivity)
    prev = worst;
    for (let e = 0; e < nT; e++) if (iron ? iron[e] : true) nuA[e] = Math.exp((1 - rl) * Math.log(nuA[e]) + rl * Math.log(target[e]));
  }
  if (!r.ok) return r;
  if (nuOf && !converged) r.problems.push({ id: 'em:magnet.no-convergence', severity: 'warning', message: 'The saturating-iron iteration stopped after ' + its + ' steps with the reluctivity still moving by ' + (worst * 100).toFixed(1) + ' %.', source: { kind: 'engine', engine: 'em' }, fix: 'A smaller current or a smoother B–H curve.' });
  const B = r.grad.map((g) => [g[1], -g[0]]); let W = 0;
  for (let e = 0; e < nT; e++) { const B2 = B[e][0] ** 2 + B[e][1] ** 2; W += 0.5 * nuA[e] * B2 * r.area[e]; }
  return { ...r, A: r.u, B, nu: nuA, energy: W, outerIterations: its + 1, converged };
}

/** Electrostatics: eps per triangle (absolute permittivity), rho (C/m³), fixed potentials. Returns {V, E, energy (J/m)}. */
export function electrostatic2d(mesh, { eps = EPS0, rho = 0, fixed } = {}) {
  const r = fem2d(mesh, { k: eps, s: rho, fixed }); if (!r.ok) return r;
  const E = r.grad.map((g) => [-g[0], -g[1]]); let W = 0;
  E.forEach((v, e) => { W += 0.5 * (Array.isArray(eps) ? eps[e] : eps) * (v[0] ** 2 + v[1] ** 2) * r.area[e]; });
  return { ...r, V: r.u, E, energy: W };
}

/** Capacitance per metre from stored energy at potential difference dV: C = 2W/dV². */
export const capacitanceFromEnergy = (W, dV) => 2 * W / (dV * dV);

/**
 * Force per metre (N/m) on the body made of triangles `inside` (Set of triangle indices) from the Maxwell stress on the edges that
 * separate it from the rest, using the mean of the two neighbouring triangles' B. Reliable only with the surface in air, away from sharp corners.
 */
export function maxwellForce(mesh, B, inside, mu = MU0) {
  const edges = new Map(), key = (a, b) => (a < b ? a + ':' + b : b + ':' + a);
  mesh.tris.forEach((t, e) => { for (let k = 0; k < 3; k++) { const a = t[k], c = t[(k + 1) % 3], kk = key(a, c); if (!edges.has(kk)) edges.set(kk, []); edges.get(kk).push({ e, a, c }); } });
  let Fx = 0, Fy = 0;
  for (const list of edges.values()) {
    if (list.length !== 2) continue; const [p, q] = list; if (inside.has(p.e) === inside.has(q.e)) continue;
    const inn = inside.has(p.e) ? p : q, a = mesh.nodes[inn.a], c = mesh.nodes[inn.c], dx = c[0] - a[0], dy = c[1] - a[1], len = Math.hypot(dx, dy);
    let nx = dy / len, ny = -dx / len; // outward from the body: check against centroid of the inside triangle
    const cen = mesh.tris[inn.e].reduce((s, i) => [s[0] + mesh.nodes[i][0] / 3, s[1] + mesh.nodes[i][1] / 3], [0, 0]);
    if ((cen[0] - a[0]) * nx + (cen[1] - a[1]) * ny > 0) { nx = -nx; ny = -ny; }
    const Bx = (B[p.e][0] + B[q.e][0]) / 2, By = (B[p.e][1] + B[q.e][1]) / 2, Bn = Bx * nx + By * ny, B2 = Bx * Bx + By * By;
    Fx += (Bn * Bx - 0.5 * B2 * nx) * len / mu; Fy += (Bn * By - 0.5 * B2 * ny) * len / mu;
  }
  return [Fx, Fy];
}

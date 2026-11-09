/* SPDX-License-Identifier: Apache-2.0 */
/**
 * solid-study.js — one linear solid study end to end on a quadratic-tetrahedron mesh (0.9 SU.908c, the Solid FEM add-on). DOM-free; imports
 * model.js (assembly, PCG solve, modal) and tet10.js (the element) of this folder: the one finite element library, not a second solver.
 * An analysis aid, not a code check; your engineer reviews the results. Small displacements, linear elastic, isotropic; no contact, no plasticity.
 *
 *   mesh = { nodes: Float64Array(3n) mm, tets10: Int32Array(10m) (tet10.js node order), btri6: Int32Array(6k) boundary triangles (corners,
 *            then midsides 01 12 20; outward by the right-hand rule), bface: Int32Array(k) host face index of each }
 *   job  = { mesh, material: { E MPa, nu, rho kg/m³, yield MPa | null }, kind: 'static' | 'modal', modes,
 *            supports: [{ id, faces: [face index] }]              all three directions held on those faces' nodes
 *            loads: [{ id, type: 'force', faces, F: [Fx, Fy, Fz] N total, spread evenly over the faces' area }
 *                    | { id, type: 'pressure', faces, p MPa (positive pushes into the body) } | { id, type: 'gravity', g: [gx, gy, gz] m/s² }],
 *            tol }
 *   solveSolid(job) → { ok, kind, summary, disp (3n, mm), dispMag, vm (n, nodal mean of the element stress tensors), maxDisp, maxVm,
 *                       maxVmRaw (largest unsmoothed value at an element node), reactions { perSupport, total, applied, balance },
 *                       freqHz, modeShapes (3n each, largest displacement 1), warnings [{ code, severity, vars }], note }
 *   bandBodies(mesh, values, disp, opts) → display bodies cut into colour bands (PartCraft api.model.addBodies shape)
 */
import { build, solveStatic, modal } from './model.js';
import { tetStress, tetVolume, vonMises } from './tet10.js';
import { jacobiEig } from './linalg.js';

export const NOTE = 'Not a code check; your engineer reviews the results.';
const EDGE = [[0, 1], [1, 2], [0, 2], [0, 3], [1, 3], [2, 3]];
const T6 = [[0.445948490915965, 0.445948490915965, 0.223381589678011], [0.445948490915965, 0.10810301816807, 0.223381589678011], [0.10810301816807, 0.445948490915965, 0.223381589678011],
  [0.091576213509771, 0.091576213509771, 0.109951743655322], [0.091576213509771, 0.816847572980459, 0.109951743655322], [0.816847572980459, 0.091576213509771, 0.109951743655322]];
export const LIMITS = { elements: 5000 };   // in the page; larger meshes are for a workstation (community row SU.908c-HAND)

/** Quadratic-triangle shapes on (a, b, c = 1 − a − b), corners 0 1 2 then mids 01 12 20 (the order of btri6). */
function tri6(a, b) {
  const c = 1 - a - b;
  return { N: [a * (2 * a - 1), b * (2 * b - 1), c * (2 * c - 1), 4 * a * b, 4 * b * c, 4 * c * a],
    da: [4 * a - 1, 0, -(4 * c - 1), 4 * b, -4 * b, 4 * (c - a)], db: [0, 4 * b - 1, -(4 * c - 1), 4 * a, 4 * (c - b), -4 * a] };
}
const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];

/** +1 when the boundary triangles are outward by the right-hand rule (signed volume of the closed boundary > 0), else −1. */
export function boundarySign(mesh) {
  const X = mesh.nodes, B = mesh.btri6;
  let v = 0;
  for (let t = 0; t < B.length / 6; t++) {
    const a = [0, 1, 2].map((c) => X[3 * B[6 * t] + c]), b = [0, 1, 2].map((c) => X[3 * B[6 * t + 1] + c]), c = [0, 1, 2].map((q) => X[3 * B[6 * t + 2] + q]), n = cross(b, c);
    v += (a[0] * n[0] + a[1] * n[1] + a[2] * n[2]) / 6;
  }
  return v >= 0 ? 1 : -1;
}
/** Triangle indices (into btri6) whose host face is in `faces`. */
export function trisOf(mesh, faces) { const want = new Set(faces), out = []; for (let t = 0; t < mesh.bface.length; t++) if (want.has(mesh.bface[t])) out.push(t); return out; }
/** Every node (corners and midsides) of those triangles. */
export function nodesOf(mesh, tris) { const s = new Set(); for (const t of tris) for (let k = 0; k < 6; k++) s.add(mesh.btri6[6 * t + k]); return [...s]; }
/** Visit the quadrature points of triangle t: fn(N[6], areaVector (outward, |.| = area element), weight) → sum of w·|n|·½ is the area. */
function faceIntegrate(mesh, sign, t, fn) {
  const v = mesh.btri6.subarray(6 * t, 6 * t + 6), X = mesh.nodes;
  for (const [a, b, w] of T6) {
    const s = tri6(a, b), tu = [0, 0, 0], tv = [0, 0, 0];
    for (let k = 0; k < 6; k++) for (let d = 0; d < 3; d++) { tu[d] += s.da[k] * X[3 * v[k] + d]; tv[d] += s.db[k] * X[3 * v[k] + d]; }
    const n = cross(tu, tv).map((x) => x * sign);
    fn(s.N, n, w * 0.5, v);
  }
}
export function areaOf(mesh, tris, sign = boundarySign(mesh)) { let A = 0; for (const t of tris) faceIntegrate(mesh, sign, t, (N, n, w) => { A += Math.hypot(...n) * w; }); return A; }

/** Nodal forces (Float64Array 3n) of a traction field over triangles: traction(unitOutwardNormal) → [tx, ty, tz] N/mm². */
export function tractionForces(mesh, tris, traction, F = new Float64Array(mesh.nodes.length), sign = boundarySign(mesh)) {
  for (const t of tris) faceIntegrate(mesh, sign, t, (N, n, w, v) => {
    const l = Math.hypot(...n) || 1, tr = traction([n[0] / l, n[1] / l, n[2] / l]);
    for (let k = 0; k < 6; k++) for (let d = 0; d < 3; d++) F[3 * v[k] + d] += N[k] * tr[d] * l * w;
  });
  return F;
}

/** The six rigid-body motions against the held dofs: the free ones in words (null = the body is held). */
export function rigidCheck(mesh, held) {   // held: [[node, dof]]
  const X = mesh.nodes, nn = X.length / 3, c = [0, 0, 0];
  for (let i = 0; i < nn; i++) for (let d = 0; d < 3; d++) c[d] += X[3 * i + d] / nn;
  let size = 0; for (let i = 0; i < nn; i++) size = Math.max(size, Math.hypot(X[3 * i] - c[0], X[3 * i + 1] - c[1], X[3 * i + 2] - c[2]));
  size = size || 1;
  const G = new Float64Array(36);
  for (const [n, d] of held) {
    const p = [0, 1, 2].map((q) => (X[3 * n + q] - c[q]) / size);
    {
      const r = [0, 0, 0, 0, 0, 0]; r[d] = 1;
      for (let k = 0; k < 3; k++) { const e = [0, 0, 0]; e[k] = 1; r[3 + k] = cross(e, p)[d]; }
      for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) G[6 * i + j] += r[i] * r[j];
    }
  }
  const eg = jacobiEig(G, 6), top = Math.max(...eg.values, 0);
  const free = eg.values.filter((v) => !(v > 1e-9 * Math.max(top, 1e-30))).length;
  return free ? free : null;
}

const sum3 = (a) => [0, 0, 0].map((_, d) => { let s = 0; for (let i = d; i < a.length; i += 3) s += a[i]; return s; });
const nrm = (v) => Math.hypot(v[0], v[1], v[2]);

export function solveSolid(job) {
  const t0 = Date.now(), { mesh } = job, mat = job.material;
  const nn = mesh.nodes.length / 3, ne = mesh.tets10.length / 10, warnings = [];
  const warn = (code, severity, vars = {}) => warnings.push({ code, severity, vars });
  const out = { ok: false, kind: job.kind === 'modal' ? 'modal' : 'static', note: NOTE, warnings };
  if (!ne) { warn('no_mesh', 'error'); return out; }
  if (ne > LIMITS.elements) { warn('too_many', 'error', { n: ne, max: LIMITS.elements }); return out; }
  // mesh health: volume of every element
  let vol = 0, bad = 0;
  const X30 = new Float64Array(30);
  for (let e = 0; e < ne; e++) {
    for (let a = 0; a < 10; a++) for (let d = 0; d < 3; d++) X30[3 * a + d] = mesh.nodes[3 * mesh.tets10[10 * e + a] + d];
    const v = tetVolume(X30); vol += v; if (!(v > 0)) bad++;
  }
  if (bad) { warn('bad_elements', 'error', { n: bad }); return out; }
  const sign = boundarySign(mesh);
  const rho = mat.rho || 0, E = mat.E, nu = mat.nu;
  const summary = { elements: ne, nodes: nn, dofs: 3 * nn, volume: vol, mass: vol * rho * 1e-9 };   // mm³ × kg/m³ → kg
  out.summary = summary;

  // supports
  const claimed = new Map(), heldDofs = new Map();   // claimed: node*3+dof -> support id (reactions go to the first one that holds it)
  for (const s of job.supports || []) {
    const tris = trisOf(mesh, s.faces || []);
    if (!tris.length) { warn('support_no_faces', 'error', { id: s.id }); return out; }
    for (const n of nodesOf(mesh, tris)) for (const d of s.dofs || [0, 1, 2]) if (!claimed.has(3 * n + d)) { claimed.set(3 * n + d, s.id); (heldDofs.get(n) || heldDofs.set(n, []).get(n)).push(d); }
  }
  if (!claimed.size) { warn('no_support', 'error'); return out; }
  const free = rigidCheck(mesh, [...claimed.keys()].map((k) => [Math.floor(k / 3), k % 3]));
  if (free) { warn('under_held', 'error', { n: free }); return out; }

  // loads
  const nodal = [], F3 = new Float64Array(3 * nn);
  let gravity = null;
  for (const l of job.loads || []) {
    if (l.type === 'gravity') { gravity = [...(gravity || [0, 0, 0])].map((v, d) => v + l.g[d]); continue; }
    const tris = trisOf(mesh, l.faces || []);
    if (!tris.length) { warn('load_no_faces', 'error', { id: l.id }); return out; }
    if (l.type === 'force') {
      const A = areaOf(mesh, tris, sign), tr = l.F.map((f) => f / A);
      tractionForces(mesh, tris, () => tr, F3, sign);
    } else tractionForces(mesh, tris, (n) => n.map((x) => -x * l.p), F3, sign);
  }
  for (let n = 0; n < nn; n++) if (F3[3 * n] || F3[3 * n + 1] || F3[3 * n + 2]) nodal.push({ node: n, F: [F3[3 * n], F3[3 * n + 1], F3[3 * n + 2], 0, 0, 0] });
  if (!nodal.length && !gravity && out.kind === 'static') warn('no_load', 'warn');
  if (gravity && !rho) warn('gravity_no_density', 'warn');

  const nodes = Array.from({ length: nn }, (_, i) => [mesh.nodes[3 * i], mesh.nodes[3 * i + 1], mesh.nodes[3 * i + 2]]);
  const solids = Array.from({ length: ne }, (_, e) => ({ n: Array.from(mesh.tets10.subarray(10 * e, 10 * e + 10)), E, nu, rho }));
  const model = { nodes, solids, fix: [...heldDofs].map(([node, dofs]) => ({ node, dofs })) };
  const sys = build(model, { mass: out.kind === 'modal' || (gravity && rho) });
  let sol = null, full = null;
  if (out.kind === 'modal') {
    if (!rho) { warn('modal_no_density', 'error'); return out; }
    const md = modal(sys, Math.min(job.modes || 4, 12));
    out.freqHz = md.freqHz; out.modeShapes = md.modes.map((f) => {
      const u = new Float64Array(3 * nn); let m = 0;
      for (let n = 0; n < nn; n++) for (let d = 0; d < 3; d++) { u[3 * n + d] = f[6 * n + d]; }
      for (let n = 0; n < nn; n++) m = Math.max(m, Math.hypot(u[3 * n], u[3 * n + 1], u[3 * n + 2]));
      return m ? u.map((v) => v / m) : u;
    });
    out.ok = md.ok; out.iterations = md.iter;
    if (!md.ok) warn('modal_not_converged', 'warn');
    full = null;
  } else {
    sol = solveStatic(sys, { nodal, gravity: gravity || undefined }, { tol: job.tol || 1e-10 });
    full = sol.full; out.ok = !!sol.ok; out.iterations = sol.iter; out.residual = sol.rel;
    if (!sol.ok) { warn('not_converged', 'error', { res: sol.rel }); }
  }
  out.ms = Date.now() - t0;
  if (!full) { out.disp = null; return finishNotes(out, job, nn); }

  const disp = new Float64Array(3 * nn), dmag = new Float64Array(nn);
  let maxDisp = 0;
  for (let n = 0; n < nn; n++) { for (let d = 0; d < 3; d++) disp[3 * n + d] = full[6 * n + d]; dmag[n] = nrm([disp[3 * n], disp[3 * n + 1], disp[3 * n + 2]]); if (dmag[n] > maxDisp) maxDisp = dmag[n]; }
  // stress: at each element's ten nodes, tensors averaged over the elements that share a node
  const acc = new Float64Array(6 * nn), cnt = new Float64Array(nn), u30 = new Float64Array(30);
  let maxRaw = 0;
  for (let e = 0; e < ne; e++) {
    for (let a = 0; a < 10; a++) { const nd = mesh.tets10[10 * e + a]; for (let d = 0; d < 3; d++) { X30[3 * a + d] = mesh.nodes[3 * nd + d]; u30[3 * a + d] = disp[3 * nd + d]; } }
    for (let a = 0; a < 10; a++) {
      const L = [0, 0, 0, 0];
      if (a < 4) L[a] = 1; else { const [i, j] = EDGE[a - 4]; L[i] = 0.5; L[j] = 0.5; }
      const s = tetStress(X30, u30, E, nu, L), nd = mesh.tets10[10 * e + a];
      maxRaw = Math.max(maxRaw, vonMises(s));
      for (let c = 0; c < 6; c++) acc[6 * nd + c] += s[c];
      cnt[nd]++;
    }
  }
  const vm = new Float64Array(nn);
  let maxVm = 0;
  for (let n = 0; n < nn; n++) if (cnt[n]) { vm[n] = vonMises(Array.from(acc.subarray(6 * n, 6 * n + 6), (v) => v / cnt[n])); if (vm[n] > maxVm) maxVm = vm[n]; }
  Object.assign(out, { disp, dispMag: dmag, vm, maxDisp, maxVm, maxVmRaw: maxRaw });

  // reactions per support, applied load, balance
  const R = sol.reactions, perSupport = new Map();
  for (const s of job.supports) perSupport.set(s.id, [0, 0, 0]);
  for (const [k, id] of claimed) { const n = Math.floor(k / 3), d = k % 3; perSupport.get(id)[d] += R[6 * n + d]; }
  const totalR = [0, 0, 0].map((_, d) => [...perSupport.values()].reduce((s, r) => s + r[d], 0));
  const applied = sum3(sol.F.filter((_, i) => i % 6 < 3).map((v) => v));
  const bal = nrm([0, 1, 2].map((d) => totalR[d] + applied[d])) / Math.max(nrm(applied), nrm(totalR), 1e-30);
  out.reactions = { perSupport: [...perSupport].map(([id, F]) => ({ id, F, mag: nrm(F) })), total: totalR, applied, balance: bal };
  if (nrm(applied) > 0 && bal > 1e-6) warn('unbalanced', 'warn', { rel: bal });
  return finishNotes(out, job, nn);
}

function finishNotes(out, job, nn) {
  const { warnings } = out, warn = (code, severity, vars = {}) => warnings.push({ code, severity, vars });
  const mat = job.material, s = out.summary;
  if (s.elements < 200) warn('coarse', 'warn', { n: s.elements });
  if (out.disp) {
    const bb = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
    for (let n = 0; n < nn; n++) for (let d = 0; d < 3; d++) { const x = job.mesh.nodes[3 * n + d]; bb[2 * d] = Math.min(bb[2 * d], x); bb[2 * d + 1] = Math.max(bb[2 * d + 1], x); }
    const size = Math.hypot(bb[1] - bb[0], bb[3] - bb[2], bb[5] - bb[4]);
    out.size = size;
    if (out.maxDisp > 0.05 * size) warn('large_disp', 'warn', { d: out.maxDisp, pct: 100 * out.maxDisp / size });
    if (mat.yield && out.maxVm > mat.yield) warn('over_yield', 'warn', { vm: out.maxVm, y: mat.yield });
    if (out.maxVmRaw > 1.25 * out.maxVm) warn('stress_spread', 'info', { raw: out.maxVmRaw, avg: out.maxVm });
    warn('singular', 'info');
  }
  return out;
}

// ------------------------------------------------------------------------------------------------ drawing

/** Sub-triangles of the boundary (four to a quadratic triangle): Int32Array of node triples. */
export function surfaceTris(mesh) {
  const B = mesh.btri6, k = B.length / 6, out = new Int32Array(12 * k);
  for (let t = 0; t < k; t++) {
    const [c0, c1, c2, m01, m12, m20] = [0, 1, 2, 3, 4, 5].map((i) => B[6 * t + i]);
    out.set([c0, m01, m20, m01, c1, m12, m20, m12, c2, m01, m12, m20], 12 * t);
  }
  return out;
}
export const RAMP = ['#2c4ea3', '#2a8bd0', '#2fb5b0', '#5bc16a', '#b5d33d', '#f1c232', '#ef8a2a', '#d3392b'];
/** The scale that draws the largest displacement as 5 % of the part's size (never below 1). */
export const autoScale = (umax, size) => (umax > 0 ? Math.max(1, +(0.05 * size / umax).toPrecision(2)) : 1);

/**
 * values (per node), disp (3n, mm) → { bodies: [{ name, color, mesh: { positions, indices } }], legend [{ lo, hi, color }], lo, hi, scale, triangles, offset }.
 * opts { n = 8 bands, scale, beside = true, sign }. beside: shifted along x by 1.25 × the part's width; otherwise on the part, pushed out 0.2 % of its size along the surface normal.
 */
export function bandBodies(mesh, values, disp, { n = 8, scale = null, beside = true, umax = null, size = null } = {}) {
  const T = surfaceTris(mesh), X = mesh.nodes, nn = X.length / 3;
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < nn; i++) { const v = values[i]; if (Number.isFinite(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
  if (!(hi >= lo)) return null;
  if (hi - lo < 1e-12 * Math.max(1, Math.abs(hi))) hi = lo + 1e-12 * Math.max(1, Math.abs(lo)) + 1e-30;
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < nn; i++) for (let d = 0; d < 3; d++) { mn[d] = Math.min(mn[d], X[3 * i + d]); mx[d] = Math.max(mx[d], X[3 * i + d]); }
  const sz = size || Math.hypot(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) || 1;
  let um = umax; if (um === null) { um = 0; for (let i = 0; i < nn; i++) um = Math.max(um, Math.hypot(disp[3 * i], disp[3 * i + 1], disp[3 * i + 2])); }
  const k = scale !== null ? scale : autoScale(um, sz);
  const off = beside ? [(mx[0] - mn[0]) * 1.25 + 0.1 * sz, 0, 0] : [0, 0, 0];
  const P = new Float64Array(3 * nn);
  for (let i = 0; i < nn; i++) for (let d = 0; d < 3; d++) P[3 * i + d] = X[3 * i + d] + k * disp[3 * i + d] + off[d];
  if (!beside) {   // out along the vertex normals so the plot is not hidden by the part itself
    const N = new Float64Array(3 * nn);
    for (let t = 0; t < T.length / 3; t++) {
      const [a, b, c] = [T[3 * t], T[3 * t + 1], T[3 * t + 2]], u = [0, 1, 2].map((d) => P[3 * b + d] - P[3 * a + d]), v = [0, 1, 2].map((d) => P[3 * c + d] - P[3 * a + d]), w = cross(u, v);
      for (const q of [a, b, c]) for (let d = 0; d < 3; d++) N[3 * q + d] += w[d];
    }
    const s = boundarySign(mesh), e = 0.002 * sz;
    for (let i = 0; i < nn; i++) { const l = Math.hypot(N[3 * i], N[3 * i + 1], N[3 * i + 2]); if (l) for (let d = 0; d < 3; d++) P[3 * i + d] += s * N[3 * i + d] / l * e; }
  }
  const band = (v) => Math.min(n - 1, Math.max(0, Math.floor((v - lo) / (hi - lo) * n)));
  const groups = Array.from({ length: n }, () => ({ pos: [], idx: [], map: new Map() }));
  for (let t = 0; t < T.length / 3; t++) {
    const tri = [T[3 * t], T[3 * t + 1], T[3 * t + 2]], g = groups[band((values[tri[0]] + values[tri[1]] + values[tri[2]]) / 3)];
    for (const q of tri) {
      let id = g.map.get(q);
      if (id === undefined) { id = g.pos.length / 3; g.map.set(q, id); g.pos.push(P[3 * q], P[3 * q + 1], P[3 * q + 2]); }
      g.idx.push(id);
    }
  }
  const bodies = [], legend = [];
  groups.forEach((g, b) => {
    legend.push({ lo: lo + (hi - lo) * b / n, hi: lo + (hi - lo) * (b + 1) / n, color: RAMP[Math.min(RAMP.length - 1, Math.round(b * (RAMP.length - 1) / Math.max(1, n - 1)))] });
    if (g.idx.length) bodies.push({ name: 'band ' + (b + 1), color: legend[b].color, mesh: { positions: g.pos, indices: g.idx } });
  });
  return { bodies, legend, lo, hi, scale: k, triangles: T.length / 3, offset: off };
}

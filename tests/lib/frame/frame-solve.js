/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-solve.js — linear static analysis of a 3D frame by the direct stiffness method (0.6 LC.4). DOM-free; imports only
 * frame-model.js. Its readable twin is the CraftScript library function craftlib/frame3d.craft (PartCraft): the same
 * method written out in script, and bin/test-frame.mjs checks that both give the same numbers on every textbook case.
 * An analysis aid, not a code check.
 *
 * Method (W. McGuire, R. H. Gallagher, R. D. Ziemian, Matrix Structural Analysis, 2nd ed., 2000, ch. 4–5, 7; J. S.
 * Przemieniecki, Theory of Matrix Structural Analysis, 1968, §5.4):
 *   - each member is a 2-node, 12-dof Euler–Bernoulli beam-column (no shear deformation, no warping, small displacements):
 *     axial EA/L, torsion GJ/L, bending in the local x–y plane with E·Iz and in the x–z plane with E·Iy;
 *   - released end actions (pins, sliding ends) are taken out of the member matrix by static condensation, together
 *     with the member's fixed-end forces (McGuire et al. §7.4);
 *   - loads along a member become equivalent nodal loads through the beam's own shape functions (linear for axial,
 *     cubic Hermite for bending), integrated by 4-point Gauss–Legendre quadrature — exact for uniform, linearly varying
 *     and point loads;
 *   - K = Σ Tᵀ k T over the members (T: global → local), held dofs removed, springs added on the diagonal; nodes are
 *     numbered by reverse Cuthill–McKee and K is factorised once by banded Cholesky (LLᵀ) for every load set;
 *   - a pivot that vanishes means a mechanism: the run stops and names the node and direction; a dof no member stiffens
 *     (a rotation where every member is pinned, say) and that carries no load is held and said (warning `idle-dof`);
 *   - member end forces f = k·u_local − p (p = the condensed equivalent loads); reactions = Σ member end forces − the
 *     loads applied at the node; the sums of loads and reactions are returned for the equilibrium check;
 *   - along a member: N, Vy, Vz, T, My, Mz by statics from the i end (exact), and the deflection by integrating the
 *     curvature twice between the two end displacements (trapezoids on a fine grid; the error is far below 0.01 %).
 *
 * Sign conventions (said in the report): end forces are those the nodes exert on the member, in local axes. Along the
 * member N > 0 is tension, Vy and Vz are the forces on the cut face whose outward normal is +x, T follows the right-hand
 * rule about x, My > 0 puts the −z side in tension (a beam sagging under gravity: My > 0), Mz > 0 puts the −y side in tension.
 *
 *   solveFrame(model, { sets }) → { ok, error?, warnings, dofs, band, results: { [setId]: R } }
 *     sets = [{ id, kind: 'case' | 'combo' }] (default: every case, then every combo)
 *     R = { id, kind, name, u: Float64Array(6·nodes) global, reactions: Float64Array(6·nodes), ends: Float64Array(12·members)
 *           local, loads: per member [{ comp, kind, a, b, w1, w2 | P }] (local, the set's own), applied: [6], reacted: [6] }
 *     error = { code: 'empty' | 'no-supports' | 'mechanism' | 'release-unstable', node?, dof?, member? }
 *   diagram(prep, R, m, n = 20) → { x: [], N, Vy, Vz, T, My, Mz, dx, dy, dz (local displacement), rel (transverse
 *     deflection off the chord: √(v_rel² + w_rel²)) } — prep = result.prep
 *   memberExtremes(prep, R, m) → { N, Vy, Vz, T, My, Mz: { max, min, xMax, xMin }, defl: { value, x, ratio (L / defl) } }
 *   combine(prep, results, factors, meta) → R of a linear combination of computed sets
 */
import { nodeIndex, axesOf, G_ACC } from './frame-model.js';

const GAUSS4 = [[-0.8611363115940526, 0.3478548451374538], [-0.3399810435848563, 0.6521451548625461], [0.3399810435848563, 0.6521451548625461], [0.8611363115940526, 0.3478548451374538]];
const PIVOT_TOL = 1e-11;

/** 12×12 local stiffness (row-major Float64Array). */
export function localK(E, G, A, Iy, Iz, J, L) {
  const k = new Float64Array(144);
  const s = (i, j, v) => { k[i * 12 + j] += v; if (i !== j) k[j * 12 + i] += v; };
  const ea = E * A / L, gj = G * J / L;
  s(0, 0, ea); s(0, 6, -ea); s(6, 6, ea);
  s(3, 3, gj); s(3, 9, -gj); s(9, 9, gj);
  const z1 = 12 * E * Iz / L ** 3, z2 = 6 * E * Iz / L ** 2, z3 = 4 * E * Iz / L, z4 = 2 * E * Iz / L;
  s(1, 1, z1); s(1, 5, z2); s(1, 7, -z1); s(1, 11, z2);
  s(5, 5, z3); s(5, 7, -z2); s(5, 11, z4);
  s(7, 7, z1); s(7, 11, -z2); s(11, 11, z3);
  const y1 = 12 * E * Iy / L ** 3, y2 = 6 * E * Iy / L ** 2, y3 = 4 * E * Iy / L, y4 = 2 * E * Iy / L;
  s(2, 2, y1); s(2, 4, -y2); s(2, 8, -y1); s(2, 10, -y2);
  s(4, 4, y3); s(4, 8, y2); s(4, 10, y4);
  s(8, 8, y1); s(8, 10, y2); s(10, 10, y3);
  return k;
}

/** Equivalent nodal loads (local, 12) of one load piece on a member of length L. */
export function equivalentLoads(piece, L, p = new Float64Array(12)) {
  const add = (xi, q) => {      // q = force (per length × weight, or a point force) at ξ along the member
    const N1 = 1 - 3 * xi * xi + 2 * xi ** 3, N2 = L * (xi - 2 * xi * xi + xi ** 3), N3 = 3 * xi * xi - 2 * xi ** 3, N4 = L * (-xi * xi + xi ** 3);
    if (piece.comp === 0) { p[0] += q * (1 - xi); p[6] += q * xi; }
    else if (piece.comp === 1) { p[1] += q * N1; p[5] += q * N2; p[7] += q * N3; p[11] += q * N4; }
    else { p[2] += q * N1; p[4] -= q * N2; p[8] += q * N3; p[10] -= q * N4; }
  };
  if (piece.kind === 'point') add(piece.a / L, piece.P);
  else {
    const { a, b, w1, w2 } = piece, h = (b - a) / 2;
    for (const [g, wt] of GAUSS4) { const x = a + h * (g + 1); add(x / L, (w1 + (w2 - w1) * (x - a) / (b - a)) * wt * h); }
  }
  return p;
}

/** Local load pieces of one load on a member (global directions split onto the local axes). */
function pieces(load, ax, out) {
  const L = ax.L;
  const comps = (dir) => {
    if (dir === 'x') return [1, 0, 0];
    if (dir === 'y') return [0, 1, 0];
    if (dir === 'z') return [0, 0, 1];
    const g = dir === 'X' ? [1, 0, 0] : dir === 'Y' ? [0, 1, 0] : [0, 0, 1];
    const d = (v) => v[0] * g[0] + v[1] * g[1] + v[2] * g[2];
    return [d(ax.ex), d(ax.ey), d(ax.ez)];
  };
  const c = comps(load.dir);
  for (let k = 0; k < 3; k++) {
    if (Math.abs(c[k]) < 1e-15) continue;
    if (load.type === 'point') {
      if (load.a > L + 1e-9) continue;
      out.push({ comp: k, kind: 'point', a: Math.min(load.a, L), P: load.P * c[k] });
    } else {
      const a = Math.max(0, Math.min(L, load.a ?? 0)), b = Math.max(0, Math.min(L, load.b ?? L));
      if (b - a < 1e-9) continue;
      const w1 = load.w, w2 = load.w2 ?? load.w;
      // a load cut short by the member's end keeps its slope
      const span = (load.b ?? L) - (load.a ?? 0);
      const at = (x) => (span > 0 ? w1 + (w2 - w1) * (x - (load.a ?? 0)) / span : w1);
      out.push({ comp: k, kind: 'dist', a, b, w1: at(a) * c[k], w2: at(b) * c[k] });
    }
  }
}

function invSmall(M, n) {        // Gauss–Jordan with partial pivoting; null when singular
  const a = Array.from({ length: n }, (_, i) => [...M.slice(i * n, i * n + n), ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  const scale = Math.max(1e-300, ...M.map(Math.abs));
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    if (Math.abs(a[p][c]) < 1e-12 * scale) return null;
    [a[c], a[p]] = [a[p], a[c]];
    const d = a[c][c];
    for (let j = 0; j < 2 * n; j++) a[c][j] /= d;
    for (let r = 0; r < n; r++) if (r !== c && a[r][c]) { const f = a[r][c]; for (let j = 0; j < 2 * n; j++) a[r][j] -= f * a[c][j]; }
  }
  const out = new Float64Array(n * n);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out[i * n + j] = a[i][n + j];
  return out;
}

/** Static condensation of released dofs: { k (12×12, zero rows/cols at released), cond (for the loads), rel } or null. */
function condense(k, relIdx) {
  if (!relIdx.length) return { k, rel: relIdx, keep: null };
  const keep = [];
  for (let i = 0; i < 12; i++) if (!relIdx.includes(i)) keep.push(i);
  const r = relIdx.length;
  const krr = new Float64Array(r * r);
  for (let a = 0; a < r; a++) for (let b = 0; b < r; b++) krr[a * r + b] = k[relIdx[a] * 12 + relIdx[b]];
  const inv = invSmall(krr, r);
  if (!inv) return null;
  // G = k_ar · k_rr⁻¹ (12 × r, rows for kept dofs)
  const Gm = new Float64Array(12 * r);
  for (const i of keep) for (let b = 0; b < r; b++) { let s = 0; for (let c = 0; c < r; c++) s += k[i * 12 + relIdx[c]] * inv[c * r + b]; Gm[i * r + b] = s; }
  const kc = new Float64Array(144);
  for (const i of keep) for (const j of keep) { let s = k[i * 12 + j]; for (let b = 0; b < r; b++) s -= Gm[i * r + b] * k[relIdx[b] * 12 + j]; kc[i * 12 + j] = s; }
  return { k: kc, rel: relIdx, keep, Gm, r, inv, kFull: k };
}
function condenseLoads(c, p) {
  if (!c.rel.length) return p;
  const out = new Float64Array(12);
  for (const i of c.keep) { let s = p[i]; for (let b = 0; b < c.r; b++) s -= c.Gm[i * c.r + b] * p[c.rel[b]]; out[i] = s; }
  return out;
}

/** Reverse Cuthill–McKee order of the nodes that members touch. */
function rcm(nn, adj) {
  const deg = adj.map((a) => a.length);
  const seen = new Uint8Array(nn), order = [];
  const nodes = [...Array(nn).keys()].filter((i) => deg[i] > 0).sort((a, b) => deg[a] - deg[b]);
  for (const s0 of nodes) {
    if (seen[s0]) continue;
    // a far node of the component: the last of a breadth-first sweep from the least connected node
    let s = s0;
    for (let pass = 0; pass < 2; pass++) {
      const lv = new Int32Array(nn).fill(-1); lv[s] = 0; const q = [s]; let last = s;
      for (let h = 0; h < q.length; h++) for (const w of adj[q[h]]) if (lv[w] < 0) { lv[w] = lv[q[h]] + 1; q.push(w); last = w; }
      s = last;
    }
    const q = [s]; seen[s] = 1;
    for (let h = 0; h < q.length; h++) {
      const nb = adj[q[h]].filter((w) => !seen[w]).sort((a, b) => deg[a] - deg[b]);
      for (const w of nb) { seen[w] = 1; q.push(w); }
    }
    order.push(...q);
  }
  return order.reverse();
}

/** Prepares members, numbering and the factorised stiffness. */
export function prepare(model) {
  const warnings = [];
  const nn = model.nodes.length, M = model.members.length;
  if (!M) return { error: { code: 'empty' }, warnings };
  if (!model.supports.length) return { error: { code: 'no-supports' }, warnings };
  const idx = nodeIndex(model);
  const P = model.nodes.map((n) => [n.x, n.y, n.z]);
  const secs = new Map(model.sections.map((s) => [s.id, s])), mats = new Map(model.materials.map((m) => [m.id, m]));
  const mem = [];
  const adj = Array.from({ length: nn }, () => []);
  for (const m of model.members) {
    const i = idx.get(m.i), j = idx.get(m.j), s = secs.get(m.section), mt = mats.get(m.material);
    const ax = axesOf(P[i], P[j], m.roll || 0);
    const k0 = localK(mt.E, mt.G, s.A, s.Iy, s.Iz, s.J, ax.L);
    const rel = [];
    m.rel.i.forEach((r, d) => r && rel.push(d));
    m.rel.j.forEach((r, d) => r && rel.push(6 + d));
    const c = condense(k0, rel);
    if (!c) return { error: { code: 'release-unstable', member: m.id }, warnings };
    const T = [...ax.ex, ...ax.ey, ...ax.ez];
    // k_global = Tᵀ k T, block by block (3×3 blocks of the 12×12)
    const kg = new Float64Array(144);
    for (let bi = 0; bi < 4; bi++) for (let bj = 0; bj < 4; bj++) {
      for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) {
        let s2 = 0;
        for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) s2 += T[a * 3 + r] * c.k[(bi * 3 + a) * 12 + bj * 3 + b] * T[b * 3 + q];
        kg[(bi * 3 + r) * 12 + bj * 3 + q] = s2;
      }
    }
    mem.push({ id: m.id, i, j, ax, T, c, kg, E: mt.E, G: mt.G, rho: mt.rho, A: s.A, Iy: s.Iy, Iz: s.Iz, J: s.J });
    if (!adj[i].includes(j)) { adj[i].push(j); adj[j].push(i); }
  }
  // held dofs and springs
  const held = new Uint8Array(6 * nn), spring = new Float64Array(6 * nn);
  for (const s of model.supports) {
    const n = idx.get(s.node);
    for (let d = 0; d < 6; d++) { if (s.fix[d]) held[6 * n + d] = 1; else if (s.k) spring[6 * n + d] = s.k[d]; }
  }
  const touched = new Uint8Array(nn);
  for (const e of mem) { touched[e.i] = 1; touched[e.j] = 1; }
  // dofs nothing stiffens. A translation whose diagonal in K is zero (a pin-ended member's node seen across) is held.
  // At each node the 3×3 rotation block is split into its eigen-directions: a direction no member resists (every member
  // there is pinned in bending and square to it, so it does not twist either) is decoupled from the rest of K, so a
  // spring along it changes nothing — it is added, and a moment along it is refused as a mechanism.
  const diag = new Float64Array(6 * nn);
  const rotBlock = Array.from({ length: nn }, () => new Float64Array(9));
  for (const e of mem) {
    for (let a = 0; a < 6; a++) { diag[6 * e.i + a] += Math.abs(e.kg[a * 12 + a]); diag[6 * e.j + a] += Math.abs(e.kg[(6 + a) * 12 + 6 + a]); }
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { rotBlock[e.i][a * 3 + b] += e.kg[(3 + a) * 12 + 3 + b]; rotBlock[e.j][a * 3 + b] += e.kg[(9 + a) * 12 + 9 + b]; }
  }
  const idle = new Uint8Array(6 * nn);
  let maxT = 0, maxR = 0;
  for (let q = 0; q < 6 * nn; q++) if (q % 6 < 3) maxT = Math.max(maxT, diag[q]); else maxR = Math.max(maxR, diag[q]);
  const rotSprings = [];
  for (let n = 0; n < nn; n++) {
    if (!touched[n]) continue;
    for (let d = 0; d < 3; d++) {
      const q = 6 * n + d;
      if (!held[q] && diag[q] + spring[q] <= 1e-14 * maxT) { idle[q] = 1; warnings.push({ code: 'idle-dof', node: model.nodes[n].id, dof: d }); }
    }
    const blk = Float64Array.from(rotBlock[n]);
    for (let d = 0; d < 3; d++) { if (held[6 * n + 3 + d]) blk[d * 4] += maxR || 1; else blk[d * 4] += spring[6 * n + 3 + d]; }
    const { values, vectors } = eigSym3(blk);
    for (let k = 0; k < 3; k++) {
      if (values[k] > 1e-10 * (maxR || 1)) continue;
      const v = vectors[k];
      rotSprings.push({ n, v, s: maxR || 1 });
      const dof = [0, 1, 2].reduce((b, a) => (Math.abs(v[a]) > Math.abs(v[b]) ? a : b), 0);
      warnings.push({ code: 'idle-rotation', node: model.nodes[n].id, dof: 3 + dof, axis: v.map((x) => Math.round(x * 1e6) / 1e6) });
    }
  }
  const order = rcm(nn, adj);
  const eq = new Int32Array(6 * nn).fill(-1);
  const dofOf = [];
  let n = 0;
  for (const nd of order) for (let d = 0; d < 6; d++) { const q = 6 * nd + d; if (!held[q] && !idle[q]) { eq[q] = n++; dofOf.push(q); } }
  for (let q = 0; q < nn; q++) if (!touched[q] && model.supports.every((s) => idx.get(s.node) !== q)) warnings.push({ code: 'loose-node', node: model.nodes[q].id });
  let band = 0;
  const edofs = mem.map((e) => { const list = []; for (let a = 0; a < 6; a++) list.push(eq[6 * e.i + a]); for (let a = 0; a < 6; a++) list.push(eq[6 * e.j + a]); return list; });
  for (const list of edofs) { const v = list.filter((x) => x >= 0); if (v.length) band = Math.max(band, Math.max(...v) - Math.min(...v)); }
  const B = band + 1;
  const K = new Float64Array(n * B);
  for (let m = 0; m < mem.length; m++) {
    const e = mem[m], list = edofs[m];
    for (let p = 0; p < 12; p++) {
      const ep = list[p];
      if (ep < 0) continue;
      for (let q = 0; q < 12; q++) { const eqq = list[q]; if (eqq < 0 || eqq > ep) continue; K[ep * B + (ep - eqq)] += e.kg[p * 12 + q]; }
    }
  }
  for (let q = 0; q < 6 * nn; q++) if (eq[q] >= 0 && spring[q]) K[eq[q] * B] += spring[q];
  for (const { n: nd, v, s } of rotSprings) {
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
      const ea = eq[6 * nd + 3 + a], eb = eq[6 * nd + 3 + b];
      if (ea < 0 || eb < 0 || eb > ea) continue;
      K[ea * B + (ea - eb)] += s * v[a] * v[b];
    }
  }
  // banded Cholesky, in place: L(i, j) at i·B + (i − j)
  for (let j = 0; j < n; j++) {
    const kjj = K[j * B];
    let s = kjj;
    for (let k = Math.max(0, j - band); k < j; k++) { const l = K[j * B + (j - k)]; s -= l * l; }
    if (!(s > PIVOT_TOL * Math.abs(kjj)) || !(kjj > 0)) {
      const q = dofOf[j];
      return { error: { code: 'mechanism', node: model.nodes[Math.floor(q / 6)].id, dof: q % 6 }, warnings };
    }
    const d = Math.sqrt(s);
    K[j * B] = d;
    for (let i = j + 1; i <= Math.min(n - 1, j + band); i++) {
      let v = K[i * B + (i - j)];
      for (let k = Math.max(0, i - band); k < j; k++) v -= K[i * B + (i - k)] * K[j * B + (j - k)];
      K[i * B + (i - j)] = v / d;
    }
  }
  return { model, warnings, mem, idx, P, nn, n, band, B, L: K, eq, held, idle, spring, edofs, rotSprings };
}

/** Eigenvalues (ascending) and unit eigenvectors of a symmetric 3×3 (row-major), by cyclic Jacobi rotations. */
export function eigSym3(m) {
  const a = [[m[0], m[1], m[2]], [m[3], m[4], m[5]], [m[6], m[7], m[8]]];
  const V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 50; sweep++) {
    const off = Math.abs(a[0][1]) + Math.abs(a[0][2]) + Math.abs(a[1][2]);
    if (off <= 1e-300 || off < 1e-15 * (Math.abs(a[0][0]) + Math.abs(a[1][1]) + Math.abs(a[2][2]))) break;
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
      if (a[p][q] === 0) continue;
      const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < 3; k++) { const x = a[k][p], y = a[k][q]; a[k][p] = c * x - s * y; a[k][q] = s * x + c * y; }
      for (let k = 0; k < 3; k++) { const x = a[p][k], y = a[q][k]; a[p][k] = c * x - s * y; a[q][k] = s * x + c * y; }
      for (let k = 0; k < 3; k++) { const x = V[k][p], y = V[k][q]; V[k][p] = c * x - s * y; V[k][q] = s * x + c * y; }
    }
  }
  const order = [0, 1, 2].sort((x, y) => a[x][x] - a[y][y]);
  return { values: order.map((k) => a[k][k]), vectors: order.map((k) => [V[0][k], V[1][k], V[2][k]]) };
}

function solveBand(prep, f) {
  const { n, band, B, L } = prep;
  const y = new Float64Array(n);
  for (let i = 0; i < n; i++) { let s = f[i]; for (let k = Math.max(0, i - band); k < i; k++) s -= L[i * B + (i - k)] * y[k]; y[i] = s / L[i * B]; }
  for (let i = n - 1; i >= 0; i--) { let s = y[i]; for (let k = i + 1; k <= Math.min(n - 1, i + band); k++) s -= L[k * B + (k - i)] * y[k]; y[i] = s / L[i * B]; }
  return y;
}

/** The loads of one set in the solver's terms: node forces (global) + per member local pieces. */
function loadSet(prep, entries) {
  const { model, mem, idx, nn } = prep;
  const nodeF = new Float64Array(6 * nn);
  const memLoads = mem.map(() => []);
  const mIdx = new Map(model.members.map((m, k) => [m.id, k]));
  for (const { c, f } of entries) {
    if (c.selfWeight) {
      mem.forEach((e, k) => {
        const w = -c.selfWeight * f * e.rho * 1e-9 * e.A * G_ACC;     // N/mm along −Z
        if (w) pieces({ type: 'udl', dir: 'Z', w }, e.ax, memLoads[k]);
      });
    }
    for (const l of c.loads) {
      if (l.type === 'node') { const n = idx.get(l.node); for (let d = 0; d < 6; d++) nodeF[6 * n + d] += f * l.F[d]; continue; }
      const k = mIdx.get(l.member);
      const scaled = l.type === 'point' ? { ...l, P: l.P * f } : { ...l, w: l.w * f, w2: (l.w2 ?? l.w) * f };
      pieces(scaled, mem[k].ax, memLoads[k]);
    }
  }
  return { nodeF, memLoads };
}

function runSet(prep, set) {
  const { mem, nn, eq, n } = prep;
  const { nodeF, memLoads } = loadSet(prep, set.entries);
  const F = new Float64Array(n);
  const pc = mem.map((e, k) => {
    const p = new Float64Array(12);
    for (const pz of memLoads[k]) equivalentLoads(pz, e.ax.L, p);
    return { p, cp: condenseLoads(e.c, p) };
  });
  const Fg = new Float64Array(6 * nn);
  for (let q = 0; q < 6 * nn; q++) Fg[q] = nodeF[q];
  mem.forEach((e, k) => {
    const cp = pc[k].cp;
    for (let blk = 0; blk < 4; blk++) for (let r = 0; r < 3; r++) {
      let s = 0;
      for (let a = 0; a < 3; a++) s += e.T[a * 3 + r] * cp[blk * 3 + a];
      Fg[6 * (blk < 2 ? e.i : e.j) + (blk % 2) * 3 + r] += s;
    }
  });
  for (let q = 0; q < 6 * nn; q++) if (eq[q] >= 0) F[eq[q]] += Fg[q];
  // a load on an idle dof cannot be carried
  for (let q = 0; q < 6 * nn; q++) if (prep.idle[q] && Math.abs(Fg[q]) > 1e-9) return { error: { code: 'mechanism', node: prep.model.nodes[Math.floor(q / 6)].id, dof: q % 6 } };
  for (const { n: nd, v } of prep.rotSprings) {
    const m = v[0] * Fg[6 * nd + 3] + v[1] * Fg[6 * nd + 4] + v[2] * Fg[6 * nd + 5];
    if (Math.abs(m) > 1e-6) return { error: { code: 'mechanism', node: prep.model.nodes[nd].id, dof: 3 + [0, 1, 2].reduce((b, a) => (Math.abs(v[a]) > Math.abs(v[b]) ? a : b), 0) } };
  }
  const x = solveBand(prep, F);
  const u = new Float64Array(6 * nn);
  for (let q = 0; q < 6 * nn; q++) if (eq[q] >= 0) u[q] = x[eq[q]];
  const ends = new Float64Array(12 * mem.length);
  const reactions = new Float64Array(6 * nn);
  mem.forEach((e, k) => {
    const ul = new Float64Array(12);
    for (let blk = 0; blk < 4; blk++) {
      const base = 6 * (blk < 2 ? e.i : e.j) + (blk % 2) * 3;
      for (let a = 0; a < 3; a++) ul[blk * 3 + a] = e.T[a * 3] * u[base] + e.T[a * 3 + 1] * u[base + 1] + e.T[a * 3 + 2] * u[base + 2];
    }
    const kc = e.c.k, cp = pc[k].cp;
    for (let r = 0; r < 12; r++) { let s = -cp[r]; for (let q = 0; q < 12; q++) s += kc[r * 12 + q] * ul[q]; ends[12 * k + r] = s; }
    for (const r of e.c.rel) ends[12 * k + r] = 0;
    for (let blk = 0; blk < 4; blk++) for (let r = 0; r < 3; r++) {
      let s = 0;
      for (let a = 0; a < 3; a++) s += e.T[a * 3 + r] * ends[12 * k + blk * 3 + a];
      reactions[6 * (blk < 2 ? e.i : e.j) + (blk % 2) * 3 + r] += s;
    }
  });
  for (let q = 0; q < 6 * nn; q++) reactions[q] -= nodeF[q];
  // only supported dofs carry a reaction; elsewhere the sum is the (round-off) out-of-balance
  const supported = new Uint8Array(6 * nn);
  for (const s of prep.model.supports) { const nd = prep.idx.get(s.node); for (let d = 0; d < 6; d++) if (s.fix[d] || (s.k && s.k[d])) supported[6 * nd + d] = 1; }
  for (let q = 0; q < 6 * nn; q++) if (!supported[q]) reactions[q] = 0;
  const applied = totals(prep, nodeF, memLoads), reacted = new Float64Array(6);
  for (let nd = 0; nd < nn; nd++) {
    const [x0, y0, z0] = prep.P[nd];
    const R = reactions.subarray(6 * nd, 6 * nd + 6);
    reacted[0] += R[0]; reacted[1] += R[1]; reacted[2] += R[2];
    reacted[3] += R[3] + y0 * R[2] - z0 * R[1]; reacted[4] += R[4] + z0 * R[0] - x0 * R[2]; reacted[5] += R[5] + x0 * R[1] - y0 * R[0];
  }
  return { u, ends, reactions, loads: memLoads, applied: [...applied], reacted: [...reacted] };
}

/** Resultant of every load of a set about the global origin: [Fx Fy Fz Mx My Mz]. */
function totals(prep, nodeF, memLoads) {
  const t = new Float64Array(6);
  const add = (p, F) => { t[0] += F[0]; t[1] += F[1]; t[2] += F[2]; t[3] += p[1] * F[2] - p[2] * F[1]; t[4] += p[2] * F[0] - p[0] * F[2]; t[5] += p[0] * F[1] - p[1] * F[0]; };
  for (let nd = 0; nd < prep.nn; nd++) {
    const F = nodeF.subarray(6 * nd, 6 * nd + 6);
    add(prep.P[nd], F); t[3] += F[3]; t[4] += F[4]; t[5] += F[5];
  }
  prep.mem.forEach((e, k) => {
    const o = prep.P[e.i], ax = [e.ax.ex, e.ax.ey, e.ax.ez];
    for (const pz of memLoads[k]) {
      const dir = ax[pz.comp];
      const at = (x, q) => add([o[0] + e.ax.ex[0] * x, o[1] + e.ax.ex[1] * x, o[2] + e.ax.ex[2] * x], [dir[0] * q, dir[1] * q, dir[2] * q]);
      if (pz.kind === 'point') at(pz.a, pz.P);
      else { const h = (pz.b - pz.a) / 2; for (const [g, wt] of GAUSS4) { const x = pz.a + h * (g + 1); at(x, (pz.w1 + (pz.w2 - pz.w1) * (x - pz.a) / (pz.b - pz.a)) * wt * h); } }
    }
  });
  return t;
}

/** Every case and combination of a model. */
export function solveFrame(model, { sets = null } = {}) {
  const prep = prepare(model);
  if (prep.error) return { ok: false, error: prep.error, warnings: prep.warnings };
  const cases = new Map(model.cases.map((c) => [c.id, c]));
  const want = sets || [...model.cases.map((c) => ({ id: c.id, kind: 'case' })), ...model.combos.map((c) => ({ id: c.id, kind: 'combo' }))];
  const results = {};
  for (const s of want) {
    let entries, name;
    if (s.kind === 'combo') {
      const cb = model.combos.find((c) => c.id === s.id);
      if (!cb) continue;
      entries = cb.factors.map((x) => ({ c: cases.get(x.case), f: x.f })).filter((x) => x.c);
      name = cb.name;
    } else {
      const c = cases.get(s.id);
      if (!c) continue;
      entries = [{ c, f: 1 }]; name = c.name;
    }
    const r = runSet(prep, { entries });
    if (r.error) return { ok: false, error: r.error, warnings: prep.warnings };
    results[(s.kind === 'combo' ? 'combo:' : 'case:') + s.id] = { id: s.id, kind: s.kind, name, ...r };
  }
  return { ok: true, warnings: prep.warnings, dofs: prep.n, band: prep.band, results, prep };
}

/** Internal actions and displacements along member m of a result. */
export function diagram(prep, R, m, n = 20) {
  const e = prep.mem[m], L = e.ax.L;
  const end = R.ends.subarray(12 * m, 12 * m + 12);
  const loads = R.loads[m];
  // the cut x: S = −(F_i + ∫₀ˣ q), M_S = −(M_i + r_i × F_i + Σ r × q), r from the cut to the force
  const at = (x) => {
    const S = [-end[0], -end[1], -end[2]];
    const Ms = [-end[3], -(end[4] + x * end[2]), -(end[5] - x * end[1])];
    for (const pz of loads) {
      const c = pz.comp;
      const force = (s, q) => {   // q along local axis c at s ≤ x; r = (s − x, 0, 0)
        S[c] -= q;
        if (c === 1) Ms[2] -= (s - x) * q;
        else if (c === 2) Ms[1] += (s - x) * q;
      };
      if (pz.kind === 'point') { if (pz.a < x - 1e-9 || (pz.a <= x + 1e-9 && x >= L - 1e-9)) force(pz.a, pz.P); continue; }
      const a = pz.a, b = Math.min(pz.b, x);
      if (b <= a) continue;
      const h = (b - a) / 2;
      for (const [g, wt] of GAUSS4) { const s = a + h * (g + 1); force(s, (pz.w1 + (pz.w2 - pz.w1) * (s - pz.a) / (pz.b - pz.a)) * wt * h); }
    }
    return { N: S[0], Vy: S[1], Vz: S[2], T: Ms[0], My: -Ms[1], Mz: Ms[2], MSy: Ms[1], MSz: Ms[2] };
  };
  // fine grid for the deflection: v'' = M_Sz / E Iz, w'' = −M_Sy / E Iy, u' = N / E A, φ' = T / G J
  const nf = Math.max(8, n) * 16;
  const xs = Array.from({ length: nf + 1 }, (_, k) => L * k / nf);
  const acts = xs.map(at);
  const integrate2 = (kappa) => { const th = [0], d = [0]; for (let k = 1; k <= nf; k++) { th.push(th[k - 1] + (kappa[k - 1] + kappa[k]) / 2 * (L / nf)); d.push(d[k - 1] + (th[k - 1] + th[k]) / 2 * (L / nf)); } return d; };
  const integrate1 = (f) => { const d = [0]; for (let k = 1; k <= nf; k++) d.push(d[k - 1] + (f[k - 1] + f[k]) / 2 * (L / nf)); return d; };
  const loc = (nd) => {
    const u = R.u.subarray(6 * nd, 6 * nd + 6), T = e.T;
    return [0, 1, 2].map((a) => T[a * 3] * u[0] + T[a * 3 + 1] * u[1] + T[a * 3 + 2] * u[2])
      .concat([0, 1, 2].map((a) => T[a * 3] * u[3] + T[a * 3 + 1] * u[4] + T[a * 3 + 2] * u[5]));
  };
  const ui = loc(e.i), uj = loc(e.j);
  const dv = integrate2(acts.map((a) => a.MSz / (e.E * e.Iz)));
  const dw = integrate2(acts.map((a) => -a.MSy / (e.E * e.Iy)));
  const du = integrate1(acts.map((a) => a.N / (e.E * e.A)));
  const fit = (d, a, b) => (k) => { const x = xs[k]; return a + (b - a - d[nf]) * x / L + d[k]; };
  const vF = fit(dv, ui[1], uj[1]), wF = fit(dw, ui[2], uj[2]), uF = fit(du, ui[0], uj[0]);
  const out = { x: [], N: [], Vy: [], Vz: [], T: [], My: [], Mz: [], dx: [], dy: [], dz: [], rel: [] };
  for (let k = 0; k <= nf; k += nf / n) {
    const a = acts[k], x = xs[k];
    out.x.push(x); out.N.push(a.N); out.Vy.push(a.Vy); out.Vz.push(a.Vz); out.T.push(a.T); out.My.push(a.My); out.Mz.push(a.Mz);
    out.dx.push(uF(k)); out.dy.push(vF(k)); out.dz.push(wF(k));
    const rv = dv[k] - dv[nf] * x / L, rw = dw[k] - dw[nf] * x / L;
    out.rel.push(Math.hypot(rv, rw));
  }
  return out;
}

/** Largest and smallest of each action along a member, and its largest deflection off the chord. */
export function memberExtremes(prep, R, m, n = 40) {
  const d = diagram(prep, R, m, n);
  const ext = {};
  for (const key of ['N', 'Vy', 'Vz', 'T', 'My', 'Mz']) {
    let max = -Infinity, min = Infinity, xMax = 0, xMin = 0;
    d[key].forEach((v, k) => { if (v > max) { max = v; xMax = d.x[k]; } if (v < min) { min = v; xMin = d.x[k]; } });
    ext[key] = { max, min, xMax, xMin, abs: Math.max(Math.abs(max), Math.abs(min)) };
  }
  let v = 0, xv = 0;
  d.rel.forEach((r, k) => { if (r > v) { v = r; xv = d.x[k]; } });
  const L = prep.mem[m].ax.L;
  ext.defl = { value: v, x: xv, ratio: v > 1e-12 ? L / v : Infinity };
  return ext;
}

/** A result as a linear combination of computed sets (results must come from the same prep). */
export function combine(prep, list, meta = {}) {
  const nn = prep.nn, M = prep.mem.length;
  const out = { ...meta, u: new Float64Array(6 * nn), reactions: new Float64Array(6 * nn), ends: new Float64Array(12 * M), loads: prep.mem.map(() => []), applied: [0, 0, 0, 0, 0, 0], reacted: [0, 0, 0, 0, 0, 0] };
  for (const { R, f } of list) {
    for (let q = 0; q < out.u.length; q++) { out.u[q] += f * R.u[q]; out.reactions[q] += f * R.reactions[q]; }
    for (let q = 0; q < out.ends.length; q++) out.ends[q] += f * R.ends[q];
    for (let k = 0; k < 6; k++) { out.applied[k] += f * R.applied[k]; out.reacted[k] += f * R.reacted[k]; }
    R.loads.forEach((ls, m) => { for (const pz of ls) out.loads[m].push(pz.kind === 'point' ? { ...pz, P: pz.P * f } : { ...pz, w1: pz.w1 * f, w2: pz.w2 * f }); });
  }
  return out;
}

#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bonded-spike/spike.mjs — 0.4 P12 spike: bonded (tied) parts in the tet simulation, go/no-go evidence. Not app code.
 * Two blocks meshed separately (tetmesh.js, T10), each with its own E; the second block's interface nodes are tied to the first
 * block's interface faces by exact master–slave elimination: u_s = Σ N_i(T6) u_m (no penalty), assembled with tetfea.js's
 * t10Stiffness into one system, solved by Jacobi-preconditioned CG.
 *   A. patch test: two bars end to end (E 210000 / 70000), uniaxial (symmetry planes), traction σ on the far end:
 *      δ = σ (L1/E1 + L2/E2) exactly (linear fields are in the T10 / T6 spaces, so a consistent tie reproduces them)
 *   B. bending: a cantilever made of two bonded halves vs the same cantilever as one meshed solid (same h): tip deflection
 *   C. cost: dofs, ties, assembly + solve time
 *   node tools/partcraft-test/bonded-spike/spike.mjs [--h 5]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const S = await import(DEV + 'sketch.js'), P = await import(DEV + 'part.js'), K = await import(DEV + 'kernel.js');
const TF = await import(DEV + 'tetfea.js'), FEA = await import(DEV + 'fea.js');
const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
const M = await Module(); M.setup();
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? +process.argv[i + 1] : d; };
const H = arg('h', 5);

/** A box [x0, x0 + L] × [0, b] × [0, c] as a surface mesh (the mesh kernel). */
function boxMesh(x0, L, b, c) {
  const part = P.newPart('B');
  const sk = S.newSketch(); S.addRect(sk, [0, 0], [b, c]);   // the right plane: sketch x → world −z? use a fixed plane at x0 instead
  const s = P.addFeature(part, 'sketch', { plane: { kind: 'fixed', o: [x0, 0, 0], n: [1, 0, 0] }, sketch: sk });
  P.addFeature(part, 'extrude', { sketch: s.id, depth: L });
  const r = K.regenerate(part, M);
  return r.mesh;
}
/** Mesh one block → its T10 model in world coordinates. */
const tetOf = (mesh, h) => TF.meshJob({ mesh, h, faces: [], refineCurved: false, levels: 1 }).model;

/**
 * Several T10 models, each with its own E, tied: ties = [{ slave: model index, master: model index, plane: {axis, at} }].
 * → { N, dofOf(mi, node) → global dof base (or null for a tied node), K (Map rows), solve(f, fixed) }
 */
function bonded(models, Es, nu, ties) {
  const off = [];
  let n = 0;
  for (const m of models) { off.push(n); n += m.n; }
  // slave node → [[master global node, weight] …]
  const tieOf = new Map();
  let nTied = 0, worstOutside = 0;
  for (const t of ties) {
    const ms = models[t.master], ss = models[t.slave], ax = t.plane.axis, at = t.plane.at;
    const faces = [];
    for (let f = 0; f < ms.btri6.length / 6; f++) {
      const v = [...ms.btri6.slice(6 * f, 6 * f + 6)];
      if (v.every((a) => Math.abs(ms.X[3 * a + ax] - at) < 1e-6)) faces.push(v);
    }
    const o = [0, 1, 2].filter((k) => k !== ax);
    for (let a = 0; a < ss.n; a++) {
      if (Math.abs(ss.X[3 * a + ax] - at) > 1e-6) continue;
      const p = [ss.X[3 * a + o[0]], ss.X[3 * a + o[1]]];
      let best = null;
      for (const v of faces) {
        const q = v.slice(0, 3).map((c) => [ms.X[3 * c + o[0]], ms.X[3 * c + o[1]]]);
        const d = (q[1][0] - q[0][0]) * (q[2][1] - q[0][1]) - (q[2][0] - q[0][0]) * (q[1][1] - q[0][1]);
        const l1 = ((q[1][0] - p[0]) * (q[2][1] - p[1]) - (q[2][0] - p[0]) * (q[1][1] - p[1])) / d;
        const l2 = ((q[2][0] - p[0]) * (q[0][1] - p[1]) - (q[0][0] - p[0]) * (q[2][1] - p[1])) / d;
        const l3 = 1 - l1 - l2, out = -Math.min(l1, l2, l3);
        if (!best || out < best.out) best = { v, L: [l1, l2, l3], out };
      }
      worstOutside = Math.max(worstOutside, best.out);
      const [l1, l2, l3] = best.L;
      // T6 shape functions: corners L(2L − 1), midsides (01)(12)(20) 4 Li Lj
      const N = [l1 * (2 * l1 - 1), l2 * (2 * l2 - 1), l3 * (2 * l3 - 1), 4 * l1 * l2, 4 * l2 * l3, 4 * l3 * l1];
      tieOf.set(off[t.slave] + a, best.v.map((c, k) => [off[t.master] + c, N[k]]).filter(([, w]) => Math.abs(w) > 1e-14));
      nTied++;
    }
  }
  // free nodes numbered; a tied node's dofs are combinations of its masters'
  const free = new Int32Array(n).fill(-1);
  let nf = 0;
  for (let g = 0; g < n; g++) if (!tieOf.has(g)) free[g] = nf++;
  const expand = (g) => (tieOf.has(g) ? tieOf.get(g).map(([m, w]) => [free[m], w]) : [[free[g], 1]]);
  const rows = Array.from({ length: 3 * nf }, () => new Map());
  const t0 = Date.now();
  models.forEach((m, mi) => {
    const D = FEA.elasticD(nu), Ke = new Float64Array(900), el = new Int32Array(10);
    for (let e = 0; e < m.tets10.length / 10; e++) {
      for (let k = 0; k < 10; k++) el[k] = m.tets10[10 * e + k];
      TF.t10Stiffness(m.X, el, Es[mi], D, Ke);
      const ex = [...el].map((a) => expand(off[mi] + a));
      for (let A = 0; A < 10; A++) for (let i = 0; i < 3; i++) for (let B = 0; B < 10; B++) for (let j = 0; j < 3; j++) {
        const kv = Ke[(3 * A + i) * 30 + 3 * B + j];
        if (!kv) continue;
        for (const [fa, wa] of ex[A]) for (const [fb, wb] of ex[B]) { const r = rows[3 * fa + i], c = 3 * fb + j; r.set(c, (r.get(c) || 0) + kv * wa * wb); }
      }
    }
  });
  const tAsm = Date.now() - t0;
  const X = (g) => { for (let mi = models.length - 1; mi >= 0; mi--) if (g >= off[mi]) return [...models[mi].X.slice(3 * (g - off[mi]), 3 * (g - off[mi]) + 3)]; };
  return {
    n, nf, nTied, worstOutside, tAsm, X, free, tieOf, rows, off,
    /** fixed: Set of free dofs held at 0; f: Float64Array(3 nf). → { u (3n, every node incl. tied), iters, ms } */
    solve(f, fixed) {
      const N = 3 * nf, t1 = Date.now();
      const ptr = new Int32Array(N + 1), cols = [], vals = [];
      for (let r = 0; r < N; r++) { for (const [c, v] of rows[r]) { if (fixed.has(r) || fixed.has(c)) continue; cols.push(c); vals.push(v); } if (fixed.has(r)) { cols.push(r); vals.push(1); } ptr[r + 1] = cols.length; }
      const C = Int32Array.from(cols), Vv = Float64Array.from(vals), diag = new Float64Array(N);
      for (let r = 0; r < N; r++) for (let k = ptr[r]; k < ptr[r + 1]; k++) if (C[k] === r) diag[r] = Vv[k];
      const mul = (x, y) => { for (let r = 0; r < N; r++) { let s = 0; for (let k = ptr[r]; k < ptr[r + 1]; k++) s += Vv[k] * x[C[k]]; y[r] = s; } };
      const b = Float64Array.from(f, (v, i) => (fixed.has(i) ? 0 : v));
      const x = new Float64Array(N), r = b.slice(), z = r.map((v, i) => v / diag[i]), p = z.slice(), Ap = new Float64Array(N);
      let rz = r.reduce((s, v, i) => s + v * z[i], 0), bn = Math.hypot(...b), it = 0;
      for (; it < 20000; it++) {
        mul(p, Ap);
        const a = rz / p.reduce((s, v, i) => s + v * Ap[i], 0);
        for (let i = 0; i < N; i++) { x[i] += a * p[i]; r[i] -= a * Ap[i]; }
        if (Math.hypot(...r) < 1e-11 * bn) break;
        for (let i = 0; i < N; i++) z[i] = r[i] / diag[i];
        const rz2 = r.reduce((s, v, i) => s + v * z[i], 0);
        for (let i = 0; i < N; i++) p[i] = z[i] + (rz2 / rz) * p[i];
        rz = rz2;
      }
      const u = new Float64Array(3 * n);
      for (let g = 0; g < n; g++) for (let d = 0; d < 3; d++) u[3 * g + d] = expand(g).reduce((s, [fa, w]) => s + w * x[3 * fa + d], 0);
      return { u, iters: it, ms: Date.now() - t1 };
    },
  };
}
/** Uniform traction t (vector) on the faces of model mi lying in plane axis = at: T6 midsides take a third of the area each. */
function traction(sys, models, mi, axis, at, t, f) {
  const m = models[mi];
  for (let k = 0; k < m.btri6.length / 6; k++) {
    const v = [...m.btri6.slice(6 * k, 6 * k + 6)];
    if (!v.every((a) => Math.abs(m.X[3 * a + axis] - at) < 1e-6)) continue;
    const p = v.slice(0, 3).map((a) => [...m.X.slice(3 * a, 3 * a + 3)]);
    const u = p[1].map((x, i) => x - p[0][i]), w = p[2].map((x, i) => x - p[0][i]);
    const area = Math.hypot(u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]) / 2;
    for (const a of v.slice(3)) { const fa = sys.free[sys.off[mi] + a]; for (let d = 0; d < 3; d++) f[3 * fa + d] += t[d] * area / 3; }
  }
}

// ---------------------------------------------------------------- A. the patch test (one material) and two materials
for (const [label, E1, E2, nu] of [['A1. one material (the patch test: exact if the tie is consistent)', 210000, 210000, 0.3], ['A2. steel + aluminium, ν 0.3 (the joint holds back the different Poisson contractions: 1-D δ is approximate)', 210000, 70000, 0.3], ['A3. steel + aluminium, ν 0 (no Poisson effect: 1-D δ exact again)', 210000, 70000, 0]]) {
  const L1 = 100, L2 = 100, b = 10, c = 10, sig = 100;
  const models = [tetOf(boxMesh(0, L1, b, c), H), tetOf(boxMesh(L1, L2, b, c), H * 0.77)];   // different sizes: non-matching
  const sys = bonded(models, [E1, E2], nu, [{ slave: 1, master: 0, plane: { axis: 0, at: L1 } }]);
  const fixed = new Set();
  for (let g = 0; g < sys.n; g++) {
    const p = sys.X(g), fa = sys.free[g];
    if (fa < 0) continue;
    if (Math.abs(p[0]) < 1e-6) fixed.add(3 * fa);         // x = 0: ux
    if (Math.abs(p[1]) < 1e-6) fixed.add(3 * fa + 1);     // y = 0: uy (symmetry)
    if (Math.abs(p[2]) < 1e-6) fixed.add(3 * fa + 2);     // z = 0: uz (symmetry)
  }
  const f = new Float64Array(3 * sys.nf);
  traction(sys, models, 1, 0, L1 + L2, [sig, 0, 0], f);
  const r = sys.solve(f, fixed);
  let tip = 0, k = 0, worstLin = 0;
  const exact = (x) => (x <= L1 ? sig * x / E1 : sig * L1 / E1 + sig * (x - L1) / E2);
  for (let g = 0; g < sys.n; g++) { const p = sys.X(g); worstLin = Math.max(worstLin, Math.abs(r.u[3 * g] - exact(p[0]))); if (Math.abs(p[0] - L1 - L2) < 1e-6) { tip += r.u[3 * g]; k++; } }
  tip /= k;
  console.log(`${label}\n   two bars bonded end to end (h ${H} / ${(H * 0.77).toFixed(2)}, non-matching): ${sys.n} nodes, ${sys.nTied} tied (worst outside a master face ${sys.worstOutside.toExponential(1)}), ${3 * sys.nf} dofs`);
  console.log(`   tip δ ${tip.toFixed(9)} mm vs σ(L1/E1 + L2/E2) = ${exact(L1 + L2).toFixed(9)} mm: rel. error ${(Math.abs(tip - exact(L1 + L2)) / exact(L1 + L2)).toExponential(2)}; worst |ux − exact| over every node ${worstLin.toExponential(2)} mm; CG ${r.iters} its, assembly ${sys.tAsm} ms, solve ${r.ms} ms`);
}

// ---------------------------------------------------------------- B. bending: two bonded halves vs one solid
{
  const L = 200, b = 20, c = 20, E = 70000, nu = 0.3, F = -1000;
  const one = [tetOf(boxMesh(0, L, b, c), H)];
  const two = [tetOf(boxMesh(0, L / 2, b, c), H), tetOf(boxMesh(L / 2, L / 2, b, c), H * 0.77)];   // non-matching at the joint
  const run = (models, ties) => {
    const sys = bonded(models, models.map(() => E), nu, ties);
    const fixed = new Set();
    for (let g = 0; g < sys.n; g++) { const p = sys.X(g), fa = sys.free[g]; if (fa >= 0 && Math.abs(p[0]) < 1e-6) for (let d = 0; d < 3; d++) fixed.add(3 * fa + d); }
    const f = new Float64Array(3 * sys.nf);
    traction(sys, models, models.length - 1, 0, L, [0, F / (b * c), 0], f);
    const r = sys.solve(f, fixed);
    let tip = 0, k = 0;
    for (let g = 0; g < sys.n; g++) { const p = sys.X(g); if (Math.abs(p[0] - L) < 1e-6) { tip += r.u[3 * g + 1]; k++; } }
    return { tip: tip / k, sys, r };
  };
  const a = run(one, []), bb = run(two, [{ slave: 1, master: 0, plane: { axis: 0, at: L / 2 } }]);
  const I = b * c ** 3 / 12, beam = F * L ** 3 / (3 * E * I), G = E / (2 * (1 + nu)), shear = F * L / (G * b * c * 5 / 6);
  console.log(`B. cantilever 200 × 20 × 20, tip load ${-F} N (h ${H}; the bonded halves ${H} / ${(H * 0.77).toFixed(2)}, non-matching): one solid ${a.tip.toFixed(6)} mm (${3 * a.sys.nf} dofs, ${a.r.ms} ms); two bonded halves ${bb.tip.toFixed(6)} mm (${3 * bb.sys.nf} dofs, ${bb.sys.nTied} tied, ${bb.r.ms} ms)`);
  console.log(`   difference ${(Math.abs(bb.tip - a.tip) / Math.abs(a.tip) * 100).toFixed(3)} %; Timoshenko beam ${(beam + shear).toFixed(6)} mm (one solid off by ${(Math.abs(a.tip - beam - shear) / Math.abs(beam + shear) * 100).toFixed(2)} %)`);
}

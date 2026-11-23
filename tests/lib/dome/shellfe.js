/* SPDX-License-Identifier: Apache-2.0 */
/**
 * shellfe.js — bending in a shell of revolution under loads that are the same all the way round (0.11 DOME.8). Host-free.
 *
 * Membrane theory (membrane.js) cannot say what happens where the shell is held: at the ring beam, where a stem wall meets the curve, where the
 * thickness changes. This solves the thin elastic shell properly for those cases with the classic conical-frustum element of a shell of revolution
 * (Grafton and Strome 1963; Zienkiewicz, The Finite Element Method, the chapter on axisymmetric shells): the meridian is cut into short straight
 * pieces, each node moves radially (u), vertically (w) and turns (β); along a piece the stretch is linear and the bending a cubic.
 *   strains      ε_s = dū/ds          ε_θ = u / r          κ_s = −d²w̄/ds²          κ_θ = −(cos α / r) dw̄/ds
 *   forces       N_s = C (ε_s + ν ε_θ)   N_θ = C (ε_θ + ν ε_s)   C = E t / (1 − ν²)
 *   moments      M_s = D (κ_s + ν κ_θ)   M_θ = D (κ_θ + ν κ_s)   D = E t³ / 12 (1 − ν²)
 * integrated over the ring 2π r ds with four Gauss points a piece. Units in: millimetres, MPa (N/mm²), loads in N/mm². Units out: N/mm (= kN/m)
 * for forces, N (= N·mm/mm; ×10⁻³ = kN·m/m) for moments, mm for movements.
 *
 * The tests check it against results that do not depend on this code: a long cylinder clamped at one end under internal pressure (Timoshenko,
 * Theory of Plates and Shells: edge moment p / 2β², edge shear p / β, β⁴ = 3 (1 − ν²) / R² t²), a pressurised sphere (N = pR / 2), and the
 * membrane forces of membrane.js away from the edges.
 *
 * LINEAR, ELASTIC, UNCRACKED. No cracking, creep, shrinkage or temperature; no buckling; nothing that varies round the dome (wind, earthquake,
 * openings). Figures for an engineer to start from.
 */

const GP = [[0.0694318442029737, 0.1739274225687269], [0.3300094782075719, 0.3260725774312731], [0.6699905217924281, 0.3260725774312731], [0.9305681557970263, 0.1739274225687269]];

/** The strain rows [ε_s, ε_θ, κ_s, κ_θ] × the six local movements [ū_i, w̄_i, β_i, ū_j, w̄_j, β_j] at ξ along a piece. */
function bAt(xi, L, r, ca, sa) {
  const H1 = 1 - 3 * xi * xi + 2 * xi ** 3, H2 = (xi - 2 * xi * xi + xi ** 3) * L, H3 = 3 * xi * xi - 2 * xi ** 3, H4 = (-xi * xi + xi ** 3) * L;
  const dH1 = (-6 * xi + 6 * xi * xi) / L, dH2 = 1 - 4 * xi + 3 * xi * xi, dH3 = (6 * xi - 6 * xi * xi) / L, dH4 = -2 * xi + 3 * xi * xi;
  const ddH1 = (-6 + 12 * xi) / (L * L), ddH2 = (-4 + 6 * xi) / L, ddH3 = (6 - 12 * xi) / (L * L), ddH4 = (-2 + 6 * xi) / L;
  const N1 = 1 - xi, N2 = xi;
  return [
    [-1 / L, 0, 0, 1 / L, 0, 0],
    [(N1 * ca) / r, (-H1 * sa) / r, (-H2 * sa) / r, (N2 * ca) / r, (-H3 * sa) / r, (-H4 * sa) / r],
    [0, -ddH1, -ddH2, 0, -ddH3, -ddH4],
    [0, (-ca * dH1) / r, (-ca * dH2) / r, 0, (-ca * dH3) / r, (-ca * dH4) / r],
  ];
}
/** Local movements from the global ones of a piece's two nodes: ū = u cos α + w sin α, w̄ = −u sin α + w cos α, β as it is. */
function toLocal(g, ca, sa) { return [g[0] * ca + g[1] * sa, -g[0] * sa + g[1] * ca, g[2], g[3] * ca + g[4] * sa, -g[3] * sa + g[4] * ca, g[5]]; }

/**
 * Solve a shell of revolution.
 *   nodes: [{ r, z, t }] along the meridian (mm), in order; a node with r = 0 is on the axis.
 *   E (MPa), nu.
 *   loads: [(r, z, ca, sa, t) → [p_r, p_z]] load per area of shell in N/mm², radial outward and upward positive; one entry per load case.
 *   fix: { [node index]: { u?: true, w?: true, b?: true } } movements held; springs: [{ node, u?: k, w?: k, b?: k }] stiffness per whole ring (N/mm or N·mm).
 * → one result per load case: { u: [[u, w, β] per node], pieces: [{ r, z, t, Ns, Nt, Ms, Mt } at the middle of each piece], ends: [[at node i, at node j]
 *   per piece, same fields], reactions: { [node index]: [R_u, R_w, R_β] per unit length of the ring: N/mm, N/mm, N } }.
 * Moments: positive M_s stretches the face on the left of the direction the nodes run in (see dome.js for which face that is).
 */
export function solveAxi({ nodes, E, nu = 0.2, loads, fix = {}, springs = [] }) {
  const n = nodes.length, dof = 3 * n, hb = 5;   // half bandwidth: a piece joins two neighbouring nodes
  const K = new Float64Array(dof * (hb + 1));    // band storage, lower: K[i*(hb+1) + (i - j)] for j ≤ i
  const kAdd = (i, j, v) => { if (j > i) return; K[i * (hb + 1) + (i - j)] += v; };
  const F = loads.map(() => new Float64Array(dof));
  const el = [];
  for (let e = 0; e < n - 1; e++) {
    const a = nodes[e], b = nodes[e + 1], L = Math.hypot(b.r - a.r, b.z - a.z), ca = (b.r - a.r) / L, sa = (b.z - a.z) / L;
    el.push({ L, ca, sa });
    const ke = Array.from({ length: 6 }, () => new Float64Array(6)), fe = loads.map(() => new Float64Array(6));
    for (const [xi, wt] of GP) {
      const r = a.r + xi * (b.r - a.r), z = a.z + xi * (b.z - a.z), t = a.t + xi * (b.t - a.t);
      const C = (E * t) / (1 - nu * nu), Dm = (E * t ** 3) / (12 * (1 - nu * nu)), B = bAt(xi, L, r, ca, sa), w = wt * L * 2 * Math.PI * r;
      for (let p = 0; p < 6; p++) for (let q = 0; q <= p; q++) {
        const v = C * (B[0][p] * B[0][q] + B[1][p] * B[1][q] + nu * (B[0][p] * B[1][q] + B[1][p] * B[0][q])) + Dm * (B[2][p] * B[2][q] + B[3][p] * B[3][q] + nu * (B[2][p] * B[3][q] + B[3][p] * B[2][q]));
        ke[p][q] += v * w;
      }
      // consistent loads: the local movement shapes times the load's local parts
      const H = [1 - 3 * xi * xi + 2 * xi ** 3, (xi - 2 * xi * xi + xi ** 3) * L, 3 * xi * xi - 2 * xi ** 3, (-xi * xi + xi ** 3) * L];
      loads.forEach((fn, c) => {
        const [pr, pz] = fn(r, z, ca, sa, t), ps = pr * ca + pz * sa, pn = -pr * sa + pz * ca;
        fe[c][0] += (1 - xi) * ps * w; fe[c][3] += xi * ps * w;
        fe[c][1] += H[0] * pn * w; fe[c][2] += H[1] * pn * w; fe[c][4] += H[2] * pn * w; fe[c][5] += H[3] * pn * w;
      });
    }
    for (let p = 0; p < 6; p++) for (let q = p + 1; q < 6; q++) ke[p][q] = ke[q][p];
    // turn to global: T maps global → local, K_g = Tᵀ K_l T
    const T = Array.from({ length: 6 }, () => new Float64Array(6));
    for (const o of [0, 3]) { T[o][o] = ca; T[o][o + 1] = sa; T[o + 1][o] = -sa; T[o + 1][o + 1] = ca; T[o + 2][o + 2] = 1; }
    const kt = Array.from({ length: 6 }, () => new Float64Array(6));
    for (let p = 0; p < 6; p++) for (let q = 0; q < 6; q++) { let s = 0; for (let m = 0; m < 6; m++) s += ke[p][m] * T[m][q]; kt[p][q] = s; }
    for (let p = 0; p < 6; p++) for (let q = 0; q < 6; q++) { let s = 0; for (let m = 0; m < 6; m++) s += T[m][p] * kt[m][q]; kAdd(3 * e + p, 3 * e + q, s); }
    loads.forEach((_, c) => { for (let p = 0; p < 6; p++) { let s = 0; for (let m = 0; m < 6; m++) s += T[m][p] * fe[c][m]; F[c][3 * e + p] += s; } });
  }
  for (const sp of springs) for (const [k, off] of [['u', 0], ['w', 1], ['b', 2]]) if (sp[k] > 0) kAdd(3 * sp.node + off, 3 * sp.node + off, sp[k]);
  // held movements: nodes on the axis cannot move sideways or turn
  const held = new Uint8Array(dof);
  nodes.forEach((nd, i) => { if (nd.r < 1e-9) { held[3 * i] = 1; held[3 * i + 2] = 1; } });
  for (const [i, f] of Object.entries(fix)) { if (f.u) held[3 * i] = 1; if (f.w) held[3 * i + 1] = 1; if (f.b) held[3 * i + 2] = 1; }
  const Kfree = Float64Array.from(K);
  for (let i = 0; i < dof; i++) if (held[i]) {
    for (let j = Math.max(0, i - hb); j <= Math.min(dof - 1, i + hb); j++) { if (j <= i) Kfree[i * (hb + 1) + (i - j)] = 0; else Kfree[j * (hb + 1) + (j - i)] = 0; }
    Kfree[i * (hb + 1)] = 1;
  }
  // banded Cholesky (L Lᵀ), then one forward and back pass per load case
  const Lb = Kfree;
  for (let i = 0; i < dof; i++) {
    for (let j = Math.max(0, i - hb); j <= i; j++) {
      let s = Lb[i * (hb + 1) + (i - j)];
      for (let k = Math.max(0, i - hb, j - hb); k < j; k++) s -= Lb[i * (hb + 1) + (i - k)] * Lb[j * (hb + 1) + (j - k)];
      if (i === j) { if (!(s > 0)) throw new Error('shell: the model is not held'); Lb[i * (hb + 1)] = Math.sqrt(s); } else Lb[i * (hb + 1) + (i - j)] = s / Lb[j * (hb + 1)];
    }
  }
  return loads.map((_, c) => {
    const x = Float64Array.from(F[c]);
    for (let i = 0; i < dof; i++) if (held[i]) x[i] = 0;
    for (let i = 0; i < dof; i++) { let s = x[i]; for (let k = Math.max(0, i - hb); k < i; k++) s -= Lb[i * (hb + 1) + (i - k)] * x[k]; x[i] = s / Lb[i * (hb + 1)]; }
    for (let i = dof - 1; i >= 0; i--) { let s = x[i]; for (let k = i + 1; k <= Math.min(dof - 1, i + hb); k++) s -= Lb[k * (hb + 1) + (k - i)] * x[k]; x[i] = s / Lb[i * (hb + 1)]; }
    // reactions at held movements: K u − F, per unit length of the ring
    const reactions = {};
    for (let i = 0; i < dof; i++) if (held[i] && nodes[Math.floor(i / 3)].r > 1e-9) {
      let s = -F[c][i];
      for (let j = Math.max(0, i - hb); j <= Math.min(dof - 1, i + hb); j++) s += (j <= i ? K[i * (hb + 1) + (i - j)] : K[j * (hb + 1) + (j - i)]) * x[j];
      const nd = Math.floor(i / 3); (reactions[nd] ||= [0, 0, 0])[i % 3] = s / (2 * Math.PI * nodes[nd].r);
    }
    const at = (e, xi) => {
      const a = nodes[e], b = nodes[e + 1], { L, ca, sa } = el[e], r = Math.max(a.r + xi * (b.r - a.r), 1e-6), t = a.t + xi * (b.t - a.t);
      const d = toLocal([x[3 * e], x[3 * e + 1], x[3 * e + 2], x[3 * e + 3], x[3 * e + 4], x[3 * e + 5]], ca, sa), B = bAt(xi, L, r, ca, sa);
      const s = B.map((row) => row.reduce((acc, v, k) => acc + v * d[k], 0));
      const C = (E * t) / (1 - nu * nu), Dm = (E * t ** 3) / (12 * (1 - nu * nu));
      return { r, z: a.z + xi * (b.z - a.z), t, Ns: C * (s[0] + nu * s[1]), Nt: C * (s[1] + nu * s[0]), Ms: Dm * (s[2] + nu * s[3]), Mt: Dm * (s[3] + nu * s[2]) };
    };
    const pieces = [], ends = [];
    for (let e = 0; e < n - 1; e++) { pieces.push(at(e, 0.5)); ends.push([at(e, nodes[e].r < 1e-9 ? 0.02 : 0), at(e, nodes[e + 1].r < 1e-9 ? 0.98 : 1)]); }
    return { u: Array.from({ length: n }, (_, i) => [x[3 * i], x[3 * i + 1], x[3 * i + 2]]), pieces, ends, reactions };
  });
}

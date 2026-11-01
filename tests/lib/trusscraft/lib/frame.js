/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame.js — a small 2D direct-stiffness solver (DOM-free; pure), for the one truss the method of joints cannot hold: the attic truss, whose room
 * (floor, knee walls, ceiling tie) is a rectangle. With the room's corner joints stated RIGID the frame is stable; the web and chord members stay pinned.
 *   solveFrame(g, loads, { beams: Set(member ids), size: (m) => {b, d}, E (MPa), supports, fixity: 'rigid' | spring kN·m/rad, wBeam: Map(id → kN/m down) })
 *     → { status: 'ok' | 'unstable', forces: Map (axial, + tension), moments: Map (kN·m, the largest of the ends and the span), reactions }
 * Units inside: kN, mm, E in kN/mm². Beam: Euler-Bernoulli (axial + bending). Everything else: axial bars. The fixity is the person's statement; it is
 * not a plate property and the add-on says so wherever it uses this solver.
 */
import { gauss } from './analysis.js';

export function solveFrame(g, loads, { beams = new Set(), size, E, fixity = 'rigid', wBeam = new Map() } = {}) {
  const ms = g.members.filter((m) => m.role !== 'tail' && m.role !== 'stub');
  const used = [...new Set(ms.flatMap((m) => [m.a, m.b]))].sort((a, b) => a - b), ix = new Map(used.map((id, i) => [id, i])), n = used.length, N = 3 * n;
  const K = Array.from({ length: N }, () => new Array(N).fill(0)), F = new Array(N).fill(0), Ee = E / 1000;
  const hasBeam = new Set();
  const spring = fixity === 'rigid' ? null : Number(fixity);
  const info = new Map();
  for (const m of ms) {
    const A = g.nodes[m.a], B = g.nodes[m.b], L = m.len, c = (B.x - A.x) / L, s = (B.z - A.z) / L, sz = size(m), EA = Ee * sz.b * sz.d, EI = Ee * sz.b * Math.pow(sz.d, 3) / 12;
    const dofs = [3 * ix.get(m.a), 3 * ix.get(m.a) + 1, 3 * ix.get(m.a) + 2, 3 * ix.get(m.b), 3 * ix.get(m.b) + 1, 3 * ix.get(m.b) + 2];
    let k;
    const isBeam = beams.has(m.id);
    if (isBeam) {
      hasBeam.add(m.a); hasBeam.add(m.b);
      const a = EA / L, b = 12 * EI / L ** 3, cc = 6 * EI / (L * L), d = 4 * EI / L, e = 2 * EI / L;
      k = [[a, 0, 0, -a, 0, 0], [0, b, cc, 0, -b, cc], [0, cc, d, 0, -cc, e], [-a, 0, 0, a, 0, 0], [0, -b, -cc, 0, b, -cc], [0, cc, e, 0, -cc, d]];
    } else {
      const a = EA / L;
      k = [[a, 0, 0, -a, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [-a, 0, 0, a, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
    }
    const T = [[c, s, 0, 0, 0, 0], [-s, c, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0], [0, 0, 0, c, s, 0], [0, 0, 0, -s, c, 0], [0, 0, 0, 0, 0, 1]];
    const KG = Array.from({ length: 6 }, () => new Array(6).fill(0));
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { let v = 0; for (let p = 0; p < 6; p++) for (let q = 0; q < 6; q++) v += T[p][i] * k[p][q] * T[q][j]; KG[i][j] = v; }
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) K[dofs[i]][dofs[j]] += KG[i][j];
    const w = isBeam ? (wBeam.get(m.id) || 0) : 0;   // kN/m down on a level beam (the floor and the ceiling tie)
    let fe = [0, 0, 0, 0, 0, 0];
    if (w && Math.abs(s) < 1e-6) { const wl = w / 1000; fe = [0, -wl * L / 2, -wl * L * L / 12, 0, -wl * L / 2, wl * L * L / 12]; for (let i = 0; i < 6; i++) F[dofs[i]] += fe[i]; }
    info.set(m.id, { m, dofs, k, T, isBeam, L, EA, w, fe });
  }
  for (const [id, v] of loads) {
    if (!ix.has(id)) continue;
    if (typeof v === 'number') F[3 * ix.get(id) + 1] -= v; else { F[3 * ix.get(id)] += v.fx || 0; F[3 * ix.get(id) + 1] += v.fz || 0; }
  }
  // joint fixity: a beam end that meets other members at a joint with a stated spring is not built here; 'rigid' is the shared rotation dof. A spring
  // (kN·m/rad) is added between the beam ends and ground-free rotation: represented as a rotational stiffness on the joint (a lower bound of fixity).
  if (spring !== null && Number.isFinite(spring) && spring > 0) for (const id of hasBeam) K[3 * ix.get(id) + 2][3 * ix.get(id) + 2] += spring * 1000;
  const [s0, s1] = g.supports, fixed = new Set();
  fixed.add(3 * ix.get(s0)); fixed.add(3 * ix.get(s0) + 1); fixed.add(3 * ix.get(s1) + 1);
  for (const id of used) if (!hasBeam.has(id)) fixed.add(3 * ix.get(id) + 2);
  const free = []; for (let i = 0; i < N; i++) if (!fixed.has(i)) free.push(i);
  const Kf = free.map((i) => free.map((j) => K[i][j])), Ff = free.map((i) => F[i]);
  const d = gauss(Kf, Ff);
  if (!d) return { status: 'unstable', forces: new Map(), moments: new Map(), reactions: null };
  const D = new Array(N).fill(0); free.forEach((i, j) => { D[i] = d[j]; });
  const forces = new Map(), moments = new Map();
  for (const [id, e] of info) {
    const dl = e.T.map((row) => row.reduce((acc, t, j) => acc + t * D[e.dofs[j]], 0));
    const f = e.k.map((row) => row.reduce((acc, kk, j) => acc + kk * dl[j], 0));
    // end forces in local axes (the fixed-end part removed): axial = -f[0] at a end, tension positive
    forces.set(id, e.EA / e.L * (dl[3] - dl[0]));
    if (e.isBeam) {
      const feL = e.fe.map((_, i) => 0); void feL;
      const Ma = f[2] + (e.w && Math.abs(e.T[0][1]) < 1e-6 ? e.w / 1000 * e.L * e.L / 12 : 0), Mb = f[5] - (e.w && Math.abs(e.T[0][1]) < 1e-6 ? e.w / 1000 * e.L * e.L / 12 : 0);
      let M = Math.max(Math.abs(Ma), Math.abs(Mb));
      if (e.w) M = Math.max(M, Math.abs((e.w / 1000) * e.L * e.L / 8 - (Math.abs(Ma) + Math.abs(Mb)) / 2));
      moments.set(id, M / 1000);
    }
  }
  const reac = (i) => { let v = -F[i]; for (let j = 0; j < N; j++) v += K[i][j] * D[j]; return v; };
  const rl = [reac(3 * ix.get(s0)), reac(3 * ix.get(s0) + 1)], rr = [0, reac(3 * ix.get(s1) + 1)];
  return { status: 'ok', forces, moments, reactions: { left: rl, right: rr }, displacement: D };
}

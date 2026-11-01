/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plate-solve.js — the frame solver with plates (slabs, walls) and rigid floor diaphragms (0.8 SU.1056 steps 1–2). DOM-free.
 * frame-solve.js hands a model over here only when it has plates or diaphragms (`hasShell`), and passes its own internals
 * (member matrices, releases, load pieces, numbering), so members behave exactly as in a frame-only run. A frame-only model
 * never comes here: its numbers stay byte for byte what they were. An analysis aid, not a code check.
 *
 * Method, beyond frame-solve.js:
 *   - plates: the 24-dof flat shell of plate.js (MITC4 bending + incompatible-mode membrane), added to K corner by corner;
 *     a uniform pressure becomes corner forces ∫ Nᵢ p dA (consistent for a Mindlin plate: rotations are independent of w);
 *     plate own weight = ρ g t per area along −Z;
 *   - rigid diaphragms by master–slave constraints, exact (no penalty): each node of a floor keeps uz, rx, ry; its ux, uy, rz
 *     follow the master point (xm, ym):  ux = Ux − (y − ym) Rz,  uy = Uy + (x − xm) Rz,  rz = Rz  (E. L. Wilson, Three-
 *     Dimensional Static and Dynamic Analysis of Structures, 3rd ed., CSI 2002, ch. 6 "Rigid diaphragms"); K and the loads
 *     are assembled through that map (Cᵀ K C), the displacements recovered from it;
 *   - numbering: reverse Cuthill–McKee on the nodes (frame-solve's), each floor's three master unknowns placed right after
 *     the last node they couple to; K stored as a skyline (variable band) and factorised by Cholesky in place, so a floor's
 *     long master rows cost only their own length;
 *   - a rotation no member and no plate at an angle stiffens (the normal of a flat slab or wall) is held exactly, as the frame
 *     solver's idle-rotation rule (no warning for nodes that only plates meet: that is how flat shells are);
 *   - plate results: resultants at the centre (plateResultants) and smoothed corner values (Gauss points extrapolated,
 *     averaged over the plates that share a node and lie in one plane) for the moment contours.
 *
 *   hasShell(model) · prepareShell(model, X) · runShellSet(prep, set, X) · combineShell(prep, list, out)
 *   plateCentre(prep, R, k) → [Nx Ny Nxy Mx My Mxy Qx Qy] of plate k (also R.plates, 8 per plate)
 *   plateNodeResults(prep, R) → Map node index → [8] averaged corner values (plates with the same axes only)
 *   storyDrifts(prep, R) → [{ id, name, z, h, below, U: [Ux, Uy, Rz], dx, dy, ratioX, ratioY, maxX, maxY }] lowest first;
 *     drift = this floor's movement minus the floor below moved rigidly to the same point (the base: zero); max over the
 *     floor's nodes (corners, where torsion adds), ratio = drift / storey height
 */
import { nodeIndex, axesOf, G_ACC } from './frame-model.js';
import { plateStiffness, toLocal, plateResultants, plateGaussResultants, extrapolate, cornerAreas, gaussPoints } from './plate.js';

export const hasShell = (model) => !!(model.plates?.length || model.diaphragms?.length);

export function prepareShell(model, X) {
  const warnings = [];
  const nn = model.nodes.length, M = model.members.length, plates = model.plates || [], dias = model.diaphragms || [];
  if (!M && !plates.length) return { error: { code: 'empty' }, warnings };
  if (!model.supports.length) return { error: { code: 'no-supports' }, warnings };
  const idx = nodeIndex(model);
  const P = model.nodes.map((n) => [n.x, n.y, n.z]);
  const secs = new Map(model.sections.map((s) => [s.id, s])), mats = new Map(model.materials.map((m) => [m.id, m]));
  const mem = [], adj = Array.from({ length: nn }, () => []);
  const link = (a, b) => { if (a !== b && !adj[a].includes(b)) { adj[a].push(b); adj[b].push(a); } };
  const hasMember = new Uint8Array(nn);
  for (const m of model.members) {
    const i = idx.get(m.i), j = idx.get(m.j), s = secs.get(m.section), mt = mats.get(m.material);
    const ax = axesOf(P[i], P[j], m.roll || 0);
    const k0 = X.localK(mt.E, mt.G, s.A, s.Iy, s.Iz, s.J, ax.L);
    const rel = [];
    m.rel.i.forEach((r, d) => r && rel.push(d));
    m.rel.j.forEach((r, d) => r && rel.push(6 + d));
    const c = X.condense(k0, rel);
    if (!c) return { error: { code: 'release-unstable', member: m.id }, warnings };
    const T = [...ax.ex, ...ax.ey, ...ax.ez];
    const kg = new Float64Array(144);
    for (let bi = 0; bi < 4; bi++) for (let bj = 0; bj < 4; bj++) {
      for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) {
        let s2 = 0;
        for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) s2 += T[a * 3 + r] * c.k[(bi * 3 + a) * 12 + bj * 3 + b] * T[b * 3 + q];
        kg[(bi * 3 + r) * 12 + bj * 3 + q] = s2;
      }
    }
    mem.push({ id: m.id, i, j, ax, T, c, kg, E: mt.E, G: mt.G, rho: mt.rho, A: s.A, Iy: s.Iy, Iz: s.Iz, J: s.J });
    hasMember[i] = 1; hasMember[j] = 1;
    link(i, j);
  }
  const pl = [];
  for (const p of plates) {
    const mt = mats.get(p.material);
    const nu = mt.E / (2 * mt.G) - 1;
    if (!(nu > -0.999 && nu < 0.4999)) return { error: { code: 'plate-material', plate: p.id }, warnings };
    const pts = p.nodes.map((id) => P[idx.get(id)]);
    const el = plateStiffness(pts, mt.E, nu, p.t);
    const nodes = el.ax.order.map((k) => idx.get(p.nodes[k]));
    if (el.ax.warp > 0.01 * Math.sqrt(el.ax.area)) warnings.push({ code: 'plate-warp', plate: p.id, warp: Math.round(el.ax.warp * 100) / 100 });
    pl.push({ id: p.id, nodes, el, rho: mt.rho, t: p.t, ca: cornerAreas(el.ax) });
    for (const a of nodes) for (const b of nodes) link(a, b);
  }
  // supports
  const held = new Uint8Array(6 * nn), spring = new Float64Array(6 * nn);
  for (const s of model.supports) {
    const n = idx.get(s.node);
    for (let d = 0; d < 6; d++) { if (s.fix[d]) held[6 * n + d] = 1; else if (s.k) spring[6 * n + d] = s.k[d]; }
  }
  // diaphragms: slave map; a node held (or on a spring) in ux, uy or rz is left out of its floor
  const slave = new Array(nn).fill(null);
  const floors = [];
  dias.forEach((d) => {
    const nodes = [];
    for (const id of d.nodes) {
      const n = idx.get(id);
      if ([0, 1, 5].some((k) => held[6 * n + k] || spring[6 * n + k])) { warnings.push({ code: 'diaphragm-support', diaphragm: d.id, node: id }); continue; }
      nodes.push(n);
    }
    if (!nodes.length) { warnings.push({ code: 'diaphragm-empty', diaphragm: d.id }); return; }
    const xm = d.master ? d.master.x : nodes.reduce((s, n) => s + P[n][0], 0) / nodes.length;
    const ym = d.master ? d.master.y : nodes.reduce((s, n) => s + P[n][1], 0) / nodes.length;
    const f = { id: d.id, name: d.name, z: d.z, nodes, xm, ym, k: floors.length };
    for (const n of nodes) slave[n] = { f, dx: P[n][0] - xm, dy: P[n][1] - ym };
    floors.push(f);
  });
  const tied = (q) => { const s = slave[Math.floor(q / 6)]; const d = q % 6; return !!s && (d === 0 || d === 1 || d === 5); };
  const touched = new Uint8Array(nn);
  for (const e of mem) { touched[e.i] = 1; touched[e.j] = 1; }
  for (const p of pl) for (const n of p.nodes) touched[n] = 1;
  // idle dofs, as frame-solve: diagonal and the rotation block per node, members and plates together
  const diag = new Float64Array(6 * nn), rotBlock = Array.from({ length: nn }, () => new Float64Array(9));
  const addBlocks = (nodes, kg, size) => nodes.forEach((n, c) => {
    for (let a = 0; a < 6; a++) diag[6 * n + a] += Math.abs(kg[(6 * c + a) * size + 6 * c + a]);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) rotBlock[n][a * 3 + b] += kg[(6 * c + 3 + a) * size + 6 * c + 3 + b];
  });
  for (const e of mem) addBlocks([e.i, e.j], e.kg, 12);
  for (const p of pl) addBlocks(p.nodes, p.el.kg, 24);
  const idle = new Uint8Array(6 * nn);
  let maxT = 0, maxR = 0;
  for (let q = 0; q < 6 * nn; q++) if (q % 6 < 3) maxT = Math.max(maxT, diag[q]); else maxR = Math.max(maxR, diag[q]);
  const rotSprings = [];
  for (let n = 0; n < nn; n++) {
    if (!touched[n]) continue;
    for (let d = 0; d < 3; d++) {
      const q = 6 * n + d;
      if (!held[q] && !tied(q) && diag[q] + spring[q] <= 1e-14 * maxT) { idle[q] = 1; warnings.push({ code: 'idle-dof', node: model.nodes[n].id, dof: d }); }
    }
    const blk = Float64Array.from(rotBlock[n]);
    for (let d = 0; d < 3; d++) { if (held[6 * n + 3 + d] || tied(6 * n + 3 + d)) blk[d * 4] += maxR || 1; else blk[d * 4] += spring[6 * n + 3 + d]; }
    const { values, vectors } = X.eigSym3(blk);
    for (let k = 0; k < 3; k++) {
      if (values[k] > 1e-10 * (maxR || 1)) continue;
      const v = vectors[k];
      rotSprings.push({ n, v, s: maxR || 1 });
      if (hasMember[n]) {
        const dof = [0, 1, 2].reduce((b, a) => (Math.abs(v[a]) > Math.abs(v[b]) ? a : b), 0);
        warnings.push({ code: 'idle-rotation', node: model.nodes[n].id, dof: 3 + dof, axis: v.map((x) => Math.round(x * 1e6) / 1e6) });
      }
    }
  }
  // numbering: nodes by RCM, each floor's masters after the last node coupled to it
  const order = X.rcm(nn, adj);
  const pos = new Int32Array(nn).fill(-1);
  order.forEach((nd, k) => { pos[nd] = k; });
  const after = new Map();
  for (const f of floors) {
    let last = -1;
    for (const n of f.nodes) { last = Math.max(last, pos[n]); for (const w of adj[n]) last = Math.max(last, pos[w]); }
    if (!after.has(last)) after.set(last, []);
    after.get(last).push(f);
  }
  const eq = new Int32Array(6 * nn).fill(-1), meq = new Int32Array(3 * floors.length).fill(-1);
  const dofOf = [];
  let n = 0;
  const emitMasters = (k) => { for (const f of after.get(k) || []) for (let a = 0; a < 3; a++) { meq[3 * f.k + a] = n++; dofOf.push({ floor: f, a }); } };
  emitMasters(-1);
  order.forEach((nd, k) => {
    for (let d = 0; d < 6; d++) { const q = 6 * nd + d; if (!held[q] && !idle[q] && !tied(q)) { eq[q] = n++; dofOf.push({ q }); } }
    emitMasters(k);
  });
  for (let q = 0; q < nn; q++) if (!touched[q] && model.supports.every((s) => idx.get(s.node) !== q)) warnings.push({ code: 'loose-node', node: model.nodes[q].id });
  /** global dof → [[eq, coef], …] */
  const map = (q) => {
    if (eq[q] >= 0) return [[eq[q], 1]];
    if (!tied(q)) return [];
    const s = slave[Math.floor(q / 6)], b = 3 * s.f.k, d = q % 6;
    if (d === 0) return [[meq[b], 1], [meq[b + 2], -s.dy]];
    if (d === 1) return [[meq[b + 1], 1], [meq[b + 2], s.dx]];
    return [[meq[b + 2], 1]];
  };
  const maps = Array.from({ length: 6 * nn }, (_, q) => map(q));
  const elDofs = (nodes) => { const out = []; for (const nd of nodes) for (let d = 0; d < 6; d++) out.push(maps[6 * nd + d]); return out; };
  const memMaps = mem.map((e) => elDofs([e.i, e.j])), plMaps = pl.map((p) => elDofs(p.nodes));
  // skyline profile
  const first = new Int32Array(n);
  for (let i = 0; i < n; i++) first[i] = i;
  const touch = (lists) => {
    let lo = Infinity, list = [];
    for (const m of lists) for (const [e] of m) { list.push(e); if (e < lo) lo = e; }
    for (const e of list) if (lo < first[e]) first[e] = lo;
  };
  memMaps.forEach(touch); plMaps.forEach(touch);
  for (const { n: nd } of rotSprings) touch([3, 4, 5].map((d) => maps[6 * nd + d]));
  for (let q = 0; q < 6 * nn; q++) if (spring[q] && maps[q].length) touch([maps[q]]);
  const ptr = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) ptr[i + 1] = ptr[i] + (i - first[i] + 1);
  const K = new Float64Array(ptr[n]);
  const at = (i, j) => ptr[i] + (j - first[i]);                   // j ≤ i
  const assemble = (lists, k, size) => {
    for (let p = 0; p < size; p++) {
      const mp = lists[p];
      if (!mp.length) continue;
      for (let q = 0; q < size; q++) {
        const mq = lists[q], v = k[p * size + q];
        if (!mq.length || !v) continue;
        for (const [ea, ca] of mp) for (const [eb, cb] of mq) if (eb <= ea) K[at(ea, eb)] += ca * cb * v;
      }
    }
  };
  mem.forEach((e, m) => assemble(memMaps[m], e.kg, 12));
  pl.forEach((p, m) => assemble(plMaps[m], p.el.kg, 24));
  for (let q = 0; q < 6 * nn; q++) if (spring[q]) for (const [ea, ca] of maps[q]) for (const [eb, cb] of maps[q]) if (eb <= ea) K[at(ea, eb)] += ca * cb * spring[q];
  for (const { n: nd, v, s } of rotSprings) {
    const lists = [3, 4, 5].map((d) => maps[6 * nd + d]);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (const [ea, ca] of lists[a]) for (const [eb, cb] of lists[b]) if (eb <= ea) K[at(ea, eb)] += ca * cb * s * v[a] * v[b];
  }
  // skyline Cholesky in place
  for (let i = 0; i < n; i++) {
    const fi = first[i];
    for (let j = fi; j <= i; j++) {
      const fj = first[j];
      let s = K[at(i, j)];
      const kii = s;
      for (let k = Math.max(fi, fj); k < j; k++) s -= K[at(i, k)] * K[at(j, k)];
      if (j < i) K[at(i, j)] = s / K[at(j, j)];
      else {
        if (!(s > X.PIVOT_TOL * Math.abs(kii)) || !(kii > 0)) {
          const w = dofOf[i];
          if (w.q !== undefined) return { error: { code: 'mechanism', node: model.nodes[Math.floor(w.q / 6)].id, dof: w.q % 6 }, warnings };
          return { error: { code: 'mechanism', node: model.nodes[w.floor.nodes[0]].id, dof: [0, 1, 5][w.a], diaphragm: w.floor.id }, warnings };
        }
        K[at(i, i)] = Math.sqrt(s);
      }
    }
  }
  const shell = { pl, floors, maps, meq, first, ptr, at };
  return { model, warnings, mem, idx, P, nn, n, band: 0, B: 0, L: K, eq, held, idle, spring, edofs: null, rotSprings, shell };
}

function solveSky(prep, f) {
  const { n, L } = prep, { first, at } = prep.shell;
  const y = Float64Array.from(f);
  for (let i = 0; i < n; i++) { let s = y[i]; for (let k = first[i]; k < i; k++) s -= L[at(i, k)] * y[k]; y[i] = s / L[at(i, i)]; }
  for (let i = n - 1; i >= 0; i--) { y[i] /= L[at(i, i)]; const xi = y[i]; for (let k = first[i]; k < i; k++) y[k] -= L[at(i, k)] * xi; }
  return y;
}

export function runShellSet(prep, set, X) {
  const { mem, nn, n, model } = prep, { pl, maps, floors, meq } = prep.shell;
  // members and nodes as frame-solve; area loads and plate own weight here
  const entries = set.entries.map(({ c, f }) => ({ c: { ...c, loads: c.loads.filter((l) => l.type !== 'area') }, f }));
  const { nodeF, memLoads } = X.loadSet(prep, entries);
  const pIdx = new Map(model.plates?.map((p, k) => [p.id, k]) || []);
  const plateLoads = (k, vec) => { const p = pl[k]; p.nodes.forEach((nd, c) => { for (let a = 0; a < 3; a++) nodeF[6 * nd + a] += p.ca[c] * vec[a]; }); };
  for (const { c, f } of set.entries) {
    if (c.selfWeight) pl.forEach((p, k) => { const w = -c.selfWeight * f * p.rho * 1e-9 * G_ACC * p.t; if (w) plateLoads(k, [0, 0, w]); });
    for (const l of c.loads) {
      if (l.type !== 'area') continue;
      const k = pIdx.get(l.plate), ax = pl[k].el.ax;
      const g = l.dir === 'X' ? [1, 0, 0] : l.dir === 'Y' ? [0, 1, 0] : l.dir === 'Z' ? [0, 0, 1] : ax.ez;
      plateLoads(k, g.map((x) => x * l.p * f));
    }
  }
  const pc = mem.map((e, k) => {
    const p = new Float64Array(12);
    for (const pz of memLoads[k]) X.equivalentLoads(pz, e.ax.L, p);
    return { p, cp: X.condenseLoads(e.c, p) };
  });
  const Fg = Float64Array.from(nodeF);
  mem.forEach((e, k) => {
    const cp = pc[k].cp;
    for (let blk = 0; blk < 4; blk++) for (let r = 0; r < 3; r++) {
      let s = 0;
      for (let a = 0; a < 3; a++) s += e.T[a * 3 + r] * cp[blk * 3 + a];
      Fg[6 * (blk < 2 ? e.i : e.j) + (blk % 2) * 3 + r] += s;
    }
  });
  for (let q = 0; q < 6 * nn; q++) if (prep.idle[q] && Math.abs(Fg[q]) > 1e-9) return { error: { code: 'mechanism', node: model.nodes[Math.floor(q / 6)].id, dof: q % 6 } };
  for (const { n: nd, v } of prep.rotSprings) {
    const m = v[0] * Fg[6 * nd + 3] + v[1] * Fg[6 * nd + 4] + v[2] * Fg[6 * nd + 5];
    if (Math.abs(m) > 1e-6) return { error: { code: 'mechanism', node: model.nodes[nd].id, dof: 3 + [0, 1, 2].reduce((b, a) => (Math.abs(v[a]) > Math.abs(v[b]) ? a : b), 0) } };
  }
  const F = new Float64Array(n);
  for (let q = 0; q < 6 * nn; q++) if (Fg[q]) for (const [e, c] of maps[q]) F[e] += c * Fg[q];
  const x = solveSky(prep, F);
  const u = new Float64Array(6 * nn);
  for (let q = 0; q < 6 * nn; q++) { let s = 0; for (const [e, c] of maps[q]) s += c * x[e]; u[q] = s; }
  const ends = new Float64Array(12 * mem.length), reactions = new Float64Array(6 * nn);
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
  const plates = new Float64Array(8 * pl.length);
  const plateU = [];
  pl.forEach((p, k) => {
    const ug = new Float64Array(24);
    p.nodes.forEach((nd, c) => { for (let d = 0; d < 6; d++) ug[6 * c + d] = u[6 * nd + d]; });
    const kg = p.el.kg;
    for (let r = 0; r < 24; r++) { let s = 0; for (let q = 0; q < 24; q++) s += kg[r * 24 + q] * ug[q]; reactions[6 * p.nodes[r / 6 | 0] + (r % 6)] += s; }
    const ul = toLocal(p.el, ug);
    plateU.push(ul);
    plates.set(plateResultants(p.el, ul, 0, 0), 8 * k);
  });
  for (let q = 0; q < 6 * nn; q++) reactions[q] -= nodeF[q];
  const supported = new Uint8Array(6 * nn);
  for (const s of model.supports) { const nd = prep.idx.get(s.node); for (let d = 0; d < 6; d++) if (s.fix[d] || (s.k && s.k[d])) supported[6 * nd + d] = 1; }
  for (let q = 0; q < 6 * nn; q++) if (!supported[q]) reactions[q] = 0;
  const applied = X.totals(prep, nodeF, memLoads), reacted = new Float64Array(6);
  for (let nd = 0; nd < nn; nd++) {
    const [x0, y0, z0] = prep.P[nd];
    const Rr = reactions.subarray(6 * nd, 6 * nd + 6);
    reacted[0] += Rr[0]; reacted[1] += Rr[1]; reacted[2] += Rr[2];
    reacted[3] += Rr[3] + y0 * Rr[2] - z0 * Rr[1]; reacted[4] += Rr[4] + z0 * Rr[0] - x0 * Rr[2]; reacted[5] += Rr[5] + x0 * Rr[1] - y0 * Rr[0];
  }
  const masters = new Float64Array(3 * floors.length);
  for (let k = 0; k < masters.length; k++) masters[k] = x[meq[k]];
  return { u, ends, reactions, loads: memLoads, applied: [...applied], reacted: [...reacted], plates, plateU, masters };
}

/** Plate results added to a combination made by frame-solve's combine(). */
export function combineShell(prep, list, out) {
  const np = prep.shell.pl.length;
  out.plates = new Float64Array(8 * np);
  out.plateU = prep.shell.pl.map(() => new Float64Array(24));
  out.masters = new Float64Array(3 * prep.shell.floors.length);
  for (const { R, f } of list) {
    for (let q = 0; q < out.plates.length; q++) out.plates[q] += f * R.plates[q];
    R.plateU.forEach((ul, k) => { for (let q = 0; q < 24; q++) out.plateU[k][q] += f * ul[q]; });
    for (let q = 0; q < out.masters.length; q++) out.masters[q] += f * R.masters[q];
  }
  return out;
}

export function plateCentre(prep, R, k) { return Array.from(R.plates.subarray(8 * k, 8 * k + 8)); }

/**
 * Corner values at each node, per set of plates with the same axes (one slab, one wall). Inside the set: the Gauss values
 * extrapolated to the corners and averaged over the plates at the node. On the set's edge (an edge only one plate has):
 * a least-squares plane a + b x + c y through the Gauss values of every plate within one plate of the node, read at the node
 * (the patch idea of O. C. Zienkiewicz, J. Z. Zhu, "The superconvergent patch recovery and a posteriori error estimates",
 * Int. J. Numer. Methods Eng. 33 (1992) 1331–1364): an element's bending moment is constant across it in the direction of
 * its own curvature, so a plain extrapolation would give the value half a plate in from a support.
 */
export function plateNodeResults(prep, R) {
  const pl = prep.shell.pl;
  const key = (ax) => ax.ez.map((v) => Math.round(v * 1e6)).join(',');
  const groups = new Map();
  pl.forEach((p, k) => { const kk = key(p.el.ax); if (!groups.has(kk)) groups.set(kk, []); groups.get(kk).push(k); });
  const gauss = pl.map((p, k) => plateGaussResultants(p.el, R.plateU[k]));
  const out = new Map();
  for (const [kk, list] of groups) {
    const at = new Map(), edges = new Map();
    for (const k of list) pl[k].nodes.forEach((nd, c) => {
      if (!at.has(nd)) at.set(nd, []);
      at.get(nd).push([k, c]);
      const nx = pl[k].nodes[(c + 1) % 4], e = Math.min(nd, nx) + ',' + Math.max(nd, nx);
      edges.set(e, (edges.get(e) || 0) + 1);
    });
    const onEdge = new Set();
    for (const [e, n] of edges) if (n === 1) e.split(',').forEach((x) => onEdge.add(Number(x)));
    for (const [nd, uses] of at) {
      let values;
      if (!onEdge.has(nd)) {
        values = new Array(8).fill(0);
        for (const [k, c] of uses) { const v = extrapolate(gauss[k])[c]; for (let a = 0; a < 8; a++) values[a] += v[a] / uses.length; }
      } else {
        const ring = new Set();
        for (const [k] of uses) for (const n2 of pl[k].nodes) for (const [k2] of at.get(n2)) ring.add(k2);
        const ax = pl[uses[0][0]].el.ax, P0 = prep.P[nd];
        const pts = [], vals = [];
        for (const k of ring) {
          const a2 = pl[k].el.ax, d = [a2.c[0] - P0[0], a2.c[1] - P0[1], a2.c[2] - P0[2]];
          const ox = d[0] * ax.ex[0] + d[1] * ax.ex[1] + d[2] * ax.ex[2], oy = d[0] * ax.ey[0] + d[1] * ax.ey[1] + d[2] * ax.ey[2];
          gaussPoints(a2).forEach((g, q) => { pts.push([ox + g[0], oy + g[1]]); vals.push(gauss[k][q]); });
        }
        values = planeFit(pts, vals);
      }
      if (!out.has(nd)) out.set(nd, []);
      out.get(nd).push({ axes: kk, values, plates: uses.length, edge: onEdge.has(nd) });
    }
  }
  return out;
}

/** Least-squares a + b x + c y per component through the points; returns a (the value at the origin). */
function planeFit(pts, vals) {
  const S = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (const [x, y] of pts) { const r = [1, x, y]; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) S[i * 3 + j] += r[i] * r[j]; }
  const det = (m) => m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]);
  const D = det(S);
  return vals[0].map((_, c) => {
    const b = [0, 0, 0];
    pts.forEach(([x, y], k) => { const v = vals[k][c]; b[0] += v; b[1] += x * v; b[2] += y * v; });
    if (Math.abs(D) < 1e-300) return b[0] / pts.length;
    return det([b[0], S[1], S[2], b[1], S[4], S[5], b[2], S[7], S[8]]) / D;      // Cramer: the first unknown
  });
}

/** Storey drifts of the rigid floors. */
export function storyDrifts(prep, R) {
  const floors = [...prep.shell.floors].sort((a, b) => a.z - b.z);
  const supZ = prep.model.supports.map((s) => prep.P[prep.idx.get(s.node)][2]);
  const base = supZ.length ? Math.min(...supZ) : 0;
  const move = (f, x, y) => {                                      // a floor's rigid in-plan movement at (x, y)
    if (!f) return [0, 0];
    const b = 3 * f.k, Ux = R.masters[b], Uy = R.masters[b + 1], Rz = R.masters[b + 2];
    return [Ux - (y - f.ym) * Rz, Uy + (x - f.xm) * Rz];
  };
  return floors.map((f, k) => {
    const below = k ? floors[k - 1] : null;
    const h = f.z - (below ? below.z : base);
    const at = (x, y) => { const a = move(f, x, y), b = move(below, x, y); return [a[0] - b[0], a[1] - b[1]]; };
    const c = at(f.xm, f.ym);
    let maxX = { value: 0, node: null }, maxY = { value: 0, node: null };
    for (const nd of f.nodes) {
      const d = at(prep.P[nd][0], prep.P[nd][1]);
      if (Math.abs(d[0]) > Math.abs(maxX.value)) maxX = { value: d[0], node: prep.model.nodes[nd].id };
      if (Math.abs(d[1]) > Math.abs(maxY.value)) maxY = { value: d[1], node: prep.model.nodes[nd].id };
    }
    const b = 3 * f.k;
    return { id: f.id, name: f.name, z: f.z, h, below: below ? below.id : null, U: [R.masters[b], R.masters[b + 1], R.masters[b + 2]], master: [f.xm, f.ym],
      dx: c[0], dy: c[1], ratioX: h > 0 ? Math.abs(c[0]) / h : null, ratioY: h > 0 ? Math.abs(c[1]) / h : null,
      maxX: { ...maxX, ratio: h > 0 ? Math.abs(maxX.value) / h : null }, maxY: { ...maxY, ratio: h > 0 ? Math.abs(maxY.value) / h : null } };
  });
}

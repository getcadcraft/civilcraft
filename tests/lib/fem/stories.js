/* SPDX-License-Identifier: Apache-2.0 */
/**
 * stories.js — the floors of a lib/fem frame model and their drifts (0.9 SU.1056), shared by the spectrum, time history and pushover code. DOM-free.
 *   storiesOf(fem, frame) → { stories: [{ name, z, h, nodes, probes: [{ node, x, y }], xc, yc }], baseZ }   rigid floors (diaphragms), else the levels with two or more free nodes
 *   floorMotion(fem, story, full) → [Ux, Uy, Rz]    rigid in-plane motion of a floor (least-squares fit; exact on a rigid floor)
 *   driftVector(fem, stories, full) → Float64Array   signed drift of every probe, X then Y, story by story · probeCount(stories) · driftRows(fem, stories, vec) → per story the worst probe
 * Drift = this floor's movement at the probe minus the floor below moved rigidly to the same point (the base: still).
 */
// ---- stories ----------------------------------------------------------------------------------------------------------------------------------/** The downward vertical loads of the cases (node, member udl/point, slab area) as lumped mass: [{ node, m: [m, m, m] }] in tonne (N / 9806.65). A case's own weight (selfWeight) is NOT added: the density already carries it. */
import { axesOf } from '../frame/frame-model.js';
import { G_MM } from './dyn-core.js';

export function massesFromCases(frame, ids, list) {
  const acc = new Map();
  const add = (node, force) => { if (!(force < 0)) return; const m = -force / G_MM; acc.set(node, (acc.get(node) || 0) + m); };
  const P = frame.nodes.map((n) => [n.x, n.y, n.z]);
  const mem = new Map(frame.members.map((m) => [m.id, m]));
  const plates = new Map((frame.plates || []).map((p) => [p.id, p]));
  for (const { case: cid, f } of list || []) {
    const c = frame.cases.find((q) => q.id === cid);
    if (!c || !(f > 0)) continue;
    for (const l of c.loads) {
      if (l.type === 'node') { add(ids.get(l.node), l.F[2] * f); continue; }
      if (l.type === 'area') {
        const p = plates.get(l.plate); if (!p) continue;
        const q = p.nodes.map((n) => P[ids.get(n)]);
        const d1 = [q[2][0] - q[0][0], q[2][1] - q[0][1], q[2][2] - q[0][2]], d2 = [q[3][0] - q[1][0], q[3][1] - q[1][1], q[3][2] - q[1][2]];
        const cr = [d1[1] * d2[2] - d1[2] * d2[1], d1[2] * d2[0] - d1[0] * d2[2], d1[0] * d2[1] - d1[1] * d2[0]], area = 0.5 * Math.hypot(...cr), nz = cr[2] / (Math.hypot(...cr) || 1);
        const cz = l.dir === 'Z' ? 1 : l.dir === 'n' ? nz : 0;
        for (const nd of p.nodes) add(ids.get(nd), l.p * f * cz * area / 4);
        continue;
      }
      const m = mem.get(l.member); if (!m) continue;
      const i = ids.get(m.i), j = ids.get(m.j), ax = axesOf(P[i], P[j], m.roll || 0), L = ax.L;
      const cz = l.dir === 'Z' ? 1 : l.dir === 'X' || l.dir === 'Y' ? 0 : l.dir === 'x' ? ax.ex[2] : l.dir === 'y' ? ax.ey[2] : ax.ez[2];
      if (!cz) continue;
      if (l.type === 'point') { const a = Math.min(Math.max(l.a / L, 0), 1), F = l.P * f * cz; add(i, F * (1 - a)); add(j, F * a); continue; }
      const a = l.a ?? 0, b = Math.min(l.b ?? L, L), w1 = l.w, w2 = l.w2 ?? l.w, len = b - a;
      if (!(len > 0)) continue;
      const F = (w1 + w2) / 2 * len * f * cz, xc = a + len * (w1 + 2 * w2) / (3 * (w1 + w2) || 1) * (w1 + w2 ? 1 : 0.5);
      const t = Math.min(Math.max((w1 + w2 ? xc : a + len / 2) / L, 0), 1);
      add(i, F * (1 - t)); add(j, F * t);
    }
  }
  return [...acc].map(([node, m]) => ({ node, m: [m, m, m] }));
}


export function storiesOf(fem, frame) {
  const P = fem.nodes, held = new Set((fem.fix || []).filter((f) => [0, 1, 2].every((d) => f.dofs.includes(d))).map((f) => f.node));      // a support that holds all three translations is a base
  const fixedZ = [...held].map((n) => P[n][2]);
  const baseZ = fixedZ.length ? Math.min(...fixedZ) : Math.min(...P.map((p) => p[2]));
  let floors = [];
  if (fem.diaphragms?.length) floors = fem.diaphragms.map((d, k) => ({ name: frame.diaphragms?.[k]?.name || frame.diaphragms?.[k]?.id || 'Level ' + (k + 1), nodes: d.nodes }));
  else {
    const by = new Map();
    P.forEach((p, n) => { if (held.has(n) || p[2] - baseZ < 1) return; const key = Math.round(p[2]); if (!by.has(key)) by.set(key, []); by.get(key).push(n); });
    floors = [...by.values()].filter((ns) => ns.length >= 2).map((ns, k) => ({ name: 'Level ' + (k + 1), nodes: ns }));
  }
  floors = floors.filter((f) => f.nodes.length).map((f) => {
    const z = f.nodes.reduce((s, n) => s + P[n][2], 0) / f.nodes.length;
    const pick = (key, sign) => f.nodes.reduce((b, n) => (sign * key(P[n]) > sign * key(P[b]) ? n : b), f.nodes[0]);
    const set = new Set([pick((p) => p[0], 1), pick((p) => p[0], -1), pick((p) => p[1], 1), pick((p) => p[1], -1), pick((p) => p[0] + p[1], 1), pick((p) => p[0] + p[1], -1), pick((p) => p[0] - p[1], 1), pick((p) => p[0] - p[1], -1)]);
    return { name: f.name, z, nodes: f.nodes, probes: [...set].map((n) => ({ node: n, x: P[n][0], y: P[n][1] })),
      xc: f.nodes.reduce((s, n) => s + P[n][0], 0) / f.nodes.length, yc: f.nodes.reduce((s, n) => s + P[n][1], 0) / f.nodes.length };
  }).sort((a, b) => a.z - b.z);
  floors.forEach((f, k) => { f.h = f.z - (k ? floors[k - 1].z : baseZ); });
  return { stories: floors, baseZ };
}
/** Rigid in-plane motion [Ux, Uy, Rz] of a floor from a full displacement vector (least-squares fit; exact on a rigid floor). */
export function floorMotion(fem, st, full) {
  const n = st.nodes.length;
  let ux = 0, uy = 0; for (const q of st.nodes) { ux += full[6 * q]; uy += full[6 * q + 1]; } ux /= n; uy /= n;
  let num = 0, den = 0;
  for (const q of st.nodes) { const dx = fem.nodes[q][0] - st.xc, dy = fem.nodes[q][1] - st.yc; num += dx * (full[6 * q + 1] - uy) - dy * (full[6 * q] - ux); den += dx * dx + dy * dy; }
  return [ux, uy, den > 1e-9 ? num / den : full[6 * st.nodes[0] + 5]];
}
/** Signed drift of every probe (X, Y) of every story, as one array: [s0p0x, s0p0y, s0p1x, …]. */
export function driftVector(fem, S, full) {
  const mot = S.map((st) => floorMotion(fem, st, full)), out = [];
  S.forEach((st, k) => {
    const a = mot[k], b = k ? mot[k - 1] : [0, 0, 0], sb = k ? S[k - 1] : null;
    for (const p of st.probes) {
      const ax = a[0] - (p.y - st.yc) * a[2], ay = a[1] + (p.x - st.xc) * a[2];
      const bx = sb ? b[0] - (p.y - sb.yc) * b[2] : 0, by = sb ? b[1] + (p.x - sb.xc) * b[2] : 0;
      out.push(ax - bx, ay - by);
    }
  });
  return Float64Array.from(out);
}
export const probeCount = (S) => S.reduce((s, st) => s + st.probes.length, 0);
export function driftRows(fem, S, vec) {
  let at = 0;
  return S.map((st) => {
    let mx = { v: 0, node: null }, my = { v: 0, node: null };
    for (const p of st.probes) { const dx = vec[at++], dy = vec[at++]; if (Math.abs(dx) > Math.abs(mx.v)) mx = { v: dx, node: p.node }; if (Math.abs(dy) > Math.abs(my.v)) my = { v: dy, node: p.node }; }
    return { name: st.name, z: st.z, h: st.h, dx: mx.v, dy: my.v, nodeX: mx.node, nodeY: my.node, ratioX: st.h > 0 ? Math.abs(mx.v) / st.h : null, ratioY: st.h > 0 ? Math.abs(my.v) / st.h : null };
  });
}


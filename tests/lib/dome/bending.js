/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bending.js — the dome, its stem wall and its base run through the shell solver (shellfe.js) for the loads that are the same all the way round
 * (0.11 DOME.8). Host-free. It adds what membrane theory leaves out: the bending moments where the shell is held at the ring beam, where the stem
 * wall meets the curve and where the thickness changes, the push on the ring beam, and how far the crown and the base move.
 *
 * The model: the concrete's mid-surface from the floor up the stem wall and over the dome to the crown, about 25 mm a piece in the wall and 280
 * pieces over the curve. The base is one of
 *   fixed   held against sliding, lifting and turning (bars lapped into a stiff ring beam)
 *   pinned  held against sliding and lifting, free to turn
 *   ring    free to slide outward against the ring beam's own stretch (its area × the concrete's stiffness), free to turn
 * Linear, elastic, uncracked concrete with the person's stiffness figure. Forces and moments do not depend on that figure for a fixed or pinned
 * base; movements, and everything with a ring base, do.
 *
 * Signs: forces + tension. Moments + when the INSIDE face is stretched. Stresses are force / thickness ± 6 × moment / thickness² (uncracked).
 */
import { solveAxi } from './shellfe.js';
import { thicknessAt } from './geometry.js';
import { G } from './membrane.js';

export const DOME_PIECES = 280;

/** The nodes, floor to crown (mm). */
export function shellNodes(d, m, pieces = DOME_PIECES) {
  const hs = d.stem, tb = d.shell + d.thicken, nodes = [];
  if (hs > 0) { const rc = d.diameter / 2 - d.foam - tb / 2, n = Math.max(8, Math.ceil(hs / 25)); for (let i = 0; i < n; i++) nodes.push({ r: rc, z: (hs * i) / n, t: tb, part: 'stem' }); }
  const mid = (s) => { const p = m.point(s), t = thicknessAt(d, p.z), off = d.foam + t / 2; return { r: s >= 1 ? 0 : Math.max(0, p.r - off * p.nr), z: p.z - off * p.nz + hs, t, part: 'dome' }; };
  // a low dome's mid-surface starts a little under the springline: begin where it crosses it
  let s0 = 0;
  if (mid(0).z < hs) { let lo = 0, hi = 0.5; for (let k = 0; k < 60; k++) { const c = (lo + hi) / 2; if (mid(c).z < hs) lo = c; else hi = c; } s0 = hi; }
  for (let i = 0; i <= pieces; i++) nodes.push(mid(s0 + ((1 - s0) * i) / pieces));
  return nodes;
}

/**
 * → { base (the fixity used), cases: { dead, snow? } } with a case = { stations: [{ z (mm above the floor), t, nAlong, nRound (kN/m), mAlong, mRound
 *   (kN·m/m) }], maxMoment { m (kN·m/m), z, dir: 'along' | 'round' }, baseMoment (kN·m/m), basePush (kN/m outward on the ring beam), baseVertical (kN/m),
 *   ringTension (kN in the ring beam), maxTension { stress (MPa), z, dir, face: 'inside' | 'outside' } | null, maxCompression { stress, z, dir, face },
 *   crownDrop (mm), baseSpread (mm), load (kN, the whole load the solver carried) }.
 */
export function bending(d, m) {
  const nodes = shellNodes(d, m), hs = d.stem, E = d.modulus, nu = d.poisson, dens = d.density * G * 1e-9;   // N/mm³
  // snow lies on the form, which is a little wider than the concrete's mid-surface: carry the same total down
  const first = nodes.find((x) => x.part === 'dome'), wide = (d.diameter / 2 / first.r) ** 2;
  const load = (gd, ps) => (r, z, ca, sa, t) => [0, -(gd * (dens * t + d.finishLoad * 1e-3) + (z > hs ? ps * 1e-3 * Math.abs(ca) * wide : 0))];
  const list = [['dead', d.gammaDeadAlone, 0]];
  if (d.snow > 0) list.push(['snow', d.gammaDead, d.snow * d.gammaSnow]);
  const fix = { 0: d.baseFix === 'fixed' ? { u: true, w: true, b: true } : d.baseFix === 'pinned' ? { u: true, w: true } : { w: true } };
  const A = d.footingWidth * d.footingDepth, r0 = nodes[0].r;
  const springs = d.baseFix === 'ring' ? [{ node: 0, u: (2 * Math.PI * E * A) / r0 }] : [];
  let sol;
  try { sol = solveAxi({ nodes, E, nu, loads: list.map(([, gd, ps]) => load(gd, ps)), fix, springs }); } catch { return { base: d.baseFix, cases: {}, failed: true }; }
  const cases = {};
  list.forEach(([id], c) => {
    const s = sol[c], n = s.pieces.length;
    const row = (p) => ({ z: p.z, t: p.t, nAlong: p.Ns, nRound: p.Nt, mAlong: p.Ms / 1000, mRound: p.Mt / 1000 });
    let maxM = { m: 0, z: 0, dir: 'along' }, maxT = null, maxC = null;
    for (const pair of s.ends) for (const p of pair) {
      for (const [dir, N, M] of [['along', p.Ns, p.Ms], ['round', p.Nt, p.Mt]]) {
        if (Math.abs(M) / 1000 > Math.abs(maxM.m)) maxM = { m: M / 1000, z: p.z, dir };
        for (const [face, sg] of [['inside', 1], ['outside', -1]]) {
          const st = N / p.t + (sg * 6 * M) / (p.t * p.t);
          if (st > 0 && (!maxT || st > maxT.stress)) maxT = { stress: st, z: p.z, dir, face };
          if (!maxC || st < -maxC.stress) maxC = { stress: -st, z: p.z, dir, face };
        }
      }
    }
    const R = s.reactions[0] || [0, 0, 0], push = d.baseFix === 'ring' ? (springs[0].u * s.u[0][0]) / (2 * Math.PI * r0) : -R[0];
    cases[id] = {
      stations: Array.from({ length: 9 }, (_, j) => row(s.pieces[Math.min(n - 1, Math.round((j * (n - 1)) / 8))])),
      maxMoment: maxM, baseMoment: s.ends[0][0].Ms / 1000, basePush: push, baseVertical: R[1], ringTension: (push * r0) / 1000,
      maxTension: maxT, maxCompression: maxC, crownDrop: -s.u[nodes.length - 1][1], baseSpread: s.u[0][0], load: (R[1] * 2 * Math.PI * r0) / 1000,
    };
  });
  return { base: d.baseFix, cases, pieces: nodes.length - 1 };
}

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * proposers.js — the built-in rule proposer of each discipline (cc-clashfix, 0.9 EG.42). DOM-free, deterministic, no model and no network:
 * it is what the flow runs when no assistant is connected, and the yardstick an assistant's proposals are ranked beside.
 *
 *   ruleProposer(discipline) → (model, clash, limits) → [proposal]   unscored; the coordinator validates and scores each one
 *
 * What each one tries, always on its own discipline's element in the clash:
 *   mechanical, plumbing, electrical (a run): a detour over and under the obstacle on the leg that hits it, the whole run up or down,
 *        the whole run to either side; a rectangular duct made flatter to pass under or over (mechanical). Drains never get a detour
 *        (validate refuses it: a rise or a dip in a gravity drain).
 *   structure: a column moved clear in plan (four ways); an opening in a beam's web or a slab for the run that passes.
 *   architecture: a sleeve in a wall for the run that passes; a wall known not to carry load moved clear across its length.
 * Distances are rounded up to 5 mm.
 */
import { boxOf, runVertices, halfSection } from './geom.js';
import { ownerOf, LIMITS } from './disciplines.js';
import { legLength } from './sandbox.js';

const up5 = (x) => Math.sign(x) * Math.ceil(Math.abs(x) / 5) * 5;

/** The legs of run e that run into box ob (with the gap), and where along each one (plan mm from the leg's first stored point). */
export function hitLegs(e, ob, gap) {
  const V = runVertices(e), [hw, hh] = halfSection(e), out = [];
  for (let i = 0; i < e.path.length - 1; i++) {
    const a = V[i], b = V[i + 1], L = legLength(e, i);
    if (L < 1) continue;
    const zlo = Math.min(a[2], b[2]) - hh, zhi = Math.max(a[2], b[2]) + hh;
    if (zhi < ob[2] - gap || zlo > ob[5] + gap) continue;
    const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, axis = Math.abs(ux) > 0.9999 || Math.abs(uy) > 0.9999;
    const ex = axis ? (Math.abs(ux) > 0.9999 ? 0 : hw) : Math.max(hw, hh), ey = axis ? (Math.abs(uy) > 0.9999 ? 0 : hw) : Math.max(hw, hh);
    const step = Math.max(5, Math.min(50, L / 400));
    let s0 = null, s1 = null;
    for (let s = 0; s <= L + 1e-6; s += step) {
      const x = a[0] + ux * s, y = a[1] + uy * s;
      if (x + ex > ob[0] - gap && x - ex < ob[3] + gap && y + ey > ob[1] - gap && y - ey < ob[4] + gap) { if (s0 === null) s0 = s; s1 = s; }
    }
    if (s0 === null) continue;
    out.push({ i, s0, s1, L, z: (a[2] + b[2]) / 2, n: [-uy, ux], a });
  }
  return out;
}

function runProposals(d, me, other, ob, limits) {
  const out = [], gap = limits.gap, [hw, hh] = halfSection(me), leg = limits.crossover.minLeg / 2;
  const legs = hitLegs(me, ob, gap);
  if (!legs.length) return out;
  const g = legs[0];
  // a detour climbs at least two bend radii (its two bends need a straight piece between them)
  const B = me.bend || 0, rise = (x) => (x > 0 ? Math.max(x, up5(2 * B)) : x < 0 ? Math.min(x, -up5(2 * B)) : x);
  const over = up5(ob[5] + gap + hh - g.z), under = up5(ob[2] - gap - hh - g.z);
  // the detour's up and down legs are as wide as the run (its section turned on end): they stand clear of the obstacle too
  const R = Math.max(hw, hh);
  let from = Math.max(0, Math.floor((g.s0 - R - leg) / 5) * 5), to = Math.min(g.L, Math.ceil((g.s1 + R + leg) / 5) * 5);
  if (to - from < 2 * B) { const mid = (from + to) / 2; from = Math.max(0, Math.floor((mid - B) / 5) * 5); to = Math.min(g.L, Math.ceil((mid + B) / 5) * 5); }
  const P = (key, vars, actions) => out.push({ discipline: d, by: 'rules', title: { key, vars }, actions });
  if (over > 0) P('p.crossover.over', { dz: rise(over) }, [{ op: 'crossover', element: me.id, segment: g.i, from, to, dz: rise(over) }]);
  if (under < 0) P('p.crossover.under', { dz: -rise(under) }, [{ op: 'crossover', element: me.id, segment: g.i, from, to, dz: rise(under) }]);
  if (over > 0) P('p.shift.up', { dz: over }, [{ op: 'shift', element: me.id, dx: 0, dy: 0, dz: over }]);
  if (under < 0) P('p.shift.down', { dz: -under }, [{ op: 'shift', element: me.id, dx: 0, dy: 0, dz: under }]);
  // sideways: across the leg, clear of the obstacle's plan box on either side
  const corners = [[ob[0], ob[1]], [ob[3], ob[1]], [ob[0], ob[4]], [ob[3], ob[4]]].map((c) => (c[0] - g.a[0]) * g.n[0] + (c[1] - g.a[1]) * g.n[1]);
  const m0 = Math.min(...corners), m1 = Math.max(...corners);
  for (const dist of [up5(m1 + gap + hw), up5(m0 - gap - hw)]) {
    if (!dist) continue;
    P('p.shift.side', { d: Math.abs(dist) }, [{ op: 'shift', element: me.id, dx: Math.round(g.n[0] * dist), dy: Math.round(g.n[1] * dist), dz: 0 }]);
  }
  if (me.kind === 'duct' && me.section && !me.section.round) {
    const ins = me.insulation || 0, { w, h } = me.section;
    for (const h2 of [2 * (ob[2] - gap - g.z) - 2 * ins, 2 * (g.z - ob[5] - gap) - 2 * ins]) {
      const hh2 = Math.floor(h2 / 10) * 10;
      if (!(hh2 > 0 && hh2 < h)) continue;
      const w2 = Math.ceil((w * h) / hh2 / 10) * 10;
      P('p.resize', { w: w2, h: hh2 }, [{ op: 'resize', element: me.id, w: w2, h: hh2 }]);
    }
  }
  return out;
}

function solidProposals(d, me, other, limits) {
  const out = [], gap = limits.gap, mb = me.box, ob = boxOf(other);
  const P = (key, vars, actions) => out.push({ discipline: d, by: 'rules', title: { key, vars }, actions });
  if (other.path && ['beam', 'slab', 'wall'].includes(me.kind)) {
    const s = other.section || { w: 100, h: 100 }, ins = other.insulation || 0;
    P('p.opening.' + me.kind, { w: Math.round(s.w + 2 * (ins + gap)), h: Math.round((s.round ? s.w : s.h) + 2 * (ins + gap)) }, [{ op: 'opening', element: me.id, through: other.id, w: Math.round(s.w + 2 * (ins + gap)), h: Math.round((s.round ? s.w : s.h) + 2 * (ins + gap)) }]);
  }
  if (me.kind === 'column' || (me.kind === 'wall' && me.loadBearing === false)) {
    const op = me.kind === 'column' ? 'move_column' : 'move_wall';
    const moves = [[up5(ob[3] + gap - mb[0]), 0], [up5(ob[0] - gap - mb[3]), 0], [0, up5(ob[4] + gap - mb[1])], [0, up5(ob[1] - gap - mb[4])]];
    const longX = mb[3] - mb[0] >= mb[4] - mb[1];
    for (const [dx, dy] of moves) {
      if (me.kind === 'wall' && ((longX && dx) || (!longX && dy))) continue;   // a wall moves across its length only
      if (!(Math.abs(dx) + Math.abs(dy))) continue;
      P('p.' + op, { d: Math.abs(dx || dy) }, [{ op, element: me.id, dx, dy }]);
    }
  }
  return out;
}

export function ruleProposer(d) {
  return (model, clash, limits = LIMITS) => {
    const by = new Map(model.elements.map((e) => [e.id, e]));
    const out = [];
    for (const [mi, oi] of [[clash.a, clash.b], [clash.b, clash.a]]) {
      const me = by.get(mi), other = by.get(oi);
      if (!me || !other || ownerOf(me) !== d) continue;
      const ob = boxOf(other);
      if (!ob) continue;
      if (me.path) out.push(...runProposals(d, me, other, ob, limits));
      else if (me.box) out.push(...solidProposals(d, me, other, limits));
    }
    return out.map((p) => ({ ...p, clash: clash.id }));
  };
}

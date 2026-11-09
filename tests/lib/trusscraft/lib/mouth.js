/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and codes; the words are in problems.js */
/**
 * mouth.js — the girder along a valley set's wing mouth, and the valley trusses' reactions on the main trusses (DC.116; DOM-free; pure).
 *   mouthGirder(layout, designs) → null | { ok, span, u0, u1, loads, reactions, shear, moment, cases, combos, ends }
 *   valleyOnMain(layout, designs) → [{ id, u, x, D, S, W, U, from }]    kN downward on each main truss's top chord
 *
 * The main trusses that end at the wing's mouth (`atMouth`) are each designed as simple spans, so each one's mouth-end reaction is a point load
 * on a girder (or a bearing wall) along the mouth. The girder is a simple beam between the two main walls the mouth runs between (the span is
 * the mouth's width). Forces only: the girder's size, species and its two bearings are the truss designer's / engineer's, said in Problems.
 * Reactions are the designs' own, per load case D S W U and per combination (the person's factors), kN, a downward push positive.
 * Valley trusses stand on the main roof: each end's reaction is shared between the two main trusses either side of it by plan distance.
 */
const CASES = ['D', 'S', 'W', 'U'];
const FKEY = { D: 'fD', S: 'fS', W: 'fW', U: 'fU' };
const r2 = (x) => Math.round(x * 100) / 100;

const endReaction = (d, c, side) => {
  const r = d && d.ok && d.caseRes && d.caseRes[c] && d.caseRes[c].reactions;
  return r ? Number(r[side][1]) || 0 : 0;
};

/** Combinations of a designed truss (they carry the person's factors); a girder uses the same ones. */
const comboList = (designs) => {
  for (const d of designs.values()) if (d && d.ok && Array.isArray(d.combos) && d.combos.length) return d.combos;
  return [{ name: 'Gravity', fD: 1, fS: 1, fW: 0, fU: 0 }];
};

export function mouthGirder(L, designs) {
  if (!L || !L.wing) return null;
  const { u0, u1, sgn } = L.wing, span = u1 - u0;
  const mouth = L.trusses.filter((t) => t.atMouth && Number.isFinite(t.u));
  if (!(span > 0) || !mouth.length) return null;
  const side = sgn > 0 ? 'right' : 'left';   // the end of a cut truss that stands at the mouth
  const loads = mouth.map((t) => {
    const d = designs.get(t.key), o = { id: t.id, x: Math.max(0, Math.min(span, t.u - u0)), ok: !!(d && d.ok) };
    for (const c of CASES) o[c] = o.ok ? endReaction(d, c, side) : 0;
    return o;
  });
  const solve = (w) => {   // w(load) → kN; a simple beam
    const P = loads.map((l) => ({ x: l.x, p: w(l) }));
    const RA = P.reduce((a, q) => a + (q.p * (span - q.x)) / span, 0), RB = P.reduce((a, q) => a + (q.p * q.x) / span, 0);
    let V = Math.max(Math.abs(RA), Math.abs(RB)), M = 0;
    for (const q of P) {   // the moment is largest under a point load
      let m = RA * q.x;
      for (const o of P) if (o.x < q.x) m -= o.p * (q.x - o.x);
      M = Math.max(M, Math.abs(m));
    }
    return { RA: r2(RA), RB: r2(RB), V: r2(V), M: r2(M / 1000) };   // M in kN·m (x in mm)
  };
  const cases = {};
  for (const c of CASES) cases[c] = solve((l) => l[c]);
  const combos = comboList(designs).map((cb) => ({ name: cb.name, ...solve((l) => CASES.reduce((a, c) => a + (Number(cb[FKEY[c]]) || 0) * l[c], 0)) }));
  const g = combos.reduce((b, c) => (c.M > b.M ? c : b), combos[0]);
  return { ok: loads.every((l) => l.ok), span: r2(span), u0, u1, loads: loads.map((l) => ({ ...l, x: r2(l.x) })), cases, combos, governing: g, ends: { start: g.RA, end: g.RB }, failed: loads.filter((l) => !l.ok).map((l) => l.id) };
}

export function valleyOnMain(L, designs) {
  if (!L || !L.valley || !L.valley.ok || !L.ruDir) return [];
  const ru = L.ruDir, rv = [-ru[1], ru[0]];
  const mains = L.trusses.filter((t) => t.label === 'main' && Number.isFinite(t.u)).sort((a, b) => a.u - b.u);
  if (!mains.length) return [];
  const acc = new Map();
  const add = (t, v, p) => { const o = acc.get(t.id) || { id: t.id, u: t.u, x: 0, wx: 0, D: 0, S: 0, W: 0, U: 0, from: 0 }; for (const c of CASES) o[c] += p[c]; const m = p.D + p.S + p.W + p.U || 1; o.wx += Math.abs(m) * (v - (t.v0 || 0)); o.from++; acc.set(t.id, o); };
  for (const vt of L.trusses.filter((t) => t.kind === 'valley')) {
    const d = designs.get(vt.key);
    if (!d || !d.ok) continue;
    [[vt.a, 'left'], [vt.b, 'right']].forEach(([pt, side]) => {
      const u = pt[0] * ru[0] + pt[1] * ru[1], v = pt[0] * rv[0] + pt[1] * rv[1];
      let lo = null, hi = null;
      for (const t of mains) { if (t.u <= u) lo = t; if (t.u >= u && !hi) hi = t; }
      const R = {}; for (const c of CASES) R[c] = endReaction(d, c, side);
      if (lo && hi && lo !== hi) { const k = (u - lo.u) / (hi.u - lo.u); add(lo, v, Object.fromEntries(CASES.map((c) => [c, R[c] * (1 - k)]))); add(hi, v, Object.fromEntries(CASES.map((c) => [c, R[c] * k]))); }
      else add(lo || hi, v, R);
    });
  }
  return [...acc.values()].map((o) => { const m = Math.abs(o.D + o.S + o.W + o.U) || 1; return { id: o.id, u: o.u, x: Math.round(o.wx / m), D: r2(o.D), S: r2(o.S), W: r2(o.W), U: r2(o.U), from: o.from }; });
}

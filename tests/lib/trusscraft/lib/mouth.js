/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and codes; the words are in problems.js */
/**
 * mouth.js — the girder along a valley set's wing mouth, and the valley trusses' reactions on the main trusses (DC.116; DOM-free; pure).
 *   mouthGirder(layout, designs) → null | { ok, span, u0, u1, loads, reactions, shear, moment, cases, combos, ends }
 *   valleyOnMain(layout, designs) → [{ id, u, x, D, S, W, U, from }]    kN downward on each main truss's top chord (summed per truss)
 *   valleyPointLoads(layout, designs) → Map(main truss id → [{ x, D, S, W, U }])   the same reactions, one point load per valley end
 *   sizeGirder(girder, design) → { ok, id, plies, b, d, util, defl, ... } | { ok: false, reason }   first sizing of a built-up sawn beam
 *
 * The main trusses that end at the wing's mouth (`atMouth`) are each designed as simple spans, so each one's mouth-end reaction is a point load
 * on a girder (or a bearing wall) along the mouth. The girder is a simple beam between the two main walls the mouth runs between (the span is
 * the mouth's width). sizeGirder gives a first size for it as a built-up sawn beam (1 to 4 plies) from the species table: bending against Fb
 * (only when the table has an Fb, as for the chords), unfactored dead + snow deflection against the person's limit (when one is entered), bearing
 * length from Fcp (when given). Shear, lateral stability, the plies' fixing and the bearings themselves stay the truss designer's, said in Problems.
 * Reactions are the designs' own, per load case D S W U and per combination (the person's factors), kN, a downward push positive.
 * Valley trusses stand on the main roof: each end's reaction is shared between the two main trusses either side of it by plan distance, and
 * setdesign.js designs those main trusses with the reactions as point loads at forced top-chord panel points.
 */
import { SIZES } from './tables.js';

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

/** Each valley end's reaction, shared by plan distance between the two main trusses either side of it; x along the main truss from its v0 end. */
export function valleyPointLoads(L, designs) {
  const acc = new Map();
  if (!L || !L.valley || !L.valley.ok || !L.ruDir) return acc;
  const ru = L.ruDir, rv = [-ru[1], ru[0]];
  const mains = L.trusses.filter((t) => t.label === 'main' && Number.isFinite(t.u)).sort((a, b) => a.u - b.u);
  if (!mains.length) return acc;
  const add = (t, v, p) => { const list = acc.get(t.id) || []; list.push({ x: v - (t.v0 || 0), ...p }); acc.set(t.id, list); };
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
  return acc;
}

export function valleyOnMain(L, designs) {
  const out = [];
  if (!L || !L.trusses) return out;
  for (const [id, list] of valleyPointLoads(L, designs)) {
    const t = L.trusses.find((x) => x.id === id), o = { D: 0, S: 0, W: 0, U: 0 };
    let wx = 0, wm = 0;
    for (const p of list) { for (const c of CASES) o[c] += p[c]; const m = Math.abs(p.D + p.S + p.W + p.U); wx += m * p.x; wm += m; }
    out.push({ id, u: t ? t.u : 0, x: Math.round(wm ? wx / wm : 0), D: r2(o.D), S: r2(o.S), W: r2(o.W), U: r2(o.U), from: list.length });
  }
  return out;
}

/** Largest deflection (mm) of a simple beam (span mm, EI N·mm²) under point loads [{ x mm, p kN }], by sampling. */
function beamDefl(span, EI, P) {
  let max = 0, at = 0;
  for (let i = 1; i < 100; i++) {
    const x = (span * i) / 100;
    let y = 0;
    for (const q of P) {   // the standard simple-span point-load deflection, a = load position, b = span − a
      const a = q.x, b = span - a, F = q.p * 1000;
      y += x <= a ? (F * b * x * (span * span - b * b - x * x)) / (6 * span * EI) : (F * a * (span - x) * (2 * span * x - x * x - a * a)) / (6 * span * EI);
    }
    if (Math.abs(y) > max) { max = Math.abs(y); at = x; }
  }
  return { max: r2(max), x: Math.round(at) };
}

/**
 * First size of the mouth girder as a built-up sawn beam from SIZES (1 to 4 plies, deepest last), smallest section first: bending from each
 * combination's moment against Fb × that combination's CD, then (with a limit entered) dead + snow deflection from E. `d` is any ok design
 * of the set: it carries the person's species, Fb, Fcp, combinations and deflection limit.
 */
export function sizeGirder(g, d) {
  if (!g || !(g.span > 0)) return { ok: false, reason: 'nogirder' };
  const sp = d && d.species, Fb = d && d.fb, E = sp && sp.E, lim = d && d.deflLimit > 0 ? d.deflLimit : 0;
  const cd = (name) => { const c = d && Array.isArray(d.comboDefs) ? d.comboDefs.find((x) => x.name === name) : null; return c && c.CD > 0 ? c.CD : 1; };
  const Mmax = Math.max(0, ...g.combos.map((c) => c.M));
  if (!(Fb > 0)) return { ok: false, reason: 'nofb', M: r2(Mmax) };
  const svc = g.loads.map((l) => ({ x: l.x, p: l.D + l.S }));
  const cands = [];
  for (const s of SIZES) for (let n = 1; n <= 4; n++) cands.push({ id: (n > 1 ? n + '-ply ' : '') + s.id, plies: n, b: s.b * n, d: s.d });
  cands.sort((a, b) => a.b * a.d - b.b * b.d || a.plies - b.plies);
  let last = null;
  for (const c of cands) {
    const Sx = (c.b * c.d * c.d) / 6, I = (c.b * Math.pow(c.d, 3)) / 12;
    const util = Math.max(0, ...g.combos.map((cb) => (cb.M * 1e6) / Sx / (Fb * cd(cb.name))));
    const defl = E > 0 ? beamDefl(g.span, E * I, svc) : null, dLim = lim ? g.span / lim : 0;
    const Fcp = d.bearing && d.bearing.Fcp, Rmax = Math.max(Math.abs(g.governing.RA), Math.abs(g.governing.RB), ...g.combos.map((cb) => Math.max(Math.abs(cb.RA), Math.abs(cb.RB))));
    last = { ok: util <= 1 && (!dLim || !defl || defl.max <= dLim), id: c.id, plies: c.plies, b: c.b, d: c.d, util: r2(util), Fb, defl, deflLimit: lim, deflMax: dLim ? r2(dLim) : 0,
      bearingLen: Fcp > 0 ? Math.ceil((Rmax * 1000) / (c.b * Fcp)) : 0, Fcp: Fcp || 0, R: r2(Rmax) };
    if (last.ok) return last;
  }
  return { ...last, ok: false, reason: 'toobig' };
}

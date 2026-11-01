/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rc-aci318.js — reinforced concrete member strength by ACI 318-19 (SI) for rectangular nonprestressed sections (0.8 SU.1056
 * step 3; owner decision O1 default). DOM-free; imports rc-section.js. An aid until an engineer has reviewed it: every result
 * names its clause, and what is not built says "not checked", never a number.
 *
 * Building Code Requirements for Structural Concrete (ACI 318-19), SI units (ACI 318M-19). Normalweight concrete (λ = 1)
 * unless λ is given; Grade 420/520 bars; Es = 200 000 MPa (20.2.2.2).
 *   22.2.2.1  εcu = 0.003                         22.2.2.4.1  stress block 0.85 f'c over a = β1 c
 *   Table 22.2.2.4.3  β1 = 0.85 (17 ≤ f'c ≤ 28), 0.85 − 0.05 (f'c − 28)/7 (28–55), 0.65 (≥ 55)
 *   21.2.1    φ shear 0.75                        Table 21.2.2  φ by εt: tension-controlled εt ≥ εty + 0.003 → 0.90;
 *             compression-controlled εt ≤ εty → 0.65 tied / 0.75 spiral; linear between; εty = fy / Es (21.2.2.1)
 *   22.4.2.2  Po = 0.85 f'c (Ag − Ast) + fy Ast    22.4.2.1  Pn,max = 0.80 Po tied, 0.85 Po spiral (Table 22.4.2.1)
 *   22.4.3.1  Pnt = fy Ast (pure tension)
 *   9.3.3.1   nonprestressed beams with Pu < 0.10 f'c Ag: εt ≥ 0.004
 *   9.6.1.2   As,min = max(0.25 √f'c / fy, 1.4 / fy) bw d
 *   22.5.1.1  φVn ≥ Vu, Vn = Vc + Vs            22.5.1.2  Vu ≤ φ (Vc + 0.66 √f'c bw d) (section size)
 *   22.5.3.1  √f'c ≤ 8.3 MPa                     Table 22.5.5.1  Vc, nonprestressed:
 *             Av ≥ Av,min: the larger of (a) [0.17 λ √f'c + Nu/6Ag] bw d and (b) [0.66 λ ρw^⅓ √f'c + Nu/6Ag] bw d
 *             Av < Av,min: (c) [0.66 λs λ ρw^⅓ √f'c + Nu/6Ag] bw d
 *   22.5.5.1.1  Vc ≤ 0.42 λ √f'c bw d          22.5.5.1.2  Nu/6Ag ≤ 0.05 f'c (Nu + compression; tension may make Vc 0)
 *   22.5.5.1.3  λs = √(2 / (1 + 0.004 d)) ≤ 1    22.5.8.5.3  Vs = Av fyt d / s     20.2.2.4  fyt ≤ 420 MPa for stirrups
 *   9.6.3.1   Av,min where Vu > φ 0.083 λ √f'c bw d      9.6.3.4  Av,min = max(0.062 √f'c, 0.35) bw s / fyt
 *   9.7.6.2.2 stirrup spacing ≤ min(d/2, 600 mm), halved (min(d/4, 300)) where Vs > 0.33 √f'c bw d
 *   22.7.4.1(a) threshold torsion Tth = 0.083 λ √f'c Acp² / pcp (φ Tth): above it torsion must be designed — not built here
 *   6.2.5 / 6.6.4  slenderness: k ℓu / r with r = 0.3 h; above 22 (sway) the moments must be magnified — not built here
 *
 *   beta1(fc) · phiAxialFlexure(epsT, epsTy, spiral) · material(o)
 *   beamFlexure({ b, h, layers | bars, fc, fy, Es, axis, sign }) → { Mn, phi, phiMn, c, a, epsT, dt, tensionControlled,
 *       ductile (εt ≥ 0.004), AsMin, As, clauses } — Pn = 0 by strain compatibility (singly and doubly reinforced alike)
 *   requiredAs({ b, d, fc, fy, Mu }) → As of a singly reinforced section for Mu with φ = 0.9 (null when the section is too small)
 *   beamShear({ bw, d, h, fc, fyt, Av, s, Vu, Nu, As, lambda }) → { Vc, Vs, Vn, phiVn, AvMin, AvMinNeeded, sMax, sizeOk, … }
 *   interaction({ b, h, bars, fc, fy, Es, axis, spiral, n }) → { points: [{ c, Pn, Mn, phi, phiPn, phiMn, epsT }] (compression
 *       to tension), Po, PnMax, phiPnMax, Pnt, phiPnt, Ast, Ag }
 *   pmRatio(diagram, Pu, Mu) → utilisation of (Pu, |Mu|) on the φ diagram (a ray from the origin; ≤ 1 = inside)
 *   torsionThreshold({ b, h, fc, lambda }) → φ Tth (N·mm)
 */
import { forcesAt, neutralAxisForP, layersFor } from './rc-section.js';

export const EDITION = 'ACI 318-19';
export const ES = 200000;
export const PHI_SHEAR = 0.75;

export function beta1(fc) {
  if (fc <= 28) return 0.85;
  if (fc >= 55) return 0.65;
  return 0.85 - 0.05 * (fc - 28) / 7;
}
export function phiAxialFlexure(epsT, epsTy, spiral = false) {
  const lo = spiral ? 0.75 : 0.65;
  if (epsT >= epsTy + 0.003) return 0.9;
  if (epsT <= epsTy) return lo;
  return lo + (0.9 - lo) * (epsT - epsTy) / 0.003;
}
export function material({ fc, fy, Es = ES }) { return { fc, fy, Es, alpha1: 0.85, beta1: beta1(fc), epsCu: 0.003 }; }
const sqrtFc = (fc) => Math.min(Math.sqrt(fc), 8.3);

const sectionLayers = (o) => (o.layers ? { depth: o.h, width: o.b, layers: o.layers } : layersFor({ b: o.b, h: o.h, bars: o.bars }, o.axis || 'y', o.sign ?? 1));

export function beamFlexure(o) {
  const m = material(o), L = sectionLayers(o);
  const c = neutralAxisForP(L, 0, m);
  if (c === null) return { ok: false, why: 'no-equilibrium' };
  const f = forcesAt(L, c, m);
  const epsTy = m.fy / m.Es;
  const phi = phiAxialFlexure(f.epsT, epsTy, false);
  const As = L.layers.filter((l) => l.d > f.c).reduce((s, l) => s + l.As, 0);
  const d = As ? L.layers.filter((l) => l.d > f.c).reduce((s, l) => s + l.As * l.d, 0) / As : f.dt;   // centroid of the tension steel
  const AsMin = Math.max(0.25 * Math.sqrt(o.fc) / o.fy, 1.4 / o.fy) * L.width * d;
  return {
    ok: true, Mn: f.M, phi, phiMn: phi * f.M, c: f.c, a: f.a, epsT: f.epsT, dt: f.dt, d, epsTy, As, AsMin, AsMinOk: As >= AsMin - 1e-9,
    tensionControlled: f.epsT >= epsTy + 0.003 - 1e-12, ductile: f.epsT >= 0.004 - 1e-12, steel: f.steel, beta1: m.beta1,
    clauses: ['ACI 318-19 22.2', 'ACI 318-19 Table 21.2.2', 'ACI 318-19 9.3.3.1', 'ACI 318-19 9.6.1.2'],
  };
}

export function requiredAs({ b, d, fc, fy, Mu, phi = 0.9 }) {
  const Rn = Mu / (phi * b * d * d);
  const disc = 1 - 2 * Rn / (0.85 * fc);
  if (disc < 0) return null;
  return 0.85 * fc / fy * (1 - Math.sqrt(disc)) * b * d;
}

export function beamShear({ bw, d, h, fc, fyt, Av = 0, s = 0, Vu = 0, Nu = 0, As = 0, lambda = 1, Ag = bw * h }) {
  const fytUse = Math.min(fyt, 420);
  const rf = sqrtFc(fc);
  const AvMin = s > 0 ? Math.max(0.062 * Math.sqrt(fc), 0.35) * bw * s / fytUse : Infinity;
  const hasMin = Av > 0 && s > 0 && Av >= AvMin - 1e-9;
  const rho = Math.max(As / (bw * d), 0);
  const axial = Math.min(Nu / (6 * Ag), 0.05 * fc);                 // Nu compression +; tension negative (not capped below)
  const lamS = Math.min(1, Math.sqrt(2 / (1 + 0.004 * d)));
  let Vc, eq;
  if (hasMin) {
    const a = (0.17 * lambda * rf + axial) * bw * d, b = (0.66 * lambda * Math.cbrt(rho) * rf + axial) * bw * d;
    Vc = Math.max(a, b); eq = a >= b ? '(a)' : '(b)';
  } else { Vc = (0.66 * lamS * lambda * Math.cbrt(rho) * rf + axial) * bw * d; eq = '(c)'; }
  Vc = Math.max(0, Math.min(Vc, 0.42 * lambda * rf * bw * d));
  const Vs = Av > 0 && s > 0 ? Av * fytUse * d / s : 0;
  const Vn = Vc + Vs, phiVn = PHI_SHEAR * Vn;
  const VsMax = 0.66 * rf * bw * d;                                  // 22.5.1.2 as a limit on Vs
  const sizeOk = Math.abs(Vu) <= PHI_SHEAR * (Vc + VsMax) + 1e-9;
  const AvMinNeeded = Math.abs(Vu) > PHI_SHEAR * 0.083 * lambda * rf * bw * d;
  const sMax = Vs > 0.33 * rf * bw * d ? Math.min(d / 4, 300) : Math.min(d / 2, 600);
  return { Vc, Vs, Vn, phiVn, eq, lamS, rho, AvMin, hasMin, AvMinNeeded, AvMinOk: !AvMinNeeded || hasMin, sMax, sOk: !(s > 0) || s <= sMax + 1e-9, sizeOk, fytUse,
    clauses: ['ACI 318-19 22.5.1.1', 'ACI 318-19 Table 22.5.5.1', 'ACI 318-19 22.5.8.5.3', 'ACI 318-19 22.5.1.2', 'ACI 318-19 9.6.3.1', 'ACI 318-19 9.6.3.4', 'ACI 318-19 9.7.6.2.2'] };
}

export function interaction({ b, h, bars, layers, fc, fy, Es = ES, axis = 'y', spiral = false, n = 120 }) {
  const m = material({ fc, fy, Es });
  const L = layers ? { depth: h, width: b, layers } : layersFor({ b, h, bars }, axis, 1);
  const Ast = L.layers.reduce((s, l) => s + l.As, 0), Ag = b * h;
  const Po = 0.85 * fc * (Ag - Ast) + fy * Ast;
  const PnMax = (spiral ? 0.85 : 0.8) * Po;
  const lo = spiral ? 0.75 : 0.65, epsTy = fy / m.Es;
  const dt = Math.max(...L.layers.map((l) => l.d));
  const pts = [];
  // c from deep (nearly pure compression) to shallow, geometric, plus the named points
  const cs = new Set();
  for (let k = 0; k <= n; k++) cs.add(L.depth * 20 * Math.pow(1e-3 / 20, k / n));
  cs.add(dt * 0.003 / (0.003 + epsTy));                              // balanced (εt = εty)
  cs.add(dt * 0.003 / (0.006 + epsTy));                              // tension-controlled limit (εt = εty + 0.003)
  const c0 = neutralAxisForP(L, 0, m);
  if (c0) cs.add(c0);
  for (const c of [...cs].sort((x, y) => y - x)) {
    const f = forcesAt(L, c, m);
    const phi = phiAxialFlexure(f.epsT, epsTy, spiral);
    pts.push({ c, Pn: f.P, Mn: f.M, phi, phiPn: Math.min(phi * f.P, lo * PnMax), phiMn: phi * f.M, epsT: f.epsT, capped: phi * f.P > lo * PnMax });
  }
  const Pnt = -fy * Ast;
  pts.push({ c: 0, Pn: Pnt, Mn: 0, phi: 0.9, phiPn: 0.9 * Pnt, phiMn: 0, epsT: Infinity, capped: false });
  return { points: pts, Po, PnMax, phiPnMax: lo * PnMax, Pnt, phiPnt: 0.9 * Pnt, Ast, Ag, axis, spiral,
    clauses: ['ACI 318-19 22.4.2.1', 'ACI 318-19 22.4.2.2', 'ACI 318-19 22.4.3.1', 'ACI 318-19 Table 21.2.2', 'ACI 318-19 22.2'] };
}

/** Utilisation of (Pu, Mu) against the φ diagram: |(Mu, Pu)| over the distance to the diagram along the same ray. */
export function pmRatio(D, Pu, Mu) {
  const M = Math.abs(Mu);
  // the closed φ outline: (0, φPn,max cap) … (φMn, φPn) … (0, φPnt), polar about the origin
  const poly = [{ x: 0, y: D.phiPnMax }, ...D.points.map((p) => ({ x: p.phiMn, y: p.phiPn }))];
  if (Math.hypot(M, Pu) < 1e-12) return 0;
  const ang = Math.atan2(Pu, M);
  for (let k = 0; k + 1 < poly.length; k++) {
    const A = poly[k], B = poly[k + 1];
    // ray t·(cos, sin) meets segment A + s (B − A)
    const dx = Math.cos(ang), dy = Math.sin(ang), ex = B.x - A.x, ey = B.y - A.y;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-18) continue;
    const t = (A.x * ey - A.y * ex) / den, s = (A.x * dy - A.y * dx) / den;
    if (t > 0 && s >= -1e-12 && s <= 1 + 1e-12) return Math.hypot(M, Pu) / t;
  }
  return Infinity;
}

export function torsionThreshold({ b, h, fc, lambda = 1 }) {
  const Acp = b * h, pcp = 2 * (b + h);
  return PHI_SHEAR * 0.083 * lambda * sqrtFc(fc) * Acp * Acp / pcp;
}

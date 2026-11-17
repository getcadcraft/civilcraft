/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-design-hollow.js — member checks of rectangular / square hollow sections (RHS, SHS) and round hollow sections (CHS, pipe) to ANSI/AISC 360-16 (LRFD) and
 * EN 1993-1-1:2005+A1:2014 (0.10 SU.1811, session engineering-10). DOM-free; imports frame-design-aisc.js (the E3 curve, shear Cv, H1) and frame-design-en.js
 * (partial factors, χ curve, Annex B). Units: mm, N, MPa, N·mm. An aid until an engineer has reviewed it; every function names its clause.
 *
 * Shapes (the section's `shape`): { kind: 'RHS', h, b, t, ro? }  h = the depth along the member's local z (Iy bends about y: strong when h ≥ b), b across, t the design
 * wall, ro the outer corner radius (default 2 t, as AISC's tables are worked; EN hot finished 1.5 t is the caller's to pass);   { kind: 'CHS', D, t }.
 *
 * Built, AISC: tension yielding (D2); flexural compression (E3; torsional buckling does not govern a closed section, E4 note); flexure of COMPACT walls only (F7 / F8
 * yielding, Mp = Fy Z); shear (G4 for RHS, G5 for CHS with the second expression only, which is the lower); H1.1.  Built, EN: classification of internal parts and tubes
 * (Table 5.2), tension, compression (6.2.4) and flexural buckling (6.3.1, curve c cold formed or a hot finished), bending (6.2.5), shear (6.2.6), bending + axial force
 * (6.2.9.1 with the hollow-section exponents), bending + compression (Annex B, Table B.1: no lateral-torsional buckling, χLT = 1).
 * NOT built (the check says "not checked" or "partly checked", never a number): AISC slender walls (E7, F7.2(c), F8), noncompact walls in bending (F7-2, F7-5), lateral-
 * torsional buckling of a rectangular HSS beyond Lp (F7-12), EN class 4 (no effective section), torsion (EN 6.2.7, AISC H3), second-order effects, welded joints
 * (frame-weld.js) and local effects at the joints (punching, chord face plastification: EN 1993-1-8 §7, AISC J10 / K).
 * Where each coefficient comes from: the clause named at the line; the clause numbers and constants were written from the published standards by the author and are NOT yet
 * compared with a printed copy (docs/0.10-sessions/engineering-10.md § For the owner lists the comparison owed).
 */
import { cv } from './frame-design-aisc.js';
import { chiOf, ALPHA } from './frame-design-en.js';

export const SQRT3 = Math.sqrt(3);

/** Shape record of a section, or null (RHS and CHS only). */
export function hollowShape(sec) {
  const s = sec?.shape;
  if (!s) return null;
  const f = (v, lo = 0.1) => Number.isFinite(v) && v >= lo;
  if (s.kind === 'RHS' && f(s.h, 1) && f(s.b, 1) && f(s.t) && 2 * s.t < Math.min(s.h, s.b)) return { kind: 'RHS', h: s.h, b: s.b, t: s.t, ro: f(s.ro, 0) ? s.ro : 2 * s.t, hot: !!s.hot };
  if (s.kind === 'CHS' && f(s.D, 1) && f(s.t) && 2 * s.t < s.D) return { kind: 'CHS', D: s.D, t: s.t, hot: !!s.hot };
  return null;
}

/** ∫|z| dA of a rounded rectangle hh × bb with corner radius r about its centroidal axis (depth hh): b h²/4 less the four corner spandrels, each of area (1 − π/4) r²
 *  whose centroid lies FC·r from both sides, FC = (10 − 3π)/(3 (4 − π)) = 0.2234 (the same constant frame-design-aisc.js uses for the root fillets of I-shapes). */
const FC = (10 - 3 * Math.PI) / (3 * (4 - Math.PI));
const plasticRR = (hh, bb, r) => bb * hh * hh / 4 - 4 * (1 - Math.PI / 4) * r * r * (hh / 2 - FC * r);
/** The plastic modulus of an RHS about the axis square to its depth h: outer rounded rectangle (radius ro) less the void (radius ri = ro − t). */
const plasticRHS = (h, b, t, ro) => plasticRR(h, b, ro) - plasticRR(h - 2 * t, b - 2 * t, Math.max(ro - t, 0));

export function props(shape, sec) {
  const A = sec.A, Iy = sec.Iy, Iz = sec.Iz;
  if (shape.kind === 'CHS') {
    const { D, t } = shape, Di = D - 2 * t;
    const Zx = (D ** 3 - Di ** 3) / 6;
    return { kind: 'CHS', D, t, A, Iy, Iz, J: sec.J, rx: Math.sqrt(Iy / A), ry: Math.sqrt(Iz / A), Sx: Iy / (D / 2), Sy: Iz / (D / 2), Zx, Zy: Zx, dt: D / t, Av: 2 * A / Math.PI };
  }
  const { h, b, t, ro } = shape;
  const Zx = plasticRHS(h, b, t, ro), Zy = plasticRHS(b, h, t, ro);
  return { kind: 'RHS', h, b, t, A, Iy, Iz, J: sec.J, rx: Math.sqrt(Iy / A), ry: Math.sqrt(Iz / A), Sx: Iy / (h / 2), Sy: Iz / (b / 2), Zx, Zy, ht: (h - 3 * t) / t, bt: (b - 3 * t) / t, Avz: A * h / (b + h), Avy: A * b / (b + h), square: Math.abs(h - b) < 1e-9 };
}

// ------------------------------------------------------------------------------------------------------------------ AISC 360-16
export const AISC = {
  /** Wall slenderness against Table B4.1: { compression: null | { why, clause }, bending: null | { why, clause } } (E7 / F7 / F8 are not built). */
  slender(p, fy, E) {
    const k = Math.sqrt(E / fy), out = { compression: null, bending: null };
    if (p.kind === 'RHS') {
      if (Math.max(p.ht, p.bt) > 1.40 * k) out.compression = { why: 'slender-compression', clause: 'E7' };          // Table B4.1a case 6
      if (p.bt > 1.12 * k || p.ht > 2.42 * k) out.bending = { why: 'noncompact-hss', clause: 'F7' };               // Table B4.1b cases 12, 14: λp
    } else {
      if (p.dt > 0.11 * E / fy) out.compression = { why: 'slender-compression', clause: 'E7' };                    // Table B4.1a case 9
      if (p.dt > 0.07 * E / fy) out.bending = { why: 'noncompact-hss', clause: 'F8' };                              // Table B4.1b case 20: λp
    }
    return out;
  },
  tension: (p, fy) => ({ phiPn: 0.9 * fy * p.A, clause: 'D2(a)' }),                                                  // (D2-1)
  compression(p, fy, E, Lcy, Lcz) {
    const KLry = Lcy / p.rx, KLrz = Lcz / p.ry;
    const Fe = Math.PI * Math.PI * E / Math.pow(Math.max(KLry, KLrz), 2);
    const Fcr = fy / Fe <= 2.25 ? Math.pow(0.658, fy / Fe) * fy : 0.877 * Fe;                                      // (E3-2), (E3-3)
    return { phiPn: 0.9 * Fcr * p.A, Fe, Fcr, KLry, KLrz };
  },
  /** Compact walls: Mn = Mp = Fy Z (F7-1 / F8-1). LTB of a rectangular HSS bent about its strong axis: Lb above Lp (F7-12) is reported, not checked. */
  flexure(p, fy, E, Lb) {
    const out = { major: { phiMn: 0.9 * fy * p.Zx }, minor: { phiMn: 0.9 * fy * p.Zy }, ltb: null };
    if (p.kind === 'RHS' && !p.square && p.h > p.b) {
      const Mp = fy * p.Zx, Lp = 0.13 * E * p.ry * Math.sqrt(p.J * p.A) / Mp;                                      // (F7-12)
      if (Lb > Lp) out.ltb = { Lp, why: 'ltb-hss', clause: 'F7.4' };
    }
    return out;
  },
  shear(p, fy, E) {
    if (p.kind === 'RHS') {
      const C = cv(p.ht, 5, fy, E);                                                                                 // G4 → G2.2: kv = 5, h = clear flat (outside − 3t)
      return { z: { phiVn: 0.9 * 0.6 * fy * (2 * p.h * p.t) * C, clause: 'G4' }, y: { phiVn: 0.9 * 0.6 * fy * (2 * p.b * p.t) * Math.min(1, cv(p.bt, 5, fy, E)), clause: 'G4' } };
    }
    const Fcr = Math.min(0.78 * E / Math.pow(p.dt, 1.5), 0.6 * fy);                                                // (G5-2b): the lower of the two expressions
    const v = { phiVn: 0.9 * Fcr * p.A / 2, clause: 'G5' };                                                         // (G5-1)
    return { z: v, y: v };
  },
};

// ------------------------------------------------------------------------------------------------------------------ EN 1993-1-1
export const EN = {
  /** Table 5.2: internal parts (RHS, c = outside − 3t) and tubes. → { compression, bending } class 1–4 and the walls' own classes. */
  classify(p, fy) {
    const eps = Math.sqrt(235 / fy), cls = (v, a, b, c) => (v <= a * eps ? 1 : v <= b * eps ? 2 : v <= c * eps ? 3 : 4);
    if (p.kind === 'CHS') {                                                                                         // d/t against 50ε², 70ε², 90ε²
      const e2 = eps * eps, k = p.dt <= 50 * e2 ? 1 : p.dt <= 70 * e2 ? 2 : p.dt <= 90 * e2 ? 3 : 4;
      return { compression: k, bending: k, epsilon: eps };
    }
    const flange = cls(Math.max(p.bt, p.ht), 33, 38, 42);                                                           // uniform compression, both walls (compression)
    const flangeB = cls(p.bt, 33, 38, 42), webB = cls(p.ht, 72, 83, 124);                                           // bending about the strong axis: compressed flange, web in bending
    const flangeB2 = cls(p.ht, 33, 38, 42), webB2 = cls(p.bt, 72, 83, 124);                                         // about the weak axis
    return { compression: flange, bending: Math.max(flangeB, webB, flangeB2, webB2), epsilon: eps };
  },
  resist(p, fy, na, cls) {
    const g0 = na.gammaM0, W = (pl, el) => (cls <= 2 ? pl : el);
    const Npl = p.A * fy / g0, My = W(p.Zx, p.Sx) * fy / g0, Mz = W(p.Zy, p.Sy) * fy / g0;
    const Avz = p.kind === 'CHS' ? p.Av : p.Avz, Avy = p.kind === 'CHS' ? p.Av : p.Avy;                              // 6.2.6(3)(e)(f)
    return { Npl, MyRd: My, MzRd: Mz, VzRd: Avz * fy / (SQRT3 * g0), VyRd: Avy * fy / (SQRT3 * g0), Mply: p.Zx * fy / g0, Mplz: p.Zy * fy / g0 };
  },
  /** 6.3.1: Table 6.2 curve c cold formed (a hot finished), Table 6.1 α; χ = lowest of y and z. */
  buckling(p, fy, E, Lcy, Lcz, na, hot = false) {
    const curve = hot ? 'a' : 'c', NA = p.A * fy;
    const lamY = Math.sqrt(NA / (Math.PI * Math.PI * E * p.Iy / (Lcy * Lcy))), lamZ = Math.sqrt(NA / (Math.PI * Math.PI * E * p.Iz / (Lcz * Lcz)));
    const chiY = chiOf(lamY, ALPHA[curve]), chiZ = chiOf(lamZ, ALPHA[curve]);
    return { NbRd: Math.min(chiY, chiZ) * NA / na.gammaM1, chiY, chiZ, lamY, lamZ, curve };
  },
  /** 6.2.9.1 for hollow sections: n = N/Npl; RHS a_w = (A − 2bt)/A, a_f = (A − 2ht)/A ≤ 0.5, M_N = Mpl (1 − n)/(1 − 0.5 a) ≤ Mpl; exponents 1.66/(1 − 1.13 n²) ≤ 6; CHS M_N = Mpl (1 − n^1.7), exponent 2. */
  momentAxial(p, fy, na, cls, N, My, Mz) {
    const R = EN.resist(p, fy, na, cls);
    if (cls === 3) return { ratio: (Math.abs(N) / p.A + Math.abs(My) / p.Sx + Math.abs(Mz) / p.Sy) / (fy / na.gammaM0), eq: '6.42' };
    const n = Math.abs(N) / R.Npl;
    if (n >= 1) return { ratio: Infinity, eq: '6.41' };
    if (p.kind === 'CHS') {
      const MN = R.Mply * (1 - Math.pow(n, 1.7));
      return { ratio: Math.pow(Math.hypot(My, Mz) / MN, 2), eq: '6.41' };
    }
    const aw = Math.min((p.A - 2 * p.b * p.t) / p.A, 0.5), af = Math.min((p.A - 2 * p.h * p.t) / p.A, 0.5);
    const MNy = Math.min(R.Mply * (1 - n) / (1 - 0.5 * aw), R.Mply), MNz = Math.min(R.Mplz * (1 - n) / (1 - 0.5 * af), R.Mplz);
    const e = Math.min(1.66 / (1 - 1.13 * n * n), 6);
    return { ratio: Math.pow(Math.abs(My) / MNy, e) + Math.pow(Math.abs(Mz) / MNz, e), eq: '6.41' };
  },
};

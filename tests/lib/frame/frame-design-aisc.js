/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-design-aisc.js — steel member checks to ANSI/AISC 360-16 (LRFD), doubly symmetric rolled I-shapes (0.7 SU.878,
 * session make-07). DOM-free, imports nothing. Units: mm, N, MPa, N·mm. Every function names the clause it follows; the
 * engine (frame-design.js) calls them and the report prints the clauses.
 *
 * Built: tension yielding (D2) and rupture when an effective net area is given; compression, flexural buckling about
 * both axes and torsional / flexural-torsional buckling (E3, E4); major-axis flexure with lateral-torsional buckling and
 * flange local buckling (F2, F3); minor-axis flexure (F6); shear of the web and, in the weak direction, of the flanges
 * (G2, G4); bending + axial force (H1.1). NOT built (the check says "not checked", never a number): slender elements
 * (E7, F3 slender, F4 web), welded shapes (kc), torsion (H3), shapes other than I, second-order effects (Chapter C: the
 * analysis is first order — use the direct analysis method's B1/B2 or a second-order run before relying on a result).
 *
 *   props(shape, sec) → section properties used here (Zx, Sx, ry, rts, ho, Cw …)
 *   slender(p, fy, E) → { compression, bending }   each null or { why, clause }: what stops a check (E7 / F3 slender, F4 web)
 *   tension(p, fy, fu, Ae?) → { phiPn, clause }
 *   compression(p, fy, E, G, Lcy, Lcz, Lt) → { phiPn, mode, Fcr, Fe, KLr }
 *   flexureMajor(p, fy, E, Lb, Cb) → { phiMn, Mp, Lp, Lr, zone }
 *   flexureMinor(p, fy, E) → { phiMn }
 *   shearMajor(p, fy, E) · shearMinor(p, fy, E) → { phiVn, phi, Cv }
 *   cb(M) → Cb of AISC F1-1 from the segment's moments { max, a, b, c } (absolute values)
 *   interaction(Pr, Pc, Mrx, Mcx, Mry, Mcy) → { ratio, eq } (H1-1a / H1-1b)
 */
export const EDITION = 'ANSI/AISC 360-16';
const FILLET = 1 - Math.PI / 4, FC = 0.2234;       // spandrel area / r² and its centroid distance from the corner / r

export function props(shape, sec) {
  const { d, bf, tw, tf } = shape, r = shape.r || 0;
  const ho = d - tf, hw = d - 2 * (tf + r), hc = d - 2 * tf;          // hw: clear between the fillets (AISC h = d − 2k)
  const Af = FILLET * r * r;
  const Zx = bf * tf * (d - tf) + tw * hc * hc / 4 + 4 * Af * (hc / 2 - FC * r);
  const Zy = tf * bf * bf / 2 + hc * tw * tw / 4 + 4 * Af * (tw / 2 + FC * r);
  const Sx = sec.Iy / (d / 2), Sy = sec.Iz / (bf / 2);
  const Cw = sec.Iz * ho * ho / 4;
  const rx = Math.sqrt(sec.Iy / sec.A), ry = Math.sqrt(sec.Iz / sec.A);
  const rts = Math.sqrt(Math.sqrt(sec.Iz * Cw) / Sx);
  return { d, bf, tw, tf, r, ho, hw, A: sec.A, Ix: sec.Iy, Iy: sec.Iz, J: sec.J, Zx, Zy, Sx, Sy, Cw, rx, ry, rts, htw: hw / tw, bt: bf / (2 * tf) };
}

/** What AISC's slender-element rules would need and we do not build: { compression, bending } = null | { why, clause }. */
export function slender(p, fy, E) {
  const k = Math.sqrt(E / fy);
  const out = { compression: null, bending: null };
  if (p.bt > 0.56 * k || p.htw > 1.49 * k) out.compression = { why: 'slender-compression', clause: 'E7' };       // Table B4.1a cases 1, 5
  if (p.bt > 1.0 * k) out.bending = { why: 'slender-flange', clause: 'F3' };                                     // Table B4.1b case 10 (λr)
  else if (p.htw > 3.76 * k) out.bending = { why: 'noncompact-web', clause: 'F4' };                              // case 15 (λp)
  return out;
}

export function tension(p, fy, fu, Ae = null) {
  const yielding = 0.9 * fy * p.A;                                              // (D2-1), φt = 0.90
  const rupture = Ae ? 0.75 * fu * Ae : Infinity;                               // (D2-2), φt = 0.75
  return { phiPn: Math.min(yielding, rupture), yielding, rupture, clause: rupture < yielding ? 'D2(b)' : 'D2(a)' };
}

export function compression(p, fy, E, G, Lcy, Lcz, Lt) {
  const Feof = (KLr) => Math.PI * Math.PI * E / (KLr * KLr);
  const Fcr = (Fe) => (fy / Fe <= 2.25 ? Math.pow(0.658, fy / Fe) * fy : 0.877 * Fe);        // (E3-2), (E3-3); Fy/Fe ≤ 2.25 ⇔ KL/r ≤ 4.71√(E/Fy)
  const KLry = Lcy / p.rx, KLrz = Lcz / p.ry;
  const Fey = Feof(KLry), Fez = Feof(KLrz);
  const Fet = (Math.PI * Math.PI * E * p.Cw / (Lt * Lt) + G * p.J) / (p.Ix + p.Iy);          // (E4-4), doubly symmetric
  const cands = [['y', Fey, KLry], ['z', Fez, KLrz], ['t', Fet, null]];
  const [mode, Fe, KLr] = cands.reduce((a, b) => (b[1] < a[1] ? b : a));
  const fcr = Fcr(Fe);
  return { phiPn: 0.9 * fcr * p.A, mode, Fe, Fcr: fcr, KLr, KLry, KLrz, Fey, Fez, Fet };
}

export function cb(M) {
  const { max, a, b, c } = M;
  return max < 1e-9 ? 1 : 12.5 * max / (2.5 * max + 3 * a + 4 * b + 3 * c);                  // (F1-1), Rm = 1
}

export function flexureMajor(p, fy, E, Lb, Cb) {
  const Mp = fy * p.Zx;
  const Lp = 1.76 * p.ry * Math.sqrt(E / fy);                                                 // (F2-5)
  const c = 1;                                                                                // doubly symmetric I (F2-8a)
  const x = p.J * c / (p.Sx * p.ho);
  const Lr = 1.95 * p.rts * E / (0.7 * fy) * Math.sqrt(x + Math.sqrt(x * x + 6.76 * Math.pow(0.7 * fy / E, 2)));   // (F2-6)
  let Mn, zone;
  if (Lb <= Lp) { Mn = Mp; zone = 'plastic'; }
  else if (Lb <= Lr) { Mn = Math.min(Mp, Cb * (Mp - (Mp - 0.7 * fy * p.Sx) * (Lb - Lp) / (Lr - Lp))); zone = 'inelastic'; }   // (F2-2)
  else {
    const q = Lb / p.rts;
    const Fcr = Cb * Math.PI * Math.PI * E / (q * q) * Math.sqrt(1 + 0.078 * x * q * q);     // (F2-4)
    Mn = Math.min(Mp, Fcr * p.Sx); zone = 'elastic';                                          // (F2-3)
  }
  // flange local buckling of a noncompact flange (F3-1): Table B4.1b case 10, λp = 0.38√(E/Fy), λr = 1.0√(E/Fy)
  const k = Math.sqrt(E / fy), lp = 0.38 * k, lr = 1.0 * k;
  let flb = null;
  if (p.bt > lp) { flb = Mp - (Mp - 0.7 * fy * p.Sx) * (p.bt - lp) / (lr - lp); Mn = Math.min(Mn, flb); }
  return { phiMn: 0.9 * Mn, Mp, Lp, Lr, zone, flb, Cb };
}

export function flexureMinor(p, fy, E) {
  const Mp = Math.min(fy * p.Zy, 1.6 * fy * p.Sy);                                            // (F6-1)
  const k = Math.sqrt(E / fy), lp = 0.38 * k, lr = 1.0 * k;
  let Mn = Mp;
  if (p.bt > lp) Mn = Math.min(Mp, fy * p.Zy - (fy * p.Zy - 0.7 * fy * p.Sy) * (p.bt - lp) / (lr - lp));   // (F6-2)
  return { phiMn: 0.9 * Mn, Mp };
}

function cv(h_t, kv, fy, E) {
  const a = Math.sqrt(kv * E / fy);
  if (h_t <= 1.10 * a) return 1;                                                              // (G2-3)
  if (h_t <= 1.37 * a) return 1.10 * a / h_t;                                                 // (G2-4)
  return 1.51 * kv * E / (h_t * h_t * fy);                                                    // (G2-5)
}
export function shearMajor(p, fy, E) {
  const Aw = p.d * p.tw;                                                                      // (G2-1)
  if (p.htw <= 2.24 * Math.sqrt(E / fy)) return { phiVn: 1.0 * 0.6 * fy * Aw, phi: 1.0, Cv: 1 };       // G2.1(a)
  const C = cv(p.htw, 5, fy, E);
  return { phiVn: 0.9 * 0.6 * fy * Aw * C, phi: 0.9, Cv: C };
}
export function shearMinor(p, fy, E) {
  const Aw = 2 * p.bf * p.tf;                                                                 // G4: Aw = bf tf per flange, kv = 1.2
  const C = cv(p.bt * 1, 1.2, fy, E);
  return { phiVn: 0.9 * 0.6 * fy * Aw * C, phi: 0.9, Cv: C };
}

export function interaction(Pr, Pc, Mrx, Mcx, Mry, Mcy) {
  const m = Mrx / Mcx + Mry / Mcy, a = Pr / Pc;
  return a >= 0.2 ? { ratio: a + 8 / 9 * m, eq: 'H1-1a' } : { ratio: a / 2 + m, eq: 'H1-1b' };
}

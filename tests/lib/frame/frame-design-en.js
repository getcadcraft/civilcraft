/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-design-en.js — steel member checks to EN 1993-1-1:2005 (+A1:2014), doubly symmetric rolled I and H sections, with
 * recommended values of the partial factors in an editable National Annex table (0.7 SU.878, session make-07). DOM-free,
 * imports nothing. Units: mm, N, MPa, N·mm. Each function names the clause it follows.
 *
 * Built: classification of I-sections (Table 5.2, classes 1–3; class 4 is "not checked": no effective-section method);
 * tension (6.2.3), compression (6.2.4), bending (6.2.5), shear with the plastic shear area (6.2.6, with EN 1993-1-5 §5 beyond the buckling limit) and the bending
 * reduction at high shear (6.2.8), bending + axial force (6.2.9), flexural and torsional buckling (6.3.1), lateral-torsional
 * buckling by the general case (6.3.2.2, curves of Table 6.4) with Mcr from the moment gradient, and bending + compression
 * by Annex B "method 2" (Tables B.1, B.2, B.3 in the simplified use described at `cm`). NOT built: class 4, welded sections,
 * shear buckling beyond 72ε/η by EN 1993-1-5 §5 (web contribution, unstiffened, non-rigid end post; its interaction with bending, §7, is "not checked"), torsion (6.2.7), second-order effects (5.2: first-order analysis
 * only — check α_cr ≥ 10 or use a second-order run before relying on a result).
 *
 *   NA_STEEL, cleanSteelNA(obj) → { gammaM0, gammaM1, gammaM2, eta }  recommended 1.00, 1.00, 1.25, η = 1.2 (EN 1993-1-5)
 *   props(shape, sec) → section properties used here (Wpl, Wel, Av, Iw …)
 *   classify(p, fy) → { flange, web, compression, bending, epsilon }   classes 1–4 (rolled I, Table 5.2)
 *   cross-section: tension / compression / bendingMajor / bendingMinor / shearMajor / shearMinor / momentAxial
 *   buckling(p, fy, E, G, Lcy, Lcz, Lt, M1) → { NbRd, chi, mode, … };   ltb(p, fy, E, G, Lb, C1, M1) → { MbRd, chiLT, Mcr, … }
 *   interaction(...) → Annex B method 2, eqs (6.61) and (6.62)
 */
export const EDITION = 'EN 1993-1-1:2005+A1:2014';

export const NA_STEEL = Object.freeze({ gammaM0: 1.0, gammaM1: 1.0, gammaM2: 1.25, eta: 1.2 });
export function cleanSteelNA(x) {
  const n = (v, d, lo, hi) => (typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : d);
  return { gammaM0: n(x?.gammaM0, 1.0, 0.8, 2), gammaM1: n(x?.gammaM1, 1.0, 0.8, 2), gammaM2: n(x?.gammaM2, 1.25, 0.8, 2), eta: n(x?.eta, 1.2, 1, 1.5) };
}

const ALPHA = { a0: 0.13, a: 0.21, b: 0.34, c: 0.49, d: 0.76 };       // Table 6.1

export function props(shape, sec) {
  const { d: h, bf: b, tw, tf } = shape, r = shape.r || 0;
  const hw = h - 2 * tf, c = h - 2 * tf - 2 * r;                       // hw: between the flanges; c: clear of the fillets
  const A = sec.A, Af = FILLET(r);
  const hc = h - 2 * tf;
  const Wply = b * tf * (h - tf) + tw * hc * hc / 4 + 4 * Af * (hc / 2 - 0.2234 * r);
  const Wplz = tf * b * b / 2 + hc * tw * tw / 4 + 4 * Af * (tw / 2 + 0.2234 * r);
  const Wely = sec.Iy / (h / 2), Welz = sec.Iz / (b / 2);
  const Iw = sec.Iz * (h - tf) * (h - tf) / 4;
  const Avz = Math.max(A - 2 * b * tf + (tw + 2 * r) * tf, 0);          // 6.2.6(3)(a), rolled I and H, load parallel to the web
  const Avy = A - hw * tw;                                              // 6.2.6(3)(c), load parallel to the flanges
  return { h, b, tw, tf, r, hw, c, A, Iy: sec.Iy, Iz: sec.Iz, It: sec.J, Iw, Wply, Wplz, Wely, Welz, Avz, Avy, iy: Math.sqrt(sec.Iy / A), iz: Math.sqrt(sec.Iz / A), cf: (b - tw - 2 * r) / 2, hb: h / b };
}
const FILLET = (r) => (1 - Math.PI / 4) * r * r;

/** Table 5.2: rolled I, parts in compression (flange) / bending and compression (web). */
export function classify(p, fy) {
  const eps = Math.sqrt(235 / fy);
  const cls = (v, a, b, c) => (v <= a * eps ? 1 : v <= b * eps ? 2 : v <= c * eps ? 3 : 4);
  const flange = cls(p.cf / p.tf, 9, 10, 14);
  const webBend = cls(p.c / p.tw, 72, 83, 124);
  const webComp = cls(p.c / p.tw, 33, 38, 42);
  return { flange, webBend, webComp, bending: Math.max(flange, webBend), compression: Math.max(flange, webComp), epsilon: eps };
}

export function tension(p, fy, fu, na, Anet = null) {
  const Npl = p.A * fy / na.gammaM0;                                    // (6.6)
  const Nu = Anet ? 0.9 * Anet * fu / na.gammaM2 : Infinity;            // (6.7)
  return { NtRd: Math.min(Npl, Nu), clause: Nu < Npl ? '6.2.3(2)b' : '6.2.3(2)a' };
}
export const compressionCS = (p, fy, na) => ({ NcRd: p.A * fy / na.gammaM0 });                  // (6.10)

export function bendingMajor(p, fy, na, cls) { return { McRd: (cls <= 2 ? p.Wply : p.Wely) * fy / na.gammaM0, Mpl: p.Wply * fy / na.gammaM0 }; }   // (6.13), (6.14)
export function bendingMinor(p, fy, na, cls) { return { McRd: (cls <= 2 ? p.Wplz : p.Welz) * fy / na.gammaM0 }; }

export function shearMajor(p, fy, na) {
  const Av = Math.max(p.Avz, na.eta * p.hw * p.tw);                     // 6.2.6(3)(a)
  const eps = Math.sqrt(235 / fy);
  const VplRd = Av * fy / (Math.sqrt(3) * na.gammaM0);                  // (6.18)
  const buckling = p.hw / p.tw > 72 * eps / na.eta;                     // 6.2.6(6)
  if (!buckling) return { VplRd, Av, buckling, VRd: VplRd };
  // EN 1993-1-5 §5.2: web contribution only (the flanges' share is left out), no intermediate stiffeners (kτ = 5.34),
  // non-rigid end post: χw = η for λ̄w < 0.83/η, else 0.83/λ̄w; the cap is η fy hw tw / (√3 γM1)
  const lamW = p.hw / (86.4 * p.tw * eps);                              // (5.6) with kτ = 5.34
  const chiW = lamW < 0.83 / na.eta ? na.eta : 0.83 / lamW;             // Table 5.1
  const VbRd = Math.min(chiW * fy * p.hw * p.tw / (Math.sqrt(3) * na.gammaM1), na.eta * fy * p.hw * p.tw / (Math.sqrt(3) * na.gammaM1));   // (5.2), (5.1)
  return { VplRd, Av, buckling, lamW, chiW, VbRd, VRd: VbRd };
}
export function shearMinor(p, fy, na) {
  return { VplRd: p.Avy * fy / (Math.sqrt(3) * na.gammaM0), Av: p.Avy };
}

/** 6.2.8: major-axis bending resistance with high shear (V > 0.5 Vpl): fy reduced in the shear area by (1 − ρ). */
export function bendingWithShear(p, fy, na, cls, VEd, VplRd) {
  const base = bendingMajor(p, fy, na, cls).McRd;
  if (VEd <= 0.5 * VplRd) return { McRd: base, rho: 0 };
  const rho = Math.pow(2 * VEd / VplRd - 1, 2);                          // (6.20)
  const Aw = p.hw * p.tw;
  const W = cls <= 2 ? p.Wply - rho * Aw * Aw / (4 * p.tw) : p.Wely;     // (6.30) for class 1–2 I-sections; class 3 is left unreduced
  return { McRd: Math.min(base, W * fy / na.gammaM0), rho };
}

/** 6.2.9.1: class 1–2 bending + axial force (6.36 / 6.38 / 6.39 / 6.41); class 3: stress check (6.42). Returns the largest ratio. */
export function momentAxial(p, fy, na, cls, NEd, My, Mz) {
  const Npl = p.A * fy / na.gammaM0;
  if (cls === 3) {
    const sig = Math.abs(NEd) / p.A + Math.abs(My) / p.Wely + Math.abs(Mz) / p.Welz;
    return { ratio: sig / (fy / na.gammaM0), eq: '6.42' };
  }
  const n = Math.abs(NEd) / Npl, a = Math.min((p.A - 2 * p.b * p.tf) / p.A, 0.5);
  const Mply = p.Wply * fy / na.gammaM0, Mplz = p.Wplz * fy / na.gammaM0;
  const MNy = Math.min(Mply * (1 - n) / (1 - 0.5 * a), Mply);            // (6.36)
  const MNz = n <= a ? Mplz : Mplz * (1 - Math.pow((n - a) / (1 - a), 2));   // (6.38), (6.39)
  if (n >= 1) return { ratio: Infinity, eq: '6.41' };
  const beta = Math.max(5 * n, 1);
  return { ratio: Math.pow(Math.abs(My) / MNy, 2) + Math.pow(Math.abs(Mz) / MNz, beta), eq: '6.41' };   // (6.41), α = 2
}

export function chiOf(lam, alpha, lam0 = 0.2) {
  if (lam <= lam0) return 1;
  const phi = 0.5 * (1 + alpha * (lam - 0.2) + lam * lam);
  return Math.min(1, 1 / (phi + Math.sqrt(phi * phi - lam * lam)));       // (6.49)
}
/** Table 6.2 buckling curve letters for a rolled I (h/b > 1.2 or ≤ 1.2; tf ≤ 40, ≤ 100 or more). */
export function curves(p) {
  const hb = p.h / p.b, t = p.tf;
  if (hb > 1.2) return t <= 40 ? { y: 'a', z: 'b' } : t <= 100 ? { y: 'b', z: 'c' } : { y: 'd', z: 'd' };
  return t <= 100 ? { y: 'b', z: 'c' } : { y: 'd', z: 'd' };
}

/** 6.3.1: Nb,Rd = χ A fy / γM1 for the lowest of y-y, z-z flexural and torsional buckling. */
export function buckling(p, fy, E, G, Lcy, Lcz, Lt, na) {
  const cv = curves(p);
  const Ncr = (I, L) => Math.PI * Math.PI * E * I / (L * L);
  const NA = p.A * fy;
  const lamY = Math.sqrt(NA / Ncr(p.Iy, Lcy)), lamZ = Math.sqrt(NA / Ncr(p.Iz, Lcz));
  const i0sq = (p.Iy + p.Iz) / p.A;
  const NcrT = (Math.PI * Math.PI * E * p.Iw / (Lt * Lt) + G * p.It) / i0sq;                // (6.52), doubly symmetric
  const lamT = Math.sqrt(NA / NcrT);
  const chiY = chiOf(lamY, ALPHA[cv.y]), chiZ = chiOf(lamZ, ALPHA[cv.z]), chiT = chiOf(lamT, ALPHA[cv.z]);   // 6.3.1.4: curve of the z-z axis
  const list = [['y', chiY, lamY], ['z', chiZ, lamZ], ['t', chiT, lamT]];
  const [mode, chi, lam] = list.reduce((a, b) => (b[1] < a[1] ? b : a));
  return { NbRd: chi * NA / na.gammaM1, chi, mode, lamY, lamZ, lamT, chiY, chiZ, chiT, curves: cv };
}

/** 6.3.2.2 (general case, Table 6.4). C1 = the moment-gradient factor of the segment's diagram. */
export function ltb(p, fy, E, G, Lb, C1, cls, na) {
  const W = cls <= 2 ? p.Wply : p.Wely;
  const Mcr = C1 * Math.PI * Math.PI * E * p.Iz / (Lb * Lb) * Math.sqrt(p.Iw / p.Iz + Lb * Lb * G * p.It / (Math.PI * Math.PI * E * p.Iz));   // zg = 0
  const lam = Math.sqrt(W * fy / Mcr);
  const curve = p.h / p.b <= 2 ? 'a' : 'b';                                                // Table 6.4
  const chi = chiOf(lam, ALPHA[curve], 0.2);
  return { MbRd: chi * W * fy / na.gammaM1, chiLT: chi, lamLT: lam, Mcr, curve };
}

/**
 * Annex B, method 2, for one station and one segment. All forces absolute, N compression.
 *   n = { NEd, My, Mz }, R = { NRk, MyRk, MzRk }, b = buckling(), l = ltb(), cm = { y, z, LT }
 *   cls 1–2: Table B.1 plastic; cls 3: elastic. kzy is taken from Table B.2 (members susceptible to torsional deformation)
 *   unless `braced` says the member cannot twist (then Table B.1's 0.6 kyy).
 * Returns { r1, r2 } = the left sides of (6.61) and (6.62).
 */
export function interaction(f, R, b, l, cm, cls, na, braced = false) {
  const ny = f.NEd / (b.chiY * R.NRk / na.gammaM1), nz = f.NEd / (b.chiZ * R.NRk / na.gammaM1);
  let kyy, kzz, kyz, kzy;
  const lY = b.lamY, lZ = b.lamZ;
  if (cls <= 2) {
    kyy = Math.min(cm.y * (1 + (lY - 0.2) * ny), cm.y * (1 + 0.8 * ny));
    kzz = Math.min(cm.z * (1 + (2 * lZ - 0.6) * nz), cm.z * (1 + 1.4 * nz));
    kyz = 0.6 * kzz;
  } else {
    kyy = Math.min(cm.y * (1 + 0.6 * lY * ny), cm.y * (1 + 0.6 * ny));
    kzz = Math.min(cm.z * (1 + 0.6 * lZ * nz), cm.z * (1 + 0.6 * nz));
    kyz = kzz;
  }
  if (braced) kzy = 0.6 * kyy;
  else if (cls <= 2) kzy = Math.max(1 - 0.1 * lZ / (cm.LT - 0.25) * nz, 1 - 0.1 / (cm.LT - 0.25) * nz);
  else kzy = Math.max(1 - 0.05 * lZ / (cm.LT - 0.25) * nz, 1 - 0.05 / (cm.LT - 0.25) * nz);
  const My = f.My / (l.chiLT * R.MyRk / na.gammaM1), Mz = f.Mz / (R.MzRk / na.gammaM1);
  return { r1: f.NEd / (b.chiY * R.NRk / na.gammaM1) + kyy * My + kyz * Mz, r2: f.NEd / (b.chiZ * R.NRk / na.gammaM1) + kzy * My + kzz * Mz, kyy, kzz, kyz, kzy };
}

/**
 * Equivalent uniform moment factor Cm of Table B.3 from a segment's moment series (signed, x in mm).
 * Linear diagram: 0.6 + 0.4ψ ≥ 0.4 (ψ = M_small / M_large of the end moments). A diagram with a load between the ends:
 * 0.95 + 0.05 αh (uniform load) or 0.90 + 0.10 αh (point load), αh = hogging end moment / sagging maximum, 0 when the
 * ends are not hogging. This is the table's two common shapes read by the diagram; other shapes → the same linear rule.
 */
export function cm(x, M, hasPointLoad) {
  const n = M.length - 1, M0 = M[0], M1 = M[n];
  const big = Math.max(Math.abs(M0), Math.abs(M1));
  if (big < 1e-9 && Math.max(...M.map(Math.abs)) < 1e-9) return 1;
  let dev = 0;
  for (let k = 0; k <= n; k++) dev = Math.max(dev, Math.abs(M[k] - (M0 + (M1 - M0) * x[k] / x[n])));
  const peak = Math.max(...M.map(Math.abs));
  if (dev <= 0.02 * peak) {
    const lo = Math.abs(M0) <= Math.abs(M1) ? M0 : M1, hi = Math.abs(M0) <= Math.abs(M1) ? M1 : M0;
    const psi = hi === 0 ? 1 : lo / hi;
    return Math.max(0.6 + 0.4 * psi, 0.4);
  }
  const Ms = Math.max(...M), Mh = Math.max(0, -Math.min(M0, M1));
  const ah = Ms > 1e-9 ? Math.min(Mh / Ms, 1) : 0;
  return hasPointLoad ? 0.90 + 0.10 * ah : 0.95 + 0.05 * ah;
}

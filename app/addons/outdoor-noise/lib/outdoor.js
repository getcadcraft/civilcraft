/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and keys; the host's panels pass t() and show the language files' words. */
/**
 * outdoor.js — outdoor sound propagation by CNOSSOS-EU (0.11 XE.3 phase S4, session sound-11). DOM-free; lib/acoustics is canonical.
 * Method: Directive (EU) 2015/996 Annex II § 2.5 as amended by Delegated Directive (EU) 2021/1226 (texts in refs/acoustics/, values in cnossos.js).
 * Equation numbers below are the directive's. Nothing here is typed from memory; the air-absorption coefficient is ISO 9613-1's formula
 * (acoustics.js airAbsorption, the same source the directive names).
 *
 * One propagation path in the vertical plane through a source S and a receiver R ("the unfolded Chinese screen", § 2.5.3):
 *   pathLevels({ lw, profile, source, receiver, p, gs, env, atmFreqs }) → { bands: [{ f, LH, LF, LLT, AH, AF, Adiv, Aatm, boundH, boundF, dif }], LAeqH, LAeqF, LAeqLT, d, notes }
 *     lw        sound power Lw,0,dir per octave (63 … 8 000 Hz), dB (directivity already applied, § 2.4.1)
 *     profile   [{ x, z, g }] the terrain and obstacles in the plane, ordered by x (m); g = ground factor G of the segment from this point to the next
 *               (Table 2.5.a); a wall is two points at the same x (such segments are left out of the mean plane, text under eq. 2.5.4)
 *     source    { x, h } x on the profile and the height above the profile there; receiver the same
 *     p         occurrence of favourable conditions on this path, 0 … 1 (eq. 2.5.9)
 *     gs        ground factor of the source area Gs (eq. 2.5.14; cnossos.js GS)
 *     env       { T, RH, p } for the air (default 15 °C, 70 %, 101.325 kPa, § 2.5.6)
 *     atmFreqs  the frequencies the air absorption is evaluated at. The directive asks for the exact centre frequencies (§ 2.5.6) but does not define them
 *               (ISO 9613-1 / IEC 61260 do; not in refs/): default = the nominal frequencies, and the result says so in `notes`.
 *   totalLevel(paths) — eq. 2.5.10 per band, eq. 2.5.11 in dB(A)
 *   The parts are exported for tests: meanPlane (2.5.2–2.5.4), gPath (Figure 2.5.b), gPathPrime (2.5.14), aDiv (2.5.12), aAtm (2.5.13), aGroundH (2.5.15–2.5.18),
 *   aGroundF (2.5.19–2.5.20), deltaDif (2.5.21–2.5.23), arcLength (2.5.25), longTerm (2.5.9), sumLevels (2.5.1), workingHours (2.4.2), imagePower (2.5.35, 2.5.37–2.5.38).
 *
 *   lateralLevels — eq. 2.5.33–2.5.34, one laterally diffracted path; groundTerm — Aground with no diffraction on a profile.
 * The pathfinder (reflections by image sources, lateral paths, the railway-barrier equivalent source of eq. 2.5.39–2.5.48) is pathfind.js; the method
 * leaves path finding to the software (§ 2.5.3). Emission is road.js and rail.js. Favourable-condition
 * edges are chosen on curved rays through the transform z + x²/2Γ (a circle of radius Γ ≫ the path drawn as a straight line); the lengths themselves are
 * the exact arcs of eq. 2.5.25.
 */
import { OCTAVES, AWC, C_SOUND, A0, ATM, DIF_CAP, E_MIN } from './cnossos.js';
import { airAbsorption } from './acoustics.js';

const lg = Math.log10;
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** eq. 2.5.1 / 2.5.10: the energy sum of levels. */
export const sumLevels = (levels) => 10 * lg(levels.reduce((s, L) => s + Math.pow(10, L / 10), 0));
/** eq. 2.5.12: geometrical divergence of a point source, d the 3-D distance (m). */
export const aDiv = (d) => 20 * lg(d) + 11;
/** eq. 2.5.13: atmospheric absorption, alpha in dB/km (ISO 9613-1), d in m. */
export const aAtm = (alphaDbPerKm, d) => alphaDbPerKm * d / 1000;
/** eq. 2.4.2: working-hours correction, T active hours per period, tref the period's hours. */
export const workingHours = (T, tref) => 10 * lg(T / tref);
/** eq. 2.5.9: long-term level from the favourable and homogeneous levels, p the occurrence (0 … 1). */
export const longTerm = (LF, LH, p) => 10 * lg(p * Math.pow(10, LF / 10) + (1 - p) * Math.pow(10, LH / 10));
/** eq. 2.5.25: length of the curved ray of radius Γ over a straight distance mn. */
export const arcLength = (mn, G) => 2 * G * Math.asin(Math.min(1, mn / (2 * G)));

/** eq. 2.5.2–2.5.4: the least-squares mean line Z = a·x + b of a profile [[x, H]]; vertical segments (x_{k+1} = x_k) are left out. */
export function meanPlane(pts) {
  let A = 0, B = 0;
  for (let k = 0; k + 1 < pts.length; k++) {
    const [x0, H0] = pts[k], [x1, H1] = pts[k + 1];
    if (x1 === x0) continue;
    const ak = (H1 - H0) / (x1 - x0), bk = (H0 * x1 - H1 * x0) / (x1 - x0);
    A += (2 / 3) * ak * (x1 ** 3 - x0 ** 3) + bk * (x1 ** 2 - x0 ** 2);
    B += ak * (x1 ** 2 - x0 ** 2) + 2 * bk * (x1 - x0);
  }
  const x1 = pts[0][0], xn = pts[pts.length - 1][0], D = xn - x1;
  if (!(D > 0)) return { a: 0, b: pts[0][1] };
  const a = 3 * (2 * A - B * (xn + x1)) / D ** 3;
  const b = 2 * (xn ** 3 - x1 ** 3) / D ** 4 * B - 3 * (xn + x1) / D ** 3 * A;
  return { a, b };
}
/** Equivalent height of a point over the mean line (§ 2.5.3): orthogonal distance, 0 when below. Also the signed value. */
export function eqHeight(P, pl) { const s = (P[1] - (pl.a * P[0] + pl.b)) / Math.sqrt(1 + pl.a * pl.a); return { z: Math.max(0, s), signed: s }; }
/** Distance between two points projected on the mean line, dp (§ 2.5.3). */
export const projDist = (P, Q, pl) => Math.abs((Q[0] - P[0]) + pl.a * (Q[1] - P[1])) / Math.sqrt(1 + pl.a * pl.a);
/** Mirror of a point in the mean line (the image source S′ / receiver R′, Figure 2.5.c). */
export function mirror(P, pl) { const s = (P[1] - (pl.a * P[0] + pl.b)) / (1 + pl.a * pl.a); return [P[0] + 2 * pl.a * s, P[1] - 2 * s]; }

/** Figure 2.5.b: Gpath = the fraction of absorbent ground over the path, by horizontal distance (2021 point (9)(a)), between x0 and x1. */
export function gPath(profile, x0, x1) {
  let s = 0, L = 0;
  for (let k = 0; k + 1 < profile.length; k++) {
    const a = Math.max(x0, profile[k].x), b = Math.min(x1, profile[k + 1].x);
    if (b > a) { s += (profile[k].g ?? 0) * (b - a); L += b - a; }
  }
  return L > 0 ? s / L : 0;
}
/** eq. 2.5.14: G′path, corrected near the source with Gs. */
export const gPathPrime = (G, Gs, dp, zs, zr) => (dp <= 30 * (zs + zr) ? G * dp / (30 * (zs + zr)) + Gs * (1 - dp / (30 * (zs + zr))) : G);

/** eq. 2.5.15–2.5.17 without the bound: the ground term for heights zs, zr over dp at frequency f with Gw. */
function groundCore(zs, zr, dp, f, Gw) {
  const k = 2 * Math.PI * f / C_SOUND;
  const w = 0.0185 * Math.pow(f, 2.5) * Math.pow(Gw, 2.6) / (Math.pow(f, 1.5) * Math.pow(Gw, 2.6) + 1.3e3 * Math.pow(f, 0.75) * Math.pow(Gw, 1.3) + 1.16e6);   // 2.5.17
  const Cf = dp * (1 + 3 * w * dp * Math.exp(-Math.sqrt(w * dp))) / (1 + w * dp);                                                                          // 2.5.16
  const q = Math.sqrt(2 * Cf / k), c = Cf / k;
  return -10 * lg(4 * k * k / (dp * dp) * (zs * zs - q * zs + c) * (zr * zr - q * zr + c));                                                                 // 2.5.15
}
/** eq. 2.5.15–2.5.18: Aground,H. gpath = the path's Gpath (0 → −3 dB, text under 2.5.18). */
export function aGroundH(zs, zr, dp, f, { Gw, Gm, gpath }) {
  if (gpath === 0) return -3;
  return Math.max(groundCore(zs, zr, dp, f, Gw), -3 * (1 - Gm));                                                                                           // 2.5.18 bound
}
/** eq. 2.5.19–2.5.20: Aground,F (heights raised for ray bending and turbulence; the bound uses the unmodified heights, 2021 point (9)(b)). */
export function aGroundF(zs, zr, dp, f, { Gw, Gm, gpath }) {
  const sum = Math.max(zs + zr, 1e-9);
  const min = dp <= 30 * sum ? -3 * (1 - Gm) : -3 * (1 - Gm) * (1 + 2 * (1 - 30 * sum / dp));                                                               // 2.5.20
  if (gpath === 0) return min;
  const dzs = A0 * (zs / sum) ** 2 * dp * dp / 2, dzr = A0 * (zr / sum) ** 2 * dp * dp / 2, dzT = 6e-3 * dp / sum;                                         // 2.5.19
  return Math.max(groundCore(zs + dzs + dzT, zr + dzr + dzT, dp, f, Gw), min);
}
/** eq. 2.5.23: C″ for multiple diffraction (e the length between the first and the last edge). */
export const cDouble = (e, lambda) => (e > E_MIN ? (1 + (5 * lambda / e) ** 2) / (1 / 3 + (5 * lambda / e) ** 2) : 1);
/** eq. 2.5.21–2.5.22 (Ch = 1) with the bounds of OJ L 168/38: cap 25 dB only on the Adif term of a horizontal edge. */
export function deltaDif(delta, lambda, { Cpp = 1, cap = false } = {}) {
  const x = 40 / lambda * Cpp * delta;
  let v = x >= -2 ? 10 * lg(3 + x) : 0;
  if (v < 0) v = 0;
  if (cap && v > DIF_CAP) v = DIF_CAP;
  return v;
}
/** eq. 2.5.35, 2.5.37, 2.5.38: power of an image source behind a reflector of absorption αr, with the retrodiffraction of path difference δ′ (≤ 0 in the clear area). */
export function imagePower(lw, alphaR, deltaPrime = null, lambda = 1) {
  const retro = deltaPrime == null ? 0 : deltaDif(deltaPrime, lambda);
  return lw + 10 * lg(1 - alphaR) - retro;
}

// ---- geometry in the vertical plane --------------------------------------------------------------------------------------------------------------------------
/** Upper hull of points [[x, z]] sorted by x (the "rubber band", Figure 2.5.d) — after `lift` (identity for straight rays, + x²/2Γ for curved ones). */
function upperHull(pts, lift) {
  const L = pts.map((p) => [p[0], lift(p)]), H = [];
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const idx = [];
  for (let i = 0; i < L.length; i++) {
    while (idx.length >= 2 && cross(L[idx[idx.length - 2]], L[idx[idx.length - 1]], L[i]) >= -1e-12) idx.pop();
    idx.push(i);
  }
  for (const i of idx) H.push(pts[i]);
  return H;
}
/** The top point of every x between S and R (a wall's top wins over its foot). */
function edgesBetween(profile, S, R) {
  const m = new Map();
  for (const p of profile) if (p.x > S[0] && p.x < R[0]) { const z = m.get(p.x); if (z === undefined || p.z > z) m.set(p.x, p.z); }
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([x, z]) => [x, z]);
}
const profileBetween = (profile, x0, x1) => {
  const out = [], at = (x) => { for (let k = 0; k + 1 < profile.length; k++) { const a = profile[k], b = profile[k + 1]; if (x >= a.x && x <= b.x && b.x > a.x) return a.z + (b.z - a.z) * (x - a.x) / (b.x - a.x); } return x <= profile[0].x ? profile[0].z : profile[profile.length - 1].z; };
  out.push([x0, at(x0)]);
  for (const p of profile) if (p.x > x0 && p.x < x1) out.push([p.x, p.z]);
  out.push([x1, at(x1)]);
  return out;
};
const groundAt = (profile, x) => profileBetween(profile, x, x)[0][1];

/** Path lengths over a chain of points, straight or as arcs of radius Γ. */
const chain = (pts, G) => { let s = 0; for (let i = 0; i + 1 < pts.length; i++) { const c = dist(pts[i], pts[i + 1]); s += G ? arcLength(c, G) : c; } return s; };

/**
 * The diffraction of one condition ('H' straight rays, 'F' arcs of radius Γ, eq. 2.5.24): which edges, the path difference δ (2.5.26–2.5.29; Figure 2.5.d as
 * replaced in 2021), e for C″, and whether diffraction applies (2021 point (9)(c): blocked, or δ > −λ/20 and the Rayleigh criterion δ > λ/4 − δ*).
 */
function diffractionGeometry(profile, S, R, cond, lambda) {
  const d = dist(S, R), G = cond === 'F' ? Math.max(1000, 8 * d) : 0;
  const lift = G ? (p) => p[1] + (p[0] - S[0]) ** 2 / (2 * G) : (p) => p[1];
  const cand = edgesBetween(profile, S, R);
  const hull = upperHull([S, ...cand, R], lift);
  const len = (pts) => chain(pts, G);
  if (hull.length > 2) {                                                                                     // masked: the rubber band over the edges
    const edges = hull.slice(1, -1), delta = len(hull) - len([S, R]);
    return { blocked: true, edges, delta, e: len(edges), G };
  }
  // not masked: the edge D with the largest (least negative) δ
  let best = null;
  for (const D of cand) {
    let delta;
    if (G) {                                                                                                 // eq. 2.5.27, A on the straight ray SR above D
      const A = [D[0], S[1] + (R[1] - S[1]) * (D[0] - S[0]) / (R[0] - S[0])];
      delta = 2 * arcLength(dist(S, A), G) + 2 * arcLength(dist(A, R), G) - arcLength(dist(S, D), G) - arcLength(dist(D, R), G) - arcLength(d, G);
    } else delta = -(dist(S, D) + dist(D, R) - d);                                                           // Figure 2.5.d, second case
    if (!best || delta > best.delta) best = { D, delta };
  }
  if (!best || !(best.delta > -lambda / 20)) return { blocked: false, applies: false, delta: best ? best.delta : -Infinity, G };
  // Rayleigh criterion with the mirror source and receiver in the two mean planes (2021 point (9)(c))
  const plS = meanPlane(profileBetween(profile, S[0], best.D[0])), plR = meanPlane(profileBetween(profile, best.D[0], R[0]));
  const Ss = mirror(S, plS), Rs = mirror(R, plR), D = best.D;
  const above = (D[1] - (Ss[1] + (Rs[1] - Ss[1]) * (D[0] - Ss[0]) / (Rs[0] - Ss[0]))) > 0;
  const raw = dist(Ss, D) + dist(D, Rs) - dist(Ss, Rs), deltaStar = above ? raw : -raw;
  const applies = best.delta > lambda / 4 - deltaStar;
  return { blocked: false, applies, edges: [D], delta: best.delta, e: 0, G, deltaStar };
}

/** δ of the path from P to Q over the same edges (for the image source S′ / image receiver R′). */
function deltaOver(P, Q, edges, G) {
  const pts = [P, ...edges, Q], l = (a, b) => (G ? arcLength(dist(a, b), G) : dist(a, b));
  let s = 0; for (let i = 0; i + 1 < pts.length; i++) s += l(pts[i], pts[i + 1]);
  const direct = l(P, Q);
  // a path that is not masked keeps the sign of Figure 2.5.d's second case: the straight ray passes above the edge
  if (edges.length === 1) { const D = edges[0], yLine = P[1] + (Q[1] - P[1]) * (D[0] - P[0]) / (Q[0] - P[0]); if (yLine > D[1]) return -(s - direct); }
  return s - direct;
}

/**
 * Aboundary for one band and one condition: either Aground (no diffraction) or Adif = Δdif(S,R) + Δground(S,O) + Δground(On,R) (eq. 2.5.30–2.5.32 as replaced in 2021).
 */
/** Aground with no diffraction over the whole path S → R (one mean plane; Gw = G′path in H, Gpath in F; Gm = G′path; Table 2.5.b). */
function groundOnly(profile, S, R, f, cond, gs) {
  const aG = cond === 'F' ? aGroundF : aGroundH;
  const pl = meanPlane(profileBetween(profile, S[0], R[0])), zs = eqHeight(S, pl).z, zr = eqHeight(R, pl).z, dp = projDist(S, R, pl);
  const gp = gPath(profile, S[0], R[0]), gpp = gPathPrime(gp, gs, dp, zs, zr);
  return aG(zs, zr, dp, f, { Gw: cond === 'F' ? gp : gpp, Gm: gpp, gpath: gp });
}
function boundary(profile, S, R, f, cond, gs) {
  const lambda = C_SOUND / f, g = diffractionGeometry(profile, S, R, cond, lambda);
  const aG = cond === 'F' ? aGroundF : aGroundH;
  if (!g.blocked && !g.applies) return { A: groundOnly(profile, S, R, f, cond, gs), diffraction: false, blocked: false };
  const O1 = g.edges[0], On = g.edges[g.edges.length - 1], Cpp = g.edges.length > 1 ? cDouble(g.e, lambda) : 1;
  const difSR = deltaDif(g.delta, lambda, { Cpp });
  // source side
  const plS = meanPlane(profileBetween(profile, S[0], O1[0])), hS = eqHeight(S, plS), zos = eqHeight(O1, plS).z, dpS = projDist(S, O1, plS);
  const gpS = gPath(profile, S[0], O1[0]), gppS = gPathPrime(gpS, gs, dpS, hS.z, zos);
  const AgSO = aG(hS.z, zos, dpS, f, { Gw: cond === 'F' ? gpS : gppS, Gm: gppS, gpath: gpS });
  let dGS;
  if (hS.signed < 0) dGS = AgSO;                                                                             // 2021: source below the mean plane
  else { const difSpR = deltaDif(deltaOver(mirror(S, plS), R, g.edges, g.G), lambda, { Cpp }); dGS = -20 * lg(1 + (Math.pow(10, -AgSO / 20) - 1) * Math.pow(10, -(difSpR - difSR) / 20)); }   // 2.5.31
  // receiver side (Gpath, no G′ correction: the source is the edge)
  const plR = meanPlane(profileBetween(profile, On[0], R[0])), hR = eqHeight(R, plR), zor = eqHeight(On, plR).z, dpR = projDist(On, R, plR);
  const gpR = gPath(profile, On[0], R[0]);
  const AgOR = aG(zor, hR.z, dpR, f, { Gw: gpR, Gm: gpR, gpath: gpR });
  let dGR;
  if (hR.signed < 0) dGR = AgOR;
  else { const difSRp = deltaDif(deltaOver(S, mirror(R, plR), g.edges, g.G), lambda, { Cpp }); dGR = -20 * lg(1 + (Math.pow(10, -AgOR / 20) - 1) * Math.pow(10, -(difSRp - difSR) / 20)); }   // 2.5.32
  const difCapped = Math.min(difSR, DIF_CAP);
  return { A: difCapped + dGS + dGR, diffraction: true, blocked: g.blocked, edges: g.edges.length, first: g.edges[0], delta: g.delta, difSR: difCapped, dGS, dGR };
}

export function pathLevels({ lw, profile, source, receiver, p = 0.5, gs = 0, env = {}, atmFreqs = null }) {
  if (!Array.isArray(lw) || lw.length !== OCTAVES.length) throw new Error('lw needs one level per octave, 63 Hz to 8 kHz');
  if (!Array.isArray(profile) || profile.length < 2) throw new Error('profile needs at least two points');
  const prof = profile.map((q) => ({ x: Number(q.x), z: Number(q.z), g: q.g == null ? 0 : Number(q.g) }));
  const S = [Number(source.x), groundAt(prof, source.x) + Number(source.h)], R = [Number(receiver.x), groundAt(prof, receiver.x) + Number(receiver.h)];
  if (!(R[0] > S[0])) throw new Error('the receiver must be further along the profile than the source');
  const e = { ...ATM, ...env }, d = dist(S, R), notes = [];
  const fa = Array.isArray(atmFreqs) && atmFreqs.length === OCTAVES.length ? atmFreqs : OCTAVES;
  if (fa === OCTAVES) notes.push({ key: 'ac.out.note.nominal' });
  const bands = OCTAVES.map((f, i) => {
    const Adiv = aDiv(d), Aatm = aAtm(airAbsorption(fa[i], e) * 1000, d);
    const bH = boundary(prof, S, R, f, 'H', gs), bF = boundary(prof, S, R, f, 'F', gs);
    const AH = Adiv + Aatm + bH.A, AF = Adiv + Aatm + bF.A;                                                  // 2.5.8, 2.5.6 (2021)
    const LH = lw[i] - AH, LF = lw[i] - AF;                                                                  // 2.5.7, 2.5.5
    return { f, Adiv, Aatm, boundH: bH, boundF: bF, AH, AF, LH, LF, LLT: longTerm(LF, LH, p) };
  });
  const aw = (key) => sumLevels(bands.map((b, i) => b[key] + AWC[i]));                                     // 2.5.11
  return { bands, d, LAeqH: aw('LH'), LAeqF: aw('LF'), LAeqLT: aw('LLT'), notes };
}
/** eq. 2.5.10 and 2.5.11 over several paths (the direct path, its image sources …). */
export function totalLevel(paths) {
  const per = OCTAVES.map((_, i) => sumLevels(paths.map((p) => p.bands[i].LLT)));
  return { bands: per, LAeq: sumLevels(per.map((L, i) => L + AWC[i])) };
}

/**
 * eq. 2.5.33–2.5.34 (as replaced in 2021): the level of one laterally diffracted path (vertical edges; real point sources only — the caller checks the
 * conditions of OJ L 269/73). `profile` is the ground under the path unfolded along it (x = distance along the path in plan), source and receiver as in
 * pathLevels. d = the direct 3-D distance S → R (Adiv); pathLength = the length of the path round the edges (Aatm); delta, e, nEdges from the convex
 * connection (pathfind.js lateralPaths). Δdif,H(S,R) is eq. 2.5.21 (C″ for several edges, 2.5.23) and is used in both conditions (text under 2.5.34).
 * favourable = false when the curved ray is not blocked: then this path has no favourable part (LF = −∞; "lateral diffraction may be considered under
 * homogeneous propagation conditions but not under favourable propagation conditions").
 */
export function lateralLevels({ lw, profile, source, receiver, d, pathLength, delta, e = 0, nEdges = 1, p = 0.5, gs = 0, env = {}, atmFreqs = null, favourable = true }) {
  const prof = profile.map((q) => ({ x: Number(q.x), z: Number(q.z), g: q.g == null ? 0 : Number(q.g) }));
  const S = [Number(source.x), groundAt(prof, source.x) + Number(source.h)], R = [Number(receiver.x), groundAt(prof, receiver.x) + Number(receiver.h)];
  const en = { ...ATM, ...env }, fa = Array.isArray(atmFreqs) && atmFreqs.length === OCTAVES.length ? atmFreqs : OCTAVES;
  const bands = OCTAVES.map((f, i) => {
    const lambda = C_SOUND / f, Cpp = nEdges > 1 ? cDouble(e, lambda) : 1;
    const dif = deltaDif(delta, lambda, { Cpp }), Adiv = aDiv(d), Aatm = aAtm(airAbsorption(fa[i], en) * 1000, pathLength);
    const AH = Adiv + Aatm + groundOnly(prof, S, R, f, 'H', gs) + dif;
    const AF = favourable ? Adiv + Aatm + groundOnly(prof, S, R, f, 'F', gs) + dif : Infinity;
    const LH = lw[i] - AH, LF = lw[i] - AF;
    return { f, Adiv, Aatm, dif, AH, AF, LH, LF, LLT: longTerm(LF, LH, p) };
  });
  const aw = (key) => sumLevels(bands.map((b, i) => b[key] + AWC[i]));
  return { bands, LAeqH: aw('LH'), LAeqF: favourable ? aw('LF') : -Infinity, LAeqLT: aw('LLT') };
}
/** Aground with no diffraction for one band and condition on a profile (exported for lateral paths and tests). */
export function groundTerm({ profile, source, receiver, f, cond = 'H', gs = 0 }) {
  const prof = profile.map((q) => ({ x: Number(q.x), z: Number(q.z), g: q.g == null ? 0 : Number(q.g) }));
  return groundOnly(prof, [source.x, groundAt(prof, source.x) + source.h], [receiver.x, groundAt(prof, receiver.x) + receiver.h], f, cond, gs);
}

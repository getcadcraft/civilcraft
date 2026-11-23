/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and keys; the host's panels pass t() and show the language files' words. */
/**
 * pathfind.js — the paths besides the direct one, for outdoor.js (0.11 XE.3 phase S4, session sound-11). DOM-free; lib/acoustics is canonical.
 * CNOSSOS-EU leaves finding the paths to the software ("the path finding", § 2.5.3): this file is ours. What happens on a path once found is the directive's
 * (Directive (EU) 2015/996 Annex II § 2.5.6 as amended by Delegated Directive (EU) 2021/1226; texts in refs/acoustics/), with the equation numbers below.
 *
 * Plan geometry is in metres, x/y; heights z are absolute (m).
 *
 *   reflectedPaths(S, R, reflectors, { order }) → [{ via: [{ id, P, t, seg }], plan: [S, P1, …, R], planLength, firstDir }]
 *       image sources in plan of vertical reflectors (Figure 2.5.g): each reflector is { id, a: {x,y}, b: {x,y}, side?: +1|−1 } (side: the only face that
 *       reflects, +1 = the left of a → b; none = both faces, a thin barrier). Order 1 or 2 (the 2015 text: "at least the first reflection shall be considered").
 *       A reflection point must lie on the segment, and the reflector's width seen from the incident ray must be ≥ 0.5 m (2021 point (9)(j)).
 *   reflectorOk(width, height) — the 0.5 m rule on both sizes (2021 point (9)(j); cnossos.js REFLECTOR).
 *   retroDelta(S, O, R, G) — δ′ of eq. 2.5.36 in the unfolded section, S, O (the reflector's top over the reflection point), R as [x, z]; G = Γ for curved rays
 *       (favourable conditions, eq. 2.5.24–2.5.25) or 0 for straight ones. rayAbove(S, R, x, G) — the height of the ray at x (straight, or the arc of radius Γ).
 *   lateralPaths(S, R, obstacles) → up to two paths round vertical edges (2021 point (9)(i), OJ L 269/73): in the lateral plane (perpendicular to the
 *       vertical plane through S and R, containing S and R), the shortest convex connection from S to R round the parts of the obstacles that reach the plane.
 *       obstacles = [{ id, pts: [{ x, y, top }], closed? }] — only those the direct ray passes through (the caller picks them). Returns
 *       [{ side, edges: [{ x, y, z }], plan: [{ x, y }], length, delta, e }], length = 3-D length round the edges, delta = length − |SR| (> 0), e = the length
 *       from the first to the last edge (for C″, eq. 2.5.23).
 *   trainBarrierSource({ lw, hs, dB, hB, dR, hR, alpha, Cref, lambdas }) — the equivalent source of a railway next to a reflecting barrier, eq. 2.5.39–2.5.48 (2021
 *       point (9)(k), OJ L 269/73–75).
 *
 * Readings of the text, stated (each also in `notes` where it applies):
 *  - eq. 2.5.46 prints the reflection points as dᵢ = −(2i − q)·d_b. There is no q anywhere else; Figure 2.5.k puts P₁ at −d_B, P₂ at −3d_B, P₃ at −5d_B, so
 *    q is read as 1: dᵢ = −(2i − 1)·d_B.
 *  - eq. 2.5.48 is used as printed: h_R′ = max(h_R, h_B (d_B + d_R − d_n)/(d_B − d_n)). That is the line of sight from (d_n, 0) — the text's sight line from S_n
 *    to B takes S_n at height 0, not at h_s.
 *  - The text gives no highest image order N for eq. 2.5.39: images are added until the next one changes the sum by less than 0.01 dB in every band
 *    (at most 50).
 *  - "dB > 5 hB or α(f) > 0,8: no train–barrier interaction": the α test is per octave band, so a band above 0.8 keeps the real source.
 */
import { C_SOUND, REFLECTOR } from './cnossos.js';
import { deltaDif, arcLength } from './outdoor.js';

const lg = Math.log10;
const hyp = Math.hypot;
const EPS = 1e-9;

/** Mirror of point P in the line through a and b (plan). */
export function mirrorPoint(P, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
  const t = ((P.x - a.x) * dx + (P.y - a.y) * dy) / L2, fx = a.x + t * dx, fy = a.y + t * dy;
  return { x: 2 * fx - P.x, y: 2 * fy - P.y };
}
/** Which side of a → b a point is on: +1 left, −1 right, 0 on the line. */
export const sideOf = (P, a, b) => Math.sign((b.x - a.x) * (P.y - a.y) - (b.y - a.y) * (P.x - a.x));
/** Intersection of segment p→q with segment a→b: { t (on p→q), u (on a→b), x, y } or null. */
export function segHit(p, q, a, b) {
  const rx = q.x - p.x, ry = q.y - p.y, sx = b.x - a.x, sy = b.y - a.y, den = rx * sy - ry * sx;
  if (Math.abs(den) < EPS) return null;
  const t = ((a.x - p.x) * sy - (a.y - p.y) * sx) / den, u = ((a.x - p.x) * ry - (a.y - p.y) * rx) / den;
  if (t < -EPS || t > 1 + EPS || u < -EPS || u > 1 + EPS) return null;
  return { t, u, x: p.x + t * rx, y: p.y + t * ry };
}
/** 2021 point (9)(j): a reflector counts when its height and its width (both through the reflection point, seen from the incident ray) are ≥ 0.5 m. */
export const reflectorOk = (width, height) => width >= REFLECTOR.minSize && height >= REFLECTOR.minSize;

/** The width of a straight reflector a → b seen from the direction of the incident ray in → P (its length across that direction). */
function widthSeen(a, b, from, P) {
  const dx = P.x - from.x, dy = P.y - from.y, L = hyp(dx, dy) || 1, sx = b.x - a.x, sy = b.y - a.y;
  return Math.abs(sx * dy - sy * dx) / L;   // |segment × unit ray|
}

/**
 * Image sources in plan (Figure 2.5.g), order 1 or 2. A path is kept when every reflection point is on its segment, both ends are on the reflecting side of
 * each reflector, and the width rule holds; the height rule needs the terrain and is the caller's (reflectorOk).
 */
export function reflectedPaths(S, R, reflectors, { order = 1 } = {}) {
  const out = [];
  const valid = (r, from, to) => {
    const sf = sideOf(from, r.a, r.b), st = sideOf(to, r.a, r.b);
    if (sf === 0 || sf !== st) return false;            // both on the same side: the ray comes back
    if (r.side && sf !== r.side) return false;          // a building face reflects outwards only
    return true;
  };
  // order 1
  for (const r of reflectors) {
    if (!valid(r, S, R)) continue;
    const Si = mirrorPoint(S, r.a, r.b), h = segHit(Si, R, r.a, r.b);
    if (!h || h.t <= EPS || h.t >= 1 - EPS) continue;
    const P = { x: h.x, y: h.y };
    if (widthSeen(r.a, r.b, S, P) < REFLECTOR.minSize) continue;
    const plan = [S, P, R];
    out.push({ via: [{ id: r.id, seg: r, P, t: h.u }], plan, planLength: hyp(P.x - S.x, P.y - S.y) + hyp(R.x - P.x, R.y - P.y), firstDir: { x: P.x - S.x, y: P.y - S.y } });
  }
  if (order < 2) return out;
  // order 2: S reflects on r1, then r2, then reaches R. Image of S in r1, image of that in r2; back-trace from R.
  for (const r1 of reflectors) for (const r2 of reflectors) {
    if (r1 === r2) continue;
    const S1 = mirrorPoint(S, r1.a, r1.b), S2 = mirrorPoint(S1, r2.a, r2.b);
    const h2 = segHit(S2, R, r2.a, r2.b);
    if (!h2 || h2.t <= EPS || h2.t >= 1 - EPS) continue;
    const P2 = { x: h2.x, y: h2.y };
    const h1 = segHit(S1, P2, r1.a, r1.b);
    if (!h1 || h1.t <= EPS || h1.t >= 1 - EPS) continue;
    const P1 = { x: h1.x, y: h1.y };
    if (!valid(r1, S, P2) || !valid(r2, P1, R)) continue;
    if (widthSeen(r1.a, r1.b, S, P1) < REFLECTOR.minSize || widthSeen(r2.a, r2.b, P1, P2) < REFLECTOR.minSize) continue;
    const plan = [S, P1, P2, R];
    let L = 0; for (let i = 0; i + 1 < plan.length; i++) L += hyp(plan[i + 1].x - plan[i].x, plan[i + 1].y - plan[i].y);
    out.push({ via: [{ id: r1.id, seg: r1, P: P1, t: h1.u }, { id: r2.id, seg: r2, P: P2, t: h2.u }], plan, planLength: L, firstDir: { x: P1.x - S.x, y: P1.y - S.y } });
  }
  return out;
}

/** The height of the ray S → R at x in the unfolded section: the straight line, or (G > 0) the arc of radius G through S and R bulging upwards. */
export function rayAbove(S, R, x, G = 0) {
  const t = (x - S[0]) / (R[0] - S[0]), z = S[1] + (R[1] - S[1]) * t;
  if (!G) return z;
  const c = hyp(R[0] - S[0], R[1] - S[1]), s = t * c;                         // distance along the chord
  const sag = Math.sqrt(Math.max(0, G * G - (s - c / 2) ** 2)) - Math.sqrt(Math.max(0, G * G - c * c / 4));
  const ang = Math.atan2(R[1] - S[1], R[0] - S[0]);
  return z + sag / Math.cos(ang);                                             // the sagitta is square to the chord; its vertical rise at x
}
/** eq. 2.5.36: δ′ = −(SO + OR − SR) in the unfolded section; with G > 0 the three lengths are arcs of radius G (eq. 2.5.25). */
export function retroDelta(S, O, R, G = 0) {
  const l = (a, b) => (G ? arcLength(hyp(b[0] - a[0], b[1] - a[1]), G) : hyp(b[0] - a[0], b[1] - a[1]));
  return -(l(S, O) + l(O, R) - l(S, R));
}
/** eq. 2.5.37: Δretrodif from δ′ (the same form as eq. 2.5.21, Ch = 1). */
export const retroDif = (deltaPrime, lambda) => deltaDif(deltaPrime, lambda);

// ---- lateral paths ------------------------------------------------------------------------------------------------------------------------------------------
function hull(points) {
  const P = points.slice().sort((a, b) => a.X - b.X || a.Y - b.Y);
  const cross = (o, a, b) => (a.X - o.X) * (b.Y - o.Y) - (a.Y - o.Y) * (b.X - o.X);
  const lo = [], up = [];
  for (const p of P) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 1e-12) lo.pop(); lo.push(p); }
  for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 1e-12) up.pop(); up.push(p); }
  up.pop(); lo.pop();
  return lo.concat(up);   // counter-clockwise
}

/**
 * Up to two laterally diffracted paths (2021 point (9)(i)). S, R: { x, y, z }. The lateral plane holds the line SR and the horizontal across it; a point of an
 * obstacle is in the "intersection area" when the obstacle's top there is at or above the plane. Each obstacle polyline is sampled every ≤ 0.5 m along its
 * length so that the parts above the plane are found where the top crosses it.
 */
export function lateralPaths(S, R, obstacles) {
  const dx = R.x - S.x, dy = R.y - S.y, D = hyp(dx, dy);
  if (!(D > 0)) return [];
  const ux = dx / D, uy = dy / D, s = (R.z - S.z) / D, k = Math.sqrt(1 + s * s);
  const toPlane = (x, y) => { const u = (x - S.x) * ux + (y - S.y) * uy, v = -(x - S.x) * uy + (y - S.y) * ux; return { u, v }; };
  const pts = [{ X: 0, Y: 0, end: 'S' }, { X: D * k, Y: 0, end: 'R' }];
  for (const ob of obstacles) {
    const ring = ob.closed ? [...ob.pts, ob.pts[0]] : ob.pts;
    for (let i = 0; i + 1 < ring.length; i++) {
      const a = ring[i], b = ring[i + 1], L = hyp(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(L / 0.5));
      for (let j = 0; j <= n; j++) {
        const t = j / n, x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t, top = a.top + (b.top - a.top) * t;
        const { u, v } = toPlane(x, y), zPlane = S.z + s * u;
        if (top >= zPlane) pts.push({ X: u * k, Y: v, x, y, z: zPlane });
      }
    }
  }
  if (pts.length < 3) return [];
  const H = hull(pts), iS = H.findIndex((p) => p.end === 'S'), iR = H.findIndex((p) => p.end === 'R');
  if (iS < 0 || iR < 0) return [];                       // S or R inside the obstacles' hull: no convex connection round them
  const chain = (step) => { const c = []; let i = iS; while (true) { c.push(H[i]); if (i === iR) break; i = (i + step + H.length) % H.length; } return c; };
  const out = [];
  for (const [side, step] of [['right', 1], ['left', -1]]) {   // counter-clockwise from S passes below SR (right side, v < 0) first
    const c = chain(step);
    if (c.length < 3) continue;                          // straight through: not a lateral path (the direct ray is blocked, so this does not happen)
    let length = 0; for (let i = 0; i + 1 < c.length; i++) length += hyp(c[i + 1].X - c[i].X, c[i + 1].Y - c[i].Y);
    let e = 0; for (let i = 1; i + 2 < c.length; i++) e += hyp(c[i + 1].X - c[i].X, c[i + 1].Y - c[i].Y);
    const edges = c.slice(1, -1).map((p) => ({ x: p.x, y: p.y, z: p.z }));
    out.push({ side, edges, plan: [{ x: S.x, y: S.y }, ...edges.map((p) => ({ x: p.x, y: p.y })), { x: R.x, y: R.y }], length, delta: length - D * k, e });
  }
  return out;
}

// ---- railway next to a reflecting barrier (eq. 2.5.39–2.5.48) ----------------------------------------------------------------------------------------------
/**
 * lw per octave (the real source), hs its height over the nearside railhead, dB/hB the barrier top (distance from the railhead, height over it), dR/hR the
 * receiver behind the barrier, alpha[8] the barrier's inner-side absorption, Cref the vehicle body's reflection coefficient (1; 0 for open flat-bed freight
 * wagons), lambdas[8] the wavelengths. Returns { lw, applied: [8] booleans, N, notes }.
 */
export function trainBarrierSource({ lw, hs, dB, hB, dR, hR, alpha, Cref = 1, lambdas }) {
  const notes = [{ key: 'ac.pf.note.q1' }, { key: 'ac.pf.note.eq248' }];
  if (!(dB > 0) || !(dR > 0) || !(hB > 0) || dB > 5 * hB) return { lw: lw.slice(), applied: lw.map(() => false), N: 0, notes: [{ key: 'ac.pf.note.trainfar' }] };
  const B = [dB, hB], R = [dB + dR, hR], dist = (a, b) => hyp(b[0] - a[0], b[1] - a[1]);
  const Sn = (n) => [-2 * n * dB, hs];
  const r0 = dist(Sn(0), R);
  const Dn = (n, lam) => {                                                         // eq. 2.5.43 with 2.5.21 (C″ = 1)
    const S = Sn(n), above = B[1] > S[1] + (R[1] - S[1]) * (B[0] - S[0]) / (R[0] - S[0]);
    const raw = dist(S, B) + dist(B, R) - dist(S, R);
    return deltaDif(above ? raw : -raw, lam);
  };
  const out = [], applied = [];
  let Nmax = 0;
  lw.forEach((L, i) => {
    const a = alpha[i], lam = lambdas[i];
    if (!(a <= 0.8)) { out.push(L); applied.push(false); return; }
    const D0 = Dn(0, lam);
    let sum = 0, n = 0;
    for (; n <= 50; n++) {
      const S = Sn(n), dn = S[0], rn = dist(S, R);
      let dL = 20 * lg(r0 / rn) + (D0 - Dn(n, lam));                              // 2.5.40, 2.5.42
      if (n > 0) {
        dL += 10 * n * lg(1 - a) + (Cref > 0 ? 10 * n * lg(Cref) : -Infinity);       // 2.5.44, 2.5.45
        const Rp = [dB + dR, Math.max(hR, hB * (dB + dR - dn) / (dB - dn))];      // 2.5.47, 2.5.48 as printed
        let retro = 0;
        for (let k = 1; k <= n; k++) retro += retroDif(retroDelta(S, [-(2 * k - 1) * dB, hB], Rp), lam);   // 2.5.46 with dᵢ = −(2i − 1)d_B
        dL -= retro;
      }
      const term = Number.isFinite(dL) ? Math.pow(10, (L + dL) / 10) : 0;
      if (n > 0 && (term === 0 || 10 * lg((sum + term) / sum) < 0.01)) { sum += term; break; }
      sum += term;
    }
    Nmax = Math.max(Nmax, n);
    out.push(10 * lg(sum)); applied.push(true);                                   // 2.5.39
  });
  return { lw: out, applied, N: Nmax, notes };
}
export const wavelengths = (octaves) => octaves.map((f) => C_SOUND / f);

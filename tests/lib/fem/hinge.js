/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hinge.js — plastic section capacity and the hinge yield function (0.9 SU.1056, nonlinear static). DOM-free. Derived here from first principles; no table
 * from FEMA 356 / ASCE 41 or any other standard is used, and no acceptance limit (IO, LS, CP) is given.
 *
 * Fully plastic section (rigid–perfectly plastic fibres, stress ±fy): for a section made of rectangles, a neutral axis at height y0 gives, exactly,
 *   N(y0) = fy (A_above − A_below)      M(y0) = fy (S_above − S_below)       (S = first moment about the centroidal axis, tension above y0)
 * N falls monotonically from +fy·A to −fy·A as y0 rises, so M(N) is found by bisection on y0. Closed forms to check against (tools/fem/test-fem-dynamics.mjs):
 * a rectangle b × h: M = Mp (1 − (N/Np)²), Mp = fy b h²/4, Np = fy b h (the textbook yield surface, Chen & Atsuta, Theory of Beam-Columns vol. 1 ch. 2; derived in the test);
 * an I-section about its strong axis with the neutral axis in the web: M = Mp − N²/(4 tw fy). Fillets are ignored (plastic modulus a little low, conservative).
 *
 * Biaxial bending: the exact fully plastic surface of an I-section in (N, My, Mz) is not a simple formula. Used here: μ = sqrt((My / Mpy(N))² + (Mz / Mpz(N))²) with the
 * exact uniaxial capacities Mpy(N), Mpz(N); the hinge yields at μ = 1. It is exact when one moment is zero (the common planar case) and an approximation between —
 * tools/fem/test-fem-dynamics.mjs prints how far it is from the exact surface of a rectangle (computed by clipping the section against a tilted neutral axis).
 *
 *   plasticOf(section, fy) → { ok, Np, Mpy0, Mpz0, at(|N|) → [Mpy(N), Mpz(N)] } | { ok: false, why }     section = { A, Iy, Iz, shape? }, shape = { kind: 'I', d, bf, tw, tf } | { kind: 'rect', b, h }
 *   rectsMoment(rects, fy, N) → M · rectsArea(rects)
 *   gauge(cap, N, My, Mz) → { mu, gy, gz, mpy, mpz }          mu = yield function value (1 = on the surface); (gy, gz) = ∂mu/∂(My, Mz)
 */
const clampN = (n, np) => Math.min(Math.max(n, -np), np);

export function rectsArea(rects) { return rects.reduce((s, r) => s + r.h * r.b, 0); }
function forces(rects, fy, y0) {
  let N = 0, M = 0;
  for (const r of rects) {
    const lo = r.c - r.h / 2, hi = r.c + r.h / 2;
    const a0 = Math.max(lo, y0), la = Math.max(0, hi - a0), b1 = Math.min(hi, y0), lb = Math.max(0, b1 - lo);
    N += fy * r.b * (la - lb); M += fy * r.b * (la * (a0 + hi) / 2 - lb * (lo + b1) / 2);
  }
  return { N, M };
}
/** Fully plastic moment of rectangles (each { c: centre height, h: height, b: width }) under the axial force N (tension +), N·mm. */
export function rectsMoment(rects, fy, N) {
  const lo = Math.min(...rects.map((r) => r.c - r.h / 2)), hi = Math.max(...rects.map((r) => r.c + r.h / 2)), Np = fy * rectsArea(rects);
  const n = clampN(Math.abs(N), Np);
  let a = lo, b = hi;
  for (let k = 0; k < 80; k++) { const m = (a + b) / 2; if (forces(rects, fy, m).N > n) a = m; else b = m; }       // N(y0) falls as y0 rises
  return Math.abs(forces(rects, fy, (a + b) / 2).M);
}
function rectsFor(shape, axis) {                                                                  // axis 'strong' | 'weak'
  if (shape.kind === 'I') {
    const { d, bf, tw, tf } = shape;
    if (axis === 'strong') return [{ c: (d - tf) / 2, h: tf, b: bf }, { c: -(d - tf) / 2, h: tf, b: bf }, { c: 0, h: d - 2 * tf, b: tw }];
    return [{ c: 0, h: bf, b: tf }, { c: 0, h: bf, b: tf }, { c: 0, h: tw, b: d - 2 * tf }].map((r, i) => (i < 2 ? { ...r, b: tf } : r));
  }
  if (shape.kind === 'rect') return axis === 'strong' ? [{ c: 0, h: Math.max(shape.b, shape.h), b: Math.min(shape.b, shape.h) }] : [{ c: 0, h: Math.min(shape.b, shape.h), b: Math.max(shape.b, shape.h) }];
  return null;
}
// the weak-axis flange pair is two rectangles side by side along the bending direction: they overlap in c = 0, so merge them as ONE of width 2 tf
function weakFix(shape) {
  if (shape.kind !== 'I') return null;
  const { d, bf, tw, tf } = shape;
  return [{ c: 0, h: bf, b: 2 * tf }, { c: 0, h: tw, b: d - 2 * tf }];
}

export function plasticOf(section, fy) {
  const shape = section?.shape;
  if (!shape || !(fy > 0)) return { ok: false, why: shape ? 'no-fy' : 'no-shape' };
  const ok = (shape.kind === 'I' && shape.d > 2 * shape.tf && shape.bf > 0 && shape.tw > 0 && shape.tf > 0) || (shape.kind === 'rect' && shape.b > 0 && shape.h > 0);
  if (!ok) return { ok: false, why: 'bad-shape' };
  const strong = rectsFor(shape, 'strong'), weak = shape.kind === 'I' ? weakFix(shape) : rectsFor(shape, 'weak');
  const yStrong = !(section.Iz > section.Iy);                                                      // bending about y is the strong axis unless Iz is larger
  const ry = yStrong ? strong : weak, rz = yStrong ? weak : strong;
  const A = rectsArea(ry), Np = fy * A, K = 257;
  const ty = new Float64Array(K), tz = new Float64Array(K);
  for (let i = 0; i < K; i++) { const N = Np * i / (K - 1); ty[i] = rectsMoment(ry, fy, N); tz[i] = rectsMoment(rz, fy, N); }
  const at = (aN) => {
    const x = Math.min(Math.abs(aN) / Np, 1) * (K - 1), i = Math.min(K - 2, Math.floor(x)), w = x - i;
    return [Math.max(ty[i] + w * (ty[i + 1] - ty[i]), 1e-4 * ty[0]), Math.max(tz[i] + w * (tz[i + 1] - tz[i]), 1e-4 * tz[0])];
  };
  return { ok: true, Np, A, Mpy0: ty[0], Mpz0: tz[0], at, fy, strongIsY: yStrong };
}

export function gauge(cap, N, My, Mz) {
  const [a, b] = cap.at(N), ey = My / a, ez = Mz / b, mu = Math.hypot(ey, ez);
  if (mu < 1e-14) return { mu, gy: 0, gz: 0, mpy: a, mpz: b };
  return { mu, gy: ey / (a * mu), gz: ez / (b * mu), mpy: a, mpz: b };
}

/** Exact fully plastic moment pair of a rectangle b × h for a tilted neutral axis, for checking the biaxial approximation: returns { My, Mz, N } for angle θ (of the axis normal) and offset c. */
export function rectBiaxial(b, h, fy, theta, c) {
  const nx = Math.cos(theta), ny = Math.sin(theta);                                                // stress +fy where nx·z + ny·y > c (y: depth axis, z: width axis)
  let poly = [[-b / 2, -h / 2], [b / 2, -h / 2], [b / 2, h / 2], [-b / 2, h / 2]];
  const clip = (P, sgn) => {
    const out = [], f = (p) => sgn * (nx * p[0] + ny * p[1] - c);
    for (let i = 0; i < P.length; i++) {
      const p = P[i], q = P[(i + 1) % P.length], fp = f(p), fq = f(q);
      if (fp >= 0) out.push(p);
      if ((fp >= 0) !== (fq >= 0)) { const t = fp / (fp - fq); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
    }
    return out;
  };
  const prop = (P) => { let A = 0, sz = 0, sy = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length], cr = p[0] * q[1] - q[0] * p[1]; A += cr / 2; sz += (p[0] + q[0]) * cr / 6; sy += (p[1] + q[1]) * cr / 6; } return { A: Math.abs(A), sz: Math.sign(A) * sz, sy: Math.sign(A) * sy }; };
  const up = prop(clip(poly, 1)), dn = prop(clip(poly, -1));
  return { N: fy * (up.A - dn.A), My: fy * (up.sy - dn.sy), Mz: fy * (up.sz - dn.sz) };
}

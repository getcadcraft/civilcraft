/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geom.js — the surfaces and curves cc-acis draws, as maps between 3D and their own (u, v) (docs/ACIS-READER.md § 6).
 * No DOM, no imports. Our own parameterisations (for display only; they need not be ACIS's).
 *
 *   surfaceOf(s, sign) → Surf | null   { eval(u, v), inv(p, near?), normal(u, v) (outward, the surface's natural side),
 *                                        periodicU, periodicV (0 or 2π), poles: [vLow, vHigh] | null (sphere, cone apex),
 *                                        curved, scaleU, scaleV (length per unit of u / v), domain [u0, u1, v0, v1] }
 *   bsEval(bs, t) · bsSurfEval(bs, u, v) → [x, y, z]     de Boor in homogeneous coordinates
 */

export const TAU = Math.PI * 2;
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a) => Math.hypot(a[0], a[1], a[2]);
export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const unit = (a) => { const l = len(a); return l > 1e-300 ? [a[0] / l, a[1] / l, a[2] / l] : null; };
/** a unit vector at right angles to n */
export function perp(n) {
  const a = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  return unit(cross(n, a));
}
/** u (unit or null) made at right angles to n, else any perpendicular */
function ortho(n, u) {
  if (u) { const w = unit(sub(u, mul(n, dot(u, n)))); if (w) return w; }
  return perp(n);
}

export function surfaceOf(s, sign = 1) {
  if (!s) return null;
  switch (s.type) {
    case 'plane': {
      const N = unit(s.normal);
      if (!N) return null;
      const U = ortho(N, s.udir && unit(s.udir)), V = cross(N, U), O = s.root;
      return {
        type: 'plane', curved: false, periodicU: 0, periodicV: 0, poles: null, scaleU: 1, scaleV: 1,
        eval: (u, v) => [O[0] + U[0] * u + V[0] * v, O[1] + U[1] * u + V[1] * v, O[2] + U[2] * u + V[2] * v],
        inv: (p) => { const d = sub(p, O); return [dot(d, U), dot(d, V)]; },
        normal: () => N,
      };
    }
    case 'cone': {
      // base ellipse: centre C, axis N, major axis M (|M| = R), minor = ratio·R along N × M; the radius grows by
      // tan(angle) per unit along the axis — with `sign` = ±1 because the angle's sign convention is a spec gap (§ 6.3)
      const N = unit(s.normal), R = len(s.major);
      if (!N || !(R > 1e-300) || !(Math.abs(s.ratio) > 1e-12)) return null;
      const X = ortho(N, unit(s.major)), Y = cross(N, X), C = s.centre, Rm = R * s.ratio;
      if (!(Math.abs(s.cos) > 1e-12)) return null;
      const t = sign * s.sin / s.cos;
      const k = (h) => 1 + (h * t) / R;
      const cyl = Math.abs(t) < 1e-12;
      const apex = cyl ? null : -R / t;
      return {
        type: 'cone', curved: true, periodicU: TAU, periodicV: 0, scaleU: R, scaleV: 1,
        poles: cyl ? null : (apex < 0 ? [apex, null] : [null, apex]),
        eval: (u, h) => { const q = k(h), c = Math.cos(u) * R * q, d = Math.sin(u) * Rm * q; return [C[0] + X[0] * c + Y[0] * d + N[0] * h, C[1] + X[1] * c + Y[1] * d + N[1] * h, C[2] + X[2] * c + Y[2] * d + N[2] * h]; },
        inv: (p) => { const d = sub(p, C), h = dot(d, N); return [Math.atan2(dot(d, Y) / Rm, dot(d, X) / R), h]; },
        // outward: away from the axis
        normal: (u, h) => {
          const q = k(h);
          const Pu = add(mul(X, -Math.sin(u) * R * q), mul(Y, Math.cos(u) * Rm * q));
          const Ph = add(N, mul(add(mul(X, Math.cos(u) * R), mul(Y, Math.sin(u) * Rm)), t / R));
          let n = unit(cross(Pu, Ph));
          if (!n) return N;
          const radial = add(mul(X, Math.cos(u)), mul(Y, Math.sin(u)));
          if (dot(n, radial) * Math.sign(q || 1) < 0) n = mul(n, -1);
          return n;
        },
        radiusAt: (h) => R * Math.abs(k(h)),
      };
    }
    case 'sphere': {
      const r = Math.abs(s.radius);
      if (!(r > 1e-300)) return null;
      const Z = unit(s.pole || [0, 0, 1]) || [0, 0, 1];
      const X = ortho(Z, s.origin && unit(s.origin)), Y = cross(Z, X), C = s.centre;
      const inside = s.radius < 0 ? -1 : 1;
      return {
        type: 'sphere', curved: true, periodicU: TAU, periodicV: 0, scaleU: r, scaleV: r, poles: [-Math.PI / 2, Math.PI / 2],
        eval: (u, v) => { const cv = Math.cos(v) * r, a = Math.cos(u) * cv, b = Math.sin(u) * cv, z = Math.sin(v) * r; return [C[0] + X[0] * a + Y[0] * b + Z[0] * z, C[1] + X[1] * a + Y[1] * b + Z[1] * z, C[2] + X[2] * a + Y[2] * b + Z[2] * z]; },
        inv: (p) => { const d = sub(p, C), x = dot(d, X), y = dot(d, Y), z = dot(d, Z); return [Math.atan2(y, x), Math.atan2(z, Math.hypot(x, y))]; },
        normal: (u, v) => mul(add(add(mul(X, Math.cos(u) * Math.cos(v)), mul(Y, Math.sin(u) * Math.cos(v))), mul(Z, Math.sin(v))), inside),
        atPole: (p) => { const d = sub(p, C); return Math.hypot(dot(d, X), dot(d, Y)) < r * 1e-9; },
      };
    }
    case 'torus': {
      const N = unit(s.normal), A = Math.abs(s.major), B = Math.abs(s.minor);
      if (!N || !(B > 1e-300)) return null;
      const X = ortho(N, s.origin && unit(s.origin)), Y = cross(N, X), C = s.centre;
      const inside = s.minor < 0 ? -1 : 1;
      return {
        type: 'torus', curved: true, periodicU: TAU, periodicV: TAU, scaleU: A + B, scaleV: B, poles: null,
        eval: (u, v) => { const w = A + B * Math.cos(v), a = Math.cos(u) * w, b = Math.sin(u) * w, z = B * Math.sin(v); return [C[0] + X[0] * a + Y[0] * b + N[0] * z, C[1] + X[1] * a + Y[1] * b + N[1] * z, C[2] + X[2] * a + Y[2] * b + N[2] * z]; },
        inv: (p) => { const d = sub(p, C), x = dot(d, X), y = dot(d, Y), z = dot(d, N), q = Math.hypot(x, y); return [Math.atan2(y, x), Math.atan2(z, q - A)]; },
        normal: (u, v) => mul(add(add(mul(X, Math.cos(u) * Math.cos(v)), mul(Y, Math.sin(u) * Math.cos(v))), mul(N, Math.sin(v))), inside),
      };
    }
    case 'spline': {
      const bs = s.bs;
      if (!bs || bs.degV === undefined) return null;
      const u0 = bs.knotsU[bs.degU], u1 = bs.knotsU[bs.knotsU.length - 1 - bs.degU];
      const v0 = bs.knotsV[bs.degV], v1 = bs.knotsV[bs.knotsV.length - 1 - bs.degV];
      if (!(u1 > u0) || !(v1 > v0)) return null;
      const ev = (u, v) => bsSurfEval(bs, Math.min(u1, Math.max(u0, u)), Math.min(v1, Math.max(v0, v)));
      // a sample grid for the first guess of the inverse and for the size
      const G = 24, grid = [];
      let size = 0;
      for (let i = 0; i <= G; i++) for (let j = 0; j <= G; j++) {
        const u = u0 + ((u1 - u0) * i) / G, v = v0 + ((v1 - v0) * j) / G;
        grid.push([u, v, ev(u, v)]);
      }
      for (const g of grid) size = Math.max(size, dist(g[2], grid[0][2]));
      const du = (u1 - u0) * 1e-6, dv = (v1 - v0) * 1e-6;
      const partials = (u, v) => [mul(sub(ev(u + du, v), ev(u - du, v)), 1 / (2 * du)), mul(sub(ev(u, v + dv), ev(u, v - dv)), 1 / (2 * dv))];
      const nrm = (u, v) => { const [a, b] = partials(u, v); return unit(cross(a, b)) || [0, 0, 1]; };
      const lenU = Math.max(1e-12, dist(ev(u0, (v0 + v1) / 2), ev(u1, (v0 + v1) / 2))) / (u1 - u0);
      const lenV = Math.max(1e-12, dist(ev((u0 + u1) / 2, v0), ev((u0 + u1) / 2, v1))) / (v1 - v0);
      return {
        type: 'spline', curved: true, periodicU: 0, periodicV: 0, poles: null, scaleU: lenU, scaleV: lenV, domain: [u0, u1, v0, v1], size,
        eval: ev,
        inv: (p) => {
          let best = grid[0], bd = Infinity;
          for (const g of grid) { const d = dist(g[2], p); if (d < bd) { bd = d; best = g; } }
          let u = best[0], v = best[1];
          // Newton on the distance (Gauss–Newton with the partials)
          for (let it = 0; it < 30; it++) {
            const P = ev(u, v), [a, b] = partials(u, v), r = sub(p, P);
            const aa = dot(a, a), ab = dot(a, b), bb = dot(b, b), ra = dot(r, a), rb = dot(r, b);
            const det = aa * bb - ab * ab;
            if (!(Math.abs(det) > 1e-300)) break;
            const su = (ra * bb - rb * ab) / det, sv = (rb * aa - ra * ab) / det;
            u = Math.min(u1, Math.max(u0, u + su)); v = Math.min(v1, Math.max(v0, v + sv));
            if (Math.abs(su) < (u1 - u0) * 1e-12 && Math.abs(sv) < (v1 - v0) * 1e-12) break;
          }
          return [u, v];
        },
        normal: (u, v) => { const n = nrm(u, v); return s.reversed ? mul(n, -1) : n; },
      };
    }
    default: return null;
  }
}

/** knot span index for t (clamped vector, degree p, n control points) */
function span(U, p, n, t) {
  if (t >= U[n]) return n - 1;
  if (t <= U[p]) return p;
  let lo = p, hi = n;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (t < U[m]) hi = m; else lo = m; }
  return lo;
}
/** de Boor (Piegl–Tiller A2.1 / A4.1) on homogeneous points [x w, y w, z w, w] */
function deBoor(U, p, P, k, t) {
  const d = [];
  for (let j = 0; j <= p; j++) { const q = P[k - p + j]; d.push([q[0] * q[3], q[1] * q[3], q[2] * q[3], q[3]]); }
  for (let r = 1; r <= p; r++) {
    for (let j = p; j >= r; j--) {
      const i = k - p + j, den = U[i + p - r + 1] - U[i];
      const a = den > 0 ? (t - U[i]) / den : 0;
      const x = d[j - 1], y = d[j];
      d[j] = [(1 - a) * x[0] + a * y[0], (1 - a) * x[1] + a * y[1], (1 - a) * x[2] + a * y[2], (1 - a) * x[3] + a * y[3]];
    }
  }
  return d[p];
}
export function bsEval(bs, t) {
  const n = bs.nu, p = bs.degU, U = bs.knotsU;
  const h = deBoor(U, p, bs.ctrl, span(U, p, n, t), t);
  const w = h[3] || 1;
  return [h[0] / w, h[1] / w, h[2] / w];
}
export function bsSurfEval(bs, u, v) {
  const { nu, nv, degU: p, degV: q, knotsU: U, knotsV: V } = bs;
  const ku = span(U, p, nu, u), kv = span(V, q, nv, v);
  // first along v for each of the p + 1 rows that matter, then along u
  const rows = [];
  for (let i = ku - p; i <= ku; i++) {
    const row = bs.ctrl.slice(i * nv, i * nv + nv);
    const h = deBoor(V, q, row, kv, v);
    rows[i] = [h[0] / (h[3] || 1), h[1] / (h[3] || 1), h[2] / (h[3] || 1), h[3]];
  }
  const h = deBoor(U, p, rows, ku, u);
  const w = h[3] || 1;
  return [h[0] / w, h[1] / w, h[2] / w];
}
/** the B-spline surface with its control points read the other way round (v-major), for the order check (§ 4) */
export function bsTransposed(bs) {
  const ctrl = new Array(bs.nu * bs.nv);
  // the file's list has nu·nv points; read as nv rows of nu: point (i, j) of the u-major view is file[j·nu + i]
  for (let i = 0; i < bs.nu; i++) for (let j = 0; j < bs.nv; j++) ctrl[i * bs.nv + j] = bs.ctrl[j * bs.nu + i];
  return { ...bs, ctrl };
}

/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geometry.js — the meridian of a dome and what follows from it by plain geometry (0.11 DOME.1). Host-free; millimetres.
 *
 * A dome here is a surface of revolution about a vertical axis. Its meridian (the curve you see in a section through the axis) is one of:
 *   sphere   a spherical segment: base radius a, rise H ≤ a (H = a is a hemisphere). Sphere radius R = (a² + H²) / 2H.
 *   ellipse  half an ellipse: horizontal semi-axis a, vertical semi-axis H (H < a oblate, H > a prolate, H = a the same hemisphere).
 * Both are written the same way: point(s) for s from 0 (the base, the springline) to 1 (the crown) gives
 *   { r, z (above the springline), nr, nz (the outward unit normal), phi (the angle between the normal and the axis, radians),
 *     r1 (radius of curvature of the meridian), r2 (the other principal radius: the normal's length to the axis) }.
 * A surface a distance d inside it along the normal (the foam's inner face, the concrete's inner face) has the same normals and the principal
 * radii r1 - d and r2 - d: that is all "parallel surface" means, and it is exact.
 *
 * Closed forms used by the tests (Archimedes; any geometry handbook): a spherical cap of rise H on a base radius a has area π(a² + H²) and
 * volume πH(3a² + H²)/6; half an ellipsoid of revolution has volume (2/3)πa²H.
 */

/** → the meridian of a cleaned dome: { shape, a, H, R (sphere only), phiBase, point(s) }. */
export function meridian(d) {
  const a = d.diameter / 2, H = d.height;
  if (d.shape === 'ellipse') {
    return {
      shape: 'ellipse', a, H, R: null, phiBase: Math.PI / 2,
      point(s) {
        const u = (Math.min(1, Math.max(0, s)) * Math.PI) / 2, cu = Math.cos(u), su = Math.sin(u);
        const n = Math.hypot(H * cu, a * su), nr = (H * cu) / n, nz = (a * su) / n;
        const phi = Math.atan2(nr, nz), k = a * a * nr * nr + H * H * nz * nz;   // nr = sin φ, nz = cos φ
        return { r: a * cu, z: H * su, nr, nz, phi, r1: (a * a * H * H) / Math.pow(k, 1.5), r2: (a * a) / Math.sqrt(k) };
      },
    };
  }
  const R = (a * a + H * H) / (2 * H), phi0 = H >= a ? Math.PI / 2 : Math.asin(Math.min(1, a / R));
  return {
    shape: 'sphere', a, H, R, phiBase: phi0,
    point(s) {
      const phi = phi0 * (1 - Math.min(1, Math.max(0, s))), nr = Math.sin(phi), nz = Math.cos(phi);
      return { r: R * nr, z: R * nz - (R - H), nr, nz, phi, r1: R, r2: R };
    },
  };
}

/** The shell's thickness where the form is at height z above the springline: `shell` at the crown, `shell + thicken` at the base, even in between. */
export const thicknessAt = (d, z) => d.shell + d.thicken * (1 - Math.min(1, Math.max(0, z / d.height)));

/**
 * The curve a distance off(z) inside the form, as n + 1 points [r, z] from the base to the crown (z above the springline). off = a number or a
 * function of the form's height at that point.
 */
export function offsetCurve(m, off, n = 64) {
  const f = typeof off === 'function' ? off : () => off, out = [];
  for (let i = 0; i <= n; i++) { const p = m.point(i / n), o = f(p.z); out.push([Math.max(0, p.r - o * p.nr), p.z - o * p.nz]); }
  out[n][0] = 0;
  return out;
}

export const polyArea2 = (p) => p.reduce((s, q, i) => { const n = p[(i + 1) % p.length]; return s + q[0] * n[1] - n[0] * q[1]; }, 0);   // twice the signed area
/** A closed [r, z] polygon turned about the axis through `angle` radians: its volume (Pappus: area × the way its centroid travels), mm³. */
export function revolvedVolume(profile, angle = 2 * Math.PI) {
  let sum = 0;   // ∫ r dA = (1/6) Σ (r_i + r_j)(r_i z_j − r_j z_i)
  for (let i = 0; i < profile.length; i++) { const p = profile[i], q = profile[(i + 1) % profile.length]; sum += (p[0] + q[0]) * (p[0] * q[1] - q[0] * p[1]); }
  return (Math.abs(sum) / 6) * angle;
}
/** An open [r, z] line turned about the axis: the area of the surface it sweeps (each piece a cone frustum), mm². */
export function revolvedArea(line, angle = 2 * Math.PI) {
  let s = 0;
  for (let i = 1; i < line.length; i++) s += ((line[i][0] + line[i - 1][0]) / 2) * Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);
  return s * angle;
}

/** The part of a closed polygon on one side of the level z = c (keep 'above' or 'below'), by cutting each edge that crosses it. */
export function clipZ(poly, c, keep = 'above') {
  const inside = (p) => (keep === 'above' ? p[1] >= c - 1e-9 : p[1] <= c + 1e-9), out = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length], pi = inside(p), qi = inside(q);
    if (pi) out.push(p);
    if (pi !== qi) { const t = (c - p[1]) / (q[1] - p[1]); out.push([p[0] + t * (q[0] - p[0]), c]); }
  }
  // drop repeated points
  return out.filter((p, i) => { const q = out[(i + out.length - 1) % out.length]; return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-7; });
}

/** Where an [r, z] curve that runs from the base up to the crown is at the level z (its radius there), or 0 above it and the base radius below. */
export function radiusAt(curve, z) {
  if (z <= curve[0][1]) return curve[0][0];
  for (let i = 1; i < curve.length; i++) {
    const p = curve[i - 1], q = curve[i];
    if (z <= q[1]) return q[1] === p[1] ? q[0] : p[0] + ((z - p[1]) / (q[1] - p[1])) * (q[0] - p[0]);
  }
  return 0;
}

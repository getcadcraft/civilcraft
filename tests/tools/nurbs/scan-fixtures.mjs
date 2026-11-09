/* SPDX-License-Identifier: Apache-2.0 */
/**
 * scan-fixtures.mjs — synthetic scans with a known truth for the browser tests of SU.1082 (reverse-nurbs-09, round 2).
 *   roundedBox(A, B, C, r, steps, noise) → { positions, indices }   inner box A x B x C offset by r: flat faces, 12 fillets, 8 sphere corners
 *   roundedVolume(A, B, C, r)                                      the closed-form volume (Steiner)
 *   binaryStl(mesh) → Buffer
 *   roundedCan(R, H, rf, seg, steps, noise) → mesh   (0.9 engineer-09) a can whose top rim is a fillet of radius rf: a TORUS (R - rf, rf) between
 *                                                     the top plane and the side cylinder; the bottom edge stays sharp
 *   roundedCanVolume(R, H, rf)                       its closed-form volume (Pappus for the rim)
 *   varFilletBlock(W, D, H, law, steps, noise) → mesh a W x D x H block whose top front edge (along x) is rounded with radius law(x), every
 *                                                     x-section a circular arc tangent to the front face (y = 0) and the top (z = H)
 * The noise is a seeded generator (the same scan every run).
 */
export function roundedBox(A, B, C, r, steps = 6, nz = 0) {
  let seed = 31; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const noise = () => (nz ? (rnd() - 0.5) * 2 * nz : 0);
  const P = [], I = [], key = new Map(), a = [A / 2, B / 2, C / 2];
  const coords = (ai) => { const l = []; for (let k = steps; k >= 1; k--) l.push(-a[ai] - r * Math.tan(Math.PI / 4 * k / steps)); for (let k = 0; k <= 4; k++) l.push(-a[ai] + 2 * a[ai] * k / 4); for (let k = 1; k <= steps; k++) l.push(a[ai] + r * Math.tan(Math.PI / 4 * k / steps)); return l; };
  const X = [coords(0), coords(1), coords(2)];
  const push = (p) => { const c = p.map((v, i) => Math.max(-a[i], Math.min(a[i], v))), d = p.map((v, i) => v - c[i]), l = Math.hypot(...d) || 1; return c.map((v, i) => v + r * d[i] / l); };
  const V3 = (i, j, k) => { const kk = i + ',' + j + ',' + k; if (!key.has(kk)) { const q = push([X[0][i], X[1][j], X[2][k]]); P.push(q[0] + noise(), q[1] + noise(), q[2] + noise()); key.set(kk, P.length / 3 - 1); } return key.get(kk); };
  const n0 = X[0].length - 1, n1 = X[1].length - 1, n2 = X[2].length - 1;
  const quad = (p00, p10, p11, p01, flip) => { if (flip) I.push(p00, p11, p10, p00, p01, p11); else I.push(p00, p10, p11, p00, p11, p01); };
  for (let i = 0; i < n0; i++) for (let j = 0; j < n1; j++) { quad(V3(i, j, 0), V3(i + 1, j, 0), V3(i + 1, j + 1, 0), V3(i, j + 1, 0), true); quad(V3(i, j, n2), V3(i + 1, j, n2), V3(i + 1, j + 1, n2), V3(i, j + 1, n2), false); }
  for (let i = 0; i < n0; i++) for (let k = 0; k < n2; k++) { quad(V3(i, 0, k), V3(i + 1, 0, k), V3(i + 1, 0, k + 1), V3(i, 0, k + 1), false); quad(V3(i, n1, k), V3(i + 1, n1, k), V3(i + 1, n1, k + 1), V3(i, n1, k + 1), true); }
  for (let j = 0; j < n1; j++) for (let k = 0; k < n2; k++) { quad(V3(0, j, k), V3(0, j + 1, k), V3(0, j + 1, k + 1), V3(0, j, k + 1), true); quad(V3(n0, j, k), V3(n0, j + 1, k), V3(n0, j + 1, k + 1), V3(n0, j, k + 1), false); }
  return { positions: Float64Array.from(P), indices: Uint32Array.from(I) };
}
export const roundedVolume = (A, B, C, r) => A * B * C + 2 * r * (A * B + B * C + C * A) + Math.PI * r * r * (A + B + C) + 4 / 3 * Math.PI * r ** 3;
export function binaryStl(mesh) {
  const nt = mesh.indices.length / 3, b = Buffer.alloc(84 + nt * 50);
  b.write('scan fixture', 0); b.writeUInt32LE(nt, 80);
  for (let t = 0; t < nt; t++) {
    const o = 84 + t * 50; for (let k = 0; k < 3; k++) for (let c = 0; c < 3; c++) b.writeFloatLE(mesh.positions[mesh.indices[t * 3 + k] * 3 + c], o + 12 + k * 12 + c * 4);
  }
  return b;
}

const seeded = (nz, seed0) => { let seed = seed0; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; return () => (nz ? (rnd() - 0.5) * 2 * nz : 0); };
/** A closed surface of revolution about z from a profile [[rho, z], ...] that starts and ends on the axis (rho 0); seg facets round. */
function revolveProfile(prof, seg, noise) {
  const P = [], I = [], ids = prof.map(([rho, z]) => {
    if (rho === 0) { P.push(0, 0, z); return P.length / 3 - 1; }
    return Array.from({ length: seg }, (_, i) => { const a = 2 * Math.PI * i / seg; P.push(rho * Math.cos(a) + noise(), rho * Math.sin(a) + noise(), z + noise()); return P.length / 3 - 1; });
  });
  for (let k = 0; k + 1 < ids.length; k++) {
    const A = ids[k], B = ids[k + 1];
    for (let i = 0; i < seg; i++) {
      const j = (i + 1) % seg;
      if (typeof A === 'number') I.push(A, B[j], B[i]);
      else if (typeof B === 'number') I.push(A[i], A[j], B);
      else I.push(A[i], A[j], B[j], A[i], B[j], B[i]);
    }
  }
  return { positions: Float64Array.from(P), indices: Uint32Array.from(I) };
}
export function roundedCan(R, H, rf, seg = 96, steps = 8, nz = 0) {
  const prof = [[0, 0]]; for (let k = 1; k <= 4; k++) prof.push([R * k / 4, 0]);
  const zs = 8; for (let k = 1; k <= zs; k++) prof.push([R, (H - rf) * k / zs]);
  for (let k = 1; k <= steps; k++) { const a = Math.PI / 2 * k / steps; prof.push([R - rf + rf * Math.cos(a), H - rf + rf * Math.sin(a)]); }
  for (let k = 3; k >= 1; k--) prof.push([(R - rf) * k / 4, H]);
  prof.push([0, H]);
  return revolveProfile(prof, seg, seeded(nz, 53));
}
export const roundedCanVolume = (R, H, rf) => Math.PI * R * R * (H - rf) + Math.PI * (R - rf) ** 2 * rf
  + 2 * Math.PI * ((R - rf) * Math.PI * rf * rf / 4 + rf ** 3 / 3);   // core cylinder + top disc of radius R - rf + the quarter-round ring (Pappus)
export function varFilletBlock(W, D, H, law, steps = 10, nz = 0, nx = 30) {
  const noise = seeded(nz, 71), P = [], I = [];
  const section = (x) => {
    const r = law(x), pts = [];
    for (let k = 0; k <= 4; k++) pts.push([D * k / 4, 0]);                    // bottom, back to front... (y, z), counter-clockwise seen from +x
    for (let k = 1; k <= 4; k++) pts.push([D, H * k / 4]);
    for (let k = 1; k <= 4; k++) pts.push([D - (D - r) * k / 4, H]);
    for (let k = 1; k < steps; k++) { const a = Math.PI / 2 * k / steps; pts.push([r - r * Math.sin(a), H - r + r * Math.cos(a)]); }
    pts.push([0, H - r]);
    for (let k = 1; k < 4; k++) pts.push([0, (H - r) * (1 - k / 4)]);
    return pts.reverse();
  };
  const rows = [];
  for (let i = 0; i <= nx; i++) { const x = W * i / nx; rows.push(section(x).map(([y, z]) => { const edge = i === 0 || i === nx; P.push(x + (edge ? 0 : noise()), y + noise(), z + noise()); return P.length / 3 - 1; })); }
  const n = rows[0].length;
  for (let i = 0; i < nx; i++) for (let k = 0; k < n; k++) { const a = rows[i][k], b = rows[i][(k + 1) % n], c = rows[i + 1][(k + 1) % n], d = rows[i + 1][k]; I.push(a, d, c, a, c, b); }
  for (const [i, flip] of [[0, true], [nx, false]]) {
    let cy = 0, cz = 0; for (const v of rows[i]) { cy += P[v * 3 + 1]; cz += P[v * 3 + 2]; }
    P.push(W * i / nx, cy / n, cz / n); const c = P.length / 3 - 1;
    for (let k = 0; k < n; k++) { const a = rows[i][k], b = rows[i][(k + 1) % n]; if (flip) I.push(c, b, a); else I.push(c, a, b); }
  }
  return { positions: Float64Array.from(P), indices: Uint32Array.from(I) };
}
